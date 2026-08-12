// ============================================================
// HALDO AI OS 18
// AI ENGINE
// PART 73
// ============================================================
// Zentrale Verarbeitungs-Engine.
//
// Aufgabe:
//   - Anfragen entgegennehmen
//   - Provider verwalten
//   - lokale Antworten ermöglichen
//   - externe Provider vorbereiten
//   - History/Context verarbeiten
//   - Core informieren
//   - Fehler sicher behandeln
//
// Öffentliche APIs:
//   window.HalDoAIEngine
//   window.HalDoOS.aiEngine
// ============================================================

(function (window, document) {

    "use strict";

    // --------------------------------------------------------
    // Duplicate Guard
    // --------------------------------------------------------

    if (
        window.HalDoAIEngine &&
        window.HalDoAIEngine.__haldoAI18
    ) {
        return;
    }

    // --------------------------------------------------------
    // Namespace
    // --------------------------------------------------------

    window.HalDoOS =
        window.HalDoOS || {};

    // --------------------------------------------------------
    // Configuration
    // --------------------------------------------------------

    const CONFIG = {

        name:
            "HalDo AI Engine",

        version:
            "18.0.0",

        mode:
            "hybrid",

        defaultProvider:
            "local",

        timeout:
            30000,

        maxContextMessages:
            30,

        maxInputLength:
            12000,

        debug:
            false

    };

    // --------------------------------------------------------
    // State
    // --------------------------------------------------------

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

        providers:
            {},

        activeProvider:
            CONFIG.defaultProvider,

        lastRequest:
            null,

        lastResponse:
            null,

        errors:
            []

    };

    // --------------------------------------------------------
    // Event System
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

                } catch (
                    error
                ) {

                    console.error(
                        "[HalDoAIEngine] Event error:",
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

        } catch (
            error
        ) {}

    }

    // --------------------------------------------------------
    // Logging
    // --------------------------------------------------------

    function log(
        ...args
    ) {

        if (
            CONFIG.debug
        ) {

            console.log(
                "[HalDoAIEngine]",
                ...args
            );

        }

    }

    function warn(
        ...args
    ) {

        console.warn(
            "[HalDoAIEngine]",
            ...args
        );

    }

    // --------------------------------------------------------
    // Error Handling
    // --------------------------------------------------------

    function recordError(
        error,
        context = {}
    ) {

        const entry = {

            timestamp:
                Date.now(),

            message:
                error instanceof Error
                    ? error.message
                    : String(error),

            context

        };

        state.errors.push(
            entry
        );

        if (
            state.errors.length >
            50
        ) {

            state.errors.shift();

        }

        emit(
            "error",
            entry
        );

        return entry;
    }

    // --------------------------------------------------------
    // Utility
    // --------------------------------------------------------

    function cleanInput(
        input
    ) {

        let text;

        if (
            typeof input ===
            "string"
        ) {

            text =
                input;

        } else {

            text =
                input?.text ??
                input?.message ??
                input?.content ??
                "";

        }

        text =
            String(
                text
            )
            .trim();

        if (
            text.length >
            CONFIG.maxInputLength
        ) {

            text =
                text.slice(
                    0,
                    CONFIG.maxInputLength
                );

        }

        return text;
    }

    function normalizeResponse(
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

            return {

                text:
                    result,

                raw:
                    result

            };

        }

        if (
            typeof result ===
            "number" ||
            typeof result ===
            "boolean"
        ) {

            return {

                text:
                    String(
                        result
                    ),

                raw:
                    result

            };

        }

        if (
            result.text !==
            undefined
        ) {

            return {

                text:
                    String(
                        result.text
                    ),

                raw:
                    result

            };

        }

        if (
            result.content !==
            undefined
        ) {

            return {

                text:
                    String(
                        result.content
                    ),

                raw:
                    result

            };

        }

        if (
            result.message !==
            undefined
        ) {

            if (
                typeof result.message ===
                "string"
            ) {

                return {

                    text:
                        result.message,

                    raw:
                        result

                };

            }

            if (
                result.message?.content
            ) {

                return {

                    text:
                        String(
                            result.message.content
                        ),

                    raw:
                        result

                };

            }

        }

        try {

            return {

                text:
                    JSON.stringify(
                        result,
                        null,
                        2
                    ),

                raw:
                    result

            };

        } catch (
            error
        ) {

            return {

                text:
                    String(
                        result
                    ),

                raw:
                    result

            };

        }

    }

    // --------------------------------------------------------
    // Provider Registry
    // --------------------------------------------------------

    function registerProvider(
        name,
        provider,
        options = {}
    ) {

        if (
            !name ||
            !provider
        ) {

            return false;

        }

        state.providers[name] = {

            name,

            provider,

            enabled:
                options.enabled !==
                false,

            priority:
                Number(
                    options.priority ??
                    0
                ),

            type:
                options.type ||
                "custom",

            metadata:
                options.metadata ||
                {}

        };

        emit(
            "provider-registered",
            {
                name,
                provider:
                    state.providers[name]
            }
        );

        return true;
    }

    function unregisterProvider(
        name
    ) {

        if (
            !state.providers[name]
        ) {

            return false;

        }

        delete state.providers[
            name
        ];

        if (
            state.activeProvider ===
            name
        ) {

            state.activeProvider =
                CONFIG.defaultProvider;
        }

        emit(
            "provider-unregistered",
            {
                name
            }
        );

        return true;
    }

    function getProvider(
        name
    ) {

        const entry =
            state.providers[name];

        if (!entry) {

            return null;

        }

        if (
            entry.enabled ===
            false
        ) {

            return null;

        }

        return entry;

    }

    function getProviders() {

        return Object.values(
            state.providers
        )
        .filter(
            provider =>
                provider.enabled !==
                false
        )
        .sort(
            (a, b) =>
                b.priority -
                a.priority
        );

    }

    function setProvider(
        name
    ) {

        if (
            !state.providers[name]
        ) {

            return false;

        }

        state.activeProvider =
            name;

        emit(
            "provider-changed",
            {
                name
            }
        );

        return true;
    }

    // --------------------------------------------------------
    // Existing Module Resolver
    // --------------------------------------------------------

    function resolve(
        names
    ) {

        if (
            typeof names ===
            "string"
        ) {

            names =
                [names];

        }

        for (
            const name of names
        ) {

            if (
                window[name]
            ) {

                return window[name];

            }

            if (
                window.HalDoOS &&
                window.HalDoOS[name]
            ) {

                return window.HalDoOS[name];

            }

        }

        return null;
    }

    // --------------------------------------------------------
    // Local AI Provider
    // --------------------------------------------------------
    //
    // Dieser Provider ist bewusst sicher und funktioniert
    // auch ohne Internet und ohne API-Key.
    //
    // Später kann hier ein echter AI-Dienst angeschlossen
    // werden, ohne die Benutzeroberfläche umzubauen.
    // --------------------------------------------------------

    const localProvider = {

        async generate(
            payload
        ) {

            const text =
                cleanInput(
                    payload
                );

            return localResponse(
                text,
                payload
            );

        }

    };

    // --------------------------------------------------------
    // Local Response Engine
    // --------------------------------------------------------

    function localResponse(
        text,
        payload = {}
    ) {

        const value =
            text.toLowerCase();

        // ----------------------------------------------
        // Begrüßungen
        // ----------------------------------------------

        if (
            /^(hallo|hi|hey|hello|servus)\b/
                .test(value)
        ) {

            return {

                text:
                    "Hallo! Ich bin HalDo AI, " +
                    "die zentrale KI von HalDo AI OS 18.",

                provider:
                    "local"

            };

        }

        // ----------------------------------------------
        // Identität
        // ----------------------------------------------

        if (
            value.includes(
                "wer bist du"
            ) ||
            value.includes(
                "was bist du"
            )
        ) {

            return {

                text:
                    "Ich bin HalDo AI – die zentrale " +
                    "KI-Ebene von HalDo AI OS 18 " +
                    "Professional Ultimate Foundation.",

                provider:
                    "local"

            };

        }

        // ----------------------------------------------
        // Version
        // ----------------------------------------------

        if (
            value.includes(
                "version"
            )
        ) {

            return {

                text:
                    "HalDo AI OS 18 – " +
                    "Professional Ultimate Foundation.",

                provider:
                    "local"

            };

        }

        // ----------------------------------------------
        // Hilfe
        // ----------------------------------------------

        if (
            value.includes(
                "hilfe"
            ) ||
            value ===
            "help"
        ) {

            return {

                text:
                    "Ich kann Nachrichten verarbeiten, " +
                    "Befehle an die vorhandenen HalDo-" +
                    "AI-Module weitergeben, den Kontext " +
                    "verwalten und später mit echten " +
                    "AI-Providern verbunden werden.",

                provider:
                    "local"

            };

        }

        // ----------------------------------------------
        // Status
        // ----------------------------------------------

        if (
            value.includes(
                "status"
            ) ||
            value.includes(
                "systemstatus"
            )
        ) {

            return {

                text:
                    buildStatusResponse(),

                provider:
                    "local"

            };

        }

        // ----------------------------------------------
        // Zeit
        // ----------------------------------------------

        if (
            value.includes(
                "wie spät"
            ) ||
            value.includes(
                "uhrzeit"
            )
        ) {

            return {

                text:
                    "Die aktuelle Browserzeit ist " +
                    new Date()
                        .toLocaleTimeString(
                            "de-DE"
                        ) +
                    ".",

                provider:
                    "local"

            };

        }

        // ----------------------------------------------
        // Datum
        // ----------------------------------------------

        if (
            value.includes(
                "welcher tag"
            ) ||
            value.includes(
                "datum"
            )
        ) {

            return {

                text:
                    "Heute ist " +
                    new Date()
                        .toLocaleDateString(
                            "de-DE",
                            {
                                weekday:
                                    "long",

                                day:
                                    "2-digit",

                                month:
                                    "long",

                                year:
                                    "numeric"

                            }
                        ) +
                    ".",

                provider:
                    "local"

            };

        }

        // ----------------------------------------------
        // Danke
        // ----------------------------------------------

        if (
            value.includes(
                "danke"
            ) ||
            value.includes(
                "vielen dank"
            )
        ) {

            return {

                text:
                    "Sehr gerne. Wir bauen HalDo AI OS 18 " +
                    "Schritt für Schritt weiter.",

                provider:
                    "local"

            };

        }

        // ----------------------------------------------
        // Fallback
        // ----------------------------------------------

        return {

            text:
                "Ich habe deine Nachricht empfangen. " +
                "Die lokale HalDo-AI-Engine ist aktiv. " +
                "Für komplexere Antworten kann später " +
                "ein echter AI-Provider angeschlossen " +
                "werden, ohne die Oberfläche oder " +
                "Systemarchitektur neu aufzubauen.",

            provider:
                "local",

            fallback:
                true

        };

    }

    // --------------------------------------------------------
    // Status Response
    // --------------------------------------------------------

    function buildStatusResponse() {

        const core =
            resolve(
                [
                    "HalDoAICore",
                    "aiCore"
                ]
            );

        let coreStatus =
            null;

        if (
            core &&
            typeof core.getStatus ===
            "function"
        ) {

            try {

                coreStatus =
                    core.getStatus();

            } catch (
                error
            ) {}

        }

        const modules =
            Object.keys(
                state.providers
            );

        return (
            "HalDo AI Engine Status:\n\n" +

            "Engine: bereit\n" +

            "Version: " +
            CONFIG.version +
            "\n" +

            "Modus: " +
            CONFIG.mode +
            "\n" +

            "Provider: " +
            (
                modules.length
                    ? modules.join(", ")
                    : "local"
            ) +
            "\n" +

            "Anfragen: " +
            state.requestCount +
            "\n" +

            "Erfolgreich: " +
            state.successfulRequests +
            "\n" +

            "Fehler: " +
            state.failedRequests +

            (
                coreStatus
                    ? (
                        "\n\nCore: " +
                        (
                            coreStatus.ready
                                ? "bereit"
                                : "wird geladen"
                        )
                    )
                    : ""
            )
        );

    }

    // --------------------------------------------------------
    // Context Builder
    // --------------------------------------------------------

    function buildContext(
        options = {}
    ) {

        let history =
            options.history;

        if (
            !Array.isArray(
                history
            )
        ) {

            const core =
                resolve(
                    [
                        "HalDoAICore",
                        "aiCore"
                    ]
                );

            if (
                core &&
                typeof core.getHistory ===
                "function"
            ) {

                try {

                    history =
                        core.getHistory(
                            CONFIG.maxContextMessages
                        );

                } catch (
                    error
                ) {

                    history =
                        [];

                }

            }

        }

        if (
            !Array.isArray(
                history
            )
        ) {

            history =
                [];

        }

        return {

            system:
                "HalDo AI OS 18 " +
                "Professional Ultimate Foundation",

            engine:
                CONFIG.name,

            version:
                CONFIG.version,

            language:
                options.language ||
                document.documentElement.lang ||
                "de-DE",

            history:
                history.slice(
                    -CONFIG.maxContextMessages
                ),

            timestamp:
                Date.now(),

            online:
                navigator.onLine

        };

    }

    // --------------------------------------------------------
    // Provider Execution
    // --------------------------------------------------------

    async function executeProvider(
        entry,
        payload
    ) {

        if (
            !entry ||
            !entry.provider
        ) {

            return null;

        }

        const provider =
            entry.provider;

        const methods = [
            "generate",
            "generateResponse",
            "complete",
            "chat",
            "ask",
            "process",
            "run"
        ];

        for (
            const method of methods
        ) {

            if (
                typeof provider[method] !==
                "function"
            ) {

                continue;

            }

            try {

                const result =
                    provider[method](
                        payload
                    );

                const resolved =
                    result &&
                    typeof result.then ===
                    "function"
                        ? await result
                        : result;

                const normalized =
                    normalizeResponse(
                        resolved
                    );

                if (
                    normalized &&
                    normalized.text
                ) {

                    normalized.provider =
                        entry.name;

                    return normalized;

                }

            } catch (
                error
            ) {

                recordError(
                    error,
                    {
                        provider:
                            entry.name,

                        method

                    }
                );

                warn(
                    `Provider ${entry.name} fehlgeschlagen.`,
                    error
                );

            }

        }

        return null;
    }

    // --------------------------------------------------------
    // Main Generate Function
    // --------------------------------------------------------

    async function generate(
        input,
        options = {}
    ) {

        const text =
            cleanInput(
                input
            );

        if (!text) {

            return {

                ok:
                    false,

                text:
                    "",

                error:
                    "EMPTY_INPUT"

            };

        }

        state.requestCount++;

        const requestId =
            state.requestCount;

        state.processing =
            true;

        state.lastRequest = {

            id:
                requestId,

            text,

            timestamp:
                Date.now()

        };

        emit(
            "request-start",
            {
                requestId,
                text
            }
        );

        try {

            const context =
                buildContext(
                    options
                );

            const payload = {

                text,

                message:
                    text,

                input:
                    text,

                context,

                history:
                    context.history,

                language:
                    context.language,

                system:
                    context.system,

                version:
                    CONFIG.version,

                requestId,

                options

            };

            /*
             * Bevorzugter Provider.
             */

            const preferred =
                options.provider ||
                state.activeProvider ||
                CONFIG.defaultProvider;

            let response =
                null;

            const preferredProvider =
                getProvider(
                    preferred
                );

            if (
                preferredProvider
            ) {

                response =
                    await executeProvider(
                        preferredProvider,
                        payload
                    );

            }

            /*
             * Falls der bevorzugte Provider
             * keine Antwort liefert, werden
             * weitere Provider ausprobiert.
             */

            if (
                !response &&
                options.allowFallback !==
                false
            ) {

                const providers =
                    getProviders();

                for (
                    const provider of providers
                ) {

                    if (
                        provider.name ===
                        preferred
                    ) {

                        continue;

                    }

                    response =
                        await executeProvider(
                            provider,
                            payload
                        );

                    if (
                        response
                    ) {

                        break;

                    }

                }

            }

            /*
             * Lokaler Fallback.
             */

            if (
                !response
            ) {

                response =
                    normalizeResponse(
                        localResponse(
                            text,
                            payload
                        )
                    );

            }

            const result = {

                ok:
                    true,

                requestId,

                text:
                    response?.text ||
                    "",

                provider:
                    response?.provider ||
                    "local",

                fallback:
                    Boolean(
                        response?.fallback
                    ),

                raw:
                    response?.raw ??
                    null,

                timestamp:
                    Date.now()

            };

            state.successfulRequests++;

            state.lastResponse =
                result;

            emit(
                "response",
                result
            );

            return result;

        } catch (
            error
        ) {

            state.failedRequests++;

            recordError(
                error,
                {
                    requestId,
                    text
                }
            );

            const fallback =
                localResponse(
                    text,
                    {}
                );

            const result = {

                ok:
                    false,

                requestId,

                text:
                    fallback.text,

                provider:
                    "local",

                fallback:
                    true,

                error

            };

            state.lastResponse =
                result;

            emit(
                "response",
                result
            );

            return result;

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
    // Aliases
    // --------------------------------------------------------

    async function generateResponse(
        input,
        options = {}
    ) {

        return generate(
            input,
            options
        );

    }

    async function ask(
        input,
        options = {}
    ) {

        return generate(
            input,
            options
        );

    }

    async function process(
        input,
        options = {}
    ) {

        return generate(
            input,
            options
        );

    }

    async function run(
        input,
        options = {}
    ) {

        return generate(
            input,
            options
        );

    }

    // --------------------------------------------------------
    // Provider: Local
    // --------------------------------------------------------

    registerProvider(
        "local",
        localProvider,
        {
            type:
                "local",

            priority:
                1,

            enabled:
                true
        }
    );

    // --------------------------------------------------------
    // External Provider Registration API
    // --------------------------------------------------------

    function registerExternalProvider(
        name,
        provider,
        options = {}
    ) {

        return registerProvider(
            name,
            provider,
            {
                ...options,

                type:
                    options.type ||
                    "external"
            }
        );

    }

    // --------------------------------------------------------
    // Fetch-Based Provider Factory
    // --------------------------------------------------------
    //
    // Kein API-Key wird hier gespeichert.
    //
    // Ein späterer Provider kann z.B. so registriert werden:
    //
    // HalDoAIEngine.registerFetchProvider(...)
    //
    // Die URL und Authentifizierung bleiben außerhalb
    // dieser Engine konfigurierbar.
    // --------------------------------------------------------

    function createFetchProvider(
        options = {}
    ) {

        const endpoint =
            options.endpoint;

        if (!endpoint) {

            throw new Error(
                "Fetch Provider benötigt einen Endpoint."
            );

        }

        return {

            async generate(
                payload
            ) {

                const controller =
                    new AbortController();

                const timeout =
                    window.setTimeout(
                        () =>
                            controller.abort(),
                        options.timeout ||
                        CONFIG.timeout
                    );

                try {

                    const headers = {

                        "Content-Type":
                            "application/json",

                        ...(options.headers ||
                            {})

                    };

                    const body =
                        typeof options.bodyBuilder ===
                        "function"

                            ? options.bodyBuilder(
                                payload
                            )

                            : {

                                message:
                                    payload.text,

                                input:
                                    payload.text,

                                history:
                                    payload.history,

                                language:
                                    payload.language,

                                system:
                                    payload.system

                            };

                    const response =
                        await fetch(
                            endpoint,
                            {

                                method:
                                    "POST",

                                headers,

                                body:
                                    JSON.stringify(
                                        body
                                    ),

                                signal:
                                    controller.signal

                            }
                        );

                    if (
                        !response.ok
                    ) {

                        throw new Error(
                            `HTTP ${response.status}`
                        );

                    }

                    const data =
                        await response.json();

                    if (
                        typeof options.responseParser ===
                        "function"
                    ) {

                        return options.responseParser(
                            data
                        );

                    }

                    return data;

                } finally {

                    window.clearTimeout(
                        timeout
                    );

                }

            }

        };

    }

    // --------------------------------------------------------
    // Status
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

            activeProvider:
                state.activeProvider,

            providers:
                Object.keys(
                    state.providers
                ),

            requestCount:
                state.requestCount,

            successfulRequests:
                state.successfulRequests,

            failedRequests:
                state.failedRequests,

            errorCount:
                state.errors.length,

            lastRequest:
                state.lastRequest,

            lastResponse:
                state.lastResponse

        };

    }

    // --------------------------------------------------------
    // Reset
    // --------------------------------------------------------

    function reset() {

        state.processing =
            false;

        state.requestCount =
            0;

        state.successfulRequests =
            0;

        state.failedRequests =
            0;

        state.lastRequest =
            null;

        state.lastResponse =
            null;

        state.errors =
            [];

        emit(
            "reset"
        );

        return true;

    }

    // --------------------------------------------------------
    // Initialization
    // --------------------------------------------------------

    function initialize() {

        if (
            state.initialized
        ) {

            return getStatus();

        }

        state.initialized =
            true;

        /*
         * Falls ai-core.js bereits existiert,
         * registrieren wir uns dort.
         */

        const core =
            resolve(
                [
                    "HalDoAICore",
                    "aiCore"
                ]
            );

        if (
            core &&
            typeof core.registerModule ===
            "function"
        ) {

            try {

                core.registerModule(
                    "engine",
                    api
                );

            } catch (
                error
            ) {

                recordError(
                    error,
                    {
                        phase:
                            "core-registration"
                    }
                );

            }

        }

        emit(
            "initialized",
            {
                status:
                    getStatus()
            }
        );

        window.setTimeout(
            () => {

                state.ready =
                    true;

                emit(
                    "ready",
                    {
                        status:
                            getStatus()
                    }
                );

                console.log(
                    "[HalDoAIEngine] " +
                    "HalDo AI Engine 18 bereit."
                );

            },
            0
        );

        return getStatus();

    }

    // --------------------------------------------------------
    // Public API
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

        generate,

        generateResponse,

        ask,

        process,

        run,

        registerProvider,

        registerExternalProvider,

        unregisterProvider,

        getProvider,

        getProviders,

        setProvider,

        createFetchProvider,

        getStatus,

        reset

    };

    // --------------------------------------------------------
    // Global APIs
    // --------------------------------------------------------

    window.HalDoAIEngine =
        api;

    window.HalDoOS.aiEngine =
        api;

    // --------------------------------------------------------
    // Document Integration
    // --------------------------------------------------------

    document.addEventListener(
        "haldo:ai-engine-request",
        event => {

            const text =
                event.detail?.text ??
                event.detail?.message;

            if (
                text
            ) {

                generate(
                    text,
                    event.detail?.options ||
                    {}
                );

            }

        }
    );

    // --------------------------------------------------------
    // DOM Ready
    // --------------------------------------------------------

    function boot() {

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
                once:
                    true
            }
        );

    } else {

        boot();

    }

})(window, document);

// ============================================================
// END OF PART 73
// ============================================================