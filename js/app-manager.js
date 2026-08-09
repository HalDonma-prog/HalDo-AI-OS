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
   - Keine zweite unabhängige App-Liste
   - Kompatibilität mit mehreren Registry-APIs
   - Zentrale Zustandsverwaltung
   - Favoriten
   - Kategorien
   - Suche
   - Aktivieren / Deaktivieren
   - Öffnen / Schließen
   - App-Module
   - Events
   - Kernel-Verbindung
   - System-Verbindung
   - Router-Verbindung
   - Diagnose
   - zukünftige Erweiterungen
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

        kernelReady:
            false,

        systemReady:
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

        startTime:
            null,

        lastUpdate:
            null

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
       05 — EVENT SYSTEM
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


        const name =
            String(
                eventName ||
                ""
            ).trim();


        if (
            !name
        ) {

            return false;

        }


        if (
            !listeners[name]
        ) {

            listeners[name] =
                [];

        }


        listeners[name].push(
            callback
        );


        return true;

    }


    function off(
        eventName,
        callback
    ) {

        const name =
            String(
                eventName ||
                ""
            ).trim();


        if (
            !listeners[name]
        ) {

            return false;

        }


        listeners[name] =
            listeners[name].filter(
                item =>
                    item !== callback
            );


        return true;

    }


    function emit(
        eventName,
        data = null
    ) {

        const name =
            String(
                eventName ||
                ""
            ).trim();


        const callbacks =
            listeners[name];


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
            /[_\s]+/g,
            "-"
        )
        .replace(
            /-+/g,
            "-"
        );

    }


    /* ========================================================
       08 — REGISTRY HOLEN
       ======================================================== */

    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            null
        );

    }


    /* ========================================================
       09 — REGISTRY BEREIT?
       ======================================================== */

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

            typeof registry.getApps ===
                "function"

            ||

            Array.isArray(
                registry.definitions
            )

            ||

            Array.isArray(
                registry.apps
            )

        );

    }


    /* ========================================================
       10 — REGISTRY APPS LESEN
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

                const result =
                    registry.getAllApps();


                if (
                    Array.isArray(
                        result
                    )
                ) {

                    return result;

                }

            }


            if (
                typeof registry.getAll ===
                "function"
            ) {

                const result =
                    registry.getAll();


                if (
                    Array.isArray(
                        result
                    )
                ) {

                    return result;

                }

            }


            if (
                typeof registry.getApps ===
                "function"
            ) {

                const result =
                    registry.getApps();


                if (
                    Array.isArray(
                        result
                    )
                ) {

                    return result;

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


            if (
                Array.isArray(
                    registry.apps
                )
            ) {

                return [
                    ...registry.apps
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
                `Registry konnte nicht gelesen werden: ${state.lastError}`,
                "error"
            );

        }


        return [];

    }


    /* ========================================================
       11 — APP SUCHEN
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

            const methods = [

                "findApp",

                "getApp",

                "find",

                "get"

            ];


            for (
                const methodName
                of methods
            ) {

                if (
                    typeof registry[
                        methodName
                    ] !==
                    "function"
                ) {

                    continue;

                }


                const result =
                    registry[
                        methodName
                    ](
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
                `Fehler beim Suchen der App ${normalized}: ${error.message}`,
                "error"
            );

        }


        return (
            getRegistryApps()
                .find(
                    app =>
                        app &&
                        normalizeAppId(
                            app.id
                        ) === normalized
                )
            ||
            null
        );

    }


    /* ========================================================
       12 — ALLE APPS
       ======================================================== */

    function getAllApps() {

        return [
            ...getRegistryApps()
        ];

    }


    /* ========================================================
       13 — APP STATUS ERSTELLEN
       ======================================================== */

    function createAppState(
        app
    ) {

        const id =
            normalizeAppId(
                app.id
            );


        return {

            id,

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
                0,

            lastResult:
                null

        };

    }


    /* ========================================================
       14 — APP-ZUSTÄNDE INITIALISIEREN
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


                if (
                    !id
                ) {

                    return;

                }


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
                            {
                                ...app,
                                id
                            }
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


        state.lastUpdate =
            Date.now();


        return true;

    }


    /* ========================================================
       15 — APP STATUS
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
                    {
                        ...app,
                        id
                    }
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
       16 — EFFEKTIVER ENABLED STATUS
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


        const status =
            appStates.get(
                id
            );


        if (
            status &&
            typeof status.enabled ===
            "boolean"
        ) {

            return status.enabled;

        }


        return (
            app.enabled !== false
        );

    }


    /* ========================================================
       17 — ENABLED APPS
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
       18 — INSTALLIERT?
       ======================================================== */

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
       19 — AKTIVIERT?
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
       20 — FAVORITEN
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


        const status =
            appStates.get(
                id
            );


        if (
            status &&
            typeof status.favorite ===
            "boolean"
        ) {

            return status.favorite;

        }


        return (
            app.favorite === true
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


    /* ========================================================
       21 — KATEGORIEN
       ======================================================== */

    function getCategories() {

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
       22 — APP-SUCHE
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


                    const content = [

                        app.id,

                        app.name,

                        app.title,

                        app.description,

                        app.category,

                        app.icon,

                        app.version,

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
       23 — APP AKTIVIEREN
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
       24 — APP DEAKTIVIEREN
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
            app.critical === true ||
            app.system === true
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
       25 — APP-MODUL REGISTRIEREN
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
            !id
        ) {

            return {

                success:
                    false,

                error:
                    "Ungültige App-ID."

            };

        }


        if (
            !module ||
            typeof module !==
            "object"
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
                id,

            module

        };

    }


    function unregisterModule(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        const existed =
            appModules.has(
                id
            );


        appModules.delete(
            id
        );


        if (
            existed
        ) {

            emit(
                "app-module-unregistered",
                {

                    appId:
                        id

                }
            );

        }


        return existed;

    }


    function getModule(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        return (
            appModules.get(
                id
            )
            ||
            null
        );

    }


    function hasModule(
        appId
    ) {

        return Boolean(
            getModule(
                appId
            )
        );

    }


    /* ========================================================
       26 — EXTERNES APP-MODUL SUCHEN
       ======================================================== */

    function findAppModule(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        const registered =
            getModule(
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


        const containers = [

            window.HalDoApps,

            window.HalDoAppModules

        ];


        for (
            const container
            of containers
        ) {

            if (
                !container
            ) {

                continue;

            }


            if (
                container[id]
            ) {

                return container[id];

            }


            if (
                container[camelCase]
            ) {

                return container[
                    camelCase
                ];

            }

        }


        const globals = [

            `HalDoApp_${camelCase}`,

            `HalDoApp_${id}`

        ];


        for (
            const name
            of globals
        ) {

            if (
                window[name]
            ) {

                return window[name];

            }

        }


        return null;

    }


    /* ========================================================
       27 — APP VORBEREITEN
       ======================================================== */

    function prepareApp(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        if (
            !id
        ) {

            return {

                success:
                    false,

                status:
                    "invalid-id",

                error:
                    "Keine gültige App-ID."

            };

        }


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
       28 — APP ÖFFNEN
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

            const current =
                getAppState(
                    id
                );


            return {

                success:
                    true,

                status:
                    "already-running",

                app,

                state:
                    current,

                moduleAvailable:
                    Boolean(
                        prepared.module
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


        /*
         * Router-Verbindung.
         *
         * Der Router bleibt zuständig
         * für Navigation. Der Manager
         * übernimmt den App-Lebenszyklus.
         */

        if (
            !options.skipRouter &&
            window.HalDoAppRouter
        ) {

            state.routerReady =
                true;

        }


        const current =
            getAppState(
                id
            );


        const module =
            prepared.module ||
            findAppModule(
                id
            );


        const openingState = {

            ...current,

            loaded:
                true,

            running:
                true,

            error:
                null,

            openedAt:
                Date.now(),

            launchCount:
                Number(
                    current.launchCount
                ) + 1

        };


        appStates.set(
            id,
            openingState
        );


        state.activeApp =
            id;


        state.lastOpenedApp =
            id;


        state.lastError =
            null;


        state.navigationCount++;


        state.lastUpdate =
            Date.now();


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
                    )

            }
        );


        /*
         * Echtes App-Modul starten.
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
                    "function" &&
                    !module.__haldoInitialized
                ) {

                    await module.init(
                        app,
                        options
                    );


                    try {

                        module.__haldoInitialized =
                            true;

                    }
                    catch (
                        _error
                    ) {

                        /*
                         * Nicht kritisch.
                         */

                    }

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
                        true,

                    state:
                        getAppState(
                            id
                        )

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


                const failedState =
                    getAppState(
                        id
                    );


                appStates.set(
                    id,
                    {

                        ...failedState,

                        running:
                            false,

                        error:
                            message,

                        lastResult:
                            "module-error"

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


                emit(
                    "app-error",
                    {

                        app,

                        error:
                            message,

                        state:
                            getAppState(
                                id
                            )

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
         * Noch kein echtes Modul.
         *
         * Die App bleibt registriert.
         * Es wird KEINE erfundene HTML-Datei
         * geöffnet und KEINE 404-Navigation
         * ausgelöst.
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
                false,

            state:
                getAppState(
                    id
                )

        };

    }


    /* ========================================================
       29 — APP STOPPEN
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


        state.lastUpdate =
            Date.now();


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

            app,

            state:
                getAppState(
                    id
                )

        };

    }


    /* ========================================================
       30 — AKTIVE APP
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


    function getActiveAppId() {

        return (
            state.activeApp ||
            null
        );

    }


    /* ========================================================
       31 — SORTIERUNG
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
                        a &&
                        a.order
                    );


                const orderB =
                    Number(
                        b &&
                        b.order
                    );


                const safeA =
                    Number.isFinite(
                        orderA
                    )
                        ? orderA
                        : 999999;


                const safeB =
                    Number.isFinite(
                        orderB
                    )
                        ? orderB
                        : 999999;


                if (
                    safeA !==
                    safeB
                ) {

                    return (
                        safeA -
                        safeB
                    );

                }


                const nameA =
                    String(
                        a &&
                        (
                            a.name ||
                            a.title ||
                            a.id ||
                            ""
                        )
                    );


                const nameB =
                    String(
                        b &&
                        (
                            b.name ||
                            b.title ||
                            b.id ||
                            ""
                        )
                    );


                return nameA.localeCompare(
                    nameB,
                    "de"
                );

            }
        );

    }


    function getSortedApps() {

        return sortApps(
            getAllApps()
        );

    }


    function getSortedFavorites() {

        return sortApps(
            getFavorites()
        );

    }


    /* ========================================================
       32 — APP COUNT
       ======================================================== */

    function getAppCount() {

        return getAllApps().length;

    }


    /* ========================================================
       33 — APP VORHANDEN?
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
       34 — REGISTRY REGISTRIEREN
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
                typeof registry.registerApp ===
                "function"
            ) {

                const result =
                    registry.registerApp(
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
                                app &&
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
                            "App ist bereits registriert."

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
       35 — ROUTER ERMITTELN
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


    /* ========================================================
       36 — ROUTER VERBINDUNG
       ======================================================== */

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
       37 — KERNEL VERBINDUNG
       ======================================================== */

    function connectKernel() {

        const kernel =
            window.HalDoKernel;


        state.kernelReady =
            Boolean(
                kernel
            );


        if (
            !kernel
        ) {

            return false;

        }


        try {

            if (
                typeof kernel.registerModule ===
                "function"
            ) {

                kernel.registerModule(
                    "app-manager",
                    api
                );

            }


            if (
                typeof kernel.setModuleReady ===
                "function"
            ) {

                kernel.setModuleReady(
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


        return true;

    }


    /* ========================================================
       38 — SYSTEM VERBINDUNG
       ======================================================== */

    function connectSystem() {

        const system =
            window.HalDoSystem;


        state.systemReady =
            Boolean(
                system
            );


        if (
            !system
        ) {

            return false;

        }


        try {

            if (
                typeof system.registerService ===
                "function"
            ) {

                system.registerService(
                    "app-manager",
                    api
                );

            }
            else if (
                typeof system.registerModule ===
                "function"
            ) {

                system.registerModule(
                    "app-manager",
                    api
                );

            }

        }
        catch (
            error
        ) {

            log(
                `System-Verbindung fehlgeschlagen: ${error.message}`,
                "warning"
            );

        }


        return true;

    }


    /* ========================================================
       39 — DIAGNOSE
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

            kernelReady:
                Boolean(
                    window.HalDoKernel
                ),

            systemReady:
                Boolean(
                    window.HalDoSystem
                ),

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
                getActiveAppId(),

            lastOpenedApp:
                state.lastOpenedApp,

            lastError:
                state.lastError,

            navigationCount:
                state.navigationCount,

            states:
                Array.from(
                    appStates.values()
                )

        };

    }


    /* ========================================================
       40 — SYSTEMSTATUS
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            registryReady:
                state.registryReady,

            kernelReady:
                state.kernelReady,

            systemReady:
                state.systemReady,

            routerReady:
                state.routerReady,

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

            startTime:
                state.startTime,

            lastUpdate:
                state.lastUpdate

        };

    }


    /* ========================================================
       41 — INITIALISIERUNG
       ======================================================== */

    function init() {

        if (
            state.initialized
        ) {

            /*
             * Verbindungen können später
             * verfügbar werden.
             */

            connectKernel();
            connectSystem();
            connectRouter();


            initializeAppStates();


            return getState();

        }


        if (
            !registryReady()
        ) {

            state.registryReady =
                false;


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


        state.startTime =
            Date.now();


        initializeAppStates();


        connectKernel();
        connectSystem();
        connectRouter();


        state.initialized =
            true;


        state.ready =
            true;


        state.lastError =
            null;


        state.lastUpdate =
            Date.now();


        emit(
            "ready",
            getState()
        );


        try {

            window.dispatchEvent(
                new CustomEvent(
                    "haldo:app-manager-ready",
                    {

                        detail:
                            getState()

                    }
                )
            );

        }
        catch (
            error
        ) {

            log(
                `Ready-Event konnte nicht gesendet werden: ${error.message}`,
                "warning"
            );

        }


        log(
            `${state.appCount} Apps aus der Registry geladen.`
        );


        return getState();

    }


    /* ========================================================
       42 — REFRESH
       ======================================================== */

    function refresh() {

        initializeAppStates();


        connectKernel();
        connectSystem();
        connectRouter();


        emit(
            "refreshed",
            getState()
        );


        return getState();

    }


    /* ========================================================
       43 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,


        /* Lifecycle */

        init,

        refresh,


        /* Events */

        on,

        off,

        emit,


        /* Registry */

        getRegistry,

        registryReady,

        getAllApps,

        getApp,

        has,

        register,


        /* Search */

        normalizeAppId,

        search,

        getCategories,

        getAppsByCategory,


        /* Status */

        getAppState,

        getState,

        diagnose,

        getAppCount,

        getEnabledApps,

        isInstalled,

        isAppEnabled,

        enableApp,

        disableApp,


        /* Favorites */

        isFavorite,

        getFavorites,

        setFavorite,

        toggleFavorite,


        /* Sorting */

        getSortedApps,

        getSortedFavorites,


        /* Modules */

        registerModule,

        unregisterModule,

        getModule,

        hasModule,

        findAppModule,


        /* App lifecycle */

        prepareApp,

        openApp,

        stopApp,

        getActiveApp,

        getActiveAppId,


        /* Connections */

        connectKernel,

        connectSystem,

        connectRouter

    };


    /* ========================================================
       44 — GLOBALE API
       ======================================================== */

    window.HalDoAppManager =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appManager =
        api;


    /*
     * Gemeinsame Container für zukünftige
     * echte App-Module.
     */

    window.HalDoApps =
        window.HalDoApps ||
        {};


    window.HalDoAppModules =
        window.HalDoAppModules ||
        {};


    /* ========================================================
       45 — BOOT
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
   ENDE — HALDO AI OS 18 APP MANAGER
   ============================================================ */