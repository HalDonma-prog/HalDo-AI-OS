// ==========================================================
// HalDo AI OS 18
// CENTRAL APP CATALOG
// Version 18.0.0
// Professional Ultimate Foundation
//
// Zweck:
// - Zentrale vollständige App-Liste
// - Einheitliche App-IDs
// - Kategorien
// - Beschreibungen
// - Icons
// - Status
// - interne Funktionen
// - vorbereitete Verbindungen
//
// WICHTIG:
// Diese Datei ersetzt NICHT app-manager.js.
// Sie ist die zentrale Katalog-/Planungsbasis für das
// gesamte App-System.
// ==========================================================

(function (window, document) {

    "use strict";

    // ------------------------------------------------------
    // GRUNDKONFIGURATION
    // ------------------------------------------------------

    const VERSION = "18.0.0";

    const CATEGORIES = {
        CORE: "core",
        AI: "ai",
        COMMUNICATION: "communication",
        PRODUCTIVITY: "productivity",
        SYSTEM: "system",
        TOOLS: "tools",
        MEDIA: "media",
        SECURITY: "security",
        LANGUAGE: "language",
        DEVELOPER: "developer",
        KNOWLEDGE: "knowledge",
        PERSONAL: "personal"
    };

    // ------------------------------------------------------
    // ZENTRALER APP-KATALOG
    // ------------------------------------------------------

    const APPS = [

        // ==================================================
        // CORE / HALDO
        // ==================================================

        {
            id: "haldo-home",
            name: "HalDo Home",
            title: "HalDo AI OS Startseite",
            category: CATEGORIES.CORE,
            icon: "⌂",
            description:
                "Zentrale Startseite des HalDo AI OS.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "home",
            functions: [
                "dashboard",
                "quick-launch",
                "system-overview"
            ]
        },

        {
            id: "haldo-dashboard",
            name: "Dashboard",
            title: "System Dashboard",
            category: CATEGORIES.CORE,
            icon: "▦",
            description:
                "Zentrale Übersicht über HalDo AI OS.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "dashboard",
            functions: [
                "system-status",
                "module-status",
                "app-status",
                "storage-status"
            ]
        },

        {
            id: "haldo-ai",
            name: "HalDo AI",
            title: "HalDo AI",
            category: CATEGORIES.AI,
            icon: "✦",
            description:
                "Zentrale künstliche Intelligenz von HalDo.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "ai",
            functions: [
                "chat",
                "commands",
                "memory",
                "language",
                "voice"
            ]
        },

        // ==================================================
        // AI
        // ==================================================

        {
            id: "ai-chat",
            name: "AI Chat",
            title: "HalDo AI Gespräch",
            category: CATEGORIES.AI,
            icon: "✦",
            description:
                "Interaktiver Chat mit dem HalDo AI System.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "chat",
            functions: [
                "send-message",
                "receive-response",
                "conversation-history",
                "conversation-state"
            ]
        },

        {
            id: "ai-memory",
            name: "AI Memory",
            title: "AI Memory",
            category: CATEGORIES.AI,
            icon: "◉",
            description:
                "Verwaltung des lokalen AI-Kontextes und Erinnerungen.",
            category2: CATEGORIES.AI,
            status: "ready",
            enabled: true,
            internal: true,
            route: "ai-memory",
            functions: [
                "save-memory",
                "read-memory",
                "delete-memory",
                "memory-search"
            ]
        },

        {
            id: "ai-commands",
            name: "AI Commands",
            title: "AI Befehle",
            category: CATEGORIES.AI,
            icon: "⌁",
            description:
                "Verarbeitung von HalDo AI Systembefehlen.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "ai-commands",
            functions: [
                "command-parser",
                "system-command",
                "app-command"
            ]
        },

        {
            id: "ai-language",
            name: "AI Language",
            title: "AI Sprachsystem",
            category: CATEGORIES.LANGUAGE,
            icon: "文",
            description:
                "Sprachverarbeitung und Sprachlogik für HalDo AI.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "ai-language",
            functions: [
                "language-detection",
                "translation",
                "language-selection"
            ]
        },

        // ==================================================
        // VOICE / SPEECH
        // ==================================================

        {
            id: "voice",
            name: "Voice",
            title: "HalDo Voice",
            category: CATEGORIES.COMMUNICATION,
            icon: "◉",
            description:
                "Sprachsteuerung und Mikrofon-System.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "voice",
            functions: [
                "microphone",
                "speech-recognition",
                "voice-command"
            ]
        },

        {
            id: "speech",
            name: "Speech",
            title: "HalDo Speech",
            category: CATEGORIES.COMMUNICATION,
            icon: "◌",
            description:
                "Sprachausgabe und Text-to-Speech-System.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "speech",
            functions: [
                "text-to-speech",
                "voice-output"
            ]
        },

        // ==================================================
        // LANGUAGE
        // ==================================================

        {
            id: "languages",
            name: "Languages",
            title: "Sprachen",
            category: CATEGORIES.LANGUAGE,
            icon: "文",
            description:
                "Verwaltung der unterstützten Sprachen.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "languages",
            functions: [
                "language-selection",
                "language-storage",
                "language-ui"
            ]
        },

        {
            id: "ezidi-keyboard",
            name: "Êzîdî Keyboard",
            title: "Êzîdî Tastatur",
            category: CATEGORIES.LANGUAGE,
            icon: "⌨",
            description:
                "Spezielle Êzîdî-Tastatur mit eigenen Zeichen und Layouts.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "ezidi-keyboard",
            functions: [
                "keyboard-layout",
                "ezidi-characters",
                "input",
                "layout-switch"
            ]
        },

        // ==================================================
        // KNOWLEDGE / LEARNING
        // ==================================================

        {
            id: "knowledge",
            name: "Knowledge",
            title: "HalDo Knowledge",
            category: CATEGORIES.KNOWLEDGE,
            icon: "◇",
            description:
                "Wissenssystem und Informationsverwaltung.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "knowledge",
            functions: [
                "knowledge-search",
                "knowledge-entry",
                "knowledge-storage"
            ]
        },

        {
            id: "learning",
            name: "Learning",
            title: "HalDo Learning",
            category: CATEGORIES.KNOWLEDGE,
            icon: "◆",
            description:
                "Lern- und Wissensfunktionen für HalDo AI.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "learning",
            functions: [
                "learning",
                "progress",
                "topics"
            ]
        },

        // ==================================================
        // DEVELOPER
        // ==================================================

        {
            id: "code-builder",
            name: "Code Builder",
            title: "HalDo Code Builder",
            category: CATEGORIES.DEVELOPER,
            icon: "</>",
            description:
                "Werkzeug zum Erstellen und Bearbeiten von Software-Code.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "code-builder",
            functions: [
                "code-editor",
                "file-builder",
                "code-preview"
            ]
        },

        {
            id: "developer-tools",
            name: "Developer Tools",
            title: "Entwicklerwerkzeuge",
            category: CATEGORIES.DEVELOPER,
            icon: "⚒",
            description:
                "Werkzeuge für die Entwicklung von HalDo Software.",
            status: "planned",
            enabled: true,
            internal: true,
            route: "developer-tools",
            functions: [
                "console",
                "debugger",
                "system-inspector"
            ]
        },

        // ==================================================
        // STORAGE
        // ==================================================

        {
            id: "storage",
            name: "Storage",
            title: "HalDo Storage",
            category: CATEGORIES.SYSTEM,
            icon: "◫",
            description:
                "Lokale Daten- und Speichersysteme.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "storage",
            functions: [
                "local-storage",
                "data-management",
                "state-management"
            ]
        },

        // ==================================================
        // SETTINGS
        // ==================================================

        {
            id: "settings",
            name: "Settings",
            title: "Einstellungen",
            category: CATEGORIES.SYSTEM,
            icon: "⚙",
            description:
                "Konfiguration des HalDo AI OS.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "settings",
            functions: [
                "system-settings",
                "language-settings",
                "appearance-settings",
                "voice-settings"
            ]
        },

        // ==================================================
        // MODULES
        // ==================================================

        {
            id: "modules",
            name: "Modules",
            title: "Module Manager",
            category: CATEGORIES.SYSTEM,
            icon: "◈",
            description:
                "Verwaltung der HalDo Systemmodule.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "modules",
            functions: [
                "module-list",
                "module-status",
                "module-control"
            ]
        },

        // ==================================================
        // SYSTEM STATUS
        // ==================================================

        {
            id: "system-status",
            name: "System Status",
            title: "Systemstatus",
            category: CATEGORIES.SYSTEM,
            icon: "✓",
            description:
                "Überwachung des aktuellen Systemzustands.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "system-status",
            functions: [
                "kernel-status",
                "system-status",
                "online-status",
                "diagnostics"
            ]
        },

        // ==================================================
        // DIAGNOSTICS
        // ==================================================

        {
            id: "diagnostics",
            name: "Diagnostics",
            title: "System Diagnose",
            category: CATEGORIES.SYSTEM,
            icon: "⌁",
            description:
                "Prüfung von System, Modulen und Software.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "diagnostics",
            functions: [
                "system-check",
                "module-check",
                "storage-check",
                "runtime-check"
            ]
        },

        // ==================================================
        // SOFTWARE UPDATE
        // ==================================================

        {
            id: "software-update",
            name: "Software Update",
            title: "HalDo Software Update Center",
            category: CATEGORIES.SYSTEM,
            icon: "↻",
            description:
                "Zentrale Verwaltung und Prüfung von Software-Updates.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "software-update",
            functions: [
                "version-check",
                "update-check",
                "update-status",
                "update-history"
            ]
        },

        // ==================================================
        // APP CENTER
        // ==================================================

        {
            id: "app-center",
            name: "App Center",
            title: "HalDo App Center",
            category: CATEGORIES.SYSTEM,
            icon: "▦",
            description:
                "Zentrale Übersicht über alle installierten Apps.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "app-center",
            functions: [
                "app-list",
                "app-search",
                "app-open",
                "app-information"
            ]
        },

        // ==================================================
        // SECURITY
        // ==================================================

        {
            id: "security",
            name: "Security",
            title: "HalDo Security",
            category: CATEGORIES.SECURITY,
            icon: "◆",
            description:
                "Grundlegende Sicherheits- und Integritätsfunktionen.",
            status: "planned",
            enabled: true,
            internal: true,
            route: "security",
            functions: [
                "integrity-check",
                "permission-check",
                "runtime-protection"
            ]
        },

        // ==================================================
        // MEDIA
        // ==================================================

        {
            id: "media",
            name: "Media",
            title: "HalDo Media",
            category: CATEGORIES.MEDIA,
            icon: "▶",
            description:
                "Zentrale Medienfunktionen.",
            status: "planned",
            enabled: true,
            internal: true,
            route: "media",
            functions: [
                "audio",
                "video",
                "images"
            ]
        },

        // ==================================================
        // FILES
        // ==================================================

        {
            id: "files",
            name: "Files",
            title: "HalDo Dateien",
            category: CATEGORIES.PRODUCTIVITY,
            icon: "▤",
            description:
                "Dateiverwaltung und Dateizugriff.",
            status: "planned",
            enabled: true,
            internal: true,
            route: "files",
            functions: [
                "file-list",
                "file-open",
                "file-management"
            ]
        },

        // ==================================================
        // NOTES
        // ==================================================

        {
            id: "notes",
            name: "Notes",
            title: "HalDo Notizen",
            category: CATEGORIES.PRODUCTIVITY,
            icon: "✎",
            description:
                "Notizen erstellen und speichern.",
            status: "planned",
            enabled: true,
            internal: true,
            route: "notes",
            functions: [
                "create-note",
                "edit-note",
                "delete-note",
                "save-note"
            ]
        },

        // ==================================================
        // CALCULATOR
        // ==================================================

        {
            id: "calculator",
            name: "Calculator",
            title: "HalDo Rechner",
            category: CATEGORIES.TOOLS,
            icon: "＋",
            description:
                "Mathematische Berechnungen.",
            status: "planned",
            enabled: true,
            internal: true,
            route: "calculator",
            functions: [
                "calculate",
                "history"
            ]
        },

        // ==================================================
        // CALENDAR
        // ==================================================

        {
            id: "calendar",
            name: "Calendar",
            title: "HalDo Kalender",
            category: CATEGORIES.PERSONAL,
            icon: "□",
            description:
                "Kalender und Terminverwaltung.",
            status: "planned",
            enabled: true,
            internal: true,
            route: "calendar",
            functions: [
                "events",
                "appointments",
                "reminders"
            ]
        },

        // ==================================================
        // CLOCK
        // ==================================================

        {
            id: "clock",
            name: "Clock",
            title: "HalDo Uhr",
            category: CATEGORIES.TOOLS,
            icon: "◷",
            description:
                "Uhrzeit, Timer und Zeitfunktionen.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "clock",
            functions: [
                "clock",
                "timer",
                "stopwatch"
            ]
        },

        // ==================================================
        // WEATHER
        // ==================================================

        {
            id: "weather",
            name: "Weather",
            title: "HalDo Wetter",
            category: CATEGORIES.PERSONAL,
            icon: "☁",
            description:
                "Wetterinformationen und Wetterübersicht.",
            status: "planned",
            enabled: true,
            internal: true,
            route: "weather",
            functions: [
                "weather",
                "forecast"
            ]
        },

        // ==================================================
        // TRANSLATOR
        // ==================================================

        {
            id: "translator",
            name: "Translator",
            title: "HalDo Übersetzer",
            category: CATEGORIES.LANGUAGE,
            icon: "文",
            description:
                "Übersetzungswerkzeuge für mehrere Sprachen.",
            status: "ready",
            enabled: true,
            internal: true,
            route: "translator",
            functions: [
                "translate",
                "language-detection"
            ]
        },

        // ==================================================
        // SEARCH
        // ==================================================

        {
            id: "search",
            name: "Search",
            title: "HalDo Suche",
            category: CATEGORIES.TOOLS,
            icon: "⌕",
            description:
                "Zentrale Suche innerhalb des HalDo Systems.",
            status: "planned",
            enabled: true,
            internal: true,
            route: "search",
            functions: [
                "app-search",
                "system-search",
                "knowledge-search"
            ]
        },

        // ==================================================
        // NOTIFICATIONS
        // ==================================================

        {
            id: "notifications",
            name: "Notifications",
            title: "Benachrichtigungen",
            category: CATEGORIES.SYSTEM,
            icon: "●",
            description:
                "Zentrale Systembenachrichtigungen.",
            status: "planned",
            enabled: true,
            internal: true,
            route: "notifications",
            functions: [
                "notifications",
                "alerts",
                "system-messages"
            ]
        }

    ];

    // ------------------------------------------------------
    // APP CATALOG API
    // ------------------------------------------------------

    const catalog = {

        version: VERSION,

        getAll: function () {

            return APPS.map(function (app) {
                return Object.assign({}, app);
            });

        },

        getEnabled: function () {

            return APPS
                .filter(function (app) {
                    return app.enabled === true;
                })
                .map(function (app) {
                    return Object.assign({}, app);
                });

        },

        getReady: function () {

            return APPS
                .filter(function (app) {
                    return app.status === "ready";
                })
                .map(function (app) {
                    return Object.assign({}, app);
                });

        },

        getPlanned: function () {

            return APPS
                .filter(function (app) {
                    return app.status === "planned";
                })
                .map(function (app) {
                    return Object.assign({}, app);
                });

        },

        getById: function (id) {

            if (!id) {
                return null;
            }

            const app =
                APPS.find(function (item) {
                    return item.id === id;
                });

            return app
                ? Object.assign({}, app)
                : null;

        },

        getByCategory: function (category) {

            return APPS
                .filter(function (app) {
                    return app.category === category;
                })
                .map(function (app) {
                    return Object.assign({}, app);
                });

        },

        search: function (query) {

            const value =
                String(query || "")
                    .trim()
                    .toLowerCase();

            if (!value) {
                return this.getAll();
            }

            return APPS
                .filter(function (app) {

                    return (
                        app.id.toLowerCase().includes(value) ||
                        app.name.toLowerCase().includes(value) ||
                        app.title.toLowerCase().includes(value) ||
                        app.description.toLowerCase().includes(value)
                    );

                })
                .map(function (app) {
                    return Object.assign({}, app);
                });

        },

        count: function () {

            return APPS.length;

        },

        countReady: function () {

            return APPS.filter(function (app) {
                return app.status === "ready";
            }).length;

        },

        countPlanned: function () {

            return APPS.filter(function (app) {
                return app.status === "planned";
            }).length;

        }

    };

    // ------------------------------------------------------
    // GLOBALE VERBINDUNG
    // ------------------------------------------------------

    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.apps =
        window.HalDoOS.apps || {};

    window.HalDoOS.apps.catalog =
        catalog;

    window.HalDoAppCatalog =
        catalog;

    // ------------------------------------------------------
    // EVENT
    // ------------------------------------------------------

    try {

        document.dispatchEvent(
            new CustomEvent(
                "haldo:app-catalog-ready",
                {
                    detail: {
                        version: VERSION,
                        count: APPS.length
                    }
                }
            )
        );

    } catch (error) {

        console.warn(
            "HalDo App Catalog Event konnte nicht ausgelöst werden.",
            error
        );

    }

    // ------------------------------------------------------
    // DEBUG
    // ------------------------------------------------------

    console.log(
        "HalDo AI OS 18 App Catalog geladen:",
        APPS.length,
        "Apps"
    );

})(window, document);