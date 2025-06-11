package com.clpmonitor.clpmonitor.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.clpmonitor.clpmonitor.Model.Lamina;

public interface LaminaRepository extends JpaRepository<Lamina, Long> {
 List<Lamina> findByBlock_Id(Long blockId);
    
    // Método para deletar lâminas por block_id (usado no BlockController)
    @Query("DELETE FROM Lamina l WHERE l.block.id = ?1")
    void deleteByBlockId(Long blockId);
    
    // Busca lâminas por cor
    List<Lamina> findByCor(String cor);
}
