let currentEditPosition = null;
const stockData = Array(28).fill(0);
const originalStockData = [...stockData];
let isEditMode = false;
let selectedColor = 0; // 0 = Vazio, 1 = Preto, 2 = Vermelho, 3 = Azul
let clpConnected = true; // Adicione esta linha
let lastUpdateFrom = 'db'; // Também recomendo adicionar essa que é usada mas não declarada

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

        lastUpdateFrom = 'db';
        updateStockGrid();
        
        // Verifica se o CLP responde em 3 segundos
        setTimeout(() => {
            if (!clpConnected) {
                console.log('Usando dados do banco (CLP não conectado)');
            }
        }, 3000);
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
    }
}

// Event Source para atualizações em tempo real
const eventSource = new EventSource('/clp-data-stream');

let lastClpUpdateTime = 0;

eventSource.addEventListener('clp1-data', function(event) {
    clpConnected = true;
    try {
        const data = JSON.parse(event.data);
        const colors = data.value || data;
        
        // Só atualiza se for diferente do banco
        colors.forEach((val, i) => {
            if (i < stockData.length && val !== originalStockData[i]) {
                stockData[i] = val;
            }
        });
        
        lastUpdateFrom = 'clp';
        updateStockGrid();
    } catch (error) {
        console.error('Erro ao processar atualização:', error);
    }
});

eventSource.onerror = function() {
    clpConnected = false;
    if (lastUpdateFrom === 'clp') {
        syncWithDatabase(); // Volta para os dados do banco
    }
};

async function syncWithDatabase() {
    try {
        console.log('Sincronizando com o banco de dados...');
        const response = await fetch('/estoque/listar');
        if (!response.ok) throw new Error('Erro ao sincronizar');
        
        const data = await response.json();
        data.forEach((val, i) => {
            if (i < stockData.length) {
                stockData[i] = val;
                originalStockData[i] = val;
            }
        });
        
        lastUpdateFrom = 'db';
        updateStockGrid();
    } catch (error) {
        console.error('Erro na sincronização:', error);
    }
}


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

        cell.onclick = () => {
            if (!isEditMode) {
                enableEditMode();
            }
            if (selectedColor !== null) {
                stockData[i] = selectedColor;
                updateStockGrid();
            }
        };

        cell.style.cursor = 'pointer';
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
    isEditMode = true;
    toggleEditButtons(true);
    document.getElementById('color-buttons').style.display = 'block';
    // Não seleciona cor automaticamente
}

function cancelEdit() {
    isEditMode = false;
    stockData.forEach((_, i) => {
        stockData[i] = originalStockData[i];
    });
    updateStockGrid();
    toggleEditButtons(false);
    document.getElementById('color-buttons').style.display = 'none';
    selectedColor = null;
    // Remove destaque dos botões de cor
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

        // Atualiza os dados originais
        stockData.forEach((val, i) => originalStockData[i] = val);

        isEditMode = false;
        selectedColor = null;

        alert(result.message);
        toggleEditButtons(false);
        document.getElementById('color-buttons').style.display = 'none';

        // Remove destaque dos botões de cor
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
window.onload = function() {
    // 1. Primeiro carrega do banco
    loadInitialStockData();
    
    // 2. Depois verifica o CLP
    setTimeout(() => {
        if (!clpConnected) {
            console.log('CLP não conectado - mantendo dados do banco');
        }
    }, 3000);
    
    // 3. Atualiza a expedição
    updateExpedition();
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