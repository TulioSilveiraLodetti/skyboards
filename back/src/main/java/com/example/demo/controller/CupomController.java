package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.annotations.Admin;
import com.example.demo.annotations.Public;
import com.example.demo.dto.CupomDTO;
import com.example.demo.repository.CupomRepository;
import com.example.demo.service.CupomService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/cupons")
public class CupomController {

    private final CupomService service;
    private final CupomRepository repository;

    public CupomController(CupomService service, CupomRepository repository) {
        this.service = service;
        this.repository = repository;
    }

    @Public
    @GetMapping("/validar/{codigo}")
    public ResponseEntity<?> validar(@PathVariable String codigo) {
        return repository.findByCodigo(codigo)
                .map(c -> ResponseEntity.ok(Map.of(
                        "codigo", c.getCodigo(),
                        "percentual", c.getPercentual(),
                        "descricao", c.getDescricao() == null ? "" : c.getDescricao())))
                .orElse(ResponseEntity.status(404).body(Map.of("message", "Cupom inválido.")));
    }

    @Admin
    @GetMapping
    public List<CupomDTO> listar() {
        return service.read();
    }

    @Admin
    @PostMapping
    public CupomDTO criar(@RequestBody @Valid CupomDTO dto) {
        return service.create(dto);
    }

    @Admin
    @PutMapping("/{id}")
    public CupomDTO atualizar(@PathVariable Long id, @RequestBody @Valid CupomDTO dto) {
        return service.update(id, dto);
    }

    @Admin
    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        service.softDelete(id);
    }

}
