/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL APPLICATION MANAGER
   ------------------------------------------------------------
   Datei:
       /js/app-manager.js

   Version:
       21.0.0

   ZENTRALE APP-SCHALTZENTRALE

   Verbindet:
       Kernel
       System
       App Registry
       App Contract
       App Runtime
       App Platform
       App Router
       Window Manager
       Launcher
       Storage
       AI
       Language
       Voice
       Notifications
       Keyboard
       Diagnostics

   Diese Datei wird als EINE vollständige Datei aufgebaut.
   Die folgenden Teile sind fortlaufende Teile derselben Datei.
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
        "21.0.0";

    const MODULE_ID =
        "app-manager";

    const NAME =
        "HalDo AI OS Professional Application Manager";


    /* ========================================================
       03 — SERVICE DISCOVERY
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
            window.HalDoOSAppRegistry ||
            HalDoOS.appRegistry ||
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


    function getRuntime() {

        return (
            window.HalDoAppRuntime ||
            window.HalDoOSAppRuntime ||
            HalDoOS.appRuntime ||
            HalDoOS.runtime ||
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


    function getRouter() {

        return (
            window.HalDoAppRouter ||
            window.HalDoRouter ||
            HalDoOS.appRouter ||
            HalDoOS.router ||
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
            window.HalDoStorageManager ||
            window.HalDoStorage ||
            HalDoOS.storageManager ||
            HalDoOS.storage ||
            null
        );
    }


    function getAI() {

        return (
            window.HalDoAI ||
            window.HalDoAICore ||
            HalDoOS.ai ||
            HalDoOS.aiCore ||
            null
        );
    }


    function getLanguage() {

        return (
            window.HalDoLanguageManager ||
            window.HalDoLanguageSystem ||
            window.HalDoLanguage ||
            HalDoOS.languageManager ||
            HalDoOS.languageSystem ||
            HalDoOS.language ||
            null
        );
    }


    function getVoice() {

        return (
            window.HalDoVoice ||
            window.HalDoAISpeech ||
            HalDoOS.voice ||
            HalDoOS.speech ||
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
            HalDoOS.ezidiKeyboard ||
            null
        );
    }


    function getDiagnostics() {

        return (
            window.HalDoDiagnostics ||
            HalDoOS.diagnostics ||
            window.HalDoSystemDiagnostics ||
            null
        );
    }


    function getConfig() {

        return (
            window.HalDoConfigManager ||
            HalDoOS.configManager ||
            window.HalDoConfig ||
            HalDoOS.config ||
            null
        );
    }


    /* ========================================================
       04 — GENERIC HELPERS
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


    function isObject(
        value
    ) {

        return (
            value !== null &&
            typeof value ===
                "object" &&
            !Array.isArray(value)
        );
    }


    function normalizeId(
        value
    ) {

        return String(
            value ?? ""
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
            value ===
                null ||
            value ===
                undefined
        ) {

            return value;
        }


        if (
            typeof structuredClone ===
            "function"
        ) {

            try {

                return structuredClone(
                    value
                );

            } catch (_) {}
        }


        if (
            Array.isArray(value)
        ) {

            return value.map(
                clone
            );
        }


        if (
            typeof value ===
            "object"
        ) {

            const result =
                {};

            Object.keys(
                value
            ).forEach(
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
                            clone(item);
                    }
                }
            );

            return result;
        }


        return value;
    }


    function safeAsyncResult(
        result
    ) {

        if (
            result &&
            typeof result.then ===
            "function"
        ) {

            return result;
        }

        return Promise.resolve(
            result
        );
    }


    function dispatch(
        type,
        detail
    ) {

        try {

            window.dispatchEvent(
                new CustomEvent(
                    type,
                    {
                        detail:
                            detail || {}
                    }
                )
            );

        } catch (_) {}
    }
       function now() {

        return Date.now();
    }


    function createTimestamp() {

        return {

            createdAt:
                now(),

            updatedAt:
                now()
        };
    }


    function createStatistics() {

        return {

            registered:
                0,

            initialized:
                0,

            starts:
                0,

            opens:
                0,

            closes:
                0,

            stops:
                0,

            activations:
                0,

            deactivations:
                0,

            errors:
                0,

            settingsChanges:
                0,

            platformConnections:
                0,

            runtimeConnections:
                0
        };
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

        activeAppId:
            null,

        apps:
            new Map(),

        instances:
            new Map(),

        appState:
            new Map(),

        settings:
            new Map(),

        contexts:
            new Map(),

        listeners:
            new Map(),

        platformListeners:
            [],

        registryListeners:
            [],

        runtimeListeners:
            [],

        kernelListeners:
            [],

        systemListeners:
            [],

        connections: {

            kernel:
                false,

            system:
                false,

            registry:
                false,

            contract:
                false,

            runtime:
                false,

            platform:
                false,

            router:
                false,

            windowManager:
                false,

            launcher:
                false,

            storage:
                false,

            ai:
                false,

            language:
                false,

            voice:
                false,

            notifications:
                false,

            keyboard:
                false,

            diagnostics:
                false
        },

        statistics: {

            registered:
                0,

            initialized:
                0,

            starts:
                0,

            opens:
                0,

            closes:
                0,

            stops:
                0,

            activations:
                0,

            deactivations:
                0,

            errors:
                0,

            settingsChanges:
                0,

            platformConnections:
                0,

            runtimeConnections:
                0
        }
    };


    /* ========================================================
       PUBLIC API HOLDER

       The 31-master file contains the API methods throughout
       the module. Keep one stable object so all integrations
       share the same manager instance.
       ======================================================== */

    const api = {};


    /* ========================================================
       06 — LOGGING
       ======================================================== */

    function log(
        ...args
    ) {

        try {

            console.log(
                "[HalDo App Manager]",
                ...args
            );

        } catch (_) {}
    }
    function warn(
        ...args
    ) {

        try {

            console.warn(
                "[HalDo App Manager]",
                ...args
            );

        } catch (_) {}
    }


    function errorLog(
        ...args
    ) {

        try {

            console.error(
                "[HalDo App Manager]",
                ...args
            );

        } catch (_) {}
    }


    function reportError(
        error,
        source = "unknown"
    ) {

        state.statistics.errors +=
            1;

        state.failed =
            false;

        errorLog(
            source,
            error
        );

        dispatch(
            "haldo:app-manager-error",
            {

                manager:
                    api,

                source,

                error
            }
        );


        const diagnostics =
            getDiagnostics();

        if (
            diagnostics &&
            hasMethod(
                diagnostics,
                "reportError"
            )
        ) {

            try {

                diagnostics.reportError(
                    error,
                    {
                        source:
                            "app-manager",

                        subsystem:
                            source
                    }
                );

            } catch (_) {}
        }
    }


    /* ========================================================
       07 — EVENT BUS
       ======================================================== */

    function on(
        event,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return () => {};
        }


        const key =
            String(
                event || ""
            ).trim();


        if (!key) {

            return () => {};
        }


        if (
            !state.listeners.has(
                key
            )
        ) {

            state.listeners.set(
                key,
                new Set()
            );
        }


        const listeners =
            state.listeners.get(
                key
            );


        listeners.add(
            callback
        );


        return () => {

            listeners.delete(
                callback
            );
        };
    }


    function off(
        event,
        callback
    ) {

        const key =
            String(
                event || ""
            ).trim();


        const listeners =
            state.listeners.get(
                key
            );


        if (!listeners) {

            return false;
        }


        return listeners.delete(
            callback
        );
    }


    function emit(
        event,
        detail = {}
    ) {

        const key =
            String(
                event || ""
            ).trim();


        const listeners =
            state.listeners.get(
                key
            );


        if (
            listeners
        ) {

            [
                ...listeners
            ].forEach(
                callback => {

                    try {

                        callback(
                            detail
                        );

                    } catch (
                        exception
                    ) {

                        reportError(
                            exception,
                            "Event: " +
                            key
                        );
                    }
                }
            );
        }


        dispatch(
            "haldo:app-manager:" +
            key,
            detail
        );


        return true;
    }


    /* ========================================================
       08 — APP NORMALIZATION
       ======================================================== */

    function normalizeApp(
        definition
    ) {

        if (!definition) {

            return null;
        }
               /* ========================================================
           09 — APP NORMALIZATION
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
                normalizeId(
                    source.id ||
                    source.appId ||
                    source.key ||
                    source.slug
                );


            if (!id) {

                throw new Error(
                    "App besitzt keine gültige ID."
                );
            }


            const dependencies =
                Array.isArray(
                    source.dependencies
                )
                    ? [
                        ...source.dependencies
                    ]
                    : [];


            const permissions =
                Array.isArray(
                    source.permissions
                )
                    ? [
                        ...source.permissions
                    ]
                    : [];


            const capabilities =
                Array.isArray(
                    source.capabilities
                )
                    ? [
                        ...source.capabilities
                    ]
                    : [];


            const tags =
                Array.isArray(
                    source.tags
                )
                    ? [
                        ...source.tags
                    ]
                    : [];


            const categories =
                Array.isArray(
                    source.categories
                )
                    ? [
                        ...source.categories
                    ]
                    : (
                        source.category
                            ? [
                                source.category
                            ]
                            : []
                    );


            return {

                ...source,

                id,

                appId:
                    id,

                key:
                    source.key ||
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

                enabled:
                    source.enabled !==
                    false,

                visible:
                    source.visible !==
                    false,

                singleton:
                    source.singleton !==
                    false,

                dependencies,

                permissions,

                capabilities,

                tags,

                categories,

                lifecycle:
                    source.lifecycle ||
                    "registered",

                status:
                    source.status ||
                    "registered",

                route:
                    source.route ||
                    null,

                icon:
                    source.icon ||
                    null,

                metadata:
                    isObject(
                        source.metadata
                    )
                        ? clone(
                            source.metadata
                        )
                        : {},

                settings:
                    isObject(
                        source.settings
                    )
                        ? clone(
                            source.settings
                        )
                        : {},

                ...createTimestamp()
            };
        }


        /* ========================================================
           10 — INITIAL APP STATE
           ======================================================== */

        function createInitialState(
            appId
        ) {

            const id =
                normalizeId(
                    appId
                );


            if (!id) {

                return null;
            }


            if (
                !state.appState.has(
                    id
                )
            ) {

                state.appState.set(
                    id,
                    {

                        appId:
                            id,

                        lifecycle:
                            "registered",

                        status:
                            "registered",

                        loading:
                            false,

                        initialized:
                            false,

                        ready:
                            false,

                        started:
                            false,

                        open:
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

                        windowId:
                            null,

                        route:
                            null,

                        error:
                            null,

                        errorCount:
                            0,

                        createdAt:
                            now(),

                        updatedAt:
                            now()
                    }
                );
            }


            return state.appState.get(
                id
            );
        }


        function updateAppState(
            appId,
            changes = {}
        ) {

            const id =
                normalizeId(
                    appId
                );


            if (!id) {

                return null;
            }


            const current =
                createInitialState(
                    id
                );


            Object.assign(
                current,
                changes,
                {

                    appId:
                        id,

                    updatedAt:
                        now()

                }
            );


            state.appState.set(
                id,
                current
            );


            emit(
                "state-changed",
                {

                    appId:
                        id,

                    state:
                        clone(
                            current
                        )
                }
            );


            return clone(
                current
            );
        }


        function getAppState(
            appId
        ) {

            const id =
                normalizeId(
                    appId
                );


            if (!id) {

                return null;
            }


            return clone(
                createInitialState(
                    id
                )
            );
        }


        /* ========================================================
           11 — SERVICE CONNECTION HELPERS
           ======================================================== */

        function connectKernel() {

            const kernel =
                getKernel();


            if (!kernel) {

                return false;
            }


            state.connections.kernel =
                true;


            if (
                hasMethod(
                    kernel,
                    "on"
                )
            ) {

                const readyHandler =
                    detail => {

                        emit(
                            "kernel-ready",
                            detail
                        );
                    };


                const errorHandler =
                    detail => {

                        emit(
                            "kernel-error",
                            detail
                        );
                    };


                try {

                    kernel.on(
                        "ready",
                        readyHandler
                    );


                    kernel.on(
                        "error",
                        errorHandler
                    );


                    state.kernelListeners.push(
                        {

                            event:
                                "ready",

                            callback:
                                readyHandler
                        }
                    );


                    state.kernelListeners.push(
                        {

                            event:
                                "error",

                            callback:
                                errorHandler
                        }
                    );

                } catch (
                    exception
                ) {

                    reportError(
                        exception,
                        "Kernel Connection"
                    );
                }
            }


            return true;
        }


        function connectSystem() {

            const system =
                getSystem();


            if (!system) {

                return false;
            }


            state.connections.system =
                true;


            if (
                hasMethod(
                    system,
                    "on"
                )
            ) {

                const readyHandler =
                    detail => {

                        emit(
                            "system-ready",
                            detail
                        );
                    };


                try {

                    system.on(
                        "ready",
                        readyHandler
                    );


                    state.systemListeners.push(
                        {

                            event:
                                "ready",

                            callback:
                                readyHandler
                        }
                    );

                } catch (
                    exception
                ) {

                    reportError(
                        exception,
                        "System Connection"
                    );
                }
            }


            return true;
        }


        function connectRegistry() {

            const registry =
                getRegistry();


            if (!registry) {

                return false;
            }


            state.connections.registry =
                true;


            HalDoOS.appRegistry =
                registry;


            if (
                hasMethod(
                    registry,
                    "on"
                )
            ) {

                const events = [

                    "registered",
                    "unregistered",
                    "updated",
                    "enabled",
                    "disabled",
                    "error"

                ];


                events.forEach(
                    eventName => {

                        const callback =
                            detail => {

                                emit(
                                    "registry-" +
                                    eventName,
                                    detail
                                );
                            };


                        try {

                            registry.on(
                                eventName,
                                callback
                            );


                            state.registryListeners.push(
                                {

                                    event:
                                        eventName,

                                    callback:
                                        callback
                                }
                            );

                        } catch (
                            exception
                        ) {

                            reportError(
                                exception,
                                "Registry Connection"
                            );
                        }
                    }
                );
            }


            return true;
        }
           function connectContract() {

        const contract =
            getContract();


        if (!contract) {

            return false;
        }


        state.connections.contract =
            true;


        HalDoOS.appContract =
            contract;


        return true;
    }


    function connectRuntime() {

        const runtime =
            getRuntime();


        if (!runtime) {

            return false;
        }


        state.connections.runtime =
            true;


        HalDoOS.appRuntime =
            runtime;


        state.statistics.runtimeConnections +=
            1;


        if (
            hasMethod(
                runtime,
                "on"
            )
        ) {

            const events = [

                "app-mounted",
                "app-unmounted",
                "app-started",
                "app-stopped",
                "app-opened",
                "app-closed",
                "app-error",
                "state-changed"

            ];


            events.forEach(
                eventName => {

                    const callback =
                        detail => {

                            emit(
                                "runtime-" +
                                eventName,
                                detail
                            );
                        };


                    try {

                        runtime.on(
                            eventName,
                            callback
                        );


                        state.runtimeListeners.push(
                            {

                                event:
                                    eventName,

                                callback:
                                    callback
                            }
                        );

                    } catch (
                        exception
                    ) {

                        reportError(
                            exception,
                            "Runtime Connection"
                        );
                    }
                }
            );
        }


        return true;
    }


    function connectServices() {

        connectKernel();

        connectSystem();

        connectRegistry();

        connectContract();

        connectRuntime();


        state.connections.platform =
            !!getPlatform();


        state.connections.router =
            !!getRouter();


        state.connections.windowManager =
            !!getWindowManager();


        state.connections.launcher =
            !!getLauncher();


        state.connections.storage =
            !!getStorage();


        state.connections.ai =
            !!getAI();


        state.connections.language =
            !!getLanguage();


        state.connections.voice =
            !!getVoice();


        state.connections.notifications =
            !!getNotifications();


        state.connections.keyboard =
            !!getKeyboard();


        state.connections.diagnostics =
            !!getDiagnostics();


        HalDoOS.appManager =
            api;


        window.HalDoAppManager =
            api;


        return true;
    }


    /* ========================================================
       11 — REGISTRY ACCESS
       ======================================================== */


    function register(
        definition
    ) {

        let app;


        try {

            app =
                normalizeApp(
                    definition
                );

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Normalisierung"
            );

            return null;
        }


        const id =
            app.id;


        const registry =
            getRegistry();


        try {

            if (
                registry &&
                hasMethod(
                    registry,
                    "register"
                )
            ) {

                const result =
                    registry.register(
                        app
                    );


                if (
                    result &&
                    typeof result ===
                    "object"
                ) {

                    app =
                        normalizeApp(
                            result
                        );
                }
            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Registry Register"
            );
        }


        state.apps.set(
            id,
            app
        );


        createInitialState(
            id
        );


        state.statistics.registered +=
            1;


        emit(
            "registered",
            {

                app:
                    clone(app)
            }
        );


        dispatch(
            "haldo:app-registered",
            {

                app:
                    clone(app)
            }
        );


        return clone(
            app
        );
    }


    function registerApp(
        definition
    ) {

        return register(
            definition
        );
    }


    function unregister(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return false;
        }


        const registry =
            getRegistry();


        try {

            if (
                registry &&
                hasMethod(
                    registry,
                    "unregister"
                )
            ) {

                registry.unregister(
                    id
                );
            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Registry Unregister"
            );
        }


        state.apps.delete(
            id
        );


        state.appState.delete(
            id
        );


        state.settings.delete(
            id
        );


        state.contexts.delete(
            id
        );


        emit(
            "unregistered",
            {

                appId:
                    id
            }
        );


        dispatch(
            "haldo:app-unregistered",
            {

                appId:
                    id
            }
        );


        return true;
    }
      function getRegisteredApp(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );

        if (!id) {
            return null;
        }

        const local =
            state.apps.get(
                id
            );

        if (local) {
            return clone(
                local
            );
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

                const result =
                    registry.get(
                        id
                    );

                if (result) {

                    return clone(
                        normalizeApp(
                            result
                        )
                    );
                }

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "Registry Get"
                );
            }
        }

        return null;
    }


    function getApp(
        appId
    ) {

        return getRegisteredApp(
            appId
        );
    }


    function hasApp(
        appId
    ) {

        return !!getRegisteredApp(
            appId
        );
    }


    function getApps() {

        return Array.from(
            state.apps.values()
        ).map(
            clone
        );
    }


    function getRegisteredApps() {

        return getApps();
    }


    function getAppCount() {

        return state.apps.size;
    }


    /* ========================================================
       12 — APP SETTINGS
       ======================================================== */

    function getSettings(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );

        if (!id) {
            return {};
        }

        if (
            !state.settings.has(
                id
            )
        ) {

            const app =
                getRegisteredApp(
                    id
                );

            state.settings.set(
                id,
                isObject(
                    app &&
                    app.settings
                )
                    ? clone(
                        app.settings
                    )
                    : {}
            );
        }

        return clone(
            state.settings.get(
                id
            )
        );
    }


    function setSettings(
        appId,
        settings = {}
    ) {

        const id =
            normalizeId(
                appId
            );

        if (!id) {
            return false;
        }

        const current =
            getSettings(
                id
            );

        const next =
            isObject(
                settings
            )
                ? {
                    ...current,
                    ...clone(
                        settings
                    )
                }
                : current;

        state.settings.set(
            id,
            next
        );

        state.statistics.settingsChanges +=
            1;

        emit(
            "settings-changed",
            {
                appId:
                    id,

                settings:
                    clone(
                        next
                    )
            }
        );

        dispatch(
            "haldo:app-settings-changed",
            {
                appId:
                    id,

                settings:
                    clone(
                        next
                    )
            }
        );

        return clone(
            next
        );
    }


    function setAppSetting(
        appId,
        key,
        value
    ) {

        const settings =
            getSettings(
                appId
            );

        settings[
            String(
                key
            )
        ] =
            value;

        return setSettings(
            appId,
            settings
        );
    }


    function getAppSetting(
        appId,
        key,
        fallback = null
    ) {

        const settings =
            getSettings(
                appId
            );

        const name =
            String(
                key
            );

        return Object.prototype.hasOwnProperty.call(
            settings,
            name
        )
            ? settings[name]
            : fallback;
    }


    /* ========================================================
       13 — APP CONTEXT
       ======================================================== */

    function createContext(
        appId,
        context = {}
    ) {

        const id =
            normalizeId(
                appId
            );

        if (!id) {
            return null;
        }

        const current =
            state.contexts.get(
                id
            ) || {};

        const next =
            {
                ...current,
                ...(isObject(
                    context
                )
                    ? clone(
                        context
                    )
                    : {}),

                appId:
                    id,

                updatedAt:
                    now()
            };

        state.contexts.set(
            id,
            next
        );

        return clone(
            next
        );
    }


    function getContext(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );

        if (!id) {
            return null;
        }

        return clone(
            state.contexts.get(
                id
            ) || null
        );
    }


    function clearContext(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );

        if (!id) {
            return false;
        }

        return state.contexts.delete(
            id
        );
    }
           function getAll() {

        const result =
            [];


        state.apps.forEach(
            app => {

                result.push(
                    clone(app)
                );

            }
        );


        const registry =
            getRegistry();


        if (
            registry &&
            hasMethod(
                registry,
                "getAll"
            )
        ) {

            try {

                const registryApps =
                    registry.getAll();


                if (
                    Array.isArray(
                        registryApps
                    )
                ) {

                    registryApps.forEach(
                        item => {

                            try {

                                const normalized =
                                    normalizeApp(
                                        item
                                    );


                                if (
                                    !state.apps.has(
                                        normalized.id
                                    )
                                ) {

                                    state.apps.set(
                                        normalized.id,
                                        normalized
                                    );


                                    result.push(
                                        clone(
                                            normalized
                                        )
                                    );

                                }

                            } catch (_) {}

                        }
                    );

                }

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "Registry GetAll"
                );
            }

        }


        return result;
    }


    /* ========================================================
       12 — APP LOOKUP / SEARCH
       ======================================================== */

    function find(
        appId
    ) {

        return get(
            appId
        );
    }


    function exists(
        appId
    ) {

        return !!get(
            appId
        );
    }


    function search(
        query = "",
        options = {}
    ) {

        const text =
            String(
                query ?? ""
            )
                .trim()
                .toLowerCase();


        const category =
            options.category
                ? String(
                    options.category
                )
                    .trim()
                    .toLowerCase()
                : null;


        const tag =
            options.tag
                ? String(
                    options.tag
                )
                    .trim()
                    .toLowerCase()
                : null;


        return getAll()
            .filter(
                app => {

                    if (
                        options.enabledOnly ===
                        true &&
                        app.enabled ===
                        false
                    ) {

                        return false;
                    }


                    if (
                        options.visibleOnly ===
                        true &&
                        app.visible ===
                        false
                    ) {

                        return false;
                    }


                    if (
                        category
                    ) {

                        const categories =
                            Array.isArray(
                                app.categories
                            )
                                ? app.categories
                                : [];


                        if (
                            !categories.some(
                                value =>
                                    String(
                                        value
                                    )
                                        .toLowerCase() ===
                                    category
                            )
                        ) {

                            return false;
                        }
                    }


                    if (
                        tag
                    ) {

                        const tags =
                            Array.isArray(
                                app.tags
                            )
                                ? app.tags
                                : [];


                        if (
                            !tags.some(
                                value =>
                                    String(
                                        value
                                    )
                                        .toLowerCase() ===
                                    tag
                            )
                        ) {

                            return false;
                        }
                    }


                    if (!text) {

                        return true;
                    }


                    const searchable = [

                        app.id,

                        app.name,

                        app.title,

                        app.description,

                        app.version,

                        ...(Array.isArray(
                            app.tags
                        )
                            ? app.tags
                            : []),

                        ...(Array.isArray(
                            app.categories
                        )
                            ? app.categories
                            : [])

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return searchable.includes(
                        text
                    );

                }
            );
    }


    /* ========================================================
       13 — SETTINGS STORAGE FOUNDATION
       ======================================================== */

    function settingsKey(
        appId
    ) {

        return (
            "haldo.os.app.settings." +
            normalizeId(
                appId
            )
        );
    }


    function getSettings(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return {};
        }


        if (
            state.settings.has(
                id
            )
        ) {

            return clone(
                state.settings.get(
                    id
                )
            );
        }


        const storage =
            getStorage();


        let settings = {};


        if (
            storage &&
            hasMethod(
                storage,
                "get"
            )
        ) {

            try {

                const stored =
                    storage.get(
                        settingsKey(
                            id
                        )
                    );


                if (
                    isObject(
                        stored
                    )
                ) {

                    settings =
                        clone(
                            stored
                        );
                }

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "Settings Get"
                );
            }
        }


        state.settings.set(
            id,
            settings
        );


        return clone(
            settings
        );
    }


    function setSettings(
        appId,
        settings = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return false;
        }


        const normalized =
            isObject(
                settings
            )
                ? clone(
                    settings
                )
                : {};


        state.settings.set(
            id,
            normalized
        );


        const storage =
            getStorage();


        if (
            storage &&
            hasMethod(
                storage,
                "set"
            )
        ) {

            try {

                storage.set(
                    settingsKey(
                        id
                    ),
                    normalized
                );

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "Settings Set"
                );
            }
        }


        state.statistics.settingsChanges +=
            1;


        emit(
            "settings-changed",
            {

                appId:
                    id,

                settings:
                    clone(
                        normalized
                    )
            }
        );


        return true;
    }
           function getSettings(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return {};
        }


        if (
            !state.settings.has(
                id
            )
        ) {

            state.settings.set(
                id,
                {}
            );
        }


        return clone(
            state.settings.get(
                id
            )
        );

    }


    function setSettings(
        appId,
        changes = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return null;
        }


        const current =
            getSettings(
                id
            );


        const next = {

            ...current,

            ...(isObject(
                changes
            )
                ? changes
                : {})
        };


        state.settings.set(
            id,
            next
        );


        saveAppSettings(
            id,
            next
        );


        state.statistics.settingsChanges +=
            1;


        emit(
            "settings-changed",
            {

                appId:
                    id,

                settings:
                    clone(
                        next
                    )
            }
        );


        return clone(
            next
        );
    }


    function resetSettings(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return false;
        }


        state.settings.set(
            id,
            {}
        );


        saveAppSettings(
            id,
            {}
        );


        emit(
            "settings-reset",
            {

                appId:
                    id
            }
        );


        return true;
    }


    function saveAppSettings(
        appId,
        settings
    ) {

        const storage =
            getStorage();


        try {

            if (
                storage &&
                hasMethod(
                    storage,
                    "set"
                )
            ) {

                const result =
                    storage.set(
                        settingsKey(
                            appId
                        ),
                        clone(
                            settings
                        )
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    result.catch(
                        error =>
                            reportError(
                                error,
                                "App Settings Storage"
                            )
                    );
                }


                return true;
            }


            if (
                window.localStorage
            ) {

                window.localStorage.setItem(
                    settingsKey(
                        appId
                    ),
                    JSON.stringify(
                        settings || {}
                    )
                );


                return true;
            }


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Settings speichern"
            );
        }


        return false;
    }


    function loadAppSettings(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return {};
        }


        const storage =
            getStorage();


        try {

            if (
                storage &&
                hasMethod(
                    storage,
                    "get"
                )
            ) {

                const result =
                    storage.get(
                        settingsKey(
                            id
                        )
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    return result.then(
                        value => {

                            const settings =
                                isObject(
                                    value
                                )
                                    ? value
                                    : {};


                            state.settings.set(
                                id,
                                settings
                            );


                            return clone(
                                settings
                            );
                        }
                    );
                }


                const settings =
                    isObject(
                        result
                    )
                        ? result
                        : {};


                state.settings.set(
                    id,
                    settings
                );


                return clone(
                    settings
                );
            }


            if (
                window.localStorage
            ) {

                const raw =
                    window.localStorage.getItem(
                        settingsKey(
                            id
                        )
                    );


                if (!raw) {

                    return getSettings(
                        id
                    );
                }
                   /* ========================================================
       14 — APP CONTEXT
       ======================================================== */

    function createAppContext(
        app
    ) {

        if (!app) {
            return null;
        }

        const id =
            normalizeId(app.id);

        const context = {

            appId:
                id,

            app,

            manager:
                api,

            state:
                getAppState(id),

            settings:
                getSettings(id),

            services: {

                kernel:
                    getKernel(),

                system:
                    getSystem(),

                registry:
                    getRegistry(),

                contract:
                    getContract(),

                runtime:
                    getRuntime(),

                platform:
                    getPlatform(),

                router:
                    getRouter(),

                windowManager:
                    getWindowManager(),

                launcher:
                    getLauncher(),

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

                diagnostics:
                    getDiagnostics(),

                config:
                    getConfig()

            },

            emit(
                event,
                detail = {}
            ) {

                return emit(
                    event,
                    {

                        app,

                        appId:
                            id,

                        ...detail

                    }
                );
            },

            dispatch(
                event,
                detail = {}
            ) {

                dispatch(
                    event,
                    {

                        app,

                        appId:
                            id,

                        ...detail

                    }
                );
            },

            getState() {

                return getAppState(
                    id
                );
            },

            getSettings() {

                return getSettings(
                    id
                );
            },

            setSettings(
                changes
            ) {

                return setSettings(
                    id,
                    changes
                );
            },

            open(
                target,
                options = {}
            ) {

                return open(
                    target || id,
                    options
                );
            },

            close(
                target,
                options = {}
            ) {

                return close(
                    target || id,
                    options
                );
            },

            activate(
                target
            ) {

                return activate(
                    target || id
                );
            },

            minimize(
                target
            ) {

                return minimize(
                    target || id
                );
            },

            maximize(
                target
            ) {

                return maximize(
                    target || id
                );
            },

            restore(
                target
            ) {

                return restore(
                    target || id
                );
            },

            togglePIP(
                target
            ) {

                const targetId =
                    target || id;

                const current =
                    getAppState(
                        targetId
                    );

                return setPIP(
                    targetId,
                    !current?.pip
                );
            }

        };

        return context;
    }


    /* ========================================================
       15 — DEPENDENCY CHECK
       ======================================================== */

    function checkDependencies(
        app
    ) {

        const dependencies =
            Array.isArray(
                app?.dependencies
            )
                ? app.dependencies
                : [];

        const missing = [];

        dependencies.forEach(
            dependency => {

                if (
                    typeof dependency ===
                    "string"
                ) {

                    const id =
                        normalizeId(
                            dependency
                        );

                    if (
                        id &&
                        !hasApp(id)
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
                missing.length ===
                0,

            missing

        };
    }
                   /* ========================================================
       17 — APP INITIALIZATION
       ======================================================== */

    async function initializeApp(
        app
    ) {

        if (!app) {
            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        if (!id) {
            return false;
        }


        const current =
            createInitialState(
                id
            );


        if (
            current.initialized
        ) {

            return true;
        }


        if (
            state.instances.has(
                id
            ) &&
            state.instances.get(
                id
            )?.initializing
        ) {

            return true;
        }


        state.instances.set(
            id,
            {
                ...(state.instances.get(
                    id
                ) || {}),

                initializing:
                    true
            }
        );


        updateAppState(
            id,
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

            const loadedSettings =
                loadAppSettings(
                    id
                );


            const resolvedSettings =
                (
                    loadedSettings &&
                    typeof loadedSettings.then ===
                    "function"
                )
                    ? await loadedSettings
                    : loadedSettings;


            const context =
                createAppContext(
                    app
                );


            if (context) {

                state.contexts.set(
                    id,
                    context
                );
            }


            if (
                typeof app.init ===
                "function"
            ) {

                await safeAsyncResult(
                    app.init({

                        app,

                        manager:
                            api,

                        context,

                        settings:
                            resolvedSettings ||
                            getSettings(id),

                        state:
                            getAppState(id),

                        services:
                            context.services

                    })
                );
            }


            state.instances.set(
                id,
                {

                    ...(state.instances.get(
                        id
                    ) || {}),

                    initialized:
                        true,

                    initializing:
                        false,

                    started:
                        false,

                    createdAt:
                        state.instances.get(
                            id
                        )?.createdAt ||
                        now(),

                    initializedAt:
                        now()

                }
            );


            state.statistics.initialized +=
                1;


            updateAppState(
                id,
                {

                    lifecycle:
                        "initialized",

                    status:
                        "initialized",

                    loading:
                        false,

                    initialized:
                        true,

                    ready:
                        true,

                    error:
                        null

                }
            );


            emit(
                "app-initialized",
                {

                    app,

                    context:
                        state.contexts.get(
                            id
                        )

                }
            );


            dispatch(
                "haldo:app-initialized",
                {

                    app,

                    context:
                        state.contexts.get(
                            id
                        )

                }
            );


            return true;


        } catch (
            exception
        ) {

            const currentState =
                createInitialState(
                    id
                );


            state.instances.set(
                id,
                {

                    ...(state.instances.get(
                        id
                    ) || {}),

                    initializing:
                        false,

                    initialized:
                        false,

                    failed:
                        true,

                    error:
                        exception.message

                }
            );


            updateAppState(
                id,
                {

                    loading:
                        false,

                    status:
                        "error",

                    lifecycle:
                        "error",

                    initialized:
                        false,

                    ready:
                        false,

                    error:
                        exception.message,

                    errorCount:
                        (
                            currentState.errorCount ||
                            0
                        ) + 1

                }
            );


            reportError(
                exception,
                "App Initialisierung: " +
                id
            );


            emit(
                "app-initialization-error",
                {

                    app,

                    error:
                        exception

                }
            );


            return false;
        }
    }
                   /* ========================================================
       18 — START APP
       ======================================================== */

    async function startApp(
        app,
        options = {}
    ) {

        if (!app) {
            return false;
        }


        const initialized =
            await initializeApp(
                app
            );


        if (!initialized) {
            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        const instance =
            state.instances.get(
                id
            );


        if (
            instance &&
            instance.started
        ) {

            return true;
        }


        try {

            if (
                typeof app.start ===
                "function"
            ) {

                await safeAsyncResult(
                    app.start({

                        app,

                        manager:
                            api,

                        context:
                            state.contexts.get(
                                id
                            ),

                        options,

                        state:
                            getAppState(
                                id
                            )

                    })
                );
            }


            state.instances.set(
                id,
                {

                    ...(instance || {}),

                    initialized:
                        true,

                    started:
                        true,

                    failed:
                        false,

                    startedAt:
                        now()

                }
            );


            state.statistics.starts +=
                1;


            updateAppState(
                id,
                {

                    lifecycle:
                        "running",

                    status:
                        "running",

                    started:
                        true,

                    ready:
                        true

                }
            );


            emit(
                "app-started",
                {

                    app,

                    options

                }
            );


            dispatch(
                "haldo:app-started",
                {

                    app,

                    options

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Start: " +
                id
            );


            updateAppState(
                id,
                {

                    status:
                        "error",

                    lifecycle:
                        "error",

                    error:
                        exception.message

                }
            );


            return false;
        }
    }


    /* ========================================================
       19 — STOP APP
       ======================================================== */

    async function stopApp(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {
            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        const instance =
            state.instances.get(
                id
            );


        if (
            !instance ||
            !instance.started
        ) {

            return true;
        }


        try {

            if (
                typeof app.stop ===
                "function"
            ) {

                await safeAsyncResult(
                    app.stop({

                        app,

                        manager:
                            api,

                        context:
                            state.contexts.get(
                                id
                            ),

                        options

                    })
                );
            }


            state.instances.set(
                id,
                {

                    ...instance,

                    started:
                        false,

                    stoppedAt:
                        now()

                }
            );


            state.statistics.stops +=
                1;


            updateAppState(
                id,
                {

                    lifecycle:
                        "stopped",

                    status:
                        "stopped",

                    started:
                        false,

                    active:
                        false

                }
            );


            emit(
                "app-stopped",
                {

                    app,

                    options

                }
            );


            dispatch(
                "haldo:app-stopped",
                {

                    app,

                    options

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Stop: " +
                id
            );


            return false;
        }
    }


    /* ========================================================
       20 — ROUTER
       ======================================================== */

    function routeToApp(
        app,
        options = {}
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
                app.route &&
                hasMethod(
                    router,
                    "navigate"
                )
            ) {

                router.navigate(
                    app.route,
                    {

                        appId:
                            app.id,

                        source:
                            "app-manager",

                        ...options

                    }
                );


                return true;
            }


            if (
                hasMethod(
                    router,
                    "open"
                )
            ) {

                router.open(
                    app.id,
                    options
                );


                return true;
            }


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Router"
            );
        }


        return false;
    }
                  /* ========================================================
       21 — WINDOW
       ======================================================== */

    function createWindow(
        app,
        options = {}
    ) {

        const manager =
            getWindowManager();


        if (
            !manager ||
            !app
        ) {

            return null;
        }


        try {

            const config = {

                id:
                    options.windowId ||
                    "window-" +
                    app.id,

                appId:
                    app.id,

                title:
                    app.title ||
                    app.name ||
                    app.id,

                icon:
                    app.icon ||
                    "◈",

                singleton:
                    app.singleton !==
                    false,

                minimized:
                    options.minimized ===
                    true,

                maximized:
                    options.maximized ===
                    true,

                pip:
                    options.pip ===
                    true,

                ...options

            };


            if (
                hasMethod(
                    manager,
                    "open"
                )
            ) {

                return manager.open(
                    config
                );
            }


            if (
                hasMethod(
                    manager,
                    "createWindow"
                )
            ) {

                return manager.createWindow(
                    config
                );
            }


        } catch (
            exception
        ) {

            reportError(
                exception,
                "Window Manager"
            );
        }


        return null;
    }


    /* ========================================================
       22 — PLATFORM OPEN
       ======================================================== */

    async function platformOpen(
        appId,
        options = {}
    ) {

        const platform =
            getPlatform();


        if (
            !platform ||
            !hasMethod(
                platform,
                "openApp"
            )
        ) {

            return null;
        }


        try {

            return await safeAsyncResult(
                platform.openApp(
                    appId,
                    options
                )
            );


        } catch (
            exception
        ) {

            reportError(
                exception,
                "Platform App Open"
            );


            return null;
        }
    }


    /* ========================================================
       23 — OPEN APP
       ======================================================== */

    async function open(
        appId,
        options = {}
    ) {

        let app =
            get(
                appId
            );


        if (!app) {

            const platformResult =
                await platformOpen(
                    appId,
                    options
                );


            if (
                platformResult !==
                null
            ) {

                return platformResult;
            }


            reportError(
                new Error(
                    "App nicht gefunden: " +
                    appId
                ),
                "App Öffnen"
            );


            return null;
        }


        if (
            app.enabled ===
            false
        ) {

            warn(
                "App deaktiviert:",
                app.id
            );


            return null;
        }


        const dependencyStatus =
            checkDependencies(
                app
            );


        if (
            !dependencyStatus.valid
        ) {

            reportError(
                new Error(
                    "Fehlende Dependencies: " +
                    dependencyStatus.missing.join(
                        ", "
                    )
                ),
                "App Dependencies"
            );


            return null;
        }


        const permissionStatus =
            checkPermissions(
                app,
                options
            );


        if (
            permissionStatus &&
            permissionStatus.pending
        ) {

            try {

                const resolved =
                    await permissionStatus.pending;


                if (
                    resolved &&
                    resolved.valid ===
                    false &&
                    options.ignorePermissions !==
                    true
                ) {

                    emit(
                        "permission-required",
                        {

                            app,

                            permissions:
                                resolved

                        }
                    );


                    return null;
                }


            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "App Permissions"
                );
            }
        }


        if (
            permissionStatus &&
            permissionStatus.valid ===
            false &&
            options.ignorePermissions !==
            true
        ) {

            emit(
                "permission-required",
                {

                    app,

                    permissions:
                        permissionStatus

                }
            );


            if (
                !getPlatform()
            ) {

                reportError(
                    new Error(
                        "Fehlende App-Berechtigungen: " +
                        permissionStatus.missing.join(
                            ", "
                        )
                    ),
                    "App Permissions"
                );


                return null;
            }
        }


        const current =
            createInitialState(
                app.id
            );


        if (
            app.singleton !==
            false &&
            current.open
        ) {

            await activate(
                app.id
            );


            return {

                app,

                state:
                    getAppState(
                        app.id
                    ),

                existing:
                    true,

                window:
                    current.windowId
                        ? {
                            id:
                                current.windowId
                        }
                        : null

            };
        }


        updateAppState(
            app.id,
            {

                loading:
                    true,

                lifecycle:
                    "opening",

                status:
                    "opening"

            }
        );
                   emit(
                "app-activated",
                {

                    app

                }
            );


            dispatch(
                "haldo:app-activated",
                {

                    app

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Aktivierung: " +
                id
            );


            return false;
        }
    }


    /* ========================================================
       25 — DEACTIVATE
       ======================================================== */

    async function deactivate(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        try {

            if (
                typeof app.deactivate ===
                "function"
            ) {

                await safeAsyncResult(
                    app.deactivate({

                        app,

                        manager:
                            api,

                        context:
                            state.contexts.get(
                                id
                            )

                    })
                );
            }


            updateAppState(
                id,
                {

                    active:
                        false,

                    status:
                        "open",

                    lifecycle:
                        "open"

                }
            );


            state.statistics.deactivations +=
                1;


            emit(
                "app-deactivated",
                {

                    app

                }
            );


            dispatch(
                "haldo:app-deactivated",
                {

                    app

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Deaktivierung: " +
                id
            );


            return false;
        }
    }


    function deactivateOtherApps(
        activeAppId
    ) {

        const activeId =
            normalizeId(
                activeAppId
            );


        state.apps.forEach(
            app => {

                const id =
                    normalizeId(
                        app.id
                    );


                if (
                    id &&
                    id !== activeId
                ) {

                    const appState =
                        createInitialState(
                            id
                        );


                    if (
                        appState.active
                    ) {

                        deactivate(
                            id
                        );

                    }

                }

            }
        );
    }


    /* ========================================================
       26 — CLOSE
       ======================================================== */

    async function close(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        const current =
            createInitialState(
                id
            );


        if (
            !current.open
        ) {

            return true;
        }


        try {

            if (
                typeof app.close ===
                "function"
            ) {

                await safeAsyncResult(
                    app.close({

                        app,

                        manager:
                            api,

                        context:
                            state.contexts.get(
                                id
                            ),

                        options

                    })
                );
            }


            const manager =
                getWindowManager();


            if (
                manager &&
                current.windowId
            ) {

                if (
                    hasMethod(
                        manager,
                        "close"
                    )
                ) {

                    await safeAsyncResult(
                        manager.close(
                            current.windowId
                        )
                    );

                }

            }


            updateAppState(
                id,
                {

                    lifecycle:
                        "closed",

                    status:
                        "closed",

                    loading:
                        false,

                    open:
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

                    windowId:
                        null

                }
            );


            if (
                state.activeAppId ===
                id
            ) {

                state.activeAppId =
                    null;
            }


            state.statistics.closes +=
                1;


            emit(
                "app-closed",
                {

                    app,

                    options

                }
            );


            dispatch(
                "haldo:app-closed",
                {

                    app,

                    options

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Schließen: " +
                id
            );


            return false;
        }
    }


    function closeApp(
        appId,
        options
    ) {

        return close(
            appId,
            options
        );
    }
          /* ========================================================
       25 — DEACTIVATE OTHER APPS
       ======================================================== */

    function deactivateOtherApps(
        activeAppId
    ) {

        const activeId =
            normalizeId(
                activeAppId
            );


        state.appState.forEach(
            (
                appState,
                id
            ) => {

                if (
                    id ===
                    activeId
                ) {

                    return;
                }


                if (
                    !appState.open &&
                    !appState.active
                ) {

                    return;
                }


                updateAppState(
                    id,
                    {

                        active:
                            false

                    }
                );


                const app =
                    get(
                        id
                    );


                if (
                    app &&
                    typeof app.deactivate ===
                    "function"
                ) {

                    try {

                        const result =
                            app.deactivate({

                                app,

                                manager:
                                    api,

                                context:
                                    state.contexts.get(
                                        id
                                    )

                            });


                        if (
                            result &&
                            typeof result.then ===
                            "function"
                        ) {

                            result.catch(
                                exception =>
                                    reportError(
                                        exception,
                                        "App Deactivate: " +
                                        id
                                    )
                            );
                        }

                    } catch (
                        exception
                    ) {

                        reportError(
                            exception,
                            "App Deactivate: " +
                            id
                        );
                    }
                }

            }
        );


        state.statistics.deactivations +=
            1;
    }


    /* ========================================================
       26 — MINIMIZE
       ======================================================== */

    async function minimize(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        const appState =
            createInitialState(
                id
            );


        if (
            !appState.open
        ) {

            return false;
        }


        try {

            const manager =
                getWindowManager();


            if (
                manager &&
                appState.windowId
            ) {

                if (
                    hasMethod(
                        manager,
                        "minimize"
                    )
                ) {

                    await safeAsyncResult(
                        manager.minimize(
                            appState.windowId
                        )
                    );

                } else if (
                    hasMethod(
                        manager,
                        "setMinimized"
                    )
                ) {

                    await safeAsyncResult(
                        manager.setMinimized(
                            appState.windowId,
                            true
                        )
                    );
                }
            }


            if (
                typeof app.minimize ===
                "function"
            ) {

                await safeAsyncResult(
                    app.minimize({

                        app,

                        manager:
                            api,

                        context:
                            state.contexts.get(
                                id
                            )

                    })
                );
            }


            updateAppState(
                id,
                {

                    minimized:
                        true,

                    active:
                        false,

                    visible:
                        true,

                    lifecycle:
                        "minimized",

                    status:
                        "minimized"

                }
            );


            if (
                state.activeAppId ===
                id
            ) {

                state.activeAppId =
                    null;
            }


            state.statistics.minimizations +=
                1;


            emit(
                "app-minimized",
                {

                    app

                }
            );


            dispatch(
                "haldo:app-minimized",
                {

                    app

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Minimieren: " +
                id
            );


            return false;
        }
    }


    /* ========================================================
       27 — MAXIMIZE
       ======================================================== */

    async function maximize(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        const appState =
            createInitialState(
                id
            );


        if (
            !appState.open
        ) {

            return false;
        }


        try {

            const manager =
                getWindowManager();


            if (
                manager &&
                appState.windowId
            ) {

                if (
                    hasMethod(
                        manager,
                        "maximize"
                    )
                ) {

                    await safeAsyncResult(
                        manager.maximize(
                            appState.windowId
                        )
                    );

                } else if (
                    hasMethod(
                        manager,
                        "setMaximized"
                    )
                ) {

                    await safeAsyncResult(
                        manager.setMaximized(
                            appState.windowId,
                            true
                        )
                    );
                }
            }


            if (
                typeof app.maximize ===
                "function"
            ) {

                await safeAsyncResult(
                    app.maximize({

                        app,

                        manager:
                            api,

                        context:
                            state.contexts.get(
                                id
                            )

                    })
                );
            }


            updateAppState(
                id,
                {

                    maximized:
                        true,

                    minimized:
                        false,

                    active:
                        true,

                    visible:
                        true,

                    lifecycle:
                        "maximized",

                    status:
                        "maximized"

                }
            );


            state.activeAppId =
                id;


            state.statistics.maximizations +=
                1;


            emit(
                "app-maximized",
                {

                    app

                }
            );


            dispatch(
                "haldo:app-maximized",
                {

                    app

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Maximieren: " +
                id
            );


            return false;
        }
    }
           /* ========================================================
       28 — RESTORE
       ======================================================== */

    async function restore(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        const appState =
            createInitialState(
                id
            );


        if (
            !appState.open
        ) {

            return false;
        }


        try {

            const manager =
                getWindowManager();


            if (
                manager &&
                appState.windowId
            ) {

                if (
                    hasMethod(
                        manager,
                        "restore"
                    )
                ) {

                    await safeAsyncResult(
                        manager.restore(
                            appState.windowId
                        )
                    );

                } else if (
                    hasMethod(
                        manager,
                        "setMinimized"
                    )
                ) {

                    await safeAsyncResult(
                        manager.setMinimized(
                            appState.windowId,
                            false
                        )
                    );
                }


                if (
                    hasMethod(
                        manager,
                        "setMaximized"
                    )
                ) {

                    await safeAsyncResult(
                        manager.setMaximized(
                            appState.windowId,
                            false
                        )
                    );
                }
            }


            if (
                typeof app.restore ===
                "function"
            ) {

                await safeAsyncResult(
                    app.restore({

                        app,

                        manager:
                            api,

                        context:
                            state.contexts.get(
                                id
                            )

                    })
                );
            }


            updateAppState(
                id,
                {

                    minimized:
                        false,

                    maximized:
                        false,

                    active:
                        true,

                    visible:
                        true,

                    lifecycle:
                        "active",

                    status:
                        "active"

                }
            );


            state.activeAppId =
                id;


            deactivateOtherApps(
                id
            );


            emit(
                "app-restored",
                {

                    app

                }
            );


            dispatch(
                "haldo:app-restored",
                {

                    app

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Wiederherstellen: " +
                id
            );


            return false;
        }
    }


    /* ========================================================
       29 — PIP
       ======================================================== */

    async function setPIP(
        appId,
        enabled = true
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        const appState =
            createInitialState(
                id
            );


        if (
            !appState.open
        ) {

            return false;
        }


        try {

            const manager =
                getWindowManager();


            if (
                manager &&
                appState.windowId
            ) {

                if (
                    hasMethod(
                        manager,
                        "setPIP"
                    )
                ) {

                    await safeAsyncResult(
                        manager.setPIP(
                            appState.windowId,
                            enabled === true
                        )
                    );

                } else if (
                    enabled === true &&
                    hasMethod(
                        manager,
                        "pip"
                    )
                ) {

                    await safeAsyncResult(
                        manager.pip(
                            appState.windowId
                        )
                    );
                }
            }


            if (
                typeof app.setPIP ===
                "function"
            ) {

                await safeAsyncResult(
                    app.setPIP({

                        app,

                        enabled:
                            enabled === true,

                        manager:
                            api,

                        context:
                            state.contexts.get(
                                id
                            )

                    })
                );
            }


            updateAppState(
                id,
                {

                    pip:
                        enabled === true,

                    active:
                        enabled === true ||
                        appState.active,

                    visible:
                        true,

                    lifecycle:
                        enabled === true
                            ? "pip"
                            : "active",

                    status:
                        enabled === true
                            ? "pip"
                            : "active"

                }
            );


            state.statistics.pipChanges +=
                1;


            emit(
                "app-pip-changed",
                {

                    app,

                    enabled:
                        enabled === true

                }
            );


            dispatch(
                "haldo:app-pip-changed",
                {

                    app,

                    enabled:
                        enabled === true

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App PIP: " +
                id
            );


            return false;
        }
    }
           /* ========================================================
       30 — CLOSE APP
       ======================================================== */

    async function close(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        const appState =
            createInitialState(
                id
            );


        if (
            !appState.open
        ) {

            return true;
        }


        updateAppState(
            id,
            {

                lifecycle:
                    "closing",

                status:
                    "closing",

                loading:
                    true

            }
        );


        try {

            if (
                typeof app.close ===
                "function"
            ) {

                await safeAsyncResult(
                    app.close({

                        app,

                        manager:
                            api,

                        context:
                            state.contexts.get(
                                id
                            ),

                        options

                    })
                );
            }


            const manager =
                getWindowManager();


            if (
                manager &&
                appState.windowId
            ) {

                if (
                    hasMethod(
                        manager,
                        "close"
                    )
                ) {

                    await safeAsyncResult(
                        manager.close(
                            appState.windowId
                        )
                    );

                } else if (
                    hasMethod(
                        manager,
                        "closeWindow"
                    )
                ) {

                    await safeAsyncResult(
                        manager.closeWindow(
                            appState.windowId
                        )
                    );
                }
            }


            await stopApp(
                id,
                options
            );


            updateAppState(
                id,
                {

                    lifecycle:
                        "closed",

                    status:
                        "closed",

                    loading:
                        false,

                    open:
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

                    windowId:
                        null

                }
            );


            if (
                state.activeAppId ===
                id
            ) {

                state.activeAppId =
                    null;
            }


            state.statistics.closes +=
                1;


            state.statistics.activations +=
                0;


            emit(
                "app-closed",
                {

                    app,

                    options

                }
            );


            dispatch(
                "haldo:app-closed",
                {

                    app,

                    options

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Schließen: " +
                id
            );


            updateAppState(
                id,
                {

                    loading:
                        false,

                    status:
                        "error",

                    lifecycle:
                        "error",

                    error:
                        exception.message

                }
            );


            return false;
        }
    }


    function closeApp(
        appId,
        options
    ) {

        return close(
            appId,
            options
        );
    }


    /* ========================================================
       31 — RESTART APP
       ======================================================== */

    async function restart(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        try {

            await close(
                app.id,
                {

                    ...options,

                    restart:
                        true

                }
            );


            return !!(
                await open(
                    app.id,
                    options
                )
            );


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Neustart: " +
                app.id
            );


            return false;
        }
    }


    /* ========================================================
       32 — REFRESH APP
       ======================================================== */

    async function refresh(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        try {

            if (
                typeof app.refresh ===
                "function"
            ) {

                await safeAsyncResult(
                    app.refresh({

                        app,

                        manager:
                            api,

                        context:
                            state.contexts.get(
                                id
                            ),

                        options,

                        state:
                            getAppState(
                                id
                            )

                    })
                );


            } else {

                await restart(
                    id,
                    options
                );
            }


            emit(
                "app-refreshed",
                {

                    app,

                    options

                }
            );


            dispatch(
                "haldo:app-refreshed",
                {

                    app,

                    options

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Refresh: " +
                id
            );


            return false;
        }
    }
           /* ========================================================
       33 — APP UPDATE
       ======================================================== */

    async function update(
        appId,
        changes = {},
        options = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        const previous =
            {
                ...app
            };


        try {

            if (
                typeof app.update ===
                "function"
            ) {

                await safeAsyncResult(
                    app.update({

                        app,

                        changes,

                        options,

                        manager:
                            api,

                        context:
                            state.contexts.get(
                                id
                            )

                    })
                );
            }


            Object.assign(
                app,
                changes
            );


            emit(
                "app-updated",
                {

                    app,

                    previous,

                    changes,

                    options

                }
            );


            dispatch(
                "haldo:app-updated",
                {

                    app,

                    previous,

                    changes,

                    options

                }
            );


            return app;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Update: " +
                id
            );


            return false;
        }
    }


    /* ========================================================
       34 — APP DESTROY
       ======================================================== */

    async function destroy(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        try {

            if (
                getAppState(
                    id
                ).open
            ) {

                await close(
                    id,
                    options
                );
            }


            if (
                typeof app.destroy ===
                "function"
            ) {

                await safeAsyncResult(
                    app.destroy({

                        app,

                        manager:
                            api,

                        context:
                            state.contexts.get(
                                id
                            ),

                        options

                    })
                );
            }


            state.contexts.delete(
                id
            );


            state.instances.delete(
                id
            );


            state.appState.delete(
                id
            );


            state.settings.delete(
                id
            );


            emit(
                "app-destroyed",
                {

                    app,

                    options

                }
            );


            dispatch(
                "haldo:app-destroyed",
                {

                    app,

                    options

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Destroy: " +
                id
            );


            return false;
        }
    }


    /* ========================================================
       35 — GET APP STATE
       ======================================================== */

    function getState(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return null;
        }


        return getAppState(
            id
        );
    }


    /* ========================================================
       36 — GET APP CONTEXT
       ======================================================== */

    function getContext(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return null;
        }


        return (
            state.contexts.get(
                id
            ) ||
            null
        );
    }


    /* ========================================================
       37 — GET APP SETTINGS
       ======================================================== */

    function getAppSettings(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return {};
        }


        return getSettings(
            id
        );
    }


    /* ========================================================
       38 — SET APP SETTINGS
       ======================================================== */

    function setAppSettings(
        appId,
        changes = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return false;
        }


        return setSettings(
            id,
            changes
        );
    }
           /* ========================================================
       39 — APP CAPABILITIES
       ======================================================== */

    function getCapabilities(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return [];
        }


        const capabilities =
            app.capabilities;


        if (
            Array.isArray(
                capabilities
            )
        ) {

            return [
                ...capabilities
            ];
        }


        if (
            isObject(
                capabilities
            )
        ) {

            return Object.keys(
                capabilities
            ).filter(
                key =>
                    capabilities[key] !==
                    false
            );
        }


        return [];
    }


    /* ========================================================
       40 — HAS CAPABILITY
       ======================================================== */

    function hasCapability(
        appId,
        capability
    ) {

        const normalized =
            String(
                capability ||
                ""
            )
                .trim()
                .toLowerCase();


        if (!normalized) {

            return false;
        }


        return getCapabilities(
            appId
        )
            .map(
                value =>
                    String(
                        value
                    )
                        .trim()
                        .toLowerCase()
            )
            .includes(
                normalized
            );
    }


    /* ========================================================
       41 — GET APP SERVICE
       ======================================================== */

    function getAppService(
        appId,
        serviceName
    ) {

        const context =
            getContext(
                appId
            );


        if (
            !context ||
            !context.services
        ) {

            return null;
        }


        const key =
            String(
                serviceName ||
                ""
            )
                .trim();


        if (!key) {

            return null;
        }


        return (
            context.services[key] ||
            null
        );
    }


    /* ========================================================
       42 — CALL APP METHOD
       ======================================================== */

    async function call(
        appId,
        method,
        ...args
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            throw new Error(
                "App nicht gefunden: " +
                appId
            );
        }


        const methodName =
            String(
                method ||
                ""
            )
                .trim();


        if (!methodName) {

            throw new Error(
                "App-Methode fehlt."
            );
        }


        if (
            typeof app[
                methodName
            ] !==
            "function"
        ) {

            throw new Error(
                "App-Methode nicht gefunden: " +
                methodName
            );
        }


        return safeAsyncResult(
            app[
                methodName
            ](
                ...args
            )
        );
    }


    /* ========================================================
       43 — EXECUTE APP COMMAND
       ======================================================== */

    async function execute(
        appId,
        command,
        payload = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return null;
        }


        try {

            if (
                typeof app.execute ===
                "function"
            ) {

                return await safeAsyncResult(
                    app.execute({

                        app,

                        command,

                        payload,

                        manager:
                            api,

                        context:
                            getContext(
                                appId
                            )

                    })
                );
            }


            if (
                typeof app.command ===
                "function"
            ) {

                return await safeAsyncResult(
                    app.command(
                        command,
                        payload
                    )
                );
            }


            return null;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Command: " +
                appId
            );


            return null;
        }
    }


    /* ========================================================
       44 — APP HEALTH
       ======================================================== */

    function health(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return {

                exists:
                    false,

                healthy:
                    false,

                appId:
                    normalizeId(
                        appId
                    ),

                reason:
                    "not-found"

            };
        }


        const appState =
            getAppState(
                app.id
            );


        const instance =
            state.instances.get(
                normalizeId(
                    app.id
                )
            ) ||
            {};


        const errors =
            Number(
                appState?.errorCount ||
                0
            );


        return {

            exists:
                true,

            healthy:
                errors === 0 &&
                appState?.status !==
                    "error" &&
                instance?.failed !==
                    true,

            appId:
                normalizeId(
                    app.id
                ),

            initialized:
                appState?.initialized ===
                true,

            ready:
                appState?.ready ===
                true,

            started:
                instance?.started ===
                true,

            open:
                appState?.open ===
                true,

            active:
                appState?.active ===
                true,

            errors

        };
    }


    /* ========================================================
       45 — APP DIAGNOSTICS
       ======================================================== */

    function diagnostics(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const app =
            get(
                id
            );


        const appState =
            id
                ? getAppState(
                    id
                )
                : null;


        const context =
            id
                ? getContext(
                    id
                )
                : null;


        const instance =
            id
                ? (
                    state.instances.get(
                        id
                    ) ||
                    null
                )
                : null;


        return {

            timestamp:
                now(),

            appId:
                id,

            exists:
                !!app,

            app:
                app
                    ? clone(app)
                    : null,

            state:
                appState
                    ? clone(
                        appState
                    )
                    : null,

            instance:
                instance
                    ? clone(
                        instance
                    )
                    : null,

            hasContext:
                !!context,

            capabilities:
                id
                    ? getCapabilities(
                        id
                    )
                    : [],

            health:
                id
                    ? health(
                        id
                    )
                    : null

        };
    }
           /* ========================================================
       46 — LIST OPEN APPS
       ======================================================== */

    function getOpenApps() {

        const result = [];


        state.appState.forEach(
            (
                appState,
                id
            ) => {

                if (
                    appState &&
                    appState.open
                ) {

                    const app =
                        get(
                            id
                        );


                    if (app) {

                        result.push(
                            {

                                app,

                                state:
                                    appState

                            }
                        );
                    }
                }
            }
        );


        return result;
    }


    /* ========================================================
       47 — LIST ACTIVE APPS
       ======================================================== */

    function getActiveApps() {

        const result = [];


        state.appState.forEach(
            (
                appState,
                id
            ) => {

                if (
                    appState &&
                    appState.active
                ) {

                    const app =
                        get(
                            id
                        );


                    if (app) {

                        result.push(
                            {

                                app,

                                state:
                                    appState

                            }
                        );
                    }
                }
            }
        );


        return result;
    }


    /* ========================================================
       48 — LIST RUNNING APPS
       ======================================================== */

    function getRunningApps() {

        const result = [];


        state.instances.forEach(
            (
                instance,
                id
            ) => {

                if (
                    instance &&
                    instance.started
                ) {

                    const app =
                        get(
                            id
                        );


                    if (app) {

                        result.push(
                            {

                                app,

                                instance,

                                state:
                                    getAppState(
                                        id
                                    )

                            }
                        );
                    }
                }
            }
        );


        return result;
    }


    /* ========================================================
       49 — ACTIVATE NEXT APP
       ======================================================== */

    async function activateNext() {

        const openApps =
            getOpenApps();


        if (
            openApps.length ===
            0
        ) {

            return null;
        }


        const currentId =
            state.activeAppId;


        let index =
            openApps.findIndex(
                item =>
                    normalizeId(
                        item.app.id
                    ) ===
                    currentId
            );


        index =
            index < 0
                ? 0
                : (
                    index + 1
                ) %
                openApps.length;


        const target =
            openApps[
                index
            ];


        if (!target) {

            return null;
        }


        await activate(
            target.app.id
        );


        return target.app;
    }


    /* ========================================================
       50 — ACTIVATE PREVIOUS APP
       ======================================================== */

    async function activatePrevious() {

        const openApps =
            getOpenApps();


        if (
            openApps.length ===
            0
        ) {

            return null;
        }


        const currentId =
            state.activeAppId;


        let index =
            openApps.findIndex(
                item =>
                    normalizeId(
                        item.app.id
                    ) ===
                    currentId
            );


        index =
            index < 0
                ? 0
                : (
                    index - 1 +
                    openApps.length
                ) %
                openApps.length;


        const target =
            openApps[
                index
            ];


        if (!target) {

            return null;
        }


        await activate(
            target.app.id
        );


        return target.app;
    }


    /* ========================================================
       51 — CLOSE ALL
       ======================================================== */

    async function closeAll(
        options = {}
    ) {

        const openApps =
            getOpenApps();


        const results = [];


        for (
            const item of openApps
        ) {

            try {

                const result =
                    await close(
                        item.app.id,
                        options
                    );


                results.push(
                    {

                        app:
                            item.app,

                        success:
                            result

                    }
                );


            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "Close All"
                );


                results.push(
                    {

                        app:
                            item.app,

                        success:
                            false,

                        error:
                            exception.message

                    }
                );
            }
        }


        return results;
    }


    /* ========================================================
       52 — STOP ALL
       ======================================================== */

    async function stopAll(
        options = {}
    ) {

        const runningApps =
            getRunningApps();


        const results = [];


        for (
            const item of runningApps
        ) {

            try {

                const result =
                    await stopApp(
                        item.app.id,
                        options
                    );


                results.push(
                    {

                        app:
                            item.app,

                        success:
                            result

                    }
                );


            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "Stop All"
                );


                results.push(
                    {

                        app:
                            item.app,

                        success:
                            false,

                        error:
                            exception.message

                    }
                );
            }
        }


        return results;
    }
           /* ========================================================
       53 — REFRESH ALL
       ======================================================== */

    async function refreshAll(
        options = {}
    ) {

        const apps =
            list();


        const results = [];


        for (
            const app of apps
        ) {

            try {

                const result =
                    await refresh(
                        app.id,
                        options
                    );


                results.push(
                    {

                        app,

                        success:
                            result

                    }
                );


            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "Refresh All"
                );


                results.push(
                    {

                        app,

                        success:
                            false,

                        error:
                            exception.message

                    }
                );
            }
        }


        return results;
    }


    /* ========================================================
       54 — GET STATISTICS
       ======================================================== */

    function getStatistics() {

        return {

            ...state.statistics,

            registered:
                state.apps.size,

            states:
                state.appState.size,

            contexts:
                state.contexts.size,

            instances:
                state.instances.size,

            open:
                getOpenApps().length,

            active:
                getActiveApps().length,

            running:
                getRunningApps().length,

            activeAppId:
                state.activeAppId,

            timestamp:
                now()

        };
    }


    /* ========================================================
       55 — RESET APP STATE
       ======================================================== */

    function resetAppState(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return false;
        }


        const current =
            createInitialState(
                id
            );


        const preserved = {

            id,

            registered:
                current.registered,

            initialized:
                false,

            ready:
                false,

            started:
                false,

            open:
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

            loading:
                false,

            lifecycle:
                "idle",

            status:
                "idle",

            error:
                null,

            errorCount:
                current.errorCount ||
                0,

            windowId:
                null,

            route:
                null,

            updatedAt:
                now()

        };


        state.appState.set(
            id,
            preserved
        );


        state.instances.delete(
            id
        );


        state.contexts.delete(
            id
        );


        if (
            state.activeAppId ===
            id
        ) {

            state.activeAppId =
                null;
        }


        emit(
            "app-state-reset",
            {

                appId:
                    id,

                state:
                    preserved

            }
        );


        dispatch(
            "haldo:app-state-reset",
            {

                appId:
                    id,

                state:
                    preserved

            }
        );


        return true;
    }


    /* ========================================================
       56 — GET ACTIVE APP
       ======================================================== */

    function getActiveApp() {

        if (
            !state.activeAppId
        ) {

            return null;
        }


        return get(
            state.activeAppId
        ) || null;
    }


    /* ========================================================
       57 — GET ACTIVE APP STATE
       ======================================================== */

    function getActiveAppState() {

        if (
            !state.activeAppId
        ) {

            return null;
        }


        return getAppState(
            state.activeAppId
        );
    }


    /* ========================================================
       58 — FIND APPS
       ======================================================== */

    function find(
        query,
        options = {}
    ) {

        const apps =
            list();


        const value =
            String(
                query ||
                ""
            )
                .trim()
                .toLowerCase();


        if (!value) {

            return apps;
        }


        const fields =
            Array.isArray(
                options.fields
            )
                ? options.fields
                : [

                    "id",

                    "name",

                    "title",

                    "description",

                    "category",

                    "keywords"

                ];


        return apps.filter(
            app => {

                return fields.some(
                    field => {

                        const fieldValue =
                            app?.[field];


                        if (
                            Array.isArray(
                                fieldValue
                            )
                        ) {

                            return fieldValue
                                .some(
                                    item =>
                                        String(
                                            item
                                        )
                                            .toLowerCase()
                                            .includes(
                                                value
                                            )
                                );
                        }


                        return String(
                            fieldValue ??
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            );
                    }
                );
            }
        );
    }
           /* ========================================================
       59 — FIND ONE APP
       ======================================================== */

    function findOne(
        query
    ) {

        const results =
            find(
                query
            );


        return (
            results[0] ||
            null
        );
    }


    /* ========================================================
       60 — APP VERSION
       ======================================================== */

    function getVersion(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return null;
        }


        return (
            app.version ||
            app.appVersion ||
            "1.0.0"
        );
    }


    /* ========================================================
       61 — APP METADATA
       ======================================================== */

    function getMetadata(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return null;
        }


        return {

            id:
                app.id,

            name:
                app.name ||
                app.id,

            title:
                app.title ||
                app.name ||
                app.id,

            description:
                app.description ||
                "",

            version:
                getVersion(
                    app.id
                ),

            icon:
                app.icon ||
                null,

            category:
                app.category ||
                null,

            route:
                app.route ||
                null,

            enabled:
                app.enabled !==
                false,

            singleton:
                app.singleton !==
                false,

            dependencies:
                Array.isArray(
                    app.dependencies
                )
                    ? [
                        ...app.dependencies
                    ]
                    : [],

            permissions:
                Array.isArray(
                    app.permissions
                )
                    ? [
                        ...app.permissions
                    ]
                    : [],

            capabilities:
                getCapabilities(
                    app.id
                ),

            state:
                getAppState(
                    app.id
                )

        };
    }


    /* ========================================================
       62 — APP SNAPSHOT
       ======================================================== */

    function snapshot(
        appId
    ) {

        const metadata =
            getMetadata(
                appId
            );


        if (!metadata) {

            return null;
        }


        const context =
            getContext(
                appId
            );


        const instance =
            state.instances.get(
                normalizeId(
                    appId
                )
            ) ||
            null;


        return {

            timestamp:
                now(),

            metadata,

            instance,

            context:
                context
                    ? {

                        appId:
                            context.appId,

                        serviceNames:
                            Object.keys(
                                context.services ||
                                {}
                            )

                    }
                    : null

        };
    }


    /* ========================================================
       63 — BROADCAST APP EVENT
       ======================================================== */

    function broadcast(
        event,
        appId,
        detail = {}
    ) {

        const app =
            appId
                ? get(
                    appId
                )
                : null;


        const payload = {

            app,

            appId:
                app
                    ? app.id
                    : (
                        appId ||
                        null
                    ),

            timestamp:
                now(),

            ...detail

        };


        emit(
            event,
            payload
        );


        dispatch(
            "haldo:" +
            event,
            payload
        );


        return payload;
    }


    /* ========================================================
       64 — SEND MESSAGE TO APP
       ======================================================== */

    async function sendMessage(
        appId,
        message,
        payload = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        try {

            if (
                typeof app.onMessage ===
                "function"
            ) {

                return await safeAsyncResult(
                    app.onMessage({

                        app,

                        message,

                        payload,

                        manager:
                            api,

                        context:
                            getContext(
                                appId
                            )

                    })
                );
            }


            if (
                typeof app.handleMessage ===
                "function"
            ) {

                return await safeAsyncResult(
                    app.handleMessage(
                        message,
                        payload
                    )
                );
            }


            return false;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Message: " +
                appId
            );


            return false;
        }
    }


    /* ========================================================
       65 — BROADCAST TO OPEN APPS
       ======================================================== */

    async function broadcastToOpenApps(
        message,
        payload = {}
    ) {

        const openApps =
            getOpenApps();


        const results = [];


        for (
            const item of openApps
        ) {

            try {

                const result =
                    await sendMessage(
                        item.app.id,
                        message,
                        payload
                    );


                results.push(
                    {

                        app:
                            item.app,

                        result

                    }
                );


            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "Broadcast Open Apps"
                );


                results.push(
                    {

                        app:
                            item.app,

                        result:
                            false,

                        error:
                            exception.message

                    }
                );
            }
        }


        return results;
    }
           /* ========================================================
       66 — BROADCAST ALL APPS
       ======================================================== */

    async function broadcastAll(
        message,
        payload = {}
    ) {

        const apps =
            list();


        const results = [];


        for (
            const app of apps
        ) {

            try {

                const result =
                    await sendMessage(
                        app.id,
                        message,
                        payload
                    );


                results.push(
                    {

                        app,

                        result

                    }
                );


            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "Broadcast All Apps"
                );


                results.push(
                    {

                        app,

                        result:
                            false,

                        error:
                            exception.message

                    }
                );
            }
        }


        return results;
    }


    /* ========================================================
       67 — APP LIFECYCLE HOOK
       ======================================================== */

    async function lifecycle(
        appId,
        hook,
        payload = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        const hookName =
            String(
                hook ||
                ""
            )
                .trim();


        if (!hookName) {

            return false;
        }


        const fn =
            app[
                hookName
            ];


        if (
            typeof fn !==
            "function"
        ) {

            return false;
        }


        try {

            return await safeAsyncResult(
                fn.call(
                    app,
                    {

                        app,

                        manager:
                            api,

                        context:
                            getContext(
                                appId
                            ),

                        payload,

                        state:
                            getAppState(
                                appId
                            )

                    }
                )
            );


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Lifecycle: " +
                appId +
                " / " +
                hookName
            );


            return false;
        }
    }


    /* ========================================================
       68 — APP VISIBILITY
       ======================================================== */

    async function setVisible(
        appId,
        visible = true
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        const value =
            visible === true;


        try {

            const manager =
                getWindowManager();


            const appState =
                getAppState(
                    id
                );


            if (
                manager &&
                appState.windowId
            ) {

                if (
                    hasMethod(
                        manager,
                        "setVisible"
                    )
                ) {

                    await safeAsyncResult(
                        manager.setVisible(
                            appState.windowId,
                            value
                        )
                    );

                } else if (
                    value &&
                    hasMethod(
                        manager,
                        "show"
                    )
                ) {

                    await safeAsyncResult(
                        manager.show(
                            appState.windowId
                        )
                    );

                } else if (
                    !value &&
                    hasMethod(
                        manager,
                        "hide"
                    )
                ) {

                    await safeAsyncResult(
                        manager.hide(
                            appState.windowId
                        )
                    );
                }
            }


            if (
                typeof app.setVisible ===
                "function"
            ) {

                await safeAsyncResult(
                    app.setVisible({

                        app,

                        visible:
                            value,

                        manager:
                            api,

                        context:
                            getContext(
                                id
                            )

                    })
                );
            }


            updateAppState(
                id,
                {

                    visible:
                        value

                }
            );


            emit(
                "app-visibility-changed",
                {

                    app,

                    visible:
                        value

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Sichtbarkeit: " +
                id
            );


            return false;
        }
    }


    /* ========================================================
       69 — FOCUS APP
       ======================================================== */

    async function focus(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        try {

            const appState =
                getAppState(
                    id
                );


            const manager =
                getWindowManager();


            if (
                manager &&
                appState.windowId
            ) {

                if (
                    hasMethod(
                        manager,
                        "focus"
                    )
                ) {

                    await safeAsyncResult(
                        manager.focus(
                            appState.windowId
                        )
                    );

                } else if (
                    hasMethod(
                        manager,
                        "focusWindow"
                    )
                ) {

                    await safeAsyncResult(
                        manager.focusWindow(
                            appState.windowId
                        )
                    );

                } else if (
                    hasMethod(
                        manager,
                        "focusApp"
                    )
                ) {

                    await safeAsyncResult(
                        manager.focusApp(
                            id
                        )
                    );
                }
            }


            await activate(
                id
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Focus: " +
                id
            );


            return false;
        }
    }


    /* ========================================================
       70 — APP WINDOW
       ======================================================== */

    function getWindow(
        appId
    ) {

        const appState =
            getAppState(
                appId
            );


        if (
            !appState ||
            !appState.windowId
        ) {

            return null;
        }


        const manager =
            getWindowManager();


        if (!manager) {

            return null;
        }


        try {

            if (
                hasMethod(
                    manager,
                    "getWindow"
                )
            ) {

                return manager.getWindow(
                    appState.windowId
                );
            }


            if (
                manager.windows instanceof
                Map
            ) {

                return manager.windows.get(
                    appState.windowId
                ) || null;
            }


            return null;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "Get App Window"
            );


            return null;
        }
    }
           /* ========================================================
       71 — UPDATE WINDOW
       ======================================================== */

    async function updateWindow(
        appId,
        changes = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        const appState =
            getAppState(
                app.id
            );


        if (
            !appState.windowId
        ) {

            return false;
        }


        const manager =
            getWindowManager();


        if (!manager) {

            return false;
        }


        try {

            if (
                hasMethod(
                    manager,
                    "update"
                )
            ) {

                await safeAsyncResult(
                    manager.update(
                        appState.windowId,
                        changes
                    )
                );

            } else if (
                hasMethod(
                    manager,
                    "updateWindow"
                )
            ) {

                await safeAsyncResult(
                    manager.updateWindow(
                        appState.windowId,
                        changes
                    )
                );

            } else {

                return false;
            }


            emit(
                "app-window-updated",
                {

                    app,

                    windowId:
                        appState.windowId,

                    changes

                }
            );


            dispatch(
                "haldo:app-window-updated",
                {

                    app,

                    windowId:
                        appState.windowId,

                    changes

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "Update App Window"
            );


            return false;
        }
    }


    /* ========================================================
       72 — WINDOW STATE SYNC
       ======================================================== */

    function syncWindowState(
        appId,
        windowState = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return false;
        }


        const current =
            getAppState(
                id
            );


        updateAppState(
            id,
            {

                minimized:
                    windowState.minimized ===
                    true,

                maximized:
                    windowState.maximized ===
                    true,

                pip:
                    windowState.pip ===
                    true,

                visible:
                    windowState.visible !==
                    false,

                active:
                    windowState.active ===
                    true,

                windowId:
                    windowState.id ||
                    windowState.windowId ||
                    current.windowId

            }
        );


        emit(
            "app-window-state-synced",
            {

                appId:
                    id,

                windowState:

                    {
                        ...windowState
                    }

            }
        );


        dispatch(
            "haldo:app-window-state-synced",
            {

                appId:
                    id,

                windowState:

                    {
                        ...windowState
                    }

            }
        );


        return true;
    }


    /* ========================================================
       73 — APP DATA
       ======================================================== */

    function getAppData(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return null;
        }


        const id =
            normalizeId(
                app.id
            );


        const data =
            state.data &&
            state.data.get
                ? state.data.get(
                    id
                )
                : null;


        return (
            data ||
            {}
        );
    }


    /* ========================================================
       74 — SET APP DATA
       ======================================================== */

    function setAppData(
        appId,
        data = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return false;
        }


        if (
            !state.data ||
            typeof state.data.set !==
            "function"
        ) {

            state.data =
                new Map();
        }


        const previous =
            state.data.get(
                id
            ) ||
            {};


        const next =
            {

                ...previous,

                ...(
                    isObject(
                        data
                    )
                        ? data
                        : {}
                ),

                updatedAt:
                    now()

            };


        state.data.set(
            id,
            next
        );


        emit(
            "app-data-changed",
            {

                appId:
                    id,

                data:
                    next,

                previous

            }
        );


        dispatch(
            "haldo:app-data-changed",
            {

                appId:
                    id,

                data:
                    next,

                previous

            }
        );


        return next;
    }


    /* ========================================================
       75 — CLEAR APP DATA
       ======================================================== */

    function clearAppData(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return false;
        }


        if (
            !state.data ||
            typeof state.data.delete !==
            "function"
        ) {

            return true;
        }


        const result =
            state.data.delete(
                id
            );


        emit(
            "app-data-cleared",
            {

                appId:
                    id

            }
        );


        dispatch(
            "haldo:app-data-cleared",
            {

                appId:
                    id

            }
        );


        return result;
    }
           /* ========================================================
       76 — APP PERMISSIONS
       ======================================================== */

    function getPermissions(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return [];
        }

        if (
            Array.isArray(
                app.permissions
            )
        ) {

            return [
                ...app.permissions
            ];
        }

        if (
            isObject(
                app.permissions
            )
        ) {

            return Object.keys(
                app.permissions
            ).filter(
                key =>
                    app.permissions[key] !==
                    false
            );
        }

        return [];
    }


    /* ========================================================
       77 — CHECK PERMISSION
       ======================================================== */

    function hasPermission(
        appId,
        permission
    ) {

        const value =
            String(
                permission ||
                ""
            )
                .trim()
                .toLowerCase();

        if (!value) {
            return false;
        }

        return getPermissions(
            appId
        )
            .some(
                item =>
                    String(
                        item
                    )
                        .trim()
                        .toLowerCase() ===
                    value
            );
    }


    /* ========================================================
       78 — GRANT PERMISSION
       ======================================================== */

    function grantPermission(
        appId,
        permission
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const value =
            String(
                permission ||
                ""
            )
                .trim();

        if (!value) {
            return false;
        }

        if (
            !Array.isArray(
                app.permissions
            )
        ) {

            app.permissions =
                [];
        }

        if (
            !app.permissions.includes(
                value
            )
        ) {

            app.permissions.push(
                value
            );
        }

        emit(
            "app-permission-granted",
            {

                app,

                permission:
                    value

            }
        );

        return true;
    }


    /* ========================================================
       79 — REVOKE PERMISSION
       ======================================================== */

    function revokePermission(
        appId,
        permission
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const value =
            String(
                permission ||
                ""
            )
                .trim()
                .toLowerCase();

        if (!value) {
            return false;
        }

        if (
            !Array.isArray(
                app.permissions
            )
        ) {

            return false;
        }

        const before =
            app.permissions.length;

        app.permissions =
            app.permissions.filter(
                item =>
                    String(
                        item
                    )
                        .trim()
                        .toLowerCase() !==
                    value
            );

        const changed =
            app.permissions.length !==
            before;

        if (changed) {

            emit(
                "app-permission-revoked",
                {

                    app,

                    permission:
                        permission

                }
            );
        }

        return changed;
    }


    /* ========================================================
       80 — APP DEPENDENCIES
       ======================================================== */

    function getDependencies(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return [];
        }

        if (
            Array.isArray(
                app.dependencies
            )
        ) {

            return [
                ...app.dependencies
            ];
        }

        if (
            isObject(
                app.dependencies
            )
        ) {

            return Object.keys(
                app.dependencies
            );
        }

        return [];
    }


    /* ========================================================
       81 — DEPENDENCY STATUS
       ======================================================== */

    function getDependencyStatus(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {

            return {

                valid:
                    false,

                missing:
                    [
                        normalizeId(
                            appId
                        )
                    ],

                dependencies:
                    []

            };
        }

        const dependencies =
            getDependencies(
                app.id
            );

        const missing =
            [];

        const available =
            [];

        for (
            const dependency of
            dependencies
        ) {

            const dependencyId =
                typeof dependency ===
                "string"
                    ? dependency
                    : (
                        dependency?.id ||
                        dependency?.appId ||
                        ""
                    );

            if (!dependencyId) {
                continue;
            }

            const dependencyApp =
                get(
                    dependencyId
                );

            if (dependencyApp) {

                available.push(
                    dependencyId
                );

            } else {

                missing.push(
                    dependencyId
                );
            }
        }

        return {

            valid:
                missing.length ===
                0,

            missing,

            available,

            dependencies

        };
    }


    /* ========================================================
       82 — ENSURE DEPENDENCIES
       ======================================================== */

    async function ensureDependencies(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const dependencies =
            getDependencies(
                app.id
            );

        if (
            dependencies.length ===
            0
        ) {

            return true;
        }

        for (
            const dependency of
            dependencies
        ) {

            const dependencyId =
                typeof dependency ===
                "string"
                    ? dependency
                    : (
                        dependency?.id ||
                        dependency?.appId ||
                        ""
                    );

            if (!dependencyId) {
                continue;
            }

            const dependencyApp =
                get(
                    dependencyId
                );

            if (!dependencyApp) {

                reportError(
                    new Error(
                        "Dependency nicht gefunden: " +
                        dependencyId
                    ),
                    "App Dependencies"
                );

                return false;
            }

            const dependencyState =
                getAppState(
                    dependencyId
                );

            if (
                options.startDependencies ===
                false
            ) {

                continue;
            }

            if (
                !dependencyState.started
            ) {

                const started =
                    await startApp(
                        dependencyApp,
                        {

                            ...options,

                            dependency:
                                true

                        }
                    );

                if (!started) {
                    return false;
                }
            }
        }

        return true;
    }
           /* ========================================================
       83 — APP READY
       ======================================================== */

    function isReady(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return false;
        }


        const appState =
            getAppState(
                id
            );


        return (
            appState.ready ===
            true
        );
    }


    /* ========================================================
       84 — WAIT UNTIL READY
       ======================================================== */

    async function waitUntilReady(
        appId,
        options = {}
    ) {

        const timeout =
            Number(
                options.timeout ||
                10000
            );


        const interval =
            Number(
                options.interval ||
                50
            );


        const startedAt =
            now();


        while (
            now() -
            startedAt <
            timeout
        ) {

            if (
                isReady(
                    appId
                )
            ) {

                return true;
            }


            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        interval
                    )
            );
        }


        return isReady(
            appId
        );
    }


    /* ========================================================
       85 — APP ENABLE
       ======================================================== */

    function enable(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        app.enabled =
            true;


        updateAppState(
            app.id,
            {

                status:
                    "enabled"

            }
        );


        emit(
            "app-enabled",
            {

                app

            }
        );


        dispatch(
            "haldo:app-enabled",
            {

                app

            }
        );


        return true;
    }


    /* ========================================================
       86 — APP DISABLE
       ======================================================== */

    async function disable(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        try {

            if (
                getAppState(
                    app.id
                ).open
            ) {

                await close(
                    app.id,
                    options
                );
            }


            app.enabled =
                false;


            updateAppState(
                app.id,
                {

                    status:
                        "disabled",

                    lifecycle:
                        "disabled",

                    open:
                        false,

                    active:
                        false,

                    visible:
                        false

                }
            );


            emit(
                "app-disabled",
                {

                    app

                }
            );


            dispatch(
                "haldo:app-disabled",
                {

                    app

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Disable"
            );


            return false;
        }
    }


    /* ========================================================
       87 — APP INSTALL HOOK
       ======================================================== */

    async function install(
        app,
        options = {}
    ) {

        if (!app) {

            return false;
        }


        try {

            if (
                typeof app.install ===
                "function"
            ) {

                await safeAsyncResult(
                    app.install({

                        app,

                        manager:
                            api,

                        options

                    })
                );
            }


            const registered =
                register(
                    app
                );


            if (!registered) {

                return false;
            }


            emit(
                "app-installed",
                {

                    app,

                    options

                }
            );


            dispatch(
                "haldo:app-installed",
                {

                    app,

                    options

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Installation"
            );


            return false;
        }
    }


    /* ========================================================
       88 — APP UNINSTALL
       ======================================================== */

    async function uninstall(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;
        }


        const id =
            normalizeId(
                app.id
            );


        try {

            await destroy(
                id,
                options
            );


            if (
                typeof app.uninstall ===
                "function"
            ) {

                await safeAsyncResult(
                    app.uninstall({

                        app,

                        manager:
                            api,

                        options

                    })
                );
            }


            const removed =
                unregister(
                    id
                );


            emit(
                "app-uninstalled",
                {

                    app,

                    options,

                    removed

                }
            );


            dispatch(
                "haldo:app-uninstalled",
                {

                    app,

                    options,

                    removed

                }
            );


            return removed;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Uninstall"
            );


            return false;
        }
    }
           /* ========================================================
       89 — APP EXPORT
       ======================================================== */

    function exportApp(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {

            return null;
        }

        return {

            ...app,

            managerState:
                snapshot(
                    app.id
                ),

            exportedAt:
                now()

        };
    }


    /* ========================================================
       90 — APP IMPORT
       ======================================================== */

    function importApp(
        definition,
        options = {}
    ) {

        if (
            !definition ||
            !isObject(
                definition
            )
        ) {

            return false;
        }

        const app =
            {
                ...definition
            };

        if (
            !app.id &&
            app.appId
        ) {

            app.id =
                app.appId;
        }

        if (!app.id) {

            return false;
        }

        if (
            options.clone === true
        ) {

            app.id =
                normalizeId(
                    app.id +
                    "-" +
                    Date.now()
                );
        }

        return register(
            app
        );
    }


    /* ========================================================
       91 — APP RELOAD
       ======================================================== */

    async function reload(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {

            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        const wasOpen =
            getAppState(
                id
            ).open ===
            true;

        try {

            if (wasOpen) {

                await close(
                    id,
                    {
                        ...options,

                        reload:
                            true
                    }
                );
            }


            await destroy(
                id,
                {
                    ...options,

                    reload:
                        true
                }
            );


            resetAppState(
                id
            );


            const initialized =
                await initializeApp(
                    app
                );

            if (!initialized) {

                return false;
            }


            if (
                options.start !==
                false
            ) {

                const started =
                    await startApp(
                        app,
                        {
                            ...options,

                            reload:
                                true
                        }
                    );

                if (!started) {

                    return false;
                }
            }


            if (
                wasOpen &&
                options.open !==
                false
            ) {

                const opened =
                    await open(
                        id,
                        {
                            ...options,

                            reload:
                                true
                        }
                    );

                return !!opened;
            }


            emit(
                "app-reloaded",
                {

                    app,

                    options,

                    state:
                        getAppState(
                            id
                        )

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Reload: " +
                id
            );


            return false;
        }
    }
           /* ========================================================
       93 — APP UPDATE
       ======================================================== */

    async function updateApp(
        appId,
        changes = {},
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {

            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        const previous =
            {
                ...app
            };

        try {

            if (
                typeof changes !==
                "object" ||
                changes === null
            ) {

                return false;
            }

            Object.assign(
                app,
                changes
            );

            app.id =
                id;

            if (
                typeof app.update ===
                "function"
            ) {

                await safeAsyncResult(
                    app.update({

                        app,

                        manager:
                            api,

                        context:
                            getContext(
                                id
                            ),

                        previous,

                        changes,

                        options

                    })
                );
            }

            updateAppState(
                id,
                {

                    updatedAt:
                        now()

                }
            );

            emit(
                "app-updated",
                {

                    app,

                    previous,

                    changes,

                    options

                }
            );

            dispatch(
                "haldo:app-updated",
                {

                    app,

                    previous,

                    changes,

                    options

                }
            );

            return true;

        } catch (
            exception
        ) {

            Object.keys(
                app
            ).forEach(
                key => {

                    delete app[key];

                }
            );

            Object.assign(
                app,
                previous
            );

            reportError(
                exception,
                "App Update: " +
                id
            );

            return false;
        }
    }


    /* ========================================================
       94 — APP REPLACE
       ======================================================== */

    async function replace(
        appId,
        definition,
        options = {}
    ) {

        const oldApp =
            get(
                appId
            );

        if (!oldApp) {

            return importApp(
                definition,
                options
            );
        }

        const id =
            normalizeId(
                oldApp.id
            );

        const wasOpen =
            getAppState(
                id
            ).open ===
            true;

        try {

            if (wasOpen) {

                await close(
                    id,
                    {
                        ...options,

                        replace:
                            true

                    }
                );
            }

            await destroy(
                id,
                {
                    ...options,

                    replace:
                        true

                }
            );

            const removed =
                unregister(
                    id
                );

            if (
                removed ===
                false
            ) {

                return false;
            }

            const nextApp =
                {

                    ...(
                        isObject(
                            definition
                        )
                            ? definition
                            : {}
                    ),

                    id

                };

            const registered =
                register(
                    nextApp
                );

            if (!registered) {

                return false;
            }

            if (
                options.initialize !==
                false
            ) {

                const initialized =
                    await initializeApp(
                        nextApp
                    );

                if (!initialized) {

                    return false;
                }
            }

            if (
                options.start ===
                true
            ) {

                const started =
                    await startApp(
                        nextApp,
                        options
                    );

                if (!started) {

                    return false;
                }
            }

            if (
                wasOpen &&
                options.open !==
                false
            ) {

                const opened =
                    await open(
                        id,
                        options
                    );

                return !!opened;
            }

            emit(
                "app-replaced",
                {

                    previous:
                        oldApp,

                    app:
                        nextApp,

                    options

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Replace: " +
                id
            );

            return false;
        }
    }


    /* ========================================================
       95 — APP CLONE
       ======================================================== */

    function cloneApp(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {

            return null;
        }

        const sourceId =
            normalizeId(
                app.id
            );

        const cloneId =
            normalizeId(
                options.id ||
                (
                    sourceId +
                    "-copy-" +
                    Date.now()
                )
            );

        const copy =
            clone(
                app
            );

        copy.id =
            cloneId;

        if (
            options.name
        ) {

            copy.name =
                options.name;
        }

        if (
            options.title
        ) {

            copy.title =
                options.title;
        }

        copy.enabled =
            options.enabled !==
            undefined
                ? options.enabled
                : app.enabled !==
                    false;

        return copy;
    }


    /* ========================================================
       96 — REGISTER CLONED APP
       ======================================================== */

    function cloneAndRegister(
        appId,
        options = {}
    ) {

        const copy =
            cloneApp(
                appId,
                options
            );

        if (!copy) {

            return null;
        }

        const registered =
            register(
                copy
            );

        if (!registered) {

            return null;
        }

        emit(
            "app-cloned",
            {

                source:
                    get(
                        appId
                    ),

                app:
                    copy,

                options

            }
        );

        return copy;
    }


    /* ========================================================
       97 — APP CONFIGURATION
       ======================================================== */

    function configure(
        appId,
        configuration = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {

            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        if (
            !isObject(
                configuration
            )
        ) {

            return false;
        }

        if (
            !isObject(
                app.configuration
            )
        ) {

            app.configuration =
                {};
        }

        const previous =
            {
                ...app.configuration
            };

        Object.assign(
            app.configuration,
            configuration
        );

        emit(
            "app-configured",
            {

                app,

                appId:
                    id,

                configuration:
                    app.configuration,

                previous

            }
        );

        dispatch(
            "haldo:app-configured",
            {

                app,

                appId:
                    id,

                configuration:
                    app.configuration,

                previous

            }
        );

        return true;
    }
           /* ========================================================
       98 — GET CONFIGURATION
       ======================================================== */

    function getConfiguration(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {

            return {};
        }

        return {

            ...(isObject(
                app.configuration
            )
                ? app.configuration
                : {})

        };
    }


    /* ========================================================
       99 — SET FEATURE
       ======================================================== */

    function setFeature(
        appId,
        feature,
        enabled = true
    ) {

        const app =
            get(
                appId
            );

        if (!app) {

            return false;
        }

        const name =
            String(
                feature ||
                ""
            )
                .trim();

        if (!name) {

            return false;
        }

        if (
            !isObject(
                app.features
            )
        ) {

            app.features =
                {};
        }

        app.features[name] =
            enabled ===
            true;

        emit(
            "app-feature-changed",
            {

                app,

                feature:
                    name,

                enabled:
                    app.features[name]

            }
        );

        return true;
    }


    /* ========================================================
       100 — HAS FEATURE
       ======================================================== */

    function hasFeature(
        appId,
        feature
    ) {

        const app =
            get(
                appId
            );

        if (!app) {

            return false;
        }

        const name =
            String(
                feature ||
                ""
            )
                .trim();

        if (!name) {

            return false;
        }

        return (
            app.features &&
            app.features[name] ===
            true
        );
    }


    /* ========================================================
       101 — GET FEATURES
       ======================================================== */

    function getFeatures(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {

            return {};
        }

        return {

            ...(isObject(
                app.features
            )
                ? app.features
                : {})

        };
    }


    /* ========================================================
       102 — APP CATEGORY
       ======================================================== */

    function getCategory(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {

            return null;
        }

        return (
            app.category ||
            app.type ||
            "application"
        );
    }


    /* ========================================================
       103 — APPS BY CATEGORY
       ======================================================== */

    function getByCategory(
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

        return list().filter(
            app =>
                String(
                    app.category ||
                    app.type ||
                    ""
                )
                    .trim()
                    .toLowerCase() ===
                value
        );
    }


    /* ========================================================
       104 — APPS BY CAPABILITY
       ======================================================== */

    function getByCapability(
        capability
    ) {

        const value =
            String(
                capability ||
                ""
            )
                .trim()
                .toLowerCase();

        if (!value) {

            return [];
        }

        return list().filter(
            app =>
                getCapabilities(
                    app.id
                )
                    .some(
                        item =>
                            String(
                                item
                            )
                                .trim()
                                .toLowerCase() ===
                            value
                    )
        );
    }


    /* ========================================================
       105 — APPS BY PERMISSION
       ======================================================== */

    function getByPermission(
        permission
    ) {

        const value =
            String(
                permission ||
                ""
            )
                .trim()
                .toLowerCase();

        if (!value) {

            return [];
        }

        return list().filter(
            app =>
                getPermissions(
                    app.id
                )
                    .some(
                        item =>
                            String(
                                item
                            )
                                .trim()
                                .toLowerCase() ===
                            value
                    )
        );
    }
           /* ========================================================
       106 — APP SEARCH
       ======================================================== */

    function search(
        query,
        options = {}
    ) {

        const value =
            String(
                query ||
                ""
            )
                .trim()
                .toLowerCase();

        const apps =
            list();

        if (!value) {

            return options.limit
                ? apps.slice(
                    0,
                    Number(
                        options.limit
                    )
                )
                : apps;
        }

        const results =
            apps
                .map(
                    app => {

                        let score =
                            0;

                        const id =
                            String(
                                app.id ||
                                ""
                            )
                                .toLowerCase();

                        const name =
                            String(
                                app.name ||
                                ""
                            )
                                .toLowerCase();

                        const title =
                            String(
                                app.title ||
                                ""
                            )
                                .toLowerCase();

                        const description =
                            String(
                                app.description ||
                                ""
                            )
                                .toLowerCase();

                        const category =
                            String(
                                app.category ||
                                ""
                            )
                                .toLowerCase();


                        if (
                            id === value
                        ) {

                            score +=
                                1000;

                        } else if (
                            id.includes(
                                value
                            )
                        ) {

                            score +=
                                500;
                        }


                        if (
                            name === value
                        ) {

                            score +=
                                900;

                        } else if (
                            name.includes(
                                value
                            )
                        ) {

                            score +=
                                450;
                        }


                        if (
                            title === value
                        ) {

                            score +=
                                850;

                        } else if (
                            title.includes(
                                value
                            )
                        ) {

                            score +=
                                400;
                        }


                        if (
                            description.includes(
                                value
                            )
                        ) {

                            score +=
                                100;
                        }


                        if (
                            category.includes(
                                value
                            )
                        ) {

                            score +=
                                150;
                        }


                        const keywords =
                            Array.isArray(
                                app.keywords
                            )
                                ? app.keywords
                                : [];


                        for (
                            const keyword of
                            keywords
                        ) {

                            if (
                                String(
                                    keyword
                                )
                                    .toLowerCase()
                                    .includes(
                                        value
                                    )
                            ) {

                                score +=
                                    200;
                            }
                        }


                        return {

                            app,

                            score

                        };
                    }
                )
                .filter(
                    item =>
                        item.score >
                        0
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        b.score -
                        a.score
                );


        const limit =
            Number(
                options.limit ||
                0
            );


        return limit > 0
            ? results
                .slice(
                    0,
                    limit
                )
                .map(
                    item =>
                        item.app
                )
            : results.map(
                item =>
                    item.app
            );
    }


    /* ========================================================
       107 — APP SORT
       ======================================================== */

    function sortApps(
        apps,
        field = "name",
        direction = "asc"
    ) {

        const source =
            Array.isArray(
                apps
            )
                ? [
                    ...apps
                ]
                : list();


        const factor =
            String(
                direction
            )
                .toLowerCase() ===
            "desc"
                ? -1
                : 1;


        return source.sort(
            (
                a,
                b
            ) => {

                const left =
                    String(
                        a?.[field] ??
                        ""
                    )
                        .toLowerCase();


                const right =
                    String(
                        b?.[field] ??
                        ""
                    )
                        .toLowerCase();


                if (
                    left <
                    right
                ) {

                    return -1 *
                        factor;
                }


                if (
                    left >
                    right
                ) {

                    return 1 *
                        factor;
                }


                return 0;
            }
        );
    }


    /* ========================================================
       108 — APP GROUPS
       ======================================================== */

    function groupBy(
        field
    ) {

        const groups =
            {};


        for (
            const app of list()
        ) {

            const key =
                String(
                    app?.[field] ??
                    "other"
                )
                    .trim() ||
                "other";


            if (
                !groups[key]
            ) {

                groups[key] =
                    [];
            }


            groups[key].push(
                app
            );
        }


        return groups;
    }


    /* ========================================================
       109 — APP REGISTRY SYNC
       ======================================================== */

    function syncRegistry(
        options = {}
    ) {

        const registry =
            getRegistry();


        if (!registry) {

            return false;
        }


        try {

            const registryApps =
                getRegistryApps(
                    registry
                );


            if (
                registryApps.length ===
                0
            ) {

                return true;
            }


            let imported =
                0;


            for (
                const app of
                registryApps
            ) {

                if (!app) {
                    continue;
                }


                const id =
                    normalizeId(
                        app.id ||
                        app.appId
                    );


                if (!id) {
                    continue;
                }


                if (
                    state.apps.has(
                        id
                    )
                ) {

                    if (
                        options.updateExisting !==
                        false
                    ) {

                        const existing =
                            state.apps.get(
                                id
                            );


                        Object.assign(
                            existing,
                            app
                        );
                    }


                    continue;
                }


                register(
                    app
                );


                imported +=
                    1;
            }


            emit(
                "app-registry-synced",
                {

                    imported,

                    total:
                        registryApps.length

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Registry Sync"
            );


            return false;
        }
    }


    /* ========================================================
       110 — APP REGISTRY PUBLISH
       ======================================================== */

    function publishRegistry() {

        const registry =
            getRegistry();


        if (!registry) {

            return false;
        }


        try {

            const apps =
                list();


            if (
                hasMethod(
                    registry,
                    "register"
                )
            ) {

                for (
                    const app of apps
                ) {

                    registry.register(
                        app
                    );
                }

            } else if (
                hasMethod(
                    registry,
                    "add"
                )
            ) {

                for (
                    const app of apps
                ) {

                    registry.add(
                        app
                    );
                }

            } else {

                return false;
            }


            emit(
                "app-registry-published",
                {

                    count:
                        apps.length

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Registry Publish"
            );


            return false;
        }
    }
           /* ========================================================
       111 — APP MANAGER HEALTH
       ======================================================== */

    function managerHealth() {

        const registry =
            getRegistry();

        const router =
            getRouter();

        const windowManager =
            getWindowManager();

        const platform =
            getPlatform();

        const kernel =
            getKernel();

        const system =
            getSystem();

        return {

            healthy:
                true,

            manager:
                true,

            apps:
                state.apps.size,

            openApps:
                getOpenApps().length,

            activeApp:
                state.activeAppId,

            services:
                {

                    kernel:
                        !!kernel,

                    system:
                        !!system,

                    registry:
                        !!registry,

                    router:
                        !!router,

                    windowManager:
                        !!windowManager,

                    platform:
                        !!platform

                },

            timestamp:
                now()

        };
    }


    /* ========================================================
       112 — APP MANAGER DIAGNOSTICS
       ======================================================== */

    function managerDiagnostics() {

        return {

            timestamp:
                now(),

            version:
                VERSION,

            namespace:
                NAMESPACE,

            manager:
                managerHealth(),

            statistics:
                getStatistics(),

            active:
                getActiveApp()
                    ? getMetadata(
                        getActiveApp().id
                    )
                    : null,

            openApps:
                getOpenApps()
                    .map(
                        item =>
                            getMetadata(
                                item.app.id
                            )
                    ),

            runningApps:
                getRunningApps()
                    .map(
                        item =>
                            getMetadata(
                                item.app.id
                            )
                    ),

            registry:
                !!getRegistry(),

            router:
                !!getRouter(),

            windowManager:
                !!getWindowManager(),

            platform:
                !!getPlatform(),

            kernel:
                !!getKernel(),

            system:
                !!getSystem(),

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

        };
    }


    /* ========================================================
       113 — APP MANAGER RESET
       ======================================================== */

    async function reset(
        options = {}
    ) {

        try {

            if (
                options.close !==
                false
            ) {

                await closeAll(
                    options
                );
            }


            state.apps.clear();

            state.appState.clear();

            state.contexts.clear();

            state.instances.clear();

            state.settings.clear();


            if (
                state.data &&
                typeof state.data.clear ===
                "function"
            ) {

                state.data.clear();
            }


            state.activeAppId =
                null;


            state.statistics =
                createStatistics();


            emit(
                "manager-reset",
                {

                    options,

                    timestamp:
                        now()

                }
            );


            dispatch(
                "haldo:app-manager-reset",
                {

                    options,

                    timestamp:
                        now()

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Manager Reset"
            );


            return false;
        }
    }


    /* ========================================================
       114 — APP MANAGER STARTUP
       ======================================================== */

    async function initialize(
        options = {}
    ) {

        if (
            state.initialized
        ) {

            return true;
        }


        try {

            syncRegistry(
                options
            );


            publishRegistry();


            state.initialized =
                true;


            state.started =
                false;


            state.initializedAt =
                now();


            emit(
                "manager-initialized",
                {

                    options,

                    statistics:
                        getStatistics()

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Manager Initialize"
            );


            return false;
        }
    }


    /* ========================================================
       115 — APP MANAGER START
       ======================================================== */

    async function start(
        options = {}
    ) {

        const ready =
            await initialize(
                options
            );


        if (!ready) {

            return false;
        }


        if (
            state.started
        ) {

            return true;
        }


        try {

            if (
                options.startRegistered ===
                true
            ) {

                const apps =
                    list();


                for (
                    const app of
                    apps
                ) {

                    try {

                        await startApp(
                            app,
                            options
                        );

                    } catch (
                        exception
                    ) {

                        reportError(
                            exception,
                            "Start Registered App: " +
                            app.id
                        );
                    }
                }
            }


            state.started =
                true;


            state.startedAt =
                now();


            emit(
                "manager-started",
                {

                    options,

                    statistics:
                        getStatistics()

                }
            );


            dispatch(
                "haldo:app-manager-started",
                {

                    options,

                    statistics:
                        getStatistics()

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Manager Start"
            );


            return false;
        }
    }
           /* ========================================================
       116 — APP MANAGER STOP
       ======================================================== */

    async function stop(
        options = {}
    ) {

        try {

            await stopAll(
                options
            );


            state.started =
                false;


            emit(
                "manager-stopped",
                {

                    options,

                    timestamp:
                        now()

                }
            );


            dispatch(
                "haldo:app-manager-stopped",
                {

                    options

                }
            );


            return true;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Manager Stop"
            );


            return false;
        }
    }


    /* ========================================================
       117 — APP MANAGER READY
       ======================================================== */

    function isInitialized() {

        return (
            state.initialized ===
            true
        );
    }


    function isStarted() {

        return (
            state.started ===
            true
        );
    }


    function isOperational() {

        return (
            isInitialized() &&
            isStarted()
        );
    }


    /* ========================================================
       118 — APP MANAGER STATE
       ======================================================== */

    function getManagerState() {

        return {

            initialized:
                state.initialized ===
                true,

            started:
                state.started ===
                true,

            initializedAt:
                state.initializedAt ||
                null,

            startedAt:
                state.startedAt ||
                null,

            activeAppId:
                state.activeAppId ||
                null,

            appCount:
                state.apps.size,

            openCount:
                getOpenApps().length,

            runningCount:
                getRunningApps().length,

            timestamp:
                now()

        };
    }


    /* ========================================================
       119 — APP EVENT SUBSCRIPTION
       ======================================================== */

    function subscribe(
        event,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return () => {};
        }


        const eventName =
            String(
                event ||
                "*"
            )
                .trim();


        if (!eventName) {

            return () => {};
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


        return () => {

            listeners.delete(
                callback
            );


            if (
                listeners.size ===
                0
            ) {

                state.listeners.delete(
                    eventName
                );
            }
        };
    }


    /* ========================================================
       120 — APP EVENT EMITTER
       ======================================================== */

    function emitLocal(
        event,
        payload = {}
    ) {

        const eventName =
            String(
                event ||
                ""
            )
                .trim();


        if (!eventName) {

            return false;
        }


        const listeners =
            state.listeners.get(
                eventName
            );


        if (
            listeners &&
            listeners.size
        ) {

            for (
                const callback of
                [
                    ...listeners
                ]
            ) {

                try {

                    callback(
                        payload
                    );


                } catch (
                    exception
                ) {

                    reportError(
                        exception,
                        "App Local Event: " +
                        eventName
                    );
                }
            }
        }


        const wildcard =
            state.listeners.get(
                "*"
            );


        if (
            wildcard &&
            wildcard.size
        ) {

            for (
                const callback of
                [
                    ...wildcard
                ]
            ) {

                try {

                    callback(
                        eventName,
                        payload
                    );


                } catch (
                    exception
                ) {

                    reportError(
                        exception,
                        "App Wildcard Event"
                    );
                }
            }
        }


        return true;
    }


    /* ========================================================
       121 — APP COMMAND
       ======================================================== */

    async function command(
        appId,
        commandName,
        payload = {}
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return null;
        }


        const name =
            String(
                commandName ||
                ""
            )
                .trim();


        if (!name) {

            return null;
        }


        try {

            if (
                typeof app.command ===
                "function"
            ) {

                return await safeAsyncResult(
                    app.command({

                        app,

                        command:
                            name,

                        payload,

                        manager:
                            api,

                        context:
                            getContext(
                                app.id
                            )

                    })
                );
            }


            if (
                app.commands &&
                typeof app.commands[name] ===
                "function"
            ) {

                return await safeAsyncResult(
                    app.commands[name](
                        payload
                    )
                );
            }


            return null;


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Command: " +
                app.id +
                " / " +
                name
            );


            return null;
        }
    }
           /* ========================================================
       122 — APP API CALL
       ======================================================== */

    async function call(
        appId,
        method,
        ...args
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return null;
        }


        const name =
            String(
                method ||
                ""
            )
                .trim();


        if (!name) {

            return null;
        }


        try {

            const target =
                app.api &&
                typeof app.api[name] ===
                "function"
                    ? app.api[name]
                    : (
                        typeof app[name] ===
                        "function"
                            ? app[name]
                            : null
                    );


            if (
                typeof target !==
                "function"
            ) {

                return null;
            }


            return await safeAsyncResult(
                target.apply(
                    app,
                    args
                )
            );


        } catch (
            exception
        ) {

            reportError(
                exception,
                "App API Call: " +
                app.id +
                " / " +
                name
            );


            return null;
        }
    }


    /* ========================================================
       123 — APP SERVICE ACCESS
       ======================================================== */

    function getService(
        appId,
        serviceName
    ) {

        const context =
            getContext(
                appId
            );


        if (!context) {

            return null;
        }


        const name =
            String(
                serviceName ||
                ""
            )
                .trim();


        if (!name) {

            return null;
        }


        if (
            context.services &&
            context.services[name]
        ) {

            return context.services[
                name
            ];
        }


        if (
            context[name]
        ) {

            return context[
                name
            ];
        }


        return null;
    }


    /* ========================================================
       124 — APP SERVICES
       ======================================================== */

    function getServices(
        appId
    ) {

        const context =
            getContext(
                appId
            );


        if (!context) {

            return {};
        }


        return {

            ...(context.services ||
                {})

        };
    }


    /* ========================================================
       125 — APP CONTEXT UPDATE
       ======================================================== */

    function updateContext(
        appId,
        changes = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return false;
        }


        let context =
            getContext(
                id
            );


        if (!context) {

            const app =
                get(
                    id
                );


            if (!app) {

                return false;
            }


            context =
                createAppContext(
                    app
                );


            if (!context) {

                return false;
            }


            state.contexts.set(
                id,
                context
            );
        }


        if (
            isObject(
                changes
            )
        ) {

            Object.assign(
                context,
                changes
            );
        }


        context.updatedAt =
            now();


        emit(
            "app-context-updated",
            {

                appId:
                    id,

                context

            }
        );


        return context;
    }


    /* ========================================================
       126 — APP CONTEXT SERVICE
       ======================================================== */

    function setContextService(
        appId,
        serviceName,
        service
    ) {

        const id =
            normalizeId(
                appId
            );


        const name =
            String(
                serviceName ||
                ""
            )
                .trim();


        if (
            !id ||
            !name
        ) {

            return false;
        }


        let context =
            getContext(
                id
            );


        if (!context) {

            const app =
                get(
                    id
                );


            if (!app) {

                return false;
            }


            context =
                createAppContext(
                    app
                );


            if (!context) {

                return false;
            }


            state.contexts.set(
                id,
                context
            );
        }


        if (
            !context.services
        ) {

            context.services =
                {};
        }


        context.services[
            name
        ] =
            service;


        context.updatedAt =
            now();


        emit(
            "app-context-service-changed",
            {

                appId:
                    id,

                serviceName:
                    name,

                service,

                context

            }
        );


        return true;
    }
           /* ========================================================
       127 — APP EVENT FROM APP
       ======================================================== */

    function appEmit(
        appId,
        event,
        payload = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        const detail = {

            app,

            appId:
                id,

            payload,

            timestamp:
                now()

        };

        emitLocal(
            event,
            detail
        );

        emit(
            "app:" +
            event,
            detail
        );

        dispatch(
            "haldo:app:" +
            event,
            detail
        );

        return true;
    }


    /* ========================================================
       128 — APP LISTENER
       ======================================================== */

    function onApp(
        appId,
        event,
        callback
    ) {

        const id =
            normalizeId(
                appId
            );

        if (!id) {

            return () => {};
        }

        const eventName =
            "app:" +
            id +
            ":" +
            String(
                event ||
                "*"
            );

        return subscribe(
            eventName,
            callback
        );
    }


    /* ========================================================
       129 — APP STATE WATCHER
       ======================================================== */

    function watch(
        appId,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return () => {};
        }

        const id =
            normalizeId(
                appId
            );

        if (!id) {

            return () => {};
        }

        const handler =
            payload => {

                if (
                    !payload ||
                    normalizeId(
                        payload.appId
                    ) !==
                    id
                ) {

                    return;
                }

                callback(
                    getAppState(
                        id
                    ),
                    payload
                );
            };

        return subscribe(
            "app-state-changed",
            handler
        );
    }


    /* ========================================================
       130 — APP STATE EVENT
       ======================================================== */

    function notifyStateChange(
        appId,
        previous,
        current
    ) {

        const id =
            normalizeId(
                appId
            );

        if (!id) {

            return false;
        }

        const payload = {

            appId:
                id,

            previous,

            current,

            timestamp:
                now()

        };

        emitLocal(
            "app-state-changed",
            payload
        );

        return true;
    }


    /* ========================================================
       131 — APP METADATA
       ======================================================== */

    function getMetadata(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {

            return null;
        }

        const id =
            normalizeId(
                app.id
            );

        const appState =
            getAppState(
                id
            );

        return {

            id,

            appId:
                id,

            name:
                app.name ||
                app.title ||
                id,

            title:
                app.title ||
                app.name ||
                id,

            description:
                app.description ||
                "",

            version:
                app.version ||
                "1.0.0",

            category:
                app.category ||
                app.type ||
                "application",

            icon:
                app.icon ||
                null,

            route:
                app.route ||
                null,

            enabled:
                app.enabled !==
                false,

            singleton:
                app.singleton !==
                false,

            permissions:
                getPermissions(
                    id
                ),

            dependencies:
                getDependencies(
                    id
                ),

            capabilities:
                getCapabilities(
                    id
                ),

            features:
                getFeatures(
                    id
                ),

            initialized:
                appState.initialized ===
                true,

            started:
                appState.started ===
                true,

            ready:
                appState.ready ===
                true,

            open:
                appState.open ===
                true,

            active:
                appState.active ===
                true,

            visible:
                appState.visible ===
                true,

            minimized:
                appState.minimized ===
                true,

            maximized:
                appState.maximized ===
                true,

            pip:
                appState.pip ===
                true,

            windowId:
                appState.windowId ||
                null,

            registeredAt:
                app.registeredAt ||
                null,

            updatedAt:
                app.updatedAt ||
                appState.updatedAt ||
                null

        };
    }


    /* ========================================================
       132 — APP CAPABILITIES
       ======================================================== */

    function getCapabilities(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {

            return [];
        }

        const capabilities =
            app.capabilities ||
            app.features ||
            [];

        if (
            Array.isArray(
                capabilities
            )
        ) {

            return [
                ...capabilities
            ];
        }

        if (
            isObject(
                capabilities
            )
        ) {

            return Object.keys(
                capabilities
            ).filter(
                key =>
                    capabilities[key] !==
                    false
            );
        }

        return [];
    }
           /* ========================================================
       133 — APP WINDOW
       ======================================================== */

    function getWindow(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );

        if (!id) {
            return null;
        }

        const appState =
            getAppState(
                id
            );

        if (
            !appState ||
            !appState.windowId
        ) {

            return null;
        }

        const manager =
            getWindowManager();

        if (!manager) {
            return null;
        }

        try {

            if (
                hasMethod(
                    manager,
                    "get"
                )
            ) {

                return manager.get(
                    appState.windowId
                );
            }

            if (
                hasMethod(
                    manager,
                    "getWindow"
                )
            ) {

                return manager.getWindow(
                    appState.windowId
                );
            }

            if (
                manager.windows &&
                typeof manager.windows.get ===
                "function"
            ) {

                return manager.windows.get(
                    appState.windowId
                );
            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Get App Window: " +
                id
            );
        }

        return null;
    }


    /* ========================================================
       134 — UPDATE WINDOW
       ======================================================== */

    async function updateWindow(
        appId,
        changes = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const window =
            getWindow(
                app.id
            );

        if (!window) {
            return false;
        }

        const manager =
            getWindowManager();

        if (!manager) {
            return false;
        }

        try {

            if (
                hasMethod(
                    manager,
                    "update"
                )
            ) {

                await safeAsyncResult(
                    manager.update(
                        window.id ||
                        window.windowId,
                        changes
                    )
                );

            } else {

                Object.assign(
                    window,
                    changes
                );
            }

            emit(
                "app-window-updated",
                {

                    app,

                    window,

                    changes

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Update App Window: " +
                app.id
            );

            return false;
        }
    }


    /* ========================================================
       135 — MINIMIZE APP
       ======================================================== */

    async function minimize(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const window =
            getWindow(
                app.id
            );

        if (!window) {
            return false;
        }

        const manager =
            getWindowManager();

        if (!manager) {
            return false;
        }

        try {

            const windowId =
                window.id ||
                window.windowId;

            if (
                hasMethod(
                    manager,
                    "minimize"
                )
            ) {

                await safeAsyncResult(
                    manager.minimize(
                        windowId
                    )
                );

            } else {

                await updateWindow(
                    app.id,
                    {

                        minimized:
                            true,

                        visible:
                            false

                    }
                );
            }

            updateAppState(
                app.id,
                {

                    minimized:
                        true,

                    visible:
                        false,

                    active:
                        false

                }
            );

            emit(
                "app-minimized",
                {

                    app

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Minimize: " +
                app.id
            );

            return false;
        }
    }


    /* ========================================================
       136 — MAXIMIZE APP
       ======================================================== */

    async function maximize(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const window =
            getWindow(
                app.id
            );

        if (!window) {
            return false;
        }

        const manager =
            getWindowManager();

        if (!manager) {
            return false;
        }

        try {

            const windowId =
                window.id ||
                window.windowId;

            if (
                hasMethod(
                    manager,
                    "maximize"
                )
            ) {

                await safeAsyncResult(
                    manager.maximize(
                        windowId
                    )
                );

            } else {

                await updateWindow(
                    app.id,
                    {

                        maximized:
                            true,

                        minimized:
                            false,

                        visible:
                            true

                    }
                );
            }

            updateAppState(
                app.id,
                {

                    maximized:
                        true,

                    minimized:
                        false,

                    visible:
                        true,

                    active:
                        true

                }
            );

            state.activeAppId =
                normalizeId(
                    app.id
                );

            emit(
                "app-maximized",
                {

                    app

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Maximize: " +
                app.id
            );

            return false;
        }
    }
           /* ========================================================
       137 — RESTORE APP
       ======================================================== */

    async function restore(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const window =
            getWindow(
                app.id
            );

        if (!window) {
            return false;
        }

        const manager =
            getWindowManager();

        if (!manager) {
            return false;
        }

        try {

            const windowId =
                window.id ||
                window.windowId;

            if (
                hasMethod(
                    manager,
                    "restore"
                )
            ) {

                await safeAsyncResult(
                    manager.restore(
                        windowId
                    )
                );

            } else {

                await updateWindow(
                    app.id,
                    {

                        minimized:
                            false,

                        maximized:
                            false,

                        visible:
                            true

                    }
                );
            }

            updateAppState(
                app.id,
                {

                    minimized:
                        false,

                    maximized:
                        false,

                    visible:
                        true,

                    active:
                        true

                }
            );

            state.activeAppId =
                normalizeId(
                    app.id
                );

            emit(
                "app-restored",
                {

                    app

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Restore: " +
                app.id
            );

            return false;
        }
    }


    /* ========================================================
       138 — APP FOCUS
       ======================================================== */

    async function focus(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const window =
            getWindow(
                app.id
            );

        if (!window) {
            return false;
        }

        const manager =
            getWindowManager();

        if (!manager) {
            return false;
        }

        try {

            const windowId =
                window.id ||
                window.windowId;

            if (
                hasMethod(
                    manager,
                    "focus"
                )
            ) {

                await safeAsyncResult(
                    manager.focus(
                        windowId
                    )
                );

            } else if (
                hasMethod(
                    manager,
                    "activate"
                )
            ) {

                await safeAsyncResult(
                    manager.activate(
                        windowId
                    )
                );
            }

            state.activeAppId =
                normalizeId(
                    app.id
                );

            deactivateOtherApps(
                app.id
            );

            updateAppState(
                app.id,
                {

                    active:
                        true,

                    visible:
                        true,

                    minimized:
                        false

                }
            );

            emit(
                "app-focused",
                {

                    app,

                    window

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Focus: " +
                app.id
            );

            return false;
        }
    }


    /* ========================================================
       139 — APP SHOW
       ======================================================== */

    async function show(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const window =
            getWindow(
                app.id
            );

        const manager =
            getWindowManager();

        try {

            if (
                window &&
                manager
            ) {

                const windowId =
                    window.id ||
                    window.windowId;

                if (
                    hasMethod(
                        manager,
                        "show"
                    )
                ) {

                    await safeAsyncResult(
                        manager.show(
                            windowId
                        )
                    );
                }
            }

            updateAppState(
                app.id,
                {

                    visible:
                        true,

                    minimized:
                        false

                }
            );

            emit(
                "app-shown",
                {

                    app

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Show: " +
                app.id
            );

            return false;
        }
    }


    /* ========================================================
       140 — APP HIDE
       ======================================================== */

    async function hide(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const window =
            getWindow(
                app.id
            );

        const manager =
            getWindowManager();

        try {

            if (
                window &&
                manager
            ) {

                const windowId =
                    window.id ||
                    window.windowId;

                if (
                    hasMethod(
                        manager,
                        "hide"
                    )
                ) {

                    await safeAsyncResult(
                        manager.hide(
                            windowId
                        )
                    );
                }
            }

            updateAppState(
                app.id,
                {

                    visible:
                        false,

                    active:
                        false

                }
            );

            if (
                state.activeAppId ===
                normalizeId(
                    app.id
                )
            ) {

                state.activeAppId =
                    null;
            }

            emit(
                "app-hidden",
                {

                    app

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Hide: " +
                app.id
            );

            return false;
        }
    }
           /* ========================================================
       141 — APP WINDOW POSITION
       ======================================================== */

    async function setPosition(
        appId,
        position = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const window =
            getWindow(
                app.id
            );

        const manager =
            getWindowManager();

        if (
            !window ||
            !manager
        ) {

            return false;
        }

        try {

            const windowId =
                window.id ||
                window.windowId;

            if (
                hasMethod(
                    manager,
                    "setPosition"
                )
            ) {

                await safeAsyncResult(
                    manager.setPosition(
                        windowId,
                        position
                    )
                );

            } else if (
                hasMethod(
                    manager,
                    "move"
                )
            ) {

                await safeAsyncResult(
                    manager.move(
                        windowId,
                        position
                    )
                );

            } else {

                Object.assign(
                    window,
                    position
                );
            }

            emit(
                "app-window-position-changed",
                {

                    app,

                    position

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Window Position: " +
                app.id
            );

            return false;
        }
    }


    /* ========================================================
       142 — APP WINDOW SIZE
       ======================================================== */

    async function setSize(
        appId,
        size = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const window =
            getWindow(
                app.id
            );

        const manager =
            getWindowManager();

        if (
            !window ||
            !manager
        ) {

            return false;
        }

        try {

            const windowId =
                window.id ||
                window.windowId;

            if (
                hasMethod(
                    manager,
                    "setSize"
                )
            ) {

                await safeAsyncResult(
                    manager.setSize(
                        windowId,
                        size
                    )
                );

            } else if (
                hasMethod(
                    manager,
                    "resize"
                )
            ) {

                await safeAsyncResult(
                    manager.resize(
                        windowId,
                        size
                    )
                );

            } else {

                Object.assign(
                    window,
                    size
                );
            }

            emit(
                "app-window-size-changed",
                {

                    app,

                    size

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Window Size: " +
                app.id
            );

            return false;
        }
    }


    /* ========================================================
       143 — APP WINDOW FULLSCREEN
       ======================================================== */

    async function fullscreen(
        appId,
        enabled = true
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const window =
            getWindow(
                app.id
            );

        const manager =
            getWindowManager();

        try {

            if (
                window &&
                manager
            ) {

                const windowId =
                    window.id ||
                    window.windowId;

                if (
                    enabled &&
                    hasMethod(
                        manager,
                        "fullscreen"
                    )
                ) {

                    await safeAsyncResult(
                        manager.fullscreen(
                            windowId
                        )
                    );

                } else if (
                    !enabled &&
                    hasMethod(
                        manager,
                        "exitFullscreen"
                    )
                ) {

                    await safeAsyncResult(
                        manager.exitFullscreen(
                            windowId
                        )
                    );

                } else {

                    await updateWindow(
                        app.id,
                        {

                            fullscreen:
                                enabled ===
                                true

                        }
                    );
                }
            }

            updateAppState(
                app.id,
                {

                    fullscreen:
                        enabled ===
                        true

                }
            );

            emit(
                "app-fullscreen-changed",
                {

                    app,

                    fullscreen:
                        enabled ===
                        true

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Fullscreen: " +
                app.id
            );

            return false;
        }
    }


    /* ========================================================
       144 — APP PICTURE IN PICTURE
       ======================================================== */

    async function setPip(
        appId,
        enabled = true
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const window =
            getWindow(
                app.id
            );

        const manager =
            getWindowManager();

        try {

            if (
                window &&
                manager
            ) {

                const windowId =
                    window.id ||
                    window.windowId;

                if (
                    enabled &&
                    hasMethod(
                        manager,
                        "pip"
                    )
                ) {

                    await safeAsyncResult(
                        manager.pip(
                            windowId
                        )
                    );

                } else if (
                    !enabled &&
                    hasMethod(
                        manager,
                        "exitPip"
                    )
                ) {

                    await safeAsyncResult(
                        manager.exitPip(
                            windowId
                        )
                    );

                } else {

                    await updateWindow(
                        app.id,
                        {

                            pip:
                                enabled ===
                                true

                        }
                    );
                }
            }

            updateAppState(
                app.id,
                {

                    pip:
                        enabled ===
                        true

                }
            );

            emit(
                "app-pip-changed",
                {

                    app,

                    pip:
                        enabled ===
                        true

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App PiP: " +
                app.id
            );

            return false;
        }
    }
           /* ========================================================
       145 — APP WINDOW TITLE
       ======================================================== */

    async function setTitle(
        appId,
        title
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const value =
            String(
                title ??
                ""
            );

        const window =
            getWindow(
                app.id
            );

        const manager =
            getWindowManager();

        try {

            app.title =
                value;

            if (
                window &&
                manager
            ) {

                const windowId =
                    window.id ||
                    window.windowId;

                await updateWindow(
                    app.id,
                    {
                        title:
                            value
                    }
                );

                if (
                    hasMethod(
                        manager,
                        "setTitle"
                    )
                ) {

                    await safeAsyncResult(
                        manager.setTitle(
                            windowId,
                            value
                        )
                    );
                }
            }

            emit(
                "app-title-changed",
                {

                    app,

                    title:
                        value

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Window Title: " +
                app.id
            );

            return false;
        }
    }


    /* ========================================================
       146 — APP WINDOW ICON
       ======================================================== */

    async function setIcon(
        appId,
        icon
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        try {

            app.icon =
                icon ||
                null;

            await updateWindow(
                app.id,
                {

                    icon:
                        app.icon

                }
            );

            emit(
                "app-icon-changed",
                {

                    app,

                    icon:
                        app.icon

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Icon: " +
                app.id
            );

            return false;
        }
    }


    /* ========================================================
       147 — APP THEME
       ======================================================== */

    async function setTheme(
        appId,
        theme
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        const value =
            typeof theme ===
            "string"
                ? theme
                : (
                    isObject(
                        theme
                    )
                        ? {
                            ...theme
                        }
                        : null
                );

        if (
            value ===
            null
        ) {

            return false;
        }

        try {

            if (
                !isObject(
                    app.theme
                )
            ) {

                app.theme =
                    {};
            }

            if (
                isObject(
                    value
                )
            ) {

                Object.assign(
                    app.theme,
                    value
                );

            } else {

                app.theme.name =
                    value;
            }

            const context =
                getContext(
                    id
                );

            if (
                context
            ) {

                context.theme =
                    app.theme;
            }

            const window =
                getWindow(
                    id
                );

            if (
                window
            ) {

                await updateWindow(
                    id,
                    {

                        theme:
                            app.theme

                    }
                );
            }

            emit(
                "app-theme-changed",
                {

                    app,

                    theme:
                        app.theme

                }
            );

            dispatch(
                "haldo:app-theme-changed",
                {

                    app,

                    theme:
                        app.theme

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Theme: " +
                id
            );

            return false;
        }
    }
           /* ========================================================
       148 — APP LANGUAGE
       ======================================================== */

    async function setLanguage(
        appId,
        language
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        const value =
            String(
                language ||
                ""
            )
                .trim();

        if (!value) {
            return false;
        }

        try {

            app.language =
                value;

            const context =
                getContext(
                    id
                );

            if (
                context
            ) {

                context.language =
                    value;
            }

            const languageService =
                getLanguage();

            if (
                languageService
            ) {

                if (
                    hasMethod(
                        languageService,
                        "setAppLanguage"
                    )
                ) {

                    await safeAsyncResult(
                        languageService.setAppLanguage(
                            id,
                            value
                        )
                    );
                }
            }

            if (
                typeof app.setLanguage ===
                "function"
            ) {

                await safeAsyncResult(
                    app.setLanguage({

                        app,

                        language:
                            value,

                        manager:
                            api,

                        context

                    })
                );
            }

            emit(
                "app-language-changed",
                {

                    app,

                    language:
                        value

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Language: " +
                id
            );

            return false;
        }
    }


    /* ========================================================
       149 — APP VOICE
       ======================================================== */

    async function setVoice(
        appId,
        voice
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        try {

            app.voice =
                voice ||
                null;

            const context =
                getContext(
                    id
                );

            if (
                context
            ) {

                context.voice =
                    app.voice;
            }

            const voiceService =
                getVoice();

            if (
                voiceService
            ) {

                if (
                    hasMethod(
                        voiceService,
                        "setAppVoice"
                    )
                ) {

                    await safeAsyncResult(
                        voiceService.setAppVoice(
                            id,
                            voice
                        )
                    );
                }
            }

            if (
                typeof app.setVoice ===
                "function"
            ) {

                await safeAsyncResult(
                    app.setVoice({

                        app,

                        voice,

                        manager:
                            api,

                        context

                    })
                );
            }

            emit(
                "app-voice-changed",
                {

                    app,

                    voice

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Voice: " +
                id
            );

            return false;
        }
    }


    /* ========================================================
       150 — APP AI ACCESS
       ======================================================== */

    function getAIService(
        appId
    ) {

        const ai =
            getAI();

        if (!ai) {
            return null;
        }

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        return {

            ai,

            app,

            chat:
                async (
                    message,
                    options = {}
                ) => {

                    if (
                        hasMethod(
                            ai,
                            "chat"
                        )
                    ) {

                        return ai.chat(
                            message,
                            {

                                ...options,

                                appId:
                                    app.id

                            }
                        );
                    }

                    if (
                        hasMethod(
                            ai,
                            "ask"
                        )
                    ) {

                        return ai.ask(
                            message,
                            {

                                ...options,

                                appId:
                                    app.id

                            }
                        );
                    }

                    return null;
                },

            speak:
                async (
                    text,
                    options = {}
                ) => {

                    const voice =
                        getVoice();

                    if (
                        voice &&
                        hasMethod(
                            voice,
                            "speak"
                        )
                    ) {

                        return voice.speak(
                            text,
                            options
                        );
                    }

                    return null;
                }

        };
    }
           /* ========================================================
       151 — APP LANGUAGE SERVICE
       ======================================================== */

    function getLanguageService(
        appId
    ) {

        const language =
            getLanguage();

        if (!language) {
            return null;
        }

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        return {

            language,

            app,

            get:
                () => {

                    return (
                        app.language ||
                        null
                    );
                },

            set:
                async value => {

                    return setLanguage(
                        app.id,
                        value
                    );
                },

            translate:
                (
                    text,
                    options = {}
                ) => {

                    if (
                        hasMethod(
                            language,
                            "translate"
                        )
                    ) {

                        return language.translate(
                            text,
                            {

                                ...options,

                                appId:
                                    app.id

                            }
                        );
                    }

                    return text;
                }

        };
    }


    /* ========================================================
       152 — APP VOICE SERVICE
       ======================================================== */

    function getVoiceService(
        appId
    ) {

        const voice =
            getVoice();

        if (!voice) {
            return null;
        }

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        return {

            voice,

            app,

            speak:
                async (
                    text,
                    options = {}
                ) => {

                    if (
                        hasMethod(
                            voice,
                            "speak"
                        )
                    ) {

                        return voice.speak(
                            text,
                            options
                        );
                    }

                    return null;
                },

            stop:
                () => {

                    if (
                        hasMethod(
                            voice,
                            "stop"
                        )
                    ) {

                        return voice.stop();
                    }

                    return false;
                },

            pause:
                () => {

                    if (
                        hasMethod(
                            voice,
                            "pause"
                        )
                    ) {

                        return voice.pause();
                    }

                    return false;
                },

            resume:
                () => {

                    if (
                        hasMethod(
                            voice,
                            "resume"
                        )
                    ) {

                        return voice.resume();
                    }

                    return false;
                }

        };
    }


    /* ========================================================
       153 — APP NOTIFICATION SERVICE
       ======================================================== */

    function getNotificationService(
        appId
    ) {

        const notifications =
            getNotifications();

        if (!notifications) {
            return null;
        }

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        return {

            notifications,

            app,

            notify:
                (
                    message,
                    options = {}
                ) => {

                    const payload = {

                        ...options,

                        appId:
                            app.id,

                        source:
                            "app-manager",

                        message

                    };

                    if (
                        hasMethod(
                            notifications,
                            "notify"
                        )
                    ) {

                        return notifications.notify(
                            payload
                        );
                    }

                    if (
                        hasMethod(
                            notifications,
                            "show"
                        )
                    ) {

                        return notifications.show(
                            payload
                        );
                    }

                    return null;
                },

            success:
                message => {

                    if (
                        hasMethod(
                            notifications,
                            "success"
                        )
                    ) {

                        return notifications.success(
                            message
                        );
                    }

                    return null;
                },

            error:
                message => {

                    if (
                        hasMethod(
                            notifications,
                            "error"
                        )
                    ) {

                        return notifications.error(
                            message
                        );
                    }

                    return null;
                },

            warning:
                message => {

                    if (
                        hasMethod(
                            notifications,
                            "warning"
                        )
                    ) {

                        return notifications.warning(
                            message
                        );
                    }

                    return null;
                }

        };
    }


    /* ========================================================
       154 — APP KEYBOARD SERVICE
       ======================================================== */

    function getKeyboardService(
        appId
    ) {

        const keyboard =
            getKeyboard();

        if (!keyboard) {
            return null;
        }

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        return {

            keyboard,

            app,

            open:
                options => {

                    if (
                        hasMethod(
                            keyboard,
                            "open"
                        )
                    ) {

                        return keyboard.open(
                            {

                                ...options,

                                appId:
                                    app.id

                            }
                        );
                    }

                    return false;
                },

            close:
                options => {

                    if (
                        hasMethod(
                            keyboard,
                            "close"
                        )
                    ) {

                        return keyboard.close(
                            {

                                ...options,

                                appId:
                                    app.id

                            }
                        );
                    }

                    return false;
                },

            toggle:
                options => {

                    if (
                        hasMethod(
                            keyboard,
                            "toggle"
                        )
                    ) {

                        return keyboard.toggle(
                            {

                                ...options,

                                appId:
                                    app.id

                            }
                        );
                    }

                    return false;
                }

        };
    }
           /* ========================================================
       155 — APP STORAGE SERVICE
       ======================================================== */

    function getStorageService(
        appId
    ) {

        const storage =
            getStorage();

        if (!storage) {
            return null;
        }

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        const prefix =
            "haldo.app." +
            normalizeId(
                app.id
            ) +
            ".";

        return {

            storage,

            app,

            prefix,

            get:
                async key => {

                    const value =
                        String(
                            key ||
                            ""
                        );

                    if (
                        hasMethod(
                            storage,
                            "get"
                        )
                    ) {

                        return storage.get(
                            prefix +
                            value
                        );
                    }

                    if (
                        hasMethod(
                            storage,
                            "getItem"
                        )
                    ) {

                        return storage.getItem(
                            prefix +
                            value
                        );
                    }

                    return null;
                },

            set:
                async (
                    key,
                    value
                ) => {

                    const name =
                        String(
                            key ||
                            ""
                        );

                    if (
                        hasMethod(
                            storage,
                            "set"
                        )
                    ) {

                        return storage.set(
                            prefix +
                            name,
                            value
                        );
                    }

                    if (
                        hasMethod(
                            storage,
                            "setItem"
                        )
                    ) {

                        return storage.setItem(
                            prefix +
                            name,
                            value
                        );
                    }

                    return false;
                },

            remove:
                async key => {

                    const name =
                        String(
                            key ||
                            ""
                        );

                    if (
                        hasMethod(
                            storage,
                            "remove"
                        )
                    ) {

                        return storage.remove(
                            prefix +
                            name
                        );
                    }

                    if (
                        hasMethod(
                            storage,
                            "removeItem"
                        )
                    ) {

                        return storage.removeItem(
                            prefix +
                            name
                        );
                    }

                    return false;
                }

        };
    }


    /* ========================================================
       156 — APP KERNEL SERVICE
       ======================================================== */

    function getKernelService(
        appId
    ) {

        const kernel =
            getKernel();

        const app =
            get(
                appId
            );

        if (
            !kernel ||
            !app
        ) {

            return null;
        }

        return {

            kernel,

            app,

            getState:
                () => {

                    if (
                        hasMethod(
                            kernel,
                            "getState"
                        )
                    ) {

                        return kernel.getState();
                    }

                    return null;
                },

            getStatus:
                () => {

                    if (
                        hasMethod(
                            kernel,
                            "getStatus"
                        )
                    ) {

                        return kernel.getStatus();
                    }

                    return null;
                },

            emit:
                (
                    event,
                    payload
                ) => {

                    if (
                        hasMethod(
                            kernel,
                            "emit"
                        )
                    ) {

                        return kernel.emit(
                            event,
                            payload
                        );
                    }

                    return false;
                }

        };
    }


    /* ========================================================
       157 — APP SYSTEM SERVICE
       ======================================================== */

    function getSystemService(
        appId
    ) {

        const system =
            getSystem();

        const app =
            get(
                appId
            );

        if (
            !system ||
            !app
        ) {

            return null;
        }

        return {

            system,

            app,

            getInfo:
                () => {

                    if (
                        hasMethod(
                            system,
                            "getInfo"
                        )
                    ) {

                        return system.getInfo();
                    }

                    if (
                        system.info
                    ) {

                        return system.info;
                    }

                    return null;
                },

            getStatus:
                () => {

                    if (
                        hasMethod(
                            system,
                            "getStatus"
                        )
                    ) {

                        return system.getStatus();
                    }

                    return null;
                },

            diagnose:
                async options => {

                    if (
                        hasMethod(
                            system,
                            "diagnose"
                        )
                    ) {

                        return system.diagnose(
                            options
                        );
                    }

                    return null;
                }

        };
    }


    /* ========================================================
       158 — APP ROUTER SERVICE
       ======================================================== */

    function getRouterService(
        appId
    ) {

        const router =
            getRouter();

        const app =
            get(
                appId
            );

        if (
            !router ||
            !app
        ) {

            return null;
        }

        return {

            router,

            app,

            navigate:
                async (
                    route,
                    options = {}
                ) => {

                    if (
                        hasMethod(
                            router,
                            "navigate"
                        )
                    ) {

                        return router.navigate(
                            route,
                            options
                        );
                    }

                    if (
                        hasMethod(
                            router,
                            "go"
                        )
                    ) {

                        return router.go(
                            route,
                            options
                        );
                    }

                    return false;
                },

            back:
                () => {

                    if (
                        hasMethod(
                            router,
                            "back"
                        )
                    ) {

                        return router.back();
                    }

                    return false;
                },

            forward:
                () => {

                    if (
                        hasMethod(
                            router,
                            "forward"
                        )
                    ) {

                        return router.forward();
                    }

                    return false;
                },

            current:
                () => {

                    if (
                        hasMethod(
                            router,
                            "getCurrent"
                        )
                    ) {

                        return router.getCurrent();
                    }

                    if (
                        hasMethod(
                            router,
                            "current"
                        )
                    ) {

                        return router.current();
                    }

                    return null;
                }

        };
    }
           /* ========================================================
       159 — APP WINDOW SERVICE
       ======================================================== */

    function getWindowService(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        return {

            app,

            get:
                () =>
                    getWindow(
                        app.id
                    ),

            open:
                options =>
                    createWindow(
                        app,
                        options
                    ),

            close:
                options =>
                    close(
                        app.id,
                        options
                    ),

            focus:
                () =>
                    focus(
                        app.id
                    ),

            minimize:
                () =>
                    minimize(
                        app.id
                    ),

            maximize:
                () =>
                    maximize(
                        app.id
                    ),

            restore:
                () =>
                    restore(
                        app.id
                    ),

            show:
                () =>
                    show(
                        app.id
                    ),

            hide:
                () =>
                    hide(
                        app.id
                    ),

            setPosition:
                position =>
                    setPosition(
                        app.id,
                        position
                    ),

            setSize:
                size =>
                    setSize(
                        app.id,
                        size
                    ),

            fullscreen:
                enabled =>
                    fullscreen(
                        app.id,
                        enabled
                    ),

            pip:
                enabled =>
                    setPip(
                        app.id,
                        enabled
                    )

        };
    }


    /* ========================================================
       160 — COMPLETE APP SERVICES
       ======================================================== */

    function createAppServices(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return {};
        }

        return {

            manager:
                api,

            kernel:
                getKernelService(
                    app.id
                ),

            system:
                getSystemService(
                    app.id
                ),

            registry:
                getRegistry(),

            router:
                getRouterService(
                    app.id
                ),

            window:
                getWindowService(
                    app.id
                ),

            storage:
                getStorageService(
                    app.id
                ),

            ai:
                getAIService(
                    app.id
                ),

            language:
                getLanguageService(
                    app.id
                ),

            voice:
                getVoiceService(
                    app.id
                ),

            notifications:
                getNotificationService(
                    app.id
                ),

            keyboard:
                getKeyboardService(
                    app.id
                ),

            platform:
                getPlatform(),

            windowManager:
                getWindowManager(),

            launcher:
                getLauncher()

        };
    }


    /* ========================================================
       161 — APP RUNTIME CONTEXT
       ======================================================== */

    function getRuntimeContext(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        const id =
            normalizeId(
                app.id
            );

        let context =
            getContext(
                id
            );

        if (!context) {

            context =
                createAppContext(
                    app
                );

            if (context) {

                state.contexts.set(
                    id,
                    context
                );
            }
        }

        if (!context) {
            return null;
        }

        const services =
            createAppServices(
                id
            );

        context.services =
            {

                ...(context.services ||
                    {}),

                ...services

            };

        context.app =
            app;

        context.appId =
            id;

        context.manager =
            api;

        context.state =
            getAppState(
                id
            );

        context.metadata =
            getMetadata(
                id
            );

        context.updatedAt =
            now();

        return context;
    }


    /* ========================================================
       162 — APP RUNTIME CONTRACT
       ======================================================== */

    function getRuntimeContract(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        const contract =
            getContract();

        const context =
            getRuntimeContext(
                app.id
            );

        const base = {

            id:
                app.id,

            appId:
                app.id,

            version:
                app.version ||
                "1.0.0",

            name:
                app.name ||
                app.title ||
                app.id,

            title:
                app.title ||
                app.name ||
                app.id,

            route:
                app.route ||
                null,

            icon:
                app.icon ||
                null,

            enabled:
                app.enabled !==
                false,

            context,

            services:
                context &&
                context.services
                    ? context.services
                    : {},

            state:
                getAppState(
                    app.id
                ),

            metadata:
                getMetadata(
                    app.id
                )

        };

        if (
            contract &&
            typeof contract ===
            "object"
        ) {

            return {

                ...contract,

                ...base

            };
        }

        return base;
    }
           /* ========================================================
       163 — APP RUNTIME INITIALIZATION
       ======================================================== */

    async function initializeRuntime(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        try {

            const context =
                getRuntimeContext(
                    id
                );

            if (!context) {
                return false;
            }

            if (
                app.runtime &&
                typeof app.runtime.init ===
                "function"
            ) {

                await safeAsyncResult(
                    app.runtime.init(
                        context
                    )
                );
            }

            if (
                typeof app.init ===
                "function"
            ) {

                await safeAsyncResult(
                    app.init(
                        context
                    )
                );
            }

            updateAppState(
                id,
                {

                    initialized:
                        true,

                    runtimeInitialized:
                        true

                }
            );

            emit(
                "app-runtime-initialized",
                {

                    app,

                    context

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Runtime Initialization: " +
                id
            );

            updateAppState(
                id,
                {

                    runtimeInitialized:
                        false,

                    error:
                        String(
                            exception &&
                            exception.message ||
                            exception
                        )

                }
            );

            return false;
        }
    }


    /* ========================================================
       164 — APP RUNTIME START
       ======================================================== */

    async function startRuntime(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        try {

            const context =
                getRuntimeContext(
                    id
                );

            if (!context) {
                return false;
            }

            if (
                app.runtime &&
                typeof app.runtime.start ===
                "function"
            ) {

                await safeAsyncResult(
                    app.runtime.start(
                        context
                    )
                );
            }

            if (
                typeof app.start ===
                "function"
            ) {

                await safeAsyncResult(
                    app.start(
                        context
                    )
                );
            }

            updateAppState(
                id,
                {

                    started:
                        true,

                    ready:
                        true,

                    error:
                        null

                }
            );

            emit(
                "app-runtime-started",
                {

                    app,

                    context

                }
            );

            emit(
                "app-ready",
                {

                    app,

                    context

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Runtime Start: " +
                id
            );

            updateAppState(
                id,
                {

                    started:
                        false,

                    ready:
                        false,

                    error:
                        String(
                            exception &&
                            exception.message ||
                            exception
                        )

                }
            );

            return false;
        }
    }


    /* ========================================================
       165 — APP RUNTIME STOP
       ======================================================== */

    async function stopRuntime(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        try {

            const context =
                getRuntimeContext(
                    id
                );

            if (
                app.runtime &&
                typeof app.runtime.stop ===
                "function"
            ) {

                await safeAsyncResult(
                    app.runtime.stop(
                        context
                    )
                );
            }

            if (
                typeof app.stop ===
                "function"
            ) {

                await safeAsyncResult(
                    app.stop(
                        context
                    )
                );
            }

            updateAppState(
                id,
                {

                    started:
                        false,

                    ready:
                        false,

                    active:
                        false

                }
            );

            if (
                state.activeAppId ===
                id
            ) {

                state.activeAppId =
                    null;
            }

            emit(
                "app-runtime-stopped",
                {

                    app,

                    context

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Runtime Stop: " +
                id
            );

            return false;
        }
    }


    /* ========================================================
       166 — APP RUNTIME DESTROY
       ======================================================== */

    async function destroyRuntime(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        try {

            const context =
                getContext(
                    id
                );

            if (
                app.runtime &&
                typeof app.runtime.destroy ===
                "function"
            ) {

                await safeAsyncResult(
                    app.runtime.destroy(
                        context
                    )
                );
            }

            if (
                typeof app.destroy ===
                "function"
            ) {

                await safeAsyncResult(
                    app.destroy(
                        context
                    )
                );
            }

            updateAppState(
                id,
                {

                    initialized:
                        false,

                    runtimeInitialized:
                        false,

                    started:
                        false,

                    ready:
                        false,

                    active:
                        false

                }
            );

            state.contexts.delete(
                id
            );

            if (
                state.activeAppId ===
                id
            ) {

                state.activeAppId =
                    null;
            }

            emit(
                "app-runtime-destroyed",
                {

                    appId:
                        id,

                    app

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Runtime Destroy: " +
                id
            );

            return false;
        }
    }


    /* ========================================================
       167 — APP RUNTIME LIFECYCLE
       ======================================================== */

    async function startLifecycle(
        appId
    ) {

        const initialized =
            await initializeRuntime(
                appId
            );

        if (!initialized) {
            return false;
        }

        return startRuntime(
            appId
        );
    }


    async function stopLifecycle(
        appId
    ) {

        return stopRuntime(
            appId
        );
    }
           /* ========================================================
       168 — APP RUNTIME RESTART
       ======================================================== */

    async function restartRuntime(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        try {

            await stopRuntime(
                id
            );

            await destroyRuntime(
                id
            );

            return await startLifecycle(
                id
            );

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Runtime Restart: " +
                id
            );

            return false;
        }
    }


    /* ========================================================
       169 — APP RUNTIME STATUS
       ======================================================== */

    function getRuntimeStatus(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        const id =
            normalizeId(
                app.id
            );

        const state =
            getAppState(
                id
            );

        const context =
            getContext(
                id
            );

        return {

            appId:
                id,

            initialized:
                state.initialized ===
                true,

            runtimeInitialized:
                state.runtimeInitialized ===
                true,

            started:
                state.started ===
                true,

            ready:
                state.ready ===
                true,

            active:
                state.active ===
                true,

            open:
                state.open ===
                true,

            visible:
                state.visible ===
                true,

            minimized:
                state.minimized ===
                true,

            maximized:
                state.maximized ===
                true,

            fullscreen:
                state.fullscreen ===
                true,

            pip:
                state.pip ===
                true,

            windowId:
                state.windowId ||
                null,

            hasContext:
                !!context,

            hasServices:
                !!(
                    context &&
                    context.services
                ),

            error:
                state.error ||
                null,

            updatedAt:
                state.updatedAt ||
                null

        };
    }


    /* ========================================================
       170 — APP READY CHECK
       ======================================================== */

    function isReady(
        appId
    ) {

        const status =
            getRuntimeStatus(
                appId
            );

        if (!status) {
            return false;
        }

        return (
            status.ready === true &&
            status.runtimeInitialized ===
                true
        );
    }


    /* ========================================================
       171 — APP ACTIVE CHECK
       ======================================================== */

    function isActive(
        appId
    ) {

        const status =
            getRuntimeStatus(
                appId
            );

        return !!(
            status &&
            status.active ===
            true
        );
    }


    /* ========================================================
       172 — APP OPEN CHECK
       ======================================================== */

    function isOpen(
        appId
    ) {

        const status =
            getRuntimeStatus(
                appId
            );

        return !!(
            status &&
            status.open ===
            true
        );
    }


    /* ========================================================
       173 — APP VISIBILITY CHECK
       ======================================================== */

    function isVisible(
        appId
    ) {

        const status =
            getRuntimeStatus(
                appId
            );

        return !!(
            status &&
            status.visible ===
            true
        );
    }


    /* ========================================================
       174 — APP WINDOW CHECK
       ======================================================== */

    function hasWindow(
        appId
    ) {

        const status =
            getRuntimeStatus(
                appId
            );

        return !!(
            status &&
            status.windowId
        );
    }


    /* ========================================================
       175 — APP ERROR RESET
       ======================================================== */

    function clearError(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        updateAppState(
            id,
            {

                error:
                    null

            }
        );

        emit(
            "app-error-cleared",
            {

                appId:
                    id

            }
        );

        return true;
    }


    /* ========================================================
       176 — APP HEALTH CHECK
       ======================================================== */

    async function healthCheck(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        const id =
            normalizeId(
                app.id
            );

        const status =
            getRuntimeStatus(
                id
            );

        const checks = {

            registered:
                !!app,

            context:
                !!(
                    status &&
                    status.hasContext
                ),

            services:
                !!(
                    status &&
                    status.hasServices
                ),

            runtime:
                !!(
                    status &&
                    status.runtimeInitialized
                ),

            ready:
                !!(
                    status &&
                    status.ready
                ),

            window:
                !!(
                    status &&
                    status.windowId
                )

        };

        const healthy =
            Object.keys(
                checks
            ).every(
                key =>
                    checks[key] === true
            );

        const result = {

            appId:
                id,

            healthy,

            checks,

            status,

            timestamp:
                now()

        };

        emit(
            "app-health-check",
            result
        );

        return result;
    }
           /* ========================================================
       177 — APP WINDOW STATE
       ======================================================== */

    function getWindowState(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        const id =
            normalizeId(
                app.id
            );

        const window =
            getWindow(
                id
            );

        const state =
            getAppState(
                id
            );

        if (!window) {

            return {

                appId:
                    id,

                exists:
                    false,

                windowId:
                    state.windowId ||
                    null,

                open:
                    state.open ===
                    true,

                visible:
                    state.visible ===
                    true,

                minimized:
                    state.minimized ===
                    true,

                maximized:
                    state.maximized ===
                    true,

                fullscreen:
                    state.fullscreen ===
                    true,

                pip:
                    state.pip ===
                    true

            };
        }

        return {

            appId:
                id,

            exists:
                true,

            windowId:
                window.id ||
                window.windowId ||
                state.windowId ||
                null,

            open:
                state.open === true,

            visible:
                state.visible === true,

            minimized:
                state.minimized === true,

            maximized:
                state.maximized === true,

            fullscreen:
                state.fullscreen === true,

            pip:
                state.pip === true,

            focused:
                window.focused === true ||
                window.active === true,

            x:
                window.x ??
                window.left ??
                null,

            y:
                window.y ??
                window.top ??
                null,

            width:
                window.width ??
                null,

            height:
                window.height ??
                null

        };
    }


    /* ========================================================
       178 — APP WINDOW POSITION GET
       ======================================================== */

    function getPosition(
        appId
    ) {

        const state =
            getWindowState(
                appId
            );

        if (!state) {
            return null;
        }

        return {

            x:
                state.x,

            y:
                state.y

        };
    }


    /* ========================================================
       179 — APP WINDOW SIZE GET
       ======================================================== */

    function getSize(
        appId
    ) {

        const state =
            getWindowState(
                appId
            );

        if (!state) {
            return null;
        }

        return {

            width:
                state.width,

            height:
                state.height

        };
    }


    /* ========================================================
       180 — APP WINDOW MOVE
       ======================================================== */

    async function move(
        appId,
        x,
        y
    ) {

        const position = {

            x:
                Number.isFinite(
                    Number(x)
                )
                    ? Number(x)
                    : 0,

            y:
                Number.isFinite(
                    Number(y)
                )
                    ? Number(y)
                    : 0

        };

        return setPosition(
            appId,
            position
        );
    }


    /* ========================================================
       181 — APP WINDOW RESIZE
       ======================================================== */

    async function resize(
        appId,
        width,
        height
    ) {

        const size = {

            width:
                Math.max(
                    1,
                    Number(width) || 1
                ),

            height:
                Math.max(
                    1,
                    Number(height) || 1
                )

        };

        return setSize(
            appId,
            size
        );
    }


    /* ========================================================
       182 — APP WINDOW TOGGLE MAXIMIZE
       ======================================================== */

    async function toggleMaximize(
        appId
    ) {

        const state =
            getWindowState(
                appId
            );

        if (!state) {
            return false;
        }

        if (
            state.maximized ===
            true
        ) {

            return restore(
                appId
            );
        }

        return maximize(
            appId
        );
    }


    /* ========================================================
       183 — APP WINDOW TOGGLE PIP
       ======================================================== */

    async function togglePip(
        appId
    ) {

        const state =
            getWindowState(
                appId
            );

        if (!state) {
            return false;
        }

        return setPip(
            appId,
            state.pip !== true
        );
    }


    /* ========================================================
       184 — APP WINDOW TOGGLE FULLSCREEN
       ======================================================== */

    async function toggleFullscreen(
        appId
    ) {

        const state =
            getWindowState(
                appId
            );

        if (!state) {
            return false;
        }

        return fullscreen(
            appId,
            state.fullscreen !== true
        );
    }


    /* ========================================================
       185 — APP WINDOW ACTIVATE
       ======================================================== */

    async function activate(
        appId
    ) {

        const result =
            await focus(
                appId
            );

        if (!result) {
            return false;
        }

        await show(
            appId
        );

        return true;
    }
          /* ========================================================
       177 — APP WINDOW STATE
       ======================================================== */

    function getWindowState(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        const id =
            normalizeId(
                app.id
            );

        const window =
            getWindow(
                id
            );

        const state =
            getAppState(
                id
            );

        if (!window) {

            return {

                appId:
                    id,

                exists:
                    false,

                windowId:
                    state.windowId ||
                    null,

                open:
                    state.open ===
                    true,

                visible:
                    state.visible ===
                    true,

                minimized:
                    state.minimized ===
                    true,

                maximized:
                    state.maximized ===
                    true,

                fullscreen:
                    state.fullscreen ===
                    true,

                pip:
                    state.pip ===
                    true

            };
        }

        return {

            appId:
                id,

            exists:
                true,

            windowId:
                window.id ||
                window.windowId ||
                state.windowId ||
                null,

            open:
                state.open === true,

            visible:
                state.visible === true,

            minimized:
                state.minimized === true,

            maximized:
                state.maximized === true,

            fullscreen:
                state.fullscreen === true,

            pip:
                state.pip === true,

            focused:
                window.focused === true ||
                window.active === true,

            x:
                window.x ??
                window.left ??
                null,

            y:
                window.y ??
                window.top ??
                null,

            width:
                window.width ??
                null,

            height:
                window.height ??
                null

        };
    }


    /* ========================================================
       178 — APP WINDOW POSITION GET
       ======================================================== */

    function getPosition(
        appId
    ) {

        const state =
            getWindowState(
                appId
            );

        if (!state) {
            return null;
        }

        return {

            x:
                state.x,

            y:
                state.y

        };
    }


    /* ========================================================
       179 — APP WINDOW SIZE GET
       ======================================================== */

    function getSize(
        appId
    ) {

        const state =
            getWindowState(
                appId
            );

        if (!state) {
            return null;
        }

        return {

            width:
                state.width,

            height:
                state.height

        };
    }


    /* ========================================================
       180 — APP WINDOW MOVE
       ======================================================== */

    async function move(
        appId,
        x,
        y
    ) {

        const position = {

            x:
                Number.isFinite(
                    Number(x)
                )
                    ? Number(x)
                    : 0,

            y:
                Number.isFinite(
                    Number(y)
                )
                    ? Number(y)
                    : 0

        };

        return setPosition(
            appId,
            position
        );
    }


    /* ========================================================
       181 — APP WINDOW RESIZE
       ======================================================== */

    async function resize(
        appId,
        width,
        height
    ) {

        const size = {

            width:
                Math.max(
                    1,
                    Number(width) || 1
                ),

            height:
                Math.max(
                    1,
                    Number(height) || 1
                )

        };

        return setSize(
            appId,
            size
        );
    }


    /* ========================================================
       182 — APP WINDOW TOGGLE MAXIMIZE
       ======================================================== */

    async function toggleMaximize(
        appId
    ) {

        const state =
            getWindowState(
                appId
            );

        if (!state) {
            return false;
        }

        if (
            state.maximized ===
            true
        ) {

            return restore(
                appId
            );
        }

        return maximize(
            appId
        );
    }


    /* ========================================================
       183 — APP WINDOW TOGGLE PIP
       ======================================================== */

    async function togglePip(
        appId
    ) {

        const state =
            getWindowState(
                appId
            );

        if (!state) {
            return false;
        }

        return setPip(
            appId,
            state.pip !== true
        );
    }


    /* ========================================================
       184 — APP WINDOW TOGGLE FULLSCREEN
       ======================================================== */

    async function toggleFullscreen(
        appId
    ) {

        const state =
            getWindowState(
                appId
            );

        if (!state) {
            return false;
        }

        return fullscreen(
            appId,
            state.fullscreen !== true
        );
    }


    /* ========================================================
       185 — APP WINDOW ACTIVATE
       ======================================================== */

    async function activate(
        appId
    ) {

        const result =
            await focus(
                appId
            );

        if (!result) {
            return false;
        }

        await show(
            appId
        );

        return true;
    }
           /* ========================================================
       186 — APP WINDOW BOUNDS
       ======================================================== */

    async function setBounds(
        appId,
        bounds = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const next =
            {};

        if (
            Number.isFinite(
                Number(
                    bounds.x
                )
            )
        ) {

            next.x =
                Number(
                    bounds.x
                );
        }

        if (
            Number.isFinite(
                Number(
                    bounds.y
                )
            )
        ) {

            next.y =
                Number(
                    bounds.y
                );
        }

        if (
            Number.isFinite(
                Number(
                    bounds.width
                )
            )
        ) {

            next.width =
                Math.max(
                    1,
                    Number(
                        bounds.width
                    )
                );
        }

        if (
            Number.isFinite(
                Number(
                    bounds.height
                )
            )
        ) {

            next.height =
                Math.max(
                    1,
                    Number(
                        bounds.height
                    )
                );
        }

        if (
            Object.keys(
                next
            ).length === 0
        ) {

            return false;
        }

        try {

            const position = {};

            if (
                Object.prototype.hasOwnProperty.call(
                    next,
                    "x"
                )
            ) {

                position.x =
                    next.x;
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    next,
                    "y"
                )
            ) {

                position.y =
                    next.y;
            }

            const size = {};

            if (
                Object.prototype.hasOwnProperty.call(
                    next,
                    "width"
                )
            ) {

                size.width =
                    next.width;
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    next,
                    "height"
                )
            ) {

                size.height =
                    next.height;
            }

            if (
                Object.keys(
                    position
                ).length > 0
            ) {

                await setPosition(
                    app.id,
                    position
                );
            }

            if (
                Object.keys(
                    size
                ).length > 0
            ) {

                await setSize(
                    app.id,
                    size
                );
            }

            emit(
                "app-window-bounds-changed",
                {

                    app,

                    bounds:
                        next

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Window Bounds: " +
                app.id
            );

            return false;
        }
    }


    /* ========================================================
       187 — APP WINDOW SNAP
       ======================================================== */

    async function snap(
        appId,
        target = "center"
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const window =
            getWindow(
                app.id
            );

        const manager =
            getWindowManager();

        if (!window) {
            return false;
        }

        try {

            const windowId =
                window.id ||
                window.windowId;

            if (
                manager &&
                hasMethod(
                    manager,
                    "snap"
                )
            ) {

                await safeAsyncResult(
                    manager.snap(
                        windowId,
                        target
                    )
                );

            } else {

                const viewport =
                    getViewport();

                if (
                    !viewport
                ) {

                    return false;
                }

                const width =
                    Number(
                        window.width
                    ) ||
                    480;

                const height =
                    Number(
                        window.height
                    ) ||
                    360;

                const viewportWidth =
                    Number(
                        viewport.width
                    ) ||
                    0;

                const viewportHeight =
                    Number(
                        viewport.height
                    ) ||
                    0;

                let x =
                    Math.max(
                        0,
                        (
                            viewportWidth -
                            width
                        ) / 2
                    );

                let y =
                    Math.max(
                        0,
                        (
                            viewportHeight -
                            height
                        ) / 2
                    );

                const normalizedTarget =
                    String(
                        target ||
                        "center"
                    )
                        .toLowerCase();

                if (
                    normalizedTarget ===
                    "left"
                ) {

                    x = 0;

                } else if (
                    normalizedTarget ===
                    "right"
                ) {

                    x =
                        Math.max(
                            0,
                            viewportWidth -
                            width
                        );

                } else if (
                    normalizedTarget ===
                    "top"
                ) {

                    y = 0;

                } else if (
                    normalizedTarget ===
                    "bottom"
                ) {

                    y =
                        Math.max(
                            0,
                            viewportHeight -
                            height
                        );
                }

                await setPosition(
                    app.id,
                    {
                        x,
                        y
                    }
                );
            }

            emit(
                "app-window-snapped",
                {

                    app,

                    target

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Window Snap: " +
                app.id
            );

            return false;
        }
    }


    /* ========================================================
       188 — APP WINDOW CENTER
       ======================================================== */

    async function center(
        appId
    ) {

        return snap(
            appId,
            "center"
        );
    }


    /* ========================================================
       189 — APP WINDOW FIT VIEWPORT
       ======================================================== */

    async function fitViewport(
        appId,
        margin = 16
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const viewport =
            getViewport();

        if (!viewport) {
            return false;
        }

        const width =
            Math.max(
                1,
                Number(
                    viewport.width
                ) -
                (
                    Number(
                        margin
                    ) || 0
                ) * 2
            );

        const height =
            Math.max(
                1,
                Number(
                    viewport.height
                ) -
                (
                    Number(
                        margin
                    ) || 0
                ) * 2
            );

        try {

            await setBounds(
                app.id,
                {

                    x:
                        Number(
                            margin
                        ) || 0,

                    y:
                        Number(
                            margin
                        ) || 0,

                    width,

                    height

                }
            );

            emit(
                "app-window-fit-viewport",
                {

                    app,

                    width,

                    height,

                    margin

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Window Fit Viewport: " +
                app.id
            );

            return false;
        }
    }


    /* ========================================================
       190 — APP WINDOW RESPONSIVE MODE
       ======================================================== */

    function getResponsiveMode() {

        const viewport =
            getViewport();

        if (!viewport) {

            return "desktop";
        }

        const width =
            Number(
                viewport.width
            ) || 0;

        if (
            width <= 480
        ) {

            return "mobile";

        }

        if (
            width <= 768
        ) {

            return "tablet";

        }

        if (
            width <= 1200
        ) {

            return "laptop";
        }

        return "desktop";
    }


    /* ========================================================
       191 — APP WINDOW RESPONSIVE ADJUST
       ======================================================== */

    async function applyResponsiveWindow(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const viewport =
            getViewport();

        if (!viewport) {
            return false;
        }

        const mode =
            getResponsiveMode();

        const width =
            Number(
                viewport.width
            ) || 0;

        const height =
            Number(
                viewport.height
            ) || 0;

        let bounds;

        if (
            mode ===
            "mobile"
        ) {

            bounds = {

                x: 0,

                y: 0,

                width,

                height

            };

        } else if (
            mode ===
            "tablet"
        ) {

            bounds = {

                x: 8,

                y: 8,

                width:
                    Math.max(
                        1,
                        width - 16
                    ),

                height:
                    Math.max(
                        1,
                        height - 16
                    )

            };

        } else {

            bounds = {

                x:
                    undefined,

                y:
                    undefined,

                width:
                    Math.min(
                        width - 32,
                        1200
                    ),

                height:
                    Math.min(
                        height - 32,
                        900
                    )

            };
        }

        if (
            bounds.x ===
            undefined
        ) {

            delete bounds.x;
        }

        if (
            bounds.y ===
            undefined
        ) {

            delete bounds.y;
        }

        await setBounds(
            app.id,
            bounds
        );

        emit(
            "app-window-responsive-adjusted",
            {

                app,

                mode,

                bounds

            }
        );

        return true;
    }
       /* ========================================================
   162 — APP RUNTIME CONTRACT
   ======================================================== */

    function getRuntimeContract(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        const contract =
            getContract();

        const context =
            getRuntimeContext(
                app.id
            );

        const base = {

            id:
                app.id,

            appId:
                app.id,

            version:
                app.version ||
                "1.0.0",

            name:
                app.name ||
                app.title ||
                app.id,

            title:
                app.title ||
                app.name ||
                app.id,

            route:
                app.route ||
                null,

            icon:
                app.icon ||
                null,

            enabled:
                app.enabled !==
                false,

            manager:
                api,

            context,

            services:
                context?.services ||
                {},

            state:
                getAppState(
                    app.id
                ),

            open:
                options =>
                    open(
                        app.id,
                        options
                    ),

            close:
                options =>
                    close(
                        app.id,
                        options
                    ),

            focus:
                () =>
                    focus(
                        app.id
                    ),

            minimize:
                () =>
                    minimize(
                        app.id
                    ),

            maximize:
                () =>
                    maximize(
                        app.id
                    ),

            restore:
                () =>
                    restore(
                        app.id
                    )

        };

        if (
            contract &&
            isObject(
                contract
            )
        ) {

            return {

                ...contract,

                ...base

            };
        }

        return base;
    }


/* ========================================================
   163 — APP LIFECYCLE CONTEXT
   ======================================================== */

    function createLifecycleContext(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        return {

            app,

            appId:
                app.id,

            manager:
                api,

            context:
                getRuntimeContext(
                    app.id
                ),

            contract:
                getRuntimeContract(
                    app.id
                ),

            services:
                createAppServices(
                    app.id
                ),

            state:
                getAppState(
                    app.id
                ),

            metadata:
                getMetadata(
                    app.id
                ),

            options,

            timestamp:
                now()

        };
    }


/* ========================================================
   164 — APP BEFORE OPEN
   ======================================================== */

    async function beforeOpen(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const context =
            createLifecycleContext(
                app.id,
                options
            );

        try {

            if (
                typeof app.beforeOpen ===
                "function"
            ) {

                const result =
                    await safeAsyncResult(
                        app.beforeOpen(
                            context
                        )
                    );

                if (
                    result ===
                    false
                ) {

                    return false;
                }
            }

            emit(
                "app-before-open",
                {
                    ...context
                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Before Open: " +
                app.id
            );

            return false;
        }
    }


/* ========================================================
   165 — APP AFTER OPEN
   ======================================================== */

    async function afterOpen(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const context =
            createLifecycleContext(
                app.id,
                options
            );

        try {

            if (
                typeof app.afterOpen ===
                "function"
            ) {

                await safeAsyncResult(
                    app.afterOpen(
                        context
                    )
                );
            }

            emit(
                "app-after-open",
                {
                    ...context
                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App After Open: " +
                app.id
            );

            return false;
        }
    }


/* ========================================================
   166 — APP BEFORE CLOSE
   ======================================================== */

    async function beforeClose(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const context =
            createLifecycleContext(
                app.id,
                options
            );

        try {

            if (
                typeof app.beforeClose ===
                "function"
            ) {

                const result =
                    await safeAsyncResult(
                        app.beforeClose(
                            context
                        )
                    );

                if (
                    result ===
                    false
                ) {

                    return false;
                }
            }

            emit(
                "app-before-close",
                {
                    ...context
                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Before Close: " +
                app.id
            );

            return false;
        }
    }
       /* ============================================================
   HALDO AI OS
   js/app-manager.js
   TEIL 14 / 16
   DIREKT NACH TEIL 13 EINFÜGEN
   ============================================================ */


/* ========================================================
   171 — APP AFTER STOP
   ======================================================== */

    async function afterStop(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const context =
            createLifecycleContext(
                app.id,
                options
            );

        try {

            if (
                typeof app.afterStop ===
                "function"
            ) {

                await safeAsyncResult(
                    app.afterStop(
                        context
                    )
                );

            }

            emit(
                "app-after-stop",
                {

                    ...context

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App After Stop: " +
                app.id
            );

            return false;
        }

    }


/* ========================================================
   172 — APP BEFORE INITIALIZE
   ======================================================== */

    async function beforeInitialize(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const context =
            createLifecycleContext(
                app.id,
                options
            );

        try {

            if (
                typeof app.beforeInitialize ===
                "function"
            ) {

                const result =
                    await safeAsyncResult(
                        app.beforeInitialize(
                            context
                        )
                    );

                if (
                    result ===
                    false
                ) {

                    return false;
                }

            }

            emit(
                "app-before-initialize",
                {

                    ...context

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Before Initialize: " +
                app.id
            );

            return false;
        }

    }


/* ========================================================
   173 — APP AFTER INITIALIZE
   ======================================================== */

    async function afterInitialize(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const context =
            createLifecycleContext(
                app.id,
                options
            );

        try {

            if (
                typeof app.afterInitialize ===
                "function"
            ) {

                await safeAsyncResult(
                    app.afterInitialize(
                        context
                    )
                );

            }

            emit(
                "app-after-initialize",
                {

                    ...context

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App After Initialize: " +
                app.id
            );

            return false;
        }

    }


/* ========================================================
   174 — APP LIFECYCLE HOOK RUNNER
   ======================================================== */

    async function runLifecycleHook(
        appId,
        hook,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const name =
            String(
                hook ||
                ""
            )
                .trim();

        if (!name) {
            return false;
        }

        const context =
            createLifecycleContext(
                app.id,
                options
            );

        try {

            if (
                typeof app[name] ===
                "function"
            ) {

                const result =
                    await safeAsyncResult(
                        app[name](
                            context
                        )
                    );

                if (
                    result ===
                    false
                ) {

                    return false;
                }

            }

            emit(
                "app-lifecycle-hook",
                {

                    app,

                    hook:
                        name,

                    context

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Lifecycle Hook: " +
                app.id +
                " / " +
                name
            );

            return false;
        }

    }


/* ========================================================
   175 — START WITH LIFECYCLE
   ======================================================== */

    async function startWithLifecycle(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const allowed =
            await beforeStart(
                app.id,
                options
            );

        if (!allowed) {
            return false;
        }

        const started =
            await startApp(
                app,
                options
            );

        if (!started) {
            return false;
        }

        await afterStart(
            app.id,
            options
        );

        return true;
    }


/* ========================================================
   176 — STOP APP
   ======================================================== */

    async function stopApp(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        const instance =
            state.instances.get(
                id
            );

        if (
            !instance ||
            instance.started !==
            true
        ) {

            updateAppState(
                id,
                {

                    started:
                        false,

                    running:
                        false

                }
            );

            return true;
        }

        const allowed =
            await beforeStop(
                id,
                options
            );

        if (!allowed) {
            return false;
        }

        try {

            const context =
                createLifecycleContext(
                    id,
                    options
                );

            if (
                typeof app.stop ===
                "function"
            ) {

                await safeAsyncResult(
                    app.stop(
                        context
                    )
                );

            }

            state.instances.set(
                id,
                {

                    ...instance,

                    initialized:
                        true,

                    started:
                        false,

                    stoppedAt:
                        now()

                }
            );

            state.statistics.stops +=
                1;

            updateAppState(
                id,
                {

                    started:
                        false,

                    running:
                        false,

                    active:
                        false,

                    status:
                        "stopped",

                    lifecycle:
                        "stopped"

                }
            );

            if (
                state.activeAppId ===
                id
            ) {

                state.activeAppId =
                    null;
            }

            emit(
                "app-stopped",
                {

                    app,

                    options,

                    state:
                        getAppState(
                            id
                        )

                }
            );

            await afterStop(
                id,
                options
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Stop: " +
                id
            );

            updateAppState(
                id,
                {

                    status:
                        "error",

                    lifecycle:
                        "error",

                    error:
                        exception.message

                }
            );

            return false;
        }

    }


/* ========================================================
   177 — STOP ALL APPS
   ======================================================== */

    async function stopAll(
        options = {}
    ) {

        const apps =
            getRunningApps();

        const results =
            [];

        for (
            const app of apps
        ) {

            try {

                results.push(
                    {

                        id:
                            app.id,

                        result:
                            await stopApp(
                                app.id,
                                options
                            )

                    }
                );

            } catch (
                exception
            ) {

                results.push(
                    {

                        id:
                            app.id,

                        result:
                            false,

                        error:
                            exception.message

                    }
                );

            }

        }

        emit(
            "apps-stopped",
            {

                results,

                count:
                    results.length

            }
        );

        return results;
    }


/* ========================================================
   178 — CLOSE WINDOW ONLY
   ======================================================== */

    async function closeWindow(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const window =
            getWindow(
                app.id
            );

        const manager =
            getWindowManager();

        if (
            !window ||
            !manager
        ) {

            return false;
        }

        try {

            const windowId =
                window.id ||
                window.windowId;

            if (
                hasMethod(
                    manager,
                    "close"
                )
            ) {

                await safeAsyncResult(
                    manager.close(
                        windowId
                    )
                );

            } else if (
                hasMethod(
                    manager,
                    "destroy"
                )
            ) {

                await safeAsyncResult(
                    manager.destroy(
                        windowId
                    )
                );

            }

            updateAppState(
                app.id,
                {

                    open:
                        false,

                    active:
                        false,

                    visible:
                        false,

                    windowId:
                        null,

                    status:
                        "closed",

                    lifecycle:
                        "closed"

                }
            );

            emit(
                "app-window-closed",
                {

                    app

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Close Window: " +
                app.id
            );

            return false;
        }

    }


/* ========================================================
   179 — CLOSE APP
   ======================================================== */

    async function close(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const id =
            normalizeId(
                app.id
            );

        const current =
            createInitialState(
                id
            );

        if (
            !current.open &&
            !current.windowId
        ) {

            if (
                options.stop ===
                true
            ) {

                await stopApp(
                    id,
                    options
                );
            }

            return true;
        }

        const allowed =
            await beforeClose(
                id,
                options
            );

        if (!allowed) {
            return false;
        }

        try {

            const context =
                createLifecycleContext(
                    id,
                    options
                );

            if (
                typeof app.close ===
                "function"
            ) {

                await safeAsyncResult(
                    app.close(
                        context
                    )
                );

            }

            if (
                options.keepWindow !==
                true
            ) {

                await closeWindow(
                    id
                );

            } else {

                updateAppState(
                    id,
                    {

                        open:
                            false,

                        active:
                            false

                    }
                );
            }

            if (
                options.stop ===
                true
            ) {

                await stopApp(
                    id,
                    options
                );
            }

            state.statistics.closes +=
                1;

            if (
                state.activeAppId ===
                id
            ) {

                state.activeAppId =
                    null;
            }

            updateAppState(
                id,
                {

                    open:
                        false,

                    active:
                        false,

                    visible:
                        false,

                    loading:
                        false,

                    minimized:
                        false,

                    maximized:
                        false,

                    pip:
                        false,

                    status:
                        "closed",

                    lifecycle:
                        "closed",

                    ready:
                        true

                }
            );

            emit(
                "app-closed",
                {

                    app,

                    options,

                    state:
                        getAppState(
                            id
                        )

                }
            );

            dispatch(
                "haldo:app-closed",
                {

                    app,

                    options

                }
            );

            await afterClose(
                id,
                options
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Close: " +
                id
            );

            updateAppState(
                id,
                {

                    status:
                        "error",

                    lifecycle:
                        "error",

                    error:
                        exception.message,

                    loading:
                        false

                }
            );

            return false;
        }

    }


/* ========================================================
   180 — CLOSE ALL APPS
   ======================================================== */

    async function closeAll(
        options = {}
    ) {

        const apps =
            getOpenApps();

        const results =
            [];

        for (
            const app of apps
        ) {

            try {

                results.push(
                    {

                        id:
                            app.id,

                        result:
                            await close(
                                app.id,
                                options
                            )

                    }
                );

            } catch (
                exception
            ) {

                results.push(
                    {

                        id:
                            app.id,

                        result:
                            false,

                        error:
                            exception.message

                    }
                );

            }

        }

        state.activeAppId =
            null;

        emit(
            "apps-closed",
            {

                results,

                count:
                    results.length

            }
        );

        return results;
    }


/* ========================================================
   ENDE TEIL 14
   ======================================================== */
       /* ============================================================
   HALDO AI OS
   js/app-manager.js
   TEIL 15 / 16
   DIREKT NACH TEIL 14 EINFÜGEN
   ============================================================ */


/* ========================================================
   181 — RESTART APP
   ======================================================== */

    async function restart(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const wasOpen =
            isOpen(
                app.id
            );

        const wasStarted =
            isRunning(
                app.id
            );

        try {

            if (wasOpen) {

                const closed =
                    await close(
                        app.id,
                        {

                            ...options,

                            restart:
                                true,

                            stop:
                                false

                        }
                    );

                if (!closed) {
                    return false;
                }

            }

            if (wasStarted) {

                const stopped =
                    await stopApp(
                        app.id,
                        {

                            ...options,

                            restart:
                                true

                        }
                    );

                if (!stopped) {
                    return false;
                }

            }

            const started =
                await startWithLifecycle(
                    app.id,
                    {

                        ...options,

                        restart:
                            true

                    }
                );

            if (!started) {
                return false;
            }

            const result =
                await open(
                    app.id,
                    {

                        ...options,

                        restart:
                            true

                    }
                );

            emit(
                "app-restarted",
                {

                    app,

                    result,

                    options

                }
            );

            return !!result;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Restart: " +
                app.id
            );

            return false;
        }

    }


/* ========================================================
   182 — RELOAD APP
   ======================================================== */

    async function reload(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        const context =
            createLifecycleContext(
                app.id,
                options
            );

        try {

            if (
                typeof app.reload ===
                "function"
            ) {

                const result =
                    await safeAsyncResult(
                        app.reload(
                            context
                        )
                    );

                if (
                    result ===
                    false
                ) {

                    return false;
                }

            } else {

                const result =
                    await restart(
                        app.id,
                        {

                            ...options,

                            reload:
                                true

                        }
                    );

                if (!result) {
                    return false;
                }

            }

            emit(
                "app-reloaded",
                {

                    app,

                    options

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Reload: " +
                app.id
            );

            return false;
        }

    }


/* ========================================================
   183 — APP REFRESH
   ======================================================== */

    async function refresh(
        appId,
        options = {}
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return false;
        }

        try {

            if (
                typeof app.refresh ===
                "function"
            ) {

                const context =
                    createLifecycleContext(
                        app.id,
                        options
                    );

                const result =
                    await safeAsyncResult(
                        app.refresh(
                            context
                        )
                    );

                if (
                    result ===
                    false
                ) {

                    return false;
                }

            } else {

                const window =
                    getWindow(
                        app.id
                    );

                const manager =
                    getWindowManager();

                if (
                    window &&
                    manager
                ) {

                    const windowId =
                        window.id ||
                        window.windowId;

                    if (
                        hasMethod(
                            manager,
                            "refresh"
                        )
                    ) {

                        await safeAsyncResult(
                            manager.refresh(
                                windowId
                            )
                        );

                    } else {

                        const element =
                            window.element ||
                            window.el ||
                            null;

                        if (
                            element
                        ) {

                            element.dispatchEvent(
                                new Event(
                                    "haldo:app-refresh"
                                )
                            );

                        }

                    }

                }

            }

            emit(
                "app-refreshed",
                {

                    app,

                    options

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Refresh: " +
                app.id
            );

            return false;
        }

    }


/* ========================================================
   184 — REFRESH ALL APPS
   ======================================================== */

    async function refreshAll(
        options = {}
    ) {

        const apps =
            getOpenApps();

        const results =
            [];

        for (
            const app of apps
        ) {

            try {

                results.push(
                    {

                        id:
                            app.id,

                        result:
                            await refresh(
                                app.id,
                                options
                            )

                    }
                );

            } catch (
                exception
            ) {

                results.push(
                    {

                        id:
                            app.id,

                        result:
                            false,

                        error:
                            exception.message

                    }
                );

            }

        }

        emit(
            "apps-refreshed",
            {

                results,

                count:
                    results.length

            }
        );

        return results;
    }


/* ========================================================
   185 — RESTART ALL APPS
   ======================================================== */

    async function restartAll(
        options = {}
    ) {

        const apps =
            getOpenApps();

        const results =
            [];

        for (
            const app of apps
        ) {

            try {

                results.push(
                    {

                        id:
                            app.id,

                        result:
                            await restart(
                                app.id,
                                options
                            )

                    }
                );

            } catch (
                exception
            ) {

                results.push(
                    {

                        id:
                            app.id,

                        result:
                            false,

                        error:
                            exception.message

                    }
                );

            }

        }

        emit(
            "apps-restarted",
            {

                results,

                count:
                    results.length

            }
        );

        return results;
    }


/* ========================================================
   ENDE TEIL 15
   ======================================================== */
       /* ============================================================
   HALDO AI OS
   js/app-manager.js
   TEIL 16 / 16
   ABSCHLUSS DES APP-MANAGER-BLOCKS
   DIREKT NACH TEIL 15 EINFÜGEN
   ============================================================ */


/* ========================================================
   198 — APP INFORMATION
   ======================================================== */

    function getAppInfo(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        const id =
            normalizeId(
                app.id
            );

        return {

            id,

            name:
                app.name ||
                app.title ||
                id,

            title:
                app.title ||
                app.name ||
                id,

            version:
                app.version ||
                "1.0.0",

            description:
                app.description ||
                "",

            icon:
                app.icon ||
                null,

            route:
                app.route ||
                null,

            category:
                app.category ||
                "system",

            enabled:
                app.enabled !==
                false,

            singleton:
                app.singleton !==
                false,

            permissions:
                Array.isArray(
                    app.permissions
                )
                    ? [
                        ...app.permissions
                    ]
                    : [],

            dependencies:
                Array.isArray(
                    app.dependencies
                )
                    ? [
                        ...app.dependencies
                    ]
                    : [],

            state:
                getAppState(
                    id
                ),

            metadata:
                getMetadata(
                    id
                ),

            initialized:
                isAppInitialized(
                    id
                ),

            running:
                isRunning(
                    id
                ),

            open:
                isOpen(
                    id
                ),

            visible:
                isVisible(
                    id
                ),

            ready:
                isReady(
                    id
                )

        };
    }


/* ========================================================
   199 — APP LIST
   ======================================================== */

    function list(
        options = {}
    ) {

        const result =
            [];

        const source =
            registryApps();

        for (
            const app of source
        ) {

            if (!app) {
                continue;
            }

            if (
                options.enabledOnly ===
                true &&
                app.enabled ===
                false
            ) {
                continue;
            }

            if (
                options.category &&
                app.category !==
                options.category
            ) {
                continue;
            }

            if (
                options.search
            ) {

                const query =
                    String(
                        options.search
                    )
                        .trim()
                        .toLowerCase();

                if (!query) {
                    continue;
                }

                const haystack =
                    [

                        app.id,
                        app.name,
                        app.title,
                        app.description,
                        app.category

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                if (
                    !haystack.includes(
                        query
                    )
                ) {
                    continue;
                }

            }

            result.push(
                app
            );

        }

        return result;
    }


/* ========================================================
   200 — APP SNAPSHOT
   ======================================================== */

    function snapshot(
        appId
    ) {

        const app =
            get(
                appId
            );

        if (!app) {
            return null;
        }

        const id =
            normalizeId(
                app.id
            );

        return {

            app:
                getAppInfo(
                    id
                ),

            state:
                getAppState(
                    id
                ),

            context:
                getRuntimeContext(
                    id
                ),

            contract:
                getRuntimeContract(
                    id
                ),

            window:
                getWindow(
                    id
                ),

            instance:
                state.instances.get(
                    id
                ) || null,

            timestamp:
                now()

        };
    }


/* ========================================================
   201 — ALL APP SNAPSHOT
   ======================================================== */

    function snapshotAll() {

        const result =
            {};

        for (
            const app of
            registryApps()
        ) {

            if (!app) {
                continue;
            }

            result[
                normalizeId(
                    app.id
                )
            ] =
                snapshot(
                    app.id
                );

        }

        return result;
    }


/* ========================================================
   202 — APP STATE EXPORT
   ======================================================== */

    function exportState() {

        const appStates =
            {};

        state.appState.forEach(
            (
                value,
                key
            ) => {

                appStates[
                    key
                ] =
                    clone(
                        value
                    );

            }
        );

        return {

            version:
                "1.0",

            activeAppId:
                state.activeAppId,

            appStates,

            statistics:
                clone(
                    state.statistics
                ),

            timestamp:
                now()

        };
    }


/* ========================================================
   203 — APP STATE IMPORT
   ======================================================== */

    function importState(
        data,
        options = {}
    ) {

        if (
            !data ||
            typeof data !==
            "object"
        ) {

            return false;
        }

        try {

            if (
                data.appStates &&
                typeof data.appStates ===
                "object"
            ) {

                Object.entries(
                    data.appStates
                )
                    .forEach(
                        (
                            [
                                id,
                                value
                            ]
                        ) => {

                            if (
                                !get(
                                    id
                                )
                            ) {
                                return;
                            }

                            updateAppState(
                                id,
                                {

                                    ...clone(
                                        value
                                    ),

                                    appId:
                                        id,

                                    updatedAt:
                                        now()

                                }
                            );

                        }
                    );

            }

            if (
                options.restoreActive !==
                false &&
                data.activeAppId &&
                get(
                    data.activeAppId
                )
            ) {

                state.activeAppId =
                    normalizeId(
                        data.activeAppId
                    );

            }

            emit(
                "app-state-imported",
                {

                    data,

                    options

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App State Import"
            );

            return false;
        }
    }


/* ========================================================
   204 — APP EVENT SUBSCRIPTION
   ======================================================== */

    function onApp(
        eventName,
        listener
    ) {

        if (
            typeof listener !==
            "function"
        ) {

            return () => {};
        }

        return on(
            eventName,
            listener
        );
    }


/* ========================================================
   205 — APP EVENT ONCE
   ======================================================== */

    function onceApp(
        eventName,
        listener
    ) {

        if (
            typeof listener !==
            "function"
        ) {

            return () => {};
        }

        let active =
            true;

        const unsubscribe =
            on(
                eventName,
                (
                    payload
                ) => {

                    if (!active) {
                        return;
                    }

                    active =
                        false;

                    try {

                        listener(
                            payload
                        );

                    } finally {

                        unsubscribe();

                    }

                }
            );

        return unsubscribe;
    }


/* ========================================================
   206 — APP EVENT OFF
   ======================================================== */

    function offApp(
        eventName,
        listener
    ) {

        if (
            typeof listener !==
            "function"
        ) {

            return false;
        }

        return off(
            eventName,
            listener
        );
    }


/* ========================================================
   207 — APP MANAGER HEALTH
   ======================================================== */

    function health() {

        const apps =
            registryApps();

        const running =
            getRunningApps();

        const openApps =
            getOpenApps();

        const errors =
            apps.filter(
                app => {

                    const current =
                        getAppState(
                            app.id
                        );

                    return (
                        current &&
                        current.error
                    );

                }
            );

        return {

            healthy:
                errors.length ===
                0,

            total:
                apps.length,

            running:
                running.length,

            open:
                openApps.length,

            errors:
                errors.length,

            activeAppId:
                state.activeAppId,

            statistics:
                clone(
                    state.statistics
                ),

            timestamp:
                now()

        };
    }


/* ========================================================
   208 — APP MANAGER DIAGNOSTICS
   ======================================================== */

    async function diagnose(
        options = {}
    ) {

        const result = {

            manager:
                "HalDo App Manager",

            version:
                VERSION,

            health:
                health(),

            apps:
                {},

            timestamp:
                now()

        };

        for (
            const app of
            registryApps()
        ) {

            if (!app) {
                continue;
            }

            try {

                result.apps[
                    normalizeId(
                        app.id
                    )
                ] =
                    await diagnoseApp(
                        app.id,
                        options
                    );

            } catch (
                exception
            ) {

                result.apps[
                    normalizeId(
                        app.id
                    )
                ] =
                    {

                        error:
                            exception.message

                    };

            }

        }

        emit(
            "app-manager-diagnosed",
            result
        );

        return result;
    }


/* ========================================================
   209 — APP MANAGER RESET
   ======================================================== */

    async function reset(
        options = {}
    ) {

        try {

            if (
                options.close !==
                false
            ) {

                await closeAll(
                    {

                        ...options,

                        stop:
                            options.stop ===
                            true

                    }
                );

            }

            state.appState.clear();
            state.contexts.clear();
            state.instances.clear();

            state.activeAppId =
                null;

            state.statistics =
                createStatistics();

            for (
                const app of
                registryApps()
            ) {

                if (!app) {
                    continue;
                }

                createInitialState(
                    app.id,
                    true
                );

            }

            emit(
                "app-manager-reset",
                {

                    options,

                    timestamp:
                        now()

                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Manager Reset"
            );

            return false;
        }

    }


/* ========================================================
   PUBLIC API — COMPLETE DECLARED FUNCTION SURFACE
   ======================================================== */

    Object.assign(
        api,
        {

            getKernel,
            getSystem,
            getRegistry,
            getContract,
            getRuntime,
            getPlatform,
            getRouter,
            getWindowManager,
            getLauncher,
            getStorage,
            getAI,
            getLanguage,
            getVoice,
            getNotifications,
            getKeyboard,
            getDiagnostics,
            getConfig,
            hasMethod,
            isObject,
            normalizeId,
            clone,
            safeAsyncResult,
            dispatch,
            now,
            createTimestamp,
            createStatistics,
            log,
            warn,
            errorLog,
            reportError,
            on,
            off,
            emit,
            normalizeApp,
            createInitialState,
            updateAppState,
            getAppState,
            connectKernel,
            connectSystem,
            connectRegistry,
            connectContract,
            connectRuntime,
            connectServices,
            register,
            registerApp,
            unregister,
            get,
            registryApps,
            getAll,
            find,
            exists,
            search,
            settingsKey,
            getSettings,
            setSettings,
            resetSettings,
            saveAppSettings,
            loadAppSettings,
            createAppContext,
            checkDependencies,
            checkPermissions,
            initializeApp,
            startApp,
            stopApp,
            routeToApp,
            createWindow,
            platformOpen,
            open,
            openApp,
            activate,
            deactivateOtherApps,
            minimize,
            maximize,
            restore,
            setPIP,
            close,
            closeApp,
            restart,
            refresh,
            update,
            destroy,
            getState,
            getContext,
            getAppSettings,
            setAppSettings,
            getCapabilities,
            hasCapability,
            getAppService,
            call,
            execute,
            health,
            diagnostics,
            getOpenApps,
            getActiveApps,
            getRunningApps,
            activateNext,
            activatePrevious,
            closeAll,
            stopAll,
            refreshAll,
            getStatistics,
            resetAppState,
            getActiveApp,
            getActiveAppState,
            findOne,
            getVersion,
            getMetadata,
            snapshot,
            broadcast,
            sendMessage,
            broadcastToOpenApps,
            broadcastToAllApps,
            lifecycle,
            setVisible,
            focus,
            getWindow,
            updateWindow,
            syncWindowState,
            getAppData,
            setAppData,
            clearAppData,
            getPermissions,
            hasPermission,
            grantPermission,
            revokePermission,
            getDependencies,
            getDependencyStatus,
            ensureDependencies,
            isReady,
            waitUntilReady,
            enable,
            disable,
            install,
            uninstall,
            exportApp,
            importApp,
            reload,
            updateApp,
            replace,
            cloneApp,
            cloneAndRegister,
            configure,
            getConfiguration,
            setFeature,
            hasFeature,
            getFeatures,
            getCategory,
            getByCategory,
            getByCapability,
            getByPermission,
            sortApps,
            groupBy,
            syncRegistry,
            publishRegistry,
            managerHealth,
            managerDiagnostics,
            reset,
            initialize,
            start,
            stop,
            isInitialized,
            isStarted,
            isOperational,
            getManagerState,
            subscribe,
            emitLocal,
            command,
            getService,
            getServices,
            updateContext,
            setContextService,
            appEmit,
            onApp,
            watch,
            notifyStateChange,
            show,
            hide,
            setPosition,
            setSize,
            fullscreen,
            setPip,
            setTitle,
            setIcon,
            setTheme,
            setLanguage,
            setVoice,
            getAIService,
            getLanguageService,
            getVoiceService,
            getNotificationService,
            getKeyboardService,
            getStorageService,
            getKernelService,
            getSystemService,
            getRouterService
        }
    );
       /* ========================================================
   210 — PUBLIC API EXTENSION
   ======================================================== */

    Object.assign(
        api,
        {

            getRuntimeContext,
            getRuntimeContract,
            createLifecycleContext,

            beforeOpen,
            afterOpen,
            beforeClose,
            afterClose,

            beforeStart,
            afterStart,
            beforeStop,
            afterStop,

            beforeInitialize,
            afterInitialize,

            runLifecycleHook,
            startWithLifecycle,

            stopApp,
            stopAll,

            closeWindow,
            close,
            closeAll,

            restart,
            reload,
            refresh,

            toggle,
            activateApp,
            deactivate,
            activateOnly,

            isVisible,
            isOpen,
            isRunning,
            isReady,
            isAppInitialized,

            enable,
            disable,

            resetAppState,
            clearError,

            diagnoseApp,
            getAppInfo,

            list,
            snapshot,
            snapshotAll,

            exportState,
            importState,

            onApp,
            onceApp,
            offApp,

            health,
            diagnose,
            reset

        }
    );


/* ========================================================
   211 — GLOBAL APP MANAGER REFERENCES
   ======================================================== */

    try {

        window.HalDoAppManager =
            api;

        if (
            !window.HalDo
        ) {

            window.HalDo =
                {};

        }

        window.HalDo.appManager =
            api;

        if (
            !window.HalDoOS
        ) {

            window.HalDoOS =
                {};

        }

        window.HalDoOS.appManager =
            api;

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Global API"
        );

    }


/* ========================================================
   212 — READY EVENT
   ======================================================== */

    try {

        emit(
            "app-manager-ready",
            {

                manager:
                    api,

                version:
                    VERSION,

                health:
                    health(),

                timestamp:
                    now()

            }
        );

        dispatch(
            "haldo:app-manager-ready",
            {

                manager:
                    api,

                version:
                    VERSION

            }
        );

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Ready Event"
        );

    }


/* ========================================================
   213 — BOOT INTEGRATION
   ======================================================== */

    try {

        const kernel =
            getKernel();

        if (
            kernel &&
            hasMethod(
                kernel,
                "registerService"
            )
        ) {

            kernel.registerService(
                "app-manager",
                api
            );

        }

        if (
            kernel &&
            hasMethod(
                kernel,
                "register"
            )
        ) {

            try {

                kernel.register(
                    "app-manager",
                    api
                );

            } catch (
                exception
            ) {

                /* optional */

            }

        }

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Kernel Integration"
        );

    }


/* ========================================================
   214 — SYSTEM INTEGRATION
   ======================================================== */

    try {

        const system =
            getSystem();

        if (
            system &&
            hasMethod(
                system,
                "registerService"
            )
        ) {

            system.registerService(
                "app-manager",
                api
            );

        }

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager System Integration"
        );

    }


/* ========================================================
   215 — REGISTRY INTEGRATION
   ======================================================== */

    try {

        const registry =
            getRegistry();

        if (
            registry &&
            hasMethod(
                registry,
                "setManager"
            )
        ) {

            registry.setManager(
                api
            );

        }

        if (
            registry &&
            hasMethod(
                registry,
                "setAppManager"
            )
        ) {

            registry.setAppManager(
                api
            );

        }

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Registry Integration"
        );

    }


/* ========================================================
   216 — ROUTER INTEGRATION
   ======================================================== */

    try {

        const router =
            getRouter();

        if (
            router &&
            hasMethod(
                router,
                "setAppManager"
            )
        ) {

            router.setAppManager(
                api
            );

        }

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Router Integration"
        );

    }


/* ========================================================
   217 — WINDOW MANAGER INTEGRATION
   ======================================================== */

    try {

        const windowManager =
            getWindowManager();

        if (
            windowManager &&
            hasMethod(
                windowManager,
                "setAppManager"
            )
        ) {

            windowManager.setAppManager(
                api
            );

        }

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Window Integration"
        );

    }


/* ========================================================
   218 — LAUNCHER INTEGRATION
   ======================================================== */

    try {

        const launcher =
            getLauncher();

        if (
            launcher &&
            hasMethod(
                launcher,
                "setAppManager"
            )
        ) {

            launcher.setAppManager(
                api
            );

        }

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Launcher Integration"
        );

    }


/* ========================================================
   219 — AI INTEGRATION
   ======================================================== */

    try {

        const ai =
            getAI();

        if (
            ai &&
            hasMethod(
                ai,
                "setAppManager"
            )
        ) {

            ai.setAppManager(
                api
            );

        }

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager AI Integration"
        );

    }


/* ========================================================
   220 — LANGUAGE INTEGRATION
   ======================================================== */

    try {

        const language =
            getLanguage();

        if (
            language &&
            hasMethod(
                language,
                "setAppManager"
            )
        ) {

            language.setAppManager(
                api
            );

        }

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Language Integration"
        );

    }


/* ========================================================
   221 — VOICE INTEGRATION
   ======================================================== */

    try {

        const voice =
            getVoice();

        if (
            voice &&
            hasMethod(
                voice,
                "setAppManager"
            )
        ) {

            voice.setAppManager(
                api
            );

        }

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Voice Integration"
        );

    }


/* ========================================================
   222 — STORAGE INTEGRATION
   ======================================================== */

    try {

        const storage =
            getStorage();

        if (
            storage &&
            hasMethod(
                storage,
                "setAppManager"
            )
        ) {

            storage.setAppManager(
                api
            );

        }

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Storage Integration"
        );

    }


/* ========================================================
   223 — NOTIFICATION INTEGRATION
   ======================================================== */

    try {

        const notifications =
            getNotifications();

        if (
            notifications &&
            hasMethod(
                notifications,
                "setAppManager"
            )
        ) {

            notifications.setAppManager(
                api
            );

        }

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Notification Integration"
        );

    }


/* ========================================================
   224 — KEYBOARD INTEGRATION
   ======================================================== */

    try {

        const keyboard =
            getKeyboard();

        if (
            keyboard &&
            hasMethod(
                keyboard,
                "setAppManager"
            )
        ) {

            keyboard.setAppManager(
                api
            );

        }

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Keyboard Integration"
        );

    }


/* ========================================================
   225 — PLATFORM INTEGRATION
   ======================================================== */

    try {

        const platform =
            getPlatform();

        if (
            platform &&
            hasMethod(
                platform,
                "setAppManager"
            )
        ) {

            platform.setAppManager(
                api
            );

        }

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Platform Integration"
        );

    }


/* ========================================================
   226 — FINAL MANAGER STATE
   ======================================================== */

    try {

        state.ready =
            true;

        state.initialized =
            true;

        state.updatedAt =
            now();

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Final State"
        );

    }


/* ========================================================
   227 — FINAL GLOBAL STATUS
   ======================================================== */

    try {

        if (
            window.HalDo
        ) {

            window.HalDo.appManagerStatus =
                {

                    ready:
                        true,

                    initialized:
                        true,

                    version:
                        VERSION,

                    timestamp:
                        now()

                };

        }

        if (
            window.HalDoOS
        ) {

            window.HalDoOS.appManagerStatus =
                {

                    ready:
                        true,

                    initialized:
                        true,

                    version:
                        VERSION,

                    timestamp:
                        now()

                };

        }

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Manager Status"
        );

    }


/* ========================================================
   228 — FINAL EXPORT PREPARATION
   The module body remains open until the IIFE closes below.
   ======================================================== */


/* ============================================================
   HALDO AI OS
   APP MANAGER MODULE END
   ============================================================ */

    try {

        connectServices();

        window.HalDoAppManager =
            api;

        window.HalDoOSAppManager =
            api;

        window.HalDo =
            window.HalDo || {};

        window.HalDo.appManager =
            api;

        window.HalDoOS =
            window.HalDoOS || {};

        window.HalDoOS.appManager =
            api;

    } catch (
        exception
    ) {

        try {

            console.error(
                "[HalDo App Manager] Initialisierung fehlgeschlagen:",
                exception
            );

        } catch (
            ignored
        ) {}

    }


})(
    window,
    document
);


/* ============================================================
   END — js/app-manager.js
   ============================================================ */
