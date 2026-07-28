package com.serviceflow.dto;

import com.serviceflow.model.PrioridadeChamado;
import com.serviceflow.model.StatusChamado;

import java.time.LocalDateTime;

public class ChamadoResumoDashboardResponse {

    private Long id;
    private String titulo;
    private StatusChamado status;
    private PrioridadeChamado prioridade;
    private String clienteNome;
    private String tecnicoNome;
    private LocalDateTime dataAbertura;

    public ChamadoResumoDashboardResponse(
            Long id,
            String titulo,
            StatusChamado status,
            PrioridadeChamado prioridade,
            String clienteNome,
            String tecnicoNome,
            LocalDateTime dataAbertura
    ) {
        this.id = id;
        this.titulo = titulo;
        this.status = status;
        this.prioridade = prioridade;
        this.clienteNome = clienteNome;
        this.tecnicoNome = tecnicoNome;
        this.dataAbertura = dataAbertura;
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public StatusChamado getStatus() {
        return status;
    }

    public PrioridadeChamado getPrioridade() {
        return prioridade;
    }

    public String getClienteNome() {
        return clienteNome;
    }

    public String getTecnicoNome() {
        return tecnicoNome;
    }

    public LocalDateTime getDataAbertura() {
        return dataAbertura;
    }
}