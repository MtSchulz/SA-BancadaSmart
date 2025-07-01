// Variáveis de estado
let conectado = false;
let pausado = false;
let responseInterval;

// Função auxiliar para seleção segura de elementos
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Elemento não encontrado: ${id}`);
    }
    return element;
}

// Função para capitalizar strings
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Função para atualizar os tempos de resposta
function updateResponseTimes() {
    if (!conectado) return;

    ["Estoque", "Processo", "Montagem", "Expedicao"].forEach(nome => {
        const element = getElement(`response${nome}`);
        const card = document.querySelector(`[data-clp="${nome.toLowerCase()}"]`);
        const statusElement = getElement(`status${nome}`);
        const statusTextElement = getElement(`statusText${nome}`);

        if (pausado) {
            if (element) element.textContent = 'pausado';
            if (card) {
                card.classList.add('paused');
                card.classList.remove('connected');
            }
            if (statusElement) {
                statusElement.classList.remove("connected");
                statusElement.classList.add("paused");
            }
            if (statusTextElement) {
                statusTextElement.textContent = "Pausado";
                statusTextElement.classList.remove("connected");
                statusTextElement.classList.add("paused");
            }
        } else {
            const responseTime = Math.floor(Math.random() * 45) + 5;
            if (element) element.textContent = `${responseTime}ms`;
            if (card) {
                card.classList.add('connected');
                card.classList.remove('paused');
            }
            if (statusElement) {
                statusElement.classList.add("connected");
                statusElement.classList.remove("paused");
            }
            if (statusTextElement) {
                statusTextElement.textContent = "Conectado";
                statusTextElement.classList.add("connected");
                statusTextElement.classList.remove("paused");
            }
        }
    });
}

// Função principal de conexão
function conectarBancada() {
    const btn = getElement("btnConectar");
    const statusBancada = getElement("statusBancada");
    const statusText = getElement("statusText");
    const storeButton = getElement("storeButtonContainer");
    const networkStatus = getElement("networkStatus");
    const connectionDetails = getElement("connectionDetails");
    const statusIcon = document.querySelector('.status-icon');

    if (!btn || !statusBancada || !statusText || !storeButton || !networkStatus || !connectionDetails || !statusIcon) {
        console.error("Elementos essenciais não encontrados!");
        return;
    }

    const ips = {
        estoque: (getElement("hostIpEstoque") || {}).value || "192.168.1.101",
        processo: (getElement("hostIpProcesso") || {}).value || "192.168.1.102",
        montagem: (getElement("hostIpMontagem") || {}).value || "192.168.1.103",
        expedicao: (getElement("hostIpExpedicao") || {}).value || "192.168.1.104"
    };

    if (!conectado) {
        // Simulação de conexão
        fetch("/smart/ping", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ips)
        })
        .then(res => res.json())
        .then(status => {
            // Atualiza status de cada CLP
            Object.entries(status).forEach(([nome, ok]) => {
                const statusElement = getElement(`status${capitalize(nome)}`);
                const statusTextElement = getElement(`statusText${capitalize(nome)}`);
                
                if (statusElement && statusTextElement) {
                    if (ok) {
                        statusElement.classList.add("connected");
                        statusElement.classList.remove("paused");
                        statusTextElement.textContent = "Conectado";
                        statusTextElement.classList.add("connected");
                    } else {
                        statusElement.classList.remove("connected", "paused");
                        statusTextElement.textContent = "Desconectado";
                        statusTextElement.classList.remove("connected", "paused");
                    }
                }
            });

            return fetch("/start-leituras", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ips)
            });
        })
        .then(() => {
            // Atualiza UI para estado conectado
            statusBancada.classList.add("connected");
            statusBancada.classList.remove("paused");
            statusText.textContent = "Conectado";
            statusText.classList.add("connected");
            btn.textContent = "Desconectar";
            getElement("btnPausar").disabled = false;
            conectado = true;
            pausado = false;
            
            // Atualiza ícone de rede
            networkStatus.classList.remove("disconnected", "paused");
            networkStatus.classList.add("connected");
            networkStatus.querySelector("span:last-child").textContent = "Rede: Conectado";
            
            // Atualiza status panel
            statusIcon.textContent = 'power';
            statusIcon.style.transform = 'scale(1.1)';
            connectionDetails.textContent = 'Conexão estabelecida com sucesso';
            
            // Inicia atualização dos tempos
            updateResponseTimes();
            responseInterval = setInterval(updateResponseTimes, 2000);
            
            // Mostra botão da loja
            storeButton.style.display = "block";
        })
        .catch(error => {
            console.error("Erro ao conectar:", error);
            if (connectionDetails) {
                connectionDetails.textContent = 'Erro na conexão: ' + (error.message || "Erro desconhecido");
            }
        });
    } else {
        // Desconectar
        pararSSEClps();
        clearInterval(responseInterval);

        // Atualiza UI para desconectado
        statusBancada.classList.remove("connected", "paused");
        statusText.textContent = "Desconectado";
        statusText.classList.remove("connected", "paused");
        btn.textContent = "Conectar";
        getElement("btnPausar").disabled = true;
        conectado = false;
        pausado = false;
        
        // Atualiza CLPs
        ["Estoque", "Processo", "Montagem", "Expedicao"].forEach(nome => {
            const statusElement = getElement(`status${nome}`);
            const statusTextElement = getElement(`statusText${nome}`);
            if (statusElement) statusElement.classList.remove("connected", "paused");
            if (statusTextElement) {
                statusTextElement.textContent = "Desconectado";
                statusTextElement.classList.remove("connected", "paused");
            }
        });

        // Atualiza ícone de rede
        networkStatus.classList.remove("connected", "paused");
        networkStatus.classList.add("disconnected");
        networkStatus.querySelector("span:last-child").textContent = "Rede: Desconectado";

        // Atualiza status panel
        statusIcon.textContent = 'power_off';
        statusIcon.style.transform = 'scale(1)';
        connectionDetails.textContent = 'Aguardando conexão...';

        // Atualiza tempos
        updateResponseTimes();

        // Esconde botão da loja
        storeButton.style.display = "none";
    }
}

// Função para pausar conexão
function pausarConexao() {
    if (!conectado) return;

    const btnPausar = getElement("btnPausar");
    const statusBancada = getElement("statusBancada");
    const statusText = getElement("statusText");
    const networkStatus = getElement("networkStatus");
    const connectionDetails = getElement("connectionDetails");
    const statusIcon = document.querySelector('.status-icon');

    if (!btnPausar || !statusBancada || !statusText || !networkStatus || !connectionDetails || !statusIcon) {
        console.error("Elementos essenciais não encontrados!");
        return;
    }

    if (!pausado) {
        // Pausar conexão
        statusBancada.classList.remove("connected");
        statusBancada.classList.add("paused");
        statusText.textContent = "Pausado";
        statusText.classList.remove("connected");
        statusText.classList.add("paused");
        btnPausar.textContent = "Retomar";
        pausado = true;
        
        // Atualiza ícone de rede
        networkStatus.classList.remove("connected");
        networkStatus.classList.add("paused");
        networkStatus.querySelector("span:last-child").textContent = "Rede: Pausado";

        // Atualiza status panel
        statusIcon.textContent = 'pause';
        connectionDetails.textContent = 'Conexão em pausa';
    } else {
        // Retomar conexão
        statusBancada.classList.add("connected");
        statusBancada.classList.remove("paused");
        statusText.textContent = "Conectado";
        statusText.classList.add("connected");
        statusText.classList.remove("paused");
        btnPausar.textContent = "Pausar";
        pausado = false;
        
        // Atualiza ícone de rede
        networkStatus.classList.remove("paused");
        networkStatus.classList.add("connected");
        networkStatus.querySelector("span:last-child").textContent = "Rede: Conectado";

        // Atualiza status panel
        statusIcon.textContent = 'power';
        connectionDetails.textContent = 'Conexão reestabelecida';
    }

    // Atualiza CLPs
    updateResponseTimes();
}

// Função para redirecionar para a loja
function irParaStore() {
    window.location.href = "/store";
}

// Funções auxiliares (simuladas)
function pararSSEClps() {
    console.log("Conexões SSE paradas");
}

function iniciarSSEClps() {
    console.log("Conexões SSE iniciadas");
}

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
    // Preenche os IPs padrão
    const serverIp = getElement("serverIp");
    const hostIpEstoque = getElement("hostIpEstoque");
    const hostIpProcesso = getElement("hostIpProcesso");
    const hostIpMontagem = getElement("hostIpMontagem");
    const hostIpExpedicao = getElement("hostIpExpedicao");

    if (serverIp) serverIp.value = "192.168.1.11";
    if (hostIpEstoque) hostIpEstoque.value = "192.168.1.101";
    if (hostIpProcesso) hostIpProcesso.value = "192.168.1.102";
    if (hostIpMontagem) hostIpMontagem.value = "192.168.1.103";
    if (hostIpExpedicao) hostIpExpedicao.value = "192.168.1.104";
    
    // Inicializa o status panel
    const statusIcon = document.querySelector('.status-icon');
    if (statusIcon) {
        statusIcon.textContent = 'power_off';
    }
    
    // Inicializa os tempos
    updateResponseTimes();
});