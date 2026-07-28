package com.serviceflow.dto;

import jakarta.validation.constraints.NotNull;

public class AtribuirTecnicoRequest {

    @NotNull(message = "O técnico é obrigatório.")
    private Long tecnicoId;

    public Long getTecnicoId() {
        return tecnicoId;
    }

    public void setTecnicoId(Long tecnicoId) {
        this.tecnicoId = tecnicoId;
    }
}