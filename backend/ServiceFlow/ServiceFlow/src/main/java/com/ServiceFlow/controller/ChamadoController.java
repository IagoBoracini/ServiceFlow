package com.serviceflow.controller;

import com.serviceflow.dto.ChamadoRequest;
import com.serviceflow.dto.ChamadoResponse;
import com.serviceflow.service.ChamadoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            @Valid @RequestBody ChamadoRequest request,
            Authentication authentication
    ) {

        return chamadoService.cadastrar(
                request,
                authentication
        );
    }

    @GetMapping
    public List<ChamadoResponse> listar(
            Authentication authentication
    ) {

        return chamadoService.listar(authentication);
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
}