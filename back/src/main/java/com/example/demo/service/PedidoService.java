package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.dto.PedidoDTO;
import com.example.demo.entity.Pedido;
import com.example.demo.repository.PedidoRepository;

@Service
public class PedidoService extends BaseService<Pedido, PedidoDTO> {

    private final PedidoRepository repository;

    public PedidoService(PedidoRepository repository) {
        super(repository);
        this.repository = repository;
    }

    public java.util.List<PedidoDTO> readByUsuario(String email) {
        return repository.findByUsuarioEmail(email).stream().map(this::toDto).toList();
    }

}
