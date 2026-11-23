package com.ServiceFlow.service;

import com.ServiceFlow.dto.LoginRequest;
import com.ServiceFlow.dto.LoginResponse;
import com.ServiceFlow.exception.CredenciaisInvalidasException;
import com.ServiceFlow.model.StatusUsuario;
import com.ServiceFlow.model.Usuario;
import com.ServiceFlow.repository.UsuarioRepository;
import com.ServiceFlow.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String SENHA = "senha123";

    @Mock
    private UsuarioRepository repository;

    @Mock
    private JwtService jwtService;

    private final PasswordEncoder encoder = new BCryptPasswordEncoder();

    private AuthService service;

    @BeforeEach
    void preparar() {
        service = new AuthService(repository, encoder, jwtService);
    }

    private LoginRequest requisicao(String email, String senha) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setSenha(senha);
        return request;
    }

    private Usuario usuario(StatusUsuario status) {
        Usuario usuario = new Usuario();
        usuario.setEmail("ana@empresa.com");
        usuario.setSenha(encoder.encode(SENHA));
        usuario.setStatus(status);
        return usuario;
    }

    @Test
    void deveRetornarTokenQuandoCredenciaisEstaoCorretas() {
        when(repository.findByEmail("ana@empresa.com"))
                .thenReturn(Optional.of(usuario(StatusUsuario.ATIVO)));
        when(jwtService.gerarToken("ana@empresa.com"))
                .thenReturn("token-gerado");

        LoginResponse resposta =
                service.login(requisicao("  ANA@empresa.com ", SENHA));

        assertEquals("token-gerado", resposta.getToken());
    }

    @Test
    void deveRecusarSenhaIncorreta() {
        when(repository.findByEmail("ana@empresa.com"))
                .thenReturn(Optional.of(usuario(StatusUsuario.ATIVO)));

        assertThrows(CredenciaisInvalidasException.class,
                () -> service.login(requisicao("ana@empresa.com", "errada")));
    }

    @Test
    void deveRecusarEmailInexistenteComAMesmaExcecaoDaSenhaErrada() {
        when(repository.findByEmail("nao@existe.com"))
                .thenReturn(Optional.empty());

        assertThrows(CredenciaisInvalidasException.class,
                () -> service.login(requisicao("nao@existe.com", SENHA)));
    }

    @Test
    void naoDeveRevelarStatusDaContaParaQuemErraASenha() {
        when(repository.findByEmail("ana@empresa.com"))
                .thenReturn(Optional.of(usuario(StatusUsuario.PENDENTE)));

        assertThrows(CredenciaisInvalidasException.class,
                () -> service.login(requisicao("ana@empresa.com", "errada")));
    }

    @Test
    void deveBloquearContaPendenteRejeitadaOuInativaComSenhaCorreta() {
        for (StatusUsuario status : new StatusUsuario[]{
                StatusUsuario.PENDENTE,
                StatusUsuario.REJEITADO,
                StatusUsuario.INATIVO}) {

            when(repository.findByEmail("ana@empresa.com"))
                    .thenReturn(Optional.of(usuario(status)));

            assertThrows(IllegalStateException.class,
                    () -> service.login(
                            requisicao("ana@empresa.com", SENHA)));
        }
    }
}
