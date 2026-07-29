package com.ServiceFlow.service;

import com.ServiceFlow.dto.ChamadoRequest;
import com.ServiceFlow.dto.ChamadoResponse;
import com.ServiceFlow.model.Cargo;
import com.ServiceFlow.model.Chamado;
import com.ServiceFlow.model.Cliente;
import com.ServiceFlow.model.PrioridadeChamado;
import com.ServiceFlow.model.StatusChamado;
import com.ServiceFlow.model.StatusUsuario;
import com.ServiceFlow.model.Usuario;
import com.ServiceFlow.repository.ChamadoRepository;
import com.ServiceFlow.repository.ClienteRepository;
import com.ServiceFlow.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ChamadoService {

    private final ChamadoRepository chamadoRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;

    public ChamadoService(
            ChamadoRepository chamadoRepository,
            ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.chamadoRepository = chamadoRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public ChamadoResponse cadastrar(
            ChamadoRequest request,
            Authentication authentication
    ) {

        Usuario usuarioAutenticado =
                buscarUsuarioAutenticado(authentication);

        Long empresaId =
                usuarioAutenticado.getEmpresa().getId();

        Cliente cliente = clienteRepository
                .findByIdAndEmpresaId(
                        request.getClienteId(),
                        empresaId
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Cliente não encontrado."
                        )
                );

        if (!cliente.isAtivo()) {
            throw new IllegalArgumentException(
                    "Não é possível abrir chamado para um cliente inativo."
            );
        }

        Usuario tecnicoResponsavel = null;

        if (request.getTecnicoResponsavelId() != null) {
            tecnicoResponsavel = buscarTecnicoDaEmpresa(
                    request.getTecnicoResponsavelId(),
                    empresaId
            );
        }

        Chamado chamado = new Chamado();

        chamado.setTitulo(request.getTitulo().trim());
        chamado.setDescricao(request.getDescricao().trim());
        chamado.setPrioridade(request.getPrioridade());
        chamado.setCliente(cliente);
        chamado.setEmpresa(usuarioAutenticado.getEmpresa());
        chamado.setAbertoPor(usuarioAutenticado);
        chamado.setTecnicoResponsavel(tecnicoResponsavel);

        Chamado chamadoSalvo =
                chamadoRepository.save(chamado);

        return converterParaResponse(chamadoSalvo);
    }

    @Transactional(readOnly = true)
    public Page<ChamadoResponse> listar(
            StatusChamado status,
            PrioridadeChamado prioridade,
            int pagina,
            int tamanho,
            Authentication authentication
    ) {

        Usuario usuario =
                buscarUsuarioAutenticado(authentication);

        validarPaginacao(pagina, tamanho);

        Pageable pageable = PageRequest.of(
                pagina,
                tamanho,
                Sort.by("dataAbertura").descending()
        );

        Page<Chamado> chamados;

        if (usuario.getCargo() == Cargo.TECNICO) {

            chamados = buscarChamadosDoTecnico(
                    usuario.getId(),
                    status,
                    prioridade,
                    pageable
            );

        } else {

            chamados = buscarChamadosDaEmpresa(
                    usuario.getEmpresa().getId(),
                    status,
                    prioridade,
                    pageable
            );
        }

        return chamados.map(this::converterParaResponse);
    }

    @Transactional(readOnly = true)
    public ChamadoResponse buscarPorId(
            Long chamadoId,
            Authentication authentication
    ) {

        Usuario usuario =
                buscarUsuarioAutenticado(authentication);

        Chamado chamado = chamadoRepository
                .findByIdAndEmpresaId(
                        chamadoId,
                        usuario.getEmpresa().getId()
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Chamado não encontrado."
                        )
                );

        if (usuario.getCargo() == Cargo.TECNICO) {

            if (
                    chamado.getTecnicoResponsavel() == null ||
                    !chamado.getTecnicoResponsavel()
                            .getId()
                            .equals(usuario.getId())
            ) {
                throw new IllegalStateException(
                        "Você não possui acesso a este chamado."
                );
            }
        }

        return converterParaResponse(chamado);
    }

    @Transactional
    public ChamadoResponse atualizar(
            Long chamadoId,
            ChamadoRequest request,
            Authentication authentication
    ) {

        Usuario usuario =
                buscarUsuarioAutenticado(authentication);

        Long empresaId =
                usuario.getEmpresa().getId();

        Chamado chamado = chamadoRepository
                .findByIdAndEmpresaId(
                        chamadoId,
                        empresaId
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Chamado não encontrado."
                        )
                );

        if (
                chamado.getStatus() == StatusChamado.CONCLUIDO ||
                chamado.getStatus() == StatusChamado.CANCELADO
        ) {
            throw new IllegalArgumentException(
                    "Não é possível editar um chamado concluído ou cancelado."
            );
        }

        Cliente cliente = clienteRepository
                .findByIdAndEmpresaId(
                        request.getClienteId(),
                        empresaId
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Cliente não encontrado."
                        )
                );

        if (!cliente.isAtivo()) {
            throw new IllegalArgumentException(
                    "O cliente selecionado está inativo."
            );
        }

        Usuario tecnico = null;

        if (request.getTecnicoResponsavelId() != null) {
            tecnico = buscarTecnicoDaEmpresa(
                    request.getTecnicoResponsavelId(),
                    empresaId
            );
        }

        chamado.setTitulo(request.getTitulo().trim());
        chamado.setDescricao(request.getDescricao().trim());
        chamado.setPrioridade(request.getPrioridade());
        chamado.setCliente(cliente);
        chamado.setTecnicoResponsavel(tecnico);

        Chamado chamadoAtualizado =
                chamadoRepository.save(chamado);

        return converterParaResponse(chamadoAtualizado);
    }

    @Transactional
    public ChamadoResponse atribuirTecnico(
            Long chamadoId,
            Long tecnicoId,
            Authentication authentication
    ) {

        Usuario usuario =
                buscarUsuarioAutenticado(authentication);

        Long empresaId =
                usuario.getEmpresa().getId();

        Chamado chamado = chamadoRepository
                .findByIdAndEmpresaId(
                        chamadoId,
                        empresaId
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Chamado não encontrado."
                        )
                );

        if (
                chamado.getStatus() == StatusChamado.CONCLUIDO ||
                chamado.getStatus() == StatusChamado.CANCELADO
        ) {
            throw new IllegalArgumentException(
                    "Não é possível atribuir técnico a um chamado finalizado."
            );
        }

        Usuario tecnico =
                buscarTecnicoDaEmpresa(
                        tecnicoId,
                        empresaId
                );

        chamado.setTecnicoResponsavel(tecnico);

        if (chamado.getStatus() == StatusChamado.ABERTO) {
            chamado.setStatus(StatusChamado.EM_ANDAMENTO);
        }

        Chamado chamadoAtualizado =
                chamadoRepository.save(chamado);

        return converterParaResponse(chamadoAtualizado);
    }

    @Transactional
    public ChamadoResponse alterarPrioridade(
            Long chamadoId,
            PrioridadeChamado prioridade,
            Authentication authentication
    ) {

        Chamado chamado =
                buscarChamadoDaEmpresa(
                        chamadoId,
                        authentication
                );

        if (
                chamado.getStatus() == StatusChamado.CONCLUIDO ||
                chamado.getStatus() == StatusChamado.CANCELADO
        ) {
            throw new IllegalArgumentException(
                    "Não é possível alterar a prioridade de um chamado finalizado."
            );
        }

        chamado.setPrioridade(prioridade);

        Chamado chamadoAtualizado =
                chamadoRepository.save(chamado);

        return converterParaResponse(chamadoAtualizado);
    }

    @Transactional
    public ChamadoResponse alterarStatus(
            Long chamadoId,
            StatusChamado novoStatus,
            Authentication authentication
    ) {

        Usuario usuario =
                buscarUsuarioAutenticado(authentication);

        Chamado chamado = chamadoRepository
                .findByIdAndEmpresaId(
                        chamadoId,
                        usuario.getEmpresa().getId()
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Chamado não encontrado."
                        )
                );

        if (usuario.getCargo() == Cargo.TECNICO) {

            if (
                    chamado.getTecnicoResponsavel() == null ||
                    !chamado.getTecnicoResponsavel()
                            .getId()
                            .equals(usuario.getId())
            ) {
                throw new IllegalStateException(
                        "Você só pode alterar seus próprios chamados."
                );
            }

            if (
                    novoStatus == StatusChamado.CANCELADO ||
                    novoStatus == StatusChamado.ABERTO
            ) {
                throw new IllegalStateException(
                        "O técnico não possui permissão para definir este status."
                );
            }
        }

        if (chamado.getStatus() == StatusChamado.CANCELADO) {
            throw new IllegalArgumentException(
                    "Um chamado cancelado não pode ter o status alterado."
            );
        }

        if (chamado.getStatus() == StatusChamado.CONCLUIDO) {
            throw new IllegalArgumentException(
                    "Um chamado concluído não pode ter o status alterado."
            );
        }

        if (
                novoStatus == StatusChamado.EM_ANDAMENTO &&
                chamado.getTecnicoResponsavel() == null
        ) {
            throw new IllegalArgumentException(
                    "Defina um técnico antes de iniciar o chamado."
            );
        }

        chamado.setStatus(novoStatus);

        if (novoStatus == StatusChamado.CONCLUIDO) {
            chamado.setDataConclusao(LocalDateTime.now());
        } else {
            chamado.setDataConclusao(null);
        }

        Chamado chamadoAtualizado =
                chamadoRepository.save(chamado);

        return converterParaResponse(chamadoAtualizado);
    }

    private Page<Chamado> buscarChamadosDaEmpresa(
            Long empresaId,
            StatusChamado status,
            PrioridadeChamado prioridade,
            Pageable pageable
    ) {

        if (status != null && prioridade != null) {
            return chamadoRepository
                    .findByEmpresaIdAndStatusAndPrioridade(
                            empresaId,
                            status,
                            prioridade,
                            pageable
                    );
        }

        if (status != null) {
            return chamadoRepository
                    .findByEmpresaIdAndStatus(
                            empresaId,
                            status,
                            pageable
                    );
        }

        if (prioridade != null) {
            return chamadoRepository
                    .findByEmpresaIdAndPrioridade(
                            empresaId,
                            prioridade,
                            pageable
                    );
        }

        return chamadoRepository.findByEmpresaId(
                empresaId,
                pageable
        );
    }

    private Page<Chamado> buscarChamadosDoTecnico(
            Long tecnicoId,
            StatusChamado status,
            PrioridadeChamado prioridade,
            Pageable pageable
    ) {

        if (status != null && prioridade != null) {
            return chamadoRepository
                    .findByTecnicoResponsavelIdAndStatusAndPrioridade(
                            tecnicoId,
                            status,
                            prioridade,
                            pageable
                    );
        }

        if (status != null) {
            return chamadoRepository
                    .findByTecnicoResponsavelIdAndStatus(
                            tecnicoId,
                            status,
                            pageable
                    );
        }

        if (prioridade != null) {
            return chamadoRepository
                    .findByTecnicoResponsavelIdAndPrioridade(
                            tecnicoId,
                            prioridade,
                            pageable
                    );
        }

        return chamadoRepository
                .findByTecnicoResponsavelId(
                        tecnicoId,
                        pageable
                );
    }

    private Chamado buscarChamadoDaEmpresa(
            Long chamadoId,
            Authentication authentication
    ) {

        Usuario usuarioAutenticado =
                buscarUsuarioAutenticado(authentication);

        return chamadoRepository
                .findByIdAndEmpresaId(
                        chamadoId,
                        usuarioAutenticado.getEmpresa().getId()
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Chamado não encontrado."
                        )
                );
    }

    private Usuario buscarTecnicoDaEmpresa(
            Long tecnicoId,
            Long empresaId
    ) {

        Usuario tecnico = usuarioRepository
                .findByIdAndEmpresaId(
                        tecnicoId,
                        empresaId
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Técnico responsável não encontrado."
                        )
                );

        if (tecnico.getCargo() != Cargo.TECNICO) {
            throw new IllegalArgumentException(
                    "O usuário selecionado não possui o cargo de técnico."
            );
        }

        if (tecnico.getStatus() != StatusUsuario.ATIVO) {
            throw new IllegalArgumentException(
                    "O técnico selecionado não está ativo."
            );
        }

        return tecnico;
    }

    private Usuario buscarUsuarioAutenticado(
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
                .findByEmail(authentication.getName())
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Usuário autenticado não encontrado."
                        )
                );

        if (usuario.getStatus() != StatusUsuario.ATIVO) {
            throw new IllegalStateException(
                    "Seu usuário não está ativo."
            );
        }

        if (usuario.getEmpresa() == null) {
            throw new IllegalStateException(
                    "Seu usuário não está vinculado a uma empresa."
            );
        }

        return usuario;
    }

    private ChamadoResponse converterParaResponse(
            Chamado chamado
    ) {

        Long tecnicoId = null;
        String tecnicoNome = null;

        if (chamado.getTecnicoResponsavel() != null) {
            tecnicoId =
                    chamado.getTecnicoResponsavel().getId();

            tecnicoNome =
                    chamado.getTecnicoResponsavel().getNome();
        }

        return new ChamadoResponse(
                chamado.getId(),
                chamado.getTitulo(),
                chamado.getDescricao(),
                chamado.getPrioridade(),
                chamado.getStatus(),
                chamado.getDataAbertura(),
                chamado.getDataConclusao(),
                chamado.getCliente().getId(),
                chamado.getCliente().getNome(),
                tecnicoId,
                tecnicoNome
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

        if (tamanho < 1 || tamanho > 100) {
            throw new IllegalArgumentException(
                    "O tamanho da página deve estar entre 1 e 100."
            );
        }
    }
}