package com.serviceflow.dto;

public class EmpresaPublicaResponse {

    private Long id;
    private String nome;

    public EmpresaPublicaResponse(
            Long id,
            String nome
    ) {
        this.id = id;
        this.nome = nome;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

}