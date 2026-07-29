package com.ServiceFlow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CadastroEmpresaRequest {

    @NotBlank(message = "O nome da empresa é obrigatório.")
    private String nomeEmpresa;

    @NotBlank(message = "O CNPJ é obrigatório.")
    private String cnpj;

    private String telefoneEmpresa;

    @NotBlank(message = "O e-mail da empresa é obrigatório.")
    @Email(message = "Digite um e-mail válido para a empresa.")
    private String emailEmpresa;

    @NotBlank(message = "O nome do administrador é obrigatório.")
    private String nomeAdministrador;

    @NotBlank(message = "O e-mail do administrador é obrigatório.")
    @Email(message = "Digite um e-mail válido para o administrador.")
    private String emailAdministrador;

    @NotBlank(message = "A senha do administrador é obrigatória.")
    @Size(
            min = 6,
            message = "A senha deve possuir pelo menos 6 caracteres."
    )
    private String senhaAdministrador;

    public String getNomeEmpresa() {
        return nomeEmpresa;
    }

    public void setNomeEmpresa(String nomeEmpresa) {
        this.nomeEmpresa = nomeEmpresa;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getTelefoneEmpresa() {
        return telefoneEmpresa;
    }

    public void setTelefoneEmpresa(String telefoneEmpresa) {
        this.telefoneEmpresa = telefoneEmpresa;
    }

    public String getEmailEmpresa() {
        return emailEmpresa;
    }

    public void setEmailEmpresa(String emailEmpresa) {
        this.emailEmpresa = emailEmpresa;
    }

    public String getNomeAdministrador() {
        return nomeAdministrador;
    }

    public void setNomeAdministrador(String nomeAdministrador) {
        this.nomeAdministrador = nomeAdministrador;
    }

    public String getEmailAdministrador() {
        return emailAdministrador;
    }

    public void setEmailAdministrador(String emailAdministrador) {
        this.emailAdministrador = emailAdministrador;
    }

    public String getSenhaAdministrador() {
        return senhaAdministrador;
    }

    public void setSenhaAdministrador(String senhaAdministrador) {
        this.senhaAdministrador = senhaAdministrador;
    }
}