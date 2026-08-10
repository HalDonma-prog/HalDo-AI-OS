// ============================================================

// HalDo AI OS 18

// HALDO OS BRIDGE

// ============================================================

// Zentrale Verbindungsschicht für das gesamte Betriebssystem.

//

// WICHTIG:

// Diese Datei ersetzt NICHT:

// - app-manager.js

// - app-router.js

// - app-registry.js

// - system-loader.js

//

// Diese Bridge arbeitet daneben und verbindet vorhandene

// Systeme über eine gemeinsame API.

//

// Version: 18.0.0

// Edition: Professional Ultimate Foundation

// ============================================================

(function (window, document) {

    "use strict";

    // ========================================================

    // GLOBAL ROOT

    // ========================================================

    const OS =

        window.HalDoOS =

        window.HalDoOS || {};

    const BRIDGE_VERSION = "18.0.0";

    // ========================================================

    // INTERNAL STATE

    // ========================================================

    const state = {

        ready: false,

        booted: false,

        version: BRIDGE_VERSION,

        lastAction: null,

        activeApp: "home",

        apps: {},

        modules: {},

        data: {},

        events: {},

        history: [],

        update: {

            status: "ready",

            version: BRIDGE_VERSION,

            lastCheck: null,

            available: false

        }

    };

    // ========================================================

    // EVENT BUS

    // ========================================================

    function on(event, callback) {

        if (

            typeof callback !== "function"

        ) {

            return function () {};

        }

        if (!state.events[event]) {

            state.events[event] = [];

        }

        state.events[event].push(callback);

        return function unsubscribe() {

            off(event, callback);

        };

    }

    function off(event, callback) {

        const listeners =

            state.events[event];

        if (!listeners) {

            return;

        }

        state.events[event] =

            listeners.filter(

                function (listener) {

                    return listener !== callback;

                }

            );

    }

    function emit(event, payload) {

        const listeners =

            state.events[event] || [];

        listeners.slice().forEach(

            function (listener) {

                try {

                    listener(payload);

                } catch (error) {

                    console.error(

                        "HalDo Bridge Event Error:",

                        event,

                        error

                    );

                }

            }

        );

        // Vorhandenen HalDoOS Event-Bus ebenfalls

        // verwenden, wenn vorhanden.

        try {

            if (

                OS.events &&

                typeof OS.events.emit ===

                "function"

            ) {

                OS.events.emit(

                    event,

                    payload

                );

            }

        } catch (error) {

            console.warn(

                "HalDoOS Event-Bus konnte nicht verwendet werden.",

                error

            );

        }

    }

    // ========================================================

    // SAFE ACCESS

    // ========================================================

    function getGlobal(name) {

        try {

            return window[name];

        } catch (error) {

            return null;

        }

    }

    function isFunction(value) {

        return typeof value === "function";

    }

    function isObject(value) {

        return (

            value !== null &&

            typeof value === "object"

        );

    }

    // ========================================================

    // MODULE DETECTION

    // ========================================================

    function detectModule(

        name,

        globalName

    ) {

        const object =

            getGlobal(globalName);

        const available =

            !!object;

        state.modules[name] = {

            name: name,

            global: globalName,

            available: available,

            connected: available,

            timestamp:

                Date.now()

        };

        emit(

            "bridge:module",

            state.modules[name]

        );

        return object;

    }

    function scanModules() {

        detectModule(

            "kernel",

            "HalDoKernel"

        );

        detectModule(

            "system",

            "HalDoSystem"

        );

        detectModule(

            "aiCore",

            "HalDoAICore"

        );

        detectModule(

            "aiMemory",

            "HalDoAIMemory"

        );

        detectModule(

            "aiChat",

            "HalDoAIChat"

        );

        detectModule(

            "aiEngine",

            "HalDoAIEngine"

        );

        detectModule(

            "language",

            "HalDoLanguage"

        );

        detectModule(

            "languageManager",

            "HalDoLanguageManager"

        );

        detectModule(

            "voice",

            "HalDoVoice"

        );

        detectModule(

            "speech",

            "HalDoSpeech"

        );

        detectModule(

            "aiVoice",

            "HalDoAIVoice"

        );

        detectModule(

            "keyboard",

            "HalDoKeyboard"

        );

        detectModule(

            "ezidiKeyboard",

            "HalDoEzidiKeyboard"

        );

        detectModule(

            "storage",

            "HalDoStorage"

        );

        detectModule(

            "storageManager",

            "HalDoStorageManager"

        );

        detectModule(

            "config",

            "HalDoConfig"

        );

        detectModule(

            "conversation",

            "HalDoConversation"

        );

        detectModule(

            "systemStatus",

            "HalDoSystemStatus"

        );

        detectModule(

            "moduleManager",

            "HalDoModuleManager"

        );

        detectModule(

            "windowManager",

            "HalDoWindowManager"

        );

        detectModule(

            "light",

            "HalDoLight"

        );

    }

    // ========================================================

    // APP REGISTRY

    // ========================================================

    function registerApp(config) {

        if (!config) {

            return false;

        }

        const id =

            String(

                config.id ||

                config.name ||

                ""

            ).trim();

        if (!id) {

            return false;

        }

        state.apps[id] = {

            id: id,

            name:

                config.name ||

                id,

            description:

                config.description ||

                "",

            category:

                config.category ||

                "system",

            version:

                config.version ||

                BRIDGE_VERSION,

            icon:

                config.icon ||

                "◈",

            status:

                config.status ||

                "ready",

            capabilities:

                Array.isArray(

                    config.capabilities

                )

                    ? config.capabilities.slice()

                    : [],

            open:

                isFunction(config.open)

                    ? config.open

                    : null,

            execute:

                isFunction(config.execute)

                    ? config.execute

                    : null,

            data:

                isObject(config.data)

                    ? config.data

                    : {}

        };

        emit(

            "app:registered",

            state.apps[id]

        );

        return true;

    }

    function registerApps(list) {

        if (!Array.isArray(list)) {

            return 0;

        }

        let count = 0;

        list.forEach(

            function (app) {

                if (

                    registerApp(app)

                ) {

                    count++;

                }

            }

        );

        return count;

    }

    function getApp(id) {

        return state.apps[id] || null;

    }

    function getApps() {

        return Object.values(

            state.apps

        );

    }

    // ========================================================

    // COMPLETE FOUNDATION APP CATALOG

    // ========================================================

    registerApps([

        {

            id: "home",

            name: "Home",

            category: "system",

            icon: "⌂",

            description:

                "Zentrale HalDo AI OS Oberfläche.",

            capabilities: [

                "navigation",

                "dashboard",

                "status"

            ]

        },

        {

            id: "chat",

            name: "HalDo AI",

            category: "ai",

            icon: "✦",

            description:

                "AI-Unterhaltung und Fragen beantworten.",

            capabilities: [

                "chat",

                "conversation",

                "memory",

                "knowledge"

            ]

        },

        {

            id: "ai-core",

            name: "AI Core",

            category: "ai",

            icon: "◎",

            description:

                "Zentrale AI-Verarbeitung.",

            capabilities: [

                "reasoning",

                "commands",

                "responses"

            ]

        },

        {

            id: "memory",

            name: "AI Memory",

            category: "ai",

            icon: "◇",

            description:

                "Gespeicherte AI-Daten und Kontext.",

            capabilities: [

                "memory",

                "storage"

            ]

        },

        {

            id: "knowledge",

            name: "Knowledge",

            category: "ai",

            icon: "▱",

            description:

                "Wissens- und Informationssystem.",

            capabilities: [

                "knowledge",

                "learning"

            ]

        },

        {

            id: "learning",

            name: "Learning",

            category: "ai",

            icon: "◆",

            description:

                "Lern- und Trainingssystem.",

            capabilities: [

                "learning",

                "knowledge"

            ]

        },

        {

            id: "code",

            name: "Code Builder",

            category: "development",

            icon: "</>",

            description:

                "Code- und Softwareentwicklung.",

            capabilities: [

                "code",

                "files",

                "software"

            ]

        },

        {

            id: "voice",

            name: "Voice",

            category: "communication",

            icon: "◉",

            description:

                "Sprachsteuerung.",

            capabilities: [

                "voice",

                "microphone"

            ]

        },

        {

            id: "speech",

            name: "Speech",

            category: "communication",

            icon: "◌",

            description:

                "Sprachausgabe und Sprachverarbeitung.",

            capabilities: [

                "speech",

                "tts"

            ]

        },

        {

            id: "keyboard",

            name: "Êzîdî Keyboard",

            category: "tools",

            icon: "⌨",

            description:

                "Êzîdî-Tastatur und eigene Zeichen.",

            capabilities: [

                "keyboard",

                "ezidi"

            ]

        },

        {

            id: "languages",

            name: "Languages",

            category: "system",

            icon: "文",

            description:

                "Sprachverwaltung.",

            capabilities: [

                "language",

                "translation"

            ]

        },

        {

            id: "apps",

            name: "App Center",

            category: "system",

            icon: "◈",

            description:

                "Alle HalDo-Anwendungen.",

            capabilities: [

                "apps",

                "install",

                "manage"

            ]

        },

        {

            id: "modules",

            name: "Module",

            category: "system",

            icon: "⬡",

            description:

                "Systemmodule.",

            capabilities: [

                "modules",

                "diagnostics"

            ]

        },

        {

            id: "storage",

            name: "Storage",

            category: "system",

            icon: "◫",

            description:

                "Lokale Datenverwaltung.",

            capabilities: [

                "storage",

                "data"

            ]

        },

        {

            id: "settings",

            name: "Settings",

            category: "system",

            icon: "⚙",

            description:

                "Systemeinstellungen.",

            capabilities: [

                "settings",

                "configuration"

            ]

        },

        {

            id: "notifications",

            name: "Notifications",

            category: "system",

            icon: "◇",

            description:

                "Systembenachrichtigungen.",

            capabilities: [

                "notifications"

            ]

        },

        {

            id: "diagnostics",

            name: "Diagnostics",

            category: "system",

            icon: "✓",

            description:

                "Systemdiagnose.",

            capabilities: [

                "diagnostics",

                "health"

            ]

        },

        {

            id: "status",

            name: "System Status",

            category: "system",

            icon: "●",

            description:

                "Live-Systemstatus.",

            capabilities: [

                "status",

                "monitoring"

            ]

        },

        {

            id: "update",

            name: "Software Update",

            category: "system",

            icon: "↻",

            description:

                "Software-Update-Center.",

            capabilities: [

                "update",

                "version",

                "software"

            ]

        },

        {

            id: "dashboard",

            name: "Dashboard",

            category: "system",

            icon: "▦",

            description:

                "Gesamtübersicht.",

            capabilities: [

                "dashboard",

                "monitoring"

            ]

        },

        {

            id: "file-system",

            name: "File System",

            category: "system",

            icon: "▤",

            description:

                "Dateien und Softwarebestand.",

            capabilities: [

                "files",

                "storage",

                "software"

            ]

        },

        {

            id: "help",

            name: "Help",

            category: "system",

            icon: "?",

            description:

                "HalDo AI OS Hilfe.",

            capabilities: [

                "help",

                "documentation"

            ]

        },

        {

            id: "about",

            name: "About HalDo",

            category: "system",

            icon: "ⓘ",

            description:

                "Informationen über HalDo AI OS.",

            capabilities: [

                "information"

            ]

        }

    ]);

    // ========================================================

    // STORAGE BRIDGE

    // ========================================================

    function setData(

        key,

        value

    ) {

        state.data[key] =

            value;

        const storage =

            getGlobal(

                "HalDoStorage"

            );

        try {

            if (

                storage &&

                isFunction(

                    storage.set

                )

            ) {

                storage.set(

                    key,

                    value

                );

            } else {

                localStorage.setItem(

                    "haldo18:" + key,

                    JSON.stringify(value)

                );

            }

        } catch (error) {

            console.warn(

                "HalDo Bridge Storage Fehler:",

                error

            );

        }

        emit(

            "data:changed",

            {

                key: key,

                value: value

            }

        );

        return value;

    }

    function getData(

        key,

        fallback

    ) {

        if (

            Object.prototype.hasOwnProperty.call(

                state.data,

                key

            )

        ) {

            return state.data[key];

        }

        const storage =

            getGlobal(

                "HalDoStorage"

            );

        try {

            if (

                storage &&

                isFunction(

                    storage.get

                )

            ) {

                const result =

                    storage.get(

                        key

                    );

                if (

                    result !== undefined &&

                    result !== null

                ) {

                    state.data[key] =

                        result;

                    return result;

                }

            }

            const raw =

                localStorage.getItem(

                    "haldo18:" + key

                );

            if (raw !== null) {

                const result =

                    JSON.parse(raw);

                state.data[key] =

                    result;

                return result;

            }

        } catch (error) {

            console.warn(

                "HalDo Bridge Data Fehler:",

                error

            );

        }

        return fallback;

    }

    function removeData(key) {

        delete state.data[key];

        try {

            localStorage.removeItem(

                "haldo18:" + key

            );

        } catch (error) {

            console.warn(

                "HalDo Storage Remove Fehler:",

                error

            );

        }

        emit(

            "data:removed",

            key

        );

    }

    // ========================================================

    // APP COMMUNICATION

    // ========================================================

    function send(

        from,

        to,

        action,

        payload

    ) {

        const message = {

            id:

                "msg-" +

                Date.now() +

                "-" +

                Math.random()

                    .toString(36)

                    .slice(2),

            from:

                from || "system",

            to:

                to || "*",

            action:

                action || "message",

            payload:

                payload,

            timestamp:

                Date.now()

        };

        state.history.push(

            message

        );

        if (

            state.history.length > 500

        ) {

            state.history.shift();

        }

        emit(

            "message",

            message

        );

        emit(

            "message:" +

            message.to,

            message

        );

        return message;

    }

    function broadcast(

        from,

        action,

        payload

    ) {

        return send(

            from,

            "*",

            action,

            payload

        );

    }

    // ========================================================

    // APP OPEN

    // ========================================================

    function openApp(

        id,

        data

    ) {

        const app =

            getApp(id);

        if (!app) {

            console.warn(

                "HalDo App nicht gefunden:",

                id

            );

            return false;

        }

        state.activeApp =

            id;

        state.lastAction =

            "open:" + id;

        send(

            "bridge",

            id,

            "open",

            data || null

        );

        if (

            app.open

        ) {

            try {

                app.open(data);

            } catch (error) {

                console.error(

                    "HalDo App Open Fehler:",

                    id,

                    error

                );

            }

        }

        emit(

            "app:opened",

            {

                app: app,

                data: data || null

            }

        );

        return true;

    }

    // ========================================================

    // APP EXECUTION

    // ========================================================

    function executeApp(

        id,

        action,

        payload

    ) {

        const app =

            getApp(id);

        if (!app) {

            return null;

        }

        state.lastAction =

            id + ":" + action;

        const message =

            send(

                "bridge",

                id,

                action,

                payload

            );

        if (

            app.execute

        ) {

            try {

                return app.execute(

                    action,

                    payload

                );

            } catch (error) {

                console.error(

                    "HalDo App Execute Fehler:",

                    id,

                    error

                );

            }

        }

        return message;

    }

    // ========================================================

    // AI CONNECTION

    // ========================================================

    async function askAI(

        message,

        options

    ) {

        const text =

            String(

                message || ""

            ).trim();

        if (!text) {

            return {

                success: false,

                answer: ""

            };

        }

        send(

            "chat",

            "ai-core",

            "ask",

            {

                message: text

            }

        );

        const core =

            getGlobal(

                "HalDoAICore"

            );

        try {

            if (

                core &&

                isFunction(

                    core.ask

                )

            ) {

                const answer =

                    await core.ask(

                        text,

                        options || {}

                    );

                rememberConversation(

                    text,

                    answer

                );

                return {

                    success: true,

                    answer: answer,

                    source: "HalDoAICore"

                };

            }

            if (

                core &&

                isFunction(

                    core.respond

                )

            ) {

                const answer =

                    await core.respond(

                        text,

                        options || {}

                    );

                rememberConversation(

                    text,

                    answer

                );

                return {

                    success: true,

                    answer: answer,

                    source: "HalDoAICore"

                };

            }

        } catch (error) {

            console.warn(

                "AI Core Anfrage fehlgeschlagen:",

                error

            );

        }

        // Foundation fallback.

        const answer =

            createFoundationAnswer(

                text

            );

        rememberConversation(

            text,

            answer

        );

        return {

            success: true,

            answer: answer,

            source: "HalDo Foundation"

        };

    }

    function createFoundationAnswer(

        text

    ) {

        const lower =

            text.toLowerCase();

        if (

            lower.includes("hallo") ||

            lower.includes("hi") ||

            lower.includes("hey")

        ) {

            return (

                "Hallo Bruder! 💙❤️🚀 " +

                "HalDo AI OS 18 ist aktiv. " +

                "Ich bin bereit."

            );

        }

        if (

            lower.includes("version")

        ) {

            return (

                "HalDo AI OS 18.0.0 – " +

                "Professional Ultimate Foundation."

            );

        }

        if (

            lower.includes("status")

        ) {

            return (

                "HalDo AI OS ist aktiv. " +

                "Die zentrale Bridge und die Foundation-Systeme " +

                "werden überwacht."

            );

        }

        if (

            lower.includes("software update") ||

            lower.includes("update")

        ) {

            return (

                "Das Software Update Center ist aktiv. " +

                "Die installierte Foundation ist Version " +

                BRIDGE_VERSION + "."

            );

        }

        return (

            "Ich habe deine Anfrage empfangen. " +

            "HalDo AI OS 18 verarbeitet sie über die " +

            "zentrale System-Bridge. " +

            "Sobald ein entsprechendes AI-Modul verfügbar ist, " +

            "wird die Anfrage an dieses Modul weitergegeben."

        );

    }

    // ========================================================

    // CONVERSATION MEMORY

    // ========================================================

    function rememberConversation(

        question,

        answer

    ) {

        const conversation =

            getData(

                "conversation",

                []

            );

        conversation.push({

            question:

                String(question),

            answer:

                typeof answer ===

                "string"

                    ? answer

                    : JSON.stringify(answer),

            timestamp:

                Date.now()

        });

        while (

            conversation.length > 100

        ) {

            conversation.shift();

        }

        setData(

            "conversation",

            conversation

        );

        emit(

            "conversation:updated",

            conversation

        );

    }

    function getConversation() {

        return getData(

            "conversation",

            []

        );

    }

    function clearConversation() {

        setData(

            "conversation",

            []

        );

        emit(

            "conversation:cleared"

        );

    }

    // ========================================================

    // SOFTWARE UPDATE SYSTEM

    // ========================================================

    function getSoftwareVersion() {

        return BRIDGE_VERSION;

    }

    function checkUpdate() {

        state.update.status =

            "checking";

        state.update.lastCheck =

            Date.now();

        emit(

            "software:update:checking",

            state.update

        );

        window.setTimeout(

            function () {

                state.update.status =

                    "current";

                state.update.available =

                    false;

                emit(

                    "software:update:complete",

                    {

                        ...state.update

                    }

                );

            },

            700

        );

        return {

            version:

                BRIDGE_VERSION,

            status:

                "checking"

        };

    }

    // ========================================================

    // SYSTEM DIAGNOSTICS

    // ========================================================

    function diagnostics() {

        scanModules();

        const modules =

            Object.values(

                state.modules

            );

        const connected =

            modules.filter(

                function (module) {

                    return module.connected;

                }

            ).length;

        return {

            version:

                BRIDGE_VERSION,

            bridge:

                true,

            ready:

                state.ready,

            booted:

                state.booted,

            activeApp:

                state.activeApp,

            apps:

                Object.keys(

                    state.apps

                ).length,

            modules:

                modules.length,

            connectedModules:

                connected,

            storage:

                testStorage(),

            timestamp:

                Date.now()

        };

    }

    function testStorage() {

        try {

            const key =

                "__haldo_bridge_test__";

            localStorage.setItem(

                key,

                "ok"

            );

            const value =

                localStorage.getItem(

                    key

                );

            localStorage.removeItem(

                key

            );

            return value === "ok";

        } catch (error) {

            return false;

        }

    }

    // ========================================================

    // FILE / SOFTWARE DATA

    // ========================================================

    function registerSoftware(

        software

    ) {

        if (!software) {

            return false;

        }

        const list =

            getData(

                "software",

                []

            );

        const item = {

            id:

                software.id ||

                (

                    "software-" +

                    Date.now()

                ),

            name:

                software.name ||

                "Unnamed Software",

            version:

                software.version ||

                "1.0.0",

            type:

                software.type ||

                "module",

            status:

                software.status ||

                "registered",

            timestamp:

                Date.now()

        };

        const existing =

            list.findIndex(

                function (entry) {

                    return entry.id === item.id;

                }

            );

        if (existing >= 0) {

            list[existing] =

                item;

        } else {

            list.push(

                item

            );

        }

        setData(

            "software",

            list

        );

        emit(

            "software:registered",

            item

        );

        return item;

    }

    function getSoftware() {

        return getData(

            "software",

            []

        );

    }

    // ========================================================

    // SYSTEM COMMAND API

    // ========================================================

    function command(

        commandName,

        payload

    ) {

        const command =

            String(

                commandName || ""

            )

            .trim()

            .toLowerCase();

        switch (command) {

            case "status":

                return diagnostics();

            case "apps":

                return getApps();

            case "modules":

                scanModules();

                return state.modules;

            case "update":

                return checkUpdate();

            case "memory":

                return getConversation();

            case "clear-memory":

                clearConversation();

                return true;

            default:

                return {

                    success: false,

                    error:

                        "Unbekannter HalDo-Befehl."

                };

        }

    }

    // ========================================================

    // PUBLIC BRIDGE API

    // ========================================================

    const Bridge = {

        version:

            BRIDGE_VERSION,

        state:

            state,

        on:

            on,

        off:

            off,

        emit:

            emit,

        send:

            send,

        broadcast:

            broadcast,

        registerApp:

            registerApp,

        registerApps:

            registerApps,

        getApp:

            getApp,

        getApps:

            getApps,

        openApp:

            openApp,

        executeApp:

            executeApp,

        askAI:

            askAI,

        rememberConversation:

            rememberConversation,

        getConversation:

            getConversation,

        clearConversation:

            clearConversation,

        setData:

            setData,

        getData:

            getData,

        removeData:

            removeData,

        registerSoftware:

            registerSoftware,

        getSoftware:

            getSoftware,

        checkUpdate:

            checkUpdate,

        getSoftwareVersion:

            getSoftwareVersion,

        diagnostics:

            diagnostics,

        scanModules:

            scanModules,

        command:

            command

    };

    // ========================================================

    // GLOBAL EXPORTS

    // ========================================================

    OS.bridge =

        Bridge;

    OS.bridgeVersion =

        BRIDGE_VERSION;

    window.HalDoBridge =

        Bridge;

    // ========================================================

    // BOOT CONNECTION

    // ========================================================

    function initializeBridge() {

        if (

            state.ready

        ) {

            return;

        }

        scanModules();

        state.ready =

            true;

        state.booted =

            true;

        emit(

            "bridge:ready",

            diagnostics()

        );

        console.log(

            "=========================================="

        );

        console.log(

            "HalDo AI OS 18"

        );

        console.log(

            "HalDo OS Bridge " +

            BRIDGE_VERSION

        );

        console.log(

            "Zentrale Verbindungsschicht bereit."

        );

        console.log(

            "Apps:",

            Object.keys(

                state.apps

            ).length

        );

        console.log(

            "=========================================="

        );

    }

    if (

        document.readyState ===

        "loading"

    ) {

        document.addEventListener(

            "DOMContentLoaded",

            initializeBridge,

            {

                once: true

            }

        );

    } else {

        initializeBridge();

    }

})(window, document);