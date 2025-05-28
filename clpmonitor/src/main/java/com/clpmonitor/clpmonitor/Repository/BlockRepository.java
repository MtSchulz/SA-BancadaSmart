package com.clpmonitor.clpmonitor.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clpmonitor.clpmonitor.Model.Block;

public interface BlockRepository extends JpaRepository<Block, Long> {
   Optional<Block> findByPositionAndStorage_Id(int position, long storageId);
}