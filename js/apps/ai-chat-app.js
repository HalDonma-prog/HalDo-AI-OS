/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   APP:
       HalDo AI Chat

   DATEI:
       js/apps/ai-chat-app.js

   VERSION:
       20.0.0

   ZWECK:
       Vollständige HalDo AI Chat Anwendung

   VERBINDUNGEN:
       - app-contract.js
       - app-base.js
       - app-manager.js
       - app-registry.js
       - app-router.js
       - window-manager.js
       - kernel.js
       - system.js
       - ai-core.js
       - ai-chat.js
       - ai-engine.js
       - ai-language.js
       - ai-memory.js
       - ai-speech.js
       - ai-voice.js
       - language-system.js
       - language-manager.js
       - storage.js
       - storage-manager.js
       - ezidi-keyboard.js

   WICHTIG:
       Diese App ist als vollständige Anwendung aufgebaut
       und nicht nur als Registry-Platzhalter.

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


    const APP_ID =
        "ai-chat";

    const APP_VERSION =
        "20.0.0";

    const APP_NAME =
        "HalDo AI Chat";


    /* ========================================================
       02 — SAFE HELPERS
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


    function safeClone(
        value
    ) {

        try {

            return JSON.parse(
                JSON.stringify(
                    value
                )
            );

        } catch (_) {

            return value;

        }

    }


    function createId(
        prefix
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


    /* ========================================================
       03 — SERVICE LOOKUPS
       ======================================================== */

    function getAppManager() {

        return (
            window.HalDoAppManager ||
            HalDoOS.appManager ||
            null
        );

    }


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


    function getAIChat() {

        return (
            window.HalDoAIChat ||
            HalDoOS.aiChat ||
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


    function getAILanguage() {

        return (
            window.HalDoAILanguage ||
            HalDoOS.aiLanguage ||
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


    function getAISpeech() {

        return (
            window.HalDoAISpeech ||
            HalDoOS.aiSpeech ||
            null
        );

    }


    function getAIVoice() {

        return (
            window.HalDoAIVoice ||
            HalDoOS.aiVoice ||
            null
        );

    }


    function getLanguageManager() {

        return (
            window.HalDoLanguageManager ||
            HalDoOS.languageManager ||
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


    function getEzidiKeyboard() {

        return (
            window.HalDoEzidiKeyboard ||
            HalDoOS.ezidiKeyboard ||
            null
        );

    }


    /* ========================================================
       04 — DEFAULT SETTINGS
       ======================================================== */

    const DEFAULT_SETTINGS = {

        language:
            "auto",

        theme:
            "system",

        sendOnEnter:
            true,

        showTimestamps:
            true,

        showStatus:
            true,

        autoScroll:
            true,

        speechEnabled:
            false,

        voiceEnabled:
            false,

        memoryEnabled:
            true,

        aiProvider:
            "haldo",

        aiModel:
            "haldo-default",

        temperature:
            0.7,

        maxHistory:
            100,

        ezidiKeyboard:
            true,

        animations:
            true

    };


    /* ========================================================
       05 — APPLICATION STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        started:
            false,

        mounted:
            false,

        destroyed:
            false,

        busy:
            false,

        currentConversationId:
            null,

        messages:
            [],

        conversations:
            [],

        searchQuery:
            "",

        settings:
            {
                ...DEFAULT_SETTINGS
            },

        elements:
            {},

        unsubscribers:
            [],

        statistics: {

            messagesSent:
                0,

            messagesReceived:
                0,

            errors:
                0,

            conversationsCreated:
                0,

            startedAt:
                null,

            lastMessageAt:
                null

        }

    };


    /* ========================================================
       06 — EVENTS
       ======================================================== */

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

            return function () {};

        }


        if (
            !listeners.has(
                event
            )
        ) {

            listeners.set(
                event,
                new Set()
            );

        }


        listeners
            .get(event)
            .add(callback);


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

        const set =
            listeners.get(
                event
            );


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
        data = null
    ) {

        const set =
            listeners.get(
                event
            );


        if (set) {

            Array.from(set)
                .forEach(
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


        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "emit"
            )
        ) {

            try {

                manager.emit(
                    APP_ID + ":" + event,
                    data
                );

            } catch (_) {}

        }

    }


    /* ========================================================
       07 — ERROR HANDLING
       ======================================================== */

    function reportError(
        exception,
        context
    ) {

        state.statistics.errors +=
            1;


        const error =
            exception instanceof Error
                ? exception
                : new Error(
                    String(
                        exception
                    )
                );


        console.error(
            "[HalDo AI Chat]",
            context,
            error
        );


        emit(
            "error",
            {

                error:
                    error,

                message:
                    error.message,

                context:
                    context,

                time:
                    Date.now()

            }
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
                    error,
                    "AI Chat: " +
                    context
                );

            } catch (_) {}

        }


        return error;

    }


    /* ========================================================
       08 — STORAGE
       ======================================================== */

    const STORAGE_KEYS = {

        settings:
            "haldo.ai-chat.settings",

        conversations:
            "haldo.ai-chat.conversations",

        active:
            "haldo.ai-chat.active"

    };


    function storageSet(
        key,
        value
    ) {

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
                    key,
                    value
                );

                return true;

            } catch (_) {}

        }


        try {

            localStorage.setItem(
                key,
                JSON.stringify(
                    value
                )
            );

            return true;

        } catch (_) {

            return false;

        }

    }


    function storageGet(
        key,
        fallback
    ) {

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

                const value =
                    storage.get(
                        key
                    );

                return value ===
                    undefined
                    ? fallback
                    : value;

            } catch (_) {}

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

        } catch (_) {

            return fallback;

        }

    }


    /* ========================================================
       09 — SETTINGS
       ======================================================== */

    function loadSettings() {

        const manager =
            getAppManager();


        let saved =
            null;


        if (
            manager &&
            hasMethod(
                manager,
                "loadAppSettings"
            )
        ) {

            saved =
                manager.loadAppSettings(
                    APP_ID
                );

        }


        if (!saved) {

            saved =
                storageGet(
                    STORAGE_KEYS.settings,
                    {}
                );

        }


        state.settings = {

            ...DEFAULT_SETTINGS,

            ...(saved || {})

        };


        return state.settings;

    }


    function saveSettings() {

        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "setSettings"
            )
        ) {

            try {

                manager.setSettings(
                    APP_ID,
                    state.settings
                );

            } catch (_) {}

        }


        storageSet(
            STORAGE_KEYS.settings,
            state.settings
        );


        emit(
            "settings-changed",
            {
                settings:
                    safeClone(
                        state.settings
                    )
            }
        );


        return true;

    }


    function getSettings() {

        return {
            ...state.settings
        };

    }


    function updateSettings(
        changes
    ) {

        state.settings = {

            ...state.settings,

            ...(changes || {})

        };


        saveSettings();


        render();


        return getSettings();

    }


    /* ========================================================
       10 — CONVERSATIONS
       ======================================================== */

    function createConversation(
        title = "Neue Unterhaltung"
    ) {

        const conversation = {

            id:
                createId(
                    "conversation"
                ),

            title:
                title,

            createdAt:
                Date.now(),

            updatedAt:
                Date.now(),

            messages:
                []

        };


        state.conversations.unshift(
            conversation
        );


        state.currentConversationId =
            conversation.id;


        state.messages =
            conversation.messages;


        state.statistics
            .conversationsCreated +=
            1;


        saveConversations();


        emit(
            "conversation-created",
            {
                conversation:
                    safeClone(
                        conversation
                    )
            }
        );


        render();


        return conversation;

    }


    function getCurrentConversation() {

        return state.conversations.find(
            conversation =>
                conversation.id ===
                state.currentConversationId
        ) || null;

    }


    function selectConversation(
        conversationId
    ) {

        const conversation =
            state.conversations.find(
                item =>
                    item.id ===
                    conversationId
            );


        if (!conversation) {

            return false;

        }


        state.currentConversationId =
            conversation.id;


        state.messages =
            conversation.messages;


        storageSet(
            STORAGE_KEYS.active,
            conversation.id
        );


        render();


        emit(
            "conversation-selected",
            {
                conversation:
                    safeClone(
                        conversation
                    )
            }
        );


        return true;

    }


    function deleteConversation(
        conversationId
    ) {

        const index =
            state.conversations.findIndex(
                item =>
                    item.id ===
                    conversationId
            );


        if (index < 0) {

            return false;

        }


        state.conversations.splice(
            index,
            1
        );


        if (
            state.currentConversationId ===
            conversationId
        ) {

            const next =
                state.conversations[0];


            if (next) {

                selectConversation(
                    next.id
                );

            } else {

                createConversation();

            }

        }


        saveConversations();


        emit(
            "conversation-deleted",
            {
                conversationId:
                    conversationId
            }
        );


        render();


        return true;

    }


    function clearCurrentConversation() {

        const conversation =
            getCurrentConversation();


        if (!conversation) {

            return false;

        }


        conversation.messages =
            [];

        conversation.updatedAt =
            Date.now();


        state.messages =
            conversation.messages;


        saveConversations();


        render();


        emit(
            "conversation-cleared",
            {
                conversationId:
                    conversation.id
            }
        );


        return true;

    }


    function saveConversations() {

        state.conversations =
            state.conversations.map(
                conversation => ({

                    ...conversation,

                    messages:
                        Array.isArray(
                            conversation.messages
                        )
                            ? conversation.messages
                            : [],

                    updatedAt:
                        Date.now()

                })
            );


        storageSet(
            STORAGE_KEYS.conversations,
            state.conversations
        );


        return true;

    }


    function loadConversations() {

        const saved =
            storageGet(
                STORAGE_KEYS.conversations,
                []
            );


        if (
            Array.isArray(
                saved
            ) &&
            saved.length
        ) {

            state.conversations =
                saved;

        }


        const active =
            storageGet(
                STORAGE_KEYS.active,
                null
            );


        if (
            active &&
            state.conversations.some(
                item =>
                    item.id ===
                    active
            )
        ) {

            selectConversation(
                active
            );

        } else if (
            state.conversations.length
        ) {

            selectConversation(
                state.conversations[0].id
            );

        } else {

            createConversation();

        }


        return state.conversations;

    }


    /* ========================================================
       11 — MESSAGES
       ======================================================== */

    function createMessage(
        role,
        content,
        extra = {}
    ) {

        return {

            id:
                createId(
                    "message"
                ),

            role:
                role,

            content:
                String(
                    content || ""
                ),

            timestamp:
                Date.now(),

            ...extra

        };

    }


    function addMessage(
        role,
        content,
        extra = {}
    ) {

        const conversation =
            getCurrentConversation();


        if (!conversation) {

            createConversation();

        }


        const current =
            getCurrentConversation();


        const message =
            createMessage(
                role,
                content,
                extra
            );


        current.messages.push(
            message
        );


        current.updatedAt =
            Date.now();


        state.messages =
            current.messages;


        if (
            state.messages.length >
            state.settings.maxHistory
        ) {

            state.messages =
                state.messages.slice(
                    -state.settings.maxHistory
                );

            current.messages =
                state.messages;

        }


        saveConversations();


        render();


        emit(
            "message-added",
            {
                message:
                    safeClone(
                        message
                    )
            }
        );


        return message;

    }


    /* ========================================================
       12 — AI CONNECTION
       ======================================================== */

    async function askAI(
        text
    ) {

        const aiChat =
            getAIChat();


        const aiCore =
            getAICore();


        const aiEngine =
            getAIEngine();


        const context = {

            message:
                text,

            messages:
                safeClone(
                    state.messages
                ),

            conversation:
                safeClone(
                    getCurrentConversation()
                ),

            settings:
                getSettings(),

            appId:
                APP_ID

        };


        /*
         * Bestehendes HalDo AI Chat-Modul
         */

        if (
            aiChat &&
            hasMethod(
                aiChat,
                "sendMessage"
            )
        ) {

            return await aiChat.sendMessage(
                text,
                context
            );

        }


        if (
            aiChat &&
            hasMethod(
                aiChat,
                "send"
            )
        ) {

            return await aiChat.send(
                text,
                context
            );

        }


        /*
         * AI Core
         */

        if (
            aiCore &&
            hasMethod(
                aiCore,
                "process"
            )
        ) {

            return await aiCore.process(
                text,
                context
            );

        }


        if (
            aiCore &&
            hasMethod(
                aiCore,
                "ask"
            )
        ) {

            return await aiCore.ask(
                text,
                context
            );

        }


        /*
         * AI Engine
         */

        if (
            aiEngine &&
            hasMethod(
                aiEngine,
                "generate"
            )
        ) {

            return await aiEngine.generate(
                text,
                context
            );

        }


        if (
            aiEngine &&
            hasMethod(
                aiEngine,
                "respond"
            )
        ) {

            return await aiEngine.respond(
                text,
                context
            );

        }


        /*
         * Noch kein echter Provider
         */

        return (
            "HalDo AI ist verbunden, aber aktuell " +
            "wurde noch kein aktiver AI-Provider " +
            "für diese Unterhaltung bereitgestellt."
        );

    }


    function normalizeAIResponse(
        response
    ) {

        if (
            response === null ||
            response === undefined
        ) {

            return "";

        }


        if (
            typeof response ===
            "string"
        ) {

            return response;

        }


        if (
            response.text
        ) {

            return String(
                response.text
            );

        }


        if (
            response.message
        ) {

            if (
                typeof response.message ===
                "string"
            ) {

                return response.message;

            }


            if (
                response.message.content
            ) {

                return String(
                    response.message.content
                );

            }

        }


        if (
            response.content
        ) {

            return String(
                response.content
            );

        }


        return JSON.stringify(
            response
        );

    }


    /* ========================================================
       13 — SEND MESSAGE
       ======================================================== */

    async function sendMessage(
        text
    ) {

        const value =
            String(
                text || ""
            ).trim();


        if (!value) {

            return null;

        }


        if (
            state.busy
        ) {

            return null;

        }


        state.busy =
            true;


        state.statistics.messagesSent +=
            1;


        state.statistics.lastMessageAt =
            Date.now();


        addMessage(
            "user",
            value
        );


        emit(
            "message-sending",
            {
                text:
                    value
            }
        );


        setStatus(
            "HalDo AI denkt …"
        );


        try {

            /*
             * AI Memory
             */

            const memory =
                getAIMemory();


            if (
                state.settings.memoryEnabled &&
                memory &&
                hasMethod(
                    memory,
                    "remember"
                )
            ) {

                try {

                    memory.remember(
                        value,
                        {
                            source:
                                APP_ID
                        }
                    );

                } catch (_) {}

            }


            const response =
                await askAI(
                    value
                );


            const answer =
                normalizeAIResponse(
                    response
                );


            const message =
                addMessage(
                    "assistant",
                    answer
                );


            state.statistics
                .messagesReceived +=
                1;


            /*
             * Sprachsystem
             */

            if (
                state.settings.speechEnabled
            ) {

                speak(
                    answer
                );

            }


            emit(
                "message-received",
                {
                    message:
                        message,

                    response:
                        response
                }
            );


            setStatus(
                "Bereit"
            );


            return message;

        } catch (exception) {

            reportError(
                exception,
                "AI Nachricht senden"
            );


            const message =
                addMessage(
                    "system",
                    "Beim Verarbeiten deiner Nachricht ist ein Fehler aufgetreten."
                );


            setStatus(
                "Fehler"
            );


            return message;

        } finally {

            state.busy =
                false;


            updateSendButton();

        }

    }


    /* ========================================================
       14 — SPEECH
       ======================================================== */

    async function speak(
        text
    ) {

        const speech =
            getAISpeech();


        const voice =
            getAIVoice();


        try {

            if (
                speech &&
                hasMethod(
                    speech,
                    "speak"
                )
            ) {

                return await speech.speak(
                    text
                );

            }


            if (
                voice &&
                hasMethod(
                    voice,
                    "speak"
                )
            ) {

                return await voice.speak(
                    text
                );

            }


            if (
                "speechSynthesis" in
                window
            ) {

                const utterance =
                    new SpeechSynthesisUtterance(
                        text
                    );


                speechSynthesis.speak(
                    utterance
                );


                return true;

            }

        } catch (exception) {

            reportError(
                exception,
                "Sprachausgabe"
            );

        }


        return false;

    }


    /* ========================================================
       15 — LANGUAGE
       ======================================================== */

    function getCurrentLanguage() {

        const languageManager =
            getLanguageManager();


        if (
            languageManager &&
            hasMethod(
                languageManager,
                "getCurrentLanguage"
            )
        ) {

            try {

                return languageManager
                    .getCurrentLanguage();

            } catch (_) {}

        }


        const aiLanguage =
            getAILanguage();


        if (
            aiLanguage &&
            hasMethod(
                aiLanguage,
                "getCurrentLanguage"
            )
        ) {

            try {

                return aiLanguage
                    .getCurrentLanguage();

            } catch (_) {}

        }


        return (
            state.settings.language ===
            "auto"
                ? "de"
                : state.settings.language
        );

    }


    function translate(
        key,
        fallback
    ) {

        const manager =
            getLanguageManager();


        if (
            manager &&
            hasMethod(
                manager,
                "translate"
            )
        ) {

            try {

                return manager.translate(
                    key
                );

            } catch (_) {}

        }


        return fallback ||
            key;

    }


    /* ========================================================
       16 — DOM CREATION
       ======================================================== */

    function createRoot() {

        const existing =
            document.querySelector(
                '[data-haldo-app="ai-chat"]'
            );


        if (existing) {

            return existing;

        }


        const root =
            document.createElement(
                "section"
            );


        root.className =
            "haldo-ai-chat-app";


        root.dataset.haldoApp =
            APP_ID;


        root.innerHTML = `

            <div class="haldo-ai-chat">

                <header class="haldo-ai-chat__header">

                    <div class="haldo-ai-chat__identity">

                        <div class="haldo-ai-chat__icon">
                            ✦
                        </div>

                        <div>

                            <h1>
                                HalDo AI
                            </h1>

                            <span
                                data-ai-chat-status
                            >
                                Bereit
                            </span>

                        </div>

                    </div>


                    <div class="haldo-ai-chat__actions">

                        <button
                            type="button"
                            data-action="new-chat"
                            title="Neue Unterhaltung"
                        >
                            ＋
                        </button>

                        <button
                            type="button"
                            data-action="clear-chat"
                            title="Chat leeren"
                        >
                            🗑
                        </button>

                        <button
                            type="button"
                            data-action="settings"
                            title="Einstellungen"
                        >
                            ⚙
                        </button>

                    </div>

                </header>


                <div class="haldo-ai-chat__body">


                    <aside
                        class="haldo-ai-chat__sidebar"
                        data-chat-sidebar
                    >

                        <div class="haldo-ai-chat__sidebar-header">

                            <strong>
                                Unterhaltungen
                            </strong>

                        </div>


                        <div
                            class="haldo-ai-chat__conversations"
                            data-conversations
                        ></div>

                    </aside>


                    <main
                        class="haldo-ai-chat__main"
                    >

                        <div
                            class="haldo-ai-chat__messages"
                            data-messages
                        ></div>


                        <div
                            class="haldo-ai-chat__typing"
                            data-typing
                            hidden
                        >
                            HalDo AI schreibt …
                        </div>


                        <form
                            class="haldo-ai-chat__composer"
                            data-composer
                        >

                            <button
                                type="button"
                                data-action="keyboard"
                                title="Tastatur"
                            >
                                ⌨
                            </button>


                            <textarea
                                data-input
                                rows="1"
                                placeholder="Schreibe HalDo AI …"
                                autocomplete="off"
                            ></textarea>


                            <button
                                type="submit"
                                data-send
                                title="Senden"
                            >
                                ➤
                            </button>

                        </form>


                        <div
                            class="haldo-ai-chat__footer"
                        >

                            <span>
                                HalDo AI OS 20
                            </span>

                            <span
                                data-ai-chat-language
                            >
                                Sprache: automatisch
                            </span>

                        </div>

                    </main>

                </div>

            </div>

        `;


        document.body.appendChild(
            root
        );


        return root;

    }


    /* ========================================================
       17 — DOM REFERENCES
       ======================================================== */

    function cacheElements() {

        const root =
            state.elements.root;


        if (!root) {

            return;

        }


        state.elements = {

            ...state.elements,

            root,

            messages:
                root.querySelector(
                    "[data-messages]"
                ),

            conversations:
                root.querySelector(
                    "[data-conversations]"
                ),

            input:
                root.querySelector(
                    "[data-input]"
                ),

            composer:
                root.querySelector(
                    "[data-composer]"
                ),

            send:
                root.querySelector(
                    "[data-send]"
                ),

            status:
                root.querySelector(
                    "[data-ai-chat-status]"
                ),

            typing:
                root.querySelector(
                    "[data-typing]"
                ),

            language:
                root.querySelector(
                    "[data-ai-chat-language]"
                )

        };

    }


    /* ========================================================
       18 — MESSAGE RENDERING
       ======================================================== */

    function escapeHTML(
        value
    ) {

        return String(
            value || ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

    }


    function formatMessage(
        content
    ) {

        return escapeHTML(
            content
        )
        .replace(
            /\n/g,
            "<br>"
        );

    }


    function renderMessages() {

        const container =
            state.elements.messages;


        if (!container) {

            return;

        }


        if (
            !state.messages.length
        ) {

            container.innerHTML = `

                <div class="haldo-ai-chat__welcome">

                    <div class="haldo-ai-chat__welcome-logo">
                        ✦
                    </div>

                    <h2>
                        ${escapeHTML(
                            translate(
                                "ai.chat.welcome",
                                "Willkommen bei HalDo AI"
                            )
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            translate(
                                "ai.chat.description",
                                "Wie kann ich dir helfen?"
                            )
                        )}
                    </p>

                </div>

            `;


            return;

        }


        container.innerHTML =
            state.messages
                .map(
                    message => {

                        const time =
                            new Date(
                                message.timestamp
                            )
                            .toLocaleTimeString(
                                [],
                                {
                                    hour:
                                        "2-digit",

                                    minute:
                                        "2-digit"
                                }
                            );


                        return `

                            <article
                                class="
                                    haldo-ai-chat__message
                                    haldo-ai-chat__message--${escapeHTML(
                                        message.role
                                    )}
                                "
                                data-message-id="${escapeHTML(
                                    message.id
                                )}"
                            >

                                <div
                                    class="haldo-ai-chat__message-role"
                                >
                                    ${
                                        message.role ===
                                        "user"
                                            ? "Du"
                                            : message.role ===
                                              "assistant"
                                                ? "HalDo AI"
                                                : "System"
                                    }
                                </div>


                                <div
                                    class="haldo-ai-chat__message-content"
                                >
                                    ${formatMessage(
                                        message.content
                                    )}
                                </div>


                                ${
                                    state.settings
                                        .showTimestamps
                                        ? `
                                            <time>
                                                ${time}
                                            </time>
                                        `
                                        : ""
                                }

                            </article>

                        `;

                    }
                )
                .join("");


        if (
            state.settings.autoScroll
        ) {

            container.scrollTop =
                container.scrollHeight;

        }

    }


    /* ========================================================
       19 — CONVERSATION RENDERING
       ======================================================== */

    function renderConversations() {

        const container =
            state.elements.conversations;


        if (!container) {

            return;

        }


        container.innerHTML =
            state.conversations
                .map(
                    conversation => {

                        const active =
                            conversation.id ===
                            state.currentConversationId;


                        return `

                            <button
                                type="button"
                                class="
                                    haldo-ai-chat__conversation
                                    ${
                                        active
                                            ? "is-active"
                                            : ""
                                    }
                                "
                                data-conversation-id="${escapeHTML(
                                    conversation.id
                                )}"
                            >

                                <span>
                                    ${escapeHTML(
                                        conversation.title
                                    )}
                                </span>

                                <small>
                                    ${
                                        conversation.messages
                                            ? conversation.messages.length
                                            : 0
                                    }
                                </small>

                            </button>

                        `;

                    }
                )
                .join("");

    }


    /* ========================================================
       20 — STATUS
       ======================================================== */

    function setStatus(
        text
    ) {

        if (
            state.elements.status
        ) {

            state.elements.status.textContent =
                text;

        }

    }


    function updateSendButton() {

        if (
            state.elements.send
        ) {

            state.elements.send.disabled =
                state.busy;

        }

    }


    /* ========================================================
       21 — RENDER
       ======================================================== */

    function render() {

        cacheElements();

        renderMessages();

        renderConversations();

        updateSendButton();


        if (
            state.elements.language
        ) {

            state.elements.language.textContent =
                "Sprache: " +
                getCurrentLanguage();

        }

    }


    /* ========================================================
       22 — EVENT BINDING
       ======================================================== */

    function bindDOMEvents() {

        const root =
            state.elements.root;


        if (!root) {

            return;

        }


        const newChat =
            root.querySelector(
                '[data-action="new-chat"]'
            );


        const clearChat =
            root.querySelector(
                '[data-action="clear-chat"]'
            );


        const settings =
            root.querySelector(
                '[data-action="settings"]'
            );


        const keyboard =
            root.querySelector(
                '[data-action="keyboard"]'
            );


        if (newChat) {

            newChat.addEventListener(
                "click",
                function () {

                    createConversation();

                }
            );

        }


        if (clearChat) {

            clearChat.addEventListener(
                "click",
                function () {

                    clearCurrentConversation();

                }
            );

        }


        if (settings) {

            settings.addEventListener(
                "click",
                function () {

                    emit(
                        "settings-requested"
                    );

                }
            );

        }


        if (keyboard) {

            keyboard.addEventListener(
                "click",
                function () {

                    const keyboardSystem =
                        getEzidiKeyboard();


                    if (
                        keyboardSystem &&
                        hasMethod(
                            keyboardSystem,
                            "open"
                        )
                    ) {

                        keyboardSystem.open();

                    } else {

                        emit(
                            "keyboard-requested"
                        );

                    }

                }
            );

        }


        if (
            state.elements.composer
        ) {

            state.elements.composer
                .addEventListener(
                    "submit",
                    function (event) {

                        event.preventDefault();


                        if (
                            state.elements.input
                        ) {

                            const value =
                                state.elements.input
                                    .value;


                            state.elements.input
                                .value =
                                "";


                            sendMessage(
                                value
                            );

                        }

                    }
                );

        }


        if (
            state.elements.input
        ) {

            state.elements.input
                .addEventListener(
                    "keydown",
                    function (event) {

                        if (
                            event.key !==
                            "Enter"
                        ) {

                            return;

                        }


                        if (
                            event.shiftKey
                        ) {

                            return;

                        }


                        if (
                            !state.settings
                                .sendOnEnter
                        ) {

                            return;

                        }


                        event.preventDefault();


                        if (
                            state.elements.composer
                        ) {

                            state.elements.composer
                                .requestSubmit();

                        }

                    }
                );

        }


        if (
            state.elements.conversations
        ) {

            state.elements.conversations
                .addEventListener(
                    "click",
                    function (event) {

                        const button =
                            event.target.closest(
                                "[data-conversation-id]"
                            );


                        if (!button) {

                            return;

                        }


                        selectConversation(
                            button.dataset
                                .conversationId
                        );

                    }
                );

        }

    }


    /* ========================================================
       23 — CSS
       ======================================================== */

    function injectStyles() {

        const styleId =
            "haldo-ai-chat-app-style";


        if (
            document.getElementById(
                styleId
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            styleId;


        style.textContent = `

            .haldo-ai-chat-app {
                width: 100%;
                height: 100%;
                min-height: 100%;
                box-sizing: border-box;
                font-family:
                    Inter,
                    system-ui,
                    -apple-system,
                    BlinkMacSystemFont,
                    sans-serif;
            }


            .haldo-ai-chat {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                min-height: 560px;
                overflow: hidden;
                background:
                    rgba(10, 14, 24, .96);
                color: #ffffff;
            }


            .haldo-ai-chat__header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 14px 18px;
                border-bottom:
                    1px solid rgba(255,255,255,.1);
                background:
                    rgba(255,255,255,.035);
            }


            .haldo-ai-chat__identity {
                display: flex;
                align-items: center;
                gap: 12px;
            }


            .haldo-ai-chat__icon {
                width: 42px;
                height: 42px;
                display: grid;
                place-items: center;
                border-radius: 50%;
                background:
                    radial-gradient(
                        circle,
                        rgba(255,255,255,.3),
                        rgba(70,110,255,.15)
                    );
                box-shadow:
                    0 0 24px
                    rgba(100,140,255,.35);
                font-size: 22px;
            }


            .haldo-ai-chat__identity h1 {
                margin: 0;
                font-size: 17px;
            }


            .haldo-ai-chat__identity span {
                display: block;
                margin-top: 3px;
                opacity: .65;
                font-size: 12px;
            }


            .haldo-ai-chat__actions {
                display: flex;
                gap: 6px;
            }


            .haldo-ai-chat button {
                border: 0;
                cursor: pointer;
                color: inherit;
                background:
                    rgba(255,255,255,.07);
                border-radius: 9px;
            }


            .haldo-ai-chat__actions button {
                width: 36px;
                height: 36px;
            }


            .haldo-ai-chat button:hover {
                background:
                    rgba(255,255,255,.14);
            }


            .haldo-ai-chat__body {
                flex: 1;
                min-height: 0;
                display: flex;
            }


            .haldo-ai-chat__sidebar {
                width: 230px;
                flex: 0 0 230px;
                border-right:
                    1px solid rgba(255,255,255,.08);
                overflow: auto;
                background:
                    rgba(0,0,0,.12);
            }


            .haldo-ai-chat__sidebar-header {
                padding: 15px;
                font-size: 13px;
                opacity: .8;
            }


            .haldo-ai-chat__conversations {
                display: flex;
                flex-direction: column;
                gap: 4px;
                padding: 8px;
            }


            .haldo-ai-chat__conversation {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 10px;
                text-align: left;
            }


            .haldo-ai-chat__conversation span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }


            .haldo-ai-chat__conversation small {
                opacity: .55;
            }


            .haldo-ai-chat__conversation.is-active {
                background:
                    rgba(100,140,255,.2);
            }


            .haldo-ai-chat__main {
                flex: 1;
                min-width: 0;
                min-height: 0;
                display: flex;
                flex-direction: column;
            }


            .haldo-ai-chat__messages {
                flex: 1;
                min-height: 0;
                overflow: auto;
                padding: 22px;
            }


            .haldo-ai-chat__message {
                max-width: 820px;
                margin: 0 auto 14px;
                padding: 13px 15px;
                border-radius: 15px;
                background:
                    rgba(255,255,255,.055);
                border:
                    1px solid rgba(255,255,255,.06);
            }


            .haldo-ai-chat__message--user {
                background:
                    rgba(90,125,255,.16);
            }


            .haldo-ai-chat__message-role {
                margin-bottom: 6px;
                font-size: 11px;
                font-weight: 700;
                opacity: .65;
            }


            .haldo-ai-chat__message-content {
                line-height: 1.55;
                white-space: normal;
                overflow-wrap: anywhere;
            }


            .haldo-ai-chat__message time {
                display: block;
                margin-top: 7px;
                font-size: 10px;
                opacity: .4;
            }


            .haldo-ai-chat__welcome {
                height: 100%;
                display: grid;
                place-content: center;
                justify-items: center;
                text-align: center;
                opacity: .82;
            }


            .haldo-ai-chat__welcome-logo {
                width: 70px;
                height: 70px;
                display: grid;
                place-items: center;
                border-radius: 50%;
                font-size: 36px;
                box-shadow:
                    0 0 35px
                    rgba(100,140,255,.3);
            }


            .haldo-ai-chat__welcome h2 {
                margin: 18px 0 6px;
            }


            .haldo-ai-chat__welcome p {
                margin: 0;
                opacity: .6;
            }


            .haldo-ai-chat__typing {
                padding:
                    0 22px 8px;
                font-size: 12px;
                opacity: .6;
            }


            .haldo-ai-chat__composer {
                display: flex;
                align-items: flex-end;
                gap: 8px;
                padding: 12px;
                border-top:
                    1px solid rgba(255,255,255,.08);
            }


            .haldo-ai-chat__composer textarea {
                flex: 1;
                resize: none;
                min-height: 42px;
                max-height: 180px;
                box-sizing: border-box;
                padding: 11px 13px;
                border:
                    1px solid rgba(255,255,255,.1);
                border-radius: 12px;
                outline: none;
                background:
                    rgba(255,255,255,.055);
                color: #ffffff;
                font: inherit;
            }


            .haldo-ai-chat__composer textarea:focus {
                border-color:
                    rgba(120,150,255,.65);
            }


            .haldo-ai-chat__composer > button {
                width: 42px;
                height: 42px;
                flex: 0 0 42px;
            }


            .haldo-ai-chat__composer [data-send] {
                font-size: 18px;
            }


            .haldo-ai-chat__composer [data-send]:disabled {
                opacity: .4;
                cursor: wait;
            }


            .haldo-ai-chat__footer {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                padding:
                    5px 14px 8px;
                font-size: 10px;
                opacity: .4;
            }


            @media (max-width: 700px) {

                .haldo-ai-chat__sidebar {
                    display: none;
                }

                .haldo-ai-chat__messages {
                    padding: 12px;
                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* ========================================================
       24 — APP MOUNT
       ======================================================== */

    function mount() {

        if (
            state.mounted
        ) {

            return state.elements.root;

        }


        injectStyles();


        const root =
            createRoot();


        state.elements.root =
            root;


        cacheElements();

        bindDOMEvents();

        render();


        state.mounted =
            true;


        emit(
            "mounted",
            {
                element:
                    root
            }
        );


        return root;

    }


    /* ========================================================
       25 — APP INIT
       ======================================================== */

    async function init(
        context = {}
    ) {

        if (
            state.initialized
        ) {

            return api;

        }


        try {

            loadSettings();

            loadConversations();

            state.initialized =
                true;


            emit(
                "initialized",
                {
                    appId:
                        APP_ID,

                    context:
                        context
                }
            );


            return api;

        } catch (exception) {

            reportError(
                exception,
                "App Init"
            );


            throw exception;

        }

    }


    /* ========================================================
       26 — APP START
       ======================================================== */

    async function start(
        context = {}
    ) {

        if (
            state.started
        ) {

            return api;

        }


        try {

            mount();


            state.statistics.startedAt =
                Date.now();


            state.started =
                true;

            state.destroyed =
                false;


            setStatus(
                "Bereit"
            );


            emit(
                "started",
                {
                    appId:
                        APP_ID,

                    context:
                        context
                }
            );


            return api;

        } catch (exception) {

            reportError(
                exception,
                "App Start"
            );


            throw exception;

        }

    }


    /* ========================================================
       27 — APP STOP
       ======================================================== */

    async function stop(
        context = {}
    ) {

        if (
            !state.started
        ) {

            return true;

        }


        try {

            state.started =
                false;


            emit(
                "stopped",
                {
                    appId:
                        APP_ID,

                    context:
                        context
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Stop"
            );


            return false;

        }

    }


    /* ========================================================
       28 — APP CLOSE
       ======================================================== */

    async function close(
        context = {}
    ) {

        try {

            await stop(
                context
            );


            emit(
                "closed",
                {
                    appId:
                        APP_ID,

                    context:
                        context
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Close"
            );


            return false;

        }

    }


    /* ========================================================
       29 — DESTROY
       ======================================================== */

    function destroy() {

        state.unsubscribers
            .forEach(
                unsubscribe => {

                    try {

                        unsubscribe();

                    } catch (_) {}

                }
            );


        state.unsubscribers =
            [];


        if (
            state.elements.root &&
            state.elements.root.parentNode
        ) {

            state.elements.root.parentNode
                .removeChild(
                    state.elements.root
                );

        }


        state.elements =
            {};

        state.mounted =
            false;

        state.destroyed =
            true;

        state.started =
            false;


        emit(
            "destroyed"
        );


        return true;

    }


    /* ========================================================
       30 — APP DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        return {

            id:
                APP_ID,

            name:
                APP_NAME,

            version:
                APP_VERSION,

            initialized:
                state.initialized,

            started:
                state.started,

            mounted:
                state.mounted,

            destroyed:
                state.destroyed,

            busy:
                state.busy,

            language:
                getCurrentLanguage(),

            conversationId:
                state.currentConversationId,

            conversationCount:
                state.conversations.length,

            messageCount:
                state.messages.length,

            statistics:
                {
                    ...state.statistics
                },

            services: {

                appManager:
                    !!getAppManager(),

                kernel:
                    !!getKernel(),

                system:
                    !!getSystem(),

                aiChat:
                    !!getAIChat(),

                aiCore:
                    !!getAICore(),

                aiEngine:
                    !!getAIEngine(),

                aiLanguage:
                    !!getAILanguage(),

                aiMemory:
                    !!getAIMemory(),

                aiSpeech:
                    !!getAISpeech(),

                aiVoice:
                    !!getAIVoice(),

                languageManager:
                    !!getLanguageManager(),

                storage:
                    !!getStorage(),

                ezidiKeyboard:
                    !!getEzidiKeyboard()

            },

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       31 — APP CONTRACT
       ======================================================== */

    const definition = {

        id:
            APP_ID,

        name:
            APP_NAME,

        title:
            "HalDo AI Chat",

        version:
            APP_VERSION,

        type:
            "application",

        category:
            "ai",

        icon:
            "✦",

        description:
            "Zentrale KI-Unterhaltung und Kommunikation innerhalb von HalDo AI OS.",

        route:
            "/ai-chat",

        singleton:
            true,

        enabled:
            true,

        searchable:
            true,

        tags: [

            "ai",

            "chat",

            "assistant",

            "conversation",

            "language",

            "voice",

            "memory"

        ],

        keywords: [

            "HalDo AI",

            "KI",

            "Chat",

            "Assistant",

            "AI",

            "Conversation"

        ],

        dependencies: [],


        permissions: [

            "storage",

            "ai",

            "language",

            "voice"

        ],


        settings:
            DEFAULT_SETTINGS,


        init:
            init,

        start:
            start,

        stop:
            stop,

        close:
            close,

        destroy:
            destroy,


        onActivate:
            async function () {

                emit(
                    "activated"
                );

            },


        onDeactivate:
            async function () {

                emit(
                    "deactivated"
                );

            },


        minimize:
            async function () {

                emit(
                    "minimized"
                );

            },


        restore:
            async function () {

                emit(
                    "restored"
                );

            },


        getState:
            function () {

                return {

                    initialized:
                        state.initialized,

                    started:
                        state.started,

                    mounted:
                        state.mounted,

                    busy:
                        state.busy,

                    conversationId:
                        state.currentConversationId,

                    messageCount:
                        state.messages.length

                };

            },


        getSettings:
            getSettings,

        updateSettings:
            updateSettings,


        createConversation:
            createConversation,

        getCurrentConversation:
            getCurrentConversation,

        selectConversation:
            selectConversation,

        deleteConversation:
            deleteConversation,

        clearCurrentConversation:
            clearCurrentConversation,


        sendMessage:
            sendMessage,

        addMessage:
            addMessage,

        speak:
            speak,


        on:
            on,

        off:
            off,

        emit:
            emit,


        diagnostics:
            diagnostics

    };


    /* ========================================================
       32 — APP CONTRACT REGISTRATION
       ======================================================== */

    function registerApplication() {

        const manager =
            getAppManager();


        /*
         * App Manager
         */

        if (
            manager &&
            hasMethod(
                manager,
                "registerApp"
            )
        ) {

            try {

                manager.registerApp(
                    definition
                );


                return true;

            } catch (exception) {

                reportError(
                    exception,
                    "App Manager Registrierung"
                );

            }

        }


        /*
         * App Registry
         */

        const registry =
            window.HalDoAppRegistry ||
            HalDoOS.appRegistry ||
            null;


        if (
            registry &&
            hasMethod(
                registry,
                "register"
            )
        ) {

            try {

                registry.register(
                    definition
                );


                return true;

            } catch (exception) {

                reportError(
                    exception,
                    "App Registry Registrierung"
                );

            }

        }


        return false;

    }


    /* ========================================================
       33 — PUBLIC EXPORT
       ======================================================== */

    const api = {

        ...definition,

        app:
            definition,

        state,

        diagnostics,

        mount,

        render,

        getSettings,

        updateSettings,

        createConversation,

        getCurrentConversation,

        selectConversation,

        deleteConversation,

        clearCurrentConversation,

        sendMessage,

        addMessage,

        speak,

        on,

        off,

        emit

    };


    /* ========================================================
       34 — GLOBAL EXPORTS
       ======================================================== */

    window.HalDoAIChatApp =
        api;


    HalDoOS.aiChatApp =
        api;


    HalDoOS.apps =
        HalDoOS.apps ||
        {};


    HalDoOS.apps[APP_ID] =
        api;


    /* ========================================================
       35 — REGISTRATION
       ======================================================== */

    function boot() {

        registerApplication();


        /*
         * Die App wird registriert,
         * aber nicht ungefragt geöffnet.
         *
         * Das Öffnen übernimmt später
         * Launcher / Router / App Manager.
         */

        console.log(
            "[HalDo AI Chat] App registriert.",
            APP_VERSION
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
       END
       HALDO AI CHAT APP
       ======================================================== */

})(window, document);