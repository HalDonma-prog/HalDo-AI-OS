/* ============================================================
   HALDO AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei:
   config/apps.js

   Zentrale App Registry

   WICHTIG:
   Diese Datei enthält die zentrale App-Liste.
   Andere Dateien sollen keine eigene App-Liste führen.

   Architektur:

   config/apps.js
          ↓
   HalDoAppRegistry
          ↓
   app-manager.js
          ↓
   launcher.js
          ↓
   app-router.js
          ↓
   App-Module
   ============================================================ */

"use strict";


(function (window) {


    /* ========================================================
       01 — REGISTRY INFORMATION
       ======================================================== */

    const REGISTRY_NAME =
        "HalDo AI OS 18 App Registry";

    const REGISTRY_VERSION =
        "18.0.0";


    /* ========================================================
       02 — APP DATABASE
       ======================================================== */

    const apps = [

        /* ====================================================
           KI & AI
           ==================================================== */

        {
            id:
                "ai-chat",

            title:
                "HalDo AI Chat",

            name:
                "HalDo AI Chat",

            description:
                "Intelligenter HalDo AI Chat für Fragen, Antworten und Gespräche.",

            category:
                "ai",

            icon:
                "assets/logo/logo.png",

            keywords: [
                "ai",
                "ki",
                "chat",
                "assistant",
                "haldo",
                "künstliche intelligenz"
            ],

            enabled:
                true,

            favorite:
                true,

            order:
                10
        },


        {
            id:
                "ai-assistant",

            title:
                "AI Assistant",

            name:
                "AI Assistant",

            description:
                "Zentrale persönliche KI-Unterstützung innerhalb von HalDo AI OS.",

            category:
                "ai",

            icon:
                "assets/logo/logo.png",

            keywords: [
                "assistant",
                "ki",
                "ai",
                "hilfe",
                "assistent"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                20
        },


        {
            id:
                "ai-voice",

            title:
                "AI Voice",

            name:
                "AI Voice",

            description:
                "Sprachsteuerung und Sprachinteraktion für HalDo AI.",

            category:
                "ai",

            icon:
                "🎙️",

            keywords: [
                "voice",
                "sprache",
                "sprachsteuerung",
                "microfon",
                "mikrofon"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                30
        },


        {
            id:
                "ai-vision",

            title:
                "AI Vision",

            name:
                "AI Vision",

            description:
                "Bild- und visuelle KI-Funktionen.",

            category:
                "ai",

            icon:
                "👁️",

            keywords: [
                "vision",
                "bild",
                "kamera",
                "foto",
                "analyse"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                40
        },


        {
            id:
                "ai-translator",

            title:
                "AI Übersetzer",

            name:
                "AI Übersetzer",

            description:
                "Übersetzungsfunktionen für verschiedene Sprachen.",

            category:
                "ai",

            icon:
                "🌐",

            keywords: [
                "übersetzer",
                "translation",
                "sprache",
                "translator",
                "language"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                50
        },


        /* ====================================================
           KOMMUNIKATION
           ==================================================== */

        {
            id:
                "messages",

            title:
                "Nachrichten",

            name:
                "Nachrichten",

            description:
                "Zentrale Nachrichten- und Kommunikationsoberfläche.",

            category:
                "communication",

            icon:
                "💬",

            keywords: [
                "nachrichten",
                "messages",
                "chat",
                "kommunikation"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                100
        },


        {
            id:
                "contacts",

            title:
                "Kontakte",

            name:
                "Kontakte",

            description:
                "Kontakte verwalten und schnell erreichen.",

            category:
                "communication",

            icon:
                "👥",

            keywords: [
                "kontakte",
                "contacts",
                "personen",
                "telefonbuch"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                110
        },


        {
            id:
                "phone",

            title:
                "Telefon",

            name:
                "Telefon",

            description:
                "Telefon- und Anruffunktionen.",

            category:
                "communication",

            icon:
                "📞",

            keywords: [
                "telefon",
                "anruf",
                "call",
                "phone"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                120
        },


        {
            id:
                "email",

            title:
                "E-Mail",

            name:
                "E-Mail",

            description:
                "E-Mail-Verwaltung und Kommunikation.",

            category:
                "communication",

            icon:
                "✉️",

            keywords: [
                "email",
                "e-mail",
                "mail",
                "postfach"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                130
        },


        /* ====================================================
           PRODUKTIVITÄT
           ==================================================== */

        {
            id:
                "calendar",

            title:
                "Kalender",

            name:
                "Kalender",

            description:
                "Termine, Ereignisse und Kalender verwalten.",

            category:
                "productivity",

            icon:
                "📅",

            keywords: [
                "kalender",
                "calendar",
                "termine",
                "ereignisse",
                "event"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                200
        },


        {
            id:
                "tasks",

            title:
                "Aufgaben",

            name:
                "Aufgaben",

            description:
                "Aufgaben erstellen, organisieren und verfolgen.",

            category:
                "productivity",

            icon:
                "☑️",

            keywords: [
                "aufgaben",
                "tasks",
                "todo",
                "to-do",
                "liste"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                210
        },


        {
            id:
                "notes",

            title:
                "Notizen",

            name:
                "Notizen",

            description:
                "Notizen schreiben, bearbeiten und organisieren.",

            category:
                "productivity",

            icon:
                "📝",

            keywords: [
                "notizen",
                "notes",
                "notiz",
                "memo"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                220
        },


        {
            id:
                "calculator",

            title:
                "Taschenrechner",

            name:
                "Taschenrechner",

            description:
                "Rechner für alltägliche und wissenschaftliche Berechnungen.",

            category:
                "productivity",

            icon:
                "🧮",

            keywords: [
                "rechner",
                "calculator",
                "mathe",
                "rechnung"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                230
        },


        {
            id:
                "clock",

            title:
                "Uhr",

            name:
                "Uhr",

            description:
                "Uhrzeit, Timer, Stoppuhr und Wecker.",

            category:
                "productivity",

            icon:
                "🕒",

            keywords: [
                "uhr",
                "clock",
                "timer",
                "stoppuhr",
                "wecker"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                240
        },


        /* ====================================================
           DATEIEN
           ==================================================== */

        {
            id:
                "files",

            title:
                "Dateien",

            name:
                "Dateien",

            description:
                "Dateien durchsuchen, organisieren und verwalten.",

            category:
                "files",

            icon:
                "📁",

            keywords: [
                "dateien",
                "files",
                "ordner",
                "file manager",
                "dokumente"
            ],

            enabled:
                true,

            favorite:
                true,

            order:
                300
        },


        {
            id:
                "documents",

            title:
                "Dokumente",

            name:
                "Dokumente",

            description:
                "Dokumente erstellen und bearbeiten.",

            category:
                "files",

            icon:
                "📄",

            keywords: [
                "dokumente",
                "documents",
                "text",
                "datei"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                310
        },


        {
            id:
                "downloads",

            title:
                "Downloads",

            name:
                "Downloads",

            description:
                "Heruntergeladene Dateien verwalten.",

            category:
                "files",

            icon:
                "⬇️",

            keywords: [
                "downloads",
                "download",
                "herunterladen"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                320
        },


        /* ====================================================
           MEDIEN
           ==================================================== */

        {
            id:
                "gallery",

            title:
                "Galerie",

            name:
                "Galerie",

            description:
                "Bilder und visuelle Inhalte verwalten.",

            category:
                "media",

            icon:
                "🖼️",

            keywords: [
                "galerie",
                "gallery",
                "bilder",
                "fotos",
                "photos"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                400
        },


        {
            id:
                "camera",

            title:
                "Kamera",

            name:
                "Kamera",

            description:
                "Kameraoberfläche für Foto- und Videoaufnahmen.",

            category:
                "media",

            icon:
                "📷",

            keywords: [
                "kamera",
                "camera",
                "foto",
                "video"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                410
        },


        {
            id:
                "music",

            title:
                "Musik",

            name:
                "Musik",

            description:
                "Musik und Audioinhalte verwalten.",

            category:
                "media",

            icon:
                "🎵",

            keywords: [
                "musik",
                "music",
                "audio",
                "songs"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                420
        },


        {
            id:
                "video",

            title:
                "Video",

            name:
                "Video",

            description:
                "Videos verwalten und wiedergeben.",

            category:
                "media",

            icon:
                "🎬",

            keywords: [
                "video",
                "filme",
                "movies",
                "player"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                430
        },


        /* ====================================================
           INTERNET
           ==================================================== */

        {
            id:
                "browser",

            title:
                "Browser",

            name:
                "Browser",

            description:
                "Webseiten und Internetinhalte öffnen.",

            category:
                "internet",

            icon:
                "🌐",

            keywords: [
                "browser",
                "internet",
                "web",
                "www"
            ],

            enabled:
                true,

            favorite:
                true,

            order:
                500
        },


        {
            id:
                "bookmarks",

            title:
                "Lesezeichen",

            name:
                "Lesezeichen",

            description:
                "Gespeicherte Webseiten und Favoriten verwalten.",

            category:
                "internet",

            icon:
                "🔖",

            keywords: [
                "lesezeichen",
                "bookmarks",
                "favoriten",
                "web"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                510
        },


        /* ====================================================
           LERNEN
           ==================================================== */

        {
            id:
                "education",

            title:
                "Lernen",

            name:
                "Lernen",

            description:
                "Lernwerkzeuge und Wissensfunktionen.",

            category:
                "education",

            icon:
                "🎓",

            keywords: [
                "lernen",
                "bildung",
                "education",
                "schule",
                "wissen"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                600
        },


        {
            id:
                "dictionary",

            title:
                "Wörterbuch",

            name:
                "Wörterbuch",

            description:
                "Wörter, Begriffe und Bedeutungen nachschlagen.",

            category:
                "education",

            icon:
                "📚",

            keywords: [
                "wörterbuch",
                "dictionary",
                "wörter",
                "bedeutung"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                610
        },


        /* ====================================================
           ENTWICKLUNG
           ==================================================== */

        {
            id:
                "code-editor",

            title:
                "Code Editor",

            name:
                "Code Editor",

            description:
                "Code schreiben, bearbeiten und verwalten.",

            category:
                "development",

            icon:
                "💻",

            keywords: [
                "code",
                "editor",
                "programmieren",
                "entwicklung",
                "developer"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                700
        },


        {
            id:
                "developer-tools",

            title:
                "Developer Tools",

            name:
                "Developer Tools",

            description:
                "Werkzeuge für Entwicklung und Systemdiagnose.",

            category:
                "development",

            icon:
                "🛠️",

            keywords: [
                "developer",
                "tools",
                "entwicklung",
                "debug",
                "diagnose"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                710
        },


        /* ====================================================
           WERKZEUGE
           ==================================================== */

        {
            id:
                "weather",

            title:
                "Wetter",

            name:
                "Wetter",

            description:
                "Wetterinformationen und Vorhersagen.",

            category:
                "tools",

            icon:
                "☁️",

            keywords: [
                "wetter",
                "weather",
                "temperatur",
                "vorhersage"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                800
        },


        {
            id:
                "maps",

            title:
                "Karten",

            name:
                "Karten",

            description:
                "Karten- und Navigationsfunktionen.",

            category:
                "tools",

            icon:
                "🗺️",

            keywords: [
                "karten",
                "maps",
                "navigation",
                "ort"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                810
        },


        {
            id:
                "scanner",

            title:
                "Scanner",

            name:
                "Scanner",

            description:
                "Dokumente und Inhalte digital erfassen.",

            category:
                "tools",

            icon:
                "📠",

            keywords: [
                "scanner",
                "scan",
                "dokument"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                820
        },


        /* ====================================================
           SICHERHEIT
           ==================================================== */

        {
            id:
                "security",

            title:
                "Sicherheit",

            name:
                "Sicherheit",

            description:
                "Sicherheitsstatus und Schutzfunktionen.",

            category:
                "security",

            icon:
                "🛡️",

            keywords: [
                "sicherheit",
                "security",
                "schutz",
                "privacy"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                900
        },


        {
            id:
                "privacy",

            title:
                "Datenschutz",

            name:
                "Datenschutz",

            description:
                "Datenschutz- und Privatsphäre-Einstellungen.",

            category:
                "security",

            icon:
                "🔒",

            keywords: [
                "datenschutz",
                "privacy",
                "privatsphäre",
                "schutz"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                910
        },


        /* ====================================================
           SYSTEM
           ==================================================== */

        {
            id:
                "dashboard",

            title:
                "Dashboard",

            name:
                "Dashboard",

            description:
                "Zentrale Übersicht über HalDo AI OS 18.",

            category:
                "system",

            icon:
                "▦",

            keywords: [
                "dashboard",
                "übersicht",
                "start",
                "system"
            ],

            enabled:
                true,

            favorite:
                true,

            order:
                1000
        },


        {
            id:
                "system-monitor",

            title:
                "System Monitor",

            name:
                "System Monitor",

            description:
                "Systemstatus und laufende Komponenten überwachen.",

            category:
                "system",

            icon:
                "📊",

            keywords: [
                "system",
                "monitor",
                "status",
                "module"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                1010
        },


        {
            id:
                "settings",

            title:
                "Einstellungen",

            name:
                "Einstellungen",

            description:
                "HalDo AI OS Einstellungen verwalten.",

            category:
                "settings",

            icon:
                "⚙️",

            keywords: [
                "einstellungen",
                "settings",
                "optionen",
                "konfiguration"
            ],

            enabled:
                true,

            favorite:
                true,

            order:
                1100
        },


        {
            id:
                "app-manager",

            title:
                "App Manager",

            name:
                "App Manager",

            description:
                "Installierte und verfügbare HalDo Apps verwalten.",

            category:
                "settings",

            icon:
                "▦",

            keywords: [
                "app manager",
                "apps",
                "verwaltung",
                "anwendungen"
            ],

            enabled:
                true,

            favorite:
                false,

            order:
                1110
        },


        /* ====================================================
           HALDO SPEZIAL
           ==================================================== */

        {
            id:
                "haldo-home",

            title:
                "HalDo Home",

            name:
                "HalDo Home",

            description:
                "Zentrale HalDo AI OS Startoberfläche.",

            category:
                "system",

            icon:
                "assets/logo/logo.png",

            keywords: [
                "haldo",
                "home",
                "startseite",
                "start"
            ],

            enabled:
                true,

            favorite:
                true,

            order:
                1
        },


        {
            id:
                "haldo-ai",

            title:
                "HalDo AI",

            name:
                "HalDo AI",

            description:
                "Zentrale künstliche Intelligenz von HalDo AI OS 18.",

            category:
                "ai",

            icon:
                "assets/logo/logo.png",

            keywords: [
                "haldo",
                "ai",
                "ki",
                "assistant"
            ],

            enabled:
                true,

            favorite:
                true,

            order:
                5
        }

    ];


    /* ========================================================
       03 — DUPLIKATE VERHINDERN
       ======================================================== */

    const uniqueApps =
        [];

    const usedIds =
        new Set();


    apps.forEach(
        app => {

            if (
                !app ||
                !app.id
            ) {

                return;

            }


            const id =
                String(
                    app.id
                )
                .trim()
                .toLowerCase();


            if (
                usedIds.has(
                    id
                )
            ) {

                console.warn(
                    "[HalDo App Registry] Doppelte App-ID ignoriert:",
                    id
                );


                return;

            }


            usedIds.add(
                id
            );


            uniqueApps.push(
                {
                    ...app,

                    id
                }
            );

        }
    );


    /* ========================================================
       04 — SICHERE KOPIE
       ======================================================== */

    function cloneApp(
        app
    ) {

        if (
            !app
        ) {

            return null;

        }


        return {

            ...app,

            keywords:
                [
                    ...(app.keywords || [])
                ]

        };

    }


    /* ========================================================
       05 — ALLE APPS
       ======================================================== */

    function getAllApps() {

        return uniqueApps
            .map(
                cloneApp
            );

    }


    /* ========================================================
       06 — APP SUCHEN
       ======================================================== */

    function getApp(
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
            uniqueApps.find(
                item =>
                    item.id ===
                    id
            );


        return cloneApp(
            app
        );

    }


    /* ========================================================
       07 — KATEGORIEN
       ======================================================== */

    function getCategories() {

        const categories =
            new Map();


        uniqueApps.forEach(
            app => {

                const category =
                    app.category ||
                    "other";


                if (
                    !categories.has(
                        category
                    )
                ) {

                    categories.set(
                        category,
                        {
                            id:
                                category,

                            name:
                                category,

                            count:
                                0
                        }
                    );

                }


                categories.get(
                    category
                ).count++;

            }
        );


        return Array.from(
            categories.values()
        );

    }


    /* ========================================================
       08 — APPS NACH KATEGORIE
       ======================================================== */

    function getAppsByCategory(
        category
    ) {

        const id =
            String(
                category ||
                ""
            )
            .trim()
            .toLowerCase();


        return uniqueApps
            .filter(
                app =>
                    app.category ===
                    id
            )
            .map(
                cloneApp
            );

    }


    /* ========================================================
       09 — REGISTRY STATUS
       ======================================================== */

    function getState() {

        return {

            name:
                REGISTRY_NAME,

            version:
                REGISTRY_VERSION,

            count:
                uniqueApps.length,

            categories:
                getCategories().length,

            ready:
                true

        };

    }


    /* ========================================================
       10 — PUBLIC API
       ======================================================== */

    const registry = {

        name:
            REGISTRY_NAME,

        version:
            REGISTRY_VERSION,

        ready:
            true,


        getAllApps,

        getApp,

        getCategories,

        getAppsByCategory,

        getState

    };


    /* ========================================================
       11 — GLOBAL REGISTRY
       ======================================================== */

    window.HalDoAppRegistry =
        registry;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appRegistry =
        registry;


    /* ========================================================
       12 — DIAGNOSTIK
       ======================================================== */

    console.log(
        `[HalDo App Registry] ${uniqueApps.length} Apps geladen.`
    );


    console.log(
        `[HalDo App Registry] ${getCategories().length} Kategorien verfügbar.`
    );


})(window);


/* ============================================================
   ENDE — HALDO AI OS 18 APP REGISTRY
   ============================================================ */