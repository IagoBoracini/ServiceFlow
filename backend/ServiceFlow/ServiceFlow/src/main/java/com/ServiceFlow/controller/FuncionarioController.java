package com.serviceflow.controller;

import com.serviceflow.dto.FuncionarioEquipeResponse;
import com.serviceflow.dto.FuncionarioResponse;
import com.serviceflow.dto.MensagemResponse;
import com.serviceflow.dto.SolicitacaoFuncionarioRequest;
import com.serviceflow.service.FuncionarioService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {

    private final FuncionarioService funcionarioService;

    public FuncionarioController(
            FuncionarioService funcionarioService
    ) {
        this.funcionarioService = funcionarioService;
    }

    @PostMapping("/solicitacoes")
    @ResponseStatus(HttpStatus.CREATED)
    public MensagemResponse solicitarEntrada(
           @Valid @RequestBody SolicitacaoFuncionarioRequest request
    ) {

        return funcionarioService.solicitarEntrada(request);

    }

    @GetMapping("/pendentes")
    @PreAuthorize("hasRole('ADMIN')")
    public List<FuncionarioResponse> listarPendentes(
            Authentication authentication
    ) {

        return funcionarioService.listarPendentes(
                authentication
        );

    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<FuncionarioEquipeResponse> listarFuncionarios(
            Authentication authentication
    ) {

        return funcionarioService.listarFuncionarios(
                authentication
        );

    }

    @PatchMapping("/{id}/aprovar")
    @PreAuthorize("hasRole('ADMIN')")
    public MensagemResponse aprovar(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return funcionarioService.aprovar(
                id,
                authentication
        );

    }

    @PatchMapping("/{id}/rejeitar")
    @PreAuthorize("hasRole('ADMIN')")
    public MensagemResponse rejeitar(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return funcionarioService.rejeitar(
                id,
                authentication
        );

    }

    @PatchMapping("/{id}/inativar")
    @PreAuthorize("hasRole('ADMIN')")
    public MensagemResponse inativar(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return funcionarioService.inativar(
                id,
                authentication
        );

    }

    @PatchMapping("/{id}/reativar")
    @PreAuthorize("hasRole('ADMIN')")
    public MensagemResponse reativar(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return funcionarioService.reativar(
                id,
                authentication
        );

    }

}