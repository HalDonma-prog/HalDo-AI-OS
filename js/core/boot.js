/**
 * HALDO AI OS 24.6.0 – BOOT
 */
const Boot = {
    status: 'idle',
    progress: 0,
    statusEl: null,
    progressBar: null,
    starsContainer: null,

    init() {
        this.statusEl = document.getElementById('boot-status');
        this.progressBar = document.getElementById('boot-progress-bar');
        this.starsContainer = document.getElementById('boot-stars');
        this.createStars();
        return this;
    },

    createStars() {
        if (!this.starsContainer) return;
        const count = 60;
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 2.5 + 0.5;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const delay = Math.random() * 3;
            const duration = 2 + Math.random() * 3;
            star.style.cssText = `
                position:absolute;
                width:${size}px;
                height:${size}px;
                background:white;
                border-radius:50%;
                left:${x}%;
                top:${y}%;
                opacity:0;
                animation: starFade ${duration}s ease-in-out ${delay}s infinite;
                box-shadow: 0 0 ${size*2}px rgba(255,255,255,0.2);
            `;
            this.starsContainer.appendChild(star);
        }
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

    async start() {
        if (this.status === 'booting') return;
        this.status = 'booting';
        this.progress = 0;

        const steps = [
            { label: 'Initializing Cosmic Core...', fn: () => Kernel.init() },
            { label: 'Loading Storage...', fn: () => Storage.set('boot_test', true) },
            { label: 'Loading AI Engine...', fn: () => AICore.init() },
            { label: 'Loading Applications...', fn: () => AppManager.init() },
            { label: 'Loading Cosmic World...', fn: () => CosmicWorld.init() },
            { label: 'System Ready 🚀', fn: () => this.finish() }
        ];

        for (const step of steps) {
            this.updateStatus(step.label);
            this.updateProgress((steps.indexOf(step) + 1) / steps.length * 100);
            try { await step.fn(); } catch (e) { console.warn('⚠️ Schritt fehlgeschlagen:', e); }
            await this.sleep(150);
        }
        this.status = 'ready';
        this.hideBootScreen();
    },

    updateStatus(text) { if (this.statusEl) this.statusEl.textContent = text; },
    updateProgress(value) { this.progress = Math.min(value, 100); if (this.progressBar) this.progressBar.style.width = this.progress + '%'; },

    hideBootScreen() {
        const screen = document.getElementById('boot-screen');
        screen.classList.add('hidden');
        setTimeout(() => { screen.style.display = 'none'; }, 600);
        document.getElementById('desktop').style.display = 'block';
        document.querySelector('.floating-btn').style.display = 'flex';
        // Living AI Avatar anzeigen
        const avatarContainer = document.getElementById('living-ai-container');
        if (avatarContainer) {
            avatarContainer.style.display = 'block';
            setTimeout(() => {
                if (typeof LivingAI !== 'undefined') {
                    LivingAI.init('living-ai-container');
                }
            }, 500);
        }
        this.setupUI();
        EventBus.emit('system:ready');
    },

    setupUI() {
        // Top-Menu
        document.querySelectorAll('.menu-item[data-menu]').forEach(el => {
            el.addEventListener('click', function() {
                document.querySelectorAll('.menu-item[data-menu]').forEach(e => e.classList.remove('active'));
                this.classList.add('active');
                AppManager.openCategory(this.dataset.menu);
            });
        });

        // Theme
        document.getElementById('menu-theme')?.addEventListener('click', () => {
            const themes = ['dark', 'light', 'cosmic', 'aurora', 'midnight'];
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = themes[(themes.indexOf(current) + 1) % themes.length];
            document.documentElement.setAttribute('data-theme', next);
            const icons = { dark: '🌙', light: '☀️', cosmic: '🌌', aurora: '🌠', midnight: '🌃' };
            document.getElementById('menu-theme').textContent = icons[next] || '🌙';
            Storage.set('theme', next);
        });

        // Voice
        document.getElementById('menu-voice')?.addEventListener('click', () => {
            const voices = ['👩', '👨', '🧑', '👧', '👦'];
            const current = document.getElementById('menu-voice').textContent;
            const idx = voices.indexOf(current);
            const next = voices[(idx + 1) % voices.length];
            document.getElementById('menu-voice').textContent = next;
            Storage.set('voice_gender', next);
            EventBus.emit('voice:changed', { voice: next });
        });

        // Language
        document.getElementById('menu-lang')?.addEventListener('click', () => {
            const langs = ['DE', 'EN', 'KU', 'EZ', 'TR', 'AR', 'FR', 'ES', 'RU', 'FA', 'IT', 'PT'];
            const current = document.getElementById('menu-lang').textContent;
            const idx = langs.indexOf(current);
            const next = langs[(idx + 1) % langs.length];
            document.getElementById('menu-lang').textContent = next;
            Storage.set('language', next);
            EventBus.emit('language:changed', { lang: next });
        });

        // Status
        document.getElementById('menu-status')?.addEventListener('click', () => {
            AppManager.openApp('system-monitor');
        });

        // Taskbar
        document.getElementById('taskbar-logo')?.addEventListener('click', () => AppManager.openApp('app-center'));
        document.getElementById('tb-notifications')?.addEventListener('click', () => {
            const nots = Storage.get('notifications', []);
            if (nots.length === 0) alert('🔔 Keine neuen Benachrichtigungen');
            else alert('🔔 Benachrichtigungen:\n' + nots.map((n, i) => `${i+1}. ${n}`).join('\n'));
        });
        document.getElementById('tb-status')?.addEventListener('click', () => {
            alert(
                `✅ HalDo AI OS ${Kernel.version}\nUptime: ${Kernel.getUptime()}s\nApps: ${AppManager.installedApps.length}\nSpeicher: ${localStorage.length} Einträge`
            );
        });

        // AI Floating Button
        document.getElementById('ai-floating-btn')?.addEventListener('click', () => AppManager.openApp('haldo-ai'));

        // Clock
        updateClock();
        setInterval(updateClock, 1000);

        // Load saved settings
        const savedTheme = Storage.get('theme', 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeIcons = { dark: '🌙', light: '☀️', cosmic: '🌌', aurora: '🌠', midnight: '🌃' };
        document.getElementById('menu-theme').textContent = themeIcons[savedTheme] || '🌙';

        const savedVoice = Storage.get('voice_gender', '👩');
        document.getElementById('menu-voice').textContent = savedVoice;

        const savedLang = Storage.get('language', 'DE');
        document.getElementById('menu-lang').textContent = savedLang;
    },

    sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
};
window.Boot = Boot;
