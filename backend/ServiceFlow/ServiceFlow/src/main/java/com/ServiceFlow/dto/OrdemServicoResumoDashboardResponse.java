package com.ServiceFlow.dto;

import com.ServiceFlow.model.StatusOrdemServico;

import java.time.LocalDateTime;

public class OrdemServicoResumoDashboardResponse {

    private Long id;
    private String numero;
    private StatusOrdemServico status;
    private String chamadoTitulo;
    private String clienteNome;
    private String tecnicoNome;
    private LocalDateTime dataCriacao;

    public OrdemServicoResumoDashboardResponse(
            Long id,
            String numero,
            StatusOrdemServico status,
            String chamadoTitulo,
            String clienteNome,
            String tecnicoNome,
            LocalDateTime dataCriacao
    ) {
        this.id = id;
        this.numero = numero;
        this.status = status;
        this.chamadoTitulo = chamadoTitulo;
        this.clienteNome = clienteNome;
        this.tecnicoNome = tecnicoNome;
        this.dataCriacao = dataCriacao;
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

    public String getChamadoTitulo() {
        return chamadoTitulo;
    }

    public String getClienteNome() {
        return clienteNome;
    }

    public String getTecnicoNome() {
        return tecnicoNome;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }
}