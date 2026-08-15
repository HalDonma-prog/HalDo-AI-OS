/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
       js/app-registry.js

   APP REGISTRY
   Version:
       18.0.0

   Aufgabe:
   Zentrale und sichere Registrierung aller HalDo-AI-OS-Apps.

   Verbindungen:
       kernel.js
       system.js
       app-manager.js
       app-router.js
       launcher.js
       window-manager.js
       zukünftige App-Systeme

   Grundprinzip:
       REGISTRY ≠ APP MANAGER

   Die Registry verwaltet App-Definitionen.
   Der App Manager verwaltet App-Laufzeitinstanzen.

   Bestehende APIs werden erhalten und erweitert.
   ============================================================ */

(function (window, document) {

    "use strict";


    /* ========================================================
       01 — HALDO OS FOUNDATION
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS ||
        {};


    const HalDoOS =
        window.HalDoOS;


    /* ========================================================
       02 — META
       ======================================================== */

    const VERSION =
        "18.0.0";

    const NAME =
        "HalDo AI OS App Registry";

    const MODULE_ID =
        "app-registry";


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

        initializedAt:
            null,

        readyAt:
            null,

        apps:
            new Map(),

        listeners:
            new Map(),

        connections: {

            kernel:
                false,

            system:
                false,

            manager:
                false,

            router:
                false,

            launcher:
                false

        },

        statistics: {

            registered:
                0,

            updated:
                0,

            removed:
                0,

            enabled:
                0,

            disabled:
                0,

            imported:
                0,

            exported:
                0,

            errors:
                0

        }

    };


    /* ========================================================
       04 — LOGGING
       ======================================================== */

    function log() {

        try {

            console.log(
                "[HalDo App Registry]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo App Registry]",
                ...arguments
            );

        } catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo App Registry]",
                ...arguments
            );

        } catch (_) {}

    }


    /* ========================================================
       05 — ID NORMALIZATION
       ======================================================== */

    function normalizeId(value) {

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


    function createId(value) {

        return normalizeId(
            value
        );

    }


    /* ========================================================
       06 — SAFE HELPERS
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


    function safeClone(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }


        if (
            typeof value ===
            "function"
        ) {

            return value;

        }


        if (
            Array.isArray(value)
        ) {

            return value.map(
                safeClone
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
                function (key) {

                    result[key] =
                        safeClone(
                            value[key]
                        );

                }
            );

            return result;

        }


        return value;

    }


    function toArray(value) {

        if (
            Array.isArray(value)
        ) {

            return [
                ...value
            ];

        }


        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return [];

        }


        return [
            value
        ];

    }


    /* ========================================================
       07 — SERVICE LOOKUPS
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


    function getManager() {

        return (
            window.HalDoAppManager ||
            HalDoOS.appManager ||
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


    function getLauncher() {

        return (
            window.HalDoLauncher ||
            HalDoOS.launcher ||
            null
        );

    }


    /* ========================================================
       08 — EVENT SYSTEM
       ======================================================== */

    function on(
        event,
        callback
    ) {

        if (
            !event ||
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

            return false;

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


        return true;

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
                function (callback) {

                    try {

                        callback(
                            data
                        );

                    } catch (exception) {

                        errorLog(
                            "Registry Event Listener Error:",
                            exception
                        );

                    }

                }
            );

        }


        /*
         * Verbindung mit dem zentralen
         * Kernel Event Bus.
         */

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
                    "app-registry:" + event,
                    data
                );

            } catch (exception) {

                errorLog(
                    "Kernel Event Error:",
                    exception
                );

            }

        }


        /*
         * Zusätzlich optionales globales
         * HalDoOS.events-System.
         */

        const globalEvents =
            HalDoOS.events;


        if (
            globalEvents &&
            typeof globalEvents !==
            "object"
        ) {

            return;

        }


        if (
            globalEvents &&
            hasMethod(
                globalEvents,
                "emit"
            )
        ) {

            try {

                globalEvents.emit(
                    "app-registry:" + event,
                    data
                );

            } catch (_) {}

        }

    }


    /* ========================================================
       09 — ERROR SYSTEM
       ======================================================== */

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
                "UNKNOWN_ERROR",

            error:
                exception instanceof Error
                    ? exception
                    : exception || null,

            extra:
                extra,

            timestamp:
                new Date().toISOString()

        };


        errorLog(
            "[App Registry]",
            payload
        );


        emit(
            "error",
            payload
        );


        const kernel =
            getKernel();


        /*
         * Fehler an den Kernel weiterreichen,
         * ohne eine Endlosschleife zu erzeugen.
         */

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
                        code ||
                        "App Registry Error"
                    ),
                    "App Registry: " +
                    (
                        code ||
                        "UNKNOWN_ERROR"
                    )
                );

            } catch (_) {}

        }


        return payload;

    }


    /* ========================================================
       10 — APP NORMALIZATION
       ======================================================== */

    function normalizeApp(
        config
    ) {

        if (
            !config ||
            typeof config !==
            "object"
        ) {

            return null;

        }


        const requestedId =
            config.id ||
            config.appId ||
            config.appID ||
            config.name ||
            config.title;


        const id =
            createId(
                requestedId
            );


        if (!id) {

            return null;

        }


        const existing =
            state.apps.get(
                id
            );


        const app = {

            id:
                id,

            appId:
                id,

            name:
                config.name !== undefined
                    ? String(config.name)
                    : (
                        existing?.name ||
                        id
                    ),

            title:
                config.title !== undefined
                    ? String(config.title)
                    : (
                        existing?.title ||
                        config.name ||
                        id
                    ),

            description:
                config.description !== undefined
                    ? String(
                        config.description
                    )
                    : (
                        existing?.description ||
                        ""
                    ),

            category:
                config.category ||
                existing?.category ||
                "system",

            icon:
                config.icon !== undefined
                    ? config.icon
                    : (
                        existing?.icon ||
                        "◈"
                    ),

            version:
                config.version ||
                existing?.version ||
                VERSION,

            status:
                config.status ||
                existing?.status ||
                "registered",

            enabled:
                config.enabled !== undefined
                    ? config.enabled !== false
                    : (
                        existing
                            ? existing.enabled !== false
                            : true
                    ),

            system:
                config.system === true ||
                existing?.system === true,

            singleton:
                config.singleton !== undefined
                    ? config.singleton !== false
                    : (
                        existing
                            ? existing.singleton !== false
                            : true
                    ),

            route:
                config.route !== undefined
                    ? config.route
                    : (
                        existing?.route ||
                        null
                    ),

            entry:
                config.entry !== undefined
                    ? config.entry
                    : (
                        existing?.entry ||
                        null
                    ),

            url:
                config.url !== undefined
                    ? config.url
                    : (
                        existing?.url ||
                        null
                    ),

            component:
                config.component !== undefined
                    ? config.component
                    : (
                        existing?.component ||
                        null
                    ),

            permissions:
                config.permissions !== undefined
                    ? toArray(
                        config.permissions
                    )
                    : (
                        existing
                            ? toArray(
                                existing.permissions
                            )
                            : []
                    ),

            dependencies:
                config.dependencies !== undefined
                    ? toArray(
                        config.dependencies
                    )
                    : (
                        existing
                            ? toArray(
                                existing.dependencies
                            )
                            : []
                    ),

            optionalDependencies:
                config.optionalDependencies !== undefined
                    ? toArray(
                        config.optionalDependencies
                    )
                    : (
                        existing
                            ? toArray(
                                existing.optionalDependencies
                            )
                            : []
                    ),

            tags:
                config.tags !== undefined
                    ? toArray(
                        config.tags
                    )
                    : (
                        existing
                            ? toArray(
                                existing.tags
                            )
                            : []
                    ),

            keywords:
                config.keywords !== undefined
                    ? toArray(
                        config.keywords
                    )
                    : (
                        existing
                            ? toArray(
                                existing.keywords
                            )
                            : []
                    ),

            metadata:
                (
                    config.metadata &&
                    typeof config.metadata ===
                    "object"
                )
                    ? {
                        ...(existing?.metadata || {}),
                        ...config.metadata
                    }
                    : {
                        ...(existing?.metadata || {})
                    },

            api:
                (
                    config.api &&
                    typeof config.api ===
                    "object"
                )
                    ? {
                        ...(existing?.api || {}),
                        ...config.api
                    }
                    : {
                        ...(existing?.api || {})
                    },

            permissionsPolicy:
                (
                    config.permissionsPolicy &&
                    typeof config.permissionsPolicy ===
                    "object"
                )
                    ? {
                        ...(existing?.permissionsPolicy || {}),
                        ...config.permissionsPolicy
                    }
                    : {
                        ...(existing?.permissionsPolicy || {})
                    },


            /*
             * Lifecycle APIs
             */

            init:
                typeof config.init ===
                "function"
                    ? config.init
                    : (
                        existing?.init ||
                        null
                    ),

            start:
                typeof config.start ===
                "function"
                    ? config.start
                    : (
                        existing?.start ||
                        null
                    ),

            open:
                typeof config.open ===
                "function"
                    ? config.open
                    : (
                        existing?.open ||
                        null
                    ),

            stop:
                typeof config.stop ===
                "function"
                    ? config.stop
                    : (
                        existing?.stop ||
                        null
                    ),

            close:
                typeof config.close ===
                "function"
                    ? config.close
                    : (
                        existing?.close ||
                        null
                    ),

            minimize:
                typeof config.minimize ===
                "function"
                    ? config.minimize
                    : (
                        existing?.minimize ||
                        null
                    ),

            restore:
                typeof config.restore ===
                "function"
                    ? config.restore
                    : (
                        existing?.restore ||
                        null
                    ),

            destroy:
                typeof config.destroy ===
                "function"
                    ? config.destroy
                    : (
                        existing?.destroy ||
                        null
                    ),

            onActivate:
                typeof config.onActivate ===
                "function"
                    ? config.onActivate
                    : (
                        existing?.onActivate ||
                        null
                    ),

            onDeactivate:
                typeof config.onDeactivate ===
                "function"
                    ? config.onDeactivate
                    : (
                        existing?.onDeactivate ||
                        null
                    ),


            /*
             * Erweiterbare Runtime-Informationen
             */

            state:
                config.state !== undefined
                    ? config.state
                    : (
                        existing?.state ||
                        "idle"
                    ),

            createdAt:
                existing?.createdAt ||
                config.createdAt ||
                Date.now(),

            updatedAt:
                Date.now(),

            registry:
                MODULE_ID

        };


        return app;

    }


    /* ========================================================
       11 — REGISTER
       ======================================================== */

    function register(
        config,
        options = {}
    ) {

        const app =
            normalizeApp(
                config
            );


        if (!app) {

            reportError(
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
            state.apps.get(
                app.id
            );


        state.apps.set(
            app.id,
            app
        );


        if (existing) {

            state.statistics.updated +=
                1;


            emit(
                "updated",
                {
                    app,
                    previous:
                        existing,
                    options
                }
            );


            notifyManager(
                app,
                "updated"
            );

        } else {

            state.statistics.registered +=
                1;


            emit(
                "registered",
                {
                    app,
                    options
                }
            );


            notifyManager(
                app,
                "registered"
            );

        }


        return app;

    }


    function registerApp(
        config,
        options
    ) {

        return register(
            config,
            options
        );

    }


    function registerApps(
        list,
        options
    ) {

        if (
            !Array.isArray(list)
        ) {

            return [];

        }


        const result = [];


        list.forEach(
            function (config) {

                const app =
                    register(
                        config,
                        options
                    );


                if (app) {

                    result.push(
                        app
                    );

                }

            }
        );


        return result;

    }


    /* ========================================================
       12 — GET
       ======================================================== */

    function get(
        id
    ) {

        const normalized =
            createId(
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


    function getAll() {

        return Array.from(
            state.apps.values()
        );

    }


    function getApps() {

        return getAll();

    }


    function list() {

        return getAll();

    }


    function has(
        id
    ) {

        const normalized =
            createId(
                id
            );


        return !!(
            normalized &&
            state.apps.has(
                normalized
            )
        );

    }


    function hasApp(
        id
    ) {

        return has(
            id
        );

    }


    /* ========================================================
       13 — FIND / SEARCH
       ======================================================== */

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


        return getAll().filter(
            function (app) {

                const fields = [

                    app.id,

                    app.appId,

                    app.name,

                    app.title,

                    app.description,

                    app.category,

                    app.route,

                    ...(app.tags || []),

                    ...(app.keywords || [])

                ];


                return fields.some(
                    function (field) {

                        return String(
                            field || ""
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


    function search(
        query
    ) {

        return find(
            query
        );

    }


    /* ========================================================
       14 — CATEGORY
       ======================================================== */

    function getByCategory(
        category
    ) {

        const value =
            String(
                category || ""
            )
            .trim()
            .toLowerCase();


        if (!value) {

            return [];

        }


        return getAll().filter(
            function (app) {

                return (
                    String(
                        app.category ||
                        ""
                    )
                    .toLowerCase() ===
                    value
                );

            }
        );

    }


    function getCategories() {

        const categories =
            new Set();


        getAll().forEach(
            function (app) {

                if (
                    app.category
                ) {

                    categories.add(
                        app.category
                    );

                }

            }
        );


        return Array.from(
            categories
        );

    }


    /* ========================================================
       15 — TAGS
       ======================================================== */

    function getByTag(
        tag
    ) {

        const value =
            String(
                tag || ""
            )
            .trim()
            .toLowerCase();


        if (!value) {

            return [];

        }


        return getAll().filter(
            function (app) {

                return (
                    app.tags || []
                ).some(
                    function (item) {

                        return String(
                            item
                        )
                        .trim()
                        .toLowerCase() ===
                        value;

                    }
                );

            }
        );

    }


    /* ========================================================
       16 — UPDATE
       ======================================================== */

    function update(
        id,
        changes
    ) {

        const app =
            get(
                id
            );


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


        const previous =
            safeClone(
                app
            );


        const normalized =
            normalizeApp(
                {
                    ...app,
                    ...changes,
                    id:
                        app.id,
                    appId:
                        app.id
                }
            );


        if (!normalized) {

            return null;

        }


        state.apps.set(
            app.id,
            normalized
        );


        state.statistics.updated +=
            1;


        emit(
            "updated",
            {
                app:
                    normalized,

                previous
            }
        );


        notifyManager(
            normalized,
            "updated"
        );


        return normalized;

    }


    function updateApp(
        id,
        changes
    ) {

        return update(
            id,
            changes
        );

    }


    /* ========================================================
       17 — REMOVE
       ======================================================== */

    function remove(
        id,
        options = {}
    ) {

        const normalized =
            createId(
                id
            );


        if (!normalized) {

            return false;

        }


        const app =
            state.apps.get(
                normalized
            );


        if (!app) {

            return false;

        }


        /*
         * System-Apps werden nicht versehentlich
         * gelöscht, außer force=true gesetzt wurde.
         */

        if (
            app.system === true &&
            options.force !== true
        ) {

            reportError(
                "SYSTEM_APP_REMOVE_BLOCKED",
                new Error(
                    "System-App darf ohne force=true nicht entfernt werden."
                ),
                {
                    appId:
                        app.id
                }
            );


            return false;

        }


        state.apps.delete(
            normalized
        );


        state.statistics.removed +=
            1;


        emit(
            "removed",
            {
                app,
                options
            }
        );


        notifyManager(
            app,
            "removed"
        );


        return true;

    }


    function unregister(
        id,
        options
    ) {

        return remove(
            id,
            options
        );

    }


    function unregisterApp(
        id,
        options
    ) {

        return remove(
            id,
            options
        );

    }


    /* ========================================================
       18 — ENABLE
       ======================================================== */

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


        if (
            app.enabled ===
            true
        ) {

            return true;

        }


        const missing =
            getMissingDependencies(
                app.id
            );


        /*
         * Fehlende Dependencies verhindern
         * das Aktivieren nicht automatisch.
         * Sie werden aber im Event gemeldet.
         */

        app.enabled =
            true;

        app.status =
            "registered";

        app.updatedAt =
            Date.now();


        state.statistics.enabled +=
            1;


        emit(
            "enabled",
            {
                app,
                missingDependencies:
                    missing
            }
        );


        notifyManager(
            app,
            "enabled"
        );


        return true;

    }


    function enableApp(
        id
    ) {

        return enable(
            id
        );

    }


    /* ========================================================
       19 — DISABLE
       ======================================================== */

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


        if (
            app.system === true
        ) {

            reportError(
                "SYSTEM_APP_DISABLE_BLOCKED",
                new Error(
                    "System-App darf nicht deaktiviert werden."
                ),
                {
                    appId:
                        app.id
                }
            );


            return false;

        }


        if (
            app.enabled ===
            false
        ) {

            return true;

        }


        app.enabled =
            false;

        app.status =
            "disabled";

        app.updatedAt =
            Date.now();


        state.statistics.disabled +=
            1;


        emit(
            "disabled",
            {
                app
            }
        );


        notifyManager(
            app,
            "disabled"
        );


        return true;

    }


    function disableApp(
        id
    ) {

        return disable(
            id
        );

    }


    /* ========================================================
       20 — ENABLED / DISABLED
       ======================================================== */

    function getEnabledApps() {

        return getAll().filter(
            function (app) {

                return (
                    app.enabled !==
                    false
                );

            }
        );

    }


    function getDisabledApps() {

        return getAll().filter(
            function (app) {

                return (
                    app.enabled ===
                    false
                );

            }
        );

    }


    /* ========================================================
       21 — SYSTEM APPS
       ======================================================== */

    function getSystemApps() {

        return getAll().filter(
            function (app) {

                return (
                    app.system ===
                    true
                );

            }
        );

    }


    /* ========================================================
       22 — DEPENDENCIES
       ======================================================== */

    function getDependencies(
        id
    ) {

        const app =
            get(
                id
            );


        if (!app) {

            return [];

        }


        return [
            ...(app.dependencies || [])
        ];

    }


    function getMissingDependencies(
        id
    ) {

        const app =
            get(
                id
            );


        if (!app) {

            return [];

        }


        return (
            app.dependencies || []
        ).filter(
            function (dependency) {

                const dependencyId =
                    createId(
                        dependency
                    );


                if (!dependencyId) {

                    return true;

                }


                const dependencyApp =
                    get(
                        dependencyId
                    );


                return !(
                    dependencyApp &&
                    dependencyApp.enabled !==
                    false
                );

            }
        );

    }


    function checkDependencies(
        id
    ) {

        return (
            getMissingDependencies(
                id
            ).length ===
            0
        );

    }


    function getDependents(
        id
    ) {

        const normalized =
            createId(
                id
            );


        if (!normalized) {

            return [];

        }


        return getAll().filter(
            function (app) {

                return (
                    app.dependencies || []
                ).some(
                    function (dependency) {

                        return (
                            createId(
                                dependency
                            ) ===
                            normalized
                        );

                    }
                );

            }
        );

    }


    /* ========================================================
       23 — EXPORT
       ======================================================== */

    function exportApps(
        options = {}
    ) {

        const apps =
            getAll();


        const data = {

            format:
                "haldo-app-registry",

            version:
                VERSION,

            exportedAt:
                new Date().toISOString(),

            count:
                apps.length,

            apps:
                options.clone === false
                    ? apps
                    : safeClone(
                        apps
                    )

        };


        state.statistics.exported +=
            1;


        emit(
            "exported",
            {
                data
            }
        );


        return data;

    }


    function exportRegistry(
        options
    ) {

        return exportApps(
            options
        );

    }


    /* ========================================================
       24 — IMPORT
       ======================================================== */

    function importApps(
        source,
        options = {}
    ) {

        let definitions =
            source;


        if (
            typeof source ===
            "string"
        ) {

            try {

                definitions =
                    JSON.parse(
                        source
                    );

            } catch (exception) {

                reportError(
                    "IMPORT_JSON_ERROR",
                    exception
                );


                return 0;

            }

        }


        if (
            definitions &&
            !Array.isArray(
                definitions
            ) &&
            Array.isArray(
                definitions.apps
            )
        ) {

            definitions =
                definitions.apps;

        }


        if (
            !Array.isArray(
                definitions
            )
        ) {

            reportError(
                "INVALID_IMPORT",
                new Error(
                    "Import-Daten enthalten keine App-Liste."
                )
            );


            return 0;

        }


        let imported =
            0;


        definitions.forEach(
            function (definition) {

                if (
                    !definition ||
                    typeof definition !==
                    "object"
                ) {

                    return;

                }


                const id =
                    createId(
                        definition.id ||
                        definition.appId ||
                        definition.name
                    );


                if (!id) {

                    return;

                }


                const existed =
                    state.apps.has(
                        id
                    );


                const app =
                    register(
                        definition,
                        options
                    );


                if (
                    app &&
                    !existed
                ) {

                    imported +=
                        1;

                }

            }
        );


        state.statistics.imported +=
            imported;


        emit(
            "imported",
            {
                count:
                    imported
            }
        );


        return imported;

    }


    function importRegistry(
        source,
        options
    ) {

        return importApps(
            source,
            options
        );

    }


    /* ========================================================
       25 — CLEAR
       ======================================================== */

    function clear(
        options = {}
    ) {

        const apps =
            getAll();


        if (
            options.keepSystem ===
            true
        ) {

            apps.forEach(
                function (app) {

                    if (
                        app.system !==
                        true
                    ) {

                        state.apps.delete(
                            app.id
                        );

                    }

                }
            );

        } else {

            state.apps.clear();

        }


        emit(
            "cleared",
            {
                count:
                    apps.length,

                remaining:
                    getCount(),

                apps,

                options
            }
        );


        return (
            apps.length -
            getCount()
        );

    }


    /* ========================================================
       26 — MANAGER NOTIFICATION
       ======================================================== */

    function notifyManager(
        app,
        action
    ) {

        const manager =
            getManager();


        if (
            !manager ||
            !app
        ) {

            state.connections.manager =
                false;


            return false;

        }


        state.connections.manager =
            true;


        try {

            /*
             * Nur Event-Benachrichtigung.
             *
             * Die Registry registriert die App
             * NICHT erneut im Manager.
             *
             * Dadurch wird eine Endlosschleife
             * zwischen Registry und Manager verhindert.
             */

            if (
                hasMethod(
                    manager,
                    "emit"
                )
            ) {

                manager.emit(
                    "registry-" +
                    action,
                    {
                        app
                    }
                );

            }


            return true;

        } catch (exception) {

            reportError(
                "MANAGER_NOTIFICATION_ERROR",
                exception,
                {
                    appId:
                        app.id,

                    action
                }
            );


            return false;

        }

    }


    /* ========================================================
       27 — CONNECTIONS
       ======================================================== */

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


            emit(
                "kernel-connected",
                {
                    kernel
                }
            );


            return true;

        } catch (exception) {

            state.connections.kernel =
                false;


            reportError(
                "KERNEL_CONNECTION_ERROR",
                exception
            );


            return false;

        }

    }


    function connectToSystem() {

        const system =
            getSystem();


        if (!system) {

            state.connections.system =
                false;


            return false;

        }


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


            state.connections.system =
                true;


            emit(
                "system-connected",
                {
                    system
                }
            );


            return true;

        } catch (exception) {

            state.connections.system =
                false;


            reportError(
                "SYSTEM_CONNECTION_ERROR",
                exception
            );


            return false;

        }

    }


    function refreshConnections() {

        connectToKernel();

        connectToSystem();


        state.connections.manager =
            !!getManager();

        state.connections.router =
            !!getRouter();

        state.connections.launcher =
            !!getLauncher();


        return getConnectionStatus();

    }


    function getConnectionStatus() {

        return {

            kernel:
                !!getKernel() &&
                state.connections.kernel,

            system:
                !!getSystem() &&
                state.connections.system,

            manager:
                !!getManager() &&
                state.connections.manager,

            router:
                !!getRouter() &&
                state.connections.router,

            launcher:
                !!getLauncher() &&
                state.connections.launcher

        };

    }


    /* ========================================================
       28 — COUNTERS
       ======================================================== */

    function getCount() {

        return state.apps.size;

    }


    function getAppCount() {

        return getCount();

    }


    function getStatistics() {

        return {
            ...state.statistics
        };

    }


    /* ========================================================
       29 — STATE
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            initializing:
                state.initializing,

            ready:
                state.ready,

            failed:
                state.failed,

            initializedAt:
                state.initializedAt,

            readyAt:
                state.readyAt,

            appCount:
                state.apps.size,

            connections:
                getConnectionStatus()

        };

    }


    /* ========================================================
       30 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        const apps =
            getAll();


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

            count:
                apps.length,

            enabledCount:
                getEnabledApps().length,

            disabledCount:
                getDisabledApps().length,

            systemAppCount:
                getSystemApps().length,

            categories:
                getCategories(),

            connections:
                getConnectionStatus(),

            statistics:
                getStatistics(),

            apps:
                apps.map(
                    function (app) {

                        return {

                            id:
                                app.id,

                            name:
                                app.name,

                            title:
                                app.title,

                            category:
                                app.category,

                            version:
                                app.version,

                            status:
                                app.status,

                            enabled:
                                app.enabled,

                            system:
                                app.system,

                            singleton:
                                app.singleton,

                            route:
                                app.route,

                            dependencies:
                                [
                                    ...(app.dependencies || [])
                                ],

                            missingDependencies:
                                getMissingDependencies(
                                    app.id
                                ),

                            dependents:
                                getDependents(
                                    app.id
                                ).map(
                                    item =>
                                        item.id
                                )

                        };

                    }
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       31 — HEALTH CHECK
       ======================================================== */

    function healthCheck() {

        const connections =
            getConnectionStatus();


        const problems =
            [];


        if (
            !state.initialized
        ) {

            problems.push(
                "Registry wurde noch nicht initialisiert."
            );

        }


        if (
            !state.ready
        ) {

            problems.push(
                "Registry ist noch nicht bereit."
            );

        }


        if (
            !connections.kernel
        ) {

            problems.push(
                "Kernel nicht verbunden."
            );

        }


        if (
            !connections.system
        ) {

            problems.push(
                "System nicht verbunden."
            );

        }


        const dependencyProblems =
            getAll().filter(
                app =>
                    !checkDependencies(
                        app.id
                    )
            );


        if (
            dependencyProblems.length
        ) {

            problems.push(
                dependencyProblems.length +
                " App(s) haben fehlende Dependencies."
            );

        }


        return {

            healthy:
                problems.length ===
                0,

            problems,

            connections,

            initialized:
                state.initialized,

            ready:
                state.ready,

            appCount:
                getCount(),

            dependencyProblems:
                dependencyProblems.map(
                    app => ({
                        id:
                            app.id,

                        missing:
                            getMissingDependencies(
                                app.id
                            )

                    })
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       32 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


        /* State */

        getState:
            getState,


        /* Events */

        on:
            on,

        off:
            off,

        emit:
            emit,


        /* Registration */

        register:
            register,

        registerApp:
            registerApp,

        registerApps:
            registerApps,

        unregister:
            unregister,

        unregisterApp:
            unregisterApp,

        remove:
            remove,


        /* Access */

        get:
            get,

        getApp:
            getApp,

        getAll:
            getAll,

        getApps:
            getApps,

        list:
            list,

        has:
            has,

        hasApp:
            hasApp,


        /* Search */

        find:
            find,

        search:
            search,

        getByCategory:
            getByCategory,

        getCategories:
            getCategories,

        getByTag:
            getByTag,


        /* Status */

        getEnabledApps:
            getEnabledApps,

        getDisabledApps:
            getDisabledApps,

        getSystemApps:
            getSystemApps,

        enable:
            enable,

        enableApp:
            enableApp,

        disable:
            disable,

        disableApp:
            disableApp,


        /* Update */

        update:
            update,

        updateApp:
            updateApp,


        /* Dependencies */

        getDependencies:
            getDependencies,

        getMissingDependencies:
            getMissingDependencies,

        checkDependencies:
            checkDependencies,

        getDependents:
            getDependents,


        /* Import / Export */

        export:
            exportApps,

        exportApps:
            exportApps,

        exportRegistry:
            exportRegistry,

        import:
            importApps,

        importApps:
            importApps,

        importRegistry:
            importRegistry,

        clear:
            clear,


        /* Connections */

        connectToKernel:
            connectToKernel,

        connectToSystem:
            connectToSystem,

        refreshConnections:
            refreshConnections,

        getConnectionStatus:
            getConnectionStatus,


        /* Statistics */

        getCount:
            getCount,

        getAppCount:
            getAppCount,

        getStatistics:
            getStatistics,


        /* Diagnostics */

        diagnostics:
            diagnostics,

        healthCheck:
            healthCheck

    };


    /* ========================================================
       33 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppRegistry =
        api;

    window.HalDoOSAppRegistry =
        api;

    HalDoOS.appRegistry =
        api;


    /* ========================================================
       34 — KERNEL READY HANDLER
       ======================================================== */

    function handleKernelReady(
        data
    ) {

        refreshConnections();


        emit(
            "kernel-ready",
            {
                data,

                diagnostics:
                    diagnostics()
            }
        );

    }


    /* ========================================================
       35 — GLOBAL EVENT CONNECTION
       ======================================================== */

    function connectGlobalEvents() {

        const kernel =
            getKernel();


        if (
            !kernel
        ) {

            return false;

        }


        if (
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


                return true;

            } catch (exception) {

                warn(
                    "Kernel Event-Verbindung fehlgeschlagen:",
                    exception
                );

            }

        }


        return false;

    }


    /* ========================================================
       36 — INITIALIZATION
       ======================================================== */

    async function initializeRegistry() {

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

        state.initializedAt =
            Date.now();


        emit(
            "initializing",
            {
                version:
                    VERSION
            }
        );


        try {

            refreshConnections();


            /*
             * Falls der Kernel bereits läuft,
             * Registry sofort als bereit markieren.
             */

            const kernel =
                getKernel();


            if (
                kernel &&
                hasMethod(
                    kernel,
                    "getStatus"
                )
            ) {

                const kernelStatus =
                    kernel.getStatus();


                if (
                    kernelStatus &&
                    kernelStatus.ready
                ) {

                    state.connections.kernel =
                        true;

                }

            }


            state.ready =
                true;

            state.initializing =
                false;

            state.readyAt =
                Date.now();


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
                "App Registry bereit.",
                VERSION
            );


            return api;

        } catch (exception) {

            state.initializing =
                false;

            state.ready =
                false;

            state.failed =
                true;


            reportError(
                "REGISTRY_INIT_ERROR",
                exception
            );


            throw exception;

        }

    }


    /* ========================================================
       37 — STARTUP
       ======================================================== */

    connectGlobalEvents();


    function handleDOMReady() {

        initializeRegistry()
            .catch(
                function (exception) {

                    reportError(
                        "REGISTRY_STARTUP_ERROR",
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
            handleDOMReady,
            {
                once:
                    true
            }
        );

    } else {

        handleDOMReady();

    }


    /* ========================================================
       38 — FINAL EXPOSURE
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS ||
        {};

    window.HalDoOS.appRegistry =
        api;


    /* ========================================================
       END OF FILE
       HALDO AI OS 18
       APP REGISTRY
       ======================================================== */

})(window, document);