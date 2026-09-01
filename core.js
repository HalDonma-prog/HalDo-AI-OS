// ================================================================
//  HALDO AI OS 24 – CORE (STATE, HELPERS, NOTIFY, VOICE, AI)
// ================================================================

// ============================================================
//  STATE
// ============================================================
var state = {
    apps: {},
    windows: [],
    windowZIndex: 100,
    activeWindow: null,
    avatarStatus: 'idle',
    settings: {
        theme: 'dark',
        language: 'de',
        voiceEnabled: true,
        notifications: true,
        voiceGender: 'male',
        autoStartAI: true,
        showDockLabels: false
    },
    system: {
        started: Date.now(),
        uptime: 0,
        version: CONFIG.version,
        build: CONFIG.build,
        kernel: CONFIG.kernel,
        bootTime: 0,
        appLaunches: 0,
        updateAvailable: false,
        updateVersion: null
    },
    notes: JSON.parse(localStorage.getItem('haldo_notes') || '[]'),
    contacts: JSON.parse(localStorage.getItem('haldo_contacts') || '[]'),
    tasks: JSON.parse(localStorage.getItem('haldo_tasks') || '[]'),
    emails: JSON.parse(localStorage.getItem('haldo_emails') || '{"inbox":[],"sent":[],"drafts":[]}'),
    documents: JSON.parse(localStorage.getItem('haldo_documents') || '[]'),
    aiMemory: JSON.parse(localStorage.getItem('haldo_ai_memory') || '[]'),
    conversationHistory: JSON.parse(localStorage.getItem('haldo_conversations') || '[]'),
    isBooted: false,
    isReady: false,
    avatar: {
        status: 'idle',
        expression: 'neutral',
        speaking: false
    }
};

// ============================================================
//  DOM-REFERENZEN
// ============================================================
var DOM = {
    introContainer: document.getElementById('intro-container'),
    introStatus: document.getElementById('intro-status'),
    introProgress: document.getElementById('intro-progress-bar'),
    introProgressText: document.getElementById('intro-progress-text'),
    cosmic: document.getElementById('cosmic'),
    appContainer: document.getElementById('app-container'),
    dock: document.getElementById('dock'),
    notification: document.getElementById('notification'),
    clock: document.getElementById('clock-display')
};

// ============================================================
//  HELPER
// ============================================================
function $(id) { return document.getElementById(id); }
function now() { return Date.now(); }
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 4); }

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getTranslation(key, lang) {
    lang = lang || CONFIG.language;
    var translations = {
        de: {
            hello: 'Hallo! Ich bin HalDo. Wie kann ich dir helfen?',
            help: '❓ Hilfe',
            apps: '📱 Apps',
            settings: '⚙️ Einstellungen',
            loading: '⟡ System wird gestartet ...',
            ready: '🚀 HalDo OS gestartet!',
            error: '❌ Fehler aufgetreten',
            success: '✅ Erfolg',
            info: 'ℹ️ Information',
            warning: '⚠️ Warnung'
        },
        en: {
            hello: 'Hello! I am HalDo. How can I help you?',
            help: '❓ Help',
            apps: '📱 Apps',
            settings: '⚙️ Settings',
            loading: '⟡ System is starting ...',
            ready: '🚀 HalDo OS started!',
            error: '❌ Error occurred',
            success: '✅ Success',
            info: 'ℹ️ Information',
            warning: '⚠️ Warning'
        },
        ku: {
            hello: 'Silav! Ez HalDo me. Çawa dikarim alîkariya te bikim?',
            help: '❓ Alîkarî',
            apps: '📱 Apps',
            settings: '⚙️ Mîheng',
            loading: '⟡ Sîstem tê destpêkirin ...',
            ready: '🚀 HalDo OS destpêkir!',
            error: '❌ Çewtî',
            success: '✅ Serkeftin',
            info: 'ℹ️ Agahî',
            warning: '⚠️ Hişyarî'
        },
        ezidi: {
            hello: 'Silav! Ez HalDo me. Çawa dikarim alîkariya te bikim?',
            help: '❓ Alîkarî',
            apps: '📱 Apps',
            settings: '⚙️ Mîheng',
            loading: '⟡ Sîstem tê destpêkirin ...',
            ready: '🚀 HalDo OS destpêkir!',
            error: '❌ Çewtî',
            success: '✅ Serkeftin',
            info: 'ℹ️ Agahî',
            warning: '⚠️ Hişyarî'
        },
        tr: {
            hello: 'Merhaba! Ben HalDo. Sana nasıl yardımcı olabilirim?',
            help: '❓ Yardım',
            apps: '📱 Uygulamalar',
            settings: '⚙️ Ayarlar',
            loading: '⟡ Sistem başlatılıyor ...',
            ready: '🚀 HalDo OS başlatıldı!',
            error: '❌ Hata oluştu',
            success: '✅ Başarılı',
            info: 'ℹ️ Bilgi',
            warning: '⚠️ Uyarı'
        },
        ar: {
            hello: 'مرحباً! أنا هالدو. كيف يمكنني مساعدتك؟',
            help: '❓ مساعدة',
            apps: '📱 التطبيقات',
            settings: '⚙️ الإعدادات',
            loading: '⟡ جارٍ تشغيل النظام ...',
            ready: '🚀 تم تشغيل نظام هالدو!',
            error: '❌ حدث خطأ',
            success: '✅ نجاح',
            info: 'ℹ️ معلومات',
            warning: '⚠️ تحذير'
        },
        fr: {
            hello: 'Bonjour! Je suis HalDo. Comment puis-je vous aider?',
            help: '❓ Aide',
            apps: '📱 Applications',
            settings: '⚙️ Paramètres',
            loading: '⟡ Démarrage du système ...',
            ready: '🚀 HalDo OS démarré!',
            error: '❌ Erreur',
            success: '✅ Succès',
            info: 'ℹ️ Information',
            warning: '⚠️ Avertissement'
        },
        es: {
            hello: '¡Hola! Soy HalDo. ¿Cómo puedo ayudarte?',
            help: '❓ Ayuda',
            apps: '📱 Aplicaciones',
            settings: '⚙️ Ajustes',
            loading: '⟡ Iniciando sistema ...',
            ready: '🚀 ¡HalDo OS iniciado!',
            error: '❌ Error',
            success: '✅ Éxito',
            info: 'ℹ️ Información',
            warning: '⚠️ Advertencia'
        }
    };
    return translations[lang] && translations[lang][key] ? translations[lang][key] : translations.de[key] || key;
}

function t(key) {
    return getTranslation(key, CONFIG.language);
}

// ============================================================
//  NOTIFICATION SYSTEM
// ============================================================
var Notify = {
    _timeout: null,

    show: function(text, type) {
        type = type || 'info';
        var colors = {
            error: '#ff4444',
            success: '#44ff88',
            warning: '#ffcc00',
            info: '#00d4ff'
        };
        DOM.notification.textContent = text;
        DOM.notification.style.borderLeftColor = colors[type] || '#00d4ff';
        DOM.notification.classList.add('show');
        clearTimeout(this._timeout);
        this._timeout = setTimeout(function() {
            DOM.notification.classList.remove('show');
        }, CONFIG.notificationDuration);
        console.log('[HalDo]', text);
    },

    error: function(text) { this.show('❌ ' + text, 'error'); },
    success: function(text) { this.show('✅ ' + text, 'success'); },
    warning: function(text) { this.show('⚠️ ' + text, 'warning'); },
    info: function(text) { this.show('ℹ️ ' + text, 'info'); }
};

var notify = Notify.show;
