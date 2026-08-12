// ============================================================
// HALDO AI OS 18
// AI LANGUAGE ENGINE
// PART 82
// ============================================================

(function (window, document) {

    "use strict";

    if (
        window.HalDoAILanguage &&
        window.HalDoAILanguage.__haldoAI18
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    const CONFIG = {

        name:
            "HalDo AI Language Engine",

        version:
            "18.0.0",

        defaultLanguage:
            "de",

        fallbackLanguage:
            "en",

        storageKey:
            "haldo-ai-language",

        supportedLanguages: [

            "de",
            "en",
            "ku",
            "ar",
            "tr",
            "fr",
            "es",
            "it",
            "nl",
            "ru",
            "fa",
            "ja",
            "ko",
            "zh"

        ],

        /*
         * Êzîdî / Ezidi wird als eigener
         * Sprach-/Tastaturkontext vorbereitet.
         */
        ezidi: {

            enabled:
                true,

            code:
                "ez",

            name:
                "Êzîdî",

            keyboard:
                true

        }

    };

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    const state = {

        initialized:
            false,

        ready:
            false,

        language:
            CONFIG.defaultLanguage,

        previousLanguage:
            null,

        direction:
            "ltr",

        detectedLanguage:
            null,

        confidence:
            0,

        available:
            [],

        history:
            [],

        translations:
            {},

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
                const callback of
                set
            ) {

                try {

                    callback(
                        detail
                    );

                } catch (
                    error
                ) {

                    console.error(
                        "[HalDoAILanguage]",
                        error
                    );

                }

            }

        }

        try {

            document.dispatchEvent(
                new CustomEvent(
                    `haldo:ai-language:${event}`,
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
    // UTILITIES
    // --------------------------------------------------------

    function clean(
        value
    ) {

        return String(
            value ??
            ""
        ).trim();

    }

    function normalizeCode(
        language
    ) {

        const value =
            clean(
                language
            )
            .toLowerCase()
            .replace(
                "_",
                "-"
            );

        const aliases = {

            german:
                "de",

            deutsch:
                "de",

            english:
                "en",

            englisch:
                "en",

            kurdish:
                "ku",

            kurmanci:
                "ku",

            kurmanji:
                "ku",

            arabic:
                "ar",

            arabisch:
                "ar",

            turkish:
                "tr",

            türkisch:
                "tr",

            french:
                "fr",

            französisch:
                "fr",

            spanish:
                "es",

            spanisch:
                "es",

            italian:
                "it",

            italienisch:
                "it",

            dutch:
                "nl",

            niederländisch:
                "nl",

            russian:
                "ru",

            russisch:
                "ru",

            persian:
                "fa",

            farsi:
                "fa",

            japanese:
                "ja",

            korean:
                "ko",

            chinese:
                "zh",

            ezidi:
                "ez",

            yezidi:
                "ez",

            yazidi:
                "ez",

            êzîdî:
                "ez",

            ezidî:
                "ez"

        };

        return (
            aliases[value] ||
            value
        );

    }

    function getDirection(
        language
    ) {

        const code =
            normalizeCode(
                language
            );

        if (
            [
                "ar",
                "fa"
            ].includes(
                code
            )
        ) {

            return "rtl";

        }

        return "ltr";

    }

    // --------------------------------------------------------
    // LANGUAGE INFO
    // --------------------------------------------------------

    const LANGUAGE_INFO = {

        de: {

            code:
                "de",

            name:
                "Deutsch",

            nativeName:
                "Deutsch",

            direction:
                "ltr"

        },

        en: {

            code:
                "en",

            name:
                "English",

            nativeName:
                "English",

            direction:
                "ltr"

        },

        ku: {

            code:
                "ku",

            name:
                "Kurdî",

            nativeName:
                "Kurdî",

            direction:
                "ltr"

        },

        ar: {

            code:
                "ar",

            name:
                "Arabic",

            nativeName:
                "العربية",

            direction:
                "rtl"

        },

        tr: {

            code:
                "tr",

            name:
                "Türkçe",

            nativeName:
                "Türkçe",

            direction:
                "ltr"

        },

        fr: {

            code:
                "fr",

            name:
                "Français",

            nativeName:
                "Français",

            direction:
                "ltr"

        },

        es: {

            code:
                "es",

            name:
                "Español",

            nativeName:
                "Español",

            direction:
                "ltr"

        },

        it: {

            code:
                "it",

            name:
                "Italiano",

            nativeName:
                "Italiano",

            direction:
                "ltr"

        },

        nl: {

            code:
                "nl",

            name:
                "Nederlands",

            nativeName:
                "Nederlands",

            direction:
                "ltr"

        },

        ru: {

            code:
                "ru",

            name:
                "Русский",

            nativeName:
                "Русский",

            direction:
                "ltr"

        },

        fa: {

            code:
                "fa",

            name:
                "فارسی",

            nativeName:
                "فارسی",

            direction:
                "rtl"

        },

        ja: {

            code:
                "ja",

            name:
                "Japanese",

            nativeName:
                "日本語",

            direction:
                "ltr"

        },

        ko: {

            code:
                "ko",

            name:
                "Korean",

            nativeName:
                "한국어",

            direction:
                "ltr"

        },

        zh: {

            code:
                "zh",

            name:
                "Chinese",

            nativeName:
                "中文",

            direction:
                "ltr"

        },

        ez: {

            code:
                "ez",

            name:
                "Êzîdî",

            nativeName:
                "Êzîdî",

            direction:
                "ltr",

            keyboard:
                true

        }

    };

    // --------------------------------------------------------
    // STORAGE
    // --------------------------------------------------------

    function getStorage() {

        return (
            window.HalDoStorage ||
            window.HalDoStorageManager ||
            window.HalDoOS?.storage ||
            window.HalDoOS?.storageManager ||
            null
        );

    }

    async function storageSet(
        key,
        value
    ) {

        const storage =
            getStorage();

        if (storage) {

            for (
                const method of [
                    "set",
                    "save",
                    "write",
                    "store"
                ]
            ) {

                if (
                    typeof storage[method] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    await storage[method](
                        key,
                        value
                    );

                    return true;

                } catch (
                    error
                ) {}

            }

        }

        try {

            localStorage.setItem(
                key,
                JSON.stringify(
                    value
                )
            );

            return true;

        } catch (
            error
        ) {

            return false;

        }

    }

    async function storageGet(
        key,
        fallback = null
    ) {

        const storage =
            getStorage();

        if (storage) {

            for (
                const method of [
                    "get",
                    "load",
                    "read",
                    "retrieve"
                ]
            ) {

                if (
                    typeof storage[method] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const value =
                        await storage[method](
                            key
                        );

                    if (
                        value !==
                        undefined &&
                        value !==
                        null
                    ) {

                        return value;

                    }

                } catch (
                    error
                ) {}

            }

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

        } catch (
            error
        ) {

            return fallback;

        }

    }

    // --------------------------------------------------------
    // LANGUAGE INFO
    // --------------------------------------------------------

    function getLanguageInfo(
        language =
            state.language
    ) {

        const code =
            normalizeCode(
                language
            );

        return (
            LANGUAGE_INFO[code] ||
            {

                code,

                name:
                    code,

                nativeName:
                    code,

                direction:
                    getDirection(
                        code
                    )

            }
        );

    }

    function getSupportedLanguages() {

        return Object.values(
            LANGUAGE_INFO
        ).map(
            language => ({
                ...language
            })
        );

    }

    function isSupported(
        language
    ) {

        const code =
            normalizeCode(
                language
            );

        return Boolean(
            LANGUAGE_INFO[code]
        );

    }

    // --------------------------------------------------------
    // SET LANGUAGE
    // --------------------------------------------------------

    async function setLanguage(
        language,
        options = {}
    ) {

        const code =
            normalizeCode(
                language
            );

        if (
            !isSupported(
                code
            )
        ) {

            /*
             * Êzîdî darf über die
             * Tastatur-/Erweiterungsschicht
             * trotzdem vorbereitet werden.
             */

            if (
                code !==
                "ez"
            ) {

                return {

                    ok:
                        false,

                    error:
                        "LANGUAGE_NOT_SUPPORTED",

                    language:
                        code

                };

            }

        }

        if (
            state.language ===
            code
        ) {

            return {

                ok:
                    true,

                changed:
                    false,

                language:
                    code

            };

        }

        state.previousLanguage =
            state.language;

        state.language =
            code;

        state.direction =
            getDirection(
                code
            );

        state.history.push({

            from:
                state.previousLanguage,

            to:
                code,

            timestamp:
                Date.now(),

            source:
                options.source ||
                "system"

        });

        if (
            state.history.length >
            100
        ) {

            state.history.shift();

        }

        await storageSet(
            CONFIG.storageKey,
            {

                language:
                    state.language,

                direction:
                    state.direction,

                updatedAt:
                    Date.now()

            }
        );

        /*
         * Conversation State aktualisieren.
         */

        const conversationState =
            window.HalDoConversationState ||
            window.HalDoOS?.conversationState;

        if (
            conversationState &&
            typeof conversationState.setLanguage ===
            "function"
        ) {

            try {

                conversationState.setLanguage(
                    code
                );

            } catch (
                error
            ) {}

        }

        /*
         * HTML-Sprachstatus aktualisieren.
         */

        try {

            document.documentElement
                .setAttribute(
                    "lang",
                    code
                );

            document.documentElement
                .setAttribute(
                    "dir",
                    state.direction
                );

        } catch (
            error
        ) {}

        emit(
            "language-changed",
            {

                language:
                    code,

                previousLanguage:
                    state.previousLanguage,

                direction:
                    state.direction,

                info:
                    getLanguageInfo(
                        code
                    ),

                source:
                    options.source ||
                    "system"

            }
        );

        return {

            ok:
                true,

            changed:
                true,

            language:
                code,

            previousLanguage:
                state.previousLanguage,

            direction:
                state.direction

        };

    }

    function getLanguage() {

        return state.language;

    }

    function getCurrentLanguage() {

        return getLanguageInfo(
            state.language
        );

    }

    // --------------------------------------------------------
    // LANGUAGE DETECTION
    // --------------------------------------------------------

    function detectLanguage(
        text
    ) {

        const input =
            clean(
                text
            );

        if (!input) {

            return {

                language:
                    state.language,

                confidence:
                    0

            };

        }

        const lower =
            input.toLowerCase();

        const scores = {};

        for (
            const code of
            Object.keys(
                LANGUAGE_INFO
            )
        ) {

            scores[code] =
                0;

        }

        /*
         * Deutsche Marker.
         */

        [
            "der",
            "die",
            "das",
            "und",
            "ich",
            "nicht",
            "ist",
            "für",
            "mit",
            "eine",
            "einen",
            "bitte",
            "öffne",
            "öffnen"
        ].forEach(
            word => {

                if (
                    lower.includes(
                        word
                    )
                ) {

                    scores.de +=
                        2;

                }

            }
        );

        /*
         * English.
         */

        [
            "the",
            "and",
            "you",
            "this",
            "that",
            "what",
            "how",
            "please",
            "open",
            "show"
        ].forEach(
            word => {

                if (
                    lower.includes(
                        word
                    )
                ) {

                    scores.en +=
                        2;

                }

            }
        );

        /*
         * Türkçe.
         */

        [
            "bir",
            "ve",
            "ben",
            "sen",
            "için",
            "değil",
            "nasıl",
            "aç",
            "göster"
        ].forEach(
            word => {

                if (
                    lower.includes(
                        word
                    )
                ) {

                    scores.tr +=
                        2;

                }

            }
        );

        /*
         * العربية.
         */

        if (
            /[\u0600-\u06ff]/.test(
                input
            )
        ) {

            scores.ar +=
                10;

            scores.fa +=
                4;

        }

        /*
         * Русский.
         */

        if (
            /[\u0400-\u04ff]/.test(
                input
            )
        ) {

            scores.ru +=
                10;

        }

        /*
         * 日本語.
         */

        if (
            /[\u3040-\u30ff]/.test(
                input
            )
        ) {

            scores.ja +=
                10;

        }

        /*
         * 한국어.
         */

        if (
            /[\uac00-\ud7af]/.test(
                input
            )
        ) {

            scores.ko +=
                10;

        }

        /*
         * 中文.
         */

        if (
            /[\u4e00-\u9fff]/.test(
                input
            )
        ) {

            scores.zh +=
                10;

        }

        /*
         * Kurdische Marker.
         */

        [
            "ez",
            "em",
            "tu",
            "çawa",
            "baş",
            "spas",
            "kurdî",
            "xweş"
        ].forEach(
            word => {

                if (
                    lower.includes(
                        word
                    )
                ) {

                    scores.ku +=
                        3;

                }

            }
        );

        /*
         * Êzîdî-/Ezidi-Kontext.
         */

        [
            "êzîdî",
            "ezidî",
            "ezidi",
            "yezidi",
            "ezîdî"
        ].forEach(
            word => {

                if (
                    lower.includes(
                        word
                    )
                ) {

                    scores.ez +=
                        8;

                }

            }
        );

        let bestLanguage =
            state.language;

        let bestScore =
            scores[
                bestLanguage
            ] || 0;

        Object.keys(
            scores
        ).forEach(
            code => {

                if (
                    scores[code] >
                    bestScore
                ) {

                    bestScore =
                        scores[code];

                    bestLanguage =
                        code;

                }

            }
        );

        const confidence =
            Math.min(
                1,
                bestScore /
                10
            );

        state.detectedLanguage =
            bestLanguage;

        state.confidence =
            confidence;

        emit(
            "language-detected",
            {

                text:
                    input,

                language:
                    bestLanguage,

                confidence,

                scores

            }
        );

        return {

            language:
                bestLanguage,

            confidence,

            scores

        };

    }

    // --------------------------------------------------------
    // TRANSLATION DICTIONARY
    // --------------------------------------------------------

    function registerTranslations(
        language,
        dictionary
    ) {

        const code =
            normalizeCode(
                language
            );

        if (
            !dictionary ||
            typeof dictionary !==
            "object"
        ) {

            return false;

        }

        state.translations[
            code
        ] = {

            ...(
                state.translations[
                    code
                ] || {}
            ),

            ...dictionary

        };

        emit(
            "translations-registered",
            {

                language:
                    code,

                count:
                    Object.keys(
                        dictionary
                    ).length

            }
        );

        return true;

    }

    function translate(
        key,
        language =
            state.language,
        fallback = null
    ) {

        const code =
            normalizeCode(
                language
            );

        const dictionary =
            state.translations[
                code
            ];

        if (
            dictionary &&
            dictionary[key] !==
            undefined
        ) {

            return dictionary[key];

        }

        if (
            fallback !==
            null
        ) {

            return fallback;

        }

        return key;

    }

    // --------------------------------------------------------
    // UI LANGUAGE
    // --------------------------------------------------------

    function applyToDocument() {

        try {

            document.documentElement
                .setAttribute(
                    "lang",
                    state.language
                );

            document.documentElement
                .setAttribute(
                    "dir",
                    state.direction
                );

            document.body
                ?.setAttribute(
                    "data-language",
                    state.language
                );

            document.body
                ?.setAttribute(
                    "data-direction",
                    state.direction
                );

        } catch (
            error
        ) {}

        emit(
            "document-updated",
            {

                language:
                    state.language,

                direction:
                    state.direction

            }
        );

        return true;

    }

    // --------------------------------------------------------
    // ÊZÎDÎ KEYBOARD CONNECTION
    // --------------------------------------------------------

    function getEzidiKeyboard() {

        return (
            window.HalDoEzidiKeyboard ||
            window.HalDoOS?.ezidiKeyboard ||
            null
        );

    }

    function enableEzidiMode() {

        const keyboard =
            getEzidiKeyboard();

        if (
            keyboard &&
            typeof keyboard.enable ===
            "function"
        ) {

            try {

                keyboard.enable();

            } catch (
                error
            ) {}

        }

        emit(
            "ezidi-mode-enabled"
        );

        return true;

    }

    function disableEzidiMode() {

        const keyboard =
            getEzidiKeyboard();

        if (
            keyboard &&
            typeof keyboard.disable ===
            "function"
        ) {

            try {

                keyboard.disable();

            } catch (
                error
            ) {}

        }

        emit(
            "ezidi-mode-disabled"
        );

        return true;

    }

    async function setEzidiLanguage(
        options = {}
    ) {

        const result =
            await setLanguage(
                "ez",
                {

                    ...options,

                    source:
                        options.source ||
                        "ezidi-keyboard"

                }
            );

        if (
            result.ok
        ) {

            enableEzidiMode();

        }

        return result;

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

            initialized:
                state.initialized,

            ready:
                state.ready,

            language:
                state.language,

            previousLanguage:
                state.previousLanguage,

            direction:
                state.direction,

            detectedLanguage:
                state.detectedLanguage,

            confidence:
                state.confidence,

            supportedLanguages:
                getSupportedLanguages(),

            ezidi: {

                enabled:
                    CONFIG.ezidi.enabled,

                code:
                    CONFIG.ezidi.code,

                keyboard:
                    Boolean(
                        getEzidiKeyboard()
                    )

            },

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

        /*
         * Gespeicherte Sprache laden.
         */

        const stored =
            await storageGet(
                CONFIG.storageKey,
                null
            );

        if (
            stored?.language &&
            isSupported(
                stored.language
            )
        ) {

            state.language =
                normalizeCode(
                    stored.language
                );

        }

        state.direction =
            getDirection(
                state.language
            );

        /*
         * Grundübersetzungen.
         */

        registerTranslations(
            "de",
            {

                welcome:
                    "Willkommen bei HalDo AI.",

                loading:
                    "HalDo AI wird geladen…",

                ready:
                    "HalDo AI ist bereit.",

                error:
                    "Es ist ein Fehler aufgetreten.",

                thinking:
                    "HalDo AI denkt…",

                listening:
                    "HalDo AI hört zu…"

            }
        );

        registerTranslations(
            "en",
            {

                welcome:
                    "Welcome to HalDo AI.",

                loading:
                    "HalDo AI is loading…",

                ready:
                    "HalDo AI is ready.",

                error:
                    "An error occurred.",

                thinking:
                    "HalDo AI is thinking…",

                listening:
                    "HalDo AI is listening…"

            }
        );

        registerTranslations(
            "ez",
            {

                welcome:
                    "Bi xêr hatî HalDo AI.",

                loading:
                    "HalDo AI tê barkirin…",

                ready:
                    "HalDo AI amade ye.",

                error:
                    "Çewtiyek çêbû.",

                thinking:
                    "HalDo AI difikire…",

                listening:
                    "HalDo AI guhdarî dike…"

            }
        );

        /*
         * Dokument aktualisieren.
         */

        applyToDocument();

        /*
         * Conversation State verbinden.
         */

        const conversationState =
            window.HalDoConversationState ||
            window.HalDoOS?.conversationState;

        if (
            conversationState &&
            typeof conversationState.on ===
            "function"
        ) {

            conversationState.on(
                "language-changed",
                detail => {

                    if (
                        detail?.language &&
                        detail.language !==
                        state.language
                    ) {

                        setLanguage(
                            detail.language,
                            {
                                source:
                                    "conversation-state"
                            }
                        );

                    }

                }
            );

        }

        /*
         * Kernel registrieren.
         */

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
                    "ai-language",
                    api
                );

            } catch (
                error
            ) {}

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

        getLanguage,

        getCurrentLanguage,

        getLanguageInfo,

        getSupportedLanguages,

        isSupported,

        setLanguage,

        changeLanguage:
            setLanguage,

        detectLanguage,

        registerTranslations,

        translate,

        applyToDocument,

        getDirection,

        enableEzidiMode,

        disableEzidiMode,

        setEzidiLanguage,

        getStatus

    };

    // --------------------------------------------------------
    // GLOBAL REGISTRATION
    // --------------------------------------------------------

    window.HalDoAILanguage =
        api;

    window.HalDoOS.aiLanguage =
        api;

    // --------------------------------------------------------
    // BOOT
    // --------------------------------------------------------

    async function boot() {

        try {

            await initialize();

        } catch (
            error
        ) {

            recordError(
                error
            );

            console.error(
                "[HalDoAILanguage] " +
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
// END OF PART 82
// ============================================================