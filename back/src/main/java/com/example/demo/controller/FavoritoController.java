package com.example.demo.controller;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ProdutoDTO;
import com.example.demo.service.FavoritoService;

@RestController
@RequestMapping("/favoritos")
public class FavoritoController {

    private final FavoritoService service;

    public FavoritoController(FavoritoService service) {
        this.service = service;
    }

    private String emailAtual() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/meus")
    public List<ProdutoDTO> meus() {
        return service.listarProdutos(emailAtual());
    }

    @GetMapping("/ids")
    public List<Long> ids() {
        return service.listarIds(emailAtual());
    }

    @PostMapping("/{produtoId}")
    public void adicionar(@PathVariable Long produtoId) {
        service.adicionar(emailAtual(), produtoId);
    }

    @DeleteMapping("/{produtoId}")
    public void remover(@PathVariable Long produtoId) {
        service.remover(emailAtual(), produtoId);
    }

}
