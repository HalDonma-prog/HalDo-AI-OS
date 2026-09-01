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

// ============================================================
//  VOICE ENGINE
// ============================================================
var Voice = {
    isListening: false,
    recognition: null,
    synthesis: window.speechSynthesis,
    isSupported: false,

    init: function() {
        var hasRecognition = ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
        var hasSynthesis = ('speechSynthesis' in window);

        if (hasRecognition) {
            var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SR();
            this.recognition.lang = CONFIG.language === 'ku' ? 'ku' :
                CONFIG.language === 'ezidi' ? 'ku' :
                CONFIG.language === 'tr' ? 'tr' :
                CONFIG.language === 'ar' ? 'ar' :
                CONFIG.language === 'fr' ? 'fr' :
                CONFIG.language === 'es' ? 'es' : 'de-DE';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.onresult = this._onResult.bind(this);
            this.recognition.onerror = this._onError.bind(this);
            this.recognition.onend = this._onEnd.bind(this);
            this.isSupported = true;
            console.log('[Voice] Speech Recognition bereit');
        }

        if (hasSynthesis) {
            console.log('[Voice] Speech Synthesis bereit');
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(function(stream) {
                    stream.getTracks().forEach(function(t) { t.stop(); });
                    console.log('[Voice] Mikrofon-Zugriff gewährt');
                })
                .catch(function() {
                    console.log('[Voice] Mikrofon-Zugriff verweigert');
                });
    },

    startListening: function() {
        if (!this.recognition) {
            Notify.error(t('error'));
            return;
        }
        if (this.isListening) {
            this.recognition.stop();
            return;
        }
        try {
            this.recognition.lang = CONFIG.language === 'ku' ? 'ku' :
                CONFIG.language === 'ezidi' ? 'ku' :
                CONFIG.language === 'tr' ? 'tr' :
                CONFIG.language === 'ar' ? 'ar' :
                CONFIG.language === 'fr' ? 'fr' :
                CONFIG.language === 'es' ? 'es' : 'de-DE';
            this.recognition.start();
            this.isListening = true;
            Notify.info('🎤 ' + (CONFIG.language === 'en' ? 'Listening...' :
                CONFIG.language === 'ku' ? 'Guhdarî...' :
                CONFIG.language === 'tr' ? 'Dinliyorum...' : 'Höre zu ...'));
            this._updateAvatarStatus('listening');
        } catch (e) {
            Notify.error(t('error'));
        }
    },

    _onResult: function(event) {
        var text = event.results[0][0].transcript;
        this.isListening = false;
        Notify.success('🎤 "' + text + '"');
        this._updateAvatarStatus('thinking');

        var cmd = AI._parseCommand(text);
        if (cmd && cmd.action === 'open') {
            if (state.apps[cmd.app]) {
                launchApp(cmd.app);
                Notify.success(state.apps[cmd.app].title + ' ' + (CONFIG.language === 'en' ? 'opened!' :
                    CONFIG.language === 'ku' ? 'vebû!' :
                    CONFIG.language === 'tr' ? 'açıldı!' : 'geöffnet!'));
                this._updateAvatarStatus('idle');
                this.speak(state.apps[cmd.app].title + ' ' + (CONFIG.language === 'en' ? 'opened!' :
                    CONFIG.language === 'ku' ? 'vebû!' :
                    CONFIG.language === 'tr' ? 'açıldı!' : 'geöffnet!'));
                return;
            }
        }

        var input = document.getElementById('ai-input');
        if (input) {
            input.value = text;
            var sendBtn = document.getElementById('ai-send');
            if (sendBtn) sendBtn.click();
        } else {
            AI.ask(text, CONFIG.language).then(function(response) {
                Notify.info(response);
                if (state.settings.voiceEnabled) {
                    Voice.speak(response);
                }
            });
        }
    },

    _onError: function(event) {
        this.isListening = false;
        this._updateAvatarStatus('idle');
        if (event.error === 'not-allowed') {
            Notify.error(t('error'));
        }
    },

    _onEnd: function() {
        this.isListening = false;
        this._updateAvatarStatus('idle');
    },

    speak: function(text, language) {
        if (!state.settings.voiceEnabled) return;
        language = language || CONFIG.language;
        var langCode = language === 'ku' ? 'ku' :
            language === 'ezidi' ? 'ku' :
            language === 'tr' ? 'tr' :
            language === 'ar' ? 'ar' :
            language === 'fr' ? 'fr' :
            language === 'es' ? 'es' : 'de-DE';
        if (!('speechSynthesis' in window)) return;
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        this._updateAvatarStatus('speaking');
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1;
        utterance.onend = function() {
            Voice._updateAvatarStatus('idle');
        };
        this.synthesis.speak(utterance);
    },

    _updateAvatarStatus: function(status) {
        state.avatar.status = status;
        var el = document.getElementById('avatar-status');
        if (el) {
            var statusText = {
                'idle': CONFIG.language === 'en' ? '● Ready' :
                    CONFIG.language === 'ku' ? '● Amade' :
                    CONFIG.language === 'tr' ? '● Hazır' : '● Bereit',
                'listening': CONFIG.language === 'en' ? '🎤 Listening...' :
                    CONFIG.language === 'ku' ? '🎤 Guhdarî...' :
                    CONFIG.language === 'tr' ? '🎤 Dinliyor...' : '🎤 Hört zu...',
                'thinking': CONFIG.language === 'en' ? '🧠 Thinking...' :
                    CONFIG.language === 'ku' ? '🧠 Difikire...' :
                    CONFIG.language === 'tr' ? '🧠 Düşünüyor...' : '🧠 Denkt...',
                'speaking': CONFIG.language === 'en' ? '🗣️ Speaking...' :
                    CONFIG.language === 'ku' ? '🗣️ Dipeyive...' :
                    CONFIG.language === 'tr' ? '🗣️ Konuşuyor...' : '🗣️ Spricht...'
            };
            el.textContent = statusText[status] || '● Bereit';
            el.className = 'avatar-status ' + status;
        }
        var eyes = document.querySelectorAll('.eye');
        eyes.forEach(function(eye) {
            eye.className = 'eye ' + status;
        });
        var mouth = document.querySelector('.mouth');
        if (mouth) {
            mouth.className = 'mouth' + (status === 'speaking' ? ' speaking' : '');
        }
    }
};

// ============================================================
//  AI ENGINE
// ============================================================
var AI = {
    conversationHistory: [],
    isThinking: false,

    knowledge: {
        'de': {
            'recht': 'Das Recht ist die Grundlage unserer Gesellschaft. Es regelt das Zusammenleben der Menschen und schützt die Rechte jedes Einzelnen. Das deutsche Rechtssystem basiert auf dem Grundgesetz.',
            'vertrag': 'Ein Vertrag ist eine rechtlich bindende Vereinbarung zwischen zwei oder mehreren Parteien.',
            'medizin': 'Die Medizin ist die Wissenschaft der Heilung und der Erhaltung der Gesundheit.',
            'bildung': 'Bildung ist der Schlüssel zur persönlichen und gesellschaftlichen Entwicklung.',
            'universität': 'Die Universität ist eine Einrichtung der höheren Bildung und Forschung.',
            'beruf': 'Der Beruf ist die Tätigkeit, mit der ein Mensch seinen Lebensunterhalt verdient.',
            'kultur': 'Kultur umfasst die Gesamtheit der geistigen, künstlerischen und sozialen Ausdrucksformen.',
            'wissenschaft': 'Wissenschaft ist die systematische Erforschung und Erweiterung des Wissens.',
            'philosophie': 'Die Philosophie ist die Liebe zur Weisheit.',
            'ezidi': 'Die Êzîdî sind eine der ältesten monotheistischen Religionen der Welt.',
            'kurden': 'Die Kurden sind ein indigenes Volk in der Region Kurdistan.',
            'default': 'Das ist ein wirklich faszinierendes Thema! Ich habe ein tiefes Verständnis für viele Bereiche.'
        },
        'en': {
            'recht': 'Law is the foundation of our society. It governs coexistence and protects the rights of every individual.',
            'vertrag': 'A contract is a legally binding agreement between two or more parties.',
            'medizin': 'Medicine is the science of healing and maintaining health.',
            'bildung': 'Education is the key to personal and social development.',
            'universität': 'The university is an institution of higher education and research.',
            'beruf': 'A profession is the activity by which a person earns their living.',
            'kultur': 'Culture encompasses all the intellectual, artistic and social expressions.',
            'wissenschaft': 'Science is the systematic exploration and expansion of knowledge.',
            'philosophie': 'Philosophy is the love of wisdom.',
            'ezidi': 'The Êzîdî are one of the oldest monotheistic religions in the world.',
            'kurden': 'The Kurds are an indigenous people in the Kurdistan region.',
            'default': 'This is a truly fascinating topic! I have a deep understanding of many areas.'
        },
        'ku': {
            'recht': 'Dad î bingeha civaka me ye. Ew hevjiyanê birêkûpêk dike û mafên her kesî diparêze.',
            'vertrag': 'Peymanek lihevkirinek qanûnî ye di navbera du an zêdetir aliyan de.',
            'medizin': 'Bijîşkî zanista derman û parastina tenduristiyê ye.',
            'bildung': 'Perwerde kilîta pêşkeftina kesane û civakî ye.',
            'universität': 'Zanîngeh saziyek perwerde û lêkolîna bilind e.',
            'beruf': 'Pîşe çalakiya ku mirov bi wê debara xwe dike ye.',
            'kultur': 'Çand tevahiya vegotinên rewşenbîrî, hunerî û civakî yên civakekê vedigire.',
            'wissenschaft': 'Zanist lêkolîn û berfirehkirina zanînê ya sîstematîk e.',
            'philosophie': 'Felsefe evîna aqil e.',
            'ezidi': 'Êzîdî yek ji kevintirîn olên yekxwedayî yên cîhanê ne.',
            'kurden': 'Kurd gelê xwecihî yê herêma Kurdistanê ne.',
            'default': 'Ev mijarek bi rastî balkêş e! Ez di gelek waran de têgihiştineke kûr heye.'
        }
    },

    ask: function(question, language) {
        language = language || CONFIG.language;
        var self = this;
        this.isThinking = true;
        Voice._updateAvatarStatus('thinking');

        var lower = question.toLowerCase();
        var knowledge = this.knowledge[language] || this.knowledge['de'];
        for (var key in knowledge) {
            if (lower.includes(key) || key.includes(lower)) {
                var answer = knowledge[key];
                this._addToHistory('user', question);
                this._addToHistory('assistant', answer);
                this.isThinking = false;
                Voice._updateAvatarStatus('idle');
                return Promise.resolve(answer);
            }
        }

        var cmd = this._parseCommand(question);
        if (cmd && cmd.action === 'open') {
            var appName = cmd.app;
            if (state.apps[appName]) {
                launchApp(appName);
                this.isThinking = false;
                Voice._updateAvatarStatus('idle');
                return Promise.resolve('✅ ' + state.apps[appName].title + ' ' + (language === 'en' ?
                    'opened!' : language === 'ku' ? 'vebû!' : 'geöffnet!'));
            }
        }

        var systemPrompt = language === 'en' ?
            'You are HalDo, an intelligent, friendly and professional assistant. You help with all topics. You respond in ' +
            language + '.' :
            language === 'ku' ?
            'Tu HalDo yî, alîkarekî jîr, dostane û pîşeyî. Tu bi hemî mijaran re alîkarî dikî. Tu bi ' +
            language + ' bersivê didî.' :
            'Du bist HalDo, ein intelligenter, freundlicher und professioneller Assistent. Du hilfst bei allen Themen. Du antwortest auf ' +
            language + '.';

        return new Promise(function(resolve, reject) {
            fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + CONFIG.apiKey
                },
                body: JSON.stringify({
                    model: CONFIG.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: question }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            }).then(function(response) {
                if (!response.ok) {
                    return response.text().then(function(err) {
                        reject(new Error('API-Fehler: ' + response.status));
                    });
                }
                return response.json();
            }).then(function(data) {
                var answer = data.choices[0].message.content;
                self._addToHistory('user', question);
                self._addToHistory('assistant', answer);
                self.isThinking = false;
                Voice._updateAvatarStatus('idle');
                resolve(answer);
            }).catch(function(error) {
                var fallback = self._getFallback(question, language);
                self.isThinking = false;
                Voice._updateAvatarStatus('idle');
                resolve(fallback);
            });
        });
    },

    _addToHistory: function(role, content) {
        this.conversationHistory.push({ role: role, content: content, timestamp: now() });
        if (this.conversationHistory.length > CONFIG.maxHistory) {
            this.conversationHistory.splice(0, this.conversationHistory.length - CONFIG.maxHistory);
        }
        try {
            localStorage.setItem('haldo_conversations', JSON.stringify(this.conversationHistory));
        } catch (e) {}
    },

    _parseCommand: function(text) {
        var lower = text.toLowerCase();
        var appMap = {
            'ai': ['ai', 'haldo ai', 'chat', 'assistent', 'haldo', 'ki', 'assistant'],
            'avatar': ['avatar', 'living ai', 'lebendig', 'character'],
            'fahrschule': ['fahrschule', 'auto fahren', 'führerschein', 'auto', 'driving school'],
            'settings': ['einstellungen', 'settings', 'optionen', 'system', 'ayarlar'],
            'notes': ['notizen', 'notes', 'zettel', 'memo', 'notiz'],
            'tasks': ['aufgaben', 'tasks', 'to-do', 'todo', 'görev'],
            'contacts': ['kontakte', 'adressbuch', 'contacts', 'kişiler'],
            'files': ['dateien', 'files', 'ordner', 'dokumente', 'dosyalar'],
            'cosmic': ['cosmic', 'weltraum', 'space', 'galaxie', 'sonne', 'uzay'],
            'appworld': ['app world', 'apps', 'anwendungen', 'uygulamalar'],
            'email': ['email', 'mail', 'e-mail', 'post', 'eposta'],
            'language': ['sprache', 'language', 'dil', 'lisan'],
            'update': ['update', 'güncelleme', 'aktualisierung']
        };

        for (var appId in appMap) {
            var keywords = appMap[appId];
            for (var i = 0; i < keywords.length; i++) {
                var kw = keywords[i];
                if (lower.includes('öffne ' + kw) || lower.includes('open ' + kw) ||
                    lower.includes('starte ' + kw) || lower.includes('start ' + kw) ||
                    lower.includes('haldo öffne ' + kw) || lower.includes('haldo open ' + kw) ||
                    lower === kw) {
                    return { action: 'open', app: appId };
                }
            }
        }
        return null;
    },

    _getFallback: function(cmd, language) {
        var lower = cmd.toLowerCase();

        var fallbackApps = {
            'fahrschule': ['fahrschule', 'auto', 'führerschein', 'driving'],
            'ai': ['ai', 'haldo', 'chat', 'ki', 'assistant'],
            'settings': ['einstellungen', 'settings', 'optionen', 'ayarlar'],
            'notes': ['notizen', 'notes', 'memo', 'notiz'],
            'tasks': ['aufgaben', 'tasks', 'todo', 'görev'],
            'contacts': ['kontakte', 'contacts', 'kişiler'],
            'files': ['dateien', 'files', 'dosyalar'],
            'cosmic': ['cosmic', 'weltraum', 'space', 'uzay'],
            'appworld': ['apps', 'app world', 'uygulamalar'],
            'email': ['email', 'mail', 'eposta']
        };

        for (var appId in fallbackApps) {
            var words = fallbackApps[appId];
            for (var i = 0; i < words.length; i++) {
                if (lower.includes(words[i]) || lower.includes('öffne ' + words[i]) || lower.includes('open ' +
                        words[i])) {
                    if (state.apps[appId]) {
                        launchApp(appId);
                        return '✅ ' + state.apps[appId].title + ' ' + (language === 'en' ? 'opened!' :
                            language === 'ku' ? 'vebû!' : 'geöffnet!');
                    }
                }
            }
        }

        if (language === 'en') {
            if (lower.includes('write') || lower.includes('letter') || lower.includes('email')) {
                return '✍️ Here is your text:\n\nDear Sir or Madam,\n\nI would like to inform you about the following...\n\nYours sincerely\nYour HalDo AI';
            }
            if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
                return '👋 Hello! I am HalDo, your personal AI assistant. How can I help you?';
            }
            if (lower.includes('help')) {
                return '❓ **HalDo AI – Help**\n\n📱 Apps:\n• "Open Driving School" 🚗\n• "Open Notes" 📝\n• "Open Email" 📧\n\n⌨️ Shortcuts:\n• Cmd+K → AI\n• Escape → Close window\n\n☀️ Click on the sun!';
            }
            return '💡 I understood: "' + cmd +
                '".\n\nI can:\n• Open apps ("Open Driving School")\n• Write texts ("Write me a letter")\n• Answer questions\n\nSay "Help" for more!';
        }

        if (language === 'ku') {
            if (lower.includes('nivîsîn') || lower.includes('name') || lower.includes('email')) {
                return '✍️ Nivîsara te li vir e:\n\nBirêz û Xanim,\n\nEz dixwazim we li ser jêrîn agahdar bikim...\n\nBi rêz\nHalDo AI';
            }
            if (lower.includes('silav') || lower.includes('merheba')) {
                return '👋 Silav! Ez HalDo me, alîkarê te yê kesane. Ez çawa dikarim alîkariya te bikim?';
            }
            if (lower.includes('alîkarî')) {
                return '❓ **HalDo AI – Alîkarî**\n\n📱 Apps:\n• "Veke Dibistana Ajotinê" 🚗\n• "Veke Not" 📝\n• "Veke Email" 📧\n\n⌨️ Kîteya:\n• Cmd+K → AI\n• Escape → Pencerê bigire\n\n☀️ Li rojê bitikîne!';
            }
            return '💡 Min fam kir: "' + cmd +
                '".\n\nEz dikarim:\n• Appan vekim ("Veke Dibistana Ajotinê")\n• Nivîsaran binivîsim ("Nivîsarekê ji min re binivîse")\n• Pirsan bersiv bidim\n\nJi bo bêtir "Alîkarî" bêje!';
        }

        // DEUTSCH (Fallback)
        if (lower.includes('schreib mir') || lower.includes('brief') || lower.includes('schreiben')) {
            return '✍️ Hier ist dein Text:\n\nSehr geehrte Damen und Herren,\n\nhiermit möchte ich Sie über folgendes informieren...\n\nMit freundlichen Grüßen\nIhr HalDo AI';
        }
        if (lower.includes('hallo') || lower.includes('hi') || lower.includes('hey')) {
            return '👋 Hallo! Ich bin HalDo, dein persönlicher AI-Assistent. Wie kann ich dir helfen?';
        }
        if (lower.includes('hilfe')) {
            return '❓ **HalDo AI – Hilfe**\n\n📱 Apps:\n• "Öffne Fahrschule" 🚗\n• "Öffne Notizen" 📝\n• "Öffne E-Mail" 📧\n\n⌨️ Shortcuts:\n• Cmd+K → AI\n• Escape → Fenster schließen\n\n☀️ Klicke auf die Sonne!';
        }
        return '💡 Ich habe verstanden: "' + cmd +
            '".\n\nIch kann:\n• Apps öffnen ("Öffne Fahrschule")\n• Texte schreiben ("Schreib mir einen Brief")\n• Fragen beantworten\n\nSag "Hilfe" für mehr!';
    },

    clearHistory: function() {
        this.conversationHistory = [];
        try {
            localStorage.setItem('haldo_conversations', JSON.stringify([]));
        } catch (e) {}
        Notify.info('🧹 ' + (CONFIG.language === 'en' ? 'Chat history cleared' : CONFIG.language === 'ku' ?
            'Dîroka chatê hate paqijkirin' : 'Chat-Historie gelöscht'));
    }
};
