package com.ServiceFlow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AtualizarPerfilRequest {

    @NotBlank(message = "O nome é obrigatório.")
    @Size(
            min = 3,
            max = 120,
            message = "O nome deve possuir entre 3 e 120 caracteres."
    )
    private String nome;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}