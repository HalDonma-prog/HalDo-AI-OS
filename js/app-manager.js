/* ============================================================
   HalDo AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei: js/app-manager.js

   Aufgabe:
   - Zentrale App-Verwaltung
   - App-Registry
   - Apps laden
   - Apps registrieren
   - Apps suchen
   - Kategorien verwalten
   - Favoriten verwalten
   - Apps starten
   - App-Zustände speichern
   - Verbindung mit HalDoKernel
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — GRUNDKONFIGURATION
       ======================================================== */

    const VERSION = "18.0.0";

    const STORAGE_KEY =
        "haldo_ai_os18_apps_state";


    const APP_CONFIG_PATH =
        "config/apps.json";


    /* ========================================================
       02 — INTERNER ZUSTAND
       ======================================================== */

    const state = {

        initialized: false,

        ready: false,

        loading: false,

        error: null,

        apps: [],

        categories: [],

        favorites: [],

        activeCategory: "all",

        searchTerm: "",

        configLoaded: false,

        lastOpenedApp: null

    };


    /* ========================================================
       03 — HILFSFUNKTIONEN
       ======================================================== */

    function log(
        message,
        type = "info"
    ) {

        const prefix =
            "[HalDo App Manager]";


        if (
            type === "error"
        ) {

            console.error(
                prefix,
                message
            );

        }
        else if (
            type === "warning"
        ) {

            console.warn(
                prefix,
                message
            );

        }
        else {

            console.log(
                prefix,
                message
            );

        }


        /*
         * Zusätzlich Kernel-Log verwenden,
         * wenn der Kernel vorhanden ist.
         */

        if (
            window.HalDoKernel &&
            typeof
                window.HalDoKernel.emit ===
                "function"
        ) {

            window.HalDoKernel.emit(
                "appmanager:log",
                {
                    message,
                    type
                }
            );

        }

    }


    function setStartupStatus(
        message
    ) {

        if (
            window.HalDoStartup &&
            typeof
                window.HalDoStartup.setStatus ===
                "function"
        ) {

            window.HalDoStartup.setStatus(
                message
            );

        }

    }


    function createId(
        value
    ) {

        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(
                /[^a-z0-9äöüß_-]+/gi,
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


    function normalizeApp(
        app,
        index
    ) {

        if (
            !app ||
            typeof app !==
            "object"
        ) {

            return null;

        }


        const name =
            app.name ||
            app.title ||
            `App ${index + 1}`;


        const id =
            app.id ||
            createId(name) ||
            `app-${index + 1}`;


        const category =
            app.category ||
            "other";


        return {

            id,

            name,

            title:
                app.title ||
                name,

            description:
                app.description ||
                "",

            category,

            icon:
                app.icon ||
                "",

            path:
                app.path ||
                app.url ||
                "",

            url:
                app.url ||
                app.path ||
                "",

            type:
                app.type ||
                "internal",

            enabled:
                app.enabled !== false,

            visible:
                app.visible !== false,

            system:
                app.system === true,

            featured:
                app.featured === true,

            favorite:
                app.favorite === true,

            order:
                Number.isFinite(
                    Number(app.order)
                )
                    ? Number(app.order)
                    : index,

            keywords:
                Array.isArray(
                    app.keywords
                )
                    ? app.keywords
                    : [],

            permissions:
                Array.isArray(
                    app.permissions
                )
                    ? app.permissions
                    : [],

            metadata:
                app.metadata &&
                typeof app.metadata === "object"
                    ? app.metadata
                    : {}

        };

    }


    /* ========================================================
       04 — STORAGE
       ======================================================== */

    function loadSavedState() {

        try {

            const kernel =
                window.HalDoKernel;


            if (
                kernel &&
                kernel.storage
            ) {

                const saved =
                    kernel.storage.get(
                        STORAGE_KEY,
                        null
                    );


                if (
                    saved &&
                    typeof saved ===
                    "object"
                ) {

                    state.favorites =
                        Array.isArray(
                            saved.favorites
                        )
                            ? saved.favorites
                            : [];

                    state.lastOpenedApp =
                        saved.lastOpenedApp ||
                        null;

                    log(
                        "Gespeicherter App-Zustand geladen."
                    );

                    return;

                }

            }


            /*
             * Fallback
             */

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (!raw) {

                return;

            }


            const saved =
                JSON.parse(raw);


            state.favorites =
                Array.isArray(
                    saved.favorites
                )
                    ? saved.favorites
                    : [];


            state.lastOpenedApp =
                saved.lastOpenedApp ||
                null;

        }
        catch (error) {

            log(
                "Gespeicherter App-Zustand konnte nicht geladen werden.",
                "warning"
            );

        }

    }


    function saveState() {

        const data = {

            favorites:
                state.favorites,

            lastOpenedApp:
                state.lastOpenedApp

        };


        try {

            if (
                window.HalDoKernel &&
                window.HalDoKernel.storage
            ) {

                window.HalDoKernel.storage.set(
                    STORAGE_KEY,
                    data
                );

                return true;

            }


            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(data)
            );


            return true;

        }
        catch (error) {

            log(
                "App-Zustand konnte nicht gespeichert werden.",
                "warning"
            );


            return false;

        }

    }


    /* ========================================================
       05 — APP REGISTRATION
       ======================================================== */

    function registerApp(
        app
    ) {

        const normalized =
            normalizeApp(
                app,
                state.apps.length
            );


        if (!normalized) {

            return null;

        }


        const existingIndex =
            state.apps.findIndex(
                item =>
                    item.id ===
                    normalized.id
            );


        if (
            existingIndex >= 0
        ) {

            state.apps[
                existingIndex
            ] = normalized;

        }
        else {

            state.apps.push(
                normalized
            );

        }


        /*
         * Gespeicherte Favoriten anwenden.
         */

        if (
            state.favorites.includes(
                normalized.id
            )
        ) {

            normalized.favorite =
                true;

        }


        return normalized;

    }


    function registerApps(
        apps
    ) {

        if (
            !Array.isArray(apps)
        ) {

            return 0;

        }


        let count = 0;


        apps.forEach(
            app => {

                if (
                    registerApp(app)
                ) {

                    count++;

                }

            }
        );


        sortApps();

        rebuildCategories();


        emit(
            "apps:registered",
            {
                count
            }
        );


        return count;

    }


    function unregisterApp(
        appId
    ) {

        const index =
            state.apps.findIndex(
                app =>
                    app.id ===
                    appId
            );


        if (
            index < 0
        ) {

            return false;

        }


        state.apps.splice(
            index,
            1
        );


        state.favorites =
            state.favorites.filter(
                id =>
                    id !== appId
            );


        saveState();

        rebuildCategories();


        emit(
            "app:unregistered",
            {
                appId
            }
        );


        return true;

    }


    /* ========================================================
       06 — SORTIERUNG
       ======================================================== */

    function sortApps() {

        state.apps.sort(
            (
                a,
                b
            ) => {

                /*
                 * Featured zuerst.
                 */

                if (
                    a.featured !==
                    b.featured
                ) {

                    return a.featured
                        ? -1
                        : 1;

                }


                /*
                 * Danach Reihenfolge.
                 */

                if (
                    a.order !==
                    b.order
                ) {

                    return a.order -
                        b.order;

                }


                /*
                 * Danach Name.
                 */

                return a.name.localeCompare(
                    b.name,
                    "de"
                );

            }
        );

    }


    /* ========================================================
       07 — KATEGORIEN
       ======================================================== */

    function rebuildCategories() {

        const map =
            new Map();


        state.apps.forEach(
            app => {

                if (
                    !app.visible
                ) {

                    return;

                }


                if (
                    !map.has(
                        app.category
                    )
                ) {

                    map.set(
                        app.category,
                        0
                    );

                }


                map.set(
                    app.category,
                    map.get(
                        app.category
                    ) + 1
                );

            }
        );


        state.categories = [

            {
                id: "all",
                name: "Alle",
                count:
                    state.apps.filter(
                        app =>
                            app.visible
                    ).length
            },

            {
                id: "favorites",
                name: "Favoriten",
                count:
                    state.apps.filter(
                        app =>
                            app.favorite
                    ).length
            }

        ];


        map.forEach(
            (
                count,
                id
            ) => {

                state.categories.push({

                    id,

                    name:
                        getCategoryName(
                            id
                        ),

                    count

                });

            }
        );


        emit(
            "categories:updated",
            state.categories
        );

    }


    function getCategoryName(
        id
    ) {

        const names = {

            ai:
                "KI & Assistenten",

            communication:
                "Kommunikation",

            productivity:
                "Produktivität",

            media:
                "Medien",

            creative:
                "Kreativ",

            education:
                "Bildung",

            development:
                "Entwicklung",

            system:
                "System",

            security:
                "Sicherheit",

            internet:
                "Internet",

            files:
                "Dateien",

            tools:
                "Werkzeuge",

            games:
                "Spiele",

            health:
                "Gesundheit",

            business:
                "Business",

            settings:
                "Einstellungen",

            other:
                "Weitere Apps"

        };


        return (
            names[id] ||
            id
        );

    }


    /* ========================================================
       08 — APP ABFRAGEN
       ======================================================== */

    function getAllApps() {

        return [
            ...state.apps
        ];

    }


    function getApp(
        appId
    ) {

        return (
            state.apps.find(
                app =>
                    app.id ===
                    appId
            ) ||
            null
        );

    }


    function getVisibleApps() {

        return state.apps.filter(
            app =>
                app.visible &&
                app.enabled
        );

    }


    function getAppsByCategory(
        category
    ) {

        if (
            category ===
            "all"
        ) {

            return getVisibleApps();

        }


        if (
            category ===
            "favorites"
        ) {

            return getVisibleApps()
                .filter(
                    app =>
                        app.favorite
                );

        }


        return getVisibleApps()
            .filter(
                app =>
                    app.category ===
                    category
            );

    }


    /* ========================================================
       09 — APP SUCHE
       ======================================================== */

    function searchApps(
        term
    ) {

        const search =
            String(
                term || ""
            )
            .trim()
            .toLowerCase();


        if (!search) {

            return getVisibleApps();

        }


        return getVisibleApps()
            .filter(
                app => {

                    const haystack = [

                        app.name,

                        app.title,

                        app.description,

                        app.category,

                        ...app.keywords

                    ]
                    .join(" ")
                    .toLowerCase();


                    return haystack.includes(
                        search
                    );

                }
            );

    }


    /* ========================================================
       10 — FAVORITEN
       ======================================================== */

    function setFavorite(
        appId,
        value = true
    ) {

        const app =
            getApp(appId);


        if (!app) {

            return false;

        }


        app.favorite =
            Boolean(value);


        if (
            app.favorite
        ) {

            if (
                !state.favorites.includes(
                    appId
                )
            ) {

                state.favorites.push(
                    appId
                );

            }

        }
        else {

            state.favorites =
                state.favorites.filter(
                    id =>
                        id !== appId
                );

        }


        saveState();

        rebuildCategories();


        emit(
            "app:favorite",
            {
                app,
                favorite:
                    app.favorite
            }
        );


        return true;

    }


    function toggleFavorite(
        appId
    ) {

        const app =
            getApp(appId);


        if (!app) {

            return false;

        }


        return setFavorite(
            appId,
            !app.favorite
        );

    }


    function getFavorites() {

        return getVisibleApps()
            .filter(
                app =>
                    app.favorite
            );

    }


    /* ========================================================
       11 — APP STARTEN
       ======================================================== */

    function openApp(
        appId
    ) {

        const app =
            getApp(appId);


        if (!app) {

            log(
                `App nicht gefunden: ${appId}`,
                "warning"
            );


            return false;

        }


        if (
            app.enabled === false
        ) {

            log(
                `App deaktiviert: ${app.name}`,
                "warning"
            );


            return false;

        }


        state.lastOpenedApp =
            app.id;


        saveState();


        emit(
            "app:opening",
            {
                app
            }
        );


        /*
         * Interne App
         */

        if (
            app.type ===
                "internal" ||
            !app.type
        ) {

            if (
                app.path
            ) {

                window.location.href =
                    app.path;

            }
            else {

                /*
                 * Noch keine Seite vorhanden:
                 * App-Event auslösen.
                 */

                emit(
                    "app:launch",
                    {
                        app
                    }
                );


                log(
                    `App "${app.name}" ist registriert, besitzt aber noch keinen Pfad.`,
                    "warning"
                );

            }


            return true;

        }


        /*
         * Externe App / Website
         */

        if (
            app.type ===
                "external"
        ) {

            if (
                app.url
            ) {

                window.open(
                    app.url,
                    "_blank",
                    "noopener,noreferrer"
                );

                return true;

            }

        }


        /*
         * Spezial-App
         */

        emit(
            "app:launch",
            {
                app
            }
        );


        return true;

    }


    /* ========================================================
       12 — JSON KONFIGURATION LADEN
       ======================================================== */

    async function loadConfig() {

        if (
            state.loading
        ) {

            return false;

        }


        state.loading =
            true;

        state.error =
            null;


        setStartupStatus(
            "App-Konfiguration wird geladen..."
        );


        try {

            const response =
                await fetch(
                    APP_CONFIG_PATH,
                    {
                        cache:
                            "no-store"
                    }
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            /*
             * Unterstützte Formate:
             *
             * {
             *   "apps": []
             * }
             *
             * oder direkt:
             *
             * []
             */

            let apps =
                Array.isArray(data)
                    ? data
                    : data.apps;


            if (
                !Array.isArray(apps)
            ) {

                throw new Error(
                    "apps.json enthält keine gültige App-Liste."
                );

            }


            registerApps(
                apps
            );


            state.configLoaded =
                true;


            state.ready =
                true;


            state.loading =
                false;


            emit(
                "apps:loaded",
                {
                    apps:
                        getAllApps()
                }
            );


            log(
                `${state.apps.length} Apps geladen.`
            );


            setStartupStatus(
                "HalDo AI Apps wurden geladen."
            );


            return true;

        }
        catch (error) {

            state.loading =
                false;

            state.error =
                error;


            log(
                `App-Konfiguration konnte nicht geladen werden: ${error.message}`,
                "error"
            );


            /*
             * Wichtig:
             *
             * Ein Fehler bei apps.json darf das gesamte
             * Betriebssystem NICHT komplett zerstören.
             */

            state.ready =
                true;


            emit(
                "apps:load-error",
                {
                    error
                }
            );


            setStartupStatus(
                "HalDo AI App-System läuft im Grundmodus."
            );


            return false;

        }

    }


    /* ========================================================
       13 — APP MANAGER INITIALISIERUNG
       ======================================================== */

    async function init() {

        if (
            state.initialized
        ) {

            return true;

        }


        log(
            "App Manager wird initialisiert."
        );


        loadSavedState();


        state.initialized =
            true;


        emit(
            "appmanager:initialized"
        );


        /*
         * Konfiguration laden.
         */

        await loadConfig();


        rebuildCategories();


        /*
         * Kernel informieren.
         */

        if (
            window.HalDoKernel &&
            typeof
                window.HalDoKernel.registerModule ===
                "function"
        ) {

            window.HalDoKernel.registerModule(
                "app-manager",
                api
            );

        }


        emit(
            "appmanager:ready"
        );


        log(
            "App Manager ist bereit."
        );


        return true;

    }


    /* ========================================================
       14 — EVENT SYSTEM
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

            listeners[eventName] = [];

        }


        listeners[eventName]
            .push(callback);


        return true;

    }


    function emit(
        eventName,
        data = null
    ) {

        const callbacks =
            listeners[eventName];


        if (
            callbacks
        ) {

            callbacks.forEach(
                callback => {

                    try {

                        callback(data);

                    }
                    catch (error) {

                        log(
                            `Event-Fehler "${eventName}": ${error.message}`,
                            "error"
                        );

                    }

                }
            );

        }


        /*
         * Zusätzlich Kernel-Event senden.
         */

        if (
            window.HalDoKernel &&
            typeof
                window.HalDoKernel.emit ===
                "function"
        ) {

            window.HalDoKernel.emit(
                `appmanager:${eventName}`,
                data
            );

        }

    }


    /* ========================================================
       15 — STATUS
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            loading:
                state.loading,

            error:
                state.error,

            appCount:
                state.apps.length,

            categoryCount:
                state.categories.length,

            favoriteCount:
                state.favorites.length,

            activeCategory:
                state.activeCategory,

            searchTerm:
                state.searchTerm,

            configLoaded:
                state.configLoaded,

            lastOpenedApp:
                state.lastOpenedApp

        };

    }


    function setCategory(
        category
    ) {

        state.activeCategory =
            category ||
            "all";


        emit(
            "category:changed",
            {
                category:
                    state.activeCategory
            }
        );

    }


    function setSearch(
        term
    ) {

        state.searchTerm =
            String(
                term || ""
            );


        emit(
            "search:changed",
            {
                term:
                    state.searchTerm
            }
        );

    }


    /* ========================================================
       16 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            "HalDo App Manager",

        version:
            VERSION,


        init,

        loadConfig,


        registerApp,

        registerApps,

        unregisterApp,


        getApp,

        getAllApps,

        getVisibleApps,

        getAppsByCategory,


        searchApps,


        setFavorite,

        toggleFavorite,

        getFavorites,


        openApp,


        getCategories:
            function () {

                return [
                    ...state.categories
                ];

            },


        getCategoryName,


        setCategory,

        setSearch,


        getState,


        on,

        emit,


        saveState

    };


    /* ========================================================
       17 — GLOBAL REGISTRATION
       ======================================================== */

    window.HalDoAppManager =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appManager =
        api;


    /* ========================================================
       18 — KERNEL CONNECTION
       ======================================================== */

    function connectToKernel() {

        if (
            !window.HalDoKernel
        ) {

            window.setTimeout(
                connectToKernel,
                100
            );

            return;

        }


        /*
         * Auf Kernel Ready warten.
         */

        window.HalDoKernel.on(
            "kernel:ready",
            function () {

                init();

            }
        );


        /*
         * Falls Kernel bereits fertig ist.
         */

        const kernelState =
            window.HalDoKernel.getState();


        if (
            kernelState.ready
        ) {

            init();

        }

    }


    /* ========================================================
       19 — START
       ======================================================== */

    function start() {

        connectToKernel();

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

    }
    else {

        start();

    }


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 APP MANAGER
   ============================================================ */