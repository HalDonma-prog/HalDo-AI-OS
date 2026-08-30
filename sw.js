// ================================================================
//  HALDO SERVICE WORKER — Update & Cache
//  Version 24.0.0
// ================================================================

var CACHE_NAME = 'haldo-os-v24.0.0';
var urlsToCache = [
    'index.html',
    'assets/logo.png',
    'manifest.json'
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
            console.log('[SW] Aktiviert — Version 24.0.0');
            return self.clients.claim();
        })
    );
});

// ===== FETCH =====
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            if (response) {
                return response;
            }
            return fetch(event.request).then(function(response) {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                var responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then(function(cache) {
                        cache.put(event.request, responseToCache);
                    });
                return response;
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

console.log('[SW] Service Worker geladen — Version 24.0.0');
