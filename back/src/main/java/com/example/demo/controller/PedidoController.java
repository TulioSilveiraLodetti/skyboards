package com.example.demo.controller;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.annotations.Admin;
import com.example.demo.dto.PedidoDTO;
import com.example.demo.service.PedidoService;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    private String emailAtual() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping
    public PedidoDTO criar(@RequestBody PedidoDTO dto) {
        dto.setUsuarioEmail(emailAtual());
        if (dto.getStatus() == null || dto.getStatus().isBlank()) {
            dto.setStatus("PENDENTE");
        }
        return service.create(dto);
    }

    @GetMapping("/meus")
    public List<PedidoDTO> meusPedidos() {
        return service.readByUsuario(emailAtual());
    }

    @Admin
    @GetMapping
    public List<PedidoDTO> listar() {
        return service.read();
    }

    @Admin
    @PutMapping("/{id}/status")
    public PedidoDTO atualizarStatus(@PathVariable Long id, @RequestParam String status) {
        PedidoDTO dto = service.read(id);
        dto.setStatus(status);
        return service.update(id, dto);
    }

}
