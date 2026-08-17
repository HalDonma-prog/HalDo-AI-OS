/*
 * ============================================================
 * HalDo AI OS 20
 * Universal Service Bridge
 * ============================================================
 *
 * Datei:
 *   js/haldo-v20-service-bridge.js
 *
 * Aufgabe:
 *   Verbindet die V20-App-Architektur mit bereits vorhandenen
 *   HalDo-Systemen.
 *
 * Bestehende Systeme werden NICHT ersetzt.
 * Die Bridge erkennt vorhandene APIs und verwendet diese.
 *
 * ============================================================
 */

(function (window, document) {

    "use strict";


    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};


    const V20 =
        window.HalDoV20 =
        window.HalDoV20 || {};


    const services =
        new Map();


    const aliases =
        new Map();


    const listeners =
        new Map();


    const Bridge = {

        name:
            "HalDo V20 Service Bridge",

        version:
            "20.0.0",

        ready:
            false
    };


    /* ========================================================
       HELPERS
    ======================================================== */

    function emit(
        eventName,
        data
    ) {

        const handlers =
            listeners.get(
                eventName
            );


        if (!handlers) {
            return;
        }


        Array.from(
            handlers
        ).forEach(
            function (handler) {

                try {

                    handler(
                        data
                    );

                } catch (error) {

                    console.error(
                        "[HalDo Service Bridge]",
                        error
                    );
                }

            }
        );
    }


    function normalize(
        value
    ) {

        return String(
            value || ""
        )
        .trim()
        .toLowerCase();
    }


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


                if (current) {
                    return current;
                }

            } else if (
                window[name]
            ) {

                return window[name];
            }
        }


        return null;
    }


    /* ========================================================
       EVENTS
    ======================================================== */

    Bridge.on =
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


            if (
                !listeners.has(
                    eventName
                )
            ) {

                listeners.set(
                    eventName,
                    new Set()
                );
            }


            const set =
                listeners.get(
                    eventName
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


    /* ========================================================
       REGISTER SERVICE
    ======================================================== */

    Bridge.register =
        function (
            name,
            service,
            metadata
        ) {

            const id =
                normalize(name);


            if (
                !id ||
                !service
            ) {

                return false;
            }


            services.set(
                id,
                {

                    id:
                        id,

                    service:
                        service,

                    metadata:
                        metadata || {},

                    registeredAt:
                        Date.now()
                }
            );


            emit(
                "service:registered",
                {

                    id:
                        id,

                    service:
                        service
                }
            );


            return true;
        };


    /* ========================================================
       ALIAS
    ======================================================== */

    Bridge.alias =
        function (
            aliasName,
            serviceName
        ) {

            aliases.set(
                normalize(aliasName),
                normalize(serviceName)
            );


            return true;
        };


    /* ========================================================
       GET SERVICE
    ======================================================== */

    Bridge.get =
        function (
            name
        ) {

            let id =
                normalize(name);


            if (
                aliases.has(id)
            ) {

                id =
                    aliases.get(id);
            }


            const record =
                services.get(
                    id
                );


            return record
                ? record.service
                : null;
        };


    /* ========================================================
       HAS SERVICE
    ======================================================== */

    Bridge.has =
        function (
            name
        ) {

            return Boolean(
                Bridge.get(name)
            );
        };


    /* ========================================================
       DISCOVER EXISTING SYSTEM
    ======================================================== */

    Bridge.discover =
        function () {

            /*
             * Kernel
             */

            const kernel =
                findGlobal(
                    [
                        "HalDoKernel",
                        "HalDoOS.kernel",
                        "kernel"
                    ]
                );


            if (kernel) {

                Bridge.register(
                    "kernel",
                    kernel,
                    {
                        source:
                            "existing-system"
                    }
                );
            }


            /*
             * System
             */

            const system =
                findGlobal(
                    [
                        "HalDoSystem",
                        "HalDoOS.system",
                        "system"
                    ]
                );


            if (system) {

                Bridge.register(
                    "system",
                    system,
                    {
                        source:
                            "existing-system"
                    }
                );
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


            if (appManager) {

                Bridge.register(
                    "app-manager",
                    appManager,
                    {
                        source:
                            "existing-system"
                    }
                );
            }


            /*
             * App Registry
             */

            const registry =
                findGlobal(
                    [
                        "HalDoV20AppRegistry",
                        "HalDoOS.appRegistry"
                    ]
                );


            if (registry) {

                Bridge.register(
                    "app-registry",
                    registry,
                    {
                        source:
                            "v20"
                    }
                );
            }


            /*
             * App Runtime
             */

            const runtime =
                findGlobal(
                    [
                        "HalDoAppRuntime",
                        "HalDoV20.appRuntime"
                    ]
                );


            if (runtime) {

                Bridge.register(
                    "app-runtime",
                    runtime,
                    {
                        source:
                            "v20"
                    }
                );
            }


            /*
             * Router
             */

            const router =
                findGlobal(
                    [
                        "HalDoAppRouter",
                        "HalDoOS.appRouter",
                        "HalDoRouter"
                    ]
                );


            if (router) {

                Bridge.register(
                    "router",
                    router,
                    {
                        source:
                            "existing-system"
                    }
                );
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


            if (windowManager) {

                Bridge.register(
                    "window-manager",
                    windowManager,
                    {
                        source:
                            "existing-system"
                    }
                );
            }


            /*
             * Storage
             */

            const storage =
                findGlobal(
                    [
                        "HalDoStorage",
                        "HalDoStorageManager",
                        "HalDoOS.storage"
                    ]
                );


            if (storage) {

                Bridge.register(
                    "storage",
                    storage,
                    {
                        source:
                            "existing-system"
                    }
                );
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


            if (storageManager) {

                Bridge.register(
                    "storage-manager",
                    storageManager,
                    {
                        source:
                            "existing-system"
                    }
                );
            }


            /*
             * Language Manager
             */

            const languageManager =
                findGlobal(
                    [
                        "HalDoLanguageManager",
                        "HalDoOS.languageManager"
                    ]
                );


            if (languageManager) {

                Bridge.register(
                    "language-manager",
                    languageManager,
                    {
                        source:
                            "existing-system"
                    }
                );
            }


            /*
             * Language System
             */

            const languageSystem =
                findGlobal(
                    [
                        "HalDoLanguageSystem",
                        "HalDoOS.languageSystem"
                    ]
                );


            if (languageSystem) {

                Bridge.register(
                    "language-system",
                    languageSystem,
                    {
                        source:
                            "existing-system"
                    }
                );
            }


            /*
             * AI
             */

            const ai =
                findGlobal(
                    [
                        "HalDoAI",
                        "HalDoOS.ai",
                        "HalDoAICore"
                    ]
                );


            if (ai) {

                Bridge.register(
                    "ai",
                    ai,
                    {
                        source:
                            "existing-system"
                    }
                );
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


            if (voice) {

                Bridge.register(
                    "voice",
                    voice,
                    {
                        source:
                            "existing-system"
                    }
                );
            }


            /*
             * Speech
             */

            const speech =
                findGlobal(
                    [
                        "HalDoSpeech",
                        "HalDoOS.speech"
                    ]
                );


            if (speech) {

                Bridge.register(
                    "speech",
                    speech,
                    {
                        source:
                            "existing-system"
                    }
                );
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


            if (notifications) {

                Bridge.register(
                    "notifications",
                    notifications,
                    {
                        source:
                            "existing-system"
                    }
                );
            }


            /*
             * Voice / AI speech alternatives
             */

            const aiSpeech =
                findGlobal(
                    [
                        "HalDoAISpeech",
                        "HalDoOS.aiSpeech"
                    ]
                );


            if (aiSpeech) {

                Bridge.register(
                    "ai-speech",
                    aiSpeech,
                    {
                        source:
                            "existing-system"
                    }
                );
            }


            /*
             * Config
             */

            const config =
                findGlobal(
                    [
                        "HalDoConfigManager",
                        "HalDoOS.config"
                    ]
                );


            if (config) {

                Bridge.register(
                    "config",
                    config,
                    {
                        source:
                            "existing-system"
                    }
                );
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


            if (moduleManager) {

                Bridge.register(
                    "module-manager",
                    moduleManager,
                    {
                        source:
                            "existing-system"
                    }
                );
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


            if (shell) {

                Bridge.register(
                    "shell",
                    shell,
                    {
                        source:
                            "existing-system"
                    }
                );
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


            if (desktop) {

                Bridge.register(
                    "desktop",
                    desktop,
                    {
                        source:
                            "existing-system"
                    }
                );
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


            if (ezidiKeyboard) {

                Bridge.register(
                    "ezidi-keyboard",
                    ezidiKeyboard,
                    {
                        source:
                            "existing-system"
                    }
                );
            }


            /*
             * Cosmic systems
             */

            const cosmic =
                findGlobal(
                    [
                        "HalDoCosmicEngine",
                        "HalDoOS.cosmic"
                    ]
                );


            if (cosmic) {

                Bridge.register(
                    "cosmic",
                    cosmic,
                    {
                        source:
                            "v20"
                    }
                );
            }


            const cosmicWelcome =
                findGlobal(
                    [
                        "HalDoCosmicWelcome",
                        "HalDoOS.cosmicWelcome"
                    ]
                );


            if (cosmicWelcome) {

                Bridge.register(
                    "cosmic-welcome",
                    cosmicWelcome,
                    {
                        source:
                            "v20"
                    }
                );
            }


            return Bridge.getStatus();
        };


    /* ========================================================
       CREATE ALIASES
    ======================================================== */

    Bridge.createAliases =
        function () {

            const map = {

                apps:
                    "app-manager",

                registry:
                    "app-registry",

                runtime:
                    "app-runtime",

                windows:
                    "window-manager",

                navigation:
                    "router",

                i18n:
                    "language-manager",

                languages:
                    "language-manager",

                speech:
                    "speech",

                tts:
                    "voice",

                ai:
                    "ai",

                data:
                    "storage",

                database:
                    "storage",

                settings:
                    "config",

                desktop:
                    "desktop",

                cosmic:
                    "cosmic"
            };


            Object.keys(
                map
            )
            .forEach(
                function (key) {

                    Bridge.alias(
                        key,
                        map[key]
                    );

                }
            );


            return true;
        };


    /* ========================================================
       CALL SERVICE
    ======================================================== */

    Bridge.call =
        async function (
            serviceName,
            method,
            ...args
        ) {

            const service =
                Bridge.get(
                    serviceName
                );


            if (!service) {

                throw new Error(
                    "Service nicht verfügbar: " +
                    serviceName
                );
            }


            if (
                typeof service[method] !==
                "function"
            ) {

                throw new Error(
                    "Methode nicht verfügbar: " +
                    serviceName +
                    "." +
                    method
                );
            }


            return service[method](
                ...args
            );
        };


    /* ========================================================
       OPTIONAL CALL
    ======================================================== */

    Bridge.tryCall =
        async function (
            serviceName,
            method,
            ...args
        ) {

            try {

                return await Bridge.call(
                    serviceName,
                    method,
                    ...args
                );

            } catch (error) {

                console.warn(
                    "[HalDo Service Bridge]",
                    error.message
                );


                return null;
            }
        };


    /* ========================================================
       GET ALL SERVICES
    ======================================================== */

    Bridge.getAll =
        function () {

            const result = {};


            services.forEach(
                function (
                    record,
                    id
                ) {

                    result[id] =
                        record.service;

                }
            );


            return result;
        };


    /* ========================================================
       STATUS
    ======================================================== */

    Bridge.getStatus =
        function () {

            return {

                name:
                    Bridge.name,

                version:
                    Bridge.version,

                ready:
                    Bridge.ready,

                services:
                    Array.from(
                        services.keys()
                    ),

                aliases:
                    Array.from(
                        aliases.entries()
                    ),

                timestamp:
                    Date.now()
            };
        };


    /* ========================================================
       CONNECT TO APP CONTEXT
    ======================================================== */

    Bridge.createAppServices =
        function (
            appId
        ) {

            return {

                appId:
                    appId,

                kernel:
                    Bridge.get(
                        "kernel"
                    ),

                system:
                    Bridge.get(
                        "system"
                    ),

                appManager:
                    Bridge.get(
                        "app-manager"
                    ),

                registry:
                    Bridge.get(
                        "app-registry"
                    ),

                runtime:
                    Bridge.get(
                        "app-runtime"
                    ),

                router:
                    Bridge.get(
                        "router"
                    ),

                windowManager:
                    Bridge.get(
                        "window-manager"
                    ),

                storage:
                    Bridge.get(
                        "storage"
                    ) ||
                    Bridge.get(
                        "storage-manager"
                    ),

                language:
                    Bridge.get(
                        "language-manager"
                    ) ||
                    Bridge.get(
                        "language-system"
                    ),

                ai:
                    Bridge.get(
                        "ai"
                    ),

                voice:
                    Bridge.get(
                        "voice"
                    ),

                speech:
                    Bridge.get(
                        "speech"
                    ),

                notifications:
                    Bridge.get(
                        "notifications"
                    ),

                config:
                    Bridge.get(
                        "config"
                    ),

                modules:
                    Bridge.get(
                        "module-manager"
                    ),

                shell:
                    Bridge.get(
                        "shell"
                    ),

                desktop:
                    Bridge.get(
                        "desktop"
                    ),

                ezidiKeyboard:
                    Bridge.get(
                        "ezidi-keyboard"
                    ),

                cosmic:
                    Bridge.get(
                        "cosmic"
                    ),

                cosmicWelcome:
                    Bridge.get(
                        "cosmic-welcome"
                    )
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


            /*
             * Zuerst vorhandene Systeme finden.
             */

            Bridge.discover();


            /*
             * Danach einheitliche Namen erstellen.
             */

            Bridge.createAliases();


            Bridge.ready =
                true;


            /*
             * Global verfügbar machen.
             */

            window.HalDoV20ServiceBridge =
                Bridge;


            HalDoOS.serviceBridge =
                Bridge;


            V20.serviceBridge =
                Bridge;


            /*
             * Runtime benachrichtigen.
             */

            const runtime =
                window.HalDoAppRuntime;


            if (
                runtime &&
                typeof runtime.getStatus ===
                "function"
            ) {

                emit(
                    "runtime:connected",
                    {

                        runtime:
                            runtime,

                        status:
                            runtime.getStatus()
                    }
                );
            }


            /*
             * Registry benachrichtigen.
             */

            const registry =
                window.HalDoV20AppRegistry;


            if (
                registry &&
                typeof registry.getStatus ===
                "function"
            ) {

                emit(
                    "registry:connected",
                    {

                        registry:
                            registry,

                        status:
                            registry.getStatus()
                    }
                );
            }


            /*
             * System Event
             */

            const bus =
                window.HalDoAppEvents;


            if (
                bus &&
                typeof bus.emit ===
                "function"
            ) {

                bus.emit(
                    "system:v20-service-bridge-ready",
                    Bridge.getStatus(),
                    {
                        internal:
                            true
                    }
                );
            }


            emit(
                "bridge:ready",
                Bridge.getStatus()
            );


            console.log(
                "[HalDo AI OS 20]",
                "Service Bridge bereit:",
                services.size,
                "Services"
            );


            return Bridge;
        };


    /* ========================================================
       BOOT
    ======================================================== */

    function boot() {

        try {

            Bridge.init();

        } catch (error) {

            console.error(
                "[HalDo AI OS 20]",
                "Service Bridge Fehler:",
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


})(window, document);