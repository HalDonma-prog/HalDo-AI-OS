// ============================================================
// HALDO AI OS 20
// AI PROVIDER
// ============================================================
// Zentrale Provider-Schicht für HalDo AI.
// Verbindet AI Core / AI Chat mit einem echten KI-Backend.
//
// Unterstützt:
// - eigenen HalDo AI Endpoint
// - OpenAI-kompatible Endpoints
// - Streaming-Vorbereitung
// - Konversationskontext
// - System-Prompt
// - Sprache
// - Fehlerbehandlung
// - Timeout
// - AbortController
// - Provider-Status
// - Events
// - Kernel-Verbindung
//
// WICHTIG:
// API-Schlüssel sollten bei einer veröffentlichten Web-App
// NICHT direkt im Frontend gespeichert werden.
// Bevorzugt wird ein eigener sicherer Backend-Endpunkt.
//
// ============================================================

(function (window, document) {

    "use strict";

    if (
        window.HalDoAIProvider &&
        window.HalDoAIProvider.__haldoAI20
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    // ========================================================
    // CONFIG
    // ========================================================

    const CONFIG = {

        name:
            "HalDo AI Provider",

        version:
            "20.0.0",

        mode:
            "Professional Ultimate AI",

        enabled:
            true,

        provider:
            "haldo",

        endpoint:
            "/api/ai",

        model:
            "",

        timeout:
            60000,

        maxTokens:
            4096,

        temperature:
            0.7,

        stream:
            false,

        autoConnect:
            false,

        retryCount:
            1,

        retryDelay:
            800

    };

    // ========================================================
    // STATE
    // ========================================================

    const state = {

        initialized:
            false,

        ready:
            false,

        connected:
            false,

        processing:
            false,

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

        lastError:
            null,

        activeProvider:
            CONFIG.provider,

        activeModel:
            CONFIG.model,

        errors:
            [],

        history:
            []

    };

    // ========================================================
    // EVENTS
    // ========================================================

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

    // ========================================================
    // UTILITIES
    // ========================================================

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

    function sleep(
        milliseconds
    ) {

        return new Promise(
            resolve =>
                window.setTimeout(
                    resolve,
                    milliseconds
                )
        );

    }

    // ========================================================
    // CONFIGURATION
    // ========================================================

    function configure(
        options = {}
    ) {

        if (
            !options ||
            typeof options !==
            "object"
        ) {

            return getConfig();

        }

        const allowed = [

            "enabled",
            "provider",
            "endpoint",
            "model",
            "timeout",
            "maxTokens",
            "temperature",
            "stream",
            "autoConnect",
            "retryCount",
            "retryDelay"

        ];

        for (
            const key of allowed
        ) {

            if (
                Object.prototype
                    .hasOwnProperty
                    .call(
                        options,
                        key
                    )
            ) {

                CONFIG[key] =
                    options[key];

            }

        }

        state.activeProvider =
            CONFIG.provider;

        state.activeModel =
            CONFIG.model;

        emit(
            "configured",
            getConfig()
        );

        return getConfig();

    }

    function getConfig() {

        return {
            ...CONFIG
        };

    }

    // ========================================================
    // REQUEST BUILDING
    // ========================================================

    function buildMessages(
        input,
        context = {}
    ) {

        const messages = [];

        const systemPrompt =
            context.systemPrompt ||
            context.system?.prompt ||
            "";

        if (systemPrompt) {

            messages.push({

                role:
                    "system",

                content:
                    clean(
                        systemPrompt
                    )

            });

        }

        const history =
            Array.isArray(
                context.messages
            )
                ? context.messages
                : [];

        for (
            const message of history
        ) {

            if (
                !message ||
                !message.role
            ) {
                continue;
            }

            let role =
                message.role;

            if (
                role !== "system" &&
                role !== "user" &&
                role !== "assistant"
            ) {

                role =
                    role === "ai"
                        ? "assistant"
                        : "user";

            }

            const content =
                message.content ??
                message.text ??
                "";

            if (
                !clean(content)
            ) {
                continue;
            }

            messages.push({

                role,

                content:
                    clean(content)

            });

        }

        /*
         * Die aktuelle Eingabe nur hinzufügen,
         * wenn sie nicht bereits im Verlauf enthalten ist.
         */

        const last =
            messages[
                messages.length - 1
            ];

        if (
            !last ||
            last.role !== "user" ||
            last.content !==
                clean(input)
        ) {

            messages.push({

                role:
                    "user",

                content:
                    clean(input)

            });

        }

        return messages;

    }

    function buildPayload(
        input,
        context = {}
    ) {

        const messages =
            buildMessages(
                input,
                context
            );

        return {

            provider:
                CONFIG.provider,

            model:
                CONFIG.model,

            messages,

            language:
                context.language ||
                null,

            conversationId:
                context.conversationId ||
                null,

            requestId:
                context.requestId ||
                null,

            temperature:
                CONFIG.temperature,

            max_tokens:
                CONFIG.maxTokens,

            stream:
                CONFIG.stream,

            metadata:
                context.metadata ||
                {},

            haldo: {

                name:
                    "HalDo AI",

                os:
                    "HalDo AI OS",

                version:
                    "20.0.0",

                mode:
                    CONFIG.mode

            }

        };

    }

    // ========================================================
    // FETCH WITH TIMEOUT
    // ========================================================

    async function fetchWithTimeout(
        url,
        options = {},
        timeout =
            CONFIG.timeout
    ) {

        const controller =
            new AbortController();

        const timer =
            window.setTimeout(
                () => {
                    controller.abort();
                },
                timeout
            );

        try {

            return await fetch(
                url,
                {
                    ...options,
                    signal:
                        controller.signal
                }
            );

        } finally {

            window.clearTimeout(
                timer
            );

        }

    }

    // ========================================================
    // RESPONSE NORMALIZATION
    // ========================================================

    function normalizeResponse(
        data
    ) {

        if (
            typeof data ===
            "string"
        ) {

            return {

                ok:
                    true,

                text:
                    data,

                content:
                    data,

                provider:
                    state.activeProvider,

                model:
                    state.activeModel

            };

        }

        if (
            !data ||
            typeof data !==
            "object"
        ) {

            return {

                ok:
                    false,

                text:
                    "",

                content:
                    "",

                error:
                    "INVALID_PROVIDER_RESPONSE"

            };

        }

        /*
         * HalDo Backend Format
         */

        if (
            typeof data.text ===
            "string"
        ) {

            return {

                ...data,

                ok:
                    data.ok !== false,

                text:
                    data.text,

                content:
                    data.content ??
                    data.text

            };

        }

        /*
         * OpenAI-kompatibles Format
         */

        const openAIText =
            data.choices?.[0]?.message
                ?.content;

        if (
            typeof openAIText ===
            "string"
        ) {

            return {

                ...data,

                ok:
                    true,

                text:
                    openAIText,

                content:
                    openAIText,

                provider:
                    data.provider ||
                    state.activeProvider,

                model:
                    data.model ||
                    state.activeModel

            };

        }

        /*
         * Alternative Response-Formate
         */

        const alternative =
            data.response ??
            data.answer ??
            data.content ??
            data.message;

        if (
            typeof alternative ===
            "string"
        ) {

            return {

                ...data,

                ok:
                    data.ok !== false,

                text:
                    alternative,

                content:
                    alternative

            };

        }

        return {

            ...data,

            ok:
                data.ok !== false,

            text:
                "",

            content:
                ""

        };

    }

    // ========================================================
    // HTTP REQUEST
    // ========================================================

    async function request(
        input,
        context = {},
        options = {}
    ) {

        const text =
            clean(input);

        if (!text) {

            return {

                ok:
                    false,

                error:
                    "EMPTY_INPUT",

                text:
                    ""

            };

        }

        if (!CONFIG.enabled) {

            return {

                ok:
                    false,

                error:
                    "AI_PROVIDER_DISABLED",

                text:
                    ""

            };

        }

        const endpoint =
            clean(
                options.endpoint ||
                CONFIG.endpoint
            );

        if (!endpoint) {

            return {

                ok:
                    false,

                error:
                    "AI_ENDPOINT_MISSING",

                text:
                    ""

            };

        }

        const requestId =
            createId(
                "ai"
            );

        const payload =
            buildPayload(
                text,
                context
            );

        const startedAt =
            Date.now();

        state.processing =
            true;

        state.connected =
            false;

        state.requestCount++;

        const requestInfo = {

            id:
                requestId,

            input:
                text,

            provider:
                CONFIG.provider,

            model:
                CONFIG.model,

            endpoint,

            timestamp:
                startedAt

        };

        state.lastRequest =
            requestInfo;

        emit(
            "request-start",
            {
                request:
                    requestInfo
            }
        );

        let lastError =
            null;

        const attempts =
            Math.max(
                0,
                Number(
                    CONFIG.retryCount
                ) || 0
            ) + 1;

        try {

            for (
                let attempt = 0;
                attempt < attempts;
                attempt++
            ) {

                try {

                    const response =
                        await fetchWithTimeout(
                            endpoint,
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json",

                                    "Accept":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify(
                                        payload
                                    )

                            },
                            options.timeout ||
                            CONFIG.timeout
                        );

                    let data =
                        null;

                    const contentType =
                        response.headers
                            .get(
                                "content-type"
                            ) ||
                        "";

                    if (
                        contentType.includes(
                            "application/json"
                        )
                    ) {

                        data =
                            await response.json();

                    } else {

                        data =
                            await response.text();

                    }

                    if (
                        !response.ok
                    ) {

                        const error =
                            new Error(
                                data?.error ||
                                data?.message ||
                                `AI provider HTTP ${response.status}`
                            );

                        error.status =
                            response.status;

                        throw error;

                    }

                    const result =
                        normalizeResponse(
                            data
                        );

                    result.requestId =
                        requestId;

                    result.duration =
                        Date.now() -
                        startedAt;

                    result.timestamp =
                        Date.now();

                    state.connected =
                        true;

                    state.lastResponse =
                        result;

                    state.successfulRequests++;

                    emit(
                        "response",
                        {
                            response:
                                result
                        }
                    );

                    return result;

                } catch (error) {

                    lastError =
                        error;

                    if (
                        attempt <
                        attempts - 1
                    ) {

                        await sleep(
                            CONFIG.retryDelay
                        );

                    }

                }

            }

            throw (
                lastError ||
                new Error(
                    "AI_PROVIDER_REQUEST_FAILED"
                )
            );

        } catch (error) {

            state.failedRequests++;

            state.connected =
                false;

            state.lastError = {

                message:
                    error?.message ||
                    String(
                        error
                    ),

                timestamp:
                    Date.now(),

                requestId

            };

            recordError(
                error
            );

            const result = {

                ok:
                    false,

                type:
                    "provider-error",

                requestId,

                text:
                    "",

                content:
                    "",

                error:
                    error?.message ||
                    String(
                        error
                    ),

                timestamp:
                    Date.now(),

                duration:
                    Date.now() -
                    startedAt

            };

            state.lastResponse =
                result;

            emit(
                "response-error",
                {
                    response:
                        result,

                    error
                }
            );

            return result;

        } finally {

            state.processing =
                false;

            emit(
                "request-end",
                {
                    request:
                        requestInfo
                }
            );

        }

    }

    // ========================================================
    // CONNECTIVITY TEST
    // ========================================================

    async function testConnection(
        options = {}
    ) {

        const endpoint =
            clean(
                options.endpoint ||
                CONFIG.endpoint
            );

        if (!endpoint) {

            return {

                ok:
                    false,

                connected:
                    false,

                error:
                    "AI_ENDPOINT_MISSING"

            };

        }

        try {

            const response =
                await fetchWithTimeout(
                    endpoint,
                    {

                        method:
                            "OPTIONS",

                        headers: {

                            "Accept":
                                "application/json"

                        }

                    },
                    options.timeout ||
                    10000
                );

            const connected =
                response.ok ||
                response.status ===
                    405 ||
                response.status ===
                    404;

            state.connected =
                connected;

            return {

                ok:
                    connected,

                connected,

                status:
                    response.status,

                endpoint

            };

        } catch (error) {

            state.connected =
                false;

            return {

                ok:
                    false,

                connected:
                    false,

                endpoint,

                error:
                    error?.message ||
                    String(
                        error
                    )

            };

        }

    }

    // ========================================================
    // MAIN AI METHODS
    // ========================================================

    async function ask(
        input,
        context = {},
        options = {}
    ) {

        return request(
            input,
            context,
            options
        );

    }

    async function generate(
        input,
        context = {},
        options = {}
    ) {

        return request(
            input,
            context,
            options
        );

    }

    async function respond(
        input,
        context = {},
        options = {}
    ) {

        return request(
            input,
            context,
            options
        );

    }

    async function process(
        input,
        context = {},
        options = {}
    ) {

        return request(
            input,
            context,
            options
        );

    }

    // ========================================================
    // ERROR HANDLING
    // ========================================================

    function recordError(
        error
    ) {

        const entry = {

            timestamp:
                Date.now(),

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

    // ========================================================
    // STATUS
    // ========================================================

    function getStatus() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            mode:
                CONFIG.mode,

            enabled:
                CONFIG.enabled,

            initialized:
                state.initialized,

            ready:
                state.ready,

            connected:
                state.connected,

            processing:
                state.processing,

            provider:
                state.activeProvider,

            model:
                state.activeModel,

            endpoint:
                CONFIG.endpoint,

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

            lastError:
                state.lastError,

            errors:
                state.errors.length

        };

    }

    // ========================================================
    // INITIALIZE
    // ========================================================

    async function initialize(
        options = {}
    ) {

        if (
            state.initialized
        ) {

            return getStatus();

        }

        configure(
            options
        );

        state.initialized =
            true;

        state.activeProvider =
            CONFIG.provider;

        state.activeModel =
            CONFIG.model;

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

    // ========================================================
    // PUBLIC API
    // ========================================================

    const api = {

        __haldoAI20:
            true,

        config:
            CONFIG,

        state,

        initialize,

        configure,

        getConfig,

        on,

        off,

        emit,

        request,

        ask,

        generate,

        respond,

        process,

        testConnection,

        buildMessages,

        buildPayload,

        normalizeResponse,

        getStatus

    };

    // ========================================================
    // GLOBAL REGISTRATION
    // ========================================================

    window.HalDoAIProvider =
        api;

    window.HalDoOS.aiProvider =
        api;

    // ========================================================
    // KERNEL REGISTRATION
    // ========================================================

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
                    error
                );

            }

        }

    }

    // ========================================================
    // BOOT
    // ========================================================

    async function boot() {

        try {

            registerWithKernel();

            await initialize();

        } catch (error) {

            recordError(
                error
            );

            console.error(
                "[HalDoAIProvider] Initialization failed:",
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
// END OF HALDO AI OS 20 — AI PROVIDER
// ============================================================