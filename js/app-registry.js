/* =========================================================
   HALDO AI OS 18
   APP REGISTRY
   VERSION 18.0.0
   PROFESSIONAL ULTIMATE FOUNDATION

   ZENTRALE APP-REGISTRIERUNG

   Architektur:

       HALDO AI OS
            │
            ▼
         KERNEL
            │
            ▼
       APP REGISTRY
            │
       ┌────┼──────────────┐
       ▼    ▼              ▼
     MANAGER ROUTER      LAUNCHER
            │
            ▼
        APPLICATION

   Aufgaben:

   • Apps registrieren
   • Apps aktualisieren
   • Apps entfernen
   • Apps suchen
   • Kategorien
   • Tags
   • Dependencies
   • Metadaten
   • Enable / Disable
   • Registry Events
   • Import / Export
   • Synchronisation
   • Kernel-Verbindung
   • System-Verbindung
   • App Manager-Kompatibilität
   • Diagnostics
   • Health Check
   • Runtime-Sicherheit
   • zukünftige Erweiterbarkeit

   WICHTIG:

   Diese Datei ist eine eigenständige Gesamtversion.

   ========================================================= */

(function (window, document) {

    "use strict";


    /* =====================================================
       HALDO OS FOUNDATION
       ===================================================== */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;


    /* =====================================================
       META
       ===================================================== */

    const VERSION =
        "18.0.0";

    const NAME =
        "HalDo AI OS App Registry";

    const MODULE_ID =
        "app-registry";


    /* =====================================================
       INTERNAL STATE
       ===================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        initializing:
            false,

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


    /* =====================================================
       LOGGING
       ===================================================== */

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


    /* =====================================================
       ID NORMALIZATION
       ===================================================== */

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


    /* =====================================================
       SAFE HELPERS
       ===================================================== */

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
            Array.isArray(
                value
            )
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

                    const item =
                        value[key];

                    /*
                     * Funktionen werden bewusst
                     * erhalten.
                     */

                    if (
                        typeof item ===
                        "function"
                    ) {

                        result[key] =
                            item;

                    } else {

                        result[key] =
                            safeClone(
                                item
                            );

                    }

                }
            );

            return result;

        }

        return value;

    }


    /* =====================================================
       SERVICE LOOKUPS
       ===================================================== */

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


    /* =====================================================
       EVENT SYSTEM
       ===================================================== */

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
        data
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
                            "Event listener error:",
                            exception
                        );

                    }

                }
            );

        }


        /*
         * Zentrales HalDoOS Event-System
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
                    "app-registry:" + event,
                    data
                );

            } catch (_) {}

        }

    }


    /* =====================================================
       ERROR SYSTEM
       ===================================================== */

    function reportError(
        code,
        exception,
        extra
    ) {

        state.statistics.errors +=
            1;

        const payload = {

            code:
                code ||
                "UNKNOWN_ERROR",

            error:
                exception ||
                null,

            extra:
                extra ||
                null,

            timestamp:
                new Date().toISOString()

        };

        errorLog(
            payload
        );

        emit(
            "error",
            payload
        );

        return payload;

    }


    /* =====================================================
       APP NORMALIZATION
       ===================================================== */

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


        const id =
            createId(
                config.id ||
                config.appId ||
                config.name ||
                config.title
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
                config.name ||
                existing?.name ||
                id,

            title:
                config.title ||
                existing?.title ||
                config.name ||
                id,

            description:
                config.description !==
                undefined
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
                config.icon ||
                existing?.icon ||
                "◈",

            version:
                config.version ||
                existing?.version ||
                VERSION,

            status:
                config.status ||
                existing?.status ||
                "registered",

            enabled:
                config.enabled !==
                undefined
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
                config.singleton !==
                undefined
                    ? config.singleton !== false
                    : (
                        existing
                            ? existing.singleton !== false
                            : true
                    ),

            route:
                config.route !==
                undefined
                    ? config.route
                    : (
                        existing?.route ||
                        null
                    ),

            entry:
                config.entry !==
                undefined
                    ? config.entry
                    : (
                        existing?.entry ||
                        null
                    ),

            url:
                config.url !==
                undefined
                    ? config.url
                    : (
                        existing?.url ||
                        null
                    ),

            permissions:
                Array.isArray(
                    config.permissions
                )
                    ? [
                        ...config.permissions
                    ]
                    : (
                        existing
                            ? [
                                ...(existing.permissions || [])
                            ]
                            : []
                    ),

            dependencies:
                Array.isArray(
                    config.dependencies
                )
                    ? [
                        ...config.dependencies
                    ]
                    : (
                        existing
                            ? [
                                ...(existing.dependencies || [])
                            ]
                            : []
                    ),

            tags:
                Array.isArray(
                    config.tags
                )
                    ? [
                        ...config.tags
                    ]
                    : (
                        existing
                            ? [
                                ...(existing.tags || [])
                            ]
                            : []
                    ),

            keywords:
                Array.isArray(
                    config.keywords
                )
                    ? [
                        ...config.keywords
                    ]
                    : (
                        existing
                            ? [
                                ...(existing.keywords || [])
                            ]
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


    /* =====================================================
       REGISTER
       ===================================================== */

    function register(
        config,
        options
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
                    config:
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
                    app:
                        app,

                    previous:
                        existing,

                    options:
                        options || {}

                }
            );

        } else {

            state.statistics.registered +=
                1;

            emit(
                "registered",
                {
                    app:
                        app,

                    options:
                        options || {}

                }
            );

        }


        notifyManager(
            app,
            existing
                ? "updated"
                : "registered"
        );


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
            !Array.isArray(
                list
            )
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


    /* =====================================================
       GET
       ===================================================== */

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

        return (
            !!normalized &&
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


    /* =====================================================
       FIND / SEARCH
       ===================================================== */

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

                    app.name,

                    app.title,

                    app.description,

                    app.category,

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


    /* =====================================================
       CATEGORY
       ===================================================== */

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


    /* =====================================================
       UPDATE
       ===================================================== */

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


        const normalizedChanges =
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


        if (!normalizedChanges) {

            return null;

        }


        state.apps.set(
            app.id,
            normalizedChanges
        );


        state.statistics.updated +=
            1;


        emit(
            "updated",
            {
                app:
                    normalizedChanges,

                previous:
                    previous
            }
        );


        notifyManager(
            normalizedChanges,
            "updated"
        );


        return normalizedChanges;

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


    /* =====================================================
       REMOVE
       ===================================================== */

    function remove(
        id,
        options
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


        state.apps.delete(
            normalized
        );


        state.statistics.removed +=
            1;


        emit(
            "removed",
            {
                app:
                    app,

                options:
                    options || {}

            }
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


    /* =====================================================
       ENABLE / DISABLE
       ===================================================== */

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
                app:
                    app
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


        state.statistics.disabled +=
            1;


        emit(
            "disabled",
            {
                app:
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


    /* =====================================================
       DEPENDENCIES
       ===================================================== */

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


    /* =====================================================
       TAGS
       ===================================================== */

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

                        return (
                            String(
                                item
                            )
                            .toLowerCase() ===
                            value
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       ENABLED / DISABLED
       ===================================================== */

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


    /* =====================================================
       SYSTEM APPS
       ===================================================== */

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


    /* =====================================================
       EXPORT
       ===================================================== */

    function exportApps(
        options
    ) {

        const settings =
            options || {};


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
                settings.clone === false
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
                data:
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


    /* =====================================================
       IMPORT
       ===================================================== */

    function importApps(
        source,
        options
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

            return 0;

        }


        let imported =
            0;


        definitions.forEach(
            function (definition) {

                const id =
                    createId(
                        definition &&
                        (
                            definition.id ||
                            definition.appId ||
                            definition.name
                        )
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


    /* =====================================================
       CLEAR
       ===================================================== */

    function clear(
        options
    ) {

        const apps =
            getAll();


        state.apps.clear();


        emit(
            "cleared",
            {
                count:
                    apps.length,

                apps:
                    apps,

                options:
                    options || {}

            }
        );


        return apps.length;

    }


    /* =====================================================
       MANAGER NOTIFICATION
       ===================================================== */

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
             * Wichtig:
             *
             * Die Registry übernimmt nicht
             * automatisch die App-Registrierung
             * im Manager.
             *
             * Dadurch vermeiden wir eine
             * Endlosschleife zwischen Registry
             * und Manager.
             *
             * Der Manager kann die Registry
             * über getAll()/getApps() importieren.
             */

            if (
                hasMethod(
                    manager,
                    "emit"
                )
            ) {

                manager.emit(
                    "registry-" + action,
                    {
                        app:
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

                    action:
                        action
                }
            );

            return false;

        }

    }


    /* =====================================================
       CONNECTIONS
       ===================================================== */

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
                    kernel:
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

            } else if (
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
                    system:
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


    function refreshConnections() {

        connectToKernel();

        connectToSystem();


        state.connections.manager =
            !!getManager();


        return getConnectionStatus();

    }


    function getConnectionStatus() {

        return {

            kernel:
                !!getKernel(),

            system:
                !!getSystem(),

            manager:
                !!getManager()

        };

    }


    /* =====================================================
       COUNTERS
       ===================================================== */

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


    /* =====================================================
       DIAGNOSTICS
       ===================================================== */

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

            ready:
                state.ready,

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

        const connections =
            getConnectionStatus();


        const problems =
            [];


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


        return {

            healthy:
                problems.length ===
                0,

            problems:
                problems,

            connections:
                connections,

            initialized:
                state.initialized,

            ready:
                state.ready,

            appCount:
                getCount(),

            timestamp:
                new Date().toISOString()

        };

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

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

                    ready:
                        state.ready,

                    appCount:
                        state.apps.size,

                    connections:
                        getConnectionStatus()

                };

            },


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


    /* =====================================================
       GLOBAL EXPORT
       ===================================================== */

    window.HalDoAppRegistry =
        api;

    window.HalDoOSAppRegistry =
        api;

    HalDoOS.appRegistry =
        api;


    /* =====================================================
       KERNEL READY
       ===================================================== */

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


    /* =====================================================
       GLOBAL EVENT CONNECTION
       ===================================================== */

    function connectGlobalEvents() {

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

    }


    /* =====================================================
       INITIALIZATION
       ===================================================== */

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


        emit(
            "initializing",
            {
                version:
                    VERSION
            }
        );


        refreshConnections();


        state.ready =
            true;

        state.initializing =
            false;


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

    }


    /* =====================================================
       STARTUP
       ===================================================== */

    connectGlobalEvents();


    function handleDOMReady() {

        initializeRegistry()
            .catch(
                function (exception) {

                    state.initializing =
                        false;

                    reportError(
                        "REGISTRY_INIT_ERROR",
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


    /* =====================================================
       FINAL EXPOSURE
       ===================================================== */

    window.HalDoOS =
        window.HalDoOS ||
        {};

    window.HalDoOS.appRegistry =
        api;


    /* =====================================================
       HALDO AI OS 18
       APP REGISTRY
       VERSION 18.0.0
       PROFESSIONAL ULTIMATE FOUNDATION

       END OF FILE
       ===================================================== */

})(window, document);