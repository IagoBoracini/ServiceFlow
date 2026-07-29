package com.ServiceFlow.repository;

import com.ServiceFlow.model.OrdemServico;
import com.ServiceFlow.model.StatusOrdemServico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrdemServicoRepository
        extends JpaRepository<OrdemServico, Long> {

    boolean existsByChamadoId(
            Long chamadoId
    );

    boolean existsByNumero(
            String numero
    );

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

    Page<OrdemServico> findByEmpresaId(
            Long empresaId,
            Pageable pageable
    );

    Page<OrdemServico> findByEmpresaIdAndStatus(
            Long empresaId,
            StatusOrdemServico status,
            Pageable pageable
    );

    Page<OrdemServico> findByTecnicoId(
            Long tecnicoId,
            Pageable pageable
    );

    Page<OrdemServico> findByTecnicoIdAndStatus(
            Long tecnicoId,
            StatusOrdemServico status,
            Pageable pageable
    );
}