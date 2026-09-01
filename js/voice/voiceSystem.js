/**
 * HALDO AI OS 24.6 – VOICE SYSTEM
 * Speech Recognition + TTS + Multi-Profile
 */

const VoiceSystem = {
    activeProfiles: [],
    currentProfileIndex: 0,
    recognition: null,
    synth: null,
    isListening: false,
    isSpeaking: false,

    availableProfiles: {
        'de-male': { id: 'de-male', language: 'de', gender: 'male', label: '🇩🇪 Deutsch – Mann', rate: 1.0, pitch: 0.9 },
        'de-female': { id: 'de-female', language: 'de', gender: 'female', label: '🇩🇪 Deutsch – Frau', rate: 1.0,
        pitch: 1.2 },
        'en-male': { id: 'en-male', language: 'en', gender: 'male', label: '🇬🇧 English – Male', rate: 1.0, pitch: 0.9 },
        'en-female': { id: 'en-female', language: 'en', gender: 'female', label: '🇬🇧 English – Female', rate: 1.0,
            pitch: 1.1 },
        'ku-male': { id: 'ku-male', language: 'ku', gender: 'male', label: '🏴 Kurmancî – Mêr', rate: 1.0, pitch: 0.9 },
        'ku-female': { id: 'ku-female', language: 'ku', gender: 'female', label: '🏴 Kurmancî – Jin', rate: 1.0,
        pitch: 1.1 },
        'ez-male': { id: 'ez-male', language: 'ez', gender: 'male', label: '🏴 Êzîdî – Mêr', rate: 1.0, pitch: 0.9 },
        'ez-female': { id: 'ez-female', language: 'ez', gender: 'female', label: '🏴 Êzîdî – Jin', rate: 1.0,
        pitch: 1.1 },
        'tr-male': { id: 'tr-male', language: 'tr', gender: 'male', label: '🇹🇷 Türkçe – Erkek', rate: 1.0, pitch: 0.9 },
        'tr-female': { id: 'tr-female', language: 'tr', gender: 'female', label: '🇹🇷 Türkçe – Kadın', rate: 1.0,
            pitch: 1.1 },
        'ar-male': { id: 'ar-male', language: 'ar', gender: 'male', label: '🇸🇦 العربية – رجل', rate: 1.0, pitch: 0.9 },
        'ar-female': { id: 'ar-female', language: 'ar', gender: 'female', label: '🇸🇦 العربية – امرأة', rate: 1.0,
            pitch: 1.1 },
        'fr-male': { id: 'fr-male', language: 'fr', gender: 'male', label: '🇫🇷 Français – Homme', rate: 1.0, pitch: 0.9 },
        'fr-female': { id: 'fr-female', language: 'fr', gender: 'female', label: '🇫🇷 Français – Femme', rate: 1.0,
            pitch: 1.1 },
        'es-male': { id: 'es-male', language: 'es', gender: 'male', label: '🇪🇸 Español – Hombre', rate: 1.0, pitch: 0.9 },
        'es-female': { id: 'es-female', language: 'es', gender: 'female', label: '🇪🇸 Español – Mujer', rate: 1.0,
            pitch: 1.1 },
        'ru-male': { id: 'ru-male', language: 'ru', gender: 'male', label: '🇷🇺 Русский – Мужчина', rate: 1.0,
        pitch: 0.9 },
        'ru-female': { id: 'ru-female', language: 'ru', gender: 'female', label: '🇷🇺 Русский – Женщина', rate: 1.0,
            pitch: 1.1 },
        'fa-male': { id: 'fa-male', language: 'fa', gender: 'male', label: '🇮🇷 فارسی – مرد', rate: 1.0, pitch: 0.9 },
        'fa-female': { id: 'fa-female', language: 'fa', gender: 'female', label: '🇮🇷 فارسی – زن', rate: 1.0,
        pitch: 1.1 },
        'it-male': { id: 'it-male', language: 'it', gender: 'male', label: '🇮🇹 Italiano – Uomo', rate: 1.0, pitch: 0.9 },
        'it-female': { id: 'it-female', language: 'it', gender: 'female', label: '🇮🇹 Italiano – Donna', rate: 1.0,
            pitch: 1.1 },
        'pt-male': { id: 'pt-male', language: 'pt', gender: 'male', label: '🇵🇹 Português – Homem', rate: 1.0,
        pitch: 0.9 },
        'pt-female': { id: 'pt-female', language: 'pt', gender: 'female', label: '🇵🇹 Português – Mulher', rate: 1.0,
            pitch: 1.1 }
    },

    init() {
        console.log('🎤 Voice System wird initialisiert...');

        // Gespeicherte Profile laden
        const saved = Storage.get('voice_profiles');
        if (saved && Array.isArray(saved) && saved.length > 0) {
            this.activeProfiles = saved;
        } else {
            this.setDefaultProfiles();
        }

        // Speech Recognition
        this.initSpeechRecognition();

        // TTS
        this.initTTS();

        // Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'v' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
                e.preventDefault();
                this.cycleProfile();
            }
        });

        // UI aktualisieren
        this.updateUI();

        console.log(`✅ Voice System ready – ${this.activeProfiles.length} Profile aktiv`);
        return this;
    },

    setDefaultProfiles() {
        this.activeProfiles = [
            this.availableProfiles['de-female'],
            this.availableProfiles['en-male'],
            this.availableProfiles['ku-female']
        ].filter(Boolean);
        this.saveProfiles();
    },

    // ---- PROFILES ----

    getCurrentProfile() {
        return this.activeProfiles[this.currentProfileIndex] || this.activeProfiles[0];
    },

    getProfileById(id) {
        return this.availableProfiles[id] || null;
    },

    addProfile(profileId) {
        const profile = this.getProfileById(profileId);
        if (!profile) return false;
        if (this.activeProfiles.length >= 4) {
            console.warn('⚠️ Maximal 4 Profile erlaubt');
            return false;
        }
        if (this.activeProfiles.find(p => p.id === profileId)) {
            console.warn('⚠️ Profil bereits aktiv');
            return false;
        }
        this.activeProfiles.push(profile);
        this.saveProfiles();
        EventBus.emit('voice:profiles-updated', this.activeProfiles);
        this.updateUI();
        return true;
    },

    removeProfile(profileId) {
        if (this.activeProfiles.length <= 1) {
            console.warn('⚠️ Mindestens 1 Profil muss aktiv sein');
            return false;
        }
        this.activeProfiles = this.activeProfiles.filter(p => p.id !== profileId);
        if (this.currentProfileIndex >= this.activeProfiles.length) {
            this.currentProfileIndex = 0;
        }
        this.saveProfiles();
        EventBus.emit('voice:profiles-updated', this.activeProfiles);
        this.updateUI();
        return true;
    },

    cycleProfile() {
        this.currentProfileIndex = (this.currentProfileIndex + 1) % this.activeProfiles.length;
        const profile = this.getCurrentProfile();

        // Sprache in der Taskbar anzeigen
        this.updateUI();

        EventBus.emit('voice:profile-changed', profile);
        console.log(`🔊 Stimme gewechselt: ${profile.label}`);

        // Kurze Sprachausgabe zur Bestätigung
        this.speak('Hallo, ich bin HalDo.', profile);

        return profile;
    },

    saveProfiles() {
        Storage.set('voice_profiles', this.activeProfiles);
    },

    updateUI() {
        const profile = this.getCurrentProfile();
        const voiceEl = document.getElementById('taskbar-voice');
        if (voiceEl) {
            const icon = profile.gender === 'male' ? '👨' : '👩';
            voiceEl.textContent = `${icon} ${profile.language.toUpperCase()}`;
            voiceEl.title = profile.label;
        }
    },

    // ---- SPEECH RECOGNITION ----

    initSpeechRecognition() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            console.warn('⚠️ Speech Recognition nicht unterstützt');
            return;
        }

        this.recognition = new SR();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event) => {
            let final = '';
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += transcript;
                } else {
                    interim += transcript;
                }
            }
            if (final) {
                EventBus.emit('voice:final', {
                    text: final,
                    language: this.getCurrentProfile().language
                });
                console.log(`🎤 Erkannt:`, final);
                // An AI senden
                if (typeof AICore !== 'undefined') {
                    AICore.simpleChat(final).then(response => {
                        if (response) {
                            this.speak(response);
                            // In AI-Chat anzeigen
                            EventBus.emit('ai:response', { content: response });
                        }
                    });
                }
            }
            if (interim) {
                EventBus.emit('voice:interim', { text: interim });
            }
        };

        this.recognition.onerror = (event) => {
            console.warn('⚠️ Speech Error:', event.error);
            EventBus.emit('voice:error', { error: event.error });
            if (event.error === 'not-allowed') {
                console.warn('🔇 Mikrofonzugriff verweigert');
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            EventBus.emit('voice:listening', false);
            // Bei kontinuierlichem Modus neu starten
            if (this.recognition && !this.isListening) {
                // Nicht automatisch neu starten
            }
        };
    },

    startListening() {
        if (!this.recognition) {
            console.warn('⚠️ Speech Recognition nicht verfügbar');
            return;
        }
        try {
            this.recognition.lang = this.getCurrentProfile().language;
            this.recognition.start();
            this.isListening = true;
            EventBus.emit('voice:listening', true);
            console.log('🎤 Höre zu...');
        } catch (e) {
            console.warn('⚠️ Recognition start fehlgeschlagen:', e);
        }
    },

    stopListening() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
                this.isListening = false;
                EventBus.emit('voice:listening', false);
                console.log('🎤 Hört auf');
            } catch (e) {
                console.warn('⚠️ Recognition stop fehlgeschlagen:', e);
            }
        }
    },

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    },

    // ---- TEXT TO SPEECH ----

    initTTS() {
        this.synth = window.speechSynthesis;
        if (!this.synth) {
            console.warn('⚠️ TTS nicht unterstützt');
            return;
        }
        // Voices laden
        this.synth.onvoiceschanged = () => {
            this.voices = this.synth.getVoices();
            console.log(`🔊 ${this.voices.length} Stimmen geladen`);
        };
        this.voices = this.synth.getVoices() || [];
        console.log('🔊 TTS ready');
    },

    speak(text, profile = null) {
        if (!this.synth) {
            console.warn('⚠️ TTS nicht verfügbar');
            return;
        }

        const profileToUse = profile || this.getCurrentProfile();
        if (!profileToUse) {
            console.warn('⚠️ Kein Sprachprofil');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = profileToUse.language;
        utterance.rate = profileToUse.rate || 1.0;
        utterance.pitch = profileToUse.pitch || 1.0;

        // Beste verfügbare Stimme finden
        if (this.voices && this.voices.length > 0) {
            const matched = this.voices.find(v =>
                v.lang.startsWith(profileToUse.language) &&
                (profileToUse.gender === 'male' ?
                    v.name.toLowerCase().includes('male') || v.name.includes('Mann') :
                    v.name.toLowerCase().includes('female') || v.name.includes('Frau'))
            );
            if (matched) {
                utterance.voice = matched;
            }
        }

        utterance.onstart = () => {
            this.isSpeaking = true;
            EventBus.emit('voice:speaking', true);
            console.log(`🔊 Spreche (${profileToUse.label}):`, text);
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            EventBus.emit('voice:speaking', false);
        };

        utterance.onerror = (e) => {
            console.error('❌ TTS Error:', e);
            this.isSpeaking = false;
            EventBus.emit('voice:speaking', false);
        };

        this.synth.speak(utterance);
    },

    // ---- SHORTCUTS ----

    getShortcuts() {
        return {
            'Cmd+Shift+V': 'Stimme wechseln (nächstes Profil)',
            'Cmd+Shift+L': 'Sprache wechseln',
            'Cmd+K': 'AI öffnen'
        };
    }
};

window.VoiceSystem = VoiceSystem;
