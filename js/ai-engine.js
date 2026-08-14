// ============================================================
// HALDO AI OS 18
// AI ENGINE
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

    const CONFIG = {

        name:
            "HalDo AI Engine",

        version:
            "18.0.0",

        mode:
            "Professional Ultimate Foundation",

        defaultLanguage:
            "de",

        maxHistory:
            500,

        enableGreetings:
            true,

        enableConversation:
            true,

        enableCommands:
            true,

        enableLocalResponses:
            true,

        enableLearning:
            true,

        enableAppRouting:
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

        responseCount:
            0,

        commandCount:
            0,

        conversationCount:
            0,

        learningCount:
            0,

        lastInput:
            null,

        lastResponse:
            null,

        lastIntent:
            null,

        currentLanguage:
            "de",

        history:
            [],

        errors:
            []

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
            set.size ===
            0
        ) {

            listeners.delete(event);

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

                    callback(detail);

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

        return clean(value)
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
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

    function getCommands() {

        return (
            window.HalDoAICommands ||
            window.HalDoOS?.aiCommands ||
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

    function getAppManager() {

        return (
            window.HalDoAppManager ||
            window.HalDoOS?.appManager ||
            null
        );

    }

    function getLauncher() {

        return (
            window.HalDoLauncher ||
            window.HalDoAppLauncher ||
            window.HalDoOS?.launcher ||
            null
        );

    }

    function getRouter() {

        return (
            window.HalDoAppRouter ||
            window.HalDoOS?.appRouter ||
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
                    language.detectLanguage(text);

                if (
                    result?.language
                ) {

                    state.currentLanguage =
                        result.language;

                }

                return result;

            } catch (error) {

                recordError(error);

            }

        }

        return {

            language:
                state.currentLanguage ||
                CONFIG.defaultLanguage,

            confidence:
                0

        };

    }

    // ========================================================
    // GREETING DETECTION
    // ========================================================

    const greetingPatterns = [

        "hallo",

        "hi",

        "hey",

        "hello",

        "moin",

        "guten morgen",

        "guten tag",

        "guten abend",

        "gute nacht",

        "hallo haldo",

        "hi haldo",

        "hey haldo",

        "hello haldo",

        "haldo",

        "salam",

        "merhaba",

        "slav",

        "roj bash",

        "spas",

        "ez başî",

        "ez basî"

    ];

    function isGreeting(
        text
    ) {

        if (
            !CONFIG.enableGreetings
        ) {
            return false;
        }

        const value =
            normalize(text);

        return greetingPatterns.some(
            greeting =>
                value === greeting ||
                value.startsWith(
                    greeting + " "
                ) ||
                value.includes(
                    greeting + " haldo"
                )
        );

    }

    // ========================================================
    // INTENT DETECTION
    // ========================================================

    function detectIntent(
        text
    ) {

        const value =
            normalize(text);

        if (!value) {

            return {

                intent:
                    "empty",

                confidence:
                    1

            };

        }

        if (
            isGreeting(value)
        ) {

            return {

                intent:
                    "greeting",

                confidence:
                    0.99

            };

        }

        const commandEngine =
            getCommands();

        if (
            CONFIG.enableCommands &&
            commandEngine &&
            typeof commandEngine.detectCommand ===
            "function"
        ) {

            try {

                const result =
                    commandEngine.detectCommand(
                        text
                    );

                if (
                    result?.command &&
                    result.confidence >=
                    0.55
                ) {

                    return {

                        intent:
                            "command",

                        confidence:
                            result.confidence,

                        command:
                            result.command,

                        detection:
                            result

                    };

                }

            } catch (error) {

                recordError(error);

            }

        }

        if (
            matchesAny(
                value,
                [
                    "lernen",
                    "lerne",
                    "lernen mit haldo",
                    "schule",
                    "universitaet",
                    "universitat",
                    "studium",
                    "studieren",
                    "hausaufgabe",
                    "prüfung",
                    "pruefung",
                    "mathe",
                    "physik",
                    "chemie",
                    "geschichte",
                    "sprache lernen"
                ]
            )
        ) {

            return {

                intent:
                    "learning",

                confidence:
                    0.88

            };

        }

        if (
            matchesAny(
                value,
                [
                    "fahrschule",
                    "führerschein",
                    "fuehrerschein",
                    "verkehr",
                    "verkehrsregeln",
                    "autobahn",
                    "fahrprüfung",
                    "fahrpruefung"
                ]
            )
        ) {

            return {

                intent:
                    "driving",

                confidence:
                    0.88

            };

        }

        if (
            matchesAny(
                value,
                [
                    "navigation",
                    "route",
                    "weg",
                    "wie komme ich",
                    "navigiere",
                    "navigieren"
                ]
            )
        ) {

            return {

                intent:
                    "navigation",

                confidence:
                    0.86

            };

        }

        if (
            matchesAny(
                value,
                [
                    "unfall",
                    "verkehrsunfall",
                    "stau",
                    "verkehrslage",
                    "blitzer",
                    "warnung"
                ]
            )
        ) {

            return {

                intent:
                    "traffic",

                confidence:
                    0.86

            };

        }

        if (
            matchesAny(
                value,
                [
                    "was kannst du",
                    "was kannst du machen",
                    "wer bist du",
                    "was bist du",
                    "über dich",
                    "ueber dich"
                ]
            )
        ) {

            return {

                intent:
                    "about",

                confidence:
                    0.91

            };

        }

        if (
            matchesAny(
                value,
                [
                    "danke",
                    "vielen dank",
                    "dankeschön",
                    "dankeschoen"
                ]
            )
        ) {

            return {

                intent:
                    "thanks",

                confidence:
                    0.98

            };

        }

        if (
            matchesAny(
                value,
                [
                    "tschüss",
                    "tschuess",
                    "bye",
                    "auf wiedersehen"
                ]
            )
        ) {

            return {

                intent:
                    "goodbye",

                confidence:
                    0.98

            };

        }

        return {

            intent:
                "conversation",

            confidence:
                0.65

        };

    }

    function matchesAny(
        text,
        values
    ) {

        return values.some(
            value =>
                text === value ||
                text.includes(value)
        );

    }

    // ========================================================
    // LOCAL RESPONSE SYSTEM
    // ========================================================

    function getLocalizedResponse(
        intent,
        language = "de"
    ) {

        const responses = {

            de: {

                greeting:
                    "Hallo! Ich bin HalDo AI. 💙❤️ Wie kann ich dir helfen?",

                thanks:
                    "Sehr gerne! 💙❤️",

                goodbye:
                    "Bis bald! HalDo AI bleibt für dich bereit. 🚀",

                about:
                    "Ich bin HalDo AI – die intelligente Assistenz des HalDo AI OS 18. Ich kann mit dir sprechen, Befehle ausführen, Apps öffnen, Informationen verarbeiten und dich beim Lernen unterstützen.",

                learning:
                    "Natürlich. 📚 HalDo AI kann dich beim Lernen für Schule, Universität, Prüfungen und verschiedene Fachgebiete unterstützen.",

                driving:
                    "Ich kann dich beim Lernen für Fahrschule, Verkehrsregeln und Führerschein-Themen unterstützen.",

                navigation:
                    "Navigation ist vorbereitet. Sag mir zum Beispiel, wohin du möchtest.",

                traffic:
                    "Verkehrs- und Warnfunktionen sind als Teil des HalDo-Systems vorgesehen. Für aktuelle Verkehrsdaten benötigt HalDo AI später eine entsprechende Datenquelle.",

                conversation:
                    "Ich höre dir zu. Erzähl mir, was du wissen oder machen möchtest."

            },

            en: {

                greeting:
                    "Hello! I am HalDo AI. 💙❤️ How can I help you?",

                thanks:
                    "You're very welcome! 💙❤️",

                goodbye:
                    "See you soon! HalDo AI is ready for you. 🚀",

                about:
                    "I am HalDo AI, the intelligent assistant of HalDo AI OS 18. I can communicate with you, execute commands, work with apps and support learning.",

                learning:
                    "Of course. 📚 HalDo AI can support you with school, university, exams and different subjects.",

                driving:
                    "I can help you learn driving theory, traffic rules and driving-related topics.",

                navigation:
                    "Navigation is prepared. Tell me where you want to go.",

                traffic:
                    "Traffic and warning functions are prepared as part of HalDo. Current traffic data requires an appropriate live data source.",

                conversation:
                    "I am listening. Tell me what you would like to know or do."

            },

            ku: {

                greeting:
                    "Silav! Ez HalDo AI me. 💙❤️ Ez dikarim çi ji bo te bikim?",

                thanks:
                    "Bi kêfa min! 💙❤️",

                goodbye:
                    "Bi xêr be! HalDo AI ji bo te amade ye. 🚀",

                about:
                    "Ez HalDo AI me, alîkarê hişmend ê HalDo AI OS 18.",

                learning:
                    "Erê. Ez dikarim di fêrbûnê, dibistanê û zanîngehê de alîkarî bikim.",

                driving:
                    "Ez dikarim di mijarên ajotinê û rêzikên trafîkê de alîkarî bikim.",

                navigation:
                    "Nîvigasyon amade ye. Ji min re bêje ku tu dixwazî biçî ku derê.",

                traffic:
                    "Fonksiyonên trafîkê ji bo HalDo hatine amadekirin.",

                conversation:
                    "Ez te dibihîzim. Ji min re bêje tu çi dixwazî."

            },

            ez: {

                greeting:
                    "Silav! Ez HalDo AI me. 💙❤️ Ez dikarim çi ji bo te bikim?",

                thanks:
                    "Bi kêfa min! 💙❤️",

                goodbye:
                    "Bi xêr be! HalDo AI ji bo te amade ye. 🚀",

                about:
                    "Ez HalDo AI me, alîkarê hişmend ê HalDo AI OS 18.",

                learning:
                    "Erê. Ez dikarim di fêrbûnê û xwendinê de alîkarî bikim.",

                driving:
                    "Ez dikarim di mijarên ajotinê û trafîkê de alîkarî bikim.",

                navigation:
                    "Nîvigasyon ji bo HalDo hatiye amadekirin.",

                traffic:
                    "Fonksiyonên trafîkê ji bo HalDo hatiye amadekirin.",

                conversation:
                    "Ez te dibihîzim. Ji min re bêje tu çi dixwazî."

            }

        };

        const selected =
            responses[
                language
            ] ||
            responses.de;

        return (
            selected[intent] ||
            selected.conversation
        );

    }

    // ========================================================
    // COMMAND EXECUTION
    // ========================================================

    async function executeCommand(
        text,
        options = {}
    ) {

        const commands =
            getCommands();

        if (
            !commands ||
            typeof commands.execute !==
            "function"
        ) {

            return {

                ok:
                    false,

                handled:
                    false,

                error:
                    "COMMAND_ENGINE_UNAVAILABLE"

            };

        }

        try {

            const result =
                await commands.execute(
                    text,
                    options
                );

            if (
                result?.ok
            ) {

                state.commandCount++;

            }

            return {

                ok:
                    result?.ok !== false,

                handled:
                    Boolean(
                        result?.command ||
                        result?.result ||
                        result?.ok
                    ),

                result

            };

        } catch (error) {

            recordError(error);

            return {

                ok:
                    false,

                handled:
                    false,

                error:
                    error.message ||
                    String(error)

            };

        }

    }

    // ========================================================
    // MEMORY
    // ========================================================

    async function remember(
        input,
        response,
        metadata = {}
    ) {

        if (
            !CONFIG.enableLearning
        ) {
            return false;
        }

        const memory =
            getMemory();

        if (!memory) {
            return false;
        }

        const data = {

            type:
                "ai-interaction",

            input,

            response,

            language:
                state.currentLanguage,

            timestamp:
                Date.now(),

            ...metadata

        };

        for (
            const method of [
                "remember",
                "add",
                "store",
                "save"
            ]
        ) {

            if (
                typeof memory[method] !==
                "function"
            ) {
                continue;
            }

            try {

                await memory[method](data);

                state.learningCount++;

                return true;

            } catch (error) {}

        }

        return false;

    }

    // ========================================================
    // CONVERSATION
    // ========================================================

    async function saveConversation(
        role,
        text,
        metadata = {}
    ) {

        if (
            !CONFIG.enableConversation
        ) {
            return false;
        }

        const conversation =
            getConversation();

        if (!conversation) {
            return false;
        }

        const message = {

            role,

            content:
                text,

            text,

            language:
                state.currentLanguage,

            timestamp:
                Date.now(),

            ...metadata

        };

        for (
            const method of [
                "addMessage",
                "add",
                "pushMessage",
                "appendMessage"
            ]
        ) {

            if (
                typeof conversation[method] !==
                "function"
            ) {
                continue;
            }

            try {

                await conversation[method](
                    message
                );

                state.conversationCount++;

                return true;

            } catch (error) {}

        }

        return false;

    }

    // ========================================================
    // MAIN GENERATION
    // ========================================================

    async function generate(
        input,
        context = {}
    ) {

        const text =
            clean(input);

        if (!text) {

            return {

                ok:
                    false,

                type:
                    "empty",

                text:
                    "Bitte sag mir, was du möchtest."

            };

        }

        const language =
            context.language ||
            detectLanguage(text)?.language ||
            state.currentLanguage ||
            CONFIG.defaultLanguage;

        state.currentLanguage =
            language;

        const intent =
            detectIntent(text);

        state.lastIntent =
            intent;

        emit(
            "intent-detected",
            {
                input:
                    text,

                intent,

                language
            }
        );

        // ----------------------------------------------------
        // GREETING
        // ----------------------------------------------------

        if (
            intent.intent ===
            "greeting"
        ) {

            return {

                ok:
                    true,

                type:
                    "greeting",

                intent:
                    intent.intent,

                language,

                text:
                    getLocalizedResponse(
                        "greeting",
                        language
                    )

            };

        }

        // ----------------------------------------------------
        // COMMAND
        // ----------------------------------------------------

        if (
            intent.intent ===
            "command"
        ) {

            const result =
                await executeCommand(
                    text,
                    context.options || {}
                );

            if (
                result.ok ||
                result.handled
            ) {

                return {

                    ok:
                        true,

                    type:
                        "command",

                    intent:
                        "command",

                    language,

                    command:
                        intent.command?.id ||
                        null,

                    result:

                        result.result ||
                        result

                };

            }

        }

        // ----------------------------------------------------
        // LOCAL RESPONSES
        // ----------------------------------------------------

        if (
            CONFIG.enableLocalResponses
        ) {

            const supportedIntents = [

                "thanks",

                "goodbye",

                "about",

                "learning",

                "driving",

                "navigation",

                "traffic"

            ];

            if (
                supportedIntents.includes(
                    intent.intent
                )
            ) {

                const response =
                    getLocalizedResponse(
                        intent.intent,
                        language
                    );

                await remember(
                    text,
                    response,
                    {
                        intent:
                            intent.intent
                    }
                );

                return {

                    ok:
                        true,

                    type:
                        intent.intent,

                    intent:
                        intent.intent,

                    language,

                    text:
                        response

                };

            }

        }

        // ----------------------------------------------------
        // EXISTING AI PROVIDER
        // ----------------------------------------------------

        const core =
            getCore();

        /*
         * Wichtig:
         * Keine Endlosschleife.
         * ai-core -> ai-engine.generate()
         * darf nicht wieder ai-core.process()
         * aufrufen.
         */

        if (
            context.allowProvider !==
            false &&
            context.provider &&
            typeof context.provider.generate ===
            "function"
        ) {

            try {

                const result =
                    await context.provider.generate(
                        text,
                        context
                    );

                return normalizeResult(
                    result,
                    language
                );

            } catch (error) {

                recordError(error);

            }

        }

        /*
         * Falls eine externe AI-Engine später
         * als Provider eingebunden wird.
         */

        if (
            context.externalProvider &&
            typeof context.externalProvider.generate ===
            "function"
        ) {

            try {

                const result =
                    await context.externalProvider.generate(
                        text,
                        context
                    );

                return normalizeResult(
                    result,
                    language
                );

            } catch (error) {

                recordError(error);

            }

        }

        /*
         * Kein echter AI-Provider:
         * ehrliche vorbereitete Antwort.
         */

        return {

            ok:
                false,

            type:
                "provider-required",

            intent:
                intent.intent,

            language,

            text:
                getLocalizedResponse(
                    "conversation",
                    language
                ),

            message:
                "Für freie generative Antworten muss ein AI-Provider verbunden werden.",

            providerRequired:
                true,

            coreAvailable:
                Boolean(core)

        };

    }

    // ========================================================
    // NORMALIZE RESULT
    // ========================================================

    function normalizeResult(
        result,
        language
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

                language,

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

                language,

                value:
                    result,

                text:
                    String(
                        result ?? ""
                    )

            };

        }

        return {

            ok:
                result.ok !== false,

            ...result,

            language:
                result.language ||
                language,

            text:
                result.text ??
                result.content ??
                result.message ??
                ""

        };

    }

    // ========================================================
    // PROCESS
    // ========================================================

    async function process(
        input,
        options = {}
    ) {

        const text =
            clean(input);

        if (!text) {

            return {

                ok:
                    false,

                error:
                    "EMPTY_INPUT"

            };

        }

        const id =
            createId(
                "request"
            );

        state.processing =
            true;

        state.requestCount++;

        state.lastInput =
            text;

        const started =
            Date.now();

        emit(
            "request-start",
            {
                id,
                input:
                    text
            }
        );

        try {

            const detected =
                detectLanguage(text);

            const language =
                detected?.language ||
                state.currentLanguage;

            state.currentLanguage =
                language;

            await saveConversation(
                "user",
                text,
                {
                    requestId:
                        id
                }
            );

            const context = {

                requestId:
                    id,

                language,

                options,

                memories:
                    [],

                history:
                    state.history.slice(-50)

            };

            const result =
                await generate(
                    text,
                    context
                );

            const response = {

                id,

                requestId:
                    id,

                ok:
                    result?.ok !== false,

                type:
                    result?.type ||
                    "text",

                intent:
                    result?.intent ||
                    state.lastIntent?.intent ||
                    "conversation",

                language,

                input:
                    text,

                text:
                    result?.text ||
                    result?.content ||
                    result?.message ||
                    "",

                result,

                timestamp:
                    Date.now(),

                duration:
                    Date.now() -
                    started

            };

            state.lastResponse =
                response;

            state.responseCount++;

            await saveConversation(
                "assistant",
                response.text,
                {
                    requestId:
                        id,

                    type:
                        response.type
                }
            );

            await remember(
                text,
                response.text,
                {
                    requestId:
                        id,

                    intent:
                        response.intent
                }
            );

            state.history.push(
                response
            );

            if (
                state.history.length >
                CONFIG.maxHistory
            ) {

                state.history.shift();

            }

            emit(
                "response",
                {
                    response
                }
            );

            return response;

        } catch (error) {

            recordError(error);

            const response = {

                ok:
                    false,

                type:
                    "error",

                id,

                input:
                    text,

                language:
                    state.currentLanguage,

                error:
                    error.message ||
                    String(error)

            };

            state.lastResponse =
                response;

            emit(
                "error-response",
                {
                    response,
                    error
                }
            );

            return response;

        } finally {

            state.processing =
                false;

            emit(
                "request-end",
                {
                    id
                }
            );

        }

    }

    // ========================================================
    // APP CONTROL HELPERS
    // ========================================================

    async function openApp(
        app
    ) {

        const launcher =
            getLauncher();

        const manager =
            getAppManager();

        const router =
            getRouter();

        const target =
            typeof app ===
            "object"
                ? app.id ||
                  app.name ||
                  app.title
                : app;

        if (
            !target
        ) {

            return {

                ok:
                    false,

                error:
                    "APP_NOT_SPECIFIED"

            };

        }

        for (
            const system of [
                launcher,
                manager,
                router
            ]
        ) {

            if (!system) {
                continue;
            }

            for (
                const method of [
                    "openApp",
                    "launchApp",
                    "launch",
                    "open",
                    "navigate"
                ]
            ) {

                if (
                    typeof system[method] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await system[method](
                            target
                        );

                    if (
                        result !==
                        false
                    ) {

                        return {

                            ok:
                                true,

                            app:
                                target,

                            result

                        };

                    }

                } catch (error) {}

            }

        }

        return {

            ok:
                false,

            error:
                "APP_OPEN_FAILED",

            app:
                target

        };

    }

    // ========================================================
    // ERROR
    // ========================================================

    function recordError(
        error
    ) {

        const entry = {

            timestamp:
                Date.now(),

            message:
                error?.message ||
                String(error)

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

            responseCount:
                state.responseCount,

            commandCount:
                state.commandCount,

            conversationCount:
                state.conversationCount,

            learningCount:
                state.learningCount,

            currentLanguage:
                state.currentLanguage,

            lastInput:
                state.lastInput,

            lastIntent:
                state.lastIntent,

            lastResponse:
                state.lastResponse,

            modules: {

                core:
                    Boolean(
                        getCore()
                    ),

                commands:
                    Boolean(
                        getCommands()
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

                appManager:
                    Boolean(
                        getAppManager()
                    ),

                launcher:
                    Boolean(
                        getLauncher()
                    ),

                router:
                    Boolean(
                        getRouter()
                    )

            },

            errors:
                state.errors.length

        };

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

        detectLanguage,

        detectIntent,

        isGreeting,

        generate,

        process,

        ask:
            process,

        send:
            process,

        respond:
            process,

        executeCommand,

        openApp,

        remember,

        saveConversation,

        normalizeResult,

        getStatus

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

            recordError(error);

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