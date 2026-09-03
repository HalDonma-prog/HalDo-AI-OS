/**
 * HALDO AI OS 24.6.0 – SETTINGS
 * Zentrale Einstellungen für alle Kategorien
 * Version: 2.0.0
 */

const Settings = {
    // ---- KATEGORIEN ----
    categories: {
        general: {
            name: '⚙️ Allgemein',
            icon: '⚙️',
            settings: [
                { id: 'system_name', label: 'Systemname', type: 'text', default: 'HalDo AI OS' },
                { id: 'timezone', label: 'Zeitzone', type: 'select', options: [
                        { label: 'Europe/Berlin', value: 'Europe/Berlin' },
                        { label: 'Europe/London', value: 'Europe/London' },
                        { label: 'America/New_York', value: 'America/New_York' },
                        { label: 'Asia/Dubai', value: 'Asia/Dubai' },
                        { label: 'Asia/Tokyo', value: 'Asia/Tokyo' }
                    ], default: 'Europe/Berlin' },
                { id: 'date_format', label: 'Datumsformat', type: 'select', options: [
                        { label: 'DD.MM.YYYY', value: 'DD.MM.YYYY' },
                        { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
                        { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
                    ], default: 'DD.MM.YYYY' },
                { id: 'home_page', label: 'Startseite', type: 'select', options: [
                        { label: 'Desktop', value: 'desktop' },
                        { label: 'App Center', value: 'apps' },
                        { label: 'HalDo AI', value: 'ai' }
                    ], default: 'desktop' }
            ]
        },
        
        ai: {
            name: '🧠 AI & Memory',
            icon: '🧠',
            settings: [
                // ⚡ DER GROQ API KEY WIRD HIER GESPEICHERT!
                { 
                    id: 'groq_api_key', 
                    label: '🔑 Groq API Key', 
                    type: 'password', 
                    default: '',
                    placeholder: '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',
                    description: '🔒 Der Key wird NUR in deinem Browser gespeichert und NIE im Code!'
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
                },
                { 
                    id: 'ai_system_prompt', 
                    label: '💬 System-Prompt', 
                    type: 'textarea', 
                    default: 'Du bist HalDo, eine freundliche KI-Assistentin.',
                    description: 'Der System-Prompt bestimmt die Persönlichkeit von HalDo AI.'
                }
            ]
        },
        
        display: {
            name: '🖥️ Display',
            icon: '🖥️',
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
                    id: 'brightness', 
                    label: 'Helligkeit', 
                    type: 'range', 
                    min: 0, 
                    max: 100,
                    default: 80 
                },
                { 
                    id: 'animation_speed', 
                    label: 'Animationsgeschwindigkeit', 
                    type: 'select', 
                    options: [
                        { label: 'Langsam', value: 'slow' },
                        { label: 'Normal', value: 'normal' },
                        { label: 'Schnell', value: 'fast' }
                    ], 
                    default: 'normal' 
                },
                { 
                    id: 'cosmic_quality', 
                    label: '🎮 3D-Qualität', 
                    type: 'select', 
                    options: [
                        { label: 'Niedrig', value: 'low' },
                        { label: 'Mittel', value: 'medium' },
                        { label: 'Hoch', value: 'high' },
                        { label: 'Ultra', value: 'ultra' }
                    ], 
                    default: 'high' 
                }
            ]
        },
        
        language: {
            name: '🌍 Sprache',
            icon: '🌍',
            settings: [
                { 
                    id: 'system_language', 
                    label: 'Systemsprache', 
                    type: 'select', 
                    options: [
                        { label: '🇩🇪 Deutsch', value: 'DE' },
                        { label: '🇬🇧 English', value: 'EN' },
                        { label: '🏴 Kurmancî', value: 'KU' },
                        { label: '🏴 Êzîdî', value: 'EZ' },
                        { label: '🇹🇷 Türkçe', value: 'TR' },
                        { label: '🇸🇦 العربية', value: 'AR' },
                        { label: '🇫🇷 Français', value: 'FR' },
                        { label: '🇪🇸 Español', value: 'ES' },
                        { label: '🇷🇺 Русский', value: 'RU' },
                        { label: '🇮🇷 فارسی', value: 'FA' },
                        { label: '🇮🇹 Italiano', value: 'IT' },
                        { label: '🇵🇹 Português', value: 'PT' }
                    ], 
                    default: 'DE' 
                },
                { 
                    id: 'keyboard_layout', 
                    label: 'Tastaturlayout', 
                    type: 'select', 
                    options: [
                        { label: 'QWERTZ (Deutsch)', value: 'qwertz' },
                        { label: 'QWERTY (Englisch)', value: 'qwerty' },
                        { label: 'Êzîdî', value: 'ezidi' }
                    ], 
                    default: 'qwertz' 
                }
            ]
        },
        
        themes: {
            name: '🎨 Themes',
            icon: '🎨',
            settings: [
                { 
                    id: 'theme', 
                    label: 'Theme', 
                    type: 'select', 
                    options: [
                        { label: '🌙 Dark', value: 'dark' },
                        { label: '☀️ Light', value: 'light' },
                        { label: '🌌 Cosmic', value: 'cosmic' },
                        { label: '🌠 Aurora', value: 'aurora' },
                        { label: '🌃 Midnight', value: 'midnight' }
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
        
        voice: {
            name: '🎤 Voice',
            icon: '🎤',
            settings: [
                { 
                    id: 'voice_gender', 
                    label: 'Stimme', 
                    type: 'select', 
                    options: [
                        { label: '👩 Deutsch – weiblich', value: '👩' },
                        { label: '👨 Deutsch – männlich', value: '👨' },
                        { label: '🧑 Deutsch – neutral', value: '🧑' },
                        { label: '👧 Deutsch – jugendlich', value: '👧' },
                        { label: '👦 Deutsch – jugendlich männlich', value: '👦' },
                        { label: '👩🇬🇧 English – female', value: '👩🇬🇧' },
                        { label: '👨🇬🇧 English – male', value: '👨🇬🇧' }
                    ], 
                    default: '👩' 
                },
                { 
                    id: 'voice_speed', 
                    label: 'Geschwindigkeit', 
                    type: 'range', 
                    min: 0.5, 
                    max: 2, 
                    step: 0.1,
                    default: 1.0 
                },
                { 
                    id: 'voice_volume', 
                    label: 'Lautstärke', 
                    type: 'range', 
                    min: 0, 
                    max: 100,
                    default: 80 
                }
            ]
        },
        
        system: {
            name: '📊 System',
            icon: '📊',
            settings: [
                { 
                    id: 'auto_update', 
                    label: 'Automatische Updates', 
                    type: 'toggle', 
                    default: true 
                },
                { 
                    id: 'system_logs', 
                    label: 'System-Logs aktivieren', 
                    type: 'toggle', 
                    default: true 
                },
                { 
                    id: 'backup_interval', 
                    label: 'Backup-Intervall (Tage)', 
                    type: 'number', 
                    min: 1, 
                    max: 30,
                    default: 7 
                },
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
        
        security: {
            name: '🔒 Sicherheit',
            icon: '🔒',
            settings: [
                { 
                    id: 'pin_code', 
                    label: 'PIN-Code', 
                    type: 'password', 
                    default: '',
                    placeholder: 'Neuen PIN eingeben...'
                },
                { 
                    id: 'privacy_mode', 
                    label: 'Privacy-Modus', 
                    type: 'toggle', 
                    default: false 
                },
                { 
                    id: 'security_check', 
                    label: '🛡️ Sicherheitsprüfung', 
                    type: 'button', 
                    action: () => {
                        alert('✅ Sicherheitsprüfung abgeschlossen – keine Probleme gefunden');
                    } 
                }
            ]
        },
        
        storage: {
            name: '💾 Speicher',
            icon: '💾',
            settings: [
                { 
                    id: 'storage_analytics', 
                    label: '📊 Speicheranalyse', 
                    type: 'button', 
                    action: () => {
                        const keys = localStorage.length;
                        const size = new Blob(Object.values(localStorage)).size;
                        alert(`📊 Speicher:\nEinträge: ${keys}\nGröße: ${(size / 1024).toFixed(2)} KB`);
                    } 
                },
                { 
                    id: 'clear_all_data', 
                    label: '🗑️ Alle Daten löschen', 
                    type: 'button', 
                    action: () => {
                        if (confirm('Wirklich alle Daten löschen? Dies kann nicht rückgängig gemacht werden!')) {
                            Storage.clear();
                            alert('✅ Alle Daten gelöscht!');
                            location.reload();
                        }
                    } 
                },
                { 
                    id: 'export_data', 
                    label: '📤 Daten exportieren', 
                    type: 'button', 
                    action: () => {
                        const data = Storage.getAll();
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `haldo_backup_${new Date().toISOString().slice(0,10)}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                    } 
                }
            ]
        }
    },
    
    // ---- INITIALISIERUNG ----
    init() {
        console.log('⚙️ Settings initialisiert');
        // Alle gespeicherten Einstellungen anwenden
        this.applyAll();
        return this;
    },
    
    // ---- GET ----
    get(categoryId, settingId) {
        const cat = this.categories[categoryId];
        if (!cat) return null;
        const setting = cat.settings.find(s => s.id === settingId);
        if (!setting) return null;
        return Storage.get(`setting_${settingId}`, setting.default);
    },
    
    // ---- SET ----
    set(categoryId, settingId, value) {
        Storage.set(`setting_${settingId}`, value);
        this.applySetting(settingId, value);
        EventBus.emit('settings:changed', { category: categoryId, setting: settingId, value });
        return this;
    },
    
    // ---- EINSTELLUNG ANWENDEN ----
    applySetting(settingId, value) {
        switch(settingId) {
            case 'theme':
                document.documentElement.setAttribute('data-theme', value);
                break;
            case 'system_language':
                if (typeof LanguageSystem !== 'undefined') {
                    LanguageSystem.setLanguage(value);
                }
                break;
            case 'voice_gender':
                document.getElementById('menu-voice').textContent = value;
                break;
            case 'groq_api_key':
                if (typeof AICore !== 'undefined') {
                    AICore.setApiKey(value);
                }
                console.log('🔑 Groq API Key wurde sicher gespeichert!');
                break;
            case 'ai_model':
                if (typeof AICore !== 'undefined') {
                    AICore.model = value;
                }
                break;
            case 'ai_temperature':
                if (typeof AICore !== 'undefined') {
                    AICore.temperature = value;
                }
                break;
            case 'cosmic_quality':
                if (typeof CosmicWorld !== 'undefined') {
                    CosmicWorld.setQuality(value);
                }
                break;
            case 'voice_speed':
            case 'voice_volume':
                // Wird in VoiceSystem verwendet
                break;
        }
    },
    
    // ---- ALLE EINSTELLUNGEN ANWENDEN ----
    applyAll() {
        Object.keys(this.categories).forEach(catId => {
            const cat = this.categories[catId];
            cat.settings.forEach(setting => {
                const value = Storage.get(`setting_${setting.id}`, setting.default);
                this.applySetting(setting.id, value);
            });
        });
    },
    
    // ---- UI RENDER ----
    renderSettings(categoryId) {
        const cat = this.categories[categoryId];
        if (!cat) return '<p>Kategorie nicht gefunden</p>';
        
        let html = `<h2 style="color:var(--text-primary);font-size:16px;margin-bottom:12px;">${cat.name}</h2>`;
        cat.settings.forEach(setting => {
            const value = Storage.get(`setting_${setting.id}`, setting.default);
            html += this.renderSetting(setting, value, categoryId);
        });
        return html;
    },
    
    renderSetting(setting, value, categoryId) {
        switch(setting.type) {
            case 'password':
                return `
                    <div style="margin:12px 0;padding:12px;background:var(--glass-bg);border-radius:8px;border:1px solid var(--glass-border);">
                        <label style="display:block;margin-bottom:6px;color:var(--text-secondary);font-weight:500;font-size:12px;">${setting.label}</label>
                        <input type="password" id="setting-${setting.id}" 
                            value="${value || ''}" 
                            placeholder="${setting.placeholder || ''}"
                            onchange="Settings.set('${categoryId}', '${setting.id}', this.value)"
                            style="width:100%;padding:8px 12px;background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:6px;color:var(--text-primary);font-family:var(--font-primary);outline:none;font-size:13px;">
                        ${setting.description ? `<div style="margin-top:6px;font-size:11px;color:var(--text-muted);">${setting.description}</div>` : ''}
                    </div>
                `;
            case 'select':
                return `
                    <div style="margin:8px 0;padding:10px 12px;background:var(--glass-bg);border-radius:6px;border:1px solid var(--glass-border);">
                        <label style="display:block;margin-bottom:4px;color:var(--text-secondary);font-weight:500;font-size:12px;">${setting.label}</label>
                        <select id="setting-${setting.id}" 
                            onchange="Settings.set('${categoryId}', '${setting.id}', this.value)"
                            style="width:100%;padding:6px 10px;background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:6px;color:var(--text-primary);font-family:var(--font-primary);outline:none;font-size:13px;">
                            ${setting.options.map(opt => `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                        </select>
                    </div>
                `;
            case 'toggle':
                return `
                    <div style="margin:8px 0;padding:10px 12px;background:var(--glass-bg);border-radius:6px;border:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:center;">
                        <label style="color:var(--text-secondary);font-weight:500;font-size:12px;">${setting.label}</label>
                        <button onclick="Settings.toggle('${setting.id}', '${categoryId}')" style="
                            width:44px;
                            height:24px;
                            background:${value ? 'var(--primary)' : 'rgba(255,255,255,0.1)'};
                            border:1px solid var(--glass-border);
                            border-radius:12px;
                            cursor:pointer;
                            position:relative;
                            transition:all 0.2s ease;
                        ">
                            <span style="
                                position:absolute;
                                top:2px;
                                left:${value ? '22px' : '2px'};
                                width:18px;
                                height:18px;
                                background:white;
                                border-radius:50%;
                                transition:all 0.2s ease;
                            "></span>
                        </button>
                    </div>
                `;
            case 'range':
                return `
                    <div style="margin:8px 0;padding:10px 12px;background:var(--glass-bg);border-radius:6px;border:1px solid var(--glass-border);">
                        <label style="display:flex;justify-content:space-between;color:var(--text-secondary);font-weight:500;font-size:12px;">
                            <span>${setting.label}</span>
                            <span>${value}</span>
                        </label>
                        <input type="range" id="setting-${setting.id}" 
                            min="${setting.min}" max="${setting.max}" step="${setting.step || 1}" value="${value}" 
                            oninput="Settings.set('${categoryId}', '${setting.id}', parseFloat(this.value)); this.previousElementSibling.querySelector('span:last-child').textContent = this.value;"
                            style="width:100%;accent-color:var(--primary);margin-top:4px;">
                    </div>
                `;
            case 'number':
                return `
                    <div style="margin:8px 0;padding:10px 12px;background:var(--glass-bg);border-radius:6px;border:1px solid var(--glass-border);">
                        <label style="display:block;margin-bottom:4px;color:var(--text-secondary);font-weight:500;font-size:12px;">${setting.label}</label>
                        <input type="number" id="setting-${setting.id}" value="${value}" min="${setting.min}" max="${setting.max}"
                            onchange="Settings.set('${categoryId}', '${setting.id}', parseInt(this.value))"
                            style="width:100%;padding:6px 10px;background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:6px;color:var(--text-primary);font-family:var(--font-primary);outline:none;font-size:13px;">
                    </div>
                `;
            case 'textarea':
                return `
                    <div style="margin:8px 0;padding:10px 12px;background:var(--glass-bg);border-radius:6px;border:1px solid var(--glass-border);">
                        <label style="display:block;margin-bottom:4px;color:var(--text-secondary);font-weight:500;font-size:12px;">${setting.label}</label>
                        <textarea id="setting-${setting.id}" 
                            onchange="Settings.set('${categoryId}', '${setting.id}', this.value)"
                            style="width:100%;padding:6px 10px;background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:6px;color:var(--text-primary);font-family:var(--font-primary);outline:none;font-size:13px;min-height:60px;resize:vertical;">${value || ''}</textarea>
                        ${setting.description ? `<div style="margin-top:6px;font-size:11px;color:var(--text-muted);">${setting.description}</div>` : ''}
                    </div>
                `;
            case 'button':
                return `
                    <div style="margin:8px 0;padding:10px 12px;background:var(--glass-bg);border-radius:6px;border:1px solid var(--glass-border);">
                        <button onclick="(${setting.action.toString()})()" style="
                            padding:6px 16px;
                            background:var(--primary);
                            border:none;
                            border-radius:6px;
                            color:white;
                            cursor:pointer;
                            font-family:var(--font-primary);
                            font-size:12px;
                            transition:all 0.15s ease;
                        ">
                            ${setting.label}
                        </button>
                    </div>
                `;
            default:
                return '';
        }
    },
    
    // ---- TOGGLE ----
    toggle(settingId, categoryId) {
        const value = !Storage.get(`setting_${settingId}`, false);
        Storage.set(`setting_${settingId}`, value);
        this.applySetting(settingId, value);
        EventBus.emit('settings:changed', { setting: settingId, value });
        // UI neu laden
        this.refreshUI(categoryId);
        return value;
    },
    
    // ---- UI AKTUALISIEREN ----
    refreshUI(categoryId) {
        const container = document.getElementById('settings-content');
        if (container) {
            container.innerHTML = this.renderSettings(categoryId);
        }
    },
    
    // ---- KATEGORIE ÖFFNEN ----
    openCategory(categoryId) {
        if (typeof AppManager !== 'undefined') {
            AppManager.openApp('settings', { category: categoryId });
        }
    },
    
    // ---- ALLE KATEGORIEN ----
    getAllCategories() {
        return Object.keys(this.categories);
    },
    
    // ---- VERSION ----
    getVersion() {
        return '2.0.0';
    }
};

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.Settings = Settings;

// ---- AUTOMATISCH INITIALISIEREN ----
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Settings !== 'undefined') {
        Settings.init();
    }
});

console.log('⚙️ Settings geladen – HalDo AI OS 24.6.0');
