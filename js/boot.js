/*
============================================================
 HALDO AI OS 18
 BOOT MANAGER
 Professional Ultimate Foundation
============================================================

 Datei:
 js/boot-manager.js

 Aufgabe:
 - kontrollierter Systemstart
 - Boot-Reihenfolge
 - Boot-Phasen
 - Fortschritt
 - Fehlerbehandlung
 - Verbindung zu Kernel / System / Module Manager
 - Vorbereitung für Boot-UI
============================================================
*/

"use strict";


(function (window) {


    /* ========================================================
       BOOT MANAGER
       ======================================================== */

    const HalDoBootManager = {


        /* ====================================================
           INFORMATION
           ==================================================== */

        name:
            "HalDo Boot Manager",

        version:
            "18.0.0",

        status:
            "CREATED",

        initialized:
            false,

        running:
            false,

        completed:
            false,

        failed:
            false,


        /* ====================================================
           CORE REFERENCES
           ==================================================== */

        kernel:
            null,

        system:
            null,

        modules:
            null,


        /* ====================================================
           TIMING
           ==================================================== */

        startedAt:
            null,

        completedAt:
            null,

        duration:
            null,


        /* ====================================================
           PROGRESS
           ==================================================== */

        progress:
            0,


        currentPhase:
            null,


        /* ====================================================
           BOOT PHASES
           ==================================================== */

        phases: [

            {
                id:
                    "prepare",

                name:
                    "System wird vorbereitet",

                description:
                    "HalDo AI OS bereitet den Systemstart vor.",

                progress:
                    10,

                status:
                    "pending"
            },


            {
                id:
                    "kernel",

                name:
                    "Kernel wird gestartet",

                description:
                    "Der zentrale HalDo Kernel wird geprüft.",

                progress:
                    25,

                status:
                    "pending"
            },


            {
                id:
                    "system",

                name:
                    "System wird geladen",

                description:
                    "Die zentrale Systemverwaltung wird vorbereitet.",

                progress:
                    40,

                status:
                    "pending"
            },


            {
                id:
                    "modules",

                name:
                    "Module werden geladen",

                description:
                    "Systemmodule werden registriert und vorbereitet.",

                progress:
                    60,

                status:
                    "pending"
            },


            {
                id:
                    "environment",

                name:
                    "Umgebung wird geprüft",

                description:
                    "Gerät, Browser und verfügbare Funktionen werden geprüft.",

                progress:
                    75,

                status:
                    "pending"
            },


            {
                id:
                    "interface",

                name:
                    "Oberfläche wird vorbereitet",

                description:
                    "Die HalDo AI OS Benutzeroberfläche wird vorbereitet.",

                progress:
                    90,

                status:
                    "pending"
            },


            {
                id:
                    "complete",

                name:
                    "HalDo AI OS ist bereit",

                description:
                    "Der Systemstart wurde erfolgreich abgeschlossen.",

                progress:
                    100,

                status:
                    "pending"
            }

        ],


        /* ====================================================
           EVENTS
           ==================================================== */

        listeners:
            new Map(),


        /* ====================================================
           INITIALIZE
           ==================================================== */

        initialize() {


            if (
                this.initialized
            ) {

                return true;

            }


            this.connectCore();


            this.registerEvents();


            this.initialized =
                true;


            this.status =
                "READY";


            this.emit(
                "ready",
                this.getStatus()
            );


            this.log(
                "Boot Manager ist bereit."
            );


            return true;

        },


        /* ====================================================
           CORE VERBINDEN
           ==================================================== */

        connectCore() {


            this.kernel =
                window.HalDoKernel ||
                null;


            this.system =
                window.HalDoSystem ||
                null;


            this.modules =
                window.HalDoModuleManager ||
                null;


            return true;

        },


        /* ====================================================
           EVENTS
           ==================================================== */

        registerEvents() {


            if (
                this.kernel &&
                typeof this.kernel.on ===
                "function"
            ) {


                this.kernel.on(
                    "kernel:ready",
                    data => {

                        this.emit(
                            "kernel-ready",
                            data
                        );

                    }
                );


                this.kernel.on(
                    "system:error",
                    error => {

                        this.emit(
                            "system-error",
                            error
                        );

                    }
                );

            }


            if (
                this.system &&
                typeof this.system.on ===
                "function"
            ) {


                this.system.on(
                    "status-change",
                    data => {

                        this.emit(
                            "system-status-change",
                            data
                        );

                    }
                );

            }


            if (
                this.modules &&
                typeof this.modules.on ===
                "function"
            ) {


                this.modules.on(
                    "module-initialized",
                    data => {

                        this.emit(
                            "module-initialized",
                            data
                        );

                    }
                );


                this.modules.on(
                    "module-error",
                    data => {

                        this.emit(
                            "module-error",
                            data
                        );

                    }
                );

            }

        },


        /* ====================================================
           START
           ==================================================== */

        async start() {


            if (
                this.running
            ) {

                this.log(
                    "Boot läuft bereits."
                );


                return false;

            }


            if (
                this.completed
            ) {

                this.log(
                    "Boot wurde bereits abgeschlossen."
                );


                return true;

            }


            this.connectCore();


            this.running =
                true;

            this.failed =
                false;

            this.completed =
                false;

            this.progress =
                0;

            this.startedAt =
                Date.now();

            this.completedAt =
                null;

            this.duration =
                null;


            this.status =
                "BOOTING";


            this.resetPhases();


            this.emit(
                "boot-start",
                this.getStatus()
            );


            this.log(
                "=============================================="
            );


            this.log(
                "HalDo AI OS 18 Boot wird gestartet."
            );


            this.log(
                "=============================================="
            );


            try {


                await this.runPhase(
                    "prepare",
                    () =>
                        this.prepareSystem()
                );


                await this.runPhase(
                    "kernel",
                    () =>
                        this.startKernel()
                );


                await this.runPhase(
                    "system",
                    () =>
                        this.startSystem()
                );


                await this.runPhase(
                    "modules",
                    () =>
                        this.loadModules()
                );


                await this.runPhase(
                    "environment",
                    () =>
                        this.checkEnvironment()
                );


                await this.runPhase(
                    "interface",
                    () =>
                        this.prepareInterface()
                );


                await this.runPhase(
                    "complete",
                    () =>
                        this.completeBoot()
                );


                this.running =
                    false;

                this.completed =
                    true;

                this.failed =
                    false;


                this.completedAt =
                    Date.now();


                this.duration =
                    this.completedAt -
                    this.startedAt;


                this.progress =
                    100;


                this.status =
                    "ONLINE";


                this.emit(
                    "boot-complete",
                    this.getStatus()
                );


                this.log(
                    "=============================================="
                );


                this.log(
                    "HalDo AI OS 18 ist ONLINE."
                );


                this.log(
                    `Bootzeit: ${this.duration} ms`
                );


                this.log(
                    "=============================================="
                );


                return true;


            } catch (error) {


                this.running =
                    false;

                this.completed =
                    false;

                this.failed =
                    true;


                this.status =
                    "ERROR";


                this.emit(
                    "boot-error",
                    {

                        error,

                        status:
                            this.getStatus()

                    }
                );


                this.handleError(
                    error,
                    "Boot"
                );


                return false;

            }

        },


        /* ====================================================
           PHASE AUSFÜHREN
           ==================================================== */

        async runPhase(
            phaseId,
            callback
        ) {


            const phase =
                this.phases.find(
                    item =>
                        item.id ===
                        phaseId
                );


            if (
                !phase
            ) {

                throw new Error(
                    `Bootphase nicht gefunden: ${phaseId}`
                );

            }


            this.currentPhase =
                phase;


            phase.status =
                "running";


            this.progress =
                phase.progress;


            this.emit(
                "phase-start",
                {

                    phase,

                    progress:
                        this.progress

                }
            );


            this.log(
                `[BOOT] ${phase.name}`
            );


            try {


                const result =
                    await Promise.resolve(
                        callback()
                    );


                phase.status =
                    "completed";


                phase.result =
                    result;


                this.emit(
                    "phase-complete",
                    {

                        phase,

                        progress:
                            this.progress

                    }
                );


                return result;


            } catch (error) {


                phase.status =
                    "failed";


                phase.error =
                    error.message ||
                    String(error);


                this.emit(
                    "phase-error",
                    {

                        phase,

                        error

                    }
                );


                throw error;

            }

        },


        /* ====================================================
           PHASE 1
           ==================================================== */

        prepareSystem() {


            if (
                !document
            ) {

                throw new Error(
                    "DOM ist nicht verfügbar."
                );

            }


            const root =
                document.documentElement;


            if (
                root
            ) {

                root.setAttribute(
                    "data-haldo-boot",
                    "starting"
                );

            }


            this.emit(
                "system-prepared"
            );


            return true;

        },


        /* ====================================================
           PHASE 2
           ==================================================== */

        startKernel() {


            this.connectCore();


            if (
                !this.kernel
            ) {

                throw new Error(
                    "HalDo Kernel wurde nicht gefunden."
                );

            }


            if (
                !this.kernel.ready &&
                typeof this.kernel.initialize ===
                "function"
            ) {

                this.kernel.initialize();

            }


            this.emit(
                "kernel-started"
            );


            return true;

        },


        /* ====================================================
           PHASE 3
           ==================================================== */

        startSystem() {


            this.connectCore();


            if (
                !this.system
            ) {

                throw new Error(
                    "HalDo System Manager wurde nicht gefunden."
                );

            }


            if (
                !this.system.initialized &&
                typeof this.system.initialize ===
                "function"
            ) {

                this.system.initialize();

            }


            this.emit(
                "system-started"
            );


            return true;

        },


        /* ====================================================
           PHASE 4
           ==================================================== */

        async loadModules() {


            this.connectCore();


            if (
                !this.modules
            ) {

                /*
                   Der Module Manager ist eine wichtige
                   Foundation-Komponente. Wir melden den
                   Zustand sauber.
                */

                throw new Error(
                    "HalDo Module Manager wurde nicht gefunden."
                );

            }


            if (
                !this.modules.initialized &&
                typeof this.modules.initialize ===
                "function"
            ) {

                this.modules.initialize();

            }


            /*
               Nur bereits registrierte Module starten.
               Neue Module werden später hier automatisch
               integriert.
            */

            if (
                typeof this.modules.startAll ===
                "function"
            ) {

                await this.modules.startAll();

            }


            this.emit(
                "modules-loaded"
            );


            return true;

        },


        /* ====================================================
           PHASE 5
           ==================================================== */

        checkEnvironment() {


            const environment = {


                language:
                    navigator.language ||
                    "de",


                online:
                    navigator.onLine,


                touch:
                    (
                        "ontouchstart" in
                        window
                    ) ||
                    (
                        navigator.maxTouchPoints >
                        0
                    ),


                mobile:
                    /Android|iPhone|iPad|iPod/i.test(
                        navigator.userAgent
                    ),


                width:
                    window.innerWidth,


                height:
                    window.innerHeight,


                pixelRatio:
                    window.devicePixelRatio ||
                    1

            };


            this.environment =
                environment;


            this.emit(
                "environment-ready",
                environment
            );


            return environment;

        },


        /* ====================================================
           PHASE 6
           ==================================================== */

        prepareInterface() {


            const root =
                document.documentElement;


            if (
                root
            ) {

                root.setAttribute(
                    "data-haldo-boot",
                    "interface"
                );

            }


            const body =
                document.body;


            if (
                body
            ) {

                body.setAttribute(
                    "data-haldo-boot",
                    "interface"
                );

            }


            this.emit(
                "interface-prepared"
            );


            return true;

        },


        /* ====================================================
           PHASE 7
           ==================================================== */

        completeBoot() {


            this.progress =
                100;


            const root =
                document.documentElement;


            if (
                root
            ) {

                root.setAttribute(
                    "data-haldo-boot",
                    "complete"
                );

                root.setAttribute(
                    "data-haldo-status",
                    "online"
                );

            }


            if (
                this.kernel &&
                typeof this.kernel.markBootComplete ===
                "function"
            ) {

                this.kernel.markBootComplete();

            }


            if (
                this.system &&
                typeof this.system.setStatus ===
                "function"
            ) {

                this.system.setStatus(
                    "ONLINE"
                );

            }


            this.emit(
                "system-ready"
            );


            return true;

        },


        /* ====================================================
           PHASEN ZURÜCKSETZEN
           ==================================================== */

        resetPhases() {


            this.phases.forEach(
                phase => {

                    phase.status =
                        "pending";

                    delete phase.result;

                    delete phase.error;

                }
            );


            this.currentPhase =
                null;

        },


        /* ====================================================
           STOP
           ==================================================== */

        async stop() {


            if (
                !this.running &&
                !this.completed
            ) {

                return true;

            }


            this.status =
                "SHUTTING_DOWN";


            try {


                if (
                    this.modules &&
                    typeof this.modules.stopAll ===
                    "function"
                ) {

                    await this.modules.stopAll();

                }


                if (
                    this.system &&
                    typeof this.system.setStatus ===
                    "function"
                ) {

                    this.system.setStatus(
                        "OFFLINE"
                    );

                }


                if (
                    this.kernel &&
                    typeof this.kernel.setStatus ===
                    "function"
                ) {

                    this.kernel.setStatus(
                        "OFFLINE"
                    );

                }


                this.running =
                    false;

                this.completed =
                    false;


                this.status =
                    "STOPPED";


                this.emit(
                    "boot-stopped"
                );


                return true;


            } catch (error) {


                this.handleError(
                    error,
                    "Boot shutdown"
                );


                this.status =
                    "ERROR";


                return false;

            }

        },


        /* ====================================================
           RESET
           ==================================================== */

        reset() {


            this.running =
                false;

            this.completed =
                false;

            this.failed =
                false;


            this.progress =
                0;


            this.startedAt =
                null;

            this.completedAt =
                null;

            this.duration =
                null;


            this.status =
                "READY";


            this.resetPhases();


            this.emit(
                "reset"
            );


            return true;

        },


        /* ====================================================
           STATUS
           ==================================================== */

        getStatus() {


            return {

                name:
                    this.name,

                version:
                    this.version,

                status:
                    this.status,

                initialized:
                    this.initialized,

                running:
                    this.running,

                completed:
                    this.completed,

                failed:
                    this.failed,

                progress:
                    this.progress,

                currentPhase:
                    this.currentPhase
                        ? this.currentPhase.id
                        : null,

                startedAt:
                    this.startedAt,

                completedAt:
                    this.completedAt,

                duration:
                    this.duration,

                phases:
                    this.phases.map(
                        phase => ({

                            id:
                                phase.id,

                            name:
                                phase.name,

                            status:
                                phase.status,

                            progress:
                                phase.progress

                        })
                    )

            };

        },


        /* ====================================================
           EVENT ON
           ==================================================== */

        on(
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
                !this.listeners.has(
                    eventName
                )
            ) {

                this.listeners.set(
                    eventName,
                    []
                );

            }


            this.listeners
                .get(eventName)
                .push(callback);


            return true;

        },


        /* ====================================================
           EVENT OFF
           ==================================================== */

        off(
            eventName,
            callback
        ) {


            const listeners =
                this.listeners.get(
                    eventName
                );


            if (
                !listeners
            ) {

                return false;

            }


            const index =
                listeners.indexOf(
                    callback
                );


            if (
                index === -1
            ) {

                return false;

            }


            listeners.splice(
                index,
                1
            );


            return true;

        },


        /* ====================================================
           EVENT EMIT
           ==================================================== */

        emit(
            eventName,
            data = null
        ) {


            const listeners =
                this.listeners.get(
                    eventName
                );


            if (
                !listeners
            ) {

                return;

            }


            listeners
                .slice()
                .forEach(
                    callback => {

                        try {

                            callback(
                                data
                            );

                        } catch (error) {

                            this.handleError(
                                error,
                                `Event: ${eventName}`
                            );

                        }

                    }
                );

        },


        /* ====================================================
           FEHLER
           ==================================================== */

        handleError(
            error,
            source = "Boot Manager"
        ) {


            console.error(
                "[HalDo Boot Manager]",
                source,
                error
            );


            if (
                this.kernel &&
                typeof this.kernel.handleError ===
                "function"
            ) {

                this.kernel.handleError(
                    error,
                    source
                );

            }


            this.emit(
                "error",
                {

                    source,

                    error

                }
            );

        },


        /* ====================================================
           LOG
           ==================================================== */

        log(
            message,
            data = null
        ) {


            if (
                data !== null
            ) {

                console.log(
                    "[HalDo Boot Manager]",
                    message,
                    data
                );

            } else {

                console.log(
                    "[HalDo Boot Manager]",
                    message
                );

            }

        }

    };


    /* ========================================================
       GLOBAL API
       ======================================================== */

    window.HalDoBootManager =
        HalDoBootManager;


    if (
        !window.HalDo
    ) {

        window.HalDo = {};

    }


    window.HalDo.boot =
        HalDoBootManager;


    /* ========================================================
       INITIALISIERUNG
       ======================================================== */

    function initializeBootManager() {


        HalDoBootManager.connectCore();

        HalDoBootManager.initialize();


    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeBootManager,
            {
                once: true
            }
        );

    } else {

        initializeBootManager();

    }


    /* ========================================================
       CONSOLE
       ======================================================== */

    console.log(
        "=============================================="
    );

    console.log(
        "HalDo AI OS 18 Boot Manager"
    );

    console.log(
        "Professional Ultimate Foundation"
    );

    console.log(
        "Boot Manager geladen."
    );

    console.log(
        "=============================================="
    );


})(window);