package com.clpmonitor.clpmonitor.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import com.clpmonitor.clpmonitor.Model.Block;
import com.clpmonitor.clpmonitor.Repository.BlockRepository;

public class BlockService {
    @Autowired
    private BlockRepository blockRepository;

    public Block saveBlock(Block block) {
        return blockRepository.save(block);
    }

    public List<Block> listBlocks() {
        return blockRepository.findAll();
    }

    public Block findById(Long id) {
        Optional<Block> block = blockRepository.findById(id);
        return block.orElseThrow(() -> new RuntimeException("Block não encontrado"));
    }

    public void deleteById(Long id) {
        blockRepository.deleteById(id);
    }
}
