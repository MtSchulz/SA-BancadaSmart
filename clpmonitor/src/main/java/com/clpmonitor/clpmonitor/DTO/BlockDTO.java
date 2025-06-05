package com.clpmonitor.clpmonitor.DTO;

import java.util.List;

public class BlockDTO {
    private String cor;
    private List<LaminaDTO> laminas;

    // Getters e Setters

    public String getCor() {
        return cor;
    }

    public void setCor(String cor) {
        this.cor = cor;
    }

    public List<LaminaDTO> getLaminas() {
        return laminas;
    }

    public void setLaminas(List<LaminaDTO> laminas) {
        this.laminas = laminas;
    }

}