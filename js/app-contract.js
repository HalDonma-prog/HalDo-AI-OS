/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
       js/app-contract.js

   ZENTRALER APP CONTRACT

   Zweck:
   - Einheitliche Struktur für ALLE HalDo Apps
   - App-Metadaten
   - Lifecycle
   - UI
   - Navigation
   - Settings
   - Storage
   - Events
   - AI
   - Sprache
   - Voice
   - Dependencies
   - Permissions
   - Window-Konfiguration
   - State Management
   - Diagnostics
   - Health Check
   - sichere Erweiterbarkeit

   WICHTIG:
   Dieser Contract ersetzt KEINE einzelne App.

   Er definiert die gemeinsame Architektur, nach der
   jede zukünftige HalDo-App vollständig aufgebaut wird.

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


    /* ========================================================
       02 — META
       ======================================================== */

    const VERSION =
        "20.0.0";

    const MODULE_ID =
        "app-contract";

    const NAME =
        "HalDo AI OS 20 Application Contract";


    /* ========================================================
       03 — CONSTANTS
       ======================================================== */

    const LIFECYCLE = Object.freeze({

        CREATED:
            "created",

        INITIALIZING:
            "initializing",

        INITIALIZED:
            "initialized",

        STARTING:
            "starting",

        RUNNING:
            "running",

        ACTIVATING:
            "activating",

        ACTIVE:
            "active",

        MINIMIZED:
            "minimized",

        MAXIMIZED:
            "maximized",

        PIP:
            "pip",

        DEACTIVATING:
            "deactivating",

        STOPPING:
            "stopping",

        STOPPED:
            "stopped",

        CLOSING:
            "closing",

        CLOSED:
            "closed",

        ERROR:
            "error",

        DISABLED:
            "disabled"

    });


    const CATEGORIES = Object.freeze({

        SYSTEM:
            "system",

        AI:
            "ai",

        COMMUNICATION:
            "communication",

        PRODUCTIVITY:
            "productivity",

        MEDIA:
            "media",

        INTERNET:
            "internet",

        EDUCATION:
            "education",

        CREATIVE:
            "creative",

        TOOLS:
            "tools",

        SECURITY:
            "security",

        SETTINGS:
            "settings",

        FILES:
            "files",

        DEVELOPMENT:
            "development",

        LANGUAGE:
            "language",

        ACCESSIBILITY:
            "accessibility",

        OTHER:
            "other"

    });


    const PERMISSIONS = Object.freeze({

        STORAGE:
            "storage",

        AI:
            "ai",

        MICROPHONE:
            "microphone",

        CAMERA:
            "camera",

        NETWORK:
            "network",

        NOTIFICATIONS:
            "notifications",

        FILES:
            "files",

        SYSTEM:
            "system",

        CLIPBOARD:
            "clipboard",

        LOCATION:
            "location",

        VOICE:
            "voice",

        LANGUAGE:
            "language"

    });


    /* ========================================================
       04 — SAFE HELPERS
       ======================================================== */

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


    function isObject(
        value
    ) {

        return !!(
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
        );

    }


    function isFunction(
        value
    ) {

        return typeof value ===
            "function";

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

                    if (
                        typeof value[key] ===
                        "function"
                    ) {

                        result[key] =
                            value[key];

                    } else {

                        result[key] =
                            clone(
                                value[key]
                            );

                    }

                }
            );

            return result;

        }


        return value;

    }


    function merge(
        base,
        extra
    ) {

        const result = {

            ...(isObject(base)
                ? base
                : {})

        };


        if (
            !isObject(extra)
        ) {

            return result;

        }


        Object.keys(
            extra
        ).forEach(
            key => {

                if (
                    isObject(
                        extra[key]
                    ) &&
                    isObject(
                        result[key]
                    )
                ) {

                    result[key] =
                        merge(
                            result[key],
                            extra[key]
                        );

                } else {

                    result[key] =
                        extra[key];

                }

            }
        );


        return result;

    }


    function timestamp() {

        return Date.now();

    }


    function isoTime() {

        return new Date()
            .toISOString();

    }


    /* ========================================================
       05 — EVENTS
       ======================================================== */

    function createEventBus() {

        const listeners =
            new Map();


        function on(
            event,
            callback
        ) {

            if (
                !isFunction(
                    callback
                )
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
                listeners.get(
                    event
                );


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
            payload = null
        ) {

            const set =
                listeners.get(
                    event
                );


            if (!set) {

                return;

            }


            Array.from(
                set
            ).forEach(
                callback => {

                    try {

                        callback(
                            payload
                        );

                    } catch (exception) {

                        console.error(
                            "[HalDo App Contract]",
                            exception
                        );

                    }

                }
            );

        }


        function clear(
            event
        ) {

            if (
                event
            ) {

                listeners.delete(
                    event
                );

            } else {

                listeners.clear();

            }

        }


        function count(
            event
        ) {

            if (
                event
            ) {

                const set =
                    listeners.get(
                        event
                    );

                return set
                    ? set.size
                    : 0;

            }


            let total = 0;

            listeners.forEach(
                set => {

                    total +=
                        set.size;

                }
            );


            return total;

        }


        return {

            on,

            off,

            emit,

            clear,

            count

        };

    }


    /* ========================================================
       06 — DEFAULT STATE
       ======================================================== */

    function createDefaultState(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        return {

            appId:
                id,

            lifecycle:
                LIFECYCLE.CREATED,

            open:
                false,

            active:
                false,

            initialized:
                false,

            started:
                false,

            minimized:
                false,

            maximized:
                false,

            pip:
                false,

            loading:
                false,

            ready:
                false,

            error:
                null,

            windowId:
                null,

            route:
                null,

            createdAt:
                timestamp(),

            updatedAt:
                timestamp(),

            lastActivatedAt:
                null,

            lastDeactivatedAt:
                null,

            lastOpenedAt:
                null,

            lastClosedAt:
                null

        };

    }


    /* ========================================================
       07 — DEFAULT WINDOW
       ======================================================== */

    function createDefaultWindow(
        definition
    ) {

        const app =
            definition || {};


        return {

            id:
                "window-" +
                normalizeId(
                    app.id
                ),

            appId:
                normalizeId(
                    app.id
                ),

            title:
                app.title ||
                app.name ||
                "HalDo App",

            icon:
                app.icon ||
                "◈",

            width:
                app.window?.width ||
                1100,

            height:
                app.window?.height ||
                700,

            minWidth:
                app.window?.minWidth ||
                320,

            minHeight:
                app.window?.minHeight ||
                240,

            resizable:
                app.window?.resizable !==
                false,

            draggable:
                app.window?.draggable !==
                false,

            maximizable:
                app.window?.maximizable !==
                false,

            minimizable:
                app.window?.minimizable !==
                false,

            closable:
                app.window?.closable !==
                false,

            singleton:
                app.singleton !==
                false,

            pip:
                app.window?.pip ===
                true,

            fullscreen:
                app.window?.fullscreen ===
                false

        };

    }


    /* ========================================================
       08 — DEFAULT SETTINGS
       ======================================================== */

    function createDefaultSettings() {

        return {

            language:
                "auto",

            theme:
                "system",

            notifications:
                true,

            sounds:
                true,

            voice:
                false,

            ai:
                true,

            animations:
                true,

            rememberState:
                true,

            rememberWindow:
                true,

            startup:
                false,

            privacyMode:
                false,

            accessibility:
                {

                    reducedMotion:
                        false,

                    highContrast:
                        false,

                    largeText:
                        false

                }

        };

    }


    /* ========================================================
       09 — DEFAULT DEFINITION
       ======================================================== */

    function createDefinition(
        definition = {}
    ) {

        const id =
            normalizeId(
                definition.id ||
                definition.appId
            );


        if (!id) {

            throw new Error(
                "App Contract: Jede App benötigt eine ID."
            );

        }


        const result =
            merge(
                {

                    id:

                        id,

                    name:
                        definition.name ||
                        id,

                    title:
                        definition.title ||
                        definition.name ||
                        id,

                    version:
                        definition.version ||
                        VERSION,

                    description:
                        definition.description ||
                        "",

                    category:
                        definition.category ||
                        CATEGORIES.OTHER,

                    icon:
                        definition.icon ||
                        "◈",

                    author:
                        definition.author ||
                        "HalDo AI",

                    enabled:
                        definition.enabled !==
                        false,

                    visible:
                        definition.visible !==
                        false,

                    experimental:
                        definition.experimental ===
                        true,

                    singleton:
                        definition.singleton !==
                        false,

                    route:
                        definition.route ||
                        "/app/" +
                        id,

                    tags:
                        Array.isArray(
                            definition.tags
                        )
                            ? [
                                ...definition.tags
                            ]
                            : [],

                    keywords:
                        Array.isArray(
                            definition.keywords
                        )
                            ? [
                                ...definition.keywords
                            ]
                            : [],

                    dependencies:
                        Array.isArray(
                            definition.dependencies
                        )
                            ? [
                                ...definition.dependencies
                            ]
                            : [],

                    optionalDependencies:
                        Array.isArray(
                            definition.optionalDependencies
                        )
                            ? [
                                ...definition.optionalDependencies
                            ]
                            : [],

                    permissions:
                        Array.isArray(
                            definition.permissions
                        )
                            ? [
                                ...definition.permissions
                            ]
                            : [],

                    settings:
                        createDefaultSettings(),

                    window:
                        {},

                    state:
                        {},

                    metadata:
                        {},

                    api:
                        {},

                    ui:
                        {},

                    navigation:
                        {},

                    storage:
                        {},

                    ai:
                        {},

                    language:
                        {},

                    voice:
                        {},

                    lifecycle:
                        {},

                    diagnostics:
                        {},

                    security:
                        {},

                    accessibility:
                        {}

                },

                definition
            );


        result.id =
            id;


        result.window =
            merge(
                createDefaultWindow(
                    result
                ),
                definition.window || {}
            );


        result.settings =
            merge(
                createDefaultSettings(),
                definition.settings || {}
            );


        result.dependencies =
            Array.isArray(
                result.dependencies
            )
                ? result.dependencies
                : [];


        result.permissions =
            Array.isArray(
                result.permissions
            )
                ? result.permissions
                : [];


        return result;

    }


    /* ========================================================
       10 — VALIDATION
       ======================================================== */

    function validate(
        definition
    ) {

        const errors = [];
        const warnings = [];


        if (
            !definition
        ) {

            errors.push(
                "App Definition fehlt."
            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        const id =
            normalizeId(
                definition.id
            );


        if (!id) {

            errors.push(
                "App ID fehlt."
            );

        }


        if (
            !definition.name
        ) {

            warnings.push(
                "App Name fehlt."
            );

        }


        if (
            !definition.title
        ) {

            warnings.push(
                "App Title fehlt."
            );

        }


        if (
            definition.dependencies &&
            !Array.isArray(
                definition.dependencies
            )
        ) {

            errors.push(
                "dependencies muss ein Array sein."
            );

        }


        if (
            definition.permissions &&
            !Array.isArray(
                definition.permissions
            )
        ) {

            errors.push(
                "permissions muss ein Array sein."
            );

        }


        if (
            definition.tags &&
            !Array.isArray(
                definition.tags
            )
        ) {

            errors.push(
                "tags muss ein Array sein."
            );

        }


        if (
            definition.keywords &&
            !Array.isArray(
                definition.keywords
            )
        ) {

            errors.push(
                "keywords muss ein Array sein."
            );

        }


        const lifecycle =
            definition.lifecycle;


        if (
            lifecycle &&
            !isObject(
                lifecycle
            )
        ) {

            errors.push(
                "lifecycle muss ein Objekt sein."
            );

        }


        return {

            valid:
                errors.length ===
                0,

            errors,

            warnings

        };

    }


    /* ========================================================
       11 — APP CONTEXT
       ======================================================== */

    function createContext(
        definition,
        services = {}
    ) {

        const app =
            createDefinition(
                definition
            );


        const state =
            createDefaultState(
                app.id
            );


        const events =
            createEventBus();


        const context = {

            app,

            state,

            events,

            services,

            version:
                VERSION,

            createdAt:
                timestamp(),

            createdAtISO:
                isoTime(),

            getState:
                function () {

                    return clone(
                        state
                    );

                },

            setState:
                function (
                    changes
                ) {

                    Object.assign(
                        state,
                        changes || {},
                        {
                            updatedAt:
                                timestamp()
                        }
                    );


                    events.emit(
                        "state-changed",
                        clone(
                            state
                        )
                    );


                    return state;

                },

            emit:
                function (
                    event,
                    data
                ) {

                    events.emit(
                        event,
                        data
                    );

                },

            on:
                function (
                    event,
                    callback
                ) {

                    return events.on(
                        event,
                        callback
                    );

                }

        };


        return context;

    }


    /* ========================================================
       12 — LIFECYCLE NORMALIZATION
       ======================================================== */

    function normalizeLifecycle(
        lifecycle
    ) {

        if (
            !isObject(
                lifecycle
            )
        ) {

            return {};

        }


        return {

            init:
                isFunction(
                    lifecycle.init
                )
                    ? lifecycle.init
                    : null,

            start:
                isFunction(
                    lifecycle.start
                )
                    ? lifecycle.start
                    : null,

            activate:
                isFunction(
                    lifecycle.activate
                )
                    ? lifecycle.activate
                    : null,

            deactivate:
                isFunction(
                    lifecycle.deactivate
                )
                    ? lifecycle.deactivate
                    : null,

            minimize:
                isFunction(
                    lifecycle.minimize
                )
                    ? lifecycle.minimize
                    : null,

            restore:
                isFunction(
                    lifecycle.restore
                )
                    ? lifecycle.restore
                    : null,

            stop:
                isFunction(
                    lifecycle.stop
                )
                    ? lifecycle.stop
                    : null,

            close:
                isFunction(
                    lifecycle.close
                )
                    ? lifecycle.close
                    : null,

            destroy:
                isFunction(
                    lifecycle.destroy
                )
                    ? lifecycle.destroy
                    : null

        };

    }


    /* ========================================================
       13 — UI CONTRACT
       ======================================================== */

    function normalizeUI(
        ui
    ) {

        if (
            !isObject(
                ui
            )
        ) {

            return {};

        }


        return {

            mount:
                ui.mount ||
                null,

            container:
                ui.container ||
                null,

            template:
                ui.template ||
                null,

            render:
                isFunction(
                    ui.render
                )
                    ? ui.render
                    : null,

            update:
                isFunction(
                    ui.update
                )
                    ? ui.update
                    : null,

            destroy:
                isFunction(
                    ui.destroy
                )
                    ? ui.destroy
                    : null,

            refresh:
                isFunction(
                    ui.refresh
                )
                    ? ui.refresh
                    : null

        };

    }


    /* ========================================================
       14 — NAVIGATION CONTRACT
       ======================================================== */

    function normalizeNavigation(
        navigation
    ) {

        if (
            !isObject(
                navigation
            )
        ) {

            return {

                routes:
                    [],

                defaultRoute:
                    null

            };

        }


        return {

            routes:
                Array.isArray(
                    navigation.routes
                )
                    ? navigation.routes
                    : [],

            defaultRoute:
                navigation.defaultRoute ||
                null,

            onNavigate:
                isFunction(
                    navigation.onNavigate
                )
                    ? navigation.onNavigate
                    : null,

            onBack:
                isFunction(
                    navigation.onBack
                )
                    ? navigation.onBack
                    : null,

            onForward:
                isFunction(
                    navigation.onForward
                )
                    ? navigation.onForward
                    : null

        };

    }


    /* ========================================================
       15 — STORAGE CONTRACT
       ======================================================== */

    function normalizeStorage(
        storage
    ) {

        if (
            !isObject(
                storage
            )
        ) {

            return {};

        }


        return {

            namespace:
                storage.namespace ||
                null,

            persistent:
                storage.persistent !==
                false,

            autosave:
                storage.autosave !==
                false,

            save:
                isFunction(
                    storage.save
                )
                    ? storage.save
                    : null,

            load:
                isFunction(
                    storage.load
                )
                    ? storage.load
                    : null,

            clear:
                isFunction(
                    storage.clear
                )
                    ? storage.clear
                    : null

        };

    }


    /* ========================================================
       16 — AI CONTRACT
       ======================================================== */

    function normalizeAI(
        ai
    ) {

        if (
            !isObject(
                ai
            )
        ) {

            return {

                enabled:
                    true

            };

        }


        return {

            enabled:
                ai.enabled !==
                false,

            model:
                ai.model ||
                "haldo-default",

            systemPrompt:
                ai.systemPrompt ||
                "",

            capabilities:
                Array.isArray(
                    ai.capabilities
                )
                    ? ai.capabilities
                    : [],

            chat:
                isFunction(
                    ai.chat
                )
                    ? ai.chat
                    : null,

            command:
                isFunction(
                    ai.command
                )
                    ? ai.command
                    : null,

            analyze:
                isFunction(
                    ai.analyze
                )
                    ? ai.analyze
                    : null

        };

    }


    /* ========================================================
       17 — LANGUAGE CONTRACT
       ======================================================== */

    function normalizeLanguage(
        language
    ) {

        if (
            !isObject(
                language
            )
        ) {

            return {

                enabled:
                    true,

                defaultLanguage:
                    "auto",

                supportedLanguages:
                    []

            };

        }


        return {

            enabled:
                language.enabled !==
                false,

            defaultLanguage:
                language.defaultLanguage ||
                "auto",

            supportedLanguages:
                Array.isArray(
                    language.supportedLanguages
                )
                    ? language.supportedLanguages
                    : [],

            translate:
                isFunction(
                    language.translate
                )
                    ? language.translate
                    : null,

            setLanguage:
                isFunction(
                    language.setLanguage
                )
                    ? language.setLanguage
                    : null

        };

    }


    /* ========================================================
       18 — VOICE CONTRACT
       ======================================================== */

    function normalizeVoice(
        voice
    ) {

        if (
            !isObject(
                voice
            )
        ) {

            return {

                enabled:
                    false

            };

        }


        return {

            enabled:
                voice.enabled ===
                true,

            input:
                voice.input !==
                false,

            output:
                voice.output !==
                false,

            speak:
                isFunction(
                    voice.speak
                )
                    ? voice.speak
                    : null,

            stop:
                isFunction(
                    voice.stop
                )
                    ? voice.stop
                    : null,

            listen:
                isFunction(
                    voice.listen
                )
                    ? voice.listen
                    : null

        };

    }


    /* ========================================================
       19 — NORMALIZE CONTRACT
       ======================================================== */

    function normalize(
        definition,
        services = {}
    ) {

        const validation =
            validate(
                definition
            );


        if (
            !validation.valid
        ) {

            return {

                valid:
                    false,

                errors:
                    validation.errors,

                warnings:
                    validation.warnings,

                app:
                    null,

                context:
                    null

            };

        }


        const app =
            createDefinition(
                definition
            );


        app.lifecycle =
            normalizeLifecycle(
                app.lifecycle
            );


        app.ui =
            normalizeUI(
                app.ui
            );


        app.navigation =
            normalizeNavigation(
                app.navigation
            );


        app.storage =
            normalizeStorage(
                app.storage
            );


        app.ai =
            normalizeAI(
                app.ai
            );


        app.language =
            normalizeLanguage(
                app.language
            );


        app.voice =
            normalizeVoice(
                app.voice
            );


        const context =
            createContext(
                app,
                services
            );


        return {

            valid:
                true,

            errors:
                validation.errors,

            warnings:
                validation.warnings,

            app,

            context

        };

    }


    /* ========================================================
       20 — SERVICE DISCOVERY
       ======================================================== */

    function getServices() {

        return {

            kernel:
                window.HalDoKernel ||
                HalDoOS.kernel ||
                null,

            system:
                window.HalDoSystem ||
                HalDoOS.system ||
                null,

            appManager:
                window.HalDoAppManager ||
                HalDoOS.appManager ||
                null,

            appRegistry:
                window.HalDoAppRegistry ||
                HalDoOS.appRegistry ||
                null,

            appRouter:
                window.HalDoAppRouter ||
                HalDoOS.appRouter ||
                null,

            windowManager:
                window.HalDoWindowManager ||
                HalDoOS.windowManager ||
                null,

            launcher:
                window.HalDoLauncher ||
                HalDoOS.launcher ||
                null,

            ai:
                window.HalDoAI ||
                HalDoOS.ai ||
                null,

            aiCore:
                window.HalDoAICore ||
                HalDoOS.aiCore ||
                null,

            language:
                window.HalDoLanguage ||
                HalDoOS.language ||
                null,

            languageManager:
                window.HalDoLanguageManager ||
                HalDoOS.languageManager ||
                null,

            voice:
                window.HalDoVoice ||
                HalDoOS.voice ||
                null,

            storage:
                window.HalDoStorage ||
                HalDoOS.storage ||
                null,

            storageManager:
                window.HalDoStorageManager ||
                HalDoOS.storageManager ||
                null

        };

    }


    /* ========================================================
       21 — APP FACTORY
       ======================================================== */

    function createApp(
        definition,
        services
    ) {

        const result =
            normalize(
                definition,
                services ||
                getServices()
            );


        if (
            !result.valid
        ) {

            throw new Error(
                "Ungültige HalDo App: " +
                result.errors.join(
                    " | "
                )
            );

        }


        const app =
            result.app;


        const context =
            result.context;


        /*
         * Lifecycle-Kompatibilität:
         *
         * Der App Manager arbeitet mit
         * app.init(), app.start(), usw.
         *
         * Deshalb werden die Contract-Lifecycle-
         * Funktionen zusätzlich direkt auf die
         * App gespiegelt.
         */

        const lifecycle =
            app.lifecycle;


        app.init =
            lifecycle.init ||
            null;


        app.start =
            lifecycle.start ||
            null;


        app.onActivate =
            lifecycle.activate ||
            null;


        app.onDeactivate =
            lifecycle.deactivate ||
            null;


        app.minimize =
            lifecycle.minimize ||
            null;


        app.restore =
            lifecycle.restore ||
            null;


        app.stop =
            lifecycle.stop ||
            null;


        app.close =
            lifecycle.close ||
            null;


        app.destroy =
            lifecycle.destroy ||
            null;


        /*
         * Contract Services
         */

        app.services =
            services ||
            getServices();


        /*
         * Contract Context
         */

        app.context =
            context;


        /*
         * Contract API
         */

        app.contract = {

            version:
                VERSION,

            validate:
                function () {

                    return validate(
                        app
                    );

                },

            getState:
                function () {

                    return context.getState();

                },

            setState:
                function (
                    changes
                ) {

                    return context.setState(
                        changes
                    );

                },

            on:
                context.on,

            emit:
                context.emit,

            getServices:
                getServices

        };


        return app;

    }


    /* ========================================================
       22 — APP CONTRACT INSTANCE
       ======================================================== */

    function createContract(
        definition,
        services
    ) {

        const app =
            createApp(
                definition,
                services
            );


        return {

            app,

            context:
                app.context,

            services:
                app.services,

            version:
                VERSION,

            id:
                app.id,

            name:
                app.name,

            validate:
                function () {

                    return validate(
                        app
                    );

                },

            getState:
                function () {

                    return app.context
                        .getState();

                },

            setState:
                function (
                    changes
                ) {

                    return app.context
                        .setState(
                            changes
                        );

                },

            on:
                function (
                    event,
                    callback
                ) {

                    return app.context
                        .on(
                            event,
                            callback
                        );

                },

            emit:
                function (
                    event,
                    data
                ) {

                    return app.context
                        .emit(
                            event,
                            data
                        );

                }

        };

    }


    /* ========================================================
       23 — CONTRACT DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        const services =
            getServices();


        return {

            name:
                NAME,

            module:
                MODULE_ID,

            version:
                VERSION,

            healthy:
                true,

            services: {

                kernel:
                    !!services.kernel,

                system:
                    !!services.system,

                appManager:
                    !!services.appManager,

                appRegistry:
                    !!services.appRegistry,

                appRouter:
                    !!services.appRouter,

                windowManager:
                    !!services.windowManager,

                launcher:
                    !!services.launcher,

                ai:
                    !!services.ai,

                aiCore:
                    !!services.aiCore,

                language:
                    !!services.language,

                languageManager:
                    !!services.languageManager,

                voice:
                    !!services.voice,

                storage:
                    !!services.storage,

                storageManager:
                    !!services.storageManager

            },

            timestamp:
                isoTime()

        };

    }


    /* ========================================================
       24 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        module:
            MODULE_ID,

        version:
            VERSION,


        /* Constants */

        LIFECYCLE:
            LIFECYCLE,

        CATEGORIES:
            CATEGORIES,

        PERMISSIONS:
            PERMISSIONS,


        /* Helpers */

        normalizeId:
            normalizeId,

        clone:
            clone,

        merge:
            merge,


        /* Definition */

        createDefinition:
            createDefinition,

        validate:
            validate,

        normalize:
            normalize,


        /* Context */

        createContext:
            createContext,

        createEventBus:
            createEventBus,


        /* App */

        createApp:
            createApp,

        createContract:
            createContract,


        /* Defaults */

        createDefaultState:
            createDefaultState,

        createDefaultWindow:
            createDefaultWindow,

        createDefaultSettings:
            createDefaultSettings,


        /* Services */

        getServices:
            getServices,


        /* Diagnostics */

        diagnostics:
            diagnostics

    };


    /* ========================================================
       25 — GLOBAL EXPORTS
       ======================================================== */

    window.HalDoAppContract =
        api;


    window.HalDoOSAppContract =
        api;


    HalDoOS.appContract =
        api;


    /* ========================================================
       26 — KERNEL CONNECTION
       ======================================================== */

    function connectKernel() {

        const kernel =
            window.HalDoKernel ||
            HalDoOS.kernel ||
            null;


        if (!kernel) {

            return false;

        }


        try {

            if (
                typeof kernel.registerModule ===
                "function"
            ) {

                kernel.registerModule(
                    MODULE_ID,
                    api
                );

            }


            if (
                typeof kernel.setModuleReady ===
                "function"
            ) {

                kernel.setModuleReady(
                    MODULE_ID,
                    true
                );

            }


            return true;

        } catch (exception) {

            console.error(
                "[HalDo App Contract]",
                exception
            );


            return false;

        }

    }


    /* ========================================================
       27 — INITIALIZATION
       ======================================================== */

    function initialize() {

        connectKernel();


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
                            VERSION,

                        diagnostics:
                            diagnostics()
                    }
                );

            }

        } catch (_) {}


        try {

            console.log(
                "[HalDo App Contract]",
                "HalDo AI OS 20 App Contract bereit.",
                VERSION
            );

        } catch (_) {}


        return api;

    }


    /* ========================================================
       28 — DOM BOOT
       ======================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once:
                    true
            }
        );

    } else {

        initialize();

    }


    /* ========================================================
       END
       HALDO AI OS 20 APP CONTRACT
       ============================================================ */

})(window, document);