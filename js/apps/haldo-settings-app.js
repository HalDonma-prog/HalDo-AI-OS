/* ============================================================
   HALDO AI OS 20
   SETTINGS APP
   ------------------------------------------------------------
   Datei:
       js/apps/haldo-settings-app.js

   APP:
       HalDo Einstellungen

   VERSION:
       20.0.0

   ------------------------------------------------------------
   VERBINDUNGEN
   ------------------------------------------------------------

   HalDoOS
   HalDoKernel
   HalDoSystem
   HalDoAppManager
   HalDoAppRegistry
   HalDoStorage
   HalDoLanguageManager
   HalDoVoice
   HalDoKeyboard / HalDoEzidiKeyboard

   ------------------------------------------------------------
   FUNKTIONEN
   ------------------------------------------------------------

   - App Lifecycle
   - eigene Oberfläche
   - Navigation
   - Suche
   - Kategorien
   - Einstellungen
   - Persistenz
   - Events
   - Reset
   - Diagnose
   - Home-Verbindung
   - responsive UI

   ============================================================ */

(function (window, document) {

    "use strict";

    /* ========================================================
       01 — FOUNDATION
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;

    const APP_ID =
        "haldo-settings";

    const VERSION =
        "20.0.0";

    const APP_NAME =
        "HalDo Einstellungen";


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
            window.HalDoOSAppManager ||
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


    function getKeyboard() {

        return (
            window.HalDoEzidiKeyboard ||
            window.HalDoKeyboard ||
            HalDoOS.keyboard ||
            null
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

        opened:
            false,

        active:
            false,

        minimized:
            false,

        currentSection:
            "general",

        search:
            "",

        settings: {

            general: {

                animations:
                    true,

                sounds:
                    true,

                autoStart:
                    true

            },

            appearance: {

                theme:
                    "system",

                transparency:
                    true,

                glow:
                    true,

                compactMode:
                    false

            },

            language: {

                interface:
                    "de",

                ai:
                    "de",

                ezidiKeyboard:
                    true

            },

            ai: {

                enabled:
                    true,

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

                volume:
                    80

            },

            keyboard: {

                enabled:
                    true,

                ezidi:
                    true,

                enterToSend:
                    true

            },

            notifications: {

                enabled:
                    true,

                sounds:
                    true,

                desktop:
                    true

            },

            privacy: {

                saveHistory:
                    true,

                diagnostics:
                    true

            }

        },

        listeners:
            new Map()

    };


    /* ========================================================
       04 — UTILITIES
       ======================================================== */

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


    function clone(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }

        if (
            Array.isArray(value)
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
                    "settings:" + event,
                    detail
                );

            } catch (_) {}

        }

    }


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
            !state.listeners.has(
                event
            )
        ) {

            state.listeners.set(
                event,
                new Set()
            );

        }

        state.listeners
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


    /* ========================================================
       05 — STORAGE
       ======================================================== */

    const STORAGE_KEY =
        "haldo.os20.settings.app";


    function save() {

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

                    result.catch(
                        error =>
                            console.error(
                                "[HalDo Settings]",
                                error
                            )
                    );

                }

            } else {

                window.localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(
                        data
                    )
                );

            }

            emit(
                "saved",
                {
                    settings:
                        data
                }
            );

            return true;

        } catch (error) {

            console.error(
                "[HalDo Settings] Save failed:",
                error
            );

            return false;

        }

    }


    async function load() {

        const storage =
            getStorage();


        try {

            let result;


            if (
                storage &&
                hasMethod(
                    storage,
                    "get"
                )
            ) {

                result =
                    storage.get(
                        STORAGE_KEY
                    );

                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    result =
                        await result;

                }

            } else {

                const raw =
                    window.localStorage.getItem(
                        STORAGE_KEY
                    );

                result =
                    raw
                        ? JSON.parse(raw)
                        : null;

            }


            if (
                result &&
                typeof result ===
                "object"
            ) {

                mergeSettings(
                    result
                );

            }

        } catch (error) {

            console.warn(
                "[HalDo Settings] Load failed:",
                error
            );

        }

    }


    function mergeSettings(
        incoming
    ) {

        Object.keys(
            incoming
        ).forEach(
            section => {

                if (
                    state.settings[
                        section
                    ] &&
                    typeof incoming[
                        section
                    ] ===
                    "object"
                ) {

                    Object.assign(
                        state.settings[
                            section
                        ],
                        incoming[
                            section
                        ]
                    );

                }

            }
        );

    }


    /* ========================================================
       06 — SECTIONS
       ======================================================== */

    const sections = [

        {
            id:
                "general",

            title:
                "Allgemein",

            icon:
                "⚙",

            description:
                "Grundlegende Einstellungen von HalDo AI OS."
        },

        {
            id:
                "appearance",

            title:
                "Darstellung",

            icon:
                "◐",

            description:
                "Aussehen, Transparenz und Animationen."
        },

        {
            id:
                "language",

            title:
                "Sprache",

            icon:
                "文",

            description:
                "System-, AI- und Tastatursprachen."
        },

        {
            id:
                "ai",

            title:
                "HalDo AI",

            icon:
                "✦",

            description:
                "AI-Verhalten und intelligente Funktionen."
        },

        {
            id:
                "voice",

            title:
                "Stimme",

            icon:
                "◉",

            description:
                "Sprachwiedergabe und Sprachfunktionen."
        },

        {
            id:
                "keyboard",

            title:
                "Tastatur",

            icon:
                "⌨",

            description:
                "Tastatur und Êzîdî-Unterstützung."
        },

        {
            id:
                "notifications",

            title:
                "Benachrichtigungen",

            icon:
                "♢",

            description:
                "Benachrichtigungen und Sounds."
        },

        {
            id:
                "privacy",

            title:
                "Datenschutz",

            icon:
                "◇",

            description:
                "Speicherung und Diagnose."
        },

        {
            id:
                "system",

            title:
                "System",

            icon:
                "▣",

            description:
                "Systeminformationen und Diagnose."
        }

    ];


    /* ========================================================
       07 — DOM
       ======================================================== */

    let root =
        null;


    function createRoot() {

        if (root) {

            return root;

        }


        root =
            document.createElement(
                "section"
            );


        root.id =
            "haldo-settings-app";


        root.className =
            "haldo-settings-app";


        document.body.appendChild(
            root
        );


        injectStyles();


        return root;

    }


    /* ========================================================
       08 — STYLES
       ======================================================== */

    function injectStyles() {

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

            #haldo-settings-app {

                position: fixed;

                inset:
                    0;

                z-index:
                    10000;

                display:
                    none;

                background:
                    radial-gradient(
                        circle at top right,
                        rgba(60,120,255,.18),
                        transparent 38%
                    ),
                    radial-gradient(
                        circle at bottom left,
                        rgba(120,50,255,.15),
                        transparent 35%
                    ),
                    #080b13;

                color:
                    #f5f7ff;

                font-family:
                    Inter,
                    system-ui,
                    -apple-system,
                    BlinkMacSystemFont,
                    sans-serif;

            }


            #haldo-settings-app.is-open {

                display:
                    flex;

            }


            .haldo-settings-shell {

                width:
                    100%;

                height:
                    100%;

                display:
                    grid;

                grid-template-columns:
                    290px
                    1fr;

                overflow:
                    hidden;

            }


            .haldo-settings-sidebar {

                padding:
                    26px 18px;

                background:
                    rgba(12,16,27,.88);

                border-right:
                    1px solid
                    rgba(255,255,255,.08);

                overflow-y:
                    auto;

                backdrop-filter:
                    blur(25px);

            }


            .haldo-settings-brand {

                display:
                    flex;

                align-items:
                    center;

                gap:
                    12px;

                padding:
                    10px;

                margin-bottom:
                    22px;

            }


            .haldo-settings-brand-logo {

                width:
                    44px;

                height:
                    44px;

                border-radius:
                    14px;

                object-fit:
                    contain;

                filter:
                    drop-shadow(
                        0 0 15px
                        rgba(90,150,255,.7)
                    );

            }


            .haldo-settings-brand-title {

                font-size:
                    18px;

                font-weight:
                    750;

            }


            .haldo-settings-brand-sub {

                font-size:
                    11px;

                opacity:
                    .55;

                margin-top:
                    3px;

            }


            .haldo-settings-nav {

                display:
                    flex;

                flex-direction:
                    column;

                gap:
                    5px;

            }


            .haldo-settings-nav button {

                width:
                    100%;

                border:
                    0;

                color:
                    inherit;

                background:
                    transparent;

                border-radius:
                    13px;

                padding:
                    12px;

                display:
                    flex;

                align-items:
                    center;

                gap:
                    12px;

                cursor:
                    pointer;

                text-align:
                    left;

                transition:
                    .18s ease;

            }


            .haldo-settings-nav button:hover {

                background:
                    rgba(255,255,255,.07);

            }


            .haldo-settings-nav button.active {

                background:
                    linear-gradient(
                        135deg,
                        rgba(70,120,255,.30),
                        rgba(130,70,255,.22)
                    );

                box-shadow:
                    inset
                    0 0 0
                    1px
                    rgba(130,160,255,.18);

            }


            .haldo-settings-nav-icon {

                width:
                    28px;

                text-align:
                    center;

                font-size:
                    17px;

            }


            .haldo-settings-main {

                min-width:
                    0;

                display:
                    flex;

                flex-direction:
                    column;

                overflow:
                    hidden;

            }


            .haldo-settings-header {

                min-height:
                    78px;

                display:
                    flex;

                align-items:
                    center;

                gap:
                    14px;

                padding:
                    16px 26px;

                border-bottom:
                    1px solid
                    rgba(255,255,255,.08);

                background:
                    rgba(8,11,19,.72);

                backdrop-filter:
                    blur(20px);

            }


            .haldo-settings-back {

                border:
                    0;

                background:
                    rgba(255,255,255,.07);

                color:
                    inherit;

                width:
                    40px;

                height:
                    40px;

                border-radius:
                    12px;

                cursor:
                    pointer;

                font-size:
                    18px;

            }


            .haldo-settings-header-text {

                flex:
                    1;

                min-width:
                    0;

            }


            .haldo-settings-title {

                font-size:
                    22px;

                font-weight:
                    750;

            }


            .haldo-settings-description {

                opacity:
                    .55;

                font-size:
                    13px;

                margin-top:
                    4px;

            }


            .haldo-settings-search {

                width:
                    250px;

                max-width:
                    30vw;

                border:
                    1px solid
                    rgba(255,255,255,.10);

                background:
                    rgba(255,255,255,.06);

                color:
                    inherit;

                border-radius:
                    12px;

                padding:
                    11px 13px;

                outline:
                    none;

            }


            .haldo-settings-content {

                flex:
                    1;

                overflow-y:
                    auto;

                padding:
                    28px;

            }


            .haldo-settings-card {

                max-width:
                    900px;

                margin:
                    0 auto 18px;

                padding:
                    20px;

                border:
                    1px solid
                    rgba(255,255,255,.08);

                border-radius:
                    20px;

                background:
                    rgba(255,255,255,.045);

                box-shadow:
                    0 20px 60px
                    rgba(0,0,0,.18);

            }


            .haldo-settings-card-title {

                font-size:
                    16px;

                font-weight:
                    700;

                margin-bottom:
                    14px;

            }


            .haldo-settings-row {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    space-between;

                gap:
                    20px;

                padding:
                    15px 0;

                border-bottom:
                    1px solid
                    rgba(255,255,255,.06);

            }


            .haldo-settings-row:last-child {

                border-bottom:
                    0;

            }


            .haldo-settings-row-info {

                min-width:
                    0;

            }


            .haldo-settings-row-title {

                font-weight:
                    600;

            }


            .haldo-settings-row-description {

                margin-top:
                    4px;

                font-size:
                    12px;

                opacity:
                    .50;

            }


            .haldo-settings-control {

                flex:
                    0 0 auto;

            }


            .haldo-settings-toggle {

                width:
                    48px;

                height:
                    28px;

                border-radius:
                    20px;

                border:
                    0;

                background:
                    rgba(255,255,255,.13);

                position:
                    relative;

                cursor:
                    pointer;

                transition:
                    .2s;

            }


            .haldo-settings-toggle::after {

                content:
                    "";

                position:
                    absolute;

                top:
                    4px;

                left:
                    4px;

                width:
                    20px;

                height:
                    20px;

                border-radius:
                    50%;

                background:
                    #fff;

                transition:
                    .2s;

            }


            .haldo-settings-toggle.on {

                background:
                    linear-gradient(
                        135deg,
                        #477cff,
                        #8b5cff
                    );

            }


            .haldo-settings-toggle.on::after {

                transform:
                    translateX(20px);

            }


            .haldo-settings-select {

                min-width:
                    150px;

                border:
                    1px solid
                    rgba(255,255,255,.10);

                border-radius:
                    10px;

                background:
                    #151a28;

                color:
                    inherit;

                padding:
                    9px 11px;

                outline:
                    none;

            }


            .haldo-settings-range {

                width:
                    160px;

            }


            .haldo-settings-actions {

                display:
                    flex;

                flex-wrap:
                    wrap;

                gap:
                    10px;

            }


            .haldo-settings-action {

                border:
                    0;

                border-radius:
                    12px;

                padding:
                    11px 15px;

                color:
                    inherit;

                background:
                    rgba(255,255,255,.08);

                cursor:
                    pointer;

            }


            .haldo-settings-action.primary {

                background:
                    linear-gradient(
                        135deg,
                        #477cff,
                        #8b5cff
                    );

            }


            .haldo-settings-action.danger {

                background:
                    rgba(255,70,90,.14);

                color:
                    #ff9ba8;

            }


            .haldo-settings-empty {

                text-align:
                    center;

                opacity:
                    .55;

                padding:
                    60px 20px;

            }


            .haldo-settings-system-grid {

                display:
                    grid;

                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(190px,1fr)
                    );

                gap:
                    12px;

            }


            .haldo-settings-system-item {

                padding:
                    15px;

                border-radius:
                    14px;

                background:
                    rgba(255,255,255,.045);

            }


            .haldo-settings-system-label {

                font-size:
                    11px;

                opacity:
                    .5;

                margin-bottom:
                    6px;

            }


            .haldo-settings-system-value {

                font-size:
                    14px;

                font-weight:
                    650;

                overflow:
                    hidden;

                text-overflow:
                    ellipsis;

            }


            @media(max-width:800px) {

                .haldo-settings-shell {

                    grid-template-columns:
                        1fr;

                }

                .haldo-settings-sidebar {

                    display:
                        none;

                }

                .haldo-settings-search {

                    max-width:
                        150px;

                }

                .haldo-settings-content {

                    padding:
                        18px;

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* ========================================================
       09 — RENDER NAVIGATION
       ======================================================== */

    function render() {

        createRoot();


        const section =
            sections.find(
                item =>
                    item.id ===
                    state.currentSection
            ) ||
            sections[0];


        root.innerHTML = `

            <div class="haldo-settings-shell">

                <aside class="haldo-settings-sidebar">

                    <div class="haldo-settings-brand">

                        <img
                            class="haldo-settings-brand-logo"
                            src="assets/logo/logo.png"
                            alt="HalDo"
                            onerror="
                                this.style.display='none'
                            "
                        >

                        <div>

                            <div class="haldo-settings-brand-title">
                                HalDo
                            </div>

                            <div class="haldo-settings-brand-sub">
                                AI OS 20 · Einstellungen
                            </div>

                        </div>

                    </div>

                    <nav
                        class="haldo-settings-nav"
                        aria-label="Einstellungen"
                    >

                        ${sections.map(
                            item => `

                                <button
                                    type="button"
                                    data-section="${escapeHTML(item.id)}"
                                    class="${
                                        item.id ===
                                        state.currentSection
                                            ? "active"
                                            : ""
                                    }"
                                >

                                    <span
                                        class="haldo-settings-nav-icon"
                                    >
                                        ${escapeHTML(item.icon)}
                                    </span>

                                    <span>
                                        ${escapeHTML(item.title)}
                                    </span>

                                </button>

                            `
                        ).join("")}

                    </nav>

                </aside>


                <main class="haldo-settings-main">

                    <header
                        class="haldo-settings-header"
                    >

                        <button
                            type="button"
                            class="haldo-settings-back"
                            data-action="home"
                            title="Zurück zum Hauptmenü"
                        >
                            ←
                        </button>

                        <div
                            class="haldo-settings-header-text"
                        >

                            <div
                                class="haldo-settings-title"
                            >
                                ${escapeHTML(
                                    section.title
                                )}
                            </div>

                            <div
                                class="haldo-settings-description"
                            >
                                ${escapeHTML(
                                    section.description
                                )}
                            </div>

                        </div>

                        <input
                            class="haldo-settings-search"
                            type="search"
                            placeholder="Einstellungen suchen…"
                            value="${escapeHTML(
                                state.search
                            )}"
                        >

                    </header>


                    <div
                        class="haldo-settings-content"
                    >

                        ${renderSection(
                            state.currentSection
                        )}

                    </div>

                </main>

            </div>

        `;


        bindEvents();

    }


    /* ========================================================
       10 — RENDER SECTIONS
       ======================================================== */

    function renderSection(
        section
    ) {

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

            case "notifications":

                return renderNotifications();

            case "privacy":

                return renderPrivacy();

            case "system":

                return renderSystem();

            default:

                return renderGeneral();

        }

    }


    function row(
        title,
        description,
        control
    ) {

        return `

            <div class="haldo-settings-row">

                <div class="haldo-settings-row-info">

                    <div class="haldo-settings-row-title">
                        ${escapeHTML(title)}
                    </div>

                    <div class="haldo-settings-row-description">
                        ${escapeHTML(description)}
                    </div>

                </div>

                <div class="haldo-settings-control">
                    ${control}
                </div>

            </div>

        `;

    }


    function toggle(
        path,
        value
    ) {

        return `

            <button
                type="button"
                class="haldo-settings-toggle ${
                    value ? "on" : ""
                }"
                data-toggle="${escapeHTML(path)}"
                aria-pressed="${value}"
            ></button>

        `;

    }


    function select(
        path,
        value,
        options
    ) {

        return `

            <select
                class="haldo-settings-select"
                data-select="${escapeHTML(path)}"
            >

                ${options.map(
                    option => `

                        <option
                            value="${escapeHTML(option.value)}"
                            ${
                                option.value === value
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${escapeHTML(option.label)}
                        </option>

                    `
                ).join("")}

            </select>

        `;

    }


    function renderGeneral() {

        return `

            <div class="haldo-settings-card">

                <div class="haldo-settings-card-title">
                    Systemverhalten
                </div>

                ${row(
                    "Animationen",
                    "Animierte Übergänge und HalDo-Oberflächeneffekte.",
                    toggle(
                        "general.animations",
                        state.settings.general.animations
                    )
                )}

                ${row(
                    "System-Sounds",
                    "Akustische Rückmeldungen der Oberfläche.",
                    toggle(
                        "general.sounds",
                        state.settings.general.sounds
                    )
                )}

                ${row(
                    "Automatisch starten",
                    "HalDo-Systemdienste beim Systemstart automatisch vorbereiten.",
                    toggle(
                        "general.autoStart",
                        state.settings.general.autoStart
                    )
                )}

            </div>


            <div class="haldo-settings-card">

                <div class="haldo-settings-card-title">
                    Einstellungen
                </div>

                <div class="haldo-settings-actions">

                    <button
                        class="haldo-settings-action primary"
                        data-action="save"
                    >
                        Änderungen speichern
                    </button>

                    <button
                        class="haldo-settings-action danger"
                        data-action="reset"
                    >
                        Einstellungen zurücksetzen
                    </button>

                </div>

            </div>

        `;

    }


    function renderAppearance() {

        return `

            <div class="haldo-settings-card">

                <div class="haldo-settings-card-title">
                    Darstellung
                </div>

                ${row(
                    "Theme",
                    "Darstellung des HalDo-Systems.",
                    select(
                        "appearance.theme",
                        state.settings.appearance.theme,
                        [
                            {
                                value: "system",
                                label: "System"
                            },
                            {
                                value: "dark",
                                label: "Dunkel"
                            },
                            {
                                value: "light",
                                label: "Hell"
                            }
                        ]
                    )
                )}

                ${row(
                    "Transparenz",
                    "Glasartige und transparente Oberflächenelemente.",
                    toggle(
                        "appearance.transparency",
                        state.settings.appearance.transparency
                    )
                )}

                ${row(
                    "HalDo Glow",
                    "Leuchtende visuelle HalDo-Effekte.",
                    toggle(
                        "appearance.glow",
                        state.settings.appearance.glow
                    )
                )}

                ${row(
                    "Kompaktmodus",
                    "Reduziert Abstände für kleinere Displays.",
                    toggle(
                        "appearance.compactMode",
                        state.settings.appearance.compactMode
                    )
                )}

            </div>

        `;

    }


    function renderLanguage() {

        return `

            <div class="haldo-settings-card">

                <div class="haldo-settings-card-title">
                    Sprache
                </div>

                ${row(
                    "Oberflächensprache",
                    "Sprache der HalDo-Systemoberfläche.",
                    select(
                        "language.interface",
                        state.settings.language.interface,
                        [
                            {
                                value: "de",
                                label: "Deutsch"
                            },
                            {
                                value: "en",
                                label: "English"
                            },
                            {
                                value: "ku",
                                label: "Kurdî"
                            },
                            {
                                value: "ar",
                                label: "العربية"
                            },
                            {
                                value: "tr",
                                label: "Türkçe"
                            },
                            {
                                value: "fr",
                                label: "Français"
                            },
                            {
                                value: "es",
                                label: "Español"
                            }
                        ]
                    )
                )}

                ${row(
                    "AI-Sprache",
                    "Bevorzugte Sprache für die Kommunikation mit HalDo AI.",
                    select(
                        "language.ai",
                        state.settings.language.ai,
                        [
                            {
                                value: "de",
                                label: "Deutsch"
                            },
                            {
                                value: "en",
                                label: "English"
                            },
                            {
                                value: "ku",
                                label: "Kurdî"
                            },
                            {
                                value: "ar",
                                label: "العربية"
                            },
                            {
                                value: "tr",
                                label: "Türkçe"
                            }
                        ]
                    )
                )}

                ${row(
                    "Êzîdî-Tastatur",
                    "Eigene Êzîdî-Zeichen und das HalDo-Tastatursystem aktivieren.",
                    toggle(
                        "language.ezidiKeyboard",
                        state.settings.language.ezidiKeyboard
                    )
                )}

            </div>

        `;

    }


    function renderAI() {

        return `

            <div class="haldo-settings-card">

                <div class="haldo-settings-card-title">
                    HalDo AI
                </div>

                ${row(
                    "HalDo AI aktiv",
                    "Die zentrale AI-Schnittstelle des Systems.",
                    toggle(
                        "ai.enabled",
                        state.settings.ai.enabled
                    )
                )}

                ${row(
                    "AI-Gedächtnis",
                    "Ermöglicht der AI, unterstützte gespeicherte Gesprächsdaten zu verwenden.",
                    toggle(
                        "ai.memory",
                        state.settings.ai.memory
                    )
                )}

                ${row(
                    "Intelligente Vorschläge",
                    "Kontextabhängige Vorschläge und Aktionen.",
                    toggle(
                        "ai.suggestions",
                        state.settings.ai.suggestions
                    )
                )}

                ${row(
                    "Sprachantworten",
                    "HalDo AI darf Antworten über das Sprachsystem ausgeben.",
                    toggle(
                        "ai.voiceReplies",
                        state.settings.ai.voiceReplies
                    )
                )}

            </div>

        `;

    }


    function renderVoice() {

        return `

            <div class="haldo-settings-card">

                <div class="haldo-settings-card-title">
                    Stimme
                </div>

                ${row(
                    "Sprachsystem",
                    "HalDo-Sprachfunktionen aktivieren.",
                    toggle(
                        "voice.enabled",
                        state.settings.voice.enabled
                    )
                )}

                ${row(
                    "Automatisch sprechen",
                    "AI-Antworten automatisch vorlesen.",
                    toggle(
                        "voice.autoSpeak",
                        state.settings.voice.autoSpeak
                    )
                )}

                ${row(
                    "Lautstärke",
                    "Lautstärke der Sprachwiedergabe.",
                    `
                        <input
                            class="haldo-settings-range"
                            type="range"
                            min="0"
                            max="100"
                            value="${state.settings.voice.volume}"
                            data-range="voice.volume"
                        >
                    `
                )}

            </div>

        `;

    }


    function renderKeyboard() {

        return `

            <div class="haldo-settings-card">

                <div class="haldo-settings-card-title">
                    Tastatur
                </div>

                ${row(
                    "HalDo-Tastatur",
                    "Systemweite Tastaturunterstützung.",
                    toggle(
                        "keyboard.enabled",
                        state.settings.keyboard.enabled
                    )
                )}

                ${row(
                    "Êzîdî-Layout",
                    "Êzîdî-Zeichen und eigenes Layout bereitstellen.",
                    toggle(
                        "keyboard.ezidi",
                        state.settings.keyboard.ezidi
                    )
                )}

                ${row(
                    "Enter = Senden",
                    "Enter sendet Nachrichten im AI-Eingabefeld.",
                    toggle(
                        "keyboard.enterToSend",
                        state.settings.keyboard.enterToSend
                    )
                )}

            </div>

        `;

    }


    function renderNotifications() {

        return `

            <div class="haldo-settings-card">

                <div class="haldo-settings-card-title">
                    Benachrichtigungen
                </div>

                ${row(
                    "Benachrichtigungen",
                    "HalDo-Systembenachrichtigungen aktivieren.",
                    toggle(
                        "notifications.enabled",
                        state.settings.notifications.enabled
                    )
                )}

                ${row(
                    "Benachrichtigungssounds",
                    "Sound bei neuen Benachrichtigungen.",
                    toggle(
                        "notifications.sounds",
                        state.settings.notifications.sounds
                    )
                )}

                ${row(
                    "Desktop-Benachrichtigungen",
                    "Benachrichtigungen innerhalb der zentralen Oberfläche anzeigen.",
                    toggle(
                        "notifications.desktop",
                        state.settings.notifications.desktop
                    )
                )}

            </div>

        `;

    }


    function renderPrivacy() {

        return `

            <div class="haldo-settings-card">

                <div class="haldo-settings-card-title">
                    Datenschutz
                </div>

                ${row(
                    "Gesprächsverlauf speichern",
                    "Lokale Speicherung unterstützter HalDo AI-Daten.",
                    toggle(
                        "privacy.saveHistory",
                        state.settings.privacy.saveHistory
                    )
                )}

                ${row(
                    "Diagnoseinformationen",
                    "Lokale Systemdiagnose für Fehleranalyse aktivieren.",
                    toggle(
                        "privacy.diagnostics",
                        state.settings.privacy.diagnostics
                    )
                )}

            </div>

        `;

    }


    function renderSystem() {

        const system =
            getSystem();

        const kernel =
            getKernel();

        const manager =
            getAppManager();


        return `

            <div class="haldo-settings-card">

                <div class="haldo-settings-card-title">
                    HalDo AI OS Systemstatus
                </div>

                <div class="haldo-settings-system-grid">

                    ${systemItem(
                        "System",
                        system
                            ? "Verbunden"
                            : "Nicht verbunden"
                    )}

                    ${systemItem(
                        "Kernel",
                        kernel
                            ? "Verbunden"
                            : "Nicht verbunden"
                    )}

                    ${systemItem(
                        "App Manager",
                        manager
                            ? "Verbunden"
                            : "Nicht verbunden"
                    )}

                    ${systemItem(
                        "App Registry",
                        getRegistry()
                            ? "Verbunden"
                            : "Nicht verbunden"
                    )}

                    ${systemItem(
                        "Storage",
                        getStorage()
                            ? "Verbunden"
                            : "LocalStorage"
                    )}

                    ${systemItem(
                        "Language",
                        getLanguage()
                            ? "Verbunden"
                            : "Nicht verbunden"
                    )}

                    ${systemItem(
                        "Voice",
                        getVoice()
                            ? "Verbunden"
                            : "Nicht verbunden"
                    )}

                    ${systemItem(
                        "Keyboard",
                        getKeyboard()
                            ? "Verbunden"
                            : "Nicht verbunden"
                    )}

                </div>

            </div>


            <div class="haldo-settings-card">

                <div class="haldo-settings-card-title">
                    Diagnose
                </div>

                <div class="haldo-settings-actions">

                    <button
                        class="haldo-settings-action primary"
                        data-action="diagnostics"
                    >
                        Systemdiagnose ausführen
                    </button>

                    <button
                        class="haldo-settings-action"
                        data-action="save"
                    >
                        Einstellungen speichern
                    </button>

                </div>

            </div>

        `;

    }


    function systemItem(
        label,
        value
    ) {

        return `

            <div class="haldo-settings-system-item">

                <div class="haldo-settings-system-label">
                    ${escapeHTML(label)}
                </div>

                <div class="haldo-settings-system-value">
                    ${escapeHTML(value)}
                </div>

            </div>

        `;

    }


    /* ========================================================
       11 — PATH ACCESS
       ======================================================== */

    function getPath(
        path
    ) {

        const parts =
            String(
                path
            ).split(
                "."
            );


        let current =
            state.settings;


        for (
            const part of parts
        ) {

            if (
                !current
            ) {

                return undefined;

            }

            current =
                current[part];

        }


        return current;

    }


    function setPath(
        path,
        value
    ) {

        const parts =
            String(
                path
            ).split(
                "."
            );


        const last =
            parts.pop();


        let current =
            state.settings;


        for (
            const part of parts
        ) {

            if (
                !current[part] ||
                typeof current[part] !==
                "object"
            ) {

                current[part] = {};

            }

            current =
                current[part];

        }


        current[last] =
            value;


        save();


        emit(
            "changed",
            {

                path,

                value,

                settings:
                    clone(
                        state.settings
                    )

            }
        );


        applySetting(
            path,
            value
        );

    }


    /* ========================================================
       12 — APPLY SETTINGS
       ======================================================== */

    function applySetting(
        path,
        value
    ) {

        try {

            if (
                path ===
                "appearance.theme"
            ) {

                document.documentElement
                    .setAttribute(
                        "data-haldo-theme",
                        value
                    );

            }


            if (
                path ===
                "appearance.glow"
            ) {

                document.documentElement
                    .classList.toggle(
                        "haldo-no-glow",
                        !value
                    );

            }


            if (
                path ===
                "general.animations"
            ) {

                document.documentElement
                    .classList.toggle(
                        "haldo-reduce-motion",
                        !value
                    );

            }


            const language =
                getLanguage();


            if (
                path ===
                "language.interface" &&
                language
            ) {

                if (
                    hasMethod(
                        language,
                        "setLanguage"
                    )
                ) {

                    language.setLanguage(
                        value
                    );

                } else if (
                    hasMethod(
                        language,
                        "setCurrentLanguage"
                    )
                ) {

                    language.setCurrentLanguage(
                        value
                    );

                }

            }


            emit(
                "setting-applied",
                {
                    path,
                    value
                }
            );

        } catch (error) {

            console.warn(
                "[HalDo Settings] Apply failed:",
                error
            );

        }

    }


    /* ========================================================
       13 — RESET
       ======================================================== */

    function reset() {

        const confirmed =
            window.confirm(
                "Möchtest du die HalDo-Einstellungen wirklich zurücksetzen?"
            );


        if (!confirmed) {

            return false;

        }


        state.settings = {

            general: {

                animations:
                    true,

                sounds:
                    true,

                autoStart:
                    true

            },

            appearance: {

                theme:
                    "system",

                transparency:
                    true,

                glow:
                    true,

                compactMode:
                    false

            },

            language: {

                interface:
                    "de",

                ai:
                    "de",

                ezidiKeyboard:
                    true

            },

            ai: {

                enabled:
                    true,

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

                volume:
                    80

            },

            keyboard: {

                enabled:
                    true,

                ezidi:
                    true,

                enterToSend:
                    true

            },

            notifications: {

                enabled:
                    true,

                sounds:
                    true,

                desktop:
                    true

            },

            privacy: {

                saveHistory:
                    true,

                diagnostics:
                    true

            }

        };


        save();

        render();


        emit(
            "reset"
        );


        return true;

    }


    /* ========================================================
       14 — EVENTS
       ======================================================== */

    function bindEvents() {

        if (!root) {

            return;

        }


        root.querySelectorAll(
            "[data-section]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.currentSection =
                            button.dataset.section;

                        state.search =
                            "";

                        render();

                        emit(
                            "navigation-changed",
                            {
                                section:
                                    state.currentSection
                            }
                        );

                    }
                );

            }
        );


        root.querySelectorAll(
            "[data-toggle]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const path =
                            button.dataset.toggle;

                        const current =
                            !!getPath(
                                path
                            );

                        setPath(
                            path,
                            !current
                        );

                        render();

                    }
                );

            }
        );


        root.querySelectorAll(
            "[data-select]"
        )
        .forEach(
            selectElement => {

                selectElement.addEventListener(
                    "change",
                    event => {

                        setPath(
                            selectElement.dataset.select,
                            event.target.value
                        );

                        render();

                    }
                );

            }
        );


        root.querySelectorAll(
            "[data-range]"
        )
        .forEach(
            range => {

                range.addEventListener(
                    "input",
                    event => {

                        setPath(
                            range.dataset.range,
                            Number(
                                event.target.value
                            )
                        );

                    }
                );

            }
        );


        const search =
            root.querySelector(
                ".haldo-settings-search"
            );


        if (search) {

            search.addEventListener(
                "input",
                event => {

                    state.search =
                        event.target.value;

                    filterSearch();

                }
            );

        }


        root.querySelectorAll(
            "[data-action]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        handleAction(
                            button.dataset.action
                        );

                    }
                );

            }
        );

    }


    function filterSearch() {

        const query =
            state.search
                .trim()
                .toLowerCase();


        if (!query) {

            render();

            return;

        }


        const matches =
            sections.filter(
                section => {

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
            );


        const content =
            root.querySelector(
                ".haldo-settings-content"
            );


        if (!content) {

            return;

        }


        if (!matches.length) {

            content.innerHTML = `

                <div class="haldo-settings-empty">

                    Keine passende Einstellung gefunden.

                </div>

            `;

            return;

        }


        content.innerHTML = matches.map(
            section => `

                <div class="haldo-settings-card">

                    <div class="haldo-settings-card-title">

                        ${escapeHTML(
                            section.icon
                        )}

                        &nbsp;

                        ${escapeHTML(
                            section.title
                        )}

                    </div>

                    <div class="haldo-settings-row">

                        <div class="haldo-settings-row-info">

                            <div class="haldo-settings-row-title">
                                ${escapeHTML(
                                    section.title
                                )}
                            </div>

                            <div class="haldo-settings-row-description">
                                ${escapeHTML(
                                    section.description
                                )}
                            </div>

                        </div>

                        <button
                            class="haldo-settings-action primary"
                            data-open-section="${escapeHTML(
                                section.id
                            )}"
                        >
                            Öffnen
                        </button>

                    </div>

                </div>

            `
        ).join("");


        content.querySelectorAll(
            "[data-open-section]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.currentSection =
                            button.dataset.openSection;

                        state.search =
                            "";

                        render();

                    }
                );

            }
        );

    }


    /* ========================================================
       15 — ACTIONS
       ======================================================== */

    function handleAction(
        action
    ) {

        switch (action) {

            case "save":

                save();

                break;


            case "reset":

                reset();

                break;


            case "diagnostics":

                runDiagnostics();

                break;


            case "home":

                close();

                break;

        }

    }


    function runDiagnostics() {

        const manager =
            getAppManager();


        let result = null;


        try {

            if (
                manager &&
                hasMethod(
                    manager,
                    "diagnostics"
                )
            ) {

                result =
                    manager.diagnostics();

            } else if (
                getSystem() &&
                hasMethod(
                    getSystem(),
                    "diagnostics"
                )
            ) {

                result =
                    getSystem().diagnostics();

            }

        } catch (error) {

            result = {

                error:
                    error.message

            };

        }


        console.log(
            "[HalDo Settings] Systemdiagnose:",
            result
        );


        emit(
            "diagnostics",
            {
                result
            }
        );


        window.alert(
            result
                ? "HalDo-Systemdiagnose wurde ausgeführt. Details wurden an die Systemkonsole übermittelt."
                : "Keine Diagnose-Schnittstelle verfügbar."
        );

    }


    /* ========================================================
       16 — LIFECYCLE
       ======================================================== */

    async function initialize(
        context = {}
    ) {

        if (
            state.initialized
        ) {

            return true;

        }


        await load();

        createRoot();

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

            await initialize(
                context
            );

        }


        state.started =
            true;


        emit(
            "started"
        );


        return true;

    }


    async function open(
        context = {}
    ) {

        if (
            !state.initialized
        ) {

            await initialize(
                context
            );

        }


        if (
            !state.started
        ) {

            await start(
                context
            );

        }


        render();


        root.classList.add(
            "is-open"
        );


        state.opened =
            true;

        state.active =
            true;

        state.minimized =
            false;


        emit(
            "opened",
            {
                context
            }
        );

        emit(
            "activated"
        );


        return true;

    }


    async function close() {

        if (!root) {

            return true;

        }


        root.classList.remove(
            "is-open"
        );


        state.opened =
            false;

        state.active =
            false;

        state.minimized =
            false;


        emit(
            "closed"
        );


        return true;

    }


    async function minimize() {

        if (
            !state.opened
        ) {

            return false;

        }


        root.classList.remove(
            "is-open"
        );


        state.minimized =
            true;

        state.active =
            false;


        emit(
            "minimized"
        );


        return true;

    }


    async function restore() {

        if (
            !state.minimized
        ) {

            return open();

        }


        return open();

    }


    async function activate() {

        if (
            !state.opened
        ) {

            return open();

        }


        state.active =
            true;

        state.minimized =
            false;


        root.classList.add(
            "is-open"
        );


        emit(
            "activated"
        );


        return true;

    }


    async function deactivate() {

        state.active =
            false;


        emit(
            "deactivated"
        );


        return true;

    }


    /* ========================================================
       17 — APP DEFINITION
       ======================================================== */

    const appDefinition = {

        id:
            APP_ID,

        appId:
            APP_ID,

        name:
            APP_NAME,

        title:
            APP_NAME,

        description:
            "Zentrale Einstellungen für HalDo AI OS 20.",

        version:
            VERSION,

        icon:
            "⚙",

        category:
            "system",

        singleton:
            true,

        enabled:
            true,

        visible:
            true,

        permissions: [

            "settings"

        ],

        dependencies: [],

        tags: [

            "settings",

            "system",

            "configuration",

            "preferences"

        ],

        keywords: [

            "Einstellungen",

            "Settings",

            "System",

            "Sprache",

            "AI",

            "Voice",

            "Tastatur",

            "Datenschutz"

        ],

        settings:
            state.settings,

        init:
            initialize,

        start,

        open,

        close,

        activate,

        deactivate,

        minimize,

        restore,

        stop:
            async function () {

                state.started =
                    false;

                emit(
                    "stopped"
                );

                return true;

            }

    };


    /* ========================================================
       18 — PUBLIC APP API
       ======================================================== */

    const api = {

        __haldoAI20App:
            true,

        id:
            APP_ID,

        name:
            APP_NAME,

        version:
            VERSION,

        definition:
            appDefinition,

        state,

        sections,

        initialize,

        start,

        open,

        close,

        activate,

        deactivate,

        minimize,

        restore,

        save,

        load,

        reset,

        getSettings() {

            return clone(
                state.settings
            );

        },

        setSetting(
            path,
            value
        ) {

            setPath(
                path,
                value
            );

            render();

            return true;

        },

        getSetting(
            path
        ) {

            return getPath(
                path
            );

        },

        on,

        off,

        render,

        diagnostics:
            runDiagnostics

    };


    /* ========================================================
       19 — GLOBAL REGISTRATION
       ======================================================== */

    window.HalDoSettingsApp =
        api;

    HalDoOS.settingsApp =
        api;


    /* ========================================================
       20 — APP MANAGER REGISTRATION
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

            const existing =
                hasMethod(
                    manager,
                    "get"
                )
                    ? manager.get(
                        APP_ID
                    )
                    : null;


            if (!existing) {

                manager.register(
                    appDefinition
                );

            }


            emit(
                "registered",
                {
                    appId:
                        APP_ID
                }
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
       21 — HOME CONNECTION
       ======================================================== */

    function connectHome() {

        document.addEventListener(
            "haldo:home:open-settings",
            () => {

                open();

            }
        );


        document.addEventListener(
            "haldo:home:settings",
            () => {

                open();

            }
        );


        document.addEventListener(
            "haldo:launcher:open-settings",
            () => {

                open();

            }
        );

    }


    /* ========================================================
       22 — BOOT
       ======================================================== */

    async function boot() {

        try {

            connectHome();

            registerWithManager();

            await initialize();

            console.log(
                "[HalDo Settings App] bereit.",
                VERSION
            );

        } catch (error) {

            console.error(
                "[HalDo Settings App] Boot error:",
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

/* ============================================================
   END OF HALDO SETTINGS APP
   ============================================================ */