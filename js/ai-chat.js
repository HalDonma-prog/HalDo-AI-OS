// ============================================================
// HALDO AI OS 18
// AI CHAT SYSTEM
// PART 86
// Professional Ultimate Foundation
// ============================================================

(function (window, document) {

    "use strict";

    if (
        window.HalDoAIChat &&
        window.HalDoAIChat.__haldoAI18
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
            "HalDo AI Chat",

        version:
            "18.0.0",

        mode:
            "Professional Ultimate Foundation",

        maxMessages:
            500,

        historyLimit:
            50,

        memoryLimit:
            10,

        autoScroll:
            true,

        autoSave:
            true,

        enableCommands:
            true,

        enableMemory:
            true,

        enableLanguage:
            true,

        enableVoice:
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

        typing:
            false,

        messageCount:
            0,

        conversationId:
            null,

        currentLanguage:
            "de",

        messages:
            [],

        pendingRequest:
            null,

        lastUserMessage:
            null,

        lastAssistantMessage:
            null,

        lastResponse:
            null,

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
            .add(
                callback
            );

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
            listeners.get(
                event
            );

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
            listeners.get(
                event
            );

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
                        "[HalDoAIChat]",
                        error
                    );

                }

            }

        }

        try {

            document.dispatchEvent(
                new CustomEvent(
                    `haldo:ai-chat:${event}`,
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
        prefix = "message"
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

    function getCore() {

        return (
            window.HalDoAICore ||
            window.HalDoOS?.aiCore ||
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

    function getLanguage() {

        return (
            window.HalDoAILanguage ||
            window.HalDoOS?.aiLanguage ||
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

    // ========================================================
    // MESSAGE CREATION
    // ========================================================

    function createMessage(
        role,
        content,
        metadata = {}
    ) {

        return {

            id:
                createId(
                    "message"
                ),

            role:
                role,

            content:
                clean(
                    content
                ),

            text:
                clean(
                    content
                ),

            timestamp:
                Date.now(),

            conversationId:
                state.conversationId,

            language:
                metadata.language ||
                state.currentLanguage,

            ...metadata

        };

    }

    // ========================================================
    // LOCAL MESSAGE STORE
    // ========================================================

    function addLocalMessage(
        message
    ) {

        if (!message) {
            return null;
        }

        state.messages.push(
            message
        );

        state.messageCount =
            state.messages.length;

        if (
            state.messages.length >
            CONFIG.maxMessages
        ) {

            state.messages.shift();

        }

        emit(
            "message-added",
            {
                message
            }
        );

        return message;

    }

    function getMessages(
        limit = CONFIG.historyLimit
    ) {

        const amount =
            Math.max(
                1,
                Number(
                    limit
                ) || CONFIG.historyLimit
            );

        return state.messages
            .slice(
                -amount
            );

    }

    function clearLocalMessages() {

        state.messages =
            [];

        state.messageCount =
            0;

        emit(
            "messages-cleared"
        );

    }

    // ========================================================
    // CONVERSATION CONNECTION
    // ========================================================

    async function saveToConversation(
        message
    ) {

        if (
            !CONFIG.autoSave
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
                ](
                    message
                );

                return true;

            } catch (error) {}

        }

        return false;

    }

    async function loadConversation() {

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
                typeof conversation[
                    method
                ] !==
                "function"
            ) {
                continue;
            }

            try {

                const result =
                    await conversation[
                        method
                    ](
                        CONFIG.historyLimit
                    );

                if (
                    Array.isArray(
                        result
                    )
                ) {

                    state.messages =
                        result.slice(
                            -CONFIG.maxMessages
                        );

                    state.messageCount =
                        state.messages.length;

                    return state.messages;

                }

            } catch (error) {}

        }

        return [];

    }

    // ========================================================
    // MEMORY
    // ========================================================

    async function rememberMessage(
        message
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

            "rememberMessage",
            "remember",
            "add",
            "store",
            "save"

        ];

        for (
            const method of methods
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

                await memory[
                    method
                ](
                    message
                );

                return true;

            } catch (error) {}

        }

        return false;

    }

    async function recallMemory(
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
                        query,
                        {
                            limit:
                                options.limit ||
                                CONFIG.memoryLimit
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

            } catch (error) {}

        }

        return [];

    }

    // ========================================================
    // LANGUAGE
    // ========================================================

    function detectLanguage(
        text
    ) {

        if (
            !CONFIG.enableLanguage
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

    // ========================================================
    // COMMAND DETECTION
    // ========================================================

    function detectCommand(
        text
    ) {

        if (
            !CONFIG.enableCommands
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
                        result?.result
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

    // ========================================================
    // CONTEXT BUILDING
    // ========================================================

    async function buildContext(
        text,
        options = {}
    ) {

        const language =
            detectLanguage(
                text
            );

        const memories =
            await recallMemory(
                text,
                {
                    limit:
                        options.memoryLimit ||
                        CONFIG.memoryLimit
                }
            );

        const context = {

            input:
                text,

            language:
                language?.language ||
                state.currentLanguage,

            languageDetection:
                language,

            messages:
                getMessages(
                    options.historyLimit ||
                    CONFIG.historyLimit
                ),

            memories,

            conversationId:
                state.conversationId,

            metadata:
                options.metadata ||
                {}

        };

        return context;

    }

    // ========================================================
    // AI REQUEST
    // ========================================================

    async function requestAI(
        text,
        context,
        options = {}
    ) {

        /*
         * AI Core bevorzugen.
         */

        const core =
            getCore();

        if (
            core
        ) {

            const methods = [

                "process",
                "ask",
                "send",
                "execute"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof core[
                        method
                    ] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await core[
                            method
                        ](
                            text,
                            {
                                ...options,

                                ...context
                            }
                        );

                    if (
                        result !==
                        undefined &&
                        result !==
                        null
                    ) {

                        return normalizeResponse(
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
         * Direkter AI Engine Fallback.
         */

        const engine =
            getEngine();

        if (
            engine
        ) {

            const methods = [

                "smartAsk",
                "generate",
                "ask",
                "respond",
                "process",
                "complete"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof engine[
                        method
                    ] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await engine[
                            method
                        ](
                            text,
                            context,
                            options
                        );

                    if (
                        result !==
                        undefined &&
                        result !==
                        null
                    ) {

                        return normalizeResponse(
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

        return {

            ok:
                false,

            type:
                "ai-unavailable",

            error:
                "AI_ENGINE_UNAVAILABLE",

            text:
                "",

            content:
                ""

        };

    }

    // ========================================================
    // RESPONSE NORMALIZATION
    // ========================================================

    function normalizeResponse(
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

                text:
                    "",

                content:
                    "",

                error:
                    "EMPTY_RESPONSE"

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

                content:
                    String(
                        result
                    )

            };

        }

        const text =
            result.text ??
            result.content ??
            result.message ??
            result.output ??
            "";

        return {

            ...result,

            ok:
                result.ok !==
                false,

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
                    )

        };

    }

    // ========================================================
    // SEND MESSAGE
    // ========================================================

    async function sendMessage(
        content,
        options = {}
    ) {

        const text =
            clean(
                content
            );

        if (!text) {

            return {

                ok:
                    false,

                error:
                    "EMPTY_MESSAGE"

            };

        }

        if (
            state.processing
        ) {

            if (
                options.allowConcurrent !==
                true
            ) {

                return {

                    ok:
                        false,

                    error:
                        "CHAT_BUSY",

                    message:
                        "HalDo AI verarbeitet bereits eine Anfrage."

                };

            }

        }

        state.processing =
            true;

        state.typing =
            true;

        const requestId =
            createId(
                "chat"
            );

        state.pendingRequest =
            {

                id:
                    requestId,

                input:
                    text,

                timestamp:
                    Date.now()

            };

        emit(
            "typing-start",
            {
                requestId
            }
        );

        emit(
            "send-start",
            {
                requestId,

                text
            }
        );

        try {

            /*
             * Sprache bestimmen.
             */

            const language =
                detectLanguage(
                    text
                );

            /*
             * User Message.
             */

            const userMessage =
                createMessage(
                    "user",
                    text,
                    {

                        requestId,

                        language:
                            language?.language ||
                            state.currentLanguage

                    }
                );

            state.lastUserMessage =
                userMessage;

            addLocalMessage(
                userMessage
            );

            await saveToConversation(
                userMessage
            );

            await rememberMessage(
                userMessage
            );

            /*
             * Command Detection.
             */

            const detection =
                detectCommand(
                    text
                );

            emit(
                "command-detected",
                {
                    requestId,

                    detection
                }
            );

            /*
             * Klare Commands direkt ausführen.
             */

            if (
                CONFIG.enableCommands &&
                detection?.command &&
                detection.confidence >=
                    0.55 &&
                options.forceAI !==
                    true
            ) {

                const commandResult =
                    await executeCommand(
                        text,
                        options
                    );

                /*
                 * Nur echte Command-Ergebnisse
                 * als Command-Antwort behandeln.
                 */

                if (
                    commandResult &&
                    (
                        commandResult.ok ||
                        commandResult.result ||
                        commandResult.requiresConfirmation
                    )
                ) {

                    const commandText =
                        commandResult
                            ?.result
                            ?.message ||
                        (
                            commandResult
                                .requiresConfirmation
                                ? "Bitte bestätige diesen Befehl."
                                : "Befehl ausgeführt."
                        );

                    const assistantMessage =
                        createMessage(
                            "assistant",
                            commandText,
                            {

                                type:
                                    "command-result",

                                requestId,

                                command:
                                    detection.command.id,

                                commandResult

                            }
                        );

                    state.lastAssistantMessage =
                        assistantMessage;

                    addLocalMessage(
                        assistantMessage
                    );

                    await saveToConversation(
                        assistantMessage
                    );

                    state.lastResponse =
                        {

                            ok:
                                commandResult.ok !==
                                false,

                            type:
                                "command",

                            requestId,

                            command:
                                detection.command.id,

                            confidence:
                                detection.confidence,

                            result:
                                commandResult,

                            text:
                                commandText,

                            content:
                                commandText

                        };

                    emit(
                        "response",
                        {
                            response:
                                state.lastResponse,

                            message:
                                assistantMessage

                        }
                    );

                    return state.lastResponse;

                }

            }

            /*
             * AI Context.
             */

            const context =
                await buildContext(
                    text,
                    options
                );

            /*
             * AI Engine.
             */

            const result =
                await requestAI(
                    text,
                    context,
                    {

                        ...options,

                        requestId

                    }
                );

            const response =
                normalizeResponse(
                    result
                );

            response.requestId =
                requestId;

            response.language =
                context.language;

            response.timestamp =
                Date.now();

            /*
             * Assistant Message.
             */

            const assistantMessage =
                createMessage(
                    "assistant",
                    response.text,
                    {

                        requestId,

                        type:
                            response.type ||
                            "text",

                        language:
                            context.language,

                        response

                    }
                );

            state.lastAssistantMessage =
                assistantMessage;

            state.lastResponse =
                response;

            addLocalMessage(
                assistantMessage
            );

            await saveToConversation(
                assistantMessage
            );

            await rememberMessage(
                assistantMessage
            );

            emit(
                "response",
                {

                    response,

                    message:
                        assistantMessage

                }
            );

            return response;

        } catch (error) {

            recordError(
                error
            );

            const response = {

                ok:
                    false,

                type:
                    "error",

                requestId,

                error:
                    error.message ||
                    String(
                        error
                    ),

                text:
                    "",

                content:
                    ""

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

            state.typing =
                false;

            state.pendingRequest =
                null;

            emit(
                "typing-end",
                {
                    requestId
                }
            );

            emit(
                "send-end",
                {
                    requestId
                }
            );

        }

    }

    // ========================================================
    // ALIASES
    // ========================================================

    async function send(
        content,
        options = {}
    ) {

        return sendMessage(
            content,
            options
        );

    }

    async function ask(
        content,
        options = {}
    ) {

        return sendMessage(
            content,
            options
        );

    }

    async function processMessage(
        content,
        options = {}
    ) {

        return sendMessage(
            content,
            options
        );

    }

    // ========================================================
    // NEW CONVERSATION
    // ========================================================

    async function newConversation(
        options = {}
    ) {

        const conversation =
            getConversation();

        state.conversationId =
            createId(
                "conversation"
            );

        clearLocalMessages();

        if (
            conversation
        ) {

            const methods = [

                "createConversation",
                "newConversation",
                "startConversation",
                "reset"

            ];

            for (
                const method of methods
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
                        await conversation[
                            method
                        ](
                            {
                                id:
                                    state.conversationId,

                                ...options

                            }
                        );

                    if (
                        result?.id
                    ) {

                        state.conversationId =
                            result.id;

                    }

                    break;

                } catch (error) {}

            }

        }

        emit(
            "conversation-new",
            {
                conversationId:
                    state.conversationId
            }
        );

        return {

            ok:
                true,

            conversationId:
                state.conversationId

        };

    }

    // ========================================================
    // CLEAR CHAT
    // ========================================================

    async function clearMessages(
        options = {}
    ) {

        clearLocalMessages();

        const conversation =
            getConversation();

        if (
            conversation
        ) {

            for (
                const method of [
                    "clearMessages",
                    "clear",
                    "clearConversation"
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
                    ](
                        options
                    );

                    break;

                } catch (error) {}

            }

        }

        emit(
            "chat-cleared"
        );

        return {

            ok:
                true

        };

    }

    // ========================================================
    // VOICE INPUT
    // ========================================================

    async function startVoiceInput(
        options = {}
    ) {

        if (
            !CONFIG.enableVoice
        ) {

            return {

                ok:
                    false,

                error:
                    "VOICE_DISABLED"

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

            "startListening",
            "listen",
            "start",
            "recognize"

        ];

        for (
            const method of methods
        ) {

            if (
                typeof target[
                    method
                ] !==
                "function"
            ) {
                continue;
            }

            try {

                const result =
                    await target[
                        method
                    ](
                        options
                    );

                emit(
                    "voice-start",
                    {
                        result
                    }
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
                "VOICE_INPUT_UNAVAILABLE"

        };

    }

    // ========================================================
    // TEXT TO SPEECH
    // ========================================================

    async function speak(
        text,
        options = {}
    ) {

        if (
            !CONFIG.enableVoice
        ) {

            return {

                ok:
                    false,

                error:
                    "VOICE_DISABLED"

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
                    "SPEECH_ENGINE_UNAVAILABLE"

            };

        }

        for (
            const method of [
                "speak",
                "say",
                "synthesize"
            ]
        ) {

            if (
                typeof target[
                    method
                ] !==
                "function"
            ) {
                continue;
            }

            try {

                const result =
                    await target[
                        method
                    ](
                        text,
                        options
                    );

                emit(
                    "speech",
                    {
                        text,

                        result
                    }
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
                "SPEECH_METHOD_UNAVAILABLE"

        };

    }

    // ========================================================
    // EXPORT / IMPORT
    // ========================================================

    function exportConversation() {

        return {

            version:
                CONFIG.version,

            conversationId:
                state.conversationId,

            language:
                state.currentLanguage,

            messages:
                getMessages(
                    CONFIG.maxMessages
                ),

            exportedAt:
                Date.now()

        };

    }

    async function importConversation(
        data
    ) {

        if (
            !data ||
            !Array.isArray(
                data.messages
            )
        ) {

            return {

                ok:
                    false,

                error:
                    "INVALID_CONVERSATION_DATA"

            };

        }

        state.conversationId =
            data.conversationId ||
            createId(
                "conversation"
            );

        state.currentLanguage =
            data.language ||
            state.currentLanguage;

        state.messages =
            data.messages
                .slice(
                    -CONFIG.maxMessages
                );

        state.messageCount =
            state.messages.length;

        emit(
            "conversation-imported",
            {
                conversationId:
                    state.conversationId
            }
        );

        return {

            ok:
                true,

            conversationId:
                state.conversationId,

            messageCount:
                state.messageCount

        };

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

            typing:
                state.typing,

            messageCount:
                state.messageCount,

            conversationId:
                state.conversationId,

            currentLanguage:
                state.currentLanguage,

            modules: {

                core:
                    Boolean(
                        getCore()
                    ),

                engine:
                    Boolean(
                        getEngine()
                    ),

                commands:
                    Boolean(
                        getCommands()
                    ),

                memory:
                    Boolean(
                        getMemory()
                    ),

                conversation:
                    Boolean(
                        getConversation()
                    ),

                language:
                    Boolean(
                        getLanguage()
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

            lastUserMessage:
                state.lastUserMessage,

            lastAssistantMessage:
                state.lastAssistantMessage,

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

            id:
                createId(
                    "chat-error"
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
            "error",
            entry
        );

    }

    function clearErrors() {

        state.errors =
            [];

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

        state.conversationId =
            createId(
                "conversation"
            );

        /*
         * Vorhandene Unterhaltung laden.
         */

        await loadConversation();

        /*
         * Sprache übernehmen.
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
         * Language Events.
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
         * AI Core Events.
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

        /*
         * Kernel Registrierung.
         */

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
                    "ai-chat",
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

        sendMessage,

        send,

        ask,

        processMessage,

        newConversation,

        clearMessages,

        getMessages,

        loadConversation,

        buildContext,

        detectLanguage,

        detectCommand,

        executeCommand,

        recallMemory,

        rememberMessage,

        startVoiceInput,

        speak,

        exportConversation,

        importConversation,

        normalizeResponse,

        getStatus,

        recordError,

        clearErrors

    };

    // ========================================================
    // GLOBAL REGISTRATION
    // ========================================================

    window.HalDoAIChat =
        api;

    window.HalDoOS.aiChat =
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
                "[HalDoAIChat] " +
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
// END OF PART 86
// ============================================================