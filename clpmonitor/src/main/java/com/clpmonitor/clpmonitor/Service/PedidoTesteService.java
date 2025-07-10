/*
 * package com.clpmonitor.clpmonitor.Service;
 * 
 * import java.nio.ByteBuffer;
 * import java.util.List;
 * import java.util.Map;
 * 
 * import org.springframework.stereotype.Service;
 * 
 * import com.clpmonitor.clpmonitor.Model.Block;
 * import com.clpmonitor.clpmonitor.Model.Orders;
 * import com.clpmonitor.clpmonitor.Model.Storage;
 * import com.clpmonitor.clpmonitor.PLC.PlcConnector;
 * import com.clpmonitor.clpmonitor.Repository.BlockRepository;
 * import com.clpmonitor.clpmonitor.Repository.OrdersRepository;
 * import com.clpmonitor.clpmonitor.Repository.StorageRepository;
 * 
 * import jakarta.transaction.Transactional;
 * 
 * @Service
 * public class PedidoTesteService {
 * 
 * private final BlockRepository blockRepository;
 * private final StorageRepository storageRepository;
 * private final OrdersRepository ordersRepository;
 * 
 * public PedidoTesteService(BlockRepository blockRepository,
 * StorageRepository storageRepository,
 * OrdersRepository ordersRepository) {
 * this.blockRepository = blockRepository;
 * this.storageRepository = storageRepository;
 * this.ordersRepository = ordersRepository;
 * }
 * 
 * @Transactional
 * public void enviarPedidoTeste(Map<String, String> formData) {
 * // Determinar quantos blocos foram preenchidos
 * int totalBlocos = 0;
 * for (int i = 1; i <= 3; i++) {
 * if (formData.containsKey("block-color-" + i) && !formData.get("block-color-"
 * + i).isEmpty()) {
 * totalBlocos++;
 * }
 * }
 * System.out.println(totalBlocos);
 * if (totalBlocos > 0) {
 * // Criar nova ordem de produção
 * Orders newOrder = new Orders();
 * newOrder.setProductionOrder(ordersRepository.count() + 1);
 * newOrder = ordersRepository.save(newOrder);
 * ByteBuffer bfPedido = ByteBuffer.allocate(60);
 * 
 * Storage expedicao = storageRepository.findById(2L)
 * .orElseThrow(() -> new
 * RuntimeException("Armazém de expedição não encontrado"));
 * 
 * // Encontrar primeira posição livre na expedição
 * int posicaoExpedicao = findFirstAvailablePosition(expedicao.getId());
 * if (posicaoExpedicao == -1) {
 * throw new RuntimeException("Armazém de expedição está cheio (12 posições)");
 * }
 * System.out.println(posicaoExpedicao);
 * // Processar cada bloco
 * for (int blocoNum = 1; blocoNum <= 3; blocoNum++) {
 * String blockColorKey = "block-color-" + blocoNum;
 * System.out.println("Bloco" + blocoNum);
 * System.out.println(formData.containsKey("block-color-"));
 * if (formData.containsKey(blockColorKey) &&
 * !formData.get(blockColorKey).isEmpty()) {
 * int blockColor = Integer.parseInt(formData.get(blockColorKey));
 * System.out.println("bloco " + blockColor);
 * // BUSCA ORIGINAL NO ESTOQUE POR COR (storageId = 1)
 * List<Block> blocosDisponiveis =
 * blockRepository.findAvailableBlocksByColor(blockColor);
 * if (blocosDisponiveis.isEmpty()) {
 * throw new RuntimeException("Não há blocos disponíveis da cor " + blockColor +
 * " no estoque");
 * }
 * 
 * // Pega o primeiro bloco disponível (já ordenado por posição)
 * Block block = blocosDisponiveis.get(0);
 * int posicaoOriginalEstoque = block.getPosition(); // Guarda a posição
 * original
 * 
 * // DEBUG: Mostrar bloco selecionado
 * System.out.println("Bloco selecionado - Cor: " + block.getColor() +
 * ", Posição Estoque: " + posicaoOriginalEstoque +
 * ", ID: " + block.getId());
 * 
 * // Mover bloco para expedição (storageId = 2)
 * block.setStorageId(expedicao);
 * block.setPosition(posicaoExpedicao); // Usa posição sequencial da expedição
 * block.setProductionOrder(newOrder);
 * blockRepository.save(block);
 * 
 * gravarPedidoNaExpedicaoCLP(newOrder, block, posicaoExpedicao);
 * 
 * // Escrever dados do bloco (usa a posição ORIGINAL do estoque para o CLP)
 * bfPedido.putShort((short) blockColor);
 * bfPedido.putShort((short) posicaoOriginalEstoque); // POSIÇÃO NO ESTOQUE
 * bfPedido.putShort((short) getValueOrDefault(formData, "l1-color-" + blocoNum,
 * 0));
 * bfPedido.putShort((short) getValueOrDefault(formData, "l2-color-" + blocoNum,
 * 0));
 * bfPedido.putShort((short) getValueOrDefault(formData, "l3-color-" + blocoNum,
 * 0));
 * bfPedido.putShort((short) getValueOrDefault(formData, "l1-pattern-" +
 * blocoNum, 0));
 * bfPedido.putShort((short) getValueOrDefault(formData, "l2-pattern-" +
 * blocoNum, 0));
 * bfPedido.putShort((short) getValueOrDefault(formData, "l3-pattern-" +
 * blocoNum, 0));
 * bfPedido.putShort((short) 1);
 * } else {
 * System.out.println("else");
 * // Preencher com zeros se bloco não usado
 * for (int i = 0; i < 9; i++) {
 * bfPedido.putShort((short) 0);
 * }
 * }
 * }
 * // Número do pedido e informações adicionais
 * bfPedido.putShort(newOrder.getProductionOrder().shortValue());
 * bfPedido.putShort((short) totalBlocos);
 * bfPedido.putShort((short) posicaoExpedicao);
 * 
 * // Enviar para o CLP
 * sendToPlc(bfPedido, formData, newOrder.getProductionOrder());
 * 
 * } else {
 * System.out.println("Sem blocos");
 * }
 * 
 * }
 * 
 * private int findFirstAvailablePosition(Long storageId) {
 * List<Integer> posicoesOcupadas =
 * blockRepository.findOccupiedPositionsInExpedicao();
 * for (int i = 1; i <= 12; i++) {
 * if (!posicoesOcupadas.contains(i)) {
 * return i;
 * }
 * }
 * return -1;
 * }
 * 
 * private void sendToPlc(ByteBuffer buffer, Map<String, String> formData, Long
 * orderNumber) {
 * PlcConnector plc = new PlcConnector("10.74.241.10", 102);
 * try {
 * plc.connect();
 * 
 * if (plc.writeBlock(9, 2, 60, buffer.array())) {
 * System.out.println("Pedido " + orderNumber + " enviado com sucesso");
 * 
 * plc.writeBit(9, 64, 0, false); // RecebidoEstoque
 * plc.writeBit(9, 64, 1, false); // IniciarGuardar
 * plc.writeBit(9, 62, 0, false); // IniciarPedido
 * 
 * // Inicia pedido
 * plc.writeBit(9, 62, 0, true); // IniciarPedido
 * 
 * boolean pedidoProcessado = false;
 * int tentativas = 0;
 * while (!pedidoProcessado && tentativas < 10) {
 * Thread.sleep(200);
 * pedidoProcessado = plc.readBit(9, 100, 0); // PedidoRecebido
 * tentativas++;
 * }
 * 
 * Thread.sleep(100);
 * 
 * if (pedidoProcessado) {
 * plc.writeBit(9, 62, 0, false); // desligar sinal do inicio
 * limparBlocoRetirado(plc, formData);
 * plc.writeBit(9, 0, 0, true); // RecebidoOP
 * } else {
 * System.out.println("Timeout: Pedido não foi processado");
 * }
 * } else {
 * throw new RuntimeException("Falha no envio do pedido para o CLP");
 * }
 * } catch (Exception e) {
 * throw new RuntimeException("Erro na comunicação com o CLP", e);
 * } finally {
 * try {
 * plc.disconnect();
 * } catch (Exception e) {
 * System.err.println("Erro ao desconectar do CLP: " + e.getMessage());
 * }
 * }
 * }
 * 
 * private void gravarPedidoNaExpedicaoCLP(Orders order, Block block, int
 * posicaoExpedicao) {
 * PlcConnector plcExpedicao = new PlcConnector("10.74.241.40", 102);
 * try {
 * plcExpedicao.connect();
 * 
 * // cada posição ocupa 2 bytes (DB9.6-7, DB9.8-9, etc.)
 * int offsetExpedicao = 6 + (posicaoExpedicao - 1) * 2;
 * 
 * // Converter apenas o número do pedido para 2 bytes
 * ByteBuffer buffer = ByteBuffer.allocate(2);
 * buffer.putShort(order.getProductionOrder().shortValue());
 * 
 * // Gravar os 2 bytes do número do pedido
 * if (!plcExpedicao.writeBlock(9, offsetExpedicao, 2, buffer.array())) {
 * throw new RuntimeException("Falha ao gravar número do pedido na expedição");
 * }
 * 
 * // LOG
 * System.out.println(String.format(
 * "Número do pedido %d gravado CORRETAMENTE na posição %d (DB9.%d a %d)",
 * order.getProductionOrder(),
 * posicaoExpedicao,
 * offsetExpedicao,
 * offsetExpedicao + 1));
 * 
 * // Ativar flag de confirmação (opcional, mantido conforme seu código
 * original)
 * int bytePos = 100 + (posicaoExpedicao / 8);
 * int bitPos = posicaoExpedicao % 8;
 * plcExpedicao.writeBit(9, bytePos, bitPos, true);
 * 
 * } catch (Exception e) {
 * System.err.println("Erro ao gravar na expedição: " + e.getMessage());
 * throw new RuntimeException("Falha na comunicação com CLP de expedição", e);
 * } finally {
 * try {
 * plcExpedicao.disconnect();
 * } catch (Exception e) {
 * System.err.println("Erro ao desconectar CLP expedição: " + e.getMessage());
 * }
 * }
 * }
 * 
 * private int getValueOrDefault(Map<String, String> formData, String key, int
 * defaultValue) {
 * if (formData.containsKey(key) && !formData.get(key).isEmpty()) {
 * return Integer.parseInt(formData.get(key));
 * }
 * return defaultValue;
 * }
 * 
 * private void limparBlocoRetirado(PlcConnector plc, Map<String, String>
 * formData) throws Exception {
 * for (int blocoNum = 1; blocoNum <= 3; blocoNum++) {
 * if (formData.containsKey("block-color-" + blocoNum) &&
 * !formData.get("block-color-" + blocoNum).isEmpty()) {
 * 
 * int offset = (blocoNum - 1) * 18;
 * byte[] zeros = new byte[18];
 * plc.writeBlock(9, offset, 18, zeros);
 * 
 * System.out.println("Bloco " + blocoNum +
 * " removido da memória do CLP (offset: " + offset + ")");
 * }
 * }
 * }
 * }
 */