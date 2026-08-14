// ==========================================
// HalDo AI OS 18
// Professional Ultimate Foundation
// APP ROUTER
// Version 18.0.0
// ==========================================

(function (window, document) {

    "use strict";


    /* =====================================================
       META
       ===================================================== */

    const VERSION =
        "18.0.0";

    const NAME =
        "HalDo App Router";


    /* =====================================================
       STATE
       ===================================================== */

    const state = {

        initialized:
            false,

        currentApp:
            null,

        previousApp:
            null,

        history:
            [],

        routes:
            new Map(),

        aliases:
            new Map(),

        listeners:
            new Map(),

        navigating:
            false

    };


    /* =====================================================
       EVENT SYSTEM
       ===================================================== */

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


        state.listeners
            .get(event)
            .add(callback);


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


        if (!listeners) {

            return;

        }


        listeners.forEach(
            function (callback) {

                try {

                    callback(
                        data
                    );

                } catch (error) {

                    console.error(
                        "[HalDo App Router] Event-Fehler:",
                        error
                    );

                }

            }
        );

    }


    /* =====================================================
       HELPERS
       ===================================================== */

    function normalize(
        value
    ) {

        return String(
            value || ""
        )
            .trim()
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );

    }


    function getHalDoOS() {

        return (
            window.HalDoOS ||
            null
        );

    }


    function getAppManager() {

        const os =
            getHalDoOS();

        return (
            window.HalDoAppManager ||
            (
                os &&
                os.appManager
            ) ||
            null
        );

    }


    function getAppRegistry() {

        const os =
            getHalDoOS();

        return (
            window.HalDoAppRegistry ||
            (
                os &&
                os.appRegistry
            ) ||
            null
        );

    }


    function getLauncher() {

        const os =
            getHalDoOS();

        return (
            window.HalDoAppLauncher ||
            window.HalDoLauncher ||
            (
                os &&
                (
                    os.appLauncher ||
                    os.launcher
                )
            ) ||
            null
        );

    }


    function getWindowManager() {

        const os =
            getHalDoOS();

        return (
            window.HalDoWindowManager ||
            (
                os &&
                os.windowManager
            ) ||
            null
        );

    }


    function getKernel() {

        const os =
            getHalDoOS();

        return (
            window.HalDoKernel ||
            (
                os &&
                os.kernel
            ) ||
            null
        );

    }


    function getSystem() {

        const os =
            getHalDoOS();

        return (
            window.HalDoSystem ||
            (
                os &&
                os.system
            ) ||
            null
        );

    }


    /* =====================================================
       ROUTE REGISTRATION
       ===================================================== */

    function register(
        route,
        config
    ) {

        const normalizedRoute =
            normalize(
                route
            );


        if (!normalizedRoute) {

            return false;

        }


        const definition =
            typeof config ===
            "function"

                ? {
                    handler:
                        config
                }

                : Object.assign(
                    {},
                    config || {}
                );


        definition.route =
            normalizedRoute;


        /*
         * Bereits vorhandene Aliase dieser
         * Route werden vor einer erneuten
         * Registrierung entfernt.
         */

        state.aliases.forEach(
            function (
                target,
                alias
            ) {

                if (
                    target ===
                    normalizedRoute
                ) {

                    state.aliases.delete(
                        alias
                    );

                }

            }
        );


        state.routes.set(
            normalizedRoute,
            definition
        );


        if (
            Array.isArray(
                definition.aliases
            )
        ) {

            definition.aliases.forEach(
                function (alias) {

                    const normalizedAlias =
                        normalize(
                            alias
                        );


                    if (
                        normalizedAlias &&
                        normalizedAlias !==
                            normalizedRoute
                    ) {

                        state.aliases.set(
                            normalizedAlias,
                            normalizedRoute
                        );

                    }

                }
            );

        }


        emit(
            "route:registered",
            definition
        );


        return true;

    }


    function unregister(
        route
    ) {

        const normalizedRoute =
            normalize(
                route
            );


        if (
            !state.routes.has(
                normalizedRoute
            )
        ) {

            return false;

        }


        state.routes.delete(
            normalizedRoute
        );


        state.aliases.forEach(
            function (
                target,
                alias
            ) {

                if (
                    target ===
                    normalizedRoute
                ) {

                    state.aliases.delete(
                        alias
                    );

                }

            }
        );


        emit(
            "route:unregistered",
            normalizedRoute
        );


        return true;

    }


    function resolve(
        route
    ) {

        const normalizedRoute =
            normalize(
                route
            );


        if (
            state.routes.has(
                normalizedRoute
            )
        ) {

            return state.routes.get(
                normalizedRoute
            );

        }


        const aliasTarget =
            state.aliases.get(
                normalizedRoute
            );


        if (aliasTarget) {

            return state.routes.get(
                aliasTarget
            );

        }


        return null;

    }


    function has(
        route
    ) {

        return !!resolve(
            route
        );

    }


    /* =====================================================
       APP RESOLUTION
       ===================================================== */

    function resolveApp(
        appId
    ) {

        const normalizedId =
            normalize(
                appId
            );


        if (!normalizedId) {

            return null;

        }


        const manager =
            getAppManager();


        if (manager) {

            if (
                typeof manager.getApp ===
                "function"
            ) {

                try {

                    const app =
                        manager.getApp(
                            normalizedId
                        );


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
                        manager.get(
                            normalizedId
                        );


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


        const registry =
            getAppRegistry();


        if (registry) {

            if (
                typeof registry.getApp ===
                "function"
            ) {

                try {

                    const app =
                        registry.getApp(
                            normalizedId
                        );


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
                        registry.get(
                            normalizedId
                        );


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


    /* =====================================================
       RESOLVE ROUTE TO APP
       ===================================================== */

    function resolveRouteApp(
        route,
        definition
    ) {

        if (
            definition &&
            definition.app
        ) {

            return normalize(
                definition.app
            );

        }


        if (
            route &&
            typeof route ===
            "string"
        ) {

            const normalized =
                normalize(
                    route
                );


            const app =
                resolveApp(
                    normalized
                );


            if (app) {

                return app.id ||
                    normalized;

            }

        }


        return null;

    }


    /* =====================================================
       HISTORY
       ===================================================== */

    function addHistory(
        appId
    ) {

        const id =
            normalize(
                appId
            );


        if (!id) {

            return;

        }


        if (
            state.currentApp &&
            state.currentApp !==
                id
        ) {

            state.history.push(
                state.currentApp
            );

        }


        if (
            state.history.length >
            50
        ) {

            state.history =
                state.history.slice(
                    -50
                );

        }

    }


    function clearHistory() {

        state.history =
            [];


        emit(
            "history:cleared"
        );

    }


    function getHistory() {

        return [
            ...state.history
        ];

    }


    /* =====================================================
       CURRENT APP
       ===================================================== */

    function setCurrentApp(
        appId
    ) {

        const id =
            normalize(
                appId
            );


        if (
            state.currentApp &&
            state.currentApp !==
                id
        ) {

            state.previousApp =
                state.currentApp;

        }


        state.currentApp =
            id ||
            null;


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


    /* =====================================================
       APP OPEN
       ===================================================== */

    async function open(
        appId,
        options
    ) {

        const id =
            normalize(
                appId
            );


        const settings =
            Object.assign(
                {
                    addHistory:
                        true,

                    focus:
                        true,

                    createWindow:
                        true

                },
                options || {}
            );


        if (!id) {

            return {

                success:
                    false,

                error:
                    "APP_ID_MISSING"

            };

        }


        /*
         * Route zuerst auflösen.
         */

        const definition =
            resolve(
                id
            );


        /*
         * Handler-Route.
         */

        if (
            definition &&
            typeof definition.handler ===
                "function"
        ) {

            try {

                const result =
                    await definition.handler(
                        settings
                    );


                if (
                    result !==
                    false
                ) {

                    if (
                        settings.addHistory
                    ) {

                        addHistory(
                            id
                        );

                    }


                    setCurrentApp(
                        id
                    );

                }


                return {

                    success:
                        result !==
                        false,

                    route:
                        id,

                    result:
                        result

                };

            } catch (error) {

                reportError(
                    "ROUTE_HANDLER_ERROR",
                    error
                );


                return {

                    success:
                        false,

                    error:
                        error,

                    route:
                        id

                };

            }

        }


        /*
         * Route kann direkt auf eine App
         * zeigen.
         */

        const resolvedAppId =
            resolveRouteApp(
                id,
                definition
            );


        const targetId =
            resolvedAppId ||
            id;


        const app =
            resolveApp(
                targetId
            );


        if (!app) {

            emit(
                "app:not-found",
                {
                    id:
                        targetId
                }
            );


            return {

                success:
                    false,

                error:
                    "APP_NOT_FOUND",

                appId:
                    targetId

            };

        }


        const manager =
            getAppManager();


        let result =
            null;


        try {

            /*
             * Wichtig:
             * Der neue App Manager besitzt
             * open() / openApp().
             */

            if (
                manager &&
                typeof manager.openApp ===
                    "function"
            ) {

                result =
                    await manager.openApp(
                        targetId,
                        settings
                    );

            } else if (
                manager &&
                typeof manager.open ===
                    "function"
            ) {

                result =
                    await manager.open(
                        targetId,
                        settings
                    );

            } else if (
                manager &&
                typeof manager.startApp ===
                    "function"
            ) {

                result =
                    await manager.startApp(
                        targetId,
                        settings
                    );

            } else {

                /*
                 * Fallback Launcher.
                 */

                const launcher =
                    getLauncher();


                if (
                    launcher &&
                    typeof launcher.launch ===
                        "function"
                ) {

                    result =
                        await launcher.launch(
                            targetId,
                            settings
                        );

                } else if (
                    launcher &&
                    typeof launcher.open ===
                        "function"
                ) {

                    result =
                        await launcher.open(
                            targetId,
                            settings
                        );

                } else {

                    /*
                     * Letzter App-Fallback.
                     */

                    if (
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

                        result =
                            true;

                    }

                }

            }

        } catch (error) {

            reportError(
                "APP_OPEN_ERROR",
                error
            );


            return {

                success:
                    false,

                error:
                    error,

                appId:
                    targetId

            };

        }


        /*
         * Der App Manager ist für die
         * eigentliche Fenster-Erstellung
         * verantwortlich.
         *
         * Nur wenn er nicht vorhanden ist,
         * übernimmt der Router den Fallback.
         */

        if (
            settings.createWindow &&
            !manager
        ) {

            ensureWindow(
                targetId,
                app,
                settings
            );

        }


        if (
            settings.focus
        ) {

            focusApp(
                targetId
            );

        }


        if (
            settings.addHistory
        ) {

            addHistory(
                targetId
            );

        }


        setCurrentApp(
            targetId
        );


        emit(
            "app:opened",
            {
                id:
                    targetId,

                app:
                    app,

                result:
                    result
            }
        );


        return {

            success:
                true,

            appId:
                targetId,

            app:
                app,

            result:
                result

        };

    }


    /* =====================================================
       LAUNCH
       ===================================================== */

    async function launch(
        appId,
        options
    ) {

        return open(
            appId,
            options
        );

    }


    /* =====================================================
       CLOSE APP
       ===================================================== */

    async function close(
        appId,
        options
    ) {

        const id =
            normalize(
                appId ||
                state.currentApp
            );


        if (!id) {

            return false;

        }


        const app =
            resolveApp(
                id
            );


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


        /*
         * Wenn der Manager bereits
         * geschlossen hat, soll der Router
         * lediglich den Zustand aktualisieren.
         */

        if (
            !manager
        ) {

            closeWindow(
                id
            );

        }


        emit(
            "app:closed",
            {
                id:
                    id,

                app:
                    app
            }
        );


        if (
            state.currentApp ===
            id
        ) {

            state.previousApp =
                id;

            state.currentApp =
                null;


            emit(
                "app:changed",
                {
                    current:
                        null,

                    previous:
                        id
                }
            );

        }


        return true;

    }


    /* =====================================================
       FOCUS APP
       ===================================================== */

    function focusApp(
        appId
    ) {

        const id =
            normalize(
                appId
            );


        if (!id) {

            return false;

        }


        const manager =
            getAppManager();


        try {

            /*
             * Neuer App Manager:
             * activate / activateApp.
             */

            if (
                manager &&
                typeof manager.activateApp ===
                    "function"
            ) {

                manager.activateApp(
                    id
                );

            } else if (
                manager &&
                typeof manager.activate ===
                    "function"
            ) {

                manager.activate(
                    id
                );

            }


            const windowManager =
                getWindowManager();


            if (
                windowManager &&
                typeof windowManager.focusWindow ===
                    "function"
            ) {

                const runtime =
                    getRunningRuntime(
                        id
                    );


                windowManager.focusWindow(
                    runtime &&
                    runtime.id
                        ? runtime.id
                        : id
                );


            } else if (
                windowManager &&
                typeof windowManager.focus ===
                    "function"
            ) {

                const runtime =
                    getRunningRuntime(
                        id
                    );


                windowManager.focus(
                    runtime &&
                    runtime.id
                        ? runtime.id
                        : id
                );


            } else if (
                windowManager &&
                typeof windowManager.activate ===
                    "function"
            ) {

                const runtime =
                    getRunningRuntime(
                        id
                    );


                windowManager.activate(
                    runtime &&
                    runtime.id
                        ? runtime.id
                        : id
                );

            }

        } catch (error) {

            reportError(
                "APP_FOCUS_ERROR",
                error
            );


            return false;

        }


        setCurrentApp(
            id
        );


        emit(
            "app:focused",
            {
                id:
                    id
            }
        );


        return true;

    }


    /* =====================================================
       RUNNING RUNTIME
       ===================================================== */

    function getRunningRuntime(
        id
    ) {

        const manager =
            getAppManager();


        if (!manager) {

            return null;

        }


        try {

            if (
                typeof manager.getRunningApps ===
                    "function"
            ) {

                const running =
                    manager.getRunningApps();


                if (
                    Array.isArray(
                        running
                    )
                ) {

                    return (
                        running.find(
                            function (item) {

                                const itemId =
                                    normalize(
                                        item &&
                                        (
                                            item.id ||
                                            (
                                                item.app &&
                                                item.app.id
                                            )
                                        )
                                    );


                                return (
                                    itemId ===
                                    normalize(
                                        id
                                    )
                                );

                            }
                        ) ||
                        null
                    );

                }

            }

        } catch (error) {

            console.warn(
                "[HalDo App Router] Runtime lookup failed:",
                error
            );

        }


        return null;

    }


    /* =====================================================
       WINDOW FALLBACK
       ===================================================== */

    function ensureWindow(
        appId,
        app,
        options
    ) {

        const manager =
            getWindowManager();


        if (!manager) {

            return false;

        }


        try {

            const config =
                Object.assign(
                    {},
                    app || {},
                    options || {}
                );


            if (
                typeof manager.createWindow ===
                    "function"
            ) {

                manager.createWindow(
                    appId,
                    config
                );

                return true;

            }


            if (
                typeof manager.create ===
                    "function"
            ) {

                manager.create(
                    appId,
                    config
                );

                return true;

            }


            if (
                typeof manager.open ===
                    "function"
            ) {

                manager.open(
                    app ||
                    {
                        id:
                            appId
                    }
                );

                return true;

            }

        } catch (error) {

            console.warn(
                "[HalDo App Router] Fenster konnte nicht erstellt werden:",
                error
            );

        }


        return false;

    }


    function closeWindow(
        appId
    ) {

        const manager =
            getWindowManager();


        if (!manager) {

            return false;

        }


        try {

            if (
                typeof manager.closeWindow ===
                    "function"
            ) {

                manager.closeWindow(
                    appId
                );

                return true;

            }


            if (
                typeof manager.close ===
                    "function"
            ) {

                manager.close(
                    appId
                );

                return true;

            }

        } catch (error) {

            console.warn(
                "[HalDo App Router] Fenster konnte nicht geschlossen werden:",
                error
            );

        }


        return false;

    }


    /* =====================================================
       NAVIGATE
       ===================================================== */

    async function navigate(
        route,
        options
    ) {

        const normalized =
            normalize(
                route
            );


        if (!normalized) {

            return {

                success:
                    false,

                error:
                    "ROUTE_MISSING"

            };

        }


        const definition =
            resolve(
                normalized
            );


        /*
         * Explizite Route.
         */

        if (definition) {

            return open(
                normalized,
                options
            );

        }


        /*
         * Direkte App-Navigation.
         */

        return open(
            normalized,
            options
        );

    }


    /* =====================================================
       BACK
       ===================================================== */

    async function back() {

        if (
            state.history.length >
            0
        ) {

            const previous =
                state.history.pop();


            if (!previous) {

                return false;

            }


            return open(
                previous,
                {
                    addHistory:
                        false,

                    focus:
                        true
                }
            );

        }


        if (
            state.previousApp &&
            state.previousApp !==
                state.currentApp
        ) {

            return open(
                state.previousApp,
                {
                    addHistory:
                        false
                }
            );

        }


        emit(
            "history:empty"
        );


        return false;

    }


    /* =====================================================
       DEFAULT ROUTES
       ===================================================== */

    function registerDefaultRoutes() {

        register(
            "home",
            {
                aliases: [
                    "start",
                    "main",
                    "dashboard-home"
                ],

                handler:
                    function () {

                        const mainApp =
                            document.getElementById(
                                "mainApp"
                            );


                        if (mainApp) {

                            try {

                                mainApp.scrollIntoView({
                                    behavior:
                                        "smooth",

                                    block:
                                        "start"
                                });

                            } catch (_) {

                                window.scrollTo(
                                    0,
                                    0
                                );

                            }

                        } else {

                            window.scrollTo(
                                0,
                                0
                            );

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

                handler:
                    function () {

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

                handler:
                    function () {

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

                handler:
                    function () {

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

                handler:
                    function () {

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

                handler:
                    function () {

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

                handler:
                    function () {

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

                handler:
                    function () {

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

                handler:
                    function () {

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

                handler:
                    function () {

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

                handler:
                    function () {

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

                handler:
                    function () {

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

                handler:
                    function () {

                        return openExistingAction(
                            "languages"
                        );

                    }

            }
        );

    }


    /* =====================================================
       EXISTING UI ACTION
       ===================================================== */

    function openExistingAction(
        action
    ) {

        const normalized =
            normalize(
                action
            );


        try {

            const os =
                getHalDoOS();


            /*
             * Nur verwenden, wenn es sich
             * nicht um den Router selbst handelt.
             */

            if (
                os &&
                typeof os.open ===
                    "function" &&
                os.open !==
                    router.open
            ) {

                const result =
                    os.open(
                        normalized
                    );


                if (
                    result !==
                    undefined
                ) {

                    return result;

                }

            }


            const selectors = [

                '[data-open="' +
                    normalized +
                '"]',

                '[data-route="' +
                    normalized +
                '"]',

                '[data-app="' +
                    normalized +
                '"]'

            ];


            for (
                const selector
                of selectors
            ) {

                const element =
                    document.querySelector(
                        selector
                    );


                if (element) {

                    element.click();

                    return true;

                }

            }

        } catch (error) {

            reportError(
                "EXISTING_ACTION_ERROR",
                error
            );

        }


        /*
         * Falls eine echte App mit
         * dieser ID existiert, öffnen.
         */

        const app =
            resolveApp(
                normalized
            );


        if (app) {

            return open(
                normalized
            );

        }


        return false;

    }


    /* =====================================================
       SYNCHRONIZATION
       ===================================================== */

    function syncWithAppManager() {

        const manager =
            getAppManager();


        if (
            !manager
        ) {

            return 0;

        }


        let count =
            0;


        try {

            const apps =
                typeof manager.getApps ===
                    "function"
                    ? manager.getApps()
                    : [];


            if (
                !Array.isArray(
                    apps
                )
            ) {

                return 0;

            }


            apps.forEach(
                function (app) {

                    if (!app) {

                        return;

                    }


                    const route =
                        app.route ||
                        app.id;


                    if (!route) {

                        return;

                    }


                    register(
                        route,
                        {

                            app:
                                app.id,

                            aliases: [

                                app.id,

                                app.name,

                                app.title

                            ].filter(
                                Boolean
                            )

                        }
                    );


                    count +=
                        1;

                }
            );

        } catch (error) {

            reportError(
                "APP_MANAGER_SYNC_ERROR",
                error
            );

        }


        emit(
            "sync:app-manager",
            {
                count:
                    count
            }
        );


        return count;

    }


    /* =====================================================
       DIAGNOSTICS
       ===================================================== */

    function diagnostics() {

        const manager =
            getAppManager();


        const registry =
            getAppRegistry();


        const launcher =
            getLauncher();


        const windowManager =
            getWindowManager();


        const kernel =
            getKernel();


        const system =
            getSystem();


        return {

            name:
                NAME,

            version:
                VERSION,

            initialized:
                state.initialized,

            currentApp:
                state.currentApp,

            previousApp:
                state.previousApp,

            historyLength:
                state.history.length,

            routeCount:
                state.routes.size,

            aliasCount:
                state.aliases.size,

            connections: {

                kernel:
                    !!kernel,

                system:
                    !!system,

                appManager:
                    !!manager,

                appRegistry:
                    !!registry,

                launcher:
                    !!launcher,

                windowManager:
                    !!windowManager

            },

            routes:
                Array.from(
                    state.routes.keys()
                ),

            aliases:
                Array.from(
                    state.aliases.keys()
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* =====================================================
       HEALTH CHECK
       ===================================================== */

    function healthCheck() {

        const problems =
            [];


        if (
            !getKernel()
        ) {

            problems.push(
                "Kernel nicht verbunden."
            );

        }


        if (
            !getAppManager()
        ) {

            problems.push(
                "App Manager nicht verbunden."
            );

        }


        if (
            !getAppRegistry()
        ) {

            problems.push(
                "App Registry nicht verbunden."
            );

        }


        if (
            !getWindowManager()
        ) {

            problems.push(
                "Window Manager nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length ===
                0,

            problems:
                problems,

            diagnostics:
                diagnostics(),

            timestamp:
                new Date().toISOString()

        };

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    const router = {

        name:
            NAME,

        version:
            VERSION,

        module:
            "app-router",


        /*
         * Initialization
         */

        init:
            function () {

                if (
                    state.initialized
                ) {

                    return this;

                }


                registerDefaultRoutes();

                state.initialized =
                    true;


                emit(
                    "router:ready",
                    this
                );


                return this;

            },


        start:
            function () {

                return this.init();

            },


        /*
         * Registration
         */

        register:
            register,

        unregister:
            unregister,

        resolve:
            resolve,

        has:
            has,


        /*
         * Navigation
         */

        navigate:
            navigate,

        open:
            open,

        launch:
            launch,

        close:
            close,

        focus:
            focusApp,

        back:
            back,


        /*
         * History
         */

        clearHistory:
            clearHistory,

        getHistory:
            getHistory,


        /*
         * Current app
         */

        setCurrentApp:
            setCurrentApp,

        getCurrentApp:
            getCurrentApp,

        getPreviousApp:
            getPreviousApp,


        /*
         * Synchronization
         */

        syncWithAppManager:
            syncWithAppManager,


        /*
         * Diagnostics
         */

        diagnostics:
            diagnostics,

        healthCheck:
            healthCheck,


        /*
         * Events
         */

        on:
            on,

        off:
            off,

        emit:
            emit,


        /*
         * State
         */

        getState:
            function () {

                return {

                    initialized:
                        state.initialized,

                    currentApp:
                        state.currentApp,

                    previousApp:
                        state.previousApp,

                    history:
                        [
                            ...state.history
                        ],

                    routes:
                        Array.from(
                            state.routes.keys()
                        ),

                    aliases:
                        Array.from(
                            state.aliases.entries()
                        )

                };

            },


        getRoutes:
            function () {

                return Array.from(
                    state.routes.keys()
                );

            }

    };


    /* =====================================================
       GLOBAL REGISTRATION
       ===================================================== */

    window.HalDoAppRouter =
        router;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appRouter =
        router;


    /*
     * Kompatibilität mit älteren
     * Router-Bezeichnungen.
     */

    window.HalDoRouter =
        window.HalDoRouter ||
        router;


    /* =====================================================
       KERNEL CONNECTION
       ===================================================== */

    function connectKernel() {

        const kernel =
            getKernel();


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


            emit(
                "kernel:connected",
                {
                    kernel:
                        kernel
                }
            );


            return true;

        } catch (error) {

            console.warn(
                "[HalDo App Router] Kernel-Verbindung fehlgeschlagen:",
                error
            );


            return false;

        }

    }


    /* =====================================================
       SYSTEM CONNECTION
       ===================================================== */

    function connectSystem() {

        const system =
            getSystem();


        if (!system) {

            return false;

        }


        try {

            if (
                typeof system.registerService ===
                    "function"
            ) {

                system.registerService(
                    "app-router",
                    router
                );

            } else if (
                typeof system.registerModule ===
                    "function"
            ) {

                system.registerModule(
                    "app-router",
                    router
                );

            }


            emit(
                "system:connected",
                {
                    system:
                        system
                }
            );


            return true;

        } catch (error) {

            console.warn(
                "[HalDo App Router] System-Verbindung fehlgeschlagen:",
                error
            );


            return false;

        }

    }


    /* =====================================================
       GLOBAL EVENT CONNECTION
       ===================================================== */

    function connectGlobalEvents() {

        const kernel =
            getKernel();


        if (
            kernel &&
            typeof kernel.on ===
                "function"
        ) {

            try {

                kernel.on(
                    "kernel:ready",
                    function () {

                        connectKernel();

                        connectSystem();

                        syncWithAppManager();

                    }
                );

            } catch (error) {

                console.warn(
                    "[HalDo App Router] Kernel Event-Verbindung fehlgeschlagen:",
                    error
                );

            }

        }


        /*
         * App Manager Ready Event.
         */

        const manager =
            getAppManager();


        if (
            manager &&
            typeof manager.on ===
                "function"
        ) {

            try {

                manager.on(
                    "ready",
                    function () {

                        syncWithAppManager();

                    }
                );


                manager.on(
                    "registered",
                    function () {

                        syncWithAppManager();

                    }
                );

            } catch (error) {

                console.warn(
                    "[HalDo App Router] App Manager Event-Verbindung fehlgeschlagen:",
                    error
                );

            }

        }

    }


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    function initialize() {

        if (
            state.initialized
        ) {

            return;

        }


        router.init();


        connectKernel();

        connectSystem();

        syncWithAppManager();

        connectGlobalEvents();


        emit(
            "initialized",
            {
                router:
                    router,

                diagnostics:
                    diagnostics()
            }
        );

    }


    /* =====================================================
       DOM READY
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once:
                    true
            }
        );

    } else {

        initialize();

    }


})(window, document);