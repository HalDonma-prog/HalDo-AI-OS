/*
========================================================
HalDo AI OS 18
Application Manager
Professional Ultimate Foundation
BUILD SYSTEM UPDATE
========================================================

Zentrale Aufgabe:

Kernel
   ↓
App Manager
   ↓
App Registry
   ↓
App Router
   ↓
Launcher
   ↓
UI / Applications

Der App Manager ist die aktive Laufzeitverwaltung
des HalDo AI OS.

Funktionen:
- Apps registrieren
- Apps aktualisieren
- Apps suchen
- Apps starten
- Apps stoppen
- Apps neu starten
- Apps aktivieren/deaktivieren
- App-Zustände verwalten
- App Registry verbinden
- App Router verbinden
- Launcher verbinden
- Kernel verbinden
- Routen verwalten
- App-History
- Events
- Diagnose
- Fehlerbehandlung
- Reconnect
- Foundation Apps
- Erweiterbare App-Struktur

Bestehende globale APIs bleiben erhalten:

window.HalDoAppManager
window.HalDoOS.appManager
========================================================
*/

(function () {

    "use strict";


    /* ==================================================
       VERSION
    ================================================== */

    const VERSION = "18.0.0";


    /* ==================================================
       INTERNAL STATE
    ================================================== */

    const state = {

        initialized:
            false,

        running:
            false,

        apps:
            new Map(),

        activeApp:
            null,

        history:
            [],

        errors:
            [],

        startCount:
            0,

        stopCount:
            0,

        reconnectCount:
            0,

        lastAction:
            null,

        lastActionTime:
            null

    };


    /* ==================================================
       EVENT SYSTEM
    ================================================== */

    const listeners =
        new Map();


    function on(
        event,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return function () {};

        }


        if (
            !listeners.has(event)
        ) {

            listeners.set(
                event,
                new Set()
            );

        }


        listeners
            .get(event)
            .add(callback);


        return function () {

            off(
                event,
                callback
            );

        };

    }


    function off(
        event,
        callback
    ) {

        const set =
            listeners.get(event);


        if (!set) {

            return;

        }


        set.delete(
            callback
        );


        if (
            set.size ===
            0
        ) {

            listeners.delete(
                event
            );

        }

    }


    function emit(
        event,
        payload = {}
    ) {

        const set =
            listeners.get(event);


        if (!set) {

            return;

        }


        set.forEach(
            function (callback) {

                try {

                    callback(
                        payload
                    );

                } catch (error) {

                    recordError(
                        error,
                        "event:" + event
                    );

                }

            }
        );

    }


    /* ==================================================
       ERROR SYSTEM
    ================================================== */

    function recordError(
        error,
        source = "app-manager"
    ) {

        const entry = {

            time:
                new Date()
                    .toISOString(),

            source:

                source,

            message:

                error instanceof Error

                    ? error.message

                    : String(error)

        };


        state.errors.push(
            entry
        );


        if (
            state.errors.length >
            100
        ) {

            state.errors.shift();

        }


        console.error(
            "[HalDo App Manager] " +
            source,
            error
        );


        emit(
            "error",
            entry
        );


        return entry;

    }


    /* ==================================================
       SAFE CLONE
    ================================================== */

    function cloneApp(
        app
    ) {

        if (!app) {

            return null;

        }


        return {

            ...app,

            permissions:
                Array.isArray(
                    app.permissions
                )
                    ? [
                        ...app.permissions
                    ]
                    : [],

            dependencies:
                Array.isArray(
                    app.dependencies
                )
                    ? [
                        ...app.dependencies
                    ]
                    : [],

            keywords:
                Array.isArray(
                    app.keywords
                )
                    ? [
                        ...app.keywords
                    ]
                    : [],

            metadata:

                app.metadata &&
                typeof app.metadata ===
                "object"

                    ? {
                        ...app.metadata
                    }

                    : {}

        };

    }


    /* ==================================================
       NORMALIZE APP
    ================================================== */

    function normalizeApp(
        app
    ) {

        if (
            !app ||
            typeof app !==
            "object"
        ) {

            return null;

        }


        const id = String(

            app.id ||
            app.appId ||
            app.name ||
            ""

        ).trim();


        if (!id) {

            return null;

        }


        return {

            id:

                id,


            appId:

                String(
                    app.appId ||
                    id
                ),


            name:

                String(
                    app.name ||
                    id
                ),


            title:

                String(
                    app.title ||
                    app.name ||
                    id
                ),


            version:

                String(
                    app.version ||
                    VERSION
                ),


            description:

                String(
                    app.description ||
                    ""
                ),


            icon:

                String(
                    app.icon ||
                    ""
                ),


            category:

                String(
                    app.category ||
                    "system"
                ),


            path:

                app.path ||
                app.url ||
                null,


            url:

                app.url ||
                app.path ||
                null,


            route:

                app.route ||
                null,


            module:

                app.module ||
                null,


            permissions:

                Array.isArray(
                    app.permissions
                )
                    ? [
                        ...app.permissions
                    ]
                    : [],


            dependencies:

                Array.isArray(
                    app.dependencies
                )
                    ? [
                        ...app.dependencies
                    ]
                    : [],


            keywords:

                Array.isArray(
                    app.keywords
                )
                    ? [
                        ...app.keywords
                    ]
                    : [],


            enabled:

                app.enabled !== false,


            installed:

                app.installed !== false,


            running:
                Boolean(
                    app.running
                ),


            loaded:
                Boolean(
                    app.loaded
                ),


            createdAt:

                app.createdAt ||
                new Date()
                    .toISOString(),


            updatedAt:

                new Date()
                    .toISOString(),


            metadata:

                app.metadata &&
                typeof app.metadata ===
                "object"

                    ? {
                        ...app.metadata
                    }

                    : {},


            init:

                typeof app.init ===
                "function"

                    ? app.init

                    : null,


            start:

                typeof app.start ===
                "function"

                    ? app.start

                    : null,


            stop:

                typeof app.stop ===
                "function"

                    ? app.stop

                    : null,


            destroy:

                typeof app.destroy ===
                "function"

                    ? app.destroy

                    : null

        };

    }


    /* ==================================================
       REGISTER APP
    ================================================== */

    function register(
        app
    ) {

        const normalized =
            normalizeApp(app);


        if (!normalized) {

            recordError(
                "Ungültige App-Definition.",
                "register"
            );

            return false;

        }


        const existing =
            state.apps.get(
                normalized.id
            );


        if (existing) {

            state.apps.set(
                normalized.id,
                {

                    ...existing,

                    ...normalized,

                    running:
                        existing.running,

                    loaded:
                        existing.loaded

                }
            );


            emit(
                "app:updated",
                {
                    app:
                        get(
                            normalized.id
                        )
                }
            );


            syncConnections();


            return true;

        }


        state.apps.set(
            normalized.id,
            normalized
        );


        emit(
            "app:registered",
            {
                app:
                    get(
                        normalized.id
                    )
            }
        );


        syncConnections();


        return true;

    }


    /* ==================================================
       REGISTER MANY
    ================================================== */

    function registerMany(
        apps
    ) {

        if (
            !Array.isArray(apps)
        ) {

            return 0;

        }


        let count = 0;


        apps.forEach(
            function (app) {

                if (
                    register(app)
                ) {

                    count++;

                }

            }
        );


        return count;

    }


    /* ==================================================
       UPDATE APP
    ================================================== */

    function update(
        id,
        changes = {}
    ) {

        const current =
            state.apps.get(id);


        if (!current) {

            return false;

        }


        const merged =
            normalizeApp({

                ...current,

                ...changes,

                id

            });


        if (!merged) {

            return false;

        }


        merged.running =
            current.running;


        merged.loaded =
            current.loaded;


        state.apps.set(
            id,
            merged
        );


        emit(
            "app:updated",
            {
                app:
                    get(id)
            }
        );


        syncConnections();


        return true;

    }


    /* ==================================================
       UNREGISTER APP
    ================================================== */

    async function unregister(
        id
    ) {

        const app =
            state.apps.get(id);


        if (!app) {

            return false;

        }


        if (
            app.running
        ) {

            await stop(id);

        }


        try {

            if (
                typeof app.destroy ===
                "function"
            ) {

                await app.destroy();

            }

        } catch (error) {

            recordError(
                error,
                "destroy:" + id
            );

        }


        state.apps.delete(
            id
        );


        if (
            state.activeApp ===
            id
        ) {

            state.activeApp =
                null;

        }


        emit(
            "app:unregistered",
            {
                id
            }
        );


        syncConnections();


        return true;

    }


    /* ==================================================
       GET APP
    ================================================== */

    function get(
        id
    ) {

        return cloneApp(
            state.apps.get(id)
        );

    }


    /* ==================================================
       GET ALL
    ================================================== */

    function getAll() {

        return Array
            .from(
                state.apps.values()
            )
            .map(
                cloneApp
            );

    }


    /* ==================================================
       GET ENABLED
    ================================================== */

    function getEnabled() {

        return getAll()
            .filter(
                function (app) {

                    return (
                        app.enabled
                    );

                }
            );

    }


    /* ==================================================
       GET INSTALLED
    ================================================== */

    function getInstalled() {

        return getAll()
            .filter(
                function (app) {

                    return (
                        app.installed
                    );

                }
            );

    }


    /* ==================================================
       GET RUNNING
    ================================================== */

    function getRunning() {

        return getAll()
            .filter(
                function (app) {

                    return (
                        app.running
                    );

                }
            );

    }


    /* ==================================================
       FIND / SEARCH
    ================================================== */

    function find(
        query
    ) {

        const value =
            String(
                query || ""
            )
            .trim()
            .toLowerCase();


        if (!value) {

            return [];

        }


        return getAll()
            .filter(
                function (app) {

                    const searchable = [

                        app.id,

                        app.appId,

                        app.name,

                        app.title,

                        app.description,

                        app.category,

                        app.path,

                        app.route,

                        ...app.keywords

                    ]
                    .join(" ")
                    .toLowerCase();


                    return searchable
                        .includes(
                            value
                        );

                }
            );

    }


    const search =
        find;


    /* ==================================================
       HAS APP
    ================================================== */

    function has(
        id
    ) {

        return state.apps.has(
            id
        );

    }


    /* ==================================================
       INITIALIZE APP
    ================================================== */

    async function initializeApp(
        id
    ) {

        const app =
            state.apps.get(id);


        if (!app) {

            recordError(
                `App "${id}" wurde nicht gefunden.`,
                "initialize"
            );

            return false;

        }


        if (
            app.loaded
        ) {

            return true;

        }


        try {

            if (
                typeof app.init ===
                "function"
            ) {

                await app.init({

                    app,

                    manager:
                        api,

                    kernel:
                        window.HalDoKernel,

                    os:
                        window.HalDoOS

                });

            }


            app.loaded =
                true;


            emit(
                "app:initialized",
                {
                    app:
                        get(id)
                }
            );


            return true;

        } catch (error) {

            recordError(
                error,
                "init:" + id
            );


            emit(
                "app:initialization-failed",
                {
                    id,
                    error
                }
            );


            return false;

        }

    }


    /* ==================================================
       ROUTER NAVIGATION
    ================================================== */

    async function navigateToApp(
        app,
        options = {}
    ) {

        const router =
            window.HalDoAppRouter ||
            (
                window.HalDoOS &&
                window.HalDoOS.appRouter
            );


        const target =
            options.route ||
            app.route ||
            null;


        if (
            router &&
            target
        ) {

            try {

                if (
                    typeof router.navigate ===
                    "function"
                ) {

                    await router.navigate(
                        target
                    );

                    return true;

                }


                if (
                    typeof router.go ===
                    "function"
                ) {

                    await router.go(
                        target
                    );

                    return true;

                }


                if (
                    typeof router.open ===
                    "function"
                ) {

                    await router.open(
                        target
                    );

                    return true;

                }

            } catch (error) {

                recordError(
                    error,
                    "router-navigation"
                );

            }

        }


        return false;

    }


    /* ==================================================
       OPEN APP PATH
    ================================================== */

    function openAppPath(
        app,
        options = {}
    ) {

        if (
            options.navigate ===
            false
        ) {

            return false;

        }


        const path =
            options.path ||
            app.path ||
            app.url ||
            null;


        if (!path) {

            return false;

        }


        try {

            window.location.href =
                path;

            return true;

        } catch (error) {

            recordError(
                error,
                "path:" + app.id
            );

            return false;

        }

    }


    /* ==================================================
       START APP
    ================================================== */

    async function start(
        id,
        options = {}
    ) {

        const app =
            state.apps.get(id);


        if (!app) {

            recordError(
                `App "${id}" wurde nicht gefunden.`,
                "start"
            );

            return false;

        }


        if (
            !app.enabled
        ) {

            recordError(
                `App "${id}" ist deaktiviert.`,
                "start"
            );

            return false;

        }


        if (
            !app.installed
        ) {

            recordError(
                `App "${id}" ist nicht installiert.`,
                "start"
            );

            return false;

        }


        if (
            app.running
        ) {

            state.activeApp =
                id;


            emit(
                "app:focused",
                {
                    app:
                        get(id)
                }
            );


            return true;

        }


        const initialized =
            await initializeApp(id);


        if (!initialized) {

            return false;

        }


        /*
        --------------------------------------------------
        Router
        --------------------------------------------------
        */

        if (
            options.useRouter !==
            false
        ) {

            await navigateToApp(
                app,
                options
            );

        }


        /*
        --------------------------------------------------
        App Start Hook
        --------------------------------------------------
        */

        try {

            if (
                typeof app.start ===
                "function"
            ) {

                await app.start({

                    app,

                    manager:
                        api,

                    options,

                    kernel:
                        window.HalDoKernel,

                    os:
                        window.HalDoOS

                });

            }


            app.running =
                true;


            state.activeApp =
                id;


            state.running =
                true;


            state.startCount++;


            const historyEntry = {

                id,

                action:
                    "start",

                time:
                    new Date()
                        .toISOString(),

                route:
                    options.route ||
                    app.route ||
                    null,

                path:
                    options.path ||
                    app.path ||
                    null

            };


            state.history.push(
                historyEntry
            );


            if (
                state.history.length >
                200
            ) {

                state.history.shift();

            }


            state.lastAction =
                "start";


            state.lastActionTime =
                historyEntry.time;


            emit(
                "app:started",
                {
                    app:
                        get(id),

                    options
                }
            );


            syncLauncher();


            /*
            ------------------------------------------------
            Fallback-Navigation
            ------------------------------------------------
            Nur wenn ausdrücklich gewünscht.
            Standardmäßig verhindert der Manager damit,
            dass Router + window.location gleichzeitig
            ausgelöst werden.
            ------------------------------------------------
            */

            if (
                options.fallbackPath ===
                true
            ) {

                openAppPath(
                    app,
                    options
                );

            }


            return true;

        } catch (error) {

            recordError(
                error,
                "start:" + id
            );


            return false;

        }

    }


    /* ==================================================
       STOP APP
    ================================================== */

    async function stop(
        id
    ) {

        const app =
            state.apps.get(id);


        if (!app) {

            return false;

        }


        if (
            !app.running
        ) {

            return true;

        }


        try {

            if (
                typeof app.stop ===
                "function"
            ) {

                await app.stop({

                    app,

                    manager:
                        api,

                    kernel:
                        window.HalDoKernel,

                    os:
                        window.HalDoOS

                });

            }


            app.running =
                false;


            if (
                state.activeApp ===
                id
            ) {

                state.activeApp =
                    null;

            }


            state.stopCount++;


            const historyEntry = {

                id,

                action:
                    "stop",

                time:
                    new Date()
                        .toISOString()

            };


            state.history.push(
                historyEntry
            );


            if (
                state.history.length >
                200
            ) {

                state.history.shift();

            }


            state.lastAction =
                "stop";


            state.lastActionTime =
                historyEntry.time;


            emit(
                "app:stopped",
                {
                    app:
                        get(id)
                }
            );


            syncLauncher();


            return true;

        } catch (error) {

            recordError(
                error,
                "stop:" + id
            );


            return false;

        }

    }


    /* ==================================================
       RESTART
    ================================================== */

    async function restart(
        id,
        options = {}
    ) {

        const stopped =
            await stop(id);


        if (
            !stopped
        ) {

            return false;

        }


        return start(
            id,
            options
        );

    }


    /* ==================================================
       ENABLE
    ================================================== */

    function enable(
        id
    ) {

        const app =
            state.apps.get(id);


        if (!app) {

            return false;

        }


        app.enabled =
            true;


        emit(
            "app:enabled",
            {
                app:
                    get(id)
            }
        );


        syncConnections();


        return true;

    }


    /* ==================================================
       DISABLE
    ================================================== */

    async function disable(
        id
    ) {

        const app =
            state.apps.get(id);


        if (!app) {

            return false;

        }


        if (
            app.running
        ) {

            await stop(id);

        }


        app.enabled =
            false;


        emit(
            "app:disabled",
            {
                app:
                    get(id)
            }
        );


        syncConnections();


        return true;

    }


    /* ==================================================
       CLOSE ACTIVE APP
    ================================================== */

    async function closeActive() {

        if (
            !state.activeApp
        ) {

            return true;

        }


        return stop(
            state.activeApp
        );

    }


    /* ==================================================
       REGISTRY CONNECTION
    ================================================== */

    function connectRegistry() {

        const registry =
            window.HalDoAppRegistry ||
            (
                window.HalDoOS &&
                window.HalDoOS.appRegistry
            );


        if (!registry) {

            return false;

        }


        try {

            if (
                typeof registry.init ===
                "function"
            ) {

                registry.init();

            }


            if (
                typeof registry.getAll ===
                "function"
            ) {

                const registered =
                    registry.getAll();


                if (
                    Array.isArray(
                        registered
                    )
                ) {

                    registerMany(
                        registered
                    );

                }

            }


            emit(
                "registry:connected",
                {
                    count:
                        state.apps.size
                }
            );


            return true;

        } catch (error) {

            recordError(
                error,
                "registry-connect"
            );


            return false;

        }

    }


    /* ==================================================
       ROUTER CONNECTION
    ================================================== */

    function connectRouter() {

        const router =
            window.HalDoAppRouter ||
            (
                window.HalDoOS &&
                window.HalDoOS.appRouter
            );


        if (!router) {

            return false;

        }


        try {

            if (
                typeof router.registerApp ===
                "function"
            ) {

                getAll().forEach(
                    function (app) {

                        try {

                            router.registerApp(
                                app
                            );

                        } catch (error) {

                            recordError(
                                error,
                                "router-register:" +
                                app.id
                            );

                        }

                    }
                );

            }


            emit(
                "router:connected"
            );


            return true;

        } catch (error) {

            recordError(
                error,
                "router-connect"
            );


            return false;

        }

    }


    /* ==================================================
       LAUNCHER CONNECTION
    ================================================== */

    function syncLauncher() {

        const launcher =
            window.HalDoLauncher ||
            (
                window.HalDoOS &&
                window.HalDoOS.launcher
            );


        if (!launcher) {

            return false;

        }


        try {

            if (
                typeof launcher.updateApps ===
                "function"
            ) {

                launcher.updateApps(
                    getAll()
                );

            }


            if (
                typeof launcher.setApps ===
                "function"
            ) {

                launcher.setApps(
                    getAll()
                );

            }


            if (
                typeof launcher.setActiveApp ===
                "function"
            ) {

                launcher.setActiveApp(
                    state.activeApp
                );

            }


            emit(
                "launcher:synced",
                {
                    appCount:
                        state.apps.size
                }
            );


            return true;

        } catch (error) {

            recordError(
                error,
                "launcher-sync"
            );


            return false;

        }

    }


    /* ==================================================
       KERNEL CONNECTION
    ================================================== */

    function connectKernel() {

        const kernel =
            window.HalDoKernel;


        if (!kernel) {

            return false;

        }


        try {

            if (
                typeof kernel.on ===
                "function"
            ) {

                kernel.on(
                    "kernel:ready",
                    function (
                        payload
                    ) {

                        emit(
                            "kernel:ready",
                            payload
                        );

                    }
                );


                kernel.on(
                    "kernel:error",
                    function (
                        payload
                    ) {

                        emit(
                            "kernel:error",
                            payload
                        );

                    }
                );

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


            emit(
                "kernel:connected"
            );


            return true;

        } catch (error) {

            recordError(
                error,
                "kernel-connect"
            );


            return false;

        }

    }


    /* ==================================================
       SYSTEM CONNECTION
    ================================================== */

    function connectSystem() {

        const system =
            window.HalDoSystem ||
            (
                window.HalDoOS &&
                window.HalDoOS.system
            );


        if (!system) {

            return false;

        }


        try {

            emit(
                "system:connected",
                {
                    system
                }
            );


            return true;

        } catch (error) {

            recordError(
                error,
                "system-connect"
            );


            return false;

        }

    }


    /* ==================================================
       ALL CONNECTIONS
    ================================================== */

    function syncConnections() {

        connectRegistry();

        connectRouter();

        syncLauncher();

        connectSystem();

    }


    /* ==================================================
       FOUNDATION APPS
    ================================================== */

    function registerFoundationApps() {

        const foundationApps = [

            {
                id:
                    "haldo-ai",

                name:
                    "HalDo AI",

                title:
                    "HalDo AI Gespräch",

                version:
                    VERSION,

                description:
                    "Zentrale HalDo AI Gesprächsoberfläche.",

                category:
                    "ai",

                path:
                    "chat.html",

                route:
                    "/chat",

                keywords:
                    [
                        "ai",
                        "chat",
                        "assistant",
                        "gespräch"
                    ]

            },


            {
                id:
                    "dashboard",

                name:
                    "Dashboard",

                title:
                    "HalDo Dashboard",

                version:
                    VERSION,

                description:
                    "Zentrale Systemübersicht.",

                category:
                    "system",

                path:
                    "dashboard.html",

                route:
                    "/dashboard",

                keywords:
                    [
                        "dashboard",
                        "system",
                        "status"
                    ]

            },


            {
                id:
                    "apps",

                name:
                    "Apps",

                title:
                    "HalDo Apps",

                version:
                    VERSION,

                description:
                    "Zentrale App-Verwaltung.",

                category:
                    "system",

                path:
                    "apps.html",

                route:
                    "/apps",

                keywords:
                    [
                        "apps",
                        "applications",
                        "programme"
                    ]

            },


            {
                id:
                    "settings",

                name:
                    "Einstellungen",

                title:
                    "HalDo Einstellungen",

                version:
                    VERSION,

                description:
                    "System- und Benutzerkonfiguration.",

                category:
                    "system",

                path:
                    "settings.html",

                route:
                    "/settings",

                keywords:
                    [
                        "settings",
                        "einstellungen",
                        "config"
                    ]

            },


            {
                id:
                    "knowledge",

                name:
                    "Wissen",

                title:
                    "HalDo Knowledge",

                version:
                    VERSION,

                description:
                    "Wissens- und Lernsystem.",

                category:
                    "ai",

                path:
                    "knowledge.html",

                route:
                    "/knowledge",

                keywords:
                    [
                        "wissen",
                        "knowledge",
                        "learning",
                        "lernen"
                    ]

            },


            {
                id:
                    "code-builder",

                name:
                    "Code Builder",

                title:
                    "HalDo Code Builder",

                version:
                    VERSION,

                description:
                    "Code-Erstellung und Entwicklungswerkzeuge.",

                category:
                    "development",

                path:
                    "code.html",

                route:
                    "/code",

                keywords:
                    [
                        "code",
                        "builder",
                        "entwicklung",
                        "programmierung"
                    ]

            },


            {
                id:
                    "languages",

                name:
                    "Sprachen",

                title:
                    "HalDo Sprachen",

                version:
                    VERSION,

                description:
                    "Sprach- und Übersetzungssystem.",

                category:
                    "language",

                path:
                    "languages.html",

                route:
                    "/languages",

                keywords:
                    [
                        "sprache",
                        "languages",
                        "translation",
                        "übersetzung"
                    ]

            },


            {
                id:
                    "ezidi-keyboard",

                name:
                    "Êzîdî Keyboard",

                title:
                    "Êzîdî Tastatur",

                version:
                    VERSION,

                description:
                    "HalDo Tastatur mit eigenen Êzîdî-Zeichen.",

                category:
                    "input",

                path:
                    "keyboard.html",

                route:
                    "/keyboard",

                keywords:
                    [
                        "ezidi",
                        "êzîdî",
                        "keyboard",
                        "tastatur",
                        "input"
                    ]

            },


            {
                id:
                    "voice",

                name:
                    "Voice",

                title:
                    "Sprache / Mikrofon",

                version:
                    VERSION,

                description:
                    "Sprachschnittstelle und Mikrofon.",

                category:
                    "ai",

                path:
                    "voice.html",

                route:
                    "/voice",

                keywords:
                    [
                        "voice",
                        "sprache",
                        "mikrofon",
                        "speech"
                    ]

            },


            {
                id:
                    "system",

                name:
                    "System",

                title:
                    "HalDo Systemzentrale",

                version:
                    VERSION,

                description:
                    "Systemkern und Modulverwaltung.",

                category:
                    "system",

                path:
                    "system.html",

                route:
                    "/system",

                keywords:
                    [
                        "system",
                        "kernel",
                        "core",
                        "module"
                    ]

            },


            {
                id:
                    "storage",

                name:
                    "Storage",

                title:
                    "HalDo Speicher",

                version:
                    VERSION,

                description:
                    "Lokale Daten und Speicherverwaltung.",

                category:
                    "system",

                path:
                    "storage.html",

                route:
                    "/storage",

                keywords:
                    [
                        "storage",
                        "speicher",
                        "daten",
                        "local"
                    ]

            },


            {
                id:
                    "notifications",

                name:
                    "Notifications",

                title:
                    "HalDo Benachrichtigungen",

                version:
                    VERSION,

                description:
                    "Systemmeldungen und Benachrichtigungen.",

                category:
                    "system",

                path:
                    "notifications.html",

                route:
                    "/notifications",

                keywords:
                    [
                        "notifications",
                        "benachrichtigungen",
                        "meldungen"
                    ]

            }

        ];


        registerMany(
            foundationApps
        );

    }


    /* ==================================================
       DIAGNOSTICS
    ================================================== */

    function diagnose() {

        return {

            name:
                "HalDo Application Manager",

            version:
                VERSION,

            initialized:
                state.initialized,

            running:
                state.running,

            appCount:
                state.apps.size,

            enabledCount:
                getEnabled().length,

            installedCount:
                getInstalled().length,

            runningCount:
                getRunning().length,

            activeApp:
                state.activeApp,

            startCount:
                state.startCount,

            stopCount:
                state.stopCount,

            reconnectCount:
                state.reconnectCount,

            registryConnected:
                Boolean(
                    window.HalDoAppRegistry ||
                    (
                        window.HalDoOS &&
                        window.HalDoOS.appRegistry
                    )
                ),

            routerConnected:
                Boolean(
                    window.HalDoAppRouter ||
                    (
                        window.HalDoOS &&
                        window.HalDoOS.appRouter
                    )
                ),

            launcherConnected:
                Boolean(
                    window.HalDoLauncher ||
                    (
                        window.HalDoOS &&
                        window.HalDoOS.launcher
                    )
                ),

            kernelConnected:
                Boolean(
                    window.HalDoKernel
                ),

            systemConnected:
                Boolean(
                    window.HalDoSystem ||
                    (
                        window.HalDoOS &&
                        window.HalDoOS.system
                    )
                ),

            errors:
                state.errors.length,

            lastAction:
                state.lastAction,

            lastActionTime:
                state.lastActionTime

        };

    }


    /* ==================================================
       RESET RUNTIME
    ================================================== */

    async function resetRuntime() {

        const running =
            getRunning();


        for (
            const app of running
        ) {

            try {

                await stop(
                    app.id
                );

            } catch (error) {

                recordError(
                    error,
                    "reset:" +
                    app.id
                );

            }

        }


        state.activeApp =
            null;


        state.running =
            false;


        emit(
            "runtime:reset"
        );


        return true;

    }


    /* ==================================================
       INITIALIZE
    ================================================== */

    function init() {

        if (
            state.initialized
        ) {

            return api;

        }


        /*
        --------------------------------------------------
        Foundation zuerst.
        --------------------------------------------------
        */

        registerFoundationApps();


        /*
        --------------------------------------------------
        Danach externe Systeme.
        --------------------------------------------------
        */

        connectKernel();

        connectRegistry();

        connectRouter();

        connectSystem();

        syncLauncher();


        state.initialized =
            true;


        state.running =
            true;


        emit(
            "ready",
            {
                manager:
                    diagnose()
            }
        );


        console.log(
            "HalDo Application Manager " +
            VERSION +
            " bereit."
        );


        return api;

    }


    /* ==================================================
       PUBLIC API
    ================================================== */

    const api = {

        name:
            "HalDo Application Manager",

        version:
            VERSION,

        state,

        on,
        off,
        emit,

        init,

        register,

        registerApp:
            register,

        registerMany,

        update,

        updateApp:
            update,

        unregister,

        unregisterApp:
            unregister,

        get,

        getApp:
            get,

        getAll,

        getApps:
            getAll,

        getEnabled,

        getInstalled,

        getRunning,

        find,

        search,

        has,

        initializeApp,

        start,

        startApp:
            start,

        stop,

        stopApp:
            stop,

        restart,

        restartApp:
            restart,

        enable,

        disable,

        closeActive,

        connectRegistry,

        connectRouter,

        syncLauncher,

        connectKernel,

        connectSystem,

        syncConnections,

        navigateToApp,

        openAppPath,

        diagnose,

        resetRuntime,


        getActiveApp() {

            return state.activeApp

                ? get(
                    state.activeApp
                )

                : null;

        },


        getHistory() {

            return [
                ...state.history
            ];

        },


        clearHistory() {

            state.history.length =
                0;

        },


        getErrors() {

            return [
                ...state.errors
            ];

        },


        clearErrors() {

            state.errors.length =
                0;

        }

    };


    /* ==================================================
       GLOBAL API
    ================================================== */

    window.HalDoAppManager =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appManager =
        api;


    /* ==================================================
       AUTO BOOT
    ================================================== */

    function boot() {

        try {

            init();

        } catch (error) {

            recordError(
                error,
                "boot"
            );

        }


        /*
        --------------------------------------------------
        Zweite Verbindung nach DOM / anderen Modulen.
        --------------------------------------------------
        */

        setTimeout(
            function () {

                state.reconnectCount++;


                syncConnections();


            },
            0
        );


        /*
        --------------------------------------------------
        Dritte Verbindung für Module,
        die später geladen werden.
        --------------------------------------------------
        */

        setTimeout(
            function () {

                state.reconnectCount++;


                syncConnections();


            },
            500
        );


        /*
        --------------------------------------------------
        Letzte Foundation-Verbindung.
        --------------------------------------------------
        */

        setTimeout(
            function () {

                state.reconnectCount++;


                syncConnections();


                emit(
                    "system:app-manager-ready",
                    {
                        manager:
                            diagnose()
                    }
                );


            },
            1500
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

    } else {

        boot();

    }


})();