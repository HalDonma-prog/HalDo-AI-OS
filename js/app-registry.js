/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/app-registry.js

   ZENTRALE APP-REGISTRY

   Architektur:

       index.html
            ↓
       kernel.js
            ↓
       system.js
            ↓
       app-registry.js
            ↓
       app-manager.js
            ↓
       app-router.js
            ↓
       echte App-Module
            ↓
       App UI

   WICHTIG:
   - Diese Datei besitzt die zentrale App-Liste.
   - App Manager besitzt KEINE zweite App-Liste.
   - Router besitzt KEINE zweite App-Liste.
   - Apps werden hier definiert.
   - Echte Module können später registriert werden.
   - Keine blinden HTML-Weiterleitungen.
   - Erweiterbar für zukünftige HalDo Apps.
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

        system:
            "HalDo AI OS 18",

        edition:
            "Professional Ultimate Foundation",

        defaultApp:
            "home",

        maximumSearchResults:
            500

    };


    /* ========================================================
       02 — STATUS
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        definitionCount:
            0,

        moduleCount:
            0,

        lastError:
            null

    };


    /* ========================================================
       03 — INTERNE REGISTRY
       ======================================================== */

    const definitions =
        new Map();


    const modules =
        new Map();


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
       05 — ID NORMALISIEREN
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
            /_/g,
            "-"
        )
        .replace(
            /\s+/g,
            "-"
        )
        .replace(
            /[^a-z0-9äöüßîêûç\-]/gi,
            ""
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


    /* ========================================================
       06 — ARRAY SICHERHEIT
       ======================================================== */

    function safeArray(
        value
    ) {

        return Array.isArray(
            value
        )
            ? [
                ...value
            ]
            : [];

    }


    /* ========================================================
       07 — APP-DEFINITION
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

            return null;

        }


        const app = {

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
                String(
                    icon ||
                    "◉"
                ),

            description:
                String(
                    description ||
                    ""
                ),

            keywords:
                safeArray(
                    options.keywords
                ),

            enabled:
                options.enabled !==
                false,

            favorite:
                options.favorite ===
                true,

            autoStart:
                options.autoStart ===
                true,

            system:
                options.system ===
                true,

            critical:
                options.critical ===
                true,

            visible:
                options.visible !==
                false,

            order:
                Number(
                    options.order
                ) || 999999,

            version:
                String(
                    options.version ||
                    CONFIG.version
                ),

            permissions:
                safeArray(
                    options.permissions
                ),

            dependencies:
                safeArray(
                    options.dependencies
                ),

            module:
                options.module ||
                null,

            route:
                options.route ||
                null,

            status:
                options.status ||
                "registered",

            metadata:
                {
                    ...(
                        options.metadata ||
                        {}
                    )
                }

        };


        return app;

    }


    /* ========================================================
       08 — APP REGISTRIEREN
       ======================================================== */

    function register(
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


        if (
            !id
        ) {

            return false;

        }


        const app = {

            ...definition,

            id,

            keywords:
                safeArray(
                    definition.keywords
                ),

            permissions:
                safeArray(
                    definition.permissions
                ),

            dependencies:
                safeArray(
                    definition.dependencies
                ),

            metadata:
                {
                    ...(
                        definition.metadata ||
                        {}
                    )
                }

        };


        definitions.set(
            id,
            app
        );


        state.definitionCount =
            definitions.size;


        emit(
            "app-registered",
            {
                app
            }
        );


        return true;

    }


    /* ========================================================
       09 — MEHRERE APPS REGISTRIEREN
       ======================================================== */

    function registerMany(
        apps
    ) {

        if (
            !Array.isArray(
                apps
            )
        ) {

            return 0;

        }


        let count =
            0;


        apps.forEach(
            app => {

                if (
                    register(
                        app
                    )
                ) {

                    count++;

                }

            }
        );


        return count;

    }


    /* ========================================================
       10 — APP ENTFERNEN
       ======================================================== */

    function unregister(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (
            !definitions.has(
                id
            )
        ) {

            return false;

        }


        const app =
            definitions.get(
                id
            );


        definitions.delete(
            id
        );


        state.definitionCount =
            definitions.size;


        emit(
            "app-unregistered",
            {
                app
            }
        );


        return true;

    }


    /* ========================================================
       11 — APP SUCHEN
       ======================================================== */

    function findApp(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        return (
            definitions.get(
                id
            ) ||
            null
        );

    }


    /* ========================================================
       12 — ALLE APPS
       ======================================================== */

    function getAllApps() {

        return Array.from(
            definitions.values()
        );

    }


    /* ========================================================
       13 — SICHTBARE APPS
       ======================================================== */

    function getVisibleApps() {

        return getAllApps()
            .filter(
                app =>
                    app.visible !==
                    false
            );

    }


    /* ========================================================
       14 — AKTIVE APPS
       ======================================================== */

    function getEnabledApps() {

        return getAllApps()
            .filter(
                app =>
                    app.enabled !==
                    false
            );

    }


    /* ========================================================
       15 — DEAKTIVIERTE APPS
       ======================================================== */

    function getDisabledApps() {

        return getAllApps()
            .filter(
                app =>
                    app.enabled ===
                    false
            );

    }


    /* ========================================================
       16 — FAVORITEN
       ======================================================== */

    function getFavorites() {

        return getAllApps()
            .filter(
                app =>
                    app.favorite ===
                    true
            );

    }


    /* ========================================================
       17 — KATEGORIEN
       ======================================================== */

    function getCategories() {

        return [
            ...new Set(
                getAllApps()
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


    /* ========================================================
       18 — APPS NACH KATEGORIE
       ======================================================== */

    function getAppsByCategory(
        category
    ) {

        const value =
            String(
                category ||
                ""
            )
            .trim()
            .toLowerCase();


        return getAllApps()
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


    /* ========================================================
       19 — APP-SUCHE
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

            return getVisibleApps();

        }


        const results =
            getAllApps()
                .filter(
                    app => {

                        const content =
                            [

                                app.id,

                                app.name,

                                app.title,

                                app.category,

                                app.description,

                                ...safeArray(
                                    app.keywords
                                )

                            ]
                            .join(
                                " "
                            )
                            .toLowerCase();


                        return content.includes(
                            text
                        );

                    }
                );


        return results.slice(
            0,
            CONFIG.maximumSearchResults
        );

    }


    /* ========================================================
       20 — APP AKTIVIEREN
       ======================================================== */

    function enableApp(
        appId
    ) {

        const app =
            findApp(
                appId
            );


        if (
            !app
        ) {

            return false;

        }


        app.enabled =
            true;


        emit(
            "app-enabled",
            {
                app
            }
        );


        return true;

    }


    /* ========================================================
       21 — APP DEAKTIVIEREN
       ======================================================== */

    function disableApp(
        appId
    ) {

        const app =
            findApp(
                appId
            );


        if (
            !app
        ) {

            return false;

        }


        /*
         * Kritische System-Apps dürfen
         * nicht versehentlich deaktiviert
         * werden.
         */

        if (
            app.critical ===
            true
        ) {

            return false;

        }


        app.enabled =
            false;


        emit(
            "app-disabled",
            {
                app
            }
        );


        return true;

    }


    /* ========================================================
       22 — FAVORIT SETZEN
       ======================================================== */

    function setFavorite(
        appId,
        value = true
    ) {

        const app =
            findApp(
                appId
            );


        if (
            !app
        ) {

            return false;

        }


        app.favorite =
            Boolean(
                value
            );


        emit(
            "app-favorite-changed",
            {
                app,

                favorite:
                    app.favorite
            }
        );


        return true;

    }


    /* ========================================================
       23 — FAVORIT UMSCHALTEN
       ======================================================== */

    function toggleFavorite(
        appId
    ) {

        const app =
            findApp(
                appId
            );


        if (
            !app
        ) {

            return false;

        }


        return setFavorite(
            appId,
            !app.favorite
        );

    }


    /* ========================================================
       24 — APP-MODUL REGISTRIEREN
       ======================================================== */

    function registerModule(
        appId,
        module
    ) {

        const app =
            findApp(
                appId
            );


        if (
            !app ||
            !module
        ) {

            return false;

        }


        modules.set(
            app.id,
            module
        );


        app.module =
            app.id;


        app.status =
            "module-ready";


        state.moduleCount =
            modules.size;


        emit(
            "module-registered",
            {

                app,

                module

            }
        );


        return true;

    }


    /* ========================================================
       25 — APP-MODUL HOLEN
       ======================================================== */

    function getModule(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        return (
            modules.get(
                id
            ) ||
            null
        );

    }


    /* ========================================================
       26 — APP-MODUL ENTFERNEN
       ======================================================== */

    function unregisterModule(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (
            !modules.has(
                id
            )
        ) {

            return false;

        }


        modules.delete(
            id
        );


        state.moduleCount =
            modules.size;


        const app =
            findApp(
                id
            );


        if (
            app
        ) {

            app.module =
                null;

            app.status =
                "registered";

        }


        return true;

    }


    /* ========================================================
       27 — SORTIERTE APPS
       ======================================================== */

    function getSortedApps() {

        return getAllApps()
            .slice()
            .sort(
                (
                    a,
                    b
                ) => {

                    const orderA =
                        Number(
                            a.order
                        ) || 999999;


                    const orderB =
                        Number(
                            b.order
                        ) || 999999;


                    if (
                        orderA !==
                        orderB
                    ) {

                        return (
                            orderA -
                            orderB
                        );

                    }


                    return String(
                        a.name
                    )
                    .localeCompare(
                        String(
                            b.name
                        ),
                        "de"
                    );

                }
            );

    }


    /* ========================================================
       28 — SORTIERTE FAVORITEN
       ======================================================== */

    function getSortedFavorites() {

        return getFavorites()
            .slice()
            .sort(
                (
                    a,
                    b
                ) => {

                    return (
                        (
                            Number(
                                a.order
                            ) ||
                            999999
                        ) -
                        (
                            Number(
                                b.order
                            ) ||
                            999999
                        )
                    );

                }
            );

    }


    /* ========================================================
       29 — APP COUNT
       ======================================================== */

    function getAppCount() {

        return definitions.size;

    }


    /* ========================================================
       30 — APP EXISTIERT
       ======================================================== */

    function has(
        appId
    ) {

        return Boolean(
            findApp(
                appId
            )
        );

    }


    /* ========================================================
       31 — SYSTEM APPS
       ======================================================== */

    function getSystemApps() {

        return getAllApps()
            .filter(
                app =>
                    app.system ===
                    true
            );

    }


    /* ========================================================
       32 — KRITISCHE APPS
       ======================================================== */

    function getCriticalApps() {

        return getAllApps()
            .filter(
                app =>
                    app.critical ===
                    true
            );

    }


    /* ========================================================
       33 — AUTOSTART APPS
       ======================================================== */

    function getAutoStartApps() {

        return getAllApps()
            .filter(
                app =>
                    app.autoStart ===
                    true &&
                    app.enabled !==
                    false
            );

    }


    /* ========================================================
       34 — APP-STATUS
       ======================================================== */

    function getAppStatus(
        appId
    ) {

        const app =
            findApp(
                appId
            );


        if (
            !app
        ) {

            return null;

        }


        return {

            id:
                app.id,

            enabled:
                app.enabled !==
                false,

            visible:
                app.visible !==
                false,

            system:
                app.system ===
                true,

            critical:
                app.critical ===
                true,

            moduleAvailable:
                Boolean(
                    getModule(
                        app.id
                    )
                ),

            status:
                app.status

        };

    }


    /* ========================================================
       35 — APP DEFINITIONEN
       ======================================================== */

    function buildDefinitions() {

        return [

            /* =================================================
               AI
               ================================================= */

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
                    order: 10,
                    keywords: [
                        "ai",
                        "assistant",
                        "assistent",
                        "chat",
                        "haldo"
                    ]
                }
            ),

            create(
                "ai-chat",
                "AI Chat",
                "ai",
                "💬",
                "Intelligenter KI-Chat.",
                {
                    order: 11,
                    keywords: [
                        "chat",
                        "ki",
                        "conversation"
                    ]
                }
            ),

            create(
                "ai-image",
                "AI Bilder",
                "ai",
                "🖼️",
                "AI-Bildfunktionen und Bildbearbeitung.",
                {
                    order: 12,
                    keywords: [
                        "image",
                        "bilder",
                        "bild",
                        "generate"
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
                    order: 13,
                    keywords: [
                        "writing",
                        "text",
                        "schreiben"
                    ]
                }
            ),

            create(
                "ai-code",
                "AI Code",
                "ai",
                "💻",
                "Unterstützung beim Programmieren und Entwickeln.",
                {
                    order: 14,
                    keywords: [
                        "code",
                        "programmieren",
                        "developer"
                    ]
                }
            ),

            create(
                "ai-translate",
                "AI Übersetzung",
                "ai",
                "🌐",
                "Intelligente Übersetzungsfunktionen.",
                {
                    order: 15,
                    keywords: [
                        "translate",
                        "translation",
                        "übersetzung"
                    ]
                }
            ),

            create(
                "ai-search",
                "AI Suche",
                "ai",
                "🔎",
                "Intelligente Suche und Informationsverarbeitung.",
                {
                    order: 16,
                    keywords: [
                        "search",
                        "suche",
                        "web"
                    ]
                }
            ),

            create(
                "ai-memory",
                "AI Memory",
                "ai",
                "🧠",
                "Verwaltung des HalDo AI Langzeitgedächtnisses.",
                {
                    order: 17,
                    keywords: [
                        "memory",
                        "gedächtnis",
                        "wissen"
                    ]
                }
            ),

            create(
                "ai-voice",
                "AI Stimme",
                "ai",
                "🎙️",
                "AI-Sprach- und Stimmeinstellungen.",
                {
                    order: 18,
                    keywords: [
                        "voice",
                        "stimme",
                        "sprache"
                    ]
                }
            ),


            /* =================================================
               HOME & SYSTEM
               ================================================= */

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
                    order: 1,
                    keywords: [
                        "home",
                        "start",
                        "desktop"
                    ]
                }
            ),

            create(
                "dashboard",
                "Dashboard",
                "system",
                "▦",
                "Zentrale Übersicht des HalDo AI OS.",
                {
                    system: true,
                    favorite: true,
                    order: 2,
                    keywords: [
                        "dashboard",
                        "übersicht"
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
                    system: true,
                    favorite: true,
                    order: 3,
                    keywords: [
                        "control",
                        "settings",
                        "kontrolle"
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
                    system: true,
                    favorite: true,
                    order: 4,
                    keywords: [
                        "apps",
                        "app center",
                        "verwaltung"
                    ]
                }
            ),

            create(
                "launcher",
                "Launcher",
                "system",
                "🚀",
                "Startprogramm für HalDo Apps.",
                {
                    system: true,
                    order: 5,
                    keywords: [
                        "launcher",
                        "start"
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
                    system: true,
                    order: 6,
                    keywords: [
                        "boot",
                        "startup",
                        "systemstart"
                    ]
                }
            ),

            create(
                "system-status",
                "Systemstatus",
                "system",
                "📊",
                "Live-Systemstatus und Diagnose.",
                {
                    system: true,
                    order: 7,
                    keywords: [
                        "status",
                        "system",
                        "diagnose"
                    ]
                }
            ),

            create(
                "notifications",
                "Benachrichtigungen",
                "system",
                "🔔",
                "Zentrale Verwaltung von Systembenachrichtigungen.",
                {
                    system: true,
                    order: 8,
                    keywords: [
                        "notifications",
                        "benachrichtigungen"
                    ]
                }
            ),

            create(
                "settings",
                "Einstellungen",
                "system",
                "⚙️",
                "Zentrale HalDo AI OS Einstellungen.",
                {
                    system: true,
                    favorite: true,
                    order: 9,
                    keywords: [
                        "settings",
                        "einstellungen"
                    ]
                }
            ),


            /* =================================================
               DATEIEN
               ================================================= */

            create(
                "files",
                "Dateien",
                "files",
                "📁",
                "Zentrale Datei- und Ordnerverwaltung.",
                {
                    favorite: true,
                    order: 100,
                    keywords: [
                        "file",
                        "files",
                        "dateien",
                        "ordner"
                    ]
                }
            ),

            create(
                "file-manager",
                "Dateimanager",
                "files",
                "🗂️",
                "Dateien und Ordner verwalten.",
                {
                    order: 101
                }
            ),

            create(
                "downloads",
                "Downloads",
                "files",
                "⬇️",
                "Heruntergeladene Dateien.",
                {
                    order: 102
                }
            ),

            create(
                "recent-files",
                "Zuletzt verwendet",
                "files",
                "🕘",
                "Schneller Zugriff auf zuletzt verwendete Dateien.",
                {
                    order: 103
                }
            ),

            create(
                "favorites-files",
                "Datei-Favoriten",
                "files",
                "⭐",
                "Favorisierte Dateien und Ordner.",
                {
                    order: 104
                }
            ),

            create(
                "documents",
                "Dokumente",
                "files",
                "📄",
                "Dokumente verwalten.",
                {
                    order: 105
                }
            ),

            create(
                "images",
                "Bilder",
                "files",
                "🖼️",
                "Bilddateien verwalten.",
                {
                    order: 106
                }
            ),

            create(
                "videos",
                "Videos",
                "files",
                "🎬",
                "Videodateien verwalten.",
                {
                    order: 107
                }
            ),

            create(
                "audio-files",
                "Audiodateien",
                "files",
                "🎵",
                "Audiodateien verwalten.",
                {
                    order: 108
                }
            ),


            /* =================================================
               OFFICE
               ================================================= */

            create(
                "text-editor",
                "Texteditor",
                "office",
                "📄",
                "Texte erstellen und bearbeiten.",
                {
                    favorite: true,
                    order: 200,
                    keywords: [
                        "text",
                        "editor",
                        "schreiben"
                    ]
                }
            ),

            create(
                "word-processor",
                "Dokumente",
                "office",
                "📝",
                "Dokumente erstellen und bearbeiten.",
                {
                    order: 201
                }
            ),

            create(
                "spreadsheet",
                "Tabellen",
                "office",
                "📊",
                "Tabellen und Daten bearbeiten.",
                {
                    order: 202
                }
            ),

            create(
                "presentation",
                "Präsentationen",
                "office",
                "📽️",
                "Präsentationen erstellen.",
                {
                    order: 203
                }
            ),

            create(
                "pdf-reader",
                "PDF Reader",
                "office",
                "📕",
                "PDF-Dokumente anzeigen.",
                {
                    order: 204
                }
            ),

            create(
                "pdf-tools",
                "PDF Werkzeuge",
                "office",
                "🛠️",
                "PDF-Dateien bearbeiten und verwalten.",
                {
                    order: 205
                }
            ),

            create(
                "notes",
                "Notizen",
                "productivity",
                "🗒️",
                "Schnelle Notizen erstellen und verwalten.",
                {
                    favorite: true,
                    order: 206
                }
            ),


            /* =================================================
               KOMMUNIKATION
               ================================================= */

            create(
                "messages",
                "Nachrichten",
                "communication",
                "💬",
                "Nachrichten und Chats.",
                {
                    favorite: true,
                    order: 300
                }
            ),

            create(
                "calls",
                "Anrufe",
                "communication",
                "📞",
                "Anruffunktionen.",
                {
                    order: 301
                }
            ),

            create(
                "video-calls",
                "Videoanrufe",
                "communication",
                "📹",
                "Video-Kommunikation.",
                {
                    order: 302
                }
            ),

            create(
                "contacts",
                "Kontakte",
                "communication",
                "👤",
                "Kontakte verwalten.",
                {
                    order: 303
                }
            ),

            create(
                "chat-groups",
                "Gruppen",
                "communication",
                "👥",
                "Kommunikationsgruppen.",
                {
                    order: 304
                }
            ),

            create(
                "mail",
                "Mail",
                "communication",
                "✉️",
                "E-Mail-Verwaltung.",
                {
                    order: 305
                }
            ),


            /* =================================================
               INTERNET
               ================================================= */

            create(
                "browser",
                "Browser",
                "internet",
                "🌐",
                "Internetbrowser für HalDo AI OS.",
                {
                    favorite: true,
                    order: 400,
                    keywords: [
                        "internet",
                        "web",
                        "browser"
                    ]
                }
            ),

            create(
                "bookmarks",
                "Lesezeichen",
                "internet",
                "🔖",
                "Gespeicherte Webseiten.",
                {
                    order: 401
                }
            ),

            create(
                "history",
                "Verlauf",
                "internet",
                "🕘",
                "Browser-Verlauf.",
                {
                    order: 402
                }
            ),

            create(
                "downloads-browser",
                "Browser Downloads",
                "internet",
                "⬇️",
                "Browser-Downloads.",
                {
                    order: 403
                }
            ),

            create(
                "web-search",
                "Websuche",
                "internet",
                "🔎",
                "Websuche und Informationsrecherche.",
                {
                    order: 404
                }
            ),


            /* =================================================
               SICHERHEIT
               ================================================= */

            create(
                "security-center",
                "Security Center",
                "security",
                "🛡️",
                "Zentrale Sicherheitsfunktionen.",
                {
                    system: true,
                    critical: true,
                    favorite: true,
                    order: 500
                }
            ),

            create(
                "permissions",
                "Berechtigungen",
                "security",
                "🔑",
                "App-Berechtigungen verwalten.",
                {
                    system: true,
                    order: 501
                }
            ),

            create(
                "password-manager",
                "Passwortverwaltung",
                "security",
                "🔐",
                "Lokale Verwaltung von Zugangsdaten.",
                {
                    order: 502
                }
            ),

            create(
                "privacy",
                "Datenschutz",
                "security",
                "🔒",
                "Datenschutz- und Privatsphäre-Einstellungen.",
                {
                    order: 503
                }
            ),

            create(
                "security-log",
                "Sicherheitsprotokoll",
                "security",
                "📋",
                "Sicherheitsereignisse und Protokolle.",
                {
                    order: 504
                }
            ),


            /* =================================================
               MULTIMEDIA
               ================================================= */

            create(
                "gallery",
                "Galerie",
                "media",
                "🖼️",
                "Bildergalerie.",
                {
                    favorite: true,
                    order: 600
                }
            ),

            create(
                "camera",
                "Kamera",
                "media",
                "📷",
                "Kamera-Funktionen.",
                {
                    order: 601
                }
            ),

            create(
                "audio-recorder",
                "Audiorekorder",
                "media",
                "🎙️",
                "Audioaufnahmen.",
                {
                    order: 602
                }
            ),

            create(
                "video-recorder",
                "Videorekorder",
                "media",
                "🎥",
                "Videoaufnahmen.",
                {
                    order: 603
                }
            ),

            create(
                "media-player",
                "Media Player",
                "media",
                "▶️",
                "Zentrale Medienwiedergabe.",
                {
                    favorite: true,
                    order: 604
                }
            ),

            create(
                "music",
                "Musik",
                "media",
                "🎵",
                "Musikverwaltung und Wiedergabe.",
                {
                    order: 605
                }
            ),

            create(
                "video-player",
                "Video Player",
                "media",
                "🎬",
                "Videowiedergabe.",
                {
                    order: 606
                }
            ),


            /* =================================================
               PRODUKTIVITÄT
               ================================================= */

            create(
                "todo",
                "Aufgaben",
                "productivity",
                "☑️",
                "Aufgaben verwalten.",
                {
                    favorite: true,
                    order: 700
                }
            ),

            create(
                "calendar",
                "Kalender",
                "productivity",
                "📅",
                "Termine und Kalender verwalten.",
                {
                    favorite: true,
                    order: 701
                }
            ),

            create(
                "reminders",
                "Erinnerungen",
                "productivity",
                "🔔",
                "Erinnerungen verwalten.",
                {
                    order: 702
                }
            ),

            create(
                "habits",
                "Gewohnheiten",
                "productivity",
                "📈",
                "Persönliche Routinen verwalten.",
                {
                    order: 703
                }
            ),

            create(
                "stopwatch",
                "Stoppuhr",
                "productivity",
                "⏱️",
                "Stoppuhr.",
                {
                    order: 704
                }
            ),

            create(
                "timer",
                "Timer",
                "productivity",
                "⏲️",
                "Timer.",
                {
                    order: 705
                }
            ),

            create(
                "calculator",
                "Rechner",
                "productivity",
                "🧮",
                "Mathematischer Rechner.",
                {
                    order: 706
                }
            ),

            create(
                "clock",
                "Uhr",
                "productivity",
                "🕐",
                "Uhrzeit und Weltzeiten.",
                {
                    order: 707
                }
            ),


            /* =================================================
               SPRACHE
               ================================================= */

            create(
                "speech-to-text",
                "Sprache zu Text",
                "language",
                "🎙️",
                "Gesprochene Sprache in Text umwandeln.",
                {
                    order: 800
                }
            ),

            create(
                "text-to-speech",
                "Text zu Sprache",
                "language",
                "🔊",
                "Text vorlesen lassen.",
                {
                    order: 801
                }
            ),

            create(
                "language-center",
                "Sprachzentrum",
                "language",
                "🌍",
                "Sprach- und Übersetzungsfunktionen.",
                {
                    order: 802
                }
            ),

            create(
                "translator",
                "Übersetzer",
                "language",
                "🌐",
                "Mehrsprachige Übersetzungen.",
                {
                    order: 803
                }
            ),

            create(
                "dictionary",
                "Wörterbuch",
                "language",
                "📖",
                "Wörterbücher und Begriffe.",
                {
                    order: 804
                }
            ),


            /* =================================================
               ÊZÎDÎ
               ================================================= */

            create(
                "ezidi-language",
                "Êzîdî Sprache",
                "ezidi",
                "𐺀",
                "Êzîdî-Sprachfunktionen.",
                {
                    favorite: true,
                    order: 900,
                    keywords: [
                        "ezidi",
                        "êzîdî",
                        "sprache"
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
                    order: 901
                }
            ),

            create(
                "ezidi-input",
                "Êzîdî Eingabe",
                "ezidi",
                "⌨️",
                "Spezielle Êzîdî-Eingabe.",
                {
                    order: 902
                }
            ),

            create(
                "ezidi-keyboard",
                "Êzîdî Tastatur",
                "ezidi",
                "⌨️",
                "Spezielle Êzîdî-Tastatur mit eigenen Zeichen und Layouts.",
                {
                    favorite: true,
                    order: 903,
                    keywords: [
                        "keyboard",
                        "tastatur",
                        "ezidi",
                        "êzîdî"
                    ]
                }
            ),

            create(
                "ezidi-translator",
                "Êzîdî Übersetzer",
                "ezidi",
                "🌍",
                "Übersetzung mit Êzîdî-Unterstützung.",
                {
                    order: 904
                }
            ),


            /* =================================================
               BACKUP & WIEDERHERSTELLUNG
               ================================================= */

            create(
                "backup",
                "Backup",
                "backup",
                "💾",
                "Lokale Sicherungen.",
                {
                    system: true,
                    order: 1000
                }
            ),

            create(
                "restore",
                "Wiederherstellung",
                "backup",
                "♻️",
                "Wiederherstellung von Systemdaten.",
                {
                    system: true,
                    order: 1001
                }
            ),

            create(
                "backup-manager",
                "Backup Manager",
                "backup",
                "🗄️",
                "Sicherungen verwalten.",
                {
                    order: 1002
                }
            ),


            /* =================================================
               ENTWICKLER
               ================================================= */

            create(
                "console",
                "Konsole",
                "developer",
                "⌘",
                "Entwicklerkonsole.",
                {
                    system: true,
                    order: 1100
                }
            ),

            create(
                "developer-tools",
                "Developer Tools",
                "developer",
                "🛠️",
                "Werkzeuge für die Entwicklung.",
                {
                    order: 1101
                }
            ),

            create(
                "module-center",
                "Module",
                "developer",
                "🧩",
                "Verwaltung von Systemmodulen.",
                {
                    system: true,
                    order: 1102
                }
            ),

            create(
                "app-developer",
                "App Entwickler",
                "developer",
                "🧑‍💻",
                "Werkzeuge für eigene HalDo Apps.",
                {
                    order: 1103
                }
            ),

            create(
                "app-inspector",
                "App Inspector",
                "developer",
                "🔍",
                "Untersuchung registrierter Apps und Module.",
                {
                    order: 1104
                }
            ),

            create(
                "system-console",
                "Systemkonsole",
                "developer",
                "💻",
                "Systemdiagnose und Kernel-Kommunikation.",
                {
                    order: 1105
                }
            ),


            /* =================================================
               SYSTEMWERKZEUGE
               ================================================= */

            create(
                "storage",
                "Speicher",
                "system-tools",
                "💽",
                "Lokale Speicherverwaltung.",
                {
                    system: true,
                    order: 1200
                }
            ),

            create(
                "storage-manager",
                "Speicherverwaltung",
                "system-tools",
                "🗄️",
                "Verwaltung des HalDo Speichers.",
                {
                    system: true,
                    order: 1201
                }
            ),

            create(
                "configuration",
                "Konfiguration",
                "system-tools",
                "⚙️",
                "Systemkonfiguration.",
                {
                    system: true,
                    order: 1202
                }
            ),

            create(
                "diagnostics",
                "Diagnose",
                "system-tools",
                "🩺",
                "Systemdiagnose und Fehlerprüfung.",
                {
                    system: true,
                    order: 1203
                }
            ),

            create(
                "system-information",
                "Systeminformationen",
                "system-tools",
                "ℹ️",
                "Informationen über HalDo AI OS.",
                {
                    system: true,
                    order: 1204
                }
            ),


            /* =================================================
               ZUKÜNFTIGE ERWEITERUNGEN
               ================================================= */

            create(
                "automation",
                "Automatisierung",
                "automation",
                "⚡",
                "Automatisierung von HalDo Aufgaben.",
                {
                    order: 1300
                }
            ),

            create(
                "workflows",
                "Workflows",
                "automation",
                "🔄",
                "Automatisierte Arbeitsabläufe.",
                {
                    order: 1301
                }
            ),

            create(
                "smart-home",
                "Smart Home",
                "automation",
                "🏠",
                "Vorbereitung für Smart-Home-Steuerung.",
                {
                    order: 1302
                }
            ),

            create(
                "cloud",
                "Cloud",
                "cloud",
                "☁️",
                "Vorbereitung für Cloud-Dienste.",
                {
                    order: 1400
                }
            ),

            create(
                "sync",
                "Synchronisierung",
                "cloud",
                "🔄",
                "Vorbereitung für Datensynchronisierung.",
                {
                    order: 1401
                }
            ),

            create(
                "account",
                "HalDo Konto",
                "account",
                "👤",
                "Vorbereitung für HalDo Benutzerkonten.",
                {
                    order: 1500
                }
            ),

            create(
                "help",
                "Hilfe",
                "system",
                "❓",
                "Hilfe und Informationen zu HalDo AI OS.",
                {
                    order: 1600
                }
            ),

            create(
                "about",
                "Über HalDo AI OS",
                "system",
                "ℹ️",
                "Informationen über HalDo AI OS 18.",
                {
                    system: true,
                    order: 1601
                }
            )

        ];

    }


    /* ========================================================
       36 — REGISTRY AUFBAUEN
       ======================================================== */

    function build() {

        definitions.clear();


        const apps =
            buildDefinitions();


        registerMany(
            apps
        );


        state.definitionCount =
            definitions.size;


        return getAllApps();

    }


    /* ========================================================
       37 — MODUL AUS GLOBALEN SYSTEMEN ERKENNEN
       ======================================================== */

    function discoverModules() {

        const containers = [

            window.HalDoApps,

            window.HalDoAppModules

        ];


        let discovered =
            0;


        containers.forEach(
            container => {

                if (
                    !container ||
                    typeof container !==
                    "object"
                ) {

                    return;

                }


                Object.keys(
                    container
                )
                .forEach(
                    key => {

                        const module =
                            container[key];


                        if (
                            !module
                        ) {

                            return;

                        }


                        const normalized =
                            normalizeId(
                                key
                            );


                        if (
                            definitions.has(
                                normalized
                            )
                        ) {

                            if (
                                !modules.has(
                                    normalized
                                )
                            ) {

                                modules.set(
                                    normalized,
                                    module
                                );


                                const app =
                                    definitions.get(
                                        normalized
                                    );


                                app.module =
                                    normalized;


                                app.status =
                                    "module-ready";


                                discovered++;

                            }

                        }

                    }
                );

            }
        );


        state.moduleCount =
            modules.size;


        return discovered;

    }


    /* ========================================================
       38 — MANAGER VERBINDEN
       ======================================================== */

    function connectManager() {

        const manager =
            window.HalDoAppManager;


        if (
            !manager
        ) {

            return false;

        }


        /*
         * Der aktuelle App Manager liest
         * die Registry direkt.
         *
         * Deshalb registrieren wir die Apps
         * NICHT erneut beim Manager.
         *
         * Dadurch existiert nur EINE zentrale
         * App-Liste.
         */

        state.ready =
            true;


        emit(
            "manager-connected",
            {
                manager
            }
        );


        return true;

    }


    /* ========================================================
       39 — SYSTEM VERBINDEN
       ======================================================== */

    function connectSystem() {

        if (
            window.HalDoSystem &&
            typeof window.HalDoSystem.registerService ===
            "function"
        ) {

            window.HalDoSystem.registerService(
                "app-registry",
                api
            );


            return true;

        }


        return false;

    }


    /* ========================================================
       40 — KERNEL VERBINDEN
       ======================================================== */

    function connectKernel() {

        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.registerModule ===
            "function"
        ) {

            window.HalDoKernel.registerModule(
                "app-registry",
                api
            );


            if (
                typeof window.HalDoKernel.setModuleReady ===
                "function"
            ) {

                window.HalDoKernel.setModuleReady(
                    "app-registry",
                    true
                );

            }


            return true;

        }


        return false;

    }


    /* ========================================================
       41 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            initialized:
                state.initialized,

            ready:
                state.ready,

            definitionCount:
                definitions.size,

            moduleCount:
                modules.size,

            categories:
                getCategories(),

            systemApps:
                getSystemApps()
                    .length,

            criticalApps:
                getCriticalApps()
                    .length,

            enabledApps:
                getEnabledApps()
                    .length,

            disabledApps:
                getDisabledApps()
                    .length,

            favoriteApps:
                getFavorites()
                    .length,

            managerConnected:
                Boolean(
                    window.HalDoAppManager
                ),

            kernelConnected:
                Boolean(
                    window.HalDoKernel
                ),

            systemConnected:
                Boolean(
                    window.HalDoSystem
                ),

            lastError:
                state.lastError

        };

    }


    /* ========================================================
       42 — STATUS
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            definitionCount:
                definitions.size,

            moduleCount:
                modules.size,

            lastError:
                state.lastError

        };

    }


    /* ========================================================
       43 — INITIALISIERUNG
       ======================================================== */

    function initialize() {

        if (
            state.initialized
        ) {

            return getState();

        }


        try {

            build();


            discoverModules();


            state.initialized =
                true;


            connectManager();


            connectSystem();


            connectKernel();


            emit(
                "ready",
                getState()
            );


            console.log(
                `[HalDo App Registry] ${definitions.size} Apps registriert.`
            );


            return getState();

        }
        catch (
            error
        ) {

            state.lastError =
                error &&
                error.message
                    ? error.message
                    : String(
                        error
                    );


            console.error(
                "[HalDo App Registry] Initialisierungsfehler:",
                error
            );


            return {

                ...getState(),

                error:
                    state.lastError

            };

        }

    }


    /* ========================================================
       44 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,


        init:
            initialize,

        initialize,


        on,

        off,


        create,

        build,


        register,

        registerMany,

        unregister,


        findApp,

        getApp:
            findApp,

        has,


        getAllApps,

        getAll:
            getAllApps,

        getVisibleApps,

        getEnabledApps,

        getDisabledApps,


        getFavorites,

        getSortedApps,

        getSortedFavorites,


        getCategories,

        getAppsByCategory,

        getCategory:
            getAppsByCategory,


        searchApps,

        search:
            searchApps,


        enableApp,

        disableApp,

        setFavorite,

        toggleFavorite,


        registerModule,

        unregisterModule,

        getModule,


        getSystemApps,

        getCriticalApps,

        getAutoStartApps,


        getAppStatus,

        getAppCount,


        discoverModules,


        getState,

        diagnose

    };


    /* ========================================================
       45 — GLOBALE API
       ======================================================== */

    window.HalDoAppRegistry =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appRegistry =
        api;


    window.HalDo =
        window.HalDo ||
        {};


    window.HalDo.appRegistry =
        api;


    /*
     * Gemeinsamer Modul-Speicher.
     *
     * Wichtig:
     * Diese Objekte sind keine zweite App-Liste.
     * Sie enthalten ausschließlich echte Module.
     */

    window.HalDoApps =
        window.HalDoApps ||
        {};


    window.HalDoAppModules =
        window.HalDoAppModules ||
        {};


    /* ========================================================
       46 — START
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
        "Zentrale App-Registry geladen."
    );

    console.log(
        "=============================================="
    );


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 APP REGISTRY
   ============================================================ */