package com.serviceflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ClienteRequest {

    @NotBlank(message = "O nome do cliente é obrigatório.")
    private String nome;

    @NotBlank(message = "O CPF ou CNPJ é obrigatório.")
    private String documento;

    @Email(message = "Digite um e-mail válido.")
    private String email;

    private String telefone;
    private String endereco;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDocumento() {
        return documento;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }
}