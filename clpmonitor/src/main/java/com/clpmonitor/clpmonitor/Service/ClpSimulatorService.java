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
    private byte[] indexColorEst = new byte[28];
    private byte[] indexColorExp = new byte[12];

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    private final ScheduledExecutorService executor = Executors.newScheduledThreadPool(2);

    @PostConstruct
    public void startSimulation() {
        sendClp1Update();
        sendClp2to4Updates();
        sendExpeditionUpdate();
    }

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(30_000L); // Timeout de 30 segundos
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

    public synchronized List<Integer> getEstoque() {
        List<Integer> estoque = new ArrayList<>();
        for (byte b : indexColorEst) {
            estoque.add(b & 0xFF);
        }
        return estoque;
    }

    public synchronized void atualizarPosicaoEstoque(int posicao, int valor) throws Exception {
        if (posicao < 0 || posicao >= 28) {
            throw new IllegalArgumentException("Posição inválida. Deve ser entre 0 e 27.");
        }
        if (valor < 0 || valor > 3) {
            throw new IllegalArgumentException("Valor inválido. Deve ser entre 0 e 3.");
        }

        if (plcConnectorEstoque != null) {
            plcConnectorEstoque.disconnect();
        }
        plcConnectorEstoque = new PlcConnector("10.74.241.10", 102);
        plcConnectorEstoque.connect();

        plcConnectorEstoque.writeByte(9, 68 + posicao, (byte) valor);
        indexColorEst[posicao] = (byte) valor;
        sendClp1Update();
    }

    public synchronized void atualizarEstoqueCompleto(List<Integer> novosValores) throws Exception {
        if (novosValores == null || novosValores.size() != 28) {
            throw new IllegalArgumentException("Deve fornecer exatamente 28 valores.");
        }

        if (plcConnectorEstoque != null) {
            plcConnectorEstoque.disconnect();
        }
        plcConnectorEstoque = new PlcConnector("10.74.241.10", 102);
        plcConnectorEstoque.connect();

        byte[] bytes = new byte[28];
        for (int i = 0; i < 28; i++) {
            bytes[i] = (byte) novosValores.get(i).intValue();
        }

        plcConnectorEstoque.writeBlock(9, 68, bytes.length, bytes);
        System.arraycopy(bytes, 0, indexColorEst, 0, 28);
        sendClp1Update();
    }

    public void sendClp1Update() {
        try {
            if (plcConnectorEstoque != null) {
                plcConnectorEstoque.disconnect();
            }
            plcConnectorEstoque = new PlcConnector("10.74.241.10", 102);
            plcConnectorEstoque.connect();
            
            indexColorEst = plcConnectorEstoque.readBlock(9, 68, 28);
            System.out.println("Dados brutos do estoque: " + Arrays.toString(indexColorEst));
            
            List<Integer> byteArray = new ArrayList<>();
            for (byte b : indexColorEst) {
                byteArray.add(b & 0xFF);
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

        if (plcConnectorExpedicao != null) {
            try {
                plcConnectorExpedicao.disconnect();
            } catch (Exception e) {
                System.err.println("Erro ao desconectar plcConnectorExpedicao: " + e.getMessage());
            }
        }
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
            indexColorExp[i] = (byte) values[i];
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

    private void sendToEmitters(String eventName, ClpData clpData) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(clpData));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }
}