let currentEditPosition = null;
const stockData = Array(28).fill(0);
const originalStockData = [...stockData];
let isEditMode = false;
let selectedColor = 0; // 0 = Vazio, 1 = Preto, 2 = Vermelho, 3 = Azul
let clpConnected = true;
let lastUpdateFrom = 'db';

// Função unificada para carregar/atualizar estoque
async function loadStockData() {
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

        lastUpdateFrom = 'db';
        renderStockGrid();
        
        if (!clpConnected) {
            console.log('Usando dados do banco (CLP não conectado)');
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar estoque: ' + error.message);
    }
}

// Event Source para atualizações em tempo real
const eventSource = new EventSource('/clp-data-stream');

eventSource.addEventListener('clp1-data', function(event) {
    clpConnected = true;
    try {
        const data = JSON.parse(event.data);
        const colors = data.value || data;

        colors.forEach((val, i) => {
            if (i < stockData.length && val !== originalStockData[i]) {
                stockData[i] = val;
            }
        });

        lastUpdateFrom = 'clp';
        renderStockGrid();
    } catch (error) {
        console.error('Erro ao processar atualização:', error);
    }
});

eventSource.onerror = function() {
    clpConnected = false;
    if (lastUpdateFrom === 'clp') {
        loadStockData(); // Volta para os dados do banco
    }
};

// Função unificada para renderizar a grid de estoque
function renderStockGrid() {
    const grid = document.getElementById('clp1-grid');
    if (!grid) return;

    grid.innerHTML = '';

    stockData.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.classList.add('cell', `color-${val}`);
        cell.textContent = i + 1;

        cell.onclick = () => {
            if (!isEditMode) {
                enableEditMode();
            }
            if (selectedColor !== null) {
                stockData[i] = selectedColor;
                renderStockGrid();
            }
        };

        cell.style.cursor = 'pointer';
        grid.appendChild(cell);
    });
}

// Função unificada para atualizar expedição
function updateExpedition(data = null) {
    const grid = document.getElementById('expedition-grid');
    if (!grid) return;

    // Se não receber dados, busca do servidor
    if (!data) {
        fetch('/expedicao/listar')
            .then(response => response.json())
            .then(data => renderExpedition(data))
            .catch(error => {
                console.error('Erro ao atualizar expedição:', error);
                alert('Erro ao atualizar expedição: ' + error.message);
            });
        return;
    }

    renderExpedition(data);
}

function renderExpedition(expeditionArray) {
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
}

// Listener para atualizações de expedição via EventSource
eventSource.addEventListener('expedition-data', function(event) {
    try {
        const data = JSON.parse(event.data);
        updateExpedition(data.value || data);
    } catch (error) {
        console.error('Erro ao atualizar expedição:', error);
    }
});

// Funções de edição (mantidas sem alterações)
function setSelectedColor(color) {
    selectedColor = color;
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.style.border = '2px solid transparent';
    });
    document.querySelector(`.color-btn[onclick="setSelectedColor(${color})"]`).style.border = '2px solid #000';
}

function enableEditMode() {
    isEditMode = true;
    toggleEditButtons(true);
    document.getElementById('color-buttons').style.display = 'block';
}

function cancelEdit() {
    isEditMode = false;
    stockData.forEach((_, i) => {
        stockData[i] = originalStockData[i];
    });
    renderStockGrid();
    toggleEditButtons(false);
    document.getElementById('color-buttons').style.display = 'none';
    selectedColor = null;
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.style.border = '2px solid transparent';
    });
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

        stockData.forEach((val, i) => originalStockData[i] = val);
        isEditMode = false;
        selectedColor = null;

        alert(result.message);
        toggleEditButtons(false);
        document.getElementById('color-buttons').style.display = 'none';
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.style.border = '2px solid transparent';
        });

    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Salvar';
    }
}

// Inicialização
window.onload = function() {
    loadStockData();
    updateExpedition();
    
    setTimeout(() => {
        if (!clpConnected) {
            console.log('CLP não conectado - mantendo dados do banco');
        }
    }, 3000);
};

// Sidebar functions (mantidas sem alterações)
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

document.addEventListener('click', function(event) {
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