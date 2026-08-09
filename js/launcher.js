/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/launcher.js

   ZENTRALER LAUNCHER

   Architektur:

       kernel.js
           ↓
       system.js
           ↓
       app-registry.js
           ↓
       app-manager.js
           ↓
       app-router.js
           ↓
       launcher.js
           ↓
       echte App-Module

   AUFGABEN:
   - zentrale Launcher-Steuerung
   - Apps aus der Registry anzeigen
   - App Manager verwenden
   - App Router verwenden
   - App-Suche
   - Kategorien
   - Favoriten
   - App-Start
   - Home-Navigation
   - Launcher-Events
   - Keyboard-Unterstützung
   - Touch-Unterstützung
   - Deep-Link-Unterstützung
   - dynamische Aktualisierung
   - Diagnose
   - vorbereitet für zukünftige Erweiterungen

   WICHTIG:
   - keine eigene App-Liste
   - Registry bleibt Quelle der App-Definitionen
   - Manager bleibt für App-Zustände zuständig
   - Router bleibt für Navigation zuständig
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const CONFIG = {

        name:
            "HalDo AI OS Launcher",

        version:
            "18.0.0",

        searchDelay:
            120,

        maxVisibleApps:
            500,

        keyboardEnabled:
            true,

        touchEnabled:
            true,

        autoRender:
            true

    };


    /* ========================================================
       02 — LAUNCHER STATUS
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        visible:
            false,

        managerReady:
            false,

        routerReady:
            false,

        registryReady:
            false,

        currentView:
            "all",

        currentCategory:
            null,

        searchQuery:
            "",

        selectedApp:
            null,

        renderedCount:
            0,

        launchCount:
            0,

        lastError:
            null,

        lastAction:
            null,

        startTime:
            null

    };


    /* ========================================================
       03 — DOM REFERENZEN
       ======================================================== */

    const dom = {

        root:
            null,

        appContainer:
            null,

        searchInput:
            null,

        categoryContainer:
            null,

        favoriteContainer:
            null,

        status:
            null

    };


    /* ========================================================
       04 — EVENT SYSTEM
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
            listeners[eventName].filter(
                item =>
                    item !== callback
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
                            "[HalDo Launcher] Event-Fehler:",
                            error
                        );

                    }

                }
            );

    }


    /* ========================================================
       05 — LOGGING
       ======================================================== */

    function log(
        message,
        type = "info"
    ) {

        const prefix =
            "[HalDo Launcher]";


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
       06 — APP MANAGER
       ======================================================== */

    function getAppManager() {

        return (
            window.HalDoAppManager ||
            (
                window.HalDoOS &&
                window.HalDoOS.appManager
            ) ||
            null
        );

    }


    /* ========================================================
       07 — APP ROUTER
       ======================================================== */

    function getAppRouter() {

        return (
            window.HalDoAppRouter ||
            (
                window.HalDoOS &&
                window.HalDoOS.appRouter
            ) ||
            null
        );

    }


    /* ========================================================
       08 — APP REGISTRY
       ======================================================== */

    function getAppRegistry() {

        return (
            window.HalDoAppRegistry ||
            (
                window.HalDoOS &&
                window.HalDoOS.appRegistry
            ) ||
            null
        );

    }


    /* ========================================================
       09 — MANAGER BEREIT?
       ======================================================== */

    function isManagerReady() {

        const manager =
            getAppManager();


        if (
            !manager
        ) {

            return false;

        }


        return (
            typeof manager.getAllApps ===
                "function" &&

            typeof manager.getApp ===
                "function" &&

            typeof manager.openApp ===
                "function"
        );

    }


    /* ========================================================
       10 — ROUTER BEREIT?
       ======================================================== */

    function isRouterReady() {

        const router =
            getAppRouter();


        if (
            !router
        ) {

            return false;

        }


        return (
            typeof router.navigate ===
                "function" ||

            typeof router.goToApp ===
                "function" ||

            typeof router.openApp ===
                "function"
        );

    }


    /* ========================================================
       11 — REGISTRY BEREIT?
       ======================================================== */

    function isRegistryReady() {

        const registry =
            getAppRegistry();


        if (
            !registry
        ) {

            return false;

        }


        return Boolean(

            typeof registry.getAllApps ===
                "function"

            ||

            typeof registry.getAll ===
                "function"

            ||

            Array.isArray(
                registry.definitions
            )

        );

    }


    /* ========================================================
       12 — APP-ID NORMALISIEREN
       ======================================================== */

    function normalizeAppId(
        appId
    ) {

        return String(
            appId ||
            ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );

    }


    /* ========================================================
       13 — ALLE APPS HOLEN
       ======================================================== */

    function getAllApps() {

        const manager =
            getAppManager();


        if (
            manager &&
            typeof manager.getAllApps ===
            "function"
        ) {

            const apps =
                manager.getAllApps();


            if (
                Array.isArray(
                    apps
                )
            ) {

                return apps;

            }

        }


        const registry =
            getAppRegistry();


        if (
            registry
        ) {

            if (
                typeof registry.getAllApps ===
                "function"
            ) {

                const apps =
                    registry.getAllApps();


                if (
                    Array.isArray(
                        apps
                    )
                ) {

                    return apps;

                }

            }


            if (
                typeof registry.getAll ===
                "function"
            ) {

                const apps =
                    registry.getAll();


                if (
                    Array.isArray(
                        apps
                    )
                ) {

                    return apps;

                }

            }


            if (
                Array.isArray(
                    registry.definitions
                )
            ) {

                return [
                    ...registry.definitions
                ];

            }

        }


        return [];

    }


    /* ========================================================
       14 — APP HOLEN
       ======================================================== */

    function getApp(
        appId
    ) {

        const normalized =
            normalizeAppId(
                appId
            );


        if (
            !normalized
        ) {

            return null;

        }


        const manager =
            getAppManager();


        if (
            manager &&
            typeof manager.getApp ===
            "function"
        ) {

            const app =
                manager.getApp(
                    normalized
                );


            if (
                app
            ) {

                return app;

            }

        }


        return getAllApps()
            .find(
                app =>
                    normalizeAppId(
                        app &&
                        app.id
                    ) ===
                    normalized
            ) ||
            null;

    }


    /* ========================================================
       15 — FAVORITEN HOLEN
       ======================================================== */

    function getFavorites() {

        const manager =
            getAppManager();


        if (
            manager &&
            typeof manager.getFavorites ===
            "function"
        ) {

            const favorites =
                manager.getFavorites();


            if (
                Array.isArray(
                    favorites
                )
            ) {

                return favorites;

            }

        }


        return getAllApps()
            .filter(
                app =>
                    app &&
                    app.favorite ===
                    true
            );

    }


    /* ========================================================
       16 — KATEGORIEN HOLEN
       ======================================================== */

    function getCategories() {

        const manager =
            getAppManager();


        if (
            manager &&
            typeof manager.getCategories ===
            "function"
        ) {

            const categories =
                manager.getCategories();


            if (
                Array.isArray(
                    categories
                )
            ) {

                return categories;

            }

        }


        const categories =
            new Set();


        getAllApps()
            .forEach(
                app => {

                    if (
                        app &&
                        app.category
                    ) {

                        categories.add(
                            String(
                                app.category
                            )
                        );

                    }

                }
            );


        return Array.from(
            categories
        )
        .sort(
            (
                a,
                b
            ) =>
                a.localeCompare(
                    b,
                    "de"
                )
        );

    }


    /* ========================================================
       17 — SICHTBARE APPS
       ======================================================== */

    function getVisibleApps() {

        const manager =
            getAppManager();


        let apps =
            getAllApps();


        /*
         * Nur aktivierte Apps.
         */

        if (
            manager &&
            typeof manager.getEnabledApps ===
            "function"
        ) {

            const enabledApps =
                manager.getEnabledApps();


            if (
                Array.isArray(
                    enabledApps
                )
            ) {

                apps =
                    enabledApps;

            }

        }


        /*
         * Favoritenansicht.
         */

        if (
            state.currentView ===
            "favorites"
        ) {

            apps =
                getFavorites();

        }


        /*
         * Kategorie.
         */

        if (
            state.currentCategory
        ) {

            const category =
                String(
                    state.currentCategory
                )
                .trim()
                .toLowerCase();


            apps =
                apps.filter(
                    app =>
                        String(
                            app.category ||
                            ""
                        )
                        .trim()
                        .toLowerCase() ===
                        category
                );

        }


        /*
         * Suche.
         */

        const query =
            state.searchQuery
                .trim()
                .toLowerCase();


        if (
            query
        ) {

            apps =
                apps.filter(
                    app => {

                        if (
                            !app
                        ) {

                            return false;

                        }


                        const keywords =
                            Array.isArray(
                                app.keywords
                            )
                                ? app.keywords
                                : [];


                        const content =
                            [

                                app.id,

                                app.name,

                                app.title,

                                app.description,

                                app.category,

                                ...keywords

                            ]
                            .filter(
                                value =>
                                    value !==
                                    null &&
                                    value !==
                                    undefined
                            )
                            .join(
                                " "
                            )
                            .toLowerCase();


                        return content.includes(
                            query
                        );

                    }
                );

        }


        return apps.slice(
            0,
            CONFIG.maxVisibleApps
        );

    }


    /* ========================================================
       18 — ENDE TEIL 1
       ======================================================== */
    /* ========================================================
       19 — APP SUCHEN
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


        const manager =
            getAppManager();


        if (
            manager &&
            typeof manager.search ===
            "function"
        ) {

            const results =
                manager.search(
                    text
                );


            if (
                Array.isArray(
                    results
                )
            ) {

                return results.slice(
                    0,
                    CONFIG.maxVisibleApps
                );

            }

        }


        state.searchQuery =
            text;


        return getVisibleApps();

    }


    /* ========================================================
       20 — APP ÖFFNEN
       ======================================================== */

    async function openApp(
        appId,
        options = {}
    ) {

        const normalized =
            normalizeAppId(
                appId
            );


        if (
            !normalized
        ) {

            return {

                success:
                    false,

                status:
                    "invalid-app",

                error:
                    "Keine gültige App-ID."

            };

        }


        const app =
            getApp(
                normalized
            );


        if (
            !app
        ) {

            const result = {

                success:
                    false,

                status:
                    "not-found",

                appId:
                    normalized,

                error:
                    "Die angeforderte App wurde nicht gefunden."

            };


            state.lastError =
                result.error;


            emit(
                "launcher-error",
                result
            );


            return result;

        }


        state.selectedApp =
            normalized;


        state.lastAction =
            "open-app";


        emit(
            "app-opening",
            {

                app,

                appId:
                    normalized,

                options

            }
        );


        /*
         * Router bevorzugen.
         *
         * Der Router ist für Navigation
         * zuständig.
         */

        const router =
            getAppRouter();


        if (
            router
        ) {

            try {

                if (
                    typeof router.goToApp ===
                    "function"
                ) {

                    const result =
                        await router.goToApp(
                            normalized,
                            options
                        );


                    if (
                        result &&
                        result.success ===
                        false
                    ) {

                        state.lastError =
                            result.error ||
                            "Die App konnte nicht geöffnet werden.";

                    }
                    else {

                        state.launchCount++;

                    }


                    emit(
                        "app-opened",
                        {

                            app,

                            result,

                            via:
                                "router"

                        }
                    );


                    return (
                        result || {

                            success:
                                true,

                            status:
                                "navigated",

                            app

                        }
                    );

                }


                if (
                    typeof router.navigateToApp ===
                    "function"
                ) {

                    const result =
                        await router.navigateToApp(
                            normalized,
                            options
                        );


                    if (
                        result &&
                        result.success ===
                        false
                    ) {

                        state.lastError =
                            result.error ||
                            "Die App konnte nicht geöffnet werden.";

                    }
                    else {

                        state.launchCount++;

                    }


                    emit(
                        "app-opened",
                        {

                            app,

                            result,

                            via:
                                "router"

                        }
                    );


                    return (
                        result || {

                            success:
                                true,

                            status:
                                "navigated",

                            app

                        }
                    );

                }


                if (
                    typeof router.navigate ===
                    "function"
                ) {

                    const route =
                        typeof router.createAppRoute ===
                        "function"

                            ? router.createAppRoute(
                                normalized,
                                options
                            )

                            : (
                                "#/app/" +
                                normalized
                            );


                    const result =
                        await router.navigate(
                            route,
                            options
                        );


                    if (
                        result &&
                        result.success ===
                        false
                    ) {

                        state.lastError =
                            result.error ||
                            "Die App konnte nicht geöffnet werden.";

                    }
                    else {

                        state.launchCount++;

                    }


                    emit(
                        "app-opened",
                        {

                            app,

                            result,

                            via:
                                "router"

                        }
                    );


                    return (
                        result || {

                            success:
                                true,

                            status:
                                "navigated",

                            app

                        }
                    );

                }

            }
            catch (
                error
            ) {

                const message =
                    error &&
                    error.message
                        ? error.message
                        : String(
                            error
                        );


                state.lastError =
                    message;


                emit(
                    "launcher-error",
                    {

                        app,

                        error:
                            message

                    }
                );


                return {

                    success:
                        false,

                    status:
                        "router-error",

                    app,

                    error:
                        message

                };

            }

        }


        /*
         * Fallback:
         *
         * Wenn der Router noch nicht verfügbar
         * ist, benutzen wir den App Manager.
         */

        const manager =
            getAppManager();


        if (
            manager &&
            typeof manager.openApp ===
            "function"
        ) {

            try {

                const result =
                    await manager.openApp(
                        normalized
                    );


                if (
                    result &&
                    result.success ===
                    false
                ) {

                    state.lastError =
                        result.error ||
                        "Die App konnte nicht geöffnet werden.";

                }
                else {

                    state.launchCount++;

                }


                emit(
                    "app-opened",
                    {

                        app,

                        result,

                        via:
                            "manager"

                    }
                );


                return (
                    result || {

                        success:
                            true,

                        status:
                            "running",

                        app

                    }
                );

            }
            catch (
                error
            ) {

                const message =
                    error &&
                    error.message
                        ? error.message
                        : String(
                            error
                        );


                state.lastError =
                    message;


                emit(
                    "launcher-error",
                    {

                        app,

                        error:
                            message

                    }
                );


                return {

                    success:
                        false,

                    status:
                        "manager-error",

                    app,

                    error:
                        message

                };

            }

        }


        const result = {

            success:
                false,

            status:
                "not-ready",

            app,

            error:
                "App Manager und App Router sind noch nicht verfügbar."

        };


        state.lastError =
            result.error;


        emit(
            "launcher-error",
            result
        );


        return result;

    }


    /* ========================================================
       21 — HOME ÖFFNEN
       ======================================================== */

    async function openHome(
        options = {}
    ) {

        state.selectedApp =
            null;


        state.currentView =
            "all";


        state.currentCategory =
            null;


        state.searchQuery =
            "";


        state.lastAction =
            "open-home";


        const router =
            getAppRouter();


        emit(
            "home-opening",
            {

                options

            }
        );


        if (
            router
        ) {

            try {

                if (
                    typeof router.goHome ===
                    "function"
                ) {

                    const result =
                        await router.goHome(
                            options
                        );


                    emit(
                        "home-opened",
                        {

                            result,

                            via:
                                "router"

                        }
                    );


                    return (
                        result || {

                            success:
                                true,

                            status:
                                "home"

                        }
                    );

                }


                if (
                    typeof router.home ===
                    "function"
                ) {

                    const result =
                        await router.home(
                            options
                        );


                    emit(
                        "home-opened",
                        {

                            result,

                            via:
                                "router"

                        }
                    );


                    return (
                        result || {

                            success:
                                true,

                            status:
                                "home"

                        }
                    );

                }


                if (
                    typeof router.navigate ===
                    "function"
                ) {

                    const result =
                        await router.navigate(
                            "#/home",
                            options
                        );


                    emit(
                        "home-opened",
                        {

                            result,

                            via:
                                "router"

                        }
                    );


                    return (
                        result || {

                            success:
                                true,

                            status:
                                "home"

                        }
                    );

                }

            }
            catch (
                error
            ) {

                const message =
                    error &&
                    error.message
                        ? error.message
                        : String(
                            error
                        );


                state.lastError =
                    message;


                emit(
                    "launcher-error",
                    {

                        error:
                            message,

                        action:
                            "home"

                    }
                );


                return {

                    success:
                        false,

                    status:
                        "router-error",

                    error:
                        message

                };

            }

        }


        /*
         * Wenn der Router noch nicht bereit ist,
         * bleibt der Launcher trotzdem funktionsfähig.
         */

        emit(
            "home-opened",
            {

                via:
                    "launcher",

                fallback:
                    true

            }
        );


        return {

            success:
                true,

            status:
                "home",

            fallback:
                true

        };

    }


    /* ========================================================
       22 — FAVORIT UMSCHALTEN
       ======================================================== */

    function toggleFavorite(
        appId
    ) {

        const manager =
            getAppManager();


        if (
            !manager
        ) {

            return {

                success:
                    false,

                error:
                    "App Manager ist nicht verfügbar."

            };

        }


        if (
            typeof manager.toggleFavorite !==
            "function"
        ) {

            return {

                success:
                    false,

                error:
                    "Die Favoriten-Funktion ist nicht verfügbar."

            };

        }


        const result =
            manager.toggleFavorite(
                appId
            );


        if (
            result &&
            result.success
        ) {

            state.lastAction =
                "toggle-favorite";


            emit(
                "favorite-changed",
                result
            );


            render();

        }


        return result;

    }


    /* ========================================================
       23 — FAVORIT SETZEN
       ======================================================== */

    function setFavorite(
        appId,
        favorite = true
    ) {

        const manager =
            getAppManager();


        if (
            !manager
        ) {

            return {

                success:
                    false,

                error:
                    "App Manager ist nicht verfügbar."

            };

        }


        if (
            typeof manager.setFavorite !==
            "function"
        ) {

            return {

                success:
                    false,

                error:
                    "Die Favoriten-Funktion ist nicht verfügbar."

            };

        }


        const result =
            manager.setFavorite(
                appId,
                favorite
            );


        if (
            result &&
            result.success
        ) {

            state.lastAction =
                "set-favorite";


            emit(
                "favorite-changed",
                result
            );


            render();

        }


        return result;

    }


    /* ========================================================
       24 — KATEGORIE AUSWÄHLEN
       ======================================================== */

    function selectCategory(
        category
    ) {

        const value =
            String(
                category ||
                ""
            )
            .trim();


        if (
            !value
        ) {

            state.currentCategory =
                null;

            state.currentView =
                "all";

        }
        else {

            state.currentCategory =
                value;

            state.currentView =
                "category";

        }


        state.lastAction =
            "select-category";


        emit(
            "category-changed",
            {

                category:
                    state.currentCategory

            }
        );


        render();


        return getVisibleApps();

    }


    /* ========================================================
       25 — FAVORITEN-ANSICHT
       ======================================================== */

    function showFavorites() {

        state.currentView =
            "favorites";


        state.currentCategory =
            null;


        state.lastAction =
            "show-favorites";


        emit(
            "view-changed",
            {

                view:
                    "favorites"

            }
        );


        render();


        return getVisibleApps();

    }


    /* ========================================================
       26 — ALLE APPS ANZEIGEN
       ======================================================== */

    function showAllApps() {

        state.currentView =
            "all";


        state.currentCategory =
            null;


        state.lastAction =
            "show-all";


        emit(
            "view-changed",
            {

                view:
                    "all"

            }
        );


        render();


        return getVisibleApps();

    }


    /* ========================================================
       27 — SUCHE SETZEN
       ======================================================== */

    function setSearch(
        query
    ) {

        state.searchQuery =
            String(
                query ||
                ""
            )
            .trim();


        state.lastAction =
            "search";


        emit(
            "search-changed",
            {

                query:
                    state.searchQuery

            }
        );


        render();


        return getVisibleApps();

    }


    /* ========================================================
       28 — SUCHE LÖSCHEN
       ======================================================== */

    function clearSearch() {

        return setSearch(
            ""
        );

    }


    /* ========================================================
       29 — APP AUSWAHL
       ======================================================== */

    function selectApp(
        appId
    ) {

        const normalized =
            normalizeAppId(
                appId
            );


        const app =
            getApp(
                normalized
            );


        if (
            !app
        ) {

            state.selectedApp =
                null;


            return null;

        }


        state.selectedApp =
            normalized;


        emit(
            "app-selected",
            {

                app

            }
        );


        return app;

    }


    /* ========================================================
       30 — ENDE TEIL 2
       ======================================================== */
    /* ========================================================
       21 — HASH ROUTE LESEN
       ======================================================== */

    function getHashRoute() {

        const hash =
            String(
                window.location.hash ||
                ""
            ).trim();


        if (
            !hash
        ) {

            return CONFIG.homeRoute;

        }


        return normalizeRoute(
            hash
        );

    }


    /* ========================================================
       22 — ROUTE IN BROWSER-HISTORY SCHREIBEN
       ======================================================== */

    function updateBrowserHistory(
        route,
        options = {}
    ) {

        const replace =
            options.replace === true;

        const url =
            window.location.pathname +
            window.location.search +
            route;


        try {

            if (
                replace
            ) {

                window.history.replaceState(
                    {
                        haldoRouter:
                            true,

                        route
                    },
                    "",
                    url
                );

            }
            else {

                window.history.pushState(
                    {
                        haldoRouter:
                            true,

                        route
                    },
                    "",
                    url
                );

            }

        }
        catch (
            error
        ) {

            /*
             * Fallback für Umgebungen,
             * in denen History API nicht
             * vollständig verfügbar ist.
             */

            try {

                window.location.hash =
                    route.replace(
                        /^#/,
                        ""
                    );

            }
            catch (
                fallbackError
            ) {

                state.lastError =
                    fallbackError.message;

            }

        }

    }


    /* ========================================================
       23 — ROUTE HISTORY SPEICHERN
       ======================================================== */

    function addRouteHistory(
        route
    ) {

        routeHistory.push(
            route
        );


        while (
            routeHistory.length >
            CONFIG.maxHistoryEntries
        ) {

            routeHistory.shift();

        }


        state.historyCount =
            routeHistory.length;

    }


    /* ========================================================
       24 — APP AUS ROUTE LADEN
       ======================================================== */

    async function openRouteApp(
        parsedRoute
    ) {

        const manager =
            getAppManager();


        if (
            !manager
        ) {

            return {

                success:
                    false,

                status:
                    "manager-unavailable",

                error:
                    "HalDoAppManager ist nicht verfügbar."

            };

        }


        if (
            typeof manager.openApp !==
            "function"
        ) {

            return {

                success:
                    false,

                status:
                    "manager-invalid",

                error:
                    "HalDoAppManager.openApp() fehlt."

            };

        }


        const app =
            typeof manager.getApp ===
            "function"
                ? manager.getApp(
                    parsedRoute.appId
                )
                : null;


        if (
            !app
        ) {

            return {

                success:
                    false,

                status:
                    "app-not-found",

                appId:
                    parsedRoute.appId,

                error:
                    `App "${parsedRoute.appId}" ist nicht registriert.`

            };

        }


        emit(
            "before-app-navigation",
            {

                route:
                    parsedRoute.route,

                app,

                params:
                    parsedRoute.params,

                query:
                    parsedRoute.query

            }
        );


        const result =
            await manager.openApp(
                parsedRoute.appId
            );


        if (
            !result ||
            result.success !== true
        ) {

            return {

                success:
                    false,

                status:
                    "app-open-failed",

                app,

                result,

                error:
                    result &&
                    result.error
                        ? result.error
                        : "App konnte nicht geöffnet werden."

            };

        }


        return {

            success:
                true,

            status:
                "app-opened",

            app,

            result,

            params:
                parsedRoute.params,

            query:
                parsedRoute.query

        };

    }


    /* ========================================================
       25 — HOME ÖFFNEN
       ======================================================== */

    async function openHome(
        options = {}
    ) {

        const route =
            CONFIG.homeRoute;


        const previousRoute =
            state.currentRoute;


        state.previousRoute =
            previousRoute;


        state.previousApp =
            state.currentApp;


        const manager =
            getAppManager();


        /*
         * Aktive App sauber schließen.
         */

        if (
            manager &&
            typeof manager.getActiveApp ===
            "function" &&
            typeof manager.stopApp ===
            "function"
        ) {

            const activeApp =
                manager.getActiveApp();


            if (
                activeApp &&
                activeApp.id
            ) {

                try {

                    await manager.stopApp(
                        activeApp.id
                    );

                }
                catch (
                    error
                ) {

                    log(
                        `Fehler beim Schließen der App: ${error.message}`,
                        "warning"
                    );

                }

            }

        }


        state.currentRoute =
            route;

        state.currentApp =
            null;

        state.navigationCount++;


        if (
            options.history !==
            false
        ) {

            updateBrowserHistory(
                route,
                {
                    replace:
                        options.replace ===
                        true
                }
            );

        }


        if (
            options.record !==
            false
        ) {

            addRouteHistory(
                route
            );

        }


        const detail = {

            route,

            previousRoute,

            app:
                null,

            type:
                "home"

        };


        emit(
            "route-changing",
            detail
        );


        emit(
            "home-opened",
            detail
        );


        emit(
            "route-changed",
            detail
        );


        return {

            success:
                true,

            status:
                "home",

            route,

            app:
                null

        };

    }


    /* ========================================================
       26 — ROUTE NAVIGIEREN
       ======================================================== */

    async function navigate(
        route,
        options = {}
    ) {

        const normalized =
            normalizeRoute(
                route
            );


        const parsed =
            parseRoute(
                normalized
            );


        state.lastError =
            null;


        /*
         * Unbekannte Route
         */

        if (
            parsed.type ===
            "unknown"
        ) {

            state.lastError =
                `Unbekannte Route: ${normalized}`;


            emit(
                "route-error",
                {

                    route:
                        normalized,

                    error:
                        state.lastError

                }
            );


            return {

                success:
                    false,

                status:
                    "unknown-route",

                route:
                    normalized,

                error:
                    state.lastError

            };

        }


        /*
         * Gleiche Route nicht
         * unnötig erneut laden.
         */

        if (
            normalized ===
            state.currentRoute &&
            options.force !== true
        ) {

            return {

                success:
                    true,

                status:
                    "already-active",

                route:
                    normalized,

                app:
                    state.currentApp

            };

        }


        const previousRoute =
            state.currentRoute;


        const previousApp =
            state.currentApp;


        emit(
            "route-changing",
            {

                route:
                    normalized,

                previousRoute,

                previousApp,

                parsed

            }
        );


        /*
         * HOME
         */

        if (
            parsed.type ===
            "home"
        ) {

            return openHome(
                {
                    ...options,
                    history:
                        options.history !==
                        false
                }
            );

        }


        /*
         * APP
         */

        if (
            parsed.type ===
            "app"
        ) {

            const result =
                await openRouteApp(
                    parsed
                );


            if (
                !result.success
            ) {

                state.lastError =
                    result.error;


                emit(
                    "route-error",
                    {

                        route:
                            normalized,

                        parsed,

                        error:
                            result.error,

                        result

                    }
                );


                return result;

            }


            state.previousRoute =
                previousRoute;


            state.previousApp =
                previousApp;


            state.currentRoute =
                normalized;


            state.currentApp =
                result.app;


            state.navigationCount++;


            if (
                options.history !==
                false
            ) {

                updateBrowserHistory(
                    normalized,
                    {
                        replace:
                            options.replace ===
                            true
                    }
                );

            }


            if (
                options.record !==
                false
            ) {

                addRouteHistory(
                    normalized
                );

            }


            const detail = {

                route:
                    normalized,

                previousRoute,

                app:
                    result.app,

                previousApp,

                params:
                    parsed.params,

                query:
                    parsed.query,

                result

            };


            emit(
                "app-opened",
                detail
            );


            emit(
                "route-changed",
                detail
            );


            return {

                success:
                    true,

                status:
                    "navigated",

                route:
                    normalized,

                app:
                    result.app,

                params:
                    parsed.params,

                query:
                    parsed.query

            };

        }


        return {

            success:
                false,

            status:
                "navigation-failed",

            error:
                "Navigation konnte nicht durchgeführt werden."

        };

    }


    /* ========================================================
       27 — APP NAVIGIEREN
       ======================================================== */

    async function navigateToApp(
        appId,
        options = {}
    ) {

        const route =
            createAppRoute(
                appId,
                options
            );


        return navigate(
            route,
            options
        );

    }


    /* ========================================================
       28 — ROUTE WECHSELN OHNE HISTORY
       ======================================================== */

    async function replace(
        route,
        options = {}
    ) {

        return navigate(
            route,
            {
                ...options,

                replace:
                    true

            }
        );

    }


    /* ========================================================
       29 — HOME
       ======================================================== */

    async function home(
        options = {}
    ) {

        return openHome(
            options
        );

    }


    /* ========================================================
       30 — ZURÜCK
       ======================================================== */

    function back() {

        try {

            window.history.back();


            emit(
                "router-back",
                {

                    route:
                        state.currentRoute

                }
            );


            return {

                success:
                    true,

                status:
                    "history-back"

            };

        }
        catch (
            error
        ) {

            state.lastError =
                error.message;


            return {

                success:
                    false,

                error:
                    error.message

            };

        }

    }


    /* ========================================================
       31 — VORWÄRTS
       ======================================================== */

    function forward() {

        try {

            window.history.forward();


            emit(
                "router-forward",
                {

                    route:
                        state.currentRoute

                }
            );


            return {

                success:
                    true,

                status:
                    "history-forward"

            };

        }
        catch (
            error
        ) {

            state.lastError =
                error.message;


            return {

                success:
                    false,

                error:
                    error.message

            };

        }

    }


    /* ========================================================
       32 — ROUTE HISTORY ZURÜCKSETZEN
       ======================================================== */

    function clearRouteHistory() {

        routeHistory.length =
            0;


        state.historyCount =
            0;


        return true;

    }


    /* ========================================================
       33 — ROUTE HISTORY AUSLESEN
       ======================================================== */

    function getRouteHistory() {

        return [
            ...routeHistory
        ];

    }


    /* ========================================================
       34 — ROUTE SUCHEN
       ======================================================== */

    function searchRoutes(
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

            return [];

        }


        const registry =
            getAppRegistry();


        if (
            !registry
        ) {

            return [];

        }


        let apps = [];


        try {

            if (
                typeof registry.getAllApps ===
                "function"
            ) {

                apps =
                    registry.getAllApps();

            }
            else if (
                typeof registry.getAll ===
                "function"
            ) {

                apps =
                    registry.getAll();

            }
            else if (
                Array.isArray(
                    registry.definitions
                )
            ) {

                apps = [
                    ...registry.definitions
                ];

            }

        }
        catch (
            error
        ) {

            log(
                `Routensuche fehlgeschlagen: ${error.message}`,
                "warning"
            );

        }


        if (
            !Array.isArray(
                apps
            )
        ) {

            return [];

        }


        return apps
            .filter(
                app => {

                    if (
                        !app ||
                        !app.id
                    ) {

                        return false;

                    }


                    const content =
                        [

                            app.id,

                            app.name,

                            app.title,

                            app.description,

                            app.category,

                            ...(Array.isArray(
                                app.keywords
                            )
                                ? app.keywords
                                : [])

                        ]
                        .join(
                            " "
                        )
                        .toLowerCase();


                    return content.includes(
                        text
                    );

                }
            )
            .map(
                app => ({

                    app,

                    route:
                        createAppRoute(
                            app.id
                        )

                })
            );

    }


    /* ========================================================
       35 — ROUTE AKTUALISIEREN
       ======================================================== */

    async function reload() {

        const route =
            state.currentRoute;


        return navigate(
            route,
            {
                force:
                    true,

                history:
                    false,

                record:
                    false

            }
        );

    }


    /* ========================================================
       36 — HASH-ÄNDERUNG
       ======================================================== */

    async function handleHashChange() {

        const route =
            getHashRoute();


        /*
         * Wenn History API die URL
         * verändert hat, synchronisieren
         * wir den Router trotzdem.
         */

        if (
            route ===
            state.currentRoute
        ) {

            return;

        }


        await navigate(
            route,
            {
                history:
                    false,

                record:
                    true

            }
        );

    }


    /* ========================================================
       37 — POPSTATE
       ======================================================== */

    async function handlePopState(
        event
    ) {

        const route =
            event &&
            event.state &&
            event.state.haldoRouter
                ? normalizeRoute(
                    event.state.route
                )
                : getHashRoute();


        await navigate(
            route,
            {
                history:
                    false,

                record:
                    true

            }
        );

    }


    /* ========================================================
       38 — INITIAL ROUTE
       ======================================================== */

    async function initializeRoute() {

        const hash =
            String(
                window.location.hash ||
                ""
            ).trim();


        if (
            hash
        ) {

            return navigate(
                hash,
                {
                    history:
                        false,

                    record:
                        true,

                    force:
                        true

                }
            );

        }


        return openHome(
            {
                history:
                    true,

                replace:
                    true,

                record:
                    true

            }
        );

    }


    /* ========================================================
       39 — ABHÄNGIGKEITEN PRÜFEN
       ======================================================== */

    function checkDependencies() {

        state.managerReady =
            isManagerReady();


        state.registryReady =
            isRegistryReady();


        return {

            managerReady:
                state.managerReady,

            registryReady:
                state.registryReady,

            ready:
                state.managerReady &&
                state.registryReady

        };

    }


    /* ========================================================
       40 — INITIALISIERUNG
       ======================================================== */

    async function init() {

        if (
            state.initialized
        ) {

            return getState();

        }


        state.startTime =
            Date.now();


        const dependencies =
            checkDependencies();


        if (
            !dependencies.managerReady
        ) {

            state.lastError =
                "HalDoAppManager ist noch nicht verfügbar.";


            log(
                state.lastError,
                "warning"
            );


            return {

                initialized:
                    false,

                ready:
                    false,

                error:
                    state.lastError

            };

        }


        if (
            !dependencies.registryReady
        ) {

            state.lastError =
                "HalDoAppRegistry ist noch nicht verfügbar.";


            log(
                state.lastError,
                "warning"
            );


            return {

                initialized:
                    false,

                ready:
                    false,

                error:
                    state.lastError

            };

        }


        state.initialized =
            true;


        state.ready =
            true;


        /*
         * Kernel-Verbindung.
         */

        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.registerModule ===
            "function"
        ) {

            window.HalDoKernel.registerModule(
                "app-router",
                api
            );


            if (
                typeof window.HalDoKernel.setModuleReady ===
                "function"
            ) {

                window.HalDoKernel.setModuleReady(
                    "app-router",
                    true
                );

            }

        }


        /*
         * System-Verbindung.
         */

        if (
            window.HalDoSystem &&
            typeof window.HalDoSystem.registerService ===
            "function"
        ) {

            window.HalDoSystem.registerService(
                "app-router",
                api
            );

        }


        /*
         * App Manager Events.
         */

        const manager =
            getAppManager();


        if (
            manager &&
            typeof manager.on ===
            "function"
        ) {

            manager.on(
                "app-opened",
                data => {

                    if (
                        data &&
                        data.app &&
                        data.app.id
                    ) {

                        state.currentApp =
                            data.app;

                    }

                }
            );


            manager.on(
                "app-stopped",
                data => {

                    if (
                        data &&
                        data.app &&
                        state.currentApp &&
                        data.app.id ===
                        state.currentApp.id
                    ) {

                        state.currentApp =
                            null;

                    }

                }
            );

        }


        window.addEventListener(
            "hashchange",
            handleHashChange
        );


        window.addEventListener(
            "popstate",
            handlePopState
        );


        emit(
            "ready",
            getState()
        );


        window.dispatchEvent(
            new CustomEvent(
                "haldo:app-router-ready",
                {

                    detail:
                        getState()

                }
            )
        );


        if (
            CONFIG.startupDelay >
            0
        ) {

            await new Promise(
                resolve =>
                    window.setTimeout(
                        resolve,
                        CONFIG.startupDelay
                    )
            );

        }


        await initializeRoute();


        log(
            "App Router ist bereit."
        );


        return getState();

    }


    /* ========================================================
       41 — STATUS
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            managerReady:
                isManagerReady(),

            registryReady:
                isRegistryReady(),

            currentRoute:
                state.currentRoute,

            previousRoute:
                state.previousRoute,

            currentApp:
                state.currentApp,

            previousApp:
                state.previousApp,

            navigationCount:
                state.navigationCount,

            historyCount:
                state.historyCount,

            lastError:
                state.lastError,

            startTime:
                state.startTime

        };

    }


    /* ========================================================
       42 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            state:
                getState(),

            currentRoute:
                getCurrentRoute(),

            currentApp:
                getCurrentApp(),

            routeHistory:
                getRouteHistory(),

            dependencies:
                checkDependencies()

        };

    }


    /* ========================================================
       43 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,


        init,

        on,

        off,


        normalizeAppId,

        normalizeRoute,

        parseRoute,


        createAppRoute,

        isHomeRoute,

        isAppRoute,

        getAppIdFromRoute,


        getCurrentRoute,

        getCurrentApp,


        navigate,

        navigateToApp,

        replace,

        home,


        back,

        forward,


        reload,


        searchRoutes,


        clearRouteHistory,

        getRouteHistory,


        getHashRoute,


        getState,

        diagnose

    };


    /* ========================================================
       44 — GLOBALE API
       ======================================================== */

    window.HalDoAppRouter =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appRouter =
        api;


    /* ========================================================
       45 — BOOT
       ======================================================== */

    function boot() {

        if (
            isManagerReady() &&
            isRegistryReady()
        ) {

            init();

            return;

        }


        let attempts =
            0;


        const maxAttempts =
            CONFIG.moduleWaitAttempts;


        const timer =
            window.setInterval(
                function () {

                    attempts++;


                    if (
                        isManagerReady() &&
                        isRegistryReady()
                    ) {

                        window.clearInterval(
                            timer
                        );


                        init();


                        return;

                    }


                    if (
                        attempts >=
                        maxAttempts
                    ) {

                        window.clearInterval(
                            timer
                        );


                        state.lastError =
                            "App Manager oder App Registry konnte beim Start nicht gefunden werden.";


                        log(
                            state.lastError,
                            "error"
                        );

                    }

                },
                CONFIG.moduleWaitInterval
            );

    }


    /* ========================================================
       46 — DOM START
       ======================================================== */

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
   ENDE — HALDO AI OS 18 APP ROUTER
   ============================================================ */