// ================================================================
//  HALDO AI OS 24 – INIT (BOOT, DOCK, MENÜS, SHORTCUTS)
// ================================================================

// ============================================================
//  WINDOW MANAGER
// ============================================================
var WindowManager = {
    getSafePosition: function() {
        var vw = window.innerWidth,
            vh = window.innerHeight;
        var w = Math.min(480, vw - 30);
        var h = Math.min(380, vh - 150);
        return {
            x: Math.max(10, (vw - w) / 2 + (Math.random() - 0.5) * 30),
            y: Math.max(40, (vh - h) / 2 - 20 + (Math.random() - 0.5) * 30),
            w: w,
            h: h
        };
    },

    launch: function(id) {
        var app = state.apps[id];
        if (!app) {
            Notify.error(t('error') + ': "' + id + '"');
            return null;
        }

        for (var i = 0; i < state.windows.length; i++) {
            if (state.windows[i].appId === id) {
                this._focus(state.windows[i].id);
                return state.windows[i];
            }
        }

        var pos = this.getSafePosition();
        var winId = 'win-' + uid();
        var win = {
            id: winId,
            appId: id,
            title: app.title || id,
            icon: app.icon || '📦',
            x: pos.x,
            y: pos.y,
            width: pos.w,
            height: pos.h,
            zIndex: state.windowZIndex++,
            element: null,
            minimized: false,
            _prev: {}
        };

        state.windows.push(win);
        this._render(win);
        this._focus(winId);

        if (app.render) {
            var body = win.element.querySelector('.window-body');
            app.render(body, win);
        }

        state.system.appLaunches++;
        Notify.info('🔄 ' + (app.title || id) + ' ' + (CONFIG.language === 'en' ? 'opened' : CONFIG
            .language === 'ku' ? 'vebû' : 'geöffnet'));
        return win;
    },

    _render: function(win) {
        var existing = document.getElementById(win.id);
        if (existing) existing.remove();

        var el = document.createElement('div');
        el.id = win.id;
        el.className = 'window active';
        el.style.left = win.x + 'px';
        el.style.top = win.y + 'px';
        el.style.width = win.width + 'px';
        el.style.height = win.height + 'px';
        el.style.zIndex = win.zIndex;
        el.dataset.appId = win.appId;

        el.innerHTML =
            '<div class="window-header">' +
            '<span class="window-title"><span class="icon">' + win.icon + '</span>' + win.title +
            '</span>' +
            '<div class="window-controls">' +
            '<button class="win-btn minimize" data-action="minimize">─</button>' +
            '<button class="win-btn maximize" data-action="maximize">⧉</button>' +
            '<button class="win-btn close" data-action="close">✕</button>' +
            '</div>' +
            '</div>' +
            '<div class="window-body"></div>';

        DOM.appContainer.appendChild(el);
        win.element = el;

        var btns = el.querySelectorAll('.win-btn');
        for (var i = 0; i < btns.length; i++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var action = btn.dataset.action;
                    if (action === 'close') WindowManager.close(win.id);
                    else if (action === 'minimize') WindowManager.minimize(win.id);
                    else if (action === 'maximize') WindowManager.maximize(win.id);
                });
            })(btns[i]);
        }

        this._setupDrag(win, el);
        this._setupResize(win, el);
    },

    _setupDrag: function(win, el) {
        var header = el.querySelector('.window-header');
        var drag = false,
            startX, startY, origX, origY;

        function startDrag(cx, cy) {
            if (header.querySelector('.win-btn')) return;
            drag = true;
            startX = cx;
            startY = cy;
            origX = win.x;
            origY = win.y;
            WindowManager._focus(win.id);
            el.style.cursor = 'grabbing';
        }

        function moveDrag(cx, cy) {
            if (!drag) return;
            var dx = cx - startX,
                dy = cy - startY;
            win.x = clamp(origX + dx, 0, window.innerWidth - win.width);
            win.y = clamp(origY + dy, 0, window.innerHeight - win.height - 60);
            el.style.left = win.x + 'px';
            el.style.top = win.y + 'px';
        }

        function endDrag() {
            if (drag) { drag = false;
                el.style.cursor = ''; }
        }

        header.addEventListener('mousedown', function(e) {
            if (!e.target.closest('.win-btn')) startDrag(e.clientX, e.clientY);
        });
        document.addEventListener('mousemove', function(e) { if (drag) moveDrag(e.clientX, e.clientY); });
        document.addEventListener('mouseup', endDrag);

        header.addEventListener('touchstart', function(e) {
            var t = e.touches[0];
            if (!e.target.closest('.win-btn')) startDrag(t.clientX, t.clientY);
        }, { passive: true });
        document.addEventListener('touchmove', function(e) {
            if (drag) { var t = e.touches[0];
                moveDrag(t.clientX, t.clientY); }
        }, { passive: true });
        document.addEventListener('touchend', endDrag, { passive: true });
    },

    _setupResize: function(win, el) {
        var handle = document.createElement('div');
        handle.style.cssText =
            'position:absolute;bottom:0;right:0;width:20px;height:20px;cursor:se-resize;touch-action:none;';
        el.appendChild(handle);

        var resize = false,
            startW, startH, startX2, startY2;

        function startResize(cx, cy) {
            resize = true;
            startW = win.width;
            startH = win.height;
            startX2 = cx;
            startY2 = cy;
        }

        function moveResize(cx, cy) {
            if (!resize) return;
            var dw = cx - startX2,
                dh = cy - startY2;
            win.width = clamp(startW + dw, 160, window.innerWidth - win.x - 10);
            win.height = clamp(startH + dh, 100, window.innerHeight - win.y - 70);
            el.style.width = win.width + 'px';
            el.style.height = win.height + 'px';
        }

        function endResize() { resize = false; }

        handle.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            startResize(e.clientX, e.clientY);
        });
        document.addEventListener('mousemove', function(e) { if (resize) moveResize(e.clientX, e.clientY); });
        document.addEventListener('mouseup', endResize);

        handle.addEventListener('touchstart', function(e) {
            var t = e.touches[0];
            e.stopPropagation();
            startResize(t.clientX, t.clientY);
        }, { passive: true });
        document.addEventListener('touchmove', function(e) {
            if (resize) { var t = e.touches[0];
                moveResize(t.clientX, t.clientY); }
        }, { passive: true });
        document.addEventListener('touchend', endResize, { passive: true });
    },

    close: function(winId) {
        var idx = -1;
        for (var i = 0; i < state.windows.length; i++) {
            if (state.windows[i].id === winId) { idx = i; break; }
        }
        if (idx === -1) return;
        var win = state.windows[idx];
        if (win.element) win.element.remove();
        state.windows.splice(idx, 1);
        if (state.activeWindow === winId) state.activeWindow = null;
        if (state.windows.length > 0) {
            this._focus(state.windows[state.windows.length - 1].id);
        }
    },

    minimize: function(winId) {
        var win = this._find(winId);
        if (!win) return;
        win.minimized = !win.minimized;
        if (win.element) {
            win.element.classList.toggle('minimized', win.minimized);
        }
        Notify.info(win.minimized ? '⏬ ' + win.title + ' ' + (CONFIG.language === 'en' ? 'minimized' :
            CONFIG.language === 'ku' ? 'biçûkkirî' : 'minimiert') : '🔄 ' + win.title + ' ' + (CONFIG
            .language === 'en' ? 'restored' : CONFIG.language === 'ku' ? 'vebû' : 'wiederhergestellt'));
    },

    maximize: function(winId) {
        var win = this._find(winId);
        if (!win || !win.element) return;

        if (win.width === window.innerWidth - 20) {
            win.width = win._prev.w || 420;
            win.height = win._prev.h || 320;
            win.x = win._prev.x || 20;
            win.y = win._prev.y || 40;
        } else {
            win._prev = { w: win.width, h: win.height, x: win.x, y: win.y };
            win.width = window.innerWidth - 20;
            win.height = window.innerHeight - 100;
            win.x = 10;
            win.y = 30;
        }
        win.element.style.width = win.width + 'px';
        win.element.style.height = win.height + 'px';
        win.element.style.left = win.x + 'px';
        win.element.style.top = win.y + 'px';
    },

    _focus: function(winId) {
        var win = this._find(winId);
        if (!win) return;
        state.activeWindow = winId;
        win.zIndex = state.windowZIndex++;
        if (win.element) {
            win.element.style.zIndex = win.zIndex;
            win.element.classList.add('active');
            for (var i = 0; i < state.windows.length; i++) {
                if (state.windows[i].id !== winId && state.windows[i].element) {
                    state.windows[i].element.classList.remove('active');
                }
            }
        }
    },

    _find: function(winId) {
        for (var i = 0; i < state.windows.length; i++) {
            if (state.windows[i].id === winId) return state.windows[i];
        }
        return null;
    }
};

var launchApp = WindowManager.launch.bind(WindowManager);
var closeWindow = WindowManager.close.bind(WindowManager);
var minimizeWindow = WindowManager.minimize.bind(WindowManager);
var maximizeWindow = WindowManager.maximize.bind(WindowManager);

// ============================================================
//  APP REGISTRATION
// ============================================================
function registerApp(id, config) {
    state.apps[id] = {
        id: id,
        title: config.title,
        icon: config.icon,
        render: config.render,
        category: config.category || 'all',
        description: config.description || ''
    };
}

// ============================================================
//  BOOT SEQUENCE
// ============================================================
function bootSequence() {
    var steps = [
        { text: '⟡ ' + (CONFIG.language === 'en' ? 'Loading kernel' : CONFIG.language === 'ku' ?
                'Kernel tê barkirin' : 'Kernel wird geladen') + ' v' + CONFIG.kernel +
            ' ...', progress: 8 },
        { text: '⟡ ' + (CONFIG.language === 'en' ? 'Initializing system' : CONFIG.language ===
                'ku' ? 'Sîstem tê destpêkirin' : 'System initialisiert') + ' ...',
            progress: 20 },
        { text: '⟡ ' + (CONFIG.language === 'en' ? 'Starting Cosmic World' : CONFIG.language ===
                'ku' ? 'Cîhana Kozmîk tê destpêkirin' : 'Cosmic World startet') + ' ...',
            progress: 35 },
        { text: '⟡ ' + (CONFIG.language === 'en' ? 'Activating HalDo AI' : CONFIG.language ===
                'ku' ? 'HalDo AI tê çalak kirin' : 'HalDo AI wird aktiviert') + ' ...',
            progress: 50 },
        { text: '⟡ ' + (CONFIG.language === 'en' ? 'Loading apps' : CONFIG.language === 'ku' ?
                'App têne barkirin' : 'Apps werden geladen') + ' (' + Object.keys(state
                .apps).length + ') ...', progress: 68 },
        { text: '⟡ ' + (CONFIG.language === 'en' ? 'Starting Living AI' : CONFIG.language ===
                'ku' ? 'AI ya Zindî tê destpêkirin' : 'Living AI wird gestartet') +
            ' ...', progress: 80 },
        { text: '⟡ ' + (CONFIG.language === 'en' ? 'Checking for updates' : CONFIG.language ===
                'ku' ? 'Nûvekirin têne kontrol kirin' : 'Update wird geprüft') + ' ...',
            progress: 90 },
        { text: '⟡ ' + (CONFIG.language === 'en' ? 'HalDo OS is READY 🚀' : CONFIG.language ===
                'ku' ? 'HalDo OS AMADE YE 🚀' : 'HalDo OS ist READY 🚀'), progress: 100 }
    ];

    var i = 0;
    DOM.introStatus.textContent = steps[0].text;
    DOM.introProgress.style.width = '2%';
    DOM.introProgressText.textContent = '2%';

    var interval = setInterval(function() {
        i++;
        if (i < steps.length) {
            DOM.introStatus.textContent = steps[i].text;
            DOM.introProgress.style.width = steps[i].progress + '%';
            DOM.introProgressText.textContent = steps[i].progress + '%';
        } else {
            clearInterval(interval);
            setTimeout(function() {
                DOM.introContainer.classList.add('hidden');
                state.isBooted = true;
                state.isReady = true;
                Notify.success('🚀 ' + (CONFIG.language === 'en' ? 'HalDo OS started!' :
                    CONFIG.language === 'ku' ? 'HalDo OS destpêkir!' :
                    'HalDo OS gestartet!'));
                if (state.settings.autoStartAI !== false) {
                    setTimeout(function() { launchApp('ai'); }, 500);
                }
                setTimeout(function() { launchApp('cosmic'); }, 900);
                setTimeout(function() { launchApp('avatar'); }, 1200);
                console.log('✅ HalDo OS ' + CONFIG.version + ' — ULTIMATE EDITION');
                console.log('📱 ' + Object.keys(state.apps).length + ' Apps geladen');
                console.log('👤 Living AI aktiviert');
                console.log('🌍 ' + (CONFIG.language === 'en' ? 'Language' : CONFIG
                    .language === 'ku' ? 'Ziman' : 'Sprache') + ': ' + CONFIG
                    .languages[CONFIG.language].name);
            }, 400);
        }
    }, 350);
}

// ============================================================
//  SYSTEM INIT
// ============================================================

function updateClock() {
    var now = new Date();
    DOM.clock.textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    state.system.uptime = Math.floor((now() - state.system.started) / 1000);
}

function initDock() {
    var items = DOM.dock.querySelectorAll('.dock-item');
    for (var i = 0; i < items.length; i++) {
        (function(btn) {
            btn.addEventListener('click', function() {
                var app = btn.dataset.app;
                if (app) launchApp(app);
            });
        })(items[i]);
    }
}

function initMenus() {
    var menuMap = {
        'menu-apps': 'appworld',
        'menu-ai': 'ai',
        'menu-fahrschule': 'fahrschule',
        'menu-system': 'settings',
        'menu-update': 'update'
    };
    for (var id in menuMap) {
        var el = document.getElementById(id);
        if (el) {
            (function(appId) {
                el.addEventListener('click', function() { launchApp(appId); });
            })(menuMap[id]);
        }
    }

    document.getElementById('menu-help').addEventListener('click', function() {
        Notify.info(
            '❓ **HalDo ' + (CONFIG.language === 'en' ? 'Help' : CONFIG.language === 'ku' ?
                'Alîkarî' : 'Hilfe') + '**\n\n📱 ' +
            (CONFIG.language === 'en' ? 'Apps:' : CONFIG.language === 'ku' ? 'App:' :
                'Apps:') +
            '\n• "' + (CONFIG.language === 'en' ? 'Open Driving School' : CONFIG.language ===
                'ku' ? 'Veke Dibistana Ajotinê' : 'Öffne Fahrschule') + '" 🚗\n• "' + (
                CONFIG.language === 'en' ? 'Open Notes' : CONFIG.language === 'ku' ?
                'Veke Not' : 'Öffne Notizen') + '" 📝\n• "' + (CONFIG.language === 'en' ?
                'Open Email' : CONFIG.language === 'ku' ? 'Veke Email' : 'Öffne E-Mail') +
            '" 📧\n\n⌨️ ' +
            (CONFIG.language === 'en' ? 'Shortcuts:' : CONFIG.language === 'ku' ?
                'Kîteya:' : 'Shortcuts:') +
            '\n• Cmd+K → AI\n• ' +
            (CONFIG.language === 'en' ? 'Escape → Close window' : CONFIG.language === 'ku' ?
                'Escape → Pencerê bigire' : 'Escape → Fenster schließen') +
            '\n\n☀️ ' +
            (CONFIG.language === 'en' ? 'Click on the sun!' : CONFIG.language === 'ku' ?
                'Li rojê bitikîne!' : 'Klicke auf die Sonne!')
        );
    });
}

function loadSettings() {
    try {
        var saved = JSON.parse(localStorage.getItem('haldo_settings'));
        if (saved) {
            for (var key in saved) {
                if (state.settings.hasOwnProperty(key)) {
                    state.settings[key] = saved[key];
                }
            }
            CONFIG.language = state.settings.language || 'de';
        }
    } catch (e) {}
}

function loadData() {
    try {
        var notes = localStorage.getItem('haldo_notes');
        if (notes) state.notes = JSON.parse(notes);
        var contacts = localStorage.getItem('haldo_contacts');
        if (contacts) state.contacts = JSON.parse(contacts);
        var tasks = localStorage.getItem('haldo_tasks');
        if (tasks) state.tasks = JSON.parse(tasks);
        var emails = localStorage.getItem('haldo_emails');
        if (emails) state.emails = JSON.parse(emails);
        var conv = localStorage.getItem('haldo_conversations');
        if (conv) {
            var parsed = JSON.parse(conv);
            if (Array.isArray(parsed)) AI.conversationHistory = parsed;
        }
    } catch (e) { console.log('[Storage] Fehler', e); }
}

// ============================================================
//  GLOBAL EXPOSURE
// ============================================================
window.HalDo = {
    CONFIG: CONFIG,
    state: state,
    AI: AI,
    Voice: Voice,
    Notify: Notify,
    launchApp: launchApp,
    closeWindow: closeWindow,
    minimizeWindow: minimizeWindow,
    maximizeWindow: maximizeWindow,
    WindowManager: WindowManager,
    get apps() { return state.apps; },
    get windows() { return state.windows; },
    version: CONFIG.version,
    booted: function() { return state.isBooted; },
    resetData: function() {
        if (confirm('Alle Daten löschen?')) {
            localStorage.clear();
            location.reload();
        }
    },
    updateAvatar: function(status) {
        state.avatar.status = status;
        var el = document.getElementById('avatar-status');
        if (el) {
            var texts = {
                'idle': CONFIG.language === 'en' ? '● Ready' :
                    CONFIG.language === 'ku' ? '● Amade' : '● Bereit',
                'listening': CONFIG.language === 'en' ? '🎤 Listening...' :
                    CONFIG.language === 'ku' ? '🎤 Guhdarî...' : '🎤 Hört zu...',
                'thinking': CONFIG.language === 'en' ? '🧠 Thinking...' :
                    CONFIG.language === 'ku' ? '🧠 Difikire...' : '🧠 Denkt...',
                'speaking': CONFIG.language === 'en' ? '🗣️ Speaking...' :
                    CONFIG.language === 'ku' ? '🗣️ Dipeyive...' : '🗣️ Spricht...'
            };
            el.textContent = texts[status] || '● Bereit';
            el.className = 'avatar-status ' + status;
        }
        var eyes = document.querySelectorAll('.eye');
        eyes.forEach(function(eye) { eye.className = 'eye ' + status; });
        var mouth = document.querySelector('.mouth');
        if (mouth) mouth.className = 'mouth' + (status === 'speaking' ? ' speaking' : '');
    },
    changeLanguage: window.changeLanguage
};

window.notify = Notify.show;

// ============================================================
//  SPRACHE WECHSELN
// ============================================================
window.changeLanguage = function(lang) {
    if (CONFIG.languages[lang]) {
        CONFIG.language = lang;
        state.settings.language = lang;
        try {
            localStorage.setItem('haldo_settings', JSON.stringify(state.settings));
        } catch (e) {}
        Notify.success('🌍 ' + (lang === 'en' ? 'Language changed to English' : lang === 'ku' ?
            'Ziman hate guhertin Kurmancî' : lang === 'ezidi' ?
            'Ziman hate guhertin Êzîdî' : 'Sprache geändert zu ' + CONFIG.languages[lang]
            .name));
        var aiState = document.getElementById('ai-state');
        if (aiState) {
            aiState.textContent = '● ' + (CONFIG.language === 'en' ? 'Ready' : CONFIG.language ===
                'ku' ? 'Amade' : 'bereit');
        }
        var avatarStatus = document.getElementById('avatar-status');
        if (avatarStatus) {
            avatarStatus.textContent = '● ' + (CONFIG.language === 'en' ? 'Ready' : CONFIG.language ===
                'ku' ? 'Amade' : 'bereit');
        }
        document.querySelectorAll('.lang-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.textContent.includes(CONFIG.languages[lang]
            .name));
        });
        var settingsLang = document.getElementById('settings-language');
        if (settingsLang) settingsLang.value = lang;
    }
};

// ============================================================
//  KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        launchApp('ai');
    }
    if (e.key === 'Escape' && state.activeWindow) {
        closeWindow(state.activeWindow);
    }
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        var langs = Object.keys(CONFIG.languages);
        var currentIdx = langs.indexOf(CONFIG.language);
        var nextIdx = (currentIdx + 1) % langs.length;
        window.changeLanguage(langs[nextIdx]);
    }
});

// ============================================================
//  MAIN INIT
// ============================================================

function init() {
    console.log('⟡ HalDo OS ' + CONFIG.version + ' — ULTIMATE EDITION');
    console.log('📱 ' + Object.keys(state.apps).length + ' Apps registriert');
    console.log('👤 Living AI integriert');
    console.log('🌍 Sprachen: ' + Object.keys(CONFIG.languages).join(', '));

    loadSettings();
    loadData();

    Voice.init();
    initCosmic();
    updateClock();
    setInterval(updateClock, 10000);
    initDock();
    initMenus();

    document.getElementById('btn-about').addEventListener('click', function() {
        Notify.show(
            '⟡ **HalDo OS ' + CONFIG.version + '**\n' +
            '💙❤️🚀 ' + Object.keys(state.apps).length + ' Apps\n' +
            '✅ Groq AI verbunden\n' +
            '👤 Living AI aktiv\n' +
            '🚗 Fahrschule integriert\n' +
            '📝 Notizen & Tasks lokal\n' +
            '📧 E-Mail System\n' +
            '🌍 ' + (CONFIG.language === 'en' ? 'Language' : CONFIG.language === 'ku' ?
                'Ziman' : 'Sprache') + ': ' + CONFIG.languages[CONFIG.language]
            .name + '\n' +
            '🔧 Build: ' + CONFIG.build + '\n' +
            '⏱️ Uptime: ' + Math.floor((now() - state.system.started) / 1000) + 's\n' +
            '📱 ' + (CONFIG.language === 'en' ? 'App launches' : CONFIG.language ===
                'ku' ? 'Vekirina appan' : 'App-Starts') + ': ' + state.system
            .appLaunches,
            'info'
        );
    });

    bootSequence();
    console.log('✅ System bereit!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
