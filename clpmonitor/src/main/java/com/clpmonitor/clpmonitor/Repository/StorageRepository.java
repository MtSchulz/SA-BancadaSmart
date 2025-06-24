package com.clpmonitor.clpmonitor.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clpmonitor.clpmonitor.Model.Storage;

public interface StorageRepository extends JpaRepository<Storage, Long> {
    // Busca todos os registros de uma determinada cor, ordenados pela posição
    List<Storage> findByCorOrderByPosicaoStorageAsc(int cor);
}
