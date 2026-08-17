/* ============================================================
   HALDO AI OS 20
   SETTINGS APP
   ------------------------------------------------------------
   Datei:
       js/settings.js

   VOLLSTÄNDIGE EINSTELLUNGEN-APP

   Enthält:
   - vollständige Oberfläche
   - Navigation
   - Suche
   - Kategorien
   - Allgemeine Einstellungen
   - Erscheinungsbild
   - Sprache
   - AI
   - Voice
   - Keyboard
   - Apps
   - System
   - Datenschutz
   - Speicher
   - Diagnose
   - Zurücksetzen
   - Speicherung
   - Events
   - App Manager Verbindung
   - Router Verbindung
   - Window Manager Verbindung
   - Kernel Verbindung

   HALDO AI OS 20
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
        "Einstellungen";


    /* ========================================================
       02 — SERVICE ACCESS
       ======================================================== */

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


    function getAppManager() {

        return (
            window.HalDoAppManager ||
            HalDoOS.appManager ||
            null
        );

    }


    function getRouter() {

        return (
            window.HalDoAppRouter ||
            HalDoOS.appRouter ||
            null
        );

    }


    function getWindowManager() {

        return (
            window.HalDoWindowManager ||
            HalDoOS.windowManager ||
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
            window.HalDoSpeech ||
            HalDoOS.speech ||
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


    function getStorage() {

        return (
            window.HalDoStorage ||
            HalDoOS.storage ||
            null
        );

    }


    /* ========================================================
       03 — HELPERS
       ======================================================== */

    function clean(value) {

        return String(
            value ?? ""
        ).trim();

    }


    function escapeHTML(value) {

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


    function createId(
        prefix = "settings"
    ) {

        return (
            prefix +
            "-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8)
        );

    }


    /* ========================================================
       04 — DEFAULT SETTINGS
       ======================================================== */

    const DEFAULT_SETTINGS = {

        general: {

            startPage:
                "general",

            confirmBeforeDelete:
                true,

            animations:
                true,

            sounds:
                true,

            notifications:
                true

        },

        appearance: {

            theme:
                "system",

            accent:
                "haldo",

            compactMode:
                false,

            transparency:
                true,

            roundedWindows:
                true

        },

        language: {

            language:
                "de",

            systemLanguage:
                "de",

            appLanguage:
                "de",

            keyboardLanguage:
                "ezidi"

        },

        ai: {

            enabled:
                true,

            assistantName:
                "HalDo AI",

            memory:
                true,

            suggestions:
                true,

            voiceReplies:
                true

        },

        voice: {

            enabled:
                true,

            autoSpeak:
                false,

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

            layout:
                "ezidi",

            autocorrect:
                true,

            suggestions:
                true

        },

        privacy: {

            saveHistory:
                true,

            telemetry:
                false,

            personalizedAI:
                true

        }

    };


    /* ========================================================
       05 — INTERNAL STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        mounted:
            false,

        activeSection:
            "general",

        search:
            "",

        settings:
            null,

        root:
            null,

        listeners:
            new Map(),

        dirty:
            false,

        openedAt:
            null,

        statistics: {

            opens:
                0,

            saves:
                0,

            resets:
                0,

            changes:
                0,

            errors:
                0

        }

    };


    /* ========================================================
       06 — EVENTS
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

            off(
                event,
                callback
            );

        };

    }


    function off(
        event,
        callback
    ) {

        const listeners =
            state.listeners.get(
                event
            );

        if (!listeners) {

            return;

        }

        listeners.delete(
            callback
        );

        if (
            listeners.size ===
            0
        ) {

            state.listeners.delete(
                event
            );

        }

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
                    "haldo:settings:" +
                    event,
                    {
                        detail
                    }
                )
            );

        } catch (_) {}


        const kernel =
            getKernel();

        if (
            kernel &&
            hasMethod(
                kernel,
                "emit"
            )
        ) {

            try {

                kernel.emit(
                    "settings:" +
                    event,
                    detail
                );

            } catch (_) {}

        }

    }


    /* ========================================================
       07 — CLONE
       ======================================================== */

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


    function deepMerge(
        target,
        source
    ) {

        const output =
            clone(
                target
            ) || {};

        if (
            !source ||
            typeof source !==
            "object"
        ) {

            return output;

        }


        Object.keys(
            source
        ).forEach(
            key => {

                const sourceValue =
                    source[key];

                if (
                    sourceValue &&
                    typeof sourceValue ===
                    "object" &&
                    !Array.isArray(
                        sourceValue
                    )
                ) {

                    output[key] =
                        deepMerge(
                            output[key] || {},
                            sourceValue
                        );

                } else {

                    output[key] =
                        clone(
                            sourceValue
                        );

                }

            }
        );


        return output;

    }


    /* ========================================================
       08 — STORAGE
       ======================================================== */

    const STORAGE_KEY =
        "haldo.os20.settings.app";


    async function loadSettings() {

        let stored =
            null;

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

                stored =
                    storage.get(
                        STORAGE_KEY
                    );

                if (
                    stored &&
                    typeof stored.then ===
                    "function"
                ) {

                    stored =
                        await stored;

                }

            } else {

                const raw =
                    window.localStorage.getItem(
                        STORAGE_KEY
                    );

                if (raw) {

                    stored =
                        JSON.parse(
                            raw
                        );

                }

            }

        } catch (error) {

            state.statistics.errors +=
                1;

            console.error(
                "[HalDo Settings] Storage load error",
                error
            );

        }


        state.settings =
            deepMerge(
                DEFAULT_SETTINGS,
                stored || {}
            );


        return clone(
            state.settings
        );

    }


    async function saveSettings() {

        if (!state.settings) {

            return false;

        }


        const data =
            clone(
                state.settings
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
                        data
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
                        data
                    )
                );

            }


            state.dirty =
                false;

            state.statistics.saves +=
                1;


            emit(
                "saved",
                {
                    settings:
                        clone(
                            data
                        )
                }
            );


            return true;

        } catch (error) {

            state.statistics.errors +=
                1;

            console.error(
                "[HalDo Settings] Storage save error",
                error
            );

            emit(
                "error",
                {
                    error
                }
            );


            return false;

        }

    }


    /* ========================================================
       09 — SETTINGS ACCESS
       ======================================================== */

    function getValue(
        section,
        key
    ) {

        return (
            state.settings &&
            state.settings[section] &&
            state.settings[section][key]
        );

    }


    function setValue(
        section,
        key,
        value
    ) {

        if (!state.settings) {

            return false;

        }


        if (
            !state.settings[section]
        ) {

            state.settings[section] =
                {};

        }


        state.settings[section][key] =
            value;

        state.dirty =
            true;

        state.statistics.changes +=
            1;


        emit(
            "changed",
            {

                section,

                key,

                value,

                settings:
                    clone(
                        state.settings
                    )

            }
        );


        applySetting(
            section,
            key,
            value
        );


        saveSettings();


        render();


        return true;

    }


    /* ========================================================
       10 — APPLY SETTINGS
       ======================================================== */

    function applySetting(
        section,
        key,
        value
    ) {

        /* Appearance */

        if (
            section ===
            "appearance"
        ) {

            if (
                key ===
                "theme"
            ) {

                applyTheme(
                    value
                );

            }

            if (
                key ===
                "accent"
            ) {

                document.documentElement
                    .setAttribute(
                        "data-haldo-accent",
                        value
                    );

            }

        }


        /* Language */

        if (
            section ===
            "language" &&
            key ===
            "language"
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


        /* Voice */

        if (
            section ===
            "voice"
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
                            [key]:
                                value
                        }
                    );

                } catch (_) {}

            }

        }


        /* AI */

        if (
            section ===
            "ai"
        ) {

            const ai =
                getAI();

            if (
                ai &&
                hasMethod(
                    ai,
                    "configure"
                )
            ) {

                try {

                    ai.configure(
                        {
                            [key]:
                                value
                        }
                    );

                } catch (_) {}

            }

        }


        /* Keyboard */

        if (
            section ===
            "keyboard"
        ) {

            const keyboard =
                getKeyboard();

            if (
                keyboard &&
                hasMethod(
                    keyboard,
                    "configure"
                )
            ) {

                try {

                    keyboard.configure(
                        {
                            [key]:
                                value
                        }
                    );

                } catch (_) {}

            }

        }


        emit(
            "setting-applied",
            {

                section,

                key,

                value

            }
        );

    }


    function applyAllSettings() {

        if (!state.settings) {

            return;

        }


        Object.keys(
            state.settings
        ).forEach(
            section => {

                const values =
                    state.settings[
                        section
                    ];

                if (
                    values &&
                    typeof values ===
                    "object"
                ) {

                    Object.keys(
                        values
                    ).forEach(
                        key => {

                            applySetting(
                                section,
                                key,
                                values[key]
                            );

                        }
                    );

                }

            }
        );

    }


    function applyTheme(
        theme
    ) {

        const html =
            document.documentElement;


        let actual =
            theme;


        if (
            theme ===
            "system"
        ) {

            actual =
                window.matchMedia &&
                window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches
                    ? "dark"
                    : "light";

        }


        html.setAttribute(
            "data-haldo-theme",
            actual
        );

        html.classList.toggle(
            "haldo-dark",
            actual ===
            "dark"
        );

        html.classList.toggle(
            "haldo-light",
            actual ===
            "light"
        );

    }


    /* ========================================================
       11 — SECTIONS
       ======================================================== */

    const SECTIONS = [

        {
            id:
                "general",

            icon:
                "⚙",

            title:
                "Allgemein",

            description:
                "Grundlegende Einstellungen von HalDo AI OS"

        },

        {
            id:
                "appearance",

            icon:
                "◐",

            title:
                "Erscheinungsbild",

            description:
                "Darstellung, Theme und Oberfläche"

        },

        {
            id:
                "language",

            icon:
                "文",

            title:
                "Sprache",

            description:
                "System-, App- und Tastatursprachen"

        },

        {
            id:
                "ai",

            icon:
                "✦",

            title:
                "HalDo AI",

            description:
                "KI-Assistent, Speicher und Vorschläge"

        },

        {
            id:
                "voice",

            icon:
                "◉",

            title:
                "Sprache & Stimme",

            description:
                "Sprachausgabe und Sprachsteuerung"

        },

        {
            id:
                "keyboard",

            icon:
                "⌨",

            title:
                "Tastatur",

            description:
                "Tastaturlayout und Eingabe"

        },

        {
            id:
                "apps",

            icon:
                "▦",

            title:
                "Apps",

            description:
                "Installierte Apps verwalten"

        },

        {
            id:
                "privacy",

            icon:
                "◈",

            title:
                "Datenschutz",

            description:
                "Verlauf, Personalisierung und Daten"

        },

        {
            id:
                "storage",

            icon:
                "▤",

            title:
                "Speicher",

            description:
                "Speicher und gespeicherte Daten"

        },

        {
            id:
                "system",

            icon:
                "◇",

            title:
                "System",

            description:
                "Systeminformationen und Status"

        },

        {
            id:
                "diagnostics",

            icon:
                "⌁",

            title:
                "Diagnose",

            description:
                "Verbindungen und Systemprüfung"

        }

    ];


    /* ========================================================
       12 — CSS
       ======================================================== */

    function ensureStyles() {

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

            .haldo-settings-app {
                display:flex;
                width:100%;
                height:100%;
                min-height:520px;
                overflow:hidden;
                font-family:
                    Inter,
                    system-ui,
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    sans-serif;
                background:
                    var(--haldo-settings-bg,#0d1117);
                color:
                    var(--haldo-settings-text,#f5f7fa);
            }

            .haldo-settings-sidebar {
                width:280px;
                min-width:280px;
                overflow:auto;
                padding:20px 14px;
                background:
                    rgba(255,255,255,.045);
                border-right:
                    1px solid rgba(255,255,255,.09);
            }

            .haldo-settings-brand {
                display:flex;
                align-items:center;
                gap:12px;
                padding:8px 10px 22px;
            }

            .haldo-settings-brand-icon {
                width:42px;
                height:42px;
                display:flex;
                align-items:center;
                justify-content:center;
                border-radius:13px;
                background:
                    linear-gradient(
                        135deg,
                        #147eff,
                        #9d4edd
                    );
                box-shadow:
                    0 8px 28px rgba(20,126,255,.3);
                font-weight:800;
            }

            .haldo-settings-brand-title {
                font-size:18px;
                font-weight:750;
            }

            .haldo-settings-brand-subtitle {
                opacity:.55;
                font-size:11px;
                margin-top:3px;
            }

            .haldo-settings-search {
                width:100%;
                box-sizing:border-box;
                border:1px solid rgba(255,255,255,.1);
                border-radius:12px;
                background:rgba(255,255,255,.055);
                color:inherit;
                padding:11px 13px;
                outline:none;
                margin-bottom:14px;
            }

            .haldo-settings-nav {
                display:flex;
                flex-direction:column;
                gap:4px;
            }

            .haldo-settings-nav button {
                width:100%;
                border:0;
                color:inherit;
                background:transparent;
                border-radius:11px;
                padding:11px;
                display:flex;
                align-items:center;
                gap:11px;
                text-align:left;
                cursor:pointer;
                transition:.18s ease;
            }

            .haldo-settings-nav button:hover {
                background:rgba(255,255,255,.07);
            }

            .haldo-settings-nav button.active {
                background:
                    linear-gradient(
                        90deg,
                        rgba(20,126,255,.23),
                        rgba(157,78,221,.14)
                    );
                box-shadow:
                    inset 3px 0 0 #4da3ff;
            }

            .haldo-settings-nav-icon {
                width:25px;
                text-align:center;
                font-size:17px;
            }

            .haldo-settings-nav-text {
                flex:1;
            }

            .haldo-settings-nav-title {
                font-weight:650;
                font-size:13px;
            }

            .haldo-settings-nav-description {
                opacity:.48;
                font-size:10px;
                margin-top:2px;
            }

            .haldo-settings-main {
                flex:1;
                min-width:0;
                overflow:auto;
                padding:28px;
            }

            .haldo-settings-header {
                margin-bottom:24px;
            }

            .haldo-settings-header h1 {
                margin:0;
                font-size:30px;
                letter-spacing:-.7px;
            }

            .haldo-settings-header p {
                margin:7px 0 0;
                opacity:.58;
            }

            .haldo-settings-card {
                border:
                    1px solid rgba(255,255,255,.09);
                background:
                    rgba(255,255,255,.045);
                border-radius:16px;
                padding:5px 18px;
                margin-bottom:15px;
                overflow:hidden;
            }

            .haldo-settings-row {
                min-height:64px;
                display:flex;
                align-items:center;
                gap:18px;
                border-bottom:
                    1px solid rgba(255,255,255,.065);
            }

            .haldo-settings-row:last-child {
                border-bottom:0;
            }

            .haldo-settings-row-content {
                flex:1;
                min-width:0;
            }

            .haldo-settings-row-title {
                font-weight:650;
                font-size:14px;
            }

            .haldo-settings-row-description {
                margin-top:4px;
                font-size:11px;
                opacity:.5;
                line-height:1.4;
            }

            .haldo-settings-control {
                flex-shrink:0;
            }

            .haldo-settings-control select,
            .haldo-settings-control input[type="text"],
            .haldo-settings-control input[type="number"] {
                border:
                    1px solid rgba(255,255,255,.12);
                background:
                    rgba(0,0,0,.18);
                color:inherit;
                border-radius:9px;
                padding:9px 11px;
                outline:none;
            }

            .haldo-settings-toggle {
                width:45px;
                height:25px;
                border-radius:20px;
                border:0;
                padding:2px;
                cursor:pointer;
                background:
                    rgba(255,255,255,.18);
                transition:.2s;
            }

            .haldo-settings-toggle span {
                display:block;
                width:21px;
                height:21px;
                border-radius:50%;
                background:white;
                transition:.2s;
            }

            .haldo-settings-toggle.active {
                background:#197cff;
            }

            .haldo-settings-toggle.active span {
                transform:translateX(20px);
            }

            .haldo-settings-button {
                border:0;
                border-radius:10px;
                padding:9px 14px;
                cursor:pointer;
                color:white;
                background:#197cff;
            }

            .haldo-settings-button.secondary {
                background:
                    rgba(255,255,255,.09);
            }

            .haldo-settings-button.danger {
                background:#b3261e;
            }

            .haldo-settings-empty {
                padding:35px;
                text-align:center;
                opacity:.5;
            }

            .haldo-settings-status {
                display:flex;
                align-items:center;
                gap:8px;
                font-size:11px;
                opacity:.6;
                margin-top:18px;
            }

            .haldo-settings-status-dot {
                width:8px;
                height:8px;
                border-radius:50%;
                background:#32d583;
            }

            @media(max-width:800px) {

                .haldo-settings-sidebar {
                    width:220px;
                    min-width:220px;
                }

                .haldo-settings-main {
                    padding:20px;
                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* ========================================================
       13 — UI HELPERS
       ======================================================== */

    function toggle(
        section,
        key,
        title,
        description
    ) {

        const value =
            !!getValue(
                section,
                key
            );


        return `

            <div class="haldo-settings-row">

                <div class="haldo-settings-row-content">

                    <div class="haldo-settings-row-title">
                        ${escapeHTML(title)}
                    </div>

                    <div class="haldo-settings-row-description">
                        ${escapeHTML(description)}
                    </div>

                </div>

                <div class="haldo-settings-control">

                    <button
                        class="haldo-settings-toggle ${value ? "active" : ""}"
                        data-setting-toggle="${section}.${key}"
                        aria-label="${escapeHTML(title)}"
                    >
                        <span></span>
                    </button>

                </div>

            </div>

        `;

    }


    function select(
        section,
        key,
        title,
        description,
        options
    ) {

        const value =
            getValue(
                section,
                key
            );


        return `

            <div class="haldo-settings-row">

                <div class="haldo-settings-row-content">

                    <div class="haldo-settings-row-title">
                        ${escapeHTML(title)}
                    </div>

                    <div class="haldo-settings-row-description">
                        ${escapeHTML(description)}
                    </div>

                </div>

                <div class="haldo-settings-control">

                    <select
                        data-setting-select="${section}.${key}"
                    >

                        ${options.map(
                            option => `

                                <option
                                    value="${escapeHTML(option.value)}"
                                    ${value === option.value ? "selected" : ""}
                                >
                                    ${escapeHTML(option.label)}
                                </option>

                            `
                        ).join("")}

                    </select>

                </div>

            </div>

        `;

    }


    function textInput(
        section,
        key,
        title,
        description
    ) {

        const value =
            getValue(
                section,
                key
            );


        return `

            <div class="haldo-settings-row">

                <div class="haldo-settings-row-content">

                    <div class="haldo-settings-row-title">
                        ${escapeHTML(title)}
                    </div>

                    <div class="haldo-settings-row-description">
                        ${escapeHTML(description)}
                    </div>

                </div>

                <div class="haldo-settings-control">

                    <input
                        type="text"
                        value="${escapeHTML(value)}"
                        data-setting-input="${section}.${key}"
                    >

                </div>

            </div>

        `;

    }


    function card(
        content
    ) {

        return `

            <div class="haldo-settings-card">

                ${content}

            </div>

        `;

    }


    /* ========================================================
       14 — SECTION CONTENT
       ======================================================== */

    function renderSection() {

        const section =
            state.activeSection;


        switch (section) {

            case "general":

                return renderGeneral();

            case "appearance":

                return renderAppearance();

            case "language":

                return renderLanguage();

            case "ai":

                return renderAI();

            case "voice":

                return renderVoice();

            case "keyboard":

                return renderKeyboard();

            case "apps":

                return renderApps();

            case "privacy":

                return renderPrivacy();

            case "storage":

                return renderStorage();

            case "system":

                return renderSystem();

            case "diagnostics":

                return renderDiagnostics();

            default:

                return renderGeneral();

        }

    }


    function renderGeneral() {

        return [

            card(

                toggle(
                    "general",
                    "animations",
                    "Animationen",
                    "Flüssige Übergänge und OS-Animationen aktivieren."
                ) +

                toggle(
                    "general",
                    "sounds",
                    "Systemtöne",
                    "Akustische Rückmeldungen von HalDo AI OS."
                ) +

                toggle(
                    "general",
                    "notifications",
                    "Benachrichtigungen",
                    "System- und App-Benachrichtigungen anzeigen."
                ) +

                toggle(
                    "general",
                    "confirmBeforeDelete",
                    "Löschen bestätigen",
                    "Vor dem endgültigen Löschen eine Bestätigung anzeigen."
                )

            ),

            card(`

                <div class="haldo-settings-row">

                    <div class="haldo-settings-row-content">

                        <div class="haldo-settings-row-title">
                            Einstellungen zurücksetzen
                        </div>

                        <div class="haldo-settings-row-description">
                            Alle Einstellungen dieser App auf die Standardwerte zurücksetzen.
                        </div>

                    </div>

                    <div class="haldo-settings-control">

                        <button
                            class="haldo-settings-button danger"
                            data-action="reset"
                        >
                            Zurücksetzen
                        </button>

                    </div>

                </div>

            `)

        ].join("");

    }


    function renderAppearance() {

        return card(

            select(
                "appearance",
                "theme",
                "Theme",
                "Helles, dunkles oder automatisch angepasstes Erscheinungsbild.",
                [
                    {
                        value:"system",
                        label:"System"
                    },
                    {
                        value:"light",
                        label:"Hell"
                    },
                    {
                        value:"dark",
                        label:"Dunkel"
                    }
                ]
            ) +

            select(
                "appearance",
                "accent",
                "Akzentfarbe",
                "Die bevorzugte HalDo-Akzentfarbe.",
                [
                    {
                        value:"haldo",
                        label:"HalDo"
                    },
                    {
                        value:"blue",
                        label:"Blau"
                    },
                    {
                        value:"purple",
                        label:"Violett"
                    },
                    {
                        value:"green",
                        label:"Grün"
                    }
                ]
            ) +

            toggle(
                "appearance",
                "transparency",
                "Transparenz",
                "Transparente Oberflächen und Fenster verwenden."
            ) +

            toggle(
                "appearance",
                "roundedWindows",
                "Abgerundete Fenster",
                "Moderne abgerundete Fenstergestaltung verwenden."
            ) +

            toggle(
                "appearance",
                "compactMode",
                "Kompakter Modus",
                "Mehr Inhalte auf kleinerem Bildschirm darstellen."
            )

        );

    }


    function renderLanguage() {

        return card(

            select(
                "language",
                "language",
                "Systemsprache",
                "Die Sprache der HalDo AI OS Oberfläche.",
                [
                    {
                        value:"de",
                        label:"Deutsch"
                    },
                    {
                        value:"en",
                        label:"English"
                    },
                    {
                        value:"ku",
                        label:"Kurdî"
                    },
                    {
                        value:"ar",
                        label:"العربية"
                    },
                    {
                        value:"tr",
                        label:"Türkçe"
                    },
                    {
                        value:"ez",
                        label:"Êzîdî"
                    },
                    {
                        value:"fr",
                        label:"Français"
                    },
                    {
                        value:"es",
                        label:"Español"
                    }
                ]
            ) +

            select(
                "language",
                "keyboardLanguage",
                "Tastatursprache",
                "Bevorzugtes Tastaturlayout für die Eingabe.",
                [
                    {
                        value:"ezidi",
                        label:"Êzîdî"
                    },
                    {
                        value:"de",
                        label:"Deutsch"
                    },
                    {
                        value:"en",
                        label:"English"
                    },
                    {
                        value:"tr",
                        label:"Türkçe"
                    },
                    {
                        value:"ar",
                        label:"العربية"
                    }
                ]
            )

        );

    }


    function renderAI() {

        return [

            card(

                toggle(
                    "ai",
                    "enabled",
                    "HalDo AI aktivieren",
                    "Die integrierten KI-Funktionen des Betriebssystems verwenden."
                ) +

                textInput(
                    "ai",
                    "assistantName",
                    "Name des Assistenten",
                    "Der Anzeigename des HalDo AI-Assistenten."
                ) +

                toggle(
                    "ai",
                    "memory",
                    "AI Memory",
                    "Erlaubt der AI, freigegebene Gesprächs- und App-Kontexte zu speichern."
                ) +

                toggle(
                    "ai",
                    "suggestions",
                    "AI-Vorschläge",
                    "Kontextbezogene Vorschläge innerhalb des Systems anzeigen."
                ) +

                toggle(
                    "ai",
                    "voiceReplies",
                    "AI-Sprachantworten",
                    "Antworten der AI können gesprochen werden."
                )

            )

        ].join("");

    }


    function renderVoice() {

        return card(

            toggle(
                "voice",
                "enabled",
                "Sprachfunktionen",
                "Sprachsteuerung und Sprachausgabe aktivieren."
            ) +

            toggle(
                "voice",
                "autoSpeak",
                "Automatische Sprachausgabe",
                "Antworten automatisch vorlesen."
            ) +

            select(
                "voice",
                "rate",
                "Sprechgeschwindigkeit",
                "Geschwindigkeit der Sprachausgabe.",
                [
                    {
                        value:0.75,
                        label:"Langsam"
                    },
                    {
                        value:1,
                        label:"Normal"
                    },
                    {
                        value:1.25,
                        label:"Schnell"
                    },
                    {
                        value:1.5,
                        label:"Sehr schnell"
                    }
                ]
            ) +

            select(
                "voice",
                "pitch",
                "Stimmhöhe",
                "Grundlegende Tonhöhe der Stimme.",
                [
                    {
                        value:0.8,
                        label:"Tief"
                    },
                    {
                        value:1,
                        label:"Normal"
                    },
                    {
                        value:1.2,
                        label:"Hoch"
                    }
                ]
            )

        );

    }


    function renderKeyboard() {

        return card(

            toggle(
                "keyboard",
                "enabled",
                "HalDo-Tastatur",
                "Die integrierte HalDo-Tastatur verwenden."
            ) +

            select(
                "keyboard",
                "layout",
                "Layout",
                "Bevorzugtes Tastaturlayout.",
                [
                    {
                        value:"ezidi",
                        label:"Êzîdî"
                    },
                    {
                        value:"de",
                        label:"Deutsch"
                    },
                    {
                        value:"en",
                        label:"English"
                    },
                    {
                        value:"tr",
                        label:"Türkçe"
                    },
                    {
                        value:"ar",
                        label:"العربية"
                    }
                ]
            ) +

            toggle(
                "keyboard",
                "autocorrect",
                "Autokorrektur",
                "Automatische Korrektur bei Texteingaben."
            ) +

            toggle(
                "keyboard",
                "suggestions",
                "Wortvorschläge",
                "Kontextabhängige Wortvorschläge anzeigen."
            )

        );

    }


    function renderApps() {

        const manager =
            getAppManager();

        let apps = [];


        if (
            manager &&
            hasMethod(
                manager,
                "getAll"
            )
        ) {

            try {

                apps =
                    manager.getAll() ||
                    [];

            } catch (_) {}

        }


        if (!apps.length) {

            return `

                <div class="haldo-settings-card">

                    <div class="haldo-settings-empty">

                        Keine Apps wurden derzeit registriert.

                    </div>

                </div>

            `;

        }


        const query =
            state.search
                .toLowerCase()
                .trim();


        if (query) {

            apps =
                apps.filter(
                    app => {

                        const text =
                            [
                                app.id,
                                app.name,
                                app.title,
                                app.description
                            ]
                            .join(" ")
                            .toLowerCase();

                        return text.includes(
                            query
                        );

                    }
                );

        }


        return card(

            apps.map(
                app => `

                    <div class="haldo-settings-row">

                        <div class="haldo-settings-row-content">

                            <div class="haldo-settings-row-title">

                                ${escapeHTML(
                                    app.title ||
                                    app.name ||
                                    app.id
                                )}

                            </div>

                            <div class="haldo-settings-row-description">

                                ${escapeHTML(
                                    app.description ||
                                    app.id
                                )}

                            </div>

                        </div>

                        <div class="haldo-settings-control">

                            <button
                                class="haldo-settings-button secondary"
                                data-action="open-app"
                                data-app-id="${escapeHTML(app.id)}"
                            >
                                Öffnen
                            </button>

                        </div>

                    </div>

                `
            ).join("")

        );

    }


    function renderPrivacy() {

        return card(

            toggle(
                "privacy",
                "saveHistory",
                "Verlauf speichern",
                "App- und Gesprächsverlauf lokal speichern."
            ) +

            toggle(
                "privacy",
                "telemetry",
                "Diagnosedaten",
                "Optionale technische Diagnosedaten aktivieren."
            ) +

            toggle(
                "privacy",
                "personalizedAI",
                "Personalisierte AI",
                "Freigegebene Einstellungen zur Personalisierung verwenden."
            )

        );

    }


    function renderStorage() {

        let size =
            "Unbekannt";


        try {

            let bytes =
                0;

            for (
                let i = 0;
                i < localStorage.length;
                i++
            ) {

                const key =
                    localStorage.key(i);

                const value =
                    localStorage.getItem(
                        key
                    ) || "";

                bytes +=
                    key.length +
                    value.length;

            }


            if (
                bytes < 1024
            ) {

                size =
                    bytes +
                    " B";

            } else if (
                bytes < 1024 * 1024
            ) {

                size =
                    (
                        bytes / 1024
                    ).toFixed(1) +
                    " KB";

            } else {

                size =
                    (
                        bytes /
                        1024 /
                        1024
                    ).toFixed(2) +
                    " MB";

            }

        } catch (_) {}


        return card(`

            <div class="haldo-settings-row">

                <div class="haldo-settings-row-content">

                    <div class="haldo-settings-row-title">
                        Lokaler Speicher
                    </div>

                    <div class="haldo-settings-row-description">
                        Von HalDo AI OS verwendete Browser-Speicherdaten.
                    </div>

                </div>

                <div class="haldo-settings-control">
                    ${escapeHTML(size)}
                </div>

            </div>

            <div class="haldo-settings-row">

                <div class="haldo-settings-row-content">

                    <div class="haldo-settings-row-title">
                        Einstellungen
                    </div>

                    <div class="haldo-settings-row-description">
                        Gespeicherte Einstellungen dieser App entfernen.
                    </div>

                </div>

                <div class="haldo-settings-control">

                    <button
                        class="haldo-settings-button danger"
                        data-action="clear-settings"
                    >
                        Löschen
                    </button>

                </div>

            </div>

        `);

    }


    function renderSystem() {

        const system =
            getSystem();

        const kernel =
            getKernel();


        const systemInfo =
            system &&
            hasMethod(
                system,
                "getSystemInfo"
            )
                ? system.getSystemInfo()
                : null;


        return card(`

            <div class="haldo-settings-row">

                <div class="haldo-settings-row-content">

                    <div class="haldo-settings-row-title">
                        HalDo AI OS
                    </div>

                    <div class="haldo-settings-row-description">
                        Betriebssystem-Version
                    </div>

                </div>

                <div class="haldo-settings-control">
                    20.0.0
                </div>

            </div>

            <div class="haldo-settings-row">

                <div class="haldo-settings-row-content">

                    <div class="haldo-settings-row-title">
                        Kernel
                    </div>

                    <div class="haldo-settings-row-description">
                        Verbindung zum zentralen Kernel.
                    </div>

                </div>

                <div class="haldo-settings-control">

                    ${
                        kernel
                            ? "Verbunden"
                            : "Nicht verbunden"
                    }

                </div>

            </div>

            <div class="haldo-settings-row">

                <div class="haldo-settings-row-content">

                    <div class="haldo-settings-row-title">
                        Systemstatus
                    </div>

                    <div class="haldo-settings-row-description">
                        ${escapeHTML(
                            systemInfo
                                ? JSON.stringify(
                                    systemInfo
                                )
                                : "Systeminformationen nicht verfügbar."
                        )}
                    </div>

                </div>

            </div>

        `);

    }


    function renderDiagnostics() {

        const manager =
            getAppManager();

        const health =
            manager &&
            hasMethod(
                manager,
                "healthCheck"
            )
                ? manager.healthCheck()
                : null;


        const healthy =
            health &&
            health.healthy;


        return card(`

            <div class="haldo-settings-row">

                <div class="haldo-settings-row-content">

                    <div class="haldo-settings-row-title">
                        App Manager
                    </div>

                    <div class="haldo-settings-row-description">
                        Zentrale Verwaltung aller registrierten Apps.
                    </div>

                </div>

                <div class="haldo-settings-control">

                    ${
                        manager
                            ? "Verbunden"
                            : "Nicht verbunden"
                    }

                </div>

            </div>

            <div class="haldo-settings-row">

                <div class="haldo-settings-row-content">

                    <div class="haldo-settings-row-title">
                        Systemdiagnose
                    </div>

                    <div class="haldo-settings-row-description">

                        ${
                            health
                                ? (
                                    health.problems &&
                                    health.problems.length
                                        ? health.problems.join(
                                            " • "
                                        )
                                        : "Alle geprüften Kernverbindungen sind verfügbar."
                                )
                                : "Diagnose nicht verfügbar."
                        }

                    </div>

                </div>

                <div class="haldo-settings-control">

                    <button
                        class="haldo-settings-button"
                        data-action="diagnostics"
                    >
                        Prüfen
                    </button>

                </div>

            </div>

            <div class="haldo-settings-status">

                <span class="haldo-settings-status-dot"></span>

                ${
                    healthy === false
                        ? "Systemprüfung meldet Probleme."
                        : "Systemdiagnose bereit."
                }

            </div>

        `);

    }


    /* ========================================================
       15 — MAIN RENDER
       ======================================================== */

    function render() {

        if (!state.root) {

            return;

        }


        const current =
            SECTIONS.find(
                section =>
                    section.id ===
                    state.activeSection
            ) ||
            SECTIONS[0];


        state.root.innerHTML = `

            <div class="haldo-settings-app">

                <aside class="haldo-settings-sidebar">

                    <div class="haldo-settings-brand">

                        <div class="haldo-settings-brand-icon">
                            H
                        </div>

                        <div>

                            <div class="haldo-settings-brand-title">
                                Einstellungen
                            </div>

                            <div class="haldo-settings-brand-subtitle">
                                HalDo AI OS 20
                            </div>

                        </div>

                    </div>


                    <input
                        class="haldo-settings-search"
                        type="search"
                        placeholder="Einstellungen suchen..."
                        value="${escapeHTML(
                            state.search
                        )}"
                        data-action="search"
                    >


                    <nav class="haldo-settings-nav">

                        ${
                            SECTIONS
                            .filter(
                                section => {

                                    if (
                                        !state.search
                                    ) {

                                        return true;

                                    }

                                    const query =
                                        state.search
                                        .toLowerCase();

                                    return (
                                        section.title
                                            .toLowerCase()
                                            .includes(
                                                query
                                            ) ||
                                        section.description
                                            .toLowerCase()
                                            .includes(
                                                query
                                            )
                                    );

                                }
                            )
                            .map(
                                section => `

                                    <button
                                        class="${
                                            section.id ===
                                            state.activeSection
                                                ? "active"
                                                : ""
                                        }"
                                        data-section="${section.id}"
                                    >

                                        <span class="haldo-settings-nav-icon">
                                            ${section.icon}
                                        </span>

                                        <span class="haldo-settings-nav-text">

                                            <span class="haldo-settings-nav-title">
                                                ${escapeHTML(
                                                    section.title
                                                )}
                                            </span>

                                            <span class="haldo-settings-nav-description">
                                                ${escapeHTML(
                                                    section.description
                                                )}
                                            </span>

                                        </span>

                                    </button>

                                `
                            )
                            .join("")
                        }

                    </nav>

                </aside>


                <main class="haldo-settings-main">

                    <header class="haldo-settings-header">

                        <h1>
                            ${escapeHTML(
                                current.title
                            )}
                        </h1>

                        <p>
                            ${escapeHTML(
                                current.description
                            )}
                        </p>

                    </header>


                    <section>

                        ${
                            renderSection()
                        }

                    </section>

                </main>

            </div>

        `;


        bindEvents();

    }


    /* ========================================================
       16 — EVENTS / UI
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
                        () => {

                            state.activeSection =
                                button.dataset.section;

                            render();

                            emit(
                                "section-changed",
                                {
                                    section:
                                        state.activeSection
                                }
                            );

                        }
                    );

                }
            );


        const search =
            state.root.querySelector(
                "[data-action='search']"
            );


        if (search) {

            search.addEventListener(
                "input",
                event => {

                    state.search =
                        event.target.value;

                    render();

                }
            );

        }


        state.root
            .querySelectorAll(
                "[data-setting-toggle]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const parts =
                                button
                                    .dataset
                                    .settingToggle
                                    .split(
                                        "."
                                    );

                            if (
                                parts.length !==
                                2
                            ) {

                                return;

                            }


                            const [
                                section,
                                key
                            ] = parts;


                            setValue(
                                section,
                                key,
                                !getValue(
                                    section,
                                    key
                                )
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
                        event => {

                            const parts =
                                select
                                    .dataset
                                    .settingSelect
                                    .split(
                                        "."
                                    );

                            if (
                                parts.length !==
                                2
                            ) {

                                return;

                            }


                            setValue(
                                parts[0],
                                parts[1],
                                event.target.value
                            );

                        }
                    );

                }
            );


        state.root
            .querySelectorAll(
                "[data-setting-input]"
            )
            .forEach(
                input => {

                    input.addEventListener(
                        "change",
                        event => {

                            const parts =
                                input
                                    .dataset
                                    .settingInput
                                    .split(
                                        "."
                                    );

                            if (
                                parts.length !==
                                2
                            ) {

                                return;

                            }


                            setValue(
                                parts[0],
                                parts[1],
                                event.target.value
                            );

                        }
                    );

                }
            );


        const reset =
            state.root.querySelector(
                "[data-action='reset']"
            );


        if (reset) {

            reset.addEventListener(
                "click",
                async () => {

                    const confirmed =
                        window.confirm(
                            "Alle Einstellungen dieser App zurücksetzen?"
                        );

                    if (!confirmed) {

                        return;

                    }


                    await resetSettings();

                }
            );

        }


        const clear =
            state.root.querySelector(
                "[data-action='clear-settings']"
            );


        if (clear) {

            clear.addEventListener(
                "click",
                async () => {

                    const confirmed =
                        window.confirm(
                            "Gespeicherte Einstellungen löschen?"
                        );

                    if (!confirmed) {

                        return;

                    }


                    await resetSettings();

                }
            );

        }


        state.root
            .querySelectorAll(
                "[data-action='open-app']"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const appId =
                                button.dataset.appId;

                            const manager =
                                getAppManager();

                            if (
                                manager &&
                                hasMethod(
                                    manager,
                                    "open"
                                )
                            ) {

                                manager.open(
                                    appId
                                );

                            }

                        }
                    );

                }
            );


        const diagnosticButton =
            state.root.querySelector(
                "[data-action='diagnostics']"
            );


        if (diagnosticButton) {

            diagnosticButton.addEventListener(
                "click",
                () => {

                    render();

                    emit(
                        "diagnostics-requested"
                    );

                }
            );

        }

    }


    /* ========================================================
       17 — RESET
       ======================================================== */

    async function resetSettings() {

        state.settings =
            clone(
                DEFAULT_SETTINGS
            );

        state.dirty =
            true;


        state.statistics.resets +=
            1;


        applyAllSettings();

        await saveSettings();

        render();


        emit(
            "reset",
            {
                settings:
                    clone(
                        state.settings
                    )
            }
        );


        return true;

    }


    /* ========================================================
       18 — MOUNT
       ======================================================== */

    async function mount(
        container
    ) {

        if (!container) {

            return false;

        }


        ensureStyles();

        await loadSettings();

        applyAllSettings();


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


    /* ========================================================
       19 — UNMOUNT
       ======================================================== */

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
       20 — OPEN
       ======================================================== */

    async function open(
        options = {}
    ) {

        state.openedAt =
            Date.now();

        state.statistics.opens +=
            1;


        if (
            options.container
        ) {

            await mount(
                options.container
            );

        }


        emit(
            "opened",
            {
                options
            }
        );


        return {

            ok:
                true,

            appId:
                APP_ID,

            state:
                getState()

        };

    }


    /* ========================================================
       21 — CLOSE
       ======================================================== */

    async function close(
        options = {}
    ) {

        if (
            state.dirty
        ) {

            await saveSettings();

        }


        emit(
            "closed",
            {
                options
            }
        );


        return true;

    }


    /* ========================================================
       22 — ACTIVATE
       ======================================================== */

    async function activate() {

        emit(
            "activated",
            {
                appId:
                    APP_ID
            }
        );


        return true;

    }


    /* ========================================================
       23 — DEACTIVATE
       ======================================================== */

    async function deactivate() {

        emit(
            "deactivated",
            {
                appId:
                    APP_ID
            }
        );


        return true;

    }


    /* ========================================================
       24 — APP CONTEXT
       ======================================================== */

    function createContext() {

        return {

            appId:
                APP_ID,

            version:
                VERSION,

            getSettings() {

                return clone(
                    state.settings
                );

            },

            get(
                section,
                key
            ) {

                return getValue(
                    section,
                    key
                );

            },

            set(
                section,
                key,
                value
            ) {

                return setValue(
                    section,
                    key,
                    value
                );

            },

            save:
                saveSettings,

            reset:
                resetSettings,

            mount,

            unmount,

            open,

            close,

            activate,

            deactivate,

            on,

            off,

            emit

        };

    }


    /* ========================================================
       25 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        return {

            appId:
                APP_ID,

            name:
                APP_NAME,

            version:
                VERSION,

            initialized:
                state.initialized,

            mounted:
                state.mounted,

            activeSection:
                state.activeSection,

            dirty:
                state.dirty,

            openedAt:
                state.openedAt,

            connections: {

                kernel:
                    !!getKernel(),

                system:
                    !!getSystem(),

                appManager:
                    !!getAppManager(),

                router:
                    !!getRouter(),

                windowManager:
                    !!getWindowManager(),

                language:
                    !!getLanguage(),

                ai:
                    !!getAI(),

                voice:
                    !!getVoice(),

                keyboard:
                    !!getKeyboard(),

                storage:
                    !!getStorage()

            },

            statistics:
                {
                    ...state.statistics
                },

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       26 — APP DEFINITION
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
            "Zentrale Einstellungen von HalDo AI OS 20.",

        version:
            VERSION,

        icon:
            "⚙",

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

            "system.diagnostics"

        ],

        dependencies: [],


        init:
            async function (
                context
            ) {

                if (
                    state.initialized
                ) {

                    return true;

                }


                await loadSettings();

                applyAllSettings();


                state.initialized =
                    true;


                emit(
                    "initialized",
                    {
                        context
                    }
                );


                return true;

            },


        start:
            async function () {

                return true;

            },


        open:
            async function (
                context
            ) {

                return open(
                    context || {}
                );

            },


        close:
            async function (
                context
            ) {

                return close(
                    context || {}
                );

            },


        activate:
            async function () {

                return activate();

            },


        deactivate:
            async function () {

                return deactivate();

            }

    };


    /* ========================================================
       27 — PUBLIC API
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
            APP_NAME,

        version:
            VERSION,

        icon:
            "⚙",

        category:
            "system",

        definition,

        state,

        DEFAULT_SETTINGS,

        SECTIONS,

        on,

        off,

        emit,

        init:
            definition.init,

        start:
            definition.start,

        open,

        close,

        activate,

        deactivate,

        mount,

        unmount,

        render,

        getValue,

        setValue,

        getSettings() {

            return clone(
                state.settings
            );

        },

        setSettings(
            values
        ) {

            state.settings =
                deepMerge(
                    state.settings ||
                    DEFAULT_SETTINGS,
                    values ||
                    {}
                );

            state.dirty =
                true;

            applyAllSettings();

            saveSettings();

            render();

            return clone(
                state.settings
            );

        },

        save:
            saveSettings,

        reset:
            resetSettings,

        createContext,

        diagnostics,

        getState() {

            return {

                initialized:
                    state.initialized,

                mounted:
                    state.mounted,

                activeSection:
                    state.activeSection,

                dirty:
                    state.dirty

            };

        }

    };


    /* ========================================================
       28 — GLOBAL REGISTRATION
       ======================================================== */

    window.HalDoSettings =
        api;

    window.HalDoSettingsApp =
        api;

    HalDoOS.settings =
        api;

    HalDoOS.settingsApp =
        api;


    /* ========================================================
       29 — APP MANAGER REGISTRATION
       ======================================================== */

    function registerWithManager() {

        const manager =
            getAppManager();


        if (
            !manager ||
            !hasMethod(
                manager,
                "register"
            )
        ) {

            return false;

        }


        try {

            manager.register(
                definition
            );


            return true;

        } catch (error) {

            console.error(
                "[HalDo Settings] Registration failed:",
                error
            );


            return false;

        }

    }


    /* ========================================================
       30 — KERNEL REGISTRATION
       ======================================================== */

    function registerWithKernel() {

        const kernel =
            getKernel();


        if (!kernel) {

            return false;

        }


        try {

            if (
                hasMethod(
                    kernel,
                    "registerModule"
                )
            ) {

                kernel.registerModule(
                    "settings",
                    api
                );

            }


            if (
                hasMethod(
                    kernel,
                    "setModuleReady"
                )
            ) {

                kernel.setModuleReady(
                    "settings",
                    true
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
       31 — BOOT
       ======================================================== */

    async function boot() {

        try {

            await init();

            registerWithKernel();

            registerWithManager();


            emit(
                "ready",
                {
                    app:
                        definition
                }
            );


            console.log(
                "[HalDo Settings] HalDo AI OS 20 Einstellungen bereit."
            );


        } catch (error) {

            state.statistics.errors +=
                1;

            console.error(
                "[HalDo Settings] Boot error:",
                error
            );

        }

    }


    /* ========================================================
       32 — DOM
       ======================================================== */

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
       END
       HALDO AI OS 20
       SETTINGS APP
       ============================================================ */

})(window, document);