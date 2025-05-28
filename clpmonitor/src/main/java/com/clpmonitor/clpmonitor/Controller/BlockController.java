package com.clpmonitor.clpmonitor.Controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.clpmonitor.clpmonitor.Model.Block;
import com.clpmonitor.clpmonitor.Model.Storage;
import com.clpmonitor.clpmonitor.Repository.BlockRepository;
import com.clpmonitor.clpmonitor.Repository.StorageRepository;

import jakarta.annotation.PostConstruct;

@Controller
public class BlockController {

    @Autowired
    private BlockRepository blockRepository;

    @Autowired
    private StorageRepository storageRepository;

    @PostConstruct
    public void init() {
        // Verifica se os storages padrão existem
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

    @GetMapping("/blocks/estoque")
    public String listBlocks(Model model) {
        prepareStockData(model, false);
        return "index"; // Retornando para index.html
    }

    @GetMapping("/estoque/editar")
    public String editBlocks(Model model) {
        prepareStockData(model, true);
        return "index"; // Retornando para index.html
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

            Storage storage = storageRepository.findById(1L) // ID fixo para estoque
                    .orElseThrow(() -> new RuntimeException("Storage de estoque não encontrado"));

            // Busca otimizada
            List<Block> existingBlocks = blockRepository.findByStorage_Id(storage.getId());
            Map<Integer, Block> blocksByPosition = existingBlocks.stream()
                    .collect(Collectors.toMap(Block::getPosition, Function.identity()));

            for (int i = 0; i < listBlocks.size(); i++) {
                int position = i + 1;
                int color = listBlocks.get(i);

                if (color == 0) {
                    // Remove se existir
                    if (blocksByPosition.containsKey(position)) {
                        blockRepository.delete(blocksByPosition.get(position));
                    }
                } else {
                    Block block = blocksByPosition.computeIfAbsent(position, pos -> {
                        Block newBlock = new Block();
                        newBlock.setPosition(position);
                        newBlock.setStorage(storage);
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

    private void prepareStockData(Model model, boolean editMode) {
        List<Block> listBlocks = blockRepository.findAll(Sort.by(Sort.Direction.ASC, "Position"));
        Map<Integer, Integer> estoqueColors = new HashMap<>();
        Map<Integer, String> expedicaoOrders = new HashMap<>();
        List<Integer> estoque = new ArrayList<>();
        List<String> expedicao = new ArrayList<>();

        // Processar dados
        for (Block block : listBlocks) {
            if (block.getStorage().getId() == 1) { // Estoque
                estoqueColors.put(block.getPosition(), block.getColor());
            } else if (block.getStorage().getId() == 2) { // Expedição
                expedicaoOrders.merge(block.getPosition(),
                        block.getProductionOrder().getProductionOrder(),
                        (oldVal, newVal) -> oldVal + ", " + newVal);
            }
        }

        // Preencher listas
        for (int i = 1; i <= 28; i++) {
            estoque.add(estoqueColors.getOrDefault(i, 0));
        }
        for (int i = 1; i <= 12; i++) {
            expedicao.add(expedicaoOrders.getOrDefault(i, ""));
        }

        // Adicionar atributos ao modelo
        model.addAttribute("estoque", estoque);
        model.addAttribute("expedicao", expedicao);
        model.addAttribute("editMode", editMode);
    }

    @GetMapping("/estoque/listar")
    public @org.springframework.web.bind.annotation.ResponseBody List<Integer> listarEstoque() {
        List<Block> listBlocks = blockRepository.findAll(Sort.by(Sort.Direction.ASC, "Position"));
        Map<Integer, Integer> estoqueColors = new HashMap<>();
        List<Integer> estoque = new ArrayList<>();

        for (Block block : listBlocks) {
            if (block.getStorage().getId() == 1) { // Estoque
                estoqueColors.put(block.getPosition(), block.getColor());
            }
        }

        for (int i = 1; i <= 28; i++) {
            estoque.add(estoqueColors.getOrDefault(i, 0));
        }

        return estoque;
    }

}
