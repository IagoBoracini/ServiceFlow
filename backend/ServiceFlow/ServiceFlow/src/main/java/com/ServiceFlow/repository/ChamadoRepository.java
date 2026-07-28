package com.serviceflow.repository;

import com.serviceflow.model.Chamado;
import com.serviceflow.model.PrioridadeChamado;
import com.serviceflow.model.StatusChamado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChamadoRepository
        extends JpaRepository<Chamado, Long> {

    List<Chamado> findByEmpresaIdOrderByDataAberturaDesc(
            Long empresaId
    );

    Optional<Chamado> findByIdAndEmpresaId(
            Long chamadoId,
            Long empresaId
    );

    List<Chamado> findByEmpresaIdAndStatusOrderByDataAberturaDesc(
            Long empresaId,
            StatusChamado status
    );

    List<Chamado> findByEmpresaIdAndPrioridadeOrderByDataAberturaDesc(
            Long empresaId,
            PrioridadeChamado prioridade
    );

    List<Chamado> findByEmpresaIdAndStatusAndPrioridadeOrderByDataAberturaDesc(
            Long empresaId,
            StatusChamado status,
            PrioridadeChamado prioridade
    );

    List<Chamado> findByTecnicoResponsavelIdOrderByDataAberturaDesc(
            Long tecnicoId
    );

    List<Chamado> findByTecnicoResponsavelIdAndStatusOrderByDataAberturaDesc(
            Long tecnicoId,
            StatusChamado status
    );

    List<Chamado> findByTecnicoResponsavelIdAndPrioridadeOrderByDataAberturaDesc(
            Long tecnicoId,
            PrioridadeChamado prioridade
    );

    List<Chamado> findByTecnicoResponsavelIdAndStatusAndPrioridadeOrderByDataAberturaDesc(
            Long tecnicoId,
            StatusChamado status,
            PrioridadeChamado prioridade
    );
}