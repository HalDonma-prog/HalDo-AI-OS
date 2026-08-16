/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
       js/app-manager.js

   ZENTRALER APPLICATION MANAGER 20.0

   VERBINDET:

   App Contract
   App Registry
   Kernel
   System
   Router
   Window Manager
   Launcher
   Storage
   AI
   Language
   Voice
   Notifications
   Keyboard
   Diagnostics

   Unterstützt:

   - vollständige App-Lifecycle
   - App Manifest
   - App Contract
   - App Context
   - App Registry
   - App Instances
   - Multi-App
   - Multi-Window
   - Singleton
   - PIP
   - Minimize / Restore
   - Activate / Deactivate
   - App Settings
   - App State
   - Storage
   - Dependencies
   - Permissions
   - Capabilities
   - Events
   - Search
   - Categories
   - Diagnostics
   - Health Check
   - Kernel-Verbindung
   - System-Verbindung
   - Router-Verbindung
   - Window-Manager-Verbindung
   - Launcher-Verbindung

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
        "app-manager";

    const NAME =
        "HalDo AI OS 20 Application Manager";


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


    function getContract() {

        return (
            window.HalDoAppContract ||
            HalDoOS.appContract ||
            null
        );

    }


    function getStorage() {

        return (
            window.HalDoStorage ||
            HalDoOS.storage ||
            null
        );

    }


    function getAI() {

        return (
            window.HalDoAI ||
            HalDoOS.ai ||
            window.HalDoAICore ||
            HalDoOS.aiCore ||
            null
        );

    }


    function getLanguage() {

        return (
            window.HalDoLanguageManager ||
            HalDoOS.languageManager ||
            window.HalDoLanguage ||
            HalDoOS.language ||
            null
        );

    }


    function getVoice() {

        return (
            window.HalDoVoice ||
            HalDoOS.voice ||
            null
        );

    }


    function getNotifications() {

        return (
            window.HalDoNotifications ||
            HalDoOS.notifications ||
            null
        );

    }


    function getKeyboard() {

        return (
            window.HalDoEzidiKeyboard ||
            window.HalDoKeyboard ||
            HalDoOS.keyboard ||
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
                        clone(
                            value[key]
                        );

                }
            );

            return result;

        }


        return value;

    }


    /* ========================================================
       05 — INTERNAL STATE
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

        appState:
            new Map(),

        settings:
            new Map(),

        contexts:
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
                false,

            launcher:
                false,

            contract:
                false,

            storage:
                false,

            ai:
                false,

            language:
                false,

            voice:
                false,

            notifications:
                false,

            keyboard:
                false

        },

        statistics: {

            registered:
                0,

            initialized:
                0,

            starts:
                0,

            opens:
                0,

            closes:
                0,

            stops:
                0,

            activations:
                0,

            errors:
                0,

            settingsChanges:
                0

        }

    };


    /* ========================================================
       06 — LOGGING
       ======================================================== */

    function log() {

        try {

            console.log(
                "[HalDo App Manager 20]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo App Manager 20]",
                ...arguments
            );

        } catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo App Manager 20]",
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
                            "Event: " +
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
                    "app-manager:" +
                    event,
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
                    "app-manager:" +
                    event,
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
        context =
            "Application Manager"
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
       09 — APP STATE
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

                    lifecycle:
                        "created",

                    status:
                        "closed",

                    initialized:
                        false,

                    started:
                        false,

                    open:
                        false,

                    active:
                        false,

                    visible:
                        false,

                    minimized:
                        false,

                    maximized:
                        false,

                    pip:
                        false,

                    suspended:
                        false,

                    loading:
                        false,

                    ready:
                        false,

                    error:
                        null,

                    errorCount:
                        0,

                    windowId:
                        null,

                    route:
                        null,

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

        return clone(
            createInitialState(
                appId
            )
        );

    }


    function updateAppState(
        appId,
        changes = {}
    ) {

        const current =
            createInitialState(
                appId
            );


        Object.assign(
            current,
            changes,
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
                    clone(
                        current
                    )

            }
        );


        const context =
            state.contexts.get(
                current.appId
            );


        if (
            context &&
            typeof context.updateState ===
            "function"
        ) {

            try {

                context.updateState(
                    changes
                );

            } catch (_) {}

        }


        return current;

    }


    /* ========================================================
       10 — REGISTRY
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

            let apps = [];


            if (
                hasMethod(
                    registry,
                    "getAll"
                )
            ) {

                apps =
                    registry.getAll() ||
                    [];

            }


            if (
                !Array.isArray(
                    apps
                )
            ) {

                apps = [];

            }


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
       11 — GET APP
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

            try {

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

            } catch (exception) {

                reportError(
                    exception,
                    "Registry App Lookup"
                );

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
       12 — CONTRACT NORMALIZATION
       ======================================================== */

    function normalizeDefinition(
        definition
    ) {

        const contract =
            getContract();


        if (
            contract &&
            hasMethod(
                contract,
                "createManifest"
            )
        ) {

            try {

                return {
                    ...definition,

                    ...contract.createManifest(
                        definition
                    )

                };

            } catch (exception) {

                reportError(
                    exception,
                    "App Contract Manifest"
                );

            }

        }


        return {
            ...definition,

            id:
                normalizeId(
                    definition &&
                    (
                        definition.id ||
                        definition.appId ||
                        definition.name
                    )
                )

        };

    }


    /* ========================================================
       13 — REGISTER
       ======================================================== */

    function register(
        definition
    ) {

        if (
            !definition ||
            !definition.id &&
            !definition.appId &&
            !definition.name
        ) {

            reportError(
                new Error(
                    "Ungültige App Definition."
                ),
                "App Registrierung"
            );


            return null;

        }


        const normalized =
            normalizeDefinition(
                definition
            );


        const id =
            normalizeId(
                normalized.id
            );


        if (!id) {

            return null;

        }


        const registry =
            getRegistry();


        let app =
            normalized;


        if (
            registry &&
            hasMethod(
                registry,
                "register"
            )
        ) {

            try {

                app =
                    registry.register(
                        normalized
                    ) ||
                    normalized;

            } catch (exception) {

                reportError(
                    exception,
                    "App Registry Register"
                );

                app =
                    normalized;

            }

        }


        state.apps.set(
            id,
            app
        );


        createInitialState(
            id
        );


        state.statistics.registered +=
            1;


        emit(
            "registered",
            {
                app:
                    app
            }
        );


        return app;

    }


    function registerApp(
        definition
    ) {

        return register(
            definition
        );

    }


    /* ========================================================
       14 — SETTINGS
       ======================================================== */

    function settingsKey(
        appId
    ) {

        return (
            "haldo.os20.app.settings." +
            normalizeId(
                appId
            )
        );

    }


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


        return clone(
            state.settings.get(
                id
            )
        );

    }


    function setSettings(
        appId,
        changes = {}
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

            ...changes

        };


        state.settings.set(
            id,
            next
        );


        saveAppSettings(
            id,
            next
        );


        state.statistics.settingsChanges +=
            1;


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


        const context =
            state.contexts.get(
                id
            );


        if (
            context &&
            typeof context.updateSettings ===
            "function"
        ) {

            try {

                context.updateSettings(
                    changes
                );

            } catch (_) {}

        }


        return clone(
            next
        );

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


    function saveAppSettings(
        appId,
        settings
    ) {

        const storage =
            getStorage();


        try {

            if (
                storage &&
                hasMethod(
                    storage,
                    "set"
                )
            ) {

                const result =
                    storage.set(
                        settingsKey(
                            appId
                        ),
                        settings
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    result.catch(
                        error =>
                            reportError(
                                error,
                                "App Storage"
                            )
                    );

                }

                return true;

            }


            window.localStorage.setItem(
                settingsKey(
                    appId
                ),
                JSON.stringify(
                    settings ||
                    {}
                )
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Settings speichern"
            );


            return false;

        }

    }


    function loadAppSettings(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const storage =
            getStorage();


        try {

            if (
                storage &&
                hasMethod(
                    storage,
                    "get"
                )
            ) {

                const result =
                    storage.get(
                        settingsKey(
                            id
                        )
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    return result.then(
                        value => {

                            if (
                                value &&
                                typeof value ===
                                "object"
                            ) {

                                state.settings.set(
                                    id,
                                    value
                                );

                            }

                            return clone(
                                value || {}
                            );

                        }
                    );

                }


                if (
                    result &&
                    typeof result ===
                    "object"
                ) {

                    state.settings.set(
                        id,
                        result
                    );


                    return clone(
                        result
                    );

                }

            }


            const raw =
                window.localStorage.getItem(
                    settingsKey(
                        id
                    )
                );


            if (!raw) {

                return getSettings(
                    id
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
                    id,
                    parsed
                );


                return clone(
                    parsed
                );

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
       15 — DEPENDENCIES
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

            missing

        };

    }


    /* ========================================================
       16 — APP CONTEXT
       ======================================================== */

    function createAppContext(
        app
    ) {

        const contract =
            getContract();


        if (
            !contract ||
            !hasMethod(
                contract,
                "createContext"
            )
        ) {

            return null;

        }


        try {

            return contract.createContext(
                app,
                {

                    kernel:
                        getKernel(),

                    system:
                        getSystem(),

                    registry:
                        getRegistry(),

                    router:
                        getRouter(),

                    windowManager:
                        getWindowManager(),

                    launcher:
                        getLauncher(),

                    appManager:
                        api,

                    storage:
                        getStorage(),

                    ai:
                        getAI(),

                    language:
                        getLanguage(),

                    voice:
                        getVoice(),

                    notifications:
                        getNotifications(),

                    keyboard:
                        getKeyboard()

                }
            );

        } catch (exception) {

            reportError(
                exception,
                "App Context: " +
                app.id
            );


            return null;

        }

    }


    /* ========================================================
       17 — INITIALIZE APP
       ======================================================== */

    async function initializeApp(
        app
    ) {

        if (!app) {

            return false;

        }


        const id =
            normalizeId(
                app.id
            );


        const existing =
            state.instances.get(
                id
            );


        if (
            existing &&
            existing.initialized
        ) {

            return true;

        }


        try {

            createInitialState(
                id
            );


            loadAppSettings(
                id
            );


            const context =
                createAppContext(
                    app
                );


            if (context) {

                state.contexts.set(
                    id,
                    context
                );

            }


            if (
                typeof app.init ===
                "function"
            ) {

                const result =
                    app.init(
                        {

                            app,

                            manager:
                                api,

                            context,

                            settings:
                                getSettings(
                                    id
                                ),

                            state:
                                getAppState(
                                    id
                                ),

                            services: {

                                kernel:
                                    getKernel(),

                                system:
                                    getSystem(),

                                registry:
                                    getRegistry(),

                                router:
                                    getRouter(),

                                windowManager:
                                    getWindowManager(),

                                launcher:
                                    getLauncher(),

                                storage:
                                    getStorage(),

                                ai:
                                    getAI(),

                                language:
                                    getLanguage(),

                                voice:
                                    getVoice(),

                                notifications:
                                    getNotifications(),

                                keyboard:
                                    getKeyboard()

                            }

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
                id,
                {

                    initialized:
                        true,

                    started:
                        false,

                    createdAt:
                        Date.now()

                }
            );


            state.statistics.initialized +=
                1;


            updateAppState(
                id,
                {

                    lifecycle:
                        "initialized",

                    status:
                        "initialized",

                    initialized:
                        true,

                    ready:
                        true

                }
            );


            emit(
                "app-initialized",
                {
                    app,
                    context:
                        state.contexts.get(
                            id
                        )
                }
            );


            return true;

        } catch (exception) {

            updateAppState(
                id,
                {

                    status:
                        "error",

                    lifecycle:
                        "error",

                    error:
                        exception.message,

                    errorCount:
                        (
                            getAppState(
                                id
                            ).errorCount ||
                            0
                        ) + 1

                }
            );


            reportError(
                exception,
                "App Initialisierung: " +
                id
            );


            return false;

        }

    }


    /* ========================================================
       18 — START APP
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


        const id =
            normalizeId(
                app.id
            );


        const instance =
            state.instances.get(
                id
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

                            app,

                            manager:
                                api,

                            context:
                                state.contexts.get(
                                    id
                                ),

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
                id,
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
                id,
                {

                    lifecycle:
                        "running",

                    status:
                        "running",

                    started:
                        true

                }
            );


            emit(
                "app-started",
                {
                    app
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Start: " +
                id
            );


            updateAppState(
                id,
                {
                    status:
                        "error",

                    lifecycle:
                        "error",

                    error:
                        exception.message
                }
            );


            return false;

        }

    }


    /* ========================================================
       19 — ROUTER
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

            return false;

        }


        try {

            if (
                app.route &&
                hasMethod(
                    router,
                    "navigate"
                )
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
       20 — WINDOW
       ======================================================== */

    function createWindow(
        app,
        options = {}
    ) {

        const manager =
            getWindowManager();


        if (
            !manager ||
            !app
        ) {

            return null;

        }


        try {

            const config = {

                id:
                    options.windowId ||
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
       21 — OPEN APP
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
                "App deaktiviert:",
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


        if (
            app.singleton !==
            false &&
            current.open
        ) {

            await activate(
                app.id
            );


            return {

                app,

                state:
                    getAppState(
                        app.id
                    ),

                existing:
                    true

            };

        }


        updateAppState(
            app.id,
            {

                loading:
                    true,

                lifecycle:
                    "opening"

            }
        );


        const started =
            await startApp(
                app,
                options
            );


        if (!started) {

            return null;

        }


        try {

            if (
                typeof app.open ===
                "function"
            ) {

                const result =
                    app.open(
                        {

                            app,

                            manager:
                                api,

                            context:
                                state.contexts.get(
                                    app.id
                                ),

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


            const window =
                createWindow(
                    app,
                    options
                );


            routeToApp(
                app,
                options
            );


            const windowId =
                window &&
                (
                    window.id ||
                    window.windowId
                ) ||
                null;


            updateAppState(
                app.id,
                {

                    lifecycle:
                        "open",

                    status:
                        "open",

                    loading:
                        false,

                    initialized:
                        true,

                    started:
                        true,

                    ready:
                        true,

                    open:
                        true,

                    active:
                        true,

                    visible:
                        true,

                    minimized:
                        false,

                    maximized:
                        options.maximized ===
                        true,

                    pip:
                        options.pip ===
                        true,

                    windowId,

                    route:
                        app.route ||
                        null

                }
            );


            state.activeAppId =
                normalizeId(
                    app.id
                );


            deactivateOtherApps(
                app.id
            );


            state.statistics.opens +=
                1;

            state.statistics.activations +=
                1;


            emit(
                "app-opened",
                {
                    app,
                    window,
                    options
                }
            );


            emit(
                "app-activated",
                {
                    app
                }
            );


            return {

                app,

                window,

                state:
                    getAppState(
                        app.id
                    )

            };

        } catch (exception) {

            reportError(
                exception,
                "App Öffnen: " +
                app.id
            );


            updateAppState(
                app.id,
                {

                    loading:
                        false,

                    status:
                        "error",

                    lifecycle:
                        "error",

                    error:
                        exception.message

                }
            );


            return null;

        }

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
       22 — ACTIVATE
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
                typeof app.activate ===
                "function"
            ) {

                await app.activate(
                    {

                        app,

                        manager:
                            api,

                        context:
                            state.contexts.get(
                                app.id
                            )

                    }
                );

            }


            if (
                typeof app.onActivate ===
                "function"
            ) {

                await app.onActivate(
                    {

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
                normalizeId(
                    app.id
                );


            deactivateOtherApps(
                app.id
            );


            state.statistics.activations +=
                1;


            updateAppState(
                app.id,
                {

                    active:
                        true,

                    minimized:
                        false,

                    visible:
                        true

                }
            );


            emit(
                "app-activated",
                {
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


    function deactivateOtherApps(
        exceptId
    ) {

        const except =
            normalizeId(
                exceptId
            );


        state.appState.forEach(
            (appState, id) => {

                if (
                    id !== except &&
                    appState.open &&
                    appState.active
                ) {

                    appState.active =
                        false;

                    appState.updatedAt =
                        Date.now();

                }

            }
        );

    }


    /* ========================================================
       23 — DEACTIVATE
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
                typeof app.deactivate ===
                "function"
            ) {

                await app.deactivate(
                    {
                        app,
                        manager:
                            api
                    }
                );

            }


            if (
                typeof app.onDeactivate ===
                "function"
            ) {

                await app.onDeactivate(
                    {
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
                normalizeId(
                    app.id
                )
            ) {

                state.activeAppId =
                    null;

            }


            emit(
                "app-deactivated",
                {
                    app
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Deaktivierung"
            );


            return false;

        }

    }


    /* ========================================================
       24 — MINIMIZE
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


        const appState =
            createInitialState(
                app.id
            );


        try {

            if (
                typeof app.minimize ===
                "function"
            ) {

                await app.minimize(
                    {
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
       25 — RESTORE
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


        const appState =
            createInitialState(
                app.id
            );


        try {

            if (
                typeof app.restore ===
                "function"
            ) {

                await app.restore(
                    {
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
                        false,

                    active:
                        true,

                    visible:
                        true

                }
            );


            await activate(
                app.id
            );


            emit(
                "app-restored",
                {
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
       26 — PIP
       ======================================================== */

    async function enablePIP(
        appId
    ) {

        return setPIP(
            appId,
            true
        );

    }


    async function disablePIP(
        appId
    ) {

        return setPIP(
            appId,
            false
        );

    }


    async function setPIP(
        appId,
        enabled
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


        try {

            const manager =
                getWindowManager();


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
                    !!enabled
                );

            }


            updateAppState(
                app.id,
                {
                    pip:
                        !!enabled
                }
            );


            emit(
                enabled
                    ? "app-pip-enabled"
                    : "app-pip-disabled",

                {
                    app
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "PIP"
            );


            return false;

        }

    }


    /* ========================================================
       27 — CLOSE
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

                            app,

                            manager:
                                api,

                            context:
                                state.contexts.get(
                                    app.id
                                ),

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

                    lifecycle:
                        "closed",

                    status:
                        "closed",

                    open:
                        false,

                    active:
                        false,

                    visible:
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
                normalizeId(
                    app.id
                )
            ) {

                state.activeAppId =
                    null;

            }


            state.statistics.closes +=
                1;


            emit(
                "app-closed",
                {
                    app,
                    options
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Schließen: " +
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
       28 — STOP
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

                    lifecycle:
                        "stopped",

                    status:
                        "stopped",

                    started:
                        false

                }
            );


            emit(
                "app-stopped",
                {
                    app
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Stop"
            );


            return false;

        }

    }


    /* ========================================================
       29 — CLOSE ALL
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
       30 — OPEN APPS
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

                ...clone(
                    item
                ),

                app:
                    get(
                        item.appId
                    )

            })
        );

    }


    function getOpenApps() {

        return getAllOpenApps();

    }


    function getActiveApp() {

        return state.activeAppId
            ? get(
                state.activeAppId
            )
            : null;

    }


    function getActiveAppId() {

        return state.activeAppId;

    }


    /* ========================================================
       31 — ENABLE / DISABLE
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

            try {

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

            } catch (exception) {

                reportError(
                    exception,
                    "App Enable"
                );

            }

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

            try {

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

            } catch (exception) {

                reportError(
                    exception,
                    "App Disable"
                );

            }

        }


        return false;

    }


    /* ========================================================
       32 — SEARCH
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

            try {

                return registry.search(
                    query
                );

            } catch (_) {}

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
       33 — CATEGORY
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

            try {

                return registry.getByCategory(
                    category
                );

            } catch (_) {}

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
       34 — APP COUNT
       ======================================================== */

    function getCount() {

        return getAll().length;

    }


    function getOpenCount() {

        return getAllOpenApps()
            .length;

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

        state.connections.launcher =
            !!getLauncher();

        state.connections.contract =
            !!getContract();

        state.connections.storage =
            !!getStorage();

        state.connections.ai =
            !!getAI();

        state.connections.language =
            !!getLanguage();

        state.connections.voice =
            !!getVoice();

        state.connections.notifications =
            !!getNotifications();

        state.connections.keyboard =
            !!getKeyboard();


        syncRegistry();


        return {
            ...state.connections
        };

    }


    function getConnectionStatus() {

        refreshConnections();

        return {
            ...state.connections
        };

    }


    /* ========================================================
       36 — KERNEL
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

        } catch (exception) {

            reportError(
                exception,
                "Kernel Events"
            );


            return false;

        }

    }


    /* ========================================================
       37 — REGISTRY EVENTS
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

            [
                "registered",
                "updated",
                "removed",
                "enabled",
                "disabled"
            ]
            .forEach(
                event => {

                    registry.on(
                        event,
                        payload => {

                            syncRegistry();


                            emit(
                                "registry-" +
                                event,

                                payload
                            );

                        }
                    );

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
       38 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        refreshConnections();


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

            connections:
                getConnectionStatus(),

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

                        version:
                            app.version,

                        category:
                            app.category,

                        enabled:
                            app.enabled !==
                            false,

                        dependencies:
                            checkDependencies(
                                app
                            ),

                        state:
                            getAppState(
                                app.id
                            ),

                        hasContext:
                            state.contexts.has(
                                normalizeId(
                                    app.id
                                )
                            )

                    })
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       39 — HEALTH CHECK
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
            !state.connections.system
        ) {

            problems.push(
                "System nicht verbunden."
            );

        }


        if (
            !state.connections.registry
        ) {

            problems.push(
                "App Registry nicht verbunden."
            );

        }


        if (
            !state.connections.contract
        ) {

            problems.push(
                "App Contract nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length ===
                0,

            problems,

            appCount:
                getCount(),

            openAppCount:
                getOpenCount(),

            activeApp:
                getActiveAppId(),

            connections:
                getConnectionStatus(),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       40 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


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

        on,

        off,

        emit,


        /* Registry */

        register,

        registerApp,

        syncRegistry,


        /* Apps */

        get,

        getApp,

        getAll,

        getApps,

        has,


        /* Contract */

        getContract,


        createAppContext,


        /* Lifecycle */

        initializeApp,

        startApp,

        open,

        openApp,

        activate,

        activateApp,

        deactivate,

        minimize,

        restore,

        close,

        closeApp,

        closeAll,

        stop,


        /* Multi App */

        getAllOpenApps,

        getOpenApps,

        getActiveApp,

        getActiveAppId,


        /* PIP */

        enablePIP,

        disablePIP,

        setPIP,


        /* State */

        getAppState,

        updateAppState,


        /* Settings */

        getSettings,

        setSettings,

        resetSettings,

        loadAppSettings,

        saveAppSettings,


        /* Dependencies */

        checkDependencies,


        /* Status */

        enableApp,

        disableApp,


        /* Search */

        search,

        getByCategory,


        /* Statistics */

        getCount,

        getOpenCount,

        getStatistics() {

            return {
                ...state.statistics
            };

        },


        /* Connections */

        connectKernel,

        refreshConnections,

        getConnectionStatus,


        /* Diagnostics */

        diagnostics,

        healthCheck

    };


    /* ========================================================
       41 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppManager =
        api;

    window.HalDoOSAppManager =
        api;

    HalDoOS.appManager =
        api;


    /* ========================================================
       42 — INITIALIZATION
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

            connectRegistryEvents();


            syncRegistry();


            state.ready =
                true;

            state.initializing =
                false;


            if (
                getKernel() &&
                hasMethod(
                    getKernel(),
                    "setModuleReady"
                )
            ) {

                try {

                    getKernel().setModuleReady(
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

                    appCount:
                        getCount(),

                    diagnostics:
                        diagnostics()

                }
            );


            log(
                "HalDo AI OS 20 App Manager bereit.",
                "Version:",
                VERSION,
                "Apps:",
                getCount()
            );


            return api;

        } catch (exception) {

            state.initializing =
                false;

            state.failed =
                true;


            reportError(
                exception,
                "App Manager Initialisierung"
            );


            return api;

        }

    }


    /* ========================================================
       43 — BOOT
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
                        "App Manager Boot"
                    );

                }
            );

    }


    /* ========================================================
       44 — DOM START
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
       45 — FINAL EXPORT
       ======================================================== */

    HalDoOS.appManager =
        api;

    window.HalDoAppManager =
        api;

    window.HalDoOSAppManager =
        api;


    /* ========================================================
       END
       HALDO AI OS 20
       APPLICATION MANAGER
       ======================================================== */

})(window, document);