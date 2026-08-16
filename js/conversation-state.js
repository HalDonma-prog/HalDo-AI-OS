/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE AI FOUNDATION
   ------------------------------------------------------------
   Datei:
       js/conversation-state.js

   ZENTRALER CONVERSATION STATE MANAGER

   Aufgaben:
   - Gespräche erstellen
   - Gespräche wechseln
   - Nachrichten verwalten
   - Benutzer-/AI-Nachrichten
   - Kontextverwaltung
   - Gesprächstitel
   - Statusverwaltung
   - Sprache
   - AI-Modus
   - Message IDs
   - Conversation IDs
   - Zeitstempel
   - Metadaten
   - Nachrichten bearbeiten
   - Nachrichten löschen
   - Conversation löschen
   - Conversation duplizieren
   - Suche
   - Export / Import
   - LocalStorage
   - Events
   - Diagnostics
   - Health Check
   - AI-/Memory-/Language-Kompatibilität
   - zukünftige Streaming-Unterstützung
   - sichere Erweiterbarkeit

   HALDO AI OS 18 → 20
   ============================================================ */

"use strict";

(function (window, document) {

    /* ========================================================
       01 — HALDO FOUNDATION
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;


    /* ========================================================
       02 — META
       ======================================================== */

    const VERSION =
        "20.0.0";

    const MODULE_ID =
        "conversation-state";

    const NAME =
        "HalDo AI OS Conversation State Manager";

    const STORAGE_PREFIX =
        "haldo.ai.conversation.";

    const INDEX_KEY =
        "haldo.ai.conversations.index";

    const ACTIVE_KEY =
        "haldo.ai.conversations.active";


    /* ========================================================
       03 — INTERNAL STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        initializing:
            false,

        ready:
            false,

        failed:
            false,

        conversations:
            new Map(),

        activeConversationId:
            null,

        listeners:
            new Map(),

        connections: {

            kernel:
                false,

            system:
                false,

            aiCore:
                false,

            aiEngine:
                false,

            aiChat:
                false,

            aiMemory:
                false,

            aiLanguage:
                false,

            storage:
                false

        },

        statistics: {

            conversationsCreated:
                0,

            conversationsDeleted:
                0,

            messagesAdded:
                0,

            messagesEdited:
                0,

            messagesDeleted:
                0,

            messagesCleared:
                0,

            switches:
                0,

            searches:
                0,

            exports:
                0,

            imports:
                0,

            errors:
                0

        }

    };


    /* ========================================================
       04 — LOGGING
       ======================================================== */

    function log() {

        try {

            console.log(
                "[HalDo Conversation State]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo Conversation State]",
                ...arguments
            );

        } catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo Conversation State]",
                ...arguments
            );

        } catch (_) {}

    }


    /* ========================================================
       05 — SAFE HELPERS
       ======================================================== */

    function hasMethod(
        object,
        method
    ) {

        return !!(
            object &&
            typeof object[method] ===
            "function"
        );

    }


    function normalizeId(
        value
    ) {

        return String(
            value || ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9äöüßîêç_-]+/gi,
            "-"
        )
        .replace(
            /-+/g,
            "-"
        )
        .replace(
            /^-|-$/g,
            "");

    }


    function generateId(
        prefix = "id"
    ) {

        const randomPart =
            Math.random()
                .toString(36)
                .slice(2, 10);

        const timePart =
            Date.now()
                .toString(36);

        return (
            prefix +
            "-" +
            timePart +
            "-" +
            randomPart
        );

    }


    function now() {

        return Date.now();

    }


    function isoNow() {

        return new Date()
            .toISOString();

    }


    function clone(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }


        if (
            Array.isArray(
                value
            )
        ) {

            return value.map(
                clone
            );

        }


        if (
            typeof value ===
            "object"
        ) {

            const result = {};

            Object.keys(
                value
            ).forEach(
                key => {

                    result[key] =
                        typeof value[key] ===
                        "function"
                            ? value[key]
                            : clone(
                                value[key]
                            );

                }
            );

            return result;

        }


        return value;

    }


    function normalizeText(
        value
    ) {

        return String(
            value === undefined ||
            value === null
                ? ""
                : value
        );

    }


    /* ========================================================
       06 — SERVICE LOOKUPS
       ======================================================== */

    function getKernel() {

        return (
            window.HalDoKernel ||
            HalDoOS.kernel ||
            null
        );

    }


    function getSystem() {

        return (
            window.HalDoSystem ||
            HalDoOS.system ||
            null
        );

    }


    function getAICore() {

        return (
            window.HalDoAICore ||
            HalDoOS.aiCore ||
            null
        );

    }


    function getAIEngine() {

        return (
            window.HalDoAIEngine ||
            HalDoOS.aiEngine ||
            null
        );

    }


    function getAIChat() {

        return (
            window.HalDoAIChat ||
            HalDoOS.aiChat ||
            null
        );

    }


    function getAIMemory() {

        return (
            window.HalDoAIMemory ||
            HalDoOS.aiMemory ||
            null
        );

    }


    function getAILanguage() {

        return (
            window.HalDoAILanguage ||
            window.HalDoAILanguageManager ||
            HalDoOS.aiLanguage ||
            HalDoOS.languageManager ||
            null
        );

    }


    function getStorage() {

        return (
            window.HalDoStorage ||
            HalDoOS.storage ||
            window.HalDoStorageManager ||
            HalDoOS.storageManager ||
            null
        );

    }


    /* ========================================================
       07 — EVENTS
       ======================================================== */

    function on(
        event,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return function () {};

        }


        if (
            !state.listeners.has(
                event
            )
        ) {

            state.listeners.set(
                event,
                new Set()
            );

        }


        const listeners =
            state.listeners.get(
                event
            );


        listeners.add(
            callback
        );


        return function () {

            off(
                event,
                callback
            );

        };

    }


    function off(
        event,
        callback
    ) {

        const listeners =
            state.listeners.get(
                event
            );


        if (!listeners) {

            return;

        }


        listeners.delete(
            callback
        );


        if (
            listeners.size ===
            0
        ) {

            state.listeners.delete(
                event
            );

        }

    }


    function emit(
        event,
        data = null
    ) {

        const listeners =
            state.listeners.get(
                event
            );


        if (listeners) {

            Array.from(
                listeners
            ).forEach(
                callback => {

                    try {

                        callback(
                            data
                        );

                    } catch (exception) {

                        reportError(
                            exception,
                            "Event: " + event
                        );

                    }

                }
            );

        }


        const globalEvents =
            HalDoOS.events;


        if (
            globalEvents &&
            hasMethod(
                globalEvents,
                "emit"
            )
        ) {

            try {

                globalEvents.emit(
                    "conversation-state:" +
                    event,
                    data
                );

            } catch (_) {}

        }


        const kernel =
            getKernel();


        if (
            kernel &&
            hasMethod(
                kernel,
                "emit"
            )
        ) {

            try {

                kernel.emit(
                    "conversation-state:" +
                    event,
                    data
                );

            } catch (_) {}

        }

    }


    /* ========================================================
       08 — ERROR HANDLING
       ======================================================== */

    function reportError(
        exception,
        context =
            "Conversation State"
    ) {

        state.statistics.errors +=
            1;


        const normalized =
            exception instanceof Error
                ? exception
                : new Error(
                    String(
                        exception
                    )
                );


        const record = {

            message:
                normalized.message,

            name:
                normalized.name,

            stack:
                normalized.stack ||
                "",

            context,

            timestamp:
                isoNow()

        };


        errorLog(
            "[HalDo Conversation State]",
            record
        );


        emit(
            "error",
            record
        );


        const kernel =
            getKernel();


        if (
            kernel &&
            hasMethod(
                kernel,
                "reportError"
            )
        ) {

            try {

                kernel.reportError(
                    normalized,
                    context
                );

            } catch (_) {}

        }


        return record;

    }


    /* ========================================================
       09 — MESSAGE NORMALIZATION
       ======================================================== */

    function normalizeRole(
        role
    ) {

        const value =
            String(
                role || ""
            )
            .trim()
            .toLowerCase();


        if (
            value === "user" ||
            value === "human"
        ) {

            return "user";

        }


        if (
            value === "assistant" ||
            value === "ai" ||
            value === "haldo"
        ) {

            return "assistant";

        }


        if (
            value === "system"
        ) {

            return "system";

        }


        if (
            value === "tool" ||
            value === "function"
        ) {

            return "tool";

        }


        return "user";

    }


    function createMessage(
        input = {}
    ) {

        const role =
            normalizeRole(
                input.role
            );


        const content =
            normalizeText(
                input.content !==
                undefined
                    ? input.content
                    : input.text
            );


        const timestamp =
            input.timestamp ||
            isoNow();


        return {

            id:
                input.id ||
                generateId(
                    "message"
                ),

            role:
                role,

            content:
                content,

            text:
                content,

            timestamp:
                timestamp,

            createdAt:
                input.createdAt ||
                timestamp,

            updatedAt:
                input.updatedAt ||
                timestamp,

            status:
                input.status ||
                "complete",

            language:
                input.language ||
                null,

            model:
                input.model ||
                null,

            parentMessageId:
                input.parentMessageId ||
                null,

            replyTo:
                input.replyTo ||
                null,

            streaming:
                input.streaming ===
                true,

            error:
                input.error ||
                null,

            metadata:
                clone(
                    input.metadata ||
                    {}
                )

        };

    }


    /* ========================================================
       10 — CONVERSATION CREATION
       ======================================================== */

    function createConversation(
        options = {}
    ) {

        const id =
            options.id ||
            generateId(
                "conversation"
            );


        const timestamp =
            isoNow();


        const conversation = {

            id:
                id,

            title:
                normalizeText(
                    options.title
                ) ||
                "Neue Unterhaltung",

            createdAt:
                options.createdAt ||
                timestamp,

            updatedAt:
                options.updatedAt ||
                timestamp,

            language:
                options.language ||
                "auto",

            aiMode:
                options.aiMode ||
                "assistant",

            model:
                options.model ||
                null,

            status:
                options.status ||
                "idle",

            messages:
                Array.isArray(
                    options.messages
                )
                    ? options.messages.map(
                        createMessage
                    )
                    : [],

            context:
                clone(
                    options.context ||
                    {}
                ),

            metadata:
                clone(
                    options.metadata ||
                    {}
                ),

            settings:
                clone(
                    options.settings ||
                    {}
                ),

            memory:
                clone(
                    options.memory ||
                    {}
                ),

            statistics: {

                messageCount:
                    Array.isArray(
                        options.messages
                    )
                        ? options.messages.length
                        : 0,

                userMessages:
                    0,

                assistantMessages:
                    0

            }

        };


        updateConversationStatistics(
            conversation
        );


        state.conversations.set(
            id,
            conversation
        );


        state.statistics
            .conversationsCreated +=
            1;


        emit(
            "conversation-created",
            {
                conversation:
                    clone(
                        conversation
                    )
            }
        );


        return clone(
            conversation
        );

    }


    /* ========================================================
       11 — CONVERSATION STATISTICS
       ======================================================== */

    function updateConversationStatistics(
        conversation
    ) {

        if (!conversation) {

            return;

        }


        const messages =
            Array.isArray(
                conversation.messages
            )
                ? conversation.messages
                : [];


        conversation.statistics = {

            messageCount:
                messages.length,

            userMessages:
                messages.filter(
                    message =>
                        message.role ===
                        "user"
                ).length,

            assistantMessages:
                messages.filter(
                    message =>
                        message.role ===
                        "assistant"
                ).length

        };

    }


    /* ========================================================
       12 — CONVERSATION ACCESS
       ======================================================== */

    function get(
        conversationId
    ) {

        const id =
            normalizeId(
                conversationId
            );


        if (!id) {

            return null;

        }


        const conversation =
            state.conversations.get(
                id
            );


        return conversation
            ? clone(
                conversation
            )
            : null;

    }


    function getConversation(
        conversationId
    ) {

        return get(
            conversationId
        );

    }


    function getAll() {

        return Array.from(
            state.conversations.values()
        )
        .map(
            clone
        );

    }


    function getConversations() {

        return getAll();

    }


    function has(
        conversationId
    ) {

        const id =
            normalizeId(
                conversationId
            );


        return state.conversations.has(
            id
        );

    }


    function getCount() {

        return state.conversations.size;

    }


    /* ========================================================
       13 — ACTIVE CONVERSATION
       ======================================================== */

    function getActiveId() {

        return state.activeConversationId;

    }


    function getActiveConversation() {

        if (
            !state.activeConversationId
        ) {

            return null;

        }


        return get(
            state.activeConversationId
        );

    }


    function setActiveConversation(
        conversationId
    ) {

        const id =
            normalizeId(
                conversationId
            );


        if (
            !state.conversations.has(
                id
            )
        ) {

            return false;

        }


        state.activeConversationId =
            id;


        saveActiveConversation(
            id
        );


        state.statistics.switches +=
            1;


        emit(
            "conversation-activated",
            {
                conversationId:
                    id,

                conversation:
                    get(
                        id
                    )
            }
        );


        return true;

    }


    function activate(
        conversationId
    ) {

        return setActiveConversation(
            conversationId
        );

    }


    /* ========================================================
       14 — NEW CONVERSATION
       ======================================================== */

    function newConversation(
        options = {}
    ) {

        const conversation =
            createConversation(
                options
            );


        setActiveConversation(
            conversation.id
        );


        saveConversation(
            conversation
        );


        emit(
            "conversation-new",
            {
                conversation:
                    clone(
                        conversation
                    )
            }
        );


        return conversation;

    }


    function startConversation(
        options = {}
    ) {

        return newConversation(
            options
        );

    }


    /* ========================================================
       15 — MESSAGE ACCESS
       ======================================================== */

    function getMessages(
        conversationId
    ) {

        const conversation =
            getConversation(
                conversationId ||
                state.activeConversationId
            );


        if (!conversation) {

            return [];

        }


        return conversation.messages
            .map(
                clone
            );

    }


    function getMessage(
        conversationId,
        messageId
    ) {

        const conversation =
            state.conversations.get(
                normalizeId(
                    conversationId ||
                    state.activeConversationId
                )
            );


        if (!conversation) {

            return null;

        }


        const message =
            conversation.messages.find(
                item =>
                    item.id ===
                    messageId
            );


        return message
            ? clone(
                message
            )
            : null;

    }


    /* ========================================================
       16 — ADD MESSAGE
       ======================================================== */

    function addMessage(
        conversationId,
        messageInput = {}
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        let conversation =
            state.conversations.get(
                id
            );


        if (!conversation) {

            conversation =
                createConversation(
                    {
                        id:
                            id ||
                            undefined
                    }
                );

        }


        const message =
            createMessage(
                messageInput
            );


        conversation.messages.push(
            message
        );


        conversation.updatedAt =
            isoNow();


        updateConversationStatistics(
            conversation
        );


        state.statistics.messagesAdded +=
            1;


        saveConversation(
            conversation
        );


        emit(
            "message-added",
            {

                conversationId:
                    conversation.id,

                message:
                    clone(
                        message
                    ),

                conversation:
                    clone(
                        conversation
                    )

            }
        );


        return clone(
            message
        );

    }


    function addUserMessage(
        content,
        options = {}
    ) {

        const message =
            addMessage(
                options.conversationId ||
                state.activeConversationId,
                {

                    ...options,

                    role:
                        "user",

                    content:
                        content

                }
            );


        updateStatus(
            options.conversationId ||
            state.activeConversationId,
            "thinking"
        );


        return message;

    }


    function addAssistantMessage(
        content,
        options = {}
    ) {

        const message =
            addMessage(
                options.conversationId ||
                state.activeConversationId,
                {

                    ...options,

                    role:
                        "assistant",

                    content:
                        content,

                    status:
                        options.status ||
                        "complete"

                }
            );


        updateStatus(
            options.conversationId ||
            state.activeConversationId,
            "idle"
        );


        return message;

    }


    function addSystemMessage(
        content,
        options = {}
    ) {

        return addMessage(
            options.conversationId ||
            state.activeConversationId,
            {

                ...options,

                role:
                    "system",

                content:
                    content

            }
        );

    }


    /* ========================================================
       17 — EDIT MESSAGE
       ======================================================== */

    function editMessage(
        conversationId,
        messageId,
        changes = {}
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        const conversation =
            state.conversations.get(
                id
            );


        if (!conversation) {

            return null;

        }


        const message =
            conversation.messages.find(
                item =>
                    item.id ===
                    messageId
            );


        if (!message) {

            return null;

        }


        if (
            changes.content !==
            undefined
        ) {

            message.content =
                normalizeText(
                    changes.content
                );

            message.text =
                message.content;

        }


        if (
            changes.role !==
            undefined
        ) {

            message.role =
                normalizeRole(
                    changes.role
                );

        }


        if (
            changes.status !==
            undefined
        ) {

            message.status =
                changes.status;

        }


        if (
            changes.language !==
            undefined
        ) {

            message.language =
                changes.language;

        }


        if (
            changes.metadata
        ) {

            message.metadata = {

                ...message.metadata,

                ...clone(
                    changes.metadata
                )

            };

        }


        message.updatedAt =
            isoNow();


        conversation.updatedAt =
            isoNow();


        updateConversationStatistics(
            conversation
        );


        state.statistics.messagesEdited +=
            1;


        saveConversation(
            conversation
        );


        emit(
            "message-edited",
            {

                conversationId:
                    id,

                message:
                    clone(
                        message
                    )

            }
        );


        return clone(
            message
        );

    }


    /* ========================================================
       18 — DELETE MESSAGE
       ======================================================== */

    function deleteMessage(
        conversationId,
        messageId
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        const conversation =
            state.conversations.get(
                id
            );


        if (!conversation) {

            return false;

        }


        const index =
            conversation.messages.findIndex(
                item =>
                    item.id ===
                    messageId
            );


        if (
            index ===
            -1
        ) {

            return false;

        }


        const removed =
            conversation.messages.splice(
                index,
                1
            )[0];


        conversation.updatedAt =
            isoNow();


        updateConversationStatistics(
            conversation
        );


        state.statistics
            .messagesDeleted +=
            1;


        saveConversation(
            conversation
        );


        emit(
            "message-deleted",
            {

                conversationId:
                    id,

                message:
                    clone(
                        removed
                    )

            }
        );


        return true;

    }


    /* ========================================================
       19 — CLEAR MESSAGES
       ======================================================== */

    function clearMessages(
        conversationId
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        const conversation =
            state.conversations.get(
                id
            );


        if (!conversation) {

            return false;

        }


        const count =
            conversation.messages.length;


        conversation.messages =
            [];


        conversation.updatedAt =
            isoNow();


        updateConversationStatistics(
            conversation
        );


        state.statistics
            .messagesCleared +=
            1;


        saveConversation(
            conversation
        );


        emit(
            "messages-cleared",
            {

                conversationId:
                    id,

                count:
                    count

            }
        );


        return true;

    }


    /* ========================================================
       20 — STATUS
       ======================================================== */

    function updateStatus(
        conversationId,
        status
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        const conversation =
            state.conversations.get(
                id
            );


        if (!conversation) {

            return false;

        }


        conversation.status =
            String(
                status ||
                "idle"
            );


        conversation.updatedAt =
            isoNow();


        saveConversation(
            conversation
        );


        emit(
            "status-changed",
            {

                conversationId:
                    id,

                status:
                    conversation.status

            }
        );


        return true;

    }


    function getStatus(
        conversationId
    ) {

        const conversation =
            getConversation(
                conversationId ||
                state.activeConversationId
            );


        return conversation
            ? conversation.status
            : "idle";

    }


    /* ========================================================
       21 — LANGUAGE
       ======================================================== */

    function setLanguage(
        conversationId,
        language
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        const conversation =
            state.conversations.get(
                id
            );


        if (!conversation) {

            return false;

        }


        conversation.language =
            normalizeText(
                language
            ) ||
            "auto";


        conversation.updatedAt =
            isoNow();


        saveConversation(
            conversation
        );


        emit(
            "language-changed",
            {

                conversationId:
                    id,

                language:
                    conversation.language

            }
        );


        return true;

    }


    function getLanguage(
        conversationId
    ) {

        const conversation =
            getConversation(
                conversationId ||
                state.activeConversationId
            );


        return conversation
            ? conversation.language
            : "auto";

    }


    /* ========================================================
       22 — AI MODE
       ======================================================== */

    function setAIMode(
        conversationId,
        mode
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        const conversation =
            state.conversations.get(
                id
            );


        if (!conversation) {

            return false;

        }


        conversation.aiMode =
            normalizeText(
                mode
            ) ||
            "assistant";


        conversation.updatedAt =
            isoNow();


        saveConversation(
            conversation
        );


        emit(
            "ai-mode-changed",
            {

                conversationId:
                    id,

                aiMode:
                    conversation.aiMode

            }
        );


        return true;

    }


    function getAIMode(
        conversationId
    ) {

        const conversation =
            getConversation(
                conversationId ||
                state.activeConversationId
            );


        return conversation
            ? conversation.aiMode
            : "assistant";

    }


    /* ========================================================
       23 — MODEL
       ======================================================== */

    function setModel(
        conversationId,
        model
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        const conversation =
            state.conversations.get(
                id
            );


        if (!conversation) {

            return false;

        }


        conversation.model =
            model ||
            null;


        conversation.updatedAt =
            isoNow();


        saveConversation(
            conversation
        );


        emit(
            "model-changed",
            {

                conversationId:
                    id,

                model:
                    conversation.model

            }
        );


        return true;

    }


    function getModel(
        conversationId
    ) {

        const conversation =
            getConversation(
                conversationId ||
                state.activeConversationId
            );


        return conversation
            ? conversation.model
            : null;

    }


    /* ========================================================
       24 — TITLE
       ======================================================== */

    function setTitle(
        conversationId,
        title
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        const conversation =
            state.conversations.get(
                id
            );


        if (!conversation) {

            return false;

        }


        conversation.title =
            normalizeText(
                title
            ).trim() ||
            "Neue Unterhaltung";


        conversation.updatedAt =
            isoNow();


        saveConversation(
            conversation
        );


        emit(
            "title-changed",
            {

                conversationId:
                    id,

                title:
                    conversation.title

            }
        );


        return true;

    }


    function getTitle(
        conversationId
    ) {

        const conversation =
            getConversation(
                conversationId ||
                state.activeConversationId
            );


        return conversation
            ? conversation.title
            : "";

    }


    /* ========================================================
       25 — CONTEXT
       ======================================================== */

    function getContext(
        conversationId
    ) {

        const conversation =
            getConversation(
                conversationId ||
                state.activeConversationId
            );


        return conversation
            ? clone(
                conversation.context
            )
            : {};

    }


    function setContext(
        conversationId,
        context
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        const conversation =
            state.conversations.get(
                id
            );


        if (!conversation) {

            return false;

        }


        conversation.context =
            clone(
                context ||
                {}
            );


        conversation.updatedAt =
            isoNow();


        saveConversation(
            conversation
        );


        emit(
            "context-changed",
            {

                conversationId:
                    id,

                context:
                    clone(
                        conversation.context
                    )

            }
        );


        return true;

    }


    function updateContext(
        conversationId,
        changes
    ) {

        const current =
            getContext(
                conversationId
            );


        return setContext(
            conversationId,
            {

                ...current,

                ...(changes || {})

            }
        );

    }


    /* ========================================================
       26 — METADATA
       ======================================================== */

    function getMetadata(
        conversationId
    ) {

        const conversation =
            getConversation(
                conversationId ||
                state.activeConversationId
            );


        return conversation
            ? clone(
                conversation.metadata
            )
            : {};

    }


    function setMetadata(
        conversationId,
        metadata
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        const conversation =
            state.conversations.get(
                id
            );


        if (!conversation) {

            return false;

        }


        conversation.metadata =
            clone(
                metadata ||
                {}
            );


        conversation.updatedAt =
            isoNow();


        saveConversation(
            conversation
        );


        emit(
            "metadata-changed",
            {

                conversationId:
                    id,

                metadata:
                    clone(
                        conversation.metadata
                    )

            }
        );


        return true;

    }


    function updateMetadata(
        conversationId,
        changes
    ) {

        return setMetadata(
            conversationId,
            {

                ...getMetadata(
                    conversationId
                ),

                ...(changes || {})

            }
        );

    }


    /* ========================================================
       27 — CONVERSATION SETTINGS
       ======================================================== */

    function getSettings(
        conversationId
    ) {

        const conversation =
            getConversation(
                conversationId ||
                state.activeConversationId
            );


        return conversation
            ? clone(
                conversation.settings
            )
            : {};

    }


    function setSettings(
        conversationId,
        settings
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        const conversation =
            state.conversations.get(
                id
            );


        if (!conversation) {

            return false;

        }


        conversation.settings =
            clone(
                settings ||
                {}
            );


        conversation.updatedAt =
            isoNow();


        saveConversation(
            conversation
        );


        emit(
            "settings-changed",
            {

                conversationId:
                    id,

                settings:
                    clone(
                        conversation.settings
                    )

            }
        );


        return true;

    }


    /* ========================================================
       28 — MEMORY CONTEXT
       ======================================================== */

    function getMemoryContext(
        conversationId
    ) {

        const conversation =
            getConversation(
                conversationId ||
                state.activeConversationId
            );


        if (!conversation) {

            return {};

        }


        return clone(
            conversation.memory ||
            {}
        );

    }


    function setMemoryContext(
        conversationId,
        memory
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        const conversation =
            state.conversations.get(
                id
            );


        if (!conversation) {

            return false;

        }


        conversation.memory =
            clone(
                memory ||
                {}
            );


        conversation.updatedAt =
            isoNow();


        saveConversation(
            conversation
        );


        emit(
            "memory-context-changed",
            {

                conversationId:
                    id,

                memory:
                    clone(
                        conversation.memory
                    )

            }
        );


        return true;

    }


    /* ========================================================
       29 — CONTEXT FOR AI
       ======================================================== */

    function buildAIContext(
        conversationId,
        options = {}
    ) {

        const conversation =
            getConversation(
                conversationId ||
                state.activeConversationId
            );


        if (!conversation) {

            return {

                conversationId:
                    null,

                messages:
                    [],

                context:
                    {},

                memory:
                    {},

                language:
                    "auto",

                aiMode:
                    "assistant",

                model:
                    null

            };

        }


        let messages =
            conversation.messages
                .map(
                    message => ({

                        role:
                            message.role,

                        content:
                            message.content,

                        id:
                            message.id,

                        timestamp:
                            message.timestamp

                    })
                );


        const limit =
            Number(
                options.maxMessages
            );


        if (
            Number.isFinite(
                limit
            ) &&
            limit > 0
        ) {

            messages =
                messages.slice(
                    -limit
                );

        }


        return {

            conversationId:
                conversation.id,

            title:
                conversation.title,

            language:
                conversation.language,

            aiMode:
                conversation.aiMode,

            model:
                conversation.model,

            messages:
                messages,

            context:
                clone(
                    conversation.context
                ),

            memory:
                clone(
                    conversation.memory
                ),

            metadata:
                clone(
                    conversation.metadata
                )

        };

    }


    /* ========================================================
       30 — SEARCH
       ======================================================== */

    function search(
        query
    ) {

        const value =
            normalizeText(
                query
            )
            .trim()
            .toLowerCase();


        state.statistics.searches +=
            1;


        if (!value) {

            return getAll();

        }


        const results = [];


        state.conversations.forEach(
            conversation => {

                const haystack = [

                    conversation.title,

                    conversation.language,

                    conversation.aiMode,

                    JSON.stringify(
                        conversation.metadata
                    ),

                    ...conversation.messages
                        .map(
                            message =>
                                message.content
                        )

                ]
                .join(" ")
                .toLowerCase();


                if (
                    haystack.includes(
                        value
                    )
                ) {

                    results.push(
                        clone(
                            conversation
                        )
                    );

                }

            }
        );


        emit(
            "search",
            {

                query:
                    query,

                results:
                    results.length

            }
        );


        return results;

    }


    /* ========================================================
       31 — DELETE CONVERSATION
       ======================================================== */

    function deleteConversation(
        conversationId
    ) {

        const id =
            normalizeId(
                conversationId
            );


        if (
            !state.conversations.has(
                id
            )
        ) {

            return false;

        }


        state.conversations.delete(
            id
        );


        removeStoredConversation(
            id
        );


        state.statistics
            .conversationsDeleted +=
            1;


        if (
            state.activeConversationId ===
            id
        ) {

            state.activeConversationId =
                null;


            saveActiveConversation(
                null
            );

        }


        saveIndex();


        emit(
            "conversation-deleted",
            {

                conversationId:
                    id

            }
        );


        return true;

    }


    /* ========================================================
       32 — DUPLICATE CONVERSATION
       ======================================================== */

    function duplicateConversation(
        conversationId,
        options = {}
    ) {

        const original =
            getConversation(
                conversationId
            );


        if (!original) {

            return null;

        }


        const duplicate =
            createConversation(
                {

                    ...original,

                    id:
                        generateId(
                            "conversation"
                        ),

                    title:
                        options.title ||
                        (
                            original.title +
                            " Kopie"
                        ),

                    messages:
                        original.messages
                            .map(
                                message => ({
                                    ...clone(
                                        message
                                    ),

                                    id:
                                        generateId(
                                            "message"
                                        )

                                })
                            )

                }
            );


        saveConversation(
            duplicate
        );


        emit(
            "conversation-duplicated",
            {

                originalId:
                    original.id,

                conversation:
                    clone(
                        duplicate
                    )

            }
        );


        return duplicate;

    }


    /* ========================================================
       33 — STORAGE
       ======================================================== */

    function conversationKey(
        conversationId
    ) {

        return (
            STORAGE_PREFIX +
            normalizeId(
                conversationId
            )
        );

    }


    function saveConversation(
        conversation
    ) {

        if (!conversation) {

            return false;

        }


        const data =
            clone(
                conversation
            );


        /*
         * Bevorzugt vorhandenen
         * HalDo Storage verwenden.
         */

        const storage =
            getStorage();


        if (
            storage &&
            hasMethod(
                storage,
                "set"
            )
        ) {

            try {

                storage.set(
                    conversationKey(
                        conversation.id
                    ),
                    data
                );


                state.connections.storage =
                    true;

                saveIndex();


                return true;

            } catch (exception) {

                reportError(
                    exception,
                    "HalDo Storage"
                );

            }

        }


        /*
         * Fallback:
         * LocalStorage
         */

        try {

            window.localStorage.setItem(
                conversationKey(
                    conversation.id
                ),
                JSON.stringify(
                    data
                )
            );


            state.connections.storage =
                true;


            saveIndex();


            return true;

        } catch (exception) {

            reportError(
                exception,
                "LocalStorage Conversation"
            );


            return false;

        }

    }


    function loadConversation(
        conversationId
    ) {

        const id =
            normalizeId(
                conversationId
            );


        if (!id) {

            return null;

        }


        const storage =
            getStorage();


        if (
            storage &&
            hasMethod(
                storage,
                "get"
            )
        ) {

            try {

                const result =
                    storage.get(
                        conversationKey(
                            id
                        )
                    );


                if (result) {

                    return createConversation(
                        result
                    );

                }

            } catch (exception) {

                reportError(
                    exception,
                    "HalDo Storage Laden"
                );

            }

        }


        try {

            const raw =
                window.localStorage.getItem(
                    conversationKey(
                        id
                    )
                );


            if (!raw) {

                return null;

            }


            const parsed =
                JSON.parse(
                    raw
                );


            if (!parsed) {

                return null;

            }


            return createConversation(
                parsed
            );

        } catch (exception) {

            reportError(
                exception,
                "LocalStorage Laden"
            );


            return null;

        }

    }


    function removeStoredConversation(
        conversationId
    ) {

        const key =
            conversationKey(
                conversationId
            );


        const storage =
            getStorage();


        if (
            storage &&
            hasMethod(
                storage,
                "remove"
            )
        ) {

            try {

                storage.remove(
                    key
                );

                return true;

            } catch (_) {}

        }


        if (
            storage &&
            hasMethod(
                storage,
                "delete"
            )
        ) {

            try {

                storage.delete(
                    key
                );

                return true;

            } catch (_) {}

        }


        try {

            window.localStorage.removeItem(
                key
            );


            return true;

        } catch (_) {

            return false;

        }

    }


    /* ========================================================
       34 — INDEX STORAGE
       ======================================================== */

    function saveIndex() {

        try {

            const ids =
                Array.from(
                    state.conversations.keys()
                );


            window.localStorage.setItem(
                INDEX_KEY,
                JSON.stringify(
                    ids
                )
            );


            return true;

        } catch (_) {

            return false;

        }

    }


    function loadIndex() {

        try {

            const raw =
                window.localStorage.getItem(
                    INDEX_KEY
                );


            if (!raw) {

                return [];

            }


            const parsed =
                JSON.parse(
                    raw
                );


            return Array.isArray(
                parsed
            )
                ? parsed
                : [];

        } catch (exception) {

            reportError(
                exception,
                "Conversation Index laden"
            );


            return [];

        }

    }


    function saveActiveConversation(
        conversationId
    ) {

        try {

            if (
                conversationId
            ) {

                window.localStorage.setItem(
                    ACTIVE_KEY,
                    conversationId
                );

            } else {

                window.localStorage.removeItem(
                    ACTIVE_KEY
                );

            }


            return true;

        } catch (_) {

            return false;

        }

    }


    function loadActiveConversation() {

        try {

            return (
                window.localStorage.getItem(
                    ACTIVE_KEY
                ) ||
                null
            );

        } catch (_) {

            return null;

        }

    }


    /* ========================================================
       35 — LOAD ALL
       ======================================================== */

    function loadAll() {

        const ids =
            loadIndex();


        let loaded =
            0;


        ids.forEach(
            id => {

                const conversation =
                    loadConversation(
                        id
                    );


                if (
                    conversation
                ) {

                    state.conversations.set(
                        conversation.id,
                        conversation
                    );


                    loaded +=
                        1;

                }

            }
        );


        /*
         * Aktive Unterhaltung
         */

        const activeId =
            loadActiveConversation();


        if (
            activeId &&
            state.conversations.has(
                normalizeId(
                    activeId
                )
            )
        ) {

            state.activeConversationId =
                normalizeId(
                    activeId
                );

        }


        emit(
            "loaded",
            {

                count:
                    loaded,

                activeConversationId:
                    state.activeConversationId

            }
        );


        return loaded;

    }


    /* ========================================================
       36 — EXPORT
       ======================================================== */

    function exportConversation(
        conversationId
    ) {

        const conversation =
            getConversation(
                conversationId ||
                state.activeConversationId
            );


        if (!conversation) {

            return null;

        }


        state.statistics.exports +=
            1;


        return {

            format:
                "haldo-conversation",

            version:
                VERSION,

            exportedAt:
                isoNow(),

            conversation:
                conversation

        };

    }


    function exportAll() {

        state.statistics.exports +=
            1;


        return {

            format:
                "haldo-conversations",

            version:
                VERSION,

            exportedAt:
                isoNow(),

            activeConversationId:
                state.activeConversationId,

            conversations:
                getAll()

        };

    }


    /* ========================================================
       37 — IMPORT
       ======================================================== */

    function importConversation(
        data,
        options = {}
    ) {

        if (!data) {

            return null;

        }


        try {

            const source =
                data.conversation ||
                data;


            if (
                !source ||
                !source.id
            ) {

                throw new Error(
                    "Ungültige Conversation-Daten."
                );

            }


            let id =
                normalizeId(
                    source.id
                );


            if (
                state.conversations.has(
                    id
                ) &&
                options.overwrite !==
                true
            ) {

                id =
                    generateId(
                        "conversation"
                    );

            }


            const conversation =
                createConversation(
                    {

                        ...source,

                        id:
                            id

                    }
                );


            saveConversation(
                conversation
            );


            state.statistics.imports +=
                1;


            emit(
                "conversation-imported",
                {

                    conversation:
                        clone(
                            conversation
                        )

                }
            );


            return conversation;

        } catch (exception) {

            reportError(
                exception,
                "Conversation Import"
            );


            return null;

        }

    }


    function importAll(
        data,
        options = {}
    ) {

        if (
            !data ||
            !Array.isArray(
                data.conversations
            )
        ) {

            return [];

        }


        const imported = [];


        data.conversations.forEach(
            conversation => {

                const result =
                    importConversation(
                        {
                            conversation:
                                conversation
                        },
                        options
                    );


                if (result) {

                    imported.push(
                        result
                    );

                }

            }
        );


        if (
            data.activeConversationId
        ) {

            const activeId =
                normalizeId(
                    data.activeConversationId
                );


            if (
                state.conversations.has(
                    activeId
                )
            ) {

                setActiveConversation(
                    activeId
                );

            }

        }


        return imported;

    }


    /* ========================================================
       38 — AI SERVICE BRIDGE
       ======================================================== */

    async function prepareAIContext(
        conversationId,
        options = {}
    ) {

        const context =
            buildAIContext(
                conversationId,
                options
            );


        /*
         * AI Memory vorbereiten
         */

        const memory =
            getAIMemory();


        if (
            memory
        ) {

            try {

                if (
                    hasMethod(
                        memory,
                        "getContext"
                    )
                ) {

                    const memoryContext =
                        await memory.getContext(
                            context
                                .conversationId
                        );


                    if (
                        memoryContext
                    ) {

                        context.memory =
                            {

                                ...context.memory,

                                ...clone(
                                    memoryContext
                                )

                            };

                    }

                }

            } catch (exception) {

                reportError(
                    exception,
                    "AI Memory Context"
                );

            }

        }


        /*
         * AI Core kann später direkt
         * diesen Context übernehmen.
         */

        emit(
            "ai-context-prepared",
            {
                context:
                    clone(
                        context
                    )
            }
        );


        return context;

    }


    /* ========================================================
       39 — AI RESPONSE LIFECYCLE
       ======================================================== */

    function beginAIResponse(
        conversationId,
        options = {}
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        updateStatus(
            id,
            "thinking"
        );


        emit(
            "ai-response-started",
            {

                conversationId:
                    id,

                options:
                    clone(
                        options
                    )

            }
        );


        return true;

    }


    function updateAIResponse(
        conversationId,
        content,
        options = {}
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        updateStatus(
            id,
            "generating"
        );


        emit(
            "ai-response-updated",
            {

                conversationId:
                    id,

                content:
                    normalizeText(
                        content
                    ),

                options:
                    clone(
                        options
                    )

            }
        );


        return true;

    }


    function completeAIResponse(
        conversationId,
        content,
        options = {}
    ) {

        const message =
            addAssistantMessage(
                content,
                {

                    ...options,

                    conversationId:
                        conversationId ||
                        state.activeConversationId

                }
            );


        updateStatus(
            conversationId ||
            state.activeConversationId,
            "idle"
        );


        emit(
            "ai-response-completed",
            {

                conversationId:
                    conversationId ||
                    state.activeConversationId,

                message:
                    clone(
                        message
                    )

            }
        );


        return message;

    }


    function failAIResponse(
        conversationId,
        error
    ) {

        const id =
            normalizeId(
                conversationId ||
                state.activeConversationId
            );


        updateStatus(
            id,
            "error"
        );


        emit(
            "ai-response-error",
            {

                conversationId:
                    id,

                error:
                    error instanceof Error
                        ? error.message
                        : String(
                            error || ""
                        )

            }
        );


        return true;

    }


    /* ========================================================
       40 — REMOVE EMPTY CONVERSATIONS
       ======================================================== */

    function cleanupEmpty(
        options = {}
    ) {

        const removeActive =
            options.removeActive ===
            true;


        const removed = [];


        Array.from(
            state.conversations.values()
        )
        .forEach(
            conversation => {

                if (
                    conversation.messages
                        .length ===
                    0
                ) {

                    if (
                        conversation.id ===
                        state.activeConversationId &&
                        !removeActive
                    ) {

                        return;

                    }


                    deleteConversation(
                        conversation.id
                    );


                    removed.push(
                        conversation.id
                    );

                }

            }
        );


        return removed;

    }


    /* ========================================================
       41 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        return {

            name:
                NAME,

            version:
                VERSION,

            module:
                MODULE_ID,

            initialized:
                state.initialized,

            initializing:
                state.initializing,

            ready:
                state.ready,

            failed:
                state.failed,

            conversationCount:
                state.conversations.size,

            activeConversationId:
                state.activeConversationId,

            connections: {

                kernel:
                    !!getKernel(),

                system:
                    !!getSystem(),

                aiCore:
                    !!getAICore(),

                aiEngine:
                    !!getAIEngine(),

                aiChat:
                    !!getAIChat(),

                aiMemory:
                    !!getAIMemory(),

                aiLanguage:
                    !!getAILanguage(),

                storage:
                    !!getStorage()

            },

            statistics:
                {
                    ...state.statistics
                },

            conversations:
                getAll().map(
                    conversation => ({

                        id:
                            conversation.id,

                        title:
                            conversation.title,

                        status:
                            conversation.status,

                        language:
                            conversation.language,

                        aiMode:
                            conversation.aiMode,

                        messageCount:
                            conversation.messages
                                .length,

                        updatedAt:
                            conversation.updatedAt

                    })
                ),

            timestamp:
                isoNow()

        };

    }


    /* ========================================================
       42 — HEALTH CHECK
       ======================================================== */

    function healthCheck() {

        const problems =
            [];


        if (
            !getKernel()
        ) {

            problems.push(
                "Kernel nicht verbunden."
            );

        }


        if (
            !getSystem()
        ) {

            problems.push(
                "System nicht verbunden."
            );

        }


        if (
            !getAICore()
        ) {

            problems.push(
                "AI Core noch nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length ===
                0,

            ready:
                state.ready,

            problems:
                problems,

            conversationCount:
                getCount(),

            activeConversationId:
                state.activeConversationId,

            timestamp:
                isoNow()

        };

    }


    /* ========================================================
       43 — CONNECTION STATUS
       ======================================================== */

    function refreshConnections() {

        state.connections.kernel =
            !!getKernel();


        state.connections.system =
            !!getSystem();


        state.connections.aiCore =
            !!getAICore();


        state.connections.aiEngine =
            !!getAIEngine();


        state.connections.aiChat =
            !!getAIChat();


        state.connections.aiMemory =
            !!getAIMemory();


        state.connections.aiLanguage =
            !!getAILanguage();


        state.connections.storage =
            !!getStorage();


        return {
            ...state.connections
        };

    }


    function getConnectionStatus() {

        return {

            kernel:
                !!getKernel(),

            system:
                !!getSystem(),

            aiCore:
                !!getAICore(),

            aiEngine:
                !!getAIEngine(),

            aiChat:
                !!getAIChat(),

            aiMemory:
                !!getAIMemory(),

            aiLanguage:
                !!getAILanguage(),

            storage:
                !!getStorage()

        };

    }


    /* ========================================================
       44 — KERNEL CONNECTION
       ======================================================== */

    function connectKernel() {

        const kernel =
            getKernel();


        if (!kernel) {

            return false;

        }


        try {

            if (
                hasMethod(
                    kernel,
                    "registerModule"
                )
            ) {

                kernel.registerModule(
                    MODULE_ID,
                    api
                );

            }


            if (
                hasMethod(
                    kernel,
                    "setModuleReady"
                )
            ) {

                kernel.setModuleReady(
                    MODULE_ID,
                    true
                );

            }


            state.connections.kernel =
                true;


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Kernel Connection"
            );


            return false;

        }

    }


    /* ========================================================
       45 — KERNEL EVENTS
       ======================================================== */

    function connectKernelEvents() {

        const kernel =
            getKernel();


        if (
            !kernel ||
            !hasMethod(
                kernel,
                "on"
            )
        ) {

            return false;

        }


        try {

            kernel.on(
                "kernel:ready",
                function () {

                    refreshConnections();

                    emit(
                        "kernel-ready"
                    );

                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Kernel Events"
            );


            return false;

        }

    }


    /* ========================================================
       46 — INITIALIZATION
       ======================================================== */

    async function initialize() {

        if (
            state.ready
        ) {

            return api;

        }


        if (
            state.initializing
        ) {

            return api;

        }


        state.initializing =
            true;


        state.initialized =
            true;


        state.failed =
            false;


        emit(
            "initializing",
            {
                version:
                    VERSION
            }
        );


        try {

            refreshConnections();

            connectKernel();

            connectKernelEvents();


            /*
             * Bereits gespeicherte
             * Gespräche laden.
             */

            loadAll();


            /*
             * Falls noch keine Unterhaltung
             * existiert, erstellen wir eine.
             */

            if (
                state.conversations.size ===
                0
            ) {

                newConversation(
                    {
                        title:
                            "Neue Unterhaltung"
                    }
                );

            }


            /*
             * Falls keine gültige aktive
             * Conversation vorhanden ist.
             */

            if (
                !state.activeConversationId
            ) {

                const first =
                    Array.from(
                        state.conversations
                            .keys()
                    )[0];


                if (first) {

                    setActiveConversation(
                        first
                    );

                }

            }


            state.ready =
                true;


            state.initializing =
                false;


            emit(
                "ready",
                {

                    version:
                        VERSION,

                    conversationCount:
                        getCount(),

                    activeConversationId:
                        state.activeConversationId

                }
            );


            log(
                "Conversation State bereit.",
                VERSION,
                "Conversations:",
                getCount()
            );


            return api;

        } catch (exception) {

            state.initializing =
                false;

            state.failed =
                true;


            reportError(
                exception,
                "Conversation State Initialisierung"
            );


            return api;

        }

    }


    /* ========================================================
       47 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


        /* State */

        getState:
            function () {

                return {

                    initialized:
                        state.initialized,

                    initializing:
                        state.initializing,

                    ready:
                        state.ready,

                    failed:
                        state.failed,

                    conversationCount:
                        getCount(),

                    activeConversationId:
                        state.activeConversationId,

                    connections:
                        getConnectionStatus()

                };

            },


        /* Events */

        on:
            on,

        off:
            off,

        emit:
            emit,


        /* Conversations */

        createConversation:
            createConversation,

        newConversation:
            newConversation,

        startConversation:
            startConversation,

        get:
            get,

        getConversation:
            getConversation,

        getAll:
            getAll,

        getConversations:
            getConversations,

        has:
            has,

        getCount:
            getCount,

        activate:
            activate,

        setActiveConversation:
            setActiveConversation,

        getActiveId:
            getActiveId,

        getActiveConversation:
            getActiveConversation,

        deleteConversation:
            deleteConversation,

        duplicateConversation:
            duplicateConversation,


        /* Messages */

        getMessages:
            getMessages,

        getMessage:
            getMessage,

        addMessage:
            addMessage,

        addUserMessage:
            addUserMessage,

        addAssistantMessage:
            addAssistantMessage,

        addSystemMessage:
            addSystemMessage,

        editMessage:
            editMessage,

        deleteMessage:
            deleteMessage,

        clearMessages:
            clearMessages,


        /* Conversation state */

        updateStatus:
            updateStatus,

        getStatus:
            getStatus,

        setLanguage:
            setLanguage,

        getLanguage:
            getLanguage,

        setAIMode:
            setAIMode,

        getAIMode:
            getAIMode,

        setModel:
            setModel,

        getModel:
            getModel,


        /* Title */

        setTitle:
            setTitle,

        getTitle:
            getTitle,


        /* Context */

        getContext:
            getContext,

        setContext:
            setContext,

        updateContext:
            updateContext,


        /* Metadata */

        getMetadata:
            getMetadata,

        setMetadata:
            setMetadata,

        updateMetadata:
            updateMetadata,


        /* Settings */

        getSettings:
            getSettings,

        setSettings:
            setSettings,


        /* Memory */

        getMemoryContext:
            getMemoryContext,

        setMemoryContext:
            setMemoryContext,


        /* AI */

        buildAIContext:
            buildAIContext,

        prepareAIContext:
            prepareAIContext,

        beginAIResponse:
            beginAIResponse,

        updateAIResponse:
            updateAIResponse,

        completeAIResponse:
            completeAIResponse,

        failAIResponse:
            failAIResponse,


        /* Search */

        search:
            search,


        /* Storage */

        saveConversation:
            saveConversation,

        loadConversation:
            loadConversation,

        loadAll:
            loadAll,

        cleanupEmpty:
            cleanupEmpty,


        /* Import / Export */

        exportConversation:
            exportConversation,

        exportAll:
            exportAll,

        importConversation:
            importConversation,

        importAll:
            importAll,


        /* Connections */

        refreshConnections:
            refreshConnections,

        getConnectionStatus:
            getConnectionStatus,

        connectKernel:
            connectKernel,


        /* Diagnostics */

        diagnostics:
            diagnostics,

        healthCheck:
            healthCheck

    };


    /* ========================================================
       48 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoConversationState =
        api;


    window.HalDoConversationStateManager =
        api;


    window.HalDoOSConversationState =
        api;


    HalDoOS.conversationState =
        api;


    /* ========================================================
       49 — DOM BOOT
       ======================================================== */

    function boot() {

        initialize()
            .catch(
                exception => {

                    reportError(
                        exception,
                        "Conversation State Boot"
                    );

                }
            );

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


    /* ========================================================
       50 — FINAL CONNECTION
       ======================================================== */

    HalDoOS.conversationState =
        api;


    window.HalDoConversationState =
        api;


    window.HalDoConversationStateManager =
        api;


    log(
        "HalDo AI OS 20 Conversation State geladen."
    );


    /* ========================================================
       END
       HALDO AI OS 20
       CONVERSATION STATE MANAGER
       ======================================================== */

})(window, document);