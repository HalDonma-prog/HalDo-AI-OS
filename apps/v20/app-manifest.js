/*
 * ============================================================
 * HalDo AI OS 20
 * Complete Application Manifest
 * ============================================================
 *
 * Datei:
 *   apps/v20/app-manifest.js
 *
 * Aufgabe:
 *   Zentrale Definition aller geplanten V20-Apps.
 *
 *   Dieses Manifest beschreibt:
 *   - ID
 *   - Name
 *   - Kategorie
 *   - Icon
 *   - Priorität
 *   - Abhängigkeiten
 *   - benötigte Dienste
 *   - Systemrechte
 *   - Navigation
 *
 * Die eigentliche App-Logik befindet sich in den jeweiligen
 * App-Modulen.
 *
 * ============================================================
 */

(function (window) {

    "use strict";


    const V20 =
        window.HalDoV20 =
        window.HalDoV20 || {};


    const Manifest = [];


    /* ========================================================
       HELPER
    ======================================================== */

    function app(config) {

        Manifest.push(

            Object.assign(

                {

                    version:
                        "20.0.0",

                    enabled:
                        true,

                    system:
                        false,

                    singleton:
                        false,

                    dependencies:
                        [],

                    services:
                        [],

                    permissions:
                        [],

                    keywords:
                        [],

                    settings:
                        {},

                    metadata:
                        {}

                },

                config

            )

        );
    }


    /* ========================================================
       CORE / AI
    ======================================================== */

    app({

        id:
            "ai-chat",

        name:
            "HalDo AI",

        category:
            "AI",

        icon:
            "🧠",

        priority:
            1,

        singleton:
            true,

        services:
            [
                "storage",
                "language",
                "voice",
                "notifications"
            ],

        permissions:
            [
                "storage",
                "microphone",
                "speech"
            ],

        keywords:
            [
                "ai",
                "assistant",
                "chat",
                "conversation",
                "haldo"
            ]
    });


    app({

        id:
            "calendar",

        name:
            "Kalender",

        category:
            "Produktivität",

        icon:
            "📅",

        priority:
            10,

        services:
            [
                "storage",
                "language",
                "notifications"
            ],

        dependencies:
            [],

        permissions:
            [
                "storage",
                "notifications"
            ],

        keywords:
            [
                "kalender",
                "termine",
                "events",
                "calendar"
            ]
    });


    app({

        id:
            "clock",

        name:
            "Uhr",

        category:
            "System",

        icon:
            "🕐",

        priority:
            11,

        services:
            [
                "language"
            ],

        keywords:
            [
                "uhr",
                "zeit",
                "clock",
                "world time"
            ]
    });


    app({

        id:
            "calculator",

        name:
            "Rechner",

        category:
            "Werkzeuge",

        icon:
            "🧮",

        priority:
            12,

        services:
            [
                "storage",
                "language"
            ],

        keywords:
            [
                "rechner",
                "calculator",
                "mathematik"
            ]
    });


    app({

        id:
            "notes",

        name:
            "Notizen",

        category:
            "Produktivität",

        icon:
            "📝",

        priority:
            20,

        services:
            [
                "storage",
                "language",
                "ai"
            ],

        permissions:
            [
                "storage"
            ],

        keywords:
            [
                "notizen",
                "notes",
                "memo"
            ]
    });


    app({

        id:
            "tasks",

        name:
            "Aufgaben",

        category:
            "Produktivität",

        icon:
            "✓",

        priority:
            21,

        services:
            [
                "storage",
                "language",
                "notifications"
            ],

        keywords:
            [
                "aufgaben",
                "tasks",
                "todo",
                "to-do"
            ]
    });


    app({

        id:
            "files",

        name:
            "Dateien",

        category:
            "System",

        icon:
            "📁",

        priority:
            22,

        services:
            [
                "storage",
                "language"
            ],

        permissions:
            [
                "storage"
            ],

        keywords:
            [
                "dateien",
                "files",
                "dokumente"
            ]
    });


    app({

        id:
            "contacts",

        name:
            "Kontakte",

        category:
            "Kommunikation",

        icon:
            "👤",

        priority:
            23,

        services:
            [
                "storage",
                "language"
            ],

        keywords:
            [
                "kontakte",
                "contacts",
                "personen"
            ]
    });


    app({

        id:
            "mail",

        name:
            "Mail",

        category:
            "Kommunikation",

        icon:
            "✉️",

        priority:
            24,

        services:
            [
                "storage",
                "language",
                "ai",
                "notifications"
            ],

        permissions:
            [
                "network",
                "storage"
            ],

        keywords:
            [
                "mail",
                "email",
                "e-mail",
                "nachrichten"
            ]
    });


    app({

        id:
            "messages",

        name:
            "Nachrichten",

        category:
            "Kommunikation",

        icon:
            "💬",

        priority:
            25,

        services:
            [
                "storage",
                "language",
                "notifications",
                "ai"
            ],

        keywords:
            [
                "nachrichten",
                "messages",
                "chat"
            ]
    });


    /* ========================================================
       NAVIGATION / MOBILITY
    ======================================================== */

    app({

        id:
            "navigation",

        name:
            "Navigation",

        category:
            "Mobilität",

        icon:
            "🧭",

        priority:
            30,

        services:
            [
                "storage",
                "language",
                "voice",
                "notifications"
            ],

        permissions:
            [
                "location",
                "network"
            ],

        dependencies:
            [
                "maps",
                "traffic"
            ],

        keywords:
            [
                "navigation",
                "route",
                "gps",
                "weg",
                "fahrt"
            ]
    });


    app({

        id:
            "maps",

        name:
            "Karten",

        category:
            "Mobilität",

        icon:
            "🗺️",

        priority:
            31,

        services:
            [
                "storage",
                "language"
            ],

        permissions:
            [
                "location",
                "network"
            ],

        keywords:
            [
                "karte",
                "maps",
                "ort",
                "location"
            ]
    });


    app({

        id:
            "traffic",

        name:
            "Verkehr",

        category:
            "Mobilität",

        icon:
            "🚦",

        priority:
            32,

        services:
            [
                "storage",
                "language",
                "notifications"
            ],

        permissions:
            [
                "location",
                "network"
            ],

        keywords:
            [
                "verkehr",
                "stau",
                "unfall",
                "warnung",
                "traffic"
            ]
    });


    app({

        id:
            "driving-school",

        name:
            "Fahrschule",

        category:
            "Mobilität",

        icon:
            "🚘",

        priority:
            33,

        services:
            [
                "storage",
                "language",
                "ai"
            ],

        keywords:
            [
                "fahrschule",
                "führerschein",
                "theorie",
                "verkehrsregeln"
            ]
    });


    app({

        id:
            "travel",

        name:
            "Reisen",

        category:
            "Reisen",

        icon:
            "✈️",

        priority:
            34,

        services:
            [
                "storage",
                "language",
                "ai"
            ],

        permissions:
            [
                "network",
                "location"
            ],

        keywords:
            [
                "reisen",
                "reise",
                "flug",
                "hotel",
                "urlaub"
            ]
    });


    app({

        id:
            "weather",

        name:
            "Wetter",

        category:
            "Information",

        icon:
            "🌤️",

        priority:
            35,

        services:
            [
                "storage",
                "language",
                "notifications"
            ],

        permissions:
            [
                "location",
                "network"
            ],

        keywords:
            [
                "wetter",
                "weather",
            ]
    });


    /* ========================================================
       MEDIA
    ======================================================== */

    app({

        id:
            "music",

        name:
            "Musik",

        category:
            "Medien",

        icon:
            "🎵",

        priority:
            40,

        services:
            [
                "storage",
                "language",
                "ai"
            ],

        permissions:
            [
                "storage",
                "audio"
            ],

        keywords:
            [
                "musik",
                "music",
                "audio",
                "songs"
            ]
    });


    app({

        id:
            "song-creator",

        name:
            "Song Creator",

        category:
            "Kreativität",

        icon:
            "🎼",

        priority:
            41,

        services:
            [
                "storage",
                "language",
                "ai",
                "voice"
            ],

        permissions:
            [
                "audio",
                "microphone",
                "storage"
            ],

        keywords:
            [
                "song",
                "musik erstellen",
                "komponieren",
                "music creator"
            ]
    });


    app({

        id:
            "video",

        name:
            "Video",

        category:
            "Medien",

        icon:
            "🎬",

        priority:
            42,

        services:
            [
                "storage",
                "language",
                "ai"
            ],

        permissions:
            [
                "storage",
                "camera"
            ],

        keywords:
            [
                "video",
                "film",
                "movie"
            ]
    });


    app({

        id:
            "gallery",

        name:
            "Galerie",

        category:
            "Medien",

        icon:
            "🖼️",

        priority:
            43,

        services:
            [
                "storage",
                "language"
            ],

        permissions:
            [
                "storage"
            ],

        keywords:
            [
                "galerie",
                "bilder",
                "fotos",
                "gallery"
            ]
    });


    app({

        id:
            "camera",

        name:
            "Kamera",

        category:
            "Medien",

        icon:
            "📷",

        priority:
            44,

        services:
            [
                "language",
                "storage"
            ],

        permissions:
            [
                "camera",
                "microphone",
                "storage"
            ],

        keywords:
            [
                "kamera",
                "camera",
                "foto"
            ]
    });


    /* ========================================================
       EDUCATION
    ======================================================== */

    app({

        id:
            "university",

        name:
            "Universität",

        category:
            "Bildung",

        icon:
            "🎓",

        priority:
            50,

        services:
            [
                "storage",
                "language",
                "ai"
            ],

        keywords:
            [
                "universität",
                "uni",
                "hochschule",
                "university"
            ]
    });


    app({

        id:
            "learning",

        name:
            "Lernen",

        category:
            "Bildung",

        icon:
            "📚",

        priority:
            51,

        services:
            [
                "storage",
                "language",
                "ai"
            ],

        keywords:
            [
                "lernen",
                "lernen",
                "schule",
                "education"
            ]
    });


    app({

        id:
            "translator",

        name:
            "Übersetzer",

        category:
            "Sprache",

        icon:
            "🌐",

        priority:
            52,

        services:
            [
                "storage",
                "language",
                "ai",
                "voice"
            ],

        keywords:
            [
                "übersetzer",
                "translation",
                "translate",
                "übersetzen"
            ]
    });


    app({

        id:
            "dictionary",

        name:
            "Wörterbuch",

        category:
            "Sprache",

        icon:
            "📖",

        priority:
            53,

        services:
            [
                "storage",
                "language",
                "ai"
            ],

        keywords:
            [
                "wörterbuch",
                "dictionary",
                "wort",
                "definition"
            ]
    });


    /* ========================================================
       HEALTH / TOOLS
    ======================================================== */

    app({

        id:
            "health",

        name:
            "Gesundheit",

        category:
            "Gesundheit",

        icon:
            "❤️",

        priority:
            60,

        services:
            [
                "storage",
                "language",
                "ai",
                "notifications"
            ],

        permissions:
            [
                "storage",
                "notifications"
            ],

        keywords:
            [
                "gesundheit",
                "health",
                "wellness",
                "fitness"
            ]
    });


    app({

        id:
            "browser",

        name:
            "Browser",

        category:
            "Internet",

        icon:
            "🌍",

        priority:
            61,

        services:
            [
                "storage",
                "language",
                "ai"
            ],

        permissions:
            [
                "network"
            ],

        keywords:
            [
                "browser",
                "internet",
                "web"
            ]
    });


    app({

        id:
            "scanner",

        name:
            "Scanner",

        category:
            "Werkzeuge",

        icon:
            "▦",

        priority:
            62,

        services:
            [
                "storage",
                "language"
            ],

        permissions:
            [
                "camera",
                "storage"
            ],

        keywords:
            [
                "scanner",
                "qr",
                "barcode",
                "scan"
            ]
    });


    app({

        id:
            "documents",

        name:
            "Dokumente",

        category:
            "Produktivität",

        icon:
            "📄",

        priority:
            63,

        services:
            [
                "storage",
                "language",
                "ai"
            ],

        permissions:
            [
                "storage"
            ],

        keywords:
            [
                "dokumente",
                "documents",
                "pdf",
                "datei"
            ]
    });


    app({

        id:
            "finance",

        name:
            "Finanzen",

        category:
            "Werkzeuge",

        icon:
            "💶",

        priority:
            64,

        services:
            [
                "storage",
                "language",
                "ai"
            ],

        keywords:
            [
                "finanzen",
                "finance",
                "geld",
                "budget"
            ]
    });


    app({

        id:
            "shopping",

        name:
            "Einkaufen",

        category:
            "Alltag",

        icon:
            "🛒",

        priority:
            65,

        services:
            [
                "storage",
                "language",
                "ai"
            ],

        keywords:
            [
                "einkaufen",
                "shopping",
                "produkte",
                "liste"
            ]
    });


    /* ========================================================
       SYSTEM / SETTINGS
    ======================================================== */

    app({

        id:
            "settings",

        name:
            "Einstellungen",

        category:
            "System",

        icon:
            "⚙️",

        priority:
            80,

        singleton:
            true,

        system:
            true,

        services:
            [
                "storage",
                "language",
                "ai"
            ],

        keywords:
            [
                "einstellungen",
                "settings",
                "system"
            ]
    });


    app({

        id:
            "security",

        name:
            "Sicherheit",

        category:
            "System",

        icon:
            "🛡️",

        priority:
            81,

        system:
            true,

        services:
            [
                "storage",
                "language"
            ],

        keywords:
            [
                "sicherheit",
                "security",
                "schutz"
            ]
    });


    app({

        id:
            "privacy",

        name:
            "Datenschutz",

        category:
            "System",

        icon:
            "🔐",

        priority:
            82,

        system:
            true,

        services:
            [
                "storage",
                "language"
            ],

        keywords:
            [
                "datenschutz",
                "privacy",
                "daten"
            ]
    });


    app({

        id:
            "backup",

        name:
            "Backup",

        category:
            "System",

        icon:
            "☁️",

        priority:
            83,

        system:
            true,

        services:
            [
                "storage",
                "language"
            ],

        keywords:
            [
                "backup",
                "sicherung",
                "restore"
            ]
    });


    app({

        id:
            "updates",

        name:
            "Updates",

        category:
            "System",

        icon:
            "↻",

        priority:
            84,

        system:
            true,

        services:
            [
                "language"
            ],

        permissions:
            [
                "network"
            ],

        keywords:
            [
                "updates",
                "aktualisierung",
                "version"
            ]
    });


    app({

        id:
            "network",

        name:
            "Netzwerk",

        category:
            "System",

        icon:
            "📡",

        priority:
            85,

        system:
            true,

        services:
            [
                "language"
            ],

        permissions:
            [
                "network"
            ],

        keywords:
            [
                "netzwerk",
                "wifi",
                "internet",
                "network"
            ]
    });


    app({

        id:
            "devices",

        name:
            "Geräte",

        category:
            "System",

        icon:
            "📱",

        priority:
            86,

        system:
            true,

        services:
            [
                "language",
                "storage"
            ],

        keywords:
            [
                "geräte",
                "devices",
                "hardware"
            ]
    });


    app({

        id:
            "language",

        name:
            "Sprachen",

        category:
            "System",

        icon:
            "🗣️",

        priority:
            87,

        system:
            true,

        services:
            [
                "language",
                "storage",
                "ai"
            ],

        keywords:
            [
                "sprache",
                "sprachen",
                "language",
                "translation"
            ]
    });


    app({

        id:
            "keyboard",

        name:
            "Tastatur",

        category:
            "System",

        icon:
            "⌨️",

        priority:
            88,

        system:
            true,

        services:
            [
                "language",
                "storage"
            ],

        keywords:
            [
                "tastatur",
                "keyboard",
                "ezidi",
                "êzîdî"
            ]
    });


    app({

        id:
            "themes",

        name:
            "Themes",

        category:
            "Personalisierung",

        icon:
            "🎨",

        priority:
            89,

        services:
            [
                "storage",
                "language"
            ],

        keywords:
            [
                "themes",
                "design",
                "hintergrund",
                "personalisierung"
            ]
    });


    /* ========================================================
       COSMIC WORLD
    ======================================================== */

    app({

        id:
            "cosmic-world",

        name:
            "Cosmic World",

        category:
            "HalDo",

        icon:
            "🌌",

        priority:
            90,

        singleton:
            true,

        system:
            true,

        services:
            [
                "storage",
                "language",
                "ai"
            ],

        dependencies:
            [
                "clock",
                "calendar"
            ],

        keywords:
            [
                "cosmic",
                "cosmos",
                "sonne",
                "sterne",
                "planeten",
                "cosmic clock"
            ]
    });


    app({

        id:
            "system-tools",

        name:
            "System Tools",

        category:
            "System",

        icon:
            "🔧",

        priority:
            99,

        system:
            true,

        services:
            [
                "storage",
                "language"
            ],

        keywords:
            [
                "system",
                "diagnose",
                "tools",
                "diagnostics"
            ]
    });


    /* ========================================================
       MANIFEST API
    ======================================================== */

    const API = {

        version:
            "20.0.0",

        getAll:
            function () {

                return Manifest
                    .slice()
                    .sort(
                        function (a, b) {

                            return (
                                a.priority -
                                b.priority
                            );

                        }
                    );
            },


        get:
            function (id) {

                const normalized =
                    String(id || "")
                        .trim()
                        .toLowerCase();


                return Manifest.find(
                    function (item) {

                        return (
                            item.id ===
                            normalized
                        );

                    }
                ) || null;
            },


        search:
            function (query) {

                const q =
                    String(query || "")
                        .trim()
                        .toLowerCase();


                if (!q) {

                    return API.getAll();
                }


                return API.getAll()
                    .filter(
                        function (item) {

                            const text =
                                [
                                    item.id,
                                    item.name,
                                    item.category,
                                    ...(item.keywords || [])
                                ]
                                .join(" ")
                                .toLowerCase();


                            return text.includes(q);

                        }
                    );
            },


        categories:
            function () {

                return [
                    ...new Set(
                        Manifest.map(
                            function (item) {

                                return item.category;

                            }
                        )
                    )
                ];
            },


        byCategory:
            function (category) {

                const value =
                    String(
                        category || ""
                    )
                    .trim()
                    .toLowerCase();


                return API.getAll()
                    .filter(
                        function (item) {

                            return (
                                String(
                                    item.category
                                )
                                .toLowerCase() ===
                                value
                            );

                        }
                    );
            },


        dependencies:
            function (id) {

                const item =
                    API.get(id);


                return item
                    ? item.dependencies.slice()
                    : [];
            },


        count:
            function () {

                return Manifest.length;
            }
    };


    /* ========================================================
       GLOBAL EXPORT
    ======================================================== */

    V20.appManifest =
        API;


    window.HalDoV20AppManifest =
        API;


    /*
     * Kompatibilität mit dem Registry-System.
     */

    const Registry =
        window.HalDoV20AppRegistry;


    if (
        Registry &&
        typeof Registry.register ===
        "function"
    ) {

        API.getAll()
            .forEach(
                function (definition) {

                    try {

                        Registry.register(
                            definition
                        );

                    } catch (error) {

                        console.warn(
                            "[HalDo V20 Manifest]",
                            "Registry konnte App nicht registrieren:",
                            definition.id,
                            error
                        );
                    }

                }
            );
    }


    console.log(
        "[HalDo AI OS 20]",
        API.count(),
        "Apps im Manifest."
    );


})(window);