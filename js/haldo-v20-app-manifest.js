/*
 * ============================================================
 * HALDO AI OS 20
 * CENTRAL V20 APPLICATION MANIFEST
 * ============================================================
 *
 * Datei:
 *   js/haldo-v20-app-manifest.js
 *
 * Aufgabe:
 *   Zentrale Definition, Registrierung, Suche, Validierung
 *   und Systemintegration der HalDo V20 Anwendungen.
 *
 * WICHTIG:
 *   Dieses Manifest beschreibt Apps und deren Verbindungen.
 *   Die eigentliche App-Funktionalität wird durch Runtime,
 *   Registry, App-Manager, Bridges und App-Module bereitgestellt.
 *
 * ============================================================
 */

(function (window, document) {

    "use strict";


    /* ========================================================
       NAMESPACE FOUNDATION
    ======================================================== */

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};

    const HalDoV20 =
        window.HalDoV20 =
        window.HalDoV20 || {};


    /* ========================================================
       INTERNAL STORAGE
    ======================================================== */

    const apps = new Map();
    const categories = new Map();


    /* ========================================================
       MANIFEST OBJECT
    ======================================================== */

    const Manifest = {

        name:
            "HalDo V20 Central App Manifest",

        version:
            "20.0.0",

        ready:
            false,

        loadedAt:
            null
    };


    /* ========================================================
       HELPERS
    ======================================================== */

    function normalizeId(id) {

        return String(id || "")
            .trim()
            .toLowerCase();

    }


    function normalizeArray(value) {

        if (Array.isArray(value)) {
            return value.slice();
        }

        return [];
    }


    function normalizeObject(value) {

        if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
        ) {
            return Object.assign({}, value);
        }

        return {};
    }


    function normalizeWindowConfig(value) {

        const source =
            normalizeObject(value);

        return Object.assign({

            width:
                900,

            height:
                650,

            resizable:
                true,

            maximizable:
                true,

            minimizable:
                true

        }, source);

    }


    /* ========================================================
       APP FACTORY
    ======================================================== */

    function createApp(config) {

        const source =
            config &&
            typeof config === "object"
                ? config
                : {};

        return Object.assign({

            id:
                "",

            name:
                "",

            title:
                "",

            category:
                "system",

            version:
                Manifest.version,

            icon:
                "",

            description:
                "",

            status:
                "planned",

            entry:
                "",

            module:
                "",

            services:
                [],

            permissions:
                [],

            dependencies:
                [],

            connections:
                [],

            languages:
                true,

            searchable:
                true,

            window:
                normalizeWindowConfig(),

            settings:
                {},

            metadata:
                {}

        }, source, {

            services:
                normalizeArray(source.services),

            permissions:
                normalizeArray(source.permissions),

            dependencies:
                normalizeArray(source.dependencies),

            connections:
                normalizeArray(source.connections),

            window:
                normalizeWindowConfig(source.window),

            settings:
                normalizeObject(source.settings),

            metadata:
                normalizeObject(source.metadata)

        });

    }


    /* ========================================================
       CATEGORY INDEX MANAGEMENT
    ======================================================== */

    function removeFromCategoryIndex(id) {

        categories.forEach(
            function (ids, categoryName) {

                const filtered =
                    ids.filter(
                        function (entryId) {
                            return entryId !== id;
                        }
                    );

                if (filtered.length === 0) {

                    categories.delete(
                        categoryName
                    );

                } else {

                    categories.set(
                        categoryName,
                        filtered
                    );

                }

            }
        );

    }


    function addToCategoryIndex(app) {

        const categoryName =
            String(
                app.category || "other"
            )
                .trim()
                .toLowerCase();

        if (!categories.has(categoryName)) {

            categories.set(
                categoryName,
                []
            );

        }

        const ids =
            categories.get(categoryName);

        if (!ids.includes(app.id)) {

            ids.push(app.id);

        }

    }


    /* ========================================================
       REGISTER APP
    ======================================================== */

    function register(config) {

        if (
            !config ||
            typeof config !== "object" ||
            !config.id
        ) {
            return false;
        }

        const id =
            normalizeId(config.id);

        if (!id) {
            return false;
        }

        const app =
            createApp(
                Object.assign(
                    {},
                    config,
                    {
                        id:
                            id
                    }
                )
            );


        /*
         * Existing application:
         * remove old category index before update.
         */
        if (apps.has(id)) {

            removeFromCategoryIndex(
                id
            );

        }


        apps.set(
            id,
            app
        );


        addToCategoryIndex(
            app
        );


        return true;
    }


    /* ========================================================
       CATEGORY API
    ======================================================== */

    Manifest.category = function (
        id,
        title
    ) {

        const categoryId =
            normalizeId(id);

        if (!categoryId) {
            return null;
        }

        if (!categories.has(categoryId)) {

            categories.set(
                categoryId,
                []
            );

        }

        return {

            id:
                categoryId,

            title:
                title ||
                categoryId,

            appIds:
                categories
                    .get(categoryId)
                    .slice()

        };

    };


    /* ========================================================
       APP DEFINITIONS
    ======================================================== */

    const definitions = [

        /* ====================================================
           AI
        ==================================================== */

        {
            id: "ai",
            name: "AI",
            title: "HalDo AI",
            category: "artificial-intelligence",
            icon: "assets/icons/ai.png",
            description:
                "Zentrale intelligente HalDo-KI.",
            entry:
                "apps/ai/ai-app.js",
            module:
                "haldo-app-ai",
            services: [
                "ai",
                "language",
                "storage",
                "voice"
            ],
            permissions: [
                "ai",
                "storage",
                "microphone",
                "speech"
            ],
            connections: [
                "calendar",
                "navigation",
                "music",
                "video",
                "settings",
                "university",
                "health",
                "files"
            ]
        },

        {
            id: "ai-chat",
            name: "AI Chat",
            title: "HalDo AI Chat",
            category: "artificial-intelligence",
            icon: "assets/icons/ai-chat.png",
            description:
                "Unterhaltung und Assistenz mit HalDo AI.",
            entry:
                "apps/ai-chat/ai-chat-app.js",
            module:
                "haldo-app-ai-chat",
            services: [
                "ai",
                "language",
                "storage"
            ],
            permissions: [
                "ai",
                "storage"
            ],
            connections: [
                "ai",
                "translator",
                "calendar",
                "notes"
            ]
        },

        /* ====================================================
           SYSTEM
        ==================================================== */

        {
            id: "app-store",
            name: "App Store",
            title: "HalDo App Store",
            category: "system",
            icon: "assets/icons/app-store.png",
            description:
                "Verwaltung und Erweiterung des HalDo-App-Systems.",
            entry:
                "apps/app-store/app-store-app.js",
            module:
                "haldo-app-store",
            services: [
                "app-registry",
                "app-runtime",
                "storage",
                "network"
            ],
            permissions: [
                "network",
                "storage"
            ],
            connections: [
                "settings",
                "updates"
            ]
        },

        {
            id: "apps",
            name: "Apps",
            title: "Alle Apps",
            category: "system",
            icon: "assets/icons/apps.png",
            description:
                "Zentrale Übersicht aller HalDo-Anwendungen.",
            entry:
                "apps/apps/apps-app.js",
            module:
                "haldo-app-apps",
            services: [
                "app-registry",
                "app-runtime"
            ],
            permissions: [],
            connections: [
                "settings",
                "app-store"
            ]
        },

        {
            id: "archive",
            name: "Archive",
            title: "HalDo Archiv",
            category: "productivity",
            icon: "assets/icons/archive.png",
            description:
                "Archivierung und Wiederherstellung von Inhalten.",
            entry:
                "apps/archive/archive-app.js",
            module:
                "haldo-app-archive",
            services: [
                "storage"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "files",
                "notes"
            ]
        },

        {
            id: "backup",
            name: "Backup",
            title: "HalDo Backup",
            category: "system",
            icon: "assets/icons/backup.png",
            description:
                "Sicherung wichtiger HalDo-Daten.",
            entry:
                "apps/backup/backup-app.js",
            module:
                "haldo-app-backup",
            services: [
                "storage"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "settings",
                "files"
            ]
        },

        {
            id: "dashboard",
            name: "Dashboard",
            title: "HalDo Dashboard",
            category: "system",
            icon: "assets/icons/dashboard.png",
            description:
                "Zentrale persönliche Systemübersicht.",
            entry:
                "apps/dashboard/dashboard-app.js",
            module:
                "haldo-app-dashboard",
            services: [
                "system",
                "app-registry",
                "notifications",
                "weather",
                "calendar"
            ],
            permissions: [],
            connections: [
                "calendar",
                "weather",
                "navigation",
                "music",
                "cosmic"
            ]
        },

        {
            id: "help",
            name: "Help",
            title: "HalDo Hilfe",
            category: "system",
            icon: "assets/icons/help.png",
            description:
                "Hilfe, Dokumentation und Systemunterstützung.",
            entry:
                "apps/help/help-app.js",
            module:
                "haldo-app-help",
            services: [
                "ai",
                "language"
            ],
            permissions: [],
            connections: [
                "settings",
                "ai"
            ]
        },

        {
            id: "keyboard",
            name: "Keyboard",
            title: "Tastatur",
            category: "system",
            icon: "assets/icons/keyboard.png",
            description:
                "Systemtastatur einschließlich Êzîdî-Unterstützung.",
            entry:
                "apps/keyboard/keyboard-app.js",
            module:
                "haldo-app-keyboard",
            services: [
                "language",
                "ezidi-keyboard"
            ],
            permissions: [],
            connections: [
                "settings",
                "ai",
                "translator"
            ]
        },

        {
            id: "language",
            name: "Language",
            title: "Sprachen",
            category: "system",
            icon: "assets/icons/language.png",
            description:
                "Mehrsprachigkeit und Sprachverwaltung.",
            entry:
                "apps/language/language-app.js",
            module:
                "haldo-app-language",
            services: [
                "language-manager",
                "language-system",
                "storage"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "translator",
                "keyboard",
                "settings",
                "ai"
            ]
        },

        {
            id: "settings",
            name: "Settings",
            title: "Einstellungen",
            category: "system",
            icon: "assets/icons/settings.png",
            description:
                "Zentrale HalDo-Einstellungen.",
            entry:
                "apps/settings/settings-app.js",
            module:
                "haldo-app-settings",
            services: [
                "config",
                "storage",
                "language",
                "system"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "language",
                "privacy",
                "security",
                "cosmic"
            ]
        },

        /* ====================================================
           BROWSER / INTERNET
        ==================================================== */

        {
            id: "browser",
            name: "Browser",
            title: "HalDo Browser",
            category: "internet",
            icon: "assets/icons/browser.png",
            description:
                "Webzugriff innerhalb von HalDo.",
            entry:
                "apps/browser/browser-app.js",
            module:
                "haldo-app-browser",
            services: [
                "network",
                "storage",
                "ai"
            ],
            permissions: [
                "network",
                "storage"
            ],
            connections: [
                "ai",
                "translator",
                "downloads"
            ]
        },

        {
            id: "internet",
            name: "Internet",
            title: "Internet",
            category: "internet",
            icon: "assets/icons/internet.png",
            description:
                "Internet-Dienste und Netzwerkfunktionen.",
            entry:
                "apps/internet/internet-app.js",
            module:
                "haldo-app-internet",
            services: [
                "network"
            ],
            permissions: [
                "network"
            ],
            connections: [
                "browser",
                "downloads",
                "translator"
            ]
        },

        /* ====================================================
           CALCULATOR / CLOCK / CALENDAR
        ==================================================== */

        {
            id: "calculator",
            name: "Calculator",
            title: "Rechner",
            category: "utilities",
            icon: "assets/icons/calculator.png",
            description:
                "Wissenschaftlicher und alltäglicher Rechner.",
            entry:
                "apps/calculator/calculator-app.js",
            module:
                "haldo-app-calculator",
            services: [
                "ai"
            ],
            permissions: [],
            connections: [
                "ai",
                "calendar"
            ]
        },

        {
            id: "calendar",
            name: "Calendar",
            title: "Kalender",
            category: "productivity",
            icon: "assets/icons/calendar.png",
            description:
                "Kalender, Termine, Erinnerungen und Zeitplanung.",
            entry:
                "apps/calendar/calendar-app.js",
            module:
                "haldo-app-calendar",
            services: [
                "storage",
                "notifications",
                "language",
                "location"
            ],
            permissions: [
                "storage",
                "notifications",
                "calendar",
                "location"
            ],
            connections: [
                "navigation",
                "ai",
                "weather",
                "university",
                "health"
            ]
        },

        {
            id: "clock",
            name: "Clock",
            title: "Uhr",
            category: "utilities",
            icon: "assets/icons/clock.png",
            description:
                "Weltzeit, Wecker, Timer und Stoppuhr.",
            entry:
                "apps/clock/clock-app.js",
            module:
                "haldo-app-clock",
            services: [
                "notifications",
                "language"
            ],
            permissions: [
                "notifications"
            ],
            connections: [
                "calendar",
                "cosmic"
            ]
        },

        /* ====================================================
           FILES
        ==================================================== */

        {
            id: "files",
            name: "Files",
            title: "Dateien",
            category: "files",
            icon: "assets/icons/files.png",
            description:
                "Zentrale Datei- und Ordnerverwaltung.",
            entry:
                "apps/files/files-app.js",
            module:
                "haldo-app-files",
            services: [
                "storage"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "photos",
                "downloads",
                "backup",
                "archive"
            ]
        },

        {
            id: "downloads",
            name: "Downloads",
            title: "Downloads",
            category: "files",
            icon: "assets/icons/downloads.png",
            description:
                "Verwaltung heruntergeladener Dateien.",
            entry:
                "apps/downloads/downloads-app.js",
            module:
                "haldo-app-downloads",
            services: [
                "storage",
                "network"
            ],
            permissions: [
                "storage",
                "network"
            ],
            connections: [
                "browser",
                "files"
            ]
        },

        {
            id: "zip-manager",
            name: "ZIP Manager",
            title: "Archivmanager",
            category: "files",
            icon: "assets/icons/zip-manager.png",
            description:
                "Verwaltung komprimierter Archive.",
            entry:
                "apps/zip-manager/zip-manager-app.js",
            module:
                "haldo-app-zip-manager",
            services: [
                "storage"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "files",
                "downloads",
                "backup"
            ]
        },

        /* ====================================================
           MEDIA
        ==================================================== */

        {
            id: "camera",
            name: "Camera",
            title: "Kamera",
            category: "media",
            icon: "assets/icons/camera.png",
            description:
                "Foto- und Videoaufnahme.",
            entry:
                "apps/camera/camera-app.js",
            module:
                "haldo-app-camera",
            services: [
                "storage"
            ],
            permissions: [
                "camera",
                "microphone",
                "storage"
            ],
            connections: [
                "photos",
                "gallery",
                "video",
                "ai"
            ]
        },

        {
            id: "gallery",
            name: "Gallery",
            title: "Galerie",
            category: "media",
            icon: "assets/icons/gallery.png",
            description:
                "Fotos und visuelle Inhalte.",
            entry:
                "apps/gallery/gallery-app.js",
            module:
                "haldo-app-gallery",
            services: [
                "storage"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "camera",
                "photos",
                "video",
                "ai"
            ]
        },

        {
            id: "photos",
            name: "Photos",
            title: "Fotos",
            category: "media",
            icon: "assets/icons/photos.png",
            description:
                "Fotoverwaltung.",
            entry:
                "apps/photos/photos-app.js",
            module:
                "haldo-app-photos",
            services: [
                "storage",
                "ai"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "camera",
                "gallery",
                "files"
            ]
        },

        {
            id: "music",
            name: "Music",
            title: "Musik",
            category: "media",
            icon: "assets/icons/music.png",
            description:
                "Musikwiedergabe und persönliche Musikbibliothek.",
            entry:
                "apps/music/music-app.js",
            module:
                "haldo-app-music",
            services: [
                "storage",
                "voice",
                "ai"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "video",
                "song-creator",
                "ai",
                "cosmic"
            ]
        },

        {
            id: "song-creator",
            name: "Song Creator",
            title: "Song erstellen",
            category: "media",
            icon: "assets/icons/song-creator.png",
            description:
                "Kreatives Erstellen eigener Musik.",
            entry:
                "apps/song-creator/song-creator-app.js",
            module:
                "haldo-app-song-creator",
            services: [
                "ai",
                "storage",
                "voice"
            ],
            permissions: [
                "storage",
                "microphone"
            ],
            connections: [
                "music",
                "ai",
                "video"
            ]
        },

        {
            id: "video",
            name: "Video",
            title: "Video",
            category: "media",
            icon: "assets/icons/video.png",
            description:
                "Videowiedergabe und Videobibliothek.",
            entry:
                "apps/video/video-app.js",
            module:
                "haldo-app-video",
            services: [
                "storage",
                "ai"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "music",
                "camera",
                "photos",
                "song-creator"
            ]
        },

        {
            id: "youtube",
            name: "Video Center",
            title: "Video Center",
            category: "media",
            icon: "assets/icons/video-center.png",
            description:
                "Zentrale Verwaltung von Videoinhalten.",
            entry:
                "apps/video-center/video-center-app.js",
            module:
                "haldo-app-video-center",
            services: [
                "network",
                "storage"
            ],
            permissions: [
                "network",
                "storage"
            ],
            connections: [
                "video",
                "browser"
            ]
        },

        /* ====================================================
           NAVIGATION
        ==================================================== */

        {
            id: "maps",
            name: "Maps",
            title: "Karte",
            category: "navigation",
            icon: "assets/icons/maps.png",
            description:
                "Kartendarstellung und Ortsinformationen.",
            entry:
                "apps/maps/maps-app.js",
            module:
                "haldo-app-maps",
            services: [
                "location",
                "network",
                "storage"
            ],
            permissions: [
                "location",
                "network"
            ],
            connections: [
                "navigation",
                "weather",
                "calendar"
            ]
        },

        {
            id: "navigation",
            name: "Navigation",
            title: "Navigation",
            category: "navigation",
            icon: "assets/icons/navigation.png",
            description:
                "Routenplanung und Navigation.",
            entry:
                "apps/navigation/navigation-app.js",
            module:
                "haldo-app-navigation",
            services: [
                "location",
                "network",
                "voice",
                "storage"
            ],
            permissions: [
                "location",
                "network",
                "microphone"
            ],
            connections: [
                "maps",
                "calendar",
                "traffic",
                "driving-school",
                "weather"
            ]
        },

        {
            id: "traffic",
            name: "Traffic",
            title: "Verkehr",
            category: "navigation",
            icon: "assets/icons/traffic.png",
            description:
                "Verkehrsinformationen und Warnungen.",
            entry:
                "apps/traffic/traffic-app.js",
            module:
                "haldo-app-traffic",
            services: [
                "location",
                "network",
                "notifications"
            ],
            permissions: [
                "location",
                "network",
                "notifications"
            ],
            connections: [
                "navigation",
                "maps",
                "driving-school"
            ]
        },

        {
            id: "road-safety",
            name: "Road Safety",
            title: "Verkehrssicherheit",
            category: "navigation",
            icon: "assets/icons/road-safety.png",
            description:
                "Verkehrs- und Sicherheitsinformationen unter Berücksichtigung der jeweils geltenden lokalen Rechtslage.",
            entry:
                "apps/road-safety/road-safety-app.js",
            module:
                "haldo-app-road-safety",
            services: [
                "location",
                "network",
                "notifications",
                "language"
            ],
            permissions: [
                "location",
                "network",
                "notifications"
            ],
            connections: [
                "navigation",
                "traffic",
                "maps",
                "driving-school",
                "settings"
            ],
            metadata: {
                legalAwareness:
                    true,

                countryRules:
                    true,

                userResponsibility:
                    true
            }
        },

        {
            id: "driving-school",
            name: "Driving School",
            title: "Fahrschule",
            category: "education",
            icon: "assets/icons/driving-school.png",
            description:
                "Fahrtheorie, Lernmaterial und Prüfungsvorbereitung.",
            entry:
                "apps/driving-school/driving-school-app.js",
            module:
                "haldo-app-driving-school",
            services: [
                "ai",
                "storage",
                "language",
                "location"
            ],
            permissions: [
                "storage",
                "location"
            ],
            connections: [
                "navigation",
                "traffic",
                "maps",
                "road-safety",
                "calendar",
                "ai"
            ]
        },

        /* ====================================================
           WEATHER
        ==================================================== */

        {
            id: "weather",
            name: "Weather",
            title: "Wetter",
            category: "information",
            icon: "assets/icons/weather.png",
            description:
                "Wetterinformationen und Vorhersagen.",
            entry:
                "apps/weather/weather-app.js",
            module:
                "haldo-app-weather",
            services: [
                "network",
                "location",
                "storage"
            ],
            permissions: [
                "location",
                "network"
            ],
            connections: [
                "calendar",
                "navigation",
                "dashboard"
            ]
        },

        /* ====================================================
           EDUCATION
        ==================================================== */

        {
            id: "education",
            name: "Education",
            title: "HalDo Lernen",
            category: "education",
            icon: "assets/icons/education.png",
            description:
                "Lernplattform für verschiedene Wissensbereiche.",
            entry:
                "apps/education/education-app.js",
            module:
                "haldo-app-education",
            services: [
                "ai",
                "language",
                "storage"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "university",
                "translator",
                "notes",
                "ai"
            ]
        },

        {
            id: "learning",
            name: "Learning",
            title: "Lernzentrum",
            category: "education",
            icon: "assets/icons/learning.png",
            description:
                "Persönlicher Lernbereich.",
            entry:
                "apps/learning/learning-app.js",
            module:
                "haldo-app-learning",
            services: [
                "ai",
                "storage"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "education",
                "university",
                "notes"
            ]
        },

        {
            id: "university",
            name: "University",
            title: "Universität",
            category: "education",
            icon: "assets/icons/university.png",
            description:
                "Universitäre Organisation und Lernverwaltung.",
            entry:
                "apps/university/university-app.js",
            module:
                "haldo-app-university",
            services: [
                "calendar",
                "ai",
                "storage",
                "language"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "calendar",
                "navigation",
                "notes",
                "education",
                "translator"
            ]
        },

        /* ====================================================
           PRODUCTIVITY
        ==================================================== */

        {
            id: "notes",
            name: "Notes",
            title: "Notizen",
            category: "productivity",
            icon: "assets/icons/notes.png",
            description:
                "Notizen, Ideen und persönliche Dokumente.",
            entry:
                "apps/notes/notes-app.js",
            module:
                "haldo-app-notes",
            services: [
                "storage",
                "ai"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "ai",
                "calendar",
                "journal",
                "university"
            ]
        },

        {
            id: "journal",
            name: "Journal",
            title: "Journal",
            category: "productivity",
            icon: "assets/icons/journal.png",
            description:
                "Persönliches digitales Journal.",
            entry:
                "apps/journal/journal-app.js",
            module:
                "haldo-app-journal",
            services: [
                "storage",
                "ai"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "calendar",
                "notes",
                "ai"
            ]
        },

        {
            id: "reminders",
            name: "Reminders",
            title: "Erinnerungen",
            category: "productivity",
            icon: "assets/icons/reminders.png",
            description:
                "Erinnerungen und Aufgaben.",
            entry:
                "apps/reminders/reminders-app.js",
            module:
                "haldo-app-reminders",
            services: [
                "storage",
                "notifications"
            ],
            permissions: [
                "notifications",
                "storage"
            ],
            connections: [
                "calendar",
                "ai"
            ]
        },

        {
            id: "office",
            name: "Office",
            title: "HalDo Office",
            category: "productivity",
            icon: "assets/icons/office.png",
            description:
                "Dokumente, Tabellen und Arbeitswerkzeuge.",
            entry:
                "apps/office/office-app.js",
            module:
                "haldo-app-office",
            services: [
                "storage",
                "ai"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "files",
                "notes",
                "ai"
            ]
        },

        /* ====================================================
           HEALTH
        ==================================================== */

        {
            id: "health",
            name: "Health",
            title: "Gesundheit",
            category: "health",
            icon: "assets/icons/health.png",
            description:
                "Gesundheits- und Wellnessorganisation.",
            entry:
                "apps/health/health-app.js",
            module:
                "haldo-app-health",
            services: [
                "storage",
                "notifications",
                "ai"
            ],
            permissions: [
                "storage",
                "notifications"
            ],
            connections: [
                "calendar",
                "fitness",
                "ai"
            ]
        },

        {
            id: "fitness",
            name: "Fitness",
            title: "HalDo Fitness",
            category: "lifestyle",
            icon: "assets/icons/fitness.png",
            description:
                "Aktivitäts- und Trainingsverwaltung.",
            entry:
                "apps/fitness/fitness-app.js",
            module:
                "haldo-app-fitness",
            services: [
                "storage",
                "notifications"
            ],
            permissions: [
                "storage",
                "notifications"
            ],
            connections: [
                "health",
                "calendar",
                "ai"
            ]
        },

        /* ====================================================
           LANGUAGE
        ==================================================== */

        {
            id: "translator",
            name: "Translator",
            title: "Übersetzer",
            category: "language",
            icon: "assets/icons/translator.png",
            description:
                "Übersetzung zwischen unterstützten Sprachen.",
            entry:
                "apps/translator/translator-app.js",
            module:
                "haldo-app-translator",
            services: [
                "ai",
                "language",
                "voice"
            ],
            permissions: [
                "microphone"
            ],
            connections: [
                "ai",
                "browser",
                "keyboard",
                "university"
            ]
        },

        /* ====================================================
           SECURITY
        ==================================================== */

        {
            id: "security",
            name: "Security",
            title: "Sicherheit",
            category: "security",
            icon: "assets/icons/security.png",
            description:
                "Sicherheitsstatus und Schutzfunktionen.",
            entry:
                "apps/security/security-app.js",
            module:
                "haldo-app-security",
            services: [
                "system",
                "storage"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "privacy",
                "settings"
            ]
        },

        {
            id: "privacy",
            name: "Privacy",
            title: "Datenschutz",
            category: "security",
            icon: "assets/icons/privacy.png",
            description:
                "Datenschutz- und Berechtigungskontrolle.",
            entry:
                "apps/privacy/privacy-app.js",
            module:
                "haldo-app-privacy",
            services: [
                "system",
                "storage"
            ],
            permissions: [
                "storage"
            ],
            connections: [
                "settings",
                "security"
            ]
        },

        /* ====================================================
           QR / XCHANGE
        ==================================================== */

        {
            id: "qr-scanner",
            name: "QR Scanner",
            title: "QR Scanner",
            category: "utilities",
            icon: "assets/icons/qr-scanner.png",
            description:
                "QR- und Code-Erkennung.",
            entry:
                "apps/qr-scanner/qr-scanner-app.js",
            module:
                "haldo-app-qr-scanner",
            services: [
                "storage"
            ],
            permissions: [
                "camera"
            ],
            connections: [
                "browser",
                "contacts"
            ]
        },

        {
            id: "xchange",
            name: "Xchange",
            title: "Umrechner",
            category: "utilities",
            icon: "assets/icons/xchange.png",
            description:
                "Einheiten-, Währungs- und Zeitumrechnung.",
            entry:
                "apps/xchange/xchange-app.js",
            module:
                "haldo-app-xchange",
            services: [
                "network",
                "ai"
            ],
            permissions: [
                "network"
            ],
            connections: [
                "calculator",
                "ai"
            ]
        },

        /* ====================================================
           COSMIC SYSTEM
        ==================================================== */

        {
            id: "cosmic",
            name: "Cosmic World",
            title: "HalDo Cosmic World",
            category: "system",
            icon: "assets/logo/logo.png",
            description:
                "Lebendige kosmische HalDo-Welt mit Sonne, Sternen, Planeten, subtilen Zeitmustern und versteckten Ebenen.",
            entry:
                "js/haldo-cosmic-engine.js",
            module:
                "haldo-cosmic-engine",
            services: [
                "system",
                "storage",
                "config",
                "clock"
            ],
            permissions: [],
            connections: [
                "clock",
                "calendar",
                "settings",
                "dashboard"
            ],
            metadata: {
                hiddenMechanics:
                    true,

                cosmicClock:
                    true,

                livingWorld:
                    true
            }
        },

        {
            id: "cosmic-welcome",
            name: "Cosmic Welcome",
            title: "HalDo Cosmic Welcome",
            category: "system",
            icon: "assets/logo/logo.png",
            description:
                "Sanfter, heller und schwebender HalDo-Systemklang.",
            entry:
                "js/haldo-cosmic-welcome.js",
            module:
                "haldo-cosmic-welcome",
            services: [
                "storage",
                "config"
            ],
            permissions: [],
            connections: [
                "cosmic",
                "settings"
            ],
            metadata: {
                optional:
                    true,

                userControllable:
                    true,

                subtle:
                    true
            }
        }

    ];


    /* ========================================================
       REGISTER ALL DEFINITIONS
    ======================================================== */

    definitions.forEach(
        function (definition) {

            register(
                definition
            );

        }
    );


    /* ========================================================
       MANIFEST REGISTER API
    ======================================================== */

    Manifest.register =
        register;


    /* ========================================================
       GET
    ======================================================== */

    Manifest.get = function (id) {

        const normalizedId =
            normalizeId(id);

        if (!normalizedId) {
            return null;
        }

        return (
            apps.get(
                normalizedId
            ) || null
        );

    };


    /* ========================================================
       HAS
    ======================================================== */

    Manifest.has = function (id) {

        const normalizedId =
            normalizeId(id);

        if (!normalizedId) {
            return false;
        }

        return apps.has(
            normalizedId
        );

    };


    /* ========================================================
       GET ALL
    ======================================================== */

    Manifest.getAll = function () {

        return Array.from(
            apps.values()
        );

    };


    /* ========================================================
       GET IDS
    ======================================================== */

    Manifest.getIds = function () {

        return Array.from(
            apps.keys()
        );

    };


    /* ========================================================
       GET COUNT
    ======================================================== */

    Manifest.getCount = function () {

        return apps.size;

    };


    /* ========================================================
       GET BY CATEGORY
    ======================================================== */

    Manifest.getByCategory =
        function (name) {

            const categoryName =
                String(name || "")
                    .trim()
                    .toLowerCase();

            if (!categoryName) {
                return [];
            }

            const ids =
                categories.get(
                    categoryName
                ) || [];

            return ids
                .map(
                    function (id) {
                        return apps.get(id);
                    }
                )
                .filter(Boolean);

        };


    /* ========================================================
       GET CATEGORIES
    ======================================================== */

    Manifest.getCategories =
        function () {

            const result = {};

            categories.forEach(
                function (ids, name) {

                    result[name] =
                        ids.slice();

                }
            );

            return result;

        };


    /* ========================================================
       SEARCH
    ======================================================== */

    Manifest.search =
        function (query) {

            const q =
                String(query || "")
                    .trim()
                    .toLowerCase();

            if (!q) {
                return Manifest.getAll();
            }

            return Manifest
                .getAll()
                .filter(
                    function (app) {

                        return (

                            String(
                                app.id || ""
                            )
                                .toLowerCase()
                                .includes(q)

                            ||

                            String(
                                app.name || ""
                            )
                                .toLowerCase()
                                .includes(q)

                            ||

                            String(
                                app.title || ""
                            )
                                .toLowerCase()
                                .includes(q)

                            ||

                            String(
                                app.description || ""
                            )
                                .toLowerCase()
                                .includes(q)

                            ||

                            String(
                                app.category || ""
                            )
                                .toLowerCase()
                                .includes(q)

                        );

                    }
                );

        };


    /* ========================================================
       DEPENDENCIES
    ======================================================== */

    Manifest.getDependencies =
        function (id) {

            const app =
                Manifest.get(id);

            if (!app) {
                return [];
            }

            return normalizeArray(
                app.dependencies
            );

        };


    /* ========================================================
       CONNECTIONS
    ======================================================== */

    Manifest.getConnections =
        function (id) {

            const app =
                Manifest.get(id);

            if (!app) {
                return [];
            }

            return normalizeArray(
                app.connections
            );

        };


    /* ========================================================
       SERVICES
    ======================================================== */

    Manifest.getServices =
        function (id) {

            const app =
                Manifest.get(id);

            if (!app) {
                return [];
            }

            return normalizeArray(
                app.services
            );

        };


    /* ========================================================
       PERMISSIONS
    ======================================================== */

    Manifest.getPermissions =
        function (id) {

            const app =
                Manifest.get(id);

            if (!app) {
                return [];
            }

            return normalizeArray(
                app.permissions
            );

        };


    /* ========================================================
       ENTRY
    ======================================================== */

    Manifest.getEntry =
        function (id) {

            const app =
                Manifest.get(id);

            return app
                ? app.entry || ""
                : "";

        };


    /* ========================================================
       MODULE
    ======================================================== */

    Manifest.getModule =
        function (id) {

            const app =
                Manifest.get(id);

            return app
                ? app.module || ""
                : "";

        };


    /* ========================================================
       WINDOW CONFIG
    ======================================================== */

    Manifest.getWindowConfig =
        function (id) {

            const app =
                Manifest.get(id);

            if (!app) {
                return null;
            }

            return normalizeWindowConfig(
                app.window
            );

        };


    /* ========================================================
       VALIDATION
    ======================================================== */

    Manifest.validate =
        function () {

            const errors = [];
            const warnings = [];

            const seenIds =
                new Set();


            apps.forEach(
                function (app) {

                    if (!app.id) {

                        errors.push(
                            "App ohne ID"
                        );

                    }


                    if (seenIds.has(app.id)) {

                        errors.push(
                            "Doppelte App-ID: " +
                            app.id
                        );

                    }

                    seenIds.add(
                        app.id
                    );


                    if (!app.name) {

                        warnings.push(
                            "App ohne Namen: " +
                            app.id
                        );

                    }


                    if (!app.title) {

                        warnings.push(
                            "App ohne Titel: " +
                            app.id
                        );

                    }


                    if (!app.entry) {

                        warnings.push(
                            "App ohne Entry: " +
                            app.id
                        );

                    }


                    if (!app.module) {

                        warnings.push(
                            "App ohne Module: " +
                            app.id
                        );

                    }


                    if (
                        !Array.isArray(
                            app.services
                        )
                    ) {

                        errors.push(
                            "Ungültige Services: " +
                            app.id
                        );

                    }


                    if (
                        !Array.isArray(
                            app.connections
                        )
                    ) {

                        errors.push(
                            "Ungültige Connections: " +
                            app.id
                        );

                    }


                    if (
                        !Array.isArray(
                            app.permissions
                        )
                    ) {

                        errors.push(
                            "Ungültige Permissions: " +
                            app.id
                        );

                    }


                    if (
                        !Array.isArray(
                            app.dependencies
                        )
                    ) {

                        errors.push(
                            "Ungültige Dependencies: " +
                            app.id
                        );

                    }

                }
            );


            return {

                valid:
                    errors.length === 0,

                errors:
                    errors,

                warnings:
                    warnings,

                appCount:
                    apps.size

            };

        };


    /* ========================================================
       CONNECTION VALIDATION
    ======================================================== */

    Manifest.validateConnections =
        function () {

            const errors = [];
            const warnings = [];


            apps.forEach(
                function (app) {

                    const connections =
                        normalizeArray(
                            app.connections
                        );


                    connections.forEach(
                        function (targetId) {

                            const normalizedTarget =
                                normalizeId(
                                    targetId
                                );


                            if (
                                !normalizedTarget
                            ) {

                                warnings.push({

                                    app:
                                        app.id,

                                    missing:
                                        targetId,

                                    reason:
                                        "Leere Verbindungs-ID"

                                });

                                return;
                            }


                            if (
                                !apps.has(
                                    normalizedTarget
                                )
                            ) {

                                warnings.push({

                                    app:
                                        app.id,

                                    missing:
                                        targetId,

                                    reason:
                                        "Ziel-App ist im Manifest nicht registriert"

                                });

                            }

                        }
                    );

                }
            );


            return {

                valid:
                    errors.length === 0,

                errors:
                    errors,

                warnings:
                    warnings

            };

        };


    /* ========================================================
       FULL DIAGNOSTIC
    ======================================================== */

    Manifest.diagnose =
        function () {

            const manifest =
                Manifest.validate();

            const connections =
                Manifest.validateConnections();

            return {

                valid:
                    manifest.valid &&
                    connections.valid,

                manifest:
                    manifest,

                connections:
                    connections,

                status:
                    Manifest.getStatus()

            };

        };


    /* ========================================================
       STATUS
    ======================================================== */

    Manifest.getStatus =
        function () {

            return {

                name:
                    Manifest.name,

                version:
                    Manifest.version,

                ready:
                    Manifest.ready,

                appCount:
                    apps.size,

                categoryCount:
                    categories.size,

                timestamp:
                    Date.now(),

                loadedAt:
                    Manifest.loadedAt

            };

        };


    /* ========================================================
       GLOBAL API REGISTRATION
    ======================================================== */

    Manifest.ready =
        true;

    Manifest.loadedAt =
        Date.now();


    window.HalDoV20AppManifest =
        Manifest;


    HalDoV20.appManifest =
        Manifest;


    HalDoOS.appManifest =
        Manifest;


    /* ========================================================
       HALDO KERNEL INTEGRATION
    ======================================================== */

    try {

        const kernel =
            window.HalDoKernel ||
            (
                HalDoOS &&
                HalDoOS.kernel
            );


        if (
            kernel &&
            typeof kernel.setModuleReady ===
                "function"
        ) {

            kernel.setModuleReady(
                "haldo-v20-app-manifest",
                Manifest
            );

        }


        if (
            kernel &&
            typeof kernel.emit ===
                "function"
        ) {

            kernel.emit(
                "v20:app-manifest:ready",
                Manifest.getStatus()
            );

        }

    } catch (error) {

        console.warn(
            "[HalDo V20 Manifest] Kernel integration warning:",
            error
        );

    }


    /* ========================================================
       DIAGNOSTICS
    ======================================================== */

    let diagnosticResult =
        null;

    try {

        diagnosticResult =
            Manifest.diagnose();


        if (
            diagnosticResult.valid
        ) {

            console.info(
                "[HalDo V20 Manifest] READY",
                Manifest.getStatus()
            );

        } else {

            console.warn(
                "[HalDo V20 Manifest] Validation warnings:",
                diagnosticResult
            );

        }

    } catch (error) {

        console.warn(
            "[HalDo V20 Manifest] Diagnostic failure:",
            error
        );

    }


    /* ========================================================
       DOM EVENT
    ======================================================== */

    try {

        window.dispatchEvent(
            new CustomEvent(
                "haldo:v20:app-manifest-ready",
                {
                    detail: {

                        manifest:
                            Manifest,

                        status:
                            Manifest.getStatus(),

                        diagnostics:
                            diagnosticResult

                    }
                }
            )
        );

    } catch (error) {

        console.warn(
            "[HalDo V20 Manifest] DOM event warning:",
            error
        );

    }


    /* ========================================================
       FINAL LOG
    ======================================================== */

    console.info(
        "[HalDo AI OS 20]",
        "Central V20 App Manifest loaded.",
        "Apps:",
        Manifest.getCount(),
        "Categories:",
        Object.keys(
            Manifest.getCategories()
        ).length
    );


})(window, document);
