//------------------------------------------------------------------------------------------
// Atualização de Eventos do Backend para o Frontend utilizando SSE - Server Sent Events
// Curso Técnico em Desenvolvimento de Sistemas - SENAI Timbó -SC
// UC: Desenvolvimento de Sistemas
// Docente: Gerson Trindade         SET-2024
//------------------------------------------------------------------------------------------
package com.clpmonitor.clpmonitor.Controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
import com.clpmonitor.clpmonitor.Util.TagValueParser;
import com.clpmonitor.clpmonitor.Service.PedidoTesteService;

@Controller
public class ClpController {

    // Injeta automaticamente uma instância da classe ClpSimulatorService.
    // Essa classe é responsável por simular os dados dos CLPs e gerenciar
    // os eventos SSE que serão enviados ao frontend.
    @Autowired
    private ClpSimulatorService simulatorService;

    @Autowired
    private PedidoTesteService pedidoTesteService;

    // Mapeia a URL raiz (http://localhost:8080/) para o método index().
    // Retorna a view index.html, localizada em
    // src/main/resources/templates/index.html (Thymeleaf).
    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("tag", new TagWriteRequest());
        return "index";
    }

    // Rota "/clp-data-stream" — Comunicação via SSE (Server-Sent Events)
    // Essa rota é chamada no JavaScript pelo EventSource:
    @GetMapping("/clp-data-stream")

    // Retorna um objeto SseEmitter, que é a classe do Spring para enviar
    // dados do servidor para o cliente continuamente usando Server-Sent Events.
    public SseEmitter streamClpData() {
        // Esse método delega a lógica para simulatorService.subscribe() que:
        // Cria o SseEmitter.
        // Armazena ele numa lista de ouvintes (clientes conectados).
        // Inicia o envio periódico dos dados simulados
        return simulatorService.subscribe();
    }

    @PostMapping("/write-tag")
    public ResponseEntity<?> writeTag(@ModelAttribute TagWriteRequest request) {
        try {
            // Cria o conector com o CLP
            PlcConnector plc = new PlcConnector(request.getIp(), request.getPort());
            plc.connect();

            // Converte o valor para o tipo correto
            Object typedValue = TagValueParser.parseValue(request.getValue(), request.getType());

            boolean writeSuccess = false;

            // Executa a escrita conforme o tipo
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

    @GetMapping("/fragmento-formulario")
    public String carregarFragmentoFormulario(Model model) {
        model.addAttribute("tag", new TagWriteRequest());
        return "fragments/formulario :: clp-write-fragment";
    }

    @PostMapping("/update-stock")
    public String updateStock() {
        simulatorService.updateStock();
        return "redirect:/fragmento-formulario";
    }

    @PostMapping("/update-expedition")
    public String updateExpedition() {
        simulatorService.updateExpedition();
        return "redirect:/fragmento-formulario";
    }

    @PostMapping("/update")
    public String update() {
        simulatorService.startSimulation();
        return "redirect:/fragmento-formulario";
    }

    @PostMapping("/pedidoTeste")
    public String peditoTeste() {
        pedidoTesteService.enviarPedidoTeste();
        return "redirect:/store";
    }

    @GetMapping("/store")
    public String exibirStore() {
        return "store"; 
    }
}
