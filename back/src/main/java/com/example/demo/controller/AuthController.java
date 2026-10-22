package com.example.demo.controller;

import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.annotations.Public;
import com.example.demo.config.JwtUtil;
import com.example.demo.dto.AuthDTO;
import com.example.demo.dto.RecuperacaoSolicitacaoDTO;
import com.example.demo.dto.RecuperarSenhaDTO;
import com.example.demo.dto.UsuarioDTO;
import com.example.demo.entity.Usuario;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.EmailService;
import com.example.demo.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/login")
    @Public
    public ResponseEntity<?> login(@RequestBody @Valid AuthDTO dto) {
        String email = dto.getEmail();
        String senha = dto.getSenha(); // TEXTO PURO

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isPresent() && passwordEncoder.matches(senha, usuarioOpt.get().getSenha())) {
            Usuario usuario = usuarioOpt.get();
            String nivelAcesso = usuario.getNivelAcesso().toString();

            String token = jwtUtil.generateToken(email, nivelAcesso);

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "tipo", nivelAcesso,
                    "nome", usuario.getNome() == null ? "" : usuario.getNome()));
        }

        return ResponseEntity.status(401).body("Credenciais Inválidas!");
    }

    @Public
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid UsuarioDTO dto) {
        if (usuarioRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "E-mail já cadastrado."));
        }
        dto.setNivelAcesso(NivelAcesso.PADRAO);
        usuarioService.create(dto);

        String token = jwtUtil.generateToken(dto.getEmail(), NivelAcesso.PADRAO.toString());
        return ResponseEntity.ok(Map.of(
                "token", token,
                "tipo", NivelAcesso.PADRAO.toString(),
                "nome", dto.getNome() == null ? "" : dto.getNome()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(usuarioService.buscarPorEmail(email));
    }

    @PutMapping("/me")
    public ResponseEntity<?> atualizarPerfil(@RequestBody UsuarioDTO dto) {
        String emailAtual = SecurityContextHolder.getContext().getAuthentication().getName();
        UsuarioDTO atualizado = usuarioService.atualizarPerfil(emailAtual, dto);

        // se o email mudou, reemite o token (o subject do JWT é o email)
        if (!atualizado.getEmail().equalsIgnoreCase(emailAtual)) {
            String token = jwtUtil.generateToken(atualizado.getEmail(),
                    atualizado.getNivelAcesso().toString());
            return ResponseEntity.ok(Map.of("usuario", atualizado, "token", token));
        }
        return ResponseEntity.ok(Map.of("usuario", atualizado));
    }

    @PutMapping("/me/senha")
    public ResponseEntity<?> alterarMinhaSenha(@RequestBody Map<String, String> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        usuarioService.alterarSenha(email, body.get("senhaAtual"), body.get("novaSenha"));
        return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso!"));
    }

    @GetMapping("/ping")
    @Public
    public void pong() {

    }

    @Public
    @PostMapping("/recuperar-senha/solicitar")
    public ResponseEntity<?> solicitarCodigo(
            @RequestBody @Valid RecuperacaoSolicitacaoDTO dto) {
        usuarioService.solicitarCodigo(dto);
        return ResponseEntity.ok(
                Map.of("message", "E-mail enviado com sucesso!"));

    }

    @Public
    @PostMapping("/recuperar-senha/alterar")
    public ResponseEntity<?> alterarSenha(
            @RequestBody @Valid RecuperarSenhaDTO dto) {

        usuarioService.redefinirSenha(dto.getEmail(), dto.getCodigo(), dto.getNovaSenha());

        return ResponseEntity.ok(
                Map.of("message", "Senha alterada com sucesso!"));
    }

}
