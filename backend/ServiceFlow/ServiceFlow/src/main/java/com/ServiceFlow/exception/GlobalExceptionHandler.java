package com.ServiceFlow.exception;

import com.ServiceFlow.dto.ErroResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;

/**
 * Converte exceções em respostas JSON padronizadas
 * (status, erro, mensagem, caminho, dataHora).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<ErroResponse> tratarCredenciaisInvalidas(
            CredenciaisInvalidasException exception,
            HttpServletRequest request
    ) {
        return resposta(
                HttpStatus.UNAUTHORIZED,
                "Não autenticado",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErroResponse> tratarArgumentoInvalido(
            IllegalArgumentException exception,
            HttpServletRequest request
    ) {
        return resposta(
                HttpStatus.BAD_REQUEST,
                "Requisição inválida",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErroResponse> tratarUsuarioSemAcesso(
            IllegalStateException exception,
            HttpServletRequest request
    ) {
        return resposta(
                HttpStatus.FORBIDDEN,
                "Acesso negado",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResponse> tratarAcessoNegado(
            AccessDeniedException exception,
            HttpServletRequest request
    ) {
        return resposta(
                HttpStatus.FORBIDDEN,
                "Acesso negado",
                "Você não possui permissão para realizar esta operação.",
                request
        );
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

        return resposta(
                HttpStatus.BAD_REQUEST,
                "Erro de validação",
                mensagem,
                request
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResponse> tratarCorpoIlegivel(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {
        return resposta(
                HttpStatus.BAD_REQUEST,
                "Requisição inválida",
                "O corpo da requisição está ausente ou mal formatado.",
                request
        );
    }

    @ExceptionHandler({
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<ErroResponse> tratarParametroInvalido(
            Exception exception,
            HttpServletRequest request
    ) {
        return resposta(
                HttpStatus.BAD_REQUEST,
                "Requisição inválida",
                "Um ou mais parâmetros da requisição são inválidos.",
                request
        );
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErroResponse> tratarMetodoNaoSuportado(
            HttpRequestMethodNotSupportedException exception,
            HttpServletRequest request
    ) {
        return resposta(
                HttpStatus.METHOD_NOT_ALLOWED,
                "Método não permitido",
                "Este método HTTP não é aceito neste endereço.",
                request
        );
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErroResponse> tratarRecursoInexistente(
            NoResourceFoundException exception,
            HttpServletRequest request
    ) {
        return resposta(
                HttpStatus.NOT_FOUND,
                "Não encontrado",
                "O recurso solicitado não existe.",
                request
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> tratarErroInterno(
            Exception exception,
            HttpServletRequest request
    ) {
        log.error(
                "Erro inesperado em {}",
                request.getRequestURI(),
                exception
        );

        return resposta(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Erro interno",
                "Ocorreu um erro inesperado no servidor.",
                request
        );
    }

    private ResponseEntity<ErroResponse> resposta(
            HttpStatus status,
            String titulo,
            String mensagem,
            HttpServletRequest request
    ) {
        ErroResponse erro = new ErroResponse(
                status.value(),
                titulo,
                mensagem,
                request.getRequestURI(),
                LocalDateTime.now()
        );

        return ResponseEntity.status(status).body(erro);
    }
}
