/**
 * HALDO AI OS 24.6 – LANGUAGE SYSTEM
 * 12 Sprachen | Übersetzungen | Keyboard
 */

const LanguageSystem = {
    currentLanguage: 'de',
    availableLanguages: {
        de: { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
        en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
        ku: { code: 'ku', name: 'Kurmancî', nativeName: 'Kurmancî', flag: '🏴', dir: 'ltr' },
        ez: { code: 'ez', name: 'Êzîdî', nativeName: 'Êzîdî', flag: '🏴', dir: 'ltr' },
        tr: { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
        ar: { code: 'ar', name: 'العربية', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
        fr: { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
        es: { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
        ru: { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
        fa: { code: 'fa', name: 'فارسی', nativeName: 'فارسی', flag: '🇮🇷', dir: 'rtl' },
        it: { code: 'it', name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
        pt: { code: 'pt', name: 'Português', nativeName: 'Português', flag: '🇵🇹', dir: 'ltr' }
    },

    translations: {
        de: {
            'system.boot': 'System wird gestartet...',
            'system.ready': 'System bereit',
            'app.ai': 'KI-Assistent',
            'app.chat': 'Chat',
            'app.calendar': 'Kalender',
            'app.contacts': 'Kontakte',
            'app.files': 'Dateien',
            'app.settings': 'Einstellungen',
            'app.weather': 'Wetter',
            'app.music': 'Musik',
            'app.video': 'Video',
            'app.camera': 'Kamera',
            'app.notes': 'Notizen',
            'app.email': 'E-Mail',
            'app.browser': 'Browser',
            'app.maps': 'Karten',
            'ui.close': 'Schließen',
            'ui.minimize': 'Minimieren',
            'ui.maximize': 'Maximieren',
            'ui.ok': 'OK',
            'ui.cancel': 'Abbrechen',
            'ui.save': 'Speichern',
            'ui.delete': 'Löschen',
            'voice.listening': 'Höre zu...',
            'voice.speaking': 'Spreche...',
            'voice.thinking': 'Denke...'
        },
        en: {
            'system.boot': 'System is starting...',
            'system.ready': 'System ready',
            'app.ai': 'AI Assistant',
            'app.chat': 'Chat',
            'app.calendar': 'Calendar',
            'app.contacts': 'Contacts',
            'app.files': 'Files',
            'app.settings': 'Settings',
            'app.weather': 'Weather',
            'app.music': 'Music',
            'app.video': 'Video',
            'app.camera': 'Camera',
            'app.notes': 'Notes',
            'app.email': 'Email',
            'app.browser': 'Browser',
            'app.maps': 'Maps',
            'ui.close': 'Close',
            'ui.minimize': 'Minimize',
            'ui.maximize': 'Maximize',
            'ui.ok': 'OK',
            'ui.cancel': 'Cancel',
            'ui.save': 'Save',
            'ui.delete': 'Delete',
            'voice.listening': 'Listening...',
            'voice.speaking': 'Speaking...',
            'voice.thinking': 'Thinking...'
        }
        // Weitere Sprachen werden ergänzt
    },

    init() {
        console.log('🌍 Language System wird initialisiert...');

        const saved = Storage.get('language', 'de');
        if (this.availableLanguages[saved]) {
            this.currentLanguage = saved;
        }

        this.updateUI();

        document.addEventListener('keydown', (e) => {
            if (e.key === 'l' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
                e.preventDefault();
                this.cycleLanguage();
            }
        });

        console.log(`✅ Language System ready – ${this.currentLanguage}`);
        return this;
    },

    setLanguage(code) {
        if (!this.availableLanguages[code]) return false;
        this.currentLanguage = code;
        Storage.set('language', code);
        this.updateUI();
        EventBus.emit('language:changed', { language: code });
        return true;
    },

    cycleLanguage() {
        const codes = Object.keys(this.availableLanguages);
        const idx = codes.indexOf(this.currentLanguage);
        const next = (idx + 1) % codes.length;
        this.setLanguage(codes[next]);
    },

    getCurrent() {
        return this.availableLanguages[this.currentLanguage];
    },

    t(key, params = {}) {
        const lang = this.currentLanguage;
        let text = this.translations[lang]?.[key] ||
            this.translations['en']?.[key] ||
            key;
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(`{${k}}`, v);
        }
        return text;
    },

    updateUI() {
        const lang = this.getCurrent();
        const el = document.getElementById('taskbar-language');
        if (el) {
            el.textContent = lang.code.toUpperCase();
            el.title = lang.nativeName;
        }
        document.documentElement.lang = lang.code;
        document.documentElement.dir = lang.dir;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = this.t(el.dataset.i18n);
        });
    },

    getKeyboardLayout() {
        return this.getCurrent().code;
    }
};

window.LanguageSystem = LanguageSystem;
