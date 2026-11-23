package com.ServiceFlow.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Gera e valida tokens JWT.
 *
 * O segredo de assinatura NUNCA fica no código: ele vem da variável de
 * ambiente JWT_SECRET (propriedade app.jwt.secret). Se estiver ausente ou
 * curto demais, a aplicação não inicia.
 */
@Service
public class JwtService {

    private static final int TAMANHO_MINIMO_SEGREDO_BYTES = 32;

    private final SecretKey chave;
    private final long expiracaoMillis;

    public JwtService(
            @Value("${app.jwt.secret}") String segredo,
            @Value("${app.jwt.expiration-minutes:60}") long expiracaoMinutos
    ) {

        if (
                segredo == null ||
                segredo.getBytes(StandardCharsets.UTF_8).length
                        < TAMANHO_MINIMO_SEGREDO_BYTES
        ) {
            throw new IllegalStateException(
                    "JWT_SECRET deve ter pelo menos "
                            + TAMANHO_MINIMO_SEGREDO_BYTES
                            + " caracteres."
            );
        }

        this.chave = Keys.hmacShaKeyFor(
                segredo.getBytes(StandardCharsets.UTF_8)
        );
        this.expiracaoMillis = expiracaoMinutos * 60 * 1000;
    }

    public String gerarToken(String email) {

        Date agora = new Date();

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(agora)
                .setExpiration(
                        new Date(agora.getTime() + expiracaoMillis)
                )
                .signWith(chave)
                .compact();
    }

    public String extrairEmail(String token) {

        return extrairClaims(token).getSubject();
    }

    public boolean tokenValido(String token) {

        try {

            Claims claims = extrairClaims(token);

            return claims.getExpiration().after(new Date());

        } catch (Exception exception) {

            return false;
        }
    }

    private Claims extrairClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(chave)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
