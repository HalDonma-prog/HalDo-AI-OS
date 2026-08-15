/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE STABLE
   ------------------------------------------------------------
   Datei: js/app-router.js

   ZENTRALER APPLICATION ROUTER

   Aufgaben:
   - App-Navigation
   - App-Routen
   - Deep Links
   - Route-Parameter
   - Query-Parameter
   - Navigation History
   - Back / Forward
   - App Registry Verbindung
   - App Manager Verbindung
   - Window Manager Verbindung
   - Kernel Verbindung
   - System Verbindung
   - Navigation Events
   - Route Guards
   - App Open / Close
   - Multitasking-Vorbereitung
   - Deep-Link-Unterstützung
   - Fehlerbehandlung
   - Diagnose
   - Health Check
   - zukünftige Erweiterbarkeit

   Architektur:

       HALDO AI OS
            │
          KERNEL
            │
       APP REGISTRY
            │
       APP MANAGER
            │
       APP ROUTER
            │
       WINDOW MANAGER
            │
       APPLICATION

   ============================================================ */

(function (window, document) {

    "use strict";


    /* ========================================================
       01 — HALDO FOUNDATION
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;


    /* ========================================================
       02 — META
       ======================================================== */

    const VERSION =
        "20.0.0";

    const NAME =
        "HalDo AI OS App Router";

    const MODULE_ID =
        "app-router";


    /* ========================================================
       03 — INTERNAL STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        initializing:
            false,

        ready:
            false,

        currentRoute:
            null,

        previousRoute:
            null,

        history:
            [],

        historyIndex:
            -1,

        routes:
            new Map(),

        guards:
            new Set(),

        listeners:
            new Map(),

        connections: {

            kernel:
                false,

            system:
                false,

            registry:
                false,

            manager:
                false,

            windowManager:
                false

        },

        statistics: {

            navigations:
                0,

            successfulNavigations:
                0,

            failedNavigations:
                0,

            registeredRoutes:
                0,

            guardsBlocked:
                0,

            backNavigations:
                0,

            forwardNavigations:
                0,

            errors:
                0

        }

    };


    /* ========================================================
       04 — LOGGING
       ======================================================== */

    function log() {

        try {

            console.log(
                "[HalDo App Router]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo App Router]",
                ...arguments
            );

        } catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo App Router]",
                ...arguments
            );

        } catch (_) {}

    }


    /* ========================================================
       05 — SAFE HELPERS
       ======================================================== */

    function hasMethod(
        object,
        method
    ) {

        return !!(
            object &&
            typeof object[method] ===
            "function"
        );

    }


    function safeClone(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }


        if (
            Array.isArray(
                value
            )
        ) {

            return value.map(
                safeClone
            );

        }


        if (
            typeof value ===
            "object"
        ) {

            const result = {};


            Object.keys(
                value
            ).forEach(
                function (key) {

                    const item =
                        value[key];


                    if (
                        typeof item !==
                        "function"
                    ) {

                        result[key] =
                            safeClone(
                                item
                            );

                    } else {

                        result[key] =
                            item;

                    }

                }
            );


            return result;

        }


        return value;

    }


    /* ========================================================
       06 — SERVICE LOOKUPS
       ======================================================== */

    function getKernel() {

        return (
            window.HalDoKernel ||
            HalDoOS.kernel ||
            null
        );

    }


    function getSystem() {

        return (
            window.HalDoSystem ||
            HalDoOS.system ||
            null
        );

    }


    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            HalDoOS.appRegistry ||
            window.HalDoOSAppRegistry ||
            null
        );

    }


    function getManager() {

        return (
            window.HalDoAppManager ||
            HalDoOS.appManager ||
            null
        );

    }


    function getWindowManager() {

        return (
            window.HalDoWindowManager ||
            HalDoOS.windowManager ||
            null
        );

    }


    /* ========================================================
       07 — EVENT SYSTEM
       ======================================================== */

    function on(
        event,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return function () {};

        }


        if (
            !state.listeners.has(
                event
            )
        ) {

            state.listeners.set(
                event,
                new Set()
            );

        }


        const listeners =
            state.listeners.get(
                event
            );


        listeners.add(
            callback
        );


        return function () {

            off(
                event,
                callback
            );

        };

    }


    function off(
        event,
        callback
    ) {

        const listeners =
            state.listeners.get(
                event
            );


        if (!listeners) {

            return;

        }


        listeners.delete(
            callback
        );


        if (
            listeners.size ===
            0
        ) {

            state.listeners.delete(
                event
            );

        }

    }


    function emit(
        event,
        data
    ) {

        const listeners =
            state.listeners.get(
                event
            );


        if (listeners) {

            Array.from(
                listeners
            ).forEach(
                function (callback) {

                    try {

                        callback(
                            data
                        );

                    } catch (exception) {

                        reportError(
                            "EVENT_LISTENER_ERROR",
                            exception,
                            {
                                event:
                                    event
                            }
                        );

                    }

                }
            );

        }


        const globalEvents =
            HalDoOS.events;


        if (
            globalEvents &&
            typeof globalEvents.emit ===
            "function"
        ) {

            try {

                globalEvents.emit(
                    "app-router:" + event,
                    data
                );

            } catch (_) {}

        }

    }


    /* ========================================================
       08 — ERROR SYSTEM
       ======================================================== */

    function reportError(
        code,
        exception,
        extra
    ) {

        state.statistics.errors +=
            1;


        const payload = {

            code:
                code ||
                "UNKNOWN_ERROR",

            error:
                exception ||
                null,

            extra:
                extra ||
                null,

            timestamp:
                new Date().toISOString()

        };


        errorLog(
            "[HalDo Router]",
            payload
        );


        emit(
            "error",
            payload
        );


        const kernel =
            getKernel();


        if (
            kernel &&
            hasMethod(
                kernel,
                "reportError"
            )
        ) {

            try {

                kernel.reportError(
                    exception ||
                    new Error(
                        String(
                            code ||
                            "Router error"
                        )
                    ),
                    "App Router: " +
                    String(
                        code ||
                        "UNKNOWN_ERROR"
                    )
                );

            } catch (_) {}

        }


        return payload;

    }


    /* ========================================================
       09 — ROUTE NORMALIZATION
       ======================================================== */

    function normalizeRoute(
        route
    ) {

        if (
            route === null ||
            route === undefined
        ) {

            return "/";

        }


        let value =
            String(
                route
            ).trim();


        if (!value) {

            return "/";

        }


        /*
         * App-Schema:
         *
         * app://ai-chat
         *
         * wird intern zu:
         *
         * /ai-chat
         */

        if (
            value
                .toLowerCase()
                .startsWith(
                    "app://"
                )
        ) {

            value =
                value.substring(
                    6
                );

        }


        /*
         * HalDo-Schema:
         *
         * haldo://apps/ai-chat
         */

        if (
            value
                .toLowerCase()
                .startsWith(
                    "haldo://"
                )
        ) {

            value =
                value.substring(
                    8
                );


            if (
                value
                    .startsWith(
                        "apps/"
                    )
            ) {

                value =
                    value.substring(
                        5
                    );

            }

        }


        if (
            !value.startsWith(
                "/"
            )
        ) {

            value =
                "/" +
                value;

        }


        value =
            value.replace(
                /\/+/g,
                "/"
            );


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
       10 — QUERY PARSING
       ======================================================== */

    function parseQuery(
        query
    ) {

        const result = {};


        if (!query) {

            return result;

        }


        const value =
            String(
                query
            ).replace(
                /^\?/,
                ""
            );


        if (!value) {

            return result;

        }


        value.split(
            "&"
        ).forEach(
            function (part) {

                if (!part) {

                    return;

                }


                const pieces =
                    part.split(
                        "="
                    );


                const key =
                    decodeURIComponent(
                        pieces.shift() ||
                        ""
                    );


                const rawValue =
                    pieces.join(
                        "="
                    );


                if (!key) {

                    return;

                }


                let decoded;


                try {

                    decoded =
                        decodeURIComponent(
                            rawValue
                        );

                } catch (_) {

                    decoded =
                        rawValue;

                }


                result[key] =
                    decoded;

            }
        );


        return result;

    }


    /* ========================================================
       11 — ROUTE PARSING
       ======================================================== */

    function parseRoute(
        route
    ) {

        const normalized =
            normalizeRoute(
                route
            );


        const hashIndex =
            normalized.indexOf(
                "#"
            );


        const withoutHash =
            hashIndex >= 0
                ? normalized.substring(
                    0,
                    hashIndex
                )
                : normalized;


        const queryIndex =
            withoutHash.indexOf(
                "?"
            );


        const pathname =
            queryIndex >= 0
                ? withoutHash.substring(
                    0,
                    queryIndex
                )
                : withoutHash;


        const queryString =
            queryIndex >= 0
                ? withoutHash.substring(
                    queryIndex + 1
                )
                : "";


        const segments =
            pathname
                .split(
                    "/"
                )
                .filter(
                    Boolean
                );


        return {

            original:
                route,

            route:
                normalized,

            pathname:
                pathname || "/",

            queryString:
                queryString,

            query:
                parseQuery(
                    queryString
                ),

            segments:
                segments

        };

    }


    /* ========================================================
       12 — ROUTE MATCHING
       ======================================================== */

    function matchPattern(
        pattern,
        pathname
    ) {

        const normalizedPattern =
            normalizeRoute(
                pattern
            );


        const normalizedPath =
            normalizeRoute(
                pathname
            );


        if (
            normalizedPattern ===
            normalizedPath
        ) {

            return {

                matched:
                    true,

                params:
                    {}

            };

        }


        const patternParts =
            normalizedPattern
                .split("/")
                .filter(
                    Boolean
                );


        const pathParts =
            normalizedPath
                .split("/")
                .filter(
                    Boolean
                );


        if (
            patternParts.length !==
            pathParts.length
        ) {

            return {

                matched:
                    false,

                params:
                    {}

            };

        }


        const params = {};


        for (
            let i = 0;
            i < patternParts.length;
            i++
        ) {

            const patternPart =
                patternParts[i];

            const pathPart =
                pathParts[i];


            if (
                patternPart.startsWith(
                    ":"
                )
            ) {

                const parameterName =
                    patternPart.substring(
                        1
                    );


                if (
                    parameterName
                ) {

                    params[
                        parameterName
                    ] =
                        decodeURIComponent(
                            pathPart
                        );

                }


                continue;

            }


            if (
                patternPart ===
                "*"
            ) {

                params.wildcard =
                    pathParts
                        .slice(i)
                        .map(
                            function (
                                value
                            ) {

                                try {

                                    return decodeURIComponent(
                                        value
                                    );

                                } catch (_) {

                                    return value;

                                }

                            }
                        )
                        .join(
                            "/"
                        );


                return {

                    matched:
                        true,

                    params:
                        params

                };

            }


            if (
                patternPart.toLowerCase() !==
                pathPart.toLowerCase()
            ) {

                return {

                    matched:
                        false,

                    params:
                        {}

                };

            }

        }


        return {

            matched:
                true,

            params:
                params

        };

    }


    /* ========================================================
       13 — ROUTE REGISTRATION
       ======================================================== */

    function registerRoute(
        pattern,
        config
    ) {

        const normalized =
            normalizeRoute(
                pattern
            );


        if (
            !normalized
        ) {

            reportError(
                "INVALID_ROUTE",
                new Error(
                    "Route ist ungültig."
                ),
                {
                    pattern:
                        pattern
                }
            );


            return false;

        }


        const definition =
            (
                config &&
                typeof config ===
                "object"
            )
                ? {
                    ...config
                }
                : {};


        definition.pattern =
            normalized;


        definition.name =
            definition.name ||
            normalized;


        definition.enabled =
            definition.enabled !== false;


        state.routes.set(
            normalized,
            definition
        );


        state.statistics.registeredRoutes +=
            1;


        emit(
            "route-registered",
            {
                route:
                    normalized,

                config:
                    definition
            }
        );


        return true;

    }


    function unregisterRoute(
        pattern
    ) {

        const normalized =
            normalizeRoute(
                pattern
            );


        const existed =
            state.routes.delete(
                normalized
            );


        if (existed) {

            emit(
                "route-unregistered",
                {
                    route:
                        normalized
                }
            );

        }


        return existed;

    }


    function getRoute(
        pattern
    ) {

        const normalized =
            normalizeRoute(
                pattern
            );


        return (
            state.routes.get(
                normalized
            ) ||
            null
        );

    }


    function getRoutes() {

        return Array.from(
            state.routes.values()
        );

    }


    /* ========================================================
       14 — FIND ROUTE
       ======================================================== */

    function resolveRoute(
        pathname
    ) {

        const normalized =
            normalizeRoute(
                pathname
            );


        const exact =
            state.routes.get(
                normalized
            );


        if (
            exact &&
            exact.enabled !== false
        ) {

            return {

                route:
                    exact,

                params:
                    {}

            };

        }


        for (
            const [
                pattern,
                route
            ]
            of state.routes.entries()
        ) {

            if (
                route.enabled === false
            ) {

                continue;

            }


            const match =
                matchPattern(
                    pattern,
                    normalized
                );


            if (
                match.matched
            ) {

                return {

                    route:
                        route,

                    params:
                        match.params

                };

            }

        }


        /*
         * Falls die Registry eine App mit
         * passender route kennt, erzeugen
         * wir automatisch eine Route.
         */

        const registry =
            getRegistry();


        if (registry) {

            const apps =
                hasMethod(
                    registry,
                    "getAll"
                )
                    ? registry.getAll()
                    : [];


            for (
                const app of apps
            ) {

                if (
                    !app ||
                    app.enabled === false
                ) {

                    continue;

                }


                if (
                    app.route
                ) {

                    const appRoute =
                        normalizeRoute(
                            app.route
                        );


                    const match =
                        matchPattern(
                            appRoute,
                            normalized
                        );


                    if (
                        match.matched
                    ) {

                        return {

                            route: {

                                name:
                                    app.name ||
                                    app.id,

                                pattern:
                                    appRoute,

                                appId:
                                    app.id,

                                enabled:
                                    true

                            },

                            params:
                                match.params

                        };

                    }

                }

            }

        }


        return null;

    }


    /* ========================================================
       15 — APP ROUTE RESOLUTION
       ======================================================== */

    function resolveApp(
        appId
    ) {

        const registry =
            getRegistry();


        if (!registry) {

            return null;

        }


        if (
            hasMethod(
                registry,
                "getApp"
            )
        ) {

            return registry.getApp(
                appId
            );

        }


        if (
            hasMethod(
                registry,
                "get"
            )
        ) {

            return registry.get(
                appId
            );

        }


        return null;

    }


    /* ========================================================
       16 — ROUTE GUARDS
       ======================================================== */

    function addGuard(
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return function () {};

        }


        state.guards.add(
            callback
        );


        return function () {

            removeGuard(
                callback
            );

        };

    }


    function removeGuard(
        callback
    ) {

        return state.guards.delete(
            callback
        );

    }


    async function runGuards(
        context
    ) {

        for (
            const guard of state.guards
        ) {

            try {

                const result =
                    await guard(
                        context
                    );


                /*
                 * false blockiert
                 * die Navigation.
                 */

                if (
                    result ===
                    false
                ) {

                    state.statistics.guardsBlocked +=
                        1;


                    emit(
                        "navigation-blocked",
                        {
                            context:
                                context
                        }
                    );


                    return false;

                }

            } catch (exception) {

                reportError(
                    "ROUTE_GUARD_ERROR",
                    exception
                );


                state.statistics.guardsBlocked +=
                    1;


                return false;

            }

        }


        return true;

    }


    /* ========================================================
       17 — HISTORY
       ======================================================== */

    function addHistory(
        entry,
        replace
    ) {

        if (
            replace
        ) {

            if (
                state.historyIndex >=
                0
            ) {

                state.history[
                    state.historyIndex
                ] =
                    entry;

            } else {

                state.history.push(
                    entry
                );

                state.historyIndex =
                    state.history.length -
                    1;

            }


            return;

        }


        /*
         * Alles hinter der aktuellen
         * Position wird entfernt.
         */

        if (
            state.historyIndex <
            state.history.length - 1
        ) {

            state.history =
                state.history.slice(
                    0,
                    state.historyIndex + 1
                );

        }


        state.history.push(
            entry
        );


        state.historyIndex =
            state.history.length -
            1;


        /*
         * History begrenzen.
         */

        if (
            state.history.length >
            100
        ) {

            state.history.shift();

            state.historyIndex -=
                1;

        }

    }


    function getHistory() {

        return state.history.map(
            safeClone
        );

    }


    function canGoBack() {

        return (
            state.historyIndex >
            0
        );

    }


    function canGoForward() {

        return (
            state.historyIndex <
            state.history.length - 1
        );

    }


    /* ========================================================
       18 — WINDOW MANAGER OPEN
       ======================================================== */

    async function openWindow(
        app,
        context
    ) {

        const windowManager =
            getWindowManager();


        if (
            !windowManager
        ) {

            return false;

        }


        try {

            /*
             * Unterschiedliche zukünftige
             * Window-Manager APIs werden
             * unterstützt.
             */

            if (
                hasMethod(
                    windowManager,
                    "openApp"
                )
            ) {

                await windowManager.openApp(
                    app.id,
                    context
                );


                return true;

            }


            if (
                hasMethod(
                    windowManager,
                    "open"
                )
            ) {

                await windowManager.open(
                    app.id,
                    context
                );


                return true;

            }


            if (
                hasMethod(
                    windowManager,
                    "createWindow"
                )
            ) {

                await windowManager.createWindow(
                    {
                        appId:
                            app.id,

                        title:
                            app.title ||
                            app.name,

                        route:
                            context.route,

                        params:
                            context.params,

                        query:
                            context.query

                    }
                );


                return true;

            }

        } catch (exception) {

            reportError(
                "WINDOW_OPEN_ERROR",
                exception,
                {
                    appId:
                        app.id
                }
            );

        }


        return false;

    }


    /* ========================================================
       19 — APP MANAGER OPEN
       ======================================================== */

    async function openApp(
        appId,
        options
    ) {

        const app =
            resolveApp(
                appId
            );


        if (!app) {

            reportError(
                "APP_NOT_FOUND",
                new Error(
                    "App nicht gefunden: " +
                    String(
                        appId
                    )
                ),
                {
                    appId:
                        appId
                }
            );


            return false;

        }


        if (
            app.enabled ===
            false
        ) {

            reportError(
                "APP_DISABLED",
                new Error(
                    "App ist deaktiviert: " +
                    app.id
                ),
                {
                    appId:
                        app.id
                }
            );


            return false;

        }


        const manager =
            getManager();


        if (
            manager
        ) {

            try {

                if (
                    hasMethod(
                        manager,
                        "openApp"
                    )
                ) {

                    const result =
                        await manager.openApp(
                            app.id,
                            options || {}
                        );


                    if (
                        result !==
                        false
                    ) {

                        return true;

                    }

                }


                if (
                    hasMethod(
                        manager,
                        "launch"
                    )
                ) {

                    const result =
                        await manager.launch(
                            app.id,
                            options || {}
                        );


                    if (
                        result !==
                        false
                    ) {

                        return true;

                    }

                }


                if (
                    hasMethod(
                        manager,
                        "open"
                    )
                ) {

                    const result =
                        await manager.open(
                            app.id,
                            options || {}
                        );


                    if (
                        result !==
                        false
                    ) {

                        return true;

                    }

                }

            } catch (exception) {

                reportError(
                    "APP_MANAGER_OPEN_ERROR",
                    exception,
                    {
                        appId:
                            app.id
                    }
                );

            }

        }


        /*
         * Fallback:
         * App selbst öffnen.
         */

        if (
            hasMethod(
                app,
                "open"
            )
        ) {

            try {

                const result =
                    await app.open(
                        options || {}
                    );


                return result !==
                    false;

            } catch (exception) {

                reportError(
                    "APP_OPEN_ERROR",
                    exception,
                    {
                        appId:
                            app.id
                    }
                );

            }

        }


        return false;

    }


    /* ========================================================
       20 — NAVIGATION
       ======================================================== */

    async function navigate(
        target,
        options
    ) {

        const settings =
            options || {};


        state.statistics.navigations +=
            1;


        const parsed =
            parseRoute(
                target
            );


        const resolved =
            resolveRoute(
                parsed.pathname
            );


        let app =
            null;


        if (
            settings.appId
        ) {

            app =
                resolveApp(
                    settings.appId
                );

        }


        if (
            !app &&
            resolved &&
            resolved.route &&
            resolved.route.appId
        ) {

            app =
                resolveApp(
                    resolved.route.appId
                );

        }


        if (
            !app &&
            resolved &&
            resolved.route
        ) {

            const routeAppId =
                resolved.route.app;


            if (
                routeAppId
            ) {

                app =
                    resolveApp(
                        routeAppId
                    );

            }

        }


        /*
         * Wenn kein registrierter Route-Eintrag
         * vorhanden ist, prüfen wir direkt,
         * ob der erste Segmentname eine App ist.
         */

        if (
            !app &&
            parsed.segments.length > 0
        ) {

            const possibleAppId =
                parsed.segments[0];


            app =
                resolveApp(
                    possibleAppId
                );

        }


        const context = {

            target:
                target,

            route:
                parsed.route,

            pathname:
                parsed.pathname,

            query:
                parsed.query,

            params:
                resolved
                    ? resolved.params
                    : {},

            app:
                app,

            appId:
                app
                    ? app.id
                    : (
                        settings.appId ||
                        null
                    ),

            options:
                settings,

            timestamp:
                Date.now()

        };


        emit(
            "before-navigate",
            context
        );


        const allowed =
            await runGuards(
                context
            );


        if (!allowed) {

            state.statistics.failedNavigations +=
                1;


            return {

                success:
                    false,

                blocked:
                    true,

                context:
                    context

            };

        }


        /*
         * App öffnen.
         */

        if (
            app
        ) {

            const opened =
                await openApp(
                    app.id,
                    {
                        ...settings,

                        route:
                            parsed.route,

                        params:
                            context.params,

                        query:
                            context.query,

                        navigation:
                            true

                    }
                );


            if (!opened) {

                /*
                 * Ein App-Router darf eine Route
                 * auch ohne vorhandenen Manager
                 * registrieren. Deshalb wird die
                 * Navigation nicht automatisch
                 * als Fehler betrachtet, wenn
                 * die App selbst vorhanden ist.
                 */

                if (
                    hasMethod(
                        app,
                        "open"
                    )
                ) {

                    state.statistics.failedNavigations +=
                        1;


                    return {

                        success:
                            false,

                        blocked:
                            false,

                        context:
                            context

                    };

                }

            }

        }


        const previous =
            state.currentRoute;


        const entry = {

            route:
                parsed.route,

            pathname:
                parsed.pathname,

            query:
                safeClone(
                    parsed.query
                ),

            params:
                safeClone(
                    context.params
                ),

            appId:
                app
                    ? app.id
                    : (
                        settings.appId ||
                        null
                    ),

            timestamp:
                Date.now()

        };


        addHistory(
            entry,
            settings.replace === true
        );


        state.previousRoute =
            previous;


        state.currentRoute =
            entry;


        state.statistics.successfulNavigations +=
            1;


        /*
         * Browser History.
         */

        if (
            settings.updateBrowser !==
            false
        ) {

            updateBrowserHistory(
                parsed.route,
                settings
            );

        }


        emit(
            "navigate",
            {
                current:
                    entry,

                previous:
                    previous,

                app:
                    app

            }
        );


        emit(
            "route-changed",
            {
                route:
                    entry.route,

                appId:
                    entry.appId,

                params:
                    entry.params,

                query:
                    entry.query

            }
        );


        return {

            success:
                true,

            blocked:
                false,

            route:
                entry,

            app:
                app

        };

    }


    /* ========================================================
       21 — BROWSER HISTORY
       ======================================================== */

    function updateBrowserHistory(
        route,
        options
    ) {

        try {

            if (
                !window.history
            ) {

                return false;

            }


            const stateData = {

                haldo:
                    true,

                router:
                    MODULE_ID,

                route:
                    route

            };


            if (
                options &&
                options.replace ===
                true
            ) {

                window.history.replaceState(
                    stateData,
                    "",
                    "#" +
                    route
                );

            } else {

                window.history.pushState(
                    stateData,
                    "",
                    "#" +
                    route
                );

            }


            return true;

        } catch (exception) {

            reportError(
                "BROWSER_HISTORY_ERROR",
                exception
            );


            return false;

        }

    }


    /* ========================================================
       22 — BACK
       ======================================================== */

    async function back() {

        if (
            !canGoBack()
        ) {

            return false;

        }


        const targetIndex =
            state.historyIndex -
            1;


        const entry =
            state.history[
                targetIndex
            ];


        if (!entry) {

            return false;

        }


        state.historyIndex =
            targetIndex;


        state.statistics.backNavigations +=
            1;


        const result =
            await navigate(
                entry.route,
                {
                    appId:
                        entry.appId,

                    params:
                        entry.params,

                    query:
                        entry.query,

                    replace:
                        true,

                    updateBrowser:
                        false,

                    historyNavigation:
                        true

                }
            );


        return result;

    }


    /* ========================================================
       23 — FORWARD
       ======================================================== */

    async function forward() {

        if (
            !canGoForward()
        ) {

            return false;

        }


        const targetIndex =
            state.historyIndex +
            1;


        const entry =
            state.history[
                targetIndex
            ];


        if (!entry) {

            return false;

        }


        state.historyIndex =
            targetIndex;


        state.statistics.forwardNavigations +=
            1;


        const result =
            await navigate(
                entry.route,
                {
                    appId:
                        entry.appId,

                    params:
                        entry.params,

                    query:
                        entry.query,

                    replace:
                        true,

                    updateBrowser:
                        false,

                    historyNavigation:
                        true

                }
            );


        return result;

    }


    /* ========================================================
       24 — GO
       ======================================================== */

    async function go(
        offset
    ) {

        const amount =
            Number(
                offset
            );


        if (
            !Number.isFinite(
                amount
            ) ||
            amount === 0
        ) {

            return false;

        }


        const targetIndex =
            state.historyIndex +
            Math.trunc(
                amount
            );


        if (
            targetIndex < 0 ||
            targetIndex >=
            state.history.length
        ) {

            return false;

        }


        const entry =
            state.history[
                targetIndex
            ];


        if (!entry) {

            return false;

        }


        state.historyIndex =
            targetIndex;


        return navigate(
            entry.route,
            {
                appId:
                    entry.appId,

                params:
                    entry.params,

                query:
                    entry.query,

                replace:
                    true,

                updateBrowser:
                    false,

                historyNavigation:
                    true

            }
        );

    }


    /* ========================================================
       25 — CURRENT ROUTE
       ======================================================== */

    function getCurrentRoute() {

        return safeClone(
            state.currentRoute
        );

    }


    function getPreviousRoute() {

        return safeClone(
            state.previousRoute
        );

    }


    function getCurrentApp() {

        const current =
            state.currentRoute;


        if (
            !current ||
            !current.appId
        ) {

            return null;

        }


        return resolveApp(
            current.appId
        );

    }


    /* ========================================================
       26 — OPEN APP BY ROUTE
       ======================================================== */

    async function open(
        route,
        options
    ) {

        return navigate(
            route,
            options
        );

    }


    async function routeTo(
        route,
        options
    ) {

        return navigate(
            route,
            options
        );

    }


    /* ========================================================
       27 — CLOSE CURRENT APP
       ======================================================== */

    async function closeCurrentApp() {

        const app =
            getCurrentApp();


        if (!app) {

            return false;

        }


        const manager =
            getManager();


        try {

            if (
                manager &&
                hasMethod(
                    manager,
                    "closeApp"
                )
            ) {

                return (
                    await manager.closeApp(
                        app.id
                    )
                ) !== false;

            }


            if (
                manager &&
                hasMethod(
                    manager,
                    "close"
                )
            ) {

                return (
                    await manager.close(
                        app.id
                    )
                ) !== false;

            }


            if (
                hasMethod(
                    app,
                    "close"
                )
            ) {

                return (
                    await app.close()
                ) !== false;

            }

        } catch (exception) {

            reportError(
                "APP_CLOSE_ERROR",
                exception,
                {
                    appId:
                        app.id
                }
            );

        }


        return false;

    }


    /* ========================================================
       28 — CONNECTIONS
       ======================================================== */

    function connectToKernel() {

        const kernel =
            getKernel();


        if (!kernel) {

            state.connections.kernel =
                false;

            return false;

        }


        try {

            if (
                hasMethod(
                    kernel,
                    "registerModule"
                )
            ) {

                kernel.registerModule(
                    MODULE_ID,
                    api
                );

            }


            if (
                hasMethod(
                    kernel,
                    "setModuleReady"
                )
            ) {

                kernel.setModuleReady(
                    MODULE_ID,
                    true
                );

            }


            state.connections.kernel =
                true;


            return true;

        } catch (exception) {

            reportError(
                "KERNEL_CONNECTION_ERROR",
                exception
            );


            return false;

        }

    }


    function connectToSystem() {

        const system =
            getSystem();


        if (!system) {

            state.connections.system =
                false;

            return false;

        }


        try {

            if (
                hasMethod(
                    system,
                    "registerService"
                )
            ) {

                system.registerService(
                    MODULE_ID,
                    api
                );

            } else if (
                hasMethod(
                    system,
                    "registerModule"
                )
            ) {

                system.registerModule(
                    MODULE_ID,
                    api
                );

            }


            state.connections.system =
                true;


            return true;

        } catch (exception) {

            reportError(
                "SYSTEM_CONNECTION_ERROR",
                exception
            );


            return false;

        }

    }


    function connectToRegistry() {

        const registry =
            getRegistry();


        state.connections.registry =
            !!registry;


        if (
            registry &&
            hasMethod(
                registry,
                "on"
            )
        ) {

            try {

                registry.on(
                    "registered",
                    handleRegistryChange
                );


                registry.on(
                    "updated",
                    handleRegistryChange
                );


                registry.on(
                    "removed",
                    handleRegistryChange
                );


                return true;

            } catch (exception) {

                reportError(
                    "REGISTRY_EVENT_ERROR",
                    exception
                );

            }

        }


        return !!registry;

    }


    function connectToManager() {

        const manager =
            getManager();


        state.connections.manager =
            !!manager;


        return !!manager;

    }


    function connectToWindowManager() {

        const manager =
            getWindowManager();


        state.connections.windowManager =
            !!manager;


        return !!manager;

    }


    function refreshConnections() {

        connectToKernel();

        connectToSystem();

        connectToRegistry();

        connectToManager();

        connectToWindowManager();


        return getConnectionStatus();

    }


    function getConnectionStatus() {

        return {

            kernel:
                !!getKernel(),

            system:
                !!getSystem(),

            registry:
                !!getRegistry(),

            manager:
                !!getManager(),

            windowManager:
                !!getWindowManager()

        };

    }


    /* ========================================================
       29 — REGISTRY EVENTS
       ======================================================== */

    function handleRegistryChange(
        payload
    ) {

        emit(
            "registry-changed",
            payload
        );

    }


    /* ========================================================
       30 — BROWSER POPSTATE / HASH
       ======================================================== */

    function handleBrowserNavigation() {

        let route =
            null;


        try {

            if (
                window.location.hash
            ) {

                route =
                    window.location.hash
                        .replace(
                            /^#/,
                            ""
                        );

            }

        } catch (_) {}


        if (
            route
        ) {

            navigate(
                route,
                {
                    updateBrowser:
                        false,

                    historyNavigation:
                        true

                }
            )
            .catch(
                function (exception) {

                    reportError(
                        "BROWSER_NAVIGATION_ERROR",
                        exception
                    );

                }
            );

        }

    }


    /* ========================================================
       31 — DEFAULT SYSTEM ROUTES
       ======================================================== */

    function registerDefaultRoutes() {

        const defaults = [

            {
                pattern:
                    "/",

                name:
                    "home",

                appId:
                    "haldo-home"

            },

            {
                pattern:
                    "/home",

                name:
                    "home",

                appId:
                    "haldo-home"

            },

            {
                pattern:
                    "/dashboard",

                name:
                    "dashboard",

                appId:
                    "dashboard"

            },

            {
                pattern:
                    "/settings",

                name:
                    "settings",

                appId:
                    "settings"

            },

            {
                pattern:
                    "/apps",

                name:
                    "app-center",

                appId:
                    "app-center"

            },

            {
                pattern:
                    "/ai",

                name:
                    "ai-assistant",

                appId:
                    "ai-assistant"

            },

            {
                pattern:
                    "/files",

                name:
                    "file-manager",

                appId:
                    "file-manager"

            },

            {
                pattern:
                    "/browser",

                name:
                    "browser",

                appId:
                    "browser"

            }

        ];


        defaults.forEach(
            function (definition) {

                if (
                    !state.routes.has(
                        definition.pattern
                    )
                ) {

                    registerRoute(
                        definition.pattern,
                        definition
                    );

                }

            }
        );

    }


    /* ========================================================
       32 — INITIALIZATION
       ======================================================== */

    async function initialize() {

        if (
            state.ready
        ) {

            return api;

        }


        if (
            state.initializing
        ) {

            return api;

        }


        state.initializing =
            true;

        state.initialized =
            true;


        emit(
            "initializing",
            {
                version:
                    VERSION
            }
        );


        refreshConnections();

        registerDefaultRoutes();


        /*
         * Browser Navigation vorbereiten.
         */

        if (
            window.addEventListener
        ) {

            window.addEventListener(
                "popstate",
                handleBrowserNavigation
            );

        }


        state.ready =
            true;

        state.initializing =
            false;


        emit(
            "ready",
            {
                version:
                    VERSION,

                routes:
                    state.routes.size,

                connections:
                    getConnectionStatus()

            }
        );


        log(
            "App Router bereit.",
            VERSION
        );


        return api;

    }


    /* ========================================================
       33 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        return {

            name:
                NAME,

            module:
                MODULE_ID,

            version:
                VERSION,

            initialized:
                state.initialized,

            ready:
                state.ready,

            currentRoute:
                getCurrentRoute(),

            previousRoute:
                getPreviousRoute(),

            historyLength:
                state.history.length,

            historyIndex:
                state.historyIndex,

            routeCount:
                state.routes.size,

            guardCount:
                state.guards.size,

            connections:
                getConnectionStatus(),

            statistics:
                {
                    ...state.statistics
                },

            routes:
                getRoutes().map(
                    function (route) {

                        return {

                            name:
                                route.name,

                            pattern:
                                route.pattern,

                            appId:
                                route.appId ||
                                null,

                            enabled:
                                route.enabled !==
                                false

                        };

                    }
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       34 — HEALTH CHECK
       ======================================================== */

    function healthCheck() {

        const connections =
            getConnectionStatus();


        const problems =
            [];


        if (
            !connections.kernel
        ) {

            problems.push(
                "Kernel nicht verbunden."
            );

        }


        if (
            !connections.registry
        ) {

            problems.push(
                "App Registry nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length ===
                0,

            problems:
                problems,

            initialized:
                state.initialized,

            ready:
                state.ready,

            routeCount:
                state.routes.size,

            currentRoute:
                getCurrentRoute(),

            connections:
                connections,

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       35 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


        /* State */

        getState:
            function () {

                return {

                    initialized:
                        state.initialized,

                    ready:
                        state.ready,

                    currentRoute:
                        getCurrentRoute(),

                    previousRoute:
                        getPreviousRoute(),

                    historyLength:
                        state.history.length,

                    historyIndex:
                        state.historyIndex,

                    routeCount:
                        state.routes.size,

                    connections:
                        getConnectionStatus()

                };

            },


        /* Events */

        on:
            on,

        off:
            off,

        emit:
            emit,


        /* Navigation */

        navigate:
            navigate,

        open:
            open,

        routeTo:
            routeTo,

        back:
            back,

        forward:
            forward,

        go:
            go,


        /* Current */

        getCurrentRoute:
            getCurrentRoute,

        getPreviousRoute:
            getPreviousRoute,

        getCurrentApp:
            getCurrentApp,


        /* App */

        openApp:
            openApp,

        closeCurrentApp:
            closeCurrentApp,


        /* Routes */

        registerRoute:
            registerRoute,

        unregisterRoute:
            unregisterRoute,

        getRoute:
            getRoute,

        getRoutes:
            getRoutes,

        resolveRoute:
            resolveRoute,

        matchPattern:
            matchPattern,

        parseRoute:
            parseRoute,

        normalizeRoute:
            normalizeRoute,


        /* Guards */

        addGuard:
            addGuard,

        removeGuard:
            removeGuard,


        /* History */

        getHistory:
            getHistory,

        canGoBack:
            canGoBack,

        canGoForward:
            canGoForward,


        /* Connections */

        connectToKernel:
            connectToKernel,

        connectToSystem:
            connectToSystem,

        connectToRegistry:
            connectToRegistry,

        connectToManager:
            connectToManager,

        connectToWindowManager:
            connectToWindowManager,

        refreshConnections:
            refreshConnections,

        getConnectionStatus:
            getConnectionStatus,


        /* Diagnostics */

        diagnostics:
            diagnostics,

        healthCheck:
            healthCheck,


        /* Initialization */

        initialize:
            initialize

    };


    /* ========================================================
       36 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppRouter =
        api;

    window.HalDoOSAppRouter =
        api;

    HalDoOS.appRouter =
        api;


    /* ========================================================
       37 — KERNEL EVENT CONNECTION
       ======================================================== */

    function connectKernelEvents() {

        const kernel =
            getKernel();


        if (
            !kernel ||
            !hasMethod(
                kernel,
                "on"
            )
        ) {

            return false;

        }


        try {

            kernel.on(
                "kernel:ready",
                function () {

                    refreshConnections();


                    emit(
                        "kernel-ready"
                    );

                }
            );


            kernel.on(
                "module:registered",
                function () {

                    refreshConnections();

                }
            );


            return true;

        } catch (exception) {

            reportError(
                "KERNEL_EVENT_CONNECTION_ERROR",
                exception
            );


            return false;

        }

    }


    /* ========================================================
       38 — STARTUP
       ======================================================== */

    connectKernelEvents();


    function handleDOMReady() {

        initialize()
            .catch(
                function (exception) {

                    state.initializing =
                        false;

                    reportError(
                        "ROUTER_INIT_ERROR",
                        exception
                    );

                }
            );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            handleDOMReady,
            {
                once:
                    true
            }
        );

    } else {

        handleDOMReady();

    }


    /* ========================================================
       39 — FINAL EXPOSURE
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS ||
        {};

    window.HalDoOS.appRouter =
        api;


    log(
        "HalDo AI OS App Router geladen."
    );


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 20 APP ROUTER
   ============================================================ */