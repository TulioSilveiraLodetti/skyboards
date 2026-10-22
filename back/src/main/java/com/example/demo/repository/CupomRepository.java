package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Cupom;

@Repository
public interface CupomRepository extends BaseRepository<Cupom, Long> {

    @Query("""
            SELECT c FROM Cupom c
            WHERE UPPER(c.codigo) = UPPER(:codigo)
            AND c.ativo = TRUE
    """)
    Optional<Cupom> findByCodigo(String codigo);

}
