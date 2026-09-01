/**
 * HALDO AI OS 24.6.0 – HEALTH CENTER APP
 * Professionelle Gesundheits-App mit Symptom-Checker, Medikamenten, Erste Hilfe und mehr
 * Version: 1.0.0
 */

const HealthCenterApp = {
    // ---- APP-INFO ----
    id: 'health-center',
    name: 'Health Center',
    icon: '🏥',
    category: 'health',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Gesundheitsmanagement, Symptom-Checker, Medikamente und Erste Hilfe',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'dashboard', // dashboard | symptoms | medications | firstaid | doctors | tracking
    selectedSymptom: null,
    selectedMedication: null,
    selectedDoctor: null,
    selectedTracking: null,
    
    // ---- DATEN ----
    symptoms: [],
    medications: [],
    doctors: [],
    trackingData: [],
    healthRecords: [],
    
    // ---- STANDARD-SYMPTOME ----
    defaultSymptoms: [
        { id: 's1', name: 'Kopfschmerzen', category: 'Kopf', severity: 'mittel', description: 'Schmerzen im Kopfbereich', causes: ['Stress', 'Dehydration', 'Migräne', 'Spannungskopfschmerz'] },
        { id: 's2', name: 'Fieber', category: 'Allgemein', severity: 'hoch', description: 'Erhöhte Körpertemperatur', causes: ['Infektion', 'Entzündung', 'Erkältung', 'Grippe'] },
        { id: 's3', name: 'Husten', category: 'Atemwege', severity: 'mittel', description: 'Reizhusten oder produktiver Husten', causes: ['Erkältung', 'Grippe', 'Bronchitis', 'Allergie'] },
        { id: 's4', name: 'Müdigkeit', category: 'Allgemein', severity: 'leicht', description: 'Erschöpfung und Antriebslosigkeit', causes: ['Schlafmangel', 'Stress', 'Eisenmangel', 'Depression'] },
        { id: 's5', name: 'Rückenschmerzen', category: 'Bewegung', severity: 'mittel', description: 'Schmerzen im Rückenbereich', causes: ['Verspannung', 'Bandscheibenvorfall', 'Falsche Haltung', 'Überlastung'] },
        { id: 's6', name: 'Übelkeit', category: 'Magen', severity: 'mittel', description: 'Unwohlsein im Magen', causes: ['Magen-Darm-Infekt', 'Lebensmittelvergiftung', 'Schwangerschaft', 'Stress'] },
        { id: 's7', name: 'Durchfall', category: 'Magen', severity: 'mittel', description: 'Häufiger, flüssiger Stuhl', causes: ['Magen-Darm-Infekt', 'Lebensmittelvergiftung', 'Nahrungsmittelunverträglichkeit'] },
        { id: 's8', name: 'Halsschmerzen', category: 'Atemwege', severity: 'leicht', description: 'Schmerzen im Rachen', causes: ['Erkältung', 'Grippe', 'Entzündung', 'Allergie'] },
        { id: 's9', name: 'Schwindel', category: 'Kopf', severity: 'hoch', description: 'Gefühl der Benommenheit', causes: ['Kreislaufprobleme', 'Niedriger Blutdruck', 'Anämie', 'Innenohrprobleme'] },
        { id: 's10', name: 'Brustschmerzen', category: 'Brust', severity: 'sehr hoch', description: 'Schmerzen im Brustbereich', causes: ['Herzprobleme', 'Muskelverspannung', 'Sodbrennen', 'Angst'] }
    ],
    
    // ---- STANDARD-MEDIKAMENTE ----
    defaultMedications: [
        { id: 'm1', name: 'Paracetamol', dosage: '500mg', type: 'Schmerzmittel', schedule: 'alle 6 Stunden', notes: 'Nicht auf nüchternen Magen' },
        { id: 'm2', name: 'Ibuprofen', dosage: '400mg', type: 'Entzündungshemmer', schedule: 'alle 8 Stunden', notes: 'Zu den Mahlzeiten einnehmen' },
        { id: 'm3', name: 'Aspirin', dosage: '100mg', type: 'Schmerzmittel', schedule: 'alle 4 Stunden', notes: 'Bei Durchblutungsstörungen' },
        { id: 'm4', name: 'Corona-Test', dosage: 'nasal', type: 'Test', schedule: 'bei Bedarf', notes: 'Schnelltest für zuhause' }
    ],
    
    // ---- STANDARD-ÄRZTE ----
    defaultDoctors: [
        { id: 'd1', name: 'Dr. Anna Schmidt', specialty: 'Allgemeinmedizin', address: 'Hauptstraße 12, 10115 Berlin', phone: '+49 30 123456', hours: 'Mo-Fr 8-18' },
        { id: 'd2', name: 'Dr. Klaus Weber', specialty: 'Kardiologie', address: 'Klinikweg 5, 10115 Berlin', phone: '+49 30 654321', hours: 'Mo-Mi 9-16' },
        { id: 'd3', name: 'Dr. Maria Müller', specialty: 'Gynäkologie', address: 'Frauenstraße 3, 10115 Berlin', phone: '+49 30 789012', hours: 'Di-Do 10-18' },
        { id: 'd4', name: 'Dr. Thomas Fischer', specialty: 'Orthopädie', address: 'Muskelweg 8, 10115 Berlin', phone: '+49 30 345678', hours: 'Mo-Fr 8-15' }
    ],
    
    // ---- STANDARD-TRACKING ----
    defaultTracking: [
        { id: 't1', date: Date.now() - 86400000 * 0, type: 'weight', value: 75.5, unit: 'kg' },
        { id: 't2', date: Date.now() - 86400000 * 1, type: 'weight', value: 75.8, unit: 'kg' },
        { id: 't3', date: Date.now() - 86400000 * 2, type: 'weight', value: 76.0, unit: 'kg' },
        { id: 't4', date: Date.now() - 86400000 * 0, type: 'bloodpressure', value: '120/80', unit: 'mmHg' },
        { id: 't5', date: Date.now() - 86400000 * 0, type: 'steps', value: 8423, unit: 'Schritte' }
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
            console.log('🏥 Health Center App registriert');
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
        this.symptoms = Storage.get('health_symptoms', this.defaultSymptoms);
        this.medications = Storage.get('health_medications', this.defaultMedications);
        this.doctors = Storage.get('health_doctors', this.defaultDoctors);
        this.trackingData = Storage.get('health_tracking', this.defaultTracking);
        this.healthRecords = Storage.get('health_records', []);
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('health_symptoms', this.symptoms);
        Storage.set('health_medications', this.medications);
        Storage.set('health_doctors', this.doctors);
        Storage.set('health_tracking', this.trackingData);
        Storage.set('health_records', this.healthRecords);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'dashboard': return this.renderDashboard();
            case 'symptoms': return this.renderSymptoms();
            case 'medications': return this.renderMedications();
            case 'firstaid': return this.renderFirstAid();
            case 'doctors': return this.renderDoctors();
            case 'tracking': return this.renderTracking();
            default: return this.renderDashboard();
        }
    },
    
    // ---- DASHBOARD ----
    renderDashboard() {
        const totalSymptoms = this.symptoms.length;
        const totalMedications = this.medications.length;
        const totalDoctors = this.doctors.length;
        const totalTracking = this.trackingData.length;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn ${this.currentMode === 'dashboard' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('symptoms')">🩺 Symptome</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('medications')">💊 Medikamente</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('firstaid')">🚑 Erste Hilfe</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('doctors')">👨‍⚕️ Ärzte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('tracking')">📈 Tracking</button>
                </div>
                
                <!-- Übersicht -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;padding:12px;">
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">🩺</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalSymptoms}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Symptome</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">💊</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalMedications}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Medikamente</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">👨‍⚕️</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalDoctors}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Ärzte</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">📈</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${totalTracking}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Einträge</div>
                    </div>
                </div>
                
                <!-- Notfall -->
                <div style="padding:0 12px 12px 12px;">
                    <div style="padding:16px;background:rgba(255,59,48,0.1);border-radius:8px;border:1px solid rgba(255,59,48,0.2);text-align:center;">
                        <div style="font-size:32px;">🚨</div>
                        <div style="font-size:16px;font-weight:700;color:var(--danger, #FF3B30);">Notfall</div>
                        <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">Bei akuten Notfällen: 112 anrufen</div>
                        <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;">
                            <button class="haldo-btn" style="font-size:14px;padding:8px 24px;background:var(--danger, #FF3B30);" onclick="alert('🚨 112 – Notruf wird gewählt (simuliert)')">📞 112</button>
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:14px;padding:8px 24px;" onclick="HealthCenterApp.setMode('firstaid')">🚑 Erste Hilfe</button>
                        </div>
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🏥 Health Center</span>
                    <span>💙 HalDo AI OS</span>
                </div>
            </div>
        `;
    },
    
    // ---- SYMPTOME ----
    renderSymptoms() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn ${this.currentMode === 'symptoms' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('symptoms')">🩺 Symptome</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('medications')">💊 Medikamente</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('firstaid')">🚑 Erste Hilfe</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('doctors')">👨‍⚕️ Ärzte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('tracking')">📈 Tracking</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="HealthCenterApp.checkSymptoms()">🔍 Prüfen</button>
                </div>
                
                <!-- Symptom-Checker -->
                <div style="padding:8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));">
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        <select id="symptom-select" class="haldo-input" style="flex:1;font-size:11px;min-width:80px;">
                            <option value="">-- Symptom auswählen --</option>
                            ${this.symptoms.map(s => `
                                <option value="${s.id}">${s.name} (${s.category})</option>
                            `).join('')}
                        </select>
                        <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="HealthCenterApp.symptomInfo()">ℹ️ Info</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="HealthCenterApp.addSymptom()">+</button>
                    </div>
                </div>
                
                <!-- Symptom-Liste -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.symptoms.map(s => {
                        const severityColor = s.severity === 'leicht' ? 'var(--success)' : s.severity === 'mittel' ? 'var(--warning)' : s.severity === 'hoch' ? 'var(--danger)' : 'var(--danger)';
                        return `
                            <div style="
                                padding:8px 12px;
                                margin:4px 0;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:6px;
                                border-left: 4px solid ${severityColor};
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            ">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${s.name}</div>
                                        <div style="font-size:10px;color:var(--text-secondary);">${s.category} • ${s.severity}</div>
                                    </div>
                                    <div style="display:flex;gap:4px;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();HealthCenterApp.symptomInfo('${s.id}')">ℹ️</button>
                                        <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();HealthCenterApp.deleteSymptom('${s.id}')">✕</button>
                                    </div>
                                </div>
                                <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">${s.description}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- MEDIKAMENTE ----
    renderMedications() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('symptoms')">🩺 Symptome</button>
                    <button class="haldo-btn ${this.currentMode === 'medications' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('medications')">💊 Medikamente</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('firstaid')">🚑 Erste Hilfe</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('doctors')">👨‍⚕️ Ärzte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('tracking')">📈 Tracking</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="HealthCenterApp.addMedication()">+</button>
                </div>
                
                <!-- Medikamente -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.medications.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Keine Medikamente gespeichert</p>
                        </div>
                    ` : `
                        ${this.medications.map(m => `
                            <div style="
                                padding:10px 12px;
                                margin:4px 0;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:8px;
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            ">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${m.name}</div>
                                        <div style="font-size:10px;color:var(--text-secondary);">${m.dosage} • ${m.type}</div>
                                        <div style="font-size:9px;color:var(--text-muted);">${m.schedule}</div>
                                    </div>
                                    <div style="display:flex;gap:4px;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();HealthCenterApp.medicationInfo('${m.id}')">ℹ️</button>
                                        <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();HealthCenterApp.deleteMedication('${m.id}')">✕</button>
                                    </div>
                                </div>
                                ${m.notes ? `<div style="font-size:9px;color:var(--text-muted);margin-top:4px;">📝 ${m.notes}</div>` : ''}
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- ERSTE HILFE ----
    renderFirstAid() {
        const firstAidItems = [
            { id: 'f1', icon: '🆘', title: 'Notruf 112', desc: 'In lebensbedrohlichen Notfällen sofort 112 anrufen' },
            { id: 'f2', icon: '❤️', title: 'Wiederbelebung', desc: 'Herzdruckmassage (30:2) – 100-120 Kompressionen pro Minute' },
            { id: 'f3', icon: '🩹', title: 'Wunde versorgen', desc: 'Wunde reinigen, desinfizieren und mit sterilem Verband abdecken' },
            { id: 'f4', icon: '🦷', title: 'Zahnverletzung', desc: 'Zahn in Milch aufbewahren, zum Zahnarzt gehen' },
            { id: 'f5', icon: '🥵', title: 'Sonnenstich', desc: 'In den Schatten legen, kühle Umschläge, viel trinken' },
            { id: 'f6', icon: '🆘', title: 'Vergiftung', desc: 'Giftnotrufzentrale anrufen: 19240' },
            { id: 'f7', icon: '🔄', title: 'Stabile Seitenlage', desc: 'Bei Bewusstlosigkeit in stabile Seitenlage bringen' },
            { id: 'f8', icon: '🧊', title: 'Verstauchung', desc: 'Kühlen, hochlegen, schonen – PECH-Regel' }
        ];
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('symptoms')">🩺 Symptome</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('medications')">💊 Medikamente</button>
                    <button class="haldo-btn ${this.currentMode === 'firstaid' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('firstaid')">🚑 Erste Hilfe</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('doctors')">👨‍⚕️ Ärzte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('tracking')">📈 Tracking</button>
                </div>
                
                <!-- Erste Hilfe -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    ${firstAidItems.map(item => `
                        <div style="
                            padding:12px;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            cursor:pointer;
                            transition: all 0.15s ease;
                        " onclick="HealthCenterApp.showFirstAidDetail('${item.id}')">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="font-size:32px;">${item.icon}</div>
                                <div>
                                    <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${item.title}</div>
                                    <div style="font-size:10px;color:var(--text-secondary);">${item.desc}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- ÄRZTE ----
    renderDoctors() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('symptoms')">🩺 Symptome</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('medications')">💊 Medikamente</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('firstaid')">🚑 Erste Hilfe</button>
                    <button class="haldo-btn ${this.currentMode === 'doctors' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('doctors')">👨‍⚕️ Ärzte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('tracking')">📈 Tracking</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="HealthCenterApp.addDoctor()">+</button>
                </div>
                
                <!-- Ärzte -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.doctors.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Keine Ärzte gespeichert</p>
                        </div>
                    ` : `
                        ${this.doctors.map(d => `
                            <div style="
                                padding:10px 12px;
                                margin:4px 0;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:8px;
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            ">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${d.name}</div>
                                        <div style="font-size:10px;color:var(--text-secondary);">${d.specialty}</div>
                                        <div style="font-size:9px;color:var(--text-muted);">${d.address}</div>
                                        <div style="font-size:9px;color:var(--text-muted);">📞 ${d.phone} • ${d.hours}</div>
                                    </div>
                                    <div style="display:flex;gap:4px;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();HealthCenterApp.doctorInfo('${d.id}')">ℹ️</button>
                                        <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();HealthCenterApp.deleteDoctor('${d.id}')">✕</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- TRACKING ----
    renderTracking() {
        const weightData = this.trackingData.filter(t => t.type === 'weight');
        const lastWeight = weightData.length > 0 ? weightData[0].value : '—';
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('symptoms')">🩺 Symptome</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('medications')">💊 Medikamente</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('firstaid')">🚑 Erste Hilfe</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('doctors')">👨‍⚕️ Ärzte</button>
                    <button class="haldo-btn ${this.currentMode === 'tracking' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="HealthCenterApp.setMode('tracking')">📈 Tracking</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="HealthCenterApp.addTracking()">+</button>
                </div>
                
                <!-- Übersicht -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:12px;">
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:10px;color:var(--text-muted);">Gewicht</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${lastWeight} kg</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:10px;color:var(--text-muted);">Blutdruck</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.trackingData.find(t => t.type === 'bloodpressure')?.value || '—'}</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:10px;color:var(--text-muted);">Schritte</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.trackingData.find(t => t.type === 'steps')?.value || '—'}</div>
                    </div>
                </div>
                
                <!-- Tracking-Liste -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.trackingData.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Keine Tracking-Daten</p>
                        </div>
                    ` : `
                        ${this.trackingData.map(t => `
                            <div style="
                                padding:8px 12px;
                                margin:4px 0;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:6px;
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            ">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${t.type === 'weight' ? '⚖️' : t.type === 'bloodpressure' ? '💓' : '👣'} ${t.type}</div>
                                        <div style="font-size:11px;color:var(--text-secondary);">${t.value} ${t.unit}</div>
                                        <div style="font-size:9px;color:var(--text-muted);">${new Date(t.date).toLocaleDateString()}</div>
                                    </div>
                                    <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();HealthCenterApp.deleteTracking('${t.id}')">✕</button>
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
    
    // ---- SYMPTOM-FUNKTIONEN ----
    symptomInfo(symptomId = null) {
        const id = symptomId || document.getElementById('symptom-select')?.value;
        if (!id) {
            alert('⚠️ Bitte ein Symptom auswählen.');
            return;
        }
        const symptom = this.symptoms.find(s => s.id === id);
        if (!symptom) return;
        
        alert(
            `🩺 ${symptom.name}\n\n` +
            `📂 Kategorie: ${symptom.category}\n` +
            `⚠️ Schweregrad: ${symptom.severity}\n` +
            `📝 Beschreibung: ${symptom.description}\n\n` +
            `🔍 Mögliche Ursachen:\n${symptom.causes.map(c => `  • ${c}`).join('\n')}\n\n` +
            `💡 Bei anhaltenden oder starken Beschwerden einen Arzt aufsuchen.`
        );
    },
    
    addSymptom() {
        const name = prompt('🩺 Symptom-Name:');
        if (!name) return;
        const category = prompt('📂 Kategorie (Kopf, Atemwege, Magen, Bewegung, Allgemein):', 'Allgemein') || 'Allgemein';
        const severity = prompt('⚠️ Schweregrad (leicht/mittel/hoch/sehr hoch):', 'mittel') || 'mittel';
        const description = prompt('📝 Beschreibung:') || '';
        
        this.symptoms.push({
            id: 's_' + Date.now().toString(36),
            name: name,
            category: category,
            severity: severity,
            description: description,
            causes: []
        });
        this.saveData();
        this.updateView();
    },
    
    deleteSymptom(symptomId) {
        if (!confirm('Symptom wirklich löschen?')) return;
        this.symptoms = this.symptoms.filter(s => s.id !== symptomId);
        this.saveData();
        this.updateView();
    },
    
    checkSymptoms() {
        const selected = document.getElementById('symptom-select');
        if (!selected || !selected.value) {
            alert('⚠️ Bitte ein Symptom auswählen.');
            return;
        }
        this.symptomInfo(selected.value);
    },
    
    // ---- MEDIKAMENT-FUNKTIONEN ----
    addMedication() {
        const name = prompt('💊 Medikament-Name:');
        if (!name) return;
        const dosage = prompt('💊 Dosierung (z.B. 500mg):', '500mg') || '500mg';
        const type = prompt('📂 Typ (Schmerzmittel, Entzündungshemmer, Antibiotikum, etc.):', 'Schmerzmittel') || 'Schmerzmittel';
        const schedule = prompt('⏰ Einnahmeschema (z.B. alle 6 Stunden):', 'alle 6 Stunden') || 'alle 6 Stunden';
        const notes = prompt('📝 Notizen:') || '';
        
        this.medications.push({
            id: 'm_' + Date.now().toString(36),
            name: name,
            dosage: dosage,
            type: type,
            schedule: schedule,
            notes: notes
        });
        this.saveData();
        this.updateView();
    },
    
    medicationInfo(medicationId) {
        const med = this.medications.find(m => m.id === medicationId);
        if (!med) return;
        alert(
            `💊 ${med.name}\n\n` +
            `💊 Dosierung: ${med.dosage}\n` +
            `📂 Typ: ${med.type}\n` +
            `⏰ Einnahme: ${med.schedule}\n` +
            `${med.notes ? `📝 Notizen: ${med.notes}` : ''}`
        );
    },
    
    deleteMedication(medicationId) {
        if (!confirm('Medikament wirklich löschen?')) return;
        this.medications = this.medications.filter(m => m.id !== medicationId);
        this.saveData();
        this.updateView();
    },
    
    // ---- ERSTE HILFE ----
    showFirstAidDetail(itemId) {
        const details = {
            'f1': '🚨 NOTRUF 112\n\nIn lebensbedrohlichen Notfällen:\n1. 112 anrufen\n2. Standort nennen\n3. Situation schildern\n4. Anweisungen befolgen\n5. Erste Hilfe leisten',
            'f2': '❤️ WIEDERBELEBUNG\n\n1. Bewusstseinsprüfung\n2. Atemkontrolle\n3. 30 Brustkompressionen (100-120/min)\n4. 2 Beatmungen\n5. Wiederholen bis Hilfe eintrifft',
            'f3': '🩹 WUNDE VERSORGEN\n\n1. Hände waschen\n2. Wunde reinigen (Wasser)\n3. Desinfizieren\n4. Steriler Verband\n5. Bei starken Blutungen: Druckverband',
            'f4': '🦷 ZAHNVERLETZUNG\n\n1. Zahn in Milch aufbewahren\n2. Nicht berühren\n3. Mund spülen\n4. Zahnarzt sofort aufsuchen',
            'f5': '🥵 SONNENSTICH\n\n1. In den Schatten legen\n2. Kopf hochlagern\n3. Kühle Umschläge\n4. Viel trinken\n5. Arzt bei Bewusstlosigkeit',
            'f6': '🆘 VERGIFTUNG\n\n1. Giftnotruf: 19240\n2. Ruhe bewahren\n3. Kein Erbrechen herbeiführen\n4. Giftreste aufbewahren\n5. Arzt aufsuchen',
            'f7': '🔄 STABILE SEITENLAGE\n\n1. Bewusstlose Person\n2. Beine anwinkeln\n3. Kopf überstrecken\n4. Atemwege freihalten\n5. Notruf absetzen',
            'f8': '🧊 VERSTAUCHUNG (PECH)\n\nPause: Belastung stoppen\nEis: Kühlen (20 Min)\nCompression: Kompression\nHochlagern: Bein hoch'
        };
        
        const detail = details[itemId] || 'Information nicht verfügbar.';
        alert(detail);
    },
    
    // ---- ARZT-FUNKTIONEN ----
    addDoctor() {
        const name = prompt('👨‍⚕️ Name des Arztes:');
        if (!name) return;
        const specialty = prompt('📂 Fachrichtung:', 'Allgemeinmedizin') || 'Allgemeinmedizin';
        const address = prompt('📍 Adresse:', '') || '—';
        const phone = prompt('📞 Telefon:', '') || '—';
        const hours = prompt('⏰ Sprechzeiten:', 'Mo-Fr 8-18') || 'Mo-Fr 8-18';
        
        this.doctors.push({
            id: 'd_' + Date.now().toString(36),
            name: name,
            specialty: specialty,
            address: address,
            phone: phone,
            hours: hours
        });
        this.saveData();
        this.updateView();
    },
    
    doctorInfo(doctorId) {
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (!doctor) return;
        alert(
            `👨‍⚕️ ${doctor.name}\n\n` +
            `📂 Fachrichtung: ${doctor.specialty}\n` +
            `📍 Adresse: ${doctor.address}\n` +
            `📞 Telefon: ${doctor.phone}\n` +
            `⏰ Sprechzeiten: ${doctor.hours}`
        );
    },
    
    deleteDoctor(doctorId) {
        if (!confirm('Arzt wirklich löschen?')) return;
        this.doctors = this.doctors.filter(d => d.id !== doctorId);
        this.saveData();
        this.updateView();
    },
    
    // ---- TRACKING-FUNKTIONEN ----
    addTracking() {
        const type = prompt('📊 Typ (weight, bloodpressure, steps):', 'weight') || 'weight';
        const value = prompt('📊 Wert:', '');
        if (!value) return;
        const unit = prompt('📐 Einheit (kg, mmHg, Schritte):', type === 'weight' ? 'kg' : type === 'bloodpressure' ? 'mmHg' : 'Schritte') || '';
        
        this.trackingData.unshift({
            id: 't_' + Date.now().toString(36),
            date: Date.now(),
            type: type,
            value: value,
            unit: unit
        });
        this.saveData();
        this.updateView();
    },
    
    deleteTracking(trackingId) {
        if (!confirm('Eintrag wirklich löschen?')) return;
        this.trackingData = this.trackingData.filter(t => t.id !== trackingId);
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
        console.log('🏥 Health Center App wird installiert...');
        this.loadData();
        if (this.symptoms.length === 0) {
            this.symptoms = this.defaultSymptoms;
            this.medications = this.defaultMedications;
            this.doctors = this.defaultDoctors;
            this.trackingData = this.defaultTracking;
            this.saveData();
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Health Center App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
HealthCenterApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.HealthCenterApp = HealthCenterApp;

console.log('🏥 Health Center App geladen – HalDo AI OS 24.6.0');
