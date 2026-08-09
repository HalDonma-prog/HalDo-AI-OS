/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/app-manager.js

   ZENTRALER APP-MANAGER

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
       HalDoApps / echte App-Module

   AUFGABEN:
   - zentrale Verwaltung der Apps
   - Verbindung zur App Registry
   - App-Zustände
   - App öffnen / schließen
   - App starten / stoppen
   - aktive App
   - App-Suche
   - Kategorien
   - Favoriten
   - App-Module
   - App-Abhängigkeiten
   - Events
   - Diagnose
   - sichere Kompatibilität mit älteren APIs

   WICHTIG:
   - Die App Registry bleibt Quelle der Definitionen.
   - Der Manager besitzt KEINE zweite unabhängige App-Liste.
   - Der Router übernimmt Navigation.
   - Der Manager übernimmt App-Lebenszyklus und Zustand.
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const CONFIG = {

        name:
            "HalDo AI OS 18 App Manager",

        version:
            "18.0.0",

        platform:
            "HalDo AI OS 18",

        edition:
            "Professional Ultimate Foundation",

        maxRunningApps:
            50,

        startupTimeout:
            10000

    };


    /* ========================================================
       02 — STATUS
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

        activeAppId:
            null,

        previousAppId:
            null,

        runningApps:
            new Set(),

        openedApps:
            new Set(),

        startedApps:
            new Set(),

        navigationLocked:
            false,

        operationCount:
            0,

        lastError:
            null,

        startTime:
            null

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
       04 — LOGGING
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
       05 — REGISTRY HOLEN
       ======================================================== */

    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            (
                window.HalDoOS &&
                window.HalDoOS.appRegistry
            ) ||
            (
                window.HalDo &&
                window.HalDo.appRegistry
            ) ||
            null
        );

    }


    /* ========================================================
       06 — ROUTER HOLEN
       ======================================================== */

    function getRouter() {

        return (
            window.HalDoAppRouter ||
            (
                window.HalDoOS &&
                window.HalDoOS.appRouter
            ) ||
            (
                window.HalDo &&
                window.HalDo.appRouter
            ) ||
            null
        );

    }


    /* ========================================================
       07 — APP-CONTAINER
       ======================================================== */

    function getAppContainer() {

        window.HalDoApps =
            window.HalDoApps ||
            {};


        return window.HalDoApps;

    }


    /* ========================================================
       08 — MODUL-CONTAINER
       ======================================================== */

    function getModuleContainer() {

        window.HalDoAppModules =
            window.HalDoAppModules ||
            {};


        return window.HalDoAppModules;

    }


    /* ========================================================
       09 — APP-ID NORMALISIEREN
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
            /[^a-z0-9äöüßêîé_-]+/gi,
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


    /* ========================================================
       10 — APP AUS REGISTRY
       ======================================================== */

    function getAppDefinition(
        appId
    ) {

        const registry =
            getRegistry();


        if (
            !registry
        ) {

            return null;

        }


        const normalized =
            normalizeAppId(
                appId
            );


        if (
            !normalized
        ) {

            return null;

        }


        if (
            typeof registry.getApp ===
            "function"
        ) {

            return registry.getApp(
                normalized
            );

        }


        if (
            typeof registry.findApp ===
            "function"
        ) {

            return registry.findApp(
                normalized
            );

        }


        if (
            typeof registry.find ===
            "function"
        ) {

            return registry.find(
                normalized
            );

        }


        return null;

    }


    /* ========================================================
       11 — REGISTRY BEREIT?
       ======================================================== */

    function isRegistryReady() {

        const registry =
            getRegistry();


        if (
            !registry
        ) {

            return false;

        }


        return (
            typeof registry.getAll ===
            "function" ||

            typeof registry.getAllApps ===
            "function"
        );

    }


    /* ========================================================
       12 — ALLE APP-DEFINITIONEN
       ======================================================== */

    function getAllApps() {

        const registry =
            getRegistry();


        if (
            !registry
        ) {

            return [];

        }


        if (
            typeof registry.getAllApps ===
            "function"
        ) {

            return registry.getAllApps();

        }


        if (
            typeof registry.getAll ===
            "function"
        ) {

            return registry.getAll();

        }


        return [];

    }


    /* ========================================================
       13 — APP EXISTIERT?
       ======================================================== */

    function has(
        appId
    ) {

        return Boolean(
            getAppDefinition(
                appId
            )
        );

    }


    /* ========================================================
       14 — APP HOLEN
       ======================================================== */

    function getApp(
        appId
    ) {

        return getAppDefinition(
            appId
        );

    }


    /* ========================================================
       15 — APP STATUS
       ======================================================== */

    function getAppState(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        if (
            !id
        ) {

            return null;

        }


        const definition =
            getAppDefinition(
                id
            );


        if (
            !definition
        ) {

            return null;

        }


        return {

            id,

            definition,

            exists:
                true,

            enabled:
                definition.enabled !==
                false,

            installed:
                definition.installed !==
                false,

            active:
                state.activeAppId ===
                id,

            running:
                state.runningApps.has(
                    id
                ),

            opened:
                state.openedApps.has(
                    id
                ),

            started:
                state.startedApps.has(
                    id
                ),

            system:
                definition.system ===
                true,

            critical:
                definition.critical ===
                true,

            favorite:
                definition.favorite ===
                true

        };

    }


    /* ========================================================
       16 — MODUL HOLEN
       ======================================================== */

    function getModule(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        if (
            !id
        ) {

            return null;

        }


        const definition =
            getAppDefinition(
                id
            );


        if (
            !definition
        ) {

            return null;

        }


        const moduleContainer =
            getModuleContainer();


        /*
         * Primär über App-ID.
         */

        if (
            moduleContainer[id]
        ) {

            return moduleContainer[id];

        }


        /*
         * Danach über Modulnamen.
         */

        const moduleName =
            definition.module;


        if (
            moduleName &&
            moduleContainer[
                moduleName
            ]
        ) {

            return moduleContainer[
                moduleName
            ];

        }


        /*
         * Kompatibilität mit
         * HalDoApps.
         */

        const apps =
            getAppContainer();


        if (
            apps[id]
        ) {

            return apps[id];

        }


        if (
            moduleName &&
            apps[moduleName]
        ) {

            return apps[moduleName];

        }


        return null;

    }


    /* ========================================================
       17 — MODUL REGISTRIEREN
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

            return false;

        }


        const definition =
            getAppDefinition(
                id
            );


        if (
            !definition
        ) {

            log(
                `Modul kann nicht registriert werden. App unbekannt: ${id}`,
                "warning"
            );


            return false;

        }


        const moduleContainer =
            getModuleContainer();


        moduleContainer[id] =
            module;


        if (
            definition.module
        ) {

            moduleContainer[
                definition.module
            ] =
                module;

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
       18 — APP ÖFFNEN
       ======================================================== */

    async function openApp(
        appId,
        options = {}
    ) {

        const id =
            normalizeAppId(
                appId
            );


        if (
            !id
        ) {

            return false;

        }


        const definition =
            getAppDefinition(
                id
            );


        if (
            !definition
        ) {

            log(
                `App nicht gefunden: ${id}`,
                "warning"
            );


            emit(
                "app:error",
                {

                    appId:
                        id,

                    reason:
                        "not-found"

                }
            );


            return false;

        }


        if (
            definition.enabled ===
            false
        ) {

            log(
                `App ist deaktiviert: ${id}`,
                "warning"
            );


            return false;

        }


        if (
            definition.installed ===
            false
        ) {

            log(
                `App ist nicht installiert: ${id}`,
                "warning"
            );


            return false;

        }


        state.operationCount++;


        /*
         * Bereits aktive App.
         */

        if (
            state.activeAppId ===
            id
        ) {

            emit(
                "app:active",
                {

                    appId:
                        id,

                    definition,

                    options,

                    existing:
                        true

                }
            );


            /*
             * Router darf trotzdem
             * die Route aktualisieren.
             */

            const router =
                getRouter();


            if (
                router &&
                options.navigate !==
                false &&
                typeof router.navigate ===
                "function"
            ) {

                try {

                    await router.navigate(
                        id,
                        options
                    );

                }
                catch (
                    error
                ) {

                    log(
                        `Router-Navigation fehlgeschlagen: ${error.message}`,
                        "warning"
                    );

                }

            }


            return true;

        }


        /*
         * Maximale Anzahl laufender Apps.
         */

        if (
            state.runningApps.size >=
            CONFIG.maxRunningApps
        ) {

            /*
             * Nicht-kritische, nicht aktive
             * Apps werden zuerst beendet.
             */

            const removable =
                Array.from(
                    state.runningApps
                )
                .find(
                    runningId => {

                        const running =
                            getAppDefinition(
                                runningId
                            );

                        return (
                            running &&
                            running.critical !==
                            true &&
                            runningId !==
                            state.activeAppId
                        );

                    }
                );


            if (
                removable
            ) {

                await stopApp(
                    removable
                );

            }
            else {

                log(
                    "Maximale Anzahl laufender Apps erreicht.",
                    "warning"
                );


                return false;

            }

        }


        /*
         * Abhängigkeiten prüfen.
         */

        const dependencies =
            Array.isArray(
                definition.dependencies
            )
                ? definition.dependencies
                : [];


        for (
            const dependency
            of dependencies
        ) {

            const dependencyId =
                normalizeAppId(
                    dependency
                );


            if (
                !dependencyId
            ) {

                continue;

            }


            if (
                !has(
                    dependencyId
                )
            ) {

                log(
                    `Abhängigkeit fehlt: ${id} → ${dependencyId}`,
                    "warning"
                );


                emit(
                    "app:error",
                    {

                        appId:
                            id,

                        reason:
                            "dependency-missing",

                        dependency:
                            dependencyId

                    }
                );


                return false;

            }

        }


        /*
         * Vorherige App merken.
         */

        const previousId =
            state.activeAppId;


        if (
            previousId
        ) {

            state.previousAppId =
                previousId;

        }


        /*
         * App starten.
         */

        const started =
            await startApp(
                id,
                options
            );


        if (
            !started
        ) {

            return false;

        }


        /*
         * Aktive App setzen.
         */

        state.activeAppId =
            id;


        state.openedApps.add(
            id
        );


        state.runningApps.add(
            id
        );


        emit(
            "app:opened",
            {

                appId:
                    id,

                definition,

                previousAppId:
                    previousId,

                options

            }
        );


        emit(
            "app:active",
            {

                appId:
                    id,

                definition,

                previousAppId:
                    previousId

            }
        );


        /*
         * Router informieren.
         */

        const router =
            getRouter();


        if (
            router &&
            options.navigate !==
            false &&
            typeof router.navigate ===
            "function"
        ) {

            try {

                await router.navigate(
                    id,
                    {
                        ...options,
                        fromManager:
                            true
                    }
                );

            }
            catch (
                error
            ) {

                log(
                    `Router-Navigation fehlgeschlagen: ${error.message}`,
                    "warning"
                );

            }

        }


        return true;

    }


    /* ========================================================
       19 — APP STARTEN
       ======================================================== */

    async function startApp(
        appId,
        options = {}
    ) {

        const id =
            normalizeAppId(
                appId
            );


        const definition =
            getAppDefinition(
                id
            );


        if (
            !definition
        ) {

            return false;

        }


        if (
            state.startedApps.has(
                id
            )
        ) {

            return true;

        }


        const module =
            getModule(
                id
            );


        state.startedApps.add(
            id
        );


        state.runningApps.add(
            id
        );


        /*
         * Modul-Lifecycle.
         */

        if (
            module
        ) {

            try {

                if (
                    typeof module.initialize ===
                    "function"
                ) {

                    await module.initialize(
                        {

                            app:
                                definition,

                            manager:
                                api,

                            options

                        }
                    );

                }


                if (
                    typeof module.init ===
                    "function"
                ) {

                    await module.init(
                        {

                            app:
                                definition,

                            manager:
                                api,

                            options

                        }
                    );

                }


                if (
                    typeof module.start ===
                    "function"
                ) {

                    await module.start(
                        {

                            app:
                                definition,

                            manager:
                                api,

                            options

                        }
                    );

                }

            }
            catch (
                error
            ) {

                state.lastError =
                    error;


                state.startedApps.delete(
                    id
                );


                state.runningApps.delete(
                    id
                );


                log(
                    `Startfehler bei ${id}: ${error.message}`,
                    "error"
                );


                emit(
                    "app:error",
                    {

                        appId:
                            id,

                        error,

                        reason:
                            "start-failed"

                    }
                );


                return false;

            }

        }


        emit(
            "app:started",
            {

                appId:
                    id,

                definition,

                module:
                    module || null

            }
        );


        return true;

    }


    /* ========================================================
       20 — APP STOPPEN
       ======================================================== */

    async function stopApp(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        if (
            !id
        ) {

            return false;

        }


        const definition =
            getAppDefinition(
                id
            );


        if (
            !definition
        ) {

            return false;

        }


        /*
         * Kritische System-App nicht
         * automatisch stoppen.
         */

        if (
            definition.critical ===
            true &&
            id ===
            state.activeAppId
        ) {

            log(
                `Kritische aktive App wird nicht gestoppt: ${id}`,
                "warning"
            );


            return false;

        }


        const module =
            getModule(
                id
            );


        if (
            module
        ) {

            try {

                if (
                    typeof module.stop ===
                    "function"
                ) {

                    await module.stop(
                        {

                            app:
                                definition,

                            manager:
                                api

                        }
                    );

                }


                if (
                    typeof module.destroy ===
                    "function"
                ) {

                    await module.destroy(
                        {

                            app:
                                definition,

                            manager:
                                api

                        }
                    );

                }

            }
            catch (
                error
            ) {

                state.lastError =
                    error;


                log(
                    `Fehler beim Stoppen von ${id}: ${error.message}`,
                    "warning"
                );

            }

        }


        state.runningApps.delete(
            id
        );


        state.startedApps.delete(
            id
        );


        if (
            state.activeAppId ===
            id
        ) {

            state.previousAppId =
                id;

            state.activeAppId =
                null;

        }


        emit(
            "app:stopped",
            {

                appId:
                    id,

                definition

            }
        );


        return true;

    }


    /* ========================================================
       21 — APP SCHLIESSEN
       ======================================================== */

    async function closeApp(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        if (
            !id
        ) {

            return false;

        }


        const definition =
            getAppDefinition(
                id
            );


        if (
            !definition
        ) {

            return false;

        }


        /*
         * Schließen bedeutet:
         * App nicht mehr aktiv.
         *
         * Die App darf aber weiterlaufen,
         * wenn das Modul das unterstützt.
         */

        if (
            state.activeAppId ===
            id
        ) {

            state.previousAppId =
                id;


            state.activeAppId =
                null;

        }


        state.openedApps.delete(
            id
        );


        emit(
            "app:closed",
            {

                appId:
                    id,

                definition

            }
        );


        return true;

    }


    /* ========================================================
       22 — APP RESTARTEN
       ======================================================== */

    async function restartApp(
        appId,
        options = {}
    ) {

        const id =
            normalizeAppId(
                appId
            );


        if (
            !id
        ) {

            return false;

        }


        await stopApp(
            id
        );


        return openApp(
            id,
            options
        );

    }


    /* ========================================================
       23 — AKTIVE APP
       ======================================================== */

    function getActiveApp() {

        if (
            !state.activeAppId
        ) {

            return null;

        }


        return getAppDefinition(
            state.activeAppId
        );

    }


    /* ========================================================
       24 — AKTIVE APP-ID
       ======================================================== */

    function getActiveAppId() {

        return (
            state.activeAppId ||
            null
        );

    }


    /* ========================================================
       25 — VORHERIGE APP
       ======================================================== */

    function getPreviousApp() {

        if (
            !state.previousAppId
        ) {

            return null;

        }


        return getAppDefinition(
            state.previousAppId
        );

    }


    /* ========================================================
       26 — LAUFENDE APPS
       ======================================================== */

    function getRunningApps() {

        return Array.from(
            state.runningApps
        )
        .map(
            id =>
                getAppDefinition(
                    id
                )
        )
        .filter(
            Boolean
        );

    }


    /* ========================================================
       27 — GEÖFFNETE APPS
       ======================================================== */

    function getOpenedApps() {

        return Array.from(
            state.openedApps
        )
        .map(
            id =>
                getAppDefinition(
                    id
                )
        )
        .filter(
            Boolean
        );

    }


    /* ========================================================
       28 — FAVORITEN
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
       29 — KATEGORIE
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
       30 — APP-SUCHE
       ======================================================== */

    function searchApps(
        query
    ) {

        const registry =
            getRegistry();


        if (
            registry &&
            typeof registry.search ===
            "function"
        ) {

            return registry.search(
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

                    const searchable = [

                        app.id,

                        app.name,

                        app.title,

                        app.category,

                        app.description,

                        ...(Array.isArray(
                            app.keywords
                        )
                            ? app.keywords
                            : []),

                        ...(Array.isArray(
                            app.capabilities
                        )
                            ? app.capabilities
                            : [])

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
       31 — APP REGISTRIEREN
       ======================================================== */

    function register(
        definition
    ) {

        const registry =
            getRegistry();


        if (
            !registry ||
            typeof registry.register !==
            "function"
        ) {

            log(
                "App Registry ist nicht verfügbar.",
                "warning"
            );


            return false;

        }


        const result =
            registry.register(
                definition
            );


        if (
            result
        ) {

            emit(
                "app:registered",
                definition
            );

        }


        return result;

    }


    /* ========================================================
       32 — APP ENTFERNEN
       ======================================================== */

    async function unregister(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        const definition =
            getAppDefinition(
                id
            );


        if (
            !definition
        ) {

            return false;

        }


        if (
            state.runningApps.has(
                id
            )
        ) {

            await stopApp(
                id
            );

        }


        const registry =
            getRegistry();


        if (
            !registry ||
            typeof registry.unregister !==
            "function"
        ) {

            return false;

        }


        const result =
            registry.unregister(
                id
            );


        if (
            result
        ) {

            state.openedApps.delete(
                id
            );


            state.runningApps.delete(
                id
            );


            state.startedApps.delete(
                id
            );


            emit(
                "app:unregistered",
                {

                    appId:
                        id,

                    definition

                }
            );

        }


        return result;

    }


    /* ========================================================
       33 — HOME
       ======================================================== */

    async function openHome(
        options = {}
    ) {

        /*
         * HalDo Home bevorzugen.
         */

        if (
            has(
                "haldo-home"
            )
        ) {

            return openApp(
                "haldo-home",
                options
            );

        }


        if (
            has(
                "home"
            )
        ) {

            return openApp(
                "home",
                options
            );

        }


        if (
            has(
                "dashboard"
            )
        ) {

            return openApp(
                "dashboard",
                options
            );

        }


        log(
            "Keine Home-App in der Registry gefunden.",
            "warning"
        );


        return false;

    }


    /* ========================================================
       34 — ROUTER VERBINDEN
       ======================================================== */

    function connectRouter() {

        const router =
            getRouter();


        if (
            !router
        ) {

            state.routerReady =
                false;


            return false;

        }


        state.routerReady =
            true;


        emit(
            "router:ready",
            router
        );


        return true;

    }


    /* ========================================================
       35 — APP MANAGER DIAGNOSE
       ======================================================== */

    function diagnose() {

        const apps =
            getAllApps();


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
                isRegistryReady(),

            routerReady:
                Boolean(
                    getRouter()
                ),

            appCount:
                apps.length,

            activeAppId:
                state.activeAppId,

            previousAppId:
                state.previousAppId,

            runningApps:
                Array.from(
                    state.runningApps
                ),

            openedApps:
                Array.from(
                    state.openedApps
                ),

            startedApps:
                Array.from(
                    state.startedApps
                ),

            runningCount:
                state.runningApps.size,

            openedCount:
                state.openedApps.size,

            startedCount:
                state.startedApps.size,

            operationCount:
                state.operationCount,

            lastError:
                state.lastError,

            startTime:
                state.startTime

        };

    }


    /* ========================================================
       36 — INITIALISIERUNG
       ======================================================== */

    function initialize() {

        if (
            state.initialized
        ) {

            return true;

        }


        state.startTime =
            Date.now();


        state.registryReady =
            isRegistryReady();


        /*
         * Falls Registry bereits existiert,
         * sicherstellen, dass sie aufgebaut ist.
         */

        const registry =
            getRegistry();


        if (
            registry &&
            typeof registry.initialize ===
            "function"
        ) {

            try {

                registry.initialize();

            }
            catch (
                error
            ) {

                state.lastError =
                    error;


                log(
                    `Registry-Initialisierung fehlgeschlagen: ${error.message}`,
                    "warning"
                );

            }

        }


        state.registryReady =
            isRegistryReady();


        /*
         * Globale Container vorbereiten.
         */

        getAppContainer();

        getModuleContainer();


        /*
         * Router verbinden, falls bereits
         * vorhanden.
         */

        connectRouter();


        /*
         * Öffentliche globale Referenzen.
         */

        window.HalDoAppManager =
            api;


        window.HalDo =
            window.HalDo ||
            {};


        window.HalDo.appManager =
            api;


        window.HalDoOS =
            window.HalDoOS ||
            {};


        window.HalDoOS.appManager =
            api;


        state.initialized =
            true;


        state.ready =
            true;


        emit(
            "ready",
            diagnose()
        );


        log(
            `${getAllApps().length} App-Definitionen verfügbar.`
        );


        return true;

    }


    /* ========================================================
       37 — ÖFFENTLICHE API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,

        initialize,

        on,

        off,

        emit,

        getRegistry,

        getRouter,

        getAllApps,

        getApp,

        find:
            getApp,

        has,

        getAppState,

        getModule,

        registerModule,

        register,

        unregister,

        openApp,

        startApp,

        stopApp,

        closeApp,

        restartApp,

        openHome,

        getActiveApp,

        getActiveAppId,

        getPreviousApp,

        getRunningApps,

        getOpenedApps,

        getFavorites,

        getAppsByCategory,

        searchApps,

        search:
            searchApps,

        connectRouter,

        diagnose,

        isReady() {

            return state.ready;

        }

    };


    /* ========================================================
       38 — GLOBALE REFERENZEN
       ======================================================== */

    window.HalDoAppManager =
        api;


    window.HalDo =
        window.HalDo ||
        {};


    window.HalDo.appManager =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appManager =
        api;


    /* ========================================================
       39 — EVENTS ZUR VERBINDUNG
       ======================================================== */

    window.addEventListener(
        "haldo:app-registry-ready",
        function () {

            state.registryReady =
                isRegistryReady();


            emit(
                "registry:ready",
                getRegistry()
            );

        }
    );


    window.addEventListener(
        "haldo:app-router-ready",
        function () {

            connectRouter();

        }
    );


    /* ========================================================
       40 — BOOT
       ======================================================== */

    function boot() {

        try {

            initialize();

        }
        catch (
            error
        ) {

            state.lastError =
                error;


            log(
                `Initialisierungsfehler: ${error.message}`,
                "error"
            );

        }

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


    /* ========================================================
       41 — DEBUG
       ======================================================== */

    console.log(
        "=============================================="
    );

    console.log(
        "HalDo AI OS 18 App Manager"
    );

    console.log(
        "Professional Ultimate Foundation"
    );

    console.log(
        "Registry-Verbindung:",
        Boolean(
            getRegistry()
        )
    );

    console.log(
        "Apps:",
        getAllApps().length
    );

    console.log(
        "=============================================="
    );


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 APP MANAGER
   ============================================================ */