var isSpun = false;

function changePedidoView(id) {
  var blockColor = $("#block-color-" + id).val();
  
  if (blockColor !== "") {
    $("#bloco-" + id).attr("src", "assets/bloco/rBlocoCor" + blockColor + ".png");

    $("#l1-color-" + id).prop("disabled", false);
    $("#l2-color-" + id).prop("disabled", false);
    $("#l3-color-" + id).prop("disabled", false);

    $("#send-" + id).prop("disabled", false);  // Ativa o botão de envio quando a cor é selecionada

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

  } else {
    $("#l1-color-" + id).prop("disabled", true);
    $("#l2-color-" + id).prop("disabled", true);
    $("#l3-color-" + id).prop("disabled", true);
    $("#l1-pattern-" + id).prop("disabled", true);
    $("#l2-pattern-" + id).prop("disabled", true);
    $("#l3-pattern-" + id).prop("disabled", true);

    $("#send-" + id).prop("disabled", true);  // Desativa o botão de envio

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

let blocoCount = 1; // Contador global de blocos

$(document).ready(function () {
  const MAX_BLOCOS = 3;

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

    // Atualiza os IDs e atributos (mantenha seu código existente aqui)
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

    // Configurações do bloco (mantenha seu código existente aqui)
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

    $("#block-color-" + blocoCount).prop("disabled", false);
  });

  // Delegação de eventos para os botões de excluir dinâmicos
  $(document).on('click', '.delete-btn', function() {
    $(this).closest('section[id^="section-bloco-"]').remove();
    
    // Se não houver mais .plus, adiciona um após o último bloco
    if ($('.plus').length === 0) {
      $('section[id^="section-bloco-"]').last().after(
        '<section class="plus"><span class="material-symbols-rounded">add</span></section>'
      );
    }
    checkAndInsertHidden();
  });
});