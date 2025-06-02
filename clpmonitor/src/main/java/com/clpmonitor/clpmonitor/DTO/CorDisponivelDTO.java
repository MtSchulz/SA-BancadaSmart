package com.clpmonitor.clpmonitor.DTO;

public class CorDisponivelDTO {
    private int codigoCor;
    private String nomeCor;
    
    public CorDisponivelDTO(int codigoCor, String nomeCor) {
        this.codigoCor = codigoCor;
        this.nomeCor = nomeCor;
    }
    
    // Getters e setters
    public int getCodigoCor() {
        return codigoCor;
    }
    
    public String getNomeCor() {
        return nomeCor;
    }
}
