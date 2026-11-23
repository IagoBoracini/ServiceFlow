package com.ServiceFlow.util;

/** Validação de CNPJ pelos dígitos verificadores. */
public final class CnpjValidator {

    private static final int[] PESOS_PRIMEIRO_DIGITO =
            {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

    private static final int[] PESOS_SEGUNDO_DIGITO =
            {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

    private CnpjValidator() {
    }

    /**
     * @param cnpj CNPJ contendo somente números (14 dígitos)
     * @return true se o tamanho e os dígitos verificadores estão corretos
     */
    public static boolean valido(String cnpj) {

        if (cnpj == null || !cnpj.matches("\\d{14}")) {
            return false;
        }

        // 00000000000000, 11111111111111 etc. passam na conta, mas não são válidos
        if (cnpj.chars().distinct().count() == 1) {
            return false;
        }

        int primeiro = calcularDigito(cnpj, PESOS_PRIMEIRO_DIGITO);
        int segundo = calcularDigito(cnpj, PESOS_SEGUNDO_DIGITO);

        return primeiro == Character.getNumericValue(cnpj.charAt(12))
                && segundo == Character.getNumericValue(cnpj.charAt(13));
    }

    private static int calcularDigito(String cnpj, int[] pesos) {

        int soma = 0;

        for (int i = 0; i < pesos.length; i++) {
            soma += Character.getNumericValue(cnpj.charAt(i)) * pesos[i];
        }

        int resto = soma % 11;

        return resto < 2 ? 0 : 11 - resto;
    }
}
