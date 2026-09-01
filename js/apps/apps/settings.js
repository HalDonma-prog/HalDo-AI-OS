/**
 * HALDO AI OS 24.6 – SETTINGS APP
 * Zentrale Einstellungen
 */

const SettingsApp = {
    id: 'settings',
    name: 'Einstellungen',
    icon: '⚙️',
    currentCategory: 'display',
    
    open(params = {}) {
        console.log('⚙️ Einstellungen werden geöffnet...');
        this.currentCategory = params.category || 'display';
        
        const content = this.render();
        WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 700,
            params.height || 550
        );
    },
    
    render() {
        const categories = [
            { id: 'display', label: '🖥️ Display' },
            { id: 'ai', label: '🧠 AI & Memory' },
            { id: 'language', label: '🌍 Sprache & Voice' },
            { id: 'themes', label: '🎨 Themes' },
            { id: 'security', label: '🔒 Sicherheit' },
            { id: 'system', label: '📊 System' }
        ];
        
        const settingsHTML = Settings.getSettingsHTML(this.currentCategory) || '<p>Einstellungen laden...</p>';
        
        return `
            <div style="display:flex;height:100%;">
                <div style="width:180px;padding:12px;border-right:1px solid var(--glass-border);overflow-y:auto;flex-shrink:0;">
                    ${categories.map(cat => `
                        <div onclick="SettingsApp.switchCategory('${cat.id}')" style="
                            padding:10px 12px;
                            margin:2px 0;
                            border-radius:8px;
                            cursor:pointer;
                            ${this.currentCategory === cat.id ? 'background:var(--primary);color:white;' : 'color:var(--text-secondary);'}
                            transition:all var(--transition-fast);
                        ">
                            ${cat.label}
                        </div>
                    `).join('')}
                </div>
                <div id="settings-content" style="flex:1;padding:16px;overflow-y:auto;">
                    ${settingsHTML}
                </div>
            </div>
        `;
    },
    
    switchCategory(categoryId) {
        this.currentCategory = categoryId;
        this.updateWindow();
    },
    
    updateWindow() {
        const windows = WindowManager?.windows || [];
        const settingsWindow = windows.find(w => w.appId === 'settings');
        if (settingsWindow) {
            const body = settingsWindow.element.querySelector('.window-body');
            if (body) {
                body.innerHTML = this.render();
            }
        }
    }
};

// Registrieren
if (typeof AppRegistry !== 'undefined') {
    AppRegistry.register({
        id: 'settings',
        name: 'Einstellungen',
        icon: '⚙️',
        category: 'System',
        description: 'Alle Systemeinstellungen',
        open: (params) => SettingsApp.open(params)
    });
}

window.SettingsApp = SettingsApp;
