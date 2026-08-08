/*
============================================================
 HALDO AI OS 18
 KERNEL
 Professional Ultimate Foundation
============================================================

 Datei:
 js/kernel.js

 Aufgabe:
 - zentraler Systemkern
 - Systemstatus
 - Boot-/Runtime-Verwaltung
 - Modulregistrierung
 - Event-System
 - Fehlerbehandlung
 - Systeminformationen
 - sichere Kommunikation zwischen zukünftigen Modulen

 WICHTIG:
 Diese Datei ist eigenständig aufgebaut und erwartet keine
 weiteren Dateien, damit beim Aufbau keine Abhängigkeiten
 fehlen.
============================================================
*/

"use strict";


/* =========================================================
   HALDO KERNEL
   ========================================================= */

(function (window) {


    const HalDoKernel = {


        /* =====================================================
           SYSTEM INFORMATION
           ===================================================== */

        name:
            "HalDo AI OS",

        version:
            "18.0.0",

        edition:
            "Professional Ultimate Foundation",

        kernelVersion:
            "18.0.0",

        build:
            "HALDO-OS18-FOUNDATION",


        /* =====================================================
           STATUS
           ===================================================== */

        status:
            "INITIALIZING",

        ready:
            false,

        booted:
            false,


        /* =====================================================
           TIMING
           ===================================================== */

        startedAt:
            null,

        readyAt:
            null,


        /* =====================================================
           MODULE STORAGE
           ===================================================== */

        modules:
            new Map(),


        /* =====================================================
           EVENT STORAGE
           ===================================================== */

        events:
            new Map(),


        /* =====================================================
           ERROR STORAGE
           ===================================================== */

        errors:
            [],


        /* =====================================================
           SYSTEM DATA
           ===================================================== */

        data: {

            environment:
                "web",

            platform:
                "unknown",

            language:
                "de",

            online:
                false,

            storage:
                false,

            touch:
                false

        },


        /* =====================================================
           INITIALIZE
           ===================================================== */

        initialize() {

            this.startedAt =
                Date.now();


            this.status =
                "INITIALIZING";


            this.detectEnvironment();

            this.registerCoreEvents();

            this.status =
                "READY";

            this.ready =
                true;

            this.readyAt =
                Date.now();


            this.emit(
                "kernel:ready",
                this.getSystemInfo()
            );


            this.log(
                "Kernel",
                "HalDo Kernel ist bereit."
            );


            return true;
        },


        /* =====================================================
           ENVIRONMENT DETECTION
           ===================================================== */

        detectEnvironment() {

            try {

                this.data.platform =
                    this.detectPlatform();


                this.data.language =
                    (
                        navigator.language ||
                        "de"
                    ).toLowerCase();


                this.data.touch =
                    (
                        "ontouchstart" in window
                    ) ||
                    (
                        navigator.maxTouchPoints > 0
                    );


                this.data.online =
                    navigator.onLine;


                this.data.storage =
                    this.checkStorage();


            } catch (error) {

                this.handleError(
                    error,
                    "Environment detection"
                );

            }

        },


        /* =====================================================
           PLATFORM
           ===================================================== */

        detectPlatform() {

            const userAgent =
                navigator.userAgent ||
                "";


            if (
                /iPhone|iPad|iPod/i.test(
                    userAgent
                )
            ) {

                return "iOS";

            }


            if (
                /Android/i.test(
                    userAgent
                )
            ) {

                return "Android";

            }


            if (
                /Windows/i.test(
                    userAgent
                )
            ) {

                return "Windows";

            }


            if (
                /Macintosh|Mac OS X/i.test(
                    userAgent
                )
            ) {

                return "macOS";

            }


            if (
                /Linux/i.test(
                    userAgent
                )
            ) {

                return "Linux";

            }


            return "Unknown";

        },


        /* =====================================================
           STORAGE TEST
           ===================================================== */

        checkStorage() {

            try {

                const testKey =
                    "__haldo_storage_test__";


                localStorage.setItem(
                    testKey,
                    "1"
                );


                localStorage.removeItem(
                    testKey
                );


                return true;

            } catch (error) {

                return false;

            }

        },


        /* =====================================================
           CORE EVENTS
           ===================================================== */

        registerCoreEvents() {


            window.addEventListener(
                "online",
                () => {

                    this.data.online =
                        true;


                    this.emit(
                        "network:online"
                    );


                    this.log(
                        "Network",
                        "Online"
                    );

                }
            );


            window.addEventListener(
                "offline",
                () => {

                    this.data.online =
                        false;


                    this.emit(
                        "network:offline"
                    );


                    this.log(
                        "Network",
                        "Offline"
                    );

                }
            );


            window.addEventListener(
                "error",
                (event) => {

                    if (
                        event.error
                    ) {

                        this.handleError(
                            event.error,
                            "Window error"
                        );

                    }

                }
            );


            window.addEventListener(
                "unhandledrejection",
                (event) => {

                    this.handleError(
                        event.reason,
                        "Unhandled promise rejection"
                    );

                }
            );

        },


        /* =====================================================
           MODULE REGISTRATION
           ===================================================== */

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
                    "Module benötigt einen gültigen Namen."
                );

            }


            if (
                this.modules.has(
                    name
                )
            ) {

                this.log(
                    "Module",
                    `Modul "${name}" ist bereits registriert.`
                );


                return false;

            }


            const moduleRecord = {

                name,

                module,

                version:
                    options.version ||
                    "1.0.0",

                enabled:
                    options.enabled !== false,

                initialized:
                    false,

                registeredAt:
                    Date.now()

            };


            this.modules.set(
                name,
                moduleRecord
            );


            this.emit(
                "module:registered",
                moduleRecord
            );


            this.log(
                "Module",
                `Modul registriert: ${name}`
            );


            return true;

        },


        /* =====================================================
           MODULE INITIALIZATION
           ===================================================== */

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

                this.handleError(
                    new Error(
                        `Modul nicht gefunden: ${name}`
                    ),
                    "Module initialization"
                );


                return false;

            }


            if (
                !record.enabled
            ) {

                this.log(
                    "Module",
                    `Modul deaktiviert: ${name}`
                );


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
                    "module:initialized",
                    record
                );


                this.log(
                    "Module",
                    `Modul initialisiert: ${name}`
                );


                return true;

            } catch (error) {

                this.handleError(
                    error,
                    `Module initialization: ${name}`
                );


                return false;

            }

        },


        /* =====================================================
           INITIALIZE ALL MODULES
           ===================================================== */

        initializeModules() {

            let initialized =
                0;


            this.modules.forEach(
                (record) => {

                    if (
                        this.initializeModule(
                            record.name
                        )
                    ) {

                        initialized++;

                    }

                }
            );


            this.emit(
                "modules:initialized",
                {
                    count:
                        initialized
                }
            );


            return initialized;

        },


        /* =====================================================
           REMOVE MODULE
           ===================================================== */

        unregisterModule(
            name
        ) {


            if (
                !this.modules.has(
                    name
                )
            ) {

                return false;

            }


            const record =
                this.modules.get(
                    name
                );


            try {

                if (
                    record.module &&
                    typeof record.module.destroy ===
                    "function"
                ) {

                    record.module.destroy(
                        this
                    );

                }

            } catch (error) {

                this.handleError(
                    error,
                    `Module destroy: ${name}`
                );

            }


            this.modules.delete(
                name
            );


            this.emit(
                "module:unregistered",
                {
                    name
                }
            );


            return true;

        },


        /* =====================================================
           EVENT: ON
           ===================================================== */

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
                !this.events.has(
                    eventName
                )
            ) {

                this.events.set(
                    eventName,
                    []
                );

            }


            this.events
                .get(eventName)
                .push(callback);


            return true;

        },


        /* =====================================================
           EVENT: OFF
           ===================================================== */

        off(
            eventName,
            callback
        ) {


            const listeners =
                this.events.get(
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


        /* =====================================================
           EVENT: EMIT
           ===================================================== */

        emit(
            eventName,
            data = null
        ) {


            const listeners =
                this.events.get(
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
                    (callback) => {

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


        /* =====================================================
           ERROR HANDLING
           ===================================================== */

        handleError(
            error,
            source = "Unknown"
        ) {


            const errorObject = {

                message:
                    error &&
                    error.message
                        ? error.message
                        : String(error),

                source,

                timestamp:
                    new Date()
                        .toISOString(),

                stack:
                    error &&
                    error.stack
                        ? error.stack
                        : null

            };


            this.errors.push(
                errorObject
            );


            /*
               Keep only the most recent
               100 errors.
            */

            if (
                this.errors.length >
                100
            ) {

                this.errors.shift();

            }


            console.error(
                "[HalDo Kernel]",
                errorObject
            );


            this.emit(
                "system:error",
                errorObject
            );


            return errorObject;

        },


        /* =====================================================
           LOG
           ===================================================== */

        log(
            source,
            message,
            data = null
        ) {


            const prefix =
                `[HalDo ${source}]`;


            if (
                data !== null
            ) {

                console.log(
                    prefix,
                    message,
                    data
                );

            } else {

                console.log(
                    prefix,
                    message
                );

            }

        },


        /* =====================================================
           SYSTEM INFORMATION
           ===================================================== */

        getSystemInfo() {

            return {

                name:
                    this.name,

                version:
                    this.version,

                edition:
                    this.edition,

                kernelVersion:
                    this.kernelVersion,

                build:
                    this.build,

                status:
                    this.status,

                ready:
                    this.ready,

                booted:
                    this.booted,

                startedAt:
                    this.startedAt,

                readyAt:
                    this.readyAt,

                platform:
                    this.data.platform,

                language:
                    this.data.language,

                online:
                    this.data.online,

                storage:
                    this.data.storage,

                touch:
                    this.data.touch,

                moduleCount:
                    this.modules.size,

                errorCount:
                    this.errors.length

            };

        },


        /* =====================================================
           STATUS
           ===================================================== */

        setStatus(
            status
        ) {

            const oldStatus =
                this.status;


            this.status =
                String(status);


            this.emit(
                "system:status",
                {

                    oldStatus,

                    newStatus:
                        this.status

                }
            );


            this.log(
                "System",
                `Status: ${this.status}`
            );


            return this.status;

        },


        /* =====================================================
           MARK BOOT COMPLETE
           ===================================================== */

        markBootComplete() {

            this.booted =
                true;

            this.ready =
                true;

            this.status =
                "ONLINE";


            this.emit(
                "system:boot-complete",
                this.getSystemInfo()
            );


            this.log(
                "Kernel",
                "HalDo AI OS Boot abgeschlossen."
            );


            return true;

        },


        /* =====================================================
           SHUTDOWN
           ===================================================== */

        shutdown() {

            this.setStatus(
                "SHUTTING_DOWN"
            );


            this.modules.forEach(
                (record) => {

                    try {

                        if (
                            record.module &&
                            typeof record.module.shutdown ===
                            "function"
                        ) {

                            record.module.shutdown(
                                this
                            );

                        }

                    } catch (error) {

                        this.handleError(
                            error,
                            `Shutdown: ${record.name}`
                        );

                    }

                }
            );


            this.emit(
                "system:shutdown"
            );


            this.setStatus(
                "OFFLINE"
            );


            return true;

        },


        /* =====================================================
           RESET
           ===================================================== */

        reset() {

            this.status =
                "RESETTING";


            this.modules.forEach(
                (record) => {

                    record.initialized =
                        false;

                }
            );


            this.errors =
                [];


            this.emit(
                "system:reset"
            );


            this.status =
                "READY";


            this.log(
                "Kernel",
                "Kernel wurde zurückgesetzt."
            );


            return true;

        }

    };


    /* =========================================================
       PUBLIC GLOBAL API
       ========================================================= */

    window.HalDoKernel =
        HalDoKernel;


    /*
       Compatibility alias.
       Future modules may use either:
       HalDoKernel
       or
       HalDo.kernel
    */

    if (
        !window.HalDo
    ) {

        window.HalDo = {};

    }


    window.HalDo.kernel =
        HalDoKernel;


    /* =========================================================
       AUTO INITIALIZATION
       ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function() {

                HalDoKernel.initialize();

            },
            {
                once: true
            }
        );

    } else {

        HalDoKernel.initialize();

    }


    /* =========================================================
       FINAL CONSOLE MESSAGE
       ========================================================= */

    console.log(
        "=============================================="
    );

    console.log(
        "HalDo AI OS 18 Kernel"
    );

    console.log(
        "Professional Ultimate Foundation"
    );

    console.log(
        "Kernel loaded successfully."
    );

    console.log(
        "=============================================="
    );


})(window);