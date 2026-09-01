/**
 * HALDO AI OS 24.6 – APP MANAGER
 * 106 Apps verwalten, öffnen, installieren
 */

const AppManager = {
    apps: [],
    installedApps: [],
    isReady: false,

    // App-Definitionen (alle 106)
    appDefinitions: [
        // ---- A ----
        { id: 'ai-assistant', name: 'AI Assistant', icon: '🧠', category: 'AI', description: 'KI-Assistent' },
        { id: 'ai-chat', name: 'AI Chat', icon: '💬', category: 'AI', description: 'Chat mit KI' },
        { id: 'ai-command', name: 'AI Command Center', icon: '🎯', category: 'AI', description: 'Befehlszentrale' },
        { id: 'ai-knowledge', name: 'AI Knowledge', icon: '📚', category: 'AI', description: 'Wissensdatenbank' },
        { id: 'ai-memory', name: 'AI Memory', icon: '🧩', category: 'AI', description: 'Gedächtnis' },
        { id: 'ai-tools', name: 'AI Tools', icon: '🔧', category: 'AI', description: 'Werkzeuge' },
        { id: 'app-center', name: 'App Center', icon: '📱', category: 'System', description: 'App-Zentrum' },
        { id: 'app-manager', name: 'App Manager', icon: '⚙️', category: 'System', description: 'App-Verwaltung' },
        { id: 'audio-recorder', name: 'Audio Recorder', icon: '🎙️', category: 'Tools', description: 'Audio aufnehmen' },

        // ---- B ----
        { id: 'backup', name: 'Backup & Restore', icon: '💾', category: 'System', description: 'Backup' },
        { id: 'browser', name: 'Browser', icon: '🌐', category: 'Internet', description: 'Internet-Browser' },

        // ---- C ----
        { id: 'calculator', name: 'Calculator', icon: '🧮', category: 'Tools', description: 'Taschenrechner' },
        { id: 'calendar', name: 'Calendar', icon: '📅', category: 'Tools', description: 'Kalender' },
        { id: 'camera', name: 'Camera', icon: '📷', category: 'Tools', description: 'Kamera' },
        { id: 'contacts', name: 'Contacts', icon: '👥', category: 'Kommunikation', description: 'Kontakte' },
        { id: 'cosmic-world', name: 'Cosmic World', icon: '🌌', category: 'System', description: '3D-Universum' },
        { id: 'control-center', name: 'Control Center', icon: '🎛️', category: 'System', description: 'Systemsteuerung' },

        // ---- D ----
        { id: 'documents', name: 'Documents', icon: '📄', category: 'Office', description: 'Dokumente' },
        { id: 'downloads', name: 'Downloads', icon: '⬇️', category: 'System', description: 'Downloads' },
        { id: 'drive', name: 'Drive', icon: '☁️', category: 'Internet', description: 'Cloud-Speicher' },

        // ---- E ----
        { id: 'ezidi-keyboard', name: 'Êzîdî Keyboard', icon: '⌨️', category: 'Tools', description: 'Êzîdî-Tastatur' },
        { id: 'email', name: 'Email', icon: '✉️', category: 'Kommunikation', description: 'E-Mail' },
        { id: 'education', name: 'Education Center', icon: '🎓', category: 'Lernen', description: 'Bildung' },

        // ---- F ----
        { id: 'file-manager', name: 'File Manager', icon: '📂', category: 'System', description: 'Dateimanager' },
        { id: 'file-transfer', name: 'File Transfer', icon: '🔄', category: 'Tools', description: 'Dateien senden' },
        { id: 'finance', name: 'Finance', icon: '💰', category: 'Tools', description: 'Finanzen' },

        // ---- G ----
        { id: 'gallery', name: 'Gallery', icon: '🖼️', category: 'Media', description: 'Bildergalerie' },
        { id: 'games', name: 'Games Center', icon: '🎮', category: 'Unterhaltung', description: 'Spiele' },

        // ---- H ----
        { id: 'haldo-ai', name: 'HalDo AI', icon: '🤖', category: 'AI', description: 'Haupt-KI' },
        { id: 'haldo-assistant', name: 'HalDo Assistant', icon: '🧙', category: 'AI', description: 'Assistent' },
        { id: 'haldo-help', name: 'HalDo Help Center', icon: '❓', category: 'System', description: 'Hilfe' },
        { id: 'haldo-home', name: 'HalDo Home', icon: '🏠', category: 'System', description: 'Startseite' },

        // ---- I ----
        { id: 'image-editor', name: 'Image Editor', icon: '🎨', category: 'Tools', description: 'Bildbearbeitung' },
        { id: 'internet', name: 'Internet Center', icon: '🌍', category: 'Internet', description: 'Internet' },
        { id: 'identity', name: 'Identity & Account', icon: '🆔', category: 'System', description: 'Konto' },

        // ---- J ----
        { id: 'journal', name: 'Journal', icon: '📓', category: 'Tools', description: 'Tagebuch' },

        // ---- K ----
        { id: 'keyboard', name: 'Keyboard Center', icon: '⌨️', category: 'System', description: 'Tastatur' },
        { id: 'knowledge', name: 'Knowledge Center', icon: '🧠', category: 'AI', description: 'Wissen' },

        // ---- L ----
        { id: 'language', name: 'Language Center', icon: '🌍', category: 'System', description: 'Sprachen' },
        { id: 'learning', name: 'Learning Center', icon: '📖', category: 'Lernen', description: 'Lernen' },
        { id: 'logs', name: 'Logs', icon: '📋', category: 'System', description: 'System-Logs' },

        // ---- M ----
        { id: 'maps', name: 'Maps', icon: '🗺️', category: 'Internet', description: 'Karten' },
        { id: 'media', name: 'Media Center', icon: '🎬', category: 'Media', description: 'Medien' },
        { id: 'messages', name: 'Messages', icon: '💬', category: 'Kommunikation', description: 'Nachrichten' },
        { id: 'music', name: 'Music', icon: '🎵', category: 'Media', description: 'Musik' },

        // ---- N ----
        { id: 'notes', name: 'Notes', icon: '📝', category: 'Tools', description: 'Notizen' },
        { id: 'notifications', name: 'Notification Center', icon: '🔔', category: 'System', description: 'Benachrichtigungen' },

        // ---- O ----
        { id: 'office', name: 'Office Center', icon: '📊', category: 'Office', description: 'Büro' },
        { id: 'os-info', name: 'OS Information', icon: 'ℹ️', category: 'System', description: 'System-Info' },

        // ---- P ----
        { id: 'pdf', name: 'PDF Viewer', icon: '📕', category: 'Office', description: 'PDF-Betrachter' },
        { id: 'photos', name: 'Photos', icon: '🖼️', category: 'Media', description: 'Fotos' },
        { id: 'privacy', name: 'Privacy Center', icon: '🔒', category: 'System', description: 'Privatsphäre' },
        { id: 'process', name: 'Process Manager', icon: '⚡', category: 'System', description: 'Prozesse' },
        { id: 'passwords', name: 'Password Manager', icon: '🔑', category: 'System', description: 'Passwörter' },

        // ---- Q ----
        { id: 'qr', name: 'QR Scanner', icon: '📲', category: 'Tools', description: 'QR-Code' },
        { id: 'quick-settings', name: 'Quick Settings', icon: '⚡', category: 'System', description: 'Schnelleinstellungen' },

        // ---- R ----
        { id: 'recovery', name: 'Recovery Center', icon: '🔄', category: 'System', description: 'Wiederherstellung' },
        { id: 'reminders', name: 'Reminders', icon: '⏰', category: 'Tools', description: 'Erinnerungen' },
        { id: 'remote', name: 'Remote / Device Center', icon: '📡', category: 'System', description: 'Geräte' },

        // ---- S ----
        { id: 'search', name: 'Search', icon: '🔍', category: 'System', description: 'Suche' },
        { id: 'security', name: 'Security Center', icon: '🛡️', category: 'System', description: 'Sicherheit' },
        { id: 'settings', name: 'Settings', icon: '⚙️', category: 'System', description: 'Einstellungen' },
        { id: 'screenshot', name: 'Screenshot', icon: '📸', category: 'Tools', description: 'Bildschirmfoto' },
        { id: 'storage', name: 'Storage Manager', icon: '💾', category: 'System', description: 'Speicher' },
        { id: 'system-monitor', name: 'System Monitor', icon: '📊', category: 'System', description: 'Systemüberwachung' },
        { id: 'system-update', name: 'System Update', icon: '🔄', category: 'System', description: 'Updates' },
        { id: 'screen', name: 'Screen / Display Center', icon: '🖥️', category: 'System', description: 'Display' },

        // ---- T ----
        { id: 'task-manager', name: 'Task Manager', icon: '📋', category: 'System', description: 'Aufgaben' },
        { id: 'terminal', name: 'Terminal', icon: '⌨️', category: 'System', description: 'Kommandozeile' },
        { id: 'themes', name: 'Theme Center', icon: '🎨', category: 'System', description: 'Themes' },
        { id: 'time', name: 'Time / Clock', icon: '🕐', category: 'Tools', description: 'Uhr' },
        { id: 'translation', name: 'Translation Center', icon: '🌐', category: 'Tools', description: 'Übersetzung' },

        // ---- U ----
        { id: 'update', name: 'Update Center', icon: '⬆️', category: 'System', description: 'Updates' },
        { id: 'user', name: 'User Center', icon: '👤', category: 'System', description: 'Benutzer' },

        // ---- V ----
        { id: 'video-player', name: 'Video Player', icon: '🎬', category: 'Media', description: 'Video' },
        { id: 'video-calls', name: 'Video Calls', icon: '📹', category: 'Kommunikation', description: 'Videoanrufe' },
        { id: 'voice-center', name: 'Voice Center', icon: '🎤', category: 'System', description: 'Sprache' },
        { id: 'voice-recorder', name: 'Voice Recorder', icon: '🎙️', category: 'Tools', description: 'Sprachaufnahme' },

        // ---- W ----
        { id: 'weather', name: 'Weather', icon: '🌦️', category: 'Internet', description: 'Wetter' },
        { id: 'web-search', name: 'Web Search', icon: '🔎', category: 'Internet', description: 'Websuche' },
        { id: 'window-center', name: 'Window Center', icon: '🪟', category: 'System', description: 'Fenster' },
        { id: 'workspace', name: 'Workspace', icon: '🖥️', category: 'System', description: 'Arbeitsbereich' },

        // ---- X ----
        { id: 'extensions', name: 'Extensions Center', icon: '🧩', category: 'System', description: 'Erweiterungen' },

        // ---- Y ----
        { id: 'your-haldo', name: 'Your HalDo', icon: '💙', category: 'System', description: 'Persönlich' },
        { id: 'your-personal', name: 'Your Personal Center', icon: '👤', category: 'System', description: 'Persönliche Daten' },

        // ---- Z ----
        { id: 'zip', name: 'ZIP / Archive Manager', icon: '📦', category: 'Tools', description: 'Archive' },

        // ---- ZUSÄTZLICHE SYSTEM-APPS ----
        { id: 'living-ai', name: 'Living HalDo AI', icon: '👤', category: 'AI', description: 'Avatar' },
        { id: 'cosmic-desktop', name: 'Cosmic Desktop', icon: '🖥️', category: 'System', description: 'Desktop' },
        { id: 'solar-system', name: 'Solar System', icon: '☀️', category: 'Cosmic', description: 'Sonnensystem' },
        { id: 'planet-center', name: 'Planet Center', icon: '🪐', category: 'Cosmic', description: 'Planeten' },
        { id: 'haldo-portal', name: 'HalDo Portal', icon: '🚀', category: 'System', description: 'Portal' },
        { id: 'haldo-display', name: 'HalDo Display', icon: '🖥️', category: 'System', description: 'Display' },
        { id: 'communication', name: 'Communication Center', icon: '📡', category: 'Kommunikation',
            description: 'Kommunikation' },
        { id: 'haldo-mail', name: 'HalDo Mail', icon: '✉️', category: 'Kommunikation', description: 'Mail' },
        { id: 'haldo-chat', name: 'HalDo Chat', icon: '💬', category: 'Kommunikation', description: 'Chat' },
        { id: 'haldo-calls', name: 'HalDo Calls', icon: '📞', category: 'Kommunikation', description: 'Anrufe' },
        { id: 'ai-automation', name: 'AI Automation Center', icon: '🤖', category: 'AI', description: 'Automatisierung' },
        { id: 'ai-developer', name: 'AI Developer Center', icon: '👨‍💻', category: 'AI', description: 'Entwicklung' },
        { id: 'diagnostics', name: 'Diagnostics Center', icon: '🩺', category: 'System', description: 'Diagnose' },
        { id: 'installation', name: 'Installation Center', icon: '📥', category: 'System', description: 'Installation' },
        { id: 'migration', name: 'Migration Center', icon: '🔄', category: 'System', description: 'Migration' },
        { id: 'service-manager', name: 'Service Manager', icon: '⚙️', category: 'System', description: 'Dienste' },
        { id: 'module-manager', name: 'Module Manager', icon: '🧩', category: 'System', description: 'Module' },
        { id: 'app-runtime', name: 'App Runtime', icon: '⚡', category: 'System', description: 'Laufzeit' },
        { id: 'app-registry', name: 'App Registry', icon: '📋', category: 'System', description: 'Registrierung' },
        { id: 'system-center', name: 'System Center', icon: '🎛️', category: 'System', description: 'Systemzentrale' }
    ],

    // ---- INIT ----

    init() {
        console.log('📱 App Manager wird initialisiert...');

        // Installierte Apps aus Storage laden
        this.installedApps = Storage.get('installed_apps', []);

        // Alle Apps definieren
        this.apps = this.appDefinitions;

        // In Registry registrieren
        this.registerAll();

        this.isReady = true;
        console.log(`✅ App Manager ready – ${this.apps.length} Apps`);
        return this;
    },

    // ---- REGISTER ----

    registerAll() {
        if (typeof AppRegistry === 'undefined') {
            console.warn('⚠️ AppRegistry nicht verfügbar');
            return;
        }

        this.apps.forEach(app => {
            const appObj = {
                ...app,
                open: (params) => this.openApp(app.id, params),
                start: (params) => this.openApp(app.id, params),
                stop: () => this.closeApp(app.id)
            };
            AppRegistry.register(appObj);
        });

        console.log(`📱 ${this.apps.length} Apps registriert`);
    },

    // ---- OPEN APP ----

    openApp(appId, params = {}) {
        const app = this.apps.find(a => a.id === appId);
        if (!app) {
            console.warn(`⚠️ App ${appId} nicht gefunden`);
            return false;
        }

        // Prüfen ob installiert
        if (!this.isInstalled(appId) && appId !== 'settings' && appId !== 'app-center') {
            console.warn(`⚠️ App ${appId} nicht installiert`);
            return false;
        }

        // Spezielle Behandlung für Cosmic World
        if (appId === 'cosmic-world' || appId === 'cosmic-desktop') {
            if (typeof CosmicWorld !== 'undefined' && CosmicWorld.isReady) {
                // Cosmic World ist bereits im Hintergrund
                return true;
            }
        }

        // Spezielle Behandlung für Living AI
        if (appId === 'living-ai' || appId === 'haldo-ai') {
            if (typeof LivingAI !== 'undefined') {
                // Living AI anzeigen
                EventBus.emit('ai:open', { appId });
                return true;
            }
        }

        // Fenster öffnen
        if (typeof WindowManager !== 'undefined') {
            const content = this.getAppContent(appId);
            const icon = app.icon || '📱';
            const windowEl = WindowManager.openWindow(
                appId,
                app.name,
                content,
                icon,
                params.width || 600,
                params.height || 500
            );
            if (windowEl) {
                EventBus.emit('app:opened', { appId, window: windowEl });
                return true;
            }
        }

        console.warn(`⚠️ Fenster für ${appId} konnte nicht geöffnet werden`);
        return false;
    },

    // ---- CLOSE APP ----

    closeApp(appId) {
        if (typeof WindowManager !== 'undefined') {
            const windows = WindowManager.windows || [];
            const target = windows.find(w => w.appId === appId);
            if (target) {
                WindowManager.closeWindow(target.element);
                EventBus.emit('app:closed', { appId });
                return true;
            }
        }
        return false;
    },

    // ---- INSTALL / UNINSTALL ----

    installApp(appId) {
        const app = this.apps.find(a => a.id === appId);
        if (!app) return false;
        if (this.isInstalled(appId)) return false;

        this.installedApps.push(appId);
        Storage.set('installed_apps', this.installedApps);
        EventBus.emit('app:installed', { appId });
        console.log(`📱 App installiert: ${app.name}`);
        return true;
    },

    uninstallApp(appId) {
        if (appId === 'settings' || appId === 'app-center') {
            console.warn(`⚠️ System-App ${appId} kann nicht deinstalliert werden`);
            return false;
        }

        const index = this.installedApps.indexOf(appId);
        if (index === -1) return false;

        this.installedApps.splice(index, 1);
        Storage.set('installed_apps', this.installedApps);
        EventBus.emit('app:uninstalled', { appId });
        console.log(`📱 App deinstalliert: ${appId}`);
        return true;
    },

    isInstalled(appId) {
        return this.installedApps.includes(appId);
    },

    // ---- GET ----

    getApp(appId) {
        return this.apps.find(a => a.id === appId) || null;
    },

    getAllApps() {
        return this.apps;
    },

    getInstalledApps() {
        return this.apps.filter(a => this.isInstalled(a.id));
    },

    getByCategory(category) {
        return this.apps.filter(a => a.category === category);
    },

    getCategories() {
        const cats = new Set(this.apps.map(a => a.category));
        return Array.from(cats);
    },

    // ---- APP CONTENT ----

    getAppContent(appId) {
        const app = this.getApp(appId);
        if (!app) return '<p>App nicht gefunden</p>';

        // Spezielle Inhalte für bestimmte Apps
        switch (appId) {
            case 'settings':
                return this.getSettingsContent();
            case 'ai-chat':
            case 'haldo-ai':
                return this.getAIChatContent();
            case 'calendar':
                return this.getCalendarContent();
            case 'notes':
                return this.getNotesContent();
            case 'calculator':
                return this.getCalculatorContent();
            case 'weather':
                return this.getWeatherContent();
            case 'contacts':
                return this.getContactsContent();
            case 'browser':
                return this.getBrowserContent();
            default:
                return `
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;padding:20px;">
                        <div style="font-size:48px;">${app.icon || '📱'}</div>
                        <h2>${app.name}</h2>
                        <p style="color:var(--text-secondary);">${app.description || 'App wird geladen...'}</p>
                        <p style="color:var(--text-muted);font-size:12px;">Version 1.0 | ${app.category}</p>
                        <button onclick="AppManager.installApp('${appId}')" style="
                            padding:8px 24px;
                            background:var(--primary);
                            border:none;
                            border-radius:8px;
                            color:white;
                            cursor:pointer;
                            font-family:var(--font-primary);
                        ">Installieren</button>
                    </div>
                `;
        }
    },

    // ---- APP SPEZIFISCHE INHALTE ----

    getSettingsContent() {
        return `
            <div style="padding:16px;">
                <h2 style="margin-bottom:16px;">⚙️ Einstellungen</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="settings-card" onclick="Settings.openCategory('display')" style="
                        padding:16px;
                        background:var(--glass-bg);
                        border-radius:12px;
                        border:1px solid var(--glass-border);
                        cursor:pointer;
                    ">
                        🖥️ Display & Auflösung
                    </div>
                    <div class="settings-card" onclick="Settings.openCategory('language')" style="
                        padding:16px;
                        background:var(--glass-bg);
                        border-radius:12px;
                        border:1px solid var(--glass-border);
                        cursor:pointer;
                    ">
                        🌍 Sprache & Voice
                    </div>
                    <div class="settings-card" onclick="Settings.openCategory('ai')" style="
                        padding:16px;
                        background:var(--glass-bg);
                        border-radius:12px;
                        border:1px solid var(--glass-border);
                        cursor:pointer;
                    ">
                        🧠 AI & Memory
                    </div>
                    <div class="settings-card" onclick="Settings.openCategory('themes')" style="
                        padding:16px;
                        background:var(--glass-bg);
                        border-radius:12px;
                        border:1px solid var(--glass-border);
                        cursor:pointer;
                    ">
                        🎨 Themes & Design
                    </div>
                    <div class="settings-card" onclick="Settings.openCategory('security')" style="
                        padding:16px;
                        background:var(--glass-bg);
                        border-radius:12px;
                        border:1px solid var(--glass-border);
                        cursor:pointer;
                    ">
                        🔒 Sicherheit & Privacy
                    </div>
                    <div class="settings-card" onclick="Settings.openCategory('system')" style="
                        padding:16px;
                        background:var(--glass-bg);
                        border-radius:12px;
                        border:1px solid var(--glass-border);
                        cursor:pointer;
                    ">
                        📊 System & Updates
                    </div>
                </div>
            </div>
        `;
    },

    getAIChatContent() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;padding:12px;">
                <div id="ai-chat-messages" style="flex:1;overflow-y:auto;margin-bottom:12px;padding:8px;">
                    <div style="text-align:center;color:var(--text-muted);padding:20px;">
                        💙 Hallo! Ich bin HalDo, deine KI-Assistentin. <br>
                        Stelle mir eine Frage oder sag mir, was du möchtest.
                    </div>
                </div>
                <div style="display:flex;gap:8px;">
                    <input type="text" id="ai-chat-input" placeholder="Nachricht an HalDo..." style="
                        flex:1;
                        padding:10px 16px;
                        background:var(--glass-bg);
                        border:1px solid var(--glass-border);
                        border-radius:12px;
                        color:var(--text-primary);
                        font-family:var(--font-primary);
                        outline:none;
                    " onkeydown="if(event.key==='Enter') AppManager.sendAIMessage()">
                    <button onclick="AppManager.sendAIMessage()" style="
                        padding:10px 20px;
                        background:var(--primary);
                        border:none;
                        border-radius:12px;
                        color:white;
                        cursor:pointer;
                        font-family:var(--font-primary);
                    ">📤</button>
                    <button onclick="VoiceSystem.toggleListening()" style="
                        padding:10px 16px;
                        background:var(--glass-bg);
                        border:1px solid var(--glass-border);
                        border-radius:12px;
                        color:var(--text-secondary);
                        cursor:pointer;
                    ">🎤</button>
                </div>
            </div>
        `;
    },

    getCalendarContent() {
        return `
            <div style="padding:16px;">
                <h2>📅 Kalender</h2>
                <p style="color:var(--text-secondary);">${new Date().toLocaleDateString('de-DE', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
                <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:16px;">
                    ${['Mo','Di','Mi','Do','Fr','Sa','So'].map(d => `<div style="text-align:center;color:var(--text-muted);font-size:12px;padding:4px;">${d}</div>`).join('')}
                    ${Array.from({length:30}, (_,i) => `<div style="text-align:center;padding:8px;border-radius:8px;${i+1===new Date().getDate() ? 'background:var(--primary);color:white;' : 'background:var(--glass-bg);'}">${i+1}</div>`).join('')}
                </div>
            </div>
        `;
    },

    getNotesContent() {
        return `
            <div style="padding:16px;">
                <h2>📝 Notizen</h2>
                <div id="notes-list" style="margin-top:12px;">
                    <p style="color:var(--text-muted);">Keine Notizen vorhanden</p>
                </div>
                <div style="display:flex;gap:8px;margin-top:12px;">
                    <input type="text" id="notes-input" placeholder="Neue Notiz..." style="
                        flex:1;
                        padding:8px 12px;
                        background:var(--glass-bg);
                        border:1px solid var(--glass-border);
                        border-radius:8px;
                        color:var(--text-primary);
                        font-family:var(--font-primary);
                        outline:none;
                    ">
                    <button onclick="AppManager.addNote()" style="
                        padding:8px 16px;
                        background:var(--primary);
                        border:none;
                        border-radius:8px;
                        color:white;
                        cursor:pointer;
                    ">+</button>
                </div>
            </div>
        `;
    },

    getCalculatorContent() {
        return `
            <div style="padding:16px;max-width:300px;margin:0 auto;">
                <input type="text" id="calc-display" readonly style="
                    width:100%;
                    padding:12px;
                    background:var(--glass-bg);
                    border:1px solid var(--glass-border);
                    border-radius:8px;
                    color:var(--text-primary);
                    font-size:24px;
                    text-align:right;
                    font-family:var(--font-primary);
                    margin-bottom:12px;
                ">
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
                    ${['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','=','+'].map(b => `
                        <button onclick="AppManager.calcInput('${b}')" style="
                            padding:12px;
                            background:var(--glass-bg);
                            border:1px solid var(--glass-border);
                            border-radius:8px;
                            color:var(--text-primary);
                            font-size:18px;
                            cursor:pointer;
                            font-family:var(--font-primary);
                        ">${b}</button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    getWeatherContent() {
        return `
            <div style="padding:16px;text-align:center;">
                <h2>🌦️ Wetter</h2>
                <div style="font-size:48px;margin:16px 0;">☀️</div>
                <div style="font-size:32px;font-weight:700;">22°C</div>
                <p style="color:var(--text-secondary);">Sonnig • Berlin</p>
                <div style="display:flex;justify-content:center;gap:24px;margin-top:16px;">
                    <div><span style="color:var(--text-muted);">💧</span> 65%</div>
                    <div><span style="color:var(--text-muted);">💨</span> 12 km/h</div>
                </div>
            </div>
        `;
    },

    getContactsContent() {
        return `
            <div style="padding:16px;">
                <h2>👥 Kontakte</h2>
                <input type="text" placeholder="Suchen..." style="
                    width:100%;
                    padding:8px 12px;
                    margin:12px 0;
                    background:var(--glass-bg);
                    border:1px solid var(--glass-border);
                    border-radius:8px;
                    color:var(--text-primary);
                    font-family:var(--font-primary);
                    outline:none;
                ">
                <div style="color:var(--text-muted);text-align:center;padding:20px;">Keine Kontakte</div>
            </div>
        `;
    },

    getBrowserContent() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <div style="display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid var(--glass-border);">
                    <button onclick="AppManager.browserBack()" style="
                        background:var(--glass-bg);
                        border:none;
                        border-radius:6px;
                        color:var(--text-secondary);
                        padding:4px 10px;
                        cursor:pointer;
                    ">◀</button>
                    <button onclick="AppManager.browserForward()" style="
                        background:var(--glass-bg);
                        border:none;
                        border-radius:6px;
                        color:var(--text-secondary);
                        padding:4px 10px;
                        cursor:pointer;
                    ">▶</button>
                    <input type="text" id="browser-url" placeholder="URL eingeben..." style="
                        flex:1;
                        padding:6px 12px;
                        background:var(--glass-bg);
                        border:1px solid var(--glass-border);
                        border-radius:6px;
                        color:var(--text-primary);
                        font-family:var(--font-primary);
                        outline:none;
                    " onkeydown="if(event.key==='Enter') AppManager.browserNavigate()">
                    <button onclick="AppManager.browserNavigate()" style="
                        padding:6px 16px;
                        background:var(--primary);
                        border:none;
                        border-radius:6px;
                        color:white;
                        cursor:pointer;
                    ">Go</button>
                </div>
                <iframe id="browser-frame" src="about:blank" style="flex:1;border:none;background:white;"></iframe>
            </div>
        `;
    },

    // ---- APP FUNKTIONEN ----

    sendAIMessage() {
        const input = document.getElementById('ai-chat-input');
        const messages = document.getElementById('ai-chat-messages');
        if (!input || !messages || !input.value.trim()) return;

        const text = input.value.trim();
        input.value = '';

        // Nachricht anzeigen
        const userMsg = document.createElement('div');
        userMsg.style.cssText = 'text-align:right;margin:8px 0;color:var(--text-primary);';
        userMsg.textContent = `🧑 ${text}`;
        messages.appendChild(userMsg);

        // Lade-Indikator
        const loading = document.createElement('div');
        loading.style.cssText = 'text-align:left;margin:8px 0;color:var(--text-secondary);';
        loading.textContent = '💙 HalDo denkt...';
        messages.appendChild(loading);
        messages.scrollTop = messages.scrollHeight;

        // AI Antwort
        if (typeof AICore !== 'undefined') {
            AICore.simpleChat(text).then(response => {
                loading.remove();
                const aiMsg = document.createElement('div');
                aiMsg.style.cssText = 'text-align:left;margin:8px 0;color:var(--text-primary);';
                aiMsg.textContent = `💙 ${response || 'Keine Antwort'}`;
                messages.appendChild(aiMsg);
                messages.scrollTop = messages.scrollHeight;

                // Sprachausgabe
                if (typeof VoiceSystem !== 'undefined') {
                    VoiceSystem.speak(response || 'Keine Antwort');
                }
            });
        } else {
            loading.textContent = '💙 AI Core nicht verfügbar';
        }
    },

    calcInput(value) {
        const display = document.getElementById('calc-display');
        if (!display) return;

        if (value === '=') {
            try {
                const result = eval(display.value.replace('×', '*').replace('÷', '/'));
                display.value = result;
            } catch {
                display.value = 'Error';
            }
        } else if (value === 'C') {
            display.value = '';
        } else {
            display.value += value;
        }
    },

    addNote() {
        const input = document.getElementById('notes-input');
        const list = document.getElementById('notes-list');
        if (!input || !list || !input.value.trim()) return;

        const note = document.createElement('div');
        note.style.cssText = 'padding:8px 12px;background:var(--glass-bg);border-radius:6px;margin:4px 0;display:flex;justify-content:space-between;';
        note.innerHTML = `
            <span>${input.value.trim()}</span>
            <button onclick="this.parentElement.remove()" style="
                background:none;
                border:none;
                color:var(--text-muted);
                cursor:pointer;
            ">✕</button>
        `;
        list.appendChild(note);
        input.value = '';

        // "Keine Notizen" entfernen
        const empty = list.querySelector('p');
        if (empty) empty.remove();
    },

    browserNavigate() {
        const input = document.getElementById('browser-url');
        const frame = document.getElementById('browser-frame');
        if (!input || !frame) return;

        let url = input.value.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        try {
            frame.src = url;
        } catch {
            frame.src = 'about:blank';
        }
    },

    browserBack() {
        const frame = document.getElementById('browser-frame');
        if (frame && frame.contentWindow) {
            try { frame.contentWindow.history.back(); } catch {}
        }
    },

    browserForward() {
        const frame = document.getElementById('browser-frame');
        if (frame && frame.contentWindow) {
            try { frame.contentWindow.history.forward(); } catch {}
        }
    },

    // ---- DESKTOP ICONS ----

    renderDesktopIcons() {
        const container = document.getElementById('desktop-icons');
        if (!container) return;

        const installed = this.getInstalledApps();
        const icons = installed.slice(0, 12); // Max 12 auf Desktop

        container.innerHTML = icons.map(app => `
            <div class="desktop-icon" onclick="AppManager.openApp('${app.id}')" title="${app.description || app.name}">
                <span class="icon-img" style="font-size:32px;line-height:1;">${app.icon || '📱'}</span>
                <span class="icon-label">${app.name}</span>
            </div>
        `).join('');
    },

    // ---- SHORTCUTS ----

    getShortcuts() {
        return {
            'Cmd+K': 'AI öffnen',
            'Cmd+Shift+V': 'Stimme wechseln',
            'Cmd+Shift+L': 'Sprache wechseln',
            'Escape': 'Fenster schließen'
        };
    }
};

window.AppManager = AppManager;
