// ============================================================
// HalDo AI OS 18
// APP ROUTER
// Version 18.0.0
// Professional Ultimate Foundation
//
// Datei:
// js/app-router.js
//
// Aufgabe:
// Zentrale Navigation zwischen HalDo-Apps, Modulen und Panels.
//
// Verbindung zu:
// - kernel.js
// - system.js
// - app-manager.js
// - app-registry.js
// - launcher.js
// - window-manager.js
//
// Diese Datei ersetzt keine vorhandenen Systeme.
// Sie stellt eine gemeinsame Routing-Schicht bereit.
// ============================================================

(function (window, document) {

    "use strict";

    // ========================================================
    // CONFIGURATION
    // ========================================================

    const VERSION = "18.0.0";
    const MODULE_NAME = "app-router";

    const ROUTES = {
        home: {
            id: "home",
            name: "HalDo Home",
            type: "system"
        },

        dashboard: {
            id: "dashboard",
            name: "Dashboard",
            type: "system"
        },

        chat: {
            id: "chat",
            name: "HalDo AI",
            type: "ai"
        },

        voice: {
            id: "voice",
            name: "Voice",
            type: "ai"
        },

        knowledge: {
            id: "knowledge",
            name: "Knowledge",
            type: "ai"
        },

        code: {
            id: "code",
            name: "Code Builder",
            type: "tool"
        },

        keyboard: {
            id: "keyboard",
            name: "Êzîdî Keyboard",
            type: "tool"
        },

        languages: {
            id: "languages",
            name: "Languages",
            type: "system"
        },

        apps: {
            id: "apps",
            name: "Apps",
            type: "system"
        },

        modules: {
            id: "modules",
            name: "Modules",
            type: "system"
        },

        storage: {
            id: "storage",
            name: "Storage",
            type: "system"
        },

        diagnostics: {
            id: "diagnostics",
            name: "Diagnostics",
            type: "system"
        },

        settings: {
            id: "settings",
            name: "Settings",
            type: "system"
        }
    };

    // ========================================================
    // INTERNAL STATE
    // ========================================================

    const state = {
        initialized: false,
        currentRoute: "home",
        previousRoute: null,
        history: [],
        maxHistory: 50,
        listeners: [],
        navigating: false
    };

    // ========================================================
    // HALDO GLOBAL
    // ========================================================

    window.HalDoOS = window.HalDoOS || {};

    // ========================================================
    // EVENT HELPERS
    // ========================================================

    function emit(eventName, data) {

        // ----------------------------------------------------
        // HalDoOS Event System
        // ----------------------------------------------------

        try {

            if (
                window.HalDoOS &&
                window.HalDoOS.events &&
                typeof window.HalDoOS.events.emit === "function"
            ) {

                window.HalDoOS.events.emit(
                    eventName,
                    data
                );

            }

        } catch (error) {

            console.warn(
                "[HalDo AppRouter] Event-Fehler:",
                error
            );

        }

        // ----------------------------------------------------
        // Local listeners
        // ----------------------------------------------------

        state.listeners.forEach(function (listener) {

            try {

                listener(
                    eventName,
                    data
                );

            } catch (error) {

                console.warn(
                    "[HalDo AppRouter] Listener-Fehler:",
                    error
                );

            }

        });

    }

    // ========================================================
    // NORMALIZE ROUTE
    // ========================================================

    function normalizeRoute(route) {

        if (
            route === null ||
            route === undefined
        ) {
            return null;
        }

        if (
            typeof route === "object" &&
            route.id
        ) {

            return String(
                route.id
            ).trim().toLowerCase();

        }

        return String(
            route
        )
            .trim()
            .toLowerCase();

    }

    // ========================================================
    // ROUTE EXISTS
    // ========================================================

    function hasRoute(route) {

        const id =
            normalizeRoute(route);

        if (!id) {
            return false;
        }

        return Boolean(
            ROUTES[id]
        );

    }

    // ========================================================
    // GET ROUTE
    // ========================================================

    function getRoute(route) {

        const id =
            normalizeRoute(route);

        if (!id) {
            return null;
        }

        if (!ROUTES[id]) {
            return null;
        }

        return {
            ...ROUTES[id]
        };

    }

    // ========================================================
    // GET ALL ROUTES
    // ========================================================

    function getRoutes() {

        return Object.keys(
            ROUTES
        ).map(function (id) {

            return {
                ...ROUTES[id]
            };

        });

    }

    // ========================================================
    // REGISTER ROUTE
    //
    // Damit spätere Apps hinzugefügt werden können.
    // ========================================================

    function registerRoute(route, options) {

        const id =
            normalizeRoute(route);

        if (!id) {

            console.warn(
                "[HalDo AppRouter] Route-ID fehlt."
            );

            return false;

        }

        const config =
            options || {};

        ROUTES[id] = {

            id: id,

            name:
                config.name ||
                id,

            type:
                config.type ||
                "app",

            ...config,

            id: id

        };

        emit(
            "app-router:route-registered",
            {
                route:
                    ROUTES[id]
            }
        );

        return true;

    }

    // ========================================================
    // UNREGISTER ROUTE
    // ========================================================

    function unregisterRoute(route) {

        const id =
            normalizeRoute(route);

        if (!id) {
            return false;
        }

        // Kernrouten werden geschützt.
        const protectedRoutes = [
            "home",
            "dashboard",
            "chat",
            "settings"
        ];

        if (
            protectedRoutes.includes(id)
        ) {

            console.warn(
                "[HalDo AppRouter] Kernroute geschützt:",
                id
            );

            return false;

        }

        if (!ROUTES[id]) {
            return false;
        }

        delete ROUTES[id];

        emit(
            "app-router:route-unregistered",
            {
                id: id
            }
        );

        return true;

    }

    // ========================================================
    // HISTORY
    // ========================================================

    function addHistory(route) {

        if (!route) {
            return;
        }

        state.history.push(
            route
        );

        if (
            state.history.length >
            state.maxHistory
        ) {

            state.history.shift();

        }

    }

    // ========================================================
    // GET HISTORY
    // ========================================================

    function getHistory() {

        return [
            ...state.history
        ];

    }

    // ========================================================
    // CLEAR HISTORY
    // ========================================================

    function clearHistory() {

        state.history = [];

        emit(
            "app-router:history-cleared"
        );

    }

    // ========================================================
    // CURRENT ROUTE
    // ========================================================

    function getCurrentRoute() {

        return getRoute(
            state.currentRoute
        );

    }

    // ========================================================
    // PREVIOUS ROUTE
    // ========================================================

    function getPreviousRoute() {

        if (
            !state.previousRoute
        ) {

            return null;

        }

        return getRoute(
            state.previousRoute
        );

    }

    // ========================================================
    // FIND APP MANAGER
    // ========================================================

    function getAppManager() {

        // ----------------------------------------------------
        // Bestehende globale API
        // ----------------------------------------------------

        if (
            window.HalDoAppManager
        ) {

            return window.HalDoAppManager;

        }

        // ----------------------------------------------------
        // HalDoOS namespace
        // ----------------------------------------------------

        if (
            window.HalDoOS &&
            window.HalDoOS.appManager
        ) {

            return window.HalDoOS.appManager;

        }

        // ----------------------------------------------------
        // Kernel module
        // ----------------------------------------------------

        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.getModule ===
                "function"
        ) {

            try {

                return window.HalDoKernel.getModule(
                    "app-manager"
                );

            } catch (error) {

                console.warn(
                    "[HalDo AppRouter] AppManager nicht erreichbar.",
                    error
                );

            }

        }

        return null;

    }

    // ========================================================
    // FIND APP REGISTRY
    // ========================================================

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

        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.getModule ===
                "function"
        ) {

            try {

                return window.HalDoKernel.getModule(
                    "app-registry"
                );

            } catch (error) {

                console.warn(
                    "[HalDo AppRouter] AppRegistry nicht erreichbar.",
                    error
                );

            }

        }

        return null;

    }

    // ========================================================
    // FIND LAUNCHER
    // ========================================================

    function getLauncher() {

        if (
            window.HalDoLauncher
        ) {

            return window.HalDoLauncher;

        }

        if (
            window.HalDoOS &&
            window.HalDoOS.launcher
        ) {

            return window.HalDoOS.launcher;

        }

        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.getModule ===
                "function"
        ) {

            try {

                return window.HalDoKernel.getModule(
                    "launcher"
                );

            } catch (error) {

                console.warn(
                    "[HalDo AppRouter] Launcher nicht erreichbar.",
                    error
                );

            }

        }

        return null;

    }

    // ========================================================
    // FIND WINDOW MANAGER
    // ========================================================

    function getWindowManager() {

        if (
            window.HalDoWindowManager
        ) {

            return window.HalDoWindowManager;

        }

        if (
            window.HalDoOS &&
            window.HalDoOS.windowManager
        ) {

            return window.HalDoOS.windowManager;

        }

        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.getModule ===
                "function"
        ) {

            try {

                return window.HalDoKernel.getModule(
                    "window-manager"
                );

            } catch (error) {

                console.warn(
                    "[HalDo AppRouter] WindowManager nicht erreichbar.",
                    error
                );

            }

        }

        return null;

    }

    // ========================================================
    // RESOLVE APP
    // ========================================================

    function resolveApp(route) {

        const id =
            normalizeRoute(route);

        if (!id) {
            return null;
        }

        const registry =
            getAppRegistry();

        // ----------------------------------------------------
        // Registry.get
        // ----------------------------------------------------

        if (
            registry &&
            typeof registry.get === "function"
        ) {

            try {

                const result =
                    registry.get(id);

                if (result) {
                    return result;
                }

            } catch (error) {

                console.warn(
                    "[HalDo AppRouter] Registry.get Fehler:",
                    error
                );

            }

        }

        // ----------------------------------------------------
        // Registry.getApp
        // ----------------------------------------------------

        if (
            registry &&
            typeof registry.getApp === "function"
        ) {

            try {

                const result =
                    registry.getApp(id);

                if (result) {
                    return result;
                }

            } catch (error) {

                console.warn(
                    "[HalDo AppRouter] Registry.getApp Fehler:",
                    error
                );

            }

        }

        return null;

    }

    // ========================================================
    // LAUNCH THROUGH APP MANAGER
    // ========================================================

    function launchThroughAppManager(
        route
    ) {

        const manager =
            getAppManager();

        if (!manager) {
            return false;
        }

        const methods = [
            "open",
            "launch",
            "start",
            "openApp",
            "launchApp"
        ];

        for (
            let index = 0;
            index < methods.length;
            index++
        ) {

            const method =
                methods[index];

            if (
                typeof manager[method] ===
                "function"
            ) {

                try {

                    const result =
                        manager[method](
                            route
                        );

                    return (
                        result !== false
                    );

                } catch (error) {

                    console.warn(
                        "[HalDo AppRouter] AppManager-Aufruf fehlgeschlagen:",
                        method,
                        error
                    );

                }

            }

        }

        return false;

    }

    // ========================================================
    // LAUNCH THROUGH LAUNCHER
    // ========================================================

    function launchThroughLauncher(
        route
    ) {

        const launcher =
            getLauncher();

        if (!launcher) {
            return false;
        }

        const methods = [
            "open",
            "launch",
            "start",
            "openApp",
            "launchApp"
        ];

        for (
            let index = 0;
            index < methods.length;
            index++
        ) {

            const method =
                methods[index];

            if (
                typeof launcher[method] ===
                "function"
            ) {

                try {

                    const result =
                        launcher[method](
                            route
                        );

                    return (
                        result !== false
                    );

                } catch (error) {

                    console.warn(
                        "[HalDo AppRouter] Launcher-Aufruf fehlgeschlagen:",
                        method,
                        error
                    );

                }

            }

        }

        return false;

    }

    // ========================================================
    // WINDOW MANAGER CONNECTION
    // ========================================================

    function notifyWindowManager(
        route
    ) {

        const manager =
            getWindowManager();

        if (!manager) {
            return false;
        }

        const methods = [
            "activate",
            "focus",
            "show",
            "open"
        ];

        for (
            let index = 0;
            index < methods.length;
            index++
        ) {

            const method =
                methods[index];

            if (
                typeof manager[method] ===
                "function"
            ) {

                try {

                    manager[method](
                        route
                    );

                    return true;

                } catch (error) {

                    console.warn(
                        "[HalDo AppRouter] WindowManager-Aufruf fehlgeschlagen:",
                        error
                    );

                }

            }

        }

        return false;

    }

    // ========================================================
    // DOM ROUTING FALLBACK
    //
    // Wichtig für die aktuelle index.html.
    // data-open="chat", data-open="apps" usw.
    // ========================================================

    function routeThroughDOM(
        route
    ) {

        const elements =
            Array.from(
                document.querySelectorAll(
                    '[data-open="' +
                    route +
                    '"]'
                )
            );

        // ----------------------------------------------------
        // Nur Buttons außerhalb des aktuellen Routing-Systems
        // direkt anklicken.
        // ----------------------------------------------------

        for (
            let index = 0;
            index < elements.length;
            index++
        ) {

            const element =
                elements[index];

            if (
                element &&
                !element.classList.contains(
                    "nav-button"
                )
            ) {

                // Verhindert Rekursionsprobleme:
                // data-open-Elemente lösen ihren Listener aus.
                // Deshalb wird dieser Fallback nur benutzt,
                // wenn kein App-System reagiert.
                try {

                    element.dispatchEvent(
                        new MouseEvent(
                            "click",
                            {
                                bubbles: true,
                                cancelable: true
                            }
                        )
                    );

                    return true;

                } catch (error) {

                    console.warn(
                        "[HalDo AppRouter] DOM-Routing fehlgeschlagen:",
                        error
                    );

                }

            }

        }

        return false;

    }

    // ========================================================
    // UPDATE URL
    //
    // Kein Seiten-Reload.
    // ========================================================

    function updateBrowserState(
        route,
        replace
    ) {

        try {

            if (
                !window.history ||
                typeof window.history.pushState !==
                    "function"
            ) {

                return;

            }

            const url =
                new URL(
                    window.location.href
                );

            url.hash =
                "app=" +
                encodeURIComponent(
                    route
                );

            if (replace) {

                window.history.replaceState(
                    {
                        haldoRoute: route
                    },
                    "",
                    url.toString()
                );

            } else {

                window.history.pushState(
                    {
                        haldoRoute: route
                    },
                    "",
                    url.toString()
                );

            }

        } catch (error) {

            console.warn(
                "[HalDo AppRouter] Browser-State konnte nicht aktualisiert werden:",
                error
            );

        }

    }

    // ========================================================
    // ROUTE
    // ========================================================

    function navigate(
        route,
        options
    ) {

        const config =
            options || {};

        const id =
            normalizeRoute(route);

        if (!id) {

            console.warn(
                "[HalDo AppRouter] Ungültige Route."
            );

            return false;

        }

        // ----------------------------------------------------
        // Verhindert doppelte Navigation
        // ----------------------------------------------------

        if (
            state.navigating
        ) {

            return false;

        }

        // ----------------------------------------------------
        // Unbekannte Route
        // ----------------------------------------------------

        if (
            !hasRoute(id)
        ) {

            // Falls eine App dynamisch registriert wurde,
            // prüfen wir die Registry.
            const app =
                resolveApp(id);

            if (!app) {

                console.warn(
                    "[HalDo AppRouter] Route nicht gefunden:",
                    id
                );

                emit(
                    "app-router:not-found",
                    {
                        route: id
                    }
                );

                return false;

            }

            registerRoute(
                id,
                {
                    name:
                        app.name ||
                        app.title ||
                        id,
                    type:
                        app.type ||
                        "app"
                }
            );

        }

        const target =
            getRoute(id);

        const previous =
            state.currentRoute;

        // ----------------------------------------------------
        // Gleiche Route
        // ----------------------------------------------------

        if (
            previous === id &&
            !config.force
        ) {

            notifyWindowManager(
                id
            );

            return true;

        }

        state.navigating = true;

        try {

            // ------------------------------------------------
            // History
            // ------------------------------------------------

            if (
                !config.skipHistory
            ) {

                if (
                    previous &&
                    previous !== id
                ) {

                    addHistory(
                        previous
                    );

                }

            }

            state.previousRoute =
                previous;

            state.currentRoute =
                id;

            // ------------------------------------------------
            // Browser History
            // ------------------------------------------------

            if (
                !config.skipBrowserHistory
            ) {

                updateBrowserState(
                    id,
                    Boolean(
                        config.replace
                    )
                );

            }

            // ------------------------------------------------
            // Event BEFORE
            // ------------------------------------------------

            emit(
                "app-router:before-navigate",
                {
                    from:
                        previous,
                    to:
                        id,
                    route:
                        target
                }
            );

            // ------------------------------------------------
            // App Manager
            // ------------------------------------------------

            let handled =
                launchThroughAppManager(
                    id
                );

            // ------------------------------------------------
            // Launcher
            // ------------------------------------------------

            if (!handled) {

                handled =
                    launchThroughLauncher(
                        id
                    );

            }

            // ------------------------------------------------
            // Window Manager
            // ------------------------------------------------

            notifyWindowManager(
                id
            );

            // ------------------------------------------------
            // DOM Fallback
            // ------------------------------------------------

            if (
                !handled &&
                config.domFallback !== false
            ) {

                // DOM-Fallback nur für die aktuelle Foundation.
                //
                // Für "home" wird direkt gescrollt.
                if (
                    id === "home"
                ) {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                    handled = true;

                }

            }

            // ------------------------------------------------
            // Route Event
            // ------------------------------------------------

            emit(
                "app-router:navigate",
                {
                    from:
                        previous,
                    to:
                        id,
                    route:
                        target,
                    handled:
                        handled
                }
            );

            // ------------------------------------------------
            // Generic navigation event
            // ------------------------------------------------

            emit(
                "navigation",
                id
            );

            return true;

        } catch (error) {

            console.error(
                "[HalDo AppRouter] Navigation Error:",
                error
            );

            emit(
                "app-router:error",
                {
                    route:
                        id,
                    error:
                        error
                }
            );

            return false;

        } finally {

            state.navigating = false;

        }

    }

    // ========================================================
    // BACK
    // ========================================================

    function back() {

        if (
            state.history.length > 0
        ) {

            const previous =
                state.history.pop();

            if (
                previous &&
                previous !== state.currentRoute
            ) {

                return navigate(
                    previous,
                    {
                        skipHistory: true
                    }
                );

            }

        }

        // Browser fallback
        try {

            if (
                window.history &&
                window.history.length > 1
            ) {

                window.history.back();

                return true;

            }

        } catch (error) {

            console.warn(
                "[HalDo AppRouter] Browser back failed:",
                error
            );

        }

        return false;

    }

    // ========================================================
    // FORWARD
    // ========================================================

    function forward() {

        try {

            if (
                window.history &&
                window.history.length > 1
            ) {

                window.history.forward();

                return true;

            }

        } catch (error) {

            console.warn(
                "[HalDo AppRouter] Browser forward failed:",
                error
            );

        }

        return false;

    }

    // ========================================================
    // URL ROUTE
    // ========================================================

    function getRouteFromURL() {

        try {

            const hash =
                window.location.hash;

            if (!hash) {
                return null;
            }

            const value =
                hash.replace(
                    /^#/,
                    ""
                );

            if (
                value.indexOf(
                    "app="
                ) !== 0
            ) {

                return null;

            }

            return decodeURIComponent(
                value.substring(4)
            );

        } catch (error) {

            return null;

        }

    }

    // ========================================================
    // BROWSER POPSTATE
    // ========================================================

    function handlePopState() {

        const route =
            getRouteFromURL();

        if (
            route &&
            hasRoute(route)
        ) {

            navigate(
                route,
                {
                    skipBrowserHistory: true,
                    skipHistory: true
                }
            );

            return;

        }

        // Ohne Route zurück nach Home.
        if (
            !route &&
            state.currentRoute !== "home"
        ) {

            navigate(
                "home",
                {
                    skipBrowserHistory: true,
                    skipHistory: true
                }
            );

        }

    }

    window.addEventListener(
        "popstate",
        handlePopState
    );

    // ========================================================
    // LISTENER REGISTRATION
    // ========================================================

    function addListener(
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return function () {};

        }

        state.listeners.push(
            callback
        );

        return function () {

            const index =
                state.listeners.indexOf(
                    callback
                );

            if (index >= 0) {

                state.listeners.splice(
                    index,
                    1
                );

            }

        };

    }

    // ========================================================
    // KERNEL REGISTRATION
    // ========================================================

    function registerWithKernel() {

        const kernel =
            window.HalDoKernel;

        if (!kernel) {
            return false;
        }

        // ----------------------------------------------------
        // Neue API
        // ----------------------------------------------------

        if (
            typeof kernel.registerModule ===
            "function"
        ) {

            try {

                kernel.registerModule(
                    MODULE_NAME,
                    api
                );

                return true;

            } catch (error) {

                console.warn(
                    "[HalDo AppRouter] Kernel registerModule fehlgeschlagen:",
                    error
                );

            }

        }

        return false;

    }

    // ========================================================
    // MODULE INITIALIZATION
    // ========================================================

    function init() {

        if (
            state.initialized
        ) {

            return true;

        }

        state.initialized = true;

        // ----------------------------------------------------
        // API registrieren
        // ----------------------------------------------------

        window.HalDoOS.appRouter =
            api;

        window.HalDoAppRouter =
            api;

        // ----------------------------------------------------
        // Kernel
        // ----------------------------------------------------

        registerWithKernel();

        // ----------------------------------------------------
        // Existing App Manager erkennen
        // ----------------------------------------------------

        const appManager =
            getAppManager();

        if (appManager) {

            emit(
                "app-router:app-manager-connected",
                appManager
            );

        }

        // ----------------------------------------------------
        // Existing Registry erkennen
        // ----------------------------------------------------

        const registry =
            getAppRegistry();

        if (registry) {

            emit(
                "app-router:registry-connected",
                registry
            );

        }

        // ----------------------------------------------------
        // Existing Launcher erkennen
        // ----------------------------------------------------

        const launcher =
            getLauncher();

        if (launcher) {

            emit(
                "app-router:launcher-connected",
                launcher
            );

        }

        emit(
            "app-router:ready",
            {
                version:
                    VERSION,
                routes:
                    getRoutes()
            }
        );

        return true;

    }

    // ========================================================
    // PUBLIC API
    // ========================================================

    const api = {

        name:
            MODULE_NAME,

        version:
            VERSION,

        init:

            init,

        start:

            init,

        navigate:

            navigate,

        open:

            navigate,

        route:

            navigate,

        back:

            back,

        forward:

            forward,

        hasRoute:

            hasRoute,

        getRoute:

            getRoute,

        getRoutes:

            getRoutes,

        registerRoute:

            registerRoute,

        unregisterRoute:

            unregisterRoute,

        getCurrentRoute:

            getCurrentRoute,

        getPreviousRoute:

            getPreviousRoute,

        getHistory:

            getHistory,

        clearHistory:

            clearHistory,

        on:

            addListener,

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
                        getHistory(),

                    routeCount:
                        Object.keys(
                            ROUTES
                        ).length
                };

            }

    };

    // ========================================================
    // GLOBAL CONNECTION
    // ========================================================

    window.HalDoOS.appRouter =
        api;

    window.HalDoAppRouter =
        api;

    // ========================================================
    // AUTO INITIALIZATION
    //
    // Der Router startet sich selbst nur,
    // wenn der DOM verfügbar ist.
    // ========================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                init();

            },
            {
                once: true
            }
        );

    } else {

        init();

    }

})(window, document);