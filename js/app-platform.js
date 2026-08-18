/* ============================================================
   HALDO AI OS 20
   CENTRAL APP PLATFORM
   ------------------------------------------------------------
   Datei:
       js/app-platform.js

   ZENTRALE APP-LAUFZEITPLATTFORM

   VERBINDET:

   App Manager
   App Registry
   App Router
   Window Manager
   Kernel
   System
   Storage
   Launcher
   AI
   Language
   Voice
   Notifications
   Keyboard
   App Events

   AUFGABEN:

   - zentrale App-Laufzeit
   - App Discovery
   - App Öffnen
   - App Schließen
   - App Aktivierung
   - App Deaktivierung
   - Running Apps
   - App Events
   - App Context
   - App Health
   - Platform State
   - Diagnostics
   - sichere Service-Verbindungen

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
        "app-platform";

    const NAME =
        "HalDo AI OS 20 App Platform";


    /* ========================================================
       03 — SERVICE ACCESS
       ======================================================== */

    function getAppManager() {

        return (
            window.HalDoAppManager ||
            HalDoOS.appManager ||
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


    function getStorage() {

        return (
            window.HalDoStorage ||
            HalDoOS.storage ||
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
       04 — INTERNAL STATE
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

        platformReady:
            false,

        apps:
            new Map(),

        running:
            new Map(),

        listeners:
            new Map(),

        connections: {

            appManager:
                false,

            registry:
                false,

            router:
                false,

            windowManager:
                false,

            kernel:
                false,

            system:
                false,

            storage:
                false,

            launcher:
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

            opens:
                0,

            closes:
                0,

            activations:
                0,

            deactivations:
                0,

            errors:
                0,

            events:
                0

        },

        createdAt:
            Date.now()

    };


    /* ========================================================
       05 — HELPERS
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
       06 — LOGGING
       ======================================================== */

    function log() {

        try {

            console.log(
                "[HalDo App Platform 20]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo App Platform 20]",
                ...arguments
            );

        } catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo App Platform 20]",
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
        detail = null
    ) {

        state.statistics.events +=
            1;


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
                            detail
                        );

                    } catch (exception) {

                        reportError(
                            exception,
                            "Platform Event: " +
                            event
                        );

                    }

                }
            );

        }


        /*
         * Browser Event Bridge
         */

        try {

            window.dispatchEvent(
                new CustomEvent(
                    "haldo:platform:" + event,
                    {
                        detail
                    }
                )
            );

        } catch (_) {}


        /*
         * Kernel Event Bridge
         */

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
                    "app-platform:" +
                    event,
                    detail
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
            "App Platform"
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

            name:
                normalized.name,

            message:
                normalized.message,

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
       09 — APP DISCOVERY
       ======================================================== */

    function syncApps() {

        const manager =
            getAppManager();


        const registry =
            getRegistry();


        state.apps.clear();


        /*
         * App Manager bevorzugen
         */

        if (
            manager &&
            hasMethod(
                manager,
                "getAll"
            )
        ) {

            try {

                const apps =
                    manager.getAll() ||
                    [];

                if (
                    Array.isArray(
                        apps
                    )
                ) {

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

                }

            } catch (exception) {

                reportError(
                    exception,
                    "App Manager Discovery"
                );

            }

        }


        /*
         * Registry als zusätzliche Quelle
         */

        if (
            registry &&
            hasMethod(
                registry,
                "getAll"
            )
        ) {

            try {

                const apps =
                    registry.getAll() ||
                    [];

                if (
                    Array.isArray(
                        apps
                    )
                ) {

                    apps.forEach(
                        app => {

                            if (
                                app &&
                                app.id &&
                                !state.apps.has(
                                    normalizeId(
                                        app.id
                                    )
                                )
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

                }

            } catch (exception) {

                reportError(
                    exception,
                    "Registry Discovery"
                );

            }

        }


        emit(
            "apps-synchronized",
            {
                count:
                    state.apps.size
            }
        );


        return Array.from(
            state.apps.values()
        );

    }


    /* ========================================================
       10 — GET APP
       ======================================================== */

    function getApp(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return null;

        }


        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "get"
            )
        ) {

            try {

                const app =
                    manager.get(
                        id
                    );


                if (app) {

                    state.apps.set(
                        id,
                        app
                    );


                    return app;

                }

            } catch (exception) {

                reportError(
                    exception,
                    "App Lookup"
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


    function getApps() {

        syncApps();

        return Array.from(
            state.apps.values()
        );

    }


    function hasApp(
        appId
    ) {

        return !!getApp(
            appId
        );

    }


    /* ========================================================
       11 — OPEN APP
       ======================================================== */

    async function openApp(
        appId,
        options = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            reportError(
                new Error(
                    "Keine App-ID angegeben."
                ),
                "openApp"
            );

            return null;

        }


        const app =
            getApp(
                id
            );


        if (!app) {

            reportError(
                new Error(
                    "App nicht gefunden: " +
                    id
                ),
                "openApp"
            );

            return null;

        }


        if (
            app.enabled ===
            false
        ) {

            warn(
                "App deaktiviert:",
                id
            );

            return null;

        }


        const manager =
            getAppManager();


        if (
            !manager ||
            !hasMethod(
                manager,
                "open"
            )
        ) {

            reportError(
                new Error(
                    "App Manager nicht verfügbar."
                ),
                "openApp"
            );

            return null;

        }


        try {

            emit(
                "app:opening",
                {

                    app,

                    appId:
                        id,

                    options

                }
            );


            const result =
                await manager.open(
                    id,
                    options
                );


            if (!result) {

                emit(
                    "app:error",
                    {

                        app,

                        appId:
                            id,

                        operation:
                            "open"

                    }
                );

                return null;

            }


            state.running.set(
                id,
                {

                    appId:
                        id,

                    app,

                    window:
                        result.window ||
                        null,

                    openedAt:
                        Date.now(),

                    options:
                        clone(
                            options
                        )

                }
            );


            state.statistics.opens +=
                1;


            emit(
                "app:opened",
                {

                    app,

                    appId:
                        id,

                    window:
                        result.window ||
                        null,

                    state:
                        result.state ||
                        null,

                    options

                }
            );


            return result;

        } catch (exception) {

            reportError(
                exception,
                "App Öffnen: " +
                id
            );


            emit(
                "app:error",
                {

                    app,

                    appId:
                        id,

                    operation:
                        "open",

                    error:
                        exception.message

                }
            );


            return null;

        }

    }


    /* ========================================================
       12 — CLOSE APP
       ======================================================== */

    async function closeApp(
        appId,
        options = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        const manager =
            getAppManager();


        if (
            !manager ||
            !hasMethod(
                manager,
                "close"
            )
        ) {

            return false;

        }


        const app =
            getApp(
                id
            );


        try {

            emit(
                "app:closing",
                {

                    app,

                    appId:
                        id,

                    options

                }
            );


            const result =
                await manager.close(
                    id,
                    options
                );


            state.running.delete(
                id
            );


            state.statistics.closes +=
                1;


            emit(
                "app:closed",
                {

                    app,

                    appId:
                        id,

                    options

                }
            );


            return result;

        } catch (exception) {

            reportError(
                exception,
                "App Schließen: " +
                id
            );


            emit(
                "app:error",
                {

                    app,

                    appId:
                        id,

                    operation:
                        "close",

                    error:
                        exception.message

                }
            );


            return false;

        }

    }


    /* ========================================================
       13 — ACTIVATE
       ======================================================== */

    async function activateApp(
        appId
    ) {

        const manager =
            getAppManager();


        if (
            !manager ||
            !hasMethod(
                manager,
                "activate"
            )
        ) {

            return false;

        }


        const id =
            normalizeId(
                appId
            );


        const app =
            getApp(
                id
            );


        try {

            const result =
                await manager.activate(
                    id
                );


            state.statistics.activations +=
                1;


            emit(
                "app:activated",
                {

                    app,

                    appId:
                        id

                }
            );


            return result;

        } catch (exception) {

            reportError(
                exception,
                "App Aktivierung: " +
                id
            );


            return false;

        }

    }


    /* ========================================================
       14 — DEACTIVATE
       ======================================================== */

    async function deactivateApp(
        appId
    ) {

        const manager =
            getAppManager();


        if (
            !manager ||
            !hasMethod(
                manager,
                "deactivate"
            )
        ) {

            return false;

        }


        const id =
            normalizeId(
                appId
            );


        const app =
            getApp(
                id
            );


        try {

            const result =
                await manager.deactivate(
                    id
                );


            state.statistics.deactivations +=
                1;


            emit(
                "app:deactivated",
                {

                    app,

                    appId:
                        id

                }
            );


            return result;

        } catch (exception) {

            reportError(
                exception,
                "App Deaktivierung: " +
                id
            );


            return false;

        }

    }


    /* ========================================================
       15 — RUNNING APPS
       ======================================================== */

    function getRunningApps() {

        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "getAllOpenApps"
            )
        ) {

            try {

                const apps =
                    manager.getAllOpenApps();

                if (
                    Array.isArray(
                        apps
                    )
                ) {

                    return apps;

                }

            } catch (exception) {

                reportError(
                    exception,
                    "Running Apps"
                );

            }

        }


        return Array.from(
            state.running.values()
        )
        .map(
            item => clone(
                item
            )
        );

    }


    function isRunning(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "getAppState"
            )
        ) {

            try {

                const appState =
                    manager.getAppState(
                        id
                    );


                if (
                    appState &&
                    appState.open ===
                    true
                ) {

                    return true;

                }

            } catch (_) {}

        }


        return state.running.has(
            id
        );

    }


    /* ========================================================
       16 — ACTIVE APP
       ======================================================== */

    function getActiveApp() {

        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "getActiveApp"
            )
        ) {

            try {

                return manager.getActiveApp();

            } catch (_) {}

        }


        return null;

    }


    function getActiveAppId() {

        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "getActiveAppId"
            )
        ) {

            try {

                return manager.getActiveAppId();

            } catch (_) {}

        }


        return null;

    }


    /* ========================================================
       17 — APP STATE
       ======================================================== */

    function getAppState(
        appId
    ) {

        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "getAppState"
            )
        ) {

            try {

                return manager.getAppState(
                    appId
                );

            } catch (exception) {

                reportError(
                    exception,
                    "App State"
                );

            }

        }


        return null;

    }


    /* ========================================================
       18 — SEARCH
       ======================================================== */

    function searchApps(
        query
    ) {

        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "search"
            )
        ) {

            try {

                return manager.search(
                    query
                );

            } catch (exception) {

                reportError(
                    exception,
                    "App Search"
                );

            }

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


        return getApps()
            .filter(
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
       19 — CATEGORY
       ======================================================== */

    function getAppsByCategory(
        category
    ) {

        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "getByCategory"
            )
        ) {

            try {

                return manager.getByCategory(
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


        return getApps()
            .filter(
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
       20 — CONNECTIONS
       ======================================================== */

    function refreshConnections() {

        state.connections = {

            appManager:
                !!getAppManager(),

            registry:
                !!getRegistry(),

            router:
                !!getRouter(),

            windowManager:
                !!getWindowManager(),

            kernel:
                !!getKernel(),

            system:
                !!getSystem(),

            storage:
                !!getStorage(),

            launcher:
                !!getLauncher(),

            ai:
                !!getAI(),

            language:
                !!getLanguage(),

            voice:
                !!getVoice(),

            notifications:
                !!getNotifications(),

            keyboard:
                !!getKeyboard()

        };


        return {
            ...state.connections
        };

    }


    function getConnectionStatus() {

        return refreshConnections();

    }


    /* ========================================================
       21 — PLATFORM STATE
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            initializing:
                state.initializing,

            ready:
                state.ready,

            failed:
                state.failed,

            platformReady:
                state.platformReady,

            appCount:
                state.apps.size,

            runningAppCount:
                getRunningApps().length,

            activeApp:
                getActiveAppId(),

            connections:
                getConnectionStatus(),

            statistics:
                {
                    ...state.statistics
                },

            createdAt:
                state.createdAt

        };

    }


    /* ========================================================
       22 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        syncApps();


        return {

            name:
                NAME,

            version:
                VERSION,

            module:
                MODULE_ID,

            state:
                getState(),

            connections:
                getConnectionStatus(),

            apps:
                getApps().map(
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

                        running:
                            isRunning(
                                app.id
                            ),

                        state:
                            getAppState(
                                app.id
                            )

                    })
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       23 — HEALTH
       ======================================================== */

    function healthCheck() {

        refreshConnections();


        const problems = [];


        if (
            !state.connections.appManager
        ) {

            problems.push(
                "App Manager nicht verbunden."
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
            !state.connections.kernel
        ) {

            problems.push(
                "Kernel nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length ===
                0,

            problems,

            appCount:
                state.apps.size,

            runningAppCount:
                getRunningApps().length,

            activeApp:
                getActiveAppId(),

            connections:
                getConnectionStatus(),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       24 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


        /* Events */

        on,

        off,

        emit,


        /* Discovery */

        syncApps,

        getApp,

        getApps,

        hasApp,


        /* Lifecycle */

        openApp,

        closeApp,

        activateApp,

        deactivateApp,


        /* Running */

        getRunningApps,

        isRunning,


        /* Active */

        getActiveApp,

        getActiveAppId,


        /* State */

        getAppState,


        /* Search */

        searchApps,

        getAppsByCategory,


        /* Connections */

        refreshConnections,

        getConnectionStatus,


        /* Platform */

        getState,


        /* Diagnostics */

        diagnostics,

        healthCheck,


        /* Error */

        reportError

    };


    /* ========================================================
       25 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppPlatform =
        api;

    window.HalDoOSAppPlatform =
        api;

    HalDoOS.appPlatform =
        api;


    /* ========================================================
       26 — INITIALIZATION
       ======================================================== */

    function initialize() {

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

            syncApps();


            state.ready =
                true;

            state.platformReady =
                true;

            state.initializing =
                false;


            emit(
                "ready",
                {

                    version:
                        VERSION,

                    appCount:
                        state.apps.size,

                    connections:
                        getConnectionStatus()

                }
            );


            /*
             * Bridge-Signal
             */

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        "haldo:platform-ready",
                        {
                            detail: api
                        }
                    )
                );

            } catch (_) {}


            /*
             * Kernel informieren
             */

            const kernel =
                getKernel();


            if (
                kernel &&
                hasMethod(
                    kernel,
                    "registerModule"
                )
            ) {

                try {

                    kernel.registerModule(
                        MODULE_ID,
                        api
                    );

                } catch (_) {}

            }


            if (
                kernel &&
                hasMethod(
                    kernel,
                    "setModuleReady"
                )
            ) {

                try {

                    kernel.setModuleReady(
                        MODULE_ID,
                        true
                    );

                } catch (_) {}

            }


            log(
                "HalDo AI OS 20 App Platform bereit.",
                "Apps:",
                state.apps.size
            );


            return api;

        } catch (exception) {

            state.initializing =
                false;

            state.failed =
                true;


            reportError(
                exception,
                "App Platform Initialisierung"
            );


            return api;

        }

    }


    /* ========================================================
       27 — BOOT
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
                        "App Platform Boot"
                    );

                }
            );

    }


    /* ========================================================
       28 — DOM START
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
       END
       HALDO AI OS 20
       CENTRAL APP PLATFORM
       ======================================================== */

})(window, document);