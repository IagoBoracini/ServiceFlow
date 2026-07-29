package com.ServiceFlow.controller;

import com.ServiceFlow.dto.CadastroEmpresaRequest;
import com.ServiceFlow.dto.CadastroEmpresaResponse;
import com.ServiceFlow.dto.EmpresaPublicaResponse;
import com.ServiceFlow.service.EmpresaService;
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