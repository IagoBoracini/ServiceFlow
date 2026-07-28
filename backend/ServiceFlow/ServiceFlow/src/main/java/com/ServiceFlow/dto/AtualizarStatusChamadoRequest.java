package com.serviceflow.dto;

import com.serviceflow.model.StatusChamado;
import jakarta.validation.constraints.NotNull;

public class AtualizarStatusChamadoRequest {

    @NotNull(message = "O status é obrigatório.")
    private StatusChamado status;

    public StatusChamado getStatus() {
        return status;
    }

    public void setStatus(StatusChamado status) {
        this.status = status;
    }
}