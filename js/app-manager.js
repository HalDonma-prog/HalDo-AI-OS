/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/app-manager.js

   AUFGABE:
   - Zentrale Verwaltung aller HalDo Apps
   - HalDoAppRegistry bleibt die einzige App-Datenquelle
   - Keine zweite permanente App-Liste
   - Apps suchen
   - Apps nach Kategorie filtern
   - Favoriten verwalten
   - Apps aktivieren/deaktivieren
   - App-Status verwalten
   - App-Module erkennen
   - Sichere App-Öffnung vorbereiten
   - Keine blinden HTML-Weiterleitungen
   - Verbindung mit Kernel
   - Verbindung mit System
   - Verbindung mit App Router
   - Zukunftssichere Modul-Schnittstelle
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

        maxRegistryWait:
            10000,

        registryCheckInterval:
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

        appCount:
            0,

        activeApp:
            null,

        lastOpenedApp:
            null,

        lastError:
            null,

        startedAt:
            null

    };


    /* ========================================================
       03 — LAUFZEIT-STATUS
       --------------------------------------------------------
       WICHTIG:
       Diese Map enthält KEINE App-Definitionen.

       Sie enthält ausschließlich Runtime-Zustände:
       - loaded
       - running
       - enabled
       - error
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


        /*
         * Neue Registry-API.
         */

        if (
            typeof registry.getAllApps ===
            "function"
        ) {

            return true;

        }


        /*
         * Kompatibilität mit der
         * vorhandenen Registry-Version.
         */

        if (
            typeof registry.getAll ===
            "function"
        ) {

            return true;

        }


        return false;

    }


    /* ========================================================
       08 — ALLE APPS AUS REGISTRY
       ======================================================== */

    function getAllApps() {

        const registry =
            getRegistry();


        if (
            !registry
        ) {

            return [];

        }


        /*
         * Bevorzugte API.
         */

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


        /*
         * Kompatibilitäts-API.
         */

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


        return [];

    }


    /* ========================================================
       09 — APP NORMALISIEREN
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
       10 — APP AUS REGISTRY HOLEN
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


        /*
         * Bevorzugt findApp().
         */

        if (
            typeof registry.findApp ===
            "function"
        ) {

            return (
                registry.findApp(
                    normalized
                ) ||
                null
            );

        }


        /*
         * Vorhandene Registry-Version
         * verwendet find().
         */

        if (
            typeof registry.find ===
            "function"
        ) {

            return (
                registry.find(
                    normalized
                ) ||
                null
            );

        }


        /*
         * Weitere Kompatibilität.
         */

        if (
            typeof registry.getApp ===
            "function"
        ) {

            return (
                registry.getApp(
                    normalized
                ) ||
                null
            );

        }


        const apps =
            getAllApps();


        return (
            apps.find(
                app =>
                    normalizeAppId(
                        app.id
                    ) ===
                    normalized
            ) ||
            null
        );

    }


    /* ========================================================
       11 — APP VORHANDEN?
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
       12 — KOMPATIBILITÄTS-REGISTER
       --------------------------------------------------------
       Die Registry bleibt Eigentümerin der App-Definitionen.

       Diese Funktion fügt NICHT heimlich eine zweite
       permanente App-Liste hinzu.

       Sie akzeptiert bereits registrierte Apps und stellt
       damit die Schnittstelle bereit, die ältere Registry-
       Versionen erwarten.
       ======================================================== */

    function register(
        definition
    ) {

        if (
            !definition ||
            !definition.id
        ) {

            return false;

        }


        const existing =
            getApp(
                definition.id
            );


        if (
            existing
        ) {

            return true;

        }


        /*
         * Falls die Registry selbst eine register()-API
         * besitzt, darf sie die Definition übernehmen.
         */

        const registry =
            getRegistry();


        if (
            registry &&
            typeof registry.register ===
            "function"
        ) {

            try {

                return Boolean(
                    registry.register(
                        definition
                    )
                );

            }
            catch (
                error
            ) {

                log(
                    `Registry-Registrierung fehlgeschlagen: ${error.message}`,
                    "error"
                );

            }

        }


        /*
         * Die aktuelle Registry-Version baut ihre
         * Definitionen über build() auf.
         *
         * Deshalb wird hier bewusst KEINE zweite
         * App-Liste erzeugt.
         */

        log(
            `App "${definition.id}" ist noch nicht in der Registry vorhanden.`,
            "warning"
        );


        return false;

    }


    /* ========================================================
       13 — ENABLED APPS
       ======================================================== */

    function getEnabledApps() {

        const registry =
            getRegistry();


        if (
            registry &&
            typeof registry.getEnabledApps ===
            "function"
        ) {

            const apps =
                registry.getEnabledApps();


            if (
                Array.isArray(
                    apps
                )
            ) {

                return apps;

            }

        }


        return getAllApps()
            .filter(
                app =>
                    app &&
                    app.enabled !==
                    false
            );

    }


    /* ========================================================
       14 — FAVORITEN
       ======================================================== */

    function getFavorites() {

        const registry =
            getRegistry();


        if (
            registry &&
            typeof registry.getFavorites ===
            "function"
        ) {

            const apps =
                registry.getFavorites();


            if (
                Array.isArray(
                    apps
                )
            ) {

                return apps;

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
       15 — KATEGORIEN
       ======================================================== */

    function getCategories() {

        const registry =
            getRegistry();


        if (
            registry &&
            typeof registry.getCategories ===
            "function"
        ) {

            const categories =
                registry.getCategories();


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
                            app.category
                        );

                    }

                }
            );


        return Array.from(
            categories
        );

    }


    /* ========================================================
       16 — APPS NACH KATEGORIE
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

            const apps =
                registry.getAppsByCategory(
                    category
                );


            if (
                Array.isArray(
                    apps
                )
            ) {

                return apps;

            }

        }


        const normalized =
            String(
                category ||
                ""
            )
            .trim()
            .toLowerCase();


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
       17 — APP SUCHE
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

            const result =
                registry.searchApps(
                    query
                );


            if (
                Array.isArray(
                    result
                )
            ) {

                return result;

            }

        }


        if (
            registry &&
            typeof registry.search ===
            "function"
        ) {

            const result =
                registry.search(
                    query
                );


            if (
                Array.isArray(
                    result
                )
            ) {

                return result;

            }

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
                            Boolean
                        )
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
       18 — RUNTIME-STATUS ERSTELLEN
       ======================================================== */

    function createRuntimeState(
        app
    ) {

        return {

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
                null,

            startedAt:
                null,

            stoppedAt:
                null

        };

    }


    /* ========================================================
       19 — STATUS INITIALISIEREN
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
                        createRuntimeState(
                            app
                        )
                    );

                }

                else {

                    const current =
                        appStates.get(
                            app.id
                        );


                    /*
                     * Registry-Status synchronisieren,
                     * ohne Runtime-Daten zu verlieren.
                     */

                    current.enabled =
                        app.enabled !==
                        false;

                }

            }
        );


        state.appCount =
            apps.length;


        return state.appCount;

    }


    /* ========================================================
       20 — APP-STATUS HOLEN
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
                createRuntimeState(
                    app
                )
            );

        }


        const runtime =
            appStates.get(
                app.id
            );


        return {
            ...runtime
        };

    }


    /* ========================================================
       21 — APP AKTIVIEREN
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

                status:
                    "not-found",

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

            status:
                "enabled",

            app,

            state:
                getAppState(
                    app.id
                )

        };

    }


    /* ========================================================
       22 — APP DEAKTIVIEREN
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

                status:
                    "not-found",

                error:
                    "App nicht gefunden."

            };

        }


        /*
         * Kritische System-Apps dürfen nicht
         * versehentlich deaktiviert werden.
         */

        if (
            app.critical ===
            true
        ) {

            return {

                success:
                    false,

                status:
                    "critical",

                error:
                    "Eine kritische System-App kann nicht deaktiviert werden.",

                app

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
                    false,

                stoppedAt:
                    Date.now()

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

            status:
                "disabled",

            app,

            state:
                getAppState(
                    app.id
                )

        };

    }


    /* ========================================================
       23 — APP AKTIV?
       ======================================================== */

    function isAppEnabled(
        appId
    ) {

        const appState =
            getAppState(
                appId
            );


        return Boolean(
            appState &&
            appState.enabled ===
            true
        );

    }


    /* ========================================================
       24 — APP-MODUL NORMALISIEREN
       ======================================================== */

    function getModuleNames(
        appId
    ) {

        const normalized =
            normalizeAppId(
                appId
            );


        const camel =
            normalized.replace(
                /-([a-z])/g,
                (
                    _match,
                    letter
                ) =>
                    letter.toUpperCase()
            );


        return [

            normalized,

            camel

        ];

    }


    /* ========================================================
       25 — APP-MODUL SUCHEN
       ======================================================== */

    function findAppModule(
        appId
    ) {

        const names =
            getModuleNames(
                appId
            );


        /*
         * Zentrale Modul-Registry.
         */

        if (
            window.HalDoAppModules
        ) {

            for (
                const name
                of names
            ) {

                if (
                    window.HalDoAppModules[
                        name
                    ]
                ) {

                    return window.HalDoAppModules[
                        name
                    ];

                }

            }

        }


        /*
         * HalDoApps bleibt als
         * Modul-Kompatibilität erhalten.
         */

        if (
            window.HalDoApps
        ) {

            for (
                const name
                of names
            ) {

                if (
                    window.HalDoApps[
                        name
                    ]
                ) {

                    return window.HalDoApps[
                        name
                    ];

                }

            }

        }


        /*
         * Direkte globale Modulnamen.
         */

        for (
            const name
            of names
        ) {

            const candidates = [

                `HalDoApp_${name}`,

                `HalDo_${name}`

            ];


            for (
                const candidate
                of candidates
            ) {

                if (
                    window[
                        candidate
                    ]
                ) {

                    return window[
                        candidate
                    ];

                }

            }

        }


        return null;

    }


    /* ========================================================
       26 — APP VORBEREITEN
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

                error:
                    "Die angeforderte App ist nicht registriert.",

                appId:
                    normalized

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
            !appState ||
            !appState.enabled ||
            app.enabled ===
            false
        ) {

            const result = {

                success:
                    false,

                status:
                    "disabled",

                error:
                    "Diese App ist derzeit deaktiviert.",

                app,

                appState

            };


            state.lastError =
                result.error;


            emit(
                "app-error",
                result
            );


            return result;

        }


        const module =
            findAppModule(
                app.id
            );


        return {

            success:
                true,

            status:
                "ready",

            app,

            appState,

            module,

            moduleAvailable:
                Boolean(
                    module
                )

        };

    }


    /* ========================================================
       27 — APP ÖFFNEN
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
         * Bereits aktive App stoppen.
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
                    null,

                startedAt:
                    Date.now(),

                stoppedAt:
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
                    ),

                module:
                    prepared.module

            }
        );


        /*
         * Echtes Modul ausführen.
         */

        if (
            prepared.module
        ) {

            const module =
                prepared.module;


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
                else if (
                    typeof module.init ===
                    "function"
                ) {

                    await module.init(
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
         * Kein Modul vorhanden.
         *
         * Wichtig:
         * KEINE HTML-Weiterleitung.
         * KEIN window.location.
         * KEIN erfundener Dateipfad.
         *
         * Der Router kann dafür eine
         * sichere Fallback-Oberfläche anzeigen.
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
       28 — APP STOPPEN
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

                status:
                    "not-found",

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
                    false,

                stoppedAt:
                    Date.now()

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

            status:
                "stopped",

            app

        };

    }


    /* ========================================================
       29 — APP NEU LADEN
       ======================================================== */

    async function reloadApp(
        appId
    ) {

        const normalized =
            normalizeAppId(
                appId ||
                state.activeApp
            );


        if (
            !normalized
        ) {

            return {

                success:
                    false,

                error:
                    "Keine App zum Neuladen angegeben."

            };

        }


        await stopApp(
            normalized
        );


        return openApp(
            normalized
        );

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


    /* ========================================================
       31 — SORTIERTE APPS
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
                        ) ||
                        999999;


                    const orderB =
                        Number(
                            b.order
                        ) ||
                        999999;


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
                        a.id ||
                        ""
                    )
                    .localeCompare(
                        String(
                            b.name ||
                            b.id ||
                            ""
                        ),
                        "de"
                    );

                }
            );

    }


    /* ========================================================
       32 — SORTIERTE FAVORITEN
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
                        ) ||
                        999999;


                    const orderB =
                        Number(
                            b.order
                        ) ||
                        999999;


                    return (
                        orderA -
                        orderB
                    );

                }
            );

    }


    /* ========================================================
       33 — APP COUNT
       ======================================================== */

    function getAppCount() {

        return getAllApps().length;

    }


    /* ========================================================
       34 — APP-MODUL REGISTRIEREN
       --------------------------------------------------------
       Zukünftige echte Apps können damit verbunden werden:

       registerModule("calendar", module);

       Die App-Definition bleibt trotzdem in der Registry.
       ======================================================== */

    function registerModule(
        appId,
        module
    ) {

        const normalized =
            normalizeAppId(
                appId
            );


        if (
            !normalized ||
            !module ||
            typeof module !==
            "object"
        ) {

            return false;

        }


        window.HalDoAppModules =
            window.HalDoAppModules ||
            {};


        window.HalDoAppModules[
            normalized
        ] =
            module;


        emit(
            "module-registered",
            {

                appId:
                    normalized,

                module

            }
        );


        log(
            `App-Modul registriert: ${normalized}`
        );


        return true;

    }


    /* ========================================================
       35 — APP-MODUL ENTFERNEN
       ======================================================== */

    function unregisterModule(
        appId
    ) {

        const normalized =
            normalizeAppId(
                appId
            );


        if (
            !window.HalDoAppModules ||
            !window.HalDoAppModules[
                normalized
            ]
        ) {

            return false;

        }


        delete window.HalDoAppModules[
            normalized
        ];


        emit(
            "module-unregistered",
            {

                appId:
                    normalized

            }
        );


        return true;

    }


    /* ========================================================
       36 — DIAGNOSE
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
                registryReady(),

            appCount:
                apps.length,

            enabledCount:
                getEnabledApps().length,

            favoriteCount:
                getFavorites().length,

            categoryCount:
                getCategories().length,

            activeApp:
                getActiveApp(),

            moduleCount:
                window.HalDoAppModules
                    ? Object.keys(
                        window.HalDoAppModules
                    ).length
                    : 0,

            runtimeStates:
                Array.from(
                    appStates.values()
                )

        };

    }


    /* ========================================================
       37 — SYSTEM STATUS
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
                state.lastError,

            startedAt:
                state.startedAt

        };

    }


    /* ========================================================
       38 — KERNEL VERBINDUNG
       ======================================================== */

    function connectKernel() {

        const kernel =
            window.HalDoKernel;


        if (
            !kernel
        ) {

            return false;

        }


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


        return true;

    }


    /* ========================================================
       39 — SYSTEM VERBINDUNG
       ======================================================== */

    function connectSystem() {

        const system =
            window.HalDoSystem;


        if (
            !system
        ) {

            return false;

        }


        if (
            typeof system.registerService ===
            "function"
        ) {

            system.registerService(
                "app-manager",
                api
            );


            return true;

        }


        return false;

    }


    /* ========================================================
       40 — ROUTER VERBINDUNG
       ======================================================== */

    function connectRouter() {

        const router =
            window.HalDoAppRouter;


        if (
            !router
        ) {

            return false;

        }


        emit(
            "router-connected",
            {

                router

            }
        );


        return true;

    }


    /* ========================================================
       41 — INITIALISIERUNG
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


        state.startedAt =
            Date.now();


        state.lastError =
            null;


        connectKernel();

        connectSystem();

        connectRouter();


        emit(
            "ready",
            getState()
        );


        /*
         * Die Registry wartet auf dieses Event.
         * Dadurch funktioniert auch die umgekehrte
         * Script-Reihenfolge.
         */

        emit(
            "haldo:app-manager-ready",
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

            /*
             * Ältere Browser ohne CustomEvent-
             * Konstruktor werden nicht kritisch.
             */

            log(
                "App-Manager-Ready-Event konnte nicht als DOM-Event gesendet werden.",
                "warning"
            );

        }


        log(
            `${state.appCount} Apps aus der Registry verfügbar.`
        );


        return getState();

    }


    /* ========================================================
       42 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,


        init,


        on,

        off,


        /*
         * Registry-Kompatibilität
         */

        has,

        register,


        /*
         * App-Zugriff
         */

        getApp,

        getAllApps,

        getEnabledApps,

        getFavorites,

        getCategories,

        getAppsByCategory,

        search,


        /*
         * Status
         */

        getAppState,

        enableApp,

        disableApp,

        isAppEnabled,


        /*
         * Öffnen / Schließen
         */

        prepareApp,

        openApp,

        stopApp,

        reloadApp,


        /*
         * Module
         */

        findAppModule,

        registerModule,

        unregisterModule,


        /*
         * Navigation / Übersicht
         */

        getActiveApp,

        getSortedApps,

        getSortedFavorites,

        getAppCount,


        /*
         * System
         */

        getState,

        diagnose

    };


    /* ========================================================
       43 — GLOBALE VERBINDUNGEN
       ======================================================== */

    window.HalDoAppManager =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appManager =
        api;


    /*
     * Modulcontainer wird zentral vorbereitet.
     */

    window.HalDoAppModules =
        window.HalDoAppModules ||
        {};


    /*
     * HalDoApps bleibt als Kompatibilitätscontainer
     * bestehen. Es ist KEINE App-Definitionsliste.
     */

    window.HalDoApps =
        window.HalDoApps ||
        {};


    /* ========================================================
       44 — BOOT
       ======================================================== */

    function boot() {

        /*
         * Falls die Registry bereits vorhanden ist,
         * sofort initialisieren.
         */

        if (
            registryReady()
        ) {

            init();

            return;

        }


        /*
         * Registry kann durch Script-Reihenfolge
         * später erscheinen.
         */

        let elapsed =
            0;


        const timer =
            window.setInterval(
                function () {

                    elapsed +=
                        CONFIG.registryCheckInterval;


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
                        elapsed >=
                        CONFIG.maxRegistryWait
                    ) {

                        window.clearInterval(
                            timer
                        );


                        state.lastError =
                            "HalDoAppRegistry konnte innerhalb der vorgesehenen Zeit nicht geladen werden.";


                        log(
                            state.lastError,
                            "error"
                        );

                    }

                },
                CONFIG.registryCheckInterval
            );

    }


    /* ========================================================
       45 — DOM START
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