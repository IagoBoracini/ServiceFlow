package com.serviceflow.controller;

import com.serviceflow.dto.LoginRequest;
import com.serviceflow.dto.LoginResponse;
import com.serviceflow.service.AuthService;
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