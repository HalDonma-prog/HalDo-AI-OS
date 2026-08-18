/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL APPLICATION REGISTRY
   ------------------------------------------------------------
   Datei:
       js/app-registry.js

   Pfad:
       /js/app-registry.js

   HALDO APPLICATION REGISTRY 20

   Zentrale, verbindliche Registry für sämtliche HalDo Apps.

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
   - App Aktivierung / Deaktivierung
   - App Sichtbarkeit
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
   - Window Manager Verbindung
   - AI Verbindung
   - Language Verbindung
   - zukünftige Service Bridges

   WICHTIG:

   Diese Registry ist die zentrale Quelle für App-Metadaten.

   Apps sollen nicht nur "angezeigt" werden.

   Jede App kann später über diesen Contract vollständig
   mit Runtime, Kernel, System, Storage, AI, Sprache,
   Window Manager, Router und App Manager verbunden werden.

   Bestehende Funktionen werden nicht blind entfernt.
   Diese Datei ist als zentrale Foundation für die weitere
   Zusammenführung des gesamten HalDo AI OS gedacht.

   ============================================================ */

"use strict";

(function (window, document) {

    /* ============================================================
       01 — FOUNDATION
       ============================================================ */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;


    /* ============================================================
       02 — META
       ============================================================ */

    const VERSION =
        "20.0.0";

    const MODULE_ID =
        "app-registry";

    const NAME =
        "HalDo AI OS 20 Application Registry";

    const STORAGE_KEY =
        "haldo.ai.os.20.app-registry";

    const DEFAULT_CATEGORY =
        "system";


    /* ============================================================
       03 — STATE
       ============================================================ */

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
                0,

            launches:
                0,

            persistenceLoads:
                0,

            persistenceSaves:
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


    /* ============================================================
       04 — LOGGING
       ============================================================ */

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


    /* ============================================================
       05 — GENERIC HELPERS
       ============================================================ */

    function hasMethod(
        object,
        method
    ) {

        return !!(
            object &&
            typeof object[method] === "function"
        );

    }


    function now() {

        return Date.now();

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


    function normalizeStringArray(
        value
    ) {

        if (
            !Array.isArray(value)
        ) {

            return [];

        }

        return value
            .map(
                item =>
                    String(
                        item || ""
                    )
                    .trim()
            )
            .filter(Boolean);

    }


    function uniqueArray(
        values
    ) {

        return Array.from(
            new Set(
                values || []
            )
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

                        result[key] =
                            typeof value[key] === "function"
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


    /* ============================================================
       06 — SERVICE LOOKUPS
       ============================================================ */

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


    /* ============================================================
       07 — INTERNAL EVENT SYSTEM
       ============================================================ */

    function on(
        event,
        callback
    ) {

        if (
            typeof callback !== "function"
        ) {

            return function () {};

        }


        if (
            !state.listeners.has(event)
        ) {

            state.listeners.set(
                event,
                new Set()
            );

        }


        const listeners =
            state.listeners.get(event);


        listeners.add(callback);


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
            state.listeners.get(event);


        if (!listeners) {

            return;

        }


        listeners.delete(
            callback
        );


        if (
            listeners.size === 0
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
            state.listeners.get(event);


        if (listeners) {

            Array.from(listeners)
                .forEach(
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


        /*
         * Verbindung zur zentralen HalDo EventBus API.
         */

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
                    "app-registry:" + event,
                    data
                );

            } catch (_) {}

        }


        /*
         * Verbindung zum Kernel Event Bus.
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

            } catch (_) {}

        }

    }


    /* ============================================================
       08 — ERROR HANDLING
       ============================================================ */

    function reportError(
        exception,
        context =
            "Application Registry"
    ) {

        state.statistics.errors += 1;


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
                normalized.stack || "",

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


    /* ============================================================
       09 — APP CONTRACT NORMALIZATION
       ============================================================ */

    function normalizeDefinition(
        definition
    ) {

        if (
            !definition ||
            typeof definition !== "object"
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


        const dependencies =
            uniqueArray(
                normalizeStringArray(
                    source.dependencies
                )
                .map(
                    normalizeId
                )
                .filter(Boolean)
            );


        const permissions =
            uniqueArray(
                normalizeStringArray(
                    source.permissions
                )
            );


        const capabilities =
            uniqueArray(
                normalizeStringArray(
                    source.capabilities
                )
            );


        const tags =
            uniqueArray(
                normalizeStringArray(
                    source.tags
                )
            );


        const keywords =
            uniqueArray(
                normalizeStringArray(
                    source.keywords
                )
            );


        const category =
            String(
                source.category ||
                DEFAULT_CATEGORY
            )
            .trim()
            .toLowerCase();


        const createdAt =
            Number(
                source.createdAt
            ) > 0
                ? Number(source.createdAt)
                : now();


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
                source.enabled !== false,

            visible:
                source.visible !== false,

            singleton:
                source.singleton !== false,

            system:
                source.system === true,

            core:
                source.core === true,

            experimental:
                source.experimental === true,

            beta:
                source.beta === true,

            tags,

            keywords,

            dependencies,

            permissions,

            capabilities,

            route:
                source.route ||
                "/apps/" + id,

            entry:
                source.entry ||
                null,

            module:
                source.module ||
                null,

            iconUrl:
                source.iconUrl ||
                null,

            createdAt,

            updatedAt:
                now(),

            registryVersion:
                VERSION

        };


        return app;

    }


    /* ============================================================
       10 — CONTRACT VALIDATION
       ============================================================ */

    function validate(
        definition
    ) {

        const errors = [];


        if (
            !definition ||
            typeof definition !== "object"
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


        const id =
            normalizeId(
                definition.id ||
                definition.appId ||
                definition.name
            );


        if (!id) {

            errors.push(
                "App ID fehlt."
            );

        }


        if (
            definition.dependencies !== undefined &&
            !Array.isArray(
                definition.dependencies
            )
        ) {

            errors.push(
                "dependencies muss ein Array sein."
            );

        }


        if (
            definition.permissions !== undefined &&
            !Array.isArray(
                definition.permissions
            )
        ) {

            errors.push(
                "permissions muss ein Array sein."
            );

        }


        if (
            definition.capabilities !== undefined &&
            !Array.isArray(
                definition.capabilities
            )
        ) {

            errors.push(
                "capabilities muss ein Array sein."
            );

        }


        if (
            definition.tags !== undefined &&
            !Array.isArray(
                definition.tags
            )
        ) {

            errors.push(
                "tags muss ein Array sein."
            );

        }


        if (
            definition.keywords !== undefined &&
            !Array.isArray(
                definition.keywords
            )
        ) {

            errors.push(
                "keywords muss ein Array sein."
            );

        }


        return {

            valid:
                errors.length === 0,

            errors

        };

    }


    /* ============================================================
       11 — CATEGORY INDEX
       ============================================================ */

    function rebuildCategoryIndex() {

        state.categories.clear();


        state.apps.forEach(
            app => {

                const category =
                    app.category ||
                    DEFAULT_CATEGORY;


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
                    .get(category)
                    .add(app.id);

            }
        );

    }


    /* ============================================================
       12 — REGISTER
       ============================================================ */

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


            /*
             * Bestehende App:
             *
             * niemals blind entfernen.
             * Neue Informationen erweitern den
             * vorhandenen Contract.
             */

            if (existing) {

                const merged = {

                    ...existing,

                    ...app,

                    createdAt:
                        existing.createdAt ||
                        app.createdAt,

                    updatedAt:
                        now()

                };


                /*
                 * Core/System-Eigenschaften dürfen
                 * nicht versehentlich durch einen
                 * späteren Teil-Contract verloren gehen.
                 */

                if (
                    existing.core === true
                ) {

                    merged.core =
                        true;

                }


                if (
                    existing.system === true
                ) {

                    merged.system =
                        true;

                }


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


    /*
     * Mehrere Apps gleichzeitig registrieren.
     */

    function registerMany(
        definitions
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
                    register(
                        definition
                    )
            )
            .filter(Boolean);

    }


    /* ============================================================
       13 — GET / ACCESS
       ============================================================ */

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


    function getCount() {

        return state.apps.size;

    }


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


    /* ============================================================
       14 — ENABLED / VISIBLE FILTERS
       ============================================================ */

    function getEnabledApps() {

        return getAll()
            .filter(
                app =>
                    app.enabled !== false
            );

    }


    function getVisibleApps() {

        return getAll()
            .filter(
                app =>
                    app.visible !== false &&
                    app.enabled !== false
            );

    }


    function getSystemApps() {

        return getAll()
            .filter(
                app =>
                    app.system === true ||
                    app.core === true
            );

    }


    function getUserApps() {

        return getAll()
            .filter(
                app =>
                    app.system !== true &&
                    app.core !== true
            );

    }


    /* ============================================================
       15 — CATEGORIES
       ============================================================ */

    function getCategories() {

        return Array.from(
            state.categories.keys()
        )
        .sort();

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


    /* ============================================================
       16 — SEARCH
       ============================================================ */

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


        let results =
            getAll();


        if (value) {

            results =
                results.filter(
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
                                []),

                            ...(app.capabilities ||
                                [])

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


        if (
            options.category
        ) {

            const category =
                String(
                    options.category
                )
                .trim()
                .toLowerCase();


            results =
                results.filter(
                    app =>
                        app.category ===
                        category
                );

        }


        if (
            options.enabled !== undefined
        ) {

            results =
                results.filter(
                    app =>
                        app.enabled ===
                        Boolean(
                            options.enabled
                        )
                );

        }


        if (
            options.visible !== undefined
        ) {

            results =
                results.filter(
                    app =>
                        app.visible ===
                        Boolean(
                            options.visible
                        )
                );

        }


        if (
            options.system !== undefined
        ) {

            results =
                results.filter(
                    app =>
                        app.system ===
                        Boolean(
                            options.system
                        )
                );

        }


        if (
            options.core !== undefined
        ) {

            results =
                results.filter(
                    app =>
                        app.core ===
                        Boolean(
                            options.core
                        )
                );

        }


        if (
            options.limit &&
            Number(
                options.limit
            ) > 0
        ) {

            results =
                results.slice(
                    0,
                    Number(
                        options.limit
                    )
                );

        }


        return results;

    }


    /* ============================================================
       17 — UPDATE
       ============================================================ */

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


        try {

            const merged =
                normalizeDefinition({

                    ...existing,

                    ...(changes || {}),

                    id

                });


            /*
             * Core/System Status schützen.
             */

            if (
                existing.core === true
            ) {

                merged.core =
                    true;

            }


            if (
                existing.system === true
            ) {

                merged.system =
                    true;

            }


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

        } catch (exception) {

            reportError(
                exception,
                "App Update: " +
                id
            );


            return null;

        }

    }


    /* ============================================================
       18 — REMOVE
       ============================================================ */

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
         * Core Apps dürfen nicht entfernt werden.
         */

        if (
            existing.core === true
        ) {

            warn(
                "Core-App darf nicht entfernt werden:",
                id
            );


            return false;

        }


        /*
         * Andere Apps dürfen nicht entfernt werden,
         * wenn sie von ihnen abhängig sind.
         */

        const dependents =
            getAll()
                .filter(
                    app =>
                        app.id !== id &&
                        Array.isArray(
                            app.dependencies
                        ) &&
                        app.dependencies
                            .map(
                                normalizeId
                            )
                            .includes(id)
                );


        if (
            dependents.length
        ) {

            warn(
                "App kann nicht entfernt werden. Abhängige Apps:",
                dependents.map(
                    app =>
                        app.id
                )
            );


            emit(
                "remove-blocked",
                {

                    app:
                        clone(
                            existing
                        ),

                    dependents:
                        dependents.map(
                            clone
                        )

                }
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


    /* ============================================================
       19 — ENABLE
       ============================================================ */

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
            app.enabled !== true
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


    /* ============================================================
       20 — DISABLE
       ============================================================ */

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
            app.core === true
        ) {

            warn(
                "Core-App darf nicht deaktiviert werden:",
                id
            );


            return false;

        }


        if (
            app.enabled !== false
        ) {

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

        }


        return true;

    }


    function disableApp(
        appId
    ) {

        return disable(
            appId
        );

    }


    /* ============================================================
       21 — VISIBILITY
       ============================================================ */

    function setVisible(
        appId,
        visible
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


        app.visible =
            Boolean(
                visible
            );

        app.updatedAt =
            now();


        emit(
            "visibility-changed",
            {

                app:
                    clone(
                        app
                    )

            }
        );


        return true;

    }


    function isVisible(
        appId
    ) {

        const app =
            state.apps.get(
                normalizeId(
                    appId
                )
            );


        return !!(
            app &&
            app.visible !== false
        );

    }


    /* ============================================================
       22 — DEPENDENCY ENGINE
       ============================================================ */

    function checkDependencies(
        appOrId,
        options = {}
    ) {

        const app =
            typeof appOrId === "object"
                ? appOrId
                : get(
                    appOrId
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
                    [],

                chain:
                    []

            };

        }


        const missing = [];
        const disabled = [];
        const circular = [];
        const chain = [];


        const visited =
            new Set();


        function walk(
            currentId,
            rootId
        ) {

            const id =
                normalizeId(
                    currentId
                );


            if (!id) {

                return;

            }


            if (
                visited.has(id)
            ) {

                return;

            }


            visited.add(id);


            if (
                id === rootId
            ) {

                circular.push(
                    id
                );

                return;

            }


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


            chain.push(
                id
            );


            if (
                dependency.enabled === false
            ) {

                disabled.push(
                    id
                );

            }


            (
                dependency.dependencies ||
                []
            )
            .forEach(
                dependencyId =>
                    walk(
                        dependencyId,
                        rootId
                    )
            );

        }


        (
            app.dependencies ||
            []
        )
        .forEach(
            dependencyId => {

                const id =
                    normalizeId(
                        dependencyId
                    );


                if (
                    id === app.id
                ) {

                    circular.push(
                        id
                    );

                    return;

                }


                walk(
                    id,
                    app.id
                );

            }
        );


        return {

            valid:
                missing.length === 0 &&
                disabled.length === 0 &&
                circular.length === 0,

            missing:
                uniqueArray(
                    missing
                ),

            disabled:
                uniqueArray(
                    disabled
                ),

            circular:
                uniqueArray(
                    circular
                ),

            chain:
                uniqueArray(
                    chain
                )

        };

    }


    /* ============================================================
       23 — PERMISSIONS
       ============================================================ */

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


        const target =
            String(
                permission || ""
            )
            .trim()
            .toLowerCase();


        return (
            app.permissions || []
        )
        .some(
            item =>
                String(
                    item
                )
                .trim()
                .toLowerCase() ===
                target
        );

    }


    /* ============================================================
       24 — CAPABILITIES
       ============================================================ */

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


        const target =
            String(
                capability || ""
            )
            .trim()
            .toLowerCase();


        return (
            app.capabilities || []
        )
        .some(
            item =>
                String(
                    item
                )
                .trim()
                .toLowerCase() ===
                target
        );

    }


    /* ============================================================
       25 — APP STATE
       ============================================================ */

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

            try {

                const appState =
                    manager.getAppState(
                        appId
                    );


                return !!(
                    appState &&
                    appState.open
                );

            } catch (exception) {

                reportError(
                    exception,
                    "App State: " +
                    appId
                );

            }

        }


        return false;

    }


    /* ============================================================
       26 — LAUNCH
       ============================================================ */

    async function launch(
        appId,
        options = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        const app =
            get(
                id
            );


        if (!app) {

            return null;

        }


        if (
            app.enabled === false
        ) {

            emit(
                "launch-blocked",
                {

                    app:
                        clone(
                            app
                        ),

                    reason:
                        "disabled"

                }
            );


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
                "Registry Launch: " + id
            );


            emit(
                "launch-blocked",
                {

                    app:
                        clone(
                            app
                        ),

                    reason:
                        "dependencies",

                    dependencies

                }
            );


            return null;

        }


        const manager =
            getAppManager();


        if (
            !manager ||
            !hasMethod(
                manager,
                "open"
            )
        ) {

            /*
             * Router als zweiter Weg.
             */

            const router =
                getRouter();


            if (
                router &&
                hasMethod(
                    router,
                    "navigate"
                )
            ) {

                try {

                    const result =
                        await router.navigate(
                            app.route || id,
                            options
                        );


                    state.statistics.launches +=
                        1;


                    emit(
                        "launched",
                        {

                            app:
                                clone(
                                    app
                                ),

                            result

                        }
                    );


                    return result;

                } catch (exception) {

                    reportError(
                        exception,
                        "Router Launch: " + id
                    );

                }

            }


            reportError(
                new Error(
                    "App Manager und Router nicht verfügbar."
                ),
                "Registry Launch"
            );


            return null;

        }


        try {

            const result =
                await manager.open(
                    id,
                    options
                );


            state.statistics.launches +=
                1;


            emit(
                "launched",
                {

                    app:
                        clone(
                            app
                        ),

                    result

                }
            );


            return result;

        } catch (exception) {

            reportError(
                exception,
                "App Launch: " + id
            );


            emit(
                "launch-failed",
                {

                    app:
                        clone(
                            app
                        ),

                    error:
                        exception

                }
            );


            return null;

        }

    }


    /* ============================================================
       27 — APP CONTRACT CONNECTION
       ============================================================ */

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


        /*
         * Falls ein zukünftiger App Contract eine
         * Registry-Verbindung anbietet, wird diese genutzt.
         */

        try {

            if (
                hasMethod(
                    contract,
                    "setRegistry"
                )
            ) {

                contract.setRegistry(
                    api
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "App Contract Connection"
            );

        }


        return true;

    }


    /* ============================================================
       28 — SERVICE CONNECTIONS
       ============================================================ */

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


    /* ============================================================
       29 — PERSISTENCE
       ============================================================ */

    function getStorageKey() {

        return STORAGE_KEY;

    }


    function serialize() {

        return {

            version:
                VERSION,

            savedAt:
                new Date().toISOString(),

            apps:
                getAll()

        };

    }


    function save() {

        const payload =
            serialize();


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

                const result =
                    storage.set(
                        getStorageKey(),
                        payload
                    );


                if (
                    result !== false
                ) {

                    state.statistics.persistenceSaves +=
                        1;


                    emit(
                        "saved",
                        payload
                    );


                    return true;

                }

            }

        } catch (exception) {

            reportError(
                exception,
                "Registry Storage Save"
            );

        }


        /*
         * Fallback auf LocalStorage.
         */

        try {

            window.localStorage.setItem(
                getStorageKey(),
                JSON.stringify(
                    payload
                )
            );


            state.statistics.persistenceSaves +=
                1;


            emit(
                "saved",
                payload
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Registry LocalStorage Save"
            );


            return false;

        }

    }


    function extractStoredApps(
        data
    ) {

        if (
            Array.isArray(data)
        ) {

            return data;

        }


        if (
            data &&
            Array.isArray(
                data.apps
            )
        ) {

            return data.apps;

        }


        return [];

    }


    function load() {

        let loaded =
            false;


        /*
         * Zuerst HalDo Storage.
         */

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


                const apps =
                    extractStoredApps(
                        data
                    );


                if (
                    apps.length
                ) {

                    apps.forEach(
                        definition => {

                            try {

                                register(
                                    definition
                                );

                            } catch (_) {}

                        }
                    );


                    loaded =
                        true;

                }

            }

        } catch (exception) {

            reportError(
                exception,
                "Registry Storage Load"
            );

        }


        /*
         * LocalStorage Fallback.
         */

        if (!loaded) {

            try {

                const raw =
                    window.localStorage.getItem(
                        getStorageKey()
                    );


                if (raw) {

                    const data =
                        JSON.parse(
                            raw
                        );


                    const apps =
                        extractStoredApps(
                            data
                        );


                    if (
                        apps.length
                    ) {

                        apps.forEach(
                            definition => {

                                try {

                                    register(
                                        definition
                                    );

                                } catch (_) {}

                            }
                        );


                        loaded =
                            true;

                    }

                }

            } catch (exception) {

                reportError(
                    exception,
                    "Registry LocalStorage Load"
                );

            }

        }


        if (loaded) {

            state.statistics.persistenceLoads +=
                1;


            rebuildCategoryIndex();


            emit(
                "loaded",
                {

                    appCount:
                        getCount()

                }
            );

        }


        return loaded;

    }


    /* ============================================================
       30 — IMPORT / EXPORT
       ============================================================ */

    function exportApps() {

        return serialize();

    }


    function importApps(
        payload,
        options = {}
    ) {

        const apps =
            extractStoredApps(
                payload
            );


        if (
            !apps.length
        ) {

            return {

                imported:
                    0,

                failed:
                    0

            };

        }


        let imported =
            0;

        let failed =
            0;


        apps.forEach(
            definition => {

                const result =
                    register(
                        definition
                    );


                if (result) {

                    imported +=
                        1;

                } else {

                    failed +=
                        1;

                }

            }
        );


        if (
            options.save === true
        ) {

            save();

        }


        emit(
            "imported",
            {

                imported,

                failed,

                appCount:
                    getCount()

            }
        );


        return {

            imported,

            failed

        };

    }


    /* ============================================================
       31 — DIAGNOSTICS
       ============================================================ */

    function diagnostics() {

        return {

            name:
                NAME,

            version:
                VERSION,

            module:
                MODULE_ID,

            storageKey:
                STORAGE_KEY,

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

                            visible:
                                app.visible,

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


    /* ============================================================
       32 — HEALTH CHECK
       ============================================================ */

    function healthCheck() {

        const problems =
            [];


        const connections =
            getConnectionStatus();


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
            [];


        getAll()
            .forEach(
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
                problems.length === 0 &&
                dependencyProblems.length === 0,

            problems,

            dependencyProblems,

            appCount:
                getCount(),

            categories:
                getCategories(),

            connections,

            timestamp:
                new Date().toISOString()

        };

    }


    /* ============================================================
       33 — CLEAR NON-CORE
       ============================================================ */

    function clearNonCore() {

        const removed = [];


        Array.from(
            state.apps.values()
        )
        .forEach(
            app => {

                if (
                    app.core === true
                ) {

                    return;

                }


                state.apps.delete(
                    app.id
                );


                removed.push(
                    app.id
                );

            }
        );


        rebuildCategoryIndex();


        if (
            removed.length
        ) {

            state.statistics.removed +=
                removed.length;


            emit(
                "cleared",
                {

                    removed

                }
            );

        }


        return removed;

    }


    /* ============================================================
       34 — RESET
       ============================================================ */

    function reset(
        options = {}
    ) {

        const removed =
            clearNonCore();


        if (
            options.clearStorage === true
        ) {

            try {

                const storage =
                    getStorage();


                if (
                    storage &&
                    hasMethod(
                        storage,
                        "remove"
                    )
                ) {

                    storage.remove(
                        getStorageKey()
                    );

                }

            } catch (_) {}


            try {

                window.localStorage.removeItem(
                    getStorageKey()
                );

            } catch (_) {}

        }


        emit(
            "reset",
            {

                removed,

                storageCleared:
                    options.clearStorage === true

            }
        );


        return true;

    }


    /* ============================================================
       35 — STATISTICS
       ============================================================ */

    function getStatistics() {

        return {

            ...state.statistics

        };

    }


    /* ============================================================
       36 — STATE
       ============================================================ */

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

            appCount:
                getCount(),

            categories:
                getCategories(),

            connections:
                getConnectionStatus()

        };

    }


    /* ============================================================
       37 — PUBLIC API
       ============================================================ */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,

        storageKey:
            STORAGE_KEY,


        /*
         * State
         */

        getState,


        /*
         * Events
         */

        on,

        off,

        emit,


        /*
         * Registration
         */

        register,

        registerApp,

        registerMany,

        update,

        remove,

        removeApp,


        /*
         * Access
         */

        get,

        getApp,

        getAll,

        getApps,

        has,

        getCount,


        /*
         * Filters
         */

        getEnabledApps,

        getVisibleApps,

        getSystemApps,

        getUserApps,


        /*
         * Categories
         */

        getCategories,

        getByCategory,


        /*
         * Search
         */

        search,


        /*
         * Status
         */

        enable,

        enableApp,

        disable,

        disableApp,

        setVisible,

        isVisible,


        /*
         * Dependencies
         */

        checkDependencies,


        /*
         * Security / Capabilities
         */

        hasPermission,

        hasCapability,


        /*
         * Runtime
         */

        isOpen,

        launch,


        /*
         * Connections
         */

        refreshConnections,

        getConnectionStatus,


        /*
         * Persistence
         */

        save,

        load,

        exportApps,

        importApps,


        /*
         * Diagnostics
         */

        diagnostics,

        healthCheck,


        /*
         * Maintenance
         */

        clearNonCore,

        reset,


        /*
         * Statistics
         */

        getStatistics

    };


    /* ============================================================
       38 — GLOBAL EXPORT
       ============================================================ */

    window.HalDoAppRegistry =
        api;

    window.HalDoOSAppRegistry =
        api;

    HalDoOS.appRegistry =
        api;


    /* ============================================================
       39 — KERNEL CONNECTION
       ============================================================ */

    function connectKernel() {

        const kernel =
            getKernel();


        if (!kernel) {

            state.connections.kernel =
                false;

            return false;

        }


        try {

            /*
             * Vorhandene Kernel API verwenden.
             */

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


    /* ============================================================
       40 — SYSTEM CONNECTION
       ============================================================ */

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
                    "registerModule"
                )
            ) {

                system.registerModule(
                    MODULE_ID,
                    api
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "System Connection"
            );

        }


        return true;

    }


    /* ============================================================
       41 — MANAGER CONNECTION
       ============================================================ */

    function connectAppManager() {

        const manager =
            getAppManager();


        if (!manager) {

            state.connections.appManager =
                false;

            return false;

        }


        state.connections.appManager =
            true;


        try {

            if (
                hasMethod(
                    manager,
                    "setRegistry"
                )
            ) {

                manager.setRegistry(
                    api
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "App Manager Connection"
            );

        }


        return true;

    }


    /* ============================================================
       42 — ROUTER CONNECTION
       ============================================================ */

    function connectRouter() {

        const router =
            getRouter();


        if (!router) {

            state.connections.router =
                false;

            return false;

        }


        state.connections.router =
            true;


        try {

            if (
                hasMethod(
                    router,
                    "setRegistry"
                )
            ) {

                router.setRegistry(
                    api
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "Router Connection"
            );

        }


        return true;

    }


    /* ============================================================
       43 — WINDOW MANAGER CONNECTION
       ============================================================ */

    function connectWindowManager() {

        const manager =
            getWindowManager();


        if (!manager) {

            state.connections.windowManager =
                false;

            return false;

        }


        state.connections.windowManager =
            true;


        try {

            if (
                hasMethod(
                    manager,
                    "setAppRegistry"
                )
            ) {

                manager.setAppRegistry(
                    api
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "Window Manager Connection"
            );

        }


        return true;

    }


    /* ============================================================
       44 — FULL SERVICE CONNECTION
       ============================================================ */

    function connectServices() {

        refreshConnections();

        connectSystem();

        connectAppManager();

        connectRouter();

        connectWindowManager();

        connectAppContract();


        return getConnectionStatus();

    }


    /* ============================================================
       45 — INITIALIZATION
       ============================================================ */

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


        try {

            /*
             * Zuerst vorhandene Services verbinden.
             */

            connectServices();


            /*
             * Bereits gespeicherte Registry-Daten
             * vorsichtig laden.
             */

            load();


            /*
             * Kategorieindex neu erstellen.
             */

            rebuildCategoryIndex();


            /*
             * Services erneut verbinden, da Storage/
             * Kernel/Manager ggf. während des Bootvorgangs
             * verfügbar geworden sind.
             */

            connectServices();


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

        } catch (exception) {

            state.initializing =
                false;

            state.failed =
                true;


            reportError(
                exception,
                "Registry Initialisierung"
            );


            throw exception;

        }

    }


    /* ============================================================
       46 — BOOT
       ============================================================ */

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
                        "Registry Boot"
                    );

                }
            );

    }


    /* ============================================================
       47 — PUBLIC INITIALIZE
       ============================================================ */

    api.initialize =
        initialize;


    api.boot =
        boot;


    /* ============================================================
       48 — DOM START
       ============================================================ */

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


    /* ============================================================
       49 — FINAL GLOBAL REFERENCES
       ============================================================ */

    HalDoOS.appRegistry =
        api;

    window.HalDoAppRegistry =
        api;

    window.HalDoOSAppRegistry =
        api;


    /*
     * Optionaler zentraler Service-Eintrag.
     *
     * Andere Module können dadurch später erkennen,
     * dass die Registry vorhanden ist.
     */

    HalDoOS.services =
        HalDoOS.services || {};

    HalDoOS.services.appRegistry =
        api;


    /* ============================================================
       END
       HALDO AI OS 20 APPLICATION REGISTRY
       ============================================================ */

})(window, document);
