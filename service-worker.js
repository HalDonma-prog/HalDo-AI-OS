/*
 * ============================================================
 * HALDO AI OS 20
 * SERVICE WORKER
 * ============================================================
 *
 * Aufgaben:
 *
 * - PWA Offline Runtime
 * - App Shell Cache
 * - Asset Cache
 * - Network Fallback
 * - Update Detection
 * - Cache Versioning
 * - sichere Aktivierung neuer Versionen
 * - Kommunikation mit HalDo AI OS
 *
 * ============================================================
 */

"use strict";


/* ============================================================
 * VERSION
 * ============================================================ */

const HALDO_VERSION =
    "20.0.0";


const CACHE_VERSION =
    "haldo-ai-os-v20.0.0";


const STATIC_CACHE =
    CACHE_VERSION +
    "-static";


const RUNTIME_CACHE =
    CACHE_VERSION +
    "-runtime";


/*
 * Nur wirklich vorhandene Kernressourcen
 * gehören dauerhaft in die Precache-Liste.
 *
 * Weitere Assets können später durch den
 * App-/Runtime-Loader dynamisch gecacht werden.
 */

const CORE_ASSETS = [

    "./",

    "./index.html",

    "./manifest.json",

    "./service-worker.js"

];


/* ============================================================
 * INSTALL
 * ============================================================ */

self.addEventListener(
    "install",
    function (event) {

        console.log(
            "[HalDo SW] Installing:",
            HALDO_VERSION
        );


        event.waitUntil(

            caches
                .open(
                    STATIC_CACHE
                )
                .then(
                    function (cache) {

                        return cache.addAll(
                            CORE_ASSETS
                        );

                    }
                )
                .then(
                    function () {

                        /*
                         * Wir aktivieren eine neue
                         * Version zunächst kontrolliert.
                         *
                         * skipWaiting() wird hier NICHT
                         * automatisch erzwungen, damit
                         * laufende HalDo-Sitzungen nicht
                         * überraschend unterbrochen werden.
                         */

                        return true;

                    }
                )

        );

    }
);


/* ============================================================
 * ACTIVATE
 * ============================================================ */

self.addEventListener(
    "activate",
    function (event) {

        console.log(
            "[HalDo SW] Activating:",
            HALDO_VERSION
        );


        event.waitUntil(

            caches
                .keys()
                .then(
                    function (cacheNames) {

                        return Promise.all(

                            cacheNames
                                .map(
                                    function (
                                        cacheName
                                    ) {

                                        /*
                                         * Nur alte HalDo-Caches
                                         * löschen.
                                         */

                                        if (
                                            cacheName.indexOf(
                                                "haldo-ai-os-"
                                            ) === 0 &&
                                            cacheName !==
                                                STATIC_CACHE &&
                                            cacheName !==
                                                RUNTIME_CACHE
                                        ) {

                                            console.log(
                                                "[HalDo SW] Removing old cache:",
                                                cacheName
                                            );


                                            return caches.delete(
                                                cacheName
                                            );

                                        }


                                        return null;

                                    }
                                )

                        );

                    }
                )
                .then(
                    function () {

                        return self.clients.claim();

                    }
                )

        );

    }
);


/* ============================================================
 * FETCH
 * ============================================================ */

self.addEventListener(
    "fetch",
    function (event) {

        const request =
            event.request;


        /*
         * Nur GET-Anfragen cachen.
         */

        if (
            request.method !==
            "GET"
        ) {

            return;

        }


        const url =
            new URL(
                request.url
            );


        /*
         * Externe Quellen werden nicht
         * ungeprüft in unseren Runtime-Cache
         * übernommen.
         */

        if (
            url.origin !==
            self.location.origin
        ) {

            return;

        }


        /*
         * Navigation:
         *
         * Netzwerk zuerst.
         * Wenn offline → index.html.
         */

        if (
            request.mode ===
            "navigate"
        ) {

            event.respondWith(

                fetch(
                    request
                )
                .then(
                    function (
                        response
                    ) {

                        /*
                         * Erfolgreiche Navigation
                         * als Runtime-Fallback speichern.
                         */

                        if (
                            response &&
                            response.ok
                        ) {

                            const cloned =
                                response.clone();


                            caches
                                .open(
                                    RUNTIME_CACHE
                                )
                                .then(
                                    function (
                                        cache
                                    ) {

                                        cache.put(
                                            request,
                                            cloned
                                        );

                                    }
                                );

                        }


                        return response;

                    }
                )
                .catch(
                    function () {

                        return caches.match(
                            "./index.html"
                        )
                        .then(
                            function (
                                cached
                            ) {

                                return (
                                    cached ||
                                    new Response(
                                        offlinePage(),
                                        {
                                            headers: {
                                                "Content-Type":
                                                    "text/html; charset=utf-8"
                                            }
                                        }
                                    )
                                );

                            }
                        );

                    }
                )

            );


            return;

        }


        /*
         * Statische Ressourcen:
         *
         * Cache zuerst.
         * Bei fehlendem Cache Netzwerk.
         */

        event.respondWith(

            caches
                .match(
                    request
                )
                .then(
                    function (
                        cached
                    ) {

                        if (
                            cached
                        ) {

                            /*
                             * Für statische Dateien
                             * liefern wir den Cache schnell
                             * aus und aktualisieren im
                             * Hintergrund.
                             */

                            refreshInBackground(
                                request
                            );


                            return cached;

                        }


                        return fetch(
                            request
                        )
                        .then(
                            function (
                                response
                            ) {

                                if (
                                    response &&
                                    response.ok
                                ) {

                                    const cloned =
                                        response.clone();


                                    caches
                                        .open(
                                            RUNTIME_CACHE
                                        )
                                        .then(
                                            function (
                                                cache
                                            ) {

                                                cache.put(
                                                    request,
                                                    cloned
                                                );

                                            }
                                        );

                                }


                                return response;

                            }
                        );

                    }
                )

        );

    }
);


/* ============================================================
 * BACKGROUND REFRESH
 * ============================================================ */

function refreshInBackground(
    request
) {

    fetch(
        request
    )
    .then(
        function (
            response
        ) {

            if (
                !response ||
                !response.ok
            ) {

                return;

            }


            return caches
                .open(
                    RUNTIME_CACHE
                )
                .then(
                    function (
                        cache
                    ) {

                        return cache.put(
                            request,
                            response
                        );

                    }
                );

        }
    )
    .catch(
        function () {

            /*
             * Offline:
             * nichts tun.
             */

        }
    );

}


/* ============================================================
 * OFFLINE PAGE
 * ============================================================ */

function offlinePage() {

    return `
<!DOCTYPE html>

<html lang="de">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>HalDo AI OS 20</title>

<style>

html,
body {

    margin: 0;
    width: 100%;
    height: 100%;

    background:
        radial-gradient(
            circle at center,
            #111b45 0%,
            #050817 45%,
            #02030a 100%
        );

    color: white;

    font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        sans-serif;

}

body {

    display: flex;

    align-items: center;

    justify-content: center;

    text-align: center;

}

.container {

    padding: 32px;

    max-width: 500px;

}

.logo {

    width: 110px;
    height: 110px;

    margin: 0 auto 24px;

    border-radius: 50%;

    background:
        radial-gradient(
            circle,
            #ffffff 0%,
            #9fdcff 18%,
            #5e8dff 42%,
            #17234e 70%,
            transparent 72%
        );

    box-shadow:
        0 0 30px rgba(130, 190, 255, .8),
        0 0 80px rgba(90, 120, 255, .4);

}

h1 {

    margin-bottom: 12px;

}

p {

    opacity: .78;

    line-height: 1.6;

}

</style>

</head>

<body>

<div class="container">

    <div class="logo"></div>

    <h1>HalDo AI OS 20</h1>

    <p>
        HalDo ist momentan offline.
        Deine installierte App bleibt verfügbar.
        Sobald die Verbindung wieder da ist,
        wird nach Aktualisierungen gesucht.
    </p>

</div>

</body>

</html>
`;

}


/* ============================================================
 * MESSAGE SYSTEM
 * ============================================================ */

self.addEventListener(
    "message",
    function (
        event
    ) {

        const data =
            event.data || {};


        /*
         * Neue Version sofort übernehmen,
         * aber nur wenn die Anwendung selbst
         * dies ausdrücklich anfordert.
         */

        if (
            data.type ===
            "HALDO_ACTIVATE_UPDATE"
        ) {

            self.skipWaiting();

            return;

        }


        /*
         * Status an HalDo zurückgeben.
         */

        if (
            data.type ===
            "HALDO_GET_SW_STATUS"
        ) {

            if (
                event.source
            ) {

                event.source.postMessage(
                    {

                        type:
                            "HALDO_SW_STATUS",

                        version:
                            HALDO_VERSION,

                        staticCache:
                            STATIC_CACHE,

                        runtimeCache:
                            RUNTIME_CACHE

                    }
                );

            }

        }

    }
);


/* ============================================================
 * CLIENT BROADCAST
 * ============================================================ */

async function broadcast(
    message
) {

    const clients =
        await self.clients.matchAll(
            {
                includeUncontrolled:
                    true,

                type:
                    "window"
            }
        );


    clients.forEach(
        function (
            client
        ) {

            client.postMessage(
                message
            );

        }
    );

}


/* ============================================================
 * SERVICE WORKER READY MESSAGE
 * ============================================================ */

broadcast(
    {

        type:
            "HALDO_SW_READY",

        version:
            HALDO_VERSION

    }
);