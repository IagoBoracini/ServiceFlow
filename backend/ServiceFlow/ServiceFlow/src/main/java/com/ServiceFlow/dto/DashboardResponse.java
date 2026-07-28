package com.serviceflow.dto;

public class DashboardResponse {

    private long clientes;
    private long funcionarios;
    private long tecnicos;

    private long chamadosAbertos;
    private long chamadosEmAndamento;
    private long chamadosAguardandoCliente;
    private long chamadosConcluidos;
    private long chamadosCancelados;

    private long ordensAbertas;
    private long ordensEmExecucao;
    private long ordensFinalizadas;
    private long ordensCanceladas;

    public DashboardResponse(
            long clientes,
            long funcionarios,
            long tecnicos,
            long chamadosAbertos,
            long chamadosEmAndamento,
            long chamadosAguardandoCliente,
            long chamadosConcluidos,
            long chamadosCancelados,
            long ordensAbertas,
            long ordensEmExecucao,
            long ordensFinalizadas,
            long ordensCanceladas
    ) {
        this.clientes = clientes;
        this.funcionarios = funcionarios;
        this.tecnicos = tecnicos;
        this.chamadosAbertos = chamadosAbertos;
        this.chamadosEmAndamento = chamadosEmAndamento;
        this.chamadosAguardandoCliente = chamadosAguardandoCliente;
        this.chamadosConcluidos = chamadosConcluidos;
        this.chamadosCancelados = chamadosCancelados;
        this.ordensAbertas = ordensAbertas;
        this.ordensEmExecucao = ordensEmExecucao;
        this.ordensFinalizadas = ordensFinalizadas;
        this.ordensCanceladas = ordensCanceladas;
    }

    public long getClientes() {
        return clientes;
    }

    public long getFuncionarios() {
        return funcionarios;
    }

    public long getTecnicos() {
        return tecnicos;
    }

    public long getChamadosAbertos() {
        return chamadosAbertos;
    }

    public long getChamadosEmAndamento() {
        return chamadosEmAndamento;
    }

    public long getChamadosAguardandoCliente() {
        return chamadosAguardandoCliente;
    }

    public long getChamadosConcluidos() {
        return chamadosConcluidos;
    }

    public long getChamadosCancelados() {
        return chamadosCancelados;
    }

    public long getOrdensAbertas() {
        return ordensAbertas;
    }

    public long getOrdensEmExecucao() {
        return ordensEmExecucao;
    }

    public long getOrdensFinalizadas() {
        return ordensFinalizadas;
    }

    public long getOrdensCanceladas() {
        return ordensCanceladas;
    }
}