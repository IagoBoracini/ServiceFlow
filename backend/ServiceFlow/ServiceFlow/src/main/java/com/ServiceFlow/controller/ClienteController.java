package com.serviceflow.controller;

import com.serviceflow.dto.ClienteRequest;
import com.serviceflow.dto.ClienteResponse;
import com.serviceflow.service.ClienteService;
import com.serviceflow.model.PrioridadeChamado;
import com.serviceflow.model.StatusChamado;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(
            ClienteService clienteService
    ) {
        this.clienteService = clienteService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ClienteResponse cadastrar(
            @Valid @RequestBody ClienteRequest request,
            Authentication authentication
    ) {

        return clienteService.cadastrar(
                request,
                authentication
        );
    }

    @GetMapping
    public List<ClienteResponse> listar(
            Authentication authentication
    ) {

        return clienteService.listar(authentication);
    }

    @GetMapping("/{id}")
    public ClienteResponse buscarPorId(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return clienteService.buscarPorId(
                id,
                authentication
        );
    }

    @PutMapping("/{id}")
@PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
public ClienteResponse atualizar(
        @PathVariable Long id,
        @Valid @RequestBody ClienteRequest request,
        Authentication authentication
) {

    return clienteService.atualizar(
            id,
            request,
            authentication
    );
}

@GetMapping("/buscar")
public List<ClienteResponse> pesquisarPorNome(
        @RequestParam String nome,
        Authentication authentication
) {

    return clienteService.pesquisarPorNome(
            nome,
            authentication
    );
}

@PatchMapping("/{id}/inativar")
@PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
public ClienteResponse inativar(
        @PathVariable Long id,
        Authentication authentication
) {

    return clienteService.inativar(
            id,
            authentication
    );
}

@PatchMapping("/{id}/reativar")
@PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
public ClienteResponse reativar(
        @PathVariable Long id,
        Authentication authentication
) {

    return clienteService.reativar(
            id,
            authentication
    );
}


}