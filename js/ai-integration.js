// ================================================================
//  HALDO AI INTEGRATION — AI in alle Apps
//  TEIL 18/30
// ================================================================

var HalDoAIIntegration = {
    init: function() {
        this.enhanceAIApp();
        this.addAIToMail();
        this.addAIToChat();
        this.addAIToContacts();
        this.addAIToNotes();
        console.log('[AI Integration] AI in alle Apps integriert');
    },

    // ===== AI APP ENHANCED =====
    enhanceAIApp: function() {
        // Die AI App wird bereits in system.js definiert
        // Wir erweitern sie um bessere Antworten und Voice
        var originalRender = window.HalDoState.apps['ai']?.render;
        if (originalRender) {
            window.HalDoState.apps['ai'].render = function(body) {
                // Erweiterte AI App mit Voice und besserem UI
                body.innerHTML = `
                    <div style="display:flex;flex-direction:column;height:100%;gap:8px;">
                        <div style="display:flex;align-items:center;gap:10px;padding:6px 10px;background:rgba(0,212,255,0.06);border-radius:10px;">
                            <div style="font-size:1.5rem;">🧠</div>
                            <div>
                                <div style="font-weight:600;font-size:0.85rem;">HalDo AI 24</div>
                                <div style="font-size:0.7rem;color:#8899bb;" id="ai-state">● bereit</div>
                            </div>
                            <div style="margin-left:auto;display:flex;gap:6px;">
                                <button id="ai-voice-btn" style="background:none;border:none;color:#8899bb;font-size:1.2rem;cursor:pointer;" title="Spracheingabe">🎤</button>
                                <button id="ai-speak-btn" style="background:none;border:none;color:#8899bb;font-size:1.2rem;cursor:pointer;" title="Vorlesen">🔊</button>
                            </div>
                        </div>
                        <div style="flex:1;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:10px;padding:10px;max-height:280px;" id="ai-chat">
                            <div style="color:#8899bb;text-align:center;">💬 Hallo! Ich bin HalDo 24. Frage mich alles!</div>
                        </div>
                        <div style="display:flex;gap:6px;">
                            <input type="text" id="ai-input" placeholder="Frage ..." style="flex:1;" />
                            <button id="ai-send">Senden</button>
                        </div>
                        <div style="display:flex;gap:4px;flex-wrap:wrap;">
                            <button class="ai-q" data-cmd="Erzähl mir über Êzîdî">🟡 Êzîdî</button>
                            <button class="ai-q" data-cmd="Was ist die Quantenmechanik?">⚛️ Quanten</button>
                            <button class="ai-q" data-cmd="Erkläre die Relativitätstheorie">🌌 Relativität</button>
                            <button class="ai-q" data-cmd="Was ist Philosophie?">🤔 Philosophie</button>
                            <button class="ai-q" data-cmd="Hilfe">❓ Hilfe</button>
                            <button class="ai-q" data-cmd="Öffne Mail">✉️</button>
                            <button class="ai-q" data-cmd="Öffne Chat">💬</button>
                            <button class="ai-q" data-cmd="Öffne Einstellungen">⚙️</button>
                        </div>
                        <div style="font-size:0.55rem;color:#44ff88;text-align:center;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">✅ Groq AI aktiv · Voice aktiv</div>
                    </div>
                `;

                var chat = body.querySelector('#ai-chat');
                var input = body.querySelector('#ai-input');
                var sendBtn = body.querySelector('#ai-send');
                var stateEl = body.querySelector('#ai-state');
                var voiceBtn = body.querySelector('#ai-voice-btn');
                var speakBtn = body.querySelector('#ai-speak-btn');

                function addMsg(role, text) {
                    var d = document.createElement('div');
                    d.style.cssText = 'padding:4px 8px;margin:2px 0;border-radius:6px;' + (role === 'user' ?
                        'background:rgba(0,212,255,0.1);text-align:right;' :
                        'background:rgba(123,47,252,0.1);');
                    d.textContent = (role === 'user' ? '👤 ' : '🤖 ') + text;
                    chat.appendChild(d);
                    chat.scrollTop = chat.scrollHeight;
                }

                function process(cmd) {
                    addMsg('user', cmd);
                    stateEl.textContent = '🧠 denkt ...';
                    stateEl.style.color = '#ffcc00';

                    // Erweiterte Antwort-Generierung
                    var enhancedResponse = window.HalDoAIEnhanced.getResponse(cmd);

                    // Versuche Groq API
                    window.HalDoAI.ask(cmd, window.HalDoState.settings.language || 'de').then(function(response) {
                        addMsg('ai', response);
                        window.HalDoState.aiMemory.push({ role: 'user', content: cmd });
                        window.HalDoState.aiMemory.push({ role: 'ai', content: response });
                        stateEl.textContent = '● bereit';
                        stateEl.style.color = '#44ff88';

                        // Automatisch vorlesen
                        if (window.HalDoVoice) {
                            window.HalDoVoice.speak(response, window.HalDoState.settings.language || 'de');
                        }
                    }).catch(function() {
                        // Fallback auf lokale Wissensdatenbank
                        addMsg('ai', enhancedResponse);
                        stateEl.textContent = '● bereit';
                        stateEl.style.color = '#44ff88';
                        if (window.HalDoVoice) {
                            window.HalDoVoice.speak(enhancedResponse, window.HalDoState.settings.language ||
                                'de');
                        }
                    });

                    // App-Befehle erkennen
                    if (cmd.includes('Mail') || cmd.includes('mail')) {
                        setTimeout(function() { if (window.HalDoWindow) HalDoWindow.launch('email'); }, 300);
                    } else if (cmd.includes('Chat') || cmd.includes('chat')) {
                        setTimeout(function() { if (window.HalDoWindow) HalDoWindow.launch('messages'); }, 300);
                    } else if (cmd.includes('Einstellungen') || cmd.includes('Settings')) {
                        setTimeout(function() { if (window.HalDoWindow) HalDoWindow.launch('settings'); }, 300);
                    } else if (cmd.includes('Kontakte') || cmd.includes('Contacts')) {
                        setTimeout(function() { if (window.HalDoWindow) HalDoWindow.launch('contacts'); }, 300);
                    } else if (cmd.includes('Dateien') || cmd.includes('Files')) {
                        setTimeout(function() { if (window.HalDoWindow) HalDoWindow.launch('files'); }, 300);
                    } else if (cmd.includes('Cosmic') || cmd.includes('Weltraum')) {
                        setTimeout(function() { if (window.HalDoWindow) HalDoWindow.launch('cosmic'); }, 300);
                    }
                }

                sendBtn.addEventListener('click', function() {
                    var v = input.value.trim();
                    if (v) { process(v);
                        input.value = ''; }
                });

                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') sendBtn.click();
                });

                // Quick Buttons
                var qs = body.querySelectorAll('.ai-q');
                for (var i = 0; i < qs.length; i++) {
                    (function(b) {
                        b.addEventListener('click', function() {
                            input.value = b.dataset.cmd;
                            sendBtn.click();
                        });
                    })(qs[i]);
                }

                // Voice Button
                if (voiceBtn && window.HalDoVoice) {
                    voiceBtn.addEventListener('click', function() {
                        window.HalDoVoice.startListening();
                    });
                }

                // Speak Button (Text vorlesen)
                if (speakBtn) {
                    speakBtn.addEventListener('click', function() {
                        var lastMsg = chat.querySelector('div:last-child');
                        if (lastMsg && lastMsg.textContent.startsWith('🤖')) {
                            var text = lastMsg.textContent.replace('🤖 ', '');
                            if (window.HalDoVoice) {
                                window.HalDoVoice.speak(text, window.HalDoState.settings.language ||
                                'de');
                            }
                        }
                    });
                }
            };
        }
    },

    // ===== AI IN MAIL =====
    addAIToMail: function() {
        // Mail App um AI-Funktionen erweitern
        var originalRender = window.HalDoState.apps['email']?.render;
        if (originalRender) {
            var self = this;
            window.HalDoState.apps['email'].render = function(body) {
                // Rufe originale Render-Funktion auf
                if (window.HalDoMail) {
                    window.HalDoMail.render(body);

                    // AI-Button hinzufügen
                    var aiBtn = document.createElement('button');
                    aiBtn.textContent = '🤖 AI schreiben';
                    aiBtn.style.cssText =
                        'padding:4px 12px;background:rgba(123,47,252,0.3);border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:0.7rem;';
                    aiBtn.addEventListener('click', function() {
                        var subject = prompt('📝 Betreff für die E-Mail:');
                        if (subject !== null) {
                            var prompt = 'Schreibe eine professionelle E-Mail mit dem Betreff "' +
                                subject + '". Die E-Mail sollte höflich, klar und präzise sein.';
                            window.HalDoAI.ask(prompt, window.HalDoState.settings.language || 'de')
                                .then(function(response) {
                                    if (window.HalDoNotify) window.HalDoNotify(
                                        '📧 E-Mail-Entwurf erstellt!', 'success');
                                    // In Zwischenablage kopieren
                                    navigator.clipboard.writeText(response).then(function() {
                                        if (window.HalDoNotify) window.HalDoNotify(
                                            '📋 In Zwischenablage kopiert!', 'success');
                                    });
                                });
                        }
                    });

                    var header = body.querySelector('.window-header');
                    if (header) {
                        var controls = header.querySelector('.window-controls');
                        if (controls) {
                            controls.appendChild(aiBtn);
                        }
                    }
                }
            };
        }
    },

    // ===== AI IN CHAT =====
    addAIToChat: function() {
        // Chat App um AI-Funktionen erweitern
        var originalRender = window.HalDoState.apps['messages']?.render;
        if (originalRender) {
            window.HalDoState.apps['messages'].render = function(body) {
                if (window.HalDoChat) {
                    window.HalDoChat.render(body);

                    // AI-Antwort-Button in Chat hinzufügen
                    var aiBtn = document.createElement('button');
                    aiBtn.textContent = '🤖 AI Antwort';
                    aiBtn.style.cssText =
                        'padding:4px 12px;background:rgba(123,47,252,0.3);border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:0.7rem;';
                    aiBtn.addEventListener('click', function() {
                        var question = prompt('💬 Was soll HalDo AI antworten?');
                        if (question) {
                            window.HalDoAI.ask(question, window.HalDoState.settings.language || 'de')
                                .then(function(response) {
                                    if (window.HalDoNotify) window.HalDoNotify(
                                        '💬 AI-Antwort: ' + response.substring(0, 50) + '...',
                                        'success');
                                    // In Zwischenablage kopieren
                                    navigator.clipboard.writeText(response).then(function() {
                                        if (window.HalDoNotify) window.HalDoNotify(
                                            '📋 In Zwischenablage kopiert!', 'success');
                                    });
                                });
                        }
                    });

                    var header = body.querySelector('.window-header');
                    if (header) {
                        var controls = header.querySelector('.window-controls');
                        if (controls) {
                            controls.appendChild(aiBtn);
                        }
                    }
                }
            };
        }
    },

    // ===== AI IN CONTACTS =====
    addAIToContacts: function() {
        var originalRender = window.HalDoState.apps['contacts']?.render;
        if (originalRender) {
            window.HalDoState.apps['contacts'].render = function(body) {
                if (window.HalDoContacts) {
                    window.HalDoContacts.render(body);

                    // AI-Button für Kontaktvorschläge
                    var aiBtn = document.createElement('button');
                    aiBtn.textContent = '🤖 AI Kontakt';
                    aiBtn.style.cssText =
                        'padding:4px 12px;background:rgba(123,47,252,0.3);border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:0.7rem;';
                    aiBtn.addEventListener('click', function() {
                        var name = prompt('👤 Name für den Kontakt:');
                        if (name) {
                            var prompt = 'Erstelle einen professionellen Kontakteintrag für "' +
                                name +
                                '". Füge eine passende E-Mail, Telefonnummer und eine kurze Notiz hinzu.';
                            window.HalDoAI.ask(prompt, window.HalDoState.settings.language || 'de')
                                .then(function(response) {
                                    if (window.HalDoNotify) window.HalDoNotify(
                                        '👤 Kontaktvorschlag erstellt!', 'success');
                                    navigator.clipboard.writeText(response).then(function() {
                                        if (window.HalDoNotify) window.HalDoNotify(
                                            '📋 In Zwischenablage kopiert!', 'success');
                                    });
                                });
                        }
                    });

                    var header = body.querySelector('.window-header');
                    if (header) {
                        var controls = header.querySelector('.window-controls');
                        if (controls) {
                            controls.appendChild(aiBtn);
                        }
                    }
                }
            };
        }
    },

    // ===== AI IN NOTES =====
    addAIToNotes: function() {
        var originalRender = window.HalDoState.apps['notes']?.render;
        if (originalRender) {
            window.HalDoState.apps['notes'].render = function(body) {
                if (window.HalDoAppLoader) {
                    // Original Notes Renderer aus system.js
                    var notesApp = window.HalDoState.apps['notes'];
                    if (notesApp && notesApp.render) {
                        notesApp.render(body);

                        // AI-Button für Notizen
                        var aiBtn = document.createElement('button');
                        aiBtn.textContent = '🤖 AI Notiz';
                        aiBtn.style.cssText =
                            'padding:4px 12px;background:rgba(123,47,252,0.3);border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:0.7rem;';
                        aiBtn.addEventListener('click', function() {
                            var topic = prompt('📝 Thema für die Notiz:');
                            if (topic) {
                                var prompt = 'Erstelle eine strukturierte Notiz zum Thema "' +
                                    topic +
                                    '". Die Notiz sollte klar, informativ und gut organisiert sein.';
                                window.HalDoAI.ask(prompt, window.HalDoState.settings.language ||
                                    'de').then(function(response) {
                                    if (window.HalDoNotify) window.HalDoNotify(
                                        '📝 Notiz erstellt!', 'success');
                                    navigator.clipboard.writeText(response).then(
                                    function() {
                                        if (window.HalDoNotify) window.HalDoNotify(
                                            '📋 In Zwischenablage kopiert!',
                                            'success');
                                    });
                                });
                            }
                        });

                        var header = body.querySelector('.window-header');
                        if (header) {
                            var controls = header.querySelector('.window-controls');
                            if (controls) {
                                controls.appendChild(aiBtn);
                            }
                        }
                    }
                }
            };
        }
    }
};
