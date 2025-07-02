package com.clpmonitor.clpmonitor.Controller;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.clpmonitor.clpmonitor.Model.TagWriteRequest;
import com.clpmonitor.clpmonitor.Service.SmartService;

@Controller
public class ClpController {

    /*
     * private final Map<String, String> leiturasCache = new ConcurrentHashMap<>();
     * private final ScheduledExecutorService leituraExecutor =
     * Executors.newScheduledThreadPool(4);
     * private final Map<String, ScheduledFuture<?>> leituraFutures = new
     * ConcurrentHashMap<>();
     * 
     * private static byte[] dadosClp1;
     * private static byte[] dadosClp2;
     * private static byte[] dadosClp3;
     * private static byte[] dadosClp4;
     */

    @Autowired
    private SmartService smartService;

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @GetMapping("/smartPing")
    public String smartPing() {
        return "smartPing";
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("tag", new TagWriteRequest());
        return "index";
    }

    @GetMapping("/history")
    public String history() {
        return "history";
    }

    @GetMapping(value = "/clp-data-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamClpData() {
        return smartService.subscribe();
    }

    // Método auxiliar para enviar atualizações
    public void sendUpdateToClients(Object data, String eventName) {
        List<SseEmitter> deadEmitters = new ArrayList<>();

        synchronized (this.emitters) {
            this.emitters.forEach(emitter -> {
                try {
                    emitter.send(SseEmitter.event()
                            .name(eventName)
                            .data(data));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            });

            this.emitters.removeAll(deadEmitters);
        }
    }

    /*
     * @PostMapping("/pedidoTeste")
     * public String enviarPedido(@RequestParam Map<String, String> formData) {
     * try {
     * // Extrai os dados do formulário e prepara para o SmartService
     * int totalBlocos = 0;
     * for (int i = 1; i <= 3; i++) {
     * if (formData.containsKey("block-color-" + i)) {
     * totalBlocos++;
     * }
     * }
     * 
     * if (totalBlocos > 0) {
     * // Chama diretamente o método de envio do SmartService
     * smartService.iniciarExecucaoPedido("10.74.241.10"); // IP do CLP de estoque
     * 
     * System.out.println("Pedido enviado via SmartService");
     * }
     * 
     * return "redirect:/store";
     * } catch (Exception e) {
     * System.err.println("Erro ao enviar pedido: " + e.getMessage());
     * return "redirect:/store?error=" + e.getMessage();
     * }
     * }
     */
    @GetMapping("/fragments-formulario")
    public String carregarFragmentoFormulario(Model model) {
        model.addAttribute("tag", new TagWriteRequest());
        return "fragments/formulario :: clp-write-fragment";
    }

    @PostMapping("/update-expedition")
    public String sendExpeditionUpdate() {
        smartService.sendExpeditionUpdate();
        return "redirect:/fragments-formulario";
    }

    @GetMapping("/store")
    public String exibirStore() {
        return "store";
    }
    @PostMapping("/clp/pedidoTeste")
    public ResponseEntity<String> enviarPedido(@RequestBody Map<String, Object> pedido) {
        try {
            String ipClp = (String) pedido.get("ipClp");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> blocos = (List<Map<String, Object>>) pedido.get("blocos");
    
            if (ipClp == null || blocos == null || blocos.isEmpty()) {
                return ResponseEntity.badRequest().body("Dados do pedido inválidos");
            }
    
            // 1. Montar os dados para o CLP
            byte[] bytePedidoArray = montarPedidoParaCLP(blocos);
            
            System.out.print("Bytes do pedido em hexadecimal: ");
            for (byte b : bytePedidoArray) {
                System.out.printf("%02X ", b);
            }
            System.out.println();
    
            // 2. Processar cada bloco
            for (Map<String, Object> bloco : blocos) {
                int blocoId = (int) bloco.get("id");
                int posicaoEstoque = (int) bloco.get("posicaoEstoque");
                int posicaoExpedicao = smartService.buscarPrimeiraPosicaoLivreExp();
    
                System.out.println("Removendo bloco ID: " + blocoId + " do estoque (posição: " + posicaoEstoque + ")");
                System.out.println("Salvando na expedição (posição: " + posicaoExpedicao + ")");
    
                // 3. Remover do estoque (usando SmartService)
                // Prepara dados para remoção (posição + valor 0)
                byte[] dadosRemocao = new byte[]{(byte) posicaoEstoque, 0};
                smartService.enviarBlocoBytesAoClp(ipClp, 9, 66, dadosRemocao, 2);
    
                // 4. Salvar na expedição (usando SmartService)
                // Converte blocoId para 2 bytes
                byte[] dadosExpedicao = ByteBuffer.allocate(2)
                    .putShort((short) blocoId)
                    .array();
                int offsetExpedicao = 6 + (posicaoExpedicao - 1) * 2;
                smartService.enviarBlocoBytesAoClp("10.74.241.40", 9, offsetExpedicao, dadosExpedicao, 2);
            }
    
            // 5. Enviar pedido completo ao CLP
            smartService.enviarBlocoBytesAoClp(ipClp, 9, 2, bytePedidoArray, bytePedidoArray.length);
            
            // 6. Iniciar execução do pedido
            smartService.iniciarExecucaoPedido(ipClp);
    
            return ResponseEntity.ok("Pedido enviado ao CLP com sucesso.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao enviar pedido ao CLP: " + e.getMessage());
        }
    }
    @PostMapping("/estoque/salvar")
    public ResponseEntity<String> salvarEstoque(@RequestBody Map<String, Integer> dados) {
        try {
            byte[] byteBlocosArray = new byte[28];

            dados.forEach((posStr, valor) -> {
                try {
                    int pos = Integer.parseInt(posStr.split(":")[1]);
                    if (pos >= 1 && pos <= 28) {
                        byteBlocosArray[pos - 1] = valor.byteValue();
                    }
                } catch (Exception e) {
                    System.err.println("Erro ao processar posição: " + posStr + " - " + e.getMessage());
                }
            });

            return ResponseEntity.ok("Estoque processado com sucesso.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao processar estoque: " + e.getMessage());
        }
    }

    @PostMapping("/expedicao/salvar")
    public ResponseEntity<String> salvarExpedicao(@RequestBody Map<String, Integer> dados) {
        try {
            byte[] byteBlocosArray = new byte[24];

            dados.forEach((posStr, valor) -> {
                try {
                    int pos = Integer.parseInt(posStr.split(":")[1]);
                    if (pos >= 1 && pos <= 12) {
                        int index = (pos - 1) * 2;
                        byteBlocosArray[index] = (byte) (valor >> 8);
                        byteBlocosArray[index + 1] = (byte) (valor & 0xFF);
                        // Aqui você pode adicionar lógica para salvar no seu sistema se necessário
                    }
                } catch (Exception e) {
                    System.err.println("Erro ao processar posição: " + posStr + " - " + e.getMessage());
                }
            });

            return ResponseEntity.ok("Expedição processada com sucesso.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao processar expedição: " + e.getMessage());
        }
    }

    @GetMapping("/estoque/primeira-posicao/{cor}")
    public ResponseEntity<Integer> getPrimeiraPosicaoPorCor(@PathVariable int cor) {
        Set<Integer> posicoesUsadas = new HashSet<>();
        int posicao = smartService.buscarPrimeiraPosicaoPorCor(cor, posicoesUsadas);
        return ResponseEntity.ok(posicao);
    }

    @GetMapping("/expedicao/primeira-livre")
    public ResponseEntity<Integer> buscarLivre() {
        int posicaoLivre = smartService.buscarPrimeiraPosicaoLivreExp();
        return ResponseEntity.ok(posicaoLivre);
    }

    private byte[] montarPedidoParaCLP(List<Map<String, Object>> pedido) {
        int[] dados = new int[30];
        int andares = pedido.size();

        for (Map<String, Object> bloco : pedido) {
            int andar = (int) bloco.get("andar");
            int indexBase = (andar - 1) * 9;

            if (indexBase + 8 >= dados.length) {
                System.out.println("Ignorando andar fora do esperado: " + andar);
                continue;
            }

            int corBloco = (int) bloco.get("corBloco");
            dados[indexBase] = corBloco;
            dados[indexBase + 1] = 0; // Posição estoque será determinada pelo SmartService

            @SuppressWarnings("unchecked")
            List<Map<String, Integer>> laminas = (List<Map<String, Integer>>) bloco.get("laminas");
            for (int i = 0; i < Math.min(3, laminas.size()); i++) {
                dados[indexBase + 2 + i] = laminas.get(i).get("cor");
                dados[indexBase + 5 + i] = laminas.get(i).get("padrao");
            }

            dados[indexBase + 8] = 0; // Processamento
        }

        // Número do pedido e andares
        dados[27] = 1; // Será sobrescrito pelo SmartService
        dados[28] = andares;

        ByteBuffer buffer = ByteBuffer.allocate(60).order(ByteOrder.BIG_ENDIAN);
        for (int valor : dados) {
            buffer.putShort((short) valor);
        }

        return buffer.array();
    }
}

// -------------- Ping Function --------------
/*
 * @PostMapping("/smart/ping")
 * public Map<String, Boolean> pingHosts(@RequestBody Map<String, String> ips) {
 * Map<String, Boolean> resultados = new HashMap<>();
 * ips.forEach((nome, ip) -> {
 * try {
 * boolean online = InetAddress.getByName(ip).isReachable(2000);
 * resultados.put(nome, online);
 * } catch (IOException e) {
 * resultados.put(nome, false);
 * }
 * });
 * return resultados;
 * }
 * 
 * 
 * @PostMapping("/start-leituras")
 * public ResponseEntity<String> startLeituras(@RequestBody Map<String, String>
 * ips) {
 * ips.forEach((nome, ip) -> {
 * if (!leituraFutures.containsKey(nome)) {
 * PlcConnector plcConnector = PlcConnectionManager.getConexao(ip);
 * if (plcConnector == null) {
 * System.err.println("Erro ao obter conexão com o CLP: " + ip);
 * return; // ignora esse CLP e continua com os demais
 * }
 * 
 * PlcReaderTask task = null;
 * switch (nome.toLowerCase()) {
 * case "estoque" -> task = new PlcReaderTask(plcConnector, nome, 9, 0, 111,
 * dados -> {
 * ClpController.dadosClp1 = dados;
 * smartService.clpEstoque(ip, dados);
 * atualizarCache("estoque", dados);
 * });
 * 
 * case "processo" -> task = new PlcReaderTask(plcConnector, nome, 2, 0, 9,
 * dados -> {
 * ClpController.dadosClp2 = dados;
 * smartService.clpProcesso(ip, dados);
 * atualizarCache("processo", dados);
 * });
 * 
 * case "montagem" -> task = new PlcReaderTask(plcConnector, nome, 57, 0, 9,
 * dados -> {
 * ClpController.dadosClp3 = dados;
 * smartService.clpMontagem(ip, dados);
 * atualizarCache("montagem", dados);
 * });
 * 
 * case "expedicao" -> task = new PlcReaderTask(plcConnector, nome, 9, 0, 48,
 * dados -> {
 * ClpController.dadosClp4 = dados;
 * smartService.clpExpedicao(ip, dados);
 * atualizarCache("expedicao", dados);
 * });
 * 
 * default -> {
 * System.err.println("Nome de CLP inválido: " + nome);
 * return;
 * }
 * }
 * 
 * if (task != null) {
 * ScheduledFuture<?> future = leituraExecutor.scheduleAtFixedRate(task, 0, 800,
 * TimeUnit.MILLISECONDS);
 * leituraFutures.put(nome, future);
 * }
 * }
 * });
 * 
 * return ResponseEntity.ok("Leituras com PlcReaderTask iniciadas.");
 * }
 * 
 * 
 * private void atualizarCache(String nome, byte[] dados) {
 * StringBuilder sb = new StringBuilder();
 * for (byte b : dados) {
 * sb.append(String.format("%02X ", b));
 * }
 * leiturasCache.put(nome, sb.toString().trim());
 * }
 * 
 * 
 * 
 * @PostMapping("/stop-leituras")
 * public ResponseEntity<String> stopLeituras() {
 * leituraFutures.forEach((nome, future) -> {
 * future.cancel(true);
 * System.out.println("Thread de leitura '" + nome + "' cancelada.");
 * });
 * leituraFutures.clear();
 * PlcConnectionManager.encerrarTodasAsConexoes();
 * return ResponseEntity.ok("Leituras interrompidas.");
 * }
 */