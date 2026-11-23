package com.ServiceFlow.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

/**
 * Escreve respostas de erro de segurança (401/403) no mesmo formato JSON
 * do GlobalExceptionHandler: status, erro, mensagem, caminho, dataHora.
 */
final class RespostaErroJson {

    private RespostaErroJson() {
    }

    static void escrever(
            HttpServletRequest request,
            HttpServletResponse response,
            int status,
            String erro,
            String mensagem
    ) throws IOException {

        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json");

        String corpo = "{"
                + "\"status\":" + status + ","
                + "\"erro\":\"" + escapar(erro) + "\","
                + "\"mensagem\":\"" + escapar(mensagem) + "\","
                + "\"caminho\":\"" + escapar(request.getRequestURI()) + "\","
                + "\"dataHora\":\"" + LocalDateTime.now() + "\""
                + "}";

        response.getWriter().write(corpo);
    }

    private static String escapar(String valor) {

        if (valor == null) {
            return "";
        }

        return valor
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
