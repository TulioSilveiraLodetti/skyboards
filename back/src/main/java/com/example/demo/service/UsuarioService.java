package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.RecuperacaoSolicitacaoDTO;
import com.example.demo.dto.UsuarioDTO;
import com.example.demo.entity.Usuario;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class UsuarioService extends BaseService<Usuario, UsuarioDTO> {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        super(repository);
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UsuarioDTO create(UsuarioDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setTelefone(dto.getTelefone());
        usuario.setEndereco(dto.getEndereco());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setNivelAcesso(dto.getNivelAcesso() != null ? dto.getNivelAcesso() : NivelAcesso.PADRAO);
        return toDto(repository.save(usuario));
    }

    public UsuarioDTO buscarPorEmail(String email) {
        return toDto(repository.findByEmail(email).orElseThrow());
    }

    @Transactional
    public UsuarioDTO atualizarPerfil(String email, UsuarioDTO dto) {
        Usuario usuario = repository.findByEmail(email).orElseThrow();
        if (dto.getNome() != null) usuario.setNome(dto.getNome());
        if (dto.getTelefone() != null) usuario.setTelefone(dto.getTelefone());
        if (dto.getEndereco() != null) usuario.setEndereco(dto.getEndereco());

        // troca de email (opcional)
        if (dto.getEmail() != null && !dto.getEmail().isBlank()
                && !dto.getEmail().equalsIgnoreCase(usuario.getEmail())) {
            repository.findByEmail(dto.getEmail()).ifPresent(outro -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já está em uso.");
            });
            usuario.setEmail(dto.getEmail());
        }
        return toDto(repository.save(usuario));
    }

    @Transactional
    public void alterarSenha(String email, String senhaAtual, String novaSenha) {
        Usuario usuario = repository.findByEmail(email).orElseThrow();
        if (!passwordEncoder.matches(senhaAtual, usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha atual incorreta.");
        }
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        repository.save(usuario);
    }

    @Transactional
    public void solicitarCodigo(RecuperacaoSolicitacaoDTO dto) {
        String email = dto.getEmail();

        Usuario usuario = repository.findByEmail(email).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "E-mail não cadastrado."));

        String codigo = String.valueOf(100000 + new Random().nextInt(900000)); // 6 dígitos

        usuario.setCodigoRecuperacao(codigo);
        usuario.setCodigoRecuperacaoExpiracao(LocalDateTime.now().plusMinutes(20));

        repository.save(usuario);

        String corpo = "<div style=\"font-family:Arial,sans-serif;background:#0a0a0b;color:#f4f4f0;padding:24px;border-radius:12px\">"
                + "<h2 style=\"color:#d7ff3e\">SkyBoard's · Recuperação de senha</h2>"
                + "<p>Olá" + (usuario.getNome() != null ? ", " + usuario.getNome() : "") + "!</p>"
                + "<p>Use o código abaixo para redefinir sua senha. Ele expira em 20 minutos.</p>"
                + "<p style=\"font-size:32px;font-weight:bold;letter-spacing:8px;color:#d7ff3e\">" + codigo + "</p>"
                + "<p style=\"color:#888\">Se você não solicitou, ignore este e-mail.</p></div>";

        try {
            emailService.enviarEmail(email, "SkyBoard's · Código de recuperação de senha", corpo);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao enviar o e-mail de recuperação.");
        }
    }

    @Transactional
    public void redefinirSenha(String email, String codigo, String novaSenha) {
        Usuario usuario = repository.findByEmail(email).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "E-mail não cadastrado."));

        if (usuario.getCodigoRecuperacao() == null
                || !usuario.getCodigoRecuperacao().equals(codigo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código inválido.");
        }
        if (usuario.getCodigoRecuperacaoExpiracao() == null
                || usuario.getCodigoRecuperacaoExpiracao().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código expirado. Solicite um novo.");
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuario.setCodigoRecuperacao(null);
        usuario.setCodigoRecuperacaoExpiracao(null);
        repository.save(usuario);
    }

}
