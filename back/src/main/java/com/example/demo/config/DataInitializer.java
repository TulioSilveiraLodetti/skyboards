package com.example.demo.config;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.entity.Cupom;
import com.example.demo.entity.Produto;
import com.example.demo.entity.Usuario;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.CupomRepository;
import com.example.demo.repository.ProdutoRepository;
import com.example.demo.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;

    public DataInitializer(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public CommandLineRunner initDatabase(UsuarioRepository usuarioRepository,
            ProdutoRepository produtoRepository, CupomRepository cupomRepository) {
        return args -> {
            criarUsuario(usuarioRepository, "Administrador", "admin@skyboards.com", "admin123", NivelAcesso.ADMIN);
            criarUsuario(usuarioRepository, "Tulio", "tulio@skyboards.com", "tulio123", NivelAcesso.ADMIN);
            criarUsuario(usuarioRepository, "Cliente Demo", "cliente@skyboards.com", "cliente123", NivelAcesso.PADRAO);

            if (produtoRepository.count() == 0) {
                carregarProdutos(produtoRepository);
            }

            criarCupom(cupomRepository, "BEMVINDO15", 15, "15% OFF na primeira compra");
            criarCupom(cupomRepository, "SKATE10", 10, "10% OFF em toda a loja");
            criarCupom(cupomRepository, "SKYBOARDS20", 20, "20% OFF acima de R$500");
        };
    }

    private void criarUsuario(UsuarioRepository repo, String nome, String email, String senha, NivelAcesso nivel) {
        if (repo.findByEmail(email).isEmpty()) {
            Usuario u = new Usuario();
            u.setNome(nome);
            u.setEmail(email);
            u.setSenha(passwordEncoder.encode(senha));
            u.setNivelAcesso(nivel);
            repo.save(u);
        }
    }

    private void criarCupom(CupomRepository repo, String codigo, int percentual, String descricao) {
        if (repo.findByCodigo(codigo).isEmpty()) {
            Cupom c = new Cupom();
            c.setCodigo(codigo);
            c.setPercentual(percentual);
            c.setDescricao(descricao);
            repo.save(c);
        }
    }

    @SuppressWarnings("unchecked")
    private void carregarProdutos(ProdutoRepository repo) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = new ClassPathResource("seed/products.json").getInputStream();
            List<Map<String, Object>> lista = mapper.readValue(is, List.class);
            for (Map<String, Object> m : lista) {
                Produto p = new Produto();
                p.setNome((String) m.get("nome"));
                p.setDescricao((String) m.get("descricao"));
                p.setPreco(toBig(m.get("preco")));
                p.setPrecoAntigo(toBig(m.get("precoAntigo")));
                p.setDescontoPercent(m.get("descontoPercent") == null ? null
                        : ((Number) m.get("descontoPercent")).intValue());
                p.setCategoria((String) m.get("categoria"));
                p.setMarca((String) m.get("marca"));
                p.setCor((String) m.get("cor"));
                p.setEstoque(m.get("estoque") == null ? 0 : ((Number) m.get("estoque")).intValue());
                p.setTamanhos((String) m.get("tamanhos"));
                p.setDestaque(Boolean.TRUE.equals(m.get("destaque")));
                p.setImagem((String) m.get("imagem"));
                repo.save(p);
            }
            System.out.println("Produtos Skyboards carregados: " + lista.size());
        } catch (Exception e) {
            System.err.println("Falha ao carregar produtos: " + e.getMessage());
        }
    }

    private BigDecimal toBig(Object o) {
        if (o == null) return null;
        return new BigDecimal(o.toString());
    }
}
