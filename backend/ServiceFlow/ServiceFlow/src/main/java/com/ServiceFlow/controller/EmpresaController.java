package com.serviceflow.controller;

import com.serviceflow.dto.CadastroEmpresaRequest;
import com.serviceflow.dto.CadastroEmpresaResponse;
import com.serviceflow.dto.EmpresaPublicaResponse;
import com.serviceflow.service.EmpresaService;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/empresas")
public class EmpresaController {

    private final EmpresaService empresaService;

    public EmpresaController(
            EmpresaService empresaService
    ) {
        this.empresaService = empresaService;
    }

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public CadastroEmpresaResponse cadastrar(
           @Valid @RequestBody CadastroEmpresaRequest request
    ) {

        return empresaService.cadastrarEmpresa(request);

    }

    @GetMapping("/publicas")
    public List<EmpresaPublicaResponse> listarPublicas() {

        return empresaService.listarEmpresasPublicas();

    }

}