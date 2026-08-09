/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/app-registry.js

   ZENTRALE APP REGISTRY
   ------------------------------------------------------------
   Verantwortlich für:

   - zentrale App-Definitionen
   - vollständige App-Metadaten
   - Kategorien
   - Suchbegriffe
   - Favoriten
   - Reihenfolge
   - System-/Benutzer-Apps
   - Berechtigungen
   - Abhängigkeiten
   - Modul-IDs
   - zukünftige App-Erweiterungen
   - sichere Verbindung zum App Manager

   WICHTIG:

   Diese Datei besitzt keine zweite Laufzeit-App-Liste.

   Die Registry ist die zentrale Quelle der App-Definitionen.

   Architektur:

       app-registry.js
              ↓
       app-manager.js
              ↓
       app-router.js
              ↓
       echte App-Module

   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const CONFIG = {

        name:
            "HalDo AI OS App Registry",

        version:
            "18.0.0",

        apiVersion:
            "1.0.0",

        defaultCategory:
            "system",

        defaultVersion:
            "18.0.0"

    };


    /* ========================================================
       02 — INTERNE DEFINITIONEN
       ======================================================== */

    const definitions = [];


    /* ========================================================
       03 — STATUS
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        managerConnected:
            false,

        registeredCount:
            0,

        lastError:
            null

    };


    /* ========================================================
       04 — EVENT SYSTEM
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
            listeners[eventName]
                .filter(
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
       05 — HILFSFUNKTIONEN
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
            Array.isArray(
                value
            )
        ) {

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
                                )
                                .trim()
                        )
                        .filter(
                            Boolean
                        )
                )
            ];

        }


        if (
            typeof value ===
            "string" &&
            value.trim()
        ) {

            return [
                value.trim()
            ];

        }


        return [];

    }


    function normalizeOrder(
        value
    ) {

        const number =
            Number(
                value
            );


        if (
            Number.isFinite(
                number
            )
        ) {

            return number;

        }


        return 999999;

    }


    /* ========================================================
       06 — APP DEFINITION ERSTELLEN
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


        if (
            !normalizedId
        ) {

            throw new Error(
                "Eine App benötigt eine gültige ID."
            );

        }


        return {

            /*
             * Grunddaten
             */

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
                    CONFIG.defaultCategory
                ),

            icon:
                icon ||
                "◉",

            description:
                String(
                    description ||
                    ""
                ),


            /*
             * Aktivierung
             */

            enabled:
                options.enabled !==
                false,

            installed:
                options.installed !==
                false,

            favorite:
                options.favorite ===
                true,

            autoStart:
                options.autoStart ===
                true,


            /*
             * System
             */

            system:
                options.system ===
                true,

            critical:
                options.critical ===
                true,


            /*
             * Version
             */

            version:
                options.version ||
                CONFIG.defaultVersion,


            apiVersion:
                options.apiVersion ||
                CONFIG.apiVersion,


            /*
             * Sortierung
             */

            order:
                normalizeOrder(
                    options.order
                ),


            /*
             * Suche
             */

            keywords:
                normalizeArray(
                    options.keywords
                ),


            /*
             * Berechtigungen
             */

            permissions:
                normalizeArray(
                    options.permissions
                ),


            /*
             * Abhängigkeiten
             */

            dependencies:
                normalizeArray(
                    options.dependencies
                ),


            /*
             * Modul-Verbindung
             */

            module:
                options.module ||
                normalizedId,

            moduleId:
                options.moduleId ||
                normalizedId,


            /*
             * zukünftige Oberfläche
             */

            route:
                options.route ||
                null,

            view:
                options.view ||
                null,


            /*
             * Plattform
             */

            platform:
                options.platform ||
                "haldo-os",


            /*
             * Erweiterbare Metadaten
             */

            metadata:
                (
                    options.metadata &&
                    typeof options.metadata ===
                    "object"
                )
                    ? {
                        ...options.metadata
                    }
                    : {}

        };

    }


    /* ========================================================
       07 — APP HINZUFÜGEN
       ======================================================== */

    function addDefinition(
        definition
    ) {

        if (
            !definition ||
            !definition.id
        ) {

            return false;

        }


        const id =
            normalizeId(
                definition.id
            );


        const existingIndex =
            definitions.findIndex(
                app =>
                    app.id ===
                    id
            );


        const normalized = {

            ...definition,

            id

        };


        if (
            existingIndex >=
            0
        ) {

            definitions[
                existingIndex
            ] =
                normalized;

        }
        else {

            definitions.push(
                normalized
            );

        }


        return true;

    }


    /* ========================================================
       08 — APP ENTFERNEN
       ======================================================== */

    function remove(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const index =
            definitions.findIndex(
                app =>
                    app.id ===
                    id
            );


        if (
            index <
            0
        ) {

            return false;

        }


        definitions.splice(
            index,
            1
        );


        return true;

    }


    /* ========================================================
       09 — APP FINDEN
       ======================================================== */

    function find(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        return (
            definitions.find(
                app =>
                    app.id ===
                    id
            ) ||
            null
        );

    }


    /* ========================================================
       10 — ALLE APPS
       ======================================================== */

    function getAll() {

        return [
            ...definitions
        ];

    }


    /* ========================================================
       11 — KATEGORIEN
       ======================================================== */

    function getCategories() {

        return [
            ...new Set(
                definitions
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


    function getCategory(
        category
    ) {

        const normalized =
            String(
                category ||
                ""
            )
            .trim()
            .toLowerCase();


        return definitions.filter(
            app =>
                String(
                    app.category
                )
                .toLowerCase() ===
                normalized
        );

    }


    /* ========================================================
       12 — FAVORITEN
       ======================================================== */

    function getFavorites() {

        return definitions.filter(
            app =>
                app.favorite ===
                true
        );

    }


    /* ========================================================
       13 — AKTIVE APPS
       ======================================================== */

    function getEnabledApps() {

        return definitions.filter(
            app =>
                app.enabled !==
                false
        );

    }


    /* ========================================================
       14 — SYSTEM APPS
       ======================================================== */

    function getSystemApps() {

        return definitions.filter(
            app =>
                app.system ===
                true
        );

    }


    /* ========================================================
       15 — AUTO-START APPS
       ======================================================== */

    function getAutoStartApps() {

        return definitions.filter(
            app =>
                app.autoStart ===
                true
        );

    }


    /* ========================================================
       16 — SUCHE
       ======================================================== */

    function searchApps(
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

            return getAll();

        }


        return definitions.filter(
            app => {

                const searchable = [

                    app.id,

                    app.name,

                    app.title,

                    app.description,

                    app.category,

                    ...normalizeArray(
                        app.keywords
                    )

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

    }


    /* ========================================================
       17 — SORTIERTE APPS
       ======================================================== */

    function getSortedApps() {

        return getAll()
            .sort(
                (
                    a,
                    b
                ) =>
                    (
                        normalizeOrder(
                            a.order
                        ) -
                        normalizeOrder(
                            b.order
                        )
                    )
            );

    }


    /* ========================================================
       18 — APP MANAGER VERBINDUNG
       ======================================================== */

    function getManager() {

        return (
            window.HalDoAppManager ||
            null
        );

    }


    function connectManager() {

        const manager =
            getManager();


        if (
            !manager
        ) {

            state.managerConnected =
                false;

            return false;

        }


        state.managerConnected =
            true;


        return true;

    }


    /* ========================================================
       19 — REGISTRY → MANAGER
       ======================================================== */

    function registerAll() {

        const manager =
            getManager();


        if (
            !manager
        ) {

            state.managerConnected =
                false;

            state.lastError =
                "HalDoAppManager ist noch nicht verfügbar.";

            emit(
                "manager-missing",
                {
                    error:
                        state.lastError
                }
            );


            return false;

        }


        state.managerConnected =
            true;


        /*
         * WICHTIG:
         *
         * Wir benutzen hier nur APIs,
         * die der aktuelle App Manager
         * tatsächlich bereitstellen kann.
         *
         * Es wird NICHT mehr blind
         * manager.has() oder manager.register()
         * aufgerufen.
         */

        if (
            typeof manager.syncRegistry !==
            "function"
        ) {

            state.lastError =
                "Der App Manager besitzt noch keine syncRegistry()-Schnittstelle.";


            emit(
                "manager-incompatible",
                {
                    error:
                        state.lastError
                }
            );


            return false;

        }


        const result =
            manager.syncRegistry(
                getAll()
            );


        if (
            result ===
            false
        ) {

            state.lastError =
                "Die App Registry konnte nicht mit dem App Manager synchronisiert werden.";


            return false;

        }


        state.registeredCount =
            definitions.length;


        state.lastError =
            null;


        emit(
            "registered",
            {

                count:
                    state.registeredCount

            }
        );


        return true;

    }


    /* ========================================================
       20 — BUILD
       ======================================================== */

    function build() {

        definitions.length =
            0;


        /*
        ========================================================
        AI
        ========================================================
        */

        addDefinition(
            create(
                "ai-assistant",
                "AI Assistent",
                "ai",
                "assets/logo/logo.png",
                "Zentrale intelligente HalDo AI Assistenz.",
                {
                    system: true,
                    critical: true,
                    favorite: true,
                    autoStart: true,
                    order: 10,
                    keywords: [
                        "ai",
                        "assistant",
                        "assistent",
                        "haldo",
                        "ki",
                        "chat"
                    ],
                    permissions: [
                        "ai",
                        "speech",
                        "storage"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "ai-chat",
                "AI Chat",
                "ai",
                "💬",
                "Intelligenter Chat mit HalDo AI.",
                {
                    order: 11,
                    keywords: [
                        "chat",
                        "ki",
                        "ai"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "ai-image",
                "AI Bilder",
                "ai",
                "🖼️",
                "AI-Bildfunktionen.",
                {
                    order: 12,
                    keywords: [
                        "bild",
                        "image",
                        "foto",
                        "ai"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "ai-writing",
                "AI Schreiben",
                "ai",
                "✍️",
                "Texte mit HalDo AI erstellen und bearbeiten.",
                {
                    order: 13,
                    keywords: [
                        "schreiben",
                        "text",
                        "writer"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "ai-code",
                "AI Code",
                "ai",
                "💻",
                "Unterstützung beim Programmieren.",
                {
                    order: 14,
                    keywords: [
                        "code",
                        "programmieren",
                        "developer"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "ai-translate",
                "AI Übersetzung",
                "ai",
                "🌐",
                "Intelligente Übersetzung.",
                {
                    order: 15,
                    keywords: [
                        "übersetzung",
                        "translate",
                        "sprache"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "ai-search",
                "AI Suche",
                "ai",
                "🔎",
                "Intelligente Suche und Informationsverarbeitung.",
                {
                    order: 16,
                    keywords: [
                        "suche",
                        "search",
                        "web"
                    ]
                }
            )
        );


        /*
        ========================================================
        SYSTEM / DESKTOP
        ========================================================
        */

        addDefinition(
            create(
                "home",
                "Startseite",
                "system",
                "assets/logo/logo.png",
                "Zentrale HalDo AI OS Startseite.",
                {
                    system: true,
                    critical: true,
                    favorite: true,
                    order: 100,
                    keywords: [
                        "home",
                        "start",
                        "desktop"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "desktop",
                "Desktop",
                "system",
                "▦",
                "HalDo AI OS Desktop.",
                {
                    system: true,
                    critical: true,
                    order: 101,
                    keywords: [
                        "desktop",
                        "oberfläche"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "control-center",
                "Kontrollzentrum",
                "system",
                "🎛️",
                "Zentrale Schnellzugriffe und Systemeinstellungen.",
                {
                    system: true,
                    order: 102
                }
            )
        );


        addDefinition(
            create(
                "app-center",
                "App Center",
                "system",
                "▦",
                "Zentrale Verwaltung und Startpunkt aller HalDo Apps.",
                {
                    system: true,
                    favorite: true,
                    order: 103
                }
            )
        );


        addDefinition(
            create(
                "settings",
                "Einstellungen",
                "system",
                "⚙️",
                "Zentrale HalDo AI OS Einstellungen.",
                {
                    system: true,
                    order: 104,
                    keywords: [
                        "settings",
                        "einstellungen",
                        "konfiguration"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "startup",
                "Systemstart",
                "system",
                "🚀",
                "Informationen und Steuerung des Systemstarts.",
                {
                    system: true,
                    order: 105
                }
            )
        );


        addDefinition(
            create(
                "system-status",
                "Systemstatus",
                "system",
                "📊",
                "Status und Diagnose des Betriebssystems.",
                {
                    system: true,
                    order: 106
                }
            )
        );


        addDefinition(
            create(
                "system-info",
                "Systeminformationen",
                "system",
                "ℹ️",
                "Informationen über HalDo AI OS.",
                {
                    system: true,
                    order: 107
                }
            )
        );


        /*
        ========================================================
        DATEIEN
        ========================================================
        */

        addDefinition(
            create(
                "file-manager",
                "Dateimanager",
                "files",
                "📁",
                "Dateien und Ordner verwalten.",
                {
                    order: 200,
                    keywords: [
                        "dateien",
                        "files",
                        "ordner",
                        "file manager"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "downloads",
                "Downloads",
                "files",
                "⬇️",
                "Heruntergeladene Dateien.",
                {
                    order: 201
                }
            )
        );


        addDefinition(
            create(
                "recent-files",
                "Zuletzt verwendet",
                "files",
                "🕘",
                "Zuletzt verwendete Dateien.",
                {
                    order: 202
                }
            )
        );


        addDefinition(
            create(
                "favorites-files",
                "Datei-Favoriten",
                "files",
                "⭐",
                "Favorisierte Dateien und Ordner.",
                {
                    order: 203
                }
            )
        );


        addDefinition(
            create(
                "storage",
                "Speicher",
                "files",
                "💾",
                "Lokale Speicherverwaltung.",
                {
                    order: 204
                }
            )
        );


        /*
        ========================================================
        OFFICE
        ========================================================
        */

        addDefinition(
            create(
                "text-editor",
                "Texteditor",
                "office",
                "📄",
                "Texte erstellen und bearbeiten.",
                {
                    order: 300
                }
            )
        );


        addDefinition(
            create(
                "notes",
                "Notizen",
                "office",
                "📝",
                "Notizen erstellen und verwalten.",
                {
                    order: 301
                }
            )
        );


        addDefinition(
            create(
                "spreadsheet",
                "Tabellen",
                "office",
                "📊",
                "Tabellen und Daten bearbeiten.",
                {
                    order: 302
                }
            )
        );


        addDefinition(
            create(
                "presentation",
                "Präsentationen",
                "office",
                "📽️",
                "Präsentationen erstellen.",
                {
                    order: 303
                }
            )
        );


        addDefinition(
            create(
                "pdf-reader",
                "PDF Reader",
                "office",
                "📕",
                "PDF-Dokumente anzeigen.",
                {
                    order: 304
                }
            )
        );


        /*
        ========================================================
        INTERNET
        ========================================================
        */

        addDefinition(
            create(
                "browser",
                "Browser",
                "internet",
                "🌐",
                "Webseiten und Internetinhalte öffnen.",
                {
                    order: 400,
                    keywords: [
                        "web",
                        "internet",
                        "browser"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "bookmarks",
                "Lesezeichen",
                "internet",
                "🔖",
                "Gespeicherte Webseiten.",
                {
                    order: 401
                }
            )
        );


        addDefinition(
            create(
                "history",
                "Verlauf",
                "internet",
                "🕘",
                "Browser-Verlauf.",
                {
                    order: 402
                }
            )
        );


        /*
        ========================================================
        KOMMUNIKATION
        ========================================================
        */

        addDefinition(
            create(
                "messages",
                "Nachrichten",
                "communication",
                "💬",
                "Nachrichten und Chats.",
                {
                    order: 500
                }
            )
        );


        addDefinition(
            create(
                "calls",
                "Anrufe",
                "communication",
                "📞",
                "Anruffunktionen.",
                {
                    order: 501
                }
            )
        );


        addDefinition(
            create(
                "video-calls",
                "Videoanrufe",
                "communication",
                "📹",
                "Video-Kommunikation.",
                {
                    order: 502
                }
            )
        );


        addDefinition(
            create(
                "chat-groups",
                "Gruppen",
                "communication",
                "👥",
                "Kommunikationsgruppen.",
                {
                    order: 503
                }
            )
        );


        /*
        ========================================================
        MEDIEN
        ========================================================
        */

        addDefinition(
            create(
                "gallery",
                "Galerie",
                "media",
                "🖼️",
                "Bildergalerie.",
                {
                    order: 600
                }
            )
        );


        addDefinition(
            create(
                "camera",
                "Kamera",
                "media",
                "📷",
                "Kamera und Fotoaufnahme.",
                {
                    order: 601,
                    permissions: [
                        "camera"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "audio-recorder",
                "Audiorekorder",
                "media",
                "🎙️",
                "Audioaufnahmen.",
                {
                    order: 602,
                    permissions: [
                        "microphone"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "video-recorder",
                "Videorekorder",
                "media",
                "🎥",
                "Videoaufnahmen.",
                {
                    order: 603,
                    permissions: [
                        "camera",
                        "microphone"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "media-player",
                "Media Player",
                "media",
                "▶️",
                "Zentrale Medienwiedergabe.",
                {
                    order: 604
                }
            )
        );


        /*
        ========================================================
        ORGANISATION
        ========================================================
        */

        addDefinition(
            create(
                "calendar",
                "Kalender",
                "productivity",
                "📅",
                "Termine und Kalender verwalten.",
                {
                    order: 700
                }
            )
        );


        addDefinition(
            create(
                "contacts",
                "Kontakte",
                "productivity",
                "👤",
                "Kontakte verwalten.",
                {
                    order: 701
                }
            )
        );


        addDefinition(
            create(
                "todo",
                "Aufgaben",
                "productivity",
                "☑️",
                "Aufgaben verwalten.",
                {
                    order: 702
                }
            )
        );


        addDefinition(
            create(
                "habits",
                "Gewohnheiten",
                "productivity",
                "📈",
                "Persönliche Routinen verwalten.",
                {
                    order: 703
                }
            )
        );


        addDefinition(
            create(
                "calculator",
                "Rechner",
                "productivity",
                "🧮",
                "Berechnungen durchführen.",
                {
                    order: 704
                }
            )
        );


        addDefinition(
            create(
                "clock",
                "Uhr",
                "productivity",
                "🕐",
                "Uhrzeit und Zeitzonen.",
                {
                    order: 705
                }
            )
        );


        addDefinition(
            create(
                "stopwatch",
                "Stoppuhr",
                "productivity",
                "⏱️",
                "Stoppuhr.",
                {
                    order: 706
                }
            )
        );


        addDefinition(
            create(
                "timer",
                "Timer",
                "productivity",
                "⏲️",
                "Timer.",
                {
                    order: 707
                }
            )
        );


        /*
        ========================================================
        SPRACHE
        ========================================================
        */

        addDefinition(
            create(
                "speech-to-text",
                "Sprache zu Text",
                "language",
                "🎙️",
                "Gesprochene Sprache in Text umwandeln.",
                {
                    order: 800,
                    permissions: [
                        "microphone"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "text-to-speech",
                "Text zu Sprache",
                "language",
                "🔊",
                "Text vorlesen lassen.",
                {
                    order: 801
                }
            )
        );


        addDefinition(
            create(
                "language-center",
                "Sprachzentrum",
                "language",
                "🌍",
                "Sprach- und Übersetzungsfunktionen.",
                {
                    order: 802
                }
            )
        );


        /*
        ========================================================
        ÊZÎDÎ
        ========================================================
        */

        addDefinition(
            create(
                "ezidi-language",
                "Êzîdî Sprache",
                "ezidi",
                "𐺀",
                "Êzîdî-Sprachfunktionen.",
                {
                    order: 900,
                    keywords: [
                        "ezidi",
                        "êzîdî",
                        "ezîdî",
                        "sprache"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "ezidi-dictionary",
                "Êzîdî Wörterbuch",
                "ezidi",
                "📖",
                "Êzîdî-Wörterbuch.",
                {
                    order: 901
                }
            )
        );


        addDefinition(
            create(
                "ezidi-input",
                "Êzîdî Eingabe",
                "ezidi",
                "⌨️",
                "Spezielle Êzîdî-Tastatur und Eingabe.",
                {
                    order: 902,
                    keywords: [
                        "tastatur",
                        "keyboard",
                        "ezidi"
                    ]
                }
            )
        );


        /*
        ========================================================
        SICHERHEIT
        ========================================================
        */

        addDefinition(
            create(
                "password-manager",
                "Passwortverwaltung",
                "security",
                "🔐",
                "Lokale Verwaltung von Zugangsdaten.",
                {
                    order: 1000,
                    permissions: [
                        "secure-storage"
                    ]
                }
            )
        );


        addDefinition(
            create(
                "permissions",
                "Berechtigungen",
                "security",
                "🔑",
                "App-Berechtigungen verwalten.",
                {
                    order: 1001
                }
            )
        );


        addDefinition(
            create(
                "security-center",
                "Security Center",
                "security",
                "🛡️",
                "Zentrale Sicherheitsfunktionen.",
                {
                    system: true,
                    order: 1002
                }
            )
        );


        /*
        ========================================================
        BACKUP
        ========================================================
        */

        addDefinition(
            create(
                "backup",
                "Backup",
                "system",
                "💾",
                "Lokale Sicherungen.",
                {
                    order: 1100
                }
            )
        );


        addDefinition(
            create(
                "restore",
                "Wiederherstellung",
                "system",
                "♻️",
                "Wiederherstellung von Systemdaten.",
                {
                    order: 1101
                }
            )
        );


        /*
        ========================================================
        ENTWICKLER
        ========================================================
        */

        addDefinition(
            create(
                "console",
                "Konsole",
                "developer",
                "⌘",
                "Entwicklerkonsole.",
                {
                    order: 1200
                }
            )
        );


        addDefinition(
            create(
                "module-center",
                "Module",
                "developer",
                "🧩",
                "Verwaltung von Systemmodulen.",
                {
                    order: 1201
                }
            )
        );


        addDefinition(
            create(
                "app-developer",
                "App Entwickler",
                "developer",
                "🧑‍💻",
                "Werkzeuge für eigene HalDo Apps.",
                {
                    order: 1202
                }
            )
        );


        /*
        ========================================================
        DIAGNOSE
        ========================================================
        */

        addDefinition(
            create(
                "diagnostics",
                "Diagnose",
                "developer",
                "🩺",
                "Systemdiagnose und Fehleranalyse.",
                {
                    system: true,
                    order: 1203
                }
            )
        );


        return getAll();

    }


    /* ========================================================
       21 — ÖFFENTLICHE REGISTRY API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,

        apiVersion:
            CONFIG.apiVersion,


        /*
         * Erstellung
         */

        create,


        /*
         * Registry
         */

        add:
            addDefinition,

        remove,

        find,

        getAll,

        getCategories,

        getCategory,

        getFavorites,

        getEnabledApps,

        getSystemApps,

        getAutoStartApps,

        searchApps,

        getSortedApps,


        /*
         * Manager
         */

        getManager,

        connectManager,

        registerAll,


        /*
         * Aufbau
         */

        build,


        /*
         * Events
         */

        on,

        off,

        emit,


        /*
         * Status
         */

        getState:
            function () {

                return {
                    ...state
                };

            },


        /*
         * Diagnose
         */

        diagnose:
            function () {

                return {

                    name:
                        CONFIG.name,

                    version:
                        CONFIG.version,

                    apiVersion:
                        CONFIG.apiVersion,

                    appCount:
                        definitions.length,

                    categories:
                        getCategories(),

                    managerConnected:
                        state.managerConnected,

                    initialized:
                        state.initialized,

                    ready:
                        state.ready,

                    registeredCount:
                        state.registeredCount,

                    lastError:
                        state.lastError

                };

            }

    };


    /* ========================================================
       22 — GLOBALE API
       ======================================================== */

    window.HalDoAppRegistry =
        api;


    window.HalDo =
        window.HalDo ||
        {};


    window.HalDo.appRegistry =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appRegistry =
        api;


    /*
     * Kompatibilität mit möglichen zukünftigen
     * Registry-Zugriffen.
     */

    window.HalDoOS.registry =
        api;


    /* ========================================================
       23 — INITIALISIERUNG
       ======================================================== */

    function initialize() {

        if (
            state.initialized
        ) {

            return true;

        }


        try {

            build();

            state.initialized =
                true;


            state.ready =
                true;


            emit(
                "ready",
                diagnose()
            );


            /*
             * Wenn der Manager bereits existiert,
             * versuchen wir sofort die Verbindung.
             *
             * Falls der Manager noch nicht kompatibel
             * ist, wird KEIN Fehler geworfen.
             */

            if (
                connectManager()
            ) {

                registerAll();

            }
            else {

                /*
                 * Spätere Verbindung.
                 */

                window.addEventListener(
                    "haldo:app-manager-ready",
                    function () {

                        if (
                            connectManager()
                        ) {

                            registerAll();

                        }

                    }
                );

            }


            console.log(
                `[HalDo App Registry] ${definitions.length} App-Definitionen vorbereitet.`
            );


            return true;

        }
        catch (
            error
        ) {

            state.lastError =
                error.message ||
                String(
                    error
                );


            console.error(
                "[HalDo App Registry] Initialisierungsfehler:",
                error
            );


            emit(
                "error",
                {

                    error:
                        state.lastError

                }
            );


            return false;

        }

    }


    /* ========================================================
       24 — START
       ======================================================== */

    function start() {

        initialize();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start,
            {
                once:
                    true
            }
        );

    }
    else {

        start();

    }


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 APP REGISTRY
   ============================================================ */