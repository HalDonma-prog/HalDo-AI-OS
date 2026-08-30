// ================================================================
//  HALDO SYSTEM LOADER — Startet das gesamte System
//  TEIL 21/30
// ================================================================

var HalDoSystemLoader = {
    loaded: false,

    init: function() {
        if (this.loaded) return;
        this.loaded = true;

        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║                                                          ║');
        console.log('║   🌌 HALDO AI OS 24 — COSMIC INTELLIGENT OS            ║');
        console.log('║   💙❤️🚀 PROFESSIONAL ULTIMATE EDITION                  ║');
        console.log('║                                                          ║');
        console.log('╚══════════════════════════════════════════════════════════╝');

        this.loadSequence();
    },

    loadSequence: function() {
        var steps = [
            { name: 'Storage', fn: function() { return window.HalDoStorage ? true : false; } },
            { name: 'Kernel', fn: function() { return window.HalDoKernel ? true : false; } },
            { name: 'AI Engine', fn: function() { return window.HalDoAI ? true : false; } },
            { name: 'Window Manager', fn: function() { return window.HalDoWindow ? true : false; } },
            { name: 'App Loader', fn: function() { return window.HalDoAppLoader ? true : false; } },
            { name: 'Cosmic World', fn: function() { return window.HalDoCosmic ? true : false; } },
            { name: 'Voice', fn: function() { return window.HalDoVoice ? true : false; } },
            { name: 'AI Enhanced', fn: function() { return window.HalDoAIEnhanced ? true : false; } },
            { name: 'Mail', fn: function() { return window.HalDoMail ? true : false; } },
            { name: 'Chat', fn: function() { return window.HalDoChat ? true : false; } },
            { name: 'Contacts', fn: function() { return window.HalDoContacts ? true : false; } },
            { name: 'System Update', fn: function() { return window.HalDoSystemUpdate ? true : false; } },
            { name: 'AI Integration', fn: function() { return window.HalDoAIIntegration ? true : false; } },
            { name: 'Logo Fix', fn: function() { return window.HalDoLogo ? true : false; } },
            { name: 'Menu', fn: function() { return window.HalDoMenu ? true : false; } },
            { name: 'Cosmic Enhanced', fn: function() { return window.HalDoCosmicEnhanced ? true : false; } },
            { name: 'Final Integration', fn: function() { return window.HalDoFinalIntegration ? true : false; } }
        ];

        var loaded = 0;
        var total = steps.length;
        var statusEl = document.getElementById('boot-status');

        for (var i = 0; i < steps.length; i++) {
            if (steps[i].fn()) {
                loaded++;
                console.log('[Loader] ✅ ' + steps[i].name + ' geladen');
            } else {
                console.log('[Loader] ⚠️ ' + steps[i].name + ' nicht gefunden');
            }
        }

        console.log('[Loader] ' + loaded + '/' + total + ' Komponenten geladen');

        if (statusEl) {
            statusEl.textContent = '⟡ ' + loaded + '/' + total + ' Komponenten geladen ...';
        }

        // Alle Komponenten initialisieren
        this.initComponents();

        // Final Integration ausführen
        if (window.HalDoFinalIntegration) {
            window.HalDoFinalIntegration.init();
        }

        // Boot abschließen
        setTimeout(function() {
            var boot = document.getElementById('boot');
            if (boot) {
                boot.classList.add('hidden');
            }
            if (statusEl) {
                statusEl.textContent = '⟡ HalDo OS 24 ist READY 🚀';
            }
            if (window.HalDoNotify) {
                window.HalDoNotify('🚀 HalDo AI OS 24 erfolgreich gestartet!', 'success');
            }

            // Apps automatisch starten
            setTimeout(function() {
                if (window.HalDoWindow) {
                    window.HalDoWindow.launch('ai');
                    setTimeout(function() {
                        window.HalDoWindow.launch('cosmic');
                    }, 400);
                    setTimeout(function() {
                        window.HalDoWindow.launch('appworld');
                    }, 800);
                }
            }, 500);

            console.log('╔══════════════════════════════════════════════════════════╗');
            console.log('║                                                          ║');
            console.log('║   🚀 HALDO AI OS 24 — SYSTEM READY                     ║');
            console.log('║   📱 ' + Object.keys(window.HalDoState.apps).length + ' Apps verfügbar      ║');
            console.log('║   ☀️ Klicke auf die Sonne für HalDo AI                ║');
            console.log('║   💡 HalDo.launchApp("appworld") für alle Apps         ║');
            console.log('║                                                          ║');
            console.log('╚══════════════════════════════════════════════════════════╝');

        }.bind(this), 1000);
    },

    initComponents: function() {
        // Storage initialisieren (bereits in Kernel)
        // Kernel initialisieren (bereits in System)

        // Voice initialisieren
        if (window.HalDoVoice) {
            try { window.HalDoVoice.init(); } catch (e) { console.log('[Loader] Voice Init Fehler:', e); }
        }

        // Menu initialisieren
        if (window.HalDoMenu) {
            try { window.HalDoMenu.init(); } catch (e) { console.log('[Loader] Menu Init Fehler:', e); }
        }

        // Logo Fix
        if (window.HalDoLogo) {
            try { window.HalDoLogo.init(); } catch (e) { console.log('[Loader] Logo Init Fehler:', e); }
        }

        // Cosmic Enhanced
        if (window.HalDoCosmicEnhanced) {
            try { window.HalDoCosmicEnhanced.init(); } catch (e) { console.log('[Loader] Cosmic Init Fehler:', e); }
        }

        // Mail, Chat, Contacts initialisieren (werden von Final Integration gemacht)
        console.log('[Loader] Alle Komponenten initialisiert');
    },

    // Hilfsfunktion für Debug
    status: function() {
        var components = {
            'Storage': !!window.HalDoStorage,
            'Kernel': !!window.HalDoKernel,
            'AI Engine': !!window.HalDoAI,
            'Window': !!window.HalDoWindow,
            'App Loader': !!window.HalDoAppLoader,
            'Cosmic': !!window.HalDoCosmic,
            'Voice': !!window.HalDoVoice,
            'AI Enhanced': !!window.HalDoAIEnhanced,
            'Mail': !!window.HalDoMail,
            'Chat': !!window.HalDoChat,
            'Contacts': !!window.HalDoContacts,
            'System Update': !!window.HalDoSystemUpdate,
            'AI Integration': !!window.HalDoAIIntegration,
            'Logo': !!window.HalDoLogo,
            'Menu': !!window.HalDoMenu,
            'Cosmic Enhanced': !!window.HalDoCosmicEnhanced,
            'Final Integration': !!window.HalDoFinalIntegration
        };

        var result = '📊 HalDo OS 24 — System Status\n';
        var total = 0;
        var loaded = 0;
        for (var key in components) {
            total++;
            if (components[key]) {
                loaded++;
                result += '  ✅ ' + key + '\n';
            } else {
                result += '  ❌ ' + key + '\n';
            }
        }
        result += '\n📱 ' + loaded + '/' + total + ' Komponenten geladen';
        result += '\n📱 ' + Object.keys(window.HalDoState.apps).length + ' Apps verfügbar';

        console.log(result);
        return result;
    }
};

// ===== AUTOMATISCHER START =====
// Wird von system.js aufgerufen, wenn DOM bereit ist
// Falls system.js nicht lädt, starten wir hier
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Prüfen ob System schon gestartet wurde
    if (!window._haldoStarted) {
        window._haldoStarted = true;
        // Kurze Verzögerung damit andere Scripts laden können
        setTimeout(function() {
            if (!window.HalDoSystemLoader) {
                console.log('[Loader] System-Loader nicht gefunden, warte ...');
                return;
            }
            if (!window.HalDoSystemLoader.loaded) {
                window.HalDoSystemLoader.init();
            }
        }, 100);
    }
}
