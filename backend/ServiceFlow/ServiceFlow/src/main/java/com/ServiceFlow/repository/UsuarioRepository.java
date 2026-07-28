package com.serviceflow.repository;

import com.serviceflow.model.StatusUsuario;
import com.serviceflow.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository
        extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Usuario> findByEmpresaIdAndStatus(
            Long empresaId,
            StatusUsuario status
    );

    List<Usuario> findByEmpresaIdOrderByNomeAsc(
            Long empresaId
    );

}