/**
 * HALDO AI OS 24.6.0 – AI TUTOR APP
 * KI-gestützter Lernassistent mit personalisierten Lernpfaden und Erklärungen
 * Version: 1.0.0
 */

const AITutorApp = {
    // ---- APP-INFO ----
    id: 'ai-tutor',
    name: 'AI Tutor',
    icon: '🧑‍🏫',
    category: 'education',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'KI-gestützter Lernassistent für alle Fächer',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'chat', // chat | subjects | progress | history
    selectedSubject: null,
    chatHistory: [],
    learningProgress: {},
    totalSessions: 0,
    totalQuestions: 0,
    
    // ---- FÄCHER ----
    subjects: [
        { id: 'math', name: 'Mathematik', icon: '📐', color: '#4D96FF' },
        { id: 'physics', name: 'Physik', icon: '⚡', color: '#6BCB77' },
        { id: 'chemistry', name: 'Chemie', icon: '🧪', color: '#FFA94D' },
        { id: 'biology', name: 'Biologie', icon: '🧬', color: '#FF6B9D' },
        { id: 'history', name: 'Geschichte', icon: '📜', color: '#9B59B6' },
        { id: 'english', name: 'Englisch', icon: '📖', color: '#2ECC71' },
        { id: 'programming', name: 'Programmierung', icon: '💻', color: '#F39C12' },
        { id: 'philosophy', name: 'Philosophie', icon: '🧠', color: '#E74C3C' }
    ],
    
    // ---- SCHWIERIGKEITSGRADE ----
    difficultyLevels: [
        { id: 'beginner', label: '🌱 Anfänger', desc: 'Grundlagen verstehen' },
        { id: 'intermediate', label: '🌿 Fortgeschritten', desc: 'Vertiefung' },
        { id: 'advanced', label: '🌳 Experte', desc: 'Meisterlevel' }
    ],
    
    // ---- STANDARD-LEHRINHALTE ----
    teachingContent: {
        math: {
            beginner: [
                { id: 'm1', title: 'Grundrechenarten', description: 'Addition, Subtraktion, Multiplikation, Division' },
                { id: 'm2', title: 'Brüche', description: 'Bruchrechnung verstehen und anwenden' },
                { id: 'm3', title: 'Prozentrechnung', description: 'Prozente berechnen und anwenden' }
            ],
            intermediate: [
                { id: 'm4', title: 'Gleichungen', description: 'Lineare Gleichungen lösen' },
                { id: 'm5', title: 'Funktionen', description: 'Lineare und quadratische Funktionen' },
                { id: 'm6', title: 'Geometrie', description: 'Flächen- und Volumenberechnung' }
            ],
            advanced: [
                { id: 'm7', title: 'Analysis', description: 'Differential- und Integralrechnung' },
                { id: 'm8', title: 'Lineare Algebra', description: 'Matrizen und Vektoren' },
                { id: 'm9', title: 'Stochastik', description: 'Wahrscheinlichkeitsrechnung' }
            ]
        },
        physics: {
            beginner: [
                { id: 'p1', title: 'Mechanik', description: 'Bewegung, Kraft und Energie' },
                { id: 'p2', title: 'Wärme', description: 'Temperatur und Wärmelehre' },
                { id: 'p3', title: 'Elektrizität', description: 'Stromkreise und Spannung' }
            ],
            intermediate: [
                { id: 'p4', title: 'Wellen', description: 'Schall und Licht' },
                { id: 'p5', title: 'Magnetismus', description: 'Magnetfelder und Induktion' }
            ],
            advanced: [
                { id: 'p6', title: 'Quantenphysik', description: 'Quantenmechanik' },
                { id: 'p7', title: 'Relativität', description: 'Einsteins Theorien' }
            ]
        }
    },
    
    // ---- REGISTRIERUNG ----
    register() {
        if (typeof AppRegistry !== 'undefined') {
            AppRegistry.register({
                id: this.id,
                name: this.name,
                icon: this.icon,
                category: this.category,
                version: this.version,
                author: this.author,
                description: this.description,
                open: (params) => this.open(params),
                close: () => this.close(),
                install: () => this.install(),
                uninstall: () => this.uninstall()
            });
            console.log('🧑‍🏫 AI Tutor App registriert');
        }
        return this;
    },
    
    // ---- ÖFFNEN ----
    open(params = {}) {
        if (this.isOpen && this.window) {
            WindowManager.bringToFront(this.window);
            return this.window;
        }
        
        this.loadData();
        this.currentMode = params.mode || 'chat';
        this.isOpen = true;
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 600,
            params.height || 520
        );
        
        if (this.window) {
            this.attachEvents();
        }
        
        EventBus.emit('app:opened', { appId: this.id });
        return this.window;
    },
    
    // ---- SCHLIEßEN ----
    close() {
        if (this.window) {
            WindowManager.closeWindow(this.window);
            this.isOpen = false;
            this.window = null;
        }
        EventBus.emit('app:closed', { appId: this.id });
        return this;
    },
    
    // ---- DATEN LADEN ----
    loadData() {
        this.chatHistory = Storage.get('ai_tutor_chat', []);
        this.learningProgress = Storage.get('ai_tutor_progress', {});
        this.totalSessions = Storage.get('ai_tutor_sessions', 0);
        this.totalQuestions = Storage.get('ai_tutor_questions', 0);
        this.selectedSubject = Storage.get('ai_tutor_subject', null);
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('ai_tutor_chat', this.chatHistory);
        Storage.set('ai_tutor_progress', this.learningProgress);
        Storage.set('ai_tutor_sessions', this.totalSessions);
        Storage.set('ai_tutor_questions', this.totalQuestions);
        Storage.set('ai_tutor_subject', this.selectedSubject);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'chat': return this.renderChat();
            case 'subjects': return this.renderSubjects();
            case 'progress': return this.renderProgress();
            case 'history': return this.renderHistory();
            default: return this.renderChat();
        }
    },
    
    // ---- CHAT ----
    renderChat() {
        const subject = this.subjects.find(s => s.id === this.selectedSubject);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;align-items:center;">
                    <button class="haldo-btn ${this.currentMode === 'chat' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('chat')">💬 Chat</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('subjects')">📚 Fächer</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('progress')">📊 Fortschritt</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('history')">📋 Verlauf</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <span style="font-size:10px;color:var(--text-muted);">
                        ${subject ? `${subject.icon} ${subject.name}` : '📚 Kein Fach'}
                    </span>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:9px;padding:2px 6px;" onclick="AITutorApp.clearChat()">🗑️</button>
                </div>
                
                <!-- Chat -->
                <div id="tutor-chat" style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.chatHistory.length === 0 ? `
                        <div style="text-align:center;padding:40px 20px;color:var(--text-muted);">
                            <div style="font-size:48px;">🧑‍🏫</div>
                            <p style="font-size:13px;">Stelle deine erste Frage an den AI Tutor</p>
                            <p style="font-size:11px;">Wähle ein Fach aus oder frage einfach los</p>
                            <button class="haldo-btn" style="font-size:12px;margin-top:8px;" onclick="AITutorApp.setMode('subjects')">📚 Fach wählen</button>
                        </div>
                    ` : `
                        ${this.chatHistory.map(msg => `
                            <div style="
                                margin:6px 0;
                                padding:8px 12px;
                                border-radius:8px;
                                max-width:85%;
                                ${msg.role === 'user' ? `
                                    margin-left:auto;
                                    background: var(--primary, #6C3CE1);
                                    color: white;
                                ` : `
                                    margin-right:auto;
                                    background: var(--glass-bg, rgba(255,255,255,0.04));
                                    border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                                    color: var(--text-primary);
                                `}
                            ">
                                <div style="display:flex;gap:6px;align-items:center;">
                                    <span style="font-size:14px;">${msg.role === 'user' ? '🧑' : '🧑‍🏫'}</span>
                                    <div>
                                        <div style="font-weight:600;font-size:11px;">${msg.role === 'user' ? 'Du' : 'AI Tutor'}</div>
                                        <div style="font-size:13px;word-wrap:break-word;">${msg.content}</div>
                                        <div style="font-size:9px;color:${msg.role === 'user' ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)'};margin-top:2px;">
                                            ${new Date(msg.timestamp).toLocaleTimeString()}
                                            ${msg.subject ? ` • ${msg.subject}` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
                
                <!-- Eingabe -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <input id="tutor-input" class="haldo-input" placeholder="Frage an den AI Tutor..." style="flex:1;font-size:12px;min-width:80px;" 
                        onkeydown="if(event.key==='Enter')AITutorApp.sendMessage()">
                    <button class="haldo-btn" style="font-size:12px;padding:4px 12px;" onclick="AITutorApp.sendMessage()">📤</button>
                </div>
            </div>
        `;
    },
    
    // ---- FÄCHER ----
    renderSubjects() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('chat')">💬 Chat</button>
                    <button class="haldo-btn ${this.currentMode === 'subjects' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('subjects')">📚 Fächer</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('progress')">📊 Fortschritt</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('history')">📋 Verlauf</button>
                </div>
                
                <!-- Fächer -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    ${this.subjects.map(s => {
                        const progress = this.learningProgress[s.id] || 0;
                        return `
                            <div style="
                                padding:16px;
                                background: ${this.selectedSubject === s.id ? 'rgba(108,60,225,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                border-radius:8px;
                                border:2px solid ${this.selectedSubject === s.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                cursor:pointer;
                                transition: all 0.15s ease;
                            " onclick="AITutorApp.selectSubject('${s.id}')">
                                <div style="display:flex;gap:8px;align-items:center;">
                                    <div style="font-size:32px;">${s.icon}</div>
                                    <div>
                                        <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${s.name}</div>
                                        <div style="font-size:10px;color:var(--text-secondary);">Fortschritt: ${progress}%</div>
                                        <div style="width:100%;height:3px;background:var(--glass-border);border-radius:10px;margin-top:2px;overflow:hidden;">
                                            <div style="width:${progress}%;height:100%;background:${s.color};border-radius:10px;transition:width 0.3s ease;"></div>
                                        </div>
                                    </div>
                                </div>
                                <div style="margin-top:8px;display:flex;gap:4px;">
                                    <button class="haldo-btn" style="font-size:9px;padding:2px 8px;" onclick="event.stopPropagation();AITutorApp.startLesson('${s.id}')">📖 Lernen</button>
                                    <button class="haldo-btn haldo-btn-secondary" style="font-size:9px;padding:2px 8px;" onclick="event.stopPropagation();AITutorApp.setMode('chat');AITutorApp.sendSystemMessage('${s.id}')">💬 Fragen</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- FORTSCHRITT ----
    renderProgress() {
        const totalProgress = Object.values(this.learningProgress).reduce((sum, p) => sum + p, 0);
        const avgProgress = this.subjects.length > 0 ? Math.round(totalProgress / this.subjects.length) : 0;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('chat')">💬 Chat</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('subjects')">📚 Fächer</button>
                    <button class="haldo-btn ${this.currentMode === 'progress' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('progress')">📊 Fortschritt</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('history')">📋 Verlauf</button>
                </div>
                
                <!-- Statistiken -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:12px;">
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">📚</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.subjects.length}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Fächer</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">📊</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${avgProgress}%</div>
                        <div style="font-size:10px;color:var(--text-muted);">Durchschnitt</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">💬</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.totalSessions}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Sitzungen</div>
                    </div>
                </div>
                
                <!-- Detaillierter Fortschritt -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.subjects.map(s => {
                        const progress = this.learningProgress[s.id] || 0;
                        return `
                            <div style="
                                padding:10px 12px;
                                margin:4px 0;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:8px;
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            ">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div style="display:flex;gap:8px;align-items:center;">
                                        <span style="font-size:24px;">${s.icon}</span>
                                        <span style="font-size:13px;font-weight:600;color:var(--text-primary);">${s.name}</span>
                                    </div>
                                    <span style="font-size:12px;font-weight:600;color:${progress > 70 ? 'var(--success)' : progress > 40 ? 'var(--warning)' : 'var(--text-muted)'};">${progress}%</span>
                                </div>
                                <div style="width:100%;height:4px;background:var(--glass-border);border-radius:10px;margin-top:4px;overflow:hidden;">
                                    <div style="width:${progress}%;height:100%;background:${s.color};border-radius:10px;transition:width 0.3s ease;"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- VERLAUF ----
    renderHistory() {
        const sessions = Storage.get('ai_tutor_sessions_list', []);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('chat')">💬 Chat</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('subjects')">📚 Fächer</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('progress')">📊 Fortschritt</button>
                    <button class="haldo-btn ${this.currentMode === 'history' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="AITutorApp.setMode('history')">📋 Verlauf</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:9px;padding:2px 6px;" onclick="AITutorApp.clearHistory()">🗑️</button>
                </div>
                
                <!-- Verlauf -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${sessions.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:var(--text-muted);">
                            <div style="font-size:48px;">📋</div>
                            <p style="font-size:13px;">Noch keine Lern-Sitzungen</p>
                            <p style="font-size:11px;">Beginne eine Lern-Sitzung im Chat</p>
                        </div>
                    ` : `
                        ${sessions.map(s => `
                            <div style="
                                padding:10px 12px;
                                margin:4px 0;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:8px;
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            ">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${s.subject || 'Allgemein'}</div>
                                        <div style="font-size:10px;color:var(--text-secondary);">${s.topic || 'Fragen'}</div>
                                        <div style="font-size:9px;color:var(--text-muted);">${new Date(s.date).toLocaleString()}</div>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="font-size:12px;color:var(--text-muted);">${s.messages || 0} Nachrichten</div>
                                        <div style="font-size:11px;color:${s.progress > 70 ? 'var(--success)' : 'var(--text-muted)'};">${s.progress || 0}%</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- FUNKTIONEN ----
    setMode(mode) {
        this.currentMode = mode;
        this.updateView();
    },
    
    // ---- NACHRICHTEN ----
    async sendMessage() {
        const input = document.getElementById('tutor-input');
        if (!input || !input.value.trim()) return;
        
        const message = input.value.trim();
        input.value = '';
        
        // Benutzernachricht hinzufügen
        this.chatHistory.push({
            role: 'user',
            content: message,
            timestamp: Date.now(),
            subject: this.selectedSubject ? this.subjects.find(s => s.id === this.selectedSubject)?.name : null
        });
        
        this.totalQuestions++;
        this.saveData();
        this.updateView();
        
        // AI Antwort generieren
        const subject = this.selectedSubject ? this.subjects.find(s => s.id === this.selectedSubject) : null;
        const subjectName = subject ? subject.name : 'Allgemein';
        
        // System-Nachricht für Kontext
        const systemPrompt = `Du bist ein professioneller AI Tutor. 
        Fach: ${subjectName}
        Bisheriger Fortschritt: ${this.learningProgress[this.selectedSubject] || 0}%
        
        Der Schüler hat folgende Frage: ${message}
        
        Antworte verständlich, geduldig und hilfreich.
        Gib Erklärungen, Beispiele und Übungen.
        Passe die Antwort an das Niveau an.`;
        
        let response = '';
        
        try {
            if (typeof AICore !== 'undefined' && AICore.hasValidKey()) {
                const result = await AICore.simpleChat(systemPrompt);
                response = result || 'Entschuldigung, ich habe keine Antwort. Versuche es bitte noch einmal.';
            } else {
                // Fallback-Antworten
                response = this.getFallbackResponse(message, subjectName);
            }
        } catch (error) {
            response = '❌ Fehler bei der Anfrage. Bitte versuche es später erneut.';
        }
        
        // AI Antwort hinzufügen
        this.chatHistory.push({
            role: 'assistant',
            content: response,
            timestamp: Date.now(),
            subject: subjectName
        });
        
        // Fortschritt aktualisieren
        if (this.selectedSubject) {
            const currentProgress = this.learningProgress[this.selectedSubject] || 0;
            this.learningProgress[this.selectedSubject] = Math.min(100, currentProgress + 1);
        }
        
        this.totalSessions++;
        this.saveData();
        this.updateView();
        
        // Scroll nach unten
        const chatContainer = document.getElementById('tutor-chat');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    },
    
    getFallbackResponse(message, subject) {
        const responses = [
            `📚 Gute Frage zum Thema ${subject}!

Ich bin dein AI Tutor und helfe dir gerne weiter.

Zu deiner Frage: "${message}"

Hier ist eine einfache Erklärung:
1. Verstehe zuerst die Grundlagen
2. Wende das Gelernte an
3. Übe regelmäßig

Möchtest du mehr Details zu einem bestimmten Punkt?`,
            `🧑‍🏫 Das ist eine interessante Frage!

Lass mich dir das Schritt für Schritt erklären:

Die Antwort auf "${message}" hängt von mehreren Faktoren ab.
Am besten beginnen wir mit den Grundlagen.

Kannst du mir sagen, was du bereits darüber weißt?`,
            `💡 Super Frage!

Hier ist mein Tipp zum Thema ${subject}:

Bei "${message}" solltest du folgendes beachten:
- Die Theorie verstehen
- Mit Beispielen üben
- Dein Wissen anwenden

Falls du mehr Hilfe brauchst, frag einfach weiter!`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    sendSystemMessage(subjectId) {
        const subject = this.subjects.find(s => s.id === subjectId);
        if (!subject) return;
        
        const input = document.getElementById('tutor-input');
        if (input) {
            input.value = `Kannst du mir ${subject.name} erklären?`;
            input.focus();
        }
    },
    
    clearChat() {
        if (this.chatHistory.length === 0) return;
        if (!confirm('Chat-Verlauf wirklich löschen?')) return;
        this.chatHistory = [];
        this.saveData();
        this.updateView();
    },
    
    clearHistory() {
        if (!confirm('Alle Lern-Sitzungen wirklich löschen?')) return;
        Storage.set('ai_tutor_sessions_list', []);
        this.updateView();
    },
    
    // ---- FÄCHER ----
    selectSubject(subjectId) {
        this.selectedSubject = this.selectedSubject === subjectId ? null : subjectId;
        this.saveData();
        this.setMode('chat');
    },
    
    async startLesson(subjectId) {
        const subject = this.subjects.find(s => s.id === subjectId);
        if (!subject) return;
        
        this.selectedSubject = subjectId;
        this.saveData();
        this.setMode('chat');
        
        const input = document.getElementById('tutor-input');
        if (input) {
            const levels = ['Grundlagen', 'Fortgeschritten', 'Experte'];
            const level = levels[Math.floor(Math.random() * levels.length)];
            input.value = `Kannst du mir ${subject.name} auf ${level}-Niveau erklären?`;
            setTimeout(() => this.sendMessage(), 300);
        }
    },
    
    // ---- UPDATE ----
    updateView() {
        const container = this.window?.querySelector('.window-body');
        if (container) {
            container.innerHTML = this.render();
            this.attachEvents();
        }
    },
    
    // ---- EVENT BINDING ----
    attachEvents() {
        if (this.window) {
            this.window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.setMode('chat');
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🧑‍🏫 AI Tutor App wird installiert...');
        this.loadData();
        return true;
    },
    
    uninstall() {
        console.log('🗑️ AI Tutor App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
AITutorApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.AITutorApp = AITutorApp;

console.log('🧑‍🏫 AI Tutor App geladen – HalDo AI OS 24.6.0');
