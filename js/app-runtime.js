"use strict";

/*
============================================================
 HALDO AI OS 20
 APP RUNTIME
 ------------------------------------------------------------
 Datei:
     /js/app-runtime.js

 Zweck:
     Zentrale Runtime für echte HalDo-AI-OS-Apps.

 Aufgaben:
     - App-Lebenszyklus
     - App Mount / Unmount
     - App Context
     - App State
     - App Events
     - App Storage
     - Router-Verbindung
     - Window-Manager-Verbindung
     - System-Verbindung
     - AI-Verbindung
     - Fehlerbehandlung
     - Runtime-Diagnose
     - Kompatibilität mit bestehendem App Manager
     - Kompatibilität mit bestehender App Registry

 Diese Datei ist KEINE einzelne App.

 Sie stellt die Infrastruktur bereit,
 auf der die einzelnen Apps vollständig laufen.
============================================================
*/

(function () {

    "use strict";


    /* ========================================================
       01 — GLOBAL NAMESPACE
       ======================================================== */

    const existingOS =
        window.HalDoOS &&
        typeof window.HalDoOS === "object"
            ? window.HalDoOS
            : {};

    window.HalDoOS = existingOS;


    /* ========================================================
       02 — CONSTANTS
       ======================================================== */

    const VERSION =
        "20.0.0";

    const RUNTIME_ID =
        "haldo-app-runtime";

    const MAX_STATE_SIZE =
        500000;

    const DEFAULT_MOUNT_TIMEOUT =
        15000;


    /* ========================================================
       03 — INTERNAL STATE
       ======================================================== */

    const runtimeApps =
        new Map();

    const activeInstances =
        new Map();

    const listeners =
        new Map();

    let activeAppId =
        null;

    let initialized =
        false;

    let runtimeReady =
        false;


    /* ========================================================
       04 — UTILITIES
       ======================================================== */

    function isObject(value) {

        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );

    }


    function isFunction(value) {

        return typeof value === "function";

    }


    function safeString(value) {

        try {

            return String(
                value ?? ""
            );

        } catch (_) {

            return "";

        }

    }


    function createId(prefix) {

        return (
            prefix +
            "-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 10)
        );

    }


    function clone(value) {

        if (
            value === undefined ||
            value === null
        ) {

            return value;

        }


        try {

            if (
                typeof structuredClone ===
                "function"
            ) {

                return structuredClone(
                    value
                );

            }

        } catch (_) {}


        try {

            return JSON.parse(
                JSON.stringify(
                    value
                )
            );

        } catch (_) {

            return value;

        }

    }


    function dispatch(
        name,
        detail = {}
    ) {

        try {

            window.dispatchEvent(
                new CustomEvent(
                    name,
                    {
                        detail
                    }
                )
            );

        } catch (error) {

            console.error(
                "[HalDo App Runtime] Event error",
                error
            );

        }

    }


    function log(
        ...args
    ) {

        console.log(
            "[HalDo App Runtime]",
            ...args
        );

    }


    function warn(
        ...args
    ) {

        console.warn(
            "[HalDo App Runtime]",
            ...args
        );

    }


    function error(
        ...args
    ) {

        console.error(
            "[HalDo App Runtime]",
            ...args
        );

    }


    /* ========================================================
       05 — SERVICE DISCOVERY
       ======================================================== */

    function getSystem() {

        return (
            window.HalDoSystem ||
            (
                window.HalDoOS &&
                window.HalDoOS.system
            ) ||
            null
        );

    }


    function getKernel() {

        return (
            window.HalDoKernel ||
            (
                window.HalDoOS &&
                window.HalDoOS.kernel
            ) ||
            null
        );

    }


    function getAppManager() {

        return (
            window.HalDoAppManager ||
            window.HalDoOSAppManager ||
            (
                window.HalDoOS &&
                window.HalDoOS.appManager
            ) ||
            null
        );

    }


    function getAppRegistry() {

        return (
            window.HalDoAppRegistry ||
            window.HalDoOSAppRegistry ||
            (
                window.HalDoOS &&
                window.HalDoOS.appRegistry
            ) ||
            null
        );

    }


    function getRouter() {

        return (
            window.HalDoAppRouter ||
            window.HalDoRouter ||
            (
                window.HalDoOS &&
                (
                    window.HalDoOS.router ||
                    window.HalDoOS.appRouter
                )
            ) ||
            null
        );

    }


    function getWindowManager() {

        return (
            window.HalDoWindowManager ||
            (
                window.HalDoOS &&
                window.HalDoOS.windowManager
            ) ||
            null
        );

    }


    function getStorage() {

        return (
            window.HalDoStorageManager ||
            window.HalDoStorage ||
            (
                window.HalDoOS &&
                (
                    window.HalDoOS.storageManager ||
                    window.HalDoOS.storage
                )
            ) ||
            null
        );

    }


    function getAI() {

        return (
            window.HalDoAI ||
            window.HalDoAICore ||
            (
                window.HalDoOS &&
                (
                    window.HalDoOS.ai ||
                    window.HalDoOS.aiCore
                )
            ) ||
            null
        );

    }


    function getLanguage() {

        return (
            window.HalDoLanguageManager ||
            window.HalDoLanguageSystem ||
            (
                window.HalDoOS &&
                (
                    window.HalDoOS.language ||
                    window.HalDoOS.languageManager
                )
            ) ||
            null
        );

    }


    /* ========================================================
       06 — APP NORMALIZATION
       ======================================================== */

    function normalizeApp(
        definition
    ) {

        if (!definition) {

            throw new Error(
                "Ungültige App-Definition."
            );

        }


        const source =
            definition.app ||
            definition;


        const id =
            safeString(
                source.id ||
                source.appId ||
                source.key
            ).trim();


        if (!id) {

            throw new Error(
                "App besitzt keine gültige ID."
            );

        }


        return {

            ...source,

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

            icon:
                source.icon ||
                "◈",

            version:
                source.version ||
                VERSION,

            category:
                source.category ||
                "system",

            enabled:
                source.enabled !== false

        };

    }


    /* ========================================================
       07 — REGISTER APP
       ======================================================== */

    function register(
        definition
    ) {

        const app =
            normalizeApp(
                definition
            );


        runtimeApps.set(
            app.id,
            app
        );


        dispatch(
            "haldo:app-runtime:registered",
            {
                app:
                    clone(app)
            }
        );


        emit(
            "app-registered",
            {
                app:
                    clone(app)
            }
        );


        return app;

    }


    function unregister(
        appId
    ) {

        const id =
            safeString(
                appId
            ).trim();

        if (!id) {
            return false;
        }


        if (
            activeInstances.has(id)
        ) {

            warn(
                "App kann nicht entfernt werden, solange eine Runtime-Instanz aktiv ist:",
                id
            );

            return false;

        }


        const existed =
            runtimeApps.delete(
                id
            );


        if (existed) {

            dispatch(
                "haldo:app-runtime:unregistered",
                {
                    appId:
                        id
                }
            );


            emit(
                "app-unregistered",
                {
                    appId:
                        id
                }
            );

        }


        return existed;

    }


    function get(
        appId
    ) {

        const id =
            safeString(
                appId
            ).trim();

        return (
            runtimeApps.get(
                id
            ) ||
            null
        );

    }


    function has(
        appId
    ) {

        return !!get(
            appId
        );

    }


    function getAll() {

        return Array.from(
            runtimeApps.values()
        );

    }


    /* ========================================================
       08 — EVENT BUS
       ======================================================== */

    function on(
        event,
        callback
    ) {

        if (
            !isFunction(
                callback
            )
        ) {

            return () => {};

        }


        const key =
            safeString(
                event
            ).trim();

        if (!key) {

            return () => {};

        }


        if (
            !listeners.has(
                key
            )
        ) {

            listeners.set(
                key,
                new Set()
            );

        }


        const set =
            listeners.get(
                key
            );


        set.add(
            callback
        );


        return () => {

            set.delete(
                callback
            );

            if (!set.size) {

                listeners.delete(
                    key
                );

            }

        };

    }


    function off(
        event,
        callback
    ) {

        const key =
            safeString(
                event
            ).trim();

        const set =
            listeners.get(
                key
            );

        if (!set) {

            return false;

        }


        const removed =
            set.delete(
                callback
            );


        if (!set.size) {

            listeners.delete(
                key
            );

        }


        return removed;

    }


    function emit(
        event,
        detail = {}
    ) {

        const key =
            safeString(
                event
            ).trim();


        const set =
            listeners.get(
                key
            );


        if (set) {

            [
                ...set
            ].forEach(
                callback => {

                    try {

                        callback(
                            detail
                        );

                    } catch (
                        exception
                    ) {

                        error(
                            "Runtime Event Error:",
                            exception
                        );

                    }

                }
            );

        }


        dispatch(
            "haldo:app-runtime:" +
            key,
            detail
        );


        const kernel =
            getKernel();


        if (
            kernel &&
            isFunction(
                kernel.emit
            )
        ) {

            try {

                kernel.emit(
                    "app-runtime:" +
                    key,
                    detail
                );

            } catch (_) {}

        }


        const system =
            getSystem();


        if (
            system &&
            isFunction(
                system.emit
            )
        ) {

            try {

                system.emit(
                    "app-runtime:" +
                    key,
                    detail
                );

            } catch (_) {}

        }


        return true;

    }


    /* ========================================================
       09 — APP STATE FACTORY
       ======================================================== */

    function createDefaultState(
        app
    ) {

        return {

            appId:
                app.id,

            lifecycle:
                "registered",

            status:
                "idle",

            initialized:
                false,

            started:
                false,

            mounted:
                false,

            opened:
                false,

            active:
                false,

            visible:
                false,

            minimized:
                false,

            maximized:
                false,

            pip:
                false,

            suspended:
                false,

            loading:
                false,

            ready:
                false,

            destroyed:
                false,

            error:
                null,

            errorCount:
                0,

            route:
                null,

            windowId:
                null,

            instanceId:
                null,

            createdAt:
                Date.now(),

            updatedAt:
                Date.now()

        };

    }


    function updateState(
        instance,
        changes = {}
    ) {

        if (
            !instance ||
            !isObject(
                changes
            )
        ) {

            return false;

        }


        Object.assign(
            instance.state,
            changes
        );


        instance.state.updatedAt =
            Date.now();


        emit(
            "app-state-changed",
            {
                appId:
                    instance.app.id,

                instanceId:
                    instance.id,

                state:
                    clone(
                        instance.state
                    )
            }
        );


        return true;

    }


    function getState(
        appId
    ) {

        const id =
            safeString(
                appId
            ).trim();

        const instance =
            activeInstances.get(
                id
            );


        if (
            instance
        ) {

            return clone(
                instance.state
            );

        }


        const app =
            get(
                id
            );


        if (!app) {

            return null;

        }


        return createDefaultState(
            app
        );

    }


    /* ========================================================
       10 — INSTANCE CONTEXT
       ======================================================== */

    function createContext(
        app,
        instance
    ) {

        const context = {

            app:
                app,

            appId:
                app.id,

            instanceId:
                instance.id,

            runtime:
                api,

            state:
                instance.state,

            services: {

                kernel:
                    getKernel(),

                system:
                    getSystem(),

                manager:
                    getAppManager(),

                registry:
                    getAppRegistry(),

                router:
                    getRouter(),

                windowManager:
                    getWindowManager(),

                storage:
                    getStorage(),

                ai:
                    getAI(),

                language:
                    getLanguage()

            },

            getState() {

                return clone(
                    instance.state
                );

            },

            setState(
                changes
            ) {

                updateState(
                    instance,
                    changes
                );

                return this.getState();

            },

            getService(
                name
            ) {

                return (
                    this.services[
                        name
                    ] ||
                    null
                );

            },

            emit(
                event,
                detail
            ) {

                return emit(
                    event,
                    {
                        appId:
                            app.id,

                        instanceId:
                            instance.id,

                        ...(
                            detail &&
                            typeof detail ===
                            "object"
                                ? detail
                                : {
                                    value:
                                        detail
                                }
                        )

                    }
                );

            },

            on(
                event,
                callback
            ) {

                return on(
                    event,
                    callback
                );

            }

        };


        return context;

    }


    /* ========================================================
       11 — INSTANCE CREATION
       ======================================================== */

    function createInstance(
        app,
        options = {}
    ) {

        const instanceId =
            options.instanceId ||
            createId(
                "app"
            );


        const instance = {

            id:
                instanceId,

            app:
                app,

            options:
                clone(
                    options
                ),

            state:
                createDefaultState(
                    app
                ),

            context:
                null,

            root:
                null,

            window:
                null,

            cleanup:
                [],

            createdAt:
                Date.now(),

            updatedAt:
                Date.now()

        };


        instance.state.instanceId =
            instance.id;


        instance.context =
            createContext(
                app,
                instance
            );


        return instance;

    }


    /* ========================================================
       12 — INSTANCE LOOKUP
       ======================================================== */

    function getInstance(
        instanceId
    ) {

        const id =
            safeString(
                instanceId
            ).trim();


        for (
            const instance
            of activeInstances.values()
        ) {

            if (
                instance.id ===
                id
            ) {

                return instance;

            }

        }


        return null;

    }


    function getAppInstance(
        appId
    ) {

        return (
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            ) ||
            null
        );

    }


    function getInstances() {

        return Array.from(
            activeInstances.values()
        );

    }


    /* ========================================================
       13 — DEPENDENCY CHECK
       ======================================================== */

    function checkDependencies(
        app
    ) {

        const dependencies =
            Array.isArray(
                app.dependencies
            )
                ? app.dependencies
                : [];


        const missing = [];


        dependencies.forEach(
            dependency => {

                const id =
                    isObject(
                        dependency
                    )
                        ? (
                            dependency.id ||
                            dependency.appId
                        )
                        : dependency;


                if (
                    !id
                ) {

                    return;

                }


                if (
                    !has(
                        id
                    )
                ) {

                    const registry =
                        getAppRegistry();


                    let registryHas =
                        false;


                    if (
                        registry &&
                        isFunction(
                            registry.has
                        )
                    ) {

                        try {

                            registryHas =
                                !!registry.has(
                                    id
                                );

                        } catch (_) {}

                    }


                    if (
                        !registryHas
                    ) {

                        missing.push(
                            id
                        );

                    }

                }

            }
        );


        return {

            valid:
                missing.length === 0,

            missing

        };

    }


    /* ========================================================
       14 — APP PERMISSIONS
       ======================================================== */

    function checkPermissions(
        app,
        options = {}
    ) {

        const required =
            Array.isArray(
                app.permissions
            )
                ? app.permissions
                : [];


        const granted =
            Array.isArray(
                options.permissions
            )
                ? options.permissions
                : (
                    Array.isArray(
                        app.grantedPermissions
                    )
                        ? app.grantedPermissions
                        : []
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

            required:
                clone(
                    required
                ),

            granted:
                clone(
                    granted
                ),

            missing:
                clone(
                    missing
                )

        };

    }


    /* ========================================================
       15 — STORAGE HELPERS
       ======================================================== */

    async function storageGet(
        key,
        fallback = null
    ) {

        const storage =
            getStorage();


        try {

            if (
                storage &&
                isFunction(
                    storage.get
                )
            ) {

                const value =
                    await storage.get(
                        key
                    );


                return (
                    value === undefined
                        ? fallback
                        : value
                );

            }


            if (
                window.localStorage
            ) {

                const raw =
                    window.localStorage.getItem(
                        key
                    );


                if (
                    raw === null
                ) {

                    return fallback;

                }


                try {

                    return JSON.parse(
                        raw
                    );

                } catch (_) {

                    return raw;

                }

            }

        } catch (
            exception
        ) {

            error(
                "Storage GET Error:",
                exception
            );

        }


        return fallback;

    }


    async function storageSet(
        key,
        value
    ) {

        const storage =
            getStorage();


        try {

            if (
                storage &&
                isFunction(
                    storage.set
                )
            ) {

                await storage.set(
                    key,
                    value
                );

                return true;

            }


            if (
                window.localStorage
            ) {

                window.localStorage.setItem(
                    key,
                    JSON.stringify(
                        value
                    )
                );

                return true;

            }

        } catch (
            exception
        ) {

            error(
                "Storage SET Error:",
                exception
            );

        }


        return false;

    }


    async function storageRemove(
        key
    ) {

        const storage =
            getStorage();


        try {

            if (
                storage &&
                isFunction(
                    storage.remove
                )
            ) {

                await storage.remove(
                    key
                );

                return true;

            }


            if (
                window.localStorage
            ) {

                window.localStorage.removeItem(
                    key
                );

                return true;

            }

        } catch (
            exception
        ) {

            error(
                "Storage REMOVE Error:",
                exception
            );

        }


        return false;

    }


    /* ========================================================
       16 — STATE PERSISTENCE
       ======================================================== */

    function getStateStorageKey(
        appId
    ) {

        return (
            "haldo.app.runtime.state." +
            safeString(
                appId
            ).trim()
        );

    }


    async function persistState(
        instance
    ) {

        if (
            !instance ||
            !instance.app
        ) {

            return false;

        }


        try {

            const serialized =
                JSON.stringify(
                    instance.state
                );


            if (
                serialized.length >
                MAX_STATE_SIZE
            ) {

                warn(
                    "App State überschreitet das Runtime-Limit:",
                    instance.app.id
                );

                return false;

            }


            return storageSet(
                getStateStorageKey(
                    instance.app.id
                ),
                instance.state
            );

        } catch (
            exception
        ) {

            error(
                "State Persistence Error:",
                exception
            );

            return false;

        }

    }


    async function restoreState(
        instance
    ) {

        if (
            !instance ||
            !instance.app
        ) {

            return false;

        }


        try {

            const saved =
                await storageGet(
                    getStateStorageKey(
                        instance.app.id
                    ),
                    null
                );


            if (
                !saved ||
                !isObject(
                    saved
                )
            ) {

                return false;

            }


            const preserved =
                {
                    lifecycle:
                        instance.state.lifecycle,

                    instanceId:
                        instance.state.instanceId,

                    createdAt:
                        instance.state.createdAt

                };


            Object.assign(
                instance.state,
                saved,
                preserved,
                {
                    updatedAt:
                        Date.now()
                }
            );


            return true;

        } catch (
            exception
        ) {

            error(
                "State Restore Error:",
                exception
            );

            return false;

        }

    }


    /* ========================================================
       17 — ROOT RESOLUTION
       ======================================================== */

    function resolveRoot(
        app,
        options = {}
    ) {

        if (
            options.root &&
            options.root.nodeType
        ) {

            return options.root;

        }


        if (
            options.container &&
            options.container.nodeType
        ) {

            return options.container;

        }


        if (
            typeof options.container ===
            "string"
        ) {

            const element =
                document.querySelector(
                    options.container
                );


            if (
                element
            ) {

                return element;

            }

        }


        if (
            typeof app.rootSelector ===
            "string"
        ) {

            const element =
                document.querySelector(
                    app.rootSelector
                );


            if (
                element
            ) {

                return element;

            }

        }


        if (
            typeof app.container ===
            "string"
        ) {

            const element =
                document.querySelector(
                    app.container
                );


            if (
                element
            ) {

                return element;

            }

        }


        return null;

    }
        18 — ROOT RESOLUTION — CONTINUED
       ======================================================== */

        if (
            typeof app.rootSelector ===
            "string"
        ) {

            const element =
                document.querySelector(
                    app.rootSelector
                );

            if (element) {
                return element;
            }

        }


        if (
            app.root &&
            app.root.nodeType
        ) {

            return app.root;

        }


        if (
            typeof app.root ===
            "string"
        ) {

            const element =
                document.querySelector(
                    app.root
                );

            if (element) {
                return element;
            }

        }


        /*
         * Eine App darf ihren eigenen
         * Root-Container erzeugen.
         */

        const root =
            document.createElement(
                "div"
            );

        root.className =
            "haldo-app-runtime-root";

        root.dataset.haldoApp =
            app.id;

        root.dataset.haldoRuntime =
            RUNTIME_ID;

        return root;

    }


    /* ========================================================
       19 — MOUNT TARGET
       ======================================================== */

    function resolveMountTarget(
        app,
        root,
        options = {}
    ) {

        if (
            options.mountTarget &&
            options.mountTarget.nodeType
        ) {

            return options.mountTarget;

        }


        if (
            options.mount &&
            options.mount.nodeType
        ) {

            return options.mount;

        }


        if (
            typeof options.mount ===
            "string"
        ) {

            const element =
                document.querySelector(
                    options.mount
                );

            if (element) {
                return element;
            }

        }


        if (
            typeof app.mountTarget ===
            "string"
        ) {

            const element =
                document.querySelector(
                    app.mountTarget
                );

            if (element) {
                return element;
            }

        }


        if (
            root &&
            root.parentNode
        ) {

            return root.parentNode;

        }


        return (
            document.getElementById(
                "haldo-display"
            ) ||
            document.querySelector(
                "[data-haldo-display]"
            ) ||
            document.body
        );

    }


    /* ========================================================
       20 — INSTANCE ERROR
       ======================================================== */

    function setInstanceError(
        instance,
        exception,
        lifecycle = "error"
    ) {

        if (!instance) {
            return;
        }


        const message =
            exception instanceof Error
                ? exception.message
                : safeString(
                    exception
                );


        updateState(
            instance,
            {
                lifecycle,

                status:
                    "error",

                error:
                    message,

                errorCount:
                    (
                        Number(
                            instance.state
                                .errorCount
                        ) || 0
                    ) + 1,

                loading:
                    false,

                ready:
                    false,

                updatedAt:
                    Date.now()
            }
        );


        emit(
            "app-error",
            {
                appId:
                    instance.app.id,

                instanceId:
                    instance.id,

                error:
                    message,

                exception
            }
        );


        dispatch(
            "haldo:app-runtime:error",
            {
                appId:
                    instance.app.id,

                instanceId:
                    instance.id,

                error:
                    message
            }
        );

    }


    /* ========================================================
       21 — CLEANUP REGISTRATION
       ======================================================== */

    function addCleanup(
        instance,
        cleanup
    ) {

        if (
            !instance ||
            !isFunction(
                cleanup
            )
        ) {

            return false;

        }


        instance.cleanup.push(
            cleanup
        );

        return true;

    }


    async function runCleanup(
        instance
    ) {

        if (!instance) {
            return;
        }


        const cleanup =
            [
                ...instance.cleanup
            ].reverse();


        instance.cleanup.length =
            0;


        for (
            const callback of cleanup
        ) {

            try {

                await callback();

            } catch (
                exception
            ) {

                error(
                    "App Cleanup Error:",
                    exception
                );

            }

        }

    }


    /* ========================================================
       22 — APP HOOK EXECUTION
       ======================================================== */

    async function callHook(
        instance,
        hook,
        payload = {}
    ) {

        if (!instance) {
            return undefined;
        }


        const app =
            instance.app;


        const target =
            (
                app &&
                isFunction(
                    app[hook]
                )
            )
                ? app[hook]
                : null;


        if (!target) {
            return undefined;
        }


        return target.call(
            app,
            {
                ...payload,

                app,

                appId:
                    app.id,

                instance,

                instanceId:
                    instance.id,

                runtime:
                    api,

                context:
                    instance.context,

                state:
                    instance.state

            }
        );

    }


    /* ========================================================
       23 — INITIALIZE INSTANCE
       ======================================================== */

    async function initializeInstance(
        instance
    ) {

        if (!instance) {
            return false;
        }


        if (
            instance.state.initialized
        ) {

            return true;

        }


        updateState(
            instance,
            {
                lifecycle:
                    "initializing",

                status:
                    "initializing",

                loading:
                    true,

                error:
                    null
            }
        );


        try {

            const dependencyResult =
                checkDependencies(
                    instance.app
                );


            if (
                !dependencyResult.valid
            ) {

                throw new Error(
                    "Fehlende App-Abhängigkeiten: " +
                    dependencyResult.missing.join(
                        ", "
                    )
                );

            }


            const permissionResult =
                checkPermissions(
                    instance.app,
                    instance.options
                );


            if (
                !permissionResult.valid &&
                instance.options
                    .ignorePermissions !==
                    true
            ) {

                throw new Error(
                    "Fehlende App-Berechtigungen: " +
                    permissionResult.missing.join(
                        ", "
                    )
                );

            }


            await restoreState(
                instance
            );


            const result =
                await callHook(
                    instance,
                    "initialize",
                    {
                        options:
                            instance.options
                    }
                );


            if (
                result &&
                isObject(result)
            ) {

                Object.assign(
                    instance.state,
                    result
                );

            }


            updateState(
                instance,
                {
                    lifecycle:
                        "initialized",

                    status:
                        "initialized",

                    initialized:
                        true,

                    loading:
                        false,

                    ready:
                        true,

                    error:
                        null
                }
            );


            emit(
                "app-initialized",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id,

                    state:
                        clone(
                            instance.state
                        )
                }
            );


            await persistState(
                instance
            );


            return true;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "initialization-error"
            );

            return false;

        }

    }


    /* ========================================================
       24 — CREATE / GET INSTANCE
       ======================================================== */

    async function create(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            throw new Error(
                "Runtime-App nicht registriert: " +
                safeString(
                    appId
                )
            );

        }


        if (
            app.enabled ===
            false
        ) {

            throw new Error(
                "App ist deaktiviert: " +
                app.id
            );

        }


        /*
         * Singleton Apps verwenden dieselbe
         * Runtime-Instanz.
         */

        const singleton =
            app.singleton === true ||
            app.singleInstance === true ||
            options.singleton === true;


        if (
            singleton &&
            activeInstances.has(
                app.id
            )
        ) {

            const existing =
                activeInstances.get(
                    app.id
                );


            if (
                options.reuse !== false
            ) {

                return existing;

            }


            throw new Error(
                "Singleton-App ist bereits aktiv: " +
                app.id
            );

        }


        const instance =
            createInstance(
                app,
                options
            );


        activeInstances.set(
            app.id,
            instance
        );


        emit(
            "app-instance-created",
            {
                appId:
                    app.id,

                instanceId:
                    instance.id
            }
        );


        return instance;

    }


    /* ========================================================
       25 — MOUNT INSTANCE
       ======================================================== */

    async function mount(
        appId,
        options = {}
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            ) ||
            await create(
                appId,
                options
            );


        if (
            instance.state.mounted
        ) {

            return instance;

        }


        updateState(
            instance,
            {
                lifecycle:
                    "mounting",

                status:
                    "mounting",

                loading:
                    true
            }
        );


        try {

            const root =
                resolveRoot(
                    instance.app,
                    options
                );


            const target =
                resolveMountTarget(
                    instance.app,
                    root,
                    options
                );


            instance.root =
                root;


            instance.mountTarget =
                target;


            if (
                root &&
                root.parentNode !==
                target
            ) {

                target.appendChild(
                    root
                );

            }


            root.dataset.haldoApp =
                instance.app.id;

            root.dataset.haldoInstance =
                instance.id;

            root.dataset.haldoRuntime =
                RUNTIME_ID;


            const result =
                await callHook(
                    instance,
                    "mount",
                    {
                        root,

                        mountTarget:
                            target,

                        options:
                            instance.options
                    }
                );


            /*
             * Apps können optional direkt
             * ein HTMLElement zurückgeben.
             */

            if (
                result &&
                result.nodeType &&
                result !== root
            ) {

                root.appendChild(
                    result
                );

            }


            updateState(
                instance,
                {
                    lifecycle:
                        "mounted",

                    status:
                        "mounted",

                    mounted:
                        true,

                    visible:
                        true,

                    loading:
                        false,

                    ready:
                        true
                }
            );


            await persistState(
                instance
            );


            emit(
                "app-mounted",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id,

                    root
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "mount-error"
            );


            return null;

        }

    }


    /* ========================================================
       26 — START INSTANCE
       ======================================================== */

    async function start(
        appId,
        options = {}
    ) {

        let instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {

            instance =
                await create(
                    appId,
                    options
                );

        }


        const initialized =
            await initializeInstance(
                instance
            );


        if (!initialized) {
            return null;
        }


        if (
            !instance.state.mounted
        ) {

            const mounted =
                await mount(
                    instance.app.id,
                    options
                );


            if (!mounted) {
                return null;
            }

        }


        if (
            instance.state.started
        ) {

            return instance;

        }


        updateState(
            instance,
            {
                lifecycle:
                    "starting",

                status:
                    "starting",

                loading:
                    true
            }
        );


        try {

            await callHook(
                instance,
                "start",
                {
                    options:
                        instance.options
                }
            );


            instance.state.started =
                true;


            updateState(
                instance,
                {
                    lifecycle:
                        "started",

                    status:
                        "started",

                    started:
                        true,

                    loading:
                        false,

                    ready:
                        true
                }
            );


            await persistState(
                instance
            );


            emit(
                "app-started",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "start-error"
            );


            return null;

        }

    }


    /* ========================================================
       27 — OPEN INSTANCE
       ======================================================== */

    async function open(
        appId,
        options = {}
    ) {

        const instance =
            await start(
                appId,
                options
            );


        if (!instance) {
            return null;
        }


        const wm =
            getWindowManager();


        let windowResult =
            null;


        try {

            if (
                wm &&
                isFunction(
                    wm.open
                )
            ) {

                windowResult =
                    await wm.open(
                        instance.app.id,
                        {
                            ...options,

                            app:
                                instance.app,

                            instance,

                            context:
                                instance.context
                        }
                    );

            } else if (
                wm &&
                isFunction(
                    wm.openWindow
                )
            ) {

                windowResult =
                    await wm.openWindow(
                        instance.app.id,
                        {
                            ...options,

                            app:
                                instance.app,

                            instance,

                            context:
                                instance.context
                        }
                    );

            }


            instance.window =
                windowResult;


            if (
                typeof windowResult ===
                "string"
            ) {

                instance.state.windowId =
                    windowResult;

            } else if (
                windowResult &&
                isObject(
                    windowResult
                )
            ) {

                instance.state.windowId =
                    windowResult.id ||
                    windowResult.windowId ||
                    null;

            }


            await callHook(
                instance,
                "open",
                {
                    options:
                        options,

                    window:
                        windowResult
                }
            );


            updateState(
                instance,
                {
                    lifecycle:
                        "open",

                    status:
                        "open",

                    opened:
                        true,

                    visible:
                        true,

                    minimized:
                        false,

                    suspended:
                        false
                }
            );


            await persistState(
                instance
            );


            emit(
                "app-opened",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id,

                    window:
                        windowResult
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "open-error"
            );


            return null;

        }

    }
    /* ========================================================
       28 — ACTIVATE INSTANCE
       ======================================================== */

    async function activate(
        appId
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {

            return null;

        }


        try {

            await callHook(
                instance,
                "activate"
            );


            updateState(
                instance,
                {
                    lifecycle:
                        "active",

                    status:
                        "active",

                    active:
                        true,

                    visible:
                        true,

                    suspended:
                        false,

                    minimized:
                        false
                }
            );


            activeAppId =
                instance.app.id;


            await persistState(
                instance
            );


            emit(
                "app-activated",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "activate-error"
            );


            return null;

        }

    }


    /* ========================================================
       29 — DEACTIVATE INSTANCE
       ======================================================== */

    async function deactivate(
        appId
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            await callHook(
                instance,
                "deactivate"
            );


            updateState(
                instance,
                {
                    lifecycle:
                        "inactive",

                    status:
                        "inactive",

                    active:
                        false
                }
            );


            if (
                activeAppId ===
                instance.app.id
            ) {

                activeAppId =
                    null;

            }


            await persistState(
                instance
            );


            emit(
                "app-deactivated",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "deactivate-error"
            );


            return null;

        }

    }


    /* ========================================================
       30 — FOCUS INSTANCE
       ======================================================== */

    async function focus(
        appId
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            const wm =
                getWindowManager();


            if (
                wm &&
                isFunction(
                    wm.focus
                )
            ) {

                await wm.focus(
                    instance.state.windowId ||
                    instance.window
                );

            } else if (
                wm &&
                isFunction(
                    wm.focusWindow
                )
            ) {

                await wm.focusWindow(
                    instance.state.windowId ||
                    instance.window
                );

            }


            await callHook(
                instance,
                "focus"
            );


            activeAppId =
                instance.app.id;


            updateState(
                instance,
                {
                    active:
                        true,

                    visible:
                        true,

                    minimized:
                        false,

                    suspended:
                        false,

                    status:
                        "active",

                    lifecycle:
                        "active"
                }
            );


            emit(
                "app-focused",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id,

                    windowId:
                        instance.state.windowId
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "focus-error"
            );


            return null;

        }

    }


    /* ========================================================
       31 — BLUR INSTANCE
       ======================================================== */

    async function blur(
        appId
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            const wm =
                getWindowManager();


            if (
                wm &&
                isFunction(
                    wm.blur
                )
            ) {

                await wm.blur(
                    instance.state.windowId ||
                    instance.window
                );

            } else if (
                wm &&
                isFunction(
                    wm.blurWindow
                )
            ) {

                await wm.blurWindow(
                    instance.state.windowId ||
                    instance.window
                );

            }


            await callHook(
                instance,
                "blur"
            );


            updateState(
                instance,
                {
                    active:
                        false,

                    status:
                        "inactive",

                    lifecycle:
                        "inactive"
                }
            );


            if (
                activeAppId ===
                instance.app.id
            ) {

                activeAppId =
                    null;

            }


            emit(
                "app-blurred",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "blur-error"
            );


            return null;

        }

    }


    /* ========================================================
       32 — MINIMIZE INSTANCE
       ======================================================== */

    async function minimize(
        appId
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            const wm =
                getWindowManager();


            if (
                wm &&
                isFunction(
                    wm.minimize
                )
            ) {

                await wm.minimize(
                    instance.state.windowId ||
                    instance.window
                );

            } else if (
                wm &&
                isFunction(
                    wm.minimizeWindow
                )
            ) {

                await wm.minimizeWindow(
                    instance.state.windowId ||
                    instance.window
                );

            }


            await callHook(
                instance,
                "minimize"
            );


            updateState(
                instance,
                {
                    lifecycle:
                        "minimized",

                    status:
                        "minimized",

                    minimized:
                        true,

                    active:
                        false,

                    visible:
                        false
                }
            );


            if (
                activeAppId ===
                instance.app.id
            ) {

                activeAppId =
                    null;

            }


            await persistState(
                instance
            );


            emit(
                "app-minimized",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id,

                    windowId:
                        instance.state.windowId
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "minimize-error"
            );


            return null;

        }

    }


    /* ========================================================
       33 — RESTORE INSTANCE
       ======================================================== */

    async function restore(
        appId
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            const wm =
                getWindowManager();


            if (
                wm &&
                isFunction(
                    wm.restore
                )
            ) {

                await wm.restore(
                    instance.state.windowId ||
                    instance.window
                );

            } else if (
                wm &&
                isFunction(
                    wm.restoreWindow
                )
            ) {

                await wm.restoreWindow(
                    instance.state.windowId ||
                    instance.window
                );

            }


            await callHook(
                instance,
                "restore"
            );


            updateState(
                instance,
                {
                    lifecycle:
                        "restored",

                    status:
                        "restored",

                    minimized:
                        false,

                    suspended:
                        false,

                    visible:
                        true
                }
            );


            await persistState(
                instance
            );


            emit(
                "app-restored",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "restore-error"
            );


            return null;

        }

    }


    /* ========================================================
       34 — MAXIMIZE INSTANCE
       ======================================================== */

    async function maximize(
        appId
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            const wm =
                getWindowManager();


            if (
                wm &&
                isFunction(
                    wm.maximize
                )
            ) {

                await wm.maximize(
                    instance.state.windowId ||
                    instance.window
                );

            } else if (
                wm &&
                isFunction(
                    wm.maximizeWindow
                )
            ) {

                await wm.maximizeWindow(
                    instance.state.windowId ||
                    instance.window
                );

            }


            await callHook(
                instance,
                "maximize"
            );


            updateState(
                instance,
                {
                    lifecycle:
                        "maximized",

                    status:
                        "maximized",

                    maximized:
                        true,

                    minimized:
                        false,

                    visible:
                        true
                }
            );


            await persistState(
                instance
            );


            emit(
                "app-maximized",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id,

                    windowId:
                        instance.state.windowId
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "maximize-error"
            );


            return null;

        }

    }


    /* ========================================================
       35 — UNMAXIMIZE INSTANCE
       ======================================================== */

    async function unmaximize(
        appId
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            const wm =
                getWindowManager();


            if (
                wm &&
                isFunction(
                    wm.unmaximize
                )
            ) {

                await wm.unmaximize(
                    instance.state.windowId ||
                    instance.window
                );

            } else if (
                wm &&
                isFunction(
                    wm.restoreWindow
                )
            ) {

                await wm.restoreWindow(
                    instance.state.windowId ||
                    instance.window
                );

            }


            await callHook(
                instance,
                "unmaximize"
            );


            updateState(
                instance,
                {
                    lifecycle:
                        "restored",

                    status:
                        "restored",

                    maximized:
                        false
                }
            );


            await persistState(
                instance
            );


            emit(
                "app-unmaximized",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "unmaximize-error"
            );


            return null;

        }

    }


    /* ========================================================
       36 — HIDE INSTANCE
       ======================================================== */

    async function hide(
        appId
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            if (
                instance.root
            ) {

                instance.root.style.display =
                    "none";

            }


            await callHook(
                instance,
                "hide"
            );


            updateState(
                instance,
                {
                    visible:
                        false,

                    active:
                        false,

                    status:
                        "hidden",

                    lifecycle:
                        "hidden"
                }
            );


            if (
                activeAppId ===
                instance.app.id
            ) {

                activeAppId =
                    null;

            }


            emit(
                "app-hidden",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "hide-error"
            );


            return null;

        }

    }


    /* ========================================================
       37 — SHOW INSTANCE
       ======================================================== */

    async function show(
        appId
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            if (
                instance.root
            ) {

                instance.root.style.display =
                    "";

            }


            await callHook(
                instance,
                "show"
            );


            updateState(
                instance,
                {
                    visible:
                        true,

                    status:
                        "visible",

                    lifecycle:
                        "visible"
                }
            );


            emit(
                "app-shown",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "show-error"
            );


            return null;

        }

    }


    /* ========================================================
       38 — SUSPEND INSTANCE
       ======================================================== */

    async function suspend(
        appId
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            await callHook(
                instance,
                "suspend"
            );


            updateState(
                instance,
                {
                    lifecycle:
                        "suspended",

                    status:
                        "suspended",

                    suspended:
                        true,

                    active:
                        false
                }
            );


            if (
                activeAppId ===
                instance.app.id
            ) {

                activeAppId =
                    null;

            }


            await persistState(
                instance
            );


            emit(
                "app-suspended",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "suspend-error"
            );


            return null;

        }

    }


    /* ========================================================
       39 — RESUME INSTANCE
       ======================================================== */

    async function resume(
        appId
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            await callHook(
                instance,
                "resume"
            );


            updateState(
                instance,
                {
                    lifecycle:
                        "resumed",

                    status:
                        "resumed",

                    suspended:
                        false,

                    visible:
                        true
                }
            );


            await persistState(
                instance
            );


            emit(
                "app-resumed",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "resume-error"
            );


            return null;

        }

    }
    /* ========================================================
       40 — RESIZE INSTANCE
       ======================================================== */

    async function resize(
        appId,
        width,
        height
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        const normalizedWidth =
            Number(width);

        const normalizedHeight =
            Number(height);


        if (
            !Number.isFinite(
                normalizedWidth
            ) ||
            !Number.isFinite(
                normalizedHeight
            ) ||
            normalizedWidth <= 0 ||
            normalizedHeight <= 0
        ) {

            throw new Error(
                "Ungültige Fenstergröße."
            );

        }


        try {

            const wm =
                getWindowManager();


            if (
                wm &&
                isFunction(
                    wm.resize
                )
            ) {

                await wm.resize(
                    instance.state.windowId ||
                    instance.window,
                    normalizedWidth,
                    normalizedHeight
                );

            } else if (
                wm &&
                isFunction(
                    wm.resizeWindow
                )
            ) {

                await wm.resizeWindow(
                    instance.state.windowId ||
                    instance.window,
                    normalizedWidth,
                    normalizedHeight
                );

            }


            await callHook(
                instance,
                "resize",
                {
                    width:
                        normalizedWidth,

                    height:
                        normalizedHeight
                }
            );


            instance.state.width =
                normalizedWidth;

            instance.state.height =
                normalizedHeight;

            instance.state.updatedAt =
                Date.now();


            await persistState(
                instance
            );


            emit(
                "app-resized",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id,

                    width:
                        normalizedWidth,

                    height:
                        normalizedHeight
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "resize-error"
            );


            return null;

        }

    }


    /* ========================================================
       41 — MOVE INSTANCE
       ======================================================== */

    async function move(
        appId,
        x,
        y
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        const normalizedX =
            Number(x);

        const normalizedY =
            Number(y);


        if (
            !Number.isFinite(
                normalizedX
            ) ||
            !Number.isFinite(
                normalizedY
            )
        ) {

            throw new Error(
                "Ungültige Fensterposition."
            );

        }


        try {

            const wm =
                getWindowManager();


            if (
                wm &&
                isFunction(
                    wm.move
                )
            ) {

                await wm.move(
                    instance.state.windowId ||
                    instance.window,
                    normalizedX,
                    normalizedY
                );

            } else if (
                wm &&
                isFunction(
                    wm.moveWindow
                )
            ) {

                await wm.moveWindow(
                    instance.state.windowId ||
                    instance.window,
                    normalizedX,
                    normalizedY
                );

            }


            await callHook(
                instance,
                "move",
                {
                    x:
                        normalizedX,

                    y:
                        normalizedY
                }
            );


            instance.state.x =
                normalizedX;

            instance.state.y =
                normalizedY;

            instance.state.updatedAt =
                Date.now();


            await persistState(
                instance
            );


            emit(
                "app-moved",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id,

                    x:
                        normalizedX,

                    y:
                        normalizedY
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "move-error"
            );


            return null;

        }

    }


    /* ========================================================
       42 — ROUTER NAVIGATION
       ======================================================== */

    async function navigate(
        appId,
        route,
        options = {}
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        const normalizedRoute =
            safeString(
                route
            ).trim();


        if (!normalizedRoute) {

            throw new Error(
                "Keine gültige App-Route."
            );

        }


        try {

            const router =
                getRouter();


            let result =
                null;


            if (
                router &&
                isFunction(
                    router.navigate
                )
            ) {

                result =
                    await router.navigate(
                        normalizedRoute,
                        {
                            ...options,

                            appId:
                                instance.app.id,

                            instanceId:
                                instance.id
                        }
                    );

            } else if (
                router &&
                isFunction(
                    router.go
                )
            ) {

                result =
                    await router.go(
                        normalizedRoute,
                        options
                    );

            } else {

                /*
                 * Fallback:
                 * Der Runtime-State kennt die Route,
                 * auch wenn der Router gerade noch nicht
                 * verfügbar ist.
                 */

                result =
                    normalizedRoute;

            }


            updateState(
                instance,
                {
                    route:
                        normalizedRoute
                }
            );


            await callHook(
                instance,
                "navigate",
                {
                    route:
                        normalizedRoute,

                    result,

                    options
                }
            );


            await persistState(
                instance
            );


            emit(
                "app-navigated",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id,

                    route:
                        normalizedRoute,

                    result
                }
            );


            return result;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "navigation-error"
            );


            return null;

        }

    }


    /* ========================================================
       43 — BACK
       ======================================================== */

    async function back(
        appId,
        options = {}
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            const router =
                getRouter();


            let result =
                null;


            if (
                router &&
                isFunction(
                    router.back
                )
            ) {

                result =
                    await router.back(
                        options
                    );

            } else if (
                router &&
                isFunction(
                    router.goBack
                )
            ) {

                result =
                    await router.goBack(
                        options
                    );

            } else {

                return null;

            }


            await callHook(
                instance,
                "back",
                {
                    result,

                    options
                }
            );


            emit(
                "app-navigation-back",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id,

                    result
                }
            );


            return result;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "navigation-back-error"
            );


            return null;

        }

    }


    /* ========================================================
       44 — FORWARD
       ======================================================== */

    async function forward(
        appId,
        options = {}
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            const router =
                getRouter();


            let result =
                null;


            if (
                router &&
                isFunction(
                    router.forward
                )
            ) {

                result =
                    await router.forward(
                        options
                    );

            } else if (
                router &&
                isFunction(
                    router.goForward
                )
            ) {

                result =
                    await router.goForward(
                        options
                    );

            } else {

                return null;

            }


            await callHook(
                instance,
                "forward",
                {
                    result,

                    options
                }
            );


            emit(
                "app-navigation-forward",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id,

                    result
                }
            );


            return result;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "navigation-forward-error"
            );


            return null;

        }

    }


    /* ========================================================
       45 — RELOAD INSTANCE
       ======================================================== */

    async function reload(
        appId,
        options = {}
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            await callHook(
                instance,
                "beforeReload",
                {
                    options
                }
            );


            updateState(
                instance,
                {
                    lifecycle:
                        "reloading",

                    status:
                        "reloading",

                    loading:
                        true
                }
            );


            await callHook(
                instance,
                "reload",
                {
                    options
                }
            );


            await callHook(
                instance,
                "afterReload",
                {
                    options
                }
            );


            updateState(
                instance,
                {
                    lifecycle:
                        "started",

                    status:
                        "started",

                    loading:
                        false,

                    ready:
                        true,

                    error:
                        null
                }
            );


            await persistState(
                instance
            );


            emit(
                "app-reloaded",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "reload-error"
            );


            return null;

        }

    }


    /* ========================================================
       46 — APP MESSAGE
       ======================================================== */

    async function message(
        appId,
        messageData
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            const result =
                await callHook(
                    instance,
                    "message",
                    {
                        message:
                            messageData
                    }
                );


            emit(
                "app-message",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id,

                    message:
                        clone(
                            messageData
                        ),

                    result
                }
            );


            return result;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "message-error"
            );


            return null;

        }

    }


    /* ========================================================
       47 — UPDATE OPTIONS
       ======================================================== */

    async function updateOptions(
        appId,
        changes = {}
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (
            !instance ||
            !isObject(
                changes
            )
        ) {

            return null;

        }


        try {

            Object.assign(
                instance.options,
                clone(
                    changes
                )
            );


            await callHook(
                instance,
                "optionsChanged",
                {
                    options:
                        instance.options,

                    changes
                }
            );


            instance.updatedAt =
                Date.now();


            emit(
                "app-options-changed",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id,

                    options:
                        clone(
                            instance.options
                        ),

                    changes:
                        clone(
                            changes
                        )
                }
            );


            return instance.options;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "options-error"
            );


            return null;

        }

    }


    /* ========================================================
       48 — CLOSE INSTANCE
       ======================================================== */

    async function close(
        appId,
        options = {}
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return null;
        }


        try {

            await callHook(
                instance,
                "beforeClose",
                {
                    options
                }
            );


            const wm =
                getWindowManager();


            if (
                wm &&
                isFunction(
                    wm.close
                )
            ) {

                await wm.close(
                    instance.state.windowId ||
                    instance.window
                );

            } else if (
                wm &&
                isFunction(
                    wm.closeWindow
                )
            ) {

                await wm.closeWindow(
                    instance.state.windowId ||
                    instance.window
                );

            }


            await callHook(
                instance,
                "close",
                {
                    options
                }
            );


            updateState(
                instance,
                {
                    lifecycle:
                        "closed",

                    status:
                        "closed",

                    opened:
                        false,

                    visible:
                        false,

                    active:
                        false
                }
            );


            if (
                activeAppId ===
                instance.app.id
            ) {

                activeAppId =
                    null;

            }


            await persistState(
                instance
            );


            emit(
                "app-closed",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id
                }
            );


            return instance;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "close-error"
            );


            return null;

        }

    }
HalDo AI OS — /js/app-runtime.js

KOMPLETT ERSETZEN — TEIL 5 / 7

    /* ========================================================
       49 — STOP INSTANCE
       ======================================================== */
    async function stop(
        appId,
        options = {}
    ) {
        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );
        if (!instance) {
            return null;
        }
        try {
            await callHook(
                instance,
                "beforeStop",
                {
                    options
                }
            );
            await callHook(
                instance,
                "stop",
                {
                    options
                }
            );
            updateState(
                instance,
                {
                    lifecycle:
                        "stopping",
                    status:
                        "stopping",
                    loading:
                        true
                }
            );
            await runCleanup(
                instance
            );
            updateState(
                instance,
                {
                    lifecycle:
                        "stopped",
                    status:
                        "stopped",
                    started:
                        false,
                    opened:
                        false,
                    active:
                        false,
                    visible:
                        false,
                    loading:
                        false,
                    ready:
                        false
                }
            );
            await persistState(
                instance
            );
            emit(
                "app-stopped",
                {
                    appId:
                        instance.app.id,
                    instanceId:
                        instance.id
                }
            );
            return instance;
        } catch (
            exception
        ) {
            setInstanceError(
                instance,
                exception,
                "stop-error"
            );
            return null;
        }
    }
    /* ========================================================
       50 — UNMOUNT INSTANCE
       ======================================================== */
    async function unmount(
        appId,
        options = {}
    ) {
        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );
        if (!instance) {
            return null;
        }
        try {
            await callHook(
                instance,
                "beforeUnmount",
                {
                    options
                }
            );
            await callHook(
                instance,
                "unmount",
                {
                    options
                }
            );
            await runCleanup(
                instance
            );
            if (
                instance.root &&
                instance.root.parentNode
            ) {
                instance.root.parentNode.removeChild(
                    instance.root
                );
            }
            instance.root =
                null;
            updateState(
                instance,
                {
                    lifecycle:
                        "unmounted",
                    status:
                        "unmounted",
                    mounted:
                        false,
                    visible:
                        false,
                    active:
                        false,
                    opened:
                        false
                }
            );
            if (
                activeAppId ===
                instance.app.id
            ) {
                activeAppId =
                    null;
            }
            await persistState(
                instance
            );
            emit(
                "app-unmounted",
                {
                    appId:
                        instance.app.id,
                    instanceId:
                        instance.id
                }
            );
            return instance;
        } catch (
            exception
        ) {
            setInstanceError(
                instance,
                exception,
                "unmount-error"
            );
            return null;
        }
    }
    /* ========================================================
       51 — DESTROY INSTANCE
       ======================================================== */
    async function destroy(
        appId,
        options = {}
    ) {
        const id =
            safeString(
                appId
            ).trim();
        const instance =
            activeInstances.get(
                id
            );
        if (!instance) {
            return false;
        }
        try {
            await callHook(
                instance,
                "beforeDestroy",
                {
                    options
                }
            );
            if (
                instance.state.started
            ) {
                await stop(
                    id,
                    options
                );
            }
            if (
                instance.state.mounted
            ) {
                await unmount(
                    id,
                    options
                );
            }
            await callHook(
                instance,
                "destroy",
                {
                    options
                }
            );
            await runCleanup(
                instance
            );
            updateState(
                instance,
                {
                    lifecycle:
                        "destroyed",
                    status:
                        "destroyed",
                    initialized:
                        false,
                    started:
                        false,
                    mounted:
                        false,
                    opened:
                        false,
                    active:
                        false,
                    visible:
                        false,
                    ready:
                        false,
                    destroyed:
                        true
                }
            );
            await persistState(
                instance
            );
            activeInstances.delete(
                id
            );
            if (
                activeAppId ===
                id
            ) {
                activeAppId =
                    null;
            }
            emit(
                "app-destroyed",
                {
                    appId:
                        id,
                    instanceId:
                        instance.id
                }
            );
            return true;
        } catch (
            exception
        ) {
            setInstanceError(
                instance,
                exception,
                "destroy-error"
            );
            return false;
        }
    }
    /* ========================================================
       52 — RESTART INSTANCE
       ======================================================== */
    async function restart(
        appId,
        options = {}
    ) {
        const id =
            safeString(
                appId
            ).trim();
        let instance =
            activeInstances.get(
                id
            );
        if (
            instance
        ) {
            await destroy(
                id,
                {
                    ...options,
                    preserveState:
                        options.preserveState !== false
                }
            );
        }
        instance =
            await create(
                id,
                options
            );
        return start(
            id,
            options
        );
    }
    /* ========================================================
       53 — EXECUTE APP ACTION
       ======================================================== */
    async function execute(
        appId,
        action,
        payload = {}
    ) {
        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );
        if (!instance) {
            throw new Error(
                "Keine aktive Runtime-Instanz für App: " +
                safeString(
                    appId
                )
            );
        }
        const actionName =
            safeString(
                action
            ).trim();
        if (!actionName) {
            throw new Error(
                "Keine App-Aktion angegeben."
            );
        }
        try {
            /*
             * Bevorzugter App-Contract:
             *
             * app.actions[action](payload, context)
             */
            if (
                instance.app.actions &&
                isFunction(
                    instance.app.actions[
                        actionName
                    ]
                )
            ) {
                const result =
                    await instance.app.actions[
                        actionName
                    ].call(
                        instance.app,
                        payload,
                        instance.context
                    );
                emit(
                    "app-action-executed",
                    {
                        appId:
                            instance.app.id,
                        instanceId:
                            instance.id,
                        action:
                            actionName,
                        payload:
                            clone(
                                payload
                            ),
                        result
                    }
                );
                return result;
            }
            /*
             * Zweiter Contract:
             * app[actionName](...)
             */
            if (
                isFunction(
                    instance.app[
                        actionName
                    ]
                )
            ) {
                const result =
                    await instance.app[
                        actionName
                    ].call(
                        instance.app,
                        {
                            payload,
                            context:
                                instance.context,
                            runtime:
                                api,
                            instance
                        }
                    );
                emit(
                    "app-action-executed",
                    {
                        appId:
                            instance.app.id,
                        instanceId:
                            instance.id,
                        action:
                            actionName,
                        payload:
                            clone(
                                payload
                            ),
                        result
                    }
                );
                return result;
            }
            throw new Error(
                "Unbekannte App-Aktion: " +
                actionName
            );
        } catch (
            exception
        ) {
            setInstanceError(
                instance,
                exception,
                "action-error"
            );
            throw exception;
        }
    }
    /* ========================================================
       54 — APP EVENT LISTENER
       ======================================================== */
    function onApp(
        appId,
        event,
        callback
    ) {
        const id =
            safeString(
                appId
            ).trim();
        const eventName =
            safeString(
                event
            ).trim();
        if (
            !id ||
            !eventName ||
            !isFunction(
                callback
            )
        ) {
            return () => {};
        }
        return on(
            "app:" +
            id +
            ":" +
            eventName,
            callback
        );
    }
    function emitApp(
        appId,
        event,
        detail = {}
    ) {
        const id =
            safeString(
                appId
            ).trim();
        const eventName =
            safeString(
                event
            ).trim();
        if (
            !id ||
            !eventName
        ) {
            return false;
        }
        return emit(
            "app:" +
            id +
            ":" +
            eventName,
            {
                appId:
                    id,
                ...(
                    isObject(
                        detail
                    )
                        ? detail
                        : {
                            value:
                                detail
                        }
                )
            }
        );
    }
    /* ========================================================
       55 — APP ROUTE STATE
       ======================================================== */
    function setRoute(
        appId,
        route
    ) {
        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );
        if (!instance) {
            return false;
        }
        const normalizedRoute =
            safeString(
                route
            ).trim();
        updateState(
            instance,
            {
                route:
                    normalizedRoute
            }
        );
        emitApp(
            instance.app.id,
            "route-changed",
            {
                route:
                    normalizedRoute
            }
        );
        return true;
    }
    function getRoute(
        appId
    ) {
        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );
        if (!instance) {
            return null;
        }
        return (
            instance.state.route ||
            null
        );
    }
    /* ========================================================
       56 — AI REQUEST BRIDGE
       ======================================================== */
    async function aiRequest(
        appId,
        request,
        options = {}
    ) {
        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );
        if (!instance) {
            throw new Error(
                "Keine aktive App-Runtime für AI-Anfrage."
            );
        }
        const ai =
            getAI();
        if (!ai) {
            throw new Error(
                "HalDo AI Core ist nicht verfügbar."
            );
        }
        try {
            let result;
            if (
                isFunction(
                    ai.request
                )
            ) {
                result =
                    await ai.request(
                        request,
                        {
                            ...options,
                            appId:
                                instance.app.id,
                            instanceId:
                                instance.id,
                            source:
                                "app-runtime"
                        }
                    );
            } else if (
                isFunction(
                    ai.ask
                )
            ) {
                result =
                    await ai.ask(
                        request,
                        {
                            ...options,
                            appId:
                                instance.app.id,
                            instanceId:
                                instance.id,
                            source:
                                "app-runtime"
                        }
                    );
            } else if (
                isFunction(
                    ai.chat
                )
            ) {
                result =
                    await ai.chat(
                        request,
                        {
                            ...options,
                            appId:
                                instance.app.id,
                            instanceId:
                                instance.id,
                            source:
                                "app-runtime"
                        }
                    );
            } else {
                throw new Error(
                    "Kein unterstützter AI-Request-Handler gefunden."
                );
            }
            emit(
                "app-ai-response",
                {
                    appId:
                        instance.app.id,
                    instanceId:
                        instance.id,
                    request:
                        clone(
                            request
                        ),
                    result
                }
            );
            return result;
        } catch (
            exception
        ) {
            setInstanceError(
                instance,
                exception,
                "ai-error"
            );
            throw exception;
        }
    }

TEIL 5 / 7 ENDE
    /* ========================================================
       57 — VOICE REQUEST BRIDGE
       ======================================================== */

    async function voiceRequest(
        appId,
        request,
        options = {}
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {

            throw new Error(
                "Keine aktive App-Runtime für Voice-Anfrage."
            );

        }


        const voice =
            window.HalDoVoice ||
            window.HalDoVoiceManager ||
            (
                window.HalDoOS &&
                (
                    window.HalDoOS.voice ||
                    window.HalDoOS.voiceManager
                )
            ) ||
            null;


        if (!voice) {

            throw new Error(
                "HalDo Voice-System ist nicht verfügbar."
            );

        }


        try {

            let result;


            if (
                isFunction(
                    voice.request
                )
            ) {

                result =
                    await voice.request(
                        request,
                        {
                            ...options,

                            appId:
                                instance.app.id,

                            instanceId:
                                instance.id,

                            source:
                                "app-runtime"
                        }
                    );

            } else if (
                isFunction(
                    voice.speak
                )
            ) {

                result =
                    await voice.speak(
                        request,
                        options
                    );

            } else if (
                isFunction(
                    voice.say
                )
            ) {

                result =
                    await voice.say(
                        request,
                        options
                    );

            } else {

                throw new Error(
                    "Kein unterstützter Voice-Handler gefunden."
                );

            }


            emit(
                "app-voice-response",
                {
                    appId:
                        instance.app.id,

                    instanceId:
                        instance.id,

                    request:
                        clone(
                            request
                        ),

                    result
                }
            );


            return result;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "voice-error"
            );


            throw exception;

        }

    }


    /* ========================================================
       58 — BROADCAST TO APP
       ======================================================== */

    async function broadcast(
        appId,
        event,
        payload = {}
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {
            return false;
        }


        try {

            const result =
                await callHook(
                    instance,
                    "broadcast",
                    {
                        event,

                        payload
                    }
                );


            emitApp(
                instance.app.id,
                event,
                {
                    payload,
                    result
                }
            );


            return result;

        } catch (
            exception
        ) {

            setInstanceError(
                instance,
                exception,
                "broadcast-error"
            );


            return false;

        }

    }


    /* ========================================================
       59 — GLOBAL APP BROADCAST
       ======================================================== */

    async function broadcastAll(
        event,
        payload = {}
    ) {

        const instances =
            getInstances();


        const results =
            [];


        for (
            const instance
            of instances
        ) {

            try {

                const result =
                    await broadcast(
                        instance.app.id,
                        event,
                        payload
                    );


                results.push(
                    {
                        appId:
                            instance.app.id,

                        instanceId:
                            instance.id,

                        result
                    }
                );

            } catch (
                exception
            ) {

                results.push(
                    {
                        appId:
                            instance.app.id,

                        instanceId:
                            instance.id,

                        error:
                            exception
                });

            }

        }


        emit(
            "app-broadcast-all",
            {
                event,

                payload:
                    clone(
                        payload
                    ),

                results
            }
        );


        return results;

    }


    /* ========================================================
       60 — APP MANAGER BRIDGE
       ======================================================== */

    async function managerCall(
        method,
        ...args
    ) {

        const manager =
            getAppManager();


        if (
            !manager ||
            !isFunction(
                manager[
                    method
                ]
            )
        ) {

            return undefined;

        }


        return manager[
            method
        ](
            ...args
        );

    }


    /* ========================================================
       61 — REGISTRY BRIDGE
       ======================================================== */

    async function registryCall(
        method,
        ...args
    ) {

        const registry =
            getAppRegistry();


        if (
            !registry ||
            !isFunction(
                registry[
                    method
                ]
            )
        ) {

            return undefined;

        }


        return registry[
            method
        ](
            ...args
        );

    }


    /* ========================================================
       62 — SYSTEM BRIDGE
       ======================================================== */

    async function systemCall(
        method,
        ...args
    ) {

        const system =
            getSystem();


        if (
            !system ||
            !isFunction(
                system[
                    method
                ]
            )
        ) {

            return undefined;

        }


        return system[
            method
        ](
            ...args
        );

    }


    /* ========================================================
       63 — KERNEL BRIDGE
       ======================================================== */

    async function kernelCall(
        method,
        ...args
    ) {

        const kernel =
            getKernel();


        if (
            !kernel ||
            !isFunction(
                kernel[
                    method
                ]
            )
        ) {

            return undefined;

        }


        return kernel[
            method
        ](
            ...args
        );

    }


    /* ========================================================
       64 — WINDOW BRIDGE
       ======================================================== */

    async function windowCall(
        appId,
        method,
        ...args
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {

            return undefined;

        }


        const wm =
            getWindowManager();


        if (
            !wm ||
            !isFunction(
                wm[
                    method
                ]
            )
        ) {

            return undefined;

        }


        const target =
            instance.state.windowId ||
            instance.window;


        return wm[
            method
        ](
            target,
            ...args
        );

    }


    /* ========================================================
       65 — APP DOM HELPERS
       ======================================================== */

    function query(
        appId,
        selector
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (
            !instance ||
            !instance.root ||
            typeof selector !==
                "string"
        ) {

            return null;

        }


        try {

            return instance.root.querySelector(
                selector
            );

        } catch (_) {

            return null;

        }

    }


    function queryAll(
        appId,
        selector
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (
            !instance ||
            !instance.root ||
            typeof selector !==
                "string"
        ) {

            return [];

        }


        try {

            return Array.from(
                instance.root.querySelectorAll(
                    selector
                )
            );

        } catch (_) {

            return [];

        }

    }


    function createElement(
        tag,
        attributes = {},
        children = []
    ) {

        const element =
            document.createElement(
                safeString(
                    tag
                ) || "div"
            );


        if (
            isObject(
                attributes
            )
        ) {

            Object.entries(
                attributes
            ).forEach(
                ([key, value]) => {

                    if (
                        key ===
                        "textContent"
                    ) {

                        element.textContent =
                            safeString(
                                value
                            );

                        return;

                    }


                    if (
                        key ===
                        "className"
                    ) {

                        element.className =
                            safeString(
                                value
                            );

                        return;

                    }


                    if (
                        key ===
                        "dataset" &&
                        isObject(
                            value
                        )
                    ) {

                        Object.entries(
                            value
                        ).forEach(
                            ([dataKey, dataValue]) => {

                                element.dataset[
                                    dataKey
                                ] =
                                    safeString(
                                        dataValue
                                    );

                            }
                        );

                        return;

                    }


                    if (
                        value !==
                        undefined &&
                        value !==
                        null
                    ) {

                        element.setAttribute(
                            key,
                            safeString(
                                value
                            )
                        );

                    }

                }
            );

        }


        const childList =
            Array.isArray(
                children
            )
                ? children
                : [children];


        childList.forEach(
            child => {

                if (
                    child ===
                    undefined ||
                    child ===
                    null
                ) {

                    return;

                }


                if (
                    child.nodeType
                ) {

                    element.appendChild(
                        child
                    );

                    return;

                }


                element.appendChild(
                    document.createTextNode(
                        safeString(
                            child
                        )
                    )
                );

            }
        );


        return element;

    }


    /* ========================================================
       66 — DOM EVENT BINDING
       ======================================================== */

    function bind(
        appId,
        target,
        event,
        callback,
        options
    ) {

        if (
            !target ||
            !isFunction(
                target.addEventListener
            ) ||
            !isFunction(
                callback
            )
        ) {

            return () => {};

        }


        target.addEventListener(
            event,
            callback,
            options
        );


        const cleanup =
            () => {

                try {

                    target.removeEventListener(
                        event,
                        callback,
                        options
                    );

                } catch (_) {}

            };


        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (instance) {

            addCleanup(
                instance,
                cleanup
            );

        }


        return cleanup;

    }


    /* ========================================================
       67 — APP-SCOPED EVENT BINDING
       ======================================================== */

    function bindEvent(
        appId,
        event,
        callback
    ) {

        const instance =
            activeInstances.get(
                safeString(
                    appId
                ).trim()
            );


        if (!instance) {

            return () => {};

        }


        return bind(
            appId,
            instance.root,
            event,
            callback
        );

    }


    /* ========================================================
       68 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        const instances =
            getInstances();


        return {

            runtimeId:
                RUNTIME_ID,

            version:
                VERSION,

            initialized,

            ready:
                runtimeReady,

            activeAppId,

            registeredApps:
                runtimeApps.size,

            activeInstances:
                instances.length,

            apps:
                instances.map(
                    instance => ({
                        appId:
                            instance.app.id,

                        instanceId:
                            instance.id,

                        state:
                            clone(
                                instance.state
                            )
                    })
                ),

            services: {

                kernel:
                    !!getKernel(),

                system:
                    !!getSystem(),

                appManager:
                    !!getAppManager(),

                appRegistry:
                    !!getAppRegistry(),

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

            },

            timestamp:
                Date.now()

        };

    }


    /* ========================================================
       69 — HEALTH CHECK
       ======================================================== */

    function health() {

        const report =
            diagnostics();


        const issues =
            [];


        if (
            !report.initialized
        ) {

            issues.push(
                "Runtime ist noch nicht initialisiert."
            );

        }


        if (
            !report.services.appManager
        ) {

            issues.push(
                "App Manager ist nicht verfügbar."
            );

        }


        if (
            !report.services.appRegistry
        ) {

            issues.push(
                "App Registry ist nicht verfügbar."
            );

        }


        return {

            ok:
                issues.length === 0,

            issues,

            diagnostics:
                report

        };

    }
    /* ========================================================
       70 — RUNTIME INITIALIZATION
       ======================================================== */

    async function initialize(
        options = {}
    ) {

        if (initialized) {

            return api;

        }


        try {

            /*
             * Bereits registrierte Apps aus der
             * vorhandenen App Registry übernehmen.
             */

            const registry =
                getAppRegistry();


            if (registry) {

                let registeredApps =
                    null;


                try {

                    if (
                        isFunction(
                            registry.getAll
                        )
                    ) {

                        registeredApps =
                            await registry.getAll();

                    } else if (
                        isFunction(
                            registry.list
                        )
                    ) {

                        registeredApps =
                            await registry.list();

                    } else if (
                        Array.isArray(
                            registry.apps
                        )
                    ) {

                        registeredApps =
                            registry.apps;

                    }

                } catch (
                    registryError
                ) {

                    warn(
                        "App Registry konnte nicht automatisch gelesen werden:",
                        registryError
                    );

                }


                if (
                    Array.isArray(
                        registeredApps
                    )
                ) {

                    registeredApps.forEach(
                        definition => {

                            try {

                                register(
                                    definition
                                );

                            } catch (
                                registrationError
                            ) {

                                warn(
                                    "App konnte nicht aus Registry übernommen werden:",
                                    registrationError
                                );

                            }

                        }
                    );

                } else if (
                    isObject(
                        registeredApps
                    )
                ) {

                    Object.values(
                        registeredApps
                    ).forEach(
                        definition => {

                            try {

                                register(
                                    definition
                                );

                            } catch (
                                registrationError
                            ) {

                                warn(
                                    "App konnte nicht aus Registry übernommen werden:",
                                    registrationError
                                );

                            }

                        }
                    );

                }

            }


            /*
             * Runtime kann optional durch den
             * App Manager initialisiert werden.
             */

            const manager =
                getAppManager();


            if (
                manager &&
                isFunction(
                    manager.registerRuntime
                )
            ) {

                try {

                    await manager.registerRuntime(
                        api
                    );

                } catch (
                    managerError
                ) {

                    warn(
                        "App Manager Runtime-Registrierung fehlgeschlagen:",
                        managerError
                    );

                }

            }


            initialized =
                true;


            runtimeReady =
                true;


            dispatch(
                "haldo:app-runtime:ready",
                {
                    runtimeId:
                        RUNTIME_ID,

                    version:
                        VERSION
                }
            );


            emit(
                "runtime-ready",
                {
                    runtimeId:
                        RUNTIME_ID,

                    version:
                        VERSION,

                    options:
                        clone(
                            options
                        )
                }
            );


            log(
                "App Runtime bereit.",
                VERSION
            );


            return api;

        } catch (
            exception
        ) {

            runtimeReady =
                false;


            error(
                "Runtime Initialization Error:",
                exception
            );


            dispatch(
                "haldo:app-runtime:error",
                {
                    runtimeId:
                        RUNTIME_ID,

                    error:
                        exception instanceof Error
                            ? exception.message
                            : safeString(
                                exception
                            )
                }
            );


            throw exception;

        }

    }


    /* ========================================================
       71 — REGISTER EXISTING APP
       ======================================================== */

    function registerExisting(
        definition
    ) {

        try {

            return register(
                definition
            );

        } catch (
            exception
        ) {

            error(
                "App Registration Error:",
                exception
            );

            return null;

        }

    }


    /* ========================================================
       72 — RUN APP
       ======================================================== */

    async function run(
        appId,
        options = {}
    ) {

        const instance =
            await open(
                appId,
                options
            );


        if (!instance) {

            return null;

        }


        await activate(
            appId
        );


        return instance;

    }


    /* ========================================================
       73 — CLOSE ALL APPS
       ======================================================== */

    async function closeAll(
        options = {}
    ) {

        const instances =
            getInstances();


        const results =
            [];


        for (
            const instance
            of instances
        ) {

            try {

                const result =
                    await close(
                        instance.app.id,
                        options
                    );


                results.push(
                    {
                        appId:
                            instance.app.id,

                        success:
                            !!result
                    }
                );

            } catch (
                exception
            ) {

                results.push(
                    {
                        appId:
                            instance.app.id,

                        success:
                            false,

                        error:
                            exception instanceof Error
                                ? exception.message
                                : safeString(
                                    exception
                                )
                    }
                );

            }

        }


        emit(
            "all-apps-closed",
            {
                results
            }
        );


        return results;

    }


    /* ========================================================
       74 — STOP ALL APPS
       ======================================================== */

    async function stopAll(
        options = {}
    ) {

        const instances =
            getInstances();


        const results =
            [];


        for (
            const instance
            of instances
        ) {

            try {

                const result =
                    await stop(
                        instance.app.id,
                        options
                    );


                results.push(
                    {
                        appId:
                            instance.app.id,

                        success:
                            !!result
                    }
                );

            } catch (
                exception
            ) {

                results.push(
                    {
                        appId:
                            instance.app.id,

                        success:
                            false,

                        error:
                            exception instanceof Error
                                ? exception.message
                                : safeString(
                                    exception
                                )
                    }
                );

            }

        }


        emit(
            "all-apps-stopped",
            {
                results
            }
        );


        return results;

    }


    /* ========================================================
       75 — DESTROY ALL APPS
       ======================================================== */

    async function destroyAll(
        options = {}
    ) {

        const instances =
            getInstances();


        const results =
            [];


        for (
            const instance
            of instances
        ) {

            try {

                const result =
                    await destroy(
                        instance.app.id,
                        options
                    );


                results.push(
                    {
                        appId:
                            instance.app.id,

                        success:
                            !!result
                    }
                );

            } catch (
                exception
            ) {

                results.push(
                    {
                        appId:
                            instance.app.id,

                        success:
                            false,

                        error:
                            exception instanceof Error
                                ? exception.message
                                : safeString(
                                    exception
                                )
                    }
                );

            }

        }


        activeAppId =
            null;


        emit(
            "all-apps-destroyed",
            {
                results
            }
        );


        return results;

    }


    /* ========================================================
       76 — RUNTIME RESET
       ======================================================== */

    async function reset(
        options = {}
    ) {

        await destroyAll(
            options
        );


        runtimeApps.clear();


        activeInstances.clear();


        activeAppId =
            null;


        initialized =
            false;


        runtimeReady =
            false;


        emit(
            "runtime-reset",
            {
                runtimeId:
                    RUNTIME_ID
            }
        );


        return true;

    }


    /* ========================================================
       77 — RUNTIME SHUTDOWN
       ======================================================== */

    async function shutdown(
        options = {}
    ) {

        try {

            await destroyAll(
                options
            );

        } catch (
            exception
        ) {

            error(
                "Runtime Shutdown Error:",
                exception
            );

        }


        runtimeReady =
            false;


        initialized =
            false;


        dispatch(
            "haldo:app-runtime:shutdown",
            {
                runtimeId:
                    RUNTIME_ID,

                version:
                    VERSION
            }
        );


        emit(
            "runtime-shutdown",
            {
                runtimeId:
                    RUNTIME_ID
            }
        );


        return true;

    }


    /* ========================================================
       78 — API
       ======================================================== */

    const api = {

        id:
            RUNTIME_ID,

        runtimeId:
            RUNTIME_ID,

        version:
            VERSION,

        get initialized() {

            return initialized;

        },

        get ready() {

            return runtimeReady;

        },

        get activeAppId() {

            return activeAppId;

        },


        /*
         * Initialization
         */

        initialize,

        shutdown,

        reset,


        /*
         * Registry
         */

        register,

        registerExisting,

        unregister,

        get,

        has,

        getAll,


        /*
         * Instances
         */

        create,

        getInstance,

        getAppInstance,

        getInstances,


        /*
         * Lifecycle
         */

        start,

        run,

        open,

        close,

        stop,

        restart,

        destroy,

        mount,

        unmount,


        /*
         * Visibility / focus
         */

        activate,

        deactivate,

        focus,

        blur,

        show,

        hide,

        minimize,

        restore,

        maximize,

        unmaximize,

        suspend,

        resume,


        /*
         * Window / layout
         */

        move,

        resize,

        windowCall,


        /*
         * Navigation
         */

        navigate,

        back,

        forward,

        setRoute,

        getRoute,


        /*
         * App execution
         */

        execute,

        message,

        broadcast,

        broadcastAll,

        updateOptions,


        /*
         * AI / Voice
         */

        aiRequest,

        voiceRequest,


        /*
         * State / Storage
         */

        getState,

        persistState,

        restoreState,

        storageGet,

        storageSet,

        storageRemove,


        /*
         * Events
         */

        on,

        off,

        emit,

        onApp,

        emitApp,


        /*
         * DOM
         */

        query,

        queryAll,

        createElement,

        bind,

        bindEvent,


        /*
         * Bridges
         */

        managerCall,

        registryCall,

        systemCall,

        kernelCall,


        /*
         * Diagnostics
         */

        diagnostics,

        health,


        /*
         * Bulk operations
         */

        closeAll,

        stopAll,

        destroyAll,


        /*
         * Cleanup
         */

        addCleanup,

        runCleanup

    };


    /* ========================================================
       79 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppRuntime =
        api;


    if (
        window.HalDoOS &&
        typeof window.HalDoOS ===
            "object"
    ) {

        window.HalDoOS.appRuntime =
            api;

    }


    /*
     * Alternative compatibility names.
     */

    window.HalDoOSAppRuntime =
        api;


    /* ========================================================
       80 — GLOBAL EVENT BRIDGE
       ======================================================== */

    window.addEventListener(
        "haldo:app-runtime:shutdown",
        () => {

            runtimeReady =
                false;

        }
    );


    /* ========================================================
       81 — AUTOMATIC BOOTSTRAP
       ======================================================== */

    if (
        typeof document !==
        "undefined"
    ) {

        if (
            document.readyState ===
            "loading"
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                () => {

                    initialize()
                        .catch(
                            exception => {

                                error(
                                    "Automatische Runtime-Initialisierung fehlgeschlagen:",
                                    exception
                                );

                            }
                        );

                },
                {
                    once:
                        true
                }
            );

        } else {

            Promise.resolve()
                .then(
                    () =>
                        initialize()
                )
                .catch(
                    exception => {

                        error(
                            "Automatische Runtime-Initialisierung fehlgeschlagen:",
                            exception
                        );

                    }
                );

        }

    }


    /* ========================================================
       82 — BEFORE UNLOAD PERSISTENCE
       ======================================================== */

    if (
        typeof window !==
        "undefined"
    ) {

        window.addEventListener(
            "beforeunload",
            () => {

                /*
                 * Keine asynchronen Operationen
                 * während beforeunload erzwingen.
                 *
                 * Bestehender State wird bereits
                 * während der Runtime-Operationen
                 * persistiert.
                 */

                try {

                    activeInstances.forEach(
                        instance => {

                            if (
                                instance &&
                                instance.app
                            ) {

                                /*
                                 * Best effort:
                                 * lokale Persistenz verwenden,
                                 * falls vorhanden.
                                 */

                                const key =
                                    getStateStorageKey(
                                        instance.app.id
                                    );


                                if (
                                    window.localStorage
                                ) {

                                    try {

                                        window.localStorage.setItem(
                                            key,
                                            JSON.stringify(
                                                instance.state
                                            )
                                        );

                                    } catch (_) {}

                                }

                            }

                        }
                    );

                } catch (_) {}

            }
        );

    }


    /* ========================================================
       83 — FINAL READY SIGNAL
       ======================================================== */

    try {

        window.dispatchEvent(
            new CustomEvent(
                "haldo:app-runtime:loaded",
                {
                    detail: {

                        runtime:
                            api,

                        runtimeId:
                            RUNTIME_ID,

                        version:
                            VERSION

                    }
                }
            )
        );

    } catch (_) {}


    /* ========================================================
       84 — END
       ======================================================== */

})();
