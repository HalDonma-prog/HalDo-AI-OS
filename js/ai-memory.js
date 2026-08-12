// ============================================================
// HALDO AI OS 18
// AI MEMORY SYSTEM
// PART 75
// ============================================================
// Zentrales Gedächtnis der HalDo AI.
//
// Verbindung:
//
// ai-chat.js
//      ↓
// ai-core.js
//      ↓
// ai-memory.js
//      ↓
// storage.js / storage-manager.js
//
// Öffentliche APIs:
//
// window.HalDoAIMemory
// window.HalDoOS.aiMemory
//
// Bestehende Storage-Systeme werden erkannt und genutzt.
// ============================================================

(function (window, document) {

    "use strict";

    // --------------------------------------------------------
    // Duplicate Guard
    // --------------------------------------------------------

    if (
        window.HalDoAIMemory &&
        window.HalDoAIMemory.__haldoAI18
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
            "HalDo AI Memory",

        version:
            "18.0.0",

        storageKey:
            "haldo.ai.memory.v18",

        conversationKey:
            "haldo.ai.conversations.v18",

        settingsKey:
            "haldo.ai.memory.settings.v18",

        maxMemories:
            1000,

        maxConversations:
            100,

        maxMessageLength:
            12000,

        autoSave:
            true,

        persistent:
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

        persistent:
            false,

        saving:
            false,

        loading:
            false,

        memories:
            [],

        conversations:
            {},

        settings: {

            enabled:
                true,

            autoSave:
                true,

            rememberConversations:
                true,

            maxMemories:
                CONFIG.maxMemories,

            maxConversations:
                CONFIG.maxConversations

        },

        errors:
            [],

        lastSaved:
            null,

        lastLoaded:
            null

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
                        "[HalDoAIMemory] Event error:",
                        error
                    );

                }

            }

        }

        try {

            document.dispatchEvent(
                new CustomEvent(
                    `haldo:ai-memory:${event}`,
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
                "[HalDoAIMemory]",
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
    // Utility
    // --------------------------------------------------------

    function createId(
        prefix = "memory"
    ) {

        return (
            prefix +
            "-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 10)
        );

    }

    function normalizeText(
        value
    ) {

        let text =
            String(
                value ??
                ""
            ).trim();

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

    function clone(
        value
    ) {

        try {

            return JSON.parse(
                JSON.stringify(
                    value
                )
            );

        } catch (
            error
        ) {

            return value;

        }

    }

    // --------------------------------------------------------
    // Storage Resolver
    // --------------------------------------------------------

    function getStorageModules() {

        return [

            window.HalDoStorageManager,

            window.HalDoStorage,

            window.HalDoOS?.storageManager,

            window.HalDoOS?.storage,

            window.storageManager,

            window.storage

        ].filter(
            Boolean
        );

    }

    // --------------------------------------------------------
    // Native LocalStorage
    // --------------------------------------------------------

    function nativeStorageAvailable() {

        try {

            if (
                !window.localStorage
            ) {

                return false;

            }

            const testKey =
                "__haldo_memory_test__";

            window.localStorage.setItem(
                testKey,
                "1"
            );

            window.localStorage.removeItem(
                testKey
            );

            return true;

        } catch (
            error
        ) {

            return false;

        }

    }

    // --------------------------------------------------------
    // Storage Write
    // --------------------------------------------------------

    async function storageSet(
        key,
        value
    ) {

        const modules =
            getStorageModules();

        for (
            const storage of modules
        ) {

            const methods = [

                "set",

                "save",

                "setItem",

                "store",

                "write"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof storage[method] !==
                    "function"
                ) {

                    continue;

                }

                try {

                    const result =
                        storage[method](
                            key,
                            value
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

                    log(
                        "Storage module failed:",
                        method,
                        error
                    );

                }

            }

        }

        if (
            nativeStorageAvailable()
        ) {

            window.localStorage.setItem(
                key,
                JSON.stringify(
                    value
                )
            );

            return true;

        }

        return false;

    }

    // --------------------------------------------------------
    // Storage Read
    // --------------------------------------------------------

    async function storageGet(
        key,
        fallback = null
    ) {

        const modules =
            getStorageModules();

        for (
            const storage of modules
        ) {

            const methods = [

                "get",

                "load",

                "getItem",

                "read",

                "retrieve"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof storage[method] !==
                    "function"
                ) {

                    continue;

                }

                try {

                    const result =
                        storage[method](
                            key
                        );

                    const value =
                        result &&
                        typeof result.then ===
                        "function"
                            ? await result
                            : result;

                    if (
                        value !==
                        undefined &&
                        value !==
                        null
                    ) {

                        return value;

                    }

                } catch (
                    error
                ) {

                    log(
                        "Storage read failed:",
                        method,
                        error
                    );

                }

            }

        }

        if (
            nativeStorageAvailable()
        ) {

            try {

                const raw =
                    window.localStorage.getItem(
                        key
                    );

                if (
                    raw ===
                    null
                ) {

                    return fallback;

                }

                return JSON.parse(
                    raw
                );

            } catch (
                error
            ) {

                recordError(
                    error,
                    {
                        phase:
                            "native-storage-read",
                        key
                    }
                );

            }

        }

        return fallback;

    }

    // --------------------------------------------------------
    // Storage Delete
    // --------------------------------------------------------

    async function storageDelete(
        key
    ) {

        const modules =
            getStorageModules();

        for (
            const storage of modules
        ) {

            const methods = [

                "remove",

                "delete",

                "removeItem",

                "clearKey"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof storage[method] !==
                    "function"
                ) {

                    continue;

                }

                try {

                    const result =
                        storage[method](
                            key
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
                ) {}

            }

        }

        if (
            nativeStorageAvailable()
        ) {

            window.localStorage.removeItem(
                key
            );

            return true;

        }

        return false;

    }

    // --------------------------------------------------------
    // Memory Object
    // --------------------------------------------------------

    function createMemory(
        data = {}
    ) {

        return {

            id:
                data.id ||
                createId(
                    "memory"
                ),

            type:
                data.type ||
                "conversation",

            role:
                data.role ||
                "unknown",

            content:
                normalizeText(
                    data.content
                ),

            conversationId:
                data.conversationId ||
                null,

            messageId:
                data.messageId ||
                null,

            importance:
                Number(
                    data.importance ??
                    1
                ),

            tags:
                Array.isArray(
                    data.tags
                )
                    ? [
                        ...new Set(
                            data.tags
                        )
                    ]
                    : [],

            metadata:
                data.metadata ||
                {},

            timestamp:
                Number(
                    data.timestamp
                ) ||
                Date.now(),

            updatedAt:
                Date.now()

        };

    }

    // --------------------------------------------------------
    // Conversation Object
    // --------------------------------------------------------

    function createConversation(
        data = {}
    ) {

        const id =
            data.id ||
            data.conversationId ||
            createId(
                "conversation"
            );

        return {

            id,

            title:
                normalizeText(
                    data.title
                ) ||
                "Neue Unterhaltung",

            createdAt:
                data.createdAt ||
                Date.now(),

            updatedAt:
                Date.now(),

            messages:
                Array.isArray(
                    data.messages
                )
                    ? data.messages
                    : [],

            metadata:
                data.metadata ||
                {}

        };

    }

    // --------------------------------------------------------
    // Add Memory
    // --------------------------------------------------------

    async function addMemory(
        data
    ) {

        if (
            !state.settings.enabled
        ) {

            return null;

        }

        const memory =
            createMemory(
                data
            );

        state.memories.push(
            memory
        );

        trimMemories();

        if (
            state.settings.autoSave
        ) {

            await save();

        }

        emit(
            "memory-added",
            {
                memory:
                    clone(
                        memory
                    )
            }
        );

        return memory;

    }

    // --------------------------------------------------------
    // Message Memory
    // --------------------------------------------------------

    async function addMessage(
        message
    ) {

        if (!message) {

            return null;

        }

        const memory =
            await addMemory({

                type:
                    "conversation",

                role:
                    message.role ||
                    "unknown",

                content:
                    message.content ??
                    message.text ??
                    "",

                conversationId:
                    message.conversationId ||
                    null,

                messageId:
                    message.id ||
                    null,

                metadata:
                    message.metadata ||
                    {},

                tags:
                    [
                        "chat",
                        message.role ||
                            "unknown"
                    ]

            });

        if (
            message.conversationId
        ) {

            await addConversationMessage(
                message.conversationId,
                message
            );

        }

        return memory;

    }

    // --------------------------------------------------------
    // Remember
    // --------------------------------------------------------

    async function remember(
        data
    ) {

        if (
            typeof data ===
            "string"
        ) {

            return addMemory({

                type:
                    "fact",

                role:
                    "user",

                content:
                    data,

                importance:
                    2,

                tags:
                    [
                        "remembered"
                    ]

            });

        }

        return addMemory(
            data
        );

    }

    // --------------------------------------------------------
    // Search
    // --------------------------------------------------------

    function search(
        query,
        options = {}
    ) {

        const text =
            normalizeText(
                query
            ).toLowerCase();

        if (!text) {

            return [];

        }

        const limit =
            Math.max(
                1,
                Number(
                    options.limit ||
                    50
                )
            );

        const results =
            state.memories
                .map(
                    memory => {

                        const content =
                            memory.content
                                .toLowerCase();

                        const index =
                            content.indexOf(
                                text
                            );

                        if (
                            index ===
                            -1
                        ) {

                            return null;

                        }

                        let score =
                            1;

                        if (
                            index ===
                            0
                        ) {

                            score +=
                                2;

                        }

                        if (
                            memory.importance >
                            1
                        ) {

                            score +=
                                memory.importance;

                        }

                        return {

                            memory,

                            score

                        };

                    }
                )
                .filter(
                    Boolean
                )
                .sort(
                    (a, b) =>
                        b.score -
                        a.score
                )
                .slice(
                    0,
                    limit
                )
                .map(
                    item =>
                        clone(
                            item.memory
                        )
                );

        return results;

    }

    // --------------------------------------------------------
    // Search Conversations
    // --------------------------------------------------------

    function searchConversations(
        query,
        options = {}
    ) {

        const text =
            normalizeText(
                query
            ).toLowerCase();

        if (!text) {

            return [];

        }

        const limit =
            Math.max(
                1,
                Number(
                    options.limit ||
                    50
                )
            );

        return Object.values(
            state.conversations
        )
        .filter(
            conversation => {

                if (
                    conversation.title
                        .toLowerCase()
                        .includes(
                            text
                        )
                ) {

                    return true;

                }

                return conversation.messages
                    .some(
                        message =>
                            normalizeText(
                                message.content
                            )
                            .toLowerCase()
                            .includes(
                                text
                            )
                    );

            }
        )
        .slice(
            0,
            limit
        )
        .map(
            conversation =>
                clone(
                    conversation
                )
        );

    }

    // --------------------------------------------------------
    // Get Memories
    // --------------------------------------------------------

    function getMemories(
        options = {}
    ) {

        const limit =
            Math.max(
                1,
                Number(
                    options.limit ||
                    100
                )
            );

        let result =
            state.memories;

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
            options.role
        ) {

            result =
                result.filter(
                    memory =>
                        memory.role ===
                        options.role
                );

        }

        if (
            options.conversationId
        ) {

            result =
                result.filter(
                    memory =>
                        memory.conversationId ===
                        options.conversationId
                );

        }

        return clone(
            result.slice(
                -limit
            )
        );

    }

    // --------------------------------------------------------
    // Remove Memory
    // --------------------------------------------------------

    async function removeMemory(
        id
    ) {

        const index =
            state.memories.findIndex(
                memory =>
                    memory.id ===
                    id
            );

        if (
            index ===
            -1
        ) {

            return false;

        }

        const removed =
            state.memories.splice(
                index,
                1
            )[0];

        await save();

        emit(
            "memory-removed",
            {
                memory:
                    clone(
                        removed
                    )
            }
        );

        return true;

    }

    // --------------------------------------------------------
    // Clear Memories
    // --------------------------------------------------------

    async function clearMemories(
        options = {}
    ) {

        if (
            options.type
        ) {

            state.memories =
                state.memories.filter(
                    memory =>
                        memory.type !==
                        options.type
                );

        } else {

            state.memories =
                [];

        }

        await save();

        emit(
            "memories-cleared"
        );

        return true;

    }

    // --------------------------------------------------------
    // Trim Memories
    // --------------------------------------------------------

    function trimMemories() {

        const limit =
            Math.max(
                1,
                Number(
                    state.settings.maxMemories ||
                    CONFIG.maxMemories
                )
            );

        if (
            state.memories.length >
            limit
        ) {

            /*
             * Wichtigere Erinnerungen bleiben
             * möglichst lange erhalten.
             */

            state.memories.sort(
                (a, b) => {

                    const scoreA =
                        a.importance +
                        (
                            a.timestamp /
                            1000000000000000
                        );

                    const scoreB =
                        b.importance +
                        (
                            b.timestamp /
                            1000000000000000
                        );

                    return scoreB -
                        scoreA;

                }
            );

            state.memories =
                state.memories.slice(
                    0,
                    limit
                );

            state.memories.sort(
                (a, b) =>
                    a.timestamp -
                    b.timestamp
            );

        }

    }

    // --------------------------------------------------------
    // Create Conversation
    // --------------------------------------------------------

    async function createConversation(
        data = {}
    ) {

        const conversation =
            createConversation(
                data
            );

        state.conversations[
            conversation.id
        ] =
            conversation;

        trimConversations();

        await saveConversations();

        emit(
            "conversation-created",
            {
                conversation:
                    clone(
                        conversation
                    )
            }
        );

        return conversation;

    }

    // --------------------------------------------------------
    // Add Conversation Message
    // --------------------------------------------------------

    async function addConversationMessage(
        conversationId,
        message
    ) {

        if (
            !conversationId
        ) {

            return null;

        }

        let conversation =
            state.conversations[
                conversationId
            ];

        if (!conversation) {

            conversation =
                await createConversation(
                    {
                        id:
                            conversationId
                    }
                );

        }

        conversation.messages.push({

            id:
                message.id ||
                createId(
                    "message"
                ),

            role:
                message.role ||
                "unknown",

            content:
                normalizeText(
                    message.content ??
                    message.text
                ),

            timestamp:
                message.timestamp ||
                Date.now(),

            metadata:
                message.metadata ||
                {}

        });

        conversation.updatedAt =
            Date.now();

        /*
         * Titel automatisch aus erster
         * User-Nachricht erzeugen.
         */

        if (
            conversation.title ===
            "Neue Unterhaltung" &&
            message.role ===
            "user"
        ) {

            const title =
                normalizeText(
                    message.content ??
                    message.text
                );

            conversation.title =
                title.length > 50
                    ? title.slice(
                        0,
                        50
                    ) + "..."
                    : title;

        }

        await saveConversations();

        emit(
            "conversation-message",
            {
                conversationId,

                message:
                    clone(
                        message
                    )
            }
        );

        return conversation;

    }

    // --------------------------------------------------------
    // Get Conversation
    // --------------------------------------------------------

    function getConversation(
        conversationId
    ) {

        const conversation =
            state.conversations[
                conversationId
            ];

        return conversation
            ? clone(
                conversation
            )
            : null;

    }

    // --------------------------------------------------------
    // Get Conversations
    // --------------------------------------------------------

    function getConversations(
        options = {}
    ) {

        const limit =
            Math.max(
                1,
                Number(
                    options.limit ||
                    CONFIG.maxConversations
                )
            );

        return Object.values(
            state.conversations
        )
        .sort(
            (a, b) =>
                b.updatedAt -
                a.updatedAt
        )
        .slice(
            0,
            limit
        )
        .map(
            conversation =>
                clone(
                    conversation
                )
        );

    }

    // --------------------------------------------------------
    // Delete Conversation
    // --------------------------------------------------------

    async function deleteConversation(
        conversationId
    ) {

        if (
            !state.conversations[
                conversationId
            ]
        ) {

            return false;

        }

        delete state.conversations[
            conversationId
        ];

        state.memories =
            state.memories.filter(
                memory =>
                    memory.conversationId !==
                    conversationId
            );

        await save();

        await saveConversations();

        emit(
            "conversation-deleted",
            {
                conversationId
            }
        );

        return true;

    }

    // --------------------------------------------------------
    // Clear Conversations
    // --------------------------------------------------------

    async function clearConversations() {

        state.conversations =
            {};

        await saveConversations();

        emit(
            "conversations-cleared"
        );

        return true;

    }

    // --------------------------------------------------------
    // Trim Conversations
    // --------------------------------------------------------

    function trimConversations() {

        const limit =
            Math.max(
                1,
                Number(
                    state.settings.maxConversations ||
                    CONFIG.maxConversations
                )
            );

        const conversations =
            Object.values(
                state.conversations
            )
            .sort(
                (a, b) =>
                    b.updatedAt -
                    a.updatedAt
            )
            .slice(
                0,
                limit
            );

        state.conversations =
            {};

        for (
            const conversation of
            conversations
        ) {

            state.conversations[
                conversation.id
            ] =
                conversation;

        }

    }

    // --------------------------------------------------------
    // Save Memory
    // --------------------------------------------------------

    async function save() {

        if (
            state.saving
        ) {

            return false;

        }

        state.saving =
            true;

        try {

            trimMemories();

            const data = {

                version:
                    CONFIG.version,

                savedAt:
                    Date.now(),

                memories:
                    state.memories,

                settings:
                    state.settings

            };

            const result =
                await storageSet(
                    CONFIG.storageKey,
                    data
                );

            if (
                result !== false
            ) {

                state.persistent =
                    true;

                state.lastSaved =
                    Date.now();

                emit(
                    "saved",
                    {
                        count:
                            state.memories.length
                    }
                );

                return true;

            }

            return false;

        } catch (
            error
        ) {

            recordError(
                error,
                {
                    phase:
                        "save"
                }
            );

            return false;

        } finally {

            state.saving =
                false;

        }

    }

    // --------------------------------------------------------
    // Save Conversations
    // --------------------------------------------------------

    async function saveConversations() {

        try {

            trimConversations();

            const data = {

                version:
                    CONFIG.version,

                savedAt:
                    Date.now(),

                conversations:
                    state.conversations

            };

            return (
                await storageSet(
                    CONFIG.conversationKey,
                    data
                )
            );

        } catch (
            error
        ) {

            recordError(
                error,
                {
                    phase:
                        "save-conversations"
                }
            );

            return false;

        }

    }

    // --------------------------------------------------------
    // Load Memory
    // --------------------------------------------------------

    async function load() {

        if (
            state.loading
        ) {

            return false;

        }

        state.loading =
            true;

        try {

            const data =
                await storageGet(
                    CONFIG.storageKey,
                    null
                );

            if (
                data &&
                Array.isArray(
                    data.memories
                )
            ) {

                state.memories =
                    data.memories
                        .map(
                            memory =>
                                createMemory(
                                    memory
                                )
                        );

            }

            if (
                data?.settings
            ) {

                state.settings = {

                    ...state.settings,

                    ...data.settings

                };

            }

            trimMemories();

            state.lastLoaded =
                Date.now();

            state.persistent =
                nativeStorageAvailable() ||
                getStorageModules().length >
                0;

            emit(
                "loaded",
                {
                    count:
                        state.memories.length
                }
            );

            return true;

        } catch (
            error
        ) {

            recordError(
                error,
                {
                    phase:
                        "load"
                }
            );

            return false;

        } finally {

            state.loading =
                false;

        }

    }

    // --------------------------------------------------------
    // Load Conversations
    // --------------------------------------------------------

    async function loadConversations() {

        try {

            const data =
                await storageGet(
                    CONFIG.conversationKey,
                    null
                );

            if (
                data?.conversations
            ) {

                state.conversations =
                    data.conversations;

            }

            trimConversations();

            return true;

        } catch (
            error
        ) {

            recordError(
                error,
                {
                    phase:
                        "load-conversations"
                }
            );

            return false;

        }

    }

    // --------------------------------------------------------
    // Settings
    // --------------------------------------------------------

    async function setSetting(
        key,
        value
    ) {

        if (
            !Object.prototype.hasOwnProperty.call(
                state.settings,
                key
            )
        ) {

            return false;

        }

        state.settings[key] =
            value;

        await storageSet(
            CONFIG.settingsKey,
            state.settings
        );

        emit(
            "settings-changed",
            {
                key,
                value
            }
        );

        return true;

    }

    function getSettings() {

        return clone(
            state.settings
        );

    }

    // --------------------------------------------------------
    // Export
    // --------------------------------------------------------

    function exportData() {

        return {

            system:
                "HalDo AI OS 18",

            module:
                CONFIG.name,

            version:
                CONFIG.version,

            exportedAt:
                Date.now(),

            memories:
                clone(
                    state.memories
                ),

            conversations:
                clone(
                    state.conversations
                ),

            settings:
                clone(
                    state.settings
                )

        };

    }

    // --------------------------------------------------------
    // Import
    // --------------------------------------------------------

    async function importData(
        data,
        options = {}
    ) {

        if (
            !data ||
            typeof data !==
            "object"
        ) {

            return false;

        }

        if (
            Array.isArray(
                data.memories
            )
        ) {

            if (
                options.replace
            ) {

                state.memories =
                    [];

            }

            for (
                const memory of
                data.memories
            ) {

                state.memories.push(
                    createMemory(
                        memory
                    )
                );

            }

        }

        if (
            data.conversations
        ) {

            if (
                options.replace
            ) {

                state.conversations =
                    {};

            }

            Object.assign(
                state.conversations,
                data.conversations
            );

        }

        if (
            data.settings
        ) {

            state.settings = {

                ...state.settings,

                ...data.settings

            };

        }

        trimMemories();

        trimConversations();

        await save();

        await saveConversations();

        emit(
            "imported"
        );

        return true;

    }

    // --------------------------------------------------------
    // Wipe Everything
    // --------------------------------------------------------

    async function wipe() {

        state.memories =
            [];

        state.conversations =
            {};

        await storageDelete(
            CONFIG.storageKey
        );

        await storageDelete(
            CONFIG.conversationKey
        );

        await storageDelete(
            CONFIG.settingsKey
        );

        emit(
            "wiped"
        );

        return true;

    }

    // --------------------------------------------------------
    // Status
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

            persistent:
                state.persistent,

            saving:
                state.saving,

            loading:
                state.loading,

            memoryCount:
                state.memories.length,

            conversationCount:
                Object.keys(
                    state.conversations
                ).length,

            errorCount:
                state.errors.length,

            autoSave:
                state.settings.autoSave,

            enabled:
                state.settings.enabled,

            lastSaved:
                state.lastSaved,

            lastLoaded:
                state.lastLoaded

        };

    }

    // --------------------------------------------------------
    // Reset Runtime
    // --------------------------------------------------------

    function resetRuntime() {

        state.memories =
            [];

        state.conversations =
            {};

        state.errors =
            [];

        state.lastSaved =
            null;

        state.lastLoaded =
            null;

        emit(
            "runtime-reset"
        );

        return true;

    }

    // --------------------------------------------------------
    // Initialize
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
         * Zuerst gespeicherte Daten laden.
         */

        await load();

        await loadConversations();

        /*
         * Core registrieren.
         */

        const core =
            window.HalDoAICore ||
            window.HalDoOS?.aiCore;

        if (
            core &&
            typeof core.registerModule ===
            "function"
        ) {

            try {

                core.registerModule(
                    "memory",
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
         * Chat-Events beobachten.
         */

        document.addEventListener(
            "haldo:ai-chat:message-added",
            event => {

                const message =
                    event.detail?.message;

                if (
                    message &&
                    state.settings.autoSave
                ) {

                    /*
                     * Das Chat-Modul speichert
                     * bereits selbst. Hier wird
                     * nur eine zusätzliche
                     * Synchronisierung angestoßen.
                     */

                    save();

                }

            }
        );

        /*
         * Core History beobachten.
         */

        document.addEventListener(
            "haldo:ai:history",
            event => {

                const entry =
                    event.detail;

                if (
                    entry &&
                    entry.content &&
                    state.settings.enabled
                ) {

                    /*
                     * Nur speichern, wenn das
                     * Element noch nicht vorhanden ist.
                     */

                    const exists =
                        state.memories.some(
                            memory =>
                                memory.messageId ===
                                    entry.metadata?.messageId ||
                                (
                                    memory.content ===
                                        entry.content &&
                                    memory.role ===
                                        entry.role &&
                                    Math.abs(
                                        memory.timestamp -
                                        (
                                            entry.timestamp ||
                                            Date.now()
                                        )
                                    ) < 2000
                                )
                        );

                    if (
                        !exists
                    ) {

                        addMemory({
                            type:
                                "core-history",

                            role:
                                entry.role,

                            content:
                                entry.content,

                            conversationId:
                                entry.metadata
                                    ?.conversationId ||
                                null,

                            messageId:
                                entry.metadata
                                    ?.messageId ||
                                null,

                            metadata:
                                entry.metadata ||
                                {}

                        });

                    }

                }

            }
        );

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
                    "[HalDoAIMemory] " +
                    "HalDo AI Memory 18 bereit."
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

        addMemory,

        addMessage,

        remember,

        search,

        searchConversations,

        getMemories,

        removeMemory,

        clearMemories,

        createConversation,

        addConversationMessage,

        getConversation,

        getConversations,

        deleteConversation,

        clearConversations,

        save,

        load,

        saveConversations,

        loadConversations,

        setSetting,

        getSettings,

        exportData,

        importData,

        wipe,

        getStatus,

        resetRuntime

    };

    // --------------------------------------------------------
    // Global APIs
    // --------------------------------------------------------

    window.HalDoAIMemory =
        api;

    window.HalDoOS.aiMemory =
        api;

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
// END OF PART 75
// ============================================================