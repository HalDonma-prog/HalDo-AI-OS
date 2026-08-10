/*
========================================================
HalDo AI OS 18
AI Chat Service
Professional Ultimate Foundation
========================================================

Zentrale Chat-Schicht.

Verbindungen:
- HalDoAICore
- AI Engine
- AI Memory
- Conversation State
- Language System
- Commands
- UI / ai-interface.js

Der Chat-Service erzeugt keine eigene Oberfläche.
Er stellt eine stabile API für die Oberfläche bereit.
========================================================
*/

(function () {
    "use strict";

    const VERSION = "18.0.0";

    const state = {
        name: "HalDo AI Chat",
        version: VERSION,
        status: "created",
        initialized: false,
        running: false,
        messages: [],
        conversations: [],
        activeConversationId: null,
        messageCount: 0,
        lastMessage: null,
        lastResponse: null,
        lastError: null
    };

    const listeners = {};

    /* ==================================================
       EVENTS
    ================================================== */

    function on(event, callback) {
        if (typeof callback !== "function") {
            return function () {};
        }

        if (!listeners[event]) {
            listeners[event] = [];
        }

        listeners[event].push(callback);

        return function () {
            off(event, callback);
        };
    }

    function off(event, callback) {
        if (!listeners[event]) {
            return;
        }

        listeners[event] =
            listeners[event].filter(
                fn => fn !== callback
            );
    }

    function emit(event, data) {
        (listeners[event] || []).forEach(
            callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(
                        "[HalDo AI Chat] Event error:",
                        error
                    );
                }
            }
        );

        try {
            if (
                window.HalDoKernel &&
                typeof window.HalDoKernel.emit === "function"
            ) {
                window.HalDoKernel.emit(
                    `chat:${event}`,
                    data
                );
            }
        } catch (error) {
            console.warn(
                "[HalDo AI Chat] Kernel event failed:",
                error
            );
        }
    }

    /* ==================================================
       UTILITIES
    ================================================== */

    function createId(prefix) {
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

    function now() {
        return new Date().toISOString();
    }

    function normalizeText(value) {
        return String(
            value === undefined ||
            value === null
                ? ""
                : value
        ).trim();
    }

    /* ==================================================
       MODULE ACCESS
    ================================================== */

    function getCore() {
        return window.HalDoAICore || null;
    }

    function getMemory() {
        return (
            window.HalDoAIMemory ||
            null
        );
    }

    function getConversation() {
        return (
            window.HalDoConversationState ||
            null
        );
    }

    function getLanguage() {
        return (
            window.HalDoAILanguage ||
            window.HalDoLanguageManager ||
            null
        );
    }

    function getCommands() {
        return (
            window.HalDoAICommands ||
            null
        );
    }

    /* ==================================================
       STATUS
    ================================================== */

    function getStatus() {
        return {
            name: state.name,
            version: state.version,
            status: state.status,
            initialized: state.initialized,
            running: state.running,
            messageCount: state.messageCount,
            activeConversationId:
                state.activeConversationId,
            lastMessage:
                state.lastMessage,
            lastResponse:
                state.lastResponse,
            lastError:
                state.lastError
        };
    }

    /* ==================================================
       INITIALIZE
    ================================================== */

    function initialize() {
        if (state.initialized) {
            return getStatus();
        }

        state.status = "initializing";

        emit(
            "initializing",
            getStatus()
        );

        /*
         * Immer eine aktive Unterhaltung
         * verfügbar halten.
         */
        if (!state.activeConversationId) {
            createConversation();
        }

        state.initialized = true;
        state.status = "ready";

        emit(
            "ready",
            getStatus()
        );

        console.log(
            "[HalDo AI Chat] initialisiert."
        );

        return getStatus();
    }

    /* ==================================================
       START
    ================================================== */

    function start() {
        if (!state.initialized) {
            initialize();
        }

        if (state.running) {
            return getStatus();
        }

        state.running = true;
        state.status = "running";

        emit(
            "started",
            getStatus()
        );

        return getStatus();
    }

    /* ==================================================
       STOP
    ================================================== */

    function stop() {
        state.running = false;
        state.status = "stopped";

        emit(
            "stopped",
            getStatus()
        );

        return getStatus();
    }

    /* ==================================================
       CONVERSATION
    ================================================== */

    function createConversation(title = "Neue Unterhaltung") {
        const conversation = {
            id: createId("conversation"),
            title:
                normalizeText(title) ||
                "Neue Unterhaltung",
            createdAt: now(),
            updatedAt: now(),
            messages: []
        };

        state.conversations.push(
            conversation
        );

        state.activeConversationId =
            conversation.id;

        state.messages =
            conversation.messages;

        emit(
            "conversation:created",
            conversation
        );

        return conversation;
    }

    function getActiveConversation() {
        return state.conversations.find(
            conversation =>
                conversation.id ===
                state.activeConversationId
        ) || null;
    }

    function selectConversation(id) {
        const conversation =
            state.conversations.find(
                item =>
                    item.id === id
            );

        if (!conversation) {
            return null;
        }

        state.activeConversationId =
            conversation.id;

        state.messages =
            conversation.messages;

        emit(
            "conversation:selected",
            conversation
        );

        return conversation;
    }

    function deleteConversation(id) {
        const index =
            state.conversations.findIndex(
                conversation =>
                    conversation.id === id
            );

        if (index === -1) {
            return false;
        }

        state.conversations.splice(
            index,
            1
        );

        if (
            state.activeConversationId ===
            id
        ) {
            if (
                state.conversations.length
            ) {
                state.activeConversationId =
                    state.conversations[
                        0
                    ].id;

                state.messages =
                    state.conversations[
                        0
                    ].messages;
            } else {
                createConversation();
            }
        }

        emit(
            "conversation:deleted",
            {
                id
            }
        );

        return true;
    }

    function clearConversation() {
        const conversation =
            getActiveConversation();

        if (!conversation) {
            return false;
        }

        conversation.messages = [];
        conversation.updatedAt = now();

        state.messages =
            conversation.messages;

        emit(
            "conversation:cleared",
            conversation
        );

        return true;
    }

    function getConversations() {
        return state.conversations.map(
            conversation => ({
                ...conversation,
                messages:
                    [...conversation.messages]
            })
        );
    }

    /* ==================================================
       MESSAGE CREATION
    ================================================== */

    function createMessage(
        role,
        content,
        metadata = {}
    ) {
        return {
            id: createId("message"),
            role,
            content:
                normalizeText(content),
            timestamp: now(),
            metadata: {
                ...metadata
            }
        };
    }

    function addMessage(
        role,
        content,
        metadata = {}
    ) {
        if (!state.initialized) {
            initialize();
        }

        let conversation =
            getActiveConversation();

        if (!conversation) {
            conversation =
                createConversation();
        }

        const message =
            createMessage(
                role,
                content,
                metadata
            );

        conversation.messages.push(
            message
        );

        conversation.updatedAt =
            now();

        state.messages =
            conversation.messages;

        state.messageCount += 1;

        state.lastMessage =
            message;

        emit(
            "message",
            message
        );

        return message;
    }

    /* ==================================================
       MEMORY
    ================================================== */

    function saveToMemory(message) {
        const memory =
            getMemory();

        if (!memory) {
            return;
        }

        try {
            if (
                typeof memory.remember ===
                "function"
            ) {
                memory.remember(
                    `chat:${message.id}`,
                    message
                );

                return;
            }

            if (
                typeof memory.set ===
                "function"
            ) {
                memory.set(
                    `chat:${message.id}`,
                    message
                );
            }

        } catch (error) {
            console.warn(
                "[HalDo AI Chat] Memory save failed:",
                error
            );
        }
    }

    /* ==================================================
       CONVERSATION STATE CONNECTION
    ================================================== */

    function syncConversationState() {
        const conversation =
            getConversation();

        if (!conversation) {
            return;
        }

        try {
            if (
                typeof conversation.set ===
                "function"
            ) {
                conversation.set(
                    getActiveConversation()
                );
            }

            if (
                typeof conversation.update ===
                "function"
            ) {
                conversation.update(
                    getActiveConversation()
                );
            }
        } catch (error) {
            console.warn(
                "[HalDo AI Chat] Conversation state sync failed:",
                error
            );
        }
    }

    /* ==================================================
       LANGUAGE
    ================================================== */

    function detectLanguage(text) {
        const language =
            getLanguage();

        if (!language) {
            return null;
        }

        try {
            if (
                typeof language.detect ===
                "function"
            ) {
                return language.detect(
                    text
                );
            }

            if (
                typeof language.detectLanguage ===
                "function"
            ) {
                return language.detectLanguage(
                    text
                );
            }
        } catch (error) {
            console.warn(
                "[HalDo AI Chat] Language detection failed:",
                error
            );
        }

        return null;
    }

    /* ==================================================
       COMMANDS
    ================================================== */

    async function processCommand(text) {
        const commands =
            getCommands();

        if (!commands) {
            return null;
        }

        try {
            if (
                typeof commands.execute ===
                "function"
            ) {
                return await commands.execute(
                    text
                );
            }

            if (
                typeof commands.run ===
                "function"
            ) {
                return await commands.run(
                    text
                );
            }
        } catch (error) {
            console.warn(
                "[HalDo AI Chat] Command failed:",
                error
            );
        }

        return null;
    }

    /* ==================================================
       ASK CORE
    ================================================== */

    async function ask(
        text,
        options = {}
    ) {
        if (!state.initialized) {
            initialize();
        }

        if (!state.running) {
            start();
        }

        const message =
            normalizeText(text);

        if (!message) {
            return {
                text:
                    "Bitte schreibe eine Anfrage.",
                type:
                    "empty"
            };
        }

        const language =
            options.language ||
            detectLanguage(message);

        const userMessage =
            addMessage(
                "user",
                message,
                {
                    language,
                    source:
                        "haldo-ai-chat"
                }
            );

        saveToMemory(
            userMessage
        );

        syncConversationState();

        emit(
            "request:start",
            {
                message:
                    userMessage,
                options
            }
        );

        /*
         * Erst prüfen, ob es sich um einen
         * HalDo-Systembefehl handelt.
         */
        const commandResponse =
            await processCommand(
                message
            );

        if (
            commandResponse &&
            commandResponse.handled
        ) {
            const commandText =
                commandResponse.text ||
                commandResponse.message ||
                "";

            const aiMessage =
                addMessage(
                    "assistant",
                    commandText,
                    {
                        type:
                            "command",
                        language
                    }
                );

            saveToMemory(
                aiMessage
            );

            syncConversationState();

            state.lastResponse =
                aiMessage;

            emit(
                "request:complete",
                {
                    request:
                        userMessage,
                    response:
                        aiMessage
                }
            );

            return {
                text:
                    commandText,
                type:
                    "command",
                message:
                    aiMessage
            };
        }

        /* ==============================================
           CORE
        ============================================== */

        const core =
            getCore();

        let response;

        if (
            core &&
            typeof core.ask ===
                "function"
        ) {
            response =
                await core.ask(
                    message,
                    {
                        ...options,
                        language,
                        conversationId:
                            state.activeConversationId
                    }
                );
        } else {
            response = {
                text:
                    "HalDo AI Core ist noch nicht verfügbar.",
                type:
                    "core-unavailable"
            };
        }

        const responseText =
            typeof response ===
            "string"
                ? response
                : (
                    response?.text ||
                    response?.message ||
                    "HalDo AI hat die Anfrage verarbeitet."
                );

        const aiMessage =
            addMessage(
                "assistant",
                responseText,
                {
                    type:
                        response?.type ||
                        "ai",
                    language,
                    source:
                        response?.source ||
                        "haldo-ai-core"
                }
            );

        saveToMemory(
            aiMessage
        );

        syncConversationState();

        state.lastResponse =
            aiMessage;

        emit(
            "request:complete",
            {
                request:
                    userMessage,
                response:
                    aiMessage
            }
        );

        return {
            text:
                responseText,
            type:
                response?.type ||
                "ai",
            message:
                aiMessage,
            raw:
                response
        };
    }

    /* ==================================================
       SYNCHRONOUS MESSAGE
    ================================================== */

    function send(text) {
        const message =
            normalizeText(text);

        if (!message) {
            return null;
        }

        return addMessage(
            "user",
            message
        );
    }

    /* ==================================================
       HISTORY
    ================================================== */

    function getMessages() {
        return [
            ...state.messages
        ];
    }

    function getHistory(limit = 50) {
        const count =
            Math.max(
                1,
                Number(limit) || 50
            );

        return state.messages
            .slice(-count)
            .map(message => ({
                ...message,
                metadata: {
                    ...message.metadata
                }
            }));
    }

    /* ==================================================
       EXPORT
    ================================================== */

    function exportConversation() {
        const conversation =
            getActiveConversation();

        if (!conversation) {
            return null;
        }

        return JSON.stringify(
            conversation,
            null,
            2
        );
    }

    /* ==================================================
       IMPORT
    ================================================== */

    function importConversation(data) {
        try {
            const parsed =
                typeof data ===
                "string"
                    ? JSON.parse(data)
                    : data;

            if (
                !parsed ||
                !Array.isArray(
                    parsed.messages
                )
            ) {
                return false;
            }

            const conversation = {
                id:
                    parsed.id ||
                    createId(
                        "conversation"
                    ),
                title:
                    parsed.title ||
                    "Importierte Unterhaltung",
                createdAt:
                    parsed.createdAt ||
                    now(),
                updatedAt:
                    now(),
                messages:
                    parsed.messages
            };

            state.conversations.push(
                conversation
            );

            state.activeConversationId =
                conversation.id;

            state.messages =
                conversation.messages;

            emit(
                "conversation:imported",
                conversation
            );

            return true;

        } catch (error) {
            state.lastError =
                error.message;

            return false;
        }
    }

    /* ==================================================
       RESET
    ================================================== */

    function reset() {
        state.messages = [];
        state.conversations = [];
        state.activeConversationId =
            null;
        state.messageCount = 0;
        state.lastMessage = null;
        state.lastResponse = null;
        state.lastError = null;

        createConversation();

        emit(
            "reset",
            getStatus()
        );

        return getStatus();
    }

    /* ==================================================
       PUBLIC API
    ================================================== */

    const api = {

        name:
            state.name,

        version:
            VERSION,

        initialize,

        start,

        stop,

        ask,

        send,

        addMessage,

        getMessages,

        getHistory,

        getStatus,

        createConversation,

        getActiveConversation,

        selectConversation,

        deleteConversation,

        clearConversation,

        getConversations,

        exportConversation,

        importConversation,

        reset,

        detectLanguage,

        on,

        off
    };

    /* ==================================================
       GLOBAL REGISTRATION
    ================================================== */

    window.HalDoAIChat =
        api;

    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.chat =
        api;

    /* ==================================================
       KERNEL REGISTRATION
    ================================================== */

    function registerWithKernel() {
        try {
            const kernel =
                window.HalDoKernel;

            if (
                kernel &&
                typeof kernel.registerModule ===
                    "function"
            ) {
                kernel.registerModule(
                    "ai-chat",
                    api
                );
            }
        } catch (error) {
            console.warn(
                "[HalDo AI Chat] Kernel registration failed:",
                error
            );
        }
    }

    /* ==================================================
       BOOT
    ================================================== */

    function boot() {
        registerWithKernel();
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
                once: true
            }
        );
    } else {
        boot();
    }

})();