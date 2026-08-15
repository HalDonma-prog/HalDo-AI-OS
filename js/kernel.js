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
   - sichere Modulinitialisierung
   - Kernel-/System-Kompatibilität
   - Online-/Offline-Zustand
   - Runtime-Diagnose
   - zukünftige Erweiterbarkeit
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const VERSION =
        "18.0.0";

    const SYSTEM_NAME =
        "HalDo AI OS";

    const SYSTEM_EDITION =
        "Professional Ultimate Foundation";

    const MODULE_ID =
        "kernel";


    /* ========================================================
       02 — HALDO OS FOUNDATION
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS ||
        {};


    const HalDoOS =
        window.HalDoOS;


    /* ========================================================
       03 — KERNEL STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        starting:
            false,

        ready:
            false,

        failed:
            false,

        startTime:
            null,

        readyTime:
            null,

        uptime:
            0,

        modules:
            new Map(),

        moduleStatus:
            new Map(),

        errors:
            [],

        warnings:
            [],

        events:
            0,

        bootCount:
            0,

        lastEvent:
            null,

        lastError:
            null,

        lastWarning:
            null

    };


    /* ========================================================
       04 — EVENT BUS
       ======================================================== */

    const listeners =
        new Map();


    function on(
        eventName,
        callback
    ) {

        if (
            !eventName ||
            typeof callback !==
            "function"
        ) {

            return false;

        }


        const name =
            String(
                eventName
            )
            .trim();


        if (!name) {

            return false;

        }


        if (
            !listeners.has(
                name
            )
        ) {

            listeners.set(
                name,
                new Set()
            );

        }


        listeners
            .get(name)
            .add(
                callback
            );


        return true;

    }


    function off(
        eventName,
        callback
    ) {

        if (!eventName) {

            return false;

        }


        const name =
            String(
                eventName
            )
            .trim();


        const callbacks =
            listeners.get(
                name
            );


        if (!callbacks) {

            return false;

        }


        if (
            typeof callback ===
            "function"
        ) {

            callbacks.delete(
                callback
            );

        }
        else {

            callbacks.clear();

        }


        if (
            callbacks.size ===
            0
        ) {

            listeners.delete(
                name
            );

        }


        return true;

    }


    function emit(
        eventName,
        data = null
    ) {

        if (!eventName) {

            return false;

        }


        const name =
            String(
                eventName
            )
            .trim();


        if (!name) {

            return false;

        }


        state.events +=
            1;

        state.lastEvent = {

            name:
                name,

            time:
                Date.now()

        };


        const callbacks =
            listeners.get(
                name
            );


        if (!callbacks) {

            return true;

        }


        Array.from(
            callbacks
        )
        .forEach(
            function (callback) {

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
                        `Event: ${name}`
                    );

                }

            }
        );


        return true;

    }


    /* ========================================================
       05 — LOGGING
       ======================================================== */

    function timestamp() {

        try {

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
        catch (_) {

            return new Date()
                .toISOString();

        }

    }


    function log(
        message,
        type = "info"
    ) {

        const prefix =
            `[${SYSTEM_NAME}]`;

        const output =
            `${prefix} [${timestamp()}] ${String(message)}`;


        try {

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

        }
        catch (_) {}


        emit(
            "kernel:log",
            {
                message:
                    String(message),

                type:
                    type,

                time:
                    Date.now()

            }
        );

    }


    /* ========================================================
       06 — FEHLER
       ======================================================== */

    function reportError(
        error,
        context = "Unknown"
    ) {

        let normalized;


        if (
            error instanceof
            Error
        ) {

            normalized =
                error;

        }
        else {

            normalized =
                new Error(
                    String(
                        error ??
                        "Unbekannter Fehler"
                    )
                );

        }


        const record = {

            message:
                normalized.message,

            name:
                normalized.name,

            stack:
                normalized.stack ||
                "",

            context:
                String(
                    context
                ),

            time:
                Date.now()

        };


        state.errors.push(
            record
        );


        if (
            state.errors.length >
            100
        ) {

            state.errors.shift();

        }


        state.lastError =
            record;


        /*
         * Fehler direkt loggen.
         *
         * emit() selbst ist geschützt,
         * damit Fehlerbehandlung nicht
         * erneut den Kernel beschädigt.
         */

        try {

            log(
                `${record.context}: ${record.message}`,
                "error"
            );

        }
        catch (_) {}


        emit(
            "kernel:error",
            record
        );


        return record;

    }


    /* ========================================================
       07 — WARNUNG
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

            context:
                String(
                    context
                ),

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


        state.lastWarning =
            record;


        try {

            log(
                `${record.context}: ${record.message}`,
                "warning"
            );

        }
        catch (_) {}


        emit(
            "kernel:warning",
            record
        );


        return record;

    }


    /* ========================================================
       08 — MODULNAME NORMALISIERUNG
       ======================================================== */

    function normalizeModuleName(
        name
    ) {

        return String(
            name ||
            ""
        )
        .trim()
        .toLowerCase();

    }


    /* ========================================================
       09 — MODUL REGISTRIEREN
       ======================================================== */

    function registerModule(
        name,
        module
    ) {

        const moduleName =
            normalizeModuleName(
                name
            );


        if (!moduleName) {

            reportWarning(
                "Ein Modul ohne Namen wurde abgelehnt.",
                "Module"
            );


            return false;

        }


        if (
            module ===
            null ||
            module ===
            undefined
        ) {

            reportWarning(
                `Modul '${moduleName}' ist leer.`,
                "Module"
            );


            return false;

        }


        const existed =
            state.modules.has(
                moduleName
            );


        state.modules.set(
            moduleName,
            module
        );


        const previousStatus =
            state.moduleStatus.get(
                moduleName
            ) ||
            {};


        state.moduleStatus.set(
            moduleName,
            {

                ...previousStatus,

                registered:
                    true,

                ready:
                    Boolean(
                        previousStatus.ready
                    ),

                registeredAt:
                    previousStatus.registeredAt ||
                    Date.now(),

                updatedAt:
                    Date.now()

            }
        );


        emit(
            existed
                ? "module:updated"
                : "module:registered",
            {

                name:
                    moduleName,

                module:
                    module

            }
        );


        log(
            existed
                ? `Modul aktualisiert: ${moduleName}`
                : `Modul registriert: ${moduleName}`
        );


        return true;

    }


    /* ========================================================
       10 — MODUL ABFRAGEN
       ======================================================== */

    function getModule(
        name
    ) {

        const moduleName =
            normalizeModuleName(
                name
            );


        if (!moduleName) {

            return null;

        }


        return (
            state.modules.get(
                moduleName
            ) ||
            null
        );

    }


    /* ========================================================
       11 — MODUL VORHANDEN?
       ======================================================== */

    function hasModule(
        name
    ) {

        const moduleName =
            normalizeModuleName(
                name
            );


        if (!moduleName) {

            return false;

        }


        return state.modules.has(
            moduleName
        );

    }


    /* ========================================================
       12 — MODULSTATUS
       ======================================================== */

    function setModuleReady(
        name,
        ready = true
    ) {

        const moduleName =
            normalizeModuleName(
                name
            );


        if (!moduleName) {

            return false;

        }


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
                    state.modules.has(
                        moduleName
                    ) ||
                    Boolean(
                        current.registered
                    ),

                ready:
                    Boolean(
                        ready
                    ),

                readyAt:
                    ready
                        ? Date.now()
                        : null,

                updatedAt:
                    Date.now()

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


        return true;

    }


    /* ========================================================
       13 — MODULSTATUS ABFRAGEN
       ======================================================== */

    function getModuleStatus(
        name
    ) {

        const moduleName =
            normalizeModuleName(
                name
            );


        if (!moduleName) {

            return null;

        }


        return (
            state.moduleStatus.get(
                moduleName
            ) ||
            null
        );

    }


    /* ========================================================
       14 — MODULE ALLE
       ======================================================== */

    function getModules() {

        return Array.from(
            state.modules.entries()
        )
        .map(
            function (
                [name, module]
            ) {

                return {

                    name:
                        name,

                    module:
                        module,

                    status:
                        state.moduleStatus.get(
                            name
                        ) ||
                        null

                };

            }
        );

    }


    /* ========================================================
       15 — MODUL ENTFERNEN
       ======================================================== */

    function unregisterModule(
        name
    ) {

        const moduleName =
            normalizeModuleName(
                name
            );


        if (!moduleName) {

            return false;

        }


        const existed =
            state.modules.delete(
                moduleName
            );


        state.moduleStatus.delete(
            moduleName
        );


        if (existed) {

            emit(
                "module:unregistered",
                {

                    name:
                        moduleName

                }
            );


            log(
                `Modul entfernt: ${moduleName}`
            );

        }


        return existed;

    }


    /* ========================================================
       16 — UPTIME
       ======================================================== */

    function updateUptime() {

        if (
            !state.startTime
        ) {

            state.uptime =
                0;

            return 0;

        }


        state.uptime =
            Math.max(
                0,
                Date.now() -
                state.startTime
            );


        return state.uptime;

    }


    /* ========================================================
       17 — SYSTEM STATUS
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

            module:
                MODULE_ID,

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

            bootCount:
                state.bootCount,

            moduleCount:
                modules.length,

            readyModules:
                modules.filter(
                    function (item) {

                        return (
                            item.status &&
                            item.status.ready
                        );

                    }
                ).length,

            errorCount:
                state.errors.length,

            warningCount:
                state.warnings.length,

            eventCount:
                state.events,

            lastEvent:
                state.lastEvent,

            lastError:
                state.lastError,

            lastWarning:
                state.lastWarning

        };

    }


    /* ========================================================
       18 — STORAGE TEST
       ======================================================== */

    function testStorage() {

        try {

            const key =
                "__haldo_kernel_test__";


            window.localStorage.setItem(
                key,
                "1"
            );


            const result =
                window.localStorage.getItem(
                    key
                ) ===
                "1";


            window.localStorage.removeItem(
                key
            );


            return result;

        }
        catch (
            error
        ) {

            return false;

        }

    }


    /* ========================================================
       19 — SYSTEM DIAGNOSE
       ======================================================== */

    function diagnose() {

        const status =
            getStatus();


        let browser = {};

        let display = {};


        try {

            browser = {

                userAgent:
                    navigator.userAgent,

                language:
                    navigator.language,

                languages:
                    Array.isArray(
                        navigator.languages
                    )
                        ? [
                            ...navigator.languages
                        ]
                        : [],

                online:
                    navigator.onLine,

                cookies:
                    navigator.cookieEnabled

            };

        }
        catch (_) {}


        try {

            display = {

                width:
                    window.innerWidth,

                height:
                    window.innerHeight,

                pixelRatio:
                    window.devicePixelRatio ||
                    1

            };

        }
        catch (_) {}


        const diagnostics = {

            browser:
                browser,

            display:
                display,

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
                    function (item) {

                        return {

                            name:
                                item.name,

                            registered:
                                Boolean(
                                    item.status &&
                                    item.status.registered
                                ),

                            ready:
                                Boolean(
                                    item.status &&
                                    item.status.ready
                                )

                        };

                    }
                ),

            errors:
                [
                    ...state.errors
                ],

            warnings:
                [
                    ...state.warnings
                ],

            timestamp:
                new Date().toISOString()

        };


        emit(
            "kernel:diagnostics",
            diagnostics
        );


        return diagnostics;

    }


    /* ========================================================
       20 — SAFE MODULE INIT
       ======================================================== */

    async function initializeModule(
        name,
        module
    ) {

        const moduleName =
            normalizeModuleName(
                name
            );


        if (
            !module ||
            !moduleName
        ) {

            return false;

        }


        try {

            /*
             * Bereits bereites Modul nicht
             * unnötig erneut initialisieren.
             */

            const current =
                getModuleStatus(
                    moduleName
                );


            if (
                current &&
                current.ready ===
                true
            ) {

                return true;

            }


            /*
             * Manche Module besitzen
             * init().
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
                moduleName,
                true
            );


            return true;

        }
        catch (
            error
        ) {

            setModuleReady(
                moduleName,
                false
            );


            reportError(
                error,
                `Modul '${moduleName}'`
            );


            return false;

        }

    }


    /* ========================================================
       21 — WAIT
       ======================================================== */

    function wait(
        milliseconds
    ) {

        const delay =
            Math.max(
                0,
                Number(
                    milliseconds
                ) || 0
            );


        return new Promise(
            function (resolve) {

                window.setTimeout(
                    resolve,
                    delay
                );

            }
        );

    }


    /* ========================================================
       22 — KERNMODULE
       ======================================================== */

    const CORE_MODULES = [

        "app-manager",

        "app-router",

        "launcher",

        "system"

    ];


    function getCoreModuleNames() {

        return [
            ...CORE_MODULES
        ];

    }


    /* ========================================================
       23 — KERNEL START
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

        state.bootCount +=
            1;


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
         * Kurze Wartephase:
         *
         * Andere defer-Skripte erhalten
         * die Möglichkeit, ihre globalen
         * APIs zu registrieren.
         */

        await wait(
            0
        );


        /*
         * Bekannte Kernmodule initialisieren.
         */

        for (
            const moduleName
            of CORE_MODULES
        ) {

            const module =
                getModule(
                    moduleName
                );


            if (!module) {

                /*
                 * Fehlende Module sind an
                 * dieser Stelle kein harter
                 * Kernel-Fehler.
                 */

                continue;

            }


            await initializeModule(
                moduleName,
                module
            );

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
       24 — DIAGNOSTIK LÖSCHEN
       ======================================================== */

    function clearDiagnostics() {

        state.errors =
            [];

        state.warnings =
            [];

        state.lastError =
            null;

        state.lastWarning =
            null;


        emit(
            "kernel:diagnostics:cleared"
        );


        return true;

    }


    /* ========================================================
       25 — FEHLER / WARNUNGEN LESEN
       ======================================================== */

    function getErrors() {

        return [
            ...state.errors
        ];

    }


    function getWarnings() {

        return [
            ...state.warnings
        ];

    }


    /* ========================================================
       26 — KERNEL HEALTH CHECK
       ======================================================== */

    function healthCheck() {

        const status =
            getStatus();


        const problems =
            [];


        if (
            !status.initialized
        ) {

            problems.push(
                "Kernel ist nicht initialisiert."
            );

        }


        if (
            status.failed
        ) {

            problems.push(
                "Kernel befindet sich im Fehlerzustand."
            );

        }


        return {

            healthy:
                problems.length ===
                0,

            problems:
                problems,

            initialized:
                status.initialized,

            starting:
                status.starting,

            ready:
                status.ready,

            failed:
                status.failed,

            moduleCount:
                status.moduleCount,

            readyModules:
                status.readyModules,

            errorCount:
                status.errorCount,

            warningCount:
                status.warningCount,

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       27 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            SYSTEM_NAME,

        version:
            VERSION,

        edition:
            SYSTEM_EDITION,

        module:
            MODULE_ID,


        /*
         * Start
         */

        start:
            start,


        /*
         * Event Bus
         */

        on:
            on,

        off:
            off,

        emit:
            emit,


        /*
         * Logging
         */

        log:
            log,

        reportError:
            reportError,

        reportWarning:
            reportWarning,


        /*
         * Module Management
         */

        registerModule:
            registerModule,

        unregisterModule:
            unregisterModule,

        getModule:
            getModule,

        hasModule:
            hasModule,

        getModules:
            getModules,

        setModuleReady:
            setModuleReady,

        getModuleStatus:
            getModuleStatus,

        initializeModule:
            initializeModule,


        /*
         * Status / Diagnostics
         */

        getStatus:
            getStatus,

        diagnose:
            diagnose,

        healthCheck:
            healthCheck,

        clearDiagnostics:
            clearDiagnostics,

        getErrors:
            getErrors,

        getWarnings:
            getWarnings,


        /*
         * Utilities
         */

        testStorage:
            testStorage,

        wait:
            wait,

        getCoreModuleNames:
            getCoreModuleNames

    };


    /* ========================================================
       28 — GLOBALE HALDO API
       ======================================================== */

    window.HalDoKernel =
        api;


    HalDoOS.kernel =
        api;


    HalDoOS.version =
        VERSION;


    HalDoOS.system =
        SYSTEM_NAME;


    HalDoOS.edition =
        SYSTEM_EDITION;


    /* ========================================================
       29 — GLOBALER FEHLERFÄNGER
       ======================================================== */

    window.addEventListener(
        "error",
        function (event) {

            /*
             * Fehler aus dem Kernel selbst
             * werden trotzdem sauber erfasst.
             */

            if (
                event &&
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
                        event &&
                        event.message
                            ? event.message
                            : "Unbekannter JavaScript-Fehler"
                    ),
                    "Global JavaScript Error"
                );

            }

        }
    );


    /* ========================================================
       30 — UNHANDLED PROMISE REJECTION
       ======================================================== */

    window.addEventListener(
        "unhandledrejection",
        function (event) {

            reportError(
                event &&
                event.reason
                    ? event.reason
                    : new Error(
                        "Unbehandelte Promise-Ablehnung"
                    ),
                "Unhandled Promise Rejection"
            );

        }
    );


    /* ========================================================
       31 — ONLINE / OFFLINE
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
       32 — DOM START
       ======================================================== */

    function boot() {

        start()
        .catch(
            function (error) {

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


    /* ========================================================
       33 — START NACH DOM
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
       34 — FINAL EXPOSURE
       ======================================================== */

    /*
     * Sicherstellen, dass die zentrale
     * HalDoOS-Struktur vorhanden bleibt.
     */

    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.kernel =
        api;


    window.HalDoKernel =
        api;


    /* ========================================================
       HALDO AI OS 18
       KERNEL
       VERSION 18.0.0
       PROFESSIONAL ULTIMATE FOUNDATION

       END OF FILE
       ======================================================== */

})(window, document);