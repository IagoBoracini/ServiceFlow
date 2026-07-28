package com.serviceflow.repository;

import com.serviceflow.model.Chamado;
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
}