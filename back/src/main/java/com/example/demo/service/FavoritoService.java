package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.ProdutoDTO;
import com.example.demo.entity.Favorito;
import com.example.demo.repository.FavoritoRepository;
import com.example.demo.repository.ProdutoRepository;

import jakarta.transaction.Transactional;

@Service
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final ProdutoService produtoService;
    private final ProdutoRepository produtoRepository;

    public FavoritoService(FavoritoRepository favoritoRepository, ProdutoService produtoService,
            ProdutoRepository produtoRepository) {
        this.favoritoRepository = favoritoRepository;
        this.produtoService = produtoService;
        this.produtoRepository = produtoRepository;
    }

    public List<ProdutoDTO> listarProdutos(String email) {
        return favoritoRepository.findByUsuarioEmail(email).stream()
                .map(f -> produtoRepository.findById(f.getProdutoId()).orElse(null))
                .filter(p -> p != null && p.isAtivo())
                .map(produtoService::toDto)
                .toList();
    }

    public List<Long> listarIds(String email) {
        return favoritoRepository.findByUsuarioEmail(email).stream()
                .map(Favorito::getProdutoId).toList();
    }

    @Transactional
    public void adicionar(String email, Long produtoId) {
        if (favoritoRepository.findByUsuarioEmailAndProdutoId(email, produtoId).isPresent()) {
            return;
        }
        Favorito f = new Favorito();
        f.setUsuarioEmail(email);
        f.setProdutoId(produtoId);
        favoritoRepository.save(f);
    }

    @Transactional
    public void remover(String email, Long produtoId) {
        favoritoRepository.findByUsuarioEmailAndProdutoId(email, produtoId)
                .ifPresent(f -> favoritoRepository.deleteById(f.getId()));
    }

}
