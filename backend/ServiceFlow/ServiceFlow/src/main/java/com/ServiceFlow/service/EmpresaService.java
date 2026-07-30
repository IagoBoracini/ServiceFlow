package com.ServiceFlow.service;

import com.ServiceFlow.dto.CadastroEmpresaRequest;
import com.ServiceFlow.dto.CadastroEmpresaResponse;
import com.ServiceFlow.dto.EmpresaPublicaResponse;
import com.ServiceFlow.model.Cargo;
import com.ServiceFlow.model.Empresa;
import com.ServiceFlow.model.StatusUsuario;
import com.ServiceFlow.model.Usuario;
import com.ServiceFlow.repository.EmpresaRepository;
import com.ServiceFlow.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public EmpresaService(
            EmpresaRepository empresaRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public CadastroEmpresaResponse cadastrarEmpresa(
            CadastroEmpresaRequest request
    ) {

        String cnpjLimpo = limparNumero(request.getCnpj());

        String telefoneLimpo =
                limparNumero(request.getTelefoneEmpresa());

        String emailEmpresa =
                request.getEmailEmpresa()
                        .trim()
                        .toLowerCase();

        String emailAdministrador =
                request.getEmailAdministrador()
                        .trim()
                        .toLowerCase();

        validarCnpj(cnpjLimpo);

        if (empresaRepository.existsByCnpj(cnpjLimpo)) {
            throw new IllegalArgumentException(
                    "Já existe uma empresa cadastrada com este CNPJ."
            );
        }

        if (usuarioRepository.existsByEmail(emailAdministrador)) {
            throw new IllegalArgumentException(
                    "Já existe um usuário cadastrado com este e-mail."
            );
        }

        Empresa empresa = new Empresa();

        empresa.setNome(
                request.getNomeEmpresa().trim()
        );

        empresa.setCnpj(cnpjLimpo);

        empresa.setTelefone(telefoneLimpo);

        empresa.setEmail(emailEmpresa);

        Empresa empresaSalva =
                empresaRepository.save(empresa);

        Usuario administrador = new Usuario();

        administrador.setNome(
                request.getNomeAdministrador().trim()
        );

        administrador.setEmail(emailAdministrador);

        administrador.setSenha(
                passwordEncoder.encode(
                        request.getSenhaAdministrador()
                )
        );

        administrador.setCargo(Cargo.ADMIN);

        administrador.setStatus(StatusUsuario.ATIVO);

        administrador.setEmpresa(empresaSalva);

        Usuario administradorSalvo =
                usuarioRepository.save(administrador);

        return new CadastroEmpresaResponse(
                empresaSalva.getId(),
                administradorSalvo.getId(),
                "Empresa e administrador cadastrados com sucesso."
        );
    }

    @Transactional(readOnly = true)
    public List<EmpresaPublicaResponse> listarEmpresasPublicas() {

        return empresaRepository
                .findAllByOrderByNomeAsc()
                .stream()
                .map(empresa ->
                        new EmpresaPublicaResponse(
                                empresa.getId(),
                                empresa.getNome()
                        )
                )
                .toList();
    }

    private void validarCnpj(String cnpj) {

        if (cnpj.length() != 14) {
            throw new IllegalArgumentException(
                    "O CNPJ deve possuir 14 números."
            );
        }
    }

    private String limparNumero(String valor) {

        if (valor == null) {
            return "";
        }

        return valor.replaceAll("\\D", "");
    }
}