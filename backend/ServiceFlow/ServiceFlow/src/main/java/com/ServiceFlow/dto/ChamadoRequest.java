package com.serviceflow.dto;

import com.serviceflow.model.PrioridadeChamado;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChamadoRequest {

    @NotBlank(message = "O título é obrigatório.")
    private String titulo;

    @NotBlank(message = "A descrição é obrigatória.")
    private String descricao;

    @NotNull(message = "A prioridade é obrigatória.")
    private PrioridadeChamado prioridade;

    @NotNull(message = "O cliente é obrigatório.")
    private Long clienteId;

    private Long tecnicoResponsavelId;

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public PrioridadeChamado getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeChamado prioridade) {
        this.prioridade = prioridade;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public Long getTecnicoResponsavelId() {
        return tecnicoResponsavelId;
    }

    public void setTecnicoResponsavelId(
            Long tecnicoResponsavelId
    ) {
        this.tecnicoResponsavelId = tecnicoResponsavelId;
    }
}