/**
 * HALDO AI OS 24.6.0 – SHORTCUTS
 */
const Shortcuts = {
    shortcuts: {},
    active: true,

    init() {
        console.log('⌨️ Shortcuts initialisiert');
        this.register('Cmd+K', 'AI öffnen', () => { AppManager.openApp('haldo-ai'); });
        this.register('Cmd+Shift+V', 'Stimme wechseln', () => {
            const voices = ['👩', '👨', '🧑', '👧', '👦'];
            const current = document.getElementById('menu-voice')?.textContent || '👩';
            const idx = voices.indexOf(current);
            document.getElementById('menu-voice').textContent = voices[(idx + 1) % voices.length];
            Storage.set('voice_gender', document.getElementById('menu-voice').textContent);
        });
        this.register('Cmd+Shift+L', 'Sprache wechseln', () => {
            const langs = ['DE', 'EN', 'KU', 'EZ', 'TR', 'AR', 'FR', 'ES', 'RU'];
            const current = document.getElementById('menu-lang')?.textContent || 'DE';
            const idx = langs.indexOf(current);
            document.getElementById('menu-lang').textContent = langs[(idx + 1) % langs.length];
            Storage.set('language', document.getElementById('menu-lang').textContent);
        });
        this.register('Escape', 'Fenster schließen', () => {
            const active = WindowManager.getActiveWindow();
            if (active) WindowManager.closeWindow(active);
        });
        this.register('Cmd+Q', 'Herunterfahren', () => { if (confirm('System herunterfahren?')) Kernel.shutdown(); });
        this.register('Cmd+R', 'Neustart', () => { if (confirm('System neu starten?')) Kernel.reboot(); });
        this.register('Cmd+F', 'Vollbild', () => {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
            else document.exitFullscreen?.();
        });

        document.addEventListener('keydown', (e) => {
            if (!this.active) return;
            let keyCombo = '';
            if (e.metaKey || e.ctrlKey) keyCombo += 'Cmd+';
            if (e.shiftKey) keyCombo += 'Shift+';
            if (e.altKey) keyCombo += 'Alt+';
            keyCombo += e.key;
            if (e.key === 'Escape') keyCombo = 'Escape';
            const shortcut = this.shortcuts[keyCombo];
            if (shortcut) { e.preventDefault();
                shortcut.action(); }
        });
        console.log(`✅ ${Object.keys(this.shortcuts).length} Shortcuts registriert`);
        return this;
    },

    register(key, description, action) {
        this.shortcuts[key] = { key, description, action };
        return this;
    },
    getAll() { return this.shortcuts; },
    enable() { this.active = true; return this; },
    disable() { this.active = false; return this; }
};
window.Shortcuts = Shortcuts;
