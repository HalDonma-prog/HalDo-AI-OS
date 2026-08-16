// ============================================================
// HALDO AI OS 20
// APP CONTRACT
// ============================================================

(function (window, document) {

    "use strict";

    if (
        window.HalDoAppContract &&
        window.HalDoAppContract.__haldoAI20
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    const VERSION = "20.0.0";

    // --------------------------------------------------------
    // UTILITIES
    // --------------------------------------------------------

    function clean(value) {
        return String(value ?? "").trim();
    }

    function createId(prefix = "app") {

        return (
            prefix +
            "-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 9)
        );

    }

    function now() {
        return Date.now();
    }

    // --------------------------------------------------------
    // APP STATES
    // --------------------------------------------------------

    const STATES = Object.freeze({

        CREATED: "created",
        READY: "ready",
        OPENING: "opening",
        OPEN: "open",
        ACTIVE: "active",
        MINIMIZED: "minimized",
        CLOSING: "closing",
        CLOSED: "closed",
        ERROR: "error"

    });

    // --------------------------------------------------------
    // REQUIRED APP CONTRACT
    // --------------------------------------------------------

    function createAppDefinition(definition = {}) {

        const id =
            clean(
                definition.id
            ) ||
            createId("app");

        const name =
            clean(
                definition.name
            ) ||
            id;

        return {

            id,

            name,

            title:
                clean(
                    definition.title
                ) ||
                name,

            description:
                clean(
                    definition.description
                ),

            version:
                clean(
                    definition.version
                ) ||
                VERSION,

            icon:
                definition.icon ||
                null,

            category:
                clean(
                    definition.category
                ) ||
                "system",

            state:
                STATES.CREATED,

            enabled:
                definition.enabled !== false,

            visible:
                definition.visible !== false,

            singleton:
                definition.singleton !== false,

            permissions:
                Array.isArray(
                    definition.permissions
                )
                    ? [
                        ...definition.permissions
                    ]
                    : [],

            settings:
                definition.settings ||
                {},

            metadata:
                definition.metadata ||
                {},

            dependencies:
                Array.isArray(
                    definition.dependencies
                )
                    ? [
                        ...definition.dependencies
                    ]
                    : [],

            createdAt:
                now(),

            updatedAt:
                now()

        };

    }

    // --------------------------------------------------------
    // APP INSTANCE
    // --------------------------------------------------------

    function createAppInstance(
        definition,
        options = {}
    ) {

        const app =
            createAppDefinition(
                definition
            );

        const instanceId =
            createId(
                app.id
            );

        let state =
            STATES.CREATED;

        const listeners =
            new Map();

        function on(
            event,
            callback
        ) {

            if (
                typeof callback !==
                "function"
            ) {
                return () => {};
            }

            if (
                !listeners.has(
                    event
                )
            ) {

                listeners.set(
                    event,
                    new Set()
                );

            }

            listeners
                .get(event)
                .add(callback);

            return () =>
                off(
                    event,
                    callback
                );

        }

        function off(
            event,
            callback
        ) {

            const set =
                listeners.get(event);

            if (!set) {
                return;
            }

            set.delete(
                callback
            );

            if (
                set.size ===
                0
            ) {

                listeners.delete(
                    event
                );

            }

        }

        function emit(
            event,
            detail = {}
        ) {

            const set =
                listeners.get(event);

            if (set) {

                for (
                    const callback of set
                ) {

                    try {

                        callback(
                            detail
                        );

                    } catch (error) {

                        console.error(
                            "[HalDoAppContract]",
                            error
                        );

                    }

                }

            }

            try {

                document.dispatchEvent(
                    new CustomEvent(
                        `haldo:app:${event}`,
                        {
                            detail: {

                                appId:
                                    app.id,

                                instanceId,

                                ...detail

                            }
                        }
                    )
                );

            } catch (error) {}

        }

        function setState(
            nextState
        ) {

            if (
                !Object.values(
                    STATES
                ).includes(
                    nextState
                )
            ) {

                return false;

            }

            const previousState =
                state;

            state =
                nextState;

            app.state =
                nextState;

            app.updatedAt =
                now();

            emit(
                "state-changed",
                {

                    previousState,

                    state:
                        nextState

                }
            );

            return true;

        }

        function getState() {
            return state;
        }

        async function initialize(
            context = {}
        ) {

            setState(
                STATES.READY
            );

            emit(
                "initialized",
                {
                    context
                }
            );

            return {
                ok: true,
                app,
                instanceId,
                state
            };

        }

        async function open(
            context = {}
        ) {

            if (
                state ===
                STATES.OPEN ||
                state ===
                STATES.ACTIVE
            ) {

                setState(
                    STATES.ACTIVE
                );

                return {
                    ok: true,
                    alreadyOpen: true
                };

            }

            setState(
                STATES.OPENING
            );

            try {

                emit(
                    "opening",
                    {
                        context
                    }
                );

                setState(
                    STATES.OPEN
                );

                setState(
                    STATES.ACTIVE
                );

                emit(
                    "opened",
                    {
                        context
                    }
                );

                return {
                    ok: true,
                    app,
                    instanceId,
                    state
                };

            } catch (error) {

                setState(
                    STATES.ERROR
                );

                emit(
                    "error",
                    {
                        error
                    }
                );

                return {
                    ok: false,
                    error:
                        error.message ||
                        String(error)
                };

            }

        }

        async function close(
            context = {}
        ) {

            if (
                state ===
                STATES.CLOSED
            ) {

                return {
                    ok: true,
                    alreadyClosed: true
                };

            }

            setState(
                STATES.CLOSING
            );

            emit(
                "closing",
                {
                    context
                }
            );

            setState(
                STATES.CLOSED
            );

            emit(
                "closed",
                {
                    context
                }
            );

            return {
                ok: true,
                app,
                instanceId,
                state
            };

        }

        function minimize() {

            if (
                state !==
                STATES.OPEN &&
                state !==
                STATES.ACTIVE
            ) {

                return false;

            }

            return setState(
                STATES.MINIMIZED
            );

        }

        function activate() {

            if (
                state !==
                STATES.MINIMIZED
            ) {

                return false;

            }

            return setState(
                STATES.ACTIVE
            );

        }

        return {

            __haldoAI20App:
                true,

            app,

            instanceId,

            options,

            STATES,

            on,

            off,

            emit,

            setState,

            getState,

            initialize,

            open,

            close,

            minimize,

            activate,

            getDefinition() {

                return {
                    ...app
                };

            }

        };

    }

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    function validate(
        definition
    ) {

        const errors = [];

        if (
            !definition ||
            typeof definition !==
            "object"
        ) {

            errors.push(
                "APP_DEFINITION_REQUIRED"
            );

            return {
                valid: false,
                errors
            };

        }

        if (
            !clean(
                definition.id
            )
        ) {

            errors.push(
                "APP_ID_REQUIRED"
            );

        }

        if (
            !clean(
                definition.name
            )
        ) {

            errors.push(
                "APP_NAME_REQUIRED"
            );

        }

        return {

            valid:
                errors.length === 0,

            errors

        };

    }

    // --------------------------------------------------------
    // PUBLIC API
    // --------------------------------------------------------

    const api = {

        __haldoAI20:
            true,

        version:
            VERSION,

        STATES,

        clean,

        createId,

        createAppDefinition,

        createAppInstance,

        validate

    };

    // --------------------------------------------------------
    // GLOBAL REGISTRATION
    // --------------------------------------------------------

    window.HalDoAppContract =
        api;

    window.HalDoOS.appContract =
        api;

    // --------------------------------------------------------
    // KERNEL REGISTRATION
    // --------------------------------------------------------

    try {

        const kernel =
            window.HalDoKernel ||
            window.HalDoOS.kernel;

        if (
            kernel &&
            typeof kernel.registerModule ===
            "function"
        ) {

            kernel.registerModule(
                "app-contract",
                api
            );

        }

    } catch (error) {

        console.warn(
            "[HalDoAppContract] " +
            "Kernel registration failed:",
            error
        );

    }

    console.log(
        "[HalDoAppContract] HalDo AI OS 20 App Contract ready."
    );

})(window, document);

// ============================================================
// END OF APP CONTRACT
// ============================================================