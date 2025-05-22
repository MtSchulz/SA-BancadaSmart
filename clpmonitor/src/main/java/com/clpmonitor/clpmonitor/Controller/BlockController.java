package com.clpmonitor.clpmonitor.Controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.clpmonitor.clpmonitor.Model.Block;
import com.clpmonitor.clpmonitor.Repository.BlockRepository;
import com.clpmonitor.clpmonitor.Repository.StorageRepository;
import org.springframework.ui.Model;

@Controller
public class BlockController {

    @Autowired
    private BlockRepository blockRepository;

    @Autowired
    private StorageRepository storageRepository;

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
    public String saveBlock(@RequestParam List<String> listBlocks) {
        Long storageId = storageRepository.findAll().get(0).getId();

        List<Block> existingBlocks = blockRepository.findAll();
        Map<Integer, Block> blocksByPosition = new HashMap<>();

        for (Block block : existingBlocks) {
            if (block.getStorage() != null && block.getStorage().getId() == storageId) {
                blocksByPosition.put(block.getPosition(), block);
            }
        }

        for (int i = 0; i < listBlocks.size(); i++) {
            int position = i + 1;
            int color = Integer.parseInt(listBlocks.get(i));

            Block block = blocksByPosition.get(position);
            if (color == 0) {
                if (block != null) {
                    blockRepository.delete(block);
                }
            } else {
                if (block == null) {
                    block = new Block();
                    block.setStorage(storageRepository.findAll().get(0));
                    block.setPosition(position);
                }
                block.setColor(color);
                blockRepository.save(block);
            }
        }

        return "redirect:/estoque";
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
