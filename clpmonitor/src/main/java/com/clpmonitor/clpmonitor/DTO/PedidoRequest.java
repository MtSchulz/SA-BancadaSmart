package com.clpmonitor.clpmonitor.DTO;

import java.util.List;

public class PedidoRequest {
    private String tipo;
    private List<BlockRequest> blocks;

    // Getters e Setters
    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public List<BlockRequest> getBlocks() {
        return blocks;
    }

    public void setBlocks(List<BlockRequest> blocks) {
        this.blocks = blocks;
    }
}

