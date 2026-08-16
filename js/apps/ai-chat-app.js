/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE
   ------------------------------------------------------------
   Datei:
       js/apps/ai-chat-app.js

   APP:
       HalDo AI Chat

   ARCHITEKTUR:
       App Contract
       App Base
       App Manager
       Kernel
       System
       Router
       Window Manager
       Storage
       AI Core
       AI Engine
       AI Chat
       AI Language
       AI Memory
       AI Speech
       AI Voice
       Language Manager
       Language System
       Ezidi Keyboard

   FUNKTIONEN:
       - vollständige Chat-Oberfläche
       - Nachrichten
       - Verlauf
       - Konversationen
       - neue Unterhaltung
       - löschen
       - suchen
       - kopieren
       - senden
       - Enter / Shift+Enter
       - Sprachbutton
       - Mikrofon-Anbindung
       - AI-Anbindung
       - Memory-Anbindung
       - Sprache
       - Einstellungen
       - Theme
       - App-Zustand
       - Persistenz
       - Events
       - Fehlerbehandlung
       - Diagnostics
       - Accessibility
       - Erweiterbare Architektur

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
       02 — APP META
       ======================================================== */

    const APP_ID =
        "ai-chat";

    const APP_VERSION =
        "20.0.0";

    const APP_NAME =
        "HalDo AI Chat";

    const APP_TITLE =
        "HalDo AI";

    const APP_CATEGORY =
        "ai";

    const APP_ROUTE =
        "/ai-chat";


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
            HalDoOS.aiLanguage ||
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


    function getLanguageSystem() {

        return (
            window.HalDoLanguageSystem ||
            HalDoOS.languageSystem ||
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
       04 — SAFE HELPERS
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


    function safeString(
        value
    ) {

        return String(
            value === undefined ||
            value === null
                ? ""
                : value
        );

    }


    function createId(
        prefix
    ) {

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


    function escapeHTML(
        value
    ) {

        return safeString(
            value
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


    function clone(
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


    /* ========================================================
       05 — APP STATE
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

        recording:
            false,

        currentConversationId:
            null,

        conversations:
            [],

        messages:
            [],

        searchQuery:
            "",

        language:
            "de",

        theme:
            "system",

        settings:
            {

                enterToSend:
                    true,

                sound:
                    true,

                voiceReplies:
                    false,

                saveHistory:
                    true,

                memory:
                    true,

                autoScroll:
                    true,

                showTimestamps:
                    true,

                compactMode:
                    false

            },

        statistics:
            {

                messagesSent:
                    0,

                messagesReceived:
                    0,

                conversationsCreated:
                    0,

                errors:
                    0,

                startedAt:
                    null

            },

        elements:
            {},

        listeners:
            [],

        speechRecognition:
            null

    };


    /* ========================================================
       06 — STORAGE
       ======================================================== */

    const STORAGE_PREFIX =
        "haldo.ai-chat.";

    const STORAGE_KEYS = {

        conversations:
            STORAGE_PREFIX +
            "conversations",

        settings:
            STORAGE_PREFIX +
            "settings",

        language:
            STORAGE_PREFIX +
            "language",

        currentConversation:
            STORAGE_PREFIX +
            "current-conversation"

    };


    function saveJSON(
        key,
        value
    ) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(
                    value
                )
            );

            return true;

        } catch (exception) {

            reportError(
                exception,
                "Storage speichern"
            );

            return false;

        }

    }


    function loadJSON(
        key,
        fallback
    ) {

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

        } catch (exception) {

            reportError(
                exception,
                "Storage laden"
            );

            return fallback;

        }

    }


    function saveState() {

        if (
            !state.settings.saveHistory
        ) {

            return;

        }

        saveJSON(
            STORAGE_KEYS.conversations,
            state.conversations
        );

        saveJSON(
            STORAGE_KEYS.settings,
            state.settings
        );

        try {

            localStorage.setItem(
                STORAGE_KEYS.language,
                state.language
            );

            if (
                state.currentConversationId
            ) {

                localStorage.setItem(
                    STORAGE_KEYS.currentConversation,
                    state.currentConversationId
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "Chat State speichern"
            );

        }

    }


    function loadState() {

        state.conversations =
            loadJSON(
                STORAGE_KEYS.conversations,
                []
            );


        const storedSettings =
            loadJSON(
                STORAGE_KEYS.settings,
                {}
            );


        state.settings = {

            ...state.settings,

            ...(storedSettings || {})

        };


        try {

            state.language =
                localStorage.getItem(
                    STORAGE_KEYS.language
                ) ||
                state.language;


            state.currentConversationId =
                localStorage.getItem(
                    STORAGE_KEYS.currentConversation
                ) ||
                null;

        } catch (_) {}


        if (
            !Array.isArray(
                state.conversations
            )
        ) {

            state.conversations =
                [];

        }

    }


    /* ========================================================
       07 — EVENTS
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

            Array.from(
                set
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
                            "Event " + event
                        );

                    }

                }
            );

        }


        const appManager =
            getAppManager();


        if (
            appManager &&
            hasMethod(
                appManager,
                "emit"
            )
        ) {

            try {

                appManager.emit(
                    "ai-chat:" + event,
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
        context
    ) {

        state.statistics.errors +=
            1;


        const error =
            exception instanceof Error
                ? exception
                : new Error(
                    safeString(
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

                context:
                    context,

                message:
                    error.message,

                stack:
                    error.stack || "",

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
       09 — TRANSLATIONS
       ======================================================== */

    const translations = {

        de: {

            title:
                "HalDo AI",

            newChat:
                "Neue Unterhaltung",

            placeholder:
                "Schreibe HalDo AI etwas...",

            send:
                "Senden",

            search:
                "Unterhaltungen suchen",

            settings:
                "Einstellungen",

            clear:
                "Löschen",

            copy:
                "Kopieren",

            microphone:
                "Mikrofon",

            stop:
                "Stoppen",

            welcome:
                "Hallo! Ich bin HalDo AI. Wie kann ich dir helfen?",

            thinking:
                "HalDo AI denkt nach...",

            empty:
                "Noch keine Unterhaltung.",

            saved:
                "Gespeichert",

            error:
                "Es ist ein Fehler aufgetreten."

        },

        en: {

            title:
                "HalDo AI",

            newChat:
                "New conversation",

            placeholder:
                "Write something to HalDo AI...",

            send:
                "Send",

            search:
                "Search conversations",

            settings:
                "Settings",

            clear:
                "Delete",

            copy:
                "Copy",

            microphone:
                "Microphone",

            stop:
                "Stop",

            welcome:
                "Hello! I am HalDo AI. How can I help you?",

            thinking:
                "HalDo AI is thinking...",

            empty:
                "No conversation yet.",

            saved:
                "Saved",

            error:
                "An error occurred."

        },

        ku: {

            title:
                "HalDo AI",

            newChat:
                "Daniştina nû",

            placeholder:
                "Ji HalDo AI re binivîse...",

            send:
                "Şandin",

            search:
                "Lêgerîna danûstendinan",

            settings:
                "Mîheng",

            clear:
                "Jêbirin",

            copy:
                "Kopîkirin",

            microphone:
                "Mîkrofon",

            stop:
                "Rawestandin",

            welcome:
                "Silav! Ez HalDo AI me. Ez dikarim çawa alîkarîya te bikim?",

            thinking:
                "HalDo AI difikire...",

            empty:
                "Hîn danûstendinek tune.",

            saved:
                "Hat tomarkirin",

            error:
                "Çewtiyek çêbû."

        },

        ez: {

            title:
                "HalDo AI",

            newChat:
                "گفتوگۆیەکی نوێ",

            placeholder:
                "نامەیەک بۆ HalDo AI بنووسە...",

            send:
                "ناردن",

            search:
                "گەڕان لە گفتوگۆکان",

            settings:
                "ڕێکخستنەکان",

            clear:
                "سڕینەوە",

            copy:
                "کۆپی",

            microphone:
                "مایکرۆفۆن",

            stop:
                "وەستاندن",

            welcome:
                "سڵاو! من HalDo AI ـم. چۆن دەتوانم یارمەتیت بدەم؟",

            thinking:
                "HalDo AI بیر دەکاتەوە...",

            empty:
                "هێشتا هیچ گفتوگۆیەک نییە.",

            saved:
                "هەڵگیرا",

            error:
                "هەڵەیەک ڕوویدا."

        }

    };


    function t(
        key
    ) {

        const language =
            translations[
                state.language
            ] ||
            translations.de;


        return (
            language[key] ||
            translations.de[key] ||
            key
        );

    }


    /* ========================================================
       10 — CONVERSATIONS
       ======================================================== */

    function createConversation(
        title = ""
    ) {

        const conversation = {

            id:
                createId(
                    "conversation"
                ),

            title:
                title ||
                t("newChat"),

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


        saveState();


        emit(
            "conversation-created",
            {
                conversation:
                    clone(
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
        id
    ) {

        const conversation =
            state.conversations.find(
                item =>
                    item.id === id
            );


        if (!conversation) {

            return false;

        }


        state.currentConversationId =
            conversation.id;


        state.messages =
            conversation.messages;


        saveState();


        emit(
            "conversation-selected",
            {
                conversation:
                    clone(
                        conversation
                    )
            }
        );


        render();


        return true;

    }


    function deleteConversation(
        id
    ) {

        const index =
            state.conversations.findIndex(
                conversation =>
                    conversation.id === id
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
            id
        ) {

            const next =
                state.conversations[0];


            if (next) {

                state.currentConversationId =
                    next.id;

                state.messages =
                    next.messages;

            } else {

                createConversation();

                return true;

            }

        }


        saveState();

        emit(
            "conversation-deleted",
            {
                id:
                    id
            }
        );


        render();


        return true;

    }


    function ensureConversation() {

        let conversation =
            getCurrentConversation();


        if (!conversation) {

            conversation =
                createConversation();

        }


        return conversation;

    }


    /* ========================================================
       11 — MESSAGES
       ======================================================== */

    function addMessage(
        role,
        content,
        metadata = {}
    ) {

        const conversation =
            ensureConversation();


        const message = {

            id:
                createId(
                    "message"
                ),

            role:
                role,

            content:
                safeString(
                    content
                ),

            createdAt:
                Date.now(),

            metadata:
                metadata || {}

        };


        conversation.messages.push(
            message
        );


        conversation.updatedAt =
            Date.now();


        state.messages =
            conversation.messages;


        if (
            role === "user"
        ) {

            state.statistics
                .messagesSent +=
                1;

        }


        if (
            role === "assistant"
        ) {

            state.statistics
                .messagesReceived +=
                1;

        }


        updateConversationTitle(
            conversation
        );


        saveState();


        emit(
            "message-added",
            {
                message:
                    clone(
                        message
                    ),

                conversationId:
                    conversation.id

            }
        );


        renderMessages();


        return message;

    }


    function updateConversationTitle(
        conversation
    ) {

        if (
            !conversation ||
            conversation.title !==
                t("newChat")
        ) {

            return;

        }


        const firstUserMessage =
            conversation.messages.find(
                message =>
                    message.role ===
                    "user"
            );


        if (
            firstUserMessage
        ) {

            conversation.title =
                firstUserMessage.content
                    .slice(
                        0,
                        40
                    );

        }

    }


    /* ========================================================
       12 — AI CONNECTION
       ======================================================== */

    async function askAI(
        prompt
    ) {

        const aiChat =
            getAIChat();

        const aiEngine =
            getAIEngine();

        const aiCore =
            getAICore();


        const payload = {

            appId:
                APP_ID,

            conversationId:
                state.currentConversationId,

            message:
                prompt,

            language:
                state.language,

            messages:
                clone(
                    state.messages
                ),

            settings:
                clone(
                    state.settings
                )

        };


        /*
         * Priorität:
         *
         * 1. AI Chat
         * 2. AI Engine
         * 3. AI Core
         *
         * Dadurch bleibt die App mit
         * unterschiedlichen Versionen
         * der vorhandenen AI-Module
         * kompatibel.
         */


        if (
            aiChat
        ) {

            const methods = [

                "sendMessage",

                "chat",

                "ask",

                "send"

            ];


            for (
                const method of methods
            ) {

                if (
                    hasMethod(
                        aiChat,
                        method
                    )
                ) {

                    return aiChat[method](
                        payload
                    );

                }

            }

        }


        if (
            aiEngine
        ) {

            const methods = [

                "generate",

                "chat",

                "ask",

                "process"

            ];


            for (
                const method of methods
            ) {

                if (
                    hasMethod(
                        aiEngine,
                        method
                    )
                ) {

                    return aiEngine[method](
                        payload
                    );

                }

            }

        }


        if (
            aiCore
        ) {

            const methods = [

                "chat",

                "ask",

                "process",

                "generate"

            ];


            for (
                const method of methods
            ) {

                if (
                    hasMethod(
                        aiCore,
                        method
                    )
                ) {

                    return aiCore[method](
                        payload
                    );

                }

            }

        }


        /*
         * Falls die eigentliche AI Engine
         * noch nicht geladen ist, geben wir
         * keinen falschen Fehler zurück.
         *
         * Die App bleibt funktionsfähig und
         * wartet auf die echte AI-Verbindung.
         */

        return {

            success:
                false,

            pending:
                true,

            message:
                "AI engine not available."

        };

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
            response.response
        ) {

            return safeString(
                response.response
            );

        }


        if (
            response.answer
        ) {

            return safeString(
                response.answer
            );

        }


        if (
            response.content
        ) {

            return safeString(
                response.content
            );

        }


        if (
            response.message
        ) {

            return safeString(
                response.message
            );

        }


        if (
            response.text
        ) {

            return safeString(
                response.text
            );

        }


        return safeString(
            response
        );

    }


    /* ========================================================
       13 — SEND MESSAGE
       ======================================================== */

    async function sendMessage(
        text
    ) {

        const prompt =
            safeString(
                text
            ).trim();


        if (
            !prompt ||
            state.busy
        ) {

            return false;

        }


        ensureConversation();


        addMessage(
            "user",
            prompt
        );


        clearComposer();


        state.busy =
            true;


        updateBusyState(
            true
        );


        emit(
            "thinking",
            {
                prompt:
                    prompt
            }
        );


        try {

            const response =
                await askAI(
                    prompt
                );


            let answer =
                normalizeAIResponse(
                    response
                );


            if (
                !answer &&
                response &&
                response.pending
            ) {

                answer =
                    "HalDo AI ist bereit. Die zentrale AI-Engine ist momentan noch nicht verbunden.";

            }


            if (!answer) {

                answer =
                    t("error");

            }


            addMessage(
                "assistant",
                answer,
                {
                    source:
                        "haldo-ai"
                }
            );


            await saveMemory(
                prompt,
                answer
            );


            if (
                state.settings.voiceReplies
            ) {

                speak(
                    answer
                );

            }


            emit(
                "response",
                {
                    prompt:
                        prompt,

                    response:
                        answer

                }
            );


            return answer;

        } catch (exception) {

            reportError(
                exception,
                "AI Anfrage"
            );


            addMessage(
                "system",
                t("error"),
                {
                    error:
                        true
                }
            );


            return false;

        } finally {

            state.busy =
                false;


            updateBusyState(
                false
            );

        }

    }


    /* ========================================================
       14 — MEMORY
       ======================================================== */

    async function saveMemory(
        prompt,
        answer
    ) {

        if (
            !state.settings.memory
        ) {

            return false;

        }


        const memory =
            getAIMemory();


        if (!memory) {

            return false;

        }


        const payload = {

            appId:
                APP_ID,

            conversationId:
                state.currentConversationId,

            user:
                prompt,

            assistant:
                answer,

            language:
                state.language,

            timestamp:
                Date.now()

        };


        const methods = [

            "remember",

            "save",

            "add",

            "store"

        ];


        for (
            const method of methods
        ) {

            if (
                hasMethod(
                    memory,
                    method
                )
            ) {

                try {

                    await memory[method](
                        payload
                    );

                    return true;

                } catch (
                    exception
                ) {

                    reportError(
                        exception,
                        "AI Memory"
                    );

                    return false;

                }

            }

        }


        return false;

    }


    /* ========================================================
       15 — SPEECH
       ======================================================== */

    function speak(
        text
    ) {

        const voice =
            getAIVoice();

        const speech =
            getAISpeech();


        if (
            voice
        ) {

            for (
                const method of [
                    "speak",
                    "say",
                    "synthesize"
                ]
            ) {

                if (
                    hasMethod(
                        voice,
                        method
                    )
                ) {

                    try {

                        return voice[
                            method
                        ](
                            {
                                text:
                                    text,

                                language:
                                    state.language

                            }
                        );

                    } catch (
                        exception
                    ) {

                        reportError(
                            exception,
                            "AI Voice"
                        );

                    }

                }

            }

        }


        if (
            speech
        ) {

            for (
                const method of [
                    "speak",
                    "say",
                    "synthesize"
                ]
            ) {

                if (
                    hasMethod(
                        speech,
                        method
                    )
                ) {

                    try {

                        return speech[
                            method
                        ](
                            text,
                            {
                                language:
                                    state.language
                            }
                        );

                    } catch (
                        exception
                    ) {

                        reportError(
                            exception,
                            "AI Speech"
                        );

                    }

                }

            }

        }


        /*
         * Browser fallback.
         */

        if (
            "speechSynthesis" in
            window
        ) {

            try {

                const utterance =
                    new SpeechSynthesisUtterance(
                        text
                    );


                utterance.lang =
                    state.language === "de"
                        ? "de-DE"
                        : state.language === "en"
                            ? "en-US"
                            : "ku";


                window.speechSynthesis.speak(
                    utterance
                );


                return true;

            } catch (_) {}

        }


        return false;

    }


    /* ========================================================
       16 — MICROPHONE
       ======================================================== */

    function toggleRecording() {

        if (
            state.recording
        ) {

            stopRecording();

        } else {

            startRecording();

        }

    }


    function startRecording() {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        if (!SpeechRecognition) {

            emit(
                "speech-unavailable"
            );

            return false;

        }


        try {

            const recognition =
                new SpeechRecognition();


            recognition.lang =
                state.language === "de"
                    ? "de-DE"
                    : state.language === "en"
                        ? "en-US"
                        : "ku";


            recognition.continuous =
                false;


            recognition.interimResults =
                true;


            recognition.onstart =
                function () {

                    state.recording =
                        true;

                    updateRecordingState(
                        true
                    );

                };


            recognition.onresult =
                function (event) {

                    let transcript =
                        "";


                    for (
                        let i =
                            event.resultIndex;
                        i <
                            event.results.length;
                        i++
                    ) {

                        transcript +=
                            event.results[i][0]
                                .transcript;

                    }


                    setComposerValue(
                        transcript
                    );

                };


            recognition.onerror =
                function (event) {

                    reportError(
                        new Error(
                            event.error ||
                            "Speech recognition error"
                        ),
                        "Mikrofon"
                    );

                };


            recognition.onend =
                function () {

                    state.recording =
                        false;

                    updateRecordingState(
                        false
                    );

                };


            state.speechRecognition =
                recognition;


            recognition.start();


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Mikrofon starten"
            );


            return false;

        }

    }


    function stopRecording() {

        if (
            state.speechRecognition
        ) {

            try {

                state.speechRecognition.stop();

            } catch (_) {}

        }


        state.recording =
            false;


        updateRecordingState(
            false
        );

    }


    /* ========================================================
       17 — DOM / UI
       ======================================================== */

    function createRoot() {

        if (
            state.elements.root &&
            document.body.contains(
                state.elements.root
            )
        ) {

            return state.elements.root;

        }


        const root =
            document.createElement(
                "section"
            );


        root.id =
            "haldo-ai-chat-app";


        root.className =
            "haldo-ai-chat-app";


        root.setAttribute(
            "data-app-id",
            APP_ID
        );


        root.innerHTML = `

            <div class="haldo-chat-shell">

                <aside class="haldo-chat-sidebar">

                    <div class="haldo-chat-brand">

                        <div class="haldo-chat-brand-logo">
                            H
                        </div>

                        <div>
                            <strong>HalDo AI</strong>
                            <small>AI OS 20</small>
                        </div>

                    </div>


                    <button
                        type="button"
                        class="haldo-chat-new"
                        data-action="new-chat"
                    >
                        ＋
                        <span data-i18n="newChat">
                            ${escapeHTML(
                                t("newChat")
                            )}
                        </span>
                    </button>


                    <div class="haldo-chat-search">

                        <input
                            type="search"
                            data-role="search"
                            data-i18n-placeholder="search"
                            placeholder="${escapeHTML(
                                t("search")
                            )}"
                            autocomplete="off"
                        />

                    </div>


                    <div
                        class="haldo-chat-conversations"
                        data-role="conversations"
                    ></div>


                    <div class="haldo-chat-sidebar-bottom">

                        <button
                            type="button"
                            data-action="settings"
                        >
                            ⚙
                            <span data-i18n="settings">
                                ${escapeHTML(
                                    t("settings")
                                )}
                            </span>
                        </button>

                    </div>

                </aside>


                <main class="haldo-chat-main">

                    <header class="haldo-chat-header">

                        <div>

                            <h1 data-i18n="title">
                                ${escapeHTML(
                                    t("title")
                                )}
                            </h1>

                            <span
                                class="haldo-chat-status"
                                data-role="status"
                            >
                                ● Ready
                            </span>

                        </div>


                        <div class="haldo-chat-header-actions">

                            <button
                                type="button"
                                data-action="clear"
                                title="${escapeHTML(
                                    t("clear")
                                )}"
                            >
                                🗑
                            </button>

                        </div>

                    </header>


                    <section
                        class="haldo-chat-messages"
                        data-role="messages"
                        aria-live="polite"
                    ></section>


                    <div
                        class="haldo-chat-thinking"
                        data-role="thinking"
                        hidden
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                        <label>
                            ${escapeHTML(
                                t("thinking")
                            )}
                        </label>
                    </div>


                    <footer class="haldo-chat-composer">

                        <div class="haldo-chat-input-wrap">

                            <textarea
                                data-role="composer"
                                rows="1"
                                data-i18n-placeholder="placeholder"
                                placeholder="${escapeHTML(
                                    t("placeholder")
                                )}"
                                aria-label="${escapeHTML(
                                    t("placeholder")
                                )}"
                            ></textarea>


                            <div class="haldo-chat-input-actions">

                                <button
                                    type="button"
                                    data-action="microphone"
                                    title="${escapeHTML(
                                        t("microphone")
                                    )}"
                                >
                                    🎙
                                </button>


                                <button
                                    type="button"
                                    data-action="send"
                                    class="haldo-chat-send"
                                    title="${escapeHTML(
                                        t("send")
                                    )}"
                                >
                                    ➤
                                </button>

                            </div>

                        </div>

                        <small>
                            HalDo AI OS 20
                        </small>

                    </footer>

                </main>

            </div>

        `;


        state.elements.root =
            root;


        return root;

    }


    function mount() {

        if (
            state.mounted
        ) {

            return true;

        }


        const root =
            createRoot();


        /*
         * Die App wird nicht automatisch
         * in index.html eingebaut.
         *
         * Der Window Manager / App Manager
         * kann die App in sein Fenster
         * mounten.
         *
         * Falls kein Window Manager existiert,
         * verwenden wir einen sicheren
         * temporären Body-Fallback.
         */


        const manager =
            getWindowManager();


        if (
            manager &&
            hasMethod(
                manager,
                "mountApp"
            )
        ) {

            try {

                manager.mountApp(
                    APP_ID,
                    root
                );

            } catch (_) {}

        }


        if (
            !root.parentNode
        ) {

            root.style.display =
                "none";

            document.body.appendChild(
                root
            );

        }


        attachEvents();

        render();


        state.mounted =
            true;


        emit(
            "mounted"
        );


        return true;

    }


    /* ========================================================
       18 — EVENTS / BUTTONS
       ======================================================== */

    function addListener(
        element,
        event,
        callback
    ) {

        if (
            !element
        ) {

            return;

        }


        element.addEventListener(
            event,
            callback
        );


        state.listeners.push(
            function () {

                element.removeEventListener(
                    event,
                    callback
                );

            }
        );

    }


    function attachEvents() {

        const root =
            state.elements.root;


        if (!root) {

            return;

        }


        root
            .querySelectorAll(
                "[data-action]"
            )
            .forEach(
                button => {

                    addListener(
                        button,
                        "click",
                        function () {

                            handleAction(
                                button.dataset.action
                            );

                        }
                    );

                }
            );


        const composer =
            root.querySelector(
                '[data-role="composer"]'
            );


        addListener(
            composer,
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter" &&
                    !event.shiftKey &&
                    state.settings.enterToSend
                ) {

                    event.preventDefault();

                    sendMessage(
                        composer.value
                    );

                }

            }
        );


        addListener(
            composer,
            "input",
            autoResizeComposer
        );


        const search =
            root.querySelector(
                '[data-role="search"]'
            );


        addListener(
            search,
            "input",
            function () {

                state.searchQuery =
                    search.value;

                renderConversations();

            }
        );


        addListener(
            root,
            "click",
            function (event) {

                const conversation =
                    event.target.closest(
                        "[data-conversation-id]"
                    );


                if (
                    conversation
                ) {

                    selectConversation(
                        conversation.dataset
                            .conversationId
                    );

                }


                const copyButton =
                    event.target.closest(
                        "[data-copy-message]"
                    );


                if (
                    copyButton
                ) {

                    copyMessage(
                        copyButton.dataset
                            .copyMessage
                    );

                }

            }
        );

    }


    function handleAction(
        action
    ) {

        switch (
            action
        ) {

            case "new-chat":

                createConversation();

                break;


            case "send":

                sendMessage(
                    getComposerValue()
                );

                break;


            case "microphone":

                toggleRecording();

                break;


            case "clear":

                clearCurrentConversation();

                break;


            case "settings":

                openSettings();

                break;


            default:

                break;

        }

    }


    /* ========================================================
       19 — RENDER
       ======================================================== */

    function render() {

        renderTranslations();

        renderConversations();

        renderMessages();

        updateBusyState(
            state.busy
        );

        updateRecordingState(
            state.recording
        );

    }


    function renderTranslations() {

        const root =
            state.elements.root;


        if (!root) {

            return;

        }


        root
            .querySelectorAll(
                "[data-i18n]"
            )
            .forEach(
                element => {

                    const key =
                        element.dataset.i18n;


                    element.textContent =
                        t(key);

                }
            );


        root
            .querySelectorAll(
                "[data-i18n-placeholder]"
            )
            .forEach(
                element => {

                    const key =
                        element.dataset
                            .i18nPlaceholder;


                    element.placeholder =
                        t(key);

                }
            );

    }


    function renderConversations() {

        const container =
            state.elements.root &&
            state.elements.root.querySelector(
                '[data-role="conversations"]'
            );


        if (!container) {

            return;

        }


        const query =
            state.searchQuery
                .trim()
                .toLowerCase();


        const conversations =
            state.conversations.filter(
                conversation => {

                    if (!query) {

                        return true;

                    }


                    return (
                        conversation.title
                            .toLowerCase()
                            .includes(
                                query
                            )
                    );

                }
            );


        if (
            conversations.length ===
            0
        ) {

            container.innerHTML = `
                <div class="haldo-chat-empty">
                    ${escapeHTML(
                        t("empty")
                    )}
                </div>
            `;

            return;

        }


        container.innerHTML =
            conversations
                .map(
                    conversation => {

                        const active =
                            conversation.id ===
                            state.currentConversationId;


                        return `

                            <button
                                type="button"
                                class="
                                    haldo-chat-conversation
                                    ${active ? "active" : ""}
                                "
                                data-conversation-id="${escapeHTML(
                                    conversation.id
                                )}"
                            >

                                <span class="conversation-icon">
                                    💬
                                </span>

                                <span class="conversation-title">
                                    ${escapeHTML(
                                        conversation.title
                                    )}
                                </span>

                            </button>

                        `;

                    }
                )
                .join("");

    }


    function renderMessages() {

        const container =
            state.elements.root &&
            state.elements.root.querySelector(
                '[data-role="messages"]'
            );


        if (!container) {

            return;

        }


        const conversation =
            getCurrentConversation();


        if (
            !conversation ||
            !conversation.messages.length
        ) {

            container.innerHTML = `

                <div class="haldo-chat-welcome">

                    <div class="haldo-chat-welcome-logo">
                        H
                    </div>

                    <h2>
                        ${escapeHTML(
                            t("welcome")
                        )}
                    </h2>

                </div>

            `;

            return;

        }


        container.innerHTML =
            conversation.messages
                .map(
                    message => {

                        const role =
                            message.role;


                        const time =
                            new Date(
                                message.createdAt
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
                                    haldo-chat-message
                                    message-${escapeHTML(
                                        role
                                    )}
                                "
                                data-message-id="${escapeHTML(
                                    message.id
                                )}"
                            >

                                <div class="haldo-chat-avatar">
                                    ${
                                        role ===
                                        "user"
                                            ? "U"
                                            : role ===
                                                "assistant"
                                                ? "H"
                                                : "!"
                                    }
                                </div>


                                <div class="haldo-chat-message-body">

                                    <div class="haldo-chat-message-content">
                                        ${formatMessage(
                                            message.content
                                        )}
                                    </div>


                                    <div class="haldo-chat-message-meta">

                                        ${
                                            state.settings
                                                .showTimestamps
                                                ? `<span>${escapeHTML(
                                                    time
                                                )}</span>`
                                                : ""
                                        }


                                        ${
                                            role ===
                                            "assistant"
                                                ? `
                                                    <button
                                                        type="button"
                                                        data-copy-message="${escapeHTML(
                                                            message.content
                                                        )}"
                                                    >
                                                        ${escapeHTML(
                                                            t("copy")
                                                        )}
                                                    </button>
                                                `
                                                : ""
                                        }

                                    </div>

                                </div>

                            </article>

                        `;

                    }
                )
                .join("");


        if (
            state.settings.autoScroll
        ) {

            requestAnimationFrame(
                function () {

                    container.scrollTop =
                        container.scrollHeight;

                }
            );

        }

    }


    function formatMessage(
        text
    ) {

        return escapeHTML(
            text
        )
        .replace(
            /\n/g,
            "<br>"
        );

    }


    /* ========================================================
       20 — COMPOSER
       ======================================================== */

    function getComposerValue() {

        const composer =
            state.elements.root &&
            state.elements.root.querySelector(
                '[data-role="composer"]'
            );


        return composer
            ? composer.value
            : "";

    }


    function setComposerValue(
        value
    ) {

        const composer =
            state.elements.root &&
            state.elements.root.querySelector(
                '[data-role="composer"]'
            );


        if (
            composer
        ) {

            composer.value =
                safeString(
                    value
                );

            autoResizeComposer.call(
                composer
            );

        }

    }


    function clearComposer() {

        setComposerValue(
            ""
        );

    }


    function autoResizeComposer() {

        if (
            !this
        ) {

            return;

        }


        this.style.height =
            "auto";


        this.style.height =
            Math.min(
                this.scrollHeight,
                180
            ) +
            "px";

    }


    /* ========================================================
       21 — UI STATES
       ======================================================== */

    function updateBusyState(
        busy
    ) {

        const root =
            state.elements.root;


        if (!root) {

            return;

        }


        const thinking =
            root.querySelector(
                '[data-role="thinking"]'
            );


        if (
            thinking
        ) {

            thinking.hidden =
                !busy;

        }


        const send =
            root.querySelector(
                '[data-action="send"]'
            );


        if (
            send
        ) {

            send.disabled =
                busy;

        }


        const status =
            root.querySelector(
                '[data-role="status"]'
            );


        if (
            status
        ) {

            status.textContent =
                busy
                    ? "● Thinking"
                    : "● Ready";

        }

    }


    function updateRecordingState(
        recording
    ) {

        const button =
            state.elements.root &&
            state.elements.root.querySelector(
                '[data-action="microphone"]'
            );


        if (
            button
        ) {

            button.classList.toggle(
                "recording",
                recording
            );

            button.title =
                recording
                    ? t("stop")
                    : t("microphone");

        }

    }


    /* ========================================================
       22 — COPY
       ======================================================== */

    async function copyMessage(
        text
    ) {

        try {

            if (
                navigator.clipboard
            ) {

                await navigator.clipboard.writeText(
                    text
                );

            } else {

                const textarea =
                    document.createElement(
                        "textarea"
                    );


                textarea.value =
                    text;


                document.body.appendChild(
                    textarea
                );


                textarea.select();

                document.execCommand(
                    "copy"
                );


                textarea.remove();

            }


            emit(
                "message-copied",
                {
                    text:
                        text
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Nachricht kopieren"
            );


            return false;

        }

    }


    /* ========================================================
       23 — CLEAR CHAT
       ======================================================== */

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


        saveState();


        emit(
            "conversation-cleared",
            {
                conversationId:
                    conversation.id
            }
        );


        renderMessages();


        return true;

    }


    /* ========================================================
       24 — SETTINGS
       ======================================================== */

    function openSettings() {

        emit(
            "settings-requested",
            {
                appId:
                    APP_ID,

                settings:
                    clone(
                        state.settings
                    )
            }
        );


        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "setSettings"
            )
        ) {

            manager.setSettings(
                APP_ID,
                state.settings
            );

        }

    }


    function setSettings(
        changes
    ) {

        state.settings = {

            ...state.settings,

            ...(changes || {})

        };


        saveState();

        render();


        emit(
            "settings-changed",
            {
                settings:
                    clone(
                        state.settings
                    )
            }
        );


        return clone(
            state.settings
        );

    }


    /* ========================================================
       25 — LANGUAGE
       ======================================================== */

    function setLanguage(
        language
    ) {

        const value =
            safeString(
                language
            )
            .trim()
            .toLowerCase();


        if (
            !value
        ) {

            return false;

        }


        state.language =
            value;


        saveState();

        renderTranslations();


        const languageManager =
            getLanguageManager();


        if (
            languageManager
        ) {

            for (
                const method of [
                    "setLanguage",
                    "changeLanguage",
                    "setCurrentLanguage"
                ]
            ) {

                if (
                    hasMethod(
                        languageManager,
                        method
                    )
                ) {

                    try {

                        languageManager[
                            method
                        ](
                            value
                        );

                        break;

                    } catch (_) {}

                }

            }

        }


        const aiLanguage =
            getAILanguage();


        if (
            aiLanguage
        ) {

            for (
                const method of [
                    "setLanguage",
                    "setCurrentLanguage"
                ]
            ) {

                if (
                    hasMethod(
                        aiLanguage,
                        method
                    )
                ) {

                    try {

                        aiLanguage[
                            method
                        ](
                            value
                        );

                        break;

                    } catch (_) {}

                }

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
       26 — EZIDI KEYBOARD
       ======================================================== */

    function openEzidiKeyboard() {

        const keyboard =
            getEzidiKeyboard();


        if (!keyboard) {

            return false;

        }


        for (
            const method of [
                "open",
                "show",
                "activate",
                "enable"
            ]
        ) {

            if (
                hasMethod(
                    keyboard,
                    method
                )
            ) {

                try {

                    keyboard[method](
                        {
                            target:
                                state.elements
                                    .root
                        }
                    );

                    return true;

                } catch (_) {}

            }

        }


        return false;

    }


    /* ========================================================
       27 — APP CONTRACT
       ======================================================== */

    function getContract() {

        const contract =
            window.HalDoAppContract ||
            HalDoOS.appContract;


        if (!contract) {

            return null;

        }


        return contract;

    }


    /* ========================================================
       28 — APP BASE
       ======================================================== */

    function getBase() {

        return (
            window.HalDoAppBase ||
            HalDoOS.appBase ||
            null
        );

    }


    /* ========================================================
       29 — LIFECYCLE
       ======================================================== */

    async function init(
        context = {}
    ) {

        if (
            state.initialized
        ) {

            return true;

        }


        loadState();


        if (
            !getCurrentConversation()
        ) {

            createConversation();

        }


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


        return true;

    }


    async function start(
        context = {}
    ) {

        if (
            state.started
        ) {

            return true;

        }


        await init(
            context
        );


        mount();


        state.started =
            true;


        state.statistics.startedAt =
            Date.now();


        emit(
            "started",
            {
                appId:
                    APP_ID
            }
        );


        return true;

    }


    async function activate() {

        if (
            !state.started
        ) {

            await start();

        }


        const root =
            state.elements.root;


        if (
            root
        ) {

            root.style.display =
                "";

        }


        emit(
            "activated"
        );


        return true;

    }


    async function deactivate() {

        emit(
            "deactivated"
        );


        return true;

    }


    async function minimize() {

        emit(
            "minimized"
        );


        return true;

    }


    async function restore() {

        await activate();


        emit(
            "restored"
        );


        return true;

    }


    async function stop() {

        state.started =
            false;


        emit(
            "stopped"
        );


        return true;

    }


    async function close() {

        await deactivate();


        emit(
            "closed"
        );


        return true;

    }


    /* ========================================================
       30 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        return {

            appId:
                APP_ID,

            version:
                APP_VERSION,

            name:
                APP_NAME,

            initialized:
                state.initialized,

            started:
                state.started,

            mounted:
                state.mounted,

            busy:
                state.busy,

            recording:
                state.recording,

            language:
                state.language,

            conversationCount:
                state.conversations.length,

            currentConversation:
                state.currentConversationId,

            messageCount:
                state.messages.length,

            statistics:
                clone(
                    state.statistics
                ),

            services: {

                appManager:
                    !!getAppManager(),

                kernel:
                    !!getKernel(),

                system:
                    !!getSystem(),

                router:
                    !!getRouter(),

                windowManager:
                    !!getWindowManager(),

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

                aiSpeech:
                    !!getAISpeech(),

                aiVoice:
                    !!getAIVoice(),

                languageManager:
                    !!getLanguageManager(),

                languageSystem:
                    !!getLanguageSystem(),

                ezidiKeyboard:
                    !!getEzidiKeyboard(),

                appContract:
                    !!getContract(),

                appBase:
                    !!getBase()

            },

            timestamp:
                new Date().toISOString()

        };

    }


    function healthCheck() {

        const problems =
            [];


        if (
            !state.initialized
        ) {

            problems.push(
                "App wurde noch nicht initialisiert."
            );

        }


        if (
            !getAppManager()
        ) {

            problems.push(
                "App Manager nicht verbunden."
            );

        }


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


        return {

            healthy:
                problems.length ===
                0,

            problems:
                problems,

            diagnostics:
                diagnostics()

        };

    }


    /* ========================================================
       31 — PUBLIC APP DEFINITION
       ======================================================== */

    const app = {

        id:
            APP_ID,

        name:
            APP_NAME,

        title:
            APP_TITLE,

        version:
            APP_VERSION,

        category:
            APP_CATEGORY,

        route:
            APP_ROUTE,

        icon:
            "H",

        description:
            "Die zentrale künstliche Intelligenz von HalDo AI OS.",

        tags: [

            "ai",

            "chat",

            "assistant",

            "haldo",

            "language",

            "voice",

            "memory"

        ],

        keywords: [

            "HalDo",

            "AI",

            "Chat",

            "KI",

            "Assistant",

            "Ezidi",

            "Sprache",

            "Voice",

            "Memory"

        ],

        singleton:
            true,

        enabled:
            true,

        dependencies:
            [],


        /* Lifecycle */

        init:
            init,

        start:
            start,

        onActivate:
            activate,

        onDeactivate:
            deactivate,

        minimize:
            minimize,

        restore:
            restore,

        stop:
            stop,

        close:
            close,


        /* Chat */

        sendMessage:
            sendMessage,

        addMessage:
            addMessage,

        getMessages:
            function () {

                return clone(
                    state.messages
                );

            },


        /* Conversations */

        createConversation:
            createConversation,

        getCurrentConversation:
            getCurrentConversation,

        getConversations:
            function () {

                return clone(
                    state.conversations
                );

            },

        selectConversation:
            selectConversation,

        deleteConversation:
            deleteConversation,

        clearCurrentConversation:
            clearCurrentConversation,


        /* Language */

        setLanguage:
            setLanguage,

        getLanguage:
            function () {

                return state.language;

            },


        /* Settings */

        getSettings:
            function () {

                return clone(
                    state.settings
                );

            },

        setSettings:
            setSettings,


        /* Voice */

        speak:
            speak,

        startRecording:
            startRecording,

        stopRecording:
            stopRecording,


        /* Keyboard */

        openEzidiKeyboard:
            openEzidiKeyboard,


        /* Events */

        on:
            on,

        off:
            off,

        emit:
            emit,


        /* Diagnostics */

        diagnostics:
            diagnostics,

        healthCheck:
            healthCheck,


        /* UI */

        mount:
            mount,

        render:
            render

    };


    /* ========================================================
       32 — REGISTER GLOBAL
       ======================================================== */

    window.HalDoAIChatApp =
        app;


    HalDoOS.aiChatApp =
        app;


    /* ========================================================
       33 — REGISTER WITH APP MANAGER
       ======================================================== */

    function registerWithManager() {

        const manager =
            getAppManager();


        if (
            !manager
        ) {

            return false;

        }


        try {

            if (
                hasMethod(
                    manager,
                    "register"
                )
            ) {

                manager.register(
                    app
                );

                return true;

            }

            if (
                hasMethod(
                    manager,
                    "registerApp"
                )
            ) {

                manager.registerApp(
                    app
                );

                return true;

            }

        } catch (exception) {

            reportError(
                exception,
                "App Manager Registrierung"
            );

        }


        return false;

    }


    /* ========================================================
       34 — KERNEL REGISTRATION
       ======================================================== */

    function registerWithKernel() {

        const kernel =
            getKernel();


        if (
            !kernel
        ) {

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
                    APP_ID,
                    app
                );

            }


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Kernel Registrierung"
            );


            return false;

        }

    }


    /* ========================================================
       35 — BOOTSTRAP
       ======================================================== */

    async function bootstrap() {

        try {

            registerWithManager();

            registerWithKernel();


            /*
             * Die App wird zunächst nur
             * registriert.
             *
             * Öffnen übernimmt der
             * App Manager / Launcher.
             */

            emit(
                "registered",
                {
                    app:
                        app
                }
            );


            console.log(
                "[HalDo AI Chat]",
                APP_NAME,
                APP_VERSION,
                "registered."
            );


        } catch (exception) {

            reportError(
                exception,
                "Bootstrap"
            );

        }

    }


    /* ========================================================
       36 — DOM READY
       ======================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            bootstrap,
            {
                once:
                    true
            }
        );

    } else {

        bootstrap();

    }


    /* ========================================================
       END
       HALDO AI CHAT APP
       ======================================================== */

})(window, document);