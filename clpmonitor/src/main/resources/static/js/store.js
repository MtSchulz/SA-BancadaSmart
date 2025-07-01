// Variáveis globais
let isSpun = false;
let blocoCount = 1;
const MAX_BLOCOS = 3;

// Função para renderizar os blocos com base no tipo de pedido
function renderBlocos() {
    const tipo = document.getElementById("tipoPedido").value;
    const container = document.getElementById("blocosContainer");
    container.innerHTML = "";

    let blocos = tipo === "simples" ? 1 : tipo === "duplo" ? 2 : 3;

    for (let b = 0; b < blocos; b++) {
        const nBloco = b + 1;
        const blocoDiv = document.createElement("div");
        blocoDiv.classList.add("bloco");
        blocoDiv.id = "bloco-container-" + nBloco;
        blocoDiv.innerHTML = `
            <h2>Bloco ${nBloco}</h2>
            <div class="pedido-view spin" id="pedido-view${nBloco}" data-is-spun="false">
                <img class="imagem" id="bloco-${nBloco}" src="assets/bloco/rBlocoCor0.png" alt="Bloco">
                <img class="imagem" id="lamina${nBloco}-3" src="#" alt="Lâmina 3">
                <img class="imagem" id="lamina${nBloco}-1" src="#" alt="Lâmina 1">
                <img class="imagem" id="lamina${nBloco}-2" src="#" alt="Lâmina 2">
                <img class="imagem" id="padrao${nBloco}-1" src="#" alt="Padrão 1">
                <img class="imagem" id="padrao${nBloco}-2" src="#" alt="Padrão 2">
                <img class="imagem" id="padrao${nBloco}-3" src="#" alt="Padrão 3">
                <button id="spin${nBloco}" class="spin" onclick="spin(${nBloco})">
                    <span class="material-symbols-rounded">chevron_right</span>
                </button>
            </div>
            
            <div class="input-box">
                <label for="block-color-${nBloco}">Cor do Bloco:</label>
                <select name="block-color-${nBloco}" id="block-color-${nBloco}" onchange="changePedidoView(${nBloco})">
                    <option value="">Nenhum</option>
                    <option value="1">Preto</option>
                    <option value="2">Vermelho</option>
                    <option value="3">Azul</option>
                </select>
            </div>
            
            <div class="input-combo">
                <div class="input-box">
                    <label for="l1-color-${nBloco}">Cor Lâmina 1</label>
                    <select name="l1-color-${nBloco}" id="l1-color-${nBloco}" disabled onchange="changePedidoView(${nBloco})">
                        <option value="" hidden selected>Selecione</option>
                        <option value="1">Vermelho</option>
                        <option value="2">Azul</option>
                        <option value="3">Amarelo</option>
                        <option value="4">Verde</option>
                        <option value="5">Preto</option>
                        <option value="6">Branco</option>
                    </select>
                </div>
                <div class="input-box">
                    <label for="l1-pattern-${nBloco}">Padrão Lâmina 1</label>
                    <select name="l1-pattern-${nBloco}" id="l1-pattern-${nBloco}" disabled onchange="changePedidoView(${nBloco})">
                        <option value="" hidden selected>Selecione</option>
                        <option value="">Nenhum</option>
                        <option value="1">Casa</option>
                        <option value="2">Navio</option>
                        <option value="3">Estrela</option>
                    </select>
                </div>
            </div>
            
            <div class="input-combo">
                <div class="input-box">
                    <label for="l2-color-${nBloco}">Cor Lâmina 2</label>
                    <select name="l2-color-${nBloco}" id="l2-color-${nBloco}" disabled onchange="changePedidoView(${nBloco})">
                        <option value="" hidden selected>Selecione</option>
                        <option value="1">Vermelho</option>
                        <option value="2">Azul</option>
                        <option value="3">Amarelo</option>
                        <option value="4">Verde</option>
                        <option value="5">Preto</option>
                        <option value="6">Branco</option>
                    </select>
                </div>
                <div class="input-box">
                    <label for="l2-pattern-${nBloco}">Padrão Lâmina 2</label>
                    <select name="l2-pattern-${nBloco}" id="l2-pattern-${nBloco}" disabled onchange="changePedidoView(${nBloco})">
                        <option value="" hidden selected>Selecione</option>
                        <option value="">Nenhum</option>
                        <option value="1">Casa</option>
                        <option value="2">Navio</option>
                        <option value="3">Estrela</option>
                    </select>
                </div>
            </div>
            
            <div class="input-combo">
                <div class="input-box">
                    <label for="l3-color-${nBloco}">Cor Lâmina 3</label>
                    <select name="l3-color-${nBloco}" id="l3-color-${nBloco}" disabled onchange="changePedidoView(${nBloco})">
                        <option value="" hidden selected>Selecione</option>
                        <option value="1">Vermelho</option>
                        <option value="2">Azul</option>
                        <option value="3">Amarelo</option>
                        <option value="4">Verde</option>
                        <option value="5">Preto</option>
                        <option value="6">Branco</option>
                    </select>
                </div>
                <div class="input-box">
                    <label for="l3-pattern-${nBloco}">Padrão Lâmina 3</label>
                    <select name="l3-pattern-${nBloco}" id="l3-pattern-${nBloco}" disabled onchange="changePedidoView(${nBloco})">
                        <option value="" hidden selected>Selecione</option>
                        <option value="">Nenhum</option>
                        <option value="1">Casa</option>
                        <option value="2">Navio</option>
                        <option value="3">Estrela</option>
                    </select>
                </div>
            </div>
        `;
        container.appendChild(blocoDiv);
    }
}

// Atualiza a visualização do pedido
function changePedidoView(id) {
    const blockColor = document.getElementById("block-color-" + id).value;
    const blocoImg = document.getElementById("bloco-" + id);

    if (blockColor !== "") {
        const timestamp = new Date().getTime();
        blocoImg.src = `assets/bloco/rBlocoCor${blockColor}.png?t=${timestamp}`;
        
        // Habilita os selects de cor
        ["l1-color-", "l2-color-", "l3-color-"].forEach(prefix => {
            document.getElementById(prefix + id).disabled = false;
        });

        // Obtém valores das lâminas
        const l1Color = document.getElementById("l1-color-" + id).value;
        const l2Color = document.getElementById("l2-color-" + id).value;
        const l3Color = document.getElementById("l3-color-" + id).value;

        // Obtém valores dos padrões
        const l1Pattern = document.getElementById("l1-pattern-" + id).value;
        const l2Pattern = document.getElementById("l2-pattern-" + id).value;
        const l3Pattern = document.getElementById("l3-pattern-" + id).value;

        const view = document.getElementById("pedido-view" + id);
        const isSpun = view.dataset.isSpun === "true";

        // Atualiza imagens das lâminas e padrões
        if (isSpun) {
            updateImage(`lamina${id}-3`, l1Color ? `assets/laminas/lamina3-${l1Color}.png?t=${timestamp}` : "#");
            updateImage(`lamina${id}-1`, l3Color ? `assets/laminas/lamina1-${l3Color}.png?t=${timestamp}` : "#");
            updatePattern(`padrao${id}-3`, l3Pattern, timestamp);
            document.getElementById(`padrao${id}-1`).hidden = true;
        } else {
            updateImage(`lamina${id}-1`, l1Color ? `assets/laminas/lamina1-${l1Color}.png?t=${timestamp}` : "#");
            updateImage(`lamina${id}-3`, l3Color ? `assets/laminas/lamina3-${l3Color}.png?t=${timestamp}` : "#");
            updatePattern(`padrao${id}-1`, l1Pattern, timestamp);
            document.getElementById(`padrao${id}-3`).hidden = true;
        }

        // Lâmina/padrão do meio
        updateImage(`lamina${id}-2`, l2Color ? `assets/laminas/lamina2-${l2Color}.png?t=${timestamp}` : "#");
        updatePattern(`padrao${id}-2`, l2Pattern, timestamp);

        // Habilita os padrões se uma cor estiver selecionada
        ["l1-pattern-", "l2-pattern-", "l3-pattern-"].forEach((prefix, index) => {
            const color = [l1Color, l2Color, l3Color][index];
            document.getElementById(prefix + id).disabled = !color;
        });
    } else {
        // Desabilita tudo se nenhuma cor de bloco foi selecionada
        ["l1-color-", "l2-color-", "l3-color-", "l1-pattern-", "l2-pattern-", "l3-pattern-"].forEach(prefix => {
            document.getElementById(prefix + id).disabled = true;
        });

        document.getElementById("bloco-" + id).src = "assets/bloco/rBlocoCor0.png";
        ["lamina", "padrao"].forEach(prefix => {
            for (let i = 1; i <= 3; i++) {
                document.getElementById(`${prefix}${id}-${i}`).src = "#";
            }
        });
    }
}

// Função auxiliar para atualizar imagens
function updateImage(elementId, src) {
    const element = document.getElementById(elementId);
    if (element) {
        element.src = src;
        element.hidden = src === "#";
    }
}

// Função auxiliar para atualizar padrões
function updatePattern(elementId, pattern, timestamp) {
    const element = document.getElementById(elementId);
    if (element) {
        element.src = pattern ? `assets/padroes/padrao${pattern}-1.png?t=${timestamp}` : "#";
        element.hidden = !pattern;
    }
}

// Função para girar o bloco
function spin(id) {
    const view = document.getElementById("pedido-view" + id);
    view.classList.toggle("spin");

    const isSpun = view.dataset.isSpun !== "true";
    view.dataset.isSpun = isSpun;

    const lamina1 = document.getElementById("lamina" + id + "-1");
    const lamina3 = document.getElementById("lamina" + id + "-3");

    const src1 = lamina1.src;
    const src3 = lamina3.src;

    const newSrc3 = src1.replace(/lamina\d-(\d)/, `lamina3-$1`);
    const newSrc1 = src3.replace(/lamina\d-(\d)/, `lamina1-$1`);

    document.getElementById("padrao" + id + "-3").hidden = !isSpun;
    document.getElementById("padrao" + id + "-1").hidden = isSpun;

    lamina1.src = newSrc1;
    lamina3.src = newSrc3;
}

// Função para enviar o pedido ao CLP
function enviarPedido() {
    const formData = new FormData();
    let hasData = false;

    // Coleta dados de todos os blocos
    document.querySelectorAll('[id^="bloco-container-"]').forEach(container => {
        const id = container.id.split('-')[2];
        hasData = true;

        const blockColor = document.getElementById(`block-color-${id}`).value;
        const l1Color = document.getElementById(`l1-color-${id}`).value;
        const l2Color = document.getElementById(`l2-color-${id}`).value;
        const l3Color = document.getElementById(`l3-color-${id}`).value;
        const l1Pattern = document.getElementById(`l1-pattern-${id}`).value;
        const l2Pattern = document.getElementById(`l2-pattern-${id}`).value;
        const l3Pattern = document.getElementById(`l3-pattern-${id}`).value;

        formData.append(`block-color-${id}`, blockColor);
        formData.append(`l1-color-${id}`, l1Color);
        formData.append(`l2-color-${id}`, l2Color);
        formData.append(`l3-color-${id}`, l3Color);
        if (l1Pattern) formData.append(`l1-pattern-${id}`, l1Pattern);
        if (l2Pattern) formData.append(`l2-pattern-${id}`, l2Pattern);
        if (l3Pattern) formData.append(`l3-pattern-${id}`, l3Pattern);
    });

    if (!hasData) {
        alert("Nenhum bloco configurado para envio!");
        return;
    }

    // Adiciona o tipo de pedido
    const tipoPedido = document.getElementById('tipoPedido').value;
    formData.append('tipoPedido', tipoPedido);

    // Envia para o endpoint do ClpController

    fetch("/store/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([pedido])
  }).then(res => {
      if (res.ok) {
          alert("Pedido enviado com sucesso!");
          listarPedidos();
      } else {
          alert("Erro ao enviar pedido.");
      }
  });
}

// Atualiza o status do pedido na interface
function updatePedidoStatus(message, type) {
    const statusDiv = document.getElementById("pedidoStatus");
    statusDiv.innerHTML = `<div class="status-message ${type}">${message}</div>`;
    
    if (type === "success") {
        setTimeout(() => {
            statusDiv.innerHTML = "";
        }, 5000);
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
    renderBlocos();
});