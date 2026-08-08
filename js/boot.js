/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/boot.js

   Aufgabe:
   - Zentrale Startsteuerung des gesamten HalDo AI OS
   - Kontrollierte Lade-Reihenfolge
   - Wartet auf benötigte Module
   - Verhindert Race Conditions
   - Erstellt zentralen Systemstatus
   - Meldet Boot-Fehler verständlich
   - Bereitet spätere Module und Apps vor

   STARTREIHENFOLGE:

       index.html
            ↓
       boot.js
            ↓
       Kernel
            ↓
       System
            ↓
       App Registry
            ↓
       App Manager
            ↓
       App Router
            ↓
       Launcher
            ↓
       HalDo AI OS READY

   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const CONFIG = {

        name:
            "HalDo AI OS Boot Manager",

        version:
            "18.0.0",

        bootTimeout:
            10000,

        retryDelay:
            100,

        maxRetries:
            100

    };


    /* ========================================================
       02 — BOOT STATUS
       ======================================================== */

    const state = {

        started:
            false,

        ready:
            false,

        failed:
            false,

        booting:
            false,

        progress:
            0,

        stage:
            "idle",

        message:
            "HalDo AI OS wartet auf Start.",

        error:
            null,

        startedAt:
            null,

        finishedAt:
            null,

        retryCount:
            0

    };


    /* ========================================================
       03 — MODULE STATUS
       ======================================================== */

    const modules = {

        kernel:
            false,

        system:
            false,

        registry:
            false,

        appManager:
            false,

        router:
            false,

        launcher:
            false

    };


    /* ========================================================
       04 — EVENT SYSTEM
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

            listeners[eventName] =
                [];

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
            listeners[eventName]
                .filter(
                    item =>
                        item !==
                        callback
                );


        return true;

    }


    function emit(
        eventName,
        data = null
    ) {

        if (
            !listeners[eventName]
        ) {

            return;

        }


        listeners[eventName]
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

                        console.error(
                            "[HalDo Boot] Event-Fehler:",
                            error
                        );

                    }

                }
            );

    }


    /* ========================================================
       05 — LOGGING
       ======================================================== */

    function log(
        message,
        type = "info"
    ) {

        const prefix =
            "[HalDo AI OS]";


        if (
            type ===
            "error"
        ) {

            console.error(
                prefix,
                message
            );

        }
        else if (
            type ===
            "warning"
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
       06 — BOOT UI
       ======================================================== */

    function getBootScreen() {

        return document.querySelector(
            "[data-haldo-boot-screen]"
        );

    }


    function updateBootUI(
        stage,
        message,
        progress
    ) {

        state.stage =
            stage;


        state.message =
            message;


        if (
            typeof progress ===
            "number"
        ) {

            state.progress =
                Math.max(
                    0,
                    Math.min(
                        100,
                        progress
                    )
                );

        }


        const screen =
            getBootScreen();


        if (
            !screen
        ) {

            return;

        }


        screen.dataset.stage =
            stage;


        const messageElement =
            screen.querySelector(
                "[data-haldo-boot-message]"
            );


        if (
            messageElement
        ) {

            messageElement.textContent =
                message;

        }


        const progressElement =
            screen.querySelector(
                "[data-haldo-boot-progress]"
            );


        if (
            progressElement
        ) {

            progressElement.style.width =
                `${state.progress}%`;

        }


        const percentElement =
            screen.querySelector(
                "[data-haldo-boot-percent]"
            );


        if (
            percentElement
        ) {

            percentElement.textContent =
                `${state.progress}%`;

        }


        emit(
            "progress",
            {

                stage,

                message,

                progress:
                    state.progress

            }
        );

    }


    /* ========================================================
       07 — GLOBAL STATUS
       ======================================================== */

    function publishStatus() {

        window.HalDoBootStatus = {

            ...state,

            modules:
                {
                    ...modules
                }

        };


        window.HalDoOS =
            window.HalDoOS ||
            {};


        window.HalDoOS.boot =
            window.HalDoBootStatus;

    }


    /* ========================================================
       08 — WARTEN
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
       09 — MODUL PRÜFEN
       ======================================================== */

    function moduleExists(
        name
    ) {

        switch (
            name
        ) {

            case "kernel":

                return Boolean(
                    window.HalDoKernel
                );


            case "system":

                return Boolean(
                    window.HalDoSystem
                );


            case "registry":

                return Boolean(
                    window.HalDoAppRegistry
                );


            case "appManager":

                return Boolean(
                    window.HalDoAppManager
                );


            case "router":

                return Boolean(
                    window.HalDoAppRouter
                );


            case "launcher":

                return Boolean(
                    window.HalDoLauncher
                );


            default:

                return false;

        }

    }


    /* ========================================================
       10 — MODUL WARTEN
       ======================================================== */

    async function waitForModule(
        name
    ) {

        let retries =
            0;


        while (
            retries <
            CONFIG.maxRetries
        ) {

            if (
                moduleExists(
                    name
                )
            ) {

                modules[name] =
                    true;


                publishStatus();


                return true;

            }


            retries++;


            state.retryCount =
                retries;


            await wait(
                CONFIG.retryDelay
            );

        }


        modules[name] =
            false;


        publishStatus();


        return false;

    }


    /* ========================================================
       11 — KERNEL STARTEN
       ======================================================== */

    async function startKernel() {

        updateBootUI(
            "kernel",
            "HalDo AI Kernel wird gestartet...",
            10
        );


        const available =
            await waitForModule(
                "kernel"
            );


        if (
            !available
        ) {

            throw new Error(
                "HalDoKernel wurde nicht gefunden."
            );

        }


        try {

            if (
                typeof window.HalDoKernel.init ===
                    "function"
            ) {

                await window.HalDoKernel.init();

            }

        }
        catch (
            error
        ) {

            throw new Error(
                `Kernel konnte nicht gestartet werden: ${
                    error.message
                }`
            );

        }


        updateBootUI(
            "kernel-ready",
            "HalDo AI Kernel ist bereit.",
            20
        );


        return true;

    }


    /* ========================================================
       12 — SYSTEM STARTEN
       ======================================================== */

    async function startSystem() {

        updateBootUI(
            "system",
            "HalDo AI System wird gestartet...",
            25
        );


        const available =
            await waitForModule(
                "system"
            );


        if (
            !available
        ) {

            throw new Error(
                "HalDoSystem wurde nicht gefunden."
            );

        }


        try {

            if (
                typeof window.HalDoSystem.init ===
                    "function"
            ) {

                await window.HalDoSystem.init();

            }

        }
        catch (
            error
        ) {

            throw new Error(
                `System konnte nicht gestartet werden: ${
                    error.message
                }`
            );

        }


        updateBootUI(
            "system-ready",
            "HalDo AI System ist bereit.",
            35
        );


        return true;

    }


    /* ========================================================
       13 — APP REGISTRY
       ======================================================== */

    async function startRegistry() {

        updateBootUI(
            "registry",
            "HalDo App Registry wird geladen...",
            40
        );


        const available =
            await waitForModule(
                "registry"
            );


        if (
            !available
        ) {

            throw new Error(
                "HalDoAppRegistry wurde nicht gefunden."
            );

        }


        try {

            if (
                typeof window.HalDoAppRegistry.init ===
                    "function"
            ) {

                await window.HalDoAppRegistry.init();

            }

        }
        catch (
            error
        ) {

            throw new Error(
                `App Registry konnte nicht gestartet werden: ${
                    error.message
                }`
            );

        }


        updateBootUI(
            "registry-ready",
            "App Registry ist bereit.",
            50
        );


        return true;

    }


    /* ========================================================
       14 — APP MANAGER
       ======================================================== */

    async function startAppManager() {

        updateBootUI(
            "app-manager",
            "App Manager wird verbunden...",
            60
        );


        const available =
            await waitForModule(
                "appManager"
            );


        if (
            !available
        ) {

            throw new Error(
                "HalDoAppManager wurde nicht gefunden."
            );

        }


        try {

            if (
                typeof window.HalDoAppManager.init ===
                    "function"
            ) {

                await window.HalDoAppManager.init();

            }

        }
        catch (
            error
        ) {

            throw new Error(
                `App Manager konnte nicht gestartet werden: ${
                    error.message
                }`
            );

        }


        updateBootUI(
            "app-manager-ready",
            "App Manager ist bereit.",
            65
        );


        return true;

    }


    /* ========================================================
       15 — ROUTER
       ======================================================== */

    async function startRouter() {

        updateBootUI(
            "router",
            "App Router wird verbunden...",
            75
        );


        const available =
            await waitForModule(
                "router"
            );


        if (
            !available
        ) {

            throw new Error(
                "HalDoAppRouter wurde nicht gefunden."
            );

        }


        try {

            if (
                typeof window.HalDoAppRouter.init ===
                    "function"
            ) {

                await window.HalDoAppRouter.init();

            }

        }
        catch (
            error
        ) {

            throw new Error(
                `App Router konnte nicht gestartet werden: ${
                    error.message
                }`
            );

        }


        updateBootUI(
            "router-ready",
            "App Router ist bereit.",
            82
        );


        return true;

    }


    /* ========================================================
       16 — LAUNCHER
       ======================================================== */

    async function startLauncher() {

        updateBootUI(
            "launcher",
            "HalDo App Launcher wird verbunden...",
            90
        );


        const available =
            await waitForModule(
                "launcher"
            );


        if (
            !available
        ) {

            throw new Error(
                "HalDoLauncher wurde nicht gefunden."
            );

        }


        try {

            if (
                typeof window.HalDoLauncher.init ===
                    "function"
            ) {

                await window.HalDoLauncher.init();

            }

        }
        catch (
            error
        ) {

            throw new Error(
                `Launcher konnte nicht gestartet werden: ${
                    error.message
                }`
            );

        }


        updateBootUI(
            "launcher-ready",
            "HalDo App Launcher ist bereit.",
            95
        );


        return true;

    }


    /* ========================================================
       17 — SYSTEM BEREIT
       ======================================================== */

    function finishBoot() {

        state.ready =
            true;


        state.booting =
            false;


        state.failed =
            false;


        state.progress =
            100;


        state.stage =
            "ready";


        state.message =
            "HalDo AI OS ist vollständig bereit.";


        state.finishedAt =
            new Date()
                .toISOString();


        publishStatus();


        updateBootUI(
            "ready",
            "HalDo AI OS ist bereit.",
            100
        );


        emit(
            "ready",
            getState()
        );


        log(
            "HalDo AI OS 18 ist vollständig bereit."
        );


        return true;

    }


    /* ========================================================
       18 — BOOT FEHLER
       ======================================================== */

    function failBoot(
        error
    ) {

        state.ready =
            false;


        state.booting =
            false;


        state.failed =
            true;


        state.stage =
            "error";


        state.error =
            error instanceof Error
                ? error.message
                : String(
                    error
                );


        state.message =
            "HalDo AI OS konnte nicht vollständig gestartet werden.";


        publishStatus();


        updateBootUI(
            "error",
            state.message,
            state.progress
        );


        emit(
            "error",
            {

                error:
                    state.error,

                state:
                    getState()

            }
        );


        log(
            state.error,
            "error"
        );


        return false;

    }


    /* ========================================================
       19 — HAUPT-BOOT
       ======================================================== */

    async function boot() {

        if (
            state.ready
        ) {

            return true;

        }


        if (
            state.booting
        ) {

            return false;

        }


        state.started =
            true;


        state.booting =
            true;


        state.failed =
            false;


        state.error =
            null;


        state.startedAt =
            new Date()
                .toISOString();


        state.retryCount =
            0;


        publishStatus();


        emit(
            "start",
            getState()
        );


        try {

            /*
             * 1 — KERNEL
             */

            await startKernel();


            /*
             * 2 — SYSTEM
             */

            await startSystem();


            /*
             * 3 — APP REGISTRY
             */

            await startRegistry();


            /*
             * 4 — APP MANAGER
             */

            await startAppManager();


            /*
             * 5 — ROUTER
             */

            await startRouter();


            /*
             * 6 — LAUNCHER
             */

            await startLauncher();


            /*
             * 7 — FERTIG
             */

            finishBoot();


            return true;

        }
        catch (
            error
        ) {

            return failBoot(
                error
            );

        }

    }


    /* ========================================================
       20 — RESTART
       ======================================================== */

    async function restart() {

        state.ready =
            false;


        state.failed =
            false;


        state.booting =
            false;


        state.error =
            null;


        state.progress =
            0;


        state.stage =
            "restart";


        modules.kernel =
            false;


        modules.system =
            false;


        modules.registry =
            false;


        modules.appManager =
            false;


        modules.router =
            false;


        modules.launcher =
            false;


        publishStatus();


        return boot();

    }


    /* ========================================================
       21 — STATE
       ======================================================== */

    function getState() {

        return {

            ...state,

            modules:
                {
                    ...modules
                }

        };

    }


    /* ========================================================
       22 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            state:
                getState(),

            globals: {

                kernel:
                    Boolean(
                        window.HalDoKernel
                    ),

                system:
                    Boolean(
                        window.HalDoSystem
                    ),

                registry:
                    Boolean(
                        window.HalDoAppRegistry
                    ),

                appManager:
                    Boolean(
                        window.HalDoAppManager
                    ),

                router:
                    Boolean(
                        window.HalDoAppRouter
                    ),

                launcher:
                    Boolean(
                        window.HalDoLauncher
                    )

            }

        };

    }


    /* ========================================================
       23 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,


        boot,

        restart,


        on,

        off,


        getState,

        diagnose

    };


    /* ========================================================
       24 — GLOBAL
       ======================================================== */

    window.HalDoBoot =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.bootManager =
        api;


    /* ========================================================
       25 — DOM READY
       ======================================================== */

    function startWhenReady() {

        /*
         * Nur starten, wenn die Seite vollständig
         * initialisiert werden kann.
         */

        window.setTimeout(
            function () {

                boot();

            },
            0
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startWhenReady,
            {
                once:
                    true
            }
        );

    }
    else {

        startWhenReady();

    }


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 BOOT MANAGER
   ============================================================ */