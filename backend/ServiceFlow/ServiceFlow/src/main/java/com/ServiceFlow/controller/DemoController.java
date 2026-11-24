package com.ServiceFlow.controller;

import com.ServiceFlow.dto.ErroResponse;
import com.ServiceFlow.dto.LoginResponse;
import com.ServiceFlow.service.DemoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

/**
 * Entrada pública do modo demonstração: devolve um token da conta demo
 * (somente leitura). Retorna 404 quando o modo demo está desabilitado.
 */
@RestController
@RequestMapping("/login/demo")
public class DemoController {

    private final DemoService demoService;

    public DemoController(DemoService demoService) {
        this.demoService = demoService;
    }

    @PostMapping
    public ResponseEntity<?> entrar(HttpServletRequest request) {

        return demoService.entrar()
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ErroResponse(
                                HttpStatus.NOT_FOUND.value(),
                                "Modo demonstração indisponível",
                                "O modo demonstração não está habilitado neste servidor.",
                                request.getRequestURI(),
                                LocalDateTime.now()
                        )));
    }
}
