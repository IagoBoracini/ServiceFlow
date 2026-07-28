package com.serviceflow.service;

import com.serviceflow.dto.DashboardResponse;
import com.serviceflow.model.Cargo;
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

        Usuario usuarioAutenticado =
                buscarUsuarioAutenticado(authentication);

        Long empresaId =
                usuarioAutenticado.getEmpresa().getId();

        long clientes =
                clienteRepository.countByEmpresaId(
                        empresaId
                );

        long funcionarios =
                usuarioRepository.countByEmpresaId(
                        empresaId
                );

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

        return new DashboardResponse(
                clientes,
                funcionarios,
                tecnicos,
                chamadosAbertos,
                chamadosEmAndamento,
                chamadosAguardandoCliente,
                chamadosConcluidos,
                chamadosCancelados,
                ordensAbertas,
                ordensEmExecucao,
                ordensFinalizadas,
                ordensCanceladas
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