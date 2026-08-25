/* ============================================================
   HALDO AI OS 28
   CENTRAL APP INTEGRATION LAYER
   ------------------------------------------------------------
   Datei:
       js/haldo-app-integration.js

   Aufgabe:
       Zentrale Verbindung zwischen:

       App-Dateien
          ↓
       App Manager
          ↓
       App Registry
          ↓
       App Router
          ↓
       Window Manager
          ↓
       Kernel / System / Storage / AI / Language / Voice

   WICHTIG:

   - Bestehende Apps werden NICHT ersetzt.
   - Bestehende Runtime-Systeme werden NICHT gelöscht.
   - Keine zweite App-Runtime wird erzeugt.
   - Die bereits vorhandenen echten App-APIs werden
     mit dem zentralen App Manager synchronisiert.
   - Bereits registrierte Metadaten bleiben erhalten.
   - Echte App-Instanzen erhalten Priorität gegenüber
     reinen Metadaten-Definitionen.
   ============================================================ */

(function (window, document) {

    "use strict";


    /* ============================================================
       01 — HALDO ROOT
       ============================================================ */

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};


    const VERSION =
        "28.0.0";


    const MODULE_ID =
        "haldo-app-integration";


    const state = {

        initialized: false,

        initializing: false,

        ready: false,

        failed: false,

        attempts: 0,

        lastAttempt: null,

        errors: [],

        warnings: [],

        connected: {

            kernel: false,

            system: false,

            registry: false,

            manager: false,

            router: false,

            windowManager: false,

            storage: false,

            ai: false,

            language: false,

            voice: false

        },

        apps: {

            aiChat: false,

            files: false,

            home: false,

            settings: false

        },

        registered: []

    };


    /* ============================================================
       02 — LOGGING
       ============================================================ */

    function log() {

        try {

            console.info(
                "[HalDo App Integration]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo App Integration]",
                ...arguments
            );

        } catch (_) {}

    }


    function reportError(
        error,
        context
    ) {

        const normalized =
            error instanceof Error
                ? error
                : new Error(
                    String(error)
                );

        const record = {

            context:
                context ||
                MODULE_ID,

            message:
                normalized.message,

            name:
                normalized.name,

            stack:
                normalized.stack ||
                "",

            time:
                Date.now()

        };

        state.errors.push(
            record
        );

        try {

            console.error(
                "[HalDo App Integration]",
                record

            );

        } catch (_) {}

        return record;

    }


    /* ============================================================
       03 — HELPERS
       ============================================================ */

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


    function getService(
        globalName,
        osName
    ) {

        return (
            window[globalName] ||
            HalDoOS[osName] ||
            null
        );

    }


    function getManager() {

        return getService(
            "HalDoAppManager",
            "appManager"
        );

    }


    function getRegistry() {

        return getService(
            "HalDoAppRegistry",
            "appRegistry"
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


    function getAI() {

        return (
            window.HalDoAICore ||
            window.HalDoAIEngine ||
            window.HalDoAI ||
            HalDoOS.aiCore ||
            HalDoOS.ai ||
            null
        );

    }


    function getLanguage() {

        return (
            window.HalDoLanguageManager ||
            window.HalDoLanguageSystem ||
            HalDoOS.languageManager ||
            HalDoOS.languageSystem ||
            null
        );

    }


    function getVoice() {

        return (
            window.HalDoVoice ||
            window.HalDoAISpeech ||
            window.HalDoSpeech ||
            HalDoOS.voice ||
            null
        );

    }


    /* ============================================================
       04 — SERVICE CONNECTION
       ============================================================ */

    function refreshConnections() {

        const kernel =
            getKernel();

        const system =
            getSystem();

        const registry =
            getRegistry();

        const manager =
            getManager();

        const router =
            getRouter();

        const windowManager =
            getWindowManager();

        const storage =
            getStorage();

        const ai =
            getAI();

        const language =
            getLanguage();

        const voice =
            getVoice();


        state.connected.kernel =
            !!kernel;

        state.connected.system =
            !!system;

        state.connected.registry =
            !!registry;

        state.connected.manager =
            !!manager;

        state.connected.router =
            !!router;

        state.connected.windowManager =
            !!windowManager;

        state.connected.storage =
            !!storage;

        state.connected.ai =
            !!ai;

        state.connected.language =
            !!language;

        state.connected.voice =
            !!voice;


        HalDoOS.appIntegration =
            api;


        HalDoOS.services =
            HalDoOS.services ||
            {};


        HalDoOS.services.appIntegration =
            api;


        return {

            kernel,

            system,

            registry,

            manager,

            router,

            windowManager,

            storage,

            ai,

            language,

            voice

        };

    }


    /* ============================================================
       05 — APP DEFINITIONS
       ============================================================ */

    function getActualApps() {

        return {

            aiChat:
                window.HalDoAIChatApp ||
                HalDoOS.aiChatApp ||
                null,

            files:
                window.HalDoFileManager ||
                HalDoOS.fileManager ||
                null,

            home:
                window.HalDoHomeApp ||
                HalDoOS.homeApp ||
                null,

            settings:
                window.HalDoSettingsApp ||
                HalDoOS.settingsApp ||
                null

        };

    }


    /* ============================================================
       06 — NORMALIZATION
       ============================================================ */

    function normalizeApp(
        app,
        fallback
    ) {

        if (!app) {

            return null;

        }


        const normalized = {

            ...app

        };


        normalized.id =
            String(
                app.id ||
                fallback.id
            )
            .trim();


        normalized.name =
            app.name ||
            app.title ||
            fallback.name;


        normalized.title =
            app.title ||
            normalized.name;


        normalized.version =
            app.version ||
            fallback.version ||
            VERSION;


        normalized.category =
            app.category ||
            fallback.category ||
            "system";


        normalized.description =
            app.description ||
            fallback.description ||
            "";


        normalized.enabled =
            app.enabled !== false;


        normalized.singleton =
            app.singleton !== false;


        normalized.route =
            app.route ||
            fallback.route ||
            (
                "/apps/" +
                normalized.id
            );


        normalized.metadata = {

            ...(fallback.metadata || {}),

            ...(app.metadata || {})

        };


        return normalized;

    }


    /* ============================================================
       07 — APP FALLBACK DEFINITIONS
       ============================================================ */

    const FALLBACKS = {

        aiChat: {

            id:
                "ai-chat",

            name:
                "HalDo AI Chat",

            title:
                "HalDo AI",

            version:
                VERSION,

            category:
                "ai",

            description:
                "Zentrale HalDo AI Chat-Anwendung.",

            route:
                "/apps/ai-chat",

            metadata: {

                service:
                    "ai",

                voice:
                    true,

                memory:
                    true,

                language:
                    true,

                ezidi:
                    true

            }

        },


        files: {

            id:
                "files",

            name:
                "HalDo File Manager",

            title:
                "Dateien",

            version:
                VERSION,

            category:
                "system",

            description:
                "Vollständige Dateiverwaltung.",

            route:
                "/apps/files",

            metadata: {

                storage:
                    true,

                filesystem:
                    true

            }

        },


        home: {

            id:
                "haldo-home",

            name:
                "HalDo Home",

            title:
                "HalDo Home",

            version:
                VERSION,

            category:
                "system",

            description:
                "Zentrale HalDo Oberfläche.",

            route:
                "/",

            metadata: {

                launcher:
                    true,

                cosmic:
                    true

            }

        },


        settings: {

            id:
                "settings",

            name:
                "HalDo Einstellungen",

            title:
                "Einstellungen",

            version:
                VERSION,

            category:
                "system",

            description:
                "Zentrale Systemeinstellungen.",

            route:
                "/apps/settings",

            metadata: {

                storage:
                    true,

                language:
                    true,

                voice:
                    true,

                theme:
                    true

            }

        }

    };


    /* ============================================================
       08 — REGISTER / RECONCILE
       ============================================================ */

    function reconcileApp(
        app,
        fallback,
        services
    ) {

        if (!app) {

            return false;

        }


        const manager =
            services.manager;

        const registry =
            services.registry;


        const normalized =
            normalizeApp(
                app,
                fallback
            );


        if (!normalized) {

            return false;

        }


        /*
         * Die echte App-Instanz besitzt Vorrang.
         *
         * Dadurch bleibt die zentrale Registry für
         * Metadaten zuständig, während der Manager
         * die tatsächlichen Lifecycle-Funktionen
         * der App bekommt.
         */

        try {

            if (
                manager &&
                hasMethod(
                    manager,
                    "register"
                )
            ) {

                manager.register(
                    normalized
                );

            }

        } catch (error) {

            reportError(
                error,
                "Manager Registrierung: " +
                normalized.id
            );

        }


        /*
         * Manche Registry-Versionen besitzen
         * register(), andere reine Metadaten-APIs.
         *
         * Deshalb wird register nur benutzt,
         * wenn es tatsächlich existiert.
         */

        try {

            if (
                registry &&
                hasMethod(
                    registry,
                    "register"
                )
            ) {

                registry.register(
                    normalized
                );

            }

        } catch (error) {

            reportError(
                error,
                "Registry Registrierung: " +
                normalized.id
            );

        }


        /*
         * Zentrale OS-Referenz.
         */

        if (
            normalized.id ===
            "ai-chat"
        ) {

            HalDoOS.aiChatApp =
                app;

            state.apps.aiChat =
                true;

        }


        if (
            normalized.id ===
            "files"
        ) {

            HalDoOS.fileManager =
                app;

            state.apps.files =
                true;

        }


        if (
            normalized.id ===
            "haldo-home"
        ) {

            HalDoOS.homeApp =
                app;

            state.apps.home =
                true;

        }


        if (
            normalized.id ===
            "settings"
        ) {

            HalDoOS.settingsApp =
                app;

            state.apps.settings =
                true;

        }


        if (
            !state.registered.includes(
                normalized.id
            )
        ) {

            state.registered.push(
                normalized.id
            );

        }


        return true;

    }


    /* ============================================================
       09 — CONNECT APP SERVICES
       ============================================================ */

    function connectAppServices(
        app,
        services
    ) {

        if (!app) {

            return;

        }


        /*
         * Manche Apps besitzen eigene
         * Service-Setter. Wir verwenden sie
         * nur wenn vorhanden.
         */

        const context = {

            os:
                HalDoOS,

            kernel:
                services.kernel,

            system:
                services.system,

            registry:
                services.registry,

            manager:
                services.manager,

            router:
                services.router,

            windowManager:
                services.windowManager,

            storage:
                services.storage,

            ai:
                services.ai,

            language:
                services.language,

            voice:
                services.voice

        };


        try {

            if (
                hasMethod(
                    app,
                    "setServices"
                )
            ) {

                app.setServices(
                    context
                );

            }

        } catch (error) {

            reportError(
                error,
                "App Service Connection"
            );

        }


        try {

            if (
                hasMethod(
                    app,
                    "setContext"
                )
            ) {

                app.setContext(
                    context
                );

            }

        } catch (error) {

            reportError(
                error,
                "App Context Connection"
            );

        }

    }


    /* ============================================================
       10 — APP RECONCILIATION
       ============================================================ */

    function reconcileApps() {

        const services =
            refreshConnections();


        if (!services.manager) {

            state.warnings.push(
                "App Manager noch nicht verfügbar."
            );

            return false;

        }


        const apps =
            getActualApps();


        const definitions = [

            [
                apps.aiChat,
                FALLBACKS.aiChat
            ],

            [
                apps.files,
                FALLBACKS.files
            ],

            [
                apps.home,
                FALLBACKS.home
            ],

            [
                apps.settings,
                FALLBACKS.settings
            ]

        ];


        let count = 0;


        for (
            const [
                app,
                fallback
            ]
            of definitions
        ) {

            if (!app) {

                continue;

            }


            if (
                reconcileApp(
                    app,
                    fallback,
                    services
                )
            ) {

                connectAppServices(
                    app,
                    services
                );

                count += 1;

            }

        }


        /*
         * Auch das zentrale OS-Objekt
         * wird mit den tatsächlich aktiven
         * Diensten verbunden.
         */

        HalDoOS.kernel =
            services.kernel ||
            HalDoOS.kernel ||
            null;


        HalDoOS.system =
            services.system ||
            HalDoOS.system ||
            null;


        HalDoOS.appRegistry =
            services.registry ||
            HalDoOS.appRegistry ||
            null;


        HalDoOS.appManager =
            services.manager ||
            HalDoOS.appManager ||
            null;


        HalDoOS.appRouter =
            services.router ||
            HalDoOS.appRouter ||
            null;


        HalDoOS.windowManager =
            services.windowManager ||
            HalDoOS.windowManager ||
            null;


        HalDoOS.storage =
            services.storage ||
            HalDoOS.storage ||
            null;


        HalDoOS.aiCore =
            services.ai ||
            HalDoOS.aiCore ||
            null;


        HalDoOS.languageManager =
            services.language ||
            HalDoOS.languageManager ||
            null;


        HalDoOS.voice =
            services.voice ||
            HalDoOS.voice ||
            null;


        state.ready =
            count > 0;


        state.initialized =
            true;


        state.initializing =
            false;


        if (state.ready) {

            emit(
                "ready",
                {

                    apps:
                        state.apps,

                    registered:
                        state.registered.slice(),

                    connections:
                        {
                            ...state.connected
                        }

                }
            );

        }


        return state.ready;

    }


    /* ============================================================
       11 — EVENT CONNECTION
       ============================================================ */

    let listenersAttached =
        false;


    function attachListeners() {

        if (listenersAttached) {

            return;

        }


        listenersAttached =
            true;


        const events = [

            "haldo:kernel:ready",

            "haldo:system:ready",

            "haldo:app-manager:ready",

            "haldo:app-registry:ready",

            "haldo:window-manager:ready",

            "haldo:app-runtime:ready",

            "haldo:runtime:ready",

            "haldo:platform-ready",

            "haldo:ready"

        ];


        events.forEach(
            function (eventName) {

                window.addEventListener(
                    eventName,
                    function () {

                        scheduleReconcile();

                    }
                );

            }
        );


        /*
         * App-Dateien können ihre Registrierung
         * zeitversetzt durchführen.
         */

        window.addEventListener(
            "haldo:app-manager:registered",
            function () {

                scheduleReconcile();

            }
        );


        window.addEventListener(
            "haldo:app-manager:app-registered",
            function () {

                scheduleReconcile();

            }
        );


        window.addEventListener(
            "haldo:app-registry:changed",
            function () {

                scheduleReconcile();

            }
        );

    }


    /* ============================================================
       12 — SCHEDULE
       ============================================================ */

    let scheduled =
        false;


    function scheduleReconcile() {

        if (scheduled) {

            return;

        }


        scheduled =
            true;


        const run =
            function () {

                scheduled =
                    false;

                try {

                    reconcileApps();

                } catch (error) {

                    reportError(
                        error,
                        "Scheduled App Reconciliation"
                    );

                }

            };


        if (
            typeof queueMicrotask ===
            "function"
        ) {

            queueMicrotask(
                run
            );

        } else {

            setTimeout(
                run,
                0
            );

        }

    }


    /* ============================================================
       13 — INITIALIZATION
       ============================================================ */

    async function initialize() {

        if (state.initialized) {

            return api;

        }


        if (state.initializing) {

            return api;

        }


        state.initializing =
            true;

        state.attempts +=
            1;

        state.lastAttempt =
            Date.now();


        attachListeners();


        /*
         * Mehrere Systeme können wegen der
         * dynamischen Script-Reihenfolge noch
         * nicht vorhanden sein.
         *
         * Deshalb werden mehrere kurze
         * Reconcile-Versuche durchgeführt,
         * statt eine neue Runtime zu erzeugen.
         */

        for (
            let attempt = 0;
            attempt < 12;
            attempt += 1
        ) {

            try {

                if (
                    reconcileApps()
                ) {

                    return api;

                }

            } catch (error) {

                reportError(
                    error,
                    "Initialization Attempt " +
                    String(
                        attempt + 1
                    )
                );

            }


            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        100
                    )
            );

        }


        state.initializing =
            false;


        state.failed =
            !state.ready;


        return api;

    }


    /* ============================================================
       14 — OPEN APP
       ============================================================ */

    async function openApp(
        appId,
        options = {}
    ) {

        const manager =
            getManager();


        const router =
            getRouter();


        const id =
            String(
                appId ||
                ""
            )
            .trim();


        if (!id) {

            return null;

        }


        /*
         * Router ist die bevorzugte
         * öffentliche Öffnungsschicht.
         */

        if (
            router &&
            hasMethod(
                router,
                "open"
            )
        ) {

            try {

                return await router.open(
                    id,
                    {

                        ...options,

                        source:
                            options.source ||
                            MODULE_ID

                    }
                );

            } catch (error) {

                reportError(
                    error,
                    "Router Open: " +
                    id
                );

            }

        }


        /*
         * Fallback auf App Manager.
         */

        if (
            manager &&
            hasMethod(
                manager,
                "open"
            )
        ) {

            try {

                return await manager.open(
                    id,
                    options
                );

            } catch (error) {

                reportError(
                    error,
                    "Manager Open: " +
                    id
                );

            }

        }


        return null;

    }


    /* ============================================================
       15 — CLOSE APP
       ============================================================ */

    async function closeApp(
        appId,
        options = {}
    ) {

        const manager =
            getManager();


        const id =
            String(
                appId ||
                ""
            )
            .trim();


        if (
            manager &&
            hasMethod(
                manager,
                "close"
            )
        ) {

            try {

                return await manager.close(
                    id,
                    options
                );

            } catch (error) {

                reportError(
                    error,
                    "Manager Close: " +
                    id
                );

            }

        }


        return false;

    }


    /* ============================================================
       16 — DIAGNOSTICS
       ============================================================ */

    function diagnostics() {

        refreshConnections();


        return {

            module:
                MODULE_ID,

            version:
                VERSION,

            initialized:
                state.initialized,

            initializing:
                state.initializing,

            ready:
                state.ready,

            failed:
                state.failed,

            attempts:
                state.attempts,

            lastAttempt:
                state.lastAttempt,

            connections:
                {
                    ...state.connected
                },

            apps:
                {
                    ...state.apps
                },

            registered:
                state.registered.slice(),

            errors:
                state.errors.slice(),

            warnings:
                state.warnings.slice(),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ============================================================
       17 — EVENTS
       ============================================================ */

    const listeners =
        new Map();


    function on(
        eventName,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return function () {};

        }


        if (
            !listeners.has(
                eventName
            )
        ) {

            listeners.set(
                eventName,
                new Set()
            );

        }


        listeners
            .get(eventName)
            .add(
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
        eventName,
        callback
    ) {

        const set =
            listeners.get(
                eventName
            );


        if (!set) {

            return;

        }


        set.delete(
            callback
        );


        if (!set.size) {

            listeners.delete(
                eventName
            );

        }

    }


    function emit(
        eventName,
        payload = {}
    ) {

        const set =
            listeners.get(
                eventName
            );


        if (set) {

            Array.from(set)
                .forEach(
                    callback => {

                        try {

                            callback(
                                payload
                            );

                        } catch (error) {

                            reportError(
                                error,
                                "Event: " +
                                eventName
                            );

                        }

                    }
                );

        }


        try {

            window.dispatchEvent(
                new CustomEvent(
                    "haldo:app-integration:" +
                    eventName,
                    {

                        detail:
                            payload

                    }
                )
            );

        } catch (_) {}

    }


    /* ============================================================
       18 — PUBLIC API
       ============================================================ */

    const api = {

        id:
            MODULE_ID,

        name:
            "HalDo Central App Integration",

        version:
            VERSION,

        state,

        initialize,

        reconcile:
            reconcileApps,

        refreshConnections,

        openApp,

        closeApp,

        diagnostics,

        getActualApps,

        on,

        off,

        emit

    };


    /* ============================================================
       19 — GLOBAL EXPORT
       ============================================================ */

    window.HalDoAppIntegration =
        api;


    HalDoOS.appIntegration =
        api;


    HalDoOS.services =
        HalDoOS.services ||
        {};


    HalDoOS.services.appIntegration =
        api;


    /* ============================================================
       20 — AUTO START
       ============================================================ */

    function boot() {

        initialize()
            .catch(
                function (error) {

                    reportError(
                        error,
                        "Auto Initialization"
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
            boot,
            {
                once:
                    true
            }
        );

    } else {

        setTimeout(
            boot,
            0
        );

    }


})(window, document);
