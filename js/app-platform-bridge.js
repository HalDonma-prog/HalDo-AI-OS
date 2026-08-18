/* ============================================================
   HALDO AI OS 20
   APP CONTRACT
   ------------------------------------------------------------
   Datei:
       js/app-contract.js

   ZENTRALER APP-VERTRAG 20.0

   Zweck:

   Jede HalDo-App erhält einen einheitlichen Vertrag.

   Verbindet:

   App
   App Manager
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
   Events
   Permissions
   Capabilities
   Settings
   State
   Lifecycle
   Diagnostics

   Der Contract entfernt keine bestehenden Funktionen.
   Er normalisiert und erweitert die App-Plattform.

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
        "app-contract";

    const NAME =
        "HalDo AI OS 20 App Contract";


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

        manifests:
            new Map(),

        contexts:
            new Map(),

        validators:
            new Map(),

        statistics: {

            manifestsCreated:
                0,

            contextsCreated:
                0,

            validations:
                0,

            validationErrors:
                0

        }

    };


    /* ========================================================
       04 — SERVICE ACCESS
       ======================================================== */

    function getKernel() {

        return (
            window.HalDoKernel ||
            HalDoOS.kernel ||
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


    /* ========================================================
       05 — HELPERS
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


    function now() {

        return Date.now();

    }


    function uniqueArray(
        value
    ) {

        if (
            !Array.isArray(value)
        ) {

            return [];

        }


        return Array.from(
            new Set(
                value
                .filter(
                    item =>
                        item !== null &&
                        item !== undefined &&
                        String(item).trim() !== ""
                )
                .map(
                    item =>
                        typeof item === "string"
                            ? item.trim()
                            : item
                )
            )
        );

    }


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

    function emit(
        event,
        data = null
    ) {

        const payload = {

            event,

            data,

            timestamp:
                new Date().toISOString()

        };


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
                    "app-contract:" + event,
                    payload
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
                    "app-contract:" + event,
                    payload
                );

            } catch (_) {}

        }


        try {

            window.dispatchEvent(
                new CustomEvent(
                    "haldo:app-contract:" + event,
                    {
                        detail:
                            payload
                    }
                )
            );

        } catch (_) {}

    }


    /* ========================================================
       08 — DEFAULT LIFECYCLE
       ======================================================== */

    const DEFAULT_LIFECYCLE = [

        "created",

        "initializing",

        "initialized",

        "starting",

        "running",

        "opening",

        "open",

        "active",

        "inactive",

        "minimized",

        "restoring",

        "closing",

        "closed",

        "stopping",

        "stopped",

        "suspended",

        "error"

    ];


    /* ========================================================
       09 — DEFAULT PERMISSIONS
       ======================================================== */

    const DEFAULT_PERMISSIONS = [

        "storage",

        "notifications",

        "keyboard",

        "language",

        "voice",

        "ai",

        "window",

        "router"

    ];


    /* ========================================================
       10 — DEFAULT CAPABILITIES
       ======================================================== */

    const DEFAULT_CAPABILITIES = [

        "open",

        "close",

        "activate",

        "minimize",

        "restore",

        "settings",

        "state"

    ];


    /* ========================================================
       11 — MANIFEST
       ======================================================== */

    function createManifest(
        definition = {}
    ) {

        const source =
            definition || {};


        const rawId =
            source.id ||
            source.appId ||
            source.name ||
            "";


        const id =
            normalizeId(
                rawId
            );


        if (!id) {

            throw new Error(
                "App Contract: App-ID fehlt."
            );

        }


        const manifest = {

            /* Identity */

            id,

            appId:
                id,

            name:
                source.name ||
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
                VERSION,


            /* Visual */

            icon:
                source.icon ||
                "◈",

            logo:
                source.logo ||
                null,

            color:
                source.color ||
                null,


            /* Classification */

            category:
                source.category ||
                "system",

            subcategory:
                source.subcategory ||
                null,

            tags:
                uniqueArray(
                    source.tags
                ),

            keywords:
                uniqueArray(
                    source.keywords
                ),


            /* Runtime */

            enabled:
                source.enabled !== false,

            singleton:
                source.singleton !== false,

            multiInstance:
                source.multiInstance === true,

            multiWindow:
                source.multiWindow !== false,

            pip:
                source.pip === true,


            /* Routing */

            route:
                source.route ||
                null,

            entry:
                source.entry ||
                null,


            /* Dependencies */

            dependencies:
                uniqueArray(
                    source.dependencies
                ),

            optionalDependencies:
                uniqueArray(
                    source.optionalDependencies
                ),


            /* Permissions */

            permissions:
                uniqueArray(
                    source.permissions ||
                    DEFAULT_PERMISSIONS
                ),


            /* Capabilities */

            capabilities:
                uniqueArray(
                    source.capabilities ||
                    DEFAULT_CAPABILITIES
                ),


            /* Settings */

            defaultSettings:
                clone(
                    source.defaultSettings ||
                    source.settings ||
                    {}
                ),


            /* Lifecycle */

            lifecycle:
                uniqueArray(
                    source.lifecycle ||
                    DEFAULT_LIFECYCLE
                ),


            /* Hooks */

            init:
                typeof source.init === "function"
                    ? source.init
                    : null,

            start:
                typeof source.start === "function"
                    ? source.start
                    : null,

            open:
                typeof source.open === "function"
                    ? source.open
                    : null,

            activate:
                typeof source.activate === "function"
                    ? source.activate
                    : null,

            onActivate:
                typeof source.onActivate === "function"
                    ? source.onActivate
                    : null,

            deactivate:
                typeof source.deactivate === "function"
                    ? source.deactivate
                    : null,

            onDeactivate:
                typeof source.onDeactivate === "function"
                    ? source.onDeactivate
                    : null,

            minimize:
                typeof source.minimize === "function"
                    ? source.minimize
                    : null,

            restore:
                typeof source.restore === "function"
                    ? source.restore
                    : null,

            close:
                typeof source.close === "function"
                    ? source.close
                    : null,

            stop:
                typeof source.stop === "function"
                    ? source.stop
                    : null,


            /* App data */

            data:
                clone(
                    source.data ||
                    {}
                ),


            /* UI */

            ui:
                clone(
                    source.ui ||
                    {}
                ),


            /* Metadata */

            author:
                source.author ||
                "HalDo AI OS",

            license:
                source.license ||
                null,

            platform:
                source.platform ||
                "HalDo AI OS 20",

            createdAt:
                source.createdAt ||
                now(),

            updatedAt:
                now()

        };


        /*
         * Zusätzliche, app-spezifische Felder
         * bleiben erhalten.
         */

        Object.keys(
            source
        ).forEach(
            key => {

                if (
                    !Object.prototype.hasOwnProperty.call(
                        manifest,
                        key
                    )
                ) {

                    manifest[key] =
                        clone(
                            source[key]
                        );

                }

            }
        );


        state.manifests.set(
            id,
            manifest
        );


        state.statistics.manifestsCreated +=
            1;


        emit(
            "manifest-created",
            {
                manifest:
                    clone(
                        manifest
                    )
            }
        );


        return manifest;

    }


    /* ========================================================
       12 — MANIFEST ACCESS
       ======================================================== */

    function getManifest(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (
            state.manifests.has(id)
        ) {

            return clone(
                state.manifests.get(id)
            );

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
                    manager.get(id);


                if (app) {

                    return createManifest(
                        app
                    );

                }

            } catch (_) {}

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

                const app =
                    registry.get(id);


                if (app) {

                    return createManifest(
                        app
                    );

                }

            } catch (_) {}

        }


        return null;

    }


    function getAllManifests() {

        return Array.from(
            state.manifests.values()
        )
        .map(
            clone
        );

    }


    /* ========================================================
       13 — VALIDATION
       ======================================================== */

    function validate(
        definition
    ) {

        state.statistics.validations +=
            1;


        const errors = [];

        const warnings = [];


        if (
            !definition ||
            typeof definition !== "object"
        ) {

            errors.push(
                "App Definition muss ein Objekt sein."
            );


            state.statistics.validationErrors +=
                1;


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        const id =
            normalizeId(
                definition.id ||
                definition.appId ||
                definition.name
            );


        if (!id) {

            errors.push(
                "App-ID fehlt."
            );

        }


        if (
            !definition.name &&
            !definition.title
        ) {

            warnings.push(
                "App besitzt weder name noch title."
            );

        }


        if (
            definition.dependencies &&
            !Array.isArray(
                definition.dependencies
            )
        ) {

            errors.push(
                "dependencies muss ein Array sein."
            );

        }


        if (
            definition.permissions &&
            !Array.isArray(
                definition.permissions
            )
        ) {

            errors.push(
                "permissions muss ein Array sein."
            );

        }


        if (
            definition.capabilities &&
            !Array.isArray(
                definition.capabilities
            )
        ) {

            errors.push(
                "capabilities muss ein Array sein."
            );

        }


        if (
            definition.tags &&
            !Array.isArray(
                definition.tags
            )
        ) {

            errors.push(
                "tags muss ein Array sein."
            );

        }


        if (
            definition.keywords &&
            !Array.isArray(
                definition.keywords
            )
        ) {

            errors.push(
                "keywords muss ein Array sein."
            );

        }


        [
            "init",
            "start",
            "open",
            "activate",
            "deactivate",
            "minimize",
            "restore",
            "close",
            "stop"
        ]
        .forEach(
            hook => {

                if (
                    definition[hook] !==
                    undefined &&
                    typeof definition[hook] !==
                    "function"
                ) {

                    errors.push(
                        hook +
                        " muss eine Funktion sein."
                    );

                }

            }
        );


        if (
            errors.length > 0
        ) {

            state.statistics.validationErrors +=
                1;

        }


        return {

            valid:
                errors.length === 0,

            errors,

            warnings,

            appId:
                id,

            timestamp:
                new Date().toISOString()

        };

    }


    function isValid(
        definition
    ) {

        return validate(
            definition
        ).valid;

    }


    /* ========================================================
       14 — DEPENDENCIES
       ======================================================== */

    function resolveDependencies(
        manifest
    ) {

        const app =
            manifest ||
            {};


        const dependencies =
            uniqueArray(
                app.dependencies
            );


        const optional =
            uniqueArray(
                app.optionalDependencies
            );


        const manager =
            getAppManager();


        const available = [];

        const missing = [];

        const optionalMissing = [];


        dependencies.forEach(
            dependency => {

                let exists = false;


                if (
                    manager &&
                    hasMethod(
                        manager,
                        "has"
                    )
                ) {

                    try {

                        exists =
                            manager.has(
                                dependency
                            );

                    } catch (_) {}

                }


                if (exists) {

                    available.push(
                        dependency
                    );

                } else {

                    missing.push(
                        dependency
                    );

                }

            }
        );


        optional.forEach(
            dependency => {

                let exists = false;


                if (
                    manager &&
                    hasMethod(
                        manager,
                        "has"
                    )
                ) {

                    try {

                        exists =
                            manager.has(
                                dependency
                            );

                    } catch (_) {}

                }


                if (!exists) {

                    optionalMissing.push(
                        dependency
                    );

                }

            }
        );


        return {

            valid:
                missing.length === 0,

            dependencies,

            optionalDependencies:
                optional,

            available,

            missing,

            optionalMissing

        };

    }


    /* ========================================================
       15 — CONTEXT
       ======================================================== */

    function createContext(
        app,
        services = {}
    ) {

        const manifest =
            app &&
            app.id
                ? createManifest(app)
                : createManifest(
                    app || {}
                );


        const appId =
            manifest.id;


        const manager =
            services.appManager ||
            getAppManager();


        const context = {

            /* Identity */

            appId,

            id:
                appId,

            app:
                clone(
                    manifest
                ),


            /* Core services */

            kernel:
                services.kernel ||
                getKernel(),

            system:
                services.system ||
                (
                    HalDoOS.system ||
                    window.HalDoSystem ||
                    null
                ),

            registry:
                services.registry ||
                getRegistry(),

            router:
                services.router ||
                getRouter(),

            windowManager:
                services.windowManager ||
                getWindowManager(),

            launcher:
                services.launcher ||
                getLauncher(),

            appManager:
                manager,


            /* Platform services */

            storage:
                services.storage ||
                getStorage(),

            ai:
                services.ai ||
                getAI(),

            language:
                services.language ||
                getLanguage(),

            voice:
                services.voice ||
                getVoice(),

            notifications:
                services.notifications ||
                getNotifications(),

            keyboard:
                services.keyboard ||
                getKeyboard(),


            /* Runtime */

            createdAt:
                now(),

            state:
                "created",


            /* Helpers */

            getState() {

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "getAppState"
                    )
                ) {

                    return manager.getAppState(
                        appId
                    );

                }

                return null;

            },


            updateState(
                changes = {}
            ) {

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "updateAppState"
                    )
                ) {

                    return manager.updateAppState(
                        appId,
                        changes
                    );

                }

                return null;

            },


            getSettings() {

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

                return {};

            },


            updateSettings(
                changes = {}
            ) {

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "setSettings"
                    )
                ) {

                    return manager.setSettings(
                        appId,
                        changes
                    );

                }

                return null;

            },


            setSettings(
                changes = {}
            ) {

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "setSettings"
                    )
                ) {

                    return manager.setSettings(
                        appId,
                        changes
                    );

                }

                return null;

            },


            openApp(
                targetAppId,
                options = {}
            ) {

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


            closeApp(
                targetAppId,
                options = {}
            ) {

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


            activateApp(
                targetAppId
            ) {

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


            minimizeApp(
                targetAppId
            ) {

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


            restoreApp(
                targetAppId
            ) {

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


            emit(
                event,
                data = null
            ) {

                const payload = {

                    appId,

                    event,

                    data,

                    timestamp:
                        new Date().toISOString()

                };


                if (
                    manager &&
                    hasMethod(
                        manager,
                        "emit"
                    )
                ) {

                    try {

                        manager.emit(
                            event,
                            payload
                        );

                    } catch (_) {}

                }


                try {

                    window.dispatchEvent(
                        new CustomEvent(
                            "haldo:app:" +
                            event,
                            {
                                detail:
                                    payload
                            }
                        )
                    );

                } catch (_) {}


                return payload;

            },


            on(
                event,
                callback
            ) {

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "on"
                    )
                ) {

                    return manager.on(
                        event,
                        callback
                    );

                }

                return function () {};

            },


            hasCapability(
                capability
            ) {

                return manifest.capabilities
                    .includes(
                        capability
                    );

            },


            hasPermission(
                permission
            ) {

                return manifest.permissions
                    .includes(
                        permission
                    );

            },


            getManifest() {

                return clone(
                    manifest
                );

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
                appId
            }
        );


        return context;

    }


    /* ========================================================
       16 — CONTEXT ACCESS
       ======================================================== */

    function getContext(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const existing =
            state.contexts.get(
                id
            );


        if (existing) {

            return existing;

        }


        const manifest =
            getManifest(
                id
            );


        if (!manifest) {

            return null;

        }


        return createContext(
            manifest
        );

    }


    function destroyContext(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (
            !state.contexts.has(id)
        ) {

            return false;

        }


        state.contexts.delete(
            id
        );


        emit(
            "context-destroyed",
            {
                appId:
                    id
            }
        );


        return true;

    }


    /* ========================================================
       17 — PERMISSIONS
       ======================================================== */

    function getPermissions(
        appId
    ) {

        const manifest =
            getManifest(
                appId
            );


        if (!manifest) {

            return [];

        }


        return clone(
            manifest.permissions
        );

    }


    function hasPermission(
        appId,
        permission
    ) {

        return getPermissions(
            appId
        )
        .includes(
            permission
        );

    }


    /* ========================================================
       18 — CAPABILITIES
       ======================================================== */

    function getCapabilities(
        appId
    ) {

        const manifest =
            getManifest(
                appId
            );


        if (!manifest) {

            return [];

        }


        return clone(
            manifest.capabilities
        );

    }


    function hasCapability(
        appId,
        capability
    ) {

        return getCapabilities(
            appId
        )
        .includes(
            capability
        );

    }


    /* ========================================================
       19 — APP CONTRACT EXECUTION
       ======================================================== */

    async function execute(
        appId,
        lifecycle,
        payload = {}
    ) {

        const manifest =
            getManifest(
                appId
            );


        if (!manifest) {

            throw new Error(
                "App Contract: App nicht gefunden: " +
                appId
            );

        }


        if (
            !DEFAULT_LIFECYCLE.includes(
                lifecycle
            )
        ) {

            throw new Error(
                "App Contract: Unbekannter Lifecycle: " +
                lifecycle
            );

        }


        const hook =
            manifest[lifecycle];


        if (
            typeof hook !==
            "function"
        ) {

            return null;

        }


        const context =
            getContext(
                manifest.id
            );


        const contractPayload = {

            ...payload,

            app:
                clone(
                    manifest
                ),

            context,

            contract:
                api

        };


        try {

            const result =
                hook(
                    contractPayload
                );


            if (
                result &&
                typeof result.then ===
                "function"
            ) {

                return await result;

            }


            return result;

        } catch (exception) {

            errorLog(
                "[App Contract]",
                lifecycle,
                manifest.id,
                exception
            );


            emit(
                "lifecycle-error",
                {

                    appId:
                        manifest.id,

                    lifecycle,

                    error:
                        exception

                }
            );


            throw exception;

        }

    }


    /* ========================================================
       20 — REGISTER VALIDATOR
       ======================================================== */

    function registerValidator(
        name,
        validator
    ) {

        if (
            !name ||
            typeof validator !==
            "function"
        ) {

            return false;

        }


        state.validators.set(
            String(name),
            validator
        );


        emit(
            "validator-registered",
            {
                name:
                    String(name)
            }
        );


        return true;

    }


    function validateWithValidators(
        definition
    ) {

        const results = [];


        state.validators.forEach(
            (
                validator,
                name
            ) => {

                try {

                    results.push({

                        name,

                        valid:
                            validator(
                                definition
                            ) !== false

                    });

                } catch (exception) {

                    results.push({

                        name,

                        valid:
                            false,

                        error:
                            exception.message

                    });

                }

            }
        );


        return results;

    }


    /* ========================================================
       21 — PLATFORM INFORMATION
       ======================================================== */

    function getPlatformInfo() {

        return {

            name:
                NAME,

            version:
                VERSION,

            module:
                MODULE_ID,

            lifecycle:
                clone(
                    DEFAULT_LIFECYCLE
                ),

            permissions:
                clone(
                    DEFAULT_PERMISSIONS
                ),

            capabilities:
                clone(
                    DEFAULT_CAPABILITIES
                ),

            manifestCount:
                state.manifests.size,

            contextCount:
                state.contexts.size,

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       22 — DIAGNOSTICS
       ======================================================== */

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

            manifests:
                state.manifests.size,

            contexts:
                state.contexts.size,

            validators:
                state.validators.size,

            statistics:
                {
                    ...state.statistics
                },

            services: {

                kernel:
                    !!getKernel(),

                appManager:
                    !!getAppManager(),

                registry:
                    !!getRegistry(),

                router:
                    !!getRouter(),

                windowManager:
                    !!getWindowManager(),

                launcher:
                    !!getLauncher(),

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
                    !!getKeyboard()

            },

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       23 — HEALTH CHECK
       ======================================================== */

    function healthCheck() {

        const problems = [];


        if (
            !getAppManager()
        ) {

            problems.push(
                "App Manager nicht verbunden."
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
            !getKernel()
        ) {

            problems.push(
                "Kernel nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length === 0,

            problems,

            diagnostics:
                diagnostics(),

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


        /* Manifest */

        createManifest,

        getManifest,

        getAllManifests,


        /* Validation */

        validate,

        isValid,

        registerValidator,

        validateWithValidators,


        /* Dependencies */

        resolveDependencies,


        /* Context */

        createContext,

        getContext,

        destroyContext,


        /* Permissions */

        getPermissions,

        hasPermission,


        /* Capabilities */

        getCapabilities,

        hasCapability,


        /* Lifecycle */

        execute,


        /* Platform */

        getPlatformInfo,


        /* Events */

        emit,


        /* Diagnostics */

        diagnostics,

        healthCheck,


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
       25 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppContract =
        api;

    window.HalDoOSAppContract =
        api;

    HalDoOS.appContract =
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


        try {

            /*
             * Bereits registrierte Apps
             * vom App Manager übernehmen.
             */

            const manager =
                getAppManager();


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


                    apps.forEach(
                        app => {

                            try {

                                createManifest(
                                    app
                                );

                            } catch (_) {}

                        }
                    );

                } catch (_) {}

            }


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


            emit(
                "ready",
                {
                    version:
                        VERSION
                }
            );


            log(
                "HalDo AI OS 20 App Contract bereit.",
                VERSION
            );


        } catch (exception) {

            state.initializing =
                false;

            state.failed =
                true;


            errorLog(
                "[HalDo App Contract]",
                exception
            );

        }


        return api;

    }


    /* ========================================================
       27 — BOOT
       ======================================================== */

    function boot() {

        initialize();

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
       28 — FINAL EXPORT
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
       APP CONTRACT
       ======================================================== */

})(window, document);