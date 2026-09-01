/**
 * HALDO AI OS 24.6.0 – PHILOSOPHY CENTER APP
 * Philosophie, Ethik, Denker, Schulen und Zitate
 * Version: 1.0.0
 */

const PhilosophyCenterApp = {
    // ---- APP-INFO ----
    id: 'philosophy-center',
    name: 'Philosophy Center',
    icon: '🧠',
    category: 'education',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Philosophie, Ethik, Denker, Schulen und Zitate',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'dashboard', // dashboard | thinkers | schools | ethics | quotes | quiz
    selectedThinker: null,
    selectedSchool: null,
    favoriteQuotes: [],
    
    // ---- DENKER ----
    thinkers: [
        { id: 't1', name: 'Sokrates', era: 'Antike', country: 'Griechenland', icon: '🏛️', works: ['Apologie', 'Kriton', 'Phaidon'], quote: 'Ich weiß, dass ich nichts weiß.' },
        { id: 't2', name: 'Platon', era: 'Antike', country: 'Griechenland', icon: '📜', works: ['Der Staat', 'Symposion', 'Phaidros'], quote: 'Der Anfang ist die wichtigste Hälfte des ganzen Werkes.' },
        { id: 't3', name: 'Aristoteles', era: 'Antike', country: 'Griechenland', icon: '🔬', works: ['Nikomachische Ethik', 'Politik', 'Metaphysik'], quote: 'Der Mensch ist ein politisches Wesen.' },
        { id: 't4', name: 'Immanuel Kant', era: 'Neuzeit', country: 'Deutschland', icon: '🇩🇪', works: ['Kritik der reinen Vernunft', 'Grundlegung zur Metaphysik der Sitten'], quote: 'Der kategorische Imperativ: Handle so, dass die Maxime deines Willens jederzeit zugleich als Prinzip einer allgemeinen Gesetzgebung gelten könne.' },
        { id: 't5', name: 'Friedrich Nietzsche', era: 'Neuzeit', country: 'Deutschland', icon: '⚡', works: ['Also sprach Zarathustra', 'Jenseits von Gut und Böse'], quote: 'Was mich nicht umbringt, macht mich stärker.' },
        { id: 't6', name: 'Jean-Paul Sartre', era: 'Moderne', country: 'Frankreich', icon: '🇫🇷', works: ['Das Sein und das Nichts', 'Der Ekel'], quote: 'Die Existenz geht der Essenz voraus.' },
        { id: 't7', name: 'Simone de Beauvoir', era: 'Moderne', country: 'Frankreich', icon: '✊', works: ['Das andere Geschlecht', 'Memoiren einer Tochter aus gutem Hause'], quote: 'Man wird nicht als Frau geboren, man wird zur Frau gemacht.' },
        { id: 't8', name: 'Karl Marx', era: 'Neuzeit', country: 'Deutschland', icon: '📕', works: ['Das Kapital', 'Das Kommunistische Manifest'], quote: 'Die Philosophen haben die Welt nur verschieden interpretiert; es kommt darauf an, sie zu verändern.' }
    ],
    
    // ---- SCHULEN ----
    schools: [
        { id: 's1', name: 'Stoa', era: 'Antike', icon: '🏛️', desc: 'Gelassenheit, Tugend, Naturgesetz', thinkers: ['Seneca', 'Epiktet', 'Marc Aurel'] },
        { id: 's2', name: 'Epikureismus', era: 'Antike', icon: '🍇', desc: 'Lust, Freundschaft, Ataraxie', thinkers: ['Epikur'] },
        { id: 's3', name: 'Rationalismus', era: 'Neuzeit', icon: '🧠', desc: 'Vernunft als Erkenntnisquelle', thinkers: ['Descartes', 'Leibniz', 'Spinoza'] },
        { id: 's4', name: 'Empirismus', era: 'Neuzeit', icon: '🔍', desc: 'Erfahrung als Erkenntnisquelle', thinkers: ['Locke', 'Hume', 'Berkeley'] },
        { id: 's5', name: 'Existenzialismus', era: 'Moderne', icon: '🌌', desc: 'Freiheit, Verantwortung, Authentizität', thinkers: ['Sartre', 'Camus', 'Kierkegaard'] }
    ],
    
    // ---- ETHIK-THEMEN ----
    ethicsTopics: [
        { id: 'e1', title: 'Kategorischer Imperativ', desc: 'Handle nur nach der Maxime, durch die du zugleich wollen kannst, dass sie ein allgemeines Gesetz werde.' },
        { id: 'e2', title: 'Utilitarismus', desc: 'Das größte Glück für die größte Zahl.' },
        { id: 'e3', title: 'Tugendethik', desc: 'Handle nach den Tugenden, die dich zu einem guten Menschen machen.' },
        { id: 'e4', title: 'Existenzialistische Ethik', desc: 'Der Mensch ist frei, verantwortlich und muss seine Werte selbst schaffen.' },
        { id: 'e5', title: 'Gerechtigkeitstheorie', desc: 'Gerechtigkeit ist Fairness (Rawls).' }
    ],
    
    // ---- ZITATE ----
    quotes: [
        { id: 'q1', text: 'Ich weiß, dass ich nichts weiß.', thinker: 'Sokrates' },
        { id: 'q2', text: 'Der Anfang ist die wichtigste Hälfte des ganzen Werkes.', thinker: 'Platon' },
        { id: 'q3', text: 'Der Mensch ist ein politisches Wesen.', thinker: 'Aristoteles' },
        { id: 'q4', text: 'Handle so, dass die Maxime deines Willens jederzeit zugleich als Prinzip einer allgemeinen Gesetzgebung gelten könne.', thinker: 'Kant' },
        { id: 'q5', text: 'Was mich nicht umbringt, macht mich stärker.', thinker: 'Nietzsche' },
        { id: 'q6', text: 'Die Existenz geht der Essenz voraus.', thinker: 'Sartre' },
        { id: 'q7', text: 'Man wird nicht als Frau geboren, man wird zur Frau gemacht.', thinker: 'Beauvoir' },
        { id: 'q8', text: 'Die Philosophen haben die Welt nur verschieden interpretiert; es kommt darauf an, sie zu verändern.', thinker: 'Marx' },
        { id: 'q9', text: 'Cogito ergo sum – Ich denke, also bin ich.', thinker: 'Descartes' },
        { id: 'q10', text: 'Die beste Art, die Zukunft vorherzusagen, ist, sie zu gestalten.', thinker: 'Wiener' }
    ],
    
    // ---- QUIZ ----
    quizQuestions: [
        { id: 'qz1', question: 'Wer sagte "Ich weiß, dass ich nichts weiß"?', options: ['Sokrates', 'Platon', 'Aristoteles', 'Kant'], correct: 0 },
        { id: 'qz2', question: 'Welcher Philosoph schrieb "Der Staat"?', options: ['Sokrates', 'Platon', 'Aristoteles', 'Nietzsche'], correct: 1 },
        { id: 'qz3', question: 'Was ist der kategorische Imperativ?', options: ['Eine mathematische Formel', 'Ein moralisches Gesetz', 'Ein Naturgesetz', 'Eine politische Theorie'], correct: 1 },
        { id: 'qz4', question: 'Wer sagte "Die Existenz geht der Essenz voraus"?', options: ['Kant', 'Nietzsche', 'Sartre', 'Marx'], correct: 2 },
        { id: 'qz5', question: 'Welche Schule betont die Erfahrung als Erkenntnisquelle?', options: ['Rationalismus', 'Empirismus', 'Stoa', 'Existenzialismus'], correct: 1 }
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
            console.log('🧠 Philosophy Center App registriert');
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
        this.currentMode = params.mode || 'dashboard';
        this.isOpen = true;
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 620,
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
        this.favoriteQuotes = Storage.get('philosophy_favorites', []);
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('philosophy_favorites', this.favoriteQuotes);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'dashboard': return this.renderDashboard();
            case 'thinkers': return this.renderThinkers();
            case 'schools': return this.renderSchools();
            case 'ethics': return this.renderEthics();
            case 'quotes': return this.renderQuotes();
            case 'quiz': return this.renderQuiz();
            default: return this.renderDashboard();
        }
    },
    
    // ---- DASHBOARD ----
    renderDashboard() {
        const totalThinkers = this.thinkers.length;
        const totalQuotes = this.quotes.length;
        const totalSchools = this.schools.length;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn ${this.currentMode === 'dashboard' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('thinkers')">🧠 Denker</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('schools')">🏛️ Schulen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('ethics')">⚖️ Ethik</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('quotes')">💬 Zitate</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('quiz')">🧠 Quiz</button>
                </div>
                
                <!-- Statistiken -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;padding:12px;">
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">🧠</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalThinkers}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Denker</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">🏛️</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalSchools}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Schulen</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">💬</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalQuotes}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Zitate</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">⭐</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.favoriteQuotes.length}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Favoriten</div>
                    </div>
                </div>
                
                <!-- Zitat des Tages -->
                <div style="padding:0 12px 12px 12px;">
                    <div style="padding:16px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:14px;color:var(--text-muted);">💬 Zitat des Tages</div>
                        <div style="font-size:18px;font-style:italic;color:var(--text-primary);margin:6px 0;">"${this.quotes[Math.floor(Math.random() * this.quotes.length)].text}"</div>
                        <div style="font-size:12px;color:var(--text-secondary);">— ${this.quotes[Math.floor(Math.random() * this.quotes.length)].thinker}</div>
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🧠 Philosophy Center</span>
                    <span>💡 Denken verändert die Welt</span>
                </div>
            </div>
        `;
    },
    
    // ---- DENKER ----
    renderThinkers() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn ${this.currentMode === 'thinkers' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('thinkers')">🧠 Denker</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('schools')">🏛️ Schulen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('ethics')">⚖️ Ethik</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('quotes')">💬 Zitate</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('quiz')">🧠 Quiz</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="PhilosophyCenterApp.addThinker()">+</button>
                </div>
                
                <!-- Denker -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    ${this.thinkers.map(t => `
                        <div style="
                            padding:10px 12px;
                            background: ${this.selectedThinker === t.id ? 'rgba(108,60,225,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                            border-radius:8px;
                            border:1px solid ${this.selectedThinker === t.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                            cursor:pointer;
                            transition: all 0.15s ease;
                        " onclick="PhilosophyCenterApp.showThinker('${t.id}')">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="font-size:28px;">${t.icon}</div>
                                <div>
                                    <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${t.name}</div>
                                    <div style="font-size:10px;color:var(--text-secondary);">${t.era} • ${t.country}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- SCHULEN ----
    renderSchools() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('thinkers')">🧠 Denker</button>
                    <button class="haldo-btn ${this.currentMode === 'schools' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('schools')">🏛️ Schulen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('ethics')">⚖️ Ethik</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('quotes')">💬 Zitate</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('quiz')">🧠 Quiz</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="PhilosophyCenterApp.addSchool()">+</button>
                </div>
                
                <!-- Schulen -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    ${this.schools.map(s => `
                        <div style="
                            padding:12px;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            cursor:pointer;
                            transition: all 0.15s ease;
                        " onclick="PhilosophyCenterApp.showSchool('${s.id}')">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="font-size:28px;">${s.icon}</div>
                                <div>
                                    <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${s.name}</div>
                                    <div style="font-size:10px;color:var(--text-secondary);">${s.era}</div>
                                    <div style="font-size:9px;color:var(--text-muted);">${s.desc}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- ETHIK ----
    renderEthics() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('thinkers')">🧠 Denker</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('schools')">🏛️ Schulen</button>
                    <button class="haldo-btn ${this.currentMode === 'ethics' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('ethics')">⚖️ Ethik</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('quotes')">💬 Zitate</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('quiz')">🧠 Quiz</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="PhilosophyCenterApp.addEthicsTopic()">+</button>
                </div>
                
                <!-- Ethik -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.ethicsTopics.map(e => `
                        <div style="
                            padding:12px;
                            margin:4px 0;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        ">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${e.title}</div>
                                    <div style="font-size:11px;color:var(--text-secondary);">${e.desc}</div>
                                </div>
                                <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();PhilosophyCenterApp.deleteEthicsTopic('${e.id}')">✕</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- ZITATE ----
    renderQuotes() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('thinkers')">🧠 Denker</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('schools')">🏛️ Schulen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('ethics')">⚖️ Ethik</button>
                    <button class="haldo-btn ${this.currentMode === 'quotes' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('quotes')">💬 Zitate</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="PhilosophyCenterApp.setMode('quiz')">🧠 Quiz</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="PhilosophyCenterApp.addQuote()">+</button>
                </div>
                
                <!-- Zitate -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.quotes.map(q => {
                        const isFavorite = this.favoriteQuotes.includes(q.id);
                        return `
                            <div style="
                                padding:10px 12px;
                                margin:4px 0;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:8px;
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            ">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="font-size:14px;font-style:italic;color:var(--text-primary);">"${q.text}"</div>
                                        <div style="font-size:11px;color:var(--text-secondary);">— ${q.thinker}</div>
                                    </div>
                                    <div style="display:flex;gap:4px;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();PhilosophyCenterApp.toggleFavorite('${q.id}')">
                                            ${isFavorite ? '⭐' : '☆'}
                                        </button>
                                        <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();PhilosophyCenterApp.deleteQuote('${q.id}')">✕</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- QUIZ ----
    renderQuiz() {
        const total = this.quizQuestions.length;
        const current = this.quizCurrentIndex || 0;
        const q = this.quizQuestions[current];
        const isAnswered = this.quizAnswered || false;
        const selected = this.quizSelected || null;
        
        if (!q || total === 0) {
            return `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;padding:20px;text-align:center;">
                    <div style="font-size:48px;">🧠</div>
                    <div style="font-size:18px;font-weight:600;color:var(--text-primary);">Keine Quiz-Fragen</div>
                    <button class="haldo-btn" style="font-size:12px;padding:6px 16px;" onclick="PhilosophyCenterApp.setMode('dashboard')">📊 Zurück</button>
                </div>
            `;
        }
        
        const progress = ((current + 1) / total * 100);
        const isCorrect = selected === q.correct;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;align-items:center;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="PhilosophyCenterApp.setMode('dashboard')">✕ Beenden</button>
                    <div style="flex:1;text-align:center;font-size:12px;color:var(--text-secondary);">
                        Frage ${current + 1} von ${total}
                    </div>
                    <div style="font-size:11px;color:var(--text-muted);">
                        🎯 ${this.quizScore || 0}/${total}
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
                        <div style="font-size:15px;font-weight:600;color:var(--text-primary);">${q.question}</div>
                    </div>
                    
                    <div style="margin-top:8px;display:flex;flex-direction:column;gap:4px;">
                        ${q.options.map((opt, idx) => `
                            <div style="
                                padding:10px 12px;
                                background: ${isAnswered ? (idx === q.correct ? 'rgba(0,255,136,0.15)' : idx === selected ? 'rgba(255,59,48,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))') : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                border: 2px solid ${isAnswered ? (idx === q.correct ? 'var(--success, #00FF88)' : idx === selected ? 'var(--danger, #FF3B30)' : 'var(--glass-border, rgba(255,255,255,0.06))') : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                border-radius:8px;
                                cursor: ${isAnswered ? 'default' : 'pointer'};
                                transition: all 0.15s ease;
                            " onclick="${isAnswered ? '' : `PhilosophyCenterApp.selectQuizAnswer(${idx})`}">
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
                            <button class="haldo-btn" style="font-size:11px;margin-top:6px;padding:4px 12px;" onclick="PhilosophyCenterApp.nextQuizQuestion()">
                                ${current < total - 1 ? '➡️ Nächste Frage' : '🏁 Ergebnis anzeigen'}
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🧠 ${total} Fragen</span>
                    <span>✅ ${this.quizScore || 0} richtig</span>
                </div>
            </div>
        `;
    },
    
    // ---- FUNKTIONEN ----
    setMode(mode) {
        if (mode === 'quiz' && this.currentMode !== 'quiz') {
            this.quizCurrentIndex = 0;
            this.quizScore = 0;
            this.quizAnswered = false;
            this.quizSelected = null;
        }
        this.currentMode = mode;
        this.updateView();
    },
    
    // ---- DENKER ----
    showThinker(thinkerId) {
        const thinker = this.thinkers.find(t => t.id === thinkerId);
        if (!thinker) return;
        
        this.selectedThinker = thinkerId;
        
        const content = `
            <div style="padding:12px;">
                <div style="display:flex;gap:8px;align-items:center;">
                    <div style="font-size:40px;">${thinker.icon}</div>
                    <div>
                        <h2 style="color:var(--text-primary);font-size:18px;margin:0;">${thinker.name}</h2>
                        <p style="color:var(--text-secondary);font-size:12px;">${thinker.era} • ${thinker.country}</p>
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <div style="font-size:12px;font-weight:600;color:var(--text-primary);">📚 Werke</div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
                        ${thinker.works.map(w => `<span style="font-size:10px;padding:2px 8px;background:var(--glass-bg);border-radius:4px;color:var(--text-secondary);">${w}</span>`).join('')}
                    </div>
                </div>
                <div style="margin-top:8px;padding:8px;background:var(--glass-bg);border-radius:6px;">
                    <div style="font-size:11px;color:var(--text-muted);">💬 Zitat</div>
                    <div style="font-size:14px;font-style:italic;color:var(--text-primary);">"${thinker.quote}"</div>
                </div>
            </div>
        `;
        
        WindowManager.openWindow(
            'thinker-detail',
            '🧠 ' + thinker.name,
            content,
            thinker.icon,
            400,
            350
        );
    },
    
    addThinker() {
        const name = prompt('🧠 Name des Denkers:');
        if (!name) return;
        const era = prompt('📅 Epoche (Antike, Neuzeit, Moderne):', 'Neuzeit') || 'Neuzeit';
        const country = prompt('🌍 Land:', 'Deutschland') || 'Deutschland';
        const icon = prompt('🎨 Icon (Emoji):', '🧠') || '🧠';
        const works = prompt('📚 Werke (kommagetrennt):', 'Werk1, Werk2') || 'Werk1, Werk2';
        const quote = prompt('💬 Zitat:', '') || 'Zitat unbekannt';
        
        this.thinkers.push({
            id: 't_' + Date.now().toString(36),
            name: name,
            era: era,
            country: country,
            icon: icon,
            works: works.split(',').map(w => w.trim()).filter(Boolean),
            quote: quote
        });
        this.saveData();
        this.updateView();
    },
    
    // ---- SCHULEN ----
    showSchool(schoolId) {
        const school = this.schools.find(s => s.id === schoolId);
        if (!school) return;
        
        alert(
            `🏛️ ${school.name}\n\n` +
            `📅 Epoche: ${school.era}\n` +
            `📝 Beschreibung: ${school.desc}\n` +
            `🧠 Denker: ${school.thinkers.join(', ')}`
        );
    },
    
    addSchool() {
        const name = prompt('🏛️ Name der Schule:');
        if (!name) return;
        const era = prompt('📅 Epoche:', 'Neuzeit') || 'Neuzeit';
        const icon = prompt('🎨 Icon (Emoji):', '🏛️') || '🏛️';
        const desc = prompt('📝 Beschreibung:') || '';
        const thinkers = prompt('🧠 Denker (kommagetrennt):', '') || '';
        
        this.schools.push({
            id: 's_' + Date.now().toString(36),
            name: name,
            era: era,
            icon: icon,
            desc: desc,
            thinkers: thinkers.split(',').map(t => t.trim()).filter(Boolean)
        });
        this.saveData();
        this.updateView();
    },
    
    // ---- ETHIK ----
    addEthicsTopic() {
        const title = prompt('⚖️ Titel des Ethik-Themas:');
        if (!title) return;
        const desc = prompt('📝 Beschreibung:') || '';
        
        this.ethicsTopics.push({
            id: 'e_' + Date.now().toString(36),
            title: title,
            desc: desc
        });
        this.saveData();
        this.updateView();
    },
    
    deleteEthicsTopic(topicId) {
        if (!confirm('Ethik-Thema wirklich löschen?')) return;
        this.ethicsTopics = this.ethicsTopics.filter(e => e.id !== topicId);
        this.saveData();
        this.updateView();
    },
    
    // ---- ZITATE ----
    toggleFavorite(quoteId) {
        const index = this.favoriteQuotes.indexOf(quoteId);
        if (index === -1) {
            this.favoriteQuotes.push(quoteId);
        } else {
            this.favoriteQuotes.splice(index, 1);
        }
        this.saveData();
        this.updateView();
    },
    
    addQuote() {
        const text = prompt('💬 Zitat-Text:');
        if (!text) return;
        const thinker = prompt('🧠 Denker:', 'Unbekannt') || 'Unbekannt';
        
        this.quotes.push({
            id: 'q_' + Date.now().toString(36),
            text: text,
            thinker: thinker
        });
        this.saveData();
        this.updateView();
    },
    
    deleteQuote(quoteId) {
        if (!confirm('Zitat wirklich löschen?')) return;
        this.quotes = this.quotes.filter(q => q.id !== quoteId);
        this.favoriteQuotes = this.favoriteQuotes.filter(id => id !== quoteId);
        this.saveData();
        this.updateView();
    },
    
    // ---- QUIZ ----
    selectQuizAnswer(index) {
        if (this.quizAnswered) return;
        this.quizAnswered = true;
        this.quizSelected = index;
        const q = this.quizQuestions[this.quizCurrentIndex || 0];
        if (index === q.correct) {
            this.quizScore = (this.quizScore || 0) + 1;
        }
        this.updateView();
    },
    
    nextQuizQuestion() {
        const total = this.quizQuestions.length;
        const current = (this.quizCurrentIndex || 0);
        if (current < total - 1) {
            this.quizCurrentIndex = current + 1;
            this.quizAnswered = false;
            this.quizSelected = null;
            this.updateView();
        } else {
            this.showQuizResult();
        }
    },
    
    showQuizResult() {
        const total = this.quizQuestions.length;
        const score = this.quizScore || 0;
        const percent = Math.round((score / total) * 100);
        const passed = percent >= 60;
        
        alert(
            `🏁 Philosophie-Quiz abgeschlossen!\n\n` +
            `✅ Richtig: ${score} von ${total}\n` +
            `📊 Ergebnis: ${percent}%\n` +
            `${passed ? '🎉 Bestanden!' : '📚 Weiter üben!'}`
        );
        
        this.setMode('dashboard');
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
                if (this.currentMode === 'quiz') {
                    if (e.key >= '1' && e.key <= '4') {
                        const idx = parseInt(e.key) - 1;
                        this.selectQuizAnswer(idx);
                    }
                    if (e.key === 'Enter' && this.quizAnswered) {
                        this.nextQuizQuestion();
                    }
                }
                if (e.key === 'Escape') {
                    this.setMode('dashboard');
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🧠 Philosophy Center App wird installiert...');
        this.loadData();
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Philosophy Center App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
PhilosophyCenterApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.PhilosophyCenterApp = PhilosophyCenterApp;

console.log('🧠 Philosophy Center App geladen – HalDo AI OS 24.6.0');
