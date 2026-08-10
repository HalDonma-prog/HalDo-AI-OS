// ============================================================
// HalDo AI OS 18
// Professional Ultimate Foundation
// SYSTEM LOADER
// Version 18.0.0
//
// DATEI:
// js/system-loader.js
//
// AKTION:
// KOMPLETTEN INHALT DIESER DATEI ERSETZEN
//
// AUFGABE:
// Zentrale Lade-, Erkennungs- und Verbindungslogik für die
// vorhandenen HalDo-AI-OS-Systeme.
//
// WICHTIG:
// Bestehende Module werden NICHT ersetzt.
// Der Loader erkennt vorhandene APIs und verbindet sie.
// ============================================================

(function (window, document) {

    "use strict";

    // ========================================================
    // GRUNDKONFIGURATION
    // ========================================================

    const VERSION = "18.0.0";
    const NAME = "HalDo AI OS";
    const EDITION = "Professional Ultimate Foundation";

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};

    // ========================================================
    // LOADER STATE
    // ========================================================

    const state = {
        version: VERSION,
        name: NAME,
        edition: EDITION,

        status: "created",

        started: false,
        ready: false,

        domReady: false,

        modulesDetected: 0,
        modulesConnected: 0,
        modulesFailed: 0,

        startTime: null,
        readyTime: null,

        errors: [],
        warnings: [],

        modules: {}
    };

    // ========================================================
    // EVENT SYSTEM
    // ========================================================

    const listeners = {};

    function on(eventName, callback) {

        if (
            typeof callback !== "function"
        ) {
            return function () {};
        }

        if (!listeners[eventName]) {
            listeners[eventName] = [];
        }

        listeners[eventName].push(
            callback
        );

        return function unsubscribe() {

            off(
                eventName,
                callback
            );

        };
    }

    function off(eventName, callback) {

        if (
            !listeners[eventName]
        ) {
            return;
        }

        listeners[eventName] =
            listeners[eventName]
                .filter(
                    function (item) {
                        return item !== callback;
                    }
                );

    }

    function emit(eventName, data) {

        if (
            !listeners[eventName]
        ) {
            return;
        }

        listeners[eventName]
            .slice()
            .forEach(
                function (callback) {

                    try {

                        callback(data);

                    } catch (error) {

                        console.error(
                            "[HalDo System Loader] Event error:",
                            error
                        );

                    }

                }
            );

    }

    // ========================================================
    // LOGGING
    // ========================================================

    function log() {

        console.log(
            "[HalDo System Loader]",
            ...arguments
        );

    }

    function warn(message, error) {

        const item = {
            message: message,
            error: error || null,
            time: new Date().toISOString()
        };

        state.warnings.push(item);

        console.warn(
            "[HalDo System Loader]",
            message,
            error || ""
        );

        emit(
            "loader:warning",
            item
        );

    }

    function fail(message, error) {

        const item = {
            message: message,
            error: error || null,
            time: new Date().toISOString()
        };

        state.errors.push(item);

        console.error(
            "[HalDo System Loader]",
            message,
            error || ""
        );

        emit(
            "loader:error",
            item
        );

    }

    // ========================================================
    // MODULE DEFINITIONS
    // ========================================================

    const moduleDefinitions = [

        {
            id: "kernel",
            name: "Kernel",
            global: "HalDoKernel",
            aliases: [
                "HalDoOS.kernel"
            ],
            required: true
        },

        {
            id: "system",
            name: "System",
            global: "HalDoSystem",
            aliases: [
                "HalDoOS.system"
            ],
            required: true
        },

        {
            id: "module-manager",
            name: "Module Manager",
            global: "HalDoModuleManager",
            aliases: [
                "HalDoOS.moduleManager"
            ],
            required: false
        },

        {
            id: "app-manager",
            name: "App Manager",
            global: "HalDoAppManager",
            aliases: [
                "HalDoOS.appManager"
            ],
            required: false
        },

        {
            id: "app-registry",
            name: "App Registry",
            global: "HalDoAppRegistry",
            aliases: [
                "HalDoOS.appRegistry"
            ],
            required: false
        },

        {
            id: "app-router",
            name: "App Router",
            global: "HalDoAppRouter",
            aliases: [
                "HalDoOS.appRouter"
            ],
            required: false
        },

        {
            id: "launcher",
            name: "Launcher",
            global: "HalDoLauncher",
            aliases: [
                "HalDoOS.launcher"
            ],
            required: false
        },

        {
            id: "ai-core",
            name: "AI Core",
            global: "HalDoAICore",
            aliases: [
                "HalDoOS.aiCore"
            ],
            required: false
        },

        {
            id: "ai-engine",
            name: "AI Engine",
            global: "HalDoAIEngine",
            aliases: [
                "HalDoOS.aiEngine"
            ],
            required: false
        },

        {
            id: "ai-chat",
            name: "AI Chat",
            global: "HalDoAIChat",
            aliases: [
                "HalDoOS.aiChat"
            ],
            required: false
        },

        {
            id: "ai-language",
            name: "AI Language",
            global: "HalDoAILanguage",
            aliases: [
                "HalDoOS.aiLanguage"
            ],
            required: false
        },

        {
            id: "ai-memory",
            name: "AI Memory",
            global: "HalDoAIMemory",
            aliases: [
                "HalDoOS.aiMemory"
            ],
            required: false
        },

        {
            id: "voice",
            name: "Voice",
            global: "HalDoVoice",
            aliases: [
                "HalDoOS.voice"
            ],
            required: false
        },

        {
            id: "ezidi-keyboard",
            name: "Êzîdî Keyboard",
            global: "HalDoEzidiKeyboard",
            aliases: [
                "HalDoOS.ezidiKeyboard"
            ],
            required: false
        },

        {
            id: "language-manager",
            name: "Language Manager",
            global: "HalDoLanguageManager",
            aliases: [
                "HalDoOS.languageManager"
            ],
            required: false
        },

        {
            id: "language-system",
            name: "Language System",
            global: "HalDoLanguageSystem",
            aliases: [
                "HalDoOS.languageSystem"
            ],
            required: false
        },

        {
            id: "storage",
            name: "Storage",
            global: "HalDoStorage",
            aliases: [
                "HalDoOS.storage"
            ],
            required: false
        },

        {
            id: "storage-manager",
            name: "Storage Manager",
            global: "HalDoStorageManager",
            aliases: [
                "HalDoOS.storageManager"
            ],
            required: false
        },

        {
            id: "config-manager",
            name: "Config Manager",
            global: "HalDoConfigManager",
            aliases: [
                "HalDoOS.configManager"
            ],
            required: false
        },

        {
            id: "window-manager",
            name: "Window Manager",
            global: "HalDoWindowManager",
            aliases: [
                "HalDoOS.windowManager"
            ],
            required: false
        },

        {
            id: "shell-manager",
            name: "Shell Manager",
            global: "HalDoShellManager",
            aliases: [
                "HalDoOS.shellManager"
            ],
            required: false
        },

        {
            id: "conversation-state",
            name: "Conversation State",
            global: "HalDoConversationState",
            aliases: [
                "HalDoOS.conversationState"
            ],
            required: false
        },

        {
            id: "system-status",
            name: "System Status",
            global: "HalDoSystemStatus",
            aliases: [
                "HalDoOS.systemStatus"
            ],
            required: false
        },

        {
            id: "boot",
            name: "Boot",
            global: "HalDoBoot",
            aliases: [
                "HalDoOS.boot"
            ],
            required: false
        },

        {
            id: "startup",
            name: "Startup",
            global: "HalDoStartup",
            aliases: [
                "HalDoOS.startup"
            ],
            required: false
        },

        {
            id: "logo-intro-manager",
            name: "Logo Intro Manager",
            global: "HalDoLogoIntroManager",
            aliases: [
                "HalDoOS.logoIntroManager"
            ],
            required: false
        },

        {
            id: "logo-animation-manager",
            name: "Logo Animation Manager",
            global: "HalDoLogoAnimationManager",
            aliases: [
                "HalDoOS.logoAnimationManager"
            ],
            required: false
        },

        {
            id: "haldo-light-system",
            name: "HalDo Light System",
            global: "HalDoLightSystem",
            aliases: [
                "HalDoOS.lightSystem"
            ],
            required: false
        },

        {
            id: "desktop-manager",
            name: "Desktop Manager",
            global: "HalDoDesktopManager",
            aliases: [
                "HalDoOS.desktopManager"
            ],
            required: false
        }
    ];

    // ========================================================
    // GLOBAL LOOKUP
    // ========================================================

    function getByPath(path) {

        if (
            typeof path !== "string" ||
            !path
        ) {
            return null;
        }

        const parts =
            path.split(".");

        let current =
            window;

        for (
            let index = 0;
            index < parts.length;
            index++
        ) {

            if (
                current == null ||
                typeof current !== "object" &&
                typeof current !== "function"
            ) {
                return null;
            }

            current =
                current[parts[index]];

        }

        return current || null;

    }

    function findModule(definition) {

        const candidates = [
            definition.global,
            ...(definition.aliases || [])
        ];

        for (
            let index = 0;
            index < candidates.length;
            index++
        ) {

            const candidate =
                getByPath(
                    candidates[index]
                );

            if (candidate) {

                return {
                    api: candidate,
                    path: candidates[index]
                };

            }

        }

        return null;

    }

    // ========================================================
    // MODULE DETECTION
    // ========================================================

    function detectModules() {

        state.modulesDetected = 0;

        moduleDefinitions.forEach(
            function (definition) {

                const found =
                    findModule(
                        definition
                    );

                const record = {
                    id: definition.id,
                    name: definition.name,
                    required:
                        !!definition.required,

                    global:
                        definition.global,

                    aliases:
                        definition.aliases || [],

                    detected:
                        !!found,

                    connected: false,
                    ready: false,

                    api:
                        found
                            ? found.api
                            : null,

                    path:
                        found
                            ? found.path
                            : null,

                    error: null
                };

                state.modules[
                    definition.id
                ] = record;

                if (found) {

                    state.modulesDetected++;

                    log(
                        "Modul erkannt:",
                        definition.name,
                        found.path
                    );

                } else if (
                    definition.required
                ) {

                    warn(
                        "Pflichtmodul nicht gefunden: " +
                        definition.name
                    );

                }

            }
        );

        emit(
            "loader:modules-detected",
            getModules()
        );

        return getModules();

    }

    // ========================================================
    // MODULE GETTER
    // ========================================================

    function getModule(id) {

        const record =
            state.modules[id];

        if (!record) {
            return null;
        }

        return record.api || null;

    }

    function getRecord(id) {

        return state.modules[id] || null;

    }

    function getModules() {

        return Object.keys(
            state.modules
        ).map(
            function (id) {

                const record =
                    state.modules[id];

                return {
                    id: record.id,
                    name: record.name,
                    required: record.required,
                    detected: record.detected,
                    connected: record.connected,
                    ready: record.ready,
                    path: record.path,
                    error: record.error
                };

            }
        );

    }

    // ========================================================
    // READY DETECTION
    // ========================================================

    function isReady(api) {

        if (!api) {
            return false;
        }

        if (
            typeof api.isReady ===
            "function"
        ) {

            try {
                return !!api.isReady();
            } catch (error) {
                return false;
            }

        }

        if (
            typeof api.ready ===
            "boolean"
        ) {
            return api.ready;
        }

        if (
            typeof api.initialized ===
            "boolean"
        ) {
            return api.initialized;
        }

        if (
            typeof api.status ===
            "string"
        ) {

            const status =
                api.status.toLowerCase();

            return (
                status === "ready" ||
                status === "running" ||
                status === "initialized"
            );

        }

        return true;

    }

    // ========================================================
    // SAFE INITIALIZE
    // ========================================================

    function initializeModule(
        record
    ) {

        if (!record || !record.api) {
            return false;
        }

        if (record.connected) {
            return true;
        }

        const api =
            record.api;

        try {

            if (
                typeof api.init ===
                "function"
            ) {

                api.init();

            }

            record.connected = true;
            record.ready =
                isReady(api);

            state.modulesConnected++;

            emit(
                "loader:module-connected",
                {
                    id: record.id,
                    name: record.name,
                    ready: record.ready
                }
            );

            return true;

        } catch (error) {

            record.error =
                error;

            state.modulesFailed++;

            fail(
                "Modul konnte nicht initialisiert werden: " +
                record.name,
                error
            );

            return false;

        }

    }

    // ========================================================
    // KERNEL CONNECTION
    // ========================================================

    function connectKernel() {

        const record =
            getRecord("kernel");

        if (!record || !record.api) {

            warn(
                "Kernel ist noch nicht verfügbar."
            );

            return false;

        }

        const kernel =
            record.api;

        try {

            if (
                typeof kernel.on ===
                "function"
            ) {

                kernel.on(
                    "ready",
                    function (data) {

                        record.ready = true;

                        emit(
                            "loader:kernel-ready",
                            data
                        );

                    }
                );

                kernel.on(
                    "error",
                    function (error) {

                        emit(
                            "loader:kernel-error",
                            error
                        );

                    }
                );

            }

            if (
                typeof kernel.getModule ===
                "function"
            ) {

                [
                    "system",
                    "app-manager",
                    "app-router",
                    "launcher"
                ].forEach(
                    function (id) {

                        const module =
                            kernel.getModule(
                                id
                            );

                        if (
                            module &&
                            !state.modules[id].api
                        ) {

                            state.modules[id].api =
                                module;

                            state.modules[id].detected =
                                true;

                        }

                    }
                );

            }

            record.connected = true;
            record.ready =
                isReady(kernel);

            return true;

        } catch (error) {

            fail(
                "Kernel-Verbindung fehlgeschlagen.",
                error
            );

            return false;

        }

    }

    // ========================================================
    // SYSTEM CONNECTION
    // ========================================================

    function connectSystem() {

        const record =
            getRecord("system");

        if (!record || !record.api) {

            warn(
                "System-Modul ist noch nicht verfügbar."
            );

            return false;

        }

        const system =
            record.api;

        try {

            if (
                typeof system.on ===
                "function"
            ) {

                system.on(
                    "ready",
                    function (data) {

                        record.ready = true;

                        emit(
                            "loader:system-ready",
                            data
                        );

                    }
                );

            }

            record.connected = true;
            record.ready =
                isReady(system);

            return true;

        } catch (error) {

            fail(
                "System-Verbindung fehlgeschlagen.",
                error
            );

            return false;

        }

    }

    // ========================================================
    // APP SYSTEM CONNECTION
    // ========================================================

    function connectAppSystem() {

        const appManager =
            getModule(
                "app-manager"
            );

        const appRegistry =
            getModule(
                "app-registry"
            );

        const appRouter =
            getModule(
                "app-router"
            );

        const launcher =
            getModule(
                "launcher"
            );

        if (appManager) {

            state.modules[
                "app-manager"
            ].connected = true;

        }

        if (appRegistry) {

            state.modules[
                "app-registry"
            ].connected = true;

        }

        if (appRouter) {

            state.modules[
                "app-router"
            ].connected = true;

        }

        if (launcher) {

            state.modules[
                "launcher"
            ].connected = true;

        }

        emit(
            "loader:app-system-connected",
            {
                appManager:
                    !!appManager,

                appRegistry:
                    !!appRegistry,

                appRouter:
                    !!appRouter,

                launcher:
                    !!launcher
            }
        );

        return true;

    }

    // ========================================================
    // AI SYSTEM CONNECTION
    // ========================================================

    function connectAISystem() {

        const aiCore =
            getModule(
                "ai-core"
            );

        const aiEngine =
            getModule(
                "ai-engine"
            );

        const aiChat =
            getModule(
                "ai-chat"
            );

        const aiLanguage =
            getModule(
                "ai-language"
            );

        const aiMemory =
            getModule(
                "ai-memory"
            );

        emit(
            "loader:ai-system-connected",
            {
                aiCore: !!aiCore,
                aiEngine: !!aiEngine,
                aiChat: !!aiChat,
                aiLanguage: !!aiLanguage,
                aiMemory: !!aiMemory
            }
        );

        return true;

    }

    // ========================================================
    // STORAGE CONNECTION
    // ========================================================

    function connectStorage() {

        const storage =
            getModule(
                "storage"
            );

        const manager =
            getModule(
                "storage-manager"
            );

        const config =
            getModule(
                "config-manager"
            );

        emit(
            "loader:storage-connected",
            {
                storage:
                    !!storage,

                storageManager:
                    !!manager,

                configManager:
                    !!config
            }
        );

        return true;

    }

    // ========================================================
    // LANGUAGE CONNECTION
    // ========================================================

    function connectLanguageSystem() {

        const languageManager =
            getModule(
                "language-manager"
            );

        const languageSystem =
            getModule(
                "language-system"
            );

        const aiLanguage =
            getModule(
                "ai-language"
            );

        emit(
            "loader:language-connected",
            {
                manager:
                    !!languageManager,

                system:
                    !!languageSystem,

                ai:
                    !!aiLanguage
            }
        );

        return true;

    }

    // ========================================================
    // VOICE CONNECTION
    // ========================================================

    function connectVoiceSystem() {

        const voice =
            getModule(
                "voice"
            );

        emit(
            "loader:voice-connected",
            {
                voice:
                    !!voice
            }
        );

        return true;

    }

    // ========================================================
    // KEYBOARD CONNECTION
    // ========================================================

    function connectKeyboardSystem() {

        const keyboard =
            getModule(
                "ezidi-keyboard"
            );

        emit(
            "loader:keyboard-connected",
            {
                keyboard:
                    !!keyboard
            }
        );

        return true;

    }

    // ========================================================
    // VISUAL SYSTEM CONNECTION
    // ========================================================

    function connectVisualSystems() {

        const logoIntro =
            getModule(
                "logo-intro-manager"
            );

        const logoAnimation =
            getModule(
                "logo-animation-manager"
            );

        const lightSystem =
            getModule(
                "haldo-light-system"
            );

        emit(
            "loader:visual-connected",
            {
                logoIntro:
                    !!logoIntro,

                logoAnimation:
                    !!logoAnimation,

                lightSystem:
                    !!lightSystem
            }
        );

        return true;

    }

    // ========================================================
    // INITIALIZE AVAILABLE MODULES
    // ========================================================

    function initializeAvailableModules() {

        Object.keys(
            state.modules
        ).forEach(
            function (id) {

                const record =
                    state.modules[id];

                if (
                    !record.detected ||
                    !record.api
                ) {
                    return;
                }

                if (
                    id === "kernel" ||
                    id === "system"
                ) {
                    return;
                }

                initializeModule(
                    record
                );

            }
        );

    }

    // ========================================================
    // CONNECT ALL SYSTEMS
    // ========================================================

    function connectSystems() {

        connectKernel();

        connectSystem();

        connectAppSystem();

        connectAISystem();

        connectStorage();

        connectLanguageSystem();

        connectVoiceSystem();

        connectKeyboardSystem();

        connectVisualSystems();

        emit(
            "loader:systems-connected",
            getModules()
        );

    }

    // ========================================================
    // REQUIRED MODULE CHECK
    // ========================================================

    function checkRequiredModules() {

        const required =
            moduleDefinitions
                .filter(
                    function (definition) {
                        return definition.required;
                    }
                );

        const missing =
            required.filter(
                function (definition) {

                    const record =
                        state.modules[
                            definition.id
                        ];

                    return !record ||
                        !record.detected;

                }
            );

        if (missing.length) {

            missing.forEach(
                function (definition) {

                    warn(
                        "Pflichtmodul fehlt: " +
                        definition.name
                    );

                }
            );

            return false;

        }

        return true;

    }

    // ========================================================
    // PUBLIC STATE
    // ========================================================

    function getState() {

        return {
            version:
                state.version,

            name:
                state.name,

            edition:
                state.edition,

            status:
                state.status,

            started:
                state.started,

            ready:
                state.ready,

            domReady:
                state.domReady,

            modulesDetected:
                state.modulesDetected,

            modulesConnected:
                state.modulesConnected,

            modulesFailed:
                state.modulesFailed,

            startTime:
                state.startTime,

            readyTime:
                state.readyTime,

            errors:
                state.errors.slice(),

            warnings:
                state.warnings.slice(),

            modules:
                getModules()
        };

    }

    // ========================================================
    // START LOADER
    // ========================================================

    function start() {

        if (state.started) {

            return getState();

        }

        state.started = true;
        state.status = "loading";
        state.startTime =
            new Date().toISOString();

        log(
            "HalDo AI OS 18 System Loader startet."
        );

        emit(
            "loader:start",
            getState()
        );

        detectModules();

        checkRequiredModules();

        initializeAvailableModules();

        connectSystems();

        state.status =
            "loaded";

        emit(
            "loader:loaded",
            getState()
        );

        return getState();

    }

    // ========================================================
    // MARK READY
    // ========================================================

    function markReady() {

        state.ready = true;
        state.status = "ready";
        state.readyTime =
            new Date().toISOString();

        emit(
            "loader:ready",
            getState()
        );

        log(
            "HalDo AI OS 18 System Loader bereit."
        );

        return getState();

    }

    // ========================================================
    // WAIT FOR DOM
    // ========================================================

    function onDOMReady() {

        if (state.domReady) {
            return;
        }

        state.domReady = true;

        emit(
            "loader:dom-ready"
        );

        start();

    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            onDOMReady,
            {
                once: true
            }
        );

    } else {

        onDOMReady();

    }

    // ========================================================
    // GLOBAL API
    // ========================================================

    HalDoOS.systemLoader = {

        name:
            NAME,

        version:
            VERSION,

        edition:
            EDITION,

        start:
            start,

        ready:
            markReady,

        getState:
            getState,

        getModule:
            getModule,

        getRecord:
            getRecord,

        getModules:
            getModules,

        detect:
            detectModules,

        connect:
            connectSystems,

        on:
            on,

        off:
            off,

        emit:
            emit
    };

    window.HalDoSystemLoader =
        HalDoOS.systemLoader;

    // ========================================================
    // KOMPATIBILITÄTS-API
    // ========================================================

    HalDoOS.getSystemLoader =
        function () {

            return HalDoOS.systemLoader;

        };

    // ========================================================
    // KERNEL / SYSTEM EVENTS
    // ========================================================

    function attachExistingEvents() {

        const kernel =
            getModule("kernel");

        const system =
            getModule("system");

        if (
            kernel &&
            typeof kernel.on ===
            "function"
        ) {

            try {

                kernel.on(
                    "ready",
                    function (data) {

                        state.modules.kernel.ready =
                            true;

                        emit(
                            "kernel:ready",
                            data
                        );

                        if (
                            state.status !==
                            "ready"
                        ) {

                            markReady();

                        }

                    }
                );

            } catch (error) {

                warn(
                    "Kernel Events konnten nicht verbunden werden.",
                    error
                );

            }

        }

        if (
            system &&
            typeof system.on ===
            "function"
        ) {

            try {

                system.on(
                    "ready",
                    function (data) {

                        state.modules.system.ready =
                            true;

                        emit(
                            "system:ready",
                            data
                        );

                    }
                );

            } catch (error) {

                warn(
                    "System Events konnten nicht verbunden werden.",
                    error
                );

            }

        }

    }

    // ========================================================
    // RETRY
    // ========================================================

    function retryConnection() {

        try {

            detectModules();

            initializeAvailableModules();

            connectSystems();

            attachExistingEvents();

            emit(
                "loader:retry",
                getState()
            );

            return true;

        } catch (error) {

            fail(
                "System-Verbindung konnte nicht erneut aufgebaut werden.",
                error
            );

            return false;

        }

    }

    HalDoOS.systemLoader.retry =
        retryConnection;

    // ========================================================
    // GLOBAL ERROR PROTECTION
    // ========================================================

    window.addEventListener(
        "error",
        function (event) {

            if (!event) {
                return;
            }

            emit(
                "loader:runtime-error",
                event.error ||
                event.message
            );

        }
    );

    window.addEventListener(
        "unhandledrejection",
        function (event) {

            if (!event) {
                return;
            }

            emit(
                "loader:promise-error",
                event.reason
            );

        }
    );

    // ========================================================
    // INITIAL EVENT ATTACHMENT
    // ========================================================

    try {

        attachExistingEvents();

    } catch (error) {

        warn(
            "Initiale Event-Verbindung konnte nicht vollständig aufgebaut werden.",
            error
        );

    }

    // ========================================================
    // DEBUG API
    // ========================================================

    HalDoOS.systemLoader.debug =
        function () {

            return {
                state:
                    getState(),

                definitions:
                    moduleDefinitions.map(
                        function (definition) {

                            return {
                                id:
                                    definition.id,

                                name:
                                    definition.name,

                                required:
                                    !!definition.required,

                                global:
                                    definition.global
                            };

                        }
                    )
            };

        };

    // ========================================================
    // ABSCHLUSS
    // ========================================================

    log(
        "System Loader registriert:",
        VERSION,
        EDITION
    );

})(window, document);