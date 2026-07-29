package com.ServiceFlow.repository;

import com.ServiceFlow.model.Cargo;
import com.ServiceFlow.model.StatusUsuario;
import com.ServiceFlow.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository
        extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(
            String email
    );

    boolean existsByEmail(
            String email
    );

    long countByEmpresaId(
            Long empresaId
    );

    long countByEmpresaIdAndCargo(
            Long empresaId,
            Cargo cargo
    );

    Optional<Usuario> findByIdAndEmpresaId(
            Long usuarioId,
            Long empresaId
    );

    List<Usuario> findByEmpresaIdOrderByNomeAsc(
            Long empresaId
    );

    Page<Usuario> findByEmpresaIdAndCargoNot(
            Long empresaId,
            Cargo cargo,
            Pageable pageable
    );

    List<Usuario> findByEmpresaIdAndCargoOrderByNomeAsc(
            Long empresaId,
            Cargo cargo
    );

    List<Usuario> findByEmpresaIdAndStatus(
            Long empresaId,
            StatusUsuario status
    );

    List<Usuario> findByEmpresaIdAndStatusOrderByNomeAsc(
            Long empresaId,
            StatusUsuario status
    );

    List<Usuario> findByEmpresaIdAndCargoAndStatusOrderByNomeAsc(
            Long empresaId,
            Cargo cargo,
            StatusUsuario status
    );
}