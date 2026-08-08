/*
============================================================
 HALDO AI OS 18
 APP REGISTRY
 Professional Ultimate Foundation
============================================================

 Datei:
 js/app-registry.js

 Aufgabe:
 - zentrale App-Registry
 - zusätzliche HalDo-System-Apps
 - App-Kategorien
 - App-Metadaten
 - Vorbereitung für echte App-Module
 - Verbindung mit HalDoAppManager
============================================================
*/

"use strict";


(function (window) {


    /* ========================================================
       REGISTRY
       ======================================================== */

    const HalDoAppRegistry = {


        name:
            "HalDo App Registry",

        version:
            "18.0.0",

        initialized:
            false,

        manager:
            null,

        definitions: [],


        /* ====================================================
           APP-DEFINITION ERSTELLEN
           ==================================================== */

        create(
            id,
            name,
            category,
            icon,
            description,
            options = {}
        ) {


            return {

                id,

                name,

                category,

                icon,

                description,

                enabled:
                    options.enabled !== false,

                autoStart:
                    options.autoStart === true,

                system:
                    options.system === true,

                critical:
                    options.critical === true,

                version:
                    options.version ||
                    "18.0.0",

                permissions:
                    Array.isArray(
                        options.permissions
                    )
                        ? options.permissions
                        : [],

                dependencies:
                    Array.isArray(
                        options.dependencies
                    )
                        ? options.dependencies
                        : []

            };

        },


        /* ====================================================
           REGISTRY AUFBAUEN
           ==================================================== */

        build() {


            this.definitions = [


                /*
                ================================================
                AI
                ================================================
                */

                this.create(
                    "ai-assistant",
                    "AI Assistent",
                    "ai",
                    "assets/logo/logo.png",
                    "Zentrale intelligente Assistenz.",
                    {
                        system: true
                    }
                ),

                this.create(
                    "ai-image",
                    "AI Bilder",
                    "ai",
                    "🖼️",
                    "AI-Bildfunktionen."
                ),

                this.create(
                    "ai-writing",
                    "AI Schreiben",
                    "ai",
                    "✍️",
                    "Schreiben, Bearbeiten und Erstellen mit AI."
                ),

                this.create(
                    "ai-code",
                    "AI Code",
                    "ai",
                    "💻",
                    "Unterstützung beim Programmieren."
                ),

                this.create(
                    "ai-translate",
                    "AI Übersetzung",
                    "ai",
                    "🌐",
                    "Intelligente Übersetzungsfunktionen."
                ),

                this.create(
                    "ai-search",
                    "AI Suche",
                    "ai",
                    "🔎",
                    "Intelligente Suche und Informationsverarbeitung."
                ),


                /*
                ================================================
                HOME / SYSTEM
                ================================================
                */

                this.create(
                    "home",
                    "Startseite",
                    "system",
                    "assets/logo/logo.png",
                    "Zentrale HalDo AI OS Startseite.",
                    {
                        system: true,
                        critical: true
                    }
                ),

                this.create(
                    "control-center",
                    "Kontrollzentrum",
                    "system",
                    "🎛️",
                    "Schnellzugriff auf wichtige Systemeinstellungen.",
                    {
                        system: true
                    }
                ),

                this.create(
                    "app-center",
                    "App Center",
                    "system",
                    "▦",
                    "Zentrale Verwaltung aller Apps.",
                    {
                        system: true
                    }
                ),

                this.create(
                    "startup",
                    "Systemstart",
                    "system",
                    "🚀",
                    "Informationen und Steuerung des Systemstarts.",
                    {
                        system: true
                    }
                ),


                /*
                ================================================
                DATEIEN
                ================================================
                */

                this.create(
                    "downloads",
                    "Downloads",
                    "files",
                    "⬇️",
                    "Heruntergeladene Dateien."
                ),

                this.create(
                    "recent-files",
                    "Zuletzt verwendete Dateien",
                    "files",
                    "🕘",
                    "Schneller Zugriff auf zuletzt verwendete Dateien."
                ),

                this.create(
                    "favorites-files",
                    "Datei-Favoriten",
                    "files",
                    "⭐",
                    "Favorisierte Dateien und Ordner."
                ),


                /*
                ================================================
                OFFICE
                ================================================
                */

                this.create(
                    "text-editor",
                    "Texteditor",
                    "office",
                    "📄",
                    "Texte erstellen und bearbeiten."
                ),

                this.create(
                    "spreadsheet",
                    "Tabellen",
                    "office",
                    "📊",
                    "Tabellen und Daten bearbeiten."
                ),

                this.create(
                    "presentation",
                    "Präsentationen",
                    "office",
                    "📽️",
                    "Präsentationen erstellen."
                ),

                this.create(
                    "pdf-reader",
                    "PDF Reader",
                    "office",
                    "📕",
                    "PDF-Dokumente anzeigen."
                ),


                /*
                ================================================
                KOMMUNIKATION
                ================================================
                */

                this.create(
                    "calls",
                    "Anrufe",
                    "communication",
                    "📞",
                    "Anruf-Funktionen."
                ),

                this.create(
                    "video-calls",
                    "Videoanrufe",
                    "communication",
                    "📹",
                    "Video-Kommunikation."
                ),

                this.create(
                    "chat-groups",
                    "Gruppen",
                    "communication",
                    "👥",
                    "Kommunikationsgruppen."
                ),


                /*
                ================================================
                INTERNET
                ================================================
                */

                this.create(
                    "bookmarks",
                    "Lesezeichen",
                    "internet",
                    "🔖",
                    "Gespeicherte Webseiten."
                ),

                this.create(
                    "history",
                    "Verlauf",
                    "internet",
                    "🕘",
                    "Browser-Verlauf."
                ),

                this.create(
                    "password-manager",
                    "Passwortverwaltung",
                    "security",
                    "🔐",
                    "Lokale Verwaltung von Zugangsdaten."
                ),


                /*
                ================================================
                MULTIMEDIA
                ================================================
                */

                this.create(
                    "gallery",
                    "Galerie",
                    "media",
                    "🖼️",
                    "Bildergalerie."
                ),

                this.create(
                    "audio-recorder",
                    "Audiorekorder",
                    "media",
                    "🎙️",
                    "Audioaufnahmen."
                ),

                this.create(
                    "video-recorder",
                    "Videorekorder",
                    "media",
                    "🎥",
                    "Videoaufnahmen."
                ),

                this.create(
                    "media-player",
                    "Media Player",
                    "media",
                    "▶️",
                    "Zentrale Medienwiedergabe."
                ),


                /*
                ================================================
                ORGANISATION
                ================================================
                */

                this.create(
                    "todo",
                    "Aufgaben",
                    "productivity",
                    "☑️",
                    "Aufgaben verwalten."
                ),

                this.create(
                    "habits",
                    "Gewohnheiten",
                    "productivity",
                    "📈",
                    "Persönliche Routinen verwalten."
                ),

                this.create(
                    "stopwatch",
                    "Stoppuhr",
                    "productivity",
                    "⏱️",
                    "Stoppuhr."
                ),

                this.create(
                    "timer",
                    "Timer",
                    "productivity",
                    "⏲️",
                    "Timer."
                ),


                /*
                ================================================
                SPRACHE
                ================================================
                */

                this.create(
                    "speech-to-text",
                    "Sprache zu Text",
                    "language",
                    "🎙️",
                    "Gesprochene Sprache in Text umwandeln."
                ),

                this.create(
                    "text-to-speech",
                    "Text zu Sprache",
                    "language",
                    "🔊",
                    "Text vorlesen lassen."
                ),

                this.create(
                    "language-center",
                    "Sprachzentrum",
                    "language",
                    "🌍",
                    "Sprach- und Übersetzungsfunktionen."
                ),


                /*
                ================================================
                ÊZÎDÎ
                ================================================
                */

                this.create(
                    "ezidi-language",
                    "Êzîdî Sprache",
                    "ezidi",
                    "𐺀",
                    "Vorbereitung für Êzîdî-Sprachfunktionen."
                ),

                this.create(
                    "ezidi-dictionary",
                    "Êzîdî Wörterbuch",
                    "ezidi",
                    "📖",
                    "Êzîdî-Wörterbuch."
                ),

                this.create(
                    "ezidi-input",
                    "Êzîdî Eingabe",
                    "ezidi",
                    "⌨️",
                    "Spezielle Êzîdî-Eingabe."
                ),


                /*
                ================================================
                SICHERHEIT
                ================================================
                */

                this.create(
                    "permissions",
                    "Berechtigungen",
                    "security",
                    "🔑",
                    "App-Berechtigungen verwalten."
                ),

                this.create(
                    "security-center",
                    "Security Center",
                    "security",
                    "🛡️",
                    "Zentrale Sicherheitsfunktionen.",
                    {
                        system: true
                    }
                ),


                /*
                ================================================
                BACKUP
                ================================================
                */

                this.create(
                    "backup",
                    "Backup",
                    "system",
                    "💾",
                    "Lokale Sicherungen."
                ),

                this.create(
                    "restore",
                    "Wiederherstellung",
                    "system",
                    "♻️",
                    "Wiederherstellung von Systemdaten."
                ),


                /*
                ================================================
                ENTWICKLER
                ================================================
                */

                this.create(
                    "console",
                    "Konsole",
                    "developer",
                    "⌘",
                    "Entwicklerkonsole."
                ),

                this.create(
                    "module-center",
                    "Module",
                    "developer",
                    "🧩",
                    "Verwaltung von Systemmodulen."
                ),

                this.create(
                    "app-developer",
                    "App Entwickler",
                    "developer",
                    "🧑‍💻",
                    "Vorbereitung für eigene HalDo-Apps."
                )

            ];


            return this.definitions;

        },


        /* ====================================================
           REGISTRIEREN
           ==================================================== */

        registerAll() {


            this.manager =
                window.HalDoAppManager ||
                null;


            if (
                !this.manager
            ) {

                console.warn(
                    "[HalDo App Registry] App Manager noch nicht verfügbar."
                );


                return false;

            }


            let registered =
                0;


            this.definitions.forEach(
                definition => {


                    if (
                        this.manager.has(
                            definition.id
                        )
                    ) {

                        return;

                    }


                    if (
                        this.manager.register(
                            definition
                        )
                    ) {

                        registered++;

                    }

                }
            );


            console.log(
                `[HalDo App Registry] ${registered} zusätzliche Apps registriert.`
            );


            return true;

        },


        /* ====================================================
           NACH KATEGORIE
           ==================================================== */

        getCategory(
            category
        ) {


            return this.definitions.filter(
                app =>
                    app.category ===
                    category
            );

        },


        /* ====================================================
           ALLE
           ==================================================== */

        getAll() {


            return [
                ...this.definitions
            ];

        },


        /* ====================================================
           APP SUCHEN
           ==================================================== */

        find(
            id
        ) {


            return this.definitions.find(
                app =>
                    app.id ===
                    id
            ) || null;

        },


        /* ====================================================
           INITIALISIERUNG
           ==================================================== */

        initialize() {


            if (
                this.initialized
            ) {

                return true;

            }


            this.build();


            /*
               App Manager kann durch
               DOM-Reihenfolge später verfügbar sein.
            */

            const attempt =
                () => {


                    if (
                        window.HalDoAppManager
                    ) {

                        this.registerAll();

                        this.initialized =
                            true;

                        console.log(
                            "[HalDo App Registry] Bereit."
                        );

                        return true;

                    }


                    return false;

                };


            if (
                !attempt()
            ) {

                window.addEventListener(
                    "haldo:app-manager-ready",
                    attempt,
                    {
                        once: true
                    }
                );

            }


            return true;

        }

    };


    /* ========================================================
       GLOBAL
       ======================================================== */

    window.HalDoAppRegistry =
        HalDoAppRegistry;


    if (
        !window.HalDo
    ) {

        window.HalDo = {};

    }


    window.HalDo.appRegistry =
        HalDoAppRegistry;


    /* ========================================================
       START
       ======================================================== */

    function start() {

        HalDoAppRegistry.initialize();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start,
            {
                once: true
            }
        );

    } else {

        start();

    }


    console.log(
        "=============================================="
    );

    console.log(
        "HalDo AI OS 18 App Registry"
    );

    console.log(
        "Zusätzliche Apps vorbereitet."
    );

    console.log(
        "=============================================="
    );


})(window);