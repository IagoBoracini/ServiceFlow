package com.ServiceFlow.dto;

public class ClienteResponse {

    private Long id;
    private String nome;
    private String documento;
    private String email;
    private String telefone;
    private String endereco;
    private boolean ativo;

    public ClienteResponse(
            Long id,
            String nome,
            String documento,
            String email,
            String telefone,
            String endereco,
            boolean ativo
    ) {
        this.id = id;
        this.nome = nome;
        this.documento = documento;
        this.email = email;
        this.telefone = telefone;
        this.endereco = endereco;
        this.ativo = ativo;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getDocumento() {
        return documento;
    }

    public String getEmail() {
        return email;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getEndereco() {
        return endereco;
    }

    public boolean isAtivo() {
        return ativo;
    }
}