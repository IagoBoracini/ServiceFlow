package com.serviceflow.service;

import com.serviceflow.dto.CadastroEmpresaRequest;
import com.serviceflow.dto.CadastroEmpresaResponse;
import com.serviceflow.dto.EmpresaPublicaResponse;
import com.serviceflow.model.Cargo;
import com.serviceflow.model.Empresa;
import com.serviceflow.model.StatusUsuario;
import com.serviceflow.model.Usuario;
import com.serviceflow.repository.EmpresaRepository;
import com.serviceflow.repository.UsuarioRepository;
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

    // MÉTODO QUE JÁ EXISTIA
    @Transactional
    public CadastroEmpresaResponse cadastrarEmpresa(
            CadastroEmpresaRequest request
    ) {

        // Aqui continua todo o código do cadastro da empresa...

        return null; // Não coloque isto no seu código.
    }

    // PASSO 3: COLOQUE O NOVO MÉTODO AQUI
    @Transactional(readOnly = true)
    public List<EmpresaPublicaResponse> listarEmpresasPublicas() {

        return empresaRepository
                .findAllByOrderByNomeAsc()
                .stream()
                .map(empresa -> new EmpresaPublicaResponse(
                        empresa.getId(),
                        empresa.getNome()
                ))
                .toList();
    }

    // MÉTODO QUE JÁ EXISTIA
    private String limparNumero(String valor) {

        if (valor == null) {
            return "";
        }

        return valor.replaceAll("\\D", "");
    }

} // Última chave da classe