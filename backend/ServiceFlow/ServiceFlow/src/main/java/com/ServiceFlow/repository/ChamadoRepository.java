package com.ServiceFlow.repository;

import com.ServiceFlow.model.Chamado;
import com.ServiceFlow.model.PrioridadeChamado;
import com.ServiceFlow.model.StatusChamado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChamadoRepository
        extends JpaRepository<Chamado, Long> {

    long countByEmpresaIdAndStatus(
            Long empresaId,
            StatusChamado status
    );

    long countByEmpresaIdAndPrioridade(
            Long empresaId,
            PrioridadeChamado prioridade
    );

    Optional<Chamado> findByIdAndEmpresaId(
            Long chamadoId,
            Long empresaId
    );

    List<Chamado> findTop5ByEmpresaIdOrderByDataAberturaDesc(
            Long empresaId
    );

    Page<Chamado> findByEmpresaId(
            Long empresaId,
            Pageable pageable
    );

    Page<Chamado> findByEmpresaIdAndStatus(
            Long empresaId,
            StatusChamado status,
            Pageable pageable
    );

    Page<Chamado> findByEmpresaIdAndPrioridade(
            Long empresaId,
            PrioridadeChamado prioridade,
            Pageable pageable
    );

    Page<Chamado> findByEmpresaIdAndStatusAndPrioridade(
            Long empresaId,
            StatusChamado status,
            PrioridadeChamado prioridade,
            Pageable pageable
    );

    Page<Chamado> findByTecnicoResponsavelId(
            Long tecnicoId,
            Pageable pageable
    );

    Page<Chamado> findByTecnicoResponsavelIdAndStatus(
            Long tecnicoId,
            StatusChamado status,
            Pageable pageable
    );

    Page<Chamado> findByTecnicoResponsavelIdAndPrioridade(
            Long tecnicoId,
            PrioridadeChamado prioridade,
            Pageable pageable
    );

    Page<Chamado> findByTecnicoResponsavelIdAndStatusAndPrioridade(
            Long tecnicoId,
            StatusChamado status,
            PrioridadeChamado prioridade,
            Pageable pageable
    );
}