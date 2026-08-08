/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/app-manager.js

   Aufgabe:
   - Zentrale App-Verwaltung
   - Verbindung mit config/apps.js
   - Apps suchen
   - Apps aktivieren/deaktivieren
   - Favoriten
   - Kategorien
   - App-Status
   - sichere Kommunikation mit Launcher und Router

   WICHTIG:
   Diese Datei enthält KEINE eigene App-Liste.

   Quelle der Apps:
   config/apps.js
   → window.HalDoAppRegistry
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const CONFIG = {

        name:
            "HalDo App Manager",

        version:
            "18.0.0"

    };


    /* ========================================================
       02 — STATUS
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        appsLoaded:
            false,

        appCount:
            0,

        lastAction:
            null,

        lastApp:
            null

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
       05 — REGISTRY
       ======================================================== */

    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            null
        );

    }


    /* ========================================================
       06 — REGISTRY PRÜFEN
       ======================================================== */

    function registryAvailable() {

        const registry =
            getRegistry();


        return Boolean(
            registry &&
            typeof registry.getAllApps ===
                "function"
        );

    }


    /* ========================================================
       07 — APPS LADEN
       ======================================================== */

    function loadApps() {

        const registry =
            getRegistry();


        if (
            !registryAvailable()
        ) {

            state.appsLoaded =
                false;


            state.appCount =
                0;


            log(
                "HalDoAppRegistry wurde noch nicht geladen.",
                "warning"
            );


            return [];

        }


        let apps =
            registry.getAllApps();


        if (
            !Array.isArray(
                apps
            )
        ) {

            apps =
                [];

        }


        /*
         * Nur gültige Apps akzeptieren.
         */

        apps =
            apps.filter(
                app =>
                    app &&
                    typeof app.id ===
                        "string" &&
                    app.id.trim() !== ""
            );


        /*
         * Nach order sortieren.
         */

        apps.sort(
            (
                a,
                b
            ) => {

                const orderA =
                    Number.isFinite(
                        Number(
                            a.order
                        )
                    )
                        ? Number(
                            a.order
                        )
                        : 999999;


                const orderB =
                    Number.isFinite(
                        Number(
                            b.order
                        )
                    )
                        ? Number(
                            b.order
                        )
                        : 999999;


                return (
                    orderA -
                    orderB
                );

            }
        );


        state.appsLoaded =
            true;


        state.appCount =
            apps.length;


        emit(
            "apps:loaded",
            {
                apps,
                count:
                    apps.length
            }
        );


        return apps;

    }


    /* ========================================================
       08 — ALLE APPS
       ======================================================== */

    function getAllApps() {

        if (
            !registryAvailable()
        ) {

            return [];

        }


        const apps =
            loadApps();


        return apps;

    }


    /* ========================================================
       09 — EINZELNE APP
       ======================================================== */

    function getApp(
        appId
    ) {

        const registry =
            getRegistry();


        if (
            !registry ||
            typeof registry.getApp !==
                "function"
        ) {

            return null;

        }


        return registry.getApp(
            appId
        );

    }


    /* ========================================================
       10 — APP EXISTIERT?
       ======================================================== */

    function hasApp(
        appId
    ) {

        return Boolean(
            getApp(
                appId
            )
        );

    }


    /* ========================================================
       11 — AKTIVE APPS
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
       12 — DEAKTIVIERTE APPS
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
       14 — KATEGORIEN
       ======================================================== */

    function getCategories() {

        const registry =
            getRegistry();


        if (
            !registry ||
            typeof registry.getCategories !==
                "function"
        ) {

            return [];

        }


        return registry.getCategories();

    }


    /* ========================================================
       15 — APPS NACH KATEGORIE
       ======================================================== */

    function getAppsByCategory(
        category
    ) {

        const registry =
            getRegistry();


        if (
            !registry ||
            typeof registry.getAppsByCategory !==
                "function"
        ) {

            return [];

        }


        return registry.getAppsByCategory(
            category
        );

    }


    /* ========================================================
       16 — APP SUCHEN
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
       17 — FAVORIT UMSCHALTEN
       ======================================================== */

    function toggleFavorite(
        appId
    ) {

        const app =
            getApp(
                appId
            );


        if (
            !app
        ) {

            log(
                `App nicht gefunden: ${appId}`,
                "warning"
            );


            return false;

        }


        /*
         * Da apps.js die zentrale Registry ist,
         * müssen wir eine veränderbare Laufzeitkopie
         * im Manager führen.
         */

        const runtimeApp =
            getRuntimeApp(
                app.id
            );


        if (
            !runtimeApp
        ) {

            return false;

        }


        runtimeApp.favorite =
            runtimeApp.favorite !==
            true;


        state.lastAction =
            "favorite";


        state.lastApp =
            runtimeApp.id;


        emit(
            "app:favorite",
            {
                app:
                    {
                        ...runtimeApp
                    },

                favorite:
                    runtimeApp.favorite
            }
        );


        return runtimeApp.favorite;

    }


    /* ========================================================
       18 — RUNTIME APPS
       ======================================================== */

    const runtimeApps =
        new Map();


    function initializeRuntimeApps() {

        const apps =
            getAllApps();


        runtimeApps.clear();


        apps.forEach(
            app => {

                runtimeApps.set(
                    app.id,
                    {
                        ...app,

                        keywords:
                            [
                                ...(app.keywords || [])
                            ]
                    }
                );

            }
        );


        return true;

    }


    /* ========================================================
       19 — RUNTIME APP
       ======================================================== */

    function getRuntimeApp(
        appId
    ) {

        const id =
            String(
                appId ||
                ""
            )
            .trim()
            .toLowerCase();


        return (
            runtimeApps.get(
                id
            ) ||
            null
        );

    }


    /* ========================================================
       20 — ALLE RUNTIME APPS
       ======================================================== */

    function getRuntimeApps() {

        return Array.from(
            runtimeApps.values()
        )
        .map(
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
       21 — RUNTIME APP LADEN
       ======================================================== */

    function ensureRuntimeApps() {

        if (
            runtimeApps.size ===
            0
        ) {

            initializeRuntimeApps();

        }

    }


    /* ========================================================
       22 — RUNTIME APP AKTUALISIEREN
       ======================================================== */

    function updateRuntimeApp(
        appId,
        changes
    ) {

        ensureRuntimeApps();


        const app =
            getRuntimeApp(
                appId
            );


        if (
            !app
        ) {

            return false;

        }


        if (
            !changes ||
            typeof changes !==
                "object"
        ) {

            return false;

        }


        Object.assign(
            app,
            changes
        );


        state.lastAction =
            "update";


        state.lastApp =
            app.id;


        emit(
            "app:updated",
            {
                app:
                    {
                        ...app
                    }
            }
        );


        return true;

    }


    /* ========================================================
       23 — APP AKTIVIEREN
       ======================================================== */

    function enableApp(
        appId
    ) {

        const success =
            updateRuntimeApp(
                appId,
                {
                    enabled:
                        true
                }
            );


        if (
            success
        ) {

            emit(
                "app:enabled",
                {
                    appId
                }
            );

        }


        return success;

    }


    /* ========================================================
       24 — APP DEAKTIVIEREN
       ======================================================== */

    function disableApp(
        appId
    ) {

        const success =
            updateRuntimeApp(
                appId,
                {
                    enabled:
                        false
                }
            );


        if (
            success
        ) {

            emit(
                "app:disabled",
                {
                    appId
                }
            );

        }


        return success;

    }


    /* ========================================================
       25 — RUNTIME APP ABRUFEN
       ======================================================== */

    function getManagedApp(
        appId
    ) {

        ensureRuntimeApps();


        const app =
            getRuntimeApp(
                appId
            );


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
       26 — MANAGED APPS
       ======================================================== */

    function getManagedApps() {

        ensureRuntimeApps();


        return getRuntimeApps();

    }


    /* ========================================================
       27 — APP STATUS
       ======================================================== */

    function getAppStatus(
        appId
    ) {

        const app =
            getManagedApp(
                appId
            );


        if (
            !app
        ) {

            return {

                exists:
                    false,

                enabled:
                    false,

                favorite:
                    false

            };

        }


        return {

            exists:
                true,

            enabled:
                app.enabled !==
                false,

            favorite:
                app.favorite ===
                true,

            id:
                app.id,

            title:
                app.title,

            category:
                app.category

        };

    }


    /* ========================================================
       28 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        const registry =
            getRegistry();


        return {

            manager: {

                name:
                    CONFIG.name,

                version:
                    CONFIG.version,

                initialized:
                    state.initialized,

                ready:
                    state.ready,

                appsLoaded:
                    state.appsLoaded,

                appCount:
                    state.appCount,

                lastAction:
                    state.lastAction,

                lastApp:
                    state.lastApp

            },

            registry: {

                available:
                    Boolean(
                        registry
                    ),

                ready:
                    Boolean(
                        registry &&
                        registry.ready
                    )

            },

            runtime:

                {

                    count:
                        runtimeApps.size

                }

        };

    }


    /* ========================================================
       29 — STATE
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            appsLoaded:
                state.appsLoaded,

            appCount:
                state.appCount,

            lastAction:
                state.lastAction,

            lastApp:
                state.lastApp,

            runtimeAppCount:
                runtimeApps.size

        };

    }


    /* ========================================================
       30 — INITIALISIERUNG
       ======================================================== */

    function init() {

        if (
            state.initialized
        ) {

            return getState();

        }


        state.initialized =
            true;


        /*
         * Registry laden.
         */

        if (
            !registryAvailable()
        ) {

            log(
                "App Registry fehlt. Prüfe config/apps.js.",
                "error"
            );


            state.ready =
                false;


            return getState();

        }


        /*
         * Runtime-Kopie erstellen.
         */

        initializeRuntimeApps();


        state.appsLoaded =
            true;


        state.appCount =
            runtimeApps.size;


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
            `${state.appCount} Apps im App Manager verfügbar.`
        );


        return getState();

    }


    /* ========================================================
       31 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,


        init,


        on,

        off,

        emit,


        getAllApps,

        getApp,

        getManagedApp,

        getManagedApps,

        hasApp,


        getEnabledApps,

        getDisabledApps,

        getFavorites,


        getCategories,

        getAppsByCategory,


        searchApps,


        toggleFavorite,


        enableApp,

        disableApp,


        updateRuntimeApp,


        getAppStatus,


        diagnose,

        getState

    };


    /* ========================================================
       32 — GLOBAL
       ======================================================== */

    window.HalDoAppManager =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appManager =
        api;


    /* ========================================================
       33 — START
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


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 APP MANAGER
   ============================================================ */