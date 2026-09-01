/**
 * HALDO AI OS 24.6.0 – UNIVERSITY CENTER
 * Professionelle Bildungs-App mit Studiengängen, Kursen, Wissen und Bibliothek
 * Version: 1.0.0
 */

const UniversityCenterApp = {
    // ---- APP-INFO ----
    id: 'university-center',
    name: 'University Center',
    icon: '🎓',
    category: 'education',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Studiengänge, Kurse, Wissensdatenbank und Bibliothek',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'dashboard', // dashboard | courses | knowledge | library | professors | quiz
    selectedCourse: null,
    selectedProfessor: null,
    selectedBook: null,
    quizScore: 0,
    currentQuestionIndex: 0,
    answered: false,
    selectedAnswer: null,
    
    // ---- DATEN ----
    courses: [],
    knowledge: [],
    books: [],
    professors: [],
    quizHistory: [],
    
    // ---- STANDARD-STUDIENGÄNGE ----
    defaultCourses: [
        { id: 'c1', name: 'Informatik', code: 'INF-101', professor: 'Dr. Müller', credits: 6, description: 'Grundlagen der Informatik, Algorithmen und Datenstrukturen' },
        { id: 'c2', name: 'Mathematik', code: 'MATH-101', professor: 'Dr. Schmidt', credits: 8, description: 'Analysis, Lineare Algebra und Statistik' },
        { id: 'c3', name: 'Physik', code: 'PHY-101', professor: 'Dr. Weber', credits: 6, description: 'Mechanik, Thermodynamik und Elektrodynamik' },
        { id: 'c4', name: 'Chemie', code: 'CHE-101', professor: 'Dr. Fischer', credits: 6, description: 'Allgemeine Chemie, Organische Chemie und Biochemie' },
        { id: 'c5', name: 'Biologie', code: 'BIO-101', professor: 'Dr. Wagner', credits: 6, description: 'Zellbiologie, Genetik und Ökologie' },
        { id: 'c6', name: 'Psychologie', code: 'PSY-101', professor: 'Dr. Becker', credits: 6, description: 'Allgemeine Psychologie, Entwicklungspsychologie und Sozialpsychologie' }
    ],
    
    // ---- STANDARD-WISSEN ----
    defaultKnowledge: [
        { id: 'k1', category: 'Wissenschaft', title: 'Quantenphysik', content: 'Die Quantenphysik beschreibt die Gesetze auf atomarer und subatomarer Ebene.', tags: ['Physik', 'Quanten'] },
        { id: 'k2', category: 'Geschichte', title: 'Das Römische Reich', content: 'Das Römische Reich war eine der größten Zivilisationen der Antike.', tags: ['Geschichte', 'Antike'] },
        { id: 'k3', category: 'Technologie', title: 'Künstliche Intelligenz', content: 'KI ist die Simulation menschlicher Intelligenz durch Maschinen.', tags: ['Technologie', 'AI'] },
        { id: 'k4', category: 'Philosophie', title: 'Platon', content: 'Platon war ein griechischer Philosoph und Schüler von Sokrates.', tags: ['Philosophie', 'Griechenland'] },
        { id: 'k5', category: 'Kunst', title: 'Renaissance', content: 'Die Renaissance war eine Epoche des kulturellen Wandels in Europa.', tags: ['Kunst', 'Geschichte'] }
    ],
    
    // ---- STANDARD-BÜCHER ----
    defaultBooks: [
        { id: 'b1', title: 'Algorithmen', author: 'Robert Sedgewick', year: 2019, category: 'Informatik', pages: 400 },
        { id: 'b2', title: 'Mathematik für Ingenieure', author: 'Lothar Papula', year: 2020, category: 'Mathematik', pages: 600 },
        { id: 'b3', title: 'Physik', author: 'Paul A. Tipler', year: 2018, category: 'Physik', pages: 500 },
        { id: 'b4', title: 'Chemie', author: 'Theodor W. Hänsch', year: 2021, category: 'Chemie', pages: 450 },
        { id: 'b5', title: 'Biologie', author: 'Neil A. Campbell', year: 2019, category: 'Biologie', pages: 550 }
    ],
    
    // ---- STANDARD-PROFESSOREN ----
    defaultProfessors: [
        { id: 'p1', name: 'Dr. Müller', title: 'Professor für Informatik', department: 'Informatik', email: 'mueller@uni.de', room: 'A-101' },
        { id: 'p2', name: 'Dr. Schmidt', title: 'Professor für Mathematik', department: 'Mathematik', email: 'schmidt@uni.de', room: 'B-201' },
        { id: 'p3', name: 'Dr. Weber', title: 'Professor für Physik', department: 'Physik', email: 'weber@uni.de', room: 'C-301' },
        { id: 'p4', name: 'Dr. Fischer', title: 'Professor für Chemie', department: 'Chemie', email: 'fischer@uni.de', room: 'D-401' },
        { id: 'p5', name: 'Dr. Wagner', title: 'Professor für Biologie', department: 'Biologie', email: 'wagner@uni.de', room: 'E-501' }
    ],
    
    // ---- QUIZ-FRAGEN ----
    quizQuestions: [
        { id: 'q1', category: 'Informatik', question: 'Was ist eine Datenstruktur?', options: ['Eine Möglichkeit Daten zu organisieren', 'Ein Programmiersprache', 'Ein Betriebssystem', 'Ein Algorithmus'], correct: 0 },
        { id: 'q2', category: 'Mathematik', question: 'Was ist die Ableitung von x²?', options: ['2x', 'x²', '2x²', '1'], correct: 0 },
        { id: 'q3', category: 'Physik', question: 'Was ist die Lichtgeschwindigkeit?', options: ['300.000 km/s', '150.000 km/s', '400.000 km/s', '100.000 km/s'], correct: 0 },
        { id: 'q4', category: 'Chemie', question: 'Was ist H₂O?', options: ['Wasser', 'Wasserstoff', 'Sauerstoff', 'Kohlenstoff'], correct: 0 },
        { id: 'q5', category: 'Biologie', question: 'Was ist die DNA?', options: ['Träger der Erbinformation', 'Eiweiß', 'Fett', 'Kohlenhydrat'], correct: 0 },
        { id: 'q6', category: 'Informatik', question: 'Was bedeutet AI?', options: ['Artificial Intelligence', 'Algorithm Intelligence', 'Automatic Integration', 'Applied Informatics'], correct: 0 },
        { id: 'q7', category: 'Mathematik', question: 'Was ist Pi?', options: ['3,14159', '2,71828', '1,41421', '0,57721'], correct: 0 },
        { id: 'q8', category: 'Physik', question: 'Was ist ein Photon?', options: ['Ein Lichtquant', 'Ein Elektron', 'Ein Proton', 'Ein Neutron'], correct: 0 }
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
            console.log('🎓 University Center App registriert');
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
        this.courses = Storage.get('university_courses', this.defaultCourses);
        this.knowledge = Storage.get('university_knowledge', this.defaultKnowledge);
        this.books = Storage.get('university_books', this.defaultBooks);
        this.professors = Storage.get('university_professors', this.defaultProfessors);
        this.quizHistory = Storage.get('university_quiz_history', []);
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('university_courses', this.courses);
        Storage.set('university_knowledge', this.knowledge);
        Storage.set('university_books', this.books);
        Storage.set('university_professors', this.professors);
        Storage.set('university_quiz_history', this.quizHistory);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'dashboard': return this.renderDashboard();
            case 'courses': return this.renderCourses();
            case 'knowledge': return this.renderKnowledge();
            case 'library': return this.renderLibrary();
            case 'professors': return this.renderProfessors();
            case 'quiz': return this.renderQuiz();
            default: return this.renderDashboard();
        }
    },
    
    // ---- DASHBOARD ----
    renderDashboard() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn ${this.currentMode === 'dashboard' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('courses')">📚 Kurse</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('knowledge')">🧠 Wissen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('library')">📖 Bibliothek</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('professors')">👨‍🏫 Professoren</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('quiz')">🧠 Quiz</button>
                </div>
                
                <!-- Statistiken -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;padding:12px;">
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">📚</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.courses.length}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Kurse</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">🧠</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.knowledge.length}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Wissen</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">📖</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.books.length}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Bücher</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">👨‍🏫</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.professors.length}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Professoren</div>
                    </div>
                </div>
                
                <!-- Willkommen -->
                <div style="padding:0 12px 12px 12px;">
                    <div style="padding:16px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:32px;">🎓</div>
                        <div style="font-size:16px;font-weight:700;color:var(--text-primary);">Willkommen im University Center</div>
                        <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">Entdecke Kurse, Wissen, Bücher und Professoren</div>
                        <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap;">
                            <button class="haldo-btn" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('courses')">📚 Zu den Kursen</button>
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('quiz')">🧠 Quiz starten</button>
                        </div>
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🎓 University Center</span>
                    <span>${this.quizHistory.length} Quiz absolviert</span>
                </div>
            </div>
        `;
    },
    
    // ---- KURSE ----
    renderCourses() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn ${this.currentMode === 'courses' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('courses')">📚 Kurse</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('knowledge')">🧠 Wissen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('library')">📖 Bibliothek</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('professors')">👨‍🏫 Professoren</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('quiz')">🧠 Quiz</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="UniversityCenterApp.addCourse()">+</button>
                </div>
                
                <!-- Kurse -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.courses.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Keine Kurse</p>
                        </div>
                    ` : `
                        ${this.courses.map(c => `
                            <div style="
                                padding:10px 12px;
                                margin:4px 0;
                                background: ${this.selectedCourse === c.id ? 'rgba(108,60,225,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                border-radius:8px;
                                border:1px solid ${this.selectedCourse === c.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                cursor:pointer;
                                transition: all 0.15s ease;
                            " onclick="UniversityCenterApp.selectCourse('${c.id}')">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${c.name}</div>
                                        <div style="font-size:10px;color:var(--text-secondary);">${c.code} • ${c.professor} • ${c.credits} ECTS</div>
                                        <div style="font-size:10px;color:var(--text-muted);">${c.description}</div>
                                    </div>
                                    <div style="display:flex;gap:4px;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();UniversityCenterApp.courseInfo('${c.id}')">ℹ️</button>
                                        <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();UniversityCenterApp.deleteCourse('${c.id}')">✕</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- WISSEN ----
    renderKnowledge() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('courses')">📚 Kurse</button>
                    <button class="haldo-btn ${this.currentMode === 'knowledge' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('knowledge')">🧠 Wissen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('library')">📖 Bibliothek</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('professors')">👨‍🏫 Professoren</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('quiz')">🧠 Quiz</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="UniversityCenterApp.addKnowledge()">+</button>
                </div>
                
                <!-- Wissen -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    ${this.knowledge.length === 0 ? `
                        <div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Kein Wissen gespeichert</p>
                        </div>
                    ` : `
                        ${this.knowledge.map(k => `
                            <div style="
                                padding:10px 12px;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:8px;
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            ">
                                <div style="font-size:10px;color:var(--text-muted);">${k.category}</div>
                                <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${k.title}</div>
                                <div style="font-size:10px;color:var(--text-secondary);margin-top:2px;">${k.content}</div>
                                <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;">
                                    ${k.tags.map(tag => `<span style="font-size:8px;padding:1px 6px;background:var(--glass-bg);border-radius:4px;color:var(--text-muted);">#${tag}</span>`).join('')}
                                </div>
                                <div style="display:flex;gap:4px;margin-top:4px;">
                                    <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();UniversityCenterApp.knowledgeInfo('${k.id}')">ℹ️</button>
                                    <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();UniversityCenterApp.deleteKnowledge('${k.id}')">✕</button>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- BIBLIOTHEK ----
    renderLibrary() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('courses')">📚 Kurse</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('knowledge')">🧠 Wissen</button>
                    <button class="haldo-btn ${this.currentMode === 'library' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('library')">📖 Bibliothek</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('professors')">👨‍🏫 Professoren</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('quiz')">🧠 Quiz</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="UniversityCenterApp.addBook()">+</button>
                </div>
                
                <!-- Bücher -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.books.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Keine Bücher</p>
                        </div>
                    ` : `
                        ${this.books.map(b => `
                            <div style="
                                padding:10px 12px;
                                margin:4px 0;
                                background: ${this.selectedBook === b.id ? 'rgba(108,60,225,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                border-radius:8px;
                                border:1px solid ${this.selectedBook === b.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                cursor:pointer;
                                transition: all 0.15s ease;
                            " onclick="UniversityCenterApp.selectBook('${b.id}')">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${b.title}</div>
                                        <div style="font-size:10px;color:var(--text-secondary);">${b.author} • ${b.year} • ${b.category}</div>
                                        <div style="font-size:9px;color:var(--text-muted);">${b.pages} Seiten</div>
                                    </div>
                                    <div style="display:flex;gap:4px;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();UniversityCenterApp.bookInfo('${b.id}')">ℹ️</button>
                                        <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();UniversityCenterApp.deleteBook('${b.id}')">✕</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- PROFESSOREN ----
    renderProfessors() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('courses')">📚 Kurse</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('knowledge')">🧠 Wissen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('library')">📖 Bibliothek</button>
                    <button class="haldo-btn ${this.currentMode === 'professors' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('professors')">👨‍🏫 Professoren</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="UniversityCenterApp.setMode('quiz')">🧠 Quiz</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="UniversityCenterApp.addProfessor()">+</button>
                </div>
                
                <!-- Professoren -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.professors.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Keine Professoren</p>
                        </div>
                    ` : `
                        ${this.professors.map(p => `
                            <div style="
                                padding:10px 12px;
                                margin:4px 0;
                                background: ${this.selectedProfessor === p.id ? 'rgba(108,60,225,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                border-radius:8px;
                                border:1px solid ${this.selectedProfessor === p.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                cursor:pointer;
                                transition: all 0.15s ease;
                            " onclick="UniversityCenterApp.selectProfessor('${p.id}')">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${p.name}</div>
                                        <div style="font-size:10px;color:var(--text-secondary);">${p.title} • ${p.department}</div>
                                        <div style="font-size:9px;color:var(--text-muted);">📧 ${p.email} • Raum ${p.room}</div>
                                    </div>
                                    <div style="display:flex;gap:4px;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();UniversityCenterApp.professorInfo('${p.id}')">ℹ️</button>
                                        <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();UniversityCenterApp.deleteProfessor('${p.id}')">✕</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- QUIZ ----
    renderQuiz() {
        const questions = this.quizQuestions;
        const total = questions.length;
        const current = this.currentQuestionIndex;
        const q = questions[current];
        
        if (!q || total === 0) {
            return `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;padding:20px;text-align:center;">
                    <div style="font-size:48px;">🧠</div>
                    <div style="font-size:18px;font-weight:600;color:var(--text-primary);">Keine Quiz-Fragen</div>
                    <button class="haldo-btn" style="font-size:12px;padding:6px 16px;" onclick="UniversityCenterApp.setMode('dashboard')">📊 Zurück</button>
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
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="UniversityCenterApp.setMode('dashboard')">✕ Beenden</button>
                    <div style="flex:1;text-align:center;font-size:12px;color:var(--text-secondary);">
                        Frage ${current + 1} von ${total}
                    </div>
                    <div style="font-size:11px;color:var(--text-muted);">
                        🎯 ${this.quizScore}/${total}
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
                        <div style="font-size:10px;color:var(--text-muted);">${q.category}</div>
                        <div style="font-size:15px;font-weight:600;color:var(--text-primary);margin-top:4px;">${q.question}</div>
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
                            " onclick="${isAnswered ? '' : `UniversityCenterApp.selectQuizAnswer(${idx})`}">
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
                                ${q.explanation || 'Die richtige Antwort war: ' + q.options[q.correct]}
                            </div>
                            <button class="haldo-btn" style="font-size:11px;margin-top:6px;padding:4px 12px;" onclick="UniversityCenterApp.nextQuizQuestion()">
                                ${current < total - 1 ? '➡️ Nächste Frage' : '🏁 Ergebnis anzeigen'}
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🧠 ${total} Fragen</span>
                    <span>✅ ${this.quizScore} richtig</span>
                </div>
            </div>
        `;
    },
    
    // ---- FUNKTIONEN ----
    setMode(mode) {
        if (mode === 'quiz' && this.currentMode !== 'quiz') {
            this.currentQuestionIndex = 0;
            this.quizScore = 0;
            this.answered = false;
            this.selectedAnswer = null;
        }
        this.currentMode = mode;
        this.updateView();
    },
    
    // ---- KURSE ----
    selectCourse(courseId) {
        this.selectedCourse = this.selectedCourse === courseId ? null : courseId;
        this.updateView();
    },
    
    courseInfo(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;
        alert(
            `📚 ${course.name}\n\n` +
            `📂 Code: ${course.code}\n` +
            `👨‍🏫 Professor: ${course.professor}\n` +
            `📊 ECTS: ${course.credits}\n` +
            `📝 Beschreibung: ${course.description}`
        );
    },
    
    addCourse() {
        const name = prompt('📚 Kurs-Name:');
        if (!name) return;
        const code = prompt('📂 Kurs-Code:', 'XXX-101') || 'XXX-101';
        const professor = prompt('👨‍🏫 Professor:', 'Dr.') || 'Dr.';
        const credits = parseInt(prompt('📊 ECTS:', '6')) || 6;
        const description = prompt('📝 Beschreibung:') || '';
        
        this.courses.push({
            id: 'c_' + Date.now().toString(36),
            name: name,
            code: code,
            professor: professor,
            credits: credits,
            description: description
        });
        this.saveData();
        this.updateView();
    },
    
    deleteCourse(courseId) {
        if (!confirm('Kurs wirklich löschen?')) return;
        this.courses = this.courses.filter(c => c.id !== courseId);
        this.saveData();
        this.updateView();
    },
    
    // ---- WISSEN ----
    knowledgeInfo(knowledgeId) {
        const k = this.knowledge.find(k => k.id === knowledgeId);
        if (!k) return;
        alert(
            `🧠 ${k.title}\n\n` +
            `📂 Kategorie: ${k.category}\n` +
            `📝 Inhalt: ${k.content}\n` +
            `🏷️ Tags: ${k.tags.join(', ')}`
        );
    },
    
    addKnowledge() {
        const title = prompt('🧠 Titel:');
        if (!title) return;
        const category = prompt('📂 Kategorie:', 'Allgemein') || 'Allgemein';
        const content = prompt('📝 Inhalt:') || '';
        const tags = prompt('🏷️ Tags (kommagetrennt):', '') || '';
        
        this.knowledge.push({
            id: 'k_' + Date.now().toString(36),
            category: category,
            title: title,
            content: content,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        });
        this.saveData();
        this.updateView();
    },
    
    deleteKnowledge(knowledgeId) {
        if (!confirm('Wissen wirklich löschen?')) return;
        this.knowledge = this.knowledge.filter(k => k.id !== knowledgeId);
        this.saveData();
        this.updateView();
    },
    
    // ---- BIBLIOTHEK ----
    selectBook(bookId) {
        this.selectedBook = this.selectedBook === bookId ? null : bookId;
        this.updateView();
    },
    
    bookInfo(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;
        alert(
            `📖 ${book.title}\n\n` +
            `👤 Autor: ${book.author}\n` +
            `📂 Kategorie: ${book.category}\n` +
            `📅 Jahr: ${book.year}\n` +
            `📄 Seiten: ${book.pages}`
        );
    },
    
    addBook() {
        const title = prompt('📖 Buch-Titel:');
        if (!title) return;
        const author = prompt('👤 Autor:', 'Unbekannt') || 'Unbekannt';
        const category = prompt('📂 Kategorie:', 'Allgemein') || 'Allgemein';
        const year = parseInt(prompt('📅 Jahr:', '2024')) || 2024;
        const pages = parseInt(prompt('📄 Seiten:', '300')) || 300;
        
        this.books.push({
            id: 'b_' + Date.now().toString(36),
            title: title,
            author: author,
            category: category,
            year: year,
            pages: pages
        });
        this.saveData();
        this.updateView();
    },
    
    deleteBook(bookId) {
        if (!confirm('Buch wirklich löschen?')) return;
        this.books = this.books.filter(b => b.id !== bookId);
        this.saveData();
        this.updateView();
    },
    
    // ---- PROFESSOREN ----
    selectProfessor(professorId) {
        this.selectedProfessor = this.selectedProfessor === professorId ? null : professorId;
        this.updateView();
    },
    
    professorInfo(professorId) {
        const p = this.professors.find(p => p.id === professorId);
        if (!p) return;
        alert(
            `👨‍🏫 ${p.name}\n\n` +
            `📂 Titel: ${p.title}\n` +
            `🏫 Fachbereich: ${p.department}\n` +
            `📧 E-Mail: ${p.email}\n` +
            `🚪 Raum: ${p.room}`
        );
    },
    
    addProfessor() {
        const name = prompt('👨‍🏫 Name:');
        if (!name) return;
        const title = prompt('📂 Titel:', 'Professor für') || 'Professor für';
        const department = prompt('🏫 Fachbereich:', 'Allgemein') || 'Allgemein';
        const email = prompt('📧 E-Mail:', '') || '';
        const room = prompt('🚪 Raum:', '') || '';
        
        this.professors.push({
            id: 'p_' + Date.now().toString(36),
            name: name,
            title: title,
            department: department,
            email: email,
            room: room
        });
        this.saveData();
        this.updateView();
    },
    
    deleteProfessor(professorId) {
        if (!confirm('Professor wirklich löschen?')) return;
        this.professors = this.professors.filter(p => p.id !== professorId);
        this.saveData();
        this.updateView();
    },
    
    // ---- QUIZ ----
    selectQuizAnswer(index) {
        if (this.answered) return;
        this.answered = true;
        this.selectedAnswer = index;
        const q = this.quizQuestions[this.currentQuestionIndex];
        if (index === q.correct) {
            this.quizScore++;
        }
        this.updateView();
    },
    
    nextQuizQuestion() {
        const total = this.quizQuestions.length;
        if (this.currentQuestionIndex < total - 1) {
            this.currentQuestionIndex++;
            this.answered = false;
            this.selectedAnswer = null;
            this.updateView();
        } else {
            this.showQuizResult();
        }
    },
    
    showQuizResult() {
        const total = this.quizQuestions.length;
        const percent = Math.round((this.quizScore / total) * 100);
        const passed = percent >= 70;
        
        this.quizHistory.push({
            date: Date.now(),
            score: this.quizScore,
            total: total,
            percent: percent,
            passed: passed
        });
        this.saveData();
        
        alert(
            `🏁 Quiz abgeschlossen!\n\n` +
            `✅ Richtig: ${this.quizScore} von ${total}\n` +
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
                    if (e.key === 'Enter' && this.answered) {
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
        console.log('🎓 University Center App wird installiert...');
        this.loadData();
        if (this.courses.length === 0) {
            this.courses = this.defaultCourses;
            this.knowledge = this.defaultKnowledge;
            this.books = this.defaultBooks;
            this.professors = this.defaultProfessors;
            this.saveData();
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ University Center App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
UniversityCenterApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.UniversityCenterApp = UniversityCenterApp;

console.log('🎓 University Center App geladen – HalDo AI OS 24.6.0');
