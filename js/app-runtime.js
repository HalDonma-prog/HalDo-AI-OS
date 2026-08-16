/* ============================================================
 * HalDo AI OS 18
 * APP RUNTIME
 * ------------------------------------------------------------
 * File: js/app-runtime.js
 *
 * Zweck:
 * Zentrale Runtime-Verbindung für alle HalDo Apps.
 *
 * Verbindet:
 * App
 *  ↓
 * App Runtime
 *  ↓
 * App Manager / Registry / Router
 *  ↓
 * Window Manager
 *  ↓
 * Kernel / System
 *  ↓
 * Storage / AI / Language / Voice
 *
 * Bestehende Systeme werden nicht ersetzt.
 * Diese Datei arbeitet als verbindende Schicht.
 * ============================================================ */

(function (window) {
    "use strict";

    const VERSION = "18.0.0";

    const runtime = {
        version: VERSION,
        initialized: false,

        apps: new Map(),
        states: new Map(),
        listeners: new Map(),

        dependencies: {
            kernel: null,
            system: null,
            appManager: null,
            appRegistry: null,
            appRouter: null,
            windowManager: null,
            storage: null,
            ai: null,
            language: null,
            voice: null
        }
    };

    /* ============================================================
     * LOGGING
     * ============================================================ */

    function log(...args) {
        console.log("[HalDo App Runtime]", ...args);
    }

    function warn(...args) {
        console.warn("[HalDo App Runtime]", ...args);
    }

    function error(...args) {
        console.error("[HalDo App Runtime]", ...args);
    }

    /* ============================================================
     * SAFE GLOBAL LOOKUP
     * ============================================================ */

    function findGlobal(names) {
        for (const name of names) {
            try {
                if (name.includes(".")) {
                    const parts = name.split(".");
                    let value = window;

                    for (const part of parts) {
                        value = value?.[part];
                    }

                    if (value) {
                        return value;
                    }
                } else if (window[name]) {
                    return window[name];
                }
            } catch (err) {
                warn("Global lookup failed:", name, err);
            }
        }

        return null;
    }

    /* ============================================================
     * DEPENDENCY DISCOVERY
     * ============================================================ */

    function discoverDependencies() {
        runtime.dependencies.kernel =
            findGlobal([
                "HalDoKernel",
                "HalDoOS.kernel"
            ]);

        runtime.dependencies.system =
            findGlobal([
                "HalDoSystem",
                "HalDoOS.system"
            ]);

        runtime.dependencies.appManager =
            findGlobal([
                "HalDoAppManager",
                "HalDoOS.appManager",
                "AppManager"
            ]);

        runtime.dependencies.appRegistry =
            findGlobal([
                "HalDoAppRegistry",
                "HalDoOS.appRegistry",
                "AppRegistry"
            ]);

        runtime.dependencies.appRouter =
            findGlobal([
                "HalDoAppRouter",
                "HalDoOS.appRouter",
                "AppRouter"
            ]);

        runtime.dependencies.windowManager =
            findGlobal([
                "HalDoWindowManager",
                "HalDoOS.windowManager",
                "WindowManager"
            ]);

        runtime.dependencies.storage =
            findGlobal([
                "HalDoStorage",
                "HalDoOS.storage",
                "HalDoStorageManager"
            ]);

        runtime.dependencies.ai =
            findGlobal([
                "HalDoAI",
                "HalDoOS.ai",
                "HalDoAICore"
            ]);

        runtime.dependencies.language =
            findGlobal([
                "HalDoLanguage",
                "HalDoOS.language",
                "HalDoLanguageSystem"
            ]);

        runtime.dependencies.voice =
            findGlobal([
                "HalDoVoice",
                "HalDoOS.voice"
            ]);

        return runtime.dependencies;
    }

    /* ============================================================
     * EVENT SYSTEM
     * ============================================================ */

    function on(eventName, callback) {
        if (typeof callback !== "function") {
            return () => {};
        }

        if (!runtime.listeners.has(eventName)) {
            runtime.listeners.set(eventName, new Set());
        }

        runtime.listeners.get(eventName).add(callback);

        return () => off(eventName, callback);
    }

    function off(eventName, callback) {
        const listeners = runtime.listeners.get(eventName);

        if (!listeners) {
            return;
        }

        listeners.delete(callback);

        if (listeners.size === 0) {
            runtime.listeners.delete(eventName);
        }
    }

    function emit(eventName, payload = {}) {
        const listeners = runtime.listeners.get(eventName);

        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(payload);
                } catch (err) {
                    error(
                        `Event listener failed: ${eventName}`,
                        err
                    );
                }
            });
        }

        /*
         * Gleichzeitig versuchen wir den bestehenden Kernel
         * zu informieren.
         */
        const kernel = runtime.dependencies.kernel;

        try {
            if (kernel?.emit) {
                kernel.emit(`app-runtime:${eventName}`, payload);
            }
        } catch (err) {
            warn("Kernel event forwarding failed:", err);
        }
    }

    /* ============================================================
     * APP REGISTRATION
     * ============================================================ */

    function registerApp(appDefinition) {
        if (!appDefinition || typeof appDefinition !== "object") {
            throw new Error("Invalid app definition.");
        }

        const id = String(
            appDefinition.id ||
            appDefinition.appId ||
            appDefinition.name ||
            ""
        ).trim();

        if (!id) {
            throw new Error("App requires an id.");
        }

        const existing = runtime.apps.get(id);

        if (existing) {
            warn(`App already registered: ${id}`);

            /*
             * Nicht blind überschreiben.
             * Fehlende Eigenschaften werden ergänzt.
             */
            runtime.apps.set(id, {
                ...existing,
                ...appDefinition,
                id
            });
        } else {
            runtime.apps.set(id, {
                ...appDefinition,
                id
            });
        }

        if (!runtime.states.has(id)) {
            runtime.states.set(id, {
                id,
                status: "registered",
                visible: false,
                active: false,
                initialized: false,
                error: null,
                data: {}
            });
        }

        emit("app:registered", {
            id,
            app: runtime.apps.get(id)
        });

        return runtime.apps.get(id);
    }

    function unregisterApp(id) {
        id = String(id);

        const app = runtime.apps.get(id);

        if (!app) {
            return false;
        }

        runtime.apps.delete(id);
        runtime.states.delete(id);

        emit("app:unregistered", { id });

        return true;
    }

    function getApp(id) {
        return runtime.apps.get(String(id)) || null;
    }

    function getApps() {
        return Array.from(runtime.apps.values());
    }

    /* ============================================================
     * STATE MANAGEMENT
     * ============================================================ */

    function getState(id) {
        return runtime.states.get(String(id)) || null;
    }

    function updateState(id, changes = {}) {
        id = String(id);

        const current = runtime.states.get(id) || {
            id,
            status: "registered",
            visible: false,
            active: false,
            initialized: false,
            error: null,
            data: {}
        };

        const next = {
            ...current,
            ...changes,
            id
        };

        runtime.states.set(id, next);

        emit("app:state-changed", {
            id,
            state: next
        });

        return next;
    }

    /* ============================================================
     * STORAGE
     * ============================================================ */

    async function saveAppState(id, data) {
        const storage = runtime.dependencies.storage;

        updateState(id, {
            data: data || {}
        });

        if (!storage) {
            return false;
        }

        try {
            if (typeof storage.set === "function") {
                await storage.set(
                    `haldo.app.${id}.state`,
                    data
                );

                return true;
            }

            if (typeof storage.save === "function") {
                await storage.save(
                    `haldo.app.${id}.state`,
                    data
                );

                return true;
            }

            if (typeof storage.write === "function") {
                await storage.write(
                    `haldo.app.${id}.state`,
                    data
                );

                return true;
            }
        } catch (err) {
            error("Could not save app state:", id, err);

            updateState(id, {
                error: err
            });
        }

        return false;
    }

    async function loadAppState(id) {
        const storage = runtime.dependencies.storage;

        if (!storage) {
            return null;
        }

        try {
            let data = null;

            if (typeof storage.get === "function") {
                data = await storage.get(
                    `haldo.app.${id}.state`
                );
            } else if (typeof storage.load === "function") {
                data = await storage.load(
                    `haldo.app.${id}.state`
                );
            } else if (typeof storage.read === "function") {
                data = await storage.read(
                    `haldo.app.${id}.state`
                );
            }

            if (data !== null && data !== undefined) {
                updateState(id, {
                    data
                });
            }

            return data;
        } catch (err) {
            error("Could not load app state:", id, err);

            updateState(id, {
                error: err
            });

            return null;
        }
    }

    /* ============================================================
     * ROUTING
     * ============================================================ */

    function openRoute(id, route = "/") {
        const router = runtime.dependencies.appRouter;

        try {
            if (router?.navigate) {
                return router.navigate(route, {
                    appId: id
                });
            }

            if (router?.open) {
                return router.open(id, route);
            }

            if (router?.route) {
                return router.route(id, route);
            }
        } catch (err) {
            error("Routing failed:", id, route, err);
        }

        emit("app:routing-failed", {
            id,
            route
        });

        return false;
    }

    /* ============================================================
     * WINDOW MANAGEMENT
     * ============================================================ */

    function openWindow(id, options = {}) {
        const manager = runtime.dependencies.windowManager;

        try {
            if (manager?.open) {
                return manager.open({
                    appId: id,
                    ...options
                });
            }

            if (manager?.createWindow) {
                return manager.createWindow({
                    appId: id,
                    ...options
                });
            }

            if (manager?.launch) {
                return manager.launch(id, options);
            }
        } catch (err) {
            error("Window opening failed:", id, err);
        }

        emit("app:window-failed", {
            id,
            options
        });

        return false;
    }

    /* ============================================================
     * APP INITIALIZATION
     * ============================================================ */

    async function initializeApp(id) {
        const app = getApp(id);

        if (!app) {
            throw new Error(`App not found: ${id}`);
        }

        const state = getState(id);

        if (state?.initialized) {
            return true;
        }

        updateState(id, {
            status: "initializing",
            error: null
        });

        try {
            await loadAppState(id);

            if (typeof app.init === "function") {
                await app.init(createAppContext(id));
            }

            updateState(id, {
                status: "ready",
                initialized: true
            });

            emit("app:ready", {
                id,
                app
            });

            return true;
        } catch (err) {
            error(`App initialization failed: ${id}`, err);

            updateState(id, {
                status: "error",
                initialized: false,
                error: err
            });

            emit("app:error", {
                id,
                error: err
            });

            return false;
        }
    }

    /* ============================================================
     * APP OPEN
     * ============================================================ */

    async function openApp(id, options = {}) {
        id = String(id);

        const app = getApp(id);

        if (!app) {
            warn(`Cannot open unknown app: ${id}`);

            emit("app:open-failed", {
                id,
                reason: "not-found"
            });

            return false;
        }

        const initialized = await initializeApp(id);

        if (!initialized) {
            return false;
        }

        updateState(id, {
            status: "open",
            visible: true,
            active: true
        });

        openWindow(id, options);

        if (options.route) {
            openRoute(id, options.route);
        }

        try {
            if (typeof app.onOpen === "function") {
                await app.onOpen(
                    options,
                    createAppContext(id)
                );
            }
        } catch (err) {
            error(`App onOpen failed: ${id}`, err);
        }

        emit("app:opened", {
            id,
            options
        });

        return true;
    }

    /* ============================================================
     * APP CLOSE
     * ============================================================ */

    async function closeApp(id, options = {}) {
        id = String(id);

        const app = getApp(id);

        if (!app) {
            return false;
        }

        try {
            if (typeof app.onClose === "function") {
                await app.onClose(
                    options,
                    createAppContext(id)
                );
            }
        } catch (err) {
            error(`App onClose failed: ${id}`, err);
        }

        await saveAppState(
            id,
            getState(id)?.data || {}
        );

        updateState(id, {
            status: "ready",
            visible: false,
            active: false
        });

        emit("app:closed", {
            id
        });

        return true;
    }

    /* ============================================================
     * APP CONTEXT
     * ============================================================ */

    function createAppContext(id) {
        return {
            appId: id,

            runtime,

            kernel: runtime.dependencies.kernel,
            system: runtime.dependencies.system,
            appManager: runtime.dependencies.appManager,
            appRegistry: runtime.dependencies.appRegistry,
            appRouter: runtime.dependencies.appRouter,
            windowManager: runtime.dependencies.windowManager,
            storage: runtime.dependencies.storage,
            ai: runtime.dependencies.ai,
            language: runtime.dependencies.language,
            voice: runtime.dependencies.voice,

            getState: () => getState(id),

            updateState: changes =>
                updateState(id, changes),

            saveState: data =>
                saveAppState(id, data),

            loadState: () =>
                loadAppState(id),

            openApp,

            closeApp,

            openRoute: route =>
                openRoute(id, route),

            openWindow: options =>
                openWindow(id, options),

            on,

            off,

            emit
        };
    }

    /* ============================================================
     * REGISTER EXISTING APPS
     * ============================================================ */

    function syncExistingApps() {
        const registry = runtime.dependencies.appRegistry;

        if (!registry) {
            return;
        }

        try {
            let apps = [];

            if (typeof registry.getApps === "function") {
                apps = registry.getApps();
            } else if (Array.isArray(registry.apps)) {
                apps = registry.apps;
            }

            if (Array.isArray(apps)) {
                apps.forEach(app => {
                    if (app) {
                        registerApp(app);
                    }
                });
            }
        } catch (err) {
            warn("Could not synchronize app registry:", err);
        }
    }

    /* ============================================================
     * INITIALIZATION
     * ============================================================ */

    function initialize() {
        if (runtime.initialized) {
            return runtime;
        }

        discoverDependencies();

        syncExistingApps();

        runtime.initialized = true;

        emit("runtime:ready", {
            version: VERSION,
            dependencies: runtime.dependencies
        });

        log(
            `App Runtime ${VERSION} initialized.`,
            runtime.dependencies
        );

        return runtime;
    }

    /* ============================================================
     * PUBLIC API
     * ============================================================ */

    runtime.initialize = initialize;

    runtime.registerApp = registerApp;
    runtime.unregisterApp = unregisterApp;

    runtime.getApp = getApp;
    runtime.getApps = getApps;

    runtime.getState = getState;
    runtime.updateState = updateState;

    runtime.initializeApp = initializeApp;
    runtime.openApp = openApp;
    runtime.closeApp = closeApp;

    runtime.openRoute = openRoute;
    runtime.openWindow = openWindow;

    runtime.saveAppState = saveAppState;
    runtime.loadAppState = loadAppState;

    runtime.createAppContext = createAppContext;

    runtime.on = on;
    runtime.off = off;
    runtime.emit = emit;

    runtime.discoverDependencies =
        discoverDependencies;

    /* ============================================================
     * GLOBAL API
     * ============================================================ */

    window.HalDoAppRuntime = runtime;

    window.HalDoOS = window.HalDoOS || {};
    window.HalDoOS.appRuntime = runtime;

    /* ============================================================
     * SAFE START
     * ============================================================ */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }

})(window);