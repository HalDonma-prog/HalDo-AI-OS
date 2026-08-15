/* ============================================================
   HalDo AI OS 19/20
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei: js/app-manager.js

   Zentrale App-Verwaltung

   Verbindung:

       KERNEL
          │
          ▼
     APP REGISTRY
          │
          ▼
     APP MANAGER
       │  │  │
       │  │  └── APP ROUTER
       │  └───── WINDOW MANAGER
       └──────── LAUNCHER
          │
          ▼
      APPLICATION

   Aufgaben:

   • Apps verwalten
   • Apps starten
   • Apps schließen
   • Apps aktivieren/deaktivieren
   • App-Zustände
   • mehrere Apps gleichzeitig
   • aktive App
   • App Sessions
   • Fenster-Referenzen
   • App Events
   • Registry-Verbindung
   • Kernel-Verbindung
   • System-Verbindung
   • Router-Verbindung
   • Window-Manager-Verbindung
   • Launcher-Kompatibilität
   • Diagnostics
   • Health Check
   • Fehlerbehandlung
   • zukünftige Erweiterbarkeit

   WICHTIG:

   Diese Datei enthält NICHT die komplette innere Logik
   jeder einzelnen Anwendung.

   Jede Anwendung erhält später ihre eigene vollständige
   App-Datei / App-Modul-Struktur.

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


    /* =========================================================
       02 — META
       ========================================================= */

    const VERSION =
        "19.0.0";

    const NAME =
        "HalDo AI OS App Manager";

    const MODULE_ID =
        "app-manager";


    /* =========================================================
       03 — STATE
       ========================================================= */

    const state = {

        initialized:
            false,

        initializing:
            false,

        ready:
            false,

        apps:
            new Map(),

        sessions:
            new Map(),

        activeAppId:
            null,

        activeSessionId:
            null,

        listeners:
            new Map(),

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
                false

        },

        statistics: {

            launches:
                0,

            closes:
                0,

            activations:
                0,

            deactivations:
                0,

            minimized:
                0,

            restored:
                0,

            errors:
                0

        }

    };


    /* =========================================================
       04 — LOGGING
       ========================================================= */

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


    /* =========================================================
       05 — HELPERS
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

            Object.keys(value)
                .forEach(
                    key => {

                        const item =
                            value[key];

                        result[key] =
                            typeof item ===
                            "function"
                                ? item
                                : clone(
                                    item
                                );

                    }
                );

            return result;

        }


        return value;

    }


    /* =========================================================
       06 — SERVICE LOOKUPS
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
            window.HalDoAppLauncher ||
            HalDoOS.appLauncher ||
            null
        );

    }


    /* =========================================================
       07 — EVENT SYSTEM
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

                    } catch (exception) {

                        errorLog(
                            "Event listener error:",
                            exception
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

            } catch (_) {}

        }

    }


    /* =========================================================
       08 — ERROR SYSTEM
       ========================================================= */

    function reportError(
        code,
        exception,
        extra = null
    ) {

        state.statistics.errors +=
            1;


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
                exception ||
                null,

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
                    "App Manager: " +
                    payload.code
                );

            } catch (_) {}

        }


        return payload;

    }


    /* =========================================================
       09 — REGISTRY SYNCHRONISATION
       ========================================================= */

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
                !Array.isArray(apps)
            ) {

                return 0;

            }


            apps.forEach(
                app => {

                    if (!app) {

                        return;

                    }


                    const id =
                        normalizeId(
                            app.id ||
                            app.appId ||
                            app.name
                        );


                    if (!id) {

                        return;

                    }


                    const existing =
                        state.apps.get(
                            id
                        );


                    state.apps.set(
                        id,
                        {

                            ...(
                                existing ||
                                {}
                            ),

                            ...app,

                            id,

                            appId:
                                id,

                            manager:
                                MODULE_ID,

                            managerUpdatedAt:
                                Date.now()

                        }
                    );

                }
            );


            return apps.length;

        } catch (exception) {

            reportError(
                "REGISTRY_SYNC_ERROR",
                exception
            );


            return 0;

        }

    }


    /* =========================================================
       10 — APP REGISTRATION
       ========================================================= */

    function register(
        config
    ) {

        if (
            !config ||
            typeof config !==
            "object"
        ) {

            reportError(
                "INVALID_APP_CONFIG",
                new Error(
                    "Ungültige App-Konfiguration."
                )
            );


            return null;

        }


        const id =
            normalizeId(
                config.id ||
                config.appId ||
                config.name ||
                config.title
            );


        if (!id) {

            reportError(
                "MISSING_APP_ID",
                new Error(
                    "App besitzt keine gültige ID."
                )
            );


            return null;

        }


        const existing =
            state.apps.get(
                id
            );


        const app = {

            ...(existing || {}),

            ...config,

            id,

            appId:
                id,

            name:
                config.name ||
                existing?.name ||
                id,

            title:
                config.title ||
                existing?.title ||
                config.name ||
                id,

            enabled:
                config.enabled !==
                undefined
                    ? config.enabled !== false
                    : (
                        existing
                            ? existing.enabled !== false
                            : true
                    ),

            status:
                config.status ||
                existing?.status ||
                "registered",

            manager:
                MODULE_ID,

            registeredAt:
                existing?.registeredAt ||
                Date.now(),

            updatedAt:
                Date.now()

        };


        state.apps.set(
            id,
            app
        );


        emit(
            existing
                ? "app-updated"
                : "app-registered",
            {
                app,
                previous:
                    existing ||
                    null
            }
        );


        return app;

    }


    function registerApp(
        config
    ) {

        return register(
            config
        );

    }


    /* =========================================================
       11 — APP ACCESS
       ========================================================= */

    function get(
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


    function getApp(
        id
    ) {

        return get(
            id
        );

    }


    function has(
        id
    ) {

        return !!get(
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


    function getCount() {

        return state.apps.size;

    }


    /* =========================================================
       12 — APP SEARCH
       ========================================================= */

    function search(
        query
    ) {

        const value =
            String(
                query || ""
            )
            .trim()
            .toLowerCase();


        if (!value) {

            return getAll();

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
                                field ||
                                ""
                            )
                            .toLowerCase()
                            .includes(
                                value
                            )
                    );

                }
            );

    }


    /* =========================================================
       13 — APP STATE
       ========================================================= */

    function setStatus(
        id,
        status
    ) {

        const app =
            get(
                id
            );


        if (!app) {

            return false;

        }


        app.status =
            String(
                status ||
                "unknown"
            );


        app.updatedAt =
            Date.now();


        emit(
            "app-status",
            {
                app
            }
        );


        return true;

    }


    function getStatus(
        id
    ) {

        const app =
            get(
                id
            );


        return app
            ? app.status
            : null;

    }


    /* =========================================================
       14 — SESSION CREATION
       ========================================================= */

    function createSession(
        app,
        options = {}
    ) {

        const sessionId =
            "session-" +
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

            sessionId,

            appId:
                app.id,

            state:
                "opening",

            createdAt:
                Date.now(),

            openedAt:
                null,

            closedAt:
                null,

            minimized:
                false,

            focused:
                true,

            windowId:
                options.windowId ||
                null,

            route:
                options.route ||
                app.route ||
                null,

            data:
                options.data || {},

            metadata:
                options.metadata || {}

        };


        state.sessions.set(
            sessionId,
            session
        );


        return session;

    }


    function getSession(
        sessionId
    ) {

        return (
            state.sessions.get(
                sessionId
            ) ||
            null
        );

    }


    function getSessions() {

        return Array.from(
            state.sessions.values()
        );

    }


    function getAppSessions(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        return getSessions()
            .filter(
                session =>
                    session.appId ===
                    id
            );

    }


    function getRunningSessions() {

        return getSessions()
            .filter(
                session =>
                    session.state !==
                    "closed"
            );

    }


    /* =========================================================
       15 — OPEN / LAUNCH
       ========================================================= */

    async function open(
        id,
        options = {}
    ) {

        let app =
            get(
                id
            );


        /*
         * Falls der Manager noch nicht synchronisiert
         * wurde, versuchen wir die Registry erneut.
         */

        if (!app) {

            syncRegistry();

            app =
                get(
                    id
                );

        }


        if (!app) {

            reportError(
                "APP_NOT_FOUND",
                new Error(
                    `App '${id}' wurde nicht gefunden.`
                ),
                {
                    appId:
                        id
                }
            );


            return null;

        }


        if (
            app.enabled ===
            false
        ) {

            reportError(
                "APP_DISABLED",
                new Error(
                    `App '${app.id}' ist deaktiviert.`
                ),
                {
                    appId:
                        app.id
                }
            );


            return null;

        }


        /*
         * Singleton-App:
         * vorhandene Session aktivieren.
         */

        if (
            app.singleton !==
            false
        ) {

            const existingSession =
                getAppSessions(
                    app.id
                )
                .find(
                    session =>
                        session.state !==
                        "closed"
                );


            if (existingSession) {

                await activate(
                    existingSession.id
                );


                return existingSession;

            }

        }


        const session =
            createSession(
                app,
                options
            );


        setStatus(
            app.id,
            "opening"
        );


        try {

            /*
             * App-eigene init()
             */

            if (
                typeof app.init ===
                "function"
            ) {

                const result =
                    app.init(
                        {
                            app,
                            session,
                            manager:
                                api
                        }
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
             * Router
             */

            const router =
                getRouter();


            if (
                router &&
                hasMethod(
                    router,
                    "open"
                )
            ) {

                try {

                    const routeResult =
                        await router.open(
                            app.route ||
                            app.id,
                            {
                                app,
                                session,
                                options
                            }
                        );


                    if (
                        routeResult &&
                        typeof routeResult ===
                        "string"
                    ) {

                        session.route =
                            routeResult;

                    }

                } catch (exception) {

                    warn(
                        "Router konnte App nicht öffnen:",
                        exception
                    );

                }

            }


            /*
             * Window Manager
             */

            const windowManager =
                getWindowManager();


            if (
                windowManager
            ) {

                try {

                    if (
                        hasMethod(
                            windowManager,
                            "open"
                        )
                    ) {

                        const windowResult =
                            await windowManager.open(
                                app.id,
                                {
                                    app,
                                    session,
                                    options
                                }
                            );


                        if (
                            windowResult &&
                            typeof windowResult ===
                            "object"
                        ) {

                            session.windowId =
                                windowResult.id ||
                                windowResult.windowId ||
                                session.windowId;

                        }

                    }
                    else if (
                        hasMethod(
                            windowManager,
                            "createWindow"
                        )
                    ) {

                        const windowResult =
                            await windowManager.createWindow(
                                {
                                    id:
                                        app.id,

                                    app,

                                    session
                                }
                            );


                        if (
                            windowResult
                        ) {

                            session.windowId =
                                windowResult.id ||
                                windowResult.windowId ||
                                session.windowId;

                        }

                    }

                } catch (exception) {

                    warn(
                        "Window Manager konnte Fenster nicht öffnen:",
                        exception
                    );

                }

            }


            /*
             * App-eigene start()
             */

            if (
                typeof app.start ===
                "function"
            ) {

                const result =
                    app.start(
                        {
                            app,
                            session,
                            manager:
                                api
                        }
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }


            session.state =
                "running";

            session.openedAt =
                Date.now();

            session.focused =
                true;


            state.activeAppId =
                app.id;

            state.activeSessionId =
                session.id;


            setStatus(
                app.id,
                "running"
            );


            state.statistics.launches +=
                1;


            emit(
                "app-opened",
                {
                    app,
                    session
                }
            );


            emit(
                "app-started",
                {
                    app,
                    session
                }
            );


            await activate(
                session.id
            );


            log(
                "App geöffnet:",
                app.id
            );


            return session;

        } catch (exception) {

            session.state =
                "error";


            setStatus(
                app.id,
                "error"
            );


            reportError(
                "APP_OPEN_ERROR",
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


    function launch(
        id,
        options = {}
    ) {

        return open(
            id,
            options
        );

    }


    function launchApp(
        id,
        options = {}
    ) {

        return open(
            id,
            options
        );

    }


    /* =========================================================
       16 — ACTIVATE
       ========================================================= */

    async function activate(
        sessionId
    ) {

        const session =
            getSession(
                sessionId
            );


        if (!session) {

            return false;

        }


        const app =
            get(
                session.appId
            );


        if (!app) {

            return false;

        }


        /*
         * Vorherige Session verliert Fokus.
         */

        if (
            state.activeSessionId &&
            state.activeSessionId !==
            session.id
        ) {

            const previous =
                getSession(
                    state.activeSessionId
                );


            if (previous) {

                previous.focused =
                    false;

                emit(
                    "session-deactivated",
                    {
                        session:
                            previous
                    }
                );

            }

        }


        session.focused =
            true;

        session.minimized =
            false;

        session.state =
            "running";


        state.activeAppId =
            app.id;

        state.activeSessionId =
            session.id;


        /*
         * App onActivate
         */

        if (
            typeof app.onActivate ===
            "function"
        ) {

            try {

                await app.onActivate(
                    {
                        app,
                        session,
                        manager:
                            api
                    }
                );

            } catch (exception) {

                reportError(
                    "APP_ACTIVATE_ERROR",
                    exception,
                    {
                        appId:
                            app.id
                    }
                );

            }

        }


        /*
         * Window Manager focus
         */

        const windowManager =
            getWindowManager();


        if (
            windowManager
        ) {

            try {

                if (
                    hasMethod(
                        windowManager,
                        "focus"
                    ) &&
                    session.windowId
                ) {

                    await windowManager.focus(
                        session.windowId
                    );

                }
                else if (
                    hasMethod(
                        windowManager,
                        "activate"
                    ) &&
                    session.windowId
                ) {

                    await windowManager.activate(
                        session.windowId
                    );

                }

            } catch (exception) {

                warn(
                    "Fenster konnte nicht fokussiert werden:",
                    exception
                );

            }

        }


        state.statistics.activations +=
            1;


        emit(
            "app-activated",
            {
                app,
                session
            }
        );


        return true;

    }


    function activateApp(
        id
    ) {

        const sessions =
            getAppSessions(
                id
            );


        const session =
            sessions.find(
                item =>
                    item.state !==
                    "closed"
            );


        if (!session) {

            return false;

        }


        return activate(
            session.id
        );

    }


    /* =========================================================
       17 — DEACTIVATE
       ========================================================= */

    async function deactivate(
        sessionId
    ) {

        const session =
            getSession(
                sessionId
            );


        if (!session) {

            return false;

        }


        const app =
            get(
                session.appId
            );


        session.focused =
            false;


        if (
            app &&
            typeof app.onDeactivate ===
            "function"
        ) {

            try {

                await app.onDeactivate(
                    {
                        app,
                        session,
                        manager:
                            api
                    }
                );

            } catch (exception) {

                reportError(
                    "APP_DEACTIVATE_ERROR",
                    exception,
                    {
                        appId:
                            session.appId
                    }
                );

            }

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


        state.statistics.deactivations +=
            1;


        emit(
            "app-deactivated",
            {
                app,
                session
            }
        );


        return true;

    }


    /* =========================================================
       18 — MINIMIZE
       ========================================================= */

    async function minimize(
        sessionId
    ) {

        const session =
            getSession(
                sessionId
            );


        if (!session) {

            return false;

        }


        const app =
            get(
                session.appId
            );


        session.minimized =
            true;

        session.focused =
            false;

        session.state =
            "minimized";


        if (
            app &&
            typeof app.minimize ===
            "function"
        ) {

            try {

                await app.minimize(
                    {
                        app,
                        session,
                        manager:
                            api
                    }
                );

            } catch (exception) {

                reportError(
                    "APP_MINIMIZE_ERROR",
                    exception
                );

            }

        }


        const windowManager =
            getWindowManager();


        if (
            windowManager &&
            session.windowId
        ) {

            try {

                if (
                    hasMethod(
                        windowManager,
                        "minimize"
                    )
                ) {

                    await windowManager.minimize(
                        session.windowId
                    );

                }

            } catch (exception) {

                warn(
                    "Window minimization failed:",
                    exception
                );

            }

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


        state.statistics.minimized +=
            1;


        emit(
            "app-minimized",
            {
                app,
                session
            }
        );


        return true;

    }


    /* =========================================================
       19 — RESTORE
       ========================================================= */

    async function restore(
        sessionId
    ) {

        const session =
            getSession(
                sessionId
            );


        if (!session) {

            return false;

        }


        const app =
            get(
                session.appId
            );


        session.minimized =
            false;

        session.state =
            "running";


        if (
            app &&
            typeof app.restore ===
            "function"
        ) {

            try {

                await app.restore(
                    {
                        app,
                        session,
                        manager:
                            api
                    }
                );

            } catch (exception) {

                reportError(
                    "APP_RESTORE_ERROR",
                    exception
                );

            }

        }


        const windowManager =
            getWindowManager();


        if (
            windowManager &&
            session.windowId
        ) {

            try {

                if (
                    hasMethod(
                        windowManager,
                        "restore"
                    )
                ) {

                    await windowManager.restore(
                        session.windowId
                    );

                }

            } catch (exception) {

                warn(
                    "Window restore failed:",
                    exception
                );

            }

        }


        state.statistics.restored +=
            1;


        emit(
            "app-restored",
            {
                app,
                session
            }
        );


        return activate(
            session.id
        );

    }


    /* =========================================================
       20 — CLOSE
       ========================================================= */

    async function close(
        sessionId
    ) {

        const session =
            getSession(
                sessionId
            );


        if (!session) {

            return false;

        }


        const app =
            get(
                session.appId
            );


        try {

            /*
             * App close()
             */

            if (
                app &&
                typeof app.close ===
                "function"
            ) {

                const result =
                    app.close(
                        {
                            app,
                            session,
                            manager:
                                api
                        }
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
             * App stop()
             */

            if (
                app &&
                typeof app.stop ===
                "function"
            ) {

                const result =
                    app.stop(
                        {
                            app,
                            session,
                            manager:
                                api
                        }
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
             * Window Manager
             */

            const windowManager =
                getWindowManager();


            if (
                windowManager &&
                session.windowId
            ) {

                try {

                    if (
                        hasMethod(
                            windowManager,
                            "close"
                        )
                    ) {

                        await windowManager.close(
                            session.windowId
                        );

                    }
                    else if (
                        hasMethod(
                            windowManager,
                            "closeWindow"
                        )
                    ) {

                        await windowManager.closeWindow(
                            session.windowId
                        );

                    }

                } catch (exception) {

                    warn(
                        "Window konnte nicht geschlossen werden:",
                        exception
                    );

                }

            }


            session.state =
                "closed";

            session.focused =
                false;

            session.minimized =
                false;

            session.closedAt =
                Date.now();


            if (
                state.activeSessionId ===
                session.id
            ) {

                state.activeSessionId =
                    null;

                state.activeAppId =
                    null;

            }


            setStatus(
                session.appId,
                "registered"
            );


            state.statistics.closes +=
                1;


            emit(
                "app-closed",
                {
                    app,
                    session
                }
            );


            return true;

        } catch (exception) {

            reportError(
                "APP_CLOSE_ERROR",
                exception,
                {
                    appId:
                        session.appId,

                    sessionId:
                        session.id
                }
            );


            session.state =
                "error";


            return false;

        }

    }


    function closeApp(
        id
    ) {

        const sessions =
            getAppSessions(
                id
            )
            .filter(
                session =>
                    session.state !==
                    "closed"
            );


        if (
            sessions.length ===
            0
        ) {

            return false;

        }


        return Promise.all(
            sessions.map(
                session =>
                    close(
                        session.id
                    )
            )
        );

    }


    /* =========================================================
       21 — CLOSE ALL
       ========================================================= */

    async function closeAll(
        options = {}
    ) {

        const sessions =
            getRunningSessions();


        let closed =
            0;


        for (
            const session of sessions
        ) {

            const result =
                await close(
                    session.id
                );


            if (result) {

                closed++;

            }

        }


        emit(
            "all-apps-closed",
            {
                closed,

                options
            }
        );


        return closed;

    }


    /* =========================================================
       22 — ACTIVE APP
       ========================================================= */

    function getActiveApp() {

        if (
            !state.activeAppId
        ) {

            return null;

        }


        return get(
            state.activeAppId
        );

    }


    function getActiveSession() {

        if (
            !state.activeSessionId
        ) {

            return null;

        }


        return getSession(
            state.activeSessionId
        );

    }


    /* =========================================================
       23 — RUNNING APPS
       ========================================================= */

    function getRunningApps() {

        const ids =
            new Set();


        getRunningSessions()
            .forEach(
                session =>
                    ids.add(
                        session.appId
                    )
            );


        return Array.from(
            ids
        )
        .map(
            id =>
                get(id)
        )
        .filter(
            Boolean
        );

    }


    /* =========================================================
       24 — MULTI APP
       ========================================================= */

    function getMultiAppState() {

        const sessions =
            getRunningSessions();


        return {

            enabled:
                sessions.length >
                1,

            count:
                sessions.length,

            sessions:
                sessions.map(
                    session => ({
                        ...session
                    })
                ),

            activeAppId:
                state.activeAppId,

            activeSessionId:
                state.activeSessionId

        };

    }


    /*
     * Diese Methode wird später von der Desktop-/Window-
     * Architektur genutzt, wenn mehrere Apps gleichzeitig
     * sichtbar sein sollen.
     */

    async function splitApp(
        sessionId,
        options = {}
    ) {

        const session =
            getSession(
                sessionId
            );


        if (!session) {

            return false;

        }


        session.metadata =
            {
                ...session.metadata,

                splitScreen:
                    true,

                splitOptions:
                    clone(
                        options
                    )

            };


        emit(
            "app-split",
            {
                session,
                options
            }
        );


        return true;

    }


    /*
     * Vorbereitung für Picture-in-Picture.
     */

    async function pictureInPicture(
        sessionId,
        options = {}
    ) {

        const session =
            getSession(
                sessionId
            );


        if (!session) {

            return false;

        }


        session.metadata =
            {
                ...session.metadata,

                pictureInPicture:
                    true,

                pictureInPictureOptions:
                    clone(
                        options
                    )

            };


        emit(
            "app-picture-in-picture",
            {
                session,
                options
            }
        );


        return true;

    }


    /* =========================================================
       25 — ENABLE / DISABLE
       ========================================================= */

    function enable(
        id
    ) {

        const app =
            get(
                id
            );


        if (!app) {

            return false;

        }


        app.enabled =
            true;

        app.status =
            "registered";

        app.updatedAt =
            Date.now();


        emit(
            "app-enabled",
            {
                app
            }
        );


        return true;

    }


    function disable(
        id
    ) {

        const app =
            get(
                id
            );


        if (!app) {

            return false;

        }


        app.enabled =
            false;

        app.status =
            "disabled";

        app.updatedAt =
            Date.now();


        emit(
            "app-disabled",
            {
                app
            }
        );


        return true;

    }


    /* =========================================================
       26 — REMOVE
       ========================================================= */

    async function remove(
        id
    ) {

        const normalized =
            normalizeId(
                id
            );


        if (!normalized) {

            return false;

        }


        const app =
            get(
                normalized
            );


        if (!app) {

            return false;

        }


        await closeApp(
            normalized
        );


        state.apps.delete(
            normalized
        );


        emit(
            "app-removed",
            {
                app
            }
        );


        return true;

    }


    /* =========================================================
       27 — ROUTER CONNECTION
       ========================================================= */

    function connectRouter() {

        const router =
            getRouter();


        state.connections.router =
            !!router;


        return state.connections.router;

    }


    /* =========================================================
       28 — WINDOW MANAGER CONNECTION
       ========================================================= */

    function connectWindowManager() {

        const manager =
            getWindowManager();


        state.connections.windowManager =
            !!manager;


        return state.connections.windowManager;

    }


    /* =========================================================
       29 — LAUNCHER CONNECTION
       ========================================================= */

    function connectLauncher() {

        const launcher =
            getLauncher();


        state.connections.launcher =
            !!launcher;


        return state.connections.launcher;

    }


    /* =========================================================
       30 — KERNEL CONNECTION
       ========================================================= */

    function connectKernel() {

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


            emit(
                "kernel-connected",
                {
                    kernel
                }
            );


            return true;

        } catch (exception) {

            reportError(
                "KERNEL_CONNECTION_ERROR",
                exception
            );


            return false;

        }

    }


    /* =========================================================
       31 — SYSTEM CONNECTION
       ========================================================= */

    function connectSystem() {

        const system =
            getSystem();


        if (!system) {

            state.connections.system =
                false;

            return false;

        }


        state.connections.system =
            true;


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


            emit(
                "system-connected",
                {
                    system
                }
            );


            return true;

        } catch (exception) {

            reportError(
                "SYSTEM_CONNECTION_ERROR",
                exception
            );


            return false;

        }

    }


    /* =========================================================
       32 — CONNECTION REFRESH
       ========================================================= */

    function refreshConnections() {

        connectKernel();

        connectSystem();

        syncRegistry();

        connectRouter();

        connectWindowManager();

        connectLauncher();


        return getConnectionStatus();

    }


    function getConnectionStatus() {

        return {

            kernel:
                !!getKernel(),

            system:
                !!getSystem(),

            registry:
                !!getRegistry(),

            router:
                !!getRouter(),

            windowManager:
                !!getWindowManager(),

            launcher:
                !!getLauncher()

        };

    }


    /* =========================================================
       33 — STATISTICS
       ========================================================= */

    function getStatistics() {

        return {
            ...state.statistics
        };

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

            appCount:
                getCount(),

            runningAppCount:
                getRunningApps()
                    .length,

            sessionCount:
                getSessions()
                    .length,

            activeApp:
                state.activeAppId,

            activeSession:
                state.activeSessionId,

            multiApp:
                getMultiAppState(),

            connections:
                getConnectionStatus(),

            statistics:
                getStatistics(),

            apps:
                getAll()
                    .map(
                        app => ({

                            id:
                                app.id,

                            name:
                                app.name,

                            title:
                                app.title,

                            category:
                                app.category ||
                                null,

                            version:
                                app.version ||
                                null,

                            enabled:
                                app.enabled !==
                                false,

                            status:
                                app.status ||
                                "unknown"

                        })
                    ),

            timestamp:
                new Date()
                    .toISOString()

        };

    }


    /* =========================================================
       35 — HEALTH CHECK
       ========================================================= */

    function healthCheck() {

        const connections =
            getConnectionStatus();


        const problems =
            [];


        if (!connections.kernel) {

            problems.push(
                "Kernel nicht verbunden."
            );

        }


        if (!connections.registry) {

            problems.push(
                "App Registry nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length ===
                0,

            problems,

            connections,

            appCount:
                getCount(),

            runningApps:
                getRunningApps()
                    .length,

            sessions:
                getSessions()
                    .length,

            timestamp:
                new Date()
                    .toISOString()

        };

    }


    /* =========================================================
       36 — INITIALIZATION
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


        refreshConnections();


        /*
         * Registry Events
         */

        const registry =
            getRegistry();


        if (
            registry &&
            hasMethod(
                registry,
                "on"
            )
        ) {

            try {

                registry.on(
                    "registered",
                    payload => {

                        if (
                            payload &&
                            payload.app
                        ) {

                            register(
                                payload.app
                            );

                        }

                    }
                );


                registry.on(
                    "updated",
                    payload => {

                        if (
                            payload &&
                            payload.app
                        ) {

                            register(
                                payload.app
                            );

                        }

                    }
                );


                registry.on(
                    "removed",
                    payload => {

                        if (
                            payload &&
                            payload.app
                        ) {

                            state.apps.delete(
                                normalizeId(
                                    payload.app.id
                                )
                            );

                        }

                    }
                );

            } catch (exception) {

                warn(
                    "Registry Event-Verbindung fehlgeschlagen:",
                    exception
                );

            }

        }


        state.ready =
            true;

        state.initializing =
            false;


        /*
         * Kernel als ready markieren.
         */

        const kernel =
            getKernel();


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
                    VERSION,

                diagnostics:
                    diagnostics()
            }
        );


        log(
            "App Manager bereit.",
            VERSION
        );


        return api;

    }


    /* =========================================================
       37 — PUBLIC API
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

                    appCount:
                        getCount(),

                    sessionCount:
                        getSessions()
                            .length,

                    activeAppId:
                        state.activeAppId,

                    activeSessionId:
                        state.activeSessionId,

                    connections:
                        getConnectionStatus()

                };

            },


        /* Events */

        on,

        off,

        emit,


        /* Registry */

        register,

        registerApp,

        syncRegistry,


        /* Access */

        get,

        getApp,

        getAll,

        getApps,

        has,

        getCount,

        search,


        /* Status */

        setStatus,

        getStatus,

        enable,

        disable,


        /* Sessions */

        createSession,

        getSession,

        getSessions,

        getAppSessions,

        getRunningSessions,


        /* Launch */

        open,

        launch,

        launchApp,


        /* Control */

        activate,

        activateApp,

        deactivate,

        minimize,

        restore,

        close,

        closeApp,

        closeAll,

        remove,


        /* Active */

        getActiveApp,

        getActiveSession,

        getRunningApps,


        /* Multi App */

        getMultiAppState,

        splitApp,

        pictureInPicture,


        /* Connections */

        connectKernel,

        connectSystem,

        connectRouter,

        connectWindowManager,

        connectLauncher,

        refreshConnections,

        getConnectionStatus,


        /* Diagnostics */

        getStatistics,

        diagnostics,

        healthCheck,


        /* Initialization */

        initialize

    };


    /* =========================================================
       38 — GLOBAL EXPORT
       ========================================================= */

    window.HalDoAppManager =
        api;


    window.HalDoOSAppManager =
        api;


    HalDoOS.appManager =
        api;


    /* =========================================================
       39 — KERNEL EVENT
       ========================================================= */

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


    const kernel =
        getKernel();


    if (
        kernel &&
        hasMethod(
            kernel,
            "on"
        )
    ) {

        try {

            kernel.on(
                "kernel:ready",
                handleKernelReady
            );

        } catch (exception) {

            warn(
                "Kernel Event-Verbindung fehlgeschlagen:",
                exception
            );

        }

    }


    /* =========================================================
       40 — DOM START
       ========================================================= */

    function boot() {

        initialize()
            .catch(
                exception => {

                    state.initializing =
                        false;

                    reportError(
                        "APP_MANAGER_INIT_ERROR",
                        exception
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

    }
    else {

        boot();

    }


    /* =========================================================
       41 — FINAL EXPOSURE
       ========================================================= */

    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appManager =
        api;


    log(
        "HalDo AI OS App Manager geladen."
    );


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS APP MANAGER
   ============================================================ */