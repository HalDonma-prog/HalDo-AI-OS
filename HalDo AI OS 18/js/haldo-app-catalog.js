// ============================================================
// HalDo AI OS 18
// MASTER APP CATALOG
// Professional Ultimate Foundation
// ============================================================

(function () {

    "use strict";

    const VERSION = "18.0.0";

    const apps = [

        // =====================================================
        // FOUNDATION
        // =====================================================

        {
            id: "dashboard",
            name: "Dashboard",
            category: "foundation",
            icon: "▦",
            description: "Zentrale Übersicht über HalDo AI OS.",
            status: "ready",
            functions: [
                "Systemübersicht",
                "Systemstatus",
                "Modulstatus",
                "App-Übersicht",
                "Schnellzugriff"
            ],
            modules: [
                "system",
                "system-status",
                "module-manager"
            ]
        },

        {
            id: "system-status",
            name: "System Status",
            category: "foundation",
            icon: "◉",
            description: "Überwacht den aktuellen Zustand des Betriebssystems.",
            status: "ready",
            functions: [
                "Kernelstatus",
                "Systemstatus",
                "Onlinestatus",
                "Modulstatus",
                "Fehlerstatus"
            ],
            modules: [
                "kernel",
                "system",
                "system-status"
            ]
        },

        {
            id: "diagnostics",
            name: "System Diagnose",
            category: "foundation",
            icon: "✓",
            description: "Prüft HalDo AI OS auf Fehler und fehlende Verbindungen.",
            status: "ready",
            functions: [
                "Systemprüfung",
                "Modulprüfung",
                "App-Prüfung",
                "Storage-Prüfung",
                "Fehlerprotokoll"
            ],
            modules: [
                "kernel",
                "system",
                "storage"
            ]
        },

        {
            id: "system-information",
            name: "System Information",
            category: "foundation",
            icon: "ⓘ",
            description: "Zeigt Informationen über HalDo AI OS.",
            status: "ready",
            functions: [
                "Version",
                "Edition",
                "Module",
                "Systeminformationen"
            ],
            modules: [
                "system"
            ]
        },


        // =====================================================
        // AI SYSTEM
        // =====================================================

        {
            id: "ai",
            name: "HalDo AI",
            category: "ai",
            icon: "✦",
            description: "Zentrale künstliche Intelligenz von HalDo AI OS.",
            status: "ready",
            functions: [
                "Fragen beantworten",
                "Befehle verstehen",
                "Konversation",
                "Wissen",
                "Memory",
                "Systemsteuerung"
            ],
            modules: [
                "ai-core",
                "ai-engine",
                "ai-chat",
                "ai-commands",
                "ai-memory"
            ]
        },

        {
            id: "ai-chat",
            name: "AI Chat",
            category: "ai",
            icon: "✦",
            description: "Chat-Oberfläche für HalDo AI.",
            status: "ready",
            functions: [
                "Nachrichten",
                "Chatverlauf",
                "AI-Antworten",
                "Memory",
                "Befehle"
            ],
            modules: [
                "ai-chat",
                "ai-core",
                "conversation-state",
                "ai-memory"
            ]
        },

        {
            id: "ai-core",
            name: "AI Core",
            category: "ai",
            icon: "◆",
            description: "Zentrale AI-Verarbeitungsplattform.",
            status: "ready",
            functions: [
                "AI-Verarbeitung",
                "Antwortsystem",
                "Module verbinden",
                "AI Events"
            ],
            modules: [
                "ai-core",
                "ai-engine"
            ]
        },

        {
            id: "ai-engine",
            name: "AI Engine",
            category: "ai",
            icon: "◇",
            description: "Verarbeitungs- und Entscheidungsengine.",
            status: "ready",
            functions: [
                "Anfrageverarbeitung",
                "Kontext",
                "Antwortlogik",
                "Systemaktionen"
            ],
            modules: [
                "ai-engine",
                "ai-core"
            ]
        },

        {
            id: "ai-memory",
            name: "AI Memory",
            category: "ai",
            icon: "◫",
            description: "Speichert und verwaltet AI-Kontext.",
            status: "ready",
            functions: [
                "Memory speichern",
                "Memory laden",
                "Kontext",
                "Verlauf"
            ],
            modules: [
                "ai-memory",
                "storage"
            ]
        },

        {
            id: "conversation",
            name: "Conversation Center",
            category: "ai",
            icon: "☷",
            description: "Verwaltet Konversationen und Gesprächszustände.",
            status: "ready",
            functions: [
                "Gespräche",
                "Verlauf",
                "Kontext",
                "Gesprächszustand"
            ],
            modules: [
                "conversation-state",
                "ai-chat"
            ]
        },

        {
            id: "knowledge",
            name: "Knowledge Center",
            category: "ai",
            icon: "◇",
            description: "Zentrale Wissensoberfläche für HalDo AI.",
            status: "ready",
            functions: [
                "Wissen suchen",
                "Wissen speichern",
                "Wissenseinträge",
                "AI-Wissensabfragen"
            ],
            modules: [
                "ai-core",
                "ai-memory",
                "storage"
            ]
        },

        {
            id: "learning",
            name: "Learning Center",
            category: "ai",
            icon: "◆",
            description: "Lern- und Wissenssystem.",
            status: "ready",
            functions: [
                "Lerninhalte",
                "Fortschritt",
                "Wissenssammlung",
                "AI-Lernhilfe"
            ],
            modules: [
                "ai-core",
                "ai-memory",
                "storage"
            ]
        },

        {
            id: "translation",
            name: "Translation Center",
            category: "ai",
            icon: "文",
            description: "Sprachübersetzung und AI-Sprachverarbeitung.",
            status: "ready",
            functions: [
                "Textübersetzung",
                "Spracherkennung",
                "Mehrsprachigkeit"
            ],
            modules: [
                "ai-language",
                "language-system",
                "language-manager"
            ]
        },


        // =====================================================
        // VOICE
        // =====================================================

        {
            id: "voice",
            name: "Voice Center",
            category: "voice",
            icon: "◉",
            description: "Sprachsteuerung und Mikrofonfunktionen.",
            status: "ready",
            functions: [
                "Mikrofon",
                "Sprachaufnahme",
                "Voice Commands",
                "AI Voice"
            ],
            modules: [
                "voice",
                "ai-voice",
                "ai-speech"
            ]
        },

        {
            id: "speech",
            name: "Speech System",
            category: "voice",
            icon: "◌",
            description: "Spracherkennung und Sprachausgabe.",
            status: "ready",
            functions: [
                "Speech Recognition",
                "Text-to-Speech",
                "Sprachsteuerung"
            ],
            modules: [
                "ai-speech",
                "voice"
            ]
        },


        // =====================================================
        // LANGUAGE / KEYBOARD
        // =====================================================

        {
            id: "languages",
            name: "Language Center",
            category: "language",
            icon: "文",
            description: "Zentrale Sprachverwaltung.",
            status: "ready",
            functions: [
                "Sprache auswählen",
                "Sprachsystem",
                "Sprachverwaltung",
                "AI Sprache"
            ],
            modules: [
                "language-manager",
                "language-system",
                "ai-language"
            ]
        },

        {
            id: "ezidi-keyboard",
            name: "Êzîdî Keyboard",
            category: "input",
            icon: "⌨",
            description: "Eigene Êzîdî-Tastatur für HalDo AI.",
            status: "ready",
            functions: [
                "Êzîdî Zeichen",
                "Tastatur",
                "Texteingabe",
                "AI Eingabe"
            ],
            modules: [
                "ezidi-keyboard",
                "language-system",
                "ai-chat"
            ]
        },

        {
            id: "keyboard",
            name: "Keyboard Center",
            category: "input",
            icon: "⌨",
            description: "Zentrale Eingabeverwaltung.",
            status: "planned",
            functions: [
                "Tastatur",
                "Layouts",
                "Eingabe",
                "Sonderzeichen"
            ],
            modules: [
                "ezidi-keyboard",
                "language-system"
            ]
        },


        // =====================================================
        // APP SYSTEM
        // =====================================================

        {
            id: "apps",
            name: "App Center",
            category: "apps",
            icon: "◈",
            description: "Zentrale Verwaltung aller HalDo Apps.",
            status: "ready",
            functions: [
                "Apps anzeigen",
                "Apps öffnen",
                "App-Suche",
                "Kategorien",
                "App-Status"
            ],
            modules: [
                "app-launcher",
                "app-manager",
                "app-registry",
                "app-router"
            ]
        },

        {
            id: "app-manager",
            name: "App Manager",
            category: "apps",
            icon: "▤",
            description: "Verwaltung installierter Anwendungen.",
            status: "ready",
            functions: [
                "Apps registrieren",
                "Apps starten",
                "App Status",
                "App Verwaltung"
            ],
            modules: [
                "app-manager",
                "app-registry"
            ]
        },

        {
            id: "app-updates",
            name: "App Updates",
            category: "apps",
            icon: "↻",
            description: "Aktualisierung von HalDo Anwendungen.",
            status: "planned",
            functions: [
                "Updates prüfen",
                "Versionen",
                "Update-Verlauf"
            ],
            modules: [
                "app-manager",
                "storage"
            ]
        },


        // =====================================================
        // STORAGE / DATA
        // =====================================================

        {
            id: "storage",
            name: "Storage Center",
            category: "data",
            icon: "◫",
            description: "Zentrale Verwaltung lokaler HalDo-Daten.",
            status: "ready",
            functions: [
                "Daten speichern",
                "Daten laden",
                "Daten löschen",
                "Storage Diagnose"
            ],
            modules: [
                "storage",
                "storage-manager"
            ]
        },

        {
            id: "file-manager",
            name: "File Manager",
            category: "data",
            icon: "▱",
            description: "Verwaltung von HalDo-Projekt- und Benutzerdaten.",
            status: "planned",
            functions: [
                "Dateien",
                "Ordner",
                "Import",
                "Export"
            ],
            modules: [
                "storage",
                "storage-manager"
            ]
        },

        {
            id: "backup",
            name: "Backup Center",
            category: "data",
            icon: "⬆",
            description: "Sicherung von HalDo-Daten.",
            status: "planned",
            functions: [
                "Backup erstellen",
                "Backup anzeigen",
                "Backup wiederherstellen"
            ],
            modules: [
                "storage",
                "storage-manager"
            ]
        },


        // =====================================================
        // SOFTWARE UPDATE
        // =====================================================

        {
            id: "software-update",
            name: "Software Update Center",
            category: "system",
            icon: "↻",
            description: "Zentrale Software- und Systemaktualisierung.",
            status: "ready",
            functions: [
                "Version prüfen",
                "System prüfen",
                "App Updates",
                "Update Verlauf",
                "Update Status"
            ],
            modules: [
                "system",
                "storage",
                "system-status"
            ]
        },


        // =====================================================
        // SETTINGS
        // =====================================================

        {
            id: "settings",
            name: "Settings",
            category: "system",
            icon: "⚙",
            description: "Zentrale Einstellungen von HalDo AI OS.",
            status: "ready",
            functions: [
                "Systemeinstellungen",
                "AI Einstellungen",
                "Sprache",
                "Theme",
                "Voice",
                "Storage"
            ],
            modules: [
                "config-manager",
                "storage"
            ]
        },


        // =====================================================
        // DEVELOPER
        // =====================================================

        {
            id: "code-builder",
            name: "Code Builder",
            category: "developer",
            icon: "</>",
            description: "Entwicklungsumgebung für HalDo Software.",
            status: "ready",
            functions: [
                "Code Editor",
                "Projekte",
                "Speichern",
                "Laden",
                "Code Analyse"
            ],
            modules: [
                "storage",
                "ai-core"
            ]
        },

        {
            id: "developer-console",
            name: "Developer Console",
            category: "developer",
            icon: ">_",
            description: "Technische Systemkonsole.",
            status: "planned",
            functions: [
                "Logs",
                "Events",
                "Systeminformationen",
                "Debug Informationen"
            ],
            modules: [
                "kernel",
                "system"
            ]
        },

        {
            id: "logs",
            name: "System Logs",
            category: "developer",
            icon: "≡",
            description: "System- und Fehlerprotokolle.",
            status: "ready",
            functions: [
                "System Logs",
                "Fehler",
                "Warnungen",
                "Events"
            ],
            modules: [
                "kernel",
                "system"
            ]
        },


        // =====================================================
        // SECURITY
        // =====================================================

        {
            id: "security",
            name: "Security Center",
            category: "security",
            icon: "◆",
            description: "Zentrale Sicherheitsverwaltung.",
            status: "planned",
            functions: [
                "Sicherheitsstatus",
                "Berechtigungen",
                "Privacy",
                "Systemprüfung"
            ],
            modules: [
                "system",
                "storage"
            ]
        },

        {
            id: "privacy",
            name: "Privacy Center",
            category: "security",
            icon: "◉",
            description: "Datenschutz- und Privatsphäre-Einstellungen.",
            status: "planned",
            functions: [
                "Datenschutz",
                "Lokale Daten",
                "Berechtigungen"
            ],
            modules: [
                "storage",
                "config-manager"
            ]
        },


        // =====================================================
        // AUTOMATION
        // =====================================================

        {
            id: "task-manager",
            name: "Task Manager",
            category: "automation",
            icon: "☷",
            description: "Verwaltung von Systemaufgaben.",
            status: "planned",
            functions: [
                "Aufgaben",
                "Status",
                "Prioritäten"
            ],
            modules: [
                "system"
            ]
        },

        {
            id: "automation",
            name: "Automation Center",
            category: "automation",
            icon: "⚡",
            description: "Automatisierung von HalDo-Abläufen.",
            status: "planned",
            functions: [
                "Automationen",
                "Workflows",
                "Aktionen"
            ],
            modules: [
                "system",
                "storage",
                "ai-core"
            ]
        },


        // =====================================================
        // COMMUNICATION
        // =====================================================

        {
            id: "notifications",
            name: "Notification Center",
            category: "communication",
            icon: "●",
            description: "System- und App-Benachrichtigungen.",
            status: "planned",
            functions: [
                "Benachrichtigungen",
                "Systemmeldungen",
                "App Meldungen"
            ],
            modules: [
                "system",
                "storage"
            ]
        },

        {
            id: "messages",
            name: "Messages",
            category: "communication",
            icon: "✉",
            description: "Kommunikationsbereich von HalDo AI OS.",
            status: "planned",
            functions: [
                "Nachrichten",
                "Verlauf",
                "AI Kommunikation"
            ],
            modules: [
                "storage",
                "ai-core"
            ]
        },


        // =====================================================
        // TOOLS
        // =====================================================

        {
            id: "calculator",
            name: "Calculator",
            category: "tools",
            icon: "＋",
            description: "Integrierter Rechner.",
            status: "ready",
            functions: [
                "Grundrechenarten",
                "Prozent",
                "Ergebnisse löschen"
            ],
            modules: []
        },

        {
            id: "notes",
            name: "Notes",
            category: "tools",
            icon: "▤",
            description: "Notizen speichern und verwalten.",
            status: "ready",
            functions: [
                "Notiz erstellen",
                "Notiz speichern",
                "Notiz löschen",
                "Notizen laden"
            ],
            modules: [
                "storage"
            ]
        },

        {
            id: "clipboard",
            name: "Clipboard",
            category: "tools",
            icon: "▣",
            description: "Zwischenspeicher für HalDo.",
            status: "planned",
            functions: [
                "Kopieren",
                "Einfügen",
                "Verlauf"
            ],
            modules: []
        },


        // =====================================================
        // PLATFORM
        // =====================================================

        {
            id: "plugins",
            name: "Plugin Center",
            category: "platform",
            icon: "◇",
            description: "Erweiterungssystem für HalDo.",
            status: "planned",
            functions: [
                "Plugins",
                "Installation",
                "Aktivierung",
                "Deaktivierung"
            ],
            modules: [
                "module-manager",
                "storage"
            ]
        },

        {
            id: "api",
            name: "API Center",
            category: "platform",
            icon: "{}",
            description: "Zentrale API-Verwaltung.",
            status: "planned",
            functions: [
                "APIs",
                "Verbindungen",
                "Status",
                "Konfiguration"
            ],
            modules: [
                "config-manager"
            ]
        },


        // =====================================================
        // FUTURE AI
        // =====================================================

        {
            id: "ai-agents",
            name: "AI Agents",
            category: "future-ai",
            icon: "✦",
            description: "Zukünftige autonome HalDo AI Agents.",
            status: "planned",
            functions: [
                "Agents",
                "Aufgaben",
                "Automationen",
                "AI Aktionen"
            ],
            modules: [
                "ai-core",
                "ai-engine",
                "ai-memory"
            ]
        }

    ];


    // ========================================================
    // CATALOG API
    // ========================================================

    const catalog = {

        version: VERSION,

        apps: apps,

        getAll: function () {

            return apps.slice();

        },

        getById: function (id) {

            return apps.find(
                function (app) {
                    return app.id === id;
                }
            ) || null;

        },

        getByCategory: function (category) {

            return apps.filter(
                function (app) {
                    return app.category === category;
                }
            );

        },

        getReady: function () {

            return apps.filter(
                function (app) {
                    return app.status === "ready";
                }
            );

        },

        getPlanned: function () {

            return apps.filter(
                function (app) {
                    return app.status === "planned";
                }
            );

        },

        search: function (query) {

            const value =
                String(query || "")
                    .trim()
                    .toLowerCase();

            if (!value) {
                return apps.slice();
            }

            return apps.filter(
                function (app) {

                    return (
                        app.name
                            .toLowerCase()
                            .includes(value) ||

                        app.description
                            .toLowerCase()
                            .includes(value) ||

                        app.category
                            .toLowerCase()
                            .includes(value)
                    );

                }
            );

        }

    };


    // ========================================================
    // GLOBAL HALDO API
    // ========================================================

    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.apps =
        window.HalDoOS.apps || {};

    window.HalDoOS.apps.catalog =
        catalog;


    window.HalDoAppCatalog =
        catalog;


    // ========================================================
    // EVENT
    // ========================================================

    if (
        window.HalDoOS.events &&
        typeof window.HalDoOS.events.emit === "function"
    ) {

        window.HalDoOS.events.emit(
            "apps:catalog-ready",
            {
                count: apps.length,
                version: VERSION
            }
        );

    }


    console.log(
        "[HalDo App Catalog] geladen:",
        apps.length,
        "Apps"
    );


})();