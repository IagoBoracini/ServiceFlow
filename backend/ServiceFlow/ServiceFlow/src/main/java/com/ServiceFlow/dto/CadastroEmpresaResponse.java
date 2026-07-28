package com.serviceflow.dto;

public class CadastroEmpresaResponse {

    private Long empresaId;
    private Long administradorId;
    private String mensagem;

    public CadastroEmpresaResponse(
            Long empresaId,
            Long administradorId,
            String mensagem
    ) {
        this.empresaId = empresaId;
        this.administradorId = administradorId;
        this.mensagem = mensagem;
    }

    public Long getEmpresaId() {
        return empresaId;
    }

    public Long getAdministradorId() {
        return administradorId;
    }

    public String getMensagem() {
        return mensagem;
    }

}