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

        Usuario usuario = repository.findByEmail(email).orElseThrow();

        String codigo = String.valueOf(100000000 + new Random().nextInt(900000000));

        usuario.setCodigoRecuperacao(codigo);
        usuario.setCodigoRecuperacaoExpiracao(LocalDateTime.now().plusMinutes(20));

        repository.save(usuario);

        try {
            emailService.enviarEmail(
                    email,
                    "SOLICITAÇÃO DE RECUPERAÇÃO DE SENHA",
                    "SEU CODIGO É " + codigo);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao enviar o e-mail de recuperação.");
        }
    }

}
