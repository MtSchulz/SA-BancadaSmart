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
            statusText.textContent = "Status: Conectado";
            btn.textContent = "Desconectar";
            document.getElementById("btnPausar").disabled = false;
            conectado = true;
            pausado = false;
            
            // Mostra o botão para a tela store
            storeButton.style.display = "block";
        })
        .catch(error => {
            console.error("Erro ao conectar:", error);
        });
    } else {
        // Desconectar
        // Para as conexões SSE dos CLPs
        pararSSEClps();

        // Atualiza UI para estado desconectado
        statusBancada.classList.remove("connected", "paused");
        statusText.textContent = "Status: Desconectado";
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

        // Esconde o botão para a tela store
        storeButton.style.display = "none";
    }
}

// Função para pausar conexão
function pausarConexao() {
    const btnPausar = document.getElementById("btnPausar");
    const statusBancada = document.getElementById("statusBancada");
    const statusText = document.getElementById("statusText");

    if (!pausado) {
        // Pausar conexão
        statusBancada.classList.remove("connected");
        statusBancada.classList.add("paused");
        statusText.textContent = "Status: Pausado";
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
    } else {
        // Retomar conexão
        statusBancada.classList.add("connected");
        statusBancada.classList.remove("paused");
        statusText.textContent = "Status: Conectado";
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