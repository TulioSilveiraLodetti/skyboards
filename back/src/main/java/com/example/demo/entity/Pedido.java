package com.example.demo.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pedido")
@EqualsAndHashCode(callSuper = false)
public class Pedido extends BaseEntity {

    @Column(name = "usuario_email", nullable = false)
    private String usuarioEmail;

    @Column(name = "nome_cliente")
    private String nomeCliente;

    @Column(name = "endereco_entrega", length = 500)
    private String enderecoEntrega;

    @Column(name = "forma_pagamento")
    private String formaPagamento;

    @Column(name = "itens_json", columnDefinition = "TEXT")
    private String itensJson;

    @Column(name = "total", precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "status")
    private String status = "PENDENTE";

}
