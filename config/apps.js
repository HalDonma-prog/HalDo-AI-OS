/* ============================================================
   HALDO AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei:
   config/apps.js

   Zentrale App Registry

   Diese Datei enthält die komplette App-Liste von HalDo AI OS 18.

   WICHTIG:
   - Keine direkten .html-Links
   - Keine window.location.href
   - Keine zufälligen Dateipfade
   - Jede App besitzt eine eindeutige ID
   - Der App Router entscheidet später, wie die App geöffnet wird
   ============================================================ */

"use strict";


(function (window) {


    /* ========================================================
       01 — APP DATEN
       ======================================================== */

    const APPS = [

        /* ====================================================
           AI & ASSISTANT
           ==================================================== */

        {
            id: "ai-chat",
            title: "HalDo AI Chat",
            name: "AI Chat",
            description: "Intelligenter HalDo AI Chat und persönlicher Assistent.",
            category: "ai",
            icon: "assets/logo/logo.png",
            keywords: [
                "ai",
                "ki",
                "chat",
                "assistent",
                "haldo",
                "künstliche intelligenz"
            ],
            favorite: true,
            enabled: true,
            order: 1
        },

        {
            id: "ai-voice",
            title: "HalDo Voice",
            name: "Voice AI",
            description: "Sprachsteuerung und Sprachkommunikation mit HalDo AI.",
            category: "ai",
            icon: "🎙️",
            keywords: [
                "voice",
                "sprache",
                "mikrofon",
                "sprechen",
                "sprachsteuerung"
            ],
            favorite: false,
            enabled: true,
            order: 2
        },

        {
            id: "ai-vision",
            title: "HalDo Vision",
            name: "Vision AI",
            description: "Bildanalyse und visuelle KI-Funktionen.",
            category: "ai",
            icon: "👁️",
            keywords: [
                "vision",
                "bild",
                "kamera",
                "analyse",
                "foto"
            ],
            favorite: false,
            enabled: true,
            order: 3
        },

        {
            id: "ai-memory",
            title: "HalDo Memory",
            name: "Memory",
            description: "Persönliche und systemweite KI-Erinnerungen.",
            category: "ai",
            icon: "🧠",
            keywords: [
                "memory",
                "gedächtnis",
                "erinnerung",
                "wissen"
            ],
            favorite: false,
            enabled: true,
            order: 4
        },

        {
            id: "ai-tools",
            title: "AI Tools",
            name: "AI Tools",
            description: "Zentrale Sammlung intelligenter KI-Werkzeuge.",
            category: "ai",
            icon: "✦",
            keywords: [
                "ai tools",
                "ki tools",
                "werkzeuge"
            ],
            favorite: false,
            enabled: true,
            order: 5
        },


        /* ====================================================
           KOMMUNIKATION
           ==================================================== */

        {
            id: "messages",
            title: "Nachrichten",
            name: "Messages",
            description: "Nachrichten und Kommunikation.",
            category: "communication",
            icon: "💬",
            keywords: [
                "nachrichten",
                "messages",
                "chat"
            ],
            favorite: false,
            enabled: true,
            order: 10
        },

        {
            id: "contacts",
            title: "Kontakte",
            name: "Contacts",
            description: "Kontakte verwalten und organisieren.",
            category: "communication",
            icon: "👥",
            keywords: [
                "kontakte",
                "telefonbuch",
                "personen"
            ],
            favorite: false,
            enabled: true,
            order: 11
        },

        {
            id: "mail",
            title: "E-Mail",
            name: "Mail",
            description: "E-Mails verwalten und organisieren.",
            category: "communication",
            icon: "✉️",
            keywords: [
                "email",
                "mail",
                "e-mail"
            ],
            favorite: false,
            enabled: true,
            order: 12
        },

        {
            id: "video-call",
            title: "Video Call",
            name: "Video Call",
            description: "Video- und Audio-Kommunikation.",
            category: "communication",
            icon: "📹",
            keywords: [
                "video",
                "anruf",
                "call",
                "kamera"
            ],
            favorite: false,
            enabled: true,
            order: 13
        },


        /* ====================================================
           PRODUKTIVITÄT
           ==================================================== */

        {
            id: "calendar",
            title: "Kalender",
            name: "Calendar",
            description: "Termine, Veranstaltungen und Erinnerungen.",
            category: "productivity",
            icon: "📅",
            keywords: [
                "kalender",
                "termine",
                "event",
                "erinnerung"
            ],
            favorite: true,
            enabled: true,
            order: 20
        },

        {
            id: "notes",
            title: "Notizen",
            name: "Notes",
            description: "Notizen erstellen, bearbeiten und organisieren.",
            category: "productivity",
            icon: "📝",
            keywords: [
                "notizen",
                "notes",
                "text"
            ],
            favorite: false,
            enabled: true,
            order: 21
        },

        {
            id: "tasks",
            title: "Aufgaben",
            name: "Tasks",
            description: "Aufgaben und To-do-Listen verwalten.",
            category: "productivity",
            icon: "☑️",
            keywords: [
                "aufgaben",
                "todo",
                "tasks"
            ],
            favorite: false,
            enabled: true,
            order: 22
        },

        {
            id: "calculator",
            title: "Rechner",
            name: "Calculator",
            description: "Leistungsfähiger Taschenrechner.",
            category: "tools",
            icon: "🧮",
            keywords: [
                "rechner",
                "calculator",
                "mathematik"
            ],
            favorite: false,
            enabled: true,
            order: 23
        },

        {
            id: "clock",
            title: "Uhr",
            name: "Clock",
            description: "Uhrzeit, Timer, Stoppuhr und Wecker.",
            category: "productivity",
            icon: "🕐",
            keywords: [
                "uhr",
                "zeit",
                "timer",
                "stoppuhr",
                "wecker"
            ],
            favorite: false,
            enabled: true,
            order: 24
        },


        /* ====================================================
           DATEIEN
           ==================================================== */

        {
            id: "files",
            title: "Dateien",
            name: "File Manager",
            description: "Dateien und Ordner verwalten.",
            category: "files",
            icon: "📁",
            keywords: [
                "dateien",
                "files",
                "ordner",
                "file manager"
            ],
            favorite: true,
            enabled: true,
            order: 30
        },

        {
            id: "downloads",
            title: "Downloads",
            name: "Downloads",
            description: "Heruntergeladene Dateien verwalten.",
            category: "files",
            icon: "⬇️",
            keywords: [
                "downloads",
                "download"
            ],
            favorite: false,
            enabled: true,
            order: 31
        },

        {
            id: "documents",
            title: "Dokumente",
            name: "Documents",
            description: "Dokumente anzeigen und organisieren.",
            category: "files",
            icon: "📄",
            keywords: [
                "dokumente",
                "documents",
                "pdf",
                "dateien"
            ],
            favorite: false,
            enabled: true,
            order: 32
        },


        /* ====================================================
           MEDIEN
           ==================================================== */

        {
            id: "photos",
            title: "Fotos",
            name: "Photos",
            description: "Bilder und Fotos verwalten.",
            category: "media",
            icon: "🖼️",
            keywords: [
                "fotos",
                "bilder",
                "galerie",
                "photos"
            ],
            favorite: false,
            enabled: true,
            order: 40
        },

        {
            id: "camera",
            title: "Kamera",
            name: "Camera",
            description: "Kamera und Bildaufnahme.",
            category: "media",
            icon: "📷",
            keywords: [
                "kamera",
                "foto",
                "video"
            ],
            favorite: false,
            enabled: true,
            order: 41
        },

        {
            id: "music",
            title: "Musik",
            name: "Music",
            description: "Musik und Audio verwalten.",
            category: "media",
            icon: "🎵",
            keywords: [
                "musik",
                "audio",
                "songs"
            ],
            favorite: false,
            enabled: true,
            order: 42
        },

        {
            id: "video",
            title: "Video",
            name: "Video",
            description: "Videos verwalten und abspielen.",
            category: "media",
            icon: "🎬",
            keywords: [
                "video",
                "filme",
                "media"
            ],
            favorite: false,
            enabled: true,
            order: 43
        },


        /* ====================================================
           INTERNET
           ==================================================== */

        {
            id: "browser",
            title: "Browser",
            name: "HalDo Browser",
            description: "Webseiten und Internetdienste öffnen.",
            category: "internet",
            icon: "🌐",
            keywords: [
                "browser",
                "internet",
                "web",
                "www"
            ],
            favorite: true,
            enabled: true,
            order: 50
        },

        {
            id: "search",
            title: "Suche",
            name: "Search",
            description: "HalDo System- und Websuche.",
            category: "internet",
            icon: "🔎",
            keywords: [
                "suche",
                "search",
                "finden"
            ],
            favorite: false,
            enabled: true,
            order: 51
        },


        /* ====================================================
           BILDUNG
           ==================================================== */

        {
            id: "translator",
            title: "Übersetzer",
            name: "Translator",
            description: "Texte und Sprachen übersetzen.",
            category: "education",
            icon: "🌍",
            keywords: [
                "übersetzer",
                "translation",
                "sprache",
                "übersetzen"
            ],
            favorite: false,
            enabled: true,
            order: 60
        },

        {
            id: "dictionary",
            title: "Wörterbuch",
            name: "Dictionary",
            description: "Wörter, Bedeutungen und Definitionen.",
            category: "education",
            icon: "📚",
            keywords: [
                "wörterbuch",
                "dictionary",
                "definition"
            ],
            favorite: false,
            enabled: true,
            order: 61
        },

        {
            id: "ezidi-keyboard",
            title: "Êzîdî Tastatur",
            name: "Êzîdî Keyboard",
            description: "Êzîdî-Tastatur mit eigenen Zeichen und Layouts.",
            category: "education",
            icon: "⌨️",
            keywords: [
                "ezidi",
                "êzîdî",
                "tastatur",
                "keyboard",
                "zeichen",
                "layout"
            ],
            favorite: true,
            enabled: true,
            order: 62
        },


        /* ====================================================
           ENTWICKLUNG
           ==================================================== */

        {
            id: "code-editor",
            title: "Code Editor",
            name: "Code Editor",
            description: "Code schreiben und bearbeiten.",
            category: "development",
            icon: "💻",
            keywords: [
                "code",
                "programmieren",
                "editor",
                "entwicklung"
            ],
            favorite: false,
            enabled: true,
            order: 70
        },

        {
            id: "developer-tools",
            title: "Developer Tools",
            name: "Developer Tools",
            description: "Werkzeuge für Entwicklung und Diagnose.",
            category: "development",
            icon: "🛠️",
            keywords: [
                "developer",
                "entwicklung",
                "debug",
                "tools"
            ],
            favorite: false,
            enabled: true,
            order: 71
        },

        {
            id: "api-center",
            title: "API Center",
            name: "API Center",
            description: "APIs und Systemintegrationen verwalten.",
            category: "development",
            icon: "🔌",
            keywords: [
                "api",
                "schnittstelle",
                "integration"
            ],
            favorite: false,
            enabled: true,
            order: 72
        },


        /* ====================================================
           SICHERHEIT
           ==================================================== */

        {
            id: "security",
            title: "Sicherheit",
            name: "Security Center",
            description: "Sicherheitsstatus und Schutzfunktionen.",
            category: "security",
            icon: "🛡️",
            keywords: [
                "sicherheit",
                "security",
                "schutz"
            ],
            favorite: false,
            enabled: true,
            order: 80
        },

        {
            id: "privacy",
            title: "Datenschutz",
            name: "Privacy",
            description: "Datenschutz- und Berechtigungseinstellungen.",
            category: "security",
            icon: "🔐",
            keywords: [
                "datenschutz",
                "privacy",
                "berechtigungen"
            ],
            favorite: false,
            enabled: true,
            order: 81
        },


        /* ====================================================
           SYSTEM
           ==================================================== */

        {
            id: "settings",
            title: "Einstellungen",
            name: "Settings",
            description: "HalDo AI OS Einstellungen.",
            category: "settings",
            icon: "⚙️",
            keywords: [
                "einstellungen",
                "settings",
                "system"
            ],
            favorite: true,
            enabled: true,
            order: 90
        },

        {
            id: "system-info",
            title: "Systeminfo",
            name: "System Info",
            description: "Informationen über HalDo AI OS.",
            category: "system",
            icon: "ℹ️",
            keywords: [
                "system",
                "info",
                "version",
                "status"
            ],
            favorite: false,
            enabled: true,
            order: 91
        },

        {
            id: "system-monitor",
            title: "System Monitor",
            name: "System Monitor",
            description: "Systemstatus und laufende Dienste überwachen.",
            category: "system",
            icon: "📊",
            keywords: [
                "monitor",
                "system",
                "status",
                "diagnose"
            ],
            favorite: false,
            enabled: true,
            order: 92
        },

        {
            id: "notifications",
            title: "Benachrichtigungen",
            name: "Notifications",
            description: "System- und App-Benachrichtigungen.",
            category: "system",
            icon: "🔔",
            keywords: [
                "benachrichtigungen",
                "notifications",
                "meldungen"
            ],
            favorite: false,
            enabled: true,
            order: 93
        },

        {
            id: "help",
            title: "Hilfe",
            name: "Help Center",
            description: "Hilfe, Dokumentation und Informationen.",
            category: "system",
            icon: "❔",
            keywords: [
                "hilfe",
                "help",
                "support"
            ],
            favorite: false,
            enabled: true,
            order: 94
        }

    ];


    /* ========================================================
       02 — KATEGORIEN
       ======================================================== */

    const CATEGORY_NAMES = {

        all:
            "Alle Apps",

        favorites:
            "Favoriten",

        ai:
            "KI & AI",

        communication:
            "Kommunikation",

        productivity:
            "Produktivität",

        tools:
            "Werkzeuge",

        files:
            "Dateien",

        media:
            "Medien",

        internet:
            "Internet",

        education:
            "Lernen",

        development:
            "Entwicklung",

        security:
            "Sicherheit",

        settings:
            "Einstellungen",

        system:
            "System",

        other:
            "Weitere Apps"

    };


    /* ========================================================
       03 — REGISTRY API
       ======================================================== */

    function getAllApps() {

        return APPS
            .filter(
                app =>
                    app.enabled !==
                    false
            )
            .sort(
                (a, b) =>
                    (
                        a.order || 9999
                    ) -
                    (
                        b.order || 9999
                    )
            )
            .map(
                app => ({
                    ...app,

                    keywords:
                        [
                            ...(app.keywords || [])
                        ]

                })
            );

    }


    function getApp(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const app =
            APPS.find(
                item =>
                    item.id ===
                    id
            );


        return app
            ? {
                ...app,

                keywords:
                    [
                        ...(app.keywords || [])
                    ]
            }
            : null;

    }


    function getCategories() {

        const categories = [

            {
                id:
                    "all",

                name:
                    CATEGORY_NAMES.all,

                count:
                    getAllApps().length
            },

            {
                id:
                    "favorites",

                name:
                    CATEGORY_NAMES.favorites,

                count:
                    getAllApps()
                        .filter(
                            app =>
                                app.favorite
                        )
                        .length
            }

        ];


        Object.keys(
            CATEGORY_NAMES
        )
        .filter(
            id =>
                id !==
                "all" &&
                id !==
                "favorites"
        )
        .forEach(
            id => {

                const count =
                    getAllApps()
                        .filter(
                            app =>
                                app.category ===
                                id
                        )
                        .length;


                if (
                    count >
                    0
                ) {

                    categories.push({

                        id,

                        name:
                            CATEGORY_NAMES[id],

                        count

                    });

                }

            }
        );


        return categories;

    }


    function getCategory(
        categoryId
    ) {

        const id =
            normalizeId(
                categoryId
            );


        return getAllApps()
            .filter(
                app =>
                    app.category ===
                    id
            );

    }


    function search(
        query
    ) {

        const value =
            String(
                query || ""
            )
            .trim()
            .toLowerCase();


        if (
            !value
        ) {

            return getAllApps();

        }


        return getAllApps()
            .filter(
                app => {

                    const searchable =
                        [

                            app.id,

                            app.title,

                            app.name,

                            app.description,

                            app.category,

                            ...(app.keywords || [])

                        ]
                        .join(
                            " "
                        )
                        .toLowerCase();


                    return searchable.includes(
                        value
                    );

                }
            );

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
            /\s+/g,
            "-"
        );

    }


    /* ========================================================
       04 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            "HalDo App Registry",

        version:
            "18.0.0",


        getAllApps,

        getApp,

        getCategories,

        getCategory,

        search,


        getCount:
            function () {

                return getAllApps().length;

            }

    };


    /* ========================================================
       05 — GLOBAL
       ======================================================== */

    window.HalDoAppRegistry =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.apps =
        api;


    /* ========================================================
       06 — AUTOMATISCHE REGISTRIERUNG
       ======================================================== */

    if (
        window.HalDoAppManager &&
        typeof window.HalDoAppManager.registerApps ===
            "function"
    ) {

        window.HalDoAppManager.registerApps(
            getAllApps()
        );

    }


})(window);


/* ============================================================
   ENDE — HALDO AI OS 18 APP REGISTRY
   ============================================================ */