/**
 * HALDO AI OS 24.6 – SHORTCUTS
 * Tastaturkürzel für das gesamte System
 */

const Shortcuts = {
    shortcuts: {},
    active: true,

    init() {
        console.log('⌨️ Shortcuts initialisiert');

        this.register('Cmd+K', 'AI öffnen', () => {
            if (typeof AppManager !== 'undefined') {
                AppManager.openApp('haldo-ai');
            }
        });

        this.register('Cmd+Shift+V', 'Stimme wechseln', () => {
            if (typeof VoiceSystem !== 'undefined') {
                VoiceSystem.cycleProfile();
            }
        });

        this.register('Cmd+Shift+L', 'Sprache wechseln', () => {
            if (typeof LanguageSystem !== 'undefined') {
                LanguageSystem.cycleLanguage();
            }
        });

        this.register('Escape', 'Fenster schließen', () => {
            if (typeof WindowManager !== 'undefined') {
                const active = WindowManager.getActiveWindow();
                if (active) {
                    WindowManager.closeWindow(active);
                }
            }
        });

        this.register('Cmd+Q', 'System herunterfahren', () => {
            if (confirm('System herunterfahren?')) {
                if (typeof Kernel !== 'undefined') {
                    Kernel.shutdown();
                }
            }
        });

        this.register('Cmd+R', 'System neu starten', () => {
            if (confirm('System neu starten?')) {
                if (typeof Kernel !== 'undefined') {
                    Kernel.reboot();
                }
            }
        });

        this.register('Cmd+F', 'Vollbild', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.();
            } else {
                document.exitFullscreen?.();
            }
        });

        // Tastatur-Listener
        document.addEventListener('keydown', (e) => {
            if (!this.active) return;

            // Modifier-Tasten erkennen
            const ctrl = e.metaKey || e.ctrlKey;
            const shift = e.shiftKey;
            const alt = e.altKey;

            // Shortcut-Matching
            let keyCombo = '';
            if (ctrl) keyCombo += 'Cmd+';
            if (shift) keyCombo += 'Shift+';
            if (alt) keyCombo += 'Alt+';
            keyCombo += e.key;

            // Escape speziell
            if (e.key === 'Escape') keyCombo = 'Escape';

            const shortcut = this.shortcuts[keyCombo];
            if (shortcut) {
                e.preventDefault();
                shortcut.action();
            }
        });

        console.log(`✅ ${Object.keys(this.shortcuts).length} Shortcuts registriert`);
        return this;
    },

    register(key, description, action) {
        this.shortcuts[key] = { key, description, action };
        return this;
    },

    get(key) {
        return this.shortcuts[key] || null;
    },

    getAll() {
        return this.shortcuts;
    },

    getDescription(key) {
        const s = this.get(key);
        return s ? s.description : null;
    },

    enable() {
        this.active = true;
        return this;
    },

    disable() {
        this.active = false;
        return this;
    },

    toggle() {
        this.active = !this.active;
        return this;
    },

    // In Settings anzeigen
    getShortcutsHTML() {
        let html = '<h3>⌨️ Tastaturkürzel</h3>';
        html += '<table style="width:100%;border-collapse:collapse;">';
        html += '<tr><th style="text-align:left;padding:8px;border-bottom:1px solid var(--glass-border);">Kürzel</th><th style="text-align:left;padding:8px;border-bottom:1px solid var(--glass-border);">Aktion</th></tr>';
        Object.values(this.shortcuts).forEach(s => {
            html += `<tr><td style="padding:8px;border-bottom:1px solid var(--glass-border);font-weight:600;">${s.key}</td><td style="padding:8px;border-bottom:1px solid var(--glass-border);">${s.description}</td></tr>`;
        });
        html += '</table>';
        return html;
    }
};

window.Shortcuts = Shortcuts;
