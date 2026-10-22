package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.dto.CupomDTO;
import com.example.demo.entity.Cupom;
import com.example.demo.repository.CupomRepository;

@Service
public class CupomService extends BaseService<Cupom, CupomDTO> {

    public CupomService(CupomRepository repository) {
        super(repository);
    }

}
