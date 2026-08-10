// ============================================================
// HalDo AI OS 18
// js/app-router.js
// Professional Ultimate Foundation
// ============================================================

(function (window, document) {

    "use strict";

    // --------------------------------------------------------
    // GRUNDKONFIGURATION
    // --------------------------------------------------------

    const VERSION = "18.0.0";
    const MODULE_NAME = "app-router";

    const HalDoOS = window.HalDoOS =
        window.HalDoOS || {};

    // --------------------------------------------------------
    // INTERNER ZUSTAND
    // --------------------------------------------------------

    const routes = new Map();
    const history = [];

    let currentRoute = null;
    let initialized = false;

    const listeners = {
        beforeNavigate: [],
        navigate: [],
        afterNavigate: [],
        error: []
    };

    // --------------------------------------------------------
    // HILFSFUNKTIONEN
    // --------------------------------------------------------

    function log() {

        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.log === "function"
        ) {
            window.HalDoKernel.log(
                MODULE_NAME,
                ...arguments
            );
            return;
        }

        console.log(
            "[HalDoOS][" + MODULE_NAME + "]",
            ...arguments
        );
    }

    function warn() {

        console.warn(
            "[HalDoOS][" + MODULE_NAME + "]",
            ...arguments
        );

    }

    function error(err) {

        console.error(
            "[HalDoOS][" + MODULE_NAME + "]",
            err
        );

        emit(
            "error",
            err
        );

    }

    function emit(event, data) {

        const callbacks =
            listeners[event] || [];

        callbacks.forEach(function (callback) {

            try {
                callback(data);
            } catch (err) {
                console.error(
                    "[HalDoOS][app-router] Listener error:",
                    err
                );
            }

        });

        // Verbindung zum globalen HalDoOS-Event-System
        if (
            HalDoOS.events &&
            typeof HalDoOS.events.emit === "function"
        ) {

            try {

                HalDoOS.events.emit(
                    "app-router:" + event,
                    data
                );

            } catch (err) {

                console.warn(
                    "[HalDoOS][app-router] Global event error:",
                    err
                );

            }

        }

    }

    function on(event, callback) {

        if (
            !listeners[event] ||
            typeof callback !== "function"
        ) {
            return function () {};
        }

        listeners[event].push(
            callback
        );

        return function () {

            off(
                event,
                callback
            );

        };

    }

    function off(event, callback) {

        if (!listeners[event]) {
            return;
        }

        const index =
            listeners[event].indexOf(
                callback
            );

        if (index !== -1) {

            listeners[event].splice(
                index,
                1
            );

        }

    }

    // --------------------------------------------------------
    // ROUTE NORMALISIERUNG
    // --------------------------------------------------------

    function normalizeRoute(route) {

        if (route === null ||
            route === undefined) {

            return "/";

        }

        let value =
            String(route).trim();

        if (!value) {
            return "/";
        }

        // URL-Hash entfernen
        if (value.charAt(0) === "#") {
            value = value.substring(1);
        }

        // Query getrennt behandeln
        const queryIndex =
            value.indexOf("?");

        let path = value;
        let query = "";

        if (queryIndex !== -1) {

            path =
                value.substring(
                    0,
                    queryIndex
                );

            query =
                value.substring(
                    queryIndex + 1
                );

        }

        // Slash vereinheitlichen
        if (!path.startsWith("/")) {
            path = "/" + path;
        }

        // Doppelte Slashes entfernen
        path =
            path.replace(
                /\/{2,}/g,
                "/"
            );

        // Abschluss-Slash entfernen,
        // außer bei Root
        if (
            path.length > 1 &&
            path.endsWith("/")
        ) {
            path =
                path.substring(
                    0,
                    path.length - 1
                );
        }

        return {
            path: path,
            query: query,
            full:
                query
                    ? path + "?" + query
                    : path
        };

    }

    // --------------------------------------------------------
    // QUERY PARAMETER
    // --------------------------------------------------------

    function parseQuery(query) {

        const params = {};

        if (!query) {
            return params;
        }

        query
            .split("&")
            .forEach(function (part) {

                if (!part) {
                    return;
                }

                const pair =
                    part.split("=");

                const key =
                    decodeURIComponent(
                        pair[0] || ""
                    );

                const value =
                    decodeURIComponent(
                        pair
                            .slice(1)
                            .join("=") || ""
                    );

                if (key) {
                    params[key] = value;
                }

            });

        return params;

    }

    // --------------------------------------------------------
    // ROUTE REGISTRIEREN
    // --------------------------------------------------------

    function register(path, handler, options) {

        const normalized =
            normalizeRoute(path);

        const routePath =
            typeof normalized === "string"
                ? normalized
                : normalized.path;

        if (!routePath) {
            return false;
        }

        options =
            options || {};

        routes.set(
            routePath,
            {
                path: routePath,
                handler:
                    typeof handler === "function"
                        ? handler
                        : null,

                app:
                    options.app ||
                    options.appId ||
                    null,

                title:
                    options.title ||
                    null,

                metadata:
                    options.metadata ||
                    {},

                before:
                    typeof options.before === "function"
                        ? options.before
                        : null,

                after:
                    typeof options.after === "function"
                        ? options.after
                        : null
            }
        );

        log(
            "Route registriert:",
            routePath
        );

        return true;

    }

    // --------------------------------------------------------
    // ROUTE ENTFERNEN
    // --------------------------------------------------------

    function unregister(path) {

        const normalized =
            normalizeRoute(path);

        const routePath =
            typeof normalized === "string"
                ? normalized
                : normalized.path;

        return routes.delete(
            routePath
        );

    }

    // --------------------------------------------------------
    // ROUTE ABRUFEN
    // --------------------------------------------------------

    function getRoute(path) {

        const normalized =
            normalizeRoute(path);

        const routePath =
            typeof normalized === "string"
                ? normalized
                : normalized.path;

        return (
            routes.get(
                routePath
            ) || null
        );

    }

    // --------------------------------------------------------
    // ALLE ROUTES
    // --------------------------------------------------------

    function getRoutes() {

        return Array.from(
            routes.values()
        );

    }

    // --------------------------------------------------------
    // ROUTE EXISTIERT?
    // --------------------------------------------------------

    function hasRoute(path) {

        return !!getRoute(
            path
        );

    }

    // --------------------------------------------------------
    // APP MANAGER ERMITTELN
    // --------------------------------------------------------

    function getAppManager() {

        if (
            window.HalDoAppManager
        ) {
            return window.HalDoAppManager;
        }

        if (
            HalDoOS.appManager
        ) {
            return HalDoOS.appManager;
        }

        return null;

    }

    // --------------------------------------------------------
    // APP REGISTRY ERMITTELN
    // --------------------------------------------------------

    function getAppRegistry() {

        if (
            window.HalDoAppRegistry
        ) {
            return window.HalDoAppRegistry;
        }

        if (
            HalDoOS.appRegistry
        ) {
            return HalDoOS.appRegistry;
        }

        return null;

    }

    // --------------------------------------------------------
    // APP ÖFFNEN
    // --------------------------------------------------------

    async function openApp(appId, data) {

        const manager =
            getAppManager();

        if (
            manager &&
            typeof manager.openApp === "function"
        ) {

            return manager.openApp(
                appId,
                data
            );

        }

        if (
            manager &&
            typeof manager.launch === "function"
        ) {

            return manager.launch(
                appId,
                data
            );

        }

        if (
            window.HalDoLauncher &&
            typeof window.HalDoLauncher.open === "function"
        ) {

            return window.HalDoLauncher.open(
                appId,
                data
            );

        }

        warn(
            "Kein App Manager/Launcher für:",
            appId
        );

        return false;

    }

    // --------------------------------------------------------
    // APP SCHLIESSEN
    // --------------------------------------------------------

    async function closeApp(appId) {

        const manager =
            getAppManager();

        if (
            manager &&
            typeof manager.closeApp === "function"
        ) {

            return manager.closeApp(
                appId
            );

        }

        if (
            manager &&
            typeof manager.close === "function"
        ) {

            return manager.close(
                appId
            );

        }

        return false;

    }

    // --------------------------------------------------------
    // NAVIGATION
    // --------------------------------------------------------

    async function navigate(target, options) {

        options =
            options || {};

        const normalized =
            normalizeRoute(target);

        const path =
            typeof normalized === "string"
                ? normalized
                : normalized.path;

        const full =
            typeof normalized === "string"
                ? normalized
                : normalized.full;

        const query =
            typeof normalized === "string"
                ? ""
                : normalized.query;

        const params =
            parseQuery(
                query
            );

        const route =
            routes.get(
                path
            );

        const context = {

            path: path,
            full: full,
            query: query,
            params: params,

            from:
                currentRoute
                    ? currentRoute.path
                    : null,

            options: options,

            timestamp:
                Date.now()

        };

        emit(
            "beforeNavigate",
            context
        );

        // Route nicht registriert:
        // App-Registry prüfen.
        if (!route) {

            const registry =
                getAppRegistry();

            if (
                registry &&
                typeof registry.getApp === "function"
            ) {

                const app =
                    registry.getApp(
                        path
                    );

                if (app) {

                    context.app =
                        app;

                    const result =
                        await openApp(
                            app.id ||
                            path,
                            context
                        );

                    if (result !== false) {

                        updateHistory(
                            context,
                            options
                        );

                        currentRoute =
                            context;

                        emit(
                            "navigate",
                            context
                        );

                        emit(
                            "afterNavigate",
                            context
                        );

                        return result;

                    }

                }

            }

            // Direkt als App-ID versuchen
            if (
                options.openApp !== false
            ) {

                const result =
                    await openApp(
                        path.replace(
                            /^\//,
                            ""
                        ),
                        context
                    );

                if (result !== false) {

                    updateHistory(
                        context,
                        options
                    );

                    currentRoute =
                        context;

                    emit(
                        "navigate",
                        context
                    );

                    emit(
                        "afterNavigate",
                        context
                    );

                    return result;

                }

            }

            warn(
                "Route nicht gefunden:",
                path
            );

            return false;

        }

        // Route-Before-Hook
        if (route.before) {

            const allowed =
                await route.before(
                    context
                );

            if (allowed === false) {

                return false;

            }

        }

        // Handler ausführen
        let result = true;

        if (
            typeof route.handler ===
            "function"
        ) {

            result =
                await route.handler(
                    context
                );

        } else if (route.app) {

            result =
                await openApp(
                    route.app,
                    context
                );

        }

        if (result === false) {
            return false;
        }

        // History
        updateHistory(
            context,
            options
        );

        currentRoute =
            context;

        // Route-After-Hook
        if (route.after) {

            await route.after(
                context
            );

        }

        emit(
            "navigate",
            context
        );

        emit(
            "afterNavigate",
            context
        );

        return true;

    }

    // --------------------------------------------------------
    // HISTORY
    // --------------------------------------------------------

    function updateHistory(context, options) {

        if (
            options.replace === true &&
            history.length
        ) {

            history[
                history.length - 1
            ] = context;

            return;

        }

        if (
            options.skipHistory === true
        ) {
            return;
        }

        history.push(
            context
        );

        // History begrenzen
        if (
            history.length > 100
        ) {

            history.shift();

        }

    }

    // --------------------------------------------------------
    // ZURÜCK
    // --------------------------------------------------------

    async function back() {

        if (
            history.length < 2
        ) {

            return false;

        }

        // Aktuellen Eintrag entfernen
        history.pop();

        const previous =
            history[
                history.length - 1
            ];

        if (!previous) {
            return false;
        }

        return navigate(
            previous.full,
            {
                skipHistory: true,
                fromHistory: true
            }
        );

    }

    // --------------------------------------------------------
    // AKTUELLE ROUTE
    // --------------------------------------------------------

    function getCurrentRoute() {

        return currentRoute
            ? {
                ...currentRoute
            }
            : null;

    }

    // --------------------------------------------------------
    // ROUTE ZUM BROWSER-HASH
    // --------------------------------------------------------

    function handleHashChange() {

        const hash =
            window.location.hash;

        if (!hash) {
            return;
        }

        const route =
            hash.substring(1);

        navigate(
            route,
            {
                fromHash: true
            }
        );

    }

    // --------------------------------------------------------
    // STANDARD-ROUTES
    // --------------------------------------------------------

    function registerDefaultRoutes() {

        register(
            "/",
            function () {

                if (
                    typeof window.scrollTo ===
                    "function"
                ) {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }

                return true;

            },
            {
                title: "HalDo AI Home"
            }
        );

        register(
            "/home",
            function () {

                return navigate(
                    "/",
                    {
                        replace: true
                    }
                );

            },
            {
                title: "Home"
            }
        );

        register(
            "/ai",
            function (context) {

                return openApp(
                    "chat",
                    context
                );

            },
            {
                title: "HalDo AI"
            }
        );

        register(
            "/chat",
            function (context) {

                return openApp(
                    "chat",
                    context
                );

            },
            {
                title: "HalDo AI Chat",
                app: "chat"
            }
        );

        register(
            "/apps",
            function (context) {

                return openApp(
                    "apps",
                    context
                );

            },
            {
                title: "Apps",
                app: "apps"
            }
        );

        register(
            "/settings",
            function (context) {

                return openApp(
                    "settings",
                    context
                );

            },
            {
                title: "Einstellungen",
                app: "settings"
            }
        );

        register(
            "/dashboard",
            function (context) {

                return openApp(
                    "dashboard",
                    context
                );

            },
            {
                title: "Dashboard",
                app: "dashboard"
            }
        );

        register(
            "/modules",
            function (context) {

                return openApp(
                    "modules",
                    context
                );

            },
            {
                title: "Module",
                app: "modules"
            }
        );

        register(
            "/keyboard",
            function (context) {

                return openApp(
                    "keyboard",
                    context
                );

            },
            {
                title: "Êzîdî Keyboard",
                app: "keyboard"
            }
        );

    }

    // --------------------------------------------------------
    // KERNEL-REGISTRIERUNG
    // --------------------------------------------------------

    function registerWithKernel() {

        const kernel =
            window.HalDoKernel;

        if (!kernel) {
            return;
        }

        try {

            if (
                typeof kernel.registerModule ===
                "function"
            ) {

                kernel.registerModule(
                    MODULE_NAME,
                    api
                );

            }

        } catch (err) {

            warn(
                "Kernel-Registrierung fehlgeschlagen:",
                err
            );

        }

    }

    // --------------------------------------------------------
    // INITIALISIERUNG
    // --------------------------------------------------------

    function init() {

        if (initialized) {
            return api;
        }

        registerDefaultRoutes();

        window.addEventListener(
            "hashchange",
            handleHashChange
        );

        initialized = true;

        registerWithKernel();

        HalDoOS.appRouter =
            api;

        window.HalDoAppRouter =
            api;

        emit(
            "navigate",
            {
                type: "router-ready",
                version: VERSION
            }
        );

        log(
            "App Router bereit:",
            VERSION
        );

        return api;

    }

    // --------------------------------------------------------
    // ÖFFENTLICHE API
    // --------------------------------------------------------

    const api = {

        name:
            MODULE_NAME,

        version:
            VERSION,

        init:

            init,

        register:

            register,

        unregister:

            unregister,

        getRoute:

            getRoute,

        getRoutes:

            getRoutes,

        hasRoute:

            hasRoute,

        navigate:

            navigate,

        openApp:

            openApp,

        closeApp:

            closeApp,

        back:

            back,

        getCurrentRoute:

            getCurrentRoute,

        on:

            on,

        off:

            off,

        getHistory:

            function () {

                return history.map(
                    function (item) {
                        return {
                            ...item
                        };
                    }
                );

            },

        isReady:

            function () {
                return initialized;
            }

    };

    // --------------------------------------------------------
    // GLOBAL ZUGÄNGE
    // --------------------------------------------------------

    HalDoOS.appRouter =
        api;

    window.HalDoAppRouter =
        api;

    // --------------------------------------------------------
    // DOM READY
    // --------------------------------------------------------

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );

    } else {

        init();

    }

})(window, document);