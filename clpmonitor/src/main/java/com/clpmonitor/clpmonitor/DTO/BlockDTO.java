package com.clpmonitor.clpmonitor.DTO;

import java.util.List;

public class BlockDTO {
    private int cor;
    private List<LaminaDTO> laminas;

    public int getCor() {
        return cor;
    }

    public void setCor(int cor) {
        this.cor = cor;
    }

    public List<LaminaDTO> getLaminas() {
        return laminas;
    }

    public void setLaminas(List<LaminaDTO> laminas) {
        this.laminas = laminas;
    }

}