/**
 * HALDO AI OS 24.6.0 – GAMES CENTER APP
 * Professionelle Gaming-Plattform mit Spielen, Highscores, Achievements und Profilen
 * Version: 1.0.0
 */

const GamesCenterApp = {
    // ---- APP-INFO ----
    id: 'games-center',
    name: 'Games Center',
    icon: '🎮',
    category: 'entertainment',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Spiele, Highscores, Achievements und Gaming-Community',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'dashboard', // dashboard | games | highscores | achievements | profile | multiplayer
    selectedGame: null,
    currentGame: null,
    gameState: {},
    
    // ---- SPIELE ----
    games: [
        { id: 'g1', name: 'Zahlenraten', icon: '🔢', category: 'Denksport', desc: 'Errate die geheime Zahl', players: 1234, rating: 4.7 },
        { id: 'g2', name: 'Memory', icon: '🧠', category: 'Denksport', desc: 'Finde die passenden Paare', players: 892, rating: 4.5 },
        { id: 'g3', name: 'Tic-Tac-Toe', icon: '❌', category: 'Strategie', desc: 'Klassisches Drei-Gewinnt', players: 2156, rating: 4.8 },
        { id: 'g4', name: 'Quiz Challenge', icon: '❓', category: 'Wissen', desc: 'Teste dein Wissen', players: 567, rating: 4.3 },
        { id: 'g5', name: 'Reaction Test', icon: '⚡', category: 'Geschicklichkeit', desc: 'Teste deine Reaktionszeit', players: 789, rating: 4.6 },
        { id: 'g6', name: 'Worträtsel', icon: '📝', category: 'Denksport', desc: 'Finde die versteckten Wörter', players: 345, rating: 4.4 },
        { id: 'g7', name: 'Snake', icon: '🐍', category: 'Arcade', desc: 'Klassisches Schlangenspiel', players: 2100, rating: 4.9 },
        { id: 'g8', name: 'Pong', icon: '🏓', category: 'Arcade', desc: 'Tischtennis-Klassiker', players: 1456, rating: 4.6 }
    ],
    
    // ---- HIGHSCORES ----
    highscores: [
        { id: 'h1', gameId: 'g1', player: 'HalDo', score: 42, date: Date.now() - 3600000 },
        { id: 'h2', gameId: 'g3', player: 'HalDo', score: 15, date: Date.now() - 7200000 },
        { id: 'h3', gameId: 'g5', player: 'HalDo', score: 120, date: Date.now() - 14400000 },
        { id: 'h4', gameId: 'g7', player: 'HalDo', score: 78, date: Date.now() - 28800000 }
    ],
    
    // ---- ACHIEVEMENTS ----
    achievements: [
        { id: 'a1', name: 'Erster Sieg', desc: 'Gewinne dein erstes Spiel', icon: '🏆', unlocked: false },
        { id: 'a2', name: 'Spieler Level 10', desc: 'Erreiche Level 10', icon: '⭐', unlocked: false },
        { id: 'a3', name: '100 Spiele gespielt', desc: 'Spiele 100 Spiele', icon: '🎯', unlocked: false },
        { id: 'a4', name: 'Meister der Zahlen', desc: 'Erreiche 50 Punkte in Zahlenraten', icon: '🔢', unlocked: false },
        { id: 'a5', name: 'Memory-Profi', desc: 'Finde alle Paare in Memory', icon: '🧠', unlocked: false },
        { id: 'a6', name: 'Snake-Legende', desc: 'Erreiche 100 Punkte in Snake', icon: '🐍', unlocked: false }
    ],
    
    // ---- SPIELERSTATISTIK ----
    playerStats: {
        gamesPlayed: 0,
        gamesWon: 0,
        totalScore: 0,
        level: 1,
        xp: 0,
        xpToNextLevel: 100
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
            console.log('🎮 Games Center App registriert');
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
        this.highscores = Storage.get('games_highscores', this.highscores);
        this.achievements = Storage.get('games_achievements', this.achievements);
        this.playerStats = Storage.get('games_stats', this.playerStats);
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('games_highscores', this.highscores);
        Storage.set('games_achievements', this.achievements);
        Storage.set('games_stats', this.playerStats);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'dashboard': return this.renderDashboard();
            case 'games': return this.renderGames();
            case 'highscores': return this.renderHighscores();
            case 'achievements': return this.renderAchievements();
            case 'profile': return this.renderProfile();
            case 'multiplayer': return this.renderMultiplayer();
            default: return this.renderDashboard();
        }
    },
    
    // ---- DASHBOARD ----
    renderDashboard() {
        const totalGames = this.games.length;
        const totalAchievements = this.achievements.filter(a => a.unlocked).length;
        const totalScores = this.highscores.length;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn ${this.currentMode === 'dashboard' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('games')">🎮 Spiele</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('highscores')">🏆 Highscores</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('achievements')">⭐ Erfolge</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('profile')">👤 Profil</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('multiplayer')">🌐 Multiplayer</button>
                </div>
                
                <!-- Statistiken -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;padding:12px;">
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">🎮</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalGames}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Spiele</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">🏆</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalScores}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Highscores</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">⭐</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalAchievements}/${this.achievements.length}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Erfolge</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">📊</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.playerStats.gamesPlayed}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Gespielt</div>
                    </div>
                </div>
                
                <!-- Aktuelles Spiel -->
                <div style="padding:0 12px 12px 12px;">
                    <div style="padding:16px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:14px;color:var(--text-muted);">🎮 Spiel des Tages</div>
                        <div style="font-size:18px;font-weight:600;color:var(--text-primary);margin:4px 0;">${this.games[Math.floor(Math.random() * this.games.length)].name}</div>
                        <div style="font-size:11px;color:var(--text-secondary);">${this.games[Math.floor(Math.random() * this.games.length)].desc}</div>
                        <button class="haldo-btn" style="font-size:11px;margin-top:8px;padding:4px 12px;" onclick="GamesCenterApp.setMode('games')">🎮 Alle Spiele</button>
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🎮 Games Center</span>
                    <span>Level ${this.playerStats.level}</span>
                </div>
            </div>
        `;
    },
    
    // ---- SPIELE ----
    renderGames() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn ${this.currentMode === 'games' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('games')">🎮 Spiele</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('highscores')">🏆 Highscores</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('achievements')">⭐ Erfolge</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('profile')">👤 Profil</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('multiplayer')">🌐 Multiplayer</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="GamesCenterApp.addGame()">+</button>
                </div>
                
                <!-- Spieleliste -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    ${this.games.map(g => `
                        <div style="
                            padding:12px;
                            background: ${this.selectedGame === g.id ? 'rgba(108,60,225,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                            border-radius:8px;
                            border:1px solid ${this.selectedGame === g.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                            cursor:pointer;
                            transition: all 0.15s ease;
                        " onclick="GamesCenterApp.playGame('${g.id}')">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="font-size:32px;">${g.icon}</div>
                                <div>
                                    <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${g.name}</div>
                                    <div style="font-size:10px;color:var(--text-secondary);">${g.category}</div>
                                    <div style="font-size:9px;color:var(--text-muted);">${g.desc}</div>
                                    <div style="display:flex;gap:8px;margin-top:2px;">
                                        <span style="font-size:9px;color:var(--text-muted);">👥 ${g.players}</span>
                                        <span style="font-size:9px;color:var(--text-muted);">⭐ ${g.rating}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- HIGHSCORES ----
    renderHighscores() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('games')">🎮 Spiele</button>
                    <button class="haldo-btn ${this.currentMode === 'highscores' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('highscores')">🏆 Highscores</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('achievements')">⭐ Erfolge</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('profile')">👤 Profil</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('multiplayer')">🌐 Multiplayer</button>
                </div>
                
                <!-- Highscores -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.highscores.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <div style="font-size:48px;">🏆</div>
                            <p style="font-size:13px;">Noch keine Highscores</p>
                            <button class="haldo-btn" style="font-size:12px;margin-top:8px;" onclick="GamesCenterApp.setMode('games')">🎮 Spiele spielen</button>
                        </div>
                    ` : `
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            ${this.highscores.sort((a, b) => b.score - a.score).map((h, index) => {
                                const game = this.games.find(g => g.id === h.gameId);
                                return `
                                    <div style="
                                        padding:8px 12px;
                                        background: ${index === 0 ? 'rgba(255,215,0,0.1)' : index === 1 ? 'rgba(192,192,192,0.1)' : index === 2 ? 'rgba(205,127,50,0.1)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                        border-radius:6px;
                                        border:1px solid ${index === 0 ? 'var(--gold, #FFD700)' : index === 1 ? 'var(--text-muted)' : index === 2 ? 'var(--warning, #FFB800)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                        display:flex;
                                        justify-content:space-between;
                                        align-items:center;
                                    ">
                                        <div style="display:flex;gap:8px;align-items:center;">
                                            <span style="font-size:16px;font-weight:700;color:${index === 0 ? 'var(--gold, #FFD700)' : index === 1 ? 'var(--text-muted)' : index === 2 ? 'var(--warning, #FFB800)' : 'var(--text-secondary)'};">
                                                #${index + 1}
                                            </span>
                                            <span style="font-size:11px;color:var(--text-secondary);">${game?.icon || '🎮'}</span>
                                            <div>
                                                <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${h.player}</div>
                                                <div style="font-size:9px;color:var(--text-muted);">${game?.name || 'Unbekannt'}</div>
                                            </div>
                                        </div>
                                        <div style="text-align:right;">
                                            <div style="font-size:16px;font-weight:700;color:${index === 0 ? 'var(--gold, #FFD700)' : 'var(--text-primary)'};">${h.score}</div>
                                            <div style="font-size:8px;color:var(--text-muted);">${new Date(h.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- ACHIEVEMENTS ----
    renderAchievements() {
        const unlocked = this.achievements.filter(a => a.unlocked);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('games')">🎮 Spiele</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('highscores')">🏆 Highscores</button>
                    <button class="haldo-btn ${this.currentMode === 'achievements' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('achievements')">⭐ Erfolge</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('profile')">👤 Profil</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('multiplayer')">🌐 Multiplayer</button>
                </div>
                
                <!-- Erfolge -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    ${this.achievements.map(a => `
                        <div style="
                            padding:10px 12px;
                            background: ${a.unlocked ? 'rgba(0,255,136,0.06)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                            border-radius:8px;
                            border:1px solid ${a.unlocked ? 'var(--success, #00FF88)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                            opacity: ${a.unlocked ? 1 : 0.5};
                        ">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="font-size:28px;">${a.unlocked ? a.icon : '🔒'}</div>
                                <div>
                                    <div style="font-size:12px;font-weight:600;color:${a.unlocked ? 'var(--text-primary)' : 'var(--text-muted)'};">${a.name}</div>
                                    <div style="font-size:10px;color:${a.unlocked ? 'var(--text-secondary)' : 'var(--text-muted)'};">${a.desc}</div>
                                    <div style="font-size:9px;color:${a.unlocked ? 'var(--success, #00FF88)' : 'var(--text-muted)'};">${a.unlocked ? '✅ Freigeschaltet' : '🔒 Gesperrt'}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- PROFIL ----
    renderProfile() {
        const p = this.playerStats;
        const xpProgress = (p.xp / p.xpToNextLevel * 100);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('games')">🎮 Spiele</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('highscores')">🏆 Highscores</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('achievements')">⭐ Erfolge</button>
                    <button class="haldo-btn ${this.currentMode === 'profile' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('profile')">👤 Profil</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('multiplayer')">🌐 Multiplayer</button>
                </div>
                
                <!-- Profil -->
                <div style="flex:1;overflow-y:auto;padding:12px;">
                    <div style="text-align:center;padding:12px;">
                        <div style="font-size:64px;">👤</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">HalDo Gamer</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Level ${p.level}</div>
                    </div>
                    
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);">
                            <span>XP ${p.xp}/${p.xpToNextLevel}</span>
                            <span>${Math.round(xpProgress)}%</span>
                        </div>
                        <div style="width:100%;height:4px;background:var(--glass-border);border-radius:10px;margin-top:2px;overflow:hidden;">
                            <div style="width:${xpProgress}%;height:100%;background:var(--primary, #6C3CE1);border-radius:10px;transition:width 0.3s ease;"></div>
                        </div>
                    </div>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;">
                        <div style="padding:10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:6px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                            <div style="font-size:10px;color:var(--text-muted);">Gespielt</div>
                            <div style="font-size:18px;font-weight:700;color:var(--text-primary);">${p.gamesPlayed}</div>
                        </div>
                        <div style="padding:10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:6px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                            <div style="font-size:10px;color:var(--text-muted);">Gewonnen</div>
                            <div style="font-size:18px;font-weight:700;color:var(--text-primary);">${p.gamesWon}</div>
                        </div>
                        <div style="padding:10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:6px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                            <div style="font-size:10px;color:var(--text-muted);">Highscores</div>
                            <div style="font-size:18px;font-weight:700;color:var(--text-primary);">${this.highscores.length}</div>
                        </div>
                        <div style="padding:10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:6px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                            <div style="font-size:10px;color:var(--text-muted);">Erfolge</div>
                            <div style="font-size:18px;font-weight:700;color:var(--text-primary);">${this.achievements.filter(a => a.unlocked).length}/${this.achievements.length}</div>
                        </div>
                    </div>
                    
                    <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <button class="haldo-btn" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('highscores')">🏆 Highscores</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('achievements')">⭐ Erfolge</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ---- MULTIPLAYER ----
    renderMultiplayer() {
        const onlinePlayers = [
            { name: 'Spieler1', game: 'Tic-Tac-Toe', status: 'online' },
            { name: 'Spieler2', game: 'Snake', status: 'online' },
            { name: 'Spieler3', game: 'Quiz Challenge', status: 'online' },
            { name: 'Spieler4', game: 'Memory', status: 'online' }
        ];
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('games')">🎮 Spiele</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('highscores')">🏆 Highscores</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('achievements')">⭐ Erfolge</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('profile')">👤 Profil</button>
                    <button class="haldo-btn ${this.currentMode === 'multiplayer' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="GamesCenterApp.setMode('multiplayer')">🌐 Multiplayer</button>
                </div>
                
                <!-- Multiplayer -->
                <div style="flex:1;overflow-y:auto;padding:12px;">
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:32px;">🌐</div>
                        <div style="font-size:14px;font-weight:600;color:var(--text-primary);">Multiplayer-Modus</div>
                        <div style="font-size:11px;color:var(--text-secondary);">${onlinePlayers.length} Spieler online</div>
                        <button class="haldo-btn" style="font-size:11px;margin-top:8px;padding:4px 12px;" onclick="alert('🔍 Lobby wird gesucht...')">🔍 Lobby suchen</button>
                    </div>
                    
                    <div style="margin-top:12px;">
                        <div style="font-size:12px;font-weight:600;color:var(--text-primary);">👥 Spieler online</div>
                        ${onlinePlayers.map(p => `
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
                                <div style="display:flex;gap:8px;align-items:center;">
                                    <span style="font-size:12px;color:var(--text-primary);">${p.name}</span>
                                    <span style="font-size:9px;color:var(--text-muted);">${p.game}</span>
                                </div>
                                <span style="font-size:9px;color:var(--success, #00FF88);">🟢 ${p.status}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="margin-top:12px;padding:8px 12px;background:rgba(0,255,136,0.05);border-radius:8px;border:1px solid rgba(0,255,136,0.1);">
                        <div style="font-size:11px;color:var(--text-secondary);">💡 Multiplayer-Funktionen sind in Entwicklung. Spiele gegen Freunde!</div>
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
    
    // ---- SPIELE ----
    playGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;
        
        this.selectedGame = gameId;
        this.currentGame = game;
        
        // Spiel starten
        this.playerStats.gamesPlayed++;
        this.saveData();
        
        // Achievement-Check
        this.checkAchievements();
        
        // Spiel-Logik
        switch(gameId) {
            case 'g1': this.playNumberGuess(); break;
            case 'g2': this.playMemory(); break;
            case 'g3': this.playTicTacToe(); break;
            case 'g4': this.playQuiz(); break;
            case 'g5': this.playReactionTest(); break;
            case 'g6': this.playWordPuzzle(); break;
            case 'g7': this.playSnake(); break;
            case 'g8': this.playPong(); break;
            default: alert(`🎮 ${game.name} wird gestartet...`);
        }
    },
    
    // ---- ZAHLENRATEN ----
    playNumberGuess() {
        const secret = Math.floor(Math.random() * 100) + 1;
        let attempts = 0;
        let guessed = false;
        
        const playRound = () => {
            const guess = prompt(`🔢 Zahlenraten\n\nVersuche die Zahl zwischen 1 und 100 zu erraten.\nVersuche: ${attempts}\n\nTipp: ${guessed ? 'Richtig!' : 'Rate eine Zahl'}`);
            if (guess === null) return;
            
            const num = parseInt(guess);
            if (isNaN(num)) {
                alert('⚠️ Bitte eine gültige Zahl eingeben.');
                playRound();
                return;
            }
            
            attempts++;
            
            if (num === secret) {
                guessed = true;
                const score = Math.max(100 - attempts * 2, 1);
                this.addHighscore('g1', 'HalDo', score);
                alert(`🎉 Richtig! Die Zahl war ${secret}.\n📊 Versuche: ${attempts}\n🏆 Punktzahl: ${score}`);
                this.updateView();
            } else if (num < secret) {
                alert(`📈 Die gesuchte Zahl ist größer als ${num}.`);
                playRound();
            } else {
                alert(`📉 Die gesuchte Zahl ist kleiner als ${num}.`);
                playRound();
            }
        };
        
        playRound();
    },
    
    // ---- MEMORY ----
    playMemory() {
        const pairs = ['🍎', '🍌', '🍒', '🍇', '🍊', '🍓', '🍉', '🍋'];
        const cards = [...pairs, ...pairs].sort(() => Math.random() - 0.5);
        let flipped = [];
        let matched = [];
        let moves = 0;
        
        // In einem separaten Fenster anzeigen
        const content = `
            <div style="padding:12px;text-align:center;">
                <h3 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">🧠 Memory</h3>
                <p style="font-size:11px;color:var(--text-secondary);">Finde die passenden Paare</p>
                <div id="memory-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-width:300px;margin:8px auto;">
                    ${cards.map((c, i) => `
                        <div class="memory-card" data-index="${i}" onclick="GamesCenterApp.flipCard(${i})" style="
                            padding:12px;
                            background: var(--primary, #6C3CE1);
                            border-radius:6px;
                            cursor:pointer;
                            aspect-ratio:1;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:20px;
                            transition: all 0.3s ease;
                        ">❓</div>
                    `).join('')}
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:var(--text-muted);">
                    <span>Züge: <span id="memory-moves">0</span></span>
                    <span>Paare: <span id="memory-pairs">0</span>/8</span>
                </div>
            </div>
        `;
        
        const win = WindowManager.openWindow('memory-game', '🧠 Memory', content, '🧠', 400, 450);
        
        // Globale Funktionen für Memory
        window.GamesCenterApp.flipCard = (index) => {
            const cards = document.querySelectorAll('.memory-card');
            const card = cards[index];
            
            if (flipped.includes(index) || matched.includes(index) || flipped.length >= 2) return;
            
            // Karte umdrehen
            const cardContent = cards[index].textContent;
            cards[index].textContent = cards[index].dataset.emoji || '❓';
            cards[index].style.background = 'var(--glass-bg)';
            flipped.push(index);
            
            if (flipped.length === 2) {
                moves++;
                document.getElementById('memory-moves').textContent = moves;
                
                const i1 = flipped[0];
                const i2 = flipped[1];
                const emoji1 = cards[i1].textContent;
                const emoji2 = cards[i2].textContent;
                
                if (emoji1 === emoji2) {
                    matched.push(i1, i2);
                    document.getElementById('memory-pairs').textContent = matched.length / 2;
                    
                    // Karten bleiben offen
                    flipped = [];
                    
                    if (matched.length === cards.length) {
                        const score = Math.max(100 - moves * 2, 1);
                        GamesCenterApp.addHighscore('g2', 'HalDo', score);
                        alert(`🎉 Memory gelöst!\n📊 Züge: ${moves}\n🏆 Punktzahl: ${score}`);
                        WindowManager.closeWindow(win);
                        GamesCenterApp.updateView();
                    }
                } else {
                    // Karten wieder umdrehen
                    setTimeout(() => {
                        cards[i1].textContent = '❓';
                        cards[i1].style.background = 'var(--primary, #6C3CE1)';
                        cards[i2].textContent = '❓';
                        cards[i2].style.background = 'var(--primary, #6C3CE1)';
                        flipped = [];
                    }, 500);
                }
            }
        };
        
        // Emojis speichern
        setTimeout(() => {
            const cards = document.querySelectorAll('.memory-card');
            cards.forEach((card, i) => {
                card.dataset.emoji = cards[i].dataset.emoji || pairs[i % pairs.length];
            });
        }, 100);
    },
    
    // ---- TIC-TAC-TOE ----
    playTicTacToe() {
        let board = ['', '', '', '', '', '', '', '', ''];
        let currentPlayer = 'X';
        let gameOver = false;
        
        const renderBoard = () => {
            const content = `
                <div style="padding:12px;text-align:center;">
                    <h3 style="color:var(--text-primary);font-size:14px;margin-bottom:4px;">❌ Tic-Tac-Toe ⭕</h3>
                    <p style="font-size:11px;color:var(--text-secondary);">Spieler: ${currentPlayer}</p>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;max-width:200px;margin:8px auto;">
                        ${board.map((cell, i) => `
                            <div class="ttt-cell" data-index="${i}" onclick="GamesCenterApp.makeMove(${i})" style="
                                padding:20px;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                                border-radius:6px;
                                cursor:pointer;
                                font-size:28px;
                                text-align:center;
                                aspect-ratio:1;
                                color:var(--text-primary);
                            ">${cell}</div>
                        `).join('')}
                    </div>
                    <div style="margin-top:8px;font-size:11px;color:var(--text-muted);">
                        <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="GamesCenterApp.resetTicTacToe()">🔄 Neustart</button>
                    </div>
                </div>
            `;
            
            // Fenster aktualisieren
            const existing = document.querySelector('.window[data-app-id="tic-tac-toe"]');
            if (existing) {
                const body = existing.querySelector('.window-body');
                if (body) body.innerHTML = content;
            } else {
                const win = WindowManager.openWindow('tic-tac-toe', '❌ Tic-Tac-Toe', content, '❌', 350, 380);
                win.dataset.appId = 'tic-tac-toe';
            }
        };
        
        renderBoard();
        
        // Globale Funktionen
        window.GamesCenterApp.makeMove = (index) => {
            if (gameOver || board[index] !== '') return;
            
            board[index] = currentPlayer;
            const winner = this.checkWinner(board);
            
            if (winner) {
                gameOver = true;
                this.playerStats.gamesWon++;
                const score = winner === 'X' ? 15 : 10;
                this.addHighscore('g3', 'HalDo', score);
                this.checkAchievements();
                alert(`🏆 ${winner} hat gewonnen!`);
                renderBoard();
                return;
            }
            
            if (board.every(cell => cell !== '')) {
                gameOver = true;
                alert('🤝 Unentschieden!');
                renderBoard();
                return;
            }
            
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            renderBoard();
        };
        
        window.GamesCenterApp.resetTicTacToe = () => {
            board = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = 'X';
            gameOver = false;
            renderBoard();
        };
    },
    
    checkWinner(board) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (const [a, b, c] of lines) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    },
    
    // ---- QUIZ ----
    playQuiz() {
        const questions = [
            { q: 'Was ist die Hauptstadt von Deutschland?', a: 'Berlin', options: ['Berlin', 'München', 'Hamburg', 'Köln'] },
            { q: 'Wie viele Planeten hat unser Sonnensystem?', a: '8', options: ['8', '9', '7', '10'] },
            { q: 'Was ist die größte Meerestier?', a: 'Blauwal', options: ['Blauwal', 'Walhai', 'Orca', 'Pottwal'] },
            { q: 'Wer schrieb "Faust"?', a: 'Goethe', options: ['Goethe', 'Schiller', 'Lessing', 'Kant'] }
        ];
        
        let score = 0;
        let current = 0;
        
        const askQuestion = () => {
            if (current >= questions.length) {
                const finalScore = score * 25;
                this.addHighscore('g4', 'HalDo', finalScore);
                alert(`🎉 Quiz beendet!\n✅ Richtig: ${score}/${questions.length}\n🏆 Punktzahl: ${finalScore}`);
                this.updateView();
                return;
            }
            
            const q = questions[current];
            const answer = prompt(`❓ Quiz Challenge\n\n${q.q}\n\n${q.options.map((o, i) => `${i+1}. ${o}`).join('\n')}`);
            
            if (answer === null) return;
            
            const selected = parseInt(answer);
            if (isNaN(selected) || selected < 1 || selected > q.options.length) {
                alert('⚠️ Bitte eine gültige Zahl eingeben.');
                askQuestion();
                return;
            }
            
            if (q.options[selected - 1] === q.a) {
                score++;
                alert('✅ Richtig!');
            } else {
                alert(`❌ Falsch! Die richtige Antwort war: ${q.a}`);
            }
            
            current++;
            askQuestion();
        };
        
        askQuestion();
    },
    
    // ---- REAKTIONSTEST ----
    playReactionTest() {
        let startTime = 0;
        let waiting = true;
        let attempts = 0;
        let totalTime = 0;
        
        const startRound = () => {
            const delay = 1000 + Math.random() * 3000;
            waiting = true;
            
            setTimeout(() => {
                if (!waiting) return;
                startTime = Date.now();
                waiting = false;
                const msg = confirm('⚡ JETZT KLICKEN! ⚡\n\nKlicke auf OK, so schnell du kannst!');
                if (msg && !waiting) {
                    const reaction = Date.now() - startTime;
                    attempts++;
                    totalTime += reaction;
                    
                    if (attempts < 3) {
                        alert(`📊 Reaktionszeit: ${reaction}ms\nVersuche: ${attempts}/3`);
                        startRound();
                    } else {
                        const avg = Math.round(totalTime / attempts);
                        const score = Math.max(100 - avg / 2, 1);
                        this.addHighscore('g5', 'HalDo', score);
                        alert(`🎉 Reaktionstest abgeschlossen!\n📊 Durchschnitt: ${avg}ms\n🏆 Punktzahl: ${score}`);
                        this.updateView();
                    }
                }
            }, delay);
        };
        
        alert('⚡ Reaktionstest\n\nWarte auf das Signal und klicke dann so schnell wie möglich.\n3 Versuche.');
        startRound();
    },
    
    // ---- WORTRÄTSEL ----
    playWordPuzzle() {
        const words = ['APFEL', 'HAUS', 'AUTO', 'BAUM', 'SONNE', 'MOND', 'STERN', 'WASSER'];
        const secret = words[Math.floor(Math.random() * words.length)];
        let guessed = [];
        let attempts = 0;
        let maxAttempts = 6;
        
        const renderPuzzle = () => {
            const display = secret.split('').map(letter => 
                guessed.includes(letter) ? letter : '_'
            ).join(' ');
            
            const content = `
                <div style="padding:12px;text-align:center;">
                    <h3 style="color:var(--text-primary);font-size:14px;margin-bottom:4px;">📝 Worträtsel</h3>
                    <div style="font-size:28px;font-weight:700;color:var(--text-primary);letter-spacing:8px;margin:12px 0;">${display}</div>
                    <div style="font-size:11px;color:var(--text-secondary);">Versuche: ${attempts}/${maxAttempts}</div>
                    <div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;justify-content:center;">
                        ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => `
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:2px 6px;${guessed.includes(letter) ? 'opacity:0.3;' : ''}" 
                                onclick="GamesCenterApp.guessLetter('${letter}')" ${guessed.includes(letter) ? 'disabled' : ''}>
                                ${letter}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            
            const existing = document.querySelector('.window[data-app-id="word-puzzle"]');
            if (existing) {
                const body = existing.querySelector('.window-body');
                if (body) body.innerHTML = content;
            } else {
                const win = WindowManager.openWindow('word-puzzle', '📝 Worträtsel', content, '📝', 400, 380);
                win.dataset.appId = 'word-puzzle';
            }
        };
        
        renderPuzzle();
        
        window.GamesCenterApp.guessLetter = (letter) => {
            if (guessed.includes(letter)) return;
            guessed.push(letter);
            
            if (secret.includes(letter)) {
                const allGuessed = secret.split('').every(l => guessed.includes(l));
                if (allGuessed) {
                    const score = Math.max(100 - attempts * 5, 1);
                    GamesCenterApp.addHighscore('g6', 'HalDo', score);
                    alert(`🎉 Wort erraten: ${secret}\n🏆 Punktzahl: ${score}`);
                    WindowManager.closeWindow(document.querySelector('.window[data-app-id="word-puzzle"]'));
                    GamesCenterApp.updateView();
                    return;
                }
            } else {
                attempts++;
                if (attempts >= maxAttempts) {
                    alert(`❌ Verloren! Das Wort war: ${secret}`);
                    WindowManager.closeWindow(document.querySelector('.window[data-app-id="word-puzzle"]'));
                    GamesCenterApp.updateView();
                    return;
                }
            }
            renderPuzzle();
        };
    },
    
    // ---- SNAKE ----
    playSnake() {
        alert('🐍 Snake\n\nSteuere die Schlange mit WASD oder Pfeiltasten.\nPunkte sammeln, nicht die Wand treffen.\n\nSpiel läuft im Hintergrund...');
        
        // Simuliertes Snake-Spiel
        let score = 0;
        let gameInterval = setInterval(() => {
            score += Math.floor(Math.random() * 3) + 1;
            if (score > 50) {
                clearInterval(gameInterval);
                GamesCenterApp.addHighscore('g7', 'HalDo', score);
                alert(`🐍 Snake beendet!\n🏆 Punktzahl: ${score}`);
                GamesCenterApp.updateView();
            }
        }, 1000);
    },
    
    // ---- PONG ----
    playPong() {
        alert('🏓 Pong\n\nKlassisches Tischtennis.\nSteuere den Schläger mit Maus.\n\nSpiel läuft im Hintergrund...');
        
        let score = 0;
        let gameInterval = setInterval(() => {
            score += Math.floor(Math.random() * 5) + 1;
            if (score > 30) {
                clearInterval(gameInterval);
                GamesCenterApp.addHighscore('g8', 'HalDo', score);
                alert(`🏓 Pong beendet!\n🏆 Punktzahl: ${score}`);
                GamesCenterApp.updateView();
            }
        }, 1000);
    },
    
    // ---- HIGHSCORES ----
    addHighscore(gameId, player, score) {
        this.highscores.push({
            id: 'h_' + Date.now().toString(36),
            gameId: gameId,
            player: player,
            score: score,
            date: Date.now()
        });
        
        // Highscores limitieren (top 100)
        if (this.highscores.length > 100) {
            this.highscores.sort((a, b) => b.score - a.score);
            this.highscores = this.highscores.slice(0, 100);
        }
        
        // XP hinzufügen
        this.playerStats.xp += Math.floor(score / 2);
        this.checkLevelUp();
        this.saveData();
    },
    
    // ---- LEVEL ----
    checkLevelUp() {
        const p = this.playerStats;
        while (p.xp >= p.xpToNextLevel) {
            p.xp -= p.xpToNextLevel;
            p.level++;
            p.xpToNextLevel = Math.floor(p.xpToNextLevel * 1.5);
            alert(`⬆️ Level Up! Du bist jetzt Level ${p.level}!`);
        }
    },
    
    // ---- ACHIEVEMENTS ----
    checkAchievements() {
        // Achievement: Erster Sieg
        if (this.playerStats.gamesWon >= 1) {
            this.unlockAchievement('a1');
        }
        // Achievement: Level 10
        if (this.playerStats.level >= 10) {
            this.unlockAchievement('a2');
        }
        // Achievement: 100 Spiele
        if (this.playerStats.gamesPlayed >= 100) {
            this.unlockAchievement('a3');
        }
        // Achievement: Zahlenraten Meister
        const score1 = this.highscores.find(h => h.gameId === 'g1')?.score;
        if (score1 && score1 >= 50) {
            this.unlockAchievement('a4');
        }
    },
    
    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.saveData();
            alert(`⭐ Erfolg freigeschaltet: ${achievement.name}\n${achievement.desc}`);
            this.updateView();
        }
    },
    
    // ---- SPIELE VERWALTEN ----
    addGame() {
        const name = prompt('🎮 Spiel-Name:');
        if (!name) return;
        const icon = prompt('🎨 Icon (Emoji):', '🎮') || '🎮';
        const category = prompt('📂 Kategorie (Denksport, Strategie, Wissen, Geschicklichkeit, Arcade):', 'Denksport') || 'Denksport';
        const desc = prompt('📝 Beschreibung:') || '';
        
        this.games.push({
            id: 'g_' + Date.now().toString(36),
            name: name,
            icon: icon,
            category: category,
            desc: desc,
            players: 0,
            rating: 0
        });
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
        console.log('🎮 Games Center App wird installiert...');
        this.loadData();
        if (this.games.length === 0) {
            this.games = [
                { id: 'g1', name: 'Zahlenraten', icon: '🔢', category: 'Denksport', desc: 'Errate die geheime Zahl', players: 1234, rating: 4.7 },
                { id: 'g2', name: 'Memory', icon: '🧠', category: 'Denksport', desc: 'Finde die passenden Paare', players: 892, rating: 4.5 },
                { id: 'g3', name: 'Tic-Tac-Toe', icon: '❌', category: 'Strategie', desc: 'Klassisches Drei-Gewinnt', players: 2156, rating: 4.8 },
                { id: 'g4', name: 'Quiz Challenge', icon: '❓', category: 'Wissen', desc: 'Teste dein Wissen', players: 567, rating: 4.3 },
                { id: 'g5', name: 'Reaction Test', icon: '⚡', category: 'Geschicklichkeit', desc: 'Teste deine Reaktionszeit', players: 789, rating: 4.6 },
                { id: 'g6', name: 'Worträtsel', icon: '📝', category: 'Denksport', desc: 'Finde die versteckten Wörter', players: 345, rating: 4.4 },
                { id: 'g7', name: 'Snake', icon: '🐍', category: 'Arcade', desc: 'Klassisches Schlangenspiel', players: 2100, rating: 4.9 },
                { id: 'g8', name: 'Pong', icon: '🏓', category: 'Arcade', desc: 'Tischtennis-Klassiker', players: 1456, rating: 4.6 }
            ];
            this.saveData();
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Games Center App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
GamesCenterApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.GamesCenterApp = GamesCenterApp;

console.log('🎮 Games Center App geladen – HalDo AI OS 24.6.0');
