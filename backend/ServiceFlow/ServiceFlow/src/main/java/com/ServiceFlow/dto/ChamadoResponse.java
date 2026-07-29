package com.ServiceFlow.dto;

import com.ServiceFlow.model.PrioridadeChamado;
import com.ServiceFlow.model.StatusChamado;

import java.time.LocalDateTime;

public class ChamadoResponse {

    private Long id;
    private String titulo;
    private String descricao;
    private PrioridadeChamado prioridade;
    private StatusChamado status;
    private LocalDateTime dataAbertura;
    private LocalDateTime dataConclusao;
    private Long clienteId;
    private String clienteNome;
    private Long tecnicoResponsavelId;
    private String tecnicoResponsavelNome;

    public ChamadoResponse(
            Long id,
            String titulo,
            String descricao,
            PrioridadeChamado prioridade,
            StatusChamado status,
            LocalDateTime dataAbertura,
            LocalDateTime dataConclusao,
            Long clienteId,
            String clienteNome,
            Long tecnicoResponsavelId,
            String tecnicoResponsavelNome
    ) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.prioridade = prioridade;
        this.status = status;
        this.dataAbertura = dataAbertura;
        this.dataConclusao = dataConclusao;
        this.clienteId = clienteId;
        this.clienteNome = clienteNome;
        this.tecnicoResponsavelId = tecnicoResponsavelId;
        this.tecnicoResponsavelNome = tecnicoResponsavelNome;
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public PrioridadeChamado getPrioridade() {
        return prioridade;
    }

    public StatusChamado getStatus() {
        return status;
    }

    public LocalDateTime getDataAbertura() {
        return dataAbertura;
    }

    public LocalDateTime getDataConclusao() {
        return dataConclusao;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public String getClienteNome() {
        return clienteNome;
    }

    public Long getTecnicoResponsavelId() {
        return tecnicoResponsavelId;
    }

    public String getTecnicoResponsavelNome() {
        return tecnicoResponsavelNome;
    }
}