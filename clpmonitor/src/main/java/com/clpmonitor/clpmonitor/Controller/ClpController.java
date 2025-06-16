package com.clpmonitor.clpmonitor.Controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.clpmonitor.clpmonitor.Model.TagWriteRequest;
import com.clpmonitor.clpmonitor.PLC.PlcConnector;
import com.clpmonitor.clpmonitor.Service.ClpSimulatorService;
import com.clpmonitor.clpmonitor.Service.PedidoTesteService;
import com.clpmonitor.clpmonitor.Util.TagValueParser;

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

    @PostMapping("/write-tag")
    public ResponseEntity<?> writeTag(@ModelAttribute TagWriteRequest request) {
        try {
            PlcConnector plc = new PlcConnector(request.getIp(), request.getPort());
            plc.connect();

            Object typedValue = TagValueParser.parseValue(request.getValue(), request.getType());

            boolean writeSuccess = false;

            switch (request.getType().toUpperCase()) {
                case "STRING":
                    writeSuccess = plc.writeString(request.getDb(), request.getOffset(),
                            request.getSize(), (String) typedValue);
                    break;
                case "BLOCK":
                    writeSuccess = plc.writeBlock(request.getDb(), request.getOffset(),
                            request.getSize(), (byte[]) typedValue);
                    break;
                case "FLOAT":
                    writeSuccess = plc.writeFloat(request.getDb(), request.getOffset(),
                            (Float) typedValue);
                    break;
                case "INTEGER":
                    writeSuccess = plc.writeInt(request.getDb(), request.getOffset(),
                            (Integer) typedValue);
                    break;
                case "BYTE":
                    writeSuccess = plc.writeByte(request.getDb(), request.getOffset(),
                            (Byte) typedValue);
                    break;
                case "BIT":
                    writeSuccess = plc.writeBit(request.getDb(), request.getOffset(),
                            request.getBitNumber(), (Boolean) typedValue);
                    break;
                default:
                    throw new IllegalArgumentException("Tipo não suportado: " + request.getType());
            }

            plc.disconnect();

            if (writeSuccess) {
                return ResponseEntity.ok().body(Map.of(
                        "message", "Valor escrito com sucesso!",
                        "status", "success"));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Falha na escrita no CLP"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro: " + e.getMessage()));
        }
    }

    @GetMapping("/fragments-formulario")
    public String carregarFragmentoFormulario(Model model) {
        model.addAttribute("tag", new TagWriteRequest());
        return "fragments/formulario :: clp-write-fragment";
    }

    @PostMapping("/update-stock")
    public String updateStock() {
        simulatorService.updateStock();
        return "redirect:/fragments-formulario";
    }

    @PostMapping("/update-expedition")
    public String updateExpedition() {
        simulatorService.updateExpedition();
        return "redirect:/fragments-formulario";
    }

    @PostMapping("/update")
    public String update() {
        simulatorService.startSimulation();
        return "redirect:/fragments-formulario";
    }

    @PostMapping("/pedidoTeste")
    public String peditoTeste() {
        pedidoTesteService.enviarPedidoTeste(null);
        return "redirect:/store";
    }

    @GetMapping("/store")
    public String exibirStore() {
        return "store";
    }
}
