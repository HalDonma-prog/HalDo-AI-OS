/* ============================================================
   HALDO AI OS 20
   SETTINGS APPLICATION
   ------------------------------------------------------------
   Datei:
       js/apps/settings-app.js

   Vollständige Einstellungen-App

   Verbindungen:
   - HalDoAppManager
   - HalDoAppRegistry
   - HalDoStorage
   - HalDoLanguageManager
   - HalDoAI
   - HalDoVoice
   - HalDoKeyboard
   - HalDoSystem
   - HalDoKernel
   - HalDoOS Events

   Die App besitzt:
   - eigene Oberfläche
   - Navigation
   - Suche
   - Kategorien
   - Einstellungen
   - Speicherung
   - Events
   - Reset
   - Systeminformationen
   - responsive Oberfläche
   - Home-Rückkehr
   ============================================================ */

"use strict";

(function (window, document) {

    if (
        window.HalDoSettingsApp &&
        window.HalDoSettingsApp.__haldoAI20Settings
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;

    const APP_ID =
        "settings";

    const VERSION =
        "20.0.0";

    const APP_NAME =
        "HalDo Einstellungen";

    /* ========================================================
       01 — SERVICES
       ======================================================== */

    function getAppManager() {

        return (
            window.HalDoAppManager ||
            window.HalDoOSAppManager ||
            HalDoOS.appManager ||
            null
        );

    }

    function getStorage() {

        return (
            window.HalDoStorage ||
            HalDoOS.storage ||
            null
        );

    }

    function getLanguage() {

        return (
            window.HalDoLanguageManager ||
            HalDoOS.languageManager ||
            window.HalDoLanguage ||
            HalDoOS.language ||
            null
        );

    }

    function getAI() {

        return (
            window.HalDoAI ||
            HalDoOS.ai ||
            window.HalDoAICore ||
            HalDoOS.aiCore ||
            null
        );

    }

    function getVoice() {

        return (
            window.HalDoVoice ||
            HalDoOS.voice ||
            null
        );

    }

    function getKeyboard() {

        return (
            window.HalDoEzidiKeyboard ||
            window.HalDoKeyboard ||
            HalDoOS.keyboard ||
            null
        );

    }

    function getSystem() {

        return (
            window.HalDoSystem ||
            HalDoOS.system ||
            null
        );

    }

    function getKernel() {

        return (
            window.HalDoKernel ||
            HalDoOS.kernel ||
            null
        );

    }

    /* ========================================================
       02 — HELPERS
       ======================================================== */

    function hasMethod(
        object,
        method
    ) {

        return !!(
            object &&
            typeof object[method] ===
            "function"
        );

    }

    function safeString(
        value
    ) {

        return String(
            value ?? ""
        ).trim();

    }

    function escapeHTML(
        value
    ) {

        return safeString(
            value
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

    }

    function emit(
        event,
        detail = {}
    ) {

        try {

            document.dispatchEvent(
                new CustomEvent(
                    "haldo:settings:" + event,
                    {
                        detail
                    }
                )
            );

        } catch (_) {}

        try {

            if (
                HalDoOS.events &&
                hasMethod(
                    HalDoOS.events,
                    "emit"
                )
            ) {

                HalDoOS.events.emit(
                    "settings:" + event,
                    detail
                );

            }

        } catch (_) {}

    }

    /* ========================================================
       03 — DEFAULT SETTINGS
       ======================================================== */

    const DEFAULT_SETTINGS = {

        general: {

            language:
                "de",

            startup:
                true,

            animations:
                true,

            sounds:
                true

        },

        appearance: {

            theme:
                "system",

            accent:
                "blue",

            transparency:
                true,

            rounded:
                true,

            compact:
                false

        },

        ai: {

            enabled:
                true,

            voice:
                true,

            memory:
                true,

            suggestions:
                true,

            autoLanguage:
                true

        },

        voice: {

            enabled:
                true,

            rate:
                1,

            pitch:
                1,

            volume:
                1

        },

        keyboard: {

            enabled:
                true,

            ezidi:
                true,

            suggestions:
                true,

            autocorrect:
                true

        },

        notifications: {

            enabled:
                true,

            sounds:
                true,

            desktop:
                true,

            badges:
                true

        },

        privacy: {

            analytics:
                false,

            diagnostics:
                true,

            rememberApps:
                true

        }

    };

    let settings =
        deepMerge(
            {},
            DEFAULT_SETTINGS
        );

    /* ========================================================
       04 — STATE
       ======================================================== */

    const state = {

        mounted:
            false,

        initialized:
            false,

        activeCategory:
            "general",

        search:
            "",

        saving:
            false,

        error:
            null

    };

    let root =
        null;

    /* ========================================================
       05 — OBJECT UTILITIES
       ======================================================== */

    function deepMerge(
        target,
        source
    ) {

        const output =
            target &&
            typeof target === "object"
                ? target
                : {};

        if (
            !source ||
            typeof source !== "object"
        ) {

            return output;

        }

        Object.keys(
            source
        ).forEach(
            key => {

                const value =
                    source[key];

                if (
                    value &&
                    typeof value === "object" &&
                    !Array.isArray(
                        value
                    )
                ) {

                    output[key] =
                        deepMerge(
                            output[key] || {},
                            value
                        );

                } else {

                    output[key] =
                        value;

                }

            }
        );

        return output;

    }

    function getValue(
        path
    ) {

        return path.split(
            "."
        ).reduce(
            (
                object,
                key
            ) =>
                object &&
                object[key] !== undefined
                    ? object[key]
                    : undefined,
            settings
        );

    }

    function setValue(
        path,
        value
    ) {

        const parts =
            path.split(".");

        let target =
            settings;

        for (
            let i = 0;
            i < parts.length - 1;
            i++
        ) {

            if (
                !target[parts[i]] ||
                typeof target[parts[i]] !==
                "object"
            ) {

                target[parts[i]] =
                    {};

            }

            target =
                target[parts[i]];

        }

        target[
            parts[
                parts.length - 1
            ]
        ] =
            value;

    }

    /* ========================================================
       06 — STORAGE
       ======================================================== */

    const STORAGE_KEY =
        "haldo.os20.settings";

    async function loadSettings() {

        const storage =
            getStorage();

        try {

            if (
                storage &&
                hasMethod(
                    storage,
                    "get"
                )
            ) {

                const result =
                    storage.get(
                        STORAGE_KEY
                    );

                const value =
                    result &&
                    typeof result.then ===
                    "function"
                        ? await result
                        : result;

                if (
                    value &&
                    typeof value ===
                    "object"
                ) {

                    settings =
                        deepMerge(
                            deepMerge(
                                {},
                                DEFAULT_SETTINGS
                            ),
                            value
                        );

                    return settings;

                }

            }

            const raw =
                window.localStorage.getItem(
                    STORAGE_KEY
                );

            if (raw) {

                const parsed =
                    JSON.parse(
                        raw
                    );

                if (
                    parsed &&
                    typeof parsed ===
                    "object"
                ) {

                    settings =
                        deepMerge(
                            deepMerge(
                                {},
                                DEFAULT_SETTINGS
                            ),
                            parsed
                        );

                }

            }

        } catch (error) {

            state.error =
                error.message;

            console.warn(
                "[HalDo Settings]",
                error
            );

        }

        return settings;

    }

    async function saveSettings() {

        state.saving =
            true;

        const snapshot =
            JSON.parse(
                JSON.stringify(
                    settings
                )
            );

        const storage =
            getStorage();

        try {

            if (
                storage &&
                hasMethod(
                    storage,
                    "set"
                )
            ) {

                const result =
                    storage.set(
                        STORAGE_KEY,
                        snapshot
                    );

                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

            } else {

                window.localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(
                        snapshot
                    )
                );

            }

            state.saving =
                false;

            emit(
                "saved",
                {
                    settings:
                        snapshot
                }
            );

            return true;

        } catch (error) {

            state.saving =
                false;

            state.error =
                error.message;

            console.error(
                "[HalDo Settings]",
                error
            );

            return false;

        }

    }

    /* ========================================================
       07 — CATEGORIES
       ======================================================== */

    const CATEGORIES = [

        {
            id:
                "general",

            icon:
                "⚙",

            title:
                "Allgemein",

            description:
                "Grundlegende Einstellungen"
        },

        {
            id:
                "appearance",

            icon:
                "◐",

            title:
                "Erscheinungsbild",

            description:
                "Theme, Farben und Oberfläche"
        },

        {
            id:
                "ai",

            icon:
                "✦",

            title:
                "HalDo AI",

            description:
                "AI, Gedächtnis und Assistent"
        },

        {
            id:
                "voice",

            icon:
                "◉",

            title:
                "Stimme",

            description:
                "Sprachausgabe und Stimme"
        },

        {
            id:
                "keyboard",

            icon:
                "⌨",

            title:
                "Tastatur",

            description:
                "Tastatur und Êzîdî-Unterstützung"
        },

        {
            id:
                "notifications",

            icon:
                "◌",

            title:
                "Benachrichtigungen",

            description:
                "Hinweise und Meldungen"
        },

        {
            id:
                "privacy",

            icon:
                "◇",

            title:
                "Datenschutz",

            description:
                "Privatsphäre und Diagnose"
        },

        {
            id:
                "system",

            icon:
                "▣",

            title:
                "System",

            description:
                "HalDo AI OS Systeminformationen"
        }

    ];

    /* ========================================================
       08 — RENDER
       ======================================================== */

    function render() {

        if (!root) {
            return;
        }

        root.innerHTML = `
            <div class="haldo-settings">

                <header class="haldo-settings-header">

                    <div class="haldo-settings-title">

                        <button
                            class="haldo-settings-back"
                            data-action="home"
                            type="button"
                            aria-label="Zurück"
                        >
                            ‹
                        </button>

                        <div>
                            <div class="haldo-settings-kicker">
                                HALDO AI OS 20
                            </div>

                            <h1>
                                Einstellungen
                            </h1>

                            <p>
                                Zentrale Steuerung deines HalDo AI OS
                            </p>
                        </div>

                    </div>

                    <div class="haldo-settings-status">
                        <span class="haldo-settings-status-dot"></span>
                        System verbunden
                    </div>

                </header>

                <div class="haldo-settings-search">

                    <span>⌕</span>

                    <input
                        type="search"
                        data-role="search"
                        placeholder="Einstellungen durchsuchen..."
                        value="${escapeHTML(
                            state.search
                        )}"
                    >

                </div>

                <div class="haldo-settings-layout">

                    <nav
                        class="haldo-settings-sidebar"
                        data-role="navigation"
                    >

                        ${renderNavigation()}

                    </nav>

                    <main
                        class="haldo-settings-content"
                        data-role="content"
                    >

                        ${renderCategory()}

                    </main>

                </div>

                <footer class="haldo-settings-footer">

                    <span>
                        HalDo AI OS 20.0.0
                    </span>

                    <button
                        type="button"
                        data-action="reset"
                    >
                        Einstellungen zurücksetzen
                    </button>

                </footer>

            </div>
        `;

        bindEvents();

    }

    function renderNavigation() {

        return CATEGORIES
            .filter(
                category =>
                    category.id !==
                    "system"
            )
            .map(
                category => {

                    const active =
                        state.activeCategory ===
                        category.id;

                    return `
                        <button
                            type="button"
                            class="
                                haldo-settings-nav-item
                                ${active ? "active" : ""}
                            "
                            data-category="${category.id}"
                        >

                            <span class="haldo-settings-nav-icon">
                                ${category.icon}
                            </span>

                            <span class="haldo-settings-nav-text">

                                <strong>
                                    ${escapeHTML(
                                        category.title
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        category.description
                                    )}
                                </small>

                            </span>

                        </button>
                    `;

                }
            )
            .join("");

    }

    function renderCategory() {

        if (
            state.activeCategory ===
            "general"
        ) {

            return renderGeneral();

        }

        if (
            state.activeCategory ===
            "appearance"
        ) {

            return renderAppearance();

        }

        if (
            state.activeCategory ===
            "ai"
        ) {

            return renderAI();

        }

        if (
            state.activeCategory ===
            "voice"
        ) {

            return renderVoice();

        }

        if (
            state.activeCategory ===
            "keyboard"
        ) {

            return renderKeyboard();

        }

        if (
            state.activeCategory ===
            "notifications"
        ) {

            return renderNotifications();

        }

        if (
            state.activeCategory ===
            "privacy"
        ) {

            return renderPrivacy();

        }

        if (
            state.activeCategory ===
            "system"
        ) {

            return renderSystem();

        }

        return renderGeneral();

    }

    function section(
        title,
        description,
        content
    ) {

        return `
            <section class="haldo-settings-section">

                <div class="haldo-settings-section-heading">

                    <div>
                        <h2>
                            ${escapeHTML(
                                title
                            )}
                        </h2>

                        <p>
                            ${escapeHTML(
                                description
                            )}
                        </p>
                    </div>

                </div>

                <div class="haldo-settings-card">
                    ${content}
                </div>

            </section>
        `;

    }

    function toggle(
        path,
        title,
        description
    ) {

        const checked =
            getValue(
                path
            ) === true;

        return `
            <label class="haldo-settings-row">

                <span class="haldo-settings-row-text">

                    <strong>
                        ${escapeHTML(
                            title
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            description
                        )}
                    </small>

                </span>

                <input
                    type="checkbox"
                    class="haldo-settings-toggle"
                    data-setting="${path}"
                    ${checked ? "checked" : ""}
                >

                <span class="haldo-switch">
                    <span></span>
                </span>

            </label>
        `;

    }

    function select(
        path,
        title,
        description,
        options
    ) {

        const value =
            getValue(
                path
            );

        return `
            <label class="haldo-settings-row">

                <span class="haldo-settings-row-text">

                    <strong>
                        ${escapeHTML(
                            title
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            description
                        )}
                    </small>

                </span>

                <select
                    data-setting="${path}"
                >

                    ${options.map(
                        option => `
                            <option
                                value="${escapeHTML(
                                    option.value
                                )}"
                                ${
                                    value ===
                                    option.value
                                        ? "selected"
                                        : ""
                                }
                            >
                                ${escapeHTML(
                                    option.label
                                )}
                            </option>
                        `
                    ).join("")}

                </select>

            </label>
        `;

    }

    function renderGeneral() {

        return `

            <div class="haldo-settings-category-header">

                <div class="haldo-settings-category-icon">
                    ⚙
                </div>

                <div>
                    <h2>Allgemein</h2>
                    <p>
                        Grundlegende Einstellungen für HalDo AI OS.
                    </p>
                </div>

            </div>

            ${section(
                "Grundsystem",
                "Steuere das grundlegende Verhalten des Systems.",
                [
                    toggle(
                        "general.startup",
                        "Beim Systemstart vorbereiten",
                        "HalDo lädt wichtige Komponenten bereits beim Start."
                    ),

                    toggle(
                        "general.animations",
                        "Animationen",
                        "Aktiviert flüssige Übergänge und Systemanimationen."
                    ),

                    toggle(
                        "general.sounds",
                        "Systemklänge",
                        "Aktiviert akustische Systemereignisse."
                    ),

                    select(
                        "general.language",
                        "Sprache",
                        "Standardsprache der HalDo-Oberfläche.",
                        [
                            {
                                value:
                                    "de",
                                label:
                                    "Deutsch"
                            },
                            {
                                value:
                                    "en",
                                label:
                                    "English"
                            },
                            {
                                value:
                                    "ku",
                                label:
                                    "Kurdî"
                            },
                            {
                                value:
                                    "ar",
                                label:
                                    "العربية"
                            },
                            {
                                value:
                                    "tr",
                                label:
                                    "Türkçe"
                            }
                        ]
                    )

                ].join("")
            )}

        `;

    }

    function renderAppearance() {

        return `

            <div class="haldo-settings-category-header">

                <div class="haldo-settings-category-icon">
                    ◐
                </div>

                <div>
                    <h2>Erscheinungsbild</h2>
                    <p>
                        Passe die HalDo-Oberfläche an.
                    </p>
                </div>

            </div>

            ${section(
                "Oberfläche",
                "Theme und visuelle Darstellung.",
                [

                    select(
                        "appearance.theme",
                        "Theme",
                        "Wähle das Erscheinungsbild.",
                        [
                            {
                                value:
                                    "system",
                                label:
                                    "System"
                            },
                            {
                                value:
                                    "light",
                                label:
                                    "Hell"
                            },
                            {
                                value:
                                    "dark",
                                label:
                                    "Dunkel"
                            }
                        ]
                    ),

                    select(
                        "appearance.accent",
                        "Akzentfarbe",
                        "Zentrale Farbe der HalDo-Oberfläche.",
                        [
                            {
                                value:
                                    "blue",
                                label:
                                    "HalDo Blau"
                            },
                            {
                                value:
                                    "red",
                                label:
                                    "HalDo Rot"
                            },
                            {
                                value:
                                    "purple",
                                label:
                                    "Violett"
                            },
                            {
                                value:
                                    "cyan",
                                label:
                                    "Cyan"
                            }
                        ]
                    ),

                    toggle(
                        "appearance.transparency",
                        "Transparenz",
                        "Aktiviert moderne transparente Oberflächen."
                    ),

                    toggle(
                        "appearance.rounded",
                        "Abgerundete Oberflächen",
                        "Verwendet moderne abgerundete UI-Elemente."
                    ),

                    toggle(
                        "appearance.compact",
                        "Kompakte Darstellung",
                        "Reduziert Abstände für kleinere Bildschirme."
                    )

                ].join("")
            )}

        `;

    }

    function renderAI() {

        return `

            <div class="haldo-settings-category-header">

                <div class="haldo-settings-category-icon">
                    ✦
                </div>

                <div>
                    <h2>HalDo AI</h2>
                    <p>
                        Einstellungen für den zentralen HalDo AI-Assistenten.
                    </p>
                </div>

            </div>

            ${section(
                "AI-Assistent",
                "Steuere die intelligenten Funktionen.",
                [

                    toggle(
                        "ai.enabled",
                        "HalDo AI aktivieren",
                        "Aktiviert den zentralen AI-Assistenten."
                    ),

                    toggle(
                        "ai.voice",
                        "AI-Sprachfunktionen",
                        "Erlaubt Sprachinteraktion mit HalDo AI."
                    ),

                    toggle(
                        "ai.memory",
                        "AI-Gedächtnis",
                        "Erlaubt der AI, freigegebene Gesprächskontexte zu speichern."
                    ),

                    toggle(
                        "ai.suggestions",
                        "Intelligente Vorschläge",
                        "Zeigt kontextbezogene Vorschläge an."
                    ),

                    toggle(
                        "ai.autoLanguage",
                        "Automatische Spracherkennung",
                        "Erkennt die Sprache deiner Eingabe automatisch."
                    )

                ].join("")
            )}

        `;

    }

    function renderVoice() {

        return `

            <div class="haldo-settings-category-header">

                <div class="haldo-settings-category-icon">
                    ◉
                </div>

                <div>
                    <h2>Stimme</h2>
                    <p>
                        Sprachwiedergabe und Sprachverhalten.
                    </p>
                </div>

            </div>

            ${section(
                "Sprachwiedergabe",
                "Steuere die HalDo-Sprachausgabe.",
                [

                    toggle(
                        "voice.enabled",
                        "Sprachausgabe aktivieren",
                        "HalDo kann Antworten vorlesen."
                    ),

                    `
                    <label class="haldo-settings-range">

                        <span>
                            <strong>
                                Geschwindigkeit
                            </strong>

                            <output
                                data-output="voice.rate"
                            >
                                ${getValue(
                                    "voice.rate"
                                )}
                            </output>
                        </span>

                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value="${getValue(
                                "voice.rate"
                            )}"
                            data-setting="voice.rate"
                        >

                    </label>
                    `,

                    `
                    <label class="haldo-settings-range">

                        <span>
                            <strong>
                                Tonhöhe
                            </strong>

                            <output
                                data-output="voice.pitch"
                            >
                                ${getValue(
                                    "voice.pitch"
                                )}
                            </output>
                        </span>

                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value="${getValue(
                                "voice.pitch"
                            )}"
                            data-setting="voice.pitch"
                        >

                    </label>
                    `,

                    `
                    <label class="haldo-settings-range">

                        <span>
                            <strong>
                                Lautstärke
                            </strong>

                            <output
                                data-output="voice.volume"
                            >
                                ${getValue(
                                    "voice.volume"
                                )}
                            </output>
                        </span>

                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value="${getValue(
                                "voice.volume"
                            )}"
                            data-setting="voice.volume"
                        >

                    </label>
                    `

                ].join("")
            )}

        `;

    }

    function renderKeyboard() {

        return `

            <div class="haldo-settings-category-header">

                <div class="haldo-settings-category-icon">
                    ⌨
                </div>

                <div>
                    <h2>Tastatur</h2>
                    <p>
                        HalDo-Tastatur und Êzîdî-Unterstützung.
                    </p>
                </div>

            </div>

            ${section(
                "Tastatur",
                "Einstellungen für Eingabe und Sprachen.",
                [

                    toggle(
                        "keyboard.enabled",
                        "HalDo-Tastatur aktivieren",
                        "Aktiviert die zentrale HalDo-Eingabe."
                    ),

                    toggle(
                        "keyboard.ezidi",
                        "Êzîdî-Tastatur",
                        "Aktiviert die vorgesehenen Êzîdî-Zeichen und Layouts."
                    ),

                    toggle(
                        "keyboard.suggestions",
                        "Wortvorschläge",
                        "Zeigt passende Wortvorschläge an."
                    ),

                    toggle(
                        "keyboard.autocorrect",
                        "Automatische Korrektur",
                        "Korrigiert häufige Schreibfehler."
                    )

                ].join("")
            )}

        `;

    }

    function renderNotifications() {

        return `

            <div class="haldo-settings-category-header">

                <div class="haldo-settings-category-icon">
                    ◌
                </div>

                <div>
                    <h2>Benachrichtigungen</h2>
                    <p>
                        Kontrolle über Hinweise und Meldungen.
                    </p>
                </div>

            </div>

            ${section(
                "Benachrichtigungen",
                "Bestimme, wie HalDo dich informiert.",
                [

                    toggle(
                        "notifications.enabled",
                        "Benachrichtigungen",
                        "Aktiviert Systembenachrichtigungen."
                    ),

                    toggle(
                        "notifications.sounds",
                        "Benachrichtigungstöne",
                        "Spielt bei neuen Meldungen einen Ton."
                    ),

                    toggle(
                        "notifications.desktop",
                        "Desktop-Hinweise",
                        "Zeigt Hinweise auf dem Hauptdesktop."
                    ),

                    toggle(
                        "notifications.badges",
                        "App-Badges",
                        "Zeigt ungelesene Informationen an Apps."
                    )

                ].join("")
            )}

        `;

    }

    function renderPrivacy() {

        return `

            <div class="haldo-settings-category-header">

                <div class="haldo-settings-category-icon">
                    ◇
                </div>

                <div>
                    <h2>Datenschutz</h2>
                    <p>
                        Kontrolle über Diagnose und gespeicherte Informationen.
                    </p>
                </div>

            </div>

            ${section(
                "Datenschutz",
                "HalDo soll transparent und kontrollierbar bleiben.",
                [

                    toggle(
                        "privacy.analytics",
                        "Anonyme Nutzungsanalyse",
                        "Standardmäßig deaktiviert."
                    ),

                    toggle(
                        "privacy.diagnostics",
                        "Systemdiagnose",
                        "Erlaubt lokale Diagnosefunktionen."
                    ),

                    toggle(
                        "privacy.rememberApps",
                        "App-Zustände merken",
                        "Merkt sich zuletzt verwendete Apps."
                    )

                ].join("")
            )}

        `;

    }

    function renderSystem() {

        const system =
            getSystem();

        const kernel =
            getKernel();

        const manager =
            getAppManager();

        const appCount =
            manager &&
            hasMethod(
                manager,
                "getCount"
            )
                ? manager.getCount()
                : 0;

        return `

            <div class="haldo-settings-category-header">

                <div class="haldo-settings-category-icon">
                    ▣
                </div>

                <div>
                    <h2>System</h2>
                    <p>
                        Informationen über HalDo AI OS.
                    </p>
                </div>

            </div>

            ${section(
                "Systeminformationen",
                "Technische Informationen zur aktuellen Laufzeit.",
                `

                    <div class="haldo-system-info-grid">

                        <div>
                            <small>
                                Betriebssystem
                            </small>
                            <strong>
                                HalDo AI OS
                            </strong>
                        </div>

                        <div>
                            <small>
                                Version
                            </small>
                            <strong>
                                20.0.0
                            </strong>
                        </div>

                        <div>
                            <small>
                                Application Manager
                            </small>
                            <strong>
                                ${
                                    manager
                                        ? "Verbunden"
                                        : "Nicht verbunden"
                                }
                            </strong>
                        </div>

                        <div>
                            <small>
                                Kernel
                            </small>
                            <strong>
                                ${
                                    kernel
                                        ? "Verbunden"
                                        : "Nicht verbunden"
                                }
                            </strong>
                        </div>

                        <div>
                            <small>
                                System
                            </small>
                            <strong>
                                ${
                                    system
                                        ? "Verbunden"
                                        : "Nicht verbunden"
                                }
                            </strong>
                        </div>

                        <div>
                            <small>
                                Registrierte Apps
                            </small>
                            <strong>
                                ${appCount}
                            </strong>
                        </div>

                    </div>

                `
            )}

        `;

    }

    /* ========================================================
       09 — EVENTS
       ======================================================== */

    function bindEvents() {

        if (!root) {
            return;
        }

        root.querySelectorAll(
            "[data-category]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.activeCategory =
                            button.dataset.category;

                        state.search =
                            "";

                        render();

                    }
                );

            }
        );

        const search =
            root.querySelector(
                '[data-role="search"]'
            );

        if (search) {

            search.addEventListener(
                "input",
                event => {

                    state.search =
                        safeString(
                            event.target.value
                        );

                    applySearch();

                }
            );

        }

        root.querySelectorAll(
            "[data-setting]"
        )
        .forEach(
            control => {

                control.addEventListener(
                    "change",
                    async event => {

                        const path =
                            control.dataset.setting;

                        let value;

                        if (
                            control.type ===
                            "checkbox"
                        ) {

                            value =
                                control.checked;

                        } else if (
                            control.type ===
                            "range"
                        ) {

                            value =
                                Number(
                                    control.value
                                );

                        } else {

                            value =
                                control.value;

                        }

                        setValue(
                            path,
                            value
                        );

                        updateOutput(
                            path,
                            value
                        );

                        applyRuntimeSetting(
                            path,
                            value
                        );

                        await saveSettings();

                        emit(
                            "changed",
                            {
                                path,
                                value,
                                settings
                            }
                        );

                    }
                );

            }
        );

        const home =
            root.querySelector(
                '[data-action="home"]'
            );

        if (home) {

            home.addEventListener(
                "click",
                goHome
            );

        }

        const reset =
            root.querySelector(
                '[data-action="reset"]'
            );

        if (reset) {

            reset.addEventListener(
                "click",
                resetSettings
            );

        }

    }

    function updateOutput(
        path,
        value
    ) {

        const output =
            root &&
            root.querySelector(
                `[data-output="${path}"]`
            );

        if (output) {

            output.value =
                value;

            output.textContent =
                value;

        }

    }

    function applySearch() {

        if (!root) {
            return;
        }

        const query =
            state.search
                .toLowerCase();

        root.querySelectorAll(
            ".haldo-settings-nav-item"
        )
        .forEach(
            item => {

                const text =
                    item.textContent
                        .toLowerCase();

                item.hidden =
                    !!(
                        query &&
                        !text.includes(
                            query
                        )
                    );

            }
        );

        if (query) {

            root.querySelectorAll(
                ".haldo-settings-row"
            )
            .forEach(
                row => {

                    row.hidden =
                        !row.textContent
                            .toLowerCase()
                            .includes(
                                query
                            );

                }
            );

        }

    }

    /* ========================================================
       10 — RUNTIME CONNECTIONS
       ======================================================== */

    function applyRuntimeSetting(
        path,
        value
    ) {

        if (
            path ===
            "general.language"
        ) {

            const language =
                getLanguage();

            if (
                language &&
                hasMethod(
                    language,
                    "setLanguage"
                )
            ) {

                try {

                    language.setLanguage(
                        value
                    );

                } catch (_) {}

            }

        }

        if (
            path.startsWith(
                "voice."
            )
        ) {

            const voice =
                getVoice();

            if (
                voice &&
                hasMethod(
                    voice,
                    "configure"
                )
            ) {

                try {

                    voice.configure(
                        {
                            ...settings.voice
                        }
                    );

                } catch (_) {}

            }

        }

        if (
            path ===
            "ai.enabled"
        ) {

            const ai =
                getAI();

            if (
                ai &&
                hasMethod(
                    ai,
                    value
                        ? "enable"
                        : "disable"
                )
            ) {

                try {

                    ai[
                        value
                            ? "enable"
                            : "disable"
                    ]();

                } catch (_) {}

            }

        }

        if (
            path ===
            "appearance.theme"
        ) {

            applyTheme(
                value
            );

        }

        if (
            path ===
            "appearance.accent"
        ) {

            applyAccent(
                value
            );

        }

        if (
            path ===
            "appearance.transparency"
        ) {

            document.documentElement
                .classList.toggle(
                    "haldo-no-transparency",
                    !value
                );

        }

        if (
            path ===
            "appearance.compact"
        ) {

            document.documentElement
                .classList.toggle(
                    "haldo-compact",
                    !!value
                );

        }

    }

    function applyTheme(
        theme
    ) {

        const html =
            document.documentElement;

        html.dataset.haldoTheme =
            theme;

    }

    function applyAccent(
        accent
    ) {

        document.documentElement
            .dataset.haldoAccent =
            accent;

    }

    function applyAllRuntimeSettings() {

        Object.keys(
            settings
        )
        .forEach(
            category => {

                Object.keys(
                    settings[category]
                )
                .forEach(
                    key => {

                        applyRuntimeSetting(
                            category +
                            "." +
                            key,
                            settings[
                                category
                            ][key]
                        );

                    }
                );

            }
        );

    }

    /* ========================================================
       11 — HOME
       ======================================================== */

    async function goHome() {

        const manager =
            getAppManager();

        try {

            if (
                manager &&
                hasMethod(
                    manager,
                    "close"
                )
            ) {

                await manager.close(
                    APP_ID
                );

            }

        } catch (_) {}

        emit(
            "home-requested"
        );

        try {

            document.dispatchEvent(
                new CustomEvent(
                    "haldo:home:open",
                    {
                        detail: {
                            source:
                                APP_ID
                        }
                    }
                )
            );

        } catch (_) {}

        try {

            if (
                HalDoOS.shell &&
                hasMethod(
                    HalDoOS.shell,
                    "showHome"
                )
            ) {

                HalDoOS.shell.showHome();

            }

        } catch (_) {}

    }

    /* ========================================================
       12 — RESET
       ======================================================== */

    async function resetSettings() {

        const confirmed =
            window.confirm(
                "Alle HalDo-Einstellungen auf die Standardwerte zurücksetzen?"
            );

        if (!confirmed) {
            return;
        }

        settings =
            deepMerge(
                {},
                DEFAULT_SETTINGS
            );

        await saveSettings();

        applyAllRuntimeSettings();

        render();

        emit(
            "reset",
            {
                settings
            }
        );

    }

    /* ========================================================
       13 — MOUNT
       ======================================================== */

    function findExistingSurface() {

        const selectors = [

            '[data-haldo-app="settings"]',

            '#haldo-app-settings',

            '.haldo-app-settings',

            '.haldo-settings-window'

        ];

        for (
            const selector of selectors
        ) {

            try {

                const found =
                    document.querySelector(
                        selector
                    );

                if (found) {
                    return found;
                }

            } catch (_) {}

        }

        return null;

    }

    function createSurface() {

        const existing =
            findExistingSurface();

        if (existing) {

            return existing;

        }

        const surface =
            document.createElement(
                "section"
            );

        surface.id =
            "haldo-app-settings";

        surface.dataset.haldoApp =
            APP_ID;

        surface.className =
            "haldo-settings-surface";

        const host =
            document.querySelector(
                "#haldo-app-root"
            ) ||
            document.querySelector(
                "#app-root"
            ) ||
            document.querySelector(
                "main"
            ) ||
            document.body;

        host.appendChild(
            surface
        );

        return surface;

    }

    async function mount() {

        if (
            state.mounted &&
            root
        ) {

            render();

            return root;

        }

        await loadSettings();

        root =
            createSurface();

        injectStyles();

        state.mounted =
            true;

        render();

        applyAllRuntimeSettings();

        return root;

    }

    /* ========================================================
       14 — CSS
       ======================================================== */

    function injectStyles() {

        if (
            document.getElementById(
                "haldo-settings-style"
            )
        ) {

            return;

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "haldo-settings-style";

        style.textContent = `

            .haldo-settings-surface {
                width: 100%;
                height: 100%;
                min-height: 100%;
                overflow: auto;
                box-sizing: border-box;
                font-family:
                    Inter,
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    sans-serif;
            }

            .haldo-settings {
                width: 100%;
                min-height: 100%;
                box-sizing: border-box;
                padding: 28px;
                color: var(--haldo-text, #eef4ff);
                background:
                    radial-gradient(
                        circle at top right,
                        rgba(53, 105, 255, .16),
                        transparent 35%
                    ),
                    linear-gradient(
                        145deg,
                        #08101f,
                        #0b1426 48%,
                        #07101d
                    );
            }

            .haldo-settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 20px;
                margin-bottom: 22px;
            }

            .haldo-settings-title {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .haldo-settings-title h1 {
                margin: 2px 0 5px;
                font-size: 30px;
                letter-spacing: -.5px;
            }

            .haldo-settings-title p {
                margin: 0;
                opacity: .68;
                font-size: 14px;
            }

            .haldo-settings-kicker {
                font-size: 11px;
                letter-spacing: 2px;
                opacity: .55;
            }

            .haldo-settings-back {
                width: 44px;
                height: 44px;
                border: 1px solid rgba(255,255,255,.12);
                border-radius: 14px;
                background: rgba(255,255,255,.05);
                color: white;
                font-size: 30px;
                cursor: pointer;
            }

            .haldo-settings-back:hover {
                background: rgba(255,255,255,.1);
            }

            .haldo-settings-status {
                padding: 10px 14px;
                border: 1px solid rgba(255,255,255,.1);
                border-radius: 999px;
                background: rgba(255,255,255,.04);
                font-size: 12px;
                white-space: nowrap;
            }

            .haldo-settings-status-dot {
                display: inline-block;
                width: 7px;
                height: 7px;
                margin-right: 7px;
                border-radius: 50%;
                background: #4cff9a;
                box-shadow: 0 0 12px rgba(76,255,154,.7);
            }

            .haldo-settings-search {
                display: flex;
                align-items: center;
                gap: 10px;
                height: 48px;
                padding: 0 16px;
                margin-bottom: 20px;
                border: 1px solid rgba(255,255,255,.1);
                border-radius: 15px;
                background: rgba(255,255,255,.045);
            }

            .haldo-settings-search input {
                flex: 1;
                border: 0;
                outline: 0;
                background: transparent;
                color: inherit;
                font-size: 15px;
            }

            .haldo-settings-layout {
                display: grid;
                grid-template-columns: 285px minmax(0, 1fr);
                gap: 22px;
                align-items: start;
            }

            .haldo-settings-sidebar {
                position: sticky;
                top: 10px;
                display: flex;
                flex-direction: column;
                gap: 7px;
            }

            .haldo-settings-nav-item {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border: 1px solid transparent;
                border-radius: 14px;
                background: transparent;
                color: inherit;
                text-align: left;
                cursor: pointer;
            }

            .haldo-settings-nav-item:hover {
                background: rgba(255,255,255,.055);
            }

            .haldo-settings-nav-item.active {
                border-color: rgba(75,137,255,.3);
                background:
                    linear-gradient(
                        135deg,
                        rgba(55,116,255,.2),
                        rgba(255,255,255,.045)
                    );
            }

            .haldo-settings-nav-icon {
                width: 36px;
                height: 36px;
                display: grid;
                place-items: center;
                flex: 0 0 36px;
                border-radius: 11px;
                background: rgba(255,255,255,.06);
                font-size: 18px;
            }

            .haldo-settings-nav-text {
                display: flex;
                flex-direction: column;
                gap: 3px;
            }

            .haldo-settings-nav-text strong {
                font-size: 13px;
            }

            .haldo-settings-nav-text small {
                opacity: .52;
                font-size: 10px;
                line-height: 1.25;
            }

            .haldo-settings-content {
                min-width: 0;
            }

            .haldo-settings-category-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 22px;
            }

            .haldo-settings-category-icon {
                width: 52px;
                height: 52px;
                display: grid;
                place-items: center;
                border-radius: 16px;
                background:
                    linear-gradient(
                        135deg,
                        rgba(61,126,255,.3),
                        rgba(255,255,255,.06)
                    );
                border: 1px solid rgba(255,255,255,.1);
                font-size: 24px;
            }

            .haldo-settings-category-header h2 {
                margin: 0 0 4px;
                font-size: 21px;
            }

            .haldo-settings-category-header p {
                margin: 0;
                opacity: .6;
                font-size: 13px;
            }

            .haldo-settings-section {
                margin-bottom: 20px;
            }

            .haldo-settings-section-heading {
                margin-bottom: 9px;
            }

            .haldo-settings-section-heading h2 {
                margin: 0;
                font-size: 14px;
            }

            .haldo-settings-section-heading p {
                margin: 4px 0 0;
                opacity: .5;
                font-size: 11px;
            }

            .haldo-settings-card {
                overflow: hidden;
                border: 1px solid rgba(255,255,255,.09);
                border-radius: 17px;
                background: rgba(255,255,255,.045);
            }

            .haldo-settings-row,
            .haldo-settings-range {
                min-height: 67px;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                padding: 13px 17px;
                border-bottom: 1px solid rgba(255,255,255,.07);
            }

            .haldo-settings-row:last-child,
            .haldo-settings-range:last-child {
                border-bottom: 0;
            }

            .haldo-settings-row-text {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .haldo-settings-row-text strong {
                font-size: 13px;
            }

            .haldo-settings-row-text small {
                max-width: 620px;
                opacity: .52;
                font-size: 11px;
            }

            .haldo-settings-row select {
                min-width: 150px;
                padding: 9px 11px;
                border: 1px solid rgba(255,255,255,.12);
                border-radius: 10px;
                outline: 0;
                background: rgba(0,0,0,.2);
                color: inherit;
            }

            .haldo-settings-toggle {
                position: absolute;
                opacity: 0;
                pointer-events: none;
            }

            .haldo-switch {
                width: 44px;
                height: 25px;
                flex: 0 0 44px;
                padding: 3px;
                box-sizing: border-box;
                border-radius: 999px;
                background: rgba(255,255,255,.15);
                transition: .2s ease;
            }

            .haldo-switch span {
                display: block;
                width: 19px;
                height: 19px;
                border-radius: 50%;
                background: white;
                transition: .2s ease;
            }

            .haldo-settings-toggle:checked
            + .haldo-switch {
                background: #347cff;
            }

            .haldo-settings-toggle:checked
            + .haldo-switch span {
                transform: translateX(19px);
            }

            .haldo-settings-range {
                flex-direction: column;
                align-items: stretch;
            }

            .haldo-settings-range > span {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .haldo-settings-range output {
                opacity: .65;
                font-size: 12px;
            }

            .haldo-settings-range input {
                width: 100%;
            }

            .haldo-system-info-grid {
                display: grid;
                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(
                            160px,
                            1fr
                        )
                    );
                gap: 1px;
                background: rgba(255,255,255,.08);
            }

            .haldo-system-info-grid > div {
                padding: 18px;
                background: rgba(8,16,31,.75);
            }

            .haldo-system-info-grid small {
                display: block;
                margin-bottom: 7px;
                opacity: .48;
                font-size: 10px;
            }

            .haldo-system-info-grid strong {
                font-size: 13px;
            }

            .haldo-settings-footer {
                display: flex;
                justify-content: space-between;
                gap: 15px;
                margin-top: 22px;
                padding-top: 17px;
                border-top: 1px solid rgba(255,255,255,.08);
                opacity: .65;
                font-size: 11px;
            }

            .haldo-settings-footer button {
                border: 0;
                background: transparent;
                color: inherit;
                cursor: pointer;
                opacity: .75;
            }

            .haldo-settings-footer button:hover {
                opacity: 1;
            }

            @media (max-width: 800px) {

                .haldo-settings {
                    padding: 17px;
                }

                .haldo-settings-header {
                    align-items: flex-start;
                }

                .haldo-settings-status {
                    display: none;
                }

                .haldo-settings-layout {
                    grid-template-columns: 1fr;
                }

                .haldo-settings-sidebar {
                    position: static;
                    display: grid;
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                }

                .haldo-settings-nav-item {
                    min-width: 0;
                }

            }

            @media (max-width: 520px) {

                .haldo-settings-title h1 {
                    font-size: 24px;
                }

                .haldo-settings-sidebar {
                    grid-template-columns: 1fr;
                }

                .haldo-settings-row {
                    align-items: flex-start;
                }

                .haldo-settings-row select {
                    min-width: 110px;
                }

            }

            html.haldo-compact
            .haldo-settings-row {
                min-height: 54px;
                padding-top: 9px;
                padding-bottom: 9px;
            }

            html.haldo-no-transparency
            .haldo-settings-card,
            html.haldo-no-transparency
            .haldo-settings-search,
            html.haldo-no-transparency
            .haldo-settings-nav-item {
                backdrop-filter: none;
            }

            html[data-haldo-theme="light"]
            .haldo-settings {
                color: #152033;
                background: #eef3fa;
            }

            html[data-haldo-theme="light"]
            .haldo-settings-card,
            html[data-haldo-theme="light"]
            .haldo-settings-search {
                background: rgba(255,255,255,.8);
                border-color: rgba(0,0,0,.08);
            }

        `;

        document.head.appendChild(
            style
        );

    }

    /* ========================================================
       15 — APP DEFINITION
       ======================================================== */

    const definition = {

        id:
            APP_ID,

        appId:
            APP_ID,

        name:
            APP_NAME,

        title:
            APP_NAME,

        description:
            "Zentrale Einstellungen von HalDo AI OS 20",

        version:
            VERSION,

        category:
            "system",

        icon:
            "⚙",

        route:
            "/settings",

        singleton:
            true,

        enabled:
            true,

        visible:
            true,

        tags: [

            "settings",
            "system",
            "configuration",
            "preferences",
            "haldo"

        ],

        permissions: [

            "storage",
            "system",
            "language",
            "voice",
            "keyboard"

        ],

        dependencies: [],

        settings: {},

        async init(
            payload
        ) {

            state.initialized =
                true;

            emit(
                "initialized",
                {
                    payload
                }
            );

        },

        async start(
            payload
        ) {

            await mount();

            emit(
                "started",
                {
                    payload
                }
            );

        },

        async open(
            payload
        ) {

            await mount();

            emit(
                "opened",
                {
                    payload
                }
            );

        },

        async activate(
            payload
        ) {

            await mount();

            if (root) {

                root.style.display =
                    "";

            }

            emit(
                "activated",
                {
                    payload
                }
            );

        },

        async deactivate() {

            emit(
                "deactivated"
            );

        },

        async close() {

            if (root) {

                root.style.display =
                    "none";

            }

            emit(
                "closed"
            );

        },

        async stop() {

            emit(
                "stopped"
            );

        }

    };

    /* ========================================================
       16 — REGISTRATION
       ======================================================== */

    function register() {

        const manager =
            getAppManager();

        try {

            if (
                manager &&
                hasMethod(
                    manager,
                    "register"
                )
            ) {

                const existing =
                    manager.get &&
                    manager.get(
                        APP_ID
                    );

                if (!existing) {

                    manager.register(
                        definition
                    );

                }

                return true;

            }

        } catch (error) {

            console.error(
                "[HalDo Settings]",
                "Registration failed:",
                error
            );

        }

        return false;

    }

    /* ========================================================
       17 — PUBLIC API
       ======================================================== */

    const api = {

        __haldoAI20Settings:
            true,

        id:
            APP_ID,

        name:
            APP_NAME,

        version:
            VERSION,

        definition,

        state,

        settings:
            () =>
                JSON.parse(
                    JSON.stringify(
                        settings
                    )
                ),

        mount,

        render,

        loadSettings,

        saveSettings,

        set(
            path,
            value
        ) {

            setValue(
                path,
                value
            );

            applyRuntimeSetting(
                path,
                value
            );

            return saveSettings();

        },

        get(
            path
        ) {

            return getValue(
                path
            );

        },

        reset:
            resetSettings,

        goHome

    };

    window.HalDoSettingsApp =
        api;

    HalDoOS.settingsApp =
        api;

    /* ========================================================
       18 — START
       ======================================================== */

    function boot() {

        register();

        loadSettings()
            .then(
                () => {

                    applyAllRuntimeSettings();

                }
            )
            .catch(
                error => {

                    console.error(
                        "[HalDo Settings]",
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

    console.log(
        "[HalDo Settings] HalDo Einstellungen bereit."
    );

})(window, document);

/* ============================================================
   END — HALDO SETTINGS APPLICATION
   ============================================================ */