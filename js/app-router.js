/* =========================================================
   HALDO AI OS 18
   APP ROUTER
   Version 18.0.0
   Professional Ultimate Foundation
   ========================================================= */

(function (window, document) {

    "use strict";

    /* =====================================================
       HALDO OS FOUNDATION
       ===================================================== */

    window.HalDoOS = window.HalDoOS || {};

    const HalDoOS = window.HalDoOS;

    /* =====================================================
       CONFIGURATION
       ===================================================== */

    const CONFIG = {

        name:
            "HalDo App Router",

        version:
            "18.0.0",

        defaultRoute:
            "home",

        hashPrefix:
            "#/",

        maxHistory:
            100,

        useHash:
            true,

        autoStart:
            true

    };

    /* =====================================================
       ROUTES
       ===================================================== */

    const routes = new Map();

    /* =====================================================
       ROUTE LISTENERS
       ===================================================== */

    const listeners = new Map();

    /* =====================================================
       ROUTER STATE
       ===================================================== */

    const state = {

        initialized:
            false,

        started:
            false,

        currentRoute:
            null,

        previousRoute:
            null,

        currentParams:
            {},

        history:
            [],

        historyIndex:
            -1,

        navigating:
            false,

        lastNavigation:
            null

    };

    /* =====================================================
       UTILITIES
       ===================================================== */

    function log() {

        const args =
            Array.from(arguments);

        console.log(
            "[HalDo App Router]",
            ...args
        );

    }

    function warn() {

        const args =
            Array.from(arguments);

        console.warn(
            "[HalDo App Router]",
            ...args
        );

    }

    function error() {

        const args =
            Array.from(arguments);

        console.error(
            "[HalDo App Router]",
            ...args
        );

    }

    function normalizeRoute(route) {

        if (
            route === null ||
            route === undefined
        ) {

            return CONFIG.defaultRoute;

        }

        let value =
            String(route).trim();

        if (!value) {

            return CONFIG.defaultRoute;

        }

        if (
            value.startsWith(
                CONFIG.hashPrefix
            )
        ) {

            value =
                value.substring(
                    CONFIG.hashPrefix.length
                );

        }

        if (
            value.startsWith("#")
        ) {

            value =
                value.substring(1);

        }

        if (
            value.startsWith("/")
        ) {

            value =
                value.substring(1);

        }

        return value || CONFIG.defaultRoute;

    }

    function parseRoute(route) {

        const normalized =
            normalizeRoute(route);

        const parts =
            normalized.split("?");

        const path =
            parts[0] || CONFIG.defaultRoute;

        const query =
            parts[1] || "";

        const params = {};

        if (query) {

            query
                .split("&")
                .forEach(function (item) {

                    if (!item) {
                        return;
                    }

                    const pair =
                        item.split("=");

                    const key =
                        decodeURIComponent(
                            pair[0] || ""
                        );

                    const value =
                        decodeURIComponent(
                            pair.slice(1).join("=")
                        );

                    if (key) {

                        params[key] =
                            value;

                    }

                });

        }

        return {

            route:
                path,

            params:
                params,

            query:
                query

        };

    }

    function buildRoute(route, params) {

        const normalized =
            normalizeRoute(route);

        if (
            !params ||
            typeof params !== "object"
        ) {

            return normalized;

        }

        const keys =
            Object.keys(params);

        if (!keys.length) {

            return normalized;

        }

        const query =
            keys
                .filter(function (key) {

                    return (
                        params[key] !==
                        undefined &&
                        params[key] !==
                        null
                    );

                })
                .map(function (key) {

                    return (
                        encodeURIComponent(key) +
                        "=" +
                        encodeURIComponent(
                            params[key]
                        )
                    );

                })
                .join("&");

        return query
            ? normalized + "?" + query
            : normalized;

    }

    /* =====================================================
       EVENT SYSTEM
       ===================================================== */

    function on(
        eventName,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return function () {};

        }

        if (
            !listeners.has(
                eventName
            )
        ) {

            listeners.set(
                eventName,
                new Set()
            );

        }

        const callbacks =
            listeners.get(
                eventName
            );

        callbacks.add(callback);

        return function () {

            callbacks.delete(
                callback
            );

        };

    }

    function off(
        eventName,
        callback
    ) {

        const callbacks =
            listeners.get(
                eventName
            );

        if (!callbacks) {
            return;
        }

        callbacks.delete(
            callback
        );

    }

    function emit(
        eventName,
        data
    ) {

        const callbacks =
            listeners.get(
                eventName
            );

        if (callbacks) {

            callbacks.forEach(
                function (callback) {

                    try {

                        callback(data);

                    } catch (err) {

                        error(
                            "Event-Fehler:",
                            eventName,
                            err
                        );

                    }

                }
            );

        }

        /*
         * Verbindung zum bestehenden Kernel.
         */

        const kernel =
            window.HalDoKernel;

        if (
            kernel &&
            typeof kernel.emit ===
            "function"
        ) {

            try {

                kernel.emit(
                    "router:" + eventName,
                    data
                );

            } catch (err) {

                warn(
                    "Kernel Event konnte nicht gesendet werden.",
                    err
                );

            }

        }

    }

    /* =====================================================
       ROUTE REGISTRATION
       ===================================================== */

    function register(
        name,
        handler,
        options
    ) {

        const route =
            normalizeRoute(name);

        if (!route) {

            throw new Error(
                "Ungültige Route."
            );

        }

        if (
            typeof handler !==
            "function"
        ) {

            throw new TypeError(
                "Route Handler muss eine Funktion sein."
            );

        }

        const config =
            Object.assign(
                {
                    name:
                        route,

                    protected:
                        false,

                    title:
                        "HalDo AI",

                    metadata:
                        {}

                },
                options || {}
            );

        routes.set(
            route,
            {
                name:
                    route,

                handler:
                    handler,

                config:
                    config

            }
        );

        emit(
            "route:registered",
            {
                route:
                    route,

                config:
                    config

            }
        );

        return true;

    }

    function unregister(
        name
    ) {

        const route =
            normalizeRoute(name);

        if (
            !routes.has(route)
        ) {

            return false;

        }

        routes.delete(route);

        emit(
            "route:unregistered",
            route
        );

        return true;

    }

    function hasRoute(
        name
    ) {

        return routes.has(
            normalizeRoute(name)
        );

    }

    function getRoute(
        name
    ) {

        return routes.get(
            normalizeRoute(name)
        ) || null;

    }

    function getRoutes() {

        return Array.from(
            routes.keys()
        );

    }

    /* =====================================================
       HASH MANAGEMENT
       ===================================================== */

    function getHashRoute() {

        if (!window.location.hash) {

            return CONFIG.defaultRoute;

        }

        return normalizeRoute(
            window.location.hash
        );

    }

    function updateHash(
        route,
        replace
    ) {

        if (!CONFIG.useHash) {
            return;
        }

        const value =
            CONFIG.hashPrefix +
            normalizeRoute(route);

        try {

            if (replace) {

                window.history.replaceState(
                    {
                        haldoRoute:
                            normalizeRoute(route)
                    },
                    "",
                    value
                );

            } else {

                window.history.pushState(
                    {
                        haldoRoute:
                            normalizeRoute(route)
                    },
                    "",
                    value
                );

            }

        } catch (err) {

            window.location.hash =
                value;

        }

    }

    /* =====================================================
       HISTORY
       ===================================================== */

    function addHistory(
        route,
        params
    ) {

        const entry = {

            route:
                route,

            params:
                Object.assign(
                    {},
                    params || {}
                ),

            timestamp:
                Date.now()

        };

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
            CONFIG.maxHistory
        ) {

            state.history.shift();

        }

        state.historyIndex =
            state.history.length - 1;

    }

    /* =====================================================
       ROUTE EXECUTION
       ===================================================== */

    async function executeRoute(
        route,
        params,
        options
    ) {

        const target =
            routes.get(route);

        if (!target) {

            warn(
                "Route nicht gefunden:",
                route
            );

            emit(
                "route:not-found",
                {
                    route:
                        route,

                    params:
                        params

                }
            );

            /*
             * Fallback auf Home.
             */

            if (
                route !==
                CONFIG.defaultRoute &&
                routes.has(
                    CONFIG.defaultRoute
                )
            ) {

                return executeRoute(
                    CONFIG.defaultRoute,
                    {},
                    Object.assign(
                        {},
                        options || {},
                        {
                            fallback:
                                true
                        }
                    )
                );

            }

            return false;

        }

        state.navigating =
            true;

        const previous =
            state.currentRoute;

        state.previousRoute =
            previous;

        state.currentRoute =
            route;

        state.currentParams =
            Object.assign(
                {},
                params || {}
            );

        const navigation = {

            route:
                route,

            previousRoute:
                previous,

            params:
                state.currentParams,

            options:
                options || {},

            timestamp:
                Date.now()

        };

        state.lastNavigation =
            navigation;

        emit(
            "before:navigate",
            navigation
        );

        try {

            const result =
                await target.handler(
                    navigation
                );

            emit(
                "navigate",
                Object.assign(
                    {},
                    navigation,
                    {
                        result:
                            result
                    }
                )
            );

            emit(
                "route:" + route,
                navigation
            );

            state.navigating =
                false;

            return true;

        } catch (err) {

            state.navigating =
                false;

            error(
                "Route konnte nicht ausgeführt werden:",
                route,
                err
            );

            emit(
                "navigation:error",
                {
                    route:
                        route,

                    error:
                        err,

                    navigation:
                        navigation

                }
            );

            return false;

        }

    }

    /* =====================================================
       NAVIGATE
       ===================================================== */

    async function navigate(
        route,
        params,
        options
    ) {

        const parsed =
            parseRoute(route);

        const target =
            parsed.route;

        const finalParams =
            Object.assign(
                {},
                parsed.params,
                params || {}
            );

        const settings =
            Object.assign(
                {
                    replace:
                        false,

                    silent:
                        false,

                    updateHash:
                        true,

                    addHistory:
                        true

                },
                options || {}
            );

        const completeRoute =
            buildRoute(
                target,
                finalParams
            );

        if (
            state.navigating
        ) {

            warn(
                "Navigation bereits aktiv."
            );

        }

        if (
            settings.updateHash
        ) {

            updateHash(
                completeRoute,
                settings.replace
            );

        }

        if (
            settings.addHistory
        ) {

            addHistory(
                target,
                finalParams
            );

        }

        if (
            settings.silent
        ) {

            return true;

        }

        return executeRoute(
            target,
            finalParams,
            settings
        );

    }

    /* =====================================================
       REPLACE
       ===================================================== */

    function replace(
        route,
        params
    ) {

        return navigate(
            route,
            params,
            {
                replace:
                    true,

                addHistory:
                    true

            }
        );

    }

    /* =====================================================
       BACK
       ===================================================== */

    function back() {

        if (
            state.historyIndex <= 0
        ) {

            if (
                window.history.length >
                1
            ) {

                window.history.back();

            }

            return false;

        }

        state.historyIndex--;

        const entry =
            state.history[
                state.historyIndex
            ];

        if (!entry) {
            return false;
        }

        return navigate(
            entry.route,
            entry.params,
            {
                replace:
                    true,

                addHistory:
                    false

            }
        );

    }

    /* =====================================================
       FORWARD
       ===================================================== */

    function forward() {

        if (
            state.historyIndex >=
            state.history.length - 1
        ) {

            if (
                window.history.forward
            ) {

                window.history.forward();

            }

            return false;

        }

        state.historyIndex++;

        const entry =
            state.history[
                state.historyIndex
            ];

        if (!entry) {
            return false;
        }

        return navigate(
            entry.route,
            entry.params,
            {
                replace:
                    true,

                addHistory:
                    false

            }
        );

    }

    /* =====================================================
       HOME
       ===================================================== */

    function home() {

        return navigate(
            CONFIG.defaultRoute
        );

    }

    /* =====================================================
       ROUTER STATE
       ===================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            started:
                state.started,

            currentRoute:
                state.currentRoute,

            previousRoute:
                state.previousRoute,

            currentParams:
                Object.assign(
                    {},
                    state.currentParams
                ),

            history:
                state.history.map(
                    function (item) {

                        return Object.assign(
                            {},
                            item
                        );

                    }
                ),

            historyIndex:
                state.historyIndex,

            navigating:
                state.navigating

        };

    }

    /* =====================================================
       APP MANAGER CONNECTION
       ===================================================== */

    function resolveAppManager() {

        return (
            window.HalDoAppManager ||
            (
                HalDoOS &&
                HalDoOS.appManager
            ) ||
            null
        );

    }

    function openApplication(
        appId,
        params
    ) {

        const manager =
            resolveAppManager();

        if (
            manager &&
            typeof manager.open ===
            "function"
        ) {

            try {

                return manager.open(
                    appId,
                    params || {}
                );

            } catch (err) {

                error(
                    "App Manager konnte App nicht öffnen:",
                    appId,
                    err
                );

            }

        }

        emit(
            "app:open-request",
            {
                appId:
                    appId,

                params:
                    params || {}

            }
        );

        return false;

    }

    /* =====================================================
       APP ROUTE
       ===================================================== */

    function registerAppRoute(
        appId,
        route
    ) {

        const routeName =
            route ||
            "app/" + appId;

        return register(
            routeName,
            function (navigation) {

                return openApplication(
                    appId,
                    navigation.params
                );

            },
            {
                title:
                    appId,

                metadata:
                    {
                        appId:
                            appId
                    }

            }
        );

    }

    /* =====================================================
       DEFAULT ROUTES
       ===================================================== */

    function registerDefaultRoutes() {

        if (
            !routes.has("home")
        ) {

            register(
                "home",
                function () {

                    emit(
                        "home:open"
                    );

                    return true;

                },
                {
                    title:
                        "HalDo AI Home"
                }
            );

        }

        if (
            !routes.has("chat")
        ) {

            register(
                "chat",
                function () {

                    emit(
                        "chat:open"
                    );

                    const launcher =
                        window.HalDoLauncher ||
                        window.HalDoAppLauncher;

                    if (
                        launcher &&
                        typeof launcher.open ===
                        "function"
                    ) {

                        try {

                            return launcher.open(
                                "chat"
                            );

                        } catch (err) {

                            warn(
                                "Chat Launcher konnte nicht geöffnet werden.",
                                err
                            );

                        }

                    }

                    return false;

                },
                {
                    title:
                        "HalDo AI Chat"
                }
            );

        }

        if (
            !routes.has("apps")
        ) {

            register(
                "apps",
                function () {

                    emit(
                        "apps:open"
                    );

                    return openApplication(
                        "apps"
                    );

                },
                {
                    title:
                        "HalDo Apps"
                }
            );

        }

        if (
            !routes.has("settings")
        ) {

            register(
                "settings",
                function () {

                    emit(
                        "settings:open"
                    );

                    return openApplication(
                        "settings"
                    );

                },
                {
                    title:
                        "HalDo Einstellungen"
                }
            );

        }

        if (
            !routes.has("dashboard")
        ) {

            register(
                "dashboard",
                function () {

                    emit(
                        "dashboard:open"
                    );

                    return openApplication(
                        "dashboard"
                    );

                },
                {
                    title:
                        "HalDo Dashboard"
                }
            );

        }

    }

    /* =====================================================
       HASH / POPSTATE
       ===================================================== */

    function handleLocationChange() {

        const route =
            getHashRoute();

        const parsed =
            parseRoute(route);

        executeRoute(
            parsed.route,
            parsed.params,
            {
                fromBrowser:
                    true,

                updateHash:
                    false,

                addHistory:
                    false

            }
        );

    }

    /* =====================================================
       INITIALIZATION
       ===================================================== */

    function initialize() {

        if (
            state.initialized
        ) {

            return true;

        }

        registerDefaultRoutes();

        window.addEventListener(
            "hashchange",
            handleLocationChange
        );

        window.addEventListener(
            "popstate",
            handleLocationChange
        );

        state.initialized =
            true;

        emit(
            "initialized",
            getState()
        );

        log(
            "Router initialisiert."
        );

        return true;

    }

    /* =====================================================
       START
       ===================================================== */

    function start() {

        if (
            state.started
        ) {

            return true;

        }

        initialize();

        const initialRoute =
            getHashRoute();

        const parsed =
            parseRoute(
                initialRoute
            );

        state.started =
            true;

        navigate(
            parsed.route,
            parsed.params,
            {
                replace:
                    true,

                updateHash:
                    false,

                addHistory:
                    true

            }
        );

        emit(
            "started",
            getState()
        );

        log(
            "Router gestartet:",
            parsed.route
        );

        return true;

    }

    /* =====================================================
       STOP
       ===================================================== */

    function stop() {

        if (
            !state.started
        ) {

            return;

        }

        window.removeEventListener(
            "hashchange",
            handleLocationChange
        );

        window.removeEventListener(
            "popstate",
            handleLocationChange
        );

        state.started =
            false;

        emit(
            "stopped"
        );

    }

    /* =====================================================
       KERNEL MODULE
       ===================================================== */

    const module = {

        name:
            "app-router",

        version:
            CONFIG.version,

        init:
            function () {

                initialize();

                return true;

            },

        start:
            start,

        stop:
            stop,

        register:
            register,

        unregister:
            unregister,

        registerAppRoute:
            registerAppRoute,

        hasRoute:
            hasRoute,

        getRoute:
            getRoute,

        getRoutes:
            getRoutes,

        navigate:
            navigate,

        go:
            navigate,

        replace:
            replace,

        back:
            back,

        forward:
            forward,

        home:
            home,

        on:
            on,

        off:
            off,

        emit:
            emit,

        getState:
            getState,

        config:
            CONFIG

    };

    /* =====================================================
       GLOBAL APIS
       ===================================================== */

    window.HalDoAppRouter =
        module;

    HalDoOS.appRouter =
        module;

    HalDoOS.router =
        module;

    /* =====================================================
       KERNEL REGISTRATION
       ===================================================== */

    function registerWithKernel() {

        const kernel =
            window.HalDoKernel;

        if (
            !kernel
        ) {

            return false;

        }

        try {

            if (
                typeof kernel.registerModule ===
                "function"
            ) {

                kernel.registerModule(
                    "app-router",
                    module
                );

            }

            return true;

        } catch (err) {

            warn(
                "Router konnte nicht beim Kernel registriert werden.",
                err
            );

            return false;

        }

    }

    /* =====================================================
       KERNEL READY CONNECTION
       ===================================================== */

    function connectKernel() {

        const kernel =
            window.HalDoKernel;

        if (
            !kernel
        ) {

            return;

        }

        if (
            typeof kernel.on ===
            "function"
        ) {

            kernel.on(
                "kernel:ready",
                function () {

                    registerWithKernel();

                    if (
                        !state.started &&
                        CONFIG.autoStart
                    ) {

                        start();

                    }

                }
            );

        }

        registerWithKernel();

    }

    /* =====================================================
       DOM READY
       ===================================================== */

    function boot() {

        initialize();

        connectKernel();

        /*
         * Der Kernel bleibt die übergeordnete
         * Systeminstanz.
         *
         * Der Router startet deshalb erst,
         * wenn der DOM und die Foundation
         * verfügbar sind.
         */

        if (
            CONFIG.autoStart
        ) {

            window.setTimeout(
                function () {

                    if (
                        !state.started
                    ) {

                        start();

                    }

                },
                0
            );

        }

    }

    /* =====================================================
       PUBLIC ROUTER INFORMATION
       ===================================================== */

    HalDoOS.getRouterStatus =
        function () {

            return {

                name:
                    CONFIG.name,

                version:
                    CONFIG.version,

                initialized:
                    state.initialized,

                started:
                    state.started,

                currentRoute:
                    state.currentRoute,

                routes:
                    getRoutes()

            };

        };

    /* =====================================================
       INITIAL START
       ===================================================== */

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

})(window, document);