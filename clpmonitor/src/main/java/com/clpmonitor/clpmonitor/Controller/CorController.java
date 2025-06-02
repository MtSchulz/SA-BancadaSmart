package com.clpmonitor.clpmonitor.Controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.clpmonitor.clpmonitor.DTO.CorDisponivelDTO;
import com.clpmonitor.clpmonitor.Repository.BlockRepository;

@RestController
@RequestMapping("/api")
public class CorController {
    
    @Autowired
    private BlockRepository blockRepository;
    
    // Mapeamento de códigos de cor para nomes (ajuste conforme suas cores)
    private static final Map<Integer, String> CORES_MAP = Map.of(
        1, "Vermelho",
        2, "Azul",
        3, "Verde",
        4, "Amarelo",
        5, "Preto"
    );
    
    @GetMapping("/cores-disponiveis")
    public ResponseEntity<List<CorDisponivelDTO>> getCoresDisponiveis() {
        // Busca cores disponíveis (blocos não alocados)
        List<Integer> coresCodigos = blockRepository.findCoresDisponiveis();
        
        // Converte para DTO com nomes
        List<CorDisponivelDTO> cores = coresCodigos.stream()
            .map(codigo -> new CorDisponivelDTO(codigo, CORES_MAP.getOrDefault(codigo, "Cor " + codigo)))
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(cores);
    }
    
    @GetMapping("/verificar-cor/{codigoCor}")
    public ResponseEntity<Map<String, Boolean>> verificarCorDisponivel(@PathVariable int codigoCor) {
        boolean disponivel = blockRepository.findCoresDisponiveis().contains(codigoCor);
        return ResponseEntity.ok(Map.of("disponivel", disponivel));
    }
}