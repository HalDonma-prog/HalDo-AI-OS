/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL APP CONTRACT
   ------------------------------------------------------------
   Datei:
       /js/app-contract.js

   Version:
       20.1.0

   ZENTRALE VERTRAGSSCHICHT FÜR ALLE HALDO-APPS

   Verantwortlich für:

   - App Manifest
   - App Definition
   - App Context
   - Lifecycle Contract
   - Permissions
   - Capabilities
   - Dependencies
   - Settings
   - State
   - Events
   - Services
   - Runtime API
   - Validation
   - Diagnostics
   - Compatibility
   - Versioning

   Architektur:

       App
        │
        ▼
   App Contract
        │
        ├── Manifest
        ├── Context
        ├── Lifecycle
        ├── Permissions
        ├── Capabilities
        ├── Dependencies
        ├── State
        ├── Settings
        └── Services
             │
             ▼
        App Manager
             │
       ┌─────┼─────┐
       ▼     ▼     ▼
    Router Window Storage
       │
       ├── AI
       ├── Language
       ├── Voice
       ├── Notifications
       └── Keyboard

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
        "app-contract";

    const NAME =
        "HalDo AI OS 20 Application Contract";


    const CONTRACT_VERSION =
        "1.0.0";


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


    function getStorage() {

        return (
            window.HalDoStorage ||
            HalDoOS.storage ||
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


    function getAI() {

        return (
            window.HalDoAI ||
            HalDoOS.ai ||
            window.HalDoAICore ||
            HalDoOS.aiCore ||
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


    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            HalDoOS.appRegistry ||
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


    function getAppManager() {

        return (
            window.HalDoAppManager ||
            HalDoOS.appManager ||
            null
        );

    }


    /* ========================================================
       04 — HELPERS
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


    function normalizeId(value) {

        return String(value || "")
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


    function clone(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return value;
        }

        if (Array.isArray(value)) {

            return value.map(
                item =>
                    clone(item)
            );

        }

        if (
            typeof value ===
            "object"
        ) {

            const result = {};

            Object.keys(value)
                .forEach(key => {

                    result[key] =
                        clone(
                            value[key]
                        );

                });

            return result;

        }

        return value;

    }


    function safePromise(value) {

        if (
            value &&
            typeof value.then ===
            "function"
        ) {

            return value;

        }

        return Promise.resolve(
            value
        );

    }


    function dispatch(
        name,
        detail
    ) {

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

        initialized:
            false,

        initializing:
            false,

        ready:
            false,

        failed:
            false,

        manifests:
            new Map(),

        contexts:
            new Map(),

        statistics: {

            manifestsCreated:
                0,

            manifestsValidated:
                0,

            validationErrors:
                0,

            contextsCreated:
                0,

            lifecycleCalls:
                0,

            errors:
                0

        }

    };


    /* ========================================================
       06 — LOGGING
       ======================================================== */

    function log() {

        try {

            console.log(
                "[HalDo App Contract 20]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo App Contract 20]",
                ...arguments
            );

        } catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo App Contract 20]",
                ...arguments
            );

        } catch (_) {}

    }


    /* ========================================================
       07 — EVENTS
       ======================================================== */

    const listeners =
        new Map();


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
            !listeners.has(event)
        ) {

            listeners.set(
                event,
                new Set()
            );

        }

        const set =
            listeners.get(event);

        set.add(callback);

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

        const set =
            listeners.get(event);

        if (!set) {
            return;
        }

        set.delete(callback);

        if (!set.size) {

            listeners.delete(
                event
            );

        }

    }


    function emit(
        event,
        data = null
    ) {

        const set =
            listeners.get(event);

        if (set) {

            Array.from(set)
                .forEach(
                    callback => {

                        try {

                            callback(
                                data
                            );

                        } catch (
                            exception
                        ) {

                            reportError(
                                exception,
                                "Event: " +
                                event
                            );

                        }

                    }
                );

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
                    "app-contract:" +
                    event,
                    data
                );

            } catch (_) {}

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
                    "app-contract:" +
                    event,
                    data
                );

            } catch (_) {}

        }


        dispatch(
            "haldo:app-contract:" +
            event,
            data
        );

    }


    /* ========================================================
       08 — ERROR HANDLING
       ======================================================== */

    function reportError(
        exception,
        context =
            "App Contract"
    ) {

        state.statistics.errors +=
            1;

        const normalized =
            exception instanceof Error
                ? exception
                : new Error(
                    String(exception)
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

        errorLog(record);

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
       09 — DEFAULT ARRAYS
       ======================================================== */

    const DEFAULT_PERMISSIONS = [

        "storage"

    ];


    const DEFAULT_CAPABILITIES = [

        "window",

        "state",

        "settings",

        "events"

    ];


    const DEFAULT_DEPENDENCIES = [];


    /* ========================================================
       10 — MANIFEST CREATION
       ======================================================== */

    function createManifest(
        definition = {}
    ) {

        const source =
            (
                definition &&
                typeof definition ===
                "object"
            )
                ? definition
                : {};


        const id =
            normalizeId(
                source.id ||
                source.appId ||
                source.name
            );


        const manifest = {

            contract: {

                name:
                    NAME,

                version:
                    CONTRACT_VERSION

            },


            id,

            appId:
                id,

            name:
                source.name ||
                source.title ||
                id,

            title:
                source.title ||
                source.name ||
                id,

            description:
                source.description ||
                "",

            version:
                source.version ||
                "1.0.0",

            author:
                source.author ||
                "HalDo",

            category:
                source.category ||
                "system",

            icon:
                source.icon ||
                "◈",

            route:
                source.route ||
                (
                    id
                        ? "/apps/" + id
                        : null
                ),


            enabled:
                source.enabled !== false,

            visible:
                source.visible !== false,

            singleton:
                source.singleton !== false,

            multiInstance:
                source.multiInstance === true,

            multiWindow:
                source.multiWindow === true,

            pip:
                source.pip === true,


            dependencies:
                Array.isArray(
                    source.dependencies
                )
                    ? clone(
                        source.dependencies
                    )
                    : clone(
                        DEFAULT_DEPENDENCIES
                    ),


            permissions:
                Array.isArray(
                    source.permissions
                )
                    ? clone(
                        source.permissions
                    )
                    : clone(
                        DEFAULT_PERMISSIONS
                    ),


            capabilities:
                Array.isArray(
                    source.capabilities
                )
                    ? clone(
                        source.capabilities
                    )
                    : clone(
                        DEFAULT_CAPABILITIES
                    ),


            tags:
                Array.isArray(
                    source.tags
                )
                    ? clone(source.tags)
                    : [],


            keywords:
                Array.isArray(
                    source.keywords
                )
                    ? clone(source.keywords)
                    : [],


            settings:
                (
                    source.settings &&
                    typeof source.settings ===
                    "object"
                )
                    ? clone(
                        source.settings
                    )
                    : {},


            metadata:
                (
                    source.metadata &&
                    typeof source.metadata ===
                    "object"
                )
                    ? clone(
                        source.metadata
                    )
                    : {},


            lifecycle:
                createLifecycleDefinition(
                    source
                ),


            runtime: {

                entry:
                    source.entry ||
                    null,

                module:
                    source.module ||
                    null,

                sandbox:
                    source.sandbox === true,

                persistent:
                    source.persistent === true

            },


            state: {

                persistent:
                    source.persistentState === true,

                initial:
                    (
                        source.initialState &&
                        typeof source.initialState ===
                        "object"
                    )
                        ? clone(
                            source.initialState
                        )
                        : {}

            },


            handlers: {

                init:
                    typeof source.init ===
                    "function",

                start:
                    typeof source.start ===
                    "function",

                open:
                    typeof source.open ===
                    "function",

                activate:
                    typeof source.activate ===
                    "function",

                deactivate:
                    typeof source.deactivate ===
                    "function",

                minimize:
                    typeof source.minimize ===
                    "function",

                restore:
                    typeof source.restore ===
                    "function",

                close:
                    typeof source.close ===
                    "function",

                stop:
                    typeof source.stop ===
                    "function"

            },


            createdAt:
                new Date().toISOString()

        };


        /*
         * Original App-Funktionen werden
         * nicht entfernt.
         */

        manifest.init =
            source.init;

        manifest.start =
            source.start;

        manifest.open =
            source.open;

        manifest.activate =
            source.activate;

        manifest.deactivate =
            source.deactivate;

        manifest.minimize =
            source.minimize;

        manifest.restore =
            source.restore;

        manifest.close =
            source.close;

        manifest.stop =
            source.stop;

        manifest.onActivate =
            source.onActivate;

        manifest.onDeactivate =
            source.onDeactivate;


        state.manifests.set(
            id,
            manifest
        );

        state.statistics.manifestsCreated +=
            1;

        emit(
            "manifest-created",
            {
                app:
                    clone(manifest)
            }
        );

        return manifest;

    }


    /* ========================================================
       11 — LIFECYCLE DEFINITION
       ======================================================== */

    function createLifecycleDefinition(
        source = {}
    ) {

        return {

            created:
                true,

            initialized:
                typeof source.init ===
                "function",

            started:
                typeof source.start ===
                "function",

            opened:
                typeof source.open ===
                "function",

            activated:
                (
                    typeof source.activate ===
                    "function" ||
                    typeof source.onActivate ===
                    "function"
                ),

            deactivated:
                (
                    typeof source.deactivate ===
                    "function" ||
                    typeof source.onDeactivate ===
                    "function"
                ),

            minimized:
                typeof source.minimize ===
                "function",

            restored:
                typeof source.restore ===
                "function",

            closed:
                typeof source.close ===
                "function",

            stopped:
                typeof source.stop ===
                "function"

        };

    }


    /* ========================================================
       12 — MANIFEST VALIDATION
       ======================================================== */

    function validateManifest(
        manifest
    ) {

        const errors = [];
        const warnings = [];


        if (!manifest) {

            errors.push(
                "Manifest fehlt."
            );

            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        if (!manifest.id) {

            errors.push(
                "App-ID fehlt."
            );

        }


        if (!manifest.name) {

            errors.push(
                "App-Name fehlt."
            );

        }


        if (
            !manifest.version
        ) {

            warnings.push(
                "App-Version fehlt."
            );

        }


        if (
            !Array.isArray(
                manifest.dependencies
            )
        ) {

            errors.push(
                "Dependencies müssen ein Array sein."
            );

        }


        if (
            !Array.isArray(
                manifest.permissions
            )
        ) {

            errors.push(
                "Permissions müssen ein Array sein."
            );

        }


        if (
            !Array.isArray(
                manifest.capabilities
            )
        ) {

            errors.push(
                "Capabilities müssen ein Array sein."
            );

        }


        if (
            manifest.multiInstance &&
            manifest.singleton
        ) {

            warnings.push(
                "multiInstance=true und singleton=true sind widersprüchlich."
            );

        }


        if (
            manifest.pip &&
            !manifest.capabilities.includes(
                "pip"
            )
        ) {

            warnings.push(
                "PIP aktiviert, aber Capability 'pip' fehlt."
            );

        }


        state.statistics.manifestsValidated +=
            1;

        state.statistics.validationErrors +=
            errors.length;


        const result = {

            valid:
                errors.length === 0,

            errors,

            warnings,

            appId:
                manifest.id,

            contractVersion:
                CONTRACT_VERSION

        };


        emit(
            "manifest-validated",
            result
        );


        return result;

    }


    /* ========================================================
       13 — NORMALIZE
       ======================================================== */

    function normalizeManifest(
        definition
    ) {

        const manifest =
            createManifest(
                definition
            );

        return manifest;

    }


    /* ========================================================
       14 — GET MANIFEST
       ======================================================== */

    function getManifest(
        appId
    ) {

        const id =
            normalizeId(appId);

        return clone(
            state.manifests.get(id) ||
            null
        );

    }


    function hasManifest(
        appId
    ) {

        return !!getManifest(
            appId
        );

    }


    function getAllManifests() {

        return Array.from(
            state.manifests.values()
        )
        .map(clone);

    }


    /* ========================================================
       15 — SERVICE BRIDGE
       ======================================================== */

    function createServices() {

        return {

            kernel:
                getKernel(),

            system:
                getSystem(),

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

            router:
                getRouter(),

            windowManager:
                getWindowManager(),

            launcher:
                getLauncher(),

            registry:
                getRegistry(),

            platform:
                getPlatform(),

            appManager:
                getAppManager(),

            contract:
                api

        };

    }


    /* ========================================================
       16 — CONTEXT API
       ======================================================== */

    function createContext(
        app,
        options = {}
    ) {

        const manifest =
            normalizeManifest(
                app || {}
            );


        const appId =
            normalizeId(
                manifest.id
            );


        const services = {

            ...createServices(),

            ...(options.services || {})

        };


        let localState =
            clone(
                manifest.state.initial ||
                {}
            );


        let localSettings =
            clone(
                manifest.settings ||
                {}
            );


        const context = {

            app,
            manifest,

            appId,

            version:
                manifest.version,

            contractVersion:
                CONTRACT_VERSION,


            services,


            /*
             * State
             */

            getState() {

                const manager =
                    getAppManager();

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "getAppState"
                    )
                ) {

                    const systemState =
                        manager.getAppState(
                            appId
                        );

                    return {

                        ...clone(
                            localState
                        ),

                        ...(
                            systemState || {}
                        )

                    };

                }

                return clone(
                    localState
                );

            },


            updateState(
                changes = {}
            ) {

                localState = {

                    ...localState,

                    ...clone(changes)

                };


                const manager =
                    getAppManager();

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "updateAppState"
                    )
                ) {

                    try {

                        return manager.updateAppState(
                            appId,
                            changes
                        );

                    } catch (
                        exception
                    ) {

                        reportError(
                            exception,
                            "Context State: " +
                            appId
                        );

                    }

                }

                return clone(
                    localState
                );

            },


            /*
             * Settings
             */

            getSettings() {

                const manager =
                    getAppManager();

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "getSettings"
                    )
                ) {

                    return manager.getSettings(
                        appId
                    );

                }

                return clone(
                    localSettings
                );

            },


            updateSettings(
                changes = {}
            ) {

                localSettings = {

                    ...localSettings,

                    ...clone(changes)

                };


                const manager =
                    getAppManager();

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "setSettings"
                    )
                ) {

                    try {

                        return manager.setSettings(
                            appId,
                            changes
                        );

                    } catch (
                        exception
                    ) {

                        reportError(
                            exception,
                            "Context Settings: " +
                            appId
                        );

                    }

                }

                return clone(
                    localSettings
                );

            },


            /*
             * Events
             */

            on(
                event,
                callback
            ) {

                const manager =
                    getAppManager();

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "on"
                    )
                ) {

                    return manager.on(
                        "app:" +
                        appId +
                        ":" +
                        event,
                        callback
                    );

                }

                return function () {};

            },


            off(
                event,
                callback
            ) {

                const manager =
                    getAppManager();

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "off"
                    )
                ) {

                    return manager.off(
                        "app:" +
                        appId +
                        ":" +
                        event,
                        callback
                    );

                }

            },


            emit(
                event,
                data = null
            ) {

                const manager =
                    getAppManager();

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "emit"
                    )
                ) {

                    return manager.emit(
                        "app:" +
                        appId +
                        ":" +
                        event,
                        {
                            appId,
                            data
                        }
                    );

                }

                return null;

            },


            /*
             * App lifecycle helpers
             */

            async open(
                targetAppId,
                options = {}
            ) {

                const manager =
                    getAppManager();

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "open"
                    )
                ) {

                    return manager.open(
                        targetAppId,
                        options
                    );

                }

                return null;

            },


            async close(
                targetAppId =
                    appId,
                options = {}
            ) {

                const manager =
                    getAppManager();

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "close"
                    )
                ) {

                    return manager.close(
                        targetAppId,
                        options
                    );

                }

                return false;

            },


            async activate(
                targetAppId =
                    appId
            ) {

                const manager =
                    getAppManager();

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "activate"
                    )
                ) {

                    return manager.activate(
                        targetAppId
                    );

                }

                return false;

            },


            async minimize(
                targetAppId =
                    appId
            ) {

                const manager =
                    getAppManager();

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "minimize"
                    )
                ) {

                    return manager.minimize(
                        targetAppId
                    );

                }

                return false;

            },


            async restore(
                targetAppId =
                    appId
            ) {

                const manager =
                    getAppManager();

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "restore"
                    )
                ) {

                    return manager.restore(
                        targetAppId
                    );

                }

                return false;

            },


            /*
             * Diagnostics
             */

            diagnostics() {

                return {

                    appId,

                    manifest:
                        clone(manifest),

                    contractVersion:
                        CONTRACT_VERSION,

                    services:
                        Object.keys(
                            services
                        ).reduce(
                            (
                                result,
                                key
                            ) => {

                                result[key] =
                                    !!services[key];

                                return result;

                            },
                            {}
                        ),

                    state:
                        clone(
                            localState
                        ),

                    settings:
                        clone(
                            localSettings
                        )

                };

            }

        };


        state.contexts.set(
            appId,
            context
        );

        state.statistics.contextsCreated +=
            1;


        emit(
            "context-created",
            {
                appId,
                context
            }
        );


        return context;

    }


    /* ========================================================
       17 — LIFECYCLE INVOCATION
       ======================================================== */

    async function invokeLifecycle(
        app,
        lifecycle,
        payload = {}
    ) {

        if (!app) {
            return false;
        }


        const id =
            normalizeId(
                app.id ||
                app.appId
            );


        const context =
            state.contexts.get(id) ||
            createContext(
                app
            );


        const data = {

            app,

            appId:
                id,

            context,

            manager:
                getAppManager(),

            services:
                context.services,

            ...payload

        };


        const handlers = {

            init:
                app.init,

            start:
                app.start,

            open:
                app.open,

            activate:
                app.activate,

            deactivate:
                app.deactivate,

            minimize:
                app.minimize,

            restore:
                app.restore,

            close:
                app.close,

            stop:
                app.stop,

            onActivate:
                app.onActivate,

            onDeactivate:
                app.onDeactivate

        };


        const handler =
            handlers[lifecycle];


        if (
            typeof handler !==
            "function"
        ) {

            return true;

        }


        state.statistics.lifecycleCalls +=
            1;


        try {

            const result =
                await safePromise(
                    handler(
                        data
                    )
                );

            emit(
                "lifecycle",
                {

                    appId:
                        id,

                    lifecycle,

                    result

                }
            );

            return result !== false;

        } catch (exception) {

            reportError(
                exception,
                "Lifecycle " +
                lifecycle +
                ": " +
                id
            );

            return false;

        }

    }


    /* ========================================================
       18 — PERMISSIONS
       ======================================================== */

    function getPermissions(
        manifest
    ) {

        if (!manifest) {
            return [];
        }

        return Array.isArray(
            manifest.permissions
        )
            ? clone(
                manifest.permissions
            )
            : [];

    }


    function hasPermission(
        manifest,
        permission,
        granted = null
    ) {

        const required =
            getPermissions(
                manifest
            );


        if (
            !required.includes(
                permission
            )
        ) {

            return true;

        }


        if (
            Array.isArray(granted)
        ) {

            return granted.includes(
                permission
            );

        }


        return false;

    }


    function validatePermissions(
        manifest,
        granted = []
    ) {

        const required =
            getPermissions(
                manifest
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

            granted:
                clone(granted),

            missing

        };

    }


    /* ========================================================
       19 — CAPABILITIES
       ======================================================== */

    function getCapabilities(
        manifest
    ) {

        if (!manifest) {
            return [];
        }

        return Array.isArray(
            manifest.capabilities
        )
            ? clone(
                manifest.capabilities
            )
            : [];

    }


    function hasCapability(
        manifest,
        capability
    ) {

        return getCapabilities(
            manifest
        ).includes(
            capability
        );

    }


    /* ========================================================
       20 — DEPENDENCIES
       ======================================================== */

    function getDependencies(
        manifest
    ) {

        if (!manifest) {
            return [];
        }

        return Array.isArray(
            manifest.dependencies
        )
            ? clone(
                manifest.dependencies
            )
            : [];

    }


    function validateDependencies(
        manifest
    ) {

        const registry =
            getRegistry();


        const dependencies =
            getDependencies(
                manifest
            );


        const missing = [];


        dependencies.forEach(
            dependency => {

                const id =
                    normalizeId(
                        dependency
                    );


                let exists =
                    false;


                if (
                    registry &&
                    hasMethod(
                        registry,
                        "has"
                    )
                ) {

                    try {

                        exists =
                            !!registry.has(
                                id
                            );

                    } catch (_) {}

                }


                if (!exists) {

                    const manager =
                        getAppManager();

                    if (
                        manager &&
                        hasMethod(
                            manager,
                            "has"
                        )
                    ) {

                        try {

                            exists =
                                !!manager.has(
                                    id
                                );

                        } catch (_) {}

                    }

                }


                if (!exists) {

                    missing.push(
                        id
                    );

                }

            }
        );


        return {

            valid:
                missing.length === 0,

            dependencies,

            missing

        };

    }


    /* ========================================================
       21 — COMPATIBILITY
       ======================================================== */

    function checkCompatibility(
        manifest
    ) {

        const problems = [];


        if (!manifest) {

            problems.push(
                "Manifest fehlt."
            );

        }


        if (
            manifest &&
            manifest.contract &&
            manifest.contract.version
        ) {

            const version =
                String(
                    manifest.contract.version
                );


            if (
                version !==
                CONTRACT_VERSION
            ) {

                /*
                 * Keine harte Ablehnung:
                 * spätere Contract-Versionen
                 * dürfen kompatibel bleiben.
                 */

                warn(
                    "Contract-Version unterscheidet sich:",
                    version,
                    "→",
                    CONTRACT_VERSION
                );

            }

        }


        return {

            compatible:
                problems.length === 0,

            problems,

            contractVersion:
                CONTRACT_VERSION

        };

    }


    /* ========================================================
       22 — APP DEFINITION VALIDATION
       ======================================================== */

    function validateApp(
        definition
    ) {

        const manifest =
            normalizeManifest(
                definition
            );


        const manifestResult =
            validateManifest(
                manifest
            );


        const dependencyResult =
            validateDependencies(
                manifest
            );


        const compatibility =
            checkCompatibility(
                manifest
            );


        const valid =
            manifestResult.valid &&
            dependencyResult.valid &&
            compatibility.compatible;


        return {

            valid,

            manifest:
                manifestResult,

            dependencies:
                dependencyResult,

            compatibility,

            permissions:
                getPermissions(
                    manifest
                ),

            capabilities:
                getCapabilities(
                    manifest
                )

        };

    }


    /* ========================================================
       23 — CONTRACT SNAPSHOT
       ======================================================== */

    function getSnapshot() {

        return {

            name:
                NAME,

            version:
                VERSION,

            module:
                MODULE_ID,

            contractVersion:
                CONTRACT_VERSION,

            initialized:
                state.initialized,

            initializing:
                state.initializing,

            ready:
                state.ready,

            failed:
                state.failed,

            manifestCount:
                state.manifests.size,

            contextCount:
                state.contexts.size,

            statistics:
                {
                    ...state.statistics
                },

            services:
                {

                    kernel:
                        !!getKernel(),

                    system:
                        !!getSystem(),

                    storage:
                        !!getStorage(),

                    ai:
                        !!getAI(),

                    language:
                        !!getLanguage(),

                    voice:
                        !!getVoice(),

                    notifications:
                        !!getNotifications(),

                    keyboard:
                        !!getKeyboard(),

                    router:
                        !!getRouter(),

                    windowManager:
                        !!getWindowManager(),

                    launcher:
                        !!getLauncher(),

                    registry:
                        !!getRegistry(),

                    platform:
                        !!getPlatform(),

                    appManager:
                        !!getAppManager()

                },

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       24 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        return getSnapshot();

    }


    /* ========================================================
       25 — HEALTH CHECK
       ======================================================== */

    function healthCheck() {

        const problems = [];


        if (
            !getKernel()
        ) {

            problems.push(
                "Kernel nicht verbunden."
            );

        }


        if (
            !getSystem()
        ) {

            problems.push(
                "System nicht verbunden."
            );

        }


        if (
            !getAppManager()
        ) {

            problems.push(
                "App Manager nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length === 0,

            problems,

            contractVersion:
                CONTRACT_VERSION,

            manifestCount:
                state.manifests.size,

            contextCount:
                state.contexts.size,

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       26 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,

        contractVersion:
            CONTRACT_VERSION,


        /* Events */

        on,

        off,

        emit,


        /* Manifest */

        createManifest,

        normalizeManifest,

        validateManifest,

        getManifest,

        hasManifest,

        getAllManifests,


        /* Context */

        createContext,

        getContext(
            appId
        ) {

            return (
                state.contexts.get(
                    normalizeId(appId)
                ) ||
                null
            );

        },


        /* Lifecycle */

        createLifecycleDefinition,

        invokeLifecycle,


        /* Permissions */

        getPermissions,

        hasPermission,

        validatePermissions,


        /* Capabilities */

        getCapabilities,

        hasCapability,


        /* Dependencies */

        getDependencies,

        validateDependencies,


        /* Validation */

        validateApp,

        checkCompatibility,


        /* Services */

        createServices,


        /* Diagnostics */

        diagnostics,

        healthCheck,

        getSnapshot,


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

                manifestCount:
                    state.manifests.size,

                contextCount:
                    state.contexts.size

            };

        }

    };


    /* ========================================================
       27 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppContract =
        api;

    window.HalDoOSAppContract =
        api;

    HalDoOS.appContract =
        api;


    /* ========================================================
       28 — INITIALIZATION
       ======================================================== */

    function initialize() {

        if (state.ready) {
            return api;
        }


        if (state.initializing) {
            return api;
        }


        state.initializing =
            true;

        state.failed =
            false;


        emit(
            "initializing",
            {
                version:
                    VERSION,

                contractVersion:
                    CONTRACT_VERSION
            }
        );


        try {

            state.initialized =
                true;

            state.ready =
                true;

            state.initializing =
                false;


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


            const payload = {

                version:
                    VERSION,

                contractVersion:
                    CONTRACT_VERSION,

                diagnostics:
                    diagnostics()

            };


            emit(
                "ready",
                payload
            );


            dispatch(
                "haldo:app-contract-ready",
                payload
            );


            log(
                "HalDo AI OS 20 App Contract bereit.",
                "Version:",
                VERSION
            );


            return api;

        } catch (exception) {

            state.initializing =
                false;

            state.failed =
                true;


            reportError(
                exception,
                "App Contract Initialisierung"
            );


            return api;

        }

    }


    /* ========================================================
       29 — BOOT
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
                        "App Contract Boot"
                    );

                }
            );

    }


    /* ========================================================
       30 — DOM START
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
       31 — FINAL EXPORT
       ======================================================== */

    HalDoOS.appContract =
        api;

    window.HalDoAppContract =
        api;

    window.HalDoOSAppContract =
        api;


    /* ========================================================
       END
       HALDO AI OS 20
       APP CONTRACT 20.1
       ======================================================== */

})(window, document);