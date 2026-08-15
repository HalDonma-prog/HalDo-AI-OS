/* ============================================================
   HALDO AI OS 19+
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei: js/app-router.js

   ZENTRALER APPLICATION ROUTER

   Architektur:

        HALDO KERNEL
             │
             ▼
       APP REGISTRY
             │
             ▼
       APP MANAGER
             │
             ▼
        APP ROUTER
        ┌────┼───────────────┐
        ▼    ▼               ▼
      HASH  HISTORY       DEEP LINK
        │    │               │
        └────┼───────────────┘
             ▼
       WINDOW MANAGER
             │
             ▼
          APP VIEW

   Unterstützt:

   • App-Navigation
   • Hash-Routing
   • Browser-History
   • Deep Links
   • Query-Parameter
   • Route-Parameter
   • App-Zustände
   • mehrere gleichzeitig geöffnete Apps
   • Navigation Events
   • beforeNavigate / afterNavigate
   • Home / Back / Forward
   • sichere Navigation
   • Registry-Verbindung
   • Manager-Verbindung
   • Window-Manager-Verbindung
   • Diagnose
   • Health Check
   • zukünftige Erweiterbarkeit
   ============================================================ */

(function (window, document) {

    "use strict";


    /* =========================================================
       01 — HALDO FOUNDATION
       ========================================================= */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;


    /* =========================================================
       02 — META
       ========================================================= */

    const VERSION =
        "19.0.0";

    const MODULE_ID =
        "app-router";

    const NAME =
        "HalDo AI OS Application Router";


    /* =========================================================
       03 — STATE
       ========================================================= */

    const state = {

        initialized:
            false,

        ready:
            false,

        initializing:
            false,

        navigating:
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
            100,

        routes:
            new Map(),

        appStates:
            new Map(),

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

            successful:
                0,

            failed:
                0,

            back:
                0,

            forward:
                0,

            home:
                0,

            opens:
                0,

            closes:
                0,

            routeRegistrations:
                0,

            errors:
                0

        }

    };


    /* =========================================================
       04 — LOGGING
       ========================================================= */

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


    /* =========================================================
       05 — SAFE HELPERS
       ========================================================= */

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


    function normalizeId(
        value
    ) {

        return String(
            value || ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9äöüßîêç_\/:@?=&.%~-]+/gi,
            "-"
        )
        .replace(
            /-+/g,
            "-"
        );

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
            Array.isArray(value)
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
                function (key) {

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


    /* =========================================================
       06 — SERVICE LOOKUPS
       ========================================================= */

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


    /* =========================================================
       07 — EVENTS
       ========================================================= */

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
                            exception,
                            "Event: " + event
                        );

                    }

                }
            );

        }


        const globalEvents =
            HalDoOS.events;


        if (
            globalEvents &&
            hasMethod(
                globalEvents,
                "emit"
            )
        ) {

            try {

                globalEvents.emit(
                    "app-router:" + event,
                    data
                );

            } catch (_) {}

        }

    }


    /* =========================================================
       08 — ERROR
       ========================================================= */

    function reportError(
        exception,
        context
    ) {

        state.statistics.errors +=
            1;


        const error =
            exception instanceof Error
                ? exception
                : new Error(
                    String(
                        exception ||
                        "Unbekannter Router-Fehler"
                    )
                );


        const record = {

            message:
                error.message,

            name:
                error.name,

            stack:
                error.stack ||
                "",

            context:
                context ||
                "Router",

            timestamp:
                Date.now()

        };


        errorLog(
            "[HalDo Router]",
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
                    error,
                    context ||
                    "App Router"
                );

            } catch (_) {}

        }


        return record;

    }


    /* =========================================================
       09 — ROUTE NORMALIZATION
       ========================================================= */

    function normalizePath(
        path
    ) {

        if (
            path === null ||
            path === undefined ||
            path === ""
        ) {

            return "/";

        }


        let value =
            String(
                path
            )
            .trim();


        if (
            !value.startsWith("/")
        ) {

            value =
                "/" + value;

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


    function getAppIdFromPath(
        path
    ) {

        const normalized =
            normalizePath(
                path
            );


        const parts =
            normalized
                .split("/")
                .filter(
                    Boolean
                );


        if (
            parts[0] ===
            "app"
        ) {

            return (
                parts[1] ||
                null
            );

        }


        return null;

    }


    /* =========================================================
       10 — QUERY PARAMETERS
       ========================================================= */

    function parseQuery(
        query
    ) {

        const result = {};


        if (!query) {

            return result;

        }


        const source =
            String(
                query
            )
            .replace(
                /^\?/,
                ""
            );


        if (!source) {

            return result;

        }


        source
            .split("&")
            .forEach(
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


                    if (key) {

                        result[key] =
                            value;

                    }

                }
            );


        return result;

    }


    /* =========================================================
       11 — ROUTE PARSER
       ========================================================= */

    function parseLocation(
        target
    ) {

        let raw =
            String(
                target ||
                "/"
            )
            .trim();


        if (
            raw.startsWith("#")
        ) {

            raw =
                raw.slice(1);

        }


        if (
            raw === ""
        ) {

            raw =
                "/";

        }


        const hashIndex =
            raw.indexOf("#");


        let hash =
            "";


        if (
            hashIndex >= 0
        ) {

            hash =
                raw.slice(
                    hashIndex + 1
                );

            raw =
                raw.slice(
                    0,
                    hashIndex
                );

        }


        const queryIndex =
            raw.indexOf("?");


        let query =
            "";


        if (
            queryIndex >= 0
        ) {

            query =
                raw.slice(
                    queryIndex + 1
                );

            raw =
                raw.slice(
                    0,
                    queryIndex
                );

        }


        const path =
            normalizePath(
                raw
            );


        const appId =
            getAppIdFromPath(
                path
            );


        return {

            path,

            query,

            params:
                parseQuery(
                    query
                ),

            hash,

            appId,

            timestamp:
                Date.now()

        };

    }


    /* =========================================================
       12 — ROUTE REGISTRATION
       ========================================================= */

    function registerRoute(
        path,
        config
    ) {

        const normalized =
            normalizePath(
                path
            );


        if (
            !normalized
        ) {

            return false;

        }


        const definition = {

            path:
                normalized,

            appId:
                config?.appId ||
                getAppIdFromPath(
                    normalized
                ),

            title:
                config?.title ||
                "",

            meta:
                config?.meta ||
                {},

            beforeEnter:
                typeof config?.beforeEnter ===
                "function"
                    ? config.beforeEnter
                    : null,

            enter:
                typeof config?.enter ===
                "function"
                    ? config.enter
                    : null,

            leave:
                typeof config?.leave ===
                "function"
                    ? config.leave
                    : null,

            createdAt:
                Date.now()

        };


        state.routes.set(
            normalized,
            definition
        );


        state.statistics.routeRegistrations +=
            1;


        emit(
            "route-registered",
            {
                route:
                    definition
            }
        );


        return definition;

    }


    function unregisterRoute(
        path
    ) {

        const normalized =
            normalizePath(
                path
            );


        const existed =
            state.routes.delete(
                normalized
            );


        if (existed) {

            emit(
                "route-unregistered",
                {
                    path:
                        normalized
                }
            );

        }


        return existed;

    }


    function getRoute(
        path
    ) {

        return (
            state.routes.get(
                normalizePath(
                    path
                )
            ) ||
            null
        );

    }


    function getRoutes() {

        return Array.from(
            state.routes.values()
        );

    }


    /* =========================================================
       13 — APP STATE
       ========================================================= */

    function getAppState(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return null;

        }


        if (
            !state.appStates.has(id)
        ) {

            state.appStates.set(
                id,
                {

                    appId:
                        id,

                    opened:
                        false,

                    minimized:
                        false,

                    active:
                        false,

                    lastPath:
                        null,

                    params:
                        {},

                    data:
                        {},

                    updatedAt:
                        Date.now()

                }
            );

        }


        return state.appStates.get(
            id
        );

    }


    function setAppState(
        appId,
        changes
    ) {

        const current =
            getAppState(
                appId
            );


        if (!current) {

            return null;

        }


        Object.assign(
            current,
            changes || {},
            {
                updatedAt:
                    Date.now()
            }
        );


        emit(
            "app-state-changed",
            {
                appId:
                    current.appId,

                state:
                    clone(
                        current
                    )

            }
        );


        return current;

    }


    /* =========================================================
       14 — REGISTRY APP LOOKUP
       ========================================================= */

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


    /* =========================================================
       15 — BEFORE NAVIGATION
       ========================================================= */

    async function runBeforeNavigation(
        target,
        options
    ) {

        const current =
            state.current;


        const route =
            getRoute(
                target.path
            );


        if (
            route &&
            typeof route.beforeEnter ===
            "function"
        ) {

            const result =
                await route.beforeEnter(
                    target,
                    current,
                    options || {}
                );


            if (
                result ===
                false
            ) {

                return false;

            }

        }


        return true;

    }


    /* =========================================================
       16 — WINDOW MANAGER OPEN
       ========================================================= */

    async function openWindow(
        app,
        target,
        options
    ) {

        const manager =
            getWindowManager();


        if (
            !manager ||
            !app
        ) {

            return true;

        }


        try {

            /*
             * Unterschiedliche zukünftige
             * Window-Manager APIs werden
             * bewusst unterstützt.
             */

            if (
                hasMethod(
                    manager,
                    "openApp"
                )
            ) {

                const result =
                    manager.openApp(
                        app.id,
                        {
                            app,
                            route:
                                target.path,

                            params:
                                target.params,

                            options:
                                options || {}

                        }
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }


                return true;

            }


            if (
                hasMethod(
                    manager,
                    "open"
                )
            ) {

                const result =
                    manager.open(
                        app.id,
                        {
                            app,
                            route:
                                target.path,

                            params:
                                target.params,

                            options:
                                options || {}

                        }
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }


                return true;

            }


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Window Manager Open"
            );

            return false;

        }

    }


    /* =========================================================
       17 — APP MANAGER OPEN
       ========================================================= */

    async function openThroughManager(
        app,
        target,
        options
    ) {

        const manager =
            getManager();


        if (
            !manager ||
            !app
        ) {

            return true;

        }


        try {

            if (
                hasMethod(
                    manager,
                    "openApp"
                )
            ) {

                const result =
                    manager.openApp(
                        app.id,
                        {
                            route:
                                target.path,

                            params:
                                target.params,

                            options:
                                options || {}

                        }
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }


                return true;

            }


            if (
                hasMethod(
                    manager,
                    "launch"
                )
            ) {

                const result =
                    manager.launch(
                        app.id,
                        options || {}
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }


                return true;

            }


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Manager Open"
            );

            return false;

        }

    }


    /* =========================================================
       18 — HISTORY
       ========================================================= */

    function addHistory(
        location,
        options
    ) {

        if (
            options?.history ===
            false
        ) {

            return;

        }


        const entry = {

            path:
                location.path,

            query:
                location.query,

            hash:
                location.hash,

            params:
                clone(
                    location.params
                ),

            appId:
                location.appId,

            timestamp:
                Date.now()

        };


        /*
         * Neue Navigation nach Back
         * entfernt die alte Forward-History.
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


        if (
            state.history.length >
            state.maxHistory
        ) {

            state.history.shift();

        }


        state.historyIndex =
            state.history.length - 1;

    }


    /* =========================================================
       19 — BROWSER HASH
       ========================================================= */

    function buildHash(
        location
    ) {

        let value =
            location.path;


        if (
            location.query
        ) {

            value +=
                "?" +
                location.query;

        }


        if (
            location.hash
        ) {

            value +=
                "#" +
                location.hash;

        }


        return value;

    }


    function updateBrowserHash(
        location,
        options
    ) {

        if (
            options?.browserHistory ===
            false
        ) {

            return;

        }


        const hash =
            buildHash(
                location
            );


        try {

            if (
                options?.replace ===
                true
            ) {

                window.history.replaceState(
                    {
                        haldo:
                            true,

                        path:
                            location.path
                    },
                    "",
                    "#" + hash
                );

            } else {

                window.history.pushState(
                    {
                        haldo:
                            true,

                        path:
                            location.path
                    },
                    "",
                    "#" + hash
                );

            }

        } catch (exception) {

            /*
             * Fallback für sehr eingeschränkte
             * Umgebungen.
             */

            try {

                window.location.hash =
                    hash;

            } catch (_) {

                reportError(
                    exception,
                    "Browser History"
                );

            }

        }

    }


    /* =========================================================
       20 — NAVIGATE
       ========================================================= */

    async function navigate(
        target,
        options
    ) {

        if (
            state.navigating
        ) {

            /*
             * Navigationen dürfen nicht
             * unkontrolliert ineinander laufen.
             */

            return false;

        }


        const settings =
            options || {};


        const location =
            parseLocation(
                target
            );


        state.statistics.navigations +=
            1;


        state.navigating =
            true;


        emit(
            "before-navigate",
            {
                from:
                    state.current,

                to:
                    location,

                options:
                    settings
            }
        );


        try {

            const allowed =
                await runBeforeNavigation(
                    location,
                    settings
                );


            if (!allowed) {

                state.statistics.failed +=
                    1;

                emit(
                    "navigation-cancelled",
                    {
                        location
                    }
                );


                return false;

            }


            let app =
                null;


            if (
                location.appId
            ) {

                app =
                    resolveApp(
                        location.appId
                    );


                if (!app) {

                    state.statistics.failed +=
                        1;


                    emit(
                        "navigation-failed",
                        {
                            location,

                            reason:
                                "APP_NOT_FOUND"
                        }
                    );


                    return false;

                }


                if (
                    app.enabled ===
                    false
                ) {

                    state.statistics.failed +=
                        1;


                    emit(
                        "navigation-failed",
                        {
                            location,

                            reason:
                                "APP_DISABLED",

                            app
                        }
                    );


                    return false;

                }

            }


            /*
             * Vorherige App deaktivieren.
             */

            if (
                state.current &&
                state.current.appId
            ) {

                const previousState =
                    getAppState(
                        state.current.appId
                    );


                setAppState(
                    state.current.appId,
                    {
                        active:
                            false
                    }
                );


                const previousApp =
                    resolveApp(
                        state.current.appId
                    );


                if (
                    previousApp &&
                    typeof previousApp.onDeactivate ===
                    "function"
                ) {

                    try {

                        await previousApp.onDeactivate(
                            {
                                route:
                                    state.current,

                                reason:
                                    settings.reason ||
                                    "navigation"

                            }
                        );

                    } catch (exception) {

                        reportError(
                            exception,
                            "App Deactivate"
                        );

                    }

                }

            }


            state.previous =
                state.current;


            state.current =
                location;


            if (
                app
            ) {

                setAppState(
                    app.id,
                    {

                        opened:
                            true,

                        minimized:
                            false,

                        active:
                            true,

                        lastPath:
                            location.path,

                        params:
                            clone(
                                location.params
                            )

                    }
                );


                if (
                    typeof app.onActivate ===
                    "function"
                ) {

                    try {

                        await app.onActivate(
                            {
                                route:
                                    location,

                                params:
                                    location.params,

                                options:
                                    settings

                            }
                        );

                    } catch (exception) {

                        reportError(
                            exception,
                            "App Activate"
                        );

                    }

                }

            }


            const managerResult =
                await openThroughManager(
                    app,
                    location,
                    settings
                );


            if (!managerResult) {

                throw new Error(
                    "App Manager konnte die App nicht öffnen."
                );

            }


            const windowResult =
                await openWindow(
                    app,
                    location,
                    settings
                );


            if (!windowResult) {

                throw new Error(
                    "Window Manager konnte die App nicht öffnen."
                );

            }


            const route =
                getRoute(
                    location.path
                );


            if (
                route &&
                typeof route.enter ===
                "function"
            ) {

                await route.enter(
                    location,
                    state.previous,
                    settings
                );

            }


            if (
                settings.history !==
                false
            ) {

                addHistory(
                    location,
                    settings
                );

            }


            if (
                settings.browserHistory !==
                false
            ) {

                updateBrowserHash(
                    location,
                    {
                        ...settings,

                        replace:
                            settings.replace ===
                            true
                    }
                );

            }


            state.statistics.successful +=
                1;


            if (
                app
            ) {

                state.statistics.opens +=
                    1;

            }


            emit(
                "navigated",
                {
                    current:
                        location,

                    previous:
                        state.previous,

                    app:
                        app,

                    options:
                        settings

                }
            );


            emit(
                "after-navigate",
                {
                    current:
                        location,

                    previous:
                        state.previous,

                    app:
                        app

                }
            );


            return true;

        } catch (exception) {

            state.statistics.failed +=
                1;


            reportError(
                exception,
                "Navigation"
            );


            emit(
                "navigation-failed",
                {
                    location,

                    error:
                        exception

                }
            );


            return false;

        } finally {

            state.navigating =
                false;

        }

    }


    /* =========================================================
       21 — OPEN APP
       ========================================================= */

    async function openApp(
        appId,
        options
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return false;

        }


        const route =
            options?.route ||
            "/app/" + id;


        let target =
            route;


        if (
            options?.query
        ) {

            const query =
                typeof options.query ===
                "string"
                    ? options.query
                    : Object.keys(
                        options.query
                    )
                    .map(
                        key =>
                            encodeURIComponent(
                                key
                            ) +
                            "=" +
                            encodeURIComponent(
                                options.query[key]
                            )
                    )
                    .join("&");


            if (query) {

                target +=
                    "?" +
                    query;

            }

        }


        return navigate(
            target,
            options
        );

    }


    /* =========================================================
       22 — CLOSE APP
       ========================================================= */

    async function closeApp(
        appId,
        options
    ) {

        const id =
            normalizeId(
                appId
            );


        const appState =
            getAppState(
                id
            );


        if (!appState) {

            return false;

        }


        const app =
            resolveApp(
                id
            );


        if (
            app &&
            typeof app.close ===
            "function"
        ) {

            try {

                await app.close(
                    options || {}
                );

            } catch (exception) {

                reportError(
                    exception,
                    "App Close"
                );

            }

        }


        setAppState(
            id,
            {

                opened:
                    false,

                active:
                    false,

                minimized:
                    false

            }
        );


        state.statistics.closes +=
            1;


        emit(
            "app-closed",
            {
                appId:
                    id,

                app:
                    app,

                options:
                    options || {}

            }
        );


        /*
         * Wenn die aktuell sichtbare App
         * geschlossen wird, gehen wir nach Home.
         */

        if (
            state.current &&
            state.current.appId ===
            id
        ) {

            await home(
                {
                    reason:
                        "app-close"
                }
            );

        }


        return true;

    }


    /* =========================================================
       23 — HOME
       ========================================================= */

    async function home(
        options
    ) {

        state.statistics.home +=
            1;


        return navigate(
            "/",
            {
                ...(options || {}),

                history:
                    options?.history !==
                    false,

                browserHistory:
                    options?.browserHistory !==
                    false

            }
        );

    }


    /* =========================================================
       24 — BACK
       ========================================================= */

    async function back(
        steps = 1
    ) {

        const amount =
            Math.max(
                1,
                Number(
                    steps
                ) || 1
            );


        const targetIndex =
            Math.max(
                0,
                state.historyIndex -
                amount
            );


        if (
            targetIndex ===
            state.historyIndex
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


        state.statistics.back +=
            1;


        return navigate(
            buildHash(
                entry
            ),
            {
                history:
                    false,

                browserHistory:
                    false,

                reason:
                    "back"

            }
        );

    }


    /* =========================================================
       25 — FORWARD
       ========================================================= */

    async function forward(
        steps = 1
    ) {

        const amount =
            Math.max(
                1,
                Number(
                    steps
                ) || 1
            );


        const targetIndex =
            Math.min(
                state.history.length - 1,
                state.historyIndex +
                amount
            );


        if (
            targetIndex ===
            state.historyIndex
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


        state.statistics.forward +=
            1;


        return navigate(
            buildHash(
                entry
            ),
            {
                history:
                    false,

                browserHistory:
                    false,

                reason:
                    "forward"

            }
        );

    }


    /* =========================================================
       26 — HASH CHANGE
       ========================================================= */

    function handleHashChange() {

        const hash =
            window.location.hash ||
            "";


        if (!hash) {

            return;

        }


        const target =
            hash.startsWith("#")
                ? hash.slice(1)
                : hash;


        if (
            state.current &&
            normalizePath(
                parseLocation(
                    target
                ).path
            ) ===
            normalizePath(
                state.current.path
            )
        ) {

            return;

        }


        navigate(
            target,
            {
                history:
                    true,

                browserHistory:
                    false,

                reason:
                    "hashchange"

            }
        );

    }


    /* =========================================================
       27 — POPSTATE
       ========================================================= */

    function handlePopState(
        event
    ) {

        const stateData =
            event?.state;


        if (
            stateData &&
            stateData.path
        ) {

            navigate(
                stateData.path,
                {
                    history:
                        false,

                    browserHistory:
                        false,

                    reason:
                        "popstate"

                }
            );


            return;

        }


        handleHashChange();

    }


    /* =========================================================
       28 — STARTUP ROUTE
       ========================================================= */

    function resolveStartupRoute() {

        const hash =
            window.location.hash;


        if (
            hash &&
            hash.length > 1
        ) {

            return hash.slice(
                1
            );

        }


        return "/";

    }


    /* =========================================================
       29 — CONNECTIONS
       ========================================================= */

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


            emit(
                "kernel-connected"
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Kernel Connection"
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


        state.connections.system =
            true;


        emit(
            "system-connected"
        );


        return true;

    }


    function connectToRegistry() {

        const registry =
            getRegistry();


        state.connections.registry =
            !!registry;


        if (registry) {

            emit(
                "registry-connected",
                {
                    registry
                }
            );

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


    /* =========================================================
       30 — DIAGNOSTICS
       ========================================================= */

    function getCurrentRoute() {

        return (
            state.current
                ? clone(
                    state.current
                )
                : null
        );

    }


    function getHistory() {

        return {

            entries:
                clone(
                    state.history
                ),

            index:
                state.historyIndex,

            canBack:
                state.historyIndex > 0,

            canForward:
                state.historyIndex <
                state.history.length - 1

        };

    }


    function getStatistics() {

        return {
            ...state.statistics
        };

    }


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

            navigating:
                state.navigating,

            current:
                getCurrentRoute(),

            history:
                getHistory(),

            routeCount:
                state.routes.size,

            appStateCount:
                state.appStates.size,

            connections:
                getConnectionStatus(),

            statistics:
                getStatistics(),

            routes:
                getRoutes()
                    .map(
                        route => ({
                            path:
                                route.path,

                            appId:
                                route.appId,

                            title:
                                route.title

                        })
                    ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* =========================================================
       31 — HEALTH CHECK
       ========================================================= */

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


        if (
            !connections.manager
        ) {

            problems.push(
                "App Manager nicht verbunden."
            );

        }


        return {

            healthy:
                state.ready &&
                problems.length === 0,

            problems,

            ready:
                state.ready,

            current:
                getCurrentRoute(),

            connections,

            timestamp:
                new Date().toISOString()

        };

    }


    /* =========================================================
       32 — INITIALIZE
       ========================================================= */

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


        /*
         * Grundroute registrieren.
         */

        if (
            !state.routes.has("/")
        ) {

            registerRoute(
                "/",
                {
                    title:
                        "HalDo Home"
                }
            );

        }


        /*
         * Listener nur einmal registrieren.
         */

        if (
            !state.domListenersConnected
        ) {

            window.addEventListener(
                "hashchange",
                handleHashChange
            );


            window.addEventListener(
                "popstate",
                handlePopState
            );


            state.domListenersConnected =
                true;

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

                diagnostics:
                    diagnostics()

            }
        );


        log(
            "App Router bereit.",
            VERSION
        );


        /*
         * Vorhandene URL übernehmen,
         * ohne doppelte Browser-History.
         */

        const startup =
            resolveStartupRoute();


        if (
            startup &&
            startup !== "/"
        ) {

            await navigate(
                startup,
                {
                    history:
                        true,

                    browserHistory:
                        false,

                    reason:
                        "startup"

                }
            );

        } else {

            state.current =
                parseLocation(
                    "/"
                );

        }


        return api;

    }


    /* =========================================================
       33 — PUBLIC API
       ========================================================= */

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

                    navigating:
                        state.navigating,

                    current:
                        getCurrentRoute(),

                    historyLength:
                        state.history.length,

                    routeCount:
                        state.routes.size

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

        openApp:
            openApp,

        closeApp:
            closeApp,

        home:
            home,

        back:
            back,

        forward:
            forward,


        /* Routes */

        registerRoute:
            registerRoute,

        unregisterRoute:
            unregisterRoute,

        getRoute:
            getRoute,

        getRoutes:
            getRoutes,

        parseLocation:
            parseLocation,

        normalizePath:
            normalizePath,


        /* App state */

        getAppState:
            getAppState,

        setAppState:
            setAppState,


        /* Current */

        getCurrentRoute:
            getCurrentRoute,


        /* History */

        getHistory:
            getHistory,


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

        getStatistics:
            getStatistics,

        diagnostics:
            diagnostics,

        healthCheck:
            healthCheck,


        /* Lifecycle */

        initialize:
            initialize

    };


    /* =========================================================
       34 — GLOBAL EXPORT
       ========================================================= */

    window.HalDoAppRouter =
        api;

    window.HalDoOSAppRouter =
        api;

    HalDoOS.appRouter =
        api;


    /* =========================================================
       35 — KERNEL READY CONNECTION
       ========================================================= */

    function handleKernelReady() {

        refreshConnections();


        if (
            !state.ready
        ) {

            initialize()
                .catch(
                    function (exception) {

                        reportError(
                            exception,
                            "Router Kernel Ready"
                        );

                    }
                );

        }

    }


    function connectKernelEvents() {

        const kernel =
            getKernel();


        if (
            kernel &&
            hasMethod(
                kernel,
                "on"
            )
        ) {

            try {

                kernel.on(
                    "kernel:ready",
                    handleKernelReady
                );

            } catch (exception) {

                warn(
                    "Kernel Event-Verbindung fehlgeschlagen.",
                    exception
                );

            }

        }

    }


    /* =========================================================
       36 — DOM START
       ========================================================= */

    async function boot() {

        connectKernelEvents();


        try {

            await initialize();

        } catch (exception) {

            state.initializing =
                false;


            reportError(
                exception,
                "Router Startup"
            );

        }

    }


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


    /* =========================================================
       37 — FINAL EXPOSURE
       ========================================================= */

    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appRouter =
        api;


    log(
        "HalDo App Router geladen."
    );


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 19+
   APPLICATION ROUTER
   ============================================================ */