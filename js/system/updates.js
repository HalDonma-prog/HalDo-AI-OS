/**
 * HALDO AI OS 24.6.0 – UPDATE CENTER
 * Professionelles System-Update mit Versionierung, Changelog, Backup, Rollback
 * Version: 2.0.0
 * 
 * NEU in Version 2.0.0:
 * - Automatische Update-Prüfung
 * - Backup vor jedem Update
 * - Rollback zu vorherigen Versionen
 * - Detaillierter Changelog
 * - Update-Fortschrittsanzeige
 * - Update-Historie
 * - Sicherheits-Updates
 */

const UpdateCenter = {
    // ---- SYSTEM-INFORMATIONEN ----
    currentVersion: '24.6.0',
    currentBuild: '2024.06.01',
    updateChannel: 'stable', // stable | beta | dev
    isUpdating: false,
    lastCheck: null,
    
    // ---- UPDATE-DATEN ----
    availableUpdates: [],
    updateHistory: [],
    backupPoints: [],
    
    // ---- CHANGELOG ----
    changelog: {
        '24.6.0': {
            date: '2024-06-01',
            type: 'major',
            changes: [
                '🚀 Erstveröffentlichung von HalDo AI OS',
                '🧠 AI Core mit Groq API',
                '🌌 Cosmic World 3D-Universum',
                '👤 Living AI Avatar',
                '📱 70+ Apps',
                '🎤 Voice Control mit 14 Sprachen',
                '🪟 Professionelles Window System',
                '📦 PWA & Offline-Modus'
            ]
        },
        '24.6.1': {
            date: '2024-06-15',
            type: 'minor',
            changes: [
                '🐛 Bugfix: Fenster-Manager Stabilität',
                '🐛 Bugfix: AI Memory Speicherung',
                '🚀 Performance-Optimierungen',
                '🌍 Neue Sprachen: Russisch, Italienisch',
                '📱 Verbesserte Responsivität'
            ]
        },
        '24.7.0': {
            date: '2024-07-01',
            type: 'major',
            changes: [
                '🎵 Music Studio Pro (v2.0.0)',
                '🎬 Video Studio Pro (v2.0.0)',
                '🤖 AI Video Generator Pro (v2.0.0)',
                '🎮 Games Center mit 8 Spielen',
                '🧠 AI Tutor für alle Fächer',
                '🏥 Health Center mit Symptom-Checker',
                '🎓 University Center mit Quiz',
                '🌍 Language Center mit 10 Sprachen'
            ]
        },
        '24.7.1': {
            date: '2024-07-15',
            type: 'minor',
            changes: [
                '🐛 Bugfix: Cosmic World Performance',
                '🐛 Bugfix: Voice System Latenz',
                '🚀 Ladezeiten optimiert',
                '✨ Neue Themes: Aurora, Midnight',
                '📱 Mobile-Optimierungen'
            ]
        },
        '24.8.0': {
            date: '2024-08-01',
            type: 'major',
            changes: [
                '🔄 Update-Center mit Rollback',
                '📊 System Monitor erweitert',
                '🔒 Security Center mit Privacy-Modus',
                '💾 Backup & Recovery Center',
                '📡 Remote / Device Center',
                '🧩 Extensions Center',
                '📈 Performance-Monitoring'
            ]
        }
    },
    
    // ---- REGISTRIERUNG ----
    register() {
        if (typeof AppRegistry !== 'undefined') {
            AppRegistry.register({
                id: 'update-center',
                name: 'Update Center',
                icon: '🔄',
                category: 'system',
                version: '2.0.0',
                author: 'HalDo Team',
                description: 'System-Updates, Versionierung, Changelog und Rollback',
                open: (params) => this.open(params),
                close: () => this.close(),
                install: () => this.install(),
                uninstall: () => this.uninstall()
            });
            console.log('🔄 Update Center registriert (v2.0.0)');
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
        this.isOpen = true;
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            'update-center',
            'Update Center',
            content,
            '🔄',
            params.width || 620,
            params.height || 520
        );
        
        if (this.window) {
            this.attachEvents();
        }
        
        EventBus.emit('app:opened', { appId: 'update-center' });
        return this.window;
    },
    
    // ---- SCHLIEßEN ----
    close() {
        if (this.window) {
            WindowManager.closeWindow(this.window);
            this.isOpen = false;
            this.window = null;
        }
        EventBus.emit('app:closed', { appId: 'update-center' });
        return this;
    },
    
    // ---- DATEN LADEN ----
    loadData() {
        this.updateHistory = Storage.get('update_history', []);
        this.backupPoints = Storage.get('backup_points', []);
        this.lastCheck = Storage.get('last_update_check', null);
        this.updateChannel = Storage.get('update_channel', 'stable');
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('update_history', this.updateHistory);
        Storage.set('backup_points', this.backupPoints);
        Storage.set('last_update_check', this.lastCheck);
        Storage.set('update_channel', this.updateChannel);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        const hasUpdates = this.checkForUpdates();
        const lastCheckStr = this.lastCheck ? new Date(this.lastCheck).toLocaleString() : 'Nie';
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;align-items:center;">
                    <span style="font-size:14px;font-weight:700;color:var(--text-primary);">🔄 Update Center</span>
                    <div style="flex:1;"></div>
                    <span style="font-size:11px;color:var(--text-muted);">v${this.currentVersion}</span>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="UpdateCenter.checkManually()">🔍 Prüfen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="UpdateCenter.openSettings()">⚙️</button>
                </div>
                
                <!-- Status -->
                <div style="padding:8px 12px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;">
                        <div>
                            <div style="font-size:14px;font-weight:600;color:var(--text-primary);">
                                ${hasUpdates ? '🔄 Update verfügbar!' : '✅ System ist aktuell'}
                            </div>
                            <div style="font-size:11px;color:var(--text-secondary);">
                                Version ${this.currentVersion} • Build ${this.currentBuild} • Kanal: ${this.updateChannel}
                            </div>
                            <div style="font-size:10px;color:var(--text-muted);">
                                Letzte Prüfung: ${lastCheckStr}
                            </div>
                        </div>
                        ${hasUpdates ? `
                            <button class="haldo-btn" style="font-size:12px;padding:6px 16px;" onclick="UpdateCenter.installUpdate()">
                                📦 Update installieren
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Inhalt -->
                <div style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;">
                    <!-- Verfügbare Updates -->
                    ${hasUpdates ? `
                        <div style="padding:12px;background:rgba(0,255,136,0.06);border-radius:8px;border:1px solid var(--success, #00FF88);">
                            <div style="font-size:13px;font-weight:600;color:var(--text-primary);">📦 ${this.availableUpdates.length} Update(s) verfügbar</div>
                            ${this.availableUpdates.map(u => `
                                <div style="margin-top:8px;padding:8px 12px;background:var(--glass-bg);border-radius:6px;border:1px solid var(--glass-border);">
                                    <div style="display:flex;justify-content:space-between;align-items:center;">
                                        <div>
                                            <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${u.version}</div>
                                            <div style="font-size:10px;color:var(--text-secondary);">${u.type} • ${u.date}</div>
                                            <div style="font-size:10px;color:var(--text-muted);">${u.changes.length} Änderungen</div>
                                        </div>
                                        <span style="font-size:10px;color:var(--success, #00FF88);">✅ Bereit</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <!-- Backup-Punkte -->
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <div style="font-size:13px;font-weight:600;color:var(--text-primary);">💾 Backup-Punkte</div>
                                <div style="font-size:11px;color:var(--text-secondary);">${this.backupPoints.length} gespeicherte Backups</div>
                            </div>
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="UpdateCenter.createBackup()">💾 Backup erstellen</button>
                        </div>
                        ${this.backupPoints.length > 0 ? `
                            <div style="margin-top:8px;max-height:100px;overflow-y:auto;">
                                ${this.backupPoints.slice(-3).reverse().map((b, i) => `
                                    <div style="display:flex;justify-content:space-between;padding:4px 8px;background:var(--glass-bg);border-radius:4px;margin:2px 0;font-size:10px;color:var(--text-secondary);">
                                        <span>📦 ${b.version} • ${new Date(b.date).toLocaleString()}</span>
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="UpdateCenter.restoreBackup('${b.id}')">🔄 Wiederherstellen</button>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">Keine Backups vorhanden</div>
                        `}
                    </div>
                    
                    <!-- Update-Historie -->
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">📋 Update-Historie</div>
                        ${this.updateHistory.length > 0 ? `
                            <div style="margin-top:8px;max-height:150px;overflow-y:auto;">
                                ${this.updateHistory.slice(-5).reverse().map(u => `
                                    <div style="display:flex;justify-content:space-between;padding:4px 8px;background:var(--glass-bg);border-radius:4px;margin:2px 0;font-size:10px;color:var(--text-secondary);">
                                        <span>${u.version} → ${u.target || u.version}</span>
                                        <span>${new Date(u.date).toLocaleDateString()}</span>
                                        <span style="color:${u.status === 'success' ? 'var(--success)' : 'var(--danger)'};">${u.status === 'success' ? '✅ Erfolgreich' : '❌ Fehlgeschlagen'}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">Keine Updates installiert</div>
                        `}
                    </div>
                    
                    <!-- Changelog -->
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div style="font-size:13px;font-weight:600;color:var(--text-primary);">📝 Changelog</div>
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="UpdateCenter.showFullChangelog()">📖 Alle anzeigen</button>
                        </div>
                        <div style="margin-top:8px;max-height:120px;overflow-y:auto;">
                            ${Object.entries(this.changelog).slice(-3).reverse().map(([version, data]) => `
                                <div style="padding:4px 8px;background:var(--glass-bg);border-radius:4px;margin:2px 0;">
                                    <div style="display:flex;justify-content:space-between;font-size:11px;">
                                        <span style="font-weight:600;color:var(--text-primary);">v${version}</span>
                                        <span style="color:var(--text-muted);">${data.date}</span>
                                        <span style="color:${data.type === 'major' ? 'var(--gold, #FFD700)' : 'var(--text-muted)'};">${data.type}</span>
                                    </div>
                                    <div style="font-size:9px;color:var(--text-secondary);">${data.changes.slice(0, 2).map(c => `• ${c}`).join(' ')}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🔄 Update Center v2.0.0</span>
                    <span>${this.isUpdating ? '⏳ Update läuft...' : '✅ Bereit'}</span>
                </div>
            </div>
        `;
    },
    
    // ---- UPDATE-CHECK ----
    checkForUpdates() {
        // Simulierte Update-Prüfung
        const availableVersions = Object.keys(this.changelog);
        const currentIndex = availableVersions.indexOf(this.currentVersion);
        
        if (currentIndex === -1) {
            // Falls aktuelle Version nicht in Changelog, alle als verfügbar
            this.availableUpdates = Object.entries(this.changelog)
                .filter(([v]) => v > this.currentVersion)
                .map(([version, data]) => ({
                    version: version,
                    type: data.type,
                    date: data.date,
                    changes: data.changes,
                    size: Math.floor(Math.random() * 50 + 10) + 'MB'
                }));
        } else {
            // Nur neuere Versionen
            const newer = availableVersions.slice(currentIndex + 1);
            this.availableUpdates = newer.map(v => ({
                version: v,
                type: this.changelog[v].type,
                date: this.changelog[v].date,
                changes: this.changelog[v].changes,
                size: Math.floor(Math.random() * 50 + 10) + 'MB'
            }));
        }
        
        this.saveData();
        return this.availableUpdates.length > 0;
    },
    
    checkManually() {
        this.lastCheck = Date.now();
        this.checkForUpdates();
        this.updateView();
        
        if (this.availableUpdates.length > 0) {
            alert(`🔍 ${this.availableUpdates.length} Update(s) verfügbar!`);
        } else {
            alert('✅ System ist auf dem neuesten Stand.');
        }
    },
    
    // ---- UPDATE INSTALLIEREN ----
    async installUpdate() {
        if (this.isUpdating) {
            alert('⏳ Ein Update läuft bereits.');
            return;
        }
        
        if (this.availableUpdates.length === 0) {
            alert('✅ Keine Updates verfügbar.');
            return;
        }
        
        // Backup erstellen
        const backupId = this.createBackup();
        
        this.isUpdating = true;
        this.updateView();
        
        // Update-Fortschritt simulieren
        const progress = document.createElement('div');
        progress.style.cssText = `
            position:fixed;
            top:50%;
            left:50%;
            transform:translate(-50%,-50%);
            background:var(--bg-primary);
            padding:20px 40px;
            border-radius:12px;
            border:1px solid var(--glass-border);
            z-index:9999;
            text-align:center;
        `;
        progress.innerHTML = `
            <div style="font-size:24px;">🔄</div>
            <div style="font-size:14px;color:var(--text-primary);margin-top:8px;">Update wird installiert...</div>
            <div style="font-size:11px;color:var(--text-secondary);">v${this.currentVersion} → ${this.availableUpdates[0].version}</div>
            <div style="width:300px;height:4px;background:var(--glass-border);border-radius:10px;margin-top:12px;overflow:hidden;">
                <div id="update-progress-bar" style="width:0%;height:100%;background:var(--primary);border-radius:10px;transition:width 0.3s ease;"></div>
            </div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">Backup: ${backupId ? '✅ Erstellt' : '⚠️ Übersprungen'}</div>
        `;
        document.body.appendChild(progress);
        
        let p = 0;
        const steps = [
            { progress: 10, label: 'Lade Update-Dateien...' },
            { progress: 30, label: 'Backup wird überprüft...' },
            { progress: 50, label: 'System wird aktualisiert...' },
            { progress: 70, label: 'Dateien werden ersetzt...' },
            { progress: 85, label: 'Konfiguration wird angepasst...' },
            { progress: 95, label: 'System wird geprüft...' }
        ];
        
        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
            p = step.progress;
            const bar = document.getElementById('update-progress-bar');
            if (bar) bar.style.width = p + '%';
            const label = progress.querySelector('.update-label');
            if (label) label.textContent = step.label;
        }
        
        // Update erfolgreich
        const updatedVersion = this.availableUpdates[0].version;
        this.currentVersion = updatedVersion;
        this.updateHistory.push({
            version: this.currentVersion,
            target: updatedVersion,
            date: Date.now(),
            status: 'success',
            backupId: backupId
        });
        
        this.availableUpdates = this.availableUpdates.slice(1);
        this.isUpdating = false;
        this.saveData();
        
        document.body.removeChild(progress);
        
        alert(`✅ Update auf v${updatedVersion} erfolgreich!\n\nSystem wird neu gestartet...`);
        
        // System neu starten
        setTimeout(() => {
            Kernel.reboot();
        }, 2000);
    },
    
    // ---- BACKUP ----
    createBackup() {
        const backupId = 'backup_' + Date.now().toString(36);
        
        const backup = {
            id: backupId,
            version: this.currentVersion,
            date: Date.now(),
            data: {
                settings: Storage.getAll(),
                apps: AppManager?.installedApps || [],
                version: this.currentVersion
            }
        };
        
        this.backupPoints.push(backup);
        this.saveData();
        
        EventBus.emit('update:backup-created', { id: backupId });
        return backupId;
    },
    
    restoreBackup(backupId) {
        const backup = this.backupPoints.find(b => b.id === backupId);
        if (!backup) {
            alert('❌ Backup nicht gefunden.');
            return;
        }
        
        if (!confirm(`🔄 Backup von ${new Date(backup.date).toLocaleString()} wiederherstellen?\nVersion: ${backup.version}`)) {
            return;
        }
        
        // Backup wiederherstellen
        try {
            // Einstellungen wiederherstellen
            for (const [key, value] of Object.entries(backup.data.settings)) {
                Storage.set(key, value);
            }
            
            this.currentVersion = backup.version;
            this.updateHistory.push({
                version: this.currentVersion,
                target: 'restore',
                date: Date.now(),
                status: 'success',
                backupId: backupId
            });
            
            this.saveData();
            
            alert(`✅ Backup von ${new Date(backup.date).toLocaleString()} wurde wiederhergestellt.\n\nSystem wird neu gestartet...`);
            setTimeout(() => Kernel.reboot(), 2000);
            
        } catch (error) {
            alert(`❌ Fehler beim Wiederherstellen: ${error.message}`);
        }
    },
    
    // ---- CHANGELOG ----
    showFullChangelog() {
        const content = Object.entries(this.changelog).map(([version, data]) => {
            const typeIcon = data.type === 'major' ? '🚀' : data.type === 'minor' ? '✨' : '🐛';
            return `${typeIcon} v${version} (${data.date})\n${data.changes.map(c => `  • ${c}`).join('\n')}`;
        }).join('\n\n');
        
        alert(`📝 Vollständiger Changelog\n\n${content}`);
    },
    
    // ---- EINSTELLUNGEN ----
    openSettings() {
        const channel = prompt('🔄 Update-Kanal (stable/beta/dev):', this.updateChannel);
        if (channel && ['stable', 'beta', 'dev'].includes(channel)) {
            this.updateChannel = channel;
            this.saveData();
            this.updateView();
            alert(`✅ Kanal auf "${channel}" gesetzt`);
        } else if (channel) {
            alert('⚠️ Ungültiger Kanal. Verwende: stable, beta, dev');
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
                    this.close();
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🔄 Update Center wird installiert (v2.0.0)...');
        this.loadData();
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Update Center wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return '2.0.0';
    }
};

// ---- REGISTRIEREN ----
UpdateCenter.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.UpdateCenter = UpdateCenter;

console.log('🔄 Update Center geladen (v2.0.0) – HalDo AI OS 24.6.0');
