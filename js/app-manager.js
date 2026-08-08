/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/app-manager.js

   AUFGABE:
   - Zentrale Verwaltung aller HalDo Apps
   - Nutzt ausschließlich HalDoAppRegistry
   - Keine zweite App-Liste
   - Apps suchen
   - Apps nach Kategorie filtern
   - Favoriten verwalten
   - Apps aktivieren/deaktivieren
   - App-Status verwalten
   - Sichere App-Öffnung vorbereiten
   - Keine 404 durch blindes Weiterleiten
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const CONFIG = {

        name:
            "HalDo AI OS App Manager",

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

        appCount:
            0,

        activeApp:
            null,

        lastOpenedApp:
            null,

        lastError:
            null

    };


    /* ========================================================
       03 — APP STATUS
       ======================================================== */

    const appStates =
        new Map();


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

        if (
            !listeners[eventName]
        ) {

            return;

        }


        listeners[eventName]
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
       05 — REGISTRY PRÜFEN
       ======================================================== */

    function getRegistry() {

        if (
            !window.HalDoAppRegistry
        ) {

            return null;

        }


        return window.HalDoAppRegistry;

    }


    function registryReady() {

        const registry =
            getRegistry();


        if (
            !registry
        ) {

            return false;

        }


        if (
            typeof registry.getAllApps !==
            "function"
        ) {

            return false;

        }


        return true;

    }


    /* ========================================================
       06 — APP HOLEN
       ======================================================== */

    function getApp(
        appId
    ) {

        const registry =
            getRegistry();


        if (
            !registry
        ) {

            return null;

        }


        if (
            typeof registry.findApp ===
            "function"
        ) {

            return registry.findApp(
                appId
            );

        }


        if (
            typeof registry.getApp ===
            "function"
        ) {

            return registry.getApp(
                appId
            );

        }


        return null;

    }


    /* ========================================================
       07 — ALLE APPS
       ======================================================== */

    function getAllApps() {

        const registry =
            getRegistry();


        if (
            !registry ||
            typeof registry.getAllApps !==
            "function"
        ) {

            return [];

        }


        return registry.getAllApps();

    }


    /* ========================================================
       08 — AKTIVE APPS
       ======================================================== */

    function getEnabledApps() {

        const registry =
            getRegistry();


        if (
            registry &&
            typeof registry.getEnabledApps ===
            "function"
        ) {

            return registry.getEnabledApps();

        }


        return getAllApps()
            .filter(
                app =>
                    app.enabled !==
                    false
            );

    }


    /* ========================================================
       09 — FAVORITEN
       ======================================================== */

    function getFavorites() {

        const registry =
            getRegistry();


        if (
            registry &&
            typeof registry.getFavorites ===
            "function"
        ) {

            return registry.getFavorites();

        }


        return getAllApps()
            .filter(
                app =>
                    app.favorite ===
                    true
            );

    }


    /* ========================================================
       10 — KATEGORIEN
       ======================================================== */

    function getCategories() {

        const registry =
            getRegistry();


        if (
            registry &&
            typeof registry.getCategories ===
            "function"
        ) {

            return registry.getCategories();

        }


        return [];

    }


    /* ========================================================
       11 — APPS NACH KATEGORIE
       ======================================================== */

    function getAppsByCategory(
        category
    ) {

        const registry =
            getRegistry();


        if (
            registry &&
            typeof registry.getAppsByCategory ===
            "function"
        ) {

            return registry.getAppsByCategory(
                category
            );

        }


        return getAllApps()
            .filter(
                app =>
                    app.category ===
                    category
            );

    }


    /* ========================================================
       12 — APP SUCHE
       ======================================================== */

    function search(
        query
    ) {

        const registry =
            getRegistry();


        if (
            registry &&
            typeof registry.searchApps ===
            "function"
        ) {

            return registry.searchApps(
                query
            );

        }


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

                    const content =
                        [

                            app.id,

                            app.name,

                            app.title,

                            app.description,

                            app.category,

                            ...(app.keywords || [])

                        ]
                        .join(
                            " "
                        )
                        .toLowerCase();


                    return content.includes(
                        text
                    );

                }
            );

    }


    /* ========================================================
       13 — APP-STATUS INITIALISIEREN
       ======================================================== */

    function initializeAppStates() {

        const apps =
            getAllApps();


        apps.forEach(
            app => {

                if (
                    !appStates.has(
                        app.id
                    )
                ) {

                    appStates.set(
                        app.id,
                        {

                            id:
                                app.id,

                            enabled:
                                app.enabled !==
                                false,

                            installed:
                                true,

                            loaded:
                                false,

                            running:
                                false,

                            error:
                                null

                        }
                    );

                }

            }
        );


        state.appCount =
            apps.length;

    }


    /* ========================================================
       14 — APP-STATUS
       ======================================================== */

    function getAppState(
        appId
    ) {

        const app =
            getApp(
                appId
            );


        if (
            !app
        ) {

            return null;

        }


        if (
            !appStates.has(
                app.id
            )
        ) {

            appStates.set(
                app.id,
                {

                    id:
                        app.id,

                    enabled:
                        app.enabled !==
                        false,

                    installed:
                        true,

                    loaded:
                        false,

                    running:
                        false,

                    error:
                        null

                }
            );

        }


        return {
            ...appStates.get(
                app.id
            )
        };

    }


    /* ========================================================
       15 — APP AKTIVIEREN
       ======================================================== */

    function enableApp(
        appId
    ) {

        const app =
            getApp(
                appId
            );


        if (
            !app
        ) {

            return {

                success:
                    false,

                error:
                    "App nicht gefunden."

            };

        }


        const current =
            getAppState(
                app.id
            );


        appStates.set(
            app.id,
            {

                ...current,

                enabled:
                    true,

                error:
                    null

            }
        );


        emit(
            "app-enabled",
            {
                app:
                    getAppState(
                        app.id
                    )
            }
        );


        return {

            success:
                true,

            app:
                getAppState(
                    app.id
                )

        };

    }


    /* ========================================================
       16 — APP DEAKTIVIEREN
       ======================================================== */

    function disableApp(
        appId
    ) {

        const app =
            getApp(
                appId
            );


        if (
            !app
        ) {

            return {

                success:
                    false,

                error:
                    "App nicht gefunden."

            };

        }


        const current =
            getAppState(
                app.id
            );


        appStates.set(
            app.id,
            {

                ...current,

                enabled:
                    false,

                running:
                    false

            }
        );


        if (
            state.activeApp ===
            app.id
        ) {

            state.activeApp =
                null;

        }


        emit(
            "app-disabled",
            {
                app:
                    getAppState(
                        app.id
                    )
            }
        );


        return {

            success:
                true,

            app:
                getAppState(
                    app.id
                )

        };

    }


    /* ========================================================
       17 — APP AKTIV?
       ======================================================== */

    function isAppEnabled(
        appId
    ) {

        const appState =
            getAppState(
                appId
            );


        if (
            !appState
        ) {

            return false;

        }


        return (
            appState.enabled ===
            true
        );

    }


    /* ========================================================
       18 — APP VORBEREITEN
       ======================================================== */

    function prepareApp(
        appId
    ) {

        const app =
            getApp(
                appId
            );


        if (
            !app
        ) {

            const result = {

                success:
                    false,

                status:
                    "not-found",

                error:
                    "Die angeforderte App ist nicht registriert.",

                appId:
                    appId

            };


            state.lastError =
                result.error;


            emit(
                "app-error",
                result
            );


            return result;

        }


        const appState =
            getAppState(
                app.id
            );


        if (
            !appState.enabled
        ) {

            const result = {

                success:
                    false,

                status:
                    "disabled",

                error:
                    "Diese App ist derzeit deaktiviert.",

                app

            };


            state.lastError =
                result.error;


            emit(
                "app-error",
                result
            );


            return result;

        }


        return {

            success:
                true,

            status:
                "ready",

            app,

            appState

        };

    }


    /* ========================================================
       19 — APP ÖFFNEN
       ======================================================== */

    async function openApp(
        appId
    ) {

        const prepared =
            prepareApp(
                appId
            );


        if (
            !prepared.success
        ) {

            return prepared;

        }


        const app =
            prepared.app;


        /*
         * Bereits laufende App stoppen.
         */

        if (
            state.activeApp &&
            state.activeApp !==
            app.id
        ) {

            stopApp(
                state.activeApp
            );

        }


        const current =
            getAppState(
                app.id
            );


        appStates.set(
            app.id,
            {

                ...current,

                loaded:
                    true,

                running:
                    true,

                error:
                    null

            }
        );


        state.activeApp =
            app.id;


        state.lastOpenedApp =
            app.id;


        state.lastError =
            null;


        emit(
            "app-opening",
            {

                app,

                state:
                    getAppState(
                        app.id
                    )

            }
        );


        /*
         * Wenn ein App-Modul existiert,
         * kann es seine eigene Startfunktion
         * bereitstellen.
         */

        const module =
            findAppModule(
                app.id
            );


        if (
            module
        ) {

            try {

                if (
                    typeof module.open ===
                    "function"
                ) {

                    await module.open(
                        app
                    );

                }
                else if (
                    typeof module.start ===
                    "function"
                ) {

                    await module.start(
                        app
                    );

                }

            }
            catch (
                error
            ) {

                appStates.set(
                    app.id,
                    {

                        ...getAppState(
                            app.id
                        ),

                        running:
                            false,

                        error:
                            error.message

                    }
                );


                state.lastError =
                    error.message;


                emit(
                    "app-error",
                    {

                        app,

                        error:
                            error.message

                    }
                );


                return {

                    success:
                        false,

                    status:
                        "module-error",

                    app,

                    error:
                        error.message

                };

            }

        }


        /*
         * Nur wenn kein Modul existiert,
         * wird NICHT blind auf eine
         * erfundene HTML-Datei weitergeleitet.
         *
         * Dadurch vermeiden wir den bisherigen
         * 404-Fehler.
         */

        emit(
            "app-opened",
            {

                app,

                state:
                    getAppState(
                        app.id
                    )

            }
        );


        return {

            success:
                true,

            status:
                module
                    ? "running"
                    : "registered",

            app,

            moduleAvailable:
                Boolean(
                    module
                )

        };

    }


    /* ========================================================
       20 — APP STOPPEN
       ======================================================== */

    function stopApp(
        appId
    ) {

        const app =
            getApp(
                appId
            );


        if (
            !app
        ) {

            return {

                success:
                    false,

                error:
                    "App nicht gefunden."

            };

        }


        const current =
            getAppState(
                app.id
            );


        const module =
            findAppModule(
                app.id
            );


        if (
            module &&
            typeof module.close ===
            "function"
        ) {

            try {

                module.close(
                    app
                );

            }
            catch (
                error
            ) {

                console.warn(
                    "[HalDo App Manager] App-Close-Fehler:",
                    error
                );

            }

        }


        appStates.set(
            app.id,
            {

                ...current,

                running:
                    false

            }
        );


        if (
            state.activeApp ===
            app.id
        ) {

            state.activeApp =
                null;

        }


        emit(
            "app-stopped",
            {

                app,

                state:
                    getAppState(
                        app.id
                    )

            }
        );


        return {

            success:
                true,

            app

        };

    }


    /* ========================================================
       21 — APP MODUL SUCHEN
       ======================================================== */

    function findAppModule(
        appId
    ) {

        const normalized =
            String(
                appId ||
                ""
            )
            .trim()
            .replace(
                /-([a-z])/g,
                (
                    _match,
                    letter
                ) =>
                    letter.toUpperCase()
            );


        const candidates = [

            window.HalDoApps &&
                window.HalDoApps[
                    appId
                ],

            window.HalDoApps &&
                window.HalDoApps[
                    normalized
                ],

            window.HalDoAppModules &&
                window.HalDoAppModules[
                    appId
                ],

            window.HalDoAppModules &&
                window.HalDoAppModules[
                    normalized
                ]

        ];


        for (
            const candidate
            of candidates
        ) {

            if (
                candidate
            ) {

                return candidate;

            }

        }


        return null;

    }


    /* ========================================================
       22 — AKTIVE APP
       ======================================================== */

    function getActiveApp() {

        if (
            !state.activeApp
        ) {

            return null;

        }


        return getApp(
            state.activeApp
        );

    }


    /* ========================================================
       23 — SORTIERTE APPS
       ======================================================== */

    function getSortedApps() {

        return getAllApps()
            .slice()
            .sort(
                (
                    a,
                    b
                ) => {

                    const orderA =
                        Number(
                            a.order
                        ) || 999999;


                    const orderB =
                        Number(
                            b.order
                        ) || 999999;


                    return (
                        orderA -
                        orderB
                    );

                }
            );

    }


    /* ========================================================
       24 — FAVORITEN SORTIEREN
       ======================================================== */

    function getSortedFavorites() {

        return getFavorites()
            .slice()
            .sort(
                (
                    a,
                    b
                ) => {

                    return (
                        (Number(a.order) || 999999) -
                        (Number(b.order) || 999999)
                    );

                }
            );

    }


    /* ========================================================
       25 — APP COUNT
       ======================================================== */

    function getAppCount() {

        return getAllApps().length;

    }


    /* ========================================================
       26 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            registryReady:
                registryReady(),

            appCount:
                getAppCount(),

            enabledCount:
                getEnabledApps().length,

            favoriteCount:
                getFavorites().length,

            activeApp:
                getActiveApp(),

            states:
                Array.from(
                    appStates.values()
                )

        };

    }


    /* ========================================================
       27 — SYSTEM STATUS
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            appCount:
                state.appCount,

            activeApp:
                state.activeApp,

            lastOpenedApp:
                state.lastOpenedApp,

            lastError:
                state.lastError

        };

    }


    /* ========================================================
       28 — INITIALISIERUNG
       ======================================================== */

    function init() {

        if (
            state.initialized
        ) {

            return getState();

        }


        if (
            !registryReady()
        ) {

            state.lastError =
                "HalDoAppRegistry ist noch nicht verfügbar.";

            console.error(
                "[HalDo App Manager]",
                state.lastError
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


        initializeAppStates();


        state.initialized =
            true;


        state.ready =
            true;


        /*
         * Verbindung zum Kernel.
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


        /*
         * Verbindung zum System.
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


        emit(
            "ready",
            getState()
        );


        console.log(
            `[HalDo App Manager] ${state.appCount} Apps verwaltet.`
        );


        return getState();

    }


    /* ========================================================
       29 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,


        init,


        on,

        off,


        getApp,

        getAllApps,

        getEnabledApps,

        getFavorites,

        getCategories,

        getAppsByCategory,

        search,


        getAppState,

        enableApp,

        disableApp,

        isAppEnabled,


        prepareApp,

        openApp,

        stopApp,


        getActiveApp,

        getSortedApps,

        getSortedFavorites,


        getAppCount,


        getState,

        diagnose

    };


    /* ========================================================
       30 — GLOBALE VERBINDUNG
       ======================================================== */

    window.HalDoAppManager =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appManager =
        api;


    window.HalDoApps =
        window.HalDoApps ||
        {};


    window.HalDoAppModules =
        window.HalDoAppModules ||
        {};


    /* ========================================================
       31 — START
       ======================================================== */

    function boot() {

        /*
         * Registry kann vor oder nach diesem
         * Script initialisiert werden.
         *
         * Deshalb prüfen wir kurz verzögert.
         */

        if (
            registryReady()
        ) {

            init();

            return;

        }


        let attempts =
            0;


        const timer =
            window.setInterval(
                function () {

                    attempts++;


                    if (
                        registryReady()
                    ) {

                        window.clearInterval(
                            timer
                        );


                        init();


                        return;

                    }


                    if (
                        attempts >=
                        100
                    ) {

                        window.clearInterval(
                            timer
                        );


                        console.error(
                            "[HalDo App Manager] App Registry konnte nicht gefunden werden."
                        );

                    }

                },
                50
            );

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
   ENDE — HALDO AI OS 18 APP MANAGER
   ============================================================ */