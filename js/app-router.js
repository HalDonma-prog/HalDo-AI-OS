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
   - zentrale Navigation
   - Registry-Verbindung
   - App-Manager-Verbindung
   - Browser-History
   - Hash-Navigation
   - Deep Links
   - App-Parameter
   - Query-Parameter
   - Home
   - Back / Forward
   - sichere Navigation
   - Router-Events
   - Diagnose
   - zukünftige Erweiterungen

   WICHTIG:
   - keine zweite App-Liste
   - Registry bleibt Quelle der App-Definitionen
   - Manager bleibt für App-Zustände zuständig
   - Router bleibt für Navigation zuständig
   ============================================================ */

"use strict";

(function (window, document) {

    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const CONFIG = {

        name: "HalDo AI OS 18 App Router",

        version: "18.0.0",

        edition: "Professional Ultimate Foundation",

        defaultRoute: "#/home",

        homeRoute: "#/home",

        routePrefix: "#/app/",

        maxHistoryEntries: 200,

        startupDelay: 0,

        listenToHashChange: true,

        useBrowserHistory: true

    };


    /* ========================================================
       02 — STATUS
       ======================================================== */

    const state = {

        initialized: false,

        ready: false,

        managerReady: false,

        registryReady: false,

        navigating: false,

        handlingHashChange: false,

        currentRoute: CONFIG.homeRoute,

        previousRoute: null,

        currentApp: null,

        previousApp: null,

        navigationCount: 0,

        historyCount: 0,

        lastError: null,

        lastNavigation: null,

        startTime: null

    };


    /* ========================================================
       03 — INTERNE ROUTER-HISTORY
       ======================================================== */

    const routeHistory = [];

    let historyIndex = -1;


    /* ========================================================
       04 — EVENT SYSTEM
       ======================================================== */

    const listeners = {};


    function on(eventName, callback) {

        if (
            typeof callback !== "function"
        ) {
            return false;
        }

        if (
            !listeners[eventName]
        ) {
            listeners[eventName] = [];
        }

        listeners[eventName].push(callback);

        return true;
    }


    function off(eventName, callback) {

        if (
            !listeners[eventName]
        ) {
            return false;
        }

        listeners[eventName] =
            listeners[eventName].filter(
                item => item !== callback
            );

        return true;
    }


    function emit(eventName, data = null) {

        const callbacks =
            listeners[eventName];

        if (!callbacks) {
            return;
        }

        callbacks
            .slice()
            .forEach(callback => {

                try {

                    callback(data);

                } catch (error) {

                    console.error(
                        "[HalDo App Router] Event-Fehler:",
                        error
                    );

                }

            });
    }


    /* ========================================================
       05 — LOGGING
       ======================================================== */

    function log(message, type = "info") {

        const prefix =
            "[HalDo App Router]";

        if (type === "error") {

            console.error(
                prefix,
                message
            );

        } else if (type === "warning") {

            console.warn(
                prefix,
                message
            );

        } else {

            console.log(
                prefix,
                message
            );

        }
    }


    /* ========================================================
       06 — FEHLER
       ======================================================== */

    function setError(error) {

        state.lastError =
            error instanceof Error
                ? error.message
                : String(error || "Unbekannter Fehler");

        emit(
            "error",
            {
                error: state.lastError
            }
        );

        return state.lastError;
    }


    /* ========================================================
       07 — APP MANAGER HOLEN
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
       08 — APP REGISTRY HOLEN
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
       09 — MANAGER BEREIT?
       ======================================================== */

    function isManagerReady() {

        const manager =
            getAppManager();

        if (!manager) {
            return false;
        }

        return (
            typeof manager.getApp === "function" &&
            (
                typeof manager.openApp === "function" ||
                typeof manager.launchApp === "function"
            )
        );
    }


    /* ========================================================
       10 — REGISTRY BEREIT?
       ======================================================== */

    function isRegistryReady() {

        const registry =
            getAppRegistry();

        if (!registry) {
            return false;
        }

        return (
            typeof registry.getAllApps === "function" ||
            typeof registry.getAll === "function" ||
            typeof registry.getApp === "function" ||
            typeof registry.find === "function"
        );
    }


    /* ========================================================
       11 — APP-ID NORMALISIEREN
       ======================================================== */

    function normalizeAppId(appId) {

        return String(
            appId || ""
        )
            .trim()
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            )
            .replace(
                /[^a-z0-9äöüßêîé_-]/gi,
                "-"
            )
            .replace(
                /-+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            );
    }


    /* ========================================================
       12 — URL-DECODE SICHER
       ======================================================== */

    function safeDecode(value) {

        try {

            return decodeURIComponent(
                String(value || "")
            );

        } catch (error) {

            return String(value || "");

        }
    }


    /* ========================================================
       13 — URL-ENCODE
       ======================================================== */

    function safeEncode(value) {

        return encodeURIComponent(
            String(value ?? "")
        );
    }


    /* ========================================================
       14 — QUERY STRING PARSEN
       ======================================================== */

    function parseQueryString(queryString) {

        const result = {};

        const text =
            String(
                queryString || ""
            ).trim();

        if (!text) {
            return result;
        }

        text
            .split("&")
            .forEach(pair => {

                if (!pair) {
                    return;
                }

                const separator =
                    pair.indexOf("=");

                if (separator === -1) {

                    result[
                        safeDecode(pair)
                    ] = "";

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
                    safeDecode(key)
                ] =
                    safeDecode(value);

            });

        return result;
    }


    /* ========================================================
       15 — QUERY STRING ERSTELLEN
       ======================================================== */

    function buildQueryString(query) {

        if (
            !query ||
            typeof query !== "object"
        ) {
            return "";
        }

        const entries =
            Object.entries(query)
                .filter(
                    ([key, value]) =>
                        key &&
                        value !== undefined &&
                        value !== null
                );

        if (!entries.length) {
            return "";
        }

        return (
            "?" +
            entries
                .map(
                    ([key, value]) =>
                        safeEncode(key) +
                        "=" +
                        safeEncode(value)
                )
                .join("&")
        );
    }


    /* ========================================================
       16 — ROUTE NORMALISIEREN
       ======================================================== */

    function normalizeRoute(route) {

        let value =
            String(
                route || ""
            ).trim();

        if (!value) {
            return CONFIG.homeRoute;
        }

        /*
         * Vollständige Hash-Route.
         */

        if (
            value.startsWith("#/")
        ) {

            return value;
        }

        /*
         * Reines Hash-Zeichen.
         */

        if (
            value === "#"
        ) {

            return CONFIG.homeRoute;
        }

        /*
         * Nur App-ID.
         *
         * calendar
         * →
         * #/app/calendar
         */

        if (
            !value.includes("/") &&
            !value.includes("?")
        ) {

            const appId =
                normalizeAppId(value);

            if (
                !appId ||
                appId === "home" ||
                appId === "haldo-home"
            ) {

                return CONFIG.homeRoute;
            }

            return (
                CONFIG.routePrefix +
                appId
            );
        }

        /*
         * Route ohne Hash.
         */

        if (
            value.startsWith("/")
        ) {

            return (
                "#" +
                value
            );
        }

        /*
         * app/calendar
         * →
         * #/app/calendar
         */

        return (
            "#/" +
            value.replace(
                /^#+\/?/,
                ""
            )
        );
    }


    /* ========================================================
       17 — ROUTE PARSEN
       ======================================================== */

    function parseRoute(route) {

        const normalized =
            normalizeRoute(route);

        /*
         * HOME
         */

        if (
            normalized ===
            CONFIG.homeRoute
        ) {

            return {

                route: normalized,

                type: "home",

                appId: null,

                params: {},

                query: {},

                raw: normalized

            };
        }

        /*
         * APP ROUTE
         *
         * #/app/calendar
         *
         * #/app/calendar/month
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

            const questionIndex =
                rawPath.indexOf("?");

            let path =
                rawPath;

            let queryString =
                "";

            if (
                questionIndex >= 0
            ) {

                path =
                    rawPath.slice(
                        0,
                        questionIndex
                    );

                queryString =
                    rawPath.slice(
                        questionIndex + 1
                    );
            }

            const pathParts =
                path
                    .split("/")
                    .filter(Boolean);

            const appId =
                normalizeAppId(
                    safeDecode(
                        pathParts.shift()
                    )
                );

            const params = {};

            pathParts.forEach(
                (value, index) => {

                    params[
                        `param${index + 1}`
                    ] =
                        safeDecode(value);

                }
            );

            return {

                route: normalized,

                type: "app",

                appId:
                    appId || null,

                params,

                query:
                    parseQueryString(
                        queryString
                    ),

                raw: normalized

            };
        }

        /*
         * UNBEKANNTE ROUTE
         */

        return {

            route: normalized,

            type: "unknown",

            appId: null,

            params: {},

            query: {},

            raw: normalized

        };
    }


    /* ========================================================
       18 — APP-ROUTE ERSTELLEN
       ======================================================== */

    function createAppRoute(
        appId,
        options = {}
    ) {

        const normalizedAppId =
            normalizeAppId(appId);

        if (!normalizedAppId) {
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
            typeof options.query === "object"
                ? options.query
                : {};

        let route =
            CONFIG.routePrefix +
            normalizedAppId;

        params.forEach(value => {

            if (
                value === undefined ||
                value === null
            ) {
                return;
            }

            route +=
                "/" +
                safeEncode(value);

        });

        route +=
            buildQueryString(query);

        return route;
    }


    /* ========================================================
       19 — ROUTE-PRÜFUNGEN
       ======================================================== */

    function isHomeRoute(route) {

        return (
            parseRoute(route).type ===
            "home"
        );
    }


    function isAppRoute(route) {

        return (
            parseRoute(route).type ===
            "app"
        );
    }


    function getAppIdFromRoute(route) {

        return (
            parseRoute(route).appId ||
            null
        );
    }


    /* ========================================================
       20 — AKTUELLE ROUTE
       ======================================================== */

    function getCurrentRoute() {

        return state.currentRoute;
    }


    /* ========================================================
       21 — AKTUELLE APP
       ======================================================== */

    function getCurrentApp() {

        const manager =
            getAppManager();

        if (
            manager &&
            typeof manager.getActiveApp ===
            "function"
        ) {

            try {

                const app =
                    manager.getActiveApp();

                if (app) {
                    return app;
                }

            } catch (error) {

                log(
                    error,
                    "warning"
                );
            }
        }

        return state.currentApp;
    }


    /* ========================================================
       22 — APP AUS REGISTRY HOLEN
       ======================================================== */

    function findRegisteredApp(appId) {

        const registry =
            getAppRegistry();

        if (!registry) {
            return null;
        }

        const normalized =
            normalizeAppId(appId);

        if (!normalized) {
            return null;
        }

        try {

            if (
                typeof registry.getApp ===
                "function"
            ) {

                const app =
                    registry.getApp(
                        normalized
                    );

                if (app) {
                    return app;
                }
            }

            if (
                typeof registry.find ===
                "function"
            ) {

                const app =
                    registry.find(
                        normalized
                    );

                if (app) {
                    return app;
                }
            }

            if (
                typeof registry.findApp ===
                "function"
            ) {

                const app =
                    registry.findApp(
                        normalized
                    );

                if (app) {
                    return app;
                }
            }

            const apps =
                typeof registry.getAllApps ===
                "function"
                    ? registry.getAllApps()
                    : typeof registry.getAll ===
                      "function"
                        ? registry.getAll()
                        : [];

            if (
                Array.isArray(apps)
            ) {

                return (
                    apps.find(
                        app =>
                            normalizeAppId(
                                app &&
                                app.id
                            ) === normalized
                    ) ||
                    null
                );
            }

        } catch (error) {

            setError(error);

            log(
                `Registry-Suche fehlgeschlagen: ${error.message}`,
                "warning"
            );
        }

        return null;
    }


    /* ========================================================
       23 — ROUTE VALIDIEREN
       ======================================================== */

    function validateRoute(route) {

        const parsed =
            parseRoute(route);

        if (
            parsed.type === "home"
        ) {

            return {

                valid: true,

                route:
                    parsed.route,

                parsed,

                app: null

            };
        }

        if (
            parsed.type !== "app"
        ) {

            return {

                valid: false,

                route:
                    parsed.route,

                parsed,

                app: null,

                reason:
                    "unknown-route"

            };
        }

        if (
            !parsed.appId
        ) {

            return {

                valid: false,

                route:
                    parsed.route,

                parsed,

                app: null,

                reason:
                    "missing-app-id"

            };
        }

        const app =
            findRegisteredApp(
                parsed.appId
            );

        if (!app) {

            return {

                valid: false,

                route:
                    parsed.route,

                parsed,

                app: null,

                reason:
                    "app-not-found"

            };
        }

        if (
            app.enabled === false
        ) {

            return {

                valid: false,

                route:
                    parsed.route,

                parsed,

                app,

                reason:
                    "app-disabled"

            };
        }

        if (
            app.installed === false
        ) {

            return {

                valid: false,

                route:
                    parsed.route,

                parsed,

                app,

                reason:
                    "app-not-installed"

            };
        }

        return {

            valid: true,

            route:
                parsed.route,

            parsed,

            app

        };
    }


    /* ========================================================
       24 — HISTORY EINTRAG
       ======================================================== */

    function addHistory(route) {

        const normalized =
            normalizeRoute(route);

        if (
            !normalized
        ) {
            return;
        }

        /*
         * Wenn wir mitten in der internen
         * History stehen und neu navigieren,
         * werden zukünftige Einträge entfernt.
         */

        if (
            historyIndex <
            routeHistory.length - 1
        ) {

            routeHistory.splice(
                historyIndex + 1
            );
        }

        /*
         * Doppelte direkte Einträge vermeiden.
         */

        if (
            routeHistory[
                routeHistory.length - 1
            ] === normalized
        ) {

            historyIndex =
                routeHistory.length - 1;

            return;
        }

        routeHistory.push(
            normalized
        );

        /*
         * Maximale Größe schützen.
         */

        if (
            routeHistory.length >
            CONFIG.maxHistoryEntries
        ) {

            routeHistory.shift();
        }

        historyIndex =
            routeHistory.length - 1;

        state.historyCount =
            routeHistory.length;
    }


    /* ========================================================
       25 — BROWSER HASH LESEN
       ======================================================== */

    function getHashRoute() {

        const hash =
            String(
                window.location.hash ||
                ""
            ).trim();

        if (!hash) {
            return CONFIG.homeRoute;
        }

        return normalizeRoute(hash);
    }


    /* ========================================================
       26 — BROWSER HASH SETZEN
       ======================================================== */

    function setHashRoute(
        route,
        replace = false
    ) {

        const normalized =
            normalizeRoute(route);

        if (
            !CONFIG.useBrowserHistory
        ) {
            return;
        }

        try {

            if (replace) {

                const url =
                    window.location.href
                        .replace(
                            window.location.hash,
                            normalized
                        );

                window.history.replaceState(
                    {
                        haldoRoute:
                            normalized
                    },
                    "",
                    url
                );

            } else {

                window.location.hash =
                    normalized.substring(1);

            }

        } catch (error) {

            setError(error);

            log(
                `Browser-Route konnte nicht gesetzt werden: ${error.message}`,
                "warning"
            );
        }
    }


    /* ========================================================
       27 — APP ÖFFNEN
       ======================================================== */

    async function openApp(
        appId,
        options = {}
    ) {

        const normalized =
            normalizeAppId(appId);

        if (!normalized) {

            return {

                success: false,

                reason:
                    "missing-app-id"

            };
        }

        const route =
            createAppRoute(
                normalized,
                options
            );

        return navigate(
            route,
            options
        );
    }


    /* ========================================================
       28 — HOME ÖFFNEN
       ======================================================== */

    async function goHome(
        options = {}
    ) {

        return navigate(
            CONFIG.homeRoute,
            {
                ...options,

                replace:
                    options.replace === true
            }
        );
    }


    /* ========================================================
       29 — NAVIGATION
       ======================================================== */

    async function navigate(
        route,
        options = {}
    ) {

        if (
            state.navigating
        ) {

            return {

                success: false,

                reason:
                    "navigation-in-progress",

                route:
                    state.currentRoute

            };
        }

        const normalized =
            normalizeRoute(route);

        const validation =
            validateRoute(
                normalized
            );

        /*
         * Unbekannte Route:
         * sicher nach Home zurück.
         */

        if (
            !validation.valid
        ) {

            const reason =
                validation.reason;

            log(
                `Route abgelehnt: ${normalized} (${reason})`,
                "warning"
            );

            emit(
                "route-rejected",
                {

                    route:
                        normalized,

                    reason,

                    validation

                }
            );

            if (
                options.fallback !== false &&
                normalized !==
                CONFIG.homeRoute
            ) {

                return navigate(
                    CONFIG.homeRoute,
                    {
                        ...options,

                        replace: true,

                        fallback: false

                    }
                );
            }

            return {

                success: false,

                reason,

                route:
                    normalized

            };
        }

        /*
         * Gleiche Route:
         * kein unnötiges erneutes Öffnen.
         */

        if (
            normalized ===
            state.currentRoute &&
            options.force !== true
        ) {

            emit(
                "same-route",
                {

                    route:
                        normalized,

                    parsed:
                        validation.parsed,

                    app:
                        validation.app

                }
            );

            return {

                success: true,

                unchanged: true,

                route:
                    normalized,

                app:
                    validation.app

            };
        }

        state.navigating =
            true;

        state.lastError =
            null;

        const previousRoute =
            state.currentRoute;

        const previousApp =
            state.currentApp;

        try {

            /*
             * BEFORE-NAVIGATE
             */

            emit(
                "before-navigate",
                {

                    from:
                        previousRoute,

                    to:
                        normalized,

                    parsed:
                        validation.parsed,

                    app:
                        validation.app,

                    options

                }
            );

            /*
             * HOME
             */

            if (
                validation.parsed.type ===
                "home"
            ) {

                await closeCurrentApp(
                    options
                );

                state.previousRoute =
                    previousRoute;

                state.previousApp =
                    previousApp;

                state.currentRoute =
                    CONFIG.homeRoute;

                state.currentApp =
                    null;

                state.navigationCount++;

                state.lastNavigation = {

                    from:
                        previousRoute,

                    to:
                        CONFIG.homeRoute,

                    type:
                        "home",

                    timestamp:
                        Date.now()

                };

                if (
                    options.history !== false
                ) {

                    addHistory(
                        CONFIG.homeRoute
                    );
                }

                if (
                    options.updateHash !==
                    false
                ) {

                    setHashRoute(
                        CONFIG.homeRoute,
                        options.replace === true
                    );
                }

                emit(
                    "home",
                    {

                        route:
                            CONFIG.homeRoute,

                        previousRoute

                    }
                );

                emit(
                    "navigated",
                    {

                        from:
                            previousRoute,

                        to:
                            CONFIG.homeRoute,

                        app:
                            null,

                        type:
                            "home"

                    }
                );

                state.ready =
                    true;

                return {

                    success: true,

                    route:
                        CONFIG.homeRoute,

                    app:
                        null

                };
            }

            /*
             * APP
             */

            const app =
                validation.app;

            const manager =
                getAppManager();

            if (!manager) {

                throw new Error(
                    "HalDoAppManager ist nicht verfügbar."
                );
            }

            await switchToApp(
                manager,
                app,
                validation.parsed,
                options
            );

            state.previousRoute =
                previousRoute;

            state.previousApp =
                previousApp;

            state.currentRoute =
                normalized;

            state.currentApp =
                app;

            state.navigationCount++;

            state.lastNavigation = {

                from:
                    previousRoute,

                to:
                    normalized,

                type:
                    "app",

                appId:
                    app.id,

                timestamp:
                    Date.now()

            };

            if (
                options.history !== false
            ) {

                addHistory(
                    normalized
                );
            }

            if (
                options.updateHash !==
                false
            ) {

                setHashRoute(
                    normalized,
                    options.replace === true
                );
            }

            emit(
                "app-opened",
                {

                    route:
                        normalized,

                    app,

                    parsed:
                        validation.parsed

                }
            );

            emit(
                "navigated",
                {

                    from:
                        previousRoute,

                    to:
                        normalized,

                    app,

                    type:
                        "app"

                }
            );

            state.ready =
                true;

            return {

                success: true,

                route:
                    normalized,

                app,

                parsed:
                    validation.parsed

            };

        } catch (error) {

            setError(error);

            log(
                `Navigation fehlgeschlagen: ${error.message}`,
                "error"
            );

            emit(
                "navigation-error",
                {

                    error,

                    route:
                        normalized,

                    from:
                        previousRoute

                }
            );

            return {

                success: false,

                reason:
                    "navigation-error",

                error,

                route:
                    normalized

            };

        } finally {

            state.navigating =
                false;
        }
    }


    /* ========================================================
       30 — ZU APP WECHSELN
       ======================================================== */

    async function switchToApp(
        manager,
        app,
        parsed,
        options
    ) {

        /*
         * Vorherige App schließen,
         * wenn der Manager dies unterstützt.
         */

        const current =
            getCurrentApp();

        if (
            current &&
            current.id &&
            current.id !== app.id
        ) {

            await stopApp(
                manager,
                current.id,
                options
            );
        }

        /*
         * openApp bevorzugen.
         */

        if (
            typeof manager.openApp ===
            "function"
        ) {

            const result =
                await Promise.resolve(
                    manager.openApp(
                        app.id,
                        {
                            route:
                                parsed.route,

                            params:
                                parsed.params,

                            query:
                                parsed.query,

                            router:
                                api
                        }
                    )
                );

            if (
                result === false
            ) {

                throw new Error(
                    `App Manager konnte "${app.id}" nicht öffnen.`
                );
            }

            return result;
        }

        /*
         * launchApp als Kompatibilitätsweg.
         */

        if (
            typeof manager.launchApp ===
            "function"
        ) {

            const result =
                await Promise.resolve(
                    manager.launchApp(
                        app.id,
                        {
                            route:
                                parsed.route,

                            params:
                                parsed.params,

                            query:
                                parsed.query,

                            router:
                                api
                        }
                    )
                );

            if (
                result === false
            ) {

                throw new Error(
                    `App Manager konnte "${app.id}" nicht starten.`
                );
            }

            return result;
        }

        throw new Error(
            "Der App Manager besitzt keine kompatible openApp-/launchApp-API."
        );
    }


    /* ========================================================
       31 — APP STOPPEN
       ======================================================== */

    async function stopApp(
        manager,
        appId,
        options = {}
    ) {

        if (!manager) {
            return false;
        }

        try {

            if (
                typeof manager.stopApp ===
                "function"
            ) {

                return await Promise.resolve(
                    manager.stopApp(
                        appId,
                        options
                    )
                );
            }

            if (
                typeof manager.closeApp ===
                "function"
            ) {

                return await Promise.resolve(
                    manager.closeApp(
                        appId,
                        options
                    )
                );
            }

        } catch (error) {

            log(
                `App "${appId}" konnte nicht geschlossen werden: ${error.message}`,
                "warning"
            );

        }

        return false;
    }


    /* ========================================================
       32 — AKTUELLE APP SCHLIESSEN
       ======================================================== */

    async function closeCurrentApp(
        options = {}
    ) {

        const manager =
            getAppManager();

        const current =
            getCurrentApp();

        if (
            !manager ||
            !current ||
            !current.id
        ) {

            return true;
        }

        await stopApp(
            manager,
            current.id,
            options
        );

        return true;
    }


    /* ========================================================
       33 — BACK
       ======================================================== */

    async function back() {

        /*
         * Browser-History bevorzugen.
         */

        if (
            CONFIG.useBrowserHistory &&
            window.history.length > 1
        ) {

            window.history.back();

            return {

                success: true,

                browserHistory: true

            };
        }

        /*
         * Interne History als Fallback.
         */

        if (
            historyIndex > 0
        ) {

            historyIndex--;

            const route =
                routeHistory[
                    historyIndex
                ];

            return navigate(
                route,
                {
                    history: false,
                    updateHash: true
                }
            );
        }

        return {

            success: false,

            reason:
                "no-history"

        };
    }


    /* ========================================================
       34 — FORWARD
       ======================================================== */

    async function forward() {

        if (
            CONFIG.useBrowserHistory &&
            window.history.length > 1
        ) {

            window.history.forward();

            return {

                success: true,

                browserHistory: true

            };
        }

        if (
            historyIndex <
            routeHistory.length - 1
        ) {

            historyIndex++;

            const route =
                routeHistory[
                    historyIndex
                ];

            return navigate(
                route,
                {
                    history: false,
                    updateHash: true
                }
            );
        }

        return {

            success: false,

            reason:
                "no-forward-history"

        };
    }


    /* ========================================================
       35 — RELOAD AKTUELLE ROUTE
       ======================================================== */

    async function reload() {

        const route =
            state.currentRoute;

        return navigate(
            route,
            {
                force: true,

                history: false,

                updateHash: false

            }
        );
    }


    /* ========================================================
       36 — HASH-CHANGE
       ======================================================== */

    async function handleHashChange() {

        if (
            state.handlingHashChange
        ) {

            return;
        }

        state.handlingHashChange =
            true;

        try {

            const route =
                getHashRoute();

            await navigate(
                route,
                {
                    history: true,

                    updateHash: false
                }
            );

        } finally {

            state.handlingHashChange =
                false;
        }
    }


    /* ========================================================
       37 — ROUTER START
       ======================================================== */

    async function start() {

        if (
            state.initialized
        ) {

            return true;
        }

        state.startTime =
            Date.now();

        state.initialized =
            true;

        state.managerReady =
            isManagerReady();

        state.registryReady =
            isRegistryReady();

        emit(
            "initializing",
            diagnose()
        );

        /*
         * Wenn Manager/Registry noch nicht
         * vorhanden sind, später erneut prüfen.
         */

        if (
            !state.registryReady ||
            !state.managerReady
        ) {

            log(
                "Registry oder App Manager ist beim Router-Start noch nicht vollständig bereit.",
                "warning"
            );
        }

        /*
         * Browser-Hash auswerten.
         */

        const initialRoute =
            getHashRoute();

        /*
         * Start-Route in interne History.
         */

        if (
            !routeHistory.length
        ) {

            addHistory(
                initialRoute
            );
        }

        /*
         * Navigation leicht verzögern,
         * damit Kernel/Manager Zeit haben.
         */

        if (
            CONFIG.startupDelay > 0
        ) {

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        CONFIG.startupDelay
                    )
            );
        }

        /*
         * Initiale Navigation.
         */

        await navigate(
            initialRoute,
            {
                history: false,

                updateHash: false
            }
        );

        state.ready =
            true;

        emit(
            "ready",
            diagnose()
        );

        log(
            "App Router ist bereit."
        );

        return true;
    }


    /* ========================================================
       38 — REGISTRY / MANAGER BEREITSCHAFT PRÜFEN
       ======================================================== */

    function refreshDependencies() {

        state.managerReady =
            isManagerReady();

        state.registryReady =
            isRegistryReady();

        if (
            state.managerReady
        ) {

            emit(
                "manager-ready",
                getAppManager()
            );
        }

        if (
            state.registryReady
        ) {

            emit(
                "registry-ready",
                getAppRegistry()
            );
        }

        return {

            managerReady:
                state.managerReady,

            registryReady:
                state.registryReady

        };
    }


    /* ========================================================
       39 — ROUTEN-INFO
       ======================================================== */

    function getRouteInfo(route) {

        const normalized =
            normalizeRoute(
                route || state.currentRoute
            );

        const parsed =
            parseRoute(
                normalized
            );

        const validation =
            validateRoute(
                normalized
            );

        return {

            ...parsed,

            valid:
                validation.valid,

            app:
                validation.app,

            reason:
                validation.reason ||
                null

        };
    }


    /* ========================================================
       40 — HISTORY ABFRAGEN
       ======================================================== */

    function getHistory() {

        return [
            ...routeHistory
        ];
    }


    function clearHistory() {

        routeHistory.length = 0;

        historyIndex = -1;

        state.historyCount = 0;

        emit(
            "history-cleared"
        );

        return true;
    }


    /* ========================================================
       41 — KANN ZURÜCK?
       ======================================================== */

    function canGoBack() {

        return (
            historyIndex > 0
        );
    }


    /* ========================================================
       42 — KANN VOR?
       ======================================================== */

    function canGoForward() {

        return (
            historyIndex <
            routeHistory.length - 1
        );
    }


    /* ========================================================
       43 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        const currentInfo =
            getRouteInfo(
                state.currentRoute
            );

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            edition:
                CONFIG.edition,

            initialized:
                state.initialized,

            ready:
                state.ready,

            navigating:
                state.navigating,

            managerReady:
                isManagerReady(),

            registryReady:
                isRegistryReady(),

            currentRoute:
                state.currentRoute,

            previousRoute:
                state.previousRoute,

            currentApp:
                state.currentApp,

            previousApp:
                state.previousApp,

            currentRouteInfo:
                currentInfo,

            navigationCount:
                state.navigationCount,

            historyCount:
                routeHistory.length,

            historyIndex,

            canGoBack:
                canGoBack(),

            canGoForward:
                canGoForward(),

            lastError:
                state.lastError,

            lastNavigation:
                state.lastNavigation,

            uptime:
                state.startTime
                    ? Date.now() -
                      state.startTime
                    : 0

        };
    }


    /* ========================================================
       44 — ÖFFENTLICHE API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,

        config:
            CONFIG,

        state,

        on,

        off,

        emit,

        initialize:
            start,

        start,

        navigate,

        openApp,

        goHome,

        home:
            goHome,

        back,

        forward,

        reload,

        parseRoute,

        normalizeRoute,

        createAppRoute,

        getCurrentRoute,

        getCurrentApp,

        getAppIdFromRoute,

        getRouteInfo,

        isHomeRoute,

        isAppRoute,

        validateRoute,

        findRegisteredApp,

        getHistory,

        clearHistory,

        canGoBack,

        canGoForward,

        refreshDependencies,

        diagnose

    };


    /* ========================================================
       45 — GLOBALE API
       ======================================================== */

    window.HalDoAppRouter =
        api;


    window.HalDo =
        window.HalDo ||
        {};

    window.HalDo.appRouter =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};

    window.HalDoOS.appRouter =
        api;


    /* ========================================================
       46 — HASH LISTENER
       ======================================================== */

    if (
        CONFIG.listenToHashChange
    ) {

        window.addEventListener(
            "hashchange",
            handleHashChange
        );
    }


    /* ========================================================
       47 — KERNEL-EVENTS
       ======================================================== */

    window.addEventListener(
        "haldo:app-manager-ready",
        function () {

            refreshDependencies();

            if (
                !state.ready
            ) {

                start();

            }

        }
    );


    window.addEventListener(
        "haldo:app-registry-ready",
        function () {

            refreshDependencies();

            if (
                !state.ready
            ) {

                start();

            }

        }
    );


    /* ========================================================
       48 — DOM START
       ======================================================== */

    function boot() {

        refreshDependencies();

        start()
            .catch(error => {

                setError(error);

                log(
                    `Router-Startfehler: ${error.message}`,
                    "error"
                );

            });
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot,
            {
                once: true
            }
        );

    } else {

        boot();

    }


    /* ========================================================
       49 — DEBUG
       ======================================================== */

    console.log(
        "=============================================="
    );

    console.log(
        "HalDo AI OS 18 App Router"
    );

    console.log(
        "Professional Ultimate Foundation"
    );

    console.log(
        "Router:",
        window.HalDoAppRouter
    );

    console.log(
        "=============================================="
    );


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 APP ROUTER
   ============================================================ */