package com.clpmonitor.clpmonitor.Service;

import java.nio.ByteBuffer;

import org.springframework.stereotype.Service;

import com.clpmonitor.clpmonitor.PLC.PlcConnector;

@Service
public class PedidoTesteService {

    public void enviarPedidoTeste() {
        ByteBuffer bfPedido = ByteBuffer.allocate(60);

        bfPedido.putShort((short) 1); // Cor_Andar_1
        bfPedido.putShort((short) 1); // Posicao_Estoque_Andar_1
        bfPedido.putShort((short) 1); // Cor_Lamina_1_Andar_1
        bfPedido.putShort((short) 2); // Cor_Lamina_2_Andar_1
        bfPedido.putShort((short) 3); // Cor_Lamina_3_Andar_1
        bfPedido.putShort((short) 0); // Padrao_Lamina_1_Andar_1
        bfPedido.putShort((short) 0); // Padrao_Lamina_2_Andar_1
        bfPedido.putShort((short) 0); // Padrao_Lamina_3_Andar_1
        bfPedido.putShort((short) 1); // Processamento_Andar_1

        bfPedido.putShort((short) 0); // Cor_Andar_2
        bfPedido.putShort((short) 0); // Posicao_Estoque_Andar_2
        bfPedido.putShort((short) 0); // Cor_Lamina_1_Andar_2
        bfPedido.putShort((short) 0); // Cor_Lamina_2_Andar_2
        bfPedido.putShort((short) 0); // Cor_Lamina_3_Andar_2
        bfPedido.putShort((short) 0); // Padrao_Lamina_1_Andar_2
        bfPedido.putShort((short) 0); // Padrao_Lamina_2_Andar_2
        bfPedido.putShort((short) 0); // Padrao_Lamina_3_Andar_2
        bfPedido.putShort((short) 0); // Processamento_Andar_2

        bfPedido.putShort((short) 0); // Cor_Andar_3
        bfPedido.putShort((short) 0); // Posicao_Estoque_Andar_3
        bfPedido.putShort((short) 0); // Cor_Lamina_1_Andar_3
        bfPedido.putShort((short) 0); // Cor_Lamina_2_Andar_3
        bfPedido.putShort((short) 0); // Cor_Lamina_3_Andar_3
        bfPedido.putShort((short) 0); // Padrao_Lamina_1_Andar_3
        bfPedido.putShort((short) 0); // Padrao_Lamina_2_Andar_3
        bfPedido.putShort((short) 0); // Padrao_Lamina_3_Andar_3
        bfPedido.putShort((short) 0); // Processamento_Andar_3

        bfPedido.putShort((short) 205); // Numero_Pedido
        bfPedido.putShort((short) 1); // Andares
        bfPedido.putShort((short) 12); // Posicao_Expedicao

        PlcConnector plc = new PlcConnector("10.74.241.10", 102);
        try {
            plc.connect();

            if (plc.writeBlock(9, 2, 60, bfPedido.array())) {
                System.out.println("Envio do pedido realizado com sucesso");

                plc.writeBit(9, 64, 0, false); // RecebidoEstoque
                plc.writeBit(9, 64, 1, false); // IniciarGuardar
                plc.writeBit(9, 62, 0, false); // IniciarPedido

                // Inicia pedido
                plc.writeBit(9, 62, 0, true); // IniciarPedido

                Thread.sleep(100);

                if (plc.readBit(9, 100, 0)) {
                    plc.writeBit(9, 62, 0, false); // IniciarPedido
                }

                Thread.sleep(100);

                if (plc.readBit(9, 98, 2)) {
                    /* StartOP */
                    plc.writeBit(9, 0, 0, true); // RecebidoOP
                }

            } else {
                System.out.println("Falha no envio do pedido.");
            }
        } catch (Exception e1) {
            e1.printStackTrace();
        } finally {
            try {
                if (plc != null) {
                    plc.disconnect();
                }
            } catch (Exception e1) {
                e1.printStackTrace();
            }
        }
    }
}