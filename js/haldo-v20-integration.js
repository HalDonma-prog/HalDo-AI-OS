/*
 * ============================================================
 * HalDo AI OS 20
 * V20 Integration Coordinator
 * ============================================================
 *
 * Datei:
 *   js/haldo-v20-integration.js
 *
 * Zweck:
 *   Zentrale Verbindung der bereits vorhandenen V20-Systeme:
 *
 *      Kernel
 *         │
 *         ▼
 *      V20 Bridge
 *         │
 *         ├── Service Bridge
 *         │
 *         └── Universal App Event Bus
 *                    │
 *                    ├── App Registry
 *                    ├── App Runtime
 *                    ├── Apps
 *                    ├── AI
 *                    ├── Voice
 *                    ├── Cosmic
 *                    └── System
 *
 * WICHTIG:
 *
 *   Diese Datei ersetzt kein bestehendes System.
 *
 *   Sie:
 *     - erkennt vorhandene Bridges
 *     - verbindet deren APIs
 *     - stellt einen stabilen gemeinsamen V20-Kontext bereit
 *     - verhindert unnötige Überschreibungen
 *     - synchronisiert wichtige System-Events
 *
 * ============================================================
 */

(function (window, document) {

    "use strict";


    /* ========================================================
       GLOBAL NAMESPACES
    ======================================================== */

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};


    /*
     * WICHTIG:
     *
     * HalDoV20 darf nicht blind durch eine neue Objektinstanz
     * ersetzt werden.
     *
     * Dadurch können Service Bridge, Event Bus und weitere
     * V20-Systeme dieselbe Namespace-Struktur verwenden.
     */

    const V20 =
        window.HalDoV20 =
        window.HalDoV20 || {};


    /* ========================================================
       INTEGRATION OBJECT
    ======================================================== */

    const Integration = {

        name:
            "HalDo V20 Integration Coordinator",

        version:
            "20.0.0",

        ready:
            false,

        connected:
            false,

        timestamp:
            null
    };


    /* ========================================================
       INTERNAL STATE
    ======================================================== */

    const connections =
        new Map();


    const listeners =
        new Map();


    let eventSequence =
        0;


    /* ========================================================
       LOGGING
    ======================================================== */

    function log() {

        try {

            console.log(
                "%c[HalDo AI OS 20]",
                "font-weight:bold;",
                ...arguments
            );

        } catch (error) {
            /* Safe fallback */
        }
    }


    function warn() {

        try {

            console.warn(
                "[HalDo AI OS 20]",
                ...arguments
            );

        } catch (error) {
            /* Safe fallback */
        }
    }


    function error() {

        try {

            console.error(
                "[HalDo AI OS 20]",
                ...arguments
            );

        } catch (err) {
            /* Safe fallback */
        }
    }


    /* ========================================================
       INTERNAL EVENT SYSTEM
    ======================================================== */

    Integration.on =
        function (
            eventName,
            handler
        ) {

            if (
                !eventName ||
                typeof handler !==
                "function"
            ) {

                return function () {};
            }


            const name =
                String(
                    eventName
                );


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


            const set =
                listeners.get(
                    name
                );


            set.add(
                handler
            );


            return function () {

                set.delete(
                    handler
                );

            };
        };


    Integration.emit =
        function (
            eventName,
            data
        ) {

            const event = {

                id:
                    "v20-integration-" +
                    Date.now() +
                    "-" +
                    (++eventSequence),

                name:
                    String(
                        eventName || ""
                    ),

                data:
                    data,

                source:
                    "haldo-v20-integration",

                timestamp:
                    Date.now()
            };


            const set =
                listeners.get(
                    event.name
                );


            if (set) {

                Array.from(
                    set
                )
                .forEach(
                    function (
                        handler
                    ) {

                        try {

                            handler(
                                event
                            );

                        } catch (handlerError) {

                            error(
                                "Integration Event Handler Fehler:",
                                handlerError
                            );
                        }

                    }
                );
            }


            return event;
        };


    /* ========================================================
       SAFE GLOBAL LOOKUP
    ======================================================== */

    function getGlobal(
        name
    ) {

        if (
            !name
        ) {

            return null;
        }


        try {

            const parts =
                String(
                    name
                ).split(".");


            let current =
                window;


            for (
                let i = 0;
                i < parts.length;
                i++
            ) {

                if (
                    current ===
                    null ||
                    current ===
                    undefined
                ) {

                    return null;
                }


                current =
                    current[
                        parts[i]
                    ];
            }


            return current ||
                null;

        } catch (lookupError) {

            return null;
        }
    }


    /* ========================================================
       REGISTER CONNECTION
    ======================================================== */

    function connect(
        name,
        service,
        source
    ) {

        if (
            !name ||
            !service
        ) {

            return false;
        }


        connections.set(
            name,
            {

                name:
                    name,

                service:
                    service,

                source:
                    source ||
                    "unknown",

                connectedAt:
                    Date.now()
            }
        );


        return true;
    }


    /* ========================================================
       CONNECT V20 BRIDGE
    ======================================================== */

    function connectV20Bridge() {

        /*
         * Das zentrale V20 Bridge-System kann entweder
         * direkt oder über HalDoOS.v20 vorhanden sein.
         */

        let bridge =
            getGlobal(
                "HalDoV20"
            );


        /*
         * Falls HalDoV20 aktuell ein Bridge-Objekt ist,
         * verwenden wir es direkt.
         */

        if (
            bridge &&
            typeof bridge ===
            "object"
        ) {

            /*
             * Eine echte V20 Bridge erkennt man unter anderem
             * an discoverSystems(), status() oder openApp().
             */

            if (
                typeof bridge.discoverSystems ===
                "function" ||
                typeof bridge.status ===
                "function" ||
                typeof bridge.openApp ===
                "function"
            ) {

                connect(
                    "v20-bridge",
                    bridge,
                    "window.HalDoV20"
                );

                return bridge;
            }
        }


        /*
         * Alternative HalDoOS.v20.
         */

        bridge =
            HalDoOS.v20;


        if (
            bridge &&
            typeof bridge ===
            "object"
        ) {

            connect(
                "v20-bridge",
                bridge,
                "HalDoOS.v20"
            );


            return bridge;
        }


        return null;
    }


    /* ========================================================
       CONNECT SERVICE BRIDGE
    ======================================================== */

    function connectServiceBridge() {

        const serviceBridge =
            getGlobal(
                "HalDoV20ServiceBridge"
            );


        if (
            serviceBridge &&
            typeof serviceBridge ===
            "object"
        ) {

            connect(
                "service-bridge",
                serviceBridge,
                "window.HalDoV20ServiceBridge"
            );


            /*
             * Falls HalDoV20 ein Objekt ist,
             * Service Bridge dort ergänzen.
             *
             * Bestehende Eigenschaften werden nicht entfernt.
             */

            if (
                typeof V20 ===
                "object"
            ) {

                if (
                    !V20.serviceBridge
                ) {

                    V20.serviceBridge =
                        serviceBridge;
                }
            }


            if (
                !HalDoOS.serviceBridge
            ) {

                HalDoOS.serviceBridge =
                    serviceBridge;
            }


            return serviceBridge;
        }


        return null;
    }


    /* ========================================================
       CONNECT EVENT BUS
    ======================================================== */

    function connectEventBus() {

        const eventBus =
            getGlobal(
                "HalDoAppEvents"
            );


        if (
            eventBus &&
            typeof eventBus ===
            "object"
        ) {

            connect(
                "app-events",
                eventBus,
                "window.HalDoAppEvents"
            );


            /*
             * Gemeinsame V20-Namespace-Verbindung.
             */

            if (
                !V20.appEvents
            ) {

                V20.appEvents =
                    eventBus;
            }


            if (
                !HalDoOS.appEvents
            ) {

                HalDoOS.appEvents =
                    eventBus;
            }


            return eventBus;
        }


        return null;
    }


    /* ========================================================
       CONNECT KERNEL
    ======================================================== */

    function connectKernel() {

        const kernel =
            getGlobal(
                "HalDoKernel"
            ) ||
            getGlobal(
                "HalDoOS.kernel"
            );


        if (
            kernel
        ) {

            connect(
                "kernel",
                kernel,
                "existing-kernel"
            );


            /*
             * Der bestehende Kernel bleibt vollständig erhalten.
             */

            if (
                !HalDoOS.kernel
            ) {

                HalDoOS.kernel =
                    kernel;
            }


            return kernel;
        }


        return null;
    }


    /* ========================================================
       CONNECT RUNTIME
    ======================================================== */

    function connectRuntime() {

        const runtime =
            getGlobal(
                "HalDoAppRuntime"
            ) ||
            getGlobal(
                "HalDoV20.appRuntime"
            );


        if (
            runtime
        ) {

            connect(
                "app-runtime",
                runtime,
                "existing-runtime"
            );


            return runtime;
        }


        return null;
    }


    /* ========================================================
       CONNECT REGISTRY
    ======================================================== */

    function connectRegistry() {

        const registry =
            getGlobal(
                "HalDoV20AppRegistry"
            ) ||
            getGlobal(
                "HalDoOS.appRegistry"
            );


        if (
            registry
        ) {

            connect(
                "app-registry",
                registry,
                "existing-registry"
            );


            return registry;
        }


        return null;
    }


    /* ========================================================
       CONNECT IMPORTANT SYSTEMS
    ======================================================== */

    function connectSystems() {

        const systems = {

            system:
                getGlobal(
                    "HalDoSystem"
                ) ||
                getGlobal(
                    "HalDoOS.system"
                ),

            ai:
                getGlobal(
                    "HalDoAI"
                ) ||
                getGlobal(
                    "HalDoAICore"
                ) ||
                getGlobal(
                    "HalDoOS.ai"
                ),

            voice:
                getGlobal(
                    "HalDoVoice"
                ) ||
                getGlobal(
                    "HalDoOS.voice"
                ),

            speech:
                getGlobal(
                    "HalDoSpeech"
                ) ||
                getGlobal(
                    "HalDoOS.speech"
                ),

            cosmic:
                getGlobal(
                    "HalDoCosmicEngine"
                ) ||
                getGlobal(
                    "HalDoCosmic"
                ) ||
                getGlobal(
                    "HalDoOS.cosmic"
                ),

            cosmicWelcome:
                getGlobal(
                    "HalDoCosmicWelcome"
                ) ||
                getGlobal(
                    "HalDoOS.cosmicWelcome"
                ),

            notifications:
                getGlobal(
                    "HalDoNotifications"
                ) ||
                getGlobal(
                    "HalDoOS.notifications"
                ),

            storage:
                getGlobal(
                    "HalDoStorage"
                ) ||
                getGlobal(
                    "HalDoStorageManager"
                ) ||
                getGlobal(
                    "HalDoOS.storage"
                ),

            language:
                getGlobal(
                    "HalDoLanguageManager"
                ) ||
                getGlobal(
                    "HalDoLanguageSystem"
                ) ||
                getGlobal(
                    "HalDoLanguage"
                ) ||
                getGlobal(
                    "HalDoOS.language"
                ),

            windowManager:
                getGlobal(
                    "HalDoWindowManager"
                ) ||
                getGlobal(
                    "HalDoOS.windowManager"
                ),

            appManager:
                getGlobal(
                    "HalDoAppManager"
                ) ||
                getGlobal(
                    "HalDoOS.appManager"
                )
        };


        Object.keys(
            systems
        )
        .forEach(
            function (
                name
            ) {

                if (
                    systems[name]
                ) {

                    connect(
                        name,
                        systems[name],
                        "existing-system"
                    );
                }

            }
        );


        return systems;
    }


    /* ========================================================
       SYNC EVENT BUS
    ======================================================== */

    function setupEventSynchronization(
        eventBus,
        serviceBridge,
        v20Bridge
    ) {

        if (
            !eventBus
        ) {

            return;
        }


        /*
         * Event Bus → V20 Bridge
         */

        if (
            typeof eventBus.on ===
            "function"
        ) {

            const importantEvents = [

                "app:registered",

                "app:started",

                "app:stopped",

                "app:state-changed",

                "language:changed",

                "theme:changed",

                "settings:changed",

                "ai:message",

                "ai:response",

                "voice:started",

                "voice:stopped",

                "cosmic:state-changed",

                "cosmic:event",

                "cosmic:welcome",

                "notification:show",

                "system:error"
            ];


            importantEvents.forEach(
                function (
                    eventName
                ) {

                    try {

                        eventBus.on(
                            eventName,
                            function (
                                event
                            ) {

                                Integration.emit(
                                    "event:" +
                                    eventName,
                                    event
                                );

                            }
                        );

                    } catch (eventError) {

                        warn(
                            "Event-Synchronisierung fehlgeschlagen:",
                            eventName
                        );
                    }

                }
            );
        }


        /*
         * Service Bridge → Event Bus
         */

        if (
            serviceBridge &&
            typeof serviceBridge.on ===
            "function"
        ) {

            try {

                serviceBridge.on(
                    "bridge:ready",
                    function (
                        event
                    ) {

                        if (
                            typeof eventBus.emit ===
                            "function"
                        ) {

                            eventBus.emit(
                                "system:service-bridge-ready",
                                event,
                                {

                                    source:
                                        "v20-integration",

                                    internal:
                                        true
                                }
                            );
                        }

                    }
                );

            } catch (serviceError) {

                warn(
                    "Service Bridge Event-Verbindung fehlgeschlagen."
                );
            }
        }


        /*
         * V20 Bridge → Event Bus
         */

        if (
            v20Bridge &&
            typeof v20Bridge.on ===
            "function"
        ) {

            try {

                v20Bridge.on(
                    "v20:ready",
                    function (
                        event
                    ) {

                        if (
                            typeof eventBus.emit ===
                            "function"
                        ) {

                            eventBus.emit(
                                "system:v20-bridge-ready",
                                event,
                                {

                                    source:
                                        "v20-integration",

                                    internal:
                                        true
                                }
                            );
                        }

                    }
                );

            } catch (bridgeError) {

                warn(
                    "V20 Bridge Event-Verbindung fehlgeschlagen."
                );
            }
        }
    }


    /* ========================================================
       CREATE UNIFIED CONTEXT
    ======================================================== */

    Integration.getContext =
        function () {

            const context = {

                version:
                    Integration.version,

                integration:
                    Integration,

                kernel:
                    connections.has(
                        "kernel"
                    )
                        ? connections.get(
                            "kernel"
                        ).service
                        : null,

                bridge:
                    connections.has(
                        "v20-bridge"
                    )
                        ? connections.get(
                            "v20-bridge"
                        ).service
                        : null,

                serviceBridge:
                    connections.has(
                        "service-bridge"
                    )
                        ? connections.get(
                            "service-bridge"
                        ).service
                        : null,

                appEvents:
                    connections.has(
                        "app-events"
                    )
                        ? connections.get(
                            "app-events"
                        ).service
                        : null,

                appRuntime:
                    connections.has(
                        "app-runtime"
                    )
                        ? connections.get(
                            "app-runtime"
                        ).service
                        : null,

                appRegistry:
                    connections.has(
                        "app-registry"
                    )
                        ? connections.get(
                            "app-registry"
                        ).service
                        : null,

                system:
                    connections.has(
                        "system"
                    )
                        ? connections.get(
                            "system"
                        ).service
                        : null,

                ai:
                    connections.has(
                        "ai"
                    )
                        ? connections.get(
                            "ai"
                        ).service
                        : null,

                voice:
                    connections.has(
                        "voice"
                    )
                        ? connections.get(
                            "voice"
                        ).service
                        : null,

                speech:
                    connections.has(
                        "speech"
                    )
                        ? connections.get(
                            "speech"
                        ).service
                        : null,

                cosmic:
                    connections.has(
                        "cosmic"
                    )
                        ? connections.get(
                            "cosmic"
                        ).service
                        : null,

                cosmicWelcome:
                    connections.has(
                        "cosmicWelcome"
                    )
                        ? connections.get(
                            "cosmicWelcome"
                        ).service
                        : null,

                notifications:
                    connections.has(
                        "notifications"
                    )
                        ? connections.get(
                            "notifications"
                        ).service
                        : null,

                storage:
                    connections.has(
                        "storage"
                    )
                        ? connections.get(
                            "storage"
                        ).service
                        : null,

                language:
                    connections.has(
                        "language"
                    )
                        ? connections.get(
                            "language"
                        ).service
                        : null,

                windowManager:
                    connections.has(
                        "windowManager"
                    )
                        ? connections.get(
                            "windowManager"
                        ).service
                        : null,

                appManager:
                    connections.has(
                        "appManager"
                    )
                        ? connections.get(
                            "appManager"
                        ).service
                        : null
            };


            return context;
        };


    /* ========================================================
       STATUS
    ======================================================== */

    Integration.getStatus =
        function () {

            const connectedServices =
                Array.from(
                    connections.keys()
                );


            return {

                name:
                    Integration.name,

                version:
                    Integration.version,

                ready:
                    Integration.ready,

                connected:
                    Integration.connected,

                services:
                    connectedServices,

                serviceCount:
                    connectedServices.length,

                timestamp:
                    Integration.timestamp
            };
        };


    /* ========================================================
       INITIALIZE
    ======================================================== */

    Integration.init =
        function () {

            if (
                Integration.ready
            ) {

                return Integration;
            }


            log(
                "V20 Integration Coordinator startet..."
            );


            /*
             * Zuerst vorhandene Systeme erfassen.
             */

            connectKernel();


            connectV20Bridge();


            connectServiceBridge();


            connectEventBus();


            connectRuntime();


            connectRegistry();


            connectSystems();


            /*
             * Erneut Event Bus holen.
             *
             * Einige Systeme werden erst während
             * ihres eigenen Boot-Vorgangs sichtbar.
             */

            const eventBus =
                getGlobal(
                    "HalDoAppEvents"
                );


            const serviceBridge =
                getGlobal(
                    "HalDoV20ServiceBridge"
                );


            const v20Bridge =
                getGlobal(
                    "HalDoV20"
                );


            setupEventSynchronization(
                eventBus,
                serviceBridge,
                v20Bridge
            );


            /*
             * Gemeinsamen Kontext bereitstellen.
             */

            V20.integration =
                Integration;


            HalDoOS.v20Integration =
                Integration;


            window.HalDoV20Integration =
                Integration;


            Integration.ready =
                true;


            Integration.connected =
                true;


            Integration.timestamp =
                Date.now();


            /*
             * System Event.
             */

            if (
                eventBus &&
                typeof eventBus.emit ===
                "function"
            ) {

                try {

                    eventBus.emit(
                        "system:v20-integration-ready",
                        Integration.getStatus(),
                        {

                            source:
                                "v20-integration",

                            internal:
                                true
                        }
                    );

                } catch (eventError) {

                    warn(
                        "Integration Ready Event konnte nicht gesendet werden."
                    );
                }
            }


            Integration.emit(
                "ready",
                Integration.getStatus()
            );


            log(
                "V20 Integration Coordinator bereit.",
                Integration.getStatus()
            );


            return Integration;
        };


    /* ========================================================
       BOOT
    ======================================================== */

    function boot() {

        try {

            Integration.init();

        } catch (bootError) {

            error(
                "V20 Integration Startfehler:",
                bootError
            );
        }
    }


    /* ========================================================
       GLOBAL API
    ======================================================== */

    /*
     * Nicht überschreiben, falls eine bestehende Integration
     * vorhanden ist.
     */

    if (
        !window.HalDoV20Integration
    ) {

        window.HalDoV20Integration =
            Integration;
    }


    if (
        !HalDoOS.v20Integration
    ) {

        HalDoOS.v20Integration =
            Integration;
    }


    if (
        !V20.integration
    ) {

        V20.integration =
            Integration;
    }


    /* ========================================================
       DOM READY
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

    } else {

        boot();
    }


})(window, document);
