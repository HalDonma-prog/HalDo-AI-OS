/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE AI FOUNDATION
   ------------------------------------------------------------
   Datei:
       js/ai-memory.js

   HALDO AI MEMORY ENGINE

   Aufgaben:
   - Gesprächserinnerungen
   - Sitzungsdaten
   - Nachrichten speichern
   - Kontextverwaltung
   - wichtige Informationen markieren
   - Langzeit-/Kurzzeitkontext
   - Suche in Erinnerungen
   - Memory-Tags
   - Memory-Lebensdauer
   - Prioritäten
   - Storage-Verbindung
   - Conversation-State-Verbindung
   - AI-Core-Verbindung
   - Events
   - Diagnostics
   - Health Check
   - sichere Erweiterbarkeit

   HALDO AI OS 18 → 20
   ============================================================ */

"use strict";

(function (window, document) {

    /* ========================================================
       01 — FOUNDATION
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
        "ai-memory";

    const NAME =
        "HalDo AI Memory Engine";


    /* ========================================================
       03 — CONFIGURATION
       ======================================================== */

    const CONFIG = {

        maxShortTermMessages:
            100,

        maxLongTermMemories:
            1000,

        maxSearchResults:
            100,

        storageKey:
            "haldo.ai.memory.v20",

        sessionKey:
            "haldo.ai.memory.session.v20",

        autoSave:
            true,

        persistent:
            true

    };


    /* ========================================================
       04 — STATE
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

        sessionId:
            null,

        messages:
            [],

        memories:
            [],

        context:
            [],

        statistics: {

            messagesAdded:
                0,

            memoriesAdded:
                0,

            memoriesRemoved:
                0,

            searches:
                0,

            saves:
                0,

            loads:
                0,

            errors:
                0

        },

        listeners:
            new Map(),

        connections: {

            storage:
                false,

            conversationState:
                false,

            aiCore:
                false,

            system:
                false,

            kernel:
                false

        }

    };


    /* ========================================================
       05 — LOGGING
       ======================================================== */

    function log() {

        try {

            console.log(
                "[HalDo AI Memory]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo AI Memory]",
                ...arguments
            );

        } catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo AI Memory]",
                ...arguments
            );

        } catch (_) {}

    }


    /* ========================================================
       06 — HELPERS
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


    function createId(
        prefix = "memory"
    ) {

        return (
            prefix +
            "-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 10)
        );

    }


    function now() {

        return Date.now();

    }


    function normalizeText(
        value
    ) {

        return String(
            value === undefined ||
            value === null
                ? ""
                : value
        ).trim();

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


    function normalizeTags(
        tags
    ) {

        if (
            !Array.isArray(
                tags
            )
        ) {

            return [];

        }

        return Array.from(
            new Set(
                tags
                    .map(
                        tag =>
                            normalizeText(
                                tag
                            ).toLowerCase()
                    )
                    .filter(Boolean)
            )
        );

    }


    /* ========================================================
       07 — SERVICE LOOKUPS
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


    function getStorage() {

        return (
            window.HalDoStorage ||
            HalDoOS.storage ||
            window.HalDoStorageManager ||
            HalDoOS.storageManager ||
            null
        );

    }


    function getConversationState() {

        return (
            window.HalDoConversationState ||
            HalDoOS.conversationState ||
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

                    } catch (
                        exception
                    ) {

                        reportError(
                            exception,
                            "Event: " +
                            event
                        );

                    }

                }
            );

        }


        const events =
            HalDoOS.events;

        if (
            events &&
            hasMethod(
                events,
                "emit"
            )
        ) {

            try {

                events.emit(
                    "ai-memory:" +
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
                    "ai-memory:" +
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
        context =
            "AI Memory"
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

            context,

            timestamp:
                new Date()
                    .toISOString()

        };

        errorLog(
            "[HalDo AI Memory]",
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
       10 — SESSION
       ======================================================== */

    function createSession(
        metadata = {}
    ) {

        state.sessionId =
            createId(
                "session"
            );

        state.messages = [];
        state.context = [];

        const session = {

            id:
                state.sessionId,

            createdAt:
                now(),

            updatedAt:
                now(),

            metadata:
                clone(
                    metadata
                )

        };

        try {

            window.localStorage.setItem(
                CONFIG.sessionKey,
                JSON.stringify(
                    session
                )
            );

        } catch (_) {}

        emit(
            "session-created",
            session
        );

        return clone(
            session
        );

    }


    function getSessionId() {

        if (
            !state.sessionId
        ) {

            createSession();

        }

        return state.sessionId;

    }


    function loadSession() {

        try {

            const raw =
                window.localStorage.getItem(
                    CONFIG.sessionKey
                );

            if (!raw) {

                return createSession();

            }

            const session =
                JSON.parse(
                    raw
                );

            if (
                session &&
                session.id
            ) {

                state.sessionId =
                    session.id;

                return clone(
                    session
                );

            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Session laden"
            );

        }

        return createSession();

    }


    function saveSession() {

        try {

            const session = {

                id:
                    getSessionId(),

                createdAt:
                    state.sessionCreatedAt ||
                    now(),

                updatedAt:
                    now()

            };

            window.localStorage.setItem(
                CONFIG.sessionKey,
                JSON.stringify(
                    session
                )
            );

            return true;

        } catch (_) {

            return false;

        }

    }


    /* ========================================================
       11 — MESSAGE CREATION
       ======================================================== */

    function createMessage(
        role,
        content,
        metadata = {}
    ) {

        const normalizedRole =
            normalizeText(
                role
            ).toLowerCase() ||
            "user";

        const normalizedContent =
            normalizeText(
                content
            );

        return {

            id:
                createId(
                    "message"
                ),

            sessionId:
                getSessionId(),

            role:
                normalizedRole,

            content:
                normalizedContent,

            timestamp:
                now(),

            metadata:
                clone(
                    metadata
                )

        };

    }


    /* ========================================================
       12 — ADD MESSAGE
       ======================================================== */

    function addMessage(
        role,
        content,
        metadata = {}
    ) {

        const message =
            createMessage(
                role,
                content,
                metadata
            );

        if (
            !message.content
        ) {

            return null;

        }

        state.messages.push(
            message
        );

        if (
            state.messages.length >
            CONFIG.maxShortTermMessages
        ) {

            state.messages =
                state.messages.slice(
                    -CONFIG.maxShortTermMessages
                );

        }

        state.statistics.messagesAdded +=
            1;

        emit(
            "message-added",
            clone(
                message
            )
        );

        if (
            CONFIG.autoSave
        ) {

            save();

        }

        syncConversationState();

        return clone(
            message
        );

    }


    function addUserMessage(
        content,
        metadata = {}
    ) {

        return addMessage(
            "user",
            content,
            metadata
        );

    }


    function addAssistantMessage(
        content,
        metadata = {}
    ) {

        return addMessage(
            "assistant",
            content,
            metadata
        );

    }


    function addSystemMessage(
        content,
        metadata = {}
    ) {

        return addMessage(
            "system",
            content,
            metadata
        );

    }


    /* ========================================================
       13 — MESSAGE ACCESS
       ======================================================== */

    function getMessages(
        options = {}
    ) {

        let result =
            state.messages.slice();

        if (
            options.role
        ) {

            result =
                result.filter(
                    message =>
                        message.role ===
                        options.role
                );

        }

        if (
            options.limit
        ) {

            result =
                result.slice(
                    -Math.max(
                        1,
                        Number(
                            options.limit
                        )
                    )
                );

        }

        return clone(
            result
        );

    }


    function getRecentMessages(
        limit = 20
    ) {

        return getMessages({
            limit
        });

    }


    function getLastMessage() {

        if (
            state.messages.length ===
            0
        ) {

            return null;

        }

        return clone(
            state.messages[
                state.messages.length - 1
            ]
        );

    }


    function clearMessages() {

        const count =
            state.messages.length;

        state.messages = [];

        emit(
            "messages-cleared",
            {
                count:
                    count
            }
        );

        if (
            CONFIG.autoSave
        ) {

            save();

        }

        syncConversationState();

        return true;

    }


    /* ========================================================
       14 — LONG TERM MEMORY
       ======================================================== */

    function addMemory(
        content,
        options = {}
    ) {

        const text =
            normalizeText(
                content
            );

        if (!text) {

            return null;

        }

        const memory = {

            id:
                createId(
                    "memory"
                ),

            content:
                text,

            type:
                options.type ||
                "general",

            category:
                options.category ||
                "general",

            importance:
                Number(
                    options.importance
                ) || 1,

            priority:
                Number(
                    options.priority
                ) || 1,

            tags:
                normalizeTags(
                    options.tags
                ),

            source:
                options.source ||
                "haldo-ai",

            pinned:
                options.pinned ===
                true,

            createdAt:
                now(),

            updatedAt:
                now(),

            expiresAt:
                options.expiresAt ||
                null,

            metadata:
                clone(
                    options.metadata ||
                    {}
                )

        };

        state.memories.push(
            memory
        );

        if (
            state.memories.length >
            CONFIG.maxLongTermMemories
        ) {

            state.memories =
                state.memories
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            b.importance -
                            a.importance
                    )
                    .slice(
                        0,
                        CONFIG.maxLongTermMemories
                    );

        }

        state.statistics.memoriesAdded +=
            1;

        emit(
            "memory-added",
            clone(
                memory
            )
        );

        if (
            CONFIG.autoSave
        ) {

            save();

        }

        return clone(
            memory
        );

    }


    function getMemory(
        memoryId
    ) {

        const id =
            normalizeText(
                memoryId
            );

        const memory =
            state.memories.find(
                item =>
                    item.id ===
                    id
            );

        return memory
            ? clone(memory)
            : null;

    }


    function getMemories(
        options = {}
    ) {

        let result =
            state.memories.slice();

        if (
            options.category
        ) {

            result =
                result.filter(
                    memory =>
                        memory.category ===
                        options.category
                );

        }

        if (
            options.type
        ) {

            result =
                result.filter(
                    memory =>
                        memory.type ===
                        options.type
                );

        }

        if (
            options.tag
        ) {

            const tag =
                normalizeText(
                    options.tag
                ).toLowerCase();

            result =
                result.filter(
                    memory =>
                        memory.tags.includes(
                            tag
                        )
                );

        }

        if (
            options.pinned
        ) {

            result =
                result.filter(
                    memory =>
                        memory.pinned ===
                        true
                );

        }

        return clone(
            result
        );

    }


    function removeMemory(
        memoryId
    ) {

        const id =
            normalizeText(
                memoryId
            );

        const index =
            state.memories.findIndex(
                memory =>
                    memory.id ===
                    id
            );

        if (
            index === -1
        ) {

            return false;

        }

        state.memories.splice(
            index,
            1
        );

        state.statistics.memoriesRemoved +=
            1;

        emit(
            "memory-removed",
            {
                memoryId:
                    id
            }
        );

        save();

        return true;

    }


    function updateMemory(
        memoryId,
        changes = {}
    ) {

        const id =
            normalizeText(
                memoryId
            );

        const memory =
            state.memories.find(
                item =>
                    item.id ===
                    id
            );

        if (!memory) {

            return null;

        }

        if (
            changes.content !==
            undefined
        ) {

            memory.content =
                normalizeText(
                    changes.content
                );

        }

        if (
            changes.importance !==
            undefined
        ) {

            memory.importance =
                Number(
                    changes.importance
                ) || 1;

        }

        if (
            changes.priority !==
            undefined
        ) {

            memory.priority =
                Number(
                    changes.priority
                ) || 1;

        }

        if (
            changes.tags !==
            undefined
        ) {

            memory.tags =
                normalizeTags(
                    changes.tags
                );

        }

        if (
            changes.pinned !==
            undefined
        ) {

            memory.pinned =
                changes.pinned ===
                true;

        }

        memory.updatedAt =
            now();

        emit(
            "memory-updated",
            clone(
                memory
            )
        );

        save();

        return clone(
            memory
        );

    }


    /* ========================================================
       15 — MEMORY SEARCH
       ======================================================== */

    function searchMemories(
        query,
        options = {}
    ) {

        const value =
            normalizeText(
                query
            ).toLowerCase();

        if (!value) {

            return [];

        }

        state.statistics.searches +=
            1;

        const words =
            value
                .split(
                    /\s+/
                )
                .filter(Boolean);

        const results =
            state.memories
                .map(
                    memory => {

                        const haystack =
                            (
                                memory.content +
                                " " +
                                memory.category +
                                " " +
                                memory.type +
                                " " +
                                memory.tags.join(
                                    " "
                                )
                            )
                            .toLowerCase();

                        let score = 0;

                        if (
                            haystack.includes(
                                value
                            )
                        ) {

                            score += 10;

                        }

                        words.forEach(
                            word => {

                                if (
                                    haystack.includes(
                                        word
                                    )
                                ) {

                                    score += 2;

                                }

                            }
                        );

                        score +=
                            memory.importance *
                            0.5;

                        score +=
                            memory.priority *
                            0.25;

                        if (
                            memory.pinned
                        ) {

                            score += 5;

                        }

                        return {

                            memory:
                                memory,

                            score:
                                score

                        };

                    }
                )
                .filter(
                    item =>
                        item.score >
                        0
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        b.score -
                        a.score
                )
                .slice(
                    0,
                    options.limit ||
                    CONFIG.maxSearchResults
                );

        emit(
            "memory-search",
            {
                query:
                    query,

                count:
                    results.length
            }
        );

        return clone(
            results
        );

    }


    /* ========================================================
       16 — CONTEXT
       ======================================================== */

    function addContext(
        item
    ) {

        if (
            item === null ||
            item === undefined
        ) {

            return false;

        }

        state.context.push(
            clone(
                item
            )
        );

        if (
            state.context.length >
            100
        ) {

            state.context =
                state.context.slice(
                    -100
                );

        }

        emit(
            "context-added",
            clone(
                item
            )
        );

        return true;

    }


    function getContext(
        limit = 20
    ) {

        return clone(
            state.context.slice(
                -Math.max(
                    1,
                    Number(
                        limit
                    )
                )
            )
        );

    }


    function clearContext() {

        state.context = [];

        emit(
            "context-cleared"
        );

        return true;

    }


    /* ========================================================
       17 — AI CONTEXT
       ======================================================== */

    function getAIContext(
        options = {}
    ) {

        const recent =
            getRecentMessages(
                options.messageLimit ||
                20
            );

        const memories =
            options.query
                ? searchMemories(
                    options.query,
                    {
                        limit:
                            options.memoryLimit ||
                            10
                    }
                )
                : getMemories({
                    pinned:
                        true
                }).slice(
                    0,
                    options.memoryLimit ||
                    10
                );

        return {

            sessionId:
                getSessionId(),

            messages:
                recent,

            memories:
                memories.map(
                    item =>
                        item.memory ||
                        item
                ),

            context:
                getContext(
                    options.contextLimit ||
                    20
                )

        };

    }


    /* ========================================================
       18 — CONVERSATION STATE
       ======================================================== */

    function syncConversationState() {

        const conversation =
            getConversationState();

        if (!conversation) {

            state.connections.conversationState =
                false;

            return false;

        }

        state.connections.conversationState =
            true;

        try {

            if (
                hasMethod(
                    conversation,
                    "setMessages"
                )
            ) {

                conversation.setMessages(
                    clone(
                        state.messages
                    )
                );

            }

            else if (
                hasMethod(
                    conversation,
                    "addMessage"
                )
            ) {

                /*
                 * Bestehende Implementierungen
                 * werden nicht blind überschrieben.
                 */

            }

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Conversation State Synchronisation"
            );

            return false;

        }

    }


    /* ========================================================
       19 — STORAGE
       ======================================================== */

    function save() {

        const payload = {

            version:
                VERSION,

            sessionId:
                getSessionId(),

            messages:
                clone(
                    state.messages
                ),

            memories:
                clone(
                    state.memories
                ),

            context:
                clone(
                    state.context
                ),

            timestamp:
                now()

        };

        const storage =
            getStorage();

        try {

            if (
                storage &&
                hasMethod(
                    storage,
                    "set"
                )
            ) {

                storage.set(
                    CONFIG.storageKey,
                    payload
                );

                state.connections.storage =
                    true;

            }

            else {

                window.localStorage.setItem(
                    CONFIG.storageKey,
                    JSON.stringify(
                        payload
                    )
                );

            }

            state.statistics.saves +=
                1;

            emit(
                "saved"
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Memory speichern"
            );

            return false;

        }

    }


    function load() {

        const storage =
            getStorage();

        try {

            let payload =
                null;

            if (
                storage &&
                hasMethod(
                    storage,
                    "get"
                )
            ) {

                payload =
                    storage.get(
                        CONFIG.storageKey
                    );

                state.connections.storage =
                    true;

            }

            else {

                const raw =
                    window.localStorage.getItem(
                        CONFIG.storageKey
                    );

                payload =
                    raw
                        ? JSON.parse(
                            raw
                        )
                        : null;

            }

            if (
                payload &&
                typeof payload ===
                "object"
            ) {

                state.sessionId =
                    payload.sessionId ||
                    state.sessionId;

                state.messages =
                    Array.isArray(
                        payload.messages
                    )
                        ? payload.messages
                        : [];

                state.memories =
                    Array.isArray(
                        payload.memories
                    )
                        ? payload.memories
                        : [];

                state.context =
                    Array.isArray(
                        payload.context
                    )
                        ? payload.context
                        : [];

            }

            state.statistics.loads +=
                1;

            emit(
                "loaded"
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Memory laden"
            );

            return false;

        }

    }


    /* ========================================================
       20 — MEMORY CLEANUP
       ======================================================== */

    function cleanupExpired() {

        const current =
            now();

        const before =
            state.memories.length;

        state.memories =
            state.memories.filter(
                memory =>
                    !memory.expiresAt ||
                    memory.expiresAt >
                    current ||
                    memory.pinned
            );

        const removed =
            before -
            state.memories.length;

        if (
            removed > 0
        ) {

            state.statistics.memoriesRemoved +=
                removed;

            emit(
                "expired-cleanup",
                {
                    removed:
                        removed
                }
            );

            save();

        }

        return removed;

    }


    /* ========================================================
       21 — CONNECTIONS
       ======================================================== */

    function refreshConnections() {

        state.connections.kernel =
            !!getKernel();

        state.connections.system =
            !!getSystem();

        state.connections.storage =
            !!getStorage();

        state.connections.conversationState =
            !!getConversationState();

        state.connections.aiCore =
            !!getAICore();

        return {
            ...state.connections
        };

    }


    /* ========================================================
       22 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        refreshConnections();

        return {

            name:
                NAME,

            version:
                VERSION,

            module:
                MODULE_ID,

            initialized:
                state.initialized,

            ready:
                state.ready,

            failed:
                state.failed,

            sessionId:
                state.sessionId,

            messageCount:
                state.messages.length,

            memoryCount:
                state.memories.length,

            contextCount:
                state.context.length,

            connections:
                {
                    ...state.connections
                },

            statistics:
                {
                    ...state.statistics
                },

            timestamp:
                new Date()
                    .toISOString()

        };

    }


    /* ========================================================
       23 — HEALTH CHECK
       ======================================================== */

    function healthCheck() {

        refreshConnections();

        const problems = [];

        if (
            !state.ready
        ) {

            problems.push(
                "AI Memory ist noch nicht bereit."
            );

        }

        if (
            !state.connections.storage
        ) {

            problems.push(
                "Storage ist nicht verbunden."
            );

        }

        return {

            healthy:
                problems.length ===
                0,

            problems:
                problems,

            messageCount:
                state.messages.length,

            memoryCount:
                state.memories.length,

            sessionId:
                state.sessionId,

            timestamp:
                new Date()
                    .toISOString()

        };

    }


    /* ========================================================
       24 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,

        config:
            {
                ...CONFIG
            },


        /* Events */

        on:
            on,

        off:
            off,

        emit:
            emit,


        /* Session */

        createSession:
            createSession,

        loadSession:
            loadSession,

        saveSession:
            saveSession,

        getSessionId:
            getSessionId,


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

        getRecentMessages:
            getRecentMessages,

        getLastMessage:
            getLastMessage,

        clearMessages:
            clearMessages,


        /* Memories */

        addMemory:
            addMemory,

        getMemory:
            getMemory,

        getMemories:
            getMemories,

        updateMemory:
            updateMemory,

        removeMemory:
            removeMemory,

        searchMemories:
            searchMemories,


        /* Context */

        addContext:
            addContext,

        getContext:
            getContext,

        clearContext:
            clearContext,

        getAIContext:
            getAIContext,


        /* Storage */

        save:
            save,

        load:
            load,

        cleanupExpired:
            cleanupExpired,


        /* Connections */

        refreshConnections:
            refreshConnections,


        /* Diagnostics */

        diagnostics:
            diagnostics,

        healthCheck:
            healthCheck,


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

                    sessionId:
                        state.sessionId,

                    messageCount:
                        state.messages.length,

                    memoryCount:
                        state.memories.length,

                    contextCount:
                        state.context.length,

                    connections:
                        {
                            ...state.connections
                        }

                };

            }

    };


    /* ========================================================
       25 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAIMemory =
        api;

    window.HalDoOSAIMemory =
        api;

    HalDoOS.aiMemory =
        api;


    /* ========================================================
       26 — INITIALIZATION
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


        refreshConnections();

        loadSession();

        load();

        cleanupExpired();

        syncConversationState();


        state.ready =
            true;

        state.initializing =
            false;


        emit(
            "ready",
            diagnostics()
        );


        log(
            "AI Memory Engine bereit.",
            VERSION
        );


        return api;

    }


    /* ========================================================
       27 — BOOT
       ======================================================== */

    function boot() {

        initialize()
            .catch(
                exception => {

                    state.initializing =
                        false;

                    state.failed =
                        true;

                    reportError(
                        exception,
                        "AI Memory Initialisierung"
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

    }

    else {

        boot();

    }


    /* ========================================================
       END
       HALDO AI OS 20
       AI MEMORY ENGINE
       ============================================================ */

})(window, document);