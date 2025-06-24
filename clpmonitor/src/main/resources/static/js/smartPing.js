
// Função conectarBancada mantendo todas as chamadas originais
function conectarBancada() {
    const btn = document.getElementById("btnConectar");
    const ips = {
        estoque: document.getElementById("hostIpEstoque").value,
        processo: document.getElementById("hostIpProcesso").value,
        montagem: document.getElementById("hostIpMontagem").value,
        expedicao: document.getElementById("hostIpExpedicao").value
    };

    if (!conectado) {
        fetch("/smart/ping", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ips)
        })
            .then(res => res.json())
            .then(status => {
                Object.entries(status).forEach(([nome, ok]) => {
                    const inputId = `hostIp${capitalize(nome)}`;
                    const input = document.getElementById(inputId);
                    const cor = ok ? "rgb(0,255,0)" : "rgb(255,0,0)";
                    input.style.color = cor;
                    sessionStorage.setItem(`corFonte_${inputId}`, cor);
                });

                // Inicia as leituras no backend
                return fetch("/start-leituras", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(ips)
                });
            })
            .then(() => {
                // Substitui iniciarTodasSSE() por iniciarSSEClps()
                iniciarSSEClps();
                pausado = 0;
                if (pausado === 0) {
                    const inputs = document.querySelectorAll('.divBancadaStatus input');
                    inputs.forEach(input => {
                        input.style.color = "rgb(0,255,0)"; // substitua por qualquer cor
                    });

                }
            })
            .catch(error => {
                console.error("Erro ao conectar:", error);
            });

        btn.textContent = "Desconectar";
        conectado = true;
        //enviarParaClp();
        sessionStorage.setItem("bancadaConectada", "true");
    } else {
        // Para as conexões SSE dos CLPs
        pararSSEClps();

        if (pausado === 0) {
            pausado = 1;
        }
        if (pausado === 1) {
            const inputs = document.querySelectorAll('.divBancadaStatus input');
            inputs.forEach(input => {
                input.style.color = "rgb(255,255,0)"; // substitua por qualquer cor
            });
        }
        // Envia comando para parar leituras no backend
        fetch("/stop-leituras", {
            method: "POST"
        });

        // Limpa as leituras
        clps.forEach(clp => {
            document.getElementById(`${clp}-dados`).textContent = "--";
        });
        ["Estoque", "Processo", "Montagem", "Expedicao"].forEach(nome => {
            document.getElementById(`leitura${nome}`).value = "--";
        });

        btn.textContent = "Conectar";
        conectado = false;
        sessionStorage.removeItem("bancadaConectada");
    }
}


// Conexões da tela html

let conectado = false;
let pausado = false;

function conectarBancada() {
    const btnConectar = document.getElementById("btnConectar");
    const btnPausar = document.getElementById("btnPausar");
    const statusBancada = document.getElementById("statusBancada");
    const statusText = document.getElementById("statusText");
    const storeButton = document.getElementById("storeButtonContainer");

    if (!conectado) {
        // Simulação de conexão - substituir pela chamada real ao backend
        const serverIp = document.getElementById("serverIp").value;
        if (!serverIp) {
            alert("Por favor, insira o endereço IP do servidor");
            return;
        }

        // Aqui você faria a chamada fetch para conectar
        console.log("Conectando ao servidor:", serverIp);

        // Atualiza UI para estado conectado
        statusBancada.style.backgroundColor = "rgb(0, 255, 0)";
        statusText.textContent = "Status: Conectado";
        btnConectar.textContent = "Desconectar";
        btnPausar.disabled = false;
        conectado = true;

        // Mostra o botão para a tela store
        storeButton.style.display = "block";
    } else {
        // Desconectar
        console.log("Desconectando do servidor");

        // Atualiza UI para estado desconectado
        statusBancada.style.backgroundColor = "rgb(255, 0, 0)";
        statusText.textContent = "Status: Desconectado";
        btnConectar.textContent = "Conectar";
        btnPausar.disabled = true;
        pausado = false;
        conectado = false;

        // Esconde o botão para a tela store
        storeButton.style.display = "none";
    }
}

function pausarConexao() {
    const btnPausar = document.getElementById("btnPausar");
    const statusBancada = document.getElementById("statusBancada");
    const statusText = document.getElementById("statusText");

    if (!pausado) {
        // Pausar conexão
        console.log("Pausando conexão");
        statusBancada.style.backgroundColor = "rgb(255, 255, 0)";
        statusText.textContent = "Status: Pausado";
        btnPausar.textContent = "Retomar";
        pausado = true;
    } else {
        // Retomar conexão
        console.log("Retomando conexão");
        statusBancada.style.backgroundColor = "rgb(0, 255, 0)";
        statusText.textContent = "Status: Conectado";
        btnPausar.textContent = "Pausar";
        pausado = false;
    }
}

function irParaStore() {
    // Redireciona para a tela store
    window.location.href = "/store";
}