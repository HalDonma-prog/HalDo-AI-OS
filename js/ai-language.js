// ============================================================
// HALDO AI OS 18
// AI LANGUAGE ENGINE
// PART 77
// ============================================================
// Zentrale Sprachverwaltung für HalDo AI.
//
// Verantwortlich für:
//
// • Spracherkennung
// • Sprachprofile
// • Übersetzungsgrundlagen
// • Sprachwechsel
// • Text-Normalisierung
// • Sprach-Erkennung
// • AI-Kommandos
// • Chat-Verbindung
// • Êzîdî-/Ezidi-Vorbereitung
// • RTL/LTR-Unterstützung
// • Sprachereignisse
//
// Öffentliche APIs:
//
// window.HalDoAILanguage
// window.HalDoOS.aiLanguage
//
// ============================================================

(function (window, document) {

    "use strict";

    // --------------------------------------------------------
    // Duplicate Guard
    // --------------------------------------------------------

    if (
        window.HalDoAILanguage &&
        window.HalDoAILanguage.__haldoAI18
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    // --------------------------------------------------------
    // Configuration
    // --------------------------------------------------------

    const CONFIG = {

        name:
            "HalDo AI Language Engine",

        version:
            "18.0.0",

        defaultLanguage:
            "de",

        fallbackLanguage:
            "en",

        supportedLanguages: [

            "de",
            "en",
            "ku",
            "ckb",
            "ar",
            "tr",
            "fr",
            "es",
            "it",
            "nl",
            "ru",
            "fa"

        ],

        ezidiLanguages: [

            "ku",
            "ckb"

        ],

        directionMap: {

            de: "ltr",
            en: "ltr",
            ku: "ltr",
            ckb: "rtl",
            ar: "rtl",
            tr: "ltr",
            fr: "ltr",
            es: "ltr",
            it: "ltr",
            nl: "ltr",
            ru: "ltr",
            fa: "rtl"

        },

        persistLanguage:
            true,

        storageKey:
            "haldo.ai.language"

    };

    // --------------------------------------------------------
    // Language Profiles
    // --------------------------------------------------------

    const LANGUAGE_PROFILES = {

        de: {

            code:
                "de",

            locale:
                "de-DE",

            name:
                "Deutsch",

            nativeName:
                "Deutsch",

            direction:
                "ltr",

            family:
                "Germanic",

            ezidi:
                false

        },

        en: {

            code:
                "en",

            locale:
                "en-US",

            name:
                "English",

            nativeName:
                "English",

            direction:
                "ltr",

            family:
                "Germanic",

            ezidi:
                false

        },

        ku: {

            code:
                "ku",

            locale:
                "ku-TR",

            name:
                "Kurdisch",

            nativeName:
                "Kurdî",

            direction:
                "ltr",

            family:
                "Kurdish",

            ezidi:
                true,

            variants: [

                "Kurmanji",
                "Kurmancî"

            ]

        },

        ckb: {

            code:
                "ckb",

            locale:
                "ckb-IQ",

            name:
                "Zentralkurdisch",

            nativeName:
                "کوردی",

            direction:
                "rtl",

            family:
                "Kurdish",

            ezidi:
                true,

            variants: [

                "Sorani"

            ]

        },

        ar: {

            code:
                "ar",

            locale:
                "ar-SA",

            name:
                "Arabisch",

            nativeName:
                "العربية",

            direction:
                "rtl",

            family:
                "Semitic",

            ezidi:
                false

        },

        tr: {

            code:
                "tr",

            locale:
                "tr-TR",

            name:
                "Türkisch",

            nativeName:
                "Türkçe",

            direction:
                "ltr",

            family:
                "Turkic",

            ezidi:
                false

        },

        fr: {

            code:
                "fr",

            locale:
                "fr-FR",

            name:
                "Französisch",

            nativeName:
                "Français",

            direction:
                "ltr",

            family:
                "Romance",

            ezidi:
                false

        },

        es: {

            code:
                "es",

            locale:
                "es-ES",

            name:
                "Spanisch",

            nativeName:
                "Español",

            direction:
                "ltr",

            family:
                "Romance",

            ezidi:
                false

        },

        it: {

            code:
                "it",

            locale:
                "it-IT",

            name:
                "Italienisch",

            nativeName:
                "Italiano",

            direction:
                "ltr",

            family:
                "Romance",

            ezidi:
                false

        },

        nl: {

            code:
                "nl",

            locale:
                "nl-NL",

            name:
                "Niederländisch",

            nativeName:
                "Nederlands",

            direction:
                "ltr",

            family:
                "Germanic",

            ezidi:
                false

        },

        ru: {

            code:
                "ru",

            locale:
                "ru-RU",

            name:
                "Russisch",

            nativeName:
                "Русский",

            direction:
                "ltr",

            family:
                "Slavic",

            ezidi:
                false

        },

        fa: {

            code:
                "fa",

            locale:
                "fa-IR",

            name:
                "Persisch",

            nativeName:
                "فارسی",

            direction:
                "rtl",

            family:
                "Indo-Iranian",

            ezidi:
                false

        }

    };

    // --------------------------------------------------------
    // State
    // --------------------------------------------------------

    const state = {

        initialized:
            false,

        ready:
            false,

        currentLanguage:
            CONFIG.defaultLanguage,

        previousLanguage:
            null,

        detectedLanguage:
            null,

        direction:
            "ltr",

        inputLanguage:
            null,

        outputLanguage:
            null,

        languageChanges:
            0,

        detectionCount:
            0,

        translationCount:
            0,

        history:
            [],

        aliases:
            new Map(),

        customProfiles:
            new Map(),

        dictionary:
            new Map()

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
    // Utility
    // --------------------------------------------------------

    function normalize(
        value
    ) {

        return String(
            value ??
            ""
        )
        .trim()
        .toLowerCase();

    }

    function clean(
        value
    ) {

        return String(
            value ??
            ""
        )
        .trim();

    }

    // --------------------------------------------------------
    // Language Aliases
    // --------------------------------------------------------

    function registerDefaultAliases() {

        const aliases = {

            de: [

                "de",
                "deutsch",
                "german",
                "de-de"

            ],

            en: [

                "en",
                "english",
                "englisch",
                "en-us",
                "en-gb"

            ],

            ku: [

                "ku",
                "kurdish",
                "kurdisch",
                "kurdî",
                "kurmanci",
                "kurmanji",
                "kirmanci",
                "ku-tr"

            ],

            ckb: [

                "ckb",
                "sorani",
                "central kurdish",
                "zentralkurdisch",
                "kurdî",
                "کوردی"

            ],

            ar: [

                "ar",
                "arabic",
                "arabisch",
                "العربية"

            ],

            tr: [

                "tr",
                "turkish",
                "türkisch",
                "türkçe"

            ],

            fr: [

                "fr",
                "french",
                "französisch",
                "français"

            ],

            es: [

                "es",
                "spanish",
                "spanisch",
                "español"

            ],

            it: [

                "it",
                "italian",
                "italienisch",
                "italiano"

            ],

            nl: [

                "nl",
                "dutch",
                "niederländisch",
                "nederlands"

            ],

            ru: [

                "ru",
                "russian",
                "russisch",
                "русский"

            ],

            fa: [

                "fa",
                "persian",
                "persisch",
                "فارسی"

            ]

        };

        Object.entries(
            aliases
        ).forEach(
            ([code, values]) => {

                values.forEach(
                    alias => {

                        state.aliases.set(
                            normalize(
                                alias
                            ),
                            code
                        );

                    }
                );

            }
        );

    }

    // --------------------------------------------------------
    // Resolve Language
    // --------------------------------------------------------

    function resolveLanguage(
        value
    ) {

        const input =
            normalize(
                value
            );

        if (!input) {

            return null;

        }

        if (
            CONFIG.supportedLanguages
                .includes(input)
        ) {

            return input;

        }

        if (
            state.aliases.has(
                input
            )
        ) {

            return state.aliases.get(
                input
            );

        }

        /*
         * Locale wie de-DE.
         */

        const base =
            input.split(
                "-"
            )[0];

        if (
            CONFIG.supportedLanguages
                .includes(base)
        ) {

            return base;

        }

        if (
            state.aliases.has(
                base
            )
        ) {

            return state.aliases.get(
                base
            );

        }

        return null;

    }

    // --------------------------------------------------------
    // Get Profile
    // --------------------------------------------------------

    function getProfile(
        language
    ) {

        const code =
            resolveLanguage(
                language
            );

        if (!code) {

            return null;

        }

        if (
            LANGUAGE_PROFILES[code]
        ) {

            return {
                ...LANGUAGE_PROFILES[code]
            };

        }

        if (
            state.customProfiles.has(
                code
            )
        ) {

            return {
                ...state.customProfiles.get(
                    code
                )
            };

        }

        return null;

    }

    // --------------------------------------------------------
    // Supported Languages
    // --------------------------------------------------------

    function getSupportedLanguages() {

        return CONFIG
            .supportedLanguages
            .map(
                code =>
                    getProfile(
                        code
                    )
            )
            .filter(
                Boolean
            );

    }

    // --------------------------------------------------------
    // Direction
    // --------------------------------------------------------

    function getDirection(
        language =
            state.currentLanguage
    ) {

        const profile =
            getProfile(
                language
            );

        return profile?.direction ||
            "ltr";

    }

    // --------------------------------------------------------
    // Apply Language To DOM
    // --------------------------------------------------------

    function applyToDocument(
        language
    ) {

        const profile =
            getProfile(
                language
            );

        if (!profile) {

            return false;

        }

        const html =
            document.documentElement;

        if (!html) {

            return false;

        }

        html.lang =
            profile.locale ||
            profile.code;

        html.dir =
            profile.direction ||
            "ltr";

        html.dataset.haldoLanguage =
            profile.code;

        html.dataset.haldoDirection =
            profile.direction;

        document.body?.setAttribute(
            "data-haldo-language",
            profile.code
        );

        document.body?.setAttribute(
            "dir",
            profile.direction
        );

        emit(
            "dom-updated",
            {
                language:
                    profile.code,

                direction:
                    profile.direction
            }
        );

        return true;

    }

    // --------------------------------------------------------
    // Storage Resolver
    // --------------------------------------------------------

    function getStorageModule() {

        return (
            window.HalDoStorageManager ||
            window.HalDoStorage ||
            window.HalDoOS?.storageManager ||
            window.HalDoOS?.storage ||
            null
        );

    }

    // --------------------------------------------------------
    // Persist Language
    // --------------------------------------------------------

    async function persistLanguage(
        language
    ) {

        if (
            !CONFIG.persistLanguage
        ) {

            return false;

        }

        const storage =
            getStorageModule();

        if (
            storage
        ) {

            const methods = [

                "set",
                "save",
                "setItem",
                "store"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof storage[method] !==
                    "function"
                ) {

                    continue;

                }

                try {

                    await storage[method](
                        CONFIG.storageKey,
                        language
                    );

                    return true;

                } catch (
                    error
                ) {}

            }

        }

        try {

            localStorage.setItem(
                CONFIG.storageKey,
                language
            );

            return true;

        } catch (
            error
        ) {

            return false;

        }

    }

    // --------------------------------------------------------
    // Load Persisted Language
    // --------------------------------------------------------

    function loadPersistedLanguage() {

        try {

            const stored =
                localStorage.getItem(
                    CONFIG.storageKey
                );

            const resolved =
                resolveLanguage(
                    stored
                );

            if (resolved) {

                return resolved;

            }

        } catch (
            error
        ) {}

        return null;

    }

    // --------------------------------------------------------
    // Set Language
    // --------------------------------------------------------

    async function setLanguage(
        language,
        options = {}
    ) {

        const code =
            resolveLanguage(
                language
            );

        if (!code) {

            return {

                ok:
                    false,

                error:
                    "UNSUPPORTED_LANGUAGE",

                requested:
                    language

            };

        }

        const previous =
            state.currentLanguage;

        if (
            previous === code &&
            !options.force
        ) {

            return {

                ok:
                    true,

                changed:
                    false,

                language:
                    code,

                profile:
                    getProfile(
                        code
                    )

            };

        }

        state.previousLanguage =
            previous;

        state.currentLanguage =
            code;

        state.direction =
            getDirection(
                code
            );

        state.languageChanges++;

        applyToDocument(
            code
        );

        await persistLanguage(
            code
        );

        /*
         * Vorhandenes Language-System informieren.
         */

        const languageManager =
            window.HalDoLanguageManager ||
            window.HalDoOS?.languageManager;

        if (
            languageManager &&
            languageManager !== api
        ) {

            const methods = [

                "setLanguage",
                "changeLanguage",
                "switchLanguage"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof languageManager[method] !==
                    "function"
                ) {

                    continue;

                }

                try {

                    await languageManager[method](
                        code
                    );

                    break;

                } catch (
                    error
                ) {}

            }

        }

        /*
         * Vorhandenes Language-System informieren.
         */

        const languageSystem =
            window.HalDoLanguageSystem ||
            window.HalDoOS?.languageSystem;

        if (
            languageSystem &&
            languageSystem !== api
        ) {

            const methods = [

                "setLanguage",
                "changeLanguage",
                "switchLanguage"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof languageSystem[method] !==
                    "function"
                ) {

                    continue;

                }

                try {

                    await languageSystem[method](
                        code
                    );

                    break;

                } catch (
                    error
                ) {}

            }

        }

        const detail = {

            language:
                code,

            previousLanguage:
                previous,

            direction:
                state.direction,

            profile:
                getProfile(
                    code
                )

        };

        state.history.push(
            detail
        );

        if (
            state.history.length >
            100
        ) {

            state.history.shift();

        }

        emit(
            "language-changed",
            detail
        );

        emit(
            "changed",
            detail
        );

        return {

            ok:
                true,

            changed:
                true,

            ...detail

        };

    }

    // --------------------------------------------------------
    // Get Current Language
    // --------------------------------------------------------

    function getLanguage() {

        return state.currentLanguage;

    }

    // --------------------------------------------------------
    // Browser Language Detection
    // --------------------------------------------------------

    function detectBrowserLanguage() {

        const candidates = [];

        if (
            navigator.language
        ) {

            candidates.push(
                navigator.language
            );

        }

        if (
            Array.isArray(
                navigator.languages
            )
        ) {

            candidates.push(
                ...navigator.languages
            );

        }

        for (
            const candidate of
            candidates
        ) {

            const resolved =
                resolveLanguage(
                    candidate
                );

            if (resolved) {

                return resolved;

            }

        }

        return CONFIG.fallbackLanguage;

    }

    // --------------------------------------------------------
    // Text Language Detection
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
                    null,

                confidence:
                    0,

                reason:
                    "EMPTY"

            };

        }

        const normalized =
            input.toLowerCase();

        const scores = {};

        CONFIG.supportedLanguages
            .forEach(
                language => {

                    scores[language] =
                        0;

                }
            );

        /*
         * Character detection.
         */

        if (
            /[\u0600-\u06FF]/.test(
                input
            )
        ) {

            scores.ar += 5;
            scores.ckb += 5;
            scores.fa += 4;

        }

        if (
            /[پچژگێۆڵڕڤ]/i.test(
                input
            )
        ) {

            scores.ku += 6;
            scores.ckb += 5;

        }

        if (
            /[äöüß]/i.test(
                input
            )
        ) {

            scores.de += 5;

        }

        /*
         * German keywords.
         */

        const germanWords = [

            "ich",
            "du",
            "und",
            "der",
            "die",
            "das",
            "ist",
            "nicht",
            "bitte",
            "öffne",
            "schließe",
            "hilfe",
            "sprache",
            "system"

        ];

        germanWords.forEach(
            word => {

                if (
                    new RegExp(
                        `\\b${word}\\b`,
                        "i"
                    ).test(
                        normalized
                    )
                ) {

                    scores.de += 2;

                }

            }
        );

        /*
         * English keywords.
         */

        const englishWords = [

            "the",
            "and",
            "you",
            "are",
            "is",
            "not",
            "please",
            "open",
            "close",
            "help",
            "system",
            "language"

        ];

        englishWords.forEach(
            word => {

                if (
                    new RegExp(
                        `\\b${word}\\b`,
                        "i"
                    ).test(
                        normalized
                    )
                ) {

                    scores.en += 2;

                }

            }
        );

        /*
         * Kurmanji / Kurdish keywords.
         */

        const kurdishWords = [

            "ez",
            "tu",
            "em",
            "ew",
            "ji",
            "bi",
            "ev",
            "çawa",
            "baş",
            "spas",
            "heval",
            "kî",
            "çima",
            "dikim",
            "dike"

        ];

        kurdishWords.forEach(
            word => {

                if (
                    new RegExp(
                        `\\b${word}\\b`,
                        "i"
                    ).test(
                        normalized
                    )
                ) {

                    scores.ku += 3;

                }

            }
        );

        /*
         * Turkish.
         */

        const turkishWords = [

            "ben",
            "sen",
            "ve",
            "bir",
            "bu",
            "için",
            "aç",
            "kapat",
            "yardım",
            "sistem"

        ];

        turkishWords.forEach(
            word => {

                if (
                    new RegExp(
                        `\\b${word}\\b`,
                        "i"
                    ).test(
                        normalized
                    )
                ) {

                    scores.tr += 2;

                }

            }
        );

        /*
         * Best score.
         */

        let bestLanguage =
            null;

        let bestScore =
            0;

        Object.entries(
            scores
        ).forEach(
            ([language, score]) => {

                if (
                    score >
                    bestScore
                ) {

                    bestScore =
                        score;

                    bestLanguage =
                        language;

                }

            }
        );

        /*
         * Browser fallback.
         */

        if (
            !bestLanguage
        ) {

            bestLanguage =
                detectBrowserLanguage();

            bestScore =
                1;

        }

        state.detectedLanguage =
            bestLanguage;

        state.detectionCount++;

        const confidence =
            Math.min(
                1,
                bestScore /
                10
            );

        const result = {

            language:
                bestLanguage,

            confidence,

            score:
                bestScore,

            scores

        };

        emit(
            "language-detected",
            result
        );

        return result;

    }

    // --------------------------------------------------------
    // Normalize Text
    // --------------------------------------------------------

    function normalizeText(
        text,
        options = {}
    ) {

        let result =
            clean(
                text
            );

        if (!result) {

            return "";

        }

        /*
         * Unicode normalisieren.
         */

        try {

            result =
                result.normalize(
                    "NFC"
                );

        } catch (
            error
        ) {}

        /*
         * Mehrere Leerzeichen.
         */

        if (
            options.collapseWhitespace !==
            false
        ) {

            result =
                result.replace(
                    /\s+/g,
                    " "
                );

        }

        /*
         * Unsichtbare Steuerzeichen.
         */

        result =
            result.replace(
                /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,
                ""
            );

        return result.trim();

    }

    // --------------------------------------------------------
    // Translation Dictionary
    // --------------------------------------------------------

    function registerTranslation(
        key,
        language,
        value
    ) {

        const code =
            resolveLanguage(
                language
            );

        if (
            !code ||
            !key
        ) {

            return false;

        }

        const translationKey =
            normalize(
                key
            );

        if (
            !state.dictionary.has(
                translationKey
            )
        ) {

            state.dictionary.set(
                translationKey,
                new Map()
            );

        }

        state.dictionary
            .get(
                translationKey
            )
            .set(
                code,
                String(
                    value
                )
            );

        return true;

    }

    function translate(
        key,
        language =
            state.currentLanguage,
        fallback =
            CONFIG.fallbackLanguage
    ) {

        const translationKey =
            normalize(
                key
            );

        const translations =
            state.dictionary.get(
                translationKey
            );

        if (!translations) {

            return key;

        }

        const code =
            resolveLanguage(
                language
            );

        const fallbackCode =
            resolveLanguage(
                fallback
            );

        state.translationCount++;

        return (
            translations.get(
                code
            ) ??
            translations.get(
                fallbackCode
            ) ??
            key
        );

    }

    // --------------------------------------------------------
    // Core UI Dictionary
    // --------------------------------------------------------

    function registerCoreTranslations() {

        const entries = {

            "haldo.ai": {

                de:
                    "HalDo AI",

                en:
                    "HalDo AI",

                ku:
                    "HalDo AI",

                ckb:
                    "HalDo AI"

            },

            "welcome": {

                de:
                    "Willkommen bei HalDo AI",

                en:
                    "Welcome to HalDo AI",

                ku:
                    "Bi xêr hatî HalDo AI",

                ckb:
                    "بەخێربێیت بۆ HalDo AI"

            },

            "home": {

                de:
                    "Startseite",

                en:
                    "Home",

                ku:
                    "Mal",

                ckb:
                    "ماڵەوە"

            },

            "settings": {

                de:
                    "Einstellungen",

                en:
                    "Settings",

                ku:
                    "Mîheng",

                ckb:
                    "ڕێکخستنەکان"

            },

            "help": {

                de:
                    "Hilfe",

                en:
                    "Help",

                ku:
                    "Alîkarî",

                ckb:
                    "یارمەتی"

            },

            "open": {

                de:
                    "Öffnen",

                en:
                    "Open",

                ku:
                    "Veke",

                ckb:
                    "بکەرەوە"

            },

            "close": {

                de:
                    "Schließen",

                en:
                    "Close",

                ku:
                    "Bigire",

                ckb:
                    "دابخە"

            },

            "chat": {

                de:
                    "Chat",

                en:
                    "Chat",

                ku:
                    "Chat",

                ckb:
                    "گفتوگۆ"

            },

            "system": {

                de:
                    "System",

                en:
                    "System",

                ku:
                    "Sîstem",

                ckb:
                    "سیستەم"

            },

            "language": {

                de:
                    "Sprache",

                en:
                    "Language",

                ku:
                    "Ziman",

                ckb:
                    "زمان"

            },

            "voice": {

                de:
                    "Stimme",

                en:
                    "Voice",

                ku:
                    "Deng",

                ckb:
                    "دەنگ"

            }

        };

        Object.entries(
            entries
        ).forEach(
            ([key, translations]) => {

                Object.entries(
                    translations
                ).forEach(
                    ([language, value]) => {

                        registerTranslation(
                            key,
                            language,
                            value
                        );

                    }
                );

            }
        );

    }

    // --------------------------------------------------------
    // Êzîdî Language Support
    // --------------------------------------------------------
    // Die konkrete Êzîdî-Tastatur bleibt in
    // ezidi-keyboard.js.
    //
    // Diese Schicht stellt dafür Sprache,
    // Zeichen-Normalisierung und Events bereit.
    // --------------------------------------------------------

    function isEzidiLanguage(
        language =
            state.currentLanguage
    ) {

        const code =
            resolveLanguage(
                language
            );

        return Boolean(
            code &&
            CONFIG.ezidiLanguages
                .includes(
                    code
                )
        );

    }

    function prepareEzidiInput(
        text
    ) {

        let result =
            normalizeText(
                text
            );

        /*
         * Unicode bewusst erhalten.
         *
         * Keine ASCII-Konvertierung,
         * damit Ê, î, ş, ç und weitere
         * Zeichen nicht zerstört werden.
         */

        try {

            result =
                result.normalize(
                    "NFC"
                );

        } catch (
            error
        ) {}

        emit(
            "ezidi-input",
            {
                text:
                    result,

                language:
                    state.currentLanguage,

                ezidi:
                    isEzidiLanguage()

            }
        );

        return result;

    }

    // --------------------------------------------------------
    // Connect To AI Core
    // --------------------------------------------------------

    function connectAI() {

        const core =
            window.HalDoAICore ||
            window.HalDoOS?.aiCore;

        if (!core) {

            return false;

        }

        /*
         * Module registrieren.
         */

        if (
            typeof core.registerModule ===
            "function"
        ) {

            try {

                core.registerModule(
                    "language",
                    api
                );

            } catch (
                error
            ) {}

        }

        return true;

    }

    // --------------------------------------------------------
    // Connect To AI Commands
    // --------------------------------------------------------

    function connectCommands() {

        const commands =
            window.HalDoAICommands ||
            window.HalDoOS?.aiCommands;

        if (
            !commands
        ) {

            return false;

        }

        /*
         * Sprachwechsel als Kommando verfügbar machen,
         * falls ai-commands.js bereits geladen wurde.
         */

        if (
            typeof commands.registerCustomCommand ===
            "function"
        ) {

            try {

                commands.registerCustomCommand(
                    "set-language-ai",
                    argument =>
                        setLanguage(
                            argument
                        ),
                    {

                        name:
                            "AI-Sprache ändern",

                        description:
                            "Ändert die Sprache der HalDo AI.",

                        category:
                            "language",

                        aliases:
                            [
                                "ai-language"
                            ]

                    }
                );

            } catch (
                error
            ) {}

        }

        return true;

    }

    // --------------------------------------------------------
    // Connect Chat
    // --------------------------------------------------------

    function connectChat() {

        const chat =
            window.HalDoAIChat ||
            window.HalDoOS?.aiChat;

        if (!chat) {

            return false;

        }

        /*
         * Falls Chat ein Sprach-API erwartet,
         * stellen wir sie über globale Events bereit.
         */

        emit(
            "chat-language-ready",
            {

                language:
                    state.currentLanguage,

                profile:
                    getProfile(
                        state.currentLanguage
                    )

            }
        );

        return true;

    }

    // --------------------------------------------------------
    // Connect Keyboard
    // --------------------------------------------------------

    function connectKeyboard() {

        const keyboard =
            window.HalDoEzidiKeyboard ||
            window.HalDoOS?.ezidiKeyboard;

        if (!keyboard) {

            return false;

        }

        emit(
            "keyboard-language-ready",
            {

                language:
                    state.currentLanguage,

                ezidi:
                    isEzidiLanguage()

            }
        );

        return true;

    }

    // --------------------------------------------------------
    // Runtime Status
    // --------------------------------------------------------

    function getStatus() {

        const profile =
            getProfile(
                state.currentLanguage
            );

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            initialized:
                state.initialized,

            ready:
                state.ready,

            currentLanguage:
                state.currentLanguage,

            previousLanguage:
                state.previousLanguage,

            detectedLanguage:
                state.detectedLanguage,

            direction:
                state.direction,

            profile,

            isEzidi:
                isEzidiLanguage(),

            supportedLanguages:
                CONFIG.supportedLanguages
                    .slice(),

            languageChanges:
                state.languageChanges,

            detectionCount:
                state.detectionCount,

            translationCount:
                state.translationCount,

            translations:
                state.dictionary.size,

            connections: {

                aiCore:
                    Boolean(
                        window.HalDoAICore ||
                        window.HalDoOS?.aiCore
                    ),

                aiChat:
                    Boolean(
                        window.HalDoAIChat ||
                        window.HalDoOS?.aiChat
                    ),

                aiCommands:
                    Boolean(
                        window.HalDoAICommands ||
                        window.HalDoOS?.aiCommands
                    ),

                languageManager:
                    Boolean(
                        window.HalDoLanguageManager ||
                        window.HalDoOS?.languageManager
                    ),

                languageSystem:
                    Boolean(
                        window.HalDoLanguageSystem ||
                        window.HalDoOS?.languageSystem
                    ),

                ezidiKeyboard:
                    Boolean(
                        window.HalDoEzidiKeyboard ||
                        window.HalDoOS?.ezidiKeyboard
                    )

            }

        };

    }

    // --------------------------------------------------------
    // History
    // --------------------------------------------------------

    function getHistory() {

        return state.history
            .map(
                entry => ({
                    ...entry
                })
            );

    }

    function clearHistory() {

        state.history =
            [];

        emit(
            "history-cleared"
        );

    }

    // --------------------------------------------------------
    // Register Custom Language
    // --------------------------------------------------------

    function registerLanguage(
        profile
    ) {

        if (
            !profile ||
            !profile.code
        ) {

            return false;

        }

        const code =
            normalize(
                profile.code
            );

        if (!code) {

            return false;

        }

        state.customProfiles.set(
            code,
            {

                code,

                locale:
                    profile.locale ||
                    code,

                name:
                    profile.name ||
                    code,

                nativeName:
                    profile.nativeName ||
                    profile.name ||
                    code,

                direction:
                    profile.direction ||
                    "ltr",

                family:
                    profile.family ||
                    "custom",

                ezidi:
                    Boolean(
                        profile.ezidi
                    )

            }
        );

        if (
            !CONFIG.supportedLanguages
                .includes(code)
        ) {

            CONFIG.supportedLanguages.push(
                code
            );

        }

        if (
            profile.aliases
        ) {

            profile.aliases.forEach(
                alias => {

                    state.aliases.set(
                        normalize(
                            alias
                        ),
                        code
                    );

                }
            );

        }

        emit(
            "language-registered",
            {
                profile:
                    getProfile(
                        code
                    )
            }
        );

        return true;

    }

    // --------------------------------------------------------
    // Initialize
    // --------------------------------------------------------

    async function initialize() {

        if (
            state.initialized
        ) {

            return getStatus();

        }

        state.initialized =
            true;

        registerDefaultAliases();

        registerCoreTranslations();

        /*
         * Gespeicherte Sprache zuerst.
         */

        const stored =
            loadPersistedLanguage();

        /*
         * Danach Browser-Sprache.
         */

        const detected =
            stored ||
            detectBrowserLanguage();

        state.detectedLanguage =
            detected;

        state.currentLanguage =
            resolveLanguage(
                detected
            ) ||
            CONFIG.defaultLanguage;

        state.direction =
            getDirection();

        applyToDocument(
            state.currentLanguage
        );

        connectAI();

        connectCommands();

        connectChat();

        connectKeyboard();

        emit(
            "initialized",
            {
                language:
                    state.currentLanguage,

                profile:
                    getProfile(
                        state.currentLanguage
                    )
            }
        );

        /*
         * Nach DOM-/Modul-Ladevorgang erneut verbinden.
         */

        window.setTimeout(
            () => {

                connectAI();

                connectCommands();

                connectChat();

                connectKeyboard();

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
    // Public API
    // --------------------------------------------------------

    const api = {

        __haldoAI18:
            true,

        config:
            CONFIG,

        profiles:
            LANGUAGE_PROFILES,

        state,

        initialize,

        on,

        off,

        emit,

        resolveLanguage,

        getProfile,

        getSupportedLanguages,

        getLanguage,

        setLanguage,

        getDirection,

        applyToDocument,

        detectBrowserLanguage,

        detectLanguage,

        normalizeText,

        registerTranslation,

        translate,

        isEzidiLanguage,

        prepareEzidiInput,

        registerLanguage,

        getHistory,

        clearHistory,

        getStatus

    };

    // --------------------------------------------------------
    // Global API
    // --------------------------------------------------------

    window.HalDoAILanguage =
        api;

    window.HalDoOS.aiLanguage =
        api;

    // --------------------------------------------------------
    // DOM Boot
    // --------------------------------------------------------

    function boot() {

        initialize()
            .catch(
                error => {

                    console.error(
                        "[HalDoAILanguage] " +
                        "Initialization failed:",
                        error
                    );

                }
            );

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
// END OF PART 77
// ============================================================