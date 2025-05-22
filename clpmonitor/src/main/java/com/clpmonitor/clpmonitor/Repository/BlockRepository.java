package com.clpmonitor.clpmonitor.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clpmonitor.clpmonitor.Model.Block;

public interface BlockRepository extends JpaRepository<Block, Long> {
    List<Block> findAllByStorage_IdOrderByPosition(int storageId);
}