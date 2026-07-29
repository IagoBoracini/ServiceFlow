package com.ServiceFlow.security;

import com.ServiceFlow.model.Usuario;
import com.ServiceFlow.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtFilter(
            JwtService jwtService,
            UsuarioRepository usuarioRepository
    ) {

        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;

    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorization = request.getHeader("Authorization");

        if (
                authorization == null ||
                !authorization.startsWith("Bearer ")
        ) {

            filterChain.doFilter(request, response);
            return;

        }

        String token = authorization.substring(7);

        if (!jwtService.tokenValido(token)) {

            filterChain.doFilter(request, response);
            return;

        }

        String email = jwtService.extrairEmail(token);

        Usuario usuario = usuarioRepository
                .findByEmail(email)
                .orElse(null);

        if (
                usuario != null &&
                SecurityContextHolder
                        .getContext()
                        .getAuthentication() == null
        ) {

            SimpleGrantedAuthority autoridade =
                    new SimpleGrantedAuthority(
                            "ROLE_" + usuario.getCargo()
                    );

            UsernamePasswordAuthenticationToken autenticacao =
                    new UsernamePasswordAuthenticationToken(
                            usuario.getEmail(),
                            null,
                            List.of(autoridade)
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(autenticacao);

        }

        filterChain.doFilter(request, response);

    }

}