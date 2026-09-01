/**
 * HALDO AI OS 24.6 – AI CORE
 * KI-Engine mit Groq API
 */

const AICore = {
    apiKey: '',  // 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

    model: 'mixtral-8x7b-32768',
    temperature: 0.7,
    maxTokens: 1024,
    isReady: false,
    isProcessing: false,

    // System-Prompt für HalDo
    systemPrompt: `Du bist HalDo, die lebendige KI-Assistentin des HalDo AI OS 24.6.
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
Antworte immer in der Sprache des Benutzers.`,

    init() {
        console.log('🧠 AI Core wird initialisiert...');

        // 🔥 WICHTIG: Der Key wird AUS DER UI GELADEN (Settings)
        // So bleibt er sicher und wird NIE im Code gespeichert!
        this.apiKey = Storage.get('groq_api_key', '');
        
        // FALLBACK für lokale Tests (NUR WENN DU WILLST):
        // if (!this.apiKey) {
        //     this.apiKey = 'gsk_DEIN_NEUER_KEY_HIER'; // <-- NUR LOKAL!
        // }
        
        this.temperature = Storage.get('ai_temperature', 0.7);
        this.model = Storage.get('ai_model', 'mixtral-8x7b-32768');

        const savedPrompt = Storage.get('ai_system_prompt');
        if (savedPrompt) this.systemPrompt = savedPrompt;

        this.isReady = true;
        EventBus.emit('ai:ready');
        console.log('✅ AI Core ready');
        return this;
    },

    setApiKey(key) {
        this.apiKey = key;
        Storage.set('groq_api_key', key);
        console.log('🔑 API Key gespeichert (lokal)');
        return this;
    },

    async chat(messages, options = {}) {
        if (!this.apiKey) {
            console.warn('⚠️ Kein API-Key für Groq – bitte in Settings eintragen!');
            return this.fallbackResponse(messages);
        }

        if (this.isProcessing) {
            console.warn('⚠️ AI bereits am Verarbeiten');
            return null;
        }

        this.isProcessing = true;
        EventBus.emit('ai:processing', true);

        try {
            const fullMessages = [
                { role: 'system', content: this.systemPrompt },
                ...messages
            ];

            console.log('📤 Sende Anfrage an Groq API...');

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
            const content = data.choices[0]?.message?.content || '';

            // Memory speichern
            if (options.saveMemory !== false) {
                AICore.saveToMemory(messages, content);
            }

            this.isProcessing = false;
            EventBus.emit('ai:processing', false);
            EventBus.emit('ai:response', { content, messages });

            return content;

        } catch (error) {
            console.error('❌ AI Fehler:', error);
            this.isProcessing = false;
            EventBus.emit('ai:error', error);
            return this.fallbackResponse(messages);
        }
    },

    fallbackResponse(messages) {
        const lastMessage = messages[messages.length - 1]?.content || '';
        return `Ich bin HalDo, deine KI-Assistentin. Leider ist die Verbindung zur AI-Cloud gerade nicht verfügbar. 
        
Hier sind einige Dinge, die ich trotzdem für dich tun kann:
- 📝 Notizen und Dokumente verwalten
- 🌌 Die Cosmic World erkunden
- 🎤 Sprachbefehle ausführen
- 📱 Apps öffnen und steuern

Frag mich einfach: "Öffne Notizen" oder "Zeige mir die Planeten"! 💙❤️🚀`;
    },

    async simpleChat(message, options = {}) {
        return this.chat([{ role: 'user', content: message }], options);
    },

    async analyzeText(text, type = 'general') {
        const prompts = {
            general: `Analysiere folgenden Text und fasse ihn zusammen:\n\n${text}`,
            sentiment: `Analysiere die Stimmung im folgenden Text:\n\n${text}`,
            summarize: `Fasse folgenden Text prägnant zusammen:\n\n${text}`,
            translate: `Übersetze folgenden Text ins Deutsche:\n\n${text}`
        };

        const prompt = prompts[type] || prompts.general;
        return this.simpleChat(prompt);
    },

    saveToMemory(messages, response) {
        const memory = Storage.get('ai_memory', []);
        memory.push({
            timestamp: Date.now(),
            messages: messages,
            response: response
        });

        if (memory.length > 100) {
            memory.splice(0, memory.length - 100);
        }

        Storage.set('ai_memory', memory);
    },

    getMemory(limit = 10) {
        const memory = Storage.get('ai_memory', []);
        return memory.slice(-limit);
    },

    clearMemory() {
        Storage.set('ai_memory', []);
        EventBus.emit('ai:memory-cleared');
        return this;
    },

    getContext() {
        const memory = this.getMemory(5);
        const context = memory.map(item => ({
            user: item.messages[item.messages.length - 1]?.content || '',
            assistant: item.response
        }));
        return context;
    }
};

window.AICore = AICore;
