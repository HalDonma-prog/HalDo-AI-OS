// ============================================================
// HALDO AI OS 20
// AI PROVIDER SYSTEM
// ============================================================

(function (window, document) {

    "use strict";

    window.HalDoOS =
        window.HalDoOS || {};

    if (
        window.HalDoAIProvider &&
        window.HalDoAIProvider.__haldoAI20
    ) {
        return;
    }

    // --------------------------------------------------------
    // CONFIG
    // --------------------------------------------------------

    const CONFIG = {

        name:
            "HalDo AI Provider",

        version:
            "20.0.0",

        mode:
            "Professional Ultimate",

        defaultProvider:
            null,

        autoSelect:
            true,

        timeout:
            60000,

        maxProviders:
            100,

        allowFallback:
            true

    };

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    const state = {

        initialized:
            false,

        ready:
            false,

        processing:
            false,

        activeProvider:
            null,

        requestCount:
            0,

        successfulRequests:
            0,

        failedRequests:
            0,

        lastRequest:
            null,

        lastResponse:
            null,

        errors:
            []

    };

    // --------------------------------------------------------
    // PROVIDERS
    // --------------------------------------------------------

    const providers =
        new Map();

    // --------------------------------------------------------
    // EVENTS
    // --------------------------------------------------------

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
            !listeners.has(event)
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
                        "[HalDoAIProvider]",
                        error
                    );

                }

            }

        }

        try {

            document.dispatchEvent(
                new CustomEvent(
                    `haldo:ai-provider:${event}`,
                    {
                        detail
                    }
                )
            );

        } catch (error) {}

    }

    // --------------------------------------------------------
    // UTILITIES
    // --------------------------------------------------------

    function clean(
        value
    ) {

        return String(
            value ?? ""
        ).trim();

    }

    function createId(
        prefix = "provider"
    ) {

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

    // --------------------------------------------------------
    // NORMALIZE PROVIDER
    // --------------------------------------------------------

    function normalizeProvider(
        provider
    ) {

        if (
            !provider ||
            typeof provider !==
            "object"
        ) {

            return null;

        }

        const id =
            clean(
                provider.id ||
                provider.name
            );

        if (!id) {
            return null;
        }

        return {

            id,

            name:
                provider.name ||
                id,

            version:
                provider.version ||
                "1.0.0",

            type:
                provider.type ||
                "ai",

            enabled:
                provider.enabled !==
                false,

            priority:
                Number(
                    provider.priority ??
                    0
                ),

            capabilities:
                Array.isArray(
                    provider.capabilities
                )
                    ? [
                        ...provider.capabilities
                    ]
                    : [],

            metadata:
                provider.metadata ||
                {},

            generate:
                typeof provider.generate ===
                "function"
                    ? provider.generate
                    : null,

            ask:
                typeof provider.ask ===
                "function"
                    ? provider.ask
                    : null,

            process:
                typeof provider.process ===
                "function"
                    ? provider.process
                    : null,

            respond:
                typeof provider.respond ===
                "function"
                    ? provider.respond
                    : null,

            initialize:
                typeof provider.initialize ===
                "function"
                    ? provider.initialize
                    : null,

            destroy:
                typeof provider.destroy ===
                "function"
                    ? provider.destroy
                    : null

        };

    }

    // --------------------------------------------------------
    // REGISTER
    // --------------------------------------------------------

    async function register(
        provider
    ) {

        const normalized =
            normalizeProvider(
                provider
            );

        if (!normalized) {

            return {

                ok:
                    false,

                error:
                    "INVALID_PROVIDER"

            };

        }

        if (
            providers.size >=
            CONFIG.maxProviders &&
            !providers.has(
                normalized.id
            )
        ) {

            return {

                ok:
                    false,

                error:
                    "PROVIDER_LIMIT_REACHED"

            };

        }

        if (
            normalized.initialize
        ) {

            try {

                await normalized.initialize();

            } catch (error) {

                recordError(
                    error,
                    normalized.id
                );

                return {

                    ok:
                        false,

                    error:
                        error.message ||
                        "PROVIDER_INITIALIZATION_FAILED",

                    provider:
                        normalized.id

                };

            }

        }

        providers.set(
            normalized.id,
            normalized
        );

        emit(
            "provider-registered",
            {
                provider:
                    normalized
            }
        );

        if (
            !state.activeProvider &&
            (
                CONFIG.defaultProvider ===
                normalized.id ||
                CONFIG.autoSelect
            )
        ) {

            select(
                normalized.id
            );

        }

        return {

            ok:
                true,

            provider:
                normalized

        };

    }

    // --------------------------------------------------------
    // UNREGISTER
    // --------------------------------------------------------

    async function unregister(
        id
    ) {

        const provider =
            providers.get(
                id
            );

        if (!provider) {

            return {

                ok:
                    false,

                error:
                    "PROVIDER_NOT_FOUND"

            };

        }

        if (
            provider.destroy
        ) {

            try {

                await provider.destroy();

            } catch (error) {

                recordError(
                    error,
                    id
                );

            }

        }

        providers.delete(
            id
        );

        if (
            state.activeProvider ===
            id
        ) {

            state.activeProvider =
                null;

        }

        emit(
            "provider-unregistered",
            {
                id
            }
        );

        return {

            ok:
                true,

            id

        };

    }

    // --------------------------------------------------------
    // SELECT
    // --------------------------------------------------------

    function select(
        id
    ) {

        const provider =
            providers.get(
                id
            );

        if (
            !provider
        ) {

            return {

                ok:
                    false,

                error:
                    "PROVIDER_NOT_FOUND"

            };

        }

        if (
            !provider.enabled
        ) {

            return {

                ok:
                    false,

                error:
                    "PROVIDER_DISABLED"

            };

        }

        state.activeProvider =
            id;

        emit(
            "provider-selected",
            {
                provider
            }
        );

        return {

            ok:
                true,

            provider

        };

    }

    // --------------------------------------------------------
    // GET
    // --------------------------------------------------------

    function get(
        id
    ) {

        if (!id) {

            id =
                state.activeProvider;

        }

        return (
            providers.get(
                id
            ) ||
            null
        );

    }

    // --------------------------------------------------------
    // LIST
    // --------------------------------------------------------

    function list(
        options = {}
    ) {

        let result =
            Array.from(
                providers.values()
            );

        if (
            options.enabledOnly
        ) {

            result =
                result.filter(
                    provider =>
                        provider.enabled
                );

        }

        if (
            options.capability
        ) {

            result =
                result.filter(
                    provider =>
                        provider.capabilities
                            .includes(
                                options.capability
                            )
                );

        }

        result.sort(
            (
                a,
                b
            ) =>
                b.priority -
                a.priority
        );

        return result;

    }

    // --------------------------------------------------------
    // FIND PROVIDER
    // --------------------------------------------------------

    function findAvailable(
        options = {}
    ) {

        const candidates =
            list({
                enabledOnly:
                    true,

                capability:
                    options.capability

            });

        if (!candidates.length) {
            return null;
        }

        if (
            options.id
        ) {

            const exact =
                candidates.find(
                    provider =>
                        provider.id ===
                        options.id
                );

            if (exact) {
                return exact;
            }

        }

        return candidates[0];

    }

    // --------------------------------------------------------
    // GENERATE
    // --------------------------------------------------------

    async function generate(
        input,
        options = {}
    ) {

        const text =
            clean(
                input
            );

        if (!text) {

            return {

                ok:
                    false,

                error:
                    "EMPTY_INPUT"

            };

        }

        const requestId =
            createId(
                "request"
            );

        state.processing =
            true;

        state.requestCount++;

        state.lastRequest = {

            id:
                requestId,

            input:
                text,

            timestamp:
                Date.now(),

            options

        };

        emit(
            "request-start",
            {
                request:
                    state.lastRequest
            }
        );

        try {

            let provider =
                get(
                    options.provider
                );

            if (
                !provider ||
                !provider.enabled
            ) {

                provider =
                    findAvailable(
                        options
                    );

            }

            if (!provider) {

                throw new Error(
                    "NO_AI_PROVIDER_AVAILABLE"
                );

            }

            const methods = [

                "generate",
                "ask",
                "process",
                "respond"

            ];

            let result;
            let executed =
                false;

            for (
                const method of methods
            ) {

                if (
                    typeof provider[method] !==
                    "function"
                ) {
                    continue;
                }

                executed =
                    true;

                result =
                    await provider[method](
                        text,
                        {
                            ...options,

                            requestId,

                            provider:
                                provider.id

                        }
                    );

                break;

            }

            if (!executed) {

                throw new Error(
                    "PROVIDER_HAS_NO_GENERATION_METHOD"
                );

            }

            const response =
                normalizeResponse(
                    result,
                    provider,
                    requestId
                );

            state.lastResponse =
                response;

            if (
                response.ok
            ) {

                state.successfulRequests++;

            } else {

                state.failedRequests++;

            }

            emit(
                "response",
                {
                    response
                }
            );

            return response;

        } catch (error) {

            state.failedRequests++;

            recordError(
                error
            );

            const response = {

                ok:
                    false,

                type:
                    "provider-error",

                requestId,

                error:
                    error.message ||
                    String(
                        error
                    ),

                timestamp:
                    Date.now()

            };

            state.lastResponse =
                response;

            emit(
                "response-error",
                {
                    response,

                    error

                }
            );

            return response;

        } finally {

            state.processing =
                false;

            emit(
                "request-end",
                {
                    request:
                        state.lastRequest
                }
            );

        }

    }

    // --------------------------------------------------------
    // RESPONSE NORMALIZATION
    // --------------------------------------------------------

    function normalizeResponse(
        result,
        provider,
        requestId
    ) {

        if (
            typeof result ===
            "string"
        ) {

            return {

                ok:
                    true,

                type:
                    "text",

                text:
                    result,

                content:
                    result,

                provider:
                    provider.id,

                requestId,

                timestamp:
                    Date.now()

            };

        }

        if (
            result ===
            null ||
            result ===
            undefined
        ) {

            return {

                ok:
                    false,

                type:
                    "empty-response",

                text:
                    "",

                content:
                    "",

                provider:
                    provider.id,

                requestId,

                timestamp:
                    Date.now()

            };

        }

        if (
            typeof result !==
            "object"
        ) {

            return {

                ok:
                    true,

                type:
                    "value",

                value:
                    result,

                provider:
                    provider.id,

                requestId,

                timestamp:
                    Date.now()

            };

        }

        const text =
            result.text ??
            result.content ??
            result.message ??
            "";

        return {

            ...result,

            ok:
                result.ok !==
                false,

            provider:
                result.provider ||
                provider.id,

            requestId:
                result.requestId ||
                requestId,

            text:
                String(
                    text
                ),

            content:
                result.content ??
                String(
                    text
                ),

            timestamp:
                result.timestamp ||
                Date.now()

        };

    }

    // --------------------------------------------------------
    // ENABLE / DISABLE
    // --------------------------------------------------------

    function enable(
        id
    ) {

        const provider =
            providers.get(
                id
            );

        if (!provider) {

            return false;

        }

        provider.enabled =
            true;

        emit(
            "provider-enabled",
            {
                provider
            }
        );

        return true;

    }

    function disable(
        id
    ) {

        const provider =
            providers.get(
                id
            );

        if (!provider) {

            return false;

        }

        provider.enabled =
            false;

        if (
            state.activeProvider ===
            id
        ) {

            state.activeProvider =
                null;

        }

        emit(
            "provider-disabled",
            {
                provider
            }
        );

        return true;

    }

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    function getStatus() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            mode:
                CONFIG.mode,

            initialized:
                state.initialized,

            ready:
                state.ready,

            processing:
                state.processing,

            activeProvider:
                state.activeProvider,

            providerCount:
                providers.size,

            availableProviders:
                list({
                    enabledOnly:
                        true
                }).map(
                    provider =>
                        provider.id
                ),

            requestCount:
                state.requestCount,

            successfulRequests:
                state.successfulRequests,

            failedRequests:
                state.failedRequests,

            lastRequest:
                state.lastRequest,

            lastResponse:
                state.lastResponse,

            errors:
                state.errors.length

        };

    }

    // --------------------------------------------------------
    // ERROR
    // --------------------------------------------------------

    function recordError(
        error,
        providerId = null
    ) {

        const entry = {

            timestamp:
                Date.now(),

            provider:
                providerId,

            message:
                error?.message ||
                String(
                    error
                )

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

        emit(
            "error",
            entry
        );

    }

    // --------------------------------------------------------
    // INITIALIZE
    // --------------------------------------------------------

    async function initialize() {

        if (
            state.initialized
        ) {

            return getStatus();

        }

        state.initialized =
            true;

        emit(
            "initialized",
            getStatus()
        );

        window.setTimeout(
            () => {

                state.ready =
                    true;

                emit(
                    "ready",
                    getStatus()
                );

            },
            0
        );

        return getStatus();

    }

    // --------------------------------------------------------
    // PUBLIC API
    // --------------------------------------------------------

    const api = {

        __haldoAI20:
            true,

        config:
            CONFIG,

        state,

        initialize,

        on,

        off,

        emit,

        register,

        unregister,

        select,

        get,

        list,

        findAvailable,

        generate,

        enable,

        disable,

        normalizeResponse,

        getStatus

    };

    // --------------------------------------------------------
    // GLOBAL REGISTRATION
    // --------------------------------------------------------

    window.HalDoAIProvider =
        api;

    window.HalDoOS.aiProvider =
        api;

    // --------------------------------------------------------
    // OPTIONAL KERNEL REGISTRATION
    // --------------------------------------------------------

    function registerWithKernel() {

        const kernel =
            window.HalDoKernel ||
            window.HalDoOS?.kernel ||
            null;

        if (
            kernel &&
            typeof kernel.registerModule ===
            "function"
        ) {

            try {

                kernel.registerModule(
                    "ai-provider",
                    api
                );

            } catch (error) {

                recordError(
                    error,
                    "kernel"
                );

            }

        }

    }

    // --------------------------------------------------------
    // BOOT
    // --------------------------------------------------------

    async function boot() {

        try {

            await initialize();

            registerWithKernel();

        } catch (error) {

            recordError(
                error
            );

            console.error(
                "[HalDoAIProvider] " +
                "Initialization failed:",
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

// ============================================================
// END OF HALDO AI OS 20
// AI PROVIDER SYSTEM
// ============================================================