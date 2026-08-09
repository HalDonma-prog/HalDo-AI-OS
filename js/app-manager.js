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
   - Registry ist die zentrale Quelle der App-Definitionen
   - Manager besitzt keine zweite unabhängige App-Liste
   - kompatibel mit alter und neuer Registry-API
   - keine register()-Endlosschleife
   - vorbereitet für dynamische Apps
   - vorbereitet für echte App-Module
   - App-Zustände
   - Favoriten
   - Kategorien
   - Suche
   - Aktivieren / Deaktivieren
   - Öffnen / Schließen
   - Events
   - Kernel-Verbindung
   - System-Verbindung
   - Router-Verbindung
   - Diagnose
   - Persistenz-Vorbereitung
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

        storageKey:
            "haldo.app-manager.state",

        readyEvent:
            "haldo:app-manager-ready",

        registryReadyEvent:
            "haldo:app-registry-ready",

        routerReadyEvent:
            "haldo:app-router-ready"

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
            0,

        registryConnected:
            false,

        routerConnected:
            false,

        systemConnected:
            false,

        kernelConnected:
            false

    };


    /* ========================================================
       03 — APP STATUS
       ======================================================== */

    const appStates =
        new Map();


    /* ========================================================
       04 — APP-MODUL REGISTRY
       ======================================================== */

    /*
     * Der Manager verwaltet hier KEINE App-Definitionen.
     *
     * Dieser Container enthält ausschließlich optionale
     * Laufzeit-Referenzen auf echte Module.
     *
     * Beispiel:
     *
     * window.HalDoApps["calendar"] = {
     *     render() {},
     *     open() {},
     *     close() {}
     * };
     */

    window.HalDoApps =
        window.HalDoApps ||
        {};


    window.HalDoAppModules =
        window.HalDoAppModules ||
        {};


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


        /*
         * Zusätzlich globales HalDo-Event.
         *
         * Dadurch können spätere Module
         * unabhängig vom Manager zuhören.
         */

        try {

            window.dispatchEvent(
                new CustomEvent(
                    `haldo:app-manager:${eventName}`,
                    {
                        detail:
                            data
                    }
                )
            );

        }
        catch (
            error
        ) {

            console.warn(
                "[HalDo App Manager] Globales Event konnte nicht gesendet werden.",
                error
            );

        }

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
       07 — REGISTRY HOLEN
       ======================================================== */

    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            null
        );

    }


    /* ========================================================
       08 — REGISTRY BEREIT?
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
            /\s+/g,
            "-"
        );

    }


    /* ========================================================
       10 — REGISTRY APPS HOLEN
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

            /*
             * Neue / zukünftige API
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
             * Aktuelle Registry API
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

            /*
             * Zukünftige Registry API
             */

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


            /*
             * Weitere mögliche API
             */

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


            /*
             * Aktuelle Registry API
             */

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
         * Letzter sicherer Fallback:
         * direkte Suche in der Registry.
         */

        const apps =
            getRegistryApps();


        return (
            apps.find(
                app =>
                    normalizeAppId(
                        app &&
                        app.id
                    ) ===
                    normalized
            ) ||
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
       13 — AKTIVIERTE APPS
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
       14 — KATEGORIEN
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
                        app &&
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

            return getAllApps()
                .slice(
                    0,
                    CONFIG.maxSearchResults
                );

        }


        const results =
            getAllApps()
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
                );


        return results.slice(
            0,
            CONFIG.maxSearchResults
        );

    }


    /* ========================================================
       17 — APP-STATUS ERSTELLEN
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
                null,

            closedAt:
                null,

            launchCount:
                0,

            lastStatus:
                "registered"

        };

    }


    /* ========================================================
       18 — STATUS INITIALISIEREN
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


        state.registryConnected =
            Boolean(
                getRegistry()
            );


        return true;

    }


    /* ========================================================
       19 — APP STATUS
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
       21 — FAVORIT SETZEN
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
       22 — FAVORIT UMSCHALTEN
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
       23 — EFFEKTIVER AKTIV-STATUS
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
       24 — INSTALLIERT?
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
       25 — AKTIVIERT?
       ======================================================== */

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
                    null,

                lastStatus:
                    "enabled"

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


        if (
            app.critical ===
            true
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
                    false,

                lastStatus:
                    "disabled"

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
       29 — APP-MODUL FINDEN
       ======================================================== */

    function findAppModule(
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
       30 — APP-MODUL REGISTRIEREN
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
            !module
        ) {

            return {

                success:
                    false,

                error:
                    "App-ID oder Modul fehlt."

            };

        }


        const app =
            getApp(
                normalized
            );


        if (
            !app
        ) {

            return {

                success:
                    false,

                error:
                    `App "${normalized}" ist nicht in der Registry registriert.`

            };

        }


        window.HalDoApps[
            normalized
        ] =
            module;


        window.HalDoAppModules[
            normalized
        ] =
            module;


        emit(
            "module-registered",
            {

                app,

                appId:
                    normalized,

                module

            }
        );


        return {

            success:
                true,

            app,

            appId:
                normalized,

            module

        };

    }


    /* ========================================================
       31 — APP-MODUL ENTFERNEN
       ======================================================== */

    function unregisterModule(
        appId
    ) {

        const normalized =
            normalizeAppId(
                appId
            );


        if (
            window.HalDoApps &&
            window.HalDoApps[
                normalized
            ]
        ) {

            delete window.HalDoApps[
                normalized
            ];

        }


        if (
            window.HalDoAppModules &&
            window.HalDoAppModules[
                normalized
            ]
        ) {

            delete window.HalDoAppModules[
                normalized
            ];

        }


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
       32 — MODUL VORHANDEN?
       ======================================================== */

    function hasModule(
        appId
    ) {

        return Boolean(
            findAppModule(
                appId
            )
        );

    }


    /* ========================================================
       33 — APP ÖFFNEN
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


        /*
         * Bereits laufende App:
         *
         * Nicht unnötig neu starten,
         * außer force=true.
         */

        if (
            state.activeApp ===
                app.id &&
            options.force !==
                true
        ) {

            return {

                success:
                    true,

                status:
                    "already-running",

                app,

                moduleAvailable:
                    hasModule(
                        app.id
                    )

            };

        }


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


        const openedAt =
            Date.now();


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

                openedAt,

                closedAt:
                    null,

                launchCount:
                    Number(
                        current.launchCount
                    ) + 1,

                lastStatus:
                    "opening"

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
         * ECHTES APP-MODUL
         * ----------------
         *
         * Unterstützte APIs:
         *
         * module.open(app)
         * module.start(app)
         * module.mount(app)
         *
         * Dadurch können zukünftige Apps
         * unterschiedlich aufgebaut werden,
         * ohne den Manager neu zu schreiben.
         */

        if (
            module
        ) {

            try {

                let result =
                    null;


                if (
                    typeof module.open ===
                    "function"
                ) {

                    result =
                        await module.open(
                            app,
                            options
                        );

                }
                else if (
                    typeof module.start ===
                    "function"
                ) {

                    result =
                        await module.start(
                            app,
                            options
                        );

                }
                else if (
                    typeof module.mount ===
                    "function"
                ) {

                    result =
                        await module.mount(
                            app,
                            options
                        );

                }


                appStates.set(
                    app.id,
                    {

                        ...getAppState(
                            app.id
                        ),

                        loaded:
                            true,

                        running:
                            true,

                        lastStatus:
                            "running",

                        error:
                            null

                    }
                );


                emit(
                    "app-opened",
                    {

                        app,

                        result,

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

                    result,

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

                        lastStatus:
                            "error",

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
                            message,

                        phase:
                            "open"

                    }
                );


                return {

                    success:
                        false,

                    status:
                        "module-error",

                    app,

                    error:
                        message,

                    moduleAvailable:
                        true

                };

            }

        }


        /*
         * NOCH KEIN MODUL
         *
         * Die App bleibt registriert.
         *
         * Kein 404.
         * Keine erfundene HTML-Datei.
         * Keine harte Weiterleitung.
         *
         * Der Router kann anschließend
         * eine Fallback-Oberfläche darstellen.
         */

        appStates.set(
            app.id,
            {

                ...getAppState(
                    app.id
                ),

                loaded:
                    false,

                running:
                    true,

                lastStatus:
                    "registered"

            }
        );


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
       34 — APP STOPPEN
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


        /*
         * Unterstützte Schließ-APIs:
         *
         * module.close()
         * module.stop()
         * module.unmount()
         */

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
                else if (
                    typeof module.unmount ===
                    "function"
                ) {

                    await module.unmount(
                        app
                    );

                }

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

                closedAt:
                    Date.now(),

                lastStatus:
                    "stopped"

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

            app,

            state:
                getAppState(
                    app.id
                )

        };

    }


    /* ========================================================
       35 — AKTIVE APP
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
       36 — APP COUNT
       ======================================================== */

    function getAppCount() {

        return getAllApps().length;

    }


    /* ========================================================
       37 — SORTIERTE APPS
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
                            a &&
                            a.order
                        ) || 999999;


                    const orderB =
                        Number(
                            b &&
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
                        a &&
                        (
                            a.name ||
                            a.title ||
                            a.id
                        ) ||
                        ""
                    )
                    .localeCompare(
                        String(
                            b &&
                            (
                                b.name ||
                                b.title ||
                                b.id
                            ) ||
                            ""
                        ),
                        "de"
                    );

                }
            );

    }


    /* ========================================================
       38 — FAVORITEN
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
       39 — SORTIERTE FAVORITEN
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
                            a &&
                            a.order
                        ) || 999999;


                    const orderB =
                        Number(
                            b &&
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
                        a &&
                        (
                            a.name ||
                            a.title ||
                            a.id
                        ) ||
                        ""
                    )
                    .localeCompare(
                        String(
                            b &&
                            (
                                b.name ||
                                b.title ||
                                b.id
                            ) ||
                            ""
                        ),
                        "de"
                    );

                }
            );

    }
        /* ========================================================
       40 — REGISTRY-SICHERE REGISTRIERUNG
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
     * WICHTIG:
     *
     * Der Manager darf NICHT einfach
     *
     * registry.register()
     *
     * aufrufen, wenn die Registry wiederum
     * manager.register() verwendet.
     *
     * Dadurch könnte eine Endlosschleife entstehen.
     *
     * Deshalb wird hier ausschließlich
     * eine vorhandene Registry-Registrierungs-API
     * verwendet, wenn diese ausdrücklich als
     * unabhängige Methode vorhanden ist.
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


        const normalized =
            normalizeAppId(
                definition.id
            );


        if (
            !normalized
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
         * Bereits vorhanden?
         */

        if (
            has(
                normalized
            )
        ) {

            return false;

        }


        /*
         * Bevorzugte zukünftige Registry-API.
         *
         * registerFromManager() ist absichtlich
         * anders benannt als manager.register().
         */

        if (
            typeof registry.registerFromManager ===
            "function"
        ) {

            const result =
                registry.registerFromManager(
                    {
                        ...definition,

                        id:
                            normalized

                    }
                );


            if (
                result
            ) {

                initializeAppStates();

                emit(
                    "app-registered",
                    {
                        app:
                            getApp(
                                normalized
                            )
                    }
                );

            }


            return Boolean(
                result
            );

        }


        /*
         * Sichere direkte Registry-Erweiterung,
         * wenn die Registry definitions besitzt.
         */

        if (
            Array.isArray(
                registry.definitions
            )
        ) {

            const exists =
                registry.definitions.some(
                    app =>
                        normalizeAppId(
                            app &&
                            app.id
                        ) ===
                        normalized
                );


            if (
                exists
            ) {

                return false;

            }


            const normalizedDefinition = {

                ...definition,

                id:
                    normalized,

                enabled:
                    definition.enabled !==
                    false,

                version:
                    definition.version ||
                    CONFIG.version,

                permissions:
                    Array.isArray(
                        definition.permissions
                    )
                        ? [
                            ...definition.permissions
                        ]
                        : [],

                dependencies:
                    Array.isArray(
                        definition.dependencies
                    )
                        ? [
                            ...definition.dependencies
                        ]
                        : []

            };


            registry.definitions.push(
                normalizedDefinition
            );


            initializeAppStates();


            emit(
                "app-registered",
                {

                    app:
                        normalizedDefinition

                }
            );


            return true;

        }


        return false;

    }


    /* ========================================================
       41 — APP STATUS SYNCHRONISIEREN
       ======================================================== */

    function synchronizeRegistry() {

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


                validIds.add(
                    app.id
                );


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


        /*
         * Zustände von Apps entfernen,
         * die nicht mehr in der Registry existieren.
         */

        Array.from(
            appStates.keys()
        )
        .forEach(
            appId => {

                if (
                    !validIds.has(
                        appId
                    )
                ) {

                    appStates.delete(
                        appId
                    );

                }

            }
        );


        state.appCount =
            apps.length;


        state.registryConnected =
            Boolean(
                getRegistry()
            );


        return true;

    }


    /* ========================================================
       42 — PERSISTENZ LADEN
       ======================================================== */

    function loadPersistedState() {

        try {

            const storage =
                window.localStorage;


            if (
                !storage
            ) {

                return false;

            }


            const raw =
                storage.getItem(
                    CONFIG.storageKey
                );


            if (
                !raw
            ) {

                return false;

            }


            const saved =
                JSON.parse(
                    raw
                );


            if (
                !saved ||
                typeof saved !==
                "object"
            ) {

                return false;

            }


            /*
             * Nur ungefährliche UI-Zustände
             * wiederherstellen.
             *
             * Keine Module.
             * Keine Funktionen.
             * Keine fremden Objekte.
             */

            if (
                saved.favorites &&
                Array.isArray(
                    saved.favorites
                )
            ) {

                saved.favorites
                    .forEach(
                        appId => {

                            const app =
                                getApp(
                                    appId
                                );


                            if (
                                app
                            ) {

                                const current =
                                    getAppState(
                                        app.id
                                    );


                                appStates.set(
                                    app.id,
                                    {

                                        ...current,

                                        favorite:
                                            true

                                    }
                                );

                            }

                        }
                    );

            }


            if (
                saved.disabled &&
                Array.isArray(
                    saved.disabled
                )
            ) {

                saved.disabled
                    .forEach(
                        appId => {

                            const app =
                                getApp(
                                    appId
                                );


                            if (
                                app &&
                                app.critical !==
                                true
                            ) {

                                const current =
                                    getAppState(
                                        app.id
                                    );


                                appStates.set(
                                    app.id,
                                    {

                                        ...current,

                                        enabled:
                                            false

                                    }
                                );

                            }

                        }
                    );

            }


            return true;

        }
        catch (
            error
        ) {

            log(
                `Gespeicherter App-Status konnte nicht geladen werden: ${error.message}`,
                "warning"
            );


            return false;

        }

    }


    /* ========================================================
       43 — PERSISTENZ SPEICHERN
       ======================================================== */

    function savePersistedState() {

        try {

            const storage =
                window.localStorage;


            if (
                !storage
            ) {

                return false;

            }


            const favorites =
                getFavorites()
                    .map(
                        app =>
                            app.id
                    );


            const disabled =
                getAllApps()
                    .filter(
                        app =>
                            !getEffectiveEnabled(
                                app
                            ) &&
                            app.critical !==
                            true
                    )
                    .map(
                        app =>
                            app.id
                    );


            const data = {

                version:
                    CONFIG.version,

                savedAt:
                    Date.now(),

                favorites,

                disabled

            };


            storage.setItem(
                CONFIG.storageKey,
                JSON.stringify(
                    data
                )
            );


            return true;

        }
        catch (
            error
        ) {

            log(
                `App-Status konnte nicht gespeichert werden: ${error.message}`,
                "warning"
            );


            return false;

        }

    }


    /* ========================================================
       44 — APP FAVORIT + PERSISTENZ
       ======================================================== */

    function persistFavorite(
        appId,
        favorite = true
    ) {

        const result =
            setFavorite(
                appId,
                favorite
            );


        if (
            result.success
        ) {

            savePersistedState();

        }


        return result;

    }


    /* ========================================================
       45 — APP AKTIVIEREN + PERSISTENZ
       ======================================================== */

    function enableAppPersistent(
        appId
    ) {

        const result =
            enableApp(
                appId
            );


        if (
            result.success
        ) {

            savePersistedState();

        }


        return result;

    }


    /* ========================================================
       46 — APP DEAKTIVIEREN + PERSISTENZ
       ======================================================== */

    function disableAppPersistent(
        appId
    ) {

        const result =
            disableApp(
                appId
            );


        if (
            result.success
        ) {

            savePersistedState();

        }


        return result;

    }


    /* ========================================================
       47 — ROUTER HOLEN
       ======================================================== */

    function getRouter() {

        return (
            window.HalDoAppRouter ||
            null
        );

    }


    /* ========================================================
       48 — APP ÜBER ROUTER ÖFFNEN
       ======================================================== */

    async function navigateToApp(
        appId,
        options = {}
    ) {

        const router =
            getRouter();


        if (
            router &&
            typeof router.navigate ===
            "function"
        ) {

            try {

                return await router.navigate(
                    appId,
                    options
                );

            }
            catch (
                error
            ) {

                state.lastError =
                    error.message;


                emit(
                    "app-error",
                    {

                        appId,

                        error:
                            error.message,

                        phase:
                            "navigation"

                    }
                );


                return {

                    success:
                        false,

                    error:
                        error.message

                };

            }

        }


        /*
         * Router ist noch nicht geladen.
         * App trotzdem über Manager öffnen.
         */

        return openApp(
            appId,
            options
        );

    }


    /* ========================================================
       49 — KERNEL VERBINDEN
       ======================================================== */

    function connectKernel() {

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


                state.kernelConnected =
                    true;


                return true;

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


        return false;

    }


    /* ========================================================
       50 — SYSTEM VERBINDEN
       ======================================================== */

    function connectSystem() {

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


                state.systemConnected =
                    true;


                return true;

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


        return false;

    }


    /* ========================================================
       51 — ROUTER VERBINDEN
       ======================================================== */

    function connectRouter() {

        const router =
            getRouter();


        state.routerConnected =
            Boolean(
                router
            );


        return state.routerConnected;

    }


    /* ========================================================
       52 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        synchronizeRegistry();


        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            initialized:
                state.initialized,

            ready:
                state.ready,

            registryConnected:
                state.registryConnected,

            routerConnected:
                state.routerConnected,

            systemConnected:
                state.systemConnected,

            kernelConnected:
                state.kernelConnected,

            appCount:
                getAppCount(),

            enabledCount:
                getEnabledApps().length,

            favoriteCount:
                getFavorites().length,

            activeApp:
                state.activeApp,

            lastOpenedApp:
                state.lastOpenedApp,

            lastError:
                state.lastError,

            navigationCount:
                state.navigationCount,

            modules:
                getAllApps()
                    .map(
                        app => ({

                            id:
                                app.id,

                            name:
                                app.name ||
                                app.title ||
                                app.id,

                            enabled:
                                getEffectiveEnabled(
                                    app
                                ),

                            moduleAvailable:
                                hasModule(
                                    app.id
                                ),

                            state:
                                getAppState(
                                    app.id
                                )

                        })
                    )

        };

    }


    /* ========================================================
       53 — SYSTEMSTATUS
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
                state.navigationCount,

            registryConnected:
                state.registryConnected,

            routerConnected:
                state.routerConnected,

            systemConnected:
                state.systemConnected,

            kernelConnected:
                state.kernelConnected

        };

    }


    /* ========================================================
       54 — INITIALISIERUNG
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


        /*
         * Registry verbinden.
         */

        state.registryConnected =
            true;


        /*
         * App-Zustände erzeugen.
         */

        initializeAppStates();


        /*
         * Gespeicherte UI-Zustände laden.
         */

        loadPersistedState();


        /*
         * Noch einmal synchronisieren,
         * damit neue Apps berücksichtigt werden.
         */

        synchronizeRegistry();


        /*
         * Systemverbindungen herstellen.
         */

        connectKernel();

        connectSystem();

        connectRouter();


        state.initialized =
            true;


        state.ready =
            true;


        state.lastError =
            null;


        /*
         * Bereit-Event.
         */

        emit(
            "ready",
            getState()
        );


        /*
         * Globales Ready-Event.
         *
         * app-registry.js wartet darauf.
         */

        try {

            window.dispatchEvent(
                new CustomEvent(
                    CONFIG.readyEvent,
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
       55 — PUBLIC API
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

        setFavorite:
            persistFavorite,

        toggleFavorite:
            function (
                appId
            ) {

                return persistFavorite(
                    appId,
                    !isFavorite(
                        appId
                    )
                );

            },


        getAppState,

        isInstalled,

        enableApp:
            enableAppPersistent,

        disableApp:
            disableAppPersistent,

        isAppEnabled,


        prepareApp,

        findAppModule,

        registerModule,

        unregisterModule,

        hasModule,


        openApp,

        stopApp,

        navigateToApp,


        getActiveApp,

        getSortedApps,

        getSortedFavorites,


        getAppCount,


        has,

        register,


        synchronizeRegistry,


        savePersistedState,

        loadPersistedState,


        getState,

        diagnose

    };


    /* ========================================================
       56 — GLOBALE API
       ======================================================== */

    window.HalDoAppManager =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appManager =
        api;


    /*
     * Gemeinsame App-Modulcontainer
     * für zukünftige echte Apps.
     */

    window.HalDoApps =
        window.HalDoApps ||
        {};


    window.HalDoAppModules =
        window.HalDoAppModules ||
        {};


    /* ========================================================
       57 — REGISTRY READY EVENT
       ======================================================== */

    window.addEventListener(
        CONFIG.registryReadyEvent,
        function () {

            if (
                !state.initialized &&
                registryReady()
            ) {

                init();

            }
            else {

                synchronizeRegistry();

            }

        }
    );


    /*
     * Auch das bisher verwendete Event
     * wird unterstützt.
     */

    window.addEventListener(
        "haldo:app-registry-ready",
        function () {

            if (
                !state.initialized &&
                registryReady()
            ) {

                init();

            }
            else {

                synchronizeRegistry();

            }

        }
    );


    /* ========================================================
       58 — ROUTER READY EVENT
       ======================================================== */

    window.addEventListener(
        CONFIG.routerReadyEvent,
        function () {

            connectRouter();

        }
    );


    window.addEventListener(
        "haldo:app-router-ready",
        function () {

            connectRouter();

        }
    );


    /* ========================================================
       59 — APP-MANAGER BOOT
       ======================================================== */

    function boot() {

        /*
         * Registry kann abhängig von der
         * HTML-Script-Reihenfolge später kommen.
         *
         * Deshalb kein harter Fehler.
         */

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
       60 — DOM START
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


    /* ========================================================
       61 — DEBUG / DIAGNOSE
       ======================================================== */

    window.HalDoAppManagerDebug = {

        getState,

        diagnose,

        getAllApps,

        getApp,

        getAppState,

        findAppModule,

        synchronizeRegistry

    };


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 APP MANAGER
   ============================================================ */