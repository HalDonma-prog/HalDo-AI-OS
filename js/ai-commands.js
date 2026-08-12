// ============================================================
// HALDO AI OS 18
// AI COMMAND CENTER
// PART 76
// ============================================================
// Zentrale Befehlssteuerung der HalDo AI.
//
// Aufgabe:
//
// Benutzer
//    ↓
// ai-chat.js
//    ↓
// ai-core.js
//    ↓
// ai-commands.js
//    ↓
// ┌──────────────┬──────────────┬──────────────┐
// │ Apps         │ Navigation   │ System       │
// │ Windows      │ Launcher     │ Storage      │
// │ Voice        │ Language     │ Keyboard     │
// └──────────────┴──────────────┴──────────────┘
//
// Öffentliche APIs:
//
// window.HalDoAICommands
// window.HalDoOS.aiCommands
//
// Bestehende Module werden dynamisch erkannt.
// ============================================================

(function (window, document) {

    "use strict";

    // --------------------------------------------------------
    // Duplicate Guard
    // --------------------------------------------------------

    if (
        window.HalDoAICommands &&
        window.HalDoAICommands.__haldoAI18
    ) {
        return;
    }

    // --------------------------------------------------------
    // Namespace
    // --------------------------------------------------------

    window.HalDoOS =
        window.HalDoOS || {};

    // --------------------------------------------------------
    // Configuration
    // --------------------------------------------------------

    const CONFIG = {

        name:
            "HalDo AI Command Center",

        version:
            "18.0.0",

        debug:
            false,

        allowSystemCommands:
            true,

        allowNavigation:
            true,

        allowAppCommands:
            true,

        allowWindowCommands:
            true,

        confirmationRequired:
            true,

        maxHistory:
            200

    };

    // --------------------------------------------------------
    // State
    // --------------------------------------------------------

    const state = {

        initialized:
            false,

        ready:
            false,

        executing:
            false,

        commandCount:
            0,

        successfulCommands:
            0,

        failedCommands:
            0,

        lastCommand:
            null,

        lastResult:
            null,

        history:
            [],

        errors:
            [],

        customCommands:
            new Map(),

        aliases:
            new Map()

    };

    // --------------------------------------------------------
    // Event System
    // --------------------------------------------------------

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
            return () => {};
        }

        if (
            !listeners.has(event)
        ) {

            listeners.set(
                event,
                new Set()
            );

        }

        listeners
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

        const set =
            listeners.get(event);

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
        detail = {}
    ) {

        const set =
            listeners.get(event);

        if (set) {

            for (
                const callback of set
            ) {

                try {

                    callback(
                        detail
                    );

                } catch (
                    error
                ) {

                    console.error(
                        "[HalDoAICommands]",
                        error
                    );

                }

            }

        }

        try {

            document.dispatchEvent(
                new CustomEvent(
                    `haldo:ai-command:${event}`,
                    {
                        detail
                    }
                )
            );

        } catch (
            error
        ) {}

    }

    // --------------------------------------------------------
    // Logging
    // --------------------------------------------------------

    function log(
        ...args
    ) {

        if (
            CONFIG.debug
        ) {

            console.log(
                "[HalDoAICommands]",
                ...args
            );

        }

    }

    // --------------------------------------------------------
    // Error Handling
    // --------------------------------------------------------

    function recordError(
        error,
        context = {}
    ) {

        const entry = {

            timestamp:
                Date.now(),

            message:
                error instanceof Error
                    ? error.message
                    : String(error),

            context

        };

        state.errors.push(
            entry
        );

        if (
            state.errors.length >
            50
        ) {

            state.errors.shift();

        }

        emit(
            "error",
            entry
        );

        return entry;

    }

    // --------------------------------------------------------
    // Utilities
    // --------------------------------------------------------

    function normalize(
        value
    ) {

        return String(
            value ??
            ""
        )
        .trim()
        .toLowerCase();

    }

    function cleanText(
        value
    ) {

        return String(
            value ??
            ""
        )
        .trim();

    }

    function createId(
        prefix =
            "command"
    ) {

        return (
            prefix +
            "-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 9)
        );

    }

    function clone(
        value
    ) {

        try {

            return JSON.parse(
                JSON.stringify(
                    value
                )
            );

        } catch (
            error
        ) {

            return value;

        }

    }

    // --------------------------------------------------------
    // Module Resolver
    // --------------------------------------------------------

    function resolveModule(
        names
    ) {

        if (
            typeof names ===
            "string"
        ) {

            names =
                [names];

        }

        for (
            const name of names
        ) {

            if (
                window[name]
            ) {

                return window[name];

            }

            if (
                window.HalDoOS &&
                window.HalDoOS[name]
            ) {

                return window.HalDoOS[name];

            }

        }

        return null;

    }

    // --------------------------------------------------------
    // Module Accessors
    // --------------------------------------------------------

    function getAppManager() {

        return resolveModule(
            [
                "HalDoAppManager",
                "appManager",
                "HalDoOSAppManager"
            ]
        );

    }

    function getAppLauncher() {

        return resolveModule(
            [
                "HalDoAppLauncher",
                "appLauncher"
            ]
        );

    }

    function getLauncher() {

        return resolveModule(
            [
                "HalDoLauncher",
                "launcher"
            ]
        );

    }

    function getRouter() {

        return resolveModule(
            [
                "HalDoAppRouter",
                "appRouter",
                "router"
            ]
        );

    }

    function getWindowManager() {

        return resolveModule(
            [
                "HalDoWindowManager",
                "windowManager"
            ]
        );

    }

    function getSystem() {

        return resolveModule(
            [
                "HalDoSystem",
                "system"
            ]
        );

    }

    function getKernel() {

        return resolveModule(
            [
                "HalDoKernel",
                "kernel"
            ]
        );

    }

    function getStorage() {

        return resolveModule(
            [
                "HalDoStorageManager",
                "HalDoStorage",
                "storageManager",
                "storage"
            ]
        );

    }

    function getLanguage() {

        return resolveModule(
            [
                "HalDoLanguageManager",
                "HalDoLanguageSystem",
                "languageManager",
                "languageSystem"
            ]
        );

    }

    function getVoice() {

        return resolveModule(
            [
                "HalDoAIVoice",
                "HalDoVoice",
                "aiVoice",
                "voice"
            ]
        );

    }

    function getSpeech() {

        return resolveModule(
            [
                "HalDoAISpeech",
                "HalDoSpeech",
                "aiSpeech",
                "speech"
            ]
        );

    }

    // --------------------------------------------------------
    // Command Registry
    // --------------------------------------------------------

    const commands =
        new Map();

    function registerCommand(
        name,
        definition
    ) {

        const id =
            normalize(
                name
            );

        if (!id) {
            return false;
        }

        commands.set(
            id,
            {

                id,

                name:
                    definition.name ||
                    id,

                description:
                    definition.description ||
                    "",

                category:
                    definition.category ||
                    "general",

                aliases:
                    Array.isArray(
                        definition.aliases
                    )
                        ? definition.aliases
                        : [],

                confirmation:
                    Boolean(
                        definition.confirmation
                    ),

                execute:
                    definition.execute

            }
        );

        for (
            const alias of
            definition.aliases || []
        ) {

            state.aliases.set(
                normalize(
                    alias
                ),
                id
            );

        }

        return true;

    }

    function unregisterCommand(
        name
    ) {

        const id =
            resolveCommandName(
                name
            );

        if (!id) {
            return false;
        }

        return commands.delete(
            id
        );

    }

    function resolveCommandName(
        name
    ) {

        const normalized =
            normalize(
                name
            );

        if (
            commands.has(
                normalized
            )
        ) {

            return normalized;

        }

        if (
            state.aliases.has(
                normalized
            )
        ) {

            return state.aliases.get(
                normalized
            );

        }

        return null;

    }

    function getCommand(
        name
    ) {

        const id =
            resolveCommandName(
                name
            );

        return id
            ? commands.get(id)
            : null;

    }

    function getCommands(
        category = null
    ) {

        const list =
            Array.from(
                commands.values()
            );

        if (!category) {

            return list;

        }

        return list.filter(
            command =>
                command.category ===
                category
        );

    }

    // --------------------------------------------------------
    // Event-Based Module Command
    // --------------------------------------------------------

    function emitModuleCommand(
        eventName,
        detail = {}
    ) {

        try {

            document.dispatchEvent(
                new CustomEvent(
                    eventName,
                    {
                        detail
                    }
                )
            );

            return true;

        } catch (
            error
        ) {

            recordError(
                error,
                {
                    eventName
                }
            );

            return false;

        }

    }

    // --------------------------------------------------------
    // Generic Method Runner
    // --------------------------------------------------------

    async function callModuleMethod(
        module,
        methods,
        args = []
    ) {

        if (!module) {

            return {

                ok:
                    false,

                reason:
                    "MODULE_NOT_FOUND"

            };

        }

        for (
            const method of methods
        ) {

            if (
                typeof module[method] !==
                "function"
            ) {

                continue;

            }

            try {

                const result =
                    module[method](
                        ...args
                    );

                const resolved =
                    result &&
                    typeof result.then ===
                    "function"
                        ? await result
                        : result;

                return {

                    ok:
                        true,

                    method,

                    result:
                        resolved

                };

            } catch (
                error
            ) {

                recordError(
                    error,
                    {
                        method
                    }
                );

                return {

                    ok:
                        false,

                    method,

                    error

                };

            }

        }

        return {

            ok:
                false,

            reason:
                "METHOD_NOT_FOUND"

        };

    }

    // --------------------------------------------------------
    // APP COMMANDS
    // --------------------------------------------------------

    async function openApp(
        appName,
        options = {}
    ) {

        const name =
            cleanText(
                appName
            );

        if (!name) {

            return {

                ok:
                    false,

                message:
                    "Kein App-Name angegeben."

            };

        }

        emit(
            "app-open-request",
            {
                app:
                    name,

                options
            }
        );

        const launcher =
            getAppLauncher();

        const manager =
            getAppManager();

        const appMethods = [

            "openApp",

            "launchApp",

            "open",

            "launch",

            "start"

        ];

        let result =
            await callModuleMethod(
                launcher,
                appMethods,
                [
                    name,
                    options
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "open-app",

                app:
                    name,

                result:
                    result.result

            };

        }

        result =
            await callModuleMethod(
                manager,
                appMethods,
                [
                    name,
                    options
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "open-app",

                app:
                    name,

                result:
                    result.result

            };

        }

        /*
         * Event-Fallback für Module,
         * die über Events arbeiten.
         */

        emitModuleCommand(
            "haldo:app:open",
            {
                app:
                    name,

                options
            }
        );

        return {

            ok:
                true,

            action:
                "open-app",

            app:
                name,

            fallback:
                true

        };

    }

    async function closeApp(
        appName
    ) {

        const name =
            cleanText(
                appName
            );

        const manager =
            getAppManager();

        const result =
            await callModuleMethod(
                manager,
                [
                    "closeApp",
                    "close",
                    "stopApp",
                    "stop"
                ],
                [
                    name
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "close-app",

                app:
                    name,

                result:
                    result.result

            };

        }

        emitModuleCommand(
            "haldo:app:close",
            {
                app:
                    name
            }
        );

        return {

            ok:
                true,

            action:
                "close-app",

            app:
                name,

            fallback:
                true

        };

    }

    async function listApps() {

        const manager =
            getAppManager();

        const result =
            await callModuleMethod(
                manager,
                [
                    "getApps",
                    "listApps",
                    "getRegisteredApps",
                    "list"
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "list-apps",

                apps:
                    result.result

            };

        }

        return {

            ok:
                false,

            action:
                "list-apps",

            apps:
                []

        };

    }

    // --------------------------------------------------------
    // NAVIGATION COMMANDS
    // --------------------------------------------------------

    async function navigate(
        target,
        options = {}
    ) {

        const destination =
            cleanText(
                target
            );

        if (!destination) {

            return {

                ok:
                    false,

                message:
                    "Kein Ziel angegeben."

            };

        }

        emit(
            "navigation-request",
            {
                target:
                    destination,

                options
            }
        );

        const router =
            getRouter();

        const result =
            await callModuleMethod(
                router,
                [
                    "navigate",
                    "go",
                    "route",
                    "open",
                    "push"
                ],
                [
                    destination,
                    options
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "navigate",

                target:
                    destination,

                result:
                    result.result

            };

        }

        emitModuleCommand(
            "haldo:navigate",
            {
                target:
                    destination,

                options
            }
        );

        return {

            ok:
                true,

            action:
                "navigate",

            target:
                destination,

            fallback:
                true

        };

    }

    async function goHome() {

        return navigate(
            "home"
        );

    }

    async function goBack() {

        const router =
            getRouter();

        const result =
            await callModuleMethod(
                router,
                [
                    "back",
                    "goBack",
                    "previous"
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "back",

                result:
                    result.result

            };

        }

        if (
            window.history &&
            typeof window.history.back ===
            "function"
        ) {

            window.history.back();

            return {

                ok:
                    true,

                action:
                    "back",

                fallback:
                    true

            };

        }

        return {

            ok:
                false,

            action:
                "back"

        };

    }

    // --------------------------------------------------------
    // WINDOW COMMANDS
    // --------------------------------------------------------

    async function openWindow(
        windowName,
        options = {}
    ) {

        const name =
            cleanText(
                windowName
            );

        const manager =
            getWindowManager();

        const result =
            await callModuleMethod(
                manager,
                [
                    "openWindow",
                    "open",
                    "createWindow",
                    "show"
                ],
                [
                    name,
                    options
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "open-window",

                window:
                    name,

                result:
                    result.result

            };

        }

        emitModuleCommand(
            "haldo:window:open",
            {
                window:
                    name,

                options
            }
        );

        return {

            ok:
                true,

            action:
                "open-window",

            window:
                name,

            fallback:
                true

        };

    }

    async function closeWindow(
        windowName
    ) {

        const name =
            cleanText(
                windowName
            );

        const manager =
            getWindowManager();

        const result =
            await callModuleMethod(
                manager,
                [
                    "closeWindow",
                    "close",
                    "hide"
                ],
                [
                    name
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "close-window",

                window:
                    name,

                result:
                    result.result

            };

        }

        emitModuleCommand(
            "haldo:window:close",
            {
                window:
                    name
            }
        );

        return {

            ok:
                true,

            action:
                "close-window",

            window:
                name,

            fallback:
                true

        };

    }

    async function minimizeWindow(
        windowName
    ) {

        const manager =
            getWindowManager();

        const result =
            await callModuleMethod(
                manager,
                [
                    "minimizeWindow",
                    "minimize"
                ],
                [
                    windowName
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "minimize-window",

                result:
                    result.result

            };

        }

        emitModuleCommand(
            "haldo:window:minimize",
            {
                window:
                    windowName
            }
        );

        return {

            ok:
                true,

            action:
                "minimize-window",

            fallback:
                true

        };

    }

    async function maximizeWindow(
        windowName
    ) {

        const manager =
            getWindowManager();

        const result =
            await callModuleMethod(
                manager,
                [
                    "maximizeWindow",
                    "maximize"
                ],
                [
                    windowName
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "maximize-window",

                result:
                    result.result

            };

        }

        emitModuleCommand(
            "haldo:window:maximize",
            {
                window:
                    windowName
            }
        );

        return {

            ok:
                true,

            action:
                "maximize-window",

            fallback:
                true

        };

    }

    // --------------------------------------------------------
    // SYSTEM COMMANDS
    // --------------------------------------------------------

    async function systemStatus() {

        const system =
            getSystem();

        const kernel =
            getKernel();

        const systemResult =
            await callModuleMethod(
                system,
                [
                    "getStatus",
                    "status",
                    "getSystemStatus"
                ]
            );

        const kernelResult =
            await callModuleMethod(
                kernel,
                [
                    "getStatus",
                    "status",
                    "getDiagnostics"
                ]
            );

        return {

            ok:
                true,

            action:
                "system-status",

            system:
                systemResult.ok
                    ? systemResult.result
                    : null,

            kernel:
                kernelResult.ok
                    ? kernelResult.result
                    : null

        };

    }

    async function systemDiagnostics() {

        const system =
            getSystem();

        const kernel =
            getKernel();

        const results = {

            system:
                await callModuleMethod(
                    system,
                    [
                        "diagnose",
                        "diagnostics",
                        "getDiagnostics"
                    ]
                ),

            kernel:
                await callModuleMethod(
                    kernel,
                    [
                        "diagnose",
                        "diagnostics",
                        "getDiagnostics"
                    ]
                )

        };

        emit(
            "diagnostics",
            results
        );

        return {

            ok:
                true,

            action:
                "diagnostics",

            results

        };

    }

    // --------------------------------------------------------
    // LANGUAGE
    // --------------------------------------------------------

    async function setLanguage(
        language
    ) {

        const lang =
            cleanText(
                language
            );

        if (!lang) {

            return {

                ok:
                    false,

                message:
                    "Keine Sprache angegeben."

            };

        }

        const manager =
            getLanguage();

        const result =
            await callModuleMethod(
                manager,
                [
                    "setLanguage",
                    "changeLanguage",
                    "switchLanguage",
                    "set"
                ],
                [
                    lang
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "set-language",

                language:
                    lang,

                result:
                    result.result

            };

        }

        emitModuleCommand(
            "haldo:language:set",
            {
                language:
                    lang
            }
        );

        return {

            ok:
                true,

            action:
                "set-language",

            language:
                lang,

            fallback:
                true

        };

    }

    // --------------------------------------------------------
    // VOICE
    // --------------------------------------------------------

    async function speak(
        text,
        options = {}
    ) {

        const content =
            cleanText(
                text
            );

        if (!content) {

            return {

                ok:
                    false,

                message:
                    "Kein Text zum Sprechen."

            };

        }

        const voice =
            getVoice();

        const speech =
            getSpeech();

        let result =
            await callModuleMethod(
                voice,
                [
                    "speak",
                    "say",
                    "synthesize"
                ],
                [
                    content,
                    options
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "speak",

                text:
                    content,

                result:
                    result.result

            };

        }

        result =
            await callModuleMethod(
                speech,
                [
                    "speak",
                    "say",
                    "synthesize"
                ],
                [
                    content,
                    options
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "speak",

                text:
                    content,

                result:
                    result.result

            };

        }

        /*
         * Browser-Fallback.
         */

        if (
            "speechSynthesis" in
            window
        ) {

            try {

                const utterance =
                    new SpeechSynthesisUtterance(
                        content
                    );

                if (
                    options.lang
                ) {

                    utterance.lang =
                        options.lang;

                }

                window.speechSynthesis.speak(
                    utterance
                );

                return {

                    ok:
                        true,

                    action:
                        "speak",

                    text:
                        content,

                    fallback:
                        true

                };

            } catch (
                error
            ) {

                recordError(
                    error,
                    {
                        phase:
                            "speech-fallback"
                    }
                );

            }

        }

        return {

            ok:
                false,

            action:
                "speak",

            text:
                content

        };

    }

    // --------------------------------------------------------
    // STORAGE
    // --------------------------------------------------------

    async function saveData(
        key,
        value
    ) {

        const storage =
            getStorage();

        const result =
            await callModuleMethod(
                storage,
                [
                    "set",
                    "save",
                    "setItem",
                    "store"
                ],
                [
                    key,
                    value
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "save",

                key,

                result:
                    result.result

            };

        }

        try {

            localStorage.setItem(
                key,
                JSON.stringify(
                    value
                )
            );

            return {

                ok:
                    true,

                action:
                    "save",

                key,

                fallback:
                    true

            };

        } catch (
            error
        ) {

            recordError(
                error,
                {
                    phase:
                        "storage-save"
                }
            );

        }

        return {

            ok:
                false,

            action:
                "save",

            key

        };

    }

    async function loadData(
        key
    ) {

        const storage =
            getStorage();

        const result =
            await callModuleMethod(
                storage,
                [
                    "get",
                    "load",
                    "getItem",
                    "retrieve"
                ],
                [
                    key
                ]
            );

        if (
            result.ok
        ) {

            return {

                ok:
                    true,

                action:
                    "load",

                key,

                value:
                    result.result

            };

        }

        try {

            const raw =
                localStorage.getItem(
                    key
                );

            return {

                ok:
                    true,

                action:
                    "load",

                key,

                value:
                    raw
                        ? JSON.parse(
                            raw
                        )
                        : null,

                fallback:
                    true

            };

        } catch (
            error
        ) {

            recordError(
                error,
                {
                    phase:
                        "storage-load"
                }
            );

        }

        return {

            ok:
                false,

            action:
                "load",

            key

        };

    }

    // --------------------------------------------------------
    // HELP
    // --------------------------------------------------------

    function getHelp() {

        return {

            ok:
                true,

            action:
                "help",

            commands:
                getCommands()
                    .map(
                        command => ({

                            name:
                                command.name,

                            description:
                                command.description,

                            category:
                                command.category,

                            aliases:
                                command.aliases

                        })
                    )

        };

    }

    // --------------------------------------------------------
    // COMMAND PARSER
    // --------------------------------------------------------

    function parseCommand(
        input
    ) {

        const original =
            cleanText(
                input
            );

        if (!original) {

            return null;

        }

        let text =
            original;

        /*
         * Präfixe entfernen.
         */

        text =
            text.replace(
                /^haldo[\s,:-]*/i,
                ""
            );

        text =
            text.replace(
                /^ai[\s,:-]*/i,
                ""
            );

        text =
            text.trim();

        const normalized =
            normalize(
                text
            );

        /*
         * Direkte Kommandos.
         */

        if (
            /^\/\w+/.test(
                normalized
            )
        ) {

            const match =
                normalized.match(
                    /^\/([^\s]+)(?:\s+(.*))?$/
                );

            if (
                match
            ) {

                return {

                    command:
                        match[1],

                    argument:
                        match[2] ||
                        "",

                    original

                };

            }

        }

        /*
         * App öffnen.
         */

        let match =
            text.match(
                /^(?:öffne|öffnen|starte|starten|open|launch)\s+(.+)$/i
            );

        if (
            match
        ) {

            return {

                command:
                    "open-app",

                argument:
                    match[1],

                original

            };

        }

        /*
         * App schließen.
         */

        match =
            text.match(
                /^(?:schließe|schliessen|beende|close|stop)\s+(.+)$/i
            );

        if (
            match
        ) {

            return {

                command:
                    "close-app",

                argument:
                    match[1],

                original

            };

        }

        /*
         * Zurück.
         */

        if (
            /^(?:zurück|zurueck|back)$/i.test(
                text
            )
        ) {

            return {

                command:
                    "back",

                argument:
                    "",

                original

            };

        }

        /*
         * Home.
         */

        if (
            /^(?:home|startseite|hauptseite)$/i.test(
                text
            )
        ) {

            return {

                command:
                    "home",

                argument:
                    "",

                original

            };

        }

        /*
         * Hilfe.
         */

        if (
            /^(?:hilfe|help|befehle|commands)$/i.test(
                text
            )
        ) {

            return {

                command:
                    "help",

                argument:
                    "",

                original

            };

        }

        /*
         * Status.
         */

        if (
            /^(?:status|systemstatus|system status)$/i.test(
                text
            )
        ) {

            return {

                command:
                    "system-status",

                argument:
                    "",

                original

            };

        }

        /*
         * Diagnose.
         */

        if (
            /^(?:diagnose|diagnostik|diagnostics)$/i.test(
                text
            )
        ) {

            return {

                command:
                    "diagnostics",

                argument:
                    "",

                original

            };

        }

        /*
         * Sprache.
         */

        match =
            text.match(
                /^(?:sprache|language)\s+(.+)$/i
            );

        if (
            match
        ) {

            return {

                command:
                    "language",

                argument:
                    match[1],

                original

            };

        }

        /*
         * Sprechen.
         */

        match =
            text.match(
                /^(?:sprich|sag|say|speak)\s+(.+)$/i
            );

        if (
            match
        ) {

            return {

                command:
                    "speak",

                argument:
                    match[1],

                original

            };

        }

        return {

            command:
                null,

            argument:
                text,

            original

        };

    }

    // --------------------------------------------------------
    // Execute Parsed Command
    // --------------------------------------------------------

    async function execute(
        input,
        options = {}
    ) {

        const parsed =
            typeof input ===
            "object"
                ? input
                : parseCommand(
                    input
                );

        if (!parsed) {

            return {

                ok:
                    false,

                message:
                    "Kein Befehl erkannt."

            };

        }

        if (
            !parsed.command
        ) {

            return {

                ok:
                    false,

                unrecognized:
                    true,

                message:
                    "Der Befehl wurde nicht erkannt.",

                parsed

            };

        }

        const command =
            getCommand(
                parsed.command
            );

        if (!command) {

            return {

                ok:
                    false,

                unrecognized:
                    true,

                command:
                    parsed.command,

                message:
                    `Befehl "${parsed.command}" nicht gefunden.`

            };

        }

        /*
         * Sicherheitsprüfung.
         */

        if (
            command.confirmation &&
            CONFIG.confirmationRequired &&
            options.confirmed !==
            true
        ) {

            return {

                ok:
                    false,

                confirmationRequired:
                    true,

                command:
                    command.id,

                message:
                    `Bestätigung für "${command.name}" erforderlich.`

            };

        }

        state.executing =
            true;

        state.commandCount++;

        state.lastCommand =
            {

                id:
                    createId(),

                command:
                    command.id,

                argument:
                    parsed.argument,

                timestamp:
                    Date.now()

            };

        emit(
            "command-start",
            {
                command:
                    state.lastCommand
            }
        );

        try {

            const result =
                await command.execute(
                    parsed.argument,
                    options,
                    parsed
                );

            const finalResult =
                result || {

                    ok:
                        true

                };

            if (
                finalResult.ok
            ) {

                state.successfulCommands++;

            } else {

                state.failedCommands++;

            }

            state.lastResult =
                finalResult;

            state.history.push({

                ...clone(
                    state.lastCommand
                ),

                result:
                    clone(
                        finalResult
                    )

            });

            if (
                state.history.length >
                CONFIG.maxHistory
            ) {

                state.history =
                    state.history.slice(
                        -CONFIG.maxHistory
                    );

            }

            emit(
                "command-complete",
                {
                    command:
                        state.lastCommand,

                    result:
                        finalResult

                }
            );

            return finalResult;

        } catch (
            error
        ) {

            state.failedCommands++;

            recordError(
                error,
                {
                    command:
                        parsed.command
                }
            );

            const result = {

                ok:
                    false,

                command:
                    parsed.command,

                error

            };

            state.lastResult =
                result;

            emit(
                "command-error",
                {
                    command:
                        state.lastCommand,

                    error

                }
            );

            return result;

        } finally {

            state.executing =
                false;

        }

    }

    // --------------------------------------------------------
    // Built-in Commands
    // --------------------------------------------------------

    registerCommand(
        "open-app",
        {

            name:
                "App öffnen",

            description:
                "Öffnet eine HalDo-App.",

            category:
                "apps",

            aliases:
                [
                    "open",
                    "öffne",
                    "start",
                    "launch"
                ],

            execute:
                (
                    argument,
                    options
                ) =>
                    openApp(
                        argument,
                        options
                    )

        }
    );

    registerCommand(
        "close-app",
        {

            name:
                "App schließen",

            description:
                "Schließt eine geöffnete App.",

            category:
                "apps",

            aliases:
                [
                    "close",
                    "schließe",
                    "beenden"
                ],

            execute:
                argument =>
                    closeApp(
                        argument
                    )

        }
    );

    registerCommand(
        "list-apps",
        {

            name:
                "Apps anzeigen",

            description:
                "Zeigt verfügbare Apps an.",

            category:
                "apps",

            aliases:
                [
                    "apps",
                    "app-liste",
                    "applications"
                ],

            execute:
                () =>
                    listApps()

        }
    );

    registerCommand(
        "navigate",
        {

            name:
                "Navigieren",

            description:
                "Navigiert zu einer HalDo-Seite.",

            category:
                "navigation",

            aliases:
                [
                    "go",
                    "route",
                    "gehe"
                ],

            execute:
                (
                    argument,
                    options
                ) =>
                    navigate(
                        argument,
                        options
                    )

        }
    );

    registerCommand(
        "home",
        {

            name:
                "Startseite",

            description:
                "Öffnet die HalDo-Startseite.",

            category:
                "navigation",

            aliases:
                [
                    "startseite",
                    "main"
                ],

            execute:
                () =>
                    goHome()

        }
    );

    registerCommand(
        "back",
        {

            name:
                "Zurück",

            description:
                "Geht zur vorherigen Ansicht zurück.",

            category:
                "navigation",

            aliases:
                [
                    "zurück",
                    "zurueck"
                ],

            execute:
                () =>
                    goBack()

        }
    );

    registerCommand(
        "open-window",
        {

            name:
                "Fenster öffnen",

            description:
                "Öffnet ein HalDo-Fenster.",

            category:
                "windows",

            aliases:
                [
                    "window-open"
                ],

            execute:
                (
                    argument,
                    options
                ) =>
                    openWindow(
                        argument,
                        options
                    )

        }
    );

    registerCommand(
        "close-window",
        {

            name:
                "Fenster schließen",

            description:
                "Schließt ein HalDo-Fenster.",

            category:
                "windows",

            aliases:
                [
                    "window-close"
                ],

            execute:
                argument =>
                    closeWindow(
                        argument
                    )

        }
    );

    registerCommand(
        "minimize-window",
        {

            name:
                "Fenster minimieren",

            description:
                "Minimiert ein Fenster.",

            category:
                "windows",

            aliases:
                [
                    "minimize"
                ],

            execute:
                argument =>
                    minimizeWindow(
                        argument
                    )

        }
    );

    registerCommand(
        "maximize-window",
        {

            name:
                "Fenster maximieren",

            description:
                "Maximiert ein Fenster.",

            category:
                "windows",

            aliases:
                [
                    "maximize"
                ],

            execute:
                argument =>
                    maximizeWindow(
                        argument
                    )

        }
    );

    registerCommand(
        "system-status",
        {

            name:
                "Systemstatus",

            description:
                "Zeigt den aktuellen HalDo-Systemstatus.",

            category:
                "system",

            aliases:
                [
                    "status",
                    "systemstatus"
                ],

            execute:
                () =>
                    systemStatus()

        }
    );

    registerCommand(
        "diagnostics",
        {

            name:
                "Systemdiagnose",

            description:
                "Führt eine Systemdiagnose durch.",

            category:
                "system",

            aliases:
                [
                    "diagnose",
                    "diagnostik"
                ],

            execute:
                () =>
                    systemDiagnostics()

        }
    );

    registerCommand(
        "language",
        {

            name:
                "Sprache ändern",

            description:
                "Ändert die Sprache des Systems.",

            category:
                "language",

            aliases:
                [
                    "sprache",
                    "lang"
                ],

            execute:
                argument =>
                    setLanguage(
                        argument
                    )

        }
    );

    registerCommand(
        "speak",
        {

            name:
                "Sprechen",

            description:
                "Lässt HalDo AI einen Text sprechen.",

            category:
                "voice",

            aliases:
                [
                    "say",
                    "sprich"
                ],

            execute:
                (
                    argument,
                    options
                ) =>
                    speak(
                        argument,
                        options
                    )

        }
    );

    registerCommand(
        "save",
        {

            name:
                "Daten speichern",

            description:
                "Speichert Daten über das HalDo-Storage-System.",

            category:
                "storage",

            aliases:
                [
                    "speichern"
                ],

            execute:
                (
                    argument,
                    options
                ) => {

                    const key =
                        options.key ||
                        "haldo.ai.command.data";

                    return saveData(
                        key,
                        argument
                    );

                }

        }
    );

    registerCommand(
        "load",
        {

            name:
                "Daten laden",

            description:
                "Lädt gespeicherte Daten.",

            category:
                "storage",

            aliases:
                [
                    "laden"
                ],

            execute:
                (
                    argument,
                    options
                ) => {

                    const key =
                        options.key ||
                        argument;

                    return loadData(
                        key
                    );

                }

        }
    );

    registerCommand(
        "help",
        {

            name:
                "Hilfe",

            description:
                "Zeigt alle verfügbaren AI-Befehle.",

            category:
                "system",

            aliases:
                [
                    "hilfe",
                    "commands",
                    "befehle"
                ],

            execute:
                () =>
                    getHelp()

        }
    );

    // --------------------------------------------------------
    // Custom Command Registration
    // --------------------------------------------------------

    function registerCustomCommand(
        name,
        handler,
        options = {}
    ) {

        if (
            typeof handler !==
            "function"
        ) {

            return false;

        }

        const id =
            normalize(
                name
            );

        if (!id) {

            return false;

        }

        state.customCommands.set(
            id,
            handler
        );

        return registerCommand(
            id,
            {

                name:
                    options.name ||
                    name,

                description:
                    options.description ||
                    "Benutzerdefinierter HalDo-Befehl.",

                category:
                    options.category ||
                    "custom",

                aliases:
                    options.aliases ||
                    [],

                confirmation:
                    options.confirmation ||
                    false,

                execute:
                    handler

            }
        );

    }

    // --------------------------------------------------------
    // Remove Custom Command
    // --------------------------------------------------------

    function unregisterCustomCommand(
        name
    ) {

        const id =
            normalize(
                name
            );

        state.customCommands.delete(
            id
        );

        return unregisterCommand(
            id
        );

    }

    // --------------------------------------------------------
    // Parse + Execute Shortcut
    // --------------------------------------------------------

    async function run(
        input,
        options = {}
    ) {

        return execute(
            input,
            options
        );

    }

    // --------------------------------------------------------
    // Status
    // --------------------------------------------------------

    function getStatus() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            initialized:
                state.initialized,

            ready:
                state.ready,

            executing:
                state.executing,

            commandCount:
                state.commandCount,

            successfulCommands:
                state.successfulCommands,

            failedCommands:
                state.failedCommands,

            registeredCommands:
                commands.size,

            customCommands:
                state.customCommands.size,

            historyCount:
                state.history.length,

            errorCount:
                state.errors.length,

            modules: {

                appManager:
                    Boolean(
                        getAppManager()
                    ),

                appLauncher:
                    Boolean(
                        getAppLauncher()
                    ),

                launcher:
                    Boolean(
                        getLauncher()
                    ),

                router:
                    Boolean(
                        getRouter()
                    ),

                windowManager:
                    Boolean(
                        getWindowManager()
                    ),

                system:
                    Boolean(
                        getSystem()
                    ),

                kernel:
                    Boolean(
                        getKernel()
                    ),

                storage:
                    Boolean(
                        getStorage()
                    ),

                language:
                    Boolean(
                        getLanguage()
                    ),

                voice:
                    Boolean(
                        getVoice()
                    ),

                speech:
                    Boolean(
                        getSpeech()
                    )

            }

        };

    }

    // --------------------------------------------------------
    // Reset Runtime
    // --------------------------------------------------------

    function reset() {

        state.commandCount =
            0;

        state.successfulCommands =
            0;

        state.failedCommands =
            0;

        state.lastCommand =
            null;

        state.lastResult =
            null;

        state.history =
            [];

        state.errors =
            [];

        emit(
            "reset"
        );

        return true;

    }

    // --------------------------------------------------------
    // Initialization
    // --------------------------------------------------------

    function initialize() {

        if (
            state.initialized
        ) {

            return getStatus();

        }

        state.initialized =
            true;

        /*
         * AI Core registrieren.
         */

        const core =
            window.HalDoAICore ||
            window.HalDoOS?.aiCore;

        if (
            core &&
            typeof core.registerModule ===
            "function"
        ) {

            try {

                core.registerModule(
                    "commands",
                    api
                );

            } catch (
                error
            ) {

                recordError(
                    error,
                    {
                        phase:
                            "core-registration"
                    }
                );

            }

        }

        /*
         * AI-Eingaben beobachten.
         *
         * Nur explizite command/request Events
         * werden ausgeführt.
         *
         * Dadurch wird normaler Chat NICHT
         * versehentlich als Systembefehl ausgeführt.
         */

        document.addEventListener(
            "haldo:ai-command-request",
            event => {

                const input =
                    event.detail?.command ??
                    event.detail?.text ??
                    event.detail?.input;

                if (
                    input
                ) {

                    execute(
                        input,
                        event.detail?.options ||
                        {}
                    );

                }

            }
        );

        emit(
            "initialized",
            {
                status:
                    getStatus()
            }
        );

        window.setTimeout(
            () => {

                state.ready =
                    true;

                emit(
                    "ready",
                    {
                        status:
                            getStatus()
                    }
                );

                console.log(
                    "[HalDoAICommands] " +
                    "HalDo AI Command Center 18 bereit."
                );

            },
            0
        );

        return getStatus();

    }

    // --------------------------------------------------------
    // Public API
    // --------------------------------------------------------

    const api = {

        __haldoAI18:
            true,

        config:
            CONFIG,

        state,

        initialize,

        on,

        off,

        emit,

        registerCommand,

        unregisterCommand,

        registerCustomCommand,

        unregisterCustomCommand,

        getCommand,

        getCommands,

        parseCommand,

        execute,

        run,

        openApp,

        closeApp,

        listApps,

        navigate,

        goHome,

        goBack,

        openWindow,

        closeWindow,

        minimizeWindow,

        maximizeWindow,

        systemStatus,

        systemDiagnostics,

        setLanguage,

        speak,

        saveData,

        loadData,

        getHelp,

        getStatus,

        reset

    };

    // --------------------------------------------------------
    // Global APIs
    // --------------------------------------------------------

    window.HalDoAICommands =
        api;

    window.HalDoOS.aiCommands =
        api;

    // --------------------------------------------------------
    // Boot
    // --------------------------------------------------------

    function boot() {

        initialize();

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

// ============================================================
// END OF PART 76
// ============================================================