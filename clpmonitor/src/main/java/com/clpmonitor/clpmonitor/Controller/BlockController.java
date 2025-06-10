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

import com.clpmonitor.clpmonitor.DTO.PedidoRequest;
import com.clpmonitor.clpmonitor.Model.Block;
import com.clpmonitor.clpmonitor.Model.Lamina;
import com.clpmonitor.clpmonitor.Model.Pedido;
import com.clpmonitor.clpmonitor.Model.Storage;
import com.clpmonitor.clpmonitor.Repository.BlockRepository;
import com.clpmonitor.clpmonitor.Repository.PedidoRepository;
import com.clpmonitor.clpmonitor.Repository.StorageRepository;

import jakarta.annotation.PostConstruct;

@Controller
public class BlockController {

    @Autowired
    private BlockRepository blockRepository;

    @Autowired
    private StorageRepository storageRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

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

    @PostMapping("/store/orders")
    @ResponseBody
    public String receberPedido(@RequestBody PedidoRequest pedidoRequest) {
        System.out.println("NOVO PEDIDO RECEBIDO");

        // Criar e salvar o pedido
        Pedido pedido = new Pedido();
        pedido.setTipo(pedidoRequest.getTipo()); // Adicionando o tipo como na segunda versão

        List<Block> blocks = pedidoRequest.getBlocks().stream().map(blocoData -> {
            Block block = new Block();
            block.setColor(blocoData.getColor());

            // Criar as lâminas (adaptado para a estrutura da primeira função)
            List<Lamina> laminas = new ArrayList<>();

            // Lâmina 1
            if (blocoData.getL1Color() != null) {
                laminas.add(createLamina(blocoData.getL1Color(), blocoData.getL1Pattern(), block));
            }

            // Lâmina 2
            if (blocoData.getL2Color() != null) {
                laminas.add(createLamina(blocoData.getL2Color(), blocoData.getL2Pattern(), block));
            }

            // Lâmina 3
            if (blocoData.getL3Color() != null) {
                laminas.add(createLamina(blocoData.getL3Color(), blocoData.getL3Pattern(), block));
            }

            return block;
        }).collect(Collectors.toList());

        pedido.setBlocos(blocks);
        pedidoRepository.save(pedido);

        // Log detalhado
        System.out.println("Tipo do Pedido: " + pedido.getTipo());
        System.out.println("Total de Blocos: " + pedido.getBlocos().size());

        pedido.getBlocos().forEach(block -> {
            System.out.println("\nBloco - Cor: " + block.getColor());
            System.out.println("Lâminas:");

        });

        return "Pedido recebido com sucesso!";
    }

    private Lamina createLamina(String cor, String padrao, Block block) {
        Lamina lamina = new Lamina();
        lamina.setCor(cor);
        lamina.setPadrao(padrao);
        lamina.setBlock(block); // Note que usa 'block' e não 'bloco'
        return lamina;
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
    public String listBlocks(Model model) {
        final List<Block> listBlocks = blockRepository.findAll(Sort.by(Sort.Direction.ASC, "Position"));
        final Map<Integer, Integer> estoqueColorsByPosition = new HashMap<>();
        final Map<Integer, String> expedicaoOrdersByPosition = new HashMap<>();
        final List<Integer> estoque = new ArrayList<>();
        final List<String> expedicao = new ArrayList<>();

        for (Block block : listBlocks) {
            if (block.getStorage().getId() == 1) {
                estoqueColorsByPosition.put(block.getPosition(), block.getColor());
            } else if (block.getStorage().getId() == 2) {
                int position = block.getPosition();
                Long newProductionOrder = block.getProductionOrder().getProductionOrder();
                if (expedicaoOrdersByPosition.containsKey(position)) {
                    String existingProductionOrders = expedicaoOrdersByPosition.get(position);
                    String updatedProductionOrders = existingProductionOrders + " " + newProductionOrder;
                    expedicaoOrdersByPosition.put(position, updatedProductionOrders);
                } else {
                    expedicaoOrdersByPosition.put(position, newProductionOrder.toString());
                }
            }
        }

        for (int i = 1; i <= 28; i++) {
            estoque.add(estoqueColorsByPosition.getOrDefault(i, 0));
        }

        for (int i = 1; i <= 12; i++) {
            expedicao.add(expedicaoOrdersByPosition.getOrDefault(i, ""));
        }

        model.addAttribute("estoque", estoque);
        model.addAttribute("expedicao", expedicao);
        model.addAttribute("editMode", false);

        return "stock";
    }

}
