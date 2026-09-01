/**
 * HALDO AI OS 24.6 – MAIN
 * Startpunkt der Anwendung
 */

(function() {
    'use strict';

    console.log('🚀 HalDo AI OS 24.6 wird geladen...');

    // Warten auf DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('📱 DOM geladen – Initialisiere System...');

        // Uhr aktualisieren
        updateClock();
        setInterval(updateClock, 10000);

        // Taskbar-Klicks
        document.getElementById('taskbar-logo')?.addEventListener('click', () => {
            if (typeof AppManager !== 'undefined') {
                AppManager.openApp('haldo-home');
            }
        });

        // AI Floating Button
        document.getElementById('ai-floating-btn')?.addEventListener('click', () => {
            if (typeof AppManager !== 'undefined') {
                AppManager.openApp('haldo-ai');
            }
        });

        // Benachrichtigungen
        document.getElementById('taskbar-notifications')?.addEventListener('click', () => {
            if (typeof AppManager !== 'undefined') {
                AppManager.openApp('notifications');
            }
        });

        // Status-Klick (System-Info)
        document.getElementById('taskbar-status')?.addEventListener('click', () => {
            if (typeof AppManager !== 'undefined') {
                AppManager.openApp('os-info');
            }
        });

        // Themes laden
        if (typeof Themes !== 'undefined') {
            Themes.init();
        }

        // Shortcuts laden
        if (typeof Shortcuts !== 'undefined') {
            Shortcuts.init();
        }

        // Settings laden
        if (typeof Settings !== 'undefined') {
            Settings.init();
            Settings.applyAll();
        }

        // Apps installieren (wenn nicht vorhanden)
        if (typeof AppManager !== 'undefined') {
            // Standard-Apps installieren
            const defaultApps = [
                'settings', 'haldo-ai', 'ai-chat', 'cosmic-world',
                'notes', 'calculator', 'calendar', 'browser',
                'weather', 'contacts', 'file-manager', 'gallery',
                'music', 'video-player', 'camera', 'voice-center',
                'themes', 'system-monitor', 'terminal'
            ];
            defaultApps.forEach(appId => {
                if (!AppManager.isInstalled(appId)) {
                    AppManager.installApp(appId);
                }
            });

            // Desktop-Icons rendern
            setTimeout(() => {
                AppManager.renderDesktopIcons();
            }, 500);
        }

        // Groq API Key check
        if (typeof AICore !== 'undefined') {
            const apiKey = Storage.get('groq_api_key');
            if (!apiKey) {
                console.warn('⚠️ Kein Groq API Key gesetzt – AI-Funktionen eingeschränkt');
            }
        }

        console.log('✅ HalDo AI OS 24.6 bereit! 💙❤️🚀');
        EventBus.emit('system:ready');
    }

    function updateClock() {
        const el = document.getElementById('taskbar-time');
        if (el) {
            el.textContent = Helpers.getTime();
        }
    }

})();

// Global verfügbar machen
window.Helpers = Helpers;

console.log('💙❤️🚀 HalDo AI OS 24.6 – Cosmic Intelligent Operating System');
