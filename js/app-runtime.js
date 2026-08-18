/* =========================================================
   HALDO AI OS 20
   APP RUNTIME
   ---------------------------------------------------------
   Datei:
       /js/app-runtime.js

   Zweck:
       Zentrale Runtime für echte HalDo-Apps.

   Architektur:

       Kernel
          ↓
       System
          ↓
       App Runtime
          ↓
       App Manager
          ↓
       App Registry / Manifest
          ↓
       konkrete App
          ↓
       Storage / AI / Language / Voice /
       Router / Window Manager / Event Bus

   Lifecycle:

       install
       initialize
       mount
       activate
       deactivate
       destroy

   WICHTIG:
       Diese Datei enthält NICHT die komplette Logik
       jeder einzelnen App.

       Sie stellt den gemeinsamen Runtime-Kontext bereit,
       damit jede App ihre eigene vollständige Oberfläche,
       Logik, Daten, Events und Dienste besitzen kann.
   ========================================================= */

"use strict";


(function (global) {


    /* =====================================================
       01 — CONSTANTS
       ===================================================== */

    const VERSION =
        "20.0.0";

    const RUNTIME_NAME =
        "HalDo AI OS App Runtime";


    /* =====================================================
       02 — INTERNAL HELPERS
       ===================================================== */

    function isObject(value) {

        return (
            value !== null &&
            typeof value === "object"
        );

    }


    function isFunction(value) {

        return (
            typeof value === "function"
        );

    }


    function safeString(
        value,
        fallback = ""
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return fallback;

        }

        return String(value);

    }


    function createError(
        message,
        cause = null
    ) {

        const error =
            new Error(
                safeString(
                    message,
                    "HalDo App Runtime Error"
                )
            );

        error.name =
            "HalDoAppRuntimeError";

        if (cause) {

            error.cause =
                cause;

        }

        return error;

    }


    function dispatch(
        name,
        detail = {}
    ) {

        try {

            global.dispatchEvent(
                new CustomEvent(
                    name,
                    {
                        detail
                    }
                )
            );

        } catch (error) {

            console.error(
                "[HalDo App Runtime] Event error:",
                error
            );

        }

    }


    /* =====================================================
       03 — SERVICE LOOKUP
       ===================================================== */

    function getOS() {

        return (
            global.HalDoOS ||
            null
        );

    }


    function getKernel() {

        const os =
            getOS();

        return (
            global.HalDoKernel ||
            global.HalDoOSKernel ||
            (
                os &&
                os.kernel
            ) ||
            null
        );

    }


    function getSystem() {

        const os =
            getOS();

        return (
            global.HalDoSystem ||
            global.HalDoOSSystem ||
            (
                os &&
                os.system
            ) ||
            null
        );

    }


    function getStorage() {

        const os =
            getOS();

        return (
            global.HalDoStorage ||
            global.HalDoStorageManager ||
            (
                os &&
                (
                    os.storage ||
                    os.storageManager
                )
            ) ||
            null
        );

    }


    function getLanguage() {

        const os =
            getOS();

        return (
            global.HalDoLanguage ||
            global.HalDoLanguageManager ||
            (
                os &&
                (
                    os.language ||
                    os.languageManager
                )
            ) ||
            null
        );

    }


    function getAI() {

        const os =
            getOS();

        return (
            global.HalDoAI ||
            global.HalDoAICore ||
            (
                os &&
                (
                    os.ai ||
                    os.aiCore
                )
            ) ||
            null
        );

    }


    function getVoice() {

        const os =
            getOS();

        return (
            global.HalDoVoice ||
            global.HalDoAIVoice ||
            (
                os &&
                (
                    os.voice ||
                    os.aiVoice
                )
            ) ||
            null
        );

    }


    function getRouter() {

        const os =
            getOS();

        return (
            global.HalDoAppRouter ||
            global.HalDoRouter ||
            (
                os &&
                (
                    os.router ||
                    os.appRouter
                )
            ) ||
            null
        );

    }


    function getWindowManager() {

        const os =
            getOS();

        return (
            global.HalDoWindowManager ||
            (
                os &&
                os.windowManager
            ) ||
            null
        );

    }


    function getEventBus() {

        const os =
            getOS();

        return (
            global.HalDoEventBus ||
            (
                os &&
                os.eventBus
            ) ||
            null
        );

    }


    /* =====================================================
       04 — EVENT BUS BRIDGE
       ===================================================== */

    function emitEvent(
        eventName,
        detail = {}
    ) {

        const bus =
            getEventBus();


        if (
            bus
        ) {

            try {

                if (
                    isFunction(
                        bus.emit
                    )
                ) {

                    return bus.emit(
                        eventName,
                        detail
                    );

                }


                if (
                    isFunction(
                        bus.dispatch
                    )
                ) {

                    return bus.dispatch(
                        eventName,
                        detail
                    );

                }


                if (
                    isFunction(
                        bus.publish
                    )
                ) {

                    return bus.publish(
                        eventName,
                        detail
                    );

                }

            } catch (error) {

                console.error(
                    "[HalDo App Runtime] EventBus:",
                    error
                );

            }

        }


        dispatch(
            "haldo:" + eventName,
            detail
        );


        return true;

    }


    function listenEvent(
        eventName,
        handler
    ) {

        if (
            !isFunction(handler)
        ) {

            return function () {};

        }


        const bus =
            getEventBus();


        if (
            bus
        ) {

            try {

                if (
                    isFunction(
                        bus.on
                    )
                ) {

                    const result =
                        bus.on(
                            eventName,
                            handler
                        );

                    if (
                        isFunction(result)
                    ) {

                        return result;

                    }

                }


                if (
                    isFunction(
                        bus.subscribe
                    )
                ) {

                    const result =
                        bus.subscribe(
                            eventName,
                            handler
                        );

                    if (
                        isFunction(result)
                    ) {

                        return result;

                    }

                }

            } catch (error) {

                console.error(
                    "[HalDo App Runtime] EventBus listen:",
                    error
                );

            }

        }


        const wrapped =
            function (event) {

                try {

                    handler(
                        event.detail !== undefined
                            ? event.detail
                            : event
                    );

                } catch (error) {

                    console.error(
                        "[HalDo App Runtime] Listener:",
                        error
                    );

                }

            };


        global.addEventListener(
            "haldo:" + eventName,
            wrapped
        );


        return function () {

            global.removeEventListener(
                "haldo:" + eventName,
                wrapped
            );

        };

    }


    /* =====================================================
       05 — APP STATE
       ===================================================== */

    class AppState {


        constructor(
            initial = {}
        ) {

            this.values =
                isObject(initial)
                    ? {
                        ...initial
                    }
                    : {};

            this.listeners =
                new Set();

        }


        get(
            key,
            fallback = undefined
        ) {

            if (
                Object.prototype.hasOwnProperty.call(
                    this.values,
                    key
                )
            ) {

                return this.values[key];

            }

            return fallback;

        }


        set(
            key,
            value
        ) {

            const oldValue =
                this.values[key];


            this.values[key] =
                value;


            const payload = {

                key,

                value,

                oldValue

            };


            this.listeners.forEach(
                listener => {

                    try {

                        listener(
                            payload
                        );

                    } catch (error) {

                        console.error(
                            "[HalDo App State]",
                            error
                        );

                    }

                }
            );


            return value;

        }


        update(
            values
        ) {

            if (
                !isObject(values)
            ) {

                return this.values;

            }


            Object.keys(
                values
            ).forEach(
                key => {

                    this.set(
                        key,
                        values[key]
                    );

                }
            );


            return this.values;

        }


        remove(
            key
        ) {

            if (
                !Object.prototype.hasOwnProperty.call(
                    this.values,
                    key
                )
            ) {

                return false;

            }


            const oldValue =
                this.values[key];


            delete this.values[key];


            this.listeners.forEach(
                listener => {

                    try {

                        listener({

                            key,

                            value:
                                undefined,

                            oldValue,

                            removed:
                                true

                        });

                    } catch (error) {

                        console.error(
                            "[HalDo App State]",
                            error
                        );

                    }

                }
            );


            return true;

        }


        has(
            key
        ) {

            return Object.prototype.hasOwnProperty.call(
                this.values,
                key
            );

        }


        all() {

            return {
                ...this.values
            };

        }


        subscribe(
            listener
        ) {

            if (
                !isFunction(listener)
            ) {

                return function () {};

            }


            this.listeners.add(
                listener
            );


            return () => {

                this.listeners.delete(
                    listener
                );

            };

        }


        clear() {

            this.values =
                {};

        }

    }


    /* =====================================================
       06 — APP STORAGE BRIDGE
       ===================================================== */

    class AppStorage {


        constructor(
            appId
        ) {

            this.appId =
                appId;

            this.prefix =
                "haldo.app." +
                appId +
                ".";

        }


        getStorageManager() {

            return getStorage();

        }


        makeKey(
            key
        ) {

            return (
                this.prefix +
                safeString(key)
            );

        }


        async get(
            key,
            fallback = null
        ) {

            const storage =
                this.getStorageManager();


            if (
                storage
            ) {

                try {

                    if (
                        isFunction(
                            storage.get
                        )
                    ) {

                        const result =
                            await storage.get(
                                this.makeKey(
                                    key
                                )
                            );

                        return (
                            result === undefined
                                ? fallback
                                : result
                        );

                    }


                    if (
                        isFunction(
                            storage.read
                        )
                    ) {

                        const result =
                            await storage.read(
                                this.makeKey(
                                    key
                                )
                            );

                        return (
                            result === undefined
                                ? fallback
                                : result
                        );

                    }

                } catch (error) {

                    console.error(
                        "[HalDo App Storage]",
                        error
                    );

                }

            }


            try {

                const raw =
                    global.localStorage.getItem(
                        this.makeKey(
                            key
                        )
                    );


                if (
                    raw === null
                ) {

                    return fallback;

                }


                try {

                    return JSON.parse(
                        raw
                    );

                } catch (_) {

                    return raw;

                }

            } catch (error) {

                console.error(
                    "[HalDo App Storage]",
                    error
                );

            }


            return fallback;

        }


        async set(
            key,
            value
        ) {

            const storage =
                this.getStorageManager();


            if (
                storage
            ) {

                try {

                    if (
                        isFunction(
                            storage.set
                        )
                    ) {

                        await storage.set(
                            this.makeKey(
                                key
                            ),
                            value
                        );

                        return value;

                    }


                    if (
                        isFunction(
                            storage.write
                        )
                    ) {

                        await storage.write(
                            this.makeKey(
                                key
                            ),
                            value
                        );

                        return value;

                    }

                } catch (error) {

                    console.error(
                        "[HalDo App Storage]",
                        error
                    );

                }

            }


            try {

                global.localStorage.setItem(
                    this.makeKey(
                        key
                    ),
                    JSON.stringify(
                        value
                    )
                );

            } catch (error) {

                console.error(
                    "[HalDo App Storage]",
                    error
                );

            }


            return value;

        }


        async remove(
            key
        ) {

            const storage =
                this.getStorageManager();


            if (
                storage
            ) {

                try {

                    if (
                        isFunction(
                            storage.remove
                        )
                    ) {

                        await storage.remove(
                            this.makeKey(
                                key
                            )
                        );

                        return true;

                    }


                    if (
                        isFunction(
                            storage.delete
                        )
                    ) {

                        await storage.delete(
                            this.makeKey(
                                key
                            )
                        );

                        return true;

                    }

                } catch (error) {

                    console.error(
                        "[HalDo App Storage]",
                        error
                    );

                }

            }


            try {

                global.localStorage.removeItem(
                    this.makeKey(
                        key
                    )
                );

            } catch (_) {}


            return true;

        }


        async clear() {

            const storage =
                this.getStorageManager();


            if (
                storage
            ) {

                try {

                    if (
                        isFunction(
                            storage.clearNamespace
                        )
                    ) {

                        await storage.clearNamespace(
                            this.prefix
                        );

                        return true;

                    }

                } catch (error) {

                    console.error(
                        "[HalDo App Storage]",
                        error
                    );

                }

            }


            try {

                const keys = [];


                for (
                    let index = 0;
                    index <
                    global.localStorage.length;
                    index++
                ) {

                    const key =
                        global.localStorage.key(
                            index
                        );


                    if (
                        key &&
                        key.startsWith(
                            this.prefix
                        )
                    ) {

                        keys.push(
                            key
                        );

                    }

                }


                keys.forEach(
                    key => {

                        global.localStorage.removeItem(
                            key
                        );

                    }
                );

            } catch (_) {}


            return true;

        }

    }


    /* =====================================================
       07 — DOM EVENT CLEANUP
       ===================================================== */

    class CleanupManager {


        constructor() {

            this.cleanups =
                new Set();

        }


        add(
            cleanup
        ) {

            if (
                isFunction(cleanup)
            ) {

                this.cleanups.add(
                    cleanup
                );

            }

            return cleanup;

        }


        event(
            target,
            eventName,
            handler,
            options
        ) {

            if (
                !target ||
                !isFunction(
                    target.addEventListener
                )
            ) {

                return function () {};

            }


            target.addEventListener(
                eventName,
                handler,
                options
            );


            const cleanup =
                () => {

                    try {

                        target.removeEventListener(
                            eventName,
                            handler,
                            options
                        );

                    } catch (_) {}

                };


            this.add(
                cleanup
            );


            return cleanup;

        }


        timeout(
            callback,
            delay
        ) {

            const timer =
                setTimeout(
                    callback,
                    delay
                );


            this.add(
                () => {

                    clearTimeout(
                        timer
                    );

                }
            );


            return timer;

        }


        interval(
            callback,
            delay
        ) {

            const timer =
                setInterval(
                    callback,
                    delay
                );


            this.add(
                () => {

                    clearInterval(
                        timer
                    );

                }
            );


            return timer;

        }


        addEventBusListener(
            eventName,
            handler
        ) {

            const cleanup =
                listenEvent(
                    eventName,
                    handler
                );


            this.add(
                cleanup
            );


            return cleanup;

        }


        clear() {

            const list =
                Array.from(
                    this.cleanups
                );


            this.cleanups.clear();


            list.forEach(
                cleanup => {

                    try {

                        cleanup();

                    } catch (error) {

                        console.error(
                            "[HalDo App Cleanup]",
                            error
                        );

                    }

                }
            );

        }

    }


    /* =====================================================
       08 — APP SERVICES
       ===================================================== */

    class AppServices {


        constructor(
            runtime
        ) {

            this.runtime =
                runtime;

        }


        get kernel() {

            return getKernel();

        }


        get system() {

            return getSystem();

        }


        get storage() {

            return this.runtime.storage;

        }


        get language() {

            return getLanguage();

        }


        get ai() {

            return getAI();

        }


        get voice() {

            return getVoice();

        }


        get router() {

            return getRouter();

        }


        get windowManager() {

            return getWindowManager();

        }


        get eventBus() {

            return getEventBus();

        }


        emit(
            eventName,
            detail
        ) {

            return emitEvent(
                eventName,
                {
                    appId:
                        this.runtime.id,

                    ...detail
                }
            );

        }


        on(
            eventName,
            handler
        ) {

            return this.runtime.cleanup
                .addEventBusListener(
                    eventName,
                    handler
                );

        }

    }


    /* =====================================================
       09 — APP CONTEXT
       ===================================================== */

    class AppContext {


        constructor(
            runtime,
            app
        ) {

            this.runtime =
                runtime;

            this.app =
                app;

            this.id =
                runtime.id;

            this.manifest =
                runtime.manifest;

            this.state =
                runtime.state;

            this.storage =
                runtime.storage;

            this.cleanup =
                runtime.cleanup;

            this.services =
                runtime.services;

            this.container =
                runtime.container;

        }


        get kernel() {

            return this.services.kernel;

        }


        get system() {

            return this.services.system;

        }


        get language() {

            return this.services.language;

        }


        get ai() {

            return this.services.ai;

        }


        get voice() {

            return this.services.voice;

        }


        get router() {

            return this.services.router;

        }


        get windowManager() {

            return this.services.windowManager;

        }


        get eventBus() {

            return this.services.eventBus;

        }


        emit(
            eventName,
            detail = {}
        ) {

            return this.services.emit(
                eventName,
                detail
            );

        }


        on(
            eventName,
            handler
        ) {

            return this.services.on(
                eventName,
                handler
            );

        }


        translate(
            key,
            fallback = key
        ) {

            const language =
                this.language;


            if (
                !language
            ) {

                return fallback;

            }


            try {

                if (
                    isFunction(
                        language.t
                    )
                ) {

                    return language.t(
                        key,
                        fallback
                    );

                }


                if (
                    isFunction(
                        language.translate
                    )
                ) {

                    return language.translate(
                        key,
                        fallback
                    );

                }


                if (
                    isFunction(
                        language.get
                    )
                ) {

                    return language.get(
                        key,
                        fallback
                    );

                }

            } catch (error) {

                console.error(
                    "[HalDo App Language]",
                    error
                );

            }


            return fallback;

        }


        async askAI(
            text,
            options = {}
        ) {

            const ai =
                this.ai;


            if (
                !ai
            ) {

                return null;

            }


            const methods = [

                "chat",

                "ask",

                "respond",

                "process",

                "generate"

            ];


            for (
                const method of methods
            ) {

                if (
                    isFunction(
                        ai[method]
                    )
                ) {

                    try {

                        const result =
                            await ai[method](
                                text,
                                options
                            );


                        if (
                            typeof result ===
                            "string"
                        ) {

                            return result;

                        }


                        if (
                            result &&
                            typeof result.text ===
                            "string"
                        ) {

                            return result.text;

                        }


                        if (
                            result &&
                            typeof result.response ===
                            "string"
                        ) {

                            return result.response;

                        }

                    } catch (error) {

                        console.error(
                            "[HalDo App AI]",
                            error
                        );

                    }

                }

            }


            return null;

        }


        async speak(
            text,
            options = {}
        ) {

            const voice =
                this.voice;


            if (
                !voice
            ) {

                return false;

            }


            try {

                if (
                    isFunction(
                        voice.speak
                    )
                ) {

                    return await voice.speak(
                        text,
                        options
                    );

                }


                if (
                    isFunction(
                        voice.say
                    )
                ) {

                    return await voice.say(
                        text,
                        options
                    );

                }

            } catch (error) {

                console.error(
                    "[HalDo App Voice]",
                    error
                );

            }


            return false;

        }


        navigate(
            route,
            options = {}
        ) {

            const router =
                this.router;


            if (
                !router
            ) {

                return false;

            }


            try {

                if (
                    isFunction(
                        router.navigate
                    )
                ) {

                    return router.navigate(
                        route,
                        options
                    );

                }


                if (
                    isFunction(
                        router.go
                    )
                ) {

                    return router.go(
                        route,
                        options
                    );

                }


                if (
                    isFunction(
                        router.open
                    )
                ) {

                    return router.open(
                        route,
                        options
                    );

                }

            } catch (error) {

                console.error(
                    "[HalDo App Router]",
                    error
                );

            }


            return false;

        }


        createElement(
            tag,
            options = {}
        ) {

            const element =
                document.createElement(
                    tag
                );


            if (
                options.className
            ) {

                element.className =
                    options.className;

            }


            if (
                options.text !== undefined
            ) {

                element.textContent =
                    options.text;

            }


            if (
                options.html !== undefined
            ) {

                element.innerHTML =
                    options.html;

            }


            if (
                isObject(
                    options.attributes
                )
            ) {

                Object.entries(
                    options.attributes
                ).forEach(
                    ([key, value]) => {

                        element.setAttribute(
                            key,
                            value
                        );

                    }
                );

            }


            return element;

        }


        mount(
            element
        ) {

            if (
                !element
            ) {

                return null;

            }


            this.container.innerHTML =
                "";


            this.container.appendChild(
                element
            );


            this.runtime.element =
                element;


            return element;

        }


        setTitle(
            title
        ) {

            this.runtime.setTitle(
                title
            );

        }


        log(
            ...args
        ) {

            console.log(
                "[HalDo App:" +
                this.id +
                "]",
                ...args
            );

        }


        warn(
            ...args
        ) {

            console.warn(
                "[HalDo App:" +
                this.id +
                "]",
                ...args
            );

        }


        error(
            ...args
        ) {

            console.error(
                "[HalDo App:" +
                this.id +
                "]",
                ...args
            );

        }

    }


    /* =====================================================
       10 — APP RUNTIME INSTANCE
       ===================================================== */

    class AppRuntime {


        constructor(
            app,
            options = {}
        ) {

            if (
                !isObject(app)
            ) {

                throw createError(
                    "Eine gültige App-Definition ist erforderlich."
                );

            }


            this.app =
                app;


            this.id =
                safeString(
                    app.id ||
                    app.appId ||
                    app.name
                );


            if (
                !this.id
            ) {

                throw createError(
                    "Die App besitzt keine gültige ID."
                );

            }


            this.manifest =
                isObject(
                    app.manifest
                )
                    ? {
                        ...app.manifest
                    }
                    : {
                        ...app
                    };


            this.options =
                options;


            this.status =
                "created";


            this.element =
                null;


            this.container =
                options.container ||
                null;


            this.state =
                new AppState(
                    app.state ||
                    {}
                );


            this.storage =
                new AppStorage(
                    this.id
                );


            this.cleanup =
                new CleanupManager();


            this.services =
                new AppServices(
                    this
                );


            this.context =
                new AppContext(
                    this,
                    app
                );


            this.startedAt =
                null;


            this.initializedAt =
                null;


            this.error =
                null;


            this.lifecycle =
                {

                    install:
                        false,

                    initialize:
                        false,

                    mount:
                        false,

                    activate:
                        false

                };

        }


        setStatus(
            status
        ) {

            this.status =
                status;


            emitEvent(
                "app:status",
                {

                    appId:
                        this.id,

                    status,

                    runtime:
                        this

                }
            );


            return status;

        }


        setTitle(
            title
        ) {

            this.title =
                safeString(
                    title,
                    this.id
                );


            if (
                this.options.titleElement
            ) {

                this.options.titleElement.textContent =
                    this.title;

            }


            emitEvent(
                "app:title",
                {

                    appId:
                        this.id,

                    title:
                        this.title

                }
            );

        }


        resolveContainer() {

            if (
                this.container &&
                this.container.nodeType
            ) {

                return this.container;

            }


            if (
                this.options.containerId
            ) {

                const found =
                    document.getElementById(
                        this.options.containerId
                    );


                if (
                    found
                ) {

                    this.container =
                        found;

                    return found;

                }

            }


            const created =
                document.createElement(
                    "div"
                );


            created.className =
                "haldo-app-runtime-container";


            created.dataset.appId =
                this.id;


            this.container =
                created;


            return created;

        }


        async install() {

            if (
                this.lifecycle.install
            ) {

                return this;

            }


            this.setStatus(
                "installing"
            );


            try {

                const method =
                    this.app.install;


                if (
                    isFunction(method)
                ) {

                    await method.call(
                        this.app,
                        this.context
                    );

                }


                this.lifecycle.install =
                    true;


                this.setStatus(
                    "installed"
                );


                emitEvent(
                    "app:installed",
                    {

                        appId:
                            this.id,

                        runtime:
                            this

                    }
                );


                return this;

            } catch (error) {

                return this.fail(
                    error,
                    "install"
                );

            }

        }


        async initialize() {

            if (
                this.lifecycle.initialize
            ) {

                return this;

            }


            if (
                !this.lifecycle.install
            ) {

                await this.install();

            }


            this.setStatus(
                "initializing"
            );


            try {

                const method =
                    this.app.initialize ||
                    this.app.init;


                if (
                    isFunction(method)
                ) {

                    await method.call(
                        this.app,
                        this.context
                    );

                }


                this.lifecycle.initialize =
                    true;


                this.initializedAt =
                    Date.now();


                this.setStatus(
                    "initialized"
                );


                emitEvent(
                    "app:initialized",
                    {

                        appId:
                            this.id,

                        runtime:
                            this

                    }
                );


                return this;

            } catch (error) {

                return this.fail(
                    error,
                    "initialize"
                );

            }

        }


        async mount() {

            if (
                this.lifecycle.mount
            ) {

                return this;

            }


            if (
                !this.lifecycle.initialize
            ) {

                await this.initialize();

            }


            this.setStatus(
                "mounting"
            );


            try {

                this.resolveContainer();


                let result =
                    null;


                if (
                    isFunction(
                        this.app.mount
                    )
                ) {

                    result =
                        await this.app.mount.call(
                            this.app,
                            this.context
                        );

                } else if (
                    isFunction(
                        this.app.render
                    )
                ) {

                    result =
                        await this.app.render.call(
                            this.app,
                            this.context
                        );

                } else if (
                    isFunction(
                        this.app.createView
                    )
                ) {

                    result =
                        await this.app.createView.call(
                            this.app,
                            this.context
                        );

                }


                if (
                    result instanceof Node
                ) {

                    this.element =
                        result;


                    if (
                        this.container &&
                        result.parentNode !==
                        this.container
                    ) {

                        this.container.innerHTML =
                            "";

                        this.container.appendChild(
                            result
                        );

                    }

                }


                this.lifecycle.mount =
                    true;


                this.setStatus(
                    "mounted"
                );


                emitEvent(
                    "app:mounted",
                    {

                        appId:
                            this.id,

                        runtime:
                            this,

                        element:
                            this.element

                    }
                );


                return this;

            } catch (error) {

                return this.fail(
                    error,
                    "mount"
                );

            }

        }


        async activate() {

            if (
                this.lifecycle.activate
            ) {

                return this;

            }


            if (
                !this.lifecycle.mount
            ) {

                await this.mount();

            }


            this.setStatus(
                "activating"
            );


            try {

                if (
                    isFunction(
                        this.app.activate
                    )
                ) {

                    await this.app.activate.call(
                        this.app,
                        this.context
                    );

                } else if (
                    isFunction(
                        this.app.start
                    )
                ) {

                    await this.app.start.call(
                        this.app,
                        this.context
                    );

                }


                this.lifecycle.activate =
                    true;


                this.startedAt =
                    Date.now();


                this.setStatus(
                    "active"
                );


                emitEvent(
                    "app:activated",
                    {

                        appId:
                            this.id,

                        runtime:
                            this

                    }
                );


                return this;

            } catch (error) {

                return this.fail(
                    error,
                    "activate"
                );

            }

        }


        async start() {

            await this.install();

            await this.initialize();

            await this.mount();

            await this.activate();


            return this;

        }


        async deactivate() {

            if (
                !this.lifecycle.activate
            ) {

                return this;

            }


            this.setStatus(
                "deactivating"
            );


            try {

                const method =
                    this.app.deactivate ||
                    this.app.stop;


                if (
                    isFunction(method)
                ) {

                    await method.call(
                        this.app,
                        this.context
                    );

                }


                this.lifecycle.activate =
                    false;


                this.setStatus(
                    "inactive"
                );


                emitEvent(
                    "app:deactivated",
                    {

                        appId:
                            this.id,

                        runtime:
                            this

                    }
                );


                return this;

            } catch (error) {

                return this.fail(
                    error,
                    "deactivate"
                );

            }

        }


        async destroy() {

            this.setStatus(
                "destroying"
            );


            try {

                if (
                    isFunction(
                        this.app.destroy
                    )
                ) {

                    await this.app.destroy.call(
                        this.app,
                        this.context
                    );

                }


                this.cleanup.clear();


                if (
                    this.container
                ) {

                    try {

                        this.container.innerHTML =
                            "";

                    } catch (_) {}

                }


                this.element =
                    null;


                this.lifecycle =
                    {

                        install:
                            false,

                        initialize:
                            false,

                        mount:
                            false,

                        activate:
                            false

                    };


                this.setStatus(
                    "destroyed"
                );


                emitEvent(
                    "app:destroyed",
                    {

                        appId:
                            this.id,

                        runtime:
                            this

                    }
                );


                return true;

            } catch (error) {

                this.fail(
                    error,
                    "destroy"
                );


                return false;

            }

        }


        async fail(
            error,
            stage
        ) {

            this.error =
                error instanceof Error
                    ? error
                    : new Error(
                        safeString(
                            error
                        )
                    );


            this.status =
                "error";


            console.error(
                "[HalDo App Runtime]",
                this.id,
                stage,
                this.error
            );


            emitEvent(
                "app:error",
                {

                    appId:
                        this.id,

                    stage,

                    error:
                        this.error,

                    runtime:
                        this

                }
            );


            /*
             * Fehler werden nicht still verschluckt.
             * Der App Manager kann anhand des Runtime-Status
             * entscheiden, ob die App geschlossen oder erneut
             * gestartet werden soll.
             */

            throw this.error;

        }


        diagnostics() {

            return {

                id:
                    this.id,

                version:
                    this.manifest.version ||
                    this.app.version ||
                    null,

                status:
                    this.status,

                lifecycle:
                    {
                        ...this.lifecycle
                    },

                hasContainer:
                    Boolean(
                        this.container
                    ),

                hasElement:
                    Boolean(
                        this.element
                    ),

                startedAt:
                    this.startedAt,

                initializedAt:
                    this.initializedAt,

                error:
                    this.error
                        ? this.error.message
                        : null

            };

        }

    }


    /* =====================================================
       11 — RUNTIME MANAGER
       ===================================================== */

    class AppRuntimeManager {


        constructor() {

            this.version =
                VERSION;

            this.name =
                RUNTIME_NAME;

            this.instances =
                new Map();

            this.ready =
                false;

            this.startedAt =
                Date.now();

        }


        register(
            app,
            options = {}
        ) {

            if (
                !isObject(app)
            ) {

                throw createError(
                    "Ungültige App-Definition."
                );

            }


            const id =
                safeString(
                    app.id ||
                    app.appId ||
                    app.name
                );


            if (
                !id
            ) {

                throw createError(
                    "App-ID fehlt."
                );

            }


            if (
                this.instances.has(id)
            ) {

                return this.instances.get(
                    id
                );

            }


            const runtime =
                new AppRuntime(
                    app,
                    options
                );


            this.instances.set(
                id,
                runtime
            );


            emitEvent(
                "app:runtime-registered",
                {

                    appId:
                        id,

                    runtime

                }
            );


            return runtime;

        }


        create(
            app,
            options = {}
        ) {

            return this.register(
                app,
                options
            );

        }


        get(
            id
        ) {

            return this.instances.get(
                safeString(id)
            ) || null;

        }


        has(
            id
        ) {

            return this.instances.has(
                safeString(id)
            );

        }


        remove(
            id
        ) {

            const runtime =
                this.get(
                    id
                );


            if (
                !runtime
            ) {

                return false;

            }


            this.instances.delete(
                safeString(id)
            );


            return true;

        }


        async start(
            app,
            options = {}
        ) {

            const runtime =
                app instanceof AppRuntime
                    ? app
                    : this.register(
                        app,
                        options
                    );


            await runtime.start();


            return runtime;

        }


        async stop(
            id
        ) {

            const runtime =
                this.get(
                    id
                );


            if (
                !runtime
            ) {

                return false;

            }


            await runtime.deactivate();


            return true;

        }


        async destroy(
            id
        ) {

            const runtime =
                this.get(
                    id
                );


            if (
                !runtime
            ) {

                return false;

            }


            await runtime.destroy();


            this.remove(
                id
            );


            return true;

        }


        getAll() {

            return Array.from(
                this.instances.values()
            );

        }


        diagnostics() {

            return {

                name:
                    this.name,

                version:
                    this.version,

                ready:
                    this.ready,

                count:
                    this.instances.size,

                apps:
                    this.getAll()
                        .map(
                            runtime =>
                                runtime.diagnostics()
                        )

            };

        }


        setReady() {

            this.ready =
                true;


            emitEvent(
                "app-runtime-ready",
                {

                    runtime:
                        this

                }
            );


            return true;

        }

    }


    /* =====================================================
       12 — GLOBAL RUNTIME
       ===================================================== */

    const runtimeManager =
        new AppRuntimeManager();


    global.HalDoAppRuntime =
        runtimeManager;


    global.HalDoAppRuntimeManager =
        runtimeManager;


    global.HalDoAppRuntimeClass =
        AppRuntime;


    global.HalDoAppContext =
        AppContext;


    global.HalDoAppState =
        AppState;


    /* =====================================================
       13 — HALDO OS CONNECTION
       ===================================================== */

    function connectToOS() {

        const os =
            getOS();


        if (
            !os
        ) {

            return false;

        }


        try {

            os.appRuntime =
                runtimeManager;

        } catch (_) {}


        try {

            if (
                !os.runtime
            ) {

                os.runtime =
                    runtimeManager;

            }

        } catch (_) {}


        return true;

    }


    /* =====================================================
       14 — RUNTIME READY
       ===================================================== */

    function initializeRuntime() {

        connectToOS();

        runtimeManager.setReady();

        dispatch(
            "haldo:app-runtime-ready",
            {

                runtime:
                    runtimeManager,

                version:
                    VERSION

            }
        );

    }


    /* =====================================================
       15 — KERNEL / SYSTEM EVENTS
       ===================================================== */

    listenEvent(
        "kernel:ready",
        function () {

            connectToOS();

            emitEvent(
                "app-runtime:kernel-ready",
                {

                    runtime:
                        runtimeManager

                }
            );

        }
    );


    listenEvent(
        "system:ready",
        function () {

            connectToOS();

            emitEvent(
                "app-runtime:system-ready",
                {

                    runtime:
                        runtimeManager

                }
            );

        }
    );


    /* =====================================================
       16 — DOM READY
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeRuntime,
            {
                once:
                    true
            }
        );

    } else {

        initializeRuntime();

    }


    /* =====================================================
       17 — PUBLIC API
       ===================================================== */

    runtimeManager.api = {

        version:
            VERSION,

        register:
            runtimeManager.register.bind(
                runtimeManager
            ),

        create:
            runtimeManager.create.bind(
                runtimeManager
            ),

        get:
            runtimeManager.get.bind(
                runtimeManager
            ),

        has:
            runtimeManager.has.bind(
                runtimeManager
            ),

        start:
            runtimeManager.start.bind(
                runtimeManager
            ),

        stop:
            runtimeManager.stop.bind(
                runtimeManager
            ),

        destroy:
            runtimeManager.destroy.bind(
                runtimeManager
            ),

        getAll:
            runtimeManager.getAll.bind(
                runtimeManager
            ),

        diagnostics:
            runtimeManager.diagnostics.bind(
                runtimeManager
            )

    };


    /* =====================================================
       18 — LOG
       ===================================================== */

    console.info(
        "[HalDo AI OS 20]",
        RUNTIME_NAME,
        VERSION,
        "bereit."
    );


    /* =====================================================
       END
       ===================================================== */

})(window);