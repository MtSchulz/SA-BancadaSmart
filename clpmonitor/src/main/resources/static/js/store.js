// store.js - Arquivo consolidado e organizado

// =============================================
// Variáveis globais
// =============================================
let isSpun = false;
let blocoCount = 1;
const MAX_BLOCOS = 3;

// =============================================
// Funções de inicialização e renderização
// =============================================

/**
 * Renderiza os blocos com base no tipo de pedido selecionado
 */
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
            <h2>Bloco ${b + 1}</h2>

            <div class="pedido-view spin" id="pedido-view${nBloco}">
                    <img class="imagem" id="bloco-${nBloco}" src="assets/bloco/rblocoCor0.png" alt="Bloco">
                    <img class="imagem" id="lamina${nBloco}-3" src="#" alt="Lâmina 3">
                    <img class="imagem" id="lamina${nBloco}-1" src="#" alt="Lâmina 1">
                    <img class="imagem" id="lamina${nBloco}-2" src="#" alt="Lâmina 2">
                    <img class="imagem" id="padrao${nBloco}-1" src="#" alt="Padrão 1">
                    <img class="imagem" id="padrao${nBloco}-2" src="#" alt="Padrão 2">
                    <img class="imagem" id="padrao${nBloco}-3" src="#" alt="Padrão 3">
                    <button id="spin${nBloco}" class="spin" onclick="spin(${nBloco})"><span
                            class="material-symbols-rounded">chevron_right</span></button>
            </div>
            
            <div class="input-box">
                <label  for="block-color-${nBloco}">Cor do Bloco:
                    <select name="block-color-${nBloco}" id="block-color-${nBloco}" onchange="changePedidoView(${nBloco})">
                        <option value="">Nenhum</option>
                        <option value="1">Preto</option>
                        <option value="2">Vermelho</option>
                        <option value="3">Azul</option>
                    </select>
                </label>
            </div>
            <div class="input-combo">
                        <div class="input-box">
                            <label for="l1-color-1">Cor Lâmina 1</label>
                            <select name="l1-color-1" id="l1-color-${nBloco}" disabled onchange="changePedidoView(${nBloco}, this.value)">
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
                            <label for="l1-pattern-1">Padrão Lâmina 1</label>
                            <select name="l1-pattern-1" id="l1-pattern-${nBloco}" disabled onchange="changePedidoView(${nBloco}, this.value)">
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
                            <label for="l2-color-1">Cor Lâmina 2</label>
                            <select name="l2-color-1" id="l2-color-${nBloco}" disabled onchange="changePedidoView(${nBloco}, this.value)">
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
                            <label for="l2-pattern-1">Padrão Lâmina 2</label>
                            <select name="l2-pattern-1" id="l2-pattern-${nBloco}" disabled onchange="changePedidoView(${nBloco}, this.value)">
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
                            <label for="l3-color-1">Cor Lâmina 3</label>
                            <select name="l3-color-1" id="l3-color-${nBloco}" disabled onchange="changePedidoView(${nBloco}, this.value)">
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
                            <label for="l3-pattern-1">Padrão Lâmina 3</label>
                            <select name="l3-pattern-1" id="l3-pattern-${nBloco}" disabled onchange="changePedidoView(${nBloco}, this.value)">
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

/**
 * Atualiza a visualização do bloco com base nas seleções
 */
function changePedidoView(id, lamina) {
  const blockColor = document.getElementById("block-color-" + id).value;
  const blocoImg = document.getElementById("bloco-" + id);

  if (blockColor !== "") {
    const timestamp = new Date().getTime();
    blocoImg.src = `assets/bloco/rBlocoCor${blockColor}.png?t=${timestamp}`;

    // Habilita os selects de cor
    ["l1-color-", "l2-color-", "l3-color-"].forEach(prefix => {
      document.getElementById(prefix + id).disabled = false;
    });

    // Restante do código permanece igual
    const l1Color = document.getElementById("l1-color-" + id).value;
    const l2Color = document.getElementById("l2-color-" + id).value;
    const l3Color = document.getElementById("l3-color-" + id).value;

    const l1Pattern = document.getElementById("l1-pattern-" + id).value;
    const l2Pattern = document.getElementById("l2-pattern-" + id).value;
    const l3Pattern = document.getElementById("l3-pattern-" + id).value;

    const view = document.getElementById("pedido-view" + id);
    const isSpun = view.dataset.isSpun === "true";

    // Atualiza as lâminas e padrões
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
    const patternElement = document.getElementById(`padrao${id}-2`);
    if (patternElement) {
      patternElement.src = l2Pattern ? `assets/padroes/padrao${l2Pattern}-2.png?t=${timestamp}` : "#";
      patternElement.hidden = !l2Pattern;
    }

    // Habilita os padrões caso uma cor esteja selecionada
    ["l1-pattern-", "l2-pattern-", "l3-pattern-"].forEach((prefix, index) => {
      const color = [l1Color, l2Color, l3Color][index];
      document.getElementById(prefix + id).disabled = !color;
    });

  } else {
    // Código para quando não há cor selecionada
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

// Funções auxiliares
function updateImage(elementId, src) {
  const element = document.getElementById(elementId);
  if (element) {
    element.src = src;
    element.hidden = src === "#";
  }
}

function updatePattern(elementId, pattern, timestamp) {
  const element = document.getElementById(elementId);
  if (element) {
    // Verifica se é o padrão da lâmina do meio (padraoX-2)
    const isMiddlePattern = elementId.includes('-2');
    const patternSuffix = isMiddlePattern ? '2' : '1';

    element.src = pattern ? `assets/padroes/padrao${pattern}-${patternSuffix}.png?t=${timestamp}` : "#";
    element.hidden = !pattern;
  }
}

/**
 * Gira o pedido (espelha as lâminas/padrões 1 e 3)
 */
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

/*fetch("/pedidoTeste", {
  method: "POST",
  body: formData,
}).then((response) => {
  if (response.redirected) {
    window.location.href = response.url;
    //console.log("Pedido:", pedido);
    console.log(JSON.stringify(pedido, null, 2));
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
});*/

// =============================================
// Funções de manipulação de pedidos
// =============================================

/**
 * Envia pedido para a base de dados
 */
// Envia pedido para a base de dados
function enviarPedido() {
  event.preventDefault();
  
  const tipoPedido = document.getElementById("tipoPedido").value;
  const blocosCount = tipoPedido === "simples" ? 1 : tipoPedido === "duplo" ? 2 : 3;

  const pedido = {
    ipClp: "10.74.241.10", // IP do CLP de estoque
    tipoPedido: tipoPedido,
    blocos: []
  };

  // Coletar dados dos blocos
  for (let i = 1; i <= blocosCount; i++) {
    const blockColor = document.getElementById(`block-color-${i}`).value;
    if (!blockColor) {
      alert(`Por favor, selecione uma cor para o Bloco ${i}`);
      return;
    }

    const bloco = {
      corBloco: parseInt(blockColor), // Campo obrigatório para o backend
      laminas: []
    };

    // Coletar lâminas (opcional)
    for (let j = 1; j <= 3; j++) {
      const laminaColor = document.getElementById(`l${j}-color-${i}`).value;
      const laminaPattern = document.getElementById(`l${j}-pattern-${i}`).value;

      if (laminaColor) {
        bloco.laminas.push({
          cor: parseInt(laminaColor),
          padrao: laminaPattern ? parseInt(laminaPattern) : 0
        });
      }
    }

    pedido.blocos.push(bloco);
  }

  // Feedback visual durante o envio
  const btnEnviar = document.querySelector('.btn-primary');
  const originalText = btnEnviar.innerHTML;
  btnEnviar.innerHTML = '<span class="material-symbols-rounded">hourglass_empty</span> Enviando...';
  btnEnviar.disabled = true;

  // Enviar pedido
  fetch("/clp/pedidoTeste", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pedido)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert(`Pedido ${data.tipoPedido} enviado com sucesso! Número OP: OP-${data.orderId}`);
      updateExpedition(); // Atualizar grid de expedição
      renderBlocos(); // Resetar o formulário
    } else {
      alert("Erro: " + data.message);
    }
  })
  .catch(error => {
    console.error("Erro:", error);
    alert("Erro ao enviar pedido: " + error.message);
  })
  .finally(() => {
    btnEnviar.innerHTML = originalText;
    btnEnviar.disabled = false;
  });
}
window.onclick = function (event) {
  const modal = document.getElementById('pedidoModal');
  if (event.target == modal) {
    closeModal();
  }
}

/**
 * Lista pedidos no frontend
 */
function listarPedidos() {
  fetch("/store/orders")
    .then(response => response.json())
    .then(data => {
      const listaContainer = document.getElementById("listaPedidos");
      listaContainer.innerHTML = "";

      if (data.length === 0) {
        listaContainer.innerHTML += "<p>Nenhum pedido encontrado.</p>";
        return;
      }

      data.forEach((pedido, index) => {
        const pedidoDiv = document.createElement("div");
        pedidoDiv.classList.add("pedido");

        pedidoDiv.innerHTML = `<h3>Pedido ${index + 1} - Tipo: ${pedido.tipo}</h3>`;

        pedido.blocos.forEach((bloco, i) => {
          const blocoDiv = document.createElement("div");
          blocoDiv.innerHTML = `<strong>Bloco ${i + 1}</strong> - Cor: ${bloco.cor}<br>`;

          bloco.laminas.forEach((lamina, j) => {
            blocoDiv.innerHTML += `&nbsp;&nbsp;Lâmina ${j + 1} - Cor: ${lamina.cor}, Padrão: ${lamina.padrao}<br>`;
          });

          pedidoDiv.appendChild(blocoDiv);
        });

        listaContainer.appendChild(pedidoDiv);
      });
    })
    .catch(() => {
      alert("Erro ao carregar pedidos.");
    });
}




// =============================================
// Funções de histórico
// =============================================

/**
 * Lista o histórico de pedidos
 */
/* 
function listarHistorico() {
  fetch("/store/orders/history")
    .then(response => response.json())
    .then(data => {
      const listaContainer = document.getElementById("listaHistorico");
      listaContainer.innerHTML = "";
 
      if (data.length === 0) {
        listaContainer.innerHTML = "<p>Nenhum pedido histórico encontrado.</p>";
        document.getElementById("totalPedidos").textContent = "0";
        return;
      }
 
      document.getElementById("totalPedidos").textContent = data.length;
 
      data.forEach((pedido, index) => {
        const pedidoDiv = document.createElement("div");
        pedidoDiv.classList.add("pedido");
 
        const dataPedido = pedido.data ? new Date(pedido.data).toLocaleString() : "Data não disponível";
 
        pedidoDiv.innerHTML = `
                    <div class="pedido-header">
                        <h3>Pedido #${pedido.id || index + 1} - ${dataPedido}</h3>
                        <span class="pedido-tipo">Tipo: ${pedido.tipo}</span>
                    </div>
                `;
 
        pedido.blocos.forEach((bloco, i) => {
          const blocoDiv = document.createElement("div");
          blocoDiv.classList.add("bloco-info");
 
          blocoDiv.innerHTML = `
                        <strong>Bloco ${i + 1}</strong> - Cor: ${bloco.cor || "Não especificada"}
                        <div class="laminas-container">
                            ${bloco.laminas.map((lamina, j) => `
                                <div class="lamina-info">
                                    <span>Lâmina ${j + 1}:</span>
                                    <span>Cor: ${lamina.cor || "-"}</span>
                                    <span>Padrão: ${lamina.padrao || "-"}</span>
                                </div>
                            `).join("")}
                        </div>
                    `;
 
          pedidoDiv.appendChild(blocoDiv);
        });
 
        listaContainer.appendChild(pedidoDiv);
      });
    })
    .catch(error => {
      console.error("Erro ao carregar histórico:", error);
      document.getElementById("listaHistorico").innerHTML =
        "<p>Erro ao carregar histórico de pedidos.</p>";
    });
}
*/
/**
 * Filtra o histórico de pedidos
 */
function filtrarHistorico() {
  const dataInicio = document.getElementById('dataInicio').value;
  const dataFim = document.getElementById('dataFim').value;
  const tipo = document.getElementById('filtroTipo').value;

  // Implementação do filtro pode ser adicionada aqui
  listarHistorico();

  console.log(`Filtrando por: ${dataInicio} até ${dataFim}, Tipo: ${tipo}`);
}

/**
 * Limpa os filtros do histórico
 */
function limparFiltros() {
  document.getElementById('dataInicio').value = '';
  document.getElementById('dataFim').value = '';
  document.getElementById('filtroTipo').value = '';
  listarHistorico();
}

// =============================================
// Funções de sidebar e menu
// =============================================

/**
 * Alterna a visibilidade da sidebar
 */
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('active');
}

/**
 * Adiciona o botão de menu em telas pequenas
 */
function addMenuButton() {
  if (window.innerWidth <= 768) {
    const header = document.querySelector('.header');
    if (!document.querySelector('.menu-button')) {
      const menuButton = document.createElement('button');
      menuButton.className = 'menu-button btn btn-secondary';
      menuButton.innerHTML = '<span class="material-symbols-rounded">menu</span>';
      menuButton.onclick = toggleSidebar;
      header.insertBefore(menuButton, header.firstChild);
    }
  }
}

// Event listener para fechar sidebar ao clicar fora
document.addEventListener('click', function (event) {
  const sidebar = document.querySelector('.sidebar');
  const isClickInsideSidebar = sidebar.contains(event.target);
  const isClickOnMenuButton = event.target.closest('.menu-button');

  if (window.innerWidth <= 768 && !isClickInsideSidebar && !isClickOnMenuButton) {
    sidebar.classList.remove('active');
  }
});

// =============================================
// Funções de manipulação dinâmica de blocos (jQuery)
// =============================================

// Visualização completa do bloco
function atualizarVisualizacao() {
  const visualizacao = document.getElementById('visualizacaoBloco');
  if (!visualizacao) return;

  visualizacao.innerHTML = '<p class="loading">Carregando visualização...</p>';

  // Cria container principal
  const container = document.createElement('div');
  container.className = 'visualizacao-container stacked-view';

  // Cria container para os blocos empilhados
  const blocosStack = document.createElement('div');
  blocosStack.className = 'blocos-stack';

  // Obtém todos os blocos visíveis na interface
  const blocosCount = document.querySelectorAll('[id^="bloco-container-"]').length;

  // Adiciona cada bloco à visualização empilhada
  for (let i = 1; i <= blocosCount; i++) {
    const blocoDiv = document.createElement('div');
    blocoDiv.className = `bloco-view bloco-${i}`;

    // Cria a visualização do bloco individual
    const viewDiv = document.createElement('div');
    viewDiv.className = 'bloco-individual-view';

    // Adiciona imagens na ordem correta
    const addImage = (elementId, zIndex) => {
      const imgElement = document.getElementById(elementId);
      if (imgElement && imgElement.src && !imgElement.src.includes('#')) {
        const img = document.createElement('img');
        img.className = 'stacked-image';
        img.src = imgElement.src;
        img.alt = imgElement.alt;
        img.style.zIndex = zIndex;
        viewDiv.appendChild(img);
      }
    };

    // Adiciona componentes na ordem correta para empilhamento
    addImage(`bloco-${i}`, 1); // Bloco base

    // Lâminas
    addImage(`lamina${i}-3`, 10); // Lâmina esquerda (ou direita se girado)
    addImage(`lamina${i}-1`, 20); // Lâmina direita (ou esquerda se girado)
    addImage(`lamina${i}-2`, 30); // Lâmina central

    // Padrões
    for (let j = 1; j <= 3; j++) {
      addImage(`padrao${i}-${j}`, 40 + j);
    }

    blocoDiv.appendChild(viewDiv);
    blocosStack.appendChild(blocoDiv);
  }

  container.appendChild(blocosStack);
  visualizacao.innerHTML = '';
  visualizacao.appendChild(container);
}

/**
 * Carrega as cores disponíveis do backend
 */
function carregarCoresDisponiveis() {
  fetch('/api/cores-disponiveis')
    .then(response => response.json())
    .then(cores => {
      $('[id^="block-color-"]').each(function () {
        const select = $(this);
        const currentValue = select.val();

        // Mantém a primeira opção e remove as demais
        select.find('option:not(:first)').remove();

        // Adiciona as novas opções
        cores.forEach(cor => {
          select.append(`<option value="${cor.codigoCor}">${cor.nomeCor}</option>`);
        });

        // Restaura o valor selecionado se ainda estiver disponível
        if (currentValue && cores.some(c => c.codigoCor == currentValue)) {
          select.val(currentValue);
        }
      });
    })
    .catch(error => console.error('Erro ao carregar cores:', error));
}

// =============================================
// Inicialização e eventos
// =============================================


document.addEventListener("DOMContentLoaded", () => {
  // Adiciona botão de menu
  addMenuButton();

  // Verifica e insere seção hidden se necessário
  function checkAndInsertHidden() {
    const blocoCount = $('section[id^="section-bloco-"]').length;
    const hiddenExists = $('.hidden').length > 0;

    if (blocoCount === 1 && !hiddenExists) {
      $('.plus').after('<section class="hidden"></section>');
    }
  }

  document.addEventListener("DOMContentLoaded", () => {

  })

  // Adiciona o botão de excluir
  function addDeleteButton(section) {
    const deleteBtn = $('<span class="delete-btn material-symbols-rounded">close</span>');
    deleteBtn.click(function () {
      section.remove();
    });
    section.prepend(deleteBtn);
  }

  // Adiciona novo bloco
  $(document).on('click', '.plus span', function () {
    const currentCount = $('section[id^="section-bloco-"]').length;

    if (currentCount >= MAX_BLOCOS) {
      alert('Você atingiu o número máximo de blocos (' + MAX_BLOCOS + ')');
      return;
    }

    blocoCount++;

    const original = $("#section-bloco-1").clone(true);
    const newId = "section-bloco-" + blocoCount;
    original.attr("id", newId);

    // Atualiza os IDs e atributos
    original.find("*").each(function () {
      const el = $(this);
      ["id", "for", "name", "onclick", "onchange"].forEach(attr => {
        const val = el.attr(attr);
        if (val) {
          el.attr(attr, val
            .replace(/(lamina|padrao)(\d+)-(\d+)/g, (_, tipo, x, y) => `${tipo}${blocoCount}-${y}`)
            .replace(/([^\d])-(1)\b/g, `$1-${blocoCount}`)
            .replace(/\bspin\(\d+\)/g, `spin(${blocoCount})`)
            .replace(/\bchangePedidoView\(\d+\)/g, `changePedidoView(${blocoCount})`)
          );
        }
      });
    });

    // Configurações do bloco
    const pedidoView = original.find(".pedido-view");
    pedidoView.attr("id", "pedido-view" + blocoCount);
    pedidoView.data("isSpun", false);

    original.find("select").val("").prop("disabled", true);
    original.find('button[type="submit"]').prop('disabled', true);
    original.find("img").each(function () {
      const id = $(this).attr("id");
      if (id && id.startsWith("bloco-")) {
        $(this).attr("src", "assets/bloco/rBlocoCor0.png");
      } else {
        $(this).attr("src", "#");
      }
    });

    if (blocoCount > 1) {
      addDeleteButton(original);
    }

    const plusSection = $(this).closest('.plus');
    const hiddenSection = plusSection.siblings('.hidden');
    const mainContainer = plusSection.closest('main');
    plusSection.remove();
    hiddenSection.remove();

    mainContainer.append(original);
    checkAndInsertHidden();

    if (currentCount + 1 < MAX_BLOCOS) {
      original.after('<section class="plus"><span class="material-symbols-rounded">add</span></section>');
    }

    // Atualiza as cores disponíveis para o novo bloco
    carregarCoresDisponiveis();
  });

  // Delegação de eventos para os botões de excluir dinâmicos
  $(document).on('click', '.delete-btn', function () {
    $(this).closest('section[id^="section-bloco-"]').remove();

    if ($('.plus').length === 0) {
      $('section[id^="section-bloco-"]').last().after(
        '<section class="plus"><span class="material-symbols-rounded">add</span></section>'
      );
    }
    checkAndInsertHidden();
  });

  // Eventos para atualizar visualização
  atualizarVisualizacao();
  ajustarAlturaVisualizacao();
  $(document).on('change', 'select', function () {
    atualizarVisualizacao();
  });
  $(document).on('click', '.spin', function () {
    setTimeout(atualizarVisualizacao, 300);
  });
});

// Event listeners para redimensionamento e carregamento
window.addEventListener('resize', () => {
  addMenuButton();
  atualizarVisualizacao();
});

window.addEventListener('load', function () {
  addMenuButton();
  renderBlocos();
  listarHistorico();
});

// Carrega o histórico ao abrir a página
document.addEventListener("DOMContentLoaded", () => {
  addMenuButton();
  renderBlocos();

  // Event listeners para elementos dinâmicos
  document.addEventListener('change', function (e) {
    if (e.target.matches('select')) {
      atualizarVisualizacao();
    }
  }),

    document.addEventListener('click', function (e) {
      if (e.target.closest('.spin')) {
        setTimeout(atualizarVisualizacao, 300);
      }
    });
});

function ajustarAlturaVisualizacao() {
  const container = document.querySelector('.visualizacao-container');
  const blocos = document.querySelectorAll('.visualizacao-bloco.stacked');

  if (blocos.length > 0 && container) {
    const altura = blocos.length * 180 - ((blocos.length - 1) * 40); // 180px altura de bloco, -40px de sobreposição
    container.style.height = `${altura}px`;
  }
}