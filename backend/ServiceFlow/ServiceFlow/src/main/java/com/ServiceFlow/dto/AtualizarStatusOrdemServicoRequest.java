package com.serviceflow.dto;

import com.serviceflow.model.StatusOrdemServico;
import jakarta.validation.constraints.NotNull;

public class AtualizarStatusOrdemServicoRequest {

    @NotNull(message = "O status é obrigatório.")
    private StatusOrdemServico status;

    public StatusOrdemServico getStatus() {
        return status;
    }

    public void setStatus(StatusOrdemServico status) {
        this.status = status;
    }
}