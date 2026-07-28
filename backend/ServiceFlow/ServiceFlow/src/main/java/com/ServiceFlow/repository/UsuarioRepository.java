package com.serviceflow.repository;

import com.serviceflow.model.Cargo;
import com.serviceflow.model.StatusUsuario;
import com.serviceflow.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository
        extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByEmpresaId(Long empresaId);

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