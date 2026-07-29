package com.ServiceFlow.dto;

import com.ServiceFlow.model.Cargo;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SolicitacaoFuncionarioRequest {

    @NotBlank(message = "O nome é obrigatório.")
    private String nome;

    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "Digite um e-mail válido.")
    private String email;

    @NotBlank(message = "A senha é obrigatória.")
    @Size(
            min = 6,
            message = "A senha deve possuir pelo menos 6 caracteres."
    )
    private String senha;

    @NotNull(message = "O cargo é obrigatório.")
    private Cargo cargo;

    @NotNull(message = "A empresa é obrigatória.")
    private Long empresaId;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public Cargo getCargo() {
        return cargo;
    }

    public void setCargo(Cargo cargo) {
        this.cargo = cargo;
    }

    public Long getEmpresaId() {
        return empresaId;
    }

    public void setEmpresaId(Long empresaId) {
        this.empresaId = empresaId;
    }
}