// ============================================================
// HALDO AI OS 18
// AI COMMAND ENGINE
// PART 78
// ============================================================
// Zentrale Kommando-Schicht von HalDo AI.
//
// Verbindet:
//
// • AI Core
// • AI Chat
// • AI Language
// • App Manager
// • App Router
// • Launcher
// • System
// • Kernel
// • Storage
// • Voice
// • Ezidi Keyboard
//
// Öffentliche APIs:
//
// window.HalDoAICommands
// window.HalDoOS.aiCommands
//
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

    window.HalDoOS =
        window.HalDoOS || {};

    // --------------------------------------------------------
    // Configuration
    // --------------------------------------------------------

    const CONFIG = {

        name:
            "HalDo AI Command Engine",

        version:
            "18.0.0",

        maxHistory:
            200,

        caseSensitive:
            false,

        enableAliases:
            true,

        enableNaturalLanguage:
            true

    };

    // --------------------------------------------------------
    // State
    // --------------------------------------------------------

    const state = {

        initialized:
            false,

        ready:
            false,

        commandCount:
            0,

        successfulCommands:
            0,

        failedCommands:
            0,

        history:
            [],

        commands:
            new Map(),

        aliases:
            new Map()

    };

    // --------------------------------------------------------
    // Events
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
                    `haldo:ai-commands:${event}`,
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
    // Utility
    // --------------------------------------------------------

    function clean(
        value
    ) {

        return String(
            value ??
            ""
        ).trim();

    }

    function normalize(
        value
    ) {

        return clean(
            value
        )
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        );

    }

    // --------------------------------------------------------
    // External Modules
    // --------------------------------------------------------

    function getAI() {

        return (
            window.HalDoAICore ||
            window.HalDoOS?.aiCore ||
            null
        );

    }

    function getChat() {

        return (
            window.HalDoAIChat ||
            window.HalDoOS?.aiChat ||
            null
        );

    }

    function getLanguage() {

        return (
            window.HalDoAILanguage ||
            window.HalDoOS?.aiLanguage ||
            null
        );

    }

    function getAppManager() {

        return (
            window.HalDoAppManager ||
            window.HalDoOS?.appManager ||
            null
        );

    }

    function getAppRouter() {

        return (
            window.HalDoAppRouter ||
            window.HalDoOS?.appRouter ||
            null
        );

    }

    function getLauncher() {

        return (
            window.HalDoLauncher ||
            window.HalDoOS?.launcher ||
            null
        );

    }

    function getSystem() {

        return (
            window.HalDoSystem ||
            window.HalDoOS?.system ||
            null
        );

    }

    function getKernel() {

        return (
            window.HalDoKernel ||
            window.HalDoOS?.kernel ||
            null
        );

    }

    function getStorage() {

        return (
            window.HalDoStorage ||
            window.HalDoStorageManager ||
            window.HalDoOS?.storage ||
            window.HalDoOS?.storageManager ||
            null
        );

    }

    // --------------------------------------------------------
    // Command Registration
    // --------------------------------------------------------

    function registerCommand(
        definition
    ) {

        if (
            !definition ||
            !definition.id
        ) {

            return {

                ok:
                    false,

                error:
                    "INVALID_COMMAND"

            };

        }

        const id =
            normalize(
                definition.id
            );

        if (!id) {

            return {

                ok:
                    false,

                error:
                    "INVALID_COMMAND_ID"

            };

        }

        const command = {

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

            keywords:
                Array.isArray(
                    definition.keywords
                )
                    ? definition.keywords
                    : [],

            execute:
                typeof definition.execute ===
                "function"
                    ? definition.execute
                    : null,

            enabled:
                definition.enabled !==
                false,

            priority:
                Number(
                    definition.priority ||
                    0
                )

        };

        if (!command.execute) {

            return {

                ok:
                    false,

                error:
                    "COMMAND_EXECUTOR_MISSING",

                id

            };

        }

        state.commands.set(
            id,
            command
        );

        if (
            CONFIG.enableAliases
        ) {

            command.aliases.forEach(
                alias => {

                    const normalized =
                        normalize(
                            alias
                        );

                    if (normalized) {

                        state.aliases.set(
                            normalized,
                            id
                        );

                    }

                }
            );

        }

        emit(
            "command-registered",
            {
                command
            }
        );

        return {

            ok:
                true,

            command

        };

    }

    // --------------------------------------------------------
    // Compatibility API
    // --------------------------------------------------------

    function registerCustomCommand(
        id,
        execute,
        options = {}
    ) {

        return registerCommand({

            id,

            execute,

            ...options

        });

    }

    // --------------------------------------------------------
    // Unregister
    // --------------------------------------------------------

    function unregisterCommand(
        id
    ) {

        const commandId =
            normalize(
                id
            );

        const command =
            state.commands.get(
                commandId
            );

        if (!command) {

            return false;

        }

        state.commands.delete(
            commandId
        );

        command.aliases.forEach(
            alias => {

                state.aliases.delete(
                    normalize(
                        alias
                    )
                );

            }
        );

        emit(
            "command-unregistered",
            {
                id:
                    commandId
            }
        );

        return true;

    }

    // --------------------------------------------------------
    // Find Command
    // --------------------------------------------------------

    function findCommand(
        value
    ) {

        const input =
            normalize(
                value
            );

        if (!input) {

            return null;

        }

        if (
            state.commands.has(
                input
            )
        ) {

            return state.commands.get(
                input
            );

        }

        if (
            state.aliases.has(
                input
            )
        ) {

            return state.commands.get(
                state.aliases.get(
                    input
                )
            ) || null;

        }

        /*
         * Prüfe längere Alias-/Keyword-Treffer.
         */

        let candidates = [];

        state.commands.forEach(
            command => {

                if (!command.enabled) {
                    return;
                }

                const phrases = [

                    command.id,

                    command.name,

                    ...command.aliases,

                    ...command.keywords

                ];

                phrases.forEach(
                    phrase => {

                        const normalized =
                            normalize(
                                phrase
                            );

                        if (
                            normalized &&
                            input.includes(
                                normalized
                            )
                        ) {

                            candidates.push(
                                {
                                    command,
                                    score:
                                        normalized.length +
                                        command.priority
                                }
                            );

                        }

                    }
                );

            }
        );

        candidates.sort(
            (
                a,
                b
            ) =>
                b.score -
                a.score
        );

        return candidates[0]?.command ||
            null;

    }

    // --------------------------------------------------------
    // Parse Command
    // --------------------------------------------------------

    function parse(
        input
    ) {

        const text =
            clean(
                input
            );

        if (!text) {

            return {

                command:
                    null,

                arguments:
                    [],

                raw:
                    ""

            };

        }

        const tokens =
            text.split(
                /\s+/
            );

        let command =
            findCommand(
                text
            );

        /*
         * Falls kein kompletter Treffer:
         * erstes Token prüfen.
         */

        if (!command) {

            command =
                findCommand(
                    tokens[0]
                );

        }

        if (!command) {

            return {

                command:
                    null,

                arguments:
                    tokens,

                raw:
                    text

            };

        }

        let commandToken =
            command.id;

        const index =
            normalize(
                text
            ).indexOf(
                commandToken
            );

        let argumentText =
            "";

        if (
            index >= 0
        ) {

            argumentText =
                text.slice(
                    index +
                    commandToken.length
                ).trim();

        }

        /*
         * Wenn ID nicht enthalten war,
         * versuche Alias/Name.
         */

        if (
            !argumentText
        ) {

            const possibleTokens =
                [

                    command.id,

                    command.name,

                    ...command.aliases

                ];

            for (
                const token of
                possibleTokens
            ) {

                const normalized =
                    normalize(
                        token
                    );

                const position =
                    normalize(
                        text
                    ).indexOf(
                        normalized
                    );

                if (
                    position ===
                    0
                ) {

                    argumentText =
                        text.slice(
                            token.length
                        ).trim();

                    commandToken =
                        token;

                    break;

                }

            }

        }

        const argumentsList =
            argumentText
                ? argumentText.split(
                    /\s+/
                )
                : [];

        return {

            command,

            arguments:
                argumentsList,

            argumentText,

            commandToken,

            raw:
                text

        };

    }

    // --------------------------------------------------------
    // Execute
    // --------------------------------------------------------

    async function execute(
        input,
        context = {}
    ) {

        const raw =
            clean(
                input
            );

        if (!raw) {

            return {

                ok:
                    false,

                error:
                    "EMPTY_COMMAND"

            };

        }

        state.commandCount++;

        const parsed =
            parse(
                raw
            );

        if (
            !parsed.command
        ) {

            state.failedCommands++;

            const result = {

                ok:
                    false,

                error:
                    "COMMAND_NOT_FOUND",

                input:
                    raw,

                parsed

            };

            addHistory(
                result
            );

            emit(
                "command-failed",
                result
            );

            return result;

        }

        const command =
            parsed.command;

        if (
            command.enabled !==
            true
        ) {

            state.failedCommands++;

            const result = {

                ok:
                    false,

                error:
                    "COMMAND_DISABLED",

                command:
                    command.id

            };

            addHistory(
                result
            );

            emit(
                "command-failed",
                result
            );

            return result;

        }

        const executionContext = {

            ...context,

            input:
                raw,

            command:
                command.id,

            commandDefinition:
                command,

            arguments:
                parsed.arguments,

            argumentText:
                parsed.argumentText,

            language:
                getLanguage()?.getLanguage?.() ||
                null,

            timestamp:
                Date.now()

        };

        emit(
            "command-before-execute",
            executionContext
        );

        try {

            const value =
                await command.execute(
                    executionContext
                );

            state.successfulCommands++;

            const result = {

                ok:
                    true,

                command:
                    command.id,

                value,

                input:
                    raw,

                arguments:
                    parsed.arguments

            };

            addHistory(
                result
            );

            emit(
                "command-executed",
                result
            );

            return result;

        } catch (
            error
        ) {

            state.failedCommands++;

            const result = {

                ok:
                    false,

                error:
                    "COMMAND_EXECUTION_ERROR",

                command:
                    command.id,

                message:
                    error?.message ||
                    String(
                        error
                    ),

                exception:
                    error

            };

            addHistory(
                result
            );

            emit(
                "command-failed",
                result
            );

            return result;

        }

    }

    // --------------------------------------------------------
    // History
    // --------------------------------------------------------

    function addHistory(
        result
    ) {

        state.history.push({

            timestamp:
                Date.now(),

            ...result

        });

        if (
            state.history.length >
            CONFIG.maxHistory
        ) {

            state.history.shift();

        }

    }

    function getHistory() {

        return state.history
            .map(
                entry => ({
                    ...entry
                })
            );

    }

    function clearHistory() {

        state.history =
            [];

        emit(
            "history-cleared"
        );

    }

    // --------------------------------------------------------
    // Helper: Call Module
    // --------------------------------------------------------

    async function callModule(
        module,
        methods,
        args = []
    ) {

        if (!module) {

            return {

                ok:
                    false,

                error:
                    "MODULE_NOT_AVAILABLE"

            };

        }

        for (
            const method of
            methods
        ) {

            if (
                typeof module[method] !==
                "function"
            ) {

                continue;

            }

            try {

                return {

                    ok:
                        true,

                    method,

                    value:
                        await module[method](
                            ...args
                        )

                };

            } catch (
                error
            ) {

                return {

                    ok:
                        false,

                    error:
                        error?.message ||
                        String(
                            error
                        )

                };

            }

        }

        return {

            ok:
                false,

            error:
                "METHOD_NOT_FOUND"

        };

    }

    // ========================================================
    // BUILT-IN COMMANDS
    // ========================================================

    // --------------------------------------------------------
    // HELP
    // --------------------------------------------------------

    registerCommand({

        id:
            "help",

        name:
            "Help",

        description:
            "Zeigt verfügbare HalDo-AI-Befehle.",

        category:
            "system",

        aliases: [

            "hilfe",
            "help me",
            "?",
            "befehle",
            "commands"

        ],

        keywords: [

            "hilfe",
            "help",
            "befehle",
            "commands"

        ],

        priority:
            10,

        execute:
            async () => {

                return {

                    commands:
                        getCommands()

                };

            }

    });

    // --------------------------------------------------------
    // LANGUAGE
    // --------------------------------------------------------

    registerCommand({

        id:
            "set-language-ai",

        name:
            "AI-Sprache ändern",

        description:
            "Ändert die Sprache von HalDo AI.",

        category:
            "language",

        aliases: [

            "language",
            "sprache",
            "ziman",
            "dil"

        ],

        keywords: [

            "sprache",
            "language",
            "ziman",
            "dil"

        ],

        priority:
            20,

        execute:
            async context => {

                const language =
                    getLanguage();

                if (!language) {

                    return {

                        ok:
                            false,

                        error:
                            "AI_LANGUAGE_UNAVAILABLE"

                    };

                }

                const target =
                    context.argumentText;

                if (!target) {

                    return {

                        ok:
                            true,

                        current:
                            language.getLanguage(),

                        supported:
                            language
                                .getSupportedLanguages()

                    };

                }

                return language.setLanguage(
                    target
                );

            }

    });

    // --------------------------------------------------------
    // DETECT LANGUAGE
    // --------------------------------------------------------

    registerCommand({

        id:
            "detect-language",

        name:
            "Sprache erkennen",

        description:
            "Erkennt die Sprache eines Textes.",

        category:
            "language",

        aliases: [

            "detect language",
            "sprache erkennen",
            "detect"

        ],

        keywords: [

            "erkenne",
            "erkennen",
            "detect",
            "language"

        ],

        execute:
            async context => {

                const language =
                    getLanguage();

                if (!language) {

                    return {

                        ok:
                            false,

                        error:
                            "AI_LANGUAGE_UNAVAILABLE"

                    };

                }

                return language.detectLanguage(
                    context.argumentText ||
                    context.input
                );

            }

    });

    // --------------------------------------------------------
    // OPEN APP
    // --------------------------------------------------------

    registerCommand({

        id:
            "open",

        name:
            "App öffnen",

        description:
            "Öffnet eine registrierte HalDo-App.",

        category:
            "apps",

        aliases: [

            "öffne",
            "oeffne",
            "launch",
            "start",
            "open app",
            "app öffnen"

        ],

        keywords: [

            "öffne",
            "oeffne",
            "open",
            "start",
            "launch"

        ],

        priority:
            15,

        execute:
            async context => {

                const target =
                    context.argumentText;

                if (!target) {

                    return {

                        ok:
                            false,

                        error:
                            "APP_NAME_MISSING"

                    };

                }

                const manager =
                    getAppManager();

                const router =
                    getAppRouter();

                const launcher =
                    getLauncher();

                /*
                 * App Manager zuerst.
                 */

                if (manager) {

                    const result =
                        await callModule(
                            manager,

                            [
                                "openApp",
                                "launchApp",
                                "startApp",
                                "open"
                            ],

                            [
                                target
                            ]
                        );

                    if (
                        result.ok
                    ) {

                        return result;

                    }

                }

                /*
                 * Router.
                 */

                if (router) {

                    const result =
                        await callModule(
                            router,

                            [
                                "navigate",
                                "open",
                                "routeTo"
                            ],

                            [
                                target
                            ]
                        );

                    if (
                        result.ok
                    ) {

                        return result;

                    }

                }

                /*
                 * Launcher.
                 */

                if (launcher) {

                    const result =
                        await callModule(
                            launcher,

                            [
                                "launch",
                                "open",
                                "start"
                            ],

                            [
                                target
                            ]
                        );

                    if (
                        result.ok
                    ) {

                        return result;

                    }

                }

                return {

                    ok:
                        false,

                    error:
                        "APP_SYSTEM_UNAVAILABLE",

                    target

                };

            }

    });

    // --------------------------------------------------------
    // CLOSE APP
    // --------------------------------------------------------

    registerCommand({

        id:
            "close",

        name:
            "App schließen",

        description:
            "Schließt eine laufende App.",

        category:
            "apps",

        aliases: [

            "schließe",
            "schliesse",
            "close app",
            "stop"

        ],

        keywords: [

            "schließe",
            "schliesse",
            "close",
            "stop"

        ],

        execute:
            async context => {

                const target =
                    context.argumentText;

                if (!target) {

                    return {

                        ok:
                            false,

                        error:
                            "APP_NAME_MISSING"

                    };

                }

                return callModule(

                    getAppManager(),

                    [

                        "closeApp",
                        "stopApp",
                        "close",
                        "stop"

                    ],

                    [
                        target
                    ]

                );

            }

    });

    // --------------------------------------------------------
    // SYSTEM STATUS
    // --------------------------------------------------------

    registerCommand({

        id:
            "system-status",

        name:
            "Systemstatus",

        description:
            "Zeigt den aktuellen HalDo-Systemstatus.",

        category:
            "system",

        aliases: [

            "status",
            "system status",
            "systemstatus",
            "zustand"

        ],

        keywords: [

            "status",
            "system",
            "zustand"

        ],

        priority:
            10,

        execute:
            async () => {

                return callModule(

                    getSystem(),

                    [

                        "getStatus",
                        "status",
                        "getSystemStatus"

                    ]

                );

            }

    });

    // --------------------------------------------------------
    // KERNEL STATUS
    // --------------------------------------------------------

    registerCommand({

        id:
            "kernel-status",

        name:
            "Kernelstatus",

        description:
            "Zeigt den Status des HalDo-Kernels.",

        category:
            "system",

        aliases: [

            "kernel",
            "kernel status"

        ],

        execute:
            async () => {

                return callModule(

                    getKernel(),

                    [

                        "getStatus",
                        "getDiagnostics",
                        "diagnostics"

                    ]

                );

            }

    });

    // --------------------------------------------------------
    // MEMORY / STORAGE
    // --------------------------------------------------------

    registerCommand({

        id:
            "storage-status",

        name:
            "Speicherstatus",

        description:
            "Prüft die HalDo-Speicherverbindung.",

        category:
            "system",

        aliases: [

            "storage",
            "speicher",
            "memory status"

        ],

        execute:
            async () => {

                return callModule(

                    getStorage(),

                    [

                        "getStatus",
                        "status",
                        "diagnostics"

                    ]

                );

            }

    });

    // --------------------------------------------------------
    // CHAT
    // --------------------------------------------------------

    registerCommand({

        id:
            "chat",

        name:
            "AI Chat",

        description:
            "Öffnet bzw. aktiviert den HalDo-AI-Chat.",

        category:
            "ai",

        aliases: [

            "ai chat",
            "chat öffnen",
            "chat öffnen",
            "conversation",
            "gespräch"

        ],

        keywords: [

            "chat",
            "gespräch",
            "conversation"

        ],

        execute:
            async context => {

                const chat =
                    getChat();

                if (!chat) {

                    return {

                        ok:
                            false,

                        error:
                            "AI_CHAT_UNAVAILABLE"

                    };

                }

                return callModule(

                    chat,

                    [

                        "open",
                        "show",
                        "activate",
                        "start"

                    ],

                    []

                );

            }

    });

    // --------------------------------------------------------
    // AI STATUS
    // --------------------------------------------------------

    registerCommand({

        id:
            "ai-status",

        name:
            "AI Status",

        description:
            "Zeigt den Status der HalDo AI.",

        category:
            "ai",

        aliases: [

            "ai status",
            "ki status",
            "ai-status"

        ],

        execute:
            async () => {

                return callModule(

                    getAI(),

                    [

                        "getStatus",
                        "status",
                        "diagnostics"

                    ]

                );

            }

    });

    // --------------------------------------------------------
    // VOICE
    // --------------------------------------------------------

    registerCommand({

        id:
            "voice",

        name:
            "AI Stimme",

        description:
            "Steuert die Sprachfunktion.",

        category:
            "voice",

        aliases: [

            "sprich",
            "sprech",
            "voice",
            "speech"

        ],

        keywords: [

            "sprich",
            "sprechen",
            "voice",
            "speech"

        ],

        execute:
            async context => {

                const voice =
                    window.HalDoAIVoice ||
                    window.HalDoVoice ||
                    window.HalDoOS?.voice ||
                    null;

                if (!voice) {

                    return {

                        ok:
                            false,

                        error:
                            "VOICE_UNAVAILABLE"

                    };

                }

                return callModule(

                    voice,

                    [

                        "speak",
                        "say",
                        "start",
                        "open"

                    ],

                    [
                        context.argumentText
                    ]

                );

            }

    });

    // --------------------------------------------------------
    // EZIDI KEYBOARD
    // --------------------------------------------------------

    registerCommand({

        id:
            "ezidi-keyboard",

        name:
            "Êzîdî-Tastatur",

        description:
            "Öffnet oder aktiviert die Êzîdî-Tastatur.",

        category:
            "keyboard",

        aliases: [

            "ezidi",
            "êzîdî",
            "ezidi keyboard",
            "kurdish keyboard",
            "kurdische tastatur"

        ],

        keywords: [

            "ezidi",
            "êzîdî",
            "keyboard",
            "tastatur",
            "kurdish"

        ],

        execute:
            async () => {

                const keyboard =
                    window.HalDoEzidiKeyboard ||
                    window.HalDoOS?.ezidiKeyboard;

                if (!keyboard) {

                    return {

                        ok:
                            false,

                        error:
                            "EZIDI_KEYBOARD_UNAVAILABLE"

                    };

                }

                return callModule(

                    keyboard,

                    [

                        "open",
                        "show",
                        "activate",
                        "enable",
                        "toggle"

                    ],

                    []

                );

            }

    });

    // --------------------------------------------------------
    // REGISTER ALIAS API
    // --------------------------------------------------------

    function registerAlias(
        alias,
        commandId
    ) {

        const normalizedAlias =
            normalize(
                alias
            );

        const normalizedCommand =
            normalize(
                commandId
            );

        if (
            !normalizedAlias ||
            !state.commands.has(
                normalizedCommand
            )
        ) {

            return false;

        }

        state.aliases.set(
            normalizedAlias,
            normalizedCommand
        );

        const command =
            state.commands.get(
                normalizedCommand
            );

        if (
            !command.aliases.includes(
                alias
            )
        ) {

            command.aliases.push(
                alias
            );

        }

        return true;

    }

    // --------------------------------------------------------
    // Command List
    // --------------------------------------------------------

    function getCommands() {

        return Array.from(
            state.commands.values()
        )
        .map(
            command => ({

                id:
                    command.id,

                name:
                    command.name,

                description:
                    command.description,

                category:
                    command.category,

                aliases:
                    command.aliases.slice(),

                keywords:
                    command.keywords.slice(),

                enabled:
                    command.enabled

            })
        );

    }

    // --------------------------------------------------------
    // Search Commands
    // --------------------------------------------------------

    function searchCommands(
        query
    ) {

        const q =
            normalize(
                query
            );

        if (!q) {

            return getCommands();

        }

        return getCommands()
            .filter(
                command => {

                    const text =
                        [

                            command.id,

                            command.name,

                            command.description,

                            ...command.aliases,

                            ...command.keywords

                        ]
                        .join(
                            " "
                        )
                        .toLowerCase();

                    return text.includes(
                        q
                    );

                }
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

            commandCount:
                state.commandCount,

            successfulCommands:
                state.successfulCommands,

            failedCommands:
                state.failedCommands,

            registeredCommands:
                state.commands.size,

            aliases:
                state.aliases.size,

            history:
                state.history.length,

            connections: {

                aiCore:
                    Boolean(
                        getAI()
                    ),

                aiChat:
                    Boolean(
                        getChat()
                    ),

                aiLanguage:
                    Boolean(
                        getLanguage()
                    ),

                appManager:
                    Boolean(
                        getAppManager()
                    ),

                appRouter:
                    Boolean(
                        getAppRouter()
                    ),

                launcher:
                    Boolean(
                        getLauncher()
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
                    )

            }

        };

    }

    // --------------------------------------------------------
    // Initialize
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
         * Verbindung zur Sprachschicht.
         */

        const language =
            getLanguage();

        if (
            language &&
            typeof language.on ===
            "function"
        ) {

            language.on(
                "language-changed",
                detail => {

                    emit(
                        "language-changed",
                        detail
                    );

                }
            );

        }

        /*
         * AI Core Events.
         */

        const ai =
            getAI();

        if (
            ai &&
            typeof ai.on ===
            "function"
        ) {

            try {

                ai.on(
                    "ready",
                    detail => {

                        emit(
                            "ai-ready",
                            detail
                        );

                    }
                );

            } catch (
                error
            ) {}

        }

        /*
         * Kernel Registrierung.
         */

        const kernel =
            getKernel();

        if (
            kernel &&
            typeof kernel.registerModule ===
            "function"
        ) {

            try {

                kernel.registerModule(
                    "ai-commands",
                    api
                );

            } catch (
                error
            ) {}

        }

        emit(
            "initialized",
            getStatus()
        );

        /*
         * Andere Module können nach DOMContentLoaded
         * noch später geladen worden sein.
         */

        window.setTimeout(
            () => {

                state.ready =
                    true;

                emit(
                    "ready",
                    getStatus()
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

        registerCustomCommand,

        registerAlias,

        unregisterCommand,

        findCommand,

        parse,

        execute,

        getCommands,

        searchCommands,

        getHistory,

        clearHistory,

        getStatus

    };

    // --------------------------------------------------------
    // Global Registration
    // --------------------------------------------------------

    window.HalDoAICommands =
        api;

    window.HalDoOS.aiCommands =
        api;

    // --------------------------------------------------------
    // Boot
    // --------------------------------------------------------

    function boot() {

        try {

            initialize();

        } catch (
            error
        ) {

            console.error(
                "[HalDoAICommands] " +
                "Initialization failed:",
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

// ============================================================
// END OF PART 78
// ============================================================