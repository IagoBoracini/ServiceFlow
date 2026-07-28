package com.serviceflow.dto;

import com.serviceflow.model.Cargo;
import com.serviceflow.model.StatusUsuario;

public class FuncionarioResponse {

    private Long id;
    private String nome;
    private String email;
    private Cargo cargo;
    private StatusUsuario status;
    private Long empresaId;
    private String empresaNome;

    public FuncionarioResponse(
            Long id,
            String nome,
            String email,
            Cargo cargo,
            StatusUsuario status,
            Long empresaId,
            String empresaNome
    ) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.cargo = cargo;
        this.status = status;
        this.empresaId = empresaId;
        this.empresaNome = empresaNome;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public Cargo getCargo() {
        return cargo;
    }

    public StatusUsuario getStatus() {
        return status;
    }

    public Long getEmpresaId() {
        return empresaId;
    }

    public String getEmpresaNome() {
        return empresaNome;
    }

}