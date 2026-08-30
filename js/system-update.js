// ================================================================
//  HALDO SYSTEM UPDATE — Update & Recovery
//  TEIL 17/30
// ================================================================

var HalDoSystemUpdate = {
    state: {
        version: '24.0.0',
        lastUpdate: null,
        updates: [],
        backups: [],
        recoveryPoints: []
    },

    init: function() {
        var saved = localStorage.getItem('haldo_system');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {}
        }
        console.log('[System] Version ' + this.state.version);
    },

    save: function() {
        try {
            localStorage.setItem('haldo_system', JSON.stringify(this.state));
        } catch (e) {}
    },

    // ===== UPDATE SYSTEM =====
    checkForUpdates: function() {
        return new Promise(function(resolve) {
            // Simuliere Update-Check
            setTimeout(function() {
                var hasUpdate = Math.random() > 0.4;
                if (hasUpdate) {
                    var newVersion = '24.1.0';
                    this.state.updates.push({
                        version: newVersion,
                        date: new Date().toISOString(),
                        status: 'available',
                        description: 'Neue Funktionen: Verbesserte AI, mehr Sprachen, Bugfixes'
                    });
                    this.save();
                    resolve({ available: true, version: newVersion });
                } else {
                    resolve({ available: false });
                }
            }.bind(this), 1500);
        }.bind(this));
    },

    installUpdate: function() {
        return new Promise(function(resolve) {
            // Backup erstellen
            this.createBackup().then(function() {
                // Simuliere Update
                setTimeout(function() {
                    var update = this.state.updates[this.state.updates.length - 1];
                    if (update) {
                        update.status = 'installed';
                        this.state.version = update.version;
                        this.state.lastUpdate = new Date().toISOString();
                        this.save();
                        resolve({ success: true, version: update.version });
                    } else {
                        resolve({ success: false, error: 'Kein Update verfügbar' });
                    }
                }.bind(this), 2000);
            }.bind(this));
        }.bind(this));
    },

    rollback: function() {
        return new Promise(function(resolve) {
            setTimeout(function() {
                var oldVersion = '24.0.0';
                this.state.version = oldVersion;
                this.save();
                resolve({ success: true, version: oldVersion });
            }.bind(this), 1500);
        }.bind(this));
    },

    // ===== BACKUP SYSTEM =====
    createBackup: function() {
        return new Promise(function(resolve) {
            var backup = {
                id: 'backup_' + Date.now(),
                date: new Date().toISOString(),
                version: this.state.version,
                data: {
                    settings: window.HalDoState ? window.HalDoState.settings : {},
                    notes: window.HalDoState ? window.HalDoState.notes : [],
                    contacts: window.HalDoContacts ? window.HalDoContacts.state.contacts : [],
                    mail: window.HalDoMail ? window.HalDoMail.state : { inbox: [], sent: [] },
                    chat: window.HalDoChat ? window.HalDoChat.state : { contacts: [], messages: {} }
                }
            };
            this.state.backups.push(backup);
            this.save();
            resolve(backup);
        }.bind(this));
    },

    restoreBackup: function(backupId) {
        return new Promise(function(resolve) {
            var backup = null;
            for (var i = 0; i < this.state.backups.length; i++) {
                if (this.state.backups[i].id === backupId) {
                    backup = this.state.backups[i];
                    break;
                }
            }
            if (!backup) {
                resolve({ success: false, error: 'Backup nicht gefunden' });
                return;
            }

            // Daten wiederherstellen
            var data = backup.data;
            if (data.settings && window.HalDoState) {
                for (var key in data.settings) {
                    window.HalDoState.settings[key] = data.settings[key];
                }
                localStorage.setItem('haldo_settings', JSON.stringify(window.HalDoState.settings));
            }
            if (data.notes && window.HalDoState) {
                window.HalDoState.notes = data.notes;
                localStorage.setItem('haldo_notes', JSON.stringify(data.notes));
            }
            if (data.contacts && window.HalDoContacts) {
                window.HalDoContacts.state.contacts = data.contacts;
                window.HalDoContacts.save();
            }
            if (data.mail && window.HalDoMail) {
                window.HalDoMail.state = data.mail;
                window.HalDoMail.save();
            }
            if (data.chat && window.HalDoChat) {
                window.HalDoChat.state = data.chat;
                window.HalDoChat.save();
            }

            resolve({ success: true });
        }.bind(this));
    },

    // ===== RECOVERY =====
    createRecoveryPoint: function() {
        var point = {
            id: 'recovery_' + Date.now(),
            date: new Date().toISOString(),
            description: 'System-Zustand gesichert'
        };
        this.state.recoveryPoints.push(point);
        this.save();
        return point;
    },

    // ===== APP RENDERER =====
    render: function(body) {
        var self = this;
        var updates = this.state.updates;
        var backups = this.state.backups;
        var recoveryPoints = this.state.recoveryPoints;

        var html = `
            <div style="display:flex;flex-direction:column;height:100%;gap:8px;">
                <h3 style="font-size:0.9rem;margin-bottom:4px;">🔄 System Update</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.75rem;">
                    <div style="background:rgba(255,255,255,0.04);padding:8px;border-radius:8px;">
                        <div style="color:#8899bb;">Version</div>
                        <div style="font-weight:600;">${this.state.version}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.04);padding:8px;border-radius:8px;">
                        <div style="color:#8899bb;">Letztes Update</div>
                        <div style="font-weight:600;">${this.state.lastUpdate ? new Date(this.state.lastUpdate).toLocaleDateString() : 'Nie'}</div>
                    </div>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button id="sys-check-update" style="flex:1;padding:6px 12px;font-size:0.8rem;">🔍 Prüfen</button>
                    <button id="sys-install-update" style="flex:1;padding:6px 12px;font-size:0.8rem;background:#44ff88;color:#000;">📦 Installieren</button>
                    <button id="sys-rollback" style="flex:1;padding:6px 12px;font-size:0.8rem;background:#ff8844;">⏪ Rollback</button>
                </div>
                <div style="border-top:1px solid rgba(255,255,255,0.04);padding-top:8px;margin-top:4px;">
                    <h4 style="font-size:0.8rem;color:#8899bb;">💾 Backups (${backups.length})</h4>
                    <div style="max-height:120px;overflow-y:auto;font-size:0.7rem;">
        `;

        if (backups.length === 0) {
            html += '<div style="color:#8899bb;padding:4px 0;">Keine Backups</div>';
        } else {
            for (var i = backups.length - 1; i >= 0; i--) {
                var b = backups[i];
                html += `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:6px;margin:2px 0;">
                        <span>${new Date(b.date).toLocaleString()}</span>
                        <div>
                            <button class="backup-restore" data-id="${b.id}" style="padding:2px 10px;font-size:0.6rem;background:#44ff88;color:#000;border:none;border-radius:4px;cursor:pointer;">🔄 Wiederherstellen</button>
                        </div>
                    </div>
                `;
            }
        }

        html += `
                    </div>
                </div>
                <div style="font-size:0.6rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;display:flex;justify-content:space-between;">
                    <span>🔄 ${updates.length} Updates</span>
                    <span>💾 ${backups.length} Backups</span>
                </div>
            </div>
        `;

        body.innerHTML = html;

        // ===== EVENT BINDINGS =====

        body.querySelector('#sys-check-update').addEventListener('click', function() {
            if (window.HalDoNotify) window.HalDoNotify('🔍 Prüfe auf Updates ...');
            self.checkForUpdates().then(function(result) {
                if (result.available) {
                    if (window.HalDoNotify) window.HalDoNotify('✅ Update ' + result.version + ' verfügbar!',
                        'success');
                } else {
                    if (window.HalDoNotify) window.HalDoNotify('✅ Keine Updates verfügbar', 'info');
                }
            });
        });

        body.querySelector('#sys-install-update').addEventListener('click', function() {
            if (window.HalDoNotify) window.HalDoNotify('📦 Installiere Update ...');
            self.installUpdate().then(function(result) {
                if (result.success) {
                    if (window.HalDoNotify) window.HalDoNotify('✅ Update auf ' + result.version + ' erfolgreich!',
                        'success');
                    // Re-render
                    var win = window.HalDoState.windows.find(function(w) { return w.appId === 'update'; });
                    if (win && win.element) {
                        var b = win.element.querySelector('.window-body');
                        self.render(b);
                    }
                } else {
                    if (window.HalDoNotify) window.HalDoNotify('❌ Update fehlgeschlagen: ' + result.error,
                        'error');
                }
            });
        });

        body.querySelector('#sys-rollback').addEventListener('click', function() {
            if (confirm('Rollback zu vorheriger Version durchführen?')) {
                if (window.HalDoNotify) window.HalDoNotify('⏪ Führe Rollback durch ...');
                self.rollback().then(function(result) {
                    if (result.success) {
                        if (window.HalDoNotify) window.HalDoNotify('✅ Rollback zu ' + result.version +
                            ' erfolgreich!', 'success');
                        var win = window.HalDoState.windows.find(function(w) { return w.appId ===
                            'update'; });
                        if (win && win.element) {
                            var b = win.element.querySelector('.window-body');
                            self.render(b);
                        }
                    }
                });
            }
        });

        // Backup Restore
        body.querySelectorAll('.backup-restore').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = this.dataset.id;
                if (confirm('Backup vom ' + new Date(parseInt(id.split('_')[1])).toLocaleString() +
                        ' wiederherstellen?')) {
                    if (window.HalDoNotify) window.HalDoNotify('🔄 Stelle Backup wieder her ...');
                    self.restoreBackup(id).then(function(result) {
                        if (result.success) {
                            if (window.HalDoNotify) window.HalDoNotify(
                                '✅ Backup erfolgreich wiederhergestellt!', 'success');
                        } else {
                            if (window.HalDoNotify) window.HalDoNotify('❌ Wiederherstellung fehlgeschlagen',
                                'error');
                        }
                    });
                }
            });
        });
    }
};
