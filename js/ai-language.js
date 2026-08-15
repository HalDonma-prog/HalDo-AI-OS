// ============================================================
// HALDO AI OS 18
// AI LANGUAGE INTELLIGENCE
// PART 85
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
            "HalDo AI Language Intelligence",

        version:
            "18.0.0",

        mode:
            "Professional Ultimate Foundation",

        defaultLanguage:
            "de",

        autoDetect:
            true,

        correctionEnabled:
            true,

        grammarEnabled:
            true,

        spellingEnabled:
            true,

        rewritingEnabled:
            true,

        translationEnabled:
            true,

        readingAnalysisEnabled:
            true,

        writingAssistantEnabled:
            true,

        maxTextLength:
            100000

    };

    // ========================================================
    // STATE
    // ========================================================

    const state = {

        initialized:
            false,

        ready:
            false,

        currentLanguage:
            CONFIG.defaultLanguage,

        detectedLanguage:
            null,

        processing:
            false,

        requestCount:
            0,

        correctionCount:
            0,

        grammarCount:
            0,

        rewriteCount:
            0,

        translationCount:
            0,

        readingCount:
            0,

        writingCount:
            0,

        lastOperation:
            null,

        lastResult:
            null,

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
        prefix = "language"
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

    function clampText(
        text
    ) {

        const value =
            clean(text);

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
    // LANGUAGE DATABASE
    // ========================================================

    const LANGUAGES = {

        de: {

            code:
                "de",

            name:
                "Deutsch",

            nativeName:
                "Deutsch",

            rtl:
                false

        },

        en: {

            code:
                "en",

            name:
                "English",

            nativeName:
                "English",

            rtl:
                false

        },

        ku: {

            code:
                "ku",

            name:
                "Kurdî",

            nativeName:
                "Kurdî",

            rtl:
                false

        },

        ez: {

            code:
                "ez",

            name:
                "Êzîdî",

            nativeName:
                "Êzîdî",

            rtl:
                false

        },

        tr: {

            code:
                "tr",

            name:
                "Türkçe",

            nativeName:
                "Türkçe",

            rtl:
                false

        },

        ar: {

            code:
                "ar",

            name:
                "Arabic",

            nativeName:
                "العربية",

            rtl:
                true

        },

        fr: {

            code:
                "fr",

            name:
                "Français",

            nativeName:
                "Français",

            rtl:
                false

        },

        es: {

            code:
                "es",

            name:
                "Español",

            nativeName:
                "Español",

            rtl:
                false

        },

        it: {

            code:
                "it",

            name:
                "Italiano",

            nativeName:
                "Italiano",

            rtl:
                false

        },

        nl: {

            code:
                "nl",

            name:
                "Nederlands",

            nativeName:
                "Nederlands",

            rtl:
                false

        },

        ru: {

            code:
                "ru",

            name:
                "Русский",

            nativeName:
                "Русский",

            rtl:
                false

        },

        fa: {

            code:
                "fa",

            name:
                "Persian",

            nativeName:
                "فارسی",

            rtl:
                true

        },

        ja: {

            code:
                "ja",

            name:
                "Japanese",

            nativeName:
                "日本語",

            rtl:
                false

        },

        ko: {

            code:
                "ko",

            name:
                "Korean",

            nativeName:
                "한국어",

            rtl:
                false

        },

        zh: {

            code:
                "zh",

            name:
                "Chinese",

            nativeName:
                "中文",

            rtl:
                false

        }

    };

    // ========================================================
    // LANGUAGE ALIASES
    // ========================================================

    const LANGUAGE_ALIASES = {

        deutsch:
            "de",

        german:
            "de",

        de:
            "de",

        englisch:
            "en",

        english:
            "en",

        en:
            "en",

        kurdisch:
            "ku",

        kurdî:
            "ku",

        kurdi:
            "ku",

        ku:
            "ku",

        êzîdî:
            "ez",

        ezidi:
            "ez",

        yezidi:
            "ez",

        ez:
            "ez",

        türkisch:
            "tr",

        turkish:
            "tr",

        tr:
            "tr",

        arabisch:
            "ar",

        arabic:
            "ar",

        ar:
            "ar",

        französisch:
            "fr",

        french:
            "fr",

        fr:
            "fr",

        spanisch:
            "es",

        spanish:
            "es",

        es:
            "es",

        italienisch:
            "it",

        italian:
            "it",

        it:
            "it",

        niederländisch:
            "nl",

        dutch:
            "nl",

        nl:
            "nl",

        russisch:
            "ru",

        russian:
            "ru",

        ru:
            "ru",

        persisch:
            "fa",

        farsi:
            "fa",

        fa:
            "fa",

        japanisch:
            "ja",

        japanese:
            "ja",

        ja:
            "ja",

        koreanisch:
            "ko",

        korean:
            "ko",

        ko:
            "ko",

        chinesisch:
            "zh",

        chinese:
            "zh",

        zh:
            "zh"

    };

    // ========================================================
    // LANGUAGE DETECTION
    // ========================================================

    function detectLanguage(
        text
    ) {

        const value =
            normalize(
                text
            );

        if (!value) {

            return {

                language:
                    state.currentLanguage,

                confidence:
                    0,

                method:
                    "fallback"

            };

        }

        const scores = {};

        Object.keys(
            LANGUAGES
        ).forEach(
            code => {
                scores[code] = 0;
            }
        );

        /*
         * Deutsche Hinweise
         */

        const germanWords = [

            "der",
            "die",
            "das",
            "und",
            "ist",
            "nicht",
            "ich",
            "du",
            "wir",
            "sie",
            "ein",
            "eine",
            "für",
            "mit",
            "auf",
            "von",
            "zu",
            "wie",
            "was",
            "kann"

        ];

        germanWords.forEach(
            word => {

                if (
                    new RegExp(
                        `\\b${word}\\b`,
                        "i"
                    ).test(value)
                ) {

                    scores.de +=
                        1;

                }

            }
        );

        /*
         * Englische Hinweise
         */

        const englishWords = [

            "the",
            "and",
            "is",
            "are",
            "you",
            "your",
            "with",
            "this",
            "that",
            "what",
            "how",
            "can",
            "for",
            "from",
            "not"

        ];

        englishWords.forEach(
            word => {

                if (
                    new RegExp(
                        `\\b${word}\\b`,
                        "i"
                    ).test(value)
                ) {

                    scores.en +=
                        1;

                }

            }
        );

        /*
         * Türkçe Hinweise
         */

        const turkishWords = [

            "bir",
            "ve",
            "bu",
            "için",
            "ben",
            "sen",
            "değil",
            "nasıl",
            "ne",
            "çok"

        ];

        turkishWords.forEach(
            word => {

                if (
                    value.includes(
                        word
                    )
                ) {

                    scores.tr +=
                        1;

                }

            }
        );

        /*
         * Kurdische Hinweise
         */

        const kurdishWords = [

            "ez",
            "tu",
            "ew",
            "em",
            "ev",
            "ji",
            "bi",
            "bo",
            "çawa",
            "çi",
            "kî"

        ];

        kurdishWords.forEach(
            word => {

                if (
                    new RegExp(
                        `\\b${word}\\b`,
                        "i"
                    ).test(value)
                ) {

                    scores.ku +=
                        1;

                }

            }
        );

        /*
         * Êzîdî-Sonderzeichen.
         */

        if (
            /[êîûşçÊÎÛŞÇ]/.test(
                text
            )
        ) {

            scores.ez +=
                3;

            scores.ku +=
                1;

        }

        /*
         * Arabische / persische Schrift.
         */

        if (
            /[\u0600-\u06FF]/.test(
                text
            )
        ) {

            scores.ar +=
                2;

            scores.fa +=
                1;

        }

        /*
         * Japanisch.
         */

        if (
            /[\u3040-\u30FF]/.test(
                text
            )
        ) {

            scores.ja +=
                4;

        }

        /*
         * Koreanisch.
         */

        if (
            /[\uAC00-\uD7AF]/.test(
                text
            )
        ) {

            scores.ko +=
                4;

        }

        /*
         * Chinesisch.
         */

        if (
            /[\u4E00-\u9FFF]/.test(
                text
            )
        ) {

            scores.zh +=
                4;

        }

        let bestLanguage =
            state.currentLanguage;

        let bestScore =
            0;

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
                5
            );

        state.detectedLanguage =
            bestLanguage;

        return {

            language:
                bestLanguage,

            confidence,

            scores,

            method:
                "pattern"

        };

    }

    // ========================================================
    // LANGUAGE MANAGEMENT
    // ========================================================

    function getSupportedLanguages() {

        return Object.values(
            LANGUAGES
        ).map(
            language => ({
                ...language
            })
        );

    }

    function getLanguage() {

        return state.currentLanguage;

    }

    function resolveLanguage(
        language
    ) {

        const value =
            normalize(
                language
            );

        if (
            LANGUAGES[value]
        ) {

            return value;

        }

        return (
            LANGUAGE_ALIASES[value] ||
            null
        );

    }

    async function setLanguage(
        language,
        options = {}
    ) {

        const resolved =
            resolveLanguage(
                language
            );

        if (!resolved) {

            return {

                ok:
                    false,

                error:
                    "LANGUAGE_NOT_SUPPORTED",

                language:
                    language,

                supported:
                    getSupportedLanguages()

            };

        }

        const previous =
            state.currentLanguage;

        state.currentLanguage =
            resolved;

        const result = {

            ok:
                true,

            language:
                resolved,

            previousLanguage:
                previous,

            source:
                options.source ||
                "language-engine"

        };

        emit(
            "language-changed",
            result
        );

        return result;

    }

    async function setEzidiLanguage(
        options = {}
    ) {

        return setLanguage(
            "ez",
            {
                ...options,

                source:
                    options.source ||
                    "ezidi-language"
            }
        );

    }

    // ========================================================
    // TEXT ANALYSIS
    // ========================================================

    function analyzeText(
        text,
        options = {}
    ) {

        const value =
            clampText(
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
                        sentence =>
                            sentence.trim()
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
                        paragraph =>
                            paragraph.trim()
                    )
                    .filter(
                        Boolean
                    )
                : [];

        const detection =
            detectLanguage(
                value
            );

        const averageWordLength =
            words.length
                ? words.reduce(
                    (
                        total,
                        word
                    ) =>
                        total +
                        word.replace(
                            /[^\p{L}\p{N}]/gu,
                            ""
                        ).length,
                    0
                ) /
                words.length
                : 0;

        const averageSentenceLength =
            sentences.length
                ? words.length /
                  sentences.length
                : 0;

        state.readingCount++;

        const result = {

            ok:
                true,

            type:
                "text-analysis",

            text:
                value,

            language:
                detection.language,

            languageConfidence:
                detection.confidence,

            characters:
                value.length,

            words:
                words.length,

            sentences:
                sentences.length,

            paragraphs:
                paragraphs.length,

            averageWordLength,

            averageSentenceLength,

            hasQuestion:
                /\?/.test(
                    value
                ),

            hasExclamation:
                /!/.test(
                    value
                ),

            hasNumbers:
                /\d/.test(
                    value
                ),

            hasUrls:
                /https?:\/\//i.test(
                    value
                ),

            readingTimeMinutes:
                words.length
                    ? Math.max(
                        1,
                        Math.ceil(
                            words.length /
                            (
                                options.wordsPerMinute ||
                                200
                            )
                        )
                    )
                    : 0

        };

        state.lastOperation =
            "analyze";

        state.lastResult =
            result;

        emit(
            "text-analyzed",
            result
        );

        return result;

    }

    // ========================================================
    // BASIC ERROR DETECTION
    // ========================================================

    const COMMON_TYPOS = {

        "dasss":
            "dass",

        "daas":
            "das",

        "dass":
            "dass",

        "denn":
            "denn",

        "seid":
            "seid",

        "seit":
            "seit",

        "wieders":
            "wieder",

        "widerum":
            "wiederum",

        "wars":
            "war's",

        "ichbin":
            "ich bin",

        "du bist":
            "du bist"

    };

    const GERMAN_CORRECTIONS = [

        {
            pattern:
                /\bich habe gegangen\b/gi,

            replacement:
                "ich bin gegangen",

            type:
                "grammar"

        },

        {
            pattern:
                /\bich bin gemacht\b/gi,

            replacement:
                "ich habe gemacht",

            type:
                "grammar"

        },

        {
            pattern:
                /\bich habe gewesen\b/gi,

            replacement:
                "ich bin gewesen",

            type:
                "grammar"

        },

        {
            pattern:
                /\bseid ihr\b/gi,

            replacement:
                "seid ihr",

            type:
                "grammar"

        },

        {
            pattern:
                /\bwie geht es dir\?/gi,

            replacement:
                "Wie geht es dir?",

            type:
                "style"

        }

    ];

    function detectErrors(
        text,
        options = {}
    ) {

        const value =
            clampText(
                text
            );

        const errors = [];

        if (!value) {

            return {

                ok:
                    true,

                hasErrors:
                    false,

                errors,

                text:
                    value

            };

        }

        /*
         * Doppelte Leerzeichen.
         */

        let match;

        const doubleSpace =
            / {2,}/g;

        while (
            (
                match =
                    doubleSpace.exec(
                        value
                    )
            ) !==
            null
        ) {

            errors.push({

                type:
                    "formatting",

                category:
                    "spacing",

                message:
                    "Mehrere Leerzeichen erkannt.",

                original:
                    match[0],

                suggestion:
                    " ",

                index:
                    match.index

            });

        }

        /*
         * Leerzeichen vor Satzzeichen.
         */

        const spaceBeforePunctuation =
            /\s+[,.!?;:]/g;

        while (
            (
                match =
                    spaceBeforePunctuation.exec(
                        value
                    )
            ) !==
            null
        ) {

            errors.push({

                type:
                    "formatting",

                category:
                    "punctuation",

                message:
                    "Leerzeichen vor Satzzeichen erkannt.",

                original:
                    match[0],

                suggestion:
                    match[0].trim(),

                index:
                    match.index

            });

        }

        /*
         * Fehlendes Leerzeichen nach Satzzeichen.
         */

        const missingSpace =
            /[,.!?;:][A-Za-zÄÖÜäöüß]/g;

        while (
            (
                match =
                    missingSpace.exec(
                        value
                    )
            ) !==
            null
        ) {

            errors.push({

                type:
                    "formatting",

                category:
                    "spacing",

                message:
                    "Nach dem Satzzeichen fehlt möglicherweise ein Leerzeichen.",

                original:
                    match[0],

                suggestion:
                    match[0][0] +
                    " " +
                    match[0].slice(
                        1
                    ),

                index:
                    match.index

            });

        }

        /*
         * Bekannte Tippfehler.
         */

        Object.keys(
            COMMON_TYPOS
        ).forEach(
            typo => {

                const pattern =
                    new RegExp(
                        `\\b${typo}\\b`,
                        "gi"
                    );

                while (
                    (
                        match =
                            pattern.exec(
                                value
                            )
                    ) !==
                    null
                ) {

                    const replacement =
                        COMMON_TYPOS[
                            typo
                        ];

                    if (
                        replacement ===
                        typo
                    ) {
                        continue;
                    }

                    errors.push({

                        type:
                            "spelling",

                        category:
                            "typo",

                        message:
                            "Möglicher Tippfehler erkannt.",

                        original:
                            match[0],

                        suggestion:
                            replacement,

                        index:
                            match.index

                    });

                }

            }
        );

        /*
         * Deutsche Grammatik-/Stilregeln.
         */

        if (
            options.language ===
            "de" ||
            !options.language
        ) {

            GERMAN_CORRECTIONS.forEach(
                rule => {

                    while (
                        (
                            match =
                                rule.pattern.exec(
                                    value
                                )
                        ) !==
                        null
                    ) {

                        errors.push({

                            type:
                                rule.type,

                            category:
                                "grammar",

                            message:
                                "Mögliche grammatische oder stilistische Verbesserung.",

                            original:
                                match[0],

                            suggestion:
                                rule.replacement,

                            index:
                                match.index

                        });

                    }

                }
            );

        }

        /*
         * Großschreibung am Satzanfang.
         */

        const sentenceStart =
            /(^|[.!?]\s+)([a-zäöü])/g;

        while (
            (
                match =
                    sentenceStart.exec(
                        value
                    )
            ) !==
            null
        ) {

            errors.push({

                type:
                    "grammar",

                category:
                    "capitalization",

                message:
                    "Satzanfang sollte großgeschrieben werden.",

                original:
                    match[2],

                suggestion:
                    match[2].toUpperCase(),

                index:
                    match.index +
                    match[1].length

            });

        }

        return {

            ok:
                true,

            hasErrors:
                errors.length >
                0,

            errorCount:
                errors.length,

            errors,

            text:
                value

        };

    }

    // ========================================================
    // SPELLING
    // ========================================================

    function checkSpelling(
        text,
        options = {}
    ) {

        const result =
            detectErrors(
                text,
                options
            );

        const errors =
            result.errors.filter(
                error =>
                    error.type ===
                    "spelling"
            );

        state.correctionCount++;

        const response = {

            ok:
                true,

            type:
                "spelling-check",

            text:
                clean(text),

            hasErrors:
                errors.length >
                0,

            errorCount:
                errors.length,

            errors

        };

        state.lastOperation =
            "spelling";

        state.lastResult =
            response;

        emit(
            "spelling-checked",
            response
        );

        return response;

    }

    // ========================================================
    // GRAMMAR
    // ========================================================

    function checkGrammar(
        text,
        options = {}
    ) {

        const result =
            detectErrors(
                text,
                options
            );

        const errors =
            result.errors.filter(
                error =>
                    error.type ===
                    "grammar"
            );

        state.grammarCount++;

        const response = {

            ok:
                true,

            type:
                "grammar-check",

            text:
                clean(text),

            hasErrors:
                errors.length >
                0,

            errorCount:
                errors.length,

            errors

        };

        state.lastOperation =
            "grammar";

        state.lastResult =
            response;

        emit(
            "grammar-checked",
            response
        );

        return response;

    }

    // ========================================================
    // CORRECTION
    // ========================================================

    function applyCorrections(
        text,
        options = {}
    ) {

        let corrected =
            clampText(
                text
            );

        const changes = [];

        /*
         * Doppelte Leerzeichen.
         */

        if (
            /\s{2,}/.test(
                corrected
            )
        ) {

            const before =
                corrected;

            corrected =
                corrected.replace(
                    / {2,}/g,
                    " "
                );

            if (
                before !==
                corrected
            ) {

                changes.push({

                    type:
                        "formatting",

                    before,

                    after:
                        corrected

                });

            }

        }

        /*
         * Leerzeichen vor Satzzeichen.
         */

        {

            const before =
                corrected;

            corrected =
                corrected.replace(
                    /\s+([,.!?;:])/g,
                    "$1"
                );

            if (
                before !==
                corrected
            ) {

                changes.push({

                    type:
                        "punctuation",

                    before,

                    after:
                        corrected

                });

            }

        }

        /*
         * Fehlende Leerzeichen nach Satzzeichen.
         */

        {

            const before =
                corrected;

            corrected =
                corrected.replace(
                    /([,.!?;:])([A-Za-zÄÖÜäöüß])/g,
                    "$1 $2"
                );

            if (
                before !==
                corrected
            ) {

                changes.push({

                    type:
                        "spacing",

                    before,

                    after:
                        corrected

                });

            }

        }

        /*
         * Bekannte Tippfehler.
         */

        Object.keys(
            COMMON_TYPOS
        ).forEach(
            typo => {

                const replacement =
                    COMMON_TYPOS[
                        typo
                    ];

                if (
                    replacement ===
                    typo
                ) {
                    return;
                }

                const pattern =
                    new RegExp(
                        `\\b${typo}\\b`,
                        "gi"
                    );

                if (
                    pattern.test(
                        corrected
                    )
                ) {

                    const before =
                        corrected;

                    corrected =
                        corrected.replace(
                            pattern,
                            replacement
                        );

                    changes.push({

                        type:
                            "spelling",

                        original:
                            typo,

                        replacement,

                        before,

                        after:
                            corrected

                    });

                }

            }
        );

        /*
         * Deutsche Grammatik.
         */

        if (
            options.language ===
            "de" ||
            !options.language
        ) {

            GERMAN_CORRECTIONS.forEach(
                rule => {

                    const before =
                        corrected;

                    corrected =
                        corrected.replace(
                            rule.pattern,
                            rule.replacement
                        );

                    if (
                        before !==
                        corrected
                    ) {

                        changes.push({

                            type:
                                rule.type,

                            before,

                            after:
                                corrected

                        });

                    }

                }
            );

        }

        /*
         * Satzanfang großschreiben.
         */

        {

            const before =
                corrected;

            corrected =
                corrected.replace(
                    /(^|[.!?]\s+)([a-zäöü])/g,
                    (
                        full,
                        prefix,
                        letter
                    ) =>
                        prefix +
                        letter.toUpperCase()
                );

            if (
                before !==
                corrected
            ) {

                changes.push({

                    type:
                        "capitalization",

                    before,

                    after:
                        corrected

                });

            }

        }

        /*
         * Abschließende Formatierung.
         */

        corrected =
            corrected.trim();

        state.correctionCount++;

        const result = {

            ok:
                true,

            type:
                "correction",

            original:
                clean(text),

            corrected,

            changed:
                corrected !==
                clean(text),

            changes,

            changeCount:
                changes.length,

            language:
                options.language ||
                state.currentLanguage

        };

        state.lastOperation =
            "correction";

        state.lastResult =
            result;

        emit(
            "text-corrected",
            result
        );

        return result;

    }

    // ========================================================
    // REWRITING
    // ========================================================

    function rewrite(
        text,
        style = "clear",
        options = {}
    ) {

        let value =
            clampText(
                text
            );

        if (!value) {

            return {

                ok:
                    false,

                error:
                    "EMPTY_TEXT"

            };

        }

        const original =
            value;

        /*
         * Diese Foundation-Schicht führt
         * sichere lokale Verbesserungen aus.
         *
         * Für echte generative Umformulierungen
         * wird später die AI Engine genutzt.
         */

        value =
            applyCorrections(
                value,
                options
            ).corrected;

        if (
            style ===
            "formal"
        ) {

            value =
                value
                    .replace(
                        /\bHi\b/gi,
                        "Guten Tag"
                    )
                    .replace(
                        /\bHallo\b/gi,
                        "Guten Tag"
                    )
                    .replace(
                        /\bDanke dir\b/gi,
                        "Vielen Dank"
                    );

        }

        if (
            style ===
            "friendly"
        ) {

            value =
                value
                    .replace(
                        /\bGuten Tag\b/gi,
                        "Hallo"
                    );

        }

        if (
            style ===
            "short"
        ) {

            value =
                value
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();

        }

        state.rewriteCount++;

        const result = {

            ok:
                true,

            type:
                "rewrite",

            style,

            original,

            rewritten:
                value,

            changed:
                value !==
                original,

            language:
                options.language ||
                state.currentLanguage

        };

        state.lastOperation =
            "rewrite";

        state.lastResult =
            result;

        emit(
            "text-rewritten",
            result
        );

        return result;

    }

    // ========================================================
    // WRITING ASSISTANT
    // ========================================================

    function assistWriting(
        text,
        options = {}
    ) {

        const value =
            clean(text);

        const language =
            options.language ||
            detectLanguage(
                value
            ).language;

        const analysis =
            analyzeText(
                value,
                options
            );

        const errors =
            detectErrors(
                value,
                {
                    ...options,
                    language
                }
            );

        const correction =
            applyCorrections(
                value,
                {
                    ...options,
                    language
                }
            );

        const suggestions = [];

        if (
            !value
        ) {

            suggestions.push({

                type:
                    "start",

                message:
                    "Beginne mit einem Thema oder Satz."

            });

        }

        if (
            analysis.sentences >
            0 &&
            analysis.averageSentenceLength >
            30
        ) {

            suggestions.push({

                type:
                    "readability",

                message:
                    "Einige Sätze sind relativ lang. Kürzere Sätze könnten den Text verständlicher machen."

            });

        }

        if (
            errors.hasErrors
        ) {

            suggestions.push({

                type:
                    "correction",

                message:
                    `${errors.errorCount} mögliche sprachliche Verbesserung(en) erkannt.`

            });

        }

        if (
            !/[.!?]$/.test(
                value
            ) &&
            value.length >
            20
        ) {

            suggestions.push({

                type:
                    "punctuation",

                message:
                    "Der Text könnte mit einem passenden Satzzeichen abgeschlossen werden."

            });

        }

        state.writingCount++;

        const result = {

            ok:
                true,

            type:
                "writing-assistant",

            language,

            original:
                value,

            analysis,

            errors,

            corrected:
                correction.corrected,

            suggestions,

            confidence:
                errors.hasErrors
                    ? 0.9
                    : 0.65

        };

        state.lastOperation =
            "writing-assistant";

        state.lastResult =
            result;

        emit(
            "writing-assistance",
            result
        );

        return result;

    }

    // ========================================================
    // READING ASSISTANT
    // ========================================================

    function analyzeReading(
        text,
        options = {}
    ) {

        const value =
            clampText(
                text
            );

        const analysis =
            analyzeText(
                value,
                options
            );

        const errors =
            detectErrors(
                value,
                options
            );

        const keyPoints =
            value
                .split(
                    /[.!?]+/
                )
                .map(
                    sentence =>
                        sentence.trim()
                )
                .filter(
                    sentence =>
                        sentence.length >
                        20
                )
                .slice(
                    0,
                    options.maxKeyPoints ||
                    10
                );

        const result = {

            ok:
                true,

            type:
                "reading-analysis",

            language:
                analysis.language,

            analysis,

            possibleErrors:
                errors.errors,

            keyPoints,

            summary:
                keyPoints.join(
                    ". "
                ),

            readable:
                analysis.averageSentenceLength <
                35

        };

        state.readingCount++;

        state.lastOperation =
            "reading-analysis";

        state.lastResult =
            result;

        emit(
            "reading-analyzed",
            result
        );

        return result;

    }

    // ========================================================
    // TRANSLATION
    // ========================================================

    async function translate(
        text,
        targetLanguage,
        options = {}
    ) {

        const value =
            clampText(
                text
            );

        if (!value) {

            return {

                ok:
                    false,

                error:
                    "EMPTY_TEXT"

            };

        }

        const target =
            resolveLanguage(
                targetLanguage
            );

        if (!target) {

            return {

                ok:
                    false,

                error:
                    "TARGET_LANGUAGE_NOT_SUPPORTED",

                targetLanguage

            };

        }

        /*
         * Wenn eine AI Engine vorhanden ist,
         * wird die Übersetzung an sie weitergereicht.
         */

        const engine =
            window.HalDoAIEngine ||
            window.HalDoOS?.aiEngine ||
            null;

        if (
            engine
        ) {

            const methods = [

                "translate",
                "translateText"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof engine[method] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await engine[method](
                            value,
                            target,
                            options
                        );

                    state.translationCount++;

                    const response = {

                        ok:
                            result?.ok !==
                            false,

                        type:
                            "translation",

                        sourceLanguage:
                            detectLanguage(
                                value
                            ).language,

                        targetLanguage:
                            target,

                        text:
                            result?.text ??
                            result?.content ??
                            result?.translation ??
                            String(
                                result ?? ""
                            ),

                        result

                    };

                    state.lastOperation =
                        "translation";

                    state.lastResult =
                        response;

                    emit(
                        "translated",
                        response
                    );

                    return response;

                } catch (error) {

                    recordError(
                        error
                    );

                }

            }

        }

        /*
         * Kein Provider:
         * keine erfundene Übersetzung zurückgeben.
         */

        return {

            ok:
                false,

            type:
                "translation",

            error:
                "TRANSLATION_PROVIDER_UNAVAILABLE",

            sourceLanguage:
                detectLanguage(
                    value
                ).language,

            targetLanguage:
                target,

            text:
                ""

        };

    }

    // ========================================================
    // GENERATIVE LANGUAGE REQUEST
    // ========================================================

    async function process(
        text,
        operation = "analyze",
        options = {}
    ) {

        state.processing =
            true;

        state.requestCount++;

        const requestId =
            createId(
                "language-request"
            );

        try {

            const value =
                clampText(
                    text
                );

            let result;

            switch (
                normalize(
                    operation
                )
            ) {

                case "detect":

                case "sprache":

                    result =
                        detectLanguage(
                            value
                        );

                    break;

                case "analyze":

                case "analyse":

                    result =
                        analyzeText(
                            value,
                            options
                        );

                    break;

                case "spell":

                case "spelling":

                case "rechtschreibung":

                    result =
                        checkSpelling(
                            value,
                            options
                        );

                    break;

                case "grammar":

                case "grammatik":

                    result =
                        checkGrammar(
                            value,
                            options
                        );

                    break;

                case "correct":

                case "korrektur":

                case "korrigieren":

                    result =
                        applyCorrections(
                            value,
                            options
                        );

                    break;

                case "rewrite":

                case "umformulieren":

                case "formulieren":

                    result =
                        rewrite(
                            value,
                            options.style ||
                            "clear",
                            options
                        );

                    break;

                case "write":

                case "schreiben":

                    result =
                        assistWriting(
                            value,
                            options
                        );

                    break;

                case "read":

                case "lesen":

                case "reading":

                    result =
                        analyzeReading(
                            value,
                            options
                        );

                    break;

                default:

                    result = {

                        ok:
                            false,

                        error:
                            "UNKNOWN_LANGUAGE_OPERATION",

                        operation

                    };

            }

            const response = {

                ...result,

                requestId,

                timestamp:
                    Date.now()

            };

            state.lastResult =
                response;

            return response;

        } catch (error) {

            recordError(
                error
            );

            return {

                ok:
                    false,

                requestId,

                error:
                    error.message ||
                    String(
                        error
                    )

            };

        } finally {

            state.processing =
                false;

        }

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

            currentLanguage:
                state.currentLanguage,

            supportedLanguages:
                Object.keys(
                    LANGUAGES
                ).length,

            requestCount:
                state.requestCount,

            correctionCount:
                state.correctionCount,

            grammarCount:
                state.grammarCount,

            rewriteCount:
                state.rewriteCount,

            translationCount:
                state.translationCount,

            readingCount:
                state.readingCount,

            writingCount:
                state.writingCount,

            errors:
                state.errors.length,

            features: {

                spelling:
                    CONFIG.spellingEnabled,

                grammar:
                    CONFIG.grammarEnabled,

                correction:
                    CONFIG.correctionEnabled,

                rewriting:
                    CONFIG.rewritingEnabled,

                translation:
                    CONFIG.translationEnabled,

                reading:
                    CONFIG.readingAnalysisEnabled,

                writing:
                    CONFIG.writingAssistantEnabled

            }

        };

    }

    // ========================================================
    // ERROR HANDLING
    // ========================================================

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
         * Bereits vorhandene Sprache
         * aus dem Language Manager übernehmen.
         */

        const languageManager =
            window.HalDoLanguageManager ||
            window.HalDoOS?.languageManager ||
            null;

        if (
            languageManager &&
            typeof languageManager.getLanguage ===
            "function"
        ) {

            try {

                const language =
                    resolveLanguage(
                        languageManager.getLanguage()
                    );

                if (language) {

                    state.currentLanguage =
                        language;

                }

            } catch (error) {}

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
                    "ai-language",
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

        languages:
            LANGUAGES,

        initialize,

        on,

        off,

        emit,

        detectLanguage,

        getSupportedLanguages,

        getLanguage,

        resolveLanguage,

        setLanguage,

        setEzidiLanguage,

        analyzeText,

        detectErrors,

        checkSpelling,

        checkGrammar,

        applyCorrections,

        correct:
            applyCorrections,

        rewrite,

        assistWriting,

        analyzeReading,

        translate,

        process,

        getStatus,

        getErrors: () =>
            state.errors.slice(),

        clearErrors: () => {

            state.errors =
                [];

            emit(
                "errors-cleared"
            );

            return true;

        }

    };

    // ========================================================
    // GLOBAL REGISTRATION
    // ========================================================

    window.HalDoAILanguage =
        api;

    window.HalDoOS.aiLanguage =
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
// END OF PART 85
// ============================================================