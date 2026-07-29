package com.ServiceFlow.dto;

import com.ServiceFlow.model.StatusOrdemServico;

import java.time.LocalDateTime;

public class OrdemServicoResponse {

    private Long id;
    private String numero;
    private StatusOrdemServico status;

    private String diagnostico;
    private String servicoRealizado;
    private String observacoes;

    private LocalDateTime dataCriacao;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFinalizacao;

    private Long chamadoId;
    private String chamadoTitulo;

    private Long clienteId;
    private String clienteNome;

    private Long tecnicoId;
    private String tecnicoNome;

    public OrdemServicoResponse(
            Long id,
            String numero,
            StatusOrdemServico status,
            String diagnostico,
            String servicoRealizado,
            String observacoes,
            LocalDateTime dataCriacao,
            LocalDateTime dataInicio,
            LocalDateTime dataFinalizacao,
            Long chamadoId,
            String chamadoTitulo,
            Long clienteId,
            String clienteNome,
            Long tecnicoId,
            String tecnicoNome
    ) {
        this.id = id;
        this.numero = numero;
        this.status = status;
        this.diagnostico = diagnostico;
        this.servicoRealizado = servicoRealizado;
        this.observacoes = observacoes;
        this.dataCriacao = dataCriacao;
        this.dataInicio = dataInicio;
        this.dataFinalizacao = dataFinalizacao;
        this.chamadoId = chamadoId;
        this.chamadoTitulo = chamadoTitulo;
        this.clienteId = clienteId;
        this.clienteNome = clienteNome;
        this.tecnicoId = tecnicoId;
        this.tecnicoNome = tecnicoNome;
    }

    public Long getId() {
        return id;
    }

    public String getNumero() {
        return numero;
    }

    public StatusOrdemServico getStatus() {
        return status;
    }

    public String getDiagnostico() {
        return diagnostico;
    }

    public String getServicoRealizado() {
        return servicoRealizado;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public LocalDateTime getDataInicio() {
        return dataInicio;
    }

    public LocalDateTime getDataFinalizacao() {
        return dataFinalizacao;
    }

    public Long getChamadoId() {
        return chamadoId;
    }

    public String getChamadoTitulo() {
        return chamadoTitulo;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public String getClienteNome() {
        return clienteNome;
    }

    public Long getTecnicoId() {
        return tecnicoId;
    }

    public String getTecnicoNome() {
        return tecnicoNome;
    }
}