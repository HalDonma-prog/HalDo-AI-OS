// ============================================================
// HalDo AI OS 18
// Professional Ultimate Foundation
// APP REGISTRY
// Version 18.0.0
//
// Zentrale App-Definition für das gesamte HalDo AI OS.
//
// Diese Datei registriert NICHT nur Namen.
// Jede App erhält:
// - ID
// - Kategorie
// - Version
// - Status
// - Entry
// - Abhängigkeiten
// - Permissions
// - Features
// - System-Verbindungen
// - Update-Informationen
// ============================================================

(function (window) {

    "use strict";

    const VERSION = "18.0.0";

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
            window.HalDoOS &&
            window.HalDoOS.events &&
            typeof window.HalDoOS.events.emit === "function"
        ) {

            try {

                window.HalDoOS.events.emit(
                    "app-registry:" + event,
                    data
                );

            } catch (error) {}

        }
    }

    // ========================================================
    // NORMALIZATION
    // ========================================================

    function normalize(value) {

        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

    // ========================================================
    // APP FACTORY
    // ========================================================

    function createApp(config) {

        const source = config || {};

        const id = normalize(source.id);

        if (!id) {
            throw new Error(
                "HalDo App Registry: App-ID fehlt."
            );
        }

        return {

            id: id,

            name:
                source.name ||
                id,

            displayName:
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
                source.system !== false,

            core:
                source.core === true,

            singleton:
                source.singleton === true,

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
                Array.isArray(source.aliases)
                    ? source.aliases
                    : [],

            dependencies:
                Array.isArray(source.dependencies)
                    ? source.dependencies
                    : [],

            optionalDependencies:
                Array.isArray(
                    source.optionalDependencies
                )
                    ? source.optionalDependencies
                    : [],

            permissions:
                Array.isArray(source.permissions)
                    ? source.permissions
                    : [],

            features:
                Array.isArray(source.features)
                    ? source.features
                    : [],

            services:
                Array.isArray(source.services)
                    ? source.services
                    : [],

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

            createdAt:
                source.createdAt ||
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()
        };
    }

    // ========================================================
    // REGISTER
    // ========================================================

    function register(config) {

        let app;

        try {

            app =
                createApp(config);

        } catch (error) {

            console.error(
                "[HalDo App Registry] Registrierung fehlgeschlagen:",
                error
            );

            return false;
        }

        registry.set(
            app.id,
            app
        );

        app.aliases.forEach(function (alias) {

            const key =
                normalize(alias);

            if (key) {
                aliases.set(
                    key,
                    app.id
                );
            }

        });

        emit(
            "registered",
            app
        );

        return app;
    }

    // ========================================================
    // UNREGISTER
    // ========================================================

    function unregister(id) {

        const normalized =
            normalize(id);

        const app =
            registry.get(normalized);

        if (!app) {
            return false;
        }

        registry.delete(normalized);

        aliases.forEach(
            function (target, alias) {

                if (target === normalized) {
                    aliases.delete(alias);
                }

            }
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

        if (registry.has(normalized)) {
            return registry.get(normalized);
        }

        const target =
            aliases.get(normalized);

        if (target) {
            return registry.get(target);
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
    // UPDATE APP
    // ========================================================

    function update(id, changes) {

        const app =
            get(id);

        if (!app) {
            return null;
        }

        const updated =
            Object.assign(
                {},
                app,
                changes || {},
                {
                    id: app.id,
                    updatedAt:
                        new Date().toISOString()
                }
            );

        registry.set(
            app.id,
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
    // ENABLED APPS
    // ========================================================

    function getEnabled() {

        return list().filter(
            function (app) {
                return app.enabled === true;
            }
        );
    }

    // ========================================================
    // CORE APPS
    // ========================================================

    function getCoreApps() {

        return list().filter(
            function (app) {
                return app.core === true;
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
                ]
            };
        }

        const missing = [];

        app.dependencies.forEach(
            function (dependency) {

                if (!has(dependency)) {
                    missing.push(
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

            missing:
                missing,

            dependencies:
                [...app.dependencies]

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
    // COMPLETE APP CATALOG
    // ========================================================

    const APP_DEFINITIONS = [

        // ====================================================
        // SYSTEM CORE
        // ====================================================

        {
            id: "system-dashboard",
            name: "System Dashboard",
            displayName: "HalDo System Dashboard",
            category: "system",
            version: VERSION,
            icon: "▦",
            core: true,
            singleton: true,
            route: "dashboard",
            features: [
                "system-overview",
                "status",
                "module-monitor",
                "performance"
            ],
            services: [
                "kernel",
                "system",
                "diagnostics"
            ]
        },

        {
            id: "system-monitor",
            name: "System Monitor",
            displayName: "HalDo System Monitor",
            category: "system",
            version: VERSION,
            icon: "◉",
            core: true,
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
            version: VERSION,
            icon: "◈",
            core: true,
            route: "modules",
            dependencies: [
                "system-dashboard"
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
            version: VERSION,
            icon: "✓",
            core: true,
            route: "diagnostics",
            features: [
                "system-check",
                "storage-check",
                "module-check",
                "app-check",
                "runtime-check"
            ]
        },

        // ====================================================
        // AI SYSTEM
        // ====================================================

        {
            id: "ai-chat",
            name: "AI Chat",
            displayName: "HalDo AI Gespräch",
            category: "ai",
            version: VERSION,
            icon: "✦",
            core: true,
            singleton: true,
            route: "chat",
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
            id: "ai-core",
            name: "AI Core",
            displayName: "HalDo AI Core",
            category: "ai",
            version: VERSION,
            icon: "✦",
            core: true,
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
            version: VERSION,
            icon: "◇",
            core: true,
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
            version: VERSION,
            icon: "▤",
            core: true,
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
            id: "ai-commands",
            name: "AI Commands",
            displayName: "HalDo AI Commands",
            category: "ai",
            version: VERSION,
            icon: "⌘",
            core: true,
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
            id: "ai-language",
            name: "AI Language",
            displayName: "HalDo AI Language",
            category: "ai",
            version: VERSION,
            icon: "文",
            core: true,
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
            id: "ai-voice",
            name: "AI Voice",
            displayName: "HalDo AI Voice",
            category: "ai",
            version: VERSION,
            icon: "◉",
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
            id: "conversation-state",
            name: "Conversation State",
            displayName: "HalDo Conversation State",
            category: "ai",
            version: VERSION,
            core: true,
            visible: false,
            window: false,
            dependencies: [
                "ai-memory"
            ]
        },

        {
            id: "knowledge-center",
            name: "Knowledge Center",
            displayName: "HalDo Knowledge",
            category: "ai",
            version: VERSION,
            icon: "◇",
            route: "knowledge",
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

        // ====================================================
        // DEVELOPER
        // ====================================================

        {
            id: "code-builder",
            name: "Code Builder",
            displayName: "HalDo Code Builder",
            category: "developer",
            version: VERSION,
            icon: "</>",
            route: "code",
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
            version: VERSION,
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

        // ====================================================
        // STORAGE
        // ====================================================

        {
            id: "storage",
            name: "Storage",
            displayName: "HalDo Storage",
            category: "storage",
            version: VERSION,
            icon: "◫",
            core: true,
            singleton: true,
            route: "storage",
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
            version: VERSION,
            icon: "▤",
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

        // ====================================================
        // LANGUAGE
        // ====================================================

        {
            id: "language-center",
            name: "Language Center",
            displayName: "HalDo Sprachen",
            category: "language",
            version: VERSION,
            icon: "文",
            route: "languages",
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

        {
            id: "language-manager",
            name: "Language Manager",
            displayName: "HalDo Language Manager",
            category: "language",
            version: VERSION,
            core: true,
            visible: false,
            window: false
        },

        {
            id: "language-system",
            name: "Language System",
            displayName: "HalDo Language System",
            category: "language",
            version: VERSION,
            core: true,
            visible: false,
            window: false,
            dependencies: [
                "language-manager"
            ]
        },

        // ====================================================
        // ÊZÎDÎ
        // ====================================================

        {
            id: "ezidi-keyboard",
            name: "Êzîdî Keyboard",
            displayName: "HalDo Êzîdî Keyboard",
            category: "input",
            version: VERSION,
            icon: "⌨",
            route: "keyboard",
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

        // ====================================================
        // VOICE
        // ====================================================

        {
            id: "voice-center",
            name: "Voice Center",
            displayName: "HalDo Voice Center",
            category: "voice",
            version: VERSION,
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

        // ====================================================
        // APP CENTER
        // ====================================================

        {
            id: "app-center",
            name: "App Center",
            displayName: "HalDo Apps",
            category: "apps",
            version: VERSION,
            icon: "◈",
            route: "apps",
            core: true,
            singleton: true,
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

        // ====================================================
        // SETTINGS
        // ====================================================

        {
            id: "settings",
            name: "Settings",
            displayName: "HalDo Einstellungen",
            category: "settings",
            version: VERSION,
            icon: "⚙",
            route: "settings",
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

        // ====================================================
        // SOFTWARE UPDATE
        // ====================================================

        {
            id: "software-update",
            name: "Software Update",
            displayName: "HalDo Software Update Center",
            category: "software",
            version: VERSION,
            icon: "↻",
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
            version: VERSION,
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

        // ====================================================
        // LOGO / VISUAL
        // ====================================================

        {
            id: "logo-system",
            name: "Logo System",
            displayName: "HalDo Logo System",
            category: "visual",
            version: VERSION,
            core: true,
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
            version: VERSION,
            core: true,
            visible: false,
            window: false,
            features: [
                "lighting",
                "glow",
                "visual-effects"
            ]
        },

        // ====================================================
        // SYSTEM SERVICES
        // ====================================================

        {
            id: "config-manager",
            name: "Config Manager",
            displayName: "HalDo Configuration Manager",
            category: "system-service",
            version: VERSION,
            core: true,
            visible: false,
            window: false,
            dependencies: [
                "storage"
            ]
        },

        {
            id: "app-manager",
            name: "App Manager",
            displayName: "HalDo App Manager",
            category: "system-service",
            version: VERSION,
            core: true,
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
            version: VERSION,
            core: true,
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
            version: VERSION,
            core: true,
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
            version: VERSION,
            core: true,
            visible: false,
            window: false,
            dependencies: [
                "app-manager"
            ]
        },

        // ====================================================
        // FUTURE EXTENSIBILITY
        // ====================================================

        {
            id: "notification-center",
            name: "Notification Center",
            displayName: "HalDo Notifications",
            category: "system",
            version: VERSION,
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
            version: VERSION,
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
            version: VERSION,
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
    // REGISTER COMPLETE CATALOG
    // ========================================================

    function registerDefaultApps() {

        APP_DEFINITIONS.forEach(
            function (definition) {

                register(
                    definition
                );

            }
        );
    }

    // ========================================================
    // REGISTRY API
    // ========================================================

    const api = {

        name:
            "HalDo App Registry",

        version:
            VERSION,

        init:
            function () {

                if (state.initialized) {
                    return this;
                }

                registerDefaultApps();

                state.initialized = true;

                emit(
                    "ready",
                    this
                );

                return this;
            },

        start:
            function () {
                return this.init();
            },

        register:
            register,

        unregister:
            unregister,

        get:
            get,

        has:
            has,

        update:
            update,

        list:
            list,

        getAll:
            list,

        getByCategory:
            getByCategory,

        getEnabled:
            getEnabled,

        getCoreApps:
            getCoreApps,

        checkDependencies:
            checkDependencies,

        setStatus:
            setStatus,

        getStatus:
            getStatus,

        on:
            on,

        off:
            off,

        emit:
            emit,

        getState:
            function () {

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

    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.appRegistry =
        api;

    // ========================================================
    // KERNEL CONNECTION
    // ========================================================

    function connectKernel() {

        const kernel =
            window.HalDoKernel ||
            (
                window.HalDoOS &&
                window.HalDoOS.kernel
            );

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
                "[HalDo App Registry] Kernel-Verbindung fehlgeschlagen:",
                error
            );

        }
    }

    // ========================================================
    // INITIALIZATION
    // ========================================================

    function initialize() {

        api.init();

        connectKernel();

        emit(
            "initialized",
            api
        );
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

})(window);