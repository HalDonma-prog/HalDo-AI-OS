/**
 * HALDO AI OS 24.6.0 – MAIN
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 HalDo AI OS 24.6.0 startet...');
        Boot.init();
        setTimeout(() => Boot.start(), 400);
    });

    window.onerror = (msg, url, line) => {
        console.error('❌ Fehler:', msg, url, line);
        const logs = Storage.get('logs', []);
        logs.push({ level: 'error', message: `${msg} (${url}:${line})`, time: Date.now() });
        if (logs.length > 100) logs.shift();
        Storage.set('logs', logs);
    };

    console.log('💙❤️🚀 HalDo AI OS 24.6.0 – Cosmic Intelligent Operating System');
})();

// Global verfügbar
window.Helpers = Helpers;
