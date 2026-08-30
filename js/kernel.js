// ================================================================
//  HALDO KERNEL — System Core
//  TEIL 3/30
// ================================================================

var HalDoKernel = {
    version: '24.0.0',
    kernel: '5.3.0',
    started: Date.now(),
    ready: false,

    init: function() {
        console.log('[Kernel] Initialisiere ...');
        var statusEl = document.getElementById('boot-status');
        if (statusEl) statusEl.textContent = '⟡ Kernel wird geladen ...';

        return HalDoStorage.init().then(function() {
            console.log('[Kernel] Storage bereit');
            if (statusEl) statusEl.textContent = '⟡ System wird initialisiert ...';
            this.loadSettings();
            console.log('[Kernel] System bereit');
            if (statusEl) statusEl.textContent = '⟡ HalDo OS 24 ist READY 🚀';
            this.ready = true;

            var boot = document.getElementById('boot');
            if (boot) {
                setTimeout(function() {
                    boot.classList.add('hidden');
                    if (window.HalDoEvents) {
                        window.HalDoEvents.emit('system:ready');
                    }
                }, 600);
            }
            return this;
        }.bind(this));
    },

    loadSettings: function() {
        try {
            var saved = localStorage.getItem('haldo_settings');
            if (saved) {
                var parsed = JSON.parse(saved);
                if (window.HalDoState) {
                    for (var key in parsed) {
                        if (window.HalDoState.settings.hasOwnProperty(key)) {
                            window.HalDoState.settings[key] = parsed[key];
                        }
                    }
                }
            }
        } catch (e) { console.log('[Kernel] Settings Fehler:', e.message); }
    },

    getUptime: function() {
        var s = Math.floor((Date.now() - this.started) / 1000);
        var d = Math.floor(s / 86400),
            h = Math.floor((s % 86400) / 3600),
            m = Math.floor((s % 3600) / 60),
            sec = s % 60;
        return d + 'd ' + h + 'h ' + m + 'm ' + sec + 's';
    }
};

// Event System
window.HalDoEvents = {
    listeners: {},
    emit: function(event, data) {
        if (this.listeners[event]) {
            for (var i = 0; i < this.listeners[event].length; i++) {
                try { this.listeners[event][i](data); } catch (e) {}
            }
        }
    },
    on: function(event, fn) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
    }
};

// State
window.HalDoState = {
    apps: {},
    windows: [],
    windowZIndex: 100,
    activeWindow: null,
    settings: {
        theme: 'cosmic',
        language: 'de',
        voiceEnabled: true,
        notifications: true
    },
    system: {
        started: Date.now(),
        uptime: 0,
        version: HalDoKernel.version,
        kernel: HalDoKernel.kernel
    },
    notes: [],
    contacts: [],
    mail: { inbox: [], sent: [] },
    aiMemory: []
};

// Load notes from localStorage
try {
    var notes = localStorage.getItem('haldo_notes');
    if (notes) window.HalDoState.notes = JSON.parse(notes);
} catch (e) {}
