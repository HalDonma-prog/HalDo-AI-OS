// ============================================================
// HALDO AI OS 20
// AI ENGINE
// CORE AI ORCHESTRATION LAYER
// ============================================================

(function (window, document) {

    "use strict";

    window.HalDoOS =
        window.HalDoOS || {};

    if (
        window.HalDoAIEngine &&
        window.HalDoAIEngine.__haldoAI20
    ) {
        return;
    }

    // ========================================================
    // CONFIG
    // ========================================================

    const CONFIG = {

        name:
            "HalDo AI Engine",

        version:
            "20.0.0",

        mode:
            "Professional Ultimate",

        defaultHistoryLimit:
            50,

        defaultMemoryLimit:
            10,

        providerTimeout:
            60000,

        allowProviderFallback:
            true,

        allowCommands:
            true,

        allowMemory:
            true,

        allowConversation:
            true,

        allowLanguage:
            true

    };

    // ========================================================
    // STATE
    // ========================================================

    const state = {

        initialized:
            false,

        ready:
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

        currentProvider:
            null,

        currentLanguage:
            "de",

        errors:
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
                        "[HalDoAIEngine]",
                        error
                    );

                }

            }

        }

        try {

            document.dispatchEvent(
                new CustomEvent(
                    `haldo:ai-engine:${event}`,
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
        prefix = "engine"
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

    // ========================================================
    // MODULE ACCESS
    // ========================================================

    function getProvider() {

        return (
            window.HalDoAIProvider ||
            window.HalDoOS?.aiProvider ||
            null
        );

    }

    function getCore() {

        return (
            window.HalDoAICore ||
            window.HalDoOS?.aiCore ||
            null
        );

    }

    function getMemory() {

        return (
            window.HalDoAIMemory ||
            window.HalDoOS?.aiMemory ||
            null
        );

    }

    function getConversation() {

        return (
            window.HalDoConversationState ||
            window.HalDoOS?.conversationState ||
            null
        );

    }

    function getLanguage() {

        return (
            window.HalDoAILanguage ||
            window.HalDoOS?.aiLanguage ||
            null
        );

    }

    function getCommands() {

        return (
            window.HalDoAICommands ||
            window.HalDoOS?.aiCommands ||
            null
        );

    }

    function getKernel() {

        return (
            window.HalDoKernel ||
            window.HalDoOS?.kernel ||
            null
        );

    }

    // ========================================================
    // LANGUAGE
    // ========================================================

    function detectLanguage(
        text
    ) {

        if (
            !CONFIG.allowLanguage
        ) {

            return {

                language:
                    state.currentLanguage,

                confidence:
                    0

            };

        }

        const language =
            getLanguage();

        if (
            !language ||
            typeof language.detectLanguage !==
            "function"
        ) {

            return {

                language:
                    state.currentLanguage,

                confidence:
                    0

            };

        }

        try {

            const result =
                language.detectLanguage(
                    text
                );

            if (
                result?.language
            ) {

                state.currentLanguage =
                    result.language;

            }

            return result || {

                language:
                    state.currentLanguage,

                confidence:
                    0

            };

        } catch (error) {

            recordError(
                error
            );

            return {

                language:
                    state.currentLanguage,

                confidence:
                    0

            };

        }

    }

    // ========================================================
    // CONVERSATION CONTEXT
    // ========================================================

    function getConversationMessages(
        limit
    ) {

        if (
            !CONFIG.allowConversation
        ) {
            return [];
        }

        const conversation =
            getConversation();

        if (!conversation) {
            return [];
        }

        const methods = [

            "getMessages",
            "getHistory",
            "getConversation"

        ];

        for (
            const method of methods
        ) {

            if (
                typeof conversation[method] !==
                "function"
            ) {
                continue;
            }

            try {

                const result =
                    conversation[method](
                        limit
                    );

                if (
                    Array.isArray(
                        result
                    )
                ) {

                    return result;

                }

            } catch (error) {

                recordError(
                    error
                );

            }

        }

        return [];

    }

    // ========================================================
    // MEMORY CONTEXT
    // ========================================================

    async function getMemoryContext(
        query,
        limit
    ) {

        if (
            !CONFIG.allowMemory
        ) {
            return [];
        }

        const memory =
            getMemory();

        if (!memory) {
            return [];
        }

        const methods = [

            "recall",
            "search",
            "find",
            "query",
            "retrieve"

        ];

        for (
            const method of methods
        ) {

            if (
                typeof memory[method] !==
                "function"
            ) {
                continue;
            }

            try {

                const result =
                    await memory[method](
                        query,
                        {
                            limit
                        }
                    );

                if (
                    Array.isArray(
                        result
                    )
                ) {

                    return result;

                }

                if (
                    result
                ) {

                    return [
                        result
                    ];

                }

            } catch (error) {

                recordError(
                    error
                );

            }

        }

        return [];

    }

    // ========================================================
    // COMMAND CONTEXT
    // ========================================================

    function detectCommand(
        text
    ) {

        if (
            !CONFIG.allowCommands
        ) {

            return {

                command:
                    null,

                confidence:
                    0

            };

        }

        const commands =
            getCommands();

        if (
            !commands ||
            typeof commands.detectCommand !==
            "function"
        ) {

            return {

                command:
                    null,

                confidence:
                    0

            };

        }

        try {

            return (
                commands.detectCommand(
                    text
                ) || {

                    command:
                        null,

                    confidence:
                        0

                }
            );

        } catch (error) {

            recordError(
                error
            );

            return {

                command:
                    null,

                confidence:
                    0

            };

        }

    }

    // ========================================================
    // BUILD CONTEXT
    // ========================================================

    async function buildContext(
        input,
        options = {}
    ) {

        const language =
            detectLanguage(
                input
            );

        const messages =
            getConversationMessages(
                options.historyLimit ??
                CONFIG.defaultHistoryLimit
            );

        const memories =
            await getMemoryContext(
                input,
                options.memoryLimit ??
                CONFIG.defaultMemoryLimit
            );

        const command =
            detectCommand(
                input
            );

        return {

            requestId:
                options.requestId ||
                createId(
                    "context"
                ),

            input,

            language:
                language?.language ||
                state.currentLanguage,

            languageDetection:
                language,

            messages,

            memories,

            command,

            system: {

                name:
                    "HalDo AI OS",

                version:
                    "20.0.0",

                mode:
                    CONFIG.mode

            },

            timestamp:
                Date.now()

        };

    }

    // ========================================================
    // PROVIDER SELECTION
    // ========================================================

    function selectProvider(
        options = {}
    ) {

        const provider =
            getProvider();

        if (!provider) {
            return null;
        }

        let selected =
            null;

        if (
            options.provider &&
            typeof provider.get ===
            "function"
        ) {

            selected =
                provider.get(
                    options.provider
                );

        }

        if (
            !selected &&
            typeof provider.findAvailable ===
            "function"
        ) {

            selected =
                provider.findAvailable(
                    {
                        id:
                            options.provider,

                        capability:
                            options.capability

                    }
                );

        }

        if (
            selected
        ) {

            state.currentProvider =
                selected.id;

        }

        return selected;

    }

    // ========================================================
    // NORMALIZE RESPONSE
    // ========================================================

    function normalizeResponse(
        result,
        context,
        providerId
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
                    providerId,

                requestId:
                    context.requestId,

                language:
                    context.language,

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
                    providerId,

                requestId:
                    context.requestId,

                language:
                    context.language,

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

                text:
                    String(
                        result
                    ),

                provider:
                    providerId,

                requestId:
                    context.requestId,

                language:
                    context.language,

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

            type:
                result.type ||
                "text",

            text:
                String(
                    text
                ),

            content:
                result.content ??
                String(
                    text
                ),

            provider:
                result.provider ||
                providerId,

            requestId:
                result.requestId ||
                context.requestId,

            language:
                result.language ||
                context.language,

            timestamp:
                result.timestamp ||
                Date.now()

        };

    }

    // ========================================================
    // GENERATE
    // ========================================================

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

                type:
                    "validation-error",

                error:
                    "EMPTY_INPUT",

                text:
                    ""

            };

        }

        const requestId =
            options.requestId ||
            createId(
                "request"
            );

        const startedAt =
            Date.now();

        state.processing =
            true;

        state.requestCount++;

        state.lastRequest = {

            id:
                requestId,

            input:
                text,

            timestamp:
                startedAt,

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

            // ------------------------------------------------
            // 1. Kontext aufbauen
            // ------------------------------------------------

            const context =
                await buildContext(
                    text,
                    {
                        ...options,

                        requestId
                    }
                );

            emit(
                "context-ready",
                {
                    context
                }
            );

            // ------------------------------------------------
            // 2. Provider bestimmen
            // ------------------------------------------------

            const provider =
                selectProvider(
                    options
                );

            if (!provider) {

                const response = {

                    ok:
                        false,

                    type:
                        "no-provider",

                    error:
                        "NO_AI_PROVIDER_AVAILABLE",

                    text:
                        "",

                    content:
                        "",

                    requestId,

                    language:
                        context.language,

                    timestamp:
                        Date.now(),

                    duration:
                        Date.now() -
                        startedAt

                };

                state.lastResponse =
                    response;

                state.failedRequests++;

                emit(
                    "response",
                    {
                        response
                    }
                );

                return response;

            }

            emit(
                "provider-selected",
                {
                    provider:
                        provider.id,

                    context
                }
            );

            // ------------------------------------------------
            // 3. Provider ausführen
            // ------------------------------------------------

            const providerManager =
                getProvider();

            if (
                !providerManager ||
                typeof providerManager.generate !==
                "function"
            ) {

                throw new Error(
                    "AI_PROVIDER_ENGINE_UNAVAILABLE"
                );

            }

            const result =
                await providerManager.generate(
                    text,
                    {

                        ...options,

                        requestId,

                        context,

                        provider:
                            provider.id

                    }
                );

            // ------------------------------------------------
            // 4. Antwort normalisieren
            // ------------------------------------------------

            const response =
                normalizeResponse(
                    result,
                    context,
                    provider.id
                );

            response.duration =
                Date.now() -
                startedAt;

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
                    "engine-error",

                error:
                    error.message ||
                    String(
                        error
                    ),

                text:
                    "",

                content:
                    "",

                requestId,

                timestamp:
                    Date.now(),

                duration:
                    Date.now() -
                    startedAt

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

    // ========================================================
    // ALIASES
    // ========================================================

    async function ask(
        input,
        options = {}
    ) {

        return generate(
            input,
            options
        );

    }

    async function respond(
        input,
        options = {}
    ) {

        return generate(
            input,
            options
        );

    }

    async function process(
        input,
        options = {}
    ) {

        return generate(
            input,
            options
        );

    }

    async function complete(
        input,
        options = {}
    ) {

        return generate(
            input,
            options
        );

    }

    // ========================================================
    // STATUS
    // ========================================================

    function getStatus() {

        const provider =
            getProvider();

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

            requestCount:
                state.requestCount,

            successfulRequests:
                state.successfulRequests,

            failedRequests:
                state.failedRequests,

            currentProvider:
                state.currentProvider,

            currentLanguage:
                state.currentLanguage,

            providerConnected:
                Boolean(
                    provider
                ),

            providerStatus:
                provider &&
                typeof provider.getStatus ===
                "function"
                    ? provider.getStatus()
                    : null,

            lastRequest:
                state.lastRequest,

            lastResponse:
                state.lastResponse,

            errors:
                state.errors.length

        };

    }

    // ========================================================
    // ERROR
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
    // INITIALIZE
    // ========================================================

    async function initialize() {

        if (
            state.initialized
        ) {

            return getStatus();

        }

        state.initialized =
            true;

        const language =
            getLanguage();

        if (
            language &&
            typeof language.getLanguage ===
            "function"
        ) {

            try {

                state.currentLanguage =
                    language.getLanguage();

            } catch (error) {}

        }

        const provider =
            getProvider();

        if (
            provider &&
            typeof provider.on ===
            "function"
        ) {

            provider.on(
                "provider-selected",
                detail => {

                    if (
                        detail?.provider?.id
                    ) {

                        state.currentProvider =
                            detail.provider.id;

                    }

                    emit(
                        "provider-selected",
                        detail
                    );

                }
            );

            provider.on(
                "response",
                detail => {

                    emit(
                        "provider-response",
                        detail
                    );

                }
            );

            provider.on(
                "error",
                detail => {

                    emit(
                        "provider-error",
                        detail
                    );

                }
            );

        }

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

        on,

        off,

        emit,

        generate,

        generateResponse:
            generate,

        ask,

        respond,

        process,

        complete,

        buildContext,

        detectLanguage,

        detectCommand,

        getConversationMessages,

        getMemoryContext,

        selectProvider,

        normalizeResponse,

        getStatus

    };

    // ========================================================
    // GLOBAL REGISTRATION
    // ========================================================

    window.HalDoAIEngine =
        api;

    window.HalDoOS.aiEngine =
        api;

    // ========================================================
    // KERNEL CONNECTION
    // ========================================================

    function registerWithKernel() {

        const kernel =
            getKernel();

        if (
            kernel &&
            typeof kernel.registerModule ===
            "function"
        ) {

            try {

                kernel.registerModule(
                    "ai-engine",
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

            await initialize();

            registerWithKernel();

        } catch (error) {

            recordError(
                error
            );

            console.error(
                "[HalDoAIEngine] " +
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
// AI ENGINE
// ============================================================