package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Pedido;

@Repository
public interface PedidoRepository extends BaseRepository<Pedido, Long> {

    @Query("""
            SELECT p FROM Pedido p
            WHERE p.usuarioEmail = :email
            AND p.ativo = TRUE
            ORDER BY p.createdAt DESC
    """)
    List<Pedido> findByUsuarioEmail(String email);

}
