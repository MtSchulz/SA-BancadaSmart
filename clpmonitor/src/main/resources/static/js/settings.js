// Carrega as configurações salvas
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('appSettings')) || {};
    
    // Tema
    if (settings.theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${settings.theme}-theme`);
        document.getElementById('themeSelector').value = settings.theme;
    }
    
    // Densidade
    if (settings.density) {
        document.body.classList.remove('compact-density', 'normal-density', 'comfortable-density');
        document.body.classList.add(`${settings.density}-density`);
        document.getElementById('densitySelector').value = settings.density;
    }
    
    // Notificações
    if (settings.emailNotifications !== undefined) {
        document.getElementById('emailNotifications').checked = settings.emailNotifications;
    }
    
    if (settings.systemNotifications !== undefined) {
        document.getElementById('systemNotifications').checked = settings.systemNotifications;
    }
    
    // Modo desenvolvedor
    if (settings.developerMode !== undefined) {
        document.getElementById('developerMode').checked = settings.developerMode;
    }
}

// Salva as configurações
function saveSettings() {
    const settings = {
        theme: document.getElementById('themeSelector').value,
        density: document.getElementById('densitySelector').value,
        emailNotifications: document.getElementById('emailNotifications').checked,
        systemNotifications: document.getElementById('systemNotifications').checked,
        developerMode: document.getElementById('developerMode').checked
    };
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('Configurações salvas com sucesso!');
}

// Muda o tema
function changeTheme() {
    const theme = document.getElementById('themeSelector').value;
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
}

// Limpa dados locais
function clearLocalData() {
    if (confirm('Tem certeza que deseja limpar todas as configurações locais?')) {
        localStorage.clear();
        location.reload();
    }
}

// Restaura padrões
function resetToDefault() {
    if (confirm('Restaurar todas as configurações para os valores padrão?')) {
        localStorage.removeItem('appSettings');
        location.reload();
    }
}

// Carrega as configurações quando a página é aberta
document.addEventListener('DOMContentLoaded', loadSettings);