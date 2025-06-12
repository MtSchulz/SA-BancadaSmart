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
                    // Remove se existir
                    if (blocksByPosition.containsKey(position)) {
                        Block blockToDelete = blocksByPosition.get(position);
                        blockRepository.delete(blockToDelete);
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

    private void prepareStockData(Model model, boolean editMode) {
        List<Block> listBlocks = blockRepository.findAll(Sort.by(Sort.Direction.ASC, "position"));
        List<Integer> estoque = new ArrayList<>(28);
        List<String> expedicao = new ArrayList<>(12);

        // Inicializa com valores padrão
        for (int i = 0; i < 28; i++)
            estoque.add(0);
        for (int i = 0; i < 12; i++)
            expedicao.add("");

        // Preenche com dados reais
        for (Block block : listBlocks) {
            if (block.getStorageId() == null)
                continue;

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

    @GetMapping("/expedicao/listar")
    @ResponseBody
    public List<Integer> listarExpedicaoJson() {
        List<Block> listBlocks = blockRepository.findByStorageId_Id(4L); // CLP 4 - Expedição
        List<Integer> expedicao = new ArrayList<>(12); // Matriz de 12 bytes

        // Inicializa com 0 (vazio)
        for (int i = 0; i < 12; i++) {
            expedicao.add(0);
        }

        // Preenche com dados do banco
        for (Block block : listBlocks) {
            if (block.getPosition() >= 1 && block.getPosition() <= 12) {
                expedicao.set(block.getPosition() - 1, block.getColor());
            }
        }

        return expedicao;
    }

    @PostMapping("/estoque/sincronizar")
    @ResponseBody
    public ResponseEntity<String> sincronizarEstoque(@RequestBody List<Integer> dadosAtualizados) {
        try {
            // 1. Obter todos os blocos do storage 1 (CLP1)
            List<Block> blocosExistentes = blockRepository.findByStorageId_Id(1L);

            // 2. Criar um mapa para acesso rápido por posição
            Map<Integer, Block> mapaBlocos = new HashMap<>();
            blocosExistentes.forEach(b -> mapaBlocos.put(b.getPosition(), b));

            // 3. Atualizar ou criar novos blocos
            for (int i = 0; i < dadosAtualizados.size(); i++) {
                int posicao = i + 1;
                int cor = dadosAtualizados.get(i);

                Block bloco = mapaBlocos.get(posicao);
                if (bloco == null) {
                    // Criar novo bloco
                    Storage storage = storageRepository.findById(1L).orElseThrow();
                    bloco = new Block();
                    bloco.setPosition(posicao);
                    bloco.setStorageId(storage);
                    bloco.setColor(cor);
                } else {
                    // Atualizar bloco existente
                    bloco.setColor(cor);
                }

                blockRepository.save(bloco);
            }

            return ResponseEntity.ok("Estoque sincronizado com sucesso");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao sincronizar: " + e.getMessage());
        }
    }
}