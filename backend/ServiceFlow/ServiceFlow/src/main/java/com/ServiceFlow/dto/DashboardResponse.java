package com.serviceflow.dto;

import java.util.List;

public class DashboardResponse {

    private long clientes;
    private long funcionarios;
    private long tecnicos;

    private long chamadosAbertos;
    private long chamadosEmAndamento;
    private long chamadosAguardandoCliente;
    private long chamadosConcluidos;
    private long chamadosCancelados;

    private long chamadosPrioridadeBaixa;
    private long chamadosPrioridadeMedia;
    private long chamadosPrioridadeAlta;
    private long chamadosPrioridadeUrgente;

    private long ordensAbertas;
    private long ordensEmExecucao;
    private long ordensFinalizadas;
    private long ordensCanceladas;

    private List<ChamadoResumoDashboardResponse> ultimosChamados;
    private List<OrdemServicoResumoDashboardResponse> ultimasOrdens;

    public DashboardResponse(
            long clientes,
            long funcionarios,
            long tecnicos,
            long chamadosAbertos,
            long chamadosEmAndamento,
            long chamadosAguardandoCliente,
            long chamadosConcluidos,
            long chamadosCancelados,
            long chamadosPrioridadeBaixa,
            long chamadosPrioridadeMedia,
            long chamadosPrioridadeAlta,
            long chamadosPrioridadeUrgente,
            long ordensAbertas,
            long ordensEmExecucao,
            long ordensFinalizadas,
            long ordensCanceladas,
            List<ChamadoResumoDashboardResponse> ultimosChamados,
            List<OrdemServicoResumoDashboardResponse> ultimasOrdens
    ) {
        this.clientes = clientes;
        this.funcionarios = funcionarios;
        this.tecnicos = tecnicos;
        this.chamadosAbertos = chamadosAbertos;
        this.chamadosEmAndamento = chamadosEmAndamento;
        this.chamadosAguardandoCliente = chamadosAguardandoCliente;
        this.chamadosConcluidos = chamadosConcluidos;
        this.chamadosCancelados = chamadosCancelados;
        this.chamadosPrioridadeBaixa = chamadosPrioridadeBaixa;
        this.chamadosPrioridadeMedia = chamadosPrioridadeMedia;
        this.chamadosPrioridadeAlta = chamadosPrioridadeAlta;
        this.chamadosPrioridadeUrgente = chamadosPrioridadeUrgente;
        this.ordensAbertas = ordensAbertas;
        this.ordensEmExecucao = ordensEmExecucao;
        this.ordensFinalizadas = ordensFinalizadas;
        this.ordensCanceladas = ordensCanceladas;
        this.ultimosChamados = ultimosChamados;
        this.ultimasOrdens = ultimasOrdens;
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

    public long getChamadosPrioridadeBaixa() {
        return chamadosPrioridadeBaixa;
    }

    public long getChamadosPrioridadeMedia() {
        return chamadosPrioridadeMedia;
    }

    public long getChamadosPrioridadeAlta() {
        return chamadosPrioridadeAlta;
    }

    public long getChamadosPrioridadeUrgente() {
        return chamadosPrioridadeUrgente;
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

    public List<ChamadoResumoDashboardResponse> getUltimosChamados() {
        return ultimosChamados;
    }

    public List<OrdemServicoResumoDashboardResponse> getUltimasOrdens() {
        return ultimasOrdens;
    }
}