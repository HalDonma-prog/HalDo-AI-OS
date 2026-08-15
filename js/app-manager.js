/* ============================================================
   HALDO AI OS 18 / 19 FOUNDATION
   PROFESSIONAL ULTIMATE

   Datei:
   js/app-manager.js

   Zentrale App-Laufzeitverwaltung

   Aufgaben:
   ------------------------------------------------------------
   • Apps registrieren
   • Apps starten
   • Apps öffnen
   • Apps schließen
   • Apps minimieren
   • Apps wiederherstellen
   • Apps aktivieren
   • Apps deaktivieren
   • App-Zustände verwalten
   • mehrere Apps gleichzeitig verwalten
   • App-Sessions verwalten
   • Dependencies prüfen
   • Berechtigungen vorbereiten
   • Registry anbinden
   • Router anbinden
   • Window Manager anbinden
   • Launcher anbinden
   • Storage anbinden
   • AI-System anbinden
   • Events
   • Diagnose
   • Health Check
   • sichere Fehlerbehandlung
   • zukünftige Erweiterbarkeit

   WICHTIG:
   ------------------------------------------------------------
   Diese Datei enthält die Laufzeitverwaltung.

   Die eigentliche App-Oberfläche und interne Funktionalität
   bleibt in den jeweiligen Apps.

   ============================================================ */

(function (window, document) {

    "use strict";


    /* =========================================================
       01 — HALDO FOUNDATION
       ========================================================= */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;


    const VERSION =
        "18.0.0";

    const MODULE_ID =
        "app-manager";

    const NAME =
        "HalDo AI OS App Manager";


    /* =========================================================
       02 — INTERNAL STATE
       ========================================================= */

    const state = {

        initialized:
            false,

        initializing:
            false,

        ready:
            false,

        failed:
            false,

        apps:
            new Map(),

        running:
            new Map(),

        windows:
            new Map(),

        sessions:
            new Map(),

        listeners:
            new Map(),

        activeAppId:
            null,

        activeSessionId:
            null,

        connections: {

            kernel:
                false,

            system:
                false,

            registry:
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
                false

        },

        statistics: {

            registered:
                0,

            launched:
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

            deactivated:
                0,

            errors:
                0

        }

    };


    /* =========================================================
       03 — LOGGING
       ========================================================= */

    function log() {

        try {

            console.log(
                "[HalDo App Manager]",
                ...arguments
            );

        }
        catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo App Manager]",
                ...arguments
            );

        }
        catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo App Manager]",
                ...arguments
            );

        }
        catch (_) {}

    }


    /* =========================================================
       04 — SAFE HELPERS
       ========================================================= */

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

                    const item =
                        value[key];

                    if (
                        typeof item ===
                        "function"
                    ) {

                        result[key] =
                            item;

                    }
                    else {

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


    /* =========================================================
       05 — SERVICE LOOKUPS
       ========================================================= */

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
            window.HalDoAppLauncher ||
            HalDoOS.launcher ||
            HalDoOS.appLauncher ||
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


    function getAI() {

        return (
            window.HalDoAI ||
            window.HalDoAICore ||
            HalDoOS.ai ||
            HalDoOS.aiCore ||
            null
        );

    }


    /* =========================================================
       06 — EVENTS
       ========================================================= */

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
                callback => {

                    try {

                        callback(
                            data
                        );

                    }
                    catch (
                        exception
                    ) {

                        errorLog(
                            "Event listener error:",
                            exception
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
                    "app-manager:" + event,
                    data
                );

            }
            catch (_) {}

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
                    "app-manager:" + event,
                    data
                );

            }
            catch (_) {}

        }

    }


    /* =========================================================
       07 — ERROR HANDLING
       ========================================================= */

    function reportError(
        code,
        exception,
        extra = null
    ) {

        state.statistics.errors++;


        const payload = {

            code:
                code ||
                "APP_MANAGER_ERROR",

            message:
                exception instanceof Error
                    ? exception.message
                    : String(
                        exception ||
                        "Unknown error"
                    ),

            error:
                exception || null,

            extra,

            timestamp:
                new Date().toISOString()

        };


        errorLog(
            "[HalDo App Manager]",
            payload
        );


        emit(
            "error",
            payload
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
                    exception ||
                    new Error(
                        payload.message
                    ),
                    `App Manager: ${payload.code}`
                );

            }
            catch (_) {}

        }


        return payload;

    }


    /* =========================================================
       08 — APP NORMALIZATION
       ========================================================= */

    function normalizeApp(
        definition
    ) {

        if (
            !definition ||
            typeof definition !==
            "object"
        ) {

            return null;

        }


        const id =
            normalizeId(
                definition.id ||
                definition.appId ||
                definition.name ||
                definition.title
            );


        if (!id) {

            return null;

        }


        const existing =
            state.apps.get(
                id
            );


        const app = {

            ...existing,

            ...definition,

            id,

            appId:
                id,

            name:
                definition.name ||
                existing?.name ||
                id,

            title:
                definition.title ||
                existing?.title ||
                definition.name ||
                id,

            description:
                definition.description !==
                undefined
                    ? String(
                        definition.description
                    )
                    : (
                        existing?.description ||
                        ""
                    ),

            category:
                definition.category ||
                existing?.category ||
                "system",

            icon:
                definition.icon ||
                existing?.icon ||
                "◈",

            version:
                definition.version ||
                existing?.version ||
                VERSION,

            enabled:
                definition.enabled !==
                undefined
                    ? definition.enabled !== false
                    : (
                        existing
                            ? existing.enabled !== false
                            : true
                    ),

            system:
                definition.system === true ||
                existing?.system === true,

            singleton:
                definition.singleton !==
                undefined
                    ? definition.singleton !== false
                    : (
                        existing
                            ? existing.singleton !== false
                            : true
                    ),

            route:
                definition.route !==
                undefined
                    ? definition.route
                    : (
                        existing?.route ||
                        null
                    ),

            entry:
                definition.entry !==
                undefined
                    ? definition.entry
                    : (
                        existing?.entry ||
                        null
                    ),

            dependencies:
                Array.isArray(
                    definition.dependencies
                )
                    ? [
                        ...definition.dependencies
                    ]
                    : (
                        existing?.dependencies
                            ? [
                                ...existing.dependencies
                            ]
                            : []
                    ),

            permissions:
                Array.isArray(
                    definition.permissions
                )
                    ? [
                        ...definition.permissions
                    ]
                    : (
                        existing?.permissions
                            ? [
                                ...existing.permissions
                            ]
                            : []
                    ),

            tags:
                Array.isArray(
                    definition.tags
                )
                    ? [
                        ...definition.tags
                    ]
                    : (
                        existing?.tags
                            ? [
                                ...existing.tags
                            ]
                            : []
                    ),

            keywords:
                Array.isArray(
                    definition.keywords
                )
                    ? [
                        ...definition.keywords
                    ]
                    : (
                        existing?.keywords
                            ? [
                                ...existing.keywords
                            ]
                            : []
                    ),

            settings:
                (
                    definition.settings &&
                    typeof definition.settings ===
                    "object"
                )
                    ? {
                        ...(existing?.settings || {}),
                        ...definition.settings
                    }
                    : {
                        ...(existing?.settings || {})
                    },

            metadata:
                (
                    definition.metadata &&
                    typeof definition.metadata ===
                    "object"
                )
                    ? {
                        ...(existing?.metadata || {}),
                        ...definition.metadata
                    }
                    : {
                        ...(existing?.metadata || {})
                    },

            state:
                existing?.state ||
                "registered",

            createdAt:
                existing?.createdAt ||
                definition.createdAt ||
                Date.now(),

            updatedAt:
                Date.now()

        };


        return app;

    }


    /* =========================================================
       09 — REGISTER APP
       ========================================================= */

    function registerApp(
        definition,
        options = {}
    ) {

        const app =
            normalizeApp(
                definition
            );


        if (!app) {

            reportError(
                "INVALID_APP",
                new Error(
                    "Ungültige App-Definition."
                ),
                {
                    definition
                }
            );


            return null;

        }


        const existing =
            state.apps.get(
                app.id
            );


        state.apps.set(
            app.id,
            app
        );


        state.statistics.registered++;


        emit(
            existing
                ? "app-updated"
                : "app-registered",
            {
                app,
                previous:
                    existing || null,
                options
            }
        );


        return app;

    }


    function register(
        definition,
        options
    ) {

        return registerApp(
            definition,
            options
        );

    }


    function registerApps(
        definitions,
        options = {}
    ) {

        if (
            !Array.isArray(
                definitions
            )
        ) {

            return [];

        }


        return definitions
            .map(
                definition =>
                    registerApp(
                        definition,
                        options
                    )
            )
            .filter(
                Boolean
            );

    }


    /* =========================================================
       10 — REGISTRY SYNCHRONIZATION
       ========================================================= */

    function syncRegistry() {

        const registry =
            getRegistry();


        if (
            !registry
        ) {

            state.connections.registry =
                false;

            return false;

        }


        try {

            let apps = [];


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


            if (
                Array.isArray(
                    apps
                )
            ) {

                apps.forEach(
                    app => {

                        registerApp(
                            app,
                            {
                                source:
                                    "registry"
                            }
                        );

                    }
                );

            }


            state.connections.registry =
                true;


            emit(
                "registry-synchronized",
                {
                    count:
                        apps.length
                }
            );


            return true;

        }
        catch (
            exception
        ) {

            reportError(
                "REGISTRY_SYNC_ERROR",
                exception
            );


            return false;

        }

    }


    /* =========================================================
       11 — APP ACCESS
       ========================================================= */

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


    function getRunningApps() {

        return Array.from(
            state.running.values()
        );

    }


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


    /* =========================================================
       12 — DEPENDENCIES
       ========================================================= */

    function getMissingDependencies(
        app
    ) {

        const definition =
            typeof app === "string"
                ? getApp(app)
                : app;


        if (!definition) {

            return [];

        }


        return (
            definition.dependencies ||
            []
        )
        .filter(
            dependency => {

                const id =
                    normalizeId(
                        dependency
                    );


                if (!id) {

                    return true;

                }


                const target =
                    getApp(
                        id
                    );


                return !(
                    target &&
                    target.enabled !== false
                );

            }
        );

    }


    function checkDependencies(
        app
    ) {

        return (
            getMissingDependencies(
                app
            ).length ===
            0
        );

    }


    /* =========================================================
       13 — APP CONTEXT
       ========================================================= */

    function createAppContext(
        app,
        session
    ) {

        return {

            app,

            session,

            manager:
                api,

            kernel:
                getKernel(),

            system:
                getSystem(),

            registry:
                getRegistry(),

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

            emit:
                function (
                    event,
                    data
                ) {

                    emit(
                        "app:" + event,
                        {
                            app,
                            session,
                            data
                        }
                    );

                },

            openApp:
                openApp,

            closeApp:
                closeApp,

            minimizeApp:
                minimizeApp,

            restoreApp:
                restoreApp,

            activateApp:
                activateApp,

            getApp:
                getApp

        };

    }


    /* =========================================================
       14 — SESSION CREATION
       ========================================================= */

    function createSession(
        app
    ) {

        const sessionId =
            app.id +
            "-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8);


        const session = {

            id:
                sessionId,

            appId:
                app.id,

            state:
                "created",

            createdAt:
                Date.now(),

            openedAt:
                null,

            closedAt:
                null,

            minimized:
                false,

            active:
                false,

            data:
                {},

            context:
                null

        };


        session.context =
            createAppContext(
                app,
                session
            );


        state.sessions.set(
            sessionId,
            session
        );


        return session;

    }


    /* =========================================================
       15 — APP INIT
       ========================================================= */

    async function initializeApp(
        app,
        session
    ) {

        if (!app) {

            return false;

        }


        try {

            if (
                typeof app.init ===
                "function"
            ) {

                const result =
                    app.init(
                        session.context
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }


            return true;

        }
        catch (
            exception
        ) {

            reportError(
                "APP_INIT_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    sessionId:
                        session.id
                }
            );


            return false;

        }

    }


    /* =========================================================
       16 — START APP
       ========================================================= */

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
                "APP_NOT_FOUND",
                new Error(
                    `App nicht gefunden: ${id}`
                )
            );


            return null;

        }


        if (
            app.enabled ===
            false
        ) {

            emit(
                "app-start-blocked",
                {
                    app,
                    reason:
                        "disabled"
                }
            );


            return null;

        }


        const missing =
            getMissingDependencies(
                app
            );


        if (
            missing.length &&
            options.ignoreDependencies !== true
        ) {

            emit(
                "app-start-blocked",
                {
                    app,
                    reason:
                        "dependencies",
                    missing
                }
            );


            return null;

        }


        if (
            app.singleton
        ) {

            const existing =
                Array.from(
                    state.running.values()
                )
                .find(
                    session =>
                        session.appId ===
                        app.id
                );


            if (existing) {

                await activateSession(
                    existing
                );


                return existing;

            }

        }


        const session =
            createSession(
                app
            );


        const initialized =
            await initializeApp(
                app,
                session
            );


        if (!initialized) {

            session.state =
                "error";


            return null;

        }


        try {

            if (
                typeof app.start ===
                "function"
            ) {

                const result =
                    app.start(
                        session.context
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }

        }
        catch (
            exception
        ) {

            session.state =
                "error";


            reportError(
                "APP_START_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    sessionId:
                        session.id
                }
            );


            return null;

        }


        session.state =
            "running";

        session.openedAt =
            Date.now();


        app.state =
            "running";

        app.status =
            "running";

        app.updatedAt =
            Date.now();


        state.running.set(
            session.id,
            session
        );


        state.statistics.launched++;


        emit(
            "app-started",
            {
                app,
                session,
                options
            }
        );


        await connectWindow(
            app,
            session,
            options
        );


        await activateSession(
            session
        );


        return session;

    }


    /* =========================================================
       17 — WINDOW CONNECTION
       ========================================================= */

    async function connectWindow(
        app,
        session,
        options
    ) {

        const manager =
            getWindowManager();


        if (!manager) {

            state.connections.windowManager =
                false;

            return null;

        }


        state.connections.windowManager =
            true;


        try {

            let result =
                null;


            if (
                hasMethod(
                    manager,
                    "openWindow"
                )
            ) {

                result =
                    manager.openWindow(
                        {
                            id:
                                session.id,

                            appId:
                                app.id,

                            title:
                                app.title,

                            icon:
                                app.icon,

                            route:
                                app.route,

                            singleton:
                                app.singleton,

                            options:
                                options || {}
                        }
                    );

            }
            else if (
                hasMethod(
                    manager,
                    "createWindow"
                )
            ) {

                result =
                    manager.createWindow(
                        {
                            id:
                                session.id,

                            appId:
                                app.id,

                            title:
                                app.title,

                            icon:
                                app.icon,

                            route:
                                app.route
                        }
                    );

            }


            state.windows.set(
                session.id,
                result || {
                    id:
                        session.id,

                    appId:
                        app.id
                }
            );


            return result;

        }
        catch (
            exception
        ) {

            reportError(
                "WINDOW_CONNECTION_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    sessionId:
                        session.id
                }
            );


            return null;

        }

    }


    /* =========================================================
       18 — OPEN APP
       ========================================================= */

    async function openApp(
        id,
        options = {}
    ) {

        const app =
            getApp(
                id
            );


        if (!app) {

            reportError(
                "APP_NOT_FOUND",
                new Error(
                    `App nicht gefunden: ${id}`
                )
            );


            return null;

        }


        state.statistics.opened++;


        /*
         * Router zuerst benutzen,
         * wenn vorhanden.
         */

        const router =
            getRouter();


        if (
            router &&
            options.useRouter !== false
        ) {

            try {

                if (
                    hasMethod(
                        router,
                        "navigate"
                    ) &&
                    app.route
                ) {

                    await router.navigate(
                        app.route,
                        {
                            appId:
                                app.id
                        }
                    );

                }

            }
            catch (
                exception
            ) {

                reportError(
                    "ROUTER_OPEN_ERROR",
                    exception,
                    {
                        appId:
                            app.id
                    }
                );

            }

        }


        return startApp(
            id,
            options
        );

    }


    /* =========================================================
       19 — ACTIVATE SESSION
       ========================================================= */

    async function activateSession(
        session
    ) {

        if (!session) {

            return false;

        }


        const app =
            getApp(
                session.appId
            );


        if (!app) {

            return false;

        }


        /*
         * Alte aktive Session deaktivieren.
         */

        if (
            state.activeSessionId &&
            state.activeSessionId !==
            session.id
        ) {

            const previous =
                state.sessions.get(
                    state.activeSessionId
                );


            if (previous) {

                previous.active =
                    false;

            }

        }


        session.active =
            true;

        session.minimized =
            false;

        session.state =
            "running";


        state.activeSessionId =
            session.id;

        state.activeAppId =
            app.id;


        app.state =
            "active";


        app.status =
            "active";


        state.statistics.activated++;


        try {

            if (
                typeof app.onActivate ===
                "function"
            ) {

                const result =
                    app.onActivate(
                        session.context
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }

        }
        catch (
            exception
        ) {

            reportError(
                "APP_ACTIVATE_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    sessionId:
                        session.id
                }
            );

        }


        const manager =
            getWindowManager();


        if (
            manager
        ) {

            try {

                if (
                    hasMethod(
                        manager,
                        "focusWindow"
                    )
                ) {

                    manager.focusWindow(
                        session.id
                    );

                }
                else if (
                    hasMethod(
                        manager,
                        "activateWindow"
                    )
                ) {

                    manager.activateWindow(
                        session.id
                    );

                }

            }
            catch (_) {}

        }


        emit(
            "app-activated",
            {
                app,
                session
            }
        );


        return true;

    }


    /* =========================================================
       20 — ACTIVATE APP
       ========================================================= */

    async function activateApp(
        id
    ) {

        const app =
            getApp(
                id
            );


        if (!app) {

            return false;

        }


        const session =
            Array.from(
                state.running.values()
            )
            .find(
                item =>
                    item.appId ===
                    app.id
            );


        if (!session) {

            const opened =
                await openApp(
                    app.id
                );


            return !!opened;

        }


        return activateSession(
            session
        );

    }


    /* =========================================================
       21 — MINIMIZE
       ========================================================= */

    async function minimizeSession(
        session
    ) {

        if (!session) {

            return false;

        }


        const app =
            getApp(
                session.appId
            );


        if (!app) {

            return false;

        }


        session.minimized =
            true;

        session.active =
            false;

        session.state =
            "minimized";


        app.state =
            "minimized";


        app.status =
            "minimized";


        state.statistics.minimized++;


        try {

            if (
                typeof app.minimize ===
                "function"
            ) {

                await app.minimize(
                    session.context
                );

            }

        }
        catch (
            exception
        ) {

            reportError(
                "APP_MINIMIZE_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    sessionId:
                        session.id
                }
            );

        }


        const manager =
            getWindowManager();


        if (
            manager
        ) {

            try {

                if (
                    hasMethod(
                        manager,
                        "minimizeWindow"
                    )
                ) {

                    manager.minimizeWindow(
                        session.id
                    );

                }

            }
            catch (_) {}

        }


        if (
            state.activeSessionId ===
            session.id
        ) {

            state.activeSessionId =
                null;

            state.activeAppId =
                null;

        }


        emit(
            "app-minimized",
            {
                app,
                session
            }
        );


        return true;

    }


    async function minimizeApp(
        id
    ) {

        const app =
            getApp(
                id
            );


        if (!app) {

            return false;

        }


        const sessions =
            Array.from(
                state.running.values()
            )
            .filter(
                session =>
                    session.appId ===
                    app.id
            );


        if (!sessions.length) {

            return false;

        }


        for (
            const session of sessions
        ) {

            await minimizeSession(
                session
            );

        }


        return true;

    }


    /* =========================================================
       22 — RESTORE
       ========================================================= */

    async function restoreSession(
        session
    ) {

        if (!session) {

            return false;

        }


        const app =
            getApp(
                session.appId
            );


        if (!app) {

            return false;

        }


        session.minimized =
            false;

        session.active =
            false;

        session.state =
            "running";


        app.state =
            "running";

        app.status =
            "running";


        state.statistics.restored++;


        try {

            if (
                typeof app.restore ===
                "function"
            ) {

                await app.restore(
                    session.context
                );

            }

        }
        catch (
            exception
        ) {

            reportError(
                "APP_RESTORE_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    sessionId:
                        session.id
                }
            );

        }


        const manager =
            getWindowManager();


        if (
            manager &&
            hasMethod(
                manager,
                "restoreWindow"
            )
        ) {

            try {

                manager.restoreWindow(
                    session.id
                );

            }
            catch (_) {}

        }


        return activateSession(
            session
        );

    }


    async function restoreApp(
        id
    ) {

        const app =
            getApp(
                id
            );


        if (!app) {

            return false;

        }


        const session =
            Array.from(
                state.running.values()
            )
            .find(
                item =>
                    item.appId ===
                    app.id
            );


        if (!session) {

            return false;

        }


        return restoreSession(
            session
        );

    }


    /* =========================================================
       23 — CLOSE SESSION
       ========================================================= */

    async function closeSession(
        session,
        options = {}
    ) {

        if (!session) {

            return false;

        }


        const app =
            getApp(
                session.appId
            );


        if (!app) {

            return false;

        }


        try {

            if (
                typeof app.onDeactivate ===
                "function"
            ) {

                await app.onDeactivate(
                    session.context
                );

            }

        }
        catch (
            exception
        ) {

            reportError(
                "APP_DEACTIVATE_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    sessionId:
                        session.id
                }
            );

        }


        try {

            if (
                typeof app.stop ===
                "function"
            ) {

                await app.stop(
                    session.context
                );

            }

        }
        catch (
            exception
        ) {

            reportError(
                "APP_STOP_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    sessionId:
                        session.id
                }
            );

        }


        try {

            if (
                typeof app.close ===
                "function"
            ) {

                await app.close(
                    session.context
                );

            }

        }
        catch (
            exception
        ) {

            reportError(
                "APP_CLOSE_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    sessionId:
                        session.id
                }
            );

        }


        const manager =
            getWindowManager();


        if (
            manager
        ) {

            try {

                if (
                    hasMethod(
                        manager,
                        "closeWindow"
                    )
                ) {

                    await manager.closeWindow(
                        session.id
                    );

                }

            }
            catch (_) {}

        }


        state.windows.delete(
            session.id
        );

        state.running.delete(
            session.id
        );


        session.state =
            "closed";

        session.active =
            false;

        session.minimized =
            false;

        session.closedAt =
            Date.now();


        state.statistics.closed++;


        if (
            state.activeSessionId ===
            session.id
        ) {

            state.activeSessionId =
                null;

            state.activeAppId =
                null;

        }


        app.state =
            "registered";

        app.status =
            "registered";

        app.updatedAt =
            Date.now();


        if (
            options.destroy === true &&
            typeof app.destroy ===
            "function"
        ) {

            try {

                await app.destroy(
                    session.context
                );

            }
            catch (
                exception
            ) {

                reportError(
                    "APP_DESTROY_ERROR",
                    exception,
                    {
                        appId:
                            app.id
                    }
                );

            }

        }


        emit(
            "app-closed",
            {
                app,
                session,
                options
            }
        );


        return true;

    }


    /* =========================================================
       24 — CLOSE APP
       ========================================================= */

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


        const sessions =
            Array.from(
                state.running.values()
            )
            .filter(
                session =>
                    session.appId ===
                    app.id
            );


        if (!sessions.length) {

            return true;

        }


        for (
            const session of sessions
        ) {

            await closeSession(
                session,
                options
            );

        }


        return true;

    }


    /* =========================================================
       25 — DEACTIVATE
       ========================================================= */

    async function deactivateApp(
        id
    ) {

        const app =
            getApp(
                id
            );


        if (!app) {

            return false;

        }


        const sessions =
            Array.from(
                state.running.values()
            )
            .filter(
                session =>
                    session.appId ===
                    app.id
            );


        for (
            const session of sessions
        ) {

            session.active =
                false;


            try {

                if (
                    typeof app.onDeactivate ===
                    "function"
                ) {

                    await app.onDeactivate(
                        session.context
                    );

                }

            }
            catch (
                exception
            ) {

                reportError(
                    "APP_DEACTIVATE_ERROR",
                    exception,
                    {
                        appId:
                            app.id
                    }
                );

            }

        }


        app.state =
            "running";

        app.status =
            "running";


        state.statistics.deactivated++;


        emit(
            "app-deactivated",
            {
                app,
                sessions
            }
        );


        return true;

    }


    /* =========================================================
       26 — FIND
       ========================================================= */

    function find(
        query
    ) {

        const value =
            String(
                query || ""
            )
            .trim()
            .toLowerCase();


        if (!value) {

            return [];

        }


        return getAll()
            .filter(
                app => {

                    const fields = [

                        app.id,

                        app.name,

                        app.title,

                        app.description,

                        app.category,

                        ...(app.tags || []),

                        ...(app.keywords || [])

                    ];


                    return fields.some(
                        field =>
                            String(
                                field || ""
                            )
                            .toLowerCase()
                            .includes(
                                value
                            )
                    );

                }
            );

    }


    function search(
        query
    ) {

        return find(
            query
        );

    }


    /* =========================================================
       27 — SETTINGS
       ========================================================= */

    function getAppSettings(
        id
    ) {

        const app =
            getApp(
                id
            );


        if (!app) {

            return null;

        }


        return {
            ...(app.settings || {})
        };

    }


    function setAppSettings(
        id,
        settings
    ) {

        const app =
            getApp(
                id
            );


        if (!app) {

            return false;

        }


        if (
            !settings ||
            typeof settings !==
            "object"
        ) {

            return false;

        }


        app.settings = {

            ...(app.settings || {}),

            ...settings

        };


        app.updatedAt =
            Date.now();


        emit(
            "app-settings-changed",
            {
                app,
                settings:
                    app.settings
            }
        );


        return true;

    }


    /* =========================================================
       28 — APP STATE
       ========================================================= */

    function getAppState(
        id
    ) {

        const app =
            getApp(
                id
            );


        if (!app) {

            return null;

        }


        return {

            id:
                app.id,

            state:
                app.state,

            status:
                app.status,

            enabled:
                app.enabled,

            running:
                Array.from(
                    state.running.values()
                )
                .filter(
                    session =>
                        session.appId ===
                        app.id
                )
                .map(
                    session => session.id
                )

        };

    }


    /* =========================================================
       29 — RUNNING CHECK
       ========================================================= */

    function isRunning(
        id
    ) {

        const normalized =
            normalizeId(
                id
            );


        return Array.from(
            state.running.values()
        )
        .some(
            session =>
                session.appId ===
                normalized
        );

    }


    function isActive(
        id
    ) {

        return (
            state.activeAppId ===
            normalizeId(
                id
            )
        );

    }


    /* =========================================================
       30 — CONNECTIONS
       ========================================================= */

    function refreshConnections() {

        const kernel =
            getKernel();

        const system =
            getSystem();

        const registry =
            getRegistry();

        const router =
            getRouter();

        const windowManager =
            getWindowManager();

        const launcher =
            getLauncher();

        const storage =
            getStorage();

        const ai =
            getAI();


        state.connections.kernel =
            !!kernel;

        state.connections.system =
            !!system;

        state.connections.registry =
            !!registry;

        state.connections.router =
            !!router;

        state.connections.windowManager =
            !!windowManager;

        state.connections.launcher =
            !!launcher;

        state.connections.storage =
            !!storage;

        state.connections.ai =
            !!ai;


        syncRegistry();


        emit(
            "connections-refreshed",
            {
                connections:
                    {
                        ...state.connections
                    }
            }
        );


        return {
            ...state.connections
        };

    }


    /* =========================================================
       31 — KERNEL CONNECTION
       ========================================================= */

    function connectToKernel() {

        const kernel =
            getKernel();


        if (!kernel) {

            state.connections.kernel =
                false;

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


            state.connections.kernel =
                true;


            return true;

        }
        catch (
            exception
        ) {

            reportError(
                "KERNEL_CONNECTION_ERROR",
                exception
            );


            return false;

        }

    }


    /* =========================================================
       32 — LAUNCHER CONNECTION
       ========================================================= */

    function connectLauncher() {

        const launcher =
            getLauncher();


        if (!launcher) {

            return false;

        }


        state.connections.launcher =
            true;


        return true;

    }


    /* =========================================================
       33 — INITIALIZATION
       ========================================================= */

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


        connectToKernel();

        refreshConnections();

        connectLauncher();


        /*
         * Falls die Registry schon vorhanden
         * ist, vorhandene Apps übernehmen.
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

                appCount:
                    state.apps.size,

                connections:
                    {
                        ...state.connections
                    }
            }
        );


        log(
            "App Manager bereit.",
            state.apps.size,
            "Apps"
        );


        return api;

    }


    /* =========================================================
       34 — DIAGNOSTICS
       ========================================================= */

    function diagnostics() {

        return {

            name:
                NAME,

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

            appCount:
                state.apps.size,

            runningCount:
                state.running.size,

            sessionCount:
                state.sessions.size,

            activeApp:
                state.activeAppId,

            activeSession:
                state.activeSessionId,

            connections:
                {
                    ...state.connections
                },

            statistics:
                {
                    ...state.statistics
                },

            apps:
                getAll().map(
                    app => ({

                        id:
                            app.id,

                        name:
                            app.name,

                        title:
                            app.title,

                        category:
                            app.category,

                        enabled:
                            app.enabled,

                        state:
                            app.state,

                        status:
                            app.status,

                        running:
                            isRunning(
                                app.id
                            ),

                        active:
                            isActive(
                                app.id
                            ),

                        dependencies:
                            [
                                ...(app.dependencies || [])
                            ],

                        missingDependencies:
                            getMissingDependencies(
                                app
                            )

                    })
                ),

            sessions:
                Array.from(
                    state.sessions.values()
                )
                .map(
                    session => ({

                        id:
                            session.id,

                        appId:
                            session.appId,

                        state:
                            session.state,

                        active:
                            session.active,

                        minimized:
                            session.minimized,

                        createdAt:
                            session.createdAt,

                        openedAt:
                            session.openedAt,

                        closedAt:
                            session.closedAt

                    })
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* =========================================================
       35 — HEALTH CHECK
       ========================================================= */

    function healthCheck() {

        const connections =
            refreshConnections();


        const problems = [];


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


        if (
            !connections.windowManager
        ) {

            problems.push(
                "Window Manager noch nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length ===
                0,

            operational:
                state.ready,

            problems,

            connections,

            appCount:
                state.apps.size,

            runningCount:
                state.running.size,

            activeApp:
                state.activeAppId,

            timestamp:
                new Date().toISOString()

        };

    }


    /* =========================================================
       36 — PUBLIC API
       ========================================================= */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


        /* State */

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

                    appCount:
                        state.apps.size,

                    runningCount:
                        state.running.size,

                    activeAppId:
                        state.activeAppId,

                    activeSessionId:
                        state.activeSessionId,

                    connections:
                        {
                            ...state.connections
                        }

                };

            },


        /* Events */

        on,

        off,

        emit,


        /* Registration */

        register,

        registerApp,

        registerApps,

        syncRegistry,


        /* Access */

        get,

        getApp,

        getAll,

        getApps,

        getRunningApps,

        getActiveApp,

        has,


        /* Search */

        find,

        search,


        /* Lifecycle */

        initialize,

        startApp,

        openApp,

        closeApp,

        activateApp,

        deactivateApp,

        minimizeApp,

        restoreApp,


        /* Session */

        closeSession,

        activateSession,

        minimizeSession,

        restoreSession,


        /* State */

        getAppState,

        isRunning,

        isActive,


        /* Dependencies */

        getMissingDependencies,

        checkDependencies,


        /* Settings */

        getAppSettings,

        setAppSettings,


        /* Connections */

        connectToKernel,

        connectLauncher,

        refreshConnections,


        /* Diagnostics */

        diagnostics,

        healthCheck,

        reportError

    };


    /* =========================================================
       37 — GLOBAL EXPORT
       ========================================================= */

    window.HalDoAppManager =
        api;

    window.HalDoOSAppManager =
        api;

    HalDoOS.appManager =
        api;


    /* =========================================================
       38 — KERNEL EVENTS
       ========================================================= */

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
                function () {

                    refreshConnections();

                    emit(
                        "kernel-ready"
                    );

                }
            );


            kernel.on(
                "module:registered",
                function (
                    payload
                ) {

                    if (
                        payload &&
                        payload.name ===
                        "app-registry"
                    ) {

                        refreshConnections();

                    }

                }
            );


            return true;

        }
        catch (
            exception
        ) {

            reportError(
                "KERNEL_EVENT_CONNECTION_ERROR",
                exception
            );


            return false;

        }

    }


    /* =========================================================
       39 — DOM START
       ========================================================= */

    async function boot() {

        try {

            connectKernelEvents();

            await initialize();

        }
        catch (
            exception
        ) {

            state.failed =
                true;

            state.initializing =
                false;


            reportError(
                "APP_MANAGER_BOOT_ERROR",
                exception
            );

        }

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

    }
    else {

        boot();

    }


    /* =========================================================
       40 — FINAL EXPOSURE
       ========================================================= */

    HalDoOS.appManager =
        api;


    window.HalDoAppManager =
        api;


    /*
     * Kein automatisches Erzeugen von Apps
     * in dieser Datei.
     *
     * Die vollständige App-Liste wird
     * kontrolliert über die Registry
     * eingebunden.
     */


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS APP MANAGER
   ============================================================ */