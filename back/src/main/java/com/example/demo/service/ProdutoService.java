package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.dto.ProdutoDTO;
import com.example.demo.entity.Produto;
import com.example.demo.repository.ProdutoRepository;

@Service
public class ProdutoService extends BaseService<Produto, ProdutoDTO> {

    public ProdutoService(ProdutoRepository repository) {
        super(repository);
    }

}
