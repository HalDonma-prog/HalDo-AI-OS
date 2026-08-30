// ================================================================
//  HALDO PRIVACY CENTER — Datenschutz & Berechtigungen
//  TEIL 28/30
// ================================================================

var HalDoPrivacy = {
    state: {
        permissions: {
            microphone: false,
            camera: false,
            notifications: false,
            location: false,
            storage: true
        },
        dataStore: {
            aiMemory: true,
            conversationHistory: true,
            usageData: false,
            locationData: false
        },
        consentGiven: false
    },

    init: function() {
        this.loadState();
        this.checkPermissions();
        console.log('[Privacy] Initialisiert');
    },

    loadState: function() {
        try {
            var saved = localStorage.getItem('haldo_privacy');
            if (saved) {
                var parsed = JSON.parse(saved);
                for (var key in parsed) {
                    if (this.state.hasOwnProperty(key)) {
                        this.state[key] = parsed[key];
                    }
                }
            }
        } catch (e) {}
    },

    saveState: function() {
        try {
            localStorage.setItem('haldo_privacy', JSON.stringify(this.state));
        } catch (e) {}
    },

    checkPermissions: function() {
        // Mikrofon
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'microphone' }).then(function(result) {
                this.state.permissions.microphone = result.state === 'granted';
                this.saveState();
            }.bind(this)).catch(function() {});

            navigator.permissions.query({ name: 'camera' }).then(function(result) {
                this.state.permissions.camera = result.state === 'granted';
                this.saveState();
            }.bind(this)).catch(function() {});

            navigator.permissions.query({ name: 'notifications' }).then(function(result) {
                this.state.permissions.notifications = result.state === 'granted';
                this.saveState();
            }.bind(this)).catch(function() {});
        }
    },

    requestPermission: function(type) {
        return new Promise(function(resolve) {
            if (type === 'microphone') {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({ audio: true })
                        .then(function(stream) {
                            stream.getTracks().forEach(function(track) { track.stop(); });
                            this.state.permissions.microphone = true;
                            this.saveState();
                            resolve(true);
                        }.bind(this))
                        .catch(function() {
                            this.state.permissions.microphone = false;
                            this.saveState();
                            resolve(false);
                        }.bind(this));
                } else {
                    resolve(false);
                }
            } else if (type === 'camera') {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({ video: true })
                        .then(function(stream) {
                            stream.getTracks().forEach(function(track) { track.stop(); });
                            this.state.permissions.camera = true;
                            this.saveState();
                            resolve(true);
                        }.bind(this))
                        .catch(function() {
                            this.state.permissions.camera = false;
                            this.saveState();
                            resolve(false);
                        }.bind(this));
                } else {
                    resolve(false);
                }
            } else if (type === 'notifications') {
                if ('Notification' in window) {
                    if (Notification.permission === 'granted') {
                        this.state.permissions.notifications = true;
                        this.saveState();
                        resolve(true);
                    } else if (Notification.permission === 'denied') {
                        this.state.permissions.notifications = false;
                        this.saveState();
                        resolve(false);
                    } else {
                        Notification.requestPermission().then(function(result) {
                            this.state.permissions.notifications = result === 'granted';
                            this.saveState();
                            resolve(result === 'granted');
                        }.bind(this));
                    }
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        }.bind(this));
    },

    clearAllData: function() {
        return new Promise(function(resolve) {
            // LocalStorage leeren (nur HalDo-Daten)
            var keys = [];
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key.startsWith('haldo_')) {
                    keys.push(key);
                }
            }
            for (var j = 0; j < keys.length; j++) {
                localStorage.removeItem(keys[j]);
            }

            // IndexedDB löschen
            if (window.indexedDB) {
                var req = indexedDB.deleteDatabase('HalDoOS');
                req.onsuccess = function() {
                    console.log('[Privacy] IndexedDB gelöscht');
                };
                req.onerror = function() {
                    console.log('[Privacy] IndexedDB Fehler');
                };
            }

            // Service Worker Cache leeren
            if (window.caches) {
                caches.keys().then(function(cacheNames) {
                    return Promise.all(
                        cacheNames.map(function(cacheName) {
                            return caches.delete(cacheName);
                        })
                    );
                }).then(function() {
                    console.log('[Privacy] Caches gelöscht');
                });
            }

            // State zurücksetzen
            this.state.dataStore = {
                aiMemory: true,
                conversationHistory: true,
                usageData: false,
                locationData: false
            };
            this.state.consentGiven = false;
            this.saveState();

            resolve(true);
        }.bind(this));
    },

    // ===== APP RENDERER =====
    render: function(body) {
        var self = this;
        var perms = this.state.permissions;
        var dataStore = this.state.dataStore;

        body.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;gap:8px;">
                <h3 style="font-size:0.9rem;">🔒 Datenschutz-Center</h3>
                
                <div style="background:rgba(255,255,255,0.04);padding:8px;border-radius:8px;">
                    <div style="font-weight:600;font-size:0.8rem;color:#8899bb;">Berechtigungen</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:4px;">
                        <div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:4px;font-size:0.7rem;">
                            <span>🎤 Mikrofon</span>
                            <span style="color:${perms.microphone ? '#44ff88' : '#ff6644'};">${perms.microphone ? '✅' : '❌'}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:4px;font-size:0.7rem;">
                            <span>📷 Kamera</span>
                            <span style="color:${perms.camera ? '#44ff88' : '#ff6644'};">${perms.camera ? '✅' : '❌'}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:4px;font-size:0.7rem;">
                            <span>🔔 Benachrichtigungen</span>
                            <span style="color:${perms.notifications ? '#44ff88' : '#ff6644'};">${perms.notifications ? '✅' : '❌'}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:4px;font-size:0.7rem;">
                            <span>💾 Speicher</span>
                            <span style="color:${perms.storage ? '#44ff88' : '#ff6644'};">${perms.storage ? '✅' : '❌'}</span>
                        </div>
                    </div>
                    <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;">
                        <button id="privacy-request-mic" style="padding:4px 10px;font-size:0.6rem;background:rgba(255,255,255,0.06);border:none;border-radius:4px;color:#fff;cursor:pointer;">🎤 Mikrofon anfordern</button>
                        <button id="privacy-request-cam" style="padding:4px 10px;font-size:0.6rem;background:rgba(255,255,255,0.06);border:none;border-radius:4px;color:#fff;cursor:pointer;">📷 Kamera anfordern</button>
                    </div>
                </div>

                <div style="background:rgba(255,255,255,0.04);padding:8px;border-radius:8px;">
                    <div style="font-weight:600;font-size:0.8rem;color:#8899bb;">📊 Daten speichern</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:4px;">
                        <div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:4px;font-size:0.7rem;">
                            <span>🧠 AI Memory</span>
                            <span style="color:${dataStore.aiMemory ? '#44ff88' : '#ff6644'};">${dataStore.aiMemory ? '✅' : '❌'}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:4px;font-size:0.7rem;">
                            <span>💬 Gesprächsverlauf</span>
                            <span style="color:${dataStore.conversationHistory ? '#44ff88' : '#ff6644'};">${dataStore.conversationHistory ? '✅' : '❌'}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:4px;font-size:0.7rem;">
                            <span>📊 Nutzungsdaten</span>
                            <span style="color:${dataStore.usageData ? '#44ff88' : '#ff6644'};">${dataStore.usageData ? '✅' : '❌'}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:4px;font-size:0.7rem;">
                            <span>📍 Standort</span>
                            <span style="color:${dataStore.locationData ? '#44ff88' : '#ff6644'};">${dataStore.locationData ? '✅' : '❌'}</span>
                        </div>
                    </div>
                </div>

                <div style="display:flex;gap:6px;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;">
                    <button id="privacy-save" style="flex:1;padding:6px 12px;font-size:0.75rem;">💾 Einstellungen speichern</button>
                    <button id="privacy-clear" style="flex:1;padding:6px 12px;font-size:0.75rem;background:#ff4444;">🗑️ Alle Daten löschen</button>
                </div>
                <div style="font-size:0.55rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;text-align:center;">
                    🔒 Deine Daten sind lokal gespeichert. Keine Daten werden ohne deine Zustimmung geteilt.
                </div>
            </div>
        `;

        // ===== EVENT BINDINGS =====
        body.querySelector('#privacy-request-mic').addEventListener('click', function() {
            self.requestPermission('microphone').then(function(result) {
                if (window.HalDoNotify) {
                    window.HalDoNotify(result ? '✅ Mikrofon-Zugriff gewährt' : '❌ Mikrofon-Zugriff verweigert',
                        result ? 'success' : 'error');
                }
                // Re-render
                var win = window.HalDoState.windows.find(function(w) { return w.appId === 'privacy'; });
                if (win && win.element) {
                    var b = win.element.querySelector('.window-body');
                    self.render(b);
                }
            });
        });

        body.querySelector('#privacy-request-cam').addEventListener('click', function() {
            self.requestPermission('camera').then(function(result) {
                if (window.HalDoNotify) {
                    window.HalDoNotify(result ? '✅ Kamera-Zugriff gewährt' : '❌ Kamera-Zugriff verweigert',
                        result ? 'success' : 'error');
                }
                var win = window.HalDoState.windows.find(function(w) { return w.appId === 'privacy'; });
                if (win && win.element) {
                    var b = win.element.querySelector('.window-body');
                    self.render(b);
                }
            });
        });

        body.querySelector('#privacy-save').addEventListener('click', function() {
            // Toggle Zustände
            var items = body.querySelectorAll('[style*="display:flex;justify-content:space-between;"]');
            // Einfacher: State speichern
            self.saveState();
            if (window.HalDoNotify) window.HalDoNotify('✅ Datenschutz-Einstellungen gespeichert', 'success');
        });

        body.querySelector('#privacy-clear').addEventListener('click', function() {
            if (confirm('⚠️ Alle gespeicherten Daten wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
                if (confirm('⚠️ Bist du sicher? Alle Daten, Notizen, Kontakte, E-Mails und Chats werden gelöscht!')) {
                    self.clearAllData().then(function() {
                        if (window.HalDoNotify) window.HalDoNotify('🗑️ Alle Daten gelöscht', 'warning');
                        // Seite neu laden
                        setTimeout(function() {
                            location.reload();
                        }, 1500);
                    });
                }
            }
        });
    }
};
