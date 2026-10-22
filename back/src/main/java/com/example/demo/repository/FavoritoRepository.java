package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Favorito;

@Repository
public interface FavoritoRepository extends BaseRepository<Favorito, Long> {

    @Query("""
            SELECT f FROM Favorito f
            WHERE f.usuarioEmail = :email
            AND f.ativo = TRUE
    """)
    List<Favorito> findByUsuarioEmail(String email);

    @Query("""
            SELECT f FROM Favorito f
            WHERE f.usuarioEmail = :email
            AND f.produtoId = :produtoId
            AND f.ativo = TRUE
    """)
    Optional<Favorito> findByUsuarioEmailAndProdutoId(String email, Long produtoId);

}
