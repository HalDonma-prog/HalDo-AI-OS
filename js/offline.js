// ================================================================
//  HALDO OFFLINE MANAGER
//  TEIL 27/30
// ================================================================

var HalDoOffline = {
    isOnline: navigator.onLine,
    pendingActions: [],
    syncInProgress: false,

    init: function() {
        this.isOnline = navigator.onLine;
        this.loadPendingActions();
        this.setupListeners();
        console.log('[Offline] Initialisiert. Online:', this.isOnline);
    },

    setupListeners: function() {
        var self = this;

        // Online/Offline Events
        window.addEventListener('online', function() {
            self.isOnline = true;
            self.onOnline();
        });

        window.addEventListener('offline', function() {
            self.isOnline = false;
            self.onOffline();
        });

        // Bei Seitenwechsel prüfen
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden && navigator.onLine !== self.isOnline) {
                self.isOnline = navigator.onLine;
                if (self.isOnline) {
                    self.onOnline();
                } else {
                    self.onOffline();
                }
            }
        });
    },

    onOnline: function() {
        console.log('[Offline] Online geworden');
        if (window.HalDoNotify) {
            window.HalDoNotify('🌐 Online — Verbindung wiederhergestellt', 'success');
        }
        // Ausstehende Aktionen synchronisieren
        this.syncPendingActions();
    },

    onOffline: function() {
        console.log('[Offline] Offline gegangen');
        if (window.HalDoNotify) {
            window.HalDoNotify('📡 Offline — Einige Funktionen sind eingeschränkt', 'warning');
        }
    },

    // ===== AUSSTEHENDE AKTIONEN =====
    loadPendingActions: function() {
        try {
            var data = localStorage.getItem('haldo_pending_actions');
            this.pendingActions = data ? JSON.parse(data) : [];
        } catch (e) {
            this.pendingActions = [];
        }
    },

    savePendingActions: function() {
        try {
            localStorage.setItem('haldo_pending_actions', JSON.stringify(this.pendingActions));
        } catch (e) {}
    },

    addPendingAction: function(action) {
        action.id = 'action_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        action.timestamp = new Date().toISOString();
        this.pendingActions.push(action);
        this.savePendingActions();
        console.log('[Offline] Aktion gespeichert:', action);

        // Wenn online, sofort synchronisieren
        if (this.isOnline) {
            this.syncPendingActions();
        }

        return action.id;
    },

    syncPendingActions: function() {
        if (this.syncInProgress) return;
        if (this.pendingActions.length === 0) return;
        if (!this.isOnline) return;

        this.syncInProgress = true;
        console.log('[Offline] Synchronisiere ' + this.pendingActions.length + ' Aktionen ...');

        var self = this;
        var actions = this.pendingActions.slice();
        var completed = [];

        // Jede Aktion nacheinander ausführen
        function processNext() {
            if (actions.length === 0) {
                // Alle Aktionen verarbeitet
                self.pendingActions = self.pendingActions.filter(function(a) {
                    return completed.indexOf(a.id) === -1;
                });
                self.savePendingActions();
                self.syncInProgress = false;
                console.log('[Offline] Synchronisation abgeschlossen. ' + completed.length + ' Aktionen verarbeitet.');
                if (window.HalDoNotify && completed.length > 0) {
                    window.HalDoNotify('✅ ' + completed.length + ' Offline-Aktionen synchronisiert', 'success');
                }
                return;
            }

            var action = actions.shift();
            self.executeAction(action).then(function(success) {
                if (success) {
                    completed.push(action.id);
                }
                processNext();
            }).catch(function() {
                // Bei Fehler überspringen
                processNext();
            });
        }

        processNext();
    },

    executeAction: function(action) {
        return new Promise(function(resolve) {
            console.log('[Offline] Führe Aktion aus:', action);

            // Hier kommen die verschiedenen Aktionstypen
            switch (action.type) {
                case 'send_mail':
                    // E-Mail senden (wenn Online)
                    if (window.HalDoMail && action.data) {
                        try {
                            var mail = window.HalDoMail.send(
                                action.data.to,
                                action.data.subject,
                                action.data.body
                            );
                            resolve(true);
                        } catch (e) {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                    break;

                case 'send_chat':
                    // Chat-Nachricht senden
                    if (window.HalDoChat && action.data) {
                        try {
                            window.HalDoChat.sendMessage(
                                action.data.contactId,
                                action.data.text
                            );
                            resolve(true);
                        } catch (e) {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                    break;

                case 'add_contact':
                    // Kontakt hinzufügen
                    if (window.HalDoContacts && action.data) {
                        try {
                            window.HalDoContacts.add(
                                action.data.name,
                                action.data.email,
                                action.data.phone,
                                action.data.group,
                                action.data.avatar,
                                action.data.notes
                            );
                            resolve(true);
                        } catch (e) {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                    break;

                case 'add_note':
                    // Notiz hinzufügen
                    if (window.HalDoState && action.data) {
                        try {
                            window.HalDoState.notes.push(action.data.text);
                            localStorage.setItem('haldo_notes', JSON.stringify(window.HalDoState.notes));
                            resolve(true);
                        } catch (e) {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                    break;

                default:
                    resolve(false);
            }
        });
    },

    // ===== HILFSFUNKTIONEN =====
    isOnline: function() {
        return this.isOnline;
    },

    getPendingCount: function() {
        return this.pendingActions.length;
    },

    clearPending: function() {
        this.pendingActions = [];
        this.savePendingActions();
        console.log('[Offline] Ausstehende Aktionen gelöscht');
    },

    // ===== APP RENDERER =====
    render: function(body) {
        var self = this;
        var pending = this.pendingActions;

        body.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;gap:8px;">
                <h3 style="font-size:0.9rem;">📡 Offline-Manager</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.75rem;">
                    <div style="background:rgba(255,255,255,0.04);padding:8px;border-radius:8px;">
                        <div style="color:#8899bb;">Status</div>
                        <div style="font-weight:600;color:${self.isOnline ? '#44ff88' : '#ff6644'};">
                            ${self.isOnline ? '🟢 Online' : '🔴 Offline'}
                        </div>
                    </div>
                    <div style="background:rgba(255,255,255,0.04);padding:8px;border-radius:8px;">
                        <div style="color:#8899bb;">Ausstehende Aktionen</div>
                        <div style="font-weight:600;">${pending.length}</div>
                    </div>
                </div>
                <div style="flex:1;overflow-y:auto;max-height:180px;font-size:0.7rem;">
                    <div style="color:#8899bb;font-weight:600;margin-bottom:4px;">📋 Ausstehende Aktionen</div>
                    ${pending.length === 0 ? '<div style="color:#8899bb;padding:8px;text-align:center;">✅ Keine ausstehenden Aktionen</div>' :
                    pending.map(function(a, i) {
                        return '<div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:4px;margin:2px 0;">' +
                            '<span>' + a.type.replace('_', ' ') + '</span>' +
                            '<span style="color:#8899bb;font-size:0.6rem;">' + new Date(a.timestamp).toLocaleString() + '</span>' +
                            '</div>';
                    }).join('')}
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;">
                    <button id="offline-sync" style="flex:1;padding:6px 12px;font-size:0.75rem;">🔄 Jetzt synchronisieren</button>
                    <button id="offline-clear" style="flex:1;padding:6px 12px;font-size:0.75rem;background:#ff4444;">🗑️ Alle löschen</button>
                </div>
                <div style="font-size:0.55rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;text-align:center;">
                    💡 Offline-Aktionen werden bei Verbindung automatisch synchronisiert
                </div>
            </div>
        `;

        body.querySelector('#offline-sync').addEventListener('click', function() {
            if (self.isOnline) {
                self.syncPendingActions();
            } else {
                if (window.HalDoNotify) window.HalDoNotify('❌ Keine Internetverbindung', 'error');
            }
        });

        body.querySelector('#offline-clear').addEventListener('click', function() {
            if (confirm('Alle ausstehenden Aktionen wirklich löschen?')) {
                self.clearPending();
                if (window.HalDoNotify) window.HalDoNotify('🗑️ Alle Aktionen gelöscht');
                // Re-render
                var win = window.HalDoState.windows.find(function(w) { return w.appId === 'offline'; });
                if (win && win.element) {
                    var b = win.element.querySelector('.window-body');
                    self.render(b);
                }
            }
        });
    }
};
