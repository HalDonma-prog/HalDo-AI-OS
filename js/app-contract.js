/* ============================================================
   HALDO AI OS 18/19/20
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
       js/app-contract.js

   ZENTRALER APP CONTRACT

   Jede HalDo-App kann über diesen Standard verfügen:

   - Manifest
   - Lifecycle
   - Oberfläche
   - Navigation
   - State
   - Settings
   - Storage
   - Events
   - AI
   - Language
   - Voice
   - Keyboard
   - Router
   - Window Manager
   - Dependencies
   - Permissions
   - Notifications
   - Diagnostics
   - Import / Export
   - Backup / Restore
   - Theme
   - Accessibility
   - Multi-Window
   - PIP
   - Fehlerbehandlung
   - sichere Erweiterbarkeit

   Bestehende Systeme werden nicht ersetzt.
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


    /* ========================================================
       02 — META
       ======================================================== */

    const VERSION =
        "20.0.0";

    const MODULE_ID =
        "app-contract";


    /* ========================================================
       03 — SAFE HELPERS
       ======================================================== */

    function safeString(value, fallback = "") {

        if (
            value === null ||
            value === undefined
        ) {
            return fallback;
        }

        return String(value);
    }


    function safeArray(value) {

        return Array.isArray(value)
            ? value
            : [];

    }


    function safeObject(value) {

        return (
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
        )
            ? value
            : {};

    }


    function clone(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return value;
        }

        if (Array.isArray(value)) {

            return value.map(
                clone
            );

        }

        if (
            typeof value === "object"
        ) {

            const result = {};

            Object.keys(value)
                .forEach(
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


    function normalizeId(value) {

        return safeString(
            value
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
            ""
        );

    }


    /* ========================================================
       04 — DEFAULT MANIFEST
       ======================================================== */

    function createManifest(
        definition = {}
    ) {

        const id =
            normalizeId(
                definition.id ||
                definition.appId ||
                definition.name
            );


        return {

            id,

            name:
                safeString(
                    definition.name,
                    id
                ),

            title:
                safeString(
                    definition.title,
                    definition.name ||
                    id
                ),

            version:
                safeString(
                    definition.version,
                    "1.0.0"
                ),

            description:
                safeString(
                    definition.description
                ),

            icon:
                safeString(
                    definition.icon,
                    "◈"
                ),

            category:
                safeString(
                    definition.category,
                    "system"
                ),

            author:
                safeString(
                    definition.author,
                    "HalDo AI"
                ),

            enabled:
                definition.enabled !== false,

            visible:
                definition.visible !== false,

            singleton:
                definition.singleton !== false,

            systemApp:
                definition.systemApp === true,

            experimental:
                definition.experimental === true,

            dependencies:
                safeArray(
                    definition.dependencies
                ),

            optionalDependencies:
                safeArray(
                    definition.optionalDependencies
                ),

            permissions:
                safeArray(
                    definition.permissions
                ),

            capabilities:
                safeArray(
                    definition.capabilities
                ),

            routes:
                safeArray(
                    definition.routes
                ),

            languages:
                safeArray(
                    definition.languages
                ),

            tags:
                safeArray(
                    definition.tags
                ),

            keywords:
                safeArray(
                    definition.keywords
                ),

            settings:
                safeObject(
                    definition.settings
                ),

            storage:
                safeObject(
                    definition.storage
                ),

            ui:
                safeObject(
                    definition.ui
                ),

            accessibility:
                safeObject(
                    definition.accessibility
                )

        };

    }


    /* ========================================================
       05 — DEFAULT STATE
       ======================================================== */

    function createState(
        appId
    ) {

        return {

            appId:
                normalizeId(
                    appId
                ),

            lifecycle:
                "created",

            initialized:
                false,

            started:
                false,

            open:
                false,

            active:
                false,

            visible:
                false,

            minimized:
                false,

            maximized:
                false,

            pip:
                false,

            suspended:
                false,

            loading:
                false,

            ready:
                false,

            error:
                null,

            errorCount:
                0,

            windowId:
                null,

            route:
                null,

            createdAt:
                Date.now(),

            updatedAt:
                Date.now()

        };

    }


    /* ========================================================
       06 — DEFAULT SETTINGS
       ======================================================== */

    function createSettings(
        definition = {}
    ) {

        return {

            language:
                definition.language ||
                "de",

            theme:
                definition.theme ||
                "system",

            accent:
                definition.accent ||
                "haldo",

            notifications:
                definition.notifications !==
                false,

            sound:
                definition.sound !==
                false,

            vibration:
                definition.vibration !==
                false,

            animations:
                definition.animations !==
                false,

            accessibility:
                safeObject(
                    definition.accessibility
                ),

            privacy:
                safeObject(
                    definition.privacy
                ),

            ai:
                safeObject(
                    definition.ai
                ),

            voice:
                safeObject(
                    definition.voice
                ),

            keyboard:
                safeObject(
                    definition.keyboard
                ),

            custom:
                safeObject(
                    definition.custom
                )

        };

    }


    /* ========================================================
       07 — APP CONTEXT
       ======================================================== */

    function createContext(
        definition,
        services = {}
    ) {

        const manifest =
            createManifest(
                definition
            );

        const state =
            createState(
                manifest.id
            );

        const settings =
            createSettings(
                definition.settings
            );


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

                return function () {};

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


            const set =
                listeners.get(
                    event
                );


            set.add(
                callback
            );


            return function () {

                set.delete(
                    callback
                );

            };

        }


        function emit(
            event,
            payload = {}
        ) {

            const set =
                listeners.get(
                    event
                );


            if (set) {

                Array.from(
                    set
                ).forEach(
                    callback => {

                        try {

                            callback(
                                payload
                            );

                        } catch (error) {

                            console.error(
                                "[HalDo App]",
                                manifest.id,
                                error
                            );

                        }

                    }
                );

            }


            const globalEvents =
                HalDoOS.events;


            if (
                globalEvents &&
                typeof globalEvents.emit ===
                "function"
            ) {

                try {

                    globalEvents.emit(
                        "app:" +
                        manifest.id +
                        ":" +
                        event,

                        payload
                    );

                } catch (_) {}

            }

        }


        function updateState(
            changes = {}
        ) {

            Object.assign(
                state,
                changes,
                {
                    updatedAt:
                        Date.now()
                }
            );


            emit(
                "state-changed",
                {
                    state:
                        clone(
                            state
                        )
                }
            );


            return state;

        }


        function getState() {

            return clone(
                state
            );

        }


        function getSettings() {

            return clone(
                settings
            );

        }


        function updateSettings(
            changes = {}
        ) {

            Object.assign(
                settings,
                changes
            );


            emit(
                "settings-changed",
                {
                    settings:
                        clone(
                            settings
                        )
                }
            );


            return settings;

        }


        /* ====================================================
           SERVICE ACCESS
           ==================================================== */

        function getService(
            name
        ) {

            return (
                services[name] ||
                null
            );

        }


        /* ====================================================
           STORAGE
           ==================================================== */

        async function save(
            key,
            value
        ) {

            const storage =
                getService(
                    "storage"
                );


            if (!storage) {

                return false;

            }


            try {

                if (
                    typeof storage.set ===
                    "function"
                ) {

                    await storage.set(
                        key,
                        value
                    );

                    return true;

                }


                if (
                    typeof storage.save ===
                    "function"
                ) {

                    await storage.save(
                        key,
                        value
                    );

                    return true;

                }

            } catch (error) {

                emit(
                    "storage-error",
                    {
                        error,
                        key
                    }
                );

            }


            return false;

        }


        async function load(
            key,
            fallback = null
        ) {

            const storage =
                getService(
                    "storage"
                );


            if (!storage) {

                return fallback;

            }


            try {

                if (
                    typeof storage.get ===
                    "function"
                ) {

                    const value =
                        await storage.get(
                            key
                        );

                    return (
                        value ===
                        undefined
                    )
                        ? fallback
                        : value;

                }


                if (
                    typeof storage.load ===
                    "function"
                ) {

                    const value =
                        await storage.load(
                            key
                        );

                    return (
                        value ===
                        undefined
                    )
                        ? fallback
                        : value;

                }

            } catch (error) {

                emit(
                    "storage-error",
                    {
                        error,
                        key
                    }
                );

            }


            return fallback;

        }


        /* ====================================================
           AI
           ==================================================== */

        async function askAI(
            prompt,
            options = {}
        ) {

            const ai =
                getService(
                    "ai"
                );


            if (!ai) {

                return null;

            }


            try {

                if (
                    typeof ai.ask ===
                    "function"
                ) {

                    return await ai.ask(
                        prompt,
                        {
                            appId:
                                manifest.id,

                            ...options
                        }
                    );

                }


                if (
                    typeof ai.chat ===
                    "function"
                ) {

                    return await ai.chat(
                        prompt,
                        {
                            appId:
                                manifest.id,

                            ...options
                        }
                    );

                }

            } catch (error) {

                emit(
                    "ai-error",
                    {
                        error
                    }
                );

            }


            return null;

        }


        /* ====================================================
           LANGUAGE
           ==================================================== */

        function translate(
            key,
            variables = {}
        ) {

            const language =
                getService(
                    "language"
                );


            if (
                language &&
                typeof language.translate ===
                "function"
            ) {

                return language.translate(
                    key,
                    variables
                );

            }


            return key;

        }


        /* ====================================================
           VOICE
           ==================================================== */

        async function speak(
            text,
            options = {}
        ) {

            const voice =
                getService(
                    "voice"
                );


            if (
                voice &&
                typeof voice.speak ===
                "function"
            ) {

                return voice.speak(
                    text,
                    {
                        appId:
                            manifest.id,

                        ...options
                    }
                );

            }


            return false;

        }


        async function listen(
            options = {}
        ) {

            const voice =
                getService(
                    "voice"
                );


            if (
                voice &&
                typeof voice.listen ===
                "function"
            ) {

                return voice.listen(
                    {
                        appId:
                            manifest.id,

                        ...options
                    }
                );

            }


            return null;

        }


        /* ====================================================
           ROUTER
           ==================================================== */

        function navigate(
            route,
            options = {}
        ) {

            const router =
                getService(
                    "router"
                );


            if (
                router &&
                typeof router.navigate ===
                "function"
            ) {

                return router.navigate(
                    route,
                    {
                        appId:
                            manifest.id,

                        ...options
                    }
                );

            }


            return false;

        }


        /* ====================================================
           WINDOW
           ==================================================== */

        function openWindow(
            options = {}
        ) {

            const manager =
                getService(
                    "windowManager"
                );


            if (
                manager &&
                typeof manager.open ===
                "function"
            ) {

                const result =
                    manager.open(
                        {
                            appId:
                                manifest.id,

                            ...options
                        }
                    );


                if (
                    result &&
                    result.id
                ) {

                    state.windowId =
                        result.id;

                }


                return result;

            }


            return null;

        }


        function closeWindow() {

            const manager =
                getService(
                    "windowManager"
                );


            if (
                manager &&
                typeof manager.close ===
                "function" &&
                state.windowId
            ) {

                return manager.close(
                    state.windowId
                );

            }


            return false;

        }


        function minimizeWindow() {

            const manager =
                getService(
                    "windowManager"
                );


            if (
                manager &&
                typeof manager.minimize ===
                "function" &&
                state.windowId
            ) {

                return manager.minimize(
                    state.windowId
                );

            }


            return false;

        }


        function restoreWindow() {

            const manager =
                getService(
                    "windowManager"
                );


            if (
                manager &&
                typeof manager.restore ===
                "function" &&
                state.windowId
            ) {

                return manager.restore(
                    state.windowId
                );

            }


            return false;

        }


        /* ====================================================
           NOTIFICATIONS
           ==================================================== */

        function notify(
            notification
        ) {

            const notifications =
                getService(
                    "notifications"
                );


            if (
                notifications &&
                typeof notifications.notify ===
                "function"
            ) {

                return notifications.notify(
                    {
                        appId:
                            manifest.id,

                        ...notification
                    }
                );

            }


            emit(
                "notification",
                notification
            );


            return false;

        }


        /* ====================================================
           KEYBOARD
           ==================================================== */

        function getKeyboard() {

            return getService(
                "keyboard"
            );

        }


        /* ====================================================
           SYSTEM
           ==================================================== */

        function getSystem() {

            return getService(
                "system"
            );

        }


        function getKernel() {

            return getService(
                "kernel"
            );

        }


        /* ====================================================
           APP MANAGER
           ==================================================== */

        function getAppManager() {

            return getService(
                "appManager"
            );

        }


        async function openApp(
            appId,
            options = {}
        ) {

            const manager =
                getAppManager();


            if (
                manager &&
                typeof manager.openApp ===
                "function"
            ) {

                return manager.openApp(
                    appId,
                    options
                );

            }


            return false;

        }


        async function closeApp(
            appId,
            options = {}
        ) {

            const manager =
                getAppManager();


            if (
                manager &&
                typeof manager.closeApp ===
                "function"
            ) {

                return manager.closeApp(
                    appId,
                    options
                );

            }


            return false;

        }


        /* ====================================================
           DIAGNOSTICS
           ==================================================== */

        function diagnostics() {

            return {

                manifest:
                    clone(
                        manifest
                    ),

                state:
                    getState(),

                settings:
                    getSettings(),

                services:
                    Object.keys(
                        services
                    ),

                timestamp:
                    new Date()
                        .toISOString()

            };

        }


        /* ====================================================
           COMPLETE CONTEXT
           ==================================================== */

        return {

            version:
                VERSION,

            manifest,

            state,

            settings,

            services,

            on,

            emit,

            updateState,

            getState,

            getSettings,

            updateSettings,

            getService,

            save,

            load,

            askAI,

            translate,

            speak,

            listen,

            navigate,

            openWindow,

            closeWindow,

            minimizeWindow,

            restoreWindow,

            notify,

            getKeyboard,

            getSystem,

            getKernel,

            getAppManager,

            openApp,

            closeApp,

            diagnostics

        };

    }


    /* ========================================================
       08 — APP VALIDATION
       ======================================================== */

    function validate(
        definition
    ) {

        const errors = [];

        const manifest =
            createManifest(
                definition
            );


        if (!manifest.id) {

            errors.push(
                "App benötigt eine ID."
            );

        }


        if (!manifest.name) {

            errors.push(
                "App benötigt einen Namen."
            );

        }


        if (
            !Array.isArray(
                manifest.dependencies
            )
        ) {

            errors.push(
                "Dependencies müssen ein Array sein."
            );

        }


        if (
            !Array.isArray(
                manifest.permissions
            )
        ) {

            errors.push(
                "Permissions müssen ein Array sein."
            );

        }


        return {

            valid:
                errors.length ===
                0,

            errors,

            manifest

        };

    }


    /* ========================================================
       09 — FACTORY
       ======================================================== */

    function createApp(
        definition = {},
        services = {}
    ) {

        const validation =
            validate(
                definition
            );


        if (
            !validation.valid
        ) {

            throw new Error(
                validation.errors.join(
                    " "
                )
            );

        }


        const context =
            createContext(
                definition,
                services
            );


        const manifest =
            context.manifest;


        const app = {

            id:
                manifest.id,

            name:
                manifest.name,

            title:
                manifest.title,

            version:
                manifest.version,

            icon:
                manifest.icon,

            category:
                manifest.category,

            description:
                manifest.description,

            enabled:
                manifest.enabled,

            visible:
                manifest.visible,

            singleton:
                manifest.singleton,

            dependencies:
                manifest.dependencies,

            permissions:
                manifest.permissions,

            capabilities:
                manifest.capabilities,

            tags:
                manifest.tags,

            keywords:
                manifest.keywords,


            /* Context */

            context,


            /* Lifecycle */

            async init() {

                context.updateState({
                    lifecycle:
                        "initialized",

                    initialized:
                        true,

                    ready:
                        true
                });

                context.emit(
                    "initialized"
                );

            },


            async start() {

                context.updateState({
                    lifecycle:
                        "running",

                    started:
                        true
                });

                context.emit(
                    "started"
                );

            },


            async open(
                options = {}
            ) {

                context.updateState({
                    lifecycle:
                        "open",

                    open:
                        true,

                    active:
                        true,

                    visible:
                        true
                });

                context.emit(
                    "opened",
                    {
                        options
                    }
                );

            },


            async close(
                options = {}
            ) {

                context.updateState({
                    lifecycle:
                        "closed",

                    open:
                        false,

                    active:
                        false,

                    visible:
                        false
                });

                context.emit(
                    "closed",
                    {
                        options
                    }
                );

            },


            async stop() {

                context.updateState({
                    lifecycle:
                        "stopped",

                    started:
                        false
                });

                context.emit(
                    "stopped"
                );

            },


            async activate() {

                context.updateState({
                    active:
                        true
                });

                context.emit(
                    "activated"
                );

            },


            async deactivate() {

                context.updateState({
                    active:
                        false
                });

                context.emit(
                    "deactivated"
                );

            },


            async minimize() {

                context.updateState({
                    minimized:
                        true,

                    active:
                        false
                });

                context.emit(
                    "minimized"
                );

            },


            async restore() {

                context.updateState({
                    minimized:
                        false,

                    active:
                        true
                });

                context.emit(
                    "restored"
                );

            },


            diagnostics() {

                return context.diagnostics();

            }

        };


        return app;

    }


    /* ========================================================
       10 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            "HalDo AI OS App Contract",

        version:
            VERSION,

        module:
            MODULE_ID,

        createManifest,

        createState,

        createSettings,

        createContext,

        validate,

        createApp

    };


    /* ========================================================
       11 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoAppContract =
        api;

    HalDoOS.appContract =
        api;


    /* ========================================================
       12 — READY EVENT
       ======================================================== */

    try {

        if (
            HalDoOS.events &&
            typeof HalDoOS.events.emit ===
            "function"
        ) {

            HalDoOS.events.emit(
                "app-contract:ready",
                {
                    version:
                        VERSION
                }
            );

        }

    } catch (_) {}


})(window, document);