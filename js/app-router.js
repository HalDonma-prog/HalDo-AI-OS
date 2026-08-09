/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/app-manager.js

   ZENTRALES APP-MANAGEMENT

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
       echte App-Module

   WICHTIG:
   - Registry bleibt zentrale Quelle der App-Definitionen
   - keine zweite feste App-Liste
   - kompatibel mit mehreren Registry-APIs
   - vorbereitet für zukünftige App-Module
   - App-Zustände
   - Favoriten
   - Kategorien
   - Suche
   - Aktivieren / Deaktivieren
   - Öffnen / Schließen
   - Modulregistrierung
   - Events
   - Kernel-Verbindung
   - System-Verbindung
   - Router-Verbindung
   - Diagnose
   - sichere Fehlerbehandlung
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
            500,

        bootAttempts:
            120,

        bootInterval:
            50

    };


    /* ========================================================
       02 — SYSTEMSTATUS
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        registryReady:
            false,

        routerReady:
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
            0,

        startedAt:
            Date.now()

    };


    /* ========================================================
       03 — APP-ZUSTÄNDE
       ======================================================== */

    const appStates =
        new Map();


    /* ========================================================
       04 — APP-MODULE
       ======================================================== */

    const appModules =
        new Map();


    /* ========================================================
       05 — EVENT-SYSTEM
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
       06 — LOGGING
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

            return;

        }


        if (
            type ===
            "warning"
        ) {

            console.warn(
                prefix,
                message
            );

            return;

        }


        console.log(
            prefix,
            message
        );

    }


    /* ========================================================
       07 — APP-ID NORMALISIEREN
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
       08 — REGISTRY
       ======================================================== */

    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            null
        );

    }


    function registryReady() {

        const registry =
            getRegistry();


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
        catch (
            error
        ) {

            state.lastError =
                error &&
                error.message
                    ? error.message
                    : String(
                        error
                    );


            log(
                state.lastError,
                "error"
            );

        }


        return [];

    }


    /* ========================================================
       09 — APP SUCHEN
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

                const result =
                    registry.findApp(
                        normalized
                    );


                if (
                    result
                ) {

                    return result;

                }

            }


            if (
                typeof registry.getApp ===
                "function"
            ) {

                const result =
                    registry.getApp(
                        normalized
                    );


                if (
                    result
                ) {

                    return result;

                }

            }


            if (
                typeof registry.find ===
                "function"
            ) {

                const result =
                    registry.find(
                        normalized
                    );


                if (
                    result
                ) {

                    return result;

                }

            }

        }
        catch (
            error
        ) {

            log(
                `Fehler beim Suchen von ${normalized}: ${error.message}`,
                "error"
            );

        }


        return getRegistryApps()
            .find(
                app =>
                    app &&
                    normalizeAppId(
                        app.id
                    ) === normalized
            ) ||
            null;

    }


    /* ========================================================
       10 — ALLE APPS
       ======================================================== */

    function getAllApps() {

        return [
            ...getRegistryApps()
        ];

    }


    function getAppCount() {

        return getAllApps().length;

    }


    /* ========================================================
       11 — APP-STATE ERSTELLEN
       ======================================================== */

    function createAppState(
        app
    ) {

        return {

            id:
                normalizeAppId(
                    app.id
                ),

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
                null,

            closedAt:
                null,

            launchCount:
                0

        };

    }


    /* ========================================================
       12 — APP-STATES INITIALISIEREN
       ======================================================== */

    function initializeAppStates() {

        const apps =
            getAllApps();


        const validIds =
            new Set();


        apps.forEach(
            app => {

                if (
                    !app ||
                    !app.id
                ) {

                    return;

                }


                const id =
                    normalizeAppId(
                        app.id
                    );


                validIds.add(
                    id
                );


                if (
                    !appStates.has(
                        id
                    )
                ) {

                    appStates.set(
                        id,
                        createAppState(
                            app
                        )
                    );

                }

            }
        );


        Array.from(
            appStates.keys()
        )
        .forEach(
            id => {

                if (
                    !validIds.has(
                        id
                    )
                ) {

                    appStates.delete(
                        id
                    );

                }

            }
        );


        state.appCount =
            apps.length;


        state.registryReady =
            registryReady();


        return true;

    }


    /* ========================================================
       13 — APP-STATE
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


        const id =
            normalizeAppId(
                app.id
            );


        if (
            !appStates.has(
                id
            )
        ) {

            appStates.set(
                id,
                createAppState(
                    app
                )
            );

        }


        return {
            ...appStates.get(
                id
            )
        };

    }


    /* ========================================================
       14 — AKTIVIERT?
       ======================================================== */

    function getEffectiveEnabled(
        app
    ) {

        if (
            !app
        ) {

            return false;

        }


        const id =
            normalizeAppId(
                app.id
            );


        const current =
            appStates.get(
                id
            );


        if (
            current &&
            typeof current.enabled ===
            "boolean"
        ) {

            return current.enabled;

        }


        return app.enabled !== false;

    }


    function isAppEnabled(
        appId
    ) {

        const app =
            getApp(
                appId
            );


        return Boolean(
            app &&
            getEffectiveEnabled(
                app
            )
        );

    }


    function isInstalled(
        appId
    ) {

        return Boolean(
            getApp(
                appId
            )
        );

    }


    /* ========================================================
       15 — AKTIVIEREN
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


        const id =
            normalizeAppId(
                app.id
            );


        const current =
            getAppState(
                id
            );


        appStates.set(
            id,
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
                        id
                    )

            }
        );


        return {

            success:
                true,

            app,

            state:
                getAppState(
                    id
                )

        };

    }


    /* ========================================================
       16 — DEAKTIVIEREN
       ======================================================== */

    async function disableApp(
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


        const id =
            normalizeAppId(
                app.id
            );


        if (
            state.activeApp ===
            id
        ) {

            await stopApp(
                id
            );

        }


        const current =
            getAppState(
                id
            );


        appStates.set(
            id,
            {

                ...current,

                enabled:
                    false,

                running:
                    false

            }
        );


        emit(
            "app-disabled",
            {

                app,

                state:
                    getAppState(
                        id
                    )

            }
        );


        return {

            success:
                true,

            app,

            state:
                getAppState(
                    id
                )

        };

    }


    /* ========================================================
       17 — FAVORITEN
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


        const id =
            normalizeAppId(
                app.id
            );


        const current =
            appStates.get(
                id
            );


        if (
            current &&
            typeof current.favorite ===
            "boolean"
        ) {

            return current.favorite;

        }


        return app.favorite === true;

    }


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


        const id =
            normalizeAppId(
                app.id
            );


        const current =
            getAppState(
                id
            );


        appStates.set(
            id,
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
                        id
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
       18 — KATEGORIEN
       ======================================================== */

    function getCategories() {

        const result =
            new Set();


        getAllApps()
            .forEach(
                app => {

                    if (
                        app &&
                        app.category
                    ) {

                        result.add(
                            String(
                                app.category
                            )
                        );

                    }

                }
            );


        return Array.from(
            result
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
       19 — SUCHE
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


        const apps =
            getAllApps();


        if (
            !text
        ) {

            return apps.slice(
                0,
                CONFIG.maxSearchResults
            );

        }


        return apps
            .filter(
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


                    const searchable =
                        [

                            app.id,

                            app.name,

                            app.title,

                            app.description,

                            app.category,

                            app.icon,

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


                    return searchable.includes(
                        text
                    );

                }
            )
            .slice(
                0,
                CONFIG.maxSearchResults
            );

    }


    /* ========================================================
       20 — APP-MODUL REGISTRIEREN
       ======================================================== */

    function registerModule(
        appId,
        module
    ) {

        const id =
            normalizeAppId(
                appId
            );


        if (
            !id ||
            !module
        ) {

            return {

                success:
                    false,

                error:
                    "App-ID oder Modul fehlt."

            };

        }


        if (
            typeof module !==
                "object" &&
            typeof module !==
                "function"
        ) {

            return {

                success:
                    false,

                error:
                    "Ungültiges App-Modul."

            };

        }


        appModules.set(
            id,
            module
        );


        emit(
            "app-module-registered",
            {

                appId:
                    id,

                module

            }
        );


        return {

            success:
                true,

            appId:
                id

        };

    }


    function unregisterModule(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        const removed =
            appModules.delete(
                id
            );


        if (
            removed
        ) {

            emit(
                "app-module-unregistered",
                {

                    appId:
                        id

                }
            );

        }


        return removed;

    }


    function getAppModule(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        return (
            appModules.get(
                id
            ) ||
            null
        );

    }


    function hasAppModule(
        appId
    ) {

        return Boolean(
            getAppModule(
                appId
            )
        );

    }


    /* ========================================================
       21 — APP-MODUL SUCHEN
       ======================================================== */

    function findAppModule(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        const registered =
            getAppModule(
                id
            );


        if (
            registered
        ) {

            return registered;

        }


        const camelCase =
            id.replace(
                /-([a-z])/g,
                (
                    _match,
                    letter
                ) =>
                    letter.toUpperCase()
            );


        const candidates = [

            window.HalDoApps &&
                window.HalDoApps[id],

            window.HalDoApps &&
                window.HalDoApps[camelCase],

            window.HalDoAppModules &&
                window.HalDoAppModules[id],

            window.HalDoAppModules &&
                window.HalDoAppModules[camelCase],

            window[
                `HalDoApp_${camelCase}`
            ],

            window[
                `HalDoApp_${id}`
            ]

        ];


        for (
            const candidate
            of candidates
        ) {

            if (
                candidate &&
                (
                    typeof candidate ===
                    "object" ||

                    typeof candidate ===
                    "function"
                )
            ) {

                return candidate;

            }

        }


        return null;

    }


    /* ========================================================
       22 — ROUTER
       ======================================================== */

    function getRouter() {

        return (
            window.HalDoAppRouter ||
            (
                window.HalDoOS &&
                window.HalDoOS.appRouter
            ) ||
            null
        );

    }


    function connectRouter() {

        const router =
            getRouter();


        state.routerReady =
            Boolean(
                router
            );


        return router;

    }


    /* ========================================================
       23 — APP VORBEREITEN
       ======================================================== */

    function prepareApp(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        const app =
            getApp(
                id
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
                    id,

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
                id
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
                    id
                ),

            module:
                findAppModule(
                    id
                )

        };

    }


    /* ========================================================
       24 — APP ÖFFNEN
       ======================================================== */

    async function openApp(
        appId,
        options = {}
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


        const id =
            normalizeAppId(
                app.id
            );


        /*
         * Bereits aktive App nicht
         * unnötig neu starten.
         */

        if (
            state.activeApp ===
            id
        ) {

            return {

                success:
                    true,

                status:
                    "already-running",

                app,

                moduleAvailable:
                    Boolean(
                        findAppModule(
                            id
                        )
                    )

            };

        }


        /*
         * Vorherige App schließen.
         */

        if (
            state.activeApp
        ) {

            await stopApp(
                state.activeApp
            );

        }


        const current =
            getAppState(
                id
            );


        const module =
            findAppModule(
                id
            );


        const openedAt =
            Date.now();


        appStates.set(
            id,
            {

                ...current,

                loaded:
                    true,

                running:
                    true,

                error:
                    null,

                openedAt,

                launchCount:
                    (
                        current.launchCount ||
                        0
                    ) + 1

            }
        );


        state.activeApp =
            id;


        state.lastOpenedApp =
            id;


        state.lastError =
            null;


        state.navigationCount++;


        emit(
            "app-opening",
            {

                app,

                state:
                    getAppState(
                        id
                    ),

                moduleAvailable:
                    Boolean(
                        module
                    ),

                options

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
                        app,
                        options
                    );

                }
                else if (
                    typeof module.start ===
                    "function"
                ) {

                    await module.start(
                        app,
                        options
                    );

                }
                else if (
                    typeof module.init ===
                    "function"
                ) {

                    await module.init(
                        app,
                        options
                    );

                }


                emit(
                    "app-opened",
                    {

                        app,

                        state:
                            getAppState(
                                id
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

                return handleAppError(
                    app,
                    error
                );

            }

        }


        /*
         * Kein Modul vorhanden.
         *
         * Die App bleibt trotzdem
         * sauber registriert.
         *
         * Keine erfundene HTML-Datei.
         * Keine automatische 404-Seite.
         */

        emit(
            "app-opened",
            {

                app,

                state:
                    getAppState(
                        id
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
       25 — APP-FEHLER
       ======================================================== */

    function handleAppError(
        app,
        error
    ) {

        const id =
            normalizeAppId(
                app.id
            );


        const message =
            error &&
            error.message
                ? error.message
                : String(
                    error
                );


        const current =
            getAppState(
                id
            );


        appStates.set(
            id,
            {

                ...current,

                running:
                    false,

                error:
                    message

            }
        );


        if (
            state.activeApp ===
            id
        ) {

            state.activeApp =
                null;

        }


        state.lastError =
            message;


        const result = {

            success:
                false,

            status:
                "module-error",

            app,

            error:
                message

        };


        emit(
            "app-error",
            result
        );


        log(
            `${id}: ${message}`,
            "error"
        );


        return result;

    }


    /* ========================================================
       26 — APP STOPPEN
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


        const id =
            normalizeAppId(
                app.id
            );


        const current =
            getAppState(
                id
            );


        const module =
            findAppModule(
                id
            );


        if (
            module
        ) {

            try {

                if (
                    typeof module.close ===
                    "function"
                ) {

                    await module.close(
                        app
                    );

                }
                else if (
                    typeof module.stop ===
                    "function"
                ) {

                    await module.stop(
                        app
                    );

                }

            }
            catch (
                error
            ) {

                log(
                    `Fehler beim Schließen von ${id}: ${error.message}`,
                    "warning"
                );

            }

        }


        appStates.set(
            id,
            {

                ...current,

                running:
                    false,

                closedAt:
                    Date.now()

            }
        );


        if (
            state.activeApp ===
            id
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
                        id
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
       27 — AKTIVE APP
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


    function getActiveAppState() {

        if (
            !state.activeApp
        ) {

            return null;

        }


        return getAppState(
            state.activeApp
        );

    }


    /* ========================================================
       28 — SORTIERUNG
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
                        a.name ||
                        a.title ||
                        a.id ||
                        ""
                    )
                    .localeCompare(
                        String(
                            b.name ||
                            b.title ||
                            b.id ||
                            ""
                        ),
                        "de"
                    );

                }
            );

    }


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
       29 — REGISTRY REGISTRIEREN
       ======================================================== */

    function register(
        definition
    ) {

        if (
            !definition ||
            !definition.id
        ) {

            return {

                success:
                    false,

                error:
                    "Ungültige App-Definition."

            };

        }


        const registry =
            getRegistry();


        if (
            !registry
        ) {

            return {

                success:
                    false,

                error:
                    "HalDoAppRegistry ist nicht verfügbar."

            };

        }


        try {

            if (
                typeof registry.register ===
                "function"
            ) {

                const result =
                    registry.register(
                        definition
                    );


                initializeAppStates();


                return {

                    success:
                        result !== false,

                    result

                };

            }


            if (
                Array.isArray(
                    registry.definitions
                )
            ) {

                const id =
                    normalizeAppId(
                        definition.id
                    );


                const exists =
                    registry.definitions.some(
                        app =>
                            normalizeAppId(
                                app.id
                            ) === id
                    );


                if (
                    exists
                ) {

                    return {

                        success:
                            false,

                        error:
                            "Diese App ist bereits registriert."

                    };

                }


                registry.definitions.push(
                    {
                        ...definition,
                        id
                    }
                );


                initializeAppStates();


                emit(
                    "app-registered",
                    {

                        app:
                            definition

                    }
                );


                return {

                    success:
                        true,

                    app:
                        definition

                };

            }

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


        return {

            success:
                false,

            error:
                "Die Registry unterstützt keine Registrierung."

        };

    }


    /* ========================================================
       30 — APP EXISTIERT
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


    /* ========================================================
       31 — ROUTER-AKTION
       ======================================================== */

    async function routeToApp(
        appId,
        options = {}
    ) {

        const router =
            connectRouter();


        if (
            !router
        ) {

            return openApp(
                appId,
                options
            );

        }


        try {

            if (
                typeof router.open ===
                "function"
            ) {

                return await router.open(
                    appId,
                    options
                );

            }


            if (
                typeof router.navigate ===
                "function"
            ) {

                return await router.navigate(
                    appId,
                    options
                );

            }


            if (
                typeof router.goTo ===
                "function"
            ) {

                return await router.goTo(
                    appId,
                    options
                );

            }

        }
        catch (
            error
        ) {

            return handleAppError(
                getApp(
                    appId
                ) || {
                    id:
                        appId
                },
                error
            );

        }


        return openApp(
            appId,
            options
        );

    }


    /* ========================================================
       32 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        initializeAppStates();


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

            routerReady:
                Boolean(
                    getRouter()
                ),

            appCount:
                getAppCount(),

            enabledCount:
                getEnabledApps().length,

            favoriteCount:
                getFavorites().length,

            moduleCount:
                appModules.size,

            activeApp:
                getActiveApp(),

            activeAppState:
                getActiveAppState(),

            states:
                Array.from(
                    appStates.values()
                ),

            modules:
                Array.from(
                    appModules.keys()
                ),

            lastError:
                state.lastError

        };

    }


    /* ========================================================
       33 — AKTIVIERTE APPS
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
       34 — SYSTEMSTATUS
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            registryReady:
                registryReady(),

            routerReady:
                Boolean(
                    getRouter()
                ),

            appCount:
                getAppCount(),

            activeApp:
                state.activeApp,

            lastOpenedApp:
                state.lastOpenedApp,

            lastError:
                state.lastError,

            navigationCount:
                state.navigationCount,

            moduleCount:
                appModules.size

        };

    }


    /* ========================================================
       35 — INITIALISIERUNG
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

            state.registryReady =
                false;


            state.lastError =
                "HalDoAppRegistry ist noch nicht verfügbar.";


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


        connectRouter();


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

            try {

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
            catch (
                error
            ) {

                log(
                    `Kernel-Verbindung fehlgeschlagen: ${error.message}`,
                    "warning"
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

            try {

                window.HalDoSystem.registerService(
                    "app-manager",
                    api
                );

            }
            catch (
                error
            ) {

                log(
                    `System-Verbindung fehlgeschlagen: ${error.message}`,
                    "warning"
                );

            }

        }


        emit(
            "ready",
            getState()
        );


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
       36 — PUBLIC API
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


        getRegistry,

        registryReady,

        getApp,

        getAllApps,

        getAppCount,

        getEnabledApps,


        getAppState,

        isInstalled,

        isAppEnabled,

        enableApp,

        disableApp,


        isFavorite,

        setFavorite,

        toggleFavorite,

        getFavorites,


        getCategories,

        getAppsByCategory,

        search,


        registerModule,

        unregisterModule,

        getAppModule,

        hasAppModule,

        findAppModule,


        prepareApp,

        openApp,

        stopApp,

        routeToApp,


        getActiveApp,

        getActiveAppState,


        getSortedApps,

        getSortedFavorites,


        register,

        has,


        getState,

        diagnose

    };


    /* ========================================================
       37 — GLOBALE API
       ======================================================== */

    window.HalDoAppManager =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appManager =
        api;


    /*
     * Gemeinsame App-Modul-Container.
     */

    window.HalDoApps =
        window.HalDoApps ||
        {};


    window.HalDoAppModules =
        window.HalDoAppModules ||
        {};


    /* ========================================================
       38 — BOOT
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
                        CONFIG.bootAttempts
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
                CONFIG.bootInterval
            );

    }


    /* ========================================================
       39 — DOM START
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