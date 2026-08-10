/*
========================================================
HalDo AI OS 18
AI CORE SERVICE
Professional Ultimate Foundation
========================================================

Zentrale AI-Core-Schicht von HalDo AI OS 18.

Verbindungen:
- Kernel
- System
- Storage
- Memory
- Language
- Voice
- Chat
- Commands
- Engine
- Conversation State

Wichtig:
Der Core besitzt keine eigene Benutzeroberfläche.
Er stellt APIs und Events für die anderen Module bereit.

========================================================
*/

(function () {
    "use strict";

    const VERSION = "18.0.0";

    const state = {
        name: "HalDo AI Core",
        version: VERSION,
        status: "created",
        initialized: false,
        running: false,
        requests: 0,
        lastRequest: null,
        lastResponse: null,
        lastError: null,
        startedAt: null
    };

    const features = [
        "AI Assistant",
        "Learning Engine",
        "Code Builder",
        "Knowledge System",
        "Language System",
        "Êzîdî Keyboard",
        "Voice Interface",
        "Conversation System",
        "AI Memory",
        "Command System",
        "Live Light Interface",
        "System Integration"
    ];

    const listeners = {};

    /* ==================================================
       EVENT SYSTEM
    ================================================== */

    function on(event, callback) {
        if (typeof callback !== "function") {
            return function () {};
        }

        if (!listeners[event]) {
            listeners[event] = [];
        }

        listeners[event].push(callback);

        return function unsubscribe() {
            off(event, callback);
        };
    }

    function off(event, callback) {
        if (!listeners[event]) {
            return;
        }

        listeners[event] = listeners[event].filter(
            fn => fn !== callback
        );
    }

    function emit(event, data) {
        const callbacks = listeners[event] || [];

        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(
                    "[HalDo AI Core] Event error:",
                    event,
                    error
                );
            }
        });

        /*
         * Zusätzlich mit dem zentralen Kernel verbinden,
         * falls dieser bereits verfügbar ist.
         */
        try {
            if (
                window.HalDoKernel &&
                typeof window.HalDoKernel.emit === "function"
            ) {
                window.HalDoKernel.emit(
                    `ai:${event}`,
                    data
                );
            }
        } catch (error) {
            console.warn(
                "[HalDo AI Core] Kernel event failed:",
                error
            );
        }
    }

    /* ==================================================
       LOGGING
    ================================================== */

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

    function error(...args) {
        console.error(
            "[HalDo AI Core]",
            ...args
        );
    }

    /* ==================================================
       DEPENDENCY LOOKUP
    ================================================== */

    function getModule(name) {
        if (!name) {
            return null;
        }

        /*
         * Direkter globaler Zugriff auf bekannte HalDo-Systeme.
         */
        const globals = {
            kernel: window.HalDoKernel,
            system: window.HalDoSystem,
            storage: window.HalDoStorage,
            memory: window.HalDoAIMemory,
            language: window.HalDoAILanguage,
            languageManager: window.HalDoLanguageManager,
            speech: window.HalDoAISpeech,
            voice: window.HalDoAIVoice,
            chat: window.HalDoAIChat,
            commands: window.HalDoAICommands,
            engine: window.HalDoAIEngine,
            conversation: window.HalDoConversationState,
            keyboard: window.HalDoEzidiKeyboard
        };

        if (globals[name]) {
            return globals[name];
        }

        /*
         * Modul-Manager prüfen.
         */
        try {
            if (
                window.HalDoModuleManager &&
                typeof window.HalDoModuleManager.get === "function"
            ) {
                return window.HalDoModuleManager.get(name);
            }
        } catch (moduleError) {
            warn(
                "Module Manager konnte nicht abgefragt werden:",
                moduleError
            );
        }

        /*
         * Kernel prüfen.
         */
        try {
            if (
                window.HalDoKernel &&
                typeof window.HalDoKernel.getModule === "function"
            ) {
                return window.HalDoKernel.getModule(name);
            }
        } catch (kernelError) {
            warn(
                "Kernel-Modul konnte nicht abgefragt werden:",
                kernelError
            );
        }

        return null;
    }

    /* ==================================================
       STATUS
    ================================================== */

    function getStatus() {
        return {
            name: state.name,
            version: state.version,
            status: state.status,
            initialized: state.initialized,
            running: state.running,
            requests: state.requests,
            lastRequest: state.lastRequest,
            lastResponse: state.lastResponse,
            lastError: state.lastError,
            startedAt: state.startedAt,
            features: [...features]
        };
    }

    /* ==================================================
       DEPENDENCY STATUS
    ================================================== */

    function getDependencies() {
        return {
            kernel: !!getModule("kernel"),
            system: !!getModule("system"),
            storage: !!getModule("storage"),
            memory: !!getModule("memory"),
            language: !!getModule("language"),
            languageManager: !!getModule("languageManager"),
            speech: !!getModule("speech"),
            voice: !!getModule("voice"),
            chat: !!getModule("chat"),
            commands: !!getModule("commands"),
            engine: !!getModule("engine"),
            conversation: !!getModule("conversation"),
            keyboard: !!getModule("keyboard")
        };
    }

    /* ==================================================
       INITIALIZE
    ================================================== */

    function initialize() {
        if (state.initialized) {
            return getStatus();
        }

        state.status = "initializing";

        emit("initializing", {
            version: VERSION
        });

        try {
            state.initialized = true;
            state.status = "ready";

            emit("ready", getStatus());

            log(
                "AI Core initialisiert.",
                VERSION
            );

            return getStatus();

        } catch (initError) {
            state.status = "error";
            state.lastError = initError.message;

            emit("error", {
                error: initError
            });

            error(
                "Initialisierung fehlgeschlagen:",
                initError
            );

            return getStatus();
        }
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

        state.running = true;
        state.status = "running";
        state.startedAt = new Date().toISOString();

        emit("started", getStatus());

        log("HalDo AI Core gestartet.");

        return getStatus();
    }

    /* ==================================================
       STOP
    ================================================== */

    function stop() {
        if (!state.running) {
            return getStatus();
        }

        state.running = false;
        state.status = "stopped";

        emit("stopped", getStatus());

        log("HalDo AI Core gestoppt.");

        return getStatus();
    }

    /* ==================================================
       RESET
    ================================================== */

    function reset() {
        state.status = "created";
        state.initialized = false;
        state.running = false;
        state.requests = 0;
        state.lastRequest = null;
        state.lastResponse = null;
        state.lastError = null;
        state.startedAt = null;

        emit("reset", getStatus());

        return getStatus();
    }

    /* ==================================================
       REQUEST NORMALIZATION
    ================================================== */

    function normalizeRequest(message, options = {}) {
        return {
            id:
                `haldo-ai-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 9)}`,

            message:
                String(message || "").trim(),

            language:
                options.language ||
                null,

            mode:
                options.mode ||
                "assistant",

            timestamp:
                new Date().toISOString(),

            options: {
                ...options
            }
        };
    }

    /* ==================================================
       LOCAL RESPONSE
    ================================================== */

    function createFoundationResponse(request) {
        if (!request.message) {
            return {
                text:
                    "Bitte schreibe eine Anfrage.",

                type:
                    "empty",

                source:
                    "haldo-ai-core"
            };
        }

        return {
            text:
                "HalDo AI Core hat deine Anfrage empfangen und ist mit der Foundation verbunden.",

            type:
                "foundation",

            source:
                "haldo-ai-core",

            requestId:
                request.id
        };
    }

    /* ==================================================
       ASK
    ================================================== */

    async function ask(message, options = {}) {
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

        state.requests += 1;
        state.lastRequest = request;
        state.lastError = null;

        emit(
            "request:start",
            request
        );

        setAIVisualMode("thinking");

        try {
            /*
             * Zuerst prüfen wir, ob die eigentliche
             * AI-Engine bereits verfügbar ist.
             */
            const engine =
                getModule("engine");

            let response = null;

            if (
                engine &&
                typeof engine.ask === "function"
            ) {
                response =
                    await engine.ask(
                        request.message,
                        request.options
                    );
            }

            /*
             * Falls die Engine noch nicht vollständig
             * implementiert ist, bleibt die Foundation
             * trotzdem funktionsfähig.
             */
            if (!response) {
                response =
                    createFoundationResponse(
                        request
                    );
            }

            const normalizedResponse =
                typeof response === "string"
                    ? {
                        text: response,
                        type: "engine",
                        source: "haldo-ai-engine"
                    }
                    : response;

            state.lastResponse =
                normalizedResponse;

            emit(
                "request:complete",
                {
                    request,
                    response:
                        normalizedResponse
                }
            );

            setAIVisualMode("answering");

            window.setTimeout(
                () => setAIVisualMode("idle"),
                650
            );

            return normalizedResponse;

        } catch (requestError) {
            state.lastError =
                requestError.message;

            emit(
                "request:error",
                {
                    request,
                    error:
                        requestError
                }
            );

            setAIVisualMode("idle");

            error(
                "AI-Anfrage fehlgeschlagen:",
                requestError
            );

            return {
                text:
                    "HalDo AI konnte die Anfrage gerade nicht verarbeiten.",

                type:
                    "error",

                source:
                    "haldo-ai-core",

                error:
                    requestError.message,

                requestId:
                    request.id
            };
        }
    }

    /* ==================================================
       SYNCHRONOUS FOUNDATION ASK
    ================================================== */

    function askSync(message) {
        if (!state.initialized) {
            initialize();
        }

        if (!state.running) {
            start();
        }

        const request =
            normalizeRequest(
                message
            );

        state.requests += 1;
        state.lastRequest = request;

        const response =
            createFoundationResponse(
                request
            );

        state.lastResponse =
            response;

        emit(
            "request:complete",
            {
                request,
                response
            }
        );

        return response;
    }

    /* ==================================================
       VISUAL AI STATE
    ================================================== */

    function setAIVisualMode(mode) {
        try {
            if (
                window.HalDoLight &&
                typeof window.HalDoLight.setMode === "function"
            ) {
                window.HalDoLight.setMode(
                    mode
                );
            }
        } catch (lightError) {
            warn(
                "Light-System konnte nicht aktualisiert werden:",
                lightError
            );
        }

        emit(
            "visual:mode",
            {
                mode
            }
        );
    }

    /* ==================================================
       MEMORY CONNECTION
    ================================================== */

    function remember(key, value) {
        const memory =
            getModule("memory");

        if (!memory) {
            return false;
        }

        try {
            if (
                typeof memory.set === "function"
            ) {
                memory.set(
                    key,
                    value
                );

                return true;
            }

            if (
                typeof memory.remember === "function"
            ) {
                memory.remember(
                    key,
                    value
                );

                return true;
            }

        } catch (memoryError) {
            warn(
                "Memory konnte nicht gespeichert werden:",
                memoryError
            );
        }

        return false;
    }

    function recall(key) {
        const memory =
            getModule("memory");

        if (!memory) {
            return null;
        }

        try {
            if (
                typeof memory.get === "function"
            ) {
                return memory.get(
                    key
                );
            }

            if (
                typeof memory.recall === "function"
            ) {
                return memory.recall(
                    key
                );
            }

        } catch (memoryError) {
            warn(
                "Memory konnte nicht gelesen werden:",
                memoryError
            );
        }

        return null;
    }

    /* ==================================================
       SYSTEM INFORMATION
    ================================================== */

    function getSystemInfo() {
        const system =
            getModule("system");

        if (
            system &&
            typeof system.getStatus === "function"
        ) {
            try {
                return system.getStatus();
            } catch (systemError) {
                warn(
                    "Systemstatus konnte nicht gelesen werden:",
                    systemError
                );
            }
        }

        return null;
    }

    /* ==================================================
       PUBLIC API
    ================================================== */

    const api = {

        name:
            state.name,

        version:
            VERSION,

        features,

        initialize,

        start,

        stop,

        reset,

        ask,

        askSync,

        getStatus,

        getDependencies,

        getSystemInfo,

        getModule,

        remember,

        recall,

        on,

        off,

        emit
    };

    /* ==================================================
       GLOBAL REGISTRATION
    ================================================== */

    window.HalDoAICore =
        api;

    /*
     * Einheitlicher OS-Zugriff.
     */
    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.ai =
        api;

    /*
     * Optionales Kernel-Modul registrieren,
     * wenn der bestehende Kernel dies unterstützt.
     */
    function registerWithKernel() {
        try {
            const kernel =
                window.HalDoKernel;

            if (
                kernel &&
                typeof kernel.registerModule === "function"
            ) {
                kernel.registerModule(
                    "ai-core",
                    api
                );
            }
        } catch (kernelError) {
            warn(
                "AI Core konnte nicht beim Kernel registriert werden:",
                kernelError
            );
        }
    }

    /* ==================================================
       BOOT CONNECTION
    ================================================== */

    function bootConnection() {
        registerWithKernel();

        /*
         * Der Core initialisiert sich,
         * ohne das gesamte OS zu blockieren.
         */
        initialize();
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            bootConnection,
            {
                once: true
            }
        );
    } else {
        bootConnection();
    }

})();