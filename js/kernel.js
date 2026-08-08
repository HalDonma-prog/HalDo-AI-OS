/* ============================================================
   HalDo AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei: js/kernel.js

   Aufgabe:
   - Zentraler System-Kernel
   - Startsequenz
   - Systemstatus
   - Modulverwaltung
   - Event-System
   - Fehlerbehandlung
   - Verbindung zu App Manager / Launcher
   ============================================================ */

"use strict";


/* ============================================================
   01 — HALDO KERNEL
   ============================================================ */

(function (window, document) {

    const VERSION = "18.0.0";
    const SYSTEM_NAME = "HalDo AI OS";
    const BUILD_NAME =
        "Professional Ultimate Foundation";


    /* ========================================================
       Kernel State
       ======================================================== */

    const state = {

        initialized: false,

        booted: false,

        ready: false,

        error: false,

        bootTime: null,

        version: VERSION,

        modules: {},

        events: {},

        logs: []

    };


    /* ========================================================
       Logger
       ======================================================== */

    function log(
        message,
        type = "info"
    ) {

        const entry = {

            time:
                new Date().toISOString(),

            type,

            message

        };


        state.logs.push(entry);


        /*
         * Logs begrenzen,
         * damit der Speicher nicht unnötig wächst.
         */

        if (
            state.logs.length > 200
        ) {

            state.logs.shift();

        }


        const prefix =
            `[${SYSTEM_NAME} ${VERSION}]`;


        if (
            type === "error"
        ) {

            console.error(
                prefix,
                message
            );

        }
        else if (
            type === "warning"
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
       Event System
       ======================================================== */

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
            !state.events[eventName]
        ) {

            state.events[eventName] = [];

        }


        state.events[eventName]
            .push(callback);


        return true;

    }


    function off(
        eventName,
        callback
    ) {

        if (
            !state.events[eventName]
        ) {

            return false;

        }


        state.events[eventName] =
            state.events[eventName]
                .filter(
                    fn => fn !== callback
                );


        return true;

    }


    function emit(
        eventName,
        data = null
    ) {

        const listeners =
            state.events[eventName];


        if (
            !listeners
        ) {

            return;

        }


        listeners.forEach(
            callback => {

                try {

                    callback(data);

                }
                catch (error) {

                    log(
                        `Fehler im Event "${eventName}": ${error.message}`,
                        "error"
                    );

                }

            }
        );

    }


    /* ========================================================
       Module Registry
       ======================================================== */

    function registerModule(
        name,
        module
    ) {

        if (
            !name
        ) {

            return false;

        }


        state.modules[name] = {

            name,

            module,

            registeredAt:
                Date.now(),

            ready: true

        };


        log(
            `Modul registriert: ${name}`
        );


        emit(
            "module:registered",
            {
                name,
                module
            }
        );


        return true;

    }


    function unregisterModule(
        name
    ) {

        if (
            !state.modules[name]
        ) {

            return false;

        }


        delete state.modules[name];


        log(
            `Modul entfernt: ${name}`
        );


        emit(
            "module:unregistered",
            {
                name
            }
        );


        return true;

    }


    function getModule(
        name
    ) {

        if (
            !state.modules[name]
        ) {

            return null;

        }


        return state.modules[name].module;

    }


    function hasModule(
        name
    ) {

        return Boolean(
            state.modules[name]
        );

    }


    /* ========================================================
       System Information
       ======================================================== */

    function getSystemInfo() {

        return {

            name:
                SYSTEM_NAME,

            version:
                VERSION,

            build:
                BUILD_NAME,

            initialized:
                state.initialized,

            booted:
                state.booted,

            ready:
                state.ready,

            error:
                state.error,

            bootTime:
                state.bootTime,

            moduleCount:
                Object.keys(
                    state.modules
                ).length,

            modules:
                Object.keys(
                    state.modules
                )

        };

    }


    /* ========================================================
       Device Information
       ======================================================== */

    function getDeviceInfo() {

        const ua =
            navigator.userAgent ||
            "";


        return {

            userAgent:
                ua,

            language:
                navigator.language ||
                "de-DE",

            languages:
                Array.isArray(
                    navigator.languages
                )
                    ? navigator.languages
                    : [],

            online:
                navigator.onLine,

            platform:
                navigator.platform ||
                "",

            screen: {

                width:
                    window.screen
                        ? window.screen.width
                        : 0,

                height:
                    window.screen
                        ? window.screen.height
                        : 0

            },

            viewport: {

                width:
                    window.innerWidth,

                height:
                    window.innerHeight

            },

            touch:

                "ontouchstart"
                in window

        };

    }


    /* ========================================================
       Environment Check
       ======================================================== */

    function checkEnvironment() {

        const checks = {

            document:
                Boolean(document),

            window:
                Boolean(window),

            localStorage:
                false,

            sessionStorage:
                false,

            fetch:
                typeof window.fetch ===
                "function",

            promises:
                typeof Promise ===
                "function",

            json:
                typeof JSON ===
                "object"

        };


        try {

            const testKey =
                "__haldo_test__";


            window.localStorage.setItem(
                testKey,
                "1"
            );


            window.localStorage.removeItem(
                testKey
            );


            checks.localStorage =
                true;

        }
        catch (error) {

            log(
                "localStorage ist nicht verfügbar.",
                "warning"
            );

        }


        try {

            const testKey =
                "__haldo_session_test__";


            window.sessionStorage.setItem(
                testKey,
                "1"
            );


            window.sessionStorage.removeItem(
                testKey
            );


            checks.sessionStorage =
                true;

        }
        catch (error) {

            log(
                "sessionStorage ist nicht verfügbar.",
                "warning"
            );

        }


        return checks;

    }


    /* ========================================================
       Storage Helper
       ======================================================== */

    const storage = {

        get(
            key,
            fallback = null
        ) {

            try {

                const value =
                    localStorage.getItem(
                        key
                    );


                if (
                    value === null
                ) {

                    return fallback;

                }


                return JSON.parse(
                    value
                );

            }
            catch (error) {

                return fallback;

            }

        },


        set(
            key,
            value
        ) {

            try {

                localStorage.setItem(
                    key,
                    JSON.stringify(
                        value
                    )
                );

                return true;

            }
            catch (error) {

                log(
                    `Storage-Fehler bei "${key}".`,
                    "warning"
                );

                return false;

            }

        },


        remove(
            key
        ) {

            try {

                localStorage.removeItem(
                    key
                );

                return true;

            }
            catch (error) {

                return false;

            }

        }

    };


    /* ========================================================
       Safe Async Helper
       ======================================================== */

    function wait(
        milliseconds
    ) {

        return new Promise(
            resolve => {

                window.setTimeout(
                    resolve,
                    milliseconds
                );

            }
        );

    }


    /* ========================================================
       Startup Status
       ======================================================== */

    function setStartupStatus(
        message
    ) {

        if (
            window.HalDoStartup &&
            typeof
                window.HalDoStartup.setStatus ===
                "function"
        ) {

            window.HalDoStartup.setStatus(
                message
            );

        }

    }


    /* ========================================================
       BOOT SEQUENCE
       ======================================================== */

    async function boot() {

        if (
            state.booted
        ) {

            return true;

        }


        state.bootTime =
            Date.now();


        log(
            "Kernel startet."
        );


        emit(
            "kernel:boot:start"
        );


        try {

            /* ----------------------------------------------
               Schritt 1
               ---------------------------------------------- */

            setStartupStatus(
                "HalDo AI Kernel wird initialisiert..."
            );


            await wait(120);


            state.initialized =
                true;


            log(
                "Kernel initialisiert."
            );


            emit(
                "kernel:initialized"
            );


            /* ----------------------------------------------
               Schritt 2
               ---------------------------------------------- */

            setStartupStatus(
                "Systemumgebung wird geprüft..."
            );


            await wait(120);


            const environment =
                checkEnvironment();


            state.environment =
                environment;


            emit(
                "environment:checked",
                environment
            );


            /* ----------------------------------------------
               Schritt 3
               ---------------------------------------------- */

            setStartupStatus(
                "HalDo AI Systemmodule werden vorbereitet..."
            );


            await wait(120);


            registerModule(
                "kernel",
                api
            );


            /* ----------------------------------------------
               Schritt 4
               ---------------------------------------------- */

            setStartupStatus(
                "HalDo AI App-System wird verbunden..."
            );


            await wait(100);


            state.booted =
                true;


            emit(
                "kernel:booted"
            );


            /* ----------------------------------------------
               Schritt 5
               ---------------------------------------------- */

            setStartupStatus(
                "HalDo AI OS 18 ist bereit."
            );


            state.ready =
                true;


            emit(
                "kernel:ready"
            );


            log(
                "HalDo AI OS 18 erfolgreich gestartet."
            );


            return true;

        }
        catch (error) {

            state.error =
                true;


            log(
                `Kernel-Fehler: ${error.message}`,
                "error"
            );


            emit(
                "kernel:error",
                error
            );


            setStartupStatus(
                "HalDo AI OS konnte nicht vollständig gestartet werden."
            );


            return false;

        }

    }


    /* ========================================================
       SYSTEM SHUTDOWN
       ======================================================== */

    function shutdown() {

        log(
            "HalDo AI OS wird beendet.",
            "warning"
        );


        state.ready =
            false;

        state.booted =
            false;


        emit(
            "kernel:shutdown"
        );

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    const api = {

        name:
            SYSTEM_NAME,

        version:
            VERSION,

        build:
            BUILD_NAME,


        /* Kernel */

        boot,

        shutdown,


        /* Status */

        getState:
            function () {

                return {

                    initialized:
                        state.initialized,

                    booted:
                        state.booted,

                    ready:
                        state.ready,

                    error:
                        state.error

                };

            },


        getSystemInfo,


        getDeviceInfo,


        /* Environment */

        checkEnvironment,


        /* Events */

        on,

        off,

        emit,


        /* Modules */

        registerModule,

        unregisterModule,

        getModule,

        hasModule,


        /* Storage */

        storage,


        /* Utility */

        wait,


        /* Logs */

        getLogs:
            function () {

                return [
                    ...state.logs
                ];

            },


        clearLogs:
            function () {

                state.logs.length =
                    0;

            }

    };


    /* ========================================================
       GLOBAL REGISTRATION
       ======================================================== */

    window.HalDoKernel =
        api;


    /* ========================================================
       LEGACY / COMPATIBILITY ALIASES
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.kernel =
        api;


    /* ========================================================
       GLOBAL ERROR HANDLING
       ======================================================== */

    window.addEventListener(
        "error",
        function (event) {

            /*
             * Nicht jeden Browserfehler als
             * vollständigen Systemabsturz behandeln.
             */

            log(
                event.message ||
                "Unbekannter JavaScript-Fehler.",
                "error"
            );


            emit(
                "system:error",
                event.error ||
                event
            );

        }
    );


    window.addEventListener(
        "unhandledrejection",
        function (event) {

            log(
                "Unbehandelte Promise-Ablehnung.",
                "error"
            );


            emit(
                "system:promise-error",
                event.reason
            );

        }
    );


    /* ========================================================
       ONLINE / OFFLINE
       ======================================================== */

    window.addEventListener(
        "online",
        function () {

            log(
                "Internetverbindung hergestellt."
            );


            emit(
                "network:online"
            );

        }
    );


    window.addEventListener(
        "offline",
        function () {

            log(
                "Internetverbindung verloren.",
                "warning"
            );


            emit(
                "network:offline"
            );

        }
    );


    /* ========================================================
       AUTOMATISCHER START
       ======================================================== */

    function startKernel() {

        /*
         * Kleine Verzögerung,
         * damit defer-Skripte und DOM
         * sauber initialisiert werden.
         */

        window.setTimeout(
            function () {

                boot();

            },
            50
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startKernel,
            {
                once: true
            }
        );

    }
    else {

        startKernel();

    }


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 KERNEL
   ============================================================ */