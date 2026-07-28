package com.serviceflow.service;

import com.serviceflow.dto.ChamadoResumoDashboardResponse;
import com.serviceflow.dto.DashboardResponse;
import com.serviceflow.dto.OrdemServicoResumoDashboardResponse;
import com.serviceflow.model.Cargo;
import com.serviceflow.model.Chamado;
import com.serviceflow.model.OrdemServico;
import com.serviceflow.model.PrioridadeChamado;
import com.serviceflow.model.StatusChamado;
import com.serviceflow.model.StatusOrdemServico;
import com.serviceflow.model.StatusUsuario;
import com.serviceflow.model.Usuario;
import com.serviceflow.repository.ChamadoRepository;
import com.serviceflow.repository.ClienteRepository;
import com.serviceflow.repository.OrdemServicoRepository;
import com.serviceflow.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardService {

    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ChamadoRepository chamadoRepository;
    private final OrdemServicoRepository ordemServicoRepository;

    public DashboardService(
            ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository,
            ChamadoRepository chamadoRepository,
            OrdemServicoRepository ordemServicoRepository
    ) {
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.chamadoRepository = chamadoRepository;
        this.ordemServicoRepository = ordemServicoRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse buscarDashboard(
            Authentication authentication
    ) {

        Usuario usuario =
                buscarUsuarioAutenticado(authentication);

        Long empresaId =
                usuario.getEmpresa().getId();

        long clientes =
                clienteRepository.countByEmpresaId(empresaId);

        long funcionarios =
                usuarioRepository.countByEmpresaId(empresaId);

        long tecnicos =
                usuarioRepository.countByEmpresaIdAndCargo(
                        empresaId,
                        Cargo.TECNICO
                );

        long chamadosAbertos =
                chamadoRepository.countByEmpresaIdAndStatus(
                        empresaId,
                        StatusChamado.ABERTO
                );

        long chamadosEmAndamento =
                chamadoRepository.countByEmpresaIdAndStatus(
                        empresaId,
                        StatusChamado.EM_ANDAMENTO
                );

        long chamadosAguardandoCliente =
                chamadoRepository.countByEmpresaIdAndStatus(
                        empresaId,
                        StatusChamado.AGUARDANDO_CLIENTE
                );

        long chamadosConcluidos =
                chamadoRepository.countByEmpresaIdAndStatus(
                        empresaId,
                        StatusChamado.CONCLUIDO
                );

        long chamadosCancelados =
                chamadoRepository.countByEmpresaIdAndStatus(
                        empresaId,
                        StatusChamado.CANCELADO
                );

        long chamadosPrioridadeBaixa =
                chamadoRepository.countByEmpresaIdAndPrioridade(
                        empresaId,
                        PrioridadeChamado.BAIXA
                );

        long chamadosPrioridadeMedia =
                chamadoRepository.countByEmpresaIdAndPrioridade(
                        empresaId,
                        PrioridadeChamado.MEDIA
                );

        long chamadosPrioridadeAlta =
                chamadoRepository.countByEmpresaIdAndPrioridade(
                        empresaId,
                        PrioridadeChamado.ALTA
                );

        long chamadosPrioridadeUrgente =
                chamadoRepository.countByEmpresaIdAndPrioridade(
                        empresaId,
                        PrioridadeChamado.URGENTE
                );

        long ordensAbertas =
                ordemServicoRepository.countByEmpresaIdAndStatus(
                        empresaId,
                        StatusOrdemServico.ABERTA
                );

        long ordensEmExecucao =
                ordemServicoRepository.countByEmpresaIdAndStatus(
                        empresaId,
                        StatusOrdemServico.EM_EXECUCAO
                );

        long ordensFinalizadas =
                ordemServicoRepository.countByEmpresaIdAndStatus(
                        empresaId,
                        StatusOrdemServico.FINALIZADA
                );

        long ordensCanceladas =
                ordemServicoRepository.countByEmpresaIdAndStatus(
                        empresaId,
                        StatusOrdemServico.CANCELADA
                );

        List<ChamadoResumoDashboardResponse> ultimosChamados =
                chamadoRepository
                        .findTop5ByEmpresaIdOrderByDataAberturaDesc(
                                empresaId
                        )
                        .stream()
                        .map(this::converterChamado)
                        .toList();

        List<OrdemServicoResumoDashboardResponse> ultimasOrdens =
                ordemServicoRepository
                        .findTop5ByEmpresaIdOrderByDataCriacaoDesc(
                                empresaId
                        )
                        .stream()
                        .map(this::converterOrdemServico)
                        .toList();

        return new DashboardResponse(
                clientes,
                funcionarios,
                tecnicos,
                chamadosAbertos,
                chamadosEmAndamento,
                chamadosAguardandoCliente,
                chamadosConcluidos,
                chamadosCancelados,
                chamadosPrioridadeBaixa,
                chamadosPrioridadeMedia,
                chamadosPrioridadeAlta,
                chamadosPrioridadeUrgente,
                ordensAbertas,
                ordensEmExecucao,
                ordensFinalizadas,
                ordensCanceladas,
                ultimosChamados,
                ultimasOrdens
        );
    }

    private ChamadoResumoDashboardResponse converterChamado(
            Chamado chamado
    ) {

        String tecnicoNome = null;

        if (chamado.getTecnicoResponsavel() != null) {
            tecnicoNome =
                    chamado.getTecnicoResponsavel().getNome();
        }

        return new ChamadoResumoDashboardResponse(
                chamado.getId(),
                chamado.getTitulo(),
                chamado.getStatus(),
                chamado.getPrioridade(),
                chamado.getCliente().getNome(),
                tecnicoNome,
                chamado.getDataAbertura()
        );
    }

    private OrdemServicoResumoDashboardResponse converterOrdemServico(
            OrdemServico ordemServico
    ) {

        return new OrdemServicoResumoDashboardResponse(
                ordemServico.getId(),
                ordemServico.getNumero(),
                ordemServico.getStatus(),
                ordemServico.getChamado().getTitulo(),
                ordemServico.getChamado().getCliente().getNome(),
                ordemServico.getTecnico().getNome(),
                ordemServico.getDataCriacao()
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
                    "O usuário não está vinculado a uma empresa."
            );
        }

        return usuario;
    }
}