package com.ServiceFlow.controller;

import com.ServiceFlow.dto.AtualizarOrdemServicoRequest;
import com.ServiceFlow.dto.AtualizarStatusOrdemServicoRequest;
import com.ServiceFlow.dto.OrdemServicoRequest;
import com.ServiceFlow.dto.OrdemServicoResponse;
import com.ServiceFlow.model.StatusOrdemServico;
import com.ServiceFlow.service.OrdemServicoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
            @Valid
            @RequestBody
            OrdemServicoRequest request,

            Authentication authentication
    ) {

        return ordemServicoService.criar(
                request,
                authentication
        );
    }

    @GetMapping
    public Page<OrdemServicoResponse> listar(

            @RequestParam(required = false)
            StatusOrdemServico status,

            @RequestParam(defaultValue = "0")
            int pagina,

            @RequestParam(defaultValue = "10")
            int tamanho,

            Authentication authentication
    ) {

        return ordemServicoService.listar(
                status,
                pagina,
                tamanho,
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

            @Valid
            @RequestBody
            AtualizarOrdemServicoRequest request,

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

            @Valid
            @RequestBody
            AtualizarStatusOrdemServicoRequest request,

            Authentication authentication
    ) {

        return ordemServicoService.alterarStatus(
                id,
                request.getStatus(),
                authentication
        );
    }
}