/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
       js/app-router.js

   ZENTRALER APPLICATION ROUTER 20.0

   VERBINDET:

   App Manager
   App Registry
   Kernel
   System
   Window Manager
   Launcher
   Shell
   Desktop
   Navigation
   Browser History
   Deep Links
   App Routes
   Events
   Diagnostics

   Unterstützt:

   - App Routing
   - navigate()
   - open()
   - back()
   - forward()
   - replace()
   - home()
   - current route
   - route history
   - route parameters
   - query parameters
   - hash routes
   - app routes
   - deep links
   - route guards
   - route listeners
   - navigation events
   - Router Diagnostics
   - Browser History
   - App Manager Verbindung
   - Window Manager Verbindung
   - Launcher Verbindung
   - Shell/Desktop Verbindung

   HALDO AI OS 20
   ============================================================ */

"use strict";

(function (window, document) {

    /* ========================================================
       01 — FOUNDATION
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

    const MODULE_ID =
        "app-router";

    const NAME =
        "HalDo AI OS 20 Application Router";


    /* ========================================================
       03 — SERVICE ACCESS
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


    function getAppManager() {

        return (
            window.HalDoAppManager ||
            window.HalDoOSAppManager ||
            HalDoOS.appManager ||
            null
        );

    }


    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            HalDoOS.appRegistry ||
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


    function getLauncher() {

        return (
            window.HalDoLauncher ||
            HalDoOS.launcher ||
            null
        );

    }


    function getShell() {

        return (
            window.HalDoShellManager ||
            HalDoOS.shellManager ||
            null
        );

    }


    function getDesktop() {

        return (
            window.HalDoDesktopManager ||
            HalDoOS.desktopManager ||
            null
        );

    }


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


    /* ========================================================
       04 — HELPERS
       ======================================================== */

    function normalizeAppId(
        value
    ) {

        return String(
            value || ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9äöüßîêç_-]+/gi,
            "-"
        )
        .replace(
            /-+/g,
            "-"
        )
        .replace(
            /^-|-$/g,
            "");

    }


    function normalizePath(
        value
    ) {

        let path =
            String(
                value || "/"
            )
            .trim();


        if (!path) {

            return "/";

        }


        if (
            !path.startsWith("/")
        ) {

            path =
                "/" +
                path;

        }


        path =
            path.replace(
                /\/+/g,
                "/"
            );


        if (
            path.length > 1 &&
            path.endsWith("/")
        ) {

            path =
                path.slice(
                    0,
                    -1
                );

        }


        return path;

    }


    function clone(
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
                clone
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
                key => {

                    result[key] =
                        clone(
                            value[key]
                        );

                }
            );

            return result;

        }


        return value;

    }


    function createQuery(
        query
    ) {

        if (
            !query ||
            typeof query !==
            "object"
        ) {

            return "";

        }


        const params =
            new URLSearchParams();


        Object.keys(
            query
        ).forEach(
            key => {

                const value =
                    query[key];


                if (
                    value ===
                    undefined ||
                    value ===
                    null
                ) {

                    return;

                }


                if (
                    Array.isArray(
                        value
                    )
                ) {

                    value.forEach(
                        item => {

                            params.append(
                                key,
                                String(
                                    item
                                )
                            );

                        }
                    );

                    return;

                }


                params.set(
                    key,
                    String(
                        value
                    )
                );

            }
        );


        const result =
            params.toString();


        return result
            ? "?" + result
            : "";

    }


    function parseQuery(
        queryString
    ) {

        const result = {};


        if (!queryString) {

            return result;

        }


        const query =
            queryString.startsWith("?")
                ? queryString.slice(1)
                : queryString;


        const params =
            new URLSearchParams(
                query
            );


        params.forEach(
            (
                value,
                key
            ) => {

                if (
                    Object.prototype.hasOwnProperty.call(
                        result,
                        key
                    )
                ) {

                    if (
                        Array.isArray(
                            result[key]
                        )
                    ) {

                        result[key].push(
                            value
                        );

                    } else {

                        result[key] = [
                            result[key],
                            value
                        ];

                    }

                } else {

                    result[key] =
                        value;

                }

            }
        );


        return result;

    }


    function createRouteObject(
        path,
        options = {}
    ) {

        const normalized =
            normalizePath(
                path
            );


        let parsed;


        try {

            parsed =
                new URL(
                    normalized,
                    window.location.origin
                );

        } catch (_) {

            parsed = null;

        }


        const pathname =
            parsed
                ? normalizePath(
                    parsed.pathname
                )
                : normalized;


        const query =
            parsed
                ? parseQuery(
                    parsed.search
                )
                : {};


        const hash =
            parsed
                ? (
                    parsed.hash ||
                    ""
                ).replace(
                    /^#/,
                    ""
                )
                : "";


        return {

            path:
                normalized,

            pathname,

            query,

            hash,

            appId:
                options.appId
                    ? normalizeAppId(
                        options.appId
                    )
                    : null,

            params:
                clone(
                    options.params ||
                    {}
                ),

            state:
                clone(
                    options.state ||
                    null
                ),

            source:
                options.source ||
                "router",

            timestamp:
                Date.now()

        };

    }


    /* ========================================================
       05 — STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        initializing:
            false,

        ready:
            false,

        failed:
            false,

        current:
            null,

        previous:
            null,

        history:
            [],

        historyIndex:
            -1,

        maxHistory:
            200,

        listeners:
            new Map(),

        guards:
            new Set(),

        connections: {

            kernel:
                false,

            system:
                false,

            appManager:
                false,

            registry:
                false,

            windowManager:
                false,

            launcher:
                false,

            shell:
                false,

            desktop:
                false

        },

        statistics: {

            navigations:
                0,

            opens:
                0,

            replaces:
                0,

            backs:
                0,

            forwards:
                0,

            home:
                0,

            cancelled:
                0,

            errors:
                0

        }

    };


    /* ========================================================
       06 — LOGGING
       ======================================================== */

    function log() {

        try {

            console.log(
                "[HalDo Router 20]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo Router 20]",
                ...arguments
            );

        } catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo Router 20]",
                ...arguments
            );

        } catch (_) {}

    }


    /* ========================================================
       07 — EVENTS
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
        payload = null
    ) {

        const listeners =
            state.listeners.get(
                event
            );


        if (listeners) {

            Array.from(
                listeners
            ).forEach(
                callback => {

                    try {

                        callback(
                            payload
                        );

                    } catch (
                        exception
                    ) {

                        reportError(
                            exception,
                            "Router Event: " +
                            event
                        );

                    }

                }
            );

        }


        const events =
            HalDoOS.events;


        if (
            events &&
            hasMethod(
                events,
                "emit"
            )
        ) {

            try {

                events.emit(
                    "router:" +
                    event,
                    payload
                );

            } catch (_) {}

        }


        const kernel =
            getKernel();


        if (
            kernel &&
            hasMethod(
                kernel,
                "emit"
            )
        ) {

            try {

                kernel.emit(
                    "router:" +
                    event,
                    payload
                );

            } catch (_) {}

        }

    }


    /* ========================================================
       08 — ERROR HANDLING
       ======================================================== */

    function reportError(
        exception,
        context =
            "Application Router"
    ) {

        state.statistics.errors +=
            1;


        const normalized =
            exception instanceof Error
                ? exception
                : new Error(
                    String(
                        exception
                    )
                );


        const record = {

            message:
                normalized.message,

            name:
                normalized.name,

            stack:
                normalized.stack ||
                "",

            context,

            timestamp:
                Date.now()

        };


        errorLog(
            record
        );


        emit(
            "error",
            record
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
                    normalized,
                    context
                );

            } catch (_) {}

        }


        return record;

    }


    /* ========================================================
       09 — ROUTE GUARDS
       ======================================================== */

    function addGuard(
        guard
    ) {

        if (
            typeof guard !==
            "function"
        ) {

            return function () {};

        }


        state.guards.add(
            guard
        );


        return function () {

            state.guards.delete(
                guard
            );

        };

    }


    function removeGuard(
        guard
    ) {

        return state.guards.delete(
            guard
        );

    }


    async function checkGuards(
        route,
        navigationOptions
    ) {

        for (
            const guard of
                Array.from(
                    state.guards
                )
        ) {

            try {

                const result =
                    await guard(
                        route,
                        navigationOptions
                    );


                if (
                    result ===
                    false
                ) {

                    return false;

                }

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "Route Guard"
                );


                return false;

            }

        }


        return true;

    }


    /* ========================================================
       10 — HISTORY
       ======================================================== */

    function pushHistory(
        route
    ) {

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
            clone(
                route
            )
        );


        if (
            state.history.length >
            state.maxHistory
        ) {

            state.history.shift();

        }


        state.historyIndex =
            state.history.length - 1;

    }


    function replaceHistory(
        route
    ) {

        if (
            state.historyIndex < 0
        ) {

            pushHistory(
                route
            );

            return;

        }


        state.history[
            state.historyIndex
        ] =
            clone(
                route
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
            state.historyIndex >= 0 &&
            state.historyIndex <
            state.history.length - 1
        );

    }


    /* ========================================================
       11 — BROWSER HISTORY
       ======================================================== */

    function updateBrowserHistory(
        route,
        mode = "push"
    ) {

        if (
            !window.history ||
            !window.history.pushState
        ) {

            return;

        }


        try {

            const url =
                route.path;


            const historyState = {

                haldo:
                    true,

                route:
                    clone(
                        route
                    )

            };


            if (
                mode ===
                "replace"
            ) {

                window.history.replaceState(
                    historyState,
                    "",
                    url
                );

            } else {

                window.history.pushState(
                    historyState,
                    "",
                    url
                );

            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Browser History"
            );

        }

    }


    /* ========================================================
       12 — APP RESOLUTION
       ======================================================== */

    function resolveApp(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        if (!id) {

            return null;

        }


        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "get"
            )
        ) {

            try {

                const app =
                    manager.get(
                        id
                    );


                if (app) {

                    return app;

                }

            } catch (_) {}

        }


        const registry =
            getRegistry();


        if (
            registry &&
            hasMethod(
                registry,
                "get"
            )
        ) {

            try {

                return registry.get(
                    id
                );

            } catch (_) {}

        }


        return null;

    }


    /* ========================================================
       13 — ROUTE FROM APP
       ======================================================== */

    function resolveAppRoute(
        app,
        options = {}
    ) {

        if (!app) {

            return "/";

        }


        let route =
            app.route ||
            app.path ||
            (
                "/apps/" +
                normalizeAppId(
                    app.id
                )
            );


        route =
            normalizePath(
                route
            );


        const query =
            createQuery(
                options.query
            );


        if (query) {

            route +=
                query;

        }


        if (
            options.hash
        ) {

            route +=
                "#" +
                String(
                    options.hash
                )
                .replace(
                    /^#/,
                    ""
                );

        }


        return route;

    }


    /* ========================================================
       14 — INTERNAL NAVIGATION
       ======================================================== */

    async function performNavigation(
        route,
        options = {},
        historyMode = "push"
    ) {

        const allowed =
            await checkGuards(
                route,
                options
            );


        if (!allowed) {

            state.statistics.cancelled +=
                1;


            emit(
                "navigation-cancelled",
                {
                    route,
                    options
                }
            );


            return false;

        }


        const previous =
            state.current
                ? clone(
                    state.current
                )
                : null;


        state.previous =
            previous;


        state.current =
            clone(
                route
            );


        if (
            historyMode ===
            "replace"
        ) {

            replaceHistory(
                route
            );

        } else {

            pushHistory(
                route
            );

        }


        updateBrowserHistory(
            route,
            historyMode
        );


        state.statistics.navigations +=
            1;


        emit(
            "before-navigate",
            {

                from:
                    previous,

                to:
                    clone(
                        route
                    ),

                options

            }
        );


        /* ---------------------------------------------
           Shell
           --------------------------------------------- */

        const shell =
            getShell();


        if (
            shell &&
            hasMethod(
                shell,
                "navigate"
            )
        ) {

            try {

                await shell.navigate(
                    route.path,
                    options
                );

            } catch (exception) {

                reportError(
                    exception,
                    "Shell Navigation"
                );

            }

        }


        /* ---------------------------------------------
           Desktop
           --------------------------------------------- */

        const desktop =
            getDesktop();


        if (
            desktop &&
            hasMethod(
                desktop,
                "navigate"
            )
        ) {

            try {

                await desktop.navigate(
                    route.path,
                    options
                );

            } catch (_) {}

        }


        /* ---------------------------------------------
           Window Manager
           --------------------------------------------- */

        if (
            route.appId
        ) {

            const windowManager =
                getWindowManager();


            if (
                windowManager &&
                hasMethod(
                    windowManager,
                    "navigate"
                )
            ) {

                try {

                    await windowManager.navigate(
                        route.path,
                        options
                    );

                } catch (_) {}

            }

        }


        emit(
            "navigate",
            {

                from:
                    previous,

                route:
                    clone(
                        route
                    ),

                options

            }
        );


        emit(
            "route-changed",
            clone(
                route
            )
        );


        emit(
            "after-navigate",
            {

                from:
                    previous,

                to:
                    clone(
                        route
                    ),

                options

            }
        );


        return true;

    }


    /* ========================================================
       15 — NAVIGATE
       ======================================================== */

    async function navigate(
        path,
        options = {}
    ) {

        const route =
            createRouteObject(
                path,
                options
            );


        return performNavigation(
            route,
            options,
            "push"
        );

    }


    /* ========================================================
       16 — REPLACE
       ======================================================== */

    async function replace(
        path,
        options = {}
    ) {

        const route =
            createRouteObject(
                path,
                options
            );


        const result =
            await performNavigation(
                route,
                options,
                "replace"
            );


        if (result) {

            state.statistics.replaces +=
                1;

        }


        return result;

    }


    /* ========================================================
       17 — OPEN APP
       ======================================================== */

    async function open(
        appId,
        options = {}
    ) {

        const id =
            normalizeAppId(
                appId
            );


        if (!id) {

            return null;

        }


        const app =
            resolveApp(
                id
            );


        if (!app) {

            reportError(
                new Error(
                    "App nicht gefunden: " +
                    id
                ),
                "Router App Open"
            );


            return null;

        }


        const path =
            resolveAppRoute(
                app,
                options
            );


        const route =
            createRouteObject(
                path,
                {

                    ...options,

                    appId:
                        id,

                    source:
                        options.source ||
                        "router"

                }
            );


        const allowed =
            await checkGuards(
                route,
                options
            );


        if (!allowed) {

            state.statistics.cancelled +=
                1;

            return null;

        }


        const manager =
            getAppManager();


        let result =
            null;


        /*
         * WICHTIG:
         * App Manager besitzt den eigentlichen
         * App-Lifecycle.
         *
         * Router übernimmt Navigation.
         */

        if (
            manager &&
            hasMethod(
                manager,
                "open"
            )
        ) {

            try {

                result =
                    await manager.open(
                        id,
                        {

                            ...options,

                            route:
                                path,

                            source:
                                options.source ||
                                "router"

                        }
                    );

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "Router → App Manager"
                );

                return null;

            }

        }


        const navigated =
            await performNavigation(
                route,
                options,
                "push"
            );


        if (!navigated) {

            return null;

        }


        state.statistics.opens +=
            1;


        emit(
            "app-opened",
            {

                app,

                result,

                route:
                    clone(
                        route
                    )

            }
        );


        return {

            app,

            result,

            route:
                clone(
                    route
                )

        };

    }


    /* ========================================================
       18 — APP ROUTE
       ======================================================== */

    async function openApp(
        appId,
        options = {}
    ) {

        return open(
            appId,
            options
        );

    }


    /* ========================================================
       19 — HOME
       ======================================================== */

    async function home(
        options = {}
    ) {

        const result =
            await navigate(
                "/",
                {

                    ...options,

                    source:
                        options.source ||
                        "home"

                }
            );


        if (result) {

            state.statistics.home +=
                1;

        }


        return result;

    }


    /* ========================================================
       20 — BACK
       ======================================================== */

    async function back() {

        if (
            !canGoBack()
        ) {

            return false;

        }


        const targetIndex =
            state.historyIndex - 1;


        const target =
            state.history[
                targetIndex
            ];


        if (!target) {

            return false;

        }


        const allowed =
            await checkGuards(
                target,
                {
                    direction:
                        "back"
                }
            );


        if (!allowed) {

            state.statistics.cancelled +=
                1;

            return false;

        }


        state.historyIndex =
            targetIndex;


        state.previous =
            state.current;


        state.current =
            clone(
                target
            );


        if (
            window.history &&
            hasMethod(
                window.history,
                "back"
            )
        ) {

            try {

                window.history.back();

            } catch (_) {}

        }


        state.statistics.backs +=
            1;


        emit(
            "back",
            clone(
                target
            )
        );


        emit(
            "route-changed",
            clone(
                target
            )
        );


        return true;

    }


    /* ========================================================
       21 — FORWARD
       ======================================================== */

    async function forward() {

        if (
            !canGoForward()
        ) {

            return false;

        }


        const targetIndex =
            state.historyIndex + 1;


        const target =
            state.history[
                targetIndex
            ];


        if (!target) {

            return false;

        }


        const allowed =
            await checkGuards(
                target,
                {
                    direction:
                        "forward"
                }
            );


        if (!allowed) {

            state.statistics.cancelled +=
                1;

            return false;

        }


        state.historyIndex =
            targetIndex;


        state.previous =
            state.current;


        state.current =
            clone(
                target
            );


        if (
            window.history &&
            hasMethod(
                window.history,
                "forward"
            )
        ) {

            try {

                window.history.forward();

            } catch (_) {}

        }


        state.statistics.forwards +=
            1;


        emit(
            "forward",
            clone(
                target
            )
        );


        emit(
            "route-changed",
            clone(
                target
            )
        );


        return true;

    }


    /* ========================================================
       22 — CURRENT ROUTE
       ======================================================== */

    function getCurrentRoute() {

        return clone(
            state.current
        );

    }


    function getCurrentPath() {

        return state.current
            ? state.current.path
            : null;

    }


    function getPreviousRoute() {

        return clone(
            state.previous
        );

    }


    /* ========================================================
       23 — HISTORY API
       ======================================================== */

    function getHistory() {

        return clone(
            state.history
        );

    }


    function clearHistory() {

        state.history =
            state.current
                ? [
                    clone(
                        state.current
                    )
                ]
                : [];

        state.historyIndex =
            state.history.length
                ? 0
                : -1;


        emit(
            "history-cleared"
        );


        return true;

    }


    function setMaxHistory(
        value
    ) {

        const number =
            Number(
                value
            );


        if (
            !Number.isFinite(
                number
            ) ||
            number < 10
        ) {

            return false;

        }


        state.maxHistory =
            Math.floor(
                number
            );


        while (
            state.history.length >
            state.maxHistory
        ) {

            state.history.shift();

            state.historyIndex -=
                1;

        }


        if (
            state.historyIndex < 0 &&
            state.history.length
        ) {

            state.historyIndex =
                0;

        }


        return true;

    }


    /* ========================================================
       24 — DEEP LINK
       ======================================================== */

    async function handleDeepLink(
        path
    ) {

        const normalized =
            normalizePath(
                path
            );


        const segments =
            normalized
                .split("/")
                .filter(Boolean);


        if (
            segments[0] ===
            "apps" &&
            segments[1]
        ) {

            return open(
                segments[1],
                {

                    source:
                        "deep-link",

                    path:
                        normalized

                }
            );

        }


        return navigate(
            normalized,
            {
                source:
                    "deep-link"
            }
        );

    }


    /* ========================================================
       25 — BROWSER POPSTATE
       ======================================================== */

    function connectBrowserHistory() {

        try {

            window.addEventListener(
                "popstate",
                async function (
                    event
                ) {

                    const route =
                        event.state &&
                        event.state.haldo &&
                        event.state.route
                            ? event.state.route
                            : createRouteObject(
                                window.location.pathname +
                                window.location.search +
                                window.location.hash,
                                {
                                    source:
                                        "browser-history"
                                }
                            );


                    state.previous =
                        state.current;


                    state.current =
                        clone(
                            route
                        );


                    emit(
                        "popstate",
                        clone(
                            route
                        )
                    );


                    emit(
                        "route-changed",
                        clone(
                            route
                        )
                    );

                }
            );


            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Browser PopState"
            );


            return false;

        }

    }


    /* ========================================================
       26 — CONNECTIONS
       ======================================================== */

    function refreshConnections() {

        state.connections.kernel =
            !!getKernel();

        state.connections.system =
            !!getSystem();

        state.connections.appManager =
            !!getAppManager();

        state.connections.registry =
            !!getRegistry();

        state.connections.windowManager =
            !!getWindowManager();

        state.connections.launcher =
            !!getLauncher();

        state.connections.shell =
            !!getShell();

        state.connections.desktop =
            !!getDesktop();


        return {
            ...state.connections
        };

    }


    function getConnectionStatus() {

        return refreshConnections();

    }


    /* ========================================================
       27 — KERNEL
       ======================================================== */

    function connectKernel() {

        const kernel =
            getKernel();


        if (!kernel) {

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

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Router Kernel Connection"
            );


            return false;

        }

    }


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
                "kernel:error",
                function (
                    payload
                ) {

                    emit(
                        "kernel-error",
                        payload
                    );

                }
            );


            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Router Kernel Events"
            );


            return false;

        }

    }


    /* ========================================================
       28 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        refreshConnections();


        return {

            name:
                NAME,

            version:
                VERSION,

            module:
                MODULE_ID,

            initialized:
                state.initialized,

            initializing:
                state.initializing,

            ready:
                state.ready,

            failed:
                state.failed,

            current:
                getCurrentRoute(),

            previous:
                getPreviousRoute(),

            historyLength:
                state.history.length,

            historyIndex:
                state.historyIndex,

            canGoBack:
                canGoBack(),

            canGoForward:
                canGoForward(),

            connections:
                getConnectionStatus(),

            statistics:
                {
                    ...state.statistics
                },

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       29 — HEALTH CHECK
       ======================================================== */

    function healthCheck() {

        refreshConnections();


        const problems = [];


        if (
            !state.connections.kernel
        ) {

            problems.push(
                "Kernel nicht verbunden."
            );

        }


        if (
            !state.connections.appManager
        ) {

            problems.push(
                "App Manager nicht verbunden."
            );

        }


        if (
            !state.connections.windowManager
        ) {

            problems.push(
                "Window Manager nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length ===
                0,

            problems,

            currentRoute:
                getCurrentRoute(),

            historyLength:
                state.history.length,

            connections:
                getConnectionStatus(),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       30 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


        /* Navigation */

        navigate,

        open,

        openApp,

        replace,

        back,

        forward,

        home,


        /* Routes */

        getCurrentRoute,

        getCurrentPath,

        getPreviousRoute,

        createRouteObject,

        resolveApp,

        resolveAppRoute,


        /* History */

        getHistory,

        clearHistory,

        canGoBack,

        canGoForward,

        setMaxHistory,


        /* Deep Links */

        handleDeepLink,


        /* Guards */

        addGuard,

        removeGuard,


        /* Events */

        on,

        off,

        emit,


        /* Connections */

        refreshConnections,

        getConnectionStatus,

        connectKernel,


        /* Diagnostics */

        diagnostics,

        healthCheck,


        /* State */

        getState() {

            return {

                initialized:
                    state.initialized,

                initializing:
                    state.initializing,

                ready:
                    state.ready,

                failed:
                    state.failed,

                current:
                    getCurrentRoute(),

                previous:
                    getPreviousRoute(),

                historyLength:
                    state.history.length,

                historyIndex:
                    state.historyIndex,

                canGoBack:
                    canGoBack(),

                canGoForward:
                    canGoForward(),

                connections:
                    getConnectionStatus()

            };

        },


        getStatistics() {

            return {
                ...state.statistics
            };

        }

    };


    /* ========================================================
       31 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppRouter =
        api;

    window.HalDoOSAppRouter =
        api;

    HalDoOS.appRouter =
        api;


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

        state.failed =
            false;


        emit(
            "initializing",
            {
                version:
                    VERSION
            }
        );


        try {

            refreshConnections();

            connectKernel();

            connectKernelEvents();

            connectBrowserHistory();


            /*
             * Erst vorhandene Browser-Route
             * übernehmen.
             */

            const initialPath =
                normalizePath(
                    window.location.pathname +
                    window.location.search +
                    window.location.hash
                );


            const initialRoute =
                createRouteObject(
                    initialPath,
                    {
                        source:
                            "boot"
                    }
                );


            state.current =
                initialRoute;


            state.history = [
                clone(
                    initialRoute
                )
            ];


            state.historyIndex =
                0;


            state.ready =
                true;

            state.initializing =
                false;


            const kernel =
                getKernel();


            if (
                kernel &&
                hasMethod(
                    kernel,
                    "setModuleReady"
                )
            ) {

                try {

                    kernel.setModuleReady(
                        MODULE_ID,
                        true
                    );

                } catch (_) {}

            }


            emit(
                "ready",
                {

                    version:
                        VERSION,

                    route:
                        getCurrentRoute(),

                    diagnostics:
                        diagnostics()

                }
            );


            log(
                "HalDo AI OS 20 App Router bereit.",
                "Version:",
                VERSION
            );


            return api;

        } catch (
            exception
        ) {

            state.initializing =
                false;

            state.failed =
                true;


            reportError(
                exception,
                "Router Initialisierung"
            );


            return api;

        }

    }


    /* ========================================================
       33 — BOOT
       ======================================================== */

    function boot() {

        initialize()
            .catch(
                exception => {

                    state.initializing =
                        false;

                    state.failed =
                        true;


                    reportError(
                        exception,
                        "Router Boot"
                    );

                }
            );

    }


    /* ========================================================
       34 — DOM START
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

    } else {

        boot();

    }


    /* ========================================================
       35 — FINAL EXPORT
       ======================================================== */

    HalDoOS.appRouter =
        api;

    window.HalDoAppRouter =
        api;

    window.HalDoOSAppRouter =
        api;


    /* ========================================================
       END
       HALDO AI OS 20
       APPLICATION ROUTER
       ======================================================== */

})(window, document);