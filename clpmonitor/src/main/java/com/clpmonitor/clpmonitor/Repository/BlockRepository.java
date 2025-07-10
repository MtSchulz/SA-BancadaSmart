package com.clpmonitor.clpmonitor.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.clpmonitor.clpmonitor.Model.Block;

public interface BlockRepository extends JpaRepository<Block, Long> {
    List<Block> findByStorageId_Id(Long storageId);

    boolean existsByStorageId_IdAndPosition(Long storageId, int position);

    // Mantém a busca original por cor no estoque (storageId = 1)
    @Query("SELECT b FROM Block b WHERE b.storageId.id = :storageId AND b.color = :cor ORDER BY b.position ASC")
    List<Block> findByStorageId_IdAndColorOrderByPosition(@Param("storageId") Long storageId, @Param("cor") int cor);

    // Busca posições ocupadas na expedição (storageId = 2)
    @Query("SELECT DISTINCT b.position FROM Block b WHERE b.storageId.id = :storageId ORDER BY b.position ASC")
    List<Integer> findPositionsByStorageId(@Param("storageId") Long storageId);

    long countByStorageId_Id(Long storageId);

    Block findByStorageId_IdAndPosition(Long storageId, int position);

    void deleteByStorageId_IdAndPosition(Long storageId, int position);

    @Query("SELECT b FROM Block b WHERE b.storageId.id = :storageId AND b.color = :color ORDER BY b.position")
    List<Block> findByStorageIdAndColor(Long storageId, int color);
}