package com.ServiceFlow.service;

import com.ServiceFlow.dto.AtualizarOrdemServicoRequest;
import com.ServiceFlow.dto.OrdemServicoRequest;
import com.ServiceFlow.dto.OrdemServicoResponse;
import com.ServiceFlow.model.Cargo;
import com.ServiceFlow.model.Chamado;
import com.ServiceFlow.model.OrdemServico;
import com.ServiceFlow.model.StatusChamado;
import com.ServiceFlow.model.StatusOrdemServico;
import com.ServiceFlow.model.StatusUsuario;
import com.ServiceFlow.model.Usuario;
import com.ServiceFlow.repository.ChamadoRepository;
import com.ServiceFlow.repository.OrdemServicoRepository;
import com.ServiceFlow.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.UUID;

@Service
public class OrdemServicoService {

    private final OrdemServicoRepository ordemServicoRepository;
    private final ChamadoRepository chamadoRepository;
    private final UsuarioRepository usuarioRepository;

    public OrdemServicoService(
            OrdemServicoRepository ordemServicoRepository,
            ChamadoRepository chamadoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.ordemServicoRepository = ordemServicoRepository;
        this.chamadoRepository = chamadoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public OrdemServicoResponse criar(
            OrdemServicoRequest request,
            Authentication authentication
    ) {

        Usuario usuarioAutenticado =
                buscarUsuarioAutenticado(authentication);

        Long empresaId =
                usuarioAutenticado.getEmpresa().getId();

        Chamado chamado = chamadoRepository
                .findByIdAndEmpresaId(
                        request.getChamadoId(),
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
                    "Não é possível criar uma ordem para um chamado finalizado."
            );
        }

        if (chamado.getTecnicoResponsavel() == null) {
            throw new IllegalArgumentException(
                    "O chamado precisa possuir um técnico responsável."
            );
        }

        if (ordemServicoRepository.existsByChamadoId(
                chamado.getId()
        )) {
            throw new IllegalArgumentException(
                    "Este chamado já possui uma ordem de serviço."
            );
        }

        Usuario tecnico =
                chamado.getTecnicoResponsavel();

        if (tecnico.getStatus() != StatusUsuario.ATIVO) {
            throw new IllegalArgumentException(
                    "O técnico responsável pelo chamado não está ativo."
            );
        }

        OrdemServico ordemServico =
                new OrdemServico();

        ordemServico.setNumero(
                gerarNumero()
        );

        ordemServico.setEmpresa(
                usuarioAutenticado.getEmpresa()
        );

        ordemServico.setChamado(
                chamado
        );

        ordemServico.setTecnico(
                tecnico
        );

        ordemServico.setCriadoPor(
                usuarioAutenticado
        );

        OrdemServico ordemSalva =
                ordemServicoRepository.save(
                        ordemServico
                );

        if (chamado.getStatus() == StatusChamado.ABERTO) {

            chamado.setStatus(
                    StatusChamado.EM_ANDAMENTO
            );

            chamadoRepository.save(
                    chamado
            );
        }

        return converterParaResponse(
                ordemSalva
        );
    }

    @Transactional(readOnly = true)
    public Page<OrdemServicoResponse> listar(
            StatusOrdemServico status,
            int pagina,
            int tamanho,
            Authentication authentication
    ) {

        Usuario usuario =
                buscarUsuarioAutenticado(authentication);

        validarPaginacao(
                pagina,
                tamanho
        );

        Pageable pageable = PageRequest.of(
                pagina,
                tamanho,
                Sort.by("dataCriacao").descending()
        );

        Page<OrdemServico> ordens;

        if (usuario.getCargo() == Cargo.TECNICO) {

            ordens = buscarOrdensDoTecnico(
                    usuario.getId(),
                    status,
                    pageable
            );

        } else {

            ordens = buscarOrdensDaEmpresa(
                    usuario.getEmpresa().getId(),
                    status,
                    pageable
            );
        }

        return ordens.map(
                this::converterParaResponse
        );
    }

    @Transactional(readOnly = true)
    public OrdemServicoResponse buscarPorId(
            Long ordemId,
            Authentication authentication
    ) {

        Usuario usuario =
                buscarUsuarioAutenticado(authentication);

        OrdemServico ordemServico =
                buscarOrdemDaEmpresa(
                        ordemId,
                        usuario.getEmpresa().getId()
                );

        validarAcessoTecnico(
                ordemServico,
                usuario
        );

        return converterParaResponse(
                ordemServico
        );
    }

    @Transactional
    public OrdemServicoResponse atualizarAtendimento(
            Long ordemId,
            AtualizarOrdemServicoRequest request,
            Authentication authentication
    ) {

        Usuario usuario =
                buscarUsuarioAutenticado(authentication);

        OrdemServico ordemServico =
                buscarOrdemDaEmpresa(
                        ordemId,
                        usuario.getEmpresa().getId()
                );

        validarAcessoTecnico(
                ordemServico,
                usuario
        );

        if (
                ordemServico.getStatus() == StatusOrdemServico.FINALIZADA ||
                ordemServico.getStatus() == StatusOrdemServico.CANCELADA
        ) {
            throw new IllegalArgumentException(
                    "Não é possível alterar uma ordem finalizada ou cancelada."
            );
        }

        ordemServico.setDiagnostico(
                request.getDiagnostico().trim()
        );

        ordemServico.setServicoRealizado(
                request.getServicoRealizado().trim()
        );

        ordemServico.setObservacoes(
                normalizarTextoOpcional(
                        request.getObservacoes()
                )
        );

        OrdemServico ordemAtualizada =
                ordemServicoRepository.save(
                        ordemServico
                );

        return converterParaResponse(
                ordemAtualizada
        );
    }

    @Transactional
    public OrdemServicoResponse alterarStatus(
            Long ordemId,
            StatusOrdemServico novoStatus,
            Authentication authentication
    ) {

        Usuario usuario =
                buscarUsuarioAutenticado(authentication);

        OrdemServico ordemServico =
                buscarOrdemDaEmpresa(
                        ordemId,
                        usuario.getEmpresa().getId()
                );

        validarAcessoTecnico(
                ordemServico,
                usuario
        );

        validarAlteracaoStatus(
                ordemServico,
                novoStatus,
                usuario
        );

        if (novoStatus == StatusOrdemServico.EM_EXECUCAO) {

            ordemServico.setStatus(
                    StatusOrdemServico.EM_EXECUCAO
            );

            if (ordemServico.getDataInicio() == null) {

                ordemServico.setDataInicio(
                        LocalDateTime.now()
                );
            }
        }

        if (novoStatus == StatusOrdemServico.FINALIZADA) {

            validarDadosParaFinalizacao(
                    ordemServico
            );

            ordemServico.setStatus(
                    StatusOrdemServico.FINALIZADA
            );

            ordemServico.setDataFinalizacao(
                    LocalDateTime.now()
            );

            Chamado chamado =
                    ordemServico.getChamado();

            chamado.setStatus(
                    StatusChamado.CONCLUIDO
            );

            chamado.setDataConclusao(
                    LocalDateTime.now()
            );

            chamadoRepository.save(
                    chamado
            );
        }

        if (novoStatus == StatusOrdemServico.CANCELADA) {

            ordemServico.setStatus(
                    StatusOrdemServico.CANCELADA
            );

            ordemServico.setDataFinalizacao(
                    null
            );

            Chamado chamado =
                    ordemServico.getChamado();

            if (chamado.getStatus() != StatusChamado.CANCELADO) {

                chamado.setStatus(
                        StatusChamado.ABERTO
                );

                chamado.setDataConclusao(
                        null
                );
            }

            chamadoRepository.save(
                    chamado
            );
        }

        if (novoStatus == StatusOrdemServico.ABERTA) {

            ordemServico.setStatus(
                    StatusOrdemServico.ABERTA
            );

            ordemServico.setDataInicio(
                    null
            );

            ordemServico.setDataFinalizacao(
                    null
            );
        }

        OrdemServico ordemAtualizada =
                ordemServicoRepository.save(
                        ordemServico
                );

        return converterParaResponse(
                ordemAtualizada
        );
    }

    private Page<OrdemServico> buscarOrdensDaEmpresa(
            Long empresaId,
            StatusOrdemServico status,
            Pageable pageable
    ) {

        if (status != null) {

            return ordemServicoRepository
                    .findByEmpresaIdAndStatus(
                            empresaId,
                            status,
                            pageable
                    );
        }

        return ordemServicoRepository
                .findByEmpresaId(
                        empresaId,
                        pageable
                );
    }

    private Page<OrdemServico> buscarOrdensDoTecnico(
            Long tecnicoId,
            StatusOrdemServico status,
            Pageable pageable
    ) {

        if (status != null) {

            return ordemServicoRepository
                    .findByTecnicoIdAndStatus(
                            tecnicoId,
                            status,
                            pageable
                    );
        }

        return ordemServicoRepository
                .findByTecnicoId(
                        tecnicoId,
                        pageable
                );
    }

    private void validarAlteracaoStatus(
            OrdemServico ordemServico,
            StatusOrdemServico novoStatus,
            Usuario usuario
    ) {

        if (novoStatus == null) {
            throw new IllegalArgumentException(
                    "O novo status é obrigatório."
            );
        }

        StatusOrdemServico statusAtual =
                ordemServico.getStatus();

        if (statusAtual == StatusOrdemServico.CANCELADA) {
            throw new IllegalArgumentException(
                    "Uma ordem cancelada não pode ter o status alterado."
            );
        }

        if (statusAtual == StatusOrdemServico.FINALIZADA) {
            throw new IllegalArgumentException(
                    "Uma ordem finalizada não pode ter o status alterado."
            );
        }

        if (
                usuario.getCargo() == Cargo.TECNICO &&
                (
                        novoStatus == StatusOrdemServico.CANCELADA ||
                        novoStatus == StatusOrdemServico.ABERTA
                )
        ) {
            throw new IllegalStateException(
                    "O técnico não possui permissão para definir este status."
            );
        }

        if (
                novoStatus == StatusOrdemServico.FINALIZADA &&
                statusAtual != StatusOrdemServico.EM_EXECUCAO
        ) {
            throw new IllegalArgumentException(
                    "A ordem precisa estar em execução antes de ser finalizada."
            );
        }

        if (
                novoStatus == StatusOrdemServico.EM_EXECUCAO &&
                statusAtual != StatusOrdemServico.ABERTA
        ) {
            throw new IllegalArgumentException(
                    "Somente uma ordem aberta pode ser iniciada."
            );
        }
    }

    private void validarDadosParaFinalizacao(
            OrdemServico ordemServico
    ) {

        if (
                ordemServico.getDiagnostico() == null ||
                ordemServico.getDiagnostico().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Informe o diagnóstico antes de finalizar a ordem."
            );
        }

        if (
                ordemServico.getServicoRealizado() == null ||
                ordemServico.getServicoRealizado().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Informe o serviço realizado antes de finalizar a ordem."
            );
        }
    }

    private void validarAcessoTecnico(
            OrdemServico ordemServico,
            Usuario usuario
    ) {

        if (usuario.getCargo() != Cargo.TECNICO) {
            return;
        }

        if (
                ordemServico.getTecnico() == null ||
                !ordemServico.getTecnico()
                        .getId()
                        .equals(usuario.getId())
        ) {
            throw new IllegalStateException(
                    "Você não possui acesso a esta ordem de serviço."
            );
        }
    }

    private OrdemServico buscarOrdemDaEmpresa(
            Long ordemId,
            Long empresaId
    ) {

        return ordemServicoRepository
                .findByIdAndEmpresaId(
                        ordemId,
                        empresaId
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Ordem de serviço não encontrada."
                        )
                );
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
                .findByEmail(
                        authentication.getName()
                )
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
                    "O usuário não está vinculado a uma empresa."
            );
        }

        return usuario;
    }

    private String gerarNumero() {

        String ano =
                String.valueOf(
                        Year.now().getValue()
                );

        String numero;

        do {

            String codigo = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase();

            numero =
                    "OS-" + ano + "-" + codigo;

        } while (
                ordemServicoRepository.existsByNumero(
                        numero
                )
        );

        return numero;
    }

    private String normalizarTextoOpcional(
            String texto
    ) {

        if (texto == null || texto.isBlank()) {
            return null;
        }

        return texto.trim();
    }

    private OrdemServicoResponse converterParaResponse(
            OrdemServico ordemServico
    ) {

        Chamado chamado =
                ordemServico.getChamado();

        Long tecnicoId = null;
        String tecnicoNome = null;

        if (ordemServico.getTecnico() != null) {

            tecnicoId =
                    ordemServico.getTecnico().getId();

            tecnicoNome =
                    ordemServico.getTecnico().getNome();
        }

        return new OrdemServicoResponse(
                ordemServico.getId(),
                ordemServico.getNumero(),
                ordemServico.getStatus(),
                ordemServico.getDiagnostico(),
                ordemServico.getServicoRealizado(),
                ordemServico.getObservacoes(),
                ordemServico.getDataCriacao(),
                ordemServico.getDataInicio(),
                ordemServico.getDataFinalizacao(),
                chamado.getId(),
                chamado.getTitulo(),
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