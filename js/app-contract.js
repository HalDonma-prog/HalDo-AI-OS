/* ============================================================
   HALDO AI OS 20
   APP CONTRACT
   ------------------------------------------------------------
   Datei:
       js/app-contract.js

   ZENTRALER APP-VERTRAG 20.0.1

   Der Contract ist die gemeinsame Runtime-Schnittstelle
   zwischen jeder HalDo-App und der HalDo-Plattform.

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

   Bestehende Funktionen werden nicht absichtlich entfernt.
   Unbekannte App-Felder bleiben erhalten.

   HALDO AI OS 20
   ============================================================ */

"use strict";

(function (window, document) {

    /* ========================================================
       01 — FOUNDATION
       ======================================================== */

    window.HalDoOS = window.HalDoOS || {};

    const HalDoOS = window.HalDoOS;

    const VERSION = "20.0.1";
    const MODULE_ID = "app-contract";
    const NAME = "HalDo AI OS 20 App Contract";


    /* ========================================================
       02 — INTERNAL STATE
       ======================================================== */

    const state = {

        initialized: false,
        initializing: false,
        ready: false,
        failed: false,

        manifests: new Map(),
        contexts: new Map(),
        validators: new Map(),

        lifecycleStates: new Map(),

        statistics: {

            manifestsCreated: 0,
            contextsCreated: 0,
            validations: 0,
            validationErrors: 0,
            executions: 0,
            executionErrors: 0,
            events: 0

        }

    };


    /* ========================================================
       03 — DEFAULT LIFECYCLE
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
       04 — DEFAULT PERMISSIONS
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
       05 — DEFAULT CAPABILITIES
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
       06 — SERVICE ACCESS
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


    function getSystem() {

        return (
            HalDoOS.system ||
            window.HalDoSystem ||
            null
        );

    }


    /* ========================================================
       07 — HELPERS
       ======================================================== */

    function hasMethod(object, method) {

        return !!(
            object &&
            typeof object[method] === "function"
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

                result[key] = clone(value[key]);

            });

            return result;

        }

        return value;

    }


    function now() {

        return Date.now();

    }


    function uniqueArray(value) {

        if (!Array.isArray(value)) {

            return [];

        }

        return Array.from(
            new Set(
                value
                    .filter(item =>
                        item !== null &&
                        item !== undefined &&
                        String(item).trim() !== ""
                    )
                    .map(item =>
                        typeof item === "string"
                            ? item.trim()
                            : item
                    )
            )
        );

    }


    function safeCall(
        object,
        method,
        args = [],
        fallback = null
    ) {

        if (!hasMethod(object, method)) {

            return fallback;

        }

        try {

            return object[method](...args);

        } catch (exception) {

            warn(
                "Service-Aufruf fehlgeschlagen:",
                method,
                exception
            );

            return fallback;

        }

    }


    /* ========================================================
       08 — LOGGING
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
       09 — EVENTS
       ======================================================== */

    function emit(event, data = null) {

        state.statistics.events += 1;

        const payload = {

            source: MODULE_ID,
            event,
            data,
            timestamp: new Date().toISOString()

        };


        const events = HalDoOS.events;

        if (
            events &&
            hasMethod(events, "emit")
        ) {

            safeCall(
                events,
                "emit",
                [
                    "app-contract:" + event,
                    payload
                ]
            );

        }


        const kernel = getKernel();

        if (
            kernel &&
            hasMethod(kernel, "emit")
        ) {

            safeCall(
                kernel,
                "emit",
                [
                    "app-contract:" + event,
                    payload
                ]
            );

        }


        try {

            window.dispatchEvent(
                new CustomEvent(
                    "haldo:app-contract:" + event,
                    {
                        detail: payload
                    }
                )
            );

        } catch (_) {}


        return payload;

    }


    /* ========================================================
       10 — MANIFEST CREATION
       ======================================================== */

    function createManifest(definition = {}) {

        const source = definition || {};

        const rawId =
            source.id ||
            source.appId ||
            source.name ||
            source.title ||
            "";

        const id = normalizeId(rawId);

        if (!id) {

            throw new Error(
                "App Contract: App-ID fehlt."
            );

        }


        const manifest = {

            /* Identity */

            id,
            appId: id,

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
                uniqueArray(source.tags),

            keywords:
                uniqueArray(source.keywords),


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
                    Array.isArray(source.permissions)
                        ? source.permissions
                        : DEFAULT_PERMISSIONS
                ),


            /* Capabilities */

            capabilities:
                uniqueArray(
                    Array.isArray(source.capabilities)
                        ? source.capabilities
                        : DEFAULT_CAPABILITIES
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
                    Array.isArray(source.lifecycle)
                        ? source.lifecycle
                        : DEFAULT_LIFECYCLE
                ),


            /* Lifecycle hooks */

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

            created:
                typeof source.created === "function"
                    ? source.created
                    : null,

            initializing:
                typeof source.initializing === "function"
                    ? source.initializing
                    : null,

            initialized:
                typeof source.initialized === "function"
                    ? source.initialized
                    : null,

            starting:
                typeof source.starting === "function"
                    ? source.starting
                    : null,

            running:
                typeof source.running === "function"
                    ? source.running
                    : null,

            opening:
                typeof source.opening === "function"
                    ? source.opening
                    : null,

            active:
                typeof source.active === "function"
                    ? source.active
                    : null,

            inactive:
                typeof source.inactive === "function"
                    ? source.inactive
                    : null,

            restoring:
                typeof source.restoring === "function"
                    ? source.restoring
                    : null,

            closing:
                typeof source.closing === "function"
                    ? source.closing
                    : null,

            closed:
                typeof source.closed === "function"
                    ? source.closed
                    : null,

            stopping:
                typeof source.stopping === "function"
                    ? source.stopping
                    : null,

            stopped:
                typeof source.stopped === "function"
                    ? source.stopped
                    : null,

            suspended:
                typeof source.suspended === "function"
                    ? source.suspended
                    : null,

            error:
                typeof source.error === "function"
                    ? source.error
                    : null,


            /* App data */

            data:
                clone(source.data || {}),

            ui:
                clone(source.ui || {}),


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
         * Zusätzliche app-spezifische Felder bleiben erhalten.
         */

        Object.keys(source).forEach(key => {

            if (
                !Object.prototype.hasOwnProperty.call(
                    manifest,
                    key
                )
            ) {

                manifest[key] = clone(source[key]);

            }

        });


        state.manifests.set(id, manifest);

        state.statistics.manifestsCreated += 1;


        if (!state.lifecycleStates.has(id)) {

            state.lifecycleStates.set(
                id,
                "created"
            );

        }


        emit(
            "manifest-created",
            {
                appId: id,
                manifest: clone(manifest)
            }
        );


        return manifest;

    }


    /* ========================================================
       11 — MANIFEST ACCESS
       ======================================================== */

    function getManifest(appId) {

        const id = normalizeId(appId);

        if (!id) {

            return null;

        }


        if (state.manifests.has(id)) {

            return clone(
                state.manifests.get(id)
            );

        }


        const manager = getAppManager();

        if (
            manager &&
            hasMethod(manager, "get")
        ) {

            try {

                const app = manager.get(id);

                if (app) {

                    /*
                     * Direkt intern speichern, damit getManifest()
                     * nicht rekursiv immer neue Manifests erzeugt.
                     */

                    return createManifest(app);

                }

            } catch (_) {}

        }


        const registry = getRegistry();

        if (
            registry &&
            hasMethod(registry, "get")
        ) {

            try {

                const app = registry.get(id);

                if (app) {

                    return createManifest(app);

                }

            } catch (_) {}

        }


        return null;

    }


    function getAllManifests() {

        return Array.from(
            state.manifests.values()
        ).map(clone);

    }


    function unregisterManifest(appId) {

        const id = normalizeId(appId);

        if (!id) {

            return false;

        }

        const removed =
            state.manifests.delete(id);

        if (removed) {

            state.contexts.delete(id);
            state.lifecycleStates.delete(id);

            emit(
                "manifest-removed",
                {
                    appId: id
                }
            );

        }

        return removed;

    }


    /* ========================================================
       12 — VALIDATION
       ======================================================== */

    function validate(definition) {

        state.statistics.validations += 1;

        const errors = [];
        const warnings = [];


        if (
            !definition ||
            typeof definition !== "object" ||
            Array.isArray(definition)
        ) {

            errors.push(
                "App Definition muss ein Objekt sein."
            );

            state.statistics.validationErrors += 1;

            return {

                valid: false,
                errors,
                warnings,
                appId: null,
                timestamp:
                    new Date().toISOString()

            };

        }


        const id = normalizeId(
            definition.id ||
            definition.appId ||
            definition.name ||
            definition.title
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


        const arrayFields = [

            "dependencies",
            "optionalDependencies",
            "permissions",
            "capabilities",
            "tags",
            "keywords",
            "lifecycle"

        ];


        arrayFields.forEach(field => {

            if (
                definition[field] !== undefined &&
                !Array.isArray(definition[field])
            ) {

                errors.push(
                    field +
                    " muss ein Array sein."
                );

            }

        });


        const hookFields = [

            "created",
            "init",
            "initializing",
            "initialized",
            "start",
            "starting",
            "running",
            "open",
            "opening",
            "activate",
            "active",
            "onActivate",
            "deactivate",
            "inactive",
            "onDeactivate",
            "minimize",
            "restore",
            "restoring",
            "close",
            "closing",
            "closed",
            "stop",
            "stopping",
            "stopped",
            "suspended",
            "error"

        ];


        hookFields.forEach(hook => {

            if (
                definition[hook] !== undefined &&
                typeof definition[hook] !== "function"
            ) {

                errors.push(
                    hook +
                    " muss eine Funktion sein."
                );

            }

        });


        if (
            definition.singleton === true &&
            definition.multiInstance === true
        ) {

            warnings.push(
                "singleton und multiInstance sind gleichzeitig aktiviert."
            );

        }


        if (errors.length > 0) {

            state.statistics.validationErrors += 1;

        }


        return {

            valid:
                errors.length === 0,

            errors,
            warnings,

            appId: id,

            timestamp:
                new Date().toISOString()

        };

    }


    function isValid(definition) {

        return validate(definition).valid;

    }


    /* ========================================================
       13 — CUSTOM VALIDATORS
       ======================================================== */

    function registerValidator(
        name,
        validator
    ) {

        if (
            !name ||
            typeof validator !== "function"
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
                name: String(name)
            }
        );


        return true;

    }


    function validateWithValidators(definition) {

        const results = [];

        state.validators.forEach(
            (validator, name) => {

                try {

                    const result =
                        validator(definition);

                    results.push({

                        name,

                        valid:
                            result !== false

                    });

                } catch (exception) {

                    results.push({

                        name,

                        valid: false,

                        error:
                            exception &&
                            exception.message
                                ? exception.message
                                : String(exception)

                    });

                }

            }
        );


        return results;

    }


    /* ========================================================
       14 — DEPENDENCIES
       ======================================================== */

    function dependencyExists(dependency) {

        const id = normalizeId(dependency);

        if (!id) {

            return false;

        }


        const manager = getAppManager();

        if (
            manager &&
            hasMethod(manager, "has")
        ) {

            try {

                if (manager.has(id)) {

                    return true;

                }

            } catch (_) {}

        }


        const registry = getRegistry();

        if (
            registry &&
            hasMethod(registry, "has")
        ) {

            try {

                if (registry.has(id)) {

                    return true;

                }

            } catch (_) {}

        }


        if (
            state.manifests.has(id)
        ) {

            return true;

        }


        return false;

    }


    function resolveDependencies(manifest) {

        const app = manifest || {};

        const dependencies =
            uniqueArray(app.dependencies);

        const optional =
            uniqueArray(app.optionalDependencies);


        const available = [];
        const missing = [];
        const optionalAvailable = [];
        const optionalMissing = [];


        dependencies.forEach(dependency => {

            if (
                dependencyExists(dependency)
            ) {

                available.push(dependency);

            } else {

                missing.push(dependency);

            }

        });


        optional.forEach(dependency => {

            if (
                dependencyExists(dependency)
            ) {

                optionalAvailable.push(dependency);

            } else {

                optionalMissing.push(dependency);

            }

        });


        return {

            valid:
                missing.length === 0,

            dependencies,
            optionalDependencies: optional,

            available,
            missing,

            optionalAvailable,
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
                : createManifest(app || {});


        const appId = manifest.id;


        const manager =
            services.appManager ||
            getAppManager();


        const context = {

            /* Identity */

            appId,
            id: appId,

            app:
                clone(manifest),


            /* Core */

            kernel:
                services.kernel ||
                getKernel(),

            system:
                services.system ||
                getSystem(),

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


            /* Platform */

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

            createdAt: now(),

            state: "created",


            /* State */

            getState() {

                if (
                    manager &&
                    hasMethod(manager, "getAppState")
                ) {

                    return safeCall(
                        manager,
                        "getAppState",
                        [appId],
                        null
                    );

                }

                return null;

            },


            updateState(changes = {}) {

                if (
                    manager &&
                    hasMethod(manager, "updateAppState")
                ) {

                    return safeCall(
                        manager,
                        "updateAppState",
                        [appId, changes],
                        null
                    );

                }

                return null;

            },


            /* Settings */

            getSettings() {

                if (
                    manager &&
                    hasMethod(manager, "getSettings")
                ) {

                    return safeCall(
                        manager,
                        "getSettings",
                        [appId],
                        {}
                    );

                }

                return {};

            },


            updateSettings(changes = {}) {

                return this.setSettings(changes);

            },


            setSettings(changes = {}) {

                if (
                    manager &&
                    hasMethod(manager, "setSettings")
                ) {

                    return safeCall(
                        manager,
                        "setSettings",
                        [appId, changes],
                        null
                    );

                }

                return null;

            },


            /* App navigation */

            openApp(targetAppId, options = {}) {

                if (
                    manager &&
                    hasMethod(manager, "open")
                ) {

                    return safeCall(
                        manager,
                        "open",
                        [targetAppId, options],
                        null
                    );

                }

                return null;

            },


            closeApp(targetAppId, options = {}) {

                if (
                    manager &&
                    hasMethod(manager, "close")
                ) {

                    return safeCall(
                        manager,
                        "close",
                        [targetAppId, options],
                        false
                    );

                }

                return false;

            },


            activateApp(targetAppId) {

                if (
                    manager &&
                    hasMethod(manager, "activate")
                ) {

                    return safeCall(
                        manager,
                        "activate",
                        [targetAppId],
                        false
                    );

                }

                return false;

            },


            minimizeApp(targetAppId) {

                if (
                    manager &&
                    hasMethod(manager, "minimize")
                ) {

                    return safeCall(
                        manager,
                        "minimize",
                        [targetAppId],
                        false
                    );

                }

                return false;

            },


            restoreApp(targetAppId) {

                if (
                    manager &&
                    hasMethod(manager, "restore")
                ) {

                    return safeCall(
                        manager,
                        "restore",
                        [targetAppId],
                        false
                    );

                }

                return false;

            },


            /* Events */

            emit(event, data = null) {

                const payload = {

                    appId,

                    event,
                    data,

                    timestamp:
                        new Date().toISOString()

                };


                if (
                    manager &&
                    hasMethod(manager, "emit")
                ) {

                    safeCall(
                        manager,
                        "emit",
                        [event, payload]
                    );

                }


                try {

                    window.dispatchEvent(
                        new CustomEvent(
                            "haldo:app:" + event,
                            {
                                detail: payload
                            }
                        )
                    );

                } catch (_) {}


                return payload;

            },


            on(event, callback) {

                if (
                    manager &&
                    hasMethod(manager, "on")
                ) {

                    return safeCall(
                        manager,
                        "on",
                        [event, callback],
                        function () {}
                    );

                }

                return function () {};

            },


            /* Contract */

            hasCapability(capability) {

                return manifest.capabilities.includes(
                    capability
                );

            },


            hasPermission(permission) {

                return manifest.permissions.includes(
                    permission
                );

            },


            getManifest() {

                return clone(manifest);

            }

        };


        state.contexts.set(
            appId,
            context
        );


        state.statistics.contextsCreated += 1;


        emit(
            "context-created",
            {
                appId
            }
        );


        return context;

    }


    function getContext(appId) {

        const id = normalizeId(appId);

        if (!id) {

            return null;

        }


        const existing =
            state.contexts.get(id);


        if (existing) {

            return existing;

        }


        const manifest =
            getManifest(id);


        if (!manifest) {

            return null;

        }


        return createContext(
            manifest
        );

    }


    function destroyContext(appId) {

        const id = normalizeId(appId);

        if (
            !state.contexts.has(id)
        ) {

            return false;

        }


        state.contexts.delete(id);


        emit(
            "context-destroyed",
            {
                appId: id
            }
        );


        return true;

    }


    /* ========================================================
       16 — PERMISSIONS
       ======================================================== */

    function getPermissions(appId) {

        const manifest =
            getManifest(appId);

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

        return getPermissions(appId)
            .includes(permission);

    }


    /* ========================================================
       17 — CAPABILITIES
       ======================================================== */

    function getCapabilities(appId) {

        const manifest =
            getManifest(appId);

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

        return getCapabilities(appId)
            .includes(capability);

    }


    /* ========================================================
       18 — LIFECYCLE STATE
       ======================================================== */

    function getLifecycleState(appId) {

        const id = normalizeId(appId);

        return (
            state.lifecycleStates.get(id) ||
            null
        );

    }


    function setLifecycleState(
        appId,
        lifecycle
    ) {

        const id = normalizeId(appId);

        if (!id) {

            return false;

        }


        if (
            !DEFAULT_LIFECYCLE.includes(
                lifecycle
            )
        ) {

            return false;

        }


        state.lifecycleStates.set(
            id,
            lifecycle
        );


        const context =
            state.contexts.get(id);


        if (context) {

            context.state = lifecycle;

        }


        emit(
            "lifecycle-state-changed",
            {
                appId: id,
                lifecycle
            }
        );


        return true;

    }


    /* ========================================================
       19 — LIFECYCLE EXECUTION
       ======================================================== */

    async function execute(
        appId,
        lifecycle,
        payload = {}
    ) {

        state.statistics.executions += 1;


        const manifest =
            getManifest(appId);


        if (!manifest) {

            state.statistics.executionErrors += 1;

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

            state.statistics.executionErrors += 1;

            throw new Error(
                "App Contract: Unbekannter Lifecycle: " +
                lifecycle
            );

        }


        const hook =
            manifest[lifecycle];


        setLifecycleState(
            manifest.id,
            lifecycle
        );


        emit(
            "lifecycle-before",
            {
                appId: manifest.id,
                lifecycle,
                payload
            }
        );


        if (
            typeof hook !== "function"
        ) {

            emit(
                "lifecycle-after",
                {
                    appId: manifest.id,
                    lifecycle,
                    result: null
                }
            );

            return null;

        }


        const context =
            getContext(
                manifest.id
            );


        const contractPayload = {

            ...payload,

            app:
                clone(manifest),

            context,

            contract:
                api

        };


        try {

            const result =
                hook(contractPayload);


            const resolved =
                result &&
                typeof result.then === "function"
                    ? await result
                    : result;


            emit(
                "lifecycle-after",
                {
                    appId: manifest.id,
                    lifecycle,
                    result: resolved
                }
            );


            return resolved;

        } catch (exception) {

            state.statistics.executionErrors += 1;

            setLifecycleState(
                manifest.id,
                "error"
            );


            errorLog(
                "[App Contract]",
                lifecycle,
                manifest.id,
                exception
            );


            emit(
                "lifecycle-error",
                {
                    appId: manifest.id,
                    lifecycle,
                    error: exception
                }
            );


            throw exception;

        }

    }


    /* ========================================================
       20 — PLATFORM INFORMATION
       ======================================================== */

    function getPlatformInfo() {

        return {

            name: NAME,
            version: VERSION,
            module: MODULE_ID,

            lifecycle:
                clone(DEFAULT_LIFECYCLE),

            permissions:
                clone(DEFAULT_PERMISSIONS),

            capabilities:
                clone(DEFAULT_CAPABILITIES),

            manifestCount:
                state.manifests.size,

            contextCount:
                state.contexts.size,

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       21 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        return {

            name: NAME,
            version: VERSION,
            module: MODULE_ID,

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

            lifecycleStates:
                state.lifecycleStates.size,

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
                    !!getKeyboard(),

                system:
                    !!getSystem()

            },

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       22 — HEALTH CHECK
       ======================================================== */

    function healthCheck() {

        const problems = [];


        if (!getKernel()) {

            problems.push(
                "Kernel nicht verbunden."
            );

        }


        if (!getAppManager()) {

            problems.push(
                "App Manager nicht verbunden."
            );

        }


        if (!getRegistry()) {

            problems.push(
                "App Registry nicht verbunden."
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
       23 — PUBLIC API
       ======================================================== */

    const api = {

        name: NAME,
        version: VERSION,
        module: MODULE_ID,


        /* Manifest */

        createManifest,
        getManifest,
        getAllManifests,
        unregisterManifest,


        /* Validation */

        validate,
        isValid,
        registerValidator,
        validateWithValidators,


        /* Dependencies */

        resolveDependencies,
        dependencyExists,


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
        getLifecycleState,
        setLifecycleState,


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
                    state.contexts.size,

                lifecycleStateCount:
                    state.lifecycleStates.size

            };

        }

    };


    /* ========================================================
       24 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppContract = api;
    window.HalDoOSAppContract = api;

    HalDoOS.appContract = api;


    /* ========================================================
       25 — INITIALIZATION
       ======================================================== */

    function initialize() {

        if (state.ready) {

            return api;

        }


        if (state.initializing) {

            return api;

        }


        state.initializing = true;
        state.initialized = true;
        state.failed = false;


        try {

            /*
             * Bereits vorhandene Apps übernehmen.
             */

            const manager =
                getAppManager();


            if (
                manager &&
                hasMethod(manager, "getAll")
            ) {

                try {

                    const apps =
                        manager.getAll() || [];


                    apps.forEach(app => {

                        try {

                            if (
                                app &&
                                (
                                    app.id ||
                                    app.appId ||
                                    app.name ||
                                    app.title
                                )
                            ) {

                                const id =
                                    normalizeId(
                                        app.id ||
                                        app.appId ||
                                        app.name ||
                                        app.title
                                    );


                                /*
                                 * Bereits vorhandene Manifests
                                 * nicht unnötig neu erzeugen.
                                 */

                                if (
                                    !state.manifests.has(id)
                                ) {

                                    createManifest(app);

                                }

                            }

                        } catch (exception) {

                            warn(
                                "Manifest konnte nicht übernommen werden.",
                                exception
                            );

                        }

                    });

                } catch (exception) {

                    warn(
                        "App Manager konnte nicht gelesen werden.",
                        exception
                    );

                }

            }


            state.ready = true;
            state.initializing = false;


            const kernel =
                getKernel();


            if (
                kernel &&
                hasMethod(kernel, "registerModule")
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
                hasMethod(kernel, "setModuleReady")
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
                    version: VERSION
                }
            );


            log(
                "HalDo AI OS 20 App Contract bereit.",
                VERSION
            );


        } catch (exception) {

            state.initializing = false;
            state.failed = true;


            errorLog(
                "[HalDo App Contract]",
                exception
            );

        }


        return api;

    }


    /* ========================================================
       26 — BOOT
       ======================================================== */

    function boot() {

        initialize();

    }


    if (
        document.readyState === "loading"
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
       27 — FINAL EXPORT
       ======================================================== */

    HalDoOS.appContract = api;

    window.HalDoAppContract = api;
    window.HalDoOSAppContract = api;


    /* ========================================================
       END
       HALDO AI OS 20
       APP CONTRACT
       ============================================================ */

})(window, document);