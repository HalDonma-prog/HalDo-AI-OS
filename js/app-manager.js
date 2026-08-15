/* ============================================================
   HALDO AI OS 18/19/20
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
       js/app-manager.js

   ZENTRALER APPLICATION MANAGER

   Aufgaben:
   - Apps verwalten
   - Registry verbinden
   - Apps öffnen
   - Apps schließen
   - Apps aktivieren/deaktivieren
   - App-Zustände
   - mehrere Apps gleichzeitig
   - Window-Manager Verbindung
   - Router Verbindung
   - Kernel Verbindung
   - System Verbindung
   - App Settings
   - App Storage
   - Dependencies
   - Events
   - Diagnostics
   - Health Check
   - sichere Erweiterbarkeit

   WICHTIG:
   Diese Datei ersetzt den bisherigen vollständigen
   Inhalt von js/app-manager.js.

   ============================================================ */

"use strict";

(function (window, document) {

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

    const MODULE_ID =
        "app-manager";

    const NAME =
        "HalDo AI OS Application Manager";


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

        failed:
            false,

        apps:
            new Map(),

        instances:
            new Map(),

        activeAppId:
            null,

        settings:
            new Map(),

        appState:
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

            router:
                false,

            windowManager:
                false

        },

        statistics: {

            opens:
                0,

            closes:
                0,

            starts:
                0,

            stops:
                0,

            activations:
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
                "[HalDo App Manager]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo App Manager]",
                ...arguments
            );

        } catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo App Manager]",
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


    function normalizeId(
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
                        typeof value[key] ===
                        "function"
                            ? value[key]
                            : clone(
                                value[key]
                            );

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
            null
        );

    }


    function getRouter() {

        return (
            window.HalDoAppRouter ||
            HalDoOS.appRouter ||
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
        data = null
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
                            data
                        );

                    } catch (exception) {

                        reportError(
                            exception,
                            "Event " + event
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
                    "app-manager:" + event,
                    data
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
                    "app-manager:" + event,
                    data
                );

            } catch (_) {}

        }

    }


    /* ========================================================
       08 — ERROR HANDLING
       ======================================================== */

    function reportError(
        exception,
        context = "Application Manager"
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

            time:
                Date.now()

        };


        errorLog(
            "[HalDo App Manager]",
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
       09 — REGISTRY SYNCHRONIZATION
       ======================================================== */

    function syncRegistry() {

        const registry =
            getRegistry();


        if (!registry) {

            state.connections.registry =
                false;

            return false;

        }


        try {

            const apps =
                hasMethod(
                    registry,
                    "getAll"
                )
                    ? registry.getAll()
                    : [];


            state.apps.clear();


            apps.forEach(
                app => {

                    if (
                        app &&
                        app.id
                    ) {

                        state.apps.set(
                            normalizeId(
                                app.id
                            ),
                            app
                        );

                    }

                }
            );


            state.connections.registry =
                true;


            emit(
                "registry-synchronized",
                {
                    count:
                        state.apps.size
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Registry Synchronisation"
            );


            return false;

        }

    }


    /* ========================================================
       10 — APP ACCESS
       ======================================================== */

    function get(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return null;

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

            const registered =
                registry.get(
                    id
                );


            if (registered) {

                state.apps.set(
                    id,
                    registered
                );


                return registered;

            }

        }


        return (
            state.apps.get(
                id
            ) ||
            null
        );

    }


    function getApp(
        appId
    ) {

        return get(
            appId
        );

    }


    function getAll() {

        syncRegistry();

        return Array.from(
            state.apps.values()
        );

    }


    function getApps() {

        return getAll();

    }


    function has(
        appId
    ) {

        return !!get(
            appId
        );

    }


    /* ========================================================
       11 — APP REGISTRATION COMPATIBILITY
       ======================================================== */

    function register(
        definition
    ) {

        const registry =
            getRegistry();


        if (
            registry &&
            hasMethod(
                registry,
                "register"
            )
        ) {

            const app =
                registry.register(
                    definition
                );


            if (app) {

                state.apps.set(
                    normalizeId(
                        app.id
                    ),
                    app
                );


                emit(
                    "registered",
                    {
                        app:
                            app
                    }
                );

            }


            return app;

        }


        if (
            !definition ||
            !definition.id
        ) {

            return null;

        }


        const id =
            normalizeId(
                definition.id
            );


        state.apps.set(
            id,
            definition
        );


        return definition;

    }


    function registerApp(
        definition
    ) {

        return register(
            definition
        );

    }


    /* ========================================================
       12 — APP STATE
       ======================================================== */

    function createInitialState(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (
            !state.appState.has(
                id
            )
        ) {

            state.appState.set(
                id,
                {

                    appId:
                        id,

                    status:
                        "closed",

                    open:
                        false,

                    active:
                        false,

                    minimized:
                        false,

                    maximized:
                        false,

                    pip:
                        false,

                    createdAt:
                        Date.now(),

                    updatedAt:
                        Date.now()

                }
            );

        }


        return state.appState.get(
            id
        );

    }


    function getAppState(
        appId
    ) {

        return {
            ...createInitialState(
                appId
            )
        };

    }


    function updateAppState(
        appId,
        changes
    ) {

        const current =
            createInitialState(
                appId
            );


        Object.assign(
            current,
            changes || {},
            {
                updatedAt:
                    Date.now()
            }
        );


        emit(
            "state-changed",
            {
                appId:
                    current.appId,

                state:
                    {
                        ...current
                    }
            }
        );


        return current;

    }


    /* ========================================================
       13 — SETTINGS
       ======================================================== */

    function getSettings(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (
            !state.settings.has(
                id
            )
        ) {

            state.settings.set(
                id,
                {}
            );

        }


        return {
            ...state.settings.get(
                id
            )
        };

    }


    function setSettings(
        appId,
        changes
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return null;

        }


        const current =
            getSettings(
                id
            );


        const next = {

            ...current,

            ...(changes || {})

        };


        state.settings.set(
            id,
            next
        );


        saveAppSettings(
            id,
            next
        );


        emit(
            "settings-changed",
            {
                appId:
                    id,

                settings:
                    clone(
                        next
                    )
            }
        );


        return next;

    }


    function resetSettings(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        state.settings.set(
            id,
            {}
        );


        saveAppSettings(
            id,
            {}
        );


        emit(
            "settings-reset",
            {
                appId:
                    id
            }
        );


        return true;

    }


    function settingsKey(
        appId
    ) {

        return (
            "haldo.app.settings." +
            normalizeId(
                appId
            )
        );

    }


    function saveAppSettings(
        appId,
        settings
    ) {

        try {

            window.localStorage.setItem(
                settingsKey(
                    appId
                ),
                JSON.stringify(
                    settings || {}
                )
            );


            return true;

        } catch (_) {

            return false;

        }

    }


    function loadAppSettings(
        appId
    ) {

        try {

            const raw =
                window.localStorage.getItem(
                    settingsKey(
                        appId
                    )
                );


            if (!raw) {

                return getSettings(
                    appId
                );

            }


            const parsed =
                JSON.parse(
                    raw
                );


            if (
                parsed &&
                typeof parsed ===
                "object"
            ) {

                state.settings.set(
                    normalizeId(
                        appId
                    ),
                    parsed
                );


                return {
                    ...parsed
                };

            }

        } catch (exception) {

            reportError(
                exception,
                "App Settings laden"
            );

        }


        return {};

    }


    /* ========================================================
       14 — DEPENDENCY CHECK
       ======================================================== */

    function checkDependencies(
        app
    ) {

        if (!app) {

            return {

                valid:
                    false,

                missing:
                    []

            };

        }


        const dependencies =
            Array.isArray(
                app.dependencies
            )
                ? app.dependencies
                : [];


        const missing =
            dependencies.filter(
                dependency => {

                    const id =
                        normalizeId(
                            dependency
                        );


                    const dependencyApp =
                        get(
                            id
                        );


                    return !(
                        dependencyApp &&
                        dependencyApp.enabled !==
                        false
                    );

                }
            );


        return {

            valid:
                missing.length ===
                0,

            missing:
                missing

        };

    }


    /* ========================================================
       15 — ROUTER CONNECTION
       ======================================================== */

    function routeToApp(
        app,
        options = {}
    ) {

        const router =
            getRouter();


        if (
            !router ||
            !app
        ) {

            state.connections.router =
                false;

            return false;

        }


        state.connections.router =
            true;


        try {

            if (
                hasMethod(
                    router,
                    "navigate"
                ) &&
                app.route
            ) {

                router.navigate(
                    app.route,
                    {
                        appId:
                            app.id,

                        source:
                            "app-manager",

                        ...options
                    }
                );


                return true;

            }


            if (
                hasMethod(
                    router,
                    "open"
                )
            ) {

                router.open(
                    app.id,
                    options
                );


                return true;

            }

        } catch (exception) {

            reportError(
                exception,
                "App Router"
            );

        }


        return false;

    }


    /* ========================================================
       16 — WINDOW MANAGER
       ======================================================== */

    function createWindow(
        app,
        options = {}
    ) {

        const manager =
            getWindowManager();


        if (
            !manager
        ) {

            state.connections.windowManager =
                false;

            return null;

        }


        state.connections.windowManager =
            true;


        try {

            const config = {

                id:
                    "window-" +
                    app.id,

                appId:
                    app.id,

                title:
                    app.title ||
                    app.name,

                icon:
                    app.icon ||
                    "◈",

                singleton:
                    app.singleton !==
                    false,

                minimized:
                    options.minimized ===
                    true,

                maximized:
                    options.maximized ===
                    true,

                pip:
                    options.pip ===
                    true,

                ...options

            };


            if (
                hasMethod(
                    manager,
                    "open"
                )
            ) {

                return manager.open(
                    config
                );

            }


            if (
                hasMethod(
                    manager,
                    "createWindow"
                )
            ) {

                return manager.createWindow(
                    config
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "Window Manager"
            );

        }


        return null;

    }


    /* ========================================================
       17 — APP INIT
       ======================================================== */

    async function initializeApp(
        app
    ) {

        if (!app) {

            return false;

        }


        const existing =
            state.instances.get(
                app.id
            );


        if (
            existing &&
            existing.initialized
        ) {

            return true;

        }


        try {

            loadAppSettings(
                app.id
            );


            if (
                typeof app.init ===
                "function"
            ) {

                const result =
                    app.init(
                        {

                            app:
                                app,

                            manager:
                                api,

                            settings:
                                getSettings(
                                    app.id
                                ),

                            state:
                                getAppState(
                                    app.id
                                )

                        }
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }


            state.instances.set(
                app.id,
                {

                    initialized:
                        true,

                    started:
                        false,

                    createdAt:
                        Date.now()

                }
            );


            updateAppState(
                app.id,
                {
                    status:
                        "initialized"
                }
            );


            emit(
                "app-initialized",
                {
                    app:
                        app
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Initialisierung: " +
                app.id
            );


            updateAppState(
                app.id,
                {
                    status:
                        "error"
                }
            );


            return false;

        }

    }


    /* ========================================================
       18 — APP START
       ======================================================== */

    async function startApp(
        app,
        options = {}
    ) {

        if (!app) {

            return false;

        }


        const initialized =
            await initializeApp(
                app
            );


        if (!initialized) {

            return false;

        }


        const instance =
            state.instances.get(
                app.id
            );


        if (
            instance &&
            instance.started
        ) {

            return true;

        }


        try {

            if (
                typeof app.start ===
                "function"
            ) {

                const result =
                    app.start(
                        {

                            app:
                                app,

                            manager:
                                api,

                            options:
                                options

                        }
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }


            state.instances.set(
                app.id,
                {
                    ...(instance || {}),
                    initialized:
                        true,
                    started:
                        true,
                    startedAt:
                        Date.now()
                }
            );


            state.statistics.starts +=
                1;


            updateAppState(
                app.id,
                {
                    status:
                        "running"
                }
            );


            emit(
                "app-started",
                {
                    app:
                        app
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Start: " +
                app.id
            );


            updateAppState(
                app.id,
                {
                    status:
                        "error"
                }
            );


            return false;

        }

    }


    /* ========================================================
       19 — OPEN APP
       ======================================================== */

    async function open(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            reportError(
                new Error(
                    "App nicht gefunden: " +
                    appId
                ),
                "App öffnen"
            );


            return null;

        }


        if (
            app.enabled ===
            false
        ) {

            warn(
                "App ist deaktiviert:",
                app.id
            );


            return null;

        }


        const dependencyStatus =
            checkDependencies(
                app
            );


        if (
            !dependencyStatus.valid
        ) {

            reportError(
                new Error(
                    "Fehlende Dependencies: " +
                    dependencyStatus.missing.join(
                        ", "
                    )
                ),
                "App Dependencies"
            );


            return null;

        }


        const current =
            createInitialState(
                app.id
            );


        /*
         * Singleton:
         * bereits geöffnetes Fenster
         * wieder aktivieren.
         */

        if (
            app.singleton !==
            false &&
            current.open
        ) {

            await activate(
                app.id
            );


            return {
                app:
                    app,

                state:
                    getAppState(
                        app.id
                    ),

                existing:
                    true

            };

        }


        const started =
            await startApp(
                app,
                options
            );


        if (!started) {

            return null;

        }


        const window =
            createWindow(
                app,
                options
            );


        routeToApp(
            app,
            options
        );


        updateAppState(
            app.id,
            {

                status:
                    "open",

                open:
                    true,

                active:
                    true,

                minimized:
                    false,

                maximized:
                    options.maximized ===
                    true,

                pip:
                    options.pip ===
                    true,

                windowId:
                    window &&
                    (
                        window.id ||
                        window.windowId
                    ) ||
                    null

            }
        );


        state.activeAppId =
            app.id;


        state.statistics.opens +=
            1;

        state.statistics.activations +=
            1;


        emit(
            "app-opened",
            {
                app:
                    app,

                window:
                    window,

                options:
                    options
            }
        );


        emit(
            "app-activated",
            {
                app:
                    app
            }
        );


        return {

            app:
                app,

            window:
                window,

            state:
                getAppState(
                    app.id
                )

        };

    }


    function openApp(
        appId,
        options
    ) {

        return open(
            appId,
            options
        );

    }


    /* ========================================================
       20 — ACTIVATE
       ======================================================== */

    async function activate(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;

        }


        const appState =
            createInitialState(
                app.id
            );


        if (
            !appState.open
        ) {

            return !!(
                await open(
                    app.id
                )
            );

        }


        try {

            if (
                typeof app.onActivate ===
                "function"
            ) {

                await app.onActivate(
                    {
                        app:
                            app,

                        manager:
                            api
                    }
                );

            }


            const manager =
                getWindowManager();


            if (
                manager &&
                hasMethod(
                    manager,
                    "focus"
                ) &&
                appState.windowId
            ) {

                manager.focus(
                    appState.windowId
                );

            }


            state.activeAppId =
                app.id;


            state.statistics.activations +=
                1;


            updateAppState(
                app.id,
                {
                    active:
                        true,

                    minimized:
                        false
                }
            );


            /*
             * Alle anderen Apps werden nicht
             * geschlossen.
             *
             * Dadurch können mehrere Apps
             * gleichzeitig laufen.
             */

            getAllOpenApps()
                .forEach(
                    other => {

                        if (
                            other.appId !==
                            app.id
                        ) {

                            updateAppState(
                                other.appId,
                                {
                                    active:
                                        false
                                }
                            );

                        }

                    }
                );


            emit(
                "app-activated",
                {
                    app:
                        app
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Aktivierung: " +
                app.id
            );


            return false;

        }

    }


    function activateApp(
        appId
    ) {

        return activate(
            appId
        );

    }


    /* ========================================================
       21 — DEACTIVATE
       ======================================================== */

    async function deactivate(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;

        }


        try {

            if (
                typeof app.onDeactivate ===
                "function"
            ) {

                await app.onDeactivate(
                    {
                        app:
                            app,

                        manager:
                            api
                    }
                );

            }


            updateAppState(
                app.id,
                {
                    active:
                        false
                }
            );


            if (
                state.activeAppId ===
                app.id
            ) {

                state.activeAppId =
                    null;

            }


            emit(
                "app-deactivated",
                {
                    app:
                        app
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Deaktivierung: " +
                app.id
            );


            return false;

        }

    }


    /* ========================================================
       22 — MINIMIZE
       ======================================================== */

    async function minimize(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;

        }


        try {

            if (
                typeof app.minimize ===
                "function"
            ) {

                await app.minimize(
                    {
                        app:
                            app,

                        manager:
                            api
                    }
                );

            }


            const manager =
                getWindowManager();


            const appState =
                createInitialState(
                    app.id
                );


            if (
                manager &&
                hasMethod(
                    manager,
                    "minimize"
                ) &&
                appState.windowId
            ) {

                manager.minimize(
                    appState.windowId
                );

            }


            updateAppState(
                app.id,
                {
                    minimized:
                        true,

                    active:
                        false
                }
            );


            emit(
                "app-minimized",
                {
                    app:
                        app
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Minimieren"
            );


            return false;

        }

    }


    /* ========================================================
       23 — RESTORE
       ======================================================== */

    async function restore(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;

        }


        try {

            if (
                typeof app.restore ===
                "function"
            ) {

                await app.restore(
                    {
                        app:
                            app,

                        manager:
                            api
                    }
                );

            }


            const manager =
                getWindowManager();


            const appState =
                createInitialState(
                    app.id
                );


            if (
                manager &&
                hasMethod(
                    manager,
                    "restore"
                ) &&
                appState.windowId
            ) {

                manager.restore(
                    appState.windowId
                );

            }


            updateAppState(
                app.id,
                {
                    minimized:
                        false
                }
            );


            await activate(
                app.id
            );


            emit(
                "app-restored",
                {
                    app:
                        app
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Wiederherstellung"
            );


            return false;

        }

    }


    /* ========================================================
       24 — PICTURE IN PICTURE
       ======================================================== */

    async function enablePIP(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;

        }


        const manager =
            getWindowManager();


        const appState =
            createInitialState(
                app.id
            );


        try {

            if (
                manager &&
                hasMethod(
                    manager,
                    "setPIP"
                ) &&
                appState.windowId
            ) {

                manager.setPIP(
                    appState.windowId,
                    true
                );

            }


            updateAppState(
                app.id,
                {
                    pip:
                        true
                }
            );


            emit(
                "app-pip-enabled",
                {
                    app:
                        app
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "PIP aktivieren"
            );


            return false;

        }

    }


    async function disablePIP(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;

        }


        const manager =
            getWindowManager();


        const appState =
            createInitialState(
                app.id
            );


        try {

            if (
                manager &&
                hasMethod(
                    manager,
                    "setPIP"
                ) &&
                appState.windowId
            ) {

                manager.setPIP(
                    appState.windowId,
                    false
                );

            }


            updateAppState(
                app.id,
                {
                    pip:
                        false
                }
            );


            emit(
                "app-pip-disabled",
                {
                    app:
                        app
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "PIP deaktivieren"
            );


            return false;

        }

    }


    /* ========================================================
       25 — CLOSE
       ======================================================== */

    async function close(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;

        }


        const appState =
            createInitialState(
                app.id
            );


        if (
            !appState.open
        ) {

            return true;

        }


        try {

            if (
                typeof app.close ===
                "function"
            ) {

                const result =
                    app.close(
                        {
                            app:
                                app,

                            manager:
                                api,

                            options:
                                options
                        }
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }


            const manager =
                getWindowManager();


            if (
                manager &&
                hasMethod(
                    manager,
                    "close"
                ) &&
                appState.windowId
            ) {

                manager.close(
                    appState.windowId
                );

            }


            updateAppState(
                app.id,
                {

                    status:
                        "closed",

                    open:
                        false,

                    active:
                        false,

                    minimized:
                        false,

                    maximized:
                        false,

                    pip:
                        false,

                    windowId:
                        null

                }
            );


            if (
                state.activeAppId ===
                app.id
            ) {

                state.activeAppId =
                    null;

            }


            state.statistics.closes +=
                1;


            emit(
                "app-closed",
                {
                    app:
                        app,

                    options:
                        options
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App schließen: " +
                app.id
            );


            return false;

        }

    }


    function closeApp(
        appId,
        options
    ) {

        return close(
            appId,
            options
        );

    }


    /* ========================================================
       26 — STOP
       ======================================================== */

    async function stop(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;

        }


        try {

            if (
                typeof app.stop ===
                "function"
            ) {

                const result =
                    app.stop(
                        {
                            app:
                                app,

                            manager:
                                api
                        }
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }


            const instance =
                state.instances.get(
                    app.id
                );


            if (instance) {

                instance.started =
                    false;

            }


            state.statistics.stops +=
                1;


            updateAppState(
                app.id,
                {
                    status:
                        "stopped"
                }
            );


            emit(
                "app-stopped",
                {
                    app:
                        app
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Stop: " +
                app.id
            );


            return false;

        }

    }


    /* ========================================================
       27 — CLOSE ALL
       ======================================================== */

    async function closeAll(
        options = {}
    ) {

        const openApps =
            getAllOpenApps();


        for (
            const item of openApps
        ) {

            await close(
                item.appId,
                options
            );

        }


        emit(
            "all-apps-closed",
            {
                count:
                    openApps.length
            }
        );


        return openApps.length;

    }


    /* ========================================================
       28 — OPEN APPS
       ======================================================== */

    function getAllOpenApps() {

        return Array.from(
            state.appState.values()
        )
        .filter(
            item =>
                item.open ===
                true
        )
        .map(
            item => ({
                ...item,

                app:
                    get(
                        item.appId
                    )
            })
        );

    }


    function getActiveApp() {

        if (
            !state.activeAppId
        ) {

            return null;

        }


        return get(
            state.activeAppId
        );

    }


    function getActiveAppId() {

        return state.activeAppId;

    }


    /* ========================================================
       29 — ENABLE / DISABLE
       ======================================================== */

    function enableApp(
        appId
    ) {

        const registry =
            getRegistry();


        if (
            registry &&
            hasMethod(
                registry,
                "enable"
            )
        ) {

            const result =
                registry.enable(
                    appId
                );


            syncRegistry();


            emit(
                "app-enabled",
                {
                    app:
                        get(
                            appId
                        )
                }
            );


            return result;

        }


        return false;

    }


    async function disableApp(
        appId
    ) {

        await close(
            appId
        );


        const registry =
            getRegistry();


        if (
            registry &&
            hasMethod(
                registry,
                "disable"
            )
        ) {

            const result =
                registry.disable(
                    appId
                );


            syncRegistry();


            emit(
                "app-disabled",
                {
                    app:
                        get(
                            appId
                        )
                }
            );


            return result;

        }


        return false;

    }


    /* ========================================================
       30 — SEARCH
       ======================================================== */

    function search(
        query
    ) {

        const registry =
            getRegistry();


        if (
            registry &&
            hasMethod(
                registry,
                "search"
            )
        ) {

            return registry.search(
                query
            );

        }


        const value =
            String(
                query || ""
            )
            .trim()
            .toLowerCase();


        if (!value) {

            return [];

        }


        return getAll().filter(
            app => {

                const fields = [

                    app.id,

                    app.name,

                    app.title,

                    app.description,

                    app.category,

                    ...(app.tags || []),

                    ...(app.keywords || [])

                ];


                return fields.some(
                    field =>
                        String(
                            field || ""
                        )
                        .toLowerCase()
                        .includes(
                            value
                        )
                );

            }
        );

    }


    /* ========================================================
       31 — CATEGORY
       ======================================================== */

    function getByCategory(
        category
    ) {

        const registry =
            getRegistry();


        if (
            registry &&
            hasMethod(
                registry,
                "getByCategory"
            )
        ) {

            return registry.getByCategory(
                category
            );

        }


        const value =
            String(
                category || ""
            )
            .trim()
            .toLowerCase();


        return getAll().filter(
            app =>
                String(
                    app.category ||
                    ""
                )
                .toLowerCase() ===
                value
        );

    }


    /* ========================================================
       32 — APP COUNT
       ======================================================== */

    function getCount() {

        return getAll().length;

    }


    function getOpenCount() {

        return getAllOpenApps()
            .length;

    }


    /* ========================================================
       33 — MANAGER DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        syncRegistry();


        const apps =
            getAll();


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

            appCount:
                apps.length,

            openAppCount:
                getOpenCount(),

            activeApp:
                getActiveAppId(),

            connections: {

                kernel:
                    !!getKernel(),

                system:
                    !!getSystem(),

                registry:
                    !!getRegistry(),

                router:
                    !!getRouter(),

                windowManager:
                    !!getWindowManager(),

                launcher:
                    !!getLauncher()

            },

            statistics:
                {
                    ...state.statistics
                },

            apps:
                apps.map(
                    app => ({

                        id:
                            app.id,

                        name:
                            app.name,

                        title:
                            app.title,

                        category:
                            app.category,

                        enabled:
                            app.enabled !==
                            false,

                        state:
                            getAppState(
                                app.id
                            ),

                        dependencies:
                            checkDependencies(
                                app
                            )

                    })
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       34 — HEALTH CHECK
       ======================================================== */

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
            !getRegistry()
        ) {

            problems.push(
                "App Registry nicht verbunden."
            );

        }


        if (
            !getSystem()
        ) {

            problems.push(
                "System nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length ===
                0,

            problems:
                problems,

            appCount:
                getCount(),

            openAppCount:
                getOpenCount(),

            activeApp:
                getActiveAppId(),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       35 — CONNECTIONS
       ======================================================== */

    function refreshConnections() {

        state.connections.kernel =
            !!getKernel();


        state.connections.system =
            !!getSystem();


        state.connections.registry =
            !!getRegistry();


        state.connections.router =
            !!getRouter();


        state.connections.windowManager =
            !!getWindowManager();


        syncRegistry();


        return {
            ...state.connections
        };

    }


    function getConnectionStatus() {

        return {

            ...state.connections,

            kernel:
                !!getKernel(),

            system:
                !!getSystem(),

            registry:
                !!getRegistry(),

            router:
                !!getRouter(),

            windowManager:
                !!getWindowManager(),

            launcher:
                !!getLauncher()

        };

    }


    /* ========================================================
       36 — KERNEL REGISTRATION
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

        } catch (exception) {

            reportError(
                exception,
                "Kernel Verbindung"
            );


            return false;

        }

    }


    /* ========================================================
       37 — PUBLIC API
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

                    initializing:
                        state.initializing,

                    ready:
                        state.ready,

                    failed:
                        state.failed,

                    appCount:
                        getCount(),

                    openAppCount:
                        getOpenCount(),

                    activeApp:
                        getActiveAppId(),

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


        /* Registry */

        register:
            register,

        registerApp:
            registerApp,

        syncRegistry:
            syncRegistry,


        /* Apps */

        get:
            get,

        getApp:
            getApp,

        getAll:
            getAll,

        getApps:
            getApps,

        has:
            has,


        /* Lifecycle */

        initializeApp:
            initializeApp,

        startApp:
            startApp,

        open:
            open,

        openApp:
            openApp,

        activate:
            activate,

        activateApp:
            activateApp,

        deactivate:
            deactivate,

        minimize:
            minimize,

        restore:
            restore,

        close:
            close,

        closeApp:
            closeApp,

        closeAll:
            closeAll,

        stop:
            stop,


        /* Multi-App / PIP */

        getAllOpenApps:
            getAllOpenApps,

        getOpenApps:
            getAllOpenApps,

        getActiveApp:
            getActiveApp,

        getActiveAppId:
            getActiveAppId,

        enablePIP:
            enablePIP,

        disablePIP:
            disablePIP,


        /* App state */

        getAppState:
            getAppState,

        updateAppState:
            updateAppState,


        /* Settings */

        getSettings:
            getSettings,

        setSettings:
            setSettings,

        resetSettings:
            resetSettings,

        loadAppSettings:
            loadAppSettings,

        saveAppSettings:
            saveAppSettings,


        /* Dependencies */

        checkDependencies:
            checkDependencies,


        /* Status */

        enableApp:
            enableApp,

        disableApp:
            disableApp,


        /* Search */

        search:
            search,

        getByCategory:
            getByCategory,


        /* Statistics */

        getCount:
            getCount,

        getOpenCount:
            getOpenCount,

        getStatistics:
            function () {

                return {
                    ...state.statistics
                };

            },


        /* Connections */

        connectKernel:
            connectKernel,

        refreshConnections:
            refreshConnections,

        getConnectionStatus:
            getConnectionStatus,


        /* Diagnostics */

        diagnostics:
            diagnostics,

        healthCheck:
            healthCheck

    };


    /* ========================================================
       38 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppManager =
        api;


    window.HalDoOSAppManager =
        api;


    HalDoOS.appManager =
        api;


    /* ========================================================
       39 — KERNEL EVENTS
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


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Kernel Events"
            );


            return false;

        }

    }


    /* ========================================================
       40 — REGISTRY EVENTS
       ======================================================== */

    function connectRegistryEvents() {

        const registry =
            getRegistry();


        if (
            !registry ||
            !hasMethod(
                registry,
                "on"
            )
        ) {

            return false;

        }


        try {

            registry.on(
                "registered",
                function () {

                    syncRegistry();

                    emit(
                        "registry-app-registered"
                    );

                }
            );


            registry.on(
                "updated",
                function () {

                    syncRegistry();

                    emit(
                        "registry-app-updated"
                    );

                }
            );


            registry.on(
                "removed",
                function () {

                    syncRegistry();

                    emit(
                        "registry-app-removed"
                    );

                }
            );


            registry.on(
                "enabled",
                function () {

                    syncRegistry();

                }
            );


            registry.on(
                "disabled",
                function () {

                    syncRegistry();

                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Registry Events"
            );


            return false;

        }

    }


    /* ========================================================
       41 — INITIALIZATION
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


        refreshConnections();

        connectKernel();

        connectKernelEvents();

        connectRegistryEvents();


        /*
         * Bereits vorhandene Apps aus der
         * Registry übernehmen.
         */

        syncRegistry();


        state.ready =
            true;


        state.initializing =
            false;


        emit(
            "ready",
            {
                version:
                    VERSION,

                appCount:
                    getCount(),

                diagnostics:
                    diagnostics()

            }
        );


        log(
            "Application Manager bereit.",
            VERSION,
            "Apps:",
            getCount()
        );


        return api;

    }


    /* ========================================================
       42 — DOM START
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
                        "App Manager Initialisierung"
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
       43 — FINAL API
       ======================================================== */

    HalDoOS.appManager =
        api;


    window.HalDoAppManager =
        api;


    window.HalDoOSAppManager =
        api;


    /* ========================================================
       END
       HALDO AI OS APPLICATION MANAGER
       ======================================================== */

})(window, document);