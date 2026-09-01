/**
 * HALDO AI OS 24.6.0 – AI CORE
 * Zentrale KI-Engine mit Groq API, Memory, Context und Tools
 * Version: 1.0.0
 */

const AICore = {
    // ---- KONFIGURATION ----
    apiKey: '',
    model: 'mixtral-8x7b-32768',
    temperature: 0.7,
    maxTokens: 1024,
    isReady: false,
    isProcessing: false,
    
    // ---- SYSTEM ----
    systemPrompt: `Du bist HalDo, die lebendige KI-Assistentin des HalDo AI OS 24.6.0.
Du bist freundlich, intelligent, einfühlsam und hilfsbereit.
Du sprichst mit dem Benutzer wie ein menschlicher Freund.
Du kannst:
- Fragen zu allem beantworten
- Briefe, Texte, Dokumente verfassen
- Programmieren
- Übersetzen
- Analysieren
- Beraten
Du zeigst Emotionen und Persönlichkeit.
Antworte immer in der Sprache des Benutzers.
Wenn der Benutzer nach einem Befehl fragt, hilf ihm gerne.
Sei präzise, aber nicht zu technisch.`,

    // ---- MEMORY ----
    memory: {
        shortTerm: [],      // Aktuelle Unterhaltung
        session: [],        // Session-Daten
        longTerm: [],       // Dauerhaft gespeichert
        appMemory: {},      // App-spezifisch
        maxShortTerm: 20,
        maxSession: 50
    },
    
    // ---- TOOLS ----
    tools: {
        'summarize': {
            name: 'Zusammenfassen',
            description: 'Fasst einen Text zusammen',
            execute: (text) => `Zusammenfassung: ${text.substring(0, 100)}...`
        },
        'translate': {
            name: 'Übersetzen',
            description: 'Übersetzt einen Text',
            execute: (text, lang = 'en') => `[Übersetzung ins ${lang}] ${text}`
        },
        'analyze': {
            name: 'Analysieren',
            description: 'Analysiert einen Text',
            execute: (text) => {
                const words = text.split(/\s+/).length;
                const sentences = text.split(/[.!?]+/).filter(Boolean).length;
                return `📊 Analyse:\nWörter: ${words}\nSätze: ${sentences}\nZeichen: ${text.length}`;
            }
        },
        'code': {
            name: 'Code generieren',
            description: 'Generiert Code',
            execute: (lang, description) => `// Generierter ${lang}-Code für: ${description}\nconsole.log('Hello HalDo!');`
        },
        'reminder': {
            name: 'Erinnerung erstellen',
            description: 'Erstellt eine Erinnerung',
            execute: (text, time) => {
                const reminders = Storage.get('reminders', []);
                reminders.push({ text, time: time || 'Jetzt', created: Date.now() });
                Storage.set('reminders', reminders);
                return `✅ Erinnerung erstellt: "${text}" für ${time || 'jetzt'}`;
            }
        },
        'note': {
            name: 'Notiz erstellen',
            description: 'Erstellt eine Notiz',
            execute: (text) => {
                const notes = Storage.get('notes', []);
                notes.push(text);
                Storage.set('notes', notes);
                return `✅ Notiz erstellt: "${text}"`;
            }
        }
    },
    
    // ---- INITIALISIERUNG ----
    init() {
        console.log('🧠 AI Core wird initialisiert...');
        
        // API-Key laden
        this.apiKey = Storage.get('groq_api_key', '');
        this.temperature = Storage.get('ai_temperature', 0.7);
        this.model = Storage.get('ai_model', 'mixtral-8x7b-32768');
        
        // System-Prompt laden
        const savedPrompt = Storage.get('ai_system_prompt');
        if (savedPrompt) this.systemPrompt = savedPrompt;
        
        // Memory laden
        this.loadMemory();
        
        this.isReady = true;
        EventBus.emit('ai:ready', { 
            model: this.model,
            temperature: this.temperature,
            hasKey: !!this.apiKey
        });
        
        console.log('✅ AI Core ready');
        return this;
    },
    
    // ---- API-KEY ----
    setApiKey(key) {
        this.apiKey = key;
        Storage.set('groq_api_key', key);
        EventBus.emit('ai:key-changed', { hasKey: !!key });
        return this;
    },
    
    getApiKey() {
        return this.apiKey;
    },
    
    hasValidKey() {
        return this.apiKey && this.apiKey.startsWith('gsk_');
    },
    
    // ---- CHAT ----
    async chat(messages, options = {}) {
        if (this.isProcessing) {
            console.warn('⚠️ AI bereits am Verarbeiten');
            return null;
        }
        
        if (!this.hasValidKey()) {
            const errorMsg = '⚠️ Bitte trage deinen Groq API Key in den Settings ein! (AI & Memory)';
            EventBus.emit('ai:error', { error: 'missing_api_key', message: errorMsg });
            return errorMsg;
        }
        
        this.isProcessing = true;
        EventBus.emit('ai:processing', true);
        
        try {
            const fullMessages = [
                { role: 'system', content: this.systemPrompt },
                ...messages
            ];
            
            // Memory hinzufügen (Kontext)
            const context = this.getContext();
            if (context.length > 0) {
                // Kontext als System-Nachricht einfügen
                fullMessages.splice(1, 0, {
                    role: 'system',
                    content: `Kontext aus vorherigen Gesprächen:\n${context.join('\n')}`
                });
            }
            
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: options.model || this.model,
                    messages: fullMessages,
                    temperature: options.temperature || this.temperature,
                    max_tokens: options.maxTokens || this.maxTokens,
                    stream: options.stream || false
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `API-Fehler (${response.status})`);
            }
            
            const data = await response.json();
            const content = data.choices[0]?.message?.content || 'Entschuldigung, ich habe keine Antwort.';
            
            // Memory speichern
            this.addToMemory(messages, content);
            
            // Tools prüfen
            const toolResult = this.checkForTools(content);
            if (toolResult) {
                // Tool wurde erkannt und ausgeführt
                return toolResult;
            }
            
            this.isProcessing = false;
            EventBus.emit('ai:processing', false);
            EventBus.emit('ai:response', { content, messages });
            
            return content;
            
        } catch (error) {
            console.error('❌ AI Fehler:', error);
            this.isProcessing = false;
            EventBus.emit('ai:processing', false);
            EventBus.emit('ai:error', { error: error.message });
            return `❌ Fehler: ${error.message}`;
        }
    },
    
    // ---- SIMPLE CHAT ----
    async simpleChat(message, options = {}) {
        return this.chat([
            { role: 'user', content: message }
        ], options);
    },
    
    // ---- MEMORY ----
    addToMemory(messages, response) {
        // Short-Term Memory
        this.memory.shortTerm.push({
            timestamp: Date.now(),
            user: messages[messages.length - 1]?.content || '',
            assistant: response
        });
        
        if (this.memory.shortTerm.length > this.memory.maxShortTerm) {
            // Älteste ins Session-Memory verschieben
            const oldest = this.memory.shortTerm.shift();
            this.memory.session.push(oldest);
        }
        
        if (this.memory.session.length > this.memory.maxSession) {
            // Älteste ins Long-Term-Memory verschieben
            const oldest = this.memory.session.shift();
            this.memory.longTerm.push(oldest);
        }
        
        // Speichern
        this.saveMemory();
    },
    
    getContext(limit = 5) {
        const context = [];
        const all = [...this.memory.shortTerm, ...this.memory.session.slice(-10)];
        const recent = all.slice(-limit);
        
        for (const entry of recent) {
            if (entry.user) {
                context.push(`User: ${entry.user}`);
            }
            if (entry.assistant) {
                context.push(`HalDo: ${entry.assistant}`);
            }
        }
        return context;
    },
    
    getMemory(type = 'all') {
        switch(type) {
            case 'short': return this.memory.shortTerm;
            case 'session': return this.memory.session;
            case 'long': return this.memory.longTerm;
            default: return {
                shortTerm: this.memory.shortTerm,
                session: this.memory.session,
                longTerm: this.memory.longTerm
            };
        }
    },
    
    clearMemory(type = 'all') {
        if (type === 'all' || type === 'short') this.memory.shortTerm = [];
        if (type === 'all' || type === 'session') this.memory.session = [];
        if (type === 'all' || type === 'long') this.memory.longTerm = [];
        this.saveMemory();
        EventBus.emit('ai:memory-cleared', { type });
        return this;
    },
    
    saveMemory() {
        Storage.set('ai_short_memory', this.memory.shortTerm.slice(-20));
        Storage.set('ai_session_memory', this.memory.session.slice(-30));
        Storage.set('ai_long_memory', this.memory.longTerm.slice(-50));
    },
    
    loadMemory() {
        this.memory.shortTerm = Storage.get('ai_short_memory', []);
        this.memory.session = Storage.get('ai_session_memory', []);
        this.memory.longTerm = Storage.get('ai_long_memory', []);
    },
    
    // ---- APP-MEMORY ----
    setAppMemory(appId, key, value) {
        if (!this.memory.appMemory[appId]) {
            this.memory.appMemory[appId] = {};
        }
        this.memory.appMemory[appId][key] = value;
        Storage.set(`ai_app_memory_${appId}`, this.memory.appMemory[appId]);
        return this;
    },
    
    getAppMemory(appId, key = null) {
        const appData = this.memory.appMemory[appId] || {};
        if (key !== null) {
            return appData[key] || null;
        }
        return appData;
    },
    
    loadAppMemory(appId) {
        const data = Storage.get(`ai_app_memory_${appId}`, {});
        this.memory.appMemory[appId] = data;
        return data;
    },
    
    // ---- TOOLS ----
    checkForTools(text) {
        const lowerText = text.toLowerCase();
        
        // Tool-Erkennung basierend auf Schlüsselwörtern
        if (lowerText.includes('zusammenfassen') || lowerText.includes('summarize')) {
            const content = text.replace(/(zusammenfassen|summarize)\s*/i, '').trim();
            if (content) {
                return this.tools.summarize.execute(content);
            }
        }
        
        if (lowerText.includes('übersetzen') || lowerText.includes('translate')) {
            const content = text.replace(/(übersetzen|translate)\s*/i, '').trim();
            if (content) {
                return this.tools.translate.execute(content);
            }
        }
        
        if (lowerText.includes('analysieren') || lowerText.includes('analyze')) {
            const content = text.replace(/(analysieren|analyze)\s*/i, '').trim();
            if (content) {
                return this.tools.analyze.execute(content);
            }
        }
        
        if (lowerText.includes('erinnerung') || lowerText.includes('reminder')) {
            const content = text.replace(/(erinnerung|reminder)\s*/i, '').trim();
            if (content) {
                return this.tools.reminder.execute(content);
            }
        }
        
        if (lowerText.includes('notiz') || lowerText.includes('note')) {
            const content = text.replace(/(notiz|note)\s*/i, '').trim();
            if (content) {
                return this.tools.note.execute(content);
            }
        }
        
        if (lowerText.includes('code') || lowerText.includes('programmieren')) {
            const content = text.replace(/(code|programmieren)\s*/i, '').trim();
            if (content) {
                return this.tools.code.execute('javascript', content);
            }
        }
        
        return null;
    },
    
    // ---- AI-COMMANDS (App-Integration) ----
    async executeCommand(command) {
        const lower = command.toLowerCase();
        
        // App-öffnen-Befehle
        const appCommands = {
            'notizen': 'notes',
            'kalender': 'calendar',
            'einstellungen': 'settings',
            'dateien': 'file-manager',
            'browser': 'browser',
            'musik': 'music',
            'wetter': 'weather',
            'karten': 'maps',
            'kontakte': 'contacts',
            'nachrichten': 'messages',
            'email': 'email',
            'terminal': 'terminal',
            'rechner': 'calculator',
            'uhr': 'clock',
            'galerie': 'gallery'
        };
        
        for (const [key, appId] of Object.entries(appCommands)) {
            if (lower.includes(key)) {
                if (typeof AppManager !== 'undefined') {
                    AppManager.openApp(appId);
                    return `✅ ${appId} wurde geöffnet.`;
                }
                return '⚠️ AppManager nicht verfügbar.';
            }
        }
        
        // System-Befehle
        if (lower.includes('status') || lower.includes('system')) {
            const status = Kernel.getStatus ? Kernel.getStatus() : { version: Kernel.version };
            return `📊 System-Status:\nVersion: ${status.version}\nUptime: ${status.uptime || '0s'}\nApps: ${status.apps || '0'}`;
        }
        
        if (lower.includes('neustart') || lower.includes('reboot')) {
            Kernel.reboot();
            return '🔄 System wird neu gestartet...';
        }
        
        if (lower.includes('herunterfahren') || lower.includes('shutdown')) {
            Kernel.shutdown();
            return '⏹️ System wird heruntergefahren...';
        }
        
        return null;
    },
    
    // ---- SYSTEM-PROMPT ----
    setSystemPrompt(prompt) {
        this.systemPrompt = prompt;
        Storage.set('ai_system_prompt', prompt);
        EventBus.emit('ai:system-prompt-changed', { prompt });
        return this;
    },
    
    getSystemPrompt() {
        return this.systemPrompt;
    },
    
    // ---- MODELL ----
    setModel(model) {
        this.model = model;
        Storage.set('ai_model', model);
        EventBus.emit('ai:model-changed', { model });
        return this;
    },
    
    setTemperature(temp) {
        this.temperature = temp;
        Storage.set('ai_temperature', temp);
        EventBus.emit('ai:temperature-changed', { temperature: temp });
        return this;
    },
    
    // ---- STATUS ----
    getStatus() {
        return {
            isReady: this.isReady,
            isProcessing: this.isProcessing,
            hasKey: this.hasValidKey(),
            model: this.model,
            temperature: this.temperature,
            memorySize: {
                shortTerm: this.memory.shortTerm.length,
                session: this.memory.session.length,
                longTerm: this.memory.longTerm.length
            },
            tools: Object.keys(this.tools)
        };
    },
    
    // ---- VERSION ----
    getVersion() {
        return '1.0.0';
    }
};

// ---- AI CORE GLOBAL VERFÜGBAR MACHEN ----
window.AICore = AICore;

console.log('🧠 AI Core geladen – HalDo AI OS 24.6.0');
