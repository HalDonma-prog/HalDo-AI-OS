/**
 * HALDO AI OS 24.6.0 – SCIENCE CENTER APP
 * Naturwissenschaften: Biologie, Chemie, Physik, Astronomie, Experimente
 * Version: 1.0.0
 */

const ScienceCenterApp = {
    // ---- APP-INFO ----
    id: 'science-center',
    name: 'Science Center',
    icon: '🔬',
    category: 'education',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Biologie, Chemie, Physik, Astronomie und Experimente',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'dashboard', // dashboard | biology | chemistry | physics | astronomy | experiments | tools
    selectedTopic: null,
    selectedExperiment: null,
    favoriteTopics: [],
    
    // ---- WISSENSCHAFTSBEREICHE ----
    scienceAreas: [
        { id: 'biology', name: 'Biologie', icon: '🧬', color: '#2ECC71', desc: 'Das Leben erforschen' },
        { id: 'chemistry', name: 'Chemie', icon: '🧪', color: '#FFA94D', desc: 'Die Elemente verstehen' },
        { id: 'physics', name: 'Physik', icon: '⚡', color: '#4D96FF', desc: 'Die Naturgesetze entdecken' },
        { id: 'astronomy', name: 'Astronomie', icon: '🌌', color: '#9B59B6', desc: 'Das Universum erkunden' }
    ],
    
    // ---- EXPERIMENTE ----
    experiments: [
        { id: 'e1', name: 'Vulkanausbruch', icon: '🌋', area: 'chemistry', difficulty: 'einfach', time: '10 min', materials: ['Backpulver', 'Essig', 'Lebensmittelfarbe'] },
        { id: 'e2', name: 'Kristalle züchten', icon: '💎', area: 'chemistry', difficulty: 'mittel', time: '3 Tage', materials: ['Salz', 'Wasser', 'Glas'] },
        { id: 'e3', name: 'Regenbogen im Glas', icon: '🌈', area: 'physics', difficulty: 'einfach', time: '5 min', materials: ['Wasser', 'Zucker', 'Lebensmittelfarbe'] },
        { id: 'e4', name: 'Pflanzenwachstum', icon: '🌱', area: 'biology', difficulty: 'einfach', time: '1 Woche', materials: ['Bohnen', 'Erde', 'Wasser'] },
        { id: 'e5', name: 'Elektromagnet', icon: '🧲', area: 'physics', difficulty: 'mittel', time: '15 min', materials: ['Batterie', 'Kupferdraht', 'Nagel'] },
        { id: 'e6', name: 'Sternenhimmel', icon: '⭐', area: 'astronomy', difficulty: 'einfach', time: '30 min', materials: ['Taschenlampe', 'Karton', 'Nadel'] }
    ],
    
    // ---- WISSENSBEREICHE ----
    knowledgeTopics: {
        biology: [
            { id: 'b1', title: 'Zellen', desc: 'Grundbausteine des Lebens', icon: '🔬' },
            { id: 'b2', title: 'DNA', desc: 'Träger der Erbinformation', icon: '🧬' },
            { id: 'b3', title: 'Evolution', desc: 'Die Entwicklung der Arten', icon: '🦋' },
            { id: 'b4', title: 'Ökosysteme', desc: 'Das Zusammenspiel der Natur', icon: '🌿' }
        ],
        chemistry: [
            { id: 'c1', title: 'Periodensystem', desc: 'Die Elemente der Welt', icon: '📊' },
            { id: 'c2', title: 'Moleküle', desc: 'Verbindungen und Bindungen', icon: '🔗' },
            { id: 'c3', title: 'Säuren und Basen', desc: 'pH-Wert und Reaktionen', icon: '🧪' },
            { id: 'c4', title: 'Chemische Reaktionen', desc: 'Stoffumwandlungen', icon: '⚗️' }
        ],
        physics: [
            { id: 'p1', title: 'Mechanik', desc: 'Bewegung und Kraft', icon: '🏋️' },
            { id: 'p2', title: 'Thermodynamik', desc: 'Wärme und Energie', icon: '🔥' },
            { id: 'p3', title: 'Elektromagnetismus', desc: 'Strom und Felder', icon: '⚡' },
            { id: 'p4', title: 'Quantenphysik', desc: 'Die kleinsten Teilchen', icon: '🌀' }
        ],
        astronomy: [
            { id: 'a1', title: 'Sonnensystem', desc: 'Planeten und ihre Bahnen', icon: '☀️' },
            { id: 'a2', title: 'Sterne', desc: 'Leuchtende Himmelskörper', icon: '⭐' },
            { id: 'a3', title: 'Galaxien', desc: 'Inseln im All', icon: '🌌' },
            { id: 'a4', title: 'Schwarze Löcher', desc: 'Die schwersten Objekte', icon: '🕳️' }
        ]
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
            console.log('🔬 Science Center App registriert');
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
        this.favoriteTopics = Storage.get('science_favorites', []);
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('science_favorites', this.favoriteTopics);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'dashboard': return this.renderDashboard();
            case 'biology': return this.renderArea('biology');
            case 'chemistry': return this.renderArea('chemistry');
            case 'physics': return this.renderArea('physics');
            case 'astronomy': return this.renderArea('astronomy');
            case 'experiments': return this.renderExperiments();
            case 'tools': return this.renderTools();
            default: return this.renderDashboard();
        }
    },
    
    // ---- DASHBOARD ----
    renderDashboard() {
        const totalExperiments = this.experiments.length;
        const totalTopics = Object.values(this.knowledgeTopics).reduce((sum, t) => sum + t.length, 0);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn ${this.currentMode === 'dashboard' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('biology')">🧬 Biologie</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('chemistry')">🧪 Chemie</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('physics')">⚡ Physik</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('astronomy')">🌌 Astronomie</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('experiments')">🔬 Experimente</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('tools')">🛠️ Tools</button>
                </div>
                
                <!-- Statistiken -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;padding:12px;">
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">📚</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.scienceAreas.length}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Wissenschaften</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">🧠</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalTopics}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Themen</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">🔬</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalExperiments}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Experimente</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">⭐</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.favoriteTopics.length}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Favoriten</div>
                    </div>
                </div>
                
                <!-- Willkommen -->
                <div style="padding:0 12px 12px 12px;">
                    <div style="padding:16px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:32px;">🔬</div>
                        <div style="font-size:16px;font-weight:700;color:var(--text-primary);">Willkommen im Science Center</div>
                        <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">Erforsche die Naturwissenschaften</div>
                        <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap;">
                            ${this.scienceAreas.map(area => `
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="ScienceCenterApp.setMode('${area.id}')">
                                    ${area.icon} ${area.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🔬 Science Center</span>
                    <span>💡 Wissenschaft entdecken</span>
                </div>
            </div>
        `;
    },
    
    // ---- WISSENSCHAFTSBEREICH ----
    renderArea(areaId) {
        const area = this.scienceAreas.find(a => a.id === areaId);
        const topics = this.knowledgeTopics[areaId] || [];
        const areaExperiments = this.experiments.filter(e => e.area === areaId);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;align-items:center;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    ${this.scienceAreas.map(a => `
                        <button class="haldo-btn ${this.currentMode === a.id ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('${a.id}')">
                            ${a.icon} ${a.name}
                        </button>
                    `).join('')}
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('experiments')">🔬 Experimente</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('tools')">🛠️ Tools</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <span style="font-size:12px;font-weight:600;color:${area.color};">${area.icon} ${area.name}</span>
                </div>
                
                <!-- Themen -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:6px;">📚 Themen</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                        ${topics.map(topic => {
                            const isFavorite = this.favoriteTopics.includes(topic.id);
                            return `
                                <div style="
                                    padding:10px 12px;
                                    background: var(--glass-bg, rgba(255,255,255,0.04));
                                    border-radius:8px;
                                    border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                                    cursor:pointer;
                                    transition: all 0.15s ease;
                                " onclick="ScienceCenterApp.showTopic('${topic.id}')">
                                    <div style="display:flex;gap:8px;align-items:center;">
                                        <div style="font-size:24px;">${topic.icon}</div>
                                        <div style="flex:1;">
                                            <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${topic.title}</div>
                                            <div style="font-size:10px;color:var(--text-secondary);">${topic.desc}</div>
                                        </div>
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();ScienceCenterApp.toggleFavorite('${topic.id}')">
                                            ${isFavorite ? '⭐' : '☆'}
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    ${areaExperiments.length > 0 ? `
                        <div style="margin-top:12px;">
                            <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:6px;">🔬 Experimente in ${area.name}</div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                                ${areaExperiments.map(e => `
                                    <div style="
                                        padding:8px 10px;
                                        background: var(--glass-bg, rgba(255,255,255,0.04));
                                        border-radius:6px;
                                        border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                                        cursor:pointer;
                                    " onclick="ScienceCenterApp.showExperiment('${e.id}')">
                                        <div style="display:flex;gap:6px;align-items:center;">
                                            <div style="font-size:20px;">${e.icon}</div>
                                            <div>
                                                <div style="font-size:11px;font-weight:600;color:var(--text-primary);">${e.name}</div>
                                                <div style="font-size:9px;color:var(--text-muted);">${e.difficulty} • ${e.time}</div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    // ---- EXPERIMENTE ----
    renderExperiments() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    ${this.scienceAreas.map(a => `
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('${a.id}')">
                            ${a.icon} ${a.name}
                        </button>
                    `).join('')}
                    <button class="haldo-btn ${this.currentMode === 'experiments' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('experiments')">🔬 Experimente</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('tools')">🛠️ Tools</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="ScienceCenterApp.addExperiment()">+</button>
                </div>
                
                <!-- Experimente -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    ${this.experiments.map(e => {
                        const area = this.scienceAreas.find(a => a.id === e.area);
                        return `
                            <div style="
                                padding:12px;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:8px;
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                                cursor:pointer;
                                transition: all 0.15s ease;
                            " onclick="ScienceCenterApp.showExperiment('${e.id}')">
                                <div style="display:flex;gap:8px;align-items:center;">
                                    <div style="font-size:28px;">${e.icon}</div>
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${e.name}</div>
                                        <div style="font-size:10px;color:var(--text-secondary);">${area ? area.icon + ' ' + area.name : ''}</div>
                                        <div style="font-size:9px;color:var(--text-muted);">${e.difficulty} • ${e.time}</div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- TOOLS ----
    renderTools() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    ${this.scienceAreas.map(a => `
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('${a.id}')">
                            ${a.icon} ${a.name}
                        </button>
                    `).join('')}
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('experiments')">🔬 Experimente</button>
                    <button class="haldo-btn ${this.currentMode === 'tools' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.setMode('tools')">🛠️ Tools</button>
                </div>
                
                <!-- Tools -->
                <div style="flex:1;overflow-y:auto;padding:12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
                    <div style="
                        padding:16px;
                        background: var(--glass-bg, rgba(255,255,255,0.04));
                        border-radius:8px;
                        border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        text-align:center;
                        cursor:pointer;
                    " onclick="ScienceCenterApp.openPeriodicTable()">
                        <div style="font-size:32px;">📊</div>
                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">Periodensystem</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Alle Elemente</div>
                    </div>
                    <div style="
                        padding:16px;
                        background: var(--glass-bg, rgba(255,255,255,0.04));
                        border-radius:8px;
                        border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        text-align:center;
                        cursor:pointer;
                    " onclick="ScienceCenterApp.openUnitConverter()">
                        <div style="font-size:32px;">📐</div>
                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">Einheiten umrechnen</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Wissenschaftliche Einheiten</div>
                    </div>
                    <div style="
                        padding:16px;
                        background: var(--glass-bg, rgba(255,255,255,0.04));
                        border-radius:8px;
                        border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        text-align:center;
                        cursor:pointer;
                    " onclick="ScienceCenterApp.openScientificCalculator()">
                        <div style="font-size:32px;">🧮</div>
                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">Wissenschaftlicher Rechner</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Fortgeschrittene Berechnungen</div>
                    </div>
                    <div style="
                        padding:16px;
                        background: var(--glass-bg, rgba(255,255,255,0.04));
                        border-radius:8px;
                        border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        text-align:center;
                        cursor:pointer;
                    " onclick="ScienceCenterApp.openStarMap()">
                        <div style="font-size:32px;">🌌</div>
                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">Sternenkarte</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Himmel beobachten</div>
                    </div>
                    <div style="
                        padding:16px;
                        background: var(--glass-bg, rgba(255,255,255,0.04));
                        border-radius:8px;
                        border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        text-align:center;
                        cursor:pointer;
                    " onclick="ScienceCenterApp.openMoleculeViewer()">
                        <div style="font-size:32px;">🔗</div>
                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">Molekül-Betrachter</div>
                        <div style="font-size:10px;color:var(--text-secondary);">3D-Moleküle</div>
                    </div>
                    <div style="
                        padding:16px;
                        background: var(--glass-bg, rgba(255,255,255,0.04));
                        border-radius:8px;
                        border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        text-align:center;
                        cursor:pointer;
                    " onclick="ScienceCenterApp.openLabSimulator()">
                        <div style="font-size:32px;">🧪</div>
                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">Lab-Simulator</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Virtuelle Experimente</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ---- FUNKTIONEN ----
    setMode(mode) {
        this.currentMode = mode;
        this.updateView();
    },
    
    // ---- THEMEN ----
    showTopic(topicId) {
        // Themen-Info anzeigen
        let foundTopic = null;
        let foundArea = null;
        
        for (const [areaId, topics] of Object.entries(this.knowledgeTopics)) {
            const topic = topics.find(t => t.id === topicId);
            if (topic) {
                foundTopic = topic;
                foundArea = this.scienceAreas.find(a => a.id === areaId);
                break;
            }
        }
        
        if (!foundTopic) {
            alert('Thema nicht gefunden.');
            return;
        }
        
        const isFavorite = this.favoriteTopics.includes(topicId);
        
        // In einem separaten Fenster anzeigen
        const content = `
            <div style="padding:12px;text-align:center;">
                <div style="font-size:48px;">${foundTopic.icon}</div>
                <h2 style="color:var(--text-primary);font-size:18px;margin:8px 0;">${foundTopic.title}</h2>
                <p style="color:var(--text-secondary);font-size:13px;">${foundTopic.desc}</p>
                <p style="color:var(--text-muted);font-size:11px;margin-top:4px;">${foundArea ? foundArea.icon + ' ' + foundArea.name : ''}</p>
                <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                    <button class="haldo-btn" style="font-size:11px;padding:4px 12px;" onclick="alert('📚 Lerne mehr über ${foundTopic.title}')">📚 Lernen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="ScienceCenterApp.toggleFavorite('${topicId}')">
                        ${isFavorite ? '⭐ Favorit entfernen' : '☆ Favorit hinzufügen'}
                    </button>
                </div>
            </div>
        `;
        
        WindowManager.openWindow(
            'topic-detail',
            '📚 ' + foundTopic.title,
            content,
            foundTopic.icon,
            400,
            320
        );
    },
    
    toggleFavorite(topicId) {
        const index = this.favoriteTopics.indexOf(topicId);
        if (index === -1) {
            this.favoriteTopics.push(topicId);
        } else {
            this.favoriteTopics.splice(index, 1);
        }
        this.saveData();
        this.updateView();
    },
    
    // ---- EXPERIMENTE ----
    showExperiment(experimentId) {
        const experiment = this.experiments.find(e => e.id === experimentId);
        if (!experiment) return;
        
        const area = this.scienceAreas.find(a => a.id === experiment.area);
        
        const content = `
            <div style="padding:12px;">
                <div style="display:flex;gap:8px;align-items:center;">
                    <div style="font-size:40px;">${experiment.icon}</div>
                    <div>
                        <h2 style="color:var(--text-primary);font-size:18px;margin:0;">${experiment.name}</h2>
                        <p style="color:var(--text-secondary);font-size:12px;">${area ? area.icon + ' ' + area.name : ''}</p>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px;">
                    <div style="padding:6px;background:var(--glass-bg);border-radius:4px;font-size:11px;color:var(--text-secondary);">
                        📊 Schwierigkeit: ${experiment.difficulty}
                    </div>
                    <div style="padding:6px;background:var(--glass-bg);border-radius:4px;font-size:11px;color:var(--text-secondary);">
                        ⏱️ Dauer: ${experiment.time}
                    </div>
                </div>
                <div style="margin-top:8px;padding:8px;background:var(--glass-bg);border-radius:6px;">
                    <div style="font-size:12px;font-weight:600;color:var(--text-primary);">📦 Materialien</div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
                        ${experiment.materials.map(m => `
                            <span style="font-size:10px;padding:2px 8px;background:rgba(255,255,255,0.05);border-radius:4px;color:var(--text-secondary);">${m}</span>
                        `).join('')}
                    </div>
                </div>
                <div style="margin-top:8px;display:flex;gap:8px;">
                    <button class="haldo-btn" style="font-size:11px;padding:4px 12px;" onclick="alert('🔬 Experiment wird gestartet...')">🔬 Starten</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="alert('📝 Anleitung wird angezeigt')">📝 Anleitung</button>
                </div>
            </div>
        `;
        
        WindowManager.openWindow(
            'experiment-detail',
            '🔬 ' + experiment.name,
            content,
            experiment.icon,
            420,
            360
        );
    },
    
    addExperiment() {
        const name = prompt('🔬 Experiment-Name:');
        if (!name) return;
        const icon = prompt('🎨 Icon (Emoji):', '🔬') || '🔬';
        const area = prompt('📂 Bereich (biology/chemistry/physics/astronomy):', 'chemistry') || 'chemistry';
        const difficulty = prompt('📊 Schwierigkeit (einfach/mittel/schwer):', 'einfach') || 'einfach';
        const time = prompt('⏱️ Dauer:', '10 min') || '10 min';
        const materials = prompt('📦 Materialien (kommagetrennt):', 'Wasser, Salz') || 'Wasser, Salz';
        
        this.experiments.push({
            id: 'e_' + Date.now().toString(36),
            name: name,
            icon: icon,
            area: area,
            difficulty: difficulty,
            time: time,
            materials: materials.split(',').map(m => m.trim()).filter(Boolean)
        });
        
        this.saveData();
        this.updateView();
    },
    
    // ---- TOOLS ----
    openPeriodicTable() {
        const elements = [
            { symbol: 'H', name: 'Wasserstoff', number: 1, group: 'Nichtmetall' },
            { symbol: 'He', name: 'Helium', number: 2, group: 'Edelgas' },
            { symbol: 'Li', name: 'Lithium', number: 3, group: 'Alkalimetall' },
            { symbol: 'C', name: 'Kohlenstoff', number: 6, group: 'Nichtmetall' },
            { symbol: 'N', name: 'Stickstoff', number: 7, group: 'Nichtmetall' },
            { symbol: 'O', name: 'Sauerstoff', number: 8, group: 'Nichtmetall' },
            { symbol: 'Na', name: 'Natrium', number: 11, group: 'Alkalimetall' },
            { symbol: 'Fe', name: 'Eisen', number: 26, group: 'Übergangsmetall' },
            { symbol: 'Au', name: 'Gold', number: 79, group: 'Übergangsmetall' },
            { symbol: 'Ag', name: 'Silber', number: 47, group: 'Übergangsmetall' }
        ];
        
        const content = `
            <div style="padding:12px;">
                <h3 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">📊 Periodensystem</h3>
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;">
                    ${elements.map(e => `
                        <div style="
                            padding:6px;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:4px;
                            text-align:center;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            cursor:pointer;
                        " onclick="alert('${e.symbol}: ${e.name}\\nOrdnungszahl: ${e.number}\\nGruppe: ${e.group}')">
                            <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${e.symbol}</div>
                            <div style="font-size:8px;color:var(--text-muted);">${e.number}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        WindowManager.openWindow(
            'periodic-table',
            '📊 Periodensystem',
            content,
            '📊',
            400,
            350
        );
    },
    
    openUnitConverter() {
        const content = `
            <div style="padding:12px;">
                <h3 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">📐 Einheiten umrechnen</h3>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    <div>
                        <label style="font-size:11px;color:var(--text-secondary);">Wert</label>
                        <input id="unit-value" class="haldo-input" type="number" value="1" style="font-size:12px;">
                    </div>
                    <div>
                        <label style="font-size:11px;color:var(--text-secondary);">Von</label>
                        <select id="unit-from" class="haldo-input" style="font-size:11px;">
                            <option value="m">Meter</option>
                            <option value="km">Kilometer</option>
                            <option value="cm">Zentimeter</option>
                            <option value="mm">Millimeter</option>
                            <option value="g">Gramm</option>
                            <option value="kg">Kilogramm</option>
                            <option value="l">Liter</option>
                            <option value="ml">Milliliter</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:11px;color:var(--text-secondary);">Nach</label>
                        <select id="unit-to" class="haldo-input" style="font-size:11px;">
                            <option value="km">Kilometer</option>
                            <option value="m">Meter</option>
                            <option value="cm">Zentimeter</option>
                            <option value="mm">Millimeter</option>
                            <option value="kg">Kilogramm</option>
                            <option value="g">Gramm</option>
                            <option value="l">Liter</option>
                            <option value="ml">Milliliter</option>
                        </select>
                    </div>
                    <button class="haldo-btn" style="font-size:12px;" onclick="ScienceCenterApp.convertUnit()">🔄 Umrechnen</button>
                    <div id="unit-result" style="padding:8px;background:var(--glass-bg);border-radius:4px;font-size:13px;color:var(--text-primary);text-align:center;">
                        Ergebnis: —
                    </div>
                </div>
            </div>
        `;
        
        WindowManager.openWindow(
            'unit-converter',
            '📐 Einheiten umrechnen',
            content,
            '📐',
            380,
            380
        );
    },
    
    convertUnit() {
        const value = parseFloat(document.getElementById('unit-value')?.value) || 1;
        const from = document.getElementById('unit-from')?.value || 'm';
        const to = document.getElementById('unit-to')?.value || 'km';
        
        const conversions = {
            'm': 1,
            'km': 0.001,
            'cm': 100,
            'mm': 1000,
            'g': 1,
            'kg': 0.001,
            'l': 1,
            'ml': 1000
        };
        
        const categories = {
            'm': 'length', 'km': 'length', 'cm': 'length', 'mm': 'length',
            'g': 'weight', 'kg': 'weight',
            'l': 'volume', 'ml': 'volume'
        };
        
        if (categories[from] !== categories[to]) {
            document.getElementById('unit-result').textContent = '⚠️ Unterschiedliche Einheitenkategorien';
            return;
        }
        
        const result = value * (conversions[to] / conversions[from]);
        document.getElementById('unit-result').textContent = `${value} ${from} = ${result.toFixed(4)} ${to}`;
    },
    
    openScientificCalculator() {
        const content = `
            <div style="padding:12px;">
                <h3 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">🧮 Wissenschaftlicher Rechner</h3>
                <div id="calc-display" style="padding:12px;background:rgba(0,0,0,0.2);border-radius:6px;text-align:right;font-size:20px;font-weight:700;margin-bottom:8px;min-height:40px;">0</div>
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;">
                    ${['sin','cos','tan','log','ln','7','8','9','÷','√','4','5','6','×','^','1','2','3','−','π','0','.','=', '+', 'C'].map(b => `
                        <button onclick="ScienceCenterApp.calcInput('${b}')" style="padding:8px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:4px;color:var(--text-primary);font-size:12px;cursor:pointer;">${b}</button>
                    `).join('')}
                </div>
            </div>
        `;
        
        WindowManager.openWindow(
            'scientific-calculator',
            '🧮 Wissenschaftlicher Rechner',
            content,
            '🧮',
            400,
            380
        );
    },
    
    calcInput(value) {
        const display = document.getElementById('calc-display');
        if (!display) return;
        
        if (value === '=') {
            try {
                display.textContent = eval(display.textContent.replace('×', '*').replace('÷', '/').replace('^', '**').replace('sin', 'Math.sin').replace('cos', 'Math.cos').replace('tan', 'Math.tan').replace('log', 'Math.log10').replace('ln', 'Math.log').replace('√', 'Math.sqrt').replace('π', 'Math.PI'));
            } catch {
                display.textContent = 'Error';
            }
        } else if (value === 'C') {
            display.textContent = '0';
        } else {
            if (display.textContent === '0' && value !== '.' && !['sin','cos','tan','log','ln','√','π'].includes(value)) {
                display.textContent = value;
            } else {
                display.textContent += value;
            }
        }
    },
    
    openStarMap() {
        const content = `
            <div style="padding:12px;text-align:center;">
                <h3 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">🌌 Sternenkarte</h3>
                <div style="background:rgba(0,0,0,0.5);border-radius:8px;padding:20px;min-height:200px;display:flex;align-items:center;justify-content:center;flex-direction:column;">
                    <div style="font-size:64px;">⭐</div>
                    <p style="color:var(--text-secondary);font-size:12px;">Der Nachthimmel</p>
                    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
                        ${['⭕','✨','🌟','💫','☄️','🌙'].map(s => `<span style="font-size:24px;">${s}</span>`).join('')}
                    </div>
                </div>
                <div style="margin-top:8px;display:flex;gap:8px;justify-content:center;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="alert('📍 Standort wird geladen...')">📍 Standort</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="alert('🔭 Teleskop aktiviert')">🔭 Teleskop</button>
                </div>
            </div>
        `;
        
        WindowManager.openWindow(
            'star-map',
            '🌌 Sternenkarte',
            content,
            '🌌',
            400,
            320
        );
    },
    
    openMoleculeViewer() {
        const molecules = [
            { name: 'Wasser H₂O', formula: 'H₂O', structure: 'O-H (104.5°)' },
            { name: 'Kohlendioxid CO₂', formula: 'CO₂', structure: 'O=C=O (180°)' },
            { name: 'Methan CH₄', formula: 'CH₄', structure: 'Tetraeder' },
            { name: 'Ammoniak NH₃', formula: 'NH₃', structure: 'Pyramide' }
        ];
        
        const content = `
            <div style="padding:12px;">
                <h3 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">🔗 Molekül-Betrachter</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    ${molecules.map(m => `
                        <div style="padding:10px;background:var(--glass-bg);border-radius:6px;border:1px solid var(--glass-border);text-align:center;cursor:pointer;" onclick="alert('${m.name}\\nFormel: ${m.formula}\\nStruktur: ${m.structure}')">
                            <div style="font-size:28px;">🔗</div>
                            <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${m.name}</div>
                            <div style="font-size:10px;color:var(--text-muted);">${m.formula}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        WindowManager.openWindow(
            'molecule-viewer',
            '🔗 Molekül-Betrachter',
            content,
            '🔗',
            400,
            320
        );
    },
    
    openLabSimulator() {
        const content = `
            <div style="padding:12px;text-align:center;">
                <h3 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">🧪 Lab-Simulator</h3>
                <div style="background:var(--glass-bg);border-radius:8px;padding:20px;min-height:150px;border:1px solid var(--glass-border);">
                    <div style="font-size:48px;">🧪</div>
                    <p style="color:var(--text-secondary);font-size:12px;">Virtuelles Labor</p>
                    <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap;">
                        <button class="haldo-btn" style="font-size:10px;padding:3px 10px;" onclick="alert('🧪 Experiment: Säure + Base = Neutralisation')">🧪 Säure + Base</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="alert('🔥 Verbrennung von Methan')">🔥 Verbrennung</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="alert('⚡ Elektrolyse von Wasser')">⚡ Elektrolyse</button>
                    </div>
                </div>
            </div>
        `;
        
        WindowManager.openWindow(
            'lab-simulator',
            '🧪 Lab-Simulator',
            content,
            '🧪',
            400,
            320
        );
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
                    this.setMode('dashboard');
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🔬 Science Center App wird installiert...');
        this.loadData();
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Science Center App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
ScienceCenterApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.ScienceCenterApp = ScienceCenterApp;

console.log('🔬 Science Center App geladen – HalDo AI OS 24.6.0');
