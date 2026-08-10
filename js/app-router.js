// ==========================================
// HalDo AI OS 18
// Professional Ultimate Foundation
// APP ROUTER
// Version 18.0.0
// ==========================================

(function (window, document) {
    "use strict";

    const VERSION = "18.0.0";
    const NAME = "HalDo App Router";

    const state = {
        initialized: false,
        currentApp: null,
        previousApp: null,
        history: [],
        routes: new Map(),
        aliases: new Map(),
        listeners: new Map()
    };

    // ==========================================
    // EVENT SYSTEM
    // ==========================================

    function on(event, callback) {
        if (typeof callback !== "function") {
            return function () {};
        }

        if (!state.listeners.has(event)) {
            state.listeners.set(event, new Set());
        }

        state.listeners.get(event).add(callback);

        return function () {
            off(event, callback);
        };
    }

    function off(event, callback) {
        const listeners = state.listeners.get(event);

        if (!listeners) {
            return;
        }

        listeners.delete(callback);

        if (listeners.size === 0) {
            state.listeners.delete(event);
        }
    }

    function emit(event, data) {
        const listeners = state.listeners.get(event);

        if (!listeners) {
            return;
        }

        listeners.forEach(function (callback) {
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

    // ==========================================
    // HELPERS
    // ==========================================

    function normalize(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

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

    function getLauncher() {
        return (
            window.HalDoAppLauncher ||
            window.HalDoLauncher ||
            (
                window.HalDoOS &&
                window.HalDoOS.launcher
            ) ||
            null
        );
    }

    function getWindowManager() {
        return (
            window.HalDoWindowManager ||
            (
                window.HalDoOS &&
                window.HalDoOS.windowManager
            ) ||
            null
        );
    }

    // ==========================================
    // ROUTE REGISTRATION
    // ==========================================

    function register(route, config) {
        const normalizedRoute = normalize(route);

        if (!normalizedRoute) {
            return false;
        }

        const definition =
            typeof config === "function"
                ? {
                    handler: config
                }
                : Object.assign(
                    {},
                    config || {}
                );

        definition.route = normalizedRoute;

        state.routes.set(
            normalizedRoute,
            definition
        );

        if (Array.isArray(definition.aliases)) {
            definition.aliases.forEach(function (alias) {
                const normalizedAlias = normalize(alias);

                if (normalizedAlias) {
                    state.aliases.set(
                        normalizedAlias,
                        normalizedRoute
                    );
                }
            });
        }

        emit(
            "route:registered",
            definition
        );

        return true;
    }

    function unregister(route) {
        const normalizedRoute = normalize(route);

        if (!state.routes.has(normalizedRoute)) {
            return false;
        }

        state.routes.delete(normalizedRoute);

        state.aliases.forEach(
            function (target, alias) {
                if (target === normalizedRoute) {
                    state.aliases.delete(alias);
                }
            }
        );

        emit(
            "route:unregistered",
            normalizedRoute
        );

        return true;
    }

    function resolve(route) {
        const normalizedRoute = normalize(route);

        if (state.routes.has(normalizedRoute)) {
            return state.routes.get(normalizedRoute);
        }

        const aliasTarget =
            state.aliases.get(normalizedRoute);

        if (aliasTarget) {
            return state.routes.get(aliasTarget);
        }

        return null;
    }

    function has(route) {
        return !!resolve(route);
    }

    // ==========================================
    // APP RESOLUTION
    // ==========================================

    function resolveApp(appId) {
        const normalizedId = normalize(appId);

        const manager = getAppManager();

        if (manager) {

            if (
                typeof manager.getApp ===
                "function"
            ) {
                try {
                    const app =
                        manager.getApp(normalizedId);

                    if (app) {
                        return app;
                    }
                } catch (error) {
                    console.warn(
                        "[HalDo App Router] App Manager getApp Fehler:",
                        error
                    );
                }
            }

            if (
                typeof manager.get ===
                "function"
            ) {
                try {
                    const app =
                        manager.get(normalizedId);

                    if (app) {
                        return app;
                    }
                } catch (error) {
                    console.warn(
                        "[HalDo App Router] App Manager get Fehler:",
                        error
                    );
                }
            }
        }

        const registry = getAppRegistry();

        if (registry) {

            if (
                typeof registry.getApp ===
                "function"
            ) {
                try {
                    const app =
                        registry.getApp(normalizedId);

                    if (app) {
                        return app;
                    }
                } catch (error) {
                    console.warn(
                        "[HalDo App Router] Registry getApp Fehler:",
                        error
                    );
                }
            }

            if (
                typeof registry.get ===
                "function"
            ) {
                try {
                    const app =
                        registry.get(normalizedId);

                    if (app) {
                        return app;
                    }
                } catch (error) {
                    console.warn(
                        "[HalDo App Router] Registry get Fehler:",
                        error
                    );
                }
            }
        }

        return null;
    }

    // ==========================================
    // APP OPENING
    // ==========================================

    async function open(appId, options) {

        const id = normalize(appId);
        const settings = Object.assign(
            {
                addHistory: true,
                focus: true,
                createWindow: true
            },
            options || {}
        );

        if (!id) {
            return {
                success: false,
                error: "APP_ID_MISSING"
            };
        }

        const route =
            resolve(id);

        if (route) {

            if (
                typeof route.handler ===
                "function"
            ) {
                try {

                    const result =
                        await route.handler(
                            settings
                        );

                    if (
                        result !== false
                    ) {
                        setCurrentApp(id);
                    }

                    return {
                        success: result !== false,
                        route: id,
                        result: result
                    };

                } catch (error) {

                    reportError(
                        "ROUTE_HANDLER_ERROR",
                        error
                    );

                    return {
                        success: false,
                        error: error
                    };
                }
            }
        }

        const app =
            resolveApp(id);

        if (!app) {

            emit(
                "app:not-found",
                {
                    id: id
                }
            );

            return {
                success: false,
                error: "APP_NOT_FOUND",
                appId: id
            };
        }

        const manager =
            getAppManager();

        let result = null;

        try {

            if (
                manager &&
                typeof manager.openApp ===
                "function"
            ) {

                result =
                    await manager.openApp(
                        id,
                        settings
                    );

            } else if (
                manager &&
                typeof manager.launch ===
                "function"
            ) {

                result =
                    await manager.launch(
                        id,
                        settings
                    );

            } else if (
                manager &&
                typeof manager.open ===
                "function"
            ) {

                result =
                    await manager.open(
                        id,
                        settings
                    );

            } else {

                const launcher =
                    getLauncher();

                if (
                    launcher &&
                    typeof launcher.launch ===
                    "function"
                ) {

                    result =
                        await launcher.launch(
                            id,
                            settings
                        );

                } else if (
                    typeof app.open ===
                    "function"
                ) {

                    result =
                        await app.open(
                            settings
                        );

                } else if (
                    typeof app.start ===
                    "function"
                ) {

                    result =
                        await app.start(
                            settings
                        );

                } else {

                    result = true;

                }
            }

        } catch (error) {

            reportError(
                "APP_OPEN_ERROR",
                error
            );

            return {
                success: false,
                error: error,
                appId: id
            };
        }

        if (settings.createWindow) {
            ensureWindow(
                id,
                app,
                settings
            );
        }

        if (settings.focus) {
            focusApp(id);
        }

        if (settings.addHistory) {

            if (
                state.currentApp &&
                state.currentApp !== id
            ) {
                state.history.push(
                    state.currentApp
                );

                if (
                    state.history.length >
                    50
                ) {
                    state.history.shift();
                }
            }
        }

        setCurrentApp(id);

        emit(
            "app:opened",
            {
                id: id,
                app: app,
                result: result
            }
        );

        return {
            success: true,
            appId: id,
            app: app,
            result: result
        };
    }

    // ==========================================
    // APP CLOSE
    // ==========================================

    async function close(appId, options) {

        const id =
            normalize(
                appId ||
                state.currentApp
            );

        if (!id) {
            return false;
        }

        const app =
            resolveApp(id);

        const manager =
            getAppManager();

        try {

            if (
                manager &&
                typeof manager.closeApp ===
                "function"
            ) {

                await manager.closeApp(
                    id,
                    options || {}
                );

            } else if (
                manager &&
                typeof manager.close ===
                "function"
            ) {

                await manager.close(
                    id,
                    options || {}
                );

            } else if (
                app &&
                typeof app.close ===
                "function"
            ) {

                await app.close(
                    options || {}
                );

            }

        } catch (error) {

            reportError(
                "APP_CLOSE_ERROR",
                error
            );

            return false;
        }

        closeWindow(id);

        emit(
            "app:closed",
            {
                id: id
            }
        );

        if (
            state.currentApp === id
        ) {

            state.previousApp =
                id;

            state.currentApp =
                null;
        }

        return true;
    }

    // ==========================================
    // FOCUS
    // ==========================================

    function focusApp(appId) {

        const id =
            normalize(appId);

        if (!id) {
            return false;
        }

        const manager =
            getAppManager();

        try {

            if (
                manager &&
                typeof manager.focusApp ===
                "function"
            ) {
                manager.focusApp(id);
            }

            const windowManager =
                getWindowManager();

            if (
                windowManager &&
                typeof windowManager.focusWindow ===
                "function"
            ) {
                windowManager.focusWindow(id);
            }

            if (
                windowManager &&
                typeof windowManager.focus ===
                "function"
            ) {
                windowManager.focus(id);
            }

        } catch (error) {

            reportError(
                "APP_FOCUS_ERROR",
                error
            );

            return false;
        }

        emit(
            "app:focused",
            {
                id: id
            }
        );

        return true;
    }

    // ==========================================
    // WINDOW CONNECTION
    // ==========================================

    function ensureWindow(
        appId,
        app,
        options
    ) {

        const manager =
            getWindowManager();

        if (!manager) {
            return;
        }

        try {

            if (
                typeof manager.createWindow ===
                "function"
            ) {

                manager.createWindow(
                    appId,
                    Object.assign(
                        {},
                        app || {},
                        options || {}
                    )
                );

            } else if (
                typeof manager.create ===
                "function"
            ) {

                manager.create(
                    appId,
                    Object.assign(
                        {},
                        app || {},
                        options || {}
                    )
                );
            }

        } catch (error) {

            console.warn(
                "[HalDo App Router] Fenster konnte nicht erstellt werden:",
                error
            );
        }
    }

    function closeWindow(appId) {

        const manager =
            getWindowManager();

        if (!manager) {
            return;
        }

        try {

            if (
                typeof manager.closeWindow ===
                "function"
            ) {
                manager.closeWindow(appId);
            } else if (
                typeof manager.close ===
                "function"
            ) {
                manager.close(appId);
            }

        } catch (error) {

            console.warn(
                "[HalDo App Router] Fenster konnte nicht geschlossen werden:",
                error
            );
        }
    }

    // ==========================================
    // CURRENT APP
    // ==========================================

    function setCurrentApp(appId) {

        const id =
            normalize(appId);

        if (
            state.currentApp &&
            state.currentApp !== id
        ) {
            state.previousApp =
                state.currentApp;
        }

        state.currentApp =
            id || null;

        emit(
            "app:changed",
            {
                current:
                    state.currentApp,
                previous:
                    state.previousApp
            }
        );
    }

    function getCurrentApp() {
        return state.currentApp;
    }

    function getPreviousApp() {
        return state.previousApp;
    }

    // ==========================================
    // BACK
    // ==========================================

    async function back() {

        if (
            state.history.length === 0
        ) {

            if (
                state.previousApp &&
                state.previousApp !==
                state.currentApp
            ) {

                return open(
                    state.previousApp,
                    {
                        addHistory: false
                    }
                );

            }

            return false;
        }

        const previous =
            state.history.pop();

        if (!previous) {
            return false;
        }

        return open(
            previous,
            {
                addHistory: false
            }
        );
    }

    function clearHistory() {
        state.history = [];

        emit(
            "history:cleared"
        );
    }

    function getHistory() {
        return [
            ...state.history
        ];
    }

    // ==========================================
    // ROUTER NAVIGATION
    // ==========================================

    async function navigate(route, options) {

        const normalized =
            normalize(route);

        const definition =
            resolve(normalized);

        if (!definition) {

            return open(
                normalized,
                options
            );
        }

        if (
            typeof definition.handler ===
            "function"
        ) {

            return open(
                normalized,
                options
            );
        }

        if (definition.app) {

            return open(
                definition.app,
                options
            );
        }

        return {
            success: false,
            error: "ROUTE_INVALID"
        };
    }

    // ==========================================
    // BUILT-IN ROUTES
    // ==========================================

    function registerDefaultRoutes() {

        register(
            "home",
            {
                aliases: [
                    "start",
                    "main",
                    "dashboard-home"
                ],

                handler: function () {

                    const mainApp =
                        document.getElementById(
                            "mainApp"
                        );

                    if (mainApp) {

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });
                    }

                    return true;
                }
            }
        );

        register(
            "chat",
            {
                aliases: [
                    "ai",
                    "assistant",
                    "haldo-ai"
                ],

                handler: function () {

                    if (
                        window.HalDoOS &&
                        typeof window.HalDoOS.openChat ===
                        "function"
                    ) {
                        return window.HalDoOS.openChat();
                    }

                    return openExistingAction(
                        "chat"
                    );
                }
            }
        );

        register(
            "settings",
            {
                aliases: [
                    "setup",
                    "config"
                ],

                handler: function () {
                    return openExistingAction(
                        "settings"
                    );
                }
            }
        );

        register(
            "apps",
            {
                aliases: [
                    "applications",
                    "application-center"
                ],

                handler: function () {
                    return openExistingAction(
                        "apps"
                    );
                }
            }
        );

        register(
            "modules",
            {
                aliases: [
                    "module-manager"
                ],

                handler: function () {
                    return openExistingAction(
                        "modules"
                    );
                }
            }
        );

        register(
            "dashboard",
            {
                aliases: [
                    "control-center",
                    "overview"
                ],

                handler: function () {
                    return openExistingAction(
                        "dashboard"
                    );
                }
            }
        );

        register(
            "diagnostics",
            {
                aliases: [
                    "diagnostic",
                    "system-diagnostics"
                ],

                handler: function () {
                    return openExistingAction(
                        "diagnostics"
                    );
                }
            }
        );

        register(
            "storage",
            {
                aliases: [
                    "files",
                    "data"
                ],

                handler: function () {
                    return openExistingAction(
                        "storage"
                    );
                }
            }
        );

        register(
            "voice",
            {
                aliases: [
                    "microphone",
                    "speech"
                ],

                handler: function () {
                    return openExistingAction(
                        "voice"
                    );
                }
            }
        );

        register(
            "knowledge",
            {
                aliases: [
                    "wissen",
                    "knowledge-base"
                ],

                handler: function () {
                    return openExistingAction(
                        "knowledge"
                    );
                }
            }
        );

        register(
            "code",
            {
                aliases: [
                    "code-builder",
                    "developer"
                ],

                handler: function () {
                    return openExistingAction(
                        "code"
                    );
                }
            }
        );

        register(
            "keyboard",
            {
                aliases: [
                    "ezidi-keyboard",
                    "ezîdî-keyboard"
                ],

                handler: function () {
                    return openExistingAction(
                        "keyboard"
                    );
                }
            }
        );

        register(
            "languages",
            {
                aliases: [
                    "language",
                    "language-system"
                ],

                handler: function () {
                    return openExistingAction(
                        "languages"
                    );
                }
            }
        );
    }

    function openExistingAction(action) {

        try {

            if (
                window.HalDoOS &&
                typeof window.HalDoOS.open ===
                "function"
            ) {

                return window.HalDoOS.open(
                    action
                );
            }

            const element =
                document.querySelector(
                    '[data-open="' +
                    action +
                    '"]'
                );

            if (element) {

                element.click();

                return true;
            }

        } catch (error) {

            reportError(
                "EXISTING_ACTION_ERROR",
                error
            );

        }

        return false;
    }

    // ==========================================
    // ERROR HANDLING
    // ==========================================

    function reportError(
        code,
        error
    ) {

        const payload = {
            code: code,
            error: error,
            timestamp:
                new Date().toISOString()
        };

        console.error(
            "[HalDo App Router]",
            code,
            error
        );

        emit(
            "router:error",
            payload
        );

        if (
            window.HalDoOS &&
            window.HalDoOS.events &&
            typeof window.HalDoOS.events.emit ===
            "function"
        ) {

            try {

                window.HalDoOS.events.emit(
                    "app-router:error",
                    payload
                );

            } catch (_) {}

        }
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    const router = {

        name: NAME,
        version: VERSION,

        init: function () {

            if (state.initialized) {
                return this;
            }

            registerDefaultRoutes();

            state.initialized = true;

            emit(
                "router:ready",
                this
            );

            return this;
        },

        start: function () {
            return this.init();
        },

        register: register,

        unregister: unregister,

        resolve: resolve,

        has: has,

        navigate: navigate,

        open: open,

        launch: open,

        close: close,

        focus: focusApp,

        back: back,

        clearHistory:
            clearHistory,

        getHistory:
            getHistory,

        getCurrentApp:
            getCurrentApp,

        getPreviousApp:
            getPreviousApp,

        on: on,

        off: off,

        emit: emit,

        getState: function () {

            return {
                initialized:
                    state.initialized,

                currentApp:
                    state.currentApp,

                previousApp:
                    state.previousApp,

                history:
                    [...state.history],

                routes:
                    Array.from(
                        state.routes.keys()
                    )
            };
        },

        getRoutes: function () {

            return Array.from(
                state.routes.keys()
            );
        }
    };

    // ==========================================
    // GLOBAL REGISTRATION
    // ==========================================

    window.HalDoAppRouter =
        router;

    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.appRouter =
        router;

    // ==========================================
    // KERNEL CONNECTION
    // ==========================================

    function connectKernel() {

        const kernel =
            window.HalDoKernel ||
            (
                window.HalDoOS &&
                window.HalDoOS.kernel
            );

        if (!kernel) {
            return;
        }

        try {

            if (
                typeof kernel.registerModule ===
                "function"
            ) {

                kernel.registerModule(
                    "app-router",
                    router
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

        } catch (error) {

            console.warn(
                "[HalDo App Router] Kernel-Verbindung fehlgeschlagen:",
                error
            );
        }
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    function initialize() {

        router.init();

        connectKernel();

        emit(
            "initialized",
            router
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();

    }

})(window, document);