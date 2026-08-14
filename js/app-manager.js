/* =========================================================
   HALDO AI OS 18
   APP MANAGER
   VERSION 18.0.0
   PROFESSIONAL ULTIMATE FOUNDATION

   Datei:
   js/app-manager.js

   ZENTRALE APP-VERWALTUNG

   ARCHITEKTUR:

       HALDO AI OS
            │
            ▼
         KERNEL
            │
            ▼
       APP MANAGER
        ┌───┼───────────────┐
        ▼   ▼               ▼
     REGISTRY ROUTER      LAUNCHER
            │               │
            └──────┬────────┘
                   ▼
             WINDOW MANAGER
                   │
                   ▼
              APPLICATION

   VERANTWORTLICH FÜR:

   • App Registrierung
   • App Updates
   • App Entfernung
   • App Lifecycle
   • Init / Start / Open
   • Activate / Deactivate
   • Minimize / Restore
   • Stop / Close / Destroy
   • Enable / Disable
   • Singleton Apps
   • Dependencies
   • Runtime Context
   • Registry Synchronisation
   • Router Synchronisation
   • Launcher Synchronisation
   • Window Manager Verbindung
   • Kernel Verbindung
   • System Verbindung
   • Event System
   • Fehlerverwaltung
   • Statistiken
   • Diagnostics
   • Health Check
   • App Suche
   • Kategorien
   • Lifecycle Locks
   • Startup Queue
   • Kompatibilitäts-Aliase
   • zukünftige Erweiterbarkeit

   WICHTIG:

   Diese Datei ist eine eigenständige
   Gesamtversion.

   KEINE Teil-1/7-Struktur.

   Bestehende APIs werden soweit möglich
   kompatibel gehalten.

   ========================================================= */


/* =========================================================
   GLOBAL FOUNDATION
   ========================================================= */

(function (window, document) {

    "use strict";


    /* =====================================================
       HALDO OS FOUNDATION
       ===================================================== */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;


    /* =====================================================
       META
       ===================================================== */

    const VERSION =
        "18.0.0";

    const MANAGER_NAME =
        "HalDo AI OS App Manager";

    const MODULE_ID =
        "app-manager";


    /* =====================================================
       INTERNAL STATE
       ===================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        initializing:
            false,

        destroyed:
            false,

        apps:
            new Map(),

        runningApps:
            new Map(),

        minimizedApps:
            new Set(),

        activeAppId:
            null,

        previousAppId:
            null,

        operationLocks:
            new Map(),

        initializedApps:
            new Set(),

        listeners:
            new Map(),

        startupQueue:
            [],

        connections: {

            kernel:
                false,

            system:
                false,

            registry:
                false,

            router:
                false,

            launcher:
                false,

            windowManager:
                false

        },

        statistics: {

            registered:
                0,

            updated:
                0,

            imported:
                0,

            started:
                0,

            opened:
                0,

            activated:
                0,

            deactivated:
                0,

            minimized:
                0,

            restored:
                0,

            stopped:
                0,

            closed:
                0,

            destroyed:
                0,

            enabled:
                0,

            disabled:
                0,

            errors:
                0

        }

    };


    /* =====================================================
       LOGGING
       ===================================================== */

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


    /* =====================================================
       ID NORMALIZATION
       ===================================================== */

    function normalizeId(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }

        return String(value)
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


    function createId(value) {

        return normalizeId(
            value
        );

    }


    /* =====================================================
       SAFE HELPERS
       ===================================================== */

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


    function safeCall(
        object,
        method,
        args
    ) {

        if (
            !hasMethod(
                object,
                method
            )
        ) {

            return null;

        }

        try {

            return object[method].apply(
                object,
                args || []
            );

        } catch (exception) {

            reportError(
                "METHOD_ERROR",
                exception,
                {
                    method:
                        method
                }
            );

            return null;

        }

    }


    async function safeAsyncCall(
        object,
        method,
        args
    ) {

        if (
            !hasMethod(
                object,
                method
            )
        ) {

            return null;

        }

        try {

            return await object[method].apply(
                object,
                args || []
            );

        } catch (exception) {

            reportError(
                "ASYNC_METHOD_ERROR",
                exception,
                {
                    method:
                        method
                }
            );

            return null;

        }

    }


    /* =====================================================
       SERVICE LOOKUPS
       ===================================================== */

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
            HalDoOS.appLauncher ||
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

        const eventName =
            String(event || "")
                .trim();

        if (!eventName) {

            return function () {};

        }

        if (
            !state.listeners.has(
                eventName
            )
        ) {

            state.listeners.set(
                eventName,
                new Set()
            );

        }

        const listeners =
            state.listeners.get(
                eventName
            );

        listeners.add(
            callback
        );

        return function () {

            off(
                eventName,
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

            return false;

        }

        const removed =
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

        return removed;

    }


    function emit(
        event,
        data
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

                        errorLog(
                            "Event listener error:",
                            exception
                        );

                    }

                }
            );

        }


        /*
         * Zentrales HalDoOS Event-System
         */

        const globalEvents =
            HalDoOS.events;

        if (
            globalEvents &&
            typeof globalEvents.emit ===
            "function"
        ) {

            try {

                globalEvents.emit(
                    "app-manager:" + event,
                    data
                );

            } catch (_) {}

        }


        /*
         * Browser CustomEvent
         */

        try {

            if (
                typeof window.dispatchEvent ===
                "function" &&
                typeof window.CustomEvent ===
                "function"
            ) {

                window.dispatchEvent(
                    new CustomEvent(
                        "haldo:app-manager:" + event,
                        {
                            detail:
                                data
                        }
                    )
                );

            }

        } catch (_) {}

    }


    /* =====================================================
       ERROR SYSTEM
       ===================================================== */

    function reportError(
        code,
        exception,
        extra
    ) {

        state.statistics.errors +=
            1;

        const payload = {

            code:
                code ||
                "UNKNOWN_ERROR",

            error:
                exception ||
                null,

            message:
                exception &&
                exception.message
                    ? exception.message
                    : String(
                        exception ||
                        code ||
                        "Unknown error"
                    ),

            extra:
                extra ||
                null,

            timestamp:
                new Date().toISOString()

        };

        errorLog(
            "[ERROR]",
            payload
        );

        emit(
            "error",
            payload
        );

        return payload;

    }


    /* =====================================================
       OPERATION LOCKS
       ===================================================== */

    function isLocked(
        id
    ) {

        return state.operationLocks.has(
            createId(id)
        );

    }


    function acquireLock(
        id,
        operation
    ) {

        const normalized =
            createId(id);

        if (!normalized) {

            return false;

        }

        if (
            state.operationLocks.has(
                normalized
            )
        ) {

            return false;

        }

        state.operationLocks.set(
            normalized,
            operation ||
            "operation"
        );

        return true;

    }


    function releaseLock(
        id
    ) {

        const normalized =
            createId(id);

        if (!normalized) {

            return;

        }

        state.operationLocks.delete(
            normalized
        );

    }


    async function withLock(
        id,
        operation,
        callback
    ) {

        if (
            !acquireLock(
                id,
                operation
            )
        ) {

            warn(
                "Operation bereits aktiv:",
                id,
                operation
            );

            return null;

        }

        try {

            return await callback();

        } finally {

            releaseLock(
                id
            );

        }

    }


    /* =====================================================
       APP NORMALIZATION
       ===================================================== */

    function normalizeApp(
        config
    ) {

        config =
            config || {};

        const id =
            createId(
                config.id ||
                config.appId ||
                config.name ||
                config.title
            );

        if (!id) {

            return null;

        }

        const dependencies =
            Array.isArray(
                config.dependencies
            )
                ? [
                    ...new Set(
                        config.dependencies
                            .map(createId)
                            .filter(Boolean)
                    )
                ]
                : [];


        const permissions =
            Array.isArray(
                config.permissions
            )
                ? [
                    ...new Set(
                        config.permissions
                            .map(
                                function (item) {
                                    return String(
                                        item
                                    ).trim();
                                }
                            )
                            .filter(Boolean)
                    )
                ]
                : [];


        return {

            id:
                id,

            appId:
                id,

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
                permissions,

            dependencies:
                dependencies,

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


    /* =====================================================
       STATUS
       ===================================================== */

    function setAppStatus(
        app,
        status
    ) {

        if (!app) {

            return;

        }

        const previous =
            app.status;

        app.status =
            status;

        app.updatedAt =
            Date.now();

        if (
            previous !==
            status
        ) {

            emit(
                "status-changed",
                {
                    app:
                        app,

                    previousStatus:
                        previous,

                    status:
                        status

                }
            );

        }

    }


    /* =====================================================
       APP REGISTRATION
       ===================================================== */

    function registerApp(
        config
    ) {

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
         * EXISTIERENDE APP AKTUALISIEREN
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
                        ? [...app.permissions]
                        : [
                            ...(existing.permissions || [])
                        ],

                dependencies:
                    app.dependencies.length
                        ? [...app.dependencies]
                        : [
                            ...(existing.dependencies || [])
                        ],

                createdAt:
                    existing.createdAt ||
                    app.createdAt,

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


            syncAppWithRegistry(
                merged
            );

            registerAppRoute(
                merged.id
            );

            registerAppWithLauncher(
                merged.id
            );


            return merged;

        }


        /*
         * NEUE APP
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


        syncAppWithRegistry(
            app
        );

        registerAppRoute(
            app.id
        );

        registerAppWithLauncher(
            app.id
        );


        return app;

    }


    function registerApps(
        list
    ) {

        if (
            !Array.isArray(
                list
            )
        ) {

            return [];

        }

        const result = [];

        list.forEach(
            function (config) {

                const app =
                    registerApp(
                        config
                    );

                if (app) {

                    result.push(
                        app
                    );

                }

            }
        );

        return result;

    }


    /* =====================================================
       APP ACCESS
       ===================================================== */

    function getApp(
        id
    ) {

        const normalized =
            createId(
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


    function getAppsByCategory(
        category
    ) {

        const value =
            String(
                category ||
                ""
            )
            .trim()
            .toLowerCase();

        if (!value) {

            return [];

        }

        return getApps().filter(
            function (app) {

                return String(
                    app.category ||
                    ""
                )
                .trim()
                .toLowerCase() ===
                value;

            }
        );

    }


    function searchApps(
        query
    ) {

        const value =
            String(
                query ||
                ""
            )
            .trim()
            .toLowerCase();

        if (!value) {

            return getApps();

        }

        return getApps().filter(
            function (app) {

                const haystack = [

                    app.id,
                    app.name,
                    app.title,
                    app.description,
                    app.category

                ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

                return haystack.indexOf(
                    value
                ) !== -1;

            }
        );

    }


    function hasApp(
        id
    ) {

        const normalized =
            createId(
                id
            );

        return (
            !!normalized &&
            state.apps.has(
                normalized
            )
        );

    }


    /* =====================================================
       RUNTIME ACCESS
       ===================================================== */

    function getRunningApps() {

        return Array.from(
            state.runningApps.values()
        );

    }


    function getRunningApp(
        id
    ) {

        const normalized =
            createId(
                id
            );

        if (!normalized) {

            return null;

        }

        return (
            state.runningApps.get(
                normalized
            ) ||
            null
        );

    }


    function isRunning(
        id
    ) {

        const normalized =
            createId(
                id
            );

        return (
            !!normalized &&
            state.runningApps.has(
                normalized
            )
        );

    }


    function isMinimized(
        id
    ) {

        const normalized =
            createId(
                id
            );

        return (
            !!normalized &&
            state.minimizedApps.has(
                normalized
            )
        );

    }


    function getActiveApp() {

        if (
            !state.activeAppId
        ) {

            return null;

        }

        return getApp(
            state.activeAppId
        );

    }


    function getActiveRuntime() {

        if (
            !state.activeAppId
        ) {

            return null;

        }

        return (
            state.runningApps.get(
                state.activeAppId
            ) ||
            null
        );

    }


    function getActiveAppId() {

        return (
            state.activeAppId ||
            null
        );

    }


    function getPreviousApp() {

        if (
            !state.previousAppId
        ) {

            return null;

        }

        return getApp(
            state.previousAppId
        );

    }


    /* =====================================================
       DEPENDENCIES
       ===================================================== */

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

                const dependencyId =
                    createId(
                        dependency
                    );

                if (!dependencyId) {

                    return true;

                }

                const dependencyApp =
                    state.apps.get(
                        dependencyId
                    );

                return !(
                    dependencyApp &&
                    dependencyApp.enabled !== false
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


    async function startDependencies(
        app,
        options
    ) {

        if (!app) {

            return false;

        }

        const dependencies =
            Array.isArray(
                app.dependencies
            )
                ? app.dependencies
                : [];


        for (
            const dependencyId of dependencies
        ) {

            const dependency =
                getApp(
                    dependencyId
                );

            if (!dependency) {

                return false;

            }

            if (
                dependency.enabled ===
                false
            ) {

                return false;

            }

            if (
                !isRunning(
                    dependency.id
                )
            ) {

                const runtime =
                    await startApp(
                        dependency.id,
                        {
                            ...(options || {}),
                            dependencyOf:
                                app.id,
                            automaticDependency:
                                true
                        }
                    );

                if (!runtime) {

                    return false;

                }

            }

        }

        return true;

    }


    /* =====================================================
       RUNTIME CONTEXT
       ===================================================== */

    function createRuntimeContext(
        app,
        options
    ) {

        const runtime = {

            id:
                app.id,

            appId:
                app.id,

            instanceId:
                app.id,

            app:
                app,

            options:
                options || {},

            status:
                "created",

            initialized:
                false,

            started:
                false,

            active:
                false,

            minimized:
                false,

            startedAt:
                null,

            initializedAt:
                null,

            activatedAt:
                null,

            minimizedAt:
                null,

            stoppedAt:
                null,

            services: {

                kernel:
                    getKernel(),

                system:
                    getSystem(),

                registry:
                    getRegistry(),

                router:
                    getRouter(),

                launcher:
                    getLauncher(),

                windowManager:
                    getWindowManager(),

                appManager:
                    api

            },

            manager:
                api,

            os:
                HalDoOS,

            window:
                window,

            document:
                document,

            emit:
                function (
                    event,
                    data
                ) {

                    emit(
                        "app:" + app.id + ":" + event,
                        {
                            app:
                                app,

                            runtime:
                                runtime,

                            data:
                                data
                        }
                    );

                },

            getApp:
                function (
                    id
                ) {

                    return getApp(id);

                },

            getService:
                function (
                    name
                ) {

                    const services =
                        runtime.services;

                    return (
                        services[name] ||
                        null
                    );

                }

        };


        return runtime;

    }


    /* =====================================================
       CALLBACK EXECUTION
       ===================================================== */

    async function callLifecycle(
        app,
        method,
        runtime,
        options
    ) {

        if (
            !app ||
            typeof app[method] !==
            "function"
        ) {

            return true;

        }

        try {

            const result =
                await app[method](
                    runtime,
                    options || {}
                );

            if (
                result ===
                false
            ) {

                return false;

            }

            return true;

        } catch (exception) {

            reportError(
                "APP_" +
                method.toUpperCase() +
                "_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    method:
                        method
                }
            );

            return false;

        }

    }


    /* =====================================================
       INITIALIZE APP
       ===================================================== */

    async function initializeApp(
        id,
        options
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            return null;

        }


        if (
            state.initializedApps.has(
                app.id
            )
        ) {

            return (
                state.runningApps.get(
                    app.id
                ) ||
                {
                    app:
                        app,

                    id:
                        app.id,

                    initialized:
                        true
                }
            );

        }


        return withLock(
            app.id,
            "initialize",
            async function () {

                if (
                    state.initializedApps.has(
                        app.id
                    )
                ) {

                    return (
                        state.runningApps.get(
                            app.id
                        ) ||
                        null
                    );

                }


                const runtime =
                    createRuntimeContext(
                        app,
                        options
                    );

                runtime.status =
                    "initializing";

                setAppStatus(
                    app,
                    "initializing"
                );


                emit(
                    "initializing-app",
                    {
                        app:
                            app,

                        runtime:
                            runtime
                    }
                );


                const initialized =
                    await callLifecycle(
                        app,
                        "init",
                        runtime,
                        options
                    );


                if (!initialized) {

                    runtime.status =
                        "error";

                    setAppStatus(
                        app,
                        "error"
                    );

                    emit(
                        "init-failed",
                        {
                            app:
                                app,

                            runtime:
                                runtime
                        }
                    );

                    return null;

                }


                runtime.initialized =
                    true;

                runtime.initializedAt =
                    Date.now();

                runtime.status =
                    "initialized";


                state.initializedApps.add(
                    app.id
                );


                setAppStatus(
                    app,
                    "registered"
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


                return runtime;

            }
        );

    }


    /* =====================================================
       START APP
       ===================================================== */

    async function startApp(
        id,
        options
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            reportError(
                "APP_NOT_FOUND",
                new Error(
                    "App nicht gefunden: " +
                    String(id)
                ),
                {
                    id:
                        id
                }
            );

            return null;

        }


        if (
            app.enabled ===
            false
        ) {

            setAppStatus(
                app,
                "disabled"
            );

            emit(
                "app-disabled",
                {
                    app:
                        app
                }
            );

            return null;

        }


        /*
         * Singleton
         */

        if (
            app.singleton &&
            state.runningApps.has(
                app.id
            )
        ) {

            const existing =
                state.runningApps.get(
                    app.id
                );

            if (
                options &&
                options.activate !==
                false
            ) {

                await activateApp(
                    app.id,
                    options
                );

            }

            return existing;

        }


        /*
         * Dependencies
         */

        const missing =
            getMissingDependencies(
                app
            );

        if (
            missing.length > 0
        ) {

            const automatic =
                options &&
                options.startDependencies ===
                true;


            if (automatic) {

                const dependenciesStarted =
                    await startDependencies(
                        app,
                        options
                    );

                if (
                    !dependenciesStarted
                ) {

                    setAppStatus(
                        app,
                        "dependency-error"
                    );

                    emit(
                        "dependency-error",
                        {
                            app:
                                app,

                            missing:
                                getMissingDependencies(
                                    app
                                )
                        }
                    );

                    return null;

                }

            } else {

                setAppStatus(
                    app,
                    "dependency-error"
                );

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

        }


        return withLock(
            app.id,
            "start",
            async function () {

                /*
                 * Nach Lock erneut prüfen.
                 */

                if (
                    app.singleton &&
                    state.runningApps.has(
                        app.id
                    )
                ) {

                    return state.runningApps.get(
                        app.id
                    );

                }


                let runtime =
                    state.runningApps.get(
                        app.id
                    );


                /*
                 * Init
                 */

                if (
                    !state.initializedApps.has(
                        app.id
                    )
                ) {

                    runtime =
                        await initializeApp(
                            app.id,
                            options
                        );

                    if (!runtime) {

                        return null;

                    }

                }


                /*
                 * Eigene Runtime erstellen,
                 * falls Init keine aktive Runtime
                 * hinterlegt hat.
                 */

                if (
                    !runtime ||
                    !runtime.app
                ) {

                    runtime =
                        createRuntimeContext(
                            app,
                            options
                        );

                    runtime.initialized =
                        true;

                }


                runtime.startedAt =
                    Date.now();

                runtime.status =
                    "starting";


                setAppStatus(
                    app,
                    "starting"
                );


                /*
                 * Runtime vor start()
                 * registrieren.
                 */

                state.runningApps.set(
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


                const started =
                    await callLifecycle(
                        app,
                        "start",
                        runtime,
                        options
                    );


                if (!started) {

                    state.runningApps.delete(
                        app.id
                    );

                    runtime.status =
                        "error";

                    runtime.started =
                        false;

                    setAppStatus(
                        app,
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


                state.minimizedApps.delete(
                    app.id
                );


                runtime.status =
                    "running";

                runtime.started =
                    true;

                runtime.active =
                    false;

                runtime.minimized =
                    false;


                setAppStatus(
                    app,
                    "running"
                );


                state.statistics.started +=
                    1;


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
        );

    }


    /* =====================================================
       OPEN APP
       ===================================================== */

    async function openApp(
        id,
        options
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            reportError(
                "APP_NOT_FOUND",
                new Error(
                    "App nicht gefunden: " +
                    String(id)
                ),
                {
                    id:
                        id
                }
            );

            return null;

        }


        /*
         * Bereits laufende App
         */

        if (
            state.runningApps.has(
                app.id
            )
        ) {

            if (
                state.minimizedApps.has(
                    app.id
                )
            ) {

                return restoreApp(
                    app.id,
                    options
                );

            }


            await activateApp(
                app.id,
                options
            );


            return state.runningApps.get(
                app.id
            );

        }


        const runtime =
            await startApp(
                app.id,
                {
                    ...(options || {}),
                    startDependencies:
                        options &&
                        options.startDependencies ===
                        true
                }
            );


        if (!runtime) {

            return null;

        }


        /*
         * Window öffnen.
         */

        openAppWindow(
            app.id,
            options
        );


        /*
         * App Open Callback.
         */

        const opened =
            await callLifecycle(
                app,
                "open",
                runtime,
                options
            );


        if (!opened) {

            warn(
                "App open callback returned false:",
                app.id
            );

        }


        state.statistics.opened +=
            1;


        emit(
            "opened",
            {
                app:
                    app,

                runtime:
                    runtime
            }
        );


        await activateApp(
            app.id,
            options
        );


        return runtime;

    }


    /* =====================================================
       ACTIVATE APP
       ===================================================== */

    async function activateApp(
        id,
        options
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            return false;

        }


        const runtime =
            state.runningApps.get(
                app.id
            );

        if (!runtime) {

            return false;

        }


        const previousId =
            state.activeAppId;


        /*
         * Vorherige App deaktivieren.
         */

        if (
            previousId &&
            previousId !==
            app.id
        ) {

            const previousApp =
                getApp(
                    previousId
                );

            const previousRuntime =
                state.runningApps.get(
                    previousId
                );


            if (
                previousApp &&
                previousRuntime
            ) {

                await callLifecycle(
                    previousApp,
                    "onDeactivate",
                    previousRuntime,
                    {}
                );


                previousRuntime.active =
                    false;

                if (
                    previousRuntime.status ===
                    "active"
                ) {

                    previousRuntime.status =
                        "running";

                }


                if (
                    previousApp.status ===
                    "active"
                ) {

                    setAppStatus(
                        previousApp,
                        "running"
                    );

                }


                state.statistics.deactivated +=
                    1;


                emit(
                    "deactivated",
                    {
                        app:
                            previousApp,

                        runtime:
                            previousRuntime
                    }
                );

            }

        }


        state.previousAppId =
            previousId ||
            null;

        state.activeAppId =
            app.id;


        state.minimizedApps.delete(
            app.id
        );


        runtime.minimized =
            false;

        runtime.activatedAt =
            Date.now();

        runtime.active =
            true;

        runtime.status =
            "active";


        setAppStatus(
            app,
            "active"
        );


        /*
         * Window fokussieren.
         */

        focusAppWindow(
            app.id
        );


        /*
         * App Callback.
         */

        await callLifecycle(
            app,
            "onActivate",
            runtime,
            options
        );


        state.statistics.activated +=
            1;


        emit(
            "active-changed",
            {
                current:
                    app.id,

                previous:
                    previousId ||
                    null
            }
        );


        emit(
            "activated",
            {
                app:
                    app,

                runtime:
                    runtime,

                previous:
                    previousId ||
                    null
            }
        );


        /*
         * Router informieren.
         */

        connectRouter(
            "focused",
            app
        );


        return true;

    }


    async function setActiveApp(
        id
    ) {

        return activateApp(
            id
        );

    }


    /* =====================================================
       DEACTIVATE APP
       ===================================================== */

    async function deactivateApp(
        id
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            return false;

        }


        const runtime =
            state.runningApps.get(
                app.id
            );

        if (!runtime) {

            return false;

        }


        await callLifecycle(
            app,
            "onDeactivate",
            runtime,
            {}
        );


        runtime.active =
            false;


        if (
            state.activeAppId ===
            app.id
        ) {

            state.previousAppId =
                app.id;

            state.activeAppId =
                null;

            runtime.status =
                "running";

            setAppStatus(
                app,
                "running"
            );

        }


        state.statistics.deactivated +=
            1;


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


    /* =====================================================
       MINIMIZE APP
       ===================================================== */

    async function minimizeApp(
        id
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            return false;

        }


        const runtime =
            state.runningApps.get(
                app.id
            );

        if (!runtime) {

            return false;

        }


        if (
            state.minimizedApps.has(
                app.id
            )
        ) {

            return true;

        }


        await callLifecycle(
            app,
            "minimize",
            runtime,
            {}
        );


        minimizeAppWindow(
            app.id
        );


        state.minimizedApps.add(
            app.id
        );


        runtime.minimizedAt =
            Date.now();

        runtime.minimized =
            true;

        runtime.active =
            false;

        runtime.status =
            "minimized";


        setAppStatus(
            app,
            "minimized"
        );


        if (
            state.activeAppId ===
            app.id
        ) {

            const previous =
                state.activeAppId;

            await deactivateApp(
                app.id
            );


            state.previousAppId =
                previous;

            state.activeAppId =
                null;


            emit(
                "active-changed",
                {
                    current:
                        null,

                    previous:
                        previous
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


    /* =====================================================
       RESTORE APP
       ===================================================== */

    async function restoreApp(
        id,
        options
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            return false;

        }


        let runtime =
            state.runningApps.get(
                app.id
            );


        if (!runtime) {

            runtime =
                await startApp(
                    app.id,
                    options
                );

            if (!runtime) {

                return false;

            }

            openAppWindow(
                app.id,
                options
            );

        }


        await callLifecycle(
            app,
            "restore",
            runtime,
            options
        );


        restoreAppWindow(
            app.id
        );


        state.minimizedApps.delete(
            app.id
        );


        runtime.minimizedAt =
            null;

        runtime.minimized =
            false;

        runtime.active =
            false;

        runtime.status =
            "running";


        setAppStatus(
            app,
            "running"
        );


        state.statistics.restored +=
            1;


        await activateApp(
            app.id,
            options
        );


        emit(
            "restored",
            {
                app:
                    app,

                runtime:
                    runtime
            }
        );


        return runtime;

    }


    /* =====================================================
       STOP APP
       ===================================================== */

    async function stopApp(
        id
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            return false;

        }


        const runtime =
            state.runningApps.get(
                app.id
            );

        if (!runtime) {

            return true;

        }


        return withLock(
            app.id,
            "stop",
            async function () {

                runtime.status =
                    "stopping";

                setAppStatus(
                    app,
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


                await callLifecycle(
                    app,
                    "stop",
                    runtime,
                    {}
                );


                /*
                 * Fenster schließen.
                 */

                closeAppWindow(
                    app.id
                );


                /*
                 * Deaktivierung.
                 */

                if (
                    runtime.active ||
                    state.activeAppId ===
                    app.id
                ) {

                    await callLifecycle(
                        app,
                        "onDeactivate",
                        runtime,
                        {}
                    );

                }


                runtime.active =
                    false;


                state.runningApps.delete(
                    app.id
                );

                state.minimizedApps.delete(
                    app.id
                );


                if (
                    state.activeAppId ===
                    app.id
                ) {

                    state.previousAppId =
                        app.id;

                    state.activeAppId =
                        null;

                }


                runtime.started =
                    false;

                runtime.status =
                    "stopped";

                runtime.stoppedAt =
                    Date.now();


                setAppStatus(
                    app,
                    "registered"
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


                /*
                 * Nächste laufende App aktivieren.
                 */

                if (
                    !state.activeAppId &&
                    state.runningApps.size > 0
                ) {

                    const remaining =
                        getRunningApps();

                    const next =
                        remaining[
                            remaining.length - 1
                        ];

                    if (next) {

                        await activateApp(
                            next.id
                        );

                    }

                }


                return true;

            }
        );

    }


    /* =====================================================
       CLOSE APP
       ===================================================== */

    async function closeApp(
        id,
        options
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            return false;

        }


        const runtime =
            state.runningApps.get(
                app.id
            );

        if (!runtime) {

            return true;

        }


        return withLock(
            app.id,
            "close",
            async function () {

                await callLifecycle(
                    app,
                    "close",
                    runtime,
                    options
                );


                await stopApp(
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
                            runtime
                    }
                );


                return true;

            }
        );

    }


    /* =====================================================
       DESTROY APP
       ===================================================== */

    async function destroyApp(
        id
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            return false;

        }


        const runtime =
            state.runningApps.get(
                app.id
            );


        if (runtime) {

            await closeApp(
                app.id
            );

        }


        await callLifecycle(
            app,
            "destroy",
            runtime || {
                app:
                    app,

                id:
                    app.id,

                manager:
                    api,

                os:
                    HalDoOS
            },
            {}
        );


        unregisterFromExternalSystems(
            app
        );


        state.apps.delete(
            app.id
        );

        state.runningApps.delete(
            app.id
        );

        state.minimizedApps.delete(
            app.id
        );

        state.initializedApps.delete(
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


    /* =====================================================
       STOP ALL APPS
       ===================================================== */

    async function stopAllApps() {

        const ids =
            Array.from(
                state.runningApps.keys()
            );

        let stopped =
            0;


        for (
            const id of ids
        ) {

            if (
                await stopApp(
                    id
                )
            ) {

                stopped +=
                    1;

            }

        }


        state.activeAppId =
            null;


        emit(
            "all-stopped",
            {
                count:
                    stopped
            }
        );


        return stopped;

    }


    /* =====================================================
       CLOSE ALL APPS
       ===================================================== */

    async function closeAllApps() {

        const ids =
            Array.from(
                state.runningApps.keys()
            );

        let closed =
            0;


        for (
            const id of ids
        ) {

            if (
                await closeApp(
                    id
                )
            ) {

                closed +=
                    1;

            }

        }


        state.activeAppId =
            null;


        emit(
            "all-closed",
            {
                count:
                    closed
            }
        );


        return closed;

    }


    /* =====================================================
       ENABLE APP
       ===================================================== */

    function enableApp(
        id
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            return false;

        }


        app.enabled =
            true;

        app.updatedAt =
            Date.now();


        setAppStatus(
            app,
            "registered"
        );


        state.statistics.enabled +=
            1;


        emit(
            "enabled",
            {
                app:
                    app
            }
        );


        syncAppWithRegistry(
            app
        );

        registerAppWithLauncher(
            app.id
        );


        return true;

    }


    /* =====================================================
       DISABLE APP
       ===================================================== */

    async function disableApp(
        id
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            return false;

        }


        if (
            state.runningApps.has(
                app.id
            )
        ) {

            await closeApp(
                app.id
            );

        }


        app.enabled =
            false;

        app.updatedAt =
            Date.now();


        setAppStatus(
            app,
            "disabled"
        );


        state.statistics.disabled +=
            1;


        emit(
            "disabled",
            {
                app:
                    app
            }
        );


        syncAppWithRegistry(
            app
        );


        return true;

    }


    /* =====================================================
       UPDATE APP
       ===================================================== */

    function updateApp(
        id,
        changes
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            return null;

        }


        if (
            !changes ||
            typeof changes !==
            "object"
        ) {

            return app;

        }


        const lifecycleKeys = [

            "init",
            "start",
            "open",
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
                        ...(app.permissions || [])
                    ],

            dependencies:
                Array.isArray(
                    changes.dependencies
                )
                    ? [
                        ...changes.dependencies
                            .map(createId)
                            .filter(Boolean)
                    ]
                    : [
                        ...(app.dependencies || [])
                    ],

            updatedAt:
                Date.now()

        };


        /*
         * Lifecycle-Funktionen sauber übernehmen.
         */

        lifecycleKeys.forEach(
            function (key) {

                if (
                    Object.prototype.hasOwnProperty.call(
                        changes,
                        key
                    )
                ) {

                    merged[key] =
                        typeof changes[key] ===
                        "function"
                            ? changes[key]
                            : null;

                }

            }
        );


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
                    app
            }
        );


        syncAppWithRegistry(
            merged
        );

        registerAppRoute(
            merged.id
        );

        registerAppWithLauncher(
            merged.id
        );


        return merged;

    }


    /* =====================================================
       UNREGISTER APP
       ===================================================== */

    async function unregisterApp(
        id
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            return false;

        }


        if (
            state.runningApps.has(
                app.id
            )
        ) {

            await closeApp(
                app.id
            );

        }


        unregisterFromExternalSystems(
            app
        );


        state.apps.delete(
            app.id
        );

        state.runningApps.delete(
            app.id
        );

        state.minimizedApps.delete(
            app.id
        );

        state.initializedApps.delete(
            app.id
        );


        if (
            state.activeAppId ===
            app.id
        ) {

            state.activeAppId =
                null;

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


    /* =====================================================
       WINDOW MANAGER
       ===================================================== */

    function openAppWindow(
        id,
        options
    ) {

        const app =
            getApp(
                id
            );

        const runtime =
            getRunningApp(
                id
            );

        const manager =
            getWindowManager();


        if (
            !app ||
            !runtime ||
            !manager
        ) {

            return false;

        }


        try {

            const config = {

                ...app,

                ...(
                    options &&
                    typeof options ===
                    "object"
                        ? options
                        : {}
                ),

                appId:
                    app.id,

                runtime:
                    runtime

            };


            if (
                hasMethod(
                    manager,
                    "createWindow"
                )
            ) {

                manager.createWindow(
                    runtime.id,
                    config
                );

                state.connections.windowManager =
                    true;

                return true;

            }


            if (
                hasMethod(
                    manager,
                    "create"
                )
            ) {

                manager.create(
                    runtime.id,
                    config
                );

                state.connections.windowManager =
                    true;

                return true;

            }


            if (
                hasMethod(
                    manager,
                    "openWindow"
                )
            ) {

                manager.openWindow(
                    runtime.id,
                    config
                );

                state.connections.windowManager =
                    true;

                return true;

            }


            if (
                hasMethod(
                    manager,
                    "open"
                )
            ) {

                manager.open(
                    runtime,
                    config
                );

                state.connections.windowManager =
                    true;

                return true;

            }

        } catch (exception) {

            reportError(
                "WINDOW_OPEN_ERROR",
                exception,
                {
                    appId:
                        app.id
                }
            );

        }


        return false;

    }


    function focusAppWindow(
        id
    ) {

        const runtime =
            getRunningApp(
                id
            );

        const manager =
            getWindowManager();


        if (
            !runtime ||
            !manager
        ) {

            return false;

        }


        try {

            if (
                hasMethod(
                    manager,
                    "focusWindow"
                )
            ) {

                manager.focusWindow(
                    runtime.id
                );

                return true;

            }


            if (
                hasMethod(
                    manager,
                    "focus"
                )
            ) {

                manager.focus(
                    runtime.id
                );

                return true;

            }


            if (
                hasMethod(
                    manager,
                    "activateWindow"
                )
            ) {

                manager.activateWindow(
                    runtime.id
                );

                return true;

            }


            if (
                hasMethod(
                    manager,
                    "activate"
                )
            ) {

                manager.activate(
                    runtime.id
                );

                return true;

            }

        } catch (exception) {

            reportError(
                "WINDOW_FOCUS_ERROR",
                exception,
                {
                    appId:
                        id
                }
            );

        }


        return false;

    }


    function minimizeAppWindow(
        id
    ) {

        const runtime =
            getRunningApp(
                id
            );

        const manager =
            getWindowManager();


        if (
            !runtime ||
            !manager
        ) {

            return false;

        }


        try {

            if (
                hasMethod(
                    manager,
                    "minimizeWindow"
                )
            ) {

                manager.minimizeWindow(
                    runtime.id
                );

                return true;

            }


            if (
                hasMethod(
                    manager,
                    "minimize"
                )
            ) {

                manager.minimize(
                    runtime.id
                );

                return true;

            }

        } catch (exception) {

            reportError(
                "WINDOW_MINIMIZE_ERROR",
                exception,
                {
                    appId:
                        id
                }
            );

        }


        return false;

    }


    function restoreAppWindow(
        id
    ) {

        const runtime =
            getRunningApp(
                id
            );

        const manager =
            getWindowManager();


        if (
            !runtime ||
            !manager
        ) {

            return false;

        }


        try {

            if (
                hasMethod(
                    manager,
                    "restoreWindow"
                )
            ) {

                manager.restoreWindow(
                    runtime.id
                );

                return true;

            }


            if (
                hasMethod(
                    manager,
                    "restore"
                )
            ) {

                manager.restore(
                    runtime.id
                );

                return true;

            }

        } catch (exception) {

            reportError(
                "WINDOW_RESTORE_ERROR",
                exception,
                {
                    appId:
                        id
                }
            );

        }


        return false;

    }


    function closeAppWindow(
        id
    ) {

        const runtime =
            getRunningApp(
                id
            );

        const manager =
            getWindowManager();


        if (
            !runtime ||
            !manager
        ) {

            return false;

        }


        try {

            if (
                hasMethod(
                    manager,
                    "closeWindow"
                )
            ) {

                manager.closeWindow(
                    runtime.id
                );

                return true;

            }


            if (
                hasMethod(
                    manager,
                    "close"
                )
            ) {

                manager.close(
                    runtime.id
                );

                return true;

            }


            if (
                hasMethod(
                    manager,
                    "destroyWindow"
                )
            ) {

                manager.destroyWindow(
                    runtime.id
                );

                return true;

            }

        } catch (exception) {

            reportError(
                "WINDOW_CLOSE_ERROR",
                exception,
                {
                    appId:
                        id
                }
            );

        }


        return false;

    }


    /* =====================================================
       ROUTER
       ===================================================== */

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
                "focused"
            ) {

                if (
                    hasMethod(
                        router,
                        "navigate"
                    ) &&
                    app.route
                ) {

                    router.navigate(
                        app.route
                    );

                    state.connections.router =
                        true;

                    return true;

                }


                if (
                    hasMethod(
                        router,
                        "focus"
                    )
                ) {

                    router.focus(
                        app.id
                    );

                    state.connections.router =
                        true;

                    return true;

                }


                if (
                    hasMethod(
                        router,
                        "activate"
                    )
                ) {

                    router.activate(
                        app.id
                    );

                    state.connections.router =
                        true;

                    return true;

                }

            }


            if (
                action ===
                "closed"
            ) {

                if (
                    hasMethod(
                        router,
                        "back"
                    )
                ) {

                    router.back();

                    state.connections.router =
                        true;

                    return true;

                }

            }

        } catch (exception) {

            reportError(
                "ROUTER_ERROR",
                exception,
                {
                    action:
                        action,

                    appId:
                        app.id
                }
            );

        }


        return false;

    }


    function registerAppRoute(
        id
    ) {

        const app =
            getApp(
                id
            );

        const router =
            getRouter();


        if (
            !app ||
            !router ||
            !app.route
        ) {

            return false;

        }


        try {

            if (
                hasMethod(
                    router,
                    "has"
                ) &&
                router.has(
                    app.route
                )
            ) {

                state.connections.router =
                    true;

                return true;

            }


            const routeConfig = {

                app:
                    app.id,

                appId:
                    app.id,

                id:
                    app.id,

                name:
                    app.name,

                title:
                    app.title,

                aliases: [

                    app.id,
                    app.name,
                    app.title

                ].filter(Boolean)

            };


            if (
                hasMethod(
                    router,
                    "register"
                )
            ) {

                router.register(
                    app.route,
                    routeConfig
                );

                state.connections.router =
                    true;


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


            if (
                hasMethod(
                    router,
                    "addRoute"
                )
            ) {

                router.addRoute(
                    app.route,
                    routeConfig
                );

                state.connections.router =
                    true;

                return true;

            }

        } catch (exception) {

            reportError(
                "ROUTE_REGISTER_ERROR",
                exception,
                {
                    appId:
                        app.id
                }
            );

        }


        return false;

    }


    function syncAllRoutes() {

        let synced =
            0;


        getApps().forEach(
            function (app) {

                if (
                    registerAppRoute(
                        app.id
                    )
                ) {

                    synced +=
                        1;

                }

            }
        );


        emit(
            "routes-synchronized",
            {
                total:
                    getApps().length,

                synced:
                    synced
            }
        );


        return synced;

    }


    /* =====================================================
       LAUNCHER
       ===================================================== */

    function registerAppWithLauncher(
        id
    ) {

        const app =
            getApp(
                id
            );

        const launcher =
            getLauncher();


        if (
            !app ||
            !launcher
        ) {

            return false;

        }


        try {

            if (
                hasMethod(
                    launcher,
                    "register"
                )
            ) {

                launcher.register(
                    app
                );

                state.connections.launcher =
                    true;


                emit(
                    "launcher-registered",
                    {
                        app:
                            app
                    }
                );


                return true;

            }


            if (
                hasMethod(
                    launcher,
                    "registerApp"
                )
            ) {

                launcher.registerApp(
                    app
                );

                state.connections.launcher =
                    true;

                return true;

            }


            if (
                hasMethod(
                    launcher,
                    "addApp"
                )
            ) {

                launcher.addApp(
                    app
                );

                state.connections.launcher =
                    true;

                return true;

            }

        } catch (exception) {

            reportError(
                "LAUNCHER_REGISTER_ERROR",
                exception,
                {
                    appId:
                        app.id
                }
            );

        }


        return false;

    }


    function registerAllAppsWithLauncher() {

        let registered =
            0;


        getApps().forEach(
            function (app) {

                if (
                    registerAppWithLauncher(
                        app.id
                    )
                ) {

                    registered +=
                        1;

                }

            }
        );


        emit(
            "launcher-synchronized",
            {
                total:
                    getApps().length,

                registered:
                    registered
            }
        );


        return registered;

    }


    /* =====================================================
       REGISTRY
       ===================================================== */

    function syncAppWithRegistry(
        app
    ) {

        const registry =
            getRegistry();


        if (
            !app ||
            !registry
        ) {

            return false;

        }


        try {

            if (
                hasMethod(
                    registry,
                    "has"
                ) &&
                registry.has(
                    app.id
                )
            ) {

                if (
                    hasMethod(
                        registry,
                        "update"
                    )
                ) {

                    registry.update(
                        app.id,
                        app
                    );

                    state.connections.registry =
                        true;

                    return true;

                }


                if (
                    hasMethod(
                        registry,
                        "register"
                    )
                ) {

                    registry.register(
                        app
                    );

                    state.connections.registry =
                        true;

                    return true;

                }

            }


            if (
                hasMethod(
                    registry,
                    "register"
                )
            ) {

                registry.register(
                    app
                );

                state.connections.registry =
                    true;


                emit(
                    "registry-synced",
                    {
                        app:
                            app
                    }
                );


                return true;

            }


            if (
                hasMethod(
                    registry,
                    "add"
                )
            ) {

                registry.add(
                    app
                );

                state.connections.registry =
                    true;

                return true;

            }

        } catch (exception) {

            reportError(
                "REGISTRY_SYNC_ERROR",
                exception,
                {
                    appId:
                        app.id
                }
            );

        }


        return false;

    }


    function syncAllRegistries() {

        let synced =
            0;


        getApps().forEach(
            function (app) {

                if (
                    syncAppWithRegistry(
                        app
                    )
                ) {

                    synced +=
                        1;

                }

            }
        );


        emit(
            "registry-synchronized",
            {
                total:
                    getApps().length,

                synced:
                    synced
            }
        );


        return synced;

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
                hasMethod(
                    registry,
                    "getAll"
                )
            ) {

                definitions =
                    registry.getAll();

            } else if (
                hasMethod(
                    registry,
                    "getApps"
                )
            ) {

                definitions =
                    registry.getApps();

            } else if (
                hasMethod(
                    registry,
                    "list"
                )
            ) {

                definitions =
                    registry.list();

            } else if (
                hasMethod(
                    registry,
                    "getRegistry"
                )
            ) {

                definitions =
                    registry.getRegistry();

            }

        } catch (exception) {

            reportError(
                "REGISTRY_IMPORT_ERROR",
                exception
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

                const app =
                    normalizeApp(
                        definition
                    );

                if (!app) {

                    return;

                }


                if (
                    state.apps.has(
                        app.id
                    )
                ) {

                    return;

                }


                state.apps.set(
                    app.id,
                    app
                );


                imported +=
                    1;

                state.statistics.imported +=
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


        if (
            imported > 0
        ) {

            state.connections.registry =
                true;

        }


        return imported;

    }


    /* =====================================================
       EXTERNAL UNREGISTER
       ===================================================== */

    function unregisterFromExternalSystems(
        app
    ) {

        if (!app) {

            return;

        }


        const registry =
            getRegistry();

        const router =
            getRouter();

        const launcher =
            getLauncher();


        try {

            if (
                registry &&
                hasMethod(
                    registry,
                    "remove"
                )
            ) {

                registry.remove(
                    app.id
                );

            }

        } catch (exception) {

            reportError(
                "REGISTRY_REMOVE_ERROR",
                exception,
                {
                    appId:
                        app.id
                }
            );

        }


        try {

            if (
                router &&
                hasMethod(
                    router,
                    "unregister"
                ) &&
                app.route
            ) {

                router.unregister(
                    app.route
                );

            }

        } catch (exception) {

            reportError(
                "ROUTER_REMOVE_ERROR",
                exception,
                {
                    appId:
                        app.id
                }
            );

        }


        try {

            if (
                launcher &&
                hasMethod(
                    launcher,
                    "unregister"
                )
            ) {

                launcher.unregister(
                    app.id
                );

            } else if (
                launcher &&
                hasMethod(
                    launcher,
                    "removeApp"
                )
            ) {

                launcher.removeApp(
                    app.id
                );

            }

        } catch (exception) {

            reportError(
                "LAUNCHER_REMOVE_ERROR",
                exception,
                {
                    appId:
                        app.id
                }
            );

        }

    }


    /* =====================================================
       CONNECTIONS
       ===================================================== */

    function connectToKernel() {

        const kernel =
            getKernel();


        if (!kernel) {

            state.connections.kernel =
                false;

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


            emit(
                "kernel-connected",
                {
                    kernel:
                        kernel
                }
            );


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

            } else if (
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


            state.connections.system =
                true;


            emit(
                "system-connected",
                {
                    system:
                        system
                }
            );


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

        state.connections.launcher =
            !!getLauncher();

        state.connections.windowManager =
            !!getWindowManager();


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

            launcher:
                !!getLauncher(),

            windowManager:
                !!getWindowManager()

        };

    }


    /* =====================================================
       COUNTERS
       ===================================================== */

    function getAppCount() {

        return state.apps.size;

    }


    function getRunningAppCount() {

        return state.runningApps.size;

    }


    function getMinimizedAppCount() {

        return state.minimizedApps.size;

    }


    function getStatistics() {

        return {

            ...state.statistics

        };

    }


    /* =====================================================
       DIAGNOSTICS
       ===================================================== */

    function diagnostics() {

        const apps =
            getApps();

        const running =
            getRunningApps();


        return {

            manager:
                MANAGER_NAME,

            module:
                MODULE_ID,

            version:
                VERSION,

            initialized:
                state.initialized,

            ready:
                state.ready,

            initializing:
                state.initializing,

            appCount:
                apps.length,

            enabledAppCount:
                apps.filter(
                    function (app) {

                        return (
                            app.enabled !==
                            false
                        );

                    }
                ).length,

            disabledAppCount:
                apps.filter(
                    function (app) {

                        return (
                            app.enabled ===
                            false
                        );

                    }
                ).length,

            runningAppCount:
                running.length,

            minimizedAppCount:
                state.minimizedApps.size,

            initializedAppCount:
                state.initializedApps.size,

            lockedAppCount:
                state.operationLocks.size,

            activeAppId:
                state.activeAppId,

            previousAppId:
                state.previousAppId,

            connections:
                getConnectionStatus(),

            statistics:
                getStatistics(),

            startupQueue:
                [
                    ...state.startupQueue
                ],

            apps:
                apps.map(
                    function (app) {

                        return {

                            id:
                                app.id,

                            appId:
                                app.appId,

                            name:
                                app.name,

                            title:
                                app.title,

                            category:
                                app.category,

                            version:
                                app.version,

                            status:
                                app.status,

                            enabled:
                                app.enabled,

                            singleton:
                                app.singleton,

                            system:
                                app.system,

                            running:
                                state.runningApps.has(
                                    app.id
                                ),

                            initialized:
                                state.initializedApps.has(
                                    app.id
                                ),

                            minimized:
                                state.minimizedApps.has(
                                    app.id
                                ),

                            dependencies:
                                [
                                    ...(app.dependencies || [])
                                ],

                            missingDependencies:
                                getMissingDependencies(
                                    app
                                )

                        };

                    }
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* =====================================================
       HEALTH CHECK
       ===================================================== */

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
            !connections.system
        ) {

            problems.push(
                "System nicht verbunden."
            );

        }


        if (
            !connections.registry
        ) {

            problems.push(
                "App Registry nicht verbunden."
            );

        }


        if (
            !connections.router
        ) {

            problems.push(
                "App Router nicht verbunden."
            );

        }


        if (
            state.initialized &&
            !state.ready
        ) {

            problems.push(
                "App Manager ist initialisiert, aber noch nicht bereit."
            );

        }


        getApps().forEach(
            function (app) {

                const missing =
                    getMissingDependencies(
                        app
                    );

                if (
                    missing.length > 0 &&
                    app.enabled !== false
                ) {

                    problems.push(
                        "App " +
                        app.id +
                        " hat fehlende Dependencies: " +
                        missing.join(", ")
                    );

                }

            }
        );


        return {

            healthy:
                problems.length ===
                0,

            problems:
                problems,

            connections:
                connections,

            initialized:
                state.initialized,

            ready:
                state.ready,

            appCount:
                getAppCount(),

            runningAppCount:
                getRunningAppCount(),

            timestamp:
                new Date().toISOString()

        };

    }


    /* =====================================================
       STARTUP QUEUE
       ===================================================== */

    function queueApp(
        id,
        options
    ) {

        const app =
            getApp(
                id
            );

        if (!app) {

            return false;

        }


        state.startupQueue.push({

            id:
                app.id,

            options:
                options || {},

            queuedAt:
                Date.now()

        });


        emit(
            "queued",
            {
                app:
                    app,

                options:
                    options || {}
            }
        );


        return true;

    }


    function getStartupQueue() {

        return [
            ...state.startupQueue
        ];

    }


    function clearStartupQueue() {

        const count =
            state.startupQueue.length;

        state.startupQueue =
            [];


        emit(
            "queue-cleared",
            {
                count:
                    count
            }
        );


        return count;

    }


    async function processStartupQueue() {

        const queue =
            [
                ...state.startupQueue
            ];

        state.startupQueue =
            [];


        let started =
            0;


        for (
            const item of queue
        ) {

            if (!item) {

                continue;

            }


            const runtime =
                await openApp(
                    item.id,
                    item.options
                );


            if (runtime) {

                started +=
                    1;

            }

        }


        emit(
            "queue-processed",
            {
                total:
                    queue.length,

                started:
                    started
            }
        );


        return started;

    }


    /* =====================================================
       BULK OPERATIONS
       ===================================================== */

    async function startApps(
        ids,
        options
    ) {

        if (
            !Array.isArray(ids)
        ) {

            return [];

        }


        const result = [];


        for (
            const id of ids
        ) {

            const runtime =
                await startApp(
                    id,
                    options
                );

            if (runtime) {

                result.push(
                    runtime
                );

            }

        }


        return result;

    }


    async function openApps(
        ids,
        options
    ) {

        if (
            !Array.isArray(ids)
        ) {

            return [];

        }


        const result = [];


        for (
            const id of ids
        ) {

            const runtime =
                await openApp(
                    id,
                    options
                );

            if (runtime) {

                result.push(
                    runtime
                );

            }

        }


        return result;

    }


    /* =====================================================
       RESET RUNTIME
       ===================================================== */

    async function resetRuntime() {

        await stopAllApps();


        state.runningApps.clear();

        state.minimizedApps.clear();

        state.initializedApps.clear();

        state.operationLocks.clear();

        state.activeAppId =
            null;

        state.previousAppId =
            null;


        getApps().forEach(
            function (app) {

                if (
                    app.enabled ===
                    false
                ) {

                    setAppStatus(
                        app,
                        "disabled"
                    );

                } else {

                    setAppStatus(
                        app,
                        "registered"
                    );

                }

            }
        );


        emit(
            "runtime-reset",
            {
                diagnostics:
                    diagnostics()
            }
        );


        return true;

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    const api = {

        name:
            MANAGER_NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


        /*
         * State
         */

        getState:
            function () {

                return {

                    initialized:
                        state.initialized,

                    ready:
                        state.ready,

                    initializing:
                        state.initializing,

                    activeAppId:
                        state.activeAppId,

                    previousAppId:
                        state.previousAppId,

                    appCount:
                        state.apps.size,

                    runningAppCount:
                        state.runningApps.size,

                    minimizedAppCount:
                        state.minimizedApps.size

                };

            },


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
         * Registration
         */

        register:
            registerApp,

        registerApp:
            registerApp,

        registerApps:
            registerApps,

        unregister:
            unregisterApp,

        unregisterApp:
            unregisterApp,


        /*
         * App Access
         */

        get:
            getApp,

        getApp:
            getApp,

        getApps:
            getApps,

        getEnabledApps:
            getEnabledApps,

        getDisabledApps:
            getDisabledApps,

        getAppsByCategory:
            getAppsByCategory,

        search:
            searchApps,

        searchApps:
            searchApps,

        has:
            hasApp,

        hasApp:
            hasApp,


        /*
         * Runtime
         */

        getRunningApps:
            getRunningApps,

        getRunningApp:
            getRunningApp,

        isRunning:
            isRunning,

        isMinimized:
            isMinimized,

        getActiveApp:
            getActiveApp,

        getActiveRuntime:
            getActiveRuntime,

        getActiveAppId:
            getActiveAppId,

        getPreviousApp:
            getPreviousApp,

        setActiveApp:
            setActiveApp,


        /*
         * Lifecycle
         */

        initializeApp:
            initializeApp,

        initApp:
            initializeApp,

        start:
            startApp,

        startApp:
            startApp,

        open:
            openApp,

        openApp:
            openApp,

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

        stopAll:
            stopAllApps,

        stopAllApps:
            stopAllApps,

        closeAll:
            closeAllApps,

        closeAllApps:
            closeAllApps,


        /*
         * Bulk
         */

        startApps:
            startApps,

        openApps:
            openApps,


        /*
         * Enable / Disable
         */

        enable:
            enableApp,

        enableApp:
            enableApp,

        disable:
            disableApp,

        disableApp:
            disableApp,


        /*
         * Update
         */

        update:
            updateApp,

        updateApp:
            updateApp,


        /*
         * Dependencies
         */

        checkDependencies:
            function (id) {

                const app =
                    getApp(id);

                return checkDependencies(
                    app
                );

            },

        getMissingDependencies:
            function (id) {

                const app =
                    getApp(id);

                return getMissingDependencies(
                    app
                );

            },

        startDependencies:
            function (
                id,
                options
            ) {

                const app =
                    getApp(id);

                return startDependencies(
                    app,
                    options
                );

            },


        /*
         * Registry
         */

        importRegistry:
            importRegistry,

        syncAppWithRegistry:
            syncAppWithRegistry,

        syncAllRegistries:
            syncAllRegistries,


        /*
         * Router
         */

        registerAppRoute:
            registerAppRoute,

        syncAllRoutes:
            syncAllRoutes,


        /*
         * Launcher
         */

        registerAppWithLauncher:
            registerAppWithLauncher,

        registerAllAppsWithLauncher:
            registerAllAppsWithLauncher,


        /*
         * Window Manager
         */

        openAppWindow:
            openAppWindow,

        focusAppWindow:
            focusAppWindow,

        minimizeAppWindow:
            minimizeAppWindow,

        restoreAppWindow:
            restoreAppWindow,

        closeAppWindow:
            closeAppWindow,


        /*
         * Startup Queue
         */

        queueApp:
            queueApp,

        getStartupQueue:
            getStartupQueue,

        clearStartupQueue:
            clearStartupQueue,

        processStartupQueue:
            processStartupQueue,


        /*
         * Runtime Reset
         */

        resetRuntime:
            resetRuntime,


        /*
         * Statistics
         */

        getAppCount:
            getAppCount,

        getRunningAppCount:
            getRunningAppCount,

        getMinimizedAppCount:
            getMinimizedAppCount,

        getStatistics:
            getStatistics,


        /*
         * Connections
         */

        connectToKernel:
            connectToKernel,

        connectToSystem:
            connectToSystem,

        refreshConnections:
            refreshConnections,

        getConnectionStatus:
            getConnectionStatus,


        /*
         * Diagnostics
         */

        diagnostics:
            diagnostics,

        healthCheck:
            healthCheck

    };


    /* =====================================================
       GLOBAL EXPORT
       ===================================================== */

    window.HalDoAppManager =
        api;

    HalDoOS.appManager =
        api;

    window.HalDoOSAppManager =
        api;


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    async function initializeManager() {

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

        state.destroyed =
            false;


        emit(
            "initializing",
            {
                version:
                    VERSION
            }
        );


        try {

            /*
             * Services verbinden.
             */

            refreshConnections();


            /*
             * Registry importieren.
             */

            importRegistry();


            /*
             * Verbindungen erneut prüfen,
             * weil andere Module möglicherweise
             * während des Startups erscheinen.
             */

            refreshConnections();


            /*
             * Synchronisation.
             */

            syncAllRegistries();

            syncAllRoutes();

            registerAllAppsWithLauncher();


            /*
             * Kernel.
             */

            connectToKernel();


            /*
             * System.
             */

            connectToSystem();


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


            /*
             * Bereits vorhandene Queue
             * verarbeiten.
             */

            if (
                state.startupQueue.length > 0
            ) {

                processStartupQueue()
                    .catch(
                        function (exception) {

                            reportError(
                                "STARTUP_QUEUE_ERROR",
                                exception
                            );

                        }
                    );

            }


            return api;

        } catch (exception) {

            state.initializing =
                false;

            state.ready =
                false;


            reportError(
                "MANAGER_INIT_ERROR",
                exception
            );


            return api;

        }

    }


    /* =====================================================
       KERNEL READY HANDLER
       ===================================================== */

    function handleKernelReady() {

        refreshConnections();

        syncAllRegistries();

        syncAllRoutes();

        registerAllAppsWithLauncher();


        emit(
            "kernel-ready",
            {
                diagnostics:
                    diagnostics()
            }
        );

    }


    /* =====================================================
       GLOBAL EVENT CONNECTION
       ===================================================== */

    let kernelEventConnected =
        false;


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

            if (
                kernelEventConnected
            ) {

                return true;

            }


            try {

                kernel.on(
                    "kernel:ready",
                    handleKernelReady
                );

                kernelEventConnected =
                    true;

                return true;

            } catch (exception) {

                warn(
                    "Kernel Event-Verbindung fehlgeschlagen:",
                    exception
                );

            }

        }


        return false;

    }


    /* =====================================================
       DOM READY
       ===================================================== */

    function handleDOMReady() {

        connectGlobalEvents();

        initializeManager()
            .catch(
                function (exception) {

                    state.initializing =
                        false;

                    reportError(
                        "MANAGER_DOM_INIT_ERROR",
                        exception
                    );

                }
            );

    }


    /* =====================================================
       WINDOW LOAD
       ===================================================== */

    function handleWindowLoad() {

        /*
         * Falls Kernel / Registry / Router /
         * Launcher / WindowManager erst
         * nach DOMContentLoaded verfügbar
         * geworden sind.
         */

        connectGlobalEvents();

        refreshConnections();


        if (
            state.ready
        ) {

            syncAllRegistries();

            syncAllRoutes();

            registerAllAppsWithLauncher();

        }

    }


    /* =====================================================
       STARTUP
       ===================================================== */

    connectGlobalEvents();


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

    } else {

        handleDOMReady();

    }


    if (
        typeof window.addEventListener ===
        "function"
    ) {

        window.addEventListener(
            "load",
            handleWindowLoad,
            {
                once:
                    true
            }
        );

    }


    /* =====================================================
       FINAL EXPOSURE
       ===================================================== */

    window.HalDoOS =
        window.HalDoOS ||
        {};

    window.HalDoOS.appManager =
        api;


    /* =====================================================
       FINAL LOG
       ===================================================== */

    log(
        "HalDo AI OS 18 App Manager geladen.",
        VERSION
    );


    /* =====================================================
       END OF FILE
       ===================================================== */

})(window, document);