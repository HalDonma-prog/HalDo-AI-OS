/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/app-router.js

   ZENTRALER APP-ROUTER

   Architektur:

       kernel.js
           ↓
       system.js
           ↓
       app-registry.js
           ↓
       app-manager.js
           ↓
       app-router.js
           ↓
       echte App-Module

   AUFGABEN:
   - zentrale Navigation zwischen Apps
   - Kommunikation mit App Manager
   - Browser-History-Unterstützung
   - Deep-Link-Unterstützung
   - App-Parameter
   - Route-Zustände
   - Router-Events
   - sichere Navigation
   - Back / Forward
   - Home
   - Route-Suche
   - zukünftige Erweiterungen

   WICHTIG:
   - App Registry bleibt Quelle der App-Definitionen
   - App Manager bleibt für App-Zustände zuständig
   - Router verwaltet Navigation
   - keine zweite App-Liste
   - keine erfundenen HTML-Dateien
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const CONFIG = {

        name:
            "HalDo AI OS App Router",

        version:
            "18.0.0",

        defaultRoute:
            "home",

        routePrefix:
            "#/app/",

        homeRoute:
            "#/home",

        maxHistoryEntries:
            200,

        startupDelay:
            0

    };


    /* ========================================================
       02 — ROUTER STATUS
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        managerReady:
            false,

        registryReady:
            false,

        currentRoute:
            CONFIG.homeRoute,

        previousRoute:
            null,

        currentApp:
            null,

        previousApp:
            null,

        navigationCount:
            0,

        historyCount:
            0,

        lastError:
            null,

        startTime:
            null

    };


    /* ========================================================
       03 — ROUTER HISTORY
       ======================================================== */

    const routeHistory = [];


    /* ========================================================
       04 — EVENT SYSTEM
       ======================================================== */

    const listeners = {};


    function on(
        eventName,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return false;

        }


        if (
            !listeners[eventName]
        ) {

            listeners[eventName] =
                [];

        }


        listeners[eventName].push(
            callback
        );


        return true;

    }


    function off(
        eventName,
        callback
    ) {

        if (
            !listeners[eventName]
        ) {

            return false;

        }


        listeners[eventName] =
            listeners[eventName].filter(
                item =>
                    item !== callback
            );


        return true;

    }


    function emit(
        eventName,
        data = null
    ) {

        const callbacks =
            listeners[eventName];


        if (
            !callbacks
        ) {

            return;

        }


        callbacks
            .slice()
            .forEach(
                callback => {

                    try {

                        callback(
                            data
                        );

                    }
                    catch (
                        error
                    ) {

                        console.error(
                            "[HalDo App Router] Event-Fehler:",
                            error
                        );

                    }

                }
            );

    }


    /* ========================================================
       05 — LOGGING
       ======================================================== */

    function log(
        message,
        type = "info"
    ) {

        const prefix =
            "[HalDo App Router]";


        if (
            type ===
            "error"
        ) {

            console.error(
                prefix,
                message
            );

        }
        else if (
            type ===
            "warning"
        ) {

            console.warn(
                prefix,
                message
            );

        }
        else {

            console.log(
                prefix,
                message
            );

        }

    }


    /* ========================================================
       06 — APP MANAGER HOLEN
       ======================================================== */

    function getAppManager() {

        return (
            window.HalDoAppManager ||
            (
                window.HalDoOS &&
                window.HalDoOS.appManager
            ) ||
            null
        );

    }


    /* ========================================================
       07 — APP REGISTRY HOLEN
       ======================================================== */

    function getAppRegistry() {

        return (
            window.HalDoAppRegistry ||
            (
                window.HalDoOS &&
                window.HalDoOS.appRegistry
            ) ||
            null
        );

    }


    /* ========================================================
       08 — APP MANAGER BEREIT?
       ======================================================== */

    function isManagerReady() {

        const manager =
            getAppManager();


        if (
            !manager
        ) {

            return false;

        }


        return (
            typeof manager.getApp ===
                "function" &&

            typeof manager.openApp ===
                "function" &&

            typeof manager.stopApp ===
                "function"
        );

    }


    /* ========================================================
       09 — REGISTRY BEREIT?
       ======================================================== */

    function isRegistryReady() {

        const registry =
            getAppRegistry();


        if (
            !registry
        ) {

            return false;

        }


        return Boolean(

            typeof registry.getAllApps ===
                "function"

            ||

            typeof registry.getAll ===
                "function"

            ||

            Array.isArray(
                registry.definitions
            )

        );

    }


    /* ========================================================
       10 — APP-ID NORMALISIEREN
       ======================================================== */

    function normalizeAppId(
        appId
    ) {

        return String(
            appId ||
            ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );

    }


    /* ========================================================
       11 — ROUTE NORMALISIEREN
       ======================================================== */

    function normalizeRoute(
        route
    ) {

        let value =
            String(
                route ||
                ""
            )
            .trim();


        if (
            !value
        ) {

            return CONFIG.homeRoute;

        }


        /*
         * Vollständige Hash-Route.
         */

        if (
            value.startsWith(
                "#/"
            )
        ) {

            return value;

        }


        /*
         * Nur App-ID:
         *
         * calendar
         * → #/app/calendar
         */

        if (
            !value.includes(
                "/"
            )
        ) {

            const appId =
                normalizeAppId(
                    value
                );


            if (
                appId ===
                "home"
            ) {

                return CONFIG.homeRoute;

            }


            return (
                CONFIG.routePrefix +
                appId
            );

        }


        /*
         * Slash-Route.
         */

        if (
            value.startsWith(
                "/"
            )
        ) {

            return (
                "#" +
                value
            );

        }


        return (
            "#/" +
            value.replace(
                /^#+\/?/,
                ""
            )
        );

    }


    /* ========================================================
       12 — ROUTE PARSEN
       ======================================================== */

    function parseRoute(
        route
    ) {

        const normalized =
            normalizeRoute(
                route
            );


        /*
         * HOME
         */

        if (
            normalized ===
            CONFIG.homeRoute
        ) {

            return {

                route:
                    normalized,

                type:
                    "home",

                appId:
                    null,

                params:
                    {},

                query:
                    {},

                raw:
                    normalized

            };

        }


        /*
         * APP ROUTE
         *
         * #/app/calendar
         *
         * #/app/calendar?view=month
         */

        if (
            normalized.startsWith(
                CONFIG.routePrefix
            )
        ) {

            const rawPath =
                normalized.slice(
                    CONFIG.routePrefix.length
                );


            const parts =
                rawPath.split(
                    "?"
                );


            const path =
                parts[0] ||
                "";


            const queryString =
                parts[1] ||
                "";


            const pathParts =
                path
                    .split(
                        "/"
                    )
                    .filter(
                        Boolean
                    );


            const appId =
                normalizeAppId(
                    pathParts.shift()
                );


            const params = {};


            pathParts.forEach(
                (
                    value,
                    index
                ) => {

                    params[
                        `param${index + 1}`
                    ] =
                        decodeURIComponent(
                            value
                        );

                }
            );


            const query =
                parseQueryString(
                    queryString
                );


            return {

                route:
                    normalized,

                type:
                    "app",

                appId:
                    appId || null,

                params,

                query,

                raw:
                    normalized

            };

        }


        /*
         * UNBEKANNTE ROUTE
         */

        return {

            route:
                normalized,

            type:
                "unknown",

            appId:
                null,

            params:
                {},

            query:
                {},

            raw:
                normalized

        };

    }


    /* ========================================================
       13 — QUERY STRING PARSEN
       ======================================================== */

    function parseQueryString(
        queryString
    ) {

        const result = {};


        const text =
            String(
                queryString ||
                ""
            )
            .trim();


        if (
            !text
        ) {

            return result;

        }


        text
            .split(
                "&"
            )
            .forEach(
                pair => {

                    if (
                        !pair
                    ) {

                        return;

                    }


                    const separator =
                        pair.indexOf(
                            "="
                        );


                    if (
                        separator ===
                        -1
                    ) {

                        result[
                            decodeURIComponent(
                                pair
                            )
                        ] =
                            "";

                        return;

                    }


                    const key =
                        pair.slice(
                            0,
                            separator
                        );


                    const value =
                        pair.slice(
                            separator + 1
                        );


                    result[
                        decodeURIComponent(
                            key
                        )
                    ] =
                        decodeURIComponent(
                            value
                        );

                }
            );


        return result;

    }


    /* ========================================================
       14 — QUERY STRING ERSTELLEN
       ======================================================== */

    function buildQueryString(
        query
    ) {

        if (
            !query ||
            typeof query !==
            "object"
        ) {

            return "";

        }


        const entries =
            Object.entries(
                query
            )
            .filter(
                (
                    [
                        key,
                        value
                    ]
                ) =>
                    key &&
                    value !==
                    undefined &&
                    value !==
                    null
            );


        if (
            !entries.length
        ) {

            return "";

        }


        return (
            "?" +
            entries
                .map(
                    (
                        [
                            key,
                            value
                        ]
                    ) =>
                        encodeURIComponent(
                            key
                        ) +
                        "=" +
                        encodeURIComponent(
                            String(
                                value
                            )
                        )
                )
                .join(
                    "&"
                )
        );

    }


    /* ========================================================
       15 — APP-ROUTE ERSTELLEN
       ======================================================== */

    function createAppRoute(
        appId,
        options = {}
    ) {

        const normalizedAppId =
            normalizeAppId(
                appId
            );


        if (
            !normalizedAppId
        ) {

            return CONFIG.homeRoute;

        }


        const params =
            Array.isArray(
                options.params
            )
                ? options.params
                : [];


        const query =
            options.query &&
            typeof options.query ===
            "object"
                ? options.query
                : {};


        let route =
            CONFIG.routePrefix +
            normalizedAppId;


        params.forEach(
            value => {

                if (
                    value ===
                    undefined ||
                    value ===
                    null
                ) {

                    return;

                }


                route +=
                    "/" +
                    encodeURIComponent(
                        String(
                            value
                        )
                    );

            }
        );


        route +=
            buildQueryString(
                query
            );


        return route;

    }


    /* ========================================================
       16 — ROUTE IST HOME?
       ======================================================== */

    function isHomeRoute(
        route
    ) {

        return (
            parseRoute(
                route
            ).type ===
            "home"
        );

    }


    /* ========================================================
       17 — ROUTE IST APP?
       ======================================================== */

    function isAppRoute(
        route
    ) {

        return (
            parseRoute(
                route
            ).type ===
            "app"
        );

    }


    /* ========================================================
       18 — APP-ID AUS ROUTE
       ======================================================== */

    function getAppIdFromRoute(
        route
    ) {

        return (
            parseRoute(
                route
            ).appId ||
            null
        );

    }


    /* ========================================================
       19 — AKTUELLE ROUTE
       ======================================================== */

    function getCurrentRoute() {

        return state.currentRoute;

    }


    /* ========================================================
       20 — AKTUELLE APP
       ======================================================== */

    function getCurrentApp() {

        const manager =
            getAppManager();


        if (
            manager &&
            typeof manager.getActiveApp ===
            "function"
        ) {

            const app =
                manager.getActiveApp();


            if (
                app
            ) {

                return app;

            }

        }


        if (
            state.currentApp
        ) {

            return state.currentApp;

        }


        return null;

    }


    /* ========================================================
       ENDE TEIL 1
       ======================================================== */