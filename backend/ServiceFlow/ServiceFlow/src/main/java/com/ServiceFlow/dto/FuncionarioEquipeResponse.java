package com.ServiceFlow.dto;

import com.ServiceFlow.model.Cargo;
import com.ServiceFlow.model.StatusUsuario;

public class FuncionarioEquipeResponse {

    private Long id;
    private String nome;
    private String email;
    private Cargo cargo;
    private StatusUsuario status;

    public FuncionarioEquipeResponse(
            Long id,
            String nome,
            String email,
            Cargo cargo,
            StatusUsuario status
    ) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.cargo = cargo;
        this.status = status;
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

}