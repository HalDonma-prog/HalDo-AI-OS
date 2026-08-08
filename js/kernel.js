/* ============================================================
   HalDo AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei: js/kernel.js
   Aufgabe:
   - Zentraler Systemkern
   - Bootstrapping
   - Modul-/Service-Initialisierung
   - Systemzustand
   - Ereignisse
   - Fehlerbehandlung
   - globale HalDo API
   ============================================================ */

(function (window, document) {
    "use strict";

    const VERSION = "18.0.0";
    const SYSTEM_NAME = "HalDo AI OS";
    const EDITION = "Professional Ultimate Foundation";

    const state = {
        booting: false,
        ready: false,
        error: false,

        status: "idle",

        version: VERSION,
        systemName: SYSTEM_NAME,
        edition: EDITION,

        startTime: null,
        readyTime: null,

        modules: {},
        services: {},
        apps: {},

        events: {},
        errors: [],

        config: {
            system: null,
            apps: null,
            modules: null,
            permissions: null,
            keyboard: null,
            ai: null,
            themes: null,
            logo: null
        }
    };

    const listeners = new Map();

    /* =========================================================
       LOGGING
       ========================================================= */

    function timestamp() {
        return new Date().toISOString();
    }

    function log(message, data) {
        console.info(
            `[HalDo Kernel ${VERSION}] ${message}`,
            data !== undefined ? data : ""
        );
    }

    function warn(message, data) {
        console.warn(
            `[HalDo Kernel ${VERSION}] ${message}`,
            data !== undefined ? data : ""
        );
    }

    function error(message, details) {
        const entry = {
            time: timestamp(),
            message,
            details: details || null
        };

        state.errors.push(entry);
        state.error = true;

        console.error(
            `[HalDo Kernel ${VERSION}] ${message}`,
            details || ""
        );

        emit("kernel:error", entry);
    }

    /* =========================================================
       EVENTS
       ========================================================= */

    function on(eventName, callback) {
        if (typeof callback !== "function") {
            return function () {};
        }

        if (!listeners.has(eventName)) {
            listeners.set(eventName, new Set());
        }

        listeners.get(eventName).add(callback);

        return function unsubscribe() {
            off(eventName, callback);
        };
    }

    function off(eventName, callback) {
        const eventListeners = listeners.get(eventName);

        if (!eventListeners) {
            return;
        }

        eventListeners.delete(callback);

        if (eventListeners.size === 0) {
            listeners.delete(eventName);
        }
    }

    function emit(eventName, payload) {
        const eventListeners = listeners.get(eventName);

        if (!eventListeners) {
            return;
        }

        eventListeners.forEach(function (callback) {
            try {
                callback(payload);
            } catch (callbackError) {
                console.error(
                    `[HalDo Kernel] Event listener error: ${eventName}`,
                    callbackError
                );
            }
        });
    }

    /* =========================================================
       STATE
       ========================================================= */

    function setStatus(status) {
        state.status = status;

        emit("kernel:status", {
            status,
            time: timestamp()
        });

        updateSystemStatusElement(status);
    }

    function updateSystemStatusElement(status) {
        const element = document.querySelector(
            "[data-haldo-system-status]"
        );

        if (!element) {
            return;
        }

        element.textContent = status;
        element.dataset.status = status;
    }

    function getState() {
        return {
            ...state,
            modules: { ...state.modules },
            services: { ...state.services },
            apps: { ...state.apps },
            errors: [...state.errors]
        };
    }

    /* =========================================================
       CONFIGURATION
       ========================================================= */

    async function loadJSON(path) {
        const response = await fetch(path, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `Konfiguration konnte nicht geladen werden: ${path} (${response.status})`
            );
        }

        return response.json();
    }

    async function loadConfigurations() {
        setStatus("loading-config");

        const configurationFiles = {
            system: "config/system.json",
            apps: "config/apps.json",
            modules: "config/modules.json",
            permissions: "config/permissions.json",
            keyboard: "config/keyboard.json",
            ai: "config/ai.json",
            themes: "config/themes.json",
            logo: "config/logo.json"
        };

        const entries = Object.entries(configurationFiles);

        for (const [key, path] of entries) {
            try {
                state.config[key] = await loadJSON(path);

                log(`Konfiguration geladen: ${path}`);

                emit("config:loaded", {
                    key,
                    path,
                    config: state.config[key]
                });
            } catch (loadError) {
                error(
                    `Fehler beim Laden der Konfiguration: ${path}`,
                    loadError
                );

                throw loadError;
            }
        }

        setStatus("configuration-ready");

        return state.config;
    }

    /* =========================================================
       CONFIGURATION ACCESS
       ========================================================= */

    function getConfig(name) {
        if (!Object.prototype.hasOwnProperty.call(
            state.config,
            name
        )) {
            return null;
        }

        return state.config[name];
    }

    /* =========================================================
       MODULE REGISTRATION
       ========================================================= */

    function registerModule(id, moduleData) {
        if (!id) {
            throw new Error("Module-ID fehlt.");
        }

        if (state.modules[id]) {
            warn(`Modul bereits registriert: ${id}`);
            return false;
        }

        state.modules[id] = {
            id,
            ...moduleData,
            registeredAt: timestamp()
        };

        emit("module:registered", state.modules[id]);

        return true;
    }

    function unregisterModule(id) {
        if (!state.modules[id]) {
            return false;
        }

        delete state.modules[id];

        emit("module:unregistered", {
            id
        });

        return true;
    }

    function getModule(id) {
        return state.modules[id] || null;
    }

    /* =========================================================
       SERVICE REGISTRATION
       ========================================================= */

    function registerService(id, serviceData) {
        if (!id) {
            throw new Error("Service-ID fehlt.");
        }

        if (state.services[id]) {
            warn(`Service bereits registriert: ${id}`);
            return false;
        }

        state.services[id] = {
            id,
            ...serviceData,
            registeredAt: timestamp()
        };

        emit("service:registered", state.services[id]);

        return true;
    }

    function unregisterService(id) {
        if (!state.services[id]) {
            return false;
        }

        delete state.services[id];

        emit("service:unregistered", {
            id
        });

        return true;
    }

    function getService(id) {
        return state.services[id] || null;
    }

    /* =========================================================
       APP REGISTRATION
       ========================================================= */

    function registerApp(id, appData) {
        if (!id) {
            throw new Error("App-ID fehlt.");
        }

        if (state.apps[id]) {
            warn(`App bereits registriert: ${id}`);
            return false;
        }

        state.apps[id] = {
            id,
            ...appData,
            registeredAt: timestamp()
        };

        emit("app:registered", state.apps[id]);

        return true;
    }

    function unregisterApp(id) {
        if (!state.apps[id]) {
            return false;
        }

        delete state.apps[id];

        emit("app:unregistered", {
            id
        });

        return true;
    }

    function getApp(id) {
        return state.apps[id] || null;
    }

    /* =========================================================
       DEPENDENCY CHECK
       ========================================================= */

    function checkDependencies() {
        const moduleConfig = state.config.modules;

        if (!moduleConfig || !Array.isArray(moduleConfig.modules)) {
            throw new Error(
                "Keine gültige Modulkonfiguration vorhanden."
            );
        }

        const moduleIds = new Set(
            moduleConfig.modules.map(function (module) {
                return module.id;
            })
        );

        const problems = [];

        moduleConfig.modules.forEach(function (module) {
            const dependencies = Array.isArray(module.dependencies)
                ? module.dependencies
                : [];

            dependencies.forEach(function (dependency) {
                if (!moduleIds.has(dependency)) {
                    problems.push({
                        module: module.id,
                        missingDependency: dependency
                    });
                }
            });
        });

        if (problems.length > 0) {
            problems.forEach(function (problem) {
                warn(
                    `Fehlende Modulabhängigkeit: ${problem.module} → ${problem.missingDependency}`
                );
            });

            return false;
        }

        emit("dependencies:valid");

        return true;
    }

    /* =========================================================
       MODULE LOAD ORDER
       ========================================================= */

    function getModuleLoadOrder() {
        const moduleConfig = state.config.modules;

        if (!moduleConfig || !Array.isArray(moduleConfig.modules)) {
            return [];
        }

        return [...moduleConfig.modules]
            .filter(function (module) {
                return module.enabled !== false;
            })
            .sort(function (a, b) {
                return (b.priority || 0) - (a.priority || 0);
            });
    }

    /* =========================================================
       MODULE STATUS
       ========================================================= */

    function markModuleStatus(id, status, details) {
        if (!state.modules[id]) {
            state.modules[id] = {
                id
            };
        }

        state.modules[id].status = status;
        state.modules[id].updatedAt = timestamp();

        if (details !== undefined) {
            state.modules[id].details = details;
        }

        emit("module:status", {
            id,
            status,
            details: details || null
        });
    }

    /* =========================================================
       SYSTEM TEST
       ========================================================= */

    function runFoundationCheck() {
        const checks = {
            document: !!document,
            window: !!window,
            fetch: typeof fetch === "function",
            configuration: Object.values(state.config)
                .every(function (value) {
                    return value !== null;
                }),
            dependencies: false
        };

        try {
            checks.dependencies = checkDependencies();
        } catch (checkError) {
            checks.dependencies = false;
            warn(
                "Dependency-Check konnte nicht vollständig ausgeführt werden.",
                checkError
            );
        }

        const passed = Object.values(checks)
            .every(Boolean);

        emit("diagnostics:foundation", {
            passed,
            checks
        });

        return {
            passed,
            checks
        };
    }

    /* =========================================================
       GLOBAL API
       ========================================================= */

    function createGlobalAPI() {
        window.HalDo = {
            version: VERSION,

            system: {
                name: SYSTEM_NAME,
                edition: EDITION
            },

            kernel: {
                getState,
                setStatus,
                getConfig,

                on,
                off,
                emit,

                registerModule,
                unregisterModule,
                getModule,

                registerService,
                unregisterService,
                getService,

                registerApp,
                unregisterApp,
                getApp,

                checkDependencies,
                getModuleLoadOrder,
                runFoundationCheck
            }
        };

        emit("kernel:api-ready", window.HalDo);
    }

    /* =========================================================
       READY STATE
       ========================================================= */

    function markReady() {
        state.ready = true;
        state.booting = false;
        state.error = false;
        state.status = "ready";
        state.readyTime = Date.now();

        updateSystemStatusElement("ready");

        emit("kernel:ready", getState());

        log("HalDo AI OS Kernel ist bereit.");
    }

    /* =========================================================
       BOOTSTRAP
       ========================================================= */

    async function start() {
        if (state.booting) {
            warn("Kernel wird bereits gestartet.");
            return;
        }

        if (state.ready) {
            warn("Kernel ist bereits bereit.");
            return;
        }

        state.booting = true;
        state.startTime = Date.now();
        state.status = "booting";

        emit("kernel:starting", {
            version: VERSION,
            time: timestamp()
        });

        updateSystemStatusElement("booting");

        log("HalDo AI OS Kernel startet...");

        try {
            createGlobalAPI();

            await loadConfigurations();

            const foundation = runFoundationCheck();

            if (!foundation.passed) {
                throw new Error(
                    "Die HalDo AI OS Foundation-Prüfung ist fehlgeschlagen."
                );
            }

            setStatus("kernel-ready");

            emit("kernel:foundation-ready", {
                config: getState().config,
                modules: getModuleLoadOrder()
            });

            markReady();

        } catch (startError) {
            state.booting = false;
            state.ready = false;
            state.error = true;
            state.status = "error";

            error(
                "HalDo AI OS Kernel konnte nicht vollständig gestartet werden.",
                startError
            );

            updateSystemStatusElement("error");

            emit("kernel:failed", {
                error: startError,
                state: getState()
            });
        }
    }

    /* =========================================================
       DOM READY
       ========================================================= */

    function initialize() {
        if (
            document.readyState === "loading"
        ) {
            document.addEventListener(
                "DOMContentLoaded",
                start,
                { once: true }
            );
        } else {
            start();
        }
    }

    /* =========================================================
       PUBLIC KERNEL OBJECT
       ========================================================= */

    window.HalDoKernel = {
        version: VERSION,
        start,
        getState,
        getConfig,
        on,
        off,
        emit,
        registerModule,
        unregisterModule,
        getModule,
        registerService,
        unregisterService,
        getService,
        registerApp,
        unregisterApp,
        getApp,
        checkDependencies,
        getModuleLoadOrder,
        runFoundationCheck
    };

    initialize();

})(window, document);