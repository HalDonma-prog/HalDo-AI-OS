/* ============================================================
   HalDo AI OS 20
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei: js/app-manager.js

   ZENTRALER APPLICATION MANAGER

   Aufgaben:
   - Registry-Anbindung
   - App-Lifecycle
   - App-Start / Stop
   - Open / Close
   - Minimize / Restore
   - mehrere gleichzeitig geöffnete Apps
   - aktive App
   - App-Zustände
   - Dependencies
   - App-Events
   - Fehlerisolierung
   - App-Kontext
   - Settings-Vorbereitung
   - Window-Manager-Verbindung
   - Router-Verbindung
   - Kernel-Verbindung
   - Diagnostics
   - Health Check
   - zukünftige App-Module

   WICHTIG:

   Diese Datei ist die zentrale Laufzeitverwaltung
   aller HalDo AI OS Anwendungen.

   Eine App ist nicht nur ein Name.

   Eine App kann besitzen:

   - UI
   - State
   - Settings
   - Lifecycle
   - Events
   - Storage
   - Permissions
   - Dependencies
   - Windows
   - AI-Verbindungen
   - Sprachsystem
   - Module
   - eigene Runtime

   ============================================================ */

(function (window, document) {

    "use strict";


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

    const NAME =
        "HalDo AI OS Application Manager";

    const MODULE_ID =
        "app-manager";


    /* ========================================================
       03 — INTERNAL STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        initializing:
            false,

        starting:
            false,

        activeAppId:
            null,

        apps:
            new Map(),

        instances:
            new Map(),

        states:
            new Map(),

        settings:
            new Map(),

        listeners:
            new Map(),

        connections: {

            kernel:
                false,

            registry:
                false,

            router:
                false,

            windowManager:
                false,

            system:
                false

        },

        statistics: {

            registered:
                0,

            started:
                0,

            stopped:
                0,

            opened:
                0,

            closed:
                0,

            minimized:
                0,

            restored:
                0,

            activated:
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
            ""
        );

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


    function getSystem() {

        return (
            window.HalDoSystem ||
            HalDoOS.system ||
            null
        );

    }


    /* ========================================================
       07 — EVENT SYSTEM
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
                function (callback) {

                    try {

                        callback(
                            data
                        );

                    } catch (exception) {

                        reportError(
                            exception,
                            "Event: " + event
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
        error,
        context = "Application Manager"
    ) {

        state.statistics.errors +=
            1;


        const normalized =
            error instanceof Error
                ? error
                : new Error(
                    String(
                        error
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


        emit(
            "error",
            record
        );


        return record;

    }


    /* ========================================================
       09 — APP CONTEXT
       ======================================================== */

    function createAppContext(
        app
    ) {

        if (!app) {

            return null;

        }


        const manager =
            api;


        return {

            app:

                app,

            appId:

                app.id,

            manager:

                manager,

            registry:

                getRegistry(),

            kernel:

                getKernel(),

            router:

                getRouter(),

            windowManager:

                getWindowManager(),

            system:

                getSystem(),


            getState:

                function () {

                    return getState(
                        app.id
                    );

                },


            setState:

                function (
                    changes
                ) {

                    return setState(
                        app.id,
                        changes
                    );

                },


            getSettings:

                function () {

                    return getSettings(
                        app.id
                    );

                },


            setSettings:

                function (
                    changes
                ) {

                    return setSettings(
                        app.id,
                        changes
                    );

                },


            emit:

                function (
                    event,
                    data
                ) {

                    emit(
                        "app:" +
                        app.id +
                        ":" +
                        event,
                        data
                    );

                },


            on:

                function (
                    event,
                    callback
                ) {

                    return on(
                        "app:" +
                        app.id +
                        ":" +
                        event,
                        callback
                    );

                }

        };

    }


    /* ========================================================
       10 — REGISTER INTERNAL APP
       ======================================================== */

    function registerInternal(
        app
    ) {

        if (!app) {

            return null;

        }


        const id =
            normalizeId(
                app.id ||
                app.appId ||
                app.name
            );


        if (!id) {

            return null;

        }


        state.apps.set(
            id,
            app
        );


        if (
            !state.states.has(
                id
            )
        ) {

            state.states.set(
                id,
                {

                    status:
                        "registered",

                    running:
                        false,

                    opened:
                        false,

                    minimized:
                        false,

                    active:
                        false,

                    startedAt:
                        null,

                    openedAt:
                        null,

                    closedAt:
                        null,

                    updatedAt:
                        Date.now()

                }
            );

        }


        if (
            !state.settings.has(
                id
            )
        ) {

            state.settings.set(
                id,
                {

                    theme:
                        "system",

                    notifications:
                        true,

                    sound:
                        true,

                    animations:
                        true

                }
            );

        }


        return app;

    }


    /* ========================================================
       11 — SYNCHRONIZE REGISTRY
       ======================================================== */

    function syncRegistry() {

        const registry =
            getRegistry();


        if (!registry) {

            state.connections.registry =
                false;

            return 0;

        }


        state.connections.registry =
            true;


        let apps = [];


        try {

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

        } catch (exception) {

            reportError(
                exception,
                "Registry Synchronisation"
            );

            return 0;

        }


        if (
            !Array.isArray(
                apps
            )
        ) {

            return 0;

        }


        let count = 0;


        apps.forEach(
            function (app) {

                if (
                    registerInternal(
                        app
                    )
                ) {

                    count += 1;

                }

            }
        );


        emit(
            "registry-synchronized",
            {

                count:
                    count

            }
        );


        return count;

    }


    /* ========================================================
       12 — GET APP
       ======================================================== */

    function getApp(
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


    function get(
        id
    ) {

        return getApp(
            id
        );

    }


    function has(
        id
    ) {

        return !!getApp(
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


    /* ========================================================
       13 — APP STATE
       ======================================================== */

    function getState(
        id
    ) {

        const normalized =
            normalizeId(
                id
            );


        if (!normalized) {

            return null;

        }


        if (
            !state.states.has(
                normalized
            )
        ) {

            state.states.set(
                normalized,
                {

                    status:
                        "unknown",

                    running:
                        false,

                    opened:
                        false,

                    minimized:
                        false,

                    active:
                        false,

                    startedAt:
                        null,

                    openedAt:
                        null,

                    closedAt:
                        null,

                    updatedAt:
                        Date.now()

                }
            );

        }


        return state.states.get(
            normalized
        );

    }


    function setState(
        id,
        changes
    ) {

        const current =
            getState(
                id
            );


        if (!current) {

            return null;

        }


        if (
            changes &&
            typeof changes ===
            "object"
        ) {

            Object.assign(
                current,
                changes
            );

        }


        current.updatedAt =
            Date.now();


        emit(
            "state-changed",
            {

                appId:
                    normalizeId(
                        id
                    ),

                state:
                    current

            }
        );


        return current;

    }


    /* ========================================================
       14 — SETTINGS
       ======================================================== */

    function getSettings(
        id
    ) {

        const normalized =
            normalizeId(
                id
            );


        if (!normalized) {

            return null;

        }


        if (
            !state.settings.has(
                normalized
            )
        ) {

            state.settings.set(
                normalized,
                {}
            );

        }


        return state.settings.get(
            normalized
        );

    }


    function setSettings(
        id,
        changes
    ) {

        const settings =
            getSettings(
                id
            );


        if (!settings) {

            return null;

        }


        if (
            changes &&
            typeof changes ===
            "object"
        ) {

            Object.assign(
                settings,
                changes
            );

        }


        emit(
            "settings-changed",
            {

                appId:
                    normalizeId(
                        id
                    ),

                settings:
                    settings

            }
        );


        return settings;

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
            [];


        dependencies.forEach(
            function (
                dependency
            ) {

                const dependencyId =
                    normalizeId(
                        dependency
                    );


                const dependencyApp =
                    getApp(
                        dependencyId
                    );


                if (
                    !dependencyApp ||
                    dependencyApp.enabled ===
                    false
                ) {

                    missing.push(
                        dependencyId
                    );

                }

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
       16 — START APP
       ======================================================== */

    async function startApp(
        id,
        options = {}
    ) {

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
                "App Start"
            );


            return null;

        }


        if (
            app.enabled ===
            false
        ) {

            reportError(
                new Error(
                    "App ist deaktiviert: " +
                    app.id
                ),
                "App Start"
            );


            return null;

        }


        const dependencyCheck =
            checkDependencies(
                app
            );


        if (
            !dependencyCheck.valid &&
            options.ignoreDependencies !==
            true
        ) {

            reportError(
                new Error(
                    "Fehlende App-Abhängigkeiten: " +
                    dependencyCheck.missing.join(
                        ", "
                    )
                ),
                "App Start"
            );


            return null;

        }


        const currentState =
            getState(
                app.id
            );


        if (
            currentState.running
        ) {

            return app;

        }


        state.starting =
            true;


        emit(
            "starting",
            {

                app:
                    app,

                options:
                    options

            }
        );


        try {

            const context =
                createAppContext(
                    app
                );


            if (
                typeof app.init ===
                "function" &&
                !currentState.initialized
            ) {

                const result =
                    app.init(
                        context
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }


                currentState.initialized =
                    true;

            }


            if (
                typeof app.start ===
                "function"
            ) {

                const result =
                    app.start(
                        context,
                        options
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }


            currentState.running =
                true;

            currentState.status =
                "running";

            currentState.startedAt =
                Date.now();

            currentState.updatedAt =
                Date.now();


            state.statistics.started +=
                1;


            emit(
                "started",
                {

                    app:
                        app,

                    state:
                        currentState

                }
            );


            state.starting =
                false;


            return app;

        }
        catch (exception) {

            state.starting =
                false;


            currentState.running =
                false;

            currentState.status =
                "error";


            reportError(
                exception,
                "App Start: " +
                app.id
            );


            emit(
                "start-failed",
                {

                    app:
                        app,

                    error:
                        exception

                }
            );


            return null;

        }

    }


    function start(
        id,
        options
    ) {

        return startApp(
            id,
            options
        );

    }


    /* ========================================================
       17 — OPEN APP
       ======================================================== */

    async function openApp(
        id,
        options = {}
    ) {

        const app =
            getApp(
                id
            );


        if (!app) {

            return null;

        }


        const started =
            await startApp(
                app.id,
                options
            );


        if (!started) {

            return null;

        }


        const appState =
            getState(
                app.id
            );


        try {

            const context =
                createAppContext(
                    app
                );


            if (
                typeof app.open ===
                "function"
            ) {

                const result =
                    app.open(
                        context,
                        options
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }


            /*
             * Verbindung zum Window Manager.
             */

            const windowManager =
                getWindowManager();


            if (
                windowManager
            ) {

                if (
                    hasMethod(
                        windowManager,
                        "open"
                    )
                ) {

                    try {

                        windowManager.open(
                            app.id,
                            {
                                app:
                                    app,

                                options:
                                    options

                            }
                        );

                    } catch (_) {}

                }
                else if (
                    hasMethod(
                        windowManager,
                        "createWindow"
                    )
                ) {

                    try {

                        windowManager.createWindow(
                            {
                                id:
                                    app.id,

                                app:
                                    app

                            }
                        );

                    } catch (_) {}

                }

            }


            appState.opened =
                true;

            appState.minimized =
                false;

            appState.status =
                "open";

            appState.openedAt =
                appState.openedAt ||
                Date.now();


            state.instances.set(
                app.id,
                {

                    id:
                        app.id,

                    app:
                        app,

                    context:
                        createAppContext(
                            app
                        ),

                    openedAt:
                        Date.now(),

                    minimized:
                        false

                }
            );


            state.statistics.opened +=
                1;


            activateApp(
                app.id
            );


            emit(
                "opened",
                {

                    app:
                        app,

                    options:
                        options

                }
            );


            return app;

        }
        catch (exception) {

            reportError(
                exception,
                "App Open: " +
                app.id
            );


            return null;

        }

    }


    function open(
        id,
        options
    ) {

        return openApp(
            id,
            options
        );

    }


    /* ========================================================
       18 — CLOSE APP
       ======================================================== */

    async function closeApp(
        id,
        options = {}
    ) {

        const app =
            getApp(
                id
            );


        if (!app) {

            return false;

        }


        const appState =
            getState(
                app.id
            );


        try {

            const context =
                createAppContext(
                    app
                );


            if (
                typeof app.close ===
                "function"
            ) {

                const result =
                    app.close(
                        context,
                        options
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }


            const windowManager =
                getWindowManager();


            if (
                windowManager
            ) {

                if (
                    hasMethod(
                        windowManager,
                        "close"
                    )
                ) {

                    try {

                        windowManager.close(
                            app.id
                        );

                    } catch (_) {}

                }

            }


            state.instances.delete(
                app.id
            );


            appState.opened =
                false;

            appState.minimized =
                false;

            appState.active =
                false;

            appState.status =
                "running";

            appState.closedAt =
                Date.now();

            appState.updatedAt =
                Date.now();


            if (
                state.activeAppId ===
                app.id
            ) {

                state.activeAppId =
                    null;

            }


            state.statistics.closed +=
                1;


            emit(
                "closed",
                {

                    app:
                        app,

                    options:
                        options

                }
            );


            return true;

        }
        catch (exception) {

            reportError(
                exception,
                "App Close: " +
                app.id
            );


            return false;

        }

    }


    function close(
        id,
        options
    ) {

        return closeApp(
            id,
            options
        );

    }


    /* ========================================================
       19 — STOP APP
       ======================================================== */

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


        const appState =
            getState(
                app.id
            );


        try {

            if (
                appState.opened
            ) {

                await closeApp(
                    app.id
                );

            }


            const context =
                createAppContext(
                    app
                );


            if (
                typeof app.stop ===
                "function"
            ) {

                const result =
                    app.stop(
                        context
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }


            appState.running =
                false;

            appState.status =
                "stopped";

            appState.active =
                false;

            appState.updatedAt =
                Date.now();


            state.statistics.stopped +=
                1;


            emit(
                "stopped",
                {

                    app:
                        app

                }
            );


            return true;

        }
        catch (exception) {

            reportError(
                exception,
                "App Stop: " +
                app.id
            );


            return false;

        }

    }


    function stop(
        id
    ) {

        return stopApp(
            id
        );

    }


    /* ========================================================
       20 — MINIMIZE
       ======================================================== */

    function minimizeApp(
        id
    ) {

        const app =
            getApp(
                id
            );


        if (!app) {

            return false;

        }


        const appState =
            getState(
                app.id
            );


        if (
            !appState.opened
        ) {

            return false;

        }


        try {

            if (
                typeof app.minimize ===
                "function"
            ) {

                app.minimize(
                    createAppContext(
                        app
                    )
                );

            }


            const windowManager =
                getWindowManager();


            if (
                windowManager &&
                hasMethod(
                    windowManager,
                    "minimize"
                )
            ) {

                try {

                    windowManager.minimize(
                        app.id
                    );

                } catch (_) {}

            }


            appState.minimized =
                true;

            appState.active =
                false;

            appState.status =
                "minimized";

            appState.updatedAt =
                Date.now();


            if (
                state.activeAppId ===
                app.id
            ) {

                state.activeAppId =
                    null;

            }


            const instance =
                state.instances.get(
                    app.id
                );


            if (instance) {

                instance.minimized =
                    true;

            }


            state.statistics.minimized +=
                1;


            emit(
                "minimized",
                {

                    app:
                        app

                }
            );


            return true;

        }
        catch (exception) {

            reportError(
                exception,
                "App Minimize: " +
                app.id
            );


            return false;

        }

    }


    function minimize(
        id
    ) {

        return minimizeApp(
            id
        );

    }


    /* ========================================================
       21 — RESTORE
       ======================================================== */

    function restoreApp(
        id
    ) {

        const app =
            getApp(
                id
            );


        if (!app) {

            return false;

        }


        const appState =
            getState(
                app.id
            );


        if (
            !appState.opened
        ) {

            return false;

        }


        try {

            if (
                typeof app.restore ===
                "function"
            ) {

                app.restore(
                    createAppContext(
                        app
                    )
                );

            }


            const windowManager =
                getWindowManager();


            if (
                windowManager &&
                hasMethod(
                    windowManager,
                    "restore"
                )
            ) {

                try {

                    windowManager.restore(
                        app.id
                    );

                } catch (_) {}

            }


            appState.minimized =
                false;

            appState.status =
                "open";

            appState.updatedAt =
                Date.now();


            const instance =
                state.instances.get(
                    app.id
                );


            if (instance) {

                instance.minimized =
                    false;

            }


            state.statistics.restored +=
                1;


            activateApp(
                app.id
            );


            emit(
                "restored",
                {

                    app:
                        app

                }
            );


            return true;

        }
        catch (exception) {

            reportError(
                exception,
                "App Restore: " +
                app.id
            );


            return false;

        }

    }


    function restore(
        id
    ) {

        return restoreApp(
            id
        );

    }


    /* ========================================================
       22 — ACTIVATE
       ======================================================== */

    function activateApp(
        id
    ) {

        const app =
            getApp(
                id
            );


        if (!app) {

            return false;

        }


        const appState =
            getState(
                app.id
            );


        /*
         * Nur geöffnete Apps können
         * aktive Fenster werden.
         */

        if (
            !appState.opened
        ) {

            return false;

        }


        /*
         * Bisher aktive App deaktivieren.
         */

        if (
            state.activeAppId &&
            state.activeAppId !==
            app.id
        ) {

            const previous =
                getApp(
                    state.activeAppId
                );


            if (previous) {

                const previousState =
                    getState(
                        previous.id
                    );


                previousState.active =
                    false;


                if (
                    typeof previous.onDeactivate ===
                    "function"
                ) {

                    try {

                        previous.onDeactivate(
                            createAppContext(
                                previous
                            )
                        );

                    } catch (_) {}

                }

            }

        }


        state.activeAppId =
            app.id;


        appState.active =
            true;

        appState.minimized =
            false;

        appState.status =
            "active";

        appState.updatedAt =
            Date.now();


        if (
            typeof app.onActivate ===
            "function"
        ) {

            try {

                app.onActivate(
                    createAppContext(
                        app
                    )
                );

            } catch (exception) {

                reportError(
                    exception,
                    "App Activate: " +
                    app.id
                );

            }

        }


        const windowManager =
            getWindowManager();


        if (
            windowManager &&
            hasMethod(
                windowManager,
                "focus"
            )
        ) {

            try {

                windowManager.focus(
                    app.id
                );

            } catch (_) {}

        }


        state.statistics.activated +=
            1;


        emit(
            "activated",
            {

                app:
                    app

            }
        );


        return true;

    }


    function activate(
        id
    ) {

        return activateApp(
            id
        );

    }


    /* ========================================================
       23 — ACTIVE APP
       ======================================================== */

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


    /* ========================================================
       24 — OPEN APPS
       ======================================================== */

    function getOpenApps() {

        return getAll().filter(
            function (app) {

                const appState =
                    getState(
                        app.id
                    );


                return (
                    appState &&
                    appState.opened
                );

            }
        );

    }


    function getRunningApps() {

        return getAll().filter(
            function (app) {

                const appState =
                    getState(
                        app.id
                    );


                return (
                    appState &&
                    appState.running
                );

            }
        );

    }


    function getMinimizedApps() {

        return getAll().filter(
            function (app) {

                const appState =
                    getState(
                        app.id
                    );


                return (
                    appState &&
                    appState.minimized
                );

            }
        );

    }


    /* ========================================================
       25 — APP INSTANCES
       ======================================================== */

    function getInstance(
        id
    ) {

        return (
            state.instances.get(
                normalizeId(
                    id
                )
            ) ||
            null
        );

    }


    function getInstances() {

        return Array.from(
            state.instances.values()
        );

    }


    function getInstanceCount() {

        return state.instances.size;

    }


    /* ========================================================
       26 — ROUTER CONNECTION
       ======================================================== */

    function connectToRouter() {

        const router =
            getRouter();


        state.connections.router =
            !!router;


        if (!router) {

            return false;

        }


        emit(
            "router-connected",
            {

                router:
                    router

            }
        );


        return true;

    }


    /* ========================================================
       27 — WINDOW MANAGER CONNECTION
       ======================================================== */

    function connectToWindowManager() {

        const windowManager =
            getWindowManager();


        state.connections.windowManager =
            !!windowManager;


        if (!windowManager) {

            return false;

        }


        emit(
            "window-manager-connected",
            {

                windowManager:
                    windowManager

            }
        );


        return true;

    }


    /* ========================================================
       28 — KERNEL CONNECTION
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


            emit(
                "kernel-connected",
                {

                    kernel:
                        kernel

                }
            );


            return true;

        }
        catch (exception) {

            reportError(
                exception,
                "Kernel Connection"
            );


            return false;

        }

    }


    /* ========================================================
       29 — SYSTEM CONNECTION
       ======================================================== */

    function connectToSystem() {

        const system =
            getSystem();


        state.connections.system =
            !!system;


        if (!system) {

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

        }
        catch (exception) {

            reportError(
                exception,
                "System Connection"
            );


            return false;

        }


        emit(
            "system-connected",
            {

                system:
                    system

            }
        );


        return true;

    }


    /* ========================================================
       30 — REFRESH CONNECTIONS
       ======================================================== */

    function refreshConnections() {

        connectToKernel();

        connectToSystem();

        connectToRouter();

        connectToWindowManager();

        syncRegistry();


        return getConnectionStatus();

    }


    function getConnectionStatus() {

        return {

            kernel:
                !!getKernel(),

            registry:
                !!getRegistry(),

            router:
                !!getRouter(),

            windowManager:
                !!getWindowManager(),

            system:
                !!getSystem()

        };

    }


    /* ========================================================
       31 — APP REGISTRY EVENTS
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

                        registerInternal(
                            payload.app
                        );

                        state.statistics.registered +=
                            1;

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

                        registerInternal(
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

                        const id =
                            normalizeId(
                                payload.app.id
                            );


                        state.apps.delete(
                            id
                        );

                        state.states.delete(
                            id
                        );

                        state.settings.delete(
                            id
                        );

                    }

                }
            );


            state.connections.registry =
                true;


            return true;

        }
        catch (exception) {

            reportError(
                exception,
                "Registry Events"
            );


            return false;

        }

    }


    /* ========================================================
       32 — STATISTICS
       ======================================================== */

    function getStatistics() {

        return {

            ...state.statistics

        };

    }


    /* ========================================================
       33 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

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

            ready:
                state.ready,

            activeApp:
                state.activeAppId,

            appCount:
                apps.length,

            openAppCount:
                getOpenApps().length,

            runningAppCount:
                getRunningApps().length,

            minimizedAppCount:
                getMinimizedApps().length,

            instanceCount:
                getInstanceCount(),

            connections:
                getConnectionStatus(),

            statistics:
                getStatistics(),

            apps:
                apps.map(
                    function (app) {

                        const appState =
                            getState(
                                app.id
                            );


                        return {

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

                            status:
                                appState.status,

                            running:
                                appState.running,

                            opened:
                                appState.opened,

                            minimized:
                                appState.minimized,

                            active:
                                appState.active

                        };

                    }
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       34 — HEALTH CHECK
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

            problems:
                problems,

            connections:
                connections,

            appCount:
                getAll().length,

            openAppCount:
                getOpenApps().length,

            runningAppCount:
                getRunningApps().length,

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       35 — INITIALIZATION
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


        /*
         * Verbindungen aufbauen.
         */

        refreshConnections();

        connectRegistryEvents();


        /*
         * Registry nochmals synchronisieren,
         * falls die Registry erst kurz vorher
         * Apps erhalten hat.
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

                diagnostics:
                    diagnostics()

            }
        );


        log(
            "Application Manager bereit.",
            VERSION
        );


        return api;

    }


    /*
     * Kernel erwartet init().
     */

    async function init() {

        return initialize();

    }


    /* ========================================================
       36 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


        /* Initialization */

        init:
            init,

        initialize:
            initialize,


        /* Events */

        on:
            on,

        off:
            off,

        emit:
            emit,


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


        /* Registry */

        syncRegistry:
            syncRegistry,

        register:
            registerInternal,


        /* Lifecycle */

        start:
            start,

        startApp:
            startApp,

        open:
            open,

        openApp:
            openApp,

        close:
            close,

        closeApp:
            closeApp,

        stop:
            stop,

        stopApp:
            stopApp,

        minimize:
            minimize,

        minimizeApp:
            minimizeApp,

        restore:
            restore,

        restoreApp:
            restoreApp,

        activate:
            activate,

        activateApp:
            activateApp,


        /* Active / running */

        getActiveApp:
            getActiveApp,

        getOpenApps:
            getOpenApps,

        getRunningApps:
            getRunningApps,

        getMinimizedApps:
            getMinimizedApps,


        /* Instances */

        getInstance:
            getInstance,

        getInstances:
            getInstances,

        getInstanceCount:
            getInstanceCount,


        /* State */

        getState:
            getState,

        setState:
            setState,


        /* Settings */

        getSettings:
            getSettings,

        setSettings:
            setSettings,


        /* Dependencies */

        checkDependencies:
            function (
                id
            ) {

                return checkDependencies(
                    getApp(
                        id
                    )
                );

            },


        /* Connections */

        connectToKernel:
            connectToKernel,

        connectToSystem:
            connectToSystem,

        connectToRouter:
            connectToRouter,

        connectToWindowManager:
            connectToWindowManager,

        refreshConnections:
            refreshConnections,

        getConnectionStatus:
            getConnectionStatus,


        /* Diagnostics */

        diagnostics:
            diagnostics,

        healthCheck:
            healthCheck,

        getStatistics:
            getStatistics,


        /* Context */

        createAppContext:
            createAppContext

    };


    /* ========================================================
       37 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppManager =
        api;

    window.HalDoOSAppManager =
        api;

    HalDoOS.appManager =
        api;


    /* ========================================================
       38 — GLOBAL KERNEL EVENT
       ======================================================== */

    function handleKernelReady() {

        refreshConnections();

        emit(
            "kernel-ready",
            {

                diagnostics:
                    diagnostics()

            }
        );

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
                handleKernelReady
            );


            return true;

        }
        catch (exception) {

            reportError(
                exception,
                "Kernel Event Connection"
            );


            return false;

        }

    }


    /* ========================================================
       39 — DOM STARTUP
       ======================================================== */

    function handleDOMReady() {

        connectKernelEvents();


        initialize()
            .catch(
                function (
                    exception
                ) {

                    state.initializing =
                        false;

                    reportError(
                        exception,
                        "App Manager Initialization"
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
       40 — FINAL EXPOSURE
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS ||
        {};

    window.HalDoOS.appManager =
        api;


    /* ========================================================
       HALDO AI OS 20
       APPLICATION MANAGER
       END OF FILE
       ======================================================== */

})(window, document);