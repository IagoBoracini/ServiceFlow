package com.ServiceFlow.controller;

import com.ServiceFlow.dto.LoginRequest;
import com.ServiceFlow.dto.LoginResponse;
import com.ServiceFlow.service.AuthService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/login")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service){

        this.service = service;

    }

    @PostMapping
    public LoginResponse login(
           @Valid @RequestBody LoginRequest request){

        return service.login(request);

    }

}