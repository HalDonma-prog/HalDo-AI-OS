/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/app-router.js

   ZENTRALER APP ROUTER

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
       launcher.js
           ↓
       echte App-Module

   AUFGABEN:
   - zentrale Navigation
   - Home-Navigation
   - App-Navigation
   - App Manager Verbindung
   - App Registry Verbindung
   - Browser History
   - Hash / Route Unterstützung
   - Deep Links
   - Zurück / Vorwärts
   - Route History
   - Events
   - Diagnose
   - Fehlerbehandlung

   WICHTIG:
   - keine eigene App-Datenbank
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

        name:
            "HalDo AI OS App Router",

        version:
            "18.0.0",

        homeRoute:
            "#/home",

        appPrefix:
            "#/app/",

        maxHistoryEntries:
            200,

        startupDelay:
            0,

        moduleWaitInterval:
            100,

        moduleWaitAttempts:
            100

    };


    /* ========================================================
       02 — STATUS
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
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
       03 — ROUTE HISTORY
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
       06 — APP MANAGER
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
       07 — APP REGISTRY
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
       08 — APP-ID NORMALISIEREN
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
       09 — ROUTE NORMALISIEREN
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
         * Vollständige URL mit Hash.
         */

        if (
            value.includes(
                "#/"
            )
        ) {

            value =
                "#" +
                value.split(
                    "#"
                )[1];

        }


        /*
         * Home.
         */

        if (
            value ===
            "#" ||
            value ===
            "#/" ||
            value ===
            "/"
        ) {

            return CONFIG.homeRoute;

        }


        /*
         * Route ohne #.
         */

        if (
            value.startsWith(
                "/app/"
            )
        ) {

            value =
                "#" +
                value;

        }


        if (
            value.startsWith(
                "app/"
            )
        ) {

            value =
                "#/" +
                value;

        }


        if (
            value.startsWith(
                "home"
            )
        ) {

            value =
                "#/home";

        }


        /*
         * App-ID direkt angegeben.
         */

        if (
            !value.startsWith(
                "#/"
            )
        ) {

            value =
                CONFIG.appPrefix +
                normalizeAppId(
                    value
                );

        }


        /*
         * Doppelte Slashes entfernen.
         */

        value =
            value.replace(
                /\/{2,}/g,
                "/"
            );


        /*
         * Trailing Slash entfernen.
         */

        if (
            value.length > 1 &&
            value.endsWith("/")
        ) {

            value =
                value.slice(
                    0,
                    -1
                );

        }


        return value;

    }


    /* ========================================================
       10 — QUERY STRING PARSEN
       ======================================================== */

    function parseQuery(
        queryString
    ) {

        const result = {};


        if (
            !queryString
        ) {

            return result;

        }


        const query =
            String(
                queryString
            )
            .replace(
                /^\?/,
                ""
            );


        if (
            !query
        ) {

            return result;

        }


        query
            .split("&")
            .forEach(
                part => {

                    if (
                        !part
                    ) {

                        return;

                    }


                    const pieces =
                        part.split("=");


                    const key =
                        decodeURIComponent(
                            pieces[0] ||
                            ""
                        );


                    const value =
                        decodeURIComponent(
                            pieces
                                .slice(1)
                                .join("=") ||
                            ""
                        );


                    if (
                        key
                    ) {

                        result[key] =
                            value;

                    }

                }
            );


        return result;

    }


    /* ========================================================
       11 — ROUTE PARSEN
       ======================================================== */

    function parseRoute(
        route
    ) {

        const normalized =
            normalizeRoute(
                route
            );


        if (
            normalized ===
            CONFIG.homeRoute
        ) {

            return {

                type:
                    "home",

                route:
                    normalized,

                appId:
                    null,

                params:
                    {},

                query:
                    {}

            };

        }


        const withoutHash =
            normalized.replace(
                /^#/,
                ""
            );


        const queryIndex =
            withoutHash.indexOf(
                "?"
            );


        const path =
            queryIndex >= 0
                ? withoutHash.slice(
                    0,
                    queryIndex
                )
                : withoutHash;


        const queryString =
            queryIndex >= 0
                ? withoutHash.slice(
                    queryIndex + 1
                )
                : "";


        const query =
            parseQuery(
                queryString
            );


        if (
            path.startsWith(
                "/app/"
            )
        ) {

            const appId =
                normalizeAppId(
                    path
                        .slice(
                            5
                        )
                        .split(
                            "/"
                        )[0]
                );


            if (
                !appId
            ) {

                return {

                    type:
                        "unknown",

                    route:
                        normalized,

                    appId:
                        null,

                    params:
                        {},

                    query

                };

            }


            return {

                type:
                    "app",

                route:
                    normalized,

                appId,

                params:
                    {},

                query

            };

        }


        return {

            type:
                "unknown",

            route:
                normalized,

            appId:
                null,

            params:
                {},

            query

        };

    }


    /* ========================================================
       12 — APP ROUTE ERSTELLEN
       ======================================================== */

    function createAppRoute(
        appId,
        options = {}
    ) {

        const normalized =
            normalizeAppId(
                appId
            );


        if (
            !normalized
        ) {

            return CONFIG.homeRoute;

        }


        let route =
            CONFIG.appPrefix +
            encodeURIComponent(
                normalized
            );


        const params =
            options.params ||
            {};


        const query =
            options.query ||
            {};


        Object.keys(
            params
        )
        .forEach(
            key => {

                const value =
                    params[key];


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


        const queryKeys =
            Object.keys(
                query
            )
            .filter(
                key =>
                    query[key] !==
                    undefined &&
                    query[key] !==
                    null
            );


        if (
            queryKeys.length
        ) {

            route +=
                "?" +
                queryKeys
                    .map(
                        key =>
                            encodeURIComponent(
                                key
                            ) +
                            "=" +
                            encodeURIComponent(
                                String(
                                    query[key]
                                )
                            )
                    )
                    .join(
                        "&"
                    );

        }


        return route;

    }


    /* ========================================================
       13 — ROUTE PRÜFUNGEN
       ======================================================== */

    function isHomeRoute(
        route
    ) {

        return (
            normalizeRoute(
                route
            ) ===
            CONFIG.homeRoute
        );

    }


    function isAppRoute(
        route
    ) {

        const parsed =
            parseRoute(
                route
            );


        return (
            parsed.type ===
            "app"
        );

    }


    function getAppIdFromRoute(
        route
    ) {

        const parsed =
            parseRoute(
                route
            );


        return (
            parsed.appId ||
            null
        );

    }


    /* ========================================================
       14 — ALLE APPS
       ======================================================== */

    function getAllApps() {

        const manager =
            getAppManager();


        if (
            manager &&
            typeof manager.getAllApps ===
            "function"
        ) {

            const apps =
                manager.getAllApps();


            if (
                Array.isArray(
                    apps
                )
            ) {

                return apps;

            }

        }


        const registry =
            getAppRegistry();


        if (
            registry
        ) {

            if (
                typeof registry.getAllApps ===
                "function"
            ) {

                const apps =
                    registry.getAllApps();


                if (
                    Array.isArray(
                        apps
                    )
                ) {

                    return apps;

                }

            }


            if (
                typeof registry.getAll ===
                "function"
            ) {

                const apps =
                    registry.getAll();


                if (
                    Array.isArray(
                        apps
                    )
                ) {

                    return apps;

                }

            }


            if (
                Array.isArray(
                    registry.definitions
                )
            ) {

                return [
                    ...registry.definitions
                ];

            }

        }


        return [];

    }


    /* ========================================================
       15 — APP HOLEN
       ======================================================== */

    function getApp(
        appId
    ) {

        const normalized =
            normalizeAppId(
                appId
            );


        if (
            !normalized
        ) {

            return null;

        }


        const manager =
            getAppManager();


        if (
            manager &&
            typeof manager.getApp ===
            "function"
        ) {

            const app =
                manager.getApp(
                    normalized
                );


            if (
                app
            ) {

                return app;

            }

        }


        return getAllApps()
            .find(
                app =>
                    app &&
                    normalizeAppId(
                        app.id
                    ) ===
                    normalized
            ) ||
            null;

    }


    /* ========================================================
       16 — BROWSER HISTORY
       ======================================================== */

    function updateBrowserHistory(
        route,
        options = {}
    ) {

        if (
            options.history ===
            false
        ) {

            return;

        }


        const replace =
            options.replace ===
            true;


        const stateData = {

            haldoRouter:
                true,

            route

        };


        try {

            if (
                replace
            ) {

                window.history.replaceState(
                    stateData,
                    "",
                    route
                );

            }
            else {

                window.history.pushState(
                    stateData,
                    "",
                    route
                );

            }

        }
        catch (
            error
        ) {

            state.lastError =
                error &&
                error.message
                    ? error.message
                    : String(
                        error
                    );


            /*
             * Fallback.
             */

            try {

                window.location.hash =
                    route.replace(
                        /^#/,
                        ""
                    );

            }
            catch (
                fallbackError
            ) {

                log(
                    fallbackError.message,
                    "warning"
                );

            }

        }

    }


    /* ========================================================
       17 — ROUTE HISTORY
       ======================================================== */

    function addRouteHistory(
        route
    ) {

        routeHistory.push(
            route
        );


        while (
            routeHistory.length >
            CONFIG.maxHistoryEntries
        ) {

            routeHistory.shift();

        }


        state.historyCount =
            routeHistory.length;

    }


    function clearRouteHistory() {

        routeHistory.length =
            0;


        state.historyCount =
            0;


        return true;

    }


    function getRouteHistory() {

        return [
            ...routeHistory
        ];

    }


    /* ========================================================
       18 — AKTUELLE ROUTE
       ======================================================== */

    function getCurrentRoute() {

        return state.currentRoute;

    }


    function getCurrentApp() {

        return state.currentApp;

    }


    /* ========================================================
       19 — APP ÖFFNEN
       ======================================================== */

    async function openRouteApp(
        parsedRoute,
        options = {}
    ) {

        const appId =
            parsedRoute.appId;


        const app =
            getApp(
                appId
            );


        if (
            !app
        ) {

            return {

                success:
                    false,

                status:
                    "app-not-found",

                appId,

                error:
                    `App "${appId}" ist nicht registriert.`

            };

        }


        const manager =
            getAppManager();


        if (
            !manager
        ) {

            return {

                success:
                    false,

                status:
                    "manager-unavailable",

                app,

                error:
                    "HalDoAppManager ist nicht verfügbar."

            };

        }


        if (
            typeof manager.openApp !==
            "function"
        ) {

            return {

                success:
                    false,

                status:
                    "manager-invalid",

                app,

                error:
                    "HalDoAppManager.openApp() ist nicht verfügbar."

            };

        }


        emit(
            "before-app-navigation",
            {

                app,

                appId,

                route:
                    parsedRoute.route,

                params:
                    parsedRoute.params,

                query:
                    parsedRoute.query

            }
        );


        try {

            const result =
                await manager.openApp(
                    appId,
                    options
                );


            /*
             * Einige Manager geben
             * keinen Rückgabewert zurück.
             * Das darf Navigation nicht
             * automatisch als Fehler behandeln.
             */

            if (
                result &&
                result.success ===
                false
            ) {

                return {

                    success:
                        false,

                    status:
                        "app-open-failed",

                    app,

                    result,

                    error:
                        result.error ||
                        "Die App konnte nicht geöffnet werden."

                };

            }


            return {

                success:
                    true,

                status:
                    "app-opened",

                app,

                result:
                    result || null,

                params:
                    parsedRoute.params,

                query:
                    parsedRoute.query

            };

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


            return {

                success:
                    false,

                status:
                    "manager-error",

                app,

                error:
                    message

            };

        }

    }


    /* ========================================================
       20 — HOME ÖFFNEN
       ======================================================== */

    async function openHome(
        options = {}
    ) {

        const route =
            CONFIG.homeRoute;


        const previousRoute =
            state.currentRoute;


        const previousApp =
            state.currentApp;


        state.previousRoute =
            previousRoute;


        state.previousApp =
            previousApp;


        const manager =
            getAppManager();


        /*
         * Aktive App stoppen,
         * falls der Manager diese
         * Funktion anbietet.
         */

        if (
            manager &&
            typeof manager.getActiveApp ===
            "function" &&
            typeof manager.stopApp ===
            "function"
        ) {

            try {

                const activeApp =
                    manager.getActiveApp();


                if (
                    activeApp &&
                    activeApp.id
                ) {

                    await manager.stopApp(
                        activeApp.id
                    );

                }

            }
            catch (
                error
            ) {

                log(
                    `Aktive App konnte nicht sauber beendet werden: ${error.message}`,
                    "warning"
                );

            }

        }


        state.currentRoute =
            route;


        state.currentApp =
            null;


        state.navigationCount++;


        updateBrowserHistory(
            route,
            options
        );


        if (
            options.record !==
            false
        ) {

            addRouteHistory(
                route
            );

        }


        const detail = {

            route,

            previousRoute,

            previousApp,

            app:
                null,

            type:
                "home"

        };


        emit(
            "route-changing",
            detail
        );


        emit(
            "home-opened",
            detail
        );


        emit(
            "route-changed",
            detail
        );


        return {

            success:
                true,

            status:
                "home",

            route,

            app:
                null

        };

    }


    /* ========================================================
       21 — NAVIGATION
       ======================================================== */

    async function navigate(
        route,
        options = {}
    ) {

        const normalized =
            normalizeRoute(
                route
            );


        const parsed =
            parseRoute(
                normalized
            );


        state.lastError =
            null;


        /*
         * Unbekannte Route.
         */

        if (
            parsed.type ===
            "unknown"
        ) {

            state.lastError =
                `Unbekannte Route: ${normalized}`;


            emit(
                "route-error",
                {

                    route:
                        normalized,

                    error:
                        state.lastError

                }
            );


            return {

                success:
                    false,

                status:
                    "unknown-route",

                route:
                    normalized,

                error:
                    state.lastError

            };

        }


        /*
         * Gleiche Route.
         */

        if (
            normalized ===
            state.currentRoute &&
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

                app:
                    state.currentApp

            };

        }


        const previousRoute =
            state.currentRoute;


        const previousApp =
            state.currentApp;


        emit(
            "route-changing",
            {

                route:
                    normalized,

                previousRoute,

                previousApp,

                parsed

            }
        );


        /*
         * HOME
         */

        if (
            parsed.type ===
            "home"
        ) {

            return openHome(
                options
            );

        }


        /*
         * APP
         */

        if (
            parsed.type ===
            "app"
        ) {

            const result =
                await openRouteApp(
                    parsed,
                    options
                );


            if (
                !result.success
            ) {

                state.lastError =
                    result.error;


                emit(
                    "route-error",
                    {

                        route:
                            normalized,

                        parsed,

                        error:
                            result.error,

                        result

                    }
                );


                return result;

            }


            state.previousRoute =
                previousRoute;


            state.previousApp =
                previousApp;


            state.currentRoute =
                normalized;


            state.currentApp =
                result.app;


            state.navigationCount++;


            updateBrowserHistory(
                normalized,
                options
            );


            if (
                options.record !==
                false
            ) {

                addRouteHistory(
                    normalized
                );

            }


            const detail = {

                route:
                    normalized,

                previousRoute,

                previousApp,

                app:
                    result.app,

                params:
                    parsed.params,

                query:
                    parsed.query,

                result

            };


            emit(
                "app-opened",
                detail
            );


            emit(
                "route-changed",
                detail
            );


            return {

                success:
                    true,

                status:
                    "navigated",

                route:
                    normalized,

                app:
                    result.app,

                params:
                    parsed.params,

                query:
                    parsed.query

            };

        }


        return {

            success:
                false,

            status:
                "navigation-failed",

            error:
                "Navigation konnte nicht durchgeführt werden."

        };

    }


    /* ========================================================
       22 — APP NAVIGIEREN
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
            options
        );

    }


    /*
     * Alias für Kompatibilität.
     */

    async function goToApp(
        appId,
        options = {}
    ) {

        return navigateToApp(
            appId,
            options
        );

    }


    /* ========================================================
       23 — REPLACE
       ======================================================== */

    async function replace(
        route,
        options = {}
    ) {

        return navigate(
            route,
            {

                ...options,

                replace:
                    true

            }
        );

    }


    /* ========================================================
       24 — HOME ALIAS
       ======================================================== */

    async function home(
        options = {}
    ) {

        return openHome(
            options
        );

    }


    /* ========================================================
       25 — BACK
       ======================================================== */

    function back() {

        try {

            window.history.back();


            emit(
                "router-back",
                {

                    route:
                        state.currentRoute

                }
            );


            return {

                success:
                    true,

                status:
                    "history-back"

            };

        }
        catch (
            error
        ) {

            state.lastError =
                error.message;


            return {

                success:
                    false,

                error:
                    error.message

            };

        }

    }


    /* ========================================================
       26 — FORWARD
       ======================================================== */

    function forward() {

        try {

            window.history.forward();


            emit(
                "router-forward",
                {

                    route:
                        state.currentRoute

                }
            );


            return {

                success:
                    true,

                status:
                    "history-forward"

            };

        }
        catch (
            error
        ) {

            state.lastError =
                error.message;


            return {

                success:
                    false,

                error:
                    error.message

            };

        }

    }


    /* ========================================================
       27 — SEARCH ROUTES
       ======================================================== */

    function searchRoutes(
        query
    ) {

        const text =
            String(
                query ||
                ""
            )
            .trim()
            .toLowerCase();


        if (
            !text
        ) {

            return [];

        }


        return getAllApps()
            .filter(
                app => {

                    if (
                        !app
                    ) {

                        return false;

                    }


                    const keywords =
                        Array.isArray(
                            app.keywords
                        )
                            ? app.keywords
                            : [];


                    const content =
                        [

                            app.id,

                            app.name,

                            app.title,

                            app.description,

                            app.category,

                            ...keywords

                        ]
                        .join(
                            " "
                        )
                        .toLowerCase();


                    return content.includes(
                        text
                    );

                }
            )
            .map(
                app => ({

                    app,

                    route:
                        createAppRoute(
                            app.id
                        )

                })
            );

    }


    /* ========================================================
       28 — RELOAD
       ======================================================== */

    async function reload() {

        return navigate(
            state.currentRoute,
            {

                force:
                    true,

                history:
                    false,

                record:
                    false

            }
        );

    }


    /* ========================================================
       29 — HASH ROUTE
       ======================================================== */

    function getHashRoute() {

        const hash =
            String(
                window.location.hash ||
                ""
            )
            .trim();


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
       30 — HASH CHANGE
       ======================================================== */

    async function handleHashChange() {

        const route =
            getHashRoute();


        if (
            route ===
            state.currentRoute
        ) {

            return;

        }


        await navigate(
            route,
            {

                history:
                    false,

                record:
                    true

            }
        );

    }


    /* ========================================================
       31 — POPSTATE
       ======================================================== */

    async function handlePopState(
        event
    ) {

        const route =
            event &&
            event.state &&
            event.state.haldoRouter
                ? normalizeRoute(
                    event.state.route
                )
                : getHashRoute();


        await navigate(
            route,
            {

                history:
                    false,

                record:
                    true

            }
        );

    }


    /* ========================================================
       32 — INITIAL ROUTE
       ======================================================== */

    async function initializeRoute() {

        const hash =
            String(
                window.location.hash ||
                ""
            )
            .trim();


        if (
            hash
        ) {

            return navigate(
                hash,
                {

                    history:
                        false,

                    record:
                        true,

                    force:
                        true

                }
            );

        }


        return openHome(
            {

                history:
                    true,

                replace:
                    true,

                record:
                    true

            }
        );

    }


    /* ========================================================
       33 — DEPENDENZEN
       ======================================================== */

    function checkDependencies() {

        const manager =
            getAppManager();


        const registry =
            getAppRegistry();


        return {

            manager:
                Boolean(
                    manager
                ),

            registry:
                Boolean(
                    registry
                ),

            managerOpenApp:
                Boolean(
                    manager &&
                    typeof manager.openApp ===
                    "function"
                ),

            managerGetApp:
                Boolean(
                    manager &&
                    typeof manager.getApp ===
                    "function"
                ),

            registryApps:
                Boolean(
                    registry &&
                    (
                        typeof registry.getAllApps ===
                        "function" ||

                        typeof registry.getAll ===
                        "function" ||

                        Array.isArray(
                            registry.definitions
                        )
                    )
                )

        };

    }


    /* ========================================================
       34 — STATUS
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            currentRoute:
                state.currentRoute,

            previousRoute:
                state.previousRoute,

            currentApp:
                state.currentApp,

            previousApp:
                state.previousApp,

            navigationCount:
                state.navigationCount,

            historyCount:
                state.historyCount,

            lastError:
                state.lastError,

            startTime:
                state.startTime

        };

    }


    /* ========================================================
       35 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            state:
                getState(),

            dependencies:
                checkDependencies(),

            currentRoute:
                getCurrentRoute(),

            currentApp:
                getCurrentApp(),

            routeHistory:
                getRouteHistory(),

            apps:
                getAllApps().length

        };

    }


    /* ========================================================
       36 — INITIALISIERUNG
       ======================================================== */

    async function init() {

        if (
            state.initialized
        ) {

            return getState();

        }


        state.startTime =
            Date.now();


        const dependencies =
            checkDependencies();


        /*
         * Der Router darf sich
         * registrieren, auch wenn
         * einzelne Abhängigkeiten
         * noch nicht vollständig
         * bereit sind.
         */

        state.initialized =
            true;


        state.ready =
            true;


        /*
         * Kernel.
         */

        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.registerModule ===
            "function"
        ) {

            window.HalDoKernel.registerModule(
                "app-router",
                api
            );


            if (
                typeof window.HalDoKernel.setModuleReady ===
                "function"
            ) {

                window.HalDoKernel.setModuleReady(
                    "app-router",
                    true
                );

            }

        }


        /*
         * System.
         */

        if (
            window.HalDoSystem &&
            typeof window.HalDoSystem.registerService ===
            "function"
        ) {

            window.HalDoSystem.registerService(
                "app-router",
                api
            );

        }


        /*
         * Events vom App Manager.
         */

        const manager =
            getAppManager();


        if (
            manager &&
            typeof manager.on ===
            "function"
        ) {

            manager.on(
                "app-opened",
                data => {

                    if (
                        data &&
                        data.app
                    ) {

                        state.currentApp =
                            data.app;

                    }

                }
            );


            manager.on(
                "app-stopped",
                data => {

                    if (
                        data &&
                        data.app &&
                        state.currentApp &&
                        data.app.id ===
                        state.currentApp.id
                    ) {

                        state.currentApp =
                            null;

                    }

                }
            );

        }


        /*
         * Browser Events.
         */

        window.addEventListener(
            "hashchange",
            handleHashChange
        );


        window.addEventListener(
            "popstate",
            handlePopState
        );


        emit(
            "ready",
            getState()
        );


        window.dispatchEvent(
            new CustomEvent(
                "haldo:app-router-ready",
                {

                    detail:
                        getState()

                }
            )
        );


        if (
            CONFIG.startupDelay >
            0
        ) {

            await new Promise(
                resolve =>
                    window.setTimeout(
                        resolve,
                        CONFIG.startupDelay
                    )
            );

        }


        /*
         * Nur initial navigieren,
         * wenn Manager/Registry vorhanden
         * sind.
         */

        if (
            dependencies.manager &&
            dependencies.registry
        ) {

            await initializeRoute();

        }
        else {

            log(
                "App Manager oder App Registry ist beim Start noch nicht verfügbar. Router bleibt bereit und wartet auf die Module.",
                "warning"
            );

        }


        log(
            "App Router ist bereit."
        );


        return getState();

    }


    /* ========================================================
       37 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,


        init,

        on,

        off,


        normalizeAppId,

        normalizeRoute,

        parseRoute,

        createAppRoute,


        isHomeRoute,

        isAppRoute,

        getAppIdFromRoute,


        getAllApps,

        getApp,


        getCurrentRoute,

        getCurrentApp,


        navigate,

        navigateToApp,

        goToApp,

        replace,

        home,

        openHome,


        back,

        forward,


        reload,


        searchRoutes,


        clearRouteHistory,

        getRouteHistory,

        getHashRoute,


        checkDependencies,

        getState,

        diagnose

    };


    /* ========================================================
       38 — GLOBALE API
       ======================================================== */

    window.HalDoAppRouter =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appRouter =
        api;


    /* ========================================================
       39 — BOOT
       ======================================================== */

    function boot() {

        let attempts =
            0;


        /*
         * Wenn alles schon vorhanden
         * ist, direkt starten.
         */

        const dependencies =
            checkDependencies();


        if (
            dependencies.manager &&
            dependencies.registry
        ) {

            init();

            return;

        }


        /*
         * Router trotzdem registrieren,
         * damit andere Module ihn bereits
         * finden können.
         */

        if (
            !state.initialized
        ) {

            state.initialized =
                true;

            state.ready =
                true;


            if (
                window.HalDoKernel &&
                typeof window.HalDoKernel.registerModule ===
                "function"
            ) {

                window.HalDoKernel.registerModule(
                    "app-router",
                    api
                );

            }


            if (
                window.HalDoSystem &&
                typeof window.HalDoSystem.registerService ===
                "function"
            ) {

                window.HalDoSystem.registerService(
                    "app-router",
                    api
                );

            }

        }


        const timer =
            window.setInterval(
                async function () {

                    attempts++;


                    const ready =
                        checkDependencies();


                    if (
                        ready.manager &&
                        ready.registry
                    ) {

                        window.clearInterval(
                            timer
                        );


                        /*
                         * Initialisierung bereits
                         * erfolgt; Route jetzt laden.
                         */

                        await initializeRoute();


                        emit(
                            "dependencies-ready",
                            ready
                        );


                        return;

                    }


                    if (
                        attempts >=
                        CONFIG.moduleWaitAttempts
                    ) {

                        window.clearInterval(
                            timer
                        );


                        state.lastError =
                            "App Manager oder App Registry konnte beim Start nicht gefunden werden.";


                        log(
                            state.lastError,
                            "warning"
                        );

                    }

                },
                CONFIG.moduleWaitInterval
            );

    }


    /* ========================================================
       40 — DOM START
       ======================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot,
            {
                once:
                    true
            }
        );

    }
    else {

        boot();

    }


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 APP ROUTER
   ============================================================ */