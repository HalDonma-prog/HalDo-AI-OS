// ============================================================
// HALDO AI OS 18
// CONVERSATION STATE
// PART 81
// ============================================================

(function (window, document) {

    "use strict";

    if (
        window.HalDoConversationState &&
        window.HalDoConversationState.__haldoAI18
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    const CONFIG = {

        name:
            "HalDo Conversation State",

        version:
            "18.0.0",

        storageKey:
            "haldo-conversation-state",

        maxMessages:
            1000,

        maxConversations:
            50,

        autoSave:
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

        active:
            false,

        conversationId:
            null,

        title:
            "Neue Unterhaltung",

        language:
            null,

        mode:
            "chat",

        status:
            "idle",

        startedAt:
            null,

        updatedAt:
            null,

        messages:
            [],

        conversations:
            [],

        metadata:
            {},

        typing:
            false,

        processing:
            false,

        unread:
            0,

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
                const callback of
                set
            ) {

                try {

                    callback(
                        detail
                    );

                } catch (
                    error
                ) {

                    console.error(
                        "[HalDoConversationState]",
                        error
                    );

                }

            }

        }

        try {

            document.dispatchEvent(
                new CustomEvent(
                    `haldo:conversation:${event}`,
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
        prefix =
            "conversation"
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

    function timestamp() {

        return Date.now();

    }

    // --------------------------------------------------------
    // STORAGE
    // --------------------------------------------------------

    function getStorage() {

        return (
            window.HalDoStorage ||
            window.HalDoStorageManager ||
            window.HalDoOS?.storage ||
            window.HalDoOS?.storageManager ||
            null
        );

    }

    async function saveStorage(
        key,
        value
    ) {

        const storage =
            getStorage();

        if (storage) {

            for (
                const method of [
                    "set",
                    "save",
                    "write",
                    "store"
                ]
            ) {

                if (
                    typeof storage[method] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    await storage[method](
                        key,
                        value
                    );

                    return true;

                } catch (
                    error
                ) {}

            }

        }

        try {

            localStorage.setItem(
                key,
                JSON.stringify(
                    value
                )
            );

            return true;

        } catch (
            error
        ) {

            return false;

        }

    }

    async function loadStorage(
        key,
        fallback = null
    ) {

        const storage =
            getStorage();

        if (storage) {

            for (
                const method of [
                    "get",
                    "load",
                    "read",
                    "retrieve"
                ]
            ) {

                if (
                    typeof storage[method] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await storage[method](
                            key
                        );

                    if (
                        result !==
                        undefined &&
                        result !==
                        null
                    ) {

                        return result;

                    }

                } catch (
                    error
                ) {}

            }

        }

        try {

            const raw =
                localStorage.getItem(
                    key
                );

            if (!raw) {
                return fallback;
            }

            return JSON.parse(
                raw
            );

        } catch (
            error
        ) {

            return fallback;

        }

    }

    // --------------------------------------------------------
    // NORMALIZE MESSAGE
    // --------------------------------------------------------

    function normalizeMessage(
        message
    ) {

        const data =
            message || {};

        return {

            id:
                data.id ||
                createId(
                    "message"
                ),

            role:
                data.role ||
                "user",

            content:
                clean(
                    data.content ??
                    data.text ??
                    ""
                ),

            language:
                data.language ||
                state.language ||
                null,

            timestamp:
                data.timestamp ||
                timestamp(),

            type:
                data.type ||
                "message",

            status:
                data.status ||
                "complete",

            metadata:
                data.metadata ||
                {}

        };

    }

    // --------------------------------------------------------
    // NORMALIZE CONVERSATION
    // --------------------------------------------------------

    function normalizeConversation(
        conversation
    ) {

        const data =
            conversation || {};

        return {

            id:
                data.id ||
                createId(),

            title:
                data.title ||
                "Neue Unterhaltung",

            language:
                data.language ||
                state.language ||
                null,

            mode:
                data.mode ||
                "chat",

            createdAt:
                data.createdAt ||
                timestamp(),

            updatedAt:
                data.updatedAt ||
                timestamp(),

            messageCount:
                Number(
                    data.messageCount ||
                    0
                ),

            metadata:
                data.metadata ||
                {}

        };

    }

    // --------------------------------------------------------
    // ACTIVE CONVERSATION
    // --------------------------------------------------------

    function getActiveConversation() {

        if (
            !state.conversationId
        ) {

            return null;

        }

        return state.conversations.find(
            conversation =>
                conversation.id ===
                state.conversationId
        ) || null;

    }

    function ensureConversation() {

        let conversation =
            getActiveConversation();

        if (conversation) {

            return conversation;

        }

        conversation =
            createConversation();

        return conversation;

    }

    function createConversation(
        options = {}
    ) {

        const conversation =
            normalizeConversation({

                id:
                    options.id ||
                    createId(),

                title:
                    options.title ||
                    "Neue Unterhaltung",

                language:
                    options.language ||
                    state.language,

                mode:
                    options.mode ||
                    "chat",

                metadata:
                    options.metadata ||
                    {}

            });

        state.conversations.push(
            conversation
        );

        state.conversationId =
            conversation.id;

        state.title =
            conversation.title;

        state.startedAt =
            conversation.createdAt;

        state.updatedAt =
            timestamp();

        state.messages =
            [];

        state.unread =
            0;

        state.active =
            true;

        enforceLimits();

        emit(
            "created",
            {
                conversation
            }
        );

        save();

        return conversation;

    }

    function switchConversation(
        conversationId
    ) {

        const conversation =
            state.conversations.find(
                item =>
                    item.id ===
                    conversationId
            );

        if (!conversation) {

            return {

                ok:
                    false,

                error:
                    "CONVERSATION_NOT_FOUND"

            };

        }

        state.conversationId =
            conversation.id;

        state.title =
            conversation.title;

        state.language =
            conversation.language ||
            state.language;

        state.mode =
            conversation.mode ||
            "chat";

        state.startedAt =
            conversation.createdAt;

        state.updatedAt =
            conversation.updatedAt;

        state.messages =
            [];

        state.unread =
            0;

        emit(
            "switched",
            {
                conversation
            }
        );

        return {

            ok:
                true,

            conversation

        };

    }

    function deleteConversation(
        conversationId
    ) {

        const index =
            state.conversations.findIndex(
                conversation =>
                    conversation.id ===
                    conversationId
            );

        if (
            index ===
            -1
        ) {

            return false;

        }

        const removed =
            state.conversations.splice(
                index,
                1
            )[0];

        if (
            state.conversationId ===
            conversationId
        ) {

            state.conversationId =
                null;

            state.messages =
                [];

            state.title =
                "Neue Unterhaltung";

            state.active =
                false;

        }

        save();

        emit(
            "deleted",
            {
                conversation:
                    removed
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

        const message =
            normalizeMessage({

                role,

                content:
                    text,

                language:
                    metadata.language ||
                    state.language,

                type:
                    metadata.type ||
                    "message",

                status:
                    metadata.status ||
                    "complete",

                metadata

            });

        state.messages.push(
            message
        );

        state.updatedAt =
            timestamp();

        conversation.updatedAt =
            state.updatedAt;

        conversation.messageCount =
            state.messages.length;

        /*
         * Neue Nachrichten für UI markieren.
         */

        if (
            role ===
            "assistant"
        ) {

            state.unread++;

        }

        enforceLimits();

        emit(
            "message-added",
            {
                message,

                conversation

            }
        );

        save();

        return message;

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
            options.type
        ) {

            messages =
                messages.filter(
                    message =>
                        message.type ===
                        options.type
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

    function clearMessages() {

        state.messages =
            [];

        const conversation =
            getActiveConversation();

        if (conversation) {

            conversation.messageCount =
                0;

            conversation.updatedAt =
                timestamp();

        }

        state.updatedAt =
            timestamp();

        state.unread =
            0;

        save();

        emit(
            "messages-cleared",
            {
                conversation
            }
        );

        return true;

    }

    // --------------------------------------------------------
    // TYPING / PROCESSING
    // --------------------------------------------------------

    function setTyping(
        value
    ) {

        state.typing =
            Boolean(
                value
            );

        emit(
            "typing",
            {
                typing:
                    state.typing
            }
        );

        return state.typing;

    }

    function setProcessing(
        value
    ) {

        state.processing =
            Boolean(
                value
            );

        state.status =
            state.processing
                ? "processing"
                : "idle";

        emit(
            "processing",
            {
                processing:
                    state.processing
            }
        );

        return state.processing;

    }

    // --------------------------------------------------------
    // LANGUAGE
    // --------------------------------------------------------

    function setLanguage(
        language
    ) {

        const value =
            clean(
                language
            );

        if (!value) {

            return state.language;

        }

        state.language =
            value;

        const conversation =
            getActiveConversation();

        if (conversation) {

            conversation.language =
                value;

            conversation.updatedAt =
                timestamp();

        }

        state.updatedAt =
            timestamp();

        emit(
            "language-changed",
            {
                language:
                    value
            }
        );

        save();

        return value;

    }

    function getLanguage() {

        if (
            state.language
        ) {

            return state.language;

        }

        const language =
            window.HalDoAILanguage ||
            window.HalDoOS?.aiLanguage;

        if (
            language &&
            typeof language.getLanguage ===
            "function"
        ) {

            try {

                state.language =
                    language.getLanguage();

            } catch (
                error
            ) {}

        }

        return state.language;

    }

    // --------------------------------------------------------
    // MODE
    // --------------------------------------------------------

    function setMode(
        mode
    ) {

        const value =
            clean(
                mode
            ) ||
            "chat";

        state.mode =
            value;

        const conversation =
            getActiveConversation();

        if (conversation) {

            conversation.mode =
                value;

            conversation.updatedAt =
                timestamp();

        }

        state.updatedAt =
            timestamp();

        emit(
            "mode-changed",
            {
                mode:
                    value
            }
        );

        save();

        return value;

    }

    // --------------------------------------------------------
    // METADATA
    // --------------------------------------------------------

    function setMetadata(
        key,
        value
    ) {

        if (!key) {

            return false;

        }

        state.metadata[
            key
        ] =
            value;

        state.updatedAt =
            timestamp();

        emit(
            "metadata-changed",
            {

                key,

                value

            }
        );

        save();

        return true;

    }

    function getMetadata(
        key,
        fallback = null
    ) {

        if (!key) {

            return state.metadata;

        }

        return (
            state.metadata[key] ??
            fallback
        );

    }

    // --------------------------------------------------------
    // UNREAD
    // --------------------------------------------------------

    function markRead() {

        state.unread =
            0;

        emit(
            "read"
        );

        return true;

    }

    function getUnreadCount() {

        return state.unread;

    }

    // --------------------------------------------------------
    // HISTORY CONTEXT
    // --------------------------------------------------------

    function getContext(
        limit = 20
    ) {

        return getMessages({

            limit

        }).map(
            message => ({

                role:
                    message.role,

                content:
                    message.content,

                language:
                    message.language

            })
        );

    }

    // --------------------------------------------------------
    // SAVE STATE
    // --------------------------------------------------------

    async function save() {

        if (
            !CONFIG.autoSave
        ) {

            return false;

        }

        try {

            const data = {

                version:
                    CONFIG.version,

                savedAt:
                    timestamp(),

                conversationId:
                    state.conversationId,

                title:
                    state.title,

                language:
                    state.language,

                mode:
                    state.mode,

                status:
                    state.status,

                startedAt:
                    state.startedAt,

                updatedAt:
                    state.updatedAt,

                messages:
                    state.messages,

                conversations:
                    state.conversations,

                metadata:
                    state.metadata,

                unread:
                    state.unread

            };

            const result =
                await saveStorage(
                    CONFIG.storageKey,
                    data
                );

            emit(
                "saved",
                {
                    ok:
                        result
                }
            );

            return result;

        } catch (
            error
        ) {

            recordError(
                error
            );

            return false;

        }

    }

    // --------------------------------------------------------
    // LOAD STATE
    // --------------------------------------------------------

    async function load() {

        try {

            const data =
                await loadStorage(
                    CONFIG.storageKey,
                    null
                );

            if (!data) {

                return false;

            }

            state.conversationId =
                data.conversationId ||
                null;

            state.title =
                data.title ||
                "Neue Unterhaltung";

            state.language =
                data.language ||
                null;

            state.mode =
                data.mode ||
                "chat";

            state.status =
                data.status ||
                "idle";

            state.startedAt =
                data.startedAt ||
                null;

            state.updatedAt =
                data.updatedAt ||
                null;

            state.messages =
                Array.isArray(
                    data.messages
                )
                    ? data.messages.map(
                        normalizeMessage
                    )
                    : [];

            state.conversations =
                Array.isArray(
                    data.conversations
                )
                    ? data.conversations.map(
                        normalizeConversation
                    )
                    : [];

            state.metadata =
                data.metadata ||
                {};

            state.unread =
                Number(
                    data.unread ||
                    0
                );

            enforceLimits();

            emit(
                "loaded",
                getStatus()
            );

            return true;

        } catch (
            error
        ) {

            recordError(
                error
            );

            return false;

        }

    }

    // --------------------------------------------------------
    // LIMITS
    // --------------------------------------------------------

    function enforceLimits() {

        if (
            state.messages.length >
            CONFIG.maxMessages
        ) {

            state.messages =
                state.messages.slice(
                    -CONFIG.maxMessages
                );

        }

        if (
            state.conversations.length >
            CONFIG.maxConversations
        ) {

            state.conversations =
                state.conversations
                    .slice(
                        -CONFIG.maxConversations
                    );

        }

    }

    // --------------------------------------------------------
    // RESET
    // --------------------------------------------------------

    async function reset() {

        state.conversationId =
            null;

        state.title =
            "Neue Unterhaltung";

        state.language =
            null;

        state.mode =
            "chat";

        state.status =
            "idle";

        state.startedAt =
            null;

        state.updatedAt =
            timestamp();

        state.messages =
            [];

        state.conversations =
            [];

        state.metadata =
            {};

        state.typing =
            false;

        state.processing =
            false;

        state.unread =
            0;

        await save();

        emit(
            "reset"
        );

        return true;

    }

    // --------------------------------------------------------
    // ERROR
    // --------------------------------------------------------

    function recordError(
        error
    ) {

        const entry = {

            timestamp:
                timestamp(),

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

            active:
                state.active,

            conversationId:
                state.conversationId,

            title:
                state.title,

            language:
                state.language,

            mode:
                state.mode,

            status:
                state.status,

            messageCount:
                state.messages.length,

            conversationCount:
                state.conversations.length,

            typing:
                state.typing,

            processing:
                state.processing,

            unread:
                state.unread,

            errors:
                state.errors.length

        };

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

        await load();

        /*
         * Falls noch kein Gespräch existiert,
         * wird es erst bei Bedarf erstellt.
         */

        getLanguage();

        /*
         * AI Chat anbinden.
         */

        const chat =
            window.HalDoAIChat;

        if (
            chat &&
            typeof chat.on ===
            "function"
        ) {

            chat.on(
                "processing-start",
                () => {

                    setProcessing(
                        true
                    );

                }
            );

            chat.on(
                "processing-end",
                () => {

                    setProcessing(
                        false
                    );

                }
            );

            chat.on(
                "message-added",
                detail => {

                    const message =
                        detail?.message;

                    if (!message) {
                        return;
                    }

                    /*
                     * Verhindert unnötige
                     * Doppelobjekte.
                     */

                    const exists =
                        state.messages.some(
                            item =>
                                item.id ===
                                message.id
                        );

                    if (!exists) {

                        state.messages.push(
                            normalizeMessage(
                                message
                            )
                        );

                        const conversation =
                            ensureConversation();

                        conversation.updatedAt =
                            timestamp();

                        conversation.messageCount =
                            state.messages.length;

                        state.updatedAt =
                            timestamp();

                        enforceLimits();

                        save();

                    }

                }
            );

        }

        /*
         * Memory anbinden.
         */

        const memory =
            window.HalDoAIMemory ||
            window.HalDoOS?.aiMemory;

        if (
            memory &&
            typeof memory.on ===
            "function"
        ) {

            memory.on(
                "stored",
                detail => {

                    emit(
                        "memory-stored",
                        detail
                    );

                }
            );

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
                    "conversation-state",
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

        createConversation,

        newConversation:
            createConversation,

        switchConversation,

        deleteConversation,

        getActiveConversation,

        getConversation:
            getActiveConversation,

        ensureConversation,

        addMessage,

        addUserMessage,

        addAssistantMessage,

        addSystemMessage,

        getMessages,

        getHistory:
            getMessages,

        clearMessages,

        setTyping,

        setProcessing,

        setLanguage,

        getLanguage,

        setMode,

        setMetadata,

        getMetadata,

        markRead,

        getUnreadCount,

        getContext,

        save,

        load,

        reset,

        getStatus

    };

    // --------------------------------------------------------
    // GLOBAL REGISTRATION
    // --------------------------------------------------------

    window.HalDoConversationState =
        api;

    window.HalDoOS.conversationState =
        api;

    // --------------------------------------------------------
    // BOOT
    // --------------------------------------------------------

    async function boot() {

        try {

            await initialize();

        } catch (
            error
        ) {

            recordError(
                error
            );

            console.error(
                "[HalDoConversationState] " +
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
// END OF PART 81
// ============================================================