/*
============================================================
 HALDO AI OS 18
 MODULE MANAGER
 Professional Ultimate Foundation
============================================================

 Datei:
 js/module-manager.js

 Aufgabe:
 - Verwaltung aller HalDo-Systemmodule
 - Registrierung
 - Initialisierung
 - Aktivierung / Deaktivierung
 - Abhängigkeiten
 - Modulstatus
 - Versionsinformationen
 - Fehlerbehandlung
 - Verbindung mit Kernel und System Manager

 WICHTIG:
 Diese Datei ist Teil der zentralen Foundation.
 Neue Systeme sollen später als Module eingebunden
 werden und nicht ungeordnet in andere Dateien kommen.
============================================================
*/

"use strict";


(function (window) {


    /* ========================================================
       MODULE MANAGER
       ======================================================== */

    const HalDoModuleManager = {


        /* ====================================================
           INFORMATION
           ==================================================== */

        name:
            "HalDo Module Manager",

        version:
            "18.0.0",

        status:
            "CREATED",

        initialized:
            false,


        /* ====================================================
           SYSTEM REFERENCES
           ==================================================== */

        kernel:
            null,

        system:
            null,


        /* ====================================================
           MODULE STORAGE
           ==================================================== */

        modules:
            new Map(),


        /* ====================================================
           LOAD ORDER
           ==================================================== */

        loadOrder:
            [],


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


            this.status =
                "INITIALIZING";


            this.connectCore();


            this.registerCoreEvents();


            this.initialized =
                true;


            this.status =
                "READY";


            this.emit(
                "ready",
                this.getStatus()
            );


            this.log(
                "Module Manager ist bereit."
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


            if (
                this.kernel
            ) {

                this.log(
                    "Kernel verbunden."
                );

            } else {

                this.log(
                    "Kernel noch nicht verfügbar."
                );

            }


            if (
                this.system
            ) {

                this.log(
                    "System Manager verbunden."
                );

            } else {

                this.log(
                    "System Manager noch nicht verfügbar."
                );

            }


            return true;

        },


        /* ====================================================
           CORE EVENTS
           ==================================================== */

        registerCoreEvents() {


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
                    "boot-complete",
                    data => {

                        this.emit(
                            "boot-complete",
                            data
                        );

                    }
                );


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

        },


        /* ====================================================
           MODUL REGISTRIEREN
           ==================================================== */

        register(
            definition
        ) {


            if (
                !definition ||
                typeof definition !==
                "object"
            ) {

                throw new Error(
                    "Ungültige Moduldefinition."
                );

            }


            const name =
                definition.name;


            if (
                !name ||
                typeof name !==
                "string"
            ) {

                throw new Error(
                    "Jedes Modul benötigt einen Namen."
                );

            }


            if (
                this.modules.has(
                    name
                )
            ) {

                this.log(
                    `Modul bereits registriert: ${name}`
                );


                return false;

            }


            const record = {

                name,

                version:
                    definition.version ||
                    "1.0.0",

                description:
                    definition.description ||
                    "",

                category:
                    definition.category ||
                    "system",

                enabled:
                    definition.enabled !== false,

                critical:
                    definition.critical === true,

                autoStart:
                    definition.autoStart !== false,

                dependencies:
                    Array.isArray(
                        definition.dependencies
                    )
                        ? [
                            ...definition.dependencies
                        ]
                        : [],

                module:
                    definition.module ||
                    null,

                status:
                    "REGISTERED",

                initialized:
                    false,

                started:
                    false,

                registeredAt:
                    Date.now(),

                initializedAt:
                    null,

                startedAt:
                    null,

                error:
                    null

            };


            this.modules.set(
                name,
                record
            );


            this.loadOrder.push(
                name
            );


            /*
               Mit Kernel verbinden.
            */

            if (
                this.kernel &&
                record.module &&
                typeof this.kernel.registerModule ===
                "function"
            ) {

                try {

                    this.kernel.registerModule(
                        name,
                        record.module,
                        {

                            version:
                                record.version,

                            enabled:
                                record.enabled

                        }
                    );

                } catch (error) {

                    this.handleError(
                        error,
                        `Kernel registration: ${name}`
                    );

                }

            }


            /*
               Mit System Manager verbinden.
            */

            if (
                this.system &&
                record.module &&
                typeof this.system.registerModule ===
                "function"
            ) {

                try {

                    this.system.registerModule(
                        name,
                        record.module,
                        {

                            version:
                                record.version,

                            critical:
                                record.critical,

                            enabled:
                                record.enabled

                        }
                    );

                } catch (error) {

                    this.handleError(
                        error,
                        `System registration: ${name}`
                    );

                }

            }


            this.emit(
                "module-registered",
                record
            );


            this.log(
                `Modul registriert: ${name}`
            );


            return true;

        },


        /* ====================================================
           MODUL SUCHEN
           ==================================================== */

        get(
            name
        ) {


            return this.modules.get(
                name
            ) || null;

        },


        /* ====================================================
           MODUL PRÜFEN
           ==================================================== */

        has(
            name
        ) {


            return this.modules.has(
                name
            );

        },


        /* ====================================================
           ABHÄNGIGKEITEN PRÜFEN
           ==================================================== */

        checkDependencies(
            record
        ) {


            if (
                !record.dependencies ||
                record.dependencies.length ===
                0
            ) {

                return {

                    valid:
                        true,

                    missing:
                        []

                };

            }


            const missing =
                record.dependencies.filter(
                    dependency =>
                        !this.modules.has(
                            dependency
                        )
                );


            return {

                valid:
                    missing.length ===
                    0,

                missing

            };

        },


        /* ====================================================
           MODUL INITIALISIEREN
           ==================================================== */

        async initializeModule(
            name
        ) {


            const record =
                this.get(
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

                record.status =
                    "DISABLED";


                return false;

            }


            if (
                record.initialized
            ) {

                return true;

            }


            /*
               Abhängigkeiten prüfen.
            */

            const dependencyCheck =
                this.checkDependencies(
                    record
                );


            if (
                !dependencyCheck.valid
            ) {

                record.status =
                    "WAITING_DEPENDENCIES";


                record.error =
                    `Fehlende Abhängigkeiten: ${
                        dependencyCheck.missing.join(
                            ", "
                        )
                    }`;


                this.emit(
                    "dependency-error",
                    record
                );


                this.log(
                    record.error
                );


                return false;

            }


            record.status =
                "INITIALIZING";


            this.emit(
                "module-initializing",
                record
            );


            try {


                if (
                    record.module &&
                    typeof record.module.initialize ===
                    "function"
                ) {

                    await Promise.resolve(
                        record.module.initialize(
                            this
                        )
                    );

                }


                record.initialized =
                    true;


                record.initializedAt =
                    Date.now();


                record.status =
                    "INITIALIZED";


                this.emit(
                    "module-initialized",
                    record
                );


                this.log(
                    `Modul initialisiert: ${name}`
                );


                return true;


            } catch (error) {


                record.status =
                    "ERROR";


                record.error =
                    error.message ||
                    String(error);


                this.handleError(
                    error,
                    `Module initialization: ${name}`
                );


                this.emit(
                    "module-error",
                    record
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
           MODUL STARTEN
           ==================================================== */

        async startModule(
            name
        ) {


            const record =
                this.get(
                    name
                );


            if (
                !record
            ) {

                return false;

            }


            if (
                !record.enabled
            ) {

                return false;

            }


            if (
                !record.initialized
            ) {

                const initialized =
                    await this.initializeModule(
                        name
                    );


                if (
                    !initialized
                ) {

                    return false;

                }

            }


            if (
                record.started
            ) {

                return true;

            }


            record.status =
                "STARTING";


            this.emit(
                "module-starting",
                record
            );


            try {


                if (
                    record.module &&
                    typeof record.module.start ===
                    "function"
                ) {

                    await Promise.resolve(
                        record.module.start(
                            this
                        )
                    );

                }


                record.started =
                    true;


                record.startedAt =
                    Date.now();


                record.status =
                    "RUNNING";


                this.emit(
                    "module-started",
                    record
                );


                this.log(
                    `Modul gestartet: ${name}`
                );


                return true;


            } catch (error) {


                record.status =
                    "ERROR";


                record.error =
                    error.message ||
                    String(error);


                this.handleError(
                    error,
                    `Module start: ${name}`
                );


                return false;

            }

        },


        /* ====================================================
           ALLE MODULE STARTEN
           ==================================================== */

        async startAll() {


            const results = [];


            /*
               loadOrder garantiert eine
               nachvollziehbare Reihenfolge.
            */

            for (
                const name of this.loadOrder
            ) {


                const record =
                    this.get(
                        name
                    );


                if (
                    !record ||
                    !record.autoStart
                ) {

                    continue;

                }


                try {


                    const success =
                        await this.startModule(
                            name
                        );


                    results.push({

                        name,

                        success

                    });


                } catch (error) {


                    results.push({

                        name,

                        success:
                            false,

                        error:
                            error.message ||
                            String(error)

                    });


                    if (
                        record.critical
                    ) {

                        throw error;

                    }

                }

            }


            this.emit(
                "all-modules-started",
                results
            );


            return results;

        },


        /* ====================================================
           MODUL STOPPEN
           ==================================================== */

        async stopModule(
            name
        ) {


            const record =
                this.get(
                    name
                );


            if (
                !record
            ) {

                return false;

            }


            if (
                !record.started
            ) {

                return true;

            }


            record.status =
                "STOPPING";


            try {


                if (
                    record.module &&
                    typeof record.module.stop ===
                    "function"
                ) {

                    await Promise.resolve(
                        record.module.stop(
                            this
                        )
                    );

                }


                record.started =
                    false;


                record.status =
                    "STOPPED";


                this.emit(
                    "module-stopped",
                    record
                );


                this.log(
                    `Modul gestoppt: ${name}`
                );


                return true;


            } catch (error) {


                record.status =
                    "ERROR";


                record.error =
                    error.message ||
                    String(error);


                this.handleError(
                    error,
                    `Module stop: ${name}`
                );


                return false;

            }

        },


        /* ====================================================
           ALLE MODULE STOPPEN
           ==================================================== */

        async stopAll() {


            /*
               Rückwärtsreihenfolge:
               zuletzt gestartetes Modul
               wird zuerst gestoppt.
            */

            const reversed =
                [
                    ...this.loadOrder
                ].reverse();


            const results = [];


            for (
                const name of reversed
            ) {


                const success =
                    await this.stopModule(
                        name
                    );


                results.push({

                    name,

                    success

                });

            }


            this.emit(
                "all-modules-stopped",
                results
            );


            return results;

        },


        /* ====================================================
           MODUL DEAKTIVIEREN
           ==================================================== */

        async disable(
            name
        ) {


            const record =
                this.get(
                    name
                );


            if (
                !record
            ) {

                return false;

            }


            if (
                record.started
            ) {

                await this.stopModule(
                    name
                );

            }


            record.enabled =
                false;


            record.status =
                "DISABLED";


            this.emit(
                "module-disabled",
                record
            );


            return true;

        },


        /* ====================================================
           MODUL AKTIVIEREN
           ==================================================== */

        async enable(
            name
        ) {


            const record =
                this.get(
                    name
                );


            if (
                !record
            ) {

                return false;

            }


            record.enabled =
                true;


            record.status =
                "REGISTERED";


            this.emit(
                "module-enabled",
                record
            );


            return true;

        },


        /* ====================================================
           MODUL ENTFERNEN
           ==================================================== */

        async unregister(
            name
        ) {


            const record =
                this.get(
                    name
                );


            if (
                !record
            ) {

                return false;

            }


            if (
                record.started
            ) {

                await this.stopModule(
                    name
                );

            }


            this.modules.delete(
                name
            );


            const index =
                this.loadOrder.indexOf(
                    name
                );


            if (
                index !== -1
            ) {

                this.loadOrder.splice(
                    index,
                    1
                );

            }


            if (
                this.kernel &&
                typeof this.kernel.unregisterModule ===
                "function"
            ) {

                this.kernel.unregisterModule(
                    name
                );

            }


            this.emit(
                "module-unregistered",
                {

                    name

                }
            );


            this.log(
                `Modul entfernt: ${name}`
            );


            return true;

        },


        /* ====================================================
           STATUS
           ==================================================== */

        getStatus() {


            const all =
                [
                    ...this.modules.values()
                ];


            return {

                name:
                    this.name,

                version:
                    this.version,

                status:
                    this.status,

                initialized:
                    this.initialized,

                total:
                    all.length,

                registered:
                    all.filter(
                        module =>
                            module.status ===
                            "REGISTERED"
                    ).length,

                initializedModules:
                    all.filter(
                        module =>
                            module.initialized
                    ).length,

                running:
                    all.filter(
                        module =>
                            module.started
                    ).length,

                disabled:
                    all.filter(
                        module =>
                            !module.enabled
                    ).length,

                errors:
                    all.filter(
                        module =>
                            module.status ===
                            "ERROR"
                    ).length

            };

        },


        /* ====================================================
           ALLE MODULE
           ==================================================== */

        getAll() {


            return [
                ...this.modules.values()
            ];

        },


        /* ====================================================
           MODULE NACH KATEGORIE
           ==================================================== */

        getByCategory(
            category
        ) {


            return [
                ...this.modules.values()
            ].filter(
                module =>
                    module.category ===
                    category
            );

        },


        /* ====================================================
           EVENT: ON
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
           EVENT: OFF
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
           EVENT: EMIT
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
           FEHLERBEHANDLUNG
           ==================================================== */

        handleError(
            error,
            source = "Module Manager"
        ) {


            console.error(
                "[HalDo Module Manager]",
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
                    "[HalDo Module Manager]",
                    message,
                    data
                );

            } else {

                console.log(
                    "[HalDo Module Manager]",
                    message
                );

            }

        }

    };


    /* ========================================================
       GLOBAL API
       ======================================================== */

    window.HalDoModuleManager =
        HalDoModuleManager;


    if (
        !window.HalDo
    ) {

        window.HalDo = {};

    }


    window.HalDo.modules =
        HalDoModuleManager;


    /* ========================================================
       INITIALISIERUNG
       ======================================================== */

    function initializeModuleManager() {


        /*
           Core-Systeme können bei sehr schneller
           Browserinitialisierung noch nicht vorhanden sein.
        */

        HalDoModuleManager.connectCore();

        HalDoModuleManager.initialize();


        /*
           Falls System später verfügbar wird,
           erneut verbinden.
        */

        window.setTimeout(
            () => {

                HalDoModuleManager.connectCore();

            },
            100
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeModuleManager,
            {
                once: true
            }
        );

    } else {

        initializeModuleManager();

    }


    /* ========================================================
       CONSOLE
       ======================================================== */

    console.log(
        "=============================================="
    );

    console.log(
        "HalDo AI OS 18 Module Manager"
    );

    console.log(
        "Professional Ultimate Foundation"
    );

    console.log(
        "Module Manager geladen."
    );

    console.log(
        "=============================================="
    );


})(window);