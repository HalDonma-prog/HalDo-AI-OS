// ============================================================
// HALDO AI OS 18
// AI CHAT ENGINE
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

        defaultLanguage:
            "de",

        autoSpeak:
            false,

        rememberMessages:
            true,

        enableCommands:
            true,

        enableWriting:
            true,

        enableCorrection:
            true,

        enableReading:
            true,

        enableTranslation:
            true,

        enableSummarization:
            true,

        enableExplanation:
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

        processing:
            false,

        messageCount:
            0,

        conversationId:
            null,

        currentLanguage:
            CONFIG.defaultLanguage,

        lastInput:
            null,

        lastResponse:
            null,

        messages:
            [],

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

    function normalizeText(
        value
    ) {

        return clean(
            value
        )
        .replace(
            /\s+/g,
            " "
        );

    }

    // --------------------------------------------------------
    // MODULE CONNECTIONS
    // --------------------------------------------------------

    function getCore() {

        return (
            window.HalDoAICore ||
            window.HalDoOS?.aiCore ||
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

    function getCommands() {

        return (
            window.HalDoAICommands ||
            window.HalDoOS?.aiCommands ||
            null
        );

    }

    // --------------------------------------------------------
    // CONVERSATION
    // --------------------------------------------------------

    function createConversation() {

        state.conversationId =
            createId(
                "conversation"
            );

        state.messages = [];

        emit(
            "conversation-created",
            {
                conversationId:
                    state.conversationId
            }
        );

        return state.conversationId;

    }

    function ensureConversation() {

        if (
            !state.conversationId
        ) {

            createConversation();

        }

        return state.conversationId;

    }

    function addLocalMessage(
        message
    ) {

        ensureConversation();

        const entry = {

            id:
                message.id ||
                createId(
                    "message"
                ),

            conversationId:
                state.conversationId,

            role:
                message.role ||
                "user",

            type:
                message.type ||
                "text",

            content:
                clean(
                    message.content
                ),

            text:
                clean(
                    message.text ??
                    message.content
                ),

            language:
                message.language ||
                state.currentLanguage,

            timestamp:
                message.timestamp ||
                Date.now(),

            metadata:
                message.metadata ||
                {}

        };

        state.messages.push(
            entry
        );

        state.messageCount++;

        if (
            state.messages.length >
            CONFIG.maxMessages
        ) {

            state.messages.shift();

        }

        emit(
            "message-added",
            {
                message:
                    entry
            }
        );

        return entry;

    }

    function getMessages(
        limit = 50
    ) {

        const amount =
            Math.max(
                1,
                Number(
                    limit
                ) || 50
            );

        return state.messages
            .slice(
                -amount
            );

    }

    function clearConversation() {

        state.messages = [];

        state.messageCount = 0;

        createConversation();

        emit(
            "conversation-cleared",
            {
                conversationId:
                    state.conversationId
            }
        );

        return true;

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

                return language.detectLanguage(
                    text
                );

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

    function getCurrentLanguage() {

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

        return state.currentLanguage;

    }

    // --------------------------------------------------------
    // REQUEST TYPE DETECTION
    // --------------------------------------------------------

    function detectIntent(
        text
    ) {

        const input =
            normalizeText(
                text
            );

        const lower =
            input.toLowerCase();

        const intents = [];

        function add(
            type,
            score,
            reason
        ) {

            intents.push({

                type,
                score,
                reason

            });

        }

        // ----------------------------------------------------
        // GREETING / DIRECT ADDRESS
        // ----------------------------------------------------

        if (
            /^(hallo|hi|hey|hello|moin|guten morgen|guten tag|guten abend|servus)\b/i
                .test(
                    lower
                )
        ) {

            add(
                "greeting",
                1,
                "greeting"
            );

        }

        if (
            /\bhaldo\b/i.test(
                lower
            )
        ) {

            add(
                "direct-address",
                0.95,
                "HalDo direct address"
            );

        }

        // ----------------------------------------------------
        // CORRECTION
        // ----------------------------------------------------

        if (
            /\b(korrigier|korrigiere|korrigieren|rechtschreibung|grammatik|fehler|verbessere|verbessern|zeichensetzung)\b/i
                .test(
                    lower
                )
        ) {

            add(
                "correction",
                0.98,
                "correction request"
            );

        }

        // ----------------------------------------------------
        // FORMULATION
        // ----------------------------------------------------

        if (
            /\b(formulier|formuliere|formulieren|umformulieren|schöner schreiben|besser schreiben|professionell schreiben|freundlich schreiben)\b/i
                .test(
                    lower
                )
        ) {

            add(
                "writing",
                0.98,
                "writing request"
            );

        }

        // ----------------------------------------------------
        // WRITING
        // ----------------------------------------------------

        if (
            /\b(schreib|schreibe|schreiben|erstelle einen text|verfasse|aufsatz|brief|email|e-mail|nachricht|bewerbung|artikel|beitrag)\b/i
                .test(
                    lower
                )
        ) {

            add(
                "writing",
                0.9,
                "writing request"
            );

        }

        // ----------------------------------------------------
        // READING / ANALYSIS
        // ----------------------------------------------------

        if (
            /\b(lies|lesen|lese|analysiere|analyse|prüfe diesen text|erkläre diesen text|was bedeutet dieser text)\b/i
                .test(
                    lower
                )
        ) {

            add(
                "reading",
                0.9,
                "reading/analysis request"
            );

        }

        // ----------------------------------------------------
        // SUMMARY
        // ----------------------------------------------------

        if (
            /\b(zusammenfass|zusammenfassung|kurz zusammen|fasse zusammen|fass zusammen|kurz erklären)\b/i
                .test(
                    lower
                )
        ) {

            add(
                "summarization",
                0.95,
                "summary request"
            );

        }

        // ----------------------------------------------------
        // EXPLANATION
        // ----------------------------------------------------

        if (
            /\b(erklär|erkläre|erklären|was ist|wie funktioniert|warum|wieso)\b/i
                .test(
                    lower
                )
        ) {

            add(
                "explanation",
                0.82,
                "explanation request"
            );

        }

        // ----------------------------------------------------
        // TRANSLATION
        // ----------------------------------------------------

        if (
            /\b(übersetz|übersetze|übersetzen|translation|translate)\b/i
                .test(
                    lower
                )
        ) {

            add(
                "translation",
                0.98,
                "translation request"
            );

        }

        // ----------------------------------------------------
        // COMMAND
        // ----------------------------------------------------

        if (
            /\b(öffne|öffnen|starte|starten|schließe|schließen|zeige|anzeigen|wechsle|wechseln|aktiviere|deaktiviere)\b/i
                .test(
                    lower
                )
        ) {

            add(
                "command",
                0.85,
                "system command"
            );

        }

        // ----------------------------------------------------
        // QUESTION
        // ----------------------------------------------------

        if (
            /\?$/.test(
                input
            ) ||
            /^(was|wer|wie|wo|wann|warum|welche|welcher|welches|kannst du|könntest du)\b/i
                .test(
                    lower
                )
        ) {

            add(
                "question",
                0.65,
                "question"
            );

        }

        intents.sort(
            (
                a,
                b
            ) =>
                b.score -
                a.score
        );

        const best =
            intents[0] ||
            {

                type:
                    "conversation",

                score:
                    0,

                reason:
                    "default"

            };

        return {

            intent:
                best.type,

            confidence:
                best.score,

            reason:
                best.reason,

            candidates:
                intents

        };

    }

    // --------------------------------------------------------
    // TEXT OPERATION
    // --------------------------------------------------------

    function extractTextTarget(
        input
    ) {

        const text =
            clean(
                input
            );

        const patterns = [

            /^korrigiere(?: bitte)?[:\s-]*(.*)$/i,

            /^verbessere(?: bitte)?[:\s-]*(.*)$/i,

            /^formuliere(?: bitte)?[:\s-]*(.*)$/i,

            /^schreibe(?: bitte)?[:\s-]*(.*)$/i,

            /^übersetze(?: bitte)?[:\s-]*(.*)$/i,

            /^fasse(?: bitte)? zusammen[:\s-]*(.*)$/i

        ];

        for (
            const pattern of patterns
        ) {

            const match =
                text.match(
                    pattern
                );

            if (
                match &&
                match[1]
            ) {

                return clean(
                    match[1]
                );

            }

        }

        return text;

    }

    // --------------------------------------------------------
    // SPECIAL GREETING
    // --------------------------------------------------------

    function createGreetingResponse(
        input,
        language
    ) {

        const lower =
            clean(
                input
            ).toLowerCase();

        const addressed =
            lower.includes(
                "haldo"
            );

        if (
            language ===
            "en"
        ) {

            return addressed
                ? "Hallo! 💙❤️ I am HalDo AI. How can I help you?"
                : "Hello! 💙❤️ How can I help you?";

        }

        if (
            language ===
            "ku"
        ) {

            return addressed
                ? "Silav! 💙❤️ Ez HalDo AI me. Ez amade me ku alîkariya te bikim."
                : "Silav! 💙❤️ Ez çawa dikarim alîkariya te bikim?";

        }

        if (
            language ===
            "tr"
        ) {

            return addressed
                ? "Merhaba! 💙❤️ Ben HalDo AI. Sana nasıl yardımcı olabilirim?"
                : "Merhaba! 💙❤️ Nasıl yardımcı olabilirim?";

        }

        if (
            language ===
            "ar"
        ) {

            return addressed
                ? "مرحباً! 💙❤️ أنا HalDo AI. كيف يمكنني مساعدتك؟"
                : "مرحباً! 💙❤️ كيف يمكنني مساعدتك؟";

        }

        return addressed
            ? "Hallo! 💙❤️ Ich bin HalDo AI. Wie kann ich dir helfen?"
            : "Hallo! 💙❤️ Wie kann ich dir helfen?";

    }

    // --------------------------------------------------------
    // CORE REQUEST
    // --------------------------------------------------------

    async function request(
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
                    "EMPTY_INPUT",

                text:
                    ""

            };

        }

        ensureConversation();

        state.processing =
            true;

        const requestId =
            createId(
                "chat-request"
            );

        const startedAt =
            Date.now();

        const detected =
            detectLanguage(
                text
            );

        const language =
            detected?.language ||
            getCurrentLanguage();

        state.currentLanguage =
            language;

        const intent =
            detectIntent(
                text
            );

        const userMessage =
            addLocalMessage({

                role:
                    "user",

                type:
                    "user-input",

                content:
                    text,

                text:
                    text,

                language,

                metadata: {

                    requestId,

                    intent:
                        intent.intent

                }

            });

        emit(
            "request-start",
            {

                requestId,

                input:
                    text,

                language,

                intent

            }
        );

        try {

            // ------------------------------------------------
            // GREETING
            // ------------------------------------------------

            if (
                (
                    intent.intent ===
                    "greeting" ||
                    intent.intent ===
                    "direct-address"
                ) &&
                !options.forceAI
            ) {

                const greeting =
                    createGreetingResponse(
                        text,
                        language
                    );

                return await finishResponse({

                    ok:
                        true,

                    type:
                        "greeting",

                    requestId,

                    text:
                        greeting,

                    content:
                        greeting,

                    language,

                    intent:
                        intent.intent,

                    duration:
                        Date.now() -
                        startedAt

                }, options);

            }

            // ------------------------------------------------
            // SYSTEM COMMAND
            // ------------------------------------------------

            if (
                intent.intent ===
                "command" &&
                CONFIG.enableCommands &&
                !options.forceAI
            ) {

                const commands =
                    getCommands();

                if (
                    commands &&
                    typeof commands.execute ===
                    "function"
                ) {

                    try {

                        const commandResult =
                            await commands.execute(
                                text,
                                options
                            );

                        if (
                            commandResult &&
                            (
                                commandResult.ok ||
                                commandResult.result ||
                                commandResult.requiresConfirmation
                            )
                        ) {

                            const commandText =
                                commandResult.text ||
                                commandResult.message ||
                                (
                                    typeof commandResult.result ===
                                    "string"
                                        ? commandResult.result
                                        : "Der Befehl wurde verarbeitet."
                                );

                            return await finishResponse({

                                ok:
                                    commandResult.ok !==
                                    false,

                                type:
                                    "command",

                                requestId,

                                text:
                                    commandText,

                                content:
                                    commandText,

                                language,

                                intent:
                                    "command",

                                command:
                                    commandResult.command ||
                                    null,

                                result:
                                    commandResult,

                                duration:
                                    Date.now() -
                                    startedAt

                            }, options);

                        }

                    } catch (error) {

                        recordError(
                            error
                        );

                    }

                }

            }

            // ------------------------------------------------
            // AI CORE
            // ------------------------------------------------

            const core =
                getCore();

            if (
                core &&
                typeof core.process ===
                "function"
            ) {

                const result =
                    await core.process(
                        text,
                        {

                            ...options,

                            source:
                                "ai-chat",

                            chatRequestId:
                                requestId,

                            intent,

                            language,

                            textOperation:
                                intent.intent ===
                                    "writing" ||
                                intent.intent ===
                                    "correction" ||
                                intent.intent ===
                                    "reading" ||
                                intent.intent ===
                                    "translation" ||
                                intent.intent ===
                                    "summarization" ||
                                intent.intent ===
                                    "explanation",

                            targetText:
                                extractTextTarget(
                                    text
                                ),

                            chatHistory:
                                getMessages(
                                    options.historyLimit ||
                                    50
                                )

                        }
                    );

                if (
                    result
                ) {

                    return await finishResponse({

                        ...result,

                        requestId:

                            result.requestId ||
                            requestId,

                        language:
                            result.language ||
                            language,

                        intent:
                            intent.intent,

                        duration:
                            Date.now() -
                            startedAt

                    }, options);

                }

            }

            // ------------------------------------------------
            // NO CORE AVAILABLE
            // ------------------------------------------------

            const fallback =
                "HalDo AI ist bereit, aber momentan ist kein AI-Provider verbunden.";

            return await finishResponse({

                ok:
                    false,

                type:
                    "no-ai-provider",

                requestId,

                text:
                    fallback,

                content:
                    fallback,

                language,

                intent:
                    intent.intent,

                duration:
                    Date.now() -
                    startedAt

            }, options);

        } catch (error) {

            recordError(
                error
            );

            return await finishResponse({

                ok:
                    false,

                type:
                    "error",

                requestId,

                text:
                    error.message ||
                    "Bei der AI-Verarbeitung ist ein Fehler aufgetreten.",

                content:
                    error.message ||
                    "Bei der AI-Verarbeitung ist ein Fehler aufgetreten.",

                language,

                intent:
                    intent.intent,

                error:
                    error.message,

                duration:
                    Date.now() -
                    startedAt

            }, options);

        } finally {

            state.processing =
                false;

            emit(
                "request-end",
                {
                    requestId
                }
            );

        }

    }

    // --------------------------------------------------------
    // RESPONSE FINALIZATION
    // --------------------------------------------------------

    async function finishResponse(
        response,
        options = {}
    ) {

        const normalized = {

            ok:
                response.ok !==
                false,

            type:
                response.type ||
                "text",

            requestId:
                response.requestId ||
                createId(
                    "response"
                ),

            text:
                clean(
                    response.text ??
                    response.content
                ),

            content:
                clean(
                    response.content ??
                    response.text
                ),

            language:
                response.language ||
                state.currentLanguage,

            intent:
                response.intent ||
                "conversation",

            timestamp:
                Date.now(),

            duration:
                response.duration ||
                0,

            result:
                response.result ??
                null

        };

        state.lastInput =
            state.messages[
                state.messages.length - 1
            ] || null;

        state.lastResponse =
            normalized;

        addLocalMessage({

            role:
                "assistant",

            type:
                normalized.type,

            content:
                normalized.content,

            text:
                normalized.text,

            language:
                normalized.language,

            metadata: {

                requestId:
                    normalized.requestId,

                intent:
                    normalized.intent

            }

        });

        // ----------------------------------------------------
        // Conversation State
        // ----------------------------------------------------

        const conversation =
            getConversation();

        if (
            conversation &&
            typeof conversation.addMessage ===
            "function"
        ) {

            try {

                await conversation.addMessage({

                    role:
                        "assistant",

                    content:
                        normalized.content,

                    text:
                        normalized.text,

                    language:
                        normalized.language,

                    type:
                        normalized.type,

                    requestId:
                        normalized.requestId,

                    timestamp:
                        normalized.timestamp

                });

            } catch (error) {}

        }

        // ----------------------------------------------------
        // Memory
        // ----------------------------------------------------

        if (
            CONFIG.rememberMessages
        ) {

            const memory =
                getMemory();

            if (
                memory
            ) {

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
                        typeof memory[method] !==
                        "function"
                    ) {
                        continue;
                    }

                    try {

                        await memory[method]({

                            type:
                                "chat",

                            requestId:
                                normalized.requestId,

                            user:
                                state.lastInput?.text ||
                                "",

                            assistant:
                                normalized.text,

                            language:
                                normalized.language,

                            intent:
                                normalized.intent,

                            timestamp:
                                normalized.timestamp

                        });

                        break;

                    } catch (error) {}

                }

            }

        }

        // ----------------------------------------------------
        // Optional Speech
        // ----------------------------------------------------

        if (
            options.speak ||
            CONFIG.autoSpeak
        ) {

            try {

                await speak(
                    normalized.text,
                    options
                );

            } catch (error) {

                recordError(
                    error
                );

            }

        }

        emit(
            "response",
            {

                response:
                    normalized

            }
        );

        return normalized;

    }

    // --------------------------------------------------------
    // SPEECH
    // --------------------------------------------------------

    async function speak(
        text,
        options = {}
    ) {

        const value =
            clean(
                text
            );

        if (!value) {

            return {

                ok:
                    false,

                error:
                    "EMPTY_SPEECH_TEXT"

            };

        }

        const targets = [

            getVoice(),
            getSpeech()

        ];

        for (
            const target of targets
        ) {

            if (!target) {
                continue;
            }

            for (
                const method of [
                    "speak",
                    "say",
                    "synthesize"
                ]
            ) {

                if (
                    typeof target[method] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await target[method](
                            value,
                            {

                                ...options,

                                language:
                                    options.language ||
                                    state.currentLanguage

                            }
                        );

                    emit(
                        "speech",
                        {

                            text:
                                value,

                            language:
                                state.currentLanguage

                        }
                    );

                    return {

                        ok:
                            result !==
                            false,

                        result

                    };

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

            error:
                "VOICE_ENGINE_UNAVAILABLE"

        };

    }

    // --------------------------------------------------------
    // PUBLIC SHORTCUTS
    // --------------------------------------------------------

    async function sendMessage(
        input,
        options = {}
    ) {

        return request(
            input,
            options
        );

    }

    async function send(
        input,
        options = {}
    ) {

        return request(
            input,
            options
        );

    }

    async function ask(
        input,
        options = {}
    ) {

        return request(
            input,
            options
        );

    }

    async function processMessage(
        input,
        options = {}
    ) {

        return request(
            input,
            options
        );

    }

    // --------------------------------------------------------
    // TEXT TOOLS
    // --------------------------------------------------------

    async function correct(
        text,
        options = {}
    ) {

        return request(
            `Korrigiere den folgenden Text vollständig. Behalte die Aussage bei und korrigiere Rechtschreibung, Grammatik und Zeichensetzung:\n\n${clean(text)}`,
            {

                ...options,

                forceAI:
                    true,

                operation:
                    "correction"

            }
        );

    }

    async function formulate(
        text,
        options = {}
    ) {

        return request(
            `Formuliere den folgenden Text besser und natürlich. Behalte die ursprüngliche Bedeutung bei:\n\n${clean(text)}`,
            {

                ...options,

                forceAI:
                    true,

                operation:
                    "writing"

            }
        );

    }

    async function summarize(
        text,
        options = {}
    ) {

        return request(
            `Fasse den folgenden Text verständlich und kompakt zusammen:\n\n${clean(text)}`,
            {

                ...options,

                forceAI:
                    true,

                operation:
                    "summarization"

            }
        );

    }

    async function explain(
        text,
        options = {}
    ) {

        return request(
            `Erkläre den folgenden Inhalt verständlich:\n\n${clean(text)}`,
            {

                ...options,

                forceAI:
                    true,

                operation:
                    "explanation"

            }
        );

    }

    async function translateText(
        text,
        targetLanguage,
        options = {}
    ) {

        const target =
            clean(
                targetLanguage
            ) ||
            "de";

        return request(
            `Übersetze den folgenden Text in ${target}. Erhalte Bedeutung und Kontext:\n\n${clean(text)}`,
            {

                ...options,

                forceAI:
                    true,

                operation:
                    "translation",

                targetLanguage:
                    target

            }
        );

    }

    async function analyzeText(
        text,
        options = {}
    ) {

        return request(
            `Analysiere den folgenden Text. Erkenne Inhalt, Sprache, mögliche Fehler, wichtige Aussagen und Verbesserungsmöglichkeiten:\n\n${clean(text)}`,
            {

                ...options,

                forceAI:
                    true,

                operation:
                    "analysis"

            }
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

            messageCount:
                state.messageCount,

            conversationId:
                state.conversationId,

            currentLanguage:
                state.currentLanguage,

            messages:
                state.messages.length,

            capabilities: {

                writing:
                    CONFIG.enableWriting,

                correction:
                    CONFIG.enableCorrection,

                reading:
                    CONFIG.enableReading,

                translation:
                    CONFIG.enableTranslation,

                summarization:
                    CONFIG.enableSummarization,

                explanation:
                    CONFIG.enableExplanation,

                commands:
                    CONFIG.enableCommands,

                speech:
                    Boolean(
                        getSpeech() ||
                        getVoice()
                    )

            },

            modules: {

                core:
                    Boolean(
                        getCore()
                    ),

                language:
                    Boolean(
                        getLanguage()
                    ),

                memory:
                    Boolean(
                        getMemory()
                    ),

                conversation:
                    Boolean(
                        getConversation()
                    ),

                commands:
                    Boolean(
                        getCommands()
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

            lastResponse:
                state.lastResponse,

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

        state.currentLanguage =
            getCurrentLanguage();

        ensureConversation();

        // ----------------------------------------------------
        // Core Events
        // ----------------------------------------------------

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

        // ----------------------------------------------------
        // Language Events
        // ----------------------------------------------------

        const language =
            getLanguage();

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

        // ----------------------------------------------------
        // Kernel
        // ----------------------------------------------------

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

        request,

        process:
            request,

        sendMessage,

        send,

        ask,

        processMessage,

        correct,

        formulate,

        summarize,

        explain,

        translate:
            translateText,

        analyzeText,

        detectIntent,

        detectLanguage,

        getMessages,

        addMessage:
            addLocalMessage,

        createConversation,

        clearConversation,

        speak,

        getStatus,

        getModules: () => ({

            core:
                getCore(),

            language:
                getLanguage(),

            memory:
                getMemory(),

            conversation:
                getConversation(),

            commands:
                getCommands(),

            speech:
                getSpeech(),

            voice:
                getVoice()

        })

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