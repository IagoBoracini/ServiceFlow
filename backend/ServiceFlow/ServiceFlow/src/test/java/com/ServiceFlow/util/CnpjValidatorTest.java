package com.ServiceFlow.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CnpjValidatorTest {

    @Test
    void deveAceitarCnpjsComDigitosVerificadoresCorretos() {
        assertTrue(CnpjValidator.valido("11222333000181"));
        assertTrue(CnpjValidator.valido("45997418000153"));
        assertTrue(CnpjValidator.valido("00000000000191"));
    }

    @Test
    void deveRejeitarDigitoVerificadorIncorreto() {
        assertFalse(CnpjValidator.valido("11222333000182"));
        assertFalse(CnpjValidator.valido("12345678000100"));
    }

    @Test
    void deveRejeitarSequenciasRepetidas() {
        assertFalse(CnpjValidator.valido("00000000000000"));
        assertFalse(CnpjValidator.valido("11111111111111"));
    }

    @Test
    void deveRejeitarTamanhoInvalidoOuCaracteresNaoNumericos() {
        assertFalse(CnpjValidator.valido("1122233300018"));
        assertFalse(CnpjValidator.valido("112223330001811"));
        assertFalse(CnpjValidator.valido("abc"));
        assertFalse(CnpjValidator.valido(null));
    }
}
