/**
 * HALDO AI OS 24.6.0 – LANGUAGE CENTER APP
 * Sprachen lernen, Übersetzung, Vokabeltrainer und Fortschrittsverfolgung
 * Version: 1.0.0
 */

const LanguageCenterApp = {
    // ---- APP-INFO ----
    id: 'language-center',
    name: 'Language Center',
    icon: '🌍',
    category: 'education',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Sprachen lernen, Übersetzung, Vokabeltrainer und Fortschritt',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'dashboard', // dashboard | courses | vocabulary | translate | quiz | progress
    selectedLanguage: 'de',
    currentCourse: null,
    currentLesson: null,
    quizScore: 0,
    quizAnswered: false,
    quizSelected: null,
    quizCurrentIndex: 0,
    
    // ---- SPRACHEN ----
    languages: [
        { id: 'de', name: 'Deutsch', flag: '🇩🇪', code: 'de' },
        { id: 'en', name: 'Englisch', flag: '🇬🇧', code: 'en' },
        { id: 'fr', name: 'Französisch', flag: '🇫🇷', code: 'fr' },
        { id: 'es', name: 'Spanisch', flag: '🇪🇸', code: 'es' },
        { id: 'tr', name: 'Türkisch', flag: '🇹🇷', code: 'tr' },
        { id: 'ar', name: 'Arabisch', flag: '🇸🇦', code: 'ar' },
        { id: 'ku', name: 'Kurdisch', flag: '🏴', code: 'ku' },
        { id: 'ez', name: 'Êzîdî', flag: '🏴', code: 'ez' },
        { id: 'ru', name: 'Russisch', flag: '🇷🇺', code: 'ru' },
        { id: 'it', name: 'Italienisch', flag: '🇮🇹', code: 'it' }
    ],
    
    // ---- SPRACHKURSE ----
    courses: {
        de: {
            name: 'Deutsch A1',
            lessons: [
                { id: 'l1', title: 'Begrüßung', words: ['Hallo', 'Tschüss', 'Danke', 'Bitte'] },
                { id: 'l2', title: 'Zahlen', words: ['eins', 'zwei', 'drei', 'vier', 'fünf'] },
                { id: 'l3', title: 'Farben', words: ['rot', 'blau', 'grün', 'gelb', 'schwarz'] }
            ]
        },
        en: {
            name: 'English A1',
            lessons: [
                { id: 'l1', title: 'Greetings', words: ['Hello', 'Goodbye', 'Thank you', 'Please'] },
                { id: 'l2', title: 'Numbers', words: ['one', 'two', 'three', 'four', 'five'] },
                { id: 'l3', title: 'Colors', words: ['red', 'blue', 'green', 'yellow', 'black'] }
            ]
        },
        fr: {
            name: 'Français A1',
            lessons: [
                { id: 'l1', title: 'Salutations', words: ['Bonjour', 'Au revoir', 'Merci', 'S\'il vous plaît'] },
                { id: 'l2', title: 'Nombres', words: ['un', 'deux', 'trois', 'quatre', 'cinq'] },
                { id: 'l3', title: 'Couleurs', words: ['rouge', 'bleu', 'vert', 'jaune', 'noir'] }
            ]
        },
        es: {
            name: 'Español A1',
            lessons: [
                { id: 'l1', title: 'Saludos', words: ['Hola', 'Adiós', 'Gracias', 'Por favor'] },
                { id: 'l2', title: 'Números', words: ['uno', 'dos', 'tres', 'cuatro', 'cinco'] },
                { id: 'l3', title: 'Colores', words: ['rojo', 'azul', 'verde', 'amarillo', 'negro'] }
            ]
        },
        tr: {
            name: 'Türkçe A1',
            lessons: [
                { id: 'l1', title: 'Selamlaşma', words: ['Merhaba', 'Güle güle', 'Teşekkürler', 'Lütfen'] },
                { id: 'l2', title: 'Sayılar', words: ['bir', 'iki', 'üç', 'dört', 'beş'] },
                { id: 'l3', title: 'Renkler', words: ['kırmızı', 'mavi', 'yeşil', 'sarı', 'siyah'] }
            ]
        }
    },
    
    // ---- VOKABELN ----
    vocabulary: [
        { id: 'v1', language: 'de', word: 'Hallo', translation: 'Hello', category: 'Begrüßung' },
        { id: 'v2', language: 'de', word: 'Danke', translation: 'Thank you', category: 'Begrüßung' },
        { id: 'v3', language: 'de', word: 'rot', translation: 'red', category: 'Farben' },
        { id: 'v4', language: 'de', word: 'blau', translation: 'blue', category: 'Farben' },
        { id: 'v5', language: 'en', word: 'Hello', translation: 'Hallo', category: 'Greetings' },
        { id: 'v6', language: 'en', word: 'Thank you', translation: 'Danke', category: 'Greetings' },
        { id: 'v7', language: 'en', word: 'red', translation: 'rot', category: 'Colors' },
        { id: 'v8', language: 'en', word: 'blue', translation: 'blau', category: 'Colors' },
        { id: 'v9', language: 'fr', word: 'Bonjour', translation: 'Hallo', category: 'Salutations' },
        { id: 'v10', language: 'fr', word: 'Merci', translation: 'Danke', category: 'Salutations' },
        { id: 'v11', language: 'es', word: 'Hola', translation: 'Hallo', category: 'Saludos' },
        { id: 'v12', language: 'es', word: 'Gracias', translation: 'Danke', category: 'Saludos' }
    ],
    
    // ---- ÜBERSETZUNGEN ----
    translations: [
        { id: 't1', from: 'de', to: 'en', text: 'Hallo', translation: 'Hello' },
        { id: 't2', from: 'de', to: 'en', text: 'Danke', translation: 'Thank you' },
        { id: 't3', from: 'en', to: 'de', text: 'Hello', translation: 'Hallo' },
        { id: 't4', from: 'en', to: 'de', text: 'Thank you', translation: 'Danke' }
    ],
    
    // ---- FORTSCHRITT ----
    progress: {},
    
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
            console.log('🌍 Language Center App registriert');
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
        this.selectedLanguage = params.language || 'de';
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
        this.progress = Storage.get('language_progress', {});
        this.vocabulary = Storage.get('language_vocabulary', this.vocabulary);
        this.translations = Storage.get('language_translations', this.translations);
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('language_progress', this.progress);
        Storage.set('language_vocabulary', this.vocabulary);
        Storage.set('language_translations', this.translations);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'dashboard': return this.renderDashboard();
            case 'courses': return this.renderCourses();
            case 'vocabulary': return this.renderVocabulary();
            case 'translate': return this.renderTranslate();
            case 'quiz': return this.renderQuiz();
            case 'progress': return this.renderProgress();
            default: return this.renderDashboard();
        }
    },
    
    // ---- DASHBOARD ----
    renderDashboard() {
        const totalVocab = this.vocabulary.length;
        const totalCourses = Object.keys(this.courses).length;
        const learnedWords = Object.values(this.progress).filter(p => p > 0).length;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn ${this.currentMode === 'dashboard' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('courses')">📚 Kurse</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('vocabulary')">📖 Vokabeln</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('translate')">🌐 Übersetzung</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('quiz')">🧠 Quiz</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('progress')">📈 Fortschritt</button>
                </div>
                
                <!-- Statistiken -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;padding:12px;">
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">🌍</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalCourses}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Sprachkurse</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">📖</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalVocab}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Vokabeln</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">✅</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${learnedWords}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Gelernt</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">📊</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalVocab > 0 ? Math.round((learnedWords / totalVocab) * 100) : 0}%</div>
                        <div style="font-size:10px;color:var(--text-muted);">Fortschritt</div>
                    </div>
                </div>
                
                <!-- Sprache auswählen -->
                <div style="padding:0 12px 12px 12px;">
                    <div style="padding:16px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:14px;color:var(--text-secondary);">🌍 Sprache wählen</div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-top:6px;">
                            ${this.languages.map(l => `
                                <button class="haldo-btn ${this.selectedLanguage === l.id ? '' : 'haldo-btn-secondary'}" style="font-size:10px;padding:3px 10px;" onclick="LanguageCenterApp.selectLanguage('${l.id}')">
                                    ${l.flag} ${l.name}
                                </button>
                            `).join('')}
                        </div>
                        <div style="margin-top:8px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                            <button class="haldo-btn" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('courses')">📚 Kurse</button>
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('vocabulary')">📖 Vokabeln</button>
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('quiz')">🧠 Quiz starten</button>
                        </div>
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🌍 Language Center</span>
                    <span>${this.languages.find(l => l.id === this.selectedLanguage)?.flag} ${this.languages.find(l => l.id === this.selectedLanguage)?.name || 'Deutsch'}</span>
                </div>
            </div>
        `;
    },
    
    // ---- KURSE ----
    renderCourses() {
        const lang = this.languages.find(l => l.id === this.selectedLanguage);
        const course = this.courses[this.selectedLanguage];
        const progress = this.progress[this.selectedLanguage] || 0;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;align-items:center;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn ${this.currentMode === 'courses' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('courses')">📚 Kurse</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('vocabulary')">📖 Vokabeln</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('translate')">🌐 Übersetzung</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('quiz')">🧠 Quiz</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('progress')">📈 Fortschritt</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <span style="font-size:11px;color:var(--text-muted);">${lang?.flag || '🌍'} ${lang?.name || 'Deutsch'}</span>
                </div>
                
                <!-- Kurs-Inhalt -->
                <div style="flex:1;overflow-y:auto;padding:12px;">
                    ${course ? `
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                            <h3 style="color:var(--text-primary);font-size:14px;margin:0;">${course.name}</h3>
                            <div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap;">
                                <span style="font-size:10px;color:var(--text-muted);">${course.lessons.length} Lektionen</span>
                                <span style="font-size:10px;color:var(--text-muted);">Fortschritt: ${progress}%</span>
                            </div>
                            <div style="width:100%;height:4px;background:var(--glass-border);border-radius:10px;margin-top:4px;overflow:hidden;">
                                <div style="width:${progress}%;height:100%;background:var(--primary, #6C3CE1);border-radius:10px;transition:width 0.3s ease;"></div>
                            </div>
                        </div>
                        
                        <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                            ${course.lessons.map((lesson, index) => {
                                const isCompleted = progress > ((index) / course.lessons.length * 100);
                                return `
                                    <div style="
                                        padding:10px 12px;
                                        background: ${isCompleted ? 'rgba(0,255,136,0.08)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                        border-radius:8px;
                                        border:1px solid ${isCompleted ? 'var(--success, #00FF88)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                        cursor:pointer;
                                        transition: all 0.15s ease;
                                    " onclick="LanguageCenterApp.startLesson('${lesson.id}')">
                                        <div style="display:flex;gap:8px;align-items:center;">
                                            <span style="font-size:16px;">${isCompleted ? '✅' : '📖'}</span>
                                            <div>
                                                <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${lesson.title}</div>
                                                <div style="font-size:9px;color:var(--text-muted);">${lesson.words.length} Wörter</div>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Kein Kurs für diese Sprache verfügbar</p>
                            <button class="haldo-btn" style="font-size:11px;margin-top:8px;" onclick="LanguageCenterApp.addCourse()">+ Kurs hinzufügen</button>
                        </div>
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- VOKABELN ----
    renderVocabulary() {
        const langVocab = this.vocabulary.filter(v => v.language === this.selectedLanguage);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;align-items:center;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('courses')">📚 Kurse</button>
                    <button class="haldo-btn ${this.currentMode === 'vocabulary' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('vocabulary')">📖 Vokabeln</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('translate')">🌐 Übersetzung</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('quiz')">🧠 Quiz</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('progress')">📈 Fortschritt</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="LanguageCenterApp.addVocabulary()">+</button>
                </div>
                
                <!-- Vokabeln -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${langVocab.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Keine Vokabeln für diese Sprache</p>
                        </div>
                    ` : `
                        ${langVocab.map(v => `
                            <div style="
                                padding:8px 12px;
                                margin:3px 0;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:6px;
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                                display:flex;
                                justify-content:space-between;
                                align-items:center;
                            ">
                                <div>
                                    <span style="font-size:13px;font-weight:600;color:var(--text-primary);">${v.word}</span>
                                    <span style="font-size:11px;color:var(--text-secondary);margin-left:8px;">→ ${v.translation}</span>
                                    <span style="font-size:9px;color:var(--text-muted);margin-left:8px;">${v.category}</span>
                                </div>
                                <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();LanguageCenterApp.deleteVocabulary('${v.id}')">✕</button>
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- ÜBERSETZUNG ----
    renderTranslate() {
        const languages = this.languages;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('courses')">📚 Kurse</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('vocabulary')">📖 Vokabeln</button>
                    <button class="haldo-btn ${this.currentMode === 'translate' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('translate')">🌐 Übersetzung</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('quiz')">🧠 Quiz</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('progress')">📈 Fortschritt</button>
                </div>
                
                <!-- Übersetzer -->
                <div style="flex:1;overflow-y:auto;padding:12px;">
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            <select id="translate-from" class="haldo-input" style="flex:1;font-size:11px;min-width:80px;">
                                ${languages.map(l => `
                                    <option value="${l.id}" ${l.id === 'de' ? 'selected' : ''}>${l.flag} ${l.name}</option>
                                `).join('')}
                            </select>
                            <span style="font-size:16px;color:var(--text-muted);">→</span>
                            <select id="translate-to" class="haldo-input" style="flex:1;font-size:11px;min-width:80px;">
                                ${languages.map(l => `
                                    <option value="${l.id}" ${l.id === 'en' ? 'selected' : ''}>${l.flag} ${l.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div style="margin-top:8px;">
                            <textarea id="translate-input" class="haldo-input" placeholder="Text zum Übersetzen..." style="width:100%;min-height:80px;font-size:13px;resize:vertical;"></textarea>
                        </div>
                        <button class="haldo-btn" style="font-size:12px;margin-top:4px;" onclick="LanguageCenterApp.doTranslate()">🌐 Übersetzen</button>
                        <div id="translate-result" style="margin-top:8px;padding:8px;background:rgba(0,0,0,0.1);border-radius:6px;min-height:40px;font-size:13px;color:var(--text-secondary);">
                            Übersetzung erscheint hier
                        </div>
                    </div>
                    
                    <div style="margin-top:8px;padding:8px 12px;background:rgba(0,255,136,0.05);border-radius:8px;border:1px solid rgba(0,255,136,0.1);">
                        <div style="font-size:11px;color:var(--text-secondary);">💡 Tipp: Mit einem API-Key wird die Übersetzung genauer.</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ---- QUIZ ----
    renderQuiz() {
        const langVocab = this.vocabulary.filter(v => v.language === this.selectedLanguage);
        const total = langVocab.length;
        const current = this.quizCurrentIndex || 0;
        const q = langVocab[current];
        const isAnswered = this.quizAnswered || false;
        const selected = this.quizSelected || null;
        
        if (!q || total === 0) {
            return `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;padding:20px;text-align:center;">
                    <div style="font-size:48px;">🧠</div>
                    <div style="font-size:18px;font-weight:600;color:var(--text-primary);">Keine Vokabeln zum Lernen</div>
                    <p style="font-size:12px;color:var(--text-secondary);">Füge zuerst Vokabeln hinzu oder wähle eine andere Sprache</p>
                    <button class="haldo-btn" style="font-size:12px;padding:6px 16px;" onclick="LanguageCenterApp.setMode('vocabulary')">📖 Vokabeln hinzufügen</button>
                </div>
            `;
        }
        
        const progress = ((current + 1) / total * 100);
        const isCorrect = selected === 0;
        const options = [
            q.translation,
            this.getRandomTranslation(q.id),
            this.getRandomTranslation(q.id),
            this.getRandomTranslation(q.id)
        ].sort(() => Math.random() - 0.5);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;align-items:center;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="LanguageCenterApp.setMode('dashboard')">✕ Beenden</button>
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
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:10px;color:var(--text-muted);">Was bedeutet dieses Wort?</div>
                        <div style="font-size:24px;font-weight:700;color:var(--text-primary);margin-top:4px;">${q.word}</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${q.category}</div>
                    </div>
                    
                    <div style="margin-top:8px;display:flex;flex-direction:column;gap:4px;">
                        ${options.map((opt, idx) => {
                            const isCorrectOpt = opt === q.translation;
                            return `
                                <div style="
                                    padding:10px 12px;
                                    background: ${isAnswered ? (isCorrectOpt ? 'rgba(0,255,136,0.15)' : idx === selected ? 'rgba(255,59,48,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))') : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                    border: 2px solid ${isAnswered ? (isCorrectOpt ? 'var(--success, #00FF88)' : idx === selected ? 'var(--danger, #FF3B30)' : 'var(--glass-border, rgba(255,255,255,0.06))') : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                    border-radius:8px;
                                    cursor: ${isAnswered ? 'default' : 'pointer'};
                                    transition: all 0.15s ease;
                                " onclick="${isAnswered ? '' : `LanguageCenterApp.selectQuizAnswer(${idx}, '${q.translation}')`}">
                                    <div style="display:flex;gap:8px;align-items:center;">
                                        <div style="font-size:12px;font-weight:600;color:${isAnswered ? (isCorrectOpt ? 'var(--success, #00FF88)' : idx === selected ? 'var(--danger, #FF3B30)' : 'var(--text-secondary)') : 'var(--text-secondary)'};">
                                            ${String.fromCharCode(65 + idx)}
                                        </div>
                                        <div style="font-size:13px;color:${isAnswered ? (isCorrectOpt ? 'var(--success, #00FF88)' : idx === selected ? 'var(--danger, #FF3B30)' : 'var(--text-secondary)') : 'var(--text-primary)'};">
                                            ${opt}
                                        </div>
                                        ${isAnswered && isCorrectOpt ? ' ✅' : ''}
                                        ${isAnswered && idx === selected && !isCorrectOpt ? ' ❌' : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    ${isAnswered ? `
                        <div style="margin-top:8px;padding:8px 12px;background:${isCorrect ? 'rgba(0,255,136,0.08)' : 'rgba(255,59,48,0.08)'};border-radius:8px;border:1px solid ${isCorrect ? 'var(--success, #00FF88)' : 'var(--danger, #FF3B30)'};">
                            <div style="font-size:12px;font-weight:600;color:${isCorrect ? 'var(--success, #00FF88)' : 'var(--danger, #FF3B30)'};">
                                ${isCorrect ? '✅ Richtig!' : '❌ Falsch!'}
                            </div>
                            <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">
                                Richtige Übersetzung: ${q.translation}
                            </div>
                            <button class="haldo-btn" style="font-size:11px;margin-top:6px;padding:4px 12px;" onclick="LanguageCenterApp.nextQuizQuestion()">
                                ${current < total - 1 ? '➡️ Nächste Frage' : '🏁 Ergebnis anzeigen'}
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🧠 ${total} Vokabeln</span>
                    <span>✅ ${this.quizScore || 0} richtig</span>
                </div>
            </div>
        `;
    },
    
    // ---- FORTSCHRITT ----
    renderProgress() {
        const totalVocab = this.vocabulary.length;
        const learnedWords = Object.values(this.progress).filter(p => p > 0).length;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('courses')">📚 Kurse</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('vocabulary')">📖 Vokabeln</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('translate')">🌐 Übersetzung</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('quiz')">🧠 Quiz</button>
                    <button class="haldo-btn ${this.currentMode === 'progress' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="LanguageCenterApp.setMode('progress')">📈 Fortschritt</button>
                </div>
                
                <!-- Fortschritt -->
                <div style="flex:1;overflow-y:auto;padding:12px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                            <div style="font-size:24px;">📊</div>
                            <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalVocab > 0 ? Math.round((learnedWords / totalVocab) * 100) : 0}%</div>
                            <div style="font-size:10px;color:var(--text-muted);">Gesamtfortschritt</div>
                        </div>
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                            <div style="font-size:24px;">✅</div>
                            <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${learnedWords}</div>
                            <div style="font-size:10px;color:var(--text-muted);">Gelernte Wörter</div>
                        </div>
                    </div>
                    
                    <div style="margin-top:12px;">
                        <div style="font-size:12px;font-weight:600;color:var(--text-primary);">🌍 Sprachen-Fortschritt</div>
                        ${this.languages.map(l => {
                            const count = this.vocabulary.filter(v => v.language === l.id).length;
                            const learned = Object.keys(this.progress).filter(k => k.startsWith(l.id) && this.progress[k] > 0).length;
                            const pct = count > 0 ? Math.round((learned / count) * 100) : 0;
                            return `
                                <div style="
                                    padding:8px 12px;
                                    margin:4px 0;
                                    background: var(--glass-bg, rgba(255,255,255,0.04));
                                    border-radius:6px;
                                    border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                                ">
                                    <div style="display:flex;justify-content:space-between;align-items:center;">
                                        <div style="display:flex;gap:6px;align-items:center;">
                                            <span style="font-size:20px;">${l.flag}</span>
                                            <span style="font-size:12px;color:var(--text-primary);">${l.name}</span>
                                        </div>
                                        <span style="font-size:11px;color:${pct > 70 ? 'var(--success)' : pct > 40 ? 'var(--warning)' : 'var(--text-muted)'};">${pct}%</span>
                                    </div>
                                    <div style="width:100%;height:3px;background:var(--glass-border);border-radius:10px;margin-top:4px;overflow:hidden;">
                                        <div style="width:${pct}%;height:100%;background:var(--primary, #6C3CE1);border-radius:10px;transition:width 0.3s ease;"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
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
    
    selectLanguage(languageId) {
        this.selectedLanguage = languageId;
        this.saveData();
        this.updateView();
    },
    
    // ---- KURSE ----
    startLesson(lessonId) {
        const course = this.courses[this.selectedLanguage];
        if (!course) return;
        const lesson = course.lessons.find(l => l.id === lessonId);
        if (!lesson) return;
        
        // Vokabeln der Lektion anzeigen
        const langVocab = this.vocabulary.filter(v => v.language === this.selectedLanguage);
        const lessonWords = lesson.words || [];
        
        const content = `
            <div style="padding:12px;">
                <h3 style="color:var(--text-primary);font-size:14px;margin:0;">📖 ${lesson.title}</h3>
                <div style="margin-top:8px;">
                    ${lessonWords.map(w => `
                        <div style="
                            padding:6px 10px;
                            margin:4px 0;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:4px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            font-size:12px;
                            color:var(--text-primary);
                        ">
                            ${w}
                        </div>
                    `).join('')}
                </div>
                <button class="haldo-btn" style="font-size:11px;margin-top:8px;" onclick="LanguageCenterApp.learnLesson('${lesson.id}')">📚 Lernen</button>
            </div>
        `;
        
        WindowManager.openWindow(
            'lesson-detail',
            '📚 ' + lesson.title,
            content,
            '📚',
            400,
            350
        );
    },
    
    learnLesson(lessonId) {
        const course = this.courses[this.selectedLanguage];
        if (!course) return;
        const lesson = course.lessons.find(l => l.id === lessonId);
        if (!lesson) return;
        
        // Fortschritt aktualisieren
        const index = course.lessons.findIndex(l => l.id === lessonId);
        const progress = Math.round(((index + 1) / course.lessons.length) * 100);
        this.progress[this.selectedLanguage] = progress;
        this.saveData();
        
        alert(`✅ Lektion "${lesson.title}" abgeschlossen!\n📊 Fortschritt: ${progress}%`);
        this.updateView();
    },
    
    addCourse() {
        const langId = prompt('🌍 Sprach-ID (z.B. de, en, fr):', 'de');
        if (!langId) return;
        const name = prompt('📚 Kursname (z.B. Deutsch A1):', `${langId.toUpperCase()} A1`) || `${langId.toUpperCase()} A1`;
        
        this.courses[langId] = {
            name: name,
            lessons: [
                { id: 'l1', title: 'Lektion 1', words: ['Wort1', 'Wort2', 'Wort3'] }
            ]
        };
        this.saveData();
        this.updateView();
    },
    
    // ---- VOKABELN ----
    addVocabulary() {
        const word = prompt('📖 Wort:');
        if (!word) return;
        const translation = prompt('📖 Übersetzung:');
        if (!translation) return;
        const category = prompt('📂 Kategorie:', 'Allgemein') || 'Allgemein';
        const language = this.selectedLanguage || 'de';
        
        this.vocabulary.push({
            id: 'v_' + Date.now().toString(36),
            language: language,
            word: word,
            translation: translation,
            category: category
        });
        this.saveData();
        this.updateView();
    },
    
    deleteVocabulary(vocabId) {
        if (!confirm('Vokabel wirklich löschen?')) return;
        this.vocabulary = this.vocabulary.filter(v => v.id !== vocabId);
        this.saveData();
        this.updateView();
    },
    
    // ---- ÜBERSETZUNG ----
    doTranslate() {
        const input = document.getElementById('translate-input');
        const result = document.getElementById('translate-result');
        const from = document.getElementById('translate-from');
        const to = document.getElementById('translate-to');
        
        if (!input || !result || !from || !to) return;
        const text = input.value.trim();
        if (!text) {
            result.textContent = '⚠️ Bitte Text eingeben.';
            return;
        }
        
        const fromLang = from.value;
        const toLang = to.value;
        
        // Suche in Vokabeln
        const found = this.vocabulary.find(v => 
            v.language === fromLang && 
            v.word.toLowerCase() === text.toLowerCase()
        );
        
        if (found) {
            result.textContent = `📖 ${found.word} → ${found.translation}`;
            return;
        }
        
        // Suche in Übersetzungen
        const trans = this.translations.find(t => 
            t.from === fromLang && 
            t.to === toLang && 
            t.text.toLowerCase() === text.toLowerCase()
        );
        
        if (trans) {
            result.textContent = `📖 ${trans.text} → ${trans.translation}`;
            return;
        }
        
        // Fallback mit AI
        if (typeof AICore !== 'undefined' && AICore.hasValidKey()) {
            result.textContent = '🤖 Übersetze mit KI...';
            const prompt = `Übersetze den folgenden Text von ${fromLang} nach ${toLang}:\n\n${text}`;
            AICore.simpleChat(prompt).then(reply => {
                result.textContent = `📖 Übersetzung:\n${reply}`;
            });
        } else {
            result.textContent = `⚠️ Keine Übersetzung für "${text}" gefunden. Füge sie zu den Vokabeln hinzu.`;
        }
    },
    
    // ---- QUIZ ----
    selectQuizAnswer(index, correctTranslation) {
        if (this.quizAnswered) return;
        this.quizAnswered = true;
        this.quizSelected = index;
        
        const langVocab = this.vocabulary.filter(v => v.language === this.selectedLanguage);
        const q = langVocab[this.quizCurrentIndex || 0];
        
        // Prüfen ob die ausgewählte Option richtig ist
        const options = [q.translation, this.getRandomTranslation(q.id), this.getRandomTranslation(q.id), this.getRandomTranslation(q.id)].sort(() => Math.random() - 0.5);
        const isCorrect = options[index] === q.translation;
        
        if (isCorrect) {
            this.quizScore = (this.quizScore || 0) + 1;
            // Fortschritt aktualisieren
            const key = `${this.selectedLanguage}_${q.id}`;
            this.progress[key] = (this.progress[key] || 0) + 1;
            this.saveData();
        }
        
        this.updateView();
    },
    
    getRandomTranslation(excludeId) {
        const filtered = this.vocabulary.filter(v => v.id !== excludeId);
        if (filtered.length === 0) return '???';
        return filtered[Math.floor(Math.random() * filtered.length)].translation;
    },
    
    nextQuizQuestion() {
        const langVocab = this.vocabulary.filter(v => v.language === this.selectedLanguage);
        const total = langVocab.length;
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
        const langVocab = this.vocabulary.filter(v => v.language === this.selectedLanguage);
        const total = langVocab.length;
        const score = this.quizScore || 0;
        const percent = Math.round((score / total) * 100);
        const passed = percent >= 60;
        
        alert(
            `🏁 Vokabel-Quiz abgeschlossen!\n\n` +
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
        console.log('🌍 Language Center App wird installiert...');
        this.loadData();
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Language Center App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
LanguageCenterApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.LanguageCenterApp = LanguageCenterApp;

console.log('🌍 Language Center App geladen – HalDo AI OS 24.6.0');
