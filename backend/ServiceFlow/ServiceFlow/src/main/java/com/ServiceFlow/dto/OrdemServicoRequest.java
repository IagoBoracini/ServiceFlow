package com.serviceflow.dto;

import jakarta.validation.constraints.NotNull;

public class OrdemServicoRequest {

    @NotNull(message = "O chamado é obrigatório.")
    private Long chamadoId;

    public Long getChamadoId() {
        return chamadoId;
    }

    public void setChamadoId(Long chamadoId) {
        this.chamadoId = chamadoId;
    }
}