let currentEditPosition = null;
const stockData = Array(28).fill(0);
const originalStockData = [...stockData];
let selectedColor = 0; // 0 = Vazio, 1 = Preto, 2 = Vermelho, 3 = Azul

// Função para carregar dados iniciais do estoque
async function loadInitialStockData() {
    try {
        const response = await fetch('/estoque/listar');
        if (!response.ok) throw new Error('Erro ao carregar estoque');

        const data = await response.json();
        data.forEach((val, i) => {
            if (i < stockData.length) {
                stockData[i] = val;
                originalStockData[i] = val;
            }
        });

        updateStockGrid();
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        alert('Erro ao carregar estoque: ' + error.message);
    }
}

// Event Source para atualizações em tempo real
const eventSource = new EventSource('/clp-data-stream');

eventSource.addEventListener('clp1-data', function (event) {
    try {
        const data = JSON.parse(event.data);
        const colors = data.value || data; // Suporta ambos formatos

        colors.forEach((val, i) => {
            if (i < stockData.length) {
                stockData[i] = val;
                originalStockData[i] = val;
            }
        });

        updateStockGrid();
    } catch (error) {
        console.error('Erro ao processar atualização:', error);
    }
});

eventSource.addEventListener('expedition-data', function (event) {
    try {
        const data = JSON.parse(event.data);
        const expeditionArray = data.value || data;
        const grid = document.getElementById('expedition-grid');
        grid.innerHTML = '';

        expeditionArray.forEach((val, i) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.innerHTML = `P${i + 1} = [OP ${val}]`;

            cell.style.backgroundColor = val
                ? "rgba(255, 0, 0, 0.3)"
                : "rgba(0, 255, 0, 0.3)";
            cell.style.border = val
                ? "1px solid red"
                : "1px solid green";

            grid.appendChild(cell);
        });
    } catch (error) {
        console.error('Erro ao atualizar expedição:', error);
    }
});

function updateStockGrid() {
    const grid = document.getElementById('clp1-grid');
    if (!grid) return;

    grid.innerHTML = '';

    stockData.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.classList.add('cell', `color-${val}`);
        cell.textContent = i + 1;

        if (document.getElementById('saveBtn').style.display === 'inline-block') {
            cell.onclick = () => {
                stockData[i] = selectedColor;
                updateStockGrid();
            };
            cell.style.cursor = 'pointer';
        }

        grid.appendChild(cell);
    });
}

function setSelectedColor(color) {
    selectedColor = color;
    // Destaca o botão selecionado
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.style.border = '2px solid transparent';
    });
    document.querySelector(`.color-btn[onclick="setSelectedColor(${color})"]`).style.border = '2px solid #000';
}

function enableEditMode() {
    toggleEditButtons(true);
    document.getElementById('color-buttons').style.display = 'block';
    // Seleciona a primeira cor por padrão
    setSelectedColor(0);
}

function cancelEdit() {
    stockData.forEach((_, i) => {
        stockData[i] = originalStockData[i];
    });
    updateStockGrid();
    toggleEditButtons(false);
    document.getElementById('color-buttons').style.display = 'none';
}

function toggleEditButtons(show) {
    document.getElementById('saveBtn').style.display = show ? 'inline-block' : 'none';
    document.getElementById('cancelBtn').style.display = show ? 'inline-block' : 'none';
    document.getElementById('editBtn').style.display = show ? 'none' : 'inline-block';
}

async function saveStock() {
    const saveBtn = document.getElementById('saveBtn');
    try {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Salvando...';

        const response = await fetch('/estoque/editar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                listBlocks: stockData
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.details || result.message || 'Erro desconhecido');
        }

        // Atualiza os dados originais
        stockData.forEach((val, i) => originalStockData[i] = val);

        alert(result.message);
        toggleEditButtons(false);
        document.getElementById('color-buttons').style.display = 'none';

    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro: ' + error.message);
        // Reverte para os dados originais
        cancelEdit();
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Salvar';
    }
}

// Funções auxiliares para CLP
function update() {
    fetch('/update', { method: 'POST' })
        .catch(error => console.error('Erro ao atualizar:', error));
}

function updateStock() {
    fetch('/update-stock', { method: 'POST' })
        .catch(error => console.error('Erro ao atualizar estoque:', error));
}

function updateExpedition() {
    fetch('/update-expedition', { method: 'POST' })
        .catch(error => console.error('Erro ao atualizar expedição:', error));
}

// Inicialização
window.onload = function () {
    loadInitialStockData();
    updateExpedition();
    updateStock();
    addMenuButton();
};

// Sidebar functions
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

document.addEventListener('click', function (event) {
    const sidebar = document.querySelector('.sidebar');
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnMenuButton = event.target.closest('.menu-button');

    if (window.innerWidth <= 768 && !isClickInsideSidebar && !isClickOnMenuButton) {
        sidebar.classList.remove('active');
    }
});

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

window.addEventListener('resize', addMenuButton);