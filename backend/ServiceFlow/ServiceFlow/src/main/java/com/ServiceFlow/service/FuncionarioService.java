package com.ServiceFlow.service;

import com.ServiceFlow.dto.FuncionarioEquipeResponse;
import com.ServiceFlow.dto.FuncionarioResponse;
import com.ServiceFlow.dto.MensagemResponse;
import com.ServiceFlow.dto.SolicitacaoFuncionarioRequest;
import com.ServiceFlow.model.Cargo;
import com.ServiceFlow.model.Empresa;
import com.ServiceFlow.model.StatusUsuario;
import com.ServiceFlow.model.Usuario;
import com.ServiceFlow.repository.EmpresaRepository;
import com.ServiceFlow.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FuncionarioService {

    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final PasswordEncoder passwordEncoder;

    public FuncionarioService(
            UsuarioRepository usuarioRepository,
            EmpresaRepository empresaRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public MensagemResponse solicitarEntrada(
            SolicitacaoFuncionarioRequest request
    ) {

        if (
                request.getNome() == null ||
                request.getNome().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "O nome é obrigatório."
            );
        }

        if (
                request.getEmail() == null ||
                request.getEmail().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "O e-mail é obrigatório."
            );
        }

        if (
                request.getSenha() == null ||
                request.getSenha().length() < 6
        ) {
            throw new IllegalArgumentException(
                    "A senha deve possuir pelo menos 6 caracteres."
            );
        }

        if (request.getEmpresaId() == null) {
            throw new IllegalArgumentException(
                    "A empresa é obrigatória."
            );
        }

        if (
                request.getCargo() == null ||
                request.getCargo() == Cargo.ADMIN
        ) {
            throw new IllegalArgumentException(
                    "O cargo deve ser TECNICO ou ATENDENTE."
            );
        }

        String emailNormalizado =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        if (
                usuarioRepository.existsByEmail(
                        emailNormalizado
                )
        ) {
            throw new IllegalArgumentException(
                    "Já existe um usuário cadastrado com este e-mail."
            );
        }

        Empresa empresa = empresaRepository
                .findById(request.getEmpresaId())
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Empresa não encontrada."
                        )
                );

        Usuario funcionario = new Usuario();

        funcionario.setNome(
                request.getNome().trim()
        );

        funcionario.setEmail(
                emailNormalizado
        );

        funcionario.setSenha(
                passwordEncoder.encode(
                        request.getSenha()
                )
        );

        funcionario.setCargo(
                request.getCargo()
        );

        funcionario.setStatus(
                StatusUsuario.PENDENTE
        );

        funcionario.setEmpresa(
                empresa
        );

        usuarioRepository.save(
                funcionario
        );

        return new MensagemResponse(
                "Solicitação enviada. Aguarde a aprovação do administrador."
        );
    }

    @Transactional(readOnly = true)
    public List<FuncionarioResponse> listarPendentes(
            Authentication authentication
    ) {

        Usuario administrador =
                buscarAdministradorAutenticado(
                        authentication
                );

        return usuarioRepository
                .findByEmpresaIdAndStatus(
                        administrador
                                .getEmpresa()
                                .getId(),
                        StatusUsuario.PENDENTE
                )
                .stream()
                .map(this::converterParaResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<FuncionarioEquipeResponse> listarFuncionarios(
            int pagina,
            int tamanho,
            Authentication authentication
    ) {

        Usuario administrador =
                buscarAdministradorAutenticado(
                        authentication
                );

        validarPaginacao(
                pagina,
                tamanho
        );

        Pageable pageable = PageRequest.of(
                pagina,
                tamanho,
                Sort.by("nome").ascending()
        );

        Page<Usuario> funcionarios =
                usuarioRepository
                        .findByEmpresaIdAndCargoNot(
                                administrador
                                        .getEmpresa()
                                        .getId(),
                                Cargo.ADMIN,
                                pageable
                        );

        return funcionarios.map(
                this::converterParaEquipeResponse
        );
    }

    @Transactional
    public MensagemResponse aprovar(
            Long funcionarioId,
            Authentication authentication
    ) {

        Usuario administrador =
                buscarAdministradorAutenticado(
                        authentication
                );

        Usuario funcionario =
                buscarFuncionarioDaEmpresa(
                        funcionarioId,
                        administrador
                );

        if (
                funcionario.getStatus() !=
                StatusUsuario.PENDENTE
        ) {
            throw new IllegalArgumentException(
                    "Este usuário não possui uma solicitação pendente."
            );
        }

        funcionario.setStatus(
                StatusUsuario.ATIVO
        );

        usuarioRepository.save(
                funcionario
        );

        return new MensagemResponse(
                "Funcionário aprovado com sucesso."
        );
    }

    @Transactional
    public MensagemResponse rejeitar(
            Long funcionarioId,
            Authentication authentication
    ) {

        Usuario administrador =
                buscarAdministradorAutenticado(
                        authentication
                );

        Usuario funcionario =
                buscarFuncionarioDaEmpresa(
                        funcionarioId,
                        administrador
                );

        if (
                funcionario.getStatus() !=
                StatusUsuario.PENDENTE
        ) {
            throw new IllegalArgumentException(
                    "Este usuário não possui uma solicitação pendente."
            );
        }

        funcionario.setStatus(
                StatusUsuario.REJEITADO
        );

        usuarioRepository.save(
                funcionario
        );

        return new MensagemResponse(
                "Solicitação rejeitada."
        );
    }

    @Transactional
    public MensagemResponse inativar(
            Long funcionarioId,
            Authentication authentication
    ) {

        Usuario administrador =
                buscarAdministradorAutenticado(
                        authentication
                );

        Usuario funcionario =
                buscarFuncionarioDaEmpresa(
                        funcionarioId,
                        administrador
                );

        if (
                funcionario.getStatus() ==
                StatusUsuario.INATIVO
        ) {
            throw new IllegalArgumentException(
                    "Este funcionário já está inativo."
            );
        }

        if (
                funcionario.getStatus() ==
                StatusUsuario.PENDENTE
        ) {
            throw new IllegalArgumentException(
                    "Uma solicitação pendente deve ser aprovada ou rejeitada."
            );
        }

        if (
                funcionario.getStatus() ==
                StatusUsuario.REJEITADO
        ) {
            throw new IllegalArgumentException(
                    "Um usuário rejeitado não pode ser inativado."
            );
        }

        funcionario.setStatus(
                StatusUsuario.INATIVO
        );

        usuarioRepository.save(
                funcionario
        );

        return new MensagemResponse(
                "Funcionário inativado com sucesso."
        );
    }

    @Transactional
    public MensagemResponse reativar(
            Long funcionarioId,
            Authentication authentication
    ) {

        Usuario administrador =
                buscarAdministradorAutenticado(
                        authentication
                );

        Usuario funcionario =
                buscarFuncionarioDaEmpresa(
                        funcionarioId,
                        administrador
                );

        if (
                funcionario.getStatus() !=
                StatusUsuario.INATIVO
        ) {
            throw new IllegalArgumentException(
                    "Somente funcionários inativos podem ser reativados."
            );
        }

        funcionario.setStatus(
                StatusUsuario.ATIVO
        );

        usuarioRepository.save(
                funcionario
        );

        return new MensagemResponse(
                "Funcionário reativado com sucesso."
        );
    }

    private Usuario buscarAdministradorAutenticado(
            Authentication authentication
    ) {

        if (
                authentication == null ||
                authentication.getName() == null ||
                authentication.getName().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Usuário não autenticado."
            );
        }

        Usuario usuario = usuarioRepository
                .findByEmail(
                        authentication.getName()
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Usuário autenticado não encontrado."
                        )
                );

        if (
                usuario.getCargo() !=
                Cargo.ADMIN
        ) {
            throw new IllegalArgumentException(
                    "Somente administradores podem realizar esta operação."
            );
        }

        if (
                usuario.getStatus() !=
                StatusUsuario.ATIVO
        ) {
            throw new IllegalArgumentException(
                    "O administrador não está ativo."
            );
        }

        if (usuario.getEmpresa() == null) {
            throw new IllegalArgumentException(
                    "O administrador não está vinculado a uma empresa."
            );
        }

        return usuario;
    }

    private Usuario buscarFuncionarioDaEmpresa(
            Long funcionarioId,
            Usuario administrador
    ) {

        Usuario funcionario = usuarioRepository
                .findByIdAndEmpresaId(
                        funcionarioId,
                        administrador
                                .getEmpresa()
                                .getId()
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Funcionário não encontrado."
                        )
                );

        if (
                funcionario.getCargo() ==
                Cargo.ADMIN
        ) {
            throw new IllegalArgumentException(
                    "Esta operação não pode ser realizada em um administrador."
            );
        }

        return funcionario;
    }

    private FuncionarioEquipeResponse converterParaEquipeResponse(
            Usuario usuario
    ) {

        return new FuncionarioEquipeResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCargo(),
                usuario.getStatus()
        );
    }

    private FuncionarioResponse converterParaResponse(
            Usuario usuario
    ) {

        return new FuncionarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCargo(),
                usuario.getStatus(),
                usuario.getEmpresa().getId(),
                usuario.getEmpresa().getNome()
        );
    }

    private void validarPaginacao(
            int pagina,
            int tamanho
    ) {

        if (pagina < 0) {
            throw new IllegalArgumentException(
                    "A página não pode ser negativa."
            );
        }

        if (
                tamanho < 1 ||
                tamanho > 100
        ) {
            throw new IllegalArgumentException(
                    "O tamanho da página deve estar entre 1 e 100."
            );
        }
    }
}