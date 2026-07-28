package com.serviceflow.controller;

import com.serviceflow.dto.AtualizarOrdemServicoRequest;
import com.serviceflow.dto.AtualizarStatusOrdemServicoRequest;
import com.serviceflow.dto.OrdemServicoRequest;
import com.serviceflow.dto.OrdemServicoResponse;
import com.serviceflow.model.StatusOrdemServico;
import com.serviceflow.service.OrdemServicoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ordens-servico")
public class OrdemServicoController {

    private final OrdemServicoService ordemServicoService;

    public OrdemServicoController(
            OrdemServicoService ordemServicoService
    ) {
        this.ordemServicoService = ordemServicoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public OrdemServicoResponse criar(
            @Valid @RequestBody OrdemServicoRequest request,
            Authentication authentication
    ) {

        return ordemServicoService.criar(
                request,
                authentication
        );
    }

    @GetMapping
    public List<OrdemServicoResponse> listar(
            @RequestParam(required = false)
            StatusOrdemServico status,

            Authentication authentication
    ) {

        return ordemServicoService.listar(
                status,
                authentication
        );
    }

    @GetMapping("/{id}")
    public OrdemServicoResponse buscarPorId(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return ordemServicoService.buscarPorId(
                id,
                authentication
        );
    }

    @PutMapping("/{id}")
    public OrdemServicoResponse atualizarAtendimento(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarOrdemServicoRequest request,
            Authentication authentication
    ) {

        return ordemServicoService.atualizarAtendimento(
                id,
                request,
                authentication
        );
    }

    @PatchMapping("/{id}/status")
    public OrdemServicoResponse alterarStatus(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarStatusOrdemServicoRequest request,
            Authentication authentication
    ) {

        return ordemServicoService.alterarStatus(
                id,
                request.getStatus(),
                authentication
        );
    }
}