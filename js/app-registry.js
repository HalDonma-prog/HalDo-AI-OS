/*
============================================================
 HALDO AI OS 18
 PROFESSIONAL ULTIMATE FOUNDATION
 -----------------------------------------------------------
 Datei:
 js/app-registry.js

 ZENTRALE APP-REGISTRY

 WICHTIG:
 - Diese Datei besitzt die zentrale App-Liste.
 - app-manager.js besitzt KEINE zweite App-Liste.
 - app-router.js besitzt KEINE zweite App-Liste.
 - Alle Apps erhalten stabile Metadaten.
 - Für zukünftige echte App-Module vorbereitet.
 - Unterstützt Kategorien.
 - Unterstützt Favoriten.
 - Unterstützt Suche.
 - Unterstützt Abhängigkeiten.
 - Unterstützt Berechtigungen.
 - Unterstützt System-Apps.
 - Unterstützt kritische Apps.
 - Unterstützt Auto-Start.
 - Unterstützt App-Versionen.
 - Unterstützt Modulnamen.
 - Unterstützt zukünftige App-Dateien.
============================================================
*/

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
            "HalDo AI OS",

        defaultApp:
            "haldo-home",

        fallbackApp:
            "dashboard"

    };


    /* ========================================================
       02 — INTERNE REGISTRY
       ======================================================== */

    const definitions = [];

    const definitionMap =
        new Map();

    const listeners = {};


    /* ========================================================
       03 — EVENT SYSTEM
       ======================================================== */

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
       04 — APP-DEFINITION
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
            String(
                id ||
                ""
            )
            .trim()
            .toLowerCase();


        if (
            !normalizedId
        ) {

            throw new Error(
                "App-ID darf nicht leer sein."
            );

        }


        return {

            id:
                normalizedId,

            name:
                name ||
                normalizedId,

            title:
                options.title ||
                name ||
                normalizedId,

            category:
                category ||
                "system",

            icon:
                icon ||
                "◉",

            description:
                description ||
                "",

            enabled:
                options.enabled !== false,

            favorite:
                options.favorite === true,

            autoStart:
                options.autoStart === true,

            system:
                options.system === true,

            critical:
                options.critical === true,

            order:
                Number.isFinite(
                    Number(
                        options.order
                    )
                )
                    ? Number(
                        options.order
                    )
                    : 999999,

            version:
                options.version ||
                "18.0.0",

            module:
                options.module ||
                null,

            moduleName:
                options.moduleName ||
                null,

            path:
                options.path ||
                null,

            route:
                options.route ||
                null,

            permissions:
                Array.isArray(
                    options.permissions
                )
                    ? [
                        ...options.permissions
                    ]
                    : [],

            dependencies:
                Array.isArray(
                    options.dependencies
                )
                    ? [
                        ...options.dependencies
                    ]
                    : [],

            keywords:
                Array.isArray(
                    options.keywords
                )
                    ? [
                        ...options.keywords
                    ]
                    : [],

            tags:
                Array.isArray(
                    options.tags
                )
                    ? [
                        ...options.tags
                    ]
                    : [],

            platform:
                options.platform ||
                "haldo-ai-os-18",

            created:
                options.created ||
                "18.0.0",

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
       05 — APP REGISTRIEREN
       ======================================================== */

    function register(
        app
    ) {

        if (
            !app ||
            typeof app !==
                "object"
        ) {

            return false;

        }


        if (
            !app.id
        ) {

            return false;

        }


        const id =
            String(
                app.id
            )
            .trim()
            .toLowerCase();


        /*
         * Keine doppelten Apps.
         */

        if (
            definitionMap.has(
                id
            )
        ) {

            return false;

        }


        const normalized =
            {
                ...app,

                id

            };


        definitions.push(
            normalized
        );


        definitionMap.set(
            id,
            normalized
        );


        emit(
            "app-registered",
            normalized
        );


        return true;

    }


    /* ========================================================
       06 — APP AKTUALISIEREN
       ======================================================== */

    function update(
        appId,
        changes = {}
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


        Object.assign(
            app,
            changes
        );


        emit(
            "app-updated",
            app
        );


        return {
            ...app
        };

    }


    /* ========================================================
       07 — APP ENTFERNEN
       ======================================================== */

    function unregister(
        appId
    ) {

        const id =
            String(
                appId ||
                ""
            )
            .trim()
            .toLowerCase();


        const app =
            definitionMap.get(
                id
            );


        if (
            !app
        ) {

            return false;

        }


        const index =
            definitions.indexOf(
                app
            );


        if (
            index >=
            0
        ) {

            definitions.splice(
                index,
                1
            );

        }


        definitionMap.delete(
            id
        );


        emit(
            "app-unregistered",
            {
                appId:
                    id,

                app
            }
        );


        return true;

    }


    /* ========================================================
       08 — APP FINDEN
       ======================================================== */

    function findApp(
        appId
    ) {

        const id =
            String(
                appId ||
                ""
            )
            .trim()
            .toLowerCase();


        return (
            definitionMap.get(
                id
            ) ||
            null
        );

    }


    /* ========================================================
       09 — ALLE APPS
       ======================================================== */

    function getAllApps() {

        return [
            ...definitions
        ];

    }


    /* ========================================================
       10 — AKTIVE APPS
       ======================================================== */

    function getEnabledApps() {

        return definitions
            .filter(
                app =>
                    app.enabled !==
                    false
            );

    }


    /* ========================================================
       11 — FAVORITEN
       ======================================================== */

    function getFavorites() {

        return definitions
            .filter(
                app =>
                    app.favorite ===
                    true
            );

    }


    /* ========================================================
       12 — FAVORIT SETZEN
       ======================================================== */

    function setFavorite(
        appId,
        favorite = true
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
                favorite
            );


        emit(
            "favorite-changed",
            {
                app,
                favorite:
                    app.favorite
            }
        );


        return true;

    }


    /* ========================================================
       13 — KATEGORIEN
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


    /* ========================================================
       14 — APPS NACH KATEGORIE
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


        return definitions
            .filter(
                app =>
                    String(
                        app.category
                    )
                    .toLowerCase() ===
                    value
            );

    }


    /* ========================================================
       15 — APP SUCHE
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

            return getAllApps();

        }


        return definitions
            .filter(
                app => {

                    const content =
                        [

                            app.id,

                            app.name,

                            app.title,

                            app.description,

                            app.category,

                            app.module,

                            app.moduleName,

                            ...(app.keywords || []),

                            ...(app.tags || [])

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

    }


    /* ========================================================
       16 — SORTIERTE APPS
       ======================================================== */

    function getSortedApps() {

        return getAllApps()
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
       17 — SYSTEM APPS
       ======================================================== */

    function getSystemApps() {

        return definitions
            .filter(
                app =>
                    app.system ===
                    true
            );

    }


    /* ========================================================
       18 — KRITISCHE APPS
       ======================================================== */

    function getCriticalApps() {

        return definitions
            .filter(
                app =>
                    app.critical ===
                    true
            );

    }


    /* ========================================================
       19 — AUTO-START APPS
       ======================================================== */

    function getAutoStartApps() {

        return definitions
            .filter(
                app =>
                    app.autoStart ===
                    true
            );

    }


    /* ========================================================
       20 — APP MODUL-INFORMATION
       ======================================================== */

    function getModuleInfo(
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

            module:
                app.module,

            moduleName:
                app.moduleName,

            path:
                app.path,

            route:
                app.route

        };

    }


    /* ========================================================
       21 — REGISTRY AUFBAUEN
       ======================================================== */

    function build() {

        /*
         * Schutz gegen doppeltes Bauen.
         */

        if (
            definitions.length >
            0
        ) {

            return getAllApps();

        }


        /* ====================================================
           HOME / SYSTEM
           ==================================================== */

        register(
            create(
                "haldo-home",
                "HalDo Home",
                "system",
                "assets/logo/logo.png",
                "Zentrale Startoberfläche von HalDo AI OS 18.",
                {
                    system:
                        true,

                    critical:
                        true,

                    favorite:
                        true,

                    autoStart:
                        true,

                    order:
                        1,

                    module:
                        "haldo-home",

                    moduleName:
                        "HalDoHomeApp",

                    route:
                        "haldo-home",

                    keywords:
                        [
                            "home",
                            "start",
                            "desktop",
                            "hauptseite"
                        ]
                }
            )
        );


        register(
            create(
                "dashboard",
                "Dashboard",
                "system",
                "assets/logo/logo.png",
                "Zentrale Übersicht des HalDo AI OS.",
                {
                    system:
                        true,

                    favorite:
                        true,

                    order:
                        2,

                    module:
                        "dashboard",

                    moduleName:
                        "HalDoDashboardApp",

                    route:
                        "dashboard",

                    keywords:
                        [
                            "dashboard",
                            "übersicht",
                            "start"
                        ]
                }
            )
        );


        register(
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
                        3,

                    module:
                        "control-center",

                    moduleName:
                        "HalDoControlCenterApp",

                    route:
                        "control-center"
                }
            )
        );


        register(
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
                        4,

                    module:
                        "app-center",

                    moduleName:
                        "HalDoAppCenterApp",

                    route:
                        "app-center",

                    keywords:
                        [
                            "apps",
                            "application",
                            "programme"
                        ]
                }
            )
        );


        register(
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
                        5,

                    module:
                        "startup",

                    moduleName:
                        "HalDoStartupApp",

                    route:
                        "startup"
                }
            )
        );


        register(
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
                        6,

                    module:
                        "settings",

                    moduleName:
                        "HalDoSettingsApp",

                    route:
                        "settings"
                }
            )
        );


        register(
            create(
                "notifications",
                "Benachrichtigungen",
                "system",
                "🔔",
                "Zentrale Verwaltung von System- und App-Benachrichtigungen.",
                {
                    system:
                        true,

                    order:
                        7,

                    module:
                        "notifications",

                    moduleName:
                        "HalDoNotificationsApp",

                    route:
                        "notifications"
                }
            )
        );


        register(
            create(
                "system-status",
                "Systemstatus",
                "system",
                "📊",
                "Live-Informationen über den Zustand des Betriebssystems.",
                {
                    system:
                        true,

                    order:
                        8,

                    module:
                        "system-status",

                    moduleName:
                        "HalDoSystemStatusApp",

                    route:
                        "system-status"
                }
            )
        );


        /* ====================================================
           AI
           ==================================================== */

        register(
            create(
                "ai-assistant",
                "HalDo AI Assistent",
                "ai",
                "assets/logo/logo.png",
                "Zentrale intelligente HalDo AI Assistenz.",
                {
                    system:
                        true,

                    favorite:
                        true,

                    order:
                        10,

                    module:
                        "ai-assistant",

                    moduleName:
                        "HalDoAIAssistantApp",

                    route:
                        "ai-assistant",

                    permissions:
                        [
                            "ai",
                            "storage",
                            "speech"
                        ],

                    keywords:
                        [
                            "ai",
                            "ki",
                            "assistant",
                            "assistent",
                            "chat"
                        ]
                }
            )
        );


        register(
            create(
                "ai-chat",
                "AI Chat",
                "ai",
                "💬",
                "Intelligenter HalDo AI Chat.",
                {
                    favorite:
                        true,

                    order:
                        11,

                    module:
                        "ai-chat",

                    moduleName:
                        "HalDoAIChatApp",

                    route:
                        "ai-chat"
                }
            )
        );


        register(
            create(
                "ai-image",
                "AI Bilder",
                "ai",
                "🖼️",
                "AI-Bildfunktionen und kreative Bildwerkzeuge.",
                {
                    order:
                        12,

                    module:
                        "ai-image",

                    moduleName:
                        "HalDoAIImageApp",

                    route:
                        "ai-image"
                }
            )
        );


        register(
            create(
                "ai-writing",
                "AI Schreiben",
                "ai",
                "✍️",
                "Schreiben, Bearbeiten und Erstellen mit AI.",
                {
                    order:
                        13,

                    module:
                        "ai-writing",

                    moduleName:
                        "HalDoAIWritingApp",

                    route:
                        "ai-writing"
                }
            )
        );


        register(
            create(
                "ai-code",
                "AI Code",
                "ai",
                "💻",
                "Unterstützung beim Programmieren und Entwickeln.",
                {
                    order:
                        14,

                    module:
                        "ai-code",

                    moduleName:
                        "HalDoAICodeApp",

                    route:
                        "ai-code"
                }
            )
        );


        register(
            create(
                "ai-translate",
                "AI Übersetzung",
                "ai",
                "🌐",
                "Intelligente Übersetzung von Texten.",
                {
                    order:
                        15,

                    module:
                        "ai-translate",

                    moduleName:
                        "HalDoAITranslateApp",

                    route:
                        "ai-translate"
                }
            )
        );


        register(
            create(
                "ai-search",
                "AI Suche",
                "ai",
                "🔎",
                "Intelligente Suche und Informationsverarbeitung.",
                {
                    order:
                        16,

                    module:
                        "ai-search",

                    moduleName:
                        "HalDoAISearchApp",

                    route:
                        "ai-search"
                }
            )
        );


        register(
            create(
                "ai-voice",
                "AI Stimme",
                "ai",
                "🎙️",
                "Sprachsteuerung und AI-Stimme.",
                {
                    order:
                        17,

                    module:
                        "ai-voice",

                    moduleName:
                        "HalDoAIVoiceApp",

                    route:
                        "ai-voice"
                }
            )
        );


        /* ====================================================
           DATEIEN
           ==================================================== */

        register(
            create(
                "file-manager",
                "Dateimanager",
                "files",
                "📁",
                "Dateien und Ordner verwalten.",
                {
                    order:
                        20,

                    module:
                        "file-manager",

                    moduleName:
                        "HalDoFileManagerApp",

                    route:
                        "file-manager"
                }
            )
        );


        register(
            create(
                "downloads",
                "Downloads",
                "files",
                "⬇️",
                "Heruntergeladene Dateien.",
                {
                    order:
                        21,

                    module:
                        "downloads",

                    moduleName:
                        "HalDoDownloadsApp",

                    route:
                        "downloads"
                }
            )
        );


        register(
            create(
                "recent-files",
                "Zuletzt verwendete Dateien",
                "files",
                "🕘",
                "Schneller Zugriff auf zuletzt verwendete Dateien.",
                {
                    order:
                        22,

                    module:
                        "recent-files",

                    moduleName:
                        "HalDoRecentFilesApp",

                    route:
                        "recent-files"
                }
            )
        );


        register(
            create(
                "favorites-files",
                "Datei-Favoriten",
                "files",
                "⭐",
                "Favorisierte Dateien und Ordner.",
                {
                    order:
                        23,

                    module:
                        "favorites-files",

                    moduleName:
                        "HalDoFavoriteFilesApp",

                    route:
                        "favorites-files"
                }
            )
        );


        register(
            create(
                "storage",
                "Speicher",
                "files",
                "💽",
                "Lokalen Speicher und Speicherplatz verwalten.",
                {
                    order:
                        24,

                    module:
                        "storage",

                    moduleName:
                        "HalDoStorageApp",

                    route:
                        "storage"
                }
            )
        );


        /* ====================================================
           OFFICE
           ==================================================== */

        register(
            create(
                "text-editor",
                "Texteditor",
                "office",
                "📄",
                "Texte erstellen und bearbeiten.",
                {
                    order:
                        30,

                    module:
                        "text-editor",

                    moduleName:
                        "HalDoTextEditorApp",

                    route:
                        "text-editor"
                }
            )
        );


        register(
            create(
                "spreadsheet",
                "Tabellen",
                "office",
                "📊",
                "Tabellen und Daten bearbeiten.",
                {
                    order:
                        31,

                    module:
                        "spreadsheet",

                    moduleName:
                        "HalDoSpreadsheetApp",

                    route:
                        "spreadsheet"
                }
            )
        );


        register(
            create(
                "presentation",
                "Präsentationen",
                "office",
                "📽️",
                "Präsentationen erstellen.",
                {
                    order:
                        32,

                    module:
                        "presentation",

                    moduleName:
                        "HalDoPresentationApp",

                    route:
                        "presentation"
                }
            )
        );


        register(
            create(
                "pdf-reader",
                "PDF Reader",
                "office",
                "📕",
                "PDF-Dokumente anzeigen.",
                {
                    order:
                        33,

                    module:
                        "pdf-reader",

                    moduleName:
                        "HalDoPDFReaderApp",

                    route:
                        "pdf-reader"
                }
            )
        );


        register(
            create(
                "document-scanner",
                "Dokumentenscanner",
                "office",
                "📷",
                "Dokumente digitalisieren und verwalten.",
                {
                    order:
                        34,

                    module:
                        "document-scanner",

                    moduleName:
                        "HalDoDocumentScannerApp",

                    route:
                        "document-scanner"
                }
            )
        );


        /* ====================================================
           KOMMUNIKATION
           ==================================================== */

        register(
            create(
                "messages",
                "Nachrichten",
                "communication",
                "💬",
                "Nachrichten und Chats.",
                {
                    order:
                        40,

                    module:
                        "messages",

                    moduleName:
                        "HalDoMessagesApp",

                    route:
                        "messages"
                }
            )
        );


        register(
            create(
                "calls",
                "Anrufe",
                "communication",
                "📞",
                "Anruf-Funktionen.",
                {
                    order:
                        41,

                    module:
                        "calls",

                    moduleName:
                        "HalDoCallsApp",

                    route:
                        "calls"
                }
            )
        );


        register(
            create(
                "video-calls",
                "Videoanrufe",
                "communication",
                "📹",
                "Video-Kommunikation.",
                {
                    order:
                        42,

                    module:
                        "video-calls",

                    moduleName:
                        "HalDoVideoCallsApp",

                    route:
                        "video-calls"
                }
            )
        );


        register(
            create(
                "contacts",
                "Kontakte",
                "communication",
                "👤",
                "Kontakte verwalten.",
                {
                    order:
                        43,

                    module:
                        "contacts",

                    moduleName:
                        "HalDoContactsApp",

                    route:
                        "contacts"
                }
            )
        );


        register(
            create(
                "chat-groups",
                "Gruppen",
                "communication",
                "👥",
                "Kommunikationsgruppen.",
                {
                    order:
                        44,

                    module:
                        "chat-groups",

                    moduleName:
                        "HalDoChatGroupsApp",

                    route:
                        "chat-groups"
                }
            )
        );


        /* ====================================================
           INTERNET
           ==================================================== */

        register(
            create(
                "browser",
                "Browser",
                "internet",
                "🌐",
                "Webseiten und Internetinhalte.",
                {
                    favorite:
                        true,

                    order:
                        50,

                    module:
                        "browser",

                    moduleName:
                        "HalDoBrowserApp",

                    route:
                        "browser"
                }
            )
        );


        register(
            create(
                "bookmarks",
                "Lesezeichen",
                "internet",
                "🔖",
                "Gespeicherte Webseiten.",
                {
                    order:
                        51,

                    module:
                        "bookmarks",

                    moduleName:
                        "HalDoBookmarksApp",

                    route:
                        "bookmarks"
                }
            )
        );


        register(
            create(
                "history",
                "Verlauf",
                "internet",
                "🕘",
                "Browser-Verlauf.",
                {
                    order:
                        52,

                    module:
                        "history",

                    moduleName:
                        "HalDoHistoryApp",

                    route:
                        "history"
                }
            )
        );


        register(
            create(
                "password-manager",
                "Passwortverwaltung",
                "security",
                "🔐",
                "Lokale Verwaltung von Zugangsdaten.",
                {
                    order:
                        53,

                    module:
                        "password-manager",

                    moduleName:
                        "HalDoPasswordManagerApp",

                    route:
                        "password-manager"
                }
            )
        );


        /* ====================================================
           MEDIA
           ==================================================== */

        register(
            create(
                "gallery",
                "Galerie",
                "media",
                "🖼️",
                "Bildergalerie.",
                {
                    order:
                        60,

                    module:
                        "gallery",

                    moduleName:
                        "HalDoGalleryApp",

                    route:
                        "gallery"
                }
            )
        );


        register(
            create(
                "camera",
                "Kamera",
                "media",
                "📷",
                "Kamera und Fotoaufnahme.",
                {
                    order:
                        61,

                    module:
                        "camera",

                    moduleName:
                        "HalDoCameraApp",

                    route:
                        "camera"
                }
            )
        );


        register(
            create(
                "audio-recorder",
                "Audiorekorder",
                "media",
                "🎙️",
                "Audioaufnahmen.",
                {
                    order:
                        62,

                    module:
                        "audio-recorder",

                    moduleName:
                        "HalDoAudioRecorderApp",

                    route:
                        "audio-recorder"
                }
            )
        );


        register(
            create(
                "video-recorder",
                "Videorekorder",
                "media",
                "🎥",
                "Videoaufnahmen.",
                {
                    order:
                        63,

                    module:
                        "video-recorder",

                    moduleName:
                        "HalDoVideoRecorderApp",

                    route:
                        "video-recorder"
                }
            )
        );


        register(
            create(
                "media-player",
                "Media Player",
                "media",
                "▶️",
                "Zentrale Medienwiedergabe.",
                {
                    order:
                        64,

                    module:
                        "media-player",

                    moduleName:
                        "HalDoMediaPlayerApp",

                    route:
                        "media-player"
                }
            )
        );


        /* ====================================================
           PRODUKTIVITÄT
           ==================================================== */

        register(
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
                        70,

                    module:
                        "calendar",

                    moduleName:
                        "HalDoCalendarApp",

                    route:
                        "calendar"
                }
            )
        );


        register(
            create(
                "todo",
                "Aufgaben",
                "productivity",
                "☑️",
                "Aufgaben verwalten.",
                {
                    favorite:
                        true,

                    order:
                        71,

                    module:
                        "todo",

                    moduleName:
                        "HalDoTodoApp",

                    route:
                        "todo"
                }
            )
        );


        register(
            create(
                "notes",
                "Notizen",
                "productivity",
                "📝",
                "Notizen erstellen und verwalten.",
                {
                    favorite:
                        true,

                    order:
                        72,

                    module:
                        "notes",

                    moduleName:
                        "HalDoNotesApp",

                    route:
                        "notes"
                }
            )
        );


        register(
            create(
                "calculator",
                "Rechner",
                "productivity",
                "🧮",
                "Berechnungen durchführen.",
                {
                    order:
                        73,

                    module:
                        "calculator",

                    moduleName:
                        "HalDoCalculatorApp",

                    route:
                        "calculator"
                }
            )
        );


        register(
            create(
                "clock",
                "Uhr",
                "productivity",
                "🕐",
                "Uhrzeit und Weltzeit.",
                {
                    order:
                        74,

                    module:
                        "clock",

                    moduleName:
                        "HalDoClockApp",

                    route:
                        "clock"
                }
            )
        );


        register(
            create(
                "stopwatch",
                "Stoppuhr",
                "productivity",
                "⏱️",
                "Stoppuhr.",
                {
                    order:
                        75,

                    module:
                        "stopwatch",

                    moduleName:
                        "HalDoStopwatchApp",

                    route:
                        "stopwatch"
                }
            )
        );


        register(
            create(
                "timer",
                "Timer",
                "productivity",
                "⏲️",
                "Timer.",
                {
                    order:
                        76,

                    module:
                        "timer",

                    moduleName:
                        "HalDoTimerApp",

                    route:
                        "timer"
                }
            )
        );


        register(
            create(
                "habits",
                "Gewohnheiten",
                "productivity",
                "📈",
                "Persönliche Routinen verwalten.",
                {
                    order:
                        77,

                    module:
                        "habits",

                    moduleName:
                        "HalDoHabitsApp",

                    route:
                        "habits"
                }
            )
        );


        /* ====================================================
           SPRACHE
           ==================================================== */

        register(
            create(
                "speech-to-text",
                "Sprache zu Text",
                "language",
                "🎙️",
                "Gesprochene Sprache in Text umwandeln.",
                {
                    order:
                        80,

                    module:
                        "speech-to-text",

                    moduleName:
                        "HalDoSpeechToTextApp",

                    route:
                        "speech-to-text",

                    permissions:
                        [
                            "microphone"
                        ]
                }
            )
        );


        register(
            create(
                "text-to-speech",
                "Text zu Sprache",
                "language",
                "🔊",
                "Text vorlesen lassen.",
                {
                    order:
                        81,

                    module:
                        "text-to-speech",

                    moduleName:
                        "HalDoTextToSpeechApp",

                    route:
                        "text-to-speech"
                }
            )
        );


        register(
            create(
                "language-center",
                "Sprachzentrum",
                "language",
                "🌍",
                "Sprach- und Übersetzungsfunktionen.",
                {
                    order:
                        82,

                    module:
                        "language-center",

                    moduleName:
                        "HalDoLanguageCenterApp",

                    route:
                        "language-center"
                }
            )
        );


        /* ====================================================
           ÊZÎDÎ
           ==================================================== */

        register(
            create(
                "ezidi-language",
                "Êzîdî Sprache",
                "ezidi",
                "𐺀",
                "Êzîdî-Sprachfunktionen.",
                {
                    favorite:
                        true,

                    order:
                        90,

                    module:
                        "ezidi-language",

                    moduleName:
                        "HalDoEzidiLanguageApp",

                    route:
                        "ezidi-language",

                    keywords:
                        [
                            "ezidi",
                            "êzîdî",
                            "kurdisch",
                            "sprache"
                        ]
                }
            )
        );


        register(
            create(
                "ezidi-dictionary",
                "Êzîdî Wörterbuch",
                "ezidi",
                "📖",
                "Êzîdî-Wörterbuch.",
                {
                    order:
                        91,

                    module:
                        "ezidi-dictionary",

                    moduleName:
                        "HalDoEzidiDictionaryApp",

                    route:
                        "ezidi-dictionary"
                }
            )
        );


        register(
            create(
                "ezidi-input",
                "Êzîdî Eingabe",
                "ezidi",
                "⌨️",
                "Spezielle Êzîdî-Tastatur und Eingabe.",
                {
                    order:
                        92,

                    module:
                        "ezidi-input",

                    moduleName:
                        "HalDoEzidiInputApp",

                    route:
                        "ezidi-input",

                    dependencies:
                        [
                            "ezidi-keyboard"
                        ]
                }
            )
        );


        register(
            create(
                "ezidi-keyboard",
                "Êzîdî Tastatur",
                "ezidi",
                "⌨️",
                "Eigene Êzîdî-Zeichen und Tastaturlayouts.",
                {
                    order:
                        93,

                    module:
                        "ezidi-keyboard",

                    moduleName:
                        "HalDoEzidiKeyboardApp",

                    route:
                        "ezidi-keyboard"
                }
            )
        );


        /* ====================================================
           SICHERHEIT
           ==================================================== */

        register(
            create(
                "security-center",
                "Security Center",
                "security",
                "🛡️",
                "Zentrale Sicherheitsfunktionen.",
                {
                    system:
                        true,

                    critical:
                        true,

                    order:
                        100,

                    module:
                        "security-center",

                    moduleName:
                        "HalDoSecurityCenterApp",

                    route:
                        "security-center"
                }
            )
        );


        register(
            create(
                "permissions",
                "Berechtigungen",
                "security",
                "🔑",
                "App-Berechtigungen verwalten.",
                {
                    order:
                        101,

                    module:
                        "permissions",

                    moduleName:
                        "HalDoPermissionsApp",

                    route:
                        "permissions"
                }
            )
        );


        register(
            create(
                "privacy",
                "Datenschutz",
                "security",
                "🔒",
                "Datenschutz- und Privatsphäre-Einstellungen.",
                {
                    order:
                        102,

                    module:
                        "privacy",

                    moduleName:
                        "HalDoPrivacyApp",

                    route:
                        "privacy"
                }
            )
        );


        /* ====================================================
           BACKUP
           ==================================================== */

        register(
            create(
                "backup",
                "Backup",
                "system",
                "💾",
                "Lokale Sicherungen.",
                {
                    order:
                        110,

                    module:
                        "backup",

                    moduleName:
                        "HalDoBackupApp",

                    route:
                        "backup"
                }
            )
        );


        register(
            create(
                "restore",
                "Wiederherstellung",
                "system",
                "♻️",
                "Wiederherstellung von Systemdaten.",
                {
                    order:
                        111,

                    module:
                        "restore",

                    moduleName:
                        "HalDoRestoreApp",

                    route:
                        "restore"
                }
            )
        );


        /* ====================================================
           ENTWICKLER
           ==================================================== */

        register(
            create(
                "console",
                "Konsole",
                "developer",
                "⌘",
                "Entwicklerkonsole.",
                {
                    order:
                        120,

                    module:
                        "console",

                    moduleName:
                        "HalDoConsoleApp",

                    route:
                        "console"
                }
            )
        );


        register(
            create(
                "module-center",
                "Module",
                "developer",
                "🧩",
                "Verwaltung von Systemmodulen.",
                {
                    order:
                        121,

                    module:
                        "module-center",

                    moduleName:
                        "HalDoModuleCenterApp",

                    route:
                        "module-center"
                }
            )
        );


        register(
            create(
                "app-developer",
                "App Entwickler",
                "developer",
                "🧑‍💻",
                "Entwicklung eigener HalDo Apps.",
                {
                    order:
                        122,

                    module:
                        "app-developer",

                    moduleName:
                        "HalDoAppDeveloperApp",

                    route:
                        "app-developer"
                }
            )
        );


        register(
            create(
                "diagnostics",
                "Diagnose",
                "developer",
                "🩺",
                "Systemdiagnose und Fehleranalyse.",
                {
                    order:
                        123,

                    module:
                        "diagnostics",

                    moduleName:
                        "HalDoDiagnosticsApp",

                    route:
                        "diagnostics"
                }
            )
        );


        /* ====================================================
           NETZWERK
           ==================================================== */

        register(
            create(
                "network",
                "Netzwerk",
                "system",
                "📡",
                "Netzwerk- und Verbindungsstatus.",
                {
                    order:
                        130,

                    module:
                        "network",

                    moduleName:
                        "HalDoNetworkApp",

                    route:
                        "network"
                }
            )
        );


        register(
            create(
                "wifi",
                "WLAN",
                "system",
                "📶",
                "WLAN-Verbindung und Status.",
                {
                    order:
                        131,

                    module:
                        "wifi",

                    moduleName:
                        "HalDoWiFiApp",

                    route:
                        "wifi"
                }
            )
        );


        /* ====================================================
           WEITERE SYSTEMWERKZEUGE
           ==================================================== */

        register(
            create(
                "tasks",
                "Systemaufgaben",
                "system",
                "📋",
                "Laufende System- und Hintergrundaufgaben.",
                {
                    order:
                        140,

                    module:
                        "tasks",

                    moduleName:
                        "HalDoTasksApp",

                    route:
                        "tasks"
                }
            )
        );


        register(
            create(
                "system-information",
                "Systeminformationen",
                "system",
                "ℹ️",
                "Technische Informationen über HalDo AI OS.",
                {
                    order:
                        141,

                    module:
                        "system-information",

                    moduleName:
                        "HalDoSystemInformationApp",

                    route:
                        "system-information"
                }
            )
        );


        return getAllApps();

    }


    /* ========================================================
       22 — REGISTRY STATUS
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        appCount:
            0,

        lastError:
            null

    };


    /* ========================================================
       23 — INITIALISIERUNG
       ======================================================== */

    function initialize() {

        if (
            state.initialized
        ) {

            return getState();

        }


        try {

            build();


            state.appCount =
                definitions.length;


            state.initialized =
                true;


            state.ready =
                true;


            state.lastError =
                null;


            emit(
                "ready",
                getState()
            );


            /*
             * App Manager benachrichtigen,
             * falls dieser bereits vorhanden ist.
             */

            if (
                window.HalDoAppManager
            ) {

                emit(
                    "app-manager-ready",
                    {
                        manager:
                            window.HalDoAppManager
                    }
                );

            }


            console.log(
                `[HalDo App Registry] ${state.appCount} Apps registriert.`
            );


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

        }


        return getState();

    }


    /* ========================================================
       24 — STATE
       ======================================================== */

    function getState() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            initialized:
                state.initialized,

            ready:
                state.ready,

            appCount:
                definitions.length,

            defaultApp:
                CONFIG.defaultApp,

            fallbackApp:
                CONFIG.fallbackApp,

            lastError:
                state.lastError

        };

    }


    /* ========================================================
       25 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        return {

            registry:
                getState(),

            categories:
                getCategories(),

            systemApps:
                getSystemApps().length,

            criticalApps:
                getCriticalApps().length,

            enabledApps:
                getEnabledApps().length,

            favorites:
                getFavorites().length,

            modules:
                definitions.filter(
                    app =>
                        Boolean(
                            app.module
                        )
                ).length,

            apps:
                getAllApps()

        };

    }


    /* ========================================================
       26 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,

        defaultApp:
            CONFIG.defaultApp,

        fallbackApp:
            CONFIG.fallbackApp,


        on,

        off,


        create,

        register,

        update,

        unregister,


        build,

        initialize,


        findApp,

        getAllApps,

        getEnabledApps,

        getFavorites,

        setFavorite,


        getCategories,

        getCategory:
            getAppsByCategory,

        getAppsByCategory,

        searchApps,

        getSortedApps,


        getSystemApps,

        getCriticalApps,

        getAutoStartApps,


        getModuleInfo,


        getState,

        diagnose

    };


    /* ========================================================
       27 — GLOBALE API
       ======================================================== */

    window.HalDoAppRegistry =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appRegistry =
        api;


    /*
     * Kompatibilität mit älteren
     * HalDo-Projektteilen.
     */

    window.HalDo =
        window.HalDo ||
        {};


    window.HalDo.appRegistry =
        api;


    /* ========================================================
       28 — START
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


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 APP REGISTRY
============================================================ */