// ================================================================
//  HALDO VOICE — Sprachsteuerung
//  TEIL 11/30
// ================================================================

var HalDoVoice = {
    isListening: false,
    isSpeaking: false,
    recognition: null,
    synthesis: window.speechSynthesis,

    init: function() {
        // Prüfe ob Speech Recognition verfügbar ist
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'de-DE';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            this.recognition.onresult = this.onResult.bind(this);
            this.recognition.onerror = this.onError.bind(this);
            this.recognition.onend = this.onEnd.bind(this);

            console.log('[Voice] Speech Recognition bereit');
        } else {
            console.log('[Voice] Speech Recognition nicht unterstützt');
        }

        // Prüfe ob Speech Synthesis verfügbar ist
        if ('speechSynthesis' in window) {
            console.log('[Voice] Speech Synthesis bereit');
        } else {
            console.log('[Voice] Speech Synthesis nicht unterstützt');
        }
    },

    startListening: function() {
        if (!this.recognition) {
            if (window.HalDoNotify) window.HalDoNotify('❌ Sprachsteuerung nicht unterstützt', 'error');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
            return;
        }

        try {
            this.recognition.start();
            this.isListening = true;
            if (window.HalDoNotify) window.HalDoNotify('🎤 Höre zu ...', 'info');
            this.updateAIStatus('listening', '🎤 hört zu ...');
        } catch (e) {
            console.log('[Voice] Fehler beim Starten:', e);
        }
    },

    stopListening: function() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (e) {}
            this.isListening = false;
            this.updateAIStatus('idle', '● bereit');
        }
    },

    onResult: function(event) {
        var result = event.results[0][0].transcript;
        console.log('[Voice] Verstanden:', result);
        this.isListening = false;
        this.updateAIStatus('thinking', '🧠 denkt ...');

        if (window.HalDoNotify) window.HalDoNotify('🎤 "' + result + '"', 'success');

        // Sende an AI
        var input = document.getElementById('ai-input');
        if (input) {
            input.value = result;
            var sendBtn = document.getElementById('ai-send');
            if (sendBtn) {
                sendBtn.click();
            }
        }
    },

    onError: function(event) {
        console.log('[Voice] Fehler:', event.error);
        this.isListening = false;
        this.updateAIStatus('idle', '● bereit');

        if (event.error === 'not-allowed') {
            if (window.HalDoNotify) window.HalDoNotify('❌ Mikrofon-Zugriff verweigert', 'error');
        } else if (event.error === 'no-speech') {
            if (window.HalDoNotify) window.HalDoNotify('⏳ Keine Sprache erkannt', 'warning');
        } else {
            if (window.HalDoNotify) window.HalDoNotify('❌ Fehler: ' + event.error, 'error');
        }
    },

    onEnd: function() {
        this.isListening = false;
        this.updateAIStatus('idle', '● bereit');
    },

    speak: function(text, language) {
        language = language || 'de-DE';

        if (!('speechSynthesis' in window)) {
            console.log('[Voice] Speech Synthesis nicht verfügbar');
            return;
        }

        // Aktuelle Sprache stoppen
        if (this.isSpeaking) {
            this.synthesis.cancel();
        }

        this.isSpeaking = true;
        this.updateAIStatus('speaking', '🔊 spricht ...');

        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1;

        utterance.onend = function() {
            this.isSpeaking = false;
            this.updateAIStatus('idle', '● bereit');
        }.bind(this);

        utterance.onerror = function() {
            this.isSpeaking = false;
            this.updateAIStatus('idle', '● bereit');
            console.log('[Voice] Speech Fehler');
        }.bind(this);

        this.synthesis.speak(utterance);
    },

    updateAIStatus: function(state, text) {
        var statusDot = document.getElementById('ai-status-dot');
        var statusText = document.getElementById('ai-status-text');

        if (statusDot) {
            statusDot.className = '';
            if (state === 'thinking') {
                statusDot.classList.add('thinking');
            } else if (state === 'listening') {
                statusDot.classList.add('listening');
            } else if (state === 'speaking') {
                statusDot.classList.add('speaking');
            }
        }

        if (statusText) {
            statusText.textContent = text || '● bereit';
        }

        // Auch in der AI App Status aktualisieren
        var aiState = document.getElementById('ai-state');
        if (aiState) {
            aiState.textContent = text || '● bereit';
            if (state === 'thinking') {
                aiState.style.color = '#ffcc00';
            } else if (state === 'listening') {
                aiState.style.color = '#44aaff';
            } else if (state === 'speaking') {
                aiState.style.color = '#44ff88';
            } else {
                aiState.style.color = '#44ff88';
            }
        }
    },

    // Voice Button in AI App hinzufügen
    addVoiceButton: function() {
        // Wird in der AI App bereits eingebaut
    }
};
