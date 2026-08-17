/*
 * ============================================================
 * HalDo AI OS 20
 * Universal Application Runtime
 * ============================================================
 *
 * Datei:
 *   js/haldo-app-runtime.js
 *
 * Aufgabe:
 *   Gemeinsame Laufzeit für alle HalDo Apps.
 *
 * Architektur:
 *
 *   App Manifest
 *        ↓
 *   App Registry
 *        ↓
 *   App Runtime
 *        ↓
 *   App Module
 *        ↓
 *   Event Bus / Kernel / System / Storage / Language
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


    const runtimes =
        new Map();


    const factories =
        new Map();


    const listeners =
        new Map();


    const Runtime = {

        name:
            "HalDo V20 Universal App Runtime",

        version:
            "20.0.0",

        ready:
            false
    };


    /* ========================================================
       HELPERS
    ======================================================== */

    function normalizeId(id) {

        return String(id || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
    }


    function safeClone(value) {

        if (
            value === undefined ||
            value === null
        ) {

            return value;
        }


        try {

            return JSON.parse(
                JSON.stringify(value)
            );

        } catch (error) {

            return value;
        }
    }


    function emit(
        eventName,
        data
    ) {

        const set =
            listeners.get(
                eventName
            );


        if (!set) {
            return;
        }


        Array.from(
            set
        ).forEach(
            function (handler) {

                try {

                    handler(
                        data
                    );

                } catch (error) {

                    console.error(
                        "[HalDo Runtime]",
                        error
                    );
                }

            }
        );
    }


    /* ========================================================
       EVENTS
    ======================================================== */

    Runtime.on = function (
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
       REGISTER FACTORY
    ======================================================== */

    Runtime.register =
        function (
            appId,
            factory
        ) {

            const id =
                normalizeId(
                    appId
                );


            if (
                !id ||
                typeof factory !==
                "function"
            ) {

                console.error(
                    "[HalDo Runtime]",
                    "Ungültige App Factory:",
                    appId
                );

                return false;
            }


            factories.set(
                id,
                factory
            );


            emit(
                "factory:registered",
                {
                    appId:
                        id
                }
            );


            return true;
        };


    /* ========================================================
       UNREGISTER FACTORY
    ======================================================== */

    Runtime.unregister =
        function (
            appId
        ) {

            return factories.delete(
                normalizeId(appId)
            );
        };


    /* ========================================================
       FACTORY EXISTS
    ======================================================== */

    Runtime.hasFactory =
        function (
            appId
        ) {

            return factories.has(
                normalizeId(appId)
            );
        };


    /* ========================================================
       GET APP DEFINITION
    ======================================================== */

    function getDefinition(
        appId
    ) {

        const registry =
            window.HalDoV20AppRegistry;


        if (
            registry &&
            typeof registry.get ===
            "function"
        ) {

            return registry.get(
                appId
            );
        }


        const manifest =
            window.HalDoV20AppManifest;


        if (
            manifest &&
            typeof manifest.get ===
            "function"
        ) {

            return manifest.get(
                appId
            );
        }


        return null;
    }


    /* ========================================================
       SERVICE ACCESS
    ======================================================== */

    function getServices() {

        return {

            kernel:
                window.HalDoKernel ||
                null,

            system:
                window.HalDoSystem ||
                (
                    HalDoOS &&
                    HalDoOS.system
                ) ||
                null,

            appManager:
                HalDoOS.appManager ||
                window.HalDoAppManager ||
                null,

            router:
                HalDoOS.appRouter ||
                window.HalDoAppRouter ||
                null,

            windowManager:
                HalDoOS.windowManager ||
                window.HalDoWindowManager ||
                null,

            storage:
                HalDoOS.storage ||
                window.HalDoStorage ||
                window.HalDoStorageManager ||
                null,

            language:
                HalDoOS.language ||
                window.HalDoLanguage ||
                window.HalDoLanguageManager ||
                null,

            ai:
                HalDoOS.ai ||
                window.HalDoAI ||
                null,

            voice:
                HalDoOS.voice ||
                window.HalDoVoice ||
                null,

            speech:
                HalDoOS.speech ||
                window.HalDoSpeech ||
                null,

            notifications:
                HalDoOS.notifications ||
                window.HalDoNotifications ||
                null,

            events:
                window.HalDoAppEvents ||
                null,

            registry:
                window.HalDoV20AppRegistry ||
                null,

            runtime:
                Runtime
        };
    }


    /* ========================================================
       APP CONTEXT
    ======================================================== */

    Runtime.createContext =
        function (
            appId,
            customContext
        ) {

            const id =
                normalizeId(
                    appId
                );


            const definition =
                getDefinition(
                    id
                );


            const services =
                getServices();


            const events =
                services.events;


            const context = {

                appId:
                    id,

                app:
                    definition,

                version:
                    definition &&
                    definition.version
                        ? definition.version
                        : "20.0.0",

                services:
                    services,

                kernel:
                    services.kernel,

                system:
                    services.system,

                appManager:
                    services.appManager,

                router:
                    services.router,

                windowManager:
                    services.windowManager,

                storage:
                    services.storage,

                language:
                    services.language,

                ai:
                    services.ai,

                voice:
                    services.voice,

                speech:
                    services.speech,

                notifications:
                    services.notifications,

                events:
                    events,

                state:
                    {},

                destroyed:
                    false,

                metadata:
                    {},


                /*
                 * Event subscription
                 */

                on:
                    function (
                        eventName,
                        handler
                    ) {

                        if (
                            !events ||
                            typeof events.subscribeApp !==
                            "function"
                        ) {

                            return function () {};
                        }


                        return events.subscribeApp(
                            id,
                            eventName,
                            handler
                        );
                    },


                once:
                    function (
                        eventName,
                        handler
                    ) {

                        if (
                            !events ||
                            typeof events.on !==
                            "function"
                        ) {

                            return function () {};
                        }


                        return events.on(
                            eventName,
                            handler,
                            {
                                once:
                                    true
                            }
                        );
                    },


                off:
                    function (
                        eventName,
                        handler
                    ) {

                        if (
                            !events ||
                            typeof events.off !==
                            "function"
                        ) {

                            return;
                        }


                        events.off(
                            eventName,
                            handler
                        );
                    },


                /*
                 * Own app event
                 */

                emit:
                    function (
                        eventName,
                        data
                    ) {

                        if (
                            !events ||
                            typeof events.appEvent !==
                            "function"
                        ) {

                            return null;
                        }


                        return events.appEvent(
                            id,
                            eventName,
                            data
                        );
                    },


                /*
                 * Direct communication
                 */

                send:
                    function (
                        targetApp,
                        eventName,
                        data
                    ) {

                        if (
                            !events ||
                            typeof events.send !==
                            "function"
                        ) {

                            return null;
                        }


                        return events.send(
                            id,
                            targetApp,
                            eventName,
                            data
                        );
                    },


                /*
                 * Broadcast
                 */

                broadcast:
                    function (
                        eventName,
                        data
                    ) {

                        if (
                            !events ||
                            typeof events.broadcast !==
                            "function"
                        ) {

                            return null;
                        }


                        return events.broadcast(
                            id,
                            eventName,
                            data
                        );
                    },


                /*
                 * System event
                 */

                systemEvent:
                    function (
                        eventName,
                        data
                    ) {

                        if (
                            !events ||
                            typeof events.system !==
                            "function"
                        ) {

                            return null;
                        }


                        return events.system(
                            eventName,
                            data
                        );
                    },


                /*
                 * Open another app
                 */

                openApp:
                    async function (
                        targetApp,
                        options
                    ) {

                        const target =
                            normalizeId(
                                targetApp
                            );


                        /*
                         * Existing Router
                         */

                        if (
                            services.router &&
                            typeof services.router.navigate ===
                            "function"
                        ) {

                            try {

                                return await services.router.navigate(
                                    target,
                                    options || {}
                                );

                            } catch (error) {

                                console.warn(
                                    "[HalDo Runtime]",
                                    "Router konnte App nicht öffnen:",
                                    target,
                                    error
                                );
                            }
                        }


                        /*
                         * Existing App Manager
                         */

                        if (
                            services.appManager &&
                            typeof services.appManager.openApp ===
                            "function"
                        ) {

                            return services.appManager.openApp(
                                target,
                                options || {}
                            );
                        }


                        /*
                         * Registry fallback
                         */

                        if (
                            services.registry &&
                            typeof services.registry.start ===
                            "function"
                        ) {

                            return services.registry.start(
                                target,
                                options || {}
                            );
                        }


                        /*
                         * Event fallback
                         */

                        if (
                            events &&
                            typeof events.emit ===
                            "function"
                        ) {

                            return events.emit(
                                "app:open",
                                {

                                    appId:
                                        target,

                                    sourceApp:
                                        id,

                                    options:
                                        options || {}
                                },
                                {

                                    sourceApp:
                                        id
                                }
                            );
                        }


                        return null;
                    },


                /*
                 * Close own app
                 */

                closeApp:
                    async function () {

                        if (
                            services.registry &&
                            typeof services.registry.stop ===
                            "function"
                        ) {

                            return services.registry.stop(
                                id
                            );
                        }


                        return null;
                    },


                /*
                 * Storage helpers
                 */

                get:
                    async function (
                        key,
                        fallback
                    ) {

                        if (
                            services.storage
                        ) {

                            try {

                                if (
                                    typeof services.storage.get ===
                                    "function"
                                ) {

                                    const result =
                                        await services.storage.get(
                                            key
                                        );


                                    return result ===
                                        undefined
                                        ? fallback
                                        : result;
                                }

                            } catch (error) {

                                console.warn(
                                    "[HalDo Runtime]",
                                    "Storage get Fehler:",
                                    error
                                );
                            }
                        }


                        return fallback;
                    },


                set:
                    async function (
                        key,
                        value
                    ) {

                        if (
                            services.storage
                        ) {

                            try {

                                if (
                                    typeof services.storage.set ===
                                    "function"
                                ) {

                                    return await services.storage.set(
                                        key,
                                        value
                                    );
                                }

                            } catch (error) {

                                console.warn(
                                    "[HalDo Runtime]",
                                    "Storage set Fehler:",
                                    error
                                );
                            }
                        }


                        return false;
                    },


                remove:
                    async function (
                        key
                    ) {

                        if (
                            services.storage
                        ) {

                            try {

                                if (
                                    typeof services.storage.remove ===
                                    "function"
                                ) {

                                    return await services.storage.remove(
                                        key
                                    );
                                }

                            } catch (error) {

                                console.warn(
                                    "[HalDo Runtime]",
                                    "Storage remove Fehler:",
                                    error
                                );
                            }
                        }


                        return false;
                    },


                /*
                 * Language
                 */

                translate:
                    function (
                        key,
                        fallback
                    ) {

                        const language =
                            services.language;


                        if (
                            language
                        ) {

                            if (
                                typeof language.translate ===
                                "function"
                            ) {

                                return language.translate(
                                    key,
                                    fallback
                                );
                            }


                            if (
                                typeof language.t ===
                                "function"
                            ) {

                                return language.t(
                                    key
                                );
                            }
                        }


                        return (
                            fallback ||
                            key
                        );
                    },


                /*
                 * State
                 */

                setState:
                    function (
                        key,
                        value
                    ) {

                        context.state[key] =
                            value;


                        if (
                            services.registry &&
                            typeof services.registry.setState ===
                            "function"
                        ) {

                            services.registry.setState(
                                id,
                                "running",
                                {

                                    appState:
                                        safeClone(
                                            context.state
                                        )
                                }
                            );
                        }


                        context.emit(
                            "state:changed",
                            {

                                key:
                                    key,

                                value:
                                    value,

                                state:
                                    safeClone(
                                        context.state
                                    )
                            }
                        );
                    },


                getState:
                    function (
                        key,
                        fallback
                    ) {

                        if (
                            Object.prototype.hasOwnProperty.call(
                                context.state,
                                key
                            )
                        ) {

                            return context.state[key];
                        }


                        return fallback;
                    },


                /*
                 * DOM helper
                 */

                createElement:
                    function (
                        tag,
                        className,
                        text
                    ) {

                        const element =
                            document.createElement(
                                tag || "div"
                            );


                        if (className) {

                            element.className =
                                className;
                        }


                        if (
                            text !==
                            undefined
                        ) {

                            element.textContent =
                                text;
                        }


                        element.dataset.haldoApp =
                            id;


                        return element;
                    },


                /*
                 * Lifecycle event
                 */

                lifecycle:
                    function (
                        name,
                        data
                    ) {

                        if (
                            events &&
                            typeof events.emit ===
                            "function"
                        ) {

                            return events.emit(
                                "app:" +
                                id +
                                ":lifecycle:" +
                                normalizeId(name),
                                data || {},
                                {

                                    appId:
                                        id,

                                    lifecycle:
                                        true
                                }
                            );
                        }


                        return null;
                    }

            };


            /*
             * Custom context darf ergänzen,
             * aber die Kern-APIs bleiben erhalten.
             */

            if (
                customContext &&
                typeof customContext ===
                "object"
            ) {

                Object.keys(
                    customContext
                )
                .forEach(
                    function (key) {

                        if (
                            !Object.prototype.hasOwnProperty.call(
                                context,
                                key
                            )
                        ) {

                            context[key] =
                                customContext[key];
                        }

                    }
                );
            }


            return context;
        };


    /* ========================================================
       CREATE INSTANCE
    ======================================================== */

    Runtime.createInstance =
        async function (
            appId,
            options
        ) {

            const id =
                normalizeId(
                    appId
                );


            const definition =
                getDefinition(
                    id
                );


            if (!definition) {

                throw new Error(
                    "Keine App-Definition gefunden: " +
                    id
                );
            }


            const factory =
                factories.get(
                    id
                );


            const context =
                Runtime.createContext(
                    id,
                    options || {}
                );


            let instance =
                null;


            /*
             * Factory
             */

            if (
                factory
            ) {

                instance =
                    await factory(
                        context,
                        definition
                    );

            } else {

                /*
                 * Falls eine App-Instanz
                 * bereits registriert wurde.
                 */

                const registry =
                    window.HalDoV20AppRegistry;


                if (
                    registry &&
                    typeof registry.getInstance ===
                    "function"
                ) {

                    instance =
                        registry.getInstance(
                            id
                        );
                }
            }


            /*
             * Fallback Instance
             *
             * Damit das System nicht abstürzt,
             * wenn eine App-Datei noch nicht geladen
             * wurde. Dies ist nur Runtime-Fallback,
             * kein Ersatz für die echte App.
             */

            if (!instance) {

                instance = {

                    appId:
                        id,

                    context:
                        context,

                    started:
                        false,


                    async init() {

                        context.lifecycle(
                            "init"
                        );

                    },


                    async start() {

                        this.started =
                            true;

                        context.lifecycle(
                            "start"
                        );

                    },


                    async stop() {

                        this.started =
                            false;

                        context.lifecycle(
                            "stop"
                        );

                    },


                    destroy() {

                        this.started =
                            false;

                        context.destroyed =
                            true;

                        context.lifecycle(
                            "destroy"
                        );

                    }

                };
            }


            /*
             * Context immer verfügbar machen.
             */

            if (
                typeof instance ===
                "object"
            ) {

                if (
                    !instance.context
                ) {

                    instance.context =
                        context;
                }


                if (
                    !instance.appId
                ) {

                    instance.appId =
                        id;
                }
            }


            return instance;
        };


    /* ========================================================
       START
    ======================================================== */

    Runtime.start =
        async function (
            appId,
            options
        ) {

            const id =
                normalizeId(
                    appId
                );


            /*
             * Bereits aktiv
             */

            if (
                runtimes.has(id)
            ) {

                const current =
                    runtimes.get(id);


                if (
                    current &&
                    current.instance
                ) {

                    return current.instance;
                }
            }


            const instance =
                await Runtime.createInstance(
                    id,
                    options || {}
                );


            const runtimeRecord = {

                appId:
                    id,

                instance:
                    instance,

                context:
                    instance.context,

                startedAt:
                    Date.now()
            };


            runtimes.set(
                id,
                runtimeRecord
            );


            try {

                if (
                    typeof instance.init ===
                    "function" &&
                    !instance.__haldoInitialized
                ) {

                    await instance.init(
                        instance.context
                    );


                    instance.__haldoInitialized =
                        true;
                }


                if (
                    typeof instance.start ===
                    "function"
                ) {

                    await instance.start(
                        options || {}
                    );
                }


                emit(
                    "app:started",
                    {
                        appId:
                            id,

                        instance:
                            instance
                    }
                );


                return instance;

            } catch (error) {

                runtimes.delete(
                    id
                );


                emit(
                    "app:error",
                    {

                        appId:
                            id,

                        error:
                            error
                    }
                );


                throw error;
            }
        };


    /* ========================================================
       STOP
    ======================================================== */

    Runtime.stop =
        async function (
            appId
        ) {

            const id =
                normalizeId(
                    appId
                );


            const record =
                runtimes.get(
                    id
                );


            if (!record) {
                return false;
            }


            const instance =
                record.instance;


            try {

                if (
                    instance &&
                    typeof instance.stop ===
                    "function"
                ) {

                    await instance.stop();
                }

            } catch (error) {

                console.warn(
                    "[HalDo Runtime]",
                    "App stop Fehler:",
                    id,
                    error
                );
            }


            runtimes.delete(
                id
            );


            emit(
                "app:stopped",
                {
                    appId:
                        id
                }
            );


            return true;
        };


    /* ========================================================
       RESTART
    ======================================================== */

    Runtime.restart =
        async function (
            appId,
            options
        ) {

            await Runtime.stop(
                appId
            );


            return Runtime.start(
                appId,
                options || {}
            );
        };


    /* ========================================================
       GET INSTANCE
    ======================================================== */

    Runtime.get =
        function (
            appId
        ) {

            const record =
                runtimes.get(
                    normalizeId(
                        appId
                    )
                );


            return record
                ? record.instance
                : null;
        };


    /* ========================================================
       IS RUNNING
    ======================================================== */

    Runtime.isRunning =
        function (
            appId
        ) {

            return runtimes.has(
                normalizeId(
                    appId
                )
            );
        };


    /* ========================================================
       RUNNING APPS
    ======================================================== */

    Runtime.getRunning =
        function () {

            return Array.from(
                runtimes.keys()
            );
        };


    /* ========================================================
       DESTROY
    ======================================================== */

    Runtime.destroy =
        async function (
            appId
        ) {

            const id =
                normalizeId(
                    appId
                );


            const record =
                runtimes.get(
                    id
                );


            if (!record) {
                return false;
            }


            try {

                if (
                    record.instance &&
                    typeof record.instance.destroy ===
                    "function"
                ) {

                    await record.instance.destroy();
                }

            } catch (error) {

                console.warn(
                    "[HalDo Runtime]",
                    "Destroy Fehler:",
                    id,
                    error
                );
            }


            runtimes.delete(
                id
            );


            emit(
                "app:destroyed",
                {
                    appId:
                        id
                }
            );


            return true;
        };


    /* ========================================================
       STATUS
    ======================================================== */

    Runtime.getStatus =
        function () {

            return {

                name:
                    Runtime.name,

                version:
                    Runtime.version,

                ready:
                    Runtime.ready,

                registeredFactories:
                    factories.size,

                runningApps:
                    runtimes.size,

                running:
                    Runtime.getRunning(),

                timestamp:
                    Date.now()
            };
        };


    /* ========================================================
       INITIALIZE
    ======================================================== */

    Runtime.init =
        function () {

            if (
                Runtime.ready
            ) {

                return Runtime;
            }


            Runtime.ready =
                true;


            /*
             * Global APIs
             */

            window.HalDoAppRuntime =
                Runtime;


            HalDoOS.appRuntime =
                Runtime;


            V20.appRuntime =
                Runtime;


            /*
             * Event Bus bridge
             */

            const bus =
                window.HalDoAppEvents;


            if (
                bus &&
                typeof bus.on ===
                "function"
            ) {

                bus.on(
                    "app:open",
                    function (
                        event
                    ) {

                        const data =
                            event &&
                            event.data
                                ? event.data
                                : event;


                        if (
                            data &&
                            data.appId
                        ) {

                            Runtime.start(
                                data.appId,
                                data
                            )
                            .catch(
                                function (
                                    error
                                ) {

                                    console.error(
                                        "[HalDo Runtime]",
                                        error
                                    );

                                }
                            );
                        }

                    }
                );


                bus.on(
                    "app:close",
                    function (
                        event
                    ) {

                        const data =
                            event &&
                            event.data
                                ? event.data
                                : event;


                        if (
                            data &&
                            data.appId
                        ) {

                            Runtime.stop(
                                data.appId
                            );
                        }

                    }
                );
            }


            emit(
                "runtime:ready",
                Runtime.getStatus()
            );


            if (
                bus &&
                typeof bus.emit ===
                "function"
            ) {

                bus.emit(
                    "system:app-runtime-ready",
                    Runtime.getStatus(),
                    {
                        internal:
                            true
                    }
                );
            }


            console.log(
                "[HalDo AI OS 20]",
                "App Runtime bereit."
            );


            return Runtime;
        };


    /* ========================================================
       BOOT
    ======================================================== */

    function boot() {

        try {

            Runtime.init();

        } catch (error) {

            console.error(
                "[HalDo AI OS 20]",
                "App Runtime Startfehler:",
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