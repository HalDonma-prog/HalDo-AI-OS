/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL APPLICATION MANAGER
   ------------------------------------------------------------
   Datei:
       /js/app-manager.js

   Version:
       20.1.0

   ZENTRALE APP-SCHALTZENTRALE

   VERBINDET:

   Kernel
   System
   App Registry
   App Contract
   App Platform
   App Router
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

   - App Registration
   - App Manifest
   - App Contract
   - App Context
   - App Platform Bridge
   - App Lifecycle
   - App Instances
   - Multi-App
   - Multi-Window
   - Singleton
   - PIP
   - Minimize / Restore
   - Activate / Deactivate
   - Start / Stop
   - Open / Close
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
   - Runtime Connections
   - Platform Events

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
        "20.1.0";

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


    function getContract() {
        return (
            window.HalDoAppContract ||
            HalDoOS.appContract ||
            null
        );
    }


    function getPlatform() {
        return (
            window.HalDoAppPlatform ||
            HalDoOS.appPlatform ||
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


    function hasMethod(object, method) {
        return !!(
            object &&
            typeof object[method] === "function"
        );
    }


    /* ========================================================
       04 — HELPERS
       ======================================================== */

    function normalizeId(value) {

        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(
                /[^a-z0-9äöüßîêç_-]+/gi,
                "-"
            )
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");

    }


    function clone(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return value;
        }

        if (Array.isArray(value)) {
            return value.map(clone);
        }

        if (typeof value === "object") {

            const result = {};

            Object.keys(value).forEach(key => {
                result[key] =
                    clone(value[key]);
            });

            return result;
        }

        return value;
    }


    function safeAsyncResult(result) {

        return (
            result &&
            typeof result.then === "function"
        )
            ? result
            : Promise.resolve(result);

    }


    function dispatch(name, detail) {

        try {

            window.dispatchEvent(
                new CustomEvent(
                    name,
                    {
                        detail:
                            detail || null
                    }
                )
            );

        } catch (_) {}

    }


    /* ========================================================
       05 — INTERNAL STATE
       ======================================================== */

    const state = {

        initialized: false,

        initializing: false,

        ready: false,

        failed: false,

        activeAppId: null,

        apps: new Map(),

        instances: new Map(),

        appState: new Map(),

        settings: new Map(),

        contexts: new Map(),

        listeners: new Map(),

        platformListeners: [],

        registryListeners: [],

        kernelListeners: [],

        connections: {

            kernel: false,
            system: false,
            registry: false,
            contract: false,
            platform: false,
            router: false,
            windowManager: false,
            launcher: false,
            storage: false,
            ai: false,
            language: false,
            voice: false,
            notifications: false,
            keyboard: false

        },

        statistics: {

            registered: 0,
            initialized: 0,
            starts: 0,
            opens: 0,
            closes: 0,
            stops: 0,
            activations: 0,
            errors: 0,
            settingsChanges: 0,
            platformConnections: 0

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

    function on(event, callback) {

        if (
            typeof callback !==
            "function"
        ) {
            return function () {};
        }

        if (
            !state.listeners.has(event)
        ) {

            state.listeners.set(
                event,
                new Set()
            );

        }

        const listeners =
            state.listeners.get(event);

        listeners.add(callback);

        return function () {
            off(event, callback);
        };
    }


    function off(event, callback) {

        const listeners =
            state.listeners.get(event);

        if (!listeners) {
            return;
        }

        listeners.delete(callback);

        if (!listeners.size) {
            state.listeners.delete(event);
        }
    }


    function emit(event, data = null) {

        const listeners =
            state.listeners.get(event);

        if (listeners) {

            Array.from(listeners)
                .forEach(callback => {

                    try {
                        callback(data);
                    } catch (exception) {
                        reportError(
                            exception,
                            "Event: " + event
                        );
                    }

                });
        }


        const events =
            HalDoOS.events;

        if (
            events &&
            hasMethod(events, "emit")
        ) {

            try {
                events.emit(
                    "app-manager:" + event,
                    data
                );
            } catch (_) {}

        }


        const kernel =
            getKernel();

        if (
            kernel &&
            hasMethod(kernel, "emit")
        ) {

            try {
                kernel.emit(
                    "app-manager:" + event,
                    data
                );
            } catch (_) {}

        }


        dispatch(
            "haldo:app-manager:" + event,
            data
        );
    }


    /* ========================================================
       08 — ERROR HANDLING
       ======================================================== */

    function reportError(
        exception,
        context = "Application Manager"
    ) {

        state.statistics.errors += 1;

        const normalized =
            exception instanceof Error
                ? exception
                : new Error(
                    String(exception)
                );

        const record = {

            message:
                normalized.message,

            name:
                normalized.name,

            stack:
                normalized.stack || "",

            context,

            time:
                Date.now()

        };

        errorLog(record);

        emit("error", record);

        const kernel =
            getKernel();

        if (
            kernel &&
            hasMethod(kernel, "reportError")
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

    function createInitialState(appId) {

        const id =
            normalizeId(appId);

        if (!id) {
            return null;
        }

        if (!state.appState.has(id)) {

            state.appState.set(
                id,
                {

                    appId: id,

                    lifecycle: "created",

                    status: "closed",

                    initialized: false,

                    started: false,

                    open: false,

                    active: false,

                    visible: false,

                    minimized: false,

                    maximized: false,

                    pip: false,

                    suspended: false,

                    loading: false,

                    ready: false,

                    error: null,

                    errorCount: 0,

                    windowId: null,

                    route: null,

                    createdAt: Date.now(),

                    updatedAt: Date.now()

                }
            );
        }

        return state.appState.get(id);
    }


    function getAppState(appId) {

        const result =
            createInitialState(appId);

        return clone(result);
    }


    function updateAppState(
        appId,
        changes = {}
    ) {

        const current =
            createInitialState(appId);

        if (!current) {
            return null;
        }

        Object.assign(
            current,
            changes,
            {
                updatedAt: Date.now()
            }
        );

        emit(
            "state-changed",
            {
                appId: current.appId,
                state: clone(current)
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
                context.updateState(changes);
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
                    registry.getAll() || [];

            }

            if (!Array.isArray(apps)) {
                apps = [];
            }

            apps.forEach(app => {

                if (
                    app &&
                    app.id
                ) {

                    const id =
                        normalizeId(
                            app.id
                        );

                    state.apps.set(
                        id,
                        app
                    );

                    createInitialState(id);
                }

            });

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


    function get(appId) {

        const id =
            normalizeId(appId);

        if (!id) {
            return null;
        }

        const registry =
            getRegistry();

        if (
            registry &&
            hasMethod(registry, "get")
        ) {

            try {

                const registered =
                    registry.get(id);

                if (registered) {

                    state.apps.set(
                        id,
                        registered
                    );

                    createInitialState(id);

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
            state.apps.get(id) ||
            null
        );
    }


    function getApp(appId) {
        return get(appId);
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


    function has(appId) {
        return !!get(appId);
    }


    /* ========================================================
       11 — CONTRACT
       ======================================================== */

    function normalizeDefinition(
        definition
    ) {

        if (!definition) {
            return null;
        }

        const contract =
            getContract();

        let normalized = {
            ...definition
        };

        if (
            contract &&
            hasMethod(
                contract,
                "createManifest"
            )
        ) {

            try {

                normalized = {
                    ...normalized,

                    ...contract.createManifest(
                        normalized
                    )
                };

            } catch (exception) {

                reportError(
                    exception,
                    "App Contract Manifest"
                );
            }
        }

        normalized.id =
            normalizeId(
                normalized.id ||
                normalized.appId ||
                normalized.name
            );

        return normalized;
    }


    function getContract() {
        return (
            window.HalDoAppContract ||
            HalDoOS.appContract ||
            null
        );
    }


    /* ========================================================
       12 — REGISTER
       ======================================================== */

    function register(definition) {

        if (
            !definition ||
            (
                !definition.id &&
                !definition.appId &&
                !definition.name
            )
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
            }
        }

        state.apps.set(id, app);

        createInitialState(id);

        state.statistics.registered += 1;

        emit(
            "registered",
            {
                app
            }
        );

        return app;
    }


    function registerApp(definition) {
        return register(definition);
    }


    /* ========================================================
       13 — APP PLATFORM
       ======================================================== */

    function connectAppPlatform() {

        const platform =
            getPlatform();

        if (!platform) {

            state.connections.platform =
                false;

            return false;
        }

        state.connections.platform =
            true;

        HalDoOS.appPlatform =
            platform;

        api.appPlatform =
            platform;

        state.statistics.platformConnections +=
            1;

        /*
         * Plattform-Events nur einmal
         * registrieren.
         */

        if (
            hasMethod(platform, "on") &&
            !state.platformListeners.length
        ) {

            const events = [

                "app:opened",
                "app:closed",
                "app:started",
                "app:stopped",
                "app:activated",
                "app:deactivated",
                "app:error",
                "app:registered"

            ];

            events.forEach(eventName => {

                const callback =
                    detail => {

                        const localEvent =
                            eventName
                                .replace(
                                    /^app:/,
                                    ""
                                );

                        emit(
                            "platform-" +
                            localEvent,
                            detail
                        );

                        dispatch(
                            "haldo:" +
                            eventName,
                            detail
                        );

                    };

                try {

                    platform.on(
                        eventName,
                        callback
                    );

                    state.platformListeners.push(
                        {
                            event:
                                eventName,
                            callback
                        }
                    );

                } catch (exception) {

                    reportError(
                        exception,
                        "App Platform Event"
                    );
                }

            });
        }

        emit(
            "platform-connected",
            {
                platform
            }
        );

        dispatch(
            "haldo:app-platform-connected",
            {
                manager: api,
                platform
            }
        );

        log(
            "App Platform verbunden."
        );

        return true;
    }


    function platformOpen(
        appId,
        options = {}
    ) {

        const platform =
            getPlatform();

        if (
            platform &&
            hasMethod(
                platform,
                "openApp"
            )
        ) {

            try {

                return platform.openApp(
                    appId,
                    options
                );

            } catch (exception) {

                reportError(
                    exception,
                    "App Platform Open"
                );
            }
        }

        return null;
    }


    function platformClose(appId) {

        const platform =
            getPlatform();

        if (
            platform &&
            hasMethod(
                platform,
                "closeApp"
            )
        ) {

            try {

                return platform.closeApp(
                    appId
                );

            } catch (exception) {

                reportError(
                    exception,
                    "App Platform Close"
                );
            }
        }

        return null;
    }


    function getPlatformRunningApps() {

        const platform =
            getPlatform();

        if (
            platform &&
            hasMethod(
                platform,
                "getRunningApps"
            )
        ) {

            try {
                return platform.getRunningApps() || [];
            } catch (_) {}
        }

        return [];
    }


    /* ========================================================
       14 — SETTINGS
       ======================================================== */

    function settingsKey(appId) {

        return (
            "haldo.os20.app.settings." +
            normalizeId(appId)
        );
    }


    function getSettings(appId) {

        const id =
            normalizeId(appId);

        if (!state.settings.has(id)) {

            state.settings.set(
                id,
                {}
            );
        }

        return clone(
            state.settings.get(id)
        );
    }


    function setSettings(
        appId,
        changes = {}
    ) {

        const id =
            normalizeId(appId);

        if (!id) {
            return null;
        }

        const current =
            getSettings(id);

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
                appId: id,
                settings: clone(next)
            }
        );

        const context =
            state.contexts.get(id);

        if (
            context &&
            typeof context.updateSettings ===
            "function"
        ) {

            try {
                context.updateSettings(changes);
            } catch (_) {}
        }

        return clone(next);
    }


    function resetSettings(appId) {

        const id =
            normalizeId(appId);

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
                appId: id
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
                        settingsKey(appId),
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

            if (
                window.localStorage
            ) {

                window.localStorage.setItem(
                    settingsKey(appId),
                    JSON.stringify(
                        settings || {}
                    )
                );

                return true;
            }

        } catch (exception) {

            reportError(
                exception,
                "App Settings speichern"
            );
        }

        return false;
    }


    function loadAppSettings(appId) {

        const id =
            normalizeId(appId);

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
                        settingsKey(id)
                    );

                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    return result.then(value => {

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

                    });
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

                    return clone(result);
                }
            }

            if (
                window.localStorage
            ) {

                const raw =
                    window.localStorage.getItem(
                        settingsKey(id)
                    );

                if (!raw) {
                    return getSettings(id);
                }

                const parsed =
                    JSON.parse(raw);

                if (
                    parsed &&
                    typeof parsed ===
                    "object"
                ) {

                    state.settings.set(
                        id,
                        parsed
                    );

                    return clone(parsed);
                }
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

    function checkDependencies(app) {

        if (!app) {

            return {
                valid: false,
                missing: []
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

                    const dependencyApp =
                        get(
                            normalizeId(
                                dependency
                            )
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
                missing.length === 0,

            missing
        };
    }


    /* ========================================================
       16 — PERMISSIONS / CAPABILITIES
       ======================================================== */

    function checkPermissions(
        app,
        options = {}
    ) {

        if (!app) {
            return {
                valid: false,
                missing: []
            };
        }

        const required =
            Array.isArray(
                app.permissions
            )
                ? app.permissions
                : [];

        const granted =
            Array.isArray(
                options.permissions
            )
                ? options.permissions
                : (
                    Array.isArray(
                        app.grantedPermissions
                    )
                        ? app.grantedPermissions
                        : []
                );

        const missing =
            required.filter(
                permission =>
                    !granted.includes(
                        permission
                    )
            );

        return {

            valid:
                missing.length === 0,

            required,
            granted,
            missing

        };
    }


    function getCapabilities(app) {

        if (!app) {
            return [];
        }

        return Array.isArray(
            app.capabilities
        )
            ? clone(app.capabilities)
            : [];
    }


    /* ========================================================
       17 — APP CONTEXT
       ======================================================== */

    function createAppContext(app) {

        const contract =
            getContract();

        if (
            contract &&
            hasMethod(
                contract,
                "createContext"
            )
        ) {

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

                        contract,

                        platform:
                            getPlatform(),

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
            }
        }

        /*
         * Fallback Context:
         * Dadurch bleiben Apps auch dann
         * funktionsfähig, wenn ein Contract
         * noch nicht geladen wurde.
         */

        return {

            app,

            appId:
                normalizeId(app.id),

            manager:
                api,

            kernel:
                getKernel(),

            system:
                getSystem(),

            registry:
                getRegistry(),

            contract,

            platform:
                getPlatform(),

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
                getKeyboard(),

            getState() {
                return getAppState(app.id);
            },

            updateState(changes) {
                return updateAppState(
                    app.id,
                    changes
                );
            },

            getSettings() {
                return getSettings(
                    app.id
                );
            },

            updateSettings(changes) {
                return setSettings(
                    app.id,
                    changes
                );
            }

        };
    }


    /* ========================================================
       18 — INITIALIZE APP
       ======================================================== */

    async function initializeApp(app) {

        if (!app) {
            return false;
        }

        const id =
            normalizeId(app.id);

        const existing =
            state.instances.get(id);

        if (
            existing &&
            existing.initialized
        ) {
            return true;
        }

        try {

            createInitialState(id);

            const settings =
                loadAppSettings(id);

            const resolvedSettings =
                (
                    settings &&
                    typeof settings.then ===
                    "function"
                )
                    ? await settings
                    : settings;

            const context =
                createAppContext(app);

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

                await safeAsyncResult(
                    app.init({
                        app,
                        manager: api,
                        context,
                        settings:
                            resolvedSettings ||
                            getSettings(id),
                        state:
                            getAppState(id),

                        services: {

                            kernel:
                                getKernel(),

                            system:
                                getSystem(),

                            registry:
                                getRegistry(),

                            contract:
                                getContract(),

                            platform:
                                getPlatform(),

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

                    })
                );
            }

            state.instances.set(
                id,
                {

                    initialized: true,

                    started: false,

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
                        state.contexts.get(id)
                }
            );

            return true;

        } catch (exception) {

            const current =
                createInitialState(id);

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
                            current.errorCount ||
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
       19 — START APP
       ======================================================== */

    async function startApp(
        app,
        options = {}
    ) {

        if (!app) {
            return false;
        }

        const initialized =
            await initializeApp(app);

        if (!initialized) {
            return false;
        }

        const id =
            normalizeId(app.id);

        const instance =
            state.instances.get(id);

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

                await safeAsyncResult(
                    app.start({
                        app,
                        manager: api,
                        context:
                            state.contexts.get(id),
                        options
                    })
                );
            }

            state.instances.set(
                id,
                {

                    ...(instance || {}),

                    initialized: true,

                    started: true,

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
                    app,
                    options
                }
            );

            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Start: " + id
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
       20 — ROUTER
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
       21 — WINDOW
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
                    app.name ||
                    app.id,

                icon:
                    app.icon ||
                    "◈",

                singleton:
                    app.singleton !== false,

                minimized:
                    options.minimized === true,

                maximized:
                    options.maximized === true,

                pip:
                    options.pip === true,

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
       22 — OPEN APP
       ======================================================== */

    async function open(
        appId,
        options = {}
    ) {

        const app =
            get(appId);

        if (!app) {

            reportError(
                new Error(
                    "App nicht gefunden: " +
                    appId
                ),
                "App öffnen"
            );

            /*
             * Falls die App nur auf der
             * Plattform existiert, darf die
             * Plattform den Open-Vorgang
             * übernehmen.
             */

            const platformResult =
                platformOpen(
                    appId,
                    options
                );

            if (platformResult !== null) {
                return platformResult;
            }

            return null;
        }

        if (
            app.enabled === false
        ) {

            warn(
                "App deaktiviert:",
                app.id
            );

            return null;
        }

        const dependencyStatus =
            checkDependencies(app);

        if (
            !dependencyStatus.valid
        ) {

            reportError(
                new Error(
                    "Fehlende Dependencies: " +
                    dependencyStatus.missing.join(", ")
                ),
                "App Dependencies"
            );

            return null;
        }

        const permissionStatus =
            checkPermissions(
                app,
                options
            );

        if (
            !permissionStatus.valid &&
            options.ignorePermissions !== true
        ) {

            emit(
                "permission-required",
                {
                    app,
                    permissions:
                        permissionStatus
                }
            );

            /*
             * Nur abbrechen, wenn die App
             * ausdrücklich Permissions verlangt
             * und keine Plattform zur Autorisierung
             * vorhanden ist.
             */

            if (
                !getPlatform()
            ) {

                reportError(
                    new Error(
                        "Fehlende App-Berechtigungen: " +
                        permissionStatus.missing.join(", ")
                    ),
                    "App Permissions"
                );

                return null;
            }
        }

        const current =
            createInitialState(app.id);

        if (
            app.singleton !== false &&
            current.open
        ) {

            await activate(app.id);

            return {

                app,

                state:
                    getAppState(app.id),

                existing:
                    true,

                window:
                    current.windowId
                        ? {
                            id:
                                current.windowId
                        }
                        : null

            };
        }

        updateAppState(
            app.id,
            {

                loading:
                    true,

                lifecycle:
                    "opening",

                error:
                    null

            }
        );

        const started =
            await startApp(
                app,
                options
            );

        if (!started) {

            updateAppState(
                app.id,
                {
                    loading:
                        false
                }
            );

            return null;
        }

        try {

            if (
                typeof app.open ===
                "function"
            ) {

                await safeAsyncResult(
                    app.open({
                        app,
                        manager: api,
                        context:
                            state.contexts.get(
                                app.id
                            ),
                        options
                    })
                );
            }

            /*
             * Platform zuerst informieren,
             * sofern sie eine eigene Runtime
             * bereitstellt.
             */

            let platformResult = null;

            if (
                getPlatform() &&
                hasMethod(
                    getPlatform(),
                    "openApp"
                )
            ) {

                platformResult =
                    platformOpen(
                        app.id,
                        options
                    );
            }

            /*
             * Window Manager bleibt die zentrale
             * Window-Schicht.
             */

            const windowResult =
                createWindow(
                    app,
                    options
                );

            routeToApp(
                app,
                options
            );

            const windowId =
                (
                    windowResult &&
                    (
                        windowResult.id ||
                        windowResult.windowId
                    )
                ) ||
                (
                    platformResult &&
                    (
                        platformResult.windowId ||
                        platformResult.id
                    )
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
                        options.maximized === true,

                    pip:
                        options.pip === true,

                    windowId,

                    route:
                        app.route ||
                        null

                }
            );

            state.activeAppId =
                normalizeId(app.id);

            deactivateOtherApps(
                app.id
            );

            state.statistics.opens +=
                1;

            state.statistics.activations +=
                1;

            const payload = {

                app,

                window:
                    windowResult,

                platform:
                    platformResult,

                options,

                state:
                    getAppState(app.id)

            };

            emit(
                "app-opened",
                payload
            );

            emit(
                "app-activated",
                {
                    app
                }
            );

            dispatch(
                "haldo:app-opened",
                payload
            );

            return {

                app,

                window:
                    windowResult,

                platform:
                    platformResult,

                state:
                    getAppState(app.id)

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
       23 — ACTIVATE
       ======================================================== */

    async function activate(appId) {

        const app =
            get(appId);

        if (!app) {
            return false;
        }

        const appState =
            createInitialState(app.id);

        if (!appState.open) {

            return !!(
                await open(app.id)
            );
        }

        try {

            if (
                typeof app.activate ===
                "function"
            ) {

                await safeAsyncResult(
                    app.activate({
                        app,
                        manager: api,
                        context:
                            state.contexts.get(
                                app.id
                            )
                    })
                );
            }

            if (
                typeof app.onActivate ===
                "function"
            ) {

                await safeAsyncResult(
                    app.onActivate({
                        app,
                        manager: api
                    })
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
                normalizeId(app.id);

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


    function activateApp(appId) {
        return activate(appId);
    }


    function deactivateOtherApps(
        exceptId
    ) {

        const except =
            normalizeId(exceptId);

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

                    emit(
                        "app-backgrounded",
                        {
                            appId: id
                        }
                    );
                }

            }
        );
    }


    /* ========================================================
       24 — DEACTIVATE
       ======================================================== */

    async function deactivate(appId) {

        const app =
            get(appId);

        if (!app) {
            return false;
        }

        try {

            if (
                typeof app.deactivate ===
                "function"
            ) {

                await safeAsyncResult(
                    app.deactivate({
                        app,
                        manager: api
                    })
                );
            }

            if (
                typeof app.onDeactivate ===
                "function"
            ) {

                await safeAsyncResult(
                    app.onDeactivate({
                        app,
                        manager: api
                    })
                );
            }

            updateAppState(
                app.id,
                {
                    active: false
                }
            );

            if (
                state.activeAppId ===
                normalizeId(app.id)
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
       25 — MINIMIZE
       ======================================================== */

    async function minimize(appId) {

        const app =
            get(appId);

        if (!app) {
            return false;
        }

        const appState =
            createInitialState(app.id);

        try {

            if (
                typeof app.minimize ===
                "function"
            ) {

                await safeAsyncResult(
                    app.minimize({
                        app,
                        manager: api
                    })
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

                    minimized: true,

                    active: false

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
       26 — RESTORE
       ======================================================== */

    async function restore(appId) {

        const app =
            get(appId);

        if (!app) {
            return false;
        }

        const appState =
            createInitialState(app.id);

        try {

            if (
                typeof app.restore ===
                "function"
            ) {

                await safeAsyncResult(
                    app.restore({
                        app,
                        manager: api
                    })
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

                    minimized: false,

                    active: true,

                    visible: true

                }
            );

            await activate(app.id);

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
       27 — PIP
       ======================================================== */

    async function enablePIP(appId) {
        return setPIP(appId, true);
    }


    async function disablePIP(appId) {
        return setPIP(appId, false);
    }


    async function setPIP(
        appId,
        enabled
    ) {

        const app =
            get(appId);

        if (!app) {
            return false;
        }

        const appState =
            createInitialState(app.id);

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
       28 — CLOSE
       ======================================================== */

    async function close(
        appId,
        options = {}
    ) {

        const app =
            get(appId);

        if (!app) {
            return false;
        }

        const appState =
            createInitialState(app.id);

        if (!appState.open) {
            return true;
        }

        try {

            if (
                typeof app.close ===
                "function"
            ) {

                await safeAsyncResult(
                    app.close({
                        app,
                        manager: api,
                        context:
                            state.contexts.get(
                                app.id
                            ),
                        options
                    })
                );
            }

            const platform =
                getPlatform();

            if (
                platform &&
                hasMethod(
                    platform,
                    "closeApp"
                )
            ) {

                try {
                    await safeAsyncResult(
                        platform.closeApp(
                            app.id
                        )
                    );
                } catch (exception) {

                    reportError(
                        exception,
                        "Platform App Close"
                    );
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

                    loading:
                        false,

                    windowId:
                        null

                }
            );

            if (
                state.activeAppId ===
                normalizeId(app.id)
            ) {

                state.activeAppId =
                    null;
            }

            state.statistics.closes +=
                1;

            const payload = {
                app,
                options
            };

            emit(
                "app-closed",
                payload
            );

            dispatch(
                "haldo:app-closed",
                payload
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
       29 — STOP
       ======================================================== */

    async function stop(appId) {

        const app =
            get(appId);

        if (!app) {
            return false;
        }

        try {

            if (
                typeof app.stop ===
                "function"
            ) {

                await safeAsyncResult(
                    app.stop({
                        app,
                        manager: api
                    })
                );
            }

            const instance =
                state.instances.get(
                    normalizeId(app.id)
                );

            if (instance) {
                instance.started = false;
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
       30 — CLOSE ALL
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
       31 — RUNNING APPS
       ======================================================== */

    function getAllOpenApps() {

        return Array.from(
            state.appState.values()
        )
        .filter(
            item =>
                item.open === true
        )
        .map(item => ({

            ...clone(item),

            app:
                get(item.appId)

        }));
    }


    function getOpenApps() {
        return getAllOpenApps();
    }


    function getRunningApps() {

        const platformApps =
            getPlatformRunningApps();

        const managerApps =
            getAllOpenApps();

        const map =
            new Map();

        managerApps.forEach(item => {

            map.set(
                normalizeId(
                    item.appId
                ),
                item
            );
        });

        if (Array.isArray(platformApps)) {

            platformApps.forEach(item => {

                const id =
                    normalizeId(
                        item &&
                        (
                            item.appId ||
                            item.id
                        )
                    );

                if (
                    id &&
                    !map.has(id)
                ) {

                    map.set(
                        id,
                        item
                    );
                }

            });
        }

        return Array.from(
            map.values()
        );
    }


    function getActiveApp() {

        return state.activeAppId
            ? get(state.activeAppId)
            : null;
    }


    function getActiveAppId() {
        return state.activeAppId;
    }


    /* ========================================================
       32 — ENABLE / DISABLE
       ======================================================== */

    function enableApp(appId) {

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
                            get(appId)
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


    async function disableApp(appId) {

        await close(appId);

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
                            get(appId)
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
       33 — SEARCH
       ======================================================== */

    function search(query) {

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
            String(query || "")
                .trim()
                .toLowerCase();

        if (!value) {
            return [];
        }

        return getAll().filter(app => {

            const fields = [

                app.id,

                app.name,

                app.title,

                app.description,

                app.category,

                ...(Array.isArray(app.tags)
                    ? app.tags
                    : []),

                ...(Array.isArray(app.keywords)
                    ? app.keywords
                    : [])

            ];

            return fields.some(
                field =>
                    String(field || "")
                        .toLowerCase()
                        .includes(value)
            );
        });
    }


    /* ========================================================
       34 — CATEGORY
       ======================================================== */

    function getByCategory(category) {

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
            String(category || "")
                .trim()
                .toLowerCase();

        return getAll().filter(
            app =>
                String(
                    app.category || ""
                )
                .toLowerCase() ===
                value
        );
    }


    /* ========================================================
       35 — COUNTS
       ======================================================== */

    function getCount() {
        return getAll().length;
    }


    function getOpenCount() {
        return getAllOpenApps().length;
    }


    /* ========================================================
       36 — CONNECTIONS
       ======================================================== */

    function refreshConnections() {

        state.connections.kernel =
            !!getKernel();

        state.connections.system =
            !!getSystem();

        state.connections.registry =
            !!getRegistry();

        state.connections.contract =
            !!getContract();

        state.connections.platform =
            !!getPlatform();

        state.connections.router =
            !!getRouter();

        state.connections.windowManager =
            !!getWindowManager();

        state.connections.launcher =
            !!getLauncher();

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

        if (
            state.connections.platform
        ) {
            connectAppPlatform();
        }

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
       37 — KERNEL
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

        if (
            state.kernelListeners.length
        ) {
            return true;
        }

        try {

            const readyHandler =
                function () {

                    refreshConnections();

                    emit(
                        "kernel-ready"
                    );
                };

            const errorHandler =
                function(payload) {

                    emit(
                        "kernel-error",
                        payload
                    );
                };

            kernel.on(
                "kernel:ready",
                readyHandler
            );

            kernel.on(
                "kernel:error",
                errorHandler
            );

            state.kernelListeners.push(
                {
                    event:
                        "kernel:ready",
                    callback:
                        readyHandler
                },
                {
                    event:
                        "kernel:error",
                    callback:
                        errorHandler
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
       38 — REGISTRY EVENTS
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

        if (
            state.registryListeners.length
        ) {
            return true;
        }

        try {

            [
                "registered",
                "updated",
                "removed",
                "enabled",
                "disabled"
            ]
            .forEach(eventName => {

                const callback =
                    payload => {

                        syncRegistry();

                        emit(
                            "registry-" +
                            eventName,
                            payload
                        );
                    };

                registry.on(
                    eventName,
                    callback
                );

                state.registryListeners.push(
                    {
                        event:
                            eventName,
                        callback
                    }
                );
            });

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
       39 — DIAGNOSTICS
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

            runningAppCount:
                getRunningApps().length,

            activeApp:
                getActiveAppId(),

            platform:
                !!getPlatform(),

            connections:
                {
                    ...state.connections
                },

            statistics:
                {
                    ...state.statistics
                },

            apps:
                apps.map(app => ({

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
                        app.enabled !== false,

                    singleton:
                        app.singleton !== false,

                    dependencies:
                        checkDependencies(app),

                    permissions:
                        checkPermissions(app),

                    capabilities:
                        getCapabilities(app),

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

                })),

            timestamp:
                new Date().toISOString()
        };
    }


    /* ========================================================
       40 — HEALTH CHECK
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
                problems.length === 0,

            problems,

            appCount:
                getCount(),

            openAppCount:
                getOpenCount(),

            runningAppCount:
                getRunningApps().length,

            activeApp:
                getActiveAppId(),

            connections:
                {
                    ...state.connections
                },

            timestamp:
                new Date().toISOString()
        };
    }


    /* ========================================================
       41 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,

        appPlatform:
            null,


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

                runningAppCount:
                    getRunningApps().length,

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


        /* Platform */

        getPlatform,

        connectAppPlatform,

        platformOpen,

        platformClose,

        getPlatformRunningApps,


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

        getRunningApps,

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

        checkPermissions,

        getCapabilities,


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
       42 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppManager =
        api;

    window.HalDoOSAppManager =
        api;

    HalDoOS.appManager =
        api;


    /* ========================================================
       43 — PLATFORM READY LISTENER
       ======================================================== */

    window.addEventListener(
        "haldo:platform-ready",
        function () {

            connectAppPlatform();

            refreshConnections();

            emit(
                "platform-ready"
            );

        }
    );


    window.addEventListener(
        "haldo:app-platform-ready",
        function () {

            connectAppPlatform();

            refreshConnections();

            emit(
                "app-platform-ready"
            );

        }
    );


    /* ========================================================
       44 — INITIALIZATION
       ======================================================== */

    async function initialize() {

        if (state.ready) {
            return api;
        }

        if (state.initializing) {
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

            connectAppPlatform();

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

                    getKernel()
                        .setModuleReady(
                            MODULE_ID,
                            true
                        );

                } catch (_) {}
            }

            const payload = {

                version:
                    VERSION,

                appCount:
                    getCount(),

                diagnostics:
                    diagnostics()

            };

            emit(
                "ready",
                payload
            );

            dispatch(
                "haldo:app-manager-ready",
                payload
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
       45 — BOOT
       ======================================================== */

    function boot() {

        initialize()
            .catch(exception => {

                state.initializing =
                    false;

                state.failed =
                    true;

                reportError(
                    exception,
                    "App Manager Boot"
                );

            });
    }


    /* ========================================================
       46 — DOM START
       ======================================================== */

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


    /* ========================================================
       47 — FINAL EXPORT
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
       APPLICATION MANAGER 20.1
       ======================================================== */

})(window, document);
