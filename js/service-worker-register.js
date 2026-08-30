// ================================================================
//  HALDO SERVICE WORKER REGISTER
//  TEIL 26/30
// ================================================================

var HalDoServiceWorker = {
    init: function() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(function(registration) {
                    console.log('[SW] Service Worker registriert:', registration);
                    
                    // Prüfe auf Updates
                    registration.addEventListener('updatefound', function() {
                        var newWorker = registration.installing;
                        console.log('[SW] Neuer Service Worker gefunden');
                        
                        newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('[SW] Update verfügbar!');
                                if (window.HalDoNotify) {
                                    window.HalDoNotify('🔄 Update verfügbar! Bitte Seite neu laden.', 'warning');
                                }
                            }
                        });
                    });
                })
                .catch(function(error) {
                    console.log('[SW] Service Worker Registrierung fehlgeschlagen:', error);
                });
        } else {
            console.log('[SW] Service Worker wird nicht unterstützt');
        }
    },

    // Update prüfen
    checkUpdate: function() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(function(registration) {
                registration.update();
                console.log('[SW] Update-Check durchgeführt');
            });
        }
    },

    // Cache leeren
    clearCache: function() {
        return new Promise(function(resolve) {
            if ('caches' in window) {
                caches.keys().then(function(cacheNames) {
                    return Promise.all(
                        cacheNames.map(function(cacheName) {
                            console.log('[SW] Lösche Cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                    );
                }).then(function() {
                    console.log('[SW] Alle Caches gelöscht');
                    resolve(true);
                });
            } else {
                resolve(false);
            }
        });
    },

    // Offline-Status prüfen
    isOnline: function() {
        return navigator.onLine;
    },

    // Status anzeigen
    getStatus: function() {
        var status = {
            supported: 'serviceWorker' in navigator,
            registered: false,
            online: navigator.onLine,
            controller: navigator.serviceWorker && navigator.serviceWorker.controller ? true : false
        };

        if (status.supported) {
            navigator.serviceWorker.ready.then(function(registration) {
                status.registered = true;
                status.scope = registration.scope;
                console.log('[SW] Status:', status);
            });
        }

        return status;
    }
};
