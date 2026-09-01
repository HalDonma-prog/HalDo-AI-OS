/**
 * HALDO AI OS 24.6.0 – BROWSER APP
 * Professioneller Webbrowser mit Tabs, Lesezeichen, Verlauf und Navigation
 * Version: 1.0.0
 */

const BrowserApp = {
    // ---- APP-INFO ----
    id: 'browser',
    name: 'Browser',
    icon: '🌐',
    category: 'communication',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Internet-Browser mit Tabs, Lesezeichen und Verlauf',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    tabs: [],
    activeTabId: null,
    bookmarks: [],
    history: [],
    isReady: false,
    
    // ---- STANDARD-STARTSEITE ----
    homeUrl: 'https://www.google.com',
    searchEngine: 'Google',
    searchEngines: {
        'Google': 'https://www.google.com/search?q=',
        'DuckDuckGo': 'https://duckduckgo.com/?q=',
        'Bing': 'https://www.bing.com/search?q=',
        'Ecosia': 'https://www.ecosia.org/search?q='
    },
    
    // ---- REGISTRIERUNG ----
    register() {
        if (typeof AppRegistry !== 'undefined') {
            AppRegistry.register({
                id: this.id,
                name: this.name,
                icon: this.icon,
                category: this.category,
                version: this.version,
                author: this.author,
                description: this.description,
                open: (params) => this.open(params),
                close: () => this.close(),
                install: () => this.install(),
                uninstall: () => this.uninstall()
            });
            console.log('🌐 Browser App registriert');
        }
        return this;
    },
    
    // ---- ÖFFNEN ----
    open(params = {}) {
        if (this.isOpen && this.window) {
            WindowManager.bringToFront(this.window);
            return this.window;
        }
        
        this.loadData();
        this.isOpen = true;
        
        // Ersten Tab erstellen
        if (this.tabs.length === 0) {
            const url = params.url || this.homeUrl;
            this.createTab(url);
        }
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 620,
            params.height || 500
        );
        
        if (this.window) {
            this.attachEvents();
            // After render, set iframe src
            setTimeout(() => this.loadActiveTab(), 200);
        }
        
        EventBus.emit('app:opened', { appId: this.id });
        return this.window;
    },
    
    // ---- SCHLIEßEN ----
    close() {
        if (this.window) {
            WindowManager.closeWindow(this.window);
            this.isOpen = false;
            this.window = null;
        }
        EventBus.emit('app:closed', { appId: this.id });
        return this;
    },
    
    // ---- DATEN LADEN ----
    loadData() {
        this.bookmarks = Storage.get('browser_bookmarks', []);
        this.history = Storage.get('browser_history', []);
        this.tabs = Storage.get('browser_tabs', []);
        this.searchEngine = Storage.get('browser_search_engine', 'Google');
        this.homeUrl = Storage.get('browser_home_url', 'https://www.google.com');
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('browser_bookmarks', this.bookmarks);
        Storage.set('browser_history', this.history);
        Storage.set('browser_tabs', this.tabs.slice(0, 10));
        Storage.set('browser_search_engine', this.searchEngine);
        Storage.set('browser_home_url', this.homeUrl);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Tab-Leiste -->
                <div style="display:flex;gap:2px;padding:4px 4px 0 4px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));overflow-x:auto;flex-shrink:0;">
                    ${this.tabs.map(tab => `
                        <div class="browser-tab" data-tab-id="${tab.id}" style="
                            display:flex;
                            align-items:center;
                            gap:4px;
                            padding:4px 8px;
                            background: ${this.activeTabId === tab.id ? 'var(--glass-bg, rgba(255,255,255,0.08))' : 'transparent'};
                            border-radius:6px 6px 0 0;
                            cursor:pointer;
                            border: 1px solid ${this.activeTabId === tab.id ? 'var(--glass-border, rgba(255,255,255,0.06))' : 'transparent'};
                            border-bottom: none;
                            font-size:11px;
                            color: ${this.activeTabId === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)'};
                            flex-shrink:0;
                            max-width:150px;
                            transition: all 0.15s ease;
                        " onclick="BrowserApp.switchTab('${tab.id}')">
                            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${tab.title || 'Neuer Tab'}</span>
                            <button style="
                                background:none;
                                border:none;
                                color:var(--text-muted);
                                cursor:pointer;
                                font-size:10px;
                                padding:0 2px;
                                ${this.tabs.length <= 1 ? 'display:none;' : ''}
                            " onclick="event.stopPropagation();BrowserApp.closeTab('${tab.id}')">✕</button>
                        </div>
                    `).join('')}
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 6px;flex-shrink:0;" onclick="BrowserApp.createTab()">+</button>
                </div>
                
                <!-- Adressleiste -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 6px;" onclick="BrowserApp.goBack()">◀</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 6px;" onclick="BrowserApp.goForward()">▶</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 6px;" onclick="BrowserApp.reloadTab()">⟳</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 6px;" onclick="BrowserApp.goHome()">🏠</button>
                    <input id="browser-url" class="haldo-input" placeholder="URL oder Suche eingeben..." style="flex:1;font-size:11px;min-width:80px;" 
                        onkeydown="if(event.key==='Enter')BrowserApp.navigateTo(this.value)">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 6px;" onclick="BrowserApp.bookmarkCurrent()">⭐</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 6px;" onclick="BrowserApp.toggleHistory()">📜</button>
                </div>
                
                <!-- Inhalt (iFrame) -->
                <div style="flex:1;position:relative;background:white;border-radius:0 0 8px 8px;overflow:hidden;">
                    <iframe id="browser-frame" src="about:blank" style="width:100%;height:100%;border:none;"></iframe>
                    <div id="browser-loading" style="
                        position:absolute;
                        top:50%;
                        left:50%;
                        transform:translate(-50%,-50%);
                        display:none;
                        text-align:center;
                        color:var(--text-muted);
                    ">
                        <div style="font-size:24px;">🌐</div>
                        <p style="font-size:12px;">Lädt...</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ---- TABS ----
    createTab(url = null) {
        const tab = {
            id: 'tab_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
            url: url || this.homeUrl,
            title: url ? this.getDomain(url) : 'Neuer Tab',
            history: [url || this.homeUrl],
            historyIndex: 0,
            createdAt: Date.now()
        };
        
        this.tabs.push(tab);
        this.activeTabId = tab.id;
        this.saveData();
        this.updateView();
        setTimeout(() => this.loadActiveTab(), 200);
        return tab;
    },
    
    switchTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        this.activeTabId = tabId;
        this.updateView();
        setTimeout(() => this.loadActiveTab(), 200);
    },
    
    closeTab(tabId) {
        if (this.tabs.length <= 1) {
            // Wenn letzter Tab, neuen Tab mit Startseite erstellen
            this.tabs = [];
            this.createTab(this.homeUrl);
            this.updateView();
            return;
        }
        
        const index = this.tabs.findIndex(t => t.id === tabId);
        if (index === -1) return;
        
        this.tabs.splice(index, 1);
        
        if (this.activeTabId === tabId) {
            const newIndex = Math.min(index, this.tabs.length - 1);
            this.activeTabId = this.tabs[newIndex].id;
        }
        
        this.saveData();
        this.updateView();
        setTimeout(() => this.loadActiveTab(), 200);
    },
    
    getActiveTab() {
        return this.tabs.find(t => t.id === this.activeTabId) || this.tabs[0] || null;
    },
    
    // ---- NAVIGATION ----
    navigateTo(input) {
        const tab = this.getActiveTab();
        if (!tab) return;
        
        let url = input.trim();
        
        // Wenn keine URL, nichts tun
        if (!url) return;
        
        // Suche erkennen
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // Prüfen ob es eine Domain ist (enthält Punkt)
            if (url.includes('.') && !url.includes(' ')) {
                url = 'https://' + url;
            } else {
                // Suche
                const engine = this.searchEngines[this.searchEngine] || this.searchEngines['Google'];
                url = engine + encodeURIComponent(url);
            }
        }
        
        tab.url = url;
        tab.title = this.getDomain(url);
        tab.history = tab.history.slice(0, tab.historyIndex + 1);
        tab.history.push(url);
        tab.historyIndex = tab.history.length - 1;
        
        // Verlauf speichern
        this.addToHistory(url, tab.title);
        
        this.saveData();
        this.updateView();
        this.loadActiveTab();
    },
    
    loadActiveTab() {
        const tab = this.getActiveTab();
        if (!tab) return;
        
        const frame = document.getElementById('browser-frame');
        const loading = document.getElementById('browser-loading');
        const urlInput = document.getElementById('browser-url');
        
        if (!frame) return;
        
        // Lade-Animation anzeigen
        if (loading) loading.style.display = 'block';
        
        try {
            frame.src = tab.url;
        } catch (e) {
            frame.src = 'about:blank';
        }
        
        // URL in Adressleiste aktualisieren
        if (urlInput) urlInput.value = tab.url;
        
        // Tab-Titel aktualisieren
        this.updateView();
        
        // Lade-Animation ausblenden nach kurzer Zeit
        setTimeout(() => {
            if (loading) loading.style.display = 'none';
        }, 500);
    },
    
    goBack() {
        const tab = this.getActiveTab();
        if (!tab || tab.historyIndex <= 0) return;
        
        tab.historyIndex--;
        tab.url = tab.history[tab.historyIndex];
        tab.title = this.getDomain(tab.url);
        
        this.saveData();
        this.updateView();
        this.loadActiveTab();
    },
    
    goForward() {
        const tab = this.getActiveTab();
        if (!tab || tab.historyIndex >= tab.history.length - 1) return;
        
        tab.historyIndex++;
        tab.url = tab.history[tab.historyIndex];
        tab.title = this.getDomain(tab.url);
        
        this.saveData();
        this.updateView();
        this.loadActiveTab();
    },
    
    reloadTab() {
        this.loadActiveTab();
    },
    
    goHome() {
        this.navigateTo(this.homeUrl);
    },
    
    // ---- LESEZEICHEN ----
    bookmarkCurrent() {
        const tab = this.getActiveTab();
        if (!tab) return;
        
        const existing = this.bookmarks.find(b => b.url === tab.url);
        if (existing) {
            if (confirm(`"${tab.title}" aus Lesezeichen entfernen?`)) {
                this.bookmarks = this.bookmarks.filter(b => b.url !== tab.url);
                this.saveData();
                alert('✅ Lesezeichen entfernt!');
            }
            return;
        }
        
        const name = prompt('📑 Name für Lesezeichen:', tab.title || tab.url);
        if (!name) return;
        
        this.bookmarks.push({
            name: name,
            url: tab.url,
            added: Date.now()
        });
        
        this.saveData();
        alert('⭐ Lesezeichen hinzugefügt!');
    },
    
    // ---- VERLAUF ----
    addToHistory(url, title) {
        // Duplikate vermeiden
        this.history = this.history.filter(h => h.url !== url);
        this.history.unshift({
            url: url,
            title: title || this.getDomain(url),
            visited: Date.now()
        });
        
        // Maximal 100 Einträge
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }
        
        this.saveData();
    },
    
    toggleHistory() {
        const historyContent = this.renderHistory();
        
        WindowManager.openWindow(
            'browser-history',
            '📜 Browser-Verlauf',
            historyContent,
            '📜',
            400,
            350
        );
    },
    
    renderHistory() {
        if (this.history.length === 0) {
            return `
                <div style="text-align:center;padding:30px;color:var(--text-muted);">
                    <p style="font-size:12px;">Kein Verlauf vorhanden</p>
                </div>
            `;
        }
        
        return `
            <div style="display:flex;flex-direction:column;gap:4px;padding:8px;max-height:300px;overflow-y:auto;">
                ${this.history.slice(0, 50).map(h => `
                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        padding:6px 10px;
                        background: var(--glass-bg, rgba(255,255,255,0.04));
                        border-radius:6px;
                        cursor:pointer;
                        border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                    " onclick="BrowserApp.navigateTo('${h.url}'); WindowManager.closeWindow(this.closest('.window'));">
                        <div>
                            <div style="font-size:12px;color:var(--text-primary);">${h.title}</div>
                            <div style="font-size:10px;color:var(--text-muted);">${h.url}</div>
                        </div>
                        <div style="font-size:9px;color:var(--text-muted);">${new Date(h.visited).toLocaleDateString('de')}</div>
                    </div>
                `).join('')}
                <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;margin-top:4px;" onclick="BrowserApp.clearHistory()">🗑️ Verlauf löschen</button>
            </div>
        `;
    },
    
    clearHistory() {
        if (!confirm('Verlauf wirklich löschen?')) return;
        this.history = [];
        this.saveData();
        alert('✅ Verlauf gelöscht!');
        // Fenster schließen
        const windows = WindowManager.windows || [];
        const historyWindow = windows.find(w => w.appId === 'browser-history');
        if (historyWindow) {
            WindowManager.closeWindow(historyWindow.element);
        }
    },
    
    // ---- UPDATE ----
    updateView() {
        const container = this.window?.querySelector('.window-body');
        if (container) {
            // Tab- und Adressleiste aktualisieren
            // Wir rendern die gesamte App neu
            container.innerHTML = this.render();
            this.attachEvents();
        }
    },
    
    // ---- EVENT BINDING ----
    attachEvents() {
        // iFrame-Load-Event
        const frame = document.getElementById('browser-frame');
        if (frame) {
            frame.addEventListener('load', () => {
                const loading = document.getElementById('browser-loading');
                if (loading) loading.style.display = 'none';
                this.updateView();
            });
            
            frame.addEventListener('error', () => {
                const loading = document.getElementById('browser-loading');
                if (loading) loading.style.display = 'none';
                alert('⚠️ Seite konnte nicht geladen werden.');
            });
        }
    },
    
    // ---- HELPER ----
    getDomain(url) {
        try {
            const u = new URL(url);
            return u.hostname.replace('www.', '');
        } catch {
            return url.substring(0, 30) + (url.length > 30 ? '...' : '');
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🌐 Browser App wird installiert...');
        this.loadData();
        if (this.bookmarks.length === 0) {
            this.bookmarks = [
                { name: 'Google', url: 'https://www.google.com', added: Date.now() },
                { name: 'GitHub', url: 'https://github.com', added: Date.now() }
            ];
            this.saveData();
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Browser App wird deinstalliert...');
        // Daten behalten für spätere Installation
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
BrowserApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.BrowserApp = BrowserApp;

console.log('🌐 Browser App geladen – HalDo AI OS 24.6.0');
