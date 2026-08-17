/* ============================================================
   HALDO AI OS 20
   SETTINGS APPLICATION
   ------------------------------------------------------------
   Datei:
       js/apps/settings/settings-app.js

   Vollständige Settings-App
   ------------------------------------------------------------
   VERBINDET:

   • HalDo App Contract
   • HalDo App Manager
   • HalDo App Registry
   • HalDo Kernel
   • HalDo System
   • HalDo Router
   • HalDo Window Manager
   • HalDo Storage
   • HalDo Language
   • HalDo Voice
   • HalDo AI
   • HalDo Keyboard / Êzîdî Keyboard
   • Theme / Appearance
   • Notifications
   • System Events

   Ziel:
   Eine echte, erweiterbare Settings-Anwendung für
   HalDo AI OS 20.

   Die Home-/Hauptmenü-Oberfläche bleibt die zentrale
   Oberfläche. Settings wird ausschließlich als App
   geöffnet und besitzt ihren eigenen internen Zustand.

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
        "HalDo AI OS Einstellungen";


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


    function getStorage() {

        return (
            window.HalDoStorage ||
            HalDoOS.storage ||
            window.HalDoStorageManager ||
            HalDoOS.storageManager ||
            null
        );

    }


    function getLanguage() {

        return (
            window.HalDoLanguageManager ||
            HalDoOS.languageManager ||
            window.HalDoLanguage ||
            HalDoOS.language ||
            window.HalDoLanguageSystem ||
            HalDoOS.languageSystem ||
            null
        );

    }


    function getVoice() {

        return (
            window.HalDoVoice ||
            HalDoOS.voice ||
            window.HalDoVoiceSystem ||
            HalDoOS.voiceSystem ||
            null
        );

    }


    function getAI() {

        return (
            window.HalDoAI ||
            HalDoOS.ai ||
            window.HalDoAICore ||
            HalDoOS.aiCore ||
            window.HalDoAIEngine ||
            HalDoOS.aiEngine ||
            null
        );

    }


    function getKeyboard() {

        return (
            window.HalDoEzidiKeyboard ||
            window.HalDoKeyboard ||
            HalDoOS.keyboard ||
            HalDoOS.ezidiKeyboard ||
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


    /* ========================================================
       03 — HELPERS
       ======================================================== */

    function hasMethod(
        object,
        method
    ) {

        return !!(
            object &&
            typeof object[method] === "function"
        );

    }


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
            Array.isArray(value)
        ) {

            return value.map(
                clone
            );

        }

        if (
            typeof value === "object"
        ) {

            const result = {};

            Object.keys(value).forEach(
                key => {

                    result[key] =
                        clone(value[key]);

                }
            );

            return result;

        }

        return value;

    }


    function clean(
        value
    ) {

        return String(
            value ?? ""
        ).trim();

    }


    function now() {

        return Date.now();

    }


    function emit(
        event,
        detail = {}
    ) {

        const payload = {

            appId:
                APP_ID,

            source:
                "settings",

            timestamp:
                now(),

            ...detail

        };


        try {

            document.dispatchEvent(
                new CustomEvent(
                    "haldo:settings:" + event,
                    {
                        detail:
                            payload
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
                    payload
                );

            } catch (_) {}

        }


        return payload;

    }


    /* ========================================================
       04 — DEFAULT SETTINGS
       ======================================================== */

    const DEFAULT_SETTINGS = {

        appearance: {

            theme:
                "system",

            accentColor:
                "blue",

            animations:
                true,

            transparency:
                true,

            glowEffects:
                true,

            reducedMotion:
                false

        },


        language: {

            interfaceLanguage:
                "de",

            aiLanguage:
                "de",

            voiceLanguage:
                "de",

            fallbackLanguage:
                "en"

        },


        voice: {

            enabled:
                true,

            autoSpeak:
                false,

            recognition:
                true,

            wakeWord:
                false,

            volume:
                1,

            rate:
                1,

            pitch:
                1

        },


        ai: {

            enabled:
                true,

            suggestions:
                true,

            conversationMemory:
                true,

            personalization:
                true,

            voiceAssistant:
                true

        },


        keyboard: {

            layout:
                "qwertz",

            ezidi:
                true,

            autocorrect:
                true,

            suggestions:
                true,

            haptic:
                true

        },


        notifications: {

            enabled:
                true,

            sounds:
                true,

            badges:
                true,

            desktop:
                true

        },


        system: {

            autoStartApps:
                true,

            restoreApps:
                true,

            diagnostics:
                true,

            developerMode:
                false

        },


        privacy: {

            analytics:
                false,

            usageData:
                false,

            localHistory:
                true

        }

    };


    /* ========================================================
       05 — INTERNAL STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        opened:
            false,

        active:
            false,

        mounted:
            false,

        currentSection:
            "overview",

        settings:
            clone(
                DEFAULT_SETTINGS
            ),

        originalSettings:
            null,

        dirty:
            false,

        container:
            null,

        listeners:
            new Map(),

        statistics: {

            opens:
                0,

            closes:
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
            typeof callback !== "function"
        ) {

            return function () {};

        }


        if (
            !state.listeners.has(event)
        ) {

            state.listeners.set(
                event,
                new Set()
            );

        }


        const set =
            state.listeners.get(event);

        set.add(callback);


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

        const set =
            state.listeners.get(event);

        if (!set) {

            return;

        }


        set.delete(callback);


        if (
            set.size === 0
        ) {

            state.listeners.delete(event);

        }

    }


    function notify(
        event,
        data = {}
    ) {

        const set =
            state.listeners.get(event);

        if (!set) {

            return;

        }


        Array.from(set).forEach(
            callback => {

                try {

                    callback(
                        data
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


    /* ========================================================
       07 — ERROR HANDLING
       ======================================================== */

    function reportError(
        exception,
        context
    ) {

        state.statistics.errors +=
            1;


        const error =
            exception instanceof Error
                ? exception
                : new Error(
                    String(exception)
                );


        const record = {

            name:
                error.name,

            message:
                error.message,

            stack:
                error.stack ||
                "",

            context:
                context ||
                "Settings",

            timestamp:
                new Date().toISOString()

        };


        console.error(
            "[HalDo Settings]",
            record
        );


        emit(
            "error",
            {
                error:
                    record
            }
        );


        const kernel =
            getKernel();


        if (
            kernel &&
            hasMethod(
                kernel,
                "reportError"
            )
        ) {

            try {

                kernel.reportError(
                    error,
                    "Settings: " +
                    (
                        context ||
                        "unknown"
                    )
                );

            } catch (_) {}

        }


        return record;

    }


    /* ========================================================
       08 — STORAGE
       ======================================================== */

    const STORAGE_KEY =
        "haldo.os20.settings";


    function mergeDeep(
        base,
        changes
    ) {

        const result =
            clone(base);


        Object.keys(
            changes || {}
        ).forEach(
            key => {

                const value =
                    changes[key];


                if (
                    value &&
                    typeof value === "object" &&
                    !Array.isArray(value) &&
                    result[key] &&
                    typeof result[key] === "object" &&
                    !Array.isArray(result[key])
                ) {

                    result[key] =
                        mergeDeep(
                            result[key],
                            value
                        );

                } else {

                    result[key] =
                        clone(value);

                }

            }
        );


        return result;

    }


    async function storageGet() {

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

                const value =
                    storage.get(
                        STORAGE_KEY
                    );


                if (
                    value &&
                    typeof value.then ===
                    "function"
                ) {

                    return await value;

                }


                return value;

            }


            const raw =
                window.localStorage.getItem(
                    STORAGE_KEY
                );


            return raw
                ? JSON.parse(raw)
                : null;

        } catch (error) {

            reportError(
                error,
                "Settings Storage Read"
            );

            return null;

        }

    }


    async function storageSet(
        value
    ) {

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
                        value
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }

                return true;

            }


            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(value)
            );


            return true;

        } catch (error) {

            reportError(
                error,
                "Settings Storage Write"
            );

            return false;

        }

    }


    async function loadSettings() {

        const stored =
            await storageGet();


        state.settings =
            mergeDeep(
                DEFAULT_SETTINGS,
                stored &&
                typeof stored === "object"
                    ? stored
                    : {}
            );


        state.originalSettings =
            clone(
                state.settings
            );


        state.dirty =
            false;


        emit(
            "settings-loaded",
            {
                settings:
                    clone(
                        state.settings
                    )
            }
        );


        return clone(
            state.settings
        );

    }


    async function saveSettings() {

        const success =
            await storageSet(
                state.settings
            );


        if (!success) {

            return false;

        }


        state.originalSettings =
            clone(
                state.settings
            );


        state.dirty =
            false;


        state.statistics.saves +=
            1;


        emit(
            "settings-saved",
            {
                settings:
                    clone(
                        state.settings
                    )
            }
        );


        notify(
            "saved",
            {
                settings:
                    clone(
                        state.settings
                    )
            }
        );


        return true;

    }


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
            "settings-reset",
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
       09 — SETTING ACCESS
       ======================================================== */

    function getSetting(
        path,
        fallback = undefined
    ) {

        const parts =
            String(
                path || ""
            )
            .split(".")
            .filter(Boolean);


        let value =
            state.settings;


        for (
            const part of parts
        ) {

            if (
                value === null ||
                value === undefined ||
                !Object.prototype.hasOwnProperty.call(
                    value,
                    part
                )
            ) {

                return fallback;

            }


            value =
                value[part];

        }


        return value;

    }


    function setSetting(
        path,
        value,
        options = {}
    ) {

        const parts =
            String(
                path || ""
            )
            .split(".")
            .filter(Boolean);


        if (
            parts.length === 0
        ) {

            return false;

        }


        let target =
            state.settings;


        for (
            let index = 0;
            index < parts.length - 1;
            index += 1
        ) {

            const part =
                parts[index];


            if (
                !target[part] ||
                typeof target[part] !== "object"
            ) {

                target[part] = {};

            }


            target =
                target[part];

        }


        const finalKey =
            parts[parts.length - 1];


        target[finalKey] =
            clone(value);


        state.dirty =
            true;


        state.statistics.changes +=
            1;


        if (
            options.apply !== false
        ) {

            applySetting(
                path,
                value
            );

        }


        emit(
            "setting-changed",
            {

                path,

                value:
                    clone(value),

                settings:
                    clone(
                        state.settings
                    )

            }
        );


        notify(
            "change",
            {
                path,
                value
            }
        );


        return true;

    }


    /* ========================================================
       10 — SYSTEM INTEGRATION
       ======================================================== */

    function applyAppearance() {

        const appearance =
            state.settings.appearance;


        const root =
            document.documentElement;


        if (!root) {

            return;

        }


        root.dataset.haldoTheme =
            appearance.theme;

        root.dataset.haldoAccent =
            appearance.accentColor;

        root.dataset.haldoAnimations =
            appearance.animations
                ? "on"
                : "off";

        root.dataset.haldoTransparency =
            appearance.transparency
                ? "on"
                : "off";

        root.dataset.haldoGlow =
            appearance.glowEffects
                ? "on"
                : "off";


        if (
            appearance.reducedMotion
        ) {

            root.classList.add(
                "haldo-reduced-motion"
            );

        } else {

            root.classList.remove(
                "haldo-reduced-motion"
            );

        }


        emit(
            "appearance-applied",
            {
                appearance:
                    clone(
                        appearance
                    )
            }
        );

    }


    function applyLanguage() {

        const language =
            getLanguage();


        const settings =
            state.settings.language;


        if (!language) {

            return;

        }


        const interfaceLanguage =
            settings.interfaceLanguage;


        const methods = [

            "setLanguage",

            "changeLanguage",

            "setCurrentLanguage",

            "useLanguage"

        ];


        for (
            const method of methods
        ) {

            if (
                hasMethod(
                    language,
                    method
                )
            ) {

                try {

                    language[method](
                        interfaceLanguage
                    );

                    break;

                } catch (_) {}

            }

        }


        emit(
            "language-applied",
            {
                language:
                    clone(
                        settings
                    )
            }
        );

    }


    function applyVoice() {

        const voice =
            getVoice();


        const settings =
            state.settings.voice;


        if (!voice) {

            return;

        }


        if (
            hasMethod(
                voice,
                "setEnabled"
            )
        ) {

            try {

                voice.setEnabled(
                    !!settings.enabled
                );

            } catch (_) {}

        }


        if (
            hasMethod(
                voice,
                "setVolume"
            )
        ) {

            try {

                voice.setVolume(
                    settings.volume
                );

            } catch (_) {}

        }


        if (
            hasMethod(
                voice,
                "setRate"
            )
        ) {

            try {

                voice.setRate(
                    settings.rate
                );

            } catch (_) {}

        }


        if (
            hasMethod(
                voice,
                "setPitch"
            )
        ) {

            try {

                voice.setPitch(
                    settings.pitch
                );

            } catch (_) {}

        }


        emit(
            "voice-applied",
            {
                voice:
                    clone(
                        settings
                    )
            }
        );

    }


    function applyKeyboard() {

        const keyboard =
            getKeyboard();


        const settings =
            state.settings.keyboard;


        if (!keyboard) {

            return;

        }


        if (
            hasMethod(
                keyboard,
                "setLayout"
            )
        ) {

            try {

                keyboard.setLayout(
                    settings.layout
                );

            } catch (_) {}

        }


        if (
            hasMethod(
                keyboard,
                "setEnabled"
            )
        ) {

            try {

                keyboard.setEnabled(
                    !!settings.ezidi
                );

            } catch (_) {}

        }


        emit(
            "keyboard-applied",
            {
                keyboard:
                    clone(
                        settings
                    )
            }
        );

    }


    function applyAI() {

        const ai =
            getAI();


        const settings =
            state.settings.ai;


        if (!ai) {

            return;

        }


        if (
            hasMethod(
                ai,
                "setEnabled"
            )
        ) {

            try {

                ai.setEnabled(
                    !!settings.enabled
                );

            } catch (_) {}

        }


        if (
            hasMethod(
                ai,
                "setMemoryEnabled"
            )
        ) {

            try {

                ai.setMemoryEnabled(
                    !!settings.conversationMemory
                );

            } catch (_) {}

        }


        emit(
            "ai-applied",
            {
                ai:
                    clone(
                        settings
                    )
            }
        );

    }


    function applyNotifications() {

        const notifications =
            getNotifications();


        const settings =
            state.settings.notifications;


        if (!notifications) {

            return;

        }


        if (
            hasMethod(
                notifications,
                "setEnabled"
            )
        ) {

            try {

                notifications.setEnabled(
                    !!settings.enabled
                );

            } catch (_) {}

        }


        emit(
            "notifications-applied",
            {
                notifications:
                    clone(
                        settings
                    )
            }
        );

    }


    function applySetting(
        path
    ) {

        const section =
            String(
                path || ""
            )
            .split(".")[0];


        switch (section) {

            case "appearance":
                applyAppearance();
                break;

            case "language":
                applyLanguage();
                break;

            case "voice":
                applyVoice();
                break;

            case "keyboard":
                applyKeyboard();
                break;

            case "ai":
                applyAI();
                break;

            case "notifications":
                applyNotifications();
                break;

            default:
                break;

        }

    }


    function applyAllSettings() {

        applyAppearance();
        applyLanguage();
        applyVoice();
        applyKeyboard();
        applyAI();
        applyNotifications();


        emit(
            "all-settings-applied",
            {
                settings:
                    clone(
                        state.settings
                    )
            }
        );

    }


    /* ========================================================
       11 — SETTINGS SECTIONS
       ======================================================== */

    const SECTIONS = [

        {
            id:
                "overview",

            title:
                "Übersicht",

            icon:
                "⚙",

            description:
                "Zentrale Einstellungen von HalDo AI OS."
        },

        {
            id:
                "appearance",

            title:
                "Darstellung",

            icon:
                "◐",

            description:
                "Theme, Farben, Animationen und Effekte."
        },

        {
            id:
                "language",

            title:
                "Sprache",

            icon:
                "文",

            description:
                "System-, AI- und Sprachassistent-Sprache."
        },

        {
            id:
                "ai",

            title:
                "HalDo AI",

            icon:
                "✦",

            description:
                "AI, Gedächtnis, Vorschläge und Assistenz."
        },

        {
            id:
                "voice",

            title:
                "Stimme",

            icon:
                "◉",

            description:
                "Sprachausgabe und Sprachsteuerung."
        },

        {
            id:
                "keyboard",

            title:
                "Tastatur",

            icon:
                "⌨",

            description:
                "Layouts einschließlich Êzîdî-Tastatur."
        },

        {
            id:
                "notifications",

            title:
                "Benachrichtigungen",

            icon:
                "◇",

            description:
                "Systembenachrichtigungen und Hinweise."
        },

        {
            id:
                "system",

            title:
                "System",

            icon:
                "▣",

            description:
                "Systemverhalten und Startoptionen."
        },

        {
            id:
                "privacy",

            title:
                "Datenschutz",

            icon:
                "◈",

            description:
                "Lokale Daten und Privatsphäre."
        },

        {
            id:
                "about",

            title:
                "Über HalDo",

            icon:
                "ⓘ",

            description:
                "Version und Systeminformationen."
        }

    ];


    /* ========================================================
       12 — UI CREATION
       ======================================================== */

    function createElement(
        tag,
        className,
        text
    ) {

        const element =
            document.createElement(
                tag
            );


        if (className) {

            element.className =
                className;

        }


        if (
            text !== undefined
        ) {

            element.textContent =
                text;

        }


        return element;

    }


    function createToggle(
        path,
        label,
        description
    ) {

        const wrapper =
            createElement(
                "label",
                "haldo-settings-row"
            );


        const text =
            createElement(
                "div",
                "haldo-settings-row-text"
            );


        const title =
            createElement(
                "div",
                "haldo-settings-row-title",
                label
            );


        const desc =
            createElement(
                "div",
                "haldo-settings-row-description",
                description
            );


        text.appendChild(title);
        text.appendChild(desc);


        const input =
            document.createElement(
                "input"
            );


        input.type =
            "checkbox";

        input.checked =
            !!getSetting(
                path
            );


        input.dataset.setting =
            path;


        input.addEventListener(
            "change",
            () => {

                setSetting(
                    path,
                    input.checked
                );

            }
        );


        wrapper.appendChild(text);
        wrapper.appendChild(input);


        return wrapper;

    }


    function createSelect(
        path,
        label,
        description,
        options
    ) {

        const wrapper =
            createElement(
                "div",
                "haldo-settings-row"
            );


        const text =
            createElement(
                "div",
                "haldo-settings-row-text"
            );


        text.appendChild(
            createElement(
                "div",
                "haldo-settings-row-title",
                label
            )
        );


        text.appendChild(
            createElement(
                "div",
                "haldo-settings-row-description",
                description
            )
        );


        const select =
            document.createElement(
                "select"
            );


        select.dataset.setting =
            path;


        const current =
            getSetting(
                path
            );


        options.forEach(
            option => {

                const item =
                    document.createElement(
                        "option"
                    );


                item.value =
                    option.value;

                item.textContent =
                    option.label;


                if (
                    option.value ===
                    current
                ) {

                    item.selected =
                        true;

                }


                select.appendChild(
                    item
                );

            }
        );


        select.addEventListener(
            "change",
            () => {

                setSetting(
                    path,
                    select.value
                );

            }
        );


        wrapper.appendChild(text);
        wrapper.appendChild(select);


        return wrapper;

    }


    function createSlider(
        path,
        label,
        description,
        min,
        max,
        step
    ) {

        const wrapper =
            createElement(
                "div",
                "haldo-settings-row"
            );


        const text =
            createElement(
                "div",
                "haldo-settings-row-text"
            );


        text.appendChild(
            createElement(
                "div",
                "haldo-settings-row-title",
                label
            )
        );


        text.appendChild(
            createElement(
                "div",
                "haldo-settings-row-description",
                description
            )
        );


        const input =
            document.createElement(
                "input"
            );


        input.type =
            "range";

        input.min =
            String(min);

        input.max =
            String(max);

        input.step =
            String(step);

        input.value =
            String(
                getSetting(
                    path,
                    min
                )
            );


        input.dataset.setting =
            path;


        input.addEventListener(
            "input",
            () => {

                setSetting(
                    path,
                    Number(
                        input.value
                    )
                );

            }
        );


        wrapper.appendChild(text);
        wrapper.appendChild(input);


        return wrapper;

    }


    /* ========================================================
       13 — SECTION RENDERING
       ======================================================== */

    function renderOverview(
        content
    ) {

        const title =
            createElement(
                "h2",
                "",
                "HalDo AI OS Einstellungen"
            );


        const description =
            createElement(
                "p",
                "",
                "Alle wichtigen System-, AI-, Sprach-, Tastatur- und Darstellungseinstellungen an einem zentralen Ort."
            );


        content.appendChild(title);
        content.appendChild(description);


        const grid =
            createElement(
                "div",
                "haldo-settings-overview-grid"
            );


        SECTIONS
            .filter(
                section =>
                    section.id !==
                    "overview"
            )
            .forEach(
                section => {

                    const card =
                        createElement(
                            "button",
                            "haldo-settings-card"
                        );


                    card.type =
                        "button";


                    const icon =
                        createElement(
                            "span",
                            "haldo-settings-card-icon",
                            section.icon
                        );


                    const cardTitle =
                        createElement(
                            "strong",
                            "",
                            section.title
                        );


                    const cardDescription =
                        createElement(
                            "span",
                            "",
                            section.description
                        );


                    card.appendChild(icon);
                    card.appendChild(cardTitle);
                    card.appendChild(
                        cardDescription
                    );


                    card.addEventListener(
                        "click",
                        () => {

                            navigate(
                                section.id
                            );

                        }
                    );


                    grid.appendChild(
                        card
                    );

                }
            );


        content.appendChild(grid);

    }


    function renderAppearance(
        content
    ) {

        content.appendChild(
            createElement(
                "h2",
                "",
                "Darstellung"
            )
        );


        content.appendChild(
            createSelect(
                "appearance.theme",
                "Theme",
                "Wähle die Darstellung des HalDo AI OS.",
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
            )
        );


        content.appendChild(
            createSelect(
                "appearance.accentColor",
                "Akzentfarbe",
                "Zentrale Farbe für die HalDo-Oberfläche.",
                [
                    {
                        value:
                            "blue",
                        label:
                            "Blau"
                    },
                    {
                        value:
                            "red",
                        label:
                            "Rot"
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
                    },
                    {
                        value:
                            "green",
                        label:
                            "Grün"
                    }
                ]
            )
        );


        content.appendChild(
            createToggle(
                "appearance.animations",
                "Animationen",
                "Aktiviert flüssige Bewegungen innerhalb des Systems."
            )
        );


        content.appendChild(
            createToggle(
                "appearance.transparency",
                "Transparenz",
                "Verwendet transparente und gläserne Oberflächen."
            )
        );


        content.appendChild(
            createToggle(
                "appearance.glowEffects",
                "Leuchteffekte",
                "Aktiviert HalDo-Glow- und Lichtanimationen."
            )
        );


        content.appendChild(
            createToggle(
                "appearance.reducedMotion",
                "Weniger Bewegung",
                "Reduziert Animationen für eine ruhigere Oberfläche."
            )
        );

    }


    function renderLanguage(
        content
    ) {

        content.appendChild(
            createElement(
                "h2",
                "",
                "Sprache"
            )
        );


        content.appendChild(
            createSelect(
                "language.interfaceLanguage",
                "Systemsprache",
                "Sprache der HalDo-Oberfläche.",
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
        );


        content.appendChild(
            createSelect(
                "language.aiLanguage",
                "AI-Sprache",
                "Sprache für die Unterhaltung mit HalDo AI.",
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
        );


        content.appendChild(
            createSelect(
                "language.voiceLanguage",
                "Sprachsprache",
                "Sprache der Spracherkennung und Sprachausgabe.",
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
        );

    }


    function renderAI(
        content
    ) {

        content.appendChild(
            createElement(
                "h2",
                "",
                "HalDo AI"
            )
        );


        content.appendChild(
            createToggle(
                "ai.enabled",
                "HalDo AI aktiv",
                "Aktiviert die zentrale HalDo AI-Funktion."
            )
        );


        content.appendChild(
            createToggle(
                "ai.suggestions",
                "Intelligente Vorschläge",
                "HalDo kann kontextbezogene Vorschläge anbieten."
            )
        );


        content.appendChild(
            createToggle(
                "ai.conversationMemory",
                "Gesprächsgedächtnis",
                "Ermöglicht die Verwendung gespeicherter Gesprächszustände."
            )
        );


        content.appendChild(
            createToggle(
                "ai.personalization",
                "Personalisierung",
                "Passt Antworten und Systemverhalten an gespeicherte Einstellungen an."
            )
        );


        content.appendChild(
            createToggle(
                "ai.voiceAssistant",
                "AI-Sprachassistent",
                "Erlaubt die Verbindung von HalDo AI mit der Sprachfunktion."
            )
        );

    }


    function renderVoice(
        content
    ) {

        content.appendChild(
            createElement(
                "h2",
                "",
                "Stimme"
            )
        );


        content.appendChild(
            createToggle(
                "voice.enabled",
                "Sprachsystem aktiv",
                "Aktiviert die zentrale HalDo-Sprachfunktion."
            )
        );


        content.appendChild(
            createToggle(
                "voice.autoSpeak",
                "Automatisch sprechen",
                "HalDo kann Antworten automatisch vorlesen."
            )
        );


        content.appendChild(
            createToggle(
                "voice.recognition",
                "Spracherkennung",
                "Erlaubt Sprachbefehle und Spracheingabe."
            )
        );


        content.appendChild(
            createToggle(
                "voice.wakeWord",
                "Wake Word",
                "Bereitet die Sprachaktivierung über ein Schlüsselwort vor."
            )
        );


        content.appendChild(
            createSlider(
                "voice.volume",
                "Lautstärke",
                "Lautstärke der Sprachausgabe.",
                0,
                1,
                0.05
            )
        );


        content.appendChild(
            createSlider(
                "voice.rate",
                "Sprechgeschwindigkeit",
                "Geschwindigkeit der Sprachausgabe.",
                0.5,
                2,
                0.05
            )
        );


        content.appendChild(
            createSlider(
                "voice.pitch",
                "Tonhöhe",
                "Tonhöhe der Sprachausgabe.",
                0,
                2,
                0.05
            )
        );

    }


    function renderKeyboard(
        content
    ) {

        content.appendChild(
            createElement(
                "h2",
                "",
                "Tastatur"
            )
        );


        content.appendChild(
            createSelect(
                "keyboard.layout",
                "Standardlayout",
                "Grundlayout der Systemtastatur.",
                [
                    {
                        value:
                            "qwertz",
                        label:
                            "Deutsch QWERTZ"
                    },
                    {
                        value:
                            "qwerty",
                        label:
                            "QWERTY"
                    },
                    {
                        value:
                            "azerty",
                        label:
                            "AZERTY"
                    }
                ]
            )
        );


        content.appendChild(
            createToggle(
                "keyboard.ezidi",
                "Êzîdî-Tastatur",
                "Aktiviert das vorbereitete Êzîdî-Tastatursystem."
            )
        );


        content.appendChild(
            createToggle(
                "keyboard.autocorrect",
                "Autokorrektur",
                "Korrigiert häufige Eingabefehler."
            )
        );


        content.appendChild(
            createToggle(
                "keyboard.suggestions",
                "Wortvorschläge",
                "Zeigt passende Wörter während der Eingabe."
            )
        );


        content.appendChild(
            createToggle(
                "keyboard.haptic",
                "Haptisches Feedback",
                "Aktiviert haptisches Feedback, sofern das Gerät es unterstützt."
            )
        );

    }


    function renderNotifications(
        content
    ) {

        content.appendChild(
            createElement(
                "h2",
                "",
                "Benachrichtigungen"
            )
        );


        content.appendChild(
            createToggle(
                "notifications.enabled",
                "Benachrichtigungen",
                "Aktiviert System- und App-Benachrichtigungen."
            )
        );


        content.appendChild(
            createToggle(
                "notifications.sounds",
                "Benachrichtigungstöne",
                "Spielt Töne bei Benachrichtigungen."
            )
        );


        content.appendChild(
            createToggle(
                "notifications.badges",
                "App-Badges",
                "Zeigt Zähler und Statusmarkierungen an."
            )
        );


        content.appendChild(
            createToggle(
                "notifications.desktop",
                "Desktop-Hinweise",
                "Erlaubt sichtbare Hinweise auf der Hauptoberfläche."
            )
        );

    }


    function renderSystem(
        content
    ) {

        content.appendChild(
            createElement(
                "h2",
                "",
                "System"
            )
        );


        content.appendChild(
            createToggle(
                "system.autoStartApps",
                "Apps automatisch starten",
                "Erlaubt vorgesehenen System-Apps beim Systemstart zu starten."
            )
        );


        content.appendChild(
            createToggle(
                "system.restoreApps",
                "Apps wiederherstellen",
                "Versucht beim Neustart vorher geöffnete Apps wiederherzustellen."
            )
        );


        content.appendChild(
            createToggle(
                "system.diagnostics",
                "Systemdiagnose",
                "Aktiviert die interne Diagnose- und Gesundheitsprüfung."
            )
        );


        content.appendChild(
            createToggle(
                "system.developerMode",
                "Entwicklermodus",
                "Aktiviert zusätzliche Entwicklungs- und Diagnosefunktionen."
            )
        );


        const diagnosticButton =
            createElement(
                "button",
                "haldo-settings-action",
                "Systemdiagnose ausführen"
            );


        diagnosticButton.type =
            "button";


        diagnosticButton.addEventListener(
            "click",
            () => {

                runDiagnostics();

            }
        );


        content.appendChild(
            diagnosticButton
        );

    }


    function renderPrivacy(
        content
    ) {

        content.appendChild(
            createElement(
                "h2",
                "",
                "Datenschutz"
            )
        );


        content.appendChild(
            createToggle(
                "privacy.analytics",
                "Analyse-Daten",
                "Derzeit standardmäßig deaktiviert."
            )
        );


        content.appendChild(
            createToggle(
                "privacy.usageData",
                "Nutzungsdaten",
                "Derzeit standardmäßig deaktiviert."
            )
        );


        content.appendChild(
            createToggle(
                "privacy.localHistory",
                "Lokale Historie",
                "Speichert Einstellungen und lokale Systemzustände auf dem Gerät."
            )
        );

    }


    function renderAbout(
        content
    ) {

        content.appendChild(
            createElement(
                "h2",
                "",
                "Über HalDo AI OS"
            )
        );


        const system =
            getSystem();


        const info = {

            "HalDo AI OS":
                VERSION,

            "Settings App":
                VERSION,

            "System":
                system &&
                (
                    system.version ||
                    system.VERSION ||
                    "verbunden"
                ),

            "App Manager":
                getAppManager()
                    ? "verbunden"
                    : "nicht verbunden",

            "App Registry":
                getRegistry()
                    ? "verbunden"
                    : "nicht verbunden",

            "Storage":
                getStorage()
                    ? "verbunden"
                    : "nicht verbunden",

            "Language":
                getLanguage()
                    ? "verbunden"
                    : "nicht verbunden",

            "Voice":
                getVoice()
                    ? "verbunden"
                    : "nicht verbunden",

            "AI":
                getAI()
                    ? "verbunden"
                    : "nicht verbunden",

            "Keyboard":
                getKeyboard()
                    ? "verbunden"
                    : "nicht verbunden"

        };


        Object.entries(info)
            .forEach(
                ([label, value]) => {

                    const row =
                        createElement(
                            "div",
                            "haldo-settings-info-row"
                        );


                    row.appendChild(
                        createElement(
                            "span",
                            "",
                            label
                        )
                    );


                    row.appendChild(
                        createElement(
                            "strong",
                            "",
                            String(value)
                        )
                    );


                    content.appendChild(
                        row
                    );

                }
            );

    }


    function renderSection(
        section,
        content
    ) {

        switch (
            section
        ) {

            case "overview":
                renderOverview(
                    content
                );
                break;

            case "appearance":
                renderAppearance(
                    content
                );
                break;

            case "language":
                renderLanguage(
                    content
                );
                break;

            case "ai":
                renderAI(
                    content
                );
                break;

            case "voice":
                renderVoice(
                    content
                );
                break;

            case "keyboard":
                renderKeyboard(
                    content
                );
                break;

            case "notifications":
                renderNotifications(
                    content
                );
                break;

            case "system":
                renderSystem(
                    content
                );
                break;

            case "privacy":
                renderPrivacy(
                    content
                );
                break;

            case "about":
                renderAbout(
                    content
                );
                break;

            default:
                renderOverview(
                    content
                );
                break;

        }

    }


    /* ========================================================
       14 — MAIN UI
       ======================================================== */

    function render() {

        if (
            !state.container
        ) {

            return false;

        }


        const root =
            state.container;


        root.innerHTML =
            "";


        root.classList.add(
            "haldo-settings-app"
        );


        const shell =
            createElement(
                "div",
                "haldo-settings-shell"
            );


        const sidebar =
            createElement(
                "aside",
                "haldo-settings-sidebar"
            );


        const header =
            createElement(
                "div",
                "haldo-settings-header"
            );


        header.appendChild(
            createElement(
                "div",
                "haldo-settings-logo",
                "H"
            )
        );


        const headerText =
            createElement(
                "div"
            );


        headerText.appendChild(
            createElement(
                "strong",
                "",
                "HalDo AI OS"
            )
        );


        headerText.appendChild(
            createElement(
                "span",
                "",
                "Settings"
            )
        );


        header.appendChild(
            headerText
        );


        sidebar.appendChild(
            header
        );


        const navigation =
            createElement(
                "nav",
                "haldo-settings-navigation"
            );


        SECTIONS.forEach(
            section => {

                const button =
                    createElement(
                        "button",
                        "haldo-settings-nav-item"
                    );


                button.type =
                    "button";


                if (
                    section.id ===
                    state.currentSection
                ) {

                    button.classList.add(
                        "active"
                    );

                }


                const icon =
                    createElement(
                        "span",
                        "haldo-settings-nav-icon",
                        section.icon
                    );


                const text =
                    createElement(
                        "span",
                        "",
                        section.title
                    );


                button.appendChild(icon);
                button.appendChild(text);


                button.addEventListener(
                    "click",
                    () => {

                        navigate(
                            section.id
                        );

                    }
                );


                navigation.appendChild(
                    button
                );

            }
        );


        sidebar.appendChild(
            navigation
        );


        const main =
            createElement(
                "main",
                "haldo-settings-main"
            );


        const topbar =
            createElement(
                "div",
                "haldo-settings-topbar"
            );


        const current =
            SECTIONS.find(
                section =>
                    section.id ===
                    state.currentSection
            ) ||
            SECTIONS[0];


        topbar.appendChild(
            createElement(
                "div",
                "haldo-settings-current-title",
                current.title
            )
        );


        if (
            state.dirty
        ) {

            topbar.appendChild(
                createElement(
                    "span",
                    "haldo-settings-dirty",
                    "Ungespeicherte Änderungen"
                )
            );

        }


        const content =
            createElement(
                "section",
                "haldo-settings-content"
            );


        renderSection(
            state.currentSection,
            content
        );


        const actions =
            createElement(
                "div",
                "haldo-settings-actions"
            );


        const saveButton =
            createElement(
                "button",
                "haldo-settings-primary-action",
                "Änderungen speichern"
            );


        saveButton.type =
            "button";


        saveButton.disabled =
            !state.dirty;


        saveButton.addEventListener(
            "click",
            async () => {

                await saveSettings();

                render();

            }
        );


        const resetButton =
            createElement(
                "button",
                "haldo-settings-secondary-action",
                "Zurücksetzen"
            );


        resetButton.type =
            "button";


        resetButton.addEventListener(
            "click",
            async () => {

                await resetSettings();

            }
        );


        actions.appendChild(
            resetButton
        );

        actions.appendChild(
            saveButton
        );


        main.appendChild(
            topbar
        );

        main.appendChild(
            content
        );

        main.appendChild(
            actions
        );


        shell.appendChild(
            sidebar
        );

        shell.appendChild(
            main
        );


        root.appendChild(
            shell
        );


        state.mounted =
            true;


        return true;

    }


    /* ========================================================
       15 — NAVIGATION
       ======================================================== */

    function navigate(
        section
    ) {

        const exists =
            SECTIONS.some(
                item =>
                    item.id ===
                    section
            );


        if (!exists) {

            section =
                "overview";

        }


        state.currentSection =
            section;


        emit(
            "section-changed",
            {
                section
            }
        );


        render();


        return section;

    }


    function getCurrentSection() {

        return state.currentSection;

    }


    /* ========================================================
       16 — CONTAINER
       ======================================================== */

    function resolveContainer(
        options = {}
    ) {

        if (
            options.container instanceof
            HTMLElement
        ) {

            return options.container;

        }


        if (
            typeof options.container ===
            "string"
        ) {

            const element =
                document.querySelector(
                    options.container
                );


            if (element) {

                return element;

            }

        }


        const selectors = [

            `[data-haldo-app="${APP_ID}"]`,

            `#haldo-app-${APP_ID}`,

            "#haldo-settings-app",

            ".haldo-settings-app"

        ];


        for (
            const selector of selectors
        ) {

            try {

                const element =
                    document.querySelector(
                        selector
                    );


                if (element) {

                    return element;

                }

            } catch (_) {}

        }


        return null;

    }


    function mount(
        options = {}
    ) {

        const container =
            resolveContainer(
                options
            );


        if (!container) {

            return false;

        }


        state.container =
            container;


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
            state.container
        ) {

            state.container.innerHTML =
                "";

        }


        state.container =
            null;

        state.mounted =
            false;


        emit(
            "unmounted"
        );


        return true;

    }


    /* ========================================================
       17 — DIAGNOSTICS
       ======================================================== */

    function runDiagnostics() {

        const appManager =
            getAppManager();


        let result = null;


        try {

            if (
                appManager &&
                hasMethod(
                    appManager,
                    "diagnostics"
                )
            ) {

                result =
                    appManager.diagnostics();

            } else {

                result = {

                    settings:
                        true,

                    appManager:
                        !!appManager,

                    kernel:
                        !!getKernel(),

                    system:
                        !!getSystem(),

                    registry:
                        !!getRegistry(),

                    storage:
                        !!getStorage(),

                    language:
                        !!getLanguage(),

                    voice:
                        !!getVoice(),

                    ai:
                        !!getAI(),

                    keyboard:
                        !!getKeyboard()

                };

            }

        } catch (error) {

            reportError(
                error,
                "Settings Diagnostics"
            );

            result = {

                healthy:
                    false,

                error:
                    error.message

            };

        }


        emit(
            "diagnostics",
            {
                result
            }
        );


        const notifications =
            getNotifications();


        if (
            notifications &&
            hasMethod(
                notifications,
                "notify"
            )
        ) {

            try {

                notifications.notify(
                    {
                        title:
                            "HalDo Systemdiagnose",

                        message:
                            "Die Systemdiagnose wurde ausgeführt.",

                        type:
                            "system"

                    }
                );

            } catch (_) {}

        }


        return result;

    }


    /* ========================================================
       18 — APP LIFECYCLE
       ======================================================== */

    async function initialize(
        context = {}
    ) {

        if (
            state.initialized
        ) {

            return true;

        }


        try {

            await loadSettings();

            state.initialized =
                true;


            applyAllSettings();


            emit(
                "initialized",
                {
                    context
                }
            );


            return true;

        } catch (error) {

            reportError(
                error,
                "Settings Initialize"
            );


            return false;

        }

    }


    async function open(
        options = {}
    ) {

        await initialize(
            options
        );


        state.opened =
            true;

        state.active =
            true;


        state.statistics.opens +=
            1;


        if (
            options.section
        ) {

            navigate(
                options.section
            );

        }


        mount(
            options
        );


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

            section:
                state.currentSection

        };

    }


    async function activate() {

        state.active =
            true;


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


    async function minimize() {

        emit(
            "minimized"
        );


        return true;

    }


    async function restore() {

        state.active =
            true;


        emit(
            "restored"
        );


        return true;

    }


    async function close() {

        unmount();


        state.opened =
            false;

        state.active =
            false;


        state.statistics.closes +=
            1;


        emit(
            "closed"
        );


        return true;

    }


    async function start(
        context = {}
    ) {

        await initialize(
            context
        );


        state.ready =
            true;


        emit(
            "started"
        );


        return true;

    }


    async function stop() {

        state.active =
            false;

        state.opened =
            false;


        emit(
            "stopped"
        );


        return true;

    }


    /* ========================================================
       19 — APP DEFINITION
       ======================================================== */

    const definition = {

        id:
            APP_ID,

        name:
            APP_NAME,

        title:
            APP_TITLE,

        description:
            "Zentrale Einstellungs- und Systemverwaltungs-App von HalDo AI OS 20.",

        version:
            VERSION,

        category:
            "system",

        icon:
            "⚙",

        enabled:
            true,

        visible:
            true,

        singleton:
            true,

        route:
            "settings",

        permissions: [

            "system.settings",

            "storage.local",

            "language.manage",

            "voice.manage",

            "ai.manage",

            "keyboard.manage"

        ],

        dependencies: [],

        tags: [

            "settings",

            "system",

            "configuration",

            "preferences",

            "haldo",

            "ai"

        ],

        keywords: [

            "einstellungen",

            "system",

            "sprache",

            "ai",

            "voice",

            "keyboard",

            "theme",

            "privacy"

        ],

        settings:
            DEFAULT_SETTINGS,

        metadata: {

            systemApp:
                true,

            coreApp:
                true,

            central:
                true,

            homeIntegrated:
                true,

            internalNavigation:
                true

        },


        init:
            initialize,

        start:
            start,

        open:
            open,

        activate:
            activate,

        deactivate:
            deactivate,

        minimize:
            minimize,

        restore:
            restore,

        close:
            close,

        stop:
            stop

    };


    /* ========================================================
       20 — PUBLIC API
       ======================================================== */

    const api = {

        __haldoAI20Settings:
            true,

        version:
            VERSION,

        id:
            APP_ID,

        name:
            APP_NAME,

        title:
            APP_TITLE,

        definition,


        /* Lifecycle */

        initialize,

        start,

        open,

        activate,

        deactivate,

        minimize,

        restore,

        close,

        stop,


        /* UI */

        mount,

        unmount,

        render,

        navigate,

        getCurrentSection,


        /* Settings */

        getSetting,

        setSetting,

        getSettings() {

            return clone(
                state.settings
            );

        },

        saveSettings,

        loadSettings,

        resetSettings,


        /* Integration */

        applySetting,

        applyAllSettings,


        /* Diagnostics */

        runDiagnostics,


        /* Events */

        on,

        off,

        emit,


        /* State */

        getState() {

            return {

                initialized:
                    state.initialized,

                ready:
                    state.ready,

                opened:
                    state.opened,

                active:
                    state.active,

                mounted:
                    state.mounted,

                currentSection:
                    state.currentSection,

                dirty:
                    state.dirty,

                settings:
                    clone(
                        state.settings
                    ),

                statistics:
                    {
                        ...state.statistics
                    }

            };

        },


        /* Metadata */

        getDefinition() {

            return clone(
                definition
            );

        }

    };


    /* ========================================================
       21 — GLOBAL REGISTRATION
       ======================================================== */

    window.HalDoSettingsApp =
        api;

    HalDoOS.settingsApp =
        api;


    /* ========================================================
       22 — REGISTRY REGISTRATION
       ======================================================== */

    function registerWithRegistry() {

        const registry =
            getRegistry();


        if (
            !registry ||
            !hasMethod(
                registry,
                "register"
            )
        ) {

            return false;

        }


        try {

            registry.register(
                definition
            );


            emit(
                "registered"
            );


            return true;

        } catch (error) {

            reportError(
                error,
                "Settings Registry Registration"
            );


            return false;

        }

    }


    /* ========================================================
       23 — APP MANAGER REGISTRATION
       ======================================================== */

    function registerWithAppManager() {

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


            emit(
                "manager-registered"
            );


            return true;

        } catch (error) {

            reportError(
                error,
                "Settings App Manager Registration"
            );


            return false;

        }

    }


    /* ========================================================
       24 — BOOTSTRAP
       ======================================================== */

    function bootstrap() {

        try {

            registerWithRegistry();

            registerWithAppManager();


            const kernel =
                getKernel();


            if (
                kernel &&
                hasMethod(
                    kernel,
                    "registerModule"
                )
            ) {

                try {

                    kernel.registerModule(
                        "settings-app",
                        api
                    );

                } catch (_) {}

            }


            if (
                kernel &&
                hasMethod(
                    kernel,
                    "setModuleReady"
                )
            ) {

                try {

                    kernel.setModuleReady(
                        "settings-app",
                        true
                    );

                } catch (_) {}

            }


            emit(
                "ready",
                {
                    version:
                        VERSION
                }
            );


            console.log(
                "[HalDo Settings] " +
                "Settings App 20.0.0 bereit."
            );


        } catch (error) {

            reportError(
                error,
                "Settings Bootstrap"
            );

        }

    }


    /* ========================================================
       25 — DOM BOOT
       ======================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            bootstrap,
            {
                once:
                    true
            }
        );

    } else {

        bootstrap();

    }


    /* ========================================================
       END
       HALDO AI OS 20
       SETTINGS APPLICATION
       ============================================================ */

})(window, document);