package com.ServiceFlow.dto;

import com.ServiceFlow.model.PrioridadeChamado;
import jakarta.validation.constraints.NotNull;

public class AtualizarPrioridadeChamadoRequest {

    @NotNull(message = "A prioridade é obrigatória.")
    private PrioridadeChamado prioridade;

    public PrioridadeChamado getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeChamado prioridade) {
        this.prioridade = prioridade;
    }
}