/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/app-manager.js

   ZENTRALE APP-VERWALTUNG

   Architektur:

       app-registry.js
              ↓
       HalDoAppRegistry
              ↓
       HalDoAppManager
              ↓
       HalDoAppRouter
              ↓
       echte App-Module

   WICHTIG:
   - Keine zweite unabhängige App-Liste
   - Registry bleibt zentrale Quelle
   - kompatibel mit alter und neuer Registry-API
   - vorbereitet für zukünftige Apps
   - vorbereitet für echte Module
   - Statusverwaltung
   - Favoriten
   - Kategorien
   - Suche
   - Aktivieren / Deaktivieren
   - Öffnen / Schließen
   - Events
   - Kernel-Verbindung
   - System-Verbindung
   - Diagnose
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
            "18.0.0",

        maxSearchResults:
            500

    };


    /* ========================================================
       02 — SYSTEMSTATUS
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
            null,

        navigationCount:
            0

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
                            "[HalDo App Manager] Event-Fehler:",
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
       06 — REGISTRY HOLEN
       ======================================================== */

    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            null
        );

    }


    /* ========================================================
       07 — REGISTRY BEREIT?
       ======================================================== */

    function registryReady() {

        const registry =
            getRegistry();


        if (
            !registry
        ) {

            return false;

        }


        return (
            typeof registry.getAllApps ===
                "function" ||

            typeof registry.getAll ===
                "function"
        );

    }


    /* ========================================================
       08 — APP-ID NORMALISIEREN
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
       09 — REGISTRY APPS HOLEN
       ======================================================== */

    function getRegistryApps() {

        const registry =
            getRegistry();


        if (
            !registry
        ) {

            return [];

        }


        try {

            if (
                typeof registry.getAllApps ===
                "function"
            ) {

                const apps =
                    registry.getAllApps();


                return Array.isArray(
                    apps
                )
                    ? apps
                    : [];

            }


            if (
                typeof registry.getAll ===
                "function"
            ) {

                const apps =
                    registry.getAll();


                return Array.isArray(
                    apps
                )
                    ? apps
                    : [];

            }

        }
        catch (
            error
        ) {

            state.lastError =
                error.message;


            log(
                `Registry konnte nicht gelesen werden: ${error.message}`,
                "error"
            );

        }


        return [];

    }


    /* ========================================================
       10 — APP SUCHEN
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


        const registry =
            getRegistry();


        if (
            !registry
        ) {

            return null;

        }


        try {

            if (
                typeof registry.findApp ===
                "function"
            ) {

                const app =
                    registry.findApp(
                        normalized
                    );


                if (
                    app
                ) {

                    return app;

                }

            }


            if (
                typeof registry.getApp ===
                "function"
            ) {

                const app =
                    registry.getApp(
                        normalized
                    );


                if (
                    app
                ) {

                    return app;

                }

            }


            if (
                typeof registry.find ===
                "function"
            ) {

                const app =
                    registry.find(
                        normalized
                    );


                if (
                    app
                ) {

                    return app;

                }

            }

        }
        catch (
            error
        ) {

            log(
                `Fehler beim Suchen der App ${normalized}: ${error.message}`,
                "error"
            );

        }


        /*
         * Letzter kompatibler Fallback:
         * direkt in den Registry-Daten suchen.
         */

        const apps =
            getRegistryApps();


        return (
            apps.find(
                app =>
                    normalizeAppId(
                        app.id
                    ) === normalized
            ) ||
            null
        );

    }


    /* ========================================================
       11 — ALLE APPS
       ======================================================== */

    function getAllApps() {

        return [
            ...getRegistryApps()
        ];

    }


    /* ========================================================
       12 — AKTIVIERTE APPS
       ======================================================== */

    function getEnabledApps() {

        return getAllApps()
            .filter(
                app =>
                    getEffectiveEnabled(
                        app
                    )
            );

    }


    /* ========================================================
       13 — FAVORITEN
       ======================================================== */

    function getFavorites() {

        return getAllApps()
            .filter(
                app =>
                    isFavorite(
                        app.id
                    )
            );

    }


    /* ========================================================
       14 — KATEGORIEN
       ======================================================== */

    function getCategories() {

        const categories =
            new Set();


        getAllApps()
            .forEach(
                app => {

                    if (
                        app.category
                    ) {

                        categories.add(
                            app.category
                        );

                    }

                }
            );


        return Array.from(
            categories
        ).sort(
            (
                a,
                b
            ) =>
                String(a)
                    .localeCompare(
                        String(b),
                        "de"
                    )
        );

    }


    /* ========================================================
       15 — APPS NACH KATEGORIE
       ======================================================== */

    function getAppsByCategory(
        category
    ) {

        const normalized =
            String(
                category ||
                ""
            )
            .trim()
            .toLowerCase();


        if (
            !normalized
        ) {

            return [];

        }


        return getAllApps()
            .filter(
                app =>
                    String(
                        app.category ||
                        ""
                    )
                    .trim()
                    .toLowerCase() ===
                    normalized
            );

    }


    /* ========================================================
       16 — APP SUCHE
       ======================================================== */

    function search(
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


        const results =
            getAllApps()
                .filter(
                    app => {

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

                                app.icon,

                                ...keywords

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


        return results.slice(
            0,
            CONFIG.maxSearchResults
        );

    }


    /* ========================================================
       17 — FAVORITEN-STATUS
       ======================================================== */

    function isFavorite(
        appId
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


        const status =
            appStates.get(
                app.id
            );


        if (
            status &&
            typeof status.favorite ===
            "boolean"
        ) {

            return status.favorite;

        }


        return app.favorite === true;

    }


    /* ========================================================
       18 — FAVORIT SETZEN
       ======================================================== */

    function setFavorite(
        appId,
        favorite = true
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

                favorite:
                    Boolean(
                        favorite
                    )

            }
        );


        emit(
            favorite
                ? "app-favorited"
                : "app-unfavorited",
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

            app,

            favorite:
                Boolean(
                    favorite
                )

        };

    }


    /* ========================================================
       19 — FAVORIT UMSCHALTEN
       ======================================================== */

    function toggleFavorite(
        appId
    ) {

        return setFavorite(
            appId,
            !isFavorite(
                appId
            )
        );

    }


    /* ========================================================
       20 — EFFEKTIVER AKTIV-STATUS
       ======================================================== */

    function getEffectiveEnabled(
        app
    ) {

        if (
            !app
        ) {

            return false;

        }


        const status =
            appStates.get(
                app.id
            );


        if (
            status &&
            typeof status.enabled ===
            "boolean"
        ) {

            return status.enabled;

        }


        return app.enabled !== false;

    }


    /* ========================================================
       21 — APP STATUS ERSTELLEN
       ======================================================== */

    function createAppState(
        app
    ) {

        return {

            id:
                app.id,

            enabled:
                app.enabled !== false,

            installed:
                true,

            loaded:
                false,

            running:
                false,

            favorite:
                app.favorite === true,

            error:
                null,

            openedAt:
                null

        };

    }


    /* ========================================================
       22 — STATUS INITIALISIEREN
       ======================================================== */

    function initializeAppStates() {

        const apps =
            getAllApps();


        apps.forEach(
            app => {

                if (
                    !app ||
                    !app.id
                ) {

                    return;

                }


                if (
                    !appStates.has(
                        app.id
                    )
                ) {

                    appStates.set(
                        app.id,
                        createAppState(
                            app
                        )
                    );

                }

            }
        );


        state.appCount =
            apps.length;


        return true;

    }


    /* ========================================================
       23 — APP STATUS
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
                createAppState(
                    app
                )
            );

        }


        return {
            ...appStates.get(
                app.id
            )
        };

    }


    /* ========================================================
       24 — APP INSTALLIERT?
       ======================================================== */

    function isInstalled(
        appId
    ) {

        const app =
            getApp(
                appId
            );


        return Boolean(
            app
        );

    }


    /* ========================================================
       25 — APP AKTIV?
       ======================================================== */

    function isAppEnabled(
        appId
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


        return getEffectiveEnabled(
            app
        );

    }


    /* ========================================================
       26 — APP AKTIVIEREN
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

            app,

            state:
                getAppState(
                    app.id
                )

        };

    }


    /* ========================================================
       27 — APP DEAKTIVIEREN
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


        /*
         * Kritische System-Apps werden
         * nicht blind deaktiviert.
         */

        if (
            app.critical === true
        ) {

            return {

                success:
                    false,

                error:
                    "Eine kritische System-App kann nicht deaktiviert werden."

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

            app,

            state:
                getAppState(
                    app.id
                )

        };

    }


    /* ========================================================
       28 — APP VORBEREITEN
       ======================================================== */

    function prepareApp(
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

            const result = {

                success:
                    false,

                status:
                    "not-found",

                appId:
                    normalized,

                error:
                    "Die angeforderte App ist nicht registriert."

            };


            state.lastError =
                result.error;


            emit(
                "app-error",
                result
            );


            return result;

        }


        if (
            !isAppEnabled(
                app.id
            )
        ) {

            const result = {

                success:
                    false,

                status:
                    "disabled",

                app,

                error:
                    "Diese App ist derzeit deaktiviert."

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

            appState:
                getAppState(
                    app.id
                )

        };

    }


    /* ========================================================
       29 — APP MODUL FINDEN
       ======================================================== */

    function findAppModule(
        appId
    ) {

        const normalized =
            normalizeAppId(
                appId
            );


        const camelCase =
            normalized.replace(
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
                    normalized
                ],

            window.HalDoApps &&
                window.HalDoApps[
                    camelCase
                ],

            window.HalDoAppModules &&
                window.HalDoAppModules[
                    normalized
                ],

            window.HalDoAppModules &&
                window.HalDoAppModules[
                    camelCase
                ],

            window[
                `HalDoApp_${camelCase}`
            ],

            window[
                `HalDoApp_${normalized}`
            ]

        ];


        for (
            const candidate
            of candidates
        ) {

            if (
                candidate &&
                typeof candidate ===
                "object"
            ) {

                return candidate;

            }

        }


        return null;

    }


    /* ========================================================
       30 — APP ÖFFNEN
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
         * Vorherige App stoppen.
         */

        if (
            state.activeApp &&
            state.activeApp !==
            app.id
        ) {

            await stopApp(
                state.activeApp
            );

        }


        const current =
            getAppState(
                app.id
            );


        const module =
            findAppModule(
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
                    null,

                openedAt:
                    Date.now()

            }
        );


        state.activeApp =
            app.id;


        state.lastOpenedApp =
            app.id;


        state.lastError =
            null;


        state.navigationCount++;


        emit(
            "app-opening",
            {

                app,

                state:
                    getAppState(
                        app.id
                    ),

                moduleAvailable:
                    Boolean(
                        module
                    )

            }
        );


        /*
         * Echtes App-Modul.
         */

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


                emit(
                    "app-opened",
                    {

                        app,

                        state:
                            getAppState(
                                app.id
                            ),

                        moduleAvailable:
                            true

                    }
                );


                return {

                    success:
                        true,

                    status:
                        "running",

                    app,

                    moduleAvailable:
                        true

                };

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


                appStates.set(
                    app.id,
                    {

                        ...getAppState(
                            app.id
                        ),

                        running:
                            false,

                        error:
                            message

                    }
                );


                state.lastError =
                    message;


                emit(
                    "app-error",
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
                        "module-error",

                    app,

                    error:
                        message

                };

            }

        }


        /*
         * Noch kein Modul:
         *
         * Die App bleibt registriert.
         * KEINE erfundene HTML-Datei.
         * KEINE 404-Weiterleitung.
         */

        emit(
            "app-opened",
            {

                app,

                state:
                    getAppState(
                        app.id
                    ),

                moduleAvailable:
                    false

            }
        );


        return {

            success:
                true,

            status:
                "registered",

            app,

            moduleAvailable:
                false

        };

    }


    /* ========================================================
       31 — APP STOPPEN
       ======================================================== */

    async function stopApp(
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

                await module.close(
                    app
                );

            }
            catch (
                error
            ) {

                log(
                    `Fehler beim Schließen von ${app.id}: ${error.message}`,
                    "warning"
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
       32 — AKTIVE APP
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
       33 — SORTIERTE APPS
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
       34 — SORTIERTE FAVORITEN
       ======================================================== */

    function getSortedFavorites() {

        return getFavorites()
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
       35 — APP COUNT
       ======================================================== */

    function getAppCount() {

        return getAllApps().length;

    }


    /* ========================================================
       36 — REGISTRY KOMPATIBILITÄT
       ======================================================== */

    function has(
        appId
    ) {

        return Boolean(
            getApp(
                appId
            )
        );

    }


    /*
     * Diese Funktion existiert bewusst,
     * damit ältere/kommende Registry-Versionen
     * mit dem Manager kommunizieren können.
     *
     * Die eigentliche App-Definition bleibt
     * trotzdem in HalDoAppRegistry.
     */

    function register(
        definition
    ) {

        if (
            !definition ||
            !definition.id
        ) {

            return false;

        }


        const registry =
            getRegistry();


        if (
            !registry
        ) {

            return false;

        }


        /*
         * Wenn Registry eine eigene
         * register()-Methode besitzt,
         * benutzen wir diese.
         */

        if (
            typeof registry.register ===
            "function"
        ) {

            return Boolean(
                registry.register(
                    definition
                )
            );

        }


        /*
         * Die neue Registry-Version
         * besitzt normalerweise ihre
         * definitions-Liste.
         */

        if (
            Array.isArray(
                registry.definitions
            )
        ) {

            const exists =
                registry.definitions.some(
                    app =>
                        app.id ===
                        definition.id
                );


            if (
                exists
            ) {

                return false;

            }


            registry.definitions.push(
                definition
            );


            initializeAppStates();


            return true;

        }


        return false;

    }


    /* ========================================================
       37 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            initialized:
                state.initialized,

            ready:
                state.ready,

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
       38 — SYSTEM STATUS
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            appCount:
                getAppCount(),

            activeApp:
                state.activeApp,

            lastOpenedApp:
                state.lastOpenedApp,

            lastError:
                state.lastError,

            navigationCount:
                state.navigationCount

        };

    }


    /* ========================================================
       39 — INITIALISIERUNG
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


        initializeAppStates();


        state.initialized =
            true;


        state.ready =
            true;


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
         * System verbinden.
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


        /*
         * Wichtig:
         * Registry informieren.
         */

        window.dispatchEvent(
            new CustomEvent(
                "haldo:app-manager-ready",
                {

                    detail:
                        getState()

                }
            )
        );


        log(
            `${state.appCount} Apps aus der Registry geladen.`
        );


        return getState();

    }


    /* ========================================================
       40 — PUBLIC API
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


        getApp,

        getAllApps,

        getEnabledApps,

        getFavorites,

        getCategories,

        getAppsByCategory,

        search,


        isFavorite,

        setFavorite,

        toggleFavorite,


        getAppState,

        isInstalled,

        enableApp,

        disableApp,

        isAppEnabled,


        prepareApp,

        findAppModule,

        openApp,

        stopApp,


        getActiveApp,

        getSortedApps,

        getSortedFavorites,


        getAppCount,


        has,

        register,


        getState,

        diagnose

    };


    /* ========================================================
       41 — GLOBALE API
       ======================================================== */

    window.HalDoAppManager =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appManager =
        api;


    /*
     * Gemeinsame Modulcontainer.
     * Hier werden später die echten Apps
     * angeschlossen.
     */

    window.HalDoApps =
        window.HalDoApps ||
        {};


    window.HalDoAppModules =
        window.HalDoAppModules ||
        {};


    /* ========================================================
       42 — BOOT
       ======================================================== */

    function boot() {

        if (
            registryReady()
        ) {

            init();

            return;

        }


        let attempts =
            0;


        const maxAttempts =
            120;


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
                        maxAttempts
                    ) {

                        window.clearInterval(
                            timer
                        );


                        state.lastError =
                            "HalDoAppRegistry konnte beim Start nicht gefunden werden.";


                        log(
                            state.lastError,
                            "error"
                        );

                    }

                },
                50
            );

    }


    /* ========================================================
       43 — DOM START
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
   ENDE — HALDO AI OS 18 APP MANAGER
   ============================================================ */