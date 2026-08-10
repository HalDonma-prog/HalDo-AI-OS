// ============================================================

// HalDo AI OS 18

// App Router

// Version 18.0.0

// Professional Ultimate Foundation

//

// Datei:

// js/app-router.js

//

// Aufgabe:

// Zentrale Navigation zwischen HalDo-Apps und Systembereichen.

//

// Verbindung zu:

// - kernel.js

// - system.js

// - app-manager.js

// - app-registry.js

// - launcher.js

// - app-launcher.js

//

// WICHTIG:

// Bestehende APIs werden nicht blind überschrieben.

// Der Router arbeitet möglichst kompatibel mit bereits

// vorhandenen HalDo-Modulen.

// ============================================================

(function (window, document) {

    "use strict";

    // --------------------------------------------------------

    // GLOBALER NAMESPACE

    // --------------------------------------------------------

    window.HalDoOS = window.HalDoOS || {};

    // --------------------------------------------------------

    // KONFIGURATION

    // --------------------------------------------------------

    const CONFIG = {

        name: "HalDo App Router",

        version: "18.0.0",

        moduleName: "app-router",

        defaultRoute: "home",

        fallbackRoute: "home",

        animationDuration: 180,

        debug: false

    };

    // --------------------------------------------------------

    // INTERNE DATEN

    // --------------------------------------------------------

    const state = {

        initialized: false,

        currentRoute: null,

        previousRoute: null,

        navigating: false,

        history: [],

        listeners: [],

        routes: new Map(),

        aliases: new Map(),

        options: {

            useBrowserHistory: true,

            updateHash: true,

            smoothNavigation: true

        }

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

    // EVENT-SYSTEM

    // --------------------------------------------------------

    function emit(eventName, data) {

        state.listeners.forEach(function (listener) {

            if (!listener) {

                return;

            }

            if (

                listener.event !== eventName &&

                listener.event !== "*"

            ) {

                return;

            }

            try {

                listener.callback(

                    data

                );

            } catch (err) {

                error(

                    "Listener-Fehler:",

                    err

                );

            }

        });

        // Verbindung zum HalDo Kernel

        try {

            if (

                window.HalDoKernel &&

                typeof window.HalDoKernel.emit ===

                "function"

            ) {

                window.HalDoKernel.emit(

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

        // Verbindung zum HalDoOS Event-System

        try {

            if (

                window.HalDoOS &&

                window.HalDoOS.events &&

                typeof window.HalDoOS.events.emit ===

                "function"

            ) {

                window.HalDoOS.events.emit(

                    "app-router:" + eventName,

                    data

                );

            }

        } catch (err) {

            warn(

                "HalDoOS Event konnte nicht gesendet werden.",

                err

            );

        }

    }

    function on(eventName, callback) {

        if (

            typeof callback !==

            "function"

        ) {

            return function () {};

        }

        const listener = {

            event: eventName || "*",

            callback: callback

        };

        state.listeners.push(

            listener

        );

        return function unsubscribe() {

            const index =

                state.listeners.indexOf(

                    listener

                );

            if (index !== -1) {

                state.listeners.splice(

                    index,

                    1

                );

            }

        };

    }

    // --------------------------------------------------------

    // ROUTE NORMALISIERUNG

    // --------------------------------------------------------

    function normalizeRoute(route) {

        if (

            route === null ||

            route === undefined

        ) {

            return CONFIG.defaultRoute;

        }

        if (

            typeof route ===

            "object"

        ) {

            if (route.route) {

                route = route.route;

            } else if (route.name) {

                route = route.name;

            } else if (route.id) {

                route = route.id;

            } else {

                return CONFIG.defaultRoute;

            }

        }

        route =

            String(route)

                .trim()

                .replace(/^#/, "")

                .replace(/^\/+/, "")

                .replace(/\/+$/, "");

        if (!route) {

            return CONFIG.defaultRoute;

        }

        return route.toLowerCase();

    }

    // --------------------------------------------------------

    // ROUTE REGISTRIEREN

    // --------------------------------------------------------

    function register(route, handler, options) {

        const normalized =

            normalizeRoute(route);

        if (!normalized) {

            return false;

        }

        options =

            options || {};

        const routeDefinition = {

            route: normalized,

            handler:

                typeof handler ===

                "function"

                    ? handler

                    : null,

            title:

                options.title ||

                normalized,

            appId:

                options.appId ||

                options.app ||

                normalized,

            metadata:

                options.metadata ||

                {},

            before:

                typeof options.before ===

                "function"

                    ? options.before

                    : null,

            after:

                typeof options.after ===

                "function"

                    ? options.after

                    : null

        };

        state.routes.set(

            normalized,

            routeDefinition

        );

        if (

            Array.isArray(

                options.aliases

            )

        ) {

            options.aliases.forEach(

                function (alias) {

                    const normalizedAlias =

                        normalizeRoute(alias);

                    if (normalizedAlias) {

                        state.aliases.set(

                            normalizedAlias,

                            normalized

                        );

                    }

                }

            );

        }

        emit(

            "route:registered",

            routeDefinition

        );

        return true;

    }

    // --------------------------------------------------------

    // ROUTE ENTFERNEN

    // --------------------------------------------------------

    function unregister(route) {

        const normalized =

            resolveRoute(route);

        const removed =

            state.routes.delete(

                normalized

            );

        if (removed) {

            state.aliases.forEach(

                function (target, alias) {

                    if (

                        target === normalized

                    ) {

                        state.aliases.delete(

                            alias

                        );

                    }

                }

            );

            emit(

                "route:unregistered",

                normalized

            );

        }

        return removed;

    }

    // --------------------------------------------------------

    // ROUTE AUFLÖSEN

    // --------------------------------------------------------

    function resolveRoute(route) {

        const normalized =

            normalizeRoute(route);

        if (

            state.routes.has(

                normalized

            )

        ) {

            return normalized;

        }

        if (

            state.aliases.has(

                normalized

            )

        ) {

            return state.aliases.get(

                normalized

            );

        }

        return normalized;

    }

    // --------------------------------------------------------

    // ROUTE EXISTIERT?

    // --------------------------------------------------------

    function hasRoute(route) {

        const resolved =

            resolveRoute(route);

        return state.routes.has(

            resolved

        );

    }

    // --------------------------------------------------------

    // AKTUELLE ROUTE

    // --------------------------------------------------------

    function getCurrentRoute() {

        return state.currentRoute;

    }

    function getPreviousRoute() {

        return state.previousRoute;

    }

    function getHistory() {

        return state.history.slice();

    }

    // --------------------------------------------------------

    // BROWSER HASH

    // --------------------------------------------------------

    function updateBrowserHash(route) {

        if (

            !state.options.updateHash

        ) {

            return;

        }

        try {

            const hash =

                "#" + route;

            if (

                window.location.hash !==

                hash

            ) {

                window.history.replaceState(

                    {

                        haldoRoute: route

                    },

                    "",

                    hash

                );

            }

        } catch (err) {

            warn(

                "Browser-Hash konnte nicht aktualisiert werden.",

                err

            );

        }

    }

    // --------------------------------------------------------

    // ROUTE AUS URL

    // --------------------------------------------------------

    function getRouteFromLocation() {

        try {

            const hash =

                window.location.hash;

            if (

                hash &&

                hash.length > 1

            ) {

                return normalizeRoute(

                    hash

                );

            }

        } catch (err) {

            warn(

                "URL konnte nicht gelesen werden.",

                err

            );

        }

        return CONFIG.defaultRoute;

    }

    // --------------------------------------------------------

    // BROWSER NAVIGATION

    // --------------------------------------------------------

    function handleBrowserNavigation() {

        const route =

            getRouteFromLocation();

        if (

            route &&

            route !== state.currentRoute

        ) {

            navigate(

                route,

                {

                    fromBrowser: true,

                    skipHistory: true

                }

            );

        }

    }

    // --------------------------------------------------------

    // APP-MANAGER VERBINDUNG

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

    // --------------------------------------------------------

    // APP-REGISTRY VERBINDUNG

    // --------------------------------------------------------

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

    // APP ÖFFNEN

    // --------------------------------------------------------

    async function launchApp(

        appId,

        context

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

                typeof manager.openApp ===

                "function"

            ) {

                await manager.openApp(

                    appId,

                    context

                );

                return true;

            }

            if (

                typeof manager.launchApp ===

                "function"

            ) {

                await manager.launchApp(

                    appId,

                    context

                );

                return true;

            }

            if (

                typeof manager.startApp ===

                "function"

            ) {

                await manager.startApp(

                    appId,

                    context

                );

                return true;

            }

            if (

                typeof manager.activateApp ===

                "function"

            ) {

                await manager.activateApp(

                    appId,

                    context

                );

                return true;

            }

        } catch (err) {

            error(

                "App konnte nicht gestartet werden:",

                appId,

                err

            );

            emit(

                "app:error",

                {

                    appId: appId,

                    error: err

                }

            );

        }

        return false;

    }

    // --------------------------------------------------------

    // APP REGISTRY PRÜFUNG

    // --------------------------------------------------------

    function findRegisteredApp(appId) {

        const registry =

            getAppRegistry();

        if (!registry) {

            return null;

        }

        try {

            if (

                typeof registry.getApp ===

                "function"

            ) {

                return registry.getApp(

                    appId

                );

            }

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

        } catch (err) {

            warn(

                "App Registry konnte nicht abgefragt werden.",

                err

            );

        }

        return null;

    }

    // --------------------------------------------------------

    // ROUTE NAVIGATION

    // --------------------------------------------------------

    async function navigate(

        route,

        options

    ) {

        options =

            options || {};

        if (state.navigating) {

            return false;

        }

        const requestedRoute =

            normalizeRoute(route);

        const resolvedRoute =

            resolveRoute(

                requestedRoute

            );

        let definition =

            state.routes.get(

                resolvedRoute

            );

        // ----------------------------------------------------

        // UNBEKANNTE ROUTE

        // ----------------------------------------------------

        if (!definition) {

            const app =

                findRegisteredApp(

                    resolvedRoute

                );

            if (app) {

                definition = {

                    route:

                        resolvedRoute,

                    handler: null,

                    title:

                        app.title ||

                        app.name ||

                        resolvedRoute,

                    appId:

                        app.id ||

                        resolvedRoute,

                    metadata: {

                        source:

                            "app-registry"

                    }

                };

            }

        }

        if (!definition) {

            warn(

                "Route nicht gefunden:",

                resolvedRoute

            );

            emit(

                "route:not-found",

                {

                    requested:

                        requestedRoute,

                    resolved:

                        resolvedRoute

                }

            );

            if (

                resolvedRoute !==

                CONFIG.fallbackRoute

            ) {

                return navigate(

                    CONFIG.fallbackRoute,

                    {

                        ...options,

                        fallback: true

                    }

                );

            }

            return false;

        }

        state.navigating = true;

        const from =

            state.currentRoute;

        const navigationContext = {

            route:

                resolvedRoute,

            from:

                from,

            to:

                resolvedRoute,

            options:

                options,

            timestamp:

                Date.now()

        };

        emit(

            "navigation:start",

            navigationContext

        );

        // ----------------------------------------------------

        // BEFORE HOOK

        // ----------------------------------------------------

        if (definition.before) {

            try {

                const allowed =

                    await definition.before(

                        navigationContext

                    );

                if (

                    allowed === false

                ) {

                    state.navigating =

                        false;

                    emit(

                        "navigation:cancelled",

                        navigationContext

                    );

                    return false;

                }

            } catch (err) {

                error(

                    "Route Before-Hook Fehler:",

                    err

                );

            }

        }

        // ----------------------------------------------------

        // APP MANAGER

        // ----------------------------------------------------

        if (

            definition.appId &&

            !options.skipAppLaunch

        ) {

            await launchApp(

                definition.appId,

                navigationContext

            );

        }

        // ----------------------------------------------------

        // ROUTE HANDLER

        // ----------------------------------------------------

        if (definition.handler) {

            try {

                await definition.handler(

                    navigationContext

                );

            } catch (err) {

                error(

                    "Route Handler Fehler:",

                    err

                );

                emit(

                    "route:error",

                    {

                        route:

                            resolvedRoute,

                        error:

                            err

                    }

                );

            }

        }

        // ----------------------------------------------------

        // STATUS

        // ----------------------------------------------------

        state.previousRoute =

            state.currentRoute;

        state.currentRoute =

            resolvedRoute;

        if (

            !options.skipHistory

        ) {

            state.history.push(

                resolvedRoute

            );

            if (

                state.history.length >

                100

            ) {

                state.history.shift();

            }

        }

        // ----------------------------------------------------

        // URL

        // ----------------------------------------------------

        if (

            !options.fromBrowser

        ) {

            updateBrowserHash(

                resolvedRoute

            );

        }

        // ----------------------------------------------------

        // AFTER HOOK

        // ----------------------------------------------------

        if (definition.after) {

            try {

                await definition.after(

                    navigationContext

                );

            } catch (err) {

                error(

                    "Route After-Hook Fehler:",

                    err

                );

            }

        }

        state.navigating = false;

        emit(

            "navigation:complete",

            {

                ...navigationContext,

                previous:

                    state.previousRoute,

                current:

                    state.currentRoute

            }

        );

        emit(

            "route:change",

            {

                from:

                    state.previousRoute,

                to:

                    state.currentRoute

            }

        );

        log(

            "Navigation:",

            state.previousRoute,

            "→",

            state.currentRoute

        );

        return true;

    }

    // --------------------------------------------------------

    // GO BACK

    // --------------------------------------------------------

    async function back() {

        if (

            state.history.length < 2

        ) {

            return navigate(

                CONFIG.defaultRoute

            );

        }

        // Aktuelle Route entfernen

        state.history.pop();

        const previous =

            state.history[

                state.history.length - 1

            ];

        return navigate(

            previous,

            {

                skipHistory: true

            }

        );

    }

    // --------------------------------------------------------

    // GO HOME

    // --------------------------------------------------------

    function home() {

        return navigate(

            CONFIG.defaultRoute

        );

    }

    // --------------------------------------------------------

    // ROUTEN REGISTRIEREN

    // --------------------------------------------------------

    function registerDefaultRoutes() {

        register(

            "home",

            function () {

                emit(

                    "home:open"

                );

                try {

                    window.scrollTo({

                        top: 0,

                        behavior:

                            state.options.smoothNavigation

                                ? "smooth"

                                : "auto"

                    });

                } catch (err) {}

            },

            {

                title:

                    "HalDo AI Home",

                appId:

                    null,

                aliases: [

                    "start",

                    "dashboard-home",

                    "main"

                ]

            }

        );

        register(

            "chat",

            null,

            {

                title:

                    "HalDo AI Chat",

                appId:

                    "chat",

                aliases: [

                    "ai",

                    "conversation",

                    "assistant"

                ]

            }

        );

        register(

            "apps",

            null,

            {

                title:

                    "HalDo Apps",

                appId:

                    "apps",

                aliases: [

                    "application",

                    "applications"

                ]

            }

        );

        register(

            "settings",

            null,

            {

                title:

                    "HalDo Einstellungen",

                appId:

                    "settings",

                aliases: [

                    "setup",

                    "config",

                    "configuration"

                ]

            }

        );

        register(

            "modules",

            null,

            {

                title:

                    "HalDo Module",

                appId:

                    "modules"

            }

        );

        register(

            "dashboard",

            null,

            {

                title:

                    "HalDo Dashboard",

                appId:

                    "dashboard"

            }

        );

        register(

            "diagnostics",

            null,

            {

                title:

                    "System Diagnose",

                appId:

                    "diagnostics",

                aliases: [

                    "diagnose",

                    "system-diagnostics"

                ]

            }

        );

        register(

            "storage",

            null,

            {

                title:

                    "HalDo Speicher",

                appId:

                    "storage"

            }

        );

        register(

            "voice",

            null,

            {

                title:

                    "HalDo Voice",

                appId:

                    "voice",

                aliases: [

                    "microphone",

                    "speech"

                ]

            }

        );

        register(

            "keyboard",

            null,

            {

                title:

                    "Êzîdî Keyboard",

                appId:

                    "ezidi-keyboard",

                aliases: [

                    "ezidi",

                    "ezidikeyboard"

                ]

            }

        );

        register(

            "languages",

            null,

            {

                title:

                    "HalDo Sprachen",

                appId:

                    "languages",

                aliases: [

                    "language",

                    "lang"

                ]

            }

        );

        register(

            "knowledge",

            null,

            {

                title:

                    "HalDo Wissen",

                appId:

                    "knowledge",

                aliases: [

                    "knowledge-base",

                    "learn"

                ]

            }

        );

        register(

            "code",

            null,

            {

                title:

                    "HalDo Code Builder",

                appId:

                    "code-builder",

                aliases: [

                    "builder",

                    "developer",

                    "development"

                ]

            }

        );

    }

    // --------------------------------------------------------

    // KERNEL MODUL REGISTRIEREN

    // --------------------------------------------------------

    function registerKernelModule() {

        const moduleAPI = {

            name:

                CONFIG.moduleName,

            version:

                CONFIG.version,

            status:

                "ready",

            init:

                initialize,

            start:

                initialize,

            stop:

                destroy,

            register:

                register,

            unregister:

                unregister,

            navigate:

                navigate,

            open:

                navigate,

            back:

                back,

            home:

                home,

            on:

                on,

            emit:

                emit,

            getCurrentRoute:

                getCurrentRoute,

            getPreviousRoute:

                getPreviousRoute,

            getHistory:

                getHistory,

            hasRoute:

                hasRoute,

            resolveRoute:

                resolveRoute,

            getRoutes:

                function () {

                    return Array.from(

                        state.routes.values()

                    );

                },

            getState:

                function () {

                    return {

                        initialized:

                            state.initialized,

                        currentRoute:

                            state.currentRoute,

                        previousRoute:

                            state.previousRoute,

                        navigating:

                            state.navigating,

                        history:

                            state.history.slice()

                    };

                }

        };

        window.HalDoOS.appRouter =

            moduleAPI;

        window.HalDoAppRouter =

            moduleAPI;

        // ----------------------------------------------------

        // KERNEL REGISTRIERUNG

        // ----------------------------------------------------

        try {

            if (

                window.HalDoKernel &&

                typeof window.HalDoKernel.registerModule ===

                "function"

            ) {

                window.HalDoKernel.registerModule(

                    CONFIG.moduleName,

                    moduleAPI

                );

            }

        } catch (err) {

            warn(

                "Router konnte nicht am Kernel registriert werden.",

                err

            );

        }

        return moduleAPI;

    }

    // --------------------------------------------------------

    // INITIALISIERUNG

    // --------------------------------------------------------

    function initialize() {

        if (

            state.initialized

        ) {

            return window.HalDoAppRouter;

        }

        log(

            "Initialisiere App Router..."

        );

        registerDefaultRoutes();

        registerKernelModule();

        if (

            state.options.useBrowserHistory

        ) {

            window.addEventListener(

                "hashchange",

                handleBrowserNavigation

            );

        }

        state.initialized =

            true;

        emit(

            "ready",

            {

                version:

                    CONFIG.version

            }

        );

        // ----------------------------------------------------

        // ERSTE ROUTE

        // ----------------------------------------------------

        const initialRoute =

            getRouteFromLocation();

        window.setTimeout(

            function () {

                navigate(

                    initialRoute,

                    {

                        initial: true

                    }

                );

            },

            0

        );

        log(

            "App Router bereit."

        );

        return window.HalDoAppRouter;

    }

    // --------------------------------------------------------

    // ZERSTÖREN

    // --------------------------------------------------------

    function destroy() {

        if (

            window.HalDoAppRouter

        ) {

            try {

                window.removeEventListener(

                    "hashchange",

                    handleBrowserNavigation

                );

            } catch (err) {}

        }

        state.initialized =

            false;

        state.currentRoute =

            null;

        state.previousRoute =

            null;

        state.history =

            [];

        state.routes.clear();

        state.aliases.clear();

        state.listeners =

            [];

        emit(

            "destroyed"

        );

    }

    // --------------------------------------------------------

    // ÖFFENTLICHE API

    // --------------------------------------------------------

    const routerAPI = {

        name:

            CONFIG.name,

        version:

            CONFIG.version,

        init:

            initialize,

        start:

            initialize,

        destroy:

            destroy,

        register:

            register,

        unregister:

            unregister,

        navigate:

            navigate,

        open:

            navigate,

        go:

            navigate,

        back:

            back,

        home:

            home,

        on:

            on,

        emit:

            emit,

        hasRoute:

            hasRoute,

        resolveRoute:

            resolveRoute,

        getCurrentRoute:

            getCurrentRoute,

        getPreviousRoute:

            getPreviousRoute,

        getHistory:

            getHistory,

        getRoutes:

            function () {

                return Array.from(

                    state.routes.values()

                );

            },

        getState:

            function () {

                return {

                    initialized:

                        state.initialized,

                    currentRoute:

                        state.currentRoute,

                    previousRoute:

                        state.previousRoute,

                    navigating:

                        state.navigating,

                    history:

                        state.history.slice()

                };

            }

    };

    // --------------------------------------------------------

    // GLOBAL APIs

    // --------------------------------------------------------

    window.HalDoAppRouter =

        routerAPI;

    window.HalDoOS.appRouter =

        routerAPI;

    // Kompatibilität mit älteren Aufrufen

    window.HalDoOS.router =

        routerAPI;

    // --------------------------------------------------------

    // DOM READY

    // --------------------------------------------------------

    function boot() {

        initialize();

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

})(window, document);