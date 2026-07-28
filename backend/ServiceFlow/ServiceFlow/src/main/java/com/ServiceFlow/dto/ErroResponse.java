package com.serviceflow.dto;

import java.time.LocalDateTime;

public class ErroResponse {

    private int status;
    private String erro;
    private String mensagem;
    private String caminho;
    private LocalDateTime dataHora;

    public ErroResponse(
            int status,
            String erro,
            String mensagem,
            String caminho,
            LocalDateTime dataHora
    ) {
        this.status = status;
        this.erro = erro;
        this.mensagem = mensagem;
        this.caminho = caminho;
        this.dataHora = dataHora;
    }

    public int getStatus() {
        return status;
    }

    public String getErro() {
        return erro;
    }

    public String getMensagem() {
        return mensagem;
    }

    public String getCaminho() {
        return caminho;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }
}