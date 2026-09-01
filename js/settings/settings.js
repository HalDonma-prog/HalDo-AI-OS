/**
 * HALDO AI OS 24.6 – SETTINGS
 * Zentrale Einstellungen
 */

const Settings = {
    categories: {},

    init() {
        console.log('⚙️ Settings initialisiert');
        this.registerCategories();
        return this;
    },

    registerCategories() {
        this.categories = {
            display: {
                name: '🖥️ Display & Auflösung',
                settings: [
                    { id: 'resolution', label: 'Auflösung', type: 'select', options: [
                            { label: 'HD (1280x720)', value: '1280x720' },
                            { label: 'Full HD (1920x1080)', value: '1920x1080' },
                            { label: '2K (2560x1440)', value: '2560x1440' },
                            { label: '4K (3840x2160)', value: '3840x2160' },
                            { label: '8K (7680x4320)', value: '7680x4320' }
                        ], default: '1920x1080' },
                    { id: 'quality', label: 'Cosmic World Qualität', type: 'select', options: [
                            { label: 'Niedrig', value: 'low' },
                            { label: 'Mittel', value: 'medium' },
                            { label: 'Hoch', value: 'high' },
                            { label: 'Ultra (4K)', value: 'ultra' },
                            { label: 'Cinematic (8K)', value: 'cinematic' }
                        ], default: 'ultra' },
                    { id: 'hdr', label: 'HDR', type: 'toggle', default: false },
                    { id: 'fps', label: 'FPS-Limit', type: 'select', options: [
                            { label: '30 FPS', value: 30 },
                            { label: '60 FPS', value: 60 },
                            { label: '120 FPS', value: 120 },
                            { label: 'Unlimited', value: 'unlimited' }
                        ], default: 60 }
                ]
            },
            language: {
                name: '🌍 Sprache & Voice',
                settings: [
                    { id: 'system_language', label: 'Systemsprache', type: 'select', options: [
                            { label: '🇩🇪 Deutsch', value: 'de' },
                            { label: '🇬🇧 English', value: 'en' },
                            { label: '🏴 Kurmancî', value: 'ku' },
                            { label: '🏴 Êzîdî', value: 'ez' },
                            { label: '🇹🇷 Türkçe', value: 'tr' },
                            { label: '🇸🇦 العربية', value: 'ar' },
                            { label: '🇫🇷 Français', value: 'fr' },
                            { label: '🇪🇸 Español', value: 'es' },
                            { label: '🇷🇺 Русский', value: 'ru' },
                            { label: '🇮🇷 فارسی', value: 'fa' },
                            { label: '🇮🇹 Italiano', value: 'it' },
                            { label: '🇵🇹 Português', value: 'pt' }
                        ], default: 'de' },
                    { id: 'voice_profiles', label: 'Voice-Profile', type: 'multi', options: [
                            { label: '🇩🇪 Deutsch – Mann', value: 'de-male' },
                            { label: '🇩🇪 Deutsch – Frau', value: 'de-female' },
                            { label: '🇬🇧 English – Male', value: 'en-male' },
                            { label: '🇬🇧 English – Female', value: 'en-female' },
                            { label: '🏴 Kurmancî – Mêr', value: 'ku-male' },
                            { label: '🏴 Kurmancî – Jin', value: 'ku-female' },
                            { label: '🇹🇷 Türkçe – Erkek', value: 'tr-male' },
                            { label: '🇹🇷 Türkçe – Kadın', value: 'tr-female' },
                            { label: '🇸🇦 العربية – رجل', value: 'ar-male' },
                            { label: '🇸🇦 العربية – امرأة', value: 'ar-female' },
                            { label: '🇫🇷 Français – Homme', value: 'fr-male' },
                            { label: '🇫🇷 Français – Femme', value: 'fr-female' },
                            { label: '🇪🇸 Español – Hombre', value: 'es-male' },
                            { label: '🇪🇸 Español – Mujer', value: 'es-female' },
                            { label: '🇷🇺 Русский – Мужчина', value: 'ru-male' },
                            { label: '🇷🇺 Русский – Женщина', value: 'ru-female' },
                            { label: '🇮🇷 فارسی – مرد', value: 'fa-male' },
                            { label: '🇮🇷 فارسی – زن', value: 'fa-female' },
                            { label: '🇮🇹 Italiano – Uomo', value: 'it-male' },
                            { label: '🇮🇹 Italiano – Donna', value: 'it-female' },
                            { label: '🇵🇹 Português – Homem', value: 'pt-male' },
                            { label: '🇵🇹 Português – Mulher', value: 'pt-female' }
                        ], default: ['de-female', 'en-male'] }
                ]
            },
            ai: {
                name: '🧠 AI & Memory',
                settings: [
                    { id: 'groq_api_key', label: 'Groq API Key', type: 'password', default: '' },
                    { id: 'ai_model', label: 'KI-Modell', type: 'select', options: [
                            { label: 'Mixtral 8x7B', value: 'mixtral-8x7b-32768' },
                            { label: 'Llama 3 70B', value: 'llama3-70b-8192' },
                            { label: 'Gemma 7B', value: 'gemma-7b-it' }
                        ], default: 'mixtral-8x7b-32768' },
                    { id: 'ai_temperature', label: 'Kreativität (Temperatur)', type: 'range', min: 0, max: 2, step: 0.1,
                        default: 0.7 },
                    { id: 'ai_memory', label: 'Memory aktivieren', type: 'toggle', default: true }
                ]
            },
            themes: {
                name: '🎨 Themes & Design',
                settings: [
                    { id: 'theme', label: 'Theme', type: 'select', options: [
                            { label: '🌙 Dark', value: 'dark' },
                            { label: '☀️ Light', value: 'light' },
                            { label: '🌌 Cosmic', value: 'cosmic' }
                        ], default: 'dark' },
                    { id: 'glass_intensity', label: 'Glass-Intensität', type: 'range', min: 0, max: 100,
                        default: 50 }
                ]
            },
            security: {
                name: '🔒 Sicherheit & Privacy',
                settings: [
                    { id: 'pin', label: 'PIN-Code', type: 'password', default: '' },
                    { id: 'privacy_mode', label: 'Privacy-Modus', type: 'toggle', default: false },
                    { id: 'clear_cache', label: 'Cache leeren', type: 'button', action: () => {
                            Storage.clear();
                            alert('Cache geleert!');
                        } }
                ]
            },
            system: {
                name: '📊 System & Updates',
                settings: [
                    { id: 'auto_update', label: 'Automatische Updates', type: 'toggle', default: true },
                    { id: 'system_logs', label: 'System-Logs aktivieren', type: 'toggle', default: true },
                    { id: 'backup_interval', label: 'Backup-Intervall (Tage)', type: 'number', min: 1, max: 30,
                        default: 7 }
                ]
            }
        };
    },

    get(category, id) {
        const cat = this.categories[category];
        if (!cat) return null;
        const setting = cat.settings.find(s => s.id === id);
        if (!setting) return null;
        return Storage.get(`setting_${id}`, setting.default);
    },

    set(category, id, value) {
        Storage.set(`setting_${id}`, value);
        EventBus.emit('settings:changed', { category, id, value });

        // Spezielle Einstellungen anwenden
        this.applySetting(id, value);

        return this;
    },

    applySetting(id, value) {
        switch (id) {
            case 'theme':
                document.documentElement.setAttribute('data-theme', value);
                break;
            case 'system_language':
                if (typeof LanguageSystem !== 'undefined') {
                    LanguageSystem.setLanguage(value);
                }
                break;
            case 'resolution':
                if (typeof CosmicWorld !== 'undefined') {
                    CosmicWorld.resolution = value;
                    CosmicWorld.applyResolution();
                }
                break;
            case 'quality':
                if (typeof CosmicWorld !== 'undefined') {
                    CosmicWorld.setQuality(value);
                }
                break;
            case 'groq_api_key':
                if (typeof AICore !== 'undefined') {
                    AICore.setApiKey(value);
                }
                break;
            case 'voice_profiles':
                if (typeof VoiceSystem !== 'undefined') {
                    const profiles = Array.isArray(value) ? value : [value];
                    VoiceSystem.activeProfiles = profiles.map(id => VoiceSystem.availableProfiles[id]).filter(Boolean);
                    VoiceSystem.saveProfiles();
                    VoiceSystem.updateUI();
                }
                break;
        }
    },

    applyAll() {
        // Alle gespeicherten Einstellungen anwenden
        Object.keys(this.categories).forEach(cat => {
            this.categories[cat].settings.forEach(setting => {
                const value = Storage.get(`setting_${setting.id}`, setting.default);
                this.applySetting(setting.id, value);
            });
        });
    },

    openCategory(category) {
        const cat = this.categories[category];
        if (!cat) return;

        // Settings App öffnen
        if (typeof AppManager !== 'undefined') {
            AppManager.openApp('settings', {
                width: 700,
                height: 600,
                category: category
            });
        }
    },

    getCategory(name) {
        return this.categories[name] || null;
    },

    getAllCategories() {
        return Object.keys(this.categories);
    },

    getSettingsHTML(category) {
        const cat = this.categories[category];
        if (!cat) return '<p>Kategorie nicht gefunden</p>';

        let html = `<h2>${cat.name}</h2>`;
        cat.settings.forEach(setting => {
            const value = Storage.get(`setting_${setting.id}`, setting.default);
            html += this.renderSetting(setting, value);
        });
        return html;
    },

    renderSetting(setting, value) {
        switch (setting.type) {
            case 'select':
                return `
                    <div style="margin:12px 0;">
                        <label style="display:block;margin-bottom:4px;color:var(--text-secondary);">${setting.label}</label>
                        <select id="setting-${setting.id}" onchange="Settings.set('${setting.category || 'system'}', '${setting.id}', this.value)" style="
                            width:100%;
                            padding:8px 12px;
                            background:var(--glass-bg);
                            border:1px solid var(--glass-border);
                            border-radius:8px;
                            color:var(--text-primary);
                            font-family:var(--font-primary);
                            outline:none;
                        ">
                            ${setting.options.map(opt => `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                        </select>
                    </div>
                `;
            case 'toggle':
                return `
                    <div style="margin:12px 0;display:flex;justify-content:space-between;align-items:center;">
                        <label style="color:var(--text-secondary);">${setting.label}</label>
                        <button onclick="Settings.toggle('${setting.id}')" style="
                            width:48px;
                            height:28px;
                            background:${value ? 'var(--primary)' : 'var(--glass-bg)'};
                            border:1px solid var(--glass-border);
                            border-radius:14px;
                            cursor:pointer;
                            position:relative;
                            transition:all var(--transition-fast);
                        ">
                            <span style="
                                position:absolute;
                                top:2px;
                                left:${value ? '22px' : '2px'};
                                width:22px;
                                height:22px;
                                background:white;
                                border-radius:50%;
                                transition:all var(--transition-fast);
                            "></span>
                        </button>
                    </div>
                `;
            case 'range':
                return `
                    <div style="margin:12px 0;">
                        <label style="display:block;margin-bottom:4px;color:var(--text-secondary);">${setting.label} (${value})</label>
                        <input type="range" id="setting-${setting.id}" min="${setting.min}" max="${setting.max}" step="${setting.step || 1}" value="${value}" 
                            oninput="Settings.set('${setting.category || 'system'}', '${setting.id}', parseFloat(this.value)); this.previousElementSibling.textContent = this.value;"
                            style="width:100%;accent-color:var(--primary);">
                    </div>
                `;
            case 'password':
                return `
                    <div style="margin:12px 0;">
                        <label style="display:block;margin-bottom:4px;color:var(--text-secondary);">${setting.label}</label>
                        <input type="password" id="setting-${setting.id}" value="${value || ''}" 
                            onchange="Settings.set('${setting.category || 'system'}', '${setting.id}', this.value)"
                            style="width:100%;padding:8px 12px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:8px;color:var(--text-primary);font-family:var(--font-primary);outline:none;">
                    </div>
                `;
            case 'number':
                return `
                    <div style="margin:12px 0;">
                        <label style="display:block;margin-bottom:4px;color:var(--text-secondary);">${setting.label}</label>
                        <input type="number" id="setting-${setting.id}" value="${value}" min="${setting.min}" max="${setting.max}"
                            onchange="Settings.set('${setting.category || 'system'}', '${setting.id}', parseInt(this.value))"
                            style="width:100%;padding:8px 12px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:8px;color:var(--text-primary);font-family:var(--font-primary);outline:none;">
                    </div>
                `;
            case 'button':
                return `
                    <div style="margin:12px 0;">
                        <button onclick="Settings.getSetting('${setting.id}')" style="
                            padding:8px 20px;
                            background:var(--primary);
                            border:none;
                            border-radius:8px;
                            color:white;
                            cursor:pointer;
                            font-family:var(--font-primary);
                        ">${setting.label}</button>
                    </div>
                `;
            default:
                return '';
        }
    },

    toggle(id) {
        const value = !Storage.get(`setting_${id}`, false);
        Storage.set(`setting_${id}`, value);
        this.applySetting(id, value);
        EventBus.emit('settings:changed', { id, value });
        // UI neu laden
        this.refreshUI();
        return value;
    },

    refreshUI() {
        // Aktuelles Settings-Fenster neu laden
        const windows = WindowManager?.windows || [];
        const settingsWindow = windows.find(w => w.appId === 'settings');
        if (settingsWindow) {
            const body = settingsWindow.element.querySelector('.window-body');
            if (body) {
                body.innerHTML = this.getSettingsHTML('display');
            }
        }
    }
};

window.Settings = Settings;
