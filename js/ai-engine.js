// ============================================================
// HALDO AI OS 18
// AI ENGINE
// PROFESSIONAL ULTIMATE FOUNDATION
// PART 85
// ============================================================

(function (window, document) {

    "use strict";

    if (
        window.HalDoAIEngine &&
        window.HalDoAIEngine.__haldoAI18
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    // ========================================================
    // CONFIGURATION
    // ========================================================

    const CONFIG = {

        name:
            "HalDo AI Engine",

        version:
            "18.0.0",

        mode:
            "Professional Ultimate Foundation",

        maxHistory:
            500,

        maxTextLength:
            100000,

        defaultLanguage:
            "de",

        minimumProviderConfidence:
            0.50,

        enableCorrection:
            true,

        enableWriting:
            true,

        enableReading:
            true,

        enableRewriting:
            true,

        enableSummarization:
            true,

        enableTranslation:
            true,

        enableAnalysis:
            true,

        enableMemory:
            true,

        enableConversation:
            true,

        enableLocalProcessing:
            true

    };

    // ========================================================
    // STATE
    // ========================================================

    const state = {

        initialized:
            false,

        ready:
            false,

        processing:
            false,

        requestCount:
            0,

        successfulRequests:
            0,

        failedRequests:
            0,

        lastRequest:
            null,

        lastResponse:
            null,

        currentLanguage:
            CONFIG.defaultLanguage,

        provider:
            null,

        providers:
            {},

        history:
            [],

        errors:
            [],

        capabilities:
            {

                correction:
                    CONFIG.enableCorrection,

                writing:
                    CONFIG.enableWriting,

                reading:
                    CONFIG.enableReading,

                rewriting:
                    CONFIG.enableRewriting,

                summarization:
                    CONFIG.enableSummarization,

                translation:
                    CONFIG.enableTranslation,

                analysis:
                    CONFIG.enableAnalysis

            }

    };

    // ========================================================
    // EVENTS
    // ========================================================

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

                } catch (error) {

                    console.error(
                        "[HalDoAIEngine]",
                        error
                    );

                }

            }

        }

        try {

            document.dispatchEvent(
                new CustomEvent(
                    `haldo:ai-engine:${event}`,
                    {
                        detail
                    }
                )
            );

        } catch (error) {}

    }

    // ========================================================
    // UTILITIES
    // ========================================================

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
        prefix = "engine"
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

    function limitText(
        text
    ) {

        const value =
            clean(
                text
            );

        if (
            value.length <=
            CONFIG.maxTextLength
        ) {

            return value;

        }

        return value.slice(
            0,
            CONFIG.maxTextLength
        );

    }

    // ========================================================
    // MODULE CONNECTIONS
    // ========================================================

    function getCore() {

        return (
            window.HalDoAICore ||
            window.HalDoOS?.aiCore ||
            null
        );

    }

    function getChat() {

        return (
            window.HalDoAIChat ||
            window.HalDoOS?.aiChat ||
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

    function getKernel() {

        return (
            window.HalDoKernel ||
            window.HalDoOS?.kernel ||
            null
        );

    }

    // ========================================================
    // LANGUAGE
    // ========================================================

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

    // ========================================================
    // TEXT TYPE DETECTION
    // ========================================================

    function detectTask(
        input,
        options = {}
    ) {

        const text =
            normalize(
                input
            );

        if (
            options.task
        ) {

            return normalize(
                options.task
            );

        }

        /*
         * Korrektur
         */

        if (
            /rechtschreib|grammatik|grammatikal|fehler|korrigier|korrektur|verbessere den text|korrigiere den text|correct|grammar|spell/.test(
                text
            )
        ) {

            return "correction";

        }

        /*
         * Formulieren
         */

        if (
            /formuliere|formulieren|schreib|schreiben|verfasse|erstelle einen text|text erstellen|write|writing|compose|draft/.test(
                text
            )
        ) {

            return "writing";

        }

        /*
         * Umschreiben
         */

        if (
            /umschreib|umformulieren|anders formulieren|professioneller|freundlicher|kürzer|länger|rewrite|rephrase|paraphrase/.test(
                text
            )
        ) {

            return "rewriting";

        }

        /*
         * Zusammenfassung
         */

        if (
            /zusammenfass|kurz zusammen|kurzfassung|fasse .* zusammen|summary|summarize/.test(
                text
            )
        ) {

            return "summarization";

        }

        /*
         * Übersetzung
         */

        if (
            /übersetz|translation|translate|auf deutsch|auf englisch|auf kurdisch|auf êzîdî|auf ezidi/.test(
                text
            )
        ) {

            return "translation";

        }

        /*
         * Analyse / Lesen
         */

        if (
            /analys|erkläre|erklär|lies|lese|verstehe|bedeutung|analyse|analyze|explain|read/.test(
                text
            )
        ) {

            return "analysis";

        }

        return "conversation";

    }

    // ========================================================
    // TEXT ANALYSIS
    // ========================================================

    function analyzeText(
        text
    ) {

        const value =
            limitText(
                text
            );

        const words =
            value
                ? value.split(
                    /\s+/
                ).filter(
                    Boolean
                )
                : [];

        const sentences =
            value
                ? value
                    .split(
                        /[.!?]+/
                    )
                    .map(
                        item =>
                            item.trim()
                    )
                    .filter(
                        Boolean
                    )
                : [];

        const paragraphs =
            value
                ? value
                    .split(
                        /\n\s*\n/
                    )
                    .map(
                        item =>
                            item.trim()
                    )
                    .filter(
                        Boolean
                    )
                : [];

        const characters =
            value.length;

        const letters =
            (
                value.match(
                    /[A-Za-zÄÖÜäöüßÀ-ÿ]/g
                ) ||
                []
            ).length;

        const numbers =
            (
                value.match(
                    /\d/g
                ) ||
                []
            ).length;

        const questionMarks =
            (
                value.match(
                    /\?/g
                ) ||
                []
            ).length;

        const exclamations =
            (
                value.match(
                    /!/g
                ) ||
                []
            ).length;

        const averageWordsPerSentence =
            sentences.length
                ? Number(
                    (
                        words.length /
                        sentences.length
                    ).toFixed(
                        2
                    )
                )
                : 0;

        return {

            ok:
                true,

            type:
                "text-analysis",

            text:
                value,

            statistics: {

                characters,

                letters,

                numbers,

                words:
                    words.length,

                sentences:
                    sentences.length,

                paragraphs:
                    paragraphs.length,

                questionMarks,

                exclamations,

                averageWordsPerSentence

            },

            language:
                detectLanguage(
                    value
                )

        };

    }

    // ========================================================
    // LOCAL CORRECTION ENGINE
    // ========================================================

    function correctBasicGerman(
        text
    ) {

        let result =
            clean(
                text
            );

        const corrections = [];

        /*
         * Häufige einfache Fehler.
         */

        const replacements = [

            [
                /\bseid dem\b/gi,
                "seit dem"
            ],

            [
                /\bseid ihr\b/gi,
                "seid ihr"
            ],

            [
                /\bseit ihr\b/gi,
                "seid ihr"
            ],

            [
                /\bseid gestern\b/gi,
                "seit gestern"
            ],

            [
                /\bseid heute\b/gi,
                "seit heute"
            ],

            [
                /\bdas selbe\b/gi,
                "dasselbe"
            ],

            [
                /\bzum Beispiel\b/gi,
                "zum Beispiel"
            ],

            [
                /\baufjedenfall\b/gi,
                "auf jeden Fall"
            ],

            [
                /\bimmernoch\b/gi,
                "immer noch"
            ],

            [
                /\nvielen dank\b/gi,
                "\nVielen Dank"
            ],

            [
                /\bHallo,\s*ich\b/g,
                "Hallo, ich"
            ]

        ];

        for (
            const [
                pattern,
                replacement
            ] of replacements
        ) {

            const before =
                result;

            result =
                result.replace(
                    pattern,
                    replacement
                );

            if (
                before !==
                result
            ) {

                corrections.push({

                    type:
                        "spelling",

                    replacement

                });

            }

        }

        /*
         * Mehrfache Leerzeichen.
         */

        const beforeSpaces =
            result;

        result =
            result
                .replace(
                    /[ \t]+/g,
                    " "
                )
                .replace(
                    /\n{3,}/g,
                    "\n\n"
                )
                .trim();

        if (
            beforeSpaces !==
            result
        ) {

            corrections.push({

                type:
                    "spacing",

                description:
                    "Überflüssige Leerzeichen bereinigt."

            });

        }

        /*
         * Leerzeichen vor Satzzeichen.
         */

        const beforePunctuation =
            result;

        result =
            result.replace(
                /\s+([,.!?;:])/g,
                "$1"
            );

        if (
            beforePunctuation !==
            result
        ) {

            corrections.push({

                type:
                    "punctuation",

                description:
                    "Satzzeichen korrigiert."

            });

        }

        /*
         * Satzanfang groß schreiben.
         */

        result =
            result.replace(
                /(^|[.!?]\s+)([a-zäöü])/g,
                (
                    match,
                    prefix,
                    letter
                ) =>
                    prefix +
                    letter.toUpperCase()
            );

        return {

            ok:
                true,

            type:
                "correction",

            original:
                text,

            corrected:
                result,

            changed:
                result !==
                clean(
                    text
                ),

            corrections,

            limitations: [

                "Die lokale Korrektur ist keine vollständige linguistische Grammatikprüfung.",

                "Für eine vollständige semantische Korrektur wird ein aktiver AI-Provider benötigt."

            ]

        };

    }

    // ========================================================
    // LOCAL WRITING ENGINE
    // ========================================================

    function localWriting(
        input,
        options = {}
    ) {

        const task =
            detectTask(
                input,
                options
            );

        if (
            task ===
            "correction"
        ) {

            return correctBasicGerman(
                input
            );

        }

        if (
            task ===
            "analysis"
        ) {

            return analyzeText(
                input
            );

        }

        /*
         * Kein erfundener AI-Text.
         */

        return {

            ok:
                false,

            type:
                "local-writing-unavailable",

            message:
                "Für diese Schreibaufgabe ist ein aktiver AI-Provider erforderlich.",

            task,

            input

        };

    }

    // ========================================================
    // PROVIDER SYSTEM
    // ========================================================

    function registerProvider(
        id,
        provider
    ) {

        const key =
            normalize(
                id
            );

        if (
            !key ||
            !provider
        ) {

            return false;

        }

        state.providers[
            key
        ] =
            provider;

        if (
            !state.provider
        ) {

            state.provider =
                key;

        }

        emit(
            "provider-registered",
            {

                id:
                    key,

                provider

            }
        );

        return true;

    }

    function unregisterProvider(
        id
    ) {

        const key =
            normalize(
                id
            );

        if (
            !state.providers[
                key
            ]
        ) {

            return false;

        }

        delete state.providers[
            key
        ];

        if (
            state.provider ===
            key
        ) {

            state.provider =
                Object.keys(
                    state.providers
                )[0] ||
                null;

        }

        emit(
            "provider-unregistered",
            {
                id:
                    key
            }
        );

        return true;

    }

    function setProvider(
        id
    ) {

        const key =
            normalize(
                id
            );

        if (
            !state.providers[
                key
            ]
        ) {

            return {

                ok:
                    false,

                error:
                    "PROVIDER_NOT_FOUND"

            };

        }

        state.provider =
            key;

        emit(
            "provider-changed",
            {
                provider:
                    key
            }
        );

        return {

            ok:
                true,

            provider:
                key

        };

    }

    function getProvider() {

        if (
            state.provider &&
            state.providers[
                state.provider
            ]
        ) {

            return state.providers[
                state.provider
            ];

        }

        const first =
            Object.keys(
                state.providers
            )[0];

        return first
            ? state.providers[
                first
            ]
            : null;

    }

    // ========================================================
    // PROVIDER EXECUTION
    // ========================================================

    async function executeProvider(
        input,
        context = {}
    ) {

        const provider =
            getProvider();

        if (
            !provider
        ) {

            return null;

        }

        const methods = [

            "generate",
            "generateResponse",
            "respond",
            "process",
            "ask",
            "complete",
            "chat"

        ];

        for (
            const method of methods
        ) {

            if (
                typeof provider[
                    method
                ] !==
                "function"
            ) {
                continue;
            }

            try {

                const result =
                    await provider[
                        method
                    ](
                        input,
                        context
                    );

                if (
                    result !==
                    undefined &&
                    result !==
                    null
                ) {

                    return normalizeResult(
                        result,
                        context
                    );

                }

            } catch (error) {

                recordError(
                    error
                );

            }

        }

        return null;

    }

    // ========================================================
    // CHAT FALLBACK
    // ========================================================

    async function executeChat(
        input,
        context = {}
    ) {

        const chat =
            getChat();

        if (
            !chat
        ) {

            return null;

        }

        const methods = [

            "sendMessage",
            "send",
            "ask",
            "respond",
            "processMessage"

        ];

        for (
            const method of methods
        ) {

            if (
                typeof chat[
                    method
                ] !==
                "function"
            ) {
                continue;
            }

            try {

                const result =
                    await chat[
                        method
                    ](
                        input,
                        context
                    );

                if (
                    result !==
                    undefined &&
                    result !==
                    null
                ) {

                    return normalizeResult(
                        result,
                        context
                    );

                }

            } catch (error) {

                recordError(
                    error
                );

            }

        }

        return null;

    }

    // ========================================================
    // RESULT NORMALIZATION
    // ========================================================

    function normalizeResult(
        result,
        context = {}
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
                    result,

                task:
                    context.task ||
                    "conversation",

                language:
                    context.language ||
                    state.currentLanguage

            };

        }

        if (
            typeof result !==
            "object"
        ) {

            return {

                ok:
                    true,

                type:
                    "value",

                value:
                    result,

                task:
                    context.task ||
                    "conversation"

            };

        }

        const text =
            result.text ??
            result.content ??
            result.message ??
            "";

        return {

            ok:
                result.ok !== false,

            ...result,

            text:
                clean(
                    text
                ),

            content:
                result.content ??
                clean(
                    text
                ),

            task:
                result.task ||
                context.task ||
                "conversation",

            language:
                result.language ||
                context.language ||
                state.currentLanguage

        };

    }

    // ========================================================
    // MEMORY
    // ========================================================

    async function recall(
        query,
        options = {}
    ) {

        if (
            !CONFIG.enableMemory
        ) {

            return [];

        }

        const memory =
            getMemory();

        if (
            !memory
        ) {

            return [];

        }

        for (
            const method of [
                "recall",
                "search",
                "find",
                "query",
                "retrieve"
            ]
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

                const result =
                    await memory[
                        method
                    ](
                        query,
                        options
                    );

                if (
                    Array.isArray(
                        result
                    )
                ) {

                    return result;

                }

                if (
                    result
                ) {

                    return [
                        result
                    ];

                }

            } catch (error) {}

        }

        return [];

    }

    async function remember(
        data
    ) {

        if (
            !CONFIG.enableMemory
        ) {

            return false;

        }

        const memory =
            getMemory();

        if (
            !memory
        ) {

            return false;

        }

        for (
            const method of [
                "remember",
                "add",
                "store",
                "save",
                "rememberMessage"
            ]
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
                    data
                );

                return true;

            } catch (error) {}

        }

        return false;

    }

    // ========================================================
    // CONVERSATION
    // ========================================================

    function getConversationMessages(
        limit = 50
    ) {

        if (
            !CONFIG.enableConversation
        ) {

            return [];

        }

        const conversation =
            getConversation();

        if (
            !conversation
        ) {

            return [];

        }

        for (
            const method of [
                "getMessages",
                "getHistory",
                "getConversation"
            ]
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

                const result =
                    conversation[
                        method
                    ](
                        limit
                    );

                if (
                    Array.isArray(
                        result
                    )
                ) {

                    return result;

                }

            } catch (error) {}

        }

        return [];

    }

    // ========================================================
    // MAIN ENGINE
    // ========================================================

    async function process(
        input,
        options = {}
    ) {

        const text =
            limitText(
                input
            );

        if (!text) {

            return {

                ok:
                    false,

                type:
                    "error",

                error:
                    "EMPTY_INPUT",

                message:
                    "Keine Eingabe vorhanden."

            };

        }

        const requestId =
            createId(
                "request"
            );

        const startedAt =
            Date.now();

        state.processing =
            true;

        state.requestCount++;

        const language =
            detectLanguage(
                text
            );

        const task =
            detectTask(
                text,
                options
            );

        const memories =
            await recall(
                text,
                {
                    limit:
                        options.memoryLimit ||
                        10
                }
            );

        const request = {

            id:
                requestId,

            input:
                text,

            task,

            language:
                language?.language ||
                state.currentLanguage,

            timestamp:
                startedAt,

            options

        };

        state.lastRequest =
            request;

        emit(
            "request-start",
            {
                request
            }
        );

        try {

            /*
             * Kontext für Provider und Chat.
             */

            const context = {

                requestId,

                task,

                language:
                    request.language,

                languageDetection:
                    language,

                memories,

                messages:
                    getConversationMessages(
                        options.historyLimit ||
                        50
                    ),

                mode:
                    CONFIG.mode,

                engine:
                    {

                        name:
                            CONFIG.name,

                        version:
                            CONFIG.version

                    }

            };

            emit(
                "task-detected",
                {

                    request,

                    task,

                    context

                }
            );

            /*
             * Lokale Analyse.
             */

            if (
                task ===
                "analysis" &&
                options.localOnly !==
                false
            ) {

                const analysis =
                    analyzeText(
                        text
                    );

                if (
                    options.preferLocal ||
                    !getProvider()
                ) {

                    return finalize(
                        analysis,
                        request,
                        startedAt
                    );

                }

            }

            /*
             * Lokale Korrektur zuerst,
             * wenn ausdrücklich gewünscht.
             */

            if (
                task ===
                "correction" &&
                options.localOnly ===
                true
            ) {

                return finalize(
                    correctBasicGerman(
                        text
                    ),
                    request,
                    startedAt
                );

            }

            /*
             * 1. Externer/registrierter Provider
             */

            let result =
                await executeProvider(
                    text,
                    context
                );

            /*
             * 2. AI Chat
             */

            if (
                !result
            ) {

                result =
                    await executeChat(
                        text,
                        context
                    );

            }

            /*
             * 3. Lokale Verarbeitung
             */

            if (
                !result &&
                CONFIG.enableLocalProcessing
            ) {

                result =
                    localWriting(
                        text,
                        {
                            ...options,
                            task
                        }
                    );

            }

            /*
             * Kein Provider und keine
             * lokale Antwort.
             */

            if (
                !result
            ) {

                result = {

                    ok:
                        false,

                    type:
                        "no-provider",

                    task,

                    text:
                        "",

                    message:
                        "Kein aktiver AI-Provider ist momentan verbunden."

                };

            }

            return finalize(
                result,
                request,
                startedAt
            );

        } catch (error) {

            state.failedRequests++;

            recordError(
                error
            );

            const response = {

                ok:
                    false,

                type:
                    "error",

                requestId,

                task,

                input:
                    text,

                language:
                    request.language,

                error:
                    error?.message ||
                    String(
                        error
                    ),

                timestamp:
                    Date.now(),

                duration:
                    Date.now() -
                    startedAt

            };

            state.lastResponse =
                response;

            emit(
                "response-error",
                {
                    response,
                    error
                }
            );

            return response;

        } finally {

            state.processing =
                false;

            request.finishedAt =
                Date.now();

            request.duration =
                request.finishedAt -
                startedAt;

            state.history.push(
                request
            );

            if (
                state.history.length >
                CONFIG.maxHistory
            ) {

                state.history.shift();

            }

            emit(
                "request-end",
                {
                    request
                }
            );

        }

    }

    // ========================================================
    // FINALIZE RESPONSE
    // ========================================================

    async function finalize(
        result,
        request,
        startedAt
    ) {

        const normalized =
            normalizeResult(
                result,
                {
                    task:
                        request.task,

                    language:
                        request.language
                }
            );

        const response = {

            ...normalized,

            requestId:
                request.id,

            input:
                request.input,

            task:
                request.task,

            language:
                request.language,

            timestamp:
                Date.now(),

            duration:
                Date.now() -
                startedAt

        };

        state.lastResponse =
            response;

        if (
            response.ok
        ) {

            state.successfulRequests++;

        } else {

            state.failedRequests++;

        }

        /*
         * Conversation speichern.
         */

        const conversation =
            getConversation();

        if (
            CONFIG.enableConversation &&
            conversation
        ) {

            for (
                const method of [
                    "addMessage",
                    "add",
                    "pushMessage",
                    "appendMessage"
                ]
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
                    ]({

                        role:
                            "assistant",

                        content:
                            response.text ||
                            response.content ||
                            "",

                        text:
                            response.text ||
                            response.content ||
                            "",

                        task:
                            request.task,

                        requestId:
                            request.id,

                        language:
                            request.language,

                        timestamp:
                            Date.now()

                    });

                    break;

                } catch (error) {}

            }

        }

        /*
         * Memory speichern.
         */

        await remember({

            type:
                "ai-engine-request",

            requestId:
                request.id,

            task:
                request.task,

            language:
                request.language,

            input:
                request.input,

            response:
                response.text ||
                response.content ||
                "",

            timestamp:
                Date.now()

        });

        emit(
            "response",
            {
                response
            }
        );

        return response;

    }

    // ========================================================
    // SPECIALIZED FUNCTIONS
    // ========================================================

    async function correct(
        text,
        options = {}
    ) {

        return process(
            text,
            {

                ...options,

                task:
                    "correction"

            }
        );

    }

    async function write(
        instruction,
        options = {}
    ) {

        return process(
            instruction,
            {

                ...options,

                task:
                    "writing"

            }
        );

    }

    async function rewrite(
        text,
        options = {}
    ) {

        return process(
            text,
            {

                ...options,

                task:
                    "rewriting"

            }
        );

    }

    async function summarize(
        text,
        options = {}
    ) {

        return process(
            text,
            {

                ...options,

                task:
                    "summarization"

            }
        );

    }

    async function translate(
        text,
        options = {}
    ) {

        return process(
            text,
            {

                ...options,

                task:
                    "translation"

            }
        );

    }

    async function analyze(
        text,
        options = {}
    ) {

        return process(
            text,
            {

                ...options,

                task:
                    "analysis"

            }
        );

    }

    async function read(
        text,
        options = {}
    ) {

        return process(
            text,
            {

                ...options,

                task:
                    "analysis"

            }
        );

    }

    // ========================================================
    // STATUS
    // ========================================================

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

            requestCount:
                state.requestCount,

            successfulRequests:
                state.successfulRequests,

            failedRequests:
                state.failedRequests,

            currentLanguage:
                state.currentLanguage,

            provider:
                state.provider,

            providerCount:
                Object.keys(
                    state.providers
                ).length,

            historyCount:
                state.history.length,

            capabilities:
                {
                    ...state.capabilities
                },

            modules: {

                core:
                    Boolean(
                        getCore()
                    ),

                chat:
                    Boolean(
                        getChat()
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
                    )

            },

            lastRequest:
                state.lastRequest,

            lastResponse:
                state.lastResponse,

            errors:
                state.errors.length

        };

    }

    // ========================================================
    // ERROR MANAGEMENT
    // ========================================================

    function recordError(
        error
    ) {

        const entry = {

            id:
                createId(
                    "error"
                ),

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

    function clearErrors() {

        state.errors =
            [];

        emit(
            "errors-cleared"
        );

        return true;

    }

    // ========================================================
    // INITIALIZE
    // ========================================================

    async function initialize() {

        if (
            state.initialized
        ) {

            return getStatus();

        }

        state.initialized =
            true;

        /*
         * Sprache übernehmen.
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
                    language.getLanguage() ||
                    CONFIG.defaultLanguage;

            } catch (error) {}

        }

        /*
         * Core beobachten.
         */

        const core =
            getCore();

        if (
            core &&
            typeof core.on ===
            "function"
        ) {

            core.on(
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
         * Language Engine beobachten.
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
         * Kernel registrieren.
         */

        const kernel =
            getKernel();

        if (
            kernel &&
            typeof kernel.registerModule ===
            "function"
        ) {

            try {

                kernel.registerModule(
                    "ai-engine",
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

    // ========================================================
    // PUBLIC API
    // ========================================================

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

        process,

        ask:
            process,

        send:
            process,

        generate:
            process,

        generateResponse:
            process,

        correct,

        write,

        rewrite,

        summarize,

        translate,

        analyze,

        read,

        analyzeText,

        detectTask,

        detectLanguage,

        registerProvider,

        unregisterProvider,

        setProvider,

        getProvider,

        getStatus,

        getHistory:
            () =>
                state.history.slice(),

        clearHistory:
            () => {

                state.history =
                    [];

                emit(
                    "history-cleared"
                );

                return true;

            },

        clearErrors,

        getErrors:
            () =>
                state.errors.slice(),

        getProviders:
            () =>
                ({
                    ...state.providers
                })

    };

    // ========================================================
    // GLOBAL REGISTRATION
    // ========================================================

    window.HalDoAIEngine =
        api;

    window.HalDoOS.aiEngine =
        api;

    // ========================================================
    // BOOT
    // ========================================================

    async function boot() {

        try {

            await initialize();

        } catch (error) {

            recordError(
                error
            );

            console.error(
                "[HalDoAIEngine] Initialization failed:",
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