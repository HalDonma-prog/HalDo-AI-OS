/*
 * ============================================================
 * HalDo AI OS 20
 * Universal Application Runtime
 * ============================================================
 *
 * Datei:
 *   js/haldo-v20-app-runtime.js
 *
 * Version:
 *   20.0.1
 *
 * Aufgabe:
 *   - zentrale V20 App Runtime
 *   - Manifest -> Registry/Runtime Verbindung
 *   - App-Lifecycle
 *   - Event-Bus Verbindung
 *   - Service-Bridge Verbindung
 *   - Window-Manager-Kompatibilität
 *   - Legacy App-Manager-Kompatibilität
 *   - Fehlerisolierung
 *   - Runtime-Status
 *   - sichere Boot-Reihenfolge
 *
 * ============================================================
 */

(function (window, document) {

    "use strict";


    /* ========================================================
       GLOBAL NAMESPACE
    ======================================================== */

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};


    const V20 =
        window.HalDoV20 =
        window.HalDoV20 || {};


    /* ========================================================
       RUNTIME
    ======================================================== */

    const Runtime = {

        name:
            "HalDo V20 Universal App Runtime",

        version:
            "20.0.1",

        ready:
            false,

        initialized:
            false,

        booting:
            false,

        destroyed:
            false,

        legacyAppManager:
            null,

        registry:
            null,

        manifest:
            null,

        events:
            null,

        serviceBridge:
            null
    };


    /* ========================================================
       INTERNAL STATE
    ======================================================== */

    const instances =
        new Map();


    const loading =
        new Map();


    let bootPromise =
        null;


    let eventConnection =
        null;


    /* ========================================================
       HELPERS
    ======================================================== */

    function normalizeId(value) {

        return String(
            value || ""
        )
        .trim()
        .toLowerCase();

    }


    function getManifest() {

        return (
            window.HalDoV20AppManifest ||
            HalDoOS.appManifest ||
            V20.appManifest ||
            null
        );

    }


    function getRegistry() {

        return (
            window.HalDoV20AppRegistry ||
            HalDoOS.appRegistryV20 ||
            V20.appRegistry ||
            window.HalDoAppRegistry ||
            HalDoOS.appRegistry ||
            null
        );

    }


    function getEvents() {

        return (
            window.HalDoAppEvents ||
            HalDoOS.appEvents ||
            V20.appEvents ||
            null
        );

    }


    function getServiceBridge() {

        return (
            window.HalDoV20ServiceBridge ||
            window.HalDoServiceBridge ||
            HalDoOS.serviceBridge ||
            V20.serviceBridge ||
            null
        );

    }


    function getAppDefinition(appId) {

        const manifest =
            getManifest();

        if (!manifest) {
            return null;
        }


        const id =
            normalizeId(appId);


        try {

            if (
                typeof manifest.get ===
                "function"
            ) {

                return manifest.get(id) || null;

            }


            if (
                typeof manifest.getApp ===
                "function"
            ) {

                return manifest.getApp(id) || null;

            }


            if (
                manifest.apps &&
                typeof manifest.apps ===
                "object"
            ) {

                return (
                    manifest.apps[id] ||
                    null
                );

            }

        } catch (error) {

            console.error(
                "[HalDo V20 Runtime]",
                "Manifest-Abfrage fehlgeschlagen:",
                error
            );

        }


        return null;

    }


    function createRecord(definition) {

        return {

            id:
                normalizeId(
                    definition.id
                ),

            definition:
                definition,

            status:
                "registered",

            instance:
                null,

            module:
                null,

            element:
                null,

            startedAt:
                null,

            stoppedAt:
                null,

            openedAt:
                null,

            closedAt:
                null,

            createdAt:
                Date.now(),

            error:
                null,

            loadPromise:
                null,

            context:
                null,

            state:
                {},

            subscriptions:
                [],

            lifecycle:
                {

                    created:
                        Date.now(),

                    starts:
                        0,

                    stops:
                        0,

                    opens:
                        0,

                    closes:
                        0,

                    errors:
                        0
                }

        };

    }


    function emit(
        eventName,
        data,
        options
    ) {

        const events =
            getEvents();

        if (
            events &&
            typeof events.emit ===
            "function"
        ) {

            try {

                return events.emit(
                    eventName,
                    data,
                    options
                );

            } catch (error) {

                console.warn(
                    "[HalDo V20 Runtime]",
                    "Event konnte nicht gesendet werden:",
                    eventName,
                    error
                );

            }

        }


        return null;

    }


    function emitApp(
        appId,
        eventName,
        data
    ) {

        const events =
            getEvents();


        if (
            events &&
            typeof events.appEvent ===
            "function"
        ) {

            try {

                return events.appEvent(
                    appId,
                    eventName,
                    data
                );

            } catch (error) {

                console.warn(
                    "[HalDo V20 Runtime]",
                    "App-Event konnte nicht gesendet werden:",
                    eventName,
                    error
                );

            }

        }


        return emit(
            eventName,
            data,
            {

                sourceApp:
                    normalizeId(appId)

            }
        );

    }


    function setStatus(
        record,
        status,
        extra
    ) {

        if (!record) {
            return;
        }


        const previous =
            record.status;


        record.status =
            status;


        const payload =
            Object.assign(

                {

                    appId:
                        record.id,

                    previousStatus:
                        previous,

                    status:
                        status

                },

                extra || {}

            );


        emitApp(
            record.id,
            "app:state-changed",
            payload
        );

    }


    function getRecord(appId) {

        return (
            instances.get(
                normalizeId(appId)
            ) ||
            null
        );

    }


    function safeFunction(
        object,
        method
    ) {

        return !!(
            object &&
            typeof object[method] ===
            "function"
        );

    }


    /* ========================================================
       APP CONTEXT
    ======================================================== */

    function createContext(record) {

        const definition =
            record.definition;


        const context = {

            appId:
                record.id,

            app:
                definition,

            runtime:
                Runtime,

            state:
                record.state,


            /*
             * ------------------------------------------------
             * EVENT API
             * ------------------------------------------------
             */

            emit:
                function (
                    eventName,
                    data,
                    options
                ) {

                    return emit(
                        eventName,
                        data,
                        Object.assign(
                            {},
                            options || {},
                            {
                                sourceApp:
                                    record.id
                            }
                        )
                    );

                },


            send:
                function (
                    targetApp,
                    eventName,
                    data,
                    options
                ) {

                    const events =
                        getEvents();


                    if (
                        events &&
                        typeof events.send ===
                        "function"
                    ) {

                        return events.send(
                            record.id,
                            targetApp,
                            eventName,
                            data,
                            options
                        );

                    }


                    return null;

                },


            broadcast:
                function (
                    eventName,
                    data,
                    options
                ) {

                    const events =
                        getEvents();


                    if (
                        events &&
                        typeof events.broadcast ===
                        "function"
                    ) {

                        return events.broadcast(
                            record.id,
                            eventName,
                            data,
                            options
                        );

                    }


                    return null;

                },


            on:
                function (
                    eventName,
                    handler,
                    options
                ) {

                    const events =
                        getEvents();


                    if (
                        events &&
                        typeof events.subscribeApp ===
                        "function"
                    ) {

                        const unsubscribe =
                            events.subscribeApp(
                                record.id,
                                eventName,
                                handler,
                                options
                            );


                        if (
                            typeof unsubscribe ===
                            "function"
                        ) {

                            record.subscriptions.push(
                                unsubscribe
                            );

                        }


                        return (
                            unsubscribe ||
                            function () {}
                        );

                    }


                    if (
                        events &&
                        typeof events.on ===
                        "function"
                    ) {

                        const unsubscribe =
                            events.on(
                                eventName,
                                handler,
                                options
                            );


                        if (
                            typeof unsubscribe ===
                            "function"
                        ) {

                            record.subscriptions.push(
                                unsubscribe
                            );

                        }


                        return (
                            unsubscribe ||
                            function () {}
                        );

                    }


                    return function () {};

                },


            once:
                function (
                    eventName,
                    handler,
                    options
                ) {

                    const events =
                        getEvents();


                    if (
                        events &&
                        typeof events.subscribeApp ===
                        "function"
                    ) {

                        const unsubscribe =
                            events.subscribeApp(

                                record.id,

                                eventName,

                                handler,

                                Object.assign(
                                    {},
                                    options || {},
                                    {
                                        once:
                                            true
                                    }
                                )

                            );


                        if (
                            typeof unsubscribe ===
                            "function"
                        ) {

                            record.subscriptions.push(
                                unsubscribe
                            );

                        }


                        return (
                            unsubscribe ||
                            function () {}
                        );

                    }


                    if (
                        events &&
                        typeof events.once ===
                        "function"
                    ) {

                        const unsubscribe =
                            events.once(
                                eventName,
                                handler,
                                options
                            );


                        if (
                            typeof unsubscribe ===
                            "function"
                        ) {

                            record.subscriptions.push(
                                unsubscribe
                            );

                        }


                        return (
                            unsubscribe ||
                            function () {}
                        );

                    }


                    return function () {};

                },


            /*
             * ------------------------------------------------
             * RUNTIME API
             * ------------------------------------------------
             */

            openApp:
                function (
                    appId,
                    options
                ) {

                    return Runtime.open(
                        appId,
                        options
                    );

                },


            closeApp:
                function (
                    appId
                ) {

                    return Runtime.close(
                        appId
                    );

                },


            startApp:
                function (
                    appId
                ) {

                    return Runtime.start(
                        appId
                    );

                },


            stopApp:
                function (
                    appId
                ) {

                    return Runtime.stop(
                        appId
                    );

                },


            restartApp:
                function (
                    appId
                ) {

                    return Runtime.restart(
                        appId
                    );

                },


            destroyApp:
                function (
                    appId
                ) {

                    return Runtime.destroy(
                        appId
                    );

                },


            getApp:
                function (
                    appId
                ) {

                    return Runtime.get(
                        appId
                    );

                },


            /*
             * ------------------------------------------------
             * SERVICE BRIDGE
             * ------------------------------------------------
             */

            services:
                getServiceBridge(),


            /*
             * ------------------------------------------------
             * STORAGE
             * ------------------------------------------------
             */

            storage:
                {

                    get:
                        function (
                            key
                        ) {

                            try {

                                const value =
                                    localStorage.getItem(
                                        "haldo:" +
                                        record.id +
                                        ":" +
                                        key
                                    );


                                if (
                                    value ===
                                    null
                                ) {

                                    return null;

                                }


                                try {

                                    return JSON.parse(
                                        value
                                    );

                                } catch (
                                    parseError
                                ) {

                                    return value;

                                }

                            } catch (error) {

                                return null;

                            }

                        },


                    set:
                        function (
                            key,
                            value
                        ) {

                            try {

                                localStorage.setItem(

                                    "haldo:" +
                                    record.id +
                                    ":" +
                                    key,

                                    typeof value ===
                                    "string"

                                        ? value

                                        : JSON.stringify(
                                            value
                                        )

                                );


                                return true;

                            } catch (error) {

                                return false;

                            }

                        },


                    remove:
                        function (
                            key
                        ) {

                            try {

                                localStorage.removeItem(
                                    "haldo:" +
                                    record.id +
                                    ":" +
                                    key
                                );


                                return true;

                            } catch (error) {

                                return false;

                            }

                        }

                },


            /*
             * ------------------------------------------------
             * LOGGING
             * ------------------------------------------------
             */

            log:
                function () {

                    const args =
                        Array.from(
                            arguments
                        );


                    console.log(
                        "[HalDo App:" +
                        record.id +
                        "]",
                        ...args
                    );

                },


            warn:
                function () {

                    const args =
                        Array.from(
                            arguments
                        );


                    console.warn(
                        "[HalDo App:" +
                        record.id +
                        "]",
                        ...args
                    );

                },


            error:
                function () {

                    const args =
                        Array.from(
                            arguments
                        );


                    console.error(
                        "[HalDo App:" +
                        record.id +
                        "]",
                        ...args
                    );

                }

        };


        record.context =
            context;


        return context;

    }


    /* ========================================================
       SCRIPT LOADING
    ======================================================== */

    function loadScript(src) {

        if (!src) {

            return Promise.reject(
                new Error(
                    "Keine App-Einstiegsdatei angegeben."
                )
            );

        }


        const normalizedSrc =
            String(src).trim();


        if (!normalizedSrc) {

            return Promise.reject(
                new Error(
                    "Ungültige App-Einstiegsdatei."
                )
            );

        }


        const escapedSrc =
            window.CSS &&
            typeof CSS.escape ===
            "function"

                ? CSS.escape(
                    normalizedSrc
                )

                : normalizedSrc
                    .replace(
                        /["\\]/g,
                        "\\$&"
                    );


        const existing =
            document.querySelector(
                'script[data-haldo-app-src="' +
                escapedSrc +
                '"]'
            );


        if (existing) {

            return Promise.resolve(
                existing
            );

        }


        if (
            loading.has(
                normalizedSrc
            )
        ) {

            return loading.get(
                normalizedSrc
            );

        }


        const promise =
            new Promise(
                function (
                    resolve,
                    reject
                ) {

                    const script =
                        document.createElement(
                            "script"
                        );


                    script.src =
                        normalizedSrc;


                    script.async =
                        false;


                    script.dataset.haldoAppSrc =
                        normalizedSrc;


                    script.onload =
                        function () {

                            resolve(
                                script
                            );

                        };


                    script.onerror =
                        function () {

                            reject(
                                new Error(
                                    "App-Datei konnte nicht geladen werden: " +
                                    normalizedSrc
                                )
                            );

                        };


                    document.head.appendChild(
                        script
                    );

                }
            );


        loading.set(
            normalizedSrc,
            promise
        );


        promise.finally(
            function () {

                loading.delete(
                    normalizedSrc
                );

            }
        );


        return promise;

    }


    /* ========================================================
       FIND MODULE
    ======================================================== */

    function findModule(definition) {

        const moduleName =
            definition.module;


        if (!moduleName) {
            return null;
        }


        if (
            window[moduleName]
        ) {

            return window[
                moduleName
            ];

        }


        const variants = [

            moduleName
                .replace(
                    /^haldo-/,
                    ""
                ),

            moduleName
                .replace(
                    /-/g,
                    "_"
                ),

            moduleName
                .replace(
                    /^haldo-/,
                    ""
                )
                .replace(
                    /-/g,
                    "_"
                )

        ];


        for (
            let i = 0;
            i < variants.length;
            i++
        ) {

            if (
                window[
                    variants[i]
                ]
            ) {

                return window[
                    variants[i]
                ];

            }

        }


        if (
            HalDoOS[moduleName]
        ) {

            return HalDoOS[
                moduleName
            ];

        }


        if (
            V20[moduleName]
        ) {

            return V20[
                moduleName
            ];

        }


        return null;

    }


    /* ========================================================
       INITIALIZE APP
    ======================================================== */

    async function initialize(appId) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            throw new Error(
                "Keine gültige App-ID angegeben."
            );

        }


        const definition =
            getAppDefinition(
                id
            );


        if (!definition) {

            throw new Error(
                "App nicht im Manifest gefunden: " +
                id
            );

        }


        let record =
            getRecord(
                id
            );


        if (!record) {

            record =
                createRecord(
                    definition
                );


            instances.set(
                id,
                record
            );

        }


        if (
            record.status ===
            "initialized" ||
            record.status ===
            "running" ||
            record.status ===
            "open"
        ) {

            return record;

        }


        if (
            record.loadPromise
        ) {

            return record.loadPromise;

        }


        record.loadPromise =
            (async function () {

                try {

                    setStatus(
                        record,
                        "loading"
                    );


                    if (
                        definition.entry
                    ) {

                        await loadScript(
                            definition.entry
                        );

                    }


                    const module =
                        findModule(
                            definition
                        );


                    record.module =
                        module;


                    const context =
                        createContext(
                            record
                        );


                    if (
                        module &&
                        typeof module.create ===
                        "function"
                    ) {

                        record.instance =
                            await module.create(
                                context
                            );

                    } else {

                        record.instance =
                            module ||
                            null;

                    }


                    if (
                        record.instance &&
                        typeof record.instance.init ===
                        "function"
                    ) {

                        await record.instance.init(
                            context
                        );

                    } else if (
                        module &&
                        typeof module.init ===
                        "function"
                    ) {

                        await module.init(
                            context
                        );

                    }


                    setStatus(
                        record,
                        "initialized"
                    );


                    emitApp(
                        id,
                        "app:registered",
                        {

                            appId:
                                id,

                            definition:
                                definition

                        }
                    );


                    return record;

                } catch (error) {

                    record.error =
                        error;


                    record.lifecycle.errors++;


                    setStatus(
                        record,
                        "error",
                        {

                            error:
                                error.message

                        }
                    );


                    emitApp(
                        id,
                        "app:error",
                        {

                            appId:
                                id,

                            error:
                                error.message

                        }
                    );


                    throw error;

                } finally {

                    record.loadPromise =
                        null;

                }

            })();


        return record.loadPromise;

    }


    /* ========================================================
       START
    ======================================================== */

    Runtime.start =
        async function (
            appId
        ) {

            const id =
                normalizeId(
                    appId
                );


            const record =
                await initialize(
                    id
                );


            if (
                record.status ===
                "running" ||
                record.status ===
                "open"
            ) {

                return record;

            }


            try {

                if (
                    safeFunction(
                        record.instance,
                        "start"
                    )
                ) {

                    await record.instance.start(
                        record.context
                    );

                } else if (
                    safeFunction(
                        record.module,
                        "start"
                    )
                ) {

                    await record.module.start(
                        record.context
                    );

                }


                record.startedAt =
                    Date.now();


                record.lifecycle.starts++;


                setStatus(
                    record,
                    "running"
                );


                emitApp(
                    id,
                    "app:started",
                    {
                        appId:
                            id
                    }
                );


                return record;

            } catch (error) {

                record.error =
                    error;


                record.lifecycle.errors++;


                setStatus(
                    record,
                    "error",
                    {

                        error:
                            error.message

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

            const record =
                getRecord(
                    appId
                );


            if (!record) {
                return false;
            }


            if (
                record.status ===
                "stopped"
            ) {

                return true;

            }


            try {

                if (
                    safeFunction(
                        record.instance,
                        "stop"
                    )
                ) {

                    await record.instance.stop(
                        record.context
                    );

                } else if (
                    safeFunction(
                        record.module,
                        "stop"
                    )
                ) {

                    await record.module.stop(
                        record.context
                    );

                }


                record.stoppedAt =
                    Date.now();


                record.lifecycle.stops++;


                setStatus(
                    record,
                    "stopped"
                );


                emitApp(
                    record.id,
                    "app:stopped",
                    {

                        appId:
                            record.id

                    }
                );


                return true;

            } catch (error) {

                record.error =
                    error;


                record.lifecycle.errors++;


                setStatus(
                    record,
                    "error",
                    {

                        error:
                            error.message

                    }
                );


                return false;

            }

        };


    /* ========================================================
       OPEN
    ======================================================== */

    Runtime.open =
        async function (
            appId,
            options
        ) {

            const id =
                normalizeId(
                    appId
                );


            const record =
                await Runtime.start(
                    id
                );


            const opts =
                options || {};


            try {

                if (
                    safeFunction(
                        record.instance,
                        "open"
                    )
                ) {

                    await record.instance.open(
                        opts,
                        record.context
                    );

                } else if (
                    safeFunction(
                        record.module,
                        "open"
                    )
                ) {

                    await record.module.open(
                        opts,
                        record.context
                    );

                }


                record.openedAt =
                    Date.now();


                record.lifecycle.opens++;


                setStatus(
                    record,
                    "open"
                );


                emitApp(
                    id,
                    "app:open",
                    {

                        appId:
                            id,

                        options:
                            opts

                    }
                );


                /*
                 * ------------------------------------------------
                 * WINDOW MANAGER BRIDGE
                 * ------------------------------------------------
                 */

                const windowManager =
                    window.HalDoWindowManager ||
                    HalDoOS.windowManager ||
                    window.HalDoOSWindowManager;


                if (
                    windowManager &&
                    typeof windowManager.openApp ===
                    "function"
                ) {

                    try {

                        await Promise.resolve(
                            windowManager.openApp(
                                id,
                                opts
                            )
                        );

                    } catch (error) {

                        console.warn(
                            "[HalDo V20 Runtime]",
                            "Window Manager konnte App nicht öffnen.",
                            error
                        );

                    }

                }


                return record;

            } catch (error) {

                record.error =
                    error;


                record.lifecycle.errors++;


                setStatus(
                    record,
                    "error",
                    {

                        error:
                            error.message

                    }
                );


                throw error;

            }

        };


    /* ========================================================
       CLOSE
    ======================================================== */

    Runtime.close =
        async function (
            appId
        ) {

            const record =
                getRecord(
                    appId
                );


            if (!record) {
                return false;
            }


            try {

                if (
                    safeFunction(
                        record.instance,
                        "close"
                    )
                ) {

                    await record.instance.close(
                        record.context
                    );

                } else if (
                    safeFunction(
                        record.module,
                        "close"
                    )
                ) {

                    await record.module.close(
                        record.context
                    );

                }


                record.closedAt =
                    Date.now();


                record.lifecycle.closes++;


                setStatus(
                    record,
                    "running"
                );


                emitApp(
                    record.id,
                    "app:close",
                    {

                        appId:
                            record.id

                    }
                );


                const windowManager =
                    window.HalDoWindowManager ||
                    HalDoOS.windowManager ||
                    window.HalDoOSWindowManager;


                if (
                    windowManager &&
                    typeof windowManager.closeApp ===
                    "function"
                ) {

                    try {

                        await Promise.resolve(
                            windowManager.closeApp(
                                record.id
                            )
                        );

                    } catch (error) {

                        console.warn(
                            "[HalDo V20 Runtime]",
                            "Window Manager konnte App nicht schließen.",
                            error
                        );

                    }

                }


                return true;

            } catch (error) {

                record.error =
                    error;


                record.lifecycle.errors++;


                setStatus(
                    record,
                    "error",
                    {

                        error:
                            error.message

                    }
                );


                return false;

            }

        };


    /* ========================================================
       RESTART
    ======================================================== */

    Runtime.restart =
        async function (
            appId
        ) {

            const id =
                normalizeId(
                    appId
                );


            await Runtime.stop(
                id
            );


            return Runtime.start(
                id
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
                getRecord(
                    id
                );


            if (!record) {
                return false;
            }


            try {

                if (
                    record.status ===
                    "open"
                ) {

                    await Runtime.close(
                        id
                    );

                }


                await Runtime.stop(
                    id
                );


                if (
                    safeFunction(
                        record.instance,
                        "destroy"
                    )
                ) {

                    await record.instance.destroy(
                        record.context
                    );

                } else if (
                    safeFunction(
                        record.module,
                        "destroy"
                    )
                ) {

                    await record.module.destroy(
                        record.context
                    );

                }


                record.subscriptions
                    .forEach(
                        function (
                            unsubscribe
                        ) {

                            try {

                                unsubscribe();

                            } catch (error) {

                                console.warn(
                                    "[HalDo V20 Runtime]",
                                    "Event-Abmeldung fehlgeschlagen.",
                                    error
                                );

                            }

                        }
                    );


                record.subscriptions =
                    [];


                instances.delete(
                    id
                );


                emitApp(
                    id,
                    "app:destroyed",
                    {

                        appId:
                            id

                    }
                );


                return true;

            } catch (error) {

                console.error(
                    "[HalDo V20 Runtime]",
                    "Destroy-Fehler:",
                    error
                );


                return false;

            }

        };


    /* ========================================================
       GET
    ======================================================== */

    Runtime.get =
        function (
            appId
        ) {

            const record =
                getRecord(
                    appId
                );


            if (!record) {
                return null;
            }


            return {

                id:
                    record.id,

                status:
                    record.status,

                definition:
                    record.definition,

                instance:
                    record.instance,

                module:
                    record.module,

                element:
                    record.element,

                state:
                    record.state,

                error:
                    record.error,

                lifecycle:
                    Object.assign(
                        {},
                        record.lifecycle
                    ),

                startedAt:
                    record.startedAt,

                stoppedAt:
                    record.stoppedAt,

                openedAt:
                    record.openedAt,

                closedAt:
                    record.closedAt

            };

        };


    /* ========================================================
       GET ALL
    ======================================================== */

    Runtime.getAll =
        function () {

            return Array.from(
                instances.values()
            )
            .map(
                function (
                    record
                ) {

                    return Runtime.get(
                        record.id
                    );

                }
            );

        };


    /* ========================================================
       REGISTER MANIFEST APPS
    ======================================================== */

    Runtime.registerAll =
        function () {

            const manifest =
                getManifest();


            if (!manifest) {

                console.warn(
                    "[HalDo V20 Runtime]",
                    "App Manifest noch nicht verfügbar."
                );


                return 0;

            }


            Runtime.manifest =
                manifest;


            const registry =
                getRegistry();


            Runtime.registry =
                registry;


            let definitions =
                [];


            try {

                if (
                    typeof manifest.getAll ===
                    "function"
                ) {

                    definitions =
                        manifest.getAll() ||
                        [];

                } else if (
                    Array.isArray(
                        manifest
                    )
                ) {

                    definitions =
                        manifest;

                } else if (
                    Array.isArray(
                        manifest.apps
                    )
                ) {

                    definitions =
                        manifest.apps;

                }

            } catch (error) {

                console.error(
                    "[HalDo V20 Runtime]",
                    "Manifest konnte nicht gelesen werden:",
                    error
                );


                return 0;

            }


            let count =
                0;


            definitions.forEach(
                function (
                    definition
                ) {

                    if (
                        !definition ||
                        !definition.id
                    ) {

                        return;

                    }


                    const id =
                        normalizeId(
                            definition.id
                        );


                    if (
                        !instances.has(
                            id
                        )
                    ) {

                        instances.set(
                            id,
                            createRecord(
                                Object.assign(
                                    {},
                                    definition,
                                    {
                                        id:
                                            id
                                    }
                                )
                            )
                        );


                        count++;

                    }

                }
            );


            return count;

        };


    /* ========================================================
       REGISTER SINGLE APP
    ======================================================== */

    Runtime.register =
        function (
            definition
        ) {

            if (
                !definition ||
                !definition.id
            ) {

                return null;

            }


            const id =
                normalizeId(
                    definition.id
                );


            const existing =
                getRecord(
                    id
                );


            if (existing) {

                existing.definition =
                    Object.assign(
                        {},
                        existing.definition,
                        definition
                    );


                return existing;

            }


            const record =
                createRecord(
                    Object.assign(
                        {},
                        definition,
                        {
                            id:
                                id
                        }
                    )
                );


            instances.set(
                id,
                record
            );


            emitApp(
                id,
                "app:registered",
                {

                    appId:
                        id,

                    definition:
                        record.definition

                }
            );


            return record;

        };


    /* ========================================================
       UNREGISTER
    ======================================================== */

    Runtime.unregister =
        async function (
            appId
        ) {

            const id =
                normalizeId(
                    appId
                );


            const record =
                getRecord(
                    id
                );


            if (!record) {
                return false;
            }


            await Runtime.destroy(
                id
            );


            return true;

        };


    /* ========================================================
       EVENT CONNECTION
    ======================================================== */

    function connectEvents() {

        const events =
            getEvents();


        if (!events) {
            return false;
        }


        if (
            eventConnection
        ) {

            return true;

        }


        Runtime.events =
            events;


        /*
         * ------------------------------------------------
         * app:open-request
         * ------------------------------------------------
         */

        let unsubscribe =
            null;


        if (
            typeof events.on ===
            "function"
        ) {

            unsubscribe =
                events.on(
                    "app:open-request",
                    function (
                        event
                    ) {

                        const data =
                            event &&
                            event.data
                                ? event.data
                                : {};


                        const target =
                            data.appId ||
                            data.targetApp ||
                            (
                                event &&
                                event.targetApp
                            );


                        if (!target) {
                            return;
                        }


                        Runtime.open(
                            target,
                            data.options || {}
                        )
                        .catch(
                            function (
                                error
                            ) {

                                console.error(
                                    "[HalDo V20 Runtime]",
                                    "App konnte über Event nicht geöffnet werden:",
                                    error
                                );

                            }
                        );

                    }
                );

        }


        eventConnection = {

            unsubscribe:
                typeof unsubscribe ===
                "function"

                    ? unsubscribe

                    : null

        };


        return true;

    }


    /* ========================================================
       SERVICE BRIDGE CONNECTION
    ======================================================== */

    function connectServiceBridge() {

        const bridge =
            getServiceBridge();


        Runtime.serviceBridge =
            bridge;


        return !!bridge;

    }


    /* ========================================================
       LEGACY APP MANAGER
    ======================================================== */

    function connectExistingAppManager() {

        const manager =
            window.HalDoAppManager ||
            HalDoOS.appManager ||
            null;


        if (!manager) {

            Runtime.legacyAppManager =
                null;


            return false;

        }


        Runtime.legacyAppManager =
            manager;


        console.log(
            "[HalDo V20 Runtime]",
            "Bestehender App Manager erkannt und kompatibel angebunden."
        );


        return true;

    }


    /* ========================================================
       REGISTRY CONNECTION
    ======================================================== */

    function connectRegistry() {

        const registry =
            getRegistry();


        Runtime.registry =
            registry;


        if (
            registry &&
            typeof registry ===
            "object"
        ) {

            /*
             * Der V20 Runtime gehört zur
             * Registry-Lebenszyklus-Schicht.
             *
             * Die Registry wird nicht ersetzt.
             */

            return true;

        }


        return false;

    }


    /* ========================================================
       INITIALIZE
    ======================================================== */

    Runtime.init =
        async function () {

            if (
                Runtime.initialized &&
                Runtime.ready
            ) {

                return Runtime;

            }


            if (
                Runtime.destroyed
            ) {

                Runtime.destroyed =
                    false;

            }


            Runtime.initialized =
                true;


            /*
             * Abhängigkeiten erneut ermitteln.
             */

            Runtime.manifest =
                getManifest();


            Runtime.registry =
                getRegistry();


            Runtime.events =
                getEvents();


            Runtime.serviceBridge =
                getServiceBridge();


            /*
             * ------------------------------------------------
             * WICHTIG:
             *
             * Hier wird ausdrücklich die Runtime-Methode
             * aufgerufen.
             *
             * NICHT:
             *     registerAll();
             *
             * SONDERN:
             *     Runtime.registerAll();
             * ------------------------------------------------
             */

            Runtime.registerAll();


            connectRegistry();

            connectEvents();

            connectServiceBridge();

            connectExistingAppManager();


            Runtime.ready =
                true;


            emit(
                "system:app-runtime-ready",
                Runtime.getStatus(),
                {

                    source:
                        "system",

                    internal:
                        true

                }
            );


            console.log(
                "[HalDo AI OS 20]",
                "Universal App Runtime bereit.",
                Runtime.getStatus()
            );


            return Runtime;

        };


    /* ========================================================
       WAIT FOR MANIFEST
    ======================================================== */

    function waitForManifest(
        timeout
    ) {

        const maxWait =
            Number.isFinite(timeout)
                ? timeout
                : 10000;


        const started =
            Date.now();


        return new Promise(
            function (
                resolve
            ) {

                function check() {

                    if (
                        getManifest()
                    ) {

                        resolve(
                            true
                        );

                        return;

                    }


                    if (
                        Date.now() -
                        started >=
                        maxWait
                    ) {

                        resolve(
                            false
                        );

                        return;

                    }


                    setTimeout(
                        check,
                        25
                    );

                }


                check();

            }
        );

    }


    /* ========================================================
       BOOT
    ======================================================== */

    Runtime.boot =
        function () {

            if (
                bootPromise
            ) {

                return bootPromise;

            }


            Runtime.booting =
                true;


            bootPromise =
                (async function () {

                    try {

                        /*
                         * Manifest möglichst früh suchen.
                         */

                        if (
                            !getManifest()
                        ) {

                            await waitForManifest(
                                10000
                            );

                        }


                        /*
                         * Falls der DOM noch lädt,
                         * auf DOMContentLoaded warten.
                         */

                        if (
                            document.readyState ===
                            "loading"
                        ) {

                            await new Promise(
                                function (
                                    resolve
                                ) {

                                    document.addEventListener(
                                        "DOMContentLoaded",
                                        resolve,
                                        {
                                            once:
                                                true
                                        }
                                    );

                                }
                            );

                        }


                        await Runtime.init();


                        return Runtime;

                    } catch (error) {

                        console.error(
                            "[HalDo V20 Runtime]",
                            "Bootfehler:",
                            error
                        );


                        Runtime.ready =
                            false;


                        emit(
                            "system:app-runtime-error",
                            {

                                error:
                                    error.message

                            },
                            {

                                source:
                                    "system",

                                internal:
                                    true

                            }
                        );


                        /*
                         * Die Runtime darf nicht die
                         * komplette Shell blockieren.
                         */

                        return Runtime;

                    } finally {

                        Runtime.booting =
                            false;

                    }

                })();


            return bootPromise;

        };


    /* ========================================================
       STATUS
    ======================================================== */

    Runtime.getStatus =
        function () {

            let registered =
                0;

            let initialized =
                0;

            let running =
                0;

            let open =
                0;

            let stopped =
                0;

            let loadingCount =
                0;

            let errors =
                0;


            instances.forEach(
                function (
                    record
                ) {

                    registered++;


                    if (
                        record.status ===
                        "initialized"
                    ) {

                        initialized++;

                    }


                    if (
                        record.status ===
                        "running"
                    ) {

                        running++;

                    }


                    if (
                        record.status ===
                        "open"
                    ) {

                        open++;

                    }


                    if (
                        record.status ===
                        "stopped"
                    ) {

                        stopped++;

                    }


                    if (
                        record.status ===
                        "loading"
                    ) {

                        loadingCount++;

                    }


                    if (
                        record.status ===
                        "error"
                    ) {

                        errors++;

                    }

                }
            );


            return {

                name:
                    Runtime.name,

                version:
                    Runtime.version,

                ready:
                    Runtime.ready,

                initialized:
                    Runtime.initialized,

                booting:
                    Runtime.booting,

                manifestAvailable:
                    !!getManifest(),

                registryAvailable:
                    !!getRegistry(),

                eventBusAvailable:
                    !!getEvents(),

                serviceBridgeAvailable:
                    !!getServiceBridge(),

                legacyAppManagerAvailable:
                    !!Runtime.legacyAppManager,

                registeredApps:
                    registered,

                initializedApps:
                    initialized,

                runningApps:
                    running,

                openApps:
                    open,

                stoppedApps:
                    stopped,

                loadingApps:
                    loadingCount,

                errorApps:
                    errors,

                timestamp:
                    Date.now()

            };

        };


    /* ========================================================
       HEALTH CHECK
    ======================================================== */

    Runtime.health =
        function () {

            const status =
                Runtime.getStatus();


            return {

                ok:
                    !!(
                        status.ready &&
                        status.manifestAvailable
                    ),

                status:
                    status,

                checks:
                    {

                        runtime:
                            true,

                        manifest:
                            status.manifestAvailable,

                        registry:
                            status.registryAvailable,

                        eventBus:
                            status.eventBusAvailable,

                        serviceBridge:
                            status.serviceBridgeAvailable

                    }

            };

        };


    /* ========================================================
       LEGACY COMPATIBILITY HELPERS
    ======================================================== */

    Runtime.openApp =
        Runtime.open;


    Runtime.closeApp =
        Runtime.close;


    Runtime.startApp =
        Runtime.start;


    Runtime.stopApp =
        Runtime.stop;


    Runtime.restartApp =
        Runtime.restart;


    Runtime.destroyApp =
        Runtime.destroy;


    Runtime.getApp =
        Runtime.get;


    Runtime.getApps =
        Runtime.getAll;


    /* ========================================================
       GLOBAL API
    ======================================================== */

    window.HalDoV20AppRuntime =
        Runtime;


    window.HalDoAppRuntime =
        Runtime;


    HalDoOS.appRuntime =
        Runtime;


    V20.appRuntime =
        Runtime;


    /* ========================================================
       AUTO BOOT
    ======================================================== */

    function autoBoot() {

        Runtime.boot();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            autoBoot,
            {
                once:
                    true
            }
        );

    } else {

        setTimeout(
            autoBoot,
            0
        );

    }


})(window, document);