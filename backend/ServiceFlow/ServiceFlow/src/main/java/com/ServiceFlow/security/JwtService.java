package com.serviceflow.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET =
            "serviceflow-chave-secreta-2026-com-pelo-menos-32-caracteres";

    private static final long EXPIRACAO = 1000 * 60 * 60;

    private SecretKey getChave() {

        return Keys.hmacShaKeyFor(
                SECRET.getBytes(StandardCharsets.UTF_8)
        );

    }

    public String gerarToken(String email) {

        Date agora = new Date();

        Date dataExpiracao = new Date(
                agora.getTime() + EXPIRACAO
        );

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(agora)
                .setExpiration(dataExpiracao)
                .signWith(getChave())
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
                .setSigningKey(getChave())
                .build()
                .parseClaimsJws(token)
                .getBody();

    }

}