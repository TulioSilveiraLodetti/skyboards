package com.example.demo.entity;

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
@Table(name = "favorito")
@EqualsAndHashCode(callSuper = false)
public class Favorito extends BaseEntity {

    @Column(name = "usuario_email", nullable = false)
    private String usuarioEmail;

    @Column(name = "produto_id", nullable = false)
    private Long produtoId;

}
