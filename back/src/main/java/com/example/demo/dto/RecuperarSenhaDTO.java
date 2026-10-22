package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecuperarSenhaDTO {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6, max = 6, message = "O código tem 6 dígitos.")
    private String codigo;

    @NotBlank
    @Size(min = 6, max = 30, message = "A nova senha deve ter ao menos 6 caracteres.")
    private String novaSenha;

}
