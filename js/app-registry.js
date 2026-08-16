/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
       js/app-registry.js

   ZENTRALE APPLICATION REGISTRY

   HALDO AI OS 18 → 20 UPGRADE

   Aufgaben:
   - vollständige App-Registrierung
   - App-Contract-Unterstützung
   - App-Metadaten
   - App-Versionen
   - Kategorien
   - Tags / Keywords
   - Dependencies
   - Permissions
   - Features
   - App Settings
   - App States
   - Enable / Disable
   - Suche
   - Kategorien
   - Events
   - Kernel-Verbindung
   - System-Verbindung
   - App-Manager-Verbindung
   - Router-Verbindung
   - Window-Manager-Verbindung
   - AI-/Language-Kompatibilität
   - Diagnostics
   - Health Check
   - sichere Erweiterbarkeit

   WICHTIG:
   Diese Datei arbeitet mit:

       js/app-contract.js
       js/app-manager.js
       js/app-router.js
       js/window-manager.js
       js/kernel.js
       js/system.js

   Bestehende Apps werden nicht automatisch entfernt.
   Neue Apps können jederzeit hinzugefügt werden.

   ============================================================ */

"use strict";

(function (window, document) {

    /* ========================================================
       01 — HALDO FOUNDATION
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
        "HalDo AI OS Application Registry";


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

        apps:
            new Map(),

        categories:
            new Map(),

        listeners:
            new Map(),

        disabled:
            new Set(),

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

            searches:
                0,

            errors:
                0

        },

        connections: {

            kernel:
                false,

            system:
                false,

            appManager:
                false,

            router:
                false,

            windowManager:
                false,

            contract:
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

                    if (
                        typeof value[key] ===
                        "function"
                    ) {

                        result[key] =
                            value[key];

                    } else {

                        result[key] =
                            clone(
                                value[key]
                            );

                    }

                }
            );

            return result;

        }


        return value;

    }


    function normalizeArray(
        value
    ) {

        if (
            Array.isArray(
                value
            )
        ) {

            return value
                .filter(
                    item =>
                        item !==
                        null &&
                        item !==
                        undefined
                )
                .map(
                    item =>
                        typeof item ===
                        "string"
                            ? item.trim()
                            : item
                )
                .filter(
                    Boolean
                );

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


    function getContract() {

        return (
            window.HalDoAppContract ||
            HalDoOS.appContract ||
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
                            "Event: " +
                            event
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
                Date.now()

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
       09 — APP NORMALIZATION
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
                "Ungültige App-Definition."
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
                "App benötigt eine eindeutige ID."
            );

        }


        const normalized = {

            ...source,


            /* Identity */

            id:
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


            /* Version */

            version:
                source.version ||
                VERSION,


            platform:
                source.platform ||
                "HalDo AI OS",


            osVersion:
                source.osVersion ||
                "20",


            /* Presentation */

            icon:
                source.icon ||
                "◈",

            description:
                source.description ||
                "",

            category:
                source.category ||
                "system",


            /* Search */

            tags:
                normalizeArray(
                    source.tags
                ),

            keywords:
                normalizeArray(
                    source.keywords
                ),


            /* Runtime */

            enabled:
                source.enabled !==
                false,

            singleton:
                source.singleton !==
                false,


            /* Navigation */

            route:
                source.route ||
                "/app/" +
                id,


            /* Dependencies */

            dependencies:
                normalizeArray(
                    source.dependencies
                ),


            optionalDependencies:
                normalizeArray(
                    source.optionalDependencies
                ),


            /* Permissions */

            permissions:
                normalizeArray(
                    source.permissions
                ),


            /* Features */

            features:
                normalizeArray(
                    source.features
                ),


            /* Languages */

            languages:
                normalizeArray(
                    source.languages
                ),


            /* AI */

            aiEnabled:
                source.aiEnabled !==
                false,


            aiFeatures:
                normalizeArray(
                    source.aiFeatures
                ),


            /* Storage */

            storage:
                source.storage ||
                {
                    enabled:
                        true,

                    persistent:
                        true,

                    namespace:
                        "haldo.app." +
                        id

                },


            /* Window */

            window:
                source.window ||
                {
                    enabled:
                        true
                },


            /* Metadata */

            author:
                source.author ||
                "HalDo",

            createdAt:
                source.createdAt ||
                Date.now(),

            updatedAt:
                Date.now()

        };


        return normalized;

    }


    /* ========================================================
       10 — CONTRACT VALIDATION
       ======================================================== */

    function validateContract(
        app
    ) {

        const contract =
            getContract();


        if (
            contract &&
            hasMethod(
                contract,
                "validate"
            )
        ) {

            try {

                const result =
                    contract.validate(
                        app
                    );


                state.connections.contract =
                    true;


                return result;

            } catch (exception) {

                reportError(
                    exception,
                    "App Contract Validation"
                );


                return {

                    valid:
                        false,

                    errors: [
                        exception.message
                    ]

                };

            }

        }


        state.connections.contract =
            false;


        const errors = [];


        if (!app.id) {

            errors.push(
                "App ID fehlt."
            );

        }


        if (!app.name) {

            errors.push(
                "App Name fehlt."
            );

        }


        if (!app.version) {

            errors.push(
                "App Version fehlt."
            );

        }


        return {

            valid:
                errors.length ===
                0,

            errors:
                errors

        };

    }


    /* ========================================================
       11 — CATEGORY INDEX
       ======================================================== */

    function indexCategory(
        app
    ) {

        const category =
            String(
                app.category ||
                "system"
            )
            .trim()
            .toLowerCase();


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


    function rebuildCategories() {

        state.categories.clear();


        state.apps.forEach(
            app => {

                indexCategory(
                    app
                );

            }
        );

    }


    /* ========================================================
       12 — REGISTER
       ======================================================== */

    function register(
        definition,
        options = {}
    ) {

        try {

            const app =
                normalizeDefinition(
                    definition
                );


            const validation =
                validateContract(
                    app
                );


            if (
                validation &&
                validation.valid ===
                false
            ) {

                throw new Error(
                    (
                        validation.errors ||
                        [
                            "App Contract ungültig."
                        ]
                    ).join(
                        " "
                    )
                );

            }


            const exists =
                state.apps.has(
                    app.id
                );


            if (
                exists &&
                options.overwrite !==
                true
            ) {

                /*
                 * Bereits registrierte App:
                 * sichere Aktualisierung nur wenn
                 * ausdrücklich erlaubt.
                 */

                return update(
                    app.id,
                    app
                );

            }


            state.apps.set(
                app.id,
                app
            );


            if (
                app.enabled ===
                false
            ) {

                state.disabled.add(
                    app.id
                );

            } else {

                state.disabled.delete(
                    app.id
                );

            }


            indexCategory(
                app
            );


            if (exists) {

                state.statistics.updated +=
                    1;

                emit(
                    "updated",
                    {
                        app:
                            clone(
                                app
                            )
                    }
                );

            } else {

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

            }


            log(
                "App registriert:",
                app.id,
                app.version
            );


            return app;

        } catch (exception) {

            reportError(
                exception,
                "App Registrierung"
            );


            return null;

        }

    }


    function registerApp(
        definition,
        options
    ) {

        return register(
            definition,
            options
        );

    }


    /* ========================================================
       13 — UPDATE
       ======================================================== */

    function update(
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
            state.apps.get(
                id
            );


        if (!current) {

            return register(
                {
                    ...changes,
                    id:
                        id
                }
            );

        }


        try {

            const next =
                normalizeDefinition(
                    {
                        ...current,
                        ...changes,
                        id:
                            id
                    }
                );


            const validation =
                validateContract(
                    next
                );


            if (
                validation &&
                validation.valid ===
                false
            ) {

                throw new Error(
                    (
                        validation.errors ||
                        []
                    ).join(
                        " "
                    )
                );

            }


            state.apps.set(
                id,
                next
            );


            if (
                next.enabled ===
                false
            ) {

                state.disabled.add(
                    id
                );

            } else {

                state.disabled.delete(
                    id
                );

            }


            rebuildCategories();


            state.statistics.updated +=
                1;


            emit(
                "updated",
                {
                    app:
                        clone(
                            next
                        )
                }
            );


            return next;

        } catch (exception) {

            reportError(
                exception,
                "App Aktualisierung"
            );


            return null;

        }

    }


    function updateApp(
        appId,
        changes
    ) {

        return update(
            appId,
            changes
        );

    }


    /* ========================================================
       14 — REMOVE
       ======================================================== */

    function remove(
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
            !state.apps.has(
                id
            )
        ) {

            return false;

        }


        const app =
            state.apps.get(
                id
            );


        state.apps.delete(
            id
        );


        state.disabled.delete(
            id
        );


        rebuildCategories();


        state.statistics.removed +=
            1;


        emit(
            "removed",
            {
                app:
                    clone(
                        app
                    )
            }
        );


        return true;

    }


    function unregister(
        appId
    ) {

        return remove(
            appId
        );

    }


    /* ========================================================
       15 — GET
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


        return (
            state.apps.get(
                id
            ) ||
            null
        );

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
       16 — GET ALL
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


    /* ========================================================
       17 — ENABLE
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


        app.enabled =
            true;


        app.updatedAt =
            Date.now();


        state.disabled.delete(
            id
        );


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


        return true;

    }


    /* ========================================================
       18 — DISABLE
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


        app.enabled =
            false;


        app.updatedAt =
            Date.now();


        state.disabled.add(
            id
        );


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


    function isEnabled(
        appId
    ) {

        const app =
            get(
                appId
            );


        return !!(
            app &&
            app.enabled !==
            false
        );

    }


    /* ========================================================
       19 — CATEGORY
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


        return getAll()
            .filter(
                app =>
                    String(
                        app.category ||
                        ""
                    )
                    .toLowerCase() ===
                    value
            );

    }


    function getCategories() {

        return Array.from(
            state.categories.keys()
        );

    }


    /* ========================================================
       20 — SEARCH
       ======================================================== */

    function search(
        query,
        options = {}
    ) {

        state.statistics.searches +=
            1;


        const value =
            String(
                query ||
                ""
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

                            ...(
                                app.tags ||
                                []
                            ),

                            ...(
                                app.keywords ||
                                []
                            )

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


        if (
            options.category
        ) {

            const category =
                String(
                    options.category
                )
                .toLowerCase();


            results =
                results.filter(
                    app =>
                        String(
                            app.category ||
                            ""
                        )
                        .toLowerCase() ===
                        category
                );

        }


        if (
            options.enabled ===
            true
        ) {

            results =
                results.filter(
                    app =>
                        app.enabled !==
                        false
                );

        }


        if (
            options.enabled ===
            false
        ) {

            results =
                results.filter(
                    app =>
                        app.enabled ===
                        false
                );

        }


        return results;

    }


    /* ========================================================
       21 — DEPENDENCIES
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
                    []

            };

        }


        const dependencies =
            normalizeArray(
                app.dependencies
            );


        const missing = [];

        const disabled = [];


        dependencies.forEach(
            dependency => {

                const id =
                    normalizeId(
                        dependency
                    );


                const dependencyApp =
                    get(
                        id
                    );


                if (!dependencyApp) {

                    missing.push(
                        id
                    );

                    return;

                }


                if (
                    dependencyApp.enabled ===
                    false
                ) {

                    disabled.push(
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
                0,

            missing:
                missing,

            disabled:
                disabled

        };

    }


    /* ========================================================
       22 — OPTIONAL DEPENDENCIES
       ======================================================== */

    function getOptionalDependencies(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return [];

        }


        return normalizeArray(
            app.optionalDependencies
        );

    }


    /* ========================================================
       23 — PERMISSIONS
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


        return normalizeArray(
            app.permissions
        );

    }


    function hasPermission(
        appId,
        permission
    ) {

        const permissions =
            getPermissions(
                appId
            );


        return permissions.includes(
            permission
        );

    }


    /* ========================================================
       24 — FEATURES
       ======================================================== */

    function getFeatures(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return [];

        }


        return normalizeArray(
            app.features
        );

    }


    function hasFeature(
        appId,
        feature
    ) {

        return getFeatures(
            appId
        )
        .includes(
            feature
        );

    }


    /* ========================================================
       25 — LANGUAGE SUPPORT
       ======================================================== */

    function getLanguages(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return [];

        }


        return normalizeArray(
            app.languages
        );

    }


    /* ========================================================
       26 — AI SUPPORT
       ======================================================== */

    function getAICapabilities(
        appId
    ) {

        const app =
            get(
                appId
            );


        if (!app) {

            return {

                enabled:
                    false,

                features:
                    []

            };

        }


        return {

            enabled:
                app.aiEnabled !==
                false,

            features:
                normalizeArray(
                    app.aiFeatures
                )

        };

    }


    /* ========================================================
       27 — APP MANAGER CONNECTION
       ======================================================== */

    function notifyAppManager(
        event,
        app
    ) {

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
                    "emit"
                )
            ) {

                manager.emit(
                    "registry-" +
                    event,
                    {
                        app:
                            clone(
                                app
                            )
                    }
                );

            }


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Manager Verbindung"
            );


            return false;

        }

    }


    /* ========================================================
       28 — ROUTER CONNECTION
       ======================================================== */

    function getAppRoute(
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
            app.route ||
            "/app/" +
            app.id
        );

    }


    /* ========================================================
       29 — WINDOW INFORMATION
       ======================================================== */

    function getWindowConfiguration(
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

            appId:
                app.id,

            title:
                app.title ||
                app.name,

            icon:
                app.icon,

            singleton:
                app.singleton !==
                false,

            ...(app.window || {})

        };

    }


    /* ========================================================
       30 — COUNTS
       ======================================================== */

    function getCount() {

        return state.apps.size;

    }


    function getEnabledCount() {

        return getAll()
            .filter(
                app =>
                    app.enabled !==
                    false
            )
            .length;

    }


    function getDisabledCount() {

        return getAll()
            .filter(
                app =>
                    app.enabled ===
                    false
            )
            .length;

    }


    /* ========================================================
       31 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        const apps =
            getAll();


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


            counts: {

                total:
                    apps.length,

                enabled:
                    getEnabledCount(),

                disabled:
                    getDisabledCount(),

                categories:
                    getCategories()
                        .length

            },


            connections: {

                kernel:
                    !!getKernel(),

                system:
                    !!getSystem(),

                appManager:
                    !!getAppManager(),

                router:
                    !!getRouter(),

                windowManager:
                    !!getWindowManager(),

                contract:
                    !!getContract()

            },


            statistics:
                {
                    ...state.statistics
                },


            categories:
                getCategories(),


            apps:
                apps.map(
                    app => ({

                        id:
                            app.id,

                        name:
                            app.name,

                        version:
                            app.version,

                        category:
                            app.category,

                        enabled:
                            app.enabled !==
                            false,

                        dependencies:
                            checkDependencies(
                                app.id
                            ),

                        aiEnabled:
                            app.aiEnabled !==
                            false

                    })
                ),


            timestamp:
                new Date()
                    .toISOString()

        };

    }


    /* ========================================================
       32 — HEALTH CHECK
       ======================================================== */

    function healthCheck() {

        const problems = [];


        if (!getKernel()) {

            problems.push(
                "Kernel nicht verbunden."
            );

        }


        if (!getSystem()) {

            problems.push(
                "System nicht verbunden."
            );

        }


        if (!getAppManager()) {

            problems.push(
                "App Manager nicht verbunden."
            );

        }


        const brokenDependencies =
            [];


        getAll().forEach(
            app => {

                const result =
                    checkDependencies(
                        app.id
                    );


                if (
                    !result.valid
                ) {

                    brokenDependencies.push(
                        {
                            appId:
                                app.id,

                            missing:
                                result.missing,

                            disabled:
                                result.disabled
                        }
                    );

                }

            }
        );


        return {

            healthy:
                problems.length ===
                0 &&
                brokenDependencies.length ===
                0,

            problems:
                problems,

            brokenDependencies:
                brokenDependencies,

            appCount:
                getCount(),

            enabledCount:
                getEnabledCount(),

            disabledCount:
                getDisabledCount(),

            timestamp:
                new Date()
                    .toISOString()

        };

    }


    /* ========================================================
       33 — CONNECTION STATUS
       ======================================================== */

    function refreshConnections() {

        state.connections.kernel =
            !!getKernel();

        state.connections.system =
            !!getSystem();

        state.connections.appManager =
            !!getAppManager();

        state.connections.router =
            !!getRouter();

        state.connections.windowManager =
            !!getWindowManager();

        state.connections.contract =
            !!getContract();


        return {
            ...state.connections
        };

    }


    function getConnectionStatus() {

        return {

            kernel:
                !!getKernel(),

            system:
                !!getSystem(),

            appManager:
                !!getAppManager(),

            router:
                !!getRouter(),

            windowManager:
                !!getWindowManager(),

            contract:
                !!getContract()

        };

    }


    /* ========================================================
       34 — KERNEL CONNECTION
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
                "Kernel Verbindung"
            );


            return false;

        }

    }


    /* ========================================================
       35 — KERNEL EVENTS
       ======================================================== */

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


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Kernel Events"
            );


            return false;

        }

    }


    /* ========================================================
       36 — PUBLIC API
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

                    enabledCount:
                        getEnabledCount(),

                    disabledCount:
                        getDisabledCount(),

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

        update:
            update,

        updateApp:
            updateApp,

        remove:
            remove,

        unregister:
            unregister,


        /* Access */

        get:
            get,

        getApp:
            getApp,

        getAll:
            getAll,

        getApps:
            getApps,

        has:
            has,


        /* Enable */

        enable:
            enable,

        disable:
            disable,

        isEnabled:
            isEnabled,


        /* Categories */

        getByCategory:
            getByCategory,

        getCategories:
            getCategories,


        /* Search */

        search:
            search,


        /* Dependencies */

        checkDependencies:
            checkDependencies,

        getOptionalDependencies:
            getOptionalDependencies,


        /* Permissions */

        getPermissions:
            getPermissions,

        hasPermission:
            hasPermission,


        /* Features */

        getFeatures:
            getFeatures,

        hasFeature:
            hasFeature,


        /* Languages */

        getLanguages:
            getLanguages,


        /* AI */

        getAICapabilities:
            getAICapabilities,


        /* Navigation */

        getAppRoute:
            getAppRoute,


        /* Window */

        getWindowConfiguration:
            getWindowConfiguration,


        /* Counts */

        getCount:
            getCount,

        getEnabledCount:
            getEnabledCount,

        getDisabledCount:
            getDisabledCount,


        /* Connections */

        connectKernel:
            connectKernel,

        refreshConnections:
            refreshConnections,

        getConnectionStatus:
            getConnectionStatus,


        /* Diagnostics */

        diagnostics:
            diagnostics,

        healthCheck:
            healthCheck,


        /* Error */

        reportError:
            reportError

    };


    /* ========================================================
       37 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppRegistry =
        api;

    window.HalDoOSAppRegistry =
        api;

    HalDoOS.appRegistry =
        api;


    /* ========================================================
       38 — INITIALIZATION
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

        connectKernelEvents();


        /*
         * Kategorien neu aufbauen.
         */

        rebuildCategories();


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
            "Application Registry bereit.",
            VERSION,
            "Apps:",
            getCount()
        );


        return api;

    }


    /* ========================================================
       39 — BOOT
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
       40 — DOM START
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
       41 — FINAL EXPORT
       ======================================================== */

    HalDoOS.appRegistry =
        api;

    window.HalDoAppRegistry =
        api;

    window.HalDoOSAppRegistry =
        api;


    /* ========================================================
       END
       HALDO AI OS 20 APPLICATION REGISTRY
       ======================================================== */

})(window, document);