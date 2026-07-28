package com.serviceflow.repository;

import com.serviceflow.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmpresaRepository
        extends JpaRepository<Empresa, Long> {

    boolean existsByCnpj(String cnpj);

    List<Empresa> findAllByOrderByNomeAsc();

}