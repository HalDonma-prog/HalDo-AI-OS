/*
==========================================
HalDo AI OS 18
SYSTEM STATUS
Professional Ultimate Foundation
Version 18.0.0

Erweiterte zentrale Systemdiagnose

Verbindet / prüft:
Kernel
System
Boot
Module
Apps
Router
Launcher
Storage
Configuration
AI
Voice
Speech
Memory
Commands
Language
Êzîdî Keyboard
Window Manager
Logo
Startup
Network
HalDoOS Global API
==========================================
*/

(function () {

    "use strict";


    /* ======================================================
       SAFE HELPERS
       ====================================================== */

    function exists(name) {

        return (
            typeof window[name] !== "undefined" &&
            window[name] !== null
        );

    }


    function isFunction(
        object,
        method
    ) {

        return (
            object &&
            typeof object[method] === "function"
        );

    }


    function now() {

        return new Date();

    }


    /* ======================================================
       HALDO SYSTEM STATUS
       ====================================================== */

    const HalDoSystemStatus = {

        version: "18.0.0",

        state: "starting",

        modules: {},

        connections: {},

        errors: [],

        warnings: [],

        lastCheck: null,

        initialized: false,

        bootTime: null,


        /* ==================================================
           INIT
           ================================================== */

        init() {

            if (this.initialized) {

                this.check();

                return this.getStatus();

            }


            this.bootTime = now();

            this.initialized = true;

            this.check();


            this.emit(
                "system-status:ready",
                this.getStatus()
            );


            console.log(
                "📡 HalDo System Status bereit"
            );


            return this.getStatus();

        },


        /* ==================================================
           GLOBAL EXISTENCE
           ================================================== */

        exists(name) {

            return exists(name);

        },


        /* ==================================================
           MODULE CHECK
           ================================================== */

        checkModules() {

            this.modules = {

                boot:
                    exists(
                        "HalDoBoot"
                    ),

                kernel:
                    exists(
                        "HalDoKernel"
                    ),

                system:
                    exists(
                        "HalDoSystem"
                    ),

                moduleManager:
                    exists(
                        "HalDoModuleManager"
                    ),

                appRegistry:
                    exists(
                        "HalDoAppRegistry"
                    ),

                appManager:
                    exists(
                        "HalDoAppManager"
                    ),

                appRouter:
                    exists(
                        "HalDoAppRouter"
                    ),

                appLauncher:
                    exists(
                        "HalDoAppLauncher"
                    ),

                launcher:
                    exists(
                        "HalDoLauncher"
                    ),

                storage:
                    exists(
                        "HalDoStorage"
                    ),

                storageManager:
                    exists(
                        "HalDoStorageManager"
                    ),

                config:
                    exists(
                        "HalDoConfig"
                    ) ||
                    exists(
                        "HalDoConfigManager"
                    ),

                ai:
                    exists(
                        "HalDoAI"
                    ),

                aiCore:
                    exists(
                        "HalDoAICore"
                    ),

                aiEngine:
                    exists(
                        "HalDoAIEngine"
                    ),

                chat:
                    exists(
                        "HalDoChat"
                    ),

                speech:
                    exists(
                        "HalDoSpeech"
                    ),

                voice:
                    exists(
                        "HalDoVoice"
                    ),

                memory:
                    exists(
                        "HalDoMemory"
                    ),

                commands:
                    exists(
                        "HalDoCommands"
                    ),

                conversation:
                    exists(
                        "HalDoConversationState"
                    ),

                language:
                    exists(
                        "HalDoLanguageSystem"
                    ),

                languageManager:
                    exists(
                        "HalDoLanguageManager"
                    ),

                ezidiKeyboard:
                    exists(
                        "HalDoEzidiKeyboard"
                    ),

                windowManager:
                    exists(
                        "HalDoWindowManager"
                    ),

                logoAnimation:
                    exists(
                        "HalDoLogoAnimationManager"
                    ),

                logoIntro:
                    exists(
                        "HalDoLogoIntroManager"
                    ),

                lightSystem:
                    exists(
                        "HalDoLightSystem"
                    ),

                shell:
                    exists(
                        "HalDoShellManager"
                    ),

                systemLoader:
                    exists(
                        "HalDoSystemLoader"
                    ),

                startup:
                    exists(
                        "HalDoStartup"
                    )

            };


            return this.modules;

        },


        /* ==================================================
           CONNECTION CHECK
           ================================================== */

        checkConnections() {

            const kernel =
                window.HalDoKernel;


            const system =
                window.HalDoSystem;


            const appManager =
                window.HalDoAppManager;


            const appRouter =
                window.HalDoAppRouter;


            const ai =
                window.HalDoAI;


            const language =
                window.HalDoLanguageSystem;


            this.connections = {

                kernelAPI:
                    !!kernel,

                kernelEvents:
                    !!(
                        kernel &&
                        isFunction(
                            kernel,
                            "on"
                        )
                    ),

                kernelEmit:
                    !!(
                        kernel &&
                        isFunction(
                            kernel,
                            "emit"
                        )
                    ),

                systemAPI:
                    !!system,

                systemKernel:
                    !!(
                        system &&
                        (
                            system.kernel ||
                            system._kernel
                        )
                    ),

                appManagerAPI:
                    !!appManager,

                appManagerInit:
                    !!(
                        appManager &&
                        isFunction(
                            appManager,
                            "init"
                        )
                    ),

                appRouterAPI:
                    !!appRouter,

                appRouterInit:
                    !!(
                        appRouter &&
                        isFunction(
                            appRouter,
                            "init"
                        )
                    ),

                aiAPI:
                    !!ai,

                aiSendMessage:
                    !!(
                        ai &&
                        (
                            isFunction(
                                ai,
                                "sendMessage"
                            ) ||
                            isFunction(
                                ai,
                                "chat"
                            )
                        )
                    ),

                languageAPI:
                    !!language,

                languageMethods:
                    !!(
                        language &&
                        (
                            isFunction(
                                language,
                                "setLanguage"
                            ) ||
                            isFunction(
                                language,
                                "changeLanguage"
                            ) ||
                            isFunction(
                                language,
                                "translate"
                            )
                        )
                    ),

                haldoOS:
                    !!window.HalDoOS,

                haldoOSEvents:
                    !!(
                        window.HalDoOS &&
                        window.HalDoOS.events
                    ),

                haldoOSApps:
                    !!(
                        window.HalDoOS &&
                        window.HalDoOS.apps
                    ),

                haldoOSUI:
                    !!(
                        window.HalDoOS &&
                        window.HalDoOS.ui
                    )

            };


            return this.connections;

        },


        /* ==================================================
           NETWORK
           ================================================== */

        checkNetwork() {

            return {

                online:
                    navigator.onLine,

                protocol:
                    location.protocol,

                host:
                    location.host,

                secure:
                    location.protocol ===
                    "https:"

            };

        },


        /* ==================================================
           DOM CHECK
           ================================================== */

        checkDOM() {

            const requiredElements = [

                "haldo-app-data",

                "haldo-system-config",

                "haldo-clock-widget",

                "haldo-system-widget",

                "haldo-ai-widget",

                "haldo-desktop-ai-form",

                "haldo-desktop-ai-input",

                "haldo-global-search",

                "haldo-quick-panel",

                "haldo-notification-center",

                "haldo-global-loading"

            ];


            const result = {};

            let loaded = 0;


            requiredElements.forEach(
                function (id) {

                    const present =
                        !!document.getElementById(id);


                    result[id] =
                        present;


                    if (present) {
                        loaded++;
                    }

                }
            );


            return {

                elements:
                    result,

                loaded:
                    loaded,

                total:
                    requiredElements.length,

                complete:
                    loaded ===
                    requiredElements.length

            };

        },


        /* ==================================================
           MAIN CHECK
           ================================================== */

        check() {

            this.lastCheck =
                now();


            this.errors = [];

            this.warnings = [];


            this.checkModules();

            this.checkConnections();


            const network =
                this.checkNetwork();


            const dom =
                this.checkDOM();


            const values =
                Object.values(
                    this.modules
                );


            const loaded =
                values.filter(
                    Boolean
                ).length;


            const total =
                values.length;


            const connectionValues =
                Object.values(
                    this.connections
                );


            const connected =
                connectionValues.filter(
                    Boolean
                ).length;


            const connectionTotal =
                connectionValues.length;


            /* ==============================================
               WARNINGS
               ============================================== */

            if (!this.modules.kernel) {

                this.errors.push(
                    "Kernel nicht verfügbar"
                );

            }


            if (!this.modules.system) {

                this.errors.push(
                    "Systemverwaltung nicht verfügbar"
                );

            }


            if (!this.modules.appManager) {

                this.warnings.push(
                    "App Manager nicht verfügbar"
                );

            }


            if (!this.modules.ai) {

                this.warnings.push(
                    "HalDo AI API nicht verfügbar"
                );

            }


            if (!this.modules.language) {

                this.warnings.push(
                    "Sprachsystem nicht verfügbar"
                );

            }


            if (!this.modules.ezidiKeyboard) {

                this.warnings.push(
                    "Êzîdî-Tastatur nicht verfügbar"
                );

            }


            if (!network.online) {

                this.warnings.push(
                    "Netzwerkverbindung offline"
                );

            }


            if (!dom.complete) {

                this.warnings.push(
                    "Ein oder mehrere UI-Elemente fehlen"
                );

            }


            /* ==============================================
               STATE
               ============================================== */

            if (
                this.errors.length === 0 &&
                loaded === total &&
                connected === connectionTotal
            ) {

                this.state =
                    "online";

            }
            else if (
                this.modules.kernel &&
                this.modules.system
            ) {

                this.state =
                    "partial";

            }
            else {

                this.state =
                    "offline";

            }


            return this.getStatus();

        },


        /* ==================================================
           REFRESH
           ================================================== */

        refresh() {

            return this.check();

        },


        /* ==================================================
           STATUS
           ================================================== */

        getStatus() {

            const values =
                Object.values(
                    this.modules
                );


            const loaded =
                values.filter(
                    Boolean
                ).length;


            const total =
                values.length;


            const connectionValues =
                Object.values(
                    this.connections
                );


            const connected =
                connectionValues.filter(
                    Boolean
                ).length;


            const connectionTotal =
                connectionValues.length;


            return {

                version:
                    this.version,

                state:
                    this.state,

                loaded:
                    loaded,

                total:
                    total,

                percentage:
                    total
                        ? Math.round(
                            (
                                loaded /
                                total
                            ) *
                            100
                        )
                        : 0,

                modules:
                    {
                        ...this.modules
                    },

                connections:
                    {
                        ...this.connections
                    },

                connectionStatus:
                    {
                        loaded:
                            connected,

                        total:
                            connectionTotal,

                        percentage:
                            connectionTotal
                                ? Math.round(
                                    (
                                        connected /
                                        connectionTotal
                                    ) *
                                    100
                                )
                                : 0
                    },

                network:
                    this.checkNetwork(),

                dom:
                    this.checkDOM(),

                errors:
                    [
                        ...this.errors
                    ],

                warnings:
                    [
                        ...this.warnings
                    ],

                lastCheck:
                    this.lastCheck,

                initialized:
                    this.initialized,

                bootTime:
                    this.bootTime

            };

        },


        /* ==================================================
           ONLINE
           ================================================== */

        isOnline() {

            return (
                this.state ===
                "online"
            );

        },


        /* ==================================================
           PARTIAL
           ================================================== */

        isPartial() {

            return (
                this.state ===
                "partial"
            );

        },


        /* ==================================================
           OFFLINE
           ================================================== */

        isOffline() {

            return (
                this.state ===
                "offline"
            );

        },


        /* ==================================================
           EVENT EMITTER
           ================================================== */

        emit(
            eventName,
            detail
        ) {

            try {

                if (
                    window.HalDoOS &&
                    window.HalDoOS.events &&
                    typeof
                    window.HalDoOS.events.emit ===
                    "function"
                ) {

                    window.HalDoOS.events.emit(
                        eventName,
                        detail
                    );

                }

            } catch (error) {

                console.warn(
                    "[HalDoSystemStatus] Event Fehler:",
                    error
                );

            }


            try {

                window.dispatchEvent(
                    new CustomEvent(
                        eventName,
                        {
                            detail:
                                detail
                        }
                    )
                );

            } catch (error) {}

        },


        /* ==================================================
           DIAGNOSTIC REPORT
           ================================================== */

        getDiagnosticReport() {

            const status =
                this.getStatus();


            return {

                system:
                    {
                        name:
                            "HalDo AI OS",

                        version:
                            this.version,

                        edition:
                            "Professional Ultimate Foundation"

                    },

                status:
                    status,

                timestamp:
                    now().toISOString()

            };

        },


        /* ==================================================
           EXPORT REPORT
           ================================================== */

        exportReport() {

            const report =
                this.getDiagnosticReport();


            return JSON.stringify(
                report,
                null,
                2
            );

        }

    };


    /* ======================================================
       GLOBAL API
       ====================================================== */

    window.HalDoSystemStatus =
        HalDoSystemStatus;


    window.HalDoOS =
        window.HalDoOS || {};


    window.HalDoOS.systemStatus =
        HalDoSystemStatus;


    /* ======================================================
       DOM READY
       ====================================================== */

    window.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                function () {

                    HalDoSystemStatus.init();

                },
                500
            );

        },
        {
            once: true
        }
    );


    /* ======================================================
       NETWORK EVENTS
       ====================================================== */

    window.addEventListener(
        "online",
        function () {

            HalDoSystemStatus.refresh();

        }
    );


    window.addEventListener(
        "offline",
        function () {

            HalDoSystemStatus.refresh();

        }
    );


    /* ======================================================
       PUBLIC CONSOLE HELPER
       ====================================================== */

    window.HalDoSystemDiagnostic =
        function () {

            return (
                HalDoSystemStatus
                    .getDiagnosticReport()
            );

        };


})();