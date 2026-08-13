// ============================================================
// HalDo AI OS 18
// Professional Ultimate Foundation
// APP REGISTRY
// Version 18.0.0
//
// ZENTRALE QUELLE ALLER APPS
//
// Registry = Definition
// Manager  = Lebenszyklus
// Router   = Navigation
// Window   = Darstellung
// ============================================================

(function (window, document) {

    "use strict";

    window.HalDoOS = window.HalDoOS || {};

    const HalDoOS = window.HalDoOS;

    const VERSION = "18.0.0";
    const NAME = "HalDo App Registry";

    const registry = new Map();
    const aliases = new Map();
    const listeners = new Map();

    const state = {
        initialized: false,
        version: VERSION
    };

    // ========================================================
    // EVENT SYSTEM
    // ========================================================

    function on(event, callback) {

        if (typeof callback !== "function") {
            return function () {};
        }

        if (!listeners.has(event)) {
            listeners.set(event, new Set());
        }

        listeners.get(event).add(callback);

        return function () {
            off(event, callback);
        };
    }

    function off(event, callback) {

        const group = listeners.get(event);

        if (!group) {
            return;
        }

        group.delete(callback);

        if (group.size === 0) {
            listeners.delete(event);
        }
    }

    function emit(event, data) {

        const group = listeners.get(event);

        if (group) {

            group.forEach(function (callback) {

                try {
                    callback(data);
                } catch (error) {

                    console.error(
                        "[HalDo App Registry] Event error:",
                        error
                    );

                }

            });

        }

        if (
            HalDoOS.events &&
            typeof HalDoOS.events.emit === "function"
        ) {

            try {

                HalDoOS.events.emit(
                    "app-registry:" + event,
                    data
                );

            } catch (error) {

                console.warn(
                    "[HalDo App Registry] Global event error:",
                    error
                );

            }

        }
    }

    // ========================================================
    // NORMALIZATION
    // ========================================================

    function normalize(value) {

        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-_]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
    }

    // ========================================================
    // ARRAY HELPER
    // ========================================================

    function array(value) {

        return Array.isArray(value)
            ? [...value]
            : [];
    }

    // ========================================================
    // APP FACTORY
    // ========================================================

    function createApp(config) {

        const source = config || {};

        const id = normalize(
            source.id ||
            source.name
        );

        if (!id) {
            throw new Error(
                "HalDo App Registry: App-ID fehlt."
            );
        }

        return {

            id,

            name:
                source.name ||
                id,

            displayName:
                source.displayName ||
                source.title ||
                source.name ||
                id,

            title:
                source.title ||
                source.displayName ||
                source.name ||
                id,

            version:
                source.version ||
                VERSION,

            category:
                source.category ||
                "system",

            description:
                source.description ||
                "",

            icon:
                source.icon ||
                "◈",

            status:
                source.status ||
                "registered",

            enabled:
                source.enabled !== false,

            visible:
                source.visible !== false,

            system:
                source.system === true,

            core:
                source.core === true,

            singleton:
                source.singleton !== false,

            window:
                source.window !== false,

            mobile:
                source.mobile !== false,

            desktop:
                source.desktop !== false,

            tablet:
                source.tablet !== false,

            entry:
                source.entry ||
                null,

            route:
                source.route ||
                id,

            aliases:
                array(source.aliases),

            dependencies:
                array(source.dependencies),

            optionalDependencies:
                array(source.optionalDependencies),

            permissions:
                array(source.permissions),

            features:
                array(source.features),

            services:
                array(source.services),

            ai:
                source.ai !== false,

            storage:
                source.storage !== false,

            settings:
                source.settings !== false,

            updates:
                source.updates !== false,

            diagnostics:
                source.diagnostics !== false,

            metadata:
                Object.assign(
                    {},
                    source.metadata || {}
                ),

            api:
                source.api ||
                null,

            init:
                typeof source.init === "function"
                    ? source.init
                    : null,

            start:
                typeof source.start === "function"
                    ? source.start
                    : null,

            stop:
                typeof source.stop === "function"
                    ? source.stop
                    : null,

            minimize:
                typeof source.minimize === "function"
                    ? source.minimize
                    : null,

            restore:
                typeof source.restore === "function"
                    ? source.restore
                    : null,

            destroy:
                typeof source.destroy === "function"
                    ? source.destroy
                    : null,

            onActivate:
                typeof source.onActivate === "function"
                    ? source.onActivate
                    : null,

            onDeactivate:
                typeof source.onDeactivate === "function"
                    ? source.onDeactivate
                    : null,

            createdAt:
                source.createdAt ||
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()
        };
    }

    // ========================================================
    // ALIAS MANAGEMENT
    // ========================================================

    function removeAliasesForApp(appId) {

        aliases.forEach(function (target, alias) {

            if (target === appId) {
                aliases.delete(alias);
            }

        });
    }

    function registerAliases(app) {

        removeAliasesForApp(app.id);

        const allAliases = [
            app.id,
            app.route,
            ...array(app.aliases)
        ];

        allAliases.forEach(function (alias) {

            const normalized = normalize(alias);

            if (!normalized) {
                return;
            }

            if (
                aliases.has(normalized) &&
                aliases.get(normalized) !== app.id
            ) {

                console.warn(
                    "[HalDo App Registry] Alias bereits vergeben:",
                    normalized
                );

                return;
            }

            aliases.set(
                normalized,
                app.id
            );

        });
    }

    // ========================================================
    // REGISTER
    // ========================================================

    function register(config) {

        let incoming;

        try {

            incoming =
                createApp(config);

        } catch (error) {

            console.error(
                "[HalDo App Registry] Registrierung fehlgeschlagen:",
                error
            );

            return null;
        }

        const existing =
            registry.get(incoming.id);

        let app;

        if (existing) {

            app = Object.assign(
                {},
                existing,
                incoming,
                {
                    metadata: Object.assign(
                        {},
                        existing.metadata || {},
                        incoming.metadata || {}
                    ),

                    updatedAt:
                        new Date().toISOString()
                }
            );

        } else {

            app = incoming;

        }

        registry.set(
            app.id,
            app
        );

        registerAliases(app);

        emit(
            existing
                ? "updated"
                : "registered",
            app
        );

        return app;
    }

    // ========================================================
    // REGISTER MANY
    // ========================================================

    function registerMany(list) {

        if (!Array.isArray(list)) {
            return [];
        }

        return list
            .map(register)
            .filter(Boolean);
    }

    // ========================================================
    // UNREGISTER
    // ========================================================

    function unregister(id) {

        const normalized =
            normalize(id);

        const app =
            get(normalized);

        if (!app) {
            return false;
        }

        registry.delete(
            app.id
        );

        removeAliasesForApp(
            app.id
        );

        emit(
            "unregistered",
            app
        );

        return true;
    }

    // ========================================================
    // GET
    // ========================================================

    function get(id) {

        const normalized =
            normalize(id);

        if (!normalized) {
            return null;
        }

        if (registry.has(normalized)) {
            return registry.get(normalized);
        }

        const target =
            aliases.get(normalized);

        if (target) {
            return registry.get(target) || null;
        }

        return null;
    }

    // ========================================================
    // HAS
    // ========================================================

    function has(id) {

        return !!get(id);

    }

    // ========================================================
    // UPDATE
    // ========================================================

    function update(id, changes) {

        const app =
            get(id);

        if (!app) {
            return null;
        }

        const updated =
            createApp(
                Object.assign(
                    {},
                    app,
                    changes || {},
                    {
                        id: app.id
                    }
                )
            );

        registry.set(
            app.id,
            updated
        );

        registerAliases(
            updated
        );

        emit(
            "updated",
            updated
        );

        return updated;
    }

    // ========================================================
    // LIST
    // ========================================================

    function list() {

        return Array.from(
            registry.values()
        );
    }

    // ========================================================
    // ENABLED
    // ========================================================

    function getEnabled() {

        return list().filter(
            function (app) {
                return app.enabled !== false;
            }
        );
    }

    // ========================================================
    // VISIBLE
    // ========================================================

    function getVisible() {

        return list().filter(
            function (app) {
                return (
                    app.visible !== false &&
                    app.enabled !== false
                );
            }
        );
    }

    // ========================================================
    // CORE
    // ========================================================

    function getCoreApps() {

        return list().filter(
            function (app) {
                return app.core === true;
            }
        );
    }

    // ========================================================
    // CATEGORY
    // ========================================================

    function getByCategory(category) {

        const target =
            normalize(category);

        return list().filter(
            function (app) {

                return normalize(
                    app.category
                ) === target;

            }
        );
    }

    // ========================================================
    // SEARCH
    // ========================================================

    function search(query) {

        const value =
            normalize(query);

        if (!value) {
            return list();
        }

        return list().filter(
            function (app) {

                return [
                    app.id,
                    app.name,
                    app.displayName,
                    app.title,
                    app.category,
                    app.description,
                    ...(app.features || [])
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(value);

            }
        );
    }

    // ========================================================
    // DEPENDENCY CHECK
    // ========================================================

    function checkDependencies(id) {

        const app =
            get(id);

        if (!app) {

            return {
                success: false,
                appId: id,
                missing: [
                    "APP_NOT_FOUND"
                ],
                optionalMissing: []
            };

        }

        const missing = [];

        const optionalMissing = [];

        app.dependencies.forEach(
            function (dependency) {

                if (!has(dependency)) {
                    missing.push(
                        dependency
                    );
                }

            }
        );

        app.optionalDependencies.forEach(
            function (dependency) {

                if (!has(dependency)) {
                    optionalMissing.push(
                        dependency
                    );
                }

            }
        );

        return {

            success:
                missing.length === 0,

            appId:
                app.id,

            missing,

            optionalMissing,

            dependencies:
                [...app.dependencies],

            optionalDependencies:
                [...app.optionalDependencies]

        };
    }

    // ========================================================
    // STATUS
    // ========================================================

    function setStatus(id, status) {

        const app =
            get(id);

        if (!app) {
            return false;
        }

        app.status =
            String(status);

        app.updatedAt =
            new Date().toISOString();

        emit(
            "status",
            app
        );

        return true;
    }

    function getStatus(id) {

        const app =
            get(id);

        return app
            ? app.status
            : null;
    }

    // ========================================================
    // DEFAULT APP CATALOG
    // ========================================================

    const APP_DEFINITIONS = [

        // ---------------- SYSTEM ----------------

        {
            id: "system-dashboard",
            name: "System Dashboard",
            displayName: "HalDo System Dashboard",
            category: "system",
            icon: "▦",
            core: true,
            system: true,
            singleton: true,
            route: "dashboard",
            aliases: [
                "dashboard",
                "home",
                "control-center"
            ],
            features: [
                "system-overview",
                "status",
                "module-monitor",
                "performance"
            ]
        },

        {
            id: "system-monitor",
            name: "System Monitor",
            displayName: "HalDo System Monitor",
            category: "system",
            icon: "◉",
            core: true,
            system: true,
            singleton: true,
            features: [
                "cpu",
                "memory",
                "runtime",
                "network",
                "modules"
            ]
        },

        {
            id: "module-center",
            name: "Module Center",
            displayName: "HalDo Module Center",
            category: "system",
            icon: "◈",
            core: true,
            system: true,
            route: "modules",
            aliases: [
                "module-manager"
            ],
            features: [
                "module-list",
                "module-status",
                "module-control",
                "module-diagnostics"
            ]
        },

        {
            id: "diagnostics",
            name: "Diagnostics",
            displayName: "HalDo System Diagnostics",
            category: "system",
            icon: "✓",
            core: true,
            system: true,
            route: "diagnostics",
            aliases: [
                "diagnostic",
                "system-diagnostics"
            ],
            features: [
                "system-check",
                "storage-check",
                "module-check",
                "app-check",
                "runtime-check"
            ]
        },

        // ---------------- AI ----------------

        {
            id: "ai-core",
            name: "AI Core",
            displayName: "HalDo AI Core",
            category: "ai",
            icon: "✦",
            core: true,
            system: true,
            singleton: true,
            visible: false,
            window: false,
            features: [
                "ai-runtime",
                "request-processing",
                "response-processing",
                "context"
            ]
        },

        {
            id: "ai-engine",
            name: "AI Engine",
            displayName: "HalDo AI Engine",
            category: "ai",
            icon: "◇",
            core: true,
            system: true,
            visible: false,
            window: false,
            dependencies: [
                "ai-core"
            ],
            features: [
                "reasoning",
                "processing",
                "routing"
            ]
        },

        {
            id: "ai-memory",
            name: "AI Memory",
            displayName: "HalDo AI Memory",
            category: "ai",
            icon: "▤",
            core: true,
            system: true,
            visible: false,
            window: false,
            dependencies: [
                "storage"
            ],
            features: [
                "memory",
                "context",
                "conversation-history"
            ]
        },

        {
            id: "conversation-state",
            name: "Conversation State",
            displayName: "HalDo Conversation State",
            category: "ai",
            icon: "◫",
            core: true,
            system: true,
            visible: false,
            window: false,
            dependencies: [
                "ai-memory"
            ]
        },

        {
            id: "ai-language",
            name: "AI Language",
            displayName: "HalDo AI Language",
            category: "ai",
            icon: "文",
            core: true,
            system: true,
            visible: false,
            window: false,
            dependencies: [
                "language-system"
            ],
            features: [
                "language",
                "translation",
                "localization"
            ]
        },

        {
            id: "ai-commands",
            name: "AI Commands",
            displayName: "HalDo AI Commands",
            category: "ai",
            icon: "⌘",
            core: true,
            system: true,
            visible: false,
            window: false,
            dependencies: [
                "ai-core",
                "app-router"
            ],
            features: [
                "system-commands",
                "app-commands",
                "navigation"
            ]
        },

        {
            id: "ai-chat",
            name: "AI Chat",
            displayName: "HalDo AI Gespräch",
            category: "ai",
            icon: "✦",
            core: true,
            singleton: true,
            route: "chat",
            aliases: [
                "ai",
                "assistant",
                "haldo-ai"
            ],
            dependencies: [
                "ai-core",
                "conversation-state"
            ],
            services: [
                "ai-core",
                "ai-memory",
                "ai-language",
                "storage"
            ],
            features: [
                "conversation",
                "messages",
                "history",
                "context",
                "voice-input"
            ]
        },

        {
            id: "ai-voice",
            name: "AI Voice",
            displayName: "HalDo AI Voice",
            category: "voice",
            icon: "◎",
            core: true,
            route: "voice",
            dependencies: [
                "ai-core"
            ],
            features: [
                "speech",
                "voice-input",
                "voice-output"
            ]
        },

        {
            id: "knowledge-center",
            name: "Knowledge Center",
            displayName: "HalDo Knowledge",
            category: "ai",
            icon: "◇",
            route: "knowledge",
            aliases: [
                "wissen",
                "knowledge-base"
            ],
            dependencies: [
                "ai-core",
                "ai-memory",
                "storage"
            ],
            features: [
                "knowledge",
                "search",
                "learning",
                "notes"
            ]
        },

        // ---------------- DEVELOPER ----------------

        {
            id: "code-builder",
            name: "Code Builder",
            displayName: "HalDo Code Builder",
            category: "developer",
            icon: "</>",
            route: "code",
            aliases: [
                "developer"
            ],
            dependencies: [
                "storage",
                "ai-core"
            ],
            features: [
                "editor",
                "projects",
                "files",
                "ai-code",
                "preview"
            ]
        },

        {
            id: "developer-center",
            name: "Developer Center",
            displayName: "HalDo Developer Center",
            category: "developer",
            icon: "⌘",
            dependencies: [
                "code-builder",
                "diagnostics"
            ],
            features: [
                "developer-tools",
                "runtime",
                "logs",
                "debugging"
            ]
        },

        // ---------------- STORAGE ----------------

        {
            id: "storage",
            name: "Storage",
            displayName: "HalDo Storage",
            category: "storage",
            icon: "◫",
            core: true,
            system: true,
            singleton: true,
            route: "storage",
            aliases: [
                "files",
                "data"
            ],
            features: [
                "local-storage",
                "data",
                "cache",
                "preferences"
            ]
        },

        {
            id: "file-center",
            name: "File Center",
            displayName: "HalDo File Center",
            category: "storage",
            icon: "▤",
            route: "files",
            dependencies: [
                "storage"
            ],
            features: [
                "files",
                "folders",
                "documents",
                "projects"
            ]
        },

        // ---------------- LANGUAGE ----------------

        {
            id: "language-manager",
            name: "Language Manager",
            displayName: "HalDo Language Manager",
            category: "language",
            icon: "A",
            core: true,
            system: true,
            visible: false,
            window: false
        },

        {
            id: "language-system",
            name: "Language System",
            displayName: "HalDo Language System",
            category: "language",
            icon: "文",
            core: true,
            system: true,
            visible: false,
            window: false,
            dependencies: [
                "language-manager"
            ]
        },

        {
            id: "language-center",
            name: "Language Center",
            displayName: "HalDo Sprachen",
            category: "language",
            icon: "文",
            route: "languages",
            aliases: [
                "language"
            ],
            dependencies: [
                "language-manager",
                "language-system"
            ],
            features: [
                "languages",
                "localization",
                "translation"
            ]
        },

        // ---------------- ÊZÎDÎ ----------------

        {
            id: "ezidi-keyboard",
            name: "Êzîdî Keyboard",
            displayName: "HalDo Êzîdî Keyboard",
            category: "input",
            icon: "⌨",
            route: "keyboard",
            aliases: [
                "ezidi-keyboard",
                "ezîdî-keyboard"
            ],
            dependencies: [
                "language-system",
                "storage"
            ],
            features: [
                "ezidi-layout",
                "custom-characters",
                "keyboard-input",
                "mobile-input"
            ]
        },

        // ---------------- VOICE ----------------

        {
            id: "voice-center",
            name: "Voice Center",
            displayName: "HalDo Voice Center",
            category: "voice",
            icon: "◉",
            route: "voice",
            dependencies: [
                "ai-voice"
            ],
            features: [
                "microphone",
                "speech-recognition",
                "speech-output"
            ]
        },

        // ---------------- APPS ----------------

        {
            id: "app-center",
            name: "App Center",
            displayName: "HalDo Apps",
            category: "apps",
            icon: "◈",
            core: true,
            system: true,
            singleton: true,
            route: "apps",
            aliases: [
                "applications",
                "application-center"
            ],
            dependencies: [
                "app-manager",
                "app-router",
                "app-launcher"
            ],
            features: [
                "app-list",
                "categories",
                "launch",
                "search",
                "management"
            ]
        },

        // ---------------- SETTINGS ----------------

        {
            id: "settings",
            name: "Settings",
            displayName: "HalDo Einstellungen",
            category: "settings",
            icon: "⚙",
            route: "settings",
            aliases: [
                "setup",
                "config"
            ],
            singleton: true,
            dependencies: [
                "storage",
                "config-manager"
            ],
            features: [
                "system-settings",
                "ai-settings",
                "language-settings",
                "appearance",
                "privacy"
            ]
        },

        {
            id: "config-manager",
            name: "Config Manager",
            displayName: "HalDo Configuration Manager",
            category: "system-service",
            icon: "⚙",
            core: true,
            system: true,
            visible: false,
            window: false,
            dependencies: [
                "storage"
            ]
        },

        // ---------------- SOFTWARE ----------------

        {
            id: "software-update",
            name: "Software Update",
            displayName: "HalDo Software Update Center",
            category: "software",
            icon: "↻",
            route: "updates",
            singleton: true,
            dependencies: [
                "storage",
                "config-manager",
                "diagnostics"
            ],
            features: [
                "version-check",
                "manifest",
                "module-updates",
                "app-updates",
                "backup",
                "validation",
                "rollback"
            ]
        },

        {
            id: "software-center",
            name: "Software Center",
            displayName: "HalDo Software Center",
            category: "software",
            icon: "▣",
            dependencies: [
                "software-update",
                "app-center"
            ],
            features: [
                "software",
                "updates",
                "components",
                "versions"
            ]
        },

        // ---------------- VISUAL ----------------

        {
            id: "logo-system",
            name: "Logo System",
            displayName: "HalDo Logo System",
            category: "visual",
            icon: "✦",
            core: true,
            system: true,
            visible: false,
            window: false,
            dependencies: [
                "storage"
            ],
            features: [
                "logo",
                "intro",
                "animation"
            ]
        },

        {
            id: "light-system",
            name: "Light System",
            displayName: "HalDo Light System",
            category: "visual",
            icon: "☀",
            core: true,
            system: true,
            visible: false,
            window: false,
            features: [
                "lighting",
                "glow",
                "visual-effects"
            ]
        },

        // ---------------- SYSTEM SERVICES ----------------

        {
            id: "app-registry",
            name: "App Registry",
            displayName: "HalDo App Registry",
            category: "system-service",
            icon: "▤",
            core: true,
            system: true,
            visible: false,
            window: false
        },

        {
            id: "app-manager",
            name: "App Manager",
            displayName: "HalDo App Manager",
            category: "system-service",
            icon: "◆",
            core: true,
            system: true,
            visible: false,
            window: false,
            dependencies: [
                "app-registry",
                "app-router"
            ]
        },

        {
            id: "app-router",
            name: "App Router",
            displayName: "HalDo App Router",
            category: "system-service",
            icon: "➜",
            core: true,
            system: true,
            visible: false,
            window: false,
            dependencies: [
                "app-registry"
            ]
        },

        {
            id: "app-launcher",
            name: "App Launcher",
            displayName: "HalDo App Launcher",
            category: "system-service",
            icon: "▦",
            core: true,
            system: true,
            visible: false,
            window: false,
            dependencies: [
                "app-manager",
                "app-router"
            ]
        },

        {
            id: "window-manager",
            name: "Window Manager",
            displayName: "HalDo Window Manager",
            category: "system-service",
            icon: "□",
            core: true,
            system: true,
            visible: false,
            window: false,
            dependencies: [
                "app-manager"
            ]
        },

        // ---------------- FUTURE ----------------

        {
            id: "notification-center",
            name: "Notification Center",
            displayName: "HalDo Notifications",
            category: "system",
            icon: "●",
            features: [
                "notifications",
                "alerts",
                "system-messages"
            ]
        },

        {
            id: "security-center",
            name: "Security Center",
            displayName: "HalDo Security Center",
            category: "security",
            icon: "◆",
            dependencies: [
                "diagnostics",
                "storage"
            ],
            features: [
                "security",
                "permissions",
                "integrity"
            ]
        },

        {
            id: "backup-center",
            name: "Backup Center",
            displayName: "HalDo Backup Center",
            category: "storage",
            icon: "↥",
            dependencies: [
                "storage",
                "software-update"
            ],
            features: [
                "backup",
                "restore",
                "snapshots"
            ]
        }

    ];

    // ========================================================
    // REGISTER DEFAULT CATALOG
    // ========================================================

    function registerDefaultApps() {

        registerMany(
            APP_DEFINITIONS
        );

    }

    // ========================================================
    // KERNEL CONNECTION
    // ========================================================

    function connectKernel() {

        const kernel =
            window.HalDoKernel ||
            HalDoOS.kernel;

        if (!kernel) {
            return;
        }

        try {

            if (
                typeof kernel.registerModule ===
                "function"
            ) {

                kernel.registerModule(
                    "app-registry",
                    api
                );

            }

            if (
                typeof kernel.setModuleReady ===
                "function"
            ) {

                kernel.setModuleReady(
                    "app-registry",
                    true
                );

            }

        } catch (error) {

            console.warn(
                "[HalDo App Registry] Kernel connection failed:",
                error
            );

        }
    }

    // ========================================================
    // INITIALIZATION
    // ========================================================

    function init() {

        if (state.initialized) {
            return api;
        }

        registerDefaultApps();

        state.initialized = true;

        connectKernel();

        emit(
            "ready",
            {
                version: VERSION,
                count: registry.size
            }
        );

        return api;
    }

    const api = {

        name: NAME,
        version: VERSION,

        init,
        initialize: init,
        start: init,

        register,
        registerApp: register,
        registerMany,

        unregister,
        unregisterApp: unregister,

        get,
        getApp: get,

        has,
        hasApp: has,

        update,
        updateApp: update,

        list,
        getAll: list,

        getEnabled,
        getVisible,
        getCoreApps,

        getByCategory,
        search,

        checkDependencies,

        setStatus,
        getStatus,

        on,
        off,
        emit,

        getState: function () {

            return {

                initialized:
                    state.initialized,

                version:
                    state.version,

                count:
                    registry.size,

                apps:
                    list()

            };

        }

    };

    // ========================================================
    // GLOBAL API
    // ========================================================

    window.HalDoAppRegistry =
        api;

    HalDoOS.appRegistry =
        api;

    // ========================================================
    // START
    // ========================================================

    function initialize() {

        try {
            init();
        } catch (error) {

            console.error(
                "[HalDo App Registry] Initialization failed:",
                error
            );

            emit(
                "error",
                error
            );

        }

    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();

    }

})(window, document);