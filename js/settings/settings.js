/**
 * HALDO AI OS 24.6 – SETTINGS
 * Zentrale Einstellungen – inkl. AI & Memory Tab
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
                    { 
                        id: 'resolution', 
                        label: 'Auflösung', 
                        type: 'select', 
                        options: [
                            { label: 'HD (1280x720)', value: '1280x720' },
                            { label: 'Full HD (1920x1080)', value: '1920x1080' },
                            { label: '2K (2560x1440)', value: '2560x1440' },
                            { label: '4K (3840x2160)', value: '3840x2160' },
                            { label: '8K (7680x4320)', value: '7680x4320' }
                        ], 
                        default: '1920x1080' 
                    },
                    { 
                        id: 'quality', 
                        label: 'Cosmic World Qualität', 
                        type: 'select', 
                        options: [
                            { label: 'Niedrig', value: 'low' },
                            { label: 'Mittel', value: 'medium' },
                            { label: 'Hoch', value: 'high' },
                            { label: 'Ultra (4K)', value: 'ultra' },
                            { label: 'Cinematic (8K)', value: 'cinematic' }
                        ], 
                        default: 'ultra' 
                    },
                    { id: 'hdr', label: 'HDR', type: 'toggle', default: false },
                    { 
                        id: 'fps', 
                        label: 'FPS-Limit', 
                        type: 'select', 
                        options: [
                            { label: '30 FPS', value: 30 },
                            { label: '60 FPS', value: 60 },
                            { label: '120 FPS', value: 120 },
                            { label: 'Unlimited', value: 'unlimited' }
                        ], 
                        default: 60 
                    }
                ]
            },
            
            // ============================================
            // 🔥 HIER IST DER AI & MEMORY TAB!
            // ============================================
            ai: {
                name: '🧠 AI & Memory',
                settings: [
                    { 
                        id: 'groq_api_key',     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     // <-- DAS IST DER KEY!
                        label: '🔑 Groq API Key',
                        type: 'password',   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         // <-- Versteckte Eingabe
                        default: '',
                        placeholder: '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'
                    },
                    { 
                        id: 'ai_model', 
                        label: '🧠 KI-Modell', 
                        type: 'select', 
                        options: [
                            { label: 'Mixtral 8x7B (empfohlen)', value: 'mixtral-8x7b-32768' },
                            { label: 'Llama 3 70B', value: 'llama3-70b-8192' },
                            { label: 'Gemma 7B', value: 'gemma-7b-it' }
                        ], 
                        default: 'mixtral-8x7b-32768' 
                    },
                    { 
                        id: 'ai_temperature', 
                        label: '🎨 Kreativität (Temperatur)', 
                        type: 'range', 
                        min: 0, 
                        max: 2, 
                        step: 0.1,
                        default: 0.7 
                    },
                    { 
                        id: 'ai_memory', 
                        label: '🧩 Memory aktivieren', 
                        type: 'toggle', 
                        default: true 
                    },
                    { 
                        id: 'ai_memory_clear', 
                        label: '🗑️ Memory löschen', 
                        type: 'button', 
                        action: () => {
                            if (confirm('Wirklich alle AI-Erinnerungen löschen?')) {
                                Storage.set('ai_memory', []);
                                alert('✅ Memory gelöscht!');
                            }
                        } 
                    }
                ]
            },
            // ============================================

            language: {
                name: '🌍 Sprache & Voice',
                settings: [
                    { 
                        id: 'system_language', 
                        label: 'Systemsprache', 
                        type: 'select', 
                        options: [
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
                        ], 
                        default: 'de' 
                    },
                    { 
                        id: 'voice_profiles', 
                        label: 'Voice-Profile', 
                        type: 'multi', 
                        options: [
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
                        ], 
                        default: ['de-female', 'en-male'] 
                    }
                ]
            },
            themes: {
                name: '🎨 Themes & Design',
                settings: [
                    { 
                        id: 'theme', 
                        label: 'Theme', 
                        type: 'select', 
                        options: [
                            { label: '🌙 Dark', value: 'dark' },
                            { label: '☀️ Light', value: 'light' },
                            { label: '🌌 Cosmic', value: 'cosmic' }
                        ], 
                        default: 'dark' 
                    },
                    { 
                        id: 'glass_intensity', 
                        label: 'Glass-Intensität', 
                        type: 'range', 
                        min: 0, 
                        max: 100,
                        default: 50 
                    }
                ]
            },
            security: {
                name: '🔒 Sicherheit & Privacy',
                settings: [
                    { id: 'pin', label: 'PIN-Code', type: 'password', default: '' },
                    { id: 'privacy_mode', label: 'Privacy-Modus', type: 'toggle', default: false },
                    { 
                        id: 'clear_cache', 
                        label: '🗑️ Cache leeren', 
                        type: 'button', 
                        action: () => {
                            if (confirm('Wirklich den gesamten Cache leeren?')) {
                                Storage.clear();
                                alert('✅ Cache geleert!');
                            }
                        } 
                    }
                ]
            },
            system: {
                name: '📊 System & Updates',
                settings: [
                    { id: 'auto_update', label: 'Automatische Updates', type: 'toggle', default: true },
                    { id: 'system_logs', label: 'System-Logs aktivieren', type: 'toggle', default: true },
                    { id: 'backup_interval', label: 'Backup-Intervall (Tage)', type: 'number', min: 1, max: 30, default: 7 }
                ]
            }
        };
    },

    // ---- GET / SET ----

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
        this.applySetting(id, value);
        return this;
    },

    // ---- EINSTELLUNGEN ANWENDEN ----

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
            
            case 'groq_api_key':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
                if (typeof AICore !== 'undefined') {
                    AICore.setApiKey(value);
                }
                console.log('🔑 Groq API Key wurde sicher gespeichert!');
                break;
                
            case 'ai_model':
                if (typeof AICore !== 'undefined') {
                    AICore.model = value;
                    Storage.set('ai_model', value);
                }
                break;
            case 'ai_temperature':
                if (typeof AICore !== 'undefined') {
                    AICore.temperature = value;
                    Storage.set('ai_temperature', value);
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
        Object.keys(this.categories).forEach(cat => {
            this.categories[cat].settings.forEach(setting => {
                const value = Storage.get(`setting_${setting.id}`, setting.default);
                this.applySetting(setting.id, value);
            });
        });
    },

    // ---- UI RENDER ----

    openCategory(category) {
        const cat = this.categories[category];
        if (!cat) return;

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

        let html = `<h2 style="margin-bottom:16px;">${cat.name}</h2>`;
        cat.settings.forEach(setting => {
            const value = Storage.get(`setting_${setting.id}`, setting.default);
            html += this.renderSetting(setting, value, category);
        });
        return html;
    },

    renderSetting(setting, value, category) {
        const settingCategory = category || 'system';
        
        switch (setting.type) {
            case 'password':
                return `
                    <div style="margin:12px 0;padding:12px;background:var(--glass-bg);border-radius:12px;border:1px solid var(--glass-border);">
                        <label style="display:block;margin-bottom:6px;color:var(--text-secondary);font-weight:500;">${setting.label}</label>
                        <input type="password" id="setting-${setting.id}" 
                            value="${value || ''}" 
                            placeholder="${setting.placeholder || ''}"
                            onchange="Settings.set('${settingCategory}', '${setting.id}', this.value)"
                            style="width:100%;padding:10px 14px;background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:8px;color:var(--text-primary);font-family:var(--font-primary);outline:none;font-size:14px;">
                        <div style="margin-top:6px;font-size:12px;color:var(--text-muted);">
                            ${setting.id === 'groq_api_key' ? '🔒 Der Key wird NUR in deinem Browser gespeichert und NIE im Code!' : ''}
                        </div>
                    </div>
                `;
                
            case 'select':
                return `
                    <div style="margin:12px 0;padding:12px;background:var(--glass-bg);border-radius:12px;border:1px solid var(--glass-border);">
                        <label style="display:block;margin-bottom:6px;color:var(--text-secondary);font-weight:500;">${setting.label}</label>
                        <select id="setting-${setting.id}" 
                            onchange="Settings.set('${settingCategory}', '${setting.id}', this.value)"
                            style="width:100%;padding:10px 14px;background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:8px;color:var(--text-primary);font-family:var(--font-primary);outline:none;font-size:14px;">
                            ${setting.options.map(opt => `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                        </select>
                    </div>
                `;
                
            case 'toggle':
                return `
                    <div style="margin:12px 0;padding:12px;background:var(--glass-bg);border-radius:12px;border:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:center;">
                        <label style="color:var(--text-secondary);font-weight:500;">${setting.label}</label>
                        <button onclick="Settings.toggle('${setting.id}')" style="
                            width:50px;
                            height:28px;
                            background:${value ? 'var(--primary)' : 'rgba(255,255,255,0.1)'};
                            border:1px solid var(--glass-border);
                            border-radius:14px;
                            cursor:pointer;
                            position:relative;
                            transition:all var(--transition-fast);
                        ">
                            <span style="
                                position:absolute;
                                top:2px;
                                left:${value ? '24px' : '2px'};
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
                    <div style="margin:12px 0;padding:12px;background:var(--glass-bg);border-radius:12px;border:1px solid var(--glass-border);">
                        <label style="display:block;margin-bottom:6px;color:var(--text-secondary);font-weight:500;">${setting.label} (${value})</label>
                        <input type="range" id="setting-${setting.id}" 
                            min="${setting.min}" max="${setting.max}" step="${setting.step || 1}" value="${value}" 
                            oninput="Settings.set('${settingCategory}', '${setting.id}', parseFloat(this.value)); this.previousElementSibling.textContent = '${setting.label} (' + this.value + ')';"
                            style="width:100%;accent-color:var(--primary);">
                    </div>
                `;
                
            case 'number':
                return `
                    <div style="margin:12px 0;padding:12px;background:var(--glass-bg);border-radius:12px;border:1px solid var(--glass-border);">
                        <label style="display:block;margin-bottom:6px;color:var(--text-secondary);font-weight:500;">${setting.label}</label>
                        <input type="number" id="setting-${setting.id}" value="${value}" min="${setting.min}" max="${setting.max}"
                            onchange="Settings.set('${settingCategory}', '${setting.id}', parseInt(this.value))"
                            style="width:100%;padding:10px 14px;background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:8px;color:var(--text-primary);font-family:var(--font-primary);outline:none;font-size:14px;">
                    </div>
                `;
                
            case 'button':
                return `
                    <div style="margin:12px 0;padding:12px;background:var(--glass-bg);border-radius:12px;border:1px solid var(--glass-border);">
                        <button onclick="(${setting.action.toString()})()" style="
                            padding:10px 24px;
                            background:var(--primary);
                            border:none;
                            border-radius:8px;
                            color:white;
                            cursor:pointer;
                            font-family:var(--font-primary);
                            font-size:14px;
                            transition:all var(--transition-fast);
                        ">
                            ${setting.label}
                        </button>
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
        this.refreshUI();
        return value;
    },

    refreshUI() {
        const windows = WindowManager?.windows || [];
        const settingsWindow = windows.find(w => w.appId === 'settings');
        if (settingsWindow) {
            const body = settingsWindow.element.querySelector('.window-body');
            if (body) {
                body.innerHTML = this.getSettingsHTML('ai');
            }
        }
    }
};

window.Settings = Settings;
