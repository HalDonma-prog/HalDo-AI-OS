/*
 * ============================================================
 * HalDo AI OS 20
 * Universal Application Runtime
 * ============================================================
 *
 * Datei:
 *   js/haldo-v20-app-runtime.js
 *
 * Aufgabe:
 *   - Apps anhand des zentralen Manifests verwalten
 *   - Apps öffnen / schließen / starten / stoppen
 *   - App-Lebenszyklen kontrollieren
 *   - Event-Bus anbinden
 *   - Service Bridge anbinden
 *   - bestehende HalDo-App-Systeme berücksichtigen
 *   - Fehler isolieren
 *   - Status zentral verwalten
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


    const Runtime = {

        name:
            "HalDo V20 Universal App Runtime",

        version:
            "20.0.0",

        ready:
            false,

        initialized:
            false
    };


    const instances =
        new Map();


    const loading =
        new Map();


    const lifecycle =
        new Map();


    let bootPromise =
        null;


    /* ========================================================
       HELPERS
    ======================================================== */

    function normalizeId(
        value
    ) {

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


    function getAppDefinition(
        appId
    ) {

        const manifest =
            getManifest();

        if (!manifest) {
            return null;
        }

        return manifest.get(
            normalizeId(appId)
        );

    }


    function createRecord(
        definition
    ) {

        return {

            id:
                definition.id,

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

            error:
                null,

            loadPromise:
                null,

            context:
                null,

            state:
                {},

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

            return events.emit(
                eventName,
                data,
                options
            );

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

            return events.appEvent(
                appId,
                eventName,
                data
            );

        }

        return emit(
            eventName,
            data,
            {
                sourceApp:
                    appId
            }
        );

    }


    function setStatus(
        record,
        status,
        extra
    ) {

        record.status =
            status;

        const payload =
            Object.assign(
                {
                    appId:
                        record.id,

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


    function getRecord(
        appId
    ) {

        return instances.get(
            normalizeId(appId)
        ) || null;

    }


    /* ========================================================
       APP CONTEXT
    ======================================================== */

    function createContext(
        record
    ) {

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
             * Event API
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

                        return events.subscribeApp(
                            record.id,
                            eventName,
                            handler,
                            options
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

                        return events.subscribeApp(
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

                    }

                    return function () {};

                },


            /*
             * Runtime API
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


            getApp:
                function (
                    appId
                ) {

                    return Runtime.get(
                        appId
                    );

                },


            /*
             * Service Bridge
             */

            services:
                getServiceBridge(),


            /*
             * Storage helper
             */

            storage:
                {

                    get:
                        function (
                            key
                        ) {

                            try {

                                return localStorage.getItem(
                                    "haldo:" +
                                    record.id +
                                    ":" +
                                    key
                                );

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
             * Logging
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

    function loadScript(
        src
    ) {

        if (!src) {

            return Promise.reject(
                new Error(
                    "Keine App-Einstiegsdatei angegeben."
                )
            );

        }


        const existing =
            document.querySelector(
                'script[data-haldo-app-src="' +
                CSS.escape(src) +
                '"]'
            );


        if (existing) {

            return Promise.resolve(
                existing
            );

        }


        if (
            loading.has(src)
        ) {

            return loading.get(
                src
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
                        src;


                    script.async =
                        false;


                    script.dataset.haldoAppSrc =
                        src;


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
                                    src
                                )
                            );

                        };


                    document.head.appendChild(
                        script
                    );

                }
            );


        loading.set(
            src,
            promise
        );


        return promise;

    }


    /* ========================================================
       FIND MODULE
    ======================================================== */

    function findModule(
        definition
    ) {

        const moduleName =
            definition.module;


        if (!moduleName) {
            return null;
        }


        /*
         * Standard:
         *
         * window["haldo-app-example"]
         */

        if (
            window[moduleName]
        ) {

            return window[
                moduleName
            ];

        }


        /*
         * Varianten für bestehende Module.
         */

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


        /*
         * HalDoOS namespace
         */

        if (
            HalDoOS[moduleName]
        ) {

            return HalDoOS[
                moduleName
            ];

        }


        /*
         * V20 namespace
         */

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

    async function initialize(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


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


                    /*
                     * App-Datei laden.
                     */

                    if (
                        definition.entry
                    ) {

                        await loadScript(
                            definition.entry
                        );

                    }


                    /*
                     * Modul suchen.
                     */

                    const module =
                        findModule(
                            definition
                        );


                    record.module =
                        module;


                    /*
                     * App-Kontext erstellen.
                     */

                    const context =
                        createContext(
                            record
                        );


                    /*
                     * Falls ein Modul eine
                     * eigene Factory besitzt.
                     */

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


                    /*
                     * init()
                     */

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
                    record.instance &&
                    typeof record.instance.start ===
                    "function"
                ) {

                    await record.instance.start(
                        record.context
                    );

                } else if (
                    record.module &&
                    typeof record.module.start ===
                    "function"
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


            try {

                if (
                    record.instance &&
                    typeof record.instance.stop ===
                    "function"
                ) {

                    await record.instance.stop(
                        record.context
                    );

                } else if (
                    record.module &&
                    typeof record.module.stop ===
                    "function"
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
                    record.instance &&
                    typeof record.instance.open ===
                    "function"
                ) {

                    await record.instance.open(
                        opts
                    );

                } else if (
                    record.module &&
                    typeof record.module.open ===
                    "function"
                ) {

                    await record.module.open(
                        opts
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
                 * Bestehendes HalDo Window Manager
                 * System informieren.
                 */

                const windowManager =
                    window.HalDoWindowManager ||
                    HalDoOS.windowManager;


                if (
                    windowManager &&
                    typeof windowManager.openApp ===
                    "function"
                ) {

                    try {

                        windowManager.openApp(
                            id,
                            opts
                        );

                    } catch (error) {

                        console.warn(
                            "[HalDo Runtime]",
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
                    record.instance &&
                    typeof record.instance.close ===
                    "function"
                ) {

                    await record.instance.close(
                        record.context
                    );

                } else if (
                    record.module &&
                    typeof record.module.close ===
                    "function"
                ) {

                    await record.module.close(
                        record.context
                    );

                }


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


                return true;

            } catch (error) {

                record.error =
                    error;

                record.lifecycle.errors++;


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

            await Runtime.stop(
                appId
            );


            return Runtime.start(
                appId
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

                await Runtime.stop(
                    id
                );


                if (
                    record.instance &&
                    typeof record.instance.destroy ===
                    "function"
                ) {

                    await record.instance.destroy(
                        record.context
                    );

                } else if (
                    record.module &&
                    typeof record.module.destroy ===
                    "function"
                ) {

                    await record.module.destroy(
                        record.context
                    );

                }


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
                    "[HalDo Runtime]",
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

                state:
                    record.state,

                error:
                    record.error,

                lifecycle:
                    Object.assign(
                        {},
                        record.lifecycle
                    )

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
                    "[HalDo Runtime]",
                    "App Manifest noch nicht verfügbar."
                );

                return 0;

            }


            const definitions =
                manifest.getAll();


            let count =
                0;


            definitions.forEach(
                function (
                    definition
                ) {

                    if (
                        !instances.has(
                            definition.id
                        )
                    ) {

                        instances.set(
                            definition.id,
                            createRecord(
                                definition
                            )
                        );

                        count++;

                    }

                }
            );


            return count;

        };


    /* ========================================================
       OPEN BY EVENT
    ======================================================== */

    function connectEvents() {

        const events =
            getEvents();


        if (
            !events ||
            typeof events.on !==
            "function"
        ) {

            return;

        }


        /*
         * Andere Apps können:
         *
         * app:open
         *
         * mit targetApp senden.
         */

        events.on(
            "app:open-request",
            function (
                event
            ) {

                const data =
                    event.data ||
                    {};


                const target =
                    data.appId ||
                    event.targetApp;


                if (
                    target
                ) {

                    Runtime.open(
                        target,
                        data.options || {}
                    )
                    .catch(
                        function (error) {

                            console.error(
                                "[HalDo Runtime]",
                                error
                            );

                        }
                    );

                }

            }
        );

    }


    /* ========================================================
       COMPATIBILITY WITH EXISTING APP MANAGER
    ======================================================== */

    function connectExistingAppManager() {

        const manager =
            window.HalDoAppManager ||
            HalDoOS.appManager;


        if (!manager) {
            return;
        }


        /*
         * Wir ersetzen den bestehenden Manager NICHT.
         *
         * Wir stellen lediglich eine Verbindung her.
         */

        Runtime.legacyAppManager =
            manager;


        console.log(
            "[HalDo Runtime]",
            "Bestehender App Manager erkannt."
        );

    }


    /* ========================================================
       INITIALIZE
    ======================================================== */

    Runtime.init =
        async function () {

            if (
                Runtime.initialized
            ) {

                return Runtime;

            }


            Runtime.initialized =
                true;


            registerAll();


            connectEvents();


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
                "Universal App Runtime bereit."
            );


            return Runtime;

        };


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


            bootPromise =
                new Promise(
                    function (
                        resolve
                    ) {

                        function start() {

                            Runtime.init()
                                .then(
                                    resolve
                                )
                                .catch(
                                    function (
                                        error
                                    ) {

                                        console.error(
                                            "[HalDo Runtime]",
                                            "Bootfehler:",
                                            error
                                        );

                                        resolve(
                                            Runtime
                                        );

                                    }
                                );

                        }


                        /*
                         * Manifest zuerst.
                         */

                        if (
                            getManifest()
                        ) {

                            start();

                            return;

                        }


                        /*
                         * Falls index.html die Dateien
                         * in einer anderen Reihenfolge lädt,
                         * kurz auf DOMContentLoaded warten.
                         */

                        if (
                            document.readyState ===
                            "loading"
                        ) {

                            document.addEventListener(
                                "DOMContentLoaded",
                                start,
                                {
                                    once:
                                        true
                                }
                            );

                        } else {

                            setTimeout(
                                start,
                                0
                            );

                        }

                    }
                );


            return bootPromise;

        };


    /* ========================================================
       STATUS
    ======================================================== */

    Runtime.getStatus =
        function () {

            let running =
                0;

            let open =
                0;

            let errors =
                0;


            instances.forEach(
                function (
                    record
                ) {

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

                registeredApps:
                    instances.size,

                runningApps:
                    running,

                openApps:
                    open,

                errorApps:
                    errors,

                timestamp:
                    Date.now()

            };

        };


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