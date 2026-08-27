/* ============================================================
   HALDO AI OS 18
   js/app-manager.js
   MASTER REPAIR
   TEIL 1 / 16

   App Manager
   ------------------------------------------------------------
   Verantwortlich für:
   - App Registry Anbindung
   - App Definitionen
   - App Instances
   - App Lifecycle
   - App State
   - App Metadata
   - Events
   - Service Bridges
   - Runtime / Router / Window Manager Integration

   WICHTIG:
   Diese Datei wird erst in TEIL 16 geschlossen.
   ============================================================ */

(function (
    window,
    document
) {

    "use strict";


    /* ========================================================
       1 — GLOBAL OBJECTS
       ======================================================== */

    const HalDo =
        window.HalDo =
            window.HalDo || {};


    const HalDoOS =
        window.HalDoOS =
            window.HalDoOS || {};


    /* ========================================================
       2 — MODULE INFORMATION
       ======================================================== */

    const MODULE_ID =
        "haldo-app-manager";


    const MODULE_NAME =
        "HalDo App Manager";


    const VERSION =
        "18.0.32";


    /* ========================================================
       3 — INTERNAL STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        apps:
            new Map(),

        instances:
            new Map(),

        contexts:
            new Map(),

        appState:
            new Map(),

        metadata:
            new Map(),

        listeners:
            new Map(),

        activeAppId:
            null,

        sequence:
            0,

        errors:
            [],

        createdAt:
            Date.now(),

        updatedAt:
            Date.now()

    };


    /* ========================================================
       4 — BASIC HELPERS
       ======================================================== */

    function now() {

        return Date.now();

    }


    function safeString(
        value
    ) {

        try {

            return String(
                value == null
                    ? ""
                    : value
            );

        } catch (
            _
        ) {

            return "";

        }

    }


    function normalizeId(
        value
    ) {

        return safeString(
            value
        )
            .trim()
            .toLowerCase();

    }


    function isObject(
        value
    ) {

        return (
            value !== null &&
            typeof value ===
                "object" &&
            !Array.isArray(
                value
            )
        );

    }


    function isFunction(
        value
    ) {

        return (
            typeof value ===
            "function"
        );

    }


    function isElement(
        value
    ) {

        return (
            value &&
            typeof value ===
                "object" &&
            value.nodeType ===
                1
        );

    }


    function clone(
        value
    ) {

        if (
            value ===
            undefined
        ) {

            return undefined;

        }


        if (
            value ===
            null
        ) {

            return null;

        }


        try {

            return JSON.parse(
                JSON.stringify(
                    value
                )
            );

        } catch (
            _
        ) {

            return value;

        }

    }


    function hasMethod(
        object,
        method
    ) {

        return !!(
            object &&
            isFunction(
                object[
                    method
                ]
            )
        );

    }


    /* ========================================================
       5 — ERROR COLLECTION
       ======================================================== */

    function reportError(
        exception,
        source =
            MODULE_NAME
    ) {

        const error =
            exception instanceof Error
                ? exception
                : new Error(
                    safeString(
                        exception
                    )
                );


        const entry = {

            source:
                safeString(
                    source
                ),

            name:
                error.name,

            message:
                error.message,

            stack:
                error.stack ||
                null,

            timestamp:
                now()

        };


        state.errors.push(
            entry
        );


        if (
            state.errors.length >
            100
        ) {

            state.errors.shift();

        }


        try {

            console.error(
                "[HalDo App Manager]",
                entry.source,
                entry.message
            );

        } catch (
            _
        ) {}


        return entry;

    }


    /* ========================================================
       6 — GLOBAL EVENT DISPATCH
       ======================================================== */

    function dispatch(
        eventName,
        detail = {}
    ) {

        const name =
            safeString(
                eventName
            ).trim();


        if (!name) {

            return false;

        }


        try {

            if (
                typeof window.CustomEvent ===
                "function"
            ) {

                window.dispatchEvent(
                    new CustomEvent(
                        name,
                        {
                            detail:
                                clone(
                                    detail
                                )
                        }
                    )
                );

            } else {

                const event =
                    document.createEvent(
                        "CustomEvent"
                    );


                event.initCustomEvent(
                    name,
                    false,
                    false,
                    clone(
                        detail
                    )
                );


                window.dispatchEvent(
                    event
                );

            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Global Event Dispatch"
            );


            return false;

        }


        return true;

    }


    /* ========================================================
       7 — INTERNAL EVENT EMITTER
       ======================================================== */

    function emit(
        eventName,
        detail = {}
    ) {

        const name =
            safeString(
                eventName
            ).trim();


        if (!name) {

            return false;

        }


        const callbacks =
            state.listeners.get(
                name
            );


        if (
            callbacks &&
            callbacks.size
        ) {

            callbacks.forEach(
                callback => {

                    try {

                        callback(
                            clone(
                                detail
                            )
                        );

                    } catch (
                        exception
                    ) {

                        reportError(
                            exception,
                            "Listener " +
                            name
                        );

                    }

                }
            );

        }


        dispatch(
            "haldo:" +
            name,
            detail
        );


        return true;

    }


    /* ========================================================
       8 — EVENT LISTENER
       ======================================================== */

    function on(
        eventName,
        callback
    ) {

        const name =
            safeString(
                eventName
            ).trim();


        if (
            !name ||
            !isFunction(
                callback
            )
        ) {

            return () => {};

        }


        if (
            !state.listeners.has(
                name
            )
        ) {

            state.listeners.set(
                name,
                new Set()
            );

        }


        const callbacks =
            state.listeners.get(
                name
            );


        callbacks.add(
            callback
        );


        return () => {

            off(
                name,
                callback
            );

        };

    }


    /* ========================================================
       9 — REMOVE EVENT LISTENER
       ======================================================== */

    function off(
        eventName,
        callback
    ) {

        const name =
            safeString(
                eventName
            ).trim();


        const callbacks =
            state.listeners.get(
                name
            );


        if (!callbacks) {

            return false;

        }


        if (
            isFunction(
                callback
            )
        ) {

            callbacks.delete(
                callback
            );

        } else {

            callbacks.clear();

        }


        if (
            callbacks.size ===
            0
        ) {

            state.listeners.delete(
                name
            );

        }


        return true;

    }


    /* ========================================================
       10 — REGISTRY RESOLUTION
       ======================================================== */

    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            window.HalDoOSAppRegistry ||
            HalDo.appRegistry ||
            HalDoOS.appRegistry ||
            null
        );

    }


    /* ========================================================
       11 — REGISTRY APP COLLECTION
       ======================================================== */

    function getRegistryApps() {

        const registry =
            getRegistry();


        if (!registry) {

            return [];

        }


        try {

            if (
                hasMethod(
                    registry,
                    "getAll"
                )
            ) {

                const result =
                    registry.getAll();


                if (
                    Array.isArray(
                        result
                    )
                ) {

                    return result;

                }


                if (
                    isObject(
                        result
                    )
                ) {

                    return Object.values(
                        result
                    );

                }

            }


            if (
                hasMethod(
                    registry,
                    "list"
                )
            ) {

                const result =
                    registry.list();


                if (
                    Array.isArray(
                        result
                    )
                ) {

                    return result;

                }


                if (
                    isObject(
                        result
                    )
                ) {

                    return Object.values(
                        result
                    );

                }

            }


            if (
                Array.isArray(
                    registry.apps
                )
            ) {

                return registry.apps;

            }


            if (
                isObject(
                    registry.apps
                )
            ) {

                return Object.values(
                    registry.apps
                );

            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Registry"
            );

        }


        return [];

    }


    /* ========================================================
       12 — APP ID RESOLUTION
       ======================================================== */

    function resolveAppId(
        app
    ) {

        if (
            typeof app ===
            "string"
        ) {

            return normalizeId(
                app
            );

        }


        if (
            !isObject(
                app
            )
        ) {

            return "";

        }


        return normalizeId(
            app.id ||
            app.appId ||
            app.appID ||
            app.identifier ||
            app.name
        );

    }


    /* ========================================================
       13 — APP LOOKUP
       ======================================================== */

    function get(
        appId
    ) {

        const id =
            resolveAppId(
                appId
            );


        if (!id) {

            return null;

        }


        if (
            state.apps.has(
                id
            )
        ) {

            return state.apps.get(
                id
            );

        }


        const apps =
            getRegistryApps();


        for (
            const app
            of apps
        ) {

            const candidate =
                resolveAppId(
                    app
                );


            if (
                candidate ===
                id
            ) {

                state.apps.set(
                    id,
                    app
                );


                return app;

            }

        }


        return null;

    }


    /* ========================================================
       14 — APP EXISTS
       ======================================================== */

    function has(
        appId
    ) {

        return !!get(
            appId
        );

    }


    /* ========================================================
       15 — APP LIST
       ======================================================== */

    function list(
        options = {}
    ) {

        const result =
            [];


        const registryApps =
            getRegistryApps();


        const merged =
            new Map();


        state.apps.forEach(
            (
                app,
                id
            ) => {

                merged.set(
                    id,
                    app
                );

            }
        );


        registryApps.forEach(
            app => {

                const id =
                    resolveAppId(
                        app
                    );


                if (id) {

                    merged.set(
                        id,
                        app
                    );

                }

            }
        );


        merged.forEach(
            (
                app,
                id
            ) => {

                if (
                    options.enabledOnly ===
                    true &&
                    app.enabled ===
                    false
                ) {

                    return;

                }


                if (
                    options.category &&
                    app.category !==
                        options.category
                ) {

                    return;

                }


                result.push(
                    app
                );

            }
        );


        return result;

    }


    /* ========================================================
       16 — DEFAULT APP STATE
       ======================================================== */

    function createDefaultState(
        appId
    ) {

        return {

            appId:
                normalizeId(
                    appId
                ),

            initialized:
                false,

            mounted:
                false,

            running:
                false,

            open:
                false,

            visible:
                false,

            active:
                false,

            focused:
                false,

            minimized:
                false,

            maximized:
                false,

            suspended:
                false,

            loading:
                false,

            ready:
                false,

            lifecycle:
                "idle",

            status:
                "idle",

            route:
                null,

            windowId:
                null,

            error:
                null,

            errorCount:
                0,

            updatedAt:
                now()

        };

    }


    /* ========================================================
       17 — APP STATE ACCESS
       ======================================================== */

    function getAppState(
        appId
    ) {

        const id =
            resolveAppId(
                appId
            );


        if (!id) {

            return null;

        }


        if (
            !state.appState.has(
                id
            )
        ) {

            state.appState.set(
                id,
                createDefaultState(
                    id
                )
            );

        }


        return state.appState.get(
            id
        );

    }


    /* ========================================================
       18 — APP STATE UPDATE
       ======================================================== */

    function updateAppState(
        appId,
        changes = {}
    ) {

        const id =
            resolveAppId(
                appId
            );


        if (
            !id ||
            !isObject(
                changes
            )
        ) {

            return null;

        }


        const current =
            getAppState(
                id
            );


        Object.assign(
            current,
            changes
        );


        current.appId =
            id;


        current.updatedAt =
            now();


        state.updatedAt =
            now();


        emit(
            "app-state-changed",
            {
                appId:
                    id,

                state:
                    clone(
                        current
                    )
            }
        );


        return current;

    }


    /* ========================================================
       19 — APP STATE RESET
       ======================================================== */

    function resetAppState(
        appId
    ) {

        const id =
            resolveAppId(
                appId
            );


        if (!id) {

            return false;

        }


        const oldState =
            getAppState(
                id
            );


        const nextState =
            createDefaultState(
                id
            );


        nextState.errorCount =
            Number(
                oldState &&
                oldState.errorCount
            ) || 0;


        state.appState.set(
            id,
            nextState
        );


        emit(
            "app-state-reset",
            {
                appId:
                    id,

                state:
                    clone(
                        nextState
                    )
            }
        );


        return true;

    }


    /* ========================================================
       20 — APP METADATA
       ======================================================== */

    function getMetadata(
        appId
    ) {

        const id =
            resolveAppId(
                appId
            );


        if (!id) {

            return null;

        }


        if (
            !state.metadata.has(
                id
            )
        ) {

            state.metadata.set(
                id,
                {
                    appId:
                        id,

                    registeredAt:
                        now(),

                    updatedAt:
                        now()
                }
            );

        }


        return state.metadata.get(
            id
        );

    }


    /* ========================================================
       21 — SET APP METADATA
       ======================================================== */

    function setMetadata(
        appId,
        metadata = {}
    ) {

        const id =
            resolveAppId(
                appId
            );


        if (
            !id ||
            !isObject(
                metadata
            )
        ) {

            return null;

        }


        const current =
            getMetadata(
                id
            );


        const next = {

            ...current,

            ...clone(
                metadata
            ),

            appId:
                id,

            updatedAt:
                now()

        };


        state.metadata.set(
            id,
            next
        );


        emit(
            "app-metadata-changed",
            {
                appId:
                    id,

                metadata:
                    clone(
                        next
                    )
            }
        );


        return next;

    }


    /* ========================================================
       22 — REGISTER APP
       ======================================================== */

    function register(
        app
    ) {

        if (
            !isObject(
                app
            )
        ) {

            throw new TypeError(
                "App-Definition muss ein Objekt sein."
            );

        }


        const id =
            resolveAppId(
                app
            );


        if (!id) {

            throw new Error(
                "App benötigt eine gültige ID."
            );

        }


        const existing =
            state.apps.get(
                id
            );


        let definition;


        if (
            existing &&
            isObject(
                existing
            )
        ) {

            definition = {

                ...existing,

                ...app,

                id:
                    app.id ||
                    existing.id ||
                    id

            };

        } else {

            definition = {

                ...app,

                id:
                    app.id ||
                    id

            };

        }


        state.apps.set(
            id,
            definition
        );


        if (
            !state.appState.has(
                id
            )
        ) {

            state.appState.set(
                id,
                createDefaultState(
                    id
                )
            );

        }


        setMetadata(
            id,
            {
                registered:
                    true,

                registeredAt:
                    getMetadata(
                        id
                    )?.registeredAt ||
                    now()
            }
        );


        state.updatedAt =
            now();


        emit(
            "app-registered",
            {
                appId:
                    id,

                app:
                    clone(
                        definition
                    )
            }
        );


        dispatch(
            "haldo:app:registered",
            {
                appId:
                    id
            }
        );


        return definition;

    }


    /* ========================================================
       23 — END TEIL 1
       ======================================================== */

    /*
     * KEIN IIFE-ABSCHLUSS HIER.
     *
     * TEIL 2 wird direkt unter diesem Abschnitt eingefügt.
     * Der endgültige Abschluss der Datei erfolgt erst in TEIL 16.
     */
/* ============================================================
   HALDO AI OS 18
   js/app-manager.js
   MASTER REPAIR — TEIL 2 / 16
   ============================================================ */


/* ============================================================
   24 — UNREGISTER APP
   ============================================================ */

function unregister(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (
        instance &&
        options.destroy !== false
    ) {

        try {

            /*
             * Destroy wird weiter unten definiert.
             * Der Aufruf erfolgt zur Laufzeit und ist
             * deshalb auch bei späterer Definition gültig.
             */

            if (
                isFunction(
                    destroy
                )
            ) {

                /*
                 * Nicht awaiten:
                 * unregister bleibt synchron.
                 * Die eigentliche Entfernung erfolgt
                 * unmittelbar danach.
                 */

                Promise.resolve(
                    destroy(
                        id,
                        {
                            preserveState:
                                options.preserveState === true
                        }
                    )
                ).catch(
                    exception => {

                        reportError(
                            exception,
                            "Unregister Destroy"
                        );

                    }
                );

            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Unregister Destroy"
            );

        }

    }


    const removed =
        state.apps.delete(
            id
        );


    if (
        options.preserveState !==
        true
    ) {

        state.appState.delete(
            id
        );

        state.metadata.delete(
            id
        );

    }


    if (
        state.activeAppId ===
        id
    ) {

        state.activeAppId =
            null;

    }


    state.updatedAt =
        now();


    if (
        removed
    ) {

        emit(
            "app-unregistered",
            {
                appId:
                    id
            }
        );


        dispatch(
            "haldo:app:unregistered",
            {
                appId:
                    id
            }
        );

    }


    return removed;

}


/* ============================================================
   25 — REGISTRATION FROM EXISTING REGISTRY
   ============================================================ */

function registerExisting(
    app
) {

    try {

        return register(
            app
        );

    } catch (
        exception
    ) {

        reportError(
            exception,
            "Register Existing App"
        );


        return null;

    }

}


/* ============================================================
   26 — REGISTER ALL REGISTRY APPS
   ============================================================ */

function registerAll(
    options = {}
) {

    const apps =
        getRegistryApps();


    const results =
        [];


    for (
        const app
        of apps
    ) {

        if (!app) {
            continue;
        }


        try {

            const definition =
                register(
                    app
                );


            results.push(
                {
                    appId:
                        resolveAppId(
                            definition
                        ),

                    success:
                        true
                }
            );

        } catch (
            exception
        ) {

            const appId =
                resolveAppId(
                    app
                );


            results.push(
                {
                    appId,

                    success:
                        false,

                    error:
                        exception instanceof Error
                            ? exception.message
                            : safeString(
                                exception
                            )
                }
            );


            reportError(
                exception,
                "Register All"
            );

        }

    }


    if (
        options.emit !== false
    ) {

        emit(
            "apps-registered",
            {
                count:
                    results.filter(
                        item =>
                            item.success
                    ).length,

                results
            }
        );

    }


    return results;

}


/* ============================================================
   27 — SERVICE RESOLUTION
   ============================================================ */

function getRuntime() {

    return (
        window.HalDoAppRuntime ||
        window.HalDoOSAppRuntime ||
        HalDo.appRuntime ||
        HalDoOS.appRuntime ||
        null
    );

}


function getRouter() {

    return (
        window.HalDoAppRouter ||
        window.HalDoOSAppRouter ||
        HalDo.appRouter ||
        HalDoOS.appRouter ||
        null
    );

}


function getWindowManager() {

    return (
        window.HalDoWindowManager ||
        window.HalDoOSWindowManager ||
        HalDo.windowManager ||
        HalDoOS.windowManager ||
        null
    );

}


function getKernel() {

    return (
        window.HalDoKernel ||
        window.HalDoOSKernel ||
        HalDo.kernel ||
        HalDoOS.kernel ||
        null
    );

}


function getSystem() {

    return (
        window.HalDoSystem ||
        window.HalDoOSSystem ||
        HalDo.system ||
        HalDoOS.system ||
        null
    );

}


function getStorage() {

    return (
        window.HalDoStorage ||
        window.HalDoOSStorage ||
        HalDo.storage ||
        HalDoOS.storage ||
        null
    );

}


function getAI() {

    return (
        window.HalDoAI ||
        window.HalDoOSAI ||
        HalDo.ai ||
        HalDoOS.ai ||
        window.HalDoAICore ||
        window.HalDoOSAICore ||
        null
    );

}


function getVoice() {

    return (
        window.HalDoVoice ||
        window.HalDoOSVoice ||
        HalDo.voice ||
        HalDoOS.voice ||
        window.HalDoVoiceCore ||
        window.HalDoOSVoiceCore ||
        null
    );

}


/* ============================================================
   28 — GENERIC SERVICE CALL
   ============================================================ */

async function callService(
    service,
    method,
    args = []
) {

    if (
        !service ||
        !isFunction(
            service[
                method
            ]
        )
    ) {

        return undefined;

    }


    const parameters =
        Array.isArray(
            args
        )
            ? args
            : [args];


    try {

        return await service[
            method
        ](
            ...parameters
        );

    } catch (
        exception
    ) {

        reportError(
            exception,
            "Service " +
            method
        );


        throw exception;

    }

}


/* ============================================================
   29 — SAFE SERVICE CALL
   ============================================================ */

async function safeServiceCall(
    service,
    method,
    args = [],
    fallback = undefined
) {

    try {

        const result =
            await callService(
                service,
                method,
                args
            );


        return result ===
            undefined
            ? fallback
            : result;

    } catch (
        exception
    ) {

        reportError(
            exception,
            "Safe Service " +
            method
        );


        return fallback;

    }

}


/* ============================================================
   30 — INSTANCE ID
   ============================================================ */

function createInstanceId(
    appId
) {

    state.sequence +=
        1;


    return (
        normalizeId(
            appId
        ) +
        ":" +
        state.sequence +
        ":" +
        now()
    );

}


/* ============================================================
   31 — INSTANCE STATE
   ============================================================ */

function createInstanceState(
    appId,
    instanceId
) {

    return {

        id:
            instanceId,

        appId:
            normalizeId(
                appId
            ),

        initialized:
            false,

        mounted:
            false,

        running:
            false,

        open:
            false,

        visible:
            false,

        active:
            false,

        focused:
            false,

        minimized:
            false,

        maximized:
            false,

        suspended:
            false,

        loading:
            false,

        ready:
            false,

        lifecycle:
            "created",

        status:
            "created",

        route:
            null,

        windowId:
            null,

        root:
            null,

        element:
            null,

        createdAt:
            now(),

        updatedAt:
            now(),

        error:
            null,

        errorCount:
            0

    };

}


/* ============================================================
   32 — INSTANCE CONTEXT
   ============================================================ */

function createContext(
    app,
    instance
) {

    const appId =
        resolveAppId(
            app
        );


    const context = {

        appId,

        instanceId:
            instance.id,

        manager:
            api,

        runtime:
            getRuntime(),

        router:
            getRouter(),

        windowManager:
            getWindowManager(),

        kernel:
            getKernel(),

        system:
            getSystem(),

        storage:
            getStorage(),

        ai:
            getAI(),

        voice:
            getVoice(),

        app,

        instance,

        state:
            instance.state,


        getState() {

            return getAppState(
                appId
            );

        },


        setState(
            changes = {}
        ) {

            return updateAppState(
                appId,
                changes
            );

        },


        getMetadata() {

            return getMetadata(
                appId
            );

        },


        setMetadata(
            metadata = {}
        ) {

            return setMetadata(
                appId,
                metadata
            );

        },


        emit(
            eventName,
            detail = {}
        ) {

            return emit(
                "app:" +
                appId +
                ":" +
                safeString(
                    eventName
                ),
                {
                    appId,

                    instanceId:
                        instance.id,

                    ...(
                        isObject(
                            detail
                        )
                            ? detail
                            : {
                                value:
                                    detail
                            }
                    )
                }
            );

        },


        dispatch(
            eventName,
            detail = {}
        ) {

            return dispatch(
                eventName,
                {
                    appId,

                    instanceId:
                        instance.id,

                    ...(
                        isObject(
                            detail
                        )
                            ? detail
                            : {
                                value:
                                    detail
                            }
                    )
                }
            );

        },


        async call(
            service,
            method,
            args = []
        ) {

            let target =
                service;


            if (
                typeof service ===
                "string"
            ) {

                const services = {

                    runtime:
                        getRuntime(),

                    router:
                        getRouter(),

                    windowManager:
                        getWindowManager(),

                    kernel:
                        getKernel(),

                    system:
                        getSystem(),

                    storage:
                        getStorage(),

                    ai:
                        getAI(),

                    voice:
                        getVoice()

                };


                target =
                    services[
                        service
                    ] || null;

            }


            return callService(
                target,
                method,
                args
            );

        }

    };


    return context;

}


/* ============================================================
   33 — GET INSTANCE
   ============================================================ */

function getInstance(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    return (
        state.instances.get(
            id
        ) ||
        null
    );

}


/* ============================================================
   34 — ENSURE INSTANCE
   ============================================================ */

function ensureInstance(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        throw new Error(
            "Ungültige App-ID."
        );

    }


    const existing =
        getInstance(
            id
        );


    if (
        existing
    ) {

        return existing;

    }


    const app =
        get(
            id
        );


    if (!app) {

        throw new Error(
            "App nicht registriert: " +
            id
        );

    }


    const instanceId =
        createInstanceId(
            id
        );


    const instanceState =
        createInstanceState(
            id,
            instanceId
        );


    const instance = {

        id:
            instanceId,

        appId:
            id,

        app,

        state:
            instanceState,

        context:
            null,

        root:
            null,

        element:
            null,

        window:
            null,

        createdAt:
            now(),

        updatedAt:
            now()

    };


    instance.context =
        createContext(
            app,
            instance
        );


    state.instances.set(
        id,
        instance
    );


    state.contexts.set(
        id,
        instance.context
    );


    emit(
        "app-instance-created",
        {
            appId:
                id,

            instanceId:
                instance.id
        }
    );


    return instance;

}


/* ============================================================
   35 — GET INSTANCE CONTEXT
   ============================================================ */

function getContext(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    if (
        state.contexts.has(
            id
        )
    ) {

        return state.contexts.get(
            id
        );

    }


    const instance =
        getInstance(
            id
        );


    if (
        instance
    ) {

        return instance.context;

    }


    return null;

}


/* ============================================================
   36 — SET INSTANCE STATE
   ============================================================ */

function setInstanceState(
    instance,
    changes = {}
) {

    if (
        !instance ||
        !isObject(
            changes
        )
    ) {

        return null;

    }


    Object.assign(
        instance.state,
        changes
    );


    instance.state.updatedAt =
        now();


    instance.updatedAt =
        now();


    state.updatedAt =
        now();


    emit(
        "app-instance-state-changed",
        {
            appId:
                instance.appId,

            instanceId:
                instance.id,

            state:
                clone(
                    instance.state
                )
        }
    );


    return instance.state;

}


/* ============================================================
   37 — INSTANCE ERROR
   ============================================================ */

function setInstanceError(
    instance,
    exception,
    status =
        "error"
) {

    if (!instance) {

        return null;

    }


    const error =
        exception instanceof Error
            ? exception
            : new Error(
                safeString(
                    exception
                )
            );


    const currentCount =
        Number(
            instance.state.errorCount
        ) || 0;


    setInstanceState(
        instance,
        {

            error: {

                name:
                    error.name,

                message:
                    error.message,

                stack:
                    error.stack ||
                    null,

                timestamp:
                    now()

            },

            errorCount:
                currentCount + 1,

            status,

            lifecycle:
                status,

            ready:
                false

        }
    );


    reportError(
        error,
        "App " +
        instance.appId
    );


    emit(
        "app-error",
        {
            appId:
                instance.appId,

            instanceId:
                instance.id,

            error:
                clone(
                    instance.state.error
                )
        }
    );


    return instance.state.error;

}


/* ============================================================
   38 — CLEAR INSTANCE ERROR
   ============================================================ */

function clearInstanceError(
    appId
) {

    const instance =
        getInstance(
            appId
        );


    if (!instance) {

        return false;

    }


    setInstanceState(
        instance,
        {

            error:
                null,

            status:
                instance.state.running
                    ? "running"
                    : "ready"

        }
    );


    return true;

}


/* ============================================================
   39 — APP HOOK RESOLUTION
   ============================================================ */

function resolveAppHook(
    app,
    hook
) {

    if (
        !app ||
        !hook
    ) {

        return null;

    }


    if (
        app.hooks &&
        isFunction(
            app.hooks[
                hook
            ]
        )
    ) {

        return app.hooks[
            hook
        ];

    }


    if (
        isFunction(
            app[
                hook
            ]
        )
    ) {

        return app[
            hook
        ];

    }


    if (
        app.lifecycle &&
        isFunction(
            app.lifecycle[
                hook
            ]
        )
    ) {

        return app.lifecycle[
            hook
        ];

    }


    return null;

}


/* ============================================================
   40 — CALL APP HOOK
   ============================================================ */

async function callAppHook(
    instance,
    hook,
    payload = {}
) {

    if (
        !instance ||
        !instance.app
    ) {

        return undefined;

    }


    const handler =
        resolveAppHook(
            instance.app,
            hook
        );


    if (!handler) {

        return undefined;

    }


    try {

        return await handler.call(
            instance.app,
            payload,
            instance.context,
            instance
        );

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            hook +
            "-error"
        );


        throw exception;

    }

}


/* ============================================================
   41 — END TEIL 2
   ============================================================ */
/* ============================================================
   HALDO AI OS 18
   js/app-manager.js
   MASTER REPAIR — TEIL 3 / 16
   ============================================================ */


/* ============================================================
   42 — CREATE APP INSTANCE
   ============================================================ */

async function create(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        throw new Error(
            "App-ID fehlt."
        );

    }


    const app =
        get(
            id
        );


    if (!app) {

        throw new Error(
            "App nicht registriert: " +
            id
        );

    }


    const existing =
        getInstance(
            id
        );


    if (
        existing &&
        options.recreate !== true
    ) {

        return existing;

    }


    if (
        existing &&
        options.recreate === true
    ) {

        await destroy(
            id,
            {
                preserveState:
                    options.preserveState === true
            }
        );

    }


    const instance =
        ensureInstance(
            id
        );


    setInstanceState(
        instance,
        {

            loading:
                true,

            lifecycle:
                "initializing",

            status:
                "initializing",

            error:
                null

        }
    );


    try {

        await callAppHook(
            instance,
            "beforeInitialize",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "initialize",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        setInstanceState(
            instance,
            {

                initialized:
                    true,

                loading:
                    false,

                ready:
                    true,

                lifecycle:
                    "initialized",

                status:
                    "ready",

                error:
                    null

            }
        );


        await callAppHook(
            instance,
            "afterInitialize",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-created",
            {
                appId:
                    id,

                instanceId:
                    instance.id,

                options:
                    clone(
                        options
                    )
            }
        );


        dispatch(
            "haldo:app:created",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return instance;

    } catch (
        exception
    ) {

        setInstanceState(
            instance,
            {
                loading:
                    false,

                ready:
                    false
            }
        );


        setInstanceError(
            instance,
            exception,
            "initialize-error"
        );


        throw exception;

    }

}


/* ============================================================
   43 — START APP
   ============================================================ */

async function start(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        throw new Error(
            "App-ID fehlt."
        );

    }


    let instance =
        getInstance(
            id
        );


    if (!instance) {

        instance =
            await create(
                id,
                options
            );

    }


    if (
        instance.state.running
    ) {

        return instance;

    }


    setInstanceState(
        instance,
        {

            loading:
                true,

            lifecycle:
                "starting",

            status:
                "starting",

            error:
                null

        }
    );


    try {

        await callAppHook(
            instance,
            "beforeStart",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "start",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        setInstanceState(
            instance,
            {

                running:
                    true,

                loading:
                    false,

                ready:
                    true,

                lifecycle:
                    "running",

                status:
                    "running"

            }
        );


        await callAppHook(
            instance,
            "afterStart",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-started",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        dispatch(
            "haldo:app:started",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return instance;

    } catch (
        exception
    ) {

        setInstanceState(
            instance,
            {
                loading:
                    false,

                running:
                    false,

                ready:
                    false
            }
        );


        setInstanceError(
            instance,
            exception,
            "start-error"
        );


        throw exception;

    }

}


/* ============================================================
   44 — MOUNT TARGET RESOLUTION
   ============================================================ */

function resolveMountTarget(
    target
) {

    if (
        isElement(
            target
        )
    ) {

        return target;

    }


    if (
        target &&
        target.nodeType ===
            11
    ) {

        return target;

    }


    if (
        typeof target ===
        "string"
    ) {

        const selector =
            target.trim();


        if (!selector) {

            return null;

        }


        try {

            return document.querySelector(
                selector
            );

        } catch (
            _
        ) {

            return null;

        }

    }


    if (
        target &&
        typeof target ===
            "object"
    ) {

        if (
            isElement(
                target.element
            )
        ) {

            return target.element;

        }


        if (
            isElement(
                target.root
            )
        ) {

            return target.root;

        }


        if (
            isElement(
                target.container
            )
        ) {

            return target.container;

        }

    }


    return null;

}


/* ============================================================
   45 — CREATE APP ROOT ELEMENT
   ============================================================ */

function createAppRoot(
    app,
    instance
) {

    const tag =
        safeString(
            app.rootTag ||
            app.elementTag ||
            "section"
        )
            .trim()
            .toLowerCase();


    let element;


    try {

        element =
            document.createElement(
                tag || "section"
            );

    } catch (
        _
    ) {

        element =
            document.createElement(
                "section"
            );

    }


    const appId =
        resolveAppId(
            app
        );


    element.dataset.haldoApp =
        appId;


    element.dataset.haldoInstance =
        instance.id;


    element.classList.add(
        "haldo-app-instance"
    );


    element.classList.add(
        "haldo-app-" +
        appId
    );


    if (
        app.className
    ) {

        try {

            element.classList.add(
                ...safeString(
                    app.className
                )
                    .split(
                        /\s+/
                    )
                    .filter(
                        Boolean
                    )
            );

        } catch (
            _
        ) {}

    }


    if (
        app.attributes &&
        isObject(
            app.attributes
        )
    ) {

        Object.entries(
            app.attributes
        ).forEach(
            (
                [
                    name,
                    value
                ]
            ) => {

                try {

                    element.setAttribute(
                        name,
                        safeString(
                            value
                        )
                    );

                } catch (
                    _
                ) {}

            }
        );

    }


    return element;

}


/* ============================================================
   46 — MOUNT APP
   ============================================================ */

async function mount(
    appId,
    target = null,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        throw new Error(
            "App-ID fehlt."
        );

    }


    const instance =
        getInstance(
            id
        ) ||
        await create(
            id,
            options
        );


    if (
        instance.state.mounted &&
        instance.element
    ) {

        return instance;

    }


    const app =
        instance.app;


    const mountTarget =
        resolveMountTarget(
            target
        ) ||
        resolveMountTarget(
            options.target
        ) ||
        resolveMountTarget(
            app.mountTarget
        ) ||
        resolveMountTarget(
            app.target
        );


    setInstanceState(
        instance,
        {

            loading:
                true,

            lifecycle:
                "mounting",

            status:
                "mounting"

        }
    );


    try {

        const element =
            createAppRoot(
                app,
                instance
            );


        instance.element =
            element;


        instance.root =
            element;


        if (
            mountTarget
        ) {

            mountTarget.appendChild(
                element
            );

        }


        await callAppHook(
            instance,
            "beforeMount",
            {
                target:
                    mountTarget,

                element,

                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "mount",
            {
                target:
                    mountTarget,

                element,

                options:
                    clone(
                        options
                    )
            }
        );


        setInstanceState(
            instance,
            {

                mounted:
                    true,

                loading:
                    false,

                lifecycle:
                    "mounted",

                status:
                    "mounted",

                root:
                    element

            }
        );


        await callAppHook(
            instance,
            "afterMount",
            {
                target:
                    mountTarget,

                element,

                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-mounted",
            {
                appId:
                    id,

                instanceId:
                    instance.id,

                target:
                    mountTarget,

                element
            }
        );


        dispatch(
            "haldo:app:mounted",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return instance;

    } catch (
        exception
    ) {

        setInstanceState(
            instance,
            {
                loading:
                    false,

                mounted:
                    false
            }
        );


        setInstanceError(
            instance,
            exception,
            "mount-error"
        );


        throw exception;

    }

}


/* ============================================================
   47 — UNMOUNT APP
   ============================================================ */

async function unmount(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    if (
        !instance.state.mounted
    ) {

        return true;

    }


    const element =
        instance.element;


    try {

        await callAppHook(
            instance,
            "beforeUnmount",
            {
                element,

                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "unmount",
            {
                element,

                options:
                    clone(
                        options
                    )
            }
        );


        if (
            element &&
            element.parentNode
        ) {

            element.parentNode.removeChild(
                element
            );

        }


        await callAppHook(
            instance,
            "afterUnmount",
            {
                element,

                options:
                    clone(
                        options
                    )
            }
        );


        instance.element =
            null;


        instance.root =
            null;


        setInstanceState(
            instance,
            {

                mounted:
                    false,

                visible:
                    false,

                active:
                    false,

                focused:
                    false,

                windowId:
                    null,

                lifecycle:
                    "unmounted",

                status:
                    "unmounted"

            }
        );


        emit(
            "app-unmounted",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "unmount-error"
        );


        throw exception;

    }

}


/* ============================================================
   48 — OPEN APP
   ============================================================ */

async function open(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        throw new Error(
            "App-ID fehlt."
        );

    }


    let instance =
        getInstance(
            id
        );


    if (!instance) {

        instance =
            await create(
                id,
                options
            );

    }


    if (
        options.start !== false &&
        !instance.state.running
    ) {

        await start(
            id,
            options
        );

    }


    if (
        options.mount !== false &&
        !instance.state.mounted
    ) {

        await mount(
            id,
            options.target ||
            null,
            options
        );

    }


    setInstanceState(
        instance,
        {

            open:
                true,

            visible:
                true,

            minimized:
                false,

            lifecycle:
                "open",

            status:
                "open"

        }
    );


    try {

        await callAppHook(
            instance,
            "beforeOpen",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "open",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        if (
            instance.element
        ) {

            instance.element.hidden =
                false;

            instance.element.style.display =
                "";

        }


        await callAppHook(
            instance,
            "afterOpen",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-opened",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        dispatch(
            "haldo:app:opened",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return instance;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "open-error"
        );


        throw exception;

    }

}


/* ============================================================
   49 — END TEIL 3
   ============================================================ */
/* ============================================================
   HALDO AI OS 18
   js/app-manager.js
   MASTER REPAIR — TEIL 4 / 16
   ============================================================ */


/* ============================================================
   50 — CLOSE APP
   ============================================================ */

async function close(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    try {

        await callAppHook(
            instance,
            "beforeClose",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "close",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        if (
            instance.element
        ) {

            instance.element.hidden =
                true;

            instance.element.style.display =
                "none";

        }


        setInstanceState(
            instance,
            {

                open:
                    false,

                visible:
                    false,

                active:
                    false,

                focused:
                    false,

                minimized:
                    false,

                lifecycle:
                    "closed",

                status:
                    "closed"

            }
        );


        if (
            state.activeAppId ===
            id
        ) {

            state.activeAppId =
                null;

        }


        await callAppHook(
            instance,
            "afterClose",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-closed",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        dispatch(
            "haldo:app:closed",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "close-error"
        );


        throw exception;

    }

}


/* ============================================================
   51 — ACTIVATE APP
   ============================================================ */

async function activate(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        throw new Error(
            "App-ID fehlt."
        );

    }


    const instance =
        getInstance(
            id
        ) ||
        await open(
            id,
            options
        );


    const previousId =
        state.activeAppId;


    if (
        previousId &&
        previousId !== id
    ) {

        const previous =
            getInstance(
                previousId
            );


        if (
            previous
        ) {

            setInstanceState(
                previous,
                {

                    active:
                        false,

                    focused:
                        false

                }
            );


            try {

                await callAppHook(
                    previous,
                    "deactivate",
                    {
                        reason:
                            "switch"
                    }
                );

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "Deactivate Previous App"
                );

            }

        }

    }


    try {

        await callAppHook(
            instance,
            "beforeActivate",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "activate",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        state.activeAppId =
            id;


        setInstanceState(
            instance,
            {

                active:
                    true,

                focused:
                    true,

                visible:
                    true,

                open:
                    true,

                minimized:
                    false,

                lifecycle:
                    "active",

                status:
                    "active"

            }
        );


        if (
            instance.element
        ) {

            instance.element.hidden =
                false;

            instance.element.style.display =
                "";

        }


        await callAppHook(
            instance,
            "afterActivate",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-activated",
            {
                appId:
                    id,

                instanceId:
                    instance.id,

                previousAppId:
                    previousId ||
                    null
            }
        );


        dispatch(
            "haldo:app:activated",
            {
                appId:
                    id,

                instanceId:
                    instance.id,

                previousAppId:
                    previousId ||
                    null
            }
        );


        return instance;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "activate-error"
        );


        throw exception;

    }

}


/* ============================================================
   52 — DEACTIVATE APP
   ============================================================ */

async function deactivate(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    try {

        await callAppHook(
            instance,
            "beforeDeactivate",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "deactivate",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        setInstanceState(
            instance,
            {

                active:
                    false,

                focused:
                    false,

                lifecycle:
                    "inactive",

                status:
                    instance.state.open
                        ? "open"
                        : "inactive"

            }
        );


        if (
            state.activeAppId ===
            id
        ) {

            state.activeAppId =
                null;

        }


        await callAppHook(
            instance,
            "afterDeactivate",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-deactivated",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "deactivate-error"
        );


        throw exception;

    }

}


/* ============================================================
   53 — FOCUS APP
   ============================================================ */

async function focus(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    try {

        if (
            !instance.state.open
        ) {

            await open(
                id,
                options
            );

        }


        await callAppHook(
            instance,
            "beforeFocus",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "focus",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        setInstanceState(
            instance,
            {

                focused:
                    true,

                visible:
                    true,

                active:
                    true,

                minimized:
                    false,

                lifecycle:
                    "focused",

                status:
                    "focused"

            }
        );


        state.activeAppId =
            id;


        if (
            instance.element &&
            isFunction(
                instance.element.focus
            )
        ) {

            try {

                instance.element.focus();

            } catch (
                _
            ) {}

        }


        await callAppHook(
            instance,
            "afterFocus",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-focused",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "focus-error"
        );


        throw exception;

    }

}


/* ============================================================
   54 — BLUR APP
   ============================================================ */

async function blur(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    try {

        await callAppHook(
            instance,
            "beforeBlur",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "blur",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        setInstanceState(
            instance,
            {

                focused:
                    false,

                lifecycle:
                    "blurred",

                status:
                    "blurred"

            }
        );


        await callAppHook(
            instance,
            "afterBlur",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-blurred",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "blur-error"
        );


        throw exception;

    }

}


/* ============================================================
   55 — MINIMIZE APP
   ============================================================ */

async function minimize(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    try {

        await callAppHook(
            instance,
            "beforeMinimize",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "minimize",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        if (
            instance.element
        ) {

            instance.element.hidden =
                true;

            instance.element.style.display =
                "none";

        }


        setInstanceState(
            instance,
            {

                minimized:
                    true,

                maximized:
                    false,

                visible:
                    false,

                active:
                    false,

                focused:
                    false,

                lifecycle:
                    "minimized",

                status:
                    "minimized"

            }
        );


        if (
            state.activeAppId ===
            id
        ) {

            state.activeAppId =
                null;

        }


        await callAppHook(
            instance,
            "afterMinimize",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-minimized",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        dispatch(
            "haldo:app:minimized",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "minimize-error"
        );


        throw exception;

    }

}


/* ============================================================
   56 — RESTORE APP
   ============================================================ */

async function restore(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    try {

        await callAppHook(
            instance,
            "beforeRestore",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "restore",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        if (
            instance.element
        ) {

            instance.element.hidden =
                false;

            instance.element.style.display =
                "";

        }


        setInstanceState(
            instance,
            {

                minimized:
                    false,

                visible:
                    true,

                open:
                    true,

                lifecycle:
                    "restored",

                status:
                    "restored"

            }
        );


        await callAppHook(
            instance,
            "afterRestore",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-restored",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        dispatch(
            "haldo:app:restored",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "restore-error"
        );


        throw exception;

    }

}


/* ============================================================
   57 — MAXIMIZE APP
   ============================================================ */

async function maximize(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    try {

        await callAppHook(
            instance,
            "beforeMaximize",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "maximize",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        if (
            instance.element
        ) {

            instance.element.classList.add(
                "haldo-app-maximized"
            );

        }


        setInstanceState(
            instance,
            {

                maximized:
                    true,

                minimized:
                    false,

                visible:
                    true,

                open:
                    true,

                lifecycle:
                    "maximized",

                status:
                    "maximized"

            }
        );


        await callAppHook(
            instance,
            "afterMaximize",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-maximized",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        dispatch(
            "haldo:app:maximized",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "maximize-error"
        );


        throw exception;

    }

}


/* ============================================================
   58 — RESTORE FROM MAXIMIZED
   ============================================================ */

async function unmaximize(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    try {

        await callAppHook(
            instance,
            "beforeUnmaximize",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "unmaximize",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        if (
            instance.element
        ) {

            instance.element.classList.remove(
                "haldo-app-maximized"
            );

        }


        setInstanceState(
            instance,
            {

                maximized:
                    false,

                visible:
                    true,

                open:
                    true,

                lifecycle:
                    "restored",

                status:
                    "restored"

            }
        );


        await callAppHook(
            instance,
            "afterUnmaximize",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-unmaximized",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "unmaximize-error"
        );


        throw exception;

    }

}


/* ============================================================
   59 — END TEIL 4
   ============================================================ */
/* ============================================================
   HALDO AI OS 18
   js/app-manager.js
   MASTER REPAIR — TEIL 5 / 16
   ============================================================ */


/* ============================================================
   60 — SUSPEND APP
   ============================================================ */

async function suspend(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    if (
        instance.state.suspended
    ) {

        return true;

    }


    try {

        await callAppHook(
            instance,
            "beforeSuspend",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "suspend",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        setInstanceState(
            instance,
            {

                suspended:
                    true,

                lifecycle:
                    "suspended",

                status:
                    "suspended"

            }
        );


        await callAppHook(
            instance,
            "afterSuspend",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-suspended",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        dispatch(
            "haldo:app:suspended",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "suspend-error"
        );


        throw exception;

    }

}


/* ============================================================
   61 — RESUME APP
   ============================================================ */

async function resume(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    if (
        !instance.state.suspended
    ) {

        return true;

    }


    try {

        await callAppHook(
            instance,
            "beforeResume",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "resume",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        setInstanceState(
            instance,
            {

                suspended:
                    false,

                lifecycle:
                    instance.state.running
                        ? "running"
                        : "ready",

                status:
                    instance.state.running
                        ? "running"
                        : "ready"

            }
        );


        await callAppHook(
            instance,
            "afterResume",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-resumed",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        dispatch(
            "haldo:app:resumed",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "resume-error"
        );


        throw exception;

    }

}


/* ============================================================
   62 — RESTART APP
   ============================================================ */

async function restart(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        throw new Error(
            "App-ID fehlt."
        );

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return open(
            id,
            options
        );

    }


    try {

        await callAppHook(
            instance,
            "beforeRestart",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        const wasOpen =
            instance.state.open;


        const wasMounted =
            instance.state.mounted;


        if (
            instance.state.running
        ) {

            await stop(
                id,
                {
                    preserveInstance:
                        true
                }
            );

        }


        if (
            wasMounted
        ) {

            await unmount(
                id,
                {
                    preserveInstance:
                        true
                }
            );

        }


        resetInstanceRuntimeState(
            instance
        );


        if (
            options.reopen !== false &&
            wasOpen
        ) {

            await open(
                id,
                options
            );

        } else {

            await create(
                id,
                {
                    recreate:
                        false
                }
            );

        }


        await callAppHook(
            instance,
            "afterRestart",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-restarted",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        dispatch(
            "haldo:app:restarted",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return instance;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "restart-error"
        );


        throw exception;

    }

}


/* ============================================================
   63 — RESET INSTANCE RUNTIME STATE
   ============================================================ */

function resetInstanceRuntimeState(
    instance
) {

    if (!instance) {

        return null;

    }


    setInstanceState(
        instance,
        {

            initialized:
                false,

            mounted:
                false,

            running:
                false,

            open:
                false,

            visible:
                false,

            active:
                false,

            focused:
                false,

            minimized:
                false,

            maximized:
                false,

            suspended:
                false,

            loading:
                false,

            ready:
                false,

            lifecycle:
                "reset",

            status:
                "reset",

            route:
                null,

            windowId:
                null,

            error:
                null

        }
    );


    return instance;

}


/* ============================================================
   64 — STOP APP
   ============================================================ */

async function stop(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    if (
        !instance.state.running
    ) {

        return true;

    }


    try {

        await callAppHook(
            instance,
            "beforeStop",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "stop",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        setInstanceState(
            instance,
            {

                running:
                    false,

                loading:
                    false,

                active:
                    false,

                focused:
                    false,

                lifecycle:
                    "stopped",

                status:
                    "stopped"

            }
        );


        if (
            state.activeAppId ===
            id
        ) {

            state.activeAppId =
                null;

        }


        await callAppHook(
            instance,
            "afterStop",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-stopped",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        dispatch(
            "haldo:app:stopped",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "stop-error"
        );


        throw exception;

    }

}


/* ============================================================
   65 — DESTROY APP INSTANCE
   ============================================================ */

async function destroy(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    try {

        await callAppHook(
            instance,
            "beforeDestroy",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        if (
            instance.state.open
        ) {

            await close(
                id,
                {
                    ...options,

                    silent:
                        true
                }
            );

        }


        if (
            instance.state.running
        ) {

            await stop(
                id,
                {
                    ...options,

                    preserveInstance:
                        true
                }
            );

        }


        if (
            instance.state.mounted
        ) {

            await unmount(
                id,
                {
                    ...options,

                    preserveInstance:
                        true
                }
            );

        }


        await callAppHook(
            instance,
            "destroy",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        await callAppHook(
            instance,
            "afterDestroy",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        state.instances.delete(
            id
        );


        state.contexts.delete(
            id
        );


        if (
            state.activeAppId ===
            id
        ) {

            state.activeAppId =
                null;

        }


        if (
            options.preserveState !==
            true
        ) {

            state.appState.delete(
                id
            );

        }


        state.updatedAt =
            now();


        emit(
            "app-destroyed",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        dispatch(
            "haldo:app:destroyed",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return true;

    } catch (
        exception
    ) {

        reportError(
            exception,
            "Destroy App"
        );


        throw exception;

    }

}


/* ============================================================
   66 — RELOAD APP
   ============================================================ */

async function reload(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        throw new Error(
            "App-ID fehlt."
        );

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return open(
            id,
            options
        );

    }


    const wasOpen =
        instance.state.open;


    const wasActive =
        instance.state.active;


    try {

        await callAppHook(
            instance,
            "beforeReload",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        if (
            instance.state.running
        ) {

            await stop(
                id,
                {
                    preserveInstance:
                        true
                }
            );

        }


        await callAppHook(
            instance,
            "reload",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        setInstanceState(
            instance,
            {

                loading:
                    false,

                ready:
                    true,

                status:
                    "reloaded",

                lifecycle:
                    "reloaded"

            }
        );


        if (
            wasOpen
        ) {

            await open(
                id,
                options
            );

        }


        if (
            wasActive
        ) {

            await activate(
                id,
                options
            );

        }


        await callAppHook(
            instance,
            "afterReload",
            {
                options:
                    clone(
                        options
                    )
            }
        );


        emit(
            "app-reloaded",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        dispatch(
            "haldo:app:reloaded",
            {
                appId:
                    id,

                instanceId:
                    instance.id
            }
        );


        return instance;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "reload-error"
        );


        throw exception;

    }

}


/* ============================================================
   67 — END TEIL 5
   ============================================================ */
/* ============================================================
   HALDO AI OS 18
   js/app-manager.js
   MASTER REPAIR — TEIL 6 / 16
   ============================================================ */


/* ============================================================
   68 — SET APP WINDOW
   ============================================================ */

function setWindow(
    appId,
    windowId,
    windowObject = null
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    instance.window =
        windowObject;


    setInstanceState(
        instance,
        {

            windowId:
                windowId ||
                null

        }
    );


    emit(
        "app-window-assigned",
        {
            appId:
                id,

            instanceId:
                instance.id,

            windowId:
                windowId ||
                null
        }
    );


    return true;

}


/* ============================================================
   69 — GET APP WINDOW
   ============================================================ */

function getWindow(
    appId
) {

    const instance =
        getInstance(
            appId
        );


    if (!instance) {

        return null;

    }


    return (
        instance.window ||
        null
    );

}


/* ============================================================
   70 — OPEN APP WINDOW
   ============================================================ */

async function openWindow(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        throw new Error(
            "App-ID fehlt."
        );

    }


    const instance =
        getInstance(
            id
        ) ||
        await create(
            id,
            options
        );


    const manager =
        getWindowManager();


    if (!manager) {

        /*
         * Kein Window Manager vorhanden:
         * Die App selbst bleibt trotzdem funktionsfähig.
         */

        return open(
            id,
            options
        );

    }


    try {

        let result;


        if (
            hasMethod(
                manager,
                "open"
            )
        ) {

            result =
                await manager.open(
                    id,
                    {
                        ...options,

                        app:
                            instance.app,

                        instance
                    }
                );

        } else if (
            hasMethod(
                manager,
                "createWindow"
            )
        ) {

            result =
                await manager.createWindow(
                    id,
                    {
                        ...options,

                        app:
                            instance.app,

                        instance
                    }
                );

        } else if (
            hasMethod(
                manager,
                "create"
            )
        ) {

            result =
                await manager.create(
                    id,
                    {
                        ...options,

                        app:
                            instance.app,

                        instance
                    }
                );

        }


        if (
            result
        ) {

            const windowId =
                typeof result ===
                    "string"
                    ? result
                    : (
                        result.id ||
                        result.windowId ||
                        null
                    );


            setWindow(
                id,
                windowId,
                result
            );

        }


        const opened =
            await open(
                id,
                {
                    ...options,

                    mount:
                        options.mount !==
                        false
                }
            );


        return (
            result ||
            opened
        );

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "window-open-error"
        );


        throw exception;

    }

}


/* ============================================================
   71 — CLOSE APP WINDOW
   ============================================================ */

async function closeWindow(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    const manager =
        getWindowManager();


    try {

        if (
            manager
        ) {

            const windowId =
                instance.state.windowId;


            if (
                hasMethod(
                    manager,
                    "close"
                )
            ) {

                await manager.close(
                    windowId ||
                    id,
                    {
                        ...options,

                        appId:
                            id,

                        instance
                    }
                );

            } else if (
                hasMethod(
                    manager,
                    "closeWindow"
                )
            ) {

                await manager.closeWindow(
                    windowId ||
                    id,
                    {
                        ...options,

                        appId:
                            id,

                        instance
                    }
                );

            } else if (
                hasMethod(
                    manager,
                    "destroy"
                )
            ) {

                await manager.destroy(
                    windowId ||
                    id,
                    {
                        ...options,

                        appId:
                            id,

                        instance
                    }
                );

            }

        }


        setWindow(
            id,
            null,
            null
        );


        await close(
            id,
            options
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "window-close-error"
        );


        throw exception;

    }

}


/* ============================================================
   72 — MINIMIZE APP WINDOW
   ============================================================ */

async function minimizeWindow(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    const manager =
        getWindowManager();


    try {

        if (
            manager
        ) {

            const windowId =
                instance.state.windowId;


            if (
                hasMethod(
                    manager,
                    "minimize"
                )
            ) {

                await manager.minimize(
                    windowId ||
                    id,
                    options
                );

            } else if (
                hasMethod(
                    manager,
                    "minimizeWindow"
                )
            ) {

                await manager.minimizeWindow(
                    windowId ||
                    id,
                    options
                );

            }

        }


        return minimize(
            id,
            options
        );

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "window-minimize-error"
        );


        throw exception;

    }

}


/* ============================================================
   73 — RESTORE APP WINDOW
   ============================================================ */

async function restoreWindow(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    const manager =
        getWindowManager();


    try {

        if (
            manager
        ) {

            const windowId =
                instance.state.windowId;


            if (
                hasMethod(
                    manager,
                    "restore"
                )
            ) {

                await manager.restore(
                    windowId ||
                    id,
                    options
                );

            } else if (
                hasMethod(
                    manager,
                    "restoreWindow"
                )
            ) {

                await manager.restoreWindow(
                    windowId ||
                    id,
                    options
                );

            }

        }


        return restore(
            id,
            options
        );

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "window-restore-error"
        );


        throw exception;

    }

}


/* ============================================================
   74 — MAXIMIZE APP WINDOW
   ============================================================ */

async function maximizeWindow(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    const manager =
        getWindowManager();


    try {

        if (
            manager
        ) {

            const windowId =
                instance.state.windowId;


            if (
                hasMethod(
                    manager,
                    "maximize"
                )
            ) {

                await manager.maximize(
                    windowId ||
                    id,
                    options
                );

            } else if (
                hasMethod(
                    manager,
                    "maximizeWindow"
                )
            ) {

                await manager.maximizeWindow(
                    windowId ||
                    id,
                    options
                );

            }

        }


        return maximize(
            id,
            options
        );

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "window-maximize-error"
        );


        throw exception;

    }

}


/* ============================================================
   75 — UNMAXIMIZE APP WINDOW
   ============================================================ */

async function unmaximizeWindow(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    const manager =
        getWindowManager();


    try {

        if (
            manager
        ) {

            const windowId =
                instance.state.windowId;


            if (
                hasMethod(
                    manager,
                    "unmaximize"
                )
            ) {

                await manager.unmaximize(
                    windowId ||
                    id,
                    options
                );

            } else if (
                hasMethod(
                    manager,
                    "restoreSize"
                )
            ) {

                await manager.restoreSize(
                    windowId ||
                    id,
                    options
                );

            }

        }


        return unmaximize(
            id,
            options
        );

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "window-unmaximize-error"
        );


        throw exception;

    }

}


/* ============================================================
   76 — FOCUS APP WINDOW
   ============================================================ */

async function focusWindow(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    const manager =
        getWindowManager();


    try {

        if (
            manager
        ) {

            const windowId =
                instance.state.windowId;


            if (
                hasMethod(
                    manager,
                    "focus"
                )
            ) {

                await manager.focus(
                    windowId ||
                    id,
                    options
                );

            } else if (
                hasMethod(
                    manager,
                    "focusWindow"
                )
            ) {

                await manager.focusWindow(
                    windowId ||
                    id,
                    options
                );

            }

        }


        return focus(
            id,
            options
        );

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "window-focus-error"
        );


        throw exception;

    }

}


/* ============================================================
   77 — ROUTE APP
   ============================================================ */

async function route(
    appId,
    routeValue,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        ) ||
        await create(
            id,
            options
        );


    const routeString =
        safeString(
            routeValue
        ).trim();


    if (!routeString) {

        return false;

    }


    try {

        const router =
            getRouter();


        if (
            router
        ) {

            if (
                hasMethod(
                    router,
                    "navigate"
                )
            ) {

                await router.navigate(
                    routeString,
                    {
                        ...options,

                        appId:
                            id,

                        instance
                    }
                );

            } else if (
                hasMethod(
                    router,
                    "go"
                )
            ) {

                await router.go(
                    routeString,
                    {
                        ...options,

                        appId:
                            id,

                        instance
                    }
                );

            } else if (
                hasMethod(
                    router,
                    "push"
                )
            ) {

                await router.push(
                    routeString,
                    {
                        ...options,

                        appId:
                            id,

                        instance
                    }
                );

            }

        }


        setInstanceState(
            instance,
            {

                route:
                    routeString,

                lifecycle:
                    "routed",

                status:
                    "routed"

            }
        );


        emit(
            "app-routed",
            {
                appId:
                    id,

                instanceId:
                    instance.id,

                route:
                    routeString
            }
        );


        dispatch(
            "haldo:app:routed",
            {
                appId:
                    id,

                instanceId:
                    instance.id,

                route:
                    routeString
            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "route-error"
        );


        throw exception;

    }

}


/* ============================================================
   78 — END TEIL 6
   ============================================================ */
/* ============================================================
   HALDO AI OS 18
   js/app-manager.js
   MASTER REPAIR — TEIL 7 / 16
   ============================================================ */


/* ============================================================
   79 — APP STATE API
   ============================================================ */

function getAppState(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    if (
        !state.appState.has(
            id
        )
    ) {

        state.appState.set(
            id,
            {}
        );

    }


    return state.appState.get(
        id
    );

}


/* ============================================================
   80 — UPDATE APP STATE
   ============================================================ */

function updateAppState(
    appId,
    changes = {},
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    if (
        !isObject(
            changes
        )
    ) {

        return getAppState(
            id
        );

    }


    const current =
        getAppState(
            id
        );


    const previous =
        clone(
            current
        );


    Object.assign(
        current,
        changes
    );


    state.appState.set(
        id,
        current
    );


    state.updatedAt =
        now();


    const payload = {

        appId:
            id,

        previous:
            previous,

        state:
            clone(
                current
            ),

        changes:
            clone(
                changes
            )

    };


    emit(
        "app-state-changed",
        payload
    );


    dispatch(
        "haldo:app:state-changed",
        payload
    );


    if (
        options.persist !==
        false
    ) {

        persistAppState(
            id
        ).catch(
            exception => {

                reportError(
                    exception,
                    "Persist App State"
                );

            }
        );

    }


    return current;

}


/* ============================================================
   81 — REPLACE APP STATE
   ============================================================ */

function replaceAppState(
    appId,
    nextState = {},
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    const previous =
        clone(
            getAppState(
                id
            )
        );


    const replacement =
        isObject(
            nextState
        )
            ? clone(
                nextState
            )
            : {};


    state.appState.set(
        id,
        replacement
    );


    state.updatedAt =
        now();


    const payload = {

        appId:
            id,

        previous,

        state:
            clone(
                replacement
            ),

        changes:
            clone(
                replacement
            )

    };


    emit(
        "app-state-replaced",
        payload
    );


    dispatch(
        "haldo:app:state-replaced",
        payload
    );


    if (
        options.persist !==
        false
    ) {

        persistAppState(
            id
        ).catch(
            exception => {

                reportError(
                    exception,
                    "Persist Replaced App State"
                );

            }
        );

    }


    return replacement;

}


/* ============================================================
   82 — DELETE APP STATE KEY
   ============================================================ */

function deleteAppStateKey(
    appId,
    key,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const stateObject =
        getAppState(
            id
        );


    const property =
        safeString(
            key
        ).trim();


    if (!property) {

        return false;

    }


    if (
        !Object.prototype.hasOwnProperty.call(
            stateObject,
            property
        )
    ) {

        return false;

    }


    const previous =
        stateObject[
            property
        ];


    delete stateObject[
        property
    ];


    state.updatedAt =
        now();


    emit(
        "app-state-key-deleted",
        {

            appId:
                id,

            key:
                property,

            previous:
                clone(
                    previous
                ),

            state:
                clone(
                    stateObject
                )

        }
    );


    if (
        options.persist !==
        false
    ) {

        persistAppState(
            id
        ).catch(
            exception => {

                reportError(
                    exception,
                    "Persist App State Key"
                );

            }
        );

    }


    return true;

}


/* ============================================================
   83 — CLEAR APP STATE
   ============================================================ */

function clearAppState(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const previous =
        clone(
            getAppState(
                id
            )
        );


    state.appState.set(
        id,
        {}
    );


    state.updatedAt =
        now();


    emit(
        "app-state-cleared",
        {

            appId:
                id,

            previous,

            state:
                {}

        }
    );


    dispatch(
        "haldo:app:state-cleared",
        {
            appId:
                id
        }
    );


    if (
        options.persist !==
        false
    ) {

        persistAppState(
            id
        ).catch(
            exception => {

                reportError(
                    exception,
                    "Clear App State Persistence"
                );

            }
        );

    }


    return true;

}


/* ============================================================
   84 — APP STATE VALUE
   ============================================================ */

function getStateValue(
    appId,
    key,
    fallback = undefined
) {

    const stateObject =
        getAppState(
            appId
        );


    if (
        !stateObject
    ) {

        return fallback;

    }


    const property =
        safeString(
            key
        ).trim();


    if (!property) {

        return fallback;

    }


    return Object.prototype.hasOwnProperty.call(
        stateObject,
        property
    )
        ? stateObject[
            property
        ]
        : fallback;

}


/* ============================================================
   85 — SET STATE VALUE
   ============================================================ */

function setStateValue(
    appId,
    key,
    value,
    options = {}
) {

    const property =
        safeString(
            key
        ).trim();


    if (!property) {

        return false;

    }


    updateAppState(
        appId,
        {
            [property]:
                value
        },
        options
    );


    return true;

}


/* ============================================================
   86 — TOGGLE STATE VALUE
   ============================================================ */

function toggleStateValue(
    appId,
    key,
    options = {}
) {

    const property =
        safeString(
            key
        ).trim();


    if (!property) {

        return false;

    }


    const current =
        Boolean(
            getStateValue(
                appId,
                property,
                false
            )
        );


    setStateValue(
        appId,
        property,
        !current,
        options
    );


    return !current;

}


/* ============================================================
   87 — APP METADATA
   ============================================================ */

function getMetadata(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    if (
        !state.metadata.has(
            id
        )
    ) {

        state.metadata.set(
            id,
            {}
        );

    }


    return state.metadata.get(
        id
    );

}


/* ============================================================
   88 — SET APP METADATA
   ============================================================ */

function setMetadata(
    appId,
    metadata = {},
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    const current =
        getMetadata(
            id
        );


    const previous =
        clone(
            current
        );


    if (
        isObject(
            metadata
        )
    ) {

        Object.assign(
            current,
            metadata
        );

    }


    current.updatedAt =
        now();


    state.metadata.set(
        id,
        current
    );


    state.updatedAt =
        now();


    const payload = {

        appId:
            id,

        previous,

        metadata:
            clone(
                current
            )

    };


    emit(
        "app-metadata-changed",
        payload
    );


    dispatch(
        "haldo:app:metadata-changed",
        payload
    );


    if (
        options.persist !==
        false
    ) {

        persistMetadata(
            id
        ).catch(
            exception => {

                reportError(
                    exception,
                    "Persist App Metadata"
                );

            }
        );

    }


    return current;

}


/* ============================================================
   89 — REPLACE APP METADATA
   ============================================================ */

function replaceMetadata(
    appId,
    metadata = {},
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    const previous =
        clone(
            getMetadata(
                id
            )
        );


    const replacement =
        isObject(
            metadata
        )
            ? clone(
                metadata
            )
            : {};


    replacement.updatedAt =
        now();


    state.metadata.set(
        id,
        replacement
    );


    state.updatedAt =
        now();


    emit(
        "app-metadata-replaced",
        {

            appId:
                id,

            previous,

            metadata:
                clone(
                    replacement
                )

        }
    );


    if (
        options.persist !==
        false
    ) {

        persistMetadata(
            id
        ).catch(
            exception => {

                reportError(
                    exception,
                    "Persist Replaced Metadata"
                );

            }
        );

    }


    return replacement;

}


/* ============================================================
   90 — DELETE METADATA KEY
   ============================================================ */

function deleteMetadataKey(
    appId,
    key,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const metadata =
        getMetadata(
            id
        );


    const property =
        safeString(
            key
        ).trim();


    if (!property) {

        return false;

    }


    if (
        !Object.prototype.hasOwnProperty.call(
            metadata,
            property
        )
    ) {

        return false;

    }


    delete metadata[
        property
    ];


    metadata.updatedAt =
        now();


    state.updatedAt =
        now();


    emit(
        "app-metadata-key-deleted",
        {

            appId:
                id,

            key:
                property,

            metadata:
                clone(
                    metadata
                )

        }
    );


    if (
        options.persist !==
        false
    ) {

        persistMetadata(
            id
        ).catch(
            exception => {

                reportError(
                    exception,
                    "Persist Metadata Key"
                );

            }
        );

    }


    return true;

}


/* ============================================================
   91 — CLEAR METADATA
   ============================================================ */

function clearMetadata(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const previous =
        clone(
            getMetadata(
                id
            )
        );


    state.metadata.set(
        id,
        {
            updatedAt:
                now()
        }
    );


    state.updatedAt =
        now();


    emit(
        "app-metadata-cleared",
        {

            appId:
                id,

            previous

        }
    );


    if (
        options.persist !==
        false
    ) {

        persistMetadata(
            id
        ).catch(
            exception => {

                reportError(
                    exception,
                    "Clear Metadata"
                );

            }
        );

    }


    return true;

}


/* ============================================================
   92 — END TEIL 7
   ============================================================ */
/* ============================================================
   HALDO AI OS 18
   js/app-manager.js
   MASTER REPAIR — TEIL 8 / 16
   ============================================================ */


/* ============================================================
   93 — PERSIST APP STATE
   ============================================================ */

async function persistAppState(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const storage =
        getStorage();


    const data =
        clone(
            getAppState(
                id
            )
        );


    if (!storage) {

        return false;

    }


    try {

        if (
            hasMethod(
                storage,
                "set"
            )
        ) {

            await storage.set(
                "haldo.app.state." + id,
                data
            );

        } else if (
            hasMethod(
                storage,
                "save"
            )
        ) {

            await storage.save(
                "haldo.app.state." + id,
                data
            );

        } else if (
            hasMethod(
                storage,
                "write"
            )
        ) {

            await storage.write(
                "haldo.app.state." + id,
                data
            );

        } else {

            return false;

        }


        emit(
            "app-state-persisted",
            {
                appId:
                    id
            }
        );


        return true;

    } catch (
        exception
    ) {

        reportError(
            exception,
            "Persist App State"
        );


        return false;

    }

}


/* ============================================================
   94 — LOAD APP STATE
   ============================================================ */

async function loadAppState(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    const storage =
        getStorage();


    if (!storage) {

        return getAppState(
            id
        );

    }


    try {

        let data;


        if (
            hasMethod(
                storage,
                "get"
            )
        ) {

            data =
                await storage.get(
                    "haldo.app.state." + id
                );

        } else if (
            hasMethod(
                storage,
                "load"
            )
        ) {

            data =
                await storage.load(
                    "haldo.app.state." + id
                );

        } else if (
            hasMethod(
                storage,
                "read"
            )
        ) {

            data =
                await storage.read(
                    "haldo.app.state." + id
                );

        }


        if (
            isObject(
                data
            )
        ) {

            state.appState.set(
                id,
                {
                    ...getAppState(
                        id
                    ),

                    ...clone(
                        data
                    )
                }
            );

        }


        if (
            options.emit !== false
        ) {

            emit(
                "app-state-loaded",
                {
                    appId:
                        id,

                    state:
                        clone(
                            getAppState(
                                id
                            )
                        )
                }
            );

        }


        return getAppState(
            id
        );

    } catch (
        exception
    ) {

        reportError(
            exception,
            "Load App State"
        );


        return getAppState(
            id
        );

    }

}


/* ============================================================
   95 — PERSIST APP METADATA
   ============================================================ */

async function persistMetadata(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const storage =
        getStorage();


    if (!storage) {

        return false;

    }


    const data =
        clone(
            getMetadata(
                id
            )
        );


    try {

        if (
            hasMethod(
                storage,
                "set"
            )
        ) {

            await storage.set(
                "haldo.app.metadata." + id,
                data
            );

        } else if (
            hasMethod(
                storage,
                "save"
            )
        ) {

            await storage.save(
                "haldo.app.metadata." + id,
                data
            );

        } else if (
            hasMethod(
                storage,
                "write"
            )
        ) {

            await storage.write(
                "haldo.app.metadata." + id,
                data
            );

        } else {

            return false;

        }


        emit(
            "app-metadata-persisted",
            {
                appId:
                    id
            }
        );


        return true;

    } catch (
        exception
    ) {

        reportError(
            exception,
            "Persist App Metadata"
        );


        return false;

    }

}


/* ============================================================
   96 — LOAD APP METADATA
   ============================================================ */

async function loadMetadata(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    const storage =
        getStorage();


    if (!storage) {

        return getMetadata(
            id
        );

    }


    try {

        let data;


        if (
            hasMethod(
                storage,
                "get"
            )
        ) {

            data =
                await storage.get(
                    "haldo.app.metadata." + id
                );

        } else if (
            hasMethod(
                storage,
                "load"
            )
        ) {

            data =
                await storage.load(
                    "haldo.app.metadata." + id
                );

        } else if (
            hasMethod(
                storage,
                "read"
            )
        ) {

            data =
                await storage.read(
                    "haldo.app.metadata." + id
                );

        }


        if (
            isObject(
                data
            )
        ) {

            state.metadata.set(
                id,
                {
                    ...getMetadata(
                        id
                    ),

                    ...clone(
                        data
                    )
                }
            );

        }


        if (
            options.emit !== false
        ) {

            emit(
                "app-metadata-loaded",
                {
                    appId:
                        id,

                    metadata:
                        clone(
                            getMetadata(
                                id
                            )
                        )
                }
            );

        }


        return getMetadata(
            id
        );

    } catch (
        exception
    ) {

        reportError(
            exception,
            "Load App Metadata"
        );


        return getMetadata(
            id
        );

    }

}


/* ============================================================
   97 — PERSIST EVERYTHING FOR APP
   ============================================================ */

async function persistApp(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const stateResult =
        await persistAppState(
            id
        );


    const metadataResult =
        await persistMetadata(
            id
        );


    return (
        stateResult &&
        metadataResult
    );

}


/* ============================================================
   98 — LOAD EVERYTHING FOR APP
   ============================================================ */

async function loadApp(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    await loadAppState(
        id,
        options
    );


    await loadMetadata(
        id,
        options
    );


    return {

        appId:
            id,

        state:
            getAppState(
                id
            ),

        metadata:
            getMetadata(
                id
            )

    };

}


/* ============================================================
   99 — STORAGE KEY
   ============================================================ */

function getStorageKey(
    appId,
    namespace = "state"
) {

    const id =
        resolveAppId(
            appId
        );


    const ns =
        safeString(
            namespace
        ).trim() ||
        "state";


    return (
        "haldo.app." +
        ns +
        "." +
        id
    );

}


/* ============================================================
   100 — APP STORAGE SET
   ============================================================ */

async function storageSet(
    appId,
    key,
    value
) {

    const storage =
        getStorage();


    if (!storage) {

        return false;

    }


    const storageKey =
        getStorageKey(
            appId,
            key
        );


    try {

        if (
            hasMethod(
                storage,
                "set"
            )
        ) {

            await storage.set(
                storageKey,
                value
            );

        } else if (
            hasMethod(
                storage,
                "save"
            )
        ) {

            await storage.save(
                storageKey,
                value
            );

        } else if (
            hasMethod(
                storage,
                "write"
            )
        ) {

            await storage.write(
                storageKey,
                value
            );

        } else {

            return false;

        }


        emit(
            "app-storage-set",
            {

                appId:
                    resolveAppId(
                        appId
                    ),

                key:
                    safeString(
                        key
                    ),

                value:
                    clone(
                        value
                    )

            }
        );


        return true;

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Storage Set"
        );


        return false;

    }

}


/* ============================================================
   101 — APP STORAGE GET
   ============================================================ */

async function storageGet(
    appId,
    key,
    fallback = null
) {

    const storage =
        getStorage();


    if (!storage) {

        return fallback;

    }


    const storageKey =
        getStorageKey(
            appId,
            key
        );


    try {

        let result;


        if (
            hasMethod(
                storage,
                "get"
            )
        ) {

            result =
                await storage.get(
                    storageKey
                );

        } else if (
            hasMethod(
                storage,
                "load"
            )
        ) {

            result =
                await storage.load(
                    storageKey
                );

        } else if (
            hasMethod(
                storage,
                "read"
            )
        ) {

            result =
                await storage.read(
                    storageKey
                );

        } else {

            return fallback;

        }


        return (
            result ===
            undefined
        )
            ? fallback
            : result;

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Storage Get"
        );


        return fallback;

    }

}


/* ============================================================
   102 — APP STORAGE DELETE
   ============================================================ */

async function storageDelete(
    appId,
    key
) {

    const storage =
        getStorage();


    if (!storage) {

        return false;

    }


    const storageKey =
        getStorageKey(
            appId,
            key
        );


    try {

        if (
            hasMethod(
                storage,
                "delete"
            )
        ) {

            await storage.delete(
                storageKey
            );

        } else if (
            hasMethod(
                storage,
                "remove"
            )
        ) {

            await storage.remove(
                storageKey
            );

        } else if (
            hasMethod(
                storage,
                "unset"
            )
        ) {

            await storage.unset(
                storageKey
            );

        } else {

            return false;

        }


        emit(
            "app-storage-deleted",
            {

                appId:
                    resolveAppId(
                        appId
                    ),

                key:
                    safeString(
                        key
                    )

            }
        );


        return true;

    } catch (
        exception
    ) {

        reportError(
            exception,
            "App Storage Delete"
        );


        return false;

    }

}


/* ============================================================
   103 — END TEIL 8
   ============================================================ */
/* ============================================================
   HALDO AI OS 18
   js/app-manager.js
   MASTER REPAIR — TEIL 9 / 16
   ============================================================ */


/* ============================================================
   104 — APP EVENT SUBSCRIPTION
   ============================================================ */

function on(
    eventName,
    listener,
    options = {}
) {

    const event =
        safeString(
            eventName
        ).trim();


    if (
        !event ||
        !isFunction(
            listener
        )
    ) {

        return function noop() {};

    }


    if (
        !state.listeners.has(
            event
        )
    ) {

        state.listeners.set(
            event,
            new Set()
        );

    }


    const listeners =
        state.listeners.get(
            event
        );


    listeners.add(
        listener
    );


    if (
        options.once
    ) {

        const original =
            listener;


        const wrapper =
            function (
                payload
            ) {

                listeners.delete(
                    wrapper
                );


                return original(
                    payload
                );

            };


        listeners.delete(
            original
        );


        listeners.add(
            wrapper
        );


        return function unsubscribe() {

            listeners.delete(
                wrapper
            );

        };

    }


    return function unsubscribe() {

        listeners.delete(
            listener
        );

    };

}


/* ============================================================
   105 — APP EVENT ONCE
   ============================================================ */

function once(
    eventName,
    listener
) {

    return on(
        eventName,
        listener,
        {
            once:
                true
        }
    );

}


/* ============================================================
   106 — APP EVENT OFF
   ============================================================ */

function off(
    eventName,
    listener
) {

    const event =
        safeString(
            eventName
        ).trim();


    if (!event) {

        return false;

    }


    const listeners =
        state.listeners.get(
            event
        );


    if (!listeners) {

        return false;

    }


    if (
        listener &&
        isFunction(
            listener
        )
    ) {

        return listeners.delete(
            listener
        );

    }


    listeners.clear();


    return true;

}


/* ============================================================
   107 — EMIT APP EVENT
   ============================================================ */

function emit(
    eventName,
    payload = {}
) {

    const event =
        safeString(
            eventName
        ).trim();


    if (!event) {

        return false;

    }


    const listeners =
        state.listeners.get(
            event
        );


    if (
        !listeners ||
        listeners.size ===
        0
    ) {

        return false;

    }


    const callbacks =
        Array.from(
            listeners
        );


    for (
        const listener
        of callbacks
    ) {

        try {

            listener(
                payload
            );

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App Event Listener: " +
                event
            );

        }

    }


    return true;

}


/* ============================================================
   108 — DISPATCH DOM EVENT
   ============================================================ */

function dispatch(
    eventName,
    detail = {}
) {

    const event =
        safeString(
            eventName
        ).trim();


    if (
        !event
    ) {

        return false;

    }


    if (
        typeof globalThis ===
        "undefined"
    ) {

        return false;

    }


    const target =
        globalThis.document ||
        null;


    if (
        !target ||
        !isFunction(
            target.dispatchEvent
        )
    ) {

        return false;

    }


    try {

        let customEvent;


        if (
            typeof globalThis.CustomEvent ===
            "function"
        ) {

            customEvent =
                new globalThis.CustomEvent(
                    event,
                    {
                        detail:
                            clone(
                                detail
                            )
                    }
                );

        } else if (
            typeof target.createEvent ===
            "function"
        ) {

            customEvent =
                target.createEvent(
                    "CustomEvent"
                );


            customEvent.initCustomEvent(
                event,
                true,
                false,
                clone(
                    detail
                )
            );

        }


        if (
            !customEvent
        ) {

            return false;

        }


        target.dispatchEvent(
            customEvent
        );


        return true;

    } catch (
        exception
    ) {

        reportError(
            exception,
            "Dispatch DOM Event"
        );


        return false;

    }

}


/* ============================================================
   109 — APP-SPECIFIC EVENT
   ============================================================ */

function emitForApp(
    appId,
    eventName,
    detail = {}
) {

    const id =
        resolveAppId(
            appId
        );


    const event =
        safeString(
            eventName
        ).trim();


    if (
        !id ||
        !event
    ) {

        return false;

    }


    const payload = {

        appId:
            id,

        ...clone(
            detail
        )

    };


    emit(
        event,
        payload
    );


    emit(
        "app:" + id + ":" + event,
        payload
    );


    dispatch(
        "haldo:app:" + event,
        payload
    );


    return true;

}


/* ============================================================
   110 — APP HOOK CALLER
   ============================================================ */

async function callAppHook(
    instance,
    hookName,
    payload = {}
) {

    if (
        !instance
    ) {

        return undefined;

    }


    const hook =
        safeString(
            hookName
        ).trim();


    if (!hook) {

        return undefined;

    }


    const candidates = [

        instance[
            hook
        ],

        instance.app &&
        instance.app[
            hook
        ],

        instance.controller &&
        instance.controller[
            hook
        ],

        instance.module &&
        instance.module[
            hook
        ]

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            isFunction(
                candidate
            )
        ) {

            return await candidate.call(
                instance,
                payload
            );

        }

    }


    return undefined;

}


/* ============================================================
   111 — APP ERROR HANDLER
   ============================================================ */

function setInstanceError(
    instance,
    exception,
    phase = "unknown"
) {

    if (
        !instance
    ) {

        return;

    }


    const error =
        normalizeError(
            exception
        );


    instance.error =
        error;


    if (
        !instance.state
    ) {

        instance.state = {};

    }


    instance.state.error =
        error;


    instance.state.errorPhase =
        phase;


    instance.state.lifecycle =
        "error";


    instance.state.status =
        "error";


    state.updatedAt =
        now();


    emit(
        "app-error",
        {

            appId:
                instance.appId ||
                null,

            instanceId:
                instance.id ||
                null,

            phase,

            error

        }
    );


    dispatch(
        "haldo:app:error",
        {

            appId:
                instance.appId ||
                null,

            instanceId:
                instance.id ||
                null,

            phase,

            error

        }
    );

}


/* ============================================================
   112 — NORMALIZE ERROR
   ============================================================ */

function normalizeError(
    exception
) {

    if (
        exception instanceof Error
    ) {

        return {

            name:
                exception.name ||
                "Error",

            message:
                exception.message ||
                "Unbekannter Fehler.",

            stack:
                exception.stack ||
                null

        };

    }


    if (
        isObject(
            exception
        )
    ) {

        return {

            name:
                safeString(
                    exception.name
                ) ||
                "Error",

            message:
                safeString(
                    exception.message
                ) ||
                "Unbekannter Fehler.",

            stack:
                safeString(
                    exception.stack
                ) ||
                null

        };

    }


    return {

        name:
            "Error",

        message:
            safeString(
                exception
            ) ||
            "Unbekannter Fehler.",

        stack:
            null

    };

}


/* ============================================================
   113 — APP STATUS
   ============================================================ */

function getStatus(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return {

            appId:
                id,

            status:
                "not-created",

            lifecycle:
                "not-created"

        };

    }


    return {

        appId:
            id,

        instanceId:
            instance.id ||
            null,

        status:
            instance.state &&
            instance.state.status
                ? instance.state.status
                : "unknown",

        lifecycle:
            instance.state &&
            instance.state.lifecycle
                ? instance.state.lifecycle
                : "unknown",

        initialized:
            Boolean(
                instance.state &&
                instance.state.initialized
            ),

        mounted:
            Boolean(
                instance.state &&
                instance.state.mounted
            ),

        running:
            Boolean(
                instance.state &&
                instance.state.running
            ),

        open:
            Boolean(
                instance.state &&
                instance.state.open
            ),

        visible:
            Boolean(
                instance.state &&
                instance.state.visible
            ),

        active:
            Boolean(
                instance.state &&
                instance.state.active
            ),

        focused:
            Boolean(
                instance.state &&
                instance.state.focused
            ),

        minimized:
            Boolean(
                instance.state &&
                instance.state.minimized
            ),

        maximized:
            Boolean(
                instance.state &&
                instance.state.maximized
            ),

        suspended:
            Boolean(
                instance.state &&
                instance.state.suspended
            ),

        loading:
            Boolean(
                instance.state &&
                instance.state.loading
            ),

        ready:
            Boolean(
                instance.state &&
                instance.state.ready
            ),

        route:
            instance.state &&
            instance.state.route
                ? instance.state.route
                : null,

        windowId:
            instance.state &&
            instance.state.windowId
                ? instance.state.windowId
                : null,

        error:
            instance.state &&
            instance.state.error
                ? clone(
                    instance.state.error
                )
                : null

    };

}


/* ============================================================
   114 — GET ALL APP STATUS
   ============================================================ */

function getAllStatuses() {

    const result = [];


    for (
        const [
            appId
        ]
        of state.instances
    ) {

        const status =
            getStatus(
                appId
            );


        if (
            status
        ) {

            result.push(
                status
            );

        }

    }


    return result;

}


/* ============================================================
   115 — CHECK APP RUNNING
   ============================================================ */

function isRunning(
    appId
) {

    const instance =
        getInstance(
            appId
        );


    return Boolean(
        instance &&
        instance.state &&
        instance.state.running
    );

}


/* ============================================================
   116 — CHECK APP OPEN
   ============================================================ */

function isOpen(
    appId
) {

    const instance =
        getInstance(
            appId
        );


    return Boolean(
        instance &&
        instance.state &&
        instance.state.open
    );

}


/* ============================================================
   117 — CHECK APP ACTIVE
   ============================================================ */

function isActive(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    return Boolean(
        id &&
        state.activeAppId ===
        id
    );

}


/* ============================================================
   118 — CHECK APP READY
   ============================================================ */

function isReady(
    appId
) {

    const instance =
        getInstance(
            appId
        );


    return Boolean(
        instance &&
        instance.state &&
        instance.state.ready
    );

}


/* ============================================================
   119 — END TEIL 9
   ============================================================ */
/* ============================================================
   HALDO AI OS 18
   js/app-manager.js
   MASTER REPAIR — TEIL 10 / 16
   ============================================================ */


/* ============================================================
   120 — APP LOOKUP
   ============================================================ */

function hasApp(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    return Boolean(
        resolveDefinition(
            id
        )
    );

}


/* ============================================================
   121 — APP DEFINITION
   ============================================================ */

function getApp(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    return resolveDefinition(
        id
    );

}


/* ============================================================
   122 — APP INSTANCE
   ============================================================ */

function getAppInstance(
    appId
) {

    return getInstance(
        appId
    );

}


/* ============================================================
   123 — APP CONTEXT
   ============================================================ */

function getAppContext(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    if (
        !state.contexts.has(
            id
        )
    ) {

        state.contexts.set(
            id,
            createAppContext(
                id
            )
        );

    }


    return state.contexts.get(
        id
    );

}


/* ============================================================
   124 — CREATE APP CONTEXT
   ============================================================ */

function createAppContext(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    return {

        appId:
            id,

        manager:
            api,

        state:
            getAppState(
                id
            ),

        metadata:
            getMetadata(
                id
            ),

        services:
            getServices(),

        storage:
            createScopedStorage(
                id
            ),

        events:
            createScopedEvents(
                id
            ),

        router:
            getRouter(),

        windowManager:
            getWindowManager(),

        ai:
            getAIService(),

        voice:
            getVoiceService(),

        system:
            getSystemService(),

        createdAt:
            now(),

        updatedAt:
            now()

    };

}


/* ============================================================
   125 — SCOPED STORAGE
   ============================================================ */

function createScopedStorage(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    return {

        set(
            key,
            value
        ) {

            return storageSet(
                id,
                key,
                value
            );

        },

        get(
            key,
            fallback = null
        ) {

            return storageGet(
                id,
                key,
                fallback
            );

        },

        delete(
            key
        ) {

            return storageDelete(
                id,
                key
            );

        },

        remove(
            key
        ) {

            return storageDelete(
                id,
                key
            );

        }

    };

}


/* ============================================================
   126 — SCOPED EVENTS
   ============================================================ */

function createScopedEvents(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    return {

        on(
            eventName,
            listener,
            options = {}
        ) {

            const event =
                "app:" +
                id +
                ":" +
                safeString(
                    eventName
                );


            return on(
                event,
                listener,
                options
            );

        },

        once(
            eventName,
            listener
        ) {

            const event =
                "app:" +
                id +
                ":" +
                safeString(
                    eventName
                );


            return once(
                event,
                listener
            );

        },

        off(
            eventName,
            listener
        ) {

            const event =
                "app:" +
                id +
                ":" +
                safeString(
                    eventName
                );


            return off(
                event,
                listener
            );

        },

        emit(
            eventName,
            detail = {}
        ) {

            return emitForApp(
                id,
                safeString(
                    eventName
                ),
                detail
            );

        }

    };

}


/* ============================================================
   127 — SERVICE ACCESS
   ============================================================ */

function getServices() {

    const services = {};


    const system =
        getSystemService();


    const ai =
        getAIService();


    const voice =
        getVoiceService();


    const storage =
        getStorage();


    const router =
        getRouter();


    const windowManager =
        getWindowManager();


    if (
        system
    ) {

        services.system =
            system;

    }


    if (
        ai
    ) {

        services.ai =
            ai;

    }


    if (
        voice
    ) {

        services.voice =
            voice;

    }


    if (
        storage
    ) {

        services.storage =
            storage;

    }


    if (
        router
    ) {

        services.router =
            router;

    }


    if (
        windowManager
    ) {

        services.windowManager =
            windowManager;

    }


    return services;

}


/* ============================================================
   128 — AI SERVICE ACCESS
   ============================================================ */

function getAIService() {

    const candidates = [

        globalThis.HalDoAI,

        globalThis.HaldoAI,

        globalThis.aiCore,

        globalThis.AICore,

        globalThis.AIService,

        globalThis.haldo &&
        globalThis.haldo.ai,

        globalThis.HalDo &&
        globalThis.HalDo.ai

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            candidate
        ) {

            return candidate;

        }

    }


    return null;

}


/* ============================================================
   129 — VOICE SERVICE ACCESS
   ============================================================ */

function getVoiceService() {

    const candidates = [

        globalThis.HalDoVoice,

        globalThis.HaldoVoice,

        globalThis.voiceService,

        globalThis.VoiceService,

        globalThis.voice,

        globalThis.haldo &&
        globalThis.haldo.voice,

        globalThis.HalDo &&
        globalThis.HalDo.voice

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            candidate
        ) {

            return candidate;

        }

    }


    return null;

}


/* ============================================================
   130 — SYSTEM SERVICE ACCESS
   ============================================================ */

function getSystemService() {

    const candidates = [

        globalThis.HalDoSystem,

        globalThis.HaldoSystem,

        globalThis.systemService,

        globalThis.SystemService,

        globalThis.system,

        globalThis.haldo &&
        globalThis.haldo.system,

        globalThis.HalDo &&
        globalThis.HalDo.system

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            candidate
        ) {

            return candidate;

        }

    }


    return null;

}


/* ============================================================
   131 — STORAGE SERVICE ACCESS
   ============================================================ */

function getStorage() {

    const candidates = [

        globalThis.HalDoStorage,

        globalThis.HaldoStorage,

        globalThis.storageManager,

        globalThis.StorageManager,

        globalThis.storageService,

        globalThis.StorageService,

        globalThis.storage,

        globalThis.haldo &&
        globalThis.haldo.storage,

        globalThis.HalDo &&
        globalThis.HalDo.storage

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            candidate
        ) {

            return candidate;

        }

    }


    return null;

}


/* ============================================================
   132 — ROUTER ACCESS
   ============================================================ */

function getRouter() {

    const candidates = [

        globalThis.HalDoAppRouter,

        globalThis.HaldoAppRouter,

        globalThis.AppRouter,

        globalThis.appRouter,

        globalThis.router,

        globalThis.HalDoRouter,

        globalThis.HaldoRouter,

        globalThis.haldo &&
        globalThis.haldo.router,

        globalThis.HalDo &&
        globalThis.HalDo.router

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            candidate
        ) {

            return candidate;

        }

    }


    return null;

}


/* ============================================================
   133 — WINDOW MANAGER ACCESS
   ============================================================ */

function getWindowManager() {

    const candidates = [

        globalThis.HalDoWindowManager,

        globalThis.HaldoWindowManager,

        globalThis.WindowManager,

        globalThis.windowManager,

        globalThis.haldoWindowManager,

        globalThis.haldo &&
        globalThis.haldo.windowManager,

        globalThis.HalDo &&
        globalThis.HalDo.windowManager

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            candidate
        ) {

            return candidate;

        }

    }


    return null;

}


/* ============================================================
   134 — APP ROUTE ACCESS
   ============================================================ */

function getAppRoute(
    appId
) {

    const instance =
        getInstance(
            appId
        );


    if (
        !instance ||
        !instance.state
    ) {

        return null;

    }


    return instance.state.route ||
        null;

}


/* ============================================================
   135 — APP WINDOW ID
   ============================================================ */

function getAppWindowId(
    appId
) {

    const instance =
        getInstance(
            appId
        );


    if (
        !instance ||
        !instance.state
    ) {

        return null;

    }


    return instance.state.windowId ||
        null;

}


/* ============================================================
   136 — APP INSTANCE ID
   ============================================================ */

function getAppInstanceId(
    appId
) {

    const instance =
        getInstance(
            appId
        );


    if (!instance) {

        return null;

    }


    return instance.id ||
        null;

}


/* ============================================================
   137 — APP DEFINITION ID
   ============================================================ */

function getAppDefinitionId(
    appId
) {

    const definition =
        getApp(
            appId
        );


    if (!definition) {

        return null;

    }


    return (
        definition.id ||
        definition.appId ||
        resolveAppId(
            appId
        )
    );

}


/* ============================================================
   138 — END TEIL 10
   ============================================================ */
/* ============================================================
   HALDO AI OS 18
   js/app-manager.js
   MASTER REPAIR — TEIL 11 / 16
   ============================================================ */


/* ============================================================
   139 — APP COMMAND DISPATCH
   ============================================================ */

async function command(
    appId,
    commandName,
    payload = {},
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        throw new Error(
            "App-ID fehlt."
        );

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        throw new Error(
            "App-Instanz nicht gefunden: " +
            id
        );

    }


    const name =
        safeString(
            commandName
        ).trim();


    if (!name) {

        throw new Error(
            "Command-Name fehlt."
        );

    }


    try {

        const candidates = [

            instance.commands &&
            instance.commands[
                name
            ],

            instance.app &&
            instance.app.commands &&
            instance.app.commands[
                name
            ],

            instance.controller &&
            instance.controller.commands &&
            instance.controller.commands[
                name
            ],

            instance[
                name
            ],

            instance.app &&
            instance.app[
                name
            ],

            instance.controller &&
            instance.controller[
                name
            ]

        ];


        for (
            const candidate
            of candidates
        ) {

            if (
                isFunction(
                    candidate
                )
            ) {

                const result =
                    await candidate.call(
                        instance,
                        payload,
                        options
                    );


                emit(
                    "app-command-completed",
                    {

                        appId:
                            id,

                        instanceId:
                            instance.id,

                        command:
                            name,

                        result:
                            clone(
                                result
                            )

                    }
                );


                return result;

            }

        }


        const services =
            getServices();


        if (
            services.system &&
            hasMethod(
                services.system,
                "command"
            )
        ) {

            return await services.system.command(
                id,
                name,
                payload,
                options
            );

        }


        throw new Error(
            "Command nicht verfügbar: " +
            name
        );

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "command-error"
        );


        throw exception;

    }

}


/* ============================================================
   140 — INVOKE APP METHOD
   ============================================================ */

async function invoke(
    appId,
    methodName,
    ...args
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        throw new Error(
            "App-ID fehlt."
        );

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        throw new Error(
            "App-Instanz nicht gefunden: " +
            id
        );

    }


    const method =
        safeString(
            methodName
        ).trim();


    if (!method) {

        throw new Error(
            "Methodenname fehlt."
        );

    }


    const candidates = [

        instance[
            method
        ],

        instance.app &&
        instance.app[
            method
        ],

        instance.controller &&
        instance.controller[
            method
        ],

        instance.module &&
        instance.module[
            method
        ]

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            isFunction(
                candidate
            )
        ) {

            try {

                const result =
                    await candidate.apply(
                        instance,
                        args
                    );


                emit(
                    "app-method-invoked",
                    {

                        appId:
                            id,

                        instanceId:
                            instance.id,

                        method,

                        result:
                            clone(
                                result
                            )

                    }
                );


                return result;

            } catch (
                exception
            ) {

                setInstanceError(
                    instance,
                    exception,
                    "method-error"
                );


                throw exception;

            }

        }

    }


    throw new Error(
        "App-Methode nicht verfügbar: " +
        method
    );

}


/* ============================================================
   141 — SEND MESSAGE TO APP
   ============================================================ */

async function send(
    appId,
    message,
    payload = {},
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    try {

        let result;


        if (
            isFunction(
                instance.send
            )
        ) {

            result =
                await instance.send(
                    message,
                    payload,
                    options
                );

        } else if (
            instance.app &&
            isFunction(
                instance.app.send
            )
        ) {

            result =
                await instance.app.send(
                    message,
                    payload,
                    options
                );

        } else if (
            instance.controller &&
            isFunction(
                instance.controller.send
            )
        ) {

            result =
                await instance.controller.send(
                    message,
                    payload,
                    options
                );

        } else {

            result =
                await command(
                    id,
                    "message",
                    {

                        message,

                        payload

                    },
                    options
                );

        }


        emit(
            "app-message-sent",
            {

                appId:
                    id,

                instanceId:
                    instance.id,

                message:
                    safeString(
                        message
                    ),

                payload:
                    clone(
                        payload
                    ),

                result:
                    clone(
                        result
                    )

            }
        );


        return result;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "send-error"
        );


        throw exception;

    }

}


/* ============================================================
   142 — BROADCAST MESSAGE TO ALL APPS
   ============================================================ */

async function broadcast(
    message,
    payload = {},
    options = {}
) {

    const results = [];


    const instances =
        Array.from(
            state.instances.values()
        );


    for (
        const instance
        of instances
    ) {

        if (!instance) {

            continue;

        }


        try {

            const result =
                await send(
                    instance.appId,
                    message,
                    payload,
                    options
                );


            results.push(
                {

                    appId:
                        instance.appId,

                    success:
                        true,

                    result

                }
            );

        } catch (
            exception
        ) {

            results.push(
                {

                    appId:
                        instance.appId,

                    success:
                        false,

                    error:
                        normalizeError(
                            exception
                        )

                }
            );

        }

    }


    emit(
        "apps-broadcast",
        {

            message:
                safeString(
                    message
                ),

            payload:
                clone(
                    payload
                ),

            results:
                clone(
                    results
                )

        }
    );


    return results;

}


/* ============================================================
   143 — APP REQUEST
   ============================================================ */

async function request(
    appId,
    requestName,
    payload = {},
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        throw new Error(
            "App-ID fehlt."
        );

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        throw new Error(
            "App-Instanz nicht gefunden: " +
            id
        );

    }


    const name =
        safeString(
            requestName
        ).trim();


    if (!name) {

        throw new Error(
            "Request-Name fehlt."
        );

    }


    try {

        const requestCandidates = [

            instance.request,

            instance.app &&
            instance.app.request,

            instance.controller &&
            instance.controller.request

        ];


        for (
            const handler
            of requestCandidates
        ) {

            if (
                isFunction(
                    handler
                )
            ) {

                const result =
                    await handler.call(
                        instance,
                        name,
                        payload,
                        options
                    );


                emit(
                    "app-request-completed",
                    {

                        appId:
                            id,

                        instanceId:
                            instance.id,

                        request:
                            name,

                        result:
                            clone(
                                result
                            )

                    }
                );


                return result;

            }

        }


        return await command(
            id,
            name,
            payload,
            options
        );

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "request-error"
        );


        throw exception;

    }

}


/* ============================================================
   144 — APP CAPABILITY CHECK
   ============================================================ */

function hasCapability(
    appId,
    capability
) {

    const definition =
        getApp(
            appId
        );


    if (!definition) {

        return false;

    }


    const name =
        safeString(
            capability
        ).trim();


    if (!name) {

        return false;

    }


    const capabilities =
        definition.capabilities ||
        definition.features ||
        definition.permissions ||
        [];


    if (
        Array.isArray(
            capabilities
        )
    ) {

        return capabilities.includes(
            name
        );

    }


    if (
        isObject(
            capabilities
        )
    ) {

        return Boolean(
            capabilities[
                name
            ]
        );

    }


    return false;

}


/* ============================================================
   145 — GET APP CAPABILITIES
   ============================================================ */

function getCapabilities(
    appId
) {

    const definition =
        getApp(
            appId
        );


    if (!definition) {

        return [];

    }


    const capabilities =
        definition.capabilities ||
        definition.features ||
        definition.permissions ||
        [];


    if (
        Array.isArray(
            capabilities
        )
    ) {

        return clone(
            capabilities
        );

    }


    if (
        isObject(
            capabilities
        )
    ) {

        return Object.keys(
            capabilities
        ).filter(
            key =>
                Boolean(
                    capabilities[
                        key
                    ]
                )
        );

    }


    return [];

}


/* ============================================================
   146 — APP PERMISSION CHECK
   ============================================================ */

function hasPermission(
    appId,
    permission
) {

    return hasCapability(
        appId,
        permission
    );

}


/* ============================================================
   147 — APP FEATURE CHECK
   ============================================================ */

function hasFeature(
    appId,
    feature
) {

    return hasCapability(
        appId,
        feature
    );

}


/* ============================================================
   148 — APP ENABLED CHECK
   ============================================================ */

function isEnabled(
    appId
) {

    const definition =
        getApp(
            appId
        );


    if (!definition) {

        return false;

    }


    if (
        definition.enabled ===
        false
    ) {

        return false;

    }


    if (
        definition.disabled ===
        true
    ) {

        return false;

    }


    return true;

}


/* ============================================================
   149 — APP AVAILABLE CHECK
   ============================================================ */

function isAvailable(
    appId
) {

    const definition =
        getApp(
            appId
        );


    if (!definition) {

        return false;

    }


    if (
        !isEnabled(
            appId
        )
    ) {

        return false;

    }


    if (
        definition.available ===
        false
    ) {

        return false;

    }


    if (
        definition.hidden ===
        true
    ) {

        return false;

    }


    return true;

}


/* ============================================================
   150 — END TEIL 11
   ============================================================ */
/* ============================================================
   HALDO AI OS 18
   js/app-manager.js
   MASTER REPAIR — TEIL 12 / 16
   ============================================================ */


/* ============================================================
   151 — APP DEPENDENCIES
   ============================================================ */

function getDependencies(
    appId
) {

    const definition =
        getApp(
            appId
        );


    if (!definition) {

        return [];

    }


    const dependencies =
        definition.dependencies ||
        definition.requires ||
        definition.deps ||
        [];


    if (
        Array.isArray(
            dependencies
        )
    ) {

        return clone(
            dependencies
        );

    }


    if (
        isObject(
            dependencies
        )
    ) {

        return Object.keys(
            dependencies
        );

    }


    return [];

}


/* ============================================================
   152 — CHECK DEPENDENCIES
   ============================================================ */

function checkDependencies(
    appId
) {

    const dependencies =
        getDependencies(
            appId
        );


    const missing = [];


    for (
        const dependency
        of dependencies
    ) {

        const dependencyId =
            typeof dependency ===
            "string"
                ? dependency
                : (
                    dependency &&
                    (
                        dependency.id ||
                        dependency.appId ||
                        dependency.name
                    )
                );


        if (!dependencyId) {

            continue;

        }


        if (
            !hasApp(
                dependencyId
            )
        ) {

            missing.push(
                dependencyId
            );

        }

    }


    return {

        valid:
            missing.length ===
            0,

        dependencies,

        missing

    };

}


/* ============================================================
   153 — START DEPENDENCIES
   ============================================================ */

async function startDependencies(
    appId,
    options = {}
) {

    const result =
        checkDependencies(
            appId
        );


    if (
        !result.valid &&
        options.strict !==
        false
    ) {

        throw new Error(
            "Fehlende App-Abhängigkeiten: " +
            result.missing.join(
                ", "
            )
        );

    }


    const started = [];


    for (
        const dependency
        of result.dependencies
    ) {

        const dependencyId =
            typeof dependency ===
            "string"
                ? dependency
                : (
                    dependency &&
                    (
                        dependency.id ||
                        dependency.appId ||
                        dependency.name
                    )
                );


        if (!dependencyId) {

            continue;

        }


        try {

            const instance =
                getInstance(
                    dependencyId
                );


            if (
                !instance ||
                !instance.state.running
            ) {

                await start(
                    dependencyId,
                    options
                );

            }


            started.push(
                dependencyId
            );

        } catch (
            exception
        ) {

            if (
                options.strict !==
                false
            ) {

                throw exception;

            }


            reportError(
                exception,
                "Start App Dependency: " +
                dependencyId
            );

        }

    }


    return started;

}


/* ============================================================
   154 — STOP DEPENDENCIES
   ============================================================ */

async function stopDependencies(
    appId,
    options = {}
) {

    const dependencies =
        getDependencies(
            appId
        );


    const stopped = [];


    for (
        const dependency
        of dependencies
    ) {

        const dependencyId =
            typeof dependency ===
            "string"
                ? dependency
                : (
                    dependency &&
                    (
                        dependency.id ||
                        dependency.appId ||
                        dependency.name
                    )
                );


        if (!dependencyId) {

            continue;

        }


        const instance =
            getInstance(
                dependencyId
            );


        if (
            !instance ||
            !instance.state.running
        ) {

            continue;

        }


        try {

            await stop(
                dependencyId,
                options
            );


            stopped.push(
                dependencyId
            );

        } catch (
            exception
        ) {

            if (
                options.strict !==
                false
            ) {

                throw exception;

            }


            reportError(
                exception,
                "Stop App Dependency: " +
                dependencyId
            );

        }

    }


    return stopped;

}


/* ============================================================
   155 — APP DEPENDENCY GRAPH
   ============================================================ */

function getDependencyGraph() {

    const graph = {};


    for (
        const definition
        of getAllApps()
    ) {

        const id =
            definition &&
            (
                definition.id ||
                definition.appId ||
                definition.name
            );


        if (!id) {

            continue;

        }


        graph[
            id
        ] =
            getDependencies(
                id
            );

    }


    return graph;

}


/* ============================================================
   156 — DEPENDENCY CHAIN
   ============================================================ */

function getDependencyChain(
    appId
) {

    const startId =
        resolveAppId(
            appId
        );


    if (!startId) {

        return [];

    }


    const graph =
        getDependencyGraph();


    const result = [];


    const visited =
        new Set();


    function walk(
        id
    ) {

        if (
            visited.has(
                id
            )
        ) {

            return;

        }


        visited.add(
            id
        );


        const dependencies =
            graph[
                id
            ] ||
            [];


        for (
            const dependency
            of dependencies
        ) {

            const dependencyId =
                typeof dependency ===
                "string"
                    ? dependency
                    : (
                        dependency &&
                        (
                            dependency.id ||
                            dependency.appId ||
                            dependency.name
                        )
                    );


            if (
                dependencyId
            ) {

                walk(
                    dependencyId
                );

                result.push(
                    dependencyId
                );

            }

        }

    }


    walk(
        startId
    );


    return result;

}


/* ============================================================
   157 — DETECT DEPENDENCY CYCLE
   ============================================================ */

function hasDependencyCycle(
    appId
) {

    const graph =
        getDependencyGraph();


    const startId =
        resolveAppId(
            appId
        );


    if (!startId) {

        return false;

    }


    const visiting =
        new Set();


    const visited =
        new Set();


    function visit(
        id
    ) {

        if (
            visiting.has(
                id
            )
        ) {

            return true;

        }


        if (
            visited.has(
                id
            )
        ) {

            return false;

        }


        visiting.add(
            id
        );


        const dependencies =
            graph[
                id
            ] ||
            [];


        for (
            const dependency
            of dependencies
        ) {

            const dependencyId =
                typeof dependency ===
                "string"
                    ? dependency
                    : (
                        dependency &&
                        (
                            dependency.id ||
                            dependency.appId ||
                            dependency.name
                        )
                    );


            if (
                dependencyId &&
                visit(
                    dependencyId
                )
            ) {

                return true;

            }

        }


        visiting.delete(
            id
        );


        visited.add(
            id
        );


        return false;

    }


    return visit(
        startId
    );

}


/* ============================================================
   158 — APP REGISTRATION ACCESS
   ============================================================ */

function getRegistry() {

    const candidates = [

        globalThis.HalDoAppRegistry,

        globalThis.HaldoAppRegistry,

        globalThis.AppRegistry,

        globalThis.appRegistry,

        globalThis.registry,

        globalThis.haldo &&
        globalThis.haldo.appRegistry,

        globalThis.HalDo &&
        globalThis.HalDo.appRegistry

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            candidate
        ) {

            return candidate;

        }

    }


    return null;

}


/* ============================================================
   159 — REGISTER APP
   ============================================================ */

async function register(
    definition,
    options = {}
) {

    if (
        !definition
    ) {

        throw new Error(
            "App-Definition fehlt."
        );

    }


    const registry =
        getRegistry();


    const normalized =
        normalizeDefinition(
            definition
        );


    const id =
        normalized.id;


    if (!id) {

        throw new Error(
            "App-ID fehlt."
        );

    }


    try {

        if (
            registry
        ) {

            if (
                hasMethod(
                    registry,
                    "register"
                )
            ) {

                await registry.register(
                    normalized
                );

            } else if (
                hasMethod(
                    registry,
                    "add"
                )
            ) {

                await registry.add(
                    normalized
                );

            }

        }


        state.definitions.set(
            id,
            normalized
        );


        state.updatedAt =
            now();


        emit(
            "app-registered",
            {

                appId:
                    id,

                definition:
                    clone(
                        normalized
                    )

            }
        );


        dispatch(
            "haldo:app:registered",
            {

                appId:
                    id,

                definition:
                    clone(
                        normalized
                    )

            }
        );


        return normalized;

    } catch (
        exception
    ) {

        reportError(
            exception,
            "Register App"
        );


        throw exception;

    }

}


/* ============================================================
   160 — UNREGISTER APP
   ============================================================ */

async function unregister(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const registry =
        getRegistry();


    const instance =
        getInstance(
            id
        );


    try {

        if (
            instance
        ) {

            await destroy(
                id,
                options
            );

        }


        if (
            registry
        ) {

            if (
                hasMethod(
                    registry,
                    "unregister"
                )
            ) {

                await registry.unregister(
                    id
                );

            } else if (
                hasMethod(
                    registry,
                    "remove"
                )
            ) {

                await registry.remove(
                    id
                );

            }

        }


        state.definitions.delete(
            id
        );


        state.metadata.delete(
            id
        );


        state.appState.delete(
            id
        );


        state.contexts.delete(
            id
        );


        state.updatedAt =
            now();


        emit(
            "app-unregistered",
            {
                appId:
                    id
            }
        );


        dispatch(
            "haldo:app:unregistered",
            {
                appId:
                    id
            }
        );


        return true;

    } catch (
        exception
    ) {

        reportError(
            exception,
            "Unregister App"
        );


        throw exception;

    }

}


/* ============================================================
   161 — END TEIL 12
   ============================================================ */
/* ============================================================
   HALDO AI OS 18
   js/app-manager.js
   MASTER REPAIR — TEIL 13 / 16
   ============================================================ */


/* ============================================================
   162 — APP DEFINITION NORMALIZATION
   ============================================================ */

function normalizeDefinition(
    definition
) {

    if (
        typeof definition ===
        "string"
    ) {

        return {

            id:
                safeString(
                    definition
                ).trim(),

            name:
                safeString(
                    definition
                ).trim(),

            enabled:
                true

        };

    }


    if (
        !isObject(
            definition
        )
    ) {

        return {

            id:
                "",

            name:
                "",

            enabled:
                false

        };

    }


    const id =
        safeString(
            definition.id ||
            definition.appId ||
            definition.appID ||
            definition.identifier ||
            definition.name
        ).trim();


    const name =
        safeString(
            definition.name ||
            definition.title ||
            id
        ).trim();


    const normalized = {

        ...clone(
            definition
        ),

        id,

        appId:
            definition.appId ||
            id,

        name,

        title:
            definition.title ||
            name,

        enabled:
            definition.enabled !==
            false,

        disabled:
            definition.disabled ===
            true,

        hidden:
            definition.hidden ===
            true,

        capabilities:
            normalizeList(
                definition.capabilities ||
                definition.features ||
                []
            ),

        dependencies:
            normalizeList(
                definition.dependencies ||
                definition.requires ||
                definition.deps ||
                []
            ),

        permissions:
            normalizeList(
                definition.permissions ||
                []
            ),

        createdAt:
            definition.createdAt ||
            now(),

        updatedAt:
            now()

    };


    return normalized;

}


/* ============================================================
   163 — NORMALIZE LIST
   ============================================================ */

function normalizeList(
    value
) {

    if (
        Array.isArray(
            value
        )
    ) {

        return value
            .filter(
                item =>
                    item !==
                    null &&
                    item !==
                    undefined
            )
            .map(
                item =>
                    typeof item ===
                    "string"
                        ? item.trim()
                        : item
            );

    }


    if (
        typeof value ===
        "string"
    ) {

        return value
            .split(
                ","
            )
            .map(
                item =>
                    item.trim()
            )
            .filter(
                Boolean
            );

    }


    if (
        isObject(
            value
        )
    ) {

        return Object.keys(
            value
        ).filter(
            key =>
                Boolean(
                    value[
                        key
                    ]
                )
        );

    }


    return [];

}


/* ============================================================
   164 — APP DEFINITION VALIDATION
   ============================================================ */

function validateDefinition(
    definition
) {

    const errors = [];


    if (
        !definition
    ) {

        errors.push(
            "App-Definition fehlt."
        );

        return {

            valid:
                false,

            errors

        };

    }


    const normalized =
        normalizeDefinition(
            definition
        );


    if (
        !normalized.id
    ) {

        errors.push(
            "App-ID fehlt."
        );

    }


    if (
        !normalized.name
    ) {

        errors.push(
            "App-Name fehlt."
        );

    }


    if (
        normalized.id &&
        /\s/.test(
            normalized.id
        )
    ) {

        errors.push(
            "App-ID darf keine Leerzeichen enthalten."
        );

    }


    return {

        valid:
            errors.length ===
            0,

        errors,

        definition:
            normalized

    };

}


/* ============================================================
   165 — REGISTER VALIDATED APP
   ============================================================ */

async function registerValidated(
    definition,
    options = {}
) {

    const validation =
        validateDefinition(
            definition
        );


    if (
        !validation.valid
    ) {

        const error =
            new Error(
                validation.errors.join(
                    " "
                )
            );


        error.validationErrors =
            validation.errors;


        throw error;

    }


    return register(
        validation.definition,
        options
    );

}


/* ============================================================
   166 — REFRESH APP DEFINITION
   ============================================================ */

async function refreshDefinition(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    const registry =
        getRegistry();


    let definition = null;


    try {

        if (
            registry
        ) {

            if (
                hasMethod(
                    registry,
                    "get"
                )
            ) {

                definition =
                    await registry.get(
                        id
                    );

            } else if (
                hasMethod(
                    registry,
                    "getApp"
                )
            ) {

                definition =
                    await registry.getApp(
                        id
                    );

            } else if (
                hasMethod(
                    registry,
                    "find"
                )
            ) {

                definition =
                    await registry.find(
                        id
                    );

            }

        }


        if (
            definition
        ) {

            const normalized =
                normalizeDefinition(
                    definition
                );


            state.definitions.set(
                id,
                normalized
            );


            state.updatedAt =
                now();


            if (
                options.emit !==
                false
            ) {

                emit(
                    "app-definition-refreshed",
                    {

                        appId:
                            id,

                        definition:
                            clone(
                                normalized
                            )

                    }
                );

            }


            return normalized;

        }


        return getApp(
            id
        );

    } catch (
        exception
    ) {

        reportError(
            exception,
            "Refresh App Definition"
        );


        return getApp(
            id
        );

    }

}


/* ============================================================
   167 — APP INSTANCE CREATION
   ============================================================ */

function createInstance(
    appId,
    definition = null,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        throw new Error(
            "App-ID fehlt."
        );

    }


    const existing =
        getInstance(
            id
        );


    if (
        existing &&
        options.reuse !==
        false
    ) {

        return existing;

    }


    const appDefinition =
        definition ||
        getApp(
            id
        );


    if (
        !appDefinition
    ) {

        throw new Error(
            "App-Definition nicht gefunden: " +
            id
        );

    }


    const instanceId =
        options.instanceId ||
        (
            id +
            "-" +
            String(
                Date.now()
            ) +
            "-" +
            String(
                Math.random()
            ).slice(
                2,
                8
            )
        );


    const instance = {

        id:
            instanceId,

        instanceId,

        appId:
            id,

        definition:
            clone(
                appDefinition
            ),

        app:
            null,

        controller:
            null,

        module:
            null,

        element:
            null,

        root:
            null,

        state: {

            appId:
                id,

            instanceId,

            status:
                "created",

            lifecycle:
                "created",

            initialized:
                false,

            mounted:
                false,

            running:
                false,

            open:
                false,

            visible:
                false,

            active:
                false,

            focused:
                false,

            minimized:
                false,

            maximized:
                false,

            suspended:
                false,

            loading:
                false,

            ready:
                false,

            error:
                null,

            errorPhase:
                null,

            route:
                null,

            windowId:
                null,

            createdAt:
                now(),

            updatedAt:
                now()

        },

        createdAt:
            now(),

        updatedAt:
            now()

    };


    state.instances.set(
        id,
        instance
    );


    state.updatedAt =
        now();


    emit(
        "app-instance-created",
        {

            appId:
                id,

            instanceId,

            instance

        }
    );


    dispatch(
        "haldo:app:instance-created",
        {

            appId:
                id,

            instanceId

        }
    );


    return instance;

}


/* ============================================================
   168 — ENSURE APP INSTANCE
   ============================================================ */

function ensureInstance(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return null;

    }


    const existing =
        getInstance(
            id
        );


    if (
        existing
    ) {

        return existing;

    }


    return createInstance(
        id,
        getApp(
            id
        ),
        options
    );

}


/* ============================================================
   169 — APP INSTANCE RESET
   ============================================================ */

async function resetInstance(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    try {

        await callAppHook(
            instance,
            "onReset",
            {

                appId:
                    id,

                instanceId:
                    instance.id,

                options

            }
        );


        instance.error =
            null;


        instance.state =
            {

                ...instance.state,

                status:
                    "created",

                lifecycle:
                    "created",

                initialized:
                    false,

                mounted:
                    false,

                running:
                    false,

                open:
                    false,

                visible:
                    false,

                active:
                    false,

                focused:
                    false,

                minimized:
                    false,

                maximized:
                    false,

                suspended:
                    false,

                loading:
                    false,

                ready:
                    false,

                error:
                    null,

                errorPhase:
                    null,

                route:
                    null,

                windowId:
                    null,

                updatedAt:
                    now()

            };


        instance.updatedAt =
            now();


        await persistAppState(
            id
        );


        emit(
            "app-instance-reset",
            {

                appId:
                    id,

                instanceId:
                    instance.id

            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "reset-error"
        );


        return false;

    }

}


/* ============================================================
   170 — APP INSTANCE DESTROY
   ============================================================ */

async function destroyInstance(
    appId,
    options = {}
) {

    const id =
        resolveAppId(
            appId
        );


    if (!id) {

        return false;

    }


    const instance =
        getInstance(
            id
        );


    if (!instance) {

        return false;

    }


    try {

        await callAppHook(
            instance,
            "onDestroy",
            {

                appId:
                    id,

                instanceId:
                    instance.id,

                options

            }
        );


        if (
            instance.element &&
            instance.element.parentNode
        ) {

            instance.element.parentNode.removeChild(
                instance.element
            );

        }


        instance.element =
            null;


        instance.root =
            null;


        instance.app =
            null;


        instance.controller =
            null;


        instance.module =
            null;


        state.instances.delete(
            id
        );


        state.contexts.delete(
            id
        );


        state.updatedAt =
            now();


        emit(
            "app-instance-destroyed",
            {

                appId:
                    id,

                instanceId:
                    instance.id

            }
        );


        dispatch(
            "haldo:app:instance-destroyed",
            {

                appId:
                    id,

                instanceId:
                    instance.id

            }
        );


        return true;

    } catch (
        exception
    ) {

        setInstanceError(
            instance,
            exception,
            "destroy-error"
        );


        return false;

    }

}


/* ============================================================
   171 — APP INSTANCE COLLECTION
   ============================================================ */

function getInstances() {

    return Array.from(
        state.instances.values()
    );

}


/* ============================================================
   172 — APP INSTANCE COUNT
   ============================================================ */

function getInstanceCount() {

    return state.instances.size;

}


/* ============================================================
   173 — APP DEFINITION COLLECTION
   ============================================================ */

function getDefinitions() {

    return Array.from(
        state.definitions.values()
    ).map(
        definition =>
            clone(
                definition
            )
    );

}


/* ============================================================
   174 — APP DEFINITION COUNT
   ============================================================ */

function getDefinitionCount() {

    return state.definitions.size;

}


/* ============================================================
   175 — APP REGISTERED CHECK
   ============================================================ */

function isRegistered(
    appId
) {

    const id =
        resolveAppId(
            appId
        );


    return Boolean(
        id &&
        state.definitions.has(
            id
        )
    );

}


/* ============================================================
   176 — END TEIL 13
   ============================================================ */