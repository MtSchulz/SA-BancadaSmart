package com.clpmonitor.clpmonitor.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.clpmonitor.clpmonitor.Model.Block;

public interface BlockRepository extends JpaRepository<Block, Long> {
    List<Block> findByStorageId_Id(Long storageId);

    // Mantém a busca original por cor no estoque (storageId = 1)
    @Query("SELECT b FROM Block b WHERE b.color = :color AND b.productionOrder IS NULL AND b.storageId.id = 1 ORDER BY b.position")
    List<Block> findAvailableBlocksByColor(int color);

    // Busca posições ocupadas na expedição (storageId = 2)
    @Query("SELECT b.position FROM Block b WHERE b.storageId.id = 2")
    List<Integer> findOccupiedPositionsInExpedicao();

}