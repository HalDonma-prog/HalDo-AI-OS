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
            "haldo:runtime:app-registered",
            {
                app
            }
        );


        dispatch(
            "haldo:app-runtime:registered",
            {
                app
            }
        );


        return app;

    }


    /* ========================================================
       08 — UNREGISTER APP
       ======================================================== */

    async function unregister(
        appId
    ) {

        const id =
            safeString(
                appId
            );


        if (
            activeInstances.has(
                id
            )
        ) {

            await unmount(
                id
            );

        }


        runtimeApps.delete(
            id
        );


        dispatch(
            "haldo:runtime:app-unregistered",
            {
                appId:
                    id
            }
        );


        return true;

    }


    /* ========================================================
       09 — GET APP
       ======================================================== */

    function get(
        appId
    ) {

        const id =
            safeString(
                appId
            );


        if (
            runtimeApps.has(
                id
            )
        ) {

            return runtimeApps.get(
                id
            );

        }


        const registry =
            getAppRegistry();


        if (
            registry &&
            isFunction(
                registry.get
            )
        ) {

            try {

                const app =
                    registry.get(
                        id
                    );


                if (app) {

                    return normalizeApp(
                        app
                    );

                }

            } catch (_) {}

        }


        const manager =
            getAppManager();


        if (
            manager &&
            isFunction(
                manager.get
            )
        ) {

            try {

                const app =
                    manager.get(
                        id
                    );


                if (app) {

                    return normalizeApp(
                        app
                    );

                }

            } catch (_) {}

        }


        return null;

    }


    /* ========================================================
       10 — GET ALL
       ======================================================== */

    function getAll() {

        const result =
            new Map();


        runtimeApps.forEach(
            (
                app,
                id
            ) => {

                result.set(
                    id,
                    app
                );

            }
        );


        const registry =
            getAppRegistry();


        if (
            registry &&
            isFunction(
                registry.getAll
            )
        ) {

            try {

                const apps =
                    registry.getAll();


                if (
                    Array.isArray(
                        apps
                    )
                ) {

                    apps.forEach(
                        app => {

                            try {

                                const normalized =
                                    normalizeApp(
                                        app
                                    );

                                result.set(
                                    normalized.id,
                                    normalized
                                );

                            } catch (_) {}

                        }
                    );

                }

            } catch (_) {}

        }


        return Array.from(
            result.values()
        );

    }


    /* ========================================================
       11 — APP STATE
       ======================================================== */

    function createState(
        app,
        initialState
    ) {

        let state =
            isObject(
                initialState
            )
                ? clone(
                    initialState
                )
                : {};


        function getState() {

            return clone(
                state
            );

        }


        function setState(
            next
        ) {

            const previous =
                clone(
                    state
                );


            if (
                isFunction(
                    next
                )
            ) {

                next =
                    next(
                        clone(
                            state
                        )
                    );

            }


            if (
                !isObject(
                    next
                )
            ) {

                throw new Error(
                    "App-State muss ein Objekt sein."
                );

            }


            const serialized =
                safeString(
                    JSON.stringify(
                        next
                    )
                );


            if (
                serialized.length >
                MAX_STATE_SIZE
            ) {

                throw new Error(
                    "App-State überschreitet die maximale Größe."
                );

            }


            state =
                clone(
                    next
                );


            emitAppEvent(
                app.id,
                "state:changed",
                {
                    appId:
                        app.id,

                    previous,

                    state:
                        clone(
                            state
                        )
                }
            );


            return getState();

        }


        function patchState(
            patch
        ) {

            if (
                !isObject(
                    patch
                )
            ) {

                return getState();

            }


            return setState(
                {
                    ...state,
                    ...clone(
                        patch
                    )
                }
            );

        }


        function resetState(
            next = {}
        ) {

            return setState(
                next
            );

        }


        return {

            get:
                getState,

            set:
                setState,

            patch:
                patchState,

            reset:
                resetState

        };

    }


    /* ========================================================
       12 — STORAGE BRIDGE
       ======================================================== */

    function createStorage(
        app
    ) {

        const storage =
            getStorage();


        const namespace =
            "haldo.app." +
            app.id;


        async function call(
            methods,
            ...args
        ) {

            if (!storage) {

                return null;

            }


            for (
                const method of methods
            ) {

                if (
                    isFunction(
                        storage[method]
                    )
                ) {

                    try {

                        return await storage[
                            method
                        ](
                            ...args
                        );

                    } catch (
                        storageError
                    ) {

                        warn(
                            "Storage-Methode fehlgeschlagen:",
                            method,
                            storageError
                        );

                    }

                }

            }


            return null;

        }


        return {

            async get(
                key,
                fallback = null
            ) {

                const fullKey =
                    namespace +
                    "." +
                    key;


                const result =
                    await call(
                        [
                            "get",
                            "read",
                            "load"
                        ],
                        fullKey
                    );


                return result === null ||
                       result === undefined
                    ? fallback
                    : result;

            },


            async set(
                key,
                value
            ) {

                const fullKey =
                    namespace +
                    "." +
                    key;


                return call(
                    [
                        "set",
                        "write",
                        "save"
                    ],
                    fullKey,
                    value
                );

            },


            async remove(
                key
            ) {

                const fullKey =
                    namespace +
                    "." +
                    key;


                return call(
                    [
                        "remove",
                        "delete",
                        "clear"
                    ],
                    fullKey
                );

            },


            async clear() {

                return call(
                    [
                        "clearNamespace",
                        "clear"
                    ],
                    namespace
                );

            }

        };

    }


    /* ========================================================
       13 — EVENT BUS FOR APP
       ======================================================== */

    function createEventBus(
        appId
    ) {

        if (
            !listeners.has(
                appId
            )
        ) {

            listeners.set(
                appId,
                new Map()
            );

        }


        const appListeners =
            listeners.get(
                appId
            );


        function on(
            eventName,
            handler
        ) {

            if (
                !isFunction(
                    handler
                )
            ) {

                return () => {};

            }


            if (
                !appListeners.has(
                    eventName
                )
            ) {

                appListeners.set(
                    eventName,
                    new Set()
                );

            }


            const handlers =
                appListeners.get(
                    eventName
                );


            handlers.add(
                handler
            );


            return function off() {

                handlers.delete(
                    handler
                );

            };

        }


        function emit(
            eventName,
            payload
        ) {

            emitAppEvent(
                appId,
                eventName,
                payload
            );

        }


        function once(
            eventName,
            handler
        ) {

            let off;


            const wrapper =
                payload => {

                    off();

                    handler(
                        payload
                    );

                };


            off =
                on(
                    eventName,
                    wrapper
                );


            return off;

        }


        function off(
            eventName,
            handler
        ) {

            const handlers =
                appListeners.get(
                    eventName
                );


            if (!handlers) {
                return;
            }


            if (handler) {

                handlers.delete(
                    handler
                );

            } else {

                handlers.clear();

            }

        }


        return {

            on,

            once,

            off,

            emit

        };

    }


    function emitAppEvent(
        appId,
        eventName,
        payload
    ) {

        const appListeners =
            listeners.get(
                appId
            );


        if (
            appListeners &&
            appListeners.has(
                eventName
            )
        ) {

            appListeners
                .get(
                    eventName
                )
                .forEach(
                    handler => {

                        try {

                            handler(
                                payload
                            );

                        } catch (
                            handlerError
                        ) {

                            error(
                                "App Event Handler:",
                                handlerError
                            );

                        }

                    }
                );

        }


        dispatch(
            "haldo:app:event",
            {

                appId,

                event:
                    eventName,

                payload

            }
        );

    }


    /* ========================================================
       14 — ROUTER BRIDGE
       ======================================================== */

    function createRouter(
        app
    ) {

        const router =
            getRouter();


        return {

            async navigate(
                route,
                options = {}
            ) {

                if (!router) {

                    return false;

                }


                const methods = [
                    "navigate",
                    "go",
                    "open",
                    "push"
                ];


                for (
                    const method of methods
                ) {

                    if (
                        isFunction(
                            router[method]
                        )
                    ) {

                        try {

                            await router[
                                method
                            ](
                                route,
                                options
                            );


                            return true;

                        } catch (_) {}

                    }

                }


                return false;

            },


            back() {

                if (
                    router &&
                    isFunction(
                        router.back
                    )
                ) {

                    return router.back();

                }


                if (
                    window.history
                ) {

                    return window.history.back();

                }


                return false;

            },


            getRouter() {

                return router;

            }

        };

    }


    /* ========================================================
       15 — WINDOW MANAGER BRIDGE
       ======================================================== */

    function createWindowBridge(
        app
    ) {

        const manager =
            getWindowManager();


        return {

            async open(
                options = {}
            ) {

                if (!manager) {

                    return null;

                }


                const methods = [
                    "open",
                    "createWindow",
                    "openWindow",
                    "show"
                ];


                for (
                    const method of methods
                ) {

                    if (
                        isFunction(
                            manager[method]
                        )
                    ) {

                        try {

                            return await manager[
                                method
                            ](
                                {
                                    ...options,
                                    appId:
                                        app.id
                                }
                            );

                        } catch (_) {}

                    }

                }


                return null;

            },


            async close(
                windowId
            ) {

                if (!manager) {
                    return false;
                }


                const methods = [
                    "close",
                    "closeWindow",
                    "hide"
                ];


                for (
                    const method of methods
                ) {

                    if (
                        isFunction(
                            manager[method]
                        )
                    ) {

                        try {

                            await manager[
                                method
                            ](
                                windowId
                            );

                            return true;

                        } catch (_) {}

                    }

                }


                return false;

            },


            getManager() {

                return manager;

            }

        };

    }


    /* ========================================================
       16 — SYSTEM BRIDGE
       ======================================================== */

    function createSystemBridge(
        app
    ) {

        return {

            getSystem,

            getKernel,

            getAppManager,

            getAppRegistry,

            getRouter,

            getWindowManager,

            getStorage,

            getAI,

            getLanguage,

            version:
                VERSION,

            appId:
                app.id

        };

    }


    /* ========================================================
       17 — AI BRIDGE
       ======================================================== */

    function createAIBridge(
        app
    ) {

        return {

            async ask(
                text,
                options = {}
            ) {

                const ai =
                    getAI();


                if (!ai) {

                    return null;

                }


                const methods = [
                    "chat",
                    "ask",
                    "respond",
                    "process",
                    "send",
                    "generate"
                ];


                for (
                    const method of methods
                ) {

                    if (
                        isFunction(
                            ai[method]
                        )
                    ) {

                        try {

                            const result =
                                await ai[
                                    method
                                ](
                                    text,
                                    {
                                        ...options,
                                        appId:
                                            app.id
                                    }
                                );


                            if (
                                typeof result ===
                                "string"
                            ) {

                                return result;

                            }


                            if (
                                result &&
                                typeof result.text ===
                                "string"
                            ) {

                                return result.text;

                            }


                            if (
                                result &&
                                typeof result.response ===
                                "string"
                            ) {

                                return result.response;

                            }


                            return result;

                        } catch (
                            aiError
                        ) {

                            error(
                                "AI App Bridge:",
                                aiError
                            );

                        }

                    }

                }


                return null;

            },

            getAI

        };

    }


    /* ========================================================
       18 — LANGUAGE BRIDGE
       ======================================================== */

    function createLanguageBridge(
        app
    ) {

        const language =
            getLanguage();


        return {

            getCurrentLanguage() {

                if (
                    language &&
                    isFunction(
                        language.getCurrentLanguage
                    )
                ) {

                    try {

                        return language
                            .getCurrentLanguage();

                    } catch (_) {}

                }


                if (
                    language &&
                    isFunction(
                        language.getLanguage
                    )
                ) {

                    try {

                        return language
                            .getLanguage();

                    } catch (_) {}

                }


                return (
                    document.documentElement
                        .lang ||
                    "de"
                );

            },


            translate(
                key,
                fallback
            ) {

                if (
                    language &&
                    isFunction(
                        language.translate
                    )
                ) {

                    try {

                        return language.translate(
                            key,
                            fallback
                        );

                    } catch (_) {}

                }


                return (
                    fallback ||
                    key
                );

            },

            getLanguageManager() {

                return language;

            }

        };

    }


    /* ========================================================
       19 — APP CONTEXT
       ======================================================== */

    function createContext(
        app,
        instance,
        mountElement
    ) {

        const state =
            createState(
                app,
                app.initialState
            );


        const events =
            createEventBus(
                app.id
            );


        const storage =
            createStorage(
                app
            );


        const router =
            createRouter(
                app
            );


        const windows =
            createWindowBridge(
                app
            );


        const system =
            createSystemBridge(
                app
            );


        const ai =
            createAIBridge(
                app
            );


        const language =
            createLanguageBridge(
                app
            );


        return {

            app:
                clone(
                    app
                ),

            instance,

            runtime:
                api,

            container:
                mountElement,

            element:
                mountElement,

            state,

            events,

            storage,

            router,

            windows,

            system,

            ai,

            language,

            services: {

                system,

                kernel:
                    getKernel(),

                appManager:
                    getAppManager(),

                appRegistry:
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

            emit(
                eventName,
                payload
            ) {

                events.emit(
                    eventName,
                    payload
                );

            },

            destroy() {

                events.off(
                    "*"
                );

            }

        };

    }


    /* ========================================================
       20 — APP MOUNT
       ======================================================== */

    async function mount(
        appOrId,
        container,
        options = {}
    ) {

        let app;


        if (
            typeof appOrId ===
            "string"
        ) {

            app =
                get(
                    appOrId
                );

        } else {

            app =
                normalizeApp(
                    appOrId
                );

        }


        if (!app) {

            throw new Error(
                "App nicht gefunden: " +
                safeString(
                    appOrId
                )
            );

        }


        if (!app.enabled) {

            throw new Error(
                "App ist deaktiviert: " +
                app.id
            );

        }


        if (!container) {

            throw new Error(
                "App benötigt einen Container."
            );

        }


        if (
            activeInstances.has(
                app.id
            )
        ) {

            await unmount(
                app.id
            );

        }


        const instanceId =
            createId(
                "app"
            );


        const instance = {

            id:
                instanceId,

            appId:
                app.id,

            startedAt:
                Date.now(),

            status:
                "mounting",

            controller:
                null,

            cleanup:
                []

        };


        const context =
            createContext(
                app,
                instance,
                container
            );


        instance.context =
            context;


        activeInstances.set(
            app.id,
            instance
        );


        activeAppId =
            app.id;


        try {

            container.dataset.haldoAppId =
                app.id;

            container.dataset.haldoAppInstance =
                instanceId;


            if (
                options.clear !== false
            ) {

                container.innerHTML =
                    "";

            }


            dispatch(
                "haldo:app:mounting",
                {
                    app,
                    instance,
                    context
                }
            );


            let rendered =
                null;


            /*
             * Priorität:
             *
             * 1. mount()
             * 2. start()
             * 3. render()
             * 4. create()
             */


            if (
                isFunction(
                    app.mount
                )
            ) {

                rendered =
                    await app.mount(
                        context
                    );

            } else if (
                isFunction(
                    app.start
                )
            ) {

                rendered =
                    await app.start(
                        context
                    );

            } else if (
                isFunction(
                    app.render
                )
            ) {

                rendered =
                    await app.render(
                        context
                    );

            } else if (
                isFunction(
                    app.create
                )
            ) {

                rendered =
                    await app.create(
                        context
                    );

            }


            /*
             * Unterstützt DOM-Elemente,
             * HTML-Strings und zurückgegebene
             * Container.
             */

            if (
                rendered instanceof
                Node
            ) {

                if (
                    rendered !==
                    container
                ) {

                    container.appendChild(
                        rendered
                    );

                }

                instance.element =
                    rendered;

            } else if (
                typeof rendered ===
                "string"
            ) {

                container.innerHTML =
                    rendered;

                instance.element =
                    container;

            } else {

                instance.element =
                    container;

            }


            /*
             * Optionaler afterMount Hook.
             */

            if (
                isFunction(
                    app.afterMount
                )
            ) {

                await app.afterMount(
                    context
                );

            }


            instance.status =
                "mounted";


            dispatch(
                "haldo:app:mounted",
                {
                    app,
                    instance,
                    context
                }
            );


            dispatch(
                "haldo:app-opened",
                {
                    app,
                    instance
                }
            );


            return {

                success:
                    true,

                app,

                instance,

                element:
                    instance.element,

                context

            };

        } catch (
            mountError
        ) {

            instance.status =
                "error";

            instance.error =
                mountError;


            error(
                "App Mount Error:",
                app.id,
                mountError
            );


            dispatch(
                "haldo:app:error",
                {
                    app,
                    instance,
                    error:
                        mountError
                }
            );


            activeInstances.delete(
                app.id
            );


            if (
                activeAppId ===
                app.id
            ) {

                activeAppId =
                    null;

            }


            throw mountError;

        }

    }


    /* ========================================================
       21 — APP UNMOUNT
       ======================================================== */

    async function unmount(
        appId
    ) {

        const id =
            safeString(
                appId
            );


        const instance =
            activeInstances.get(
                id
            );


        if (!instance) {

            return false;

        }


        const app =
            get(
                id
            ) ||
            instance.context.app;


        instance.status =
            "unmounting";


        try {

            if (
                app &&
                isFunction(
                    app.beforeUnmount
                )
            ) {

                await app.beforeUnmount(
                    instance.context
                );

            }


            if (
                app &&
                isFunction(
                    app.unmount
                )
            ) {

                await app.unmount(
                    instance.context
                );

            } else if (
                app &&
                isFunction(
                    app.destroy
                )
            ) {

                await app.destroy(
                    instance.context
                );

            }


            if (
                Array.isArray(
                    instance.cleanup
                )
            ) {

                for (
                    const cleanup of
                    instance.cleanup
                ) {

                    if (
                        isFunction(
                            cleanup
                        )
                    ) {

                        try {

                            cleanup();

                        } catch (_) {}

                    }

                }

            }


            if (
                instance.context &&
                instance.context.events
            ) {

                /*
                 * Event listener cleanup
                 * geschieht über die App
                 * selbst oder über die
                 * gespeicherte Listener-Struktur.
                 */

            }


            const element =
                instance.element;


            if (
                element &&
                element !==
                instance.context.container &&
                element.parentNode
            ) {

                element.parentNode
                    .removeChild(
                        element
                    );

            }


            const container =
                instance.context &&
                instance.context.container;


            if (
                container
            ) {

                delete container.dataset
                    .haldoAppId;

                delete container.dataset
                    .haldoAppInstance;

            }


            instance.status =
                "unmounted";


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


            dispatch(
                "haldo:app:unmounted",
                {
                    app,
                    instance
                }
            );


            dispatch(
                "haldo:app-closed",
                {
                    app,
                    instance
                }
            );


            return true;

        } catch (
            unmountError
        ) {

            instance.status =
                "error";


            instance.error =
                unmountError;


            error(
                "App Unmount Error:",
                id,
                unmountError
            );


            dispatch(
                "haldo:app:error",
                {
                    app,
                    instance,
                    error:
                        unmountError
                }
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


            return false;

        }

    }


    /* ========================================================
       22 — ACTIVE APP
       ======================================================== */

    function getActiveAppId() {

        return activeAppId;

    }


    function getActiveInstance() {

        if (!activeAppId) {

            return null;

        }


        return (
            activeInstances.get(
                activeAppId
            ) ||
            null
        );

    }


    function getInstance(
        appId
    ) {

        return (
            activeInstances.get(
                safeString(
                    appId
                )
            ) ||
            null
        );

    }


    /* ========================================================
       23 — ACTIVATE APP
       ======================================================== */

    async function activate(
        appId,
        container,
        options = {}
    ) {

        const previous =
            activeAppId;


        if (
            previous &&
            previous !==
            appId &&
            options.keepPrevious !== true
        ) {

            await unmount(
                previous
            );

        }


        return mount(
            appId,
            container,
            options
        );

    }


    /* ========================================================
       24 — APP UPDATE
       ======================================================== */

    async function update(
        appId,
        payload = {}
    ) {

        const instance =
            getInstance(
                appId
            );


        if (!instance) {

            return false;

        }


        const app =
            instance.context.app;


        if (
            isFunction(
                app.update
            )
        ) {

            try {

                await app.update(
                    instance.context,
                    payload
                );


                dispatch(
                    "haldo:app:updated",
                    {
                        app,
                        instance,
                        payload
                    }
                );


                return true;

            } catch (
                updateError
            ) {

                error(
                    "App Update Error:",
                    updateError
                );


                dispatch(
                    "haldo:app:error",
                    {
                        app,
                        instance,
                        error:
                            updateError
                    }
                );

            }

        }


        return false;

    }


    /* ========================================================
       25 — RUNTIME EVENTS
       ======================================================== */

    function on(
        eventName,
        handler
    ) {

        if (
            !isFunction(
                handler
            )
        ) {

            return () => {};

        }


        const key =
            safeString(
                eventName
            );


        if (
            !listeners.has(
                "__runtime__"
            )
        ) {

            listeners.set(
                "__runtime__",
                new Map()
            );

        }


        const map =
            listeners.get(
                "__runtime__"
            );


        if (
            !map.has(
                key
            )
        ) {

            map.set(
                key,
                new Set()
            );

        }


        const set =
            map.get(
                key
            );


        set.add(
            handler
        );


        return function off() {

            set.delete(
                handler
            );

        };

    }


    function emit(
        eventName,
        payload
    ) {

        const key =
            safeString(
                eventName
            );


        const map =
            listeners.get(
                "__runtime__"
            );


        if (
            map &&
            map.has(
                key
            )
        ) {

            map.get(
                key
            ).forEach(
                handler => {

                    try {

                        handler(
                            payload
                        );

                    } catch (
                        handlerError
                    ) {

                        error(
                            handlerError
                        );

                    }

                }
            );

        }


        dispatch(
            "haldo:runtime:event",
            {
                event:
                    key,

                payload
            }
        );

    }


    /* ========================================================
       26 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        const apps =
            getAll();


        const instances =
            Array.from(
                activeInstances.values()
            )
            .map(
                instance => ({
                    id:
                        instance.id,

                    appId:
                        instance.appId,

                    status:
                        instance.status,

                    startedAt:
                        instance.startedAt
                })
            );


        return {

            runtime: {

                id:
                    RUNTIME_ID,

                version:
                    VERSION,

                initialized,

                ready:
                    runtimeReady

            },

            apps: {

                registered:
                    apps.length,

                ids:
                    apps.map(
                        app =>
                            app.id
                    )

            },

            active: {

                appId:
                    activeAppId,

                instances

            },

            services: {

                kernel:
                    Boolean(
                        getKernel()
                    ),

                system:
                    Boolean(
                        getSystem()
                    ),

                appManager:
                    Boolean(
                        getAppManager()
                    ),

                appRegistry:
                    Boolean(
                        getAppRegistry()
                    ),

                router:
                    Boolean(
                        getRouter()
                    ),

                windowManager:
                    Boolean(
                        getWindowManager()
                    ),

                storage:
                    Boolean(
                        getStorage()
                    ),

                ai:
                    Boolean(
                        getAI()
                    ),

                language:
                    Boolean(
                        getLanguage()
                    )

            }

        };

    }


    /* ========================================================
       27 — SYNCHRONIZE REGISTRY
       ======================================================== */

    function synchronizeRegistry() {

        const registry =
            getAppRegistry();


        if (!registry) {

            return 0;

        }


        let count =
            0;


        try {

            let apps = [];


            if (
                isFunction(
                    registry.getAll
                )
            ) {

                apps =
                    registry.getAll();

            } else if (
                isFunction(
                    registry.getApps
                )
            ) {

                apps =
                    registry.getApps();

            }


            if (
                Array.isArray(
                    apps
                )
            ) {

                apps.forEach(
                    app => {

                        try {

                            register(
                                app
                            );

                            count++;

                        } catch (
                            registrationError
                        ) {

                            warn(
                                "Registry App übersprungen:",
                                registrationError
                            );

                        }

                    }
                );

            }

        } catch (
            registryError
        ) {

            warn(
                "Registry Synchronisierung fehlgeschlagen:",
                registryError
            );

        }


        if (count > 0) {

            dispatch(
                "haldo:app-manager:registry-synchronized",
                {
                    count
                }
            );

        }


        return count;

    }


    /* ========================================================
       28 — INITIALIZATION
       ======================================================== */

    function initialize() {

        if (initialized) {

            return api;

        }


        initialized =
            true;


        synchronizeRegistry();


        runtimeReady =
            true;


        dispatch(
            "haldo:app-runtime-ready",
            {
                version:
                    VERSION,

                runtime:
                    api
            }
        );


        dispatch(
            "haldo:runtime:ready",
            {
                version:
                    VERSION
            }
        );


        log(
            "HalDo AI OS 20 App Runtime bereit.",
            VERSION
        );


        return api;

    }


    /* ========================================================
       29 — GLOBAL API
       ======================================================== */

    const api = {

        id:
            RUNTIME_ID,

        version:
            VERSION,

        register,

        unregister,

        get,

        getAll,

        mount,

        unmount,

        activate,

        update,

        getActiveAppId,

        getActiveInstance,

        getInstance,

        on,

        emit,

        diagnostics,

        synchronizeRegistry,

        initialize

    };


    /* ========================================================
       30 — GLOBAL EXPORTS
       ======================================================== */

    window.HalDoAppRuntime =
        api;


    window.HalDoOS.appRuntime =
        api;


    window.HalDoOS.runtime =
        api;


    /* ========================================================
       31 — COMPATIBILITY ALIASES
       ======================================================== */

    window.HalDoOSAppRuntime =
        api;


    /* ========================================================
       32 — AUTO INITIALIZATION
       ======================================================== */

    function bootRuntime() {

        try {

            initialize();

        } catch (
            runtimeError
        ) {

            error(
                "Runtime konnte nicht initialisiert werden:",
                runtimeError
            );


            dispatch(
                "haldo:app-runtime-error",
                {
                    error:
                        runtimeError
                }
            );

        }

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            bootRuntime,
            {
                once:
                    true
            }
        );

    } else {

        bootRuntime();

    }


    /* ========================================================
       33 — LATE SERVICE CONNECTION
       ======================================================== */

    const lateEvents = [

        "haldo:kernel-ready",

        "haldo:system-ready",

        "haldo:app-manager-ready",

        "haldo:app-manager:ready",

        "haldo:registry-ready",

        "haldo:app-manager:registered"

    ];


    lateEvents.forEach(
        eventName => {

            window.addEventListener(
                eventName,
                function () {

                    try {

                        synchronizeRegistry();

                    } catch (_) {}

                }
            );

        }
    );


    /* ========================================================
       34 — WINDOW LOAD
       ======================================================== */

    window.addEventListener(
        "load",
        function () {

            try {

                if (
                    !runtimeReady
                ) {

                    initialize();

                } else {

                    synchronizeRegistry();

                }

            } catch (
                loadError
            ) {

                error(
                    "Runtime Load Error:",
                    loadError
                );

            }

        }
    );


    /* ========================================================
       35 — FINAL
       ======================================================== */

    log(
        "App Runtime registriert:",
        RUNTIME_ID
    );


})();