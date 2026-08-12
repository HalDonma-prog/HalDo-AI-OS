// ============================================================
// HALDO AI OS 18
// AI MEMORY ENGINE
// PART 80
// ============================================================

(function (window, document) {

    "use strict";

    if (
        window.HalDoAIMemory &&
        window.HalDoAIMemory.__haldoAI18
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    // --------------------------------------------------------
    // CONFIGURATION
    // --------------------------------------------------------

    const CONFIG = {

        name:
            "HalDo AI Memory Engine",

        version:
            "18.0.0",

        storageKey:
            "haldo-ai-memory",

        conversationKey:
            "haldo-ai-conversations",

        maxMemories:
            2000,

        maxContext:
            20,

        maxHistory:
            1000,

        autoPersist:
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

        memories:
            [],

        history:
            [],

        conversations:
            new Map(),

        searches:
            0,

        stores:
            0,

        recalls:
            0,

        errors:
            [],

        lastSearch:
            null,

        lastRecall:
            null

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
                        "[HalDoAIMemory]",
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

    function normalize(
        value
    ) {

        return clean(
            value
        )
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        );

    }

    function createId(
        prefix =
            "memory"
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

    // --------------------------------------------------------
    // STORAGE ACCESS
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

    async function storageSet(
        key,
        value
    ) {

        const storage =
            getStorage();

        if (storage) {

            const methods = [

                "set",
                "save",
                "write",
                "store"

            ];

            for (
                const method of
                methods
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

        /*
         * Fallback auf localStorage.
         */

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

    async function storageGet(
        key,
        fallback = null
    ) {

        const storage =
            getStorage();

        if (storage) {

            const methods = [

                "get",
                "load",
                "read",
                "retrieve"

            ];

            for (
                const method of
                methods
            ) {

                if (
                    typeof storage[method] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const value =
                        await storage[method](
                            key
                        );

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

    async function storageRemove(
        key
    ) {

        const storage =
            getStorage();

        if (storage) {

            const methods = [

                "remove",
                "delete",
                "clearKey"

            ];

            for (
                const method of
                methods
            ) {

                if (
                    typeof storage[method] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    await storage[method](
                        key
                    );

                    return true;

                } catch (
                    error
                ) {}

            }

        }

        try {

            localStorage.removeItem(
                key
            );

            return true;

        } catch (
            error
        ) {

            return false;

        }

    }

    // --------------------------------------------------------
    // MEMORY NORMALIZATION
    // --------------------------------------------------------

    function normalizeMemory(
        input
    ) {

        if (
            typeof input ===
            "string"
        ) {

            return {

                id:
                    createId(),

                type:
                    "text",

                content:
                    clean(
                        input
                    ),

                tags:
                    [],

                importance:
                    1,

                createdAt:
                    now(),

                updatedAt:
                    now(),

                accessCount:
                    0,

                lastAccessedAt:
                    null

            };

        }

        const memory =
            input || {};

        return {

            id:
                memory.id ||
                createId(),

            type:
                memory.type ||
                "text",

            content:
                clean(
                    memory.content ??
                    memory.text ??
                    memory.value ??
                    ""
                ),

            title:
                memory.title ||
                "",

            tags:
                Array.isArray(
                    memory.tags
                )
                    ? memory.tags
                    : [],

            category:
                memory.category ||
                "general",

            language:
                memory.language ||
                null,

            importance:
                Number(
                    memory.importance ??
                    1
                ),

            source:
                memory.source ||
                "ai",

            conversationId:
                memory.conversationId ||
                null,

            metadata:
                memory.metadata ||
                {},

            createdAt:
                memory.createdAt ||
                now(),

            updatedAt:
                now(),

            accessCount:
                Number(
                    memory.accessCount ||
                    0
                ),

            lastAccessedAt:
                memory.lastAccessedAt ||
                null

        };

    }

    // --------------------------------------------------------
    // SAVE MEMORY DATABASE
    // --------------------------------------------------------

    async function persist() {

        if (
            !CONFIG.autoPersist
        ) {

            return false;

        }

        const result =
            await storageSet(
                CONFIG.storageKey,
                {

                    version:
                        CONFIG.version,

                    updatedAt:
                        now(),

                    memories:
                        state.memories

                }
            );

        emit(
            "persisted",
            {
                ok:
                    result
            }
        );

        return result;

    }

    async function persistConversations() {

        const conversations =
            Array.from(
                state.conversations.values()
            );

        return storageSet(
            CONFIG.conversationKey,
            {

                version:
                    CONFIG.version,

                updatedAt:
                    now(),

                conversations

            }
        );

    }

    // --------------------------------------------------------
    // LOAD
    // --------------------------------------------------------

    async function load() {

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
                    data.memories.map(
                        memory =>
                            normalizeMemory(
                                memory
                            )
                    );

            }

            const conversations =
                await storageGet(
                    CONFIG.conversationKey,
                    null
                );

            if (
                conversations &&
                Array.isArray(
                    conversations.conversations
                )
            ) {

                state.conversations =
                    new Map(
                        conversations.conversations.map(
                            conversation => [

                                conversation.id,

                                conversation

                            ]
                        )
                    );

            }

            emit(
                "loaded",
                {

                    memories:
                        state.memories.length,

                    conversations:
                        state.conversations.size

                }
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
    // STORE
    // --------------------------------------------------------

    async function store(
        input,
        options = {}
    ) {

        const memory =
            normalizeMemory({

                ...(
                    typeof input ===
                    "object"
                        ? input
                        : {}
                ),

                content:
                    typeof input ===
                    "string"
                        ? input
                        : (
                            input?.content ??
                            input?.text ??
                            input?.value
                        ),

                ...options

            });

        if (
            !memory.content
        ) {

            return {

                ok:
                    false,

                error:
                    "EMPTY_MEMORY"

            };

        }

        /*
         * Duplikate vermeiden.
         */

        const duplicate =
            state.memories.find(
                existing =>

                    normalize(
                        existing.content
                    ) ===
                    normalize(
                        memory.content
                    )

            );

        if (duplicate) {

            duplicate.updatedAt =
                now();

            duplicate.accessCount++;

            await persist();

            return {

                ok:
                    true,

                duplicate:
                    true,

                memory:
                    duplicate

            };

        }

        state.memories.push(
            memory
        );

        state.stores++;

        /*
         * Maximale Größe.
         */

        if (
            state.memories.length >
            CONFIG.maxMemories
        ) {

            state.memories.sort(
                (
                    a,
                    b
                ) => {

                    const scoreA =
                        Number(
                            a.importance ||
                            1
                        );

                    const scoreB =
                        Number(
                            b.importance ||
                            1
                        );

                    return scoreB -
                        scoreA;

                }
            );

            state.memories =
                state.memories.slice(
                    0,
                    CONFIG.maxMemories
                );

        }

        await persist();

        emit(
            "stored",
            {
                memory
            }
        );

        return {

            ok:
                true,

            memory

        };

    }

    // --------------------------------------------------------
    // REMEMBER
    // --------------------------------------------------------

    async function remember(
        input,
        options = {}
    ) {

        return store(
            input,
            {

                source:
                    options.source ||
                    "conversation",

                category:
                    options.category ||
                    "conversation",

                importance:
                    options.importance ??
                    2,

                ...options

            }
        );

    }

    // --------------------------------------------------------
    // REMOVE
    // --------------------------------------------------------

    async function remove(
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

        await persist();

        emit(
            "removed",
            {
                memory:
                    removed
            }
        );

        return true;

    }

    // --------------------------------------------------------
    // CLEAR
    // --------------------------------------------------------

    async function clear() {

        state.memories =
            [];

        state.history =
            [];

        await persist();

        emit(
            "cleared"
        );

        return true;

    }

    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    function scoreMemory(
        memory,
        queryTokens
    ) {

        const text =
            normalize(
                [

                    memory.content,

                    memory.title,

                    memory.category,

                    memory.source,

                    ...(memory.tags || [])

                ].join(
                    " "
                )
            );

        if (!text) {
            return 0;
        }

        let score =
            0;

        for (
            const token of
            queryTokens
        ) {

            if (!token) {
                continue;
            }

            if (
                text.includes(
                    token
                )
            ) {

                score +=
                    token.length;

            }

            if (
                normalize(
                    memory.title
                ).includes(
                    token
                )
            ) {

                score +=
                    10;

            }

            if (
                (
                    memory.tags ||
                    []
                )
                .map(
                    tag =>
                        normalize(
                            tag
                        )
                )
                .includes(
                    token
                )
            ) {

                score +=
                    15;

            }

        }

        /*
         * Wichtigkeit.
         */

        score +=
            Number(
                memory.importance ||
                1
            ) * 2;

        /*
         * Aktualität.
         */

        const age =
            Math.max(
                0,
                now() -
                Number(
                    memory.updatedAt ||
                    memory.createdAt ||
                    now()
                )
            );

        const days =
            age /
            86400000;

        if (
            days <
            1
        ) {

            score +=
                5;

        } else if (
            days <
            7
        ) {

            score +=
                2;

        }

        return score;

    }

    function search(
        query,
        options = {}
    ) {

        const text =
            clean(
                query
            );

        if (!text) {

            return [];

        }

        state.searches++;

        const tokens =
            normalize(
                text
            )
            .split(
                /\s+/
            )
            .filter(
                token =>
                    token.length >
                    1
            );

        const limit =
            Number(
                options.limit ||
                CONFIG.maxContext
            );

        const results =
            state.memories
                .map(
                    memory => ({

                        memory,

                        score:
                            scoreMemory(
                                memory,
                                tokens
                            )

                    })
                )
                .filter(
                    result =>
                        result.score >
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
                    limit
                );

        state.lastSearch = {

            query:
                text,

            timestamp:
                now(),

            results:
                results.length

        };

        /*
         * Zugriff aktualisieren.
         */

        results.forEach(
            result => {

                result.memory.accessCount++;

                result.memory.lastAccessedAt =
                    now();

            }
        );

        emit(
            "searched",
            {

                query:
                    text,

                results

            }
        );

        return results;

    }

    // --------------------------------------------------------
    // RECALL
    // --------------------------------------------------------

    function recall(
        query,
        options = {}
    ) {

        const results =
            search(
                query,
                options
            );

        state.recalls++;

        state.lastRecall = {

            query:
                clean(
                    query
                ),

            timestamp:
                now(),

            results:
                results.length

        };

        return results.map(
            result =>
                result.memory
        );

    }

    // --------------------------------------------------------
    // GET RELEVANT CONTEXT
    // --------------------------------------------------------

    function getRelevant(
        query,
        options = {}
    ) {

        const memories =
            recall(
                query,
                {

                    limit:
                        options.limit ||
                        CONFIG.maxContext

                }
            );

        return memories.map(
            memory => ({

                id:
                    memory.id,

                content:
                    memory.content,

                title:
                    memory.title,

                category:
                    memory.category,

                importance:
                    memory.importance,

                source:
                    memory.source

            })
        );

    }

    // --------------------------------------------------------
    // GET CONTEXT TEXT
    // --------------------------------------------------------

    function getContext(
        query,
        options = {}
    ) {

        const relevant =
            getRelevant(
                query,
                options
            );

        if (
            !relevant.length
        ) {

            return "";

        }

        return relevant
            .map(
                (
                    memory,
                    index
                ) =>
                    `[Memory ${index + 1}] ` +
                    memory.content
            )
            .join(
                "\n"
            );

    }

    // --------------------------------------------------------
    // CONVERSATION MEMORY
    // --------------------------------------------------------

    async function rememberConversation(
        conversationId,
        messages
    ) {

        if (
            !conversationId ||
            !Array.isArray(
                messages
            )
        ) {

            return {

                ok:
                    false,

                error:
                    "INVALID_CONVERSATION"

            };

        }

        const conversation = {

            id:
                conversationId,

            messages:
                messages.map(
                    message => ({
                        ...message
                    })
                ),

            updatedAt:
                now()

        };

        state.conversations.set(
            conversationId,
            conversation
        );

        await persistConversations();

        emit(
            "conversation-stored",
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

    function getConversation(
        conversationId
    ) {

        return (
            state.conversations.get(
                conversationId
            ) ||
            null
        );

    }

    async function removeConversation(
        conversationId
    ) {

        if (
            !state.conversations.has(
                conversationId
            )
        ) {

            return false;

        }

        state.conversations.delete(
            conversationId
        );

        await persistConversations();

        emit(
            "conversation-removed",
            {
                conversationId
            }
        );

        return true;

    }

    // --------------------------------------------------------
    // IMPORT / EXPORT
    // --------------------------------------------------------

    function exportData() {

        return {

            version:
                CONFIG.version,

            exportedAt:
                now(),

            memories:
                state.memories.map(
                    memory => ({
                        ...memory
                    })
                ),

            conversations:
                Array.from(
                    state.conversations.values()
                ).map(
                    conversation => ({
                        ...conversation
                    })
                )

        };

    }

    async function importData(
        data,
        options = {}
    ) {

        if (
            !data ||
            typeof data !==
            "object"
        ) {

            return {

                ok:
                    false,

                error:
                    "INVALID_MEMORY_DATA"

            };

        }

        if (
            options.replace ===
            true
        ) {

            state.memories =
                [];

            state.conversations =
                new Map();

        }

        if (
            Array.isArray(
                data.memories
            )
        ) {

            for (
                const memory of
                data.memories
            ) {

                const normalized =
                    normalizeMemory(
                        memory
                    );

                if (
                    normalized.content
                ) {

                    state.memories.push(
                        normalized
                    );

                }

            }

        }

        if (
            Array.isArray(
                data.conversations
            )
        ) {

            for (
                const conversation of
                data.conversations
            ) {

                if (
                    conversation.id
                ) {

                    state.conversations.set(
                        conversation.id,
                        conversation
                    );

                }

            }

        }

        /*
         * Limits anwenden.
         */

        state.memories =
            state.memories.slice(
                -CONFIG.maxMemories
            );

        await persist();
        await persistConversations();

        emit(
            "imported",
            {
                memories:
                    state.memories.length,

                conversations:
                    state.conversations.size

            }
        );

        return {

            ok:
                true,

            memories:
                state.memories.length,

            conversations:
                state.conversations.size

        };

    }

    // --------------------------------------------------------
    // ERROR HANDLING
    // --------------------------------------------------------

    function recordError(
        error
    ) {

        const entry = {

            timestamp:
                now(),

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

            memories:
                state.memories.length,

            conversations:
                state.conversations.size,

            searches:
                state.searches,

            stores:
                state.stores,

            recalls:
                state.recalls,

            errors:
                state.errors.length,

            lastSearch:
                state.lastSearch,

            lastRecall:
                state.lastRecall,

            storage:
                Boolean(
                    getStorage()
                )

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
                    "ai-memory",
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

        store,

        save:
            store,

        remember,

        add:
            store,

        remove,

        delete:
            remove,

        clear,

        search,

        recall,

        retrieve:
            recall,

        getRelevant,

        getContext,

        rememberConversation,

        getConversation,

        removeConversation,

        exportData,

        importData,

        load,

        persist,

        getStatus

    };

    // --------------------------------------------------------
    // GLOBAL REGISTRATION
    // --------------------------------------------------------

    window.HalDoAIMemory =
        api;

    window.HalDoOS.aiMemory =
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
                "[HalDoAIMemory] " +
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
// END OF PART 80
// ============================================================