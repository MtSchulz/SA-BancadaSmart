package com.clpmonitor.clpmonitor.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.clpmonitor.clpmonitor.Model.TagWriteRequest;
import com.clpmonitor.clpmonitor.Service.PedidoTesteService;
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

    @Autowired
    private PedidoTesteService pedidoTesteService;

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

    @PostMapping("/pedidoTeste")
    public String peditoTeste(@RequestParam Map<String, String> formData) {
        System.out.println("Formdata: " + formData);
        pedidoTesteService.enviarPedidoTeste(formData);
        return "redirect:/store";
    }

    @GetMapping("/fragments-formulario")
    public String carregarFragmentoFormulario(Model model) {
        model.addAttribute("tag", new TagWriteRequest());
        return "fragments/formulario :: clp-write-fragment";
    }
/*
    @PostMapping("/update-expedition")
    public String clpExpedicao() {
        smartService.clpExpedicao("10.74.241.40");
        return "redirect:/fragments-formulario";
    }
 */
    @GetMapping("/store")
    public String exibirStore() {
        return "store";
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