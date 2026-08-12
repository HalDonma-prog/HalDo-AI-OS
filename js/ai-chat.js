// ============================================================
// HALDO AI OS 18
// AI CHAT ENGINE
// PART 79
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

    const CONFIG = {

        name:
            "HalDo AI Chat Engine",

        version:
            "18.0.0",

        maxMessages:
            500,

        maxConversations:
            50,

        defaultRole:
            "assistant",

        autoDetectLanguage:
            true,

        rememberConversation:
            true,

        enableCommands:
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

        open:
            false,

        processing:
            false,

        conversationId:
            null,

        messageCount:
            0,

        userMessages:
            0,

        assistantMessages:
            0,

        commandMessages:
            0,

        conversations:
            [],

        messages:
            [],

        currentLanguage:
            null,

        lastInput:
            null,

        lastResponse:
            null,

        errors:
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

                } catch (
                    error
                ) {

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

        } catch (
            error
        ) {}

    }

    // --------------------------------------------------------
    // MODULE ACCESS
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

    function getConversationState() {

        return (
            window.HalDoConversationState ||
            window.HalDoOS?.conversationState ||
            null
        );

    }

    function getVoice() {

        return (
            window.HalDoAIVoice ||
            window.HalDoVoice ||
            window.HalDoOS?.aiVoice ||
            window.HalDoOS?.voice ||
            null
        );

    }

    // --------------------------------------------------------
    // UTILITIES
    // --------------------------------------------------------

    function clean(
        value
    ) {

        return String(
            value ??
            ""
        ).trim();

    }

    function createId(
        prefix
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
    // CONVERSATION
    // --------------------------------------------------------

    function createConversation(
        options = {}
    ) {

        const conversation = {

            id:
                createId(
                    "conv"
                ),

            title:
                options.title ||
                "Neue Unterhaltung",

            language:
                options.language ||
                state.currentLanguage,

            createdAt:
                Date.now(),

            updatedAt:
                Date.now(),

            messageCount:
                0

        };

        state.conversations.push(
            conversation
        );

        state.conversationId =
            conversation.id;

        state.messages =
            [];

        emit(
            "conversation-created",
            conversation
        );

        return conversation;

    }

    function getConversation(
        id =
            state.conversationId
    ) {

        if (!id) {
            return null;
        }

        return state.conversations.find(
            conversation =>
                conversation.id ===
                id
        ) || null;

    }

    function ensureConversation() {

        if (
            state.conversationId &&
            getConversation()
        ) {

            return getConversation();

        }

        return createConversation();

    }

    function clearConversation() {

        state.messages =
            [];

        const conversation =
            getConversation();

        if (conversation) {

            conversation.messageCount =
                0;

            conversation.updatedAt =
                Date.now();

        }

        emit(
            "conversation-cleared",
            {
                conversation
            }
        );

        return true;

    }

    // --------------------------------------------------------
    // MESSAGES
    // --------------------------------------------------------

    function addMessage(
        role,
        content,
        metadata = {}
    ) {

        const text =
            clean(
                content
            );

        if (!text) {
            return null;
        }

        const conversation =
            ensureConversation();

        const message = {

            id:
                createId(
                    "msg"
                ),

            conversationId:
                conversation.id,

            role:
                role ||
                CONFIG.defaultRole,

            content:
                text,

            language:
                metadata.language ||
                state.currentLanguage,

            timestamp:
                Date.now(),

            ...metadata

        };

        state.messages.push(
            message
        );

        state.messageCount++;

        conversation.messageCount++;
        conversation.updatedAt =
            Date.now();

        if (
            message.role ===
            "user"
        ) {

            state.userMessages++;

        }

        if (
            message.role ===
            "assistant"
        ) {

            state.assistantMessages++;

        }

        if (
            state.messages.length >
            CONFIG.maxMessages
        ) {

            state.messages.shift();

        }

        emit(
            "message-added",
            message
        );

        return message;

    }

    function getMessages(
        options = {}
    ) {

        let messages =
            state.messages.slice();

        if (
            options.role
        ) {

            messages =
                messages.filter(
                    message =>
                        message.role ===
                        options.role
                );

        }

        if (
            Number.isInteger(
                options.limit
            )
        ) {

            messages =
                messages.slice(
                    -options.limit
                );

        }

        return messages;

    }

    // --------------------------------------------------------
    // LANGUAGE
    // --------------------------------------------------------

    function updateLanguage() {

        const language =
            getLanguage();

        if (
            language &&
            typeof language.getLanguage ===
            "function"
        ) {

            state.currentLanguage =
                language.getLanguage();

            return state.currentLanguage;

        }

        return state.currentLanguage;

    }

    function detectInputLanguage(
        text
    ) {

        const language =
            getLanguage();

        if (
            !language ||
            typeof language.detectLanguage !==
            "function"
        ) {

            return null;

        }

        try {

            return language.detectLanguage(
                text
            );

        } catch (
            error
        ) {

            return null;

        }

    }

    // --------------------------------------------------------
    // COMMAND DETECTION
    // --------------------------------------------------------

    function looksLikeCommand(
        text
    ) {

        const commands =
            getCommands();

        if (
            !commands ||
            typeof commands.findCommand !==
            "function"
        ) {

            return false;

        }

        return Boolean(
            commands.findCommand(
                text
            )
        );

    }

    async function executeCommand(
        text,
        context = {}
    ) {

        const commands =
            getCommands();

        if (
            !commands ||
            typeof commands.execute !==
            "function"
        ) {

            return {

                ok:
                    false,

                error:
                    "COMMAND_ENGINE_UNAVAILABLE"

            };

        }

        state.commandMessages++;

        return commands.execute(
            text,
            {

                ...context,

                source:
                    "ai-chat",

                conversationId:
                    state.conversationId

            }
        );

    }

    // --------------------------------------------------------
    // MEMORY
    // --------------------------------------------------------

    async function rememberMessage(
        message
    ) {

        if (
            !CONFIG.rememberConversation
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
            "store",
            "add",
            "save",
            "rememberMessage"

        ];

        for (
            const method of
            methods
        ) {

            if (
                typeof memory[method] !==
                "function"
            ) {
                continue;
            }

            try {

                await memory[method](
                    message
                );

                return true;

            } catch (
                error
            ) {}

        }

        return false;

    }

    async function loadMemoryContext(
        text
    ) {

        const memory =
            getMemory();

        if (!memory) {
            return null;
        }

        const methods = [

            "recall",
            "search",
            "retrieve",
            "getRelevant",
            "getContext"

        ];

        for (
            const method of
            methods
        ) {

            if (
                typeof memory[method] !==
                "function"
            ) {
                continue;
            }

            try {

                return await memory[method](
                    text
                );

            } catch (
                error
            ) {}

        }

        return null;

    }

    // --------------------------------------------------------
    // CORE AI
    // --------------------------------------------------------

    async function askCore(
        text,
        context = {}
    ) {

        const core =
            getCore();

        if (!core) {

            return {

                ok:
                    false,

                error:
                    "AI_CORE_UNAVAILABLE"

            };

        }

        const methods = [

            "process",
            "ask",
            "chat",
            "respond",
            "generate",
            "handle"

        ];

        const payload = {

            input:
                text,

            message:
                text,

            prompt:
                text,

            language:
                state.currentLanguage,

            conversationId:
                state.conversationId,

            messages:
                getMessages(),

            memory:
                context.memory ||
                null,

            context

        };

        for (
            const method of
            methods
        ) {

            if (
                typeof core[method] !==
                "function"
            ) {
                continue;
            }

            try {

                const result =
                    await core[method](
                        payload
                    );

                return {

                    ok:
                        true,

                    result

                };

            } catch (
                error
            ) {

                return {

                    ok:
                        false,

                    error:
                        error?.message ||
                        String(
                            error
                        )

                };

            }

        }

        return {

            ok:
                false,

            error:
                "AI_CORE_METHOD_NOT_FOUND"

        };

    }

    // --------------------------------------------------------
    // EXTRACT RESPONSE
    // --------------------------------------------------------

    function extractResponse(
        result
    ) {

        if (
            result ===
            null ||
            result ===
            undefined
        ) {

            return "";

        }

        if (
            typeof result ===
            "string"
        ) {

            return result;

        }

        if (
            typeof result.text ===
            "string"
        ) {

            return result.text;

        }

        if (
            typeof result.response ===
            "string"
        ) {

            return result.response;

        }

        if (
            typeof result.message ===
            "string"
        ) {

            return result.message;

        }

        if (
            typeof result.content ===
            "string"
        ) {

            return result.content;

        }

        if (
            result.result
        ) {

            return extractResponse(
                result.result
            );

        }

        return "";

    }

    // --------------------------------------------------------
    // VOICE OUTPUT
    // --------------------------------------------------------

    async function speak(
        text,
        options = {}
    ) {

        const voice =
            getVoice();

        if (
            !voice ||
            !text
        ) {

            return {

                ok:
                    false,

                error:
                    "VOICE_UNAVAILABLE"

            };

        }

        const methods = [

            "speak",
            "say",
            "synthesize"

        ];

        for (
            const method of
            methods
        ) {

            if (
                typeof voice[method] !==
                "function"
            ) {
                continue;
            }

            try {

                return {

                    ok:
                        true,

                    value:
                        await voice[method](
                            text,
                            {

                                language:
                                    state.currentLanguage,

                                ...options

                            }
                        )

                };

            } catch (
                error
            ) {

                return {

                    ok:
                        false,

                    error:
                        error?.message ||
                        String(
                            error
                        )

                };

            }

        }

        return {

            ok:
                false,

            error:
                "VOICE_METHOD_NOT_FOUND"

        };

    }

    // --------------------------------------------------------
    // MAIN SEND
    // --------------------------------------------------------

    async function send(
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
                    "EMPTY_MESSAGE"

            };

        }

        if (
            state.processing
        ) {

            return {

                ok:
                    false,

                error:
                    "CHAT_BUSY"

            };

        }

        state.processing =
            true;

        state.lastInput =
            text;

        updateLanguage();

        ensureConversation();

        emit(
            "processing-start",
            {
                input:
                    text
            }
        );

        try {

            /*
             * Eingabesprache erkennen.
             */

            let detected =
                null;

            if (
                CONFIG.autoDetectLanguage
            ) {

                detected =
                    detectInputLanguage(
                        text
                    );

            }

            /*
             * User message.
             */

            const userMessage =
                addMessage(
                    "user",
                    text,
                    {

                        detectedLanguage:
                            detected?.language ||
                            null,

                        language:
                            detected?.language ||
                            state.currentLanguage

                    }
                );

            await rememberMessage(
                userMessage
            );

            /*
             * Command zuerst prüfen.
             */

            const forceAI =
                options.forceAI ===
                true;

            if (
                CONFIG.enableCommands &&
                !forceAI &&
                looksLikeCommand(
                    text
                )
            ) {

                const commandResult =
                    await executeCommand(
                        text,
                        {

                            detectedLanguage:
                                detected,

                            options

                        }
                    );

                const commandText =
                    formatCommandResult(
                        commandResult
                    );

                const assistantMessage =
                    commandText
                        ? addMessage(
                            "assistant",
                            commandText,
                            {

                                type:
                                    "command-result",

                                command:
                                    commandResult
                                        .command ||
                                    null,

                                language:
                                    state.currentLanguage

                            }
                        )
                        : null;

                if (
                    assistantMessage
                ) {

                    await rememberMessage(
                        assistantMessage
                    );

                }

                state.lastResponse =
                    commandText;

                emit(
                    "response",
                    {

                        type:
                            "command",

                        input:
                            text,

                        commandResult,

                        message:
                            assistantMessage

                    }
                );

                if (
                    options.speak &&
                    commandText
                ) {

                    await speak(
                        commandText,
                        options
                    );

                }

                return {

                    ok:
                        commandResult.ok,

                    type:
                        "command",

                    command:
                        commandResult.command ||
                        null,

                    response:
                        commandText,

                    result:
                        commandResult,

                    message:
                        assistantMessage

                };

            }

            /*
             * Memory laden.
             */

            const memory =
                await loadMemoryContext(
                    text
                );

            /*
             * AI Core.
             */

            const aiResult =
                await askCore(
                    text,
                    {

                        memory,

                        detectedLanguage:
                            detected,

                        options

                    }
                );

            if (
                !aiResult.ok
            ) {

                throw new Error(
                    aiResult.error ||
                    "AI_PROCESSING_FAILED"
                );

            }

            const response =
                extractResponse(
                    aiResult.result
                );

            if (!response) {

                throw new Error(
                    "AI_EMPTY_RESPONSE"
                );

            }

            /*
             * Assistant message.
             */

            const assistantMessage =
                addMessage(
                    "assistant",
                    response,
                    {

                        type:
                            "ai-response",

                        language:
                            state.currentLanguage,

                        source:
                            "ai-core"

                    }
                );

            await rememberMessage(
                assistantMessage
            );

            state.lastResponse =
                response;

            emit(
                "response",
                {

                    type:
                        "ai",

                    input:
                        text,

                    response,

                    message:
                        assistantMessage

                }
            );

            /*
             * Optionale Stimme.
             */

            if (
                options.speak
            ) {

                await speak(
                    response,
                    options
                );

            }

            return {

                ok:
                    true,

                type:
                    "ai",

                response,

                message:
                    assistantMessage,

                result:
                    aiResult.result

            };

        } catch (
            error
        ) {

            const message =
                error?.message ||
                String(
                    error
                );

            state.errors.push({

                timestamp:
                    Date.now(),

                input:
                    text,

                error:
                    message

            });

            if (
                state.errors.length >
                100
            ) {

                state.errors.shift();

            }

            emit(
                "error",
                {

                    input:
                        text,

                    error:
                        message

                }
            );

            return {

                ok:
                    false,

                error:
                    message

            };

        } finally {

            state.processing =
                false;

            emit(
                "processing-end",
                {

                    input:
                        text

                }
            );

        }

    }

    // --------------------------------------------------------
    // COMMAND RESULT FORMATTER
    // --------------------------------------------------------

    function formatCommandResult(
        result
    ) {

        if (!result) {
            return "";
        }

        if (
            typeof result.value ===
            "string"
        ) {

            return result.value;

        }

        if (
            result.value?.value &&
            typeof result.value.value ===
            "string"
        ) {

            return result.value.value;

        }

        if (
            result.ok &&
            result.command ===
            "set-language-ai"
        ) {

            const language =
                result.value;

            if (
                language?.language
            ) {

                return (
                    "Sprache geändert: " +
                    language.language
                );

            }

            if (
                typeof language ===
                "string"
            ) {

                return (
                    "Sprache geändert: " +
                    language
                );

            }

        }

        if (
            !result.ok
        ) {

            return (
                "Der Befehl konnte nicht ausgeführt werden: " +
                (
                    result.error ||
                    "Unbekannter Fehler"
                )
            );

        }

        if (
            result.value !==
            undefined
        ) {

            try {

                return JSON.stringify(
                    result.value,
                    null,
                    2
                );

            } catch (
                error
            ) {}

        }

        return (
            "Befehl erfolgreich ausgeführt."
        );

    }

    // --------------------------------------------------------
    // OPEN / CLOSE
    // --------------------------------------------------------

    function open() {

        state.open =
            true;

        ensureConversation();

        emit(
            "opened",
            {

                conversationId:
                    state.conversationId

            }
        );

        return true;

    }

    function close() {

        state.open =
            false;

        emit(
            "closed"
        );

        return true;

    }

    function toggle() {

        return state.open
            ? close()
            : open();

    }

    // --------------------------------------------------------
    // NEW CHAT
    // --------------------------------------------------------

    function newChat(
        options = {}
    ) {

        if (
            state.conversationId
        ) {

            const old =
                getConversation();

            if (old) {

                old.updatedAt =
                    Date.now();

            }

        }

        return createConversation(
            options
        );

    }

    // --------------------------------------------------------
    // EXPORT / IMPORT
    // --------------------------------------------------------

    function exportConversation() {

        const conversation =
            getConversation();

        return {

            version:
                CONFIG.version,

            exportedAt:
                Date.now(),

            conversation,

            messages:
                getMessages()

        };

    }

    function importConversation(
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
                    "INVALID_CONVERSATION"

            };

        }

        const conversation =
            data.conversation ||
            createConversation();

        state.conversationId =
            conversation.id;

        state.messages =
            data.messages.map(
                message => ({
                    ...message
                })
            );

        const existing =
            getConversation();

        if (!existing) {

            state.conversations.push(
                conversation
            );

        }

        emit(
            "conversation-imported",
            {
                conversation
            }
        );

        return {

            ok:
                true,

            conversation,

            messages:
                state.messages

        };

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

            initialized:
                state.initialized,

            ready:
                state.ready,

            open:
                state.open,

            processing:
                state.processing,

            conversationId:
                state.conversationId,

            currentLanguage:
                state.currentLanguage,

            messageCount:
                state.messageCount,

            userMessages:
                state.userMessages,

            assistantMessages:
                state.assistantMessages,

            commandMessages:
                state.commandMessages,

            conversations:
                state.conversations.length,

            currentConversationMessages:
                state.messages.length,

            errors:
                state.errors.length,

            connections: {

                language:
                    Boolean(
                        getLanguage()
                    ),

                commands:
                    Boolean(
                        getCommands()
                    ),

                aiCore:
                    Boolean(
                        getCore()
                    ),

                memory:
                    Boolean(
                        getMemory()
                    ),

                conversationState:
                    Boolean(
                        getConversationState()
                    ),

                voice:
                    Boolean(
                        getVoice()
                    )

            }

        };

    }

    // --------------------------------------------------------
    // INITIALIZE
    // --------------------------------------------------------

    function initialize() {

        if (
            state.initialized
        ) {

            return getStatus();

        }

        state.initialized =
            true;

        updateLanguage();

        ensureConversation();

        /*
         * Sprachänderungen übernehmen.
         */

        const language =
            getLanguage();

        if (
            language &&
            typeof language.on ===
            "function"
        ) {

            language.on(
                "language-changed",
                detail => {

                    state.currentLanguage =
                        detail.language;

                    emit(
                        "language-changed",
                        detail
                    );

                }
            );

        }

        /*
         * Conversation State anbinden.
         */

        const conversationState =
            getConversationState();

        if (
            conversationState &&
            typeof conversationState.on ===
            "function"
        ) {

            try {

                conversationState.on(
                    "changed",
                    detail => {

                        emit(
                            "conversation-state-changed",
                            detail
                        );

                    }
                );

            } catch (
                error
            ) {}

        }

        /*
         * Kernel registrieren.
         */

        const kernel =
            window.HalDoKernel ||
            window.HalDoOS?.kernel;

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

            } catch (
                error
            ) {}

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

        open,

        close,

        toggle,

        send,

        ask:
            send,

        message:
            send,

        createConversation,

        newChat,

        getConversation,

        clearConversation,

        addMessage,

        getMessages,

        getStatus,

        getHistory:
            () =>
                state.messages.slice(),

        exportConversation,

        importConversation,

        detectInputLanguage,

        executeCommand,

        speak

    };

    // --------------------------------------------------------
    // GLOBAL REGISTRATION
    // --------------------------------------------------------

    window.HalDoAIChat =
        api;

    window.HalDoOS.aiChat =
        api;

    // --------------------------------------------------------
    // BOOT
    // --------------------------------------------------------

    function boot() {

        try {

            initialize();

        } catch (
            error
        ) {

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
// END OF PART 79
// ============================================================