// ============================================================
// HALDO AI OS 18
// AI CORE
// PART 84
// ============================================================

(function (window, document) {

    "use strict";

    if (
        window.HalDoAICore &&
        window.HalDoAICore.__haldoAI18
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    const CONFIG = {

        name:
            "HalDo AI Core",

        version:
            "18.0.0",

        mode:
            "Professional Ultimate Foundation",

        maxRequests:
            1000,

        commandThreshold:
            0.55,

        autoDetectLanguage:
            true,

        rememberConversation:
            true,

        enableCommands:
            true,

        enableMemory:
            true,

        enableSpeech:
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

        currentLanguage:
            "de",

        errors:
            [],

        history:
            []

    };

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
                        "[HalDoAICore]",
                        error
                    );

                }

            }

        }

        try {

            document.dispatchEvent(
                new CustomEvent(
                    `haldo:ai-core:${event}`,
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
        prefix = "ai"
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
    // MODULE CONNECTIONS
    // --------------------------------------------------------

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

    function getChat() {

        return (
            window.HalDoAIChat ||
            window.HalDoOS?.aiChat ||
            null
        );

    }

    function getEngine() {

        return (
            window.HalDoAIEngine ||
            window.HalDoOS?.aiEngine ||
            null
        );

    }

    function getSpeech() {

        return (
            window.HalDoAISpeech ||
            window.HalDoOS?.aiSpeech ||
            null
        );

    }

    function getVoice() {

        return (
            window.HalDoAIVoice ||
            window.HalDoOS?.aiVoice ||
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

    // --------------------------------------------------------
    // LANGUAGE
    // --------------------------------------------------------

    function detectLanguage(
        text
    ) {

        const language =
            getLanguage();

        if (
            !CONFIG.autoDetectLanguage ||
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

            return result;

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

    async function setLanguage(
        language,
        options = {}
    ) {

        const manager =
            getLanguage();

        if (
            !manager ||
            typeof manager.setLanguage !==
            "function"
        ) {

            return {

                ok:
                    false,

                error:
                    "LANGUAGE_ENGINE_UNAVAILABLE"

            };

        }

        try {

            const result =
                await manager.setLanguage(
                    language,
                    options
                );

            if (
                result?.ok
            ) {

                state.currentLanguage =
                    result.language ||
                    language;

            }

            return result;

        } catch (error) {

            recordError(
                error
            );

            return {

                ok:
                    false,

                error:
                    error.message

            };

        }

    }

    // --------------------------------------------------------
    // COMMAND PROCESSING
    // --------------------------------------------------------

    function detectCommand(
        text
    ) {

        const commands =
            getCommands();

        if (
            !CONFIG.enableCommands ||
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

            return commands.detectCommand(
                text
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

    async function executeCommand(
        text,
        options = {}
    ) {

        const commands =
            getCommands();

        if (
            !CONFIG.enableCommands ||
            !commands ||
            typeof commands.execute !==
            "function"
        ) {

            return {

                ok:
                    false,

                handled:
                    false,

                error:
                    "COMMAND_ENGINE_UNAVAILABLE"

            };

        }

        try {

            const result =
                await commands.execute(
                    text,
                    options
                );

            return {

                ...result,

                handled:
                    Boolean(
                        result?.command ||
                        result?.result?.type
                    )

            };

        } catch (error) {

            recordError(
                error
            );

            return {

                ok:
                    false,

                handled:
                    false,

                error:
                    error.message

            };

        }

    }

    // --------------------------------------------------------
    // MEMORY
    // --------------------------------------------------------

    async function remember(
        data
    ) {

        if (
            !CONFIG.enableMemory
        ) {

            return false;

        }

        const memory =
            getMemory();

        if (!memory) {
            return false;
        }

        const methods = [

            "remember",
            "add",
            "store",
            "save",
            "rememberMessage"

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

                await memory[method](
                    data
                );

                return true;

            } catch (error) {}

        }

        return false;

    }

    async function recall(
        query,
        options = {}
    ) {

        if (
            !CONFIG.enableMemory
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
                        options
                    );

                return Array.isArray(
                    result
                )
                    ? result
                    : result
                        ? [result]
                        : [];

            } catch (error) {}

        }

        return [];

    }

    // --------------------------------------------------------
    // CONVERSATION
    // --------------------------------------------------------

    async function addMessage(
        message
    ) {

        if (
            !CONFIG.rememberConversation
        ) {
            return false;
        }

        const conversation =
            getConversation();

        if (!conversation) {
            return false;
        }

        const methods = [

            "addMessage",
            "add",
            "pushMessage",
            "appendMessage"

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

                await conversation[method](
                    message
                );

                return true;

            } catch (error) {}

        }

        return false;

    }

    function getMessages(
        limit = 50
    ) {

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

            } catch (error) {}

        }

        return [];

    }

    // --------------------------------------------------------
    // AI ENGINE
    // --------------------------------------------------------

    async function generateResponse(
        input,
        context = {}
    ) {

        /*
         * Bereits vorhandene AI Engine verwenden.
         */

        const engine =
            getEngine();

        if (
            engine
        ) {

            const methods = [

                "generate",
                "generateResponse",
                "respond",
                "process",
                "ask",
                "complete"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof engine[method] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await engine[method](
                            input,
                            context
                        );

                    if (
                        result !==
                        undefined &&
                        result !==
                        null
                    ) {

                        return normalizeAIResult(
                            result
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
         * Vorhandenen AI Chat verwenden.
         */

        const chat =
            getChat();

        if (
            chat
        ) {

            const methods = [

                "sendMessage",
                "send",
                "ask",
                "respond",
                "processMessage"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof chat[method] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await chat[method](
                            input,
                            context
                        );

                    if (
                        result !==
                        undefined &&
                        result !==
                        null
                    ) {

                        return normalizeAIResult(
                            result
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
         * Kein Backend vorhanden:
         * Core meldet sauber zurück,
         * statt einen falschen AI-Response
         * zu erfinden.
         */

        return {

            ok:
                false,

            type:
                "no-ai-provider",

            message:
                "Kein aktiver AI-Provider ist momentan verbunden.",

            provider:
                null

        };

    }

    function normalizeAIResult(
        result
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
                    result

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
                    result

            };

        }

        return {

            ok:
                result.ok !== false,

            ...result,

            text:
                result.text ??
                result.content ??
                result.message ??
                ""

        };

    }

    // --------------------------------------------------------
    // MAIN REQUEST PIPELINE
    // --------------------------------------------------------

    async function process(
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
                    "EMPTY_INPUT",

                text:
                    ""

            };

        }

        const requestId =
            createId(
                "request"
            );

        const startedAt =
            Date.now();

        state.processing =
            true;

        state.requestCount++;

        const request = {

            id:
                requestId,

            input:
                text,

            timestamp:
                startedAt,

            language:
                state.currentLanguage,

            options

        };

        state.lastRequest =
            request;

        emit(
            "request-start",
            {
                request
            }
        );

        try {

            /*
             * 1. Sprache erkennen
             */

            const language =
                detectLanguage(
                    text
                );

            request.language =
                language?.language ||
                state.currentLanguage;

            /*
             * 2. Eingabe speichern
             */

            await addMessage({

                role:
                    "user",

                content:
                    text,

                text:
                    text,

                language:
                    request.language,

                timestamp:
                    Date.now()

            });

            /*
             * 3. Relevante Erinnerungen
             */

            const memories =
                await recall(
                    text,
                    {
                        limit:
                            options.memoryLimit ||
                            10
                    }
                );

            /*
             * 4. Befehl erkennen
             */

            const detectedCommand =
                detectCommand(
                    text
                );

            emit(
                "command-detected",
                {

                    input:
                        text,

                    detection:
                        detectedCommand

                }
            );

            /*
             * 5. Wenn klarer Systembefehl:
             * Befehl ausführen.
             */

            if (
                CONFIG.enableCommands &&
                detectedCommand?.command &&
                detectedCommand.confidence >=
                    CONFIG.commandThreshold &&
                !options.forceAI
            ) {

                const commandResult =
                    await executeCommand(
                        text,
                        options
                    );

                if (
                    commandResult &&
                    (
                        commandResult.ok ||
                        commandResult.result ||
                        commandResult.requiresConfirmation
                    )
                ) {

                    const response = {

                        ok:
                            commandResult.ok !==
                            false,

                        type:
                            "command",

                        requestId,

                        input:
                            text,

                        language:
                            request.language,

                        command:
                            detectedCommand.command.id,

                        confidence:
                            detectedCommand.confidence,

                        result:
                            commandResult,

                        timestamp:
                            Date.now(),

                        duration:
                            Date.now() -
                            startedAt

                    };

                    state.lastResponse =
                        response;

                    state.successfulRequests++;

                    await addMessage({

                        role:
                            "system",

                        type:
                            "command-result",

                        command:
                            detectedCommand.command.id,

                        content:
                            response,

                        timestamp:
                            Date.now()

                    });

                    await remember({

                        type:
                            "command",

                        input:
                            text,

                        command:
                            detectedCommand.command.id,

                        result:
                            commandResult,

                        timestamp:
                            Date.now()

                    });

                    emit(
                        "response",
                        {
                            response
                        }
                    );

                    return response;

                }

            }

            /*
             * 6. AI-Kontext vorbereiten
             */

            const context = {

                requestId,

                language:
                    request.language,

                detectedLanguage:
                    language,

                memories,

                messages:
                    getMessages(
                        options.historyLimit ||
                        50
                    ),

                command:
                    detectedCommand,

                system:
                    {

                        mode:
                            CONFIG.mode,

                        version:
                            CONFIG.version

                    }

            };

            /*
             * 7. AI Engine / Chat
             */

            const aiResult =
                await generateResponse(
                    text,
                    context
                );

            /*
             * 8. AI Antwort speichern
             */

            const response = {

                ok:
                    aiResult.ok !==
                    false,

                type:
                    aiResult.type ||
                    "text",

                requestId,

                input:
                    text,

                language:
                    request.language,

                text:
                    aiResult.text ||
                    "",

                content:
                    aiResult.content ||
                    aiResult.text ||
                    "",

                result:
                    aiResult,

                timestamp:
                    Date.now(),

                duration:
                    Date.now() -
                    startedAt

            };

            state.lastResponse =
                response;

            if (
                response.ok
            ) {

                state.successfulRequests++;

            } else {

                state.failedRequests++;

            }

            await addMessage({

                role:
                    "assistant",

                content:
                    response.text,

                text:
                    response.text,

                language:
                    request.language,

                requestId,

                timestamp:
                    Date.now()

            });

            await remember({

                type:
                    "conversation",

                requestId,

                language:
                    request.language,

                user:
                    text,

                assistant:
                    response.text,

                timestamp:
                    Date.now()

            });

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
                    "error",

                requestId,

                input:
                    text,

                language:
                    state.currentLanguage,

                error:
                    error.message ||
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

            const finishedAt =
                Date.now();

            request.finishedAt =
                finishedAt;

            request.duration =
                finishedAt -
                startedAt;

            state.history.push(
                request
            );

            if (
                state.history.length >
                CONFIG.maxRequests
            ) {

                state.history.shift();

            }

            emit(
                "request-end",
                {
                    request
                }
            );

        }

    }

    // --------------------------------------------------------
    // CONVENIENCE METHODS
    // --------------------------------------------------------

    async function ask(
        input,
        options = {}
    ) {

        return process(
            input,
            options
        );

    }

    async function send(
        input,
        options = {}
    ) {

        return process(
            input,
            options
        );

    }

    async function execute(
        input,
        options = {}
    ) {

        return process(
            input,
            options
        );

    }

    // --------------------------------------------------------
    // SPEECH
    // --------------------------------------------------------

    async function speak(
        text,
        options = {}
    ) {

        if (
            !CONFIG.enableSpeech
        ) {

            return {

                ok:
                    false,

                error:
                    "SPEECH_DISABLED"

            };

        }

        const voice =
            getVoice();

        const speech =
            getSpeech();

        const target =
            voice ||
            speech;

        if (!target) {

            return {

                ok:
                    false,

                error:
                    "VOICE_ENGINE_UNAVAILABLE"

            };

        }

        const methods = [

            "speak",
            "say",
            "synthesize"

        ];

        for (
            const method of methods
        ) {

            if (
                typeof target[method] !==
                "function"
            ) {
                continue;
            }

            try {

                const result =
                    await target[method](
                        text,
                        options
                    );

                return {

                    ok:
                        result !==
                        false,

                    result

                };

            } catch (error) {

                recordError(
                    error
                );

            }

        }

        return {

            ok:
                false,

            error:
                "SPEAK_METHOD_UNAVAILABLE"

        };

    }

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    function getStatus() {

        const language =
            getLanguage();

        const commands =
            getCommands();

        const memory =
            getMemory();

        const conversation =
            getConversation();

        const engine =
            getEngine();

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

            currentLanguage:
                state.currentLanguage,

            modules: {

                language:
                    Boolean(
                        language
                    ),

                commands:
                    Boolean(
                        commands
                    ),

                memory:
                    Boolean(
                        memory
                    ),

                conversation:
                    Boolean(
                        conversation
                    ),

                engine:
                    Boolean(
                        engine
                    ),

                chat:
                    Boolean(
                        getChat()
                    ),

                speech:
                    Boolean(
                        getSpeech()
                    ),

                voice:
                    Boolean(
                        getVoice()
                    )

            },

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

        /*
         * Aktuelle Sprache übernehmen.
         */

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

        /*
         * Sprachwechsel beobachten.
         */

        if (
            language &&
            typeof language.on ===
            "function"
        ) {

            language.on(
                "language-changed",
                detail => {

                    if (
                        detail?.language
                    ) {

                        state.currentLanguage =
                            detail.language;

                    }

                    emit(
                        "language-changed",
                        detail
                    );

                }
            );

        }

        /*
         * Command Events verbinden.
         */

        const commands =
            getCommands();

        if (
            commands &&
            typeof commands.on ===
            "function"
        ) {

            commands.on(
                "executed",
                detail => {

                    emit(
                        "command-executed",
                        detail
                    );

                }
            );

            commands.on(
                "error",
                detail => {

                    emit(
                        "command-error",
                        detail
                    );

                }
            );

        }

        /*
         * Kernel registrieren.
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
                    "ai-core",
                    api
                );

            } catch (error) {}

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

    // --------------------------------------------------------
    // PUBLIC API
    // --------------------------------------------------------

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

        process,

        ask,

        send,

        execute,

        generateResponse,

        detectLanguage,

        setLanguage,

        detectCommand,

        executeCommand,

        remember,

        recall,

        addMessage,

        getMessages,

        speak,

        getStatus,

        getModules: () => ({

            language:
                getLanguage(),

            commands:
                getCommands(),

            memory:
                getMemory(),

            conversation:
                getConversation(),

            chat:
                getChat(),

            engine:
                getEngine(),

            speech:
                getSpeech(),

            voice:
                getVoice()

        })

    };

    // --------------------------------------------------------
    // GLOBAL REGISTRATION
    // --------------------------------------------------------

    window.HalDoAICore =
        api;

    window.HalDoOS.aiCore =
        api;

    /*
     * Kompatibilitätsalias.
     */

    window.HalDoAI =
        window.HalDoAI ||
        api;

    // --------------------------------------------------------
    // BOOT
    // --------------------------------------------------------

    async function boot() {

        try {

            await initialize();

        } catch (error) {

            recordError(
                error
            );

            console.error(
                "[HalDoAICore] " +
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
// END OF PART 84
// ============================================================