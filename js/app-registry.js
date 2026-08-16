/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
       js/app-registry.js

   HALDO APPLICATION REGISTRY 20

   Zentrale Verwaltung aller Anwendungen.

   Verantwortlich für:

   - App Registrierung
   - App Contract
   - App Metadaten
   - App Versionen
   - App Kategorien
   - App Berechtigungen
   - App Dependencies
   - App Capabilities
   - App Status
   - App Aktivierung
   - App Deaktivierung
   - App Suche
   - App Filter
   - App Updates
   - App Entfernen
   - App Events
   - App Storage
   - App Diagnostics
   - App Health
   - Kernel Verbindung
   - System Verbindung
   - App Manager Verbindung
   - Router Verbindung
   - zukünftige AI-Verbindungen

   WICHTIG:

   Diese Registry ist nicht nur eine Liste.

   Jede App soll später über diesen Contract
   vollständig mit HalDo AI OS 20 verbunden werden.

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
        "20.0.0";

    const MODULE_ID =
        "app-registry";

    const NAME =
        "HalDo AI OS 20 Application Registry";


    /* ========================================================
       03 — STATE
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

        apps:
            new Map(),

        categories:
            new Map(),

        listeners:
            new Map(),

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

            errors:
                0,

            searches:
                0

        },

        connections: {

            kernel:
                false,

            system:
                false,

            appContract:
                false,

            appManager:
                false,

            router:
                false,

            windowManager:
                false,

            storage:
                false,

            ai:
                false,

            language:
                false

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
       05 — HELPERS
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

                    result[key] =
                        typeof value[key] ===
                        "function"
                            ? value[key]
                            : clone(
                                value[key]
                            );

                }
            );

            return result;

        }


        return value;

    }


    function now() {

        return Date.now();

    }


    /* ========================================================
       06 — SERVICE LOOKUPS
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


    function getAppContract() {

        return (
            window.HalDoAppContract ||
            HalDoOS.appContract ||
            null
        );

    }


    function getAppManager() {

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


    function getWindowManager() {

        return (
            window.HalDoWindowManager ||
            HalDoOS.windowManager ||
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


    function getAICore() {

        return (
            window.HalDoAICore ||
            HalDoOS.aiCore ||
            null
        );

    }


    function getLanguageManager() {

        return (
            window.HalDoLanguageManager ||
            HalDoOS.languageManager ||
            null
        );

    }


    /* ========================================================
       07 — EVENTS
       ======================================================== */

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

                        reportError(
                            exception,
                            "Event: " + event
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
                    "app-registry:" +
                    event,
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
                    "app-registry:" +
                    event,
                    data
                );

            } catch (_) {}

        }

    }


    /* ========================================================
       08 — ERROR HANDLING
       ======================================================== */

    function reportError(
        exception,
        context =
            "Application Registry"
    ) {

        state.statistics.errors +=
            1;


        const normalized =
            exception instanceof Error
                ? exception
                : new Error(
                    String(
                        exception
                    )
                );


        const record = {

            name:
                normalized.name,

            message:
                normalized.message,

            stack:
                normalized.stack ||
                "",

            context,

            timestamp:
                new Date().toISOString()

        };


        errorLog(
            "[HalDo App Registry]",
            record
        );


        emit(
            "error",
            record
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
                    normalized,
                    context
                );

            } catch (_) {}

        }


        return record;

    }


    /* ========================================================
       09 — CONTRACT NORMALIZATION
       ======================================================== */

    function normalizeDefinition(
        definition
    ) {

        if (
            !definition ||
            typeof definition !==
            "object"
        ) {

            throw new Error(
                "Ungültige App Definition."
            );

        }


        const source =
            clone(
                definition
            );


        const id =
            normalizeId(
                source.id ||
                source.appId ||
                source.name
            );


        if (!id) {

            throw new Error(
                "Jede App benötigt eine eindeutige ID."
            );

        }


        const tags =
            Array.isArray(
                source.tags
            )
                ? source.tags
                    .map(
                        item =>
                            String(
                                item
                            )
                            .trim()
                    )
                    .filter(Boolean)
                : [];


        const keywords =
            Array.isArray(
                source.keywords
            )
                ? source.keywords
                    .map(
                        item =>
                            String(
                                item
                            )
                            .trim()
                    )
                    .filter(Boolean)
                : [];


        const dependencies =
            Array.isArray(
                source.dependencies
            )
                ? source.dependencies
                    .map(
                        normalizeId
                    )
                    .filter(Boolean)
                : [];


        const permissions =
            Array.isArray(
                source.permissions
            )
                ? source.permissions
                : [];


        const capabilities =
            Array.isArray(
                source.capabilities
            )
                ? source.capabilities
                : [];


        const category =
            String(
                source.category ||
                "system"
            )
            .trim()
            .toLowerCase();


        const app = {

            ...source,

            id,

            appId:
                id,

            name:
                source.name ||
                id,

            title:
                source.title ||
                source.name ||
                id,

            description:
                source.description ||
                "",

            category,

            icon:
                source.icon ||
                "◈",

            version:
                source.version ||
                VERSION,

            enabled:
                source.enabled !==
                false,

            visible:
                source.visible !==
                false,

            singleton:
                source.singleton !==
                false,

            system:
                source.system ===
                true,

            core:
                source.core ===
                true,

            tags,

            keywords,

            dependencies,

            permissions,

            capabilities,

            route:
                source.route ||
                "/apps/" + id,

            createdAt:
                source.createdAt ||
                now(),

            updatedAt:
                now(),

            registryVersion:
                VERSION

        };


        return app;

    }


    /* ========================================================
       10 — CONTRACT VALIDATION
       ======================================================== */

    function validate(
        definition
    ) {

        const errors = [];


        if (
            !definition ||
            typeof definition !==
            "object"
        ) {

            errors.push(
                "App Definition fehlt."
            );

            return {

                valid:
                    false,

                errors

            };

        }


        if (
            !normalizeId(
                definition.id ||
                definition.appId ||
                definition.name
            )
        ) {

            errors.push(
                "App ID fehlt."
            );

        }


        if (
            definition.dependencies &&
            !Array.isArray(
                definition.dependencies
            )
        ) {

            errors.push(
                "dependencies muss ein Array sein."
            );

        }


        if (
            definition.permissions &&
            !Array.isArray(
                definition.permissions
            )
        ) {

            errors.push(
                "permissions muss ein Array sein."
            );

        }


        if (
            definition.capabilities &&
            !Array.isArray(
                definition.capabilities
            )
        ) {

            errors.push(
                "capabilities muss ein Array sein."
            );

        }


        return {

            valid:
                errors.length ===
                0,

            errors

        };

    }


    /* ========================================================
       11 — REGISTER
       ======================================================== */

    function register(
        definition
    ) {

        try {

            const validation =
                validate(
                    definition
                );


            if (
                !validation.valid
            ) {

                throw new Error(
                    validation.errors.join(
                        " "
                    )
                );

            }


            const app =
                normalizeDefinition(
                    definition
                );


            const existing =
                state.apps.get(
                    app.id
                );


            if (existing) {

                /*
                 * Bestehende App wird erweitert,
                 * nicht blind gelöscht.
                 */

                const merged = {

                    ...existing,

                    ...app,

                    createdAt:
                        existing.createdAt ||
                        app.createdAt,

                    updatedAt:
                        now()

                };


                state.apps.set(
                    app.id,
                    merged
                );


                rebuildCategoryIndex();


                state.statistics.updated +=
                    1;


                emit(
                    "updated",
                    {
                        app:
                            clone(
                                merged
                            ),

                        previous:
                            clone(
                                existing
                            )
                    }
                );


                return clone(
                    merged
                );

            }


            state.apps.set(
                app.id,
                app
            );


            rebuildCategoryIndex();


            state.statistics.registered +=
                1;


            emit(
                "registered",
                {
                    app:
                        clone(
                            app
                        )
                }
            );


            return clone(
                app
            );

        } catch (exception) {

            reportError(
                exception,
                "App Registrierung"
            );


            return null;

        }

    }


    function registerApp(
        definition
    ) {

        return register(
            definition
        );

    }


    /* ========================================================
       12 — GET
       ======================================================== */

    function get(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return null;

        }


        const app =
            state.apps.get(
                id
            );


        return app
            ? clone(app)
            : null;

    }


    function getApp(
        appId
    ) {

        return get(
            appId
        );

    }


    function has(
        appId
    ) {

        return state.apps.has(
            normalizeId(
                appId
            )
        );

    }


    /* ========================================================
       13 — GET ALL
       ======================================================== */

    function getAll() {

        return Array.from(
            state.apps.values()
        )
        .map(
            clone
        );

    }


    function getApps() {

        return getAll();

    }


    function getCount() {

        return state.apps.size;

    }


    /* ========================================================
       14 — CATEGORY INDEX
       ======================================================== */

    function rebuildCategoryIndex() {

        state.categories.clear();


        state.apps.forEach(
            app => {

                const category =
                    app.category ||
                    "system";


                if (
                    !state.categories.has(
                        category
                    )
                ) {

                    state.categories.set(
                        category,
                        new Set()
                    );

                }


                state.categories
                    .get(
                        category
                    )
                    .add(
                        app.id
                    );

            }
        );

    }


    function getCategories() {

        return Array.from(
            state.categories.keys()
        );

    }


    function getByCategory(
        category
    ) {

        const value =
            String(
                category || ""
            )
            .trim()
            .toLowerCase();


        const ids =
            state.categories.get(
                value
            );


        if (!ids) {

            return [];

        }


        return Array.from(
            ids
        )
        .map(
            id =>
                get(id)
        )
        .filter(Boolean);

    }


    /* ========================================================
       15 — SEARCH
       ======================================================== */

    function search(
        query,
        options = {}
    ) {

        state.statistics.searches +=
            1;


        const value =
            String(
                query || ""
            )
            .trim()
            .toLowerCase();


        if (!value) {

            return getAll();

        }


        const results =
            getAll()
            .filter(
                app => {

                    const fields = [

                        app.id,

                        app.name,

                        app.title,

                        app.description,

                        app.category,

                        app.version,

                        ...(app.tags ||
                            []),

                        ...(app.keywords ||
                            [])

                    ];


                    return fields.some(
                        field => {

                            return String(
                                field ||
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


        if (
            options.limit &&
            Number(
                options.limit
            ) > 0
        ) {

            return results.slice(
                0,
                Number(
                    options.limit
                )
            );

        }


        return results;

    }


    /* ========================================================
       16 — UPDATE
       ======================================================== */

    function update(
        appId,
        changes
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return null;

        }


        const existing =
            state.apps.get(
                id
            );


        if (!existing) {

            return null;

        }


        const merged =
            normalizeDefinition({

                ...existing,

                ...(changes || {}),

                id

            });


        state.apps.set(
            id,
            merged
        );


        rebuildCategoryIndex();


        state.statistics.updated +=
            1;


        emit(
            "updated",
            {
                app:
                    clone(
                        merged
                    )
            }
        );


        return clone(
            merged
        );

    }


    /* ========================================================
       17 — REMOVE
       ======================================================== */

    function remove(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const existing =
            state.apps.get(
                id
            );


        if (!existing) {

            return false;

        }


        /*
         * System/Core Apps werden nicht
         * versehentlich entfernt.
         */

        if (
            existing.core ===
            true
        ) {

            warn(
                "Core-App darf nicht entfernt werden:",
                id
            );


            return false;

        }


        state.apps.delete(
            id
        );


        rebuildCategoryIndex();


        state.statistics.removed +=
            1;


        emit(
            "removed",
            {
                app:
                    clone(
                        existing
                    )
            }
        );


        return true;

    }


    function removeApp(
        appId
    ) {

        return remove(
            appId
        );

    }


    /* ========================================================
       18 — ENABLE
       ======================================================== */

    function enable(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const app =
            state.apps.get(
                id
            );


        if (!app) {

            return false;

        }


        if (
            app.enabled !==
            true
        ) {

            app.enabled =
                true;

            app.updatedAt =
                now();


            state.statistics.enabled +=
                1;


            emit(
                "enabled",
                {
                    app:
                        clone(
                            app
                        )
                }
            );

        }


        return true;

    }


    function enableApp(
        appId
    ) {

        return enable(
            appId
        );

    }


    /* ========================================================
       19 — DISABLE
       ======================================================== */

    function disable(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const app =
            state.apps.get(
                id
            );


        if (!app) {

            return false;

        }


        if (
            app.core ===
            true
        ) {

            warn(
                "Core-App darf nicht deaktiviert werden:",
                id
            );


            return false;

        }


        app.enabled =
            false;

        app.updatedAt =
            now();


        state.statistics.disabled +=
            1;


        emit(
            "disabled",
            {
                app:
                    clone(
                        app
                    )
            }
        );


        return true;

    }


    function disableApp(
        appId
    ) {

        return disable(
            appId
        );

    }


    /* ========================================================
       20 — APP DEPENDENCIES
       ======================================================== */

    function checkDependencies(
        appId
    ) {

        const app =
            typeof appId ===
            "object"
                ? appId
                : get(
                    appId
                );


        if (!app) {

            return {

                valid:
                    false,

                missing:
                    [],

                disabled:
                    [],

                circular:
                    []

            };

        }


        const missing = [];

        const disabled = [];

        const circular = [];


        (app.dependencies || [])
            .forEach(
                dependencyId => {

                    const id =
                        normalizeId(
                            dependencyId
                        );


                    const dependency =
                        state.apps.get(
                            id
                        );


                    if (!dependency) {

                        missing.push(
                            id
                        );

                        return;

                    }


                    if (
                        dependency.enabled ===
                        false
                    ) {

                        disabled.push(
                            id
                        );

                    }


                    if (
                        id ===
                        app.id
                    ) {

                        circular.push(
                            id
                        );

                    }

                }
            );


        return {

            valid:
                missing.length ===
                0 &&
                disabled.length ===
                0 &&
                circular.length ===
                0,

            missing,

            disabled,

            circular

        };

    }


    /* ========================================================
       21 — PERMISSIONS
       ======================================================== */

    function hasPermission(
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


        return (
            app.permissions || []
        )
        .map(
            item =>
                String(
                    item
                )
                .toLowerCase()
        )
        .includes(
            String(
                permission || ""
            )
            .toLowerCase()
        );

    }


    /* ========================================================
       22 — CAPABILITIES
       ======================================================== */

    function hasCapability(
        appId,
        capability
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return false;

        }


        return (
            app.capabilities || []
        )
        .map(
            item =>
                String(
                    item
                )
                .toLowerCase()
        )
        .includes(
            String(
                capability || ""
            )
            .toLowerCase()
        );

    }


    /* ========================================================
       23 — OPEN STATE
       ======================================================== */

    function isOpen(
        appId
    ) {

        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "getAppState"
            )
        ) {

            const appState =
                manager.getAppState(
                    appId
                );


            return !!(
                appState &&
                appState.open
            );

        }


        return false;

    }


    /* ========================================================
       24 — LAUNCH
       ======================================================== */

    async function launch(
        appId,
        options = {}
    ) {

        const manager =
            getAppManager();


        if (
            !manager ||
            !hasMethod(
                manager,
                "open"
            )
        ) {

            reportError(
                new Error(
                    "App Manager nicht verfügbar."
                ),
                "Registry Launch"
            );


            return null;

        }


        const app =
            get(
                appId
            );


        if (!app) {

            return null;

        }


        if (
            app.enabled ===
            false
        ) {

            return null;

        }


        const dependencies =
            checkDependencies(
                app
            );


        if (
            !dependencies.valid
        ) {

            reportError(
                new Error(
                    "App Dependencies nicht erfüllt."
                ),
                "Registry Launch"
            );


            return null;

        }


        try {

            return await manager.open(
                app.id,
                options
            );

        } catch (exception) {

            reportError(
                exception,
                "App Launch: " +
                app.id
            );


            return null;

        }

    }


    /* ========================================================
       25 — APP CONTRACT CONNECTION
       ======================================================== */

    function connectAppContract() {

        const contract =
            getAppContract();


        if (!contract) {

            state.connections.appContract =
                false;

            return false;

        }


        state.connections.appContract =
            true;


        return true;

    }


    /* ========================================================
       26 — SERVICE CONNECTIONS
       ======================================================== */

    function refreshConnections() {

        state.connections.kernel =
            !!getKernel();


        state.connections.system =
            !!getSystem();


        state.connections.appContract =
            !!getAppContract();


        state.connections.appManager =
            !!getAppManager();


        state.connections.router =
            !!getRouter();


        state.connections.windowManager =
            !!getWindowManager();


        state.connections.storage =
            !!getStorage();


        state.connections.ai =
            !!getAICore();


        state.connections.language =
            !!getLanguageManager();


        connectAppContract();


        return getConnectionStatus();

    }


    function getConnectionStatus() {

        return {

            kernel:
                !!getKernel(),

            system:
                !!getSystem(),

            appContract:
                !!getAppContract(),

            appManager:
                !!getAppManager(),

            router:
                !!getRouter(),

            windowManager:
                !!getWindowManager(),

            storage:
                !!getStorage(),

            ai:
                !!getAICore(),

            language:
                !!getLanguageManager()

        };

    }


    /* ========================================================
       27 — PERSISTENCE
       ======================================================== */

    function getStorageKey() {

        return (
            "haldo.ai.os.20.app-registry"
        );

    }


    function save() {

        const data =
            getAll();


        try {

            const storage =
                getStorage();


            if (
                storage &&
                hasMethod(
                    storage,
                    "set"
                )
            ) {

                storage.set(
                    getStorageKey(),
                    data
                );

                return true;

            }

        } catch (exception) {

            reportError(
                exception,
                "Registry Storage"
            );

        }


        try {

            window.localStorage.setItem(
                getStorageKey(),
                JSON.stringify(
                    data
                )
            );


            return true;

        } catch (_) {

            return false;

        }

    }


    function load() {

        try {

            const storage =
                getStorage();


            if (
                storage &&
                hasMethod(
                    storage,
                    "get"
                )
            ) {

                const data =
                    storage.get(
                        getStorageKey()
                    );


                if (
                    Array.isArray(
                        data
                    )
                ) {

                    data.forEach(
                        app =>
                            register(
                                app
                            )
                    );


                    return true;

                }

            }

        } catch (exception) {

            reportError(
                exception,
                "Registry Storage Load"
            );

        }


        try {

            const raw =
                window.localStorage.getItem(
                    getStorageKey()
                );


            if (!raw) {

                return false;

            }


            const data =
                JSON.parse(
                    raw
                );


            if (
                Array.isArray(
                    data
                )
            ) {

                data.forEach(
                    app =>
                        register(
                            app
                        )
                );


                return true;

            }

        } catch (exception) {

            reportError(
                exception,
                "Registry LocalStorage Load"
            );

        }


        return false;

    }


    /* ========================================================
       28 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        return {

            name:
                NAME,

            version:
                VERSION,

            module:
                MODULE_ID,

            initialized:
                state.initialized,

            initializing:
                state.initializing,

            ready:
                state.ready,

            failed:
                state.failed,

            appCount:
                getCount(),

            categories:
                getCategories(),

            connections:
                getConnectionStatus(),

            statistics:
                {
                    ...state.statistics
                },

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

                        version:
                            app.version,

                        category:
                            app.category,

                        enabled:
                            app.enabled,

                        core:
                            app.core,

                        system:
                            app.system,

                        dependencies:
                            checkDependencies(
                                app
                            )

                    })
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       29 — HEALTH CHECK
       ======================================================== */

    function healthCheck() {

        const problems = [];


        if (
            !getKernel()
        ) {

            problems.push(
                "Kernel nicht verbunden."
            );

        }


        if (
            !getSystem()
        ) {

            problems.push(
                "System nicht verbunden."
            );

        }


        if (
            !getAppContract()
        ) {

            problems.push(
                "App Contract nicht verbunden."
            );

        }


        const dependencyProblems =
            [];


        getAll().forEach(
            app => {

                const result =
                    checkDependencies(
                        app
                    );


                if (
                    !result.valid
                ) {

                    dependencyProblems.push({

                        appId:
                            app.id,

                        ...result

                    });

                }

            }
        );


        return {

            healthy:
                problems.length ===
                0 &&
                dependencyProblems.length ===
                0,

            problems,

            dependencyProblems,

            appCount:
                getCount(),

            categories:
                getCategories(),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       30 — PUBLIC API
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
                        getCount(),

                    connections:
                        getConnectionStatus()

                };

            },


        /* Events */

        on,

        off,

        emit,


        /* Registration */

        register,

        registerApp,

        update,

        remove,

        removeApp,


        /* Access */

        get,

        getApp,

        getAll,

        getApps,

        has,

        getCount,


        /* Categories */

        getCategories,

        getByCategory,


        /* Search */

        search,


        /* Status */

        enable,

        enableApp,

        disable,

        disableApp,


        /* Dependencies */

        checkDependencies,

        hasPermission,

        hasCapability,


        /* Runtime */

        isOpen,

        launch,


        /* Persistence */

        save,

        load,


        /* Connections */

        refreshConnections,

        getConnectionStatus,


        /* Diagnostics */

        diagnostics,

        healthCheck,


        /* Statistics */

        getStatistics:
            function () {

                return {
                    ...state.statistics
                };

            }

    };


    /* ========================================================
       31 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppRegistry =
        api;

    window.HalDoOSAppRegistry =
        api;

    HalDoOS.appRegistry =
        api;


    /* ========================================================
       32 — KERNEL CONNECTION
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


            state.connections.kernel =
                true;


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Kernel Connection"
            );


            return false;

        }

    }


    /* ========================================================
       33 — INITIALIZATION
       ======================================================== */

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

        state.failed =
            false;


        emit(
            "initializing",
            {
                version:
                    VERSION
            }
        );


        refreshConnections();

        connectKernel();

        connectAppContract();


        /*
         * Bereits gespeicherte Registry-Daten
         * vorsichtig laden.
         */

        load();


        rebuildCategoryIndex();


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
                    getCount(),

                diagnostics:
                    diagnostics()

            }
        );


        log(
            "HalDo AI OS 20 App Registry bereit.",
            "Apps:",
            getCount()
        );


        return api;

    }


    /* ========================================================
       34 — BOOT
       ======================================================== */

    function boot() {

        initialize()
            .catch(
                exception => {

                    state.initializing =
                        false;

                    state.failed =
                        true;


                    reportError(
                        exception,
                        "Registry Initialisierung"
                    );

                }
            );

    }


    /* ========================================================
       35 — DOM START
       ======================================================== */

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

        boot();

    }


    /* ========================================================
       FINAL
       ======================================================== */

    HalDoOS.appRegistry =
        api;

    window.HalDoAppRegistry =
        api;

    window.HalDoOSAppRegistry =
        api;


})(window, document);


/* ============================================================
   END
   HALDO AI OS 20 APPLICATION REGISTRY
   ============================================================ */