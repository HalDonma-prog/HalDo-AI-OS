/*
========================================================
HalDo AI OS 18
Application Manager
Professional Ultimate Foundation
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
Launcher / UI

Funktionen:
- Apps registrieren
- Apps suchen
- Apps starten
- Apps schließen
- Apps aktivieren/deaktivieren
- App-Zustände verwalten
- App Registry anbinden
- App Router anbinden
- Launcher anbinden
- Kernel anbinden
- Events
- Diagnose
- Fehlerbehandlung
- Erweiterbare App-Struktur

Bestehende APIs werden bewusst erhalten.
========================================================
*/

(function () {
    "use strict";

    const VERSION = "18.0.0";

    const state = {
        initialized: false,
        running: false,
        apps: new Map(),
        activeApp: null,
        history: [],
        errors: [],
        startCount: 0
    };

    const listeners = new Map();

    /* ==================================================
       EVENT SYSTEM
    ================================================== */

    function on(event, callback) {
        if (typeof callback !== "function") return () => {};

        if (!listeners.has(event)) {
            listeners.set(event, new Set());
        }

        listeners.get(event).add(callback);

        return () => off(event, callback);
    }

    function off(event, callback) {
        const set = listeners.get(event);

        if (!set) return;

        set.delete(callback);

        if (set.size === 0) {
            listeners.delete(event);
        }
    }

    function emit(event, payload = {}) {
        const set = listeners.get(event);

        if (!set) return;

        set.forEach(callback => {
            try {
                callback(payload);
            } catch (error) {
                recordError(error, `event:${event}`);
            }
        });
    }

    /* ==================================================
       ERROR SYSTEM
    ================================================== */

    function recordError(error, source = "app-manager") {
        const entry = {
            time: new Date().toISOString(),
            source,
            message:
                error instanceof Error
                    ? error.message
                    : String(error)
        };

        state.errors.push(entry);

        if (state.errors.length > 100) {
            state.errors.shift();
        }

        console.error(
            `[HalDo App Manager] ${source}`,
            error
        );

        emit("error", entry);

        return entry;
    }

    /* ==================================================
       NORMALIZE APP
    ================================================== */

    function normalizeApp(app) {
        if (!app || typeof app !== "object") {
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
            id,
            name: String(app.name || id),
            title: String(
                app.title ||
                app.name ||
                id
            ),
            version: String(
                app.version ||
                VERSION
            ),
            description: String(
                app.description ||
                ""
            ),
            icon: String(
                app.icon ||
                ""
            ),
            category: String(
                app.category ||
                "system"
            ),
            path: app.path || app.url || null,
            module: app.module || null,
            enabled:
                app.enabled !== false,
            installed:
                app.installed !== false,
            running: false,
            loaded: false,
            createdAt:
                app.createdAt ||
                new Date().toISOString(),
            metadata:
                app.metadata &&
                typeof app.metadata === "object"
                    ? { ...app.metadata }
                    : {},
            init:
                typeof app.init === "function"
                    ? app.init
                    : null,
            start:
                typeof app.start === "function"
                    ? app.start
                    : null,
            stop:
                typeof app.stop === "function"
                    ? app.stop
                    : null,
            destroy:
                typeof app.destroy === "function"
                    ? app.destroy
                    : null
        };
    }

    /* ==================================================
       REGISTER APP
    ================================================== */

    function register(app) {
        const normalized = normalizeApp(app);

        if (!normalized) {
            recordError(
                "Ungültige App-Definition.",
                "register"
            );

            return false;
        }

        const existing =
            state.apps.get(normalized.id);

        if (existing) {
            state.apps.set(
                normalized.id,
                {
                    ...existing,
                    ...normalized
                }
            );

            emit("app:updated", {
                app: get(normalized.id)
            });

            return true;
        }

        state.apps.set(
            normalized.id,
            normalized
        );

        emit("app:registered", {
            app: get(normalized.id)
        });

        return true;
    }

    /* ==================================================
       REGISTER MANY
    ================================================== */

    function registerMany(apps) {
        if (!Array.isArray(apps)) {
            return 0;
        }

        let count = 0;

        apps.forEach(app => {
            if (register(app)) {
                count++;
            }
        });

        return count;
    }

    /* ==================================================
       UNREGISTER
    ================================================== */

    async function unregister(id) {
        const app = state.apps.get(id);

        if (!app) {
            return false;
        }

        if (app.running) {
            await stop(id);
        }

        try {
            if (app.destroy) {
                await app.destroy();
            }
        } catch (error) {
            recordError(error, `destroy:${id}`);
        }

        state.apps.delete(id);

        emit("app:unregistered", {
            id
        });

        return true;
    }

    /* ==================================================
       GET APP
    ================================================== */

    function get(id) {
        const app = state.apps.get(id);

        if (!app) {
            return null;
        }

        return {
            ...app,
            metadata: {
                ...app.metadata
            }
        };
    }

    /* ==================================================
       GET ALL APPS
    ================================================== */

    function getAll() {
        return Array.from(
            state.apps.values()
        ).map(app => ({
            ...app,
            metadata: {
                ...app.metadata
            }
        }));
    }

    /* ==================================================
       FIND APP
    ================================================== */

    function find(query) {
        const value =
            String(query || "")
                .trim()
                .toLowerCase();

        if (!value) {
            return [];
        }

        return getAll().filter(app => {
            return (
                app.id.toLowerCase().includes(value) ||
                app.name.toLowerCase().includes(value) ||
                app.title.toLowerCase().includes(value) ||
                app.category.toLowerCase().includes(value)
            );
        });
    }

    /* ==================================================
       INITIALIZE APP
    ================================================== */

    async function initializeApp(id) {
        const app = state.apps.get(id);

        if (!app) {
            return false;
        }

        if (app.loaded) {
            return true;
        }

        try {
            if (app.init) {
                await app.init({
                    app,
                    manager: api,
                    kernel: window.HalDoKernel,
                    os: window.HalDoOS
                });
            }

            app.loaded = true;

            emit("app:initialized", {
                app: get(id)
            });

            return true;

        } catch (error) {
            recordError(
                error,
                `init:${id}`
            );

            return false;
        }
    }

    /* ==================================================
       START APP
    ================================================== */

    async function start(id, options = {}) {
        const app = state.apps.get(id);

        if (!app) {
            recordError(
                `App "${id}" wurde nicht gefunden.`,
                "start"
            );

            return false;
        }

        if (!app.enabled) {
            recordError(
                `App "${id}" ist deaktiviert.`,
                "start"
            );

            return false;
        }

        if (!app.installed) {
            recordError(
                `App "${id}" ist nicht installiert.`,
                "start"
            );

            return false;
        }

        if (app.running) {
            state.activeApp = id;

            emit("app:focused", {
                app: get(id)
            });

            return true;
        }

        const initialized =
            await initializeApp(id);

        if (!initialized) {
            return false;
        }

        /*
        --------------------------------------------------
        App Router anbinden
        --------------------------------------------------
        */

        try {
            const router =
                window.HalDoOS &&
                window.HalDoOS.appRouter;

            if (
                router &&
                typeof router.navigate === "function" &&
                options.route
            ) {
                await router.navigate(
                    options.route
                );
            }
        } catch (error) {
            recordError(
                error,
                `router:${id}`
            );
        }

        /*
        --------------------------------------------------
        App starten
        --------------------------------------------------
        */

        try {
            if (app.start) {
                await app.start({
                    app,
                    manager: api,
                    options,
                    kernel: window.HalDoKernel,
                    os: window.HalDoOS
                });
            }

            app.running = true;

            state.activeApp = id;

            state.startCount++;

            state.history.push({
                id,
                action: "start",
                time: new Date().toISOString()
            });

            if (state.history.length > 100) {
                state.history.shift();
            }

            emit("app:started", {
                app: get(id),
                options
            });

            syncLauncher();

            return true;

        } catch (error) {
            recordError(
                error,
                `start:${id}`
            );

            return false;
        }
    }

    /* ==================================================
       STOP APP
    ================================================== */

    async function stop(id) {
        const app = state.apps.get(id);

        if (!app) {
            return false;
        }

        if (!app.running) {
            return true;
        }

        try {
            if (app.stop) {
                await app.stop({
                    app,
                    manager: api,
                    kernel: window.HalDoKernel,
                    os: window.HalDoOS
                });
            }

            app.running = false;

            if (state.activeApp === id) {
                state.activeApp = null;
            }

            state.history.push({
                id,
                action: "stop",
                time: new Date().toISOString()
            });

            emit("app:stopped", {
                app: get(id)
            });

            syncLauncher();

            return true;

        } catch (error) {
            recordError(
                error,
                `stop:${id}`
            );

            return false;
        }
    }

    /* ==================================================
       RESTART APP
    ================================================== */

    async function restart(id, options = {}) {
        await stop(id);

        return start(id, options);
    }

    /* ==================================================
       ENABLE / DISABLE
    ================================================== */

    function enable(id) {
        const app = state.apps.get(id);

        if (!app) {
            return false;
        }

        app.enabled = true;

        emit("app:enabled", {
            app: get(id)
        });

        syncLauncher();

        return true;
    }

    function disable(id) {
        const app = state.apps.get(id);

        if (!app) {
            return false;
        }

        app.enabled = false;

        emit("app:disabled", {
            app: get(id)
        });

        syncLauncher();

        return true;
    }

    /* ==================================================
       CLOSE ACTIVE APP
    ================================================== */

    async function closeActive() {
        if (!state.activeApp) {
            return true;
        }

        return stop(state.activeApp);
    }

    /* ==================================================
       APP ROUTER CONNECTION
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

        if (
            typeof router.registerApp === "function"
        ) {
            getAll().forEach(app => {
                try {
                    router.registerApp(app);
                } catch (error) {
                    recordError(
                        error,
                        `router-register:${app.id}`
                    );
                }
            });
        }

        return true;
    }

    /* ==================================================
       APP REGISTRY CONNECTION
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
                typeof registry.getAll === "function"
            ) {
                const registered =
                    registry.getAll();

                if (Array.isArray(registered)) {
                    registerMany(registered);
                }
            }

            if (
                typeof registry.getApps === "function"
            ) {
                const registered =
                    registry.getApps();

                if (Array.isArray(registered)) {
                    registerMany(registered);
                }
            }

        } catch (error) {
            recordError(
                error,
                "registry-connect"
            );
        }

        return true;
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
                typeof launcher.updateApps === "function"
            ) {
                launcher.updateApps(
                    getAll()
                );
            }

            if (
                typeof launcher.setActiveApp === "function"
            ) {
                launcher.setActiveApp(
                    state.activeApp
                );
            }

        } catch (error) {
            recordError(
                error,
                "launcher-sync"
            );
        }

        return true;
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
                typeof kernel.on === "function"
            ) {
                kernel.on(
                    "kernel:ready",
                    () => {
                        emit("kernel:ready");
                    }
                );

                kernel.on(
                    "kernel:error",
                    payload => {
                        emit(
                            "kernel:error",
                            payload
                        );
                    }
                );
            }

        } catch (error) {
            recordError(
                error,
                "kernel-connect"
            );
        }

        return true;
    }

    /* ==================================================
       DEFAULT FOUNDATION APPS
    ================================================== */

    function registerFoundationApps() {
        const foundationApps = [

            {
                id: "haldo-ai",
                name: "HalDo AI",
                title: "HalDo AI Gespräch",
                version: VERSION,
                description:
                    "Zentrale HalDo AI Gesprächsoberfläche.",
                category: "ai",
                path: "chat.html"
            },

            {
                id: "dashboard",
                name: "Dashboard",
                title: "HalDo Dashboard",
                version: VERSION,
                description:
                    "Zentrale Systemübersicht.",
                category: "system",
                path: "dashboard.html"
            },

            {
                id: "apps",
                name: "Apps",
                title: "HalDo Apps",
                version: VERSION,
                description:
                    "Zentrale App-Verwaltung.",
                category: "system",
                path: "apps.html"
            },

            {
                id: "settings",
                name: "Einstellungen",
                title: "HalDo Einstellungen",
                version: VERSION,
                description:
                    "System- und Benutzerkonfiguration.",
                category: "system",
                path: "settings.html"
            },

            {
                id: "knowledge",
                name: "Wissen",
                title: "HalDo Knowledge",
                version: VERSION,
                description:
                    "Wissens- und Lernsystem.",
                category: "ai",
                path: "knowledge.html"
            },

            {
                id: "code-builder",
                name: "Code Builder",
                title: "HalDo Code Builder",
                version: VERSION,
                description:
                    "Code-Erstellung und Entwicklungswerkzeuge.",
                category: "development",
                path: "code.html"
            },

            {
                id: "languages",
                name: "Sprachen",
                title: "HalDo Sprachen",
                version: VERSION,
                description:
                    "Sprach- und Übersetzungssystem.",
                category: "language",
                path: "languages.html"
            },

            {
                id: "ezidi-keyboard",
                name: "Êzîdî Keyboard",
                title: "Êzîdî Tastatur",
                version: VERSION,
                description:
                    "HalDo Tastatur mit Êzîdî-Zeichen.",
                category: "input",
                path: "keyboard.html"
            },

            {
                id: "voice",
                name: "Voice",
                title: "Sprache / Mikrofon",
                version: VERSION,
                description:
                    "Sprachschnittstelle und Mikrofon.",
                category: "ai",
                path: "voice.html"
            },

            {
                id: "system",
                name: "System",
                title: "HalDo Systemzentrale",
                version: VERSION,
                description:
                    "Systemkern und Modulverwaltung.",
                category: "system",
                path: "system.html"
            },

            {
                id: "storage",
                name: "Storage",
                title: "HalDo Speicher",
                version: VERSION,
                description:
                    "Lokale Daten und Speicherverwaltung.",
                category: "system",
                path: "storage.html"
            },

            {
                id: "notifications",
                name: "Notifications",
                title: "HalDo Benachrichtigungen",
                version: VERSION,
                description:
                    "Systemmeldungen und Benachrichtigungen.",
                category: "system",
                path: "notifications.html"
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
            name: "HalDo Application Manager",
            version: VERSION,
            initialized:
                state.initialized,
            running:
                state.running,
            appCount:
                state.apps.size,
            activeApp:
                state.activeApp,
            startCount:
                state.startCount,
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
            errors:
                state.errors.length
        };
    }

    /* ==================================================
       INIT
    ================================================== */

    function init() {
        if (state.initialized) {
            return api;
        }

        connectKernel();

        registerFoundationApps();

        connectRegistry();

        connectRouter();

        syncLauncher();

        state.initialized = true;
        state.running = true;

        emit("ready", {
            manager: diagnose()
        });

        console.log(
            "HalDo Application Manager 18.0.0 bereit."
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

        unregister,
        unregisterApp:
            unregister,

        get,
        getApp:
            get,

        getAll,
        getApps:
            getAll,

        find,

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

        diagnose,

        getActiveApp() {
            return state.activeApp
                ? get(state.activeApp)
                : null;
        },

        getHistory() {
            return [
                ...state.history
            ];
        },

        getErrors() {
            return [
                ...state.errors
            ];
        },

        clearErrors() {
            state.errors.length = 0;
        }
    };

    /* ==================================================
       GLOBAL API
    ================================================== */

    window.HalDoAppManager = api;

    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.appManager =
        api;

    /*
    ------------------------------------------------------
    Kernel-Modul-Schnittstelle
    ------------------------------------------------------
    */

    function registerKernelModule() {
        const kernel =
            window.HalDoKernel;

        if (!kernel) {
            return;
        }

        try {
            if (
                typeof kernel.registerModule === "function"
            ) {
                kernel.registerModule(
                    "app-manager",
                    api
                );
            }
        } catch (error) {
            recordError(
                error,
                "kernel-register"
            );
        }
    }

    /* ==================================================
       AUTO INIT
    ================================================== */

    function boot() {
        init();

        registerKernelModule();

        /*
        --------------------------------------------------
        Nach dem vollständigen DOM erneut verbinden.
        --------------------------------------------------
        */

        setTimeout(() => {
            connectRegistry();
            connectRouter();
            syncLauncher();
        }, 0);
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            boot,
            {
                once: true
            }
        );
    } else {
        boot();
    }

})();