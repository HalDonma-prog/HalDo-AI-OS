/**
 * HALDO AI OS 24.6.0 – THEMES
 */
const Themes = {
    currentTheme: 'dark',
    themes: {
        dark: { name: 'Dark', icon: '🌙', colors: { bg: '#0a0a1a', text: '#ffffff', glass: 'rgba(255,255,255,0.05)',
                primary: '#6C3CE1' } },
        light: { name: 'Light', icon: '☀️', colors: { bg: '#f0f0f5', text: '#1a1a2e', glass: 'rgba(255,255,255,0.6)',
                primary: '#6C3CE1' } },
        cosmic: { name: 'Cosmic', icon: '🌌', colors: { bg: '#050510', text: '#ffffff',
                glass: 'rgba(108,60,225,0.15)', primary: '#8B5CF6' } }
    },

    init() {
        console.log('🎨 Themes initialisiert');
        const saved = Storage.get('theme', 'dark');
        if (this.themes[saved]) this.currentTheme = saved;
        this.applyTheme(this.currentTheme);
        document.getElementById('menu-theme')?.addEventListener('click', () => this.cycle());
        return this;
    },

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return false;
        this.currentTheme = themeName;
        document.documentElement.setAttribute('data-theme', themeName);
        const btn = document.getElementById('menu-theme');
        if (btn) { btn.textContent = theme.icon;
            btn.title = theme.name; }
        Storage.set('theme', themeName);
        EventBus.emit('theme:changed', { theme: themeName });
        console.log(`🎨 Theme gewechselt: ${theme.name}`);
        return true;
    },

    cycle() {
        const names = Object.keys(this.themes);
        const idx = names.indexOf(this.currentTheme);
        this.applyTheme(names[(idx + 1) % names.length]);
    },
    getCurrent() { return this.themes[this.currentTheme]; },
    getAll() { return this.themes; }
};
window.Themes = Themes;
