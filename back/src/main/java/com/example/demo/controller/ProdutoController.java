package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.annotations.Admin;
import com.example.demo.annotations.Public;
import com.example.demo.dto.ProdutoDTO;
import com.example.demo.service.ProdutoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoService service;

    public ProdutoController(ProdutoService service) {
        this.service = service;
    }

    @Public
    @GetMapping
    public List<ProdutoDTO> listar(
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) Boolean destaque) {

        return service.read().stream()
                .filter(p -> categoria == null || categoria.isBlank()
                        || categoria.equalsIgnoreCase(p.getCategoria()))
                .filter(p -> destaque == null || destaque.equals(p.isDestaque()))
                .filter(p -> busca == null || busca.isBlank()
                        || (p.getNome() != null && p.getNome().toLowerCase().contains(busca.toLowerCase()))
                        || (p.getMarca() != null && p.getMarca().toLowerCase().contains(busca.toLowerCase())))
                .toList();
    }

    @Public
    @GetMapping("/{id}")
    public ProdutoDTO buscar(@PathVariable Long id) {
        return service.read(id);
    }

    @Admin
    @PostMapping
    public ProdutoDTO criar(@RequestBody @Valid ProdutoDTO dto) {
        return service.create(dto);
    }

    @Admin
    @PutMapping("/{id}")
    public ProdutoDTO atualizar(@PathVariable Long id, @RequestBody @Valid ProdutoDTO dto) {
        return service.update(id, dto);
    }

    @Admin
    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        service.softDelete(id);
    }

}
