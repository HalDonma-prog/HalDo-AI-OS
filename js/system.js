/*
============================================================
 HALDO AI OS 18
 SYSTEM MANAGER
 Professional Ultimate Foundation
============================================================

 Datei:
 js/system.js

 Aufgabe:
 - Systemverwaltung
 - Boot-Prozess
 - Statusverwaltung
 - Verbindung mit HalDo Kernel
 - Modulverwaltung
 - Systemereignisse
 - Systemdiagnose
 - Vorbereitung für UI / AI / Apps
============================================================
*/

"use strict";


(function (window) {


    /* ========================================================
       SYSTEM MANAGER
       ======================================================== */

    const HalDoSystem = {


        /* ====================================================
           INFORMATIONEN
           ==================================================== */

        name:
            "HalDo AI OS",

        version:
            "18.0.0",

        edition:
            "Professional Ultimate Foundation",

        status:
            "CREATED",

        initialized:
            false,

        bootStarted:
            false,

        bootCompleted:
            false,


        /* ====================================================
           BOOT
           ==================================================== */

        bootTime:
            null,

        bootStartedAt:
            null,

        bootCompletedAt:
            null,


        /* ====================================================
           BOOT PHASEN
           ==================================================== */

        bootPhases: [

            {
                id:
                    "system-check",

                name:
                    "Systemprüfung",

                status:
                    "pending"
            },

            {
                id:
                    "kernel-check",

                name:
                    "Kernelprüfung",

                status:
                    "pending"
            },

            {
                id:
                    "module-check",

                name:
                    "Modulprüfung",

                status:
                    "pending"
            },

            {
                id:
                    "environment",

                name:
                    "Umgebung",

                status:
                    "pending"
            },

            {
                id:
                    "interface",

                name:
                    "Benutzeroberfläche",

                status:
                    "pending"
            },

            {
                id:
                    "ready",

                name:
                    "System bereit",

                status:
                    "pending"
            }

        ],


        /* ====================================================
           MODULE
           ==================================================== */

        modules:
            new Map(),


        /* ====================================================
           EVENTS
           ==================================================== */

        listeners:
            new Map(),


        /* ====================================================
           DIAGNOSTICS
           ==================================================== */

        diagnostics: {

            started:
                false,

            completed:
                false,

            passed:
                0,

            failed:
                0,

            warnings:
                0,

            results:
                []

        },


        /* ====================================================
           INITIALIZE
           ==================================================== */

        initialize() {


            if (
                this.initialized
            ) {

                return true;

            }


            this.status =
                "INITIALIZING";


            this.registerEvents();

            this.connectKernel();

            this.initialized =
                true;


            this.setStatus(
                "INITIALIZED"
            );


            this.log(
                "System Manager initialisiert."
            );


            return true;

        },


        /* ====================================================
           KERNEL VERBINDUNG
           ==================================================== */

        connectKernel() {


            if (
                !window.HalDoKernel
            ) {

                this.log(
                    "Kernel noch nicht verfügbar."
                );


                return false;

            }


            this.kernel =
                window.HalDoKernel;


            this.kernel.on(
                "kernel:ready",
                (
                    information
                ) => {

                    this.emit(
                        "kernel-ready",
                        information
                    );

                }
            );


            this.kernel.on(
                "system:error",
                (
                    error
                ) => {

                    this.emit(
                        "system-error",
                        error
                    );

                }
            );


            this.log(
                "Kernel erfolgreich verbunden."
            );


            return true;

        },


        /* ====================================================
           EVENTS REGISTRIEREN
           ==================================================== */

        registerEvents() {


            window.addEventListener(
                "online",
                () => {

                    this.emit(
                        "network-online"
                    );

                }
            );


            window.addEventListener(
                "offline",
                () => {

                    this.emit(
                        "network-offline"
                    );

                }
            );


            document.addEventListener(
                "visibilitychange",
                () => {

                    this.emit(
                        "visibility-change",
                        {

                            hidden:
                                document.hidden

                        }
                    );

                }
            );


            window.addEventListener(
                "beforeunload",
                () => {

                    this.emit(
                        "system-unloading"
                    );

                }
            );

        },


        /* ====================================================
           BOOT START
           ==================================================== */

        async boot() {


            if (
                this.bootStarted
            ) {

                return false;

            }


            this.bootStarted =
                true;


            this.bootStartedAt =
                Date.now();


            this.bootTime =
                null;


            this.setStatus(
                "BOOTING"
            );


            this.log(
                "HalDo AI OS Boot wird gestartet."
            );


            try {


                /* ==========================================
                   PHASE 1
                   ========================================== */

                await this.runBootPhase(
                    "system-check",
                    () =>
                        this.checkSystem()
                );


                /* ==========================================
                   PHASE 2
                   ========================================== */

                await this.runBootPhase(
                    "kernel-check",
                    () =>
                        this.checkKernel()
                );


                /* ==========================================
                   PHASE 3
                   ========================================== */

                await this.runBootPhase(
                    "module-check",
                    () =>
                        this.checkModules()
                );


                /* ==========================================
                   PHASE 4
                   ========================================== */

                await this.runBootPhase(
                    "environment",
                    () =>
                        this.checkEnvironment()
                );


                /* ==========================================
                   PHASE 5
                   ========================================== */

                await this.runBootPhase(
                    "interface",
                    () =>
                        this.prepareInterface()
                );


                /* ==========================================
                   PHASE 6
                   ========================================== */

                await this.runBootPhase(
                    "ready",
                    () =>
                        this.finalizeBoot()
                );


                this.bootCompleted =
                    true;


                this.bootCompletedAt =
                    Date.now();


                this.bootTime =
                    this.bootCompletedAt -
                    this.bootStartedAt;


                this.setStatus(
                    "ONLINE"
                );


                if (
                    this.kernel &&
                    typeof this.kernel.markBootComplete ===
                    "function"
                ) {

                    this.kernel.markBootComplete();

                }


                this.emit(
                    "boot-complete",
                    this.getStatus()
                );


                this.log(
                    "HalDo AI OS ist vollständig gestartet."
                );


                return true;


            } catch (error) {


                this.setStatus(
                    "ERROR"
                );


                this.emit(
                    "boot-error",
                    error
                );


                this.logError(
                    error
                );


                return false;

            }

        },


        /* ====================================================
           BOOT PHASE AUSFÜHREN
           ==================================================== */

        async runBootPhase(
            phaseId,
            callback
        ) {


            const phase =
                this.bootPhases.find(
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


            phase.status =
                "running";


            this.emit(
                "boot-phase-start",
                phase
            );


            this.log(
                `Bootphase: ${phase.name}`
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
                    "boot-phase-complete",
                    phase
                );


                return result;


            } catch (error) {


                phase.status =
                    "failed";


                phase.error =
                    error.message ||
                    String(error);


                this.emit(
                    "boot-phase-error",
                    {

                        phase,

                        error

                    }
                );


                throw error;

            }

        },


        /* ====================================================
           SYSTEMPRÜFUNG
           ==================================================== */

        checkSystem() {


            const checks = {


                window:
                    typeof window !==
                    "undefined",


                document:
                    typeof document !==
                    "undefined",


                navigator:
                    typeof navigator !==
                    "undefined",


                localStorage:
                    this.checkStorage(),


                browser:
                    true

            };


            const failed =
                Object.keys(
                    checks
                ).filter(
                    key =>
                        !checks[key]
                );


            if (
                failed.length > 0
            ) {

                throw new Error(
                    "Systemprüfung fehlgeschlagen: " +
                    failed.join(", ")
                );

            }


            return checks;

        },


        /* ====================================================
           KERNEL PRÜFEN
           ==================================================== */

        checkKernel() {


            if (
                !window.HalDoKernel
            ) {

                throw new Error(
                    "HalDo Kernel wurde nicht gefunden."
                );

            }


            if (
                !window.HalDoKernel.ready
            ) {

                /*
                   Der Kernel kann noch initialisieren.
                   Wir behandeln dies nicht sofort als
                   fatalen Fehler.
                */

                this.log(
                    "Kernel wird noch initialisiert."
                );

            }


            this.kernel =
                window.HalDoKernel;


            return true;

        },


        /* ====================================================
           MODULE PRÜFEN
           ==================================================== */

        checkModules() {


            const moduleCount =
                this.modules.size;


            this.log(
                `Registrierte Systemmodule: ${moduleCount}`
            );


            return {

                count:
                    moduleCount,

                ready:
                    true

            };

        },


        /* ====================================================
           UMGEBUNG PRÜFEN
           ==================================================== */

        checkEnvironment() {


            const environment = {


                language:
                    navigator.language ||
                    "de",


                online:
                    navigator.onLine,


                touch:
                    "ontouchstart" in window ||
                    navigator.maxTouchPoints > 0,


                mobile:
                    /Android|iPhone|iPad|iPod/i.test(
                        navigator.userAgent
                    ),


                screenWidth:
                    window.innerWidth,


                screenHeight:
                    window.innerHeight

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
           INTERFACE VORBEREITEN
           ==================================================== */

        prepareInterface() {


            const root =
                document.documentElement;


            if (
                root
            ) {

                root.setAttribute(
                    "data-haldo-os",
                    "18"
                );


                root.setAttribute(
                    "data-haldo-status",
                    "booting"
                );

            }


            const body =
                document.body;


            if (
                body
            ) {

                body.setAttribute(
                    "data-haldo-system",
                    "18"
                );

            }


            this.emit(
                "interface-ready"
            );


            return true;

        },


        /* ====================================================
           BOOT ABSCHLIESSEN
           ==================================================== */

        finalizeBoot() {


            const root =
                document.documentElement;


            if (
                root
            ) {

                root.setAttribute(
                    "data-haldo-status",
                    "online"
                );

            }


            this.setStatus(
                "READY"
            );


            return true;

        },


        /* ====================================================
           MODULE REGISTRIEREN
           ==================================================== */

        registerModule(
            name,
            module,
            options = {}
        ) {


            if (
                !name ||
                typeof name !==
                "string"
            ) {

                throw new Error(
                    "Ungültiger Modulname."
                );

            }


            if (
                this.modules.has(
                    name
                )
            ) {

                this.log(
                    `Modul bereits vorhanden: ${name}`
                );


                return false;

            }


            const record = {

                name,

                module,

                version:
                    options.version ||
                    "1.0.0",

                critical:
                    options.critical === true,

                enabled:
                    options.enabled !== false,

                initialized:
                    false,

                registeredAt:
                    Date.now()

            };


            this.modules.set(
                name,
                record
            );


            /*
               Zusätzlich beim Kernel registrieren.
            */

            if (
                this.kernel &&
                typeof this.kernel.registerModule ===
                "function"
            ) {

                this.kernel.registerModule(
                    name,
                    module,
                    options
                );

            }


            this.emit(
                "module-registered",
                record
            );


            this.log(
                `Systemmodul registriert: ${name}`
            );


            return true;

        },


        /* ====================================================
           MODUL INITIALISIEREN
           ==================================================== */

        initializeModule(
            name
        ) {


            const record =
                this.modules.get(
                    name
                );


            if (
                !record
            ) {

                this.log(
                    `Modul nicht gefunden: ${name}`
                );


                return false;

            }


            if (
                !record.enabled
            ) {

                return false;

            }


            if (
                record.initialized
            ) {

                return true;

            }


            try {


                if (
                    record.module &&
                    typeof record.module.initialize ===
                    "function"
                ) {

                    record.module.initialize(
                        this
                    );

                }


                record.initialized =
                    true;


                this.emit(
                    "module-initialized",
                    record
                );


                return true;


            } catch (error) {


                this.logError(
                    error,
                    `Modul: ${name}`
                );


                if (
                    record.critical
                ) {

                    throw error;

                }


                return false;

            }

        },


        /* ====================================================
           ALLE MODULE INITIALISIEREN
           ==================================================== */

        initializeModules() {


            let count =
                0;


            this.modules.forEach(
                record => {

                    if (
                        this.initializeModule(
                            record.name
                        )
                    ) {

                        count++;

                    }

                }
            );


            this.emit(
                "modules-initialized",
                {

                    count

                }
            );


            return count;

        },


        /* ====================================================
           DIAGNOSTIK
           ==================================================== */

        runDiagnostics() {


            this.diagnostics = {

                started:
                    true,

                completed:
                    false,

                passed:
                    0,

                failed:
                    0,

                warnings:
                    0,

                results:
                    []

            };


            const tests = [

                {
                    name:
                        "DOM",

                    test:
                        () =>
                            typeof document !==
                            "undefined"
                },

                {
                    name:
                        "Kernel",

                    test:
                        () =>
                            !!window.HalDoKernel
                },

                {
                    name:
                        "Local Storage",

                    test:
                        () =>
                            this.checkStorage()
                },

                {
                    name:
                        "Internet",

                    test:
                        () =>
                            navigator.onLine
                },

                {
                    name:
                        "Touch Support",

                    test:
                        () =>
                            (
                                "ontouchstart" in
                                window
                            ) ||
                            navigator.maxTouchPoints > 0
                }

            ];


            tests.forEach(
                item => {


                    let passed =
                        false;


                    try {

                        passed =
                            Boolean(
                                item.test()
                            );

                    } catch (error) {

                        passed =
                            false;

                    }


                    const result = {

                        name:
                            item.name,

                        passed,

                        timestamp:
                            Date.now()

                    };


                    this.diagnostics.results.push(
                        result
                    );


                    if (
                        passed
                    ) {

                        this.diagnostics.passed++;

                    } else {

                        this.diagnostics.failed++;

                    }

                }
            );


            this.diagnostics.completed =
                true;


            this.emit(
                "diagnostics-complete",
                this.diagnostics
            );


            return this.diagnostics;

        },


        /* ====================================================
           STORAGE PRÜFEN
           ==================================================== */

        checkStorage() {


            try {


                const key =
                    "__haldo_system_test__";


                localStorage.setItem(
                    key,
                    "ok"
                );


                localStorage.removeItem(
                    key
                );


                return true;


            } catch (error) {


                return false;

            }

        },


        /* ====================================================
           STATUS SETZEN
           ==================================================== */

        setStatus(
            status
        ) {


            const oldStatus =
                this.status;


            this.status =
                String(status);


            const root =
                document.documentElement;


            if (
                root
            ) {

                root.setAttribute(
                    "data-haldo-status",
                    this.status.toLowerCase()
                );

            }


            this.emit(
                "status-change",
                {

                    oldStatus,

                    newStatus:
                        this.status

                }
            );


            this.log(
                `Systemstatus: ${this.status}`
            );


            return this.status;

        },


        /* ====================================================
           STATUS ABFRAGEN
           ==================================================== */

        getStatus() {


            return {

                name:
                    this.name,

                version:
                    this.version,

                edition:
                    this.edition,

                status:
                    this.status,

                initialized:
                    this.initialized,

                bootStarted:
                    this.bootStarted,

                bootCompleted:
                    this.bootCompleted,

                bootTime:
                    this.bootTime,

                modules:
                    this.modules.size,

                environment:
                    this.environment ||
                    null,

                diagnostics:
                    this.diagnostics

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

                            this.logError(
                                error,
                                `Event: ${eventName}`
                            );

                        }

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
                    "[HalDo System]",
                    message,
                    data
                );

            } else {

                console.log(
                    "[HalDo System]",
                    message
                );

            }

        },


        /* ====================================================
           ERROR
           ==================================================== */

        logError(
            error,
            source = "System"
        ) {


            console.error(
                "[HalDo System]",
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

        }

    };


    /* ========================================================
       GLOBAL VERFÜGBAR MACHEN
       ======================================================== */

    window.HalDoSystem =
        HalDoSystem;


    if (
        !window.HalDo
    ) {

        window.HalDo = {};

    }


    window.HalDo.system =
        HalDoSystem;


    /* ========================================================
       SYSTEM INITIALISIEREN
       ======================================================== */

    function startSystem() {


        try {


            HalDoSystem.initialize();


            /*
               Boot bewusst leicht verzögert starten,
               damit Kernel und DOM sauber verfügbar sind.
            */

            window.setTimeout(
                () => {

                    HalDoSystem.boot();

                },
                50
            );


        } catch (error) {


            console.error(
                "[HalDo System]",
                "Systemstart fehlgeschlagen.",
                error
            );

        }

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startSystem,
            {
                once: true
            }
        );

    } else {

        startSystem();

    }


    /* ========================================================
       INFORMATION
       ======================================================== */

    console.log(
        "=============================================="
    );

    console.log(
        "HalDo AI OS 18 System Manager"
    );

    console.log(
        "Professional Ultimate Foundation"
    );

    console.log(
        "System Manager geladen."
    );

    console.log(
        "=============================================="
    );


})(window);