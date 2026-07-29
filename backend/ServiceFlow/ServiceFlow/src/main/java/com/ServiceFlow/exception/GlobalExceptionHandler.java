package com.ServiceFlow.exception;

import com.ServiceFlow.dto.ErroResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErroResponse> tratarArgumentoInvalido(
            IllegalArgumentException exception,
            HttpServletRequest request
    ) {

        ErroResponse erro = new ErroResponse(
                400,
                "Requisição inválida",
                exception.getMessage(),
                request.getRequestURI(),
                LocalDateTime.now()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(erro);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErroResponse> tratarUsuarioSemAcesso(
            IllegalStateException exception,
            HttpServletRequest request
    ) {

        ErroResponse erro = new ErroResponse(
                403,
                "Acesso negado",
                exception.getMessage(),
                request.getRequestURI(),
                LocalDateTime.now()
        );

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(erro);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResponse> tratarAcessoNegado(
            AccessDeniedException exception,
            HttpServletRequest request
    ) {

        ErroResponse erro = new ErroResponse(
                403,
                "Acesso negado",
                "Você não possui permissão para realizar esta operação.",
                request.getRequestURI(),
                LocalDateTime.now()
        );

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(erro);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> tratarValidacao(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {

        String mensagem = exception
                .getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(erro -> erro.getDefaultMessage())
                .orElse("Existem campos inválidos.");

        ErroResponse erro = new ErroResponse(
                400,
                "Erro de validação",
                mensagem,
                request.getRequestURI(),
                LocalDateTime.now()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(erro);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> tratarErroInterno(
            Exception exception,
            HttpServletRequest request
    ) {

        ErroResponse erro = new ErroResponse(
                500,
                "Erro interno",
                "Ocorreu um erro inesperado no servidor.",
                request.getRequestURI(),
                LocalDateTime.now()
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(erro);
    }
}