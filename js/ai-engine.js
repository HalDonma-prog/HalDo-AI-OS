/*
========================================================
HalDo AI OS 18
AI ENGINE
Professional Ultimate Foundation
========================================================

Zentrale Verarbeitungs-Engine.

Verbindungen:
- AI Core
- AI Chat
- AI Commands
- AI Memory
- Language System
- Conversation State
- Knowledge System
- Code Builder
- zukünftige externe AI/API-Anbindung

Die Engine selbst enthält KEINE UI.

========================================================
*/

(function () {
    "use strict";

    const VERSION = "18.0.0";

    const state = {
        name: "HalDo AI Engine",
        version: VERSION,
        status: "created",
        initialized: false,
        running: false,
        processing: false,
        requests: 0,
        successful: 0,
        failed: 0,
        lastRequest: null,
        lastResponse: null,
        lastError: null
    };

    const listeners = {};

    /* ==================================================
       EVENTS
    ================================================== */

    function on(event, callback) {
        if (typeof callback !== "function") {
            return function () {};
        }

        if (!listeners[event]) {
            listeners[event] = [];
        }

        listeners[event].push(callback);

        return function () {
            off(event, callback);
        };
    }

    function off(event, callback) {
        if (!listeners[event]) {
            return;
        }

        listeners[event] =
            listeners[event].filter(
                fn => fn !== callback
            );
    }

    function emit(event, data) {
        (listeners[event] || []).forEach(
            callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(
                        "[HalDo AI Engine] Event error:",
                        error
                    );
                }
            }
        );

        try {
            if (
                window.HalDoKernel &&
                typeof window.HalDoKernel.emit ===
                    "function"
            ) {
                window.HalDoKernel.emit(
                    `ai-engine:${event}`,
                    data
                );
            }
        } catch (error) {
            console.warn(
                "[HalDo AI Engine] Kernel event failed:",
                error
            );
        }
    }

    /* ==================================================
       LOGGING
    ================================================== */

    function log(...args) {
        console.log(
            "[HalDo AI Engine]",
            ...args
        );
    }

    function warn(...args) {
        console.warn(
            "[HalDo AI Engine]",
            ...args
        );
    }

    /* ==================================================
       MODULE LOOKUP
    ================================================== */

    function getModule(name) {
        if (!name) {
            return null;
        }

        const modules = {
            core:
                window.HalDoAICore,

            chat:
                window.HalDoAIChat,

            commands:
                window.HalDoAICommands,

            memory:
                window.HalDoAIMemory,

            language:
                window.HalDoAILanguage,

            languageManager:
                window.HalDoLanguageManager,

            conversation:
                window.HalDoConversationState,

            speech:
                window.HalDoAISpeech,

            voice:
                window.HalDoAIVoice,

            system:
                window.HalDoSystem,

            knowledge:
                window.HalDoKnowledge,

            code:
                window.HalDoCodeBuilder
        };

        if (modules[name]) {
            return modules[name];
        }

        try {
            if (
                window.HalDoModuleManager &&
                typeof window.HalDoModuleManager.get ===
                    "function"
            ) {
                return window.HalDoModuleManager.get(
                    name
                );
            }
        } catch (error) {
            warn(
                "Module Manager Fehler:",
                error
            );
        }

        return null;
    }

    /* ==================================================
       STATUS
    ================================================== */

    function getStatus() {
        return {
            name:
                state.name,

            version:
                state.version,

            status:
                state.status,

            initialized:
                state.initialized,

            running:
                state.running,

            processing:
                state.processing,

            requests:
                state.requests,

            successful:
                state.successful,

            failed:
                state.failed,

            lastRequest:
                state.lastRequest,

            lastResponse:
                state.lastResponse,

            lastError:
                state.lastError
        };
    }

    /* ==================================================
       INITIALIZE
    ================================================== */

    function initialize() {
        if (state.initialized) {
            return getStatus();
        }

        state.status =
            "initializing";

        emit(
            "initializing",
            getStatus()
        );

        state.initialized =
            true;

        state.status =
            "ready";

        emit(
            "ready",
            getStatus()
        );

        log(
            "AI Engine initialisiert."
        );

        return getStatus();
    }

    /* ==================================================
       START
    ================================================== */

    function start() {
        if (!state.initialized) {
            initialize();
        }

        if (state.running) {
            return getStatus();
        }

        state.running =
            true;

        state.status =
            "running";

        emit(
            "started",
            getStatus()
        );

        log(
            "AI Engine gestartet."
        );

        return getStatus();
    }

    /* ==================================================
       STOP
    ================================================== */

    function stop() {
        state.running =
            false;

        state.processing =
            false;

        state.status =
            "stopped";

        emit(
            "stopped",
            getStatus()
        );

        return getStatus();
    }

    /* ==================================================
       NORMALIZE REQUEST
    ================================================== */

    function normalizeRequest(
        message,
        options = {}
    ) {
        return {
            id:
                `engine-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 9)}`,

            message:
                String(
                    message || ""
                ).trim(),

            mode:
                options.mode ||
                "assistant",

            language:
                options.language ||
                null,

            conversationId:
                options.conversationId ||
                null,

            timestamp:
                new Date().toISOString(),

            options: {
                ...options
            }
        };
    }

    /* ==================================================
       LANGUAGE DETECTION
    ================================================== */

    function detectLanguage(
        message,
        options
    ) {
        if (
            options &&
            options.language
        ) {
            return options.language;
        }

        const language =
            getModule(
                "language"
            );

        if (!language) {
            return "de";
        }

        try {
            if (
                typeof language.detect ===
                    "function"
            ) {
                return (
                    language.detect(
                        message
                    ) || "de"
                );
            }

            if (
                typeof language.detectLanguage ===
                    "function"
            ) {
                return (
                    language.detectLanguage(
                        message
                    ) || "de"
                );
            }
        } catch (error) {
            warn(
                "Spracherkennung fehlgeschlagen:",
                error
            );
        }

        return "de";
    }

    /* ==================================================
       INTENT DETECTION
    ================================================== */

    function detectIntent(
        message,
        options = {}
    ) {
        const text =
            String(
                message || ""
            )
                .trim()
                .toLowerCase();

        if (!text) {
            return "empty";
        }

        if (
            text.startsWith("/") ||
            text.startsWith("haldo ")
        ) {
            return "command";
        }

        if (
            text.includes("code") ||
            text.includes("programm") ||
            text.includes("javascript") ||
            text.includes("html") ||
            text.includes("css")
        ) {
            return "code";
        }

        if (
            text.includes("wissen") ||
            text.includes("erkläre") ||
            text.includes("erklären") ||
            text.includes("was ist") ||
            text.includes("warum")
        ) {
            return "knowledge";
        }

        if (
            text.includes("sprache") ||
            text.includes("übersetz") ||
            text.includes("translate")
        ) {
            return "language";
        }

        if (
            text.includes("merke") ||
            text.includes("erinnere") ||
            text.includes("vergiss")
        ) {
            return "memory";
        }

        if (
            text.includes("sprich") ||
            text.includes("vorlesen") ||
            text.includes("laut")
        ) {
            return "speech";
        }

        if (
            options.mode ===
            "code"
        ) {
            return "code";
        }

        if (
            options.mode ===
            "knowledge"
        ) {
            return "knowledge";
        }

        return "assistant";
    }

    /* ==================================================
       COMMAND ROUTER
    ================================================== */

    async function routeCommand(
        request
    ) {
        const commands =
            getModule(
                "commands"
            );

        if (!commands) {
            return null;
        }

        try {
            if (
                typeof commands.execute ===
                    "function"
            ) {
                return await commands.execute(
                    request.message,
                    request.options
                );
            }

            if (
                typeof commands.run ===
                    "function"
            ) {
                return await commands.run(
                    request.message,
                    request.options
                );
            }
        } catch (error) {
            warn(
                "Command-Ausführung fehlgeschlagen:",
                error
            );

            throw error;
        }

        return null;
    }

    /* ==================================================
       KNOWLEDGE ROUTER
    ================================================== */

    async function routeKnowledge(
        request
    ) {
        const knowledge =
            getModule(
                "knowledge"
            );

        if (!knowledge) {
            return null;
        }

        try {
            if (
                typeof knowledge.ask ===
                    "function"
            ) {
                return await knowledge.ask(
                    request.message,
                    request.options
                );
            }

            if (
                typeof knowledge.search ===
                    "function"
            ) {
                return await knowledge.search(
                    request.message
                );
            }
        } catch (error) {
            warn(
                "Knowledge-System Fehler:",
                error
            );

            throw error;
        }

        return null;
    }

    /* ==================================================
       CODE ROUTER
    ================================================== */

    async function routeCode(
        request
    ) {
        const code =
            getModule(
                "code"
            );

        if (!code) {
            return null;
        }

        try {
            if (
                typeof code.build ===
                    "function"
            ) {
                return await code.build(
                    request.message,
                    request.options
                );
            }

            if (
                typeof code.generate ===
                    "function"
            ) {
                return await code.generate(
                    request.message,
                    request.options
                );
            }
        } catch (error) {
            warn(
                "Code Builder Fehler:",
                error
            );

            throw error;
        }

        return null;
    }

    /* ==================================================
       MEMORY ROUTER
    ================================================== */

    async function routeMemory(
        request
    ) {
        const memory =
            getModule(
                "memory"
            );

        if (!memory) {
            return null;
        }

        try {
            if (
                typeof memory.process ===
                    "function"
            ) {
                return await memory.process(
                    request.message
                );
            }

            if (
                typeof memory.handle ===
                    "function"
            ) {
                return await memory.handle(
                    request.message
                );
            }
        } catch (error) {
            warn(
                "Memory-System Fehler:",
                error
            );

            throw error;
        }

        return null;
    }

    /* ==================================================
       SPEECH ROUTER
    ================================================== */

    async function routeSpeech(
        request
    ) {
        const speech =
            getModule(
                "speech"
            );

        if (!speech) {
            return null;
        }

        try {
            if (
                typeof speech.speak ===
                    "function"
            ) {
                return await speech.speak(
                    request.message
                );
            }
        } catch (error) {
            warn(
                "Speech-System Fehler:",
                error
            );

            throw error;
        }

        return null;
    }

    /* ==================================================
       EXTERNAL AI ADAPTER
    ==================================================

       Hier kann später eine echte AI/API-Anbindung
       angeschlossen werden.

       Die Engine bleibt dadurch unabhängig vom
       konkreten Anbieter.
    ================================================== */

    async function callExternalAI(
        request
    ) {
        const config =
            window.HalDoConfig ||
            window.HalDoConfigManager;

        /*
         * Noch keine externe API erzwingen.
         * Das lokale OS bleibt vollständig startfähig.
         */
        if (!config) {
            return null;
        }

        try {
            let endpoint = null;

            if (
                typeof config.get ===
                    "function"
            ) {
                endpoint =
                    config.get(
                        "ai.endpoint"
                    );
            }

            if (
                !endpoint &&
                config.ai
            ) {
                endpoint =
                    config.ai.endpoint;
            }

            if (!endpoint) {
                return null;
            }

            /*
             * Sicherheitsregel:
             * API-Schlüssel niemals aus dieser Engine
             * hart codieren.
             */
            let apiKey = null;

            if (
                typeof config.get ===
                    "function"
            ) {
                apiKey =
                    config.get(
                        "ai.apiKey"
                    );
            }

            const headers = {
                "Content-Type":
                    "application/json"
            };

            if (apiKey) {
                headers.Authorization =
                    `Bearer ${apiKey}`;
            }

            const response =
                await fetch(
                    endpoint,
                    {
                        method:
                            "POST",

                        headers,

                        body:
                            JSON.stringify({
                                message:
                                    request.message,

                                language:
                                    request.language,

                                mode:
                                    request.mode,

                                conversationId:
                                    request.conversationId
                            })
                    }
                );

            if (!response.ok) {
                throw new Error(
                    `AI API HTTP ${response.status}`
                );
            }

            const data =
                await response.json();

            return (
                data?.text ||
                data?.message ||
                data
            );

        } catch (error) {
            warn(
                "Externe AI-Anbindung nicht verfügbar:",
                error
            );

            /*
             * Kein harter Systemabbruch.
             * Die Foundation kann weiterarbeiten.
             */
            return null;
        }
    }

    /* ==================================================
       FOUNDATION RESPONSE
    ================================================== */

    function foundationResponse(
        request
    ) {
        const responses = {
            assistant:
                "HalDo AI Core ist aktiv und bereit.",

            knowledge:
                "Das HalDo Knowledge-System ist vorbereitet.",

            code:
                "Der HalDo Code Builder ist vorbereitet.",

            language:
                "Das HalDo Language-System ist vorbereitet.",

            memory:
                "Das HalDo Memory-System ist verbunden.",

            speech:
                "Das HalDo Speech-System ist vorbereitet.",

            command:
                "Das HalDo Command-System ist bereit."
        };

        return {
            text:
                responses[
                    request.intent
                ] ||
                responses.assistant,

            type:
                "foundation",

            source:
                "haldo-ai-engine",

            intent:
                request.intent,

            language:
                request.language
        };
    }

    /* ==================================================
       NORMALIZE RESPONSE
    ================================================== */

    function normalizeResponse(
        response,
        request
    ) {
        if (!response) {
            return foundationResponse(
                request
            );
        }

        if (
            typeof response ===
            "string"
        ) {
            return {
                text:
                    response,

                type:
                    "ai",

                source:
                    "haldo-ai-engine",

                intent:
                    request.intent,

                language:
                    request.language
            };
        }

        return {
            text:
                response.text ||
                response.message ||
                JSON.stringify(
                    response
                ),

            type:
                response.type ||
                "ai",

            source:
                response.source ||
                "haldo-ai-engine",

            intent:
                response.intent ||
                request.intent,

            language:
                response.language ||
                request.language,

            data:
                response.data ||
                null
        };
    }

    /* ==================================================
       MAIN PROCESS
    ================================================== */

    async function ask(
        message,
        options = {}
    ) {
        if (!state.initialized) {
            initialize();
        }

        if (!state.running) {
            start();
        }

        const request =
            normalizeRequest(
                message,
                options
            );

        if (!request.message) {
            return {
                text:
                    "Bitte schreibe eine Anfrage.",

                type:
                    "empty",

                source:
                    "haldo-ai-engine"
            };
        }

        request.language =
            detectLanguage(
                request.message,
                options
            );

        request.intent =
            detectIntent(
                request.message,
                options
            );

        state.requests += 1;
        state.processing = true;
        state.status =
            "processing";
        state.lastRequest =
            request;
        state.lastError =
            null;

        emit(
            "request:start",
            request
        );

        try {
            let response =
                null;

            /*
             * ------------------------------------------
             * 1. Commands
             * ------------------------------------------
             */
            if (
                request.intent ===
                "command"
            ) {
                response =
                    await routeCommand(
                        request
                    );
            }

            /*
             * ------------------------------------------
             * 2. Memory
             * ------------------------------------------
             */
            if (
                !response &&
                request.intent ===
                    "memory"
            ) {
                response =
                    await routeMemory(
                        request
                    );
            }

            /*
             * ------------------------------------------
             * 3. Knowledge
             * ------------------------------------------
             */
            if (
                !response &&
                request.intent ===
                    "knowledge"
            ) {
                response =
                    await routeKnowledge(
                        request
                    );
            }

            /*
             * ------------------------------------------
             * 4. Code
             * ------------------------------------------
             */
            if (
                !response &&
                request.intent ===
                    "code"
            ) {
                response =
                    await routeCode(
                        request
                    );
            }

            /*
             * ------------------------------------------
             * 5. Speech
             * ------------------------------------------
             */
            if (
                !response &&
                request.intent ===
                    "speech"
            ) {
                response =
                    await routeSpeech(
                        request
                    );
            }

            /*
             * ------------------------------------------
             * 6. External AI
             * ------------------------------------------
             */
            if (!response) {
                response =
                    await callExternalAI(
                        request
                    );
            }

            /*
             * ------------------------------------------
             * 7. Foundation
             * ------------------------------------------
             */
            if (!response) {
                response =
                    foundationResponse(
                        request
                    );
            }

            response =
                normalizeResponse(
                    response,
                    request
                );

            state.successful += 1;
            state.lastResponse =
                response;

            state.processing =
                false;

            state.status =
                "running";

            emit(
                "request:complete",
                {
                    request,
                    response
                }
            );

            return response;

        } catch (error) {
            state.failed += 1;
            state.lastError =
                error.message;

            state.processing =
                false;

            state.status =
                "running";

            emit(
                "request:error",
                {
                    request,
                    error
                }
            );

            return {
                text:
                    "HalDo AI konnte diese Anfrage gerade nicht vollständig verarbeiten.",

                type:
                    "error",

                source:
                    "haldo-ai-engine",

                error:
                    error.message,

                intent:
                    request.intent,

                language:
                    request.language
            };
        }
    }

    /* ==================================================
       ANALYZE
    ================================================== */

    function analyze(
        message,
        options = {}
    ) {
        const text =
            String(
                message || ""
            ).trim();

        return {
            text,

            language:
                detectLanguage(
                    text,
                    options
                ),

            intent:
                detectIntent(
                    text,
                    options
                ),

            length:
                text.length,

            words:
                text
                    ? text.split(/\s+/).length
                    : 0,

            timestamp:
                new Date().toISOString()
        };
    }

    /* ==================================================
       RESET
    ================================================== */

    function reset() {
        state.status =
            "created";

        state.initialized =
            false;

        state.running =
            false;

        state.processing =
            false;

        state.requests =
            0;

        state.successful =
            0;

        state.failed =
            0;

        state.lastRequest =
            null;

        state.lastResponse =
            null;

        state.lastError =
            null;

        emit(
            "reset",
            getStatus()
        );

        return getStatus();
    }

    /* ==================================================
       PUBLIC API
    ================================================== */

    const api = {

        name:
            state.name,

        version:
            VERSION,

        initialize,

        start,

        stop,

        ask,

        analyze,

        getStatus,

        detectIntent,

        detectLanguage,

        on,

        off,

        reset
    };

    /* ==================================================
       GLOBAL API
    ================================================== */

    window.HalDoAIEngine =
        api;

    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.aiEngine =
        api;

    /* ==================================================
       KERNEL REGISTRATION
    ================================================== */

    function registerWithKernel() {
        try {
            const kernel =
                window.HalDoKernel;

            if (
                kernel &&
                typeof kernel.registerModule ===
                    "function"
            ) {
                kernel.registerModule(
                    "ai-engine",
                    api
                );
            }
        } catch (error) {
            console.warn(
                "[HalDo AI Engine] Kernel registration failed:",
                error
            );
        }
    }

    /* ==================================================
       BOOT
    ================================================== */

    function boot() {
        registerWithKernel();
        initialize();
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            boot,
            {
                once: true
            }
        );
    } else {
        boot();
    }

})();