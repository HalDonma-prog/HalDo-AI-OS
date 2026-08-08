/* ============================================================
   HalDo AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei: js/kernel.js

   Zentrale System-Kernel-Schicht

   Aufgaben:
   - Systemzustand
   - Modulverwaltung
   - Event-Bus
   - Startsequenz
   - Fehlerbehandlung
   - Systemdiagnose
   - globale HalDo OS API
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const VERSION = "18.0.0";

    const SYSTEM_NAME =
        "HalDo AI OS";

    const SYSTEM_EDITION =
        "Professional Ultimate Foundation";


    /* ========================================================
       02 — KERNEL STATE
       ======================================================== */

    const state = {

        initialized: false,

        starting: false,

        ready: false,

        failed: false,

        startTime: null,

        readyTime: null,

        uptime: 0,

        modules: new Map(),

        moduleStatus: new Map(),

        errors: [],

        warnings: [],

        events: 0

    };


    /* ========================================================
       03 — EVENT BUS
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

            listeners[eventName] = [];

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
                listener =>
                    listener !== callback
            );


        return true;

    }


    function emit(
        eventName,
        data = null
    ) {

        state.events++;


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

                        reportError(
                            error,
                            `Event: ${eventName}`
                        );

                    }

                }
            );

    }


    /* ========================================================
       04 — LOGGING
       ======================================================== */

    function timestamp() {

        return new Date()
            .toLocaleTimeString(
                "de-DE",
                {
                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    second:
                        "2-digit"
                }
            );

    }


    function log(
        message,
        type = "info"
    ) {

        const prefix =
            `[${SYSTEM_NAME}]`;


        const output =
            `${prefix} [${timestamp()}] ${message}`;


        if (
            type ===
            "error"
        ) {

            console.error(
                output
            );

        }
        else if (
            type ===
            "warning"
        ) {

            console.warn(
                output
            );

        }
        else {

            console.log(
                output
            );

        }


        emit(
            "kernel:log",
            {
                message,
                type,
                time:
                    Date.now()
            }
        );

    }


    /* ========================================================
       05 — FEHLER
       ======================================================== */

    function reportError(
        error,
        context = "Unknown"
    ) {

        const normalized =
            error instanceof Error
                ? error
                : new Error(
                    String(
                        error
                    )
                );


        const record = {

            message:
                normalized.message,

            name:
                normalized.name,

            stack:
                normalized.stack ||
                "",

            context,

            time:
                Date.now()

        };


        state.errors.push(
            record
        );


        /*
         * Nur die letzten 100 Fehler
         * behalten.
         */

        if (
            state.errors.length >
            100
        ) {

            state.errors.shift();

        }


        log(
            `${context}: ${normalized.message}`,
            "error"
        );


        emit(
            "kernel:error",
            record
        );


        return record;

    }


    /* ========================================================
       06 — WARNUNG
       ======================================================== */

    function reportWarning(
        message,
        context = "System"
    ) {

        const record = {

            message:
                String(
                    message
                ),

            context,

            time:
                Date.now()

        };


        state.warnings.push(
            record
        );


        if (
            state.warnings.length >
            100
        ) {

            state.warnings.shift();

        }


        log(
            `${context}: ${message}`,
            "warning"
        );


        emit(
            "kernel:warning",
            record
        );


        return record;

    }


    /* ========================================================
       07 — MODUL REGISTRIEREN
       ======================================================== */

    function registerModule(
        name,
        module
    ) {

        if (
            !name
        ) {

            reportWarning(
                "Ein Modul ohne Namen wurde abgelehnt.",
                "Module"
            );


            return false;

        }


        const moduleName =
            String(
                name
            )
            .trim()
            .toLowerCase();


        if (
            !module
        ) {

            reportWarning(
                `Modul '${moduleName}' ist leer.`,
                "Module"
            );


            return false;

        }


        state.modules.set(
            moduleName,
            module
        );


        state.moduleStatus.set(
            moduleName,
            {
                registered:
                    true,

                ready:
                    false,

                registeredAt:
                    Date.now()
            }
        );


        emit(
            "module:registered",
            {
                name:
                    moduleName,

                module
            }
        );


        log(
            `Modul registriert: ${moduleName}`
        );


        return true;

    }


    /* ========================================================
       08 — MODUL ABFRAGEN
       ======================================================== */

    function getModule(
        name
    ) {

        if (
            !name
        ) {

            return null;

        }


        return (
            state.modules.get(
                String(
                    name
                )
                .trim()
                .toLowerCase()
            ) ||
            null
        );

    }


    /* ========================================================
       09 — MODULSTATUS
       ======================================================== */

    function setModuleReady(
        name,
        ready = true
    ) {

        const moduleName =
            String(
                name
            )
            .trim()
            .toLowerCase();


        const current =
            state.moduleStatus.get(
                moduleName
            ) ||
            {};


        state.moduleStatus.set(
            moduleName,
            {
                ...current,

                registered:
                    true,

                ready:
                    Boolean(
                        ready
                    ),

                readyAt:
                    ready
                        ? Date.now()
                        : null

            }
        );


        emit(
            "module:status",
            {
                name:
                    moduleName,

                ready:
                    Boolean(
                        ready
                    )
            }
        );

    }


    /* ========================================================
       10 — MODULE ALLE
       ======================================================== */

    function getModules() {

        return [
            ...state.modules.entries()
        ]
        .map(
            ([name, module]) => ({

                name,

                module,

                status:
                    state.moduleStatus.get(
                        name
                    ) ||
                    null

            })
        );

    }


    /* ========================================================
       11 — MODUL ENTFERNEN
       ======================================================== */

    function unregisterModule(
        name
    ) {

        const moduleName =
            String(
                name
            )
            .trim()
            .toLowerCase();


        const existed =
            state.modules.delete(
                moduleName
            );


        state.moduleStatus.delete(
            moduleName
        );


        if (
            existed
        ) {

            emit(
                "module:unregistered",
                {
                    name:
                        moduleName
                }
            );

        }


        return existed;

    }


    /* ========================================================
       12 — UPTIME
       ======================================================== */

    function updateUptime() {

        if (
            !state.startTime
        ) {

            state.uptime =
                0;

            return;

        }


        state.uptime =
            Date.now() -
            state.startTime;

    }


    /* ========================================================
       13 — SYSTEM STATUS
       ======================================================== */

    function getStatus() {

        updateUptime();


        const modules =
            getModules();


        return {

            system:
                SYSTEM_NAME,

            version:
                VERSION,

            edition:
                SYSTEM_EDITION,

            initialized:
                state.initialized,

            starting:
                state.starting,

            ready:
                state.ready,

            failed:
                state.failed,

            startTime:
                state.startTime,

            readyTime:
                state.readyTime,

            uptime:
                state.uptime,

            moduleCount:
                modules.length,

            readyModules:
                modules.filter(
                    item =>
                        item.status &&
                        item.status.ready
                ).length,

            errorCount:
                state.errors.length,

            warningCount:
                state.warnings.length,

            eventCount:
                state.events

        };

    }


    /* ========================================================
       14 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        const status =
            getStatus();


        const diagnostics = {

            browser:
                {
                    userAgent:
                        navigator.userAgent,

                    language:
                        navigator.language,

                    online:
                        navigator.onLine,

                    cookies:
                        navigator.cookieEnabled

                },


            display:
                {
                    width:
                        window.innerWidth,

                    height:
                        window.innerHeight,

                    pixelRatio:
                        window.devicePixelRatio ||
                        1

                },


            storage:
                {
                    localStorage:
                        testStorage()
                },


            kernel:
                status,

            modules:
                getModules()
                    .map(
                        item => ({
                            name:
                                item.name,

                            ready:
                                Boolean(
                                    item.status &&
                                    item.status.ready
                                )
                        })
                    )

        };


        emit(
            "kernel:diagnostics",
            diagnostics
        );


        return diagnostics;

    }


    /* ========================================================
       15 — STORAGE TEST
       ======================================================== */

    function testStorage() {

        try {

            const key =
                "__haldo_kernel_test__";


            window.localStorage.setItem(
                key,
                "1"
            );


            window.localStorage.removeItem(
                key
            );


            return true;

        }
        catch (
            error
        ) {

            return false;

        }

    }


    /* ========================================================
       16 — SAFE MODULE INIT
       ======================================================== */

    async function initializeModule(
        name,
        module
    ) {

        if (
            !module
        ) {

            return false;

        }


        try {

            /*
             * Manche Module besitzen init().
             */

            if (
                typeof module.init ===
                "function"
            ) {

                const result =
                    module.init();


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            }


            setModuleReady(
                name,
                true
            );


            return true;

        }
        catch (
            error
        ) {

            setModuleReady(
                name,
                false
            );


            reportError(
                error,
                `Modul '${name}'`
            );


            return false;

        }

    }


    /* ========================================================
       17 — KERNEL START
       ======================================================== */

    async function start() {

        if (
            state.ready
        ) {

            return getStatus();

        }


        if (
            state.starting
        ) {

            return getStatus();

        }


        state.starting =
            true;

        state.failed =
            false;

        state.startTime =
            Date.now();


        emit(
            "kernel:starting",
            getStatus()
        );


        log(
            `${SYSTEM_NAME} ${VERSION} startet…`
        );


        /*
         * Kernel selbst initialisiert.
         */

        state.initialized =
            true;


        emit(
            "kernel:initialized",
            getStatus()
        );


        /*
         * Warten, damit defer-Skripte
         * ihre globalen APIs registrieren
         * können.
         */

        await wait(
            0
        );


        /*
         * Bekannte Kernmodule prüfen.
         */

        const moduleNames = [

            "app-manager",

            "app-router",

            "launcher",

            "system"

        ];


        for (
            const moduleName of moduleNames
        ) {

            const module =
                getModule(
                    moduleName
                );


            if (
                module
            ) {

                await initializeModule(
                    moduleName,
                    module
                );

            }

        }


        state.ready =
            true;

        state.starting =
            false;

        state.failed =
            false;

        state.readyTime =
            Date.now();


        emit(
            "kernel:ready",
            getStatus()
        );


        log(
            `${SYSTEM_NAME} ist bereit.`
        );


        return getStatus();

    }


    /* ========================================================
       18 — WAIT
       ======================================================== */

    function wait(
        milliseconds
    ) {

        return new Promise(
            resolve =>
                window.setTimeout(
                    resolve,
                    milliseconds
                )
        );

    }


    /* ========================================================
       19 — RESET FEHLER
       ======================================================== */

    function clearDiagnostics() {

        state.errors =
            [];

        state.warnings =
            [];


        emit(
            "kernel:diagnostics:cleared"
        );


        return true;

    }


    /* ========================================================
       20 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            SYSTEM_NAME,

        version:
            VERSION,

        edition:
            SYSTEM_EDITION,


        start,


        on,

        off,

        emit,


        log,

        reportError,

        reportWarning,


        registerModule,

        unregisterModule,

        getModule,

        getModules,

        setModuleReady,


        getStatus,

        diagnose,

        clearDiagnostics

    };


    /* ========================================================
       21 — GLOBALE HALDO API
       ======================================================== */

    window.HalDoKernel =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.kernel =
        api;


    window.HalDoOS.version =
        VERSION;


    window.HalDoOS.system =
        SYSTEM_NAME;


    /* ========================================================
       22 — GLOBALER FEHLERFÄNGER
       ======================================================== */

    window.addEventListener(
        "error",
        function (event) {

            if (
                event.error
            ) {

                reportError(
                    event.error,
                    "Global JavaScript Error"
                );

            }
            else {

                reportError(
                    new Error(
                        event.message ||
                        "Unbekannter JavaScript-Fehler"
                    ),
                    "Global JavaScript Error"
                );

            }

        }
    );


    window.addEventListener(
        "unhandledrejection",
        function (event) {

            reportError(
                event.reason ||
                new Error(
                    "Unbehandelte Promise-Ablehnung"
                ),
                "Unhandled Promise Rejection"
            );

        }
    );


    /* ========================================================
       23 — ONLINE / OFFLINE
       ======================================================== */

    window.addEventListener(
        "online",
        function () {

            emit(
                "system:online"
            );


            log(
                "Internetverbindung verfügbar."
            );

        }
    );


    window.addEventListener(
        "offline",
        function () {

            emit(
                "system:offline"
            );


            reportWarning(
                "Keine Internetverbindung.",
                "Network"
            );

        }
    );


    /* ========================================================
       24 — START NACH DOM
       ======================================================== */

    function boot() {

        /*
         * Kernel startet bewusst zuerst.
         */

        start()
            .catch(
                error => {

                    state.starting =
                        false;

                    state.failed =
                        true;


                    reportError(
                        error,
                        "Kernel Start"
                    );


                    emit(
                        "kernel:failed",
                        getStatus()
                    );

                }
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

    }
    else {

        boot();

    }


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 KERNEL
   ============================================================ */