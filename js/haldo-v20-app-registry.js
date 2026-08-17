/*
 * ============================================================
 * HalDo AI OS 20
 * V20 Universal App Registry
 * ============================================================
 *
 * Datei:
 *   js/haldo-v20-app-registry.js
 *
 * Aufgabe:
 *   Zentrale Verwaltung aller V20-Apps.
 *
 *   - registrieren
 *   - aktivieren/deaktivieren
 *   - suchen
 *   - Kategorien
 *   - Berechtigungen
 *   - Abhängigkeiten
 *   - App-Metadaten
 *   - Events
 *
 * Bestehende app-registry.js wird NICHT ersetzt.
 * Diese Schicht arbeitet zunächst zusätzlich.
 * ============================================================
 */

(function (window, document) {
    "use strict";

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};

    const V20 =
        window.HalDoV20 ||
        null;


    /* ---------------------------------------------------------
       REGISTRY
    --------------------------------------------------------- */

    const Registry = {

        name: "HalDo V20 App Registry",

        version: "20.0.0",

        ready: false,

        apps: new Map(),

        categories: new Map(),

        listeners: new Map()
    };


    /* ---------------------------------------------------------
       EVENT SYSTEM
    --------------------------------------------------------- */

    Registry.on = function (
        eventName,
        callback
    ) {

        if (
            typeof eventName !== "string" ||
            typeof callback !== "function"
        ) {
            return function () {};
        }

        if (
            !Registry.listeners.has(eventName)
        ) {
            Registry.listeners.set(
                eventName,
                new Set()
            );
        }

        const listeners =
            Registry.listeners.get(eventName);

        listeners.add(callback);

        return function () {
            listeners.delete(callback);
        };
    };


    Registry.emit = function (
        eventName,
        detail
    ) {

        const listeners =
            Registry.listeners.get(eventName);

        if (listeners) {

            listeners.forEach(
                function (callback) {

                    try {

                        callback({
                            name: eventName,
                            detail:
                                detail || {},
                            timestamp:
                                Date.now()
                        });

                    } catch (error) {

                        console.error(
                            "[HalDo Registry]",
                            error
                        );
                    }
                }
            );
        }


        if (
            V20 &&
            typeof V20.emit ===
            "function"
        ) {

            V20.emit(
                "registry:" + eventName,
                detail || {}
            );
        }
    };


    /* ---------------------------------------------------------
       NORMALIZE APP
    --------------------------------------------------------- */

    Registry.normalize = function (
        definition
    ) {

        definition =
            definition || {};

        const id = String(
            definition.id ||
            definition.appId ||
            definition.name ||
            ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );

        if (!id) {

            throw new Error(
                "HalDo V20 Registry: " +
                "App ID fehlt."
            );
        }


        return {

            id: id,

            name:
                definition.name ||
                id,

            version:
                definition.version ||
                "20.0.0",

            category:
                definition.category ||
                "other",

            icon:
                definition.icon ||
                "◈",

            description:
                definition.description ||
                "",

            enabled:
                definition.enabled !== false,

            system:
                definition.system === true,

            experimental:
                definition.experimental === true,

            permissions:
                Array.isArray(
                    definition.permissions
                )
                    ? definition.permissions
                    : [],

            dependencies:
                Array.isArray(
                    definition.dependencies
                )
                    ? definition.dependencies
                    : [],

            capabilities:
                Array.isArray(
                    definition.capabilities
                )
                    ? definition.capabilities
                    : [],

            keywords:
                Array.isArray(
                    definition.keywords
                )
                    ? definition.keywords
                    : [],

            iconType:
                definition.iconType ||
                "emoji",

            launchMode:
                definition.launchMode ||
                "window",

            createdAt:
                definition.createdAt ||
                Date.now(),

            metadata:
                definition.metadata ||
                {},

            instance:
                definition.instance ||
                null
        };
    };


    /* ---------------------------------------------------------
       REGISTER
    --------------------------------------------------------- */

    Registry.register = function (
        definition
    ) {

        const app =
            Registry.normalize(
                definition
            );

        const existing =
            Registry.apps.get(
                app.id
            );


        /*
         * Aktualisierung einer bestehenden App
         */

        if (existing) {

            const updated =
                Object.assign(
                    {},
                    existing,
                    app,
                    {
                        updatedAt:
                            Date.now()
                    }
                );

            Registry.apps.set(
                app.id,
                updated
            );

            Registry.addToCategory(
                updated
            );

            Registry.emit(
                "updated",
                {
                    app: updated
                }
            );

            return updated;
        }


        /*
         * Neue App
         */

        Registry.apps.set(
            app.id,
            app
        );

        Registry.addToCategory(
            app
        );

        Registry.emit(
            "registered",
            {
                app: app
            }
        );

        return app;
    };


    /* ---------------------------------------------------------
       BULK REGISTER
    --------------------------------------------------------- */

    Registry.registerMany = function (
        definitions
    ) {

        if (
            !Array.isArray(definitions)
        ) {
            return [];
        }

        const registered = [];

        definitions.forEach(
            function (definition) {

                try {

                    registered.push(
                        Registry.register(
                            definition
                        )
                    );

                } catch (error) {

                    console.error(
                        "[HalDo Registry] " +
                        "Registration failed:",
                        error
                    );
                }
            }
        );

        return registered;
    };


    /* ---------------------------------------------------------
       CATEGORY
    --------------------------------------------------------- */

    Registry.addToCategory = function (
        app
    ) {

        if (
            !Registry.categories.has(
                app.category
            )
        ) {

            Registry.categories.set(
                app.category,
                new Set()
            );
        }

        Registry.categories
            .get(app.category)
            .add(app.id);
    };


    Registry.getCategory = function (
        category
    ) {

        const ids =
            Registry.categories.get(
                String(category)
            );

        if (!ids) {
            return [];
        }

        return Array.from(ids)
            .map(function (id) {
                return Registry.apps.get(id);
            })
            .filter(Boolean);
    };


    Registry.getCategories = function () {

        return Array.from(
            Registry.categories.keys()
        );
    };


    /* ---------------------------------------------------------
       GET APP
    --------------------------------------------------------- */

    Registry.get = function (
        id
    ) {

        if (!id) {
            return null;
        }

        return Registry.apps.get(
            String(id)
                .trim()
                .toLowerCase()
                .replace(
                    /\s+/g,
                    "-"
                )
        ) || null;
    };


    /* ---------------------------------------------------------
       ALL APPS
    --------------------------------------------------------- */

    Registry.getAll = function () {

        return Array.from(
            Registry.apps.values()
        );
    };


    /* ---------------------------------------------------------
       SEARCH
    --------------------------------------------------------- */

    Registry.search = function (
        query
    ) {

        query =
            String(query || "")
                .trim()
                .toLowerCase();

        if (!query) {
            return Registry.getAll();
        }

        return Registry.getAll()
            .filter(function (app) {

                const text = [
                    app.id,
                    app.name,
                    app.description,
                    app.category
                ]
                .concat(
                    app.keywords || []
                )
                .join(" ")
                .toLowerCase();

                return text.indexOf(
                    query
                ) !== -1;
            });
    };


    /* ---------------------------------------------------------
       ENABLE / DISABLE
    --------------------------------------------------------- */

    Registry.enable = function (
        id
    ) {

        const app =
            Registry.get(id);

        if (!app) {
            return false;
        }

        app.enabled = true;

        Registry.emit(
            "enabled",
            {
                app: app
            }
        );

        return true;
    };


    Registry.disable = function (
        id
    ) {

        const app =
            Registry.get(id);

        if (!app) {
            return false;
        }

        /*
         * System-Apps werden nicht
         * versehentlich deaktiviert.
         */

        if (app.system) {

            Registry.emit(
                "disable-blocked",
                {
                    app: app
                }
            );

            return false;
        }

        app.enabled = false;

        Registry.emit(
            "disabled",
            {
                app: app
            }
        );

        return true;
    };


    /* ---------------------------------------------------------
       PERMISSIONS
    --------------------------------------------------------- */

    Registry.hasPermission = function (
        id,
        permission
    ) {

        const app =
            Registry.get(id);

        if (!app) {
            return false;
        }

        return (
            app.permissions ||
            []
        ).indexOf(
            permission
        ) !== -1;
    };


    Registry.grantPermission = function (
        id,
        permission
    ) {

        const app =
            Registry.get(id);

        if (!app || !permission) {
            return false;
        }

        if (
            !Array.isArray(
                app.permissions
            )
        ) {
            app.permissions = [];
        }

        if (
            app.permissions.indexOf(
                permission
            ) === -1
        ) {

            app.permissions.push(
                permission
            );
        }

        Registry.emit(
            "permission-granted",
            {
                app: app,
                permission:
                    permission
            }
        );

        return true;
    };


    Registry.revokePermission = function (
        id,
        permission
    ) {

        const app =
            Registry.get(id);

        if (!app) {
            return false;
        }

        app.permissions =
            (
                app.permissions ||
                []
            ).filter(
                function (item) {
                    return item !== permission;
                }
            );

        Registry.emit(
            "permission-revoked",
            {
                app: app,
                permission:
                    permission
            }
        );

        return true;
    };


    /* ---------------------------------------------------------
       DEPENDENCY CHECK
    --------------------------------------------------------- */

    Registry.checkDependencies = function (
        id
    ) {

        const app =
            Registry.get(id);

        if (!app) {

            return {
                valid: false,
                missing: []
            };
        }

        const missing = [];

        (
            app.dependencies ||
            []
        ).forEach(
            function (dependency) {

                if (
                    !Registry.get(
                        dependency
                    )
                ) {
                    missing.push(
                        dependency
                    );
                }
            }
        );

        return {

            valid:
                missing.length === 0,

            missing:
                missing
        };
    };


    /* ---------------------------------------------------------
       REMOVE
    --------------------------------------------------------- */

    Registry.unregister = function (
        id
    ) {

        const app =
            Registry.get(id);

        if (!app) {
            return false;
        }

        if (app.system) {

            console.warn(
                "[HalDo Registry] " +
                "System-App darf nicht " +
                "entfernt werden:",
                id
            );

            return false;
        }

        Registry.apps.delete(
            app.id
        );

        if (
            Registry.categories.has(
                app.category
            )
        ) {

            Registry.categories
                .get(app.category)
                .delete(app.id);
        }

        Registry.emit(
            "unregistered",
            {
                app: app
            }
        );

        return true;
    };


    /* ---------------------------------------------------------
       STATUS
    --------------------------------------------------------- */

    Registry.getStatus = function () {

        return {

            name:
                Registry.name,

            version:
                Registry.version,

            ready:
                Registry.ready,

            appCount:
                Registry.apps.size,

            categoryCount:
                Registry.categories.size,

            categories:
                Registry.getCategories(),

            timestamp:
                Date.now()
        };
    };


    /* ---------------------------------------------------------
       INITIALIZE
    --------------------------------------------------------- */

    Registry.init = function () {

        if (Registry.ready) {
            return Registry;
        }

        Registry.ready = true;

        Registry.emit(
            "ready",
            Registry.getStatus()
        );

        console.log(
            "%c[HalDo AI OS 20]",
            "font-weight:bold;",
            "Universal App Registry bereit."
        );

        return Registry;
    };


    /* ---------------------------------------------------------
       GLOBAL API
    --------------------------------------------------------- */

    window.HalDoV20AppRegistry =
        Registry;

    HalDoOS.v20AppRegistry =
        Registry;


    /* ---------------------------------------------------------
       START
    --------------------------------------------------------- */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {
                Registry.init();
            },
            {
                once: true
            }
        );

    } else {

        Registry.init();
    }


})(window, document);