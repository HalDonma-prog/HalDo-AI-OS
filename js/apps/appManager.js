/**
 * HALDO AI OS 24.6.0 – APP MANAGER (KURZVERSION)
 */
const AppManager = {
    apps: [],
    installedApps: [],
    isReady: false,

    appDefinitions: [
        { id: 'app-center', name: 'HalDo Center', icon: '📱', category: 'system', desc: 'Alle Apps' },
        { id: 'settings', name: 'Einstellungen', icon: '⚙️', category: 'system', desc: 'Systemeinstellungen' },
        { id: 'system-monitor', name: 'System Monitor', icon: '📊', category: 'system', desc: 'Systemstatus' },
        { id: 'terminal', name: 'Terminal', icon: '⌨️', category: 'system', desc: 'Kommandozeile' },
        { id: 'notes', name: 'Notizen', icon: '📝', category: 'tools', desc: 'Notizen verwalten' },
        { id: 'calculator', name: 'Taschenrechner', icon: '🧮', category: 'tools', desc: 'Rechner' },
        { id: 'calendar', name: 'Kalender', icon: '📅', category: 'tools', desc: 'Termine' },
        { id: 'weather', name: 'Wetter', icon: '🌦️', category: 'tools', desc: 'Wettervorhersage' },
        { id: 'contacts', name: 'Kontakte', icon: '👥', category: 'communication', desc: 'Adressbuch' },
        { id: 'messages', name: 'Nachrichten', icon: '💬', category: 'communication', desc: 'Chat & SMS' },
        { id: 'email', name: 'E-Mail', icon: '✉️', category: 'communication', desc: 'E-Mail Client' },
        { id: 'browser', name: 'Browser', icon: '🌐', category: 'communication', desc: 'Internet' },
        { id: 'music', name: 'Musik', icon: '🎵', category: 'media', desc: 'Musikplayer' },
        { id: 'gallery', name: 'Galerie', icon: '🖼️', category: 'media', desc: 'Bilder & Videos' },
        { id: 'file-manager', name: 'Dateien', icon: '📂', category: 'system', desc: 'Dateiverwaltung' },
        { id: 'clock', name: 'Uhr', icon: '🕐', category: 'tools', desc: 'Uhr & Timer' },
        { id: 'journal', name: 'Journal', icon: '📓', category: 'tools', desc: 'Tagebuch' },
        { id: 'reminders', name: 'Erinnerungen', icon: '⏰', category: 'tools', desc: 'Erinnerungen' },
        { id: 'maps', name: 'Karten', icon: '🗺️', category: 'tools', desc: 'Karten & Routen' },
        { id: 'video-player', name: 'Video', icon: '🎬', category: 'media', desc: 'Videoplayer' },
        { id: 'camera', name: 'Kamera', icon: '📷', category: 'media', desc: 'Foto & Video' },
        { id: 'haldo-ai', name: 'HalDo AI', icon: '🤖', category: 'ai', desc: 'Persönliche KI' },
        { id: 'ai-chat', name: 'AI Chat', icon: '💬', category: 'ai', desc: 'Chat mit KI' },
        { id: 'cosmic-world', name: 'Cosmic World', icon: '🌌', category: 'cosmic', desc: '3D-Universum' }
    ],

    init() {
        console.log('📱 App Manager wird initialisiert...');
        this.apps = this.appDefinitions;
        this.installedApps = Storage.get('installed_apps', []);
        if (this.installedApps.length === 0) {
            this.installedApps = this.apps.map(a => a.id);
            Storage.set('installed_apps', this.installedApps);
        }
        this.renderDesktopIcons();
        this.isReady = true;
        console.log(`✅ ${this.installedApps.length} Apps installiert`);
        return this;
    },

    openApp(appId) {
        const app = this.apps.find(a => a.id === appId);
        if (!app) { alert('App nicht gefunden'); return false; }
        if (!this.installedApps.includes(appId)) this.installApp(appId);

        if (appId === 'cosmic-world') {
            if (!CosmicWorld.isReady) CosmicWorld.init();
            else alert('🌌 Cosmic World läuft bereits!');
            return true;
        }

        if (appId === 'haldo-ai' || appId === 'ai-chat') {
            this.openAIChat(app);
            return true;
        }

        if (appId === 'settings') {
            this.openSettings(app);
            return true;
        }

        this.openGenericWindow(app);
        return true;
    },

    openGenericWindow(app) {
        const content = this.getAppContent(app.id);
        const win = this.createWindow(app.name, app.icon, content);
        document.getElementById('window-container').appendChild(win);
        this.updateTaskbar();
    },

    createWindow(title, icon, content, width = 420, height = 340) {
        const win = document.createElement('div');
        win.className = 'window';
        const w = Math.min(width, window.innerWidth - 40);
        const h = Math.min(height, window.innerHeight - 100);
        win.style.cssText =
            `left:${20+Math.random()*20}px;top:${15+Math.random()*20}px;width:${w}px;height:${h}px;z-index:${Date.now()%1000+100};`;

        win.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span class="icon">${icon}</span><span>${title}</span></div>
                <div class="window-controls">
                    <button class="btn-minimize" onclick="this.closest('.window').classList.toggle('minimized')">−</button>
                    <button class="btn-maximize" onclick="this.closest('.window').classList.toggle('maximized')">⛶</button>
                    <button class="btn-close" onclick="this.closest('.window').remove(); AppManager.updateTaskbar();">✕</button>
                </div>
            </div>
            <div class="window-body">${content}</div>
        `;

        // Drag (vereinfacht)
        const header = win.querySelector('.window-header');
        let drag = false,
            sx, sy, ox, oy;
        header.addEventListener('mousedown', (e) => {
            if (win.classList.contains('maximized')) return;
            drag = true;
            const r = win.getBoundingClientRect();
            sx = e.clientX;
            sy = e.clientY;
            ox = r.left;
            oy = r.top;
            win.style.cursor = 'grabbing';
        });
        document.addEventListener('mousemove', (e) => {
            if (!drag) return;
            win.style.left = (ox + e.clientX - sx) + 'px';
            win.style.top = (oy + e.clientY - sy) + 'px';
        });
        document.addEventListener('mouseup', () => { if (drag) { drag = false;
                win.style.cursor = ''; } });

        // Resize (vereinfacht)
        const resizeHandle = document.createElement('div');
        resizeHandle.style.cssText =
            'position:absolute;bottom:0;right:0;width:14px;height:14px;cursor:nwse-resize;z-index:1000;';
        win.appendChild(resizeHandle);
        let rs = false,
            rsx, rsy, rsw, rsh;
        resizeHandle.addEventListener('mousedown', (e) => {
            if (win.classList.contains('maximized')) return;
            rs = true;
            rsx = e.clientX;
            rsy = e.clientY;
            rsw = win.offsetWidth;
            rsh = win.offsetHeight;
            e.preventDefault();
            e.stopPropagation();
        });
        document.addEventListener('mousemove', (e) => {
            if (!rs) return;
            win.style.width = Math.max(200, rsw + e.clientX - rsx) + 'px';
            win.style.height = Math.max(140, rsh + e.clientY - rsy) + 'px';
        });
        document.addEventListener('mouseup', () => { rs = false; });

        return win;
    },

    getAppContent(appId) {
        const app = this.apps.find(a => a.id === appId);
        if (!app) return '<p>App nicht gefunden</p>';

        switch (appId) {
            case 'notes':
                return this.getNotesUI();
            case 'calculator':
                return this.getCalculatorUI();
            case 'calendar':
                return this.getCalendarUI();
            case 'weather':
                return this.getWeatherUI();
            case 'contacts':
                return this.getContactsUI();
            case 'system-monitor':
                return this.getSystemMonitorUI();
            case 'terminal':
                return this.getTerminalUI();
            default:
                return `
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:6px;text-align:center;">
                        <div style="font-size:40px;">${app.icon}</div>
                        <h2 style="color:var(--text-primary);font-size:14px;">${app.name}</h2>
                        <p style="color:var(--text-secondary);font-size:11px;">${app.desc || 'Bereit für HalDo OS 24.6'}</p>
                        <p style="color:var(--text-muted);font-size:10px;">Version 24.6.0 | ${app.category}</p>
                    </div>
                `;
        }
    },

    getNotesUI() {
        const notes = Storage.get('notes', []);
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <div style="display:flex;gap:4px;margin-bottom:6px;">
                    <input id="notes-input" class="haldo-input" placeholder="Neue Notiz..." style="flex:1;font-size:11px;">
                    <button onclick="AppManager.addNote()" class="haldo-btn" style="font-size:11px;">+</button>
                </div>
                <div id="notes-list" style="flex:1;overflow-y:auto;">
                    ${notes.length === 0 ? '<p style="color:var(--text-muted);text-align:center;font-size:11px;">Keine Notizen</p>' :
                    notes.map((n, i) => `
                        <div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--glass-bg);border-radius:5px;margin:2px 0;border:1px solid var(--glass-border);font-size:11px;">
                            <span>${n}</span>
                            <button onclick="AppManager.deleteNote(${i})" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:12px;">✕</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    addNote() {
        const input = document.getElementById('notes-input');
        if (!input || !input.value.trim()) return;
        const notes = Storage.get('notes', []);
        notes.push(input.value.trim());
        Storage.set('notes', notes);
        input.value = '';
        const body = document.querySelector('.window .window-body');
        if (body) body.innerHTML = this.getNotesUI();
    },

    deleteNote(index) {
        const notes = Storage.get('notes', []);
        notes.splice(index, 1);
        Storage.set('notes', notes);
        const body = document.querySelector('.window .window-body');
        if (body) body.innerHTML = this.getNotesUI();
    },

    getCalculatorUI() {
        return `
            <div style="max-width:240px;margin:0 auto;">
                <div id="calc-display" style="padding:8px 12px;background:rgba(0,0,0,0.2);border-radius:6px;text-align:right;font-size:22px;font-weight:700;margin-bottom:6px;min-height:40px;">0</div>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px;">
                    ${['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','⌫','='].map(b => `
                        <button onclick="AppManager.calcInput('${b}')" style="padding:8px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:5px;color:var(--text-primary);font-size:15px;cursor:pointer;">${b}</button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    calcInput(value) {
        const d = document.getElementById('calc-display');
        if (!d) return;
        if (value === '=') {
            try { d.textContent = eval(d.textContent.replace('×', '*').replace('÷', '/')); } catch { d.textContent =
                    'Error'; }
        } else if (value === 'C') { d.textContent = '0'; } else if (value === '⌫') { d.textContent = d.textContent
                .length > 1 ? d.textContent.slice(0, -1) : '0'; } else {
            if (d.textContent === '0' && value !== '.') d.textContent = value;
            else d.textContent += value;
        }
    },

    getCalendarUI() {
        const now = new Date();
        const month = now.toLocaleString('de', { month: 'long' });
        const year = now.getFullYear();
        const days = Array.from({ length: 30 }, (_, i) => i + 1);
        return `
            <div style="text-align:center;">
                <h2 style="color:var(--text-primary);font-size:14px;">${month} ${year}</h2>
                <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-top:6px;">
                    ${['Mo','Di','Mi','Do','Fr','Sa','So'].map(d => `<div style="color:var(--text-muted);font-size:9px;padding:2px;">${d}</div>`).join('')}
                    ${days.map(d => `<div style="padding:4px;border-radius:4px;font-size:12px;background:${d===now.getDate()?'var(--primary)':'var(--glass-bg)'};color:${d===now.getDate()?'white':'var(--text-secondary)'};cursor:pointer;">${d}</div>`).join('')}
                </div>
            </div>
        `;
    },

    getWeatherUI() {
        return `
            <div style="text-align:center;padding:8px;">
                <div style="font-size:40px;">☀️</div>
                <div style="font-size:24px;font-weight:700;color:var(--text-primary);">22°C</div>
                <p style="color:var(--text-secondary);font-size:11px;">Sonnig • Berlin</p>
                <div style="display:flex;justify-content:center;gap:16px;margin:4px 0;">
                    <div style="font-size:11px;">💧 65%</div>
                    <div style="font-size:11px;">💨 12 km/h</div>
                </div>
            </div>
        `;
    },

    getContactsUI() {
        const contacts = Storage.get('contacts', [
            { name: 'HalDo AI', phone: '+49 123 456789', email: 'haldo@haldo-os.com' }
        ]);
        return `
            <div>
                <div style="display:flex;gap:4px;margin-bottom:6px;">
                    <input class="haldo-input" placeholder="Suchen..." style="flex:1;font-size:11px;">
                    <button class="haldo-btn" style="font-size:11px;" onclick="alert('Neuer Kontakt')">+</button>
                </div>
                ${contacts.map(c => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--glass-bg);border-radius:5px;margin:2px 0;border:1px solid var(--glass-border);font-size:11px;">
                        <div><div style="font-weight:600;color:var(--text-primary);">${c.name}</div><div style="font-size:10px;color:var(--text-muted);">${c.phone}</div></div>
                        <button style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:12px;">✉️</button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    getSystemMonitorUI() {
        return `
            <div>
                <h2 style="color:var(--text-primary);font-size:13px;">📊 System Monitor</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px;">
                    <div style="padding:6px 10px;background:var(--glass-bg);border-radius:4px;border:1px solid var(--glass-border);">
                        <div style="color:var(--text-muted);font-size:9px;">CPU</div>
                        <div style="font-size:18px;font-weight:700;color:var(--text-primary);">12%</div>
                    </div>
                    <div style="padding:6px 10px;background:var(--glass-bg);border-radius:4px;border:1px solid var(--glass-border);">
                        <div style="color:var(--text-muted);font-size:9px;">RAM</div>
                        <div style="font-size:18px;font-weight:700;color:var(--text-primary);">3.2 GB</div>
                    </div>
                    <div style="padding:6px 10px;background:var(--glass-bg);border-radius:4px;border:1px solid var(--glass-border);">
                        <div style="color:var(--text-muted);font-size:9px;">Speicher</div>
                        <div style="font-size:18px;font-weight:700;color:var(--text-primary);">42%</div>
                    </div>
                    <div style="padding:6px 10px;background:var(--glass-bg);border-radius:4px;border:1px solid var(--glass-border);">
                        <div style="color:var(--text-muted);font-size:9px;">Uptime</div>
                        <div style="font-size:18px;font-weight:700;color:var(--text-primary);">${Kernel.getUptime()}s</div>
                    </div>
                </div>
            </div>
        `;
    },

    getTerminalUI() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <div id="terminal-output" style="flex:1;background:rgba(0,0,0,0.3);border-radius:5px;padding:8px;font-family:monospace;font-size:11px;overflow-y:auto;min-height:80px;color:#00ff88;white-space:pre-wrap;">
                    > HalDo OS Terminal v${Kernel.version}\n> ⚡ Bereit für Befehle
                </div>
                <div style="display:flex;gap:4px;margin-top:4px;">
                    <span style="color:var(--text-secondary);font-size:11px;">$</span>
                    <input id="terminal-input" class="haldo-input" placeholder="Befehl..." style="flex:1;font-size:11px;" onkeydown="if(event.key==='Enter')AppManager.runCommand()">
                    <button onclick="AppManager.runCommand()" class="haldo-btn" style="font-size:10px;padding:2px 8px;">⏎</button>
                </div>
            </div>
        `;
    },

    runCommand() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');
        if (!input || !output) return;
        const cmd = input.value.trim();
        if (!cmd) return;
        output.textContent += `\n$ ${cmd}`;
        input.value = '';

        const responses = {
            help: 'help, version, apps, clear, echo, date, uptime, reboot, shutdown, ai <frage>',
            version: `HalDo AI OS ${Kernel.version}`,
            apps: `Apps: ${AppManager.installedApps.length} installiert`,
            clear: '> Terminal gelöscht',
            date: new Date().toLocaleString(),
            uptime: `${Kernel.getUptime()}s`,
            reboot: 'System wird neu gestartet...',
            shutdown: 'System wird heruntergefahren...',
            echo: (args) => args.join(' ')
        };

        const parts = cmd.split(' ');
        const command = parts[0].toLowerCase();
        if (command === 'clear') {
            output.textContent = '> Terminal gelöscht';
        } else if (command === 'echo') {
            output.textContent += `\n> ${parts.slice(1).join(' ')}`;
        } else if (command === 'reboot') {
            output.textContent += '\n> Neustart...';
            setTimeout(() => Kernel.reboot(), 1000);
        } else if (command === 'shutdown') {
            output.textContent += '\n> Herunterfahren...';
            setTimeout(() => Kernel.shutdown(), 1000);
        } else if (command === 'ai') {
            const question = parts.slice(1).join(' ');
            if (!question) { output.textContent += '\n> Bitte Frage: ai <frage>'; return; }
            output.textContent += '\n> 🤖 Frage wird gesendet...';
            AICore.simpleChat(question).then(reply => {
                output.textContent += `\n> 💙 ${reply}`;
                output.scrollTop = output.scrollHeight;
            });
        } else if (responses[command]) {
            const result = typeof responses[command] === 'function' ? responses[command](parts.slice(1)) :
                responses[command];
            output.textContent += `\n> ${result}`;
        } else {
            output.textContent += `\n> Unbekannt: ${cmd}`;
        }
        output.scrollTop = output.scrollHeight;
    },

    // ===== SETTINGS =====
    openSettings(app) {
        const categories = [
            { id: 'general', label: '⚙️ Allgemein' },
            { id: 'ai', label: '🧠 AI & Memory' },
            { id: 'display', label: '🖥️ Display' },
            { id: 'language', label: '🌍 Sprache' },
            { id: 'themes', label: '🎨 Themes' },
            { id: 'voice', label: '🎤 Voice' },
            { id: 'system', label: '📊 System' },
            { id: 'security', label: '🔒 Sicherheit' },
            { id: 'storage', label: '💾 Speicher' }
        ];
        const content = `
            <div style="display:flex;height:100%;">
                <div style="width:110px;padding:3px;border-right:1px solid var(--glass-border);flex-shrink:0;overflow-y:auto;">
                    ${categories.map(c => `
                        <div onclick="AppManager.showSettings('${c.id}')" data-cat="${c.id}" style="padding:4px 8px;margin:2px 0;border-radius:4px;cursor:pointer;color:var(--text-secondary);font-size:10px;transition:all var(--transition-fast);">${c.label}</div>
                    `).join('')}
                </div>
                <div id="settings-content" style="flex:1;padding:8px;overflow-y:auto;">
                    <h2 style="color:var(--text-primary);font-size:13px;">Einstellungen</h2>
                    <p style="color:var(--text-secondary);font-size:11px;">Wähle eine Kategorie</p>
                </div>
            </div>
        `;
        const win = this.createWindow(app.name, app.icon, content, 480, 380);
        document.getElementById('window-container').appendChild(win);
        this.updateTaskbar();
        setTimeout(() => this.showSettings('general'), 100);
    },

    showSettings(category) {
        const container = document.getElementById('settings-content');
        if (!container) return;

        document.querySelectorAll('[data-cat]').forEach(el => {
            el.style.background = el.dataset.cat === category ? 'var(--primary)' : 'transparent';
            el.style.color = el.dataset.cat === category ? 'white' : 'var(--text-secondary)';
        });

        let content = '';
        switch (category) {
            case 'general':
                content = `
                    <h2 style="color:var(--text-primary);font-size:13px;">⚙️ Allgemein</h2>
                    <div style="margin-top:4px;">
                        <div style="margin:4px 0;"><label style="color:var(--text-secondary);font-size:10px;">Systemname</label><input class="haldo-input" value="HalDo AI OS ${Kernel.version}" style="font-size:10px;margin-top:2px;"></div>
                        <div style="margin:4px 0;"><label style="color:var(--text-secondary);font-size:10px;">Zeitzone</label><select class="haldo-input" style="font-size:10px;margin-top:2px;"><option>Europe/Berlin</option><option>Europe/London</option></select></div>
                    </div>
                `;
                break;
            case 'ai':
                const apiKey = Storage.get('groq_api_key', '');
                content = `
                    <h2 style="color:var(--text-primary);font-size:13px;">🧠 AI & Memory</h2>
                    <div style="margin-top:4px;">
                        <div style="margin:4px 0;">
                            <label style="color:var(--text-secondary);font-size:10px;">🔑 Groq API Key</label>
                            <input id="ai-key-input" class="haldo-input" type="password" value="${apiKey}" placeholder="gsk_..." style="font-size:10px;margin-top:2px;">
                            <button onclick="AppManager.saveAIKey()" class="haldo-btn" style="font-size:10px;margin-top:2px;">Speichern</button>
                        </div>
                        <div style="padding:4px;background:var(--glass-bg);border-radius:4px;margin-top:4px;">
                            <p style="color:var(--text-secondary);font-size:10px;">🧠 Memory: ${Storage.get('ai_memory', []).length} Einträge</p>
                            <button onclick="Storage.set('ai_memory', []);alert('Memory gelöscht!');" class="haldo-btn haldo-btn-secondary" style="font-size:9px;padding:2px 6px;">🗑️ Löschen</button>
                        </div>
                    </div>
                `;
                break;
            case 'display':
                content = `
                    <h2 style="color:var(--text-primary);font-size:13px;">🖥️ Display</h2>
                    <div style="margin-top:4px;">
                        <div style="margin:4px 0;"><label style="color:var(--text-secondary);font-size:10px;">Auflösung</label><select class="haldo-input" style="font-size:10px;margin-top:2px;"><option>Full HD (1920x1080)</option><option>4K (3840x2160)</option><option>8K (7680x4320)</option></select></div>
                        <div style="margin:4px 0;"><label style="color:var(--text-secondary);font-size:10px;">Helligkeit</label><input type="range" min="0" max="100" value="80" style="width:100%;accent-color:var(--primary);"></div>
                    </div>
                `;
                break;
            case 'language':
                content = `
                    <h2 style="color:var(--text-primary);font-size:13px;">🌍 Sprache</h2>
                    <div style="margin-top:4px;">
                        <div style="margin:4px 0;"><label style="color:var(--text-secondary);font-size:10px;">Systemsprache</label><select class="haldo-input" style="font-size:10px;margin-top:2px;" onchange="document.getElementById('menu-lang').textContent=this.value;"><option>🇩🇪 Deutsch</option><option>🇬🇧 English</option><option>🏴 Kurmancî</option><option>🏴 Êzîdî</option><option>🇹🇷 Türkçe</option><option>🇸🇦 العربية</option><option>🇫🇷 Français</option><option>🇪🇸 Español</option><option>🇷🇺 Русский</option><option>🇮🇷 فارسی</option><option>🇮🇹 Italiano</option><option>🇵🇹 Português</option></select></div>
                        <div style="margin:4px 0;"><label style="color:var(--text-secondary);font-size:10px;">Tastaturlayout</label><select class="haldo-input" style="font-size:10px;margin-top:2px;"><option>QWERTZ</option><option>QWERTY</option><option>Êzîdî</option></select></div>
                    </div>
                `;
                break;
            case 'themes':
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
                content = `
                    <h2 style="color:var(--text-primary);font-size:13px;">🎨 Themes</h2>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
                        ${['dark','light','cosmic','aurora','midnight'].map(t => `
                            <div onclick="document.documentElement.setAttribute('data-theme','${t}');const icons={dark:'🌙',light:'☀️',cosmic:'🌌',aurora:'🌠',midnight:'🌃'};document.getElementById('menu-theme').textContent=icons['${t}'];Storage.set('theme','${t}');" style="padding:3px 8px;background:var(--glass-bg);border-radius:4px;cursor:pointer;border:2px solid ${currentTheme===t?'var(--primary)':'var(--glass-border)'};font-size:10px;">
                                ${t==='dark'?'🌙':t==='light'?'☀️':t==='cosmic'?'🌌':t==='aurora'?'🌠':'🌃'} ${t.charAt(0).toUpperCase()+t.slice(1)}
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
            case 'voice':
                content = `
                    <h2 style="color:var(--text-primary);font-size:13px;">🎤 Voice</h2>
                    <div style="margin-top:4px;">
                        <div style="margin:4px 0;"><label style="color:var(--text-secondary);font-size:10px;">Stimme</label><select class="haldo-input" style="font-size:10px;margin-top:2px;" onchange="document.getElementById('menu-voice').textContent=this.value;"><option>👩 Deutsch – weiblich</option><option>👨 Deutsch – männlich</option><option>👧 Deutsch – jung</option><option>👩🇬🇧 English – female</option><option>👨🇬🇧 English – male</option></select></div>
                        <button class="haldo-btn" style="font-size:10px;" onclick="if('speechSynthesis' in window){const u=new SpeechSynthesisUtterance('Hallo, ich bin HalDo!');u.lang='de-DE';window.speechSynthesis.speak(u);}else{alert('TTS nicht unterstützt');}">🔊 Test</button>
                    </div>
                `;
                break;
            case 'system':
                content = `
                    <h2 style="color:var(--text-primary);font-size:13px;">📊 System</h2>
                    <p style="color:var(--text-secondary);font-size:11px;">Version: ${Kernel.version}</p>
                    <p style="color:var(--text-secondary);font-size:11px;">Uptime: ${Kernel.getUptime()}s</p>
                    <p style="color:var(--text-secondary);font-size:11px;">Apps: ${this.installedApps.length}</p>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;">
                        <button onclick="Kernel.reboot()" class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;">🔄 Neustart</button>
                        <button onclick="Storage.clear();alert('Cache geleert!');" class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;">🗑️ Cache leeren</button>
                    </div>
                `;
                break;
            case 'security':
                content = `
                    <h2 style="color:var(--text-primary);font-size:13px;">🔒 Sicherheit</h2>
                    <div style="padding:4px;background:var(--glass-bg);border-radius:4px;margin:4px 0;border:1px solid var(--glass-border);">
                        <p style="color:var(--success);font-size:11px;">✅ System sicher</p>
                    </div>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;" onclick="alert('🛡️ Sicherheitsprüfung: OK')">🛡️ Prüfen</button>
                `;
                break;
            case 'storage':
                content = `
                    <h2 style="color:var(--text-primary);font-size:13px;">💾 Speicher</h2>
                    <p style="color:var(--text-secondary);font-size:11px;">Einträge: ${localStorage.length}</p>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:9px;padding:2px 8px;" onclick="alert('📊 Speicher: ${localStorage.length} Einträge')">📊 Analysieren</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:9px;padding:2px 8px;" onclick="if(confirm('Alle Daten löschen?')){Storage.clear();alert('Gelöscht!');}">🗑️ Löschen</button>
                    </div>
                `;
                break;
        }
        container.innerHTML = content;
    },

    saveAIKey() {
        const input = document.getElementById('ai-key-input');
        if (!input) return;
        const key = input.value.trim();
        if (key) { Storage.set('groq_api_key', key);
            AICore.setApiKey(key);
            alert('✅ API Key gespeichert!'); } else { alert('⚠️ Bitte Key eingeben.'); }
    },

    // ===== AI CHAT =====
    openAIChat(app) {
        const content = `
            <div style="display:flex;flex-direction:column;height:100%;padding:0;">
                <div id="ai-chat-messages" style="flex:1;overflow-y:auto;padding:8px;margin-bottom:4px;">
                    <div style="text-align:center;color:var(--text-muted);padding:12px;font-size:12px;">
                        💙 Hallo! Ich bin <strong style="color:var(--text-primary);">HalDo</strong>, deine KI.<br>
                        Stelle mir eine Frage.
                    </div>
                </div>
                <div style="display:flex;gap:4px;padding:4px 8px;border-top:1px solid var(--glass-border);flex-wrap:wrap;">
                    <input id="ai-chat-input" class="haldo-input" placeholder="Nachricht..." style="flex:1;min-width:80px;font-size:12px;" onkeydown="if(event.key==='Enter')AppManager.sendAIMessage()">
                    <button onclick="AppManager.sendAIMessage()" class="haldo-btn" style="font-size:12px;padding:4px 12px;">📤</button>
                    <button onclick="AppManager.toggleVoiceInput()" class="haldo-btn haldo-btn-secondary" id="ai-voice-btn" style="font-size:14px;padding:4px 8px;">🎤</button>
                </div>
            </div>
        `;
        const win = this.createWindow(app.name, app.icon, content, 420, 380);
        document.getElementById('window-container').appendChild(win);
        this.updateTaskbar();
    },

    sendAIMessage() {
        const input = document.getElementById('ai-chat-input');
        const messages = document.getElementById('ai-chat-messages');
        if (!input || !messages || !input.value.trim()) return;

        const text = input.value.trim();
        input.value = '';

        const userMsg = document.createElement('div');
        userMsg.style.cssText =
            'text-align:right;margin:3px 0;padding:5px 10px;background:var(--primary);border-radius:6px;color:white;max-width:85%;margin-left:auto;font-size:11px;';
        userMsg.textContent = '🧑 ' + text;
        messages.appendChild(userMsg);

        const loading = document.createElement('div');
        loading.style.cssText =
            'text-align:left;margin:3px 0;padding:5px 10px;background:var(--glass-bg);border-radius:6px;color:var(--text-secondary);max-width:85%;font-size:11px;';
        loading.textContent = '💭 HalDo denkt...';
        messages.appendChild(loading);
        messages.scrollTop = messages.scrollHeight;

        if (typeof LivingAI !== 'undefined') {
            LivingAI.setEmotion('thinking');
        }

        AICore.simpleChat(text).then(reply => {
            loading.remove();
            const aiMsg = document.createElement('div');
            aiMsg.style.cssText =
                'text-align:left;margin:3px 0;padding:5px 10px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:6px;color:var(--text-primary);max-width:85%;font-size:11px;';
            aiMsg.textContent = '💙 ' + reply;
            messages.appendChild(aiMsg);
            messages.scrollTop = messages.scrollHeight;

            if (typeof LivingAI !== 'undefined') {
                LivingAI.speak(reply);
                LivingAI.setEmotion('happy');
            }

            if ('speechSynthesis' in window) {
                const utter = new SpeechSynthesisUtterance(reply);
                utter.lang = 'de-DE';
                window.speechSynthesis.speak(utter);
            }
        });
    },

    toggleVoiceInput() {
        const btn = document.getElementById('ai-voice-btn');
        if (!btn) return;
        if ('webkitSpeechRecognition' in window) {
            const rec = new webkitSpeechRecognition();
            rec.lang = 'de-DE';
            rec.onstart = () => { btn.textContent = '⏹️';
                btn.style.color = 'var(--success)'; };
            rec.onend = () => { btn.textContent = '🎤';
                btn.style.color = ''; };
            rec.onresult = (e) => {
                const text = e.results[0][0].transcript;
                const input = document.getElementById('ai-chat-input');
                if (input) { input.value = text;
                    AppManager.sendAIMessage(); }
            };
            rec.start();
        } else {
            alert('🎤 Speech Recognition nicht unterstützt.');
        }
    },

    // ===== KATEGORIEN =====
    openCategory(category) {
        const apps = this.apps.filter(a => a.category === category);
        if (apps.length === 0) { alert(`📱 Keine Apps in "${category}"`); return; }
        const content = `
            <div>
                <h2 style="color:var(--text-primary);font-size:13px;">📱 ${category.charAt(0).toUpperCase()+category.slice(1)}</h2>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:4px;margin-top:4px;">
                    ${apps.map(app => `
                        <div onclick="AppManager.openApp('${app.id}')" style="padding:6px;background:var(--glass-bg);border-radius:4px;text-align:center;border:1px solid var(--glass-border);cursor:pointer;font-size:9px;">
                            <div style="font-size:20px;">${app.icon}</div>
                            <div style="color:var(--text-secondary);">${app.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        const win = this.createWindow(category, '📱', content, 380, 320);
        document.getElementById('window-container').appendChild(win);
        this.updateTaskbar();
    },

    // ===== INSTALLATION =====
    installApp(appId) {
        if (this.installedApps.includes(appId)) return false;
        this.installedApps.push(appId);
        Storage.set('installed_apps', this.installedApps);
        this.renderDesktopIcons();
        return true;
    },

    installAll() {
        this.apps.forEach(a => {
            if (!this.installedApps.includes(a.id)) {
                this.installedApps.push(a.id);
            }
        });
        Storage.set('installed_apps', this.installedApps);
        this.renderDesktopIcons();
        alert(`✅ ${this.installedApps.length} Apps installiert!`);
    },

    renderDesktopIcons() {
        const container = document.getElementById('desktop-icons');
        if (!container) return;
        const apps = this.apps.filter(a => this.installedApps.includes(a.id));
        container.innerHTML = apps.slice(0, 20).map(app => `
            <div class="desktop-icon" onclick="AppManager.openApp('${app.id}')" title="${app.desc || app.name}">
                <div class="icon-img">${app.icon}</div>
                <div class="icon-label">${app.name}</div>
            </div>
        `).join('');
    },

    updateTaskbar() {
        const container = document.getElementById('taskbar-apps');
        if (!container) return;
        const windows = document.querySelectorAll('#window-container .window');
        container.innerHTML = '';
        windows.forEach(win => {
            const title = win.querySelector('.window-title span:last-child')?.textContent || 'App';
            const btn = document.createElement('button');
            btn.className = 'taskbar-app-btn';
            btn.textContent = title;
            btn.onclick = () => {
                win.classList.toggle('minimized');
                this.updateTaskbar();
            };
            container.appendChild(btn);
        });
    }
};
window.AppManager = AppManager;
