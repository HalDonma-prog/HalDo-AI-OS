/**
 * HALDO AI OS 24.6.0 – DRIVING SCHOOL APP
 * Fahrschule mit Theorie, Fragebögen, Lernmodus und Verkehrsregeln
 * Version: 1.0.0
 */

const DrivingSchoolApp = {
    // ---- APP-INFO ----
    id: 'driving-school',
    name: 'Fahrschule',
    icon: '🚗',
    category: 'education',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Fahrschule Theorie, Fragebögen, Verkehrsregeln und Lernen',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'learn', // learn | quiz | rules | signs
    currentCategory: 'all',
    currentQuestionIndex: 0,
    score: 0,
    totalQuestions: 0,
    answered: false,
    selectedAnswer: null,
    showResult: false,
    quizHistory: [],
    favorites: [],
    
    // ---- FRAGEBOGEN ----
    questions: [
        // Vorfahrt
        {
            id: 'q1',
            category: 'vorfahrt',
            question: 'Wer hat Vorfahrt?',
            image: '🚦',
            options: [
                'Das Fahrzeug von rechts',
                'Das Fahrzeug von links',
                'Das Fahrzeug, das schneller ist',
                'Das Fahrzeug, das zuerst kam'
            ],
            correct: 0,
            explanation: 'Rechts-vor-links-Regel: Fahrzeuge von rechts haben Vorfahrt, wenn kein Schild etwas anderes regelt.'
        },
        {
            id: 'q2',
            category: 'vorfahrt',
            question: 'Welches Verkehrsschild bedeutet "Vorfahrt gewähren"?',
            image: '⚠️',
            options: [
                'Rotes Dreieck mit weißem Rand',
                'Rotes Dreieck mit weißem Rand und schwarzem Pfeil',
                'Rotes Dreieck mit weißem Rand und rotem Punkt',
                'Rotes Dreieck mit weißem Rand und schwarzem Kreuz'
            ],
            correct: 0,
            explanation: 'Das Schild "Vorfahrt gewähren" ist ein rotes Dreieck mit weißem Rand.'
        },
        {
            id: 'q3',
            category: 'vorfahrt',
            question: 'Was bedeutet das Schild "Vorfahrtstraße"?',
            image: '⬆️',
            options: [
                'Du hast Vorfahrt',
                'Du musst Vorfahrt gewähren',
                'Du darfst nicht abbiegen',
                'Du musst anhalten'
            ],
            correct: 0,
            explanation: 'Das Schild "Vorfahrtstraße" (gelbes Viereck mit weißem Rand) zeigt an, dass du Vorfahrt hast.'
        },
        
        // Verkehrszeichen
        {
            id: 'q4',
            category: 'signs',
            question: 'Was bedeutet dieses Schild? 🔵',
            image: '🔵',
            options: [
                'Parkverbot',
                'Halteverbot',
                'Radweg',
                'Fußgängerzone'
            ],
            correct: 1,
            explanation: 'Ein blaues Schild mit rotem Rand und rotem Balken bedeutet Halteverbot.'
        },
        {
            id: 'q5',
            category: 'signs',
            question: 'Was bedeutet dieses Schild? ⚠️',
            image: '⚠️',
            options: [
                'Gefahrenstelle',
                'Baustelle',
                'Kurve',
                'Steigung'
            ],
            correct: 0,
            explanation: 'Ein rotes Dreieck mit weißem Rand und einem schwarzen Symbol warnt vor einer Gefahrenstelle.'
        },
        {
            id: 'q6',
            category: 'signs',
            question: 'Was bedeutet das Schild "Zebrastreifen"?',
            image: '🚶',
            options: [
                'Fußgänger haben Vorfahrt',
                'Autos haben Vorfahrt',
                'Halteverbot',
                'Tempo-30-Zone'
            ],
            correct: 0,
            explanation: 'An einem Zebrastreifen haben Fußgänger Vorfahrt. Autos müssen anhalten, wenn Fußgänger die Straße überqueren wollen.'
        },
        
        // Geschwindigkeit
        {
            id: 'q7',
            category: 'speed',
            question: 'Wie schnell darf man in einer geschlossenen Ortschaft fahren?',
            image: '🏠',
            options: [
                '30 km/h',
                '50 km/h',
                '70 km/h',
                '100 km/h'
            ],
            correct: 1,
            explanation: 'In geschlossenen Ortschaften gilt eine Höchstgeschwindigkeit von 50 km/h, sofern nicht anders ausgeschildert.'
        },
        {
            id: 'q8',
            category: 'speed',
            question: 'Wie schnell darf man auf der Autobahn fahren?',
            image: '🛣️',
            options: [
                '100 km/h',
                '120 km/h',
                '130 km/h (Empfehlung)',
                '150 km/h'
            ],
            correct: 2,
            explanation: 'Auf deutschen Autobahnen gibt es keine generelle Geschwindigkeitsbegrenzung. Die Richtgeschwindigkeit beträgt 130 km/h.'
        },
        {
            id: 'q9',
            category: 'speed',
            question: 'Wie schnell darf man in einer Tempo-30-Zone fahren?',
            image: '🚸',
            options: [
                '20 km/h',
                '30 km/h',
                '40 km/h',
                '50 km/h'
            ],
            correct: 1,
            explanation: 'In einer Tempo-30-Zone gilt eine Höchstgeschwindigkeit von 30 km/h.'
        },
        
        // Abstand & Überholen
        {
            id: 'q10',
            category: 'distance',
            question: 'Welcher Sicherheitsabstand ist auf der Autobahn vorgeschrieben?',
            image: '📏',
            options: [
                'Halber Tachowert in Metern',
                'Tachowert in Metern',
                'Doppelter Tachowert in Metern',
                'Kein Mindestabstand'
            ],
            correct: 1,
            explanation: 'Der Sicherheitsabstand auf der Autobahn sollte mindestens dem Tachowert in Metern entsprechen (z.B. bei 100 km/h = 100 m).'
        },
        {
            id: 'q11',
            category: 'distance',
            question: 'Wann darf man überholen?',
            image: '🏎️',
            options: [
                'Immer, wenn man schneller ist',
                'Nur wenn die Sicht gut ist',
                'Nur wenn die Fahrbahn breit genug ist',
                'Nur wenn die Verkehrslage es zulässt und nicht überholt wird'
            ],
            correct: 3,
            explanation: 'Überholen ist nur erlaubt, wenn die Verkehrslage es zulässt, die Sicht ausreichend ist und niemand selbst überholt.'
        },
        
        // Umwelt & Verkehr
        {
            id: 'q12',
            category: 'environment',
            question: 'Was bedeutet die Umweltzone?',
            image: '🌿',
            options: [
                'Nur Elektroautos dürfen fahren',
                'Nur Fahrzeuge mit grüner Plakette dürfen fahren',
                'Alle Fahrzeuge dürfen fahren',
                'Fahrradstraße'
            ],
            correct: 1,
            explanation: 'In einer Umweltzone dürfen nur Fahrzeuge mit der entsprechenden Plakette (grün) fahren.'
        },
        {
            id: 'q13',
            category: 'environment',
            question: 'Was ist ein verkehrsberuhigter Bereich (Spielstraße)?',
            image: '🚸',
            options: [
                'Schrittgeschwindigkeit (max. 7 km/h)',
                '10 km/h',
                '20 km/h',
                '30 km/h'
            ],
            correct: 0,
            explanation: 'Im verkehrsberuhigten Bereich (Spielstraße) gilt Schrittgeschwindigkeit (max. 7 km/h). Fußgänger haben hier Vorrang.'
        },
        
        // Besondere Situationen
        {
            id: 'q14',
            category: 'special',
            question: 'Was tun bei Aquaplaning?',
            image: '💧',
            options: [
                'Vollbremsung',
                'Lenkrad festhalten und vom Gas gehen',
                'Beschleunigen',
                'Lenkrad schnell hin und her bewegen'
            ],
            correct: 1,
            explanation: 'Bei Aquaplaning sollte man das Lenkrad festhalten, vom Gas gehen und nicht stark bremsen, bis die Reifen wieder Bodenkontakt haben.'
        },
        {
            id: 'q15',
            category: 'special',
            question: 'Wann muss man das Abblendlicht einschalten?',
            image: '💡',
            options: [
                'Bei Dunkelheit und schlechter Sicht',
                'Immer',
                'Nur bei Regen',
                'Nur in Tunneln'
            ],
            correct: 0,
            explanation: 'Das Abblendlicht muss bei Dunkelheit, schlechter Sicht (Nebel, Regen, Schnee) und in Tunneln eingeschaltet werden.'
        }
    ],
    
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
            console.log('🚗 Driving School App registriert');
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
        this.currentMode = params.mode || 'learn';
        this.currentCategory = params.category || 'all';
        this.isOpen = true;
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 560,
            params.height || 480
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
        this.quizHistory = Storage.get('driving_quiz_history', []);
        this.favorites = Storage.get('driving_favorites', []);
        this.currentCategory = Storage.get('driving_category', 'all');
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('driving_quiz_history', this.quizHistory);
        Storage.set('driving_favorites', this.favorites);
        Storage.set('driving_category', this.currentCategory);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'learn': return this.renderLearnMode();
            case 'quiz': return this.renderQuizMode();
            case 'rules': return this.renderRulesMode();
            case 'signs': return this.renderSignsMode();
            default: return this.renderLearnMode();
        }
    },
    
    // ---- LERN-MODUS ----
    renderLearnMode() {
        const categories = [
            { id: 'all', label: '📚 Alle Kategorien', icon: '📚' },
            { id: 'vorfahrt', label: '🚦 Vorfahrt', icon: '🚦' },
            { id: 'signs', label: '🛑 Verkehrszeichen', icon: '🛑' },
            { id: 'speed', label: '🏎️ Geschwindigkeit', icon: '🏎️' },
            { id: 'distance', label: '📏 Abstand & Überholen', icon: '📏' },
            { id: 'environment', label: '🌿 Umwelt & Verkehr', icon: '🌿' },
            { id: 'special', label: '⚠️ Besondere Situationen', icon: '⚠️' }
        ];
        
        const filteredQuestions = this.getFilteredQuestions();
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn ${this.currentMode === 'learn' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="DrivingSchoolApp.setMode('learn')">📚 Lernen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="DrivingSchoolApp.setMode('quiz')">🧠 Quiz</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="DrivingSchoolApp.setMode('rules')">📋 Regeln</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="DrivingSchoolApp.setMode('signs')">🛑 Schilder</button>
                </div>
                
                <!-- Kategorien -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));overflow-x:auto;flex-wrap:wrap;">
                    ${categories.map(cat => `
                        <button class="haldo-btn ${this.currentCategory === cat.id ? '' : 'haldo-btn-secondary'}" style="font-size:10px;padding:2px 8px;" onclick="DrivingSchoolApp.setCategory('${cat.id}')">
                            ${cat.icon} ${cat.label}
                        </button>
                    `).join('')}
                </div>
                
                <!-- Fragen -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${filteredQuestions.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Keine Fragen in dieser Kategorie</p>
                        </div>
                    ` : `
                        ${filteredQuestions.map((q, index) => `
                            <div class="question-card" style="
                                padding:10px 12px;
                                margin:4px 0;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:8px;
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                                cursor:pointer;
                                transition: all 0.15s ease;
                            " onclick="DrivingSchoolApp.showQuestionDetail('${q.id}')">
                                <div style="display:flex;gap:8px;align-items:center;">
                                    <div style="font-size:20px;">${q.image || '📝'}</div>
                                    <div style="flex:1;">
                                        <div style="font-size:12px;color:var(--text-primary);">${q.question}</div>
                                        <div style="font-size:10px;color:var(--text-muted);">${q.category}</div>
                                    </div>
                                    <div style="font-size:12px;color:${this.favorites.includes(q.id) ? 'var(--gold, #FFD700)' : 'var(--text-muted)'};">
                                        ${this.favorites.includes(q.id) ? '⭐' : '☆'}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>📚 ${filteredQuestions.length} Fragen</span>
                    <span>⭐ ${this.favorites.length} Favoriten</span>
                    <span>📊 ${this.quizHistory.length} Quiz absolviert</span>
                </div>
            </div>
        `;
    },
    
    // ---- QUIZ-MODUS ----
    renderQuizMode() {
        const questions = this.getFilteredQuestions();
        const total = questions.length;
        const current = this.currentQuestionIndex;
        const q = questions[current];
        
        if (!q || total === 0) {
            return `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;padding:20px;text-align:center;">
                    <div style="font-size:48px;">🎯</div>
                    <div style="font-size:18px;font-weight:600;color:var(--text-primary);">Keine Fragen</div>
                    <p style="font-size:12px;color:var(--text-secondary);">Wähle eine Kategorie mit Fragen</p>
                    <button class="haldo-btn" style="font-size:12px;padding:6px 16px;" onclick="DrivingSchoolApp.setCategory('all')">📚 Alle Kategorien</button>
                </div>
            `;
        }
        
        const progress = ((current + 1) / total * 100);
        const isAnswered = this.answered;
        const selected = this.selectedAnswer;
        const isCorrect = selected === q.correct;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;align-items:center;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="DrivingSchoolApp.setMode('learn')">✕ Beenden</button>
                    <div style="flex:1;text-align:center;font-size:12px;color:var(--text-secondary);">
                        Frage ${current + 1} von ${total}
                    </div>
                    <div style="font-size:11px;color:var(--text-muted);">
                        🎯 ${this.score}/${total}
                    </div>
                </div>
                
                <!-- Fortschritt -->
                <div style="padding:2px 8px;">
                    <div style="height:3px;background:var(--glass-border, rgba(255,255,255,0.06));border-radius:10px;overflow:hidden;">
                        <div style="height:100%;width:${progress}%;background:var(--primary, #6C3CE1);border-radius:10px;transition:width 0.3s ease;"></div>
                    </div>
                </div>
                
                <!-- Frage -->
                <div style="flex:1;overflow-y:auto;padding:12px;">
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
                            <div style="font-size:24px;">${q.image || '📝'}</div>
                            <div style="font-size:11px;color:var(--text-muted);">${q.category}</div>
                        </div>
                        <div style="font-size:15px;font-weight:600;color:var(--text-primary);">${q.question}</div>
                    </div>
                    
                    <div style="margin-top:8px;display:flex;flex-direction:column;gap:4px;">
                        ${q.options.map((opt, idx) => `
                            <div class="quiz-option" style="
                                padding:10px 12px;
                                background: ${isAnswered ? (idx === q.correct ? 'rgba(0,255,136,0.15)' : idx === selected ? 'rgba(255,59,48,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))') : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                border: 2px solid ${isAnswered ? (idx === q.correct ? 'var(--success, #00FF88)' : idx === selected ? 'var(--danger, #FF3B30)' : 'var(--glass-border, rgba(255,255,255,0.06))') : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                border-radius:8px;
                                cursor: ${isAnswered ? 'default' : 'pointer'};
                                transition: all 0.15s ease;
                            " onclick="${isAnswered ? '' : `DrivingSchoolApp.selectAnswer(${idx})`}">
                                <div style="display:flex;gap:8px;align-items:center;">
                                    <div style="font-size:12px;font-weight:600;color:${isAnswered ? (idx === q.correct ? 'var(--success, #00FF88)' : idx === selected ? 'var(--danger, #FF3B30)' : 'var(--text-secondary)') : 'var(--text-secondary)'};">
                                        ${String.fromCharCode(65 + idx)}
                                    </div>
                                    <div style="font-size:13px;color:${isAnswered ? (idx === q.correct ? 'var(--success, #00FF88)' : idx === selected ? 'var(--danger, #FF3B30)' : 'var(--text-secondary)') : 'var(--text-primary)'};">
                                        ${opt}
                                    </div>
                                    ${isAnswered && idx === q.correct ? ' ✅' : ''}
                                    ${isAnswered && idx === selected && idx !== q.correct ? ' ❌' : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    ${isAnswered ? `
                        <div style="margin-top:8px;padding:8px 12px;background:${isCorrect ? 'rgba(0,255,136,0.08)' : 'rgba(255,59,48,0.08)'};border-radius:8px;border:1px solid ${isCorrect ? 'var(--success, #00FF88)' : 'var(--danger, #FF3B30)'};">
                            <div style="font-size:12px;font-weight:600;color:${isCorrect ? 'var(--success, #00FF88)' : 'var(--danger, #FF3B30)'};">
                                ${isCorrect ? '✅ Richtig!' : '❌ Falsch!'}
                            </div>
                            <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">
                                ${q.explanation}
                            </div>
                            <button class="haldo-btn" style="font-size:11px;margin-top:6px;padding:4px 12px;" onclick="DrivingSchoolApp.nextQuestion()">
                                ${current < total - 1 ? '➡️ Nächste Frage' : '🏁 Ergebnis anzeigen'}
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>📚 ${total} Fragen</span>
                    <span>✅ ${this.score} richtig</span>
                </div>
            </div>
        `;
    },
    
    // ---- REGELN-MODUS ----
    renderRulesMode() {
        const rules = [
            { icon: '🚦', title: 'Rechts-vor-links', desc: 'An Kreuzungen ohne Schilder hat das Fahrzeug von rechts Vorfahrt.' },
            { icon: '🛑', title: 'Stop-Schild', desc: 'An einem Stop-Schild musst du anhalten und Vorfahrt gewähren.' },
            { icon: '🚗', title: 'Abfahren', desc: 'Beim Abfahren von der Autobahn musst du den Blinker setzen.' },
            { icon: '🏎️', title: 'Überholverbot', desc: 'Überholen ist verboten, wenn die Sicht eingeschränkt ist.' },
            { icon: '🚸', title: 'Schulbus', desc: 'Bei einem haltenden Schulbus mit Warnblinker darf nicht überholt werden.' },
            { icon: '📱', title: 'Handyverbot', desc: 'Die Nutzung von Handys am Steuer ist verboten.' },
            { icon: '🍺', title: 'Alkohol', desc: 'Die Promillegrenze liegt bei 0,5 Promille (Fahranfänger: 0,0).' },
            { icon: '🚑', title: 'Rettungsgasse', desc: 'Bei Stau auf der Autobahn muss eine Rettungsgasse gebildet werden.' },
            { icon: '🔀', title: 'Reißverschlussverfahren', desc: 'Beim Spurwechsel wird abwechselnd gefahren.' },
            { icon: '🚲', title: 'Radfahrer', desc: 'Radfahrer müssen auf Radwegen fahren, wenn vorhanden.' }
        ];
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="DrivingSchoolApp.setMode('learn')">📚 Lernen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="DrivingSchoolApp.setMode('quiz')">🧠 Quiz</button>
                    <button class="haldo-btn ${this.currentMode === 'rules' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="DrivingSchoolApp.setMode('rules')">📋 Regeln</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="DrivingSchoolApp.setMode('signs')">🛑 Schilder</button>
                </div>
                
                <!-- Regeln -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    ${rules.map(rule => `
                        <div style="
                            padding:10px 12px;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        ">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="font-size:24px;">${rule.icon}</div>
                                <div>
                                    <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${rule.title}</div>
                                    <div style="font-size:10px;color:var(--text-secondary);">${rule.desc}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>📋 ${rules.length} Regeln</span>
                    <span>🚗 HalDo Fahrschule</span>
                </div>
            </div>
        `;
    },
    
    // ---- SCHILDER-MODUS ----
    renderSignsMode() {
        const signs = [
            { icon: '🛑', name: 'Stop', desc: 'Anhalten und Vorfahrt gewähren' },
            { icon: '⚠️', name: 'Gefahr', desc: 'Warnung vor Gefahrenstelle' },
            { icon: '🚦', name: 'Ampel', desc: 'Ampel mit Rot, Gelb, Grün' },
            { icon: '🚸', name: 'Kinder', desc: 'Achtung Kinder' },
            { icon: '🚲', name: 'Radweg', desc: 'Radweg (benutzungspflichtig)' },
            { icon: '🚫', name: 'Verbot', desc: 'Einfahrt verboten' },
            { icon: '🔞', name: 'Überholverbot', desc: 'Überholen verboten' },
            { icon: '🏠', name: 'Ortschaft', desc: 'Ortschaft Anfang/Ende' },
            { icon: '🛣️', name: 'Autobahn', desc: 'Autobahn Anfang/Ende' },
            { icon: '🚗', name: 'Einbahnstraße', desc: 'Einfahrt in Einbahnstraße' },
            { icon: '🅿️', name: 'Parken', desc: 'Parkplatz' },
            { icon: '⛔', name: 'Halteverbot', desc: 'Halten verboten' }
        ];
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="DrivingSchoolApp.setMode('learn')">📚 Lernen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="DrivingSchoolApp.setMode('quiz')">🧠 Quiz</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="DrivingSchoolApp.setMode('rules')">📋 Regeln</button>
                    <button class="haldo-btn ${this.currentMode === 'signs' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="DrivingSchoolApp.setMode('signs')">🛑 Schilder</button>
                </div>
                
                <!-- Schilder -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
                    ${signs.map(sign => `
                        <div style="
                            padding:10px 8px;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            text-align:center;
                            cursor:pointer;
                            transition: all 0.15s ease;
                        " onclick="alert('${sign.name}: ${sign.desc}')">
                            <div style="font-size:36px;">${sign.icon}</div>
                            <div style="font-size:11px;font-weight:600;color:var(--text-primary);margin-top:4px;">${sign.name}</div>
                            <div style="font-size:9px;color:var(--text-muted);">${sign.desc}</div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🛑 ${signs.length} Schilder</span>
                    <span>💡 Tipp: Klicke auf ein Schild für Details</span>
                </div>
            </div>
        `;
    },
    
    // ---- MODUS & KATEGORIE ----
    setMode(mode) {
        this.currentMode = mode;
        if (mode === 'quiz') {
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.answered = false;
            this.selectedAnswer = null;
        }
        this.updateView();
    },
    
    setCategory(category) {
        this.currentCategory = category;
        this.saveData();
        if (this.currentMode === 'quiz') {
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.answered = false;
            this.selectedAnswer = null;
        }
        this.updateView();
    },
    
    // ---- FRAGEN ----
    getFilteredQuestions() {
        if (this.currentCategory === 'all') {
            return [...this.questions];
        }
        return this.questions.filter(q => q.category === this.currentCategory);
    },
    
    // ---- QUIZ ----
    selectAnswer(index) {
        if (this.answered) return;
        this.answered = true;
        this.selectedAnswer = index;
        const q = this.getFilteredQuestions()[this.currentQuestionIndex];
        if (index === q.correct) {
            this.score++;
        }
        this.updateView();
    },
    
    nextQuestion() {
        const total = this.getFilteredQuestions().length;
        if (this.currentQuestionIndex < total - 1) {
            this.currentQuestionIndex++;
            this.answered = false;
            this.selectedAnswer = null;
            this.updateView();
        } else {
            // Quiz beendet
            this.showQuizResult();
        }
    },
    
    showQuizResult() {
        const total = this.getFilteredQuestions().length;
        const percent = Math.round((this.score / total) * 100);
        const passed = percent >= 70;
        
        // Ergebnis speichern
        this.quizHistory.push({
            date: Date.now(),
            category: this.currentCategory,
            score: this.score,
            total: total,
            percent: percent,
            passed: passed
        });
        this.saveData();
        
        alert(
            `🏁 Quiz abgeschlossen!\n\n` +
            `✅ Richtig: ${this.score} von ${total}\n` +
            `📊 Ergebnis: ${percent}%\n` +
            `${passed ? '🎉 Bestanden!' : '📚 Weiter üben!'}\n\n` +
            `Kategorie: ${this.currentCategory === 'all' ? 'Alle' : this.currentCategory}`
        );
        
        this.setMode('learn');
    },
    
    showQuestionDetail(questionId) {
        const q = this.questions.find(q => q.id === questionId);
        if (!q) return;
        
        // Favorit toggeln
        const isFavorite = this.favorites.includes(q.id);
        if (isFavorite) {
            this.favorites = this.favorites.filter(id => id !== q.id);
        } else {
            this.favorites.push(q.id);
        }
        this.saveData();
        this.updateView();
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
        // Tastatur-Shortcuts für Quiz
        if (this.currentMode === 'quiz' && this.window) {
            this.window.addEventListener('keydown', (e) => {
                if (e.key >= '1' && e.key <= '4') {
                    const idx = parseInt(e.key) - 1;
                    this.selectAnswer(idx);
                }
                if (e.key === 'Enter' && this.answered) {
                    this.nextQuestion();
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🚗 Driving School App wird installiert...');
        this.loadData();
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Driving School App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
DrivingSchoolApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.DrivingSchoolApp = DrivingSchoolApp;

console.log('🚗 Driving School App geladen – HalDo AI OS 24.6.0');
