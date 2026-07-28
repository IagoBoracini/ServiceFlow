package com.serviceflow.repository;

import com.serviceflow.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByDocumentoAndEmpresaId(
            String documento,
            Long empresaId
    );

    List<Cliente> findByEmpresaIdOrderByNomeAsc(
            Long empresaId
    );

    Optional<Cliente> findByIdAndEmpresaId(
            Long clienteId,
            Long empresaId
    );

    List<Cliente> findByEmpresaIdAndNomeContainingIgnoreCaseOrderByNomeAsc(
            Long empresaId,
            String nome
    );
}