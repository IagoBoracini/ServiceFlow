package com.ServiceFlow.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String SEGREDO =
            "segredo-somente-para-testes-com-mais-de-32-caracteres";

    @Test
    void deveGerarTokenValidoEExtrairOEmail() {
        JwtService service = new JwtService(SEGREDO, 60);

        String token = service.gerarToken("ana@empresa.com");

        assertTrue(service.tokenValido(token));
        assertEquals("ana@empresa.com", service.extrairEmail(token));
    }

    @Test
    void deveRejeitarTokenExpirado() {
        JwtService service = new JwtService(SEGREDO, -1);

        String token = service.gerarToken("ana@empresa.com");

        assertFalse(service.tokenValido(token));
    }

    @Test
    void deveRejeitarTokenAdulteradoOuAssinadoComOutroSegredo() {
        JwtService service = new JwtService(SEGREDO, 60);
        JwtService outro = new JwtService(
                "outro-segredo-de-teste-com-mais-de-32-caracteres", 60);

        String tokenDeOutroSegredo = outro.gerarToken("ana@empresa.com");

        assertFalse(service.tokenValido(tokenDeOutroSegredo));
        assertFalse(service.tokenValido("isto.nao.e.um.jwt"));
        assertFalse(service.tokenValido(""));
    }

    @Test
    void naoDeveIniciarComSegredoCurtoOuAusente() {
        assertThrows(IllegalStateException.class,
                () -> new JwtService("curto", 60));
        assertThrows(IllegalStateException.class,
                () -> new JwtService(null, 60));
    }
}
