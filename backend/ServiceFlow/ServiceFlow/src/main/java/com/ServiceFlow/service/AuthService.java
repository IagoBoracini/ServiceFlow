package com.serviceflow.service;

import com.serviceflow.dto.LoginRequest;
import com.serviceflow.dto.LoginResponse;
import com.serviceflow.model.Usuario;
import com.serviceflow.repository.UsuarioRepository;
import com.serviceflow.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.serviceflow.model.StatusUsuario;

@Service
public class AuthService {

    private final UsuarioRepository repository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository repository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;

    }

public LoginResponse login(LoginRequest request) {

    Usuario usuario = repository
            .findByEmail(request.getEmail())
            .orElseThrow(
                    () -> new RuntimeException(
                            "E-mail ou senha inválidos."
                    )
            );

if (usuario.getStatus() == StatusUsuario.PENDENTE) {
    throw new IllegalStateException(
            "Seu cadastro ainda está aguardando aprovação."
    );
}

if (usuario.getStatus() == StatusUsuario.REJEITADO) {
    throw new IllegalStateException(
            "Sua solicitação de cadastro foi rejeitada."
    );
}

if (usuario.getStatus() == StatusUsuario.INATIVO) {
    throw new IllegalStateException(
            "Seu usuário está inativo. Procure o administrador da empresa."
    );
}

    if (
            !passwordEncoder.matches(
                    request.getSenha(),
                    usuario.getSenha()
            )
    ) {

        throw new RuntimeException(
                "E-mail ou senha inválidos."
        );

    }

    String token =
            jwtService.gerarToken(usuario.getEmail());

    return new LoginResponse(token);

}

}

