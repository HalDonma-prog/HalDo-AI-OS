/*
========================================================
HalDo AI OS 18
Application Registry
Professional Ultimate Foundation
========================================================

Zentrale App-Datenbank des HalDo AI OS.

Verbindung:

App Registry
      ↓
App Manager
      ↓
App Router
      ↓
Launcher
      ↓
Benutzeroberfläche

Funktionen:
- Apps registrieren
- Apps aktualisieren
- Apps entfernen
- Apps suchen
- Kategorien
- Aktiv / Inaktiv
- Installiert / Nicht installiert
- App-Metadaten
- Manifest-Verwaltung
- Events
- Diagnose
- Export / Import
- Erweiterbare Foundation

Bestehende globale API:
window.HalDoAppRegistry
window.HalDoOS.appRegistry
========================================================
*/

(function () {
    "use strict";

    const VERSION = "18.0.0";

    const registry = new Map();

    const listeners = new Map();

    const errors = [];

    let initialized = false;

    /* ==================================================
       EVENTS
    ================================================== */

    function on(event, callback) {
        if (typeof callback !== "function") {
            return () => {};
        }

        if (!listeners.has(event)) {
            listeners.set(
                event,
                new Set()
            );
        }

        listeners
            .get(event)
            .add(callback);

        return () => {
            off(event, callback);
        };
    }

    function off(event, callback) {
        const set =
            listeners.get(event);

        if (!set) {
            return;
        }

        set.delete(callback);

        if (set.size === 0) {
            listeners.delete(event);
        }
    }

    function emit(event, payload = {}) {
        const set =
            listeners.get(event);

        if (!set) {
            return;
        }

        set.forEach(callback => {
            try {
                callback(payload);
            } catch (error) {
                recordError(
                    error,
                    `event:${event}`
                );
            }
        });
    }

    /* ==================================================
       ERROR HANDLING
    ================================================== */

    function recordError(
        error,
        source = "app-registry"
    ) {
        const entry = {
            time:
                new Date().toISOString(),

            source,

            message:
                error instanceof Error
                    ? error.message
                    : String(error)
        };

        errors.push(entry);

        if (errors.length > 100) {
            errors.shift();
        }

        console.error(
            `[HalDo App Registry] ${source}`,
            error
        );

        emit(
            "error",
            entry
        );

        return entry;
    }

    /* ==================================================
       NORMALIZE MANIFEST
    ================================================== */

    function normalize(manifest) {
        if (
            !manifest ||
            typeof manifest !== "object"
        ) {
            return null;
        }

        const id =
            String(
                manifest.id ||
                manifest.appId ||
                manifest.name ||
                ""
            ).trim();

        if (!id) {
            return null;
        }

        return {
            id,

            name:
                String(
                    manifest.name ||
                    id
                ),

            title:
                String(
                    manifest.title ||
                    manifest.name ||
                    id
                ),

            version:
                String(
                    manifest.version ||
                    VERSION
                ),

            description:
                String(
                    manifest.description ||
                    ""
                ),

            icon:
                String(
                    manifest.icon ||
                    ""
                ),

            category:
                String(
                    manifest.category ||
                    "system"
                ),

            path:
                manifest.path ||
                manifest.url ||
                null,

            route:
                manifest.route ||
                null,

            module:
                manifest.module ||
                null,

            enabled:
                manifest.enabled !== false,

            installed:
                manifest.installed !== false,

            permissions:
                Array.isArray(
                    manifest.permissions
                )
                    ? [
                        ...manifest.permissions
                    ]
                    : [],

            dependencies:
                Array.isArray(
                    manifest.dependencies
                )
                    ? [
                        ...manifest.dependencies
                    ]
                    : [],

            keywords:
                Array.isArray(
                    manifest.keywords
                )
                    ? [
                        ...manifest.keywords
                    ]
                    : [],

            metadata:
                manifest.metadata &&
                typeof manifest.metadata === "object"
                    ? {
                        ...manifest.metadata
                    }
                    : {},

            createdAt:
                manifest.createdAt ||
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()
        };
    }

    /* ==================================================
       REGISTER
    ================================================== */

    function register(manifest) {
        const app =
            normalize(manifest);

        if (!app) {
            recordError(
                "Ungültiges App-Manifest.",
                "register"
            );

            return false;
        }

        const exists =
            registry.has(app.id);

        registry.set(
            app.id,
            app
        );

        emit(
            exists
                ? "app:updated"
                : "app:registered",
            {
                app: get(app.id)
            }
        );

        return true;
    }

    /* ==================================================
       REGISTER MANY
    ================================================== */

    function registerMany(apps) {
        if (!Array.isArray(apps)) {
            return 0;
        }

        let count = 0;

        apps.forEach(app => {
            if (register(app)) {
                count++;
            }
        });

        return count;
    }

    /* ==================================================
       UPDATE
    ================================================== */

    function update(id, changes = {}) {
        if (!registry.has(id)) {
            return false;
        }

        const current =
            registry.get(id);

        const merged =
            normalize({
                ...current,
                ...changes,
                id
            });

        if (!merged) {
            return false;
        }

        registry.set(
            id,
            merged
        );

        emit(
            "app:updated",
            {
                app: get(id)
            }
        );

        return true;
    }

    /* ==================================================
       REMOVE
    ================================================== */

    function remove(id) {
        if (!registry.has(id)) {
            return false;
        }

        const app =
            get(id);

        registry.delete(id);

        emit(
            "app:removed",
            {
                app
            }
        );

        return true;
    }

    /* ==================================================
       GET
    ================================================== */

    function get(id) {
        const app =
            registry.get(id);

        if (!app) {
            return null;
        }

        return cloneApp(app);
    }

    /* ==================================================
       CLONE
    ================================================== */

    function cloneApp(app) {
        return {
            ...app,

            permissions:
                [
                    ...app.permissions
                ],

            dependencies:
                [
                    ...app.dependencies
                ],

            keywords:
                [
                    ...app.keywords
                ],

            metadata:
                {
                    ...app.metadata
                }
        };
    }

    /* ==================================================
       GET ALL
    ================================================== */

    function getAll() {
        return Array
            .from(
                registry.values()
            )
            .map(
                cloneApp
            );
    }

    /* ==================================================
       GET ENABLED
    ================================================== */

    function getEnabled() {
        return getAll()
            .filter(
                app =>
                    app.enabled
            );
    }

    /* ==================================================
       GET INSTALLED
    ================================================== */

    function getInstalled() {
        return getAll()
            .filter(
                app =>
                    app.installed
            );
    }

    /* ==================================================
       CATEGORY
    ================================================== */

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

        return getAll()
            .filter(
                app =>
                    app.category
                        .toLowerCase() ===
                    value
            );
    }

    /* ==================================================
       SEARCH
    ================================================== */

    function search(query) {
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
            .filter(app => {

                const searchable =
                    [
                        app.id,
                        app.name,
                        app.title,
                        app.description,
                        app.category,
                        ...app.keywords
                    ]
                    .join(" ")
                    .toLowerCase();

                return searchable.includes(
                    value
                );
            });
    }

    /* ==================================================
       EXISTS
    ================================================== */

    function has(id) {
        return registry.has(id);
    }

    /* ==================================================
       ENABLE
    ================================================== */

    function enable(id) {
        return update(
            id,
            {
                enabled: true
            }
        );
    }

    /* ==================================================
       DISABLE
    ================================================== */

    function disable(id) {
        return update(
            id,
            {
                enabled: false
            }
        );
    }

    /* ==================================================
       INSTALL
    ================================================== */

    function install(manifest) {
        const app =
            normalize({
                ...manifest,
                installed: true
            });

        if (!app) {
            return false;
        }

        registry.set(
            app.id,
            app
        );

        emit(
            "app:installed",
            {
                app: get(app.id)
            }
        );

        return true;
    }

    /* ==================================================
       UNINSTALL
    ================================================== */

    function uninstall(id) {
        const app =
            get(id);

        if (!app) {
            return false;
        }

        const updated =
            update(
                id,
                {
                    installed: false,
                    enabled: false
                }
            );

        if (updated) {
            emit(
                "app:uninstalled",
                {
                    app: get(id)
                }
            );
        }

        return updated;
    }

    /* ==================================================
       MANIFEST EXPORT
    ================================================== */

    function exportManifest(
        id
    ) {
        const app =
            get(id);

        if (!app) {
            return null;
        }

        return JSON.stringify(
            app,
            null,
            2
        );
    }

    /* ==================================================
       FULL EXPORT
    ================================================== */

    function exportAll() {
        return JSON.stringify(
            getAll(),
            null,
            2
        );
    }

    /* ==================================================
       IMPORT
    ================================================== */

    function importData(
        data
    ) {
        try {

            let parsed =
                data;

            if (
                typeof data ===
                "string"
            ) {
                parsed =
                    JSON.parse(data);
            }

            if (
                Array.isArray(
                    parsed
                )
            ) {
                return registerMany(
                    parsed
                );
            }

            if (
                parsed &&
                typeof parsed ===
                "object"
            ) {
                return register(
                    parsed
                )
                    ? 1
                    : 0;
            }

            return 0;

        } catch (error) {

            recordError(
                error,
                "import"
            );

            return 0;
        }
    }

    /* ==================================================
       FOUNDATION APPS
    ================================================== */

    function registerFoundationApps() {

        const apps = [

            {
                id:
                    "haldo-ai",

                name:
                    "HalDo AI",

                title:
                    "HalDo AI Gespräch",

                version:
                    VERSION,

                description:
                    "Zentrale HalDo AI Gesprächsoberfläche.",

                category:
                    "ai",

                path:
                    "chat.html",

                route:
                    "/chat",

                keywords:
                    [
                        "ai",
                        "chat",
                        "assistant",
                        "gespräch"
                    ]
            },

            {
                id:
                    "dashboard",

                name:
                    "Dashboard",

                title:
                    "HalDo Dashboard",

                version:
                    VERSION,

                description:
                    "Zentrale Systemübersicht.",

                category:
                    "system",

                path:
                    "dashboard.html",

                route:
                    "/dashboard",

                keywords:
                    [
                        "dashboard",
                        "system",
                        "status"
                    ]
            },

            {
                id:
                    "apps",

                name:
                    "Apps",

                title:
                    "HalDo Apps",

                version:
                    VERSION,

                description:
                    "Zentrale App-Verwaltung.",

                category:
                    "system",

                path:
                    "apps.html",

                route:
                    "/apps",

                keywords:
                    [
                        "apps",
                        "applications",
                        "programme"
                    ]
            },

            {
                id:
                    "settings",

                name:
                    "Einstellungen",

                title:
                    "HalDo Einstellungen",

                version:
                    VERSION,

                description:
                    "System- und Benutzerkonfiguration.",

                category:
                    "system",

                path:
                    "settings.html",

                route:
                    "/settings",

                keywords:
                    [
                        "settings",
                        "einstellungen",
                        "config"
                    ]
            },

            {
                id:
                    "knowledge",

                name:
                    "Wissen",

                title:
                    "HalDo Knowledge",

                version:
                    VERSION,

                description:
                    "Wissens- und Lernsystem.",

                category:
                    "ai",

                path:
                    "knowledge.html",

                route:
                    "/knowledge",

                keywords:
                    [
                        "wissen",
                        "knowledge",
                        "learning",
                        "lernen"
                    ]
            },

            {
                id:
                    "code-builder",

                name:
                    "Code Builder",

                title:
                    "HalDo Code Builder",

                version:
                    VERSION,

                description:
                    "Entwicklungs- und Code-Werkzeuge.",

                category:
                    "development",

                path:
                    "code.html",

                route:
                    "/code",

                keywords:
                    [
                        "code",
                        "builder",
                        "entwicklung",
                        "programmierung"
                    ]
            },

            {
                id:
                    "languages",

                name:
                    "Sprachen",

                title:
                    "HalDo Sprachen",

                version:
                    VERSION,

                description:
                    "Sprach- und Übersetzungssystem.",

                category:
                    "language",

                path:
                    "languages.html",

                route:
                    "/languages",

                keywords:
                    [
                        "sprache",
                        "languages",
                        "translation",
                        "übersetzung"
                    ]
            },

            {
                id:
                    "ezidi-keyboard",

                name:
                    "Êzîdî Keyboard",

                title:
                    "Êzîdî Tastatur",

                version:
                    VERSION,

                description:
                    "Eigene HalDo Tastatur mit Êzîdî-Zeichen.",

                category:
                    "input",

                path:
                    "keyboard.html",

                route:
                    "/keyboard",

                keywords:
                    [
                        "ezidi",
                        "êzîdî",
                        "keyboard",
                        "tastatur",
                        "input"
                    ]
            },

            {
                id:
                    "voice",

                name:
                    "Voice",

                title:
                    "Sprache / Mikrofon",

                version:
                    VERSION,

                description:
                    "Sprachschnittstelle und Mikrofon.",

                category:
                    "ai",

                path:
                    "voice.html",

                route:
                    "/voice",

                keywords:
                    [
                        "voice",
                        "sprache",
                        "mikrofon",
                        "speech"
                    ]
            },

            {
                id:
                    "system",

                name:
                    "System",

                title:
                    "HalDo Systemzentrale",

                version:
                    VERSION,

                description:
                    "Systemkern und Modulverwaltung.",

                category:
                    "system",

                path:
                    "system.html",

                route:
                    "/system",

                keywords:
                    [
                        "system",
                        "kernel",
                        "core",
                        "module"
                    ]
            },

            {
                id:
                    "storage",

                name:
                    "Storage",

                title:
                    "HalDo Speicher",

                version:
                    VERSION,

                description:
                    "Lokale Daten und Speicherverwaltung.",

                category:
                    "system",

                path:
                    "storage.html",

                route:
                    "/storage",

                keywords:
                    [
                        "storage",
                        "speicher",
                        "daten",
                        "local"
                    ]
            },

            {
                id:
                    "notifications",

                name:
                    "Notifications",

                title:
                    "HalDo Benachrichtigungen",

                version:
                    VERSION,

                description:
                    "Systemmeldungen und Benachrichtigungen.",

                category:
                    "system",

                path:
                    "notifications.html",

                route:
                    "/notifications",

                keywords:
                    [
                        "notifications",
                        "benachrichtigungen",
                        "meldungen"
                    ]
            }

        ];

        registerMany(
            apps
        );
    }

    /* ==================================================
       DIAGNOSTICS
    ================================================== */

    function diagnose() {
        return {

            name:
                "HalDo Application Registry",

            version:
                VERSION,

            initialized,

            appCount:
                registry.size,

            enabledCount:
                getEnabled().length,

            installedCount:
                getInstalled().length,

            categories:
                [
                    ...new Set(
                        getAll().map(
                            app =>
                                app.category
                        )
                    )
                ],

            errors:
                errors.length

        };
    }

    /* ==================================================
       CLEAR
    ================================================== */

    function clear() {
        registry.clear();

        emit(
            "registry:cleared"
        );
    }

    /* ==================================================
       INIT
    ================================================== */

    function init() {

        if (initialized) {
            return api;
        }

        registerFoundationApps();

        initialized = true;

        emit(
            "ready",
            {
                registry:
                    diagnose()
            }
        );

        console.log(
            "HalDo Application Registry 18.0.0 bereit."
        );

        return api;
    }

    /* ==================================================
       PUBLIC API
    ================================================== */

    const api = {

        name:
            "HalDo Application Registry",

        version:
            VERSION,

        on,
        off,
        emit,

        init,

        register,
        registerApp:
            register,

        registerMany,

        update,
        updateApp:
            update,

        remove,
        removeApp:
            remove,

        get,
        getApp:
            get,

        getAll,
        getApps:
            getAll,

        getEnabled,
        getInstalled,

        getByCategory,

        search,

        has,

        enable,
        disable,

        install,
        uninstall,

        exportManifest,
        exportAll,

        importData,

        diagnose,

        clear,

        getErrors() {
            return [
                ...errors
            ];
        },

        clearErrors() {
            errors.length = 0;
        }

    };

    /* ==================================================
       GLOBAL API
    ================================================== */

    window.HalDoAppRegistry =
        api;

    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.appRegistry =
        api;

    /* ==================================================
       AUTO INIT
    ================================================== */

    function boot() {

        init();

        /*
        --------------------------------------------------
        Nach dem App Manager verbinden.
        --------------------------------------------------
        */

        setTimeout(
            () => {

                const manager =
                    window.HalDoAppManager;

                if (
                    manager &&
                    typeof manager.connectRegistry ===
                    "function"
                ) {
                    manager.connectRegistry();
                }

                if (
                    manager &&
                    typeof manager.syncLauncher ===
                    "function"
                ) {
                    manager.syncLauncher();
                }

            },
            0
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
                once: true
            }
        );

    } else {

        boot();

    }

})();