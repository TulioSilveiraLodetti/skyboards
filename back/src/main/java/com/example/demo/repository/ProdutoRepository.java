package com.example.demo.repository;

import org.springframework.stereotype.Repository;

import com.example.demo.entity.Produto;

@Repository
public interface ProdutoRepository extends BaseRepository<Produto, Long> {

}
