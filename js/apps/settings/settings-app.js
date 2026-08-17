/* ============================================================
   HALDO AI OS 20
   SETTINGS APP
   ------------------------------------------------------------
   Datei:
       js/apps/settings/settings-app.js

   Vollständige Settings-Anwendung

   VERBINDET:
   - App Contract
   - App Manager
   - App Registry
   - Kernel
   - System
   - Storage
   - Language
   - Voice
   - AI
   - Êzîdî Keyboard
   - Notifications
   - Home / Launcher über App Manager

   ============================================================ */

"use strict";

(function (window, document) {

    /* ========================================================
       01 — FOUNDATION
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;

    const VERSION =
        "20.0.0";

    const APP_ID =
        "settings";

    const APP_NAME =
        "Settings";

    const APP_TITLE =
        "HalDo Einstellungen";


    /* ========================================================
       02 — SERVICE ACCESS
       ======================================================== */

    function getAppManager() {

        return (
            window.HalDoAppManager ||
            window.HalDoOSAppManager ||
            HalDoOS.appManager ||
            null
        );

    }


    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            HalDoOS.appRegistry ||
            null
        );

    }


    function getContract() {

        return (
            window.HalDoAppContract ||
            HalDoOS.appContract ||
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


    function getSystem() {

        return (
            window.HalDoSystem ||
            HalDoOS.system ||
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


    function getVoice() {

        return (
            window.HalDoVoice ||
            HalDoOS.voice ||
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


    function getKeyboard() {

        return (
            window.HalDoEzidiKeyboard ||
            window.HalDoKeyboard ||
            HalDoOS.keyboard ||
            null
        );

    }


    function getNotifications() {

        return (
            window.HalDoNotifications ||
            HalDoOS.notifications ||
            null
        );

    }


    function method(
        object,
        name
    ) {

        return !!(
            object &&
            typeof object[name] ===
            "function"
        );

    }


    /* ========================================================
       03 — INTERNAL STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        started:
            false,

        open:
            false,

        active:
            false,

        mounted:
            false,

        currentSection:
            "general",

        root:
            null,

        settings: {

            language:
                "de",

            appearance:
                "system",

            accentColor:
                "blue",

            animations:
                true,

            sounds:
                true,

            voiceEnabled:
                true,

            aiEnabled:
                true,

            notifications:
                true,

            keyboard:
                "standard",

            autoStart:
                true,

            privacyMode:
                false

        },

        listeners:
            new Map()

    };


    /* ========================================================
       04 — EVENTS
       ======================================================== */

    function on(
        event,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return function () {};

        }

        if (
            !state.listeners.has(
                event
            )
        ) {

            state.listeners.set(
                event,
                new Set()
            );

        }

        const listeners =
            state.listeners.get(
                event
            );

        listeners.add(
            callback
        );

        return function () {

            listeners.delete(
                callback
            );

        };

    }


    function emit(
        event,
        detail = {}
    ) {

        const listeners =
            state.listeners.get(
                event
            );

        if (listeners) {

            Array.from(
                listeners
            ).forEach(
                callback => {

                    try {

                        callback(
                            detail
                        );

                    } catch (error) {

                        console.error(
                            "[HalDo Settings]",
                            error
                        );

                    }

                }
            );

        }


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


        const manager =
            getAppManager();

        if (
            manager &&
            method(
                manager,
                "emit"
            )
        ) {

            try {

                manager.emit(
                    "settings:" + event,
                    detail
                );

            } catch (_) {}

        }

    }


    /* ========================================================
       05 — STORAGE
       ======================================================== */

    const STORAGE_KEY =
        "haldo.os20.settings.app";


    function clone(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }

        if (
            Array.isArray(
                value
            )
        ) {

            return value.map(
                clone
            );

        }

        if (
            typeof value ===
            "object"
        ) {

            const result = {};

            Object.keys(
                value
            ).forEach(
                key => {

                    result[key] =
                        clone(
                            value[key]
                        );

                }
            );

            return result;

        }

        return value;

    }


    function loadSettings() {

        const manager =
            getAppManager();

        if (
            manager &&
            method(
                manager,
                "loadAppSettings"
            )
        ) {

            try {

                const result =
                    manager.loadAppSettings(
                        APP_ID
                    );

                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    return result.then(
                        value => {

                            if (
                                value &&
                                typeof value ===
                                "object"
                            ) {

                                Object.assign(
                                    state.settings,
                                    value
                                );

                            }

                            return state.settings;

                        }
                    );

                }

                if (
                    result &&
                    typeof result ===
                    "object"
                ) {

                    Object.assign(
                        state.settings,
                        result
                    );

                    return state.settings;

                }

            } catch (error) {

                console.warn(
                    "[HalDo Settings] Manager storage failed:",
                    error
                );

            }

        }


        const storage =
            getStorage();

        if (
            storage &&
            method(
                storage,
                "get"
            )
        ) {

            try {

                const result =
                    storage.get(
                        STORAGE_KEY
                    );

                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    return result.then(
                        value => {

                            if (
                                value &&
                                typeof value ===
                                "object"
                            ) {

                                Object.assign(
                                    state.settings,
                                    value
                                );

                            }

                            return state.settings;

                        }
                    );

                }

                if (
                    result &&
                    typeof result ===
                    "object"
                ) {

                    Object.assign(
                        state.settings,
                        result
                    );

                    return state.settings;

                }

            } catch (error) {

                console.warn(
                    "[HalDo Settings] Storage read failed:",
                    error
                );

            }

        }


        try {

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

                    Object.assign(
                        state.settings,
                        parsed
                    );

                }

            }

        } catch (_) {}

        return state.settings;

    }


    function saveSettings() {

        const snapshot =
            clone(
                state.settings
            );


        const manager =
            getAppManager();

        if (
            manager &&
            method(
                manager,
                "setSettings"
            )
        ) {

            try {

                const result =
                    manager.setSettings(
                        APP_ID,
                        snapshot
                    );

                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    result.catch(
                        error =>
                            console.warn(
                                "[HalDo Settings]",
                                error
                            )
                    );

                }

                return true;

            } catch (_) {}

        }


        const storage =
            getStorage();

        if (
            storage &&
            method(
                storage,
                "set"
            )
        ) {

            try {

                storage.set(
                    STORAGE_KEY,
                    snapshot
                );

                return true;

            } catch (_) {}

        }


        try {

            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    snapshot
                )
            );

            return true;

        } catch (_) {

            return false;

        }

    }


    /* ========================================================
       06 — SETTING UPDATE
       ======================================================== */

    function setSetting(
        key,
        value
    ) {

        if (
            !Object.prototype.hasOwnProperty.call(
                state.settings,
                key
            )
        ) {

            return false;

        }

        const previous =
            state.settings[key];

        state.settings[key] =
            value;

        saveSettings();

        applySetting(
            key,
            value
        );

        emit(
            "setting-changed",
            {

                key,

                value,

                previous

            }
        );

        render();

        return true;

    }


    function applySetting(
        key,
        value
    ) {

        /* ----------------------------------------
           Appearance
           ---------------------------------------- */

        if (
            key ===
            "appearance"
        ) {

            applyAppearance(
                value
            );

        }


        /* ----------------------------------------
           Accent
           ---------------------------------------- */

        if (
            key ===
            "accentColor"
        ) {

            try {

                document.documentElement
                    .setAttribute(
                        "data-haldo-accent",
                        String(
                            value
                        )
                    );

            } catch (_) {}

        }


        /* ----------------------------------------
           Animations
           ---------------------------------------- */

        if (
            key ===
            "animations"
        ) {

            try {

                document.documentElement
                    .setAttribute(
                        "data-haldo-animations",
                        value
                            ? "enabled"
                            : "disabled"
                    );

            } catch (_) {}

        }


        /* ----------------------------------------
           Language
           ---------------------------------------- */

        if (
            key ===
            "language"
        ) {

            const language =
                getLanguage();

            if (
                language &&
                method(
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


        /* ----------------------------------------
           Voice
           ---------------------------------------- */

        if (
            key ===
            "voiceEnabled"
        ) {

            const voice =
                getVoice();

            if (
                voice &&
                method(
                    voice,
                    value
                        ? "enable"
                        : "disable"
                )
            ) {

                try {

                    voice[
                        value
                            ? "enable"
                            : "disable"
                    ]();

                } catch (_) {}

            }

        }

    }


    function applyAppearance(
        appearance
    ) {

        let mode =
            String(
                appearance ||
                "system"
            );

        if (
            mode !== "dark" &&
            mode !== "light" &&
            mode !== "system"
        ) {

            mode =
                "system";

        }

        try {

            document.documentElement
                .setAttribute(
                    "data-haldo-appearance",
                    mode
                );

        } catch (_) {}

        if (
            mode ===
            "dark"
        ) {

            document.documentElement
                .classList
                .add(
                    "haldo-dark"
                );

        } else if (
            mode ===
            "light"
        ) {

            document.documentElement
                .classList
                .remove(
                    "haldo-dark"
                );

        } else {

            try {

                const dark =
                    window.matchMedia &&
                    window.matchMedia(
                        "(prefers-color-scheme: dark)"
                    ).matches;

                document.documentElement
                    .classList
                    .toggle(
                        "haldo-dark",
                        !!dark
                    );

            } catch (_) {}

        }

    }


    /* ========================================================
       07 — CSS
       ======================================================== */

    function installStyles() {

        if (
            document.getElementById(
                "haldo-settings-app-style"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );

        style.id =
            "haldo-settings-app-style";


        style.textContent = `

            .haldo-settings-app {
                width: 100%;
                height: 100%;
                min-height: 100%;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background:
                    linear-gradient(
                        145deg,
                        rgba(10, 18, 35, .98),
                        rgba(18, 28, 52, .96)
                    );
                color: #f5f7fb;
                font-family:
                    Inter,
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    sans-serif;
            }

            .haldo-settings-header {
                min-height: 72px;
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 14px 20px;
                border-bottom:
                    1px solid
                    rgba(255,255,255,.10);
                background:
                    rgba(255,255,255,.035);
                backdrop-filter:
                    blur(18px);
            }

            .haldo-settings-logo {
                width: 44px;
                height: 44px;
                border-radius: 13px;
                display: flex;
                align-items: center;
                justify-content: center;
                background:
                    linear-gradient(
                        135deg,
                        rgba(42,130,255,.35),
                        rgba(132,72,255,.35)
                    );
                border:
                    1px solid
                    rgba(255,255,255,.12);
                overflow: hidden;
            }

            .haldo-settings-logo img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            .haldo-settings-heading {
                flex: 1;
                min-width: 0;
            }

            .haldo-settings-heading h1 {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
            }

            .haldo-settings-heading p {
                margin: 4px 0 0;
                color: rgba(255,255,255,.60);
                font-size: 12px;
            }

            .haldo-settings-body {
                flex: 1;
                min-height: 0;
                display: flex;
                overflow: hidden;
            }

            .haldo-settings-nav {
                width: 250px;
                flex: 0 0 250px;
                padding: 14px;
                overflow-y: auto;
                border-right:
                    1px solid
                    rgba(255,255,255,.08);
                background:
                    rgba(0,0,0,.12);
            }

            .haldo-settings-nav button {
                width: 100%;
                border: 0;
                color: rgba(255,255,255,.78);
                background: transparent;
                text-align: left;
                padding: 12px 13px;
                margin-bottom: 5px;
                border-radius: 12px;
                cursor: pointer;
                font: inherit;
                transition:
                    background .18s ease,
                    color .18s ease,
                    transform .18s ease;
            }

            .haldo-settings-nav button:hover {
                background:
                    rgba(255,255,255,.07);
                color: white;
                transform: translateX(2px);
            }

            .haldo-settings-nav button.active {
                background:
                    rgba(52,126,255,.20);
                color: white;
                box-shadow:
                    inset 0 0 0 1px
                    rgba(92,158,255,.18);
            }

            .haldo-settings-nav-icon {
                display: inline-block;
                width: 28px;
            }

            .haldo-settings-content {
                flex: 1;
                min-width: 0;
                overflow-y: auto;
                padding: 24px;
            }

            .haldo-settings-section-title {
                margin: 0 0 8px;
                font-size: 26px;
                font-weight: 750;
            }

            .haldo-settings-section-description {
                margin: 0 0 22px;
                color: rgba(255,255,255,.58);
                line-height: 1.55;
            }

            .haldo-settings-card {
                border:
                    1px solid
                    rgba(255,255,255,.09);
                border-radius: 18px;
                padding: 6px;
                margin-bottom: 16px;
                background:
                    rgba(255,255,255,.035);
            }

            .haldo-settings-row {
                min-height: 64px;
                display: flex;
                align-items: center;
                gap: 18px;
                padding: 13px 15px;
                border-bottom:
                    1px solid
                    rgba(255,255,255,.065);
            }

            .haldo-settings-row:last-child {
                border-bottom: 0;
            }

            .haldo-settings-row-main {
                flex: 1;
                min-width: 0;
            }

            .haldo-settings-row-title {
                font-size: 14px;
                font-weight: 650;
            }

            .haldo-settings-row-description {
                margin-top: 4px;
                color: rgba(255,255,255,.50);
                font-size: 12px;
                line-height: 1.45;
            }

            .haldo-settings-select,
            .haldo-settings-input {
                min-width: 150px;
                border:
                    1px solid
                    rgba(255,255,255,.12);
                border-radius: 10px;
                padding: 9px 11px;
                background:
                    rgba(0,0,0,.22);
                color: white;
                outline: none;
            }

            .haldo-settings-select:focus,
            .haldo-settings-input:focus {
                border-color:
                    rgba(76,145,255,.65);
            }

            .haldo-settings-switch {
                width: 48px;
                height: 28px;
                border-radius: 999px;
                border: 0;
                padding: 3px;
                background:
                    rgba(255,255,255,.16);
                cursor: pointer;
                transition:
                    background .18s ease;
            }

            .haldo-settings-switch span {
                display: block;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: white;
                transition:
                    transform .18s ease;
            }

            .haldo-settings-switch.on {
                background:
                    rgb(55,135,255);
            }

            .haldo-settings-switch.on span {
                transform:
                    translateX(20px);
            }

            .haldo-settings-action {
                border: 1px solid
                    rgba(255,255,255,.12);
                border-radius: 11px;
                padding: 9px 14px;
                background:
                    rgba(255,255,255,.06);
                color: white;
                cursor: pointer;
            }

            .haldo-settings-action:hover {
                background:
                    rgba(255,255,255,.10);
            }

            .haldo-settings-danger {
                border-color:
                    rgba(255,80,90,.25);
            }

            .haldo-settings-status {
                display: inline-flex;
                align-items: center;
                gap: 7px;
                color: rgba(255,255,255,.58);
                font-size: 12px;
            }

            .haldo-settings-status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #40d98b;
            }

            @media (max-width: 700px) {

                .haldo-settings-body {
                    flex-direction: column;
                }

                .haldo-settings-nav {
                    width: auto;
                    flex: 0 0 auto;
                    border-right: 0;
                    border-bottom:
                        1px solid
                        rgba(255,255,255,.08);
                    display: flex;
                    overflow-x: auto;
                    gap: 6px;
                }

                .haldo-settings-nav button {
                    width: auto;
                    min-width: max-content;
                    margin: 0;
                }

                .haldo-settings-content {
                    padding: 18px;
                }

                .haldo-settings-row {
                    align-items: flex-start;
                    flex-direction: column;
                    gap: 10px;
                }

                .haldo-settings-select,
                .haldo-settings-input {
                    width: 100%;
                }

            }

        `;

        document.head.appendChild(
            style
        );

    }


    /* ========================================================
       08 — NAVIGATION
       ======================================================== */

    const sections = [

        {
            id:
                "general",
            icon:
                "⚙️",
            title:
                "Allgemein",
            description:
                "Grundlegende Einstellungen für HalDo AI OS 20."
        },

        {
            id:
                "appearance",
            icon:
                "🎨",
            title:
                "Darstellung",
            description:
                "Aussehen, Farben und Animationen des Systems."
        },

        {
            id:
                "language",
            icon:
                "🌐",
            title:
                "Sprache",
            description:
                "Sprache der Oberfläche und Kommunikation."
        },

        {
            id:
                "voice",
            icon:
                "🗣️",
            title:
                "Stimme",
            description:
                "Sprachfunktionen und Sprachsteuerung."
        },

        {
            id:
                "ai",
            icon:
                "✦",
            title:
                "HalDo AI",
            description:
                "KI-Funktionen und AI-Verhalten."
        },

        {
            id:
                "keyboard",
            icon:
                "⌨️",
            title:
                "Tastatur",
            description:
                "Tastatur und Êzîdî-Eingabe."
        },

        {
            id:
                "notifications",
            icon:
                "🔔",
            title:
                "Benachrichtigungen",
            description:
                "System- und App-Benachrichtigungen."
        },

        {
            id:
                "privacy",
            icon:
                "🔐",
            title:
                "Datenschutz",
            description:
                "Datenschutz und App-Berechtigungen."
        },

        {
            id:
                "storage",
            icon:
                "💾",
            title:
                "Speicher",
            description:
                "Gespeicherte App- und Systemdaten."
        },

        {
            id:
                "system",
            icon:
                "🖥️",
            title:
                "System",
            description:
                "HalDo AI OS Systeminformationen."
        },

        {
            id:
                "diagnostics",
            icon:
                "🩺",
            title:
                "Diagnose",
            description:
                "System- und App-Gesundheitsprüfung."
        }

    ];


    /* ========================================================
       09 — HTML HELPERS
       ======================================================== */

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
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


    function switchHTML(
        key
    ) {

        const enabled =
            !!state.settings[key];

        return `
            <button
                class="haldo-settings-switch ${
                    enabled ? "on" : ""
                }"
                data-setting-switch="${key}"
                aria-pressed="${
                    enabled
                        ? "true"
                        : "false"
                }"
                type="button"
            >
                <span></span>
            </button>
        `;

    }


    function selectHTML(
        key,
        options
    ) {

        const value =
            state.settings[key];

        return `
            <select
                class="haldo-settings-select"
                data-setting-select="${key}"
            >
                ${
                    options.map(
                        option => `
                            <option
                                value="${escapeHTML(option.value)}"
                                ${
                                    String(
                                        option.value
                                    ) ===
                                    String(
                                        value
                                    )
                                        ? "selected"
                                        : ""
                                }
                            >
                                ${escapeHTML(option.label)}
                            </option>
                        `
                    ).join("")
                }
            </select>
        `;

    }


    function row(
        title,
        description,
        control
    ) {

        return `
            <div class="haldo-settings-row">

                <div
                    class="haldo-settings-row-main"
                >

                    <div
                        class="haldo-settings-row-title"
                    >
                        ${escapeHTML(title)}
                    </div>

                    <div
                        class="haldo-settings-row-description"
                    >
                        ${escapeHTML(description)}
                    </div>

                </div>

                ${control}

            </div>
        `;

    }


    /* ========================================================
       10 — SECTION CONTENT
       ======================================================== */

    function renderGeneral() {

        return `

            <div class="haldo-settings-card">

                ${row(
                    "Automatisch starten",
                    "HalDo Apps dürfen ihre benötigten Dienste beim Start vorbereiten.",
                    switchHTML("autoStart")
                )}

                ${row(
                    "Systemklänge",
                    "Aktiviert oder deaktiviert allgemeine UI- und Systemklänge.",
                    switchHTML("sounds")
                )}

            </div>

            <div class="haldo-settings-card">

                ${row(
                    "HalDo AI",
                    "Zentrale KI-Funktionen des Betriebssystems.",
                    switchHTML("aiEnabled")
                )}

                ${row(
                    "Sprachfunktionen",
                    "Erlaubt HalDo AI OS die verfügbaren Sprachdienste zu verwenden.",
                    switchHTML("voiceEnabled")
                )}

                ${row(
                    "Benachrichtigungen",
                    "System- und App-Benachrichtigungen aktivieren.",
                    switchHTML("notifications")
                )}

            </div>

        `;

    }


    function renderAppearance() {

        return `

            <div class="haldo-settings-card">

                ${row(
                    "Erscheinungsbild",
                    "Wähle zwischen Hell, Dunkel oder der Systemeinstellung.",
                    selectHTML(
                        "appearance",
                        [
                            {
                                value:
                                    "system",
                                label:
                                    "System"
                            },
                            {
                                value:
                                    "dark",
                                label:
                                    "Dunkel"
                            },
                            {
                                value:
                                    "light",
                                label:
                                    "Hell"
                            }
                        ]
                    )
                )}

                ${row(
                    "Akzentfarbe",
                    "Primäre Akzentfarbe für HalDo AI OS.",
                    selectHTML(
                        "accentColor",
                        [
                            {
                                value:
                                    "blue",
                                label:
                                    "HalDo Blue"
                            },
                            {
                                value:
                                    "red",
                                label:
                                    "Red"
                            },
                            {
                                value:
                                    "purple",
                                label:
                                    "Purple"
                            },
                            {
                                value:
                                    "cyan",
                                label:
                                    "Cyan"
                            }
                        ]
                    )
                )}

                ${row(
                    "Animationen",
                    "Logo-, Fenster- und UI-Animationen.",
                    switchHTML("animations")
                )}

            </div>

        `;

    }


    function renderLanguage() {

        return `

            <div class="haldo-settings-card">

                ${row(
                    "Systemsprache",
                    "Sprache der HalDo AI OS Oberfläche.",
                    selectHTML(
                        "language",
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
                            },
                            {
                                value:
                                    "fr",
                                label:
                                    "Français"
                            },
                            {
                                value:
                                    "es",
                                label:
                                    "Español"
                            }
                        ]
                    )
                )}

            </div>

        `;

    }


    function renderVoice() {

        const voice =
            getVoice();

        const connected =
            !!voice;

        return `

            <div class="haldo-settings-card">

                ${row(
                    "Sprachsteuerung",
                    "HalDo Voice verwenden, sofern der Sprachdienst verfügbar ist.",
                    switchHTML("voiceEnabled")
                )}

                <div
                    class="haldo-settings-row"
                >

                    <div
                        class="haldo-settings-row-main"
                    >

                        <div
                            class="haldo-settings-row-title"
                        >
                            Voice Service
                        </div>

                        <div
                            class="haldo-settings-row-description"
                        >
                            Verbindung zum vorhandenen HalDo Voice-Modul.
                        </div>

                    </div>

                    <span
                        class="haldo-settings-status"
                    >
                        <span
                            class="haldo-settings-status-dot"
                            style="${
                                connected
                                    ? ""
                                    : "background:#ff5964"
                            }"
                        ></span>

                        ${
                            connected
                                ? "Verbunden"
                                : "Nicht verfügbar"
                        }

                    </span>

                </div>

            </div>

        `;

    }


    function renderAI() {

        const ai =
            getAI();

        const connected =
            !!ai;

        return `

            <div class="haldo-settings-card">

                ${row(
                    "HalDo AI aktiv",
                    "Aktiviert die Verbindung zu den vorhandenen AI-Diensten.",
                    switchHTML("aiEnabled")
                )}

                <div
                    class="haldo-settings-row"
                >

                    <div
                        class="haldo-settings-row-main"
                    >

                        <div
                            class="haldo-settings-row-title"
                        >
                            AI Core
                        </div>

                        <div
                            class="haldo-settings-row-description"
                        >
                            Status des zentralen HalDo AI Dienstes.
                        </div>

                    </div>

                    <span
                        class="haldo-settings-status"
                    >
                        <span
                            class="haldo-settings-status-dot"
                            style="${
                                connected
                                    ? ""
                                    : "background:#ff5964"
                            }"
                        ></span>

                        ${
                            connected
                                ? "Verbunden"
                                : "Nicht verfügbar"
                        }

                    </span>

                </div>

            </div>

        `;

    }


    function renderKeyboard() {

        const keyboard =
            getKeyboard();

        const connected =
            !!keyboard;

        return `

            <div class="haldo-settings-card">

                ${row(
                    "Aktive Tastatur",
                    "Wähle die Standard-Eingabemethode.",
                    selectHTML(
                        "keyboard",
                        [
                            {
                                value:
                                    "standard",
                                label:
                                    "Standard"
                            },
                            {
                                value:
                                    "ezidi",
                                label:
                                    "Êzîdî"
                            }
                        ]
                    )
                )}

                <div
                    class="haldo-settings-row"
                >

                    <div
                        class="haldo-settings-row-main"
                    >

                        <div
                            class="haldo-settings-row-title"
                        >
                            Êzîdî Keyboard Service
                        </div>

                        <div
                            class="haldo-settings-row-description"
                        >
                            Verbindung zum vorhandenen Êzîdî-Tastaturmodul.
                        </div>

                    </div>

                    <span
                        class="haldo-settings-status"
                    >

                        <span
                            class="haldo-settings-status-dot"
                            style="${
                                connected
                                    ? ""
                                    : "background:#ff5964"
                            }"
                        ></span>

                        ${
                            connected
                                ? "Verbunden"
                                : "Nicht verfügbar"
                        }

                    </span>

                </div>

            </div>

        `;

    }


    function renderNotifications() {

        const notifications =
            getNotifications();

        return `

            <div class="haldo-settings-card">

                ${row(
                    "Benachrichtigungen",
                    "Systemweite Benachrichtigungen aktivieren.",
                    switchHTML("notifications")
                )}

                <div
                    class="haldo-settings-row"
                >

                    <div
                        class="haldo-settings-row-main"
                    >

                        <div
                            class="haldo-settings-row-title"
                        >
                            Notification Service
                        </div>

                        <div
                            class="haldo-settings-row-description"
                        >
                            Verbindung zum vorhandenen Notification-System.
                        </div>

                    </div>

                    <span
                        class="haldo-settings-status"
                    >

                        <span
                            class="haldo-settings-status-dot"
                            style="${
                                notifications
                                    ? ""
                                    : "background:#ff5964"
                            }"
                        ></span>

                        ${
                            notifications
                                ? "Verbunden"
                                : "Nicht verfügbar"
                        }

                    </span>

                </div>

            </div>

        `;

    }


    function renderPrivacy() {

        return `

            <div class="haldo-settings-card">

                ${row(
                    "Privatsphäre-Modus",
                    "Reduziert lokale Speicherung und optionale Systeminformationen.",
                    switchHTML("privacyMode")
                )}

            </div>

        `;

    }


    function renderStorage() {

        const storage =
            getStorage();

        const connected =
            !!storage;

        return `

            <div class="haldo-settings-card">

                <div
                    class="haldo-settings-row"
                >

                    <div
                        class="haldo-settings-row-main"
                    >

                        <div
                            class="haldo-settings-row-title"
                        >
                            Storage Service
                        </div>

                        <div
                            class="haldo-settings-row-description"
                        >
                            Zentraler HalDo Storage-Dienst.
                        </div>

                    </div>

                    <span
                        class="haldo-settings-status"
                    >

                        <span
                            class="haldo-settings-status-dot"
                            style="${
                                connected
                                    ? ""
                                    : "background:#ff5964"
                            }"
                        ></span>

                        ${
                            connected
                                ? "Verbunden"
                                : "Fallback / nicht verfügbar"
                        }

                    </span>

                </div>

                <div
                    class="haldo-settings-row"
                >

                    <div
                        class="haldo-settings-row-main"
                    >

                        <div
                            class="haldo-settings-row-title"
                        >
                            Einstellungen zurücksetzen
                        </div>

                        <div
                            class="haldo-settings-row-description"
                        >
                            Setzt ausschließlich die Einstellungen dieser App zurück.
                        </div>

                    </div>

                    <button
                        type="button"
                        class="haldo-settings-action haldo-settings-danger"
                        data-action="reset"
                    >
                        Zurücksetzen
                    </button>

                </div>

            </div>

        `;

    }


    function renderSystem() {

        const system =
            getSystem();

        const kernel =
            getKernel();

        return `

            <div class="haldo-settings-card">

                <div
                    class="haldo-settings-row"
                >

                    <div
                        class="haldo-settings-row-main"
                    >

                        <div
                            class="haldo-settings-row-title"
                        >
                            HalDo AI OS
                        </div>

                        <div
                            class="haldo-settings-row-description"
                        >
                            Zentrale Betriebssysteminformationen.
                        </div>

                    </div>

                    <span
                        class="haldo-settings-status"
                    >
                        Version 20.0.0
                    </span>

                </div>

                <div
                    class="haldo-settings-row"
                >

                    <div
                        class="haldo-settings-row-main"
                    >

                        <div
                            class="haldo-settings-row-title"
                        >
                            System Service
                        </div>

                        <div
                            class="haldo-settings-row-description"
                        >
                            Verbindung zum zentralen System.
                        </div>

                    </div>

                    <span
                        class="haldo-settings-status"
                    >

                        <span
                            class="haldo-settings-status-dot"
                            style="${
                                system
                                    ? ""
                                    : "background:#ff5964"
                            }"
                        ></span>

                        ${
                            system
                                ? "Verbunden"
                                : "Nicht verfügbar"
                        }

                    </span>

                </div>

                <div
                    class="haldo-settings-row"
                >

                    <div
                        class="haldo-settings-row-main"
                    >

                        <div
                            class="haldo-settings-row-title"
                        >
                            Kernel
                        </div>

                        <div
                            class="haldo-settings-row-description"
                        >
                            Zentrale Kernel-Verbindung.
                        </div>

                    </div>

                    <span
                        class="haldo-settings-status"
                    >

                        <span
                            class="haldo-settings-status-dot"
                            style="${
                                kernel
                                    ? ""
                                    : "background:#ff5964"
                            }"
                        ></span>

                        ${
                            kernel
                                ? "Verbunden"
                                : "Nicht verfügbar"
                        }

                    </span>

                </div>

            </div>

        `;

    }


    function renderDiagnostics() {

        const manager =
            getAppManager();

        let diagnostics =
            null;

        let health =
            null;

        if (
            manager &&
            method(
                manager,
                "diagnostics"
            )
        ) {

            try {

                diagnostics =
                    manager.diagnostics();

            } catch (_) {}

        }

        if (
            manager &&
            method(
                manager,
                "healthCheck"
            )
        ) {

            try {

                health =
                    manager.healthCheck();

            } catch (_) {}

        }

        const healthy =
            health &&
            health.healthy === true;

        return `

            <div class="haldo-settings-card">

                <div
                    class="haldo-settings-row"
                >

                    <div
                        class="haldo-settings-row-main"
                    >

                        <div
                            class="haldo-settings-row-title"
                        >
                            Application Manager
                        </div>

                        <div
                            class="haldo-settings-row-description"
                        >
                            ${
                                diagnostics
                                    ? (
                                        diagnostics.appCount ??
                                        0
                                    ) +
                                    " Apps registriert"
                                    : "Diagnose nicht verfügbar"
                            }
                        </div>

                    </div>

                    <span
                        class="haldo-settings-status"
                    >

                        <span
                            class="haldo-settings-status-dot"
                            style="${
                                diagnostics
                                    ? ""
                                    : "background:#ff5964"
                            }"
                        ></span>

                        ${
                            diagnostics
                                ? "Aktiv"
                                : "Nicht verfügbar"
                        }

                    </span>

                </div>

                <div
                    class="haldo-settings-row"
                >

                    <div
                        class="haldo-settings-row-main"
                    >

                        <div
                            class="haldo-settings-row-title"
                        >
                            System Health
                        </div>

                        <div
                            class="haldo-settings-row-description"
                        >
                            Prüfung der wichtigsten OS-Verbindungen.
                        </div>

                    </div>

                    <span
                        class="haldo-settings-status"
                    >

                        <span
                            class="haldo-settings-status-dot"
                            style="${
                                healthy
                                    ? ""
                                    : "background:#ff5964"
                            }"
                        ></span>

                        ${
                            healthy
                                ? "Healthy"
                                : "Prüfung erforderlich"
                        }

                    </span>

                </div>

            </div>

            <div class="haldo-settings-card">

                <div
                    class="haldo-settings-row"
                >

                    <div
                        class="haldo-settings-row-main"
                    >

                        <div
                            class="haldo-settings-row-title"
                        >
                            Diagnose aktualisieren
                        </div>

                        <div
                            class="haldo-settings-row-description"
                        >
                            Führt die Diagnose erneut aus.
                        </div>

                    </div>

                    <button
                        type="button"
                        class="haldo-settings-action"
                        data-action="diagnostics"
                    >
                        Prüfen
                    </button>

                </div>

            </div>

        `;

    }


    function renderSection() {

        switch (
            state.currentSection
        ) {

            case "appearance":
                return renderAppearance();

            case "language":
                return renderLanguage();

            case "voice":
                return renderVoice();

            case "ai":
                return renderAI();

            case "keyboard":
                return renderKeyboard();

            case "notifications":
                return renderNotifications();

            case "privacy":
                return renderPrivacy();

            case "storage":
                return renderStorage();

            case "system":
                return renderSystem();

            case "diagnostics":
                return renderDiagnostics();

            case "general":
            default:
                return renderGeneral();

        }

    }


    /* ========================================================
       11 — RENDER
       ======================================================== */

    function render() {

        if (!state.root) {

            return;

        }

        const section =
            sections.find(
                item =>
                    item.id ===
                    state.currentSection
            ) ||
            sections[0];


        state.root.innerHTML = `

            <div
                class="haldo-settings-app"
            >

                <header
                    class="haldo-settings-header"
                >

                    <div
                        class="haldo-settings-logo"
                    >

                        <img
                            src="assets/logo/logo.png"
                            alt="HalDo"
                            onerror="
                                this.style.display='none'
                            "
                        />

                    </div>

                    <div
                        class="haldo-settings-heading"
                    >

                        <h1>
                            ${APP_TITLE}
                        </h1>

                        <p>
                            HalDo AI OS 20 · Professional Ultimate
                        </p>

                    </div>

                </header>

                <div
                    class="haldo-settings-body"
                >

                    <nav
                        class="haldo-settings-nav"
                        aria-label="Settings Navigation"
                    >

                        ${
                            sections.map(
                                item => `
                                    <button
                                        type="button"
                                        class="${
                                            item.id ===
                                            state.currentSection
                                                ? "active"
                                                : ""
                                        }"
                                        data-section="${
                                            item.id
                                        }"
                                    >

                                        <span
                                            class="haldo-settings-nav-icon"
                                        >
                                            ${item.icon}
                                        </span>

                                        ${escapeHTML(
                                            item.title
                                        )}

                                    </button>
                                `
                            ).join("")
                        }

                    </nav>

                    <main
                        class="haldo-settings-content"
                    >

                        <h2
                            class="haldo-settings-section-title"
                        >
                            ${escapeHTML(
                                section.title
                            )}
                        </h2>

                        <p
                            class="haldo-settings-section-description"
                        >
                            ${escapeHTML(
                                section.description
                            )}
                        </p>

                        ${renderSection()}

                    </main>

                </div>

            </div>

        `;

        bindEvents();

    }


    /* ========================================================
       12 — EVENTS / UI
       ======================================================== */

    function bindEvents() {

        if (!state.root) {

            return;

        }


        state.root
            .querySelectorAll(
                "[data-section]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            state.currentSection =
                                this.dataset.section ||
                                "general";

                            render();

                            emit(
                                "section-changed",
                                {
                                    section:
                                        state.currentSection
                                }
                            );

                        }
                    );

                }
            );


        state.root
            .querySelectorAll(
                "[data-setting-switch]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            const key =
                                this.dataset.settingSwitch;

                            setSetting(
                                key,
                                !state.settings[key]
                            );

                        }
                    );

                }
            );


        state.root
            .querySelectorAll(
                "[data-setting-select]"
            )
            .forEach(
                select => {

                    select.addEventListener(
                        "change",
                        function () {

                            const key =
                                this.dataset.settingSelect;

                            setSetting(
                                key,
                                this.value
                            );

                        }
                    );

                }
            );


        const resetButton =
            state.root.querySelector(
                '[data-action="reset"]'
            );

        if (resetButton) {

            resetButton.addEventListener(
                "click",
                function () {

                    resetSettings();

                }
            );

        }


        const diagnosticsButton =
            state.root.querySelector(
                '[data-action="diagnostics"]'
            );

        if (diagnosticsButton) {

            diagnosticsButton.addEventListener(
                "click",
                function () {

                    render();

                    emit(
                        "diagnostics-requested"
                    );

                }
            );

        }

    }


    /* ========================================================
       13 — RESET
       ======================================================== */

    function getDefaultSettings() {

        return {

            language:
                "de",

            appearance:
                "system",

            accentColor:
                "blue",

            animations:
                true,

            sounds:
                true,

            voiceEnabled:
                true,

            aiEnabled:
                true,

            notifications:
                true,

            keyboard:
                "standard",

            autoStart:
                true,

            privacyMode:
                false

        };

    }


    function resetSettings() {

        state.settings =
            getDefaultSettings();

        saveSettings();

        Object.keys(
            state.settings
        ).forEach(
            key => {

                applySetting(
                    key,
                    state.settings[key]
                );

            }
        );

        render();

        emit(
            "settings-reset",
            {
                settings:
                    clone(
                        state.settings
                    )
            }
        );

        notify(
            "HalDo Einstellungen wurden zurückgesetzt."
        );

    }


    /* ========================================================
       14 — NOTIFICATION
       ======================================================== */

    function notify(
        message
    ) {

        const notifications =
            getNotifications();

        if (
            notifications &&
            method(
                notifications,
                "show"
            )
        ) {

            try {

                notifications.show(
                    message
                );

                return;

            } catch (_) {}

        }

        emit(
            "notification",
            {
                message
            }
        );

    }


    /* ========================================================
       15 — MOUNT
       ======================================================== */

    function mount(
        container
    ) {

        if (!container) {

            return false;

        }

        installStyles();

        state.root =
            container;

        state.mounted =
            true;

        render();

        emit(
            "mounted",
            {
                container
            }
        );

        return true;

    }


    function unmount() {

        if (
            state.root
        ) {

            state.root.innerHTML =
                "";

        }

        state.root =
            null;

        state.mounted =
            false;

        emit(
            "unmounted"
        );

        return true;

    }


    /* ========================================================
       16 — APP LIFECYCLE
       ======================================================== */

    async function init(
        context = {}
    ) {

        if (
            state.initialized
        ) {

            return true;

        }

        loadSettings();

        Object.keys(
            state.settings
        ).forEach(
            key => {

                applySetting(
                    key,
                    state.settings[key]
                );

            }
        );

        state.initialized =
            true;

        emit(
            "initialized",
            {
                context
            }
        );

        return true;

    }


    async function start(
        context = {}
    ) {

        if (
            !state.initialized
        ) {

            await init(
                context
            );

        }

        state.started =
            true;

        emit(
            "started",
            {
                context
            }
        );

        return true;

    }


    async function open(
        context = {}
    ) {

        if (
            !state.started
        ) {

            await start(
                context
            );

        }

        state.open =
            true;

        state.active =
            true;

        emit(
            "opened",
            {
                context
            }
        );

        return true;

    }


    async function activate(
        context = {}
    ) {

        state.active =
            true;

        emit(
            "activated",
            {
                context
            }
        );

        return true;

    }


    async function deactivate(
        context = {}
    ) {

        state.active =
            false;

        emit(
            "deactivated",
            {
                context
            }
        );

        return true;

    }


    async function minimize() {

        state.active =
            false;

        emit(
            "minimized"
        );

        return true;

    }


    async function restore() {

        state.open =
            true;

        state.active =
            true;

        emit(
            "restored"
        );

        return true;

    }


    async function close(
        context = {}
    ) {

        state.open =
            false;

        state.active =
            false;

        emit(
            "closed",
            {
                context
            }
        );

        return true;

    }


    async function stop() {

        state.started =
            false;

        emit(
            "stopped"
        );

        return true;

    }


    /* ========================================================
       17 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        return {

            id:
                APP_ID,

            name:
                APP_NAME,

            version:
                VERSION,

            initialized:
                state.initialized,

            started:
                state.started,

            open:
                state.open,

            active:
                state.active,

            mounted:
                state.mounted,

            currentSection:
                state.currentSection,

            services: {

                kernel:
                    !!getKernel(),

                system:
                    !!getSystem(),

                appManager:
                    !!getAppManager(),

                registry:
                    !!getRegistry(),

                contract:
                    !!getContract(),

                storage:
                    !!getStorage(),

                language:
                    !!getLanguage(),

                voice:
                    !!getVoice(),

                ai:
                    !!getAI(),

                keyboard:
                    !!getKeyboard(),

                notifications:
                    !!getNotifications()

            },

            settings:
                clone(
                    state.settings
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       18 — APP DEFINITION
       ======================================================== */

    const definition = {

        id:
            APP_ID,

        appId:
            APP_ID,

        name:
            APP_NAME,

        title:
            APP_TITLE,

        description:
            "Zentrale Einstellungen für HalDo AI OS 20.",

        version:
            VERSION,

        icon:
            "⚙️",

        category:
            "system",

        enabled:
            true,

        visible:
            true,

        singleton:
            true,

        permissions: [

            "system.settings",
            "storage.read",
            "storage.write",
            "language.manage",
            "voice.manage",
            "ai.manage",
            "keyboard.manage",
            "notifications.manage"

        ],

        dependencies: [],

        tags: [

            "settings",
            "system",
            "configuration",
            "haldo",
            "os"

        ],

        keywords: [

            "Einstellungen",
            "Settings",
            "System",
            "Sprache",
            "AI",
            "Voice",
            "Keyboard",
            "Storage"

        ],

        route:
            "/settings",

        settings:
            getDefaultSettings(),

        metadata: {

            os:
                "HalDo AI OS 20",

            foundation:
                "Professional Ultimate",

            appType:
                "system",

            central:
                true

        },

        init,

        start,

        open,

        activate,

        deactivate,

        minimize,

        restore,

        close,

        stop

    };


    /* ========================================================
       19 — APP API
       ======================================================== */

    const api = {

        __haldoAI20App:
            true,

        id:
            APP_ID,

        appId:
            APP_ID,

        name:
            APP_NAME,

        title:
            APP_TITLE,

        version:
            VERSION,

        definition,

        state,

        on,

        emit,

        init,

        start,

        open,

        activate,

        deactivate,

        minimize,

        restore,

        close,

        stop,

        mount,

        unmount,

        render,

        getSettings() {

            return clone(
                state.settings
            );

        },

        setSetting,

        resetSettings,

        getCurrentSection() {

            return state.currentSection;

        },

        setSection(
            section
        ) {

            const exists =
                sections.some(
                    item =>
                        item.id ===
                        section
                );

            if (!exists) {

                return false;

            }

            state.currentSection =
                section;

            render();

            return true;

        },

        getSections() {

            return sections.map(
                item => ({
                    ...item
                })
            );

        },

        diagnostics

    };


    /* ========================================================
       20 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoSettingsApp =
        api;

    window.HalDoOS.settingsApp =
        api;


    /* ========================================================
       21 — REGISTRY REGISTRATION
       ======================================================== */

    function registerApp() {

        const manager =
            getAppManager();

        const registry =
            getRegistry();

        let registered =
            false;


        /*
         * App Manager ist die bevorzugte
         * zentrale Registrierungsstelle.
         */

        if (
            manager &&
            method(
                manager,
                "registerApp"
            )
        ) {

            try {

                manager.registerApp(
                    definition
                );

                registered =
                    true;

            } catch (error) {

                console.warn(
                    "[HalDo Settings] App Manager registration failed:",
                    error
                );

            }

        }


        /*
         * Fallback auf Registry.
         */

        if (
            !registered &&
            registry &&
            method(
                registry,
                "register"
            )
        ) {

            try {

                registry.register(
                    definition
                );

                registered =
                    true;

            } catch (error) {

                console.warn(
                    "[HalDo Settings] Registry registration failed:",
                    error
                );

            }

        }


        emit(
            "registered",
            {
                registered
            }
        );


        return registered;

    }


    /* ========================================================
       22 — KERNEL REGISTRATION
       ======================================================== */

    function registerKernel() {

        const kernel =
            getKernel();

        if (!kernel) {

            return false;

        }

        try {

            if (
                method(
                    kernel,
                    "registerModule"
                )
            ) {

                kernel.registerModule(
                    "settings-app",
                    api
                );

            }

            return true;

        } catch (error) {

            console.warn(
                "[HalDo Settings] Kernel registration failed:",
                error
            );

            return false;

        }

    }


    /* ========================================================
       23 — BOOT
       ======================================================== */

    function boot() {

        installStyles();

        registerKernel();

        registerApp();

        init()
            .catch(
                error => {

                    console.error(
                        "[HalDo Settings] Boot failed:",
                        error
                    );

                }
            );

        console.log(
            "[HalDo Settings] Settings App 20.0.0 ready."
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


    /* ========================================================
       END OF SETTINGS APP
       ======================================================== */

})(window, document);