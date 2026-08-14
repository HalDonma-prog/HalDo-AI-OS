/* =========================================================
   HALDO AI OS 18
   APP MANAGER
   VERSION 18.0.0
   PROFESSIONAL ULTIMATE FOUNDATION

   NEUE GESAMTVERSION
   TEIL 1 / 7

   Zentrale App-Verwaltung

   Architektur:

       Kernel
          ↓
       App Manager
          ↕
       App Registry
          ↕
       App Router
          ↓
       Window Manager
          ↓
       Application

   HINWEIS:
   Diese Datei wird über 7 Teile aufgebaut.

   Kein Teil enthält einen eigenen
   window/document-Abschluss.

   Der einzige Abschluss befindet sich
   ganz am Ende von Teil 7.
   ========================================================= */


/* =========================================================
   GLOBAL FOUNDATION
   ========================================================= */

window.HalDoOS =
    window.HalDoOS || {};

const HalDoOS =
    window.HalDoOS;

const APP_MANAGER_VERSION =
    "18.0.0";

const APP_MANAGER_NAME =
    "HalDo AI OS App Manager";

const APP_MANAGER_ID =
    "app-manager";


/* =========================================================
   INTERNAL STATE
   ========================================================= */

const appManagerState = {

    initialized: false,

    ready: false,

    apps: new Map(),

    runningApps: new Map(),

    minimizedApps: new Set(),

    activeAppId: null,

    previousAppId: null,

    listeners: new Map(),

    connections: {

        kernel: false,

        system: false,

        registry: false,

        router: false,

        launcher: false,

        windowManager: false

    },

    statistics: {

        registered: 0,

        started: 0,

        stopped: 0,

        activated: 0,

        minimized: 0,

        restored: 0,

        destroyed: 0,

        errors: 0

    }

};


/* =========================================================
   EVENT SYSTEM
   ========================================================= */

function appManagerOn(
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
        !appManagerState.listeners.has(
            event
        )
    ) {

        appManagerState.listeners.set(
            event,
            new Set()
        );

    }

    const listeners =
        appManagerState.listeners.get(
            event
        );

    listeners.add(
        callback
    );

    return function unsubscribe() {

        appManagerOff(
            event,
            callback
        );

    };

}


function appManagerOff(
    event,
    callback
) {

    const listeners =
        appManagerState.listeners.get(
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

        appManagerState.listeners.delete(
            event
        );

    }

}


function appManagerEmit(
    event,
    data
) {

    const listeners =
        appManagerState.listeners.get(
            event
        );

    if (listeners) {

        listeners.forEach(
            function (callback) {

                try {

                    callback(
                        data
                    );

                } catch (error) {

                    console.error(
                        "[HalDo App Manager] Event listener error:",
                        error
                    );

                }

            }
        );

    }

    /*
     * Verbindung zum zentralen
     * HalDoOS Event-System.
     */

    const globalEvents =
        HalDoOS.events;

    if (
        globalEvents &&
        typeof globalEvents.emit ===
        "function"
    ) {

        try {

            globalEvents.emit(
                "app-manager:" + event,
                data
            );

        } catch (error) {

            console.warn(
                "[HalDo App Manager] Global event error:",
                error
            );

        }

    }

}


/* =========================================================
   ERROR SYSTEM
   ========================================================= */

function appManagerReportError(
    code,
    error,
    extra
) {

    appManagerState.statistics.errors +=
        1;

    const payload = {

        code:
            code || "UNKNOWN_ERROR",

        error:
            error || null,

        extra:
            extra || null,

        timestamp:
            new Date().toISOString()

    };

    console.error(
        "[HalDo App Manager]",
        payload
    );

    appManagerEmit(
        "error",
        payload
    );

}


/* =========================================================
   ID NORMALIZATION
   ========================================================= */

function appManagerNormalizeId(
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


function appManagerCreateId(
    value
) {

    return appManagerNormalizeId(
        value
    );

}


/* =========================================================
   SAFE METHOD HELPERS
   ========================================================= */

function appManagerHasMethod(
    object,
    method
) {

    return !!(
        object &&
        typeof object[method] ===
        "function"
    );

}


function appManagerCallSafe(
    object,
    method,
    args
) {

    if (
        !appManagerHasMethod(
            object,
            method
        )
    ) {

        return null;

    }

    try {

        return object[method].apply(
            object,
            args || []
        );

    } catch (error) {

        appManagerReportError(
            "METHOD_ERROR",
            error,
            {
                method
            }
        );

        return null;

    }

}


/* =========================================================
   GLOBAL SERVICE LOOKUPS
   ========================================================= */

function appManagerGetKernel() {

    return (
        window.HalDoKernel ||
        HalDoOS.kernel ||
        null
    );

}


function appManagerGetSystem() {

    return (
        window.HalDoSystem ||
        HalDoOS.system ||
        null
    );

}


function appManagerGetRegistry() {

    return (
        window.HalDoAppRegistry ||
        HalDoOS.appRegistry ||
        null
    );

}


function appManagerGetRouter() {

    return (
        window.HalDoAppRouter ||
        HalDoOS.appRouter ||
        null
    );

}


function appManagerGetLauncher() {

    return (
        window.HalDoAppLauncher ||
        window.HalDoLauncher ||
        HalDoOS.launcher ||
        null
    );

}


function appManagerGetWindowManager() {

    return (
        window.HalDoWindowManager ||
        HalDoOS.windowManager ||
        null
    );

}


/* =========================================================
   APP CONFIGURATION NORMALIZATION
   ========================================================= */

function appManagerNormalizeApp(
    config
) {

    config =
        config || {};

    const id =
        appManagerCreateId(
            config.id ||
            config.appId ||
            config.name ||
            config.title
        );

    if (!id) {

        return null;

    }

    return {

        id,

        appId:
            id,

        name:
            config.name ||
            id,

        title:
            config.title ||
            config.name ||
            id,

        description:
            config.description ||
            "",

        category:
            config.category ||
            "system",

        icon:
            config.icon ||
            "◈",

        version:
            config.version ||
            APP_MANAGER_VERSION,

        status:
            config.status ||
            "registered",

        enabled:
            config.enabled !== false,

        system:
            config.system === true,

        singleton:
            config.singleton !== false,

        route:
            config.route ||
            null,

        entry:
            config.entry ||
            null,

        url:
            config.url ||
            null,

        permissions:
            Array.isArray(
                config.permissions
            )
                ? [
                    ...config.permissions
                ]
                : [],

        dependencies:
            Array.isArray(
                config.dependencies
            )
                ? [
                    ...config.dependencies
                ]
                : [],

        metadata:
            (
                config.metadata &&
                typeof config.metadata ===
                "object"
            )
                ? {
                    ...config.metadata
                }
                : {},

        api:
            (
                config.api &&
                typeof config.api ===
                "object"
            )
                ? config.api
                : {},

        init:
            typeof config.init ===
            "function"
                ? config.init
                : null,

        start:
            typeof config.start ===
            "function"
                ? config.start
                : null,

        open:
            typeof config.open ===
            "function"
                ? config.open
                : null,

        stop:
            typeof config.stop ===
            "function"
                ? config.stop
                : null,

        close:
            typeof config.close ===
            "function"
                ? config.close
                : null,

        minimize:
            typeof config.minimize ===
            "function"
                ? config.minimize
                : null,

        restore:
            typeof config.restore ===
            "function"
                ? config.restore
                : null,

        destroy:
            typeof config.destroy ===
            "function"
                ? config.destroy
                : null,

        onActivate:
            typeof config.onActivate ===
            "function"
                ? config.onActivate
                : null,

        onDeactivate:
            typeof config.onDeactivate ===
            "function"
                ? config.onDeactivate
                : null,

        createdAt:
            config.createdAt ||
            Date.now(),

        updatedAt:
            Date.now()

    };

}


/* =========================================================
   END OF PART 1 / 7
   ========================================================= */

/*
 * TEIL 2 WIRD DIREKT UNTER DIESE ZEILE EINGEFÜGT.
 *
 * KEIN:
 *
 * })(window, document);
 *
 * KEIN:
 *
 * (function (window, document) {
 *
 * Erst Teil 7 enthält den endgültigen Abschluss.
 */
/* =========================================================
   HALDO AI OS 18
   APP MANAGER
   TEIL 2 / 7

   APP REGISTRIERUNG
   APP-ABFRAGEN
   REGISTRY-SYNCHRONISATION
   DEPENDENCY-GRUNDLAGEN
   ========================================================= */


/* =========================================================
   APP REGISTRIEREN
   ========================================================= */

function appManagerRegisterApp(
    config
) {

    const app =
        appManagerNormalizeApp(
            config
        );

    if (!app) {

        appManagerReportError(
            "INVALID_APP",
            new Error(
                "Ungültige App-Konfiguration."
            ),
            {
                config
            }
        );

        return null;

    }

    const existing =
        appManagerState.apps.get(
            app.id
        );

    /*
     * Existierende App:
     * Daten kontrolliert zusammenführen.
     */

    if (existing) {

        const merged = {

            ...existing,

            ...app,

            metadata: {

                ...(existing.metadata || {}),

                ...(app.metadata || {})

            },

            api: {

                ...(existing.api || {}),

                ...(app.api || {})

            },

            permissions:
                app.permissions.length > 0
                    ? [
                        ...app.permissions
                    ]
                    : [
                        ...(existing.permissions || [])
                    ],

            dependencies:
                app.dependencies.length > 0
                    ? [
                        ...app.dependencies
                    ]
                    : [
                        ...(existing.dependencies || [])
                    ],

            createdAt:
                existing.createdAt ||
                app.createdAt,

            updatedAt:
                Date.now()

        };

        appManagerState.apps.set(
            app.id,
            merged
        );

        appManagerEmit(
            "updated",
            {
                app:
                    merged,

                previous:
                    existing
            }
        );

        return merged;

    }

    /*
     * Neue App speichern.
     */

    appManagerState.apps.set(
        app.id,
        app
    );

    appManagerState.statistics.registered +=
        1;

    appManagerEmit(
        "registered",
        {
            app
        }
    );

    return app;

}


/* =========================================================
   MEHRERE APPS REGISTRIEREN
   ========================================================= */

function appManagerRegisterApps(
    list
) {

    if (
        !Array.isArray(list)
    ) {

        return [];

    }

    const registered = [];

    list.forEach(
        function (config) {

            const app =
                appManagerRegisterApp(
                    config
                );

            if (app) {

                registered.push(
                    app
                );

            }

        }
    );

    return registered;

}


/* =========================================================
   APP ABRUFEN
   ========================================================= */

function appManagerGetApp(
    id
) {

    const normalizedId =
        appManagerCreateId(
            id
        );

    if (!normalizedId) {

        return null;

    }

    return (
        appManagerState.apps.get(
            normalizedId
        ) ||
        null
    );

}


/* =========================================================
   ALLE APPS
   ========================================================= */

function appManagerGetApps() {

    return Array.from(
        appManagerState.apps.values()
    );

}


/* =========================================================
   AKTIVIERTE APPS
   ========================================================= */

function appManagerGetEnabledApps() {

    return appManagerGetApps().filter(
        function (app) {

            return (
                app.enabled !== false
            );

        }
    );

}


/* =========================================================
   DEAKTIVIERTE APPS
   ========================================================= */

function appManagerGetDisabledApps() {

    return appManagerGetApps().filter(
        function (app) {

            return (
                app.enabled === false
            );

        }
    );

}


/* =========================================================
   LAUFENDE APPS
   ========================================================= */

function appManagerGetRunningApps() {

    return Array.from(
        appManagerState.runningApps.values()
    );

}


/* =========================================================
   LAUFENDE APP ABRUFEN
   ========================================================= */

function appManagerGetRunningApp(
    id
) {

    const normalizedId =
        appManagerCreateId(
            id
        );

    if (!normalizedId) {

        return null;

    }

    return (
        appManagerState.runningApps.get(
            normalizedId
        ) ||
        null
    );

}


/* =========================================================
   APP VORHANDEN?
   ========================================================= */

function appManagerHasApp(
    id
) {

    const normalizedId =
        appManagerCreateId(
            id
        );

    return (
        !!normalizedId &&
        appManagerState.apps.has(
            normalizedId
        )
    );

}


/* =========================================================
   APP LÄUFT?
   ========================================================= */

function appManagerIsRunning(
    id
) {

    const normalizedId =
        appManagerCreateId(
            id
        );

    return (
        !!normalizedId &&
        appManagerState.runningApps.has(
            normalizedId
        )
    );

}


/* =========================================================
   APP MINIMIERT?
   ========================================================= */

function appManagerIsMinimized(
    id
) {

    const normalizedId =
        appManagerCreateId(
            id
        );

    return (
        !!normalizedId &&
        appManagerState.minimizedApps.has(
            normalizedId
        )
    );

}


/* =========================================================
   AKTIVE APP ABRUFEN
   ========================================================= */

function appManagerGetActiveApp() {

    const activeId =
        appManagerState.activeAppId;

    if (!activeId) {

        return null;

    }

    return (
        appManagerState.runningApps.get(
            activeId
        ) ||
        appManagerState.apps.get(
            activeId
        ) ||
        null
    );

}


/* =========================================================
   VORHERIGE APP ABRUFEN
   ========================================================= */

function appManagerGetPreviousApp() {

    const previousId =
        appManagerState.previousAppId;

    if (!previousId) {

        return null;

    }

    return (
        appManagerState.runningApps.get(
            previousId
        ) ||
        appManagerState.apps.get(
            previousId
        ) ||
        null
    );

}


/* =========================================================
   APP STATUS SETZEN
   ========================================================= */

function appManagerSetStatus(
    app,
    status
) {

    if (!app) {

        return;

    }

    const previousStatus =
        app.status;

    app.status =
        status;

    app.updatedAt =
        Date.now();

    appManagerEmit(
        "status-changed",
        {

            app,

            previousStatus,

            status

        }
    );

}


/* =========================================================
   DEPENDENCIES PRÜFEN
   ========================================================= */

function appManagerCheckDependencies(
    app
) {

    if (!app) {

        return false;

    }

    const dependencies =
        Array.isArray(
            app.dependencies
        )
            ? app.dependencies
            : [];

    if (
        dependencies.length ===
        0
    ) {

        return true;

    }

    return dependencies.every(
        function (dependency) {

            const dependencyId =
                appManagerCreateId(
                    dependency
                );

            const dependencyApp =
                appManagerState.apps.get(
                    dependencyId
                );

            return !!(
                dependencyApp &&
                dependencyApp.enabled !== false
            );

        }
    );

}


/* =========================================================
   FEHLENDE DEPENDENCIES
   ========================================================= */

function appManagerGetMissingDependencies(
    app
) {

    if (!app) {

        return [];

    }

    const dependencies =
        Array.isArray(
            app.dependencies
        )
            ? app.dependencies
            : [];

    return dependencies.filter(
        function (dependency) {

            const dependencyId =
                appManagerCreateId(
                    dependency
                );

            const dependencyApp =
                appManagerState.apps.get(
                    dependencyId
                );

            return !(
                dependencyApp &&
                dependencyApp.enabled !== false
            );

        }
    );

}


/* =========================================================
   APP REGISTRY SYNCHRONISIEREN
   ========================================================= */

function appManagerSyncRegistry(
    app
) {

    if (!app) {

        return false;

    }

    const registry =
        appManagerGetRegistry();

    if (!registry) {

        return false;

    }

    try {

        /*
         * Wenn die Registry die App bereits kennt,
         * wird sie nicht blind erneut registriert.
         */

        if (
            appManagerHasMethod(
                registry,
                "has"
            ) &&
            registry.has(
                app.id
            )
        ) {

            /*
             * Optional vorhandene Update-Funktion
             * verwenden.
             */

            if (
                appManagerHasMethod(
                    registry,
                    "update"
                )
            ) {

                appManagerCallSafe(
                    registry,
                    "update",
                    [
                        app.id,
                        app
                    ]
                );

            }

            appManagerState.connections.registry =
                true;

            return true;

        }


        /*
         * Neue App an Registry übergeben.
         */

        if (
            appManagerHasMethod(
                registry,
                "register"
            )
        ) {

            appManagerCallSafe(
                registry,
                "register",
                [
                    app
                ]
            );

            appManagerState.connections.registry =
                true;

            appManagerEmit(
                "registry-synced",
                {
                    app
                }
            );

            return true;

        }

    } catch (error) {

        appManagerReportError(
            "REGISTRY_SYNC_ERROR",
            error,
            {
                appId:
                    app.id
            }
        );

    }

    return false;

}


/* =========================================================
   REGISTRY IMPORTIEREN
   ========================================================= */

function appManagerImportRegistry() {

    const registry =
        appManagerGetRegistry();

    if (!registry) {

        return 0;

    }

    let definitions =
        [];

    try {

        if (
            appManagerHasMethod(
                registry,
                "getAll"
            )
        ) {

            definitions =
                registry.getAll();

        } else if (
            appManagerHasMethod(
                registry,
                "getApps"
            )
        ) {

            definitions =
                registry.getApps();

        } else if (
            appManagerHasMethod(
                registry,
                "list"
            )
        ) {

            definitions =
                registry.list();

        }

    } catch (error) {

        appManagerReportError(
            "REGISTRY_IMPORT_ERROR",
            error
        );

        return 0;

    }

    if (
        !Array.isArray(
            definitions
        )
    ) {

        return 0;

    }

    let imported =
        0;

    definitions.forEach(
        function (definition) {

            if (!definition) {

                return;

            }

            const id =
                appManagerCreateId(
                    definition.id ||
                    definition.appId ||
                    definition.name ||
                    definition.title
                );

            if (!id) {

                return;

            }

            /*
             * Bereits vorhandene Definition
             * nicht blind überschreiben.
             */

            if (
                appManagerState.apps.has(
                    id
                )
            ) {

                return;

            }

            const app =
                appManagerNormalizeApp(
                    definition
                );

            if (!app) {

                return;

            }

            appManagerState.apps.set(
                id,
                app
            );

            imported +=
                1;

            appManagerEmit(
                "imported",
                {
                    app
                }
            );

        }
    );

    if (
        imported > 0
    ) {

        appManagerState.connections.registry =
            true;

    }

    return imported;

}


/* =========================================================
   END OF PART 2 / 7
   ========================================================= */

/*
 * TEIL 3 WIRD DIREKT HIERUNTER EINGEFÜGT.
 *
 * KEIN window/document-Wrapper.
 * KEIN Abschluss.
 *
 * Der endgültige Abschluss kommt erst
 * am Ende von TEIL 7.
 */
/* =========================================================
   HALDO AI OS 18
   NEW APP MANAGER
   PART 3 / 7

   APP LIFECYCLE
   START
   OPEN
   ACTIVATE
   DEPENDENCIES
   RUNTIME CONTEXT
   ========================================================= */


/* =========================================================
   ABHÄNGIGKEITEN PRÜFEN
   ========================================================= */

function getMissingDependencies(app) {

    if (!app) {
        return [];
    }

    const dependencies =
        Array.isArray(app.dependencies)
            ? app.dependencies
            : [];

    return dependencies.filter(function (dependency) {

        const dependencyId =
            createId(dependency);

        if (!dependencyId) {
            return true;
        }

        const dependencyApp =
            apps.get(dependencyId);

        return !(
            dependencyApp &&
            dependencyApp.enabled !== false
        );
    });
}


function checkDependencies(app) {

    return (
        getMissingDependencies(app).length === 0
    );
}


/* =========================================================
   APP RUNTIME ERSTELLEN
   ========================================================= */

function createRuntime(app, options) {

    return {

        id: app.id,

        appId: app.id,

        app: app,

        options:
            options || {},

        status:
            "starting",

        startedAt:
            Date.now(),

        activatedAt:
            null,

        minimizedAt:
            null,

        services: {

            kernel:
                getKernel(),

            system:
                getSystem(),

            registry:
                window.HalDoAppRegistry ||
                HalDoOS.appRegistry ||
                null,

            router:
                getRouter(),

            launcher:
                getLauncher(),

            windowManager:
                getWindowManager()

        },

        manager:
            api,

        os:
            HalDoOS,

        window:
            window,

        document:
            document

    };
}


/* =========================================================
   SINGLETON PRÜFUNG
   ========================================================= */

function checkSingleton(app) {

    if (!app) {
        return false;
    }

    if (!app.singleton) {
        return false;
    }

    return runningApps.has(
        app.id
    );
}


/* =========================================================
   APP INITIALISIEREN
   ========================================================= */

function initializeApp(
    app,
    runtime
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
                    runtime
                );

            /*
             * Eine App darf ausdrücklich
             * false zurückgeben, um den
             * Start abzubrechen.
             */

            if (result === false) {

                emit(
                    "init-failed",
                    {
                        app: app,
                        runtime: runtime
                    }
                );

                return false;
            }
        }

        setRuntimeStatus(
            runtime,
            "initialized"
        );

        emit(
            "initialized",
            {
                app: app,
                runtime: runtime
            }
        );

        return true;

    } catch (error) {

        emit(
            "error",
            {
                type:
                    "APP_INIT_ERROR",

                app:
                    app,

                runtime:
                    runtime,

                error:
                    error
            }
        );

        console.error(
            "[HalDo App Manager] App initialization failed:",
            error
        );

        return false;
    }
}


/* =========================================================
   RUNTIME STATUS
   ========================================================= */

function setRuntimeStatus(
    runtime,
    status
) {

    if (!runtime) {
        return;
    }

    runtime.status =
        status;

    if (runtime.app) {

        runtime.app.status =
            status;

        runtime.app.updatedAt =
            Date.now();

    }
}


/* =========================================================
   APP STARTEN
   ========================================================= */

function startApp(
    id,
    options
) {

    const app =
        getApp(id);

    if (!app) {

        emit(
            "error",
            {
                type:
                    "APP_NOT_FOUND",

                id:
                    id
            }
        );

        return null;
    }


    /* -----------------------------------------------------
       APP DEAKTIVIERT?
       ----------------------------------------------------- */

    if (
        app.enabled === false
    ) {

        emit(
            "error",
            {
                type:
                    "APP_DISABLED",

                app:
                    app
            }
        );

        return null;
    }


    /* -----------------------------------------------------
       ABHÄNGIGKEITEN
       ----------------------------------------------------- */

    const missing =
        getMissingDependencies(
            app
        );

    if (
        missing.length > 0
    ) {

        emit(
            "dependency-error",
            {
                app:
                    app,

                missing:
                    missing
            }
        );

        return null;
    }


    /* -----------------------------------------------------
       BEREITS GESTARTET
       ----------------------------------------------------- */

    if (
        runningApps.has(
            app.id
        )
    ) {

        const existingRuntime =
            runningApps.get(
                app.id
            );

        activateApp(
            app.id
        );

        return existingRuntime;
    }


    /* -----------------------------------------------------
       RUNTIME ERSTELLEN
       ----------------------------------------------------- */

    const runtime =
        createRuntime(
            app,
            options
        );


    /* -----------------------------------------------------
       RUNTIME SPEICHERN
       ----------------------------------------------------- */

    runningApps.set(
        app.id,
        runtime
    );


    setRuntimeStatus(
        runtime,
        "starting"
    );


    emit(
        "starting",
        {
            app:
                app,

            runtime:
                runtime
        }
    );


    /* -----------------------------------------------------
       INITIALISIERUNG
       ----------------------------------------------------- */

    const initializedSuccessfully =
        initializeApp(
            app,
            runtime
        );

    if (
        !initializedSuccessfully
    ) {

        runningApps.delete(
            app.id
        );

        setRuntimeStatus(
            runtime,
            "error"
        );

        return null;
    }


    /* -----------------------------------------------------
       START CALLBACK
       ----------------------------------------------------- */

    try {

        if (
            typeof app.start ===
            "function"
        ) {

            const result =
                app.start(
                    runtime
                );

            if (
                result === false
            ) {

                runningApps.delete(
                    app.id
                );

                setRuntimeStatus(
                    runtime,
                    "error"
                );

                emit(
                    "start-failed",
                    {
                        app:
                            app,

                        runtime:
                            runtime
                    }
                );

                return null;
            }
        }

    } catch (error) {

        runningApps.delete(
            app.id
        );

        setRuntimeStatus(
            runtime,
            "error"
        );

        emit(
            "error",
            {
                type:
                    "APP_START_ERROR",

                app:
                    app,

                runtime:
                    runtime,

                error:
                    error
            }
        );

        console.error(
            "[HalDo App Manager] App start failed:",
            error
        );

        return null;
    }


    /* -----------------------------------------------------
       OPEN CALLBACK
       ----------------------------------------------------- */

    try {

        if (
            typeof app.open ===
            "function"
        ) {

            const result =
                app.open(
                    runtime
                );

            if (
                result === false
            ) {

                setRuntimeStatus(
                    runtime,
                    "running"
                );

            }

        }

    } catch (error) {

        emit(
            "error",
            {
                type:
                    "APP_OPEN_ERROR",

                app:
                    app,

                runtime:
                    runtime,

                error:
                    error
            }
        );

    }


    /* -----------------------------------------------------
       STATUS
       ----------------------------------------------------- */

    setRuntimeStatus(
        runtime,
        "running"
    );


    /* -----------------------------------------------------
       WINDOW MANAGER
       ----------------------------------------------------- */

    connectWindowManager(
        "open",
        runtime,
        options
    );


    /* -----------------------------------------------------
       AKTIVIEREN
       ----------------------------------------------------- */

    activateApp(
        app.id
    );


    /* -----------------------------------------------------
       EVENT
       ----------------------------------------------------- */

    emit(
        "started",
        {
            app:
                app,

            runtime:
                runtime
        }
    );


    return runtime;
}


/* =========================================================
   APP ÖFFNEN
   ========================================================= */

function openApp(
    id,
    options
) {

    const app =
        getApp(id);

    if (!app) {

        emit(
            "error",
            {
                type:
                    "APP_NOT_FOUND",

                id:
                    id
            }
        );

        return null;
    }


    /*
     * Wenn die App bereits läuft,
     * wird sie nur aktiviert.
     */

    if (
        runningApps.has(
            app.id
        )
    ) {

        activateApp(
            app.id
        );

        return runningApps.get(
            app.id
        );
    }


    return startApp(
        app.id,
        options
    );
}


/* =========================================================
   APP AKTIVIEREN
   ========================================================= */

function activateApp(
    id
) {

    const app =
        getApp(id);

    if (!app) {
        return false;
    }

    const runtime =
        runningApps.get(
            app.id
        );

    if (!runtime) {

        /*
         * Nicht laufende App zuerst
         * normal starten.
         */

        const started =
            startApp(
                app.id
            );

        return !!started;
    }


    /* -----------------------------------------------------
       VORHERIGE APP DEAKTIVIEREN
       ----------------------------------------------------- */

    const previousId =
        activeAppId;

    if (
        previousId &&
        previousId !== app.id
    ) {

        const previousApp =
            getApp(
                previousId
            );

        const previousRuntime =
            runningApps.get(
                previousId
            );

        if (
            previousApp &&
            previousRuntime
        ) {

            try {

                if (
                    typeof previousApp.onDeactivate ===
                    "function"
                ) {

                    previousApp.onDeactivate(
                        previousRuntime
                    );
                }

            } catch (error) {

                console.error(
                    "[HalDo App Manager] Deactivate error:",
                    error
                );

            }

        }
    }


    /* -----------------------------------------------------
       ACTIVE APP SETZEN
       ----------------------------------------------------- */

    activeAppId =
        app.id;

    runtime.activatedAt =
        Date.now();

    setRuntimeStatus(
        runtime,
        "active"
    );


    /* -----------------------------------------------------
       RESTORE AUS MINIMIERT
       ----------------------------------------------------- */

    if (
        minimizedApps.has(
            app.id
        )
    ) {

        restoreApp(
            app.id
        );

    }


    /* -----------------------------------------------------
       APP CALLBACK
       ----------------------------------------------------- */

    try {

        if (
            typeof app.onActivate ===
            "function"
        ) {

            app.onActivate(
                runtime
            );

        }

    } catch (error) {

        console.error(
            "[HalDo App Manager] Activation error:",
            error
        );

    }


    /* -----------------------------------------------------
       WINDOW MANAGER
       ----------------------------------------------------- */

    connectWindowManager(
        "activate",
        runtime
    );


    /* -----------------------------------------------------
       ROUTER
       ----------------------------------------------------- */

    connectRouter(
        "focused",
        app
    );


    /* -----------------------------------------------------
       EVENT
       ----------------------------------------------------- */

    emit(
        "activated",
        {
            app:
                app,

            runtime:
                runtime,

            previous:
                previousId
        }
    );


    return true;
}


/* =========================================================
   AKTIVE APP ABRUFEN
   ========================================================= */

function getActiveApp() {

    if (!activeAppId) {
        return null;
    }

    return (
        getApp(
            activeAppId
        )
    );
}


/* =========================================================
   AKTIVE RUNTIME ABRUFEN
   ========================================================= */

function getActiveRuntime() {

    if (!activeAppId) {
        return null;
    }

    return (
        runningApps.get(
            activeAppId
        ) ||
        null
    );
}


/* =========================================================
   VORHERIGE APP
   ========================================================= */

function getPreviousApp() {

    if (
        !activeAppId
    ) {

        return null;

    }

    const running =
        getRunningApps();

    const previous =
        running.find(
            function (runtime) {

                return (
                    runtime.id !==
                    activeAppId
                );

            }
        );

    return (
        previous
            ? previous.app
            : null
    );
}


/* =========================================================
   ENDE TEIL 3
   ========================================================= */
/* =========================================================
   HALDO AI OS 18
   NEW APP MANAGER
   PART 4 / 7

   MINIMIZE
   RESTORE
   STOP
   CLOSE
   DESTROY
   WINDOW MANAGER
   ROUTER
   ========================================================= */


/* =========================================================
   APP MINIMIEREN
   ========================================================= */

function minimizeApp(id) {

    const app =
        getApp(id);

    if (!app) {

        emit(
            "error",
            {
                type:
                    "APP_NOT_FOUND",

                id:
                    id
            }
        );

        return false;
    }

    const runtime =
        runningApps.get(
            app.id
        );

    if (!runtime) {

        return false;
    }


    /*
     * Bereits minimiert?
     */

    if (
        minimizedApps.has(
            app.id
        )
    ) {

        return true;
    }


    /* -----------------------------------------------------
       APP CALLBACK
       ----------------------------------------------------- */

    try {

        if (
            typeof app.minimize ===
            "function"
        ) {

            app.minimize(
                runtime
            );
        }

    } catch (error) {

        emit(
            "error",
            {
                type:
                    "APP_MINIMIZE_ERROR",

                app:
                    app,

                runtime:
                    runtime,

                error:
                    error
            }
        );

        console.error(
            "[HalDo App Manager] Minimize error:",
            error
        );
    }


    /* -----------------------------------------------------
       STATUS
       ----------------------------------------------------- */

    minimizedApps.add(
        app.id
    );

    runtime.minimizedAt =
        Date.now();

    setRuntimeStatus(
        runtime,
        "minimized"
    );


    /* -----------------------------------------------------
       WINDOW MANAGER
       ----------------------------------------------------- */

    connectWindowManager(
        "minimize",
        runtime
    );


    /* -----------------------------------------------------
       ACTIVE APP ZURÜCKSETZEN
       ----------------------------------------------------- */

    if (
        activeAppId ===
        app.id
    ) {

        activeAppId =
            null;

        emit(
            "active-changed",
            {
                current:
                    null,

                previous:
                    app.id
            }
        );
    }


    /* -----------------------------------------------------
       EVENT
       ----------------------------------------------------- */

    emit(
        "minimized",
        {
            app:
                app,

            runtime:
                runtime
        }
    );


    return true;
}


/* =========================================================
   APP WIEDERHERSTELLEN
   ========================================================= */

function restoreApp(id) {

    const app =
        getApp(id);

    if (!app) {

        return false;
    }

    const runtime =
        runningApps.get(
            app.id
        );

    if (!runtime) {

        return false;
    }


    /* -----------------------------------------------------
       MINIMIERT STATUS ENTFERNEN
       ----------------------------------------------------- */

    minimizedApps.delete(
        app.id
    );

    runtime.minimizedAt =
        null;


    /* -----------------------------------------------------
       APP CALLBACK
       ----------------------------------------------------- */

    try {

        if (
            typeof app.restore ===
            "function"
        ) {

            app.restore(
                runtime
            );
        }

    } catch (error) {

        emit(
            "error",
            {
                type:
                    "APP_RESTORE_ERROR",

                app:
                    app,

                runtime:
                    runtime,

                error:
                    error
            }
        );

        console.error(
            "[HalDo App Manager] Restore error:",
            error
        );
    }


    /* -----------------------------------------------------
       STATUS
       ----------------------------------------------------- */

    setRuntimeStatus(
        runtime,
        "running"
    );


    /* -----------------------------------------------------
       WINDOW MANAGER
       ----------------------------------------------------- */

    connectWindowManager(
        "restore",
        runtime
    );


    /* -----------------------------------------------------
       APP AKTIVIEREN
       ----------------------------------------------------- */

    activateApp(
        app.id
    );


    /* -----------------------------------------------------
       EVENT
       ----------------------------------------------------- */

    emit(
        "restored",
        {
            app:
                app,

            runtime:
                runtime
        }
    );


    return true;
}


/* =========================================================
   APP STOPPEN
   ========================================================= */

function stopApp(id) {

    const app =
        getApp(id);

    if (!app) {

        return false;
    }

    const runtime =
        runningApps.get(
            app.id
        );

    if (!runtime) {

        return true;
    }


    /* -----------------------------------------------------
       STATUS
       ----------------------------------------------------- */

    setRuntimeStatus(
        runtime,
        "stopping"
    );


    emit(
        "stopping",
        {
            app:
                app,

            runtime:
                runtime
        }
    );


    /* -----------------------------------------------------
       STOP CALLBACK
       ----------------------------------------------------- */

    try {

        if (
            typeof app.stop ===
            "function"
        ) {

            app.stop(
                runtime
            );
        }

    } catch (error) {

        emit(
            "error",
            {
                type:
                    "APP_STOP_ERROR",

                app:
                    app,

                runtime:
                    runtime,

                error:
                    error
            }
        );

        console.error(
            "[HalDo App Manager] Stop error:",
            error
        );
    }


    /* -----------------------------------------------------
       DEAKTIVIERUNG
       ----------------------------------------------------- */

    try {

        if (
            typeof app.onDeactivate ===
            "function"
        ) {

            app.onDeactivate(
                runtime
            );
        }

    } catch (error) {

        console.error(
            "[HalDo App Manager] Deactivation error:",
            error
        );
    }


    /* -----------------------------------------------------
       WINDOW MANAGER
       ----------------------------------------------------- */

    connectWindowManager(
        "close",
        runtime
    );


    /* -----------------------------------------------------
       RUNTIME ENTFERNEN
       ----------------------------------------------------- */

    runningApps.delete(
        app.id
    );

    minimizedApps.delete(
        app.id
    );


    /* -----------------------------------------------------
       ACTIVE APP
       ----------------------------------------------------- */

    if (
        activeAppId ===
        app.id
    ) {

        activeAppId =
            null;

        /*
         * Falls weitere Apps laufen,
         * wird die zuletzt laufende App
         * wieder aktiviert.
         */

        const remaining =
            getRunningApps();

        if (
            remaining.length > 0
        ) {

            const nextRuntime =
                remaining[
                    remaining.length - 1
                ];

            if (nextRuntime) {

                activateApp(
                    nextRuntime.id
                );
            }
        }
    }


    /* -----------------------------------------------------
       STATUS
       ----------------------------------------------------- */

    setRuntimeStatus(
        runtime,
        "stopped"
    );


    /* -----------------------------------------------------
       EVENT
       ----------------------------------------------------- */

    emit(
        "stopped",
        {
            app:
                app,

            runtime:
                runtime
        }
    );


    return true;
}


/* =========================================================
   APP SCHLIESSEN
   ========================================================= */

function closeApp(id) {

    const app =
        getApp(id);

    if (!app) {

        return false;
    }

    const runtime =
        runningApps.get(
            app.id
        );

    if (!runtime) {

        return true;
    }


    /* -----------------------------------------------------
       CLOSE CALLBACK
       ----------------------------------------------------- */

    try {

        if (
            typeof app.close ===
            "function"
        ) {

            app.close(
                runtime
            );
        }

    } catch (error) {

        emit(
            "error",
            {
                type:
                    "APP_CLOSE_ERROR",

                app:
                    app,

                runtime:
                    runtime,

                error:
                    error
            }
        );

        console.error(
            "[HalDo App Manager] Close error:",
            error
        );
    }


    /* -----------------------------------------------------
       ROUTER INFORMIEREN
       ----------------------------------------------------- */

    connectRouter(
        "closed",
        app
    );


    /*
     * Stop übernimmt die eigentliche
     * Lifecycle-Aufräumung.
     */

    const result =
        stopApp(
            app.id
        );


    emit(
        "closed",
        {
            app:
                app,

            runtime:
                runtime,

            result:
                result
        }
    );


    return result;
}


/* =========================================================
   APP ZERSTÖREN
   ========================================================= */

function destroyApp(id) {

    const app =
        getApp(id);

    if (!app) {

        return false;
    }


    /*
     * Falls die App noch läuft,
     * zuerst sauber schließen.
     */

    if (
        runningApps.has(
            app.id
        )
    ) {

        closeApp(
            app.id
        );
    }


    /* -----------------------------------------------------
       DESTROY CALLBACK
       ----------------------------------------------------- */

    try {

        if (
            typeof app.destroy ===
            "function"
        ) {

            app.destroy(
                {
                    app:
                        app,

                    manager:
                        api,

                    os:
                        HalDoOS
                }
            );
        }

    } catch (error) {

        emit(
            "error",
            {
                type:
                    "APP_DESTROY_ERROR",

                app:
                    app,

                error:
                    error
            }
        );

        console.error(
            "[HalDo App Manager] Destroy error:",
            error
        );
    }


    /* -----------------------------------------------------
       APP AUS MANAGER ENTFERNEN
       ----------------------------------------------------- */

    apps.delete(
        app.id
    );

    runningApps.delete(
        app.id
    );

    minimizedApps.delete(
        app.id
    );


    if (
        activeAppId ===
        app.id
    ) {

        activeAppId =
            null;
    }


    /* -----------------------------------------------------
       EVENT
       ----------------------------------------------------- */

    emit(
        "destroyed",
        {
            app:
                app
        }
    );


    return true;
}


/* =========================================================
   APP DEAKTIVIEREN
   ========================================================= */

function deactivateApp(id) {

    const app =
        getApp(id);

    if (!app) {

        return false;
    }

    const runtime =
        runningApps.get(
            app.id
        );

    if (!runtime) {

        return false;
    }


    try {

        if (
            typeof app.onDeactivate ===
            "function"
        ) {

            app.onDeactivate(
                runtime
            );
        }

    } catch (error) {

        console.error(
            "[HalDo App Manager] Deactivation error:",
            error
        );
    }


    if (
        activeAppId ===
        app.id
    ) {

        activeAppId =
            null;

        setRuntimeStatus(
            runtime,
            "running"
        );

    }


    connectRouter(
        "closed",
        app
    );


    emit(
        "deactivated",
        {
            app:
                app,

            runtime:
                runtime
        }
    );


    return true;
}


/* =========================================================
   ALLE APPS STOPPEN
   ========================================================= */

function stopAllApps() {

    const running =
        getRunningApps();

    let stopped =
        0;

    running.forEach(
        function (runtime) {

            if (
                stopApp(
                    runtime.id
                )
            ) {

                stopped +=
                    1;
            }

        }
    );


    activeAppId =
        null;


    emit(
        "all-stopped",
        {
            count:
                stopped
        }
    );


    return stopped;
}


/* =========================================================
   ALLE APPS SCHLIESSEN
   ========================================================= */

function closeAllApps() {

    const running =
        getRunningApps();

    let closed =
        0;

    running.forEach(
        function (runtime) {

            if (
                closeApp(
                    runtime.id
                )
            ) {

                closed +=
                    1;
            }

        }
    );


    activeAppId =
        null;


    emit(
        "all-closed",
        {
            count:
                closed
        }
    );


    return closed;
}


/* =========================================================
   APP AUS REGISTRY SYNCHRONISIEREN
   ========================================================= */

function syncAppWithRegistry(app) {

    if (!app) {
        return false;
    }

    const registry =
        window.HalDoAppRegistry ||
        HalDoOS.appRegistry ||
        null;

    if (!registry) {
        return false;
    }


    try {

        if (
            typeof registry.has ===
            "function" &&
            registry.has(
                app.id
            )
        ) {

            if (
                typeof registry.update ===
                "function"
            ) {

                registry.update(
                    app.id,
                    app
                );
            }

            return true;
        }


        if (
            typeof registry.register ===
            "function"
        ) {

            registry.register(
                app
            );

            return true;
        }

    } catch (error) {

        console.error(
            "[HalDo App Manager] Registry sync error:",
            error
        );

    }


    return false;
}


/* =========================================================
   ALLE APPS MIT REGISTRY SYNCHRONISIEREN
   ========================================================= */

function syncAllApps() {

    const allApps =
        getApps();

    let synced =
        0;

    allApps.forEach(
        function (app) {

            if (
                syncAppWithRegistry(
                    app
                )
            ) {

                synced +=
                    1;
            }

        }
    );


    emit(
        "registry-sync-complete",
        {
            total:
                allApps.length,

            synced:
                synced
        }
    );


    return synced;
}


/* =========================================================
   ENDE TEIL 4
   ========================================================= */
/* =========================================================
   HALDO AI OS 18
   NEW APP MANAGER
   PART 5 / 7

   APP VERWALTUNG
   ENABLE / DISABLE
   UPDATE
   REMOVE
   ROUTER
   LAUNCHER
   WINDOW MANAGER
   SYSTEM / KERNEL VERBINDUNG
   ========================================================= */


/* =========================================================
   APP AKTIVIEREN / DEAKTIVIEREN
   ========================================================= */

function enableApp(id) {

    const app =
        getApp(id);

    if (!app) {
        return false;
    }

    app.enabled =
        true;

    app.updatedAt =
        Date.now();

    emit(
        "enabled",
        {
            app:
                app
        }
    );

    syncAppWithRegistry(
        app
    );

    return true;
}


function disableApp(id) {

    const app =
        getApp(id);

    if (!app) {
        return false;
    }

    /*
     * Eine laufende App wird zuerst
     * sauber beendet.
     */

    if (
        runningApps.has(
            app.id
        )
    ) {

        closeApp(
            app.id
        );
    }

    app.enabled =
        false;

    app.updatedAt =
        Date.now();

    emit(
        "disabled",
        {
            app:
                app
        }
    );

    syncAppWithRegistry(
        app
    );

    return true;
}


/* =========================================================
   APP DEFINITION AKTUALISIEREN
   ========================================================= */

function updateApp(
    id,
    changes
) {

    const app =
        getApp(id);

    if (!app) {

        return null;
    }

    if (
        !changes ||
        typeof changes !==
        "object"
    ) {

        return app;
    }


    /*
     * Lifecycle-Funktionen werden
     * nur übernommen, wenn sie
     * tatsächlich Funktionen sind.
     */

    const lifecycleKeys = [

        "init",
        "start",
        "open",
        "stop",
        "close",
        "minimize",
        "restore",
        "destroy",
        "onActivate",
        "onDeactivate"

    ];


    const merged = {

        ...app,

        ...changes,

        id:
            app.id,

        appId:
            app.id,

        metadata: {

            ...app.metadata,

            ...(
                changes.metadata &&
                typeof changes.metadata ===
                "object"
                    ? changes.metadata
                    : {}
            )

        },

        api: {

            ...app.api,

            ...(
                changes.api &&
                typeof changes.api ===
                "object"
                    ? changes.api
                    : {}
            )

        },

        permissions:
            Array.isArray(
                changes.permissions
            )
                ? [
                    ...changes.permissions
                ]
                : [
                    ...app.permissions
                ],

        dependencies:
            Array.isArray(
                changes.dependencies
            )
                ? [
                    ...changes.dependencies
                ]
                : [
                    ...app.dependencies
                ],

        updatedAt:
            Date.now()

    };


    /*
     * Ungültige Lifecycle-Werte
     * dürfen vorhandene Funktionen
     * nicht zerstören.
     */

    lifecycleKeys.forEach(
        function (key) {

            if (
                Object.prototype.hasOwnProperty.call(
                    changes,
                    key
                )
            ) {

                if (
                    changes[key] !== null &&
                    typeof changes[key] !==
                    "function"
                ) {

                    merged[key] =
                        app[key] ||
                        null;
                }
            }

        }
    );


    apps.set(
        app.id,
        merged
    );


    emit(
        "updated",
        {
            app:
                merged,

            previous:
                app
        }
    );


    syncAppWithRegistry(
        merged
    );


    return merged;
}


/* =========================================================
   APP ENTFERNEN
   ========================================================= */

function unregisterApp(id) {

    const app =
        getApp(id);

    if (!app) {

        return false;
    }


    /*
     * Laufende App zuerst sauber
     * schließen.
     */

    if (
        runningApps.has(
            app.id
        )
    ) {

        closeApp(
            app.id
        );
    }


    apps.delete(
        app.id
    );

    minimizedApps.delete(
        app.id
    );

    runningApps.delete(
        app.id
    );


    if (
        activeAppId ===
        app.id
    ) {

        activeAppId =
            null;
    }


    /*
     * Registry ebenfalls informieren,
     * sofern diese eine remove-Methode
     * besitzt.
     */

    const registry =
        window.HalDoAppRegistry ||
        HalDoOS.appRegistry ||
        null;

    if (
        registry &&
        typeof registry.remove ===
        "function"
    ) {

        try {

            registry.remove(
                app.id
            );

        } catch (error) {

            console.warn(
                "[HalDo App Manager] Registry remove error:",
                error
            );

        }
    }


    emit(
        "unregistered",
        {
            app:
                app
        }
    );


    return true;
}


/* =========================================================
   APP ROUTE REGISTRIEREN
   ========================================================= */

function registerAppRoute(
    id
) {

    const app =
        getApp(id);

    if (!app) {
        return false;
    }

    const router =
        getRouter();

    if (!router) {
        return false;
    }

    if (!app.route) {
        return false;
    }


    try {

        if (
            typeof router.has ===
            "function" &&
            router.has(
                app.route
            )
        ) {

            return true;
        }


        if (
            typeof router.register ===
            "function"
        ) {

            router.register(
                app.route,
                {
                    app:
                        app.id,

                    id:
                        app.id,

                    name:
                        app.name,

                    title:
                        app.title,

                    aliases: [

                        app.id,

                        app.name,

                        app.title

                    ].filter(
                        Boolean
                    )

                }
            );

            emit(
                "route-registered",
                {
                    app:
                        app,

                    route:
                        app.route
                }
            );

            return true;
        }

    } catch (error) {

        emit(
            "error",
            {
                type:
                    "ROUTE_REGISTER_ERROR",

                app:
                    app,

                error:
                    error
            }
        );

        console.error(
            "[HalDo App Manager] Route registration error:",
            error
        );
    }


    return false;
}


/* =========================================================
   ALLE ROUTES REGISTRIEREN
   ========================================================= */

function registerAllAppRoutes() {

    const allApps =
        getApps();

    let registered =
        0;

    allApps.forEach(
        function (app) {

            if (
                registerAppRoute(
                    app.id
                )
            ) {

                registered +=
                    1;
            }

        }
    );


    emit(
        "routes-registered",
        {
            total:
                allApps.length,

            registered:
                registered
        }
    );


    return registered;
}


/* =========================================================
   LAUNCHER MIT APP VERBINDEN
   ========================================================= */

function registerAppWithLauncher(
    id
) {

    const app =
        getApp(id);

    if (!app) {
        return false;
    }

    const launcher =
        getLauncher();

    if (!launcher) {
        return false;
    }


    try {

        if (
            typeof launcher.register ===
            "function"
        ) {

            launcher.register(
                app
            );

            emit(
                "launcher-registered",
                {
                    app:
                        app
                }
            );

            return true;
        }


        /*
         * Einige ältere Launcher können
         * addApp statt register verwenden.
         */

        if (
            typeof launcher.addApp ===
            "function"
        ) {

            launcher.addApp(
                app
            );

            emit(
                "launcher-registered",
                {
                    app:
                        app
                }
            );

            return true;
        }

    } catch (error) {

        emit(
            "error",
            {
                type:
                    "LAUNCHER_REGISTER_ERROR",

                app:
                    app,

                error:
                    error
            }
        );

        console.error(
            "[HalDo App Manager] Launcher registration error:",
            error
        );
    }


    return false;
}


/* =========================================================
   ALLE APPS MIT LAUNCHER VERBINDEN
   ========================================================= */

function registerAllAppsWithLauncher() {

    const allApps =
        getApps();

    let registered =
        0;

    allApps.forEach(
        function (app) {

            if (
                registerAppWithLauncher(
                    app.id
                )
            ) {

                registered +=
                    1;
            }

        }
    );


    emit(
        "launcher-sync-complete",
        {
            total:
                allApps.length,

            registered:
                registered
        }
    );


    return registered;
}


/* =========================================================
   WINDOW MANAGER PRÜFEN
   ========================================================= */

function hasWindowManager() {

    return !!(
        getWindowManager()
    );
}


/* =========================================================
   APP WINDOW ÖFFNEN
   ========================================================= */

function openAppWindow(
    id,
    options
) {

    const app =
        getApp(id);

    if (!app) {
        return false;
    }

    const runtime =
        runningApps.get(
            app.id
        );

    if (!runtime) {
        return false;
    }


    const manager =
        getWindowManager();

    if (!manager) {
        return false;
    }


    try {

        if (
            typeof manager.createWindow ===
            "function"
        ) {

            manager.createWindow(
                runtime.id,
                {
                    ...app,

                    ...(
                        options &&
                        typeof options ===
                        "object"
                            ? options
                            : {}
                    )
                }
            );

            return true;
        }


        if (
            typeof manager.create ===
            "function"
        ) {

            manager.create(
                runtime.id,
                {
                    ...app,

                    ...(
                        options &&
                        typeof options ===
                        "object"
                            ? options
                            : {}
                    )
                }
            );

            return true;
        }


        if (
            typeof manager.open ===
            "function"
        ) {

            manager.open(
                runtime
            );

            return true;
        }

    } catch (error) {

        emit(
            "error",
            {
                type:
                    "WINDOW_OPEN_ERROR",

                app:
                    app,

                runtime:
                    runtime,

                error:
                    error
            }
        );

        console.error(
            "[HalDo App Manager] Window open error:",
            error
        );
    }


    return false;
}


/* =========================================================
   APP WINDOW FOKUSSIEREN
   ========================================================= */

function focusAppWindow(
    id
) {

    const app =
        getApp(id);

    if (!app) {
        return false;
    }

    const runtime =
        runningApps.get(
            app.id
        );

    if (!runtime) {
        return false;
    }

    const manager =
        getWindowManager();

    if (!manager) {
        return false;
    }


    try {

        if (
            typeof manager.focusWindow ===
            "function"
        ) {

            manager.focusWindow(
                runtime.id
            );

            return true;
        }


        if (
            typeof manager.focus ===
            "function"
        ) {

            manager.focus(
                runtime.id
            );

            return true;
        }


        if (
            typeof manager.activate ===
            "function"
        ) {

            manager.activate(
                runtime.id
            );

            return true;
        }

    } catch (error) {

        emit(
            "error",
            {
                type:
                    "WINDOW_FOCUS_ERROR",

                app:
                    app,

                runtime:
                    runtime,

                error:
                    error
            }
        );

        console.error(
            "[HalDo App Manager] Window focus error:",
            error
        );
    }


    return false;
}


/* =========================================================
   APP WINDOW SCHLIESSEN
   ========================================================= */

function closeAppWindow(
    id
) {

    const app =
        getApp(id);

    if (!app) {
        return false;
    }

    const runtime =
        runningApps.get(
            app.id
        );

    if (!runtime) {
        return false;
    }

    const manager =
        getWindowManager();

    if (!manager) {
        return false;
    }


    try {

        if (
            typeof manager.closeWindow ===
            "function"
        ) {

            manager.closeWindow(
                runtime.id
            );

            return true;
        }


        if (
            typeof manager.close ===
            "function"
        ) {

            manager.close(
                runtime.id
            );

            return true;
        }

    } catch (error) {

        emit(
            "error",
            {
                type:
                    "WINDOW_CLOSE_ERROR",

                app:
                    app,

                runtime:
                    runtime,

                error:
                    error
            }
        );

        console.error(
            "[HalDo App Manager] Window close error:",
            error
        );
    }


    return false;
}


/* =========================================================
   SYSTEM VERBINDUNG
   ========================================================= */

function connectSystem() {

    const system =
        getSystem();

    if (!system) {
        return false;
    }


    try {

        /*
         * Bestehende System-API wird nur
         * verwendet, wenn sie vorhanden ist.
         */

        if (
            typeof system.registerService ===
            "function"
        ) {

            system.registerService(
                "app-manager",
                api
            );

            return true;
        }


        if (
            typeof system.registerModule ===
            "function"
        ) {

            system.registerModule(
                "app-manager",
                api
            );

            return true;
        }

    } catch (error) {

        console.warn(
            "[HalDo App Manager] System connection failed:",
            error
        );

    }


    return false;
}


/* =========================================================
   KERNEL VERBINDUNG
   ========================================================= */

function connectAppManagerToKernel() {

    const kernel =
        getKernel();

    if (!kernel) {
        return false;
    }


    try {

        if (
            typeof kernel.registerModule ===
            "function"
        ) {

            kernel.registerModule(
                "app-manager",
                api
            );
        }


        if (
            typeof kernel.setModuleReady ===
            "function"
        ) {

            kernel.setModuleReady(
                "app-manager",
                true
            );
        }


        return true;

    } catch (error) {

        console.warn(
            "[HalDo App Manager] Kernel connection failed:",
            error
        );

    }


    return false;
}


/* =========================================================
   ENDE TEIL 5
   ========================================================= */
/* =========================================================
   HALDO AI OS 18
   NEW APP MANAGER
   PART 6 / 7

   APP LIFECYCLE
   START
   OPEN
   ACTIVATE
   MINIMIZE
   RESTORE
   CLOSE
   ========================================================= */

/* =====================================================
   DEPENDENCY CHECK
   ===================================================== */

function checkDependencies(app) {

    if (!app) {
        return false;
    }

    if (
        !Array.isArray(app.dependencies) ||
        app.dependencies.length === 0
    ) {
        return true;
    }

    return app.dependencies.every(
        function (dependency) {

            const dependencyId =
                createId(dependency);

            const dependencyApp =
                getApp(dependencyId);

            return !!(
                dependencyApp &&
                dependencyApp.enabled !== false
            );

        }
    );
}

/* =====================================================
   MISSING DEPENDENCIES
   ===================================================== */

function getMissingDependencies(app) {

    if (!app) {
        return [];
    }

    if (
        !Array.isArray(app.dependencies)
    ) {
        return [];
    }

    return app.dependencies.filter(
        function (dependency) {

            const dependencyId =
                createId(dependency);

            const dependencyApp =
                getApp(dependencyId);

            return !(
                dependencyApp &&
                dependencyApp.enabled !== false
            );

        }
    );
}

/* =====================================================
   APP STATUS
   ===================================================== */

function setAppStatus(
    app,
    status
) {

    if (!app) {
        return;
    }

    app.status =
        status;

    app.updatedAt =
        Date.now();

}

/* =====================================================
   RUNTIME CONTEXT
   ===================================================== */

function createRuntimeContext(
    app,
    options
) {

    return {

        id:
            app.id,

        app:
            app,

        options:
            options || {},

        manager:
            api,

        os:
            HalDoOS,

        startedAt:
            Date.now(),

        services: {

            kernel:
                getKernel(),

            registry:
                window.HalDoAppRegistry ||
                HalDoOS.appRegistry ||
                null,

            router:
                getRouter(),

            launcher:
                getLauncher(),

            windowManager:
                getWindowManager(),

            system:
                getSystem()

        }

    };

}

/* =====================================================
   INITIALIZE APP
   ===================================================== */

async function initializeApp(
    app,
    options
) {

    if (!app) {

        return false;

    }

    if (
        typeof app.init !==
        "function"
    ) {

        return true;

    }

    try {

        setAppStatus(
            app,
            "initializing"
        );

        const runtime =
            createRuntimeContext(
                app,
                options
            );

        const result =
            await app.init(
                runtime
            );

        setAppStatus(
            app,
            "initialized"
        );

        emit(
            "initialized",
            {
                app,
                runtime,
                result
            }
        );

        return true;

    } catch (error) {

        setAppStatus(
            app,
            "error"
        );

        emit(
            "error",
            {
                type:
                    "APP_INIT_ERROR",

                app:
                    app,

                error:
                    error

            }
        );

        console.error(
            "[HalDo App Manager] App initialization failed:",
            app.id,
            error
        );

        return false;

    }

}

/* =====================================================
   START APP
   ===================================================== */

async function startApp(
    id,
    options
) {

    const app =
        getApp(id);

    if (!app) {

        emit(
            "error",
            {
                type:
                    "APP_NOT_FOUND",

                id:
                    id

            }
        );

        return null;

    }

    if (
        app.enabled === false
    ) {

        emit(
            "error",
            {
                type:
                    "APP_DISABLED",

                app:
                    app

            }
        );

        return null;

    }

    /*
     * Bereits laufende Singleton-App
     * nicht erneut erzeugen.
     */

    if (
        app.singleton &&
        runningApps.has(app.id)
    ) {

        const existingRuntime =
            runningApps.get(
                app.id
            );

        await activateApp(
            app.id,
            options
        );

        return existingRuntime;

    }

    /*
     * Abhängigkeiten prüfen.
     */

    if (
        !checkDependencies(app)
    ) {

        const missing =
            getMissingDependencies(
                app
            );

        setAppStatus(
            app,
            "dependency-error"
        );

        emit(
            "error",
            {
                type:
                    "MISSING_DEPENDENCY",

                app:
                    app,

                missing:
                    missing

            }
        );

        return null;

    }

    /*
     * App initialisieren.
     */

    const initializedSuccessfully =
        await initializeApp(
            app,
            options
        );

    if (
        !initializedSuccessfully
    ) {

        return null;

    }

    const runtime =
        createRuntimeContext(
            app,
            options
        );

    /*
     * Start-Lifecycle.
     */

    if (
        typeof app.start ===
        "function"
    ) {

        try {

            setAppStatus(
                app,
                "starting"
            );

            await app.start(
                runtime
            );

        } catch (error) {

            setAppStatus(
                app,
                "error"
            );

            emit(
                "error",
                {
                    type:
                        "APP_START_ERROR",

                    app:
                        app,

                    error:
                        error

                }
            );

            console.error(
                "[HalDo App Manager] App start failed:",
                app.id,
                error
            );

            return null;

        }

    }

    runningApps.set(
        app.id,
        runtime
    );

    minimizedApps.delete(
        app.id
    );

    setAppStatus(
        app,
        "running"
    );

    emit(
        "started",
        {
            app,
            runtime
        }
    );

    return runtime;

}

/* =====================================================
   OPEN APP
   ===================================================== */

async function openApp(
    id,
    options
) {

    const app =
        getApp(id);

    if (!app) {

        emit(
            "error",
            {
                type:
                    "APP_NOT_FOUND",

                id:
                    id

            }
        );

        return null;

    }

    /*
     * Wenn die App bereits läuft,
     * wird sie nur aktiviert.
     */

    if (
        runningApps.has(app.id)
    ) {

        if (
            minimizedApps.has(app.id)
        ) {

            return restoreApp(
                app.id,
                options
            );

        }

        return activateApp(
            app.id,
            options
        );

    }

    const runtime =
        await startApp(
            app.id,
            options
        );

    if (!runtime) {

        return null;

    }

    /*
     * Fenster-Manager verbinden.
     */

    const windowManager =
        getWindowManager();

    if (windowManager) {

        try {

            if (
                typeof windowManager.createWindow ===
                "function"
            ) {

                windowManager.createWindow(
                    runtime.id,
                    {
                        ...app,
                        ...(
                            options ||
                            {}
                        )
                    }
                );

            } else if (
                typeof windowManager.create ===
                "function"
            ) {

                windowManager.create(
                    runtime.id,
                    {
                        ...app,
                        ...(
                            options ||
                            {}
                        )
                    }
                );

            } else if (
                typeof windowManager.open ===
                "function"
            ) {

                windowManager.open(
                    runtime
                );

            }

        } catch (error) {

            console.warn(
                "[HalDo App Manager] Window Manager open failed:",
                error
            );

        }

    }

    /*
     * Optionales App-open Callback.
     */

    if (
        typeof app.open ===
        "function"
    ) {

        try {

            await app.open(
                runtime
            );

        } catch (error) {

            emit(
                "error",
                {
                    type:
                        "APP_OPEN_ERROR",

                    app:
                        app,

                    error:
                        error

                }
            );

        }

    }

    await activateApp(
        app.id,
        options
    );

    emit(
        "opened",
        {
            app,
            runtime
        }
    );

    return runtime;

}

/* =====================================================
   ACTIVATE APP
   ===================================================== */

async function activateApp(
    id,
    options
) {

    const app =
        getApp(id);

    if (!app) {

        return false;

    }

    const runtime =
        runningApps.get(
            app.id
        );

    if (!runtime) {

        return false;

    }

    const previousId =
        activeAppId;

    /*
     * Vorherige App deaktivieren.
     */

    if (
        previousId &&
        previousId !== app.id
    ) {

        const previousApp =
            getApp(
                previousId
            );

        const previousRuntime =
            runningApps.get(
                previousId
            );

        if (
            previousApp &&
            previousRuntime &&
            typeof previousApp.onDeactivate ===
            "function"
        ) {

            try {

                await previousApp.onDeactivate(
                    previousRuntime
                );

            } catch (error) {

                console.warn(
                    "[HalDo App Manager] Deactivation failed:",
                    error
                );

            }

        }

    }

    activeAppId =
        app.id;

    minimizedApps.delete(
        app.id
    );

    setAppStatus(
        app,
        "active"
    );

    /*
     * App-Aktivierung.
     */

    if (
        typeof app.onActivate ===
        "function"
    ) {

        try {

            await app.onActivate(
                runtime,
                options || {}
            );

        } catch (error) {

            console.warn(
                "[HalDo App Manager] Activation callback failed:",
                error
            );

        }

    }

    /*
     * Window Manager fokussieren.
     */

    const windowManager =
        getWindowManager();

    if (windowManager) {

        try {

            if (
                typeof windowManager.focusWindow ===
                "function"
            ) {

                windowManager.focusWindow(
                    runtime.id
                );

            } else if (
                typeof windowManager.focus ===
                "function"
            ) {

                windowManager.focus(
                    runtime.id
                );

            } else if (
                typeof windowManager.activate ===
                "function"
            ) {

                windowManager.activate(
                    runtime.id
                );

            }

        } catch (error) {

            console.warn(
                "[HalDo App Manager] Window focus failed:",
                error
            );

        }

    }

    emit(
        "activated",
        {
            app,
            runtime,
            previous:
                previousId
        }
    );

    return runtime;

}

/* =====================================================
   MINIMIZE APP
   ===================================================== */

async function minimizeApp(
    id
) {

    const app =
        getApp(id);

    if (!app) {

        return false;

    }

    const runtime =
        runningApps.get(
            app.id
        );

    if (!runtime) {

        return false;

    }

    if (
        minimizedApps.has(
            app.id
        )
    ) {

        return true;

    }

    if (
        typeof app.minimize ===
        "function"
    ) {

        try {

            await app.minimize(
                runtime
            );

        } catch (error) {

            console.warn(
                "[HalDo App Manager] App minimize callback failed:",
                error
            );

        }

    }

    const windowManager =
        getWindowManager();

    if (windowManager) {

        try {

            if (
                typeof windowManager.minimizeWindow ===
                "function"
            ) {

                windowManager.minimizeWindow(
                    runtime.id
                );

            } else if (
                typeof windowManager.minimize ===
                "function"
            ) {

                windowManager.minimize(
                    runtime.id
                );

            }

        } catch (error) {

            console.warn(
                "[HalDo App Manager] Window minimize failed:",
                error
            );

        }

    }

    minimizedApps.add(
        app.id
    );

    if (
        activeAppId ===
        app.id
    ) {

        activeAppId =
            null;

    }

    setAppStatus(
        app,
        "minimized"
    );

    emit(
        "minimized",
        {
            app,
            runtime
        }
    );

    return true;

}

/* =====================================================
   RESTORE APP
   ===================================================== */

async function restoreApp(
    id,
    options
) {

    const app =
        getApp(id);

    if (!app) {

        return false;

    }

    const runtime =
        runningApps.get(
            app.id
        );

    if (!runtime) {

        return openApp(
            app.id,
            options
        );

    }

    if (
        typeof app.restore ===
        "function"
    ) {

        try {

            await app.restore(
                runtime,
                options || {}
            );

        } catch (error) {

            console.warn(
                "[HalDo App Manager] App restore callback failed:",
                error
            );

        }

    }

    const windowManager =
        getWindowManager();

    if (windowManager) {

        try {

            if (
                typeof windowManager.restoreWindow ===
                "function"
            ) {

                windowManager.restoreWindow(
                    runtime.id
                );

            } else if (
                typeof windowManager.restore ===
                "function"
            ) {

                windowManager.restore(
                    runtime.id
                );

            }

        } catch (error) {

            console.warn(
                "[HalDo App Manager] Window restore failed:",
                error
            );

        }

    }

    minimizedApps.delete(
        app.id
    );

    setAppStatus(
        app,
        "running"
    );

    await activateApp(
        app.id,
        options
    );

    emit(
        "restored",
        {
            app,
            runtime
        }
    );

    return runtime;

}

/* =====================================================
   CLOSE APP
   ===================================================== */

async function closeApp(
    id,
    options
) {

    const app =
        getApp(id);

    if (!app) {

        return false;

    }

    const runtime =
        runningApps.get(
            app.id
        );

    if (!runtime) {

        return false;

    }

    /*
     * App Close Callback.
     */

    if (
        typeof app.close ===
        "function"
    ) {

        try {

            await app.close(
                runtime,
                options || {}
            );

        } catch (error) {

            console.warn(
                "[HalDo App Manager] App close callback failed:",
                error
            );

        }

    }

    /*
     * Alter Stop-Lifecycle.
     */

    if (
        typeof app.stop ===
        "function"
    ) {

        try {

            setAppStatus(
                app,
                "stopping"
            );

            await app.stop(
                runtime
            );

        } catch (error) {

            console.warn(
                "[HalDo App Manager] App stop failed:",
                error
            );

        }

    }

    /*
     * Window Manager schließen.
     */

    const windowManager =
        getWindowManager();

    if (windowManager) {

        try {

            if (
                typeof windowManager.closeWindow ===
                "function"
            ) {

                windowManager.closeWindow(
                    runtime.id
                );

            } else if (
                typeof windowManager.close ===
                "function"
            ) {

                windowManager.close(
                    runtime.id
                );

            }

        } catch (error) {

            console.warn(
                "[HalDo App Manager] Window close failed:",
                error
            );

        }

    }

    /*
     * Runtime entfernen.
     */

    runningApps.delete(
        app.id
    );

    minimizedApps.delete(
        app.id
    );

    if (
        activeAppId ===
        app.id
    ) {

        activeAppId =
            null;

    }

    setAppStatus(
        app,
        "registered"
    );

    emit(
        "closed",
        {
            app,
            runtime
        }
    );

    return true;

}

/* =====================================================
   DESTROY APP
   ===================================================== */

async function destroyApp(
    id
) {

    const app =
        getApp(id);

    if (!app) {

        return false;

    }

    const runtime =
        runningApps.get(
            app.id
        );

    if (runtime) {

        await closeApp(
            app.id
        );

    }

    if (
        typeof app.destroy ===
        "function"
    ) {

        try {

            await app.destroy(
                runtime || {
                    app,
                    manager:
                        api
                }
            );

        } catch (error) {

            console.warn(
                "[HalDo App Manager] App destroy failed:",
                error
            );

        }

    }

    apps.delete(
        app.id
    );

    runningApps.delete(
        app.id
    );

    minimizedApps.delete(
        app.id
    );

    if (
        activeAppId ===
        app.id
    ) {

        activeAppId =
            null;

    }

    emit(
        "destroyed",
        {
            app
        }
    );

    return true;

}

/* =====================================================
   STOP ALL APPS
   ===================================================== */

async function stopAllApps() {

    const ids =
        Array.from(
            runningApps.keys()
        );

    for (
        const id of ids
    ) {

        await closeApp(
            id
        );

    }

    activeAppId =
        null;

    return true;

}

/* =====================================================
   PART 6 ENDE
   ===================================================== */
/* =========================================================
   HALDO AI OS 18
   NEW APP MANAGER
   PART 7 / 7

   PUBLIC API
   INITIALIZATION
   KERNEL CONNECTION
   SYSTEM CONNECTION
   DIAGNOSTICS
   GLOBAL EXPORT
   FINAL STARTUP
   ========================================================= */


/* =====================================================
   ACTIVE APP
   ===================================================== */

function getActiveApp() {

    if (!activeAppId) {

        return null;

    }

    return (
        getApp(activeAppId) ||
        null
    );

}


/* =====================================================
   ACTIVE APP ID
   ===================================================== */

function getActiveAppId() {

    return activeAppId;

}


/* =====================================================
   SET ACTIVE APP
   ===================================================== */

function setActiveApp(
    id
) {

    const app =
        getApp(id);

    if (!app) {

        return false;

    }

    if (
        !runningApps.has(
            app.id
        )
    ) {

        return false;

    }

    activeAppId =
        app.id;

    emit(
        "active-changed",
        {
            app,
            appId:
                app.id
        }
    );

    return true;

}


/* =====================================================
   UNREGISTER APP
   ===================================================== */

function unregisterApp(
    id
) {

    const app =
        getApp(id);

    if (!app) {

        return false;

    }

    /*
     * Laufende App zuerst schließen.
     */

    if (
        runningApps.has(
            app.id
        )
    ) {

        /*
         * Async Lifecycle kann hier nicht
         * abgewartet werden.
         *
         * closeApp übernimmt deshalb
         * den kontrollierten Shutdown.
         */

        closeApp(
            app.id
        );

    }

    apps.delete(
        app.id
    );

    runningApps.delete(
        app.id
    );

    minimizedApps.delete(
        app.id
    );

    if (
        activeAppId ===
        app.id
    ) {

        activeAppId =
            null;

    }

    emit(
        "unregistered",
        {
            app
        }
    );

    return true;

}


/* =====================================================
   ENABLE APP
   ===================================================== */

function enableApp(
    id
) {

    const app =
        getApp(id);

    if (!app) {

        return false;

    }

    app.enabled =
        true;

    setAppStatus(
        app,
        "registered"
    );

    emit(
        "enabled",
        {
            app
        }
    );

    return true;

}


/* =====================================================
   DISABLE APP
   ===================================================== */

async function disableApp(
    id
) {

    const app =
        getApp(id);

    if (!app) {

        return false;

    }

    /*
     * Falls die App läuft,
     * zuerst kontrolliert schließen.
     */

    if (
        runningApps.has(
            app.id
        )
    ) {

        await closeApp(
            app.id
        );

    }

    app.enabled =
        false;

    setAppStatus(
        app,
        "disabled"
    );

    emit(
        "disabled",
        {
            app
        }
    );

    return true;

}


/* =====================================================
   APP COUNT
   ===================================================== */

function getAppCount() {

    return apps.size;

}


/* =====================================================
   RUNNING APP COUNT
   ===================================================== */

function getRunningAppCount() {

    return runningApps.size;

}


/* =====================================================
   MINIMIZED APP COUNT
   ===================================================== */

function getMinimizedAppCount() {

    return minimizedApps.size;

}


/* =====================================================
   REGISTRY SYNCHRONIZATION
   ===================================================== */

function syncAllRegistries() {

    let synced =
        0;

    apps.forEach(
        function (app) {

            const registry =
                window.HalDoAppRegistry ||
                HalDoOS.appRegistry ||
                null;

            if (!registry) {

                return;

            }

            try {

                if (
                    typeof registry.has ===
                    "function" &&
                    registry.has(
                        app.id
                    )
                ) {

                    if (
                        typeof registry.update ===
                        "function"
                    ) {

                        registry.update(
                            app.id,
                            app
                        );

                    }

                    synced += 1;

                    return;

                }

                if (
                    typeof registry.register ===
                    "function"
                ) {

                    registry.register(
                        app
                    );

                    synced += 1;

                }

            } catch (error) {

                console.warn(
                    "[HalDo App Manager] Registry sync failed:",
                    app.id,
                    error
                );

            }

        }
    );

    return synced;

}


/* =====================================================
   ROUTER SYNCHRONIZATION
   ===================================================== */

function syncAllRoutes() {

    const router =
        getRouter();

    if (!router) {

        return 0;

    }

    let synced =
        0;

    apps.forEach(
        function (app) {

            if (!app.route) {

                return;

            }

            try {

                if (
                    typeof router.has ===
                    "function" &&
                    router.has(
                        app.route
                    )
                ) {

                    synced += 1;

                    return;

                }

                if (
                    typeof router.register ===
                    "function"
                ) {

                    router.register(
                        app.route,
                        {
                            app:
                                app.id,

                            aliases:
                                [
                                    app.id,
                                    app.name,
                                    app.title
                                ]
                                .filter(
                                    Boolean
                                )
                        }
                    );

                    synced += 1;

                }

            } catch (error) {

                console.warn(
                    "[HalDo App Manager] Router sync failed:",
                    app.id,
                    error
                );

            }

        }
    );

    return synced;

}


/* =====================================================
   CONNECTION STATUS
   ===================================================== */

function getConnectionStatus() {

    return {

        kernel:
            !!getKernel(),

        registry:
            !!(
                window.HalDoAppRegistry ||
                HalDoOS.appRegistry
            ),

        router:
            !!getRouter(),

        launcher:
            !!getLauncher(),

        windowManager:
            !!getWindowManager(),

        system:
            !!getSystem()

    };

}


/* =====================================================
   DIAGNOSTICS
   ===================================================== */

function diagnostics() {

    const connection =
        getConnectionStatus();

    const appList =
        getApps();

    const runningList =
        getRunningApps();

    return {

        manager:
            MANAGER_NAME,

        version:
            VERSION,

        initialized:
            initialized,

        appCount:
            appList.length,

        enabledAppCount:
            appList.filter(
                function (app) {

                    return (
                        app.enabled !== false
                    );

                }
            ).length,

        runningAppCount:
            runningList.length,

        minimizedAppCount:
            minimizedApps.size,

        activeAppId:
            activeAppId,

        connections:
            connection,

        apps:
            appList.map(
                function (app) {

                    return {

                        id:
                            app.id,

                        name:
                            app.name,

                        status:
                            app.status,

                        enabled:
                            app.enabled,

                        running:
                            runningApps.has(
                                app.id
                            ),

                        minimized:
                            minimizedApps.has(
                                app.id
                            )

                    };

                }
            ),

        timestamp:
            new Date().toISOString()

    };

}


/* =====================================================
   HEALTH CHECK
   ===================================================== */

function healthCheck() {

    const connection =
        getConnectionStatus();

    const problems =
        [];

    if (!getKernel()) {

        problems.push(
            "Kernel nicht verbunden."

        );

    }

    if (
        !(
            window.HalDoAppRegistry ||
            HalDoOS.appRegistry
        )
    ) {

        problems.push(
            "App Registry nicht verbunden."
        );

    }

    if (!getRouter()) {

        problems.push(
            "App Router nicht verbunden."
        );

    }

    return {

        healthy:
            problems.length ===
            0,

        problems,

        connections:
            connection,

        initialized:
            initialized,

        timestamp:
            new Date().toISOString()

    };

}


/* =====================================================
   PUBLIC API
   ===================================================== */

const api = {

    /*
     * Meta
     */

    name:
        MANAGER_NAME,

    version:
        VERSION,

    module:
        "app-manager",


    /*
     * Events
     */

    on,

    off,

    emit,


    /*
     * Registration
     */

    register:
        registerApp,

    registerApp,

    registerApps,

    unregister:
        unregisterApp,

    unregisterApp,


    /*
     * App Access
     */

    get:
        getApp,

    getApp,

    getApps,

    getEnabledApps,

    has:
        hasApp,

    hasApp,


    /*
     * Runtime
     */

    getRunningApps,

    isRunning,

    isMinimized,

    getActiveApp,

    getActiveAppId,

    setActiveApp,


    /*
     * Lifecycle
     */

    initApp:
        initializeApp,

    initializeApp,

    start:
        startApp,

    startApp,

    open:
        openApp,

    openApp,

    activate:
        activateApp,

    activateApp,

    minimize:
        minimizeApp,

    minimizeApp,

    restore:
        restoreApp,

    restoreApp,

    close:
        closeApp,

    closeApp,

    destroy:
        destroyApp,

    destroyApp,

    stopAll:
        stopAllApps,

    stopAllApps,


    /*
     * Enable / Disable
     */

    enable:
        enableApp,

    enableApp,

    disable:
        disableApp,

    disableApp,


    /*
     * Dependencies
     */

    checkDependencies,

    getMissingDependencies,


    /*
     * Synchronization
     */

    syncAllRegistries,

    syncAllRoutes,


    /*
     * Statistics
     */

    getAppCount,

    getRunningAppCount,

    getMinimizedAppCount,


    /*
     * Connections
     */

    getConnectionStatus,


    /*
     * Diagnostics
     */

    diagnostics,

    healthCheck

};


/* =====================================================
   GLOBAL API EXPORT
   ===================================================== */

window.HalDoAppManager =
    api;

HalDoOS.appManager =
    api;


/* =====================================================
   KERNEL REGISTRATION
   ===================================================== */

function connectToKernel() {

    const kernel =
        getKernel();

    if (!kernel) {

        return false;

    }

    try {

        /*
         * Moderne Kernel API
         */

        if (
            typeof kernel.registerModule ===
            "function"
        ) {

            kernel.registerModule(
                "app-manager",
                api
            );

        }

        /*
         * Ready Status
         */

        if (
            typeof kernel.setModuleReady ===
            "function"
        ) {

            kernel.setModuleReady(
                "app-manager",
                true
            );

        }

        emit(
            "kernel-connected",
            {
                kernel
            }
        );

        return true;

    } catch (error) {

        console.warn(
            "[HalDo App Manager] Kernel connection failed:",
            error
        );

        return false;

    }

}


/* =====================================================
   SYSTEM CONNECTION
   ===================================================== */

function connectToSystem() {

    const system =
        getSystem();

    if (!system) {

        return false;

    }

    try {

        /*
         * Unterstützt verschiedene
         * vorhandene System-APIs.
         */

        if (
            typeof system.registerService ===
            "function"
        ) {

            system.registerService(
                "app-manager",
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

    } catch (error) {

        console.warn(
            "[HalDo App Manager] System connection failed:",
            error
        );

        return false;

    }

}


/* =====================================================
   INITIALIZATION
   ===================================================== */

async function initializeManager() {

    if (initialized) {

        return api;

    }

    /*
     * Grundstatus.
     */

    initialized =
        true;

    emit(
        "initializing",
        {
            version:
                VERSION
        }
    );


    /*
     * Kernel verbinden.
     */

    connectToKernel();


    /*
     * Registry synchronisieren.
     */

    syncAllRegistries();


    /*
     * Router synchronisieren.
     */

    syncAllRoutes();


    /*
     * System verbinden.
     */

    connectToSystem();


    /*
     * Finaler Status.
     */

    emit(
        "ready",
        {
            version:
                VERSION,

            diagnostics:
                diagnostics()

        }
    );


    return api;

}


/* =====================================================
   DOM READY
   ===================================================== */

function handleDOMReady() {

    initializeManager()
        .catch(
            function (error) {

                console.error(
                    "[HalDo App Manager] Initialization error:",
                    error
                );

                emit(
                    "error",
                    {
                        type:
                            "MANAGER_INIT_ERROR",

                        error:
                            error

                    }
                );

            }
        );

}


/* =====================================================
   KERNEL READY LISTENER
   ===================================================== */

function handleKernelReady() {

    connectToKernel();

    connectToSystem();

    syncAllRegistries();

    syncAllRoutes();

}


/* =====================================================
   HALDO EVENT CONNECTION
   ===================================================== */

function connectGlobalEvents() {

    const kernel =
        getKernel();

    if (
        !kernel
    ) {

        return;

    }

    /*
     * Kernel Event-Bus.
     */

    if (
        typeof kernel.on ===
        "function"
    ) {

        try {

            kernel.on(
                "kernel:ready",
                handleKernelReady
            );

        } catch (_) {}

    }

}


/* =====================================================
   STARTUP
   ===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        handleDOMReady,
        {
            once:
                true
        }
    );

} else {

    handleDOMReady();

}


/* =====================================================
   GLOBAL EVENT CONNECTION
   ===================================================== */

connectGlobalEvents();


/* =====================================================
   FINAL GLOBAL EXPOSURE
   ===================================================== */

window.HalDoOS =
    window.HalDoOS ||
    {};

window.HalDoOS.appManager =
    api;


/* =========================================================
   HALDO AI OS 18
   NEW APP MANAGER
   VERSION 18.0.0
   PROFESSIONAL ULTIMATE FOUNDATION

   TEIL 7/7 — ENDE

   Dieser Abschluss ist der EINZIGE Abschluss
   der neuen-app-manager.js.
   ========================================================= */

})(window, document);