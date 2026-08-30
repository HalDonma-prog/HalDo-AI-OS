// ================================================================
//  HALDO SERVICE WORKER — Offline-Fähigkeit & Caching
//  TEIL 25/30
// ================================================================

var CACHE_NAME = 'haldo-os-v24.0.0';
var urlsToCache = [
    'index.html',
    'assets/logo.png',
    'js/storage.js',
    'js/kernel.js',
    'js/ai-engine.js',
    'js/window.js',
    'js/app-loader.js',
    'js/cosmic.js',
    'js/system.js',
    'js/voice.js',
    'js/ai-enhanced.js',
    'js/mail.js',
    'js/chat.js',
    'js/contacts.js',
    'js/system-update.js',
    'js/ai-integration.js',
    'js/logo-fix.js',
    'js/menu.js',
    'js/cosmic-enhanced.js',
    'js/app-generator.js',
    'js/final-integration.js',
    'js/system-loader.js'
];

// ===== INSTALL =====
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('[SW] Cache geöffnet');
            return cache.addAll(urlsToCache);
        })
        .then(function() {
            console.log('[SW] Alle Dateien gecacht');
            return self.skipWaiting();
        })
    );
});

// ===== ACTIVATE =====
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Lösche alten Cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            console.log('[SW] Aktiviert');
            return self.clients.claim();
        })
    );
});

// ===== FETCH =====
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            // Cache Treffer zurückgeben
            if (response) {
                return response;
            }

            // Fallback: Netzwerk Anfrage
            return fetch(event.request).then(function(response) {
                // Nur erfolgreiche Antworten cachen
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                var responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then(function(cache) {
                        cache.put(event.request, responseToCache);
                    });

                return response;
            }).catch(function() {
                // Offline-Fallback
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('index.html');
                }
                return new Response('Offline — Bitte verbinde dich mit dem Internet.', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            });
        })
    );
});

// ===== UPDATE =====
self.addEventListener('message', function(event) {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});

console.log('[SW] Service Worker geladen');
