/**
 * HALDO AI OS 24.6.0 – HEALTHY APP
 * Sport, Fitness, Ernährung, Trinkwasser, Schrittzähler und Kalorien-Tracker
 * Version: 1.0.0
 */

const HealthyApp = {
    // ---- APP-INFO ----
    id: 'healthy',
    name: 'Healthy',
    icon: '💪',
    category: 'health',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Sport, Fitness, Ernährung, Trinkwasser und Kalorien-Tracker',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'dashboard', // dashboard | sports | food | water | stats | exercises
    selectedActivity: null,
    selectedMeal: null,
    
    // ---- DATEN ----
    activities: [],
    meals: [],
    waterIntake: [],
    weightEntries: [],
    exerciseHistory: [],
    
    // ---- TAGESZIELE ----
    goals: {
        steps: 10000,
        calories: 2000,
        water: 2.5,
        exercise: 30
    },
    
    // ---- STANDARD-DATEN ----
    defaultActivities: [
        { id: 'a1', name: 'Laufen', icon: '🏃', caloriesPerMin: 10, description: 'Ausdauerlauf' },
        { id: 'a2', name: 'Radfahren', icon: '🚴', caloriesPerMin: 8, description: 'Fahrrad fahren' },
        { id: 'a3', name: 'Schwimmen', icon: '🏊', caloriesPerMin: 12, description: 'Brustschwimmen' },
        { id: 'a4', name: 'Yoga', icon: '🧘', caloriesPerMin: 5, description: 'Entspannungsübungen' },
        { id: 'a5', name: 'Krafttraining', icon: '🏋️', caloriesPerMin: 9, description: 'Muskelaufbau' },
        { id: 'a6', name: 'Spazierengehen', icon: '🚶', caloriesPerMin: 4, description: 'Gemütlicher Spaziergang' }
    ],
    
    defaultExercises: [
        { id: 'e1', name: 'Kniebeugen', icon: '🦵', reps: 15, sets: 3, muscle: 'Beine' },
        { id: 'e2', name: 'Liegestütze', icon: '💪', reps: 10, sets: 3, muscle: 'Brust' },
        { id: 'e3', name: 'Plank', icon: '🧘', reps: 30, sets: 3, muscle: 'Rumpf' },
        { id: 'e4', name: 'Ausfallschritte', icon: '🦵', reps: 12, sets: 3, muscle: 'Beine' },
        { id: 'e5', name: 'Klimmzüge', icon: '🏋️', reps: 5, sets: 3, muscle: 'Rücken' },
        { id: 'e6', name: 'Crunches', icon: '🔄', reps: 20, sets: 3, muscle: 'Bauch' }
    ],
    
    defaultMeals: [
        { id: 'm1', name: 'Frühstück', icon: '🍳', calories: 400, time: '08:00' },
        { id: 'm2', name: 'Mittagessen', icon: '🍲', calories: 600, time: '12:30' },
        { id: 'm3', name: 'Abendessen', icon: '🥗', calories: 500, time: '19:00' }
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
            console.log('💪 Healthy App registriert');
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
        this.activities = Storage.get('healthy_activities', this.defaultActivities);
        this.exercises = Storage.get('healthy_exercises', this.defaultExercises);
        this.meals = Storage.get('healthy_meals', this.defaultMeals);
        this.waterIntake = Storage.get('healthy_water', []);
        this.weightEntries = Storage.get('healthy_weight', []);
        this.exerciseHistory = Storage.get('healthy_exercise_history', []);
        this.goals = Storage.get('healthy_goals', this.goals);
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('healthy_activities', this.activities);
        Storage.set('healthy_exercises', this.exercises);
        Storage.set('healthy_meals', this.meals);
        Storage.set('healthy_water', this.waterIntake);
        Storage.set('healthy_weight', this.weightEntries);
        Storage.set('healthy_exercise_history', this.exerciseHistory);
        Storage.set('healthy_goals', this.goals);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'dashboard': return this.renderDashboard();
            case 'sports': return this.renderSports();
            case 'food': return this.renderFood();
            case 'water': return this.renderWater();
            case 'stats': return this.renderStats();
            case 'exercises': return this.renderExercises();
            default: return this.renderDashboard();
        }
    },
    
    // ---- DASHBOARD ----
    renderDashboard() {
        const today = new Date().toDateString();
        const todayWater = this.waterIntake.filter(w => new Date(w.date).toDateString() === today);
        const totalWater = todayWater.reduce((sum, w) => sum + w.amount, 0);
        const todayCalories = this.meals.reduce((sum, m) => sum + m.calories, 0);
        const todaySteps = Math.floor(Math.random() * 3000 + 4000); // Simuliert
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn ${this.currentMode === 'dashboard' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('sports')">🏃 Sport</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('food')">🍲 Ernährung</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('water')">💧 Wasser</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('exercises')">🏋️ Übungen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('stats')">📈 Statistiken</button>
                </div>
                
                <!-- Tagesübersicht -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;padding:12px;">
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">👣</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${todaySteps.toLocaleString()}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Schritte</div>
                        <div style="font-size:8px;color:var(--text-muted);">Ziel: ${this.goals.steps.toLocaleString()}</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">🔥</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${todayCalories}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Kalorien</div>
                        <div style="font-size:8px;color:var(--text-muted);">Ziel: ${this.goals.calories}</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">💧</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalWater.toFixed(1)}L</div>
                        <div style="font-size:10px;color:var(--text-muted);">Wasser</div>
                        <div style="font-size:8px;color:var(--text-muted);">Ziel: ${this.goals.water}L</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">⏱️</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.exerciseHistory.filter(e => new Date(e.date).toDateString() === today).length}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Training</div>
                        <div style="font-size:8px;color:var(--text-muted);">Heute</div>
                    </div>
                </div>
                
                <!-- Schnellzugriff -->
                <div style="padding:0 12px 12px 12px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
                        <button class="haldo-btn" style="font-size:12px;padding:8px;" onclick="HealthyApp.setMode('sports')">🏃 Sport</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:12px;padding:8px;" onclick="HealthyApp.setMode('food')">🍲 Essen</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:12px;padding:8px;" onclick="HealthyApp.recordWater(0.25)">💧 +0.25L</button>
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>💪 Healthy</span>
                    <span>${new Date().toLocaleDateString()}</span>
                </div>
            </div>
        `;
    },
    
    // ---- SPORT ----
    renderSports() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn ${this.currentMode === 'sports' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('sports')">🏃 Sport</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('food')">🍲 Ernährung</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('water')">💧 Wasser</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('exercises')">🏋️ Übungen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('stats')">📈 Statistiken</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="HealthyApp.addActivity()">+</button>
                </div>
                
                <!-- Aktivitäten -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    ${this.activities.map(a => `
                        <div style="
                            padding:12px;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            cursor:pointer;
                            transition: all 0.15s ease;
                        " onclick="HealthyApp.startActivity('${a.id}')">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="font-size:32px;">${a.icon || '🏃'}</div>
                                <div>
                                    <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${a.name}</div>
                                    <div style="font-size:10px;color:var(--text-secondary);">${a.description || 'Aktivität'}</div>
                                    <div style="font-size:9px;color:var(--text-muted);">${a.caloriesPerMin} kcal/min</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- ERNÄHRUNG ----
    renderFood() {
        const totalCalories = this.meals.reduce((sum, m) => sum + m.calories, 0);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('sports')">🏃 Sport</button>
                    <button class="haldo-btn ${this.currentMode === 'food' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('food')">🍲 Ernährung</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('water')">💧 Wasser</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('exercises')">🏋️ Übungen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('stats')">📈 Statistiken</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <span style="font-size:11px;color:var(--text-muted);">🔥 ${totalCalories} kcal</span>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="HealthyApp.addMeal()">+</button>
                </div>
                
                <!-- Mahlzeiten -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.meals.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Keine Mahlzeiten</p>
                        </div>
                    ` : `
                        ${this.meals.map(m => `
                            <div style="
                                padding:10px 12px;
                                margin:4px 0;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:8px;
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            ">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${m.icon || '🍲'} ${m.name}</div>
                                        <div style="font-size:10px;color:var(--text-secondary);">⏰ ${m.time || '—'} • 🔥 ${m.calories} kcal</div>
                                    </div>
                                    <div style="display:flex;gap:4px;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();HealthyApp.editMeal('${m.id}')">✏️</button>
                                        <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();HealthyApp.deleteMeal('${m.id}')">✕</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- WASSER ----
    renderWater() {
        const today = new Date().toDateString();
        const todayWater = this.waterIntake.filter(w => new Date(w.date).toDateString() === today);
        const totalWater = todayWater.reduce((sum, w) => sum + w.amount, 0);
        const percent = Math.min((totalWater / this.goals.water) * 100, 100);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('sports')">🏃 Sport</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('food')">🍲 Ernährung</button>
                    <button class="haldo-btn ${this.currentMode === 'water' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('water')">💧 Wasser</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('exercises')">🏋️ Übungen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('stats')">📈 Statistiken</button>
                </div>
                
                <!-- Wasser-Status -->
                <div style="padding:12px;text-align:center;">
                    <div style="font-size:48px;">💧</div>
                    <div style="font-size:32px;font-weight:700;color:var(--text-primary);">${totalWater.toFixed(1)}L</div>
                    <div style="font-size:12px;color:var(--text-secondary);">von ${this.goals.water}L</div>
                    <div style="width:80%;margin:8px auto;height:8px;background:var(--glass-border);border-radius:10px;overflow:hidden;">
                        <div style="width:${percent}%;height:100%;background:linear-gradient(90deg, #00D4FF, #00FF88);border-radius:10px;transition:width 0.3s ease;"></div>
                    </div>
                    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:8px;">
                        <button class="haldo-btn" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.recordWater(0.25)">+0.25L</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.recordWater(0.5)">+0.5L</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.recordWater(0.75)">+0.75L</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.recordWater(1)">+1L</button>
                    </div>
                </div>
                
                <!-- Historie -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">📋 Heute</div>
                    ${todayWater.length === 0 ? `
                        <div style="text-align:center;padding:20px;color:var(--text-muted);font-size:11px;">
                            <p>Noch kein Wasser getrunken</p>
                        </div>
                    ` : `
                        ${todayWater.map(w => `
                            <div style="
                                padding:6px 10px;
                                margin:2px 0;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:6px;
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                                display:flex;
                                justify-content:space-between;
                                font-size:11px;
                                color:var(--text-secondary);
                            ">
                                <span>${new Date(w.date).toLocaleTimeString()}</span>
                                <span>💧 ${w.amount}L</span>
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- ÜBUNGEN ----
    renderExercises() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('sports')">🏃 Sport</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('food')">🍲 Ernährung</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('water')">💧 Wasser</button>
                    <button class="haldo-btn ${this.currentMode === 'exercises' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('exercises')">🏋️ Übungen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('stats')">📈 Statistiken</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="HealthyApp.addExercise()">+</button>
                </div>
                
                <!-- Übungen -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    ${this.exercises.map(e => `
                        <div style="
                            padding:12px;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        ">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="font-size:28px;">${e.icon || '🏋️'}</div>
                                <div>
                                    <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${e.name}</div>
                                    <div style="font-size:10px;color:var(--text-secondary);">${e.reps} Wiederholungen • ${e.sets} Sätze</div>
                                    <div style="font-size:9px;color:var(--text-muted);">${e.muscle}</div>
                                </div>
                            </div>
                            <div style="display:flex;gap:4px;margin-top:6px;">
                                <button class="haldo-btn" style="font-size:9px;padding:2px 8px;" onclick="HealthyApp.doExercise('${e.id}')">✅ Machen</button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:9px;padding:2px 8px;" onclick="event.stopPropagation();HealthyApp.editExercise('${e.id}')">✏️</button>
                                <button class="haldo-btn" style="font-size:9px;padding:2px 8px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();HealthyApp.deleteExercise('${e.id}')">✕</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- STATISTIKEN ----
    renderStats() {
        const totalActivities = this.exerciseHistory.length;
        const totalCalories = this.meals.reduce((sum, m) => sum + m.calories, 0);
        const today = new Date().toDateString();
        const todayExercises = this.exerciseHistory.filter(e => new Date(e.date).toDateString() === today);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('sports')">🏃 Sport</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('food')">🍲 Ernährung</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('water')">💧 Wasser</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('exercises')">🏋️ Übungen</button>
                    <button class="haldo-btn ${this.currentMode === 'stats' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="HealthyApp.setMode('stats')">📈 Statistiken</button>
                </div>
                
                <!-- Statistiken -->
                <div style="flex:1;overflow-y:auto;padding:12px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                            <div style="font-size:24px;">🏋️</div>
                            <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalActivities}</div>
                            <div style="font-size:10px;color:var(--text-muted);">Trainings gesamt</div>
                        </div>
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                            <div style="font-size:24px;">🔥</div>
                            <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalCalories}</div>
                            <div style="font-size:10px;color:var(--text-muted);">Kalorien heute</div>
                        </div>
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                            <div style="font-size:24px;">💧</div>
                            <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.waterIntake.filter(w => new Date(w.date).toDateString() === today).reduce((s, w) => s + w.amount, 0).toFixed(1)}L</div>
                            <div style="font-size:10px;color:var(--text-muted);">Wasser heute</div>
                        </div>
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                            <div style="font-size:24px;">🏃</div>
                            <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${todayExercises.length}</div>
                            <div style="font-size:10px;color:var(--text-muted);">Training heute</div>
                        </div>
                    </div>
                    
                    <div style="margin-top:12px;padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                        <div style="font-size:12px;font-weight:600;color:var(--text-primary);">🎯 Tagesziele</div>
                        <div style="display:flex;flex-direction:column;gap:4px;margin-top:4px;">
                            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);">
                                <span>Schritte</span>
                                <span>${Math.floor(Math.random() * 3000 + 4000).toLocaleString()} / ${this.goals.steps.toLocaleString()}</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);">
                                <span>Kalorien</span>
                                <span>${totalCalories} / ${this.goals.calories}</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);">
                                <span>Wasser</span>
                                <span>${this.waterIntake.filter(w => new Date(w.date).toDateString() === today).reduce((s, w) => s + w.amount, 0).toFixed(1)}L / ${this.goals.water}L</span>
                            </div>
                        </div>
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
    
    // ---- AKTIVITÄTEN ----
    startActivity(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;
        
        const duration = parseInt(prompt(`⏱️ Dauer in Minuten für "${activity.name}":`, '15')) || 15;
        const calories = Math.round(activity.caloriesPerMin * duration);
        
        this.exerciseHistory.push({
            id: 'h_' + Date.now().toString(36),
            activityId: activityId,
            name: activity.name,
            duration: duration,
            calories: calories,
            date: Date.now()
        });
        
        this.saveData();
        alert(`✅ ${activity.name} abgeschlossen!\n⏱️ ${duration} min • 🔥 ${calories} kcal`);
        this.updateView();
        EventBus.emit('healthy:activity-done', { name: activity.name });
    },
    
    addActivity() {
        const name = prompt('🏃 Aktivität-Name:');
        if (!name) return;
        const icon = prompt('🎨 Icon (Emoji):', '🏃') || '🏃';
        const caloriesPerMin = parseInt(prompt('🔥 Kalorien pro Minute:', '8')) || 8;
        const description = prompt('📝 Beschreibung:') || '';
        
        this.activities.push({
            id: 'a_' + Date.now().toString(36),
            name: name,
            icon: icon,
            caloriesPerMin: caloriesPerMin,
            description: description
        });
        this.saveData();
        this.updateView();
    },
    
    // ---- MAHLZEITEN ----
    addMeal() {
        const name = prompt('🍲 Mahlzeit-Name:');
        if (!name) return;
        const calories = parseInt(prompt('🔥 Kalorien:', '500')) || 500;
        const icon = prompt('🎨 Icon (Emoji):', '🍲') || '🍲';
        const time = prompt('⏰ Uhrzeit (z.B. 12:30):', new Date().toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit' })) || '';
        
        this.meals.push({
            id: 'm_' + Date.now().toString(36),
            name: name,
            icon: icon,
            calories: calories,
            time: time
        });
        this.saveData();
        this.updateView();
    },
    
    editMeal(mealId) {
        const meal = this.meals.find(m => m.id === mealId);
        if (!meal) return;
        const newCalories = parseInt(prompt('🔥 Kalorien:', meal.calories)) || meal.calories;
        const newTime = prompt('⏰ Uhrzeit:', meal.time) || meal.time;
        meal.calories = newCalories;
        meal.time = newTime;
        this.saveData();
        this.updateView();
    },
    
    deleteMeal(mealId) {
        if (!confirm('Mahlzeit wirklich löschen?')) return;
        this.meals = this.meals.filter(m => m.id !== mealId);
        this.saveData();
        this.updateView();
    },
    
    // ---- WASSER ----
    recordWater(amount) {
        this.waterIntake.push({
            date: Date.now(),
            amount: amount
        });
        this.saveData();
        this.updateView();
        EventBus.emit('healthy:water-drank', { amount });
    },
    
    // ---- ÜBUNGEN ----
    addExercise() {
        const name = prompt('🏋️ Übung-Name:');
        if (!name) return;
        const reps = parseInt(prompt('🔄 Wiederholungen:', '10')) || 10;
        const sets = parseInt(prompt('📊 Sätze:', '3')) || 3;
        const muscle = prompt('💪 Muskelgruppe:', 'Allgemein') || 'Allgemein';
        const icon = prompt('🎨 Icon (Emoji):', '🏋️') || '🏋️';
        
        this.exercises.push({
            id: 'e_' + Date.now().toString(36),
            name: name,
            icon: icon,
            reps: reps,
            sets: sets,
            muscle: muscle
        });
        this.saveData();
        this.updateView();
    },
    
    editExercise(exerciseId) {
        const exercise = this.exercises.find(e => e.id === exerciseId);
        if (!exercise) return;
        const newReps = parseInt(prompt('🔄 Wiederholungen:', exercise.reps)) || exercise.reps;
        const newSets = parseInt(prompt('📊 Sätze:', exercise.sets)) || exercise.sets;
        exercise.reps = newReps;
        exercise.sets = newSets;
        this.saveData();
        this.updateView();
    },
    
    deleteExercise(exerciseId) {
        if (!confirm('Übung wirklich löschen?')) return;
        this.exercises = this.exercises.filter(e => e.id !== exerciseId);
        this.saveData();
        this.updateView();
    },
    
    doExercise(exerciseId) {
        const exercise = this.exercises.find(e => e.id === exerciseId);
        if (!exercise) return;
        
        this.exerciseHistory.push({
            id: 'h_' + Date.now().toString(36),
            exerciseId: exerciseId,
            name: exercise.name,
            reps: exercise.reps,
            sets: exercise.sets,
            date: Date.now()
        });
        
        this.saveData();
        alert(`✅ ${exercise.name} abgeschlossen!\n🔄 ${exercise.reps}x ${exercise.sets} Sätze`);
        this.updateView();
        EventBus.emit('healthy:exercise-done', { name: exercise.name });
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
        console.log('💪 Healthy App wird installiert...');
        this.loadData();
        if (this.activities.length === 0) {
            this.activities = this.defaultActivities;
            this.exercises = this.defaultExercises;
            this.meals = this.defaultMeals;
            this.saveData();
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Healthy App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
HealthyApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.HealthyApp = HealthyApp;

console.log('💪 Healthy App geladen – HalDo AI OS 24.6.0');
