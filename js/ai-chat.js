// ============================================================
// HALDO AI OS 18
// AI CHAT MANAGER
// PART 74
// ============================================================
// Zentraler Gesprächsmanager.
//
// Verbindung:
//
// UI / AI Interface
//        ↓
//    ai-chat.js
//        ↓
//    ai-core.js
//        ↓
//   ai-engine.js
//        ↓
//      Memory
//
// Öffentliche APIs:
//
// window.HalDoAIChat
// window.HalDoOS.aiChat
//
// Bestehende Module werden nicht blind überschrieben.
// ============================================================

(function (window, document) {

    "use strict";

    // --------------------------------------------------------
    // Duplicate Guard
    // --------------------------------------------------------

    if (
        window.HalDoAIChat &&
        window.HalDoAIChat.__haldoAI18
    ) {
        return;
    }

    // --------------------------------------------------------
    // Namespace
    // --------------------------------------------------------

    window.HalDoOS =
        window.HalDoOS || {};

    // --------------------------------------------------------
    // Configuration
    // --------------------------------------------------------

    const CONFIG = {

        name:
            "HalDo AI Chat",

        version:
            "18.0.0",

        maxMessages:
            200,

        maxMessageLength:
            12000,

        autoSave:
            true,

        autoScroll:
            true,

        debug:
            false

    };

    // --------------------------------------------------------
    // State
    // --------------------------------------------------------

    const state = {

        initialized:
            false,

        ready:
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

        messages:
            [],

        startedAt:
            null,

        lastUserMessage:
            null,

        lastAssistantMessage:
            null,

        errors:
            []

    };

    // --------------------------------------------------------
    // Event Bus
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
            set.size === 0
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
                        "[HalDoAIChat] Event error:",
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
    // Logging
    // --------------------------------------------------------

    function log(
        ...args
    ) {

        if (
            CONFIG.debug
        ) {

            console.log(
                "[HalDoAIChat]",
                ...args
            );

        }

    }

    // --------------------------------------------------------
    // Error Handling
    // --------------------------------------------------------

    function recordError(
        error,
        context = {}
    ) {

        const entry = {

            timestamp:
                Date.now(),

            message:
                error instanceof Error
                    ? error.message
                    : String(error),

            context

        };

        state.errors.push(
            entry
        );

        if (
            state.errors.length >
            50
        ) {

            state.errors.shift();

        }

        emit(
            "error",
            entry
        );

        return entry;
    }

    // --------------------------------------------------------
    // ID Generator
    // --------------------------------------------------------

    function createId(
        prefix = "msg"
    ) {

        return (
            prefix +
            "-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 9)
        );

    }

    // --------------------------------------------------------
    // Conversation ID
    // --------------------------------------------------------

    function createConversationId() {

        return createId(
            "conversation"
        );

    }

    // --------------------------------------------------------
    // Ensure Conversation
    // --------------------------------------------------------

    function ensureConversation() {

        if (
            !state.conversationId
        ) {

            state.conversationId =
                createConversationId();

            emit(
                "conversation-created",
                {
                    conversationId:
                        state.conversationId
                }
            );

        }

        return state.conversationId;

    }

    // --------------------------------------------------------
    // Text Normalization
    // --------------------------------------------------------

    function normalizeText(
        input
    ) {

        let text;

        if (
            typeof input ===
            "string"
        ) {

            text =
                input;

        } else {

            text =
                input?.text ??
                input?.message ??
                input?.content ??
                "";

        }

        text =
            String(
                text
            )
            .trim();

        if (
            text.length >
            CONFIG.maxMessageLength
        ) {

            text =
                text.slice(
                    0,
                    CONFIG.maxMessageLength
                );

        }

        return text;

    }

    // --------------------------------------------------------
    // Resolve Modules
    // --------------------------------------------------------

    function resolve(
        names
    ) {

        if (
            typeof names ===
            "string"
        ) {

            names =
                [names];

        }

        for (
            const name of names
        ) {

            if (
                window[name]
            ) {

                return window[name];

            }

            if (
                window.HalDoOS &&
                window.HalDoOS[name]
            ) {

                return window.HalDoOS[name];

            }

        }

        return null;

    }

    function getCore() {

        return resolve(
            [
                "HalDoAICore",
                "aiCore"
            ]
        );

    }

    function getEngine() {

        return resolve(
            [
                "HalDoAIEngine",
                "aiEngine"
            ]
        );

    }

    function getMemory() {

        return resolve(
            [
                "HalDoAIMemory",
                "aiMemory"
            ]
        );

    }

    // --------------------------------------------------------
    // Message Creation
    // --------------------------------------------------------

    function createMessage(
        role,
        content,
        metadata = {}
    ) {

        ensureConversation();

        return {

            id:
                createId(
                    "message"
                ),

            conversationId:
                state.conversationId,

            role,

            content:
                normalizeText(
                    content
                ),

            timestamp:
                Date.now(),

            metadata:
                {
                    ...metadata
                }

        };

    }

    // --------------------------------------------------------
    // Add Message
    // --------------------------------------------------------

    function addMessage(
        role,
        content,
        metadata = {}
    ) {

        const text =
            normalizeText(
                content
            );

        if (!text) {

            return null;

        }

        const message =
            createMessage(
                role,
                text,
                metadata
            );

        state.messages.push(
            message
        );

        state.messageCount =
            state.messages.length;

        if (
            role ===
            "user"
        ) {

            state.userMessages++;

            state.lastUserMessage =
                message;

        }

        if (
            role ===
            "assistant"
        ) {

            state.assistantMessages++;

            state.lastAssistantMessage =
                message;

        }

        /*
         * Maximalen Verlauf einhalten.
         */

        if (
            state.messages.length >
            CONFIG.maxMessages
        ) {

            state.messages =
                state.messages.slice(
                    -CONFIG.maxMessages
                );

            state.messageCount =
                state.messages.length;

        }

        emit(
            "message-added",
            {
                message
            }
        );

        /*
         * An Core weitergeben.
         */

        const core =
            getCore();

        if (
            core &&
            typeof core.addHistory ===
            "function"
        ) {

            try {

                core.addHistory(
                    role,
                    text,
                    {
                        conversationId:
                            state.conversationId,

                        messageId:
                            message.id,

                        ...metadata

                    }
                );

            } catch (
                error
            ) {

                recordError(
                    error,
                    {
                        phase:
                            "core-history"
                    }
                );

            }

        }

        /*
         * An Memory weitergeben.
         */

        if (
            CONFIG.autoSave
        ) {

            saveToMemory(
                message
            );

        }

        return message;

    }

    // --------------------------------------------------------
    // Memory Save
    // --------------------------------------------------------

    async function saveToMemory(
        message
    ) {

        const memory =
            getMemory();

        if (!memory) {

            return null;

        }

        const methods = [

            "addMessage",

            "remember",

            "storeMessage",

            "saveMessage",

            "store"

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
                    memory[method](
                        message
                    );

                return (
                    result &&
                    typeof result.then ===
                    "function"
                        ? await result
                        : result
                );

            } catch (
                error
            ) {

                recordError(
                    error,
                    {
                        phase:
                            "memory",
                        method
                    }
                );

                return null;

            }

        }

        return null;

    }

    // --------------------------------------------------------
    // Build Context
    // --------------------------------------------------------

    function buildContext(
        options = {}
    ) {

        const messages =
            state.messages
                .slice(
                    -CONFIG.maxMessages
                );

        return {

            conversationId:
                state.conversationId,

            messages,

            history:
                messages,

            messageCount:
                messages.length,

            language:
                options.language ||
                document.documentElement.lang ||
                "de-DE",

            system:
                "HalDo AI OS 18 " +
                "Professional Ultimate Foundation",

            timestamp:
                Date.now()

        };

    }

    // --------------------------------------------------------
    // Engine Request
    // --------------------------------------------------------

    async function requestEngine(
        text,
        options = {}
    ) {

        const engine =
            getEngine();

        if (!engine) {

            return null;

        }

        const context =
            buildContext(
                options
            );

        const methods = [

            "generate",

            "generateResponse",

            "ask",

            "process",

            "run"

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
                    engine[method](
                        text,
                        {
                            ...options,

                            context,

                            history:
                                context.history,

                            conversationId:
                                state.conversationId

                        }
                    );

                const resolved =
                    result &&
                    typeof result.then ===
                    "function"
                        ? await result
                        : result;

                if (
                    resolved
                ) {

                    return normalizeResponse(
                        resolved
                    );

                }

            } catch (
                error
            ) {

                recordError(
                    error,
                    {
                        phase:
                            "engine",
                        method
                    }
                );

            }

        }

        return null;

    }

    // --------------------------------------------------------
    // Core Request
    // --------------------------------------------------------

    async function requestCore(
        text,
        options = {}
    ) {

        const core =
            getCore();

        if (!core) {

            return null;

        }

        const methods = [

            "ask",

            "chat",

            "process",

            "respond"

        ];

        for (
            const method of methods
        ) {

            if (
                typeof core[method] !==
                "function"
            ) {

                continue;

            }

            try {

                const result =
                    core[method](
                        text,
                        {
                            ...options,

                            source:
                                "ai-chat",

                            conversationId:
                                state.conversationId,

                            history:
                                state.messages

                        }
                    );

                const resolved =
                    result &&
                    typeof result.then ===
                    "function"
                        ? await result
                        : result;

                if (
                    resolved
                ) {

                    return normalizeResponse(
                        resolved
                    );

                }

            } catch (
                error
            ) {

                recordError(
                    error,
                    {
                        phase:
                            "core",
                        method
                    }
                );

            }

        }

        return null;

    }

    // --------------------------------------------------------
    // Response Normalizer
    // --------------------------------------------------------

    function normalizeResponse(
        response
    ) {

        if (
            response === null ||
            response === undefined
        ) {

            return null;

        }

        if (
            typeof response ===
            "string"
        ) {

            return {

                text:
                    response,

                raw:
                    response

            };

        }

        if (
            response.text !==
            undefined
        ) {

            return {

                text:
                    String(
                        response.text
                    ),

                raw:
                    response

            };

        }

        if (
            response.content !==
            undefined
        ) {

            return {

                text:
                    String(
                        response.content
                    ),

                raw:
                    response

            };

        }

        if (
            response.message !==
            undefined
        ) {

            if (
                typeof response.message ===
                "string"
            ) {

                return {

                    text:
                        response.message,

                    raw:
                        response

                };

            }

            if (
                response.message?.content
            ) {

                return {

                    text:
                        String(
                            response.message.content
                        ),

                    raw:
                        response

                };

            }

        }

        return {

            text:
                String(
                    response
                ),

            raw:
                response

        };

    }

    // --------------------------------------------------------
    // Send Message
    // --------------------------------------------------------

    async function sendMessage(
        input,
        options = {}
    ) {

        const text =
            normalizeText(
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

        ensureConversation();

        state.processing =
            true;

        const started =
            performance.now();

        emit(
            "processing-start",
            {
                text,
                conversationId:
                    state.conversationId
            }
        );

        /*
         * User Message
         */

        const userMessage =
            addMessage(
                "user",
                text,
                {
                    source:
                        options.source ||
                        "chat"
                }
            );

        try {

            let response =
                null;

            /*
             * Bevorzugt Core.
             */

            if (
                options.useCore !==
                false
            ) {

                response =
                    await requestCore(
                        text,
                        options
                    );

            }

            /*
             * Falls Core nicht verfügbar:
             * direkt Engine verwenden.
             */

            if (
                !response &&
                options.useEngine !==
                false
            ) {

                response =
                    await requestEngine(
                        text,
                        options
                    );

            }

            /*
             * Letzter Fallback.
             */

            if (!response) {

                response = {

                    text:
                        "HalDo AI hat deine Nachricht " +
                        "empfangen. Die Chat-Verbindung " +
                        "ist aktiv.",

                    fallback:
                        true

                };

            }

            const assistantText =
                normalizeText(
                    response.text
                );

            /*
             * Assistant Message
             */

            const assistantMessage =
                addMessage(
                    "assistant",
                    assistantText,
                    {
                        provider:
                            response.provider ||
                            "unknown",

                        fallback:
                            Boolean(
                                response.fallback
                            ),

                        elapsed:
                            Math.round(
                                performance.now() -
                                started
                            )

                    }
                );

            const result = {

                ok:
                    true,

                conversationId:
                    state.conversationId,

                userMessage,

                assistantMessage,

                text:
                    assistantText,

                response,

                elapsed:
                    Math.round(
                        performance.now() -
                        started
                    )

            };

            emit(
                "message",
                result
            );

            emit(
                "response",
                result
            );

            return result;

        } catch (
            error
        ) {

            recordError(
                error,
                {
                    phase:
                        "sendMessage"
                }
            );

            const fallback =
                "Entschuldigung, bei der Verarbeitung " +
                "ist ein Fehler aufgetreten.";

            const assistantMessage =
                addMessage(
                    "assistant",
                    fallback,
                    {
                        error:
                            true
                    }
                );

            return {

                ok:
                    false,

                conversationId:
                    state.conversationId,

                userMessage,

                assistantMessage,

                text:
                    fallback,

                error

            };

        } finally {

            state.processing =
                false;

            emit(
                "processing-end",
                {
                    conversationId:
                        state.conversationId
                }
            );

        }

    }

    // --------------------------------------------------------
    // Aliases
    // --------------------------------------------------------

    async function send(
        input,
        options = {}
    ) {

        return sendMessage(
            input,
            options
        );

    }

    async function chat(
        input,
        options = {}
    ) {

        return sendMessage(
            input,
            options
        );

    }

    async function ask(
        input,
        options = {}
    ) {

        return sendMessage(
            input,
            options
        );

    }

    async function process(
        input,
        options = {}
    ) {

        return sendMessage(
            input,
            options
        );

    }

    // --------------------------------------------------------
    // Get Messages
    // --------------------------------------------------------

    function getMessages(
        limit =
            CONFIG.maxMessages
    ) {

        const amount =
            Math.max(
                1,
                Number(limit) ||
                CONFIG.maxMessages
            );

        return state.messages.slice(
            -amount
        );

    }

    // --------------------------------------------------------
    // Get Last Message
    // --------------------------------------------------------

    function getLastMessage(
        role = null
    ) {

        if (!role) {

            return (
                state.messages[
                    state.messages.length - 1
                ] ||
                null
            );

        }

        for (
            let index =
                state.messages.length - 1;
            index >= 0;
            index--
        ) {

            if (
                state.messages[index]
                    .role ===
                role
            ) {

                return state.messages[index];

            }

        }

        return null;

    }

    // --------------------------------------------------------
    // Clear Conversation
    // --------------------------------------------------------

    function clearConversation() {

        state.messages =
            [];

        state.messageCount =
            0;

        state.userMessages =
            0;

        state.assistantMessages =
            0;

        state.lastUserMessage =
            null;

        state.lastAssistantMessage =
            null;

        state.conversationId =
            createConversationId();

        emit(
            "conversation-cleared",
            {
                conversationId:
                    state.conversationId
            }
        );

        return true;

    }

    // --------------------------------------------------------
    // New Conversation
    // --------------------------------------------------------

    function newConversation() {

        clearConversation();

        emit(
            "new-conversation",
            {
                conversationId:
                    state.conversationId
            }
        );

        return state.conversationId;

    }

    // --------------------------------------------------------
    // Export Conversation
    // --------------------------------------------------------

    function exportConversation() {

        return {

            conversationId:
                state.conversationId,

            created:
                state.startedAt,

            exported:
                Date.now(),

            messages:
                state.messages.map(
                    message => ({
                        ...message
                    })
                )

        };

    }

    // --------------------------------------------------------
    // Import Conversation
    // --------------------------------------------------------

    function importConversation(
        data
    ) {

        if (
            !data ||
            !Array.isArray(
                data.messages
            )
        ) {

            return false;

        }

        state.conversationId =
            data.conversationId ||
            createConversationId();

        state.messages =
            data.messages
                .map(
                    message => ({
                        id:
                            message.id ||
                            createId(
                                "message"
                            ),

                        conversationId:
                            state.conversationId,

                        role:
                            message.role ||
                            "user",

                        content:
                            normalizeText(
                                message.content
                            ),

                        timestamp:
                            message.timestamp ||
                            Date.now(),

                        metadata:
                            message.metadata ||
                            {}

                    })
                )
                .slice(
                    -CONFIG.maxMessages
                );

        state.messageCount =
            state.messages.length;

        state.userMessages =
            state.messages.filter(
                message =>
                    message.role ===
                    "user"
            ).length;

        state.assistantMessages =
            state.messages.filter(
                message =>
                    message.role ===
                    "assistant"
            ).length;

        state.lastUserMessage =
            getLastMessage(
                "user"
            );

        state.lastAssistantMessage =
            getLastMessage(
                "assistant"
            );

        emit(
            "conversation-imported",
            {
                conversationId:
                    state.conversationId,

                messageCount:
                    state.messageCount

            }
        );

        return true;

    }

    // --------------------------------------------------------
    // Search Conversation
    // --------------------------------------------------------

    function search(
        query
    ) {

        const text =
            normalizeText(
                query
            ).toLowerCase();

        if (!text) {

            return [];

        }

        return state.messages.filter(
            message =>
                message.content
                    .toLowerCase()
                    .includes(
                        text
                    )
        );

    }

    // --------------------------------------------------------
    // System Status
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

            processing:
                state.processing,

            conversationId:
                state.conversationId,

            messageCount:
                state.messageCount,

            userMessages:
                state.userMessages,

            assistantMessages:
                state.assistantMessages,

            errorCount:
                state.errors.length,

            hasCore:
                Boolean(
                    getCore()
                ),

            hasEngine:
                Boolean(
                    getEngine()
                ),

            hasMemory:
                Boolean(
                    getMemory()
                ),

            lastUserMessage:
                state.lastUserMessage,

            lastAssistantMessage:
                state.lastAssistantMessage

        };

    }

    // --------------------------------------------------------
    // Reset
    // --------------------------------------------------------

    function reset() {

        state.messages =
            [];

        state.messageCount =
            0;

        state.userMessages =
            0;

        state.assistantMessages =
            0;

        state.processing =
            false;

        state.lastUserMessage =
            null;

        state.lastAssistantMessage =
            null;

        state.errors =
            [];

        state.conversationId =
            createConversationId();

        emit(
            "reset",
            {
                conversationId:
                    state.conversationId
            }
        );

        return true;

    }

    // --------------------------------------------------------
    // Initialization
    // --------------------------------------------------------

    function initialize() {

        if (
            state.initialized
        ) {

            return getStatus();

        }

        state.startedAt =
            Date.now();

        state.initialized =
            true;

        ensureConversation();

        /*
         * Verbindung zum Core.
         */

        const core =
            getCore();

        if (
            core &&
            typeof core.registerModule ===
            "function"
        ) {

            try {

                core.registerModule(
                    "chat",
                    api
                );

            } catch (
                error
            ) {

                recordError(
                    error,
                    {
                        phase:
                            "core-registration"
                    }
                );

            }

        }

        /*
         * Core Events beobachten.
         */

        if (
            core &&
            typeof core.on ===
            "function"
        ) {

            try {

                core.on(
                    "request-start",
                    detail => {

                        log(
                            "Core request started:",
                            detail
                        );

                    }
                );

                core.on(
                    "response",
                    detail => {

                        log(
                            "Core response:",
                            detail
                        );

                    }
                );

            } catch (
                error
            ) {

                recordError(
                    error,
                    {
                        phase:
                            "core-events"
                    }
                );

            }

        }

        emit(
            "initialized",
            {
                status:
                    getStatus()
            }
        );

        window.setTimeout(
            () => {

                state.ready =
                    true;

                emit(
                    "ready",
                    {
                        status:
                            getStatus()
                    }
                );

                console.log(
                    "[HalDoAIChat] " +
                    "HalDo AI Chat 18 bereit."
                );

            },
            0
        );

        return getStatus();

    }

    // --------------------------------------------------------
    // Public API
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

        sendMessage,

        send,

        chat,

        ask,

        process,

        addMessage,

        getMessages,

        getLastMessage,

        clearConversation,

        newConversation,

        exportConversation,

        importConversation,

        search,

        buildContext,

        getStatus,

        reset

    };

    // --------------------------------------------------------
    // Global APIs
    // --------------------------------------------------------

    window.HalDoAIChat =
        api;

    window.HalDoOS.aiChat =
        api;

    // --------------------------------------------------------
    // Global Event: haldo:ai-input
    // --------------------------------------------------------
    //
    // Andere UI-Module können einfach:
    //
    // document.dispatchEvent(
    //   new CustomEvent("haldo:ai-input", {
    //      detail: { text: "Hallo" }
    //   })
    // );
    //
    // verwenden.
    // --------------------------------------------------------

    document.addEventListener(
        "haldo:ai-input",
        event => {

            const text =
                event.detail?.text ??
                event.detail?.message ??
                "";

            if (
                normalizeText(
                    text
                )
            ) {

                sendMessage(
                    text,
                    {
                        source:
                            "global-event"
                    }
                );

            }

        }
    );

    // --------------------------------------------------------
    // Global Event: haldo:ai-chat-send
    // --------------------------------------------------------

    document.addEventListener(
        "haldo:ai-chat-send",
        event => {

            const text =
                event.detail?.text ??
                event.detail?.message ??
                "";

            if (
                normalizeText(
                    text
                )
            ) {

                sendMessage(
                    text,
                    event.detail?.options ||
                    {}
                );

            }

        }
    );

    // --------------------------------------------------------
    // DOM Ready
    // --------------------------------------------------------

    function boot() {

        initialize();

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
// END OF PART 74
// ============================================================