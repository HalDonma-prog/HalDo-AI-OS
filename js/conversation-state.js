/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
       js/conversation-state.js

   HALDO AI CONVERSATION STATE ENGINE

   Verantwortlich für:
   - Gespräche
   - Nachrichten
   - Rollen
   - Kontext
   - aktive Unterhaltung
   - Conversation IDs
   - Nachricht IDs
   - Verlauf
   - System-/AI-/User-Nachrichten
   - Typing/Thinking/Streaming Status
   - Fehlerzustände
   - Sprache
   - Metadaten
   - Import / Export
   - lokale Speicherung
   - Events
   - AI Engine Integration
   - Memory Integration
   - zukünftige Provider
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
        "HalDo AI Conversation State";


    /* ========================================================
       03 — CONSTANTS
       ======================================================== */

    const STORAGE_PREFIX =
        "haldo.ai.conversation.";

    const INDEX_KEY =
        "haldo.ai.conversations.index";

    const MAX_MESSAGES =
        1000;


    /* ========================================================
       04 — INTERNAL STATE
       ======================================================== */

    const state = {

        initialized:
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

        statistics: {

            conversationsCreated:
                0,

            conversationsDeleted:
                0,

            messagesAdded:
                0,

            messagesRemoved:
                0,

            messagesCleared:
                0,

            imports:
                0,

            exports:
                0,

            errors:
                0

        }

    };


    /* ========================================================
       05 — SAFE HELPERS
       ======================================================== */

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
        prefix
    ) {

        const random =
            Math.random()
                .toString(36)
                .slice(2, 10);

        return (
            String(
                prefix ||
                "id"
            ) +
            "-" +
            Date.now().toString(36) +
            "-" +
            random
        );

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
                        clone(
                            value[key]
                        );

                }
            );

            return result;

        }


        return value;

    }


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


    /* ========================================================
       06 — LOGGING
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
       07 — SERVICES
       ======================================================== */

    function getStorage() {

        return (
            window.HalDoStorage ||
            HalDoOS.storage ||
            null
        );

    }


    function getStorageManager() {

        return (
            window.HalDoStorageManager ||
            HalDoOS.storageManager ||
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
            HalDoOS.aiLanguage ||
            null
        );

    }


    /* ========================================================
       08 — EVENTS
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
                            "Event: " +
                            event
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
                    "conversation:" +
                    event,
                    data
                );

            } catch (_) {}

        }

    }


    /* ========================================================
       09 — ERROR HANDLING
       ======================================================== */

    function reportError(
        exception,
        context
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

            name:
                normalized.name,

            message:
                normalized.message,

            stack:
                normalized.stack ||
                "",

            context:
                context ||
                MODULE_ID,

            timestamp:
                Date.now()

        };


        errorLog(
            "[HalDo Conversation State]",
            record
        );


        emit(
            "error",
            record
        );


        return record;

    }


    /* ========================================================
       10 — DEFAULT CONVERSATION
       ======================================================== */

    function createConversationObject(
        options = {}
    ) {

        const now =
            Date.now();


        const id =
            normalizeId(
                options.id
            ) ||
            generateId(
                "conversation"
            );


        return {

            id:

                id,

            title:

                options.title ||
                "Neue Unterhaltung",

            description:

                options.description ||
                "",

            createdAt:

                options.createdAt ||
                now,

            updatedAt:

                options.updatedAt ||
                now,

            language:

                options.language ||
                "auto",

            direction:

                options.direction ||
                "ltr",

            model:

                options.model ||
                null,

            provider:

                options.provider ||
                null,

            systemPrompt:

                options.systemPrompt ||
                "",

            temperature:

                typeof options.temperature ===
                "number"
                    ? options.temperature
                    : 0.7,

            messages:

                Array.isArray(
                    options.messages
                )
                    ? options.messages.map(
                        normalizeMessage
                    )
                    : [],

            context:

                options.context &&
                typeof options.context ===
                "object"
                    ? clone(
                        options.context
                    )
                    : {},

            metadata:

                options.metadata &&
                typeof options.metadata ===
                "object"
                    ? clone(
                        options.metadata
                    )
                    : {},

            flags: {

                archived:
                    !!(
                        options.flags &&
                        options.flags.archived
                    ),

                favorite:
                    !!(
                        options.flags &&
                        options.flags.favorite
                    ),

                pinned:
                    !!(
                        options.flags &&
                        options.flags.pinned
                    )

            },

            status:

                options.status ||
                "idle",

            error:

                null

        };

    }


    /* ========================================================
       11 — MESSAGE NORMALIZATION
       ======================================================== */

    function normalizeRole(
        role
    ) {

        const value =
            String(
                role ||
                "user"
            )
            .trim()
            .toLowerCase();


        const allowed = [

            "system",
            "user",
            "assistant",
            "developer",
            "tool",

        ];


        return allowed.includes(
            value
        )
            ? value
            : "user";

    }


    function normalizeMessage(
        message
    ) {

        if (
            typeof message ===
            "string"
        ) {

            return {

                id:
                    generateId(
                        "message"
                    ),

                role:
                    "user",

                content:
                    message,

                timestamp:
                    Date.now(),

                language:
                    "auto",

                status:
                    "complete",

                metadata:
                    {}

            };

        }


        const input =
            message || {};


        return {

            id:

                input.id ||
                generateId(
                    "message"
                ),

            role:

                normalizeRole(
                    input.role
                ),

            content:

                typeof input.content ===
                "string"
                    ? input.content
                    : String(
                        input.content ||
                        ""
                    ),

            timestamp:

                input.timestamp ||
                Date.now(),

            language:

                input.language ||
                "auto",

            status:

                input.status ||
                "complete",

            replyTo:

                input.replyTo ||
                null,

            parentId:

                input.parentId ||
                null,

            model:

                input.model ||
                null,

            provider:

                input.provider ||
                null,

            tokens:

                typeof input.tokens ===
                "number"
                    ? input.tokens
                    : null,

            metadata:

                input.metadata &&
                typeof input.metadata ===
                "object"
                    ? clone(
                        input.metadata
                    )
                    : {}

        };

    }


    /* ========================================================
       12 — STORAGE
       ======================================================== */

    function storageKey(
        conversationId
    ) {

        return (
            STORAGE_PREFIX +
            normalizeId(
                conversationId
            )
        );

    }


    function saveIndex() {

        try {

            const index =
                Array.from(
                    state.conversations.values()
                )
                .map(
                    conversation => ({

                        id:
                            conversation.id,

                        title:
                            conversation.title,

                        createdAt:
                            conversation.createdAt,

                        updatedAt:
                            conversation.updatedAt,

                        language:
                            conversation.language,

                        archived:
                            conversation.flags &&
                            conversation.flags.archived,

                        favorite:
                            conversation.flags &&
                            conversation.flags.favorite,

                        pinned:
                            conversation.flags &&
                            conversation.flags.pinned

                    })
                );


            window.localStorage.setItem(
                INDEX_KEY,
                JSON.stringify(
                    index
                )
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Conversation Index speichern"
            );


            return false;

        }

    }


    function saveConversation(
        conversation
    ) {

        if (!conversation) {

            return false;

        }


        try {

            const serialized =
                JSON.stringify(
                    conversation
                );


            /*
             * Primär über HalDo Storage,
             * falls vorhanden.
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
                        storageKey(
                            conversation.id
                        ),
                        conversation
                    );

                } catch (_) {}

            }


            /*
             * Fallback:
             * localStorage.
             */

            window.localStorage.setItem(
                storageKey(
                    conversation.id
                ),
                serialized
            );


            saveIndex();


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Conversation speichern"
            );


            return false;

        }

    }


    function loadConversationFromStorage(
        id
    ) {

        const normalized =
            normalizeId(
                id
            );


        if (!normalized) {

            return null;

        }


        try {

            const storage =
                getStorage();


            if (
                storage &&
                hasMethod(
                    storage,
                    "get"
                )
            ) {

                const stored =
                    storage.get(
                        storageKey(
                            normalized
                        )
                    );


                if (stored) {

                    return createConversationObject(
                        stored
                    );

                }

            }

        } catch (exception) {

            reportError(
                exception,
                "HalDo Storage Conversation laden"
            );

        }


        try {

            const raw =
                window.localStorage.getItem(
                    storageKey(
                        normalized
                    )
                );


            if (!raw) {

                return null;

            }


            return createConversationObject(
                JSON.parse(
                    raw
                )
            );

        } catch (exception) {

            reportError(
                exception,
                "Conversation laden"
            );


            return null;

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


    /* ========================================================
       13 — CREATE
       ======================================================== */

    function create(
        options = {}
    ) {

        try {

            let conversation =
                createConversationObject(
                    options
                );


            /*
             * ID-Kollision vermeiden.
             */

            while (
                state.conversations.has(
                    conversation.id
                )
            ) {

                conversation.id =
                    generateId(
                        "conversation"
                    );

            }


            state.conversations.set(
                conversation.id,
                conversation
            );


            state.statistics
                .conversationsCreated +=
                1;


            saveConversation(
                conversation
            );


            if (
                options.activate !==
                false
            ) {

                setActive(
                    conversation.id
                );

            }


            emit(
                "created",
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

        } catch (exception) {

            reportError(
                exception,
                "Conversation erstellen"
            );


            return null;

        }

    }


    function createConversation(
        options
    ) {

        return create(
            options
        );

    }


    /* ========================================================
       14 — GET
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


        if (
            state.conversations.has(
                id
            )
        ) {

            return clone(
                state.conversations.get(
                    id
                )
            );

        }


        const loaded =
            loadConversationFromStorage(
                id
            );


        if (loaded) {

            state.conversations.set(
                id,
                loaded
            );


            return clone(
                loaded
            );

        }


        return null;

    }


    function getConversation(
        conversationId
    ) {

        return get(
            conversationId
        );

    }


    function getAll(
        options = {}
    ) {

        const includeArchived =
            options.includeArchived ===
            true;


        return Array.from(
            state.conversations.values()
        )
        .filter(
            conversation => {

                if (
                    includeArchived
                ) {

                    return true;

                }


                return !(
                    conversation.flags &&
                    conversation.flags.archived
                );

            }
        )
        .sort(
            (
                a,
                b
            ) =>
                b.updatedAt -
                a.updatedAt
        )
        .map(
            clone
        );

    }


    function getConversations(
        options
    ) {

        return getAll(
            options
        );

    }


    /* ========================================================
       15 — ACTIVE CONVERSATION
       ======================================================== */

    function setActive(
        conversationId
    ) {

        const id =
            normalizeId(
                conversationId
            );


        if (!id) {

            return false;

        }


        const conversation =
            get(
                id
            );


        if (!conversation) {

            return false;

        }


        state.activeConversationId =
            id;


        emit(
            "active-changed",
            {
                conversationId:
                    id,

                conversation:
                    conversation
            }
        );


        return true;

    }


    function getActive() {

        if (
            !state.activeConversationId
        ) {

            return null;

        }


        return get(
            state.activeConversationId
        );

    }


    function getActiveId() {

        return state.activeConversationId;

    }


    /* ========================================================
       16 — MESSAGE OPERATIONS
       ======================================================== */

    function addMessage(
        conversationId,
        message,
        options = {}
    ) {

        const id =
            normalizeId(
                conversationId
            );


        if (!id) {

            return null;

        }


        let conversation =
            state.conversations.get(
                id
            );


        if (!conversation) {

            const loaded =
                loadConversationFromStorage(
                    id
                );


            if (!loaded) {

                return null;

            }


            conversation =
                loaded;

            state.conversations.set(
                id,
                conversation
            );

        }


        const normalized =
            normalizeMessage(
                message
            );


        if (
            options.language
        ) {

            normalized.language =
                options.language;

        }


        if (
            options.status
        ) {

            normalized.status =
                options.status;

        }


        conversation.messages.push(
            normalized
        );


        /*
         * Schutz gegen unendliches
         * Speicherwachstum.
         */

        if (
            conversation.messages.length >
            MAX_MESSAGES
        ) {

            conversation.messages =
                conversation.messages.slice(
                    -MAX_MESSAGES
                );

        }


        conversation.updatedAt =
            Date.now();


        conversation.status =
            "active";


        conversation.error =
            null;


        state.statistics
            .messagesAdded +=
            1;


        saveConversation(
            conversation
        );


        emit(
            "message-added",
            {

                conversationId:
                    id,

                message:
                    clone(
                        normalized
                    ),

                conversation:
                    clone(
                        conversation
                    )

            }
        );


        /*
         * Memory Hook
         */

        const memory =
            getAIMemory();


        if (
            memory &&
            hasMethod(
                memory,
                "remember"
            )
        ) {

            try {

                memory.remember(
                    {
                        conversationId:
                            id,

                        message:
                            clone(
                                normalized
                            )
                    }
                );

            } catch (exception) {

                reportError(
                    exception,
                    "AI Memory Hook"
                );

            }

        }


        return clone(
            normalized
        );

    }


    function addUserMessage(
        conversationId,
        content,
        options = {}
    ) {

        return addMessage(
            conversationId,
            {

                role:
                    "user",

                content:
                    content,

                language:
                    options.language ||
                    "auto",

                metadata:
                    options.metadata ||
                    {}

            },
            options
        );

    }


    function addAssistantMessage(
        conversationId,
        content,
        options = {}
    ) {

        return addMessage(
            conversationId,
            {

                role:
                    "assistant",

                content:
                    content,

                language:
                    options.language ||
                    "auto",

                model:
                    options.model ||
                    null,

                provider:
                    options.provider ||
                    null,

                metadata:
                    options.metadata ||
                    {}

            },
            options
        );

    }


    function addSystemMessage(
        conversationId,
        content,
        options = {}
    ) {

        return addMessage(
            conversationId,
            {

                role:
                    "system",

                content:
                    content,

                language:
                    options.language ||
                    "auto",

                metadata:
                    options.metadata ||
                    {}

            },
            options
        );

    }


    function getMessages(
        conversationId,
        options = {}
    ) {

        const conversation =
            get(
                conversationId
            );


        if (!conversation) {

            return [];

        }


        let messages =
            conversation.messages || [];


        if (
            options.role
        ) {

            messages =
                messages.filter(
                    message =>
                        message.role ===
                        normalizeRole(
                            options.role
                        )
                );

        }


        if (
            typeof options.limit ===
            "number"
        ) {

            messages =
                messages.slice(
                    -Math.max(
                        0,
                        options.limit
                    )
                );

        }


        return clone(
            messages
        );

    }


    function getLastMessage(
        conversationId
    ) {

        const messages =
            getMessages(
                conversationId
            );


        return messages.length
            ? messages[
                messages.length - 1
            ]
            : null;

    }


    function removeMessage(
        conversationId,
        messageId
    ) {

        const conversation =
            state.conversations.get(
                normalizeId(
                    conversationId
                )
            );


        if (!conversation) {

            return false;

        }


        const index =
            conversation.messages.findIndex(
                message =>
                    message.id ===
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
            Date.now();


        state.statistics
            .messagesRemoved +=
            1;


        saveConversation(
            conversation
        );


        emit(
            "message-removed",
            {

                conversationId:
                    conversation.id,

                message:
                    clone(
                        removed
                    )

            }
        );


        return true;

    }


    function clearMessages(
        conversationId
    ) {

        const conversation =
            state.conversations.get(
                normalizeId(
                    conversationId
                )
            );


        if (!conversation) {

            return false;

        }


        conversation.messages =
            [];

        conversation.updatedAt =
            Date.now();

        conversation.status =
            "idle";

        conversation.error =
            null;


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
                    conversation.id
            }
        );


        return true;

    }


    /* ========================================================
       17 — CONTEXT
       ======================================================== */

    function setContext(
        conversationId,
        changes
    ) {

        const conversation =
            state.conversations.get(
                normalizeId(
                    conversationId
                )
            );


        if (!conversation) {

            return null;

        }


        conversation.context = {

            ...conversation.context,

            ...(changes || {})

        };


        conversation.updatedAt =
            Date.now();


        saveConversation(
            conversation
        );


        emit(
            "context-changed",
            {

                conversationId:
                    conversation.id,

                context:
                    clone(
                        conversation.context
                    )

            }
        );


        return clone(
            conversation.context
        );

    }


    function getContext(
        conversationId
    ) {

        const conversation =
            get(
                conversationId
            );


        return conversation
            ? clone(
                conversation.context
            )
            : {};

    }


    /* ========================================================
       18 — LANGUAGE
       ======================================================== */

    function setLanguage(
        conversationId,
        language
    ) {

        const conversation =
            state.conversations.get(
                normalizeId(
                    conversationId
                )
            );


        if (!conversation) {

            return false;

        }


        conversation.language =
            language ||
            "auto";


        conversation.updatedAt =
            Date.now();


        saveConversation(
            conversation
        );


        emit(
            "language-changed",
            {

                conversationId:
                    conversation.id,

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
            get(
                conversationId
            );


        return conversation
            ? conversation.language
            : "auto";

    }


    /* ========================================================
       19 — STATUS
       ======================================================== */

    function setStatus(
        conversationId,
        status,
        error = null
    ) {

        const conversation =
            state.conversations.get(
                normalizeId(
                    conversationId
                )
            );


        if (!conversation) {

            return false;

        }


        conversation.status =
            status ||
            "idle";


        conversation.error =
            error
                ? clone(
                    error
                )
                : null;


        conversation.updatedAt =
            Date.now();


        saveConversation(
            conversation
        );


        emit(
            "status-changed",
            {

                conversationId:
                    conversation.id,

                status:
                    conversation.status,

                error:
                    conversation.error

            }
        );


        return true;

    }


    function getStatus(
        conversationId
    ) {

        const conversation =
            get(
                conversationId
            );


        return conversation
            ? conversation.status
            : "idle";

    }


    /* ========================================================
       20 — TITLE
       ======================================================== */

    function setTitle(
        conversationId,
        title
    ) {

        const conversation =
            state.conversations.get(
                normalizeId(
                    conversationId
                )
            );


        if (!conversation) {

            return false;

        }


        conversation.title =
            String(
                title ||
                "Neue Unterhaltung"
            )
            .trim();


        conversation.updatedAt =
            Date.now();


        saveConversation(
            conversation
        );


        emit(
            "title-changed",
            {

                conversationId:
                    conversation.id,

                title:
                    conversation.title

            }
        );


        return true;

    }


    /* ========================================================
       21 — FLAGS
       ======================================================== */

    function setFlags(
        conversationId,
        changes
    ) {

        const conversation =
            state.conversations.get(
                normalizeId(
                    conversationId
                )
            );


        if (!conversation) {

            return false;

        }


        conversation.flags = {

            ...conversation.flags,

            ...(changes || {})

        };


        conversation.updatedAt =
            Date.now();


        saveConversation(
            conversation
        );


        emit(
            "flags-changed",
            {

                conversationId:
                    conversation.id,

                flags:
                    clone(
                        conversation.flags
                    )

            }
        );


        return true;

    }


    /* ========================================================
       22 — DELETE
       ======================================================== */

    function remove(
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


        try {

            window.localStorage.removeItem(
                storageKey(
                    id
                )
            );

        } catch (_) {}


        if (
            state.activeConversationId ===
            id
        ) {

            state.activeConversationId =
                null;

        }


        state.statistics
            .conversationsDeleted +=
            1;


        saveIndex();


        emit(
            "deleted",
            {
                conversationId:
                    id
            }
        );


        return true;

    }


    function deleteConversation(
        conversationId
    ) {

        return remove(
            conversationId
        );

    }


    /* ========================================================
       23 — EXPORT
       ======================================================== */

    function exportConversation(
        conversationId
    ) {

        const conversation =
            get(
                conversationId
            );


        if (!conversation) {

            return null;

        }


        state.statistics.exports +=
            1;


        const payload = {

            format:
                "haldo-conversation",

            version:
                VERSION,

            exportedAt:
                new Date().toISOString(),

            conversation:
                conversation

        };


        emit(
            "exported",
            payload
        );


        return JSON.stringify(
            payload,
            null,
            2
        );

    }


    /* ========================================================
       24 — IMPORT
       ======================================================== */

    function importConversation(
        input,
        options = {}
    ) {

        try {

            const payload =
                typeof input ===
                "string"
                    ? JSON.parse(
                        input
                    )
                    : input;


            const source =
                payload &&
                payload.conversation
                    ? payload.conversation
                    : payload;


            if (
                !source
            ) {

                return null;

            }


            const conversation =
                createConversationObject(
                    source
                );


            if (
                options.newId !==
                false
            ) {

                conversation.id =
                    generateId(
                        "conversation"
                    );

            }


            state.conversations.set(
                conversation.id,
                conversation
            );


            saveConversation(
                conversation
            );


            state.statistics.imports +=
                1;


            emit(
                "imported",
                {

                    conversation:
                        clone(
                            conversation
                        )

                }
            );


            if (
                options.activate !==
                false
            ) {

                setActive(
                    conversation.id
                );

            }


            return clone(
                conversation
            );

        } catch (exception) {

            reportError(
                exception,
                "Conversation Import"
            );


            return null;

        }

    }


    /* ========================================================
       25 — AI CONTEXT
       ======================================================== */

    function buildAIContext(
        conversationId,
        options = {}
    ) {

        const conversation =
            get(
                conversationId
            );


        if (!conversation) {

            return {

                messages:
                    [],

                language:
                    "auto",

                systemPrompt:
                    "",

                context:
                    {},

                metadata:
                    {}

            };

        }


        let messages =
            conversation.messages || [];


        const limit =
            typeof options.limit ===
            "number"
                ? options.limit
                : 50;


        if (
            messages.length >
            limit
        ) {

            messages =
                messages.slice(
                    -limit
                );

        }


        const aiLanguage =
            getAILanguage();


        let language =
            conversation.language;


        if (
            language ===
            "auto" &&
            aiLanguage
        ) {

            if (
                hasMethod(
                    aiLanguage,
                    "detect"
                )
            ) {

                try {

                    const lastUserMessage =
                        messages
                            .slice()
                            .reverse()
                            .find(
                                message =>
                                    message.role ===
                                    "user"
                            );


                    if (
                        lastUserMessage
                    ) {

                        language =
                            aiLanguage.detect(
                                lastUserMessage.content
                            ) ||
                            "auto";

                    }

                } catch (_) {}

            }

        }


        return {

            conversationId:
                conversation.id,

            title:
                conversation.title,

            language:
                language,

            systemPrompt:
                conversation.systemPrompt,

            temperature:
                conversation.temperature,

            messages:
                clone(
                    messages
                ),

            context:
                clone(
                    conversation.context
                ),

            metadata:
                clone(
                    conversation.metadata
                )

        };

    }


    /* ========================================================
       26 — CLEAR ALL
       ======================================================== */

    function clearAll() {

        const ids =
            Array.from(
                state.conversations.keys()
            );


        ids.forEach(
            id => {

                remove(
                    id
                );

            }
        );


        state.activeConversationId =
            null;


        emit(
            "all-cleared",
            {
                count:
                    ids.length
            }
        );


        return ids.length;

    }


    /* ========================================================
       27 — RESTORE FROM INDEX
       ======================================================== */

    function restoreFromStorage() {

        const index =
            loadIndex();


        index.forEach(
            item => {

                if (
                    item &&
                    item.id
                ) {

                    const conversation =
                        loadConversationFromStorage(
                            item.id
                        );


                    if (
                        conversation
                    ) {

                        state.conversations.set(
                            conversation.id,
                            conversation
                        );

                    }

                }

            }
        );


        /*
         * Letzte aktive Unterhaltung
         * wiederherstellen.
         */

        try {

            const active =
                window.localStorage.getItem(
                    "haldo.ai.active-conversation"
                );


            if (
                active &&
                state.conversations.has(
                    active
                )
            ) {

                state.activeConversationId =
                    active;

            }

        } catch (_) {}


        return state.conversations.size;

    }


    function persistActiveConversation() {

        try {

            if (
                state.activeConversationId
            ) {

                window.localStorage.setItem(
                    "haldo.ai.active-conversation",
                    state.activeConversationId
                );

            } else {

                window.localStorage.removeItem(
                    "haldo.ai.active-conversation"
                );

            }

        } catch (_) {}

    }


    /* ========================================================
       28 — INITIALIZATION
       ======================================================== */

    function initialize() {

        if (
            state.ready
        ) {

            return api;

        }


        try {

            restoreFromStorage();


            /*
             * Falls noch keine Unterhaltung
             * existiert, eine neue erstellen.
             */

            if (
                state.conversations.size ===
                0
            ) {

                create(
                    {
                        title:
                            "Neue Unterhaltung",

                        activate:
                            true
                    }
                );

            }


            if (
                state.activeConversationId
            ) {

                persistActiveConversation();

            } else {

                const first =
                    getAll(
                        {
                            includeArchived:
                                true
                        }
                    )[0];


                if (first) {

                    setActive(
                        first.id
                    );

                }

            }


            state.initialized =
                true;

            state.ready =
                true;

            state.failed =
                false;


            emit(
                "ready",
                {

                    version:
                        VERSION,

                    conversationCount:
                        state.conversations.size,

                    activeConversationId:
                        state.activeConversationId

                }
            );


            log(
                "Conversation State bereit.",
                VERSION
            );


            return api;

        } catch (exception) {

            state.failed =
                true;

            state.ready =
                false;


            reportError(
                exception,
                "Conversation State Initialisierung"
            );


            return api;

        }

    }


    /* ========================================================
       29 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


        /* Lifecycle */

        initialize:
            initialize,


        /* Events */

        on:
            on,

        off:
            off,

        emit:
            emit,


        /* Conversations */

        create:
            create,

        createConversation:
            createConversation,

        get:
            get,

        getConversation:
            getConversation,

        getAll:
            getAll,

        getConversations:
            getConversations,

        remove:
            remove,

        deleteConversation:
            deleteConversation,

        clearAll:
            clearAll,


        /* Active */

        setActive:
            setActive,

        getActive:
            getActive,

        getActiveId:
            getActiveId,


        /* Messages */

        addMessage:
            addMessage,

        addUserMessage:
            addUserMessage,

        addAssistantMessage:
            addAssistantMessage,

        addSystemMessage:
            addSystemMessage,

        getMessages:
            getMessages,

        getLastMessage:
            getLastMessage,

        removeMessage:
            removeMessage,

        clearMessages:
            clearMessages,


        /* Context */

        setContext:
            setContext,

        getContext:
            getContext,

        buildAIContext:
            buildAIContext,


        /* Language */

        setLanguage:
            setLanguage,

        getLanguage:
            getLanguage,


        /* Status */

        setStatus:
            setStatus,

        getStatus:
            getStatus,


        /* Metadata */

        setTitle:
            setTitle,

        setFlags:
            setFlags,


        /* Storage */

        save:
            saveConversation,

        load:
            loadConversationFromStorage,

        restoreFromStorage:
            restoreFromStorage,


        /* Import / Export */

        export:
            exportConversation,

        import:
            importConversation,


        /* Diagnostics */

        getStatistics:
            function () {

                return {
                    ...state.statistics
                };

            },


        getState:
            function () {

                return {

                    initialized:
                        state.initialized,

                    ready:
                        state.ready,

                    failed:
                        state.failed,

                    conversationCount:
                        state.conversations.size,

                    activeConversationId:
                        state.activeConversationId,

                    statistics:
                        {
                            ...state.statistics
                        }

                };

            }

    };


    /* ========================================================
       30 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoConversationState =
        api;

    window.HalDoOSConversationState =
        api;

    HalDoOS.conversationState =
        api;


    /* ========================================================
       31 — ACTIVE PERSISTENCE
       ======================================================== */

    on(
        "active-changed",
        function () {

            persistActiveConversation();

        }
    );


    /* ========================================================
       32 — DOM START
       ======================================================== */

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


    /* ========================================================
       33 — FINAL CONNECTION
       ======================================================== */

    HalDoOS.conversationState =
        api;

    window.HalDoConversationState =
        api;


    log(
        "HalDo Conversation State geladen."
    );


})(window, document);