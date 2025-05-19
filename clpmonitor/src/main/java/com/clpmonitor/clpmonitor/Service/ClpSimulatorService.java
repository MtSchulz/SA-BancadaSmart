//------------------------------------------------------------------------------------------
// Atualização de Eventos do Backend para o Frontend utilizando SSE - Server Sent Events
// Curso Técnico em Desenvolvimento de Sistemas - SENAI Timbó -SC
// UC: Desenvolvimento de Sistemas
// Docente: Gerson Trindade         SET-2024
//------------------------------------------------------------------------------------------
package com.clpmonitor.clpmonitor.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.clpmonitor.clpmonitor.Model.ClpData;
import com.clpmonitor.clpmonitor.PLC.PlcConnector;

import jakarta.annotation.PostConstruct;

@Service
public class ClpSimulatorService {

    private PlcConnector plcConnectorEstoque;
    private PlcConnector plcConnectorExpedicao;
    public static byte[] indexColorEst = new byte[28];
    public static byte[] indexColorExp = new byte[12];

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    private final ScheduledExecutorService executor = Executors.newScheduledThreadPool(2);

    // @PostConstruct – Inicialização automática
    @PostConstruct
    public void startSimulation() {
        sendClp1Update();

        sendClp2to4Updates();

        sendExpeditionUpdate();
    }

    // subscribe() – Adiciona cliente à lista de ouvintes SSE
    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L);

        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));

        return emitter;
    }

    public void updateStock() {
        sendClp1Update();
    }

    public void updateExpedition() {
        sendExpeditionUpdate();
    }

    // sendClp1Update() – Gera 28 bytes (valores de 0 a 3) para o CLP 1
    public void sendClp1Update() {
        try {
            plcConnectorEstoque = new PlcConnector("10.74.241.10", 102);
            plcConnectorEstoque.connect();
            
            indexColorEst = plcConnectorEstoque.readBlock(9, 68, 28);
            System.out.println("Dados brutos do estoque: " + Arrays.toString(indexColorEst));
            
            List<Integer> byteArray = new ArrayList<>();
            for (byte b : indexColorEst) {
                byteArray.add(b & 0xFF); // Converter byte com sinal para int sem sinal
            }
            
            ClpData clp1 = new ClpData(1, byteArray);
            sendToEmitters("clp1-data", clp1);
        } catch (Exception e) {
            System.err.println("Erro em sendClp1Update: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendExpeditionUpdate() {
        int values[] = new int[12];

        plcConnectorExpedicao = new PlcConnector("10.74.241.40", 102);
        List<Integer> byteArray = new ArrayList<>();

        try {
            plcConnectorExpedicao.connect();
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            int j = 0;
            for (int i = 6; i <= 28; i += 2) {
                values[j] = plcConnectorExpedicao.readInt(9, i);
                j++;
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Falha!");
        }

        for (int i = 0; i < 12; i++) {
            byteArray.add(values[i]);
        }

        ClpData expeditionData = new ClpData(5, byteArray);
        sendToEmitters("expedition-data", expeditionData);
    }

    private void sendClp2to4Updates() {
        Random rand = new Random();

        sendToEmitters("clp2-data", new ClpData(2, rand.nextInt(100)));
        sendToEmitters("clp3-data", new ClpData(3, rand.nextInt(100)));
        sendToEmitters("clp4-data", new ClpData(4, rand.nextInt(100)));
    }

    // sendToEmitters() – Envia um evento SSE para todos os clientes
    private void sendToEmitters(String eventName, ClpData clpData) {
        // Percorre todos os SseEmitters conectados.
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(clpData));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }

}