package com.clpmonitor.clpmonitor.Controller;

import com.clpmonitor.clpmonitor.Model.Block;
import com.clpmonitor.clpmonitor.Model.Orders;
import com.clpmonitor.clpmonitor.Model.Storage;
import com.clpmonitor.clpmonitor.Repository.BlockRepository;
import com.clpmonitor.clpmonitor.Repository.StorageRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Controller
public class BlockController {

    @Autowired
    private BlockRepository blockRepository;

    @Autowired
    private StorageRepository storageRepository;

    @PostConstruct
    public void init() {
        if (storageRepository.count() == 0) {
            Storage estoque = new Storage();
            estoque.setName("Estoque");
            estoque.setCapacity(28);
            storageRepository.save(estoque);

            Storage expedicao = new Storage();
            expedicao.setName("Expedição");
            expedicao.setCapacity(12);
            storageRepository.save(expedicao);
        }
    }

    // Operações do Estoque

    @GetMapping("/estoque/editar")
    public String editBlocks(Model model) {
        prepareStockData(model, true);
        return "index";
    }

    @PostMapping("/estoque/editar")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveBlock(@RequestBody Map<String, List<Integer>> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Integer> listBlocks = request.get("listBlocks");
            if (listBlocks == null) {
                throw new IllegalArgumentException("Lista de blocos não fornecida");
            }

            Storage storage = storageRepository.findById(1L)
                    .orElseThrow(() -> new RuntimeException("Storage de estoque não encontrado"));

            List<Block> existingBlocks = blockRepository.findByStorageId_Id(storage.getId());
            Map<Integer, Block> blocksByPosition = existingBlocks.stream()
                    .collect(Collectors.toMap(Block::getPosition, Function.identity()));

            for (int i = 0; i < listBlocks.size(); i++) {
                int position = i + 1;
                int color = listBlocks.get(i);

                if (color == 0) {
                    if (blocksByPosition.containsKey(position)) {
                        blockRepository.delete(blocksByPosition.get(position));
                    }
                } else {
                    Block block = blocksByPosition.computeIfAbsent(position, pos -> {
                        Block newBlock = new Block();
                        newBlock.setPosition(position);
                        newBlock.setStorageId(storage);
                        return newBlock;
                    });
                    block.setColor(color);
                    blockRepository.save(block);
                }
            }

            response.put("status", "success");
            response.put("message", "Estoque atualizado com sucesso");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Erro ao salvar estoque");
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/estoque/listar")
    @ResponseBody
    public List<Integer> listarEstoqueJson() {
        List<Block> listBlocks = blockRepository.findByStorageId_Id(1L);
        List<Integer> estoque = new ArrayList<>(28);

        for (int i = 0; i < 28; i++) {
            estoque.add(0);
        }

        for (Block block : listBlocks) {
            if (block.getPosition() >= 1 && block.getPosition() <= 28) {
                estoque.set(block.getPosition() - 1, block.getColor());
            }
        }

        return estoque;
    }

    @PostMapping("/estoque/atualizar")
@ResponseBody
public ResponseEntity<Map<String, Object>> atualizarEstoque(
        @RequestParam int posicao,
        @RequestParam int cor) {
    
    Map<String, Object> response = new HashMap<>();
    try {
        Storage estoque = storageRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Estoque não encontrado"));

        // Correção aqui - findFirstBy... ou usar Optional
        Optional<Block> blocoOpt = Optional.ofNullable(blockRepository.findByStorageId_IdAndPosition(estoque.getId(), posicao));
        Block bloco = blocoOpt.orElse(new Block());
        
        bloco.setPosition(posicao);
        bloco.setColor(cor);
        bloco.setStorageId(estoque);
        blockRepository.save(bloco);

        response.put("status", "success");
        response.put("message", "Posição " + posicao + " atualizada");
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        response.put("status", "error");
        response.put("message", "Erro ao atualizar estoque");
        response.put("details", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

    @GetMapping("/estoque/posicoes-livres")
    @ResponseBody
    public List<Integer> getPosicoesLivresEstoque() {
        List<Integer> ocupadas = blockRepository.findPositionsByStorageId(1L);
        List<Integer> livres = new ArrayList<>();
        
        for (int i = 1; i <= 28; i++) {
            if (!ocupadas.contains(i)) {
                livres.add(i);
            }
        }
        return livres;
    }

    // Operações da Expedição

    @GetMapping("/expedicao/listar")
    @ResponseBody
    public List<Integer> listarExpedicaoJson() {
        List<Block> listBlocks = blockRepository.findByStorageId_Id(2L);
        List<Integer> expedicao = new ArrayList<>(12);

        for (int i = 0; i < 12; i++) {
            expedicao.add(0);
        }

        for (Block block : listBlocks) {
            if (block.getPosition() >= 1 && block.getPosition() <= 12) {
                expedicao.set(block.getPosition() - 1, 
                    block.getProductionOrder() != null ? 
                    block.getProductionOrder().getProductionOrder().intValue() : 0);
            }
        }

        return expedicao;
    }

    @PostMapping("/expedicao/atualizar")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> atualizarExpedicao(
            @RequestParam int posicao,
            @RequestParam Long ordemProducao) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            Storage expedicao = storageRepository.findById(2L)
                    .orElseThrow(() -> new RuntimeException("Expedição não encontrada"));
    
            // Correção aqui
            Optional<Block> blocoOpt = Optional.ofNullable(blockRepository.findByStorageId_IdAndPosition(expedicao.getId(), posicao));
            Block bloco = blocoOpt.orElse(new Block());
            
            Orders ordem = new Orders();
            ordem.setProductionOrder(ordemProducao);
            
            bloco.setPosition(posicao);
            bloco.setProductionOrder(ordem);
            bloco.setStorageId(expedicao);
            blockRepository.save(bloco);
    
            response.put("status", "success");
            response.put("message", "Posição " + posicao + " atualizada na expedição");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Erro ao atualizar expedição");
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/expedicao/limpar")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> limparExpedicao(
            @RequestParam int posicao) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            blockRepository.deleteByStorageId_IdAndPosition(2L, posicao);
            
            response.put("status", "success");
            response.put("message", "Posição " + posicao + " liberada na expedição");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Erro ao liberar posição");
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/expedicao/posicoes-livres")
    @ResponseBody
    public List<Integer> getPosicoesLivresExpedicao() {
        List<Integer> ocupadas = blockRepository.findPositionsByStorageId(2L);
        List<Integer> livres = new ArrayList<>();
        
        for (int i = 1; i <= 12; i++) {
            if (!ocupadas.contains(i)) {
                livres.add(i);
            }
        }
        return livres;
    }

    // Métodos auxiliares

    private void prepareStockData(Model model, boolean editMode) {
        List<Block> listBlocks = blockRepository.findAll(Sort.by(Sort.Direction.ASC, "position"));
        List<Integer> estoque = new ArrayList<>(28);
        List<String> expedicao = new ArrayList<>(12);

        for (int i = 0; i < 28; i++) estoque.add(0);
        for (int i = 0; i < 12; i++) expedicao.add("");

        for (Block block : listBlocks) {
            if (block.getStorageId() == null) continue;

            if (block.getStorageId().getId() == 1 && block.getPosition() >= 1 && block.getPosition() <= 28) {
                estoque.set(block.getPosition() - 1, block.getColor());
            } else if (block.getStorageId().getId() == 2 && block.getPosition() >= 1 && block.getPosition() <= 12) {
                String tipo = block.getProductionOrder() != null
                        ? String.valueOf(block.getProductionOrder().getProductionOrder())
                        : "Sem Pedido";
                expedicao.set(block.getPosition() - 1, tipo);
            }
        }

        model.addAttribute("estoque", estoque);
        model.addAttribute("expedicao", expedicao);
        model.addAttribute("editMode", editMode);
    }

    @PostMapping("/estoque/sincronizar")
    @ResponseBody
    public ResponseEntity<String> sincronizarEstoque(@RequestBody List<Integer> dadosAtualizados) {
        try {
            List<Block> blocosExistentes = blockRepository.findByStorageId_Id(1L);
            Map<Integer, Block> mapaBlocos = new HashMap<>();
            blocosExistentes.forEach(b -> mapaBlocos.put(b.getPosition(), b));

            Storage storage = storageRepository.findById(1L).orElseThrow();

            for (int i = 0; i < dadosAtualizados.size(); i++) {
                int posicao = i + 1;
                int cor = dadosAtualizados.get(i);

                Block bloco = mapaBlocos.get(posicao);
                if (bloco == null) {
                    bloco = new Block();
                    bloco.setPosition(posicao);
                    bloco.setStorageId(storage);
                }
                bloco.setColor(cor);
                blockRepository.save(bloco);
            }

            return ResponseEntity.ok("Estoque sincronizado com sucesso");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao sincronizar: " + e.getMessage());
        }
    }
}