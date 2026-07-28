package com.serviceflow.repository;

import com.serviceflow.model.OrdemServico;
import com.serviceflow.model.StatusOrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrdemServicoRepository
        extends JpaRepository<OrdemServico, Long> {

    boolean existsByChamadoId(Long chamadoId);

    boolean existsByNumero(String numero);

    long countByEmpresaIdAndStatus(
            Long empresaId,
            StatusOrdemServico status
    );

    Optional<OrdemServico> findByIdAndEmpresaId(
            Long ordemServicoId,
            Long empresaId
    );

    List<OrdemServico> findTop5ByEmpresaIdOrderByDataCriacaoDesc(
            Long empresaId
    );

    List<OrdemServico> findByEmpresaIdOrderByDataCriacaoDesc(
            Long empresaId
    );

    List<OrdemServico> findByEmpresaIdAndStatusOrderByDataCriacaoDesc(
            Long empresaId,
            StatusOrdemServico status
    );

    List<OrdemServico> findByTecnicoIdOrderByDataCriacaoDesc(
            Long tecnicoId
    );

    List<OrdemServico> findByTecnicoIdAndStatusOrderByDataCriacaoDesc(
            Long tecnicoId,
            StatusOrdemServico status
    );
}