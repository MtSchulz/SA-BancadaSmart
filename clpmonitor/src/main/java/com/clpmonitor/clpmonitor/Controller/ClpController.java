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
import com.clpmonitor.clpmonitor.Service.ClpSimulatorService;
import com.clpmonitor.clpmonitor.Service.PedidoTesteService;

@Controller
public class ClpController {

    @Autowired
    private ClpSimulatorService simulatorService;

    @Autowired
    private PedidoTesteService pedidoTesteService;

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

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
        return simulatorService.subscribe();
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
        pedidoTesteService.enviarPedidoTeste(formData);
        return "redirect:/store";
    }

    @GetMapping("/store")
    public String exibirStore() {
        return "store";
    }
}
