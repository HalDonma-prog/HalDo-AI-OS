/*
 * ============================================================
 * HalDo AI OS 20
 * Universal Application Registry
 * ============================================================
 *
 * Datei:
 *   js/haldo-v20-app-registry.js
 *
 * Aufgabe:
 *   Zentrale Verwaltung aller V20-Anwendungen.
 *
 * Verbindung:
 *
 *   Manifest
 *       ↓
 *   Registry
 *       ↓
 *   App Manager
 *       ↓
 *   Router
 *       ↓
 *   Window Manager
 *       ↓
 *   App Runtime
 *       ↓
 *   Event Bus
 *
 * ============================================================
 */

(function (window, document) {

    "use strict";


    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};


    const V20 =
        window.HalDoV20 =
        window.HalDoV20 || {};


    const registry =
        new Map();


    const runningApps =
        new Map();


    const appStates =
        new Map();


    const appInstances =
        new Map();


    const listeners =
        new Map();


    const Registry = {

        name:
            "HalDo V20 Application Registry",

        version:
            "20.0.0",

        ready:
            false
    };


    /* ========================================================
       NORMALIZE
    ======================================================== */

    function normalizeId(id) {

        return String(id || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
    }


    function clone(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;
        }


        try {

            return JSON.parse(
                JSON.stringify(value)
            );

        } catch (error) {

            return value;
        }
    }


    /* ========================================================
       INTERNAL EVENT
    ======================================================== */

    function emit(
        eventName,
        data
    ) {

        const handlers =
            listeners.get(
                eventName
            );


        if (!handlers) {
            return;
        }


        Array.from(
            handlers
        ).forEach(
            function (handler) {

                try {

                    handler(
                        data
                    );

                } catch (error) {

                    console.error(
                        "[HalDo Registry]",
                        error
                    );
                }

            }
        );
    }


    /* ========================================================
       ON
    ======================================================== */

    Registry.on = function (
        eventName,
        handler
    ) {

        if (
            !eventName ||
            typeof handler !==
            "function"
        ) {

            return function () {};
        }


        if (
            !listeners.has(
                eventName
            )
        ) {

            listeners.set(
                eventName,
                new Set()
            );
        }


        const set =
            listeners.get(
                eventName
            );


        set.add(
            handler
        );


        return function () {

            set.delete(
                handler
            );

        };
    };


    /* ========================================================
       REGISTER
    ======================================================== */

    Registry.register = function (
        definition
    ) {

        if (
            !definition ||
            !definition.id
        ) {

            console.error(
                "[HalDo Registry]",
                "Ungültige App-Definition."
            );

            return false;
        }


        const id =
            normalizeId(
                definition.id
            );


        const existing =
            registry.get(
                id
            );


        if (existing) {

            /*
             * Vorhandene Definition erweitern,
             * statt sie blind zu löschen.
             */

            const merged =
                Object.assign(
                    {},
                    existing,
                    definition,
                    {

                        id:
                            id,

                        dependencies:
                            Array.from(
                                new Set(
                                    [
                                        ...(existing.dependencies || []),
                                        ...(definition.dependencies || [])
                                    ]
                                )
                            ),

                        services:
                            Array.from(
                                new Set(
                                    [
                                        ...(existing.services || []),
                                        ...(definition.services || [])
                                    ]
                                )
                            ),

                        permissions:
                            Array.from(
                                new Set(
                                    [
                                        ...(existing.permissions || []),
                                        ...(definition.permissions || [])
                                    ]
                                )
                            ),

                        keywords:
                            Array.from(
                                new Set(
                                    [
                                        ...(existing.keywords || []),
                                        ...(definition.keywords || [])
                                    ]
                                )
                            )
                    }
                );


            registry.set(
                id,
                merged
            );


            emit(
                "app:updated",
                clone(merged)
            );


            return merged;
        }


        const normalized =
            Object.assign(
                {

                    id:
                        id,

                    name:
                        id,

                    category:
                        "Sonstige",

                    icon:
                        "▣",

                    version:
                        "20.0.0",

                    enabled:
                        true,

                    system:
                        false,

                    singleton:
                        false,

                    dependencies:
                        [],

                    services:
                        [],

                    permissions:
                        [],

                    keywords:
                        [],

                    settings:
                        {},

                    metadata:
                        {}

                },

                definition,
                {

                    id:
                        id
                }
            );


        registry.set(
            id,
            normalized
        );


        appStates.set(
            id,
            {

                id:
                    id,

                registered:
                    true,

                enabled:
                    normalized.enabled !== false,

                state:
                    "registered",

                running:
                    false,

                initialized:
                    false,

                error:
                    null,

                createdAt:
                    Date.now(),

                updatedAt:
                    Date.now()
            }
        );


        emit(
            "app:registered",
            clone(normalized)
        );


        return normalized;
    };


    /* ========================================================
       UNREGISTER
    ======================================================== */

    Registry.unregister = function (
        id
    ) {

        const appId =
            normalizeId(id);


        if (
            runningApps.has(
                appId
            )
        ) {

            Registry.stop(
                appId
            );
        }


        const removed =
            registry.delete(
                appId
            );


        appStates.delete(
            appId
        );


        appInstances.delete(
            appId
        );


        if (removed) {

            emit(
                "app:unregistered",
                {
                    id:
                        appId
                }
            );
        }


        return removed;
    };


    /* ========================================================
       GET
    ======================================================== */

    Registry.get = function (
        id
    ) {

        return registry.get(
            normalizeId(id)
        ) || null;
    };


    Registry.has = function (
        id
    ) {

        return registry.has(
            normalizeId(id)
        );
    };


    /* ========================================================
       GET ALL
    ======================================================== */

    Registry.getAll = function () {

        return Array.from(
            registry.values()
        )
        .sort(
            function (a, b) {

                return (
                    (a.priority || 999) -
                    (b.priority || 999)
                );

            }
        );
    };


    /* ========================================================
       SEARCH
    ======================================================== */

    Registry.search = function (
        query
    ) {

        const q =
            String(query || "")
                .trim()
                .toLowerCase();


        if (!q) {

            return Registry.getAll();
        }


        return Registry.getAll()
            .filter(
                function (app) {

                    const searchable =
                        [
                            app.id,
                            app.name,
                            app.category,
                            ...(app.keywords || [])
                        ]
                        .join(" ")
                        .toLowerCase();


                    return searchable.includes(
                        q
                    );

                }
            );
    };


    /* ========================================================
       CATEGORY
    ======================================================== */

    Registry.getCategories =
        function () {

            return [
                ...new Set(
                    Registry.getAll()
                        .map(
                            function (app) {

                                return app.category;

                            }
                        )
                )
            ];
        };


    Registry.getByCategory =
        function (
            category
        ) {

            const value =
                String(
                    category || ""
                )
                .trim()
                .toLowerCase();


            return Registry.getAll()
                .filter(
                    function (app) {

                        return (
                            String(
                                app.category
                            )
                            .toLowerCase() ===
                            value
                        );

                    }
                );
        };


    /* ========================================================
       ENABLE / DISABLE
    ======================================================== */

    Registry.enable = function (
        id
    ) {

        const app =
            Registry.get(id);


        if (!app) {
            return false;
        }


        app.enabled =
            true;


        const state =
            appStates.get(
                app.id
            );


        if (state) {

            state.enabled =
                true;

            state.updatedAt =
                Date.now();
        }


        emit(
            "app:enabled",
            {
                id:
                    app.id
            }
        );


        return true;
    };


    Registry.disable = function (
        id
    ) {

        const app =
            Registry.get(id);


        if (!app) {
            return false;
        }


        if (
            runningApps.has(
                app.id
            )
        ) {

            Registry.stop(
                app.id
            );
        }


        app.enabled =
            false;


        const state =
            appStates.get(
                app.id
            );


        if (state) {

            state.enabled =
                false;

            state.updatedAt =
                Date.now();
        }


        emit(
            "app:disabled",
            {
                id:
                    app.id
            }
        );


        return true;
    };


    /* ========================================================
       STATE
    ======================================================== */

    Registry.getState = function (
        id
    ) {

        const state =
            appStates.get(
                normalizeId(id)
            );


        return state
            ? clone(state)
            : null;
    };


    Registry.setState = function (
        id,
        state,
        extra
    ) {

        const appId =
            normalizeId(id);


        if (!registry.has(appId)) {
            return false;
        }


        const current =
            appStates.get(
                appId
            ) || {

                id:
                    appId
            };


        Object.assign(
            current,
            {

                state:
                    state,

                updatedAt:
                    Date.now()
            },

            extra || {}
        );


        appStates.set(
            appId,
            current
        );


        emit(
            "app:state-changed",
            clone(current)
        );


        return true;
    };


    /* ========================================================
       INSTANCE
    ======================================================== */

    Registry.setInstance =
        function (
            id,
            instance
        ) {

            const appId =
                normalizeId(id);


            if (!registry.has(appId)) {
                return false;
            }


            appInstances.set(
                appId,
                instance
            );


            return true;
        };


    Registry.getInstance =
        function (
            id
        ) {

            return (
                appInstances.get(
                    normalizeId(id)
                ) ||
                null
            );
        };


    /* ========================================================
       DEPENDENCY CHECK
    ======================================================== */

    Registry.checkDependencies =
        function (
            id
        ) {

            const app =
                Registry.get(id);


            if (!app) {

                return {

                    valid:
                        false,

                    missing:
                        [
                            normalizeId(id)
                        ]
                };
            }


            const missing =
                [];


            (app.dependencies || [])
                .forEach(
                    function (
                        dependency
                    ) {

                        const depId =
                            normalizeId(
                                dependency
                            );


                        if (
                            !registry.has(
                                depId
                            )
                        ) {

                            missing.push(
                                depId
                            );
                        }

                    }
                );


            return {

                valid:
                    missing.length === 0,

                missing:
                    missing
            };
        };


    /* ========================================================
       START
    ======================================================== */

    Registry.start = async function (
        id,
        context
    ) {

        const app =
            Registry.get(id);


        if (!app) {

            throw new Error(
                "App nicht registriert: " +
                id
            );
        }


        if (
            app.enabled === false
        ) {

            throw new Error(
                "App ist deaktiviert: " +
                app.id
            );
        }


        const dependencyResult =
            Registry.checkDependencies(
                app.id
            );


        if (
            !dependencyResult.valid
        ) {

            throw new Error(
                "Fehlende Abhängigkeiten: " +
                dependencyResult.missing.join(
                    ", "
                )
            );
        }


        if (
            app.singleton &&
            runningApps.has(
                app.id
            )
        ) {

            return Registry.getInstance(
                app.id
            );
        }


        Registry.setState(
            app.id,
            "starting",
            {
                running:
                    false
            }
        );


        let instance =
            Registry.getInstance(
                app.id
            );


        try {

            /*
             * Falls bereits ein Runtime-System
             * vorhanden ist, verwenden wir es.
             */

            const runtime =
                window.HalDoAppRuntime;


            if (
                runtime &&
                typeof runtime.start ===
                "function"
            ) {

                instance =
                    await runtime.start(
                        app.id,
                        context || {}
                    );

            } else if (
                instance &&
                typeof instance.start ===
                "function"
            ) {

                await instance.start(
                    context || {}
                );

            }


            if (instance) {

                Registry.setInstance(
                    app.id,
                    instance
                );
            }


            runningApps.set(
                app.id,
                {

                    startedAt:
                        Date.now(),

                    context:
                        context || {}
                }
            );


            Registry.setState(
                app.id,
                "running",
                {

                    running:
                        true,

                    initialized:
                        true,

                    error:
                        null
                }
            );


            emit(
                "app:started",
                {

                    id:
                        app.id,

                    instance:
                        instance
                }
            );


            return instance;

        } catch (error) {

            Registry.setState(
                app.id,
                "error",
                {

                    running:
                        false,

                    error:
                        error
                        .message ||
                        String(error)
                }
            );


            emit(
                "app:error",
                {

                    id:
                        app.id,

                    error:
                        error
                }
            );


            throw error;
        }
    };


    /* ========================================================
       STOP
    ======================================================== */

    Registry.stop = async function (
        id
    ) {

        const appId =
            normalizeId(id);


        if (
            !runningApps.has(
                appId
            )
        ) {

            return false;
        }


        const instance =
            Registry.getInstance(
                appId
            );


        try {

            if (
                instance &&
                typeof instance.stop ===
                "function"
            ) {

                await instance.stop();
            }


            const runtime =
                window.HalDoAppRuntime;


            if (
                runtime &&
                typeof runtime.stop ===
                "function"
            ) {

                await runtime.stop(
                    appId
                );
            }


        } catch (error) {

            console.warn(
                "[HalDo Registry]",
                "Fehler beim Stoppen:",
                appId,
                error
            );
        }


        runningApps.delete(
            appId
        );


        Registry.setState(
            appId,
            "stopped",
            {
                running:
                    false
            }
        );


        emit(
            "app:stopped",
            {
                id:
                    appId
            }
        );


        return true;
    };


    /* ========================================================
       RESTART
    ======================================================== */

    Registry.restart = async function (
        id,
        context
    ) {

        await Registry.stop(
            id
        );


        return Registry.start(
            id,
            context
        );
    };


    /* ========================================================
       RUNNING APPS
    ======================================================== */

    Registry.getRunning =
        function () {

            return Array.from(
                runningApps.keys()
            );
        };


    Registry.isRunning =
        function (id) {

            return runningApps.has(
                normalizeId(id)
            );
        };


    /* ========================================================
       APP COUNT
    ======================================================== */

    Registry.count =
        function () {

            return registry.size;
        };


    /* ========================================================
       IMPORT MANIFEST
    ======================================================== */

    Registry.loadManifest =
        function () {

            const manifest =
                window.HalDoV20AppManifest;


            if (
                !manifest ||
                typeof manifest.getAll !==
                "function"
            ) {

                return 0;
            }


            const apps =
                manifest.getAll();


            let registered =
                0;


            apps.forEach(
                function (definition) {

                    if (
                        Registry.register(
                            definition
                        )
                    ) {

                        registered++;
                    }

                }
            );


            return registered;
        };


    /* ========================================================
       STATUS
    ======================================================== */

    Registry.getStatus =
        function () {

            return {

                name:
                    Registry.name,

                version:
                    Registry.version,

                ready:
                    Registry.ready,

                registeredApps:
                    registry.size,

                runningApps:
                    runningApps.size,

                registered:
                    Registry.getAll()
                        .map(
                            function (app) {

                                return app.id;

                            }
                        ),

                running:
                    Registry.getRunning(),

                timestamp:
                    Date.now()
            };
        };


    /* ========================================================
       INITIALIZE
    ======================================================== */

    Registry.init =
        function () {

            if (
                Registry.ready
            ) {

                return Registry;
            }


            /*
             * Manifest laden
             */

            Registry.loadManifest();


            /*
             * Event-Bus Verbindung
             */

            const bus =
                window.HalDoAppEvents;


            if (
                bus &&
                typeof bus.on ===
                "function"
            ) {

                bus.on(
                    "app:open",
                    function (
                        event
                    ) {

                        const data =
                            event &&
                            event.data
                                ? event.data
                                : event;


                        if (
                            data &&
                            data.appId
                        ) {

                            Registry.start(
                                data.appId,
                                data
                            )
                            .catch(
                                function (
                                    error
                                ) {

                                    console.error(
                                        "[HalDo Registry]",
                                        error
                                    );

                                }
                            );
                        }

                    }
                );


                bus.on(
                    "app:close",
                    function (
                        event
                    ) {

                        const data =
                            event &&
                            event.data
                                ? event.data
                                : event;


                        if (
                            data &&
                            data.appId
                        ) {

                            Registry.stop(
                                data.appId
                            )
                            .catch(
                                function (
                                    error
                                ) {

                                    console.error(
                                        "[HalDo Registry]",
                                        error
                                    );

                                }
                            );
                        }

                    }
                );
            }


            Registry.ready =
                true;


            /*
             * Globale APIs
             */

            window.HalDoV20AppRegistry =
                Registry;


            HalDoOS.appRegistry =
                Registry;


            V20.appRegistry =
                Registry;


            /*
             * Registry Ready Event
             */

            emit(
                "registry:ready",
                Registry.getStatus()
            );


            if (
                window.HalDoAppEvents &&
                typeof window.HalDoAppEvents.emit ===
                "function"
            ) {

                window.HalDoAppEvents.emit(
                    "system:app-registry-ready",
                    Registry.getStatus(),
                    {
                        internal:
                            true
                    }
                );
            }


            console.log(
                "[HalDo AI OS 20]",
                "App Registry bereit:",
                Registry.count(),
                "Apps"
            );


            return Registry;
        };


    /* ========================================================
       STARTUP
    ======================================================== */

    function boot() {

        try {

            Registry.init();

        } catch (error) {

            console.error(
                "[HalDo AI OS 20]",
                "App Registry konnte nicht starten.",
                error
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

    } else {

        boot();
    }


})(window, document);