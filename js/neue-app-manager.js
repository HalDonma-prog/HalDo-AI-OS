/* ============================================================
   HALDO AI OS 18
   NEW APP MANAGER
   VERSION 18.0.0
   PROFESSIONAL ULTIMATE FOUNDATION

   Datei:
   js/neue-app-manager.js

   ZENTRALE APP-VERWALTUNG

   Architektur:

       HalDoKernel
           ↓
       HalDoSystem
           ↓
       New App Manager
        ↙    ↓    ↘
   Registry Router WindowManager
           ↓
        Launcher
           ↓
       Applications

   WICHTIG:
   - Eine einzige konsistente Implementierung
   - Keine 7-teilige Zusammenfügung
   - Keine externen globalen Variablen wie
     "apps", "runningApps" oder "activeAppId"
   - Interner Zustand ausschließlich über state
   - Rückwärtskompatible globale APIs
   ============================================================ */

(function (window, document) {

    "use strict";


    /* ========================================================
       HALDO OS FOUNDATION
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;


    const VERSION =
        "18.0.0";

    const MANAGER_ID =
        "app-manager";

    const MANAGER_NAME =
        "HalDo AI OS App Manager";


    /* ========================================================
       INTERNE DATEN
       ======================================================== */

    const state = {

        initialized: false,

        ready: false,

        apps: new Map(),

        running: new Map(),

        minimized: new Set(),

        activeAppId: null,

        previousAppId: null,

        listeners: new Map(),

        services: {

            kernel: null,

            system: null,

            registry: null,

            router: null,

            launcher: null,

            windowManager: null

        },

        statistics: {

            registered: 0,

            updated: 0,

            started: 0,

            stopped: 0,

            opened: 0,

            activated: 0,

            minimized: 0,

            restored: 0,

            closed: 0,

            destroyed: 0,

            errors: 0

        }

    };


    /* ========================================================
       EVENT SYSTEM
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

            off(
                event,
                callback
            );

        };

    }


    function off(event, callback) {

        const listeners =
            state.listeners.get(event);

        if (!listeners) {
            return;
        }


        listeners.delete(
            callback
        );


        if (
            listeners.size === 0
        ) {

            state.listeners.delete(
                event
            );

        }

    }


    function emit(event, data) {

        const listeners =
            state.listeners.get(event);


        if (listeners) {

            Array.from(
                listeners
            ).forEach(
                function (callback) {

                    try {

                        callback(data);

                    } catch (error) {

                        console.error(
                            "[HalDo App Manager] Event listener error:",
                            error
                        );

                    }

                }
            );

        }


        /*
         * Zentrales HalDoOS Event-System
         */

        if (
            HalDoOS.events &&
            typeof HalDoOS.events.emit ===
            "function"
        ) {

            try {

                HalDoOS.events.emit(
                    "app-manager:" + event,
                    data
                );

            } catch (error) {

                console.warn(
                    "[HalDo App Manager] Global event error:",
                    error
                );

            }

        }


        /*
         * Kernel Event-Bus
         */

        const kernel =
            getKernel();

        if (
            kernel &&
            typeof kernel.emit ===
            "function"
        ) {

            try {

                kernel.emit(
                    "app-manager:" + event,
                    data
                );

            } catch (error) {

                console.warn(
                    "[HalDo App Manager] Kernel event error:",
                    error
                );

            }

        }

    }


    /* ========================================================
       FEHLERBEHANDLUNG
       ======================================================== */

    function reportError(
        code,
        error,
        extra
    ) {

        state.statistics.errors += 1;


        const payload = {

            code:
                code ||
                "UNKNOWN_ERROR",

            error:
                error || null,

            extra:
                extra || null,

            timestamp:
                new Date().toISOString()

        };


        console.error(
            "[HalDo App Manager]",
            payload
        );


        emit(
            "error",
            payload
        );


        return payload;

    }


    /* ========================================================
       ID NORMALISIERUNG
       ======================================================== */

    function normalizeId(value) {

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


    /* ========================================================
       SERVICE LOOKUPS
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


    function getLauncher() {

        return (
            window.HalDoAppLauncher ||
            window.HalDoLauncher ||
            HalDoOS.launcher ||
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


    /* ========================================================
       SERVICE VERBINDUNGEN AKTUALISIEREN
       ======================================================== */

    function refreshServices() {

        state.services.kernel =
            getKernel();

        state.services.system =
            getSystem();

        state.services.registry =
            getRegistry();

        state.services.router =
            getRouter();

        state.services.launcher =
            getLauncher();

        state.services.windowManager =
            getWindowManager();


        state.connections = {

            kernel:
                !!state.services.kernel,

            system:
                !!state.services.system,

            registry:
                !!state.services.registry,

            router:
                !!state.services.router,

            launcher:
                !!state.services.launcher,

            windowManager:
                !!state.services.windowManager

        };


        return state.connections;

    }


    /* ========================================================
       APP NORMALISIEREN
       ======================================================== */

    function normalizeApp(config) {

        if (
            !config ||
            typeof config !==
            "object"
        ) {

            return null;

        }


        const id =
            normalizeId(
                config.id ||
                config.appId ||
                config.name ||
                config.title
            );


        if (!id) {

            return null;

        }


        return {

            id: id,

            appId: id,

            name:
                config.name ||
                id,

            title:
                config.title ||
                config.name ||
                id,

            description:
                config.description ||
                "",

            category:
                config.category ||
                "system",

            icon:
                config.icon ||
                "◈",

            version:
                config.version ||
                VERSION,

            status:
                config.status ||
                "registered",

            enabled:
                config.enabled !== false,

            system:
                config.system === true,

            singleton:
                config.singleton !== false,

            route:
                config.route ||
                null,

            entry:
                config.entry ||
                null,

            url:
                config.url ||
                null,

            permissions:
                Array.isArray(
                    config.permissions
                )
                    ? [
                        ...config.permissions
                    ]
                    : [],

            dependencies:
                Array.isArray(
                    config.dependencies
                )
                    ? [
                        ...config.dependencies
                    ]
                    : [],

            metadata:
                (
                    config.metadata &&
                    typeof config.metadata ===
                    "object"
                )
                    ? {
                        ...config.metadata
                    }
                    : {},

            api:
                (
                    config.api &&
                    typeof config.api ===
                    "object"
                )
                    ? {
                        ...config.api
                    }
                    : {},


            /*
             * Lifecycle
             */

            init:
                typeof config.init ===
                "function"
                    ? config.init
                    : null,

            start:
                typeof config.start ===
                "function"
                    ? config.start
                    : null,

            open:
                typeof config.open ===
                "function"
                    ? config.open
                    : null,

            activate:
                typeof config.activate ===
                "function"
                    ? config.activate
                    : null,

            stop:
                typeof config.stop ===
                "function"
                    ? config.stop
                    : null,

            close:
                typeof config.close ===
                "function"
                    ? config.close
                    : null,

            minimize:
                typeof config.minimize ===
                "function"
                    ? config.minimize
                    : null,

            restore:
                typeof config.restore ===
                "function"
                    ? config.restore
                    : null,

            destroy:
                typeof config.destroy ===
                "function"
                    ? config.destroy
                    : null,

            onActivate:
                typeof config.onActivate ===
                "function"
                    ? config.onActivate
                    : null,

            onDeactivate:
                typeof config.onDeactivate ===
                "function"
                    ? config.onDeactivate
                    : null,

            createdAt:
                config.createdAt ||
                Date.now(),

            updatedAt:
                Date.now()

        };

    }


    /* ========================================================
       APP REGISTRIEREN
       ======================================================== */

    function registerApp(config) {

        const app =
            normalizeApp(
                config
            );


        if (!app) {

            reportError(
                "INVALID_APP",
                new Error(
                    "Ungültige App-Konfiguration."
                ),
                {
                    config:
                        config
                }
            );

            return null;

        }


        const existing =
            state.apps.get(
                app.id
            );


        /*
         * Bestehende App aktualisieren
         */

        if (existing) {

            const merged = {

                ...existing,

                ...app,

                id:
                    existing.id,

                appId:
                    existing.id,

                metadata: {

                    ...(existing.metadata || {}),

                    ...(app.metadata || {})

                },

                api: {

                    ...(existing.api || {}),

                    ...(app.api || {})

                },

                permissions:
                    app.permissions.length
                        ? [
                            ...app.permissions
                        ]
                        : [
                            ...(existing.permissions || [])
                        ],

                dependencies:
                    app.dependencies.length
                        ? [
                            ...app.dependencies
                        ]
                        : [
                            ...(existing.dependencies || [])
                        ],

                createdAt:
                    existing.createdAt,

                updatedAt:
                    Date.now()

            };


            state.apps.set(
                app.id,
                merged
            );


            state.statistics.updated +=
                1;


            emit(
                "updated",
                {
                    app:
                        merged,

                    previous:
                        existing
                }
            );


            syncRegistry(
                merged
            );


            return merged;

        }


        /*
         * Neue App
         */

        state.apps.set(
            app.id,
            app
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


        syncRegistry(
            app
        );


        registerRoute(
            app
        );


        return app;

    }


    function registerApps(list) {

        if (
            !Array.isArray(list)
        ) {

            return [];

        }


        return list
            .map(
                registerApp
            )
            .filter(
                Boolean
            );

    }


    /* ========================================================
       APP ABFRAGEN
       ======================================================== */

    function getApp(id) {

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


    function getApps() {

        return Array.from(
            state.apps.values()
        );

    }


    function hasApp(id) {

        return !!getApp(id);

    }


    function getEnabledApps() {

        return getApps().filter(
            function (app) {

                return (
                    app.enabled !== false
                );

            }
        );

    }


    function getDisabledApps() {

        return getApps().filter(
            function (app) {

                return (
                    app.enabled === false
                );

            }
        );

    }


    /* ========================================================
       RUNTIME
       ======================================================== */

    function createRuntime(
        app,
        options
    ) {

        return {

            id:
                app.id,

            appId:
                app.id,

            app:
                app,

            options:
                options || {},

            status:
                "starting",

            startedAt:
                Date.now(),

            activatedAt:
                null,

            minimizedAt:
                null,

            services:
                {
                    ...state.services
                },

            manager:
                api,

            os:
                HalDoOS,

            window:
                window,

            document:
                document

        };

    }


    function getRuntime(id) {

        const normalized =
            normalizeId(
                id
            );


        if (!normalized) {

            return null;

        }


        return (
            state.running.get(
                normalized
            ) ||
            null
        );

    }


    function getRunningApps() {

        return Array.from(
            state.running.values()
        );

    }


    function isRunning(id) {

        return !!getRuntime(id);

    }


    function isMinimized(id) {

        const normalized =
            normalizeId(
                id
            );


        return (
            !!normalized &&
            state.minimized.has(
                normalized
            )
        );

    }


    /* ========================================================
       DEPENDENCIES
       ======================================================== */

    function getMissingDependencies(
        app
    ) {

        if (!app) {

            return [];

        }


        const dependencies =
            Array.isArray(
                app.dependencies
            )
                ? app.dependencies
                : [];


        return dependencies.filter(
            function (dependency) {

                const id =
                    normalizeId(
                        dependency
                    );


                const dependencyApp =
                    state.apps.get(
                        id
                    );


                return !(
                    dependencyApp &&
                    dependencyApp.enabled !== false
                );

            }
        );

    }


    function checkDependencies(app) {

        return (
            getMissingDependencies(
                app
            ).length === 0
        );

    }


    /* ========================================================
       RUNTIME STATUS
       ======================================================== */

    function setRuntimeStatus(
        runtime,
        status
    ) {

        if (!runtime) {

            return;

        }


        const previous =
            runtime.status;


        runtime.status =
            status;


        if (runtime.app) {

            runtime.app.status =
                status;

            runtime.app.updatedAt =
                Date.now();

        }


        emit(
            "status-changed",
            {
                app:
                    runtime.app,

                runtime:
                    runtime,

                previous:
                    previous,

                status:
                    status
            }
        );

    }


    /* ========================================================
       APP INITIALISIEREN
       ======================================================== */

    function initializeApp(
        app,
        runtime
    ) {

        if (!app) {

            return false;

        }


        if (
            typeof app.init !==
            "function"
        ) {

            setRuntimeStatus(
                runtime,
                "initialized"
            );

            return true;

        }


        try {

            const result =
                app.init(
                    runtime
                );


            if (result === false) {

                emit(
                    "init-failed",
                    {
                        app:
                            app,

                        runtime:
                            runtime
                    }
                );

                return false;

            }


            setRuntimeStatus(
                runtime,
                "initialized"
            );


            emit(
                "initialized",
                {
                    app:
                        app,

                    runtime:
                        runtime
                }
            );


            return true;

        } catch (error) {

            reportError(
                "APP_INIT_ERROR",
                error,
                {
                    app:
                        app,

                    runtime:
                        runtime
                }
            );


            setRuntimeStatus(
                runtime,
                "error"
            );


            return false;

        }

    }


    /* ========================================================
       APP STARTEN
       ======================================================== */

    function startApp(
        id,
        options
    ) {

        refreshServices();


        const app =
            getApp(id);


        if (!app) {

            reportError(
                "APP_NOT_FOUND",
                new Error(
                    "App wurde nicht gefunden."
                ),
                {
                    id:
                        id
                }
            );

            return null;

        }


        if (
            app.enabled === false
        ) {

            emit(
                "app-disabled",
                {
                    app:
                        app
                }
            );

            return null;

        }


        const missing =
            getMissingDependencies(
                app
            );


        if (
            missing.length > 0
        ) {

            emit(
                "dependency-error",
                {
                    app:
                        app,

                    missing:
                        missing
                }
            );

            return null;

        }


        /*
         * Singleton
         */

        if (
            app.singleton &&
            state.running.has(
                app.id
            )
        ) {

            activateApp(
                app.id
            );

            return getRuntime(
                app.id
            );

        }


        const runtime =
            createRuntime(
                app,
                options
            );


        state.running.set(
            app.id,
            runtime
        );


        emit(
            "starting",
            {
                app:
                    app,

                runtime:
                    runtime
            }
        );


        /*
         * INIT
         */

        if (
            !initializeApp(
                app,
                runtime
            )
        ) {

            state.running.delete(
                app.id
            );

            return null;

        }


        /*
         * START
         */

        try {

            if (
                typeof app.start ===
                "function"
            ) {

                const result =
                    app.start(
                        runtime
                    );


                if (
                    result === false
                ) {

                    state.running.delete(
                        app.id
                    );


                    setRuntimeStatus(
                        runtime,
                        "error"
                    );


                    emit(
                        "start-failed",
                        {
                            app:
                                app,

                            runtime:
                                runtime
                        }
                    );


                    return null;

                }

            }

        } catch (error) {

            state.running.delete(
                app.id
            );


            reportError(
                "APP_START_ERROR",
                error,
                {
                    app:
                        app,

                    runtime:
                        runtime
                }
            );


            return null;

        }


        setRuntimeStatus(
            runtime,
            "running"
        );


        state.statistics.started +=
            1;


        /*
         * OPEN
         */

        if (
            typeof app.open ===
            "function"
        ) {

            try {

                app.open(
                    runtime
                );

            } catch (error) {

                reportError(
                    "APP_OPEN_ERROR",
                    error,
                    {
                        app:
                            app,

                        runtime:
                            runtime
                    }
                );

            }

        }


        state.statistics.opened +=
            1;


        connectWindow(
            "open",
            runtime
        );


        activateApp(
            app.id
        );


        emit(
            "started",
            {
                app:
                    app,

                runtime:
                    runtime
            }
        );


        return runtime;

    }


    /* ========================================================
       APP ÖFFNEN
       ======================================================== */

    function openApp(
        id,
        options
    ) {

        const app =
            getApp(id);


        if (!app) {

            return null;

        }


        if (
            state.running.has(
                app.id
            )
        ) {

            if (
                state.minimized.has(
                    app.id
                )
            ) {

                restoreApp(
                    app.id
                );

            } else {

                activateApp(
                    app.id
                );

            }


            return getRuntime(
                app.id
            );

        }


        return startApp(
            app.id,
            options
        );

    }


    /* ========================================================
       APP AKTIVIEREN
       ======================================================== */

    function activateApp(id) {

        const app =
            getApp(id);


        if (!app) {

            return false;

        }


        let runtime =
            getRuntime(
                app.id
            );


        if (!runtime) {

            runtime =
                startApp(
                    app.id
                );


            if (!runtime) {

                return false;

            }

        }


        const previous =
            state.activeAppId;


        if (
            previous &&
            previous !== app.id
        ) {

            const previousApp =
                getApp(
                    previous
                );

            const previousRuntime =
                getRuntime(
                    previous
                );


            if (
                previousApp &&
                previousRuntime
            ) {

                try {

                    if (
                        typeof previousApp.onDeactivate ===
                        "function"
                    ) {

                        previousApp.onDeactivate(
                            previousRuntime
                        );

                    }

                } catch (error) {

                    reportError(
                        "APP_DEACTIVATE_ERROR",
                        error,
                        {
                            app:
                                previousApp
                        }
                    );

                }


                setRuntimeStatus(
                    previousRuntime,
                    "running"
                );

            }

        }


        state.previousAppId =
            previous;


        state.activeAppId =
            app.id;


        state.minimized.delete(
            app.id
        );


        runtime.minimizedAt =
            null;


        setRuntimeStatus(
            runtime,
            "active"
        );


        runtime.activatedAt =
            Date.now();


        try {

            if (
                typeof app.activate ===
                "function"
            ) {

                app.activate(
                    runtime
                );

            }


            if (
                typeof app.onActivate ===
                "function"
            ) {

                app.onActivate(
                    runtime
                );

            }

        } catch (error) {

            reportError(
                "APP_ACTIVATE_ERROR",
                error,
                {
                    app:
                        app,

                    runtime:
                        runtime
                }
            );

        }


        connectWindow(
            "activate",
            runtime
        );


        connectRouter(
            "activate",
            app
        );


        state.statistics.activated +=
            1;


        emit(
            "activated",
            {
                app:
                    app,

                runtime:
                    runtime,

                previous:
                    previous
            }
        );


        emit(
            "active-changed",
            {
                current:
                    app.id,

                previous:
                    previous
            }
        );


        return true;

    }


    /* ========================================================
       APP MINIMIEREN
       ======================================================== */

    function minimizeApp(id) {

        const app =
            getApp(id);


        if (!app) {

            return false;

        }


        const runtime =
            getRuntime(
                app.id
            );


        if (!runtime) {

            return false;

        }


        if (
            state.minimized.has(
                app.id
            )
        ) {

            return true;

        }


        try {

            if (
                typeof app.minimize ===
                "function"
            ) {

                app.minimize(
                    runtime
                );

            }

        } catch (error) {

            reportError(
                "APP_MINIMIZE_ERROR",
                error,
                {
                    app:
                        app,

                    runtime:
                        runtime
                }
            );

        }


        state.minimized.add(
            app.id
        );


        runtime.minimizedAt =
            Date.now();


        setRuntimeStatus(
            runtime,
            "minimized"
        );


        connectWindow(
            "minimize",
            runtime
        );


        if (
            state.activeAppId ===
            app.id
        ) {

            state.activeAppId =
                null;


            emit(
                "active-changed",
                {
                    current:
                        null,

                    previous:
                        app.id
                }
            );

        }


        state.statistics.minimized +=
            1;


        emit(
            "minimized",
            {
                app:
                    app,

                runtime:
                    runtime
            }
        );


        return true;

    }


    /* ========================================================
       APP RESTAURIEREN
       ======================================================== */

    function restoreApp(id) {

        const app =
            getApp(id);


        if (!app) {

            return false;

        }


        const runtime =
            getRuntime(
                app.id
            );


        if (!runtime) {

            return false;

        }


        state.minimized.delete(
            app.id
        );


        runtime.minimizedAt =
            null;


        try {

            if (
                typeof app.restore ===
                "function"
            ) {

                app.restore(
                    runtime
                );

            }

        } catch (error) {

            reportError(
                "APP_RESTORE_ERROR",
                error,
                {
                    app:
                        app,

                    runtime:
                        runtime
                }
            );

        }


        setRuntimeStatus(
            runtime,
            "running"
        );


        connectWindow(
            "restore",
            runtime
        );


        state.statistics.restored +=
            1;


        emit(
            "restored",
            {
                app:
                    app,

                runtime:
                    runtime
            }
        );


        return activateApp(
            app.id
        );

    }


    /* ========================================================
       APP STOPPEN
       ======================================================== */

    function stopApp(id) {

        const app =
            getApp(id);


        if (!app) {

            return false;

        }


        const runtime =
            getRuntime(
                app.id
            );


        if (!runtime) {

            return true;

        }


        setRuntimeStatus(
            runtime,
            "stopping"
        );


        emit(
            "stopping",
            {
                app:
                    app,

                runtime:
                    runtime
            }
        );


        try {

            if (
                typeof app.stop ===
                "function"
            ) {

                app.stop(
                    runtime
                );

            }

        } catch (error) {

            reportError(
                "APP_STOP_ERROR",
                error,
                {
                    app:
                        app,

                    runtime:
                        runtime
                }
            );

        }


        try {

            if (
                typeof app.onDeactivate ===
                "function"
            ) {

                app.onDeactivate(
                    runtime
                );

            }

        } catch (error) {

            reportError(
                "APP_DEACTIVATE_ERROR",
                error,
                {
                    app:
                        app
                }
            );

        }


        connectWindow(
            "close",
            runtime
        );


        state.running.delete(
            app.id
        );


        state.minimized.delete(
            app.id
        );


        if (
            state.activeAppId ===
            app.id
        ) {

            state.activeAppId =
                null;


            /*
             * Nächste App aktivieren
             */

            const remaining =
                getRunningApps();


            if (
                remaining.length > 0
            ) {

                activateApp(
                    remaining[
                        remaining.length - 1
                    ].id
                );

            }

        }


        setRuntimeStatus(
            runtime,
            "stopped"
        );


        state.statistics.stopped +=
            1;


        emit(
            "stopped",
            {
                app:
                    app,

                runtime:
                    runtime
            }
        );


        return true;

    }


    /* ========================================================
       APP SCHLIESSEN
       ======================================================== */

    function closeApp(id) {

        const app =
            getApp(id);


        if (!app) {

            return false;

        }


        const runtime =
            getRuntime(
                app.id
            );


        if (!runtime) {

            return true;

        }


        try {

            if (
                typeof app.close ===
                "function"
            ) {

                app.close(
                    runtime
                );

            }

        } catch (error) {

            reportError(
                "APP_CLOSE_ERROR",
                error,
                {
                    app:
                        app,

                    runtime:
                        runtime
                }
            );

        }


        connectRouter(
            "close",
            app
        );


        const result =
            stopApp(
                app.id
            );


        state.statistics.closed +=
            1;


        emit(
            "closed",
            {
                app:
                    app,

                runtime:
                    runtime,

                result:
                    result
            }
        );


        return result;

    }


    /* ========================================================
       APP ZERSTÖREN
       ======================================================== */

    function destroyApp(id) {

        const app =
            getApp(id);


        if (!app) {

            return false;

        }


        if (
            state.running.has(
                app.id
            )
        ) {

            closeApp(
                app.id
            );

        }


        try {

            if (
                typeof app.destroy ===
                "function"
            ) {

                app.destroy(
                    {
                        app:
                            app,

                        manager:
                            api,

                        os:
                            HalDoOS
                    }
                );

            }

        } catch (error) {

            reportError(
                "APP_DESTROY_ERROR",
                error,
                {
                    app:
                        app
                }
            );

        }


        state.apps.delete(
            app.id
        );


        state.running.delete(
            app.id
        );


        state.minimized.delete(
            app.id
        );


        if (
            state.activeAppId ===
            app.id
        ) {

            state.activeAppId =
                null;

        }


        state.statistics.destroyed +=
            1;


        emit(
            "destroyed",
            {
                app:
                    app
            }
        );


        return true;

    }


    /* ========================================================
       APP DEAKTIVIEREN
       ======================================================== */

    function deactivateApp(id) {

        const app =
            getApp(id);


        if (!app) {

            return false;

        }


        const runtime =
            getRuntime(
                app.id
            );


        if (!runtime) {

            return false;

        }


        try {

            if (
                typeof app.onDeactivate ===
                "function"
            ) {

                app.onDeactivate(
                    runtime
                );

            }

        } catch (error) {

            reportError(
                "APP_DEACTIVATE_ERROR",
                error,
                {
                    app:
                        app
                }
            );

        }


        if (
            state.activeAppId ===
            app.id
        ) {

            state.activeAppId =
                null;


            setRuntimeStatus(
                runtime,
                "running"
            );


            emit(
                "active-changed",
                {
                    current:
                        null,

                    previous:
                        app.id
                }
            );

        }


        connectRouter(
            "close",
            app
        );


        emit(
            "deactivated",
            {
                app:
                    app,

                runtime:
                    runtime
            }
        );


        return true;

    }


    /* ========================================================
       ALLE APPS STOPPEN
       ======================================================== */

    function stopAllApps() {

        const running =
            getRunningApps();


        let count =
            0;


        running.forEach(
            function (runtime) {

                if (
                    stopApp(
                        runtime.id
                    )
                ) {

                    count +=
                        1;

                }

            }
        );


        state.activeAppId =
            null;


        emit(
            "all-stopped",
            {
                count:
                    count
            }
        );


        return count;

    }


    /* ========================================================
       ALLE APPS SCHLIESSEN
       ======================================================== */

    function closeAllApps() {

        const running =
            getRunningApps();


        let count =
            0;


        running.forEach(
            function (runtime) {

                if (
                    closeApp(
                        runtime.id
                    )
                ) {

                    count +=
                        1;

                }

            }
        );


        state.activeAppId =
            null;


        emit(
            "all-closed",
            {
                count:
                    count
            }
        );


        return count;

    }


    /* ========================================================
       ENABLE / DISABLE
       ======================================================== */

    function enableApp(id) {

        const app =
            getApp(id);


        if (!app) {

            return false;

        }


        app.enabled =
            true;

        app.updatedAt =
            Date.now();


        syncRegistry(
            app
        );


        emit(
            "enabled",
            {
                app:
                    app
            }
        );


        return true;

    }


    function disableApp(id) {

        const app =
            getApp(id);


        if (!app) {

            return false;

        }


        if (
            state.running.has(
                app.id
            )
        ) {

            closeApp(
                app.id
            );

        }


        app.enabled =
            false;

        app.updatedAt =
            Date.now();


        syncRegistry(
            app
        );


        emit(
            "disabled",
            {
                app:
                    app
            }
        );


        return true;

    }


    /* ========================================================
       APP AKTUALISIEREN
       ======================================================== */

    function updateApp(
        id,
        changes
    ) {

        const app =
            getApp(id);


        if (
            !app ||
            !changes ||
            typeof changes !==
            "object"
        ) {

            return app || null;

        }


        const lifecycle =
            [

                "init",
                "start",
                "open",
                "activate",
                "stop",
                "close",
                "minimize",
                "restore",
                "destroy",
                "onActivate",
                "onDeactivate"

            ];


        const merged = {

            ...app,

            ...changes,

            id:
                app.id,

            appId:
                app.id,

            metadata: {

                ...(app.metadata || {}),

                ...(
                    changes.metadata &&
                    typeof changes.metadata ===
                    "object"
                        ? changes.metadata
                        : {}
                )

            },

            api: {

                ...(app.api || {}),

                ...(
                    changes.api &&
                    typeof changes.api ===
                    "object"
                        ? changes.api
                        : {}
                )

            },

            permissions:
                Array.isArray(
                    changes.permissions
                )
                    ? [
                        ...changes.permissions
                    ]
                    : [
                        ...app.permissions
                    ],

            dependencies:
                Array.isArray(
                    changes.dependencies
                )
                    ? [
                        ...changes.dependencies
                    ]
                    : [
                        ...app.dependencies
                    ],

            updatedAt:
                Date.now()

        };


        lifecycle.forEach(
            function (key) {

                if (
                    Object.prototype.hasOwnProperty.call(
                        changes,
                        key
                    )
                ) {

                    if (
                        changes[key] !== null &&
                        typeof changes[key] !==
                        "function"
                    ) {

                        merged[key] =
                            app[key] ||
                            null;

                    }

                }

            }
        );


        state.apps.set(
            app.id,
            merged
        );


        state.statistics.updated +=
            1;


        syncRegistry(
            merged
        );


        registerRoute(
            merged
        );


        emit(
            "updated",
            {
                app:
                    merged,

                previous:
                    app
            }
        );


        return merged;

    }


    /* ========================================================
       APP ENTFERNEN
       ======================================================== */

    function unregisterApp(id) {

        const app =
            getApp(id);


        if (!app) {

            return false;

        }


        if (
            state.running.has(
                app.id
            )
        ) {

            closeApp(
                app.id
            );

        }


        state.apps.delete(
            app.id
        );


        state.running.delete(
            app.id
        );


        state.minimized.delete(
            app.id
        );


        if (
            state.activeAppId ===
            app.id
        ) {

            state.activeAppId =
                null;

        }


        const registry =
            getRegistry();


        if (
            registry &&
            typeof registry.remove ===
            "function"
        ) {

            try {

                registry.remove(
                    app.id
                );

            } catch (error) {

                reportError(
                    "REGISTRY_REMOVE_ERROR",
                    error,
                    {
                        app:
                            app
                    }
                );

            }

        }


        emit(
            "unregistered",
            {
                app:
                    app
            }
        );


        return true;

    }


    /* ========================================================
       REGISTRY SYNCHRONISATION
       ======================================================== */

    function syncRegistry(app) {

        if (!app) {

            return false;

        }


        const registry =
            getRegistry();


        if (!registry) {

            return false;

        }


        try {

            if (
                typeof registry.has ===
                "function" &&
                registry.has(
                    app.id
                )
            ) {

                if (
                    typeof registry.update ===
                    "function"
                ) {

                    registry.update(
                        app.id,
                        app
                    );

                }


                return true;

            }


            if (
                typeof registry.register ===
                "function"
            ) {

                registry.register(
                    app
                );


                return true;

            }

        } catch (error) {

            reportError(
                "REGISTRY_SYNC_ERROR",
                error,
                {
                    app:
                        app
                }
            );

        }


        return false;

    }


    function importRegistry() {

        const registry =
            getRegistry();


        if (!registry) {

            return 0;

        }


        let definitions =
            [];


        try {

            if (
                typeof registry.getAll ===
                "function"
            ) {

                definitions =
                    registry.getAll();

            } else if (
                typeof registry.getApps ===
                "function"
            ) {

                definitions =
                    registry.getApps();

            } else if (
                typeof registry.list ===
                "function"
            ) {

                definitions =
                    registry.list();

            }

        } catch (error) {

            reportError(
                "REGISTRY_IMPORT_ERROR",
                error
            );

            return 0;

        }


        if (
            !Array.isArray(
                definitions
            )
        ) {

            return 0;

        }


        let imported =
            0;


        definitions.forEach(
            function (definition) {

                if (!definition) {

                    return;

                }


                const id =
                    normalizeId(
                        definition.id ||
                        definition.appId ||
                        definition.name ||
                        definition.title
                    );


                if (
                    !id ||
                    state.apps.has(id)
                ) {

                    return;

                }


                const app =
                    normalizeApp(
                        definition
                    );


                if (!app) {

                    return;

                }


                state.apps.set(
                    id,
                    app
                );


                imported +=
                    1;


                emit(
                    "imported",
                    {
                        app:
                            app
                    }
                );

            }
        );


        return imported;

    }


    function syncAllApps() {

        let count =
            0;


        getApps().forEach(
            function (app) {

                if (
                    syncRegistry(
                        app
                    )
                ) {

                    count +=
                        1;

                }

            }
        );


        emit(
            "registry-sync-complete",
            {
                total:
                    state.apps.size,

                synced:
                    count
            }
        );


        return count;

    }


    /* ========================================================
       ROUTER
       ======================================================== */

    function registerRoute(app) {

        if (
            !app ||
            !app.route
        ) {

            return false;

        }


        const router =
            getRouter();


        if (!router) {

            return false;

        }


        try {

            if (
                typeof router.has ===
                "function" &&
                router.has(
                    app.route
                )
            ) {

                return true;

            }


            if (
                typeof router.register ===
                "function"
            ) {

                router.register(
                    app.route,
                    {
                        app:
                            app.id,

                        id:
                            app.id,

                        name:
                            app.name,

                        title:
                            app.title,

                        aliases:
                            [
                                app.id,
                                app.name,
                                app.title
                            ].filter(
                                Boolean
                            )
                    }
                );


                emit(
                    "route-registered",
                    {
                        app:
                            app,

                        route:
                            app.route
                    }
                );


                return true;

            }

        } catch (error) {

            reportError(
                "ROUTE_REGISTER_ERROR",
                error,
                {
                    app:
                        app
                }
            );

        }


        return false;

    }


    function connectRouter(
        action,
        app
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
                action ===
                "activate"
            ) {

                if (
                    typeof router.navigate ===
                    "function" &&
                    app.route
                ) {

                    router.navigate(
                        app.route
                    );

                    return true;

                }


                if (
                    typeof router.focus ===
                    "function"
                ) {

                    router.focus(
                        app.id
                    );

                    return true;

                }

            }


            if (
                action ===
                "close"
            ) {

                if (
                    typeof router.close ===
                    "function"
                ) {

                    router.close(
                        app.id
                    );

                    return true;

                }

            }

        } catch (error) {

            reportError(
                "ROUTER_ERROR",
                error,
                {
                    action:
                        action,

                    app:
                        app
                }
            );

        }


        return false;

    }


    /* ========================================================
       WINDOW MANAGER
       ======================================================== */

    function connectWindow(
        action,
        runtime
    ) {

        const manager =
            getWindowManager();


        if (
            !manager ||
            !runtime
        ) {

            return false;

        }


        try {

            const app =
                runtime.app;


            if (
                action ===
                "open"
            ) {

                if (
                    typeof manager.open ===
                    "function"
                ) {

                    manager.open(
                        app.id,
                        runtime
                    );

                    return true;

                }

                if (
                    typeof manager.createWindow ===
                    "function"
                ) {

                    manager.createWindow(
                        {
                            id:
                                app.id,

                            appId:
                                app.id,

                            title:
                                app.title,

                            icon:
                                app.icon
                        }
                    );

                    return true;

                }

            }


            if (
                action ===
                "activate"
            ) {

                if (
                    typeof manager.activate ===
                    "function"
                ) {

                    manager.activate(
                        app.id
                    );

                    return true;

                }

                if (
                    typeof manager.focus ===
                    "function"
                ) {

                    manager.focus(
                        app.id
                    );

                    return true;

                }

            }


            if (
                action ===
                "minimize"
            ) {

                if (
                    typeof manager.minimize ===
                    "function"
                ) {

                    manager.minimize(
                        app.id
                    );

                    return true;

                }

            }


            if (
                action ===
                "restore"
            ) {

                if (
                    typeof manager.restore ===
                    "function"
                ) {

                    manager.restore(
                        app.id
                    );

                    return true;

                }

            }


            if (
                action ===
                "close"
            ) {

                if (
                    typeof manager.close ===
                    "function"
                ) {

                    manager.close(
                        app.id
                    );

                    return true;

                }

                if (
                    typeof manager.closeWindow ===
                    "function"
                ) {

                    manager.closeWindow(
                        app.id
                    );

                    return true;

                }

            }

        } catch (error) {

            reportError(
                "WINDOW_MANAGER_ERROR",
                error,
                {
                    action:
                        action,

                    runtime:
                        runtime
                }
            );

        }


        return false;

    }


    /* ========================================================
       LAUNCHER VERBINDUNG
       ======================================================== */

    function launchApp(
        id,
        options
    ) {

        const launcher =
            getLauncher();


        if (
            launcher
        ) {

            try {

                if (
                    typeof launcher.launch ===
                    "function"
                ) {

                    const result =
                        launcher.launch(
                            id,
                            options
                        );


                    if (
                        result
                    ) {

                        return result;

                    }

                }

            } catch (error) {

                reportError(
                    "LAUNCHER_ERROR",
                    error,
                    {
                        id:
                            id
                    }
                );

            }

        }


        return openApp(
            id,
            options
        );

    }


    /* ========================================================
       AKTIVE APP
       ======================================================== */

    function getActiveApp() {

        return (
            state.activeAppId
                ? getApp(
                    state.activeAppId
                )
                : null
        );

    }


    function getActiveRuntime() {

        return (
            state.activeAppId
                ? getRuntime(
                    state.activeAppId
                )
                : null
        );

    }


    function getPreviousApp() {

        return (
            state.previousAppId
                ? getApp(
                    state.previousAppId
                )
                : null
        );

    }


    /* ========================================================
       STATISTIK
       ======================================================== */

    function getStatistics() {

        return {

            ...state.statistics,

            totalApps:
                state.apps.size,

            runningApps:
                state.running.size,

            minimizedApps:
                state.minimized.size,

            activeAppId:
                state.activeAppId,

            previousAppId:
                state.previousAppId

        };

    }


    /* ========================================================
       DIAGNOSE
       ======================================================== */

    function diagnose() {

        refreshServices();


        return {

            manager:
                {
                    id:
                        MANAGER_ID,

                    name:
                        MANAGER_NAME,

                    version:
                        VERSION,

                    initialized:
                        state.initialized,

                    ready:
                        state.ready
                },

            services:
                {
                    ...state.connections
                },

            apps:
                {
                    total:
                        state.apps.size,

                    running:
                        state.running.size,

                    minimized:
                        state.minimized.size,

                    active:
                        state.activeAppId
                },

            statistics:
                getStatistics(),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       INITIALISIERUNG
       ======================================================== */

    function initialize() {

        if (
            state.initialized
        ) {

            return true;

        }


        refreshServices();


        state.initialized =
            true;


        emit(
            "initialized",
            {
                manager:
                    api
            }
        );


        /*
         * Registry vorhandene Apps importieren
         */

        importRegistry();


        /*
         * Kernel registrieren
         */

        const kernel =
            getKernel();


        if (
            kernel &&
            typeof kernel.registerModule ===
            "function"
        ) {

            try {

                kernel.registerModule(
                    MANAGER_ID,
                    api
                );

            } catch (error) {

                reportError(
                    "KERNEL_REGISTER_ERROR",
                    error
                );

            }

        }


        state.ready =
            true;


        emit(
            "ready",
            {
                manager:
                    api
            }
        );


        return true;

    }


    /* ========================================================
       ÖFFENTLICHE API
       ======================================================== */

    const api = {

        id:
            MANAGER_ID,

        name:
            MANAGER_NAME,

        version:
            VERSION,


        /*
         * Lifecycle
         */

        init:
            initialize,

        initialize:
            initialize,


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
         * Registrierung
         */

        register:
            registerApp,

        registerApp:
            registerApp,

        registerApps:
            registerApps,


        /*
         * Abfragen
         */

        get:
            getApp,

        getApp:
            getApp,

        getApps:
            getApps,

        has:
            hasApp,

        hasApp:
            hasApp,

        getEnabledApps:
            getEnabledApps,

        getDisabledApps:
            getDisabledApps,


        /*
         * Runtime
         */

        start:
            startApp,

        startApp:
            startApp,

        open:
            openApp,

        openApp:
            openApp,

        launch:
            launchApp,

        launchApp:
            launchApp,

        activate:
            activateApp,

        activateApp:
            activateApp,

        deactivate:
            deactivateApp,

        deactivateApp:
            deactivateApp,

        minimize:
            minimizeApp,

        minimizeApp:
            minimizeApp,

        restore:
            restoreApp,

        restoreApp:
            restoreApp,

        stop:
            stopApp,

        stopApp:
            stopApp,

        close:
            closeApp,

        closeApp:
            closeApp,

        destroy:
            destroyApp,

        destroyApp:
            destroyApp,


        /*
         * Runtime-Abfragen
         */

        getRuntime:
            getRuntime,

        getRunningApps:
            getRunningApps,

        isRunning:
            isRunning,

        isMinimized:
            isMinimized,

        getActiveApp:
            getActiveApp,

        getActiveRuntime:
            getActiveRuntime,

        getPreviousApp:
            getPreviousApp,


        /*
         * Verwaltung
         */

        enable:
            enableApp,

        enableApp:
            enableApp,

        disable:
            disableApp,

        disableApp:
            disableApp,

        update:
            updateApp,

        updateApp:
            updateApp,

        unregister:
            unregisterApp,

        unregisterApp:
            unregisterApp,


        /*
         * Registry
         */

        syncRegistry:
            syncRegistry,

        syncAllApps:
            syncAllApps,

        importRegistry:
            importRegistry,


        /*
         * Router
         */

        registerRoute:
            registerRoute,


        /*
         * Massenaktionen
         */

        stopAll:
            stopAllApps,

        stopAllApps:
            stopAllApps,

        closeAll:
            closeAllApps,

        closeAllApps:
            closeAllApps,


        /*
         * Diagnose
         */

        getStatistics:
            getStatistics,

        diagnose:
            diagnose,


        /*
         * Zustand
         */

        getState:
            function () {

                return {

                    initialized:
                        state.initialized,

                    ready:
                        state.ready,

                    activeAppId:
                        state.activeAppId,

                    previousAppId:
                        state.previousAppId,

                    connections:
                        {
                            ...state.connections
                        }

                };

            }

    };


    /* ========================================================
       GLOBALE REFERENZEN
       ======================================================== */

    window.HalDoAppManager =
        api;

    window.HalDoNewAppManager =
        api;


    HalDoOS.appManager =
        api;

    HalDoOS.newAppManager =
        api;


    /*
     * Legacy-/Kompatibilitätsreferenz
     */

    HalDoOS.apps =
        api;


    /* ========================================================
       START
       ======================================================== */

    function boot() {

        try {

            initialize();

        } catch (error) {

            reportError(
                "MANAGER_BOOT_ERROR",
                error
            );

        }

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


})(window, document);