/**
 * HALDO AI OS 24.6.0 – AI CORE (KURZVERSION)
 */
const AICore = {
    apiKey: '',
    model: 'mixtral-8x7b-32768',
    temperature: 0.7,
    isReady: false,

    init() {
        console.log('🧠 AI Core wird initialisiert...');
        this.apiKey = Storage.get('groq_api_key', '');
        this.temperature = Storage.get('ai_temperature', 0.7);
        this.model = Storage.get('ai_model', 'mixtral-8x7b-32768');
        this.isReady = true;
        EventBus.emit('ai:ready');
        return this;
    },

    setApiKey(key) { this.apiKey = key;
        Storage.set('groq_api_key', key); return this; },

    hasValidKey() { return this.apiKey && this.apiKey.startsWith('gsk_'); },

    async chat(messages, options = {}) {
        if (!this.hasValidKey()) {
            return '⚠️ Bitte trage deinen Groq API Key in den Settings ein! (AI & Memory)';
        }
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
                body: JSON.stringify({
                    model: options.model || this.model,
                    messages: messages,
                    temperature: options.temperature || this.temperature,
                    max_tokens: options.maxTokens || 600,
                    stream: false
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `API-Fehler (${response.status})`);
            }
            const data = await response.json();
            const content = data.choices[0]?.message?.content || 'Entschuldigung, ich habe keine Antwort.';

            const memory = Storage.get('ai_memory', []);
            memory.push({ user: messages[messages.length - 1]?.content || '', assistant: content, time: Date
                .now() });
            if (memory.length > 50) memory.shift();
            Storage.set('ai_memory', memory);

            return content;

        } catch (error) {
            console.error('❌ AI Fehler:', error);
            return `❌ Fehler: ${error.message}`;
        }
    },

    async simpleChat(message) {
        return this.chat([
            { role: 'system', content: 'Du bist HalDo, eine freundliche, intelligente KI-Assistentin. Du sprichst wie ein Mensch, bist einfühlsam, hilfsbereit und professionell. Antworte immer in der Sprache des Benutzers.' },
            { role: 'user', content: message }
        ]);
    }
};
window.AICore = AICore;
