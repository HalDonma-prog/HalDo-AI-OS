/**
 * HALDO AI OS 24.6.0 – BOOT SYSTEM
 * Professioneller Systemstart mit Sternen, Logo und Fortschritt
 * Version: 1.0.0
 */

const Boot = {
    // ---- STATUS ----
    status: 'idle', // idle | booting | ready | error
    progress: 0,
    currentStep: 0,
    totalSteps: 10,
    
    // ---- DOM-ELEMENTE ----
    bootScreen: null,
    statusEl: null,
    progressBar: null,
    starsContainer: null,
    logoImg: null,
    
    // ---- BOOT-SCHRITTE ----
    steps: [],
    
    // ---- INITIALISIERUNG ----
    init() {
        console.log('🚀 Boot System wird initialisiert...');
        
        this.bootScreen = document.getElementById('boot-screen');
        this.statusEl = document.getElementById('boot-status');
        this.progressBar = document.getElementById('boot-progress-bar');
        this.starsContainer = document.getElementById('boot-stars');
        this.logoImg = document.getElementById('boot-logo-img');
        
        this.createStars();
        this.setupSteps();
        
        console.log('✅ Boot System ready');
        return this;
    },
    
    // ---- STERNE ERSTELLEN ----
    createStars() {
        if (!this.starsContainer) return;
        
        const count = 80;
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 3 + 0.5;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const delay = Math.random() * 3;
            const duration = 2 + Math.random() * 3;
            
            star.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: white;
                border-radius: 50%;
                left: ${x}%;
                top: ${y}%;
                opacity: 0;
                animation: starFade ${duration}s ease-in-out ${delay}s infinite;
                box-shadow: 0 0 ${size * 2}px rgba(255,255,255,0.3);
            `;
            this.starsContainer.appendChild(star);
        }
        
        // Keyframes für Sterne
        if (!document.getElementById('star-keyframes')) {
            const style = document.createElement('style');
            style.id = 'star-keyframes';
            style.textContent = `
                @keyframes starFade {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    50% { opacity: 1; transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    // ---- BOOT-SCHRITTE DEFINIEREN ----
    setupSteps() {
        this.steps = [
            { 
                id: 'kernel', 
                label: 'Initializing Kernel...', 
                fn: () => this.loadKernel(),
                icon: '🔧'
            },
            { 
                id: 'storage', 
                label: 'Loading Storage...', 
                fn: () => this.loadStorage(),
                icon: '💾'
            },
            { 
                id: 'eventbus', 
                label: 'Starting Event System...', 
                fn: () => this.loadEventBus(),
                icon: '📡'
            },
            { 
                id: 'display', 
                label: 'Initializing Display...', 
                fn: () => this.loadDisplay(),
                icon: '🖥️'
            },
            { 
                id: 'cosmic', 
                label: 'Building Cosmic World...', 
                fn: () => this.loadCosmicWorld(),
                icon: '🌌'
            },
            { 
                id: 'ai', 
                label: 'Loading AI Engine...', 
                fn: () => this.loadAI(),
                icon: '🧠'
            },
            { 
                id: 'voice', 
                label: 'Starting Voice System...', 
                fn: () => this.loadVoice(),
                icon: '🎤'
            },
            { 
                id: 'language', 
                label: 'Loading Languages...', 
                fn: () => this.loadLanguage(),
                icon: '🌍'
            },
            { 
                id: 'apps', 
                label: 'Registering Applications...', 
                fn: () => this.loadApps(),
                icon: '📱'
            },
            { 
                id: 'ready', 
                label: 'System Ready 🚀', 
                fn: () => this.finish(),
                icon: '✅'
            }
        ];
    },
    
    // ---- BOOT STARTEN ----
    async start() {
        if (this.status === 'booting') {
            console.warn('⚠️ Boot läuft bereits');
            return;
        }
        
        this.status = 'booting';
        this.progress = 0;
        this.currentStep = 0;
        
        console.log('🚀 HalDo AI OS Boot gestartet');
        this.updateStatus('Initializing Cosmic Core...');
        
        // Boot-Screen einblenden
        this.bootScreen.classList.remove('hidden');
        this.bootScreen.style.display = 'flex';
        
        try {
            for (const step of this.steps) {
                this.currentStep++;
                this.updateStatus(step.label);
                this.updateProgress((this.currentStep / this.totalSteps) * 100);
                
                // Timeout-Fallback
                const timeout = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`Timeout: ${step.id}`)), 10000)
                );
                
                try {
                    await Promise.race([
                        step.fn.call(this),
                        timeout
                    ]);
                } catch (error) {
                    console.warn(`⚠️ Schritt ${step.id} fehlgeschlagen:`, error);
                    // Trotzdem weiter – kein Abbruch
                    this.updateStatus(`⚠️ ${step.id} übersprungen`);
                    await this.sleep(500);
                }
                
                // Kurze Pause für UI-Update
                await this.sleep(100);
            }
            
            this.status = 'ready';
            this.hideBootScreen();
            
        } catch (error) {
            this.status = 'error';
            console.error('❌ Boot fehlgeschlagen:', error);
            this.showError(error);
        }
    },
    
    // ---- BOOT-SCHRITTE ----
    
    async loadKernel() {
        console.log('🔧 Kernel wird geladen...');
        if (typeof Kernel !== 'undefined') {
            Kernel.init();
            return true;
        }
        // Fallback-Kernel
        window.Kernel = {
            version: '24.6.0',
            name: 'HalDo AI OS',
            state: { initialized: true, uptime: 0 },
            init: () => console.log('✅ Kernel (Basis)'),
            getUptime: () => 0,
            reboot: () => location.reload(),
            shutdown: () => { if (window.close) window.close(); }
        };
        Kernel.init();
        return true;
    },
    
    async loadStorage() {
        console.log('💾 Storage wird geladen...');
        if (typeof Storage !== 'undefined') {
            Storage.init();
            return true;
        }
        // Fallback-Storage
        window.Storage = {
            prefix: 'haldo_',
            get: (key, fallback) => {
                try {
                    const data = localStorage.getItem(this.prefix + key);
                    return data ? JSON.parse(data) : fallback;
                } catch { return fallback; }
            },
            set: (key, value) => {
                try {
                    localStorage.setItem(this.prefix + key, JSON.stringify(value));
                    return true;
                } catch { return false; }
            },
            init: () => console.log('✅ Storage (Basis)')
        };
        Storage.init();
        return true;
    },
    
    async loadEventBus() {
        console.log('📡 Event-System wird gestartet...');
        if (typeof EventBus !== 'undefined') {
            EventBus.setDebug(false);
            EventBus.emit('boot:step', { step: 'eventbus' });
            return true;
        }
        return true;
    },
    
    async loadDisplay() {
        console.log('🖥️ Display-System wird gestartet...');
        if (typeof WindowManager !== 'undefined') {
            WindowManager.init();
            return true;
        }
        // Fallback
        window.WindowManager = {
            init: () => console.log('✅ WindowManager (Basis)'),
            openWindow: (app) => console.log('📂 Fenster öffnen:', app),
            windows: []
        };
        WindowManager.init();
        return true;
    },
    
    async loadCosmicWorld() {
        console.log('🌌 Cosmic World wird aufgebaut...');
        if (typeof CosmicWorld !== 'undefined') {
            await CosmicWorld.init();
            return true;
        }
        window.CosmicWorld = {
            init: () => {
                console.log('🌌 Cosmic World (Basis)');
                return Promise.resolve(true);
            },
            isReady: false
        };
        return true;
    },
    
    async loadAI() {
        console.log('🧠 AI Engine wird geladen...');
        if (typeof AICore !== 'undefined') {
            AICore.init();
            return true;
        }
        window.AICore = {
            init: () => console.log('🧠 AI Core (Basis)'),
            isReady: false,
            chat: async (messages) => '🧠 AI ist noch nicht konfiguriert.'
        };
        return true;
    },
    
    async loadVoice() {
        console.log('🎤 Voice-System wird gestartet...');
        if (typeof VoiceSystem !== 'undefined') {
            VoiceSystem.init();
            return true;
        }
        window.VoiceSystem = {
            init: () => console.log('🎤 Voice System (Basis)'),
            speak: (text) => console.log('🔊 Sprechen:', text)
        };
        return true;
    },
    
    async loadLanguage() {
        console.log('🌍 Sprachsystem wird geladen...');
        if (typeof LanguageSystem !== 'undefined') {
            LanguageSystem.init();
            return true;
        }
        window.LanguageSystem = {
            init: () => console.log('🌍 Language System (Basis)'),
            currentLanguage: 'de',
            t: (key) => key
        };
        return true;
    },
    
    async loadApps() {
        console.log('📱 Apps werden registriert...');
        if (typeof AppManager !== 'undefined') {
            AppManager.init();
            return true;
        }
        window.AppManager = {
            init: () => console.log('✅ AppManager (Basis)'),
            apps: [],
            installedApps: [],
            openApp: (id) => alert(`📱 App ${id} wird geöffnet...`),
            renderDesktopIcons: () => console.log('✅ Icons gerendert')
        };
        AppManager.init();
        return true;
    },
    
    async finish() {
        console.log('✅ Boot abgeschlossen!');
        
        // Desktop einblenden
        const desktop = document.getElementById('desktop');
        if (desktop) {
            desktop.style.display = 'block';
        }
        
        // AI Floating Button
        const floatingBtn = document.querySelector('.floating-btn');
        if (floatingBtn) {
            floatingBtn.style.display = 'flex';
        }
        
        // Event auslösen
        EventBus.emit('system:ready');
        
        // UI initialisieren
        this.setupUI();
        
        return true;
    },
    
    // ---- UI-SETUP ----
    setupUI() {
        // Top-Menu Events
        document.querySelectorAll('.menu-item[data-menu]').forEach(el => {
            el.addEventListener('click', function() {
                document.querySelectorAll('.menu-item[data-menu]').forEach(e => e.classList.remove('active'));
                this.classList.add('active');
                if (typeof AppManager !== 'undefined') {
                    AppManager.openCategory(this.dataset.menu);
                }
            });
        });
        
        // Theme toggle
        document.getElementById('menu-theme')?.addEventListener('click', () => {
            const themes = ['dark', 'light', 'cosmic', 'aurora', 'midnight'];
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = themes[(themes.indexOf(current) + 1) % themes.length];
            document.documentElement.setAttribute('data-theme', next);
            const icons = { dark: '🌙', light: '☀️', cosmic: '🌌', aurora: '🌠', midnight: '🌃' };
            document.getElementById('menu-theme').textContent = icons[next] || '🌙';
            Storage.set('theme', next);
        });
        
        // Voice toggle
        document.getElementById('menu-voice')?.addEventListener('click', () => {
            const voices = ['👩', '👨', '🧑', '👧', '👦'];
            const current = document.getElementById('menu-voice').textContent;
            const idx = voices.indexOf(current);
            const next = voices[(idx + 1) % voices.length];
            document.getElementById('menu-voice').textContent = next;
            Storage.set('voice_gender', next);
            EventBus.emit('voice:changed', { voice: next });
        });
        
        // Language toggle
        document.getElementById('menu-lang')?.addEventListener('click', () => {
            const langs = ['DE', 'EN', 'KU', 'EZ', 'TR', 'AR', 'FR', 'ES', 'RU'];
            const current = document.getElementById('menu-lang').textContent;
            const idx = langs.indexOf(current);
            const next = langs[(idx + 1) % langs.length];
            document.getElementById('menu-lang').textContent = next;
            Storage.set('language', next);
            EventBus.emit('language:changed', { lang: next });
        });
        
        // Status
        document.getElementById('menu-status')?.addEventListener('click', () => {
            if (typeof AppManager !== 'undefined') {
                AppManager.openApp('system-monitor');
            }
        });
        
        // Taskbar
        document.getElementById('taskbar-logo')?.addEventListener('click', () => {
            if (typeof AppManager !== 'undefined') {
                AppManager.openApp('app-center');
            }
        });
        
        document.getElementById('tb-notifications')?.addEventListener('click', () => {
            const nots = Storage.get('notifications', []);
            if (nots.length === 0) {
                alert('🔔 Keine neuen Benachrichtigungen');
            } else {
                alert('🔔 Benachrichtigungen:\n' + nots.map((n, i) => `${i+1}. ${n}`).join('\n'));
            }
        });
        
        document.getElementById('tb-status')?.addEventListener('click', () => {
            const info = Kernel.getStatus ? Kernel.getStatus() : { version: Kernel.version };
            alert(
                `✅ HalDo AI OS ${Kernel.version}\n` +
                `Uptime: ${Kernel.getFormattedUptime ? Kernel.getFormattedUptime() : '0s'}\n` +
                `Apps: ${AppManager?.installedApps?.length || 0}\n` +
                `Speicher: ${localStorage.length} Einträge`
            );
        });
        
        // AI Floating Button
        document.getElementById('ai-floating-btn')?.addEventListener('click', () => {
            if (typeof AppManager !== 'undefined') {
                AppManager.openApp('haldo-ai');
            }
        });
        
        // Uhr starten
        this.startClock();
        
        // Gespeicherte Einstellungen laden
        this.loadSavedSettings();
    },
    
    // ---- UHR ----
    startClock() {
        function updateClock() {
            const el = document.getElementById('taskbar-time');
            if (el) {
                const now = new Date();
                el.textContent = now.toLocaleTimeString('de', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                });
            }
        }
        updateClock();
        setInterval(updateClock, 1000);
    },
    
    // ---- GESPEICHERTE EINSTELLUNGEN ----
    loadSavedSettings() {
        const savedTheme = Storage.get('theme', 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeIcons = { dark: '🌙', light: '☀️', cosmic: '🌌', aurora: '🌠', midnight: '🌃' };
        document.getElementById('menu-theme').textContent = themeIcons[savedTheme] || '🌙';
        
        const savedVoice = Storage.get('voice_gender', '👩');
        document.getElementById('menu-voice').textContent = savedVoice;
        
        const savedLang = Storage.get('language', 'DE');
        document.getElementById('menu-lang').textContent = savedLang;
    },
    
    // ---- UI-HELPER ----
    updateStatus(text) {
        if (this.statusEl) {
            this.statusEl.textContent = text;
        }
    },
    
    updateProgress(value) {
        this.progress = Math.min(value, 100);
        if (this.progressBar) {
            this.progressBar.style.width = this.progress + '%';
        }
    },
    
    hideBootScreen() {
        if (this.bootScreen) {
            this.bootScreen.classList.add('hidden');
            setTimeout(() => {
                this.bootScreen.style.display = 'none';
            }, 800);
        }
    },
    
    showError(error) {
        if (this.statusEl) {
            this.statusEl.textContent = '❌ ' + (error.message || 'Unbekannter Fehler');
            this.statusEl.style.color = '#FF3B30';
        }
        
        // Reload-Button
        const container = document.querySelector('.boot-container');
        if (container && !container.querySelector('.boot-error-btn')) {
            const btn = document.createElement('button');
            btn.className = 'boot-error-btn';
            btn.textContent = '🔄 Neu laden';
            btn.style.cssText = `
                margin-top: 16px;
                padding: 8px 24px;
                background: var(--primary);
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 14px;
                cursor: pointer;
                font-family: var(--font-primary);
            `;
            btn.onclick = () => location.reload();
            container.appendChild(btn);
        }
    },
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // ---- VERSIONSPRÜFUNG ----
    getVersion() {
        return {
            version: Kernel.version || '24.6.0',
            build: Kernel.build || '2024.06.01',
            status: this.status
        };
    }
};

// Boot global verfügbar machen
window.Boot = Boot;

console.log('🚀 Boot System geladen – HalDo AI OS 24.6.0');
