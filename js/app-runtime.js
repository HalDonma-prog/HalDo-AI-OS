/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
       js/app-runtime.js

   HALDO APPLICATION RUNTIME

   Aufgabe:
   - App Contract ausführen
   - App Lifecycle verwalten
   - App State verwalten
   - App Events
   - App Settings
   - App Storage
   - App Context
   - App Dependencies
   - App Services
   - App Diagnostics
   - App Error Handling
   - Verbindung zum App Manager
   - Verbindung zum Kernel
   - Verbindung zum System
   - sichere Erweiterbarkeit

   WICHTIG:
   Diese Runtime ist die gemeinsame technische
   Grundlage für ALLE HalDo AI OS 20 Apps.

   Jede vollständige App soll diese Runtime verwenden.

   ============================================================ */

"use strict";

(function (window, document) {

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

    const MODULE_ID =
        "app-runtime";

    const NAME =
        "HalDo AI OS Application Runtime";


    /* ========================================================
       03 — REFERENCES
       ======================================================== */

    function getAppManager() {

        return (
            window.HalDoAppManager ||
            HalDoOS.appManager ||
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
            window.HalDoStorageManager ||
            HalDoOS.storageManager ||
            null
        );

    }


    function getLanguage() {

        return (
            window.HalDoLanguageSystem ||
            HalDoOS.languageSystem ||
            window.HalDoLanguageManager ||
            HalDoOS.languageManager ||
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


    /* ========================================================
       04 — INTERNAL RUNTIMES
       ======================================================== */

    const runtimes =
        new Map();


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
                key => {

                    if (
                        typeof value[key] ===
                        "function"
                    ) {

                        result[key] =
                            value[key];

                    } else {

                        result[key] =
                            clone(
                                value[key]
                            );

                    }

                }
            );

            return result;

        }


        return value;

    }


    /* ========================================================
       06 — ERROR NORMALIZATION
       ======================================================== */

    function normalizeError(
        exception
    ) {

        if (
            exception instanceof Error
        ) {

            return exception;

        }


        return new Error(
            String(
                exception
            )
        );

    }


    /* ========================================================
       07 — RUNTIME CLASS
       ======================================================== */

    class HalDoAppRuntime {

        constructor(
            definition,
            options = {}
        ) {

            this.definition =
                definition || {};

            this.id =
                normalizeId(
                    definition &&
                    definition.id
                );

            this.options =
                {
                    ...options
                };


            this.version =
                VERSION;


            this.createdAt =
                Date.now();


            this.initialized =
                false;


            this.started =
                false;


            this.destroyed =
                false;


            this.state = {

                status:
                    "created",

                open:
                    false,

                active:
                    false,

                minimized:
                    false,

                maximized:
                    false,

                pip:
                    false

            };


            this.settings = {};


            this.storage = {};


            this.events =
                new Map();


            this.errors =
                [];


            this.statistics = {

                initializes:
                    0,

                starts:
                    0,

                stops:
                    0,

                opens:
                    0,

                closes:
                    0,

                activates:
                    0,

                errors:
                    0

            };


            this.context =
                null;

        }


        /* ====================================================
           RUNTIME EVENTS
           ==================================================== */

        on(
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
                !this.events.has(
                    event
                )
            ) {

                this.events.set(
                    event,
                    new Set()
                );

            }


            this.events
                .get(event)
                .add(
                    callback
                );


            return () => {

                this.off(
                    event,
                    callback
                );

            };

        }


        off(
            event,
            callback
        ) {

            const listeners =
                this.events.get(
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

                this.events.delete(
                    event
                );

            }

        }


        emit(
            event,
            data = null
        ) {

            const listeners =
                this.events.get(
                    event
                );


            if (listeners) {

                Array.from(
                    listeners
                ).forEach(
                    callback => {

                        try {

                            callback(
                                data
                            );

                        } catch (exception) {

                            this.reportError(
                                exception,
                                "Runtime Event: " +
                                event
                            );

                        }

                    }
                );

            }


            const manager =
                getAppManager();


            if (
                manager &&
                hasMethod(
                    manager,
                    "emit"
                )
            ) {

                try {

                    manager.emit(
                        "runtime:" +
                        event,

                        {
                            appId:
                                this.id,

                            data:
                                data
                        }
                    );

                } catch (_) {}

            }

        }


        /* ====================================================
           ERROR HANDLING
           ==================================================== */

        reportError(
            exception,
            context = "App Runtime"
        ) {

            const error =
                normalizeError(
                    exception
                );


            const record = {

                appId:
                    this.id,

                name:
                    error.name,

                message:
                    error.message,

                stack:
                    error.stack ||
                    "",

                context:
                    context,

                time:
                    Date.now()

            };


            this.errors.push(
                record
            );


            if (
                this.errors.length >
                100
            ) {

                this.errors.shift();

            }


            this.statistics.errors +=
                1;


            this.emit(
                "error",
                record
            );


            const manager =
                getAppManager();


            if (
                manager &&
                hasMethod(
                    manager,
                    "emit"
                )
            ) {

                try {

                    manager.emit(
                        "app-runtime-error",
                        record
                    );

                } catch (_) {}

            }


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
                        error,
                        "App: " +
                        this.id +
                        " / " +
                        context
                    );

                } catch (_) {}

            }


            return record;

        }


        /* ====================================================
           CONTRACT
           ==================================================== */

        validateContract() {

            const contract =
                getContract();


            if (
                !contract
            ) {

                return {

                    valid:
                        true,

                    available:
                        false,

                    errors:
                        []

                };

            }


            try {

                if (
                    hasMethod(
                        contract,
                        "validate"
                    )
                ) {

                    const result =
                        contract.validate(
                            this.definition
                        );


                    return (
                        result || {
                            valid:
                                true,

                            errors:
                                []
                        }
                    );

                }

            } catch (exception) {

                this.reportError(
                    exception,
                    "Contract Validation"
                );


                return {

                    valid:
                        false,

                    errors:
                        [
                            exception.message
                        ]

                };

            }


            return {

                valid:
                    true,

                available:
                    true,

                errors:
                    []

            };

        }


        /* ====================================================
           CONTEXT
           ==================================================== */

        createContext() {

            const runtime =
                this;


            this.context = {

                app:
                    this.definition,

                id:
                    this.id,

                version:
                    VERSION,

                runtime:
                    runtime,

                manager:
                    getAppManager(),

                kernel:
                    getKernel(),

                system:
                    getSystem(),

                router:
                    getRouter(),

                windowManager:
                    getWindowManager(),

                storage:
                    this.storage,

                settings:
                    this.settings,

                state:
                    this.state,

                language:
                    getLanguage(),

                ai:
                    getAI(),

                emit:
                    function (
                        event,
                        data
                    ) {

                        runtime.emit(
                            event,
                            data
                        );

                    },

                on:
                    function (
                        event,
                        callback
                    ) {

                        return runtime.on(
                            event,
                            callback
                        );

                    },

                setState:
                    function (
                        changes
                    ) {

                        return runtime.setState(
                            changes
                        );

                    },

                getState:
                    function () {

                        return runtime.getState();

                    },

                getSettings:
                    function () {

                        return runtime.getSettings();

                    },

                setSettings:
                    function (
                        changes
                    ) {

                        return runtime.setSettings(
                            changes
                        );

                    },

                getStorage:
                    function (
                        key,
                        fallback
                    ) {

                        return runtime.getStorage(
                            key,
                            fallback
                        );

                    },

                setStorage:
                    function (
                        key,
                        value
                    ) {

                        return runtime.setStorage(
                            key,
                            value
                        );

                    }

            };


            return this.context;

        }


        /* ====================================================
           SETTINGS
           ==================================================== */

        loadSettings() {

            const manager =
                getAppManager();


            try {

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "loadAppSettings"
                    )
                ) {

                    this.settings =
                        manager.loadAppSettings(
                            this.id
                        ) || {};

                    return this.settings;

                }


                const raw =
                    window.localStorage.getItem(
                        "haldo.app.settings." +
                        this.id
                    );


                if (raw) {

                    this.settings =
                        JSON.parse(
                            raw
                        ) || {};

                }

            } catch (exception) {

                this.reportError(
                    exception,
                    "Settings laden"
                );

            }


            return this.settings;

        }


        getSettings() {

            return {
                ...this.settings
            };

        }


        setSettings(
            changes
        ) {

            this.settings = {

                ...this.settings,

                ...(changes || {})

            };


            const manager =
                getAppManager();


            try {

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "setSettings"
                    )
                ) {

                    manager.setSettings(
                        this.id,
                        this.settings
                    );

                } else {

                    window.localStorage.setItem(
                        "haldo.app.settings." +
                        this.id,

                        JSON.stringify(
                            this.settings
                        )
                    );

                }

            } catch (exception) {

                this.reportError(
                    exception,
                    "Settings speichern"
                );

            }


            this.emit(
                "settings-changed",
                {
                    settings:
                        this.getSettings()
                }
            );


            return this.getSettings();

        }


        resetSettings() {

            this.settings = {};


            const manager =
                getAppManager();


            try {

                if (
                    manager &&
                    hasMethod(
                        manager,
                        "resetSettings"
                    )
                ) {

                    manager.resetSettings(
                        this.id
                    );

                }

            } catch (exception) {

                this.reportError(
                    exception,
                    "Settings zurücksetzen"
                );

            }


            this.emit(
                "settings-reset"
            );


            return true;

        }


        /* ====================================================
           STORAGE
           ==================================================== */

        storageKey(
            key
        ) {

            return (
                "haldo.app.data." +
                this.id +
                "." +
                String(
                    key || "default"
                )
            );

        }


        getStorage(
            key,
            fallback = null
        ) {

            const normalizedKey =
                String(
                    key || "default"
                );


            try {

                const raw =
                    window.localStorage.getItem(
                        this.storageKey(
                            normalizedKey
                        )
                    );


                if (
                    raw === null
                ) {

                    return fallback;

                }


                return JSON.parse(
                    raw
                );

            } catch (exception) {

                this.reportError(
                    exception,
                    "Storage lesen"
                );


                return fallback;

            }

        }


        setStorage(
            key,
            value
        ) {

            try {

                window.localStorage.setItem(
                    this.storageKey(
                        key
                    ),

                    JSON.stringify(
                        value
                    )
                );


                this.storage[
                    key
                ] =
                    clone(
                        value
                    );


                this.emit(
                    "storage-changed",
                    {
                        key:
                            key,

                        value:
                            clone(
                                value
                            )
                    }
                );


                return true;

            } catch (exception) {

                this.reportError(
                    exception,
                    "Storage speichern"
                );


                return false;

            }

        }


        removeStorage(
            key
        ) {

            try {

                window.localStorage.removeItem(
                    this.storageKey(
                        key
                    )
                );


                delete this.storage[
                    key
                ];


                this.emit(
                    "storage-removed",
                    {
                        key:
                            key
                    }
                );


                return true;

            } catch (exception) {

                this.reportError(
                    exception,
                    "Storage entfernen"
                );


                return false;

            }

        }


        clearStorage() {

            try {

                const prefix =
                    "haldo.app.data." +
                    this.id +
                    ".";


                const keys = [];

                for (
                    let index = 0;
                    index <
                    window.localStorage.length;
                    index += 1
                ) {

                    const key =
                        window.localStorage.key(
                            index
                        );


                    if (
                        key &&
                        key.indexOf(
                            prefix
                        ) === 0
                    ) {

                        keys.push(
                            key
                        );

                    }

                }


                keys.forEach(
                    key => {

                        window.localStorage.removeItem(
                            key
                        );

                    }
                );


                this.storage = {};


                this.emit(
                    "storage-cleared"
                );


                return true;

            } catch (exception) {

                this.reportError(
                    exception,
                    "Storage löschen"
                );


                return false;

            }

        }


        /* ====================================================
           STATE
           ==================================================== */

        setState(
            changes
        ) {

            const previous = {
                ...this.state
            };


            Object.assign(
                this.state,
                changes || {}
            );


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

                    manager.updateAppState(
                        this.id,
                        this.state
                    );

                } catch (exception) {

                    this.reportError(
                        exception,
                        "App Manager State"
                    );

                }

            }


            this.emit(
                "state-changed",
                {

                    previous:
                        previous,

                    current:
                        this.getState()

                }
            );


            return this.getState();

        }


        getState() {

            return {
                ...this.state
            };

        }


        /* ====================================================
           DEPENDENCIES
           ==================================================== */

        checkDependencies() {

            const manager =
                getAppManager();


            if (
                manager &&
                hasMethod(
                    manager,
                    "checkDependencies"
                )
            ) {

                try {

                    return manager.checkDependencies(
                        this.definition
                    );

                } catch (exception) {

                    this.reportError(
                        exception,
                        "Dependencies"
                    );

                }

            }


            const dependencies =
                Array.isArray(
                    this.definition.dependencies
                )
                    ? this.definition.dependencies
                    : [];


            const missing = [];


            dependencies.forEach(
                dependency => {

                    if (
                        manager &&
                        hasMethod(
                            manager,
                            "has"
                        )
                    ) {

                        if (
                            !manager.has(
                                dependency
                            )
                        ) {

                            missing.push(
                                dependency
                            );

                        }

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


        /* ====================================================
           LIFECYCLE — INIT
           ==================================================== */

        async initialize() {

            if (
                this.destroyed
            ) {

                throw new Error(
                    "Runtime wurde bereits zerstört."
                );

            }


            if (
                this.initialized
            ) {

                return true;

            }


            const validation =
                this.validateContract();


            if (
                validation &&
                validation.valid ===
                false
            ) {

                throw new Error(
                    "App Contract ungültig: " +
                    JSON.stringify(
                        validation.errors ||
                        []
                    )
                );

            }


            const dependencies =
                this.checkDependencies();


            if (
                dependencies &&
                dependencies.valid ===
                false
            ) {

                throw new Error(
                    "Fehlende App Dependencies: " +
                    (
                        dependencies.missing ||
                        []
                    ).join(
                        ", "
                    )
                );

            }


            this.loadSettings();


            this.createContext();


            try {

                if (
                    typeof this.definition.init ===
                    "function"
                ) {

                    await this.definition.init(
                        this.context
                    );

                }


                this.initialized =
                    true;


                this.statistics.initializes +=
                    1;


                this.setState(
                    {
                        status:
                            "initialized"
                    }
                );


                this.emit(
                    "initialized",
                    {
                        app:
                            this.definition
                    }
                );


                return true;

            } catch (exception) {

                this.reportError(
                    exception,
                    "App Initialize"
                );


                this.setState(
                    {
                        status:
                            "error"
                    }
                );


                return false;

            }

        }


        /* ====================================================
           LIFECYCLE — START
           ==================================================== */

        async start(
            options = {}
        ) {

            if (
                !this.initialized
            ) {

                const initialized =
                    await this.initialize();


                if (!initialized) {

                    return false;

                }

            }


            if (
                this.started
            ) {

                return true;

            }


            try {

                if (
                    typeof this.definition.start ===
                    "function"
                ) {

                    await this.definition.start(
                        {

                            ...this.context,

                            options:
                                options

                        }
                    );

                }


                this.started =
                    true;


                this.statistics.starts +=
                    1;


                this.setState(
                    {
                        status:
                            "running"
                    }
                );


                this.emit(
                    "started",
                    {
                        options:
                            options
                    }
                );


                return true;

            } catch (exception) {

                this.reportError(
                    exception,
                    "App Start"
                );


                this.setState(
                    {
                        status:
                            "error"
                    }
                );


                return false;

            }

        }


        /* ====================================================
           LIFECYCLE — OPEN
           ==================================================== */

        async open(
            options = {}
        ) {

            const started =
                await this.start(
                    options
                );


            if (!started) {

                return false;

            }


            try {

                if (
                    typeof this.definition.open ===
                    "function"
                ) {

                    await this.definition.open(
                        {

                            ...this.context,

                            options:
                                options

                        }
                    );

                }


                this.statistics.opens +=
                    1;


                this.setState(
                    {

                        open:
                            true,

                        active:
                            true,

                        minimized:
                            false,

                        status:
                            "open"

                    }
                );


                this.emit(
                    "opened",
                    {
                        options:
                            options
                    }
                );


                return true;

            } catch (exception) {

                this.reportError(
                    exception,
                    "App Open"
                );


                return false;

            }

        }


        /* ====================================================
           LIFECYCLE — ACTIVATE
           ==================================================== */

        async activate() {

            try {

                if (
                    typeof this.definition.onActivate ===
                    "function"
                ) {

                    await this.definition.onActivate(
                        this.context
                    );

                }


                this.statistics.activates +=
                    1;


                this.setState(
                    {
                        active:
                            true,

                        minimized:
                            false
                    }
                );


                this.emit(
                    "activated"
                );


                return true;

            } catch (exception) {

                this.reportError(
                    exception,
                    "App Activate"
                );


                return false;

            }

        }


        /* ====================================================
           LIFECYCLE — DEACTIVATE
           ==================================================== */

        async deactivate() {

            try {

                if (
                    typeof this.definition.onDeactivate ===
                    "function"
                ) {

                    await this.definition.onDeactivate(
                        this.context
                    );

                }


                this.setState(
                    {
                        active:
                            false
                    }
                );


                this.emit(
                    "deactivated"
                );


                return true;

            } catch (exception) {

                this.reportError(
                    exception,
                    "App Deactivate"
                );


                return false;

            }

        }


        /* ====================================================
           LIFECYCLE — MINIMIZE
           ==================================================== */

        async minimize() {

            try {

                if (
                    typeof this.definition.minimize ===
                    "function"
                ) {

                    await this.definition.minimize(
                        this.context
                    );

                }


                this.setState(
                    {

                        minimized:
                            true,

                        active:
                            false

                    }
                );


                this.emit(
                    "minimized"
                );


                return true;

            } catch (exception) {

                this.reportError(
                    exception,
                    "App Minimize"
                );


                return false;

            }

        }


        /* ====================================================
           LIFECYCLE — RESTORE
           ==================================================== */

        async restore() {

            try {

                if (
                    typeof this.definition.restore ===
                    "function"
                ) {

                    await this.definition.restore(
                        this.context
                    );

                }


                this.setState(
                    {

                        minimized:
                            false,

                        active:
                            true

                    }
                );


                this.emit(
                    "restored"
                );


                return true;

            } catch (exception) {

                this.reportError(
                    exception,
                    "App Restore"
                );


                return false;

            }

        }


        /* ====================================================
           LIFECYCLE — CLOSE
           ==================================================== */

        async close(
            options = {}
        ) {

            try {

                if (
                    typeof this.definition.close ===
                    "function"
                ) {

                    await this.definition.close(
                        {

                            ...this.context,

                            options:
                                options

                        }
                    );

                }


                this.statistics.closes +=
                    1;


                this.setState(
                    {

                        open:
                            false,

                        active:
                            false,

                        minimized:
                            false,

                        maximized:
                            false,

                        pip:
                            false,

                        status:
                            "closed"

                    }
                );


                this.emit(
                    "closed",
                    {
                        options:
                            options
                    }
                );


                return true;

            } catch (exception) {

                this.reportError(
                    exception,
                    "App Close"
                );


                return false;

            }

        }


        /* ====================================================
           LIFECYCLE — STOP
           ==================================================== */

        async stop() {

            try {

                if (
                    typeof this.definition.stop ===
                    "function"
                ) {

                    await this.definition.stop(
                        this.context
                    );

                }


                this.started =
                    false;


                this.statistics.stops +=
                    1;


                this.setState(
                    {
                        status:
                            "stopped"
                    }
                );


                this.emit(
                    "stopped"
                );


                return true;

            } catch (exception) {

                this.reportError(
                    exception,
                    "App Stop"
                );


                return false;

            }

        }


        /* ====================================================
           DESTROY
           ==================================================== */

        async destroy() {

            try {

                if (
                    this.started
                ) {

                    await this.stop();

                }


                if (
                    typeof this.definition.destroy ===
                    "function"
                ) {

                    await this.definition.destroy(
                        this.context
                    );

                }


                this.destroyed =
                    true;


                this.initialized =
                    false;


                this.started =
                    false;


                this.emit(
                    "destroyed"
                );


                this.events.clear();


                return true;

            } catch (exception) {

                this.reportError(
                    exception,
                    "App Destroy"
                );


                return false;

            }

        }


        /* ====================================================
           DIAGNOSTICS
           ==================================================== */

        diagnostics() {

            return {

                name:
                    NAME,

                version:
                    VERSION,

                runtime:
                    MODULE_ID,

                appId:
                    this.id,

                initialized:
                    this.initialized,

                started:
                    this.started,

                destroyed:
                    this.destroyed,

                state:
                    this.getState(),

                settings:
                    this.getSettings(),

                dependencies:
                    this.checkDependencies(),

                statistics:
                    {
                        ...this.statistics
                    },

                errors:
                    this.errors.slice(),

                timestamp:
                    new Date().toISOString()

            };

        }

    }


    /* ========================================================
       08 — RUNTIME FACTORY
       ======================================================== */

    function create(
        definition,
        options = {}
    ) {

        if (
            !definition ||
            !definition.id
        ) {

            throw new Error(
                "Eine App Definition mit id ist erforderlich."
            );

        }


        const id =
            normalizeId(
                definition.id
            );


        if (
            runtimes.has(
                id
            )
        ) {

            return runtimes.get(
                id
            );

        }


        const runtime =
            new HalDoAppRuntime(
                definition,
                options
            );


        runtimes.set(
            id,
            runtime
        );


        return runtime;

    }


    function get(
        appId
    ) {

        return (
            runtimes.get(
                normalizeId(
                    appId
                )
            ) ||
            null
        );

    }


    function has(
        appId
    ) {

        return runtimes.has(
            normalizeId(
                appId
            )
        );

    }


    async function destroy(
        appId
    ) {

        const runtime =
            get(
                appId
            );


        if (!runtime) {

            return false;

        }


        const result =
            await runtime.destroy();


        runtimes.delete(
            normalizeId(
                appId
            )
        );


        return result;

    }


    function getAll() {

        return Array.from(
            runtimes.values()
        );

    }


    function getCount() {

        return runtimes.size;

    }


    function diagnostics() {

        return {

            name:
                NAME,

            version:
                VERSION,

            module:
                MODULE_ID,

            runtimeCount:
                getCount(),

            runtimes:
                getAll().map(
                    runtime =>
                        runtime.diagnostics()
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       09 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


        Runtime:
            HalDoAppRuntime,


        create:
            create,

        get:
            get,

        has:
            has,

        destroy:
            destroy,

        getAll:
            getAll,

        getCount:
            getCount,

        diagnostics:
            diagnostics

    };


    /* ========================================================
       10 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppRuntime =
        api;

    window.HalDoOSAppRuntime =
        api;

    HalDoOS.appRuntime =
        api;


    /* ========================================================
       11 — KERNEL CONNECTION
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


            return true;

        } catch (exception) {

            console.error(
                "[HalDo App Runtime]",
                exception
            );


            return false;

        }

    }


    /* ========================================================
       12 — STARTUP
       ======================================================== */

    function initialize() {

        connectKernel();


        console.log(
            "[HalDo App Runtime]",
            VERSION,
            "bereit."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once:
                    true
            }
        );

    } else {

        initialize();

    }


})(window, document);


/* ============================================================
   END
   HALDO AI OS 20 APPLICATION RUNTIME
   ============================================================ */