/*
 * ============================================================
 * HalDo AI OS 20
 * V20 Core Bridge
 * ============================================================
 *
 * Datei:
 *   js/haldo-v20-bridge.js
 *
 * Zweck:
 *   Zentrale V20-Verbindungsschicht.
 *
 * WICHTIG:
 *   Diese Datei ersetzt kein bestehendes HalDo-System.
 *   Sie stellt einen stabilen gemeinsamen V20-Namespace bereit
 *   und verbindet vorhandene Systeme defensiv miteinander.
 *
 * Architektur:
 *
 *   HalDoOS
 *      │
 *      └── HalDoV20
 *             │
 *             ├── coreBridge
 *             ├── serviceBridge
 *             ├── appEvents
 *             ├── appRegistry
 *             ├── appRuntime
 *             ├── appManager
 *             ├── router
 *             ├── windowManager
 *             ├── storage
 *             ├── language
 *             ├── ai
 *             ├── voice
 *             └── cosmic
 *
 * ============================================================
 */

(function (window, document) {

    "use strict";


    /* ========================================================
       GLOBAL ROOTS
    ======================================================== */

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};


    /*
     * WICHTIG:
     *
     * HalDoV20 darf NICHT mehr blind ersetzt werden.
     *
     * Andere V20-Dateien können bereits Eigenschaften daran
     * angelegt haben.
     */

    const V20 =
        window.HalDoV20 =
        window.HalDoV20 || {};


    /* ========================================================
       CORE BRIDGE
    ======================================================== */

    const Bridge = {

        name:
            "HalDo V20 Core Bridge",

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

        config:
            {
                debug:
                    true,

                version:
                    "20.0.0"
            }

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

                /* Safe fallback */

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

                /* Safe fallback */

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

                /* Safe fallback */

            }
        };


    /* ========================================================
       INTERNAL EVENT LISTENERS
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
                    String(
                        eventName
                    )
                );


            if (!set) {
                return false;
            }


            return set.delete(
                callback
            );
        };


    /* ========================================================
       EMIT
    ======================================================== */

    Bridge.emit =
        function (
            eventName,
            detail
        ) {

            if (
                typeof eventName !==
                "string"
            ) {

                return;
            }


            const payload = {

                name:
                    eventName,

                detail:
                    detail || {},

                timestamp:
                    Date.now(),

                source:
                    "haldo-v20-core-bridge"

            };


            /*
             * Eigene Listener
             */

            const set =
                Bridge.listeners.get(
                    eventName
                );


            if (set) {

                Array.from(
                    set
                )
                .forEach(
                    function (
                        callback
                    ) {

                        try {

                            callback(
                                payload
                            );

                        } catch (error) {

                            Bridge.error(
                                "Bridge listener error:",
                                error
                            );
                        }

                    }
                );
            }


            /*
             * Globaler V20 Event Bus
             */

            const eventBus =
                window.HalDoAppEvents ||
                V20.appEvents;


            if (
                eventBus &&
                eventBus !== Bridge &&
                typeof eventBus.emit ===
                "function"
            ) {

                try {

                    eventBus.emit(
                        eventName,
                        detail || {},
                        {
                            source:
                                "haldo-v20-core-bridge",

                            internal:
                                true
                        }
                    );

                } catch (error) {

                    Bridge.warn(
                        "Event Bus forwarding failed:",
                        eventName
                    );
                }
            }


            /*
             * DOM Event
             */

            try {

                document.dispatchEvent(
                    new CustomEvent(
                        "haldo:" +
                        eventName,
                        {
                            detail:
                                payload
                        }
                    )
                );

            } catch (error) {

                /* Safe fallback */

            }


            return payload;
        };


    /* ========================================================
       SYSTEM DISCOVERY HELPERS
    ======================================================== */

    function firstAvailable(
        candidates
    ) {

        for (
            let i = 0;
            i < candidates.length;
            i++
        ) {

            if (
                candidates[i]
            ) {

                return candidates[i];
            }
        }


        return null;
    }


    /* ========================================================
       DISCOVER SYSTEMS
    ======================================================== */

    Bridge.discoverSystems =
        function () {

            const discovered = {};


            /*
             * Kernel
             */

            discovered.kernel =
                firstAvailable(
                    [
                        window.HalDoKernel,
                        HalDoOS.kernel,
                        V20.kernel
                    ]
                );


            /*
             * System
             */

            discovered.system =
                firstAvailable(
                    [
                        window.HalDoSystem,
                        HalDoOS.system
                    ]
                );


            /*
             * App Manager
             */

            discovered.appManager =
                firstAvailable(
                    [
                        window.HalDoAppManager,
                        HalDoOS.appManager
                    ]
                );


            /*
             * Registry
             */

            discovered.appRegistry =
                firstAvailable(
                    [
                        window.HalDoV20AppRegistry,
                        window.HalDoAppRegistry,
                        HalDoOS.appRegistry,
                        V20.appRegistry
                    ]
                );


            /*
             * Runtime
             */

            discovered.appRuntime =
                firstAvailable(
                    [
                        window.HalDoAppRuntime,
                        window.HalDoV20AppRuntime,
                        HalDoOS.appRuntime,
                        V20.appRuntime
                    ]
                );


            /*
             * Router
             */

            discovered.appRouter =
                firstAvailable(
                    [
                        window.HalDoAppRouter,
                        window.HalDoRouter,
                        HalDoOS.appRouter,
                        V20.router
                    ]
                );


            /*
             * Launcher
             */

            discovered.launcher =
                firstAvailable(
                    [
                        window.HalDoLauncher,
                        HalDoOS.launcher
                    ]
                );


            /*
             * Window Manager
             */

            discovered.windowManager =
                firstAvailable(
                    [
                        window.HalDoWindowManager,
                        HalDoOS.windowManager
                    ]
                );


            /*
             * Storage
             */

            discovered.storage =
                firstAvailable(
                    [
                        window.HalDoStorage,
                        HalDoOS.storage
                    ]
                );


            /*
             * Storage Manager
             */

            discovered.storageManager =
                firstAvailable(
                    [
                        window.HalDoStorageManager,
                        HalDoOS.storageManager
                    ]
                );


            /*
             * AI
             */

            discovered.ai =
                firstAvailable(
                    [
                        window.HalDoAI,
                        window.HalDoAICore,
                        HalDoOS.ai,
                        HalDoOS.aiCore
                    ]
                );


            /*
             * AI Core
             */

            discovered.aiCore =
                firstAvailable(
                    [
                        window.HalDoAICore,
                        HalDoOS.aiCore
                    ]
                );


            /*
             * Voice
             */

            discovered.voice =
                firstAvailable(
                    [
                        window.HalDoVoice,
                        HalDoOS.voice
                    ]
                );


            /*
             * Speech
             */

            discovered.speech =
                firstAvailable(
                    [
                        window.HalDoSpeech,
                        window.HalDoAISpeech,
                        HalDoOS.speech,
                        HalDoOS.aiSpeech
                    ]
                );


            /*
             * Language
             */

            discovered.language =
                firstAvailable(
                    [
                        window.HalDoLanguageManager,
                        window.HalDoLanguageSystem,
                        window.HalDoLanguage,
                        HalDoOS.languageManager,
                        HalDoOS.languageSystem,
                        HalDoOS.language
                    ]
                );


            /*
             * Notifications
             */

            discovered.notifications =
                firstAvailable(
                    [
                        window.HalDoNotifications,
                        HalDoOS.notifications
                    ]
                );


            /*
             * Settings
             */

            discovered.settings =
                firstAvailable(
                    [
                        window.HalDoSettings,
                        window.HalDoConfigManager,
                        HalDoOS.settings,
                        HalDoOS.config
                    ]
                );


            /*
             * Cosmic
             */

            discovered.cosmic =
                firstAvailable(
                    [
                        window.HalDoCosmicEngine,
                        window.HalDoCosmic,
                        HalDoOS.cosmic,
                        V20.cosmic
                    ]
                );


            /*
             * Cosmic Welcome
             */

            discovered.cosmicWelcome =
                firstAvailable(
                    [
                        window.HalDoCosmicWelcome,
                        HalDoOS.cosmicWelcome,
                        V20.cosmicWelcome
                    ]
                );


            /*
             * Logo / AI Avatar
             */

            discovered.logo =
                firstAvailable(
                    [
                        window.HalDoLogo,
                        window.HalDoLogoEngine,
                        HalDoOS.logo
                    ]
                );


            /*
             * EZIDI Keyboard
             */

            discovered.ezidiKeyboard =
                firstAvailable(
                    [
                        window.HalDoEzidiKeyboard,
                        HalDoOS.ezidiKeyboard
                    ]
                );


            /*
             * Existing Event Bus
             */

            discovered.appEvents =
                firstAvailable(
                    [
                        window.HalDoAppEvents,
                        window.HalDoV20AppEvents,
                        HalDoOS.appEvents,
                        V20.appEvents
                    ]
                );


            /*
             * Service Bridge
             */

            discovered.serviceBridge =
                firstAvailable(
                    [
                        window.HalDoV20ServiceBridge,
                        HalDoOS.serviceBridge,
                        V20.serviceBridge
                    ]
                );


            Bridge.systems =
                discovered;


            /*
             * Direkte V20-Verbindungen
             */

            Bridge.appRegistry =
                discovered.appRegistry ||
                null;

            Bridge.appRuntime =
                discovered.appRuntime ||
                null;

            Bridge.appManager =
                discovered.appManager ||
                null;

            Bridge.router =
                discovered.appRouter ||
                null;

            Bridge.windowManager =
                discovered.windowManager ||
                null;

            Bridge.storageSystem =
                discovered.storage ||
                discovered.storageManager ||
                null;

            Bridge.languageSystem =
                discovered.language ||
                null;

            Bridge.ai =
                discovered.ai ||
                discovered.aiCore ||
                null;

            Bridge.voice =
                discovered.voice ||
                discovered.speech ||
                null;

            Bridge.cosmic =
                discovered.cosmic ||
                null;

            Bridge.cosmicWelcome =
                discovered.cosmicWelcome ||
                null;


            Bridge.log(
                "System discovery complete:",
                Object.keys(
                    discovered
                ).filter(
                    function (key) {
                        return Boolean(
                            discovered[key]
                        );
                    }
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

            return (
                Bridge.systems[
                    String(
                        name
                    )
                ] ||
                null
            );
        };


    /* ========================================================
       SAFE METHOD CALL
    ======================================================== */

    Bridge.call =
        async function (
            object,
            method,
            ...args
        ) {

            if (!object) {

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

                const value =
                    await object[
                        method
                    ](
                        ...args
                    );


                return {

                    success:
                        true,

                    value:
                        value,

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
       REGISTER APP
    ======================================================== */

    Bridge.registerApp =
        async function (
            definition
        ) {

            if (!definition) {

                throw new Error(
                    "HalDo V20: App definition required."
                );
            }


            const id =
                String(
                    definition.id ||
                    definition.appId ||
                    definition.name ||
                    ""
                )
                .trim();


            if (!id) {

                throw new Error(
                    "HalDo V20: App requires an id."
                );
            }


            /*
             * Bereits registrierte App nicht
             * blind zerstören.
             */

            const existing =
                Bridge.apps.get(
                    id
                );


            const app =
                Object.assign(
                    {},
                    existing || {},
                    {
                        id:
                            id,

                        name:
                            definition.name ||
                            existing?.name ||
                            id,

                        version:
                            definition.version ||
                            existing?.version ||
                            "20.0.0",

                        enabled:
                            definition.enabled !==
                            undefined
                                ? definition.enabled
                                : (
                                    existing?.enabled !==
                                    undefined
                                        ? existing.enabled
                                        : true
                                ),

                        state:
                            existing?.state ||
                            "registered",

                        createdAt:
                            existing?.createdAt ||
                            Date.now(),

                        updatedAt:
                            Date.now()
                    },
                    definition
                );


            Bridge.apps.set(
                id,
                app
            );


            /*
             * Vorhandene Registry verwenden.
             */

            const registry =
                Bridge.systems.appRegistry;


            if (registry) {

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
                        ] ===
                        "function"
                    ) {

                        try {

                            await registry[
                                method
                            ](
                                app
                            );


                            break;

                        } catch (error) {

                            Bridge.warn(
                                "Registry registration failed:",
                                id,
                                method,
                                error
                            );
                        }
                    }
                }
            }


            Bridge.emit(
                "app:registered",
                {
                    app:
                        app
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

            return (
                Bridge.apps.get(
                    String(
                        id
                    )
                ) ||
                null
            );
        };


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
        async function (
            id,
            options
        ) {

            id =
                String(
                    id
                );


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
                        options || {}
                }
            );


            /*
             * Runtime zuerst.
             *
             * Das ist für V20 wichtig:
             * Eine App soll nicht nur navigiert,
             * sondern tatsächlich gestartet werden.
             */

            const runtime =
                Bridge.systems.appRuntime;


            if (runtime) {

                const methods = [
                    "openApp",
                    "launchApp",
                    "startApp",
                    "open",
                    "launch",
                    "start"
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
                        ] ===
                        "function"
                    ) {

                        try {

                            const result =
                                await runtime[
                                    method
                                ](
                                    id,
                                    options || {}
                                );


                            if (app) {

                                app.state =
                                    "open";

                                app.updatedAt =
                                    Date.now();
                            }


                            Bridge.emit(
                                "app:opened",
                                {
                                    id:
                                        id,

                                    result:
                                        result
                                }
                            );


                            return result;

                        } catch (error) {

                            Bridge.warn(
                                "Runtime app open failed:",
                                id,
                                error
                            );
                        }
                    }
                }
            }


            /*
             * App Manager
             */

            const manager =
                Bridge.systems.appManager;


            if (manager) {

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
                        ] ===
                        "function"
                    ) {

                        try {

                            const result =
                                await manager[
                                    method
                                ](
                                    id,
                                    options || {}
                                );


                            if (app) {

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
            }


            /*
             * Router fallback
             */

            const router =
                Bridge.systems.appRouter;


            if (router) {

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
                        ] ===
                        "function"
                    ) {

                        try {

                            const result =
                                await router[
                                    method
                                ](
                                    id,
                                    options || {}
                                );


                            Bridge.emit(
                                "app:opened",
                                {
                                    id:
                                        id,

                                    result:
                                        result
                                }
                            );


                            return result;

                        } catch (error) {

                            Bridge.warn(
                                "Router fallback failed:",
                                id,
                                error
                            );
                        }
                    }
                }
            }


            /*
             * Letzter Fallback:
             * DOM App Open Request
             */

            try {

                document.dispatchEvent(
                    new CustomEvent(
                        "haldo:app-open-request",
                        {
                            detail:
                                {
                                    id:
                                        id,

                                    options:
                                        options || {}
                                }
                        }
                    )
                );

            } catch (error) {

                Bridge.warn(
                    "DOM app-open fallback failed:",
                    error
                );
            }


            return null;
        };


    /* ========================================================
       CLOSE APP
    ======================================================== */

    Bridge.closeApp =
        async function (
            id
        ) {

            id =
                String(
                    id
                );


            const app =
                Bridge.getApp(
                    id
                );


            const runtime =
                Bridge.systems.appRuntime;


            if (runtime) {

                const methods = [
                    "closeApp",
                    "stopApp",
                    "close",
                    "stop"
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
                        ] ===
                        "function"
                    ) {

                        try {

                            const result =
                                await runtime[
                                    method
                                ](
                                    id
                                );


                            if (app) {

                                app.state =
                                    "closed";

                                app.updatedAt =
                                    Date.now();
                            }


                            Bridge.emit(
                                "app:closed",
                                {
                                    id:
                                        id,

                                    result:
                                        result
                                }
                            );


                            return result;

                        } catch (error) {

                            Bridge.warn(
                                "Runtime close failed:",
                                id,
                                error
                            );
                        }
                    }
                }
            }


            const manager =
                Bridge.systems.appManager;


            if (manager) {

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
                        ] ===
                        "function"
                    ) {

                        try {

                            const result =
                                await manager[
                                    method
                                ](
                                    id
                                );


                            if (app) {

                                app.state =
                                    "closed";
                            }


                            Bridge.emit(
                                "app:closed",
                                {
                                    id:
                                        id,

                                    result:
                                        result
                                }
                            );


                            return result;

                        } catch (error) {

                            Bridge.warn(
                                "App close failed:",
                                id,
                                error
                            );
                        }
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
            async function (
                key,
                fallback
            ) {

                const storage =
                    Bridge.systems.storage ||
                    Bridge.systems.storageManager;


                if (storage) {

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
                            ] ===
                            "function"
                        ) {

                            try {

                                const value =
                                    await storage[
                                        method
                                    ](
                                        key
                                    );


                                return (
                                    value ===
                                    undefined ||
                                    value ===
                                    null
                                )
                                    ? fallback
                                    : value;

                            } catch (error) {

                                /* Continue */

                            }
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
            async function (
                key,
                value
            ) {

                const storage =
                    Bridge.systems.storage ||
                    Bridge.systems.storageManager;


                if (storage) {

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
                            ] ===
                            "function"
                        ) {

                            try {

                                await storage[
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
                                    }
                                );


                                return true;

                            } catch (error) {

                                /* Continue */

                            }
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
            async function () {

                const language =
                    Bridge.systems.language;


                if (language) {

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
                            ] ===
                            "function"
                        ) {

                            try {

                                return await language[
                                    method
                                ]();

                            } catch (error) {

                                /* Continue */

                            }
                        }
                    }


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
            async function (
                languageCode
            ) {

                if (
                    !languageCode
                ) {

                    return false;
                }


                const language =
                    Bridge.systems.language;


                if (language) {

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
                            ] ===
                            "function"
                        ) {

                            try {

                                await language[
                                    method
                                ](
                                    languageCode
                                );


                                document.documentElement.lang =
                                    languageCode;


                                Bridge.emit(
                                    "language:changed",
                                    {
                                        language:
                                            languageCode
                                    }
                                );


                                return true;

                            } catch (error) {

                                /* Continue */

                            }
                        }
                    }
                }


                document.documentElement.lang =
                    languageCode;


                await Bridge.storage.set(
                    "haldo.language",
                    languageCode
                );


                Bridge.emit(
                    "language:changed",
                    {
                        language:
                            languageCode
                    }
                );


                return true;
            }
    };


    /* ========================================================
       NOTIFICATIONS
    ======================================================== */

    Bridge.notify =
        function (
            title,
            message,
            options
        ) {

            const notifications =
                Bridge.systems.notifications;


            if (notifications) {

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
                        ] ===
                        "function"
                    ) {

                        try {

                            return notifications[
                                method
                            ](
                                title,
                                message,
                                options || {}
                            );

                        } catch (error) {

                            /* Continue */

                        }
                    }
                }
            }


            return Bridge.emit(
                "notification:show",
                {
                    title:
                        title,

                    message:
                        message,

                    options:
                        options || {}
                }
            );
        };


    /* ========================================================
       CONNECT SERVICES
    ======================================================== */

    Bridge.connectServices =
        function () {

            /*
             * Service Bridge
             */

            const serviceBridge =
                window.HalDoV20ServiceBridge ||
                HalDoOS.serviceBridge ||
                V20.serviceBridge;


            if (
                serviceBridge &&
                serviceBridge !== Bridge
            ) {

                Bridge.systems.serviceBridge =
                    serviceBridge;


                /*
                 * Fehlende Systeme aus der
                 * Service Bridge übernehmen.
                 */

                const names = [
                    "kernel",
                    "system",
                    "app-manager",
                    "app-registry",
                    "app-runtime",
                    "router",
                    "window-manager",
                    "storage",
                    "storage-manager",
                    "language-manager",
                    "language-system",
                    "ai",
                    "voice",
                    "speech",
                    "notifications",
                    "config",
                    "desktop",
                    "ezidi-keyboard",
                    "cosmic",
                    "cosmic-welcome"
                ];


                const aliases = {

                    "app-manager":
                        "appManager",

                    "app-registry":
                        "appRegistry",

                    "app-runtime":
                        "appRuntime",

                    "window-manager":
                        "windowManager",

                    "storage-manager":
                        "storageManager",

                    "language-manager":
                        "language",

                    "language-system":
                        "language",

                    "ezidi-keyboard":
                        "ezidiKeyboard",

                    "cosmic":
                        "cosmic",

                    "cosmic-welcome":
                        "cosmicWelcome"

                };


                names.forEach(
                    function (
                        name
                    ) {

                        const property =
                            aliases[name] ||
                            name;


                        if (
                            !Bridge.systems[
                                property
                            ] &&
                            typeof serviceBridge.get ===
                            "function"
                        ) {

                            const service =
                                serviceBridge.get(
                                    name
                                );


                            if (service) {

                                Bridge.systems[
                                    property
                                ] =
                                    service;
                            }
                        }
                    }
                );


                Bridge.systems.appManager =
                    Bridge.systems.appManager ||
                    Bridge.appManager ||
                    null;

                Bridge.systems.appRegistry =
                    Bridge.systems.appRegistry ||
                    Bridge.appRegistry ||
                    null;

                Bridge.systems.appRuntime =
                    Bridge.systems.appRuntime ||
                    Bridge.appRuntime ||
                    null;
            }


            return Bridge.systems;
        };


    /* ========================================================
       CREATE APP CONTEXT
    ======================================================== */

    Bridge.createAppContext =
        function (
            appId
        ) {

            const id =
                String(
                    appId ||
                    ""
                )
                .trim();


            return {

                appId:
                    id,

                bridge:
                    Bridge,

                v20:
                    V20,

                kernel:
                    Bridge.getSystem(
                        "kernel"
                    ),

                system:
                    Bridge.getSystem(
                        "system"
                    ),

                registry:
                    Bridge.getSystem(
                        "appRegistry"
                    ),

                runtime:
                    Bridge.getSystem(
                        "appRuntime"
                    ),

                appManager:
                    Bridge.getSystem(
                        "appManager"
                    ),

                router:
                    Bridge.getSystem(
                        "appRouter"
                    ),

                windowManager:
                    Bridge.getSystem(
                        "windowManager"
                    ),

                storage:
                    Bridge.storage,

                language:
                    Bridge.language,

                ai:
                    Bridge.getSystem(
                        "ai"
                    ),

                voice:
                    Bridge.getSystem(
                        "voice"
                    ),

                notifications:
                    Bridge.getSystem(
                        "notifications"
                    ),

                cosmic:
                    Bridge.getSystem(
                        "cosmic"
                    ),

                cosmicWelcome:
                    Bridge.getSystem(
                        "cosmicWelcome"
                    ),

                ezidiKeyboard:
                    Bridge.getSystem(
                        "ezidiKeyboard"
                    ),

                events:
                    window.HalDoAppEvents ||
                    V20.appEvents ||
                    null,

                services:
                    Bridge.systems.serviceBridge ||
                    null

            };
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
                    ).filter(
                        function (
                            key
                        ) {

                            return Boolean(
                                Bridge.systems[
                                    key
                                ]
                            );
                        }
                    ),

                apps:
                    Bridge.apps.size,

                hasServiceBridge:
                    Boolean(
                        Bridge.systems.serviceBridge
                    ),

                hasEventBus:
                    Boolean(
                        Bridge.systems.appEvents
                    ),

                hasRuntime:
                    Boolean(
                        Bridge.systems.appRuntime
                    ),

                hasRegistry:
                    Boolean(
                        Bridge.systems.appRegistry
                    ),

                hasAI:
                    Boolean(
                        Bridge.systems.ai
                    ),

                hasVoice:
                    Boolean(
                        Bridge.systems.voice
                    ),

                hasCosmic:
                    Boolean(
                        Bridge.systems.cosmic
                    ),

                timestamp:
                    Date.now()
            };
        };


    /* ========================================================
       INITIALIZE
    ======================================================== */

    Bridge.init =
        function () {

            if (
                Bridge.ready
            ) {

                return Bridge;
            }


            Bridge.log(
                "Initializing HalDo AI OS 20 Core Bridge..."
            );


            /*
             * Systeme suchen.
             */

            Bridge.discoverSystems();


            /*
             * Service Bridge anbinden.
             */

            Bridge.connectServices();


            /*
             * Event Bus nach Discovery erneut prüfen.
             */

            Bridge.systems.appEvents =
                window.HalDoAppEvents ||
                window.HalDoV20AppEvents ||
                HalDoOS.appEvents ||
                V20.appEvents ||
                Bridge.systems.appEvents ||
                null;


            /*
             * Gespeicherte Sprache laden.
             */

            try {

                const raw =
                    window.localStorage.getItem(
                        "haldo.language"
                    );


                if (raw) {

                    let language =
                        raw;


                    try {

                        language =
                            JSON.parse(
                                raw
                            );

                    } catch (error) {

                        /* Plain string */

                    }


                    if (
                        language
                    ) {

                        document.documentElement.lang =
                            language;
                    }
                }

            } catch (error) {

                Bridge.warn(
                    "Language restore failed."
                );
            }


            /*
             * Ready setzen.
             */

            Bridge.ready =
                true;


            /*
             * V20 Namespace:
             *
             * NICHT ersetzen!
             * Nur Eigenschaften ergänzen.
             */

            V20.coreBridge =
                Bridge;

            V20.bridge =
                Bridge;

            V20.version =
                V20.version ||
                "20.0.0";


            /*
             * HalDoOS
             */

            HalDoOS.v20 =
                V20;

            HalDoOS.v20Bridge =
                Bridge;


            /*
             * Globaler direkter Zugriff.
             */

            window.HalDoV20CoreBridge =
                Bridge;


            /*
             * Event Bus informieren.
             */

            Bridge.emit(
                "v20:core-ready",
                Bridge.status()
            );


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
                        "v20:core-ready",
                        Bridge.status()
                    );

                } catch (error) {

                    Bridge.warn(
                        "Kernel notification failed."
                    );
                }
            }


            Bridge.log(
                "HalDo AI OS 20 Core Bridge ready.",
                Bridge.status()
            );


            return Bridge;
        };


    /* ========================================================
       GLOBAL API
       ======================================================== */

    /*
     * WICHTIG:
     *
     * Kein:
     *
     *   window.HalDoV20 = Bridge;
     *
     * mehr!
     *
     * Dadurch bleiben Service Bridge, Event Bus,
     * Registry usw. im gemeinsamen Namespace erhalten.
     */

    V20.coreBridge =
        Bridge;

    V20.bridge =
        Bridge;


    HalDoOS.v20 =
        V20;


    HalDoOS.v20Bridge =
        Bridge;


    window.HalDoV20CoreBridge =
        Bridge;


    /* ========================================================
       BOOT
    ======================================================== */

    function boot() {

        try {

            Bridge.init();

        } catch (error) {

            Bridge.error(
                "HalDo AI OS 20 Core Bridge Startfehler:",
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
                        null

                }
            );
        }
    );


    window.addEventListener(
        "unhandledrejection",
        function (
            event
        ) {

            Bridge.emit(
                "system:unhandled-rejection",
                {

                    reason:
                        event.reason ||
                        "Unknown rejection"

                }
            );
        }
    );


})(window, document);