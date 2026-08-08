/* ============================================================
   HALDO AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei:
   js/system.js

   Aufgabe:
   Zentrale Systemverwaltung

   Verbindet:
   - Kernel
   - App Manager
   - App Router
   - Launcher
   - Logo / Intro
   - Systemstatus
   - Boot-Sequenz
   - Online / Offline
   - Fehlerstatus

   WICHTIG:
   Dieses Modul zerstört keine vorhandenen Funktionen.
   Es koordiniert die einzelnen Module.
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — SYSTEM INFORMATION
       ======================================================== */

    const SYSTEM = {

        name:
            "HalDo AI OS",

        version:
            "18.0.0",

        edition:
            "Professional Ultimate Foundation",

        build:
            "HALDO-OS18-PUF",

        language:
            "de",

        status:
            "starting"

    };


    /* ========================================================
       02 — STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        booting:
            false,

        ready:
            false,

        failed:
            false,

        online:
            navigator.onLine,

        bootStarted:
            null,

        bootFinished:
            null,

        currentStage:
            "waiting",

        stages:
            [],

        errors:
            [],

        services:
            new Map()

    };


    /* ========================================================
       03 — EVENT SYSTEM
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
            listeners[eventName].filter(
                item =>
                    item !== callback
            );


        return true;

    }


    function emit(
        eventName,
        data = null
    ) {

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

                        console.error(
                            "[HalDo System] Event-Fehler:",
                            error
                        );

                    }

                }
            );

    }


    /* ========================================================
       04 — LOG
       ======================================================== */

    function log(
        message,
        type = "info"
    ) {

        const prefix =
            "[HalDo System]";


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


        emit(
            "log",
            {
                message,
                type
            }
        );

    }


    /* ========================================================
       05 — BOOT STAGES
       ======================================================== */

    const DEFAULT_STAGES = [

        {
            id:
                "kernel",

            title:
                "HalDo AI OS Kernel",

            description:
                "Systemkern wird gestartet.",

            status:
                "waiting"

        },

        {
            id:
                "system",

            title:
                "System",

            description:
                "Systemdienste werden vorbereitet.",

            status:
                "waiting"

        },

        {
            id:
                "apps",

            title:
                "Apps",

            description:
                "App-System wird geladen.",

            status:
                "waiting"

        },

        {
            id:
                "router",

            title:
                "App Router",

            description:
                "Navigation wird vorbereitet.",

            status:
                "waiting"

        },

        {
            id:
                "interface",

            title:
                "Benutzeroberfläche",

            description:
                "HalDo Oberfläche wird vorbereitet.",

            status:
                "waiting"

        },

        {
            id:
                "ready",

            title:
                "HalDo AI OS bereit",

            description:
                "System erfolgreich gestartet.",

            status:
                "waiting"

        }

    ];


    function resetStages() {

        state.stages =
            DEFAULT_STAGES.map(
                stage => ({
                    ...stage
                })
            );

    }


    function updateStage(
        stageId,
        status,
        message = null
    ) {

        const stage =
            state.stages.find(
                item =>
                    item.id ===
                    stageId
            );


        if (
            !stage
        ) {

            return false;

        }


        stage.status =
            status;


        if (
            message
        ) {

            stage.description =
                message;

        }


        state.currentStage =
            stageId;


        emit(
            "boot:stage",
            {
                ...stage
            }
        );


        return true;

    }


    /* ========================================================
       06 — SERVICE REGISTRIEREN
       ======================================================== */

    function registerService(
        name,
        service
    ) {

        const id =
            String(
                name || ""
            )
            .trim()
            .toLowerCase();


        if (
            !id ||
            !service
        ) {

            return false;

        }


        state.services.set(
            id,
            service
        );


        emit(
            "service:registered",
            {
                name:
                    id,

                service
            }
        );


        return true;

    }


    /* ========================================================
       07 — SERVICE ABFRAGEN
       ======================================================== */

    function getService(
        name
    ) {

        const id =
            String(
                name || ""
            )
            .trim()
            .toLowerCase();


        return (
            state.services.get(
                id
            ) ||
            null
        );

    }


    /* ========================================================
       08 — KERNEL
       ======================================================== */

    function getKernel() {

        return (
            window.HalDoKernel ||
            null
        );

    }


    /* ========================================================
       09 — APP MANAGER
       ======================================================== */

    function getAppManager() {

        return (
            window.HalDoAppManager ||
            null
        );

    }


    /* ========================================================
       10 — ROUTER
       ======================================================== */

    function getRouter() {

        return (
            window.HalDoAppRouter ||
            null
        );

    }


    /* ========================================================
       11 — STATUS
       ======================================================== */

    function getStatus() {

        const kernel =
            getKernel();


        const appManager =
            getAppManager();


        const router =
            getRouter();


        return {

            system:
                {
                    ...SYSTEM,

                    status:
                        state.ready
                            ? "ready"
                            : state.failed
                                ? "error"
                                : state.booting
                                    ? "starting"
                                    : "idle"
                },


            state:
                {
                    initialized:
                        state.initialized,

                    booting:
                        state.booting,

                    ready:
                        state.ready,

                    failed:
                        state.failed,

                    online:
                        state.online,

                    currentStage:
                        state.currentStage,

                    bootStarted:
                        state.bootStarted,

                    bootFinished:
                        state.bootFinished

                },


            kernel:
                kernel &&
                typeof kernel.getStatus ===
                    "function"
                    ? kernel.getStatus()
                    : null,


            apps:
                appManager &&
                typeof appManager.getState ===
                    "function"
                    ? appManager.getState()
                    : null,


            router:
                router &&
                typeof router.getState ===
                    "function"
                    ? router.getState()
                    : null

        };

    }


    /* ========================================================
       12 — DOM STATUS
       ======================================================== */

    function updateDOMStatus() {

        document.documentElement.dataset.haldoSystem =
            state.ready
                ? "ready"
                : state.failed
                    ? "error"
                    : state.booting
                        ? "starting"
                        : "idle";


        document.documentElement.dataset.haldoOnline =
            state.online
                ? "true"
                : "false";


        const statusElements =
            document.querySelectorAll(
                "[data-haldo-system-status]"
            );


        statusElements.forEach(
            element => {

                element.textContent =
                    state.ready
                        ? "Bereit"
                        : state.failed
                            ? "Fehler"
                            : state.booting
                                ? "Wird gestartet"
                                : "Wartet";

            }
        );

    }


    /* ========================================================
       13 — ONLINE / OFFLINE
       ======================================================== */

    function setupNetworkListeners() {

        window.addEventListener(
            "online",
            function () {

                state.online =
                    true;


                updateDOMStatus();


                emit(
                    "network:online"
                );


                log(
                    "Internetverbindung wieder verfügbar."
                );

            }
        );


        window.addEventListener(
            "offline",
            function () {

                state.online =
                    false;


                updateDOMStatus();


                emit(
                    "network:offline"
                );


                log(
                    "Internetverbindung unterbrochen. Offline-Modus aktiv.",
                    "warning"
                );

            }
        );

    }


    /* ========================================================
       14 — SAFE INIT
       ======================================================== */

    async function initializeModule(
        module,
        name
    ) {

        if (
            !module
        ) {

            return false;

        }


        try {

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


            registerService(
                name,
                module
            );


            return true;

        }
        catch (
            error
        ) {

            recordError(
                error,
                name
            );


            return false;

        }

    }


    /* ========================================================
       15 — FEHLER SPEICHERN
       ======================================================== */

    function recordError(
        error,
        context = "System"
    ) {

        const record = {

            context,

            message:
                error instanceof Error
                    ? error.message
                    : String(
                        error
                    ),

            time:
                Date.now()

        };


        state.errors.push(
            record
        );


        if (
            state.errors.length >
            50
        ) {

            state.errors.shift();

        }


        emit(
            "error",
            record
        );


        log(
            `${context}: ${record.message}`,
            "error"
        );


        return record;

    }


    /* ========================================================
       16 — BOOT
       ======================================================== */

    async function boot() {

        if (
            state.ready
        ) {

            return getStatus();

        }


        if (
            state.booting
        ) {

            return getStatus();

        }


        state.booting =
            true;

        state.failed =
            false;

        state.bootStarted =
            Date.now();

        SYSTEM.status =
            "starting";


        resetStages();


        updateDOMStatus();


        emit(
            "boot:start",
            getStatus()
        );


        log(
            `${SYSTEM.name} ${SYSTEM.version} wird gestartet.`
        );


        try {

            /* ------------------------------------------------
               STAGE 1 — KERNEL
               ------------------------------------------------ */

            updateStage(
                "kernel",
                "loading"
            );


            const kernel =
                getKernel();


            if (
                kernel
            ) {

                registerService(
                    "kernel",
                    kernel
                );


                if (
                    typeof kernel.getStatus ===
                    "function"
                ) {

                    log(
                        "Kernel erkannt."
                    );

                }

            }
            else {

                throw new Error(
                    "HalDoKernel wurde nicht gefunden."
                );

            }


            updateStage(
                "kernel",
                "ready"
            );


            /* ------------------------------------------------
               STAGE 2 — SYSTEM
               ------------------------------------------------ */

            updateStage(
                "system",
                "loading"
            );


            setupNetworkListeners();


            registerService(
                "system",
                api
            );


            updateStage(
                "system",
                "ready"
            );


            /* ------------------------------------------------
               STAGE 3 — APPS
               ------------------------------------------------ */

            updateStage(
                "apps",
                "loading"
            );


            const appManager =
                getAppManager();


            if (
                appManager
            ) {

                registerService(
                    "app-manager",
                    appManager
                );


                if (
                    typeof appManager.loadApps ===
                    "function"
                ) {

                    /*
                     * App Manager hat bereits
                     * seinen eigenen Start.
                     *
                     * Hier prüfen wir nur,
                     * ob Daten vorhanden sind.
                     */

                    const apps =
                        typeof appManager.getAllApps ===
                        "function"
                            ? appManager.getAllApps()
                            : [];


                    log(
                        `${apps.length} Apps im App-System verfügbar.`
                    );

                }

            }
            else {

                log(
                    "App Manager ist noch nicht verfügbar.",
                    "warning"
                );

            }


            updateStage(
                "apps",
                "ready"
            );


            /* ------------------------------------------------
               STAGE 4 — ROUTER
               ------------------------------------------------ */

            updateStage(
                "router",
                "loading"
            );


            const router =
                getRouter();


            if (
                router
            ) {

                registerService(
                    "app-router",
                    router
                );


                if (
                    typeof router.init ===
                    "function"
                ) {

                    await initializeModule(
                        router,
                        "app-router"
                    );

                }

            }
            else {

                log(
                    "App Router ist noch nicht verfügbar.",
                    "warning"
                );

            }


            updateStage(
                "router",
                "ready"
            );


            /* ------------------------------------------------
               STAGE 5 — INTERFACE
               ------------------------------------------------ */

            updateStage(
                "interface",
                "loading"
            );


            prepareInterface();


            updateStage(
                "interface",
                "ready"
            );


            /* ------------------------------------------------
               STAGE 6 — READY
               ------------------------------------------------ */

            updateStage(
                "ready",
                "ready"
            );


            state.booting =
                false;

            state.ready =
                true;

            state.failed =
                false;

            state.bootFinished =
                Date.now();


            SYSTEM.status =
                "ready";


            updateDOMStatus();


            emit(
                "boot:ready",
                getStatus()
            );


            log(
                `${SYSTEM.name} ${SYSTEM.version} ist vollständig bereit.`
            );


            return getStatus();

        }
        catch (
            error
        ) {

            state.booting =
                false;

            state.ready =
                false;

            state.failed =
                true;

            SYSTEM.status =
                "error";


            recordError(
                error,
                "Boot-Sequenz"
            );


            updateDOMStatus();


            emit(
                "boot:failed",
                getStatus()
            );


            /*
             * System bleibt erreichbar,
             * selbst wenn ein Teilmodul
             * fehlschlägt.
             */

            showSafeErrorState(
                error
            );


            return getStatus();

        }

    }


    /* ========================================================
       17 — INTERFACE VORBEREITEN
       ======================================================== */

    function prepareInterface() {

        /*
         * App Root nur vorbereiten,
         * wenn es bereits existiert.
         *
         * Wir erzeugen keine konkurrierende
         * zweite Benutzeroberfläche.
         */

        const root =
            document.querySelector(
                "#haldo-app-root"
            );


        if (
            root
        ) {

            root.setAttribute(
                "data-haldo-ready",
                "true"
            );

        }


        const launcher =
            document.querySelector(
                "#haldo-launcher"
            );


        if (
            launcher
        ) {

            launcher.setAttribute(
                "data-haldo-ready",
                "true"
            );

        }


        const home =
            document.querySelector(
                "#haldo-home"
            );


        if (
            home
        ) {

            home.setAttribute(
                "data-haldo-ready",
                "true"
            );

        }


        updateDOMStatus();


        emit(
            "interface:ready"
        );

    }


    /* ========================================================
       18 — SICHERER FEHLERSTATUS
       ======================================================== */

    function showSafeErrorState(
        error
    ) {

        /*
         * Wir ersetzen NICHT die ganze Seite.
         * Nur ein vorhandenes Statusfeld wird
         * aktualisiert.
         */

        const elements =
            document.querySelectorAll(
                "[data-haldo-system-error]"
            );


        elements.forEach(
            element => {

                element.hidden =
                    false;


                element.textContent =
                    "HalDo AI OS konnte einen Systemdienst nicht vollständig starten.";

            }
        );


        emit(
            "safe-error-state",
            {
                error:
                    error instanceof Error
                        ? error.message
                        : String(
                            error
                        )
            }
        );

    }


    /* ========================================================
       19 — SYSTEM RESET
       ======================================================== */

    function resetRuntime() {

        state.booting =
            false;

        state.ready =
            false;

        state.failed =
            false;

        state.currentStage =
            "waiting";

        state.bootStarted =
            null;

        state.bootFinished =
            null;

        state.errors =
            [];

        state.services.clear();


        SYSTEM.status =
            "starting";


        resetStages();


        updateDOMStatus();


        emit(
            "runtime:reset"
        );


        return true;

    }


    /* ========================================================
       20 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        const kernel =
            getKernel();


        const appManager =
            getAppManager();


        const router =
            getRouter();


        return {

            system:
                {
                    ...SYSTEM
                },

            state:
                {
                    ...state,

                    services:
                        undefined
                },

            services:
                {
                    kernel:
                        Boolean(
                            kernel
                        ),

                    appManager:
                        Boolean(
                            appManager
                        ),

                    router:
                        Boolean(
                            router
                        )

                },

            dom:
                {
                    appRoot:
                        Boolean(
                            document.querySelector(
                                "#haldo-app-root"
                            )
                        ),

                    launcher:
                        Boolean(
                            document.querySelector(
                                "#haldo-launcher"
                            )
                        ),

                    home:
                        Boolean(
                            document.querySelector(
                                "#haldo-home"
                            )
                        )

                },

            network:
                {
                    online:
                        navigator.onLine
                }

        };

    }


    /* ========================================================
       21 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            SYSTEM.name,

        version:
            SYSTEM.version,

        edition:
            SYSTEM.edition,

        build:
            SYSTEM.build,


        boot,

        init:
            boot,


        on,

        off,

        emit,


        getStatus,

        diagnose,


        registerService,

        getService,


        resetRuntime,


        getSystemInfo:
            function () {

                return {
                    ...SYSTEM
                };

            }

    };


    /* ========================================================
       22 — GLOBAL HALDO API
       ======================================================== */

    window.HalDoSystem =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.system =
        api;


    /* ========================================================
       23 — KERNEL VERBINDUNG
       ======================================================== */

    function connectKernel() {

        const kernel =
            getKernel();


        if (
            !kernel
        ) {

            return false;

        }


        /*
         * System beim Kernel registrieren.
         */

        if (
            typeof kernel.registerModule ===
            "function"
        ) {

            kernel.registerModule(
                "system",
                api
            );

        }


        /*
         * Kernel Ready überwachen.
         */

        if (
            typeof kernel.on ===
            "function"
        ) {

            kernel.on(
                "kernel:ready",
                function () {

                    emit(
                        "kernel:ready"
                    );

                }
            );


            kernel.on(
                "kernel:error",
                function (data) {

                    emit(
                        "kernel:error",
                        data
                    );

                }
            );

        }


        return true;

    }


    /* ========================================================
       24 — DOM START
       ======================================================== */

    function start() {

        state.initialized =
            true;


        connectKernel();


        /*
         * System startet nach dem Kernel.
         *
         * Kurze Verzögerung verhindert,
         * dass sich die Module beim Laden
         * gegenseitig blockieren.
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
            start,
            {
                once:
                    true
            }
        );

    }
    else {

        start();

    }


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 SYSTEM
   ============================================================ */