/**
 * HALDO AI OS 24.6 – THEMES
 * Dark, Light, Cosmic
 */

const Themes = {
    currentTheme: 'dark',
    themes: {
        dark: {
            name: 'Dark',
            icon: '🌙',
            colors: {
                bg: '#0a0a1a',
                text: '#ffffff',
                glass: 'rgba(255,255,255,0.05)',
                primary: '#6C3CE1'
            }
        },
        light: {
            name: 'Light',
            icon: '☀️',
            colors: {
                bg: '#f0f0f5',
                text: '#1a1a2e',
                glass: 'rgba(255,255,255,0.6)',
                primary: '#6C3CE1'
            }
        },
        cosmic: {
            name: 'Cosmic',
            icon: '🌌',
            colors: {
                bg: '#050510',
                text: '#ffffff',
                glass: 'rgba(108,60,225,0.15)',
                primary: '#8B5CF6'
            }
        }
    },

    init() {
        console.log('🎨 Themes initialisiert');

        const saved = Storage.get('theme', 'dark');
        if (this.themes[saved]) {
            this.currentTheme = saved;
        }

        this.applyTheme(this.currentTheme);

        // Theme-Wechsel-Button in Taskbar
        const themeBtn = document.getElementById('taskbar-theme');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.cycle());
        }

        return this;
    },

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return false;

        this.currentTheme = themeName;
        document.documentElement.setAttribute('data-theme', themeName);

        // Taskbar-Button aktualisieren
        const btn = document.getElementById('taskbar-theme');
        if (btn) {
            btn.textContent = theme.icon;
            btn.title = theme.name;
        }

        // Speichern
        Storage.set('theme', themeName);
        EventBus.emit('theme:changed', { theme: themeName });

        console.log(`🎨 Theme gewechselt: ${theme.name}`);
        return true;
    },

    getCurrent() {
        return this.themes[this.currentTheme];
    },

    cycle() {
        const names = Object.keys(this.themes);
        const idx = names.indexOf(this.currentTheme);
        const next = (idx + 1) % names.length;
        this.applyTheme(names[next]);
    },

    getTheme(name) {
        return this.themes[name] || null;
    },

    getAll() {
        return this.themes;
    },

    getColors() {
        return this.getCurrent().colors;
    },

    // In Settings anzeigen
    getThemesHTML() {
        let html = '<h3>🎨 Themes</h3>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;margin-top:12px;">';
        Object.entries(this.themes).forEach(([key, theme]) => {
            const isActive = key === this.currentTheme;
            html += `
                <div onclick="Themes.applyTheme('${key}')" style="
                    padding:16px;
                    text-align:center;
                    background:${isActive ? 'var(--primary)' : 'var(--glass-bg)'};
                    border:2px solid ${isActive ? 'var(--primary)' : 'var(--glass-border)'};
                    border-radius:12px;
                    cursor:pointer;
                    transition:all var(--transition-fast);
                ">
                    <div style="font-size:32px;">${theme.icon}</div>
                    <div style="margin-top:8px;font-weight:${isActive ? '700' : '400'};color:${isActive ? 'white' : 'var(--text-secondary)'};">${theme.name}</div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }
};

window.Themes = Themes;
