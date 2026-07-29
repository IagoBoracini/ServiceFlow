package com.ServiceFlow.controller;

import com.ServiceFlow.model.Usuario;
import com.ServiceFlow.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping
    public Usuario cadastrar(@RequestBody Usuario usuario) {
        return service.salvar(usuario);
    }
}