/* =========================================================

   HALDO AI OS 18

   APP MANAGER

   Version 18.0.0

   Professional Ultimate Foundation

   ZENTRALE APP-VERWALTUNG

   Verantwortlich für:

   - App-Registrierung

   - App-Lebenszyklus

   - App-Start

   - App-Schließen

   - App-Aktivierung

   - App-Minimierung

   - App-Zustände

   - App-Events

   - Verbindung zu Registry / Router / Launcher

   - zentrale zukünftige App-Liste

   Bestehende Systeme werden NICHT blind ersetzt.

   Vorhandene globale APIs werden erkannt und verbunden.

   ========================================================= */

(function (window, document) {

    "use strict";

    /* =====================================================

       GLOBAL FOUNDATION

       ===================================================== */

    window.HalDoOS = window.HalDoOS || {};

    const HalDoOS = window.HalDoOS;

    const VERSION = "18.0.0";

    const MANAGER_NAME =

        "HalDo AI OS App Manager";

    /* =====================================================

       INTERNAL STATE

       ===================================================== */

    const apps = new Map();

    const runningApps = new Map();

    const minimizedApps = new Set();

    let activeAppId = null;

    let initialized = false;

    /* =====================================================

       EVENT BUS

       ===================================================== */

    const listeners = {};

    function on(event, callback) {

        if (

            typeof callback !== "function"

        ) {

            return function () {};

        }

        if (!listeners[event]) {

            listeners[event] = [];

        }

        listeners[event].push(callback);

        return function unsubscribe() {

            off(

                event,

                callback

            );

        };

    }

    function off(event, callback) {

        if (!listeners[event]) {

            return;

        }

        listeners[event] =

            listeners[event].filter(

                function (item) {

                    return item !== callback;

                }

            );

    }

    function emit(event, data) {

        if (listeners[event]) {

            listeners[event].forEach(

                function (callback) {

                    try {

                        callback(data);

                    } catch (error) {

                        console.error(

                            "[HalDo App Manager] Event error:",

                            error

                        );

                    }

                }

            );

        }

        /*

         * Zusätzlich mit dem zentralen

         * HalDoOS Event-System verbinden.

         */

        if (

            HalDoOS.events &&

            typeof HalDoOS.events.emit ===

                "function"

        ) {

            try {

                HalDoOS.events.emit(

                    "app:" + event,

                    data

                );

            } catch (error) {

                console.warn(

                    "[HalDo App Manager] Global event error:",

                    error

                );

            }

        }

    }

    /* =====================================================

       UTILITIES

       ===================================================== */

    function normalizeId(value) {

        return String(

            value || ""

        )

        .trim()

        .toLowerCase()

        .replace(

            /[^a-z0-9-_]/g,

            "-"

        );

    }

    function createId(value) {

        return normalizeId(

            value

        );

    }

    function safeFunction(

        object,

        method,

        args

    ) {

        if (

            !object ||

            typeof object[method] !==

                "function"

        ) {

            return null;

        }

        try {

            return object[method].apply(

                object,

                args || []

            );

        } catch (error) {

            console.error(

                "[HalDo App Manager]",

                method,

                error

            );

            return null;

        }

    }

    /* =====================================================

       APPLICATION FACTORY

       ===================================================== */

    function normalizeApp(config) {

        config =

            config ||

            {};

        const id =

            createId(

                config.id ||

                config.name

            );

        if (!id) {

            return null;

        }

        return {

            id,

            name:

                config.name ||

                id,

            title:

                config.title ||

                config.name ||

                id,

            description:

                config.description ||

                "",

            category:

                config.category ||

                "system",

            icon:

                config.icon ||

                "◈",

            version:

                config.version ||

                VERSION,

            status:

                config.status ||

                "registered",

            enabled:

                config.enabled !== false,

            system:

                config.system === true,

            singleton:

                config.singleton !== false,

            route:

                config.route ||

                null,

            entry:

                config.entry ||

                null,

            permissions:

                Array.isArray(

                    config.permissions

                )

                    ? [

                        ...config.permissions

                    ]

                    : [],

            dependencies:

                Array.isArray(

                    config.dependencies

                )

                    ? [

                        ...config.dependencies

                    ]

                    : [],

            metadata:

                config.metadata ||

                {},

            api:

                config.api ||

                {},

            init:

                typeof config.init ===

                "function"

                    ? config.init

                    : null,

            start:

                typeof config.start ===

                "function"

                    ? config.start

                    : null,

            stop:

                typeof config.stop ===

                "function"

                    ? config.stop

                    : null,

            minimize:

                typeof config.minimize ===

                "function"

                    ? config.minimize

                    : null,

            restore:

                typeof config.restore ===

                "function"

                    ? config.restore

                    : null,

            destroy:

                typeof config.destroy ===

                "function"

                    ? config.destroy

                    : null,

            onActivate:

                typeof config.onActivate ===

                "function"

                    ? config.onActivate

                    : null,

            onDeactivate:

                typeof config.onDeactivate ===

                "function"

                    ? config.onDeactivate

                    : null,

            createdAt:

                config.createdAt ||

                Date.now(),

            updatedAt:

                Date.now()

        };

    }

    /* =====================================================

       REGISTER APP

       ===================================================== */

    function registerApp(config) {

        const app =

            normalizeApp(

                config

            );

        if (!app) {

            console.warn(

                "[HalDo App Manager] Ungültige App."

            );

            return null;

        }

        const existing =

            apps.get(

                app.id

            );

        if (existing) {

            const merged = {

                ...existing,

                ...app,

                metadata: {

                    ...existing.metadata,

                    ...app.metadata

                },

                api: {

                    ...existing.api,

                    ...app.api

                },

                updatedAt:

                    Date.now()

            };

            apps.set(

                app.id,

                merged

            );

            emit(

                "updated",

                merged

            );

            return merged;

        }

        apps.set(

            app.id,

            app

        );

        emit(

            "registered",

            app

        );

        connectRegistry(

            app

        );

        return app;

    }

    /* =====================================================

       REGISTER MANY

       ===================================================== */

    function registerApps(list) {

        if (!Array.isArray(list)) {

            return [];

        }

        return list

            .map(

                registerApp

            )

            .filter(

                Boolean

            );

    }

    /* =====================================================

       GET APP

       ===================================================== */

    function getApp(id) {

        return apps.get(

            createId(id)

        ) || null;

    }

    /* =====================================================

       GET ALL APPS

       ===================================================== */

    function getApps() {

        return Array.from(

            apps.values()

        );

    }

    /* =====================================================

       GET ENABLED APPS

       ===================================================== */

    function getEnabledApps() {

        return getApps().filter(

            function (app) {

                return app.enabled !== false;

            }

        );

    }

    /* =====================================================

       GET RUNNING APPS

       ===================================================== */

    function getRunningApps() {

        return Array.from(

            runningApps.values()

        );

    }

    /* =====================================================

       IS REGISTERED

       ===================================================== */

    function hasApp(id) {

        return apps.has(

            createId(id)

        );

    }

    /* =====================================================

       IS RUNNING

       ===================================================== */

    function isRunning(id) {

        return runningApps.has(

            createId(id)

        );

    }

    /* =====================================================

       IS MINIMIZED

       ===================================================== */

    function isMinimized(id) {

        return minimizedApps.has(

            createId(id)

        );

    }

    /* =====================================================

       START APP

       ===================================================== */

    async function startApp(

        id,

        options

    ) {

        const app =

            getApp(id);

        if (!app) {

            console.warn(

                "[HalDo App Manager] App nicht gefunden:",

                id

            );

            emit(

                "error",

                {

                    type:

                        "APP_NOT_FOUND",

                    appId:

                        createId(id)

                }

            );

            return null;

        }

        if (

            app.enabled === false

        ) {

            console.warn(

                "[HalDo App Manager] App deaktiviert:",

                app.id

            );

            emit(

                "error",

                {

                    type:

                        "APP_DISABLED",

                    appId:

                        app.id

                }

            );

            return null;

        }

        /*

         * Singleton:

         * Bereits laufende App wird

         * nur aktiviert.

         */

        if (

            app.singleton &&

            isRunning(app.id)

        ) {

            activateApp(

                app.id

            );

            return runningApps.get(

                app.id

            );

        }

        /*

         * Dependencies prüfen

         */

        const dependenciesReady =

            checkDependencies(

                app

            );

        if (!dependenciesReady) {

            emit(

                "error",

                {

                    type:

                        "DEPENDENCY_ERROR",

                    appId:

                        app.id,

                    dependencies:

                        app.dependencies

                }

            );

            return null;

        }

        const context = {

            app,

            options:

                options ||

                {},

            manager:

                api,

            os:

                HalDoOS,

            document,

            window,

            startedAt:

                Date.now()

        };

        let instance =

            null;

        try {

            if (

                typeof app.init ===

                    "function"

            ) {

                await app.init(

                    context

                );

            }

            if (

                typeof app.start ===

                    "function"

            ) {

                instance =

                    await app.start(

                        context

                    );

            }

        } catch (error) {

            app.status =

                "error";

            emit(

                "error",

                {

                    type:

                        "START_ERROR",

                    appId:

                        app.id,

                    error

                }

            );

            console.error(

                "[HalDo App Manager] App start error:",

                app.id,

                error

            );

            return null;

        }

        const runtime = {

            id:

                app.id,

            app,

            instance,

            context,

            startedAt:

                Date.now(),

            status:

                "running",

            minimized:

                false

        };

        runningApps.set(

            app.id,

            runtime

        );

        minimizedApps.delete(

            app.id

        );

        app.status =

            "running";

        activeAppId =

            app.id;

        emit(

            "started",

            runtime

        );

        emit(

            "activated",

            runtime

        );

        connectRouter(

            "open",

            app

        );

        connectWindowManager(

            "open",

            runtime

        );

        return runtime;

    }

    /* =====================================================

       ACTIVATE APP

       ===================================================== */

    function activateApp(id) {

        const appId =

            createId(id);

        const runtime =

            runningApps.get(

                appId

            );

        if (!runtime) {

            return startApp(

                appId

            );

        }

        if (

            activeAppId &&

            activeAppId !== appId

        ) {

            const previous =

                runningApps.get(

                    activeAppId

                );

            if (previous) {

                deactivateRuntime(

                    previous

                );

            }

        }

        if (

            runtime.minimized

        ) {

            restoreApp(

                appId

            );

        }

        activeAppId =

            appId;

        runtime.status =

            "active";

        runtime.app.status =

            "active";

        if (

            typeof runtime.app.onActivate ===

            "function"

        ) {

            try {

                runtime.app.onActivate(

                    runtime.context

                );

            } catch (error) {

                console.warn(

                    "[HalDo App Manager] Activation error:",

                    error

                );

            }

        }

        emit(

            "activated",

            runtime

        );

        connectWindowManager(

            "activate",

            runtime

        );

        return runtime;

    }

    /* =====================================================

       DEACTIVATE

       ===================================================== */

    function deactivateRuntime(

        runtime

    ) {

        if (!runtime) {

            return;

        }

        runtime.status =

            "running";

        if (

            runtime.app

        ) {

            runtime.app.status =

                "running";

            if (

                typeof runtime.app.onDeactivate ===

                "function"

            ) {

                try {

                    runtime.app.onDeactivate(

                        runtime.context

                    );

                } catch (error) {

                    console.warn(

                        "[HalDo App Manager] Deactivation error:",

                        error

                    );

                }

            }

        }

        emit(

            "deactivated",

            runtime

        );

    }

    /* =====================================================

       MINIMIZE APP

       ===================================================== */

    function minimizeApp(id) {

        const appId =

            createId(id);

        const runtime =

            runningApps.get(

                appId

            );

        if (!runtime) {

            return false;

        }

        runtime.minimized =

            true;

        runtime.status =

            "minimized";

        runtime.app.status =

            "minimized";

        minimizedApps.add(

            appId

        );

        if (

            typeof runtime.app.minimize ===

            "function"

        ) {

            try {

                runtime.app.minimize(

                    runtime.context

                );

            } catch (error) {

                console.warn(

                    "[HalDo App Manager] Minimize error:",

                    error

                );

            }

        }

        if (

            activeAppId ===

            appId

        ) {

            activeAppId =

                null;

        }

        emit(

            "minimized",

            runtime

        );

        connectWindowManager(

            "minimize",

            runtime

        );

        return true;

    }

    /* =====================================================

       RESTORE APP

       ===================================================== */

    function restoreApp(id) {

        const appId =

            createId(id);

        const runtime =

            runningApps.get(

                appId

            );

        if (!runtime) {

            return false;

        }

        runtime.minimized =

            false;

        runtime.status =

            "running";

        runtime.app.status =

            "running";

        minimizedApps.delete(

            appId

        );

        if (

            typeof runtime.app.restore ===

            "function"

        ) {

            try {

                runtime.app.restore(

                    runtime.context

                );

            } catch (error) {

                console.warn(

                    "[HalDo App Manager] Restore error:",

                    error

                );

            }

        }

        emit(

            "restored",

            runtime

        );

        return activateApp(

            appId

        );

    }

    /* =====================================================

       CLOSE APP

       ===================================================== */

    async function closeApp(id) {

        const appId =

            createId(id);

        const runtime =

            runningApps.get(

                appId

            );

        if (!runtime) {

            return false;

        }

        try {

            if (

                typeof runtime.app.stop ===

                    "function"

            ) {

                await runtime.app.stop(

                    runtime.context

                );

            }

            if (

                typeof runtime.app.destroy ===

                    "function"

            ) {

                await runtime.app.destroy(

                    runtime.context

                );

            }

        } catch (error) {

            console.warn(

                "[HalDo App Manager] Close error:",

                error

            );

        }

        runningApps.delete(

            appId

        );

        minimizedApps.delete(

            appId

        );

        runtime.app.status =

            "registered";

        if (

            activeAppId ===

            appId

        ) {

            activeAppId =

                null;

        }

        emit(

            "closed",

            runtime

        );

        connectRouter(

            "close",

            runtime.app

        );

        connectWindowManager(

            "close",

            runtime

        );

        return true;

    }

    /* =====================================================

       CLOSE ALL

       ===================================================== */

    async function closeAllApps() {

        const ids =

            Array.from(

                runningApps.keys()

            );

        for (

            const id of ids

        ) {

            await closeApp(

                id

            );

        }

        activeAppId =

            null;

        emit(

            "all-closed"

        );

    }

    /* =====================================================

       DEPENDENCY SYSTEM

       ===================================================== */

    function checkDependencies(

        app

    ) {

        if (

            !app.dependencies ||

            !app.dependencies.length

        ) {

            return true;

        }

        return app.dependencies.every(

            function (dependency) {

                return (

                    hasApp(

                        dependency

                    ) &&

                    getApp(

                        dependency

                    ).enabled !== false

                );

            }

        );

    }

    /* =====================================================

       REMOVE APP

       ===================================================== */

    async function unregisterApp(

        id

    ) {

        const appId =

            createId(id);

        if (

            isRunning(appId)

        ) {

            await closeApp(

                appId

            );

        }

        const app =

            apps.get(

                appId

            );

        if (!app) {

            return false;

        }

        apps.delete(

            appId

        );

        emit(

            "unregistered",

            app

        );

        return true;

    }

    /* =====================================================

       ENABLE / DISABLE

       ===================================================== */

    function enableApp(id) {

        const app =

            getApp(id);

        if (!app) {

            return false;

        }

        app.enabled =

            true;

        app.status =

            "registered";

        emit(

            "enabled",

            app

        );

        return true;

    }

    function disableApp(id) {

        const app =

            getApp(id);

        if (!app) {

            return false;

        }

        if (

            isRunning(app.id)

        ) {

            closeApp(

                app.id

            );

        }

        app.enabled =

            false;

        app.status =

            "disabled";

        emit(

            "disabled",

            app

        );

        return true;

    }

    /* =====================================================

       SEARCH

       ===================================================== */

    function search(query) {

        const value =

            String(

                query || ""

            )

            .trim()

            .toLowerCase();

        if (!value) {

            return getApps();

        }

        return getApps().filter(

            function (app) {

                return (

                    app.id

                        .toLowerCase()

                        .includes(value)

                    ||

                    app.name

                        .toLowerCase()

                        .includes(value)

                    ||

                    app.title

                        .toLowerCase()

                        .includes(value)

                    ||

                    app.description

                        .toLowerCase()

                        .includes(value)

                    ||

                    app.category

                        .toLowerCase()

                        .includes(value)

                );

            }

        );

    }

    /* =====================================================

       CATEGORY

       ===================================================== */

    function getByCategory(

        category

    ) {

        const value =

            String(

                category || ""

            )

            .trim()

            .toLowerCase();

        return getApps().filter(

            function (app) {

                return (

                    String(

                        app.category

                    ).toLowerCase() ===

                    value

                );

            }

        );

    }

    /* =====================================================

       ACTIVE APP

       ===================================================== */

    function getActiveApp() {

        if (!activeAppId) {

            return null;

        }

        return (

            runningApps.get(

                activeAppId

            ) || null

        );

    }

    /* =====================================================

       REGISTRY CONNECTION

       ===================================================== */

    function connectRegistry(

        app

    ) {

        const registry =

            window.HalDoAppRegistry ||

            HalDoOS.appRegistry;

        if (!registry) {

            return;

        }

        try {

            if (

                typeof registry.register ===

                "function"

            ) {

                /*

                 * Nur registrieren, wenn die Registry

                 * diese App noch nicht kennt.

                 */

                if (

                    typeof registry.has !==

                    "function" ||

                    !registry.has(

                        app.id

                    )

                ) {

                    registry.register(

                        app

                    );

                }

            }

        } catch (error) {

            console.warn(

                "[HalDo App Manager] Registry connection failed:",

                error

            );

        }

    }

    /* =====================================================

       ROUTER CONNECTION

       ===================================================== */

    function connectRouter(

        action,

        app

    ) {

        const router =

            window.HalDoAppRouter ||

            HalDoOS.appRouter;

        if (!router) {

            return;

        }

        try {

            if (

                action === "open" &&

                typeof router.open ===

                "function"

            ) {

                router.open(

                    app.id,

                    {

                        source:

                            "app-manager"

                    }

                );

            }

            if (

                action === "close" &&

                typeof router.close ===

                "function"

            ) {

                router.close(

                    app.id

                );

            }

        } catch (error) {

            console.warn(

                "[HalDo App Manager] Router connection failed:",

                error

            );

        }

    }

    /* =====================================================

       WINDOW MANAGER CONNECTION

       ===================================================== */

    function connectWindowManager(

        action,

        runtime

    ) {

        const manager =

            window.HalDoWindowManager ||

            HalDoOS.windowManager;

        if (!manager) {

            return;

        }

        try {

            switch (action) {

                case "open":

                    if (

                        typeof manager.open ===

                        "function"

                    ) {

                        manager.open(

                            runtime

                        );

                    }

                    break;

                case "activate":

                    if (

                        typeof manager.activate ===

                        "function"

                    ) {

                        manager.activate(

                            runtime.id

                        );

                    }

                    break;

                case "minimize":

                    if (

                        typeof manager.minimize ===

                        "function"

                    ) {

                        manager.minimize(

                            runtime.id

                        );

                    }

                    break;

                case "close":

                    if (

                        typeof manager.close ===

                        "function"

                    ) {

                        manager.close(

                            runtime.id

                        );

                    }

                    break;

            }

        } catch (error) {

            console.warn(

                "[HalDo App Manager] Window manager connection failed:",

                error

            );

        }

    }

    /* =====================================================

       CENTRAL APP LIST

       =====================================================

       Diese Liste ist bewusst größer angelegt.

       Die Apps werden registriert und erhalten

       echte System-IDs.

       Die eigentlichen UI-/Funktionsmodule werden

       anschließend an diese IDs angeschlossen.

       */

    const CORE_APPS = [

        /* -----------------------------

           AI

           ----------------------------- */

        {

            id: "ai-chat",

            name: "AI Chat",

            title: "HalDo AI Gespräch",

            description:

                "Intelligenter HalDo AI Chat.",

            category: "ai",

            icon: "✦",

            dependencies: [

                "ai-core"

            ],

            route: "chat"

        },

        {

            id: "ai-core",

            name: "AI Core",

            title: "HalDo AI Core",

            description:

                "Zentrale AI-Systembasis.",

            category: "ai",

            icon: "◆",

            system: true,

            route: "ai-core"

        },

        {

            id: "ai-engine",

            name: "AI Engine",

            title: "HalDo AI Engine",

            description:

                "Verarbeitung und AI Engine.",

            category: "ai",

            icon: "◇",

            dependencies: [

                "ai-core"

            ],

            route: "ai-engine"

        },

        {

            id: "ai-memory",

            name: "AI Memory",

            title: "HalDo AI Memory",

            description:

                "AI-Speicher und Kontextsystem.",

            category: "ai",

            icon: "◫",

            dependencies: [

                "ai-core"

            ],

            route: "ai-memory"

        },

        {

            id: "ai-language",

            name: "AI Language",

            title: "AI Language System",

            description:

                "Sprachverarbeitung für HalDo AI.",

            category: "ai",

            icon: "文",

            dependencies: [

                "ai-core"

            ],

            route: "ai-language"

        },

        {

            id: "ai-commands",

            name: "AI Commands",

            title: "AI Commands",

            description:

                "Befehle und Systemaktionen.",

            category: "ai",

            icon: "⌘",

            dependencies: [

                "ai-core"

            ],

            route: "ai-commands"

        },

        /* -----------------------------

           VOICE

           ----------------------------- */

        {

            id: "voice",

            name: "Voice",

            title: "Sprache & Mikrofon",

            description:

                "Sprachsteuerung und Mikrofon.",

            category: "voice",

            icon: "◉",

            route: "voice"

        },

        {

            id: "ai-speech",

            name: "AI Speech",

            title: "AI Speech",

            description:

                "Sprachverarbeitung.",

            category: "voice",

            icon: "◉",

            dependencies: [

                "ai-core"

            ],

            route: "ai-speech"

        },

        {

            id: "ai-voice",

            name: "AI Voice",

            title: "AI Voice",

            description:

                "AI-Stimmensystem.",

            category: "voice",

            icon: "◎",

            dependencies: [

                "ai-core"

            ],

            route: "ai-voice"

        },

        /* -----------------------------

           LANGUAGE

           ----------------------------- */

        {

            id: "languages",

            name: "Languages",

            title: "Sprachen",

            description:

                "Zentrale Sprachverwaltung.",

            category: "language",

            icon: "文",

            route: "languages"

        },

        {

            id: "language-manager",

            name: "Language Manager",

            title: "Language Manager",

            description:

                "Verwaltung installierter Sprachen.",

            category: "language",

            icon: "A",

            route: "language-manager"

        },

        {

            id: "language-system",

            name: "Language System",

            title: "Language System",

            description:

                "Zentrale Sprachsystem-Engine.",

            category: "language",

            icon: "文",

            route: "language-system"

        },

        /* -----------------------------

           ÊZÎDÎ

           ----------------------------- */

        {

            id: "ezidi-keyboard",

            name: "Êzîdî Keyboard",

            title: "Êzîdî Keyboard",

            description:

                "Eigene Êzîdî-Tastatur und Zeichen.",

            category: "tools",

            icon: "⌨",

            route: "keyboard"

        },

        /* -----------------------------

           APPS

           ----------------------------- */

        {

            id: "apps",

            name: "Apps",

            title: "HalDo Apps",

            description:

                "Zentrale App-Übersicht.",

            category: "apps",

            icon: "◈",

            system: true,

            route: "apps"

        },

        {

            id: "app-launcher",

            name: "App Launcher",

            title: "App Launcher",

            description:

                "Startet HalDo Apps.",

            category: "apps",

            icon: "▦",

            system: true,

            dependencies: [

                "apps"

            ],

            route: "launcher"

        },

        /* -----------------------------

           SYSTEM

           ----------------------------- */

        {

            id: "dashboard",

            name: "Dashboard",

            title: "HalDo Dashboard",

            description:

                "Zentrale Systemübersicht.",

            category: "system",

            icon: "▦",

            system: true,

            route: "dashboard"

        },

        {

            id: "modules",

            name: "Modules",

            title: "HalDo Module",

            description:

                "Systemmodule verwalten.",

            category: "system",

            icon: "◈",

            system: true,

            route: "modules"

        },

        {

            id: "system",

            name: "System",

            title: "HalDo System",

            description:

                "Zentrale Systemverwaltung.",

            category: "system",

            icon: "◆",

            system: true,

            route: "system"

        },

        {

            id: "kernel",

            name: "Kernel",

            title: "HalDo Kernel",

            description:

                "Zentrale Kernel-Funktionen.",

            category: "system",

            icon: "⬢",

            system: true,

            route: "kernel"

        },

        {

            id: "shell",

            name: "Shell",

            title: "HalDo Shell",

            description:

                "System-Shell.",

            category: "system",

            icon: ">_",

            system: true,

            route: "shell"

        },

        /* -----------------------------

           DESKTOP / WINDOWS

           ----------------------------- */

        {

            id: "desktop",

            name: "Desktop",

            title: "HalDo Desktop",

            description:

                "Zentrale Desktop-Oberfläche.",

            category: "system",

            icon: "▣",

            system: true,

            route: "desktop"

        },

        {

            id: "window-manager",

            name: "Window Manager",

            title: "Window Manager",

            description:

                "Fensterverwaltung.",

            category: "system",

            icon: "□",

            system: true,

            route: "windows"

        },

        /* -----------------------------

           STORAGE

           ----------------------------- */

        {

            id: "storage",

            name: "Storage",

            title: "HalDo Speicher",

            description:

                "Lokaler Datenspeicher.",

            category: "system",

            icon: "◫",

            system: true,

            route: "storage"

        },

        {

            id: "storage-manager",

            name: "Storage Manager",

            title: "Storage Manager",

            description:

                "Verwaltung lokaler Daten.",

            category: "system",

            icon: "◫",

            dependencies: [

                "storage"

            ],

            route: "storage-manager"

        },

        /* -----------------------------

           SETTINGS

           ----------------------------- */

        {

            id: "settings",

            name: "Settings",

            title: "Einstellungen",

            description:

                "HalDo OS Einstellungen.",

            category: "system",

            icon: "⚙",

            route: "settings"

        },

        {

            id: "config-manager",

            name: "Config Manager",

            title: "Configuration Manager",

            description:

                "Zentrale Konfiguration.",

            category: "system",

            icon: "⚙",

            system: true,

            route: "config"

        },

        /* -----------------------------

           DIAGNOSTICS

           ----------------------------- */

        {

            id: "diagnostics",

            name: "Diagnostics",

            title: "System Diagnose",

            description:

                "Systemprüfung und Diagnose.",

            category: "system",

            icon: "✓",

            route: "diagnostics"

        },

        {

            id: "system-status",

            name: "System Status",

            title: "System Status",

            description:

                "Laufzeitstatus des Systems.",

            category: "system",

            icon: "●",

            system: true,

            route: "status"

        },

        /* -----------------------------

           SOFTWARE UPDATE

           ----------------------------- */

        {

            id: "software-update",

            name: "Software Update",

            title: "Software Update Center",

            description:

                "Softwareprüfung und Updates.",

            category: "software",

            icon: "↻",

            route: "updates"

        },

        /* -----------------------------

           BOOT / STARTUP

           ----------------------------- */

        {

            id: "boot",

            name: "Boot",

            title: "HalDo Boot System",

            description:

                "Boot- und Startsystem.",

            category: "system",

            icon: "▶",

            system: true,

            route: "boot"

        },

        {

            id: "startup",

            name: "Startup",

            title: "HalDo Startup",

            description:

                "Systemstart und Initialisierung.",

            category: "system",

            icon: "⚡",

            system: true,

            route: "startup"

        },

        /* -----------------------------

           LOGO / LIGHT

           ----------------------------- */

        {

            id: "logo-intro",

            name: "Logo Intro",

            title: "HalDo Logo Intro",

            description:

                "HalDo Logo Startanimation.",

            category: "visual",

            icon: "✦",

            system: true,

            route: "logo-intro"

        },

        {

            id: "logo-animation",

            name: "Logo Animation",

            title: "HalDo Logo Animation",

            description:

                "Lebendiges Logo- und Lichtsystem.",

            category: "visual",

            icon: "✦",

            system: true,

            route: "logo-animation"

        },

        {

            id: "haldo-light-system",

            name: "Light System",

            title: "HalDo Light System",

            description:

                "Licht-, Glow- und Visual-System.",

            category: "visual",

            icon: "☀",

            system: true,

            route: "light-system"

        },

        /* -----------------------------

           CODE

           ----------------------------- */

        {

            id: "code-builder",

            name: "Code Builder",

            title: "HalDo Code Builder",

            description:

                "Software- und Code-Entwicklung.",

            category: "developer",

            icon: "</>",

            route: "code"

        },

        {

            id: "module-manager",

            name: "Module Manager",

            title: "Module Manager",

            description:

                "Verwaltung aller Systemmodule.",

            category: "developer",

            icon: "◈",

            system: true,

            route: "module-manager"

        }

    ];

    /* =====================================================

       INITIALIZE CORE APPS

       ===================================================== */

    function registerCoreApps() {

        registerApps(

            CORE_APPS

        );

    }

    /* =====================================================

       CONNECT EXISTING MODULE APIs

       =====================================================

       Hier werden die bereits vorhandenen globalen

       HalDo-Dateien erkannt.

       Dadurch müssen wir die vorhandenen Module

       nicht löschen oder neu erfinden.

       */

    function connectExistingApis() {

        const connections = [

            {

                app:

                    "ai-core",

                api:

                    "HalDoAICore"

            },

            {

                app:

                    "ai-memory",

                api:

                    "HalDoAIMemory"

            },

            {

                app:

                    "ai-engine",

                api:

                    "HalDoAIEngine"

            },

            {

                app:

                    "ai-language",

                api:

                    "HalDoAILanguage"

            },

            {

                app:

                    "voice",

                api:

                    "HalDoVoice"

            },

            {

                app:

                    "ezidi-keyboard",

                api:

                    "HalDoEzidiKeyboard"

            },

            {

                app:

                    "storage",

                api:

                    "HalDoStorage"

            },

            {

                app:

                    "storage-manager",

                api:

                    "HalDoStorageManager"

            },

            {

                app:

                    "settings",

                api:

                    "HalDoSettings"

            },

            {

                app:

                    "window-manager",

                api:

                    "HalDoWindowManager"

            },

            {

                app:

                    "system",

                api:

                    "HalDoSystem"

            },

            {

                app:

                    "kernel",

                api:

                    "HalDoKernel"

            }

        ];

        connections.forEach(

            function (connection) {

                const apiObject =

                    window[

                        connection.api

                    ];

                if (!apiObject) {

                    return;

                }

                const app =

                    getApp(

                        connection.app

                    );

                if (!app) {

                    return;

                }

                app.api =

                    apiObject;

                app.metadata.connected =

                    true;

                app.metadata.globalApi =

                    connection.api;

                emit(

                    "api-connected",

                    {

                        app,

                        api:

                            apiObject,

                        globalName:

                            connection.api

                    }

                );

            }

        );

    }

    /* =====================================================

       MODULE STATUS REFRESH

       ===================================================== */

    function refreshStatuses() {

        getApps().forEach(

            function (app) {

                if (

                    runningApps.has(

                        app.id

                    )

                ) {

                    const runtime =

                        runningApps.get(

                            app.id

                        );

                    app.status =

                        runtime.status;

                } else if (

                    app.enabled === false

                ) {

                    app.status =

                        "disabled";

                } else {

                    app.status =

                        "registered";

                }

            }

        );

    }

    /* =====================================================

       INITIALIZATION

       ===================================================== */

    function initialize() {

        if (initialized) {

            return api;

        }

        registerCoreApps();

        connectExistingApis();

        refreshStatuses();

        initialized =

            true;

        emit(

            "ready",

            {

                version:

                    VERSION,

                manager:

                    MANAGER_NAME,

                appCount:

                    apps.size

            }

        );

        return api;

    }

    /* =====================================================

       PUBLIC API

       ===================================================== */

    const api = {

        name:

            MANAGER_NAME,

        version:

            VERSION,

        initialize,

        on,

        off,

        emit,

        register:

            registerApp,

        registerApp,

        registerApps,

        unregister:

            unregisterApp,

        unregisterApp,

        get:

            getApp,

        getApp,

        getAll:

            getApps,

        getApps,

        getEnabled:

            getEnabledApps,

        getEnabledApps,

        getRunning:

            getRunningApps,

        getRunningApps,

        has:

            hasApp,

        hasApp,

        isRunning,

        isMinimized,

        start:

            startApp,

        startApp,

        open:

            startApp,

        activate:

            activateApp,

        activateApp,

        minimize:

            minimizeApp,

        minimizeApp,

        restore:

            restoreApp,

        restoreApp,

        close:

            closeApp,

        closeApp,

        closeAll:

            closeAllApps,

        closeAllApps,

        enable:

            enableApp,

        enableApp,

        disable:

            disableApp,

        disableApp,

        search,

        getByCategory,

        getActive:

            getActiveApp,

        getActiveApp,

        checkDependencies,

        connectExistingApis,

        refreshStatuses,

        getState:

            function () {

                return {

                    initialized,

                    version:

                        VERSION,

                    totalApps:

                        apps.size,

                    runningApps:

                        runningApps.size,

                    minimizedApps:

                        minimizedApps.size,

                    activeApp:

                        activeAppId,

                    apps:

                        getApps()

                };

            }

    };

    /* =====================================================

       GLOBAL REGISTRATION

       ===================================================== */

    window.HalDoAppManager =

        api;

    HalDoOS.appManager =

        api;

    /*

     * Kompatibilität mit älteren Aufrufen.

     */

    HalDoOS.apps =

        HalDoOS.apps ||

        {};

    HalDoOS.apps.manager =

        api;

    /* =====================================================

       AUTO INITIALIZATION

       ===================================================== */

    function bootInitialize() {

        try {

            initialize();

        } catch (error) {

            console.error(

                "[HalDo App Manager] Initialization failed:",

                error

            );

            emit(

                "error",

                {

                    type:

                        "INITIALIZATION_ERROR",

                    error

                }

            );

        }

    }

    if (

        document.readyState ===

        "loading"

    ) {

        document.addEventListener(

            "DOMContentLoaded",

            bootInitialize,

            {

                once: true

            }

        );

    } else {

        bootInitialize();

    }

})(window, document);