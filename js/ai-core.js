/*
========================================================
HalDo AI OS 18
AI CORE SERVICE
Professional Ultimate Foundation
Version 18.0.0

Zentrale AI-Orchestrierung

Verbindet:
- AI Engine
- AI Chat
- AI Memory
- Conversation State
- AI Language
- AI Commands
- AI Speech
- AI Voice
- Kernel
- System
- Events
- UI

Wichtig:
Bestehende Module werden NICHT entfernt.
Der Core arbeitet kompatibel mit vorhandenen APIs.
========================================================
*/

(function () {
    "use strict";

    const VERSION = "18.0.0";

    const state = {
        status: "idle",
        initialized: false,
        running: false,
        processing: false,
        requestCount: 0,
        lastRequest: null,
        lastResponse: null,
        language: "de",
        conversationId: null,
        errors: []
    };

    const listeners = new Map();

    /*
    ====================================================
    EVENT SYSTEM
    ====================================================
    */

    function on(eventName, callback) {
        if (
            typeof callback !== "function"
        ) {
            return () => {};
        }

        if (
            !listeners.has(eventName)
        ) {
            listeners.set(
                eventName,
                new Set()
            );
        }

        listeners
            .get(eventName)
            .add(callback);

        return () => off(
            eventName,
            callback
        );
    }

    function off(eventName, callback) {
        const set =
            listeners.get(eventName);

        if (!set) {
            return;
        }

        set.delete(callback);

        if (set.size === 0) {
            listeners.delete(
                eventName
            );
        }
    }

    function emit(eventName, detail = {}) {
        const set =
            listeners.get(eventName);

        if (set) {
            set.forEach(
                callback => {
                    try {
                        callback(detail);
                    } catch (error) {
                        console.error(
                            "[HalDo AI Core] Listener error:",
                            error
                        );
                    }
                }
            );
        }

        try {
            window.dispatchEvent(
                new CustomEvent(
                    "haldo:ai:" + eventName,
                    {
                        detail
                    }
                )
            );
        } catch (error) {
            console.warn(
                "[HalDo AI Core] Event error:",
                error
            );
        }

        /*
         * Kernel Event-Bus verbinden.
         */

        try {
            if (
                window.HalDoKernel &&
                typeof window.HalDoKernel.emit ===
                    "function"
            ) {
                window.HalDoKernel.emit(
                    "ai:" + eventName,
                    detail
                );
            }
        } catch (error) {
            console.warn(
                "[HalDo AI Core] Kernel event error:",
                error
            );
        }
    }

    /*
    ====================================================
    LOGGING
    ====================================================
    */

    function log(...args) {
        console.log(
            "[HalDo AI Core]",
            ...args
        );
    }

    function warn(...args) {
        console.warn(
            "[HalDo AI Core]",
            ...args
        );
    }

    function fail(error) {
        console.error(
            "[HalDo AI Core]",
            error
        );

        state.errors.push({
            time:
                new Date().toISOString(),

            message:
                error?.message ||
                String(error)
        });

        if (
            state.errors.length > 50
        ) {
            state.errors.shift();
        }

        emit(
            "error",
            {
                error
            }
        );
    }

    /*
    ====================================================
    MODULE LOOKUP
    ====================================================
    */

    function getModule(names) {
        const candidates =
            Array.isArray(names)
                ? names
                : [names];

        for (
            const name of candidates
        ) {
            if (
                window[name]
            ) {
                return window[name];
            }
        }

        return null;
    }

    /*
    ====================================================
    MODULE REFERENCES
    ====================================================
    */

    function modules() {
        return {
            engine:
                getModule([
                    "HalDoAIEngine",
                    "HalDoEngine"
                ]),

            chat:
                getModule([
                    "HalDoAIChat",
                    "HalDoChat"
                ]),

            memory:
                getModule([
                    "HalDoAIMemory",
                    "HalDoMemory"
                ]),

            conversation:
                getModule([
                    "HalDoConversationState",
                    "HalDoConversation"
                ]),

            language:
                getModule([
                    "HalDoAILanguage",
                    "HalDoLanguage"
                ]),

            commands:
                getModule([
                    "HalDoAICommands",
                    "HalDoCommands"
                ]),

            speech:
                getModule([
                    "HalDoAISpeech",
                    "HalDoSpeech"
                ]),

            voice:
                getModule([
                    "HalDoAIVoice",
                    "HalDoVoice"
                ])
        };
    }

    /*
    ====================================================
    LANGUAGE
    ====================================================
    */

    function detectLanguage(text) {
        const input =
            String(text || "")
                .trim();

        if (!input) {
            return state.language;
        }

        /*
         * Vorhandenes Language-Modul bevorzugen.
         */

        const language =
            modules().language;

        if (language) {
            try {
                if (
                    typeof language.detect ===
                    "function"
                ) {
                    const detected =
                        language.detect(
                            input
                        );

                    if (
                        detected
                    ) {
                        return String(
                            detected
                        );
                    }
                }

                if (
                    typeof language.detectLanguage ===
                    "function"
                ) {
                    const detected =
                        language.detectLanguage(
                            input
                        );

                    if (
                        detected
                    ) {
                        return String(
                            detected
                        );
                    }
                }
            } catch (error) {
                warn(
                    "Spracherkennung des Language-Moduls fehlgeschlagen.",
                    error
                );
            }
        }

        /*
         * Einfache Fallback-Erkennung.
         */

        if (
            /\b(der|die|das|und|ich|du|wir|bitte|was|wie)\b/i
                .test(input)
        ) {
            return "de";
        }

        if (
            /\b(the|and|you|what|how|please|this|that)\b/i
                .test(input)
        ) {
            return "en";
        }

        if (
            /[êîşçÊÎŞÇ]/i.test(input)
        ) {
            return "ku";
        }

        return state.language;
    }

    /*
    ====================================================
    CONVERSATION ID
    ====================================================
    */

    function createConversationId() {
        return (
            "haldo-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8)
        );
    }

    /*
    ====================================================
    CONVERSATION STATE
    ====================================================
    */

    function ensureConversation() {
        if (
            state.conversationId
        ) {
            return state.conversationId;
        }

        const conversation =
            modules().conversation;

        try {
            if (
                conversation &&
                typeof conversation.create ===
                    "function"
            ) {
                const result =
                    conversation.create();

                if (result) {
                    state.conversationId =
                        String(result);

                    return state.conversationId;
                }
            }
        } catch (error) {
            warn(
                "Conversation State konnte nicht erstellt werden.",
                error
            );
        }

        state.conversationId =
            createConversationId();

        return state.conversationId;
    }

    /*
    ====================================================
    MEMORY
    ====================================================
    */

    function rememberUserMessage(
        message
    ) {
        const memory =
            modules().memory;

        if (!memory) {
            return;
        }

        try {
            if (
                typeof memory.add ===
                "function"
            ) {
                memory.add({
                    type: "user",
                    role: "user",
                    content: message,
                    conversationId:
                        state.conversationId,
                    timestamp:
                        Date.now()
                });

                return;
            }

            if (
                typeof memory.remember ===
                "function"
            ) {
                memory.remember(
                    message
                );
            }

        } catch (error) {
            warn(
                "User-Nachricht konnte nicht gespeichert werden.",
                error
            );
        }
    }

    function rememberAIMessage(
        message
    ) {
        const memory =
            modules().memory;

        if (!memory) {
            return;
        }

        try {
            if (
                typeof memory.add ===
                "function"
            ) {
                memory.add({
                    type: "assistant",
                    role: "assistant",
                    content: message,
                    conversationId:
                        state.conversationId,
                    timestamp:
                        Date.now()
                });

                return;
            }

            if (
                typeof memory.remember ===
                "function"
            ) {
                memory.remember(
                    message
                );
            }

        } catch (error) {
            warn(
                "AI-Antwort konnte nicht gespeichert werden.",
                error
            );
        }
    }

    /*
    ====================================================
    CHAT HISTORY
    ====================================================
    */

    function updateConversation(
        role,
        content
    ) {
        const conversation =
            modules().conversation;

        if (!conversation) {
            return;
        }

        try {
            if (
                typeof conversation.addMessage ===
                "function"
            ) {
                conversation.addMessage({
                    role,
                    content,
                    conversationId:
                        state.conversationId,
                    timestamp:
                        Date.now()
                });

                return;
            }

            if (
                typeof conversation.push ===
                "function"
            ) {
                conversation.push(
                    role,
                    content
                );
            }
        } catch (error) {
            warn(
                "Conversation konnte nicht aktualisiert werden.",
                error
            );
        }
    }

    /*
    ====================================================
    COMMAND PROCESSING
    ====================================================
    */

    async function processCommand(
        message
    ) {
        const commands =
            modules().commands;

        if (!commands) {
            return {
                handled: false
            };
        }

        try {
            if (
                typeof commands.execute ===
                "function"
            ) {
                const result =
                    await commands.execute(
                        message
                    );

                if (
                    result !== undefined &&
                    result !== null
                ) {
                    return {
                        handled: true,
                        result
                    };
                }
            }

            if (
                typeof commands.handle ===
                "function"
            ) {
                const result =
                    await commands.handle(
                        message
                    );

                if (
                    result !== undefined &&
                    result !== null
                ) {
                    return {
                        handled: true,
                        result
                    };
                }
            }

        } catch (error) {
            warn(
                "AI Command konnte nicht ausgeführt werden.",
                error
            );
        }

        return {
            handled: false
        };
    }

    /*
    ====================================================
    ENGINE PROCESSING
    ====================================================
    */

    async function processEngine(
        message,
        context
    ) {
        const engine =
            modules().engine;

        if (!engine) {
            return null;
        }

        try {
            if (
                typeof engine.process ===
                "function"
            ) {
                return await engine.process(
                    message,
                    context
                );
            }

            if (
                typeof engine.generate ===
                "function"
            ) {
                return await engine.generate(
                    message,
                    context
                );
            }

            if (
                typeof engine.ask ===
                "function"
            ) {
                return await engine.ask(
                    message,
                    context
                );
            }

        } catch (error) {
            warn(
                "AI Engine konnte Anfrage nicht verarbeiten.",
                error
            );
        }

        return null;
    }

    /*
    ====================================================
    RESPONSE NORMALIZATION
    ====================================================
    */

    function normalizeResponse(
        response,
        input
    ) {
        if (
            response === null ||
            response === undefined
        ) {
            return null;
        }

        if (
            typeof response === "string"
        ) {
            return {
                text: response,
                raw: response
            };
        }

        if (
            typeof response === "object"
        ) {
            const text =
                response.text ??
                response.message ??
                response.answer ??
                response.content ??
                response.response;

            if (
                text !== undefined
            ) {
                return {
                    text: String(text),
                    raw: response
                };
            }
        }

        return {
            text: String(response),
            raw: response,
            input
        };
    }

    /*
    ====================================================
    FALLBACK RESPONSE
    ====================================================
    */

    function fallbackResponse(
        input
    ) {
        const normalized =
            String(input || "")
                .trim();

        if (!normalized) {
            return "Bitte schreibe eine Anfrage.";
        }

        return (
            "HalDo AI Core ist verbunden und hat deine Anfrage empfangen. " +
            "Die AI-Engine kann jetzt weitere spezialisierte Module verwenden."
        );
    }

    /*
    ====================================================
    SPEECH
    ====================================================
    */

    function speak(text) {
        const voice =
            modules().voice;

        const speech =
            modules().speech;

        try {
            if (
                voice &&
                typeof voice.speak ===
                    "function"
            ) {
                return voice.speak(
                    text
                );
            }

            if (
                speech &&
                typeof speech.speak ===
                    "function"
            ) {
                return speech.speak(
                    text
                );
            }
        } catch (error) {
            warn(
                "Sprachausgabe fehlgeschlagen.",
                error
            );
        }

        return false;
    }

    /*
    ====================================================
    MAIN ASK FUNCTION
    ====================================================
    */

    async function ask(message, options = {}) {
        const input =
            String(message || "")
                .trim();

        if (!input) {
            return {
                ok: false,
                text:
                    "Bitte schreibe eine Anfrage.",
                input: "",
                language:
                    state.language
            };
        }

        if (
            state.processing
        ) {
            return {
                ok: false,
                busy: true,
                text:
                    "HalDo AI verarbeitet bereits eine Anfrage.",
                input
            };
        }

        state.processing = true;
        state.status = "thinking";
        state.requestCount++;

        const started =
            Date.now();

        state.lastRequest = {
            input,
            timestamp:
                new Date().toISOString()
        };

        ensureConversation();

        state.language =
            options.language ||
            detectLanguage(
                input
            );

        emit(
            "thinking",
            {
                input,
                language:
                    state.language,
                conversationId:
                    state.conversationId
            }
        );

        try {
            rememberUserMessage(
                input
            );

            updateConversation(
                "user",
                input
            );

            /*
             * Zuerst Commands prüfen.
             */

            const commandResult =
                await processCommand(
                    input
                );

            if (
                commandResult.handled
            ) {
                const commandResponse =
                    normalizeResponse(
                        commandResult.result,
                        input
                    );

                const text =
                    commandResponse?.text ||
                    fallbackResponse(
                        input
                    );

                rememberAIMessage(
                    text
                );

                updateConversation(
                    "assistant",
                    text
                );

                state.lastResponse = {
                    text,
                    timestamp:
                        new Date().toISOString(),
                    duration:
                        Date.now() -
                        started,
                    source:
                        "command"
                };

                state.status =
                    "answering";

                emit(
                    "response",
                    {
                        text,
                        source:
                            "command",
                        input
                    }
                );

                return {
                    ok: true,
                    text,
                    source:
                        "command",
                    input,
                    language:
                        state.language
                };
            }

            /*
             * Danach AI Engine.
             */

            const context = {
                version:
                    VERSION,

                language:
                    state.language,

                conversationId:
                    state.conversationId,

                requestCount:
                    state.requestCount,

                timestamp:
                    Date.now()
            };

            const engineResult =
                await processEngine(
                    input,
                    context
                );

            const normalized =
                normalizeResponse(
                    engineResult,
                    input
                );

            const text =
                normalized?.text ||
                fallbackResponse(
                    input
                );

            rememberAIMessage(
                text
            );

            updateConversation(
                "assistant",
                text
            );

            state.lastResponse = {
                text,
                timestamp:
                    new Date().toISOString(),
                duration:
                    Date.now() -
                    started,
                source:
                    normalized
                        ? "engine"
                        : "fallback"
            };

            state.status =
                "answering";

            emit(
                "response",
                {
                    text,
                    source:
                        state.lastResponse
                            .source,
                    input,
                    language:
                        state.language
                }
            );

            return {
                ok: true,
                text,
                source:
                    state.lastResponse
                        .source,
                input,
                language:
                    state.language,
                conversationId:
                    state.conversationId
            };

        } catch (error) {
            fail(error);

            state.status =
                "error";

            const text =
                "HalDo AI konnte die Anfrage nicht vollständig verarbeiten.";

            emit(
                "response:error",
                {
                    text,
                    error
                }
            );

            return {
                ok: false,
                text,
                error:
                    error?.message ||
                    String(error),
                input
            };

        } finally {
            state.processing =
                false;

            if (
                state.status ===
                "thinking"
            ) {
                state.status =
                    "idle";
            }

            emit(
                "idle",
                {
                    requestCount:
                        state.requestCount
                }
            );
        }
    }

    /*
    ====================================================
    START / STOP
    ====================================================
    */

    function start() {
        if (
            state.running
        ) {
            return getStatus();
        }

        state.running =
            true;

        state.initialized =
            true;

        state.status =
            "idle";

        ensureConversation();

        emit(
            "start",
            getStatus()
        );

        log(
            "HalDo AI Core gestartet."
        );

        return getStatus();
    }

    function stop() {
        state.running =
            false;

        state.status =
            "stopped";

        emit(
            "stop",
            getStatus()
        );

        log(
            "HalDo AI Core gestoppt."
        );

        return getStatus();
    }

    /*
    ====================================================
    STATUS
    ====================================================
    */

    function getStatus() {
        const refs =
            modules();

        return {
            name:
                "HalDo AI Core",

            version:
                VERSION,

            status:
                state.status,

            running:
                state.running,

            initialized:
                state.initialized,

            processing:
                state.processing,

            requestCount:
                state.requestCount,

            language:
                state.language,

            conversationId:
                state.conversationId,

            modules: {
                engine:
                    Boolean(refs.engine),

                chat:
                    Boolean(refs.chat),

                memory:
                    Boolean(refs.memory),

                conversation:
                    Boolean(refs.conversation),

                language:
                    Boolean(refs.language),

                commands:
                    Boolean(refs.commands),

                speech:
                    Boolean(refs.speech),

                voice:
                    Boolean(refs.voice)
            },

            errors:
                state.errors.length,

            lastRequest:
                state.lastRequest,

            lastResponse:
                state.lastResponse
        };
    }

    /*
    ====================================================
    RESET
    ====================================================
    */

    function resetConversation() {
        state.conversationId =
            createConversationId();

        state.lastRequest =
            null;

        state.lastResponse =
            null;

        emit(
            "conversation:reset",
            {
                conversationId:
                    state.conversationId
            }
        );

        return state.conversationId;
    }

    /*
    ====================================================
    PUBLIC API
    ====================================================
    */

    const HalDoAICore = {
        name:
            "HalDo AI Core",

        version:
            VERSION,

        features: [
            "AI Assistant",
            "AI Engine",
            "Conversation System",
            "AI Memory",
            "Knowledge Integration",
            "Language System",
            "AI Commands",
            "Êzîdî Keyboard Integration",
            "Voice Interface",
            "Speech Interface",
            "Live Light Interface",
            "Kernel Integration",
            "System Integration"
        ],

        start,

        stop,

        ask,

        speak,

        getStatus,

        resetConversation,

        detectLanguage,

        on,

        off,

        emit
    };

    /*
    ====================================================
    GLOBAL REGISTRATION
    ====================================================
    */

    window.HalDoAICore =
        HalDoAICore;

    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.ai =
        HalDoAICore;

    /*
    ====================================================
    KERNEL REGISTRATION
    ====================================================
    */

    function registerWithKernel() {
        try {
            if (
                window.HalDoKernel &&
                typeof window.HalDoKernel.registerModule ===
                    "function"
            ) {
                window.HalDoKernel.registerModule(
                    "ai-core",
                    HalDoAICore
                );
            }
        } catch (error) {
            warn(
                "AI Core konnte nicht beim Kernel registriert werden.",
                error
            );
        }
    }

    /*
    ====================================================
    AUTO INIT
    ====================================================
    */

    function init() {
        registerWithKernel();

        /*
         * Nur initialisieren.
         * Der Boot-Prozess entscheidet über
         * den tatsächlichen Start.
         */

        state.initialized =
            true;

        emit(
            "ready",
            {
                version:
                    VERSION
            }
        );

        log(
            "HalDo AI Core bereit."
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );
    } else {
        init();
    }

})();