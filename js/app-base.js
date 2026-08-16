/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
       js/app-base.js

   HALDO APP RUNTIME BASE

   Diese Datei ist die gemeinsame Laufzeitbasis für ALLE
   HalDo AI OS 20 Apps.

   VERBINDUNGEN:
   - app-contract.js
   - app-manager.js
   - app-registry.js
   - app-router.js
   - window-manager.js
   - kernel.js
   - system.js
   - storage.js
   - storage-manager.js
   - config-manager.js
   - ai-core.js
   - ai-engine.js
   - ai-chat.js
   - ai-language.js
   - ai-speech.js
   - ai-voice.js
   - language-manager.js
   - language-system.js
   - voice.js

   FUNKTIONEN:
   - App Lifecycle
   - State Management
   - Events
   - Settings
   - Storage
   - UI Mounting
   - Navigation
   - AI-Verbindung
   - Sprache
   - Voice
   - Window Management
   - Router
   - Permissions
   - Dependencies
   - Diagnostics
   - Fehlerbehandlung
   - sichere Erweiterbarkeit

   ============================================================ */

"use strict";

(function (window, document) {

    /* ========================================================
       01 — HALDO FOUNDATION
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;


    /* ========================================================
       02 — META
       ======================================================== */

    const VERSION =
        "20.0.0";

    const MODULE_ID =
        "app-base";

    const NAME =
        "HalDo AI OS 20 Application Base Runtime";


    /* ========================================================
       03 — INTERNAL STATE
       ======================================================== */

    const runtime = {

        initialized:
            false,

        ready:
            false,

        apps:
            new Map(),

        listeners:
            new Map(),

        containers:
            new Map(),

        navigation:
            new Map(),

        storage:
            new Map(),

        settings:
            new Map(),

        statistics: {

            created:
                0,

            initialized:
                0,

            started:
                0,

            opened:
                0,

            activated:
                0,

            deactivated:
                0,

            minimized:
                0,

            restored:
                0,

            stopped:
                0,

            closed:
                0,

            errors:
                0

        }

    };


    /* ========================================================
       04 — LOGGING
       ======================================================== */

    function log() {

        try {

            console.log(
                "[HalDo App Base]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo App Base]",
                ...arguments
            );

        } catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo App Base]",
                ...arguments
            );

        } catch (_) {}

    }


    /* ========================================================
       05 — HELPERS
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


    function normalizeId(
        value
    ) {

        return String(
            value || ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9äöüßîêç_-]+/gi,
            "-"
        )
        .replace(
            /-+/g,
            "-"
        )
        .replace(
            /^-|-$/g,
            "");

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
                        typeof value[key] ===
                        "function"
                            ? value[key]
                            : clone(
                                value[key]
                            );

                }
            );

            return result;

        }


        return value;

    }


    function now() {

        return Date.now();

    }


    /* ========================================================
       06 — SERVICE LOOKUPS
       ======================================================== */

    function getContract() {

        return (
            window.HalDoAppContract ||
            window.HalDoOSAppContract ||
            HalDoOS.appContract ||
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


    function getStorageManager() {

        return (
            window.HalDoStorageManager ||
            HalDoOS.storageManager ||
            null
        );

    }


    function getConfigManager() {

        return (
            window.HalDoConfigManager ||
            HalDoOS.configManager ||
            null
        );

    }


    function getAI() {

        return (
            window.HalDoAI ||
            window.HalDoAICore ||
            HalDoOS.ai ||
            HalDoOS.aiCore ||
            null
        );

    }


    function getAIEngine() {

        return (
            window.HalDoAIEngine ||
            HalDoOS.aiEngine ||
            null
        );

    }


    function getAIChat() {

        return (
            window.HalDoAIChat ||
            HalDoOS.aiChat ||
            null
        );

    }


    function getLanguage() {

        return (
            window.HalDoLanguageManager ||
            window.HalDoLanguageSystem ||
            HalDoOS.languageManager ||
            HalDoOS.languageSystem ||
            null
        );

    }


    function getVoice() {

        return (
            window.HalDoVoice ||
            window.HalDoAIVoice ||
            HalDoOS.voice ||
            HalDoOS.aiVoice ||
            null
        );

    }


    /* ========================================================
       07 — EVENTS
       ======================================================== */

    function on(
        appId,
        event,
        callback
    ) {

        const id =
            normalizeId(
                appId
            );


        if (
            typeof callback !==
            "function"
        ) {

            return function () {};

        }


        if (
            !runtime.listeners.has(
                id
            )
        ) {

            runtime.listeners.set(
                id,
                new Map()
            );

        }


        const events =
            runtime.listeners.get(
                id
            );


        if (
            !events.has(
                event
            )
        ) {

            events.set(
                event,
                new Set()
            );

        }


        const callbacks =
            events.get(
                event
            );


        callbacks.add(
            callback
        );


        return function () {

            off(
                id,
                event,
                callback
            );

        };

    }


    function off(
        appId,
        event,
        callback
    ) {

        const id =
            normalizeId(
                appId
            );


        const events =
            runtime.listeners.get(
                id
            );


        if (!events) {

            return;

        }


        const callbacks =
            events.get(
                event
            );


        if (!callbacks) {

            return;

        }


        callbacks.delete(
            callback
        );


        if (
            callbacks.size ===
            0
        ) {

            events.delete(
                event
            );

        }

    }


    function emit(
        appId,
        event,
        data = null
    ) {

        const id =
            normalizeId(
                appId
            );


        const events =
            runtime.listeners.get(
                id
            );


        if (events) {

            const callbacks =
                events.get(
                    event
                );


            if (callbacks) {

                Array.from(
                    callbacks
                ).forEach(
                    callback => {

                        try {

                            callback(
                                data
                            );

                        } catch (exception) {

                            reportError(
                                exception,
                                id +
                                ":event:" +
                                event
                            );

                        }

                    }
                );

            }

        }


        const globalEvents =
            HalDoOS.events;


        if (
            globalEvents &&
            hasMethod(
                globalEvents,
                "emit"
            )
        ) {

            try {

                globalEvents.emit(
                    "app:" +
                    id +
                    ":" +
                    event,
                    data
                );

            } catch (_) {}

        }


        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "emit"
            )
        ) {

            try {

                manager.emit(
                    "app:" +
                    id +
                    ":" +
                    event,
                    data
                );

            } catch (_) {}

        }

    }


    /* ========================================================
       08 — ERROR HANDLING
       ======================================================== */

    function reportError(
        exception,
        context = "Application"
    ) {

        runtime.statistics.errors +=
            1;


        const normalized =
            exception instanceof Error
                ? exception
                : new Error(
                    String(
                        exception
                    )
                );


        const record = {

            name:
                normalized.name,

            message:
                normalized.message,

            stack:
                normalized.stack ||
                "",

            context,

            timestamp:
                new Date().toISOString()

        };


        errorLog(
            "[HalDo App Base]",
            record
        );


        return record;

    }


    /* ========================================================
       09 — APP RECORD
       ======================================================== */

    function createRecord(
        definition
    ) {

        if (
            !definition ||
            !definition.id
        ) {

            throw new Error(
                "Eine App benötigt eine gültige ID."
            );

        }


        const id =
            normalizeId(
                definition.id
            );


        if (!id) {

            throw new Error(
                "Ungültige App-ID."
            );

        }


        if (
            runtime.apps.has(
                id
            )
        ) {

            return runtime.apps.get(
                id
            );

        }


        const record = {

            id,

            definition,

            state: {

                status:
                    "created",

                initialized:
                    false,

                started:
                    false,

                open:
                    false,

                active:
                    false,

                minimized:
                    false,

                maximized:
                    false,

                pip:
                    false,

                error:
                    null,

                createdAt:
                    now(),

                updatedAt:
                    now()

            },

            settings:
                {},

            data:
                {},

            container:
                null,

            window:
                null,

            route:
                null

        };


        runtime.apps.set(
            id,
            record
        );


        runtime.statistics.created +=
            1;


        return record;

    }


    /* ========================================================
       10 — GET APP RECORD
       ======================================================== */

    function getRecord(
        appId
    ) {

        return (
            runtime.apps.get(
                normalizeId(
                    appId
                )
            ) ||
            null
        );

    }


    /* ========================================================
       11 — APP REGISTRATION
       ======================================================== */

    function register(
        definition
    ) {

        try {

            const manager =
                getAppManager();


            let app =
                definition;


            /*
             * Wenn der App Manager bereits
             * registriert, benutzen wir ihn.
             */

            if (
                manager &&
                hasMethod(
                    manager,
                    "registerApp"
                )
            ) {

                const registered =
                    manager.registerApp(
                        definition
                    );


                if (registered) {

                    app =
                        registered;

                }

            } else {

                const registry =
                    getRegistry();


                if (
                    registry &&
                    hasMethod(
                        registry,
                        "register"
                    )
                ) {

                    const registered =
                        registry.register(
                            definition
                        );


                    if (registered) {

                        app =
                            registered;

                    }

                }

            }


            const record =
                createRecord(
                    app
                );


            emit(
                record.id,
                "registered",
                {
                    app:
                        app
                }
            );


            return record;

        } catch (exception) {

            reportError(
                exception,
                "App Registrierung"
            );


            return null;

        }

    }


    /* ========================================================
       12 — STATE
       ======================================================== */

    function getState(
        appId
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return null;

        }


        return clone(
            record.state
        );

    }


    function setState(
        appId,
        changes
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return null;

        }


        Object.assign(
            record.state,
            changes || {},
            {
                updatedAt:
                    now()
            }
        );


        emit(
            record.id,
            "state-changed",
            {
                state:
                    clone(
                        record.state
                    )
            }
        );


        return getState(
            record.id
        );

    }


    /* ========================================================
       13 — SETTINGS
       ======================================================== */

    function settingsKey(
        appId
    ) {

        return (
            "haldo.app20.settings." +
            normalizeId(
                appId
            )
        );

    }


    function loadSettings(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const record =
            getRecord(
                id
            );


        if (!record) {

            return {};

        }


        try {

            const manager =
                getAppManager();


            if (
                manager &&
                hasMethod(
                    manager,
                    "loadAppSettings"
                )
            ) {

                record.settings =
                    manager.loadAppSettings(
                        id
                    ) || {};

                return clone(
                    record.settings
                );

            }


            const raw =
                window.localStorage.getItem(
                    settingsKey(
                        id
                    )
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

                    record.settings =
                        parsed;

                }

            }

        } catch (exception) {

            reportError(
                exception,
                "Settings laden: " +
                id
            );

        }


        return clone(
            record.settings
        );

    }


    function getSettings(
        appId
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return {};

        }


        if (
            !record.settings ||
            typeof record.settings !==
            "object"
        ) {

            record.settings =
                {};

        }


        return clone(
            record.settings
        );

    }


    function setSettings(
        appId,
        changes
    ) {

        const id =
            normalizeId(
                appId
            );


        const record =
            getRecord(
                id
            );


        if (!record) {

            return null;

        }


        record.settings = {

            ...record.settings,

            ...(changes || {})

        };


        try {

            const manager =
                getAppManager();


            if (
                manager &&
                hasMethod(
                    manager,
                    "setSettings"
                )
            ) {

                manager.setSettings(
                    id,
                    record.settings
                );

            } else {

                window.localStorage.setItem(
                    settingsKey(
                        id
                    ),
                    JSON.stringify(
                        record.settings
                    )
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "Settings speichern: " +
                id
            );

        }


        emit(
            id,
            "settings-changed",
            {
                settings:
                    clone(
                        record.settings
                    )
            }
        );


        return getSettings(
            id
        );

    }


    /* ========================================================
       14 — APP STORAGE
       ======================================================== */

    function storageKey(
        appId,
        key
    ) {

        return (
            "haldo.app20.data." +
            normalizeId(
                appId
            ) +
            "." +
            String(
                key
            )
        );

    }


    function storageSet(
        appId,
        key,
        value
    ) {

        const id =
            normalizeId(
                appId
            );


        const record =
            getRecord(
                id
            );


        if (!record) {

            return false;

        }


        try {

            const storage =
                getStorage();


            if (
                storage &&
                hasMethod(
                    storage,
                    "set"
                )
            ) {

                storage.set(
                    storageKey(
                        id,
                        key
                    ),
                    value
                );

            } else {

                window.localStorage.setItem(
                    storageKey(
                        id,
                        key
                    ),
                    JSON.stringify(
                        value
                    )
                );

            }


            if (
                !runtime.storage.has(
                    id
                )
            ) {

                runtime.storage.set(
                    id,
                    new Map()
                );

            }


            runtime.storage
                .get(id)
                .set(
                    String(key),
                    value
                );


            emit(
                id,
                "storage-changed",
                {
                    key:
                        key,

                    value:
                        clone(
                            value
                        )
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Storage speichern"
            );


            return false;

        }

    }


    function storageGet(
        appId,
        key,
        fallback = null
    ) {

        const id =
            normalizeId(
                appId
            );


        try {

            const storage =
                getStorage();


            if (
                storage &&
                hasMethod(
                    storage,
                    "get"
                )
            ) {

                const result =
                    storage.get(
                        storageKey(
                            id,
                            key
                        )
                    );


                return result ===
                    undefined
                    ? fallback
                    : result;

            }


            const raw =
                window.localStorage.getItem(
                    storageKey(
                        id,
                        key
                    )
                );


            if (
                raw === null
            ) {

                return fallback;

            }


            try {

                return JSON.parse(
                    raw
                );

            } catch (_) {

                return raw;

            }

        } catch (exception) {

            reportError(
                exception,
                "Storage laden"
            );


            return fallback;

        }

    }


    function storageRemove(
        appId,
        key
    ) {

        const id =
            normalizeId(
                appId
            );


        try {

            const storage =
                getStorage();


            if (
                storage &&
                hasMethod(
                    storage,
                    "remove"
                )
            ) {

                storage.remove(
                    storageKey(
                        id,
                        key
                    )
                );

            } else {

                window.localStorage.removeItem(
                    storageKey(
                        id,
                        key
                    )
                );

            }


            if (
                runtime.storage.has(
                    id
                )
            ) {

                runtime.storage
                    .get(id)
                    .delete(
                        String(key)
                    );

            }


            emit(
                id,
                "storage-removed",
                {
                    key:
                        key
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Storage entfernen"
            );


            return false;

        }

    }


    function storageClear(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        try {

            const storage =
                getStorage();


            if (
                storage &&
                hasMethod(
                    storage,
                    "clear"
                )
            ) {

                storage.clear(
                    id
                );

            } else {

                const prefix =
                    "haldo.app20.data." +
                    id +
                    ".";


                const keys = [];

                for (
                    let index = 0;
                    index <
                    window.localStorage.length;
                    index++
                ) {

                    const key =
                        window.localStorage.key(
                            index
                        );


                    if (
                        key &&
                        key.indexOf(
                            prefix
                        ) === 0
                    ) {

                        keys.push(
                            key
                        );

                    }

                }


                keys.forEach(
                    key => {

                        window.localStorage.removeItem(
                            key
                        );

                    }
                );

            }


            runtime.storage.delete(
                id
            );


            emit(
                id,
                "storage-cleared"
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Storage löschen"
            );


            return false;

        }

    }


    /* ========================================================
       15 — UI
       ======================================================== */

    function createContainer(
        appId,
        options = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        let container =
            runtime.containers.get(
                id
            );


        if (
            container &&
            document.contains(
                container
            )
        ) {

            return container;

        }


        container =
            document.createElement(
                "section"
            );


        container.className =
            options.className ||
            "haldo-app-container";


        container.dataset.haldoApp =
            id;


        container.dataset.appVersion =
            VERSION;


        container.setAttribute(
            "role",
            "application"
        );


        container.setAttribute(
            "aria-label",
            options.label ||
            id
        );


        if (
            options.hidden ===
            true
        ) {

            container.hidden =
                true;

        }


        const parent =
            options.parent ||
            document.querySelector(
                "#haldo-app-root"
            ) ||
            document.querySelector(
                "#app-root"
            ) ||
            document.body;


        parent.appendChild(
            container
        );


        runtime.containers.set(
            id,
            container
        );


        const record =
            getRecord(
                id
            );


        if (record) {

            record.container =
                container;

        }


        emit(
            id,
            "ui-created",
            {
                container:
                    container
            }
        );


        return container;

    }


    function getContainer(
        appId
    ) {

        return (
            runtime.containers.get(
                normalizeId(
                    appId
                )
            ) ||
            null
        );

    }


    function mount(
        appId,
        element,
        options = {}
    ) {

        const container =
            createContainer(
                appId,
                options
            );


        if (!element) {

            return container;

        }


        if (
            typeof element ===
            "string"
        ) {

            container.innerHTML =
                element;

        } else if (
            element instanceof
            Node
        ) {

            container.replaceChildren(
                element
            );

        }


        emit(
            appId,
            "ui-mounted",
            {
                container:
                    container
            }
        );


        return container;

    }


    function unmount(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const container =
            runtime.containers.get(
                id
            );


        if (!container) {

            return false;

        }


        try {

            container.remove();

        } catch (_) {}


        runtime.containers.delete(
            id
        );


        const record =
            getRecord(
                id
            );


        if (record) {

            record.container =
                null;

        }


        emit(
            id,
            "ui-unmounted"
        );


        return true;

    }


    /* ========================================================
       16 — NAVIGATION
       ======================================================== */

    function navigate(
        appId,
        route,
        options = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        const router =
            getRouter();


        try {

            if (
                router &&
                hasMethod(
                    router,
                    "navigate"
                )
            ) {

                router.navigate(
                    route,
                    {
                        appId:
                            id,

                        source:
                            "app-base",

                        ...options
                    }
                );

            } else if (
                router &&
                hasMethod(
                    router,
                    "open"
                )
            ) {

                router.open(
                    id,
                    {
                        route:
                            route,

                        ...options
                    }
                );

            } else {

                if (
                    typeof route ===
                    "string"
                ) {

                    window.history.pushState(
                        {
                            appId:
                                id
                        },
                        "",
                        route
                    );

                }

            }


            runtime.navigation.set(
                id,
                route
            );


            const record =
                getRecord(
                    id
                );


            if (record) {

                record.route =
                    route;

            }


            emit(
                id,
                "navigate",
                {
                    route:
                        route,

                    options:
                        options
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Navigation"
            );


            return false;

        }

    }


    function getRoute(
        appId
    ) {

        return (
            runtime.navigation.get(
                normalizeId(
                    appId
                )
            ) ||
            null
        );

    }


    /* ========================================================
       17 — WINDOW
       ======================================================== */

    function openWindow(
        appId,
        options = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        const manager =
            getWindowManager();


        const record =
            getRecord(
                id
            );


        if (!record) {

            return null;

        }


        try {

            let result =
                null;


            const config = {

                id:
                    "window-" +
                    id,

                appId:
                    id,

                title:
                    options.title ||
                    record.definition.title ||
                    record.definition.name ||
                    id,

                icon:
                    options.icon ||
                    record.definition.icon ||
                    "◈",

                ...options

            };


            if (
                manager &&
                hasMethod(
                    manager,
                    "open"
                )
            ) {

                result =
                    manager.open(
                        config
                    );

            } else if (
                manager &&
                hasMethod(
                    manager,
                    "createWindow"
                )
            ) {

                result =
                    manager.createWindow(
                        config
                    );

            }


            record.window =
                result;


            emit(
                id,
                "window-opened",
                {
                    window:
                        result
                }
            );


            return result;

        } catch (exception) {

            reportError(
                exception,
                "Window öffnen"
            );


            return null;

        }

    }


    function focusWindow(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const record =
            getRecord(
                id
            );


        const manager =
            getWindowManager();


        if (
            !record ||
            !manager
        ) {

            return false;

        }


        const windowId =
            record.state.windowId ||
            (
                record.window &&
                (
                    record.window.id ||
                    record.window.windowId
                )
            );


        if (
            windowId &&
            hasMethod(
                manager,
                "focus"
            )
        ) {

            try {

                manager.focus(
                    windowId
                );

                return true;

            } catch (exception) {

                reportError(
                    exception,
                    "Window Focus"
                );

            }

        }


        return false;

    }


    /* ========================================================
       18 — AI
       ======================================================== */

    async function askAI(
        appId,
        message,
        options = {}
    ) {

        const ai =
            getAI();


        const engine =
            getAIEngine();


        const chat =
            getAIChat();


        try {

            if (
                ai &&
                hasMethod(
                    ai,
                    "ask"
                )
            ) {

                return await ai.ask(
                    message,
                    {
                        appId:
                            appId,

                        ...options
                    }
                );

            }


            if (
                engine &&
                hasMethod(
                    engine,
                    "generate"
                )
            ) {

                return await engine.generate(
                    message,
                    {
                        appId:
                            appId,

                        ...options
                    }
                );

            }


            if (
                chat &&
                hasMethod(
                    chat,
                    "send"
                )
            ) {

                return await chat.send(
                    message,
                    {
                        appId:
                            appId,

                        ...options
                    }
                );

            }


            return null;

        } catch (exception) {

            reportError(
                exception,
                "AI Anfrage"
            );


            return null;

        }

    }


    /* ========================================================
       19 — LANGUAGE
       ======================================================== */

    function translate(
        key,
        fallback = ""
    ) {

        const language =
            getLanguage();


        try {

            if (
                language &&
                hasMethod(
                    language,
                    "translate"
                )
            ) {

                return language.translate(
                    key,
                    fallback
                );

            }


            if (
                language &&
                hasMethod(
                    language,
                    "t"
                )
            ) {

                const result =
                    language.t(
                        key
                    );


                return result ||
                    fallback ||
                    key;

            }

        } catch (exception) {

            reportError(
                exception,
                "Übersetzung"
            );

        }


        return fallback ||
            key;

    }


    function getCurrentLanguage() {

        const language =
            getLanguage();


        try {

            if (
                language &&
                hasMethod(
                    language,
                    "getCurrentLanguage"
                )
            ) {

                return language.getCurrentLanguage();

            }


            if (
                language &&
                hasMethod(
                    language,
                    "getLanguage"
                )
            ) {

                return language.getLanguage();

            }


            if (
                language &&
                language.currentLanguage
            ) {

                return language.currentLanguage;

            }

        } catch (exception) {

            reportError(
                exception,
                "Aktuelle Sprache"
            );

        }


        return (
            document.documentElement
                .lang ||
            "de"
        );

    }


    /* ========================================================
       20 — VOICE
       ======================================================== */

    async function speak(
        appId,
        text,
        options = {}
    ) {

        const voice =
            getVoice();


        if (!voice) {

            return false;

        }


        try {

            if (
                hasMethod(
                    voice,
                    "speak"
                )
            ) {

                return await voice.speak(
                    text,
                    {
                        appId:
                            appId,

                        ...options
                    }
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "Voice Speak"
            );

        }


        return false;

    }


    async function stopSpeaking() {

        const voice =
            getVoice();


        if (
            voice &&
            hasMethod(
                voice,
                "stop"
            )
        ) {

            try {

                return await voice.stop();

            } catch (exception) {

                reportError(
                    exception,
                    "Voice Stop"
                );

            }

        }


        return false;

    }


    /* ========================================================
       21 — PERMISSIONS
       ======================================================== */

    function checkPermission(
        appId,
        permission
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return false;

        }


        const permissions =
            Array.isArray(
                record.definition
                    .permissions
            )
                ? record.definition
                    .permissions
                : [];


        /*
         * System-Apps dürfen über einen
         * expliziten Systemstatus erweitert
         * werden.
         */

        if (
            record.definition.system ===
            true
        ) {

            return true;

        }


        return permissions.includes(
            permission
        );

    }


    /* ========================================================
       22 — DEPENDENCIES
       ======================================================== */

    function checkDependencies(
        appId
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return {

                valid:
                    false,

                missing:
                    []

            };

        }


        const dependencies =
            Array.isArray(
                record.definition
                    .dependencies
            )
                ? record.definition
                    .dependencies
                : [];


        const missing = [];


        dependencies.forEach(
            dependency => {

                const id =
                    normalizeId(
                        dependency
                    );


                const manager =
                    getAppManager();


                let exists =
                    false;


                if (
                    manager &&
                    hasMethod(
                        manager,
                        "has"
                    )
                ) {

                    exists =
                        manager.has(
                            id
                        );

                } else {

                    const registry =
                        getRegistry();


                    if (
                        registry &&
                        hasMethod(
                            registry,
                            "has"
                        )
                    ) {

                        exists =
                            registry.has(
                                id
                            );

                    }

                }


                if (!exists) {

                    missing.push(
                        id
                    );

                }

            }
        );


        return {

            valid:
                missing.length ===
                0,

            missing:
                missing

        };

    }


    /* ========================================================
       23 — LIFECYCLE: INIT
       ======================================================== */

    async function initialize(
        appId,
        options = {}
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return false;

        }


        if (
            record.state.initialized
        ) {

            return true;

        }


        try {

            loadSettings(
                record.id
            );


            const dependencies =
                checkDependencies(
                    record.id
                );


            if (
                !dependencies.valid &&
                options.ignoreDependencies !==
                true
            ) {

                throw new Error(
                    "Fehlende App-Dependencies: " +
                    dependencies.missing.join(
                        ", "
                    )
                );

            }


            if (
                typeof record.definition
                    .init ===
                "function"
            ) {

                await record.definition
                    .init(
                        createContext(
                            record.id
                        )
                    );

            }


            record.state.initialized =
                true;

            record.state.status =
                "initialized";

            record.state.updatedAt =
                now();


            runtime.statistics
                .initialized +=
                1;


            emit(
                record.id,
                "initialized",
                {
                    app:
                        record.definition
                }
            );


            return true;

        } catch (exception) {

            record.state.status =
                "error";

            record.state.error =
                reportError(
                    exception,
                    "App Init: " +
                    record.id
                );


            return false;

        }

    }


    /* ========================================================
       24 — LIFECYCLE: START
       ======================================================== */

    async function start(
        appId,
        options = {}
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return false;

        }


        if (
            !record.state.initialized
        ) {

            const initialized =
                await initialize(
                    record.id,
                    options
                );


            if (!initialized) {

                return false;

            }

        }


        if (
            record.state.started
        ) {

            return true;

        }


        try {

            if (
                typeof record.definition
                    .start ===
                "function"
            ) {

                await record.definition
                    .start(
                        createContext(
                            record.id
                        )
                    );

            }


            record.state.started =
                true;

            record.state.status =
                "running";

            record.state.updatedAt =
                now();


            runtime.statistics
                .started +=
                1;


            emit(
                record.id,
                "started"
            );


            return true;

        } catch (exception) {

            record.state.status =
                "error";

            record.state.error =
                reportError(
                    exception,
                    "App Start: " +
                    record.id
                );


            return false;

        }

    }


    /* ========================================================
       25 — LIFECYCLE: OPEN
       ======================================================== */

    async function open(
        appId,
        options = {}
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return null;

        }


        const manager =
            getAppManager();


        /*
         * Der zentrale App Manager bleibt
         * Besitzer des eigentlichen Open-
         * Vorgangs.
         */

        if (
            manager &&
            hasMethod(
                manager,
                "open"
            )
        ) {

            const result =
                await manager.open(
                    record.id,
                    options
                );


            if (result) {

                record.state.open =
                    true;

                record.state.active =
                    true;

                record.state.status =
                    "open";

                record.state.updatedAt =
                    now();


                if (
                    result.window
                ) {

                    record.window =
                        result.window;

                    record.state.windowId =
                        result.window.id ||
                        result.window.windowId ||
                        null;

                }


                runtime.statistics
                    .opened +=
                    1;

            }


            return result;

        }


        /*
         * Fallback, falls App Manager
         * beim Laden der App noch nicht
         * verfügbar ist.
         */

        const started =
            await start(
                record.id,
                options
            );


        if (!started) {

            return null;

        }


        const window =
            openWindow(
                record.id,
                options
            );


        record.state.open =
            true;

        record.state.active =
            true;

        record.state.status =
            "open";

        record.state.windowId =
            window &&
            (
                window.id ||
                window.windowId
            ) ||
            null;


        runtime.statistics
            .opened +=
            1;


        return {

            app:
                record.definition,

            window:
                window,

            state:
                getState(
                    record.id
                )

        };

    }


    /* ========================================================
       26 — LIFECYCLE: ACTIVATE
       ======================================================== */

    async function activate(
        appId
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return false;

        }


        try {

            const manager =
                getAppManager();


            if (
                manager &&
                hasMethod(
                    manager,
                    "activate"
                )
            ) {

                const result =
                    await manager.activate(
                        record.id
                    );


                if (!result) {

                    return false;

                }

            } else {

                focusWindow(
                    record.id
                );

            }


            if (
                typeof record.definition
                    .onActivate ===
                "function"
            ) {

                await record.definition
                    .onActivate(
                        createContext(
                            record.id
                        )
                    );

            }


            record.state.active =
                true;

            record.state.minimized =
                false;

            record.state.updatedAt =
                now();


            runtime.statistics
                .activated +=
                1;


            emit(
                record.id,
                "activated"
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Activate: " +
                record.id
            );


            return false;

        }

    }


    /* ========================================================
       27 — LIFECYCLE: DEACTIVATE
       ======================================================== */

    async function deactivate(
        appId
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return false;

        }


        try {

            if (
                typeof record.definition
                    .onDeactivate ===
                "function"
            ) {

                await record.definition
                    .onDeactivate(
                        createContext(
                            record.id
                        )
                    );

            }


            const manager =
                getAppManager();


            if (
                manager &&
                hasMethod(
                    manager,
                    "deactivate"
                )
            ) {

                await manager.deactivate(
                    record.id
                );

            }


            record.state.active =
                false;

            record.state.updatedAt =
                now();


            runtime.statistics
                .deactivated +=
                1;


            emit(
                record.id,
                "deactivated"
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Deactivate"
            );


            return false;

        }

    }


    /* ========================================================
       28 — LIFECYCLE: MINIMIZE
       ======================================================== */

    async function minimize(
        appId
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return false;

        }


        try {

            const manager =
                getAppManager();


            if (
                manager &&
                hasMethod(
                    manager,
                    "minimize"
                )
            ) {

                await manager.minimize(
                    record.id
                );

            }


            if (
                typeof record.definition
                    .minimize ===
                "function"
            ) {

                await record.definition
                    .minimize(
                        createContext(
                            record.id
                        )
                    );

            }


            record.state.minimized =
                true;

            record.state.active =
                false;

            record.state.updatedAt =
                now();


            runtime.statistics
                .minimized +=
                1;


            emit(
                record.id,
                "minimized"
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Minimize"
            );


            return false;

        }

    }


    /* ========================================================
       29 — LIFECYCLE: RESTORE
       ======================================================== */

    async function restore(
        appId
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return false;

        }


        try {

            const manager =
                getAppManager();


            if (
                manager &&
                hasMethod(
                    manager,
                    "restore"
                )
            ) {

                await manager.restore(
                    record.id
                );

            }


            if (
                typeof record.definition
                    .restore ===
                "function"
            ) {

                await record.definition
                    .restore(
                        createContext(
                            record.id
                        )
                    );

            }


            record.state.minimized =
                false;

            record.state.updatedAt =
                now();


            runtime.statistics
                .restored +=
                1;


            emit(
                record.id,
                "restored"
            );


            return activate(
                record.id
            );

        } catch (exception) {

            reportError(
                exception,
                "App Restore"
            );


            return false;

        }

    }


    /* ========================================================
       30 — LIFECYCLE: STOP
       ======================================================== */

    async function stop(
        appId
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return false;

        }


        try {

            if (
                typeof record.definition
                    .stop ===
                "function"
            ) {

                await record.definition
                    .stop(
                        createContext(
                            record.id
                        )
                    );

            }


            const manager =
                getAppManager();


            if (
                manager &&
                hasMethod(
                    manager,
                    "stop"
                )
            ) {

                await manager.stop(
                    record.id
                );

            }


            record.state.started =
                false;

            record.state.status =
                "stopped";

            record.state.updatedAt =
                now();


            runtime.statistics
                .stopped +=
                1;


            emit(
                record.id,
                "stopped"
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Stop"
            );


            return false;

        }

    }


    /* ========================================================
       31 — LIFECYCLE: CLOSE
       ======================================================== */

    async function close(
        appId,
        options = {}
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return false;

        }


        try {

            const manager =
                getAppManager();


            if (
                manager &&
                hasMethod(
                    manager,
                    "close"
                )
            ) {

                await manager.close(
                    record.id,
                    options
                );

            } else {

                const windowManager =
                    getWindowManager();


                const windowId =
                    record.state.windowId ||
                    (
                        record.window &&
                        (
                            record.window.id ||
                            record.window.windowId
                        )
                    );


                if (
                    windowManager &&
                    windowId &&
                    hasMethod(
                        windowManager,
                        "close"
                    )
                ) {

                    windowManager.close(
                        windowId
                    );

                }

            }


            if (
                typeof record.definition
                    .close ===
                "function"
            ) {

                await record.definition
                    .close(
                        createContext(
                            record.id
                        )
                    );

            }


            record.state.open =
                false;

            record.state.active =
                false;

            record.state.minimized =
                false;

            record.state.maximized =
                false;

            record.state.pip =
                false;

            record.state.status =
                "closed";

            record.state.windowId =
                null;

            record.state.updatedAt =
                now();


            record.window =
                null;


            runtime.statistics
                .closed +=
                1;


            emit(
                record.id,
                "closed",
                {
                    options:
                        options
                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Close"
            );


            return false;

        }

    }


    /* ========================================================
       32 — PIP
       ======================================================== */

    async function enablePIP(
        appId
    ) {

        const manager =
            getAppManager();


        try {

            if (
                manager &&
                hasMethod(
                    manager,
                    "enablePIP"
                )
            ) {

                return await manager
                    .enablePIP(
                        appId
                    );

            }


            const record =
                getRecord(
                    appId
                );


            const windowManager =
                getWindowManager();


            const windowId =
                record &&
                record.state.windowId;


            if (
                windowManager &&
                windowId &&
                hasMethod(
                    windowManager,
                    "setPIP"
                )
            ) {

                windowManager.setPIP(
                    windowId,
                    true
                );

            }


            if (record) {

                record.state.pip =
                    true;

            }


            emit(
                appId,
                "pip-enabled"
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "PIP aktivieren"
            );


            return false;

        }

    }


    async function disablePIP(
        appId
    ) {

        const manager =
            getAppManager();


        try {

            if (
                manager &&
                hasMethod(
                    manager,
                    "disablePIP"
                )
            ) {

                return await manager
                    .disablePIP(
                        appId
                    );

            }


            const record =
                getRecord(
                    appId
                );


            const windowManager =
                getWindowManager();


            const windowId =
                record &&
                record.state.windowId;


            if (
                windowManager &&
                windowId &&
                hasMethod(
                    windowManager,
                    "setPIP"
                )
            ) {

                windowManager.setPIP(
                    windowId,
                    false
                );

            }


            if (record) {

                record.state.pip =
                    false;

            }


            emit(
                appId,
                "pip-disabled"
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "PIP deaktivieren"
            );


            return false;

        }

    }


    /* ========================================================
       33 — CONTEXT
       ======================================================== */

    function createContext(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const record =
            getRecord(
                id
            );


        if (!record) {

            return null;

        }


        return {

            app:
                record.definition,

            appId:
                id,

            version:
                VERSION,

            manager:
                getAppManager(),

            contract:
                getContract(),

            registry:
                getRegistry(),

            router:
                getRouter(),

            windowManager:
                getWindowManager(),

            kernel:
                getKernel(),

            system:
                getSystem(),

            storage:
                {

                    get:
                        key =>
                            storageGet(
                                id,
                                key
                            ),

                    set:
                        (
                            key,
                            value
                        ) =>
                            storageSet(
                                id,
                                key,
                                value
                            ),

                    remove:
                        key =>
                            storageRemove(
                                id,
                                key
                            ),

                    clear:
                        () =>
                            storageClear(
                                id
                            )

                },

            settings:
                {

                    get:
                        () =>
                            getSettings(
                                id
                            ),

                    set:
                        changes =>
                            setSettings(
                                id,
                                changes
                            )

                },

            ui:
                {

                    create:
                        options =>
                            createContainer(
                                id,
                                options
                            ),

                    mount:
                        (
                            element,
                            options
                        ) =>
                            mount(
                                id,
                                element,
                                options
                            ),

                    get:
                        () =>
                            getContainer(
                                id
                            ),

                    unmount:
                        () =>
                            unmount(
                                id
                            )

                },

            navigation:
                {

                    go:
                        (
                            route,
                            options
                        ) =>
                            navigate(
                                id,
                                route,
                                options
                            ),

                    current:
                        () =>
                            getRoute(
                                id
                            )

                },

            ai:
                {

                    ask:
                        (
                            message,
                            options
                        ) =>
                            askAI(
                                id,
                                message,
                                options
                            )

                },

            language:
                {

                    translate:
                        translate,

                    current:
                        getCurrentLanguage

                },

            voice:
                {

                    speak:
                        (
                            text,
                            options
                        ) =>
                            speak(
                                id,
                                text,
                                options
                            ),

                    stop:
                        stopSpeaking

                },

            permissions:
                {

                    has:
                        permission =>
                            checkPermission(
                                id,
                                permission
                            )

                },

            dependencies:
                {

                    check:
                        () =>
                            checkDependencies(
                                id
                            )

                },

            window:
                {

                    open:
                        options =>
                            openWindow(
                                id,
                                options
                            ),

                    focus:
                        () =>
                            focusWindow(
                                id
                            )

                },

            state:
                {

                    get:
                        () =>
                            getState(
                                id
                            ),

                    set:
                        changes =>
                            setState(
                                id,
                                changes
                            )

                },

            events:
                {

                    on:
                        (
                            event,
                            callback
                        ) =>
                            on(
                                id,
                                event,
                                callback
                            ),

                    off:
                        (
                            event,
                            callback
                        ) =>
                            off(
                                id,
                                event,
                                callback
                            ),

                    emit:
                        (
                            event,
                            data
                        ) =>
                            emit(
                                id,
                                event,
                                data
                            )

                },

            lifecycle:
                {

                    initialize:
                        () =>
                            initialize(
                                id
                            ),

                    start:
                        () =>
                            start(
                                id
                            ),

                    open:
                        options =>
                            open(
                                id,
                                options
                            ),

                    activate:
                        () =>
                            activate(
                                id
                            ),

                    deactivate:
                        () =>
                            deactivate(
                                id
                            ),

                    minimize:
                        () =>
                            minimize(
                                id
                            ),

                    restore:
                        () =>
                            restore(
                                id
                            ),

                    stop:
                        () =>
                            stop(
                                id
                            ),

                    close:
                        options =>
                            close(
                                id,
                                options
                            )

                },

            pip:
                {

                    enable:
                        () =>
                            enablePIP(
                                id
                            ),

                    disable:
                        () =>
                            disablePIP(
                                id
                            )

                },

            diagnostics:
                () =>
                    getAppDiagnostics(
                        id
                    )

        };

    }


    /* ========================================================
       34 — APP DIAGNOSTICS
       ======================================================== */

    function getAppDiagnostics(
        appId
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return {

                exists:
                    false,

                appId:
                    normalizeId(
                        appId
                    )

            };

        }


        return {

            exists:
                true,

            id:
                record.id,

            name:
                record.definition.name ||
                "",

            title:
                record.definition.title ||
                "",

            version:
                record.definition.version ||
                VERSION,

            state:
                clone(
                    record.state
                ),

            settings:
                clone(
                    record.settings
                ),

            dependencies:
                checkDependencies(
                    record.id
                ),

            permissions:
                Array.isArray(
                    record.definition
                        .permissions
                )
                    ? [
                        ...record.definition
                            .permissions
                    ]
                    : [],

            uiMounted:
                !!(
                    record.container &&
                    document.contains(
                        record.container
                    )
                ),

            window:
                !!record.window,

            route:
                record.route,

            services: {

                contract:
                    !!getContract(),

                appManager:
                    !!getAppManager(),

                registry:
                    !!getRegistry(),

                router:
                    !!getRouter(),

                windowManager:
                    !!getWindowManager(),

                kernel:
                    !!getKernel(),

                system:
                    !!getSystem(),

                storage:
                    !!getStorage(),

                ai:
                    !!getAI(),

                language:
                    !!getLanguage(),

                voice:
                    !!getVoice()

            },

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       35 — CREATE APP
       ======================================================== */

    function createApp(
        definition
    ) {

        const record =
            register(
                definition
            );


        if (!record) {

            return null;

        }


        const context =
            createContext(
                record.id
            );


        const app = {

            id:
                record.id,

            definition:
                record.definition,

            context:
                context,

            getState:
                () =>
                    getState(
                        record.id
                    ),

            setState:
                changes =>
                    setState(
                        record.id,
                        changes
                    ),

            getSettings:
                () =>
                    getSettings(
                        record.id
                    ),

            setSettings:
                changes =>
                    setSettings(
                        record.id,
                        changes
                    ),

            storageGet:
                (
                    key,
                    fallback
                ) =>
                    storageGet(
                        record.id,
                        key,
                        fallback
                    ),

            storageSet:
                (
                    key,
                    value
                ) =>
                    storageSet(
                        record.id,
                        key,
                        value
                    ),

            storageRemove:
                key =>
                    storageRemove(
                        record.id,
                        key
                    ),

            storageClear:
                () =>
                    storageClear(
                        record.id
                    ),

            mount:
                (
                    element,
                    options
                ) =>
                    mount(
                        record.id,
                        element,
                        options
                    ),

            getContainer:
                () =>
                    getContainer(
                        record.id
                    ),

            navigate:
                (
                    route,
                    options
                ) =>
                    navigate(
                        record.id,
                        route,
                        options
                    ),

            askAI:
                (
                    message,
                    options
                ) =>
                    askAI(
                        record.id,
                        message,
                        options
                    ),

            translate:
                translate,

            speak:
                (
                    text,
                    options
                ) =>
                    speak(
                        record.id,
                        text,
                        options
                    ),

            on:
                (
                    event,
                    callback
                ) =>
                    on(
                        record.id,
                        event,
                        callback
                    ),

            off:
                (
                    event,
                    callback
                ) =>
                    off(
                        record.id,
                        event,
                        callback
                    ),

            emit:
                (
                    event,
                    data
                ) =>
                    emit(
                        record.id,
                        event,
                        data
                    ),

            initialize:
                options =>
                    initialize(
                        record.id,
                        options
                    ),

            start:
                options =>
                    start(
                        record.id,
                        options
                    ),

            open:
                options =>
                    open(
                        record.id,
                        options
                    ),

            activate:
                () =>
                    activate(
                        record.id
                    ),

            deactivate:
                () =>
                    deactivate(
                        record.id
                    ),

            minimize:
                () =>
                    minimize(
                        record.id
                    ),

            restore:
                () =>
                    restore(
                        record.id
                    ),

            stop:
                () =>
                    stop(
                        record.id
                    ),

            close:
                options =>
                    close(
                        record.id,
                        options
                    ),

            enablePIP:
                () =>
                    enablePIP(
                        record.id
                    ),

            disablePIP:
                () =>
                    disablePIP(
                        record.id
                    ),

            diagnostics:
                () =>
                    getAppDiagnostics(
                        record.id
                    )

        };


        return app;

    }


    /* ========================================================
       36 — BULK ACCESS
       ======================================================== */

    function getApp(
        appId
    ) {

        const record =
            getRecord(
                appId
            );


        if (!record) {

            return null;

        }


        return createApp(
            record.definition
        );

    }


    function getAllApps() {

        return Array.from(
            runtime.apps.values()
        ).map(
            record =>
                createApp(
                    record.definition
                )
        );

    }


    /* ========================================================
       37 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        return {

            name:
                NAME,

            module:
                MODULE_ID,

            version:
                VERSION,

            initialized:
                runtime.initialized,

            ready:
                runtime.ready,

            appCount:
                runtime.apps.size,

            containers:
                runtime.containers.size,

            statistics:
                {
                    ...runtime.statistics
                },

            services: {

                contract:
                    !!getContract(),

                appManager:
                    !!getAppManager(),

                registry:
                    !!getRegistry(),

                router:
                    !!getRouter(),

                windowManager:
                    !!getWindowManager(),

                kernel:
                    !!getKernel(),

                system:
                    !!getSystem(),

                storage:
                    !!getStorage(),

                storageManager:
                    !!getStorageManager(),

                configManager:
                    !!getConfigManager(),

                ai:
                    !!getAI(),

                aiEngine:
                    !!getAIEngine(),

                aiChat:
                    !!getAIChat(),

                language:
                    !!getLanguage(),

                voice:
                    !!getVoice()

            },

            apps:
                Array.from(
                    runtime.apps.values()
                ).map(
                    record =>
                        getAppDiagnostics(
                            record.id
                        )
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       38 — HEALTH CHECK
       ======================================================== */

    function healthCheck() {

        const problems = [];


        if (
            !getAppManager()
        ) {

            problems.push(
                "App Manager nicht verbunden."
            );

        }


        if (
            !getRegistry()
        ) {

            problems.push(
                "App Registry nicht verbunden."
            );

        }


        if (
            !getKernel()
        ) {

            problems.push(
                "Kernel nicht verbunden."
            );

        }


        if (
            !getSystem()
        ) {

            problems.push(
                "System nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length ===
                0,

            problems:
                problems,

            appCount:
                runtime.apps.size,

            ready:
                runtime.ready,

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       39 — INITIALIZATION
       ======================================================== */

    function initializeRuntime() {

        if (
            runtime.initialized
        ) {

            return true;

        }


        runtime.initialized =
            true;


        /*
         * Services werden bewusst dynamisch
         * gesucht. Dadurch ist die Reihenfolge
         * der Script-Ladung robuster.
         */

        const manager =
            getAppManager();


        if (
            manager &&
            hasMethod(
                manager,
                "on"
            )
        ) {

            try {

                manager.on(
                    "app-opened",
                    data => {

                        if (
                            data &&
                            data.app &&
                            data.app.id
                        ) {

                            const record =
                                getRecord(
                                    data.app.id
                                );


                            if (record) {

                                record.state.open =
                                    true;

                                record.state.active =
                                    true;

                                record.state.status =
                                    "open";

                            }

                        }

                    }
                );

            } catch (exception) {

                reportError(
                    exception,
                    "App Manager Event Verbindung"
                );

            }

        }


        runtime.ready =
            true;


        log(
            "App Base Runtime bereit.",
            VERSION
        );


        return true;

    }


    /* ========================================================
       40 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


        /* Runtime */

        initialize:
            initializeRuntime,

        getState:
            () => ({

                initialized:
                    runtime.initialized,

                ready:
                    runtime.ready,

                appCount:
                    runtime.apps.size,

                statistics:
                    {
                        ...runtime.statistics
                    }

            }),


        /* Apps */

        register:
            register,

        createApp:
            createApp,

        getApp:
            getApp,

        getAllApps:
            getAllApps,


        /* State */

        getStateForApp:
            getState,

        setStateForApp:
            setState,


        /* Events */

        on:
            on,

        off:
            off,

        emit:
            emit,


        /* Settings */

        getSettings:
            getSettings,

        setSettings:
            setSettings,

        loadSettings:
            loadSettings,


        /* Storage */

        storageGet:
            storageGet,

        storageSet:
            storageSet,

        storageRemove:
            storageRemove,

        storageClear:
            storageClear,


        /* UI */

        createContainer:
            createContainer,

        getContainer:
            getContainer,

        mount:
            mount,

        unmount:
            unmount,


        /* Navigation */

        navigate:
            navigate,

        getRoute:
            getRoute,


        /* Window */

        openWindow:
            openWindow,

        focusWindow:
            focusWindow,


        /* AI */

        askAI:
            askAI,


        /* Language */

        translate:
            translate,

        getCurrentLanguage:
            getCurrentLanguage,


        /* Voice */

        speak:
            speak,

        stopSpeaking:
            stopSpeaking,


        /* Security */

        checkPermission:
            checkPermission,

        checkDependencies:
            checkDependencies,


        /* Lifecycle */

        initializeApp:
            initialize,

        startApp:
            start,

        openApp:
            open,

        activateApp:
            activate,

        deactivateApp:
            deactivate,

        minimizeApp:
            minimize,

        restoreApp:
            restore,

        stopApp:
            stop,

        closeApp:
            close,


        /* PIP */

        enablePIP:
            enablePIP,

        disablePIP:
            disablePIP,


        /* Diagnostics */

        getAppDiagnostics:
            getAppDiagnostics,

        diagnostics:
            diagnostics,

        healthCheck:
            healthCheck,


        /* Helpers */

        normalizeId:
            normalizeId,

        clone:
            clone,

        getServices:
            function () {

                return {

                    contract:
                        getContract(),

                    appManager:
                        getAppManager(),

                    registry:
                        getRegistry(),

                    router:
                        getRouter(),

                    windowManager:
                        getWindowManager(),

                    kernel:
                        getKernel(),

                    system:
                        getSystem(),

                    storage:
                        getStorage(),

                    storageManager:
                        getStorageManager(),

                    configManager:
                        getConfigManager(),

                    ai:
                        getAI(),

                    aiEngine:
                        getAIEngine(),

                    aiChat:
                        getAIChat(),

                    language:
                        getLanguage(),

                    voice:
                        getVoice()

                };

            }

    };


    /* ========================================================
       41 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppBase =
        api;

    window.HalDoOSAppBase =
        api;

    HalDoOS.appBase =
        api;


    /* ========================================================
       42 — START
       ======================================================== */

    function boot() {

        try {

            initializeRuntime();

        } catch (exception) {

            reportError(
                exception,
                "App Base Boot"
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


    /* ========================================================
       43 — FINAL EXPORT
       ======================================================== */

    HalDoOS.appBase =
        api;


    window.HalDoAppBase =
        api;


    window.HalDoOSAppBase =
        api;


    /* ========================================================
       END
       HALDO AI OS 20 APPLICATION BASE
       ======================================================== */

})(window, document);