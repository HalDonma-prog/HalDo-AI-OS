/*
============================================================
 HALDO AI OS 18
 APP MANAGER
 Professional Ultimate Foundation
============================================================

 Datei:
 js/app-manager.js

 Aufgabe:
 - zentrale App-Verwaltung
 - App-Registry
 - App-Kategorien
 - App-Status
 - Favoriten
 - zuletzt verwendete Apps
 - App-Suche
 - App-Start / Schließen
 - App-Aktivierung / Deaktivierung
 - App-Abhängigkeiten
 - App-Berechtigungen
 - Vorbereitung für echte App-Oberflächen
============================================================
*/

"use strict";


(function (window) {


    /* ========================================================
       APP MANAGER
       ======================================================== */

    const HalDoAppManager = {


        /* ====================================================
           INFORMATION
           ==================================================== */

        name:
            "HalDo App Manager",

        version:
            "18.0.0",

        status:
            "CREATED",

        initialized:
            false,


        /* ====================================================
           CORE
           ==================================================== */

        storage:
            null,

        config:
            null,

        kernel:
            null,

        system:
            null,


        /* ====================================================
           APP STORAGE
           ==================================================== */

        apps:
            new Map(),

        runningApps:
            new Set(),

        favoriteApps:
            new Set(),

        recentApps:
            [],


        /* ====================================================
           EVENTS
           ==================================================== */

        listeners:
            new Map(),


        /* ====================================================
           STANDARD APPS
           ==================================================== */

        definitions: [

            /*
            ----------------------------------------------------
            SYSTEM
            ----------------------------------------------------
            */

            {
                id: "settings",
                name: "Einstellungen",
                category: "system",
                icon: "⚙️",
                description: "HalDo AI OS Einstellungen.",
                enabled: true,
                autoStart: false,
                system: true,
                critical: false
            },

            {
                id: "system-info",
                name: "Systeminformationen",
                category: "system",
                icon: "ℹ️",
                description: "Informationen über HalDo AI OS.",
                enabled: true,
                autoStart: false,
                system: true,
                critical: false
            },

            {
                id: "task-manager",
                name: "Task Manager",
                category: "system",
                icon: "📊",
                description: "Laufende Apps und Systemprozesse.",
                enabled: true,
                autoStart: false,
                system: true,
                critical: false
            },

            {
                id: "file-manager",
                name: "Dateien",
                category: "system",
                icon: "📁",
                description: "Dateien und Ordner verwalten.",
                enabled: true,
                autoStart: false,
                system: true,
                critical: false
            },

            {
                id: "storage",
                name: "Speicher",
                category: "system",
                icon: "💾",
                description: "Lokalen HalDo-Speicher verwalten.",
                enabled: true,
                autoStart: false,
                system: true,
                critical: false
            },


            /*
            ----------------------------------------------------
            HALDO AI
            ----------------------------------------------------
            */

            {
                id: "haldo-ai",
                name: "HalDo AI",
                category: "ai",
                icon: "assets/logo/logo.png",
                description: "Zentrale künstliche Intelligenz von HalDo.",
                enabled: true,
                autoStart: false,
                system: true,
                critical: true
            },

            {
                id: "ai-chat",
                name: "AI Chat",
                category: "ai",
                icon: "💬",
                description: "Mit HalDo AI chatten.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "ai-voice",
                name: "AI Sprache",
                category: "ai",
                icon: "🎙️",
                description: "Sprachsteuerung und Sprachkommunikation.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "ai-memory",
                name: "AI Memory",
                category: "ai",
                icon: "🧠",
                description: "Verwaltung von AI-Kontext und Erinnerungen.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "ai-tools",
                name: "AI Tools",
                category: "ai",
                icon: "🛠️",
                description: "Werkzeuge und Funktionen von HalDo AI.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },


            /*
            ----------------------------------------------------
            KOMMUNIKATION
            ----------------------------------------------------
            */

            {
                id: "messages",
                name: "Nachrichten",
                category: "communication",
                icon: "💬",
                description: "Nachrichtenverwaltung.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "contacts",
                name: "Kontakte",
                category: "communication",
                icon: "👥",
                description: "Kontakte verwalten.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "email",
                name: "E-Mail",
                category: "communication",
                icon: "✉️",
                description: "E-Mail-Funktionen.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },


            /*
            ----------------------------------------------------
            INTERNET
            ----------------------------------------------------
            */

            {
                id: "browser",
                name: "Browser",
                category: "internet",
                icon: "🌐",
                description: "Internet-Browser.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "search",
                name: "Suche",
                category: "internet",
                icon: "🔎",
                description: "System- und Websuche.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },


            /*
            ----------------------------------------------------
            PRODUKTIVITÄT
            ----------------------------------------------------
            */

            {
                id: "notes",
                name: "Notizen",
                category: "productivity",
                icon: "📝",
                description: "Notizen erstellen und verwalten.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "calendar",
                name: "Kalender",
                category: "productivity",
                icon: "📅",
                description: "Kalender und Termine.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "calculator",
                name: "Rechner",
                category: "productivity",
                icon: "🧮",
                description: "Berechnungen durchführen.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "clock",
                name: "Uhr",
                category: "productivity",
                icon: "🕐",
                description: "Uhrzeit, Timer und Stoppuhr.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "reminders",
                name: "Erinnerungen",
                category: "productivity",
                icon: "🔔",
                description: "Erinnerungen verwalten.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "documents",
                name: "Dokumente",
                category: "productivity",
                icon: "📄",
                description: "Dokumente erstellen und verwalten.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },


            /*
            ----------------------------------------------------
            MULTIMEDIA
            ----------------------------------------------------
            */

            {
                id: "photos",
                name: "Fotos",
                category: "media",
                icon: "🖼️",
                description: "Bilder anzeigen und verwalten.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "camera",
                name: "Kamera",
                category: "media",
                icon: "📷",
                description: "Kamera-Funktionen.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "music",
                name: "Musik",
                category: "media",
                icon: "🎵",
                description: "Musik und Audio.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "video",
                name: "Video",
                category: "media",
                icon: "🎬",
                description: "Videos wiedergeben.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },


            /*
            ----------------------------------------------------
            KARTEN / REISEN
            ----------------------------------------------------
            */

            {
                id: "maps",
                name: "Karten",
                category: "travel",
                icon: "🗺️",
                description: "Karten und Navigation.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "weather",
                name: "Wetter",
                category: "travel",
                icon: "🌤️",
                description: "Wetterinformationen.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },


            /*
            ----------------------------------------------------
            ÜBERSETZUNG / SPRACHE
            ----------------------------------------------------
            */

            {
                id: "translator",
                name: "Übersetzer",
                category: "language",
                icon: "🌍",
                description: "Übersetzen zwischen Sprachen.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "dictionary",
                name: "Wörterbuch",
                category: "language",
                icon: "📖",
                description: "Wörter und Bedeutungen.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "keyboard",
                name: "Tastatur",
                category: "language",
                icon: "⌨️",
                description: "HalDo-Tastatur und Layouts.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },

            {
                id: "ezidi-keyboard",
                name: "Êzîdî Tastatur",
                category: "language",
                icon: "⌨️",
                description: "Spezielle Êzîdî-/Ezidi-Tastatur.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },


            /*
            ----------------------------------------------------
            SICHERHEIT
            ----------------------------------------------------
            */

            {
                id: "security",
                name: "Sicherheit",
                category: "security",
                icon: "🛡️",
                description: "Sicherheits- und Datenschutzeinstellungen.",
                enabled: true,
                autoStart: false,
                system: true,
                critical: false
            },

            {
                id: "privacy",
                name: "Datenschutz",
                category: "security",
                icon: "🔐",
                description: "Datenschutzverwaltung.",
                enabled: true,
                autoStart: false,
                system: false,
                critical: false
            },


            /*
            ----------------------------------------------------
            BENACHRICHTIGUNGEN
            ----------------------------------------------------
            */

            {
                id: "notifications",
                name: "Benachrichtigungen",
                category: "system",
                icon: "🔔",
                description: "Systembenachrichtigungen.",
                enabled: true,
                autoStart: false,
                system: true,
                critical: false
            },


            /*
            ----------------------------------------------------
            ENTWICKLER
            ----------------------------------------------------
            */

            {
                id: "developer",
                name: "Entwickler",
                category: "developer",
                icon: "💻",
                description: "Entwicklerwerkzeuge für HalDo AI OS.",
                enabled: true,
                autoStart: false,
                system: true,
                critical: false
            },

            {
                id: "diagnostics",
                name: "Diagnose",
                category: "developer",
                icon: "🔧",
                description: "Systemdiagnose und Fehleranalyse.",
                enabled: true,
                autoStart: false,
                system: true,
                critical: false
            },

            {
                id: "logs",
                name: "Systemprotokoll",
                category: "developer",
                icon: "📋",
                description: "System- und Debug-Protokolle.",
                enabled: true,
                autoStart: false,
                system: true,
                critical: false
            }

        ],


        /* ====================================================
           INITIALIZE
           ==================================================== */

        initialize() {


            if (
                this.initialized
            ) {

                return true;

            }


            this.status =
                "INITIALIZING";


            this.connectCore();


            this.registerDefinitions();


            this.loadUserState();


            this.initialized =
                true;


            this.status =
                "READY";


            this.emit(
                "ready",
                this.getStatus()
            );


            this.log(
                `App Manager bereit: ${this.apps.size} Apps registriert.`
            );


            return true;

        },


        /* ====================================================
           CORE VERBINDEN
           ==================================================== */

        connectCore() {


            this.storage =
                window.HalDoStorageManager ||
                null;


            this.config =
                window.HalDoConfigManager ||
                null;


            this.kernel =
                window.HalDoKernel ||
                null;


            this.system =
                window.HalDoSystem ||
                null;


            return true;

        },


        /* ====================================================
           APPS REGISTRIEREN
           ==================================================== */

        registerDefinitions() {


            this.definitions.forEach(
                definition => {

                    this.register(
                        definition
                    );

                }
            );


            return true;

        },


        /* ====================================================
           APP REGISTRIEREN
           ==================================================== */

        register(
            definition
        ) {


            if (
                !definition ||
                typeof definition !==
                "object"
            ) {

                return false;

            }


            if (
                !definition.id
            ) {

                return false;

            }


            if (
                this.apps.has(
                    definition.id
                )
            ) {

                return false;

            }


            const app = {


                id:
                    definition.id,

                name:
                    definition.name ||
                    definition.id,

                category:
                    definition.category ||
                    "other",

                icon:
                    definition.icon ||
                    "▦",

                description:
                    definition.description ||
                    "",

                version:
                    definition.version ||
                    "18.0.0",

                enabled:
                    definition.enabled !== false,

                autoStart:
                    definition.autoStart === true,

                system:
                    definition.system === true,

                critical:
                    definition.critical === true,

                running:
                    false,

                status:
                    "READY",

                permissions:
                    Array.isArray(
                        definition.permissions
                    )
                        ? [
                            ...definition.permissions
                        ]
                        : [],

                dependencies:
                    Array.isArray(
                        definition.dependencies
                    )
                        ? [
                            ...definition.dependencies
                        ]
                        : [],

                instance:
                    definition.instance ||
                    null,

                registeredAt:
                    Date.now()

            };


            this.apps.set(
                app.id,
                app
            );


            this.emit(
                "app-registered",
                app
            );


            return true;

        },


        /* ====================================================
           APP ABRUFEN
           ==================================================== */

        get(
            id
        ) {


            return this.apps.get(
                id
            ) || null;

        },


        /* ====================================================
           APP PRÜFEN
           ==================================================== */

        has(
            id
        ) {


            return this.apps.has(
                id
            );

        },


        /* ====================================================
           APP STARTEN
           ==================================================== */

        async open(
            id
        ) {


            const app =
                this.get(
                    id
                );


            if (
                !app
            ) {

                this.log(
                    `App nicht gefunden: ${id}`
                );


                return false;

            }


            if (
                !app.enabled
            ) {

                this.log(
                    `App deaktiviert: ${id}`
                );


                return false;

            }


            if (
                app.running
            ) {

                this.touchRecent(
                    id
                );


                this.emit(
                    "app-focused",
                    app
                );


                return true;

            }


            /*
               Abhängigkeiten.
            */

            for (
                const dependency
                of app.dependencies
            ) {


                if (
                    !this.has(
                        dependency
                    )
                ) {

                    app.status =
                        "DEPENDENCY_ERROR";


                    this.emit(
                        "app-error",
                        {

                            app,

                            error:
                                `Fehlende Abhängigkeit: ${dependency}`

                        }
                    );


                    return false;

                }

            }


            app.status =
                "STARTING";


            this.emit(
                "app-opening",
                app
            );


            try {


                if (
                    app.instance &&
                    typeof app.instance.open ===
                    "function"
                ) {

                    await Promise.resolve(
                        app.instance.open(
                            app
                        )
                    );

                }


                app.running =
                    true;


                app.status =
                    "RUNNING";


                this.runningApps.add(
                    id
                );


                this.touchRecent(
                    id
                );


                this.emit(
                    "app-opened",
                    app
                );


                this.log(
                    `App geöffnet: ${app.name}`
                );


                return true;


            } catch (error) {


                app.status =
                    "ERROR";


                this.emit(
                    "app-error",
                    {

                        app,

                        error

                    }
                );


                this.handleError(
                    error,
                    `App open: ${id}`
                );


                return false;

            }

        },


        /* ====================================================
           APP SCHLIESSEN
           ==================================================== */

        async close(
            id
        ) {


            const app =
                this.get(
                    id
                );


            if (
                !app
            ) {

                return false;

            }


            if (
                !app.running
            ) {

                return true;

            }


            try {


                if (
                    app.instance &&
                    typeof app.instance.close ===
                    "function"
                ) {

                    await Promise.resolve(
                        app.instance.close(
                            app
                        )
                    );

                }


                app.running =
                    false;


                app.status =
                    "READY";


                this.runningApps.delete(
                    id
                );


                this.emit(
                    "app-closed",
                    app
                );


                return true;


            } catch (error) {


                app.status =
                    "ERROR";


                this.handleError(
                    error,
                    `App close: ${id}`
                );


                return false;

            }

        },


        /* ====================================================
           APP DEAKTIVIEREN
           ==================================================== */

        async disable(
            id
        ) {


            const app =
                this.get(
                    id
                );


            if (
                !app
            ) {

                return false;

            }


            if (
                app.critical
            ) {

                return false;

            }


            if (
                app.running
            ) {

                await this.close(
                    id
                );

            }


            app.enabled =
                false;


            app.status =
                "DISABLED";


            this.emit(
                "app-disabled",
                app
            );


            return true;

        },


        /* ====================================================
           APP AKTIVIEREN
           ==================================================== */

        enable(
            id
        ) {


            const app =
                this.get(
                    id
                );


            if (
                !app
            ) {

                return false;

            }


            app.enabled =
                true;


            app.status =
                "READY";


            this.emit(
                "app-enabled",
                app
            );


            return true;

        },


        /* ====================================================
           FAVORIT
           ==================================================== */

        setFavorite(
            id,
            favorite = true
        ) {


            if (
                !this.has(
                    id
                )
            ) {

                return false;

            }


            if (
                favorite
            ) {

                this.favoriteApps.add(
                    id
                );

            } else {

                this.favoriteApps.delete(
                    id
                );

            }


            this.saveUserState();


            this.emit(
                "favorite-changed",
                {

                    id,

                    favorite

                }
            );


            return true;

        },


        /* ====================================================
           FAVORIT PRÜFEN
           ==================================================== */

        isFavorite(
            id
        ) {


            return this.favoriteApps.has(
                id
            );

        },


        /* ====================================================
           RECENT
           ==================================================== */

        touchRecent(
            id
        ) {


            this.recentApps =
                this.recentApps.filter(
                    item =>
                        item !== id
                );


            this.recentApps.unshift(
                id
            );


            /*
               Maximal 20 zuletzt verwendete Apps.
            */

            if (
                this.recentApps.length >
                20
            ) {

                this.recentApps =
                    this.recentApps.slice(
                        0,
                        20
                    );

            }


            this.saveUserState();

        },


        /* ====================================================
           RECENT APPS
           ==================================================== */

        getRecent(
            limit = 10
        ) {


            return this.recentApps
                .slice(
                    0,
                    limit
                )
                .map(
                    id =>
                        this.get(
                            id
                        )
                )
                .filter(
                    Boolean
                );

        },


        /* ====================================================
           FAVORITEN
           ==================================================== */

        getFavorites() {


            return [
                ...this.favoriteApps
            ]
            .map(
                id =>
                    this.get(
                        id
                    )
            )
            .filter(
                Boolean
            );

        },


        /* ====================================================
           KATEGORIE
           ==================================================== */

        getByCategory(
            category
        ) {


            return [
                ...this.apps.values()
            ].filter(
                app =>
                    app.category ===
                    category
            );

        },


        /* ====================================================
           SUCHE
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


            return [
                ...this.apps.values()
            ].filter(
                app => {


                    return (

                        app.name
                            .toLowerCase()
                            .includes(
                                text
                            )

                        ||

                        app.id
                            .toLowerCase()
                            .includes(
                                text
                            )

                        ||

                        app.category
                            .toLowerCase()
                            .includes(
                                text
                            )

                        ||

                        app.description
                            .toLowerCase()
                            .includes(
                                text
                            )

                    );

                }
            );

        },


        /* ====================================================
           ALLE APPS
           ==================================================== */

        getAll() {


            return [
                ...this.apps.values()
            ];

        },


        /* ====================================================
           LAUFENDE APPS
           ==================================================== */

        getRunning() {


            return [
                ...this.runningApps
            ]
            .map(
                id =>
                    this.get(
                        id
                    )
            )
            .filter(
                Boolean
            );

        },


        /* ====================================================
           USER STATE LADEN
           ==================================================== */

        loadUserState() {


            if (
                !this.storage
            ) {

                return false;

            }


            try {


                const favorites =
                    this.storage.get(
                        "apps",
                        "favorites",
                        []
                    );


                const recent =
                    this.storage.get(
                        "apps",
                        "recent",
                        []
                    );


                if (
                    Array.isArray(
                        favorites
                    )
                ) {

                    this.favoriteApps =
                        new Set(
                            favorites.filter(
                                id =>
                                    this.has(
                                        id
                                    )
                            )
                        );

                }


                if (
                    Array.isArray(
                        recent
                    )
                ) {

                    this.recentApps =
                        recent.filter(
                            id =>
                                this.has(
                                    id
                                )
                        );

                }


                return true;


            } catch (error) {


                this.handleError(
                    error,
                    "loadUserState"
                );


                return false;

            }

        },


        /* ====================================================
           USER STATE SPEICHERN
           ==================================================== */

        saveUserState() {


            if (
                !this.storage
            ) {

                return false;

            }


            try {


                this.storage.set(
                    "apps",
                    "favorites",
                    [
                        ...this.favoriteApps
                    ]
                );


                this.storage.set(
                    "apps",
                    "recent",
                    [
                        ...this.recentApps
                    ]
                );


                return true;


            } catch (error) {


                this.handleError(
                    error,
                    "saveUserState"
                );


                return false;

            }

        },


        /* ====================================================
           STATUS
           ==================================================== */

        getStatus() {


            const all =
                this.getAll();


            return {

                name:
                    this.name,

                version:
                    this.version,

                status:
                    this.status,

                initialized:
                    this.initialized,

                totalApps:
                    all.length,

                enabledApps:
                    all.filter(
                        app =>
                            app.enabled
                    ).length,

                runningApps:
                    this.runningApps.size,

                favoriteApps:
                    this.favoriteApps.size,

                categories:
                    [
                        ...new Set(
                            all.map(
                                app =>
                                    app.category
                            )
                        )
                    ]

            };

        },


        /* ====================================================
           EVENTS
           ==================================================== */

        on(
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
                !this.listeners.has(
                    eventName
                )
            ) {

                this.listeners.set(
                    eventName,
                    []
                );

            }


            this.listeners
                .get(eventName)
                .push(
                    callback
                );


            return true;

        },


        /* ====================================================
           OFF
           ==================================================== */

        off(
            eventName,
            callback
        ) {


            const listeners =
                this.listeners.get(
                    eventName
                );


            if (
                !listeners
            ) {

                return false;

            }


            const index =
                listeners.indexOf(
                    callback
                );


            if (
                index === -1
            ) {

                return false;

            }


            listeners.splice(
                index,
                1
            );


            return true;

        },


        /* ====================================================
           EMIT
           ==================================================== */

        emit(
            eventName,
            data = null
        ) {


            const listeners =
                this.listeners.get(
                    eventName
                );


            if (
                !listeners
            ) {

                return;

            }


            listeners
                .slice()
                .forEach(
                    callback => {


                        try {

                            callback(
                                data
                            );

                        } catch (error) {

                            this.handleError(
                                error,
                                `Event: ${eventName}`
                            );

                        }

                    }
                );

        },


        /* ====================================================
           ERROR
           ==================================================== */

        handleError(
            error,
            source = "App Manager"
        ) {


            console.error(
                "[HalDo App Manager]",
                source,
                error
            );


            if (
                this.kernel &&
                typeof this.kernel.handleError ===
                "function"
            ) {

                this.kernel.handleError(
                    error,
                    source
                );

            }


            this.emit(
                "error",
                {

                    source,

                    error

                }
            );

        },


        /* ====================================================
           LOG
           ==================================================== */

        log(
            message,
            data = null
        ) {


            if (
                data !== null
            ) {

                console.log(
                    "[HalDo App Manager]",
                    message,
                    data
                );

            } else {

                console.log(
                    "[HalDo App Manager]",
                    message
                );

            }

        }

    };


    /* ========================================================
       GLOBAL API
       ======================================================== */

    window.HalDoAppManager =
        HalDoAppManager;


    if (
        !window.HalDo
    ) {

        window.HalDo = {};

    }


    window.HalDo.apps =
        HalDoAppManager;


    /* ========================================================
       INITIALISIERUNG
       ======================================================== */

    function initializeAppManager() {


        HalDoAppManager.connectCore();

        HalDoAppManager.initialize();


    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeAppManager,
            {
                once: true
            }
        );

    } else {

        initializeAppManager();

    }


    /* ========================================================
       CONSOLE
       ======================================================== */

    console.log(
        "=============================================="
    );

    console.log(
        "HalDo AI OS 18 App Manager"
    );

    console.log(
        "Professional Ultimate Foundation"
    );

    console.log(
        `${HalDoAppManager.definitions.length} Standard-Apps vorbereitet.`
    );

    console.log(
        "=============================================="
    );


})(window);