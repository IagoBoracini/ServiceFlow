package com.ServiceFlow.security;

import com.ServiceFlow.model.StatusUsuario;
import com.ServiceFlow.model.Usuario;
import com.ServiceFlow.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Set<String> METODOS_LEITURA =
            Set.of("GET", "HEAD", "OPTIONS");

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final boolean demoHabilitado;
    private final String emailDemo;

    public JwtFilter(
            JwtService jwtService,
            UsuarioRepository usuarioRepository,
            @Value("${app.demo.enabled:false}") boolean demoHabilitado,
            @Value("${app.demo.email:demo@serviceflow.app}") String emailDemo
    ) {

        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.demoHabilitado = demoHabilitado;
        this.emailDemo = emailDemo.trim().toLowerCase();

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
                usuario.getStatus() == StatusUsuario.ATIVO &&
                SecurityContextHolder
                        .getContext()
                        .getAuthentication() == null
        ) {

            // Conta de demonstração: somente leitura.
            if (
                    demoHabilitado &&
                    emailDemo.equalsIgnoreCase(usuario.getEmail()) &&
                    !METODOS_LEITURA.contains(request.getMethod())
            ) {

                RespostaErroJson.escrever(
                        request,
                        response,
                        HttpServletResponse.SC_FORBIDDEN,
                        "Modo demonstração",
                        "Esta é uma conta de demonstração somente leitura. "
                                + "Cadastre sua empresa para testar alterações."
                );
                return;

            }

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
