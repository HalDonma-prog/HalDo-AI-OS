// ============================================================
// HALDO AI OS 18
// AI MEMORY
// PART 85
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

    const CONFIG = {

        name:
            "HalDo AI Memory",

        version:
            "18.0.0",

        mode:
            "Professional Ultimate Foundation",

        storageKey:
            "haldo-ai-memory",

        maxMemories:
            2000,

        maxHistory:
            500,

        maxSearchResults:
            50,

        autoSave:
            true,

        enabled:
            true,

        rememberConversation:
            true,

        rememberCorrections:
            true,

        rememberWriting:
            true,

        rememberReading:
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

        memoryCount:
            0,

        searchCount:
            0,

        writeCount:
            0,

        readCount:
            0,

        correctionCount:
            0,

        errors:
            [],

        memories:
            [],

        history:
            [],

        lastMemory:
            null,

        lastSearch:
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

                } catch (error) {

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

        } catch (error) {}

    }

    // --------------------------------------------------------
    // UTILITIES
    // --------------------------------------------------------

    function clean(
        value
    ) {

        return String(
            value ?? ""
        ).trim();

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

    function normalizeText(
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

    function now() {

        return Date.now();

    }

    // --------------------------------------------------------
    // STORAGE CONNECTION
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

                } catch (error) {}

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

        } catch (error) {

            recordError(
                error
            );

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

                } catch (error) {}

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

        } catch (error) {

            return fallback;

        }

    }

    async function persist() {

        if (
            !CONFIG.autoSave
        ) {
            return false;
        }

        const payload = {

            version:
                CONFIG.version,

            updatedAt:
                now(),

            memories:
                state.memories

        };

        return storageSet(
            CONFIG.storageKey,
            payload
        );

    }

    // --------------------------------------------------------
    // MEMORY NORMALIZATION
    // --------------------------------------------------------

    function normalizeMemory(
        input,
        options = {}
    ) {

        let data = {};

        if (
            typeof input ===
            "string"
        ) {

            data.content =
                input;

        } else if (
            input &&
            typeof input ===
            "object"
        ) {

            data = {
                ...input
            };

        }

        const content =
            clean(
                data.content ??
                data.text ??
                data.message ??
                data.value ??
                ""
            );

        const type =
            clean(
                data.type ||
                options.type ||
                "general"
            ) || "general";

        const language =
            clean(
                data.language ||
                options.language ||
                window.HalDoAILanguage?.getLanguage?.() ||
                "de"
            ) || "de";

        const tags =
            Array.isArray(
                data.tags
            )
                ? [
                    ...new Set(
                        data.tags
                            .map(
                                tag =>
                                    clean(tag)
                            )
                            .filter(
                                Boolean
                            )
                    )
                ]
                : [];

        return {

            id:
                data.id ||
                createId(),

            type,

            content,

            text:
                content,

            language,

            tags,

            source:
                data.source ||
                options.source ||
                "ai",

            importance:
                Number.isFinite(
                    Number(
                        data.importance
                    )
                )
                    ? Number(
                        data.importance
                    )
                    : 0.5,

            confidence:
                Number.isFinite(
                    Number(
                        data.confidence
                    )
                )
                    ? Number(
                        data.confidence
                    )
                    : 1,

            metadata:
                data.metadata &&
                typeof data.metadata ===
                "object"
                    ? {
                        ...data.metadata
                    }
                    : {},

            createdAt:
                data.createdAt ||
                now(),

            updatedAt:
                now(),

            accessCount:
                Number(
                    data.accessCount
                ) || 0,

            lastAccessedAt:
                data.lastAccessedAt ||
                null

        };

    }

    // --------------------------------------------------------
    // ADD / REMEMBER
    // --------------------------------------------------------

    async function remember(
        input,
        options = {}
    ) {

        if (
            !CONFIG.enabled
        ) {

            return {

                ok:
                    false,

                error:
                    "MEMORY_DISABLED"

            };

        }

        const memory =
            normalizeMemory(
                input,
                options
            );

        if (!memory.content) {

            return {

                ok:
                    false,

                error:
                    "EMPTY_MEMORY"

            };

        }

        /*
         * Bestimmte Memory-Typen können
         * über die Konfiguration gesteuert
         * werden.
         */

        if (
            memory.type ===
            "conversation" &&
            !CONFIG.rememberConversation
        ) {

            return {

                ok:
                    false,

                error:
                    "CONVERSATION_MEMORY_DISABLED"

            };

        }

        if (
            memory.type ===
            "correction" &&
            !CONFIG.rememberCorrections
        ) {

            return {

                ok:
                    false,

                error:
                    "CORRECTION_MEMORY_DISABLED"

            };

        }

        if (
            memory.type ===
            "writing" &&
            !CONFIG.rememberWriting
        ) {

            return {

                ok:
                    false,

                error:
                    "WRITING_MEMORY_DISABLED"

            };

        }

        if (
            memory.type ===
            "reading" &&
            !CONFIG.rememberReading
        ) {

            return {

                ok:
                    false,

                error:
                    "READING_MEMORY_DISABLED"

            };

        }

        /*
         * Duplikate erkennen.
         */

        const duplicate =
            state.memories.find(
                item =>
                    normalizeText(
                        item.content
                    ) ===
                    normalizeText(
                        memory.content
                    ) &&
                    item.type ===
                    memory.type
            );

        if (duplicate) {

            duplicate.updatedAt =
                now();

            duplicate.accessCount++;

            state.lastMemory =
                duplicate;

            await persist();

            emit(
                "memory-updated",
                {
                    memory:
                        duplicate
                }
            );

            return {

                ok:
                    true,

                created:
                    false,

                updated:
                    true,

                memory:
                    duplicate

            };

        }

        state.memories.push(
            memory
        );

        state.memoryCount =
            state.memories.length;

        state.writeCount++;

        state.lastMemory =
            memory;

        state.history.push({

            action:
                "remember",

            memoryId:
                memory.id,

            timestamp:
                now()

        });

        if (
            state.history.length >
            CONFIG.maxHistory
        ) {

            state.history.shift();

        }

        /*
         * Maximale Anzahl verwalten.
         */

        if (
            state.memories.length >
            CONFIG.maxMemories
        ) {

            state.memories.sort(
                (a, b) =>
                    (
                        Number(
                            b.importance
                        ) +
                        Number(
                            b.updatedAt
                        ) / 1e15
                    ) -
                    (
                        Number(
                            a.importance
                        ) +
                        Number(
                            a.updatedAt
                        ) / 1e15
                    )
            );

            state.memories =
                state.memories.slice(
                    0,
                    CONFIG.maxMemories
                );

            state.memoryCount =
                state.memories.length;

        }

        await persist();

        emit(
            "memory-added",
            {
                memory
            }
        );

        return {

            ok:
                true,

            created:
                true,

            updated:
                false,

            memory

        };

    }

    async function add(
        input,
        options = {}
    ) {

        return remember(
            input,
            options
        );

    }

    async function store(
        input,
        options = {}
    ) {

        return remember(
            input,
            options
        );

    }

    async function save(
        input,
        options = {}
    ) {

        return remember(
            input,
            options
        );

    }

    async function rememberMessage(
        message,
        options = {}
    ) {

        return remember(
            {

                ...(
                    typeof message ===
                    "object"
                        ? message
                        : {
                            content:
                                message
                        }
                ),

                type:
                    options.type ||
                    "conversation"

            },
            options
        );

    }

    // --------------------------------------------------------
    // SEARCH / RECALL
    // --------------------------------------------------------

    function calculateScore(
        memory,
        query,
        options = {}
    ) {

        const normalizedQuery =
            normalizeText(
                query
            );

        if (!normalizedQuery) {

            return 0;

        }

        const content =
            normalizeText(
                memory.content
            );

        const tags =
            memory.tags
                .map(
                    tag =>
                        normalizeText(
                            tag
                        )
                );

        let score =
            0;

        /*
         * Exakter Inhalt.
         */

        if (
            content ===
            normalizedQuery
        ) {

            score +=
                1;

        }

        /*
         * Gesamte Query enthalten.
         */

        if (
            content.includes(
                normalizedQuery
            )
        ) {

            score +=
                0.7;

        }

        /*
         * Wörter vergleichen.
         */

        const words =
            normalizedQuery
                .split(
                    /\s+/
                )
                .filter(
                    word =>
                        word.length >
                        1
                );

        if (
            words.length
        ) {

            let matches =
                0;

            for (
                const word of words
            ) {

                if (
                    content.includes(
                        word
                    )
                ) {

                    matches++;

                }

                if (
                    tags.some(
                        tag =>
                            tag.includes(
                                word
                            )
                    )
                ) {

                    matches +=
                        0.5;

                }

            }

            score +=
                (
                    matches /
                    words.length
                ) *
                0.8;

        }

        /*
         * Typ bevorzugen.
         */

        if (
            options.type &&
            memory.type ===
            options.type
        ) {

            score +=
                0.4;

        }

        /*
         * Sprache bevorzugen.
         */

        if (
            options.language &&
            memory.language ===
            options.language
        ) {

            score +=
                0.15;

        }

        /*
         * Wichtigkeit.
         */

        score +=
            Math.max(
                0,
                Math.min(
                    1,
                    Number(
                        memory.importance
                    )
                )
            ) *
            0.2;

        return score;

    }

    async function recall(
        query,
        options = {}
    ) {

        if (
            !CONFIG.enabled
        ) {

            return [];

        }

        const input =
            clean(
                query
            );

        state.searchCount++;

        if (!input) {

            return [];

        }

        const limit =
            Math.min(
                Number(
                    options.limit
                ) || 10,
                CONFIG.maxSearchResults
            );

        const results =
            state.memories
                .map(
                    memory => ({

                        memory,

                        score:
                            calculateScore(
                                memory,
                                input,
                                options
                            )

                    })
                )
                .filter(
                    item =>
                        item.score >
                        (
                            Number(
                                options.threshold
                            ) ||
                            0.05
                        )
                )
                .sort(
                    (a, b) =>
                        b.score -
                        a.score
                )
                .slice(
                    0,
                    limit
                );

        for (
            const item of results
        ) {

            item.memory.accessCount++;

            item.memory.lastAccessedAt =
                now();

        }

        state.lastSearch = {

            query:
                input,

            count:
                results.length,

            timestamp:
                now()

        };

        emit(
            "memory-recalled",
            {

                query:
                    input,

                results

            }
        );

        return results.map(
            item => ({

                ...item.memory,

                score:
                    item.score

            })
        );

    }

    async function search(
        query,
        options = {}
    ) {

        return recall(
            query,
            options
        );

    }

    async function find(
        query,
        options = {}
    ) {

        return recall(
            query,
            options
        );

    }

    async function query(
        text,
        options = {}
    ) {

        return recall(
            text,
            options
        );

    }

    async function retrieve(
        text,
        options = {}
    ) {

        return recall(
            text,
            options
        );

    }

    // --------------------------------------------------------
    // SPECIALIZED MEMORY
    // --------------------------------------------------------

    async function rememberConversation(
        user,
        assistant,
        options = {}
    ) {

        return remember(
            {

                type:
                    "conversation",

                content:
                    `User: ${clean(user)}\nAssistant: ${clean(assistant)}`,

                language:
                    options.language,

                tags:
                    [
                        "conversation",
                        "chat"
                    ],

                metadata:
                    {
                        requestId:
                            options.requestId ||
                            null
                    }

            },
            options
        );

    }

    async function rememberCorrection(
        original,
        corrected,
        options = {}
    ) {

        const originalText =
            clean(
                original
            );

        const correctedText =
            clean(
                corrected
            );

        return remember(
            {

                type:
                    "correction",

                content:
                    correctedText,

                tags:
                    [
                        "correction",
                        "grammar",
                        "spelling",
                        "writing"
                    ],

                metadata:
                    {

                        original:
                            originalText,

                        corrected:
                            correctedText,

                        language:
                            options.language ||
                            "de"

                    },

                language:
                    options.language

            },
            options
        );

    }

    async function rememberWriting(
        text,
        options = {}
    ) {

        return remember(
            {

                type:
                    "writing",

                content:
                    text,

                tags:
                    [
                        "writing",
                        "formulation"
                    ],

                metadata:
                    {
                        purpose:
                            options.purpose ||
                            "general"
                    },

                language:
                    options.language

            },
            options
        );

    }

    async function rememberReading(
        text,
        options = {}
    ) {

        return remember(
            {

                type:
                    "reading",

                content:
                    text,

                tags:
                    [
                        "reading",
                        "analysis"
                    ],

                metadata:
                    {
                        source:
                            options.source ||
                            null
                    },

                language:
                    options.language

            },
            options
        );

    }

    // --------------------------------------------------------
    // GET MEMORY
    // --------------------------------------------------------

    function get(
        id
    ) {

        return (
            state.memories.find(
                memory =>
                    memory.id ===
                    id
            ) ||
            null
        );

    }

    function getAll(
        options = {}
    ) {

        let memories =
            [
                ...state.memories
            ];

        if (
            options.type
        ) {

            memories =
                memories.filter(
                    memory =>
                        memory.type ===
                        options.type
                );

        }

        if (
            options.language
        ) {

            memories =
                memories.filter(
                    memory =>
                        memory.language ===
                        options.language
                );

        }

        if (
            Number.isFinite(
                Number(
                    options.limit
                )
            )
        ) {

            memories =
                memories.slice(
                    0,
                    Number(
                        options.limit
                    )
                );

        }

        return memories;

    }

    // --------------------------------------------------------
    // REMOVE / CLEAR
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

            return {

                ok:
                    false,

                error:
                    "MEMORY_NOT_FOUND"

            };

        }

        const removed =
            state.memories.splice(
                index,
                1
            )[0];

        state.memoryCount =
            state.memories.length;

        await persist();

        emit(
            "memory-removed",
            {
                memory:
                    removed
            }
        );

        return {

            ok:
                true,

            memory:
                removed

        };

    }

    async function clear(
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

        state.memoryCount =
            state.memories.length;

        await persist();

        emit(
            "memory-cleared",
            {
                type:
                    options.type ||
                    null
            }
        );

        return {

            ok:
                true,

            count:
                state.memoryCount

        };

    }

    // --------------------------------------------------------
    // IMPORT / EXPORT
    // --------------------------------------------------------

    function exportMemory() {

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
                )

        };

    }

    async function importMemory(
        data,
        options = {}
    ) {

        if (
            !data
        ) {

            return {

                ok:
                    false,

                error:
                    "INVALID_MEMORY_DATA"

            };

        }

        const memories =
            Array.isArray(
                data
            )
                ? data
                : Array.isArray(
                    data.memories
                )
                    ? data.memories
                    : [];

        let imported =
            0;

        for (
            const item of memories
        ) {

            const memory =
                normalizeMemory(
                    item
                );

            if (!memory.content) {
                continue;
            }

            const exists =
                state.memories.some(
                    current =>
                        current.id ===
                        memory.id
                );

            if (
                exists &&
                !options.overwrite
            ) {

                continue;

            }

            const index =
                state.memories.findIndex(
                    current =>
                        current.id ===
                        memory.id
                );

            if (
                index >=
                0
            ) {

                state.memories[
                    index
                ] = memory;

            } else {

                state.memories.push(
                    memory
                );

            }

            imported++;

        }

        state.memories =
            state.memories.slice(
                -CONFIG.maxMemories
            );

        state.memoryCount =
            state.memories.length;

        await persist();

        emit(
            "memory-imported",
            {
                imported
            }
        );

        return {

            ok:
                true,

            imported,

            count:
                state.memoryCount

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

            mode:
                CONFIG.mode,

            initialized:
                state.initialized,

            ready:
                state.ready,

            enabled:
                CONFIG.enabled,

            memoryCount:
                state.memories.length,

            searchCount:
                state.searchCount,

            writeCount:
                state.writeCount,

            readCount:
                state.readCount,

            correctionCount:
                state.correctionCount,

            lastMemory:
                state.lastMemory,

            lastSearch:
                state.lastSearch,

            errors:
                state.errors.length

        };

    }

    // --------------------------------------------------------
    // ERROR
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

        try {

            const stored =
                await storageGet(
                    CONFIG.storageKey,
                    null
                );

            if (
                stored &&
                Array.isArray(
                    stored.memories
                )
            ) {

                state.memories =
                    stored.memories
                        .map(
                            memory =>
                                normalizeMemory(
                                    memory
                                )
                        )
                        .filter(
                            memory =>
                                Boolean(
                                    memory.content
                                )
                        )
                        .slice(
                            -CONFIG.maxMemories
                        );

            }

            state.memoryCount =
                state.memories.length;

        } catch (error) {

            recordError(
                error
            );

        }

        /*
         * Kernel-Verbindung.
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

        remember,

        add,

        store,

        save,

        rememberMessage,

        rememberConversation,

        rememberCorrection,

        rememberWriting,

        rememberReading,

        recall,

        search,

        find,

        query,

        retrieve,

        get,

        getAll,

        remove,

        clear,

        exportMemory,

        importMemory,

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

        } catch (error) {

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
// END OF PART 85
// ============================================================