/* ============================================================
   HalDo AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei:
   js/app-manager.js

   Aufgabe:
   Zentrale Verwaltung aller HalDo AI OS Apps.

   Datenquelle:
   config/apps.json

   Verantwortlich für:
   - Apps laden
   - Apps registrieren
   - Apps suchen
   - Kategorien
   - Favoriten
   - App-Status
   - Modulverwaltung
   - Launcher-Verbindung
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const VERSION =
        "18.0.0";


    const APPS_FILE =
        "config/apps.json";


    const STORAGE_KEY =
        "haldo-ai-os-app-state-v18";


    /* ========================================================
       02 — SYSTEMZUSTAND
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        loading:
            false,

        error:
            null,

        apps:
            [],

        categories:
            [],

        search:
            "",

        activeCategory:
            "all",

        favoriteIds:
            new Set(),

        registeredModules:
            new Map()

    };


    /* ========================================================
       03 — EVENT SYSTEM
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


        callbacks.forEach(
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
                        "[HalDo App Manager] Event-Fehler:",
                        error
                    );

                }

            }
        );

    }


    /* ========================================================
       04 — LOG SYSTEM
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

    }


    /* ========================================================
       05 — ID NORMALISIEREN
       ======================================================== */

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
       06 — APP DATEN NORMALISIEREN
       ======================================================== */

    function normalizeApp(
        rawApp,
        index = 0
    ) {

        if (
            !rawApp ||
            typeof rawApp !==
            "object"
        ) {

            return null;

        }


        const id =
            normalizeId(
                rawApp.id ||
                rawApp.name ||
                `app-${index + 1}`
            );


        const app = {

            id,

            name:
                rawApp.name ||
                id,

            title:
                rawApp.title ||
                rawApp.name ||
                id,

            description:
                rawApp.description ||
                "HalDo AI OS Anwendung.",

            category:
                normalizeId(
                    rawApp.category ||
                    "other"
                ),

            icon:
                rawApp.icon ||
                "◇",

            type:
                rawApp.type ||
                "internal",

            enabled:
                rawApp.enabled !== false,

            visible:
                rawApp.visible !== false,

            system:
                Boolean(
                    rawApp.system
                ),

            featured:
                Boolean(
                    rawApp.featured
                ),

            favorite:
                Boolean(
                    rawApp.favorite
                ),

            order:
                Number.isFinite(
                    Number(
                        rawApp.order
                    )
                )
                    ? Number(
                        rawApp.order
                    )
                    : index,

            keywords:
                Array.isArray(
                    rawApp.keywords
                )
                    ? rawApp.keywords
                        .map(
                            keyword =>
                                String(
                                    keyword
                                )
                                .trim()
                                .toLowerCase()
                        )
                        .filter(
                            Boolean
                        )
                    : [],

            permissions:
                Array.isArray(
                    rawApp.permissions
                )
                    ? [
                        ...rawApp.permissions
                    ]
                    : [],

            module:
                rawApp.module ||
                null,

            route:
                rawApp.route ||
                null,

            metadata:
                rawApp.metadata &&
                typeof rawApp.metadata ===
                    "object"
                    ? {
                        ...rawApp.metadata
                    }
                    : {}

        };


        return app;

    }


    /* ========================================================
       07 — APP SORTIERUNG
       ======================================================== */

    function sortApps(
        apps
    ) {

        return [
            ...apps
        ]
        .sort(
            (
                a,
                b
            ) => {

                const orderA =
                    Number(
                        a.order
                    ) || 0;


                const orderB =
                    Number(
                        b.order
                    ) || 0;


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
       08 — STORAGE LADEN
       ======================================================== */

    function loadLocalState() {

        try {

            const stored =
                window.localStorage.getItem(
                    STORAGE_KEY
                );


            if (
                !stored
            ) {

                return;

            }


            const parsed =
                JSON.parse(
                    stored
                );


            if (
                !parsed ||
                typeof parsed !==
                    "object"
            ) {

                return;

            }


            if (
                Array.isArray(
                    parsed.favoriteIds
                )
            ) {

                parsed.favoriteIds
                    .forEach(
                        id => {

                            state.favoriteIds.add(
                                normalizeId(
                                    id
                                )
                            );

                        }
                    );

            }


            if (
                typeof parsed.search ===
                "string"
            ) {

                state.search =
                    parsed.search;

            }


            if (
                typeof parsed.activeCategory ===
                "string"
            ) {

                state.activeCategory =
                    parsed.activeCategory;

            }

        }
        catch (
            error
        ) {

            log(
                "Lokaler App-Status konnte nicht geladen werden.",
                "warning"
            );

        }

    }


    /* ========================================================
       09 — STORAGE SPEICHERN
       ======================================================== */

    function saveLocalState() {

        try {

            const data = {

                favoriteIds:
                    [
                        ...state.favoriteIds
                    ],

                search:
                    state.search,

                activeCategory:
                    state.activeCategory

            };


            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    data
                )
            );

        }
        catch (
            error
        ) {

            log(
                "Lokaler App-Status konnte nicht gespeichert werden.",
                "warning"
            );

        }

    }


    /* ========================================================
       10 — APPS.JSON LADEN
       ======================================================== */

    async function loadApps(
        source = APPS_FILE
    ) {

        if (
            state.loading
        ) {

            return state.apps;

        }


        state.loading =
            true;

        state.error =
            null;


        emit(
            "apps:loading"
        );


        log(
            `Lade App-Konfiguration: ${source}`
        );


        try {

            const response =
                await fetch(
                    source,
                    {
                        method:
                            "GET",

                        cache:
                            "no-store",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );

            }


            const data =
                await response.json();


            if (
                !data ||
                typeof data !==
                    "object"
            ) {

                throw new Error(
                    "Die App-Konfiguration ist kein gültiges JSON-Objekt."
                );

            }


            if (
                !Array.isArray(
                    data.apps
                )
            ) {

                throw new Error(
                    "In config/apps.json wurde kein gültiges 'apps'-Array gefunden."
                );

            }


            const normalized =
                data.apps
                    .map(
                        normalizeApp
                    )
                    .filter(
                        Boolean
                    );


            state.apps =
                sortApps(
                    normalized
                );


            /*
             * Favoriten aus JSON übernehmen.
             * Danach lokale Favoriten anwenden.
             */

            state.apps.forEach(
                app => {

                    if (
                        app.favorite
                    ) {

                        state.favoriteIds.add(
                            app.id
                        );

                    }


                    if (
                        state.favoriteIds.has(
                            app.id
                        )
                    ) {

                        app.favorite =
                            true;

                    }

                }
            );


            buildCategories();


            state.loading =
                false;

            state.ready =
                true;


            saveLocalState();


            emit(
                "apps:loaded",
                {
                    apps:
                        getAllApps(),

                    version:
                        data.version ||
                        VERSION,

                    system:
                        data.system ||
                        "HalDo AI OS"

                }
            );


            emit(
                "ready",
                getState()
            );


            log(
                `${state.apps.length} Apps erfolgreich geladen.`
            );


            return getAllApps();

        }
        catch (
            error
        ) {

            state.loading =
                false;

            state.ready =
                false;

            state.error =
                error;


            log(
                `Apps konnten nicht geladen werden: ${error.message}`,
                "error"
            );


            emit(
                "apps:error",
                error
            );


            /*
             * WICHTIG:
             * Das System stürzt nicht ab.
             *
             * Wir stellen eine minimale
             * sichere Foundation bereit.
             */

            if (
                state.apps.length ===
                0
            ) {

                state.apps =
                    createEmergencyApps();


                buildCategories();

            }


            return getAllApps();

        }

    }


    /* ========================================================
       11 — NOTFALL-APPS
       ======================================================== */

    function createEmergencyApps() {

        return [

            normalizeApp(
                {
                    id:
                        "haldo-ai",

                    name:
                        "HalDo AI",

                    title:
                        "HalDo AI",

                    description:
                        "HalDo AI Systemassistent.",

                    category:
                        "ai",

                    icon:
                        "assets/logo/logo.png",

                    type:
                        "internal",

                    enabled:
                        true,

                    visible:
                        true,

                    system:
                        true,

                    order:
                        1

                }
            ),

            normalizeApp(
                {
                    id:
                        "settings",

                    name:
                        "Einstellungen",

                    title:
                        "Einstellungen",

                    description:
                        "HalDo AI OS Einstellungen.",

                    category:
                        "settings",

                    icon:
                        "⚙",

                    type:
                        "internal",

                    enabled:
                        true,

                    visible:
                        true,

                    system:
                        true,

                    order:
                        2

                }
            )

        ]
        .filter(
            Boolean
        );

    }


    /* ========================================================
       12 — KATEGORIEN ERSTELLEN
       ======================================================== */

    function buildCategories() {

        const map =
            new Map();


        /*
         * Alle Apps zählen.
         */

        state.apps
            .filter(
                app =>
                    app.visible !== false
            )
            .forEach(
                app => {

                    const id =
                        app.category ||
                        "other";


                    if (
                        !map.has(id)
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


        const categories = [

            {
                id:
                    "all",

                name:
                    "Alle Apps",

                count:
                    state.apps.filter(
                        app =>
                            app.visible !== false
                    ).length

            },

            {
                id:
                    "favorites",

                name:
                    "Favoriten",

                count:
                    state.apps.filter(
                        app =>
                            app.visible !== false &&
                            app.favorite
                    ).length

            }

        ];


        map.forEach(
            category => {

                categories.push(
                    category
                );

            }
        );


        state.categories =
            categories;


        emit(
            "categories:updated",
            getCategories()
        );

    }


    /* ========================================================
       13 — KATEGORIENNAMEN
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


        return (
            names[category] ||
            category
                .replace(
                    /-/g,
                    " "
                )
                .replace(
                    /\b\w/g,
                    letter =>
                        letter.toUpperCase()
                )
        );

    }


    /* ========================================================
       14 — ALLE APPS
       ======================================================== */

    function getAllApps() {

        return state.apps
            .filter(
                app =>
                    app.visible !== false
            )
            .map(
                app =>
                    ({
                        ...app,

                        keywords:
                            [
                                ...app.keywords
                            ],

                        permissions:
                            [
                                ...app.permissions
                            ],

                        metadata:
                            {
                                ...app.metadata
                            }

                    })
            );

    }


    /* ========================================================
       15 — APP ABFRAGEN
       ======================================================== */

    function getApp(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        return (
            state.apps.find(
                app =>
                    app.id === id
            ) ||
            null
        );

    }


    /* ========================================================
       16 — APPS NACH KATEGORIE
       ======================================================== */

    function getAppsByCategory(
        category
    ) {

        const categoryId =
            normalizeId(
                category
            );


        if (
            !categoryId ||
            categoryId ===
                "all"
        ) {

            return getAllApps();

        }


        if (
            categoryId ===
                "favorites"
        ) {

            return getFavorites();

        }


        return state.apps
            .filter(
                app =>
                    app.visible !== false &&
                    app.category ===
                        categoryId
            )
            .map(
                app =>
                    ({
                        ...app
                    })
            );

    }


    /* ========================================================
       17 — FAVORITEN
       ======================================================== */

    function getFavorites() {

        return state.apps
            .filter(
                app =>
                    app.visible !== false &&
                    app.favorite
            )
            .map(
                app =>
                    ({
                        ...app
                    })
            );

    }


    function toggleFavorite(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const app =
            getApp(
                id
            );


        if (
            !app
        ) {

            return false;

        }


        app.favorite =
            !app.favorite;


        if (
            app.favorite
        ) {

            state.favoriteIds.add(
                id
            );

        }
        else {

            state.favoriteIds.delete(
                id
            );

        }


        saveLocalState();


        buildCategories();


        emit(
            "app:favorite",
            {
                app,
                favorite:
                    app.favorite
            }
        );


        return app.favorite;

    }


    /* ========================================================
       18 — SUCHEN
       ======================================================== */

    function searchApps(
        query
    ) {

        const term =
            String(
                query || ""
            )
            .trim()
            .toLowerCase();


        state.search =
            term;


        saveLocalState();


        if (
            !term
        ) {

            return getAllApps();

        }


        return state.apps
            .filter(
                app =>
                    app.visible !== false
            )
            .filter(
                app => {

                    const searchable =
                        [

                            app.id,

                            app.name,

                            app.title,

                            app.description,

                            app.category,

                            ...app.keywords

                        ]
                        .join(
                            " "
                        )
                        .toLowerCase();


                    return searchable.includes(
                        term
                    );

                }
            )
            .map(
                app =>
                    ({
                        ...app
                    })
            );

    }


    /* ========================================================
       19 — SUCHSTATUS
       ======================================================== */

    function setSearch(
        query
    ) {

        state.search =
            String(
                query || ""
            )
            .trim();


        saveLocalState();


        emit(
            "search:changed",
            state.search
        );

    }


    function getSearch() {

        return state.search;

    }


    /* ========================================================
       20 — KATEGORIE SETZEN
       ======================================================== */

    function setCategory(
        category
    ) {

        state.activeCategory =
            normalizeId(
                category
            ) ||
            "all";


        saveLocalState();


        emit(
            "category:changed",
            state.activeCategory
        );


        return state.activeCategory;

    }


    function getCategory() {

        return state.activeCategory;

    }


    /* ========================================================
       21 — KATEGORIEN ABFRAGEN
       ======================================================== */

    function getCategories() {

        return state.categories.map(
            category =>
                ({
                    ...category
                })
        );

    }


    /* ========================================================
       22 — APP REGISTRIEREN
       ======================================================== */

    function registerApp(
        appData
    ) {

        const app =
            normalizeApp(
                appData,
                state.apps.length
            );


        if (
            !app
        ) {

            return null;

        }


        const existingIndex =
            state.apps.findIndex(
                existing =>
                    existing.id ===
                    app.id
            );


        if (
            existingIndex >=
            0
        ) {

            state.apps[
                existingIndex
            ] =
                {
                    ...state.apps[
                        existingIndex
                    ],

                    ...app

                };

        }
        else {

            state.apps.push(
                app
            );

        }


        state.apps =
            sortApps(
                state.apps
            );


        if (
            app.favorite
        ) {

            state.favoriteIds.add(
                app.id
            );

        }


        buildCategories();


        emit(
            "apps:registered",
            app
        );


        return getApp(
            app.id
        );

    }


    /* ========================================================
       23 — APP ENTFERNEN
       ======================================================== */

    function unregisterApp(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const index =
            state.apps.findIndex(
                app =>
                    app.id === id
            );


        if (
            index === -1
        ) {

            return false;

        }


        const removed =
            state.apps.splice(
                index,
                1
            )[0];


        state.favoriteIds.delete(
            id
        );


        state.registeredModules.delete(
            id
        );


        buildCategories();


        saveLocalState();


        emit(
            "apps:unregistered",
            removed
        );


        return true;

    }


    /* ========================================================
       24 — APP MODUL REGISTRIEREN
       ======================================================== */

    function registerModule(
        appId,
        module
    ) {

        const id =
            normalizeId(
                appId
            );


        if (
            !id ||
            !module
        ) {

            return false;

        }


        state.registeredModules.set(
            id,
            module
        );


        /*
         * Zusätzlich mit Router verbinden,
         * sobald Router vorhanden ist.
         */

        if (
            window.HalDoAppRouter &&
            typeof window.HalDoAppRouter.registerModule ===
                "function"
        ) {

            window.HalDoAppRouter.registerModule(
                id,
                module
            );

        }


        emit(
            "module:registered",
            {
                appId:
                    id,

                module
            }
        );


        return true;

    }


    /* ========================================================
       25 — MODUL ABFRAGEN
       ======================================================== */

    function getModule(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        return (
            state.registeredModules.get(
                id
            ) ||
            null
        );

    }


    /* ========================================================
       26 — APP STATUS
       ======================================================== */

    function setEnabled(
        appId,
        enabled
    ) {

        const app =
            getApp(
                appId
            );


        if (
            !app
        ) {

            return false;

        }


        app.enabled =
            Boolean(
                enabled
            );


        emit(
            "app:status",
            {
                app,

                enabled:
                    app.enabled

            }
        );


        return true;

    }


    /* ========================================================
       27 — SICHTBARKEIT
       ======================================================== */

    function setVisible(
        appId,
        visible
    ) {

        const app =
            getApp(
                appId
            );


        if (
            !app
        ) {

            return false;

        }


        app.visible =
            Boolean(
                visible
            );


        buildCategories();


        emit(
            "app:visibility",
            {
                app,

                visible:
                    app.visible

            }
        );


        return true;

    }


    /* ========================================================
       28 — STATE
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
                state.error
                    ? state.error.message
                    : null,

            appCount:
                state.apps.length,

            visibleAppCount:
                state.apps.filter(
                    app =>
                        app.visible !== false
                ).length,

            categoryCount:
                state.categories.length,

            search:
                state.search,

            activeCategory:
                state.activeCategory,

            favoriteCount:
                state.favoriteIds.size,

            moduleCount:
                state.registeredModules.size

        };

    }


    /* ========================================================
       29 — INITIALISIERUNG
       ======================================================== */

    async function init() {

        if (
            state.initialized
        ) {

            return getState();

        }


        state.initialized =
            true;


        loadLocalState();


        await loadApps();


        /*
         * Kernel verbinden.
         */

        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.registerModule ===
                "function"
        ) {

            window.HalDoKernel.registerModule(
                "app-manager",
                api
            );

        }


        log(
            "App Manager ist initialisiert."
        );


        return getState();

    }


    /* ========================================================
       30 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            "HalDo App Manager",

        version:
            VERSION,


        init,


        loadApps,


        getAllApps,

        getApp,

        getAppsByCategory,

        getFavorites,


        toggleFavorite,


        searchApps,

        setSearch,

        getSearch,


        setCategory,

        getCategory,


        getCategories,


        registerApp,

        unregisterApp,


        registerModule,

        getModule,


        setEnabled,

        setVisible,


        getState,


        on,

        emit

    };


    /* ========================================================
       31 — GLOBAL
       ======================================================== */

    window.HalDoAppManager =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appManager =
        api;


    /* ========================================================
       32 — START
       ======================================================== */

    function start() {

        init()
            .catch(
                error => {

                    log(
                        `Initialisierungsfehler: ${error.message}`,
                        "error"
                    );

                }
            );

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