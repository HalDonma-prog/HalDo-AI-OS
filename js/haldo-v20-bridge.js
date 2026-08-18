/*
 * ============================================================
 * HalDo AI OS 20
 * V20 Central Bridge
 * ============================================================
 *
 * Datei:
 *   js/haldo-v20-bridge.js
 *
 * Zweck:
 *   Zentrale defensive Verbindungs- und Kompatibilitätsschicht
 *   für HalDo AI OS 20.
 *
 * WICHTIG:
 *
 *   Diese Datei ersetzt KEIN bestehendes System.
 *
 *   Sie verbindet:
 *
 *      Kernel
 *      System
 *      App Manager
 *      App Registry
 *      App Runtime
 *      Router
 *      Launcher
 *      Window Manager
 *      Storage
 *      Language
 *      AI
 *      Voice
 *      Notifications
 *      Cosmic
 *      Service Bridge
 *      Universal App Event Bus
 *
 *   miteinander.
 *
 *   Bestehende globale APIs werden nicht blind überschrieben.
 *
 * ============================================================
 */

(function (window, document) {

    "use strict";


    /* ========================================================
       GLOBAL OBJECTS
    ======================================================== */

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};


    /*
     * Das zentrale V20-Namespace darf NICHT mehr durch diese
     * Datei ersetzt werden.
     *
     * Service Bridge und App Event Bus können bereits vorher
     * Eigenschaften daran registriert haben.
     */

    const V20 =
        window.HalDoV20 =
        window.HalDoV20 || {};


    /* ========================================================
       BRIDGE OBJECT
    ======================================================== */

    const Bridge = {

        name:
            "haldo-v20-bridge",

        version:
            "20.0.0",

        ready:
            false,

        systems:
            {},

        apps:
            new Map(),

        listeners:
            new Map(),

        config: {

            debug:
                true,

            version:
                "20.0.0"
        },

        serviceBridge:
            null,

        eventBus:
            null
    };


    /* ========================================================
       LOGGING
    ======================================================== */

    Bridge.log =
        function () {

            if (
                !Bridge.config.debug
            ) {

                return;
            }


            try {

                console.log(
                    "%c[HalDo V20]",
                    "font-weight:bold;",
                    ...arguments
                );

            } catch (error) {

                /*
                 * Logging darf niemals das System stoppen.
                 */

            }
        };


    Bridge.warn =
        function () {

            try {

                console.warn(
                    "%c[HalDo V20]",
                    "font-weight:bold;",
                    ...arguments
                );

            } catch (error) {

                /*
                 * Safe fallback.
                 */

            }
        };


    Bridge.error =
        function () {

            try {

                console.error(
                    "%c[HalDo V20]",
                    "font-weight:bold;",
                    ...arguments
                );

            } catch (error) {

                /*
                 * Safe fallback.
                 */

            }
        };


    /* ========================================================
       NORMALIZE ID
    ======================================================== */

    function normalizeId(
        value
    ) {

        return String(
            value || ""
        )
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
    }


    /* ========================================================
       FIND GLOBAL
    ======================================================== */

    function findGlobal(
        names
    ) {

        for (
            let i = 0;
            i < names.length;
            i++
        ) {

            const name =
                names[i];


            if (
                !name
            ) {

                continue;
            }


            /*
             * Unterstützt:
             *
             *   HalDoKernel
             *   HalDoOS.kernel
             *   HalDoV20.serviceBridge
             */

            if (
                typeof name ===
                "string" &&
                name.includes(".")
            ) {

                const parts =
                    name.split(".");


                let current =
                    window;


                for (
                    let p = 0;
                    p < parts.length;
                    p++
                ) {

                    if (
                        current &&
                        parts[p] in current
                    ) {

                        current =
                            current[
                                parts[p]
                            ];

                    } else {

                        current =
                            null;

                        break;
                    }
                }


                if (
                    current
                ) {

                    return current;
                }

            } else {

                const value =
                    typeof name ===
                    "string"
                        ? window[name]
                        : name;


                if (
                    value
                ) {

                    return value;
                }
            }
        }


        return null;
    }


    /* ========================================================
       SYSTEM DISCOVERY
    ======================================================== */

    Bridge.discoverSystems =
        function () {

            const discovered =
                {};


            /*
             * Kernel
             */

            const kernel =
                findGlobal(
                    [
                        "HalDoKernel",
                        "HalDoOS.kernel"
                    ]
                );


            if (
                kernel
            ) {

                discovered.kernel =
                    kernel;
            }


            /*
             * System
             */

            const system =
                findGlobal(
                    [
                        "HalDoSystem",
                        "HalDoOS.system"
                    ]
                );


            if (
                system
            ) {

                discovered.system =
                    system;
            }


            /*
             * App Manager
             */

            const appManager =
                findGlobal(
                    [
                        "HalDoAppManager",
                        "HalDoOS.appManager"
                    ]
                );


            if (
                appManager
            ) {

                discovered.appManager =
                    appManager;
            }


            /*
             * App Registry
             */

            const appRegistry =
                findGlobal(
                    [
                        "HalDoV20AppRegistry",
                        "HalDoAppRegistry",
                        "HalDoOS.appRegistry"
                    ]
                );


            if (
                appRegistry
            ) {

                discovered.appRegistry =
                    appRegistry;
            }


            /*
             * App Runtime
             */

            const appRuntime =
                findGlobal(
                    [
                        "HalDoAppRuntime",
                        "HalDoV20.appRuntime",
                        "HalDoOS.appRuntime"
                    ]
                );


            if (
                appRuntime
            ) {

                discovered.appRuntime =
                    appRuntime;
            }


            /*
             * Router
             */

            const router =
                findGlobal(
                    [
                        "HalDoAppRouter",
                        "HalDoRouter",
                        "HalDoOS.appRouter"
                    ]
                );


            if (
                router
            ) {

                discovered.appRouter =
                    router;
            }


            /*
             * Launcher
             */

            const launcher =
                findGlobal(
                    [
                        "HalDoLauncher",
                        "HalDoOS.launcher"
                    ]
                );


            if (
                launcher
            ) {

                discovered.launcher =
                    launcher;
            }


            /*
             * Window Manager
             */

            const windowManager =
                findGlobal(
                    [
                        "HalDoWindowManager",
                        "HalDoOS.windowManager"
                    ]
                );


            if (
                windowManager
            ) {

                discovered.windowManager =
                    windowManager;
            }


            /*
             * Storage
             */

            const storage =
                findGlobal(
                    [
                        "HalDoStorage",
                        "HalDoOS.storage"
                    ]
                );


            if (
                storage
            ) {

                discovered.storage =
                    storage;
            }


            /*
             * Storage Manager
             */

            const storageManager =
                findGlobal(
                    [
                        "HalDoStorageManager",
                        "HalDoOS.storageManager"
                    ]
                );


            if (
                storageManager
            ) {

                discovered.storageManager =
                    storageManager;
            }


            /*
             * AI
             */

            const ai =
                findGlobal(
                    [
                        "HalDoAI",
                        "HalDoAICore",
                        "HalDoOS.ai",
                        "HalDoOS.aiCore"
                    ]
                );


            if (
                ai
            ) {

                discovered.ai =
                    ai;
            }


            /*
             * AI Core
             */

            const aiCore =
                findGlobal(
                    [
                        "HalDoAICore",
                        "HalDoOS.aiCore"
                    ]
                );


            if (
                aiCore
            ) {

                discovered.aiCore =
                    aiCore;
            }


            /*
             * Voice
             */

            const voice =
                findGlobal(
                    [
                        "HalDoVoice",
                        "HalDoOS.voice"
                    ]
                );


            if (
                voice
            ) {

                discovered.voice =
                    voice;
            }


            /*
             * Speech
             */

            const speech =
                findGlobal(
                    [
                        "HalDoSpeech",
                        "HalDoAISpeech",
                        "HalDoOS.speech",
                        "HalDoOS.aiSpeech"
                    ]
                );


            if (
                speech
            ) {

                discovered.speech =
                    speech;
            }


            /*
             * Language
             */

            const language =
                findGlobal(
                    [
                        "HalDoLanguage",
                        "HalDoLanguageManager",
                        "HalDoLanguageSystem",
                        "HalDoOS.language",
                        "HalDoOS.languageManager",
                        "HalDoOS.languageSystem"
                    ]
                );


            if (
                language
            ) {

                discovered.language =
                    language;
            }


            /*
             * Notifications
             */

            const notifications =
                findGlobal(
                    [
                        "HalDoNotifications",
                        "HalDoOS.notifications"
                    ]
                );


            if (
                notifications
            ) {

                discovered.notifications =
                    notifications;
            }


            /*
             * Settings
             */

            const settings =
                findGlobal(
                    [
                        "HalDoSettings",
                        "HalDoConfigManager",
                        "HalDoOS.settings",
                        "HalDoOS.config"
                    ]
                );


            if (
                settings
            ) {

                discovered.settings =
                    settings;
            }


            /*
             * Cosmic
             */

            const cosmic =
                findGlobal(
                    [
                        "HalDoCosmic",
                        "HalDoCosmicEngine",
                        "HalDoOS.cosmic"
                    ]
                );


            if (
                cosmic
            ) {

                discovered.cosmic =
                    cosmic;
            }


            /*
             * Cosmic Welcome
             */

            const cosmicWelcome =
                findGlobal(
                    [
                        "HalDoCosmicWelcome",
                        "HalDoOS.cosmicWelcome"
                    ]
                );


            if (
                cosmicWelcome
            ) {

                discovered.cosmicWelcome =
                    cosmicWelcome;
            }


            /*
             * Logo
             */

            const logo =
                findGlobal(
                    [
                        "HalDoLogo",
                        "HalDoLogoEngine",
                        "HalDoOS.logo"
                    ]
                );


            if (
                logo
            ) {

                discovered.logo =
                    logo;
            }


            /*
             * EZIDI Keyboard
             */

            const ezidiKeyboard =
                findGlobal(
                    [
                        "HalDoEzidiKeyboard",
                        "HalDoOS.ezidiKeyboard"
                    ]
                );


            if (
                ezidiKeyboard
            ) {

                discovered.ezidiKeyboard =
                    ezidiKeyboard;
            }


            /*
             * Module Manager
             */

            const moduleManager =
                findGlobal(
                    [
                        "HalDoModuleManager",
                        "HalDoOS.moduleManager"
                    ]
                );


            if (
                moduleManager
            ) {

                discovered.moduleManager =
                    moduleManager;
            }


            /*
             * Shell
             */

            const shell =
                findGlobal(
                    [
                        "HalDoShellManager",
                        "HalDoOS.shell"
                    ]
                );


            if (
                shell
            ) {

                discovered.shell =
                    shell;
            }


            /*
             * Desktop
             */

            const desktop =
                findGlobal(
                    [
                        "HalDoDesktopManager",
                        "HalDoOS.desktop"
                    ]
                );


            if (
                desktop
            ) {

                discovered.desktop =
                    desktop;
            }


            /*
             * Service Bridge
             */

            const serviceBridge =
                findGlobal(
                    [
                        "HalDoV20ServiceBridge",
                        "HalDoOS.serviceBridge",
                        "HalDoV20.serviceBridge"
                    ]
                );


            if (
                serviceBridge
            ) {

                discovered.serviceBridge =
                    serviceBridge;

                Bridge.serviceBridge =
                    serviceBridge;
            }


            /*
             * Universal App Event Bus
             */

            const eventBus =
                findGlobal(
                    [
                        "HalDoAppEvents",
                        "HalDoV20AppEvents",
                        "HalDoOS.appEvents",
                        "HalDoV20.appEvents"
                    ]
                );


            if (
                eventBus
            ) {

                discovered.eventBus =
                    eventBus;

                Bridge.eventBus =
                    eventBus;
            }


            Bridge.systems =
                discovered;


            Bridge.log(
                "System discovery complete:",
                Object.keys(
                    discovered
                )
            );


            return discovered;
        };


    /* ========================================================
       GET SYSTEM
    ======================================================== */

    Bridge.getSystem =
        function (
            name
        ) {

            if (
                !name
            ) {

                return null;
            }


            return (
                Bridge.systems[
                    name
                ] ||
                null
            );
        };


    /* ========================================================
       REFRESH CONNECTIONS
    ======================================================== */

    Bridge.refresh =
        function () {

            Bridge.discoverSystems();


            return Bridge;
        };


    /* ========================================================
       SAFE CALL
    ======================================================== */

    Bridge.call =
        function (
            object,
            method,
            ...args
        ) {

            if (
                !object
            ) {

                return {

                    success:
                        false,

                    value:
                        null,

                    error:
                        "Object unavailable"
                };
            }


            if (
                typeof object[
                    method
                ] !==
                "function"
            ) {

                return {

                    success:
                        false,

                    value:
                        null,

                    error:
                        "Method unavailable: " +
                        method
                };
            }


            try {

                return {

                    success:
                        true,

                    value:
                        object[
                            method
                        ].apply(
                            object,
                            args
                        ),

                    error:
                        null
                };

            } catch (error) {

                Bridge.error(
                    "Method failed:",
                    method,
                    error
                );


                return {

                    success:
                        false,

                    value:
                        null,

                    error:
                        error
                };
            }
        };


    /* ========================================================
       EVENT BUS CONNECTION
    ======================================================== */

    Bridge.connectEventBus =
        function () {

            const bus =
                Bridge.systems.eventBus ||
                window.HalDoAppEvents;


            if (
                !bus
            ) {

                return null;
            }


            Bridge.eventBus =
                bus;


            return bus;
        };


    /* ========================================================
       BRIDGE EVENT LISTENERS
    ======================================================== */

    Bridge.on =
        function (
            eventName,
            callback
        ) {

            if (
                typeof eventName !==
                "string" ||
                typeof callback !==
                "function"
            ) {

                return function () {};
            }


            if (
                !Bridge.listeners.has(
                    eventName
                )
            ) {

                Bridge.listeners.set(
                    eventName,
                    new Set()
                );
            }


            const set =
                Bridge.listeners.get(
                    eventName
                );


            set.add(
                callback
            );


            return function () {

                set.delete(
                    callback
                );
            };
        };


    Bridge.off =
        function (
            eventName,
            callback
        ) {

            const set =
                Bridge.listeners.get(
                    eventName
                );


            if (
                !set
            ) {

                return false;
            }


            return set.delete(
                callback
            );
        };


    Bridge.emit =
        function (
            eventName,
            data,
            options
        ) {

            const payload = {

                name:
                    String(
                        eventName ||
                        ""
                    ),

                detail:
                    data || {},

                timestamp:
                    Date.now(),

                source:
                    options &&
                    options.source
                        ? options.source
                        : "haldo-v20-bridge"
            };


            /*
             * Eigene Listener
             */

            const set =
                Bridge.listeners.get(
                    payload.name
                );


            if (
                set
            ) {

                Array.from(
                    set
                )
                .forEach(
                    function (
                        handler
                    ) {

                        try {

                            handler(
                                payload
                            );

                        } catch (error) {

                            Bridge.error(
                                "Bridge listener failed:",
                                error
                            );
                        }

                    }
                );
            }


            /*
             * DOM Event
             */

            try {

                document.dispatchEvent(
                    new CustomEvent(
                        "haldo:" +
                        payload.name,
                        {
                            detail:
                                payload
                        }
                    )
                );

            } catch (error) {

                Bridge.warn(
                    "DOM event failed:",
                    payload.name
                );
            }


            /*
             * Universal App Event Bus
             *
             * Dieser Bus ist die zentrale Event-Schicht.
             */

            const bus =
                Bridge.eventBus ||
                window.HalDoAppEvents;


            if (
                bus &&
                bus !== Bridge &&
                typeof bus.emit ===
                "function"
            ) {

                try {

                    bus.emit(
                        payload.name,
                        payload.detail,
                        {

                            source:
                                payload.source,

                            internal:
                                true,

                            metadata:
                                {
                                    bridge:
                                        true
                                }
                        }
                    );

                } catch (error) {

                    Bridge.warn(
                        "Event Bus forwarding failed:",
                        payload.name
                    );
                }
            }


            /*
             * Kernel Event Bus
             */

            const kernel =
                Bridge.systems.kernel;


            if (
                kernel &&
                typeof kernel.emit ===
                "function"
            ) {

                try {

                    kernel.emit(
                        "v20:" +
                        payload.name,
                        payload.detail
                    );

                } catch (error) {

                    Bridge.warn(
                        "Kernel forwarding failed:",
                        payload.name
                    );
                }
            }


            return payload;
        };


    /* ========================================================
       REGISTER APP
    ======================================================== */

    Bridge.registerApp =
        function (
            definition
        ) {

            if (
                !definition
            ) {

                throw new Error(
                    "HalDo V20: App definition is required."
                );
            }


            const id =
                normalizeId(
                    definition.id ||
                    definition.appId ||
                    definition.name
                );


            if (
                !id
            ) {

                throw new Error(
                    "HalDo V20: App requires an id."
                );
            }


            /*
             * Bestehende Definition erweitern,
             * nicht blind entfernen.
             */

            const existing =
                Bridge.apps.get(
                    id
                );


            const app =
                Object.assign(

                    {

                        id:
                            id,

                        name:
                            id,

                        version:
                            "20.0.0",

                        enabled:
                            true,

                        state:
                            "registered",

                        createdAt:
                            existing &&
                            existing.createdAt
                                ? existing.createdAt
                                : Date.now()

                    },

                    existing || {},

                    definition,

                    {

                        id:
                            id
                    }
                );


            Bridge.apps.set(
                id,
                app
            );


            /*
             * App Registry bevorzugen.
             */

            const registry =
                Bridge.systems.appRegistry;


            if (
                registry
            ) {

                const methods = [

                    "register",

                    "registerApp",

                    "add"
                ];


                for (
                    let i = 0;
                    i < methods.length;
                    i++
                ) {

                    const method =
                        methods[i];


                    if (
                        typeof registry[
                            method
                        ] !==
                        "function"
                    ) {

                        continue;
                    }


                    try {

                        registry[
                            method
                        ](
                            app
                        );


                        break;

                    } catch (error) {

                        Bridge.warn(
                            "Registry registration failed:",
                            id,
                            method
                        );
                    }
                }
            }


            Bridge.emit(
                "app:registered",
                {

                    app:
                        app
                },

                {

                    source:
                        id
                }
            );


            return app;
        };


    /* ========================================================
       GET APP
    ======================================================== */

    Bridge.getApp =
        function (
            id
        ) {

            return Bridge.apps.get(
                normalizeId(
                    id
                )
            ) || null;
        };


    /* ========================================================
       GET APPS
    ======================================================== */

    Bridge.getApps =
        function () {

            return Array.from(
                Bridge.apps.values()
            );
        };


    /* ========================================================
       OPEN APP
    ======================================================== */

    Bridge.openApp =
        function (
            id,
            options
        ) {

            id =
                normalizeId(
                    id
                );


            const opts =
                options || {};


            const app =
                Bridge.getApp(
                    id
                );


            Bridge.emit(
                "app:before-open",
                {

                    id:
                        id,

                    app:
                        app,

                    options:
                        opts
                },

                {

                    source:
                        id
                }
            );


            /*
             * App Manager
             */

            const manager =
                Bridge.systems.appManager;


            if (
                manager
            ) {

                const methods = [

                    "openApp",

                    "launchApp",

                    "open",

                    "launch"
                ];


                for (
                    let i = 0;
                    i < methods.length;
                    i++
                ) {

                    const method =
                        methods[i];


                    if (
                        typeof manager[
                            method
                        ] !==
                        "function"
                    ) {

                        continue;
                    }


                    try {

                        const result =
                            manager[
                                method
                            ](
                                id,
                                opts
                            );


                        if (
                            app
                        ) {

                            app.state =
                                "open";
                        }


                        Bridge.emit(
                            "app:opened",
                            {

                                id:
                                    id,

                                result:
                                    result
                            },

                            {

                                source:
                                    id
                            }
                        );


                        return result;

                    } catch (error) {

                        Bridge.warn(
                            "App Manager failed:",
                            id,
                            error
                        );
                    }
                }
            }


            /*
             * App Runtime
             */

            const runtime =
                Bridge.systems.appRuntime;


            if (
                runtime
            ) {

                const methods = [

                    "openApp",

                    "launchApp",

                    "startApp",

                    "open"
                ];


                for (
                    let i = 0;
                    i < methods.length;
                    i++
                ) {

                    const method =
                        methods[i];


                    if (
                        typeof runtime[
                            method
                        ] !==
                        "function"
                    ) {

                        continue;
                    }


                    try {

                        const result =
                            runtime[
                                method
                            ](
                                id,
                                opts
                            );


                        if (
                            app
                        ) {

                            app.state =
                                "open";
                        }


                        Bridge.emit(
                            "app:opened",
                            {

                                id:
                                    id,

                                result:
                                    result
                            },

                            {

                                source:
                                    id
                            }
                        );


                        return result;

                    } catch (error) {

                        Bridge.warn(
                            "App Runtime failed:",
                            id,
                            error
                        );
                    }
                }
            }


            /*
             * Router Fallback
             */

            const router =
                Bridge.systems.appRouter;


            if (
                router
            ) {

                const methods = [

                    "navigateToApp",

                    "openApp",

                    "navigate",

                    "route"
                ];


                for (
                    let i = 0;
                    i < methods.length;
                    i++
                ) {

                    const method =
                        methods[i];


                    if (
                        typeof router[
                            method
                        ] !==
                        "function"
                    ) {

                        continue;
                    }


                    try {

                        const result =
                            router[
                                method
                            ](
                                id,
                                opts
                            );


                        Bridge.emit(
                            "app:opened",
                            {

                                id:
                                    id,

                                result:
                                    result
                            },

                            {

                                source:
                                    id
                            }
                        );


                        return result;

                    } catch (error) {

                        Bridge.warn(
                            "Router fallback failed:",
                            id
                        );
                    }
                }
            }


            /*
             * DOM fallback
             */

            try {

                document.dispatchEvent(
                    new CustomEvent(
                        "haldo:app-open-request",
                        {

                            detail: {

                                id:
                                    id,

                                options:
                                    opts
                            }
                        }
                    )
                );

            } catch (error) {

                Bridge.warn(
                    "DOM app-open fallback failed:",
                    id
                );
            }


            return null;
        };


    /* ========================================================
       CLOSE APP
    ======================================================== */

    Bridge.closeApp =
        function (
            id
        ) {

            id =
                normalizeId(
                    id
                );


            const app =
                Bridge.getApp(
                    id
                );


            const manager =
                Bridge.systems.appManager;


            if (
                manager
            ) {

                const methods = [

                    "closeApp",

                    "close",

                    "stopApp"
                ];


                for (
                    let i = 0;
                    i < methods.length;
                    i++
                ) {

                    const method =
                        methods[i];


                    if (
                        typeof manager[
                            method
                        ] !==
                        "function"
                    ) {

                        continue;
                    }


                    try {

                        const result =
                            manager[
                                method
                            ](
                                id
                            );


                        if (
                            app
                        ) {

                            app.state =
                                "closed";
                        }


                        Bridge.emit(
                            "app:closed",
                            {

                                id:
                                    id
                            },

                            {

                                source:
                                    id
                            }
                        );


                        return result;

                    } catch (error) {

                        Bridge.warn(
                            "App close failed:",
                            id
                        );
                    }
                }
            }


            return null;
        };


    /* ========================================================
       STORAGE
    ======================================================== */

    Bridge.storage = {

        get:
            function (
                key,
                fallback
            ) {

                const storage =
                    Bridge.systems.storage ||
                    Bridge.systems.storageManager;


                if (
                    storage
                ) {

                    const methods = [

                        "get",

                        "getItem",

                        "read"
                    ];


                    for (
                        let i = 0;
                        i < methods.length;
                        i++
                    ) {

                        const method =
                            methods[i];


                        if (
                            typeof storage[
                                method
                            ] !==
                            "function"
                        ) {

                            continue;
                        }


                        try {

                            const value =
                                storage[
                                    method
                                ](
                                    key
                                );


                            /*
                             * Promise-Werte nicht
                             * künstlich verändern.
                             */

                            if (
                                value !==
                                undefined &&
                                value !==
                                null
                            ) {

                                return value;
                            }

                        } catch (error) {

                            /*
                             * Nächsten Adapter versuchen.
                             */
                        }
                    }
                }


                try {

                    const raw =
                        window.localStorage.getItem(
                            key
                        );


                    if (
                        raw ===
                        null
                    ) {

                        return fallback;
                    }


                    try {

                        return JSON.parse(
                            raw
                        );

                    } catch (error) {

                        return raw;
                    }

                } catch (error) {

                    return fallback;
                }
            },


        set:
            function (
                key,
                value
            ) {

                const storage =
                    Bridge.systems.storage ||
                    Bridge.systems.storageManager;


                if (
                    storage
                ) {

                    const methods = [

                        "set",

                        "setItem",

                        "write",

                        "save"
                    ];


                    for (
                        let i = 0;
                        i < methods.length;
                        i++
                    ) {

                        const method =
                            methods[i];


                        if (
                            typeof storage[
                                method
                            ] !==
                            "function"
                        ) {

                            continue;
                        }


                        try {

                            storage[
                                method
                            ](
                                key,
                                value
                            );


                            Bridge.emit(
                                "storage:changed",
                                {

                                    key:
                                        key,

                                    value:
                                        value
                                },

                                {

                                    source:
                                        "storage"
                                }
                            );


                            return true;

                        } catch (error) {

                            /*
                             * Nächsten Adapter versuchen.
                             */
                        }
                    }
                }


                try {

                    window.localStorage.setItem(
                        key,
                        JSON.stringify(
                            value
                        )
                    );


                    Bridge.emit(
                        "storage:changed",
                        {

                            key:
                                key,

                            value:
                                value
                        },

                        {

                            source:
                                "storage"
                        }
                    );


                    return true;

                } catch (error) {

                    Bridge.warn(
                        "Storage fallback failed:",
                        key
                    );


                    return false;
                }
            }
    };


    /* ========================================================
       LANGUAGE
    ======================================================== */

    Bridge.language = {

        get:
            function () {

                const language =
                    Bridge.systems.language;


                if (
                    language
                ) {

                    const methods = [

                        "getCurrentLanguage",

                        "getLanguage"
                    ];


                    for (
                        let i = 0;
                        i < methods.length;
                        i++
                    ) {

                        const method =
                            methods[i];


                        if (
                            typeof language[
                                method
                            ] !==
                            "function"
                        ) {

                            continue;
                        }


                        try {

                            const result =
                                language[
                                    method
                                ]();


                            if (
                                result
                            ) {

                                return result;
                            }

                        } catch (error) {

                            /*
                             * Continue.
                             */
                        }
                    }


                    /*
                     * Property fallback.
                     */

                    if (
                        typeof language.currentLanguage ===
                        "string"
                    ) {

                        return language.currentLanguage;
                    }
                }


                return (
                    document.documentElement.lang ||
                    "de"
                );
            },


        set:
            function (
                languageCode
            ) {

                if (
                    !languageCode
                ) {

                    return false;
                }


                const code =
                    String(
                        languageCode
                    )
                    .trim();


                const language =
                    Bridge.systems.language;


                if (
                    language
                ) {

                    const methods = [

                        "setLanguage",

                        "changeLanguage",

                        "switchLanguage"
                    ];


                    for (
                        let i = 0;
                        i < methods.length;
                        i++
                    ) {

                        const method =
                            methods[i];


                        if (
                            typeof language[
                                method
                            ] !==
                            "function"
                        ) {

                            continue;
                        }


                        try {

                            language[
                                method
                            ](
                                code
                            );


                            document.documentElement.lang =
                                code;


                            Bridge.storage.set(
                                "haldo.language",
                                code
                            );


                            Bridge.emit(
                                "language:changed",
                                {

                                    language:
                                        code
                                },

                                {

                                    source:
                                        "language"
                                }
                            );


                            return true;

                        } catch (error) {

                            Bridge.warn(
                                "Language API failed:",
                                method
                            );
                        }
                    }
                }


                /*
                 * Fallback.
                 */

                document.documentElement.lang =
                    code;


                Bridge.storage.set(
                    "haldo.language",
                    code
                );


                Bridge.emit(
                    "language:changed",
                    {

                        language:
                            code
                    },

                    {

                        source:
                            "language"
                    }
                );


                return true;
            }
    };


    /* ========================================================
       NOTIFICATION
    ======================================================== */

    Bridge.notify =
        function (
            title,
            message,
            options
        ) {

            const notifications =
                Bridge.systems.notifications;


            if (
                notifications
            ) {

                const methods = [

                    "notify",

                    "show",

                    "add",

                    "create"
                ];


                for (
                    let i = 0;
                    i < methods.length;
                    i++
                ) {

                    const method =
                        methods[i];


                    if (
                        typeof notifications[
                            method
                        ] !==
                        "function"
                    ) {

                        continue;
                    }


                    try {

                        return notifications[
                            method
                        ](
                            title,
                            message,
                            options || {}
                        );

                    } catch (error) {

                        /*
                         * Continue.
                         */
                    }
                }
            }


            Bridge.emit(
                "notification:show",
                {

                    title:
                        title,

                    message:
                        message,

                    options:
                        options || {}
                },

                {

                    source:
                        "notifications"
                }
            );


            return null;
        };


    /* ========================================================
       APP SERVICES
    ======================================================== */

    Bridge.getAppServices =
        function (
            appId
        ) {

            const serviceBridge =
                Bridge.serviceBridge ||
                window.HalDoV20ServiceBridge;


            /*
             * Wenn die Universal Service Bridge vorhanden
             * ist, verwenden wir deren zentrale API.
             */

            if (
                serviceBridge &&
                typeof serviceBridge.createAppServices ===
                "function"
            ) {

                try {

                    return serviceBridge.createAppServices(
                        appId
                    );

                } catch (error) {

                    Bridge.warn(
                        "Service Bridge app context failed:",
                        error
                    );
                }
            }


            /*
             * Defensive Fallback-Struktur.
             */

            return {

                appId:
                    appId,

                kernel:
                    Bridge.systems.kernel ||
                    null,

                system:
                    Bridge.systems.system ||
                    null,

                appManager:
                    Bridge.systems.appManager ||
                    null,

                registry:
                    Bridge.systems.appRegistry ||
                    null,

                runtime:
                    Bridge.systems.appRuntime ||
                    null,

                router:
                    Bridge.systems.appRouter ||
                    null,

                windowManager:
                    Bridge.systems.windowManager ||
                    null,

                storage:
                    Bridge.systems.storage ||
                    Bridge.systems.storageManager ||
                    null,

                language:
                    Bridge.systems.language ||
                    null,

                ai:
                    Bridge.systems.ai ||
                    Bridge.systems.aiCore ||
                    null,

                voice:
                    Bridge.systems.voice ||
                    null,

                speech:
                    Bridge.systems.speech ||
                    null,

                notifications:
                    Bridge.systems.notifications ||
                    null,

                config:
                    Bridge.systems.settings ||
                    null,

                modules:
                    Bridge.systems.moduleManager ||
                    null,

                shell:
                    Bridge.systems.shell ||
                    null,

                desktop:
                    Bridge.systems.desktop ||
                    null,

                ezidiKeyboard:
                    Bridge.systems.ezidiKeyboard ||
                    null,

                cosmic:
                    Bridge.systems.cosmic ||
                    null,

                cosmicWelcome:
                    Bridge.systems.cosmicWelcome ||
                    null,

                serviceBridge:
                    serviceBridge ||
                    null,

                eventBus:
                    Bridge.eventBus ||
                    null
            };
        };


    /* ========================================================
       CONNECT APP EVENT BUS
    ======================================================== */

    Bridge.connectAppEvents =
        function () {

            const bus =
                Bridge.systems.eventBus ||
                window.HalDoAppEvents ||
                window.HalDoV20AppEvents;


            if (
                !bus
            ) {

                return false;
            }


            Bridge.eventBus =
                bus;


            /*
             * App Event Bus ist bereits selbständig.
             * Wir verwenden ihn lediglich als zentrale
             * Kommunikationsschicht.
             */

            return true;
        };


    /* ========================================================
       STATUS
    ======================================================== */

    Bridge.status =
        function () {

            return {

                name:
                    Bridge.name,

                version:
                    Bridge.version,

                ready:
                    Bridge.ready,

                systems:
                    Object.keys(
                        Bridge.systems
                    ),

                services:
                    Bridge.serviceBridge &&
                    typeof Bridge.serviceBridge.getStatus ===
                    "function"
                        ? Bridge.serviceBridge.getStatus()
                        : null,

                eventBus:
                    Bridge.eventBus &&
                    typeof Bridge.eventBus.getStatus ===
                    "function"
                        ? Bridge.eventBus.getStatus()
                        : null,

                apps:
                    Bridge.apps.size,

                language:
                    Bridge.language.get(),

                timestamp:
                    Date.now()
            };
        };


    /* ========================================================
       ALIAS STATUS
    ======================================================== */

    Bridge.getStatus =
        Bridge.status;


    /* ========================================================
       INITIALIZATION
    ======================================================== */

    Bridge.init =
        function () {

            if (
                Bridge.ready
            ) {

                return Bridge;
            }


            Bridge.log(
                "Initializing HalDo AI OS 20 Central Bridge..."
            );


            /*
             * Zuerst vorhandene Systeme erkennen.
             */

            Bridge.discoverSystems();


            /*
             * Service Bridge verbinden.
             */

            const serviceBridge =
                Bridge.systems.serviceBridge ||
                window.HalDoV20ServiceBridge;


            if (
                serviceBridge
            ) {

                Bridge.serviceBridge =
                    serviceBridge;
            }


            /*
             * Event Bus verbinden.
             */

            Bridge.connectEventBus();


            /*
             * Gespeicherte Sprache laden.
             */

            const savedLanguage =
                Bridge.storage.get(
                    "haldo.language",
                    null
                );


            if (
                savedLanguage &&
                typeof savedLanguage ===
                "string"
            ) {

                try {

                    document.documentElement.lang =
                        savedLanguage;

                } catch (error) {

                    /*
                     * Ignore.
                     */
                }
            }


            Bridge.ready =
                true;


            /*
             * Zentrale Verweise auf HalDoOS.
             */

            HalDoOS.v20Bridge =
                Bridge;


            HalDoOS.v20 =
                V20;


            /*
             * V20 Namespace NICHT ersetzen.
             *
             * Bereits vorhandene:
             *
             *   V20.serviceBridge
             *   V20.appEvents
             *   V20.appRegistry
             *   V20.appRuntime
             *
             * bleiben erhalten.
             */

            V20.bridge =
                Bridge;


            V20.v20Bridge =
                Bridge;


            /*
             * Kompatibilitätsreferenzen.
             */

            if (
                !V20.getSystem
            ) {

                V20.getSystem =
                    Bridge.getSystem;
            }


            if (
                !V20.registerApp
            ) {

                V20.registerApp =
                    Bridge.registerApp;
            }


            if (
                !V20.getApp
            ) {

                V20.getApp =
                    Bridge.getApp;
            }


            if (
                !V20.getApps
            ) {

                V20.getApps =
                    Bridge.getApps;
            }


            if (
                !V20.openApp
            ) {

                V20.openApp =
                    Bridge.openApp;
            }


            if (
                !V20.closeApp
            ) {

                V20.closeApp =
                    Bridge.closeApp;
            }


            /*
             * Zentrale Event Bus Referenz.
             */

            if (
                Bridge.eventBus &&
                !V20.appEvents
            ) {

                V20.appEvents =
                    Bridge.eventBus;
            }


            /*
             * Zentrale Service Bridge Referenz.
             */

            if (
                Bridge.serviceBridge &&
                !V20.serviceBridge
            ) {

                V20.serviceBridge =
                    Bridge.serviceBridge;
            }


            /*
             * System Event.
             */

            Bridge.emit(
                "v20:ready",
                Bridge.status(),
                {

                    source:
                        "system",

                    internal:
                        true
                }
            );


            /*
             * Universal App Event Bus direkt
             * informieren, falls vorhanden.
             */

            const eventBus =
                Bridge.eventBus;


            if (
                eventBus &&
                typeof eventBus.system ===
                "function"
            ) {

                try {

                    eventBus.system(
                        "system:v20-bridge-ready",
                        Bridge.status()
                    );

                } catch (error) {

                    Bridge.warn(
                        "Event Bus ready notification failed:",
                        error
                    );
                }
            }


            /*
             * Bestehenden Kernel informieren.
             */

            const kernel =
                Bridge.systems.kernel;


            if (
                kernel &&
                typeof kernel.emit ===
                "function"
            ) {

                try {

                    kernel.emit(
                        "system:v20-bridge-ready",
                        Bridge.status()
                    );

                } catch (error) {

                    Bridge.warn(
                        "Kernel ready notification failed:",
                        error
                    );
                }
            }


            Bridge.log(
                "HalDo AI OS 20 Central Bridge ready."
            );


            return Bridge;
        };


    /* ========================================================
       GLOBAL API
    ======================================================== */

    /*
     * WICHTIG:
     *
     * NICHT:
     *
     *   window.HalDoV20 = Bridge
     *
     * Dadurch würden Service Bridge und Event Bus
     * aus dem gemeinsamen Namespace verschwinden.
     *
     * Stattdessen:
     *
     *   window.HalDoV20.bridge
     */

    V20.bridge =
        Bridge;


    V20.v20Bridge =
        Bridge;


    HalDoOS.v20Bridge =
        Bridge;


    /*
     * Legacy direkter Zugriff.
     *
     * Nur setzen, wenn noch kein anderer direkter
     * V20-Eintrag vorhanden ist.
     */

    if (
        !window.HalDoV20Bridge
    ) {

        window.HalDoV20Bridge =
            Bridge;
    }


    /* ========================================================
       DOM READY BOOT
    ======================================================== */

    function boot() {

        try {

            Bridge.init();

        } catch (error) {

            Bridge.error(
                "HalDo AI OS 20 Bridge Startfehler:",
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
            boot,
            {
                once:
                    true
            }
        );

    } else {

        boot();
    }


    /* ========================================================
       GLOBAL ERROR BRIDGE
    ======================================================== */

    window.addEventListener(
        "error",
        function (
            event
        ) {

            try {

                Bridge.emit(
                    "system:error",
                    {

                        message:
                            event.message ||
                            "Unknown error",

                        filename:
                            event.filename ||
                            null,

                        line:
                            event.lineno ||
                            null,

                        column:
                            event.colno ||
                            null,

                        error:
                            event.error ||
                            null
                    },

                    {

                        source:
                            "system"
                    }
                );

            } catch (error) {

                /*
                 * Error Bridge darf einen globalen
                 * Browserfehler niemals verschlimmern.
                 */
            }
        }
    );


    window.addEventListener(
        "unhandledrejection",
        function (
            event
        ) {

            try {

                Bridge.emit(
                    "system:unhandled-rejection",
                    {

                        reason:
                            event.reason ||
                            "Unknown rejection"
                    },

                    {

                        source:
                            "system"
                    }
                );

            } catch (error) {

                /*
                 * Safe fallback.
                 */
            }
        }
    );


})(window, document);