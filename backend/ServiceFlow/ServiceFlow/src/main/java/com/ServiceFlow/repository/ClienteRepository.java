package com.serviceflow.repository;

import com.serviceflow.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClienteRepository
        extends JpaRepository<Cliente, Long> {

    long countByEmpresaId(Long empresaId);

    Optional<Cliente> findByIdAndEmpresaId(
            Long clienteId,
            Long empresaId
    );

    Page<Cliente> findByEmpresaId(
        Long empresaId,
        Pageable pageable
    );

    List<Cliente> findByEmpresaIdAndNomeContainingIgnoreCaseOrderByNomeAsc(
            Long empresaId,
            String nome
    );

    boolean existsByDocumentoAndEmpresaId(
            String documento,
            Long empresaId
    );
}