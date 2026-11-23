package com.ServiceFlow.exception;

/** Lançada quando e-mail ou senha estão incorretos (HTTP 401). */
public class CredenciaisInvalidasException extends RuntimeException {

    public CredenciaisInvalidasException() {
        super("E-mail ou senha inválidos.");
    }
}
