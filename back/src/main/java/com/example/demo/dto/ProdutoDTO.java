package com.example.demo.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoDTO {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotBlank(message = "O nome deve ser preenchido.")
    private String nome;

    private String descricao;

    @NotNull(message = "O preco deve ser preenchido.")
    private BigDecimal preco;

    private BigDecimal precoAntigo;

    private Integer descontoPercent;

    private String categoria;

    private String marca;

    private String cor;

    private Integer estoque;

    private String tamanhos;

    private boolean destaque;

    private String imagem;

}
