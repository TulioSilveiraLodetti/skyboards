package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RecuperarSenhaDTO {

    @Email
    @NotBlank
    private String email;
    
    @NotBlank
    @Size(min = 8, max = 8)
    private String codigo;

    @NotBlank
    @Size(min = 8, max = 18)
    private String novaSenha;

}
