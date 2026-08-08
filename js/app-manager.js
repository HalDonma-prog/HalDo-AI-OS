/* ============================================================
   HALDO AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei:
   js/app-manager.js

   Aufgabe:
   Zentraler App Manager für HalDo AI OS 18.

   Verbindet:
   - config/apps.js
   - launcher.js
   - app-router.js
   - kernel.js
   - system.js

   Verantwortlich für:
   - App-Registrierung
   - App-Liste
   - Kategorien
   - Suche
   - Favoriten
   - Aktivierung / Deaktivierung
   - App-Status
   - sichere App-Daten
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — SYSTEM INFORMATION
       ======================================================== */

    const VERSION =
        "18.0.0";

    const NAME =
        "HalDo App Manager";


    /* ========================================================
       02 — STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        loading:
            false,

        apps:
            new Map(),

        categories:
            new Map(),

        search:
            "",

        category:
            "all",

        favoriteIds:
            new Set(),

        registeredModules:
            new Map(),

        errors:
            []

    };


    /* ========================================================
       03 — EVENTS
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
                            "[HalDo App Manager] Event-Fehler:",
                            error
                        );

                    }

                }
            );

    }


    /* ========================================================
       04 — LOG
       ======================================================== */

    function log(
        message,
        type = "info"
    ) {

        const prefix =
            "[HalDo App Manager]";


        if (
            type ===
            "error"
        ) {

            console.error(
                prefix,
                message
            );

        }
        else if (
            type ===
            "warning"
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
       05 — NORMALIZE ID
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
       06 — CLONE APP
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
       07 — REGISTRY
       ======================================================== */

    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            null
        );

    }


    /* ========================================================
       08 — APP REGISTRIEREN
       ======================================================== */

    function registerApp(
        app
    ) {

        if (
            !app
        ) {

            return false;

        }


        const id =
            normalizeId(
                app.id
            );


        if (
            !id
        ) {

            return false;

        }


        const normalized = {

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

            description:
                app.description ||
                "",

            category:
                normalizeId(
                    app.category ||
                    "other"
                ),

            icon:
                app.icon ||
                "◇",

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
                    : 9999,

            keywords:
                [
                    ...(app.keywords || [])
                ]

        };


        state.apps.set(
            id,
            normalized
        );


        if (
            normalized.favorite
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


        updateCategory(
            normalized.category
        );


        emit(
            "app:registered",
            cloneApp(
                normalized
            )
        );


        return true;

    }


    /* ========================================================
       09 — MEHRERE APPS REGISTRIEREN
       ======================================================== */

    function registerApps(
        apps
    ) {

        if (
            !Array.isArray(
                apps
            )
        ) {

            return 0;

        }


        let count =
            0;


        apps.forEach(
            app => {

                if (
                    registerApp(
                        app
                    )
                ) {

                    count++;

                }

            }
        );


        rebuildCategories();


        emit(
            "apps:loaded",
            {
                count,

                apps:
                    getAllApps()

            }
        );


        return count;

    }


    /* ========================================================
       10 — APP ENTFERNEN
       ======================================================== */

    function unregisterApp(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (
            !state.apps.has(
                id
            )
        ) {

            return false;

        }


        state.apps.delete(
            id
        );


        state.favoriteIds.delete(
            id
        );


        rebuildCategories();


        emit(
            "app:unregistered",
            {
                appId:
                    id
            }
        );


        return true;

    }


    /* ========================================================
       11 — APP ABFRAGEN
       ======================================================== */

    function getApp(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const app =
            state.apps.get(
                id
            );


        return cloneApp(
            app
        );

    }


    /* ========================================================
       12 — ALLE APPS
       ======================================================== */

    function getAllApps(
        options = {}
    ) {

        let apps =
            Array.from(
                state.apps.values()
            );


        if (
            options.enabledOnly !==
            false
        ) {

            apps =
                apps.filter(
                    app =>
                        app.enabled !==
                        false
                );

        }


        apps.sort(
            (a, b) =>
                (
                    a.order || 9999
                ) -
                (
                    b.order || 9999
                )
        );


        return apps.map(
            cloneApp
        );

    }


    /* ========================================================
       13 — FAVORITEN
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
       14 — FAVORIT UMSCHALTEN
       ======================================================== */

    function toggleFavorite(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const app =
            state.apps.get(
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


        emit(
            "app:favorite",
            {
                app:
                    cloneApp(
                        app
                    ),

                appId:
                    id,

                favorite:
                    app.favorite

            }
        );


        return app.favorite;

    }


    /* ========================================================
       15 — FAVORIT SETZEN
       ======================================================== */

    function setFavorite(
        appId,
        favorite
    ) {

        const id =
            normalizeId(
                appId
            );


        const app =
            state.apps.get(
                id
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


        emit(
            "app:favorite",
            {
                app:
                    cloneApp(
                        app
                    ),

                appId:
                    id,

                favorite:
                    app.favorite

            }
        );


        return app.favorite;

    }


    /* ========================================================
       16 — APP AKTIVIEREN
       ======================================================== */

    function enableApp(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const app =
            state.apps.get(
                id
            );


        if (
            !app
        ) {

            return false;

        }


        app.enabled =
            true;


        emit(
            "app:enabled",
            cloneApp(
                app
            )
        );


        return true;

    }


    /* ========================================================
       17 — APP DEAKTIVIEREN
       ======================================================== */

    function disableApp(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const app =
            state.apps.get(
                id
            );


        if (
            !app
        ) {

            return false;

        }


        app.enabled =
            false;


        emit(
            "app:disabled",
            cloneApp(
                app
            )
        );


        return true;

    }


    /* ========================================================
       18 — KATEGORIE
       ======================================================== */

    function updateCategory(
        category
    ) {

        const id =
            normalizeId(
                category ||
                "other"
            );


        if (
            !state.categories.has(
                id
            )
        ) {

            state.categories.set(
                id,
                {
                    id,

                    name:
                        categoryDisplayName(
                            id
                        ),

                    count:
                        0
                }
            );

        }

    }


    function rebuildCategories() {

        state.categories.clear();


        const allApps =
            getAllApps();


        state.categories.set(
            "all",
            {
                id:
                    "all",

                name:
                    "Alle Apps",

                count:
                    allApps.length
            }
        );


        state.categories.set(
            "favorites",
            {
                id:
                    "favorites",

                name:
                    "Favoriten",

                count:
                    allApps.filter(
                        app =>
                            app.favorite
                    ).length
            }
        );


        allApps.forEach(
            app => {

                const category =
                    app.category ||
                    "other";


                if (
                    !state.categories.has(
                        category
                    )
                ) {

                    state.categories.set(
                        category,
                        {
                            id:
                                category,

                            name:
                                categoryDisplayName(
                                    category
                                ),

                            count:
                                0
                        }
                    );

                }


                state.categories.get(
                    category
                ).count++;

            }
        );


        emit(
            "categories:updated",
            getCategories()
        );

    }


    function categoryDisplayName(
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
            names[
                category
            ] ||
            String(
                category
            )
            .replace(
                /-/g,
                " "
            )
            .replace(
                /\b\w/g,
                char =>
                    char.toUpperCase()
            )
        );

    }


    function getCategories() {

        return Array.from(
            state.categories.values()
        )
        .map(
            category => ({
                ...category
            })
        );

    }


    function getCategory(
        categoryId
    ) {

        const id =
            normalizeId(
                categoryId
            );


        if (
            id ===
            "all"
        ) {

            return getAllApps();

        }


        if (
            id ===
            "favorites"
        ) {

            return getFavorites();

        }


        return getAllApps()
            .filter(
                app =>
                    app.category ===
                    id
            );

    }


    /* ========================================================
       19 — SUCHE
       ======================================================== */

    function search(
        query
    ) {

        const value =
            String(
                query ||
                ""
            )
            .trim()
            .toLowerCase();


        state.search =
            value;


        let result =
            getAllApps();


        if (
            value
        ) {

            result =
                result.filter(
                    app => {

                        const text =
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


                        return text.includes(
                            value
                        );

                    }
                );

        }


        emit(
            "search:changed",
            {
                query:
                    value,

                results:
                    result.map(
                        cloneApp
                    )

            }
        );


        return result;

    }


    function setSearch(
        query
    ) {

        state.search =
            String(
                query ||
                ""
            );


        return search(
            state.search
        );

    }


    /* ========================================================
       20 — KATEGORIE SETZEN
       ======================================================== */

    function setCategory(
        category
    ) {

        const id =
            normalizeId(
                category ||
                "all"
            );


        state.category =
            id;


        const result =
            getCategory(
                id
            );


        emit(
            "category:changed",
            {
                category:
                    id,

                results:
                    result.map(
                        cloneApp
                    )

            }
        );


        return result;

    }


    /* ========================================================
       21 — APP MODUL REGISTRIEREN
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


        const app =
            state.apps.get(
                id
            );


        if (
            app
        ) {

            app.moduleReady =
                true;

        }


        emit(
            "module:registered",
            {
                appId:
                    id,

                module
            }
        );


        log(
            `Modul registriert: ${id}`
        );


        return true;

    }


    /* ========================================================
       22 — MODUL ABFRAGEN
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
       23 — APP STATUS
       ======================================================== */

    function getAppStatus(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const app =
            state.apps.get(
                id
            );


        if (
            !app
        ) {

            return {

                exists:
                    false,

                id

            };

        }


        return {

            exists:
                true,

            id,

            enabled:
                app.enabled !==
                false,

            favorite:
                app.favorite ===
                true,

            moduleReady:
                state.registeredModules.has(
                    id
                ),

            app:
                cloneApp(
                    app
                )

        };

    }


    /* ========================================================
       24 — INITIALISIERUNG
       ======================================================== */

    function init() {

        if (
            state.initialized
        ) {

            return getState();

        }


        state.initialized =
            true;

        state.loading =
            true;


        /*
         * Zentrale Registry laden.
         */

        const registry =
            getRegistry();


        if (
            registry &&
            typeof registry.getAllApps ===
                "function"
        ) {

            const apps =
                registry.getAllApps();


            registerApps(
                apps
            );

        }
        else {

            log(
                "HalDoAppRegistry wurde noch nicht geladen.",
                "warning"
            );

        }


        rebuildCategories();


        state.loading =
            false;

        state.ready =
            true;


        /*
         * Global verfügbar machen.
         */

        if (
            window.HalDoSystem &&
            typeof window.HalDoSystem.registerService ===
                "function"
        ) {

            window.HalDoSystem.registerService(
                "app-manager",
                api
            );

        }


        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.registerModule ===
                "function"
        ) {

            window.HalDoKernel.registerModule(
                "app-manager",
                api
            );


            if (
                typeof window.HalDoKernel.setModuleReady ===
                    "function"
            ) {

                window.HalDoKernel.setModuleReady(
                    "app-manager",
                    true
                );

            }

        }


        emit(
            "ready",
            getState()
        );


        log(
            `${getAllApps().length} Apps registriert.`
        );


        return getState();

    }


    /* ========================================================
       25 — REFRESH
       ======================================================== */

    function refresh() {

        const registry =
            getRegistry();


        if (
            registry &&
            typeof registry.getAllApps ===
                "function"
        ) {

            state.apps.clear();


            registerApps(
                registry.getAllApps()
            );

        }


        rebuildCategories();


        emit(
            "refreshed",
            getAllApps()
        );


        return getAllApps();

    }


    /* ========================================================
       26 — STATUS
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            loading:
                state.loading,

            appCount:
                getAllApps().length,

            categoryCount:
                getCategories().length,

            favoriteCount:
                getFavorites().length,

            moduleCount:
                state.registeredModules.size,

            search:
                state.search,

            category:
                state.category

        };

    }


    /* ========================================================
       27 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        const registry =
            getRegistry();


        const router =
            window.HalDoAppRouter ||
            null;


        const launcher =
            window.HalDoLauncher ||
            null;


        return {

            manager:
                getState(),

            registry:
                Boolean(
                    registry
                ),

            router:
                Boolean(
                    router
                ),

            launcher:
                Boolean(
                    launcher
                ),

            apps:
                getAllApps().map(
                    app => ({
                        id:
                            app.id,

                        title:
                            app.title,

                        enabled:
                            app.enabled,

                        moduleReady:
                            state.registeredModules.has(
                                app.id
                            )
                    })
                ),

            errors:
                [
                    ...state.errors
                ]

        };

    }


    /* ========================================================
       28 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,


        init,

        refresh,


        registerApp,

        registerApps,

        unregisterApp,


        getApp,

        getAllApps,

        getFavorites,


        toggleFavorite,

        setFavorite,


        enableApp,

        disableApp,


        getCategories,

        getCategory,


        search,

        setSearch,

        setCategory,


        registerModule,

        getModule,


        getAppStatus,


        getState,

        diagnose,


        on,

        off,

        emit

    };


    /* ========================================================
       29 — GLOBAL
       ======================================================== */

    window.HalDoAppManager =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.apps =
        api;


    /* ========================================================
       30 — START
       ======================================================== */

    function start() {

        init();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start,
            {
                once:
                    true
            }
        );

    }
    else {

        start();

    }


})(window);


/* ============================================================
   ENDE — HALDO AI OS 18 APP MANAGER
   ============================================================ */