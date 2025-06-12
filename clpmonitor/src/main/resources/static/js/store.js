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
                        <option value="preto">Preto</option>
                        <option value="vermelho">Vermelho</option>
                        <option value="azul">Azul</option>
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

  if (blockColor !== "") {
    const idCor = (blockColor === "preto" ? 1 : blockColor === "vermelho" ? 2 : 3);
    document.getElementById("bloco-" + id).src = "assets/bloco/rBlocoCor" + idCor + ".png";

    // Habilita os selects de cor
    ["l1-color-", "l2-color-", "l3-color-"].forEach(prefix => {
      document.getElementById(prefix + id).disabled = false;
    });

    const l1Color = document.getElementById("l1-color-" + id).value;
    const l2Color = document.getElementById("l2-color-" + id).value;
    const l3Color = document.getElementById("l3-color-" + id).value;

    const l1Pattern = document.getElementById("l1-pattern-" + id).value;
    const l2Pattern = document.getElementById("l2-pattern-" + id).value;
    const l3Pattern = document.getElementById("l3-pattern-" + id).value;

    const view = document.getElementById("pedido-view" + id);
    const isSpun = view.dataset.isSpun === "true";

    // Atualiza as lâminas e padrões dependendo do giro
    if (isSpun) {
      document.getElementById("lamina" + id + "-3").src = l1Color ? "assets/laminas/lamina3-" + l1Color + ".png" : "#";
      document.getElementById("lamina" + id + "-1").src = l3Color ? "assets/laminas/lamina1-" + l3Color + ".png" : "#";

      const padrao3 = document.getElementById("padrao" + id + "-3");
      const padrao1 = document.getElementById("padrao" + id + "-1");

      padrao3.src = l3Pattern ? "assets/padroes/padrao" + l3Pattern + "-1.png" : "#";
      padrao3.hidden = false;
      padrao1.src = l1Pattern ? "assets/padroes/padrao" + l1Pattern + "-1.png" : "#";
      padrao1.hidden = true;
    } else {
      document.getElementById("lamina" + id + "-1").src = l1Color ? "assets/laminas/lamina1-" + l1Color + ".png" : "#";
      document.getElementById("lamina" + id + "-3").src = l3Color ? "assets/laminas/lamina3-" + l3Color + ".png" : "#";

      const padrao1 = document.getElementById("padrao" + id + "-1");
      const padrao3 = document.getElementById("padrao" + id + "-3");

      padrao1.src = l1Pattern ? "assets/padroes/padrao" + l1Pattern + "-1.png" : "#";
      padrao1.hidden = false;
      padrao3.src = l3Pattern ? "assets/padroes/padrao" + l3Pattern + "-1.png" : "#";
      padrao3.hidden = true;
    }

    // Atualiza lâmina/padrão do meio
    document.getElementById("lamina" + id + "-2").src = l2Color ? "assets/laminas/lamina2-" + l2Color + ".png" : "#";
    document.getElementById("padrao" + id + "-2").src = l2Pattern ? "assets/padroes/padrao" + l2Pattern + "-2.png" : "#";

    // Habilita os padrões caso uma cor esteja selecionada
    ["l1-pattern-", "l2-pattern-", "l3-pattern-"].forEach((prefix, index) => {
      const color = [l1Color, l2Color, l3Color][index];
      document.getElementById(prefix + id).disabled = !color;
    });

  } else {
    // Desabilita todos os campos e limpa imagens
    ["l1-color-", "l2-color-", "l3-color-", "l1-pattern-", "l2-pattern-", "l3-pattern-"].forEach(prefix => {
      document.getElementById(prefix + id).disabled = true;
    });

    document.getElementById("send-" + id).disabled = true;
    document.getElementById("bloco-" + id).src = "assets/bloco/rBlocoCor0.png";

    ["lamina", "padrao"].forEach(prefix => {
      for (let i = 1; i <= 3; i++) {
        document.getElementById(prefix + id + "-" + i).src = "#";
      }
    });
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

// =============================================
// Funções de manipulação de pedidos
// =============================================

/**
 * Envia pedido para a base de dados
 */
function enviarPedido() {
  const formData = new FormData();
  let hasData = false;

  // Iterar sobre todas as seções de bloco que estão disabled (confirmadas)
  $('section[id^="section-bloco-"].disabled').each(function () {
    const sectionId = this.id.split('-')[2]; // Extrai o número do bloco (1, 2, 3...)
    hasData = true;

    // Adicionar todos os campos do formulário mantendo a numeração original
    const blockColor = $(`#block-color-${sectionId}`).val();
    const l1Color = $(`#l1-color-${sectionId}`).val();
    const l2Color = $(`#l2-color-${sectionId}`).val();
    const l3Color = $(`#l3-color-${sectionId}`).val();
    const l1Pattern = $(`#l1-pattern-${sectionId}`).val();
    const l2Pattern = $(`#l2-pattern-${sectionId}`).val();
    const l3Pattern = $(`#l3-pattern-${sectionId}`).val();

    // Adiciona os dados ao FormData com prefixo para cada bloco
    formData.append(`block-color-${sectionId}`, blockColor);
    formData.append(`l1-color-${sectionId}`, l1Color);
    formData.append(`l2-color-${sectionId}`, l2Color);
    formData.append(`l3-color-${sectionId}`, l3Color);
    if (l1Pattern) formData.append(`l1-pattern-${sectionId}`, l1Pattern);
    if (l2Pattern) formData.append(`l2-pattern-${sectionId}`, l2Pattern);
    if (l3Pattern) formData.append(`l3-pattern-${sectionId}`, l3Pattern);
  });

  if (!hasData) {
    alert("Nenhum bloco confirmado para envio!");
    return;
  }

  // Adiciona o número total de blocos confirmados
  formData.append('total-blocks', $('section[id^="section-bloco-"].disabled').length);

  // Enviar para o servidor
  fetch("/pedidoTeste", {
    method: "POST",
    body: formData,
  }).then((response) => {
    if (response.redirected) {
      window.location.href = response.url;
    }
  });
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
  visualizacao.innerHTML = '<p class="loading">Carregando visualização...</p>';

  // Cria container principal
  const container = document.createElement('div');
  container.className = 'visualizacao-container';
  
  // Cria container para os blocos empilhados
  const blocosContainer = document.createElement('div');
  blocosContainer.className = 'visualizacao-blocos stacked';
  container.appendChild(blocosContainer);

  // Obtém todos os blocos configurados
  const blocos = document.querySelectorAll('.bloco');
  
  if (blocos.length === 0) {
      visualizacao.innerHTML = '<p>Configure pelo menos um bloco</p>';
      return;
  }

  // Para cada bloco, cria uma visualização
  blocos.forEach((bloco, index) => {
      const blocoId = bloco.id.split('-')[2] || (index + 1);
      const pedidoView = document.getElementById(`pedido-view${blocoId}`);
      const isSpun = pedidoView ? pedidoView.classList.contains('spin') : false;

      // Cria container do bloco
      const blocoDiv = document.createElement('div');
      blocoDiv.className = 'visualizacao-bloco stacked';
      
      // Container da visualização (pedido-view)
      const viewDiv = document.createElement('div');
      viewDiv.className = 'visualizacao-pedido-view' + (isSpun ? ' spin' : '');
      blocoDiv.appendChild(viewDiv);

      // Função para adicionar imagens com z-index correto
      const addImage = (elementId, zIndex) => {
          const originalImg = document.getElementById(elementId);
          if (originalImg && originalImg.src && !originalImg.src.includes('#')) {
              const img = document.createElement('img');
              img.className = 'imagem';
              img.src = originalImg.src;
              img.alt = originalImg.alt;
              img.style.zIndex = zIndex;
              viewDiv.appendChild(img);
          }
      };

      // Adiciona as imagens na ordem correta com z-index específico
      // Bloco (fundo)
      addImage(`bloco-${blocoId}`, 1);
      
      // Lâminas
      addImage(`lamina${blocoId}-3`, 10);
      addImage(`lamina${blocoId}-1`, 20);
      addImage(`lamina${blocoId}-2`, 30);
      
      // Padrões
      for (let i = 1; i <= 3; i++) {
          addImage(`padrao${blocoId}-${i}`, 70);
      }

      blocosContainer.appendChild(blocoDiv);
  });

  // Atualiza a visualização
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
  $(document).on('change', 'select', function () {
    atualizarVisualizacao();
  });
  $(document).on('click', '.spin', function () {
    setTimeout(atualizarVisualizacao, 300);
  });
});


// Event listeners para redimensionamento e carregamento
window.addEventListener('resize', addMenuButton);
window.addEventListener('load', function () {
  addMenuButton();
  renderBlocos();
  listarHistorico();
});

// Carrega o histórico ao abrir a página
document.addEventListener('DOMContentLoaded', listarHistorico);