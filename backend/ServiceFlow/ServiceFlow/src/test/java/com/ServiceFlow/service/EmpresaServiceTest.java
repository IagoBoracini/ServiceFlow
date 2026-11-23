package com.ServiceFlow.service;

import com.ServiceFlow.dto.CadastroEmpresaRequest;
import com.ServiceFlow.model.Cargo;
import com.ServiceFlow.model.Empresa;
import com.ServiceFlow.model.StatusUsuario;
import com.ServiceFlow.model.Usuario;
import com.ServiceFlow.repository.EmpresaRepository;
import com.ServiceFlow.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpresaServiceTest {

    @Mock
    private EmpresaRepository empresaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private final PasswordEncoder encoder = new BCryptPasswordEncoder();

    private EmpresaService service;

    @BeforeEach
    void preparar() {
        service = new EmpresaService(
                empresaRepository, usuarioRepository, encoder, true);
    }

    private CadastroEmpresaRequest requisicao(String cnpj) {
        CadastroEmpresaRequest request = new CadastroEmpresaRequest();
        request.setNomeEmpresa("Oficina Exemplo");
        request.setCnpj(cnpj);
        request.setTelefoneEmpresa("(11) 99999-0000");
        request.setEmailEmpresa("Contato@Oficina.com");
        request.setNomeAdministrador("Ana");
        request.setEmailAdministrador("ANA@oficina.com");
        request.setSenhaAdministrador("senha123");
        return request;
    }

    @Test
    void deveCadastrarEmpresaComAdministradorAtivoESenhaCriptografada() {
        when(empresaRepository.existsByCnpj("11222333000181"))
                .thenReturn(false);
        when(usuarioRepository.existsByEmail("ana@oficina.com"))
                .thenReturn(false);
        when(empresaRepository.save(any(Empresa.class)))
                .thenAnswer(invocacao -> invocacao.getArgument(0));
        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocacao -> invocacao.getArgument(0));

        service.cadastrarEmpresa(requisicao("11.222.333/0001-81"));

        ArgumentCaptor<Usuario> captor =
                ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());

        Usuario admin = captor.getValue();
        assertEquals(Cargo.ADMIN, admin.getCargo());
        assertEquals(StatusUsuario.ATIVO, admin.getStatus());
        assertEquals("ana@oficina.com", admin.getEmail());
        assertNotEquals("senha123", admin.getSenha());
        assertTrue(encoder.matches("senha123", admin.getSenha()));
    }

    @Test
    void deveRecusarCnpjComDigitoVerificadorInvalido() {
        IllegalArgumentException erro = assertThrows(
                IllegalArgumentException.class,
                () -> service.cadastrarEmpresa(
                        requisicao("11222333000182")));

        assertEquals("O CNPJ informado é inválido.", erro.getMessage());
        verify(empresaRepository, never()).save(any());
    }

    @Test
    void deveRecusarCnpjJaCadastrado() {
        when(empresaRepository.existsByCnpj("11222333000181"))
                .thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> service.cadastrarEmpresa(
                        requisicao("11222333000181")));

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void deveRecusarEmailDeAdministradorJaCadastrado() {
        when(empresaRepository.existsByCnpj("11222333000181"))
                .thenReturn(false);
        when(usuarioRepository.existsByEmail("ana@oficina.com"))
                .thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> service.cadastrarEmpresa(
                        requisicao("11222333000181")));

        verify(empresaRepository, never()).save(any());
    }

    @Test
    void devePermitirDesligarAValidacaoDosDigitosPorConfiguracao() {
        EmpresaService semDigitos = new EmpresaService(
                empresaRepository, usuarioRepository, encoder, false);

        when(empresaRepository.existsByCnpj("12345678000100"))
                .thenReturn(false);
        when(usuarioRepository.existsByEmail("ana@oficina.com"))
                .thenReturn(false);
        when(empresaRepository.save(any(Empresa.class)))
                .thenAnswer(invocacao -> invocacao.getArgument(0));
        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocacao -> invocacao.getArgument(0));

        semDigitos.cadastrarEmpresa(requisicao("12345678000100"));

        verify(empresaRepository).save(any(Empresa.class));
    }
}
