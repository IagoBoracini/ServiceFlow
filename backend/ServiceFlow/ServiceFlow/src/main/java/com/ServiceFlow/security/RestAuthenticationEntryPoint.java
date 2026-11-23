package com.ServiceFlow.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** Requisição sem token ou com token inválido/expirado: HTTP 401. */
@Component
public class RestAuthenticationEntryPoint
        implements AuthenticationEntryPoint {

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {

        RespostaErroJson.escrever(
                request,
                response,
                HttpServletResponse.SC_UNAUTHORIZED,
                "Não autenticado",
                "Sessão expirada ou inválida. Faça login novamente."
        );
    }
}
