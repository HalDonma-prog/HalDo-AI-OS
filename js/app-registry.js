/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/app-registry.js

   ZENTRALE APP-REGISTRY

   Architektur:

       app-registry.js
              ↓
       HalDoAppManager
              ↓
       HalDoAppRouter
              ↓
       HalDoApps / HalDoAppModules
              ↓
       echte App-Module

   WICHTIG:
   - Diese Datei besitzt die zentrale App-Definition.
   - Keine zweite unabhängige App-Liste.
   - Kompatibel mit älteren und neuen Manager-APIs.
   - Vorbereitet für zukünftige Apps.
   - Vorbereitet für echte Module.
   - Kategorien
   - Berechtigungen
   - Abhängigkeiten
   - Keywords
   - Favoriten
   - System-Apps
   - kritische Apps
   - AutoStart
   - Modulpfade
   - App-Seiten
   - Versionierung
   - Diagnose
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const CONFIG = {

        name:
            "HalDo AI OS 18 App Registry",

        version:
            "18.0.0",

        platform:
            "HalDo AI OS 18",

        edition:
            "Professional Ultimate Foundation"

    };


    /* ========================================================
       02 — STATUS
       ======================================================== */

    const state = {

        initialized:
            false,

        built:
            false,

        registered:
            false,

        managerReady:
            false,

        lastError:
            null,

        registrationCount:
            0

    };


    /* ========================================================
       03 — EVENT SYSTEM
       ======================================================== */

    const listeners = {};


    function on(
        eventName,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return false;

        }


        if (
            !listeners[eventName]
        ) {

            listeners[eventName] =
                [];

        }


        listeners[eventName].push(
            callback
        );


        return true;

    }


    function off(
        eventName,
        callback
    ) {

        if (
            !listeners[eventName]
        ) {

            return false;

        }


        listeners[eventName] =
            listeners[eventName].filter(
                item =>
                    item !==
                    callback
            );


        return true;

    }


    function emit(
        eventName,
        data = null
    ) {

        const callbacks =
            listeners[eventName];


        if (
            !callbacks
        ) {

            return;

        }


        callbacks
            .slice()
            .forEach(
                callback => {

                    try {

                        callback(
                            data
                        );

                    }
                    catch (
                        error
                    ) {

                        console.error(
                            "[HalDo App Registry] Event-Fehler:",
                            error
                        );

                    }

                }
            );

    }


    /* ========================================================
       04 — LOGGING
       ======================================================== */

    function log(
        message,
        type = "info"
    ) {

        const prefix =
            "[HalDo App Registry]";


        if (
            type ===
            "error"
        ) {

            console.error(
                prefix,
                message
            );

        }
        else if (
            type ===
            "warning"
        ) {

            console.warn(
                prefix,
                message
            );

        }
        else {

            console.log(
                prefix,
                message
            );

        }

    }


    /* ========================================================
       05 — NORMALISIERUNG
       ======================================================== */

    function normalizeId(
        value
    ) {

        return String(
            value ||
            ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9äöüßêîé_-]+/gi,
            "-"
        )
        .replace(
            /-+/g,
            "-"
        )
        .replace(
            /^-|-$/g,
            ""
        );

    }


    function normalizeArray(
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
                    .filter(
                        item =>
                            item !==
                            null &&
                            item !==
                            undefined
                    )
                    .map(
                        item =>
                            String(
                                item
                            ).trim()
                    )
                    .filter(
                        Boolean
                    )
            )
        ];

    }


    /* ========================================================
       06 — APP-DEFINITION
       ======================================================== */

    function create(
        id,
        name,
        category,
        icon,
        description,
        options = {}
    ) {

        const normalizedId =
            normalizeId(
                id
            );


        return {

            id:
                normalizedId,

            name:
                String(
                    name ||
                    normalizedId
                ),

            title:
                String(
                    options.title ||
                    name ||
                    normalizedId
                ),

            category:
                String(
                    category ||
                    "system"
                ),

            icon:
                icon ||
                "◉",

            description:
                String(
                    description ||
                    ""
                ),

            version:
                options.version ||
                "18.0.0",

            enabled:
                options.enabled !==
                false,

            installed:
                options.installed !==
                false,

            system:
                options.system ===
                true,

            critical:
                options.critical ===
                true,

            autoStart:
                options.autoStart ===
                true,

            hidden:
                options.hidden ===
                true,

            experimental:
                options.experimental ===
                true,

            favorite:
                options.favorite ===
                true,

            order:
                Number(
                    options.order
                ) || 999999,

            module:
                options.module ||
                null,

            modulePath:
                options.modulePath ||
                null,

            route:
                options.route ||
                normalizedId,

            page:
                options.page ||
                null,

            permissions:
                normalizeArray(
                    options.permissions
                ),

            dependencies:
                normalizeArray(
                    options.dependencies
                ),

            keywords:
                normalizeArray(
                    options.keywords
                ),

            capabilities:
                normalizeArray(
                    options.capabilities
                ),

            platforms:
                normalizeArray(
                    options.platforms
                ),

            metadata:
                options.metadata &&
                typeof options.metadata ===
                "object"
                    ? {
                        ...options.metadata
                    }
                    : {}

        };

    }


    /* ========================================================
       07 — REGISTRY DATEN
       ======================================================== */

    const registry = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,

        initialized:
            false,

        definitions:
            [],


        /* ====================================================
           APP-REGISTRY AUFBAUEN
           ==================================================== */

        build() {

            if (
                state.built &&
                this.definitions.length
            ) {

                return this.definitions;

            }


            const apps = [];


            /* =================================================
               SYSTEM / HOME
               ================================================= */

            apps.push(

                create(
                    "haldo-home",
                    "HalDo Home",
                    "system",
                    "assets/logo/logo.png",
                    "Zentrale Startseite von HalDo AI OS 18.",
                    {
                        system:
                            true,

                        critical:
                            true,

                        favorite:
                            true,

                        order:
                            1,

                        module:
                            "home",

                        keywords: [
                            "home",
                            "start",
                            "desktop",
                            "hauptseite"
                        ],

                        capabilities: [
                            "navigation",
                            "dashboard",
                            "launcher"
                        ]
                    }
                ),

                create(
                    "home",
                    "Startseite",
                    "system",
                    "assets/logo/logo.png",
                    "Zentrale HalDo AI OS Startseite.",
                    {
                        system:
                            true,

                        critical:
                            true,

                        order:
                            2,

                        module:
                            "home",

                        dependencies: [
                            "haldo-home"
                        ]
                    }
                ),

                create(
                    "dashboard",
                    "Dashboard",
                    "system",
                    "assets/logo/logo.png",
                    "Zentrale Übersicht über HalDo AI OS.",
                    {
                        system:
                            true,

                        favorite:
                            true,

                        order:
                            3,

                        module:
                            "dashboard",

                        keywords: [
                            "übersicht",
                            "start",
                            "desktop"
                        ]
                    }
                ),

                create(
                    "control-center",
                    "Kontrollzentrum",
                    "system",
                    "🎛️",
                    "Schnellzugriff auf wichtige Systemeinstellungen.",
                    {
                        system:
                            true,

                        order:
                            4,

                        module:
                            "control-center",

                        permissions: [
                            "system.settings"
                        ]
                    }
                ),

                create(
                    "app-center",
                    "App Center",
                    "system",
                    "▦",
                    "Zentrale Verwaltung aller HalDo Apps.",
                    {
                        system:
                            true,

                        order:
                            5,

                        module:
                            "app-center",

                        capabilities: [
                            "app-management",
                            "app-search",
                            "app-launch"
                        ]
                    }
                ),

                create(
                    "startup",
                    "Systemstart",
                    "system",
                    "🚀",
                    "Informationen und Steuerung des Systemstarts.",
                    {
                        system:
                            true,

                        order:
                            6,

                        module:
                            "startup"
                    }
                ),

                create(
                    "settings",
                    "Einstellungen",
                    "system",
                    "⚙️",
                    "Zentrale Einstellungen von HalDo AI OS.",
                    {
                        system:
                            true,

                        favorite:
                            true,

                        order:
                            7,

                        module:
                            "settings",

                        permissions: [
                            "system.settings"
                        ],

                        keywords: [
                            "optionen",
                            "konfiguration",
                            "system"
                        ]
                    }
                ),

                create(
                    "notifications",
                    "Benachrichtigungen",
                    "system",
                    "🔔",
                    "Zentrale System- und App-Benachrichtigungen.",
                    {
                        system:
                            true,

                        order:
                            8,

                        module:
                            "notifications"
                    }
                ),

                create(
                    "system-status",
                    "Systemstatus",
                    "system",
                    "📊",
                    "Überwachung des aktuellen Systemzustands.",
                    {
                        system:
                            true,

                        order:
                            9,

                        module:
                            "system-status"
                    }
                ),

                create(
                    "system-information",
                    "Systeminformationen",
                    "system",
                    "ℹ️",
                    "Informationen über HalDo AI OS und seine Komponenten.",
                    {
                        system:
                            true,

                        order:
                            10,

                        module:
                            "system-information"
                    }
                )

            );


            /* =================================================
               AI
               ================================================= */

            apps.push(

                create(
                    "ai-assistant",
                    "AI Assistent",
                    "ai",
                    "assets/logo/logo.png",
                    "Zentrale intelligente HalDo AI Assistenz.",
                    {
                        system:
                            true,

                        favorite:
                            true,

                        order:
                            20,

                        module:
                            "ai-assistant",

                        dependencies: [
                            "ai-chat",
                            "ai-core"
                        ],

                        capabilities: [
                            "chat",
                            "voice",
                            "memory",
                            "commands"
                        ],

                        permissions: [
                            "ai.use"
                        ]
                    }
                ),

                create(
                    "ai-chat",
                    "AI Chat",
                    "ai",
                    "💬",
                    "Intelligente Unterhaltung mit HalDo AI.",
                    {
                        favorite:
                            true,

                        order:
                            21,

                        module:
                            "ai-chat",

                        keywords: [
                            "chat",
                            "ki",
                            "assistant",
                            "unterhaltung"
                        ]
                    }
                ),

                create(
                    "ai-image",
                    "AI Bilder",
                    "ai",
                    "🖼️",
                    "AI-Bildfunktionen und kreative Bildwerkzeuge.",
                    {
                        order:
                            22,

                        module:
                            "ai-image",

                        keywords: [
                            "bild",
                            "bildgenerator",
                            "kunst",
                            "grafik"
                        ]
                    }
                ),

                create(
                    "ai-writing",
                    "AI Schreiben",
                    "ai",
                    "✍️",
                    "Schreiben, Bearbeiten und Erstellen mit AI.",
                    {
                        order:
                            23,

                        module:
                            "ai-writing"
                    }
                ),

                create(
                    "ai-code",
                    "AI Code",
                    "ai",
                    "💻",
                    "Unterstützung beim Programmieren und Entwickeln.",
                    {
                        order:
                            24,

                        module:
                            "ai-code",

                        capabilities: [
                            "code",
                            "development",
                            "debugging"
                        ]
                    }
                ),

                create(
                    "ai-translate",
                    "AI Übersetzung",
                    "ai",
                    "🌐",
                    "Intelligente Übersetzung von Texten und Sprachen.",
                    {
                        order:
                            25,

                        module:
                            "ai-translate"
                    }
                ),

                create(
                    "ai-search",
                    "AI Suche",
                    "ai",
                    "🔎",
                    "Intelligente Suche und Informationsverarbeitung.",
                    {
                        order:
                            26,

                        module:
                            "ai-search"
                    }
                ),

                create(
                    "ai-memory",
                    "AI Memory",
                    "ai",
                    "🧠",
                    "Verwaltung des HalDo AI Gedächtnisses.",
                    {
                        order:
                            27,

                        module:
                            "ai-memory"
                    }
                ),

                create(
                    "ai-voice",
                    "AI Voice",
                    "ai",
                    "🎙️",
                    "Sprachbasierte Interaktion mit HalDo AI.",
                    {
                        order:
                            28,

                        module:
                            "ai-voice"
                    }
                ),

                create(
                    "ai-commands",
                    "AI Befehle",
                    "ai",
                    "⌘",
                    "Intelligente Systembefehle und Aktionen.",
                    {
                        order:
                            29,

                        module:
                            "ai-commands"
                    }
                )

            );


            /* =================================================
               DATEIEN
               ================================================= */

            apps.push(

                create(
                    "file-manager",
                    "Dateimanager",
                    "files",
                    "📁",
                    "Dateien und Ordner verwalten.",
                    {
                        favorite:
                            true,

                        order:
                            40,

                        module:
                            "file-manager",

                        permissions: [
                            "storage.read",
                            "storage.write"
                        ]
                    }
                ),

                create(
                    "downloads",
                    "Downloads",
                    "files",
                    "⬇️",
                    "Heruntergeladene Dateien.",
                    {
                        order:
                            41,

                        module:
                            "downloads"
                    }
                ),

                create(
                    "recent-files",
                    "Zuletzt verwendete Dateien",
                    "files",
                    "🕘",
                    "Schneller Zugriff auf zuletzt verwendete Dateien.",
                    {
                        order:
                            42,

                        module:
                            "recent-files"
                    }
                ),

                create(
                    "favorites-files",
                    "Datei-Favoriten",
                    "files",
                    "⭐",
                    "Favorisierte Dateien und Ordner.",
                    {
                        order:
                            43,

                        module:
                            "favorites-files"
                    }
                ),

                create(
                    "documents",
                    "Dokumente",
                    "files",
                    "📄",
                    "Zentrale Dokumentenverwaltung.",
                    {
                        order:
                            44,

                        module:
                            "documents"
                    }
                ),

                create(
                    "cloud-files",
                    "Cloud Dateien",
                    "files",
                    "☁️",
                    "Vorbereitung für Cloud-Dateiverwaltung.",
                    {
                        order:
                            45,

                        module:
                            "cloud-files",

                        experimental:
                            true
                    }
                )

            );


            /* =================================================
               OFFICE
               ================================================= */

            apps.push(

                create(
                    "text-editor",
                    "Texteditor",
                    "office",
                    "📝",
                    "Texte erstellen und bearbeiten.",
                    {
                        order:
                            60,

                        module:
                            "text-editor"
                    }
                ),

                create(
                    "word-processor",
                    "Dokumente",
                    "office",
                    "📄",
                    "Dokumente professionell bearbeiten.",
                    {
                        order:
                            61,

                        module:
                            "word-processor"
                    }
                ),

                create(
                    "spreadsheet",
                    "Tabellen",
                    "office",
                    "📊",
                    "Tabellen und Daten bearbeiten.",
                    {
                        order:
                            62,

                        module:
                            "spreadsheet"
                    }
                ),

                create(
                    "presentation",
                    "Präsentationen",
                    "office",
                    "📽️",
                    "Präsentationen erstellen und bearbeiten.",
                    {
                        order:
                            63,

                        module:
                            "presentation"
                    }
                ),

                create(
                    "pdf-reader",
                    "PDF Reader",
                    "office",
                    "📕",
                    "PDF-Dokumente anzeigen.",
                    {
                        order:
                            64,

                        module:
                            "pdf-reader"
                    }
                ),

                create(
                    "pdf-editor",
                    "PDF Editor",
                    "office",
                    "📑",
                    "PDF-Dokumente bearbeiten.",
                    {
                        order:
                            65,

                        module:
                            "pdf-editor"
                    }
                ),

                create(
                    "calculator",
                    "Taschenrechner",
                    "office",
                    "🧮",
                    "Berechnungen durchführen.",
                    {
                        order:
                            66,

                        module:
                            "calculator"
                    }
                )

            );


            /* =================================================
               KOMMUNIKATION
               ================================================= */

            apps.push(

                create(
                    "messages",
                    "Nachrichten",
                    "communication",
                    "💬",
                    "Nachrichten und Unterhaltungen.",
                    {
                        order:
                            80,

                        module:
                            "messages"
                    }
                ),

                create(
                    "calls",
                    "Anrufe",
                    "communication",
                    "📞",
                    "Anruffunktionen.",
                    {
                        order:
                            81,

                        module:
                            "calls"
                    }
                ),

                create(
                    "video-calls",
                    "Videoanrufe",
                    "communication",
                    "📹",
                    "Video-Kommunikation.",
                    {
                        order:
                            82,

                        module:
                            "video-calls"
                    }
                ),

                create(
                    "contacts",
                    "Kontakte",
                    "communication",
                    "👤",
                    "Kontakte verwalten.",
                    {
                        order:
                            83,

                        module:
                            "contacts"
                    }
                ),

                create(
                    "chat-groups",
                    "Gruppen",
                    "communication",
                    "👥",
                    "Kommunikationsgruppen.",
                    {
                        order:
                            84,

                        module:
                            "chat-groups"
                    }
                ),

                create(
                    "email",
                    "E-Mail",
                    "communication",
                    "✉️",
                    "E-Mail-Kommunikation.",
                    {
                        order:
                            85,

                        module:
                            "email"
                    }
                )

            );


            /* =================================================
               INTERNET
               ================================================= */

            apps.push(

                create(
                    "browser",
                    "Browser",
                    "internet",
                    "🌐",
                    "Webseiten und Internetinhalte öffnen.",
                    {
                        favorite:
                            true,

                        order:
                            100,

                        module:
                            "browser"
                    }
                ),

                create(
                    "bookmarks",
                    "Lesezeichen",
                    "internet",
                    "🔖",
                    "Gespeicherte Webseiten.",
                    {
                        order:
                            101,

                        module:
                            "bookmarks"
                    }
                ),

                create(
                    "history",
                    "Verlauf",
                    "internet",
                    "🕘",
                    "Browser-Verlauf.",
                    {
                        order:
                            102,

                        module:
                            "history"
                    }
                ),

                create(
                    "downloads-browser",
                    "Browser Downloads",
                    "internet",
                    "⬇️",
                    "Browser-Downloads verwalten.",
                    {
                        order:
                            103,

                        module:
                            "downloads-browser"
                    }
                ),

                create(
                    "password-manager",
                    "Passwortverwaltung",
                    "security",
                    "🔐",
                    "Lokale Verwaltung von Zugangsdaten.",
                    {
                        order:
                            104,

                        module:
                            "password-manager",

                        permissions: [
                            "security.credentials"
                        ]
                    }
                )

            );


            /* =================================================
               MULTIMEDIA
               ================================================= */

            apps.push(

                create(
                    "gallery",
                    "Galerie",
                    "media",
                    "🖼️",
                    "Bilder und Medien anzeigen.",
                    {
                        order:
                            120,

                        module:
                            "gallery"
                    }
                ),

                create(
                    "camera",
                    "Kamera",
                    "media",
                    "📷",
                    "Kamera-Funktionen.",
                    {
                        order:
                            121,

                        module:
                            "camera",

                        permissions: [
                            "device.camera"
                        ]
                    }
                ),

                create(
                    "audio-recorder",
                    "Audiorekorder",
                    "media",
                    "🎙️",
                    "Audioaufnahmen.",
                    {
                        order:
                            122,

                        module:
                            "audio-recorder",

                        permissions: [
                            "device.microphone"
                        ]
                    }
                ),

                create(
                    "video-recorder",
                    "Videorekorder",
                    "media",
                    "🎥",
                    "Videoaufnahmen.",
                    {
                        order:
                            123,

                        module:
                            "video-recorder",

                        permissions: [
                            "device.camera",
                            "device.microphone"
                        ]
                    }
                ),

                create(
                    "media-player",
                    "Media Player",
                    "media",
                    "▶️",
                    "Zentrale Medienwiedergabe.",
                    {
                        order:
                            124,

                        module:
                            "media-player"
                    }
                ),

                create(
                    "music",
                    "Musik",
                    "media",
                    "🎵",
                    "Musikverwaltung und Wiedergabe.",
                    {
                        order:
                            125,

                        module:
                            "music"
                    }
                ),

                create(
                    "video",
                    "Videos",
                    "media",
                    "🎬",
                    "Videobibliothek.",
                    {
                        order:
                            126,

                        module:
                            "video"
                    }
                )

            );


            /* =================================================
               ORGANISATION
               ================================================= */

            apps.push(

                create(
                    "calendar",
                    "Kalender",
                    "productivity",
                    "📅",
                    "Termine und Kalender verwalten.",
                    {
                        favorite:
                            true,

                        order:
                            140,

                        module:
                            "calendar"
                    }
                ),

                create(
                    "todo",
                    "Aufgaben",
                    "productivity",
                    "☑️",
                    "Aufgaben verwalten.",
                    {
                        order:
                            141,

                        module:
                            "todo"
                    }
                ),

                create(
                    "notes",
                    "Notizen",
                    "productivity",
                    "🗒️",
                    "Notizen erstellen und verwalten.",
                    {
                        favorite:
                            true,

                        order:
                            142,

                        module:
                            "notes"
                    }
                ),

                create(
                    "reminders",
                    "Erinnerungen",
                    "productivity",
                    "⏰",
                    "Erinnerungen verwalten.",
                    {
                        order:
                            143,

                        module:
                            "reminders"
                    }
                ),

                create(
                    "habits",
                    "Gewohnheiten",
                    "productivity",
                    "📈",
                    "Persönliche Routinen verwalten.",
                    {
                        order:
                            144,

                        module:
                            "habits"
                    }
                ),

                create(
                    "stopwatch",
                    "Stoppuhr",
                    "productivity",
                    "⏱️",
                    "Stoppuhr.",
                    {
                        order:
                            145,

                        module:
                            "stopwatch"
                    }
                ),

                create(
                    "timer",
                    "Timer",
                    "productivity",
                    "⏲️",
                    "Timer.",
                    {
                        order:
                            146,

                        module:
                            "timer"
                    }
                ),

                create(
                    "alarm",
                    "Wecker",
                    "productivity",
                    "⏰",
                    "Wecker und Alarme.",
                    {
                        order:
                            147,

                        module:
                            "alarm"
                    }
                )

            );


            /* =================================================
               SPRACHE
               ================================================= */

            apps.push(

                create(
                    "speech-to-text",
                    "Sprache zu Text",
                    "language",
                    "🎙️",
                    "Gesprochene Sprache in Text umwandeln.",
                    {
                        order:
                            160,

                        module:
                            "speech-to-text",

                        permissions: [
                            "device.microphone"
                        ]
                    }
                ),

                create(
                    "text-to-speech",
                    "Text zu Sprache",
                    "language",
                    "🔊",
                    "Text vorlesen lassen.",
                    {
                        order:
                            161,

                        module:
                            "text-to-speech"
                    }
                ),

                create(
                    "language-center",
                    "Sprachzentrum",
                    "language",
                    "🌍",
                    "Sprach- und Übersetzungsfunktionen.",
                    {
                        order:
                            162,

                        module:
                            "language-center"
                    }
                ),

                create(
                    "dictionary",
                    "Wörterbuch",
                    "language",
                    "📖",
                    "Mehrsprachiges Wörterbuch.",
                    {
                        order:
                            163,

                        module:
                            "dictionary"
                    }
                )

            );


            /* =================================================
               ÊZÎDÎ
               ================================================= */

            apps.push(

                create(
                    "ezidi-language",
                    "Êzîdî Sprache",
                    "ezidi",
                    "𐺀",
                    "Êzîdî-Sprachfunktionen.",
                    {
                        order:
                            180,

                        module:
                            "ezidi-language",

                        capabilities: [
                            "ezidi-language"
                        ]
                    }
                ),

                create(
                    "ezidi-dictionary",
                    "Êzîdî Wörterbuch",
                    "ezidi",
                    "📖",
                    "Êzîdî-Wörterbuch.",
                    {
                        order:
                            181,

                        module:
                            "ezidi-dictionary"
                    }
                ),

                create(
                    "ezidi-input",
                    "Êzîdî Eingabe",
                    "ezidi",
                    "⌨️",
                    "Spezielle Êzîdî-Eingabe.",
                    {
                        order:
                            182,

                        module:
                            "ezidi-input",

                        permissions: [
                            "keyboard.custom"
                        ]
                    }
                ),

                create(
                    "ezidi-keyboard",
                    "Êzîdî Tastatur",
                    "ezidi",
                    "⌨️",
                    "Êzîdî-Tastatur mit speziellen Zeichen und Layouts.",
                    {
                        order:
                            183,

                        module:
                            "ezidi-keyboard",

                        dependencies: [
                            "ezidi-input"
                        ]
                    }
                )

            );


            /* =================================================
               SICHERHEIT
               ================================================= */

            apps.push(

                create(
                    "security-center",
                    "Security Center",
                    "security",
                    "🛡️",
                    "Zentrale Sicherheitsfunktionen.",
                    {
                        system:
                            true,

                        order:
                            200,

                        module:
                            "security-center"
                    }
                ),

                create(
                    "permissions",
                    "Berechtigungen",
                    "security",
                    "🔑",
                    "App-Berechtigungen verwalten.",
                    {
                        order:
                            201,

                        module:
                            "permissions"
                    }
                ),

                create(
                    "privacy",
                    "Datenschutz",
                    "security",
                    "🔒",
                    "Datenschutz- und Privatsphäre-Einstellungen.",
                    {
                        order:
                            202,

                        module:
                            "privacy"
                    }
                ),

                create(
                    "password-manager",
                    "Passwortverwaltung",
                    "security",
                    "🔐",
                    "Zugangsdaten lokal verwalten.",
                    {
                        order:
                            203,

                        module:
                            "password-manager"
                    }
                )

            );


            /* =================================================
               BACKUP / WIEDERHERSTELLUNG
               ================================================= */

            apps.push(

                create(
                    "backup",
                    "Backup",
                    "backup",
                    "💾",
                    "Lokale Sicherungen von HalDo-Daten.",
                    {
                        order:
                            220,

                        module:
                            "backup"
                    }
                ),

                create(
                    "restore",
                    "Wiederherstellung",
                    "backup",
                    "♻️",
                    "Wiederherstellung von Systemdaten.",
                    {
                        order:
                            221,

                        module:
                            "restore"
                    }
                ),

                create(
                    "data-export",
                    "Daten exportieren",
                    "backup",
                    "📤",
                    "HalDo-Daten exportieren.",
                    {
                        order:
                            222,

                        module:
                            "data-export"
                    }
                ),

                create(
                    "data-import",
                    "Daten importieren",
                    "backup",
                    "📥",
                    "HalDo-Daten importieren.",
                    {
                        order:
                            223,

                        module:
                            "data-import"
                    }
                )

            );


            /* =================================================
               ENTWICKLER
               ================================================= */

            apps.push(

                create(
                    "console",
                    "Konsole",
                    "developer",
                    "⌘",
                    "Entwicklerkonsole.",
                    {
                        order:
                            240,

                        module:
                            "console",

                        permissions: [
                            "developer.console"
                        ]
                    }
                ),

                create(
                    "module-center",
                    "Module",
                    "developer",
                    "🧩",
                    "Verwaltung von Systemmodulen.",
                    {
                        order:
                            241,

                        module:
                            "module-center"
                    }
                ),

                create(
                    "app-developer",
                    "App Entwickler",
                    "developer",
                    "🧑‍💻",
                    "Entwicklung eigener HalDo Apps.",
                    {
                        order:
                            242,

                        module:
                            "app-developer"
                    }
                ),

                create(
                    "developer-tools",
                    "Developer Tools",
                    "developer",
                    "🛠️",
                    "Werkzeuge zur Entwicklung und Diagnose.",
                    {
                        order:
                            243,

                        module:
                            "developer-tools"
                    }
                ),

                create(
                    "system-diagnostics",
                    "Systemdiagnose",
                    "developer",
                    "🩺",
                    "Diagnose von HalDo AI OS Komponenten.",
                    {
                        system:
                            true,

                        order:
                            244,

                        module:
                            "system-diagnostics"
                    }
                )

            );


            /* =================================================
               PERSONEN / LIFESTYLE
               ================================================= */

            apps.push(

                create(
                    "weather",
                    "Wetter",
                    "lifestyle",
                    "☀️",
                    "Wetterinformationen.",
                    {
                        order:
                            260,

                        module:
                            "weather"
                    }
                ),

                create(
                    "world-clock",
                    "Weltuhr",
                    "lifestyle",
                    "🌍",
                    "Uhrzeiten verschiedener Zeitzonen.",
                    {
                        order:
                            261,

                        module:
                            "world-clock"
                    }
                ),

                create(
                    "calculator-pro",
                    "Pro Rechner",
                    "lifestyle",
                    "🧮",
                    "Erweiterter Rechner.",
                    {
                        order:
                            262,

                        module:
                            "calculator-pro"
                    }
                )

            );


            /* =================================================
               SYSTEM-WERKZEUGE
               ================================================= */

            apps.push(

                create(
                    "storage",
                    "Speicher",
                    "system-tools",
                    "💽",
                    "Verwaltung des lokalen HalDo-Speichers.",
                    {
                        order:
                            280,

                        module:
                            "storage"
                    }
                ),

                create(
                    "storage-manager",
                    "Speicherverwaltung",
                    "system-tools",
                    "🗄️",
                    "Erweiterte Speicherverwaltung.",
                    {
                        order:
                            281,

                        module:
                            "storage-manager"
                    }
                ),

                create(
                    "language-manager",
                    "Sprachverwaltung",
                    "system-tools",
                    "🌐",
                    "Verwaltung der installierten Sprachen.",
                    {
                        order:
                            282,

                        module:
                            "language-manager"
                    }
                ),

                create(
                    "module-manager",
                    "Modulverwaltung",
                    "system-tools",
                    "🧩",
                    "Verwaltung der Systemmodule.",
                    {
                        order:
                            283,

                        module:
                            "module-manager"
                    }
                ),

                create(
                    "window-manager",
                    "Fensterverwaltung",
                    "system-tools",
                    "▣",
                    "Verwaltung von App-Fenstern.",
                    {
                        order:
                            284,

                        module:
                            "window-manager"
                    }
                ),

                create(
                    "shell",
                    "HalDo Shell",
                    "system-tools",
                    "⌘",
                    "Zentrale HalDo System-Shell.",
                    {
                        system:
                            true,

                        order:
                            285,

                        module:
                            "shell"
                    }
                )

            );


            /* =================================================
               REGISTRY VALIDIEREN
               ================================================= */

            const unique =
                new Map();


            apps.forEach(
                app => {

                    if (
                        !app ||
                        !app.id
                    ) {

                        return;

                    }


                    if (
                        unique.has(
                            app.id
                        )
                    ) {

                        log(
                            `Doppelte App-ID erkannt: ${app.id}`,
                            "warning"
                        );


                        return;

                    }


                    unique.set(
                        app.id,
                        app
                    );

                }
            );


            this.definitions =
                Array.from(
                    unique.values()
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        (
                            Number(
                                a.order
                            ) || 999999
                        ) -
                        (
                            Number(
                                b.order
                            ) || 999999
                        )
                );


            state.built =
                true;


            emit(
                "built",
                {

                    count:
                        this.definitions.length

                }
            );


            return this.definitions;

        },


        /* ====================================================
           ALLE APPS
           ==================================================== */

        getAll() {

            if (
                !state.built
            ) {

                this.build();

            }


            return [
                ...this.definitions
            ];

        },


        /*
         * Kompatibilitätsalias.
         */

        getAllApps() {

            return this.getAll();

        },


        /* ====================================================
           APP SUCHEN
           ==================================================== */

        find(
            appId
        ) {

            const normalized =
                normalizeId(
                    appId
                );


            if (
                !normalized
            ) {

                return null;

            }


            if (
                !state.built
            ) {

                this.build();

            }


            return (
                this.definitions.find(
                    app =>
                        app.id ===
                        normalized
                ) ||
                null
            );

        },


        /*
         * Kompatibilitätsalias.
         */

        findApp(
            appId
        ) {

            return this.find(
                appId
            );

        },


        /*
         * Kompatibilitätsalias.
         */

        getApp(
            appId
        ) {

            return this.find(
                appId
            );

        },


        /* ====================================================
           EXISTENZ
           ==================================================== */

        has(
            appId
        ) {

            return Boolean(
                this.find(
                    appId
                )
            );

        },


        /* ====================================================
           KATEGORIE
           ==================================================== */

        getCategory(
            category
        ) {

            const normalized =
                String(
                    category ||
                    ""
                )
                .trim()
                .toLowerCase();


            if (
                !normalized
            ) {

                return [];

            }


            return this.getAll()
                .filter(
                    app =>
                        String(
                            app.category ||
                            ""
                        )
                        .trim()
                        .toLowerCase() ===
                        normalized
                );

        },


        /* ====================================================
           KATEGORIEN
           ==================================================== */

        getCategories() {

            const categories =
                new Set();


            this.getAll()
                .forEach(
                    app => {

                        if (
                            app.category
                        ) {

                            categories.add(
                                app.category
                            );

                        }

                    }
                );


            return Array.from(
                categories
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    a.localeCompare(
                        b,
                        "de"
                    )
            );

        },


        /* ====================================================
           REGISTRIEREN
           ==================================================== */

        register(
            definition
        ) {

            if (
                !definition ||
                !definition.id
            ) {

                return false;

            }


            if (
                !state.built
            ) {

                this.build();

            }


            const normalizedId =
                normalizeId(
                    definition.id
                );


            if (
                !normalizedId
            ) {

                return false;

            }


            const existingIndex =
                this.definitions.findIndex(
                    app =>
                        app.id ===
                        normalizedId
                );


            const normalizedDefinition =
                create(
                    normalizedId,
                    definition.name ||
                        definition.title ||
                        normalizedId,
                    definition.category ||
                        "system",
                    definition.icon ||
                        "◉",
                    definition.description ||
                        "",
                    definition
                );


            if (
                existingIndex >=
                0
            ) {

                /*
                 * Bestehende Definition wird
                 * bewusst nicht blind überschrieben.
                 *
                 * Nur zusätzliche Metadaten
                 * werden übernommen.
                 */

                const existing =
                    this.definitions[
                        existingIndex
                    ];


                this.definitions[
                    existingIndex
                ] = {

                    ...existing,

                    ...normalizedDefinition,

                    id:
                        existing.id

                };


                emit(
                    "updated",
                    this.definitions[
                        existingIndex
                    ]
                );


                return true;

            }


            this.definitions.push(
                normalizedDefinition
            );


            this.definitions.sort(
                (
                    a,
                    b
                ) =>
                    (
                        Number(
                            a.order
                        ) || 999999
                    ) -
                    (
                        Number(
                            b.order
                        ) || 999999
                    )
            );


            emit(
                "registered",
                normalizedDefinition
            );


            return true;

        },


        /* ====================================================
           ENTFERNEN
           ==================================================== */

        unregister(
            appId
        ) {

            const normalized =
                normalizeId(
                    appId
                );


            const index =
                this.definitions.findIndex(
                    app =>
                        app.id ===
                        normalized
                );


            if (
                index <
                0
            ) {

                return false;

            }


            const app =
                this.definitions[
                    index
                ];


            /*
             * Kritische System-Apps
             * werden geschützt.
             */

            if (
                app.critical ===
                true
            ) {

                log(
                    `Kritische App darf nicht entfernt werden: ${app.id}`,
                    "warning"
                );


                return false;

            }


            this.definitions.splice(
                index,
                1
            );


            emit(
                "unregistered",
                app
            );


            return true;

        },


        /* ====================================================
           SUCHEN
           ==================================================== */

        search(
            query
        ) {

            const text =
                String(
                    query ||
                    ""
                )
                .trim()
                .toLowerCase();


            if (
                !text
            ) {

                return this.getAll();

            }


            return this.getAll()
                .filter(
                    app => {

                        const searchable = [

                            app.id,

                            app.name,

                            app.title,

                            app.category,

                            app.description,

                            app.icon,

                            ...app.keywords,

                            ...app.capabilities

                        ]
                        .join(
                            " "
                        )
                        .toLowerCase();


                        return searchable.includes(
                            text
                        );

                    }
                );

        },


        /* ====================================================
           DIAGNOSE
           ==================================================== */

        diagnose() {

            const apps =
                this.getAll();


            const categories =
                this.getCategories();


            return {

                name:
                    CONFIG.name,

                version:
                    CONFIG.version,

                initialized:
                    state.initialized,

                built:
                    state.built,

                registered:
                    state.registered,

                managerReady:
                    state.managerReady,

                appCount:
                    apps.length,

                categories,

                systemApps:
                    apps.filter(
                        app =>
                            app.system ===
                            true
                    ).length,

                criticalApps:
                    apps.filter(
                        app =>
                            app.critical ===
                            true
                    ).length,

                moduleReadyApps:
                    apps.filter(
                        app =>
                            Boolean(
                                app.module
                            )
                    ).length,

                lastError:
                    state.lastError

            };

        }

    };


    /* ========================================================
       08 — MANAGER VERBINDUNG
       ======================================================== */

    function getManager() {

        return (
            window.HalDoAppManager ||
            null
        );

    }


    function registerWithManager() {

        const manager =
            getManager();


        if (
            !manager
        ) {

            state.managerReady =
                false;


            return false;

        }


        state.managerReady =
            true;


        let count =
            0;


        /*
         * Der Manager besitzt normalerweise
         * bereits Zugriff auf getAll().
         *
         * Wir registrieren daher nur dann
         * explizit, wenn eine kompatible
         * register()-API vorhanden ist.
         */

        if (
            typeof manager.register ===
            "function"
        ) {

            thisDefinitionsLoop:
            for (
                const app
                of registry.getAll()
            ) {

                try {

                    /*
                     * Wenn die App bereits
                     * vorhanden ist, nicht
                     * erneut registrieren.
                     */

                    if (
                        typeof manager.has ===
                        "function" &&
                        manager.has(
                            app.id
                        )
                    ) {

                        continue;

                    }


                    if (
                        manager.register(
                            app
                        )
                    ) {

                        count++;

                    }

                }
                catch (
                    error
                ) {

                    log(
                        `Manager konnte ${app.id} nicht registrieren: ${error.message}`,
                        "warning"
                    );

                }

            }

        }


        state.registrationCount =
            count;


        state.registered =
            true;


        emit(
            "manager-ready",
            {

                count,

                total:
                    registry.getAll().length

            }
        );


        return true;

    }


    /* ========================================================
       09 — INITIALISIERUNG
       ======================================================== */

    function initialize() {

        if (
            state.initialized
        ) {

            return true;

        }


        registry.build();


        state.initialized =
            true;


        /*
         * Globale Registry-Objekte
         * bereitstellen.
         */

        window.HalDoAppRegistry =
            registry;


        window.HalDo =
            window.HalDo ||
            {};


        window.HalDo.appRegistry =
            registry;


        window.HalDoOS =
            window.HalDoOS ||
            {};


        window.HalDoOS.appRegistry =
            registry;


        /*
         * Gemeinsame Modulcontainer
         * vorbereiten.
         */

        window.HalDoApps =
            window.HalDoApps ||
            {};


        window.HalDoAppModules =
            window.HalDoAppModules ||
            {};


        /*
         * Wenn der Manager bereits
         * verfügbar ist, verbinden.
         */

        if (
            getManager()
        ) {

            registerWithManager();

        }
        else {

            /*
             * Der App Manager kann später
             * durch den Kernel geladen werden.
             */

            window.addEventListener(
                "haldo:app-manager-ready",
                function () {

                    registerWithManager();

                },
                {
                    once:
                        true
                }
            );

        }


        emit(
            "ready",
            registry.diagnose()
        );


        log(
            `${registry.getAll().length} App-Definitionen vorbereitet.`
        );


        return true;

    }


    /* ========================================================
       10 — PUBLIC API
       ======================================================== */

    registry.initialize =
        initialize;


    registry.on =
        on;


    registry.off =
        off;


    registry.create =
        create;


    registry.normalizeId =
        normalizeId;


    registry.diagnose =
        registry.diagnose.bind(
            registry
        );


    /* ========================================================
       11 — GLOBAL
       ======================================================== */

    window.HalDoAppRegistry =
        registry;


    window.HalDo =
        window.HalDo ||
        {};


    window.HalDo.appRegistry =
        registry;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appRegistry =
        registry;


    /* ========================================================
       12 — START
       ======================================================== */

    function boot() {

        initialize();

    }


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

    }
    else {

        boot();

    }


    /* ========================================================
       13 — DEBUG
       ======================================================== */

    console.log(
        "=============================================="
    );

    console.log(
        "HalDo AI OS 18 App Registry"
    );

    console.log(
        "Professional Ultimate Foundation"
    );

    console.log(
        "App-Definitionen:",
        registry.getAll().length
    );

    console.log(
        "=============================================="
    );


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 APP REGISTRY
   ============================================================ */