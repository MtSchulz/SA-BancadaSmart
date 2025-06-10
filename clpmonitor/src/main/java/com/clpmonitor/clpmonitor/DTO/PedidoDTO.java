package com.clpmonitor.clpmonitor.DTO;

import java.util.List;

public class PedidoDTO {
    private String tipo;
    private List<BlockDTO> blocks;

    // Getters e Setters
    
    public String getTipo() {
        return tipo;
    }
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    public List<BlockDTO> getBlocks() {
        return blocks;
    }
    public void setBlocks(List<BlockDTO> blocks) {
        this.blocks = blocks;
    }


    
}
