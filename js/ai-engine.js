// ============================================================
// HALDO AI OS 18
// AI ENGINE
// PART 85
// Professional Ultimate Foundation
// ============================================================

(function (window, document) {

    "use strict";

    if (
        window.HalDoAIEngine &&
        window.HalDoAIEngine.__haldoAI18
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    // ========================================================
    // CONFIGURATION
    // ========================================================

    const CONFIG = {

        name:
            "HalDo AI Engine",

        version:
            "18.0.0",

        mode:
            "Professional Ultimate Foundation",

        defaultProvider:
            "haldo",

        defaultModel:
            "haldo-ai",

        temperature:
            0.7,

        maxTokens:
            4096,

        timeout:
            60000,

        streaming:
            false,

        allowFallback:
            true,

        rememberRequests:
            true,

        maxHistory:
            100

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

        provider:
            CONFIG.defaultProvider,

        model:
            CONFIG.defaultModel,

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

        providers:
            {},

        history:
            [],

        errors:
            []

    };

    // ========================================================
    // EVENT SYSTEM
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

    // ========================================================
    // MODULE ACCESS
    // ========================================================

    function getCore() {

        return (
            window.HalDoAICore ||
            window.HalDoOS?.aiCore ||
            null
        );

    }

    function getChat() {

        return (
            window.HalDoAIChat ||
            window.HalDoOS?.aiChat ||
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

    function getLanguage() {

        return (
            window.HalDoAILanguage ||
            window.HalDoOS?.aiLanguage ||
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
    // PROVIDER MANAGEMENT
    // ========================================================

    function registerProvider(
        id,
        provider
    ) {

        const key =
            clean(id)
                .toLowerCase();

        if (
            !key ||
            !provider
        ) {

            return false;

        }

        state.providers[
            key
        ] = {

            id:
                key,

            name:
                provider.name ||
                key,

            description:
                provider.description ||
                "",

            version:
                provider.version ||
                "1.0.0",

            capabilities:
                provider.capabilities ||
                {},

            generate:
                provider.generate,

            stream:
                provider.stream,

            status:
                provider.status,

            metadata:
                provider.metadata ||
                {}

        };

        emit(
            "provider-registered",
            {
                id:
                    key,

                provider:
                    state.providers[
                        key
                    ]

            }
        );

        return true;

    }

    function unregisterProvider(
        id
    ) {

        const key =
            clean(id)
                .toLowerCase();

        if (
            !state.providers[
                key
            ]
        ) {

            return false;

        }

        delete state.providers[
            key
        ];

        if (
            state.provider ===
            key
        ) {

            state.provider =
                CONFIG.defaultProvider;

        }

        emit(
            "provider-unregistered",
            {
                id:
                    key
            }
        );

        return true;

    }

    function getProvider(
        id
    ) {

        const key =
            clean(
                id ||
                state.provider
            )
            .toLowerCase();

        return (
            state.providers[
                key
            ] ||
            null
        );

    }

    function getProviders() {

        return Object.values(
            state.providers
        );

    }

    function setProvider(
        id
    ) {

        const key =
            clean(
                id
            )
            .toLowerCase();

        if (
            !state.providers[
                key
            ]
        ) {

            return {

                ok:
                    false,

                error:
                    "PROVIDER_NOT_FOUND",

                provider:
                    key

            };

        }

        state.provider =
            key;

        emit(
            "provider-changed",
            {
                provider:
                    key
            }
        );

        return {

            ok:
                true,

            provider:
                key

        };

    }

    function setModel(
        model
    ) {

        const value =
            clean(
                model
            );

        if (!value) {

            return {

                ok:
                    false,

                error:
                    "MODEL_NOT_SPECIFIED"

            };

        }

        state.model =
            value;

        emit(
            "model-changed",
            {
                model:
                    value
            }
        );

        return {

            ok:
                true,

            model:
                value

        };

    }

    // ========================================================
    // REQUEST NORMALIZATION
    // ========================================================

    function normalizeMessages(
        input,
        context = {}
    ) {

        if (
            Array.isArray(
                input
            )
        ) {

            return input
                .map(
                    message => {

                        if (
                            typeof message ===
                            "string"
                        ) {

                            return {

                                role:
                                    "user",

                                content:
                                    message

                            };

                        }

                        return {

                            role:
                                message?.role ||
                                "user",

                            content:
                                message?.content ??
                                message?.text ??
                                ""

                        };

                    }
                )
                .filter(
                    message =>
                        clean(
                            message.content
                        )
                );

        }

        const messages = [];

        /*
         * System-Kontext.
         */

        if (
            context.systemPrompt
        ) {

            messages.push({

                role:
                    "system",

                content:
                    context.systemPrompt

            });

        }

        /*
         * Gesprächshistorie.
         */

        if (
            Array.isArray(
                context.messages
            )
        ) {

            context.messages
                .forEach(
                    message => {

                        if (
                            !message
                        ) {
                            return;
                        }

                        messages.push({

                            role:
                                message.role ||
                                "user",

                            content:
                                message.content ??
                                message.text ??
                                ""

                        });

                    }
                );

        }

        /*
         * Aktuelle Eingabe.
         */

        const text =
            clean(
                context.input ??
                input
            );

        if (
            text
        ) {

            messages.push({

                role:
                    "user",

                content:
                    text

            });

        }

        return messages;

    }

    // ========================================================
    // REQUEST BUILDING
    // ========================================================

    function buildRequest(
        input,
        context = {},
        options = {}
    ) {

        const request = {

            id:
                createId(
                    "request"
                ),

            input:
                typeof input ===
                "string"
                    ? input
                    : null,

            messages:
                normalizeMessages(
                    input,
                    context
                ),

            provider:
                options.provider ||
                state.provider,

            model:
                options.model ||
                state.model,

            temperature:
                options.temperature ??
                CONFIG.temperature,

            maxTokens:
                options.maxTokens ??
                CONFIG.maxTokens,

            streaming:
                options.streaming ??
                CONFIG.streaming,

            language:
                options.language ||
                context.language ||
                "de",

            context:
                context,

            metadata:
                options.metadata ||
                {},

            timestamp:
                Date.now()

        };

        return request;

    }

    // ========================================================
    // LOCAL HALDO PROVIDER
    // ========================================================

    async function haldoProvider(
        request
    ) {

        /*
         * Diese Schicht ist bewusst neutral.
         *
         * Wenn später ein echter HalDo-AI-Backend-Service
         * angeschlossen wird, muss die UI nicht verändert werden.
         */

        const chat =
            getChat();

        if (
            chat
        ) {

            const methods = [

                "generateResponse",
                "generate",
                "respond",
                "process",
                "ask"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof chat[
                        method
                    ] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await chat[
                            method
                        ](
                            request.input ||
                            request.messages,
                            {
                                ...request.context,

                                request
                            }
                        );

                    if (
                        result !==
                        undefined &&
                        result !==
                        null
                    ) {

                        return normalizeResponse(
                            result,
                            request
                        );

                    }

                } catch (error) {

                    recordError(
                        error
                    );

                }

            }

        }

        /*
         * Falls die AI Engine selbst einen Provider
         * bereitstellt, kann dieser später hier
         * angeschlossen werden.
         */

        return {

            ok:
                false,

            provider:
                "haldo",

            type:
                "provider-unavailable",

            error:
                "HALDO_PROVIDER_UNAVAILABLE",

            message:
                "Der HalDo-AI-Provider ist noch nicht mit einem aktiven Backend verbunden."

        };

    }

    // ========================================================
    // PROVIDER EXECUTION
    // ========================================================

    async function executeProvider(
        request
    ) {

        const provider =
            getProvider(
                request.provider
            );

        if (!provider) {

            /*
             * Eingebauten HalDo Provider
             * automatisch bereitstellen.
             */

            if (
                request.provider ===
                "haldo"
            ) {

                return haldoProvider(
                    request
                );

            }

            return {

                ok:
                    false,

                error:
                    "PROVIDER_NOT_FOUND",

                provider:
                    request.provider

            };

        }

        if (
            typeof provider.generate !==
            "function"
        ) {

            return {

                ok:
                    false,

                error:
                    "PROVIDER_GENERATE_UNAVAILABLE",

                provider:
                    request.provider

            };

        }

        try {

            const result =
                await provider.generate(
                    request
                );

            return normalizeResponse(
                result,
                request
            );

        } catch (error) {

            recordError(
                error
            );

            return {

                ok:
                    false,

                error:
                    error.message ||
                    "PROVIDER_ERROR",

                provider:
                    request.provider

            };

        }

    }

    // ========================================================
    // RESPONSE NORMALIZATION
    // ========================================================

    function normalizeResponse(
        result,
        request
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
                    request.provider,

                model:
                    request.model,

                requestId:
                    request.id

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
                    "empty",

                error:
                    "EMPTY_PROVIDER_RESPONSE",

                provider:
                    request.provider,

                requestId:
                    request.id

            };

        }

        if (
            !isObject(
                result
            )
        ) {

            return {

                ok:
                    true,

                type:
                    "value",

                value:
                    result,

                provider:
                    request.provider,

                requestId:
                    request.id

            };

        }

        const text =
            result.text ??
            result.content ??
            result.message ??
            result.output ??
            "";

        return {

            ok:
                result.ok !==
                false,

            ...result,

            type:
                result.type ||
                "text",

            text:
                typeof text ===
                "string"
                    ? text
                    : String(
                        text
                    ),

            content:
                typeof text ===
                "string"
                    ? text
                    : String(
                        text
                    ),

            provider:
                result.provider ||
                request.provider,

            model:
                result.model ||
                request.model,

            requestId:
                result.requestId ||
                request.id

        };

    }

    // ========================================================
    // FALLBACK
    // ========================================================

    async function executeFallback(
        request,
        originalResult
    ) {

        if (
            !CONFIG.allowFallback
        ) {

            return originalResult;

        }

        /*
         * Chat-Modul als Fallback.
         */

        const chat =
            getChat();

        if (
            chat
        ) {

            const methods = [

                "fallback",
                "generate",
                "respond",
                "process"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof chat[
                        method
                    ] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await chat[
                            method
                        ](
                            request.input,
                            {
                                ...request.context,

                                fallback:
                                    true
                            }
                        );

                    if (
                        result !==
                        undefined &&
                        result !==
                        null
                    ) {

                        return normalizeResponse(
                            result,
                            request
                        );

                    }

                } catch (error) {

                    recordError(
                        error
                    );

                }

            }

        }

        return originalResult;

    }

    // ========================================================
    // MAIN GENERATE FUNCTION
    // ========================================================

    async function generate(
        input,
        context = {},
        options = {}
    ) {

        const text =
            typeof input ===
            "string"
                ? clean(
                    input
                )
                : "";

        if (
            !text &&
            !Array.isArray(
                input
            )
        ) {

            return {

                ok:
                    false,

                error:
                    "EMPTY_INPUT"

            };

        }

        const request =
            buildRequest(
                input,
                context,
                options
            );

        state.processing =
            true;

        state.requestCount++;

        state.lastRequest =
            request;

        emit(
            "request-start",
            {
                request
            }
        );

        const startedAt =
            Date.now();

        try {

            const result =
                await executeProvider(
                    request
                );

            let finalResult =
                result;

            /*
             * Provider nicht verfügbar:
             * Fallback versuchen.
             */

            if (
                result?.ok ===
                false &&
                CONFIG.allowFallback
            ) {

                finalResult =
                    await executeFallback(
                        request,
                        result
                    );

            }

            finalResult =
                normalizeResponse(
                    finalResult,
                    request
                );

            finalResult.duration =
                Date.now() -
                startedAt;

            finalResult.timestamp =
                Date.now();

            state.lastResponse =
                finalResult;

            if (
                finalResult.ok
            ) {

                state.successfulRequests++;

            } else {

                state.failedRequests++;

            }

            const historyEntry = {

                request,

                response:
                    finalResult,

                timestamp:
                    Date.now()

            };

            state.history.push(
                historyEntry
            );

            if (
                state.history.length >
                CONFIG.maxHistory
            ) {

                state.history.shift();

            }

            /*
             * Conversation aktualisieren.
             */

            if (
                finalResult.ok
            ) {

                const conversation =
                    getConversation();

                if (
                    conversation
                ) {

                    for (
                        const method of [
                            "addMessage",
                            "add"
                        ]
                    ) {

                        if (
                            typeof conversation[
                                method
                            ] !==
                            "function"
                        ) {
                            continue;
                        }

                        try {

                            await conversation[
                                method
                            ]({

                                role:
                                    "assistant",

                                content:
                                    finalResult.text,

                                text:
                                    finalResult.text,

                                timestamp:
                                    Date.now(),

                                requestId:
                                    request.id

                            });

                            break;

                        } catch (error) {}

                    }

                }

            }

            emit(
                "response",
                {
                    request,

                    response:
                        finalResult

                }
            );

            return finalResult;

        } catch (error) {

            state.failedRequests++;

            recordError(
                error
            );

            const result = {

                ok:
                    false,

                type:
                    "engine-error",

                error:
                    error.message ||
                    String(
                        error
                    ),

                provider:
                    request.provider,

                model:
                    request.model,

                requestId:
                    request.id,

                timestamp:
                    Date.now(),

                duration:
                    Date.now() -
                    startedAt

            };

            state.lastResponse =
                result;

            emit(
                "error",
                {
                    request,

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
                    request
                }
            );

        }

    }

    // ========================================================
    // ALIASES
    // ========================================================

    async function ask(
        input,
        context = {},
        options = {}
    ) {

        return generate(
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

        return generate(
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

        return generate(
            input,
            context,
            options
        );

    }

    async function complete(
        input,
        context = {},
        options = {}
    ) {

        return generate(
            input,
            context,
            options
        );

    }

    // ========================================================
    // STREAMING FOUNDATION
    // ========================================================

    async function stream(
        input,
        context = {},
        options = {},
        onChunk
    ) {

        const callback =
            typeof onChunk ===
            "function"
                ? onChunk
                : () => {};

        const request =
            buildRequest(
                input,
                context,
                {
                    ...options,

                    streaming:
                        true
                }
            );

        const provider =
            getProvider(
                request.provider
            );

        if (
            provider &&
            typeof provider.stream ===
            "function"
        ) {

            try {

                return await provider.stream(
                    request,
                    callback
                );

            } catch (error) {

                recordError(
                    error
                );

            }

        }

        /*
         * Fallback:
         * vollständige Antwort als ein Chunk.
         */

        const result =
            await generate(
                input,
                context,
                options
            );

        if (
            result?.text
        ) {

            callback(
                result.text,
                {
                    done:
                        true,

                    requestId:
                        result.requestId

                }
            );

        }

        return result;

    }

    // ========================================================
    // SYSTEM PROMPT
    // ========================================================

    function buildSystemPrompt(
        options = {}
    ) {

        const language =
            getLanguage();

        let currentLanguage =
            "de";

        if (
            language &&
            typeof language.getLanguage ===
            "function"
        ) {

            try {

                currentLanguage =
                    language.getLanguage();

            } catch (error) {}

        }

        const base = [

            "Du bist HalDo AI.",

            "Du bist die zentrale künstliche Intelligenz des HalDo AI OS 18.",

            "Arbeite zuverlässig, strukturiert und hilfreich.",

            "Respektiere den aktuellen Systemzustand.",

            `Aktuelle Sprache: ${currentLanguage}.`,

            "HalDo AI OS Version 18.0.0.",

            "Modus: Professional Ultimate Foundation."

        ];

        if (
            options.additionalInstructions
        ) {

            base.push(
                clean(
                    options.additionalInstructions
                )
            );

        }

        return base.join(
            "\n"
        );

    }

    // ========================================================
    // CONTEXT BUILDER
    // ========================================================

    async function buildContext(
        input,
        options = {}
    ) {

        const context = {

            input:
                input,

            language:
                options.language ||
                null,

            systemPrompt:
                options.systemPrompt ||
                buildSystemPrompt(
                    options
                ),

            messages:
                [],

            memories:
                [],

            metadata:
                options.metadata ||
                {}

        };

        const conversation =
            getConversation();

        if (
            conversation
        ) {

            for (
                const method of [
                    "getMessages",
                    "getHistory",
                    "getConversation"
                ]
            ) {

                if (
                    typeof conversation[
                        method
                    ] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        conversation[
                            method
                        ](
                            options.historyLimit ||
                            30
                        );

                    if (
                        Array.isArray(
                            result
                        )
                    ) {

                        context.messages =
                            result;

                        break;

                    }

                } catch (error) {}

            }

        }

        const memory =
            getMemory();

        if (
            memory
        ) {

            for (
                const method of [
                    "recall",
                    "search",
                    "find"
                ]
            ) {

                if (
                    typeof memory[
                        method
                    ] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await memory[
                            method
                        ](
                            input,
                            {
                                limit:
                                    options.memoryLimit ||
                                    10
                            }
                        );

                    context.memories =
                        Array.isArray(
                            result
                        )
                            ? result
                            : result
                                ? [result]
                                : [];

                    break;

                } catch (error) {}

            }

        }

        return context;

    }

    // ========================================================
    // SMART ASK
    // ========================================================

    async function smartAsk(
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

        /*
         * Commands zuerst erkennen.
         */

        const commands =
            getCommands();

        if (
            commands &&
            typeof commands.detectCommand ===
            "function" &&
            !options.forceAI
        ) {

            try {

                const detection =
                    commands.detectCommand(
                        text
                    );

                if (
                    detection?.command &&
                    detection.confidence >=
                        0.55
                ) {

                    return {

                        ok:
                            true,

                        type:
                            "command",

                        handled:
                            true,

                        command:
                            detection.command.id,

                        confidence:
                            detection.confidence,

                        result:
                            await commands.execute(
                                text,
                                options
                            )

                    };

                }

            } catch (error) {

                recordError(
                    error
                );

            }

        }

        /*
         * Normaler AI-Weg.
         */

        const context =
            await buildContext(
                text,
                options
            );

        return generate(
            text,
            context,
            options
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

            initialized:
                state.initialized,

            ready:
                state.ready,

            processing:
                state.processing,

            provider:
                state.provider,

            model:
                state.model,

            requestCount:
                state.requestCount,

            successfulRequests:
                state.successfulRequests,

            failedRequests:
                state.failedRequests,

            providerCount:
                Object.keys(
                    state.providers
                ).length,

            historyCount:
                state.history.length,

            errors:
                state.errors.length,

            modules: {

                core:
                    Boolean(
                        getCore()
                    ),

                chat:
                    Boolean(
                        getChat()
                    ),

                memory:
                    Boolean(
                        getMemory()
                    ),

                language:
                    Boolean(
                        getLanguage()
                    ),

                conversation:
                    Boolean(
                        getConversation()
                    ),

                commands:
                    Boolean(
                        getCommands()
                    )

            },

            lastRequest:
                state.lastRequest,

            lastResponse:
                state.lastResponse

        };

    }

    // ========================================================
    // ERROR HANDLING
    // ========================================================

    function recordError(
        error
    ) {

        const entry = {

            id:
                createId(
                    "error"
                ),

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
            "engine-error",
            entry
        );

    }

    function clearErrors() {

        state.errors =
            [];

        emit(
            "errors-cleared"
        );

    }

    // ========================================================
    // INITIALIZATION
    // ========================================================

    async function initialize() {

        if (
            state.initialized
        ) {

            return getStatus();

        }

        state.initialized =
            true;

        /*
         * Eingebauten HalDo Provider registrieren.
         */

        registerProvider(
            "haldo",
            {

                name:
                    "HalDo AI",

                description:
                    "Interner HalDo AI Provider.",

                version:
                    "18.0.0",

                capabilities: {

                    text:
                        true,

                    commands:
                        true,

                    context:
                        true,

                    memory:
                        true,

                    streaming:
                        false

                },

                generate:
                    haldoProvider

            }
        );

        /*
         * Kernel-Modul registrieren.
         */

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

            } catch (error) {}

        }

        /*
         * Core-Verbindung beobachten.
         */

        const core =
            getCore();

        if (
            core &&
            typeof core.on ===
            "function"
        ) {

            core.on(
                "response",
                detail => {

                    emit(
                        "core-response",
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

        __haldoAI18:
            true,

        config:
            CONFIG,

        state,

        initialize,

        on,

        off,

        emit,

        registerProvider,

        unregisterProvider,

        getProvider,

        getProviders,

        setProvider,

        setModel,

        buildRequest,

        buildContext,

        buildSystemPrompt,

        normalizeResponse,

        generate,

        ask,

        respond,

        process,

        complete,

        smartAsk,

        stream,

        getStatus,

        recordError,

        clearErrors

    };

    // ========================================================
    // GLOBAL REGISTRATION
    // ========================================================

    window.HalDoAIEngine =
        api;

    window.HalDoOS.aiEngine =
        api;

    // ========================================================
    // BOOT
    // ========================================================

    async function boot() {

        try {

            await initialize();

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
// END OF PART 85
// ============================================================