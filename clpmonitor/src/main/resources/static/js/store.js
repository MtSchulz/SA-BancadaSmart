var isSpun = false;

function changePedidoView(id) {
  var blockColor = $("#block-color-" + id).val();
  
  if (blockColor !== "") {
    // Verifica se a cor ainda está disponível
    fetch(`/api/verificar-cor/${blockColor}`)
      .then(response => response.json())
      .then(data => {
        if (!data.disponivel) {
          $("#block-color-" + id).val("");
          alert("Esta cor não está mais disponível");
          changePedidoView(id);
          return;
        }

        $("#bloco-" + id).attr("src", "assets/bloco/rBlocoCor" + blockColor + ".png");

        $("#l1-color-" + id).prop("disabled", false);
        $("#l2-color-" + id).prop("disabled", false);
        $("#l3-color-" + id).prop("disabled", false);

        $("#send-" + id).prop("disabled", false);

        // Outros ajustes de padrões
        var l1Color = $("#l1-color-" + id).val();
        var l2Color = $("#l2-color-" + id).val();
        var l3Color = $("#l3-color-" + id).val();

        var l1Pattern = $("#l1-pattern-" + id).val();
        var l2Pattern = $("#l2-pattern-" + id).val();
        var l3Pattern = $("#l3-pattern-" + id).val();

        var isSpun = $("#pedido-view" + id).data("isSpun");

        if (isSpun) {
          $("#lamina" + id + "-3").attr("src", l1Color ? "assets/laminas/lamina3-" + l1Color + ".png" : "#");
          $("#lamina" + id + "-1").attr("src", l3Color ? "assets/laminas/lamina1-" + l3Color + ".png" : "#");

          $("#padrao" + id + "-3").attr("src", l3Pattern ? "assets/padroes/padrao" + l3Pattern + "-1.png" : "#").prop("hidden", false);
          $("#padrao" + id + "-1").attr("src", l1Pattern ? "assets/padroes/padrao" + l1Pattern + "-1.png" : "#").prop("hidden", true);
        } else {
          $("#lamina" + id + "-1").attr("src", l1Color ? "assets/laminas/lamina1-" + l1Color + ".png" : "#");
          $("#lamina" + id + "-3").attr("src", l3Color ? "assets/laminas/lamina3-" + l3Color + ".png" : "#");

          $("#padrao" + id + "-1").attr("src", l1Pattern ? "assets/padroes/padrao" + l1Pattern + "-1.png" : "#").prop("hidden", false);
          $("#padrao" + id + "-3").attr("src", l3Pattern ? "assets/padroes/padrao" + l3Pattern + "-1.png" : "#").prop("hidden", true);
        }

        $("#lamina" + id + "-2").attr("src", l2Color ? "assets/laminas/lamina2-" + l2Color + ".png" : "#");
        $("#padrao" + id + "-2").attr("src", l2Pattern ? "assets/padroes/padrao" + l2Pattern + "-2.png" : "#");

        $("#l1-pattern-" + id).attr("disabled", !l1Color);
        $("#l2-pattern-" + id).attr("disabled", !l2Color);
        $("#l3-pattern-" + id).attr("disabled", !l3Color);

      })
      .catch(error => console.error("Erro ao verificar cor:", error));
  } else {
    $("#l1-color-" + id).prop("disabled", true);
    $("#l2-color-" + id).prop("disabled", true);
    $("#l3-color-" + id).prop("disabled", true);
    $("#l1-pattern-" + id).prop("disabled", true);
    $("#l2-pattern-" + id).prop("disabled", true);
    $("#l3-pattern-" + id).prop("disabled", true);

    $("#send-" + id).prop("disabled", true);

    $("#bloco-" + id).attr("src", "assets/bloco/rBlocoCor0.png");
    $("#lamina" + id + "-1").attr("src", "#");
    $("#lamina" + id + "-2").attr("src", "#");
    $("#lamina" + id + "-3").attr("src", "#");
    $("#padrao" + id + "-1").attr("src", "#");
    $("#padrao" + id + "-2").attr("src", "#");
    $("#padrao" + id + "-3").attr("src", "#");
  }
}

function spin(id) {
  const $view = $('#pedido-view' + id);
  $view.toggleClass("spin");

  // Armazena o estado 'spun' dentro do DOM usando data()
  const isSpun = !$view.data("isSpun");
  $view.data("isSpun", isSpun);

  // Seleciona as lâminas dinamicamente
  const $lamina1 = $('#lamina' + id + '-1');
  const $lamina3 = $('#lamina' + id + '-3');

  const src1 = $lamina1.attr('src');
  const src3 = $lamina3.attr('src');

  const newSrc3 = src1.replace(/lamina(\d)-(\d)\.png/, (match, pos, cor) => `lamina3-${cor}.png`);
  const newSrc1 = src3.replace(/lamina(\d)-(\d)\.png/, (match, pos, cor) => `lamina1-${cor}.png`);

  // Alterna visibilidade dos padrões
  $('#padrao' + id + '-3').prop("hidden", !isSpun);
  $('#padrao' + id + '-1').prop("hidden", isSpun);

  // Atualiza os src
  $lamina1.attr('src', newSrc1);
  $lamina3.attr('src', newSrc3);
}

let blocoCount = 1;

$(document).ready(function () {
  const MAX_BLOCOS = 3;

  // Carrega as cores disponíveis ao iniciar
  carregarCoresDisponiveis();

  // Função para adicionar o botão de excluir
  function addDeleteButton(section) {
    const deleteBtn = $('<span class="delete-btn material-symbols-rounded">close</span>');
    deleteBtn.click(function () {
      section.remove();
      // Reorganiza os IDs se necessário ou atualiza a contagem
    });
    section.prepend(deleteBtn);
  }

  function checkAndInsertHidden() {
    const blocoCount = $('section[id^="section-bloco-"]').length;
    const hiddenExists = $('.hidden').length > 0;
  
    if (blocoCount === 1 && !hiddenExists) {
      $('.plus').after('<section class="hidden"></section>');
    }
  }

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
  $(document).on('click', '.delete-btn', function() {
    $(this).closest('section[id^="section-bloco-"]').remove();
    
    if ($('.plus').length === 0) {
      $('section[id^="section-bloco-"]').last().after(
        '<section class="plus"><span class="material-symbols-rounded">add</span></section>'
      );
    }
    checkAndInsertHidden();
  });
});

// Função para carregar cores disponíveis do backend
function carregarCoresDisponiveis() {
  fetch('/api/cores-disponiveis')
    .then(response => response.json())
    .then(cores => {
      $('[id^="block-color-"]').each(function() {
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

// Função para enviar pedido
function enviarPedido() {
  const blocos = [];
  
  $('section[id^="section-bloco-"]').each(function(index) {
    const id = index + 1;
    const blocoData = {
      color: $("#block-color-" + id).val(),
      l1Color: $("#l1-color-" + id).val(),
      l2Color: $("#l2-color-" + id).val(),
      l3Color: $("#l3-color-" + id).val(),
      l1Pattern: $("#l1-pattern-" + id).val(),
      l2Pattern: $("#l2-pattern-" + id).val(),
      l3Pattern: $("#l3-pattern-" + id).val()
    };
    blocos.push(blocoData);
  });

  fetch('/api/pedidos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ blocos })
  })
  .then(response => response.json())
  .then(data => {
    alert('Pedido enviado com sucesso!');
    carregarCoresDisponiveis(); // Atualiza a lista de cores após envio
  })
  .catch(error => {
    console.error('Erro:', error);
    alert('Erro ao enviar pedido');
  });
}

// Função para listar pedidos
function listarPedidos() {
  fetch('/api/pedidos')
    .then(response => response.json())
    .then(pedidos => {
      const lista = $('#listaPedidos');
      lista.empty();
      
      pedidos.forEach(pedido => {
        lista.append(`
          <div class="pedido">
            <h3>Pedido #${pedido.id}</h3>
            <p>Data: ${new Date(pedido.data).toLocaleString()}</p>
            <p>Status: ${pedido.status}</p>
          </div>
        `);
      });
    })
    .catch(error => console.error('Erro ao carregar pedidos:', error));
}