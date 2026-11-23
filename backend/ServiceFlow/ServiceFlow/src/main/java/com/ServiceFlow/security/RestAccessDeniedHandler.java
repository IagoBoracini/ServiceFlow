package com.ServiceFlow.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** Usuário autenticado sem permissão para o recurso: HTTP 403. */
@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {

        RespostaErroJson.escrever(
                request,
                response,
                HttpServletResponse.SC_FORBIDDEN,
                "Acesso negado",
                "Você não possui permissão para realizar esta operação."
        );
    }
}
