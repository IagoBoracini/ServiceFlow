package com.ServiceFlow.controller;

import com.ServiceFlow.dto.AtualizarPrioridadeChamadoRequest;
import com.ServiceFlow.dto.AtualizarStatusChamadoRequest;
import com.ServiceFlow.dto.AtribuirTecnicoRequest;
import com.ServiceFlow.dto.ChamadoRequest;
import com.ServiceFlow.dto.ChamadoResponse;
import com.ServiceFlow.model.PrioridadeChamado;
import com.ServiceFlow.model.StatusChamado;
import com.ServiceFlow.service.ChamadoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chamados")
public class ChamadoController {

    private final ChamadoService chamadoService;

    public ChamadoController(
            ChamadoService chamadoService
    ) {
        this.chamadoService = chamadoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ChamadoResponse cadastrar(
            @Valid
            @RequestBody
            ChamadoRequest request,

            Authentication authentication
    ) {

        return chamadoService.cadastrar(
                request,
                authentication
        );
    }

    @GetMapping
    public Page<ChamadoResponse> listar(

            @RequestParam(required = false)
            StatusChamado status,

            @RequestParam(required = false)
            PrioridadeChamado prioridade,

            @RequestParam(defaultValue = "0")
            int pagina,

            @RequestParam(defaultValue = "10")
            int tamanho,

            Authentication authentication
    ) {

        return chamadoService.listar(
                status,
                prioridade,
                pagina,
                tamanho,
                authentication
        );
    }

    @GetMapping("/{id}")
    public ChamadoResponse buscarPorId(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return chamadoService.buscarPorId(
                id,
                authentication
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ChamadoResponse atualizar(
            @PathVariable Long id,

            @Valid
            @RequestBody
            ChamadoRequest request,

            Authentication authentication
    ) {

        return chamadoService.atualizar(
                id,
                request,
                authentication
        );
    }

    @PatchMapping("/{id}/atribuir-tecnico")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ChamadoResponse atribuirTecnico(
            @PathVariable Long id,

            @Valid
            @RequestBody
            AtribuirTecnicoRequest request,

            Authentication authentication
    ) {

        return chamadoService.atribuirTecnico(
                id,
                request.getTecnicoId(),
                authentication
        );
    }

    @PatchMapping("/{id}/prioridade")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ChamadoResponse alterarPrioridade(
            @PathVariable Long id,

            @Valid
            @RequestBody
            AtualizarPrioridadeChamadoRequest request,

            Authentication authentication
    ) {

        return chamadoService.alterarPrioridade(
                id,
                request.getPrioridade(),
                authentication
        );
    }

    @PatchMapping("/{id}/status")
    public ChamadoResponse alterarStatus(
            @PathVariable Long id,

            @Valid
            @RequestBody
            AtualizarStatusChamadoRequest request,

            Authentication authentication
    ) {

        return chamadoService.alterarStatus(
                id,
                request.getStatus(),
                authentication
        );
    }
}