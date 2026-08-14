// ============================================================
// HALDO AI OS 18
// AI CHAT SYSTEM
// PART 85
// ============================================================

(function (window, document) {

    "use strict";

    if (
        window.HalDoAIChat &&
        window.HalDoAIChat.__haldoAI18
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    const CONFIG = {

        name:
            "HalDo AI Chat",

        version:
            "18.0.0",

        mode:
            "Professional Ultimate Foundation",

        maxMessages:
            500,

        maxHistory:
            200,

        autoScroll:
            true,

        enableCommands:
            true,

        enableMemory:
            true,

        enableSpeech:
            true,

        welcomeMessage:
            "Hallo! Ich bin HalDo AI. Wie kann ich dir helfen?"

    };

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    const state = {

        initialized:
            false,

        ready:
            false,

        processing:
            false,

        listening:
            false,

        speaking:
            false,

        currentLanguage:
            "de",

        conversationId:
            null,

        messages:
            [],

        history:
            [],

        lastUserMessage:
            null,

        lastAssistantMessage:
            null,

        lastResponse:
            null,

        errors:
            [],

        ui:
            {

                container:
                    null,

                messages:
                    null,

                input:
                    null,

                sendButton:
                    null,

                status:
                    null,

                typing:
                    null,

                voiceButton:
                    null

            }

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
                        "[HalDoAIChat]",
                        error
                    );

                }

            }

        }

        try {

            document.dispatchEvent(
                new CustomEvent(
                    `haldo:ai-chat:${event}`,
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
        prefix = "chat"
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

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
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

    // --------------------------------------------------------
    // MODULE CONNECTIONS
    // --------------------------------------------------------

    function getCore() {

        return (
            window.HalDoAICore ||
            window.HalDoOS?.aiCore ||
            window.HalDoAI ||
            null
        );

    }

    function getEngine() {

        return (
            window.HalDoAIEngine ||
            window.HalDoOS?.aiEngine ||
            null
        );

    }

    function getCommands() {

        return (
            window.HalDoAICommands ||
            window.HalDoOS?.aiCommands ||
            null
        );

    }

    function getMemory() {

        return (
            window.HalDoAIMemory ||
            window.HalDoOS?.aiMemory ||
            null
        );

    }

    function getConversation() {

        return (
            window.HalDoConversationState ||
            window.HalDoOS?.conversationState ||
            null
        );

    }

    function getLanguage() {

        return (
            window.HalDoAILanguage ||
            window.HalDoOS?.aiLanguage ||
            null
        );

    }

    function getSpeech() {

        return (
            window.HalDoAISpeech ||
            window.HalDoOS?.aiSpeech ||
            null
        );

    }

    function getVoice() {

        return (
            window.HalDoAIVoice ||
            window.HalDoOS?.aiVoice ||
            null
        );

    }

    // --------------------------------------------------------
    // LANGUAGE
    // --------------------------------------------------------

    function detectLanguage(
        text
    ) {

        const language =
            getLanguage();

        if (
            language &&
            typeof language.detectLanguage ===
            "function"
        ) {

            try {

                const result =
                    language.detectLanguage(
                        text
                    );

                if (
                    result?.language
                ) {

                    state.currentLanguage =
                        result.language;

                }

                return result;

            } catch (error) {

                recordError(
                    error
                );

            }

        }

        return {

            language:
                state.currentLanguage,

            confidence:
                0

        };

    }

    // --------------------------------------------------------
    // CONVERSATION ID
    // --------------------------------------------------------

    function createConversation() {

        state.conversationId =
            createId(
                "conversation"
            );

        emit(
            "conversation-created",
            {
                conversationId:
                    state.conversationId
            }
        );

        return state.conversationId;

    }

    function getConversationId() {

        if (
            !state.conversationId
        ) {

            createConversation();

        }

        return state.conversationId;

    }

    // --------------------------------------------------------
    // MESSAGE CREATION
    // --------------------------------------------------------

    function createMessage(
        role,
        content,
        metadata = {}
    ) {

        return {

            id:
                createId(
                    "message"
                ),

            role,

            content:
                clean(
                    content
                ),

            text:
                clean(
                    content
                ),

            language:
                metadata.language ||
                state.currentLanguage,

            timestamp:
                Date.now(),

            conversationId:
                getConversationId(),

            type:
                metadata.type ||
                "text",

            metadata:
                metadata.metadata ||
                {}

        };

    }

    // --------------------------------------------------------
    // LOCAL MESSAGE STORAGE
    // --------------------------------------------------------

    function addLocalMessage(
        message
    ) {

        if (!message) {
            return null;
        }

        state.messages.push(
            message
        );

        if (
            state.messages.length >
            CONFIG.maxMessages
        ) {

            state.messages.shift();

        }

        emit(
            "message-added",
            {
                message
            }
        );

        return message;

    }

    async function saveMessage(
        message
    ) {

        addLocalMessage(
            message
        );

        const conversation =
            getConversation();

        if (
            conversation
        ) {

            const methods = [

                "addMessage",
                "add",
                "pushMessage",
                "appendMessage"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof conversation[
                        method
                    ] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    await conversation[
                        method
                    ](
                        message
                    );

                    break;

                } catch (error) {}

            }

        }

        return message;

    }

    function getMessages(
        limit = 100
    ) {

        return state.messages
            .slice(
                -Math.max(
                    1,
                    limit
                )
            );

    }

    function clearMessages() {

        state.messages =
            [];

        state.lastUserMessage =
            null;

        state.lastAssistantMessage =
            null;

        state.lastResponse =
            null;

        emit(
            "messages-cleared"
        );

        renderMessages();

        return true;

    }

    // --------------------------------------------------------
    // MEMORY
    // --------------------------------------------------------

    async function remember(
        message
    ) {

        if (
            !CONFIG.enableMemory
        ) {
            return false;
        }

        const memory =
            getMemory();

        if (!memory) {
            return false;
        }

        const methods = [

            "remember",
            "add",
            "store",
            "save",
            "rememberMessage"

        ];

        for (
            const method of methods
        ) {

            if (
                typeof memory[
                    method
                ] !==
                "function"
            ) {
                continue;
            }

            try {

                await memory[
                    method
                ](
                    message
                );

                return true;

            } catch (error) {}

        }

        return false;

    }

    // --------------------------------------------------------
    // CORE REQUEST
    // --------------------------------------------------------

    async function requestAI(
        text,
        options = {}
    ) {

        const core =
            getCore();

        if (
            core
        ) {

            const methods = [

                "process",
                "ask",
                "send",
                "execute"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof core[
                        method
                    ] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await core[
                            method
                        ](
                            text,
                            {
                                ...options,

                                source:
                                    "ai-chat",

                                conversationId:
                                    getConversationId(),

                                history:
                                    getMessages(
                                        options.historyLimit ||
                                        50
                                    )

                            }
                        );

                    if (
                        result !==
                        undefined &&
                        result !==
                        null
                    ) {

                        return normalizeResponse(
                            result
                        );

                    }

                } catch (error) {

                    recordError(
                        error
                    );

                }

            }

        }

        /*
         * Direkter Engine-Fallback.
         */

        const engine =
            getEngine();

        if (
            engine
        ) {

            const methods = [

                "generateResponse",
                "generate",
                "respond",
                "process",
                "ask"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof engine[
                        method
                    ] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await engine[
                            method
                        ](
                            text,
                            {
                                ...options,

                                conversationId:
                                    getConversationId(),

                                history:
                                    getMessages(
                                        50
                                    )

                            }
                        );

                    if (
                        result !==
                        undefined &&
                        result !==
                        null
                    ) {

                        return normalizeResponse(
                            result
                        );

                    }

                } catch (error) {

                    recordError(
                        error
                    );

                }

            }

        }

        return {

            ok:
                false,

            type:
                "no-ai-provider",

            text:
                "Kein aktiver AI-Provider ist momentan verbunden.",

            content:
                "Kein aktiver AI-Provider ist momentan verbunden."

        };

    }

    // --------------------------------------------------------
    // RESPONSE NORMALIZATION
    // --------------------------------------------------------

    function normalizeResponse(
        result
    ) {

        if (
            typeof result ===
            "string"
        ) {

            return {

                ok:
                    true,

                type:
                    "text",

                text:
                    result,

                content:
                    result

            };

        }

        if (
            !result ||
            typeof result !==
            "object"
        ) {

            return {

                ok:
                    true,

                type:
                    "value",

                text:
                    String(
                        result ?? ""
                    ),

                content:
                    String(
                        result ?? ""
                    ),

                value:
                    result

            };

        }

        let text =
            result.text ??
            result.content ??
            result.message ??
            "";

        /*
         * Command-Ergebnisse können Daten
         * statt normalen Text liefern.
         */

        if (
            !text &&
            result.result?.message
        ) {

            text =
                result.result.message;

        }

        if (
            !text &&
            result.result?.type
        ) {

            text =
                createCommandMessage(
                    result
                );

        }

        return {

            ok:
                result.ok !== false,

            type:
                result.type ||
                "text",

            text:
                clean(
                    text
                ),

            content:
                clean(
                    text
                ),

            ...result

        };

    }

    function createCommandMessage(
        response
    ) {

        const result =
            response.result;

        const command =
            response.command ||
            result?.command;

        if (
            command ===
            "open-app"
        ) {

            return "Die gewünschte App wurde verarbeitet.";

        }

        if (
            command ===
            "close-app"
        ) {

            return "Die gewünschte App wurde geschlossen.";

        }

        if (
            command ===
            "home"
        ) {

            return "Ich habe die Startseite geöffnet.";

        }

        if (
            command ===
            "system-status"
        ) {

            return "Der HalDo-Systemstatus wurde abgerufen.";

        }

        if (
            command ===
            "language"
        ) {

            return "Die Spracheinstellung wurde verarbeitet.";

        }

        if (
            command ===
            "new-conversation"
        ) {

            return "Eine neue Unterhaltung wurde gestartet.";

        }

        if (
            command ===
            "reload"
        ) {

            return "HalDo AI wird neu geladen.";

        }

        return "Der HalDo-Befehl wurde ausgeführt.";

    }

    // --------------------------------------------------------
    // SEND MESSAGE
    // --------------------------------------------------------

    async function sendMessage(
        input,
        options = {}
    ) {

        const text =
            clean(
                input
            );

        if (!text) {

            return {

                ok:
                    false,

                error:
                    "EMPTY_MESSAGE"

            };

        }

        if (
            state.processing
        ) {

            emit(
                "busy",
                {
                    input:
                        text
                }
            );

        }

        state.processing =
            true;

        setTyping(
            true
        );

        const language =
            detectLanguage(
                text
            );

        const userMessage =
            createMessage(
                "user",
                text,
                {
                    language:
                        language?.language ||
                        state.currentLanguage
                }
            );

        state.lastUserMessage =
            userMessage;

        await saveMessage(
            userMessage
        );

        await remember(
            userMessage
        );

        emit(
            "user-message",
            {
                message:
                    userMessage
            }
        );

        renderMessages();

        try {

            const response =
                await requestAI(
                    text,
                    {
                        ...options,

                        language:
                            userMessage.language
                    }
                );

            state.lastResponse =
                response;

            const responseText =
                clean(
                    response.text ||
                    response.content ||
                    ""
                );

            const assistantMessage =
                createMessage(
                    "assistant",
                    responseText ||
                    (
                        response.ok
                            ? "Ich habe deine Anfrage verarbeitet."
                            : "Entschuldigung, deine Anfrage konnte gerade nicht verarbeitet werden."
                    ),
                    {
                        language:
                            userMessage.language,

                        type:
                            response.type,

                        metadata:
                            {
                                response
                            }

                    }
                );

            state.lastAssistantMessage =
                assistantMessage;

            await saveMessage(
                assistantMessage
            );

            await remember(
                assistantMessage
            );

            emit(
                "assistant-message",
                {
                    message:
                        assistantMessage,

                    response
                }
            );

            renderMessages();

            /*
             * Sprachwiedergabe nur wenn ausdrücklich
             * aktiviert oder angefordert.
             */

            if (
                options.speak === true &&
                responseText
            ) {

                await speak(
                    responseText,
                    options
                );

            }

            const result = {

                ok:
                    response.ok !== false,

                type:
                    response.type ||
                    "text",

                text:
                    responseText,

                content:
                    responseText,

                response,

                userMessage,

                assistantMessage,

                conversationId:
                    getConversationId(),

                language:
                    userMessage.language

            };

            state.history.push(
                result
            );

            if (
                state.history.length >
                CONFIG.maxHistory
            ) {

                state.history.shift();

            }

            emit(
                "response",
                result
            );

            return result;

        } catch (error) {

            recordError(
                error
            );

            const errorMessage =
                createMessage(
                    "system",
                    "Es ist ein Fehler bei der Verarbeitung aufgetreten.",
                    {
                        type:
                            "error",

                        metadata:
                            {
                                error:
                                    error.message ||
                                    String(
                                        error
                                    )
                            }

                    }
                );

            await saveMessage(
                errorMessage
            );

            renderMessages();

            const result = {

                ok:
                    false,

                type:
                    "error",

                error:
                    error.message ||
                    String(
                        error
                    ),

                message:
                    errorMessage

            };

            emit(
                "response-error",
                {
                    result,

                    error
                }
            );

            return result;

        } finally {

            state.processing =
                false;

            setTyping(
                false
            );

            emit(
                "processing-end"
            );

        }

    }

    // --------------------------------------------------------
    // CONVENIENCE API
    // --------------------------------------------------------

    async function send(
        input,
        options = {}
    ) {

        return sendMessage(
            input,
            options
        );

    }

    async function ask(
        input,
        options = {}
    ) {

        return sendMessage(
            input,
            options
        );

    }

    async function process(
        input,
        options = {}
    ) {

        return sendMessage(
            input,
            options
        );

    }

    // --------------------------------------------------------
    // SPEECH
    // --------------------------------------------------------

    async function speak(
        text,
        options = {}
    ) {

        if (
            !CONFIG.enableSpeech
        ) {

            return {

                ok:
                    false,

                error:
                    "SPEECH_DISABLED"

            };

        }

        const target =
            getVoice() ||
            getSpeech();

        if (!target) {

            return {

                ok:
                    false,

                error:
                    "VOICE_ENGINE_UNAVAILABLE"

            };

        }

        const methods = [

            "speak",
            "say",
            "synthesize"

        ];

        state.speaking =
            true;

        emit(
            "speech-start",
            {
                text
            }
        );

        try {

            for (
                const method of methods
            ) {

                if (
                    typeof target[
                        method
                    ] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await target[
                            method
                        ](
                            text,
                            {
                                ...options,

                                language:
                                    options.language ||
                                    state.currentLanguage
                            }
                        );

                    return {

                        ok:
                            result !== false,

                        result

                    };

                } catch (error) {

                    recordError(
                        error
                    );

                }

            }

            return {

                ok:
                    false,

                error:
                    "SPEAK_METHOD_UNAVAILABLE"

            };

        } finally {

            state.speaking =
                false;

            emit(
                "speech-end",
                {
                    text
                }
            );

        }

    }

    // --------------------------------------------------------
    // UI CONNECTION
    // --------------------------------------------------------

    function findElement(
        selectors
    ) {

        for (
            const selector of selectors
        ) {

            try {

                const element =
                    document.querySelector(
                        selector
                    );

                if (element) {
                    return element;
                }

            } catch (error) {}

        }

        return null;

    }

    function connectUI(
        root = document
    ) {

        if (!root) {
            return false;
        }

        state.ui.container =
            root.querySelector(
                "[data-haldo-ai-chat], #haldo-ai-chat, .haldo-ai-chat"
            ) ||
            state.ui.container;

        state.ui.messages =
            root.querySelector(
                "[data-haldo-chat-messages], #haldo-chat-messages, .haldo-chat-messages"
            ) ||
            state.ui.messages;

        state.ui.input =
            root.querySelector(
                "[data-haldo-ai-input], #haldo-ai-input, #ai-input, .haldo-ai-input"
            ) ||
            state.ui.input;

        state.ui.sendButton =
            root.querySelector(
                "[data-haldo-ai-send], #haldo-ai-send, #ai-send, .haldo-ai-send"
            ) ||
            state.ui.sendButton;

        state.ui.status =
            root.querySelector(
                "[data-haldo-ai-status], #haldo-ai-status, .haldo-ai-status"
            ) ||
            state.ui.status;

        state.ui.typing =
            root.querySelector(
                "[data-haldo-ai-typing], #haldo-ai-typing, .haldo-ai-typing"
            ) ||
            state.ui.typing;

        state.ui.voiceButton =
            root.querySelector(
                "[data-haldo-ai-voice], #haldo-ai-voice, .haldo-ai-voice"
            ) ||
            state.ui.voiceButton;

        bindUIEvents();

        renderMessages();

        emit(
            "ui-connected",
            {
                ui:
                    state.ui
            }
        );

        return true;

    }

    function bindUIEvents() {

        const input =
            state.ui.input;

        const sendButton =
            state.ui.sendButton;

        const voiceButton =
            state.ui.voiceButton;

        if (
            input &&
            !input.dataset.haldoBound
        ) {

            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter" &&
                        !event.shiftKey
                    ) {

                        event.preventDefault();

                        sendMessage(
                            input.value
                        );

                        input.value =
                            "";

                    }

                }
            );

            input.dataset.haldoBound =
                "true";

        }

        if (
            sendButton &&
            !sendButton.dataset.haldoBound
        ) {

            sendButton.addEventListener(
                "click",
                () => {

                    const value =
                        input?.value ||
                        "";

                    if (!clean(value)) {
                        return;
                    }

                    sendMessage(
                        value
                    );

                    if (input) {
                        input.value =
                            "";
                    }

                }
            );

            sendButton.dataset.haldoBound =
                "true";

        }

        if (
            voiceButton &&
            !voiceButton.dataset.haldoBound
        ) {

            voiceButton.addEventListener(
                "click",
                () => {

                    toggleListening();

                }
            );

            voiceButton.dataset.haldoBound =
                "true";

        }

    }

    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------

    function renderMessages() {

        const container =
            state.ui.messages;

        if (!container) {
            return;
        }

        container.innerHTML =
            "";

        const fragment =
            document.createDocumentFragment();

        state.messages.forEach(
            message => {

                const element =
                    document.createElement(
                        "div"
                    );

                element.className =
                    "haldo-chat-message " +
                    `haldo-chat-message-${message.role}`;

                element.dataset.messageId =
                    message.id;

                const content =
                    document.createElement(
                        "div"
                    );

                content.className =
                    "haldo-chat-message-content";

                content.textContent =
                    message.content;

                element.appendChild(
                    content
                );

                const time =
                    document.createElement(
                        "div"
                    );

                time.className =
                    "haldo-chat-message-time";

                try {

                    time.textContent =
                        new Date(
                            message.timestamp
                        ).toLocaleTimeString(
                            [],
                            {
                                hour:
                                    "2-digit",

                                minute:
                                    "2-digit"

                            }
                        );

                } catch (error) {

                    time.textContent =
                        "";

                }

                element.appendChild(
                    time
                );

                fragment.appendChild(
                    element
                );

            }
        );

        container.appendChild(
            fragment
        );

        if (
            CONFIG.autoScroll
        ) {

            requestAnimationFrame(
                () => {

                    container.scrollTop =
                        container.scrollHeight;

                }
            );

        }

    }

    function setTyping(
        visible
    ) {

        if (
            state.ui.typing
        ) {

            state.ui.typing.hidden =
                !visible;

        }

        if (
            state.ui.status
        ) {

            state.ui.status.textContent =
                visible
                    ? "HalDo AI denkt …"
                    : "HalDo AI bereit";

        }

    }

    // --------------------------------------------------------
    // VOICE INPUT
    // --------------------------------------------------------

    function getRecognitionConstructor() {

        return (
            window.SpeechRecognition ||
            window.webkitSpeechRecognition ||
            null
        );

    }

    function toggleListening() {

        if (
            state.listening
        ) {

            stopListening();

        } else {

            startListening();

        }

    }

    function startListening() {

        const Recognition =
            getRecognitionConstructor();

        if (!Recognition) {

            emit(
                "voice-unavailable",
                {
                    error:
                        "SPEECH_RECOGNITION_UNAVAILABLE"
                }
            );

            return false;

        }

        let recognition;

        try {

            recognition =
                new Recognition();

        } catch (error) {

            recordError(
                error
            );

            return false;

        }

        recognition.lang =
            languageToSpeechCode(
                state.currentLanguage
            );

        recognition.interimResults =
            true;

        recognition.continuous =
            false;

        state.listening =
            true;

        emit(
            "listening-start"
        );

        recognition.onstart =
            () => {

                state.listening =
                    true;

                emit(
                    "listening",
                    {
                        active:
                            true
                    }
                );

            };

        recognition.onresult =
            event => {

                let finalText =
                    "";

                for (
                    let i =
                        event.resultIndex;
                    i <
                        event.results.length;
                    i++
                ) {

                    const transcript =
                        event.results[i][0]
                            ?.transcript ||
                        "";

                    if (
                        event.results[i]
                            .isFinal
                    ) {

                        finalText +=
                            transcript;

                    }

                    if (
                        state.ui.input &&
                        !event.results[i]
                            .isFinal
                    ) {

                        state.ui.input.value =
                            transcript;

                    }

                }

                if (
                    finalText
                ) {

                    if (
                        state.ui.input
                    ) {

                        state.ui.input.value =
                            finalText;

                    }

                    sendMessage(
                        finalText
                    );

                    if (
                        state.ui.input
                    ) {

                        state.ui.input.value =
                            "";

                    }

                }

            };

        recognition.onerror =
            event => {

                recordError(
                    event.error ||
                    "VOICE_INPUT_ERROR"
                );

                emit(
                    "voice-error",
                    {
                        error:
                            event.error
                    }
                );

            };

        recognition.onend =
            () => {

                state.listening =
                    false;

                emit(
                    "listening-end"
                );

            };

        try {

            recognition.start();

            state._recognition =
                recognition;

            return true;

        } catch (error) {

            state.listening =
                false;

            recordError(
                error
            );

            return false;

        }

    }

    function stopListening() {

        const recognition =
            state._recognition;

        if (
            recognition &&
            typeof recognition.stop ===
            "function"
        ) {

            try {

                recognition.stop();

            } catch (error) {}

        }

        state.listening =
            false;

        emit(
            "listening-stop"
        );

        return true;

    }

    function languageToSpeechCode(
        language
    ) {

        const mapping = {

            de:
                "de-DE",

            en:
                "en-US",

            tr:
                "tr-TR",

            ar:
                "ar-SA",

            fr:
                "fr-FR",

            es:
                "es-ES",

            it:
                "it-IT",

            nl:
                "nl-NL",

            ru:
                "ru-RU",

            fa:
                "fa-IR",

            ja:
                "ja-JP",

            ko:
                "ko-KR",

            zh:
                "zh-CN",

            ku:
                "ku-TR",

            ez:
                "ku-TR"

        };

        return (
            mapping[
                language
            ] ||
            "de-DE"
        );

    }

    // --------------------------------------------------------
    // WELCOME
    // --------------------------------------------------------

    function showWelcome(
        force = false
    ) {

        if (
            state.messages.length &&
            !force
        ) {

            return false;

        }

        const message =
            createMessage(
                "assistant",
                CONFIG.welcomeMessage,
                {
                    type:
                        "welcome"
                }
            );

        state.lastAssistantMessage =
            message;

        addLocalMessage(
            message
        );

        renderMessages();

        emit(
            "welcome",
            {
                message
            }
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
                Date.now(),

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

            mode:
                CONFIG.mode,

            initialized:
                state.initialized,

            ready:
                state.ready,

            processing:
                state.processing,

            listening:
                state.listening,

            speaking:
                state.speaking,

            currentLanguage:
                state.currentLanguage,

            conversationId:
                state.conversationId,

            messageCount:
                state.messages.length,

            historyCount:
                state.history.length,

            lastUserMessage:
                state.lastUserMessage,

            lastAssistantMessage:
                state.lastAssistantMessage,

            modules: {

                core:
                    Boolean(
                        getCore()
                    ),

                engine:
                    Boolean(
                        getEngine()
                    ),

                commands:
                    Boolean(
                        getCommands()
                    ),

                memory:
                    Boolean(
                        getMemory()
                    ),

                conversation:
                    Boolean(
                        getConversation()
                    ),

                language:
                    Boolean(
                        getLanguage()
                    ),

                speech:
                    Boolean(
                        getSpeech()
                    ),

                voice:
                    Boolean(
                        getVoice()
                    )

            },

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

        createConversation();

        /*
         * Aktuelle Sprache übernehmen.
         */

        const language =
            getLanguage();

        if (
            language &&
            typeof language.getLanguage ===
            "function"
        ) {

            try {

                state.currentLanguage =
                    language.getLanguage();

            } catch (error) {}

        }

        /*
         * Sprachwechsel beobachten.
         */

        if (
            language &&
            typeof language.on ===
            "function"
        ) {

            language.on(
                "language-changed",
                detail => {

                    if (
                        detail?.language
                    ) {

                        state.currentLanguage =
                            detail.language;

                    }

                    emit(
                        "language-changed",
                        detail
                    );

                }
            );

        }

        /*
         * Core Events verbinden.
         */

        const core =
            getCore();

        if (
            core &&
            typeof core.on ===
            "function"
        ) {

            core.on(
                "response",
                detail => {

                    emit(
                        "core-response",
                        detail
                    );

                }
            );

            core.on(
                "error",
                detail => {

                    emit(
                        "core-error",
                        detail
                    );

                }
            );

        }

        /*
         * UI nach DOM-Aufbau verbinden.
         */

        if (
            document.readyState ===
            "loading"
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                () => {

                    connectUI();

                    showWelcome();

                },
                {
                    once:
                        true
                }
            );

        } else {

            connectUI();

            showWelcome();

        }

        /*
         * Kernel registrieren.
         */

        const kernel =
            window.HalDoKernel ||
            window.HalDoOS?.kernel ||
            null;

        if (
            kernel &&
            typeof kernel.registerModule ===
            "function"
        ) {

            try {

                kernel.registerModule(
                    "ai-chat",
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

        sendMessage,

        send,

        ask,

        process,

        requestAI,

        normalizeResponse,

        detectLanguage,

        speak,

        startListening,

        stopListening,

        toggleListening,

        createConversation,

        getConversationId,

        createMessage,

        addMessage:
            saveMessage,

        saveMessage,

        getMessages,

        clearMessages,

        remember,

        connectUI,

        renderMessages,

        showWelcome,

        getStatus

    };

    // --------------------------------------------------------
    // GLOBAL REGISTRATION
    // --------------------------------------------------------

    window.HalDoAIChat =
        api;

    window.HalDoOS.aiChat =
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
                "[HalDoAIChat] " +
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