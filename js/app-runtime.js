/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL APP RUNTIME
   ------------------------------------------------------------
   Datei:
       js/app-runtime.js

   Pfad:
       /js/app-runtime.js

   HALDO APPLICATION RUNTIME 20

   Verantwortlich für:

   - App Lifecycle
   - App Runtime States
   - Registry Verbindung
   - App Manager Verbindung
   - Router Verbindung
   - Window Manager Verbindung
   - Kernel Verbindung
   - Event Bus Verbindung
   - Dependency Checks
   - App Initialization
   - App Launch
   - App Close
   - App Pause
   - App Resume
   - App Focus
   - App Blur
   - Singleton Handling
   - Runtime Context
   - App State
   - Runtime Diagnostics
   - Runtime Health
   - zukünftige Service Bridges

   WICHTIG:

   Die Registry bleibt die zentrale Quelle für App-Metadaten.

   Diese Runtime erzeugt keine zweite App-Registry.

   ============================================================ */

"use strict";

(function (window, document) {

    /* ============================================================
       01 — FOUNDATION
       ============================================================ */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;


    /* ============================================================
       02 — META
       ============================================================ */

    const VERSION =
        "20.0.0";

    const MODULE_ID =
        "app-runtime";

    const NAME =
        "HalDo AI OS 20 Application Runtime";


    /* ============================================================
       03 — RUNTIME STATES
       ============================================================ */

    const STATES = Object.freeze({

        REGISTERED:
            "registered",

        INITIALIZING:
            "initializing",

        READY:
            "ready",

        OPENING:
            "opening",

        OPEN:
            "open",

        ACTIVE:
            "active",

        BACKGROUND:
            "background",

        MINIMIZED:
            "minimized",

        CLOSING:
            "closing",

        CLOSED:
            "closed",

        ERROR:
            "error"

    });


    /* ============================================================
       04 — STATE
       ============================================================ */

    const state = {

        initialized:
            false,

        initializing:
            false,

        ready:
            false,

        failed:
            false,

        runtimes:
            new Map(),

        listeners:
            new Map(),

        activeAppId:
            null,

        statistics: {

            initialized:
                0,

            launched:
                0,

            closed:
                0,

            paused:
                0,

            resumed:
                0,

            focused:
                0,

            blurred:
                0,

            minimized:
                0,

            errors:
                0,

            blocked:
                0

        },

        connections: {

            kernel:
                false,

            registry:
                false,

            manager:
                false,

            router:
                false,

            windowManager:
                false,

            storage:
                false,

            ai:
                false,

            language:
                false

        }

    };


    /* ============================================================
       05 — LOGGING
       ============================================================ */

    function log() {

        try {

            console.log(
                "[HalDo App Runtime]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo App Runtime]",
                ...arguments
            );

        } catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo App Runtime]",
                ...arguments
            );

        } catch (_) {}

    }


    /* ============================================================
       06 — HELPERS
       ============================================================ */

    function hasMethod(
        object,
        method
    ) {

        return !!(
            object &&
            typeof object[method] === "function"
        );

    }


    function now() {

        return Date.now();

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
            Array.isArray(value)
        ) {

            return value.map(
                clone
            );

        }


        if (
            typeof value === "object"
        ) {

            const result = {};

            Object.keys(value)
                .forEach(
                    key => {

                        const item =
                            value[key];


                        if (
                            typeof item ===
                            "function"
                        ) {

                            result[key] =
                                item;

                        } else {

                            result[key] =
                                clone(
                                    item
                                );

                        }

                    }
                );

            return result;

        }


        return value;

    }


    /* ============================================================
       07 — SERVICE LOOKUPS
       ============================================================ */

    function getKernel() {

        return (
            window.HalDoKernel ||
            HalDoOS.kernel ||
            null
        );

    }


    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            window.HalDoOSAppRegistry ||
            HalDoOS.appRegistry ||
            null
        );

    }


    function getManager() {

        return (
            window.HalDoAppManager ||
            HalDoOS.appManager ||
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


    function getStorage() {

        return (
            window.HalDoStorage ||
            HalDoOS.storage ||
            null
        );

    }


    function getAI() {

        return (
            window.HalDoAICore ||
            HalDoOS.aiCore ||
            null
        );

    }


    function getLanguage() {

        return (
            window.HalDoLanguageManager ||
            HalDoOS.languageManager ||
            null
        );

    }


    /* ============================================================
       08 — EVENTS
       ============================================================ */

    function on(
        event,
        callback
    ) {

        if (
            typeof callback !== "function"
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
            listeners.size === 0
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
            )
            .forEach(
                callback => {

                    try {

                        callback(
                            data
                        );

                    } catch (exception) {

                        reportError(
                            exception,
                            "Runtime Event: " +
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
                    "app-runtime:" + event,
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
                    "app-runtime:" + event,
                    data
                );

            } catch (_) {}

        }

    }


    /* ============================================================
       09 — ERROR HANDLING
       ============================================================ */

    function reportError(
        exception,
        context =
            "Application Runtime"
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
                normalized.stack || "",

            context,

            timestamp:
                new Date().toISOString()

        };


        errorLog(
            "[HalDo App Runtime]",
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


    /* ============================================================
       10 — RUNTIME RECORD
       ============================================================ */

    function createRuntime(
        app
    ) {

        return {

            appId:
                app.id,

            state:
                STATES.REGISTERED,

            createdAt:
                now(),

            initializedAt:
                null,

            openedAt:
                null,

            closedAt:
                null,

            lastActiveAt:
                null,

            lastStateChange:
                now(),

            launchCount:
                0,

            errorCount:
                0,

            windowId:
                null,

            route:
                app.route || null,

            context:
                {},

            instance:
                null,

            services:
                {},

            initialized:
                false,

            open:
                false,

            active:
                false,

            minimized:
                false,

            background:
                false,

            error:
                null

        };

    }


    /* ============================================================
       11 — STATE TRANSITION
       ============================================================ */

    function setState(
        runtime,
        nextState,
        metadata = {}
    ) {

        if (!runtime) {

            return false;

        }


        const previous =
            runtime.state;


        if (
            previous === nextState
        ) {

            return true;

        }


        runtime.state =
            nextState;

        runtime.lastStateChange =
            now();


        if (
            nextState === STATES.OPEN
        ) {

            runtime.open =
                true;

            runtime.closedAt =
                null;

            runtime.openedAt =
                runtime.openedAt ||
                now();

        }


        if (
            nextState === STATES.ACTIVE
        ) {

            runtime.active =
                true;

            runtime.background =
                false;

            runtime.minimized =
                false;

            runtime.lastActiveAt =
                now();

        }


        if (
            nextState === STATES.BACKGROUND
        ) {

            runtime.active =
                false;

            runtime.background =
                true;

        }


        if (
            nextState === STATES.MINIMIZED
        ) {

            runtime.active =
                false;

            runtime.minimized =
                true;

        }


        if (
            nextState === STATES.CLOSED
        ) {

            runtime.open =
                false;

            runtime.active =
                false;

            runtime.background =
                false;

            runtime.minimized =
                false;

            runtime.closedAt =
                now();

        }


        if (
            nextState === STATES.ERROR
        ) {

            runtime.open =
                false;

            runtime.active =
                false;

        }


        emit(
            "state-changed",
            {

                appId:
                    runtime.appId,

                previous,

                state:
                    nextState,

                runtime:
                    clone(
                        runtime
                    ),

                metadata:
                    clone(
                        metadata
                    )

            }
        );


        return true;

    }


    /* ============================================================
       12 — REGISTRY ACCESS
       ============================================================ */

    function getApp(
        appId
    ) {

        const registry =
            getRegistry();


        if (
            !registry
        ) {

            return null;

        }


        if (
            hasMethod(
                registry,
                "getApp"
            )
        ) {

            return registry.getApp(
                appId
            );

        }


        if (
            hasMethod(
                registry,
                "get"
            )
        ) {

            return registry.get(
                appId
            );

        }


        return null;

    }


    /* ============================================================
       13 — ENSURE RUNTIME
       ============================================================ */

    function ensureRuntime(
        app
    ) {

        if (!app) {

            return null;

        }


        const id =
            normalizeId(
                app.id ||
                app.appId
            );


        if (!id) {

            return null;

        }


        if (
            !state.runtimes.has(id)
        ) {

            state.runtimes.set(
                id,
                createRuntime({
                    ...app,
                    id
                })
            );

        }


        const runtime =
            state.runtimes.get(
                id
            );


        runtime.route =
            app.route ||
            runtime.route ||
            null;


        return runtime;

    }


    /* ============================================================
       14 — DEPENDENCIES
       ============================================================ */

    function checkDependencies(
        app
    ) {

        const registry =
            getRegistry();


        if (
            registry &&
            hasMethod(
                registry,
                "checkDependencies"
            )
        ) {

            try {

                return registry.checkDependencies(
                    app
                );

            } catch (exception) {

                reportError(
                    exception,
                    "Dependency Check"
                );

            }

        }


        return {

            valid:
                true,

            missing:
                [],

            disabled:
                [],

            circular:
                [],

            chain:
                []

        };

    }


    /* ============================================================
       15 — SERVICE CONTEXT
       ============================================================ */

    function createServiceContext(
        app,
        runtime
    ) {

        return {

            app,

            runtime,

            kernel:
                getKernel(),

            registry:
                getRegistry(),

            appManager:
                getManager(),

            router:
                getRouter(),

            windowManager:
                getWindowManager(),

            storage:
                getStorage(),

            ai:
                getAI(),

            language:
                getLanguage(),

            runtimeAPI:
                api

        };

    }


    /* ============================================================
       16 — INITIALIZE APP
       ============================================================ */

    async function initializeApp(
        appId,
        options = {}
    ) {

        const app =
            getApp(
                appId
            );


        if (!app) {

            return null;

        }


        const runtime =
            ensureRuntime(
                app
            );


        if (!runtime) {

            return null;

        }


        if (
            runtime.initialized
        ) {

            return clone(
                runtime
            );

        }


        const dependencies =
            checkDependencies(
                app
            );


        if (
            !dependencies.valid
        ) {

            runtime.error =
                dependencies;

            runtime.errorCount +=
                1;

            setState(
                runtime,
                STATES.ERROR,
                {

                    reason:
                        "dependencies",

                    dependencies

                }
            );


            state.statistics.blocked +=
                1;


            return null;

        }


        setState(
            runtime,
            STATES.INITIALIZING
        );


        try {

            runtime.context =
                {
                    ...runtime.context,
                    ...(options.context || {})
                };


            runtime.services =
                createServiceContext(
                    app,
                    runtime
                );


            /*
             * App-spezifisches Initialisierungsmodul.
             */

            let instance =
                runtime.instance;


            if (
                !instance &&
                app.module &&
                typeof app.module ===
                    "object"
            ) {

                instance =
                    app.module;

            }


            if (
                instance &&
                hasMethod(
                    instance,
                    "initialize"
                )
            ) {

                await instance.initialize(
                    runtime.services
                );

            } else if (
                instance &&
                hasMethod(
                    instance,
                    "init"
                )
            ) {

                await instance.init(
                    runtime.services
                );

            }


            runtime.instance =
                instance || null;

            runtime.initialized =
                true;

            runtime.initializedAt =
                now();


            state.statistics.initialized +=
                1;


            setState(
                runtime,
                STATES.READY
            );


            emit(
                "app-initialized",
                {

                    app:
                        clone(app),

                    runtime:
                        clone(runtime)

                }
            );


            return clone(
                runtime
            );

        } catch (exception) {

            runtime.error =
                reportError(
                    exception,
                    "App Initialization: " +
                    app.id
                );

            runtime.errorCount +=
                1;


            setState(
                runtime,
                STATES.ERROR
            );


            return null;

        }

    }


    /* ============================================================
       17 — OPEN
       ============================================================ */

    async function open(
        appId,
        options = {}
    ) {

        const app =
            getApp(
                appId
            );


        if (!app) {

            return null;

        }


        if (
            app.enabled === false
        ) {

            state.statistics.blocked +=
                1;


            emit(
                "launch-blocked",
                {

                    app:
                        clone(app),

                    reason:
                        "disabled"

                }
            );


            return null;

        }


        const runtime =
            ensureRuntime(
                app
            );


        if (!runtime) {

            return null;

        }


        /*
         * Singleton:
         * bereits offene App aktivieren.
         */

        if (
            app.singleton !== false &&
            runtime.open
        ) {

            await focus(
                app.id
            );


            return clone(
                runtime
            );

        }


        const initialized =
            await initializeApp(
                app.id,
                options
            );


        if (!initialized) {

            return null;

        }


        setState(
            runtime,
            STATES.OPENING
        );


        try {

            const manager =
                getManager();


            let managerResult =
                null;


            /*
             * Der App Manager bleibt der bevorzugte
             * Orchestrator, wenn er bereits eine
             * kompatible open()-API besitzt.
             *
             * Schutz gegen Rekursion:
             * Falls der Manager intern wieder die
             * Runtime aufruft, darf hier kein endloser
             * Kreislauf entstehen.
             */

            if (
                manager &&
                hasMethod(
                    manager,
                    "open"
                ) &&
                options.viaRuntimeManager !== false
            ) {

                managerResult =
                    await manager.open(
                        app.id,
                        {
                            ...options,
                            fromRuntime:
                                true
                        }
                    );

            } else {

                const router =
                    getRouter();


                if (
                    router &&
                    hasMethod(
                        router,
                        "navigate"
                    ) &&
                    app.route
                ) {

                    managerResult =
                        await router.navigate(
                            app.route,
                            options
                        );

                }

            }


            runtime.open =
                true;

            runtime.openedAt =
                now();

            runtime.launchCount +=
                1;


            state.statistics.launched +=
                1;


            setState(
                runtime,
                STATES.OPEN
            );


            await focus(
                app.id
            );


            emit(
                "opened",
                {

                    app:
                        clone(app),

                    runtime:
                        clone(runtime),

                    result:
                        managerResult

                }
            );


            return clone(
                runtime
            );

        } catch (exception) {

            runtime.error =
                reportError(
                    exception,
                    "App Open: " +
                    app.id
                );

            runtime.errorCount +=
                1;


            setState(
                runtime,
                STATES.ERROR
            );


            emit(
                "open-failed",
                {

                    app:
                        clone(app),

                    runtime:
                        clone(runtime),

                    error:
                        exception

                }
            );


            return null;

        }

    }


    /* ============================================================
       18 — CLOSE
       ============================================================ */

    async function close(
        appId,
        options = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        const runtime =
            state.runtimes.get(
                id
            );


        if (!runtime) {

            return false;

        }


        const app =
            getApp(
                id
            );


        setState(
            runtime,
            STATES.CLOSING
        );


        try {

            if (
                runtime.instance &&
                hasMethod(
                    runtime.instance,
                    "close"
                )
            ) {

                await runtime.instance.close(
                    createServiceContext(
                        app,
                        runtime
                    )
                );

            }


            const manager =
                getManager();


            if (
                manager &&
                hasMethod(
                    manager,
                    "close"
                )
            ) {

                await manager.close(
                    id,
                    {
                        ...options,
                        fromRuntime:
                            true
                    }
                );

            } else {

                const windowManager =
                    getWindowManager();


                if (
                    windowManager &&
                    hasMethod(
                        windowManager,
                        "close"
                    )
                ) {

                    await windowManager.close(
                        runtime.windowId ||
                        id
                    );

                }

            }


            runtime.active =
                false;

            runtime.open =
                false;


            state.statistics.closed +=
                1;


            setState(
                runtime,
                STATES.CLOSED
            );


            if (
                state.activeAppId === id
            ) {

                state.activeAppId =
                    null;

            }


            emit(
                "closed",
                {

                    app:
                        clone(app),

                    runtime:
                        clone(runtime)

                }
            );


            return true;

        } catch (exception) {

            runtime.error =
                reportError(
                    exception,
                    "App Close: " +
                    id
                );

            runtime.errorCount +=
                1;


            setState(
                runtime,
                STATES.ERROR
            );


            return false;

        }

    }


    /* ============================================================
       19 — PAUSE
       ============================================================ */

    async function pause(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const runtime =
            state.runtimes.get(
                id
            );


        if (
            !runtime ||
            !runtime.open
        ) {

            return false;

        }


        try {

            if (
                runtime.instance &&
                hasMethod(
                    runtime.instance,
                    "pause"
                )
            ) {

                await runtime.instance.pause(
                    createServiceContext(
                        getApp(id),
                        runtime
                    )
                );

            }


            setState(
                runtime,
                STATES.BACKGROUND
            );


            state.statistics.paused +=
                1;


            emit(
                "paused",
                {

                    appId:
                        id,

                    runtime:
                        clone(runtime)

                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Pause: " +
                id
            );


            return false;

        }

    }


    /* ============================================================
       20 — RESUME
       ============================================================ */

    async function resume(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const runtime =
            state.runtimes.get(
                id
            );


        if (
            !runtime ||
            !runtime.open
        ) {

            return false;

        }


        try {

            if (
                runtime.instance &&
                hasMethod(
                    runtime.instance,
                    "resume"
                )
            ) {

                await runtime.instance.resume(
                    createServiceContext(
                        getApp(id),
                        runtime
                    )
                );

            }


            setState(
                runtime,
                STATES.OPEN
            );


            state.statistics.resumed +=
                1;


            emit(
                "resumed",
                {

                    appId:
                        id,

                    runtime:
                        clone(runtime)

                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Resume: " +
                id
            );


            return false;

        }

    }


    /* ============================================================
       21 — FOCUS
       ============================================================ */

    async function focus(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const runtime =
            state.runtimes.get(
                id
            );


        if (
            !runtime
        ) {

            return false;

        }


        const previousId =
            state.activeAppId;


        if (
            previousId &&
            previousId !== id
        ) {

            await blur(
                previousId
            );

        }


        const windowManager =
            getWindowManager();


        try {

            if (
                windowManager &&
                hasMethod(
                    windowManager,
                    "focus"
                )
            ) {

                await windowManager.focus(
                    runtime.windowId ||
                    id
                );

            }


            runtime.active =
                true;

            runtime.background =
                false;

            runtime.minimized =
                false;

            state.activeAppId =
                id;


            state.statistics.focused +=
                1;


            setState(
                runtime,
                STATES.ACTIVE
            );


            emit(
                "focused",
                {

                    appId:
                        id,

                    previousAppId:
                        previousId,

                    runtime:
                        clone(runtime)

                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Focus: " +
                id
            );


            return false;

        }

    }


    /* ============================================================
       22 — BLUR
       ============================================================ */

    async function blur(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const runtime =
            state.runtimes.get(
                id
            );


        if (!runtime) {

            return false;

        }


        try {

            if (
                runtime.instance &&
                hasMethod(
                    runtime.instance,
                    "blur"
                )
            ) {

                await runtime.instance.blur(
                    createServiceContext(
                        getApp(id),
                        runtime
                    )
                );

            }


            runtime.active =
                false;


            if (
                state.activeAppId === id
            ) {

                state.activeAppId =
                    null;

            }


            state.statistics.blurred +=
                1;


            setState(
                runtime,
                STATES.BACKGROUND
            );


            emit(
                "blurred",
                {

                    appId:
                        id,

                    runtime:
                        clone(runtime)

                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Blur: " +
                id
            );


            return false;

        }

    }


    /* ============================================================
       23 — MINIMIZE
       ============================================================ */

    async function minimize(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const runtime =
            state.runtimes.get(
                id
            );


        if (!runtime) {

            return false;

        }


        try {

            const windowManager =
                getWindowManager();


            if (
                windowManager &&
                hasMethod(
                    windowManager,
                    "minimize"
                )
            ) {

                await windowManager.minimize(
                    runtime.windowId ||
                    id
                );

            }


            runtime.active =
                false;

            runtime.minimized =
                true;


            if (
                state.activeAppId === id
            ) {

                state.activeAppId =
                    null;

            }


            state.statistics.minimized +=
                1;


            setState(
                runtime,
                STATES.MINIMIZED
            );


            emit(
                "minimized",
                {

                    appId:
                        id,

                    runtime:
                        clone(runtime)

                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Minimize: " +
                id
            );


            return false;

        }

    }


    /* ============================================================
       24 — RUNTIME ACCESS
       ============================================================ */

    function getRuntime(
        appId
    ) {

        const runtime =
            state.runtimes.get(
                normalizeId(
                    appId
                )
            );


        return runtime
            ? clone(runtime)
            : null;

    }


    function getAppState(
        appId
    ) {

        const runtime =
            state.runtimes.get(
                normalizeId(
                    appId
                )
            );


        if (!runtime) {

            return null;

        }


        return {

            appId:
                runtime.appId,

            state:
                runtime.state,

            open:
                runtime.open,

            active:
                runtime.active,

            minimized:
                runtime.minimized,

            background:
                runtime.background,

            initialized:
                runtime.initialized,

            windowId:
                runtime.windowId,

            launchCount:
                runtime.launchCount,

            errorCount:
                runtime.errorCount

        };

    }


    function getAllRuntimes() {

        return Array.from(
            state.runtimes.values()
        )
        .map(
            clone
        );

    }


    function getOpenApps() {

        return getAllRuntimes()
            .filter(
                runtime =>
                    runtime.open === true
            );

    }


    function getActiveApp() {

        if (
            !state.activeAppId
        ) {

            return null;

        }


        return getRuntime(
            state.activeAppId
        );

    }


    function isOpen(
        appId
    ) {

        const runtime =
            state.runtimes.get(
                normalizeId(
                    appId
                )
            );


        return !!(
            runtime &&
            runtime.open
        );

    }


    /* ============================================================
       25 — CONNECTIONS
       ============================================================ */

    function refreshConnections() {

        state.connections.kernel =
            !!getKernel();

        state.connections.registry =
            !!getRegistry();

        state.connections.manager =
            !!getManager();

        state.connections.router =
            !!getRouter();

        state.connections.windowManager =
            !!getWindowManager();

        state.connections.storage =
            !!getStorage();

        state.connections.ai =
            !!getAI();

        state.connections.language =
            !!getLanguage();


        return getConnectionStatus();

    }


    function getConnectionStatus() {

        return {

            kernel:
                !!getKernel(),

            registry:
                !!getRegistry(),

            manager:
                !!getManager(),

            router:
                !!getRouter(),

            windowManager:
                !!getWindowManager(),

            storage:
                !!getStorage(),

            ai:
                !!getAI(),

            language:
                !!getLanguage()

        };

    }


    /* ============================================================
       26 — REGISTRY EVENTS
       ============================================================ */

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


        registry.on(
            "registered",
            payload => {

                if (
                    payload &&
                    payload.app
                ) {

                    ensureRuntime(
                        payload.app
                    );

                    emit(
                        "app-registered",
                        payload
                    );

                }

            }
        );


        registry.on(
            "updated",
            payload => {

                if (
                    payload &&
                    payload.app
                ) {

                    const runtime =
                        state.runtimes.get(
                            payload.app.id
                        );


                    if (runtime) {

                        runtime.route =
                            payload.app.route ||
                            runtime.route;

                    }


                    emit(
                        "app-updated",
                        payload
                    );

                }

            }
        );


        registry.on(
            "removed",
            payload => {

                if (
                    payload &&
                    payload.app
                ) {

                    state.runtimes.delete(
                        payload.app.id
                    );


                    if (
                        state.activeAppId ===
                        payload.app.id
                    ) {

                        state.activeAppId =
                            null;

                    }


                    emit(
                        "app-removed",
                        payload
                    );

                }

            }
        );


        return true;

    }


    /* ============================================================
       27 — DIAGNOSTICS
       ============================================================ */

    function diagnostics() {

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

            activeAppId:
                state.activeAppId,

            runtimeCount:
                state.runtimes.size,

            openCount:
                getOpenApps().length,

            connections:
                getConnectionStatus(),

            statistics:
                {
                    ...state.statistics
                },

            runtimes:
                getAllRuntimes(),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ============================================================
       28 — HEALTH
       ============================================================ */

    function healthCheck() {

        const problems = [];


        const connections =
            getConnectionStatus();


        if (
            !connections.registry
        ) {

            problems.push(
                "App Registry nicht verbunden."
            );

        }


        const registry =
            getRegistry();


        if (
            !registry
        ) {

            problems.push(
                "App Registry fehlt."
            );

        }


        const runtimeErrors =
            getAllRuntimes()
                .filter(
                    runtime =>
                        runtime.state ===
                        STATES.ERROR
                );


        if (
            runtimeErrors.length
        ) {

            problems.push(
                runtimeErrors.length +
                " App Runtime(s) befinden sich im Fehlerzustand."
            );

        }


        return {

            healthy:
                problems.length === 0,

            problems,

            connections,

            runtimeCount:
                state.runtimes.size,

            openCount:
                getOpenApps().length,

            activeAppId:
                state.activeAppId,

            timestamp:
                new Date().toISOString()

        };

    }


    /* ============================================================
       29 — PUBLIC API
       ============================================================ */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,

        states:
            STATES,

        on,

        off,

        emit,

        initializeApp,

        open,

        close,

        pause,

        resume,

        focus,

        blur,

        minimize,

        getRuntime,

        getAppState,

        getAllRuntimes,

        getOpenApps,

        getActiveApp,

        isOpen,

        refreshConnections,

        getConnectionStatus,

        diagnostics,

        healthCheck,

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

                    runtimeCount:
                        state.runtimes.size,

                    openCount:
                        getOpenApps().length,

                    activeAppId:
                        state.activeAppId,

                    connections:
                        getConnectionStatus()

                };

            }

    };


    /* ============================================================
       30 — GLOBAL EXPORT
       ============================================================ */

    window.HalDoAppRuntime =
        api;

    window.HalDoOSAppRuntime =
        api;

    HalDoOS.appRuntime =
        api;


    HalDoOS.services =
        HalDoOS.services || {};

    HalDoOS.services.appRuntime =
        api;


    /* ============================================================
       31 — KERNEL CONNECTION
       ============================================================ */

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


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Runtime Kernel Connection"
            );


            return false;

        }

    }


    /* ============================================================
       32 — INITIALIZATION
       ============================================================ */

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

            connectRegistryEvents();


            /*
             * Bereits registrierte Apps als Runtime
             * vorbereiten, aber NICHT automatisch öffnen.
             */

            const registry =
                getRegistry();


            if (
                registry &&
                hasMethod(
                    registry,
                    "getAll"
                )
            ) {

                registry.getAll()
                    .forEach(
                        app => {

                            ensureRuntime(
                                app
                            );

                        }
                    );

            }


            refreshConnections();


            state.ready =
                true;

            state.initializing =
                false;


            emit(
                "ready",
                {

                    version:
                        VERSION,

                    runtimeCount:
                        state.runtimes.size

                }
            );


            log(
                "HalDo AI OS 20 App Runtime bereit.",
                "Runtimes:",
                state.runtimes.size
            );


            return api;

        } catch (exception) {

            state.initializing =
                false;

            state.failed =
                true;


            reportError(
                exception,
                "Runtime Initialisierung"
            );


            throw exception;

        }

    }


    /* ============================================================
       33 — BOOT
       ============================================================ */

    function boot() {

        initialize()
            .catch(
                exception => {

                    state.failed =
                        true;

                    state.initializing =
                        false;


                    reportError(
                        exception,
                        "Runtime Boot"
                    );

                }
            );

    }


    api.initialize =
        initialize;

    api.boot =
        boot;


    /* ============================================================
       34 — DOM START
       ============================================================ */

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


    /* ============================================================
       END
       HALDO AI OS 20 APPLICATION RUNTIME
       ============================================================ */

})(window, document);