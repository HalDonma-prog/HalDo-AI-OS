/* ============================================================

   HALDO AI OS 18

   PROFESSIONAL ULTIMATE FOUNDATION

   ------------------------------------------------------------

   Datei:

   config/apps.js

   ZENTRALE APP-REGISTRY

   Architektur:

       config/apps.js

              ↓

       HalDoAppRegistry

              ↓

       app-manager.js

              ↓

       app-router.js

              ↓

       launcher.js

   WICHTIG:

   - Dies ist die EINZIGE zentrale App-Liste.

   - Keine zweite App-Liste in Launcher/Router/Manager.

   - Apps dürfen zunächst registriert sein, auch wenn ihr

     echtes Modul später noch entwickelt wird.

   - Der Router verhindert in diesem Fall einen 404-Fehler.

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

        registryVersion:

            "1.0.0"

    };

    /* ========================================================

       02 — STATUS

       ======================================================== */

    const state = {

        initialized:

            false,

        ready:

            false,

        appCount:

            0

    };

    /* ========================================================

       03 — ZENTRALE APP-DATEN

       ======================================================== */

    const APPS = [

        /* ====================================================

           AI & INTELLIGENCE

           ==================================================== */

        {

            id: "ai-chat",

            title: "HalDo AI Chat",

            name: "AI Chat",

            icon: "💬",

            category: "ai",

            version: "18.0.0",

            description:

                "Intelligenter HalDo AI Chat.",

            enabled: true,

            favorite: true,

            order: 10,

            keywords: [

                "ai",

                "chat",

                "ki",

                "assistant",

                "conversation"

            ]

        },

        {

            id: "ai-assistant",

            title: "HalDo AI Assistant",

            name: "AI Assistant",

            icon: "✦",

            category: "ai",

            version: "18.0.0",

            description:

                "Zentraler persönlicher KI-Assistent.",

            enabled: true,

            favorite: true,

            order: 11,

            keywords: [

                "ai",

                "assistant",

                "ki",

                "hilfe"

            ]

        },

        {

            id: "ai-voice",

            title: "HalDo AI Voice",

            name: "AI Voice",

            icon: "🎙️",

            category: "ai",

            version: "18.0.0",

            description:

                "Sprachsteuerung und Sprachinteraktion.",

            enabled: true,

            favorite: false,

            order: 12,

            keywords: [

                "voice",

                "sprache",

                "speech",

                "microphone"

            ]

        },

        {

            id: "ai-vision",

            title: "HalDo AI Vision",

            name: "AI Vision",

            icon: "👁️",

            category: "ai",

            version: "18.0.0",

            description:

                "Bild- und visuelle KI-Funktionen.",

            enabled: true,

            favorite: false,

            order: 13,

            keywords: [

                "vision",

                "image",

                "bild",

                "camera",

                "ai"

            ]

        },

        {

            id: "ai-translator",

            title: "HalDo AI Translator",

            name: "AI Translator",

            icon: "文",

            category: "ai",

            version: "18.0.0",

            description:

                "Intelligente Übersetzung für mehrere Sprachen.",

            enabled: true,

            favorite: false,

            order: 14,

            keywords: [

                "translator",

                "translation",

                "übersetzer",

                "sprache"

            ]

        },

        /* ====================================================

           COMMUNICATION

           ==================================================== */

        {

            id: "messages",

            title: "Nachrichten",

            name: "Messages",

            icon: "✉",

            category: "communication",

            version: "18.0.0",

            description:

                "Nachrichten und Kommunikation.",

            enabled: true,

            favorite: false,

            order: 20,

            keywords: [

                "messages",

                "nachrichten",

                "sms",

                "chat"

            ]

        },

        {

            id: "contacts",

            title: "Kontakte",

            name: "Contacts",

            icon: "👥",

            category: "communication",

            version: "18.0.0",

            description:

                "Kontaktverwaltung.",

            enabled: true,

            favorite: false,

            order: 21,

            keywords: [

                "contacts",

                "kontakte",

                "personen",

                "adressbuch"

            ]

        },

        {

            id: "phone",

            title: "Telefon",

            name: "Phone",

            icon: "☎",

            category: "communication",

            version: "18.0.0",

            description:

                "Telefon- und Anruffunktionen.",

            enabled: true,

            favorite: false,

            order: 22,

            keywords: [

                "phone",

                "telefon",

                "call",

                "anruf"

            ]

        },

        {

            id: "email",

            title: "E-Mail",

            name: "Email",

            icon: "📧",

            category: "communication",

            version: "18.0.0",

            description:

                "E-Mail-Verwaltung.",

            enabled: true,

            favorite: false,

            order: 23,

            keywords: [

                "email",

                "mail",

                "e-mail"

            ]

        },

        /* ====================================================

           PRODUCTIVITY

           ==================================================== */

        {

            id: "calendar",

            title: "Kalender",

            name: "Calendar",

            icon: "📅",

            category: "productivity",

            version: "18.0.0",

            description:

                "Termine und Kalenderverwaltung.",

            enabled: true,

            favorite: false,

            order: 30,

            keywords: [

                "calendar",

                "kalender",

                "termine",

                "events"

            ]

        },

        {

            id: "tasks",

            title: "Aufgaben",

            name: "Tasks",

            icon: "✓",

            category: "productivity",

            version: "18.0.0",

            description:

                "Aufgaben und To-do-Verwaltung.",

            enabled: true,

            favorite: false,

            order: 31,

            keywords: [

                "tasks",

                "aufgaben",

                "todo",

                "to-do"

            ]

        },

        {

            id: "notes",

            title: "Notizen",

            name: "Notes",

            icon: "📝",

            category: "productivity",

            version: "18.0.0",

            description:

                "Notizen erstellen und verwalten.",

            enabled: true,

            favorite: false,

            order: 32,

            keywords: [

                "notes",

                "notizen",

                "memo"

            ]

        },

        {

            id: "calculator",

            title: "Rechner",

            name: "Calculator",

            icon: "⌗",

            category: "productivity",

            version: "18.0.0",

            description:

                "Mathematischer Rechner.",

            enabled: true,

            favorite: false,

            order: 33,

            keywords: [

                "calculator",

                "rechner",

                "mathematik"

            ]

        },

        {

            id: "clock",

            title: "Uhr",

            name: "Clock",

            icon: "◷",

            category: "productivity",

            version: "18.0.0",

            description:

                "Uhr, Timer und Zeitfunktionen.",

            enabled: true,

            favorite: false,

            order: 34,

            keywords: [

                "clock",

                "uhr",

                "timer",

                "zeit"

            ]

        },

        /* ====================================================

           FILES & DOCUMENTS

           ==================================================== */

        {

            id: "files",

            title: "Dateien",

            name: "Files",

            icon: "📁",

            category: "files",

            version: "18.0.0",

            description:

                "Dateiverwaltung des HalDo Systems.",

            enabled: true,

            favorite: true,

            order: 40,

            keywords: [

                "files",

                "dateien",

                "file manager",

                "ordner"

            ]

        },

        {

            id: "documents",

            title: "Dokumente",

            name: "Documents",

            icon: "📄",

            category: "files",

            version: "18.0.0",

            description:

                "Dokumente erstellen und verwalten.",

            enabled: true,

            favorite: false,

            order: 41,

            keywords: [

                "documents",

                "dokumente",

                "word",

                "text"

            ]

        },

        {

            id: "downloads",

            title: "Downloads",

            name: "Downloads",

            icon: "⇩",

            category: "files",

            version: "18.0.0",

            description:

                "Heruntergeladene Dateien.",

            enabled: true,

            favorite: false,

            order: 42,

            keywords: [

                "downloads",

                "download",

                "dateien"

            ]

        },

        /* ====================================================

           MEDIA

           ==================================================== */

        {

            id: "gallery",

            title: "Galerie",

            name: "Gallery",

            icon: "▧",

            category: "media",

            version: "18.0.0",

            description:

                "Bilder und Mediengalerie.",

            enabled: true,

            favorite: false,

            order: 50,

            keywords: [

                "gallery",

                "galerie",

                "photos",

                "bilder"

            ]

        },

        {

            id: "camera",

            title: "Kamera",

            name: "Camera",

            icon: "▣",

            category: "media",

            version: "18.0.0",

            description:

                "Kamera und Fotoaufnahme.",

            enabled: true,

            favorite: false,

            order: 51,

            keywords: [

                "camera",

                "kamera",

                "photo",

                "foto"

            ]

        },

        {

            id: "music",

            title: "Musik",

            name: "Music",

            icon: "♫",

            category: "media",

            version: "18.0.0",

            description:

                "Musik und Audio.",

            enabled: true,

            favorite: false,

            order: 52,

            keywords: [

                "music",

                "musik",

                "audio",

                "songs"

            ]

        },

        {

            id: "video",

            title: "Video",

            name: "Video",

            icon: "▶",

            category: "media",

            version: "18.0.0",

            description:

                "Videoverwaltung und Wiedergabe.",

            enabled: true,

            favorite: false,

            order: 53,

            keywords: [

                "video",

                "videos",

                "player",

                "media"

            ]

        },

        /* ====================================================

           INTERNET

           ==================================================== */

        {

            id: "browser",

            title: "Browser",

            name: "Browser",

            icon: "◎",

            category: "internet",

            version: "18.0.0",

            description:

                "Web-Browser für HalDo AI OS.",

            enabled: true,

            favorite: false,

            order: 60,

            keywords: [

                "browser",

                "internet",

                "web",

                "www"

            ]

        },

        {

            id: "bookmarks",

            title: "Lesezeichen",

            name: "Bookmarks",

            icon: "🔖",

            category: "internet",

            version: "18.0.0",

            description:

                "Gespeicherte Webseiten und Lesezeichen.",

            enabled: true,

            favorite: false,

            order: 61,

            keywords: [

                "bookmarks",

                "lesezeichen",

                "web"

            ]

        },

        /* ====================================================

           EDUCATION

           ==================================================== */

        {

            id: "education",

            title: "Lernen",

            name: "Education",

            icon: "🎓",

            category: "education",

            version: "18.0.0",

            description:

                "Lern- und Bildungsbereich.",

            enabled: true,

            favorite: false,

            order: 70,

            keywords: [

                "education",

                "lernen",

                "schule",

                "bildung"

            ]

        },

        {

            id: "dictionary",

            title: "Wörterbuch",

            name: "Dictionary",

            icon: "A",

            category: "education",

            version: "18.0.0",

            description:

                "Wörterbuch und Begriffsverwaltung.",

            enabled: true,

            favorite: false,

            order: 71,

            keywords: [

                "dictionary",

                "wörterbuch",

                "words",

                "sprache"

            ]

        },

        /* ====================================================

           DEVELOPMENT

           ==================================================== */

        {

            id: "code-editor",

            title: "Code Editor",

            name: "Code Editor",

            icon: "</>",

            category: "development",

            version: "18.0.0",

            description:

                "Editor für Quellcode.",

            enabled: true,

            favorite: false,

            order: 80,

            keywords: [

                "code",

                "editor",

                "programmieren",

                "development"

            ]

        },

        {

            id: "developer-tools",

            title: "Developer Tools",

            name: "Developer Tools",

            icon: "⚙",

            category: "development",

            version: "18.0.0",

            description:

                "Werkzeuge für Entwicklung und Diagnose.",

            enabled: true,

            favorite: false,

            order: 81,

            keywords: [

                "developer",

                "tools",

                "entwicklung",

                "debug",

                "diagnose"

            ]

        },

        /* ====================================================

           LOCATION & INFORMATION

           ==================================================== */

        {

            id: "weather",

            title: "Wetter",

            name: "Weather",

            icon: "☁",

            category: "information",

            version: "18.0.0",

            description:

                "Wetterinformationen.",

            enabled: true,

            favorite: false,

            order: 90,

            keywords: [

                "weather",

                "wetter",

                "forecast"

            ]

        },

        {

            id: "maps",

            title: "Karten",

            name: "Maps",

            icon: "⌖",

            category: "information",

            version: "18.0.0",

            description:

                "Karten und Navigation.",

            enabled: true,

            favorite: false,

            order: 91,

            keywords: [

                "maps",

                "karten",

                "navigation",

                "location"

            ]

        },

        /* ====================================================

           TOOLS

           ==================================================== */

        {

            id: "scanner",

            title: "Scanner",

            name: "Scanner",

            icon: "▤",

            category: "tools",

            version: "18.0.0",

            description:

                "Dokumenten- und QR-Scan-Funktionen.",

            enabled: true,

            favorite: false,

            order: 100,

            keywords: [

                "scanner",

                "scan",

                "qr",

                "dokument"

            ]

        },

        /* ====================================================

           SECURITY & PRIVACY

           ==================================================== */

        {

            id: "security",

            title: "Sicherheit",

            name: "Security",

            icon: "◆",

            category: "security",

            version: "18.0.0",

            description:

                "Sicherheitsfunktionen des HalDo Systems.",

            enabled: true,

            favorite: false,

            order: 110,

            keywords: [

                "security",

                "sicherheit",

                "schutz"

            ]

        },

        {

            id: "privacy",

            title: "Datenschutz",

            name: "Privacy",

            icon: "◇",

            category: "security",

            version: "18.0.0",

            description:

                "Datenschutz- und Privatsphäre-Einstellungen.",

            enabled: true,

            favorite: false,

            order: 111,

            keywords: [

                "privacy",

                "datenschutz",

                "privatsphäre"

            ]

        },

        /* ====================================================

           SYSTEM

           ==================================================== */

        {

            id: "dashboard",

            title: "HalDo Dashboard",

            name: "Dashboard",

            icon: "▦",

            category: "system",

            version: "18.0.0",

            description:

                "Zentrale Übersicht von HalDo AI OS.",

            enabled: true,

            favorite: true,

            order: 120,

            keywords: [

                "dashboard",

                "system",

                "übersicht",

                "home"

            ]

        },

        {

            id: "haldo-home",

            title: "HalDo Home",

            name: "HalDo Home",

            icon: "assets/logo/logo.png",

            category: "system",

            version: "18.0.0",

            description:

                "Zentrale Startoberfläche von HalDo AI OS 18.",

            enabled: true,

            favorite: true,

            order: 0,

            keywords: [

                "home",

                "start",

                "haldo",

                "os"

            ]

        }

    ];

    /* ========================================================

       04 — DUPLIKATE ENTFERNEN / PRÜFEN

       ======================================================== */

    function validateApps() {

        const ids =

            new Set();

        const validApps =

            [];

        APPS.forEach(

            app => {

                if (

                    !app ||

                    typeof app.id !==

                        "string"

                ) {

                    return;

                }

                const id =

                    app.id

                        .trim()

                        .toLowerCase();

                if (

                    !id

                ) {

                    return;

                }

                if (

                    ids.has(

                        id

                    )

                ) {

                    console.warn(

                        "[HalDo Registry] Doppelte App-ID entfernt:",

                        id

                    );

                    return;

                }

                ids.add(

                    id

                );

                /*

                 * Normalisierte Kopie.

                 */

                validApps.push(

                    {

                        ...app,

                        id,

                        title:

                            app.title ||

                            app.name ||

                            id,

                        name:

                            app.name ||

                            app.title ||

                            id,

                        category:

                            app.category ||

                            "other",

                        version:

                            app.version ||

                            CONFIG.version,

                        enabled:

                            app.enabled !==

                            false,

                        favorite:

                            app.favorite ===

                            true,

                        order:

                            Number.isFinite(

                                Number(

                                    app.order

                                )

                            )

                                ? Number(

                                    app.order

                                )

                                : 999999,

                        keywords:

                            Array.isArray(

                                app.keywords

                            )

                                ? [

                                    ...app.keywords

                                ]

                                : []

                    }

                );

            }

        );

        return validApps;

    }

    /* ========================================================

       05 — NORMALISIERTE APPS

       ======================================================== */

    const registryApps =

        validateApps();

    /* ========================================================

       06 — APP SUCHEN

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

        if (

            !id

        ) {

            return null;

        }

        return (

            registryApps.find(

                app =>

                    app.id ===

                    id

            ) ||

            null

        );

    }

    /* ========================================================

       07 — ALLE APPS

       ======================================================== */

    function getAllApps() {

        return registryApps.map(

            app =>

                ({

                    ...app,

                    keywords:

                        [

                            ...(app.keywords || [])

                        ]

                })

        );

    }

    /* ========================================================

       08 — AKTIVE APPS

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

       09 — DEAKTIVIERTE APPS

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

       10 — FAVORITEN

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

       11 — KATEGORIEN

       ======================================================== */

    function getCategories() {

        const map =

            new Map();

        registryApps.forEach(

            app => {

                const id =

                    app.category ||

                    "other";

                if (

                    !map.has(

                        id

                    )

                ) {

                    map.set(

                        id,

                        {

                            id,

                            name:

                                getCategoryName(

                                    id

                                ),

                            count:

                                0

                        }

                    );

                }

                map.get(

                    id

                ).count++;

            }

        );

        return Array.from(

            map.values()

        );

    }

    /* ========================================================

       12 — KATEGORIE-NAMEN

       ======================================================== */

    function getCategoryName(

        category

    ) {

        const names = {

            ai:

                "KI & AI",

            communication:

                "Kommunikation",

            productivity:

                "Produktivität",

            files:

                "Dateien & Dokumente",

            media:

                "Medien",

            internet:

                "Internet",

            education:

                "Lernen & Bildung",

            development:

                "Entwicklung",

            information:

                "Information",

            tools:

                "Werkzeuge",

            security:

                "Sicherheit",

            system:

                "System",

            other:

                "Weitere"

        };

        return (

            names[

                category

            ] ||

            category

        );

    }

    /* ========================================================

       13 — APPS NACH KATEGORIE

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

        if (

            !id ||

            id ===

            "all"

        ) {

            return getAllApps();

        }

        return getAllApps()

            .filter(

                app =>

                    app.category ===

                    id

            );

    }

    /* ========================================================

       14 — APP SUCHEN

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

                            getCategoryName(

                                app.category

                            ),

                            ...(app.keywords || [])

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

       15 — APP COUNT

       ======================================================== */

    function getAppCount() {

        return registryApps.length;

    }

    /* ========================================================

       16 — REGISTRY STATUS

       ======================================================== */

    function getState() {

        return {

            initialized:

                state.initialized,

            ready:

                state.ready,

            appCount:

                state.appCount,

            version:

                CONFIG.version,

            registryVersion:

                CONFIG.registryVersion

        };

    }

    /* ========================================================

       17 — DIAGNOSE

       ======================================================== */

    function diagnose() {

        return {

            registry:

                getState(),

            categories:

                getCategories(),

            enabledApps:

                getEnabledApps().length,

            disabledApps:

                getDisabledApps().length,

            favorites:

                getFavorites().length,

            duplicateIds:

                false

        };

    }

    /* ========================================================

       18 — INITIALISIERUNG

       ======================================================== */

    function init() {

        if (

            state.initialized

        ) {

            return getState();

        }

        state.initialized =

            true;

        state.appCount =

            registryApps.length;

        state.ready =

            true;

        /*

         * System registrieren.

         */

        if (

            window.HalDoSystem &&

            typeof window.HalDoSystem.registerService ===

                "function"

        ) {

            window.HalDoSystem.registerService(

                "app-registry",

                api

            );

        }

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

        }

        console.log(

            `[HalDo Registry] ${state.appCount} Apps registriert.`

        );

        return getState();

    }

    /* ========================================================

       19 — PUBLIC API

       ======================================================== */

    const api = {

        name:

            CONFIG.name,

        version:

            CONFIG.version,

        init,

        getAllApps,

        getEnabledApps,

        getDisabledApps,

        getFavorites,

        getApp:

            findApp,

        findApp,

        getCategories,

        getCategoryName,

        getAppsByCategory,

        searchApps,

        getAppCount,

        getState,

        diagnose

    };

    /* ========================================================

       20 — GLOBAL

       ======================================================== */

    window.HalDoAppRegistry =

        api;

    window.HalDoOS =

        window.HalDoOS ||

        {};

    window.HalDoOS.appRegistry =

        api;

    /* ========================================================

       21 — START

       ======================================================== */

    function boot() {

        init();

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