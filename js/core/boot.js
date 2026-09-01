/**
 * HALDO AI OS 24.6 – BOOT CHAIN
 * Systemstart in der richtigen Reihenfolge
 */

const Boot = {
    status: 'idle',
    progress: 0,
    totalSteps: 10,
    currentStep: 0,
    steps: [],

    init() {
        this.statusElement = document.getElementById('boot-status');
        this.progressBar = document.getElementById('boot-progress-bar');
        this.setupSteps();
        return this;
    },

    setupSteps() {
        this.steps = [
            { id: 'kernel', label: 'Kernel wird geladen…', fn: this.loadKernel },
            { id: 'storage', label: 'Speicher wird initialisiert…', fn: this.loadStorage },
            { id: 'eventbus', label: 'Event-System wird gestartet…', fn: this.loadEventBus },
            { id: 'display', label: 'Display-System wird gestartet…', fn: this.loadDisplay },
            { id: 'cosmic', label: 'Cosmic World wird aufgebaut…', fn: this.loadCosmicWorld },
            { id: 'ai', label: 'AI Core wird aktiviert…', fn: this.loadAI },
            { id: 'voice', label: 'Voice-System wird gestartet…', fn: this.loadVoice },
            { id: 'language', label: 'Sprachsystem wird geladen…', fn: this.loadLanguage },
            { id: 'apps', label: 'Apps werden registriert…', fn: this.loadApps },
            { id: 'ready', label: 'System bereit! 🚀', fn: this.finishBoot }
        ];
    },

    async start() {
        if (this.status === 'booting') return;
        this.status = 'booting';
        this.progress = 0;
        this.currentStep = 0;

        console.log('🚀 HalDo AI OS 24.6 – Boot gestartet');

        const bootScreen = document.getElementById('boot-screen');
        bootScreen.classList.remove('hidden');

        try {
            for (const step of this.steps) {
                this.currentStep++;
                this.updateStatus(step.label);
                this.updateProgress((this.currentStep / this.totalSteps) * 100);

                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error(`Timeout: ${step.id}`)), 12000)
                );

                try {
                    await Promise.race([step.fn.call(this), timeout]);
                } catch (error) {
                    console.warn(`⚠️ Schritt ${step.id} fehlgeschlagen:`, error);
                }

                await this.sleep(120);
            }

            this.status = 'ready';
            this.hideBootScreen();

        } catch (error) {
            this.status = 'error';
            console.error('❌ Boot fehlgeschlagen:', error);
            this.updateStatus('❌ Fehler – bitte neu laden');
            this.showError(error);
        }
    },

    // ---- BOOT-SCHRITTE ----

    async loadKernel() {
        if (typeof Kernel !== 'undefined') Kernel.init();
        else {
            window.Kernel = { version: '24.6', init: () => console.log('✅ Kernel (Basis)') };
        }
        return true;
    },

    async loadStorage() {
        if (typeof Storage !== 'undefined') Storage.init();
        else {
            window.Storage = {
                get: (k) => localStorage.getItem('haldo_' + k),
                set: (k, v) => localStorage.setItem('haldo_' + k, v),
                init: () => console.log('✅ Storage (Basis)')
            };
        }
        return true;
    },

    async loadEventBus() {
        if (typeof EventBus !== 'undefined') {
            EventBus.setDebug(false);
        }
        return true;
    },

    async loadDisplay() {
        if (typeof WindowManager !== 'undefined') WindowManager.init();
        else {
            window.WindowManager = {
                init: () => console.log('✅ WindowManager (Basis)'),
                openWindow: (app) => console.log('📂 Fenster öffnen:', app)
            };
        }
        return true;
    },

    async loadCosmicWorld() {
        if (typeof CosmicWorld !== 'undefined') {
            await CosmicWorld.init();
        } else {
            window.CosmicWorld = {
                init: () => { console.log('🌌 Cosmic World (Basis)'); return Promise.resolve(true); }
            };
        }
        return true;
    },

    async loadAI() {
        if (typeof AICore !== 'undefined') {
            await AICore.init();
        } else {
            window.AICore = {
                init: () => { console.log('🧠 AI Core (Basis)'); return Promise.resolve(true); }
            };
        }
        return true;
    },

    async loadVoice() {
        if (typeof VoiceSystem !== 'undefined') {
            await VoiceSystem.init();
        } else {
            window.VoiceSystem = {
                init: () => { console.log('🎤 Voice System (Basis)'); return Promise.resolve(true); }
            };
        }
        return true;
    },

    async loadLanguage() {
        if (typeof LanguageSystem !== 'undefined') {
            await LanguageSystem.init();
        } else {
            window.LanguageSystem = {
                init: () => { console.log('🌍 Language System (Basis)'); return Promise.resolve(true); }
            };
        }
        return true;
    },

    async loadApps() {
        if (typeof AppManager !== 'undefined') {
            AppManager.registerAll();
        } else {
            window.AppManager = {
                registerAll: () => console.log('✅ Apps registriert (Basis)')
            };
        }
        return true;
    },

    async finishBoot() {
        console.log('✅ Boot abgeschlossen!');
        document.getElementById('desktop').style.display = 'block';
        document.querySelector('.floating-btn').style.display = 'flex';
        EventBus.emit('system:ready');
        return true;
    },

    // ---- UI ----

    updateStatus(text) {
        if (this.statusElement) this.statusElement.textContent = text;
    },

    updateProgress(value) {
        this.progress = Math.min(value, 100);
        if (this.progressBar) this.progressBar.style.width = this.progress + '%';
    },

    hideBootScreen() {
        const screen = document.getElementById('boot-screen');
        screen.classList.add('hidden');
        setTimeout(() => screen.style.display = 'none', 800);
    },

    showError(error) {
        const status = document.getElementById('boot-status');
        if (status) {
            status.textContent = '❌ ' + (error.message || 'Unbekannter Fehler');
            status.style.color = '#FF3B30';
        }
        const container = document.querySelector('.boot-container');
        const btn = document.createElement('button');
        btn.textContent = '🔄 Neu laden';
        Object.assign(btn.style, {
            marginTop: '16px',
            padding: '8px 24px',
            background: 'var(--primary)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'var(--font-primary)'
        });
        btn.onclick = () => location.reload();
        container.appendChild(btn);
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Automatisch starten
document.addEventListener('DOMContentLoaded', () => {
    Boot.init().start();
});
