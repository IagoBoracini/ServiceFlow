package com.serviceflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AtualizarOrdemServicoRequest {

    @NotBlank(message = "O diagnóstico é obrigatório.")
    @Size(
            max = 3000,
            message = "O diagnóstico deve possuir no máximo 3000 caracteres."
    )
    private String diagnostico;

    @NotBlank(message = "O serviço realizado é obrigatório.")
    @Size(
            max = 3000,
            message = "O serviço realizado deve possuir no máximo 3000 caracteres."
    )
    private String servicoRealizado;

    @Size(
            max = 3000,
            message = "As observações devem possuir no máximo 3000 caracteres."
    )
    private String observacoes;

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }

    public String getServicoRealizado() {
        return servicoRealizado;
    }

    public void setServicoRealizado(String servicoRealizado) {
        this.servicoRealizado = servicoRealizado;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}