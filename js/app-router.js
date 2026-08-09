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
    /* ========================================================
       21 — ROUTE-HISTORY EINTRAG
       ======================================================== */

    function addHistoryEntry(
        route,
        options = {}
    ) {

        const normalized =
            normalizeRoute(
                route
            );


        const entry = {

            route:
                normalized,

            timestamp:
                Date.now(),

            source:
                options.source ||
                "router",

            appId:
                getAppIdFromRoute(
                    normalized
                )

        };


        routeHistory.push(
            entry
        );


        /*
         * History begrenzen,
         * damit der Speicher nicht
         * unbegrenzt wächst.
         */

        if (
            routeHistory.length >
            CONFIG.maxHistoryEntries
        ) {

            routeHistory.splice(
                0,
                routeHistory.length -
                CONFIG.maxHistoryEntries
            );

        }


        state.historyCount =
            routeHistory.length;


        return entry;

    }


    /* ========================================================
       22 — ROUTE-HISTORY ABRUFEN
       ======================================================== */

    function getRouteHistory() {

        return routeHistory.map(
            entry => ({
                ...entry
            })
        );

    }


    /* ========================================================
       23 — LETZTEN HISTORY-EINTRAG
       ======================================================== */

    function getLastHistoryEntry() {

        if (
            !routeHistory.length
        ) {

            return null;

        }


        return {
            ...routeHistory[
                routeHistory.length - 1
            ]
        };

    }


    /* ========================================================
       24 — HISTORY LÖSCHEN
       ======================================================== */

    function clearHistory() {

        routeHistory.length =
            0;


        state.historyCount =
            0;


        emit(
            "history-cleared",
            {

                history:
                    []

            }
        );


        return true;

    }


    /* ========================================================
       25 — HASH AUSLESEN
       ======================================================== */

    function getHashRoute() {

        const hash =
            window.location.hash;


        if (
            !hash
        ) {

            return CONFIG.homeRoute;

        }


        return normalizeRoute(
            hash
        );

    }


    /* ========================================================
       26 — HASH SETZEN
       ======================================================== */

    function setHashRoute(
        route,
        replace = false
    ) {

        const normalized =
            normalizeRoute(
                route
            );


        /*
         * Browser-History verwenden.
         */

        if (
            replace
        ) {

            const url =
                window.location.pathname +
                window.location.search +
                normalized;


            window.history.replaceState(
                {
                    haldoRoute:
                        normalized
                },
                "",
                url
            );


            return normalized;

        }


        const url =
            window.location.pathname +
            window.location.search +
            normalized;


        window.history.pushState(
            {
                haldoRoute:
                    normalized
            },
            "",
            url
        );


        return normalized;

    }


    /* ========================================================
       27 — ROUTE VALIDIEREN
       ======================================================== */

    function validateRoute(
        route
    ) {

        const parsed =
            parseRoute(
                route
            );


        /*
         * HOME ist immer gültig.
         */

        if (
            parsed.type ===
            "home"
        ) {

            return {

                valid:
                    true,

                route:
                    parsed.route,

                parsed

            };

        }


        /*
         * Nur echte App-Routen
         * benötigen eine Registry-Prüfung.
         */

        if (
            parsed.type !==
            "app"
        ) {

            return {

                valid:
                    false,

                route:
                    parsed.route,

                parsed,

                error:
                    "Unbekannte Route."

            };

        }


        if (
            !parsed.appId
        ) {

            return {

                valid:
                    false,

                route:
                    parsed.route,

                parsed,

                error:
                    "Keine App-ID in der Route."

            };

        }


        const manager =
            getAppManager();


        /*
         * App Manager ist die
         * zentrale Abfrageinstanz.
         */

        if (
            manager &&
            typeof manager.getApp ===
            "function"
        ) {

            const app =
                manager.getApp(
                    parsed.appId
                );


            if (
                !app
            ) {

                return {

                    valid:
                        false,

                    route:
                        parsed.route,

                    parsed,

                    error:
                        `App "${parsed.appId}" ist nicht registriert.`

                };

            }


            return {

                valid:
                    true,

                route:
                    parsed.route,

                parsed,

                app

            };

        }


        /*
         * Direkter Registry-Fallback.
         */

        const registry =
            getAppRegistry();


        if (
            registry
        ) {

            try {

                if (
                    typeof registry.getApp ===
                    "function"
                ) {

                    const app =
                        registry.getApp(
                            parsed.appId
                        );


                    if (
                        app
                    ) {

                        return {

                            valid:
                                true,

                            route:
                                parsed.route,

                            parsed,

                            app

                        };

                    }

                }


                if (
                    typeof registry.findApp ===
                    "function"
                ) {

                    const app =
                        registry.findApp(
                            parsed.appId
                        );


                    if (
                        app
                    ) {

                        return {

                            valid:
                                true,

                            route:
                                parsed.route,

                            parsed,

                            app

                        };

                    }

                }

            }
            catch (
                error
            ) {

                return {

                    valid:
                        false,

                    route:
                        parsed.route,

                    parsed,

                    error:
                        error.message

                };

            }

        }


        return {

            valid:
                false,

            route:
                parsed.route,

            parsed,

            error:
                "App Registry ist noch nicht verfügbar."

        };

    }


    /* ========================================================
       28 — NAVIGATION VORBEREITEN
       ======================================================== */

    function prepareNavigation(
        route,
        options = {}
    ) {

        const normalized =
            normalizeRoute(
                route
            );


        const validation =
            validateRoute(
                normalized
            );


        if (
            !validation.valid
        ) {

            state.lastError =
                validation.error ||
                "Route konnte nicht validiert werden.";


            emit(
                "navigation-error",
                {

                    route:
                        normalized,

                    error:
                        state.lastError,

                    options

                }
            );


            return {

                success:
                    false,

                route:
                    normalized,

                error:
                    state.lastError

            };

        }


        return {

            success:
                true,

            route:
                normalized,

            parsed:
                validation.parsed,

            app:
                validation.app ||
                null,

            options

        };

    }


    /* ========================================================
       29 — HOME NAVIGIEREN
       ======================================================== */

    async function goHome(
        options = {}
    ) {

        return navigate(
            CONFIG.homeRoute,
            {

                ...options,

                source:
                    options.source ||
                    "home"

            }
        );

    }


    /* ========================================================
       30 — APP NAVIGIEREN
       ======================================================== */

    async function navigateToApp(
        appId,
        options = {}
    ) {

        const route =
            createAppRoute(
                appId,
                options
            );


        return navigate(
            route,
            {

                ...options,

                source:
                    options.source ||
                    "app"

            }
        );

    }


    /* ========================================================
       31 — ALLGEMEINE NAVIGATION
       ======================================================== */

    async function navigate(
        route,
        options = {}
    ) {

        const prepared =
            prepareNavigation(
                route,
                options
            );


        if (
            !prepared.success
        ) {

            return prepared;

        }


        const normalized =
            prepared.route;


        const parsed =
            prepared.parsed;


        const previousRoute =
            state.currentRoute;


        const previousApp =
            state.currentApp;


        /*
         * Doppelte Navigation vermeiden,
         * sofern nicht ausdrücklich erzwungen.
         */

        if (
            previousRoute ===
                normalized &&
            options.force !==
                true
        ) {

            return {

                success:
                    true,

                status:
                    "already-active",

                route:
                    normalized,

                parsed,

                app:
                    prepared.app ||
                    null

            };

        }


        state.previousRoute =
            previousRoute;


        state.previousApp =
            previousApp;


        state.lastError =
            null;


        emit(
            "before-navigate",
            {

                from:
                    previousRoute,

                to:
                    normalized,

                parsed,

                app:
                    prepared.app ||
                    null,

                options

            }
        );


        /*
         * APP ROUTE
         */

        if (
            parsed.type ===
            "app"
        ) {

            const manager =
                getAppManager();


            if (
                !manager ||
                typeof manager.openApp !==
                "function"
            ) {

                const error =
                    "HalDoAppManager ist für die Navigation noch nicht verfügbar.";


                state.lastError =
                    error;


                emit(
                    "navigation-error",
                    {

                        route:
                            normalized,

                        error

                    }
                );


                return {

                    success:
                        false,

                    status:
                        "manager-unavailable",

                    route:
                        normalized,

                    error

                };

            }


            let result;


            try {

                result =
                    await manager.openApp(
                        parsed.appId
                    );

            }
            catch (
                error
            ) {

                const message =
                    error &&
                    error.message
                        ? error.message
                        : String(
                            error
                        );


                state.lastError =
                    message;


                emit(
                    "navigation-error",
                    {

                        route:
                            normalized,

                        error:
                            message

                    }
                );


                return {

                    success:
                        false,

                    status:
                        "open-error",

                    route:
                        normalized,

                    error:
                        message

                };

            }


            if (
                !result ||
                result.success !==
                true
            ) {

                const error =
                    result &&
                    result.error
                        ? result.error
                        : "Die App konnte nicht geöffnet werden.";


                state.lastError =
                    error;


                emit(
                    "navigation-error",
                    {

                        route:
                            normalized,

                        error,

                        result

                    }
                );


                return {

                    success:
                        false,

                    status:
                        "app-error",

                    route:
                        normalized,

                    result,

                    error

                };

            }


            state.currentRoute =
                normalized;


            state.currentApp =
                parsed.appId;


            state.navigationCount++;


            addHistoryEntry(
                normalized,
                options
            );


            if (
                options.updateBrowser !==
                false
            ) {

                setHashRoute(
                    normalized,
                    options.replace ===
                        true
                );

            }


            emit(
                "navigated",
                {

                    from:
                        previousRoute,

                    to:
                        normalized,

                    route:
                        normalized,

                    parsed,

                    app:
                        prepared.app ||
                        result.app ||
                        null,

                    result,

                    options

                }
            );


            emit(
                "app-route-changed",
                {

                    appId:
                        parsed.appId,

                    route:
                        normalized,

                    params:
                        parsed.params,

                    query:
                        parsed.query

                }
            );


            return {

                success:
                    true,

                status:
                    "navigated",

                route:
                    normalized,

                parsed,

                app:
                    prepared.app ||
                    result.app ||
                    null,

                result

            };

        }


        /* ====================================================
           HOME ROUTE
           ==================================================== */

        if (
            parsed.type ===
            "home"
        ) {

            const manager =
                getAppManager();


            /*
             * Aktive App sauber stoppen.
             */

            if (
                manager &&
                typeof manager.getActiveApp ===
                "function" &&
                typeof manager.stopApp ===
                "function"
            ) {

                const activeApp =
                    manager.getActiveApp();


                if (
                    activeApp
                ) {

                    try {

                        await manager.stopApp(
                            activeApp.id
                        );

                    }
                    catch (
                        error
                    ) {

                        log(
                            `Aktive App konnte beim Wechsel zu Home nicht sauber geschlossen werden: ${error.message}`,
                            "warning"
                        );

                    }

                }

            }


            state.currentRoute =
                CONFIG.homeRoute;


            state.currentApp =
                null;


            state.navigationCount++;


            addHistoryEntry(
                CONFIG.homeRoute,
                options
            );


            if (
                options.updateBrowser !==
                false
            ) {

                setHashRoute(
                    CONFIG.homeRoute,
                    options.replace ===
                        true
                );

            }


            emit(
                "navigated",
                {

                    from:
                        previousRoute,

                    to:
                        CONFIG.homeRoute,

                    route:
                        CONFIG.homeRoute,

                    parsed,

                    app:
                        null,

                    options

                }
            );


            emit(
                "home-route-changed",
                {

                    route:
                        CONFIG.homeRoute

                }
            );


            return {

                success:
                    true,

                status:
                    "home",

                route:
                    CONFIG.homeRoute,

                parsed,

                app:
                    null

            };

        }


        /* ====================================================
           UNBEKANNTE ROUTE
           ==================================================== */

        const error =
            "Unbekannte Route.";


        state.lastError =
            error;


        emit(
            "navigation-error",
            {

                route:
                    normalized,

                error

            }
        );


        return {

            success:
                false,

            status:
                "unknown-route",

            route:
                normalized,

            error

        };

    }


    /* ========================================================
       32 — AKTUELLE ROUTE VERARBEITEN
       ======================================================== */

    async function handleCurrentRoute(
        options = {}
    ) {

        const route =
            getHashRoute();


        /*
         * Direkte Verarbeitung der
         * Browser-Route.
         */

        return navigate(
            route,
            {

                ...options,

                updateBrowser:
                    false,

                source:
                    options.source ||
                    "browser"

            }
        );

    }


    /* ========================================================
       33 — BROWSER BACK
       ======================================================== */

    function back() {

        window.history.back();


        emit(
            "back-requested",
            {

                route:
                    state.currentRoute

            }
        );


        return true;

    }


    /* ========================================================
       34 — BROWSER FORWARD
       ======================================================== */

    function forward() {

        window.history.forward();


        emit(
            "forward-requested",
            {

                route:
                    state.currentRoute

            }
        );


        return true;

    }


    /* ========================================================
       35 — ROUTE SETZEN
       ======================================================== */

    async function setRoute(
        route,
        options = {}
    ) {

        return navigate(
            route,
            options
        );

    }


    /* ========================================================
       ENDE TEIL 2
       ======================================================== */