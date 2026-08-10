/*
========================================================
HalDo AI OS 18
Runtime Bridge
Professional Ultimate Foundation

Zweck:
- verbindet vorhandene HalDo-Systeme
- erkennt vorhandene globale APIs
- verbindet Kernel / System / Apps / AI / Storage / UI
- zentraler Runtime-Zustand
- Event-Kommunikation
- Health Check
- Fehlerüberwachung
- keine bestehenden Module entfernen
- kompatibel mit vorhandenen Dateien
========================================================
*/

(function () {
    "use strict";

    const VERSION = "18.0.0";

    const state = {
        status: "initializing",
        startedAt: null,
        online: navigator.onLine,
        modules: {},
        errors: [],
        warnings: []
    };

    const listeners = {};

    /* ==================================================
       EVENT SYSTEM
    ================================================== */

    function on(event, callback) {
        if (typeof callback !== "function") return () => {};

        if (!listeners[event]) {
            listeners[event] = [];
        }

        listeners[event].push(callback);

        return function unsubscribe() {
            off(event, callback);
        };
    }

    function off(event, callback) {
        if (!listeners[event]) return;

        listeners[event] = listeners[event].filter(
            fn => fn !== callback
        );
    }

    function emit(event, payload = {}) {
        const list = listeners[event] || [];

        list.forEach(callback => {
            try {
                callback(payload);
            } catch (error) {
                recordError(
                    "Event listener error",
                    error
                );
            }
        });

        /*
         * Zusätzlich vorhandenen HalDo-Kernel benutzen.
         */
        try {
            if (
                window.HalDoKernel &&
                typeof window.HalDoKernel.emit === "function"
            ) {
                window.HalDoKernel.emit(event, payload);
            }
        } catch (error) {
            recordWarning(
                "Kernel Event konnte nicht übertragen werden."
            );
        }
    }

    /* ==================================================
       LOGGING
    ================================================== */

    function log(...args) {
        console.log(
            "[HalDo Runtime]",
            ...args
        );
    }

    function recordWarning(message, details = null) {
        const item = {
            time: new Date().toISOString(),
            message: String(message),
            details
        };

        state.warnings.push(item);

        if (state.warnings.length > 100) {
            state.warnings.shift();
        }

        console.warn(
            "[HalDo Runtime Warning]",
            message,
            details || ""
        );
    }

    function recordError(message, error = null) {
        const item = {
            time: new Date().toISOString(),
            message: String(message),
            error: error
                ? String(error.message || error)
                : null
        };

        state.errors.push(item);

        if (state.errors.length > 100) {
            state.errors.shift();
        }

        console.error(
            "[HalDo Runtime Error]",
            message,
            error || ""
        );

        emit(
            "runtime:error",
            item
        );
    }

    /* ==================================================
       EXISTING HALDO SYSTEMS
    ================================================== */

    function detect(name, object) {
        const available = !!object;

        state.modules[name] = {
            name,
            available,
            status: available
                ? "available"
                : "missing",
            detectedAt: new Date().toISOString()
        };

        return available;
    }

    function detectSystems() {

        detect(
            "kernel",
            window.HalDoKernel
        );

        detect(
            "system",
            window.HalDoSystem
        );

        detect(
            "aiCore",
            window.HalDoAICore
        );

        detect(
            "aiEngine",
            window.HalDoAIEngine
        );

        detect(
            "aiChat",
            window.HalDoAIChat
        );

        detect(
            "aiMemory",
            window.HalDoAIMemory
        );

        detect(
            "storage",
            window.HalDoStorage
        );

        detect(
            "storageManager",
            window.HalDoStorageManager
        );

        detect(
            "appManager",
            window.HalDoAppManager
        );

        detect(
            "appRegistry",
            window.HalDoAppRegistry
        );

        detect(
            "appRouter",
            window.HalDoAppRouter
        );

        detect(
            "launcher",
            window.HalDoLauncher
        );

        detect(
            "windowManager",
            window.HalDoWindowManager
        );

        detect(
            "language",
            window.HalDoLanguage
        );

        detect(
            "languageManager",
            window.HalDoLanguageManager
        );

        detect(
            "ezidiKeyboard",
            window.HalDoEzidiKeyboard
        );

        detect(
            "voice",
            window.HalDoVoice
        );

        detect(
            "speech",
            window.HalDoSpeech
        );

        detect(
            "light",
            window.HalDoLight
        );
    }

    /* ==================================================
       MODULE STARTUP
    ================================================== */

    function startModule(name, module) {

        if (!module) {
            return false;
        }

        if (
            typeof module.start === "function"
        ) {
            try {
                module.start();

                if (state.modules[name]) {
                    state.modules[name].status =
                        "running";
                }

                emit(
                    "module:started",
                    { name }
                );

                return true;

            } catch (error) {

                recordError(
                    `Modul ${name} konnte nicht gestartet werden.`,
                    error
                );

                return false;
            }
        }

        if (
            typeof module.init === "function"
        ) {
            try {
                module.init();

                if (state.modules[name]) {
                    state.modules[name].status =
                        "initialized";
                }

                emit(
                    "module:initialized",
                    { name }
                );

                return true;

            } catch (error) {

                recordError(
                    `Modul ${name} konnte nicht initialisiert werden.`,
                    error
                );

                return false;
            }
        }

        return false;
    }

    /* ==================================================
       SAFE STARTUP
    ================================================== */

    function startKnownModules() {

        /*
         * Der Runtime-Bridge startet NICHT blind jedes
         * Modul erneut. Bereits laufende Systeme bleiben
         * unangetastet.
         */

        const modules = [
            [
                "aiCore",
                window.HalDoAICore
            ],
            [
                "storageManager",
                window.HalDoStorageManager
            ],
            [
                "languageManager",
                window.HalDoLanguageManager
            ]
        ];

        modules.forEach(
            ([name, module]) => {

                if (!module) return;

                const info =
                    state.modules[name];

                if (
                    info &&
                    (
                        info.status === "running" ||
                        info.status === "initialized"
                    )
                ) {
                    return;
                }

                startModule(
                    name,
                    module
                );
            }
        );
    }

    /* ==================================================
       KERNEL CONNECTION
    ================================================== */

    function connectKernel() {

        const kernel =
            window.HalDoKernel;

        if (!kernel) {
            recordWarning(
                "HalDoKernel ist beim Runtime-Start noch nicht verfügbar."
            );
            return;
        }

        try {

            if (
                typeof kernel.on === "function"
            ) {

                kernel.on(
                    "kernel:ready",
                    payload => {

                        state.modules.kernel.status =
                            "ready";

                        emit(
                            "runtime:kernel-ready",
                            payload
                        );

                        refreshHealth();
                    }
                );

                kernel.on(
                    "kernel:error",
                    payload => {

                        state.modules.kernel.status =
                            "error";

                        recordError(
                            "Kernel meldet einen Fehler.",
                            payload
                        );
                    }
                );
            }

        } catch (error) {

            recordError(
                "Kernel-Verbindung fehlgeschlagen.",
                error
            );
        }
    }

    /* ==================================================
       SYSTEM CONNECTION
    ================================================== */

    function connectSystem() {

        const system =
            window.HalDoSystem;

        if (!system) {
            recordWarning(
                "HalDoSystem ist beim Runtime-Start noch nicht verfügbar."
            );
            return;
        }

        try {

            if (
                typeof system.on === "function"
            ) {

                system.on(
                    "system:ready",
                    payload => {

                        state.modules.system.status =
                            "ready";

                        emit(
                            "runtime:system-ready",
                            payload
                        );

                        refreshHealth();
                    }
                );

            }

        } catch (error) {

            recordError(
                "System-Verbindung fehlgeschlagen.",
                error
            );
        }
    }

    /* ==================================================
       NETWORK
    ================================================== */

    function updateNetworkState() {

        state.online =
            navigator.onLine;

        emit(
            state.online
                ? "network:online"
                : "network:offline",
            {
                online: state.online
            }
        );

        log(
            state.online
                ? "Online"
                : "Offline"
        );
    }

    /* ==================================================
       HEALTH CHECK
    ================================================== */

    function refreshHealth() {

        detectSystems();

        const modules =
            Object.values(
                state.modules
            );

        const available =
            modules.filter(
                module =>
                    module.available
            ).length;

        const total =
            modules.length;

        const errors =
            state.errors.length;

        if (errors > 0) {
            state.status = "degraded";
        } else if (available === 0) {
            state.status = "waiting";
        } else {
            state.status = "running";
        }

        const health = {
            status: state.status,
            online: state.online,
            available,
            total,
            errors,
            warnings: state.warnings.length,
            version: VERSION
        };

        emit(
            "runtime:health",
            health
        );

        return health;
    }

    /* ==================================================
       PUBLIC API
    ================================================== */

    const Runtime = {

        name: "HalDo Runtime Bridge",

        version: VERSION,

        getState() {
            return JSON.parse(
                JSON.stringify(state)
            );
        },

        getModules() {
            return JSON.parse(
                JSON.stringify(
                    state.modules
                )
            );
        },

        getModule(name) {
            return (
                state.modules[name] ||
                null
            );
        },

        health() {
            return refreshHealth();
        },

        on,

        off,

        emit,

        start() {

            if (
                state.status === "running"
            ) {
                return this.getState();
            }

            state.startedAt =
                new Date().toISOString();

            state.status =
                "starting";

            log(
                "HalDo Runtime Bridge startet."
            );

            detectSystems();

            connectKernel();

            connectSystem();

            startKnownModules();

            state.status =
                "running";

            refreshHealth();

            emit(
                "runtime:ready",
                this.getState()
            );

            log(
                "HalDo Runtime Bridge ist bereit."
            );

            return this.getState();
        },

        restartHealthCheck() {
            return refreshHealth();
        }
    };

    /* ==================================================
       GLOBAL API
    ================================================== */

    window.HalDoRuntime =
        Runtime;

    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.runtime =
        Runtime;

    /* ==================================================
       GLOBAL ERROR HANDLING
    ================================================== */

    window.addEventListener(
        "error",
        event => {

            if (!event) return;

            recordError(
                event.message ||
                "Unbekannter JavaScript-Fehler.",
                event.error || null
            );
        }
    );

    window.addEventListener(
        "unhandledrejection",
        event => {

            recordError(
                "Unbehandelte Promise-Ablehnung.",
                event.reason || null
            );
        }
    );

    window.addEventListener(
        "online",
        updateNetworkState
    );

    window.addEventListener(
        "offline",
        updateNetworkState
    );

    /* ==================================================
       START
    ================================================== */

    function bootRuntime() {

        try {

            Runtime.start();

        } catch (error) {

            recordError(
                "Runtime konnte nicht gestartet werden.",
                error
            );
        }
    }

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            bootRuntime,
            {
                once: true
            }
        );

    } else {

        bootRuntime();

    }

})();