// ================================================================
//  HALDO AI OS 24 – APPS.JS (ALLE 50+ APPS VON A BIS Z)
//  Version: 24.6.0
//  Build: 2026-08-31
// ================================================================

// ============================================================
//  APP REGISTRATION – HALDO AI
// ============================================================
registerApp('ai', {
    title: 'HalDo AI',
    icon: '🤖',
    category: 'core',
    description: 'Intelligenter KI-Assistent',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:6px;padding:4px;">' +
            '<div style="display:flex;align-items:center;gap:8px;padding:4px 10px;background:rgba(0,212,255,0.05);border-radius:8px;">' +
            '<div style="font-size:1.3rem;">🧠</div>' +
            '<div><div style="font-weight:700;font-size:0.8rem;">HalDo AI</div>' +
            '<div style="font-size:0.55rem;color:#8899bb;" id="ai-state">● bereit</div></div>' +
            '<div style="margin-left:auto;display:flex;gap:4px;">' +
            '<button id="ai-voice-btn" style="background:none;border:none;color:#8899bb;font-size:1.1rem;cursor:pointer;padding:4px;" title="Sprachsteuerung">🎤</button>' +
            '<button id="ai-clear-btn" style="background:none;border:none;color:#8899bb;font-size:0.8rem;cursor:pointer;padding:4px;" title="Chat löschen">🧹</button></div></div>' +
            '<div style="flex:1;overflow-y:auto;background:rgba(0,0,0,0.15);border-radius:8px;padding:8px;max-height:180px;min-height:80px;" id="ai-chat">' +
            '<div style="color:#8899bb;text-align:center;font-size:0.7rem;padding:12px 0;">💬 Hallo! Ich bin HalDo. Frage mich alles!</div></div>' +
            '<div style="display:flex;gap:4px;">' +
            '<input type="text" id="ai-input" placeholder="Frage oder Befehl ..." class="input-field" style="font-size:0.7rem;" />' +
            '<button id="ai-send" class="btn-primary">Senden</button></div>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;">' +
            '<span class="chip ai-q" data-cmd="Öffne Fahrschule">🚗 Fahrschule</span>' +
            '<span class="chip ai-q" data-cmd="Öffne Notizen">📝 Notizen</span>' +
            '<span class="chip ai-q" data-cmd="Öffne Aufgaben">✅ Aufgaben</span>' +
            '<span class="chip ai-q" data-cmd="Öffne E-Mail">📧 E-Mail</span>' +
            '<span class="chip ai-q" data-cmd="Hilfe">❓ Hilfe</span></div>' +
            '<div class="section-divider">🤖 ' + AI.conversationHistory.length + ' Nachrichten · Cmd+K</div></div>';

        var chat = body.querySelector('#ai-chat');
        var input = body.querySelector('#ai-input');
        var sendBtn = body.querySelector('#ai-send');
        var voiceBtn = body.querySelector('#ai-voice-btn');
        var clearBtn = body.querySelector('#ai-clear-btn');

        setTimeout(function() { if (input) input.focus(); }, 100);

        function addMsg(role, text) {
            var d = document.createElement('div');
            var isUser = role === 'user';
            d.style.cssText =
                'padding:4px 8px;margin:2px 0;border-radius:6px;font-size:0.7rem;word-wrap:break-word;max-width:92%;' +
                (isUser ?
                    'background:rgba(0,212,255,0.08);text-align:right;margin-left:auto;border-radius:8px 8px 0 8px;' :
                    'background:rgba(123,47,252,0.08);border-radius:8px 8px 8px 0;'
                );
            d.textContent = (isUser ? '👤 ' : '🤖 ') + text;
            chat.appendChild(d);
            chat.scrollTop = chat.scrollHeight;
        }

        function process(cmd) {
            if (!cmd.trim()) return;
            addMsg('user', cmd);
            var stateEl = document.getElementById('ai-state');
            if (stateEl) { stateEl.textContent = '🧠 denkt ...';
                stateEl.style.color = '#ffcc00'; }

            var cmdResult = AI._parseCommand(cmd);
            if (cmdResult && cmdResult.action === 'open') {
                if (state.apps[cmdResult.app]) {
                    launchApp(cmdResult.app);
                    addMsg('ai', '✅ ' + state.apps[cmdResult.app].title + ' geöffnet!');
                    if (stateEl) { stateEl.textContent = '● bereit';
                        stateEl.style.color = '#44ff88'; }
                    return;
                }
            }

            AI.ask(cmd, CONFIG.language).then(function(response) {
                addMsg('ai', response);
                if (stateEl) { stateEl.textContent = '● bereit';
                    stateEl.style.color = '#44ff88'; }
                if (state.settings.voiceEnabled) {
                    Voice.speak(response);
                }
            }).catch(function() {
                var fallback = AI._getFallback(cmd);
                addMsg('ai', fallback);
                if (stateEl) { stateEl.textContent = '● bereit';
                    stateEl.style.color = '#44ff88'; }
            });
        }

        sendBtn.addEventListener('click', function() {
            var v = input.value.trim();
            if (v) { process(v);
                input.value = ''; }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendBtn.click();
            }
        });

        body.querySelectorAll('.ai-q').forEach(function(b) {
            b.addEventListener('click', function() {
                input.value = b.dataset.cmd;
                sendBtn.click();
            });
        });

        if (voiceBtn) {
            voiceBtn.addEventListener('click', function() { Voice.startListening(); });
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                AI.clearHistory();
                chat.innerHTML =
                    '<div style="color:#8899bb;text-align:center;font-size:0.7rem;padding:12px 0;">💬 Chat geleert.</div>';
            });
        }

        if (AI.conversationHistory.length > 0) {
            var history = AI.conversationHistory.slice(-10);
            for (var i = 0; i < history.length; i++) {
                if (history[i]) addMsg(history[i].role, history[i].content);
            }
        }
    }
});

// ----- 2. Living HalDo AI -----
registerApp('avatar', {
    title: 'Living HalDo AI',
    icon: '👤',
    category: 'core',
    description: 'Lebendige AI-Präsenz',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px;height:100%;">' +
            '<h3 style="font-size:0.8rem;">👤 Living HalDo AI</h3>' +
            '<div class="avatar-container">' +
            '<div class="avatar-face" id="avatar-face">' +
            '<div class="eyes">' +
            '<div class="eye idle" id="eye-left"></div>' +
            '<div class="eye idle" id="eye-right"></div></div>' +
            '<div class="mouth" id="avatar-mouth"></div></div>' +
            '<div class="avatar-status idle" id="avatar-status">● bereit</div></div>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;">' +
            '<button onclick="Voice.startListening()" class="btn-primary" style="font-size:0.55rem;">🎤 Sprechen</button>' +
            '<button onclick="Voice.speak(\'Hallo! Ich bin HalDo. Wie kann ich dir helfen?\')" class="btn-secondary" style="font-size:0.55rem;">👋 Begrüßen</button>' +
            '<button onclick="document.getElementById(\'avatar-status\').textContent=\'🧠 Denkt...\';setTimeout(()=>{document.getElementById(\'avatar-status\').textContent=\'● bereit\';},2000)" class="btn-secondary" style="font-size:0.55rem;">🧠 Denken</button></div>' +
            '<div style="font-size:0.45rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;width:100%;text-align:center;">👤 Status: ' +
            state.avatar.status + '</div></div>';

        var statusEl = body.querySelector('#avatar-status');
        var eyes = body.querySelectorAll('.eye');
        var mouth = body.querySelector('#avatar-mouth');

        function updateAvatar(status) {
            var statusText = {
                'idle': '● bereit',
                'listening': '🎤 Hört zu...',
                'thinking': '🧠 Denkt...',
                'speaking': '🗣️ Spricht...'
            };
            if (statusEl) statusEl.textContent = statusText[status] || '● bereit';
            if (statusEl) statusEl.className = 'avatar-status ' + status;
            eyes.forEach(function(eye) {
                eye.className = 'eye ' + status;
            });
            if (mouth) {
                mouth.className = 'mouth' + (status === 'speaking' ? ' speaking' : '');
            }
        }

        window.updateAvatar = updateAvatar;

        var origUpdate = Voice._updateAvatarStatus;
        Voice._updateAvatarStatus = function(status) {
            updateAvatar(status);
            if (origUpdate) origUpdate(status);
        };
    }
});

// ----- 3. Fahrschule -----
registerApp('fahrschule', {
    title: 'Fahrschule',
    icon: '🚗',
    category: 'learning',
    description: 'Lerne Verkehrsregeln',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:8px;height:100%;">' +
            '<div style="font-size:2.8rem;">🚗</div>' +
            '<h3 style="font-size:0.85rem;">🚦 Fahrschule</h3>' +
            '<p style="color:#8899bb;font-size:0.65rem;">Lerne alles rund ums Autofahren</p>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;width:100%;max-width:280px;">' +
            '<button onclick="notify(\'🚦 Verkehrsregeln werden geladen...\',\'success\')" class="btn-primary" style="padding:10px 6px;font-size:0.6rem;">🚦 Regeln</button>' +
            '<button onclick="notify(\'🛑 Verkehrsschilder werden geladen...\',\'success\')" class="btn-primary" style="padding:10px 6px;font-size:0.6rem;">🛑 Schilder</button>' +
            '<button onclick="notify(\'🚗 Praktische Übung startet...\',\'success\')" class="btn-primary" style="padding:10px 6px;font-size:0.6rem;">🚗 Übung</button>' +
            '<button onclick="notify(\'📝 Theorieprüfung startet...\',\'success\')" class="btn-primary" style="padding:10px 6px;font-size:0.6rem;">📝 Prüfung</button></div>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;">' +
            '<span class="chip" onclick="notify(\'🚦 Ampel: Rot→Halt, Gelb→Bereit, Grün→Fahren\',\'info\')">🚦 Ampel</span>' +
            '<span class="chip" onclick="notify(\'🛑 Stoppschild: Immer anhalten\',\'info\')">🛑 Stopp</span></div>' +
            '<div class="section-divider">🚗 Fahrschule · Lektionen: 12</div></div>';
    }
});

// ----- 4. Notizen -----
registerApp('notes', {
    title: 'Notizen',
    icon: '📝',
    category: 'productivity',
    description: 'Schnelle Notizen',
    render: function(body) {
        var notes = state.notes || [];
        var html =
            '<div style="display:flex;gap:4px;margin-bottom:6px;">' +
            '<input type="text" id="note-input" placeholder="📝 Neue Notiz ..." class="input-field" />' +
            '<button id="note-add" class="btn-primary">➕</button></div>' +
            '<div id="note-list" style="display:flex;flex-direction:column;gap:3px;max-height:180px;overflow-y:auto;">';

        for (var i = 0; i < notes.length; i++) {
            html +=
                '<div class="list-item"><span class="text">' + escapeHtml(notes[i]) +
                '</span><button class="del-btn note-del" data-idx="' + i + '">✕</button></div>';
        }
        html += '</div><div class="section-divider">📝 ' + notes.length +
            ' Notizen · Lokal gespeichert</div>';

        body.innerHTML = html;

        var input = body.querySelector('#note-input');
        var addBtn = body.querySelector('#note-add');

        function renderNotes() {
            var list = body.querySelector('#note-list');
            list.innerHTML = '';
            for (var i = 0; i < notes.length; i++) {
                var div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = '<span class="text">' + escapeHtml(notes[i]) +
                    '</span><button class="del-btn note-del" data-idx="' + i + '">✕</button>';
                list.appendChild(div);
            }
            list.querySelectorAll('.note-del').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.idx);
                    notes.splice(idx, 1);
                    localStorage.setItem('haldo_notes', JSON.stringify(notes));
                    state.notes = notes;
                    renderNotes();
                    Notify.info('🗑️ Notiz gelöscht');
                });
            });
            var counter = body.querySelector('.section-divider');
            if (counter) counter.textContent = '📝 ' + notes.length +
            ' Notizen · Lokal gespeichert';
        }

        addBtn.addEventListener('click', function() {
            var val = input.value.trim();
            if (!val) return;
            notes.push(val);
            localStorage.setItem('haldo_notes', JSON.stringify(notes));
            state.notes = notes;
            input.value = '';
            renderNotes();
            Notify.success('📝 Notiz gespeichert');
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') addBtn.click();
        });
    }
});

// ----- 5. Aufgaben -----
registerApp('tasks', {
    title: 'Aufgaben',
    icon: '✅',
    category: 'productivity',
    description: 'To-Do-Liste',
    render: function(body) {
        var tasks = state.tasks || [];
        var html =
            '<div style="display:flex;gap:4px;margin-bottom:6px;">' +
            '<input type="text" id="task-input" placeholder="➕ Neue Aufgabe ..." class="input-field" />' +
            '<button id="task-add" class="btn-primary">➕</button></div>' +
            '<div id="task-list" style="display:flex;flex-direction:column;gap:3px;max-height:170px;overflow-y:auto;">';

        for (var i = 0; i < tasks.length; i++) {
            var done = tasks[i].done ? '✅' : '⬜';
            html +=
                '<div class="list-item">' +
                '<span style="display:flex;align-items:center;gap:6px;cursor:pointer;" class="task-toggle" data-idx="' +
                i + '">' +
                '<span>' + done + '</span>' +
                '<span style="' + (tasks[i].done ? 'text-decoration:line-through;color:#556688;' : '') +
                '">' + escapeHtml(tasks[i].text) + '</span></span>' +
                '<button class="del-btn task-del" data-idx="' + i + '">✕</button></div>';
        }
        var doneCount = tasks.filter(function(t) { return t.done; }).length;
        html += '</div><div class="section-divider">✅ ' + doneCount + '/' + tasks.length +
            ' erledigt</div>';

        body.innerHTML = html;

        var input = body.querySelector('#task-input');
        var addBtn = body.querySelector('#task-add');

        function renderTasks() {
            var list = body.querySelector('#task-list');
            list.innerHTML = '';
            for (var i = 0; i < tasks.length; i++) {
                var done = tasks[i].done ? '✅' : '⬜';
                var div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML =
                    '<span style="display:flex;align-items:center;gap:6px;cursor:pointer;" class="task-toggle" data-idx="' +
                    i + '">' +
                    '<span>' + done + '</span>' +
                    '<span style="' + (tasks[i].done ? 'text-decoration:line-through;color:#556688;' :
                        '') + '">' + escapeHtml(tasks[i].text) + '</span></span>' +
                    '<button class="del-btn task-del" data-idx="' + i + '">✕</button>';
                list.appendChild(div);
            }

            list.querySelectorAll('.task-toggle').forEach(function(el) {
                el.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.idx);
                    tasks[idx].done = !tasks[idx].done;
                    localStorage.setItem('haldo_tasks', JSON.stringify(tasks));
                    state.tasks = tasks;
                    renderTasks();
                    Notify.info(tasks[idx].done ? '✅ Erledigt!' : '🔄 Wieder offen');
                });
            });

            list.querySelectorAll('.task-del').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.idx);
                    tasks.splice(idx, 1);
                    localStorage.setItem('haldo_tasks', JSON.stringify(tasks));
                    state.tasks = tasks;
                    renderTasks();
                    Notify.info('🗑️ Aufgabe gelöscht');
                });
            });

            var counter = body.querySelector('.section-divider');
            if (counter) {
                var dc = tasks.filter(function(t) { return t.done; }).length;
                counter.textContent = '✅ ' + dc + '/' + tasks.length + ' erledigt';
            }
        }

        addBtn.addEventListener('click', function() {
            var val = input.value.trim();
            if (!val) return;
            tasks.push({ text: val, done: false, created: now() });
            localStorage.setItem('haldo_tasks', JSON.stringify(tasks));
            state.tasks = tasks;
            input.value = '';
            renderTasks();
            Notify.success('✅ Aufgabe hinzugefügt');
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') addBtn.click();
        });
    }
});

// ----- 6. Kontakte -----
registerApp('contacts', {
    title: 'Kontakte',
    icon: '👤',
    category: 'communication',
    description: 'Adressbuch',
    render: function(body) {
        var contacts = state.contacts || [];
        var html =
            '<div style="display:flex;gap:4px;margin-bottom:6px;">' +
            '<input type="text" id="contact-input" placeholder="👤 Name ..." class="input-field" />' +
            '<button id="contact-add" class="btn-primary">➕</button></div>' +
            '<div id="contact-list" style="display:flex;flex-direction:column;gap:3px;max-height:170px;overflow-y:auto;">';

        for (var i = 0; i < contacts.length; i++) {
            html +=
                '<div class="list-item"><span class="text">👤 ' + escapeHtml(contacts[i]) +
                '</span><button class="del-btn contact-del" data-idx="' + i + '">✕</button></div>';
        }
        html += '</div><div class="section-divider">👤 ' + contacts.length +
            ' Kontakte · Lokal gespeichert</div>';

        body.innerHTML = html;

        var input = body.querySelector('#contact-input');
        var addBtn = body.querySelector('#contact-add');

        function renderContacts() {
            var list = body.querySelector('#contact-list');
            list.innerHTML = '';
            for (var i = 0; i < contacts.length; i++) {
                var div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = '<span class="text">👤 ' + escapeHtml(contacts[i]) +
                    '</span><button class="del-btn contact-del" data-idx="' + i + '">✕</button>';
                list.appendChild(div);
            }
            list.querySelectorAll('.contact-del').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.idx);
                    contacts.splice(idx, 1);
                    localStorage.setItem('haldo_contacts', JSON.stringify(contacts));
                    state.contacts = contacts;
                    renderContacts();
                    Notify.info('🗑️ Kontakt gelöscht');
                });
            });
            var counter = body.querySelector('.section-divider');
            if (counter) counter.textContent = '👤 ' + contacts.length +
            ' Kontakte · Lokal gespeichert';
        }

        addBtn.addEventListener('click', function() {
            var val = input.value.trim();
            if (!val) return;
            contacts.push(val);
            localStorage.setItem('haldo_contacts', JSON.stringify(contacts));
            state.contacts = contacts;
            input.value = '';
            renderContacts();
            Notify.success('👤 Kontakt hinzugefügt');
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') addBtn.click();
        });
    }
});

// ----- 7. Datei-Manager -----
registerApp('files', {
    title: 'Datei-Manager',
    icon: '📁',
    category: 'system',
    description: 'Dokumente verwalten',
    render: function(body) {
        var files = [
            { name: 'Dokumente', type: 'folder' },
            { name: 'Bilder', type: 'folder' },
            { name: 'Musik', type: 'folder' },
            { name: 'HalDo_System.pdf', type: 'pdf' },
            { name: 'README.txt', type: 'txt' },
            { name: 'Config.json', type: 'json' }
        ];
        var html =
            '<div style="display:flex;gap:4px;margin-bottom:6px;">' +
            '<input type="text" placeholder="🔍 Suche ..." class="input-field" />' +
            '<button onclick="Notify.info(\'📁 Neuer Ordner\')" class="btn-secondary">➕</button></div>' +
            '<div class="app-grid">';

        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            var icon = f.type === 'folder' ? '📁' : '📄';
            html +=
                '<div class="app-grid-item" onclick="Notify.info(\'📄 ' + f.name + '\')">' +
                '<div class="icon">' + icon + '</div><div class="name">' + f.name + '</div></div>';
        }
        html += '</div><div class="section-divider">📊 ' + files.length +
            ' Elemente · 💾 24 GB frei</div>';

        body.innerHTML = html;
    }
});

// ----- 8. Cosmic World -----
registerApp('cosmic', {
    title: 'Cosmic World',
    icon: '🌌',
    category: 'entertainment',
    description: 'Interaktives Universum',
    render: function(body) {
        body.innerHTML =
            '<div style="text-align:center;padding:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;">' +
            '<div style="font-size:3rem;">🌌</div>' +
            '<h3 style="margin:6px 0;font-size:0.9rem;">Cosmic World</h3>' +
            '<p style="color:#8899bb;font-size:0.65rem;">Sonne · 12 Planeten · Mond · Sterne</p>' +
            '<div style="margin-top:10px;font-size:0.5rem;color:#8899bb;background:rgba(255,255,255,0.03);padding:8px 12px;border-radius:8px;">☀️ Klicke auf die Sonne im Hintergrund</div>' +
            '<div style="font-size:0.4rem;color:#8899bb;margin-top:10px;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;width:100%;">✨ ' +
            new Date().toLocaleDateString('de-DE') + '</div></div>';
    }
});

// ----- 9. App World -----
registerApp('appworld', {
    title: 'App World',
    icon: '📱',
    category: 'system',
    description: 'Alle Apps zentral',
    render: function(body) {
        var apps = [];
        for (var key in state.apps) {
            if (key !== 'appworld') {
                apps.push({
                    id: key,
                    title: state.apps[key].title,
                    icon: state.apps[key].icon,
                    category: state.apps[key].category || 'all',
                    description: state.apps[key].description || ''
                });
            }
        }
        apps.sort(function(a, b) { return a.title.localeCompare(b.title); });

        var categories = {
            'core': '⚡ Core',
            'productivity': '📊 Produktivität',
            'learning': '📚 Lernen',
            'entertainment': '🎮 Unterhaltung',
            'system': '🔧 System',
            'communication': '💬 Kommunikation',
            'creative': '🎨 Kreativ',
            'tools': '🔨 Werkzeuge',
            'media': '🎬 Medien',
            'office': '📄 Office',
            'language': '🌍 Sprache',
            'knowledge': '🧠 Wissen',
            'business': '💼 Business'
        };

        var html = '<h3 style="margin-bottom:6px;font-size:0.75rem;">📱 ' + apps.length +
            ' Apps</h3>';

        var cats = Object.keys(categories);
        for (var ci = 0; ci < cats.length; ci++) {
            var catApps = apps.filter(function(a) { return a.category === cats[ci]; });
            if (catApps.length === 0) continue;
            html += '<div style="font-size:0.5rem;color:#556688;margin:4px 0 2px 0;">' + categories[
                cats[ci]] + '</div>';
            html += '<div class="app-grid">';
            for (var ai = 0; ai < catApps.length; ai++) {
                var a = catApps[ai];
                html +=
                    '<div class="app-grid-item" onclick="launchApp(\'' + a.id + '\')" title="' +
                    a.description + '">' +
                    '<div class="icon">' + a.icon + '</div><div class="name">' + a.title +
                    '</div></div>';
            }
            html += '</div>';
        }

        html += '<div class="section-divider">📱 ' + apps.length + ' Apps · HalDo OS ' + CONFIG
            .version + '</div>';
        body.innerHTML = html;
    }
});

// ----- 10. E-Mail -----
registerApp('email', {
    title: 'E-Mail',
    icon: '📧',
    category: 'communication',
    description: 'Professionelle E-Mail',
    render: function(body) {
        var emails = state.emails || { inbox: [], sent: [], drafts: [] };
        var html =
            '<div style="display:flex;gap:4px;margin-bottom:6px;flex-wrap:wrap;">' +
            '<button id="email-inbox" class="btn-primary" style="font-size:0.55rem;padding:4px 10px;">📥 Posteingang</button>' +
            '<button id="email-sent" class="btn-secondary" style="font-size:0.55rem;padding:4px 10px;">📤 Gesendet</button>' +
            '<button id="email-drafts" class="btn-secondary" style="font-size:0.55rem;padding:4px 10px;">📝 Entwürfe</button>' +
            '<button id="email-new" class="btn-primary" style="font-size:0.55rem;padding:4px 10px;margin-left:auto;">✏️ Neu</button></div>' +
            '<div id="email-list" style="display:flex;flex-direction:column;gap:3px;max-height:180px;overflow-y:auto;">';

        var inbox = emails.inbox || [];
        if (inbox.length === 0) {
            html += '<div style="color:#556688;text-align:center;font-size:0.6rem;padding:12px 0;">📭 Keine E-Mails</div>';
        } else {
            for (var i = 0; i < inbox.length; i++) {
                var e = inbox[i];
                html +=
                    '<div class="list-item" style="cursor:pointer;" onclick="Notify.info(\'📧 ' +
                    e.subject + '\')">' +
                    '<span style="display:flex;flex-direction:column;gap:2px;flex:1;">' +
                    '<span style="font-weight:600;font-size:0.6rem;">' + e.from + '</span>' +
                    '<span style="font-size:0.55rem;color:#8899bb;">' + e.subject + '</span></span>' +
                    '<span style="font-size:0.4rem;color:#556688;">' + e.date + '</span></div>';
            }
        }

        html += '</div><div class="section-divider">📧 ' + inbox.length +
            ' Nachrichten · Lokal gespeichert</div>';

        body.innerHTML = html;

        var inboxBtn = body.querySelector('#email-inbox');
        var sentBtn = body.querySelector('#email-sent');
        var draftsBtn = body.querySelector('#email-drafts');
        var newBtn = body.querySelector('#email-new');

        function renderFolder(folder) {
            var list = body.querySelector('#email-list');
            var items = emails[folder] || [];
            list.innerHTML = '';
            if (items.length === 0) {
                list.innerHTML =
                    '<div style="color:#556688;text-align:center;font-size:0.6rem;padding:12px 0;">📭 Leer</div>';
                return;
            }
            for (var i = 0; i < items.length; i++) {
                var e = items[i];
                var div = document.createElement('div');
                div.className = 'list-item';
                div.style.cursor = 'pointer';
                div.onclick = function() { Notify.info('📧 ' + e.subject); };
                div.innerHTML =
                    '<span style="display:flex;flex-direction:column;gap:2px;flex:1;">' +
                    '<span style="font-weight:600;font-size:0.6rem;">' + e.from + '</span>' +
                    '<span style="font-size:0.55rem;color:#8899bb;">' + e.subject + '</span></span>' +
                    '<span style="font-size:0.4rem;color:#556688;">' + e.date + '</span>';
                list.appendChild(div);
            }
        }

        if (inboxBtn) inboxBtn.addEventListener('click', function() { renderFolder('inbox'); });
        if (sentBtn) sentBtn.addEventListener('click', function() { renderFolder('sent'); });
        if (draftsBtn) draftsBtn.addEventListener('click', function() { renderFolder('drafts'); });
        if (newBtn) {
            newBtn.addEventListener('click', function() {
                var subject = prompt('📧 Betreff:');
                if (subject) {
                    var to = prompt('👤 An:');
                    if (to) {
                        var bodyText = prompt('📝 Nachricht:');
                        if (bodyText) {
                            var email = {
                                from: 'ich@haldo.ai',
                                to: to,
                                subject: subject,
                                body: bodyText,
                                date: new Date().toLocaleDateString('de-DE'),
                                time: new Date().toLocaleTimeString('de-DE')
                            };
                            emails.sent = emails.sent || [];
                            emails.sent.push(email);
                            localStorage.setItem('haldo_emails', JSON.stringify(
                            emails));
                            state.emails = emails;
                            Notify.success('📧 E-Mail gesendet!');
                            renderFolder('sent');
                        }
                    }
                }
            });
        }

        renderFolder('inbox');
    }
});

// ----- 11. Sprache / Language Center -----
registerApp('language', {
    title: 'Sprachzentrum',
    icon: '🌍',
    category: 'language',
    description: 'Sprachen verwalten',
    render: function(body) {
        var html =
            '<div style="display:flex;flex-direction:column;gap:8px;padding:8px;">' +
            '<h3 style="font-size:0.8rem;">🌍 Sprachzentrum</h3>' +
            '<div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:6px;">' +
            '<div style="font-size:0.65rem;color:#8899bb;">Aktuelle Sprache</div>' +
            '<div style="font-size:0.8rem;font-weight:600;">' + CONFIG.languages[CONFIG.language]
            .flag + ' ' + CONFIG.languages[CONFIG.language].name + '</div></div>' +
            '<div style="font-size:0.6rem;color:#8899bb;margin-top:4px;">Sprache wählen:</div>' +
            '<div class="lang-selector">';

        for (var key in CONFIG.languages) {
            var lang = CONFIG.languages[key];
            html +=
                '<button class="lang-btn' + (key === CONFIG.language ? ' active' : '') +
                '" onclick="changeLanguage(\'' + key +
                '\')">' + lang.flag + ' ' + lang.name + '</button>';
        }

        html += '</div>' +
            '<div style="font-size:0.45rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;margin-top:4px;">Übersetzungssystem aktiv</div></div>';

        body.innerHTML = html;
    }
});

// ----- 12. Einstellungen -----
registerApp('settings', {
    title: 'Einstellungen',
    icon: '⚙️',
    category: 'system',
    description: 'System-Einstellungen',
    render: function(body) {
        body.innerHTML =
            '<h3 style="margin-bottom:8px;font-size:0.8rem;">⚙️ System-Einstellungen</h3>' +
            '<div style="display:flex;flex-direction:column;gap:6px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);">' +
            '<span style="font-size:0.65rem;color:#8899bb;">🌐 Sprache</span>' +
            '<select id="settings-language" style="padding:4px 8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:4px;color:#fff;font-size:0.65rem;">' +
            '<option value="de">🇩🇪 Deutsch</option>' +
            '<option value="en">🇬🇧 English</option>' +
            '<option value="ku">🇰🇲 Kurmancî</option>' +
            '<option value="ezidi">𒀭 Êzîdî</option>' +
            '<option value="tr">🇹🇷 Türkçe</option>' +
            '<option value="ar">🇸🇦 العربية</option>' +
            '<option value="fr">🇫🇷 Français</option>' +
            '<option value="es">🇪🇸 Español</option></select></div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);">' +
            '<span style="font-size:0.65rem;color:#8899bb;">🎤 Sprachsteuerung</span>' +
            '<input type="checkbox" id="settings-voice" checked style="accent-color:#00d4ff;width:16px;height:16px;cursor:pointer;" /></div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);">' +
            '<span style="font-size:0.65rem;color:#8899bb;">🎨 Theme</span>' +
            '<select id="settings-theme" style="padding:4px 8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:4px;color:#fff;font-size:0.65rem;">' +
            '<option value="dark">🌙 Dark</option>' +
            '<option value="light">☀️ Light</option></select></div>' +
            '<button id="settings-save" class="btn-primary" style="margin-top:4px;">💾 Speichern</button>' +
            '<div style="font-size:0.45rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;margin-top:2px;">HalDo OS ' +
            CONFIG.version + ' · Build ' + CONFIG.build + ' · ' + Object.keys(state.apps).length +
            ' Apps</div></div>';

        var saveBtn = body.querySelector('#settings-save');

        function loadSettingsUI() {
            try {
                var saved = JSON.parse(localStorage.getItem('haldo_settings'));
                if (saved) {
                    var lang = body.querySelector('#settings-language');
                    var voice = body.querySelector('#settings-voice');
                    var theme = body.querySelector('#settings-theme');
                    if (lang) lang.value = saved.language || 'de';
                    if (voice) voice.checked = saved.voiceEnabled !== false;
                    if (theme) theme.value = saved.theme || 'dark';
                }
            } catch (e) {}
        }

        loadSettingsUI();

        saveBtn.addEventListener('click', function() {
            var lang = body.querySelector('#settings-language').value;
            var voice = body.querySelector('#settings-voice').checked;
            var theme = body.querySelector('#settings-theme').value;

            state.settings.language = lang;
            state.settings.voiceEnabled = voice;
            state.settings.theme = theme;
            CONFIG.language = lang;

            try {
                localStorage.setItem('haldo_settings', JSON.stringify(state.settings));
            } catch (e) {}

            if (theme === 'light') {
                document.documentElement.style.setProperty('--bg-primary', '#f0f2f8');
                document.documentElement.style.setProperty('--bg-secondary', '#e8ecf4');
                document.documentElement.style.setProperty('--bg-window', 'rgba(240,242,248,0.94)');
                document.documentElement.style.setProperty('--text-primary', '#1a1a2e');
                document.documentElement.style.setProperty('--text-secondary', '#556688');
                document.documentElement.style.setProperty('--border-color', 'rgba(0,0,0,0.06)');
            } else {
                document.documentElement.style.setProperty('--bg-primary', '#0a0a1a');
                document.documentElement.style.setProperty('--bg-secondary', '#12122a');
                document.documentElement.style.setProperty('--bg-window', 'rgba(16,16,40,0.94)');
                document.documentElement.style.setProperty('--text-primary', '#e8eef5');
                document.documentElement.style.setProperty('--text-secondary', '#8899bb');
                document.documentElement.style.setProperty('--border-color', 'rgba(255,255,255,0.06)');
            }

            Notify.success('✅ Einstellungen gespeichert!');
            loadSettingsUI();
            var aiState = document.getElementById('ai-state');
            if (aiState) {
                aiState.textContent = '● bereit';
            }
            var avatarStatus = document.getElementById('avatar-status');
            if (avatarStatus) {
                avatarStatus.textContent = '● bereit';
            }
        });
    }
});

// ----- 13. Update Center -----
registerApp('update', {
    title: 'Update Center',
    icon: '🔄',
    category: 'system',
    description: 'System-Updates',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;gap:8px;padding:8px;">' +
            '<h3 style="font-size:0.8rem;">🔄 Update Center</h3>' +
            '<div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:6px;">' +
            '<div style="font-size:0.65rem;color:#8899bb;">Aktuelle Version</div>' +
            '<div style="font-size:0.8rem;font-weight:600;">HalDo OS ' + CONFIG.version + '</div>' +
            '<div style="font-size:0.55rem;color:#556688;">Build ' + CONFIG.build + '</div></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:6px;">' +
            '<div style="font-size:0.65rem;color:#8899bb;">Status</div>' +
            '<div style="font-size:0.7rem;color:#44ff88;">✅ System ist aktuell</div></div>' +
            '<button onclick="Notify.info(\'🔍 Suche nach Updates...\')" class="btn-primary">🔍 Nach Updates suchen</button>' +
            '<div style="font-size:0.4rem;color:#556688;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;">Zuletzt geprüft: ' +
            new Date().toLocaleString('de-DE') + '</div></div>';
    }
});

// ----- 14. Browser -----
registerApp('browser', {
    title: 'Browser',
    icon: '🌐',
    category: 'tools',
    description: 'Webbrowser',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<div style="display:flex;gap:4px;">' +
            '<input type="text" id="browser-url" placeholder="🔍 URL oder Suche eingeben..." class="input-field" style="font-size:0.6rem;" value="https://www.google.com" />' +
            '<button id="browser-go" class="btn-primary" style="font-size:0.55rem;">Los</button></div>' +
            '<iframe id="browser-frame" src="https://www.google.com" style="flex:1;border:none;border-radius:6px;background:#fff;width:100%;min-height:120px;"></iframe>' +
            '<div class="section-divider">🌐 Browser</div></div>';

        var urlInput = body.querySelector('#browser-url');
        var goBtn = body.querySelector('#browser-go');
        var frame = body.querySelector('#browser-frame');

        function navigate() {
            var url = urlInput.value.trim();
            if (!url) return;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                if (url.includes('.') && !url.includes(' ')) {
                    url = 'https://' + url;
                } else {
                    url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
                }
            }
            frame.src = url;
        }

        goBtn.addEventListener('click', navigate);
        urlInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') navigate();
        });
    }
});

// ----- 15. Taschenrechner -----
registerApp('calculator', {
    title: 'Taschenrechner',
    icon: '🧮',
    category: 'tools',
    description: 'Wissenschaftlicher Rechner',
    render: function(body) {
        var display = '0';
        var expression = '';
        var result = '';

        function renderCalc() {
            body.innerHTML =
                '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
                '<div style="background:rgba(0,0,0,0.2);padding:8px 12px;border-radius:6px;text-align:right;min-height:50px;">' +
                '<div style="font-size:0.6rem;color:#8899bb;min-height:18px;" id="calc-expr"></div>' +
                '<div style="font-size:1.2rem;font-weight:700;" id="calc-display">0</div></div>' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">' +
                '<button class="calc-btn" data-value="C" style="background:rgba(255,68,68,0.15);color:#ff4444;padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">C</button>' +
                '<button class="calc-btn" data-value="±" style="background:rgba(255,255,255,0.04);padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">±</button>' +
                '<button class="calc-btn" data-value="%" style="background:rgba(255,255,255,0.04);padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">%</button>' +
                '<button class="calc-btn" data-value="/" style="background:rgba(0,212,255,0.1);color:#00d4ff;padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">÷</button>' +
                '<button class="calc-btn" data-value="7" style="background:rgba(255,255,255,0.04);padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">7</button>' +
                '<button class="calc-btn" data-value="8" style="background:rgba(255,255,255,0.04);padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">8</button>' +
                '<button class="calc-btn" data-value="9" style="background:rgba(255,255,255,0.04);padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">9</button>' +
                '<button class="calc-btn" data-value="*" style="background:rgba(0,212,255,0.1);color:#00d4ff;padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">×</button>' +
                '<button class="calc-btn" data-value="4" style="background:rgba(255,255,255,0.04);padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">4</button>' +
                '<button class="calc-btn" data-value="5" style="background:rgba(255,255,255,0.04);padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">5</button>' +
                '<button class="calc-btn" data-value="6" style="background:rgba(255,255,255,0.04);padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">6</button>' +
                '<button class="calc-btn" data-value="-" style="background:rgba(0,212,255,0.1);color:#00d4ff;padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">−</button>' +
                '<button class="calc-btn" data-value="1" style="background:rgba(255,255,255,0.04);padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">1</button>' +
                '<button class="calc-btn" data-value="2" style="background:rgba(255,255,255,0.04);padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">2</button>' +
                '<button class="calc-btn" data-value="3" style="background:rgba(255,255,255,0.04);padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">3</button>' +
                '<button class="calc-btn" data-value="+" style="background:rgba(0,212,255,0.1);color:#00d4ff;padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">+</button>' +
                '<button class="calc-btn" data-value="0" style="background:rgba(255,255,255,0.04);padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;grid-column:span 2;">0</button>' +
                '<button class="calc-btn" data-value="." style="background:rgba(255,255,255,0.04);padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">.</button>' +
                '<button class="calc-btn" data-value="=" style="background:linear-gradient(135deg,#00d4ff,#7b2ffc);color:#fff;padding:8px;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">=</button>' +
                '</div>' +
                '<div class="section-divider">🧮 Taschenrechner</div></div>';

            var displayEl = body.querySelector('#calc-display');
            var exprEl = body.querySelector('#calc-expr');
            var btns = body.querySelectorAll('.calc-btn');

            btns.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var value = this.dataset.value;
                    handleCalc(value);
                });
            });

            function handleCalc(value) {
                if (value === 'C') {
                    display = '0';
                    expression = '';
                    result = '';
                } else if (value === '±') {
                    if (display !== '0') {
                        display = display.startsWith('-') ? display.slice(1) : '-' + display;
                    }
                } else if (value === '%') {
                    display = String(parseFloat(display) / 100);
                } else if (value === '=') {
                    try {
                        var evalExpr = expression + display;
                        var safe = evalExpr.replace(/[^0-9+\-*/().%]/g, '');
                        result = String(Function('"use strict"; return (' + safe + ')')());
                        exprEl.textContent = evalExpr + ' =';
                        display = result;
                        expression = '';
                    } catch (e) {
                        display = 'Error';
                    }
                } else if ('+-/*'.includes(value)) {
                    expression += display + value;
                    display = '0';
                } else {
                    if (display === '0' && value !== '.') {
                        display = value;
                    } else {
                        if (display.length < 15) {
                            display += value;
                        }
                    }
                }
                displayEl.textContent = display;
                if (expression) {
                    exprEl.textContent = expression;
                }
            }
        }

        renderCalc();
    }
});

// ----- 16. Kalender -----
registerApp('calendar', {
    title: 'Kalender',
    icon: '📅',
    category: 'productivity',
    description: 'Termine verwalten',
    render: function(body) {
        var now = new Date();
        var currentMonth = now.getMonth();
        var currentYear = now.getFullYear();
        var selectedDate = now.getDate();

        function renderCalendar(month, year) {
            var months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
            var days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

            var firstDay = new Date(year, month, 1).getDay();
            var daysInMonth = new Date(year, month + 1, 0).getDate();

            var html =
                '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;">' +
                '<button id="cal-prev" class="btn-secondary" style="font-size:0.6rem;">◀</button>' +
                '<span style="font-weight:700;font-size:0.8rem;">' + months[month] + ' ' + year +
                '</span>' +
                '<button id="cal-next" class="btn-secondary" style="font-size:0.6rem;">▶</button></div>' +
                '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;font-size:0.5rem;color:#8899bb;">';

            for (var d = 0; d < days.length; d++) {
                html += '<div>' + days[d] + '</div>';
            }
            html += '</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;font-size:0.65rem;">';

            for (var i = 0; i < firstDay; i++) {
                html += '<div></div>';
            }

            for (var day = 1; day <= daysInMonth; day++) {
                var isToday = (day === selectedDate && month === currentMonth && year === currentYear);
                html +=
                    '<div style="padding:4px 0;cursor:pointer;border-radius:4px;' +
                    (isToday ? 'background:linear-gradient(135deg,#00d4ff,#7b2ffc);color:#fff;font-weight:700;' :
                        '') +
                    '" onclick="this.style.background=\'rgba(255,255,255,0.06)\';">' + day + '</div>';
            }

            html += '</div>' +
                '<div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;">' +
                '<input type="text" id="cal-event" placeholder="📝 Neuer Termin..." class="input-field" style="font-size:0.6rem;" />' +
                '<button id="cal-add" class="btn-primary" style="font-size:0.55rem;">➕</button></div>' +
                '<div id="cal-events" style="max-height:60px;overflow-y:auto;font-size:0.55rem;color:#8899bb;">' +
                '<div style="padding:2px 4px;">📌 Keine Termine für heute</div></div>' +
                '<div class="section-divider">📅 Kalender</div></div>';

            body.innerHTML = html;

            var prevBtn = body.querySelector('#cal-prev');
            var nextBtn = body.querySelector('#cal-next');
            var addBtn = body.querySelector('#cal-add');
            var eventInput = body.querySelector('#cal-event');
            var eventsDiv = body.querySelector('#cal-events');

            var events = JSON.parse(localStorage.getItem('haldo_calendar_events') || '[]');

            function renderEvents() {
                eventsDiv.innerHTML = '';
                var today = new Date(currentYear, currentMonth, selectedDate);
                var todayStr = today.toDateString();
                var todayEvents = events.filter(function(e) {
                    return new Date(e.date).toDateString() === todayStr;
                });
                if (todayEvents.length === 0) {
                    eventsDiv.innerHTML = '<div style="padding:2px 4px;color:#556688;">📭 Keine Termine</div>';
                } else {
                    todayEvents.forEach(function(e) {
                        var div = document.createElement('div');
                        div.style.cssText =
                            'padding:2px 4px;border-left:2px solid #00d4ff;margin:2px 0;display:flex;justify-content:space-between;';
                        div.innerHTML = '<span>📌 ' + e.text +
                            '</span><button class="cal-del" data-id="' + e.id +
                            '" style="background:none;border:none;color:#ff4444;cursor:pointer;">✕</button>';
                        eventsDiv.appendChild(div);
                    });
                    eventsDiv.querySelectorAll('.cal-del').forEach(function(btn) {
                        btn.addEventListener('click', function() {
                            var id = this.dataset.id;
                            events = events.filter(function(e) { return e.id !==
                                id; });
                            localStorage.setItem('haldo_calendar_events', JSON.stringify(
                                events));
                            renderEvents();
                        });
                    });
                }
            }

            addBtn.addEventListener('click', function() {
                var text = eventInput.value.trim();
                if (!text) return;
                var today = new Date(currentYear, currentMonth, selectedDate);
                events.push({
                    id: uid(),
                    text: text,
                    date: today.toISOString()
                });
                localStorage.setItem('haldo_calendar_events', JSON.stringify(events));
                eventInput.value = '';
                renderEvents();
                Notify.success('📅 Termin hinzugefügt');
            });

            eventInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') addBtn.click();
            });

            prevBtn.addEventListener('click', function() {
                month--;
                if (month < 0) { month = 11;
                    year--; }
                renderCalendar(month, year);
            });

            nextBtn.addEventListener('click', function() {
                month++;
                if (month > 11) { month = 0;
                    year++; }
                renderCalendar(month, year);
            });

            renderEvents();
        }

        renderCalendar(currentMonth, currentYear);
    }
});

// ----- 17. Kamera -----
registerApp('camera', {
    title: 'Kamera',
    icon: '📷',
    category: 'media',
    description: 'Fotos aufnehmen',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px;height:100%;">' +
            '<div style="font-size:3rem;">📷</div>' +
            '<h3 style="font-size:0.8rem;">Kamera</h3>' +
            '<p style="color:#8899bb;font-size:0.6rem;text-align:center;">Klicke für ein Foto</p>' +
            '<video id="camera-preview" autoplay playsinline style="width:100%;max-width:240px;border-radius:8px;background:#000;aspect-ratio:4/3;object-fit:cover;"></video>' +
            '<div style="display:flex;gap:8px;">' +
            '<button id="camera-start" class="btn-primary" style="font-size:0.6rem;">📷 Kamera starten</button>' +
            '<button id="camera-capture" class="btn-primary" style="font-size:0.6rem;background:#ff6b6b;">⚡ Aufnehmen</button></div>' +
            '<div id="camera-result" style="font-size:0.5rem;color:#8899bb;text-align:center;"></div>' +
            '<div class="section-divider">📷 Kamera</div></div>';

        var video = body.querySelector('#camera-preview');
        var startBtn = body.querySelector('#camera-start');
        var captureBtn = body.querySelector('#camera-capture');
        var resultDiv = body.querySelector('#camera-result');
        var stream = null;

        startBtn.addEventListener('click', function() {
            if (stream) {
                stream.getTracks().forEach(function(t) { t.stop(); });
                stream = null;
                video.srcObject = null;
                startBtn.textContent = '📷 Kamera starten';
                resultDiv.textContent = '';
                return;
            }
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                    .then(function(s) {
                        stream = s;
                        video.srcObject = s;
                        startBtn.textContent = '⏹️ Kamera stoppen';
                        resultDiv.textContent = '✅ Kamera bereit';
                    })
                    .catch(function() {
                        resultDiv.textContent = '❌ Zugriff verweigert';
                    });
            } else {
                resultDiv.textContent = '❌ Kamera nicht unterstützt';
            }
        });

        captureBtn.addEventListener('click', function() {
            if (!stream) {
                resultDiv.textContent = '⚠️ Kamera zuerst starten';
                return;
            }
            var canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            var link = document.createElement('a');
            link.download = 'photo-' + Date.now() + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            resultDiv.textContent = '✅ Foto gespeichert!';
        });
    }
});

// ----- 18. Chat -----
registerApp('chat', {
    title: 'Nachrichten',
    icon: '💬',
    category: 'communication',
    description: 'Privater Chat',
    render: function(body) {
        var chats = JSON.parse(localStorage.getItem('haldo_chats') || '{"messages":[]}');
        var messages = chats.messages || [];

        function renderChat() {
            var html =
                '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
                '<div style="display:flex;gap:4px;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">' +
                '<span style="font-weight:700;font-size:0.7rem;">💬 Nachrichten</span>' +
                '<span style="font-size:0.5rem;color:#8899bb;margin-left:auto;">' + messages.length +
                ' Nachrichten</span></div>' +
                '<div id="chat-messages" style="flex:1;overflow-y:auto;padding:4px;max-height:140px;min-height:80px;background:rgba(0,0,0,0.1);border-radius:6px;font-size:0.6rem;">';

            if (messages.length === 0) {
                html += '<div style="color:#556688;text-align:center;padding:20px 0;">Keine Nachrichten</div>';
            } else {
                for (var i = 0; i < messages.length; i++) {
                    var m = messages[i];
                    var isUser = m.sender === 'user';
                    html +=
                        '<div style="display:flex;justify-content:' + (isUser ? 'flex-end' :
                            'flex-start') + ';margin:4px 0;">' +
                        '<div style="max-width:75%;padding:4px 8px;border-radius:8px;' +
                        (isUser ?
                            'background:linear-gradient(135deg,#00d4ff,#7b2ffc);color:#fff;border-radius:8px 8px 0 8px;' :
                            'background:rgba(255,255,255,0.06);border-radius:8px 8px 8px 0;') +
                        '">' + m.text +
                        '<div style="font-size:0.4rem;opacity:0.5;margin-top:2px;">' + m.time +
                        '</div></div></div>';
                }
            }

            html += '</div>' +
                '<div style="display:flex;gap:4px;">' +
                '<input type="text" id="chat-input" placeholder="💬 Nachricht schreiben..." class="input-field" style="font-size:0.6rem;" />' +
                '<button id="chat-send" class="btn-primary" style="font-size:0.55rem;">Senden</button></div>' +
                '<div class="section-divider">💬 Chat</div></div>';

            body.innerHTML = html;

            var input = body.querySelector('#chat-input');
            var sendBtn = body.querySelector('#chat-send');
            var msgContainer = body.querySelector('#chat-messages');

            function addMessage(text, sender) {
                var now = new Date();
                var time = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                messages.push({ text: text, sender: sender || 'user', time: time, timestamp: now
                        .toISOString() });
                if (messages.length > 100) {
                    messages.splice(0, messages.length - 100);
                }
                localStorage.setItem('haldo_chats', JSON.stringify({ messages: messages }));
                renderChat();
                msgContainer.scrollTop = msgContainer.scrollHeight;
            }

            sendBtn.addEventListener('click', function() {
                var text = input.value.trim();
                if (!text) return;
                addMessage(text, 'user');
                input.value = '';
                setTimeout(function() {
                    var responses = [
                        '👍', '😊', 'Ja, das stimmt!', 'Interessant!', 'Erzähl mir mehr.',
                        'Das ist gut zu wissen.', 'Danke!', '👍 Verstanden!'
                    ];
                    addMessage(responses[Math.floor(Math.random() * responses.length)],
                    'other');
                }, 800 + Math.random() * 600);
            });

            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') sendBtn.click();
            });

            msgContainer.scrollTop = msgContainer.scrollHeight;
        }

        renderChat();
    }
});

// ----- 19. Uhr -----
registerApp('clock', {
    title: 'Uhr',
    icon: '🕐',
    category: 'tools',
    description: 'Weltuhr',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px;height:100%;">' +
            '<div style="font-size:3rem;">🕐</div>' +
            '<div style="font-size:2.8rem;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:2px;" id="clock-display-app">--:--:--</div>' +
            '<div style="font-size:0.7rem;color:#8899bb;" id="clock-date-app">' + new Date()
            .toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long',
                day: 'numeric' }) +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;width:100%;max-width:280px;margin-top:4px;">' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;text-align:center;"><div style="font-size:0.5rem;color:#8899bb;">London</div><div style="font-size:0.7rem;" id="tz-london">--:--</div></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;text-align:center;"><div style="font-size:0.5rem;color:#8899bb;">Berlin</div><div style="font-size:0.7rem;" id="tz-berlin">--:--</div></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;text-align:center;"><div style="font-size:0.5rem;color:#8899bb;">Tokio</div><div style="font-size:0.7rem;" id="tz-tokyo">--:--</div></div></div>' +
            '<div class="section-divider">🕐 Uhr</div></div>';

        function updateClockApp() {
            var now = new Date();
            var display = body.querySelector('#clock-display-app');
            var dateDisplay = body.querySelector('#clock-date-app');
            if (display) {
                display.textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit',
                    minute: '2-digit', second: '2-digit' });
            }
            if (dateDisplay) {
                dateDisplay.textContent = now.toLocaleDateString('de-DE', { weekday: 'long',
                    year: 'numeric', month: 'long', day: 'numeric' });
            }

            var tzs = {
                'tz-london': 'Europe/London',
                'tz-berlin': 'Europe/Berlin',
                'tz-tokyo': 'Asia/Tokyo'
            };
            for (var id in tzs) {
                var el = body.querySelector('#' + id);
                if (el) {
                    var tzTime = new Date().toLocaleTimeString('de-DE', { hour: '2-digit',
                        minute: '2-digit', timeZone: tzs[id] });
                    el.textContent = tzTime;
                }
            }
        }

        updateClockApp();
        setInterval(updateClockApp, 1000);
    }
});

// ----- 20. Control Center -----
registerApp('controlcenter', {
    title: 'Control Center',
    icon: '🎛️',
    category: 'system',
    description: 'Schnellzugriff',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;gap:8px;padding:8px;height:100%;">' +
            '<h3 style="font-size:0.8rem;">🎛️ Control Center</h3>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">' +
            '<div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:6px;text-align:center;cursor:pointer;" onclick="Notify.info(\'WLAN umgeschaltet\')"><div style="font-size:1.2rem;">📶</div><div style="font-size:0.5rem;color:#8899bb;">WLAN</div></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:6px;text-align:center;cursor:pointer;" onclick="Notify.info(\'Bluetooth umgeschaltet\')"><div style="font-size:1.2rem;">📡</div><div style="font-size:0.5rem;color:#8899bb;">Bluetooth</div></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:6px;text-align:center;cursor:pointer;" onclick="Notify.info(\'Helligkeit angepasst\')"><div style="font-size:1.2rem;">☀️</div><div style="font-size:0.5rem;color:#8899bb;">Helligkeit</div></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:6px;text-align:center;cursor:pointer;" onclick="Notify.info(\'Ton umgeschaltet\')"><div style="font-size:1.2rem;">🔊</div><div style="font-size:0.5rem;color:#8899bb;">Ton</div></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:6px;text-align:center;cursor:pointer;" onclick="Notify.info(\'Dark Mode umgeschaltet\')"><div style="font-size:1.2rem;">🌙</div><div style="font-size:0.5rem;color:#8899bb;">Dark Mode</div></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:6px;text-align:center;cursor:pointer;" onclick="location.reload();"><div style="font-size:1.2rem;">🔄</div><div style="font-size:0.5rem;color:#8899bb;">Neu laden</div></div></div>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-top:4px;">' +
            '<button onclick="launchApp(\'settings\')" class="btn-secondary" style="font-size:0.5rem;">⚙️ Einstellungen</button>' +
            '<button onclick="launchApp(\'ai\')" class="btn-secondary" style="font-size:0.5rem;">🤖 AI</button>' +
            '<button onclick="launchApp(\'cosmic\')" class="btn-secondary" style="font-size:0.5rem;">🌌 Cosmic</button></div>' +
            '<div class="section-divider">🎛️ Control Center</div></div>';
    }
});

// ----- 21. Games Center -----
registerApp('games', {
    title: 'Games Center',
    icon: '🎮',
    category: 'entertainment',
    description: 'Spiele spielen',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px;height:100%;">' +
            '<div style="font-size:2.5rem;">🎮</div>' +
            '<h3 style="font-size:0.8rem;">Games Center</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;width:100%;max-width:260px;">' +
            '<button onclick="Notify.info(\'🐍 Snake-Spiel startet...\')" class="btn-primary" style="padding:10px 6px;font-size:0.55rem;">🐍 Snake</button>' +
            '<button onclick="Notify.info(\'🧩 Tetris startet...\')" class="btn-primary" style="padding:10px 6px;font-size:0.55rem;">🧩 Tetris</button>' +
            '<button onclick="Notify.info(\'🏓 Pong startet...\')" class="btn-primary" style="padding:10px 6px;font-size:0.55rem;">🏓 Pong</button>' +
            '<button onclick="Notify.info(\'🧠 Memory-Spiel startet...\')" class="btn-primary" style="padding:10px 6px;font-size:0.55rem;">🧠 Memory</button></div>' +
            '<p style="color:#8899bb;font-size:0.5rem;text-align:center;">Weitere Spiele folgen...</p>' +
            '<div class="section-divider">🎮 Spiele</div></div>';
    }
});

// ----- 22. Help Center -----
registerApp('help', {
    title: 'Help Center',
    icon: '❓',
    category: 'system',
    description: 'Hilfe erhalten',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;gap:6px;padding:8px;height:100%;">' +
            '<h3 style="font-size:0.8rem;">❓ Help Center</h3>' +
            '<div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:6px;font-size:0.6rem;color:#8899bb;">' +
            '<b>Wie kann ich dir helfen?</b></div>' +
            '<div style="display:flex;flex-direction:column;gap:4px;">' +
            '<button onclick="Notify.info(\'📱 Öffne Apps mit: "Öffne [App-Name]"\')" class="btn-secondary" style="font-size:0.55rem;text-align:left;padding:6px 10px;">📱 Apps öffnen</button>' +
            '<button onclick="Notify.info(\'🎤 Nutze Sprachsteuerung mit dem Mikrofon-Button\')" class="btn-secondary" style="font-size:0.55rem;text-align:left;padding:6px 10px;">🎤 Sprachsteuerung</button>' +
            '<button onclick="Notify.info(\'⌨️ Shortcuts: Cmd+K für AI, Escape zum Schließen\')" class="btn-secondary" style="font-size:0.55rem;text-align:left;padding:6px 10px;">⌨️ Shortcuts</button>' +
            '<button onclick="Notify.info(\'🌍 Sprache in Einstellungen oder Sprachzentrum ändern\')" class="btn-secondary" style="font-size:0.55rem;text-align:left;padding:6px 10px;">🌍 Sprachen</button>' +
            '<button onclick="Notify.info(\'☀️ Klicke auf die Sonne im Hintergrund für AI\')" class="btn-secondary" style="font-size:0.55rem;text-align:left;padding:6px 10px;">☀️ Cosmic AI</button></div>' +
            '<div class="section-divider">❓ Hilfe</div></div>';
    }
});

// ----- 23. Image Editor -----
registerApp('imageeditor', {
    title: 'Bildbearbeitung',
    icon: '🎨',
    category: 'creative',
    description: 'Bilder bearbeiten',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px;height:100%;">' +
            '<div style="font-size:2.5rem;">🎨</div>' +
            '<h3 style="font-size:0.8rem;">Bildbearbeitung</h3>' +
            '<div style="width:100%;max-width:200px;aspect-ratio:1;background:rgba(255,255,255,0.03);border-radius:8px;display:flex;align-items:center;justify-content:center;border:2px dashed rgba(255,255,255,0.06);position:relative;overflow:hidden;" id="image-preview">' +
            '<span style="font-size:2rem;opacity:0.3;">🖼️</span></div>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;">' +
            '<input type="file" id="image-upload" accept="image/*" style="display:none;" />' +
            '<button id="image-upload-btn" class="btn-primary" style="font-size:0.55rem;">📤 Hochladen</button>' +
            '<button id="image-grayscale" class="btn-secondary" style="font-size:0.55rem;">⚫ Graustufen</button>' +
            '<button id="image-brighten" class="btn-secondary" style="font-size:0.55rem;">☀️ Aufhellen</button>' +
            '<button id="image-reset" class="btn-secondary" style="font-size:0.55rem;">↺ Zurücksetzen</button></div>' +
            '<div id="image-status" style="font-size:0.5rem;color:#8899bb;text-align:center;min-height:16px;"></div>' +
            '<div class="section-divider">🎨 Bildbearbeitung</div></div>';

        var preview = body.querySelector('#image-preview');
        var uploadBtn = body.querySelector('#image-upload-btn');
        var fileInput = body.querySelector('#image-upload');
        var statusEl = body.querySelector('#image-status');
        var currentImage = null;
        var originalImage = null;

        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });

        fileInput.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(ev) {
                var img = document.createElement('img');
                img.src = ev.target.result;
                img.style.cssText =
                    'max-width:100%;max-height:100%;object-fit:contain;border-radius:6px;';
                preview.innerHTML = '';
                preview.appendChild(img);
                currentImage = ev.target.result;
                originalImage = ev.target.result;
                statusEl.textContent = '✅ Bild geladen';
            };
            reader.readAsDataURL(file);
        });

        body.querySelector('#image-grayscale').addEventListener('click', function() {
            if (!currentImage) {
                statusEl.textContent = '⚠️ Bild zuerst hochladen';
                return;
            }
            var img = preview.querySelector('img');
            if (img) {
                var canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || 200;
                canvas.height = img.naturalHeight || 200;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var data = imageData.data;
                for (var i = 0; i < data.length; i += 4) {
                    var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg;
                    data[i + 1] = avg;
                    data[i + 2] = avg;
                }
                ctx.putImageData(imageData, 0, 0);
                img.src = canvas.toDataURL('image/png');
                currentImage = img.src;
                statusEl.textContent = '✅ Graustufen angewendet';
            }
        });

        body.querySelector('#image-brighten').addEventListener('click', function() {
            if (!currentImage) {
                statusEl.textContent = '⚠️ Bild zuerst hochladen';
                return;
            }
            var img = preview.querySelector('img');
            if (img) {
                var canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || 200;
                canvas.height = img.naturalHeight || 200;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var data = imageData.data;
                for (var i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] + 30);
                    data[i + 1] = Math.min(255, data[i + 1] + 30);
                    data[i + 2] = Math.min(255, data[i + 2] + 30);
                }
                ctx.putImageData(imageData, 0, 0);
                img.src = canvas.toDataURL('image/png');
                currentImage = img.src;
                statusEl.textContent = '✅ Aufgehellt';
            }
        });

        body.querySelector('#image-reset').addEventListener('click', function() {
            if (originalImage) {
                var img = preview.querySelector('img');
                if (img) {
                    img.src = originalImage;
                    currentImage = originalImage;
                    statusEl.textContent = '↺ Auf Original zurückgesetzt';
                }
            } else {
                preview.innerHTML = '<span style="font-size:2rem;opacity:0.3;">🖼️</span>';
                currentImage = null;
                statusEl.textContent = '';
            }
        });

        preview.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#00d4ff';
        });

        preview.addEventListener('dragleave', function(e) {
            this.style.borderColor = 'rgba(255,255,255,0.06)';
        });

        preview.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = 'rgba(255,255,255,0.06)';
            var files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                var reader = new FileReader();
                reader.onload = function(ev) {
                    var img = document.createElement('img');
                    img.src = ev.target.result;
                    img.style.cssText =
                        'max-width:100%;max-height:100%;object-fit:contain;border-radius:6px;';
                    preview.innerHTML = '';
                    preview.appendChild(img);
                    currentImage = ev.target.result;
                    originalImage = ev.target.result;
                    statusEl.textContent = '✅ Bild geladen';
                };
                reader.readAsDataURL(files[0]);
            }
        });
    }
});

// ----- 24. Journal / Tagebuch -----
registerApp('journal', {
    title: 'Tagebuch',
    icon: '📖',
    category: 'productivity',
    description: 'Persönliches Tagebuch',
    render: function(body) {
        var entries = JSON.parse(localStorage.getItem('haldo_journal') || '[]');

        function renderJournal() {
            var html =
                '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
                '<h3 style="font-size:0.8rem;">📖 Tagebuch</h3>' +
                '<textarea id="journal-entry" placeholder="📝 Schreibe deine Gedanken..." style="flex:1;min-height:60px;padding:6px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#fff;font-size:0.65rem;resize:none;outline:none;"></textarea>' +
                '<div style="display:flex;gap:4px;">' +
                '<button id="journal-save" class="btn-primary" style="font-size:0.55rem;">💾 Speichern</button>' +
                '<button id="journal-clear" class="btn-secondary" style="font-size:0.55rem;">🗑️ Löschen</button></div>' +
                '<div id="journal-entries" style="flex:1;overflow-y:auto;max-height:100px;font-size:0.55rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">';

            if (entries.length === 0) {
                html += '<div style="color:#556688;text-align:center;padding:8px 0;">📭 Keine Einträge</div>';
            } else {
                for (var i = entries.length - 1; i >= 0; i--) {
                    var e = entries[i];
                    html +=
                        '<div style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                        '<div style="font-size:0.45rem;color:#556688;">' + e.date + ' ' + e
                        .time + '</div>' +
                        '<div>' + e.text + '</div></div>';
                }
            }

            html += '</div>' +
                '<div class="section-divider">📖 Tagebuch</div></div>';

            body.innerHTML = html;

            var textarea = body.querySelector('#journal-entry');
            var saveBtn = body.querySelector('#journal-save');
            var clearBtn = body.querySelector('#journal-clear');

            saveBtn.addEventListener('click', function() {
                var text = textarea.value.trim();
                if (!text) return;
                var now = new Date();
                entries.push({
                    text: text,
                    date: now.toLocaleDateString('de-DE'),
                    time: now.toLocaleTimeString('de-DE', { hour: '2-digit',
                        minute: '2-digit' }),
                    timestamp: now.toISOString()
                });
                localStorage.setItem('haldo_journal', JSON.stringify(entries));
                textarea.value = '';
                renderJournal();
                Notify.success('📖 Eintrag gespeichert');
            });

            clearBtn.addEventListener('click', function() {
                if (confirm('Alle Einträge löschen?')) {
                    entries = [];
                    localStorage.setItem('haldo_journal', JSON.stringify(entries));
                    renderJournal();
                    Notify.info('📖 Alle Einträge gelöscht');
                }
            });

            textarea.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    saveBtn.click();
                }
            });

            textarea.focus();
        }

        renderJournal();
    }
});

// ----- 25. Maps -----
registerApp('maps', {
    title: 'Karten',
    icon: '🗺️',
    category: 'tools',
    description: 'Interaktive Karten',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🗺️ Karten</h3>' +
            '<div style="display:flex;gap:4px;">' +
            '<input type="text" id="maps-search" placeholder="🔍 Ort suchen..." class="input-field" style="font-size:0.6rem;" value="Berlin" />' +
            '<button id="maps-go" class="btn-primary" style="font-size:0.55rem;">Suchen</button></div>' +
            '<div style="flex:1;min-height:120px;background:rgba(0,0,0,0.2);border-radius:6px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;" id="maps-container">' +
            '<div style="text-align:center;color:#8899bb;font-size:0.6rem;">' +
            '<div style="font-size:2rem;">🗺️</div>Kartenansicht</div></div>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap;font-size:0.4rem;color:#556688;">' +
            '<span>📍 OpenStreetMap</span>' +
            '<span style="margin-left:auto;">Satellitenansicht</span></div>' +
            '<div class="section-divider">🗺️ Karten</div></div>';

        var searchInput = body.querySelector('#maps-search');
        var goBtn = body.querySelector('#maps-go');

        var locations = {
            'berlin': { lat: '52.5200', lon: '13.4050', zoom: '12' },
            'paris': { lat: '48.8566', lon: '2.3522', zoom: '12' },
            'london': { lat: '51.5074', lon: '-0.1278', zoom: '12' },
            'new york': { lat: '40.7128', lon: '-74.0060', zoom: '12' },
            'tokyo': { lat: '35.6762', lon: '139.6503', zoom: '12' }
        };

        function showMap(query) {
            var container = body.querySelector('#maps-container');
            var lowerQuery = query.toLowerCase();

            var loc = locations[lowerQuery] || null;
            if (!loc) {
                for (var key in locations) {
                    if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
                        loc = locations[key];
                        break;
                    }
                }
            }

            if (loc) {
                var iframe = document.createElement('iframe');
                iframe.src = 'https://www.openstreetmap.org/export/embed.html?bbox=' +
                    (parseFloat(loc.lon) - 0.05) + '%2C' +
                    (parseFloat(loc.lat) - 0.05) + '%2C' +
                    (parseFloat(loc.lon) + 0.05) + '%2C' +
                    (parseFloat(loc.lat) + 0.05) +
                    '&layer=mapnik&marker=' + loc.lat + '%2C' + loc.lon;
                iframe.style.cssText =
                    'position:absolute;inset:0;width:100%;height:100%;border:none;background:#fff;';
                container.innerHTML = '';
                container.appendChild(iframe);
            } else {
                var iframe = document.createElement('iframe');
                iframe.src = 'https://www.google.com/maps?q=' + encodeURIComponent(query) +
                    '&output=embed';
                iframe.style.cssText =
                    'position:absolute;inset:0;width:100%;height:100%;border:none;background:#fff;';
                container.innerHTML = '';
                container.appendChild(iframe);
            }
        }

        goBtn.addEventListener('click', function() {
            var query = searchInput.value.trim();
            if (!query) return;
            showMap(query);
        });

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') goBtn.click();
        });

        showMap('Berlin');
    }
});

// ----- 26. Music -----
registerApp('music', {
    title: 'Musik',
    icon: '🎵',
    category: 'media',
    description: 'Musik-Player',
    render: function(body) {
        var playlist = [
            { title: 'Summer Breeze', artist: 'Jazz Ensemble', duration: '3:45' },
            { title: 'Electric Dreams', artist: 'Synthwave', duration: '4:12' },
            { title: 'Acoustic Sunset', artist: 'Guitar & Piano', duration: '3:28' },
            { title: 'Chill Beats', artist: 'Lo-Fi', duration: '5:01' },
            { title: 'Classical Harmony', artist: 'Orchestra', duration: '4:33' }
        ];
        var currentTrack = 0;
        var isPlaying = false;

        function renderMusic() {
            var html =
                '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px;height:100%;">' +
                '<div style="font-size:2.5rem;">🎵</div>' +
                '<div style="text-align:center;">' +
                '<div style="font-weight:700;font-size:0.8rem;" id="music-title">' + playlist[
                    currentTrack].title + '</div>' +
                '<div style="font-size:0.6rem;color:#8899bb;" id="music-artist">' + playlist[
                    currentTrack].artist + '</div></div>' +
                '<div style="display:flex;gap:12px;">' +
                '<button id="music-prev" style="background:none;border:none;color:#8899bb;font-size:1.2rem;cursor:pointer;">⏮️</button>' +
                '<button id="music-play" style="background:linear-gradient(135deg,#00d4ff,#7b2ffc);border:none;border-radius:50%;width:44px;height:44px;font-size:1.2rem;cursor:pointer;color:#fff;">▶️</button>' +
                '<button id="music-next" style="background:none;border:none;color:#8899bb;font-size:1.2rem;cursor:pointer;">⏭️</button></div>' +
                '<div style="width:100%;max-width:200px;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;">' +
                '<div style="width:0%;height:100%;background:linear-gradient(90deg,#00d4ff,#7b2ffc);border-radius:2px;transition:width 0.3s;" id="music-progress"></div></div>' +
                '<div style="font-size:0.5rem;color:#8899bb;" id="music-duration">' + playlist[
                    currentTrack].duration +
                '</div>' +
                '<div style="display:flex;flex-direction:column;gap:2px;width:100%;max-height:80px;overflow-y:auto;font-size:0.5rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">';

            for (var i = 0; i < playlist.length; i++) {
                var active = i === currentTrack ? 'color:#00d4ff;font-weight:700;' : '';
                html +=
                    '<div style="display:flex;justify-content:space-between;padding:2px 4px;cursor:pointer;' +
                    active +
                    '" class="music-track" data-index="' + i +
                    '"><span>' + playlist[i].title +
                    '</span><span style="color:#556688;">' + playlist[i].duration +
                    '</span></div>';
            }

            html += '</div></div>';
            body.innerHTML = html;

            var playBtn = body.querySelector('#music-play');
            var prevBtn = body.querySelector('#music-prev');
            var nextBtn = body.querySelector('#music-next');
            var progress = body.querySelector('#music-progress');
            var progressInterval = null;

            function updateTrack(index) {
                currentTrack = index;
                var title = body.querySelector('#music-title');
                var artist = body.querySelector('#music-artist');
                var duration = body.querySelector('#music-duration');
                if (title) title.textContent = playlist[currentTrack].title;
                if (artist) artist.textContent = playlist[currentTrack].artist;
                if (duration) duration.textContent = playlist[currentTrack].duration;
                if (progress) progress.style.width = '0%';
                body.querySelectorAll('.music-track').forEach(function(el, idx) {
                    if (idx === currentTrack) {
                        el.style.color = '#00d4ff';
                        el.style.fontWeight = '700';
                    } else {
                        el.style.color = '#8899bb';
                        el.style.fontWeight = '400';
                    }
                });
                isPlaying = false;
                if (playBtn) playBtn.textContent = '▶️';
                if (progressInterval) {
                    clearInterval(progressInterval);
                    progressInterval = null;
                }
            }

            playBtn.addEventListener('click', function() {
                isPlaying = !isPlaying;
                playBtn.textContent = isPlaying ? '⏸️' : '▶️';
                if (isPlaying) {
                    var durationParts = playlist[currentTrack].duration.split(':');
                    var totalSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[
                    1]);
                    var elapsed = 0;
                    progressInterval = setInterval(function() {
                        elapsed += 0.1;
                        var pct = Math.min(100, (elapsed / totalSeconds) * 100);
                        if (progress) progress.style.width = pct + '%';
                        if (pct >= 100) {
                            clearInterval(progressInterval);
                            progressInterval = null;
                            isPlaying = false;
                            if (playBtn) playBtn.textContent = '▶️';
                            var nextIdx = (currentTrack + 1) % playlist.length;
                            updateTrack(nextIdx);
                        }
                    }, 100);
                } else {
                    if (progressInterval) {
                        clearInterval(progressInterval);
                        progressInterval = null;
                    }
                }
            });

            prevBtn.addEventListener('click', function() {
                var prevIdx = (currentTrack - 1 + playlist.length) % playlist.length;
                updateTrack(prevIdx);
            });

            nextBtn.addEventListener('click', function() {
                var nextIdx = (currentTrack + 1) % playlist.length;
                updateTrack(nextIdx);
            });

            body.querySelectorAll('.music-track').forEach(function(el) {
                el.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.index);
                    updateTrack(idx);
                });
            });

            updateTrack(currentTrack);
        }

        renderMusic();
    }
});

// ----- 27. Notification Center -----
registerApp('notifications', {
    title: 'Benachrichtigungen',
    icon: '🔔',
    category: 'system',
    description: 'Benachrichtigungen verwalten',
    render: function(body) {
        var notifs = JSON.parse(localStorage.getItem('haldo_notifications') || '[]');

        function renderNotifications() {
            var html =
                '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
                '<h3 style="font-size:0.8rem;">🔔 Benachrichtigungen</h3>' +
                '<div style="display:flex;gap:4px;">' +
                '<button id="notif-clear" class="btn-secondary" style="font-size:0.55rem;">🗑️ Alle löschen</button>' +
                '<button id="notif-add" class="btn-primary" style="font-size:0.55rem;">➕ Hinzufügen</button></div>' +
                '<div id="notif-list" style="flex:1;overflow-y:auto;max-height:150px;font-size:0.55rem;">';

            if (notifs.length === 0) {
                html += '<div style="color:#556688;text-align:center;padding:12px 0;">🔕 Keine Benachrichtigungen</div>';
            } else {
                for (var i = 0; i < notifs.length; i++) {
                    var n = notifs[i];
                    html +=
                        '<div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                        '<span>' + n.text + '</span>' +
                        '<span style="color:#556688;font-size:0.45rem;">' + n.time +
                        '</span>' +
                        '<button class="notif-del" data-idx="' + i +
                        '" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:0.5rem;">✕</button>' +
                        '</div>';
                }
            }

            html += '</div></div>';
            body.innerHTML = html;

            var clearBtn = body.querySelector('#notif-clear');
            var addBtn = body.querySelector('#notif-add');

            clearBtn.addEventListener('click', function() {
                if (confirm('Alle Benachrichtigungen löschen?')) {
                    notifs = [];
                    localStorage.setItem('haldo_notifications', JSON.stringify(notifs));
                    renderNotifications();
                    Notify.info('🔕 Alle Benachrichtigungen gelöscht');
                }
            });

            addBtn.addEventListener('click', function() {
                var text = prompt('Benachrichtigungstext:');
                if (text) {
                    var now = new Date();
                    notifs.unshift({
                        text: text,
                        time: now.toLocaleTimeString('de-DE', { hour: '2-digit',
                            minute: '2-digit' }),
                        timestamp: now.toISOString()
                    });
                    localStorage.setItem('haldo_notifications', JSON.stringify(notifs));
                    renderNotifications();
                    Notify.success('🔔 Benachrichtigung hinzugefügt');
                }
            });

            body.querySelectorAll('.notif-del').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.idx);
                    notifs.splice(idx, 1);
                    localStorage.setItem('haldo_notifications', JSON.stringify(notifs));
                    renderNotifications();
                });
            });
        }

        renderNotifications();
    }
});

// ----- 28. PDF Viewer -----
registerApp('pdfviewer', {
    title: 'PDF Viewer',
    icon: '📕',
    category: 'office',
    description: 'PDF-Dateien anzeigen',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">📕 PDF Viewer</h3>' +
            '<div style="display:flex;gap:4px;">' +
            '<input type="file" id="pdf-upload" accept=".pdf" style="display:none;" />' +
            '<button id="pdf-upload-btn" class="btn-primary" style="font-size:0.55rem;">📤 PDF hochladen</button>' +
            '<button id="pdf-demo" class="btn-secondary" style="font-size:0.55rem;">📄 Demo</button></div>' +
            '<div id="pdf-container" style="flex:1;min-height:120px;background:rgba(0,0,0,0.15);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:#8899bb;padding:12px;">' +
            '<div style="text-align:center;"><div style="font-size:2rem;">📕</div>Kein PDF geladen</div></div>' +
            '<div class="section-divider">📕 PDF Viewer</div></div>';

        var uploadBtn = body.querySelector('#pdf-upload-btn');
        var fileInput = body.querySelector('#pdf-upload');
        var container = body.querySelector('#pdf-container');

        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });

        fileInput.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (!file) return;
            if (file.type !== 'application/pdf') {
                Notify.error('Bitte wähle eine PDF-Datei');
                return;
            }
            var reader = new FileReader();
            reader.onload = function(ev) {
                var data = ev.target.result;
                container.innerHTML =
                    '<embed src="' + data +
                    '" type="application/pdf" style="width:100%;height:100%;border:none;border-radius:6px;min-height:120px;" />';
                Notify.success('📄 PDF geladen');
            };
            reader.readAsDataURL(file);
        });

        body.querySelector('#pdf-demo').addEventListener('click', function() {
            container.innerHTML =
                '<div style="text-align:center;color:#8899bb;font-size:0.6rem;padding:20px;">' +
                '<div style="font-size:2rem;">📄</div>Demo-PDF-Inhalt<br /><span style="font-size:0.5rem;color:#556688;">Beispieldokument</span></div>';
        });
    }
});

// ----- 29. Quick Settings -----
registerApp('quicksettings', {
    title: 'Quick Settings',
    icon: '⚡',
    category: 'system',
    description: 'Schnelleinstellungen',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;gap:6px;padding:8px;height:100%;">' +
            '<h3 style="font-size:0.8rem;">⚡ Quick Settings</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
            '<button onclick="Notify.info(\'WLAN umgeschaltet\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">📶 WLAN</button>' +
            '<button onclick="Notify.info(\'Bluetooth umgeschaltet\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">📡 Bluetooth</button>' +
            '<button onclick="Notify.info(\'Helligkeit angepasst\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">☀️ Helligkeit</button>' +
            '<button onclick="Notify.info(\'Ton umgeschaltet\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">🔊 Ton</button>' +
            '<button onclick="launchApp(\'settings\')" class="btn-primary" style="font-size:0.55rem;padding:8px;grid-column:span 2;">⚙️ Alle Einstellungen</button></div>' +
            '<div class="section-divider">⚡ Quick Settings</div></div>';
    }
});

// ----- 30. Screenshot -----
registerApp('screenshot', {
    title: 'Screenshot',
    icon: '📸',
    category: 'system',
    description: 'Bildschirmfotos aufnehmen',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px;height:100%;">' +
            '<div style="font-size:2.5rem;">📸</div>' +
            '<h3 style="font-size:0.8rem;">Screenshot</h3>' +
            '<button id="screenshot-btn" class="btn-primary" style="font-size:0.6rem;padding:10px 20px;">📸 Screenshot aufnehmen</button>' +
            '<div id="screenshot-preview" style="width:100%;max-width:260px;aspect-ratio:16/9;background:rgba(255,255,255,0.03);border-radius:6px;border:1px solid rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;font-size:0.5rem;color:#8899bb;">🖼️ Vorschau</div>' +
            '<div id="screenshot-status" style="font-size:0.5rem;color:#8899bb;text-align:center;"></div>' +
            '<div class="section-divider">📸 Screenshot</div></div>';

        var btn = body.querySelector('#screenshot-btn');
        var preview = body.querySelector('#screenshot-preview');
        var status = body.querySelector('#screenshot-status');

        btn.addEventListener('click', function() {
            status.textContent = '⏳ Screenshot wird aufgenommen...';
            setTimeout(function() {
                var canvas = document.createElement('canvas');
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                var ctx = canvas.getContext('2d');
                ctx.fillStyle = '#0a0a1a';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#e8eef5';
                ctx.font = '20px system-ui';
                ctx.textAlign = 'center';
                ctx.fillText('📸 HalDo OS Screenshot',
                    canvas.width / 2, canvas.height / 2 - 20);
                ctx.fillStyle = '#8899bb';
                ctx.font = '14px system-ui';
                ctx.fillText(new Date().toLocaleString('de-DE'), canvas.width / 2, canvas
                    .height / 2 + 30);
                var img = document.createElement('img');
                img.src = canvas.toDataURL('image/png');
                img.style.cssText =
                    'max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;';
                preview.innerHTML = '';
                preview.appendChild(img);
                status.textContent = '✅ Screenshot gespeichert!';
                var link = document.createElement('a');
                link.download = 'screenshot-' + Date.now() + '.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }, 500);
        });
    }
});

// ----- 31. Search -----
registerApp('search', {
    title: 'Suche',
    icon: '🔎',
    category: 'system',
    description: 'Globale Suche',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🔎 Globale Suche</h3>' +
            '<input type="text" id="search-input" placeholder="🔍 Apps, Dateien, Kontakte durchsuchen..." class="input-field" style="font-size:0.65rem;" />' +
            '<div id="search-results" style="flex:1;overflow-y:auto;max-height:140px;font-size:0.55rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">' +
            '<div style="color:#556688;text-align:center;padding:12px 0;">💡 Tippe zum Suchen</div></div>' +
            '<div class="section-divider">🔎 Suche</div></div>';

        var input = body.querySelector('#search-input');
        var results = body.querySelector('#search-results');

        input.addEventListener('input', function() {
            var query = this.value.trim().toLowerCase();
            if (!query) {
                results.innerHTML =
                    '<div style="color:#556688;text-align:center;padding:12px 0;">💡 Tippe zum Suchen</div>';
                return;
            }

            var found = [];
            for (var key in state.apps) {
                var app = state.apps[key];
                if (app.title.toLowerCase().includes(query) || app.id.toLowerCase().includes(
                    query)) {
                    found.push({ type: 'app', title: app.title, icon: app.icon, id: app.id });
                }
            }
            var notes = state.notes || [];
            for (var i = 0; i < notes.length; i++) {
                if (notes[i].toLowerCase().includes(query)) {
                    found.push({ type: 'note', title: notes[i].substring(0, 40) + '...',
                    icon: '📝' });
                }
            }
            var contacts = state.contacts || [];
            for (var i = 0; i < contacts.length; i++) {
                if (contacts[i].toLowerCase().includes(query)) {
                    found.push({ type: 'contact', title: contacts[i], icon: '👤' });
                }
            }

            results.innerHTML = '';
            if (found.length === 0) {
                results.innerHTML =
                    '<div style="color:#556688;text-align:center;padding:12px 0;">🔍 Keine Ergebnisse</div>';
                return;
            }

            for (var i = 0; i < Math.min(found.length, 10); i++) {
                var item = found[i];
                var div = document.createElement('div');
                div.style.cssText =
                    'display:flex;align-items:center;gap:6px;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);cursor:pointer;';
                div.innerHTML = '<span>' + item.icon + '</span><span>' + item.title +
                    '</span>';
                if (item.type === 'app') {
                    div.addEventListener('click', function() {
                        launchApp(item.id);
                    });
                }
                results.appendChild(div);
            }
        });
    }
});

// ----- 32. System Information -----
registerApp('sysinfo', {
    title: 'System Info',
    icon: 'ℹ️',
    category: 'system',
    description: 'Systeminformationen',
    render: function(body) {
        var uptime = Math.floor((now() - state.system.started) / 1000);
        var hours = Math.floor(uptime / 3600);
        var minutes = Math.floor((uptime % 3600) / 60);
        var seconds = uptime % 60;

        body.innerHTML =
            '<div style="display:flex;flex-direction:column;gap:4px;padding:8px;height:100%;">' +
            '<h3 style="font-size:0.8rem;">ℹ️ System Info</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:0.6rem;">' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;"><span style="color:#8899bb;">Version</span><br /><b>' +
            CONFIG.version + '</b></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;"><span style="color:#8899bb;">Build</span><br /><b>' +
            CONFIG.build + '</b></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;"><span style="color:#8899bb;">Kernel</span><br /><b>' +
            CONFIG.kernel + '</b></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;"><span style="color:#8899bb;">Apps</span><br /><b>' +
            Object.keys(state.apps).length + '</b></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;grid-column:span 2;"><span style="color:#8899bb;">Laufzeit</span><br /><b>' +
            hours + 'h ' + minutes + 'm ' + seconds + 's</b></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;grid-column:span 2;"><span style="color:#8899bb;">App-Starts</span><br /><b>' +
            state.system.appLaunches + '</b></div></div>' +
            '<div class="section-divider">ℹ️ System Info</div></div>';
    }
});

// ----- 33. Terminal -----
registerApp('terminal', {
    title: 'Terminal',
    icon: '⌨️',
    category: 'tools',
    description: 'Kommandozeile',
    render: function(body) {
        var history = [];
        var historyIndex = -1;

        function renderTerminal() {
            var html =
                '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
                '<div style="display:flex;gap:4px;align-items:center;border-bottom:1px solid rgba(255,255,255,0.04);padding-bottom:4px;">' +
                '<span style="font-size:0.7rem;">⌨️</span>' +
                '<span style="font-size:0.55rem;color:#8899bb;">Terminal</span>' +
                '<span style="font-size:0.45rem;color:#556688;margin-left:auto;">Bereit</span></div>' +
                '<div id="terminal-output" style="flex:1;overflow-y:auto;font-family:monospace;font-size:0.55rem;color:#44ff88;background:rgba(0,0,0,0.3);padding:4px;border-radius:4px;max-height:140px;min-height:60px;">' +
                '<div>HalDo OS Terminal v' + CONFIG.version + '</div>' +
                '<div style="color:#8899bb;">Tippe "help" für Befehle</div></div>' +
                '<div style="display:flex;gap:4px;align-items:center;">' +
                '<span style="font-size:0.6rem;color:#44ff88;">$</span>' +
                '<input type="text" id="terminal-input" placeholder="Befehl eingeben..." class="input-field" style="font-size:0.6rem;flex:1;" />' +
                '<button id="terminal-run" class="btn-primary" style="font-size:0.5rem;">Ausführen</button></div></div>';

            body.innerHTML = html;

            var output = body.querySelector('#terminal-output');
            var input = body.querySelector('#terminal-input');
            var runBtn = body.querySelector('#terminal-run');

            function addLine(text, type) {
                var div = document.createElement('div');
                div.style.cssText = 'padding:1px 0;' + (type === 'error' ?
                    'color:#ff4444;' : type === 'success' ?
                    'color:#44ff88;' : 'color:#e8eef5;');
                div.textContent = text;
                output.appendChild(div);
                output.scrollTop = output.scrollHeight;
            }

            function executeCommand(cmd) {
                var trimmed = cmd.trim();
                if (!trimmed) return;
                history.push(trimmed);
                historyIndex = history.length;
                addLine('$ ' + trimmed);

                var parts = trimmed.split(' ');
                var command = parts[0].toLowerCase();

                switch (command) {
                    case 'help':
                        addLine('📖 Verfügbare Befehle:');
                        addLine('  help - Diese Hilfe anzeigen');
                        addLine('  apps - Alle Apps auflisten');
                        addLine('  open [app] - Eine App öffnen');
                        addLine('  notes - Notizen auflisten');
                        addLine('  tasks - Aufgaben auflisten');
                        addLine('  clear - Terminal leeren');
                        addLine('  echo [text] - Text ausgeben');
                        addLine('  date - Aktuelles Datum anzeigen');
                        addLine('  version - Version anzeigen');
                        break;
                    case 'apps':
                        var appList = Object.keys(state.apps).map(function(k) {
                            return state.apps[k].title;
                        }).join(', ');
                        addLine('📱 Apps: ' + appList);
                        break;
                    case 'open':
                        if (parts.length < 2) {
                            addLine('⚠️ Verwendung: open [App-Name]', 'error');
                        } else {
                            var appName = parts.slice(1).join(' ');
                            var found = false;
                            for (var key in state.apps) {
                                if (state.apps[key].title.toLowerCase() === appName
                                    .toLowerCase() || key.toLowerCase() === appName
                                    .toLowerCase()) {
                                    launchApp(key);
                                    addLine('✅ Öffne ' + state.apps[key].title,
                                    'success');
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                addLine('❌ App nicht gefunden: ' + appName, 'error');
                            }
                        }
                        break;
                    case 'notes':
                        var notes = state.notes || [];
                        if (notes.length === 0) {
                            addLine('📭 Keine Notizen');
                        } else {
                            addLine('📝 Notizen:');
                            for (var i = 0; i < notes.length; i++) {
                                addLine('  ' + (i + 1) + '. ' + notes[i]);
                            }
                        }
                        break;
                    case 'tasks':
                        var tasks = state.tasks || [];
                        if (tasks.length === 0) {
                            addLine('📭 Keine Aufgaben');
                        } else {
                            addLine('✅ Aufgaben:');
                            for (var i = 0; i < tasks.length; i++) {
                                addLine('  ' + (i + 1) + '. ' + (tasks[i].done ? '✅' :
                                    '⬜') + ' ' + tasks[i].text);
                            }
                        }
                        break;
                    case 'clear':
                        output.innerHTML = '';
                        break;
                    case 'echo':
                        addLine(parts.slice(1).join(' ') || '');
                        break;
                    case 'date':
                        addLine('📅 ' + new Date().toLocaleString('de-DE'));
                        break;
                    case 'version':
                        addLine('🔧 HalDo OS ' + CONFIG.version + ' (Build ' + CONFIG
                            .build + ')');
                        break;
                    default:
                        addLine('❌ Unbekannter Befehl: ' + command, 'error');
                        break;
                }
            }

            runBtn.addEventListener('click', function() {
                var cmd = input.value;
                executeCommand(cmd);
                input.value = '';
            });

            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    runBtn.click();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (history.length > 0) {
                        historyIndex = Math.max(0, historyIndex - 1);
                        input.value = history[historyIndex] || '';
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (historyIndex < history.length - 1) {
                        historyIndex++;
                        input.value = history[historyIndex] || '';
                    } else {
                        historyIndex = history.length;
                        input.value = '';
                    }
                }
            });

            input.focus();
        }

        renderTerminal();
    }
});

// ----- 34. Theme Center -----
registerApp('theme', {
    title: 'Theme Center',
    icon: '🎨',
    category: 'system',
    description: 'Themes anpassen',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;gap:6px;padding:8px;height:100%;">' +
            '<h3 style="font-size:0.8rem;">🎨 Theme Center</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
            '<button onclick="changeTheme(\'dark\')" class="btn-primary" style="font-size:0.55rem;padding:8px;">🌙 Dark</button>' +
            '<button onclick="changeTheme(\'light\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">☀️ Light</button>' +
            '<button onclick="changeTheme(\'cosmic\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;grid-column:span 2;">🌌 Cosmic</button></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;font-size:0.55rem;color:#8899bb;">Aktuelles Theme: <b id="current-theme-display">' +
            state.settings.theme + '</b></div>' +
            '<div class="section-divider">🎨 Theme Center</div></div>';

        window.changeTheme = function(theme) {
            state.settings.theme = theme;
            localStorage.setItem('haldo_settings', JSON.stringify(state.settings));
            var display = body.querySelector('#current-theme-display');
            if (display) display.textContent = theme;

            if (theme === 'light') {
                document.documentElement.style.setProperty('--bg-primary', '#f0f2f8');
                document.documentElement.style.setProperty('--bg-secondary', '#e8ecf4');
                document.documentElement.style.setProperty('--bg-window', 'rgba(240,242,248,0.94)');
                document.documentElement.style.setProperty('--text-primary', '#1a1a2e');
                document.documentElement.style.setProperty('--text-secondary', '#556688');
                document.documentElement.style.setProperty('--border-color', 'rgba(0,0,0,0.06)');
            } else if (theme === 'cosmic') {
                document.documentElement.style.setProperty('--bg-primary', '#0a0515');
                document.documentElement.style.setProperty('--bg-secondary', '#150a2a');
                document.documentElement.style.setProperty('--bg-window', 'rgba(10,5,21,0.94)');
                document.documentElement.style.setProperty('--text-primary', '#e8d5ff');
                document.documentElement.style.setProperty('--text-secondary', '#9a77c4');
                document.documentElement.style.setProperty('--border-color', 'rgba(123,47,252,0.2)');
            } else {
                document.documentElement.style.setProperty('--bg-primary', '#0a0a1a');
                document.documentElement.style.setProperty('--bg-secondary', '#12122a');
                document.documentElement.style.setProperty('--bg-window', 'rgba(16,16,40,0.94)');
                document.documentElement.style.setProperty('--text-primary', '#e8eef5');
                document.documentElement.style.setProperty('--text-secondary', '#8899bb');
                document.documentElement.style.setProperty('--border-color', 'rgba(255,255,255,0.06)');
            }
            Notify.success('🎨 Theme geändert zu ' + theme);
        };
    }
});

// ----- 35. Wetter -----
registerApp('weather', {
    title: 'Wetter',
    icon: '🌦️',
    category: 'info',
    description: 'Wettervorhersage',
    render: function(body) {
        var cities = [
            { name: 'Berlin', temp: '18°C', condition: '☀️', humidity: '65%' },
            { name: 'London', temp: '15°C', condition: '⛅', humidity: '78%' },
            { name: 'Paris', temp: '20°C', condition: '☀️', humidity: '55%' },
            { name: 'New York', temp: '22°C', condition: '🌤️', humidity: '60%' },
            { name: 'Tokyo', temp: '25°C', condition: '☀️', humidity: '70%' }
        ];

        var html =
            '<div style="display:flex;flex-direction:column;gap:4px;padding:8px;height:100%;">' +
            '<h3 style="font-size:0.8rem;">🌦️ Wetter</h3>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap;">' +
            '<input type="text" id="weather-city" placeholder="🔍 Stadt suchen..." class="input-field" style="font-size:0.6rem;flex:1;" value="Berlin" />' +
            '<button id="weather-search" class="btn-primary" style="font-size:0.5rem;">Suchen</button></div>' +
            '<div id="weather-display" style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:4px;max-height:140px;overflow-y:auto;">';

        for (var i = 0; i < cities.length; i++) {
            var c = cities[i];
            html +=
                '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;text-align:center;">' +
                '<div style="font-size:1.2rem;">' + c.condition + '</div>' +
                '<div style="font-size:0.65rem;font-weight:700;">' + c.name + '</div>' +
                '<div style="font-size:0.55rem;color:#8899bb;">' + c.temp + '</div>' +
                '<div style="font-size:0.4rem;color:#556688;">' + c.humidity +
                '</div></div>';
        }

        html += '</div><div class="section-divider">🌦️ Wetter</div></div>';

        body.innerHTML = html;

        var searchBtn = body.querySelector('#weather-search');
        var input = body.querySelector('#weather-city');
        var display = body.querySelector('#weather-display');

        searchBtn.addEventListener('click', function() {
            var city = input.value.trim();
            if (!city) return;
            var conditions = ['☀️', '⛅', '🌤️', '🌧️', '❄️', '🌪️'];
            var temps = ['12°C', '15°C', '18°C', '20°C', '22°C', '25°C', '28°C', '30°C'];
            var humidities = ['45%', '55%', '60%', '65%', '70%', '75%', '80%'];
            display.innerHTML =
                '<div style="background:rgba(255,255,255,0.03);padding:12px;border-radius:4px;text-align:center;grid-column:span 2;">' +
                '<div style="font-size:2rem;">' + conditions[Math.floor(Math.random() *
                    conditions.length)] +
                '</div>' +
                '<div style="font-size:0.8rem;font-weight:700;">' + city + '</div>' +
                '<div style="font-size:0.65rem;color:#8899bb;">' + temps[Math.floor(Math
                    .random() * temps.length)] +
                '</div>' +
                '<div style="font-size:0.5rem;color:#556688;">Luftfeuchtigkeit: ' + humidities[
                    Math.floor(Math.random() * humidities.length)] +
                '</div>' +
                '<div style="font-size:0.4rem;color:#556688;margin-top:4px;">Zuletzt aktualisiert: ' +
                new Date().toLocaleTimeString('de-DE') +
                '</div></div>';
        });
    }
});

// ----- 36. Web Search -----
registerApp('websearch', {
    title: 'Websuche',
    icon: '🔍',
    category: 'tools',
    description: 'Im Internet suchen',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🔍 Websuche</h3>' +
            '<div style="display:flex;gap:4px;">' +
            '<input type="text" id="websearch-input" placeholder="🔍 Im Internet suchen..." class="input-field" style="font-size:0.6rem;" value="HalDo AI" />' +
            '<button id="websearch-btn" class="btn-primary" style="font-size:0.55rem;">Suchen</button></div>' +
            '<iframe id="websearch-frame" src="https://www.google.com/search?igu=1" style="flex:1;border:none;border-radius:6px;background:#fff;width:100%;min-height:120px;"></iframe>' +
            '<div class="section-divider">🔍 Websuche</div></div>';

        var input = body.querySelector('#websearch-input');
        var btn = body.querySelector('#websearch-btn');
        var frame = body.querySelector('#websearch-frame');

        btn.addEventListener('click', function() {
            var query = input.value.trim();
            if (!query) return;
            frame.src = 'https://www.google.com/search?igu=1&q=' + encodeURIComponent(query);
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') btn.click();
        });
    }
});

// ----- 37. Êzîdî Keyboard -----
registerApp('ezidikeyboard', {
    title: 'Êzîdî Tastatur',
    icon: '⌨️',
    category: 'language',
    description: 'Êzîdî-Tastaturlayout',
    render: function(body) {
        var chars = ['𒀭', '𒀀', '𒀁', '𒀂', '𒀃', '𒀄', '𒀅', '𒀆', '𒀇', '𒀈', '𒀉', '𒀊'];
        var html =
            '<div style="display:flex;flex-direction:column;gap:6px;padding:8px;height:100%;">' +
            '<h3 style="font-size:0.8rem;">⌨️ Êzîdî Tastatur</h3>' +
            '<textarea id="ezidi-output" placeholder="📝 Mit Êzîdî-Tastatur schreiben..." style="flex:1;min-height:50px;padding:6px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#fff;font-size:0.7rem;resize:none;outline:none;"></textarea>' +
            '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;">';

        for (var i = 0; i < chars.length; i++) {
            html +=
                '<button class="ezidi-char" style="padding:8px;font-size:1.2rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.04);border-radius:4px;color:#fff;cursor:pointer;transition:background 0.2s;">' +
                chars[i] + '</button>';
        }

        html += '</div>' +
            '<div style="display:flex;gap:4px;">' +
            '<button id="ezidi-copy" class="btn-primary" style="font-size:0.55rem;">📋 Kopieren</button>' +
            '<button id="ezidi-clear" class="btn-secondary" style="font-size:0.55rem;">🗑️ Löschen</button></div>' +
            '<div class="section-divider">⌨️ Êzîdî Tastatur</div></div>';

        body.innerHTML = html;

        var output = body.querySelector('#ezidi-output');
        var copyBtn = body.querySelector('#ezidi-copy');
        var clearBtn = body.querySelector('#ezidi-clear');

        body.querySelectorAll('.ezidi-char').forEach(function(btn) {
            btn.addEventListener('click', function() {
                output.value += this.textContent;
                output.focus();
            });
            btn.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255,255,255,0.06)';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(255,255,255,0.03)';
            });
        });

        copyBtn.addEventListener('click', function() {
            if (output.value) {
                navigator.clipboard.writeText(output.value).then(function() {
                    Notify.success('📋 Kopiert!');
                });
            }
        });

        clearBtn.addEventListener('click', function() {
            output.value = '';
        });
    }
});

// ----- 38. Übersetzung -----
registerApp('translation', {
    title: 'Übersetzung',
    icon: '🔄',
    category: 'language',
    description: 'Texte übersetzen',
    render: function(body) {
        var examples = {
            'de': 'Hallo, wie geht es dir?',
            'en': 'Hello, how are you?',
            'ku': 'Silav, tu çawanî?',
            'tr': 'Merhaba, nasılsın?',
            'fr': 'Bonjour, comment allez-vous?',
            'es': 'Hola, ¿cómo estás?'
        };

        var targetLangs = [
            { code: 'en', name: 'English' },
            { code: 'de', name: 'Deutsch' },
            { code: 'ku', name: 'Kurmancî' },
            { code: 'tr', name: 'Türkçe' },
            { code: 'fr', name: 'Français' },
            { code: 'es', name: 'Español' }
        ];

        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🔄 Übersetzung</h3>' +
            '<div style="display:flex;gap:4px;">' +
            '<select id="translation-from" style="padding:4px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:4px;color:#fff;font-size:0.6rem;flex:1;">';

        for (var i = 0; i < targetLangs.length; i++) {
            var lang = targetLangs[i];
            var selected = lang.code === CONFIG.language ? 'selected' : '';
            html += '<option value="' + lang.code + '" ' + selected + '>' + lang.name +
                '</option>';
        }

        html += '</select>' +
            '<span style="color:#8899bb;font-size:0.6rem;">➡️</span>' +
            '<select id="translation-to" style="padding:4px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:4px;color:#fff;font-size:0.6rem;flex:1;">';

        for (var i = 0; i < targetLangs.length; i++) {
            var lang = targetLangs[i];
            var selected = lang.code === 'en' ? 'selected' : '';
            html += '<option value="' + lang.code + '" ' + selected + '>' + lang.name +
                '</option>';
        }

        html += '</select></div>' +
            '<textarea id="translation-input" placeholder="📝 Text zum Übersetzen eingeben..." style="flex:1;min-height:50px;padding:6px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#fff;font-size:0.6rem;resize:none;outline:none;"></textarea>' +
            '<button id="translation-go" class="btn-primary" style="font-size:0.55rem;">🔄 Übersetzen</button>' +
            '<div id="translation-result" style="flex:1;min-height:40px;background:rgba(255,255,255,0.03);border-radius:6px;padding:6px;font-size:0.6rem;color:#8899bb;overflow-y:auto;">Übersetzung erscheint hier</div>' +
            '<div class="section-divider">🔄 Übersetzung</div></div>';

        var fromSelect = body.querySelector('#translation-from');
        var toSelect = body.querySelector('#translation-to');
        var input = body.querySelector('#translation-input');
        var goBtn = body.querySelector('#translation-go');
        var result = body.querySelector('#translation-result');

        goBtn.addEventListener('click', function() {
            var text = input.value.trim();
            if (!text) {
                result.textContent = '⚠️ Bitte gib Text zum Übersetzen ein';
                return;
            }
            var fromLang = fromSelect.value;
            var toLang = toSelect.value;

            var translated = '[' + toLang + '] ' + text + ' (übersetzt)';
            var demos = {
                'de': { 'en': 'Hello, how are you?', 'ku': 'Silav, tu çawanî?' },
                'en': { 'de': 'Hallo, wie geht es dir?', 'ku': 'Silav, tu çawanî?' },
                'ku': { 'de': 'Hallo, wie geht es dir?', 'en': 'Hello, how are you?' }
            };
            if (demos[fromLang] && demos[fromLang][toLang]) {
                translated = demos[fromLang][toLang];
            } else if (demos[toLang] && demos[toLang][fromLang]) {
                translated = demos[toLang][fromLang];
            }

            result.textContent = '📝 ' + translated;
            Notify.success('🔄 Übersetzt!');
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.shiftKey) {
                goBtn.click();
            }
        });

        var currentLang = CONFIG.language;
        if (examples[currentLang]) {
            input.value = examples[currentLang];
        }
    }
});

// ----- 39. AI Command Center -----
registerApp('aicommand', {
    title: 'AI Command Center',
    icon: '🎯',
    category: 'core',
    description: 'AI-Befehle steuern',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🎯 AI Command Center</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
            '<button onclick="launchApp(\'ai\')" class="btn-primary" style="font-size:0.55rem;padding:8px;">🤖 AI öffnen</button>' +
            '<button onclick="AI.clearHistory();Notify.info(\'Speicher gelöscht\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">🧠 Speicher löschen</button>' +
            '<button onclick="Notify.info(\'AI ist bereit\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">✅ Status</button>' +
            '<button onclick="launchApp(\'settings\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">⚙️ Einstellungen</button></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;font-size:0.55rem;color:#8899bb;">AI-Status: <span style="color:#44ff88;">Aktiv</span><br />Speicher: ' +
            AI.conversationHistory.length + ' Einträge</div>' +
            '<div class="section-divider">🎯 AI Command Center</div></div>';
    }
});

// ----- 40. AI Memory Center -----
registerApp('aimemory', {
    title: 'AI Memory Center',
    icon: '🧠',
    category: 'core',
    description: 'AI-Speicher verwalten',
    render: function(body) {
        var memory = state.aiMemory || [];
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🧠 AI Memory Center</h3>' +
            '<div style="display:flex;gap:4px;">' +
            '<button id="memory-add" class="btn-primary" style="font-size:0.55rem;">➕ Speichern</button>' +
            '<button id="memory-clear" class="btn-secondary" style="font-size:0.55rem;">🗑️ Alle löschen</button></div>' +
            '<div id="memory-list" style="flex:1;overflow-y:auto;max-height:120px;font-size:0.55rem;color:#8899bb;">';

        if (memory.length === 0) {
            html += '<div style="color:#556688;text-align:center;padding:12px 0;">🧠 Keine Speicher</div>';
        } else {
            for (var i = 0; i < memory.length; i++) {
                html +=
                    '<div style="display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                    '<span>' + memory[i] + '</span>' +
                    '<button class="memory-del" data-idx="' + i +
                    '" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:0.5rem;">✕</button>' +
                    '</div>';
            }
        }

        html += '</div>' +
            '<div class="section-divider">🧠 AI Memory Center</div></div>';

        body.innerHTML = html;

        var addBtn = body.querySelector('#memory-add');
        var clearBtn = body.querySelector('#memory-clear');

        function renderMemory() {
            var list = body.querySelector('#memory-list');
            list.innerHTML = '';
            if (memory.length === 0) {
                list.innerHTML =
                    '<div style="color:#556688;text-align:center;padding:12px 0;">🧠 Keine Speicher</div>';
                return;
            }
            for (var i = 0; i < memory.length; i++) {
                var div = document.createElement('div');
                div.style.cssText =
                    'display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);';
                div.innerHTML = '<span>' + memory[i] +
                    '</span><button class="memory-del" data-idx="' + i +
                    '" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:0.5rem;">✕</button>';
                list.appendChild(div);
            }
            list.querySelectorAll('.memory-del').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.idx);
                    memory.splice(idx, 1);
                    localStorage.setItem('haldo_ai_memory', JSON.stringify(memory));
                    state.aiMemory = memory;
                    renderMemory();
                });
            });
        }

        addBtn.addEventListener('click', function() {
            var text = prompt('Speicher eingeben:');
            if (text) {
                memory.push(text);
                localStorage.setItem('haldo_ai_memory', JSON.stringify(memory));
                state.aiMemory = memory;
                renderMemory();
                Notify.success('🧠 Speicher hinzugefügt');
            }
        });

        clearBtn.addEventListener('click', function() {
            if (confirm('Alle Speicher löschen?')) {
                memory = [];
                localStorage.setItem('haldo_ai_memory', JSON.stringify(memory));
                state.aiMemory = memory;
                renderMemory();
                Notify.info('🧠 Alle Speicher gelöscht');
            }
        });

        renderMemory();
    }
});

// ----- 41. AI Tools Center -----
registerApp('aitools', {
    title: 'AI Tools Center',
    icon: '🔧',
    category: 'core',
    description: 'AI-Werkzeuge & Hilfsmittel',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🔧 AI Tools Center</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
            '<button onclick="launchApp(\'ai\')" class="btn-primary" style="font-size:0.55rem;padding:8px;">🤖 Chat</button>' +
            '<button onclick="Notify.info(\'AI-Analyse gestartet\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">📊 Analysieren</button>' +
            '<button onclick="Notify.info(\'Zusammenfassung gestartet\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">📝 Zusammenfassen</button>' +
            '<button onclick="Notify.info(\'Übersetzungsmodus\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">🌍 Übersetzen</button></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;font-size:0.5rem;color:#8899bb;text-align:center;">AI-Werkzeuge bereit</div>' +
            '<div class="section-divider">🔧 AI Tools Center</div></div>';
    }
});

// ----- 42. AI Automation -----
registerApp('aiautomation', {
    title: 'AI Automation',
    icon: '⚡',
    category: 'core',
    description: 'Aufgaben mit AI automatisieren',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">⚡ AI Automation</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
            '<button onclick="Notify.info(\'Auto-Antwort aktiviert\')" class="btn-primary" style="font-size:0.55rem;padding:8px;">📧 Auto-Antwort</button>' +
            '<button onclick="Notify.info(\'Smart-Planung aktiv\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">📅 Smart-Planung</button>' +
            '<button onclick="Notify.info(\'AI-Zusammenfassungen aktiviert\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">📝 Auto-Zusammenfassung</button>' +
            '<button onclick="Notify.info(\'Benachrichtigungen automatisiert\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">🔔 Auto-Benachrichtigung</button></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;font-size:0.5rem;color:#8899bb;text-align:center;">AI-Automation aktiv</div>' +
            '<div class="section-divider">⚡ AI Automation</div></div>';
    }
});

// ----- 43. App Permissions -----
registerApp('apppermissions', {
    title: 'App-Berechtigungen',
    icon: '🔐',
    category: 'system',
    description: 'App-Berechtigungen verwalten',
    render: function(body) {
        var apps = [];
        for (var key in state.apps) {
            if (key !== 'apppermissions') {
                apps.push({ id: key, title: state.apps[key].title, icon: state.apps[key].icon });
            }
        }
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🔐 App-Berechtigungen</h3>' +
            '<div style="flex:1;overflow-y:auto;max-height:150px;font-size:0.55rem;">';

        for (var i = 0; i < Math.min(apps.length, 15); i++) {
            var a = apps[i];
            html +=
                '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                '<span>' + a.icon + ' ' + a.title + '</span>' +
                '<span style="color:#44ff88;font-size:0.45rem;">✅ Erlaubt</span></div>';
        }

        html += '</div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:4px;border-radius:4px;font-size:0.45rem;color:#8899bb;text-align:center;">Alle Apps haben Standard-Berechtigungen</div>' +
            '<div class="section-divider">🔐 App-Berechtigungen</div></div>';

        body.innerHTML = html;
    }
});

// ----- 44. App Manager -----
registerApp('appmanager', {
    title: 'App-Manager',
    icon: '📦',
    category: 'system',
    description: 'Installierte Apps verwalten',
    render: function(body) {
        var apps = [];
        for (var key in state.apps) {
            apps.push({ id: key, title: state.apps[key].title, icon: state.apps[key].icon });
        }
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">📦 App-Manager</h3>' +
            '<div style="display:flex;gap:4px;">' +
            '<span style="font-size:0.55rem;color:#8899bb;">' + apps.length +
            ' Apps installiert</span>' +
            '<span style="font-size:0.55rem;color:#8899bb;margin-left:auto;">📱 Gesamt</span></div>' +
            '<div style="flex:1;overflow-y:auto;max-height:130px;font-size:0.55rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:4px;">';

        for (var i = 0; i < Math.min(apps.length, 20); i++) {
            var a = apps[i];
            html +=
                '<div style="background:rgba(255,255,255,0.03);padding:4px;border-radius:4px;text-align:center;cursor:pointer;" onclick="launchApp(\'' +
                a.id + '\')">' +
                '<div style="font-size:1rem;">' + a.icon + '</div>' +
                '<div style="font-size:0.4rem;color:#8899bb;">' + a.title + '</div></div>';
        }

        html += '</div>' +
            '<div class="section-divider">📦 App-Manager</div></div>';

        body.innerHTML = html;
    }
});

// ----- 45. App Router -----
registerApp('approuter', {
    title: 'App-Router',
    icon: '🧭',
    category: 'system',
    description: 'Zwischen Apps navigieren',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🧭 App-Router</h3>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap;">' +
            '<button onclick="launchApp(\'ai\')" class="btn-primary" style="font-size:0.5rem;padding:4px 8px;">🤖 AI</button>' +
            '<button onclick="launchApp(\'settings\')" class="btn-secondary" style="font-size:0.5rem;padding:4px 8px;">⚙️ Settings</button>' +
            '<button onclick="launchApp(\'notes\')" class="btn-secondary" style="font-size:0.5rem;padding:4px 8px;">📝 Notes</button>' +
            '<button onclick="launchApp(\'tasks\')" class="btn-secondary" style="font-size:0.5rem;padding:4px 8px;">✅ Tasks</button>' +
            '<button onclick="launchApp(\'contacts\')" class="btn-secondary" style="font-size:0.5rem;padding:4px 8px;">👤 Contacts</button>' +
            '<button onclick="launchApp(\'email\')" class="btn-secondary" style="font-size:0.5rem;padding:4px 8px;">📧 Email</button>' +
            '<button onclick="launchApp(\'files\')" class="btn-secondary" style="font-size:0.5rem;padding:4px 8px;">📁 Files</button>' +
            '<button onclick="launchApp(\'cosmic\')" class="btn-secondary" style="font-size:0.5rem;padding:4px 8px;">🌌 Cosmic</button></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;font-size:0.5rem;color:#8899bb;text-align:center;">Klicke auf eine App zum Navigieren</div>' +
            '<div class="section-divider">🧭 App-Router</div></div>';
    }
});

// ----- 46. App Runtime -----
registerApp('appruntime', {
    title: 'App-Runtime',
    icon: '⚙️',
    category: 'system',
    description: 'App-Laufzeitinformationen',
    render: function(body) {
        var running = state.windows.length;
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">⚙️ App-Runtime</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:0.55rem;">' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;"><span style="color:#8899bb;">Laufende Apps</span><br /><b>' +
            running + '</b></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;"><span style="color:#8899bb;">Apps Gesamt</span><br /><b>' +
            Object.keys(state.apps).length + '</b></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;"><span style="color:#8899bb;">Starts</span><br /><b>' +
            state.system.appLaunches + '</b></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;"><span style="color:#8899bb;">Laufzeit</span><br /><b>' +
            Math.floor(state.system.uptime / 60) + 'm</b></div></div>' +
            '<div class="section-divider">⚙️ App-Runtime</div></div>';
    }
});

// ----- 47. Backup Center -----
registerApp('backup', {
    title: 'Backup Center',
    icon: '💿',
    category: 'system',
    description: 'Daten sichern',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">💿 Backup Center</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
            '<button id="backup-create" class="btn-primary" style="font-size:0.55rem;padding:8px;">💾 Backup erstellen</button>' +
            '<button id="backup-restore" class="btn-secondary" style="font-size:0.55rem;padding:8px;">↩️ Wiederherstellen</button></div>' +
            '<div id="backup-status" style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;font-size:0.55rem;color:#8899bb;text-align:center;">Kein Backup verfügbar</div>' +
            '<div class="section-divider">💿 Backup Center</div></div>';

        var createBtn = body.querySelector('#backup-create');
        var restoreBtn = body.querySelector('#backup-restore');
        var status = body.querySelector('#backup-status');

        createBtn.addEventListener('click', function() {
            try {
                var data = {
                    notes: state.notes,
                    contacts: state.contacts,
                    tasks: state.tasks,
                    emails: state.emails,
                    settings: state.settings,
                    aiMemory: state.aiMemory,
                    conversationHistory: AI.conversationHistory,
                    version: CONFIG.version,
                    timestamp: new Date().toISOString()
                };
                var json = JSON.stringify(data);
                var blob = new Blob([json], { type: 'application/json' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'haldo-backup-' + Date.now() + '.json';
                a.click();
                URL.revokeObjectURL(url);
                status.textContent = '✅ Backup erstellt!';
                status.style.color = '#44ff88';
            } catch (e) {
                status.textContent = '❌ Backup fehlgeschlagen';
                status.style.color = '#ff4444';
            }
        });

        restoreBtn.addEventListener('click', function() {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = function(e) {
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(ev) {
                    try {
                        var data = JSON.parse(ev.target.result);
                        if (data.notes) state.notes = data.notes;
                        if (data.contacts) state.contacts = data.contacts;
                        if (data.tasks) state.tasks = data.tasks;
                        if (data.emails) state.emails = data.emails;
                        if (data.settings) {
                            for (var key in data.settings) {
                                if (state.settings.hasOwnProperty(key)) {
                                    state.settings[key] = data.settings[key];
                                }
                            }
                        }
                        if (data.aiMemory) state.aiMemory = data.aiMemory;
                        if (data.conversationHistory) AI.conversationHistory = data
                            .conversationHistory;
                        localStorage.setItem('haldo_notes', JSON.stringify(state
                        .notes));
                        localStorage.setItem('haldo_contacts', JSON.stringify(state
                            .contacts));
                        localStorage.setItem('haldo_tasks', JSON.stringify(state
                            .tasks));
                        localStorage.setItem('haldo_emails', JSON.stringify(state
                            .emails));
                        localStorage.setItem('haldo_settings', JSON.stringify(state
                            .settings));
                        localStorage.setItem('haldo_ai_memory', JSON.stringify(state
                            .aiMemory));
                        localStorage.setItem('haldo_conversations', JSON.stringify(AI
                            .conversationHistory));
                        status.textContent = '✅ Erfolgreich wiederhergestellt!';
                        status.style.color = '#44ff88';
                        Notify.success('💿 Backup wiederhergestellt!');
                    } catch (err) {
                        status.textContent = '❌ Ungültige Backup-Datei';
                        status.style.color = '#ff4444';
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        });
    }
});

// ----- 48. Documents -----
registerApp('documents', {
    title: 'Dokumente',
    icon: '📄',
    category: 'office',
    description: 'Dokumente verwalten',
    render: function(body) {
        var docs = state.documents || [];
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">📄 Dokumente</h3>' +
            '<div style="display:flex;gap:4px;">' +
            '<input type="text" id="doc-input" placeholder="📝 Neues Dokument..." class="input-field" style="font-size:0.55rem;" />' +
            '<button id="doc-add" class="btn-primary" style="font-size:0.5rem;">➕</button></div>' +
            '<div id="doc-list" style="flex:1;overflow-y:auto;max-height:120px;font-size:0.55rem;">';

        if (docs.length === 0) {
            html += '<div style="color:#556688;text-align:center;padding:12px 0;">📄 Keine Dokumente</div>';
        } else {
            for (var i = 0; i < docs.length; i++) {
                html +=
                    '<div style="display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                    '<span>📄 ' + docs[i] + '</span>' +
                    '<button class="doc-del" data-idx="' + i +
                    '" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:0.5rem;">✕</button>' +
                    '</div>';
            }
        }

        html += '</div>' +
            '<div class="section-divider">📄 Dokumente</div></div>';

        body.innerHTML = html;

        var input = body.querySelector('#doc-input');
        var addBtn = body.querySelector('#doc-add');

        function renderDocs() {
            var list = body.querySelector('#doc-list');
            list.innerHTML = '';
            if (docs.length === 0) {
                list.innerHTML =
                    '<div style="color:#556688;text-align:center;padding:12px 0;">📄 Keine Dokumente</div>';
                return;
            }
            for (var i = 0; i < docs.length; i++) {
                var div = document.createElement('div');
                div.style.cssText =
                    'display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);';
                div.innerHTML = '<span>📄 ' + docs[i] +
                    '</span><button class="doc-del" data-idx="' + i +
                    '" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:0.5rem;">✕</button>';
                list.appendChild(div);
            }
            list.querySelectorAll('.doc-del').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.idx);
                    docs.splice(idx, 1);
                    localStorage.setItem('haldo_documents', JSON.stringify(docs));
                    state.documents = docs;
                    renderDocs();
                });
            });
        }

        addBtn.addEventListener('click', function() {
            var text = input.value.trim();
            if (!text) return;
            docs.push(text);
            localStorage.setItem('haldo_documents', JSON.stringify(docs));
            state.documents = docs;
            input.value = '';
            renderDocs();
            Notify.success('📄 Dokument hinzugefügt');
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') addBtn.click();
        });

        renderDocs();
    }
});

// ----- 49. Downloads -----
registerApp('downloads', {
    title: 'Downloads',
    icon: '📥',
    category: 'system',
    description: 'Downloads verwalten',
    render: function(body) {
        var downloads = [
            { name: 'HalDo_System.pdf', size: '2.4 MB', date: '2026-08-30' },
            { name: 'README.txt', size: '128 KB', date: '2026-08-29' },
            { name: 'Config.json', size: '45 KB', date: '2026-08-28' },
            { name: 'update-package.zip', size: '8.7 MB', date: '2026-08-27' }
        ];
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">📥 Downloads</h3>' +
            '<div style="flex:1;overflow-y:auto;font-size:0.55rem;">';

        for (var i = 0; i < downloads.length; i++) {
            var d = downloads[i];
            html +=
                '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                '<span>📄 ' + d.name + '</span>' +
                '<span style="color:#556688;font-size:0.45rem;">' + d.size + ' · ' + d
                .date + '</span></div>';
        }

        html += '</div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:4px;border-radius:4px;font-size:0.45rem;color:#8899bb;text-align:center;">' +
            downloads.length + ' Dateien</div>' +
            '<div class="section-divider">📥 Downloads</div></div>';

        body.innerHTML = html;
    }
});

// ----- 50. Developer Center -----
registerApp('developer', {
    title: 'Developer Center',
    icon: '💻',
    category: 'system',
    description: 'Entwicklerwerkzeuge',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">💻 Developer Center</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
            '<button onclick="launchApp(\'terminal\')" class="btn-primary" style="font-size:0.55rem;padding:8px;">⌨️ Terminal</button>' +
            '<button onclick="Notify.info(\'Dev-Tools geöffnet\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">🛠️ Dev-Tools</button>' +
            '<button onclick="Notify.info(\'Logs gelöscht\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">📋 Logs löschen</button>' +
            '<button onclick="Notify.info(\'Debug-Modus aktiviert\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">🐛 Debug</button></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;font-size:0.5rem;color:#8899bb;font-family:monospace;text-align:center;">🧑‍💻 Entwicklermodus aktiv</div>' +
            '<div class="section-divider">💻 Developer Center</div></div>';
    }
});

// ----- 51. Diagnostics Center -----
registerApp('diagnostics', {
    title: 'Diagnostics Center',
    icon: '🔍',
    category: 'system',
    description: 'Systemdiagnose',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🔍 Diagnostics Center</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:0.55rem;">' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;"><span style="color:#8899bb;">Systemstatus</span><br /><b style="color:#44ff88;">✅ Gesund</b></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;"><span style="color:#8899bb;">Speicher</span><br /><b>' +
            (AI.conversationHistory.length || 0) + ' Einträge</b></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;"><span style="color:#8899bb;">Speicher</span><br /><b>24 GB frei</b></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;"><span style="color:#8899bb;">API</span><br /><b style="color:#44ff88;">✅ Verbunden</b></div></div>' +
            '<button onclick="Notify.info(\'Führe vollständige Diagnose aus...\')" class="btn-primary" style="font-size:0.55rem;">🔍 Diagnose ausführen</button>' +
            '<div class="section-divider">🔍 Diagnostics Center</div></div>';
    }
});

// ----- 52. Event Center -----
registerApp('eventcenter', {
    title: 'Event Center',
    icon: '📌',
    category: 'system',
    description: 'Ereignisse verwalten',
    render: function(body) {
        var events = JSON.parse(localStorage.getItem('haldo_events') || '[]');
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">📌 Event Center</h3>' +
            '<div style="display:flex;gap:4px;">' +
            '<input type="text" id="event-input" placeholder="📌 Neues Ereignis..." class="input-field" style="font-size:0.55rem;" />' +
            '<button id="event-add" class="btn-primary" style="font-size:0.5rem;">➕</button></div>' +
            '<div id="event-list" style="flex:1;overflow-y:auto;max-height:120px;font-size:0.55rem;">';

        if (events.length === 0) {
            html += '<div style="color:#556688;text-align:center;padding:12px 0;">📌 Keine Ereignisse</div>';
        } else {
            for (var i = events.length - 1; i >= 0; i--) {
                var e = events[i];
                html +=
                    '<div style="display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                    '<span>📌 ' + e.text + '</span>' +
                    '<span style="color:#556688;font-size:0.45rem;">' + e.date +
                    '</span>' +
                    '<button class="event-del" data-idx="' + i +
                    '" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:0.5rem;">✕</button>' +
                    '</div>';
            }
        }

        html += '</div>' +
            '<div class="section-divider">📌 Event Center</div></div>';

        body.innerHTML = html;

        var input = body.querySelector('#event-input');
        var addBtn = body.querySelector('#event-add');

        function renderEvents() {
            var list = body.querySelector('#event-list');
            list.innerHTML = '';
            if (events.length === 0) {
                list.innerHTML =
                    '<div style="color:#556688;text-align:center;padding:12px 0;">📌 Keine Ereignisse</div>';
                return;
            }
            for (var i = events.length - 1; i >= 0; i--) {
                var e = events[i];
                var div = document.createElement('div');
                div.style.cssText =
                    'display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);';
                div.innerHTML = '<span>📌 ' + e.text + '</span><span style="color:#556688;font-size:0.45rem;">' +
                    e.date +
                    '</span><button class="event-del" data-idx="' + i +
                    '" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:0.5rem;">✕</button>';
                list.appendChild(div);
            }
            list.querySelectorAll('.event-del').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.idx);
                    events.splice(idx, 1);
                    localStorage.setItem('haldo_events', JSON.stringify(events));
                    renderEvents();
                });
            });
        }

        addBtn.addEventListener('click', function() {
            var text = input.value.trim();
            if (!text) return;
            var now = new Date();
            events.push({
                text: text,
                date: now.toLocaleDateString('de-DE') + ' ' + now.toLocaleTimeString(
                    'de-DE', { hour: '2-digit', minute: '2-digit' }),
                timestamp: now.toISOString()
            });
            localStorage.setItem('haldo_events', JSON.stringify(events));
            input.value = '';
            renderEvents();
            Notify.success('📌 Ereignis hinzugefügt');
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') addBtn.click();
        });

        renderEvents();
    }
});

// ----- 53. Extensions Center -----
registerApp('extensions', {
    title: 'Extensions Center',
    icon: '🧩',
    category: 'system',
    description: 'Erweiterungen verwalten',
    render: function(body) {
        var extensions = [
            { name: 'Dark Mode', icon: '🌙', active: true },
            { name: 'Voice Control', icon: '🎤', active: true },
            { name: 'AI Assistant', icon: '🤖', active: true },
            { name: 'Cosmic Theme', icon: '🌌', active: false },
            { name: 'Multi-Language', icon: '🌍', active: true },
            { name: 'Night Mode', icon: '🌃', active: false }
        ];
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🧩 Extensions Center</h3>' +
            '<div style="flex:1;overflow-y:auto;font-size:0.55rem;">';

        for (var i = 0; i < extensions.length; i++) {
            var ext = extensions[i];
            html +=
                '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                '<span>' + ext.icon + ' ' + ext.name + '</span>' +
                '<span style="color:' + (ext.active ? '#44ff88' : '#556688') + ';font-size:0.45rem;">' +
                (ext.active ? '✅ Aktiv' : '⏸️ Inaktiv') +
                '</span></div>';
        }

        html += '</div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:4px;border-radius:4px;font-size:0.45rem;color:#8899bb;text-align:center;">' +
            extensions.length + ' Erweiterungen</div>' +
            '<div class="section-divider">🧩 Extensions Center</div></div>';

        body.innerHTML = html;
    }
});

// ----- 54. Office Center -----
registerApp('office', {
    title: 'Office Center',
    icon: '📊',
    category: 'office',
    description: 'Office-Anwendungen',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">📊 Office Center</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
            '<button onclick="launchApp(\'documents\')" class="btn-primary" style="font-size:0.55rem;padding:8px;">📄 Dokumente</button>' +
            '<button onclick="launchApp(\'pdfviewer\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">📕 PDF</button>' +
            '<button onclick="Notify.info(\'Tabelle geöffnet\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">📊 Tabellen</button>' +
            '<button onclick="Notify.info(\'Präsentation geöffnet\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">📽️ Präsentationen</button></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;font-size:0.5rem;color:#8899bb;text-align:center;">📁 Office-Paket bereit</div>' +
            '<div class="section-divider">📊 Office Center</div></div>';
    }
});

// ----- 55. Personal / Your HalDo -----
registerApp('personal', {
    title: 'Your HalDo',
    icon: '👤',
    category: 'user',
    description: 'Persönliches Profil',
    render: function(body) {
        var profile = JSON.parse(localStorage.getItem('haldo_profile') || '{"name":"HalDo User","email":"user@haldo.ai","language":"de"}');
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">👤 Your HalDo</h3>' +
            '<div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:6px;">' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
            '<div style="font-size:2.5rem;">👤</div>' +
            '<div><div style="font-weight:700;font-size:0.7rem;">' + profile.name +
            '</div>' +
            '<div style="font-size:0.55rem;color:#8899bb;">' + profile.email +
            '</div></div></div>' +
            '<div style="font-size:0.5rem;color:#556688;margin-top:4px;">Sprache: ' +
            CONFIG.languages[profile.language || 'de'].name +
            '</div></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
            '<button id="profile-edit" class="btn-primary" style="font-size:0.55rem;padding:6px;">✏️ Profil bearbeiten</button>' +
            '<button id="profile-reset" class="btn-secondary" style="font-size:0.55rem;padding:6px;">↺ Zurücksetzen</button></div>' +
            '<div class="section-divider">👤 Your HalDo</div></div>';

        body.innerHTML = html;

        body.querySelector('#profile-edit').addEventListener('click', function() {
            var name = prompt('Name:', profile.name);
            if (name) {
                profile.name = name;
                localStorage.setItem('haldo_profile', JSON.stringify(profile));
                Notify.success('👤 Profil aktualisiert');
                location.reload();
            }
        });

        body.querySelector('#profile-reset').addEventListener('click', function() {
            if (confirm('Profil zurücksetzen?')) {
                localStorage.removeItem('haldo_profile');
                Notify.info('👤 Profil zurückgesetzt');
                location.reload();
            }
        });
    }
});

// ----- 56. Process Manager -----
registerApp('process', {
    title: 'Process Manager',
    icon: '🔄',
    category: 'system',
    description: 'Prozesse verwalten',
    render: function(body) {
        var processes = [];
        for (var i = 0; i < state.windows.length; i++) {
            var w = state.windows[i];
            processes.push({
                name: w.title,
                id: w.id,
                status: 'running',
                memory: (Math.random() * 20 + 5).toFixed(1) + ' MB'
            });
        }
        if (processes.length === 0) {
            processes.push({ name: 'System Idle', id: 'system', status: 'idle', memory: '2.1 MB' });
        }
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🔄 Process Manager</h3>' +
            '<div style="flex:1;overflow-y:auto;font-size:0.55rem;">';

        for (var i = 0; i < processes.length; i++) {
            var p = processes[i];
            html +=
                '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                '<span>' + (p.status === 'running' ? '🟢' : '🔵') + ' ' + p.name +
                '</span>' +
                '<span style="color:#556688;font-size:0.45rem;">' + p.memory +
                '</span></div>';
        }

        html += '</div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:4px;border-radius:4px;font-size:0.45rem;color:#8899bb;text-align:center;">' +
            processes.length + ' Prozesse</div>' +
            '<div class="section-divider">🔄 Process Manager</div></div>';

        body.innerHTML = html;
    }
});

// ----- 57. QR Scanner -----
registerApp('qrscanner', {
    title: 'QR Scanner',
    icon: '📱',
    category: 'tools',
    description: 'QR-Codes scannen',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px;height:100%;">' +
            '<div style="font-size:2.5rem;">📱</div>' +
            '<h3 style="font-size:0.8rem;">QR Scanner</h3>' +
            '<div style="width:100%;max-width:200px;aspect-ratio:1;background:rgba(255,255,255,0.03);border-radius:8px;border:2px dashed rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;flex-direction:column;color:#8899bb;font-size:0.55rem;">' +
            '<div style="font-size:2rem;">📷</div>QR-Code-Scanner</div>' +
            '<div style="display:flex;gap:4px;">' +
            '<button id="qr-simulate" class="btn-primary" style="font-size:0.55rem;">🎯 Simulieren</button>' +
            '<button id="qr-clear" class="btn-secondary" style="font-size:0.55rem;">🗑️ Löschen</button></div>' +
            '<div id="qr-result" style="font-size:0.55rem;color:#8899bb;text-align:center;min-height:20px;"></div>' +
            '<div class="section-divider">📱 QR Scanner</div></div>';

        body.querySelector('#qr-simulate').addEventListener('click', function() {
            var result = document.getElementById('qr-result');
            var data = 'https://haldonma-prog.github.io/HalDo-AI-OS/';
            result.textContent = '✅ QR-Code erkannt: ' + data;
            Notify.success('📱 QR-Code gescannt!');
        });

        body.querySelector('#qr-clear').addEventListener('click', function() {
            document.getElementById('qr-result').textContent = '';
        });
    }
});

// ----- 58. Recovery Center -----
registerApp('recovery', {
    title: 'Recovery Center',
    icon: '🛠️',
    category: 'system',
    description: 'Systemwiederherstellung',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🛠️ Recovery Center</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
            '<button onclick="Notify.info(\'Systemwiederherstellungspunkt erstellt\')" class="btn-primary" style="font-size:0.55rem;padding:8px;">🔧 Wiederherstellungspunkt erstellen</button>' +
            '<button onclick="Notify.info(\'Systemwiederherstellung gestartet\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">↩️ System wiederherstellen</button>' +
            '<button onclick="launchApp(\'backup\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;grid-column:span 2;">💿 Backup & Wiederherstellung</button></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;font-size:0.5rem;color:#8899bb;text-align:center;">Systemwiederherstellung bereit</div>' +
            '<div class="section-divider">🛠️ Recovery Center</div></div>';
    }
});

// ----- 59. Reminders -----
registerApp('reminders', {
    title: 'Erinnerungen',
    icon: '⏰',
    category: 'productivity',
    description: 'Erinnerungen setzen',
    render: function(body) {
        var reminders = JSON.parse(localStorage.getItem('haldo_reminders') || '[]');
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">⏰ Erinnerungen</h3>' +
            '<div style="display:flex;gap:4px;">' +
            '<input type="text" id="reminder-input" placeholder="⏰ Erinnere mich..." class="input-field" style="font-size:0.55rem;" />' +
            '<button id="reminder-add" class="btn-primary" style="font-size:0.5rem;">➕</button></div>' +
            '<div id="reminder-list" style="flex:1;overflow-y:auto;max-height:120px;font-size:0.55rem;">';

        if (reminders.length === 0) {
            html += '<div style="color:#556688;text-align:center;padding:12px 0;">⏰ Keine Erinnerungen</div>';
        } else {
            for (var i = 0; i < reminders.length; i++) {
                var r = reminders[i];
                html +=
                    '<div style="display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                    '<span>⏰ ' + r.text + '</span>' +
                    '<span style="color:#556688;font-size:0.45rem;">' + r.time +
                    '</span>' +
                    '<button class="reminder-del" data-idx="' + i +
                    '" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:0.5rem;">✕</button>' +
                    '</div>';
            }
        }

        html += '</div>' +
            '<div class="section-divider">⏰ Erinnerungen</div></div>';

        body.innerHTML = html;

        var input = body.querySelector('#reminder-input');
        var addBtn = body.querySelector('#reminder-add');

        function renderReminders() {
            var list = body.querySelector('#reminder-list');
            list.innerHTML = '';
            if (reminders.length === 0) {
                list.innerHTML =
                    '<div style="color:#556688;text-align:center;padding:12px 0;">⏰ Keine Erinnerungen</div>';
                return;
            }
            for (var i = 0; i < reminders.length; i++) {
                var r = reminders[i];
                var div = document.createElement('div');
                div.style.cssText =
                    'display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);';
                div.innerHTML = '<span>⏰ ' + r.text + '</span><span style="color:#556688;font-size:0.45rem;">' +
                    r.time +
                    '</span><button class="reminder-del" data-idx="' + i +
                    '" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:0.5rem;">✕</button>';
                list.appendChild(div);
            }
            list.querySelectorAll('.reminder-del').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.idx);
                    reminders.splice(idx, 1);
                    localStorage.setItem('haldo_reminders', JSON.stringify(reminders));
                    renderReminders();
                });
            });
        }

        addBtn.addEventListener('click', function() {
            var text = input.value.trim();
            if (!text) return;
            var now = new Date();
            reminders.push({
                text: text,
                time: now.toLocaleTimeString('de-DE', { hour: '2-digit',
                    minute: '2-digit' }),
                timestamp: now.toISOString()
            });
            localStorage.setItem('haldo_reminders', JSON.stringify(reminders));
            input.value = '';
            renderReminders();
            Notify.success('⏰ Erinnerung hinzugefügt');
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') addBtn.click();
        });

        renderReminders();
    }
});

// ----- 60. Rollback Center -----
registerApp('rollback', {
    title: 'Rollback Center',
    icon: '↩️',
    category: 'system',
    description: 'System-Updates zurücksetzen',
    render: function(body) {
        var rollbacks = [
            { version: '24.5.0', date: '2026-08-30', status: 'available' },
            { version: '24.4.0', date: '2026-08-28', status: 'available' }
        ];
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">↩️ Rollback Center</h3>' +
            '<div style="flex:1;overflow-y:auto;font-size:0.55rem;">';

        for (var i = 0; i < rollbacks.length; i++) {
            var r = rollbacks[i];
            html +=
                '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                '<span>🔄 ' + r.version + '</span>' +
                '<span style="color:#556688;font-size:0.45rem;">' + r.date +
                '</span>' +
                '<button onclick="Notify.info(\'Setze zurück auf ' + r.version +
                '\')" class="btn-secondary" style="font-size:0.4rem;padding:2px 6px;">↩️ Zurücksetzen</button></div>';
        }

        html += '</div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:4px;border-radius:4px;font-size:0.45rem;color:#8899bb;text-align:center;">Rollback-Punkte verfügbar</div>' +
            '<div class="section-divider">↩️ Rollback Center</div></div>';

        body.innerHTML = html;
    }
});

// ----- 61. Security Center -----
registerApp('security', {
    title: 'Security Center',
    icon: '🔐',
    category: 'system',
    description: 'Sicherheitseinstellungen',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🔐 Security Center</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;text-align:center;"><span style="color:#44ff88;">✅</span><br /><span style="font-size:0.55rem;">Firewall</span></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;text-align:center;"><span style="color:#44ff88;">✅</span><br /><span style="font-size:0.55rem;">Verschlüsselung</span></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;text-align:center;"><span style="color:#44ff88;">✅</span><br /><span style="font-size:0.55rem;">VPN</span></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;text-align:center;"><span style="color:#44ff88;">✅</span><br /><span style="font-size:0.55rem;">Antivirus</span></div></div>' +
            '<button onclick="Notify.info(\'Sicherheitscheck abgeschlossen\')" class="btn-primary" style="font-size:0.55rem;">🛡️ Sicherheitscheck ausführen</button>' +
            '<div class="section-divider">🔐 Security Center</div></div>';
    }
});

// ----- 62. Service Manager -----
registerApp('services', {
    title: 'Service Manager',
    icon: '⚡',
    category: 'system',
    description: 'Dienste verwalten',
    render: function(body) {
        var services = [
            { name: 'AI Engine', status: 'running' },
            { name: 'Voice Service', status: 'running' },
            { name: 'Storage Service', status: 'running' },
            { name: 'Window Manager', status: 'running' },
            { name: 'App Runtime', status: 'running' }
        ];
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">⚡ Service Manager</h3>' +
            '<div style="flex:1;overflow-y:auto;font-size:0.55rem;">';

        for (var i = 0; i < services.length; i++) {
            var s = services[i];
            html +=
                '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                '<span>' + (s.status === 'running' ? '🟢' : '🔴') + ' ' + s.name +
                '</span>' +
                '<span style="color:' + (s.status === 'running' ? '#44ff88' :
                    '#ff4444') + ';font-size:0.45rem;">' + s.status +
                '</span></div>';
        }

        html += '</div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:4px;border-radius:4px;font-size:0.45rem;color:#8899bb;text-align:center;">' +
            services.length + ' Dienste laufen</div>' +
            '<div class="section-divider">⚡ Service Manager</div></div>';

        body.innerHTML = html;
    }
});

// ----- 63. Storage Manager -----
registerApp('storage', {
    title: 'Storage Manager',
    icon: '💾',
    category: 'system',
    description: 'Speicher verwalten',
    render: function(body) {
        var total = 1024;
        var used = 245;
        var free = total - used;
        var pct = Math.round((used / total) * 100);
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">💾 Storage Manager</h3>' +
            '<div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:6px;">' +
            '<div style="display:flex;justify-content:space-between;font-size:0.55rem;color:#8899bb;">' +
            '<span>Genutzt ' + used + ' GB</span>' +
            '<span>Frei ' + free + ' GB</span></div>' +
            '<div style="width:100%;height:6px;background:rgba(255,255,255,0.04);border-radius:3px;margin-top:4px;overflow:hidden;">' +
            '<div style="width:' + pct +
            '%;height:100%;background:linear-gradient(90deg,#00d4ff,#7b2ffc);border-radius:3px;"></div></div>' +
            '<div style="font-size:0.45rem;color:#556688;margin-top:2px;">' + pct +
            '% genutzt</div></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:0.5rem;">' +
            '<div style="background:rgba(255,255,255,0.03);padding:4px;border-radius:4px;text-align:center;">📊 Apps<br /><b>' +
            Object.keys(state.apps).length + '</b></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:4px;border-radius:4px;text-align:center;">📝 Notizen<br /><b>' +
            (state.notes || []).length + '</b></div></div>' +
            '<div class="section-divider">💾 Storage Manager</div></div>';
    }
});

// ----- 64. System Logs -----
registerApp('syslogs', {
    title: 'System Logs',
    icon: '📋',
    category: 'system',
    description: 'System-Logs anzeigen',
    render: function(body) {
        var logs = [
            { time: '10:32:15', level: 'info', msg: 'System started' },
            { time: '10:32:16', level: 'info', msg: 'AI Engine initialized' },
            { time: '10:32:17', level: 'info', msg: 'Cosmic World loaded' },
            { time: '10:35:22', level: 'warning', msg: 'High memory usage' },
            { time: '10:40:01', level: 'info', msg: 'App launched: Notes' },
            { time: '10:45:30', level: 'info', msg: 'Voice service ready' }
        ];
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">📋 System Logs</h3>' +
            '<button id="logs-clear" class="btn-secondary" style="font-size:0.5rem;padding:4px 8px;align-self:flex-end;">🗑️ Logs löschen</button>' +
            '<div style="flex:1;overflow-y:auto;font-family:monospace;font-size:0.5rem;background:rgba(0,0,0,0.2);padding:4px;border-radius:4px;max-height:130px;">';

        for (var i = 0; i < logs.length; i++) {
            var l = logs[i];
            var color = l.level === 'error' ? '#ff4444' : l.level === 'warning' ?
                '#ffcc00' : '#8899bb';
            html +=
                '<div style="color:' + color + ';padding:1px 0;">[' + l.time +
                '] ' + l.msg +
                '</div>';
        }

        html += '</div>' +
            '<div class="section-divider">📋 System Logs</div></div>';

        body.innerHTML = html;

        body.querySelector('#logs-clear').addEventListener('click', function() {
            var container = body.querySelector('div[style*="monospace"]');
            if (container) {
                container.innerHTML =
                    '<div style="color:#556688;padding:10px 0;text-align:center;">Logs gelöscht</div>';
                Notify.info('📋 Logs gelöscht');
            }
        });
    }
});

// ----- 65. Task Manager -----
registerApp('taskmanager', {
    title: 'Task-Manager',
    icon: '📋',
    category: 'productivity',
    description: 'Erweiterte Aufgabenverwaltung',
    render: function(body) {
        var tasks = state.tasks || [];
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">📋 Task-Manager</h3>' +
            '<div style="display:flex;gap:4px;">' +
            '<input type="text" id="tm-input" placeholder="➕ Neue Aufgabe..." class="input-field" style="font-size:0.55rem;" />' +
            '<button id="tm-add" class="btn-primary" style="font-size:0.5rem;">➕</button>' +
            '<button id="tm-clear" class="btn-secondary" style="font-size:0.5rem;">🗑️</button></div>' +
            '<div id="tm-list" style="flex:1;overflow-y:auto;font-size:0.55rem;">';

        if (tasks.length === 0) {
            html += '<div style="color:#556688;text-align:center;padding:12px 0;">📋 Keine Aufgaben</div>';
        } else {
            for (var i = 0; i < tasks.length; i++) {
                var t = tasks[i];
                html +=
                    '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                    '<span>' + (t.done ? '✅' : '⬜') + ' ' + t.text + '</span>' +
                    '<span style="color:#556688;font-size:0.45rem;">' + (t.done ?
                        'Erledigt' : 'Offen') +
                    '</span>' +
                    '<button class="tm-toggle" data-idx="' + i +
                    '" style="background:none;border:none;color:#00d4ff;cursor:pointer;font-size:0.5rem;">' +
                    (t.done ? '↺' : '✓') +
                    '</button>' +
                    '<button class="tm-del" data-idx="' + i +
                    '" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:0.5rem;">✕</button>' +
                    '</div>';
            }
        }

        html += '</div>' +
            '<div class="section-divider">📋 Task-Manager</div></div>';

        body.innerHTML = html;

        var input = body.querySelector('#tm-input');
        var addBtn = body.querySelector('#tm-add');
        var clearBtn = body.querySelector('#tm-clear');

        function renderTasks() {
            var list = body.querySelector('#tm-list');
            list.innerHTML = '';
            if (tasks.length === 0) {
                list.innerHTML =
                    '<div style="color:#556688;text-align:center;padding:12px 0;">📋 Keine Aufgaben</div>';
                return;
            }
            for (var i = 0; i < tasks.length; i++) {
                var t = tasks[i];
                var div = document.createElement('div');
                div.style.cssText =
                    'display:flex;justify-content:space-between;align-items:center;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);';
                div.innerHTML = '<span>' + (t.done ? '✅' : '⬜') + ' ' + t.text +
                    '</span>' +
                    '<span style="color:#556688;font-size:0.45rem;">' + (t.done ?
                        'Erledigt' : 'Offen') +
                    '</span>' +
                    '<button class="tm-toggle" data-idx="' + i +
                    '" style="background:none;border:none;color:#00d4ff;cursor:pointer;font-size:0.5rem;">' +
                    (t.done ? '↺' : '✓') +
                    '</button>' +
                    '<button class="tm-del" data-idx="' + i +
                    '" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:0.5rem;">✕</button>';
                list.appendChild(div);
            }
            list.querySelectorAll('.tm-toggle').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.idx);
                    tasks[idx].done = !tasks[idx].done;
                    localStorage.setItem('haldo_tasks', JSON.stringify(tasks));
                    state.tasks = tasks;
                    renderTasks();
                });
            });
            list.querySelectorAll('.tm-del').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.idx);
                    tasks.splice(idx, 1);
                    localStorage.setItem('haldo_tasks', JSON.stringify(tasks));
                    state.tasks = tasks;
                    renderTasks();
                });
            });
        }

        addBtn.addEventListener('click', function() {
            var text = input.value.trim();
            if (!text) return;
            tasks.push({ text: text, done: false });
            localStorage.setItem('haldo_tasks', JSON.stringify(tasks));
            state.tasks = tasks;
            input.value = '';
            renderTasks();
            Notify.success('📋 Aufgabe hinzugefügt');
        });

        clearBtn.addEventListener('click', function() {
            if (confirm('Alle Aufgaben löschen?')) {
                tasks = [];
                localStorage.setItem('haldo_tasks', JSON.stringify(tasks));
                state.tasks = tasks;
                renderTasks();
                Notify.info('📋 Alle Aufgaben gelöscht');
            }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') addBtn.click();
        });

        renderTasks();
    }
});

// ----- 66. User Center -----
registerApp('usercenter', {
    title: 'User Center',
    icon: '👤',
    category: 'system',
    description: 'Benutzerverwaltung',
    render: function(body) {
        var users = [
            { name: 'HalDo User', email: 'user@haldo.ai', role: 'admin' },
            { name: 'Guest', email: 'guest@haldo.ai', role: 'guest' }
        ];
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">👤 User Center</h3>' +
            '<div style="flex:1;overflow-y:auto;font-size:0.55rem;">';

        for (var i = 0; i < users.length; i++) {
            var u = users[i];
            html +=
                '<div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                '<div><span style="font-weight:700;">' + u.name +
                '</span><br /><span style="color:#556688;font-size:0.45rem;">' + u
                .email + '</span></div>' +
                '<span style="color:#44ff88;font-size:0.45rem;">' + u.role +
                '</span></div>';
        }

        html += '</div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:4px;border-radius:4px;font-size:0.45rem;color:#8899bb;text-align:center;">' +
            users.length + ' Benutzer</div>' +
            '<div class="section-divider">👤 User Center</div></div>';

        body.innerHTML = html;
    }
});

// ----- 67. Video Player -----
registerApp('videoplayer', {
    title: 'Video Player',
    icon: '🎬',
    category: 'media',
    description: 'Videos abspielen',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🎬 Video Player</h3>' +
            '<div style="flex:1;min-height:120px;background:rgba(0,0,0,0.3);border-radius:6px;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#8899bb;">' +
            '<div style="font-size:3rem;">🎬</div>' +
            '<div style="font-size:0.6rem;">Videoplayer bereit</div>' +
            '<div style="font-size:0.5rem;color:#556688;margin-top:4px;">Klicke unten für Beispiel</div></div>' +
            '<div style="display:flex;gap:4px;">' +
            '<button onclick="Notify.info(\'Beispielvideo wird abgespielt...\')" class="btn-primary" style="font-size:0.55rem;">▶️ Beispiel abspielen</button>' +
            '<button onclick="Notify.info(\'Videodatei auswählen...\')" class="btn-secondary" style="font-size:0.55rem;">📁 Datei öffnen</button></div>' +
            '<div class="section-divider">🎬 Video Player</div></div>';
    }
});

// ----- 68. Video Calls -----
registerApp('videocalls', {
    title: 'Video Calls',
    icon: '📹',
    category: 'communication',
    description: 'Videoanrufe',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">📹 Video Calls</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
            '<button onclick="Notify.info(\'Videoanruf wird gestartet...\')" class="btn-primary" style="font-size:0.55rem;padding:8px;">📹 Anruf starten</button>' +
            '<button onclick="Notify.info(\'Kamera umgeschaltet\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">📷 Kamera</button>' +
            '<button onclick="Notify.info(\'Mikrofon umgeschaltet\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;">🎤 Mikrofon</button>' +
            '<button onclick="Notify.info(\'Anruf beendet\')" class="btn-secondary" style="font-size:0.55rem;padding:8px;background:rgba(255,68,68,0.15);color:#ff4444;">⏹️ Anruf beenden</button></div>' +
            '<div style="background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;font-size:0.5rem;color:#8899bb;text-align:center;">WebRTC-Videoanrufe</div>' +
            '<div class="section-divider">📹 Video Calls</div></div>';
    }
});

// ----- 69. Voice Center -----
registerApp('voicecenter', {
    title: 'Voice Center',
    icon: '🗣️',
    category: 'system',
    description: 'Voice-Einstellungen',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🗣️ Voice Center</h3>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);">' +
            '<span style="font-size:0.55rem;color:#8899bb;">🎤 Sprachsteuerung</span>' +
            '<span style="color:' + (state.settings.voiceEnabled ? '#44ff88' :
                    '#556688') + ';font-size:0.55rem;">' +
            (state.settings.voiceEnabled ? '✅ An' : '⏸️ Aus') +
            '</span></div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);">' +
            '<span style="font-size:0.55rem;color:#8899bb;">🔊 Stimme</span>' +
            '<span style="color:#8899bb;font-size:0.55rem;">Männlich</span></div>' +
            '<button onclick="Notify.info(\'Voice-Einstellungen aktualisiert\')" class="btn-primary" style="font-size:0.55rem;">💾 Einstellungen speichern</button>' +
            '<button onclick="Voice.speak(\'Hallo! Das ist das HalDo Voice Center.\')" class="btn-secondary" style="font-size:0.55rem;">🔊 Stimme testen</button>' +
            '<div class="section-divider">🗣️ Voice Center</div></div>';
    }
});

// ----- 70. Voice Recorder -----
registerApp('voicerecorder', {
    title: 'Voice Recorder',
    icon: '🎙️',
    category: 'media',
    description: 'Sprache aufnehmen',
    render: function(body) {
        var recordings = JSON.parse(localStorage.getItem('haldo_recordings') || '[]');
        var isRecording = false;
        var mediaRecorder = null;
        var chunks = [];

        function renderRecorder() {
            var html =
                '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
                '<h3 style="font-size:0.8rem;">🎙️ Voice Recorder</h3>' +
                '<div style="display:flex;gap:4px;align-items:center;">' +
                '<button id="recorder-record" class="btn-primary" style="font-size:0.55rem;padding:8px 16px;">🔴 Aufnehmen</button>' +
                '<button id="recorder-stop" class="btn-secondary" style="font-size:0.55rem;padding:8px 16px;display:none;">⏹️ Stopp</button>' +
                '<span id="recorder-status" style="font-size:0.5rem;color:#8899bb;">Bereit</span></div>' +
                '<div id="recorder-list" style="flex:1;overflow-y:auto;font-size:0.55rem;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">';

            if (recordings.length === 0) {
                html += '<div style="color:#556688;text-align:center;padding:12px 0;">🎙️ Keine Aufnahmen</div>';
            } else {
                for (var i = recordings.length - 1; i >= 0; i--) {
                    var r = recordings[i];
                    html +=
                        '<div style="display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                        '<span>🎙️ ' + r.name + '</span>' +
                        '<span style="color:#556688;font-size:0.45rem;">' + r.date +
                        '</span>' +
                        '<button class="recording-play" data-idx="' + i +
                        '" style="background:none;border:none;color:#00d4ff;cursor:pointer;font-size:0.5rem;">▶️</button>' +
                        '<button class="recording-del" data-idx="' + i +
                        '" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:0.5rem;">✕</button>' +
                        '</div>';
                }
            }

            html += '</div>' +
                '<div class="section-divider">🎙️ Voice Recorder</div></div>';

            body.innerHTML = html;

            var recordBtn = body.querySelector('#recorder-record');
            var stopBtn = body.querySelector('#recorder-stop');
            var statusEl = body.querySelector('#recorder-status');

            recordBtn.addEventListener('click', function() {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    statusEl.textContent = '❌ Nicht unterstützt';
                    return;
                }
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(function(stream) {
                        mediaRecorder = new MediaRecorder(stream);
                        chunks = [];
                        mediaRecorder.ondataavailable = function(e) {
                            chunks.push(e.data);
                        };
                        mediaRecorder.onstop = function() {
                            var blob = new Blob(chunks, { type: 'audio/webm' });
                            var url = URL.createObjectURL(blob);
                            var now = new Date();
                            recordings.push({
                                name: 'Recording ' + (recordings.length +
                                    1),
                                date: now.toLocaleDateString('de-DE') +
                                    ' ' + now.toLocaleTimeString('de-DE',
                                        { hour: '2-digit',
                                            minute: '2-digit' }),
                                url: url,
                                blob: blob,
                                timestamp: now.toISOString()
                            });
                            localStorage.setItem('haldo_recordings',
                                JSON.stringify(recordings.map(function(r) {
                                    return { name: r.name,
                                        date: r.date,
                                        timestamp: r
                                        .timestamp };
                                })));
                            recordBtn.style.display = 'inline-block';
                            stopBtn.style.display = 'none';
                            statusEl.textContent = '✅ Aufnahme gespeichert';
                            renderRecorder();
                        };
                        mediaRecorder.start();
                        isRecording = true;
                        recordBtn.style.display = 'none';
                        stopBtn.style.display = 'inline-block';
                        statusEl.textContent = '🔴 Aufnahme...';
                    })
                    .catch(function() {
                        statusEl.textContent = '❌ Mikrofon-Zugriff verweigert';
                    });
            });

            stopBtn.addEventListener('click', function() {
                if (mediaRecorder && isRecording) {
                    mediaRecorder.stop();
                    isRecording = false;
                    mediaRecorder.stream.getTracks().forEach(function(t) {
                        t.stop();
                    });
                }
            });

            body.querySelectorAll('.recording-play').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.idx);
                    var rec = recordings[idx];
                    if (rec.url) {
                        var audio = new Audio(rec.url);
                        audio.play();
                        Notify.info('🎙️ Wird abgespielt...');
                    }
                });
            });

            body.querySelectorAll('.recording-del').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.dataset.idx);
                    recordings.splice(idx, 1);
                    localStorage.setItem('haldo_recordings', JSON.stringify(
                        recordings.map(function(r) {
                            return { name: r.name, date: r.date,
                                timestamp: r.timestamp };
                        })));
                    renderRecorder();
                });
            });
        }

        renderRecorder();
    }
});

// ----- 71. Window Center -----
registerApp('windowcenter', {
    title: 'Window Center',
    icon: '🪟',
    category: 'system',
    description: 'Fenster verwalten',
    render: function(body) {
        var wins = state.windows || [];
        var html =
            '<div style="display:flex;flex-direction:column;height:100%;gap:4px;padding:4px;">' +
            '<h3 style="font-size:0.8rem;">🪟 Window Center</h3>' +
            '<div style="display:flex;gap:4px;">' +
            '<button onclick="WindowManager.closeAll()" class="btn-secondary" style="font-size:0.5rem;padding:4px 8px;">🗑️ Alle schließen</button>' +
            '<span style="font-size:0.5rem;color:#8899bb;margin-left:auto;">' + wins.length +
            ' Fenster offen</span></div>' +
            '<div id="win-list" style="flex:1;overflow-y:auto;font-size:0.55rem;">';

        if (wins.length === 0) {
            html += '<div style="color:#556688;text-align:center;padding:12px 0;">🪟 Keine Fenster offen</div>';
        } else {
            for (var i = 0; i < wins.length; i++) {
                var w = wins[i];
                html +=
                    '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.02);">' +
                    '<span>' + w.icon + ' ' + w.title + '</span>' +
                    '<span style="color:#556688;font-size:0.45rem;">' + (w.minimized ?
                        'Minimiert' : 'Aktiv') +
                    '</span>' +
                    '<button onclick="closeWindow(\'' + w.id +
                    '\')" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:0.5rem;">✕</button>' +
                    '</div>';
            }
        }

        html += '</div>' +
            '<div class="section-divider">🪟 Window Center</div></div>';

        body.innerHTML = html;
    }
});

// ================================================================
//  KONSOLE – ALLE APPS SIND REGISTRIERT
// ================================================================
console.log('✅ Alle ' + Object.keys(state.apps).length + ' Apps erfolgreich registriert!');
