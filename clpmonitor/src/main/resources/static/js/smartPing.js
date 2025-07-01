// Variáveis de estado
let conectado = false;
let pausado = false;

// Função para capitalizar strings
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Função principal de conexão
function conectarBancada() {
    const btn = document.getElementById("btnConectar");
    const statusBancada = document.getElementById("statusBancada");
    const statusText = document.getElementById("statusText");
    const storeButton = document.getElementById("storeButtonContainer");
    const networkStatus = document.getElementById("networkStatus");
    const connectionDetails = document.getElementById("connectionDetails");
    const statusIcon = document.querySelector('.status-icon');
    
    const ips = {
        estoque: document.getElementById("hostIpEstoque").value,
        processo: document.getElementById("hostIpProcesso").value,
        montagem: document.getElementById("hostIpMontagem").value,
        expedicao: document.getElementById("hostIpExpedicao").value
    };

    if (!conectado) {
        // Simulação de conexão - substituir pela chamada real ao backend
        fetch("/smart/ping", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ips)
        })
        .then(res => res.json())
        .then(status => {
            // Atualiza status de cada CLP
            Object.entries(status).forEach(([nome, ok]) => {
                const statusElement = document.getElementById(`status${capitalize(nome)}`);
                const statusTextElement = document.getElementById(`statusText${capitalize(nome)}`);
                
                if (ok) {
                    statusElement.classList.add("connected");
                    statusElement.classList.remove("paused");
                    statusTextElement.textContent = "Conectado";
                } else {
                    statusElement.classList.remove("connected", "paused");
                    statusTextElement.textContent = "Desconectado";
                }
            });

            // Inicia as leituras no backend
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
            document.getElementById("btnPausar").disabled = false;
            conectado = true;
            pausado = false;
            
            // Atualiza ícone de rede na sidebar
            networkStatus.classList.remove("disconnected", "paused");
            networkStatus.classList.add("connected");
            networkStatus.querySelector("span:last-child").textContent = "Rede: Conectado";
            
            // Atualizações para o novo status panel
            statusIcon.textContent = 'power';
            statusIcon.style.transform = 'scale(1.1)';
            connectionDetails.textContent = 'Conexão estabelecida com sucesso';
            
            // Mostra o botão para a tela store
            storeButton.style.display = "block";
        })
        .catch(error => {
            console.error("Erro ao conectar:", error);
            connectionDetails.textContent = 'Erro na conexão: ' + error.message;
        });
    } else {
        // Desconectar
        // Para as conexões SSE dos CLPs
        pararSSEClps();

        // Atualiza UI para estado desconectado
        statusBancada.classList.remove("connected", "paused");
        statusText.textContent = "Desconectado";
        statusText.classList.remove("connected", "paused");
        btn.textContent = "Conectar";
        document.getElementById("btnPausar").disabled = true;
        conectado = false;
        pausado = false;
        
        // Atualiza status de todos os CLPs para desconectado
        ["Estoque", "Processo", "Montagem", "Expedicao"].forEach(nome => {
            const statusElement = document.getElementById(`status${nome}`);
            const statusTextElement = document.getElementById(`statusText${nome}`);
            statusElement.classList.remove("connected", "paused");
            statusTextElement.textContent = "Desconectado";
        });

        // Atualiza ícone de rede na sidebar
        networkStatus.classList.remove("connected", "paused");
        networkStatus.classList.add("disconnected");
        networkStatus.querySelector("span:last-child").textContent = "Rede: Desconectado";

        // Atualizações para o novo status panel
        statusIcon.textContent = 'power_off';
        statusIcon.style.transform = 'scale(1)';
        connectionDetails.textContent = 'Aguardando conexão...';

        // Esconde o botão para a tela store
        storeButton.style.display = "none";
    }
}

// Função para pausar conexão
function pausarConexao() {
    const btnPausar = document.getElementById("btnPausar");
    const statusBancada = document.getElementById("statusBancada");
    const statusText = document.getElementById("statusText");
    const networkStatus = document.getElementById("networkStatus");
    const connectionDetails = document.getElementById("connectionDetails");
    const statusIcon = document.querySelector('.status-icon');

    if (!pausado) {
        // Pausar conexão
        statusBancada.classList.remove("connected");
        statusBancada.classList.add("paused");
        statusText.textContent = "Pausado";
        statusText.classList.remove("connected");
        statusText.classList.add("paused");
        btnPausar.textContent = "Retomar";
        pausado = true;
        
        // Atualiza status de todos os CLPs para pausado
        ["Estoque", "Processo", "Montagem", "Expedicao"].forEach(nome => {
            const statusElement = document.getElementById(`status${nome}`);
            const statusTextElement = document.getElementById(`statusText${nome}`);
            statusElement.classList.remove("connected");
            statusElement.classList.add("paused");
            statusTextElement.textContent = "Pausado";
        });

        // Atualiza ícone de rede na sidebar
        networkStatus.classList.remove("connected");
        networkStatus.classList.add("paused");
        networkStatus.querySelector("span:last-child").textContent = "Rede: Pausado";

        // Atualizações para o novo status panel
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
        
        // Atualiza status de todos os CLPs para conectado
        ["Estoque", "Processo", "Montagem", "Expedicao"].forEach(nome => {
            const statusElement = document.getElementById(`status${nome}`);
            const statusTextElement = document.getElementById(`statusText${nome}`);
            statusElement.classList.add("connected");
            statusElement.classList.remove("paused");
            statusTextElement.textContent = "Conectado";
        });

        // Atualiza ícone de rede na sidebar
        networkStatus.classList.remove("paused");
        networkStatus.classList.add("connected");
        networkStatus.querySelector("span:last-child").textContent = "Rede: Conectado";

        // Atualizações para o novo status panel
        statusIcon.textContent = 'power';
        connectionDetails.textContent = 'Conexão reestabelecida';
    }
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

// Inicialização - Preenche os IPs padrão
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("serverIp").value = "192.168.1.11";
    document.getElementById("hostIpEstoque").value = "192.168.1.101";
    document.getElementById("hostIpProcesso").value = "192.168.1.102";
    document.getElementById("hostIpMontagem").value = "192.168.1.103";
    document.getElementById("hostIpExpedicao").value = "192.168.1.104";
    
    // Inicializa o status panel
    const statusIcon = document.querySelector('.status-icon');
    if (statusIcon) {
        statusIcon.textContent = 'power_off';
    }
});