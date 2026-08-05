package com.ServiceFlow.controller;

import com.ServiceFlow.dto.AlterarSenhaRequest;
import com.ServiceFlow.dto.AtualizarPerfilRequest;
import com.ServiceFlow.dto.MensagemResponse;
import com.ServiceFlow.dto.UsuarioPerfilResponse;
import com.ServiceFlow.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(
            UsuarioService usuarioService
    ) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/me")
    public UsuarioPerfilResponse buscarPerfil(
            Authentication authentication
    ) {
        return usuarioService.buscarPerfil(
                authentication
        );
    }

    @PutMapping("/me")
    public UsuarioPerfilResponse atualizarPerfil(
            @Valid
            @RequestBody
            AtualizarPerfilRequest request,

            Authentication authentication
    ) {
        return usuarioService.atualizarPerfil(
                request,
                authentication
        );
    }

    @PatchMapping("/me/senha")
    public MensagemResponse alterarSenha(
            @Valid
            @RequestBody
            AlterarSenhaRequest request,

            Authentication authentication
    ) {
        return usuarioService.alterarSenha(
                request,
                authentication
        );
    }
}