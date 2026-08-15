/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE STABLE
   ------------------------------------------------------------
   Datei:
   js/app-registry.js

   Version:
   20.0.0

   ZENTRALE APP-PLATTFORM

   Diese Registry ist nicht nur eine Liste von Apps.

   Sie bildet die gemeinsame Grundlage für:

   • App Registrierung
   • App Manager
   • App Router
   • App Launcher
   • Window Manager
   • App Shell
   • App Settings
   • App Menus
   • App Permissions
   • App Capabilities
   • App Commands
   • App Events
   • App Storage
   • App Notifications
   • App Lifecycle
   • App Dependencies
   • AI Integration
   • Voice Integration
   • Language Integration
   • Multitasking
   • Split View
   • Floating Windows
   • Picture-in-Picture
   • Diagnostics
   • Health Check
   • Import / Export
   • zukünftige Erweiterungen

   WICHTIG:

   Diese Datei ist die zentrale App-Quelle.

   Die tatsächliche interne Funktionalität jeder App
   wird später in ihren eigenen Modulen implementiert.

   Keine App soll nur ein Name/Platzhalter sein.

   ============================================================ */

(function (window, document) {

    "use strict";


    /* =========================================================
       01 — HALDO OS FOUNDATION
       ========================================================= */

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};


    /* =========================================================
       02 — META
       ========================================================= */

    const VERSION =
        "20.0.0";

    const NAME =
        "HalDo AI OS App Registry";

    const MODULE_ID =
        "app-registry";

    const EDITION =
        "Professional Ultimate Stable";


    /* =========================================================
       03 — APP PLATFORM VERSION
       ========================================================= */

    const APP_PLATFORM_VERSION =
        "20.0.0";


    /* =========================================================
       04 — INTERNAL STATE
       ========================================================= */

    const state = {

        initialized:
            false,

        initializing:
            false,

        ready:
            false,

        apps:
            new Map(),

        listeners:
            new Map(),

        categories:
            new Set(),

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
                false,

            windowManager:
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

        },

        startedAt:
            null

    };


    /* =========================================================
       05 — LOGGING
       ========================================================= */

    function log() {

        try {

            console.log(
                "[HalDo AI OS 20][App Registry]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo AI OS 20][App Registry]",
                ...arguments
            );

        } catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo AI OS 20][App Registry]",
                ...arguments
            );

        } catch (_) {}

    }


    /* =========================================================
       06 — HELPERS
       ========================================================= */

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
                        clone(
                            value[key]
                        );

                }
            );

            return result;

        }


        return value;

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


    function uniqueArray(
        value
    ) {

        if (
            !Array.isArray(
                value
            )
        ) {

            return [];

        }


        return [
            ...new Set(
                value
                    .map(
                        item =>
                            typeof item ===
                            "string"
                                ? item.trim()
                                : item
                    )
                    .filter(
                        item =>
                            item !==
                            ""
                    )
            )
        ];

    }


    /* =========================================================
       07 — SERVICE LOOKUPS
       ========================================================= */

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
            window.HalDoAppLauncher ||
            HalDoOS.appLauncher ||
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


    /* =========================================================
       08 — EVENT SYSTEM
       ========================================================= */

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
                callback => {

                    try {

                        callback(
                            data
                        );

                    } catch (exception) {

                        errorLog(
                            "Registry event error:",
                            exception
                        );

                    }

                }
            );

        }


        /*
         * Verbindung zum zentralen
         * HalDo Event-System.
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
                    "app-registry:" +
                    event,
                    data
                );

            } catch (_) {}

        }

    }


    /* =========================================================
       09 — ERROR SYSTEM
       ========================================================= */

    function reportError(
        code,
        exception,
        extra = null
    ) {

        state.statistics.errors++;


        const payload = {

            code:
                code ||
                "UNKNOWN_ERROR",

            message:
                exception instanceof Error
                    ? exception.message
                    : String(
                        exception ||
                        "Unbekannter Fehler"
                    ),

            error:
                exception ||
                null,

            extra,

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
                    exception ||
                    payload.message,
                    "App Registry: " +
                    code
                );

            } catch (_) {}

        }


        return payload;

    }


    /* =========================================================
       10 — DEFAULT WINDOW SYSTEM
       ========================================================= */

    const DEFAULT_WINDOW =
        {

            mode:
                "window",

            resizable:
                true,

            movable:
                true,

            minimizable:
                true,

            maximizable:
                true,

            closable:
                true,

            fullscreen:
                true,

            floating:
                true,

            splitView:
                true,

            pictureInPicture:
                false,

            snap:
                true,

            rememberPosition:
                true,

            rememberSize:
                true,

            multiWindow:
                true

        };


    /* =========================================================
       11 — DEFAULT APP CAPABILITIES
       ========================================================= */

    const DEFAULT_CAPABILITIES =
        {

            ui:
                true,

            menu:
                true,

            settings:
                true,

            notifications:
                true,

            commands:
                true,

            shortcuts:
                true,

            storage:
                true,

            search:
                true,

            permissions:
                true,

            events:
                true,

            diagnostics:
                true,

            lifecycle:
                true,

            multitasking:
                true,

            windowManagement:
                true

        };


    /* =========================================================
       12 — DEFAULT APP SETTINGS
       ========================================================= */

    const DEFAULT_SETTINGS =
        {

            enabled:
                true,

            theme:
                "system",

            language:
                "system",

            notifications:
                true,

            sound:
                true,

            vibration:
                true,

            animations:
                true,

            autosave:
                true,

            rememberState:
                true,

            rememberWindow:
                true

        };


    /* =========================================================
       13 — NORMALIZE APP
       ========================================================= */

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
            normalizeId(
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


        const category =
            String(
                config.category ||
                existing?.category ||
                "system"
            )
            .trim()
            .toLowerCase();


        const app = {

            id,

            appId:
                id,

            order:
                Number.isFinite(
                    config.order
                )
                    ? config.order
                    : (
                        existing?.order ||
                        9999
                    ),

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

            category,

            subcategory:
                config.subcategory ||
                existing?.subcategory ||
                null,

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
                        "/" + id
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

            tags:
                uniqueArray(
                    config.tags !==
                    undefined
                        ? config.tags
                        : existing?.tags
                ),

            keywords:
                uniqueArray(
                    config.keywords !==
                    undefined
                        ? config.keywords
                        : existing?.keywords
                ),

            permissions:
                uniqueArray(
                    config.permissions !==
                    undefined
                        ? config.permissions
                        : existing?.permissions
                ),

            dependencies:
                uniqueArray(
                    config.dependencies !==
                    undefined
                        ? config.dependencies
                        : existing?.dependencies
                ),

            capabilities:
                {
                    ...DEFAULT_CAPABILITIES,
                    ...(existing?.capabilities || {}),
                    ...(config.capabilities || {})
                },

            window:
                {
                    ...DEFAULT_WINDOW,
                    ...(existing?.window || {}),
                    ...(config.window || {})
                },

            settings:
                {
                    ...DEFAULT_SETTINGS,
                    ...(existing?.settings || {}),
                    ...(config.settings || {})
                },

            menu:
                Array.isArray(
                    config.menu
                )
                    ? clone(
                        config.menu
                    )
                    : (
                        existing?.menu ||
                        []
                    ),

            commands:
                Array.isArray(
                    config.commands
                )
                    ? clone(
                        config.commands
                    )
                    : (
                        existing?.commands ||
                        []
                    ),

            services:
                uniqueArray(
                    config.services !==
                    undefined
                        ? config.services
                        : existing?.services
                ),

            metadata:
                {
                    ...(existing?.metadata || {}),
                    ...(config.metadata || {})
                },

            api:
                {
                    ...(existing?.api || {}),
                    ...(config.api || {})
                },

            permissionsPolicy:
                {
                    ...(existing?.permissionsPolicy || {}),
                    ...(config.permissionsPolicy || {})
                },

            ai:
                {
                    ...(existing?.ai || {}),
                    ...(config.ai || {})
                },

            language:
                {
                    ...(existing?.language || {}),
                    ...(config.language || {})
                },

            storage:
                {
                    ...(existing?.storage || {}),
                    ...(config.storage || {})
                },

            lifecycle:
                {
                    ...(existing?.lifecycle || {}),
                    ...(config.lifecycle || {})
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

            activate:
                typeof config.activate ===
                "function"
                    ? config.activate
                    : (
                        existing?.activate ||
                        null
                    ),

            deactivate:
                typeof config.deactivate ===
                "function"
                    ? config.deactivate
                    : (
                        existing?.deactivate ||
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

            createdAt:
                existing?.createdAt ||
                config.createdAt ||
                Date.now(),

            updatedAt:
                Date.now(),

            registry:
                MODULE_ID,

            platformVersion:
                APP_PLATFORM_VERSION

        };


        return app;

    }


    /* =========================================================
       14 — APP CATALOG
       =========================================================

       Nur bereits festgelegte Apps werden hier eingetragen.

       Die fehlenden Einträge der ursprünglichen 79er-Liste
       werden NICHT erfunden.

       Die Struktur ist aber vollständig vorbereitet.
       ========================================================= */

    const CORE_APPS = [

        {
            id: "haldo-home",
            name: "HalDo Home",
            title: "HalDo Home",
            category: "system",
            icon: "⌂",
            system: true,
            order: 1,
            route: "/home",
            tags: ["home", "desktop", "system"],
            keywords: ["start", "desktop", "home"],
            window: {
                mode: "desktop",
                pictureInPicture: false
            }
        },

        {
            id: "home",
            name: "Home",
            title: "Home",
            category: "system",
            icon: "⌂",
            system: true,
            order: 2,
            route: "/home-main"
        },

        {
            id: "dashboard",
            name: "Dashboard",
            title: "Dashboard",
            category: "system",
            icon: "▦",
            system: true,
            order: 3,
            route: "/dashboard"
        },

        {
            id: "control-center",
            name: "Control Center",
            title: "Control Center",
            category: "system",
            icon: "⚙",
            system: true,
            order: 4,
            route: "/control-center",
            window: {
                mode: "floating"
            }
        },

        {
            id: "app-center",
            name: "App Center",
            title: "App Center",
            category: "system",
            icon: "▤",
            system: true,
            order: 5,
            route: "/app-center"
        },

        {
            id: "startup",
            name: "Startup",
            title: "Startup",
            category: "system",
            icon: "◉",
            system: true,
            order: 6,
            route: "/startup"
        },

        {
            id: "settings",
            name: "Settings",
            title: "Settings",
            category: "system",
            icon: "⚙",
            system: true,
            order: 7,
            route: "/settings"
        },

        {
            id: "notifications",
            name: "Notifications",
            title: "Notifications",
            category: "system",
            icon: "🔔",
            system: true,
            order: 8,
            route: "/notifications"
        },

        {
            id: "system-status",
            name: "System Status",
            title: "System Status",
            category: "system",
            icon: "◉",
            system: true,
            order: 9,
            route: "/system-status"
        },

        {
            id: "system-information",
            name: "System Information",
            title: "System Information",
            category: "system",
            icon: "ⓘ",
            system: true,
            order: 10,
            route: "/system-information"
        },


        /* =====================================================
           AI
           ===================================================== */

        {
            id: "ai-assistant",
            name: "AI Assistant",
            title: "HalDo AI Assistant",
            category: "ai",
            icon: "AI",
            order: 11,
            route: "/ai-assistant",
            tags: ["ai", "assistant"],
            capabilities: {
                ai: true,
                voice: true
            },
            ai: {
                enabled: true,
                memory: true,
                voice: true,
                commands: true,
                tools: true
            }
        },

        {
            id: "ai-chat",
            name: "AI Chat",
            title: "AI Chat",
            category: "ai",
            icon: "AI",
            order: 12,
            route: "/ai-chat",
            ai: {
                enabled: true,
                memory: true,
                voice: true
            }
        },

        {
            id: "ai-image",
            name: "AI Image",
            title: "AI Image",
            category: "ai",
            icon: "▧",
            order: 13,
            route: "/ai-image",
            ai: {
                enabled: true,
                image: true
            }
        },

        {
            id: "ai-writing",
            name: "AI Writing",
            title: "AI Writing",
            category: "ai",
            icon: "✎",
            order: 14,
            route: "/ai-writing",
            ai: {
                enabled: true,
                writing: true
            }
        },

        {
            id: "ai-code",
            name: "AI Code",
            title: "AI Code",
            category: "ai",
            icon: "</>",
            order: 15,
            route: "/ai-code",
            ai: {
                enabled: true,
                coding: true
            }
        },

        {
            id: "ai-translate",
            name: "AI Translate",
            title: "AI Translate",
            category: "ai",
            icon: "文",
            order: 16,
            route: "/ai-translate",
            ai: {
                enabled: true,
                translation: true
            }
        },

        {
            id: "ai-search",
            name: "AI Search",
            title: "AI Search",
            category: "ai",
            icon: "⌕",
            order: 17,
            route: "/ai-search",
            ai: {
                enabled: true,
                search: true
            }
        },

        {
            id: "ai-memory",
            name: "AI Memory",
            title: "AI Memory",
            category: "ai",
            icon: "◇",
            order: 18,
            route: "/ai-memory",
            ai: {
                enabled: true,
                memory: true
            }
        },

        {
            id: "ai-voice",
            name: "AI Voice",
            title: "AI Voice",
            category: "ai",
            icon: "◉",
            order: 19,
            route: "/ai-voice",
            ai: {
                enabled: true,
                voice: true
            }
        },

        {
            id: "ai-commands",
            name: "AI Commands",
            title: "AI Commands",
            category: "ai",
            icon: "⌘",
            order: 20,
            route: "/ai-commands",
            ai: {
                enabled: true,
                commands: true
            }
        },


        /* =====================================================
           FILES
           ===================================================== */

        {
            id: "file-manager",
            name: "File Manager",
            title: "File Manager",
            category: "files",
            icon: "▰",
            order: 21,
            route: "/file-manager",
            tags: ["files", "storage"],
            storage: {
                enabled: true,
                fileAccess: true
            }
        },

        {
            id: "downloads",
            name: "Downloads",
            title: "Downloads",
            category: "files",
            icon: "⇩",
            order: 22,
            route: "/downloads"
        },

        {
            id: "recent-files",
            name: "Recent Files",
            title: "Recent Files",
            category: "files",
            icon: "◷",
            order: 23,
            route: "/recent-files"
        },

        {
            id: "favorites-files",
            name: "Favorites Files",
            title: "Favorite Files",
            category: "files",
            icon: "★",
            order: 24,
            route: "/favorites-files"
        },

        {
            id: "documents",
            name: "Documents",
            title: "Documents",
            category: "files",
            icon: "▤",
            order: 25,
            route: "/documents"
        },

        {
            id: "cloud-files",
            name: "Cloud Files",
            title: "Cloud Files",
            category: "files",
            icon: "☁",
            order: 26,
            route: "/cloud-files"
        },


        /* =====================================================
           PRODUCTIVITY
           ===================================================== */

        {
            id: "text-editor",
            name: "Text Editor",
            title: "Text Editor",
            category: "productivity",
            icon: "✎",
            order: 27,
            route: "/text-editor",
            tags: ["text", "editor"],
            window: {
                multiWindow: true,
                splitView: true
            }
        },

        {
            id: "word-processor",
            name: "Word Processor",
            title: "Word Processor",
            category: "productivity",
            icon: "W",
            order: 28,
            route: "/word-processor"
        },

        {
            id: "spreadsheet",
            name: "Spreadsheet",
            title: "Spreadsheet",
            category: "productivity",
            icon: "▦",
            order: 29,
            route: "/spreadsheet"
        },

        {
            id: "presentation",
            name: "Presentation",
            title: "Presentation",
            category: "productivity",
            icon: "▤",
            order: 30,
            route: "/presentation"
        },

        {
            id: "pdf-reader",
            name: "PDF Reader",
            title: "PDF Reader",
            category: "productivity",
            icon: "PDF",
            order: 31,
            route: "/pdf-reader"
        },

        {
            id: "pdf-editor",
            name: "PDF Editor",
            title: "PDF Editor",
            category: "productivity",
            icon: "PDF",
            order: 32,
            route: "/pdf-editor"
        },

        {
            id: "calculator",
            name: "Calculator",
            title: "Calculator",
            category: "productivity",
            icon: "＋",
            order: 33,
            route: "/calculator",
            window: {
                mode: "floating"
            }
        },


        /* =====================================================
           COMMUNICATION
           ===================================================== */

        {
            id: "messages",
            name: "Messages",
            title: "Messages",
            category: "communication",
            icon: "✉",
            order: 34,
            route: "/messages"
        },

        {
            id: "calls",
            name: "Calls",
            title: "Calls",
            category: "communication",
            icon: "☎",
            order: 35,
            route: "/calls"
        },

        {
            id: "video-calls",
            name: "Video Calls",
            title: "Video Calls",
            category: "communication",
            icon: "▣",
            order: 36,
            route: "/video-calls",
            window: {
                pictureInPicture: true,
                floating: true
            }
        },

        {
            id: "contacts",
            name: "Contacts",
            title: "Contacts",
            category: "communication",
            icon: "♙",
            order: 37,
            route: "/contacts"
        },

        {
            id: "chat-groups",
            name: "Chat Groups",
            title: "Chat Groups",
            category: "communication",
            icon: "♧",
            order: 38,
            route: "/chat-groups"
        },

        {
            id: "email",
            name: "Email",
            title: "Email",
            category: "communication",
            icon: "@",
            order: 39,
            route: "/email"
        },


        /* =====================================================
           BROWSER
           ===================================================== */

        {
            id: "browser",
            name: "Browser",
            title: "HalDo Browser",
            category: "internet",
            icon: "◎",
            order: 40,
            route: "/browser",
            tags: ["web", "internet"],
            window: {
                multiWindow: true,
                splitView: true
            }
        },

        {
            id: "bookmarks",
            name: "Bookmarks",
            title: "Bookmarks",
            category: "internet",
            icon: "★",
            order: 41,
            route: "/bookmarks"
        },

        {
            id: "history",
            name: "History",
            title: "History",
            category: "internet",
            icon: "◷",
            order: 42,
            route: "/history"
        },

        {
            id: "downloads-browser",
            name: "Browser Downloads",
            title: "Browser Downloads",
            category: "internet",
            icon: "⇩",
            order: 43,
            route: "/downloads-browser"
        },


        /* =====================================================
           MEDIA
           ===================================================== */

        {
            id: "gallery",
            name: "Gallery",
            title: "Gallery",
            category: "media",
            icon: "▧",
            order: 44,
            route: "/gallery"
        },

        {
            id: "camera",
            name: "Camera",
            title: "Camera",
            category: "media",
            icon: "▣",
            order: 45,
            route: "/camera"
        },

        {
            id: "audio-recorder",
            name: "Audio Recorder",
            title: "Audio Recorder",
            category: "media",
            icon: "◉",
            order: 46,
            route: "/audio-recorder"
        },

        {
            id: "video-recorder",
            name: "Video Recorder",
            title: "Video Recorder",
            category: "media",
            icon: "▣",
            order: 47,
            route: "/video-recorder",
            window: {
                pictureInPicture: true,
                floating: true
            }
        }

    ];


    /* =========================================================
       15 — REGISTER
       ========================================================= */

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


        state.categories.add(
            app.category
        );


        if (existing) {

            state.statistics.updated++;


            emit(
                "updated",
                {
                    app:
                        clone(app),

                    previous:
                        clone(existing),

                    options
                }
            );

        } else {

            state.statistics.registered++;


            emit(
                "registered",
                {
                    app:
                        clone(app),

                    options
                }
            );

        }


        notifyConnectedServices(
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
        apps,
        options = {}
    ) {

        if (
            !Array.isArray(
                apps
            )
        ) {

            return [];

        }


        const result = [];


        apps.forEach(
            appConfig => {

                const app =
                    register(
                        appConfig,
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


    /* =========================================================
       16 — ACCESS
       ========================================================= */

    function get(
        id
    ) {

        const normalized =
            normalizeId(
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
        )
        .sort(
            (a, b) =>
                a.order -
                b.order
        );

    }


    function getApps() {

        return getAll();

    }


    function getAllApps() {

        return getAll();

    }


    function list() {

        return getAll();

    }


    function has(
        id
    ) {

        const normalized =
            normalizeId(
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


    /* =========================================================
       17 — SEARCH
       ========================================================= */

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


        return getAll()
            .filter(
                app => {

                    const fields = [

                        app.id,

                        app.name,

                        app.title,

                        app.description,

                        app.category,

                        app.subcategory,

                        ...(app.tags || []),

                        ...(app.keywords || [])

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


    function findApp(
        query
    ) {

        return find(
            query
        );

    }


    function search(
        query
    ) {

        return find(
            query
        );

    }


    /* =========================================================
       18 — CATEGORY / TAG
       ========================================================= */

    function getByCategory(
        category
    ) {

        const value =
            String(
                category || ""
            )
            .trim()
            .toLowerCase();


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

        return [
            ...new Set(
                getAll()
                    .map(
                        app =>
                            app.category
                    )
                    .filter(
                        Boolean
                    )
            )
        ];

    }


    function getByTag(
        tag
    ) {

        const value =
            String(
                tag || ""
            )
            .trim()
            .toLowerCase();


        return getAll()
            .filter(
                app =>
                    (app.tags || [])
                        .some(
                            item =>
                                String(
                                    item
                                )
                                .toLowerCase() ===
                                value
                        )
            );

    }


    /* =========================================================
       19 — STATUS
       ========================================================= */

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
            app.enabled
        ) {

            return true;

        }


        app.enabled =
            true;

        app.status =
            "registered";

        app.updatedAt =
            Date.now();


        state.statistics.enabled++;


        emit(
            "enabled",
            {
                app:
                    clone(app)
            }
        );


        notifyConnectedServices(
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


        state.statistics.disabled++;


        emit(
            "disabled",
            {
                app:
                    clone(app)
            }
        );


        notifyConnectedServices(
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


    function getEnabledApps() {

        return getAll()
            .filter(
                app =>
                    app.enabled !==
                    false
            );

    }


    function getDisabledApps() {

        return getAll()
            .filter(
                app =>
                    app.enabled ===
                    false
            );

    }


    function getSystemApps() {

        return getAll()
            .filter(
                app =>
                    app.system ===
                    true
            );

    }


    /* =========================================================
       20 — UPDATE
       ========================================================= */

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
            clone(
                app
            );


        const merged = {

            ...app,

            ...changes,

            id:
                app.id,

            appId:
                app.id

        };


        const updated =
            normalizeApp(
                merged
            );


        if (!updated) {

            return null;

        }


        state.apps.set(
            app.id,
            updated
        );


        state.categories.add(
            updated.category
        );


        state.statistics.updated++;


        emit(
            "updated",
            {
                app:
                    clone(updated),

                previous
            }
        );


        notifyConnectedServices(
            updated,
            "updated"
        );


        return updated;

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


    /* =========================================================
       21 — REMOVE
       ========================================================= */

    function remove(
        id,
        options = {}
    ) {

        const normalized =
            normalizeId(
                id
            );


        const app =
            get(
                normalized
            );


        if (!app) {

            return false;

        }


        if (
            app.system &&
            options.force !==
            true
        ) {

            warn(
                "System-App nicht entfernt:",
                app.id
            );

            return false;

        }


        state.apps.delete(
            normalized
        );


        state.statistics.removed++;


        emit(
            "removed",
            {
                app:
                    clone(app),

                options
            }
        );


        notifyConnectedServices(
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


    /* =========================================================
       22 — DEPENDENCIES
       ========================================================= */

    function getDependencies(
        id
    ) {

        const app =
            get(
                id
            );


        return app
            ? [
                ...(app.dependencies || [])
            ]
            : [];

    }


    function getMissingDependencies(
        id
    ) {

        return getDependencies(
            id
        )
        .filter(
            dependency => {

                const dependencyId =
                    normalizeId(
                        dependency
                    );


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


    /* =========================================================
       23 — APP SETTINGS
       ========================================================= */

    function getSettings(
        id
    ) {

        const app =
            get(
                id
            );


        return app
            ? clone(
                app.settings
            )
            : null;

    }


    function updateSettings(
        id,
        settings
    ) {

        const app =
            get(
                id
            );


        if (!app) {

            return null;

        }


        app.settings = {

            ...app.settings,

            ...(settings || {})

        };


        app.updatedAt =
            Date.now();


        emit(
            "settings-updated",
            {
                app:
                    clone(app),

                settings:
                    clone(
                        app.settings
                    )
            }
        );


        return clone(
            app.settings
        );

    }


    /* =========================================================
       24 — APP MENU
       ========================================================= */

    function getMenu(
        id
    ) {

        const app =
            get(
                id
            );


        return app
            ? clone(
                app.menu
            )
            : [];

    }


    function setMenu(
        id,
        menu
    ) {

        const app =
            get(
                id
            );


        if (!app) {

            return false;

        }


        app.menu =
            Array.isArray(
                menu
            )
                ? clone(
                    menu
                )
                : [];


        app.updatedAt =
            Date.now();


        emit(
            "menu-updated",
            {
                app:
                    clone(app)
            }
        );


        return true;

    }


    /* =========================================================
       25 — APP COMMANDS
       ========================================================= */

    function getCommands(
        id
    ) {

        const app =
            get(
                id
            );


        return app
            ? clone(
                app.commands
            )
            : [];

    }


    function setCommands(
        id,
        commands
    ) {

        const app =
            get(
                id
            );


        if (!app) {

            return false;

        }


        app.commands =
            Array.isArray(
                commands
            )
                ? clone(
                    commands
                )
                : [];


        app.updatedAt =
            Date.now();


        emit(
            "commands-updated",
            {
                app:
                    clone(app)
            }
        );


        return true;

    }


    /* =========================================================
       26 — WINDOW CAPABILITIES
       ========================================================= */

    function getWindowCapabilities(
        id
    ) {

        const app =
            get(
                id
            );


        return app
            ? clone(
                app.window
            )
            : null;

    }


    function updateWindowCapabilities(
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


        app.window = {

            ...app.window,

            ...(changes || {})

        };


        app.updatedAt =
            Date.now();


        emit(
            "window-capabilities-updated",
            {
                app:
                    clone(app)
            }
        );


        return clone(
            app.window
        );

    }


    /* =========================================================
       27 — APP CAPABILITIES
       ========================================================= */

    function getCapabilities(
        id
    ) {

        const app =
            get(
                id
            );


        return app
            ? clone(
                app.capabilities
            )
            : null;

    }


    function updateCapabilities(
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


        app.capabilities = {

            ...app.capabilities,

            ...(changes || {})

        };


        app.updatedAt =
            Date.now();


        emit(
            "capabilities-updated",
            {
                app:
                    clone(app)
            }
        );


        return clone(
            app.capabilities
        );

    }


    /* =========================================================
       28 — AI
       ========================================================= */

    function getAIConfig(
        id
    ) {

        const app =
            get(
                id
            );


        return app
            ? clone(
                app.ai
            )
            : null;

    }


    /* =========================================================
       29 — STORAGE
       ========================================================= */

    function getStorageConfig(
        id
    ) {

        const app =
            get(
                id
            );


        return app
            ? clone(
                app.storage
            )
            : null;

    }


    /* =========================================================
       30 — IMPORT / EXPORT
       ========================================================= */

    function exportApps(
        options = {}
    ) {

        const apps =
            getAll();


        const data = {

            format:
                "haldo-ai-os-app-registry",

            version:
                VERSION,

            platform:
                APP_PLATFORM_VERSION,

            edition:
                EDITION,

            exportedAt:
                new Date().toISOString(),

            count:
                apps.length,

            apps:
                options.clone ===
                false
                    ? apps
                    : clone(
                        apps
                    )

        };


        state.statistics.exported++;


        emit(
            "exported",
            {
                data:
                    clone(data)
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

            return 0;

        }


        let imported =
            0;


        definitions.forEach(
            definition => {

                const app =
                    register(
                        definition,
                        options
                    );


                if (app) {

                    imported++;

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


    /* =========================================================
       31 — CLEAR
       ========================================================= */

    function clear(
        options = {}
    ) {

        const apps =
            getAll();


        if (
            options.force !==
            true
        ) {

            apps
                .filter(
                    app =>
                        app.system
                )
                .forEach(
                    app => {

                        state.apps.delete(
                            app.id
                        );

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

                options
            }
        );


        return apps.length;

    }


    /* =========================================================
       32 — CONNECTIONS
       ========================================================= */

    function notifyConnectedServices(
        app,
        action
    ) {

        const manager =
            getManager();


        if (
            manager &&
            hasMethod(
                manager,
                "emit"
            )
        ) {

            try {

                manager.emit(
                    "registry-" +
                    action,
                    {
                        app:
                            clone(app)
                    }
                );

                state.connections.manager =
                    true;

            } catch (exception) {

                reportError(
                    "MANAGER_EVENT_ERROR",
                    exception
                );

            }

        }


        const router =
            getRouter();


        if (
            router &&
            hasMethod(
                router,
                "emit"
            )
        ) {

            try {

                router.emit(
                    "registry-" +
                    action,
                    {
                        app:
                            clone(app)
                    }
                );

                state.connections.router =
                    true;

            } catch (_) {}

        }


        const launcher =
            getLauncher();


        if (
            launcher &&
            hasMethod(
                launcher,
                "emit"
            )
        ) {

            try {

                launcher.emit(
                    "registry-" +
                    action,
                    {
                        app:
                            clone(app)
                    }
                );

                state.connections.launcher =
                    true;

            } catch (_) {}

        }


        const windowManager =
            getWindowManager();


        if (
            windowManager &&
            hasMethod(
                windowManager,
                "emit"
            )
        ) {

            try {

                windowManager.emit(
                    "registry-" +
                    action,
                    {
                        app:
                            clone(app)
                    }
                );

                state.connections.windowManager =
                    true;

            } catch (_) {}

        }

    }


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
                "kernel-connected"
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
                "system-connected"
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

        state.connections.router =
            !!getRouter();

        state.connections.launcher =
            !!getLauncher();

        state.connections.windowManager =
            !!getWindowManager();


        return getConnectionStatus();

    }


    function getConnectionStatus() {

        return {

            kernel:
                !!getKernel(),

            system:
                !!getSystem(),

            manager:
                !!getManager(),

            router:
                !!getRouter(),

            launcher:
                !!getLauncher(),

            windowManager:
                !!getWindowManager()

        };

    }


    /* =========================================================
       33 — COUNTERS
       ========================================================= */

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


    /* =========================================================
       34 — DIAGNOSTICS
       ========================================================= */

    function diagnostics() {

        const apps =
            getAll();


        return {

            name:
                NAME,

            version:
                VERSION,

            edition:
                EDITION,

            module:
                MODULE_ID,

            platformVersion:
                APP_PLATFORM_VERSION,

            initialized:
                state.initialized,

            ready:
                state.ready,

            initializing:
                state.initializing,

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
                    app => ({

                        id:
                            app.id,

                        name:
                            app.name,

                        title:
                            app.title,

                        category:
                            app.category,

                        order:
                            app.order,

                        version:
                            app.version,

                        status:
                            app.status,

                        enabled:
                            app.enabled,

                        system:
                            app.system,

                        route:
                            app.route,

                        window:
                            clone(
                                app.window
                            ),

                        capabilities:
                            clone(
                                app.capabilities
                            ),

                        dependencies:
                            [
                                ...(app.dependencies || [])
                            ],

                        missingDependencies:
                            getMissingDependencies(
                                app.id
                            )

                    })
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* =========================================================
       35 — HEALTH CHECK
       ========================================================= */

    function healthCheck() {

        const connections =
            getConnectionStatus();


        const problems = [];


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


        const apps =
            getAll();


        apps.forEach(
            app => {

                const missing =
                    getMissingDependencies(
                        app.id
                    );


                if (
                    missing.length
                ) {

                    problems.push(
                        app.id +
                        ": fehlende Dependencies: " +
                        missing.join(
                            ", "
                        )
                    );

                }

            }
        );


        return {

            healthy:
                problems.length ===
                0,

            problems,

            initialized:
                state.initialized,

            ready:
                state.ready,

            appCount:
                getCount(),

            enabledCount:
                getEnabledApps().length,

            connections,

            timestamp:
                new Date().toISOString()

        };

    }


    /* =========================================================
       36 — STATE
       ========================================================= */

    function getState() {

        return {

            initialized:
                state.initialized,

            initializing:
                state.initializing,

            ready:
                state.ready,

            appCount:
                state.apps.size,

            categories:
                getCategories(),

            connections:
                getConnectionStatus(),

            startedAt:
                state.startedAt

        };

    }


    /* =========================================================
       37 — INITIALIZATION
       ========================================================= */

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

        state.startedAt =
            Date.now();


        emit(
            "initializing",
            {
                version:
                    VERSION
            }
        );


        /*
         * Die bekannte App-Basis registrieren.
         *
         * Fehlende Einträge der früher festgelegten
         * 79er-Liste werden bewusst nicht erfunden.
         */

        registerApps(
            CORE_APPS,
            {
                source:
                    "haldo-core-catalog"
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

                appCount:
                    getCount(),

                diagnostics:
                    diagnostics()
            }
        );


        log(
            "App Registry 20 ist bereit.",
            getCount(),
            "Apps registriert."
        );


        return api;

    }


    /* =========================================================
       38 — KERNEL EVENT
       ========================================================= */

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
                    "Kernel-Verbindung konnte nicht aufgebaut werden.",
                    exception
                );

            }

        }

    }


    /* =========================================================
       39 — PUBLIC API
       ========================================================= */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        edition:
            EDITION,

        module:
            MODULE_ID,

        platformVersion:
            APP_PLATFORM_VERSION,


        /* State */

        getState,

        initialize,


        /* Events */

        on,

        off,

        emit,


        /* Registration */

        register,

        registerApp,

        registerApps,

        unregister,

        unregisterApp,

        remove,


        /* Access */

        get,

        getApp,

        getAll,

        getApps,

        getAllApps,

        list,

        has,

        hasApp,


        /* Search */

        find,

        findApp,

        search,


        /* Categories */

        getByCategory,

        getCategories,

        getByTag,


        /* Status */

        enable,

        enableApp,

        disable,

        disableApp,

        getEnabledApps,

        getDisabledApps,

        getSystemApps,


        /* Update */

        update,

        updateApp,


        /* Dependencies */

        getDependencies,

        getMissingDependencies,

        checkDependencies,


        /* Settings */

        getSettings,

        updateSettings,


        /* Menus */

        getMenu,

        setMenu,


        /* Commands */

        getCommands,

        setCommands,


        /* Window System */

        getWindowCapabilities,

        updateWindowCapabilities,


        /* Capabilities */

        getCapabilities,

        updateCapabilities,


        /* AI */

        getAIConfig,


        /* Storage */

        getStorageConfig,


        /* Import / Export */

        export:
            exportApps,

        exportApps,

        exportRegistry,

        import:
            importApps,

        importApps,

        importRegistry,

        clear,


        /* Connections */

        connectToKernel,

        connectToSystem,

        refreshConnections,

        getConnectionStatus,


        /* Statistics */

        getCount,

        getAppCount,

        getStatistics,


        /* Diagnostics */

        diagnostics,

        healthCheck

    };


    /* =========================================================
       40 — GLOBAL EXPORTS
       ========================================================= */

    window.HalDoAppRegistry =
        api;

    window.HalDoOSAppRegistry =
        api;

    HalDoOS.appRegistry =
        api;


    /* =========================================================
       41 — GLOBAL EVENTS
       ========================================================= */

    connectGlobalEvents();


    /* =========================================================
       42 — DOM STARTUP
       ========================================================= */

    function bootRegistry() {

        initialize()
            .catch(
                exception => {

                    state.initializing =
                        false;

                    reportError(
                        "REGISTRY_INITIALIZATION_ERROR",
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
            bootRegistry,
            {
                once:
                    true
            }
        );

    } else {

        bootRegistry();

    }


    /* =========================================================
       43 — FINAL EXPOSURE
       ========================================================= */

    window.HalDoOS =
        window.HalDoOS ||
        {};

    window.HalDoOS.appRegistry =
        api;


    log(
        "HalDo AI OS 20 App Registry geladen."
    );


})(window, document);


/* ============================================================
   ENDE
   HALDO AI OS 20
   APP REGISTRY
   PROFESSIONAL ULTIMATE STABLE
   ============================================================ */