// ================================================================
//  HALDO SYSTEM — INIT & APPS
//  TEIL 8/30 — LETZTER TEIL!
// ================================================================

// Notification Helper
window.HalDoNotify = function(text, type) {
    type = type || 'info';
    var el = document.getElementById('notification');
    if (!el) return;
    el.textContent = text;
    el.style.borderLeftColor = type === 'error' ? '#ff4444' : type === 'success' ? '#44ff88' : '#00d4ff';
    el.classList.add('show');
    clearTimeout(el._timeout);
    el._timeout = setTimeout(function() {
        el.classList.remove('show');
    }, 2800);
    console.log('[HalDo]', text);
};

// Clock
function updateClock() {
    var el = document.getElementById('clock-display');
    if (el) {
        var now = new Date();
        el.textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }
}

// ================================================================
//  APPS DEFINIEREN
// ================================================================

// --- AI APP ---
HalDoAppLoader.register('ai', {
    title: 'HalDo AI 24',
    icon: '🤖',
    render: function(body) {
        body.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%;gap:8px;"><div style="display:flex;align-items:center;gap:10px;padding:6px 10px;background:rgba(0,212,255,0.06);border-radius:10px;"><div style="font-size:1.5rem;">🧠</div><div><div style="font-weight:600;font-size:0.85rem;">HalDo AI 24</div><div style="font-size:0.7rem;color:#8899bb;" id="ai-state">● bereit</div></div></div><div style="flex:1;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:10px;padding:10px;max-height:280px;" id="ai-chat"><div style="color:#8899bb;text-align:center;">💬 Hallo! Ich bin HalDo 24. Frage mich alles!</div></div><div style="display:flex;gap:6px;"><input type="text" id="ai-input" placeholder="Frage ..." style="flex:1;" /><button id="ai-send">Senden</button></div><div style="display:flex;gap:4px;flex-wrap:wrap;"><button class="ai-q" data-cmd="Erzähl mir über Êzîdî">🟡 Êzîdî</button><button class="ai-q" data-cmd="Was ist die Quantenmechanik?">⚛️ Quanten</button><button class="ai-q" data-cmd="Erkläre die Relativitätstheorie">🌌 Relativität</button><button class="ai-q" data-cmd="Was ist Philosophie?">🤔 Philosophie</button><button class="ai-q" data-cmd="Hilfe">❓ Hilfe</button></div><div style="font-size:0.55rem;color:#44ff88;text-align:center;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">✅ Groq AI aktiv</div></div>';

        var chat = body.querySelector('#ai-chat');
        var input = body.querySelector('#ai-input');
        var sendBtn = body.querySelector('#ai-send');
        var stateEl = body.querySelector('#ai-state');

        function addMsg(role, text) {
            var d = document.createElement('div');
            d.style.cssText = 'padding:4px 8px;margin:2px 0;border-radius:6px;' + (role === 'user' ?
                'background:rgba(0,212,255,0.1);text-align:right;' :
                'background:rgba(123,47,252,0.1);');
            d.textContent = (role === 'user' ? '👤 ' : '🤖 ') + text;
            chat.appendChild(d);
            chat.scrollTop = chat.scrollHeight;
        }

        function process(cmd) {
            addMsg('user', cmd);
            stateEl.textContent = '🧠 denkt ...';
            stateEl.style.color = '#ffcc00';

            window.HalDoAI.ask(cmd, window.HalDoState.settings.language || 'de').then(function(response) {
                addMsg('ai', response);
                window.HalDoState.aiMemory.push({ role: 'user', content: cmd });
                window.HalDoState.aiMemory.push({ role: 'ai', content: response });
                stateEl.textContent = '● bereit';
                stateEl.style.color = '#44ff88';
            }).catch(function() {
                var fallback = window.HalDoAI.getFallbackResponse(cmd);
                addMsg('ai', fallback);
                stateEl.textContent = '● bereit';
                stateEl.style.color = '#44ff88';
            });
        }

        sendBtn.addEventListener('click', function() {
            var v = input.value.trim();
            if (v) { process(v);
                input.value = ''; }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') sendBtn.click();
        });

        var qs = body.querySelectorAll('.ai-q');
        for (var i = 0; i < qs.length; i++) {
            (function(b) {
                b.addEventListener('click', function() {
                    input.value = b.dataset.cmd;
                    sendBtn.click();
                });
            })(qs[i]);
        }
    }
});

// --- SETTINGS ---
HalDoAppLoader.register('settings', {
    title: 'Einstellungen',
    icon: '⚙️',
    render: function(body) {
        var state = window.HalDoState;
        body.innerHTML =
            '<h3 style="margin-bottom:8px;font-size:0.9rem;">⚙️ Einstellungen</h3><div style="display:flex;flex-direction:column;gap:8px;"><div><label style="font-size:0.75rem;color:#8899bb;">Sprache</label><select id="settings-language" style="width:100%;"><option value="de" ' +
            (state.settings.language === 'de' ? 'selected' : '') +
            '>🇩🇪 Deutsch</option><option value="en" ' + (state.settings.language === 'en' ? 'selected' : '') +
            '>🇬🇧 English</option><option value="ku" ' + (state.settings.language === 'ku' ? 'selected' : '') +
            '>🇰🇲 Kurmancî</option><option value="ezidi" ' + (state.settings.language === 'ezidi' ? 'selected' :
                '') +
            '>𒀭 Êzîdî</option></select></div><div style="background:rgba(255,255,255,0.04);padding:8px;border-radius:8px;"><div style="font-size:0.7rem;color:#8899bb;">API-Status</div><div style="font-size:0.8rem;color:#44ff88;">✅ Groq verbunden</div></div><button id="settings-save" style="margin-top:4px;">💾 Speichern</button><div style="font-size:0.55rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;">HalDo OS ' +
            window.HalDoKernel.version + ' · ' + Object.keys(window.HalDoState.apps).length + ' Apps</div></div>';

        body.querySelector('#settings-save').addEventListener('click', function() {
            state.settings.language = body.querySelector('#settings-language').value;
            localStorage.setItem('haldo_settings', JSON.stringify(state.settings));
            if (window.HalDoNotify) window.HalDoNotify('✅ Einstellungen gespeichert!', 'success');
        });
    }
});

// --- FILES ---
HalDoAppLoader.register('files', {
    title: 'Datei-Manager',
    icon: '📁',
    render: function(body) {
        var files = [
            { name: 'Dokumente', type: 'folder', size: '-' },
            { name: 'Bilder', type: 'folder', size: '-' },
            { name: 'Musik', type: 'folder', size: '-' },
            { name: 'HalDo24.pdf', type: 'pdf', size: '3.2 MB' },
            { name: 'System.txt', type: 'txt', size: '256 KB' }
        ];
        var html =
            '<div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;"><input type="text" placeholder="🔍 Suche ..." style="flex:1;min-width:80px;" id="file-search" /><button id="file-new" style="padding:6px 12px;">➕</button></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;" id="file-grid">';
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            html += '<div style="background:rgba(255,255,255,0.04);padding:10px;border-radius:8px;text-align:center;cursor:pointer;" onclick="HalDoNotify(\'📄 ' +
                f.name +
                '\')"><div style="font-size:1.8rem;">' + (f.type === 'folder' ? '📁' : '📄') +
                '</div><div style="font-size:0.65rem;font-weight:500;margin-top:2px;">' + f.name +
                '</div><div style="font-size:0.55rem;color:#8899bb;">' + f.size + '</div></div>';
        }
        html +=
            '</div><div style="font-size:0.6rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;display:flex;justify-content:space-between;"><span>📊 5 Elemente</span><span>💾 24.6 GB frei</span></div>';
        body.innerHTML = html;

        body.querySelector('#file-search').addEventListener('input', function(e) {
            var q = e.target.value.toLowerCase();
            var items = body.querySelectorAll('#file-grid > div');
            for (var i = 0; i < items.length; i++) {
                var name = items[i].querySelector('div:nth-child(2)')?.textContent?.toLowerCase() || '';
                items[i].style.display = name.includes(q) ? '' : 'none';
            }
        });
        body.querySelector('#file-new').addEventListener('click', function() {
            var name = prompt('📁 Neuer Ordner:');
            if (name) HalDoNotify('📁 Ordner "' + name + '" erstellt');
        });
    }
});

// --- NOTES ---
HalDoAppLoader.register('notes', {
    title: 'Notizen',
    icon: '📝',
    render: function(body) {
        var notes = window.HalDoState.notes || [];
        var html =
            '<div style="display:flex;gap:6px;margin-bottom:8px;"><input type="text" id="note-input" placeholder="📝 Notiz ..." style="flex:1;" /><button id="note-add">➕</button></div><div id="note-list" style="display:flex;flex-direction:column;gap:4px;max-height:220px;overflow-y:auto;">';
        for (var i = 0; i < notes.length; i++) {
            html += '<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.04);padding:6px 10px;border-radius:6px;font-size:0.8rem;"><span style="word-break:break-word;flex:1;">' +
                notes[i] +
                '</span><button class="note-del" data-idx="' + i +
                '" style="background:none;border:none;color:#ff6666;cursor:pointer;padding:4px 8px;">✕</button></div>';
        }
        html += '</div>';
        body.innerHTML = html;

        var input = body.querySelector('#note-input');

        function renderNotes() {
            var list = body.querySelector('#note-list');
            list.innerHTML = '';
            for (var i = 0; i < notes.length; i++) {
                var div = document.createElement('div');
                div.style.cssText =
                    'display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.04);padding:6px 10px;border-radius:6px;font-size:0.8rem;';
                div.innerHTML = '<span style="word-break:break-word;flex:1;">' + notes[i] +
                    '</span><button class="note-del" data-idx="' + i +
                    '" style="background:none;border:none;color:#ff6666;cursor:pointer;padding:4px 8px;">✕</button>';
                list.appendChild(div);
            }
            var dels = list.querySelectorAll('.note-del');
            for (var i = 0; i < dels.length; i++) {
                (function(btn) {
                    btn.addEventListener('click', function() {
                        var idx = parseInt(btn.dataset.idx);
                        notes.splice(idx, 1);
                        localStorage.setItem('haldo_notes', JSON.stringify(notes));
                        window.HalDoState.notes = notes;
                        renderNotes();
                        if (window.HalDoNotify) window.HalDoNotify('🗑️ Gelöscht');
                    });
                })(dels[i]);
            }
        }

        body.querySelector('#note-add').addEventListener('click', function() {
            var val = input.value.trim();
            if (!val) return;
            notes.push(val);
            localStorage.setItem('haldo_notes', JSON.stringify(notes));
            window.HalDoState.notes = notes;
            input.value = '';
            renderNotes();
        });
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') body.querySelector('#note-add').click();
        });
    }
});

// --- COSMIC ---
HalDoAppLoader.register('cosmic', {
    title: 'Cosmic World',
    icon: '🌌',
    render: function(body) {
        body.innerHTML =
            '<div style="text-align:center;padding:10px;"><div style="font-size:2.5rem;">🌌</div><h3 style="margin:6px 0;font-size:0.9rem;">Cosmic World</h3><p style="color:#8899bb;font-size:0.75rem;">Sonne mit Logo · 12 Planeten · Mond</p><div style="margin-top:8px;font-size:0.65rem;color:#8899bb;">🌟 400 Sterne · 12 Planeten · 🌙 Mond</div><div style="font-size:0.6rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;margin-top:6px;">☀️ Klicke auf die Sonne für HalDo AI</div></div>';
    }
});

// --- CALENDAR ---
HalDoAppLoader.register('calendar', {
    title: 'Kalender',
    icon: '📅',
    render: function(body) {
        var now = new Date();
        var today = now.getDate();
        var month = now.toLocaleString('de', { month: 'long' });
        var year = now.getFullYear();
        var days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
        var html =
            '<div style="text-align:center;"><div style="font-size:1rem;font-weight:600;">' + month + ' ' + year +
            '</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-top:6px;font-size:0.6rem;color:#8899bb;">';
        for (var d = 0; d < days.length; d++) {
            html += '<div style="text-align:center;">' + days[d] + '</div>';
        }
        html +=
            '</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-top:4px;">';
        for (var i = 1; i <= 30; i++) {
            var cls = (i === today) ? 'background:linear-gradient(135deg,#00d4ff,#7b2ffc);color:#fff;' : '';
            html += '<div style="text-align:center;padding:4px 0;border-radius:4px;' + cls +
                'font-size:0.75rem;cursor:pointer;" onclick="HalDoNotify(\'📅 ' + i + '.' + (now.getMonth() + 1) +
                '.' + year + '\')">' + i + '</div>';
        }
        html +=
            '</div><div style="margin-top:4px;font-size:0.65rem;color:#8899bb;">📌 Heute: ' + today + '.' + (now
                .getMonth() + 1) + '.' + year + '</div></div>';
        body.innerHTML = html;
    }
});

// --- MUSIC ---
HalDoAppLoader.register('music', {
    title: 'Musik',
    icon: '🎵',
    render: function(body) {
        var songs = ['🌌 Cosmic Dreams', '🚀 Space Odyssey', '💫 Starlight', '🟡 Ezidi Melody', '🇰🇲 Kurdish Dance'];
        var html =
            '<div style="display:flex;flex-direction:column;gap:4px;"><div style="display:flex;gap:8px;justify-content:center;font-size:1.4rem;padding:4px 0;"><span style="cursor:pointer;" onclick="HalDoNotify(\'⏮ Zurück\')">⏮</span><span style="cursor:pointer;" onclick="HalDoNotify(\'▶️ Abspielen\')">▶️</span><span style="cursor:pointer;" onclick="HalDoNotify(\'⏭ Weiter\')">⏭</span></div><div style="text-align:center;font-size:0.7rem;color:#8899bb;">🎵 Jetzt spielt: ' +
            songs[0] +
            '</div><div style="max-height:150px;overflow-y:auto;">';
        for (var s = 0; s < songs.length; s++) {
            html += '<div style="padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:4px;margin:2px 0;font-size:0.7rem;display:flex;justify-content:space-between;cursor:pointer;" onclick="HalDoNotify(\'▶️ ' +
                songs[s] + '\')"><span>' + songs[s] +
                '</span><span style="color:#8899bb;">▶</span></div>';
        }
        html += '</div></div>';
        body.innerHTML = html;
    }
});

// --- TERMINAL ---
HalDoAppLoader.register('terminal', {
    title: 'Terminal',
    icon: '⌨️',
    render: function(body) {
        body.innerHTML =
            '<div style="background:#050510;border-radius:8px;padding:8px;font-family:\'Courier New\',monospace;font-size:0.7rem;min-height:60px;max-height:200px;overflow-y:auto;" id="term-output"><div style="color:#44ff88;">$ HalDo OS ' +
            window.HalDoKernel.version +
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

            if (main === 'help') resp = 'help, version, apps, clear, echo, date, whoami, uptime';
            else if (main === 'version') resp = 'HalDo OS ' + window.HalDoKernel.version;
            else if (main === 'apps') resp = '📱 ' + Object.keys(window.HalDoState.apps).length + ' Apps';
            else if (main === 'clear') { output.innerHTML = ''; return; } else if (main === 'echo') resp = parts.slice(1)
                .join(' ') || '';
            else if (main === 'date') resp = new Date().toLocaleString();
            else if (main === 'whoami') resp = 'haldo@cosmic';
            else if (main === 'uptime') resp = '⏱ ' + window.HalDoKernel.getUptime();
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

// --- APP WORLD ---
HalDoAppLoader.register('appworld', {
    title: 'App World 24',
    icon: '📱',
    render: function(body) {
        var apps = [];
        for (var key in window.HalDoState.apps) {
            if (key !== 'appworld') {
                apps.push({ id: key, title: window.HalDoState.apps[key].title, icon: window.HalDoState.apps[key]
                        .icon });
            }
        }
        var html = '<h3 style="margin-bottom:6px;font-size:0.85rem;">📱 Alle ' + apps.length +
            ' Apps</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:6px;max-height:280px;overflow-y:auto;">';
        for (var i = 0; i < apps.length; i++) {
            var a = apps[i];
            html += '<div style="background:rgba(255,255,255,0.04);padding:10px;border-radius:8px;text-align:center;cursor:pointer;" onclick="HalDoWindow.launch(\'' +
                a.id + '\')"><div style="font-size:1.5rem;">' + a.icon +
                '</div><div style="font-size:0.6rem;margin-top:2px;">' + a.title + '</div></div>';
        }
        html +=
            '</div><div style="font-size:0.55rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;margin-top:4px;display:flex;justify-content:space-between;"><span>📱 ' +
            apps.length + ' Apps</span><span>HalDo OS ' + window.HalDoKernel.version + '</span></div>';
        body.innerHTML = html;
    }
});

// ================================================================
//  SYSTEM INIT
// ================================================================

function initSystem() {
    // Kernel booten
    window.HalDoKernel.init().then(function() {
        // Cosmic World starten
        window.HalDoCosmic.init();

        // Clock
        updateClock();
        setInterval(updateClock, 10000);

        // Dock Events
        var dock = document.getElementById('dock');
        if (dock) {
            var items = dock.querySelectorAll('.dock-item');
            for (var i = 0; i < items.length; i++) {
                (function(btn) {
                    btn.addEventListener('click', function() {
                        var appId = btn.dataset.app;
                        if (window.HalDoState.apps[appId]) {
                            HalDoWindow.launch(appId);
                        } else {
                            HalDoAppLoader.loadApp(appId);
                        }
                    });
                })(items[i]);
            }
        }

        // Topbar Events
        var menuSystem = document.getElementById('menu-system');
        if (menuSystem) {
            menuSystem.addEventListener('click', function() {
                HalDoNotify('⚙️ System: ' + Object.keys(window.HalDoState.apps).length + ' Apps · HalDo OS ' +
                    window.HalDoKernel.version);
                HalDoWindow.launch('settings');
            });
        }

        var btnApps = document.getElementById('btn-appworld');
        if (btnApps) {
            btnApps.addEventListener('click', function() {
                HalDoWindow.launch('appworld');
            });
        }

        var btnAi = document.getElementById('btn-ai');
        if (btnAi) {
            btnAi.addEventListener('click', function() {
                HalDoWindow.launch('ai');
            });
        }

        var btnSettings = document.getElementById('btn-settings');
        if (btnSettings) {
            btnSettings.addEventListener('click', function() {
                HalDoWindow.launch('settings');
            });
        }

        var btnAbout = document.getElementById('btn-about');
        if (btnAbout) {
            btnAbout.addEventListener('click', function() {
                HalDoNotify('⟡ HalDo OS ' + window.HalDoKernel.version +
                    '\n💙❤️🚀 Professional Edition\n' + Object.keys(window.HalDoState.apps).length +
                    ' Apps · Kernel ' + window.HalDoKernel.kernel + '\n✅ Groq AI verbunden');
            });
        }

        // Events
        window.HalDoEvents.on('system:ready', function() {
            console.log('[System] Ready');
            setTimeout(function() {
                HalDoWindow.launch('ai');
                HalDoWindow.launch('cosmic');
                HalDoNotify('🚀 HalDo OS 24 ist bereit!', 'success');
            }, 500);
        });

        // Globale API
        window.HalDo = {
            launchApp: HalDoWindow.launch,
            notify: HalDoNotify,
            kernel: window.HalDoKernel,
            state: window.HalDoState,
            ai: window.HalDoAI,
            window: HalDoWindow,
            appLoader: HalDoAppLoader,
            cosmic: window.HalDoCosmic
        };

        console.log('⟡ HalDo OS ' + window.HalDoKernel.version + ' — Professional Edition');
        console.log('📱 ' + Object.keys(window.HalDoState.apps).length + ' Apps geladen');
        console.log('✅ Groq API-Key verbunden');
        console.log('☀️ Klicke auf die Sonne für HalDo AI');
        console.log('💡 HalDo.launchApp("appworld") für alle Apps');
    });
}

// Start when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSystem);
} else {
    initSystem();
}
