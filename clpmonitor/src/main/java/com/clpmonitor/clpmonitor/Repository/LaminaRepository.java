package com.clpmonitor.clpmonitor.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clpmonitor.clpmonitor.Model.Lamina;

public interface LaminaRepository extends JpaRepository<Lamina, Long> {
 List<Lamina> findByBlock_Id(Long blockId);
    
    // Busca lâminas por cor
    List<Lamina> findByCor(String cor);
}
