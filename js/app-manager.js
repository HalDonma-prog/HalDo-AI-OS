/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei: js/app-manager.js

   ZENTRALER APPLICATION MANAGER

   Architektur:

       HALDO AI OS
            │
          KERNEL
            │
            ▼
       APP REGISTRY
            │
            ▼
       APP MANAGER
        │    │    │
        │    │    └──── APP STATE
        │    │
        │    └───────── LIFECYCLE
        │
        ├────────────── ROUTER
        │
        ├────────────── WINDOW MANAGER
        │
        ├────────────── LAUNCHER
        │
        └────────────── AI / SYSTEM

   Aufgaben:

   • Apps verwalten
   • Apps öffnen
   • Apps schließen
   • Apps starten
   • Apps stoppen
   • Apps minimieren
   • Apps wiederherstellen
   • App-Zustände
   • App-Instanzen
   • Singleton Apps
   • Multi-Window Apps
   • App Events
   • App Settings
   • App Storage
   • Dependencies
   • Permissions
   • Registry-Verbindung
   • Router-Verbindung
   • Window-Manager-Verbindung
   • Kernel-Verbindung
   • System-Verbindung
   • Diagnostics
   • Health Check
   • Fehlerbehandlung
   • zukünftige Erweiterbarkeit

   WICHTIG:

   Diese Datei erzeugt KEINE erfundene 79er-App-Liste.

   Die vollständige App-Liste kommt zentral über
   die App Registry und wird später gemeinsam mit
   den tatsächlichen App-Modulen aufgebaut.

   Bestehende APIs bleiben kompatibel.

   ============================================================ */

(function (window, document) {

    "use strict";


    /* ========================================================
       01 — HALDO OS FOUNDATION
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

    const EDITION =
        "Professional Ultimate Foundation";


    /* ========================================================
       03 — STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        initializing:
            false,

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
                false

        },

        apps:
            new Map(),

        instances:
            new Map(),

        activeAppId:
            null,

        activeInstanceId:
            null,

        listeners:
            new Map(),

        statistics: {

            registered:
                0,

            opened:
                0,

            closed:
                0,

            started:
                0,

            stopped:
                0,

            minimized:
                0,

            restored:
                0,

            errors:
                0

        },

        errors:
            [],

        history:
            []

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


    function logError() {

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
                function (key) {

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
            window.HalDoAppLauncher ||
            HalDoOS.launcher ||
            HalDoOS.appLauncher ||
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
                function (callback) {

                    try {

                        callback(
                            data
                        );

                    } catch (exception) {

                        logError(
                            "Event listener error:",
                            exception
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

    }


    /* ========================================================
       08 — ERROR SYSTEM
       ======================================================== */

    function reportError(
        code,
        exception,
        extra = null
    ) {

        state.statistics.errors +=
            1;


        const record = {

            code:
                code ||
                "APP_MANAGER_ERROR",

            message:
                exception instanceof Error
                    ? exception.message
                    : String(
                        exception ||
                        "Unbekannter Fehler"
                    ),

            name:
                exception instanceof Error
                    ? exception.name
                    : "Error",

            stack:
                exception instanceof Error
                    ? (
                        exception.stack ||
                        ""
                    )
                    : "",

            extra:
                extra,

            timestamp:
                new Date().toISOString()

        };


        state.errors.push(
            record
        );


        if (
            state.errors.length >
            100
        ) {

            state.errors.shift();

        }


        logError(
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
                    exception ||
                    new Error(
                        record.message
                    ),
                    "App Manager: " +
                    record.code
                );

            } catch (_) {}

        }


        return record;

    }


    /* ========================================================
       09 — HISTORY
       ======================================================== */

    function addHistory(
        action,
        appId,
        instanceId = null
    ) {

        state.history.push({

            action,

            appId:

                appId ||
                null,

            instanceId,

            timestamp:
                Date.now()

        });


        if (
            state.history.length >
            200
        ) {

            state.history.shift();

        }

    }


    /* ========================================================
       10 — APP CONFIGURATION
       ======================================================== */

    function normalizeApp(
        definition
    ) {

        if (
            !definition ||
            typeof definition !==
            "object"
        ) {

            return null;

        }


        const id =
            normalizeId(
                definition.id ||
                definition.appId ||
                definition.name ||
                definition.title
            );


        if (!id) {

            return null;

        }


        return {

            ...definition,

            id,

            appId:
                id,

            name:
                definition.name ||
                id,

            title:
                definition.title ||
                definition.name ||
                id,

            description:
                definition.description ||
                "",

            category:
                definition.category ||
                "system",

            icon:
                definition.icon ||
                "◈",

            version:
                definition.version ||
                VERSION,

            enabled:
                definition.enabled !==
                false,

            system:
                definition.system ===
                true,

            singleton:
                definition.singleton !==
                false,

            status:
                definition.status ||
                "registered",

            route:
                definition.route ||
                null,

            entry:
                definition.entry ||
                null,

            dependencies:
                Array.isArray(
                    definition.dependencies
                )
                    ? [
                        ...definition.dependencies
                    ]
                    : [],

            permissions:
                Array.isArray(
                    definition.permissions
                )
                    ? [
                        ...definition.permissions
                    ]
                    : [],

            tags:
                Array.isArray(
                    definition.tags
                )
                    ? [
                        ...definition.tags
                    ]
                    : [],

            keywords:
                Array.isArray(
                    definition.keywords
                )
                    ? [
                        ...definition.keywords
                    ]
                    : [],

            settings:
                (
                    definition.settings &&
                    typeof definition.settings ===
                    "object"
                )
                    ? {
                        ...definition.settings
                    }
                    : {},

            metadata:
                (
                    definition.metadata &&
                    typeof definition.metadata ===
                    "object"
                )
                    ? {
                        ...definition.metadata
                    }
                    : {}

        };

    }


    /* ========================================================
       11 — REGISTRY SYNCHRONIZATION
       ======================================================== */

    function syncFromRegistry() {

        const registry =
            getRegistry();


        if (
            !registry
        ) {

            state.connections.registry =
                false;

            return 0;

        }


        state.connections.registry =
            true;


        try {

            let apps = [];


            if (
                hasMethod(
                    registry,
                    "getAll"
                )
            ) {

                apps =
                    registry.getAll();

            }
            else if (
                hasMethod(
                    registry,
                    "getApps"
                )
            ) {

                apps =
                    registry.getApps();

            }


            if (
                !Array.isArray(
                    apps
                )
            ) {

                return 0;

            }


            apps.forEach(
                function (definition) {

                    const app =
                        normalizeApp(
                            definition
                        );


                    if (!app) {

                        return;

                    }


                    state.apps.set(
                        app.id,
                        app
                    );

                }
            );


            emit(
                "registry-synced",
                {
                    count:
                        state.apps.size
                }
            );


            return state.apps.size;

        } catch (exception) {

            reportError(
                "REGISTRY_SYNC_ERROR",
                exception
            );


            return 0;

        }

    }


    /* ========================================================
       12 — REGISTER APP LOCALLY
       ======================================================== */

    function register(
        definition
    ) {

        const app =
            normalizeApp(
                definition
            );


        if (!app) {

            reportError(
                "INVALID_APP",
                new Error(
                    "Ungültige App-Konfiguration."
                ),
                {
                    definition
                }
            );


            return null;

        }


        const existing =
            state.apps.get(
                app.id
            );


        state.apps.set(
            app.id,
            app
        );


        if (!existing) {

            state.statistics.registered +=
                1;

        }


        emit(
            existing
                ? "app-updated"
                : "app-registered",
            {
                app,
                previous:
                    existing ||
                    null
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


    function registerApps(
        definitions
    ) {

        if (
            !Array.isArray(
                definitions
            )
        ) {

            return [];

        }


        return definitions
            .map(
                register
            )
            .filter(
                Boolean
            );

    }


    /* ========================================================
       13 — GET APPS
       ======================================================== */

    function get(
        id
    ) {

        const normalized =
            normalizeId(
                id
            );


        if (!normalized) {

            return null;

        }


        return (
            state.apps.get(
                normalized
            ) ||
            null
        );

    }


    function getApp(
        id
    ) {

        return get(
            id
        );

    }


    function getAll() {

        return Array.from(
            state.apps.values()
        );

    }


    function getApps() {

        return getAll();

    }


    function has(
        id
    ) {

        const normalized =
            normalizeId(
                id
            );


        return (
            !!normalized &&
            state.apps.has(
                normalized
            )
        );

    }


    /* ========================================================
       14 — SEARCH
       ======================================================== */

    function find(
        query
    ) {

        const value =
            String(
                query || ""
            )
            .trim()
            .toLowerCase();


        if (!value) {

            return [];

        }


        return getAll()
            .filter(
                function (app) {

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
                        function (field) {

                            return String(
                                field || ""
                            )
                            .toLowerCase()
                            .includes(
                                value
                            );

                        }
                    );

                }
            );

    }


    function search(
        query
    ) {

        return find(
            query
        );

    }


    function getByCategory(
        category
    ) {

        const value =
            String(
                category || ""
            )
            .trim()
            .toLowerCase();


        if (!value) {

            return [];

        }


        return getAll()
            .filter(
                function (app) {

                    return String(
                        app.category ||
                        ""
                    )
                    .toLowerCase() ===
                    value;

                }
            );

    }


    /* ========================================================
       15 — INSTANCE ID
       ======================================================== */

    function createInstanceId(
        appId
    ) {

        return (
            appId +
            "-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8)
        );

    }


    /* ========================================================
       16 — INSTANCE CREATION
       ======================================================== */

    function createInstance(
        app,
        options = {}
    ) {

        const instance = {

            id:
                createInstanceId(
                    app.id
                ),

            instanceId:
                null,

            appId:
                app.id,

            state:
                "created",

            status:
                "created",

            minimized:
                false,

            active:
                false,

            opened:
                false,

            started:
                false,

            createdAt:
                Date.now(),

            openedAt:
                null,

            startedAt:
                null,

            closedAt:
                null,

            settings:
                {
                    ...(app.settings || {}),
                    ...(options.settings || {})
                },

            data:
                {
                    ...(options.data || {})
                },

            window:
                null,

            element:
                null,

            context:
                options.context ||
                null,

            options:
                {
                    ...options
                }

        };


        instance.instanceId =
            instance.id;


        state.instances.set(
            instance.id,
            instance
        );


        return instance;

    }


    /* ========================================================
       17 — GET INSTANCES
       ======================================================== */

    function getInstance(
        instanceId
    ) {

        return (
            state.instances.get(
                instanceId
            ) ||
            null
        );

    }


    function getInstances(
        appId = null
    ) {

        const values =
            Array.from(
                state.instances.values()
            );


        if (!appId) {

            return values;

        }


        const normalized =
            normalizeId(
                appId
            );


        return values.filter(
            function (instance) {

                return (
                    instance.appId ===
                    normalized
                );

            }
        );

    }


    function getActiveInstance() {

        if (
            !state.activeInstanceId
        ) {

            return null;

        }


        return getInstance(
            state.activeInstanceId
        );

    }


    /* ========================================================
       18 — DEPENDENCY CHECK
       ======================================================== */

    function getMissingDependencies(
        app
    ) {

        if (!app) {

            return [];

        }


        return (
            app.dependencies ||
            []
        )
        .filter(
            function (dependency) {

                const id =
                    normalizeId(
                        dependency
                    );


                if (!id) {

                    return true;

                }


                const dependencyApp =
                    get(
                        id
                    );


                if (!dependencyApp) {

                    const registry =
                        getRegistry();


                    if (
                        registry &&
                        hasMethod(
                            registry,
                            "get"
                        )
                    ) {

                        return !registry.get(
                            id
                        );

                    }


                    return true;

                }


                return (
                    dependencyApp.enabled ===
                    false
                );

            }
        );

    }


    function checkDependencies(
        app
    ) {

        return (
            getMissingDependencies(
                app
            ).length ===
            0
        );

    }


    /* ========================================================
       19 — ROUTER CONNECTION
       ======================================================== */

    function routeToApp(
        app,
        instance,
        options
    ) {

        const router =
            getRouter();


        if (!router) {

            state.connections.router =
                false;

            return true;

        }


        state.connections.router =
            true;


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

                        instanceId:
                            instance.id,

                        options:
                            options || {}

                    }
                );

            }
            else if (
                hasMethod(
                    router,
                    "open"
                )
            ) {

                router.open(
                    app.id,
                    options || {}
                );

            }


            return true;

        } catch (exception) {

            reportError(
                "ROUTER_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    instanceId:
                        instance.id
                }
            );


            return false;

        }

    }


    /* ========================================================
       20 — WINDOW MANAGER
       ======================================================== */

    function createWindow(
        app,
        instance,
        options
    ) {

        const manager =
            getWindowManager();


        if (!manager) {

            state.connections.windowManager =
                false;

            return null;

        }


        state.connections.windowManager =
            true;


        try {

            let result =
                null;


            if (
                hasMethod(
                    manager,
                    "open"
                )
            ) {

                result =
                    manager.open(
                        {
                            id:
                                app.id,

                            appId:
                                app.id,

                            instanceId:
                                instance.id,

                            title:
                                app.title,

                            icon:
                                app.icon,

                            route:
                                app.route,

                            ...(
                                options ||
                                {}
                            )

                        }
                    );

            }
            else if (
                hasMethod(
                    manager,
                    "createWindow"
                )
            ) {

                result =
                    manager.createWindow(
                        {
                            id:
                                app.id,

                            appId:
                                app.id,

                            instanceId:
                                instance.id,

                            title:
                                app.title,

                            icon:
                                app.icon

                        }
                    );

            }


            instance.window =
                result;


            return result;

        } catch (exception) {

            reportError(
                "WINDOW_MANAGER_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    instanceId:
                        instance.id
                }
            );


            return null;

        }

    }


    /* ========================================================
       21 — APP LIFECYCLE: INIT
       ======================================================== */

    async function initializeApp(
        app,
        instance
    ) {

        if (!app) {

            return false;

        }


        try {

            if (
                typeof app.init ===
                "function"
            ) {

                const result =
                    app.init(
                        createAppContext(
                            app,
                            instance
                        )
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }


            return true;

        } catch (exception) {

            reportError(
                "APP_INIT_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    instanceId:
                        instance.id
                }
            );


            return false;

        }

    }


    /* ========================================================
       22 — APP LIFECYCLE: START
       ======================================================== */

    async function startInstance(
        instance
    ) {

        const app =
            get(
                instance.appId
            );


        if (!app) {

            return false;

        }


        try {

            if (
                typeof app.start ===
                "function"
            ) {

                const result =
                    app.start(
                        createAppContext(
                            app,
                            instance
                        )
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }


            instance.started =
                true;

            instance.state =
                "running";

            instance.status =
                "running";

            instance.startedAt =
                Date.now();


            state.statistics.started +=
                1;


            emit(
                "app-started",
                {
                    app,
                    instance
                }
            );


            return true;

        } catch (exception) {

            instance.state =
                "error";

            instance.status =
                "error";


            reportError(
                "APP_START_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    instanceId:
                        instance.id
                }
            );


            return false;

        }

    }


    /* ========================================================
       23 — OPEN APP
       ======================================================== */

    async function open(
        appId,
        options = {}
    ) {

        const normalized =
            normalizeId(
                appId
            );


        if (!normalized) {

            reportError(
                "INVALID_APP_ID",
                new Error(
                    "Keine gültige App-ID."
                )
            );


            return null;

        }


        let app =
            get(
                normalized
            );


        /*
         * Falls der Manager noch nicht
         * synchronisiert wurde.
         */

        if (!app) {

            syncFromRegistry();

            app =
                get(
                    normalized
                );

        }


        if (!app) {

            reportError(
                "APP_NOT_FOUND",
                new Error(
                    "App nicht gefunden: " +
                    normalized
                ),
                {
                    appId:
                        normalized
                }
            );


            return null;

        }


        if (
            app.enabled ===
            false
        ) {

            reportError(
                "APP_DISABLED",
                new Error(
                    "App ist deaktiviert: " +
                    normalized
                ),
                {
                    appId:
                        normalized
                }
            );


            return null;

        }


        const missing =
            getMissingDependencies(
                app
            );


        if (
            missing.length
        ) {

            reportError(
                "APP_DEPENDENCIES_MISSING",
                new Error(
                    "Fehlende Abhängigkeiten."
                ),
                {
                    appId:
                        app.id,

                    missing
                }
            );


            return null;

        }


        /*
         * Singleton:
         * bereits offene Instanz wiederverwenden.
         */

        if (
            app.singleton !==
            false
        ) {

            const existingInstances =
                getInstances(
                    app.id
                );


            const existing =
                existingInstances.find(
                    function (instance) {

                        return (
                            instance.state !==
                                "closed" &&
                            instance.state !==
                                "error"
                        );

                    }
                );


            if (existing) {

                await restore(
                    existing.id
                );


                await activate(
                    existing.id
                );


                return existing;

            }

        }


        const instance =
            createInstance(
                app,
                options
            );


        instance.opened =
            true;

        instance.state =
            "opening";

        instance.status =
            "opening";

        instance.openedAt =
            Date.now();


        emit(
            "app-opening",
            {
                app,
                instance,
                options
            }
        );


        const initialized =
            await initializeApp(
                app,
                instance
            );


        if (!initialized) {

            instance.state =
                "error";

            instance.status =
                "error";

            return null;

        }


        routeToApp(
            app,
            instance,
            options
        );


        createWindow(
            app,
            instance,
            options
        );


        const started =
            await startInstance(
                instance
            );


        if (!started) {

            return null;

        }


        /*
         * App open callback
         */

        try {

            if (
                typeof app.open ===
                "function"
            ) {

                const result =
                    app.open(
                        createAppContext(
                            app,
                            instance
                        )
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }

        } catch (exception) {

            reportError(
                "APP_OPEN_CALLBACK_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    instanceId:
                        instance.id
                }
            );

        }


        await activate(
            instance.id
        );


        state.statistics.opened +=
            1;


        addHistory(
            "open",
            app.id,
            instance.id
        );


        emit(
            "app-opened",
            {
                app,
                instance
            }
        );


        return instance;

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
       24 — ACTIVATE
       ======================================================== */

    async function activate(
        instanceId
    ) {

        const instance =
            getInstance(
                instanceId
            );


        if (!instance) {

            return false;

        }


        const app =
            get(
                instance.appId
            );


        if (!app) {

            return false;

        }


        /*
         * Vorher aktive Instanz deaktivieren.
         */

        if (
            state.activeInstanceId &&
            state.activeInstanceId !==
                instance.id
        ) {

            await deactivate(
                state.activeInstanceId
            );

        }


        instance.active =
            true;

        instance.minimized =
            false;

        instance.state =
            "active";

        instance.status =
            "active";


        state.activeInstanceId =
            instance.id;

        state.activeAppId =
            app.id;


        try {

            if (
                typeof app.onActivate ===
                "function"
            ) {

                const result =
                    app.onActivate(
                        createAppContext(
                            app,
                            instance
                        )
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }

        } catch (exception) {

            reportError(
                "APP_ACTIVATE_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    instanceId:
                        instance.id
                }
            );

        }


        /*
         * Window Manager aktivieren.
         */

        const windowManager =
            getWindowManager();


        if (
            windowManager
        ) {

            try {

                if (
                    hasMethod(
                        windowManager,
                        "focus"
                    )
                ) {

                    windowManager.focus(
                        instance.window ||
                        instance.id
                    );

                }
                else if (
                    hasMethod(
                        windowManager,
                        "activate"
                    )
                ) {

                    windowManager.activate(
                        instance.window ||
                        instance.id
                    );

                }

            } catch (_) {}

        }


        emit(
            "app-activated",
            {
                app,
                instance
            }
        );


        return true;

    }


    /* ========================================================
       25 — DEACTIVATE
       ======================================================== */

    async function deactivate(
        instanceId
    ) {

        const instance =
            getInstance(
                instanceId
            );


        if (!instance) {

            return false;

        }


        const app =
            get(
                instance.appId
            );


        if (!app) {

            return false;

        }


        instance.active =
            false;


        if (
            instance.state ===
            "active"
        ) {

            instance.state =
                "running";

        }


        if (
            instance.status ===
            "active"
        ) {

            instance.status =
                "running";

        }


        try {

            if (
                typeof app.onDeactivate ===
                "function"
            ) {

                const result =
                    app.onDeactivate(
                        createAppContext(
                            app,
                            instance
                        )
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }

        } catch (exception) {

            reportError(
                "APP_DEACTIVATE_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    instanceId:
                        instance.id
                }
            );

        }


        if (
            state.activeInstanceId ===
            instance.id
        ) {

            state.activeInstanceId =
                null;

            state.activeAppId =
                null;

        }


        emit(
            "app-deactivated",
            {
                app,
                instance
            }
        );


        return true;

    }


    /* ========================================================
       26 — MINIMIZE
       ======================================================== */

    async function minimize(
        instanceId
    ) {

        const instance =
            getInstance(
                instanceId
            );


        if (!instance) {

            return false;

        }


        const app =
            get(
                instance.appId
            );


        if (!app) {

            return false;

        }


        await deactivate(
            instance.id
        );


        instance.minimized =
            true;

        instance.state =
            "minimized";

        instance.status =
            "minimized";


        state.statistics.minimized +=
            1;


        const manager =
            getWindowManager();


        if (
            manager
        ) {

            try {

                if (
                    hasMethod(
                        manager,
                        "minimize"
                    )
                ) {

                    manager.minimize(
                        instance.window ||
                        instance.id
                    );

                }

            } catch (_) {}

        }


        if (
            typeof app.minimize ===
            "function"
        ) {

            try {

                await app.minimize(
                    createAppContext(
                        app,
                        instance
                    )
                );

            } catch (exception) {

                reportError(
                    "APP_MINIMIZE_ERROR",
                    exception
                );

            }

        }


        addHistory(
            "minimize",
            app.id,
            instance.id
        );


        emit(
            "app-minimized",
            {
                app,
                instance
            }
        );


        return true;

    }


    /* ========================================================
       27 — RESTORE
       ======================================================== */

    async function restore(
        instanceId
    ) {

        const instance =
            getInstance(
                instanceId
            );


        if (!instance) {

            return false;

        }


        const app =
            get(
                instance.appId
            );


        if (!app) {

            return false;

        }


        instance.minimized =
            false;

        instance.state =
            "running";

        instance.status =
            "running";


        const manager =
            getWindowManager();


        if (
            manager
        ) {

            try {

                if (
                    hasMethod(
                        manager,
                        "restore"
                    )
                ) {

                    manager.restore(
                        instance.window ||
                        instance.id
                    );

                }

            } catch (_) {}

        }


        if (
            typeof app.restore ===
            "function"
        ) {

            try {

                await app.restore(
                    createAppContext(
                        app,
                        instance
                    )
                );

            } catch (exception) {

                reportError(
                    "APP_RESTORE_ERROR",
                    exception
                );

            }

        }


        state.statistics.restored +=
            1;


        addHistory(
            "restore",
            app.id,
            instance.id
        );


        emit(
            "app-restored",
            {
                app,
                instance
            }
        );


        return true;

    }


    /* ========================================================
       28 — STOP
       ======================================================== */

    async function stop(
        instanceId
    ) {

        const instance =
            getInstance(
                instanceId
            );


        if (!instance) {

            return false;

        }


        const app =
            get(
                instance.appId
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
                        createAppContext(
                            app,
                            instance
                        )
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }

        } catch (exception) {

            reportError(
                "APP_STOP_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    instanceId:
                        instance.id
                }
            );

        }


        instance.started =
            false;

        instance.state =
            "stopped";

        instance.status =
            "stopped";


        state.statistics.stopped +=
            1;


        addHistory(
            "stop",
            app.id,
            instance.id
        );


        emit(
            "app-stopped",
            {
                app,
                instance
            }
        );


        return true;

    }


    /* ========================================================
       29 — CLOSE
       ======================================================== */

    async function close(
        instanceId
    ) {

        const instance =
            getInstance(
                instanceId
            );


        if (!instance) {

            return false;

        }


        const app =
            get(
                instance.appId
            );


        if (!app) {

            return false;

        }


        instance.state =
            "closing";

        instance.status =
            "closing";


        await deactivate(
            instance.id
        );


        await stop(
            instance.id
        );


        try {

            if (
                typeof app.close ===
                "function"
            ) {

                const result =
                    app.close(
                        createAppContext(
                            app,
                            instance
                        )
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }

        } catch (exception) {

            reportError(
                "APP_CLOSE_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    instanceId:
                        instance.id
                }
            );

        }


        /*
         * Window schließen
         */

        const manager =
            getWindowManager();


        if (
            manager
        ) {

            try {

                if (
                    hasMethod(
                        manager,
                        "close"
                    )
                ) {

                    manager.close(
                        instance.window ||
                        instance.id
                    );

                }

            } catch (_) {}

        }


        instance.opened =
            false;

        instance.state =
            "closed";

        instance.status =
            "closed";

        instance.closedAt =
            Date.now();


        if (
            state.activeInstanceId ===
            instance.id
        ) {

            state.activeInstanceId =
                null;

            state.activeAppId =
                null;

        }


        state.statistics.closed +=
            1;


        addHistory(
            "close",
            app.id,
            instance.id
        );


        emit(
            "app-closed",
            {
                app,
                instance
            }
        );


        /*
         * Instanz bleibt zunächst im
         * Speicher für Diagnose/History.
         *
         * destroyInstance() entfernt sie
         * endgültig.
         */

        return true;

    }


    function closeApp(
        appId
    ) {

        const instances =
            getInstances(
                appId
            );


        return Promise.all(
            instances.map(
                function (instance) {

                    return close(
                        instance.id
                    );

                }
            )
        );

    }


    /* ========================================================
       30 — DESTROY INSTANCE
       ======================================================== */

    async function destroyInstance(
        instanceId
    ) {

        const instance =
            getInstance(
                instanceId
            );


        if (!instance) {

            return false;

        }


        const app =
            get(
                instance.appId
            );


        if (app) {

            try {

                if (
                    typeof app.destroy ===
                    "function"
                ) {

                    const result =
                        app.destroy(
                            createAppContext(
                                app,
                                instance
                            )
                        );


                    if (
                        result &&
                        typeof result.then ===
                        "function"
                    ) {

                        await result;

                    }

                }

            } catch (exception) {

                reportError(
                    "APP_DESTROY_ERROR",
                    exception
                );

            }

        }


        state.instances.delete(
            instance.id
        );


        emit(
            "instance-destroyed",
            {
                instanceId:
                    instance.id,

                appId:
                    instance.appId
            }
        );


        return true;

    }


    /* ========================================================
       31 — APP CONTEXT
       ======================================================== */

    function createAppContext(
        app,
        instance
    ) {

        return {

            app,

            instance,


            appId:
                app
                    ? app.id
                    : null,


            instanceId:
                instance
                    ? instance.id
                    : null,


            manager:
                api,


            registry:
                getRegistry(),


            kernel:
                getKernel(),


            system:
                getSystem(),


            router:
                getRouter(),


            windowManager:
                getWindowManager(),


            launcher:
                getLauncher(),


            state:
                instance
                    ? instance.data
                    : {},


            settings:
                instance
                    ? instance.settings
                    : {},


            open:
                function (
                    targetAppId,
                    options
                ) {

                    return open(
                        targetAppId,
                        options
                    );

                },


            close:
                function () {

                    return close(
                        instance.id
                    );

                },


            minimize:
                function () {

                    return minimize(
                        instance.id
                    );

                },


            restore:
                function () {

                    return restore(
                        instance.id
                    );

                },


            activate:
                function () {

                    return activate(
                        instance.id
                    );

                },


            emit:
                function (
                    event,
                    data
                ) {

                    emit(
                        event,
                        {
                            app,
                            instance,
                            data
                        }
                    );

                }

        };

    }


    /* ========================================================
       32 — APP STATE
       ======================================================== */

    function getAppState(
        appId
    ) {

        const instances =
            getInstances(
                appId
            );


        return {

            appId:
                normalizeId(
                    appId
                ),

            instances:
                instances.length,

            active:
                instances.some(
                    instance =>
                        instance.active
                ),

            minimized:
                instances.some(
                    instance =>
                        instance.minimized
                ),

            running:
                instances.some(
                    instance =>
                        instance.state ===
                        "running" ||
                        instance.state ===
                        "active"
                ),

            instancesData:
                instances.map(
                    function (instance) {

                        return {

                            id:
                                instance.id,

                            state:
                                instance.state,

                            status:
                                instance.status,

                            active:
                                instance.active,

                            minimized:
                                instance.minimized,

                            opened:
                                instance.opened,

                            started:
                                instance.started

                        };

                    }
                )

        };

    }


    /* ========================================================
       33 — ACTIVE APP
       ======================================================== */

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

        return (
            state.activeAppId ||
            null
        );

    }


    /* ========================================================
       34 — CLOSE ALL
       ======================================================== */

    async function closeAll() {

        const instances =
            Array.from(
                state.instances.values()
            )
            .filter(
                instance =>
                    instance.state !==
                    "closed"
            );


        for (
            const instance of instances
        ) {

            await close(
                instance.id
            );

        }


        return true;

    }


    /* ========================================================
       35 — CONNECTIONS
       ======================================================== */

    function connectToKernel() {

        const kernel =
            getKernel();


        if (!kernel) {

            state.connections.kernel =
                false;

            return false;

        }


        state.connections.kernel =
            true;


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


            return true;

        } catch (exception) {

            reportError(
                "KERNEL_CONNECTION_ERROR",
                exception
            );


            return false;

        }

    }


    function connectToSystem() {

        const system =
            getSystem();


        if (!system) {

            state.connections.system =
                false;

            return false;

        }


        state.connections.system =
            true;


        try {

            if (
                hasMethod(
                    system,
                    "registerService"
                )
            ) {

                system.registerService(
                    MODULE_ID,
                    api
                );

            }
            else if (
                hasMethod(
                    system,
                    "registerModule"
                )
            ) {

                system.registerModule(
                    MODULE_ID,
                    api
                );

            }


            return true;

        } catch (exception) {

            reportError(
                "SYSTEM_CONNECTION_ERROR",
                exception
            );


            return false;

        }

    }


    function refreshConnections() {

        connectToKernel();

        connectToSystem();


        state.connections.registry =
            !!getRegistry();

        state.connections.router =
            !!getRouter();

        state.connections.windowManager =
            !!getWindowManager();

        state.connections.launcher =
            !!getLauncher();


        return getConnectionStatus();

    }


    function getConnectionStatus() {

        return {

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
       36 — STATISTICS
       ======================================================== */

    function getStatistics() {

        return {

            ...state.statistics,

            appCount:
                state.apps.size,

            instanceCount:
                state.instances.size,

            activeAppId:
                state.activeAppId,

            activeInstanceId:
                state.activeInstanceId

        };

    }


    /* ========================================================
       37 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        return {

            name:
                NAME,

            version:
                VERSION,

            edition:
                EDITION,

            module:
                MODULE_ID,

            initialized:
                state.initialized,

            ready:
                state.ready,

            connections:
                getConnectionStatus(),

            appCount:
                state.apps.size,

            instanceCount:
                state.instances.size,

            activeAppId:
                state.activeAppId,

            activeInstanceId:
                state.activeInstanceId,

            statistics:
                getStatistics(),

            apps:
                getAll().map(
                    function (app) {

                        return {

                            id:
                                app.id,

                            name:
                                app.name,

                            title:
                                app.title,

                            category:
                                app.category,

                            enabled:
                                app.enabled,

                            singleton:
                                app.singleton,

                            dependencies:
                                [
                                    ...(app.dependencies || [])
                                ],

                            missingDependencies:
                                getMissingDependencies(
                                    app
                                ),

                            state:
                                getAppState(
                                    app.id
                                )

                        };

                    }
                ),

            instances:
                Array.from(
                    state.instances.values()
                ).map(
                    function (instance) {

                        return {

                            id:
                                instance.id,

                            appId:
                                instance.appId,

                            state:
                                instance.state,

                            status:
                                instance.status,

                            active:
                                instance.active,

                            minimized:
                                instance.minimized

                        };

                    }
                ),

            errors:
                [
                    ...state.errors
                ],

            history:
                [
                    ...state.history
                ],

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       38 — HEALTH CHECK
       ======================================================== */

    function healthCheck() {

        const connections =
            getConnectionStatus();


        const problems =
            [];


        if (
            !connections.kernel
        ) {

            problems.push(
                "Kernel nicht verbunden."
            );

        }


        if (
            !connections.registry
        ) {

            problems.push(
                "App Registry nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length ===
                0,

            problems,

            connections,

            initialized:
                state.initialized,

            ready:
                state.ready,

            appCount:
                state.apps.size,

            instanceCount:
                state.instances.size,

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       39 — INITIALIZATION
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


        emit(
            "initializing",
            {
                version:
                    VERSION
            }
        );


        refreshConnections();


        /*
         * Registry synchronisieren.
         */

        syncFromRegistry();


        state.ready =
            true;

        state.initializing =
            false;


        emit(
            "ready",
            {
                version:
                    VERSION,

                diagnostics:
                    diagnostics()
            }
        );


        log(
            "App Manager bereit.",
            VERSION
        );


        return api;

    }


    /* ========================================================
       40 — KERNEL READY
       ======================================================== */

    function handleKernelReady() {

        refreshConnections();

        syncFromRegistry();


        emit(
            "kernel-ready",
            {
                diagnostics:
                    diagnostics()
            }
        );

    }


    /* ========================================================
       41 — REGISTRY EVENTS
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
                function (
                    payload
                ) {

                    if (
                        payload &&
                        payload.app
                    ) {

                        register(
                            payload.app
                        );

                    }

                }
            );


            registry.on(
                "updated",
                function (
                    payload
                ) {

                    if (
                        payload &&
                        payload.app
                    ) {

                        register(
                            payload.app
                        );

                    }

                }
            );


            registry.on(
                "removed",
                function (
                    payload
                ) {

                    if (
                        payload &&
                        payload.app
                    ) {

                        state.apps.delete(
                            normalizeId(
                                payload.app.id
                            )
                        );

                    }

                }
            );


            state.connections.registry =
                true;


            return true;

        } catch (exception) {

            reportError(
                "REGISTRY_EVENT_CONNECTION_ERROR",
                exception
            );


            return false;

        }

    }


    /* ========================================================
       42 — GLOBAL EVENTS
       ======================================================== */

    function connectGlobalEvents() {

        const kernel =
            getKernel();


        if (
            kernel &&
            hasMethod(
                kernel,
                "on"
            )
        ) {

            try {

                kernel.on(
                    "kernel:ready",
                    handleKernelReady
                );

            } catch (exception) {

                warn(
                    "Kernel Event-Verbindung fehlgeschlagen.",
                    exception
                );

            }

        }

    }


    /* ========================================================
       43 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        edition:
            EDITION,

        module:
            MODULE_ID,


        /* State */

        getState:
            function () {

                return {

                    initialized:
                        state.initialized,

                    ready:
                        state.ready,

                    appCount:
                        state.apps.size,

                    instanceCount:
                        state.instances.size,

                    activeAppId:
                        state.activeAppId,

                    activeInstanceId:
                        state.activeInstanceId,

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

        registerApps,

        syncFromRegistry,


        /* Apps */

        get,

        getApp,

        getAll,

        getApps,

        has,

        find,

        search,

        getByCategory,


        /* Lifecycle */

        open,

        openApp,

        activate,

        deactivate,

        minimize,

        restore,

        start:
            startInstance,

        stop,

        close,

        closeApp,

        closeAll,

        destroyInstance,


        /* Instances */

        getInstance,

        getInstances,

        getActiveInstance,


        /* State */

        getAppState,

        getActiveApp,

        getActiveAppId,


        /* Dependencies */

        getMissingDependencies,

        checkDependencies,


        /* Connections */

        connectToKernel,

        connectToSystem,

        refreshConnections,

        getConnectionStatus,


        /* Diagnostics */

        getStatistics,

        diagnostics,

        healthCheck,

        reportError,


        /* Context */

        createAppContext

    };


    /* ========================================================
       44 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppManager =
        api;

    window.HalDoOSAppManager =
        api;

    HalDoOS.appManager =
        api;


    /* ========================================================
       45 — INITIAL STARTUP
       ======================================================== */

    connectGlobalEvents();


    function handleDOMReady() {

        connectRegistryEvents();


        initialize()
            .catch(
                function (exception) {

                    state.initializing =
                        false;

                    reportError(
                        "APP_MANAGER_INIT_ERROR",
                        exception
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
            handleDOMReady,
            {
                once:
                    true
            }
        );

    }
    else {

        handleDOMReady();

    }


    /* ========================================================
       46 — FINAL HALDO API
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS ||
        {};

    window.HalDoOS.appManager =
        api;


    /* ========================================================
       END OF FILE
       HALDO AI OS 20
       APP MANAGER
       ======================================================== */

})(window, document);