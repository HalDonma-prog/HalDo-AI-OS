// ================================================================
//  HALDO FINAL INTEGRATION — Alle Systeme verbinden
//  TEIL 20/30
// ================================================================

var HalDoFinalIntegration = {
    init: function() {
        console.log('[Final] Starte Integration aller Systeme...');

        // ===== 1. ALLE 84 APPS GENERIEREN =====
        if (window.HalDoAppGenerator) {
            var appCount = window.HalDoAppGenerator.generateAll();
            console.log('[Final] ' + appCount + ' Apps generiert');
        }

        // ===== 2. MAIL INIT =====
        if (window.HalDoMail) {
            window.HalDoMail.init();
            // Mail App registrieren
            window.HalDoAppLoader.register('email', {
                title: 'HalDo Mail',
                icon: '✉️',
                render: function(body) {
                    window.HalDoMail.render(body);
                }
            });
            console.log('[Final] Mail initialisiert');
        }

        // ===== 3. CHAT INIT =====
        if (window.HalDoChat) {
            window.HalDoChat.init();
            window.HalDoAppLoader.register('messages', {
                title: 'HalDo Chat',
                icon: '💬',
                render: function(body) {
                    window.HalDoChat.render(body);
                }
            });
            console.log('[Final] Chat initialisiert');
        }

        // ===== 4. CONTACTS INIT =====
        if (window.HalDoContacts) {
            window.HalDoContacts.init();
            window.HalDoAppLoader.register('contacts', {
                title: 'Kontakte',
                icon: '👤',
                render: function(body) {
                    window.HalDoContacts.render(body);
                }
            });
            console.log('[Final] Contacts initialisiert');
        }

        // ===== 5. SYSTEM UPDATE INIT =====
        if (window.HalDoSystemUpdate) {
            window.HalDoSystemUpdate.init();
            window.HalDoAppLoader.register('update', {
                title: 'Update Center',
                icon: '🔄',
                render: function(body) {
                    window.HalDoSystemUpdate.render(body);
                }
            });
            console.log('[Final] Update System initialisiert');
        }

        // ===== 6. VOICE INIT =====
        if (window.HalDoVoice) {
            window.HalDoVoice.init();
            console.log('[Final] Voice initialisiert');
        }

        // ===== 7. AI INTEGRATION =====
        if (window.HalDoAIIntegration) {
            window.HalDoAIIntegration.init();
            console.log('[Final] AI Integration initialisiert');
        }

        // ===== 8. LOGO FIX =====
        if (window.HalDoLogo) {
            window.HalDoLogo.init();
            console.log('[Final] Logo Fix initialisiert');
        }

        // ===== 9. MENU =====
        if (window.HalDoMenu) {
            window.HalDoMenu.init();
            console.log('[Final] Menu initialisiert');
        }

        // ===== 10. COSMIC ENHANCED =====
        if (window.HalDoCosmicEnhanced) {
            // Wird von system.js gestartet
            console.log('[Final] Cosmic Enhanced bereit');
        }

        // ===== 11. ALLE FEHLENDEN APPS REGISTRIEREN =====
        this.registerMissingApps();

        // ===== 12. SYSTEM BEREIT =====
        console.log('[Final] 🚀 HalDo OS 24 ist vollständig integriert!');
        if (window.HalDoNotify) {
            window.HalDoNotify('🚀 HalDo OS 24 — Alle Systeme verbunden!', 'success');
        }

        // ===== 13. GLOBALE API =====
        window.HalDo = {
            launchApp: window.HalDoWindow ? HalDoWindow.launch : function() {},
            notify: window.HalDoNotify || function() {},
            kernel: window.HalDoKernel || {},
            state: window.HalDoState || {},
            ai: window.HalDoAI || {},
            voice: window.HalDoVoice || {},
            mail: window.HalDoMail || {},
            chat: window.HalDoChat || {},
            contacts: window.HalDoContacts || {},
            update: window.HalDoSystemUpdate || {},
            window: window.HalDoWindow || {},
            appLoader: window.HalDoAppLoader || {},
            cosmic: window.HalDoCosmicEnhanced || {},
            menu: window.HalDoMenu || {}
        };

        console.log('[Final] 🌌 HalDo AI OS 24 — Professional Ultimate Edition');
        console.log('[Final] 📱 ' + Object.keys(window.HalDoState.apps).length + ' Apps verfügbar');
        console.log('[Final] 💡 HalDo.launchApp("appworld") für alle Apps');
        console.log('[Final] ☀️ Klicke auf die Sonne für HalDo AI');
    },

    registerMissingApps: function() {
        // ===== APP WORLD =====
        if (!window.HalDoState.apps['appworld']) {
            window.HalDoAppLoader.register('appworld', {
                title: 'App World 24',
                icon: '📱',
                render: function(body) {
                    var apps = [];
                    for (var key in window.HalDoState.apps) {
                        if (key !== 'appworld') {
                            apps.push({ id: key, title: window.HalDoState.apps[key].title, icon: window
                                    .HalDoState.apps[key].icon });
                        }
                    }
                    var html = '<h3 style="margin-bottom:6px;font-size:0.85rem;">📱 Alle ' + apps.length +
                        ' Apps</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:6px;max-height:280px;overflow-y:auto;">';
                    for (var i = 0; i < apps.length; i++) {
                        var a = apps[i];
                        html += '<div style="background:rgba(255,255,255,0.04);padding:10px;border-radius:8px;text-align:center;cursor:pointer;" onclick="HalDoWindow.launch(\'' +
                            a.id + '\')"><div style="font-size:1.5rem;">' + a.icon +
                            '</div><div style="font-size:0.6rem;margin-top:2px;">' + a.title +
                            '</div></div>';
                    }
                    html +=
                        '</div><div style="font-size:0.55rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;margin-top:4px;display:flex;justify-content:space-between;"><span>📱 ' +
                        apps.length + ' Apps</span><span>HalDo OS ' + (window.HalDoKernel ? window.HalDoKernel
                            .version : '24.0.0') + '</span></div>';
                    body.innerHTML = html;
                }
            });
        }

        // ===== SEARCH =====
        if (!window.HalDoState.apps['search']) {
            window.HalDoAppLoader.register('search', {
                title: 'Globale Suche',
                icon: '🔍',
                render: function(body) {
                    body.innerHTML = `
                        <div style="display:flex;flex-direction:column;height:100%;gap:8px;">
                            <h3 style="font-size:0.9rem;">🔍 Globale Suche</h3>
                            <input type="text" id="search-input" placeholder="🔍 Suche nach Apps, Dateien, Kontakten ..." style="flex:1;" />
                            <div id="search-results" style="flex:1;overflow-y:auto;max-height:200px;font-size:0.8rem;">
                                <div style="color:#8899bb;text-align:center;padding:20px;">Gib einen Suchbegriff ein</div>
                            </div>
                            <div style="font-size:0.55rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;">
                                🔍 Suche in Apps, Kontakten, Notizen, E-Mails
                            </div>
                        </div>
                    `;

                    var input = body.querySelector('#search-input');
                    var results = body.querySelector('#search-results');

                    input.addEventListener('input', function() {
                        var query = this.value.toLowerCase().trim();
                        if (!query) {
                            results.innerHTML =
                                '<div style="color:#8899bb;text-align:center;padding:20px;">Gib einen Suchbegriff ein</div>';
                            return;
                        }

                        var html = '';

                        // Apps durchsuchen
                        var apps = [];
                        for (var key in window.HalDoState.apps) {
                            if (key !== 'appworld' && key !== 'search') {
                                var app = window.HalDoState.apps[key];
                                if (app.title.toLowerCase().includes(query) || key.includes(query)) {
                                    apps.push(app);
                                }
                            }
                        }
                        if (apps.length > 0) {
                            html += '<div style="font-weight:600;color:#8899bb;margin-top:4px;">📱 Apps</div>';
                            for (var i = 0; i < apps.length; i++) {
                                html +=
                                    '<div style="padding:4px 8px;cursor:pointer;background:rgba(255,255,255,0.03);border-radius:4px;margin:2px 0;" onclick="HalDoWindow.launch(\'' +
                                    apps[i].id + '\')">' + apps[i].icon + ' ' + apps[i].title + '</div>';
                            }
                        }

                        // Kontakte durchsuchen
                        if (window.HalDoContacts) {
                            var contacts = window.HalDoContacts.search(query);
                            if (contacts.length > 0) {
                                html += '<div style="font-weight:600;color:#8899bb;margin-top:4px;">👤 Kontakte</div>';
                                for (var i = 0; i < contacts.length; i++) {
                                    html +=
                                        '<div style="padding:4px 8px;cursor:pointer;background:rgba(255,255,255,0.03);border-radius:4px;margin:2px 0;" onclick="HalDoContacts.openContact(\'' +
                                        contacts[i].id + '\')">' + contacts[i].avatar + ' ' + contacts[i]
                                        .name + '</div>';
                                }
                            }
                        }

                        // Notizen durchsuchen
                        if (window.HalDoState && window.HalDoState.notes) {
                            var notes = window.HalDoState.notes;
                            var foundNotes = [];
                            for (var i = 0; i < notes.length; i++) {
                                if (notes[i].toLowerCase().includes(query)) {
                                    foundNotes.push(notes[i]);
                                }
                            }
                            if (foundNotes.length > 0) {
                                html += '<div style="font-weight:600;color:#8899bb;margin-top:4px;">📝 Notizen</div>';
                                for (var i = 0; i < foundNotes.length; i++) {
                                    html +=
                                        '<div style="padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:4px;margin:2px 0;">📝 ' +
                                        foundNotes[i] + '</div>';
                                }
                            }
                        }

                        if (!html) {
                            html =
                                '<div style="color:#8899bb;text-align:center;padding:20px;">🔍 Keine Ergebnisse für "' +
                                query + '"</div>';
                        }

                        results.innerHTML = html;
                    });
                }
            });
        }

        // ===== TERMINAL (falls nicht vorhanden) =====
        if (!window.HalDoState.apps['terminal']) {
            window.HalDoAppLoader.register('terminal', {
                title: 'Terminal',
                icon: '⌨️',
                render: function(body) {
                    body.innerHTML =
                        '<div style="background:#050510;border-radius:8px;padding:8px;font-family:\'Courier New\',monospace;font-size:0.7rem;min-height:60px;max-height:200px;overflow-y:auto;" id="term-output"><div style="color:#44ff88;">$ HalDo OS ' +
                        (window.HalDoKernel ? window.HalDoKernel.version : '24.0.0') +
                        '</div><div style="color:#44ff88;">$ ready ></div></div><div style="display:flex;gap:6px;margin-top:6px;"><input type="text" id="term-input" placeholder="$ Befehl ..." style="flex:1;font-family:\'Courier New\',monospace;font-size:0.7rem;" /><button id="term-exec" style="padding:4px 12px;">⏎</button></div>';

                    var output = body.querySelector('#term-output');
                    var input = body.querySelector('#term-input');

                    function exec(cmd) {
                        var line = document.createElement('div');
                        line.style.color = '#44ff88';
                        line.textContent = '$ ' + cmd;
                        output.appendChild(line);
                        var resp = '';
                        var parts = cmd.trim().split(' ');
                        var main = parts[0].toLowerCase();

                        if (main === 'help') resp =
                            'help, version, apps, clear, echo, date, whoami, uptime, sysinfo, ezidi, planets, sun, mail, chat, contacts';
                        else if (main === 'version') resp = 'HalDo OS ' + (window.HalDoKernel ? window
                            .HalDoKernel.version : '24.0.0');
                        else if (main === 'apps') resp = '📱 ' + Object.keys(window.HalDoState.apps).length +
                            ' Apps';
                        else if (main === 'clear') { output.innerHTML = ''; return; } else if (main === 'echo')
                            resp = parts.slice(1).join(' ') || '';
                        else if (main === 'date') resp = new Date().toLocaleString();
                        else if (main === 'whoami') resp = 'haldo@cosmic';
                        else if (main === 'uptime') resp = '⏱ ' + (window.HalDoKernel ? window.HalDoKernel
                            .getUptime() : '0s');
                        else if (main === 'sysinfo') resp =
                            'OS: HalDo OS ' + (window.HalDoKernel ? window.HalDoKernel.version : '24.0.0') +
                            '\nKernel: ' + (window.HalDoKernel ? window.HalDoKernel.kernel : '5.3.0') +
                            '\nApps: ' + Object.keys(window.HalDoState.apps).length;
                        else if (main === 'ezidi') resp =
                            '🟡 Êzîdî ist eine der ältesten monotheistischen Religionen. Sprache: Kurmanji.';
                        else if (main === 'planets') resp =
                            '🪐 12 Planeten: Merkur, Venus, Erde, Mars, Jupiter, Saturn, Uranus, Neptun, Pluto, HalDo-1, HalDo-2, HalDo-3. Erde = Stunde, Venus = Minute, Merkur = Sekunde.';
                        else if (main === 'sun') resp =
                            '☀️ Die Sonne ist ein gelber Zwergstern. Sie enthält das HalDo-Logo. Klicke auf die Sonne für HalDo AI!';
                        else if (main === 'mail') resp = '✉️ ' + (window.HalDoMail ? window.HalDoMail.state
                            .inbox.length : 0) + ' E-Mails im Posteingang';
                        else if (main === 'chat') resp = '💬 ' + (window.HalDoChat ? window.HalDoChat.state
                            .contacts.length : 0) + ' Kontakte im Chat';
                        else if (main === 'contacts') resp = '👤 ' + (window.HalDoContacts ? window
                            .HalDoContacts.state.contacts.length : 0) + ' Kontakte';
                        else if (cmd === '') return;
                        else resp = '❌ Unbekannt: "' + cmd + '". Tipp: help';

                        var rl = document.createElement('div');
                        rl.style.color = '#8899bb';
                        rl.textContent = resp;
                        output.appendChild(rl);
                        output.scrollTop = output.scrollHeight;
                    }

                    body.querySelector('#term-exec').addEventListener('click', function() {
                        var v = input.value.trim();
                        if (v) exec(v);
                        input.value = '';
                    });
                    input.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter') body.querySelector('#term-exec').click();
                    });
                }
            });
        }

        console.log('[Final] Fehlende Apps registriert');
    }
};
