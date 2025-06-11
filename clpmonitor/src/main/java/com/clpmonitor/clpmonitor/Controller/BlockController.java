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

import com.clpmonitor.clpmonitor.DTO.BlockDTO;
import com.clpmonitor.clpmonitor.DTO.LaminaDTO;
import com.clpmonitor.clpmonitor.DTO.PedidoDTO;
import com.clpmonitor.clpmonitor.Model.Block;
import com.clpmonitor.clpmonitor.Model.Lamina;
import com.clpmonitor.clpmonitor.Model.Pedido;
import com.clpmonitor.clpmonitor.Model.Storage;
import com.clpmonitor.clpmonitor.Repository.BlockRepository;
import com.clpmonitor.clpmonitor.Repository.LaminaRepository;
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

            List<Block> existingBlocks = blockRepository.findByStorage_Id(storage.getId());
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
    public ResponseEntity<Map<String, Object>> receberPedidos(@RequestBody List<PedidoDTO> pedidosDto) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validação básica
            if (pedidosDto == null || pedidosDto.isEmpty()) {
                throw new IllegalArgumentException("Lista de pedidos não fornecida ou vazia");
            }
    
            System.out.println("PEDIDOS RECEBIDOS: " + pedidosDto.size());
            List<Long> pedidosIds = new ArrayList<>();
    
            for (PedidoDTO pedidoDTO : pedidosDto) {
                // Validação flexível do pedido
                if (pedidoDTO.getTipo() == null || pedidoDTO.getTipo().trim().isEmpty()) {
                    pedidoDTO.setTipo("Padrão"); // Valor default
                }
    
                // Inicializa blocks se for null
                if (pedidoDTO.getBlocks() == null) {
                    pedidoDTO.setBlocks(new ArrayList<>());
                    System.out.println("Aviso: Pedido com blocks=null - inicializado como lista vazia");
                }
    
                Pedido pedido = new Pedido();
                pedido.setTipo(pedidoDTO.getTipo());
                List<Block> blocos = new ArrayList<>();
    
                for (BlockDTO blockDTO : pedidoDTO.getBlocks()) {
                    Block block = new Block();
                    // Usa diretamente o int do DTO
                    block.setColor(blockDTO.getCor());
                    block.setPedido(pedido);
    
                    // Processa lâminas
                    List<Lamina> laminas = new ArrayList<>();
                    if (blockDTO.getLaminas() != null) {
                        for (LaminaDTO laminaDTO : blockDTO.getLaminas()) {
                            if (laminaDTO.getCor() != null && !laminaDTO.getCor().trim().isEmpty()) {
                                Lamina lamina = new Lamina();
                                lamina.setCor(laminaDTO.getCor());
                                lamina.setPadrao(laminaDTO.getPadrao() != null ? laminaDTO.getPadrao() : "");
                                lamina.setBlock(block);
                                laminas.add(lamina);
                            }
                        }
                    }
                    block.setLaminas(laminas);
                    blocos.add(block);
                }
    
                pedido.setBlocks(blocos);
                
                // Salva apenas se houver blocos
                if (!blocos.isEmpty()) {
                    pedidoRepository.save(pedido);
                    pedidosIds.add(pedido.getId());
                    System.out.println("Pedido salvo - ID: " + pedido.getId());
                }
            }
    
            response.put("status", "success");
            response.put("message", "Pedidos processados com sucesso");
            response.put("pedidosIds", pedidosIds);
            return ResponseEntity.ok(response);
    
        } catch (Exception e) {
            System.err.println("Erro ao processar pedidos: " + e.getMessage());
            response.put("status", "error");
            response.put("message", "Erro ao processar pedidos");
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    

    private void prepareStockData(Model model, boolean editMode) {
        List<Block> listBlocks = blockRepository.findAll(Sort.by(Sort.Direction.ASC, "position"));
        List<Integer> estoque = new ArrayList<>(28);
        List<String> expedicao = new ArrayList<>(12);
    
        // Inicializa com valores padrão
        for (int i = 0; i < 28; i++) estoque.add(0);
        for (int i = 0; i < 12; i++) expedicao.add("");
    
        // Preenche com dados reais
        for (Block block : listBlocks) {
            if (block.getStorage() == null) continue;
            
            if (block.getStorage().getId() == 1 && block.getPosition() >= 1 && block.getPosition() <= 28) {
                estoque.set(block.getPosition() - 1, block.getColor());
            } else if (block.getStorage().getId() == 2 && block.getPosition() >= 1 && block.getPosition() <= 12) {
                String tipo = block.getPedido() != null ? block.getPedido().getTipo() : "Sem Pedido";
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
        List<Block> listBlocks = blockRepository.findByStorage_Id(1L);
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
}