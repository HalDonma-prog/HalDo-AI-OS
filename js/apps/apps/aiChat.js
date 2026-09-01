/**
 * HALDO AI OS 24.6 – AI CHAT APP
 * Vollständiger Chat mit HalDo AI
 */

const AIChatApp = {
    id: 'ai-chat',
    name: 'AI Chat',
    icon: '💬',
    category: 'AI',
    
    // Zustand
    messages: [],
    isProcessing: false,
    
    // DOM-Referenzen
    container: null,
    messagesContainer: null,
    inputField: null,
    
    // ---- ÖFFNEN ----
    
    open(params = {}) {
        console.log('💬 AI Chat wird geöffnet...');
        
        // Fenster erstellen
        const content = this.render();
        const windowEl = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 500,
            params.height || 600
        );
        
        if (windowEl) {
            this.container = windowEl.querySelector('.window-body');
            this.messagesContainer = this.container.querySelector('#ai-chat-messages');
            this.inputField = this.container.querySelector('#ai-chat-input');
            
            // Event-Listener
            this.setupListeners();
            
            // Willkommensnachricht
            this.addMessage('system', '💙 Hallo! Ich bin HalDo, deine KI-Assistentin. Stelle mir eine Frage!');
        }
    },
    
    // ---- RENDER ----
    
    render() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;padding:0;">
                <div id="ai-chat-messages" style="flex:1;overflow-y:auto;padding:12px;margin-bottom:8px;">
                    <!-- Nachrichten erscheinen hier -->
                </div>
                <div style="display:flex;gap:8px;padding:8px 12px;border-top:1px solid var(--glass-border);">
                    <input id="ai-chat-input" type="text" placeholder="Nachricht an HalDo..." style="
                        flex:1;
                        padding:10px 14px;
                        background:var(--glass-bg);
                        border:1px solid var(--glass-border);
                        border-radius:12px;
                        color:var(--text-primary);
                        font-family:var(--font-primary);
                        outline:none;
                        font-size:14px;
                    ">
                    <button id="ai-chat-send" style="
                        padding:10px 18px;
                        background:var(--primary);
                        border:none;
                        border-radius:12px;
                        color:white;
                        cursor:pointer;
                        font-family:var(--font-primary);
                        font-size:14px;
                        transition:all var(--transition-fast);
                    ">📤 Senden</button>
                    <button id="ai-chat-voice" style="
                        padding:10px 14px;
                        background:var(--glass-bg);
                        border:1px solid var(--glass-border);
                        border-radius:12px;
                        color:var(--text-secondary);
                        cursor:pointer;
                        font-size:16px;
                        transition:all var(--transition-fast);
                    ">🎤</button>
                </div>
            </div>
        `;
    },
    
    // ---- EVENT LISTENER ----
    
    setupListeners() {
        // Senden-Button
        const sendBtn = this.container.querySelector('#ai-chat-send');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Enter-Taste
        if (this.inputField) {
            this.inputField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
        
        // Voice-Button
        const voiceBtn = this.container.querySelector('#ai-chat-voice');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                if (typeof VoiceSystem !== 'undefined') {
                    VoiceSystem.toggleListening();
                }
            });
        }
    },
    
    // ---- NACHRICHT SENDEN ----
    
    async sendMessage() {
        if (!this.inputField || this.isProcessing) return;
        
        const text = this.inputField.value.trim();
        if (!text) return;
        
        this.inputField.value = '';
        this.isProcessing = true;
        
        // Benutzernachricht anzeigen
        this.addMessage('user', text);
        
        // Lade-Indikator
        const loadingId = this.addMessage('system', '💭 HalDo denkt nach...');
        
        try {
            // KI-Antwort holen
            let response;
            if (typeof AICore !== 'undefined' && AICore.apiKey) {
                response = await AICore.simpleChat(text);
            } else {
                response = this.fallbackResponse(text);
            }
            
            // Lade-Indikator entfernen
            this.removeMessage(loadingId);
            
            // Antwort anzeigen
            this.addMessage('assistant', response || 'Keine Antwort');
            
            // Sprachausgabe
            if (typeof VoiceSystem !== 'undefined' && response) {
                VoiceSystem.speak(response);
            }
            
        } catch (error) {
            console.error('❌ Chat-Fehler:', error);
            this.removeMessage(loadingId);
            this.addMessage('system', '❌ Fehler bei der Anfrage. Bitte versuche es später nochmal.');
        }
        
        this.isProcessing = false;
    },
    
    // ---- NACHRICHT HINZUFÜGEN ----
    
    addMessage(role, content) {
        const id = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
        
        const div = document.createElement('div');
        div.id = id;
        div.style.cssText = `
            margin: 6px 0;
            padding: 10px 14px;
            border-radius: 12px;
            max-width: 85%;
            word-wrap: break-word;
            animation: fadeIn 0.2s ease;
        `;
        
        // Styling je nach Rolle
        switch(role) {
            case 'user':
                div.style.background = 'var(--primary)';
                div.style.color = 'white';
                div.style.alignSelf = 'flex-end';
                div.style.marginLeft = 'auto';
                div.textContent = '🧑 ' + content;
                break;
            case 'assistant':
                div.style.background = 'var(--glass-bg)';
                div.style.color = 'var(--text-primary)';
                div.style.border = '1px solid var(--glass-border)';
                div.style.alignSelf = 'flex-start';
                div.textContent = '💙 ' + content;
                break;
            case 'system':
                div.style.background = 'rgba(255,255,255,0.03)';
                div.style.color = 'var(--text-muted)';
                div.style.textAlign = 'center';
                div.style.fontSize = '13px';
                div.style.maxWidth = '100%';
                div.textContent = content;
                break;
        }
        
        if (this.messagesContainer) {
            this.messagesContainer.appendChild(div);
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
        
        this.messages.push({ id, role, content });
        return id;
    },
    
    removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
        this.messages = this.messages.filter(m => m.id !== id);
    },
    
    // ---- FALLBACK ----
    
    fallbackResponse(text) {
        const responses = [
            `Interessante Frage! Ich bin HalDo und helfe dir gerne weiter. 
            
Hier sind ein paar Dinge, die ich für dich tun kann:
- 📝 Notizen schreiben
- 🌌 Die Planeten erkunden
- 🎤 Sprachbefehle ausführen
- 📱 Apps öffnen

Was möchtest du als Nächstes tun?`,
            `Gute Frage! Um diese Frage richtig zu beantworten, brauche ich Zugang zur KI-Cloud. 
            
Trag bitte deinen Groq API Key in den Settings ein (AI & Memory) – dann kann ich dir alles beantworten!`,
            `Das ist eine spannende Frage! Ich würde gerne mehr darüber wissen. 
            
Kannst du mir mehr Details geben? Oder möchtest du lieber eine andere App öffnen?`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
};

// App registrieren
if (typeof AppRegistry !== 'undefined') {
    AppRegistry.register({
        id: 'ai-chat',
        name: 'AI Chat',
        icon: '💬',
        category: 'AI',
        description: 'Chat mit HalDo AI',
        open: (params) => AIChatApp.open(params),
        start: (params) => AIChatApp.open(params)
    });
}

// Global verfügbar machen
window.AIChatApp = AIChatApp;
