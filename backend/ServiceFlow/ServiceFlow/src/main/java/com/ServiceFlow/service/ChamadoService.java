package com.serviceflow.service;

import com.serviceflow.dto.ChamadoRequest;
import com.serviceflow.dto.ChamadoResponse;
import com.serviceflow.model.Cargo;
import com.serviceflow.model.Chamado;
import com.serviceflow.model.Cliente;
import com.serviceflow.model.PrioridadeChamado;
import com.serviceflow.model.StatusChamado;
import com.serviceflow.model.StatusUsuario;
import com.serviceflow.model.Usuario;
import com.serviceflow.repository.ChamadoRepository;
import com.serviceflow.repository.ClienteRepository;
import com.serviceflow.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

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
            tecnicoResponsavel =
                    buscarTecnicoDaEmpresa(
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
    public List<ChamadoResponse> listar(
            Authentication authentication
    ) {

        Usuario usuarioAutenticado =
                buscarUsuarioAutenticado(authentication);

        return chamadoRepository
                .findByEmpresaIdOrderByDataAberturaDesc(
                        usuarioAutenticado.getEmpresa().getId()
                )
                .stream()
                .map(this::converterParaResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChamadoResponse buscarPorId(
            Long chamadoId,
            Authentication authentication
    ) {

        Chamado chamado =
                buscarChamadoDaEmpresa(
                        chamadoId,
                        authentication
                );

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

        Long empresaId = usuario.getEmpresa().getId();

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

        Long empresaId = usuario.getEmpresa().getId();

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

        Chamado chamado =
                buscarChamadoDaEmpresa(
                        chamadoId,
                        authentication
                );

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
                .findById(tecnicoId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Técnico responsável não encontrado."
                        )
                );

        if (
                tecnico.getEmpresa() == null ||
                !tecnico.getEmpresa().getId().equals(empresaId)
        ) {
            throw new IllegalArgumentException(
                    "O técnico não pertence à mesma empresa."
            );
        }

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
                authentication.getName() == null
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
}