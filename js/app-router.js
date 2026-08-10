// ============================================================

// HalDo AI OS 18

// App Router

// Version 18.0.0

// Professional Ultimate Foundation

//

// Aufgabe:

// - Zentrale Navigation zwischen HalDo-Apps

// - Verbindung zu App Manager / App Registry

// - Verbindung zum Kernel Event-Bus

// - History / Back / Forward

// - Deep-Link-Unterstützung

// - Route Guards

// - Fehler- und Fallback-Schutz

// - Erweiterbar für zukünftige Apps

// ============================================================

(function (window, document) {

    "use strict";

    // --------------------------------------------------------

    // GLOBAL ROOT

    // --------------------------------------------------------

    window.HalDoOS = window.HalDoOS || {};

    // --------------------------------------------------------

    // CONFIG

    // --------------------------------------------------------

    const CONFIG = {

        name: "HalDo App Router",

        version: "18.0.0",

        defaultRoute: "home",

        historyEnabled: true,

        hashEnabled: true,

        debug: false,

        transitionDelay: 0

    };

    // --------------------------------------------------------

    // INTERNAL STATE

    // --------------------------------------------------------

    const state = {

        initialized: false,

        currentRoute: null,

        previousRoute: null,

        history: [],

        historyIndex: -1,

        navigating: false,

        routes: new Map(),

        guards: [],

        listeners: new Map()

    };

    // --------------------------------------------------------

    // LOGGING

    // --------------------------------------------------------

    function log() {

        if (!CONFIG.debug) {

            return;

        }

        const args =

            Array.prototype.slice.call(arguments);

        console.log(

            "[HalDo App Router]",

            ...args

        );

    }

    function warn() {

        const args =

            Array.prototype.slice.call(arguments);

        console.warn(

            "[HalDo App Router]",

            ...args

        );

    }

    function error() {

        const args =

            Array.prototype.slice.call(arguments);

        console.error(

            "[HalDo App Router]",

            ...args

        );

    }

    // --------------------------------------------------------

    // EVENT SYSTEM

    // --------------------------------------------------------

    function on(eventName, callback) {

        if (

            typeof callback !== "function"

        ) {

            return function () {};

        }

        if (

            !state.listeners.has(eventName)

        ) {

            state.listeners.set(

                eventName,

                new Set()

            );

        }

        const listeners =

            state.listeners.get(eventName);

        listeners.add(callback);

        return function () {

            listeners.delete(callback);

        };

    }

    function off(eventName, callback) {

        const listeners =

            state.listeners.get(eventName);

        if (!listeners) {

            return;

        }

        listeners.delete(callback);

    }

    function emit(eventName, data) {

        const listeners =

            state.listeners.get(eventName);

        if (listeners) {

            listeners.forEach(

                function (callback) {

                    try {

                        callback(data);

                    } catch (err) {

                        error(

                            "Router Event Fehler:",

                            err

                        );

                    }

                }

            );

        }

        // ----------------------------------------------------

        // Kernel Event-Bus

        // ----------------------------------------------------

        try {

            const kernel =

                window.HalDoKernel;

            if (

                kernel &&

                typeof kernel.emit === "function"

            ) {

                kernel.emit(

                    "app-router:" + eventName,

                    data

                );

            }

        } catch (err) {

            warn(

                "Kernel Event konnte nicht gesendet werden.",

                err

            );

        }

    }

    // --------------------------------------------------------

    // NORMALIZE ROUTE

    // --------------------------------------------------------

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

        // Hash entfernen

        value =

            value.replace(/^#/, "");

        // Slash entfernen

        value =

            value.replace(/^\/+/, "");

        value =

            value.replace(/\/+$/, "");

        // Leerzeichen normalisieren

        value =

            value.replace(/\s+/g, "-");

        return (

            value.toLowerCase()

        );

    }

    // --------------------------------------------------------

    // ROUTE PARAMETERS

    // --------------------------------------------------------

    function parseRoute(route) {

        const normalized =

            normalizeRoute(route);

        const parts =

            normalized.split("?");

        const path =

            parts[0] || CONFIG.defaultRoute;

        const queryString =

            parts[1] || "";

        const query = {};

        if (queryString) {

            queryString

                .split("&")

                .forEach(

                    function (item) {

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

                            query[key] =

                                value;

                        }

                    }

                );

        }

        return {

            route: normalized,

            path: path,

            query: query

        };

    }

    // --------------------------------------------------------

    // REGISTER ROUTE

    // --------------------------------------------------------

    function register(

        route,

        handler,

        options

    ) {

        const normalized =

            normalizeRoute(route);

        if (!normalized) {

            return false;

        }

        if (

            typeof handler !== "function"

        ) {

            warn(

                "Route benötigt eine Handler-Funktion:",

                normalized

            );

            return false;

        }

        const config =

            Object.assign(

                {

                    name: normalized,

                    title: normalized,

                    requires: [],

                    guard: null,

                    replace: false,

                    metadata: {}

                },

                options || {}

            );

        state.routes.set(

            normalized,

            {

                route: normalized,

                handler: handler,

                config: config

            }

        );

        emit(

            "route:registered",

            {

                route: normalized,

                config: config

            }

        );

        return true;

    }

    // --------------------------------------------------------

    // UNREGISTER ROUTE

    // --------------------------------------------------------

    function unregister(route) {

        const normalized =

            normalizeRoute(route);

        const removed =

            state.routes.delete(

                normalized

            );

        if (removed) {

            emit(

                "route:unregistered",

                normalized

            );

        }

        return removed;

    }

    // --------------------------------------------------------

    // HAS ROUTE

    // --------------------------------------------------------

    function has(route) {

        const normalized =

            normalizeRoute(route);

        return state.routes.has(

            normalized

        );

    }

    // --------------------------------------------------------

    // GET ROUTE

    // --------------------------------------------------------

    function get(route) {

        const normalized =

            normalizeRoute(route);

        return (

            state.routes.get(

                normalized

            ) || null

        );

    }

    // --------------------------------------------------------

    // GET ALL ROUTES

    // --------------------------------------------------------

    function getRoutes() {

        return Array.from(

            state.routes.values()

        ).map(

            function (entry) {

                return {

                    route: entry.route,

                    config: Object.assign(

                        {},

                        entry.config

                    )

                };

            }

        );

    }

    // --------------------------------------------------------

    // GUARDS

    // --------------------------------------------------------

    function addGuard(guard) {

        if (

            typeof guard !== "function"

        ) {

            return function () {};

        }

        state.guards.push(

            guard

        );

        return function () {

            const index =

                state.guards.indexOf(

                    guard

                );

            if (index >= 0) {

                state.guards.splice(

                    index,

                    1

                );

            }

        };

    }

    // --------------------------------------------------------

    // CHECK GUARDS

    // --------------------------------------------------------

    async function checkGuards(

        destination,

        context

    ) {

        for (

            let i = 0;

            i < state.guards.length;

            i++

        ) {

            const guard =

                state.guards[i];

            try {

                const result =

                    await guard(

                        destination,

                        context

                    );

                if (

                    result === false

                ) {

                    return false;

                }

            } catch (err) {

                error(

                    "Route Guard Fehler:",

                    err

                );

                return false;

            }

        }

        return true;

    }

    // --------------------------------------------------------

    // APP SYSTEM CONNECTION

    // --------------------------------------------------------

    function getAppManager() {

        if (

            window.HalDoAppManager

        ) {

            return window.HalDoAppManager;

        }

        if (

            window.HalDoOS &&

            window.HalDoOS.appManager

        ) {

            return window.HalDoOS.appManager;

        }

        return null;

    }

    function getAppRegistry() {

        if (

            window.HalDoAppRegistry

        ) {

            return window.HalDoAppRegistry;

        }

        if (

            window.HalDoOS &&

            window.HalDoOS.appRegistry

        ) {

            return window.HalDoOS.appRegistry;

        }

        return null;

    }

    // --------------------------------------------------------

    // OPEN APP THROUGH APP MANAGER

    // --------------------------------------------------------

    async function openApp(

        appId,

        params

    ) {

        const manager =

            getAppManager();

        if (!manager) {

            warn(

                "App Manager noch nicht verfügbar:",

                appId

            );

            return false;

        }

        try {

            if (

                typeof manager.open ===

                "function"

            ) {

                return await manager.open(

                    appId,

                    params || {}

                );

            }

            if (

                typeof manager.launch ===

                "function"

            ) {

                return await manager.launch(

                    appId,

                    params || {}

                );

            }

            if (

                typeof manager.start ===

                "function"

            ) {

                return await manager.start(

                    appId,

                    params || {}

                );

            }

        } catch (err) {

            error(

                "App konnte nicht geöffnet werden:",

                appId,

                err

            );

            return false;

        }

        warn(

            "App Manager besitzt keine bekannte Open-Methode:",

            appId

        );

        return false;

    }

    // --------------------------------------------------------

    // CLOSE APP

    // --------------------------------------------------------

    async function closeApp(

        appId

    ) {

        const manager =

            getAppManager();

        if (!manager) {

            return false;

        }

        try {

            if (

                typeof manager.close ===

                "function"

            ) {

                return await manager.close(

                    appId

                );

            }

            if (

                typeof manager.stop ===

                "function"

            ) {

                return await manager.stop(

                    appId

                );

            }

        } catch (err) {

            error(

                "App konnte nicht geschlossen werden:",

                appId,

                err

            );

        }

        return false;

    }

    // --------------------------------------------------------

    // FIND APP

    // --------------------------------------------------------

    function findApp(appId) {

        const registry =

            getAppRegistry();

        if (!registry) {

            return null;

        }

        try {

            if (

                typeof registry.get ===

                "function"

            ) {

                return registry.get(

                    appId

                );

            }

            if (

                typeof registry.find ===

                "function"

            ) {

                return registry.find(

                    appId

                );

            }

            if (

                typeof registry.getApp ===

                "function"

            ) {

                return registry.getApp(

                    appId

                );

            }

        } catch (err) {

            warn(

                "App Registry Zugriff fehlgeschlagen:",

                err

            );

        }

        return null;

    }

    // --------------------------------------------------------

    // HISTORY

    // --------------------------------------------------------

    function addHistory(

        route,

        replace

    ) {

        if (!CONFIG.historyEnabled) {

            return;

        }

        const normalized =

            normalizeRoute(route);

        if (

            replace &&

            state.history.length > 0

        ) {

            state.history[

                state.historyIndex

            ] = normalized;

            return;

        }

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

            normalized

        );

        state.historyIndex =

            state.history.length - 1;

    }

    // --------------------------------------------------------

    // HASH

    // --------------------------------------------------------

    function updateHash(route) {

        if (!CONFIG.hashEnabled) {

            return;

        }

        const hash =

            "#" + normalizeRoute(route);

        if (

            window.location.hash !== hash

        ) {

            window.history.replaceState(

                null,

                "",

                hash

            );

        }

    }

    function readHash() {

        return normalizeRoute(

            window.location.hash

        );

    }

    // --------------------------------------------------------

    // NAVIGATE

    // --------------------------------------------------------

    async function navigate(

        route,

        options

    ) {

        const settings =

            Object.assign(

                {

                    replace: false,

                    fromHistory: false,

                    updateHash: true,

                    params: {},

                    silent: false

                },

                options || {}

            );

        const parsed =

            parseRoute(route);

        const destination =

            parsed.route;

        if (state.navigating) {

            log(

                "Navigation bereits aktiv:",

                destination

            );

        }

        const entry =

            get(destination);

        if (!entry) {

            warn(

                "Route nicht registriert:",

                destination

            );

            emit(

                "route:not-found",

                {

                    route: destination

                }

            );

            if (

                destination !==

                CONFIG.defaultRoute

            ) {

                return navigate(

                    CONFIG.defaultRoute,

                    {

                        replace: true

                    }

                );

            }

            return false;

        }

        const context = {

            route: destination,

            path: parsed.path,

            query: parsed.query,

            params: settings.params,

            previousRoute:

                state.currentRoute,

            router: api

        };

        const allowed =

            await checkGuards(

                destination,

                context

            );

        if (!allowed) {

            emit(

                "route:blocked",

                context

            );

            return false;

        }

        state.navigating = true;

        state.previousRoute =

            state.currentRoute;

        emit(

            "navigation:start",

            context

        );

        try {

            if (

                state.previousRoute &&

                state.previousRoute !==

                    destination

            ) {

                const previousEntry =

                    get(

                        state.previousRoute

                    );

                if (

                    previousEntry &&

                    previousEntry.config &&

                    previousEntry.config.onLeave

                ) {

                    await previousEntry

                        .config

                        .onLeave(

                            context

                        );

                }

            }

            const result =

                await entry.handler(

                    context

                );

            state.currentRoute =

                destination;

            if (

                !settings.fromHistory

            ) {

                addHistory(

                    destination,

                    settings.replace

                );

            }

            if (

                settings.updateHash

            ) {

                updateHash(

                    destination

                );

            }

            if (

                entry.config &&

                typeof entry.config.onEnter ===

                    "function"

            ) {

                await entry.config.onEnter(

                    context

                );

            }

            emit(

                "navigation:complete",

                {

                    context: context,

                    result: result

                }

            );

            return result !== false;

        } catch (err) {

            error(

                "Navigation Fehler:",

                destination,

                err

            );

            emit(

                "navigation:error",

                {

                    route: destination,

                    error: err

                }

            );

            return false;

        } finally {

            state.navigating = false;

        }

    }

    // --------------------------------------------------------

    // BACK

    // --------------------------------------------------------

    async function back() {

        if (

            state.historyIndex <= 0

        ) {

            return false;

        }

        state.historyIndex--;

        const route =

            state.history[

                state.historyIndex

            ];

        return navigate(

            route,

            {

                fromHistory: true

            }

        );

    }

    // --------------------------------------------------------

    // FORWARD

    // --------------------------------------------------------

    async function forward() {

        if (

            state.historyIndex >=

            state.history.length - 1

        ) {

            return false;

        }

        state.historyIndex++;

        const route =

            state.history[

                state.historyIndex

            ];

        return navigate(

            route,

            {

                fromHistory: true

            }

        );

    }

    // --------------------------------------------------------

    // CURRENT ROUTE

    // --------------------------------------------------------

    function current() {

        return state.currentRoute;

    }

    // --------------------------------------------------------

    // RESET

    // --------------------------------------------------------

    function reset() {

        state.currentRoute =

            null;

        state.previousRoute =

            null;

        state.history = [];

        state.historyIndex =

            -1;

        state.navigating =

            false;

        emit(

            "router:reset"

        );

    }

    // --------------------------------------------------------

    // DEFAULT ROUTES

    // --------------------------------------------------------

    function registerDefaultRoutes() {

        register(

            "home",

            async function () {

                emit(

                    "app:home",

                    {

                        route: "home"

                    }

                );

                return true;

            },

            {

                title: "HalDo AI Home"

            }

        );

        register(

            "chat",

            function (context) {

                if (

                    window.HalDoOS &&

                    typeof window.HalDoOS.open ===

                        "function"

                ) {

                    return window.HalDoOS.open(

                        "chat"

                    );

                }

                emit(

                    "app:chat",

                    context

                );

                return true;

            },

            {

                title: "HalDo AI Gespräch"

            }

        );

        register(

            "apps",

            function (context) {

                emit(

                    "app:apps",

                    context

                );

                return true;

            },

            {

                title: "HalDo Apps"

            }

        );

        register(

            "settings",

            function (context) {

                if (

                    window.HalDoOS &&

                    typeof window.HalDoOS.open ===

                        "function"

                ) {

                    return window.HalDoOS.open(

                        "settings"

                    );

                }

                emit(

                    "app:settings",

                    context

                );

                return true;

            },

            {

                title: "HalDo Einstellungen"

            }

        );

        register(

            "dashboard",

            function (context) {

                if (

                    window.HalDoOS &&

                    typeof window.HalDoOS.open ===

                        "function"

                ) {

                    return window.HalDoOS.open(

                        "dashboard"

                    );

                }

                emit(

                    "app:dashboard",

                    context

                );

                return true;

            },

            {

                title: "HalDo Dashboard"

            }

        );

        register(

            "modules",

            function (context) {

                if (

                    window.HalDoOS &&

                    typeof window.HalDoOS.open ===

                        "function"

                ) {

                    return window.HalDoOS.open(

                        "modules"

                    );

                }

                emit(

                    "app:modules",

                    context

                );

                return true;

            },

            {

                title: "HalDo Module"

            }

        );

        register(

            "diagnostics",

            function (context) {

                if (

                    window.HalDoOS &&

                    typeof window.HalDoOS.open ===

                        "function"

                ) {

                    return window.HalDoOS.open(

                        "diagnostics"

                    );

                }

                emit(

                    "app:diagnostics",

                    context

                );

                return true;

            },

            {

                title: "HalDo Diagnose"

            }

        );

        register(

            "voice",

            function (context) {

                emit(

                    "app:voice",

                    context

                );

                return openApp(

                    "voice",

                    context.params

                );

            },

            {

                title: "HalDo Voice"

            }

        );

        register(

            "knowledge",

            function (context) {

                emit(

                    "app:knowledge",

                    context

                );

                return openApp(

                    "knowledge",

                    context.params

                );

            },

            {

                title: "HalDo Knowledge"

            }

        );

        register(

            "code",

            function (context) {

                emit(

                    "app:code",

                    context

                );

                return openApp(

                    "code",

                    context.params

                );

            },

            {

                title: "HalDo Code Builder"

            }

        );

        register(

            "keyboard",

            function (context) {

                emit(

                    "app:keyboard",

                    context

                );

                return openApp(

                    "ezidi-keyboard",

                    context.params

                );

            },

            {

                title: "Êzîdî Keyboard"

            }

        );

        register(

            "languages",

            function (context) {

                emit(

                    "app:languages",

                    context

                );

                return openApp(

                    "languages",

                    context.params

                );

            },

            {

                title: "HalDo Languages"

            }

        );

        register(

            "storage",

            function (context) {

                emit(

                    "app:storage",

                    context

                );

                return openApp(

                    "storage",

                    context.params

                );

            },

            {

                title: "HalDo Storage"

            }

        );

    }

    // --------------------------------------------------------

    // HASH CHANGE

    // --------------------------------------------------------

    function handleHashChange() {

        const route =

            readHash();

        if (!route) {

            return;

        }

        if (

            route ===

            state.currentRoute

        ) {

            return;

        }

        navigate(

            route,

            {

                updateHash: false

            }

        );

    }

    // --------------------------------------------------------

    // POP STATE

    // --------------------------------------------------------

    function handlePopState() {

        const route =

            readHash();

        if (route) {

            navigate(

                route,

                {

                    updateHash: false

                }

            );

        }

    }

    // --------------------------------------------------------

    // INITIALIZE

    // --------------------------------------------------------

    async function initialize() {

        if (state.initialized) {

            return api;

        }

        registerDefaultRoutes();

        window.addEventListener(

            "hashchange",

            handleHashChange

        );

        window.addEventListener(

            "popstate",

            handlePopState

        );

        state.initialized =

            true;

        emit(

            "router:ready",

            {

                version:

                    CONFIG.version

            }

        );

        let initialRoute =

            readHash();

        if (

            !initialRoute ||

            !has(initialRoute)

        ) {

            initialRoute =

                CONFIG.defaultRoute;

        }

        await navigate(

            initialRoute,

            {

                replace: true

            }

        );

        log(

            "App Router bereit."

        );

        return api;

    }

    // --------------------------------------------------------

    // API

    // --------------------------------------------------------

    const api = {

        name:

            CONFIG.name,

        version:

            CONFIG.version,

        initialize,

        init:

            initialize,

        register,

        unregister,

        has,

        get,

        getRoutes,

        navigate,

        open:

            navigate,

        back,

        forward,

        current,

        reset,

        addGuard,

        on,

        off,

        emit,

        openApp,

        closeApp,

        findApp,

        normalizeRoute,

        parseRoute,

        getState:

            function () {

                return {

                    initialized:

                        state.initialized,

                    currentRoute:

                        state.currentRoute,

                    previousRoute:

                        state.previousRoute,

                    history:

                        state.history.slice(),

                    historyIndex:

                        state.historyIndex,

                    routeCount:

                        state.routes.size

                };

            }

    };

    // --------------------------------------------------------

    // GLOBAL CONNECTION

    // --------------------------------------------------------

    window.HalDoAppRouter =

        api;

    window.HalDoOS.appRouter =

        api;

    // --------------------------------------------------------

    // KERNEL MODULE REGISTRATION

    // --------------------------------------------------------

    function registerWithKernel() {

        const kernel =

            window.HalDoKernel;

        if (!kernel) {

            return false;

        }

        try {

            if (

                typeof kernel.registerModule ===

                    "function"

            ) {

                kernel.registerModule(

                    "app-router",

                    api

                );

            }

            if (

                typeof kernel.setModuleReady ===

                    "function"

            ) {

                kernel.setModuleReady(

                    "app-router",

                    true

                );

            }

            return true;

        } catch (err) {

            warn(

                "App Router konnte nicht beim Kernel registriert werden.",

                err

            );

            return false;

        }

    }

    // --------------------------------------------------------

    // DOM READY / KERNEL READY

    // --------------------------------------------------------

    function bootConnection() {

        registerWithKernel();

        if (

            document.readyState ===

            "loading"

        ) {

            document.addEventListener(

                "DOMContentLoaded",

                function () {

                    initialize();

                },

                {

                    once: true

                }

            );

        } else {

            initialize();

        }

    }

    // --------------------------------------------------------

    // KERNEL EVENT CONNECTION

    // --------------------------------------------------------

    function connectKernelEvents() {

        const kernel =

            window.HalDoKernel;

        if (

            !kernel ||

            typeof kernel.on !==

                "function"

        ) {

            return;

        }

        try {

            kernel.on(

                "kernel:ready",

                function () {

                    registerWithKernel();

                    if (

                        !state.initialized

                    ) {

                        initialize();

                    }

                }

            );

        } catch (err) {

            warn(

                "Kernel Event-Verbindung fehlgeschlagen.",

                err

            );

        }

    }

    connectKernelEvents();

    bootConnection();

})(window, document);