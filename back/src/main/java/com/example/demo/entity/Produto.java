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
@Table(name = "produto")
@EqualsAndHashCode(callSuper = false)
public class Produto extends BaseEntity {

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "descricao", length = 2000)
    private String descricao;

    @Column(name = "preco", nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(name = "preco_antigo", precision = 10, scale = 2)
    private BigDecimal precoAntigo;

    @Column(name = "desconto_percent")
    private Integer descontoPercent;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "marca")
    private String marca;

    @Column(name = "cor")
    private String cor;

    @Column(name = "estoque")
    private Integer estoque = 0;

    @Column(name = "tamanhos")
    private String tamanhos;

    @Column(name = "destaque")
    private boolean destaque = false;

    @Column(name = "imagem", length = 1000)
    private String imagem;

}
