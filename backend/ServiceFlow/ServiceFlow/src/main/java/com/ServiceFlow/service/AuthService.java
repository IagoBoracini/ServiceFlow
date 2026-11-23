package com.ServiceFlow.service;

import com.ServiceFlow.dto.LoginRequest;
import com.ServiceFlow.dto.LoginResponse;
import com.ServiceFlow.exception.CredenciaisInvalidasException;
import com.ServiceFlow.model.StatusUsuario;
import com.ServiceFlow.model.Usuario;
import com.ServiceFlow.repository.UsuarioRepository;
import com.ServiceFlow.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Hash usado quando o e-mail não existe, para que o tempo de resposta
     * seja parecido com o de um e-mail existente (evita descobrir quais
     * e-mails estão cadastrados medindo o tempo).
     */
    private final String hashFalso;

    public AuthService(
            UsuarioRepository repository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
this.hashFalso = passwordEncoder.encode("senha-inexistente");
    }

    public LoginResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        Usuario usuario = repository
                .findByEmail(email)
                .orElse(null);

        String hashComparado =
                usuario != null ? usuario.getSenha() : hashFalso;

        boolean senhaCorreta = passwordEncoder.matches(
                request.getSenha(),
                hashComparado
        );

        // A senha é verificada ANTES do status da conta: quem não sabe a
        // senha recebe sempre a mesma mensagem genérica.
        if (usuario == null || !senhaCorreta) {
            throw new CredenciaisInvalidasException();
        }

        if (usuario.getStatus() == StatusUsuario.PENDENTE) {
            throw new IllegalStateException(
                    "Seu cadastro ainda está aguardando aprovação."
            );
        }

        if (usuario.getStatus() == StatusUsuario.REJEITADO) {
            throw new IllegalStateException(
                    "Sua solicitação de cadastro foi rejeitada."
            );
        }

        if (usuario.getStatus() == StatusUsuario.INATIVO) {
            throw new IllegalStateException(
                    "Seu usuário está inativo. Procure o administrador da empresa."
            );
        }

        return new LoginResponse(
                jwtService.gerarToken(usuario.getEmail())
        );
    }
}
