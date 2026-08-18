/* ============================================================
   HALDO AI OS 20
   HALDO AI CORE
   ------------------------------------------------------------
   Datei:
       /js/ai-core.js

   Version:
       20.2.0

   ZENTRALE HALDO-AI-RUNTIME

   VERBINDET:

   Kernel
   System
   App Manager
   App Registry
   App Router
   Window Manager
   Storage
   Language
   Voice
   Speech
   Notifications
   Conversation State
   AI Chat
   AI Commands
   AI Memory

   Unterstützt:

   - natürliche Unterhaltung
   - Gesprächskontext
   - Session Memory
   - persistentes Memory über Storage
   - App öffnen
   - App schließen
   - App aktivieren
   - App minimieren
   - App wiederherstellen
   - App suchen
   - Systeminformationen
   - Events
   - Sprachsystem
   - Voice
   - Speech
   - Fehlerbehandlung
   - Command Routing
   - Runtime Context
   - Mobile/Desktop Runtime
   - Erweiterbarkeit

   HALDO AI OS 20
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
        "20.2.0";

    const MODULE_ID =
        "ai-core";

    const NAME =
        "HalDo AI Core 20";


    /* ========================================================
       03 — SERVICE ACCESS
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


    function getAppManager() {

        return (
            window.HalDoAppManager ||
            window.HalDoOSAppManager ||
            HalDoOS.appManager ||
            null
        );
    }


    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            HalDoOS.appRegistry ||
            null
        );
    }


    function getRouter() {

        return (
            window.HalDoAppRouter ||
            HalDoOS.appRouter ||
            null
        );
    }


    function getWindowManager() {

        return (
            window.HalDoWindowManager ||
            HalDoOS.windowManager ||
            null
        );
    }


    function getStorage() {

        return (
            window.HalDoStorage ||
            HalDoOS.storage ||
            null
        );
    }


    function getLanguage() {

        return (
            window.HalDoLanguageManager ||
            HalDoOS.languageManager ||
            window.HalDoLanguage ||
            HalDoOS.language ||
            null
        );
    }


    function getVoice() {

        return (
            window.HalDoVoice ||
            HalDoOS.voice ||
            null
        );
    }


    function getSpeech() {

        return (
            window.HalDoSpeech ||
            HalDoOS.speech ||
            null
        );
    }


    function getNotifications() {

        return (
            window.HalDoNotifications ||
            HalDoOS.notifications ||
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


    function getAIChat() {

        return (
            window.HalDoAIChat ||
            HalDoOS.aiChat ||
            null
        );
    }


    function getAICommands() {

        return (
            window.HalDoAICommands ||
            HalDoOS.aiCommands ||
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
       04 — HELPERS
       ======================================================== */

    function normalizeId(value) {

        return String(value || "")
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


    function clone(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return value;
        }

        if (
            typeof structuredClone ===
            "function"
        ) {

            try {
                return structuredClone(value);
            } catch (_) {}
        }

        if (Array.isArray(value)) {

            return value.map(
                item => clone(item)
            );
        }

        if (
            typeof value ===
            "object"
        ) {

            const result = {};

            Object.keys(value)
                .forEach(key => {

                    result[key] =
                        clone(value[key]);

                });

            return result;
        }

        return value;
    }


    function safeAsync(
        result
    ) {

        if (
            result &&
            typeof result.then ===
            "function"
        ) {

            return result;
        }

        return Promise.resolve(
            result
        );
    }


    function now() {

        return Date.now();
    }


    function createId(
        prefix
    ) {

        return (
            prefix +
            "-" +
            now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 9)
        );
    }


    /* ========================================================
       05 — STATE
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
            createId("haldo-session"),

        startedAt:
            now(),

        language:
            "de",

        conversation:
            [],

        maxConversation:
            100,

        memory:
            [],

        maxMemory:
            500,

        activeApp:
            null,

        processing:
            false,

        lastUserMessage:
            "",

        lastResponse:
            "",

        lastCommand:
            null,

        listeners:
            new Map(),

        connections: {

            kernel:
                false,

            system:
                false,

            appManager:
                false,

            registry:
                false,

            router:
                false,

            windowManager:
                false,

            storage:
                false,

            language:
                false,

            voice:
                false,

            speech:
                false,

            notifications:
                false,

            conversationState:
                false,

            aiChat:
                false,

            aiCommands:
                false,

            aiMemory:
                false

        },

        statistics: {

            messages:
                0,

            responses:
                0,

            commands:
                0,

            appsOpened:
                0,

            appsClosed:
                0,

            errors:
                0,

            memoryWrites:
                0

        }

    };


    /* ========================================================
       06 — LOGGING
       ======================================================== */

    function log() {

        try {

            console.log(
                "[HalDo AI Core 20]",
                ...arguments
            );

        } catch (_) {}
    }


    function warn() {

        try {

            console.warn(
                "[HalDo AI Core 20]",
                ...arguments
            );

        } catch (_) {}
    }


    function errorLog() {

        try {

            console.error(
                "[HalDo AI Core 20]",
                ...arguments
            );

        } catch (_) {}
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
            !state.listeners.has(event)
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

        if (!listeners.size) {

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
                            "AI Event: " +
                            event
                        );
                    }

                }
            );
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
                    "ai:" + event,
                    data
                );

            } catch (_) {}
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
                    "ai:" + event,
                    data
                );

            } catch (_) {}
        }


        try {

            window.dispatchEvent(
                new CustomEvent(
                    "haldo:ai:" + event,
                    {
                        detail:
                            data
                    }
                )
            );

        } catch (_) {}
    }


    /* ========================================================
       08 — ERROR HANDLING
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
                    String(exception)
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
                "HalDo AI",

            time:
                new Date()
                    .toISOString()

        };

        errorLog(
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
                    context ||
                    "HalDo AI"
                );

            } catch (_) {}
        }

        return record;
    }


    /* ========================================================
       09 — CONVERSATION
       ======================================================== */

    function addConversation(
        role,
        content,
        metadata = {}
    ) {

        const message = {

            id:
                createId(
                    "message"
                ),

            role:
                role,

            content:
                String(
                    content ||
                    ""
                ),

            metadata:
                clone(metadata),

            timestamp:
                new Date()
                    .toISOString()

        };

        state.conversation.push(
            message
        );

        while (
            state.conversation.length >
            state.maxConversation
        ) {

            state.conversation.shift();
        }

        emit(
            "conversation-updated",
            {
                message,
                conversation:
                    clone(
                        state.conversation
                    )
            }
        );

        return message;
    }


    function getConversation() {

        return clone(
            state.conversation
        );
    }


    function clearConversation() {

        state.conversation = [];

        emit(
            "conversation-cleared"
        );

        persistConversation();

        return true;
    }


    function getConversationContext(
        limit = 20
    ) {

        return state.conversation
            .slice(
                -Math.max(
                    1,
                    limit
                )
            )
            .map(
                message => ({
                    role:
                        message.role,

                    content:
                        message.content
                })
            );
    }


    /* ========================================================
       10 — PERSISTENCE
       ======================================================== */

    const STORAGE_KEYS = {

        conversation:
            "haldo.os20.ai.conversation",

        memory:
            "haldo.os20.ai.memory",

        language:
            "haldo.os20.ai.language"

    };


    async function storageSet(
        key,
        value
    ) {

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

                return await safeAsync(
                    storage.set(
                        key,
                        value
                    )
                );
            }

            if (
                window.localStorage
            ) {

                window.localStorage.setItem(
                    key,
                    JSON.stringify(
                        value
                    )
                );

                return true;
            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "AI Storage Set"
            );
        }

        return false;
    }


    async function storageGet(
        key,
        fallback
    ) {

        const storage =
            getStorage();

        try {

            if (
                storage &&
                hasMethod(
                    storage,
                    "get"
                )
            ) {

                const result =
                    await safeAsync(
                        storage.get(
                            key
                        )
                    );

                return (
                    result ===
                    undefined
                )
                    ? fallback
                    : result;
            }

            if (
                window.localStorage
            ) {

                const raw =
                    window.localStorage
                        .getItem(key);

                if (!raw) {
                    return fallback;
                }

                return JSON.parse(
                    raw
                );
            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "AI Storage Get"
            );
        }

        return fallback;
    }


    async function persistConversation() {

        await storageSet(
            STORAGE_KEYS.conversation,
            state.conversation
        );
    }


    async function loadConversation() {

        const result =
            await storageGet(
                STORAGE_KEYS.conversation,
                []
            );

        if (
            Array.isArray(result)
        ) {

            state.conversation =
                result.slice(
                    -state.maxConversation
                );
        }

        emit(
            "conversation-loaded",
            {
                count:
                    state.conversation.length
            }
        );

        return getConversation();
    }


    /* ========================================================
       11 — MEMORY
       ======================================================== */

    async function remember(
        key,
        value,
        metadata = {}
    ) {

        const record = {

            id:
                createId(
                    "memory"
                ),

            key:
                String(key || "")
                    .trim(),

            value:
                clone(value),

            metadata:
                clone(metadata),

            timestamp:
                new Date()
                    .toISOString()

        };

        if (!record.key) {
            return false;
        }

        const existing =
            state.memory.findIndex(
                item =>
                    item.key ===
                    record.key
            );

        if (
            existing >= 0
        ) {

            state.memory[
                existing
            ] = record;

        } else {

            state.memory.push(
                record
            );
        }

        while (
            state.memory.length >
            state.maxMemory
        ) {

            state.memory.shift();
        }

        state.statistics.memoryWrites +=
            1;

        emit(
            "memory-written",
            record
        );

        await storageSet(
            STORAGE_KEYS.memory,
            state.memory
        );

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

                await safeAsync(
                    memory.remember(
                        record.key,
                        record.value,
                        record.metadata
                    )
                );

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "AI Memory"
                );
            }
        }

        return true;
    }


    async function loadMemory() {

        const result =
            await storageGet(
                STORAGE_KEYS.memory,
                []
            );

        if (
            Array.isArray(result)
        ) {

            state.memory =
                result.slice(
                    -state.maxMemory
                );
        }

        const memory =
            getAIMemory();

        if (
            memory &&
            hasMethod(
                memory,
                "getAll"
            )
        ) {

            try {

                const external =
                    await safeAsync(
                        memory.getAll()
                    );

                if (
                    Array.isArray(
                        external
                    )
                ) {

                    state.memory =
                        external;
                }

            } catch (_) {}
        }

        return clone(
            state.memory
        );
    }


    function recall(
        key
    ) {

        const value =
            String(
                key || ""
            )
            .trim()
            .toLowerCase();

        if (!value) {
            return null;
        }

        const found =
            state.memory.find(
                item =>
                    String(
                        item.key || ""
                    )
                    .toLowerCase() ===
                    value
            );

        return found
            ? clone(found)
            : null;
    }


    function getMemory() {

        return clone(
            state.memory
        );
    }


    async function forget(
        key
    ) {

        const value =
            String(
                key || ""
            )
            .trim()
            .toLowerCase();

        const before =
            state.memory.length;

        state.memory =
            state.memory.filter(
                item =>
                    String(
                        item.key || ""
                    )
                    .toLowerCase() !==
                    value
            );

        if (
            before !==
            state.memory.length
        ) {

            await storageSet(
                STORAGE_KEYS.memory,
                state.memory
            );

            emit(
                "memory-forgotten",
                {
                    key
                }
            );

            return true;
        }

        return false;
    }


    /* ========================================================
       12 — LANGUAGE
       ======================================================== */

    async function loadLanguage() {

        const language =
            getLanguage();

        try {

            if (
                language &&
                hasMethod(
                    language,
                    "getCurrentLanguage"
                )
            ) {

                const result =
                    await safeAsync(
                        language
                            .getCurrentLanguage()
                    );

                if (result) {

                    state.language =
                        String(result);
                }
            }

        } catch (_) {}


        if (
            !state.language
        ) {

            const saved =
                await storageGet(
                    STORAGE_KEYS.language,
                    "de"
                );

            state.language =
                String(
                    saved || "de"
                );
        }

        return state.language;
    }


    async function setLanguage(
        language
    ) {

        const value =
            String(
                language || ""
            )
            .trim()
            .toLowerCase();

        if (!value) {
            return false;
        }

        state.language =
            value;

        await storageSet(
            STORAGE_KEYS.language,
            value
        );

        const manager =
            getLanguage();

        if (
            manager &&
            hasMethod(
                manager,
                "setLanguage"
            )
        ) {

            try {

                await safeAsync(
                    manager.setLanguage(
                        value
                    )
                );

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "AI Language"
                );
            }
        }

        emit(
            "language-changed",
            {
                language:
                    value
            }
        );

        return true;
    }


    /* ========================================================
       13 — APP OPERATIONS
       ======================================================== */

    async function openApp(
        appId,
        options = {}
    ) {

        const manager =
            getAppManager();

        if (!manager) {

            return {

                success:
                    false,

                error:
                    "App Manager ist nicht verbunden."

            };
        }

        try {

            let result;

            if (
                hasMethod(
                    manager,
                    "openApp"
                )
            ) {

                result =
                    await safeAsync(
                        manager.openApp(
                            appId,
                            options
                        )
                    );

            } else if (
                hasMethod(
                    manager,
                    "open"
                )
            ) {

                result =
                    await safeAsync(
                        manager.open(
                            appId,
                            options
                        )
                    );

            } else {

                return {

                    success:
                        false,

                    error:
                        "App Manager besitzt keine Open-Funktion."

                };
            }

            if (result) {

                state.statistics.appsOpened +=
                    1;

                state.activeApp =
                    normalizeId(
                        appId
                    );

                emit(
                    "app-opened",
                    {
                        appId:
                            normalizeId(
                                appId
                            ),

                        result
                    }
                );

                return {

                    success:
                        true,

                    result
                };
            }

            return {

                success:
                    false,

                error:
                    "App konnte nicht geöffnet werden."

            };

        } catch (
            exception
        ) {

            reportError(
                exception,
                "AI App Open"
            );

            return {

                success:
                    false,

                error:
                    exception.message

            };
        }
    }


    async function closeApp(
        appId
    ) {

        const manager =
            getAppManager();

        if (!manager) {

            return {

                success:
                    false,

                error:
                    "App Manager ist nicht verbunden."

            };
        }

        try {

            const result =
                hasMethod(
                    manager,
                    "closeApp"
                )
                    ? await safeAsync(
                        manager.closeApp(
                            appId
                        )
                    )
                    : await safeAsync(
                        manager.close(
                            appId
                        )
                    );

            if (result) {

                state.statistics.appsClosed +=
                    1;

                emit(
                    "app-closed",
                    {
                        appId:
                            normalizeId(
                                appId
                            )
                    }
                );
            }

            return {

                success:
                    !!result,

                result

            };

        } catch (
            exception
        ) {

            reportError(
                exception,
                "AI App Close"
            );

            return {

                success:
                    false,

                error:
                    exception.message

            };
        }
    }


    async function activateApp(
        appId
    ) {

        const manager =
            getAppManager();

        if (!manager) {
            return false;
        }

        try {

            if (
                hasMethod(
                    manager,
                    "activateApp"
                )
            ) {

                return !!(
                    await safeAsync(
                        manager.activateApp(
                            appId
                        )
                    )
                );
            }

            if (
                hasMethod(
                    manager,
                    "activate"
                )
            ) {

                return !!(
                    await safeAsync(
                        manager.activate(
                            appId
                        )
                    )
                );
            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "AI App Activate"
            );
        }

        return false;
    }


    function searchApps(
        query
    ) {

        const manager =
            getAppManager();

        if (
            manager &&
            hasMethod(
                manager,
                "search"
            )
        ) {

            try {

                return manager.search(
                    query
                ) || [];

            } catch (_) {}
        }

        const registry =
            getRegistry();

        if (
            registry &&
            hasMethod(
                registry,
                "search"
            )
        ) {

            try {

                return registry.search(
                    query
                ) || [];

            } catch (_) {}
        }

        return [];
    }


    function getApps() {

        const manager =
            getAppManager();

        if (
            manager &&
            hasMethod(
                manager,
                "getAll"
            )
        ) {

            try {

                return manager.getAll()
                    || [];

            } catch (_) {}
        }

        return [];
    }


    /* ========================================================
       14 — COMMAND DETECTION
       ======================================================== */

    function cleanCommandText(
        text
    ) {

        return String(
            text || ""
        )
        .trim()
        .replace(
            /\s+/g,
            " "
        );
    }


    function detectCommand(
        text
    ) {

        const value =
            cleanCommandText(
                text
            )
            .toLowerCase();

        if (!value) {
            return null;
        }


        /*
         * OPEN
         */

        const openPatterns = [

            /^öffne\s+(.+)$/i,

            /^öffnen\s+(.+)$/i,

            /^starte\s+(.+)$/i,

            /^start\s+(.+)$/i,

            /^open\s+(.+)$/i,

            /^launch\s+(.+)$/i,

            /^zeige\s+(.+)$/i

        ];

        for (
            const pattern of
            openPatterns
        ) {

            const match =
                value.match(
                    pattern
                );

            if (match) {

                return {

                    type:
                        "open-app",

                    target:
                        cleanCommandText(
                            match[1]
                        )

                };
            }
        }


        /*
         * CLOSE
         */

        const closePatterns = [

            /^schließe\s+(.+)$/i,

            /^schli[eß]e\s+(.+)$/i,

            /^beende\s+(.+)$/i,

            /^close\s+(.+)$/i,

            /^stoppe\s+(.+)$/i

        ];

        for (
            const pattern of
            closePatterns
        ) {

            const match =
                value.match(
                    pattern
                );

            if (match) {

                return {

                    type:
                        "close-app",

                    target:
                        cleanCommandText(
                            match[1]
                        )

                };
            }
        }


        /*
         * SEARCH
         */

        const searchPatterns = [

            /^suche\s+nach\s+(.+)$/i,

            /^suche\s+(.+)$/i,

            /^search\s+(.+)$/i

        ];

        for (
            const pattern of
            searchPatterns
        ) {

            const match =
                value.match(
                    pattern
                );

            if (match) {

                return {

                    type:
                        "search-app",

                    target:
                        cleanCommandText(
                            match[1]
                        )

                };
            }
        }


        /*
         * MINIMIZE
         */

        if (
            value ===
                "minimiere die app" ||
            value ===
                "minimieren" ||
            value ===
                "minimize"
        ) {

            return {

                type:
                    "minimize-active"

            };
        }


        /*
         * RESTORE
         */

        if (
            value ===
                "wiederherstellen" ||
            value ===
                "stelle die app wieder her" ||
            value ===
                "restore"
        ) {

            return {

                type:
                    "restore-active"

            };
        }


        /*
         * SYSTEM
         */

        if (
            value.includes(
                "systemstatus"
            ) ||
            value.includes(
                "system status"
            )
        ) {

            return {

                type:
                    "system-status"

            };
        }


        /*
         * HELP
         */

        if (
            value ===
                "hilfe" ||
            value ===
                "help" ||
            value.includes(
                "was kannst du"
            ) ||
            value.includes(
                "was kannst du machen"
            )
        ) {

            return {

                type:
                    "help"

            };
        }


        return null;
    }


    /* ========================================================
       15 — COMMAND EXECUTION
       ======================================================== */

    async function executeCommand(
        command
    ) {

        if (!command) {
            return null;
        }

        state.lastCommand =
            clone(command);

        state.statistics.commands +=
            1;

        emit(
            "command-started",
            command
        );


        try {

            switch (
                command.type
            ) {


                case "open-app": {

                    const apps =
                        searchApps(
                            command.target
                        );

                    const exact =
                        apps.find(
                            app =>
                                normalizeId(
                                    app.id
                                ) ===
                                normalizeId(
                                    command.target
                                )
                        );

                    const selected =
                        exact ||
                        apps[0];

                    if (!selected) {

                        return {

                            handled:
                                true,

                            success:
                                false,

                            message:
                                "Ich konnte die App „" +
                                command.target +
                                "“ nicht finden."

                        };
                    }

                    const result =
                        await openApp(
                            selected.id
                        );

                    return {

                        handled:
                            true,

                        success:
                            result.success,

                        app:
                            selected,

                        message:
                            result.success
                                ? (
                                    "Ich öffne " +
                                    (
                                        selected.title ||
                                        selected.name ||
                                        selected.id
                                    ) +
                                    " für dich."
                                )
                                :
                                "Die App konnte nicht geöffnet werden."

                    };
                }


                case "close-app": {

                    const apps =
                        searchApps(
                            command.target
                        );

                    const selected =
                        apps[0];

                    if (!selected) {

                        return {

                            handled:
                                true,

                            success:
                                false,

                            message:
                                "Ich konnte die App nicht finden."

                        };
                    }

                    const result =
                        await closeApp(
                            selected.id
                        );

                    return {

                        handled:
                            true,

                        success:
                            result.success,

                        message:
                            result.success
                                ? "Ich habe die App geschlossen."
                                : "Die App konnte nicht geschlossen werden."

                    };
                }


                case "search-app": {

                    const results =
                        searchApps(
                            command.target
                        );

                    return {

                        handled:
                            true,

                        success:
                            true,

                        results,

                        message:
                            results.length
                                ? (
                                    "Ich habe " +
                                    results.length +
                                    " passende App(s) gefunden."
                                )
                                :
                                "Ich habe keine passende App gefunden."

                    };
                }


                case "system-status": {

                    const system =
                        getSystem();

                    let status =
                        null;

                    if (
                        system &&
                        hasMethod(
                            system,
                            "getStatus"
                        )
                    ) {

                        status =
                            await safeAsync(
                                system.getStatus()
                            );
                    }

                    return {

                        handled:
                            true,

                        success:
                            true,

                        status,

                        message:
                            "Ich prüfe den aktuellen HalDo-Systemstatus."

                    };
                }


                case "help": {

                    return {

                        handled:
                            true,

                        success:
                            true,

                        message:
                            "Ich kann mit dir sprechen, Apps suchen und öffnen, Apps schließen, Systeminformationen abrufen und – sobald die jeweilige App verbunden ist – ihre vorgesehenen Funktionen ausführen."

                    };
                }


                case "minimize-active": {

                    const manager =
                        getAppManager();

                    const active =
                        manager &&
                        hasMethod(
                            manager,
                            "getActiveAppId"
                        )
                            ? manager.getActiveAppId()
                            : null;

                    if (
                        active &&
                        hasMethod(
                            manager,
                            "minimize"
                        )
                    ) {

                        await safeAsync(
                            manager.minimize(
                                active
                            )
                        );

                        return {

                            handled:
                                true,

                            success:
                                true,

                            message:
                                "Ich habe die aktive App minimiert."

                        };
                    }

                    return {

                        handled:
                            true,

                        success:
                            false,

                        message:
                            "Momentan ist keine aktive App zum Minimieren vorhanden."

                    };
                }


                case "restore-active": {

                    const manager =
                        getAppManager();

                    const active =
                        manager &&
                        hasMethod(
                            manager,
                            "getActiveAppId"
                        )
                            ? manager.getActiveAppId()
                            : null;

                    if (
                        active &&
                        hasMethod(
                            manager,
                            "restore"
                        )
                    ) {

                        await safeAsync(
                            manager.restore(
                                active
                            )
                        );

                        return {

                            handled:
                                true,

                            success:
                                true,

                            message:
                                "Ich habe die aktive App wiederhergestellt."

                        };
                    }

                    return {

                        handled:
                            true,

                        success:
                            false,

                        message:
                            "Es gibt momentan keine aktive App zum Wiederherstellen."

                    };
                }


                default:

                    return {

                        handled:
                            false

                    };
            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "AI Command Execution"
            );

            return {

                handled:
                    true,

                success:
                    false,

                error:
                    exception.message

            };

        } finally {

            emit(
                "command-finished",
                command
            );
        }
    }


    /* ========================================================
       16 — NATURAL RESPONSE
       ======================================================== */

    function localResponse(
        text
    ) {

        const value =
            String(
                text || ""
            )
            .trim()
            .toLowerCase();


        if (!value) {

            return "Ich bin hier. Erzähl mir, was du machen möchtest.";
        }


        if (
            /^(hallo|hi|hey|guten morgen|guten tag|guten abend)\b/
                .test(value)
        ) {

            return "Hallo. 💙 Ich bin HalDo AI. Ich bin bereit, mit dir zu sprechen und dein HalDo AI OS zu bedienen.";
        }


        if (
            value.includes(
                "wie geht es dir"
            ) ||
            value.includes(
                "wie geht's dir"
            )
        ) {

            return "Danke, dass du fragst. Ich bin bereit und konzentriere mich auf deine Anfrage.";
        }


        if (
            value.includes(
                "wer bist du"
            )
        ) {

            return "Ich bin HalDo AI – die KI-Schnittstelle deines HalDo AI OS. Ich kann Gespräche führen und über die verbundenen Systemdienste mit deinen Apps und dem Betriebssystem arbeiten.";
        }


        if (
            value.includes(
                "danke"
            )
        ) {

            return "Sehr gerne. 💙";
        }


        if (
            value.includes(
                "was machst du"
            )
        ) {

            return "Ich kann mit dir sprechen, deinen Gesprächskontext nutzen und über die verbundenen HalDo-Dienste Apps und Systemfunktionen ansteuern.";
        }


        return null;
    }


    /* ========================================================
       17 — MAIN CHAT
       ======================================================== */

    async function chat(
        input,
        options = {}
    ) {

        const text =
            cleanCommandText(
                input
            );

        if (!text) {

            return {

                success:
                    false,

                message:
                    "Ich habe keine Nachricht erhalten."

            };
        }


        if (
            state.processing &&
            options.allowConcurrent !==
            true
        ) {

            return {

                success:
                    false,

                busy:
                    true,

                message:
                    "Ich bearbeite gerade deine vorherige Anfrage."

            };
        }


        state.processing =
            true;

        state.lastUserMessage =
            text;

        state.statistics.messages +=
            1;


        const userMessage =
            addConversation(
                "user",
                text
            );


        emit(
            "message-received",
            userMessage
        );


        try {

            /*
             * 1 — externe AI Command Engine
             */

            const commands =
                getAICommands();

            if (
                commands &&
                hasMethod(
                    commands,
                    "parse"
                )
            ) {

                try {

                    const parsed =
                        await safeAsync(
                            commands.parse(
                                text,
                                {
                                    language:
                                        state.language,

                                    conversation:
                                        getConversationContext()
                                }
                            )
                        );

                    if (parsed) {

                        const commandResult =
                            await executeCommand(
                                parsed
                            );

                        if (
                            commandResult &&
                            commandResult.handled
                        ) {

                            const responseText =
                                commandResult.message ||
                                (
                                    commandResult.success
                                        ? "Erledigt."
                                        : "Das konnte ich leider nicht ausführen."
                                );

                            return await finalizeResponse(
                                responseText,
                                {
                                    type:
                                        "command",

                                    command:
                                        parsed,

                                    result:
                                        commandResult
                                }
                            );
                        }
                    }

                } catch (
                    exception
                ) {

                    reportError(
                        exception,
                        "AI Commands"
                    );
                }
            }


            /*
             * 2 — lokale Command-Erkennung
             */

            const command =
                detectCommand(
                    text
                );

            if (command) {

                const result =
                    await executeCommand(
                        command
                    );

                if (
                    result &&
                    result.handled
                ) {

                    return await finalizeResponse(
                        result.message ||
                        "Erledigt.",
                        {
                            type:
                                "command",

                            command,

                            result
                        }
                    );
                }
            }


            /*
             * 3 — vorhandene AI Chat Engine
             */

            const aiChat =
                getAIChat();

            if (
                aiChat &&
                hasMethod(
                    aiChat,
                    "chat"
                )
            ) {

                try {

                    const result =
                        await safeAsync(
                            aiChat.chat(
                                text,
                                {
                                    language:
                                        state.language,

                                    conversation:
                                        getConversationContext(),

                                    memory:
                                        getMemory(),

                                    sessionId:
                                        state.sessionId,

                                    options
                                }
                            )
                        );

                    const response =
                        normalizeAIResult(
                            result
                        );

                    if (response) {

                        return await finalizeResponse(
                            response,
                            {
                                type:
                                    "ai-chat",

                                source:
                                    "ai-chat"
                            }
                        );
                    }

                } catch (
                    exception
                ) {

                    reportError(
                        exception,
                        "AI Chat Engine"
                    );
                }
            }


            /*
             * 4 — lokale Antwort
             */

            const local =
                localResponse(
                    text
                );

            if (local) {

                return await finalizeResponse(
                    local,
                    {
                        type:
                            "local"
                    }
                );
            }


            /*
             * 5 — sichere Fallback-Antwort
             */

            return await finalizeResponse(
                "Ich habe deine Nachricht verstanden. Für diese Anfrage ist momentan noch keine passende HalDo-Funktion verbunden.",
                {
                    type:
                        "fallback"
                }
            );

        } catch (
            exception
        ) {

            reportError(
                exception,
                "HalDo AI Chat"
            );

            return await finalizeResponse(
                "Entschuldigung, dabei ist ein Fehler aufgetreten. Ich habe ihn erkannt und an das HalDo-System weitergegeben.",
                {
                    type:
                        "error"
                }
            );

        } finally {

            state.processing =
                false;
        }
    }


    function normalizeAIResult(
        result
    ) {

        if (
            result === null ||
            result === undefined
        ) {

            return null;
        }


        if (
            typeof result ===
            "string"
        ) {

            return result.trim() ||
                null;
        }


        if (
            typeof result ===
            "object"
        ) {

            const candidates = [

                result.message,

                result.response,

                result.text,

                result.content,

                result.answer

            ];

            for (
                const candidate of
                candidates
            ) {

                if (
                    typeof candidate ===
                    "string" &&
                    candidate.trim()
                ) {

                    return candidate.trim();
                }
            }
        }

        return null;
    }


    async function finalizeResponse(
        text,
        metadata = {}
    ) {

        const responseText =
            String(
                text ||
                "Ich bin hier."
            ).trim();


        const assistantMessage =
            addConversation(
                "assistant",
                responseText,
                metadata
            );

        state.lastResponse =
            responseText;

        state.statistics.responses +=
            1;


        await persistConversation();


        emit(
            "response",
            {
                message:
                    assistantMessage,

                text:
                    responseText,

                metadata:
                    clone(metadata)
            }
        );


        /*
         * Optional Voice Output
         */

        if (
            metadata.speak === true
        ) {

            await speak(
                responseText
            );
        }


        return {

            success:
                true,

            text:
                responseText,

            message:
                assistantMessage,

            metadata:
                clone(metadata)

        };
    }


    /* ========================================================
       18 — SPEECH / VOICE
       ======================================================== */

    async function speak(
        text,
        options = {}
    ) {

        const value =
            String(
                text || ""
            ).trim();

        if (!value) {
            return false;
        }


        const voice =
            getVoice();

        if (
            voice &&
            hasMethod(
                voice,
                "speak"
            )
        ) {

            try {

                await safeAsync(
                    voice.speak(
                        value,
                        options
                    )
                );

                emit(
                    "speech-started",
                    {
                        text:
                            value
                    }
                );

                return true;

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "HalDo Voice"
                );
            }
        }


        const speech =
            getSpeech();

        if (
            speech &&
            hasMethod(
                speech,
                "speak"
            )
        ) {

            try {

                await safeAsync(
                    speech.speak(
                        value,
                        options
                    )
                );

                return true;

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "HalDo Speech"
                );
            }
        }


        /*
         * Browser fallback
         */

        if (
            "speechSynthesis" in
            window
        ) {

            try {

                window.speechSynthesis.cancel();

                const utterance =
                    new SpeechSynthesisUtterance(
                        value
                    );

                utterance.lang =
                    options.lang ||
                    state.language ||
                    "de-DE";

                if (
                    typeof options.rate ===
                    "number"
                ) {

                    utterance.rate =
                        options.rate;
                }

                if (
                    typeof options.pitch ===
                    "number"
                ) {

                    utterance.pitch =
                        options.pitch;
                }

                window.speechSynthesis
                    .speak(
                        utterance
                    );

                return true;

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "Browser Speech"
                );
            }
        }

        return false;
    }


    function stopSpeaking() {

        const voice =
            getVoice();

        if (
            voice &&
            hasMethod(
                voice,
                "stop"
            )
        ) {

            try {

                voice.stop();

            } catch (_) {}
        }


        if (
            "speechSynthesis" in
            window
        ) {

            try {

                window.speechSynthesis
                    .cancel();

            } catch (_) {}
        }

        emit(
            "speech-stopped"
        );

        return true;
    }


    /* ========================================================
       19 — SYSTEM CONTEXT
       ======================================================== */

    function getSystemContext() {

        const manager =
            getAppManager();

        let activeApp =
            null;

        let apps = [];

        if (
            manager &&
            hasMethod(
                manager,
                "getActiveApp"
            )
        ) {

            try {

                activeApp =
                    manager.getActiveApp();

            } catch (_) {}
        }

        if (
            manager &&
            hasMethod(
                manager,
                "getAll"
            )
        ) {

            try {

                apps =
                    manager.getAll() ||
                    [];

            } catch (_) {}
        }

        return {

            version:
                VERSION,

            language:
                state.language,

            sessionId:
                state.sessionId,

            activeApp,

            appCount:
                apps.length,

            apps:
                apps.map(
                    app => ({

                        id:
                            app.id,

                        name:
                            app.name,

                        title:
                            app.title,

                        category:
                            app.category,

                        enabled:
                            app.enabled !==
                            false

                    })
                ),

            connections:
                getConnectionStatus()

        };
    }


    /* ========================================================
       20 — CONNECTIONS
       ======================================================== */

    function refreshConnections() {

        state.connections.kernel =
            !!getKernel();

        state.connections.system =
            !!getSystem();

        state.connections.appManager =
            !!getAppManager();

        state.connections.registry =
            !!getRegistry();

        state.connections.router =
            !!getRouter();

        state.connections.windowManager =
            !!getWindowManager();

        state.connections.storage =
            !!getStorage();

        state.connections.language =
            !!getLanguage();

        state.connections.voice =
            !!getVoice();

        state.connections.speech =
            !!getSpeech();

        state.connections.notifications =
            !!getNotifications();

        state.connections.conversationState =
            !!getConversationState();

        state.connections.aiChat =
            !!getAIChat();

        state.connections.aiCommands =
            !!getAICommands();

        state.connections.aiMemory =
            !!getAIMemory();

        return {
            ...state.connections
        };
    }


    function getConnectionStatus() {

        return {
            ...refreshConnections()
        };
    }


    /* ========================================================
       21 — NOTIFICATIONS
       ======================================================== */

    function notify(
        title,
        message,
        options = {}
    ) {

        const notifications =
            getNotifications();

        if (
            notifications &&
            hasMethod(
                notifications,
                "show"
            )
        ) {

            try {

                return notifications.show(
                    {
                        title,
                        message,
                        ...options
                    }
                );

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "AI Notification"
                );
            }
        }


        emit(
            "notification",
            {
                title,
                message,
                options
            }
        );

        return true;
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

            initializing:
                state.initializing,

            ready:
                state.ready,

            failed:
                state.failed,

            processing:
                state.processing,

            language:
                state.language,

            sessionId:
                state.sessionId,

            conversationMessages:
                state.conversation.length,

            memoryEntries:
                state.memory.length,

            activeApp:
                state.activeApp,

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


    function healthCheck() {

        refreshConnections();

        const problems = [];


        if (
            !state.connections.appManager
        ) {

            problems.push(
                "App Manager nicht verbunden."
            );
        }


        if (
            !state.connections.storage
        ) {

            problems.push(
                "Storage nicht verbunden."
            );
        }


        return {

            healthy:
                problems.length ===
                0,

            problems,

            connections:
                {
                    ...state.connections
                },

            timestamp:
                new Date()
                    .toISOString()

        };
    }


    /* ========================================================
       23 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


        /* State */

        getState() {

            return {

                initialized:
                    state.initialized,

                initializing:
                    state.initializing,

                ready:
                    state.ready,

                failed:
                    state.failed,

                processing:
                    state.processing,

                language:
                    state.language,

                sessionId:
                    state.sessionId,

                activeApp:
                    state.activeApp,

                messages:
                    state.conversation.length,

                memory:
                    state.memory.length,

                connections:
                    getConnectionStatus()

            };
        },


        /* Events */

        on,

        off,

        emit,


        /* Conversation */

        chat,

        ask:
            chat,

        sendMessage:
            chat,

        getConversation,

        getConversationContext,

        clearConversation,


        /* Memory */

        remember,

        recall,

        forget,

        getMemory,

        loadMemory,


        /* Language */

        getLanguage,

        loadLanguage,

        setLanguage,


        /* Apps */

        openApp,

        closeApp,

        activateApp,

        searchApps,

        getApps,


        /* Commands */

        detectCommand,

        executeCommand,


        /* Voice */

        speak,

        stopSpeaking,


        /* Notifications */

        notify,


        /* Context */

        getSystemContext,


        /* Diagnostics */

        diagnostics,

        healthCheck,


        /* Connections */

        refreshConnections,

        getConnectionStatus,


        /* Persistence */

        loadConversation,

        persistConversation

    };


    /* ========================================================
       24 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAI =
        api;

    window.HalDoAICore =
        api;

    window.HalDoOSAI =
        api;

    HalDoOS.ai =
        api;

    HalDoOS.aiCore =
        api;


    /* ========================================================
       25 — KERNEL CONNECTION
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

        } catch (
            exception
        ) {

            reportError(
                exception,
                "AI Kernel Connection"
            );

            return false;
        }
    }


    /* ========================================================
       26 — SYSTEM EVENT CONNECTION
       ======================================================== */

    function connectSystemEvents() {

        const kernel =
            getKernel();

        if (
            kernel &&
            hasMethod(
                kernel,
                "on"
            )
        ) {

            try {

                kernel.on(
                    "app-manager:app-opened",
                    payload => {

                        if (
                            payload &&
                            payload.app
                        ) {

                            state.activeApp =
                                normalizeId(
                                    payload.app.id
                                );
                        }

                        emit(
                            "system-app-opened",
                            payload
                        );

                    }
                );

                kernel.on(
                    "app-manager:app-closed",
                    payload => {

                        emit(
                            "system-app-closed",
                            payload
                        );

                    }
                );

                return true;

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "AI System Events"
                );
            }
        }

        return false;
    }


    /* ========================================================
       27 — INITIALIZATION
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

            connectSystemEvents();

            await loadLanguage();

            await loadConversation();

            await loadMemory();


            state.ready =
                true;

            state.initializing =
                false;


            const kernel =
                getKernel();

            if (
                kernel &&
                hasMethod(
                    kernel,
                    "setModuleReady"
                )
            ) {

                try {

                    kernel.setModuleReady(
                        MODULE_ID,
                        true
                    );

                } catch (_) {}
            }


            const payload = {

                version:
                    VERSION,

                language:
                    state.language,

                diagnostics:
                    diagnostics()

            };


            emit(
                "ready",
                payload
            );


            try {

                window.dispatchEvent(
                    new CustomEvent(
                        "haldo:ai-ready",
                        {
                            detail:
                                payload
                        }
                    )
                );

            } catch (_) {}


            log(
                "HalDo AI Core bereit.",
                VERSION
            );


            return api;

        } catch (
            exception
        ) {

            state.initializing =
                false;

            state.failed =
                true;

            reportError(
                exception,
                "HalDo AI Initialisierung"
            );

            return api;
        }
    }


    /* ========================================================
       28 — BOOT
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
                        "HalDo AI Boot"
                    );

                }
            );
    }


    /* ========================================================
       29 — DOM START
       ======================================================== */

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
       30 — FINAL EXPORT
       ======================================================== */

    HalDoOS.ai =
        api;

    HalDoOS.aiCore =
        api;

    window.HalDoAI =
        api;

    window.HalDoAICore =
        api;

    window.HalDoOSAI =
        api;


    /* ========================================================
       END
       HALDO AI OS 20
       AI CORE 20.2
       ======================================================== */

})(window, document);
