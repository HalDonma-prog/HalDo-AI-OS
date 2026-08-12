// ============================================================
// HALDO AI OS 18
// AI COMMAND ENGINE
// PART 83
// ============================================================

(function (window, document) {

    "use strict";

    if (
        window.HalDoAICommands &&
        window.HalDoAICommands.__haldoAI18
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    const CONFIG = {

        name:
            "HalDo AI Command Engine",

        version:
            "18.0.0",

        maxHistory:
            200,

        confidenceThreshold:
            0.55

    };

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    const state = {

        initialized:
            false,

        ready:
            false,

        processing:
            false,

        lastCommand:
            null,

        lastResult:
            null,

        history:
            [],

        registeredCommands:
            {},

        aliases:
            {},

        errors:
            []

    };

    // --------------------------------------------------------
    // EVENTS
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
            set.size === 0
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

                } catch (error) {

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

        } catch (error) {}

    }

    // --------------------------------------------------------
    // UTILITIES
    // --------------------------------------------------------

    function clean(
        value
    ) {

        return String(
            value ?? ""
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

    function createId(
        prefix = "command"
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

    // --------------------------------------------------------
    // SYSTEM CONNECTIONS
    // --------------------------------------------------------

    function getKernel() {

        return (
            window.HalDoKernel ||
            window.HalDoOS?.kernel ||
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

    function getLauncher() {

        return (
            window.HalDoLauncher ||
            window.HalDoAppLauncher ||
            window.HalDoOS?.launcher ||
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

    function getRouter() {

        return (
            window.HalDoAppRouter ||
            window.HalDoOS?.appRouter ||
            null
        );

    }

    function getConversationState() {

        return (
            window.HalDoConversationState ||
            window.HalDoOS?.conversationState ||
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

    // --------------------------------------------------------
    // COMMAND REGISTRATION
    // --------------------------------------------------------

    function registerCommand(
        definition
    ) {

        if (
            !definition ||
            !definition.id
        ) {

            return false;

        }

        const id =
            normalize(
                definition.id
            );

        if (
            typeof definition.execute !==
            "function"
        ) {

            return false;

        }

        const command = {

            id,

            name:
                definition.name ||
                id,

            description:
                definition.description ||
                "",

            keywords:
                Array.isArray(
                    definition.keywords
                )
                    ? definition.keywords
                    : [],

            aliases:
                Array.isArray(
                    definition.aliases
                )
                    ? definition.aliases
                    : [],

            priority:
                Number(
                    definition.priority ||
                    0
                ),

            requiresConfirmation:
                Boolean(
                    definition.requiresConfirmation
                ),

            execute:
                definition.execute,

            metadata:
                definition.metadata ||
                {}

        };

        state.registeredCommands[
            id
        ] =
            command;

        command.aliases.forEach(
            alias => {

                state.aliases[
                    normalize(
                        alias
                    )
                ] =
                    id;

            }
        );

        emit(
            "registered",
            {
                command
            }
        );

        return command;

    }

    function unregisterCommand(
        id
    ) {

        const key =
            normalize(
                id
            );

        const command =
            state.registeredCommands[
                key
            ];

        if (!command) {
            return false;
        }

        delete state
            .registeredCommands[
                key
            ];

        Object.keys(
            state.aliases
        ).forEach(
            alias => {

                if (
                    state.aliases[
                        alias
                    ] === key
                ) {

                    delete state
                        .aliases[
                            alias
                        ];

                }

            }
        );

        emit(
            "unregistered",
            {
                id: key
            }
        );

        return true;

    }

    function getCommand(
        id
    ) {

        const key =
            normalize(
                id
            );

        const resolved =
            state.aliases[key] ||
            key;

        return (
            state.registeredCommands[
                resolved
            ] ||
            null
        );

    }

    function getCommands() {

        return Object.values(
            state.registeredCommands
        );

    }

    // --------------------------------------------------------
    // COMMAND DETECTION
    // --------------------------------------------------------

    function scoreCommand(
        command,
        input
    ) {

        const text =
            normalize(
                input
            );

        let score =
            0;

        const exact =
            normalize(
                command.name
            );

        if (
            text === exact
        ) {

            score +=
                1;

        }

        if (
            text.includes(
                exact
            )
        ) {

            score +=
                0.45;

        }

        const words =
            text.split(
                " "
            );

        command.keywords
            .forEach(
                keyword => {

                    const key =
                        normalize(
                            keyword
                        );

                    if (
                        text.includes(
                            key
                        )
                    ) {

                        score +=
                            0.18;

                    }

                }
            );

        command.aliases
            .forEach(
                alias => {

                    const key =
                        normalize(
                            alias
                        );

                    if (
                        text.includes(
                            key
                        )
                    ) {

                        score +=
                            0.3;

                    }

                }
            );

        if (
            words.length === 1 &&
            command.aliases.some(
                alias =>
                    normalize(
                        alias
                    ) === text
            )
        ) {

            score +=
                0.5;

        }

        score +=
            Math.max(
                0,
                command.priority /
                1000
            );

        return Math.min(
            1,
            score
        );

    }

    function detectCommand(
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

                confidence:
                    0,

                input:
                    text

            };

        }

        const candidates =
            getCommands()
                .map(
                    command => ({

                        command,

                        confidence:
                            scoreCommand(
                                command,
                                text
                            )

                    })
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        b.confidence -
                        a.confidence
                );

        const best =
            candidates[0];

        if (
            !best ||
            best.confidence <
            CONFIG.confidenceThreshold
        ) {

            return {

                command:
                    null,

                confidence:
                    best?.confidence ||
                    0,

                input:
                    text,

                candidates

            };

        }

        return {

            command:
                best.command,

            confidence:
                best.confidence,

            input:
                text,

            candidates

        };

    }

    // --------------------------------------------------------
    // PARAMETER EXTRACTION
    // --------------------------------------------------------

    function extractArguments(
        input,
        command
    ) {

        const text =
            clean(
                input
            );

        const args = {

            raw:
                text,

            input:
                text,

            command:
                command?.id ||
                null,

            language:
                null,

            app:
                null,

            query:
                text,

            value:
                null

        };

        const language =
            getLanguage();

        if (
            language &&
            typeof language.detectLanguage ===
            "function"
        ) {

            try {

                const detected =
                    language.detectLanguage(
                        text
                    );

                args.language =
                    detected.language;

            } catch (error) {}

        }

        /*
         * App-Namen erkennen.
         */

        const appManager =
            getAppManager();

        if (
            appManager
        ) {

            let apps = [];

            try {

                if (
                    typeof appManager.getApps ===
                    "function"
                ) {

                    apps =
                        appManager.getApps();

                }

            } catch (error) {}

            if (
                Array.isArray(apps)
            ) {

                const normalizedText =
                    normalize(
                        text
                    );

                const found =
                    apps.find(
                        app => {

                            const values = [

                                app.id,

                                app.name,

                                app.title,

                                app.label

                            ];

                            return values.some(
                                value =>
                                    value &&
                                    normalizedText
                                        .includes(
                                            normalize(
                                                value
                                            )
                                        )
                            );

                        }
                    );

                if (found) {

                    args.app =
                        found;

                }

            }

        }

        return args;

    }

    // --------------------------------------------------------
    // HISTORY
    // --------------------------------------------------------

    function addHistory(
        entry
    ) {

        state.history.push(
            entry
        );

        if (
            state.history.length >
            CONFIG.maxHistory
        ) {

            state.history.shift();

        }

    }

    function getHistory(
        limit = 50
    ) {

        return state.history
            .slice(
                -limit
            );

    }

    function clearHistory() {

        state.history =
            [];

        emit(
            "history-cleared"
        );

        return true;

    }

    // --------------------------------------------------------
    // EXECUTION
    // --------------------------------------------------------

    async function execute(
        input,
        options = {}
    ) {

        const text =
            clean(
                input
            );

        if (!text) {

            return {

                ok:
                    false,

                error:
                    "EMPTY_COMMAND"

            };

        }

        state.processing =
            true;

        emit(
            "processing-start",
            {
                input:
                    text
            }
        );

        const detected =
            options.command
                ? {

                    command:
                        getCommand(
                            options.command
                        ),

                    confidence:
                        1

                }
                : detectCommand(
                    text
                );

        const command =
            detected.command;

        const args =
            extractArguments(
                text,
                command
            );

        const entry = {

            id:
                createId(),

            timestamp:
                Date.now(),

            input:
                text,

            command:
                command?.id ||
                null,

            confidence:
                detected.confidence,

            arguments:
                args,

            ok:
                false,

            result:
                null,

            error:
                null

        };

        state.lastCommand =
            entry;

        try {

            if (!command) {

                entry.error =
                    "COMMAND_NOT_FOUND";

                entry.result = {

                    ok:
                        false,

                    message:
                        "Kein passender HalDo-AI-Befehl gefunden."

                };

                return entry;

            }

            if (
                command.requiresConfirmation &&
                !options.confirmed
            ) {

                entry.result = {

                    ok:
                        false,

                    requiresConfirmation:
                        true,

                    command:
                        command.id,

                    message:
                        "Für diesen Befehl ist eine Bestätigung erforderlich."

                };

                emit(
                    "confirmation-required",
                    {
                        command,
                        arguments:
                            args
                    }
                );

                return entry;

            }

            const result =
                await command.execute(
                    args,
                    {

                        input:
                            text,

                        command,

                        confidence:
                            detected.confidence,

                        options

                    }
                );

            entry.ok =
                result?.ok !== false;

            entry.result =
                result;

            state.lastResult =
                result;

            emit(
                "executed",
                {
                    entry,

                    command,

                    result

                }
            );

            return entry;

        } catch (error) {

            entry.error =
                error?.message ||
                String(
                    error
                );

            entry.ok =
                false;

            recordError(
                error
            );

            emit(
                "execution-error",
                {
                    entry,

                    error

                }
            );

            return entry;

        } finally {

            addHistory(
                entry
            );

            state.processing =
                false;

            emit(
                "processing-end",
                {
                    entry
                }
            );

        }

    }

    // --------------------------------------------------------
    // BUILT-IN COMMANDS
    // --------------------------------------------------------

    function registerBuiltInCommands() {

        registerCommand({

            id:
                "help",

            name:
                "Help",

            description:
                "Zeigt verfügbare HalDo-AI-Befehle.",

            keywords: [

                "hilfe",
                "help",
                "befehle",
                "commands",
                "was kannst du"

            ],

            aliases: [

                "hilfe",
                "help",
                "befehlsliste"

            ],

            priority:
                10,

            execute:
                async () => {

                    return {

                        ok:
                            true,

                        type:
                            "command-list",

                        commands:
                            getCommands()
                                .map(
                                    command => ({

                                        id:
                                            command.id,

                                        name:
                                            command.name,

                                        description:
                                            command.description

                                    })
                                )

                    };

                }

        });

        registerCommand({

            id:
                "system-status",

            name:
                "Systemstatus",

            description:
                "Zeigt den aktuellen HalDo-Systemstatus.",

            keywords: [

                "systemstatus",
                "system status",
                "status",
                "system prüfen",
                "system check"

            ],

            aliases: [

                "status",
                "systemstatus"

            ],

            priority:
                20,

            execute:
                async () => {

                    const system =
                        getSystem();

                    const kernel =
                        getKernel();

                    return {

                        ok:
                            true,

                        type:
                            "system-status",

                        system:
                            system &&
                            typeof system.getStatus ===
                            "function"
                                ? system.getStatus()
                                : null,

                        kernel:
                            kernel &&
                            typeof kernel.getStatus ===
                            "function"
                                ? kernel.getStatus()
                                : null

                    };

                }

        });

        registerCommand({

            id:
                "open-app",

            name:
                "App öffnen",

            description:
                "Öffnet eine Anwendung.",

            keywords: [

                "öffne",
                "öffnen",
                "starte",
                "starten",
                "open",
                "launch",
                "app",
                "anwendung"

            ],

            aliases: [

                "app öffnen",
                "open app",
                "starte app"

            ],

            priority:
                30,

            execute:
                async (
                    args
                ) => {

                    let target =
                        args.app;

                    /*
                     * Wenn der AppManager nichts
                     * erkannt hat, wird der Text
                     * weitergegeben.
                     */

                    if (
                        !target
                    ) {

                        target =
                            args.query
                                .replace(
                                    /^(öffne|öffnen|starte|starten|open|launch|app)\s*/i,
                                    ""
                                )
                                .trim();

                    }

                    if (!target) {

                        return {

                            ok:
                                false,

                            error:
                                "APP_NOT_SPECIFIED"

                        };

                    }

                    const launcher =
                        getLauncher();

                    const appManager =
                        getAppManager();

                    /*
                     * Launcher bevorzugen.
                     */

                    if (
                        launcher
                    ) {

                        for (
                            const method of [
                                "launch",
                                "openApp",
                                "open",
                                "start"
                            ]
                        ) {

                            if (
                                typeof launcher[
                                    method
                                ] !==
                                "function"
                            ) {
                                continue;
                            }

                            try {

                                const result =
                                    await launcher[
                                        method
                                    ](
                                        typeof target ===
                                        "object"
                                            ? target.id ||
                                              target.name
                                            : target
                                    );

                                return {

                                    ok:
                                        result !==
                                        false,

                                    type:
                                        "app-opened",

                                    app:
                                        target,

                                    result

                                };

                            } catch (
                                error
                            ) {}

                        }

                    }

                    /*
                     * Fallback AppManager.
                     */

                    if (
                        appManager
                    ) {

                        for (
                            const method of [
                                "launchApp",
                                "openApp",
                                "startApp",
                                "launch"
                            ]
                        ) {

                            if (
                                typeof appManager[
                                    method
                                ] !==
                                "function"
                            ) {
                                continue;
                            }

                            try {

                                const result =
                                    await appManager[
                                        method
                                    ](
                                        typeof target ===
                                        "object"
                                            ? target.id ||
                                              target.name
                                            : target
                                    );

                                return {

                                    ok:
                                        result !==
                                        false,

                                    type:
                                        "app-opened",

                                    app:
                                        target,

                                    result

                                };

                            } catch (
                                error
                            ) {}

                        }

                    }

                    return {

                        ok:
                            false,

                        error:
                            "APP_LAUNCH_UNAVAILABLE",

                        app:
                            target

                    };

                }

        });

        registerCommand({

            id:
                "close-app",

            name:
                "App schließen",

            description:
                "Schließt eine laufende Anwendung.",

            keywords: [

                "schließe",
                "schliessen",
                "beenden",
                "stoppen",
                "close",
                "quit",
                "exit"

            ],

            aliases: [

                "app schließen",
                "close app",
                "beende app"

            ],

            priority:
                25,

            execute:
                async (
                    args
                ) => {

                    const target =
                        args.app ||
                        args.query
                            .replace(
                                /^(schließe|schliessen|beenden|stoppen|close|quit|exit)\s*/i,
                                ""
                            )
                            .trim();

                    const appManager =
                        getAppManager();

                    if (
                        appManager
                    ) {

                        for (
                            const method of [
                                "closeApp",
                                "stopApp",
                                "close",
                                "stop"
                            ]
                        ) {

                            if (
                                typeof appManager[
                                    method
                                ] !==
                                "function"
                            ) {
                                continue;
                            }

                            try {

                                const result =
                                    await appManager[
                                        method
                                    ](
                                        typeof target ===
                                        "object"
                                            ? target.id
                                            : target
                                    );

                                return {

                                    ok:
                                        result !==
                                        false,

                                    type:
                                        "app-closed",

                                    app:
                                        target,

                                    result

                                };

                            } catch (
                                error
                            ) {}

                        }

                    }

                    return {

                        ok:
                            false,

                        error:
                            "APP_CLOSE_UNAVAILABLE",

                        app:
                            target

                    };

                }

        });

        registerCommand({

            id:
                "home",

            name:
                "Startseite",

            description:
                "Kehrt zur HalDo-Startoberfläche zurück.",

            keywords: [

                "home",
                "startseite",
                "desktop",
                "hauptseite",
                "start"

            ],

            aliases: [

                "home",
                "zur startseite",
                "zum desktop"

            ],

            priority:
                15,

            execute:
                async () => {

                    const launcher =
                        getLauncher();

                    const router =
                        getRouter();

                    if (
                        router
                    ) {

                        for (
                            const method of [
                                "navigate",
                                "go",
                                "route"
                            ]
                        ) {

                            if (
                                typeof router[
                                    method
                                ] !==
                                "function"
                            ) {
                                continue;
                            }

                            try {

                                const result =
                                    await router[
                                        method
                                    ](
                                        "home"
                                    );

                                return {

                                    ok:
                                        result !==
                                        false,

                                    type:
                                        "home",

                                    result

                                };

                            } catch (
                                error
                            ) {}

                        }

                    }

                    if (
                        launcher
                    ) {

                        for (
                            const method of [
                                "showHome",
                                "home",
                                "openHome"
                            ]
                        ) {

                            if (
                                typeof launcher[
                                    method
                                ] !==
                                "function"
                            ) {
                                continue;
                            }

                            try {

                                const result =
                                    await launcher[
                                        method
                                    ]();

                                return {

                                    ok:
                                        result !==
                                        false,

                                    type:
                                        "home",

                                    result

                                };

                            } catch (
                                error
                            ) {}

                        }

                    }

                    return {

                        ok:
                            false,

                        error:
                            "HOME_UNAVAILABLE"

                    };

                }

        });

        registerCommand({

            id:
                "language",

            name:
                "Sprache wechseln",

            description:
                "Ändert die Sprache von HalDo AI.",

            keywords: [

                "sprache",
                "language",
                "deutsch",
                "englisch",
                "english",
                "german",
                "kurdî",
                "êzîdî",
                "ezidi"

            ],

            aliases: [

                "sprache ändern",
                "language change"

            ],

            priority:
                18,

            execute:
                async (
                    args
                ) => {

                    const language =
                        getLanguage();

                    if (!language) {

                        return {

                            ok:
                                false,

                            error:
                                "LANGUAGE_ENGINE_UNAVAILABLE"

                        };

                    }

                    const text =
                        normalize(
                            args.query
                        );

                    const mapping = {

                        deutsch:
                            "de",

                        german:
                            "de",

                        englisch:
                            "en",

                        english:
                            "en",

                        kurdisch:
                            "ku",

                        kurdî:
                            "ku",

                        türkisch:
                            "tr",

                        turkish:
                            "tr",

                        arabisch:
                            "ar",

                        arabic:
                            "ar",

                        französisch:
                            "fr",

                        french:
                            "fr",

                        spanisch:
                            "es",

                        spanish:
                            "es",

                        italienisch:
                            "it",

                        italian:
                            "it",

                        niederländisch:
                            "nl",

                        dutch:
                            "nl",

                        russisch:
                            "ru",

                        russian:
                            "ru",

                        persisch:
                            "fa",

                        farsi:
                            "fa",

                        japanisch:
                            "ja",

                        japanese:
                            "ja",

                        koreanisch:
                            "ko",

                        korean:
                            "ko",

                        chinesisch:
                            "zh",

                        chinese:
                            "zh",

                        êzîdî:
                            "ez",

                        ezidi:
                            "ez",

                        yezidi:
                            "ez"

                    };

                    let target =
                        null;

                    Object.keys(
                        mapping
                    ).some(
                        name => {

                            if (
                                text.includes(
                                    name
                                )
                            ) {

                                target =
                                    mapping[
                                        name
                                    ];

                                return true;

                            }

                            return false;

                        }
                    );

                    if (!target) {

                        return {

                            ok:
                                false,

                            error:
                                "LANGUAGE_NOT_SPECIFIED",

                            supported:
                                language
                                    .getSupportedLanguages()

                        };

                    }

                    const result =
                        target ===
                        "ez" &&
                        typeof language.setEzidiLanguage ===
                        "function"
                            ? await language
                                .setEzidiLanguage({
                                    source:
                                        "ai-command"
                                })
                            : await language
                                .setLanguage(
                                    target,
                                    {
                                        source:
                                            "ai-command"
                                    }
                                );

                    return {

                        ...result,

                        type:
                            "language-changed"

                    };

                }

        });

        registerCommand({

            id:
                "new-conversation",

            name:
                "Neue Unterhaltung",

            description:
                "Startet eine neue AI-Unterhaltung.",

            keywords: [

                "neue unterhaltung",
                "neuer chat",
                "new conversation",
                "new chat",
                "neues gespräch"

            ],

            aliases: [

                "neuer chat",
                "neue unterhaltung",
                "new chat"

            ],

            priority:
                22,

            execute:
                async () => {

                    const conversation =
                        getConversationState();

                    if (
                        conversation &&
                        typeof conversation.createConversation ===
                        "function"
                    ) {

                        const result =
                            conversation
                                .createConversation();

                        return {

                            ok:
                                true,

                            type:
                                "new-conversation",

                            conversation:
                                result

                        };

                    }

                    return {

                        ok:
                            false,

                        error:
                            "CONVERSATION_STATE_UNAVAILABLE"

                    };

                }

        });

        registerCommand({

            id:
                "clear-conversation",

            name:
                "Unterhaltung löschen",

            description:
                "Löscht die Nachrichten der aktuellen Unterhaltung.",

            keywords: [

                "chat löschen",
                "unterhaltung löschen",
                "gespräch löschen",
                "clear chat",
                "clear conversation"

            ],

            aliases: [

                "chat löschen",
                "clear chat"

            ],

            priority:
                12,

            requiresConfirmation:
                true,

            execute:
                async () => {

                    const conversation =
                        getConversationState();

                    if (
                        conversation &&
                        typeof conversation.clearMessages ===
                        "function"
                    ) {

                        conversation
                            .clearMessages();

                        return {

                            ok:
                                true,

                            type:
                                "conversation-cleared"

                        };

                    }

                    return {

                        ok:
                            false,

                        error:
                            "CONVERSATION_STATE_UNAVAILABLE"

                    };

                }

        });

        registerCommand({

            id:
                "reload",

            name:
                "System neu laden",

            description:
                "Fordert einen Neustart der Oberfläche an.",

            keywords: [

                "neu laden",
                "reload",
                "neustart",
                "restart",
                "system neu starten"

            ],

            aliases: [

                "reload",
                "neustart"

            ],

            priority:
                5,

            requiresConfirmation:
                true,

            execute:
                async () => {

                    try {

                        window.location.reload();

                        return {

                            ok:
                                true,

                            type:
                                "reload"

                        };

                    } catch (
                        error
                    ) {

                        return {

                            ok:
                                false,

                            error:
                                "RELOAD_FAILED"

                        };

                    }

                }

        });

    }

    // --------------------------------------------------------
    // ERROR
    // --------------------------------------------------------

    function recordError(
        error
    ) {

        const entry = {

            timestamp:
                Date.now(),

            message:
                error?.message ||
                String(
                    error
                )

        };

        state.errors.push(
            entry
        );

        if (
            state.errors.length >
            100
        ) {

            state.errors.shift();

        }

        emit(
            "error",
            entry
        );

    }

    // --------------------------------------------------------
    // STATUS
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

            processing:
                state.processing,

            commandCount:
                Object.keys(
                    state.registeredCommands
                ).length,

            historyCount:
                state.history.length,

            lastCommand:
                state.lastCommand,

            errors:
                state.errors.length

        };

    }

    // --------------------------------------------------------
    // INITIALIZE
    // --------------------------------------------------------

    async function initialize() {

        if (
            state.initialized
        ) {

            return getStatus();

        }

        state.initialized =
            true;

        registerBuiltInCommands();

        /*
         * Sprachwechsel beobachten.
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
         * Kernel registrieren.
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

            } catch (error) {}

        }

        emit(
            "initialized",
            getStatus()
        );

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
    // PUBLIC API
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

        getCommand,

        getCommands,

        detectCommand,

        extractArguments,

        execute,

        addHistory,

        getHistory,

        clearHistory,

        getStatus

    };

    // --------------------------------------------------------
    // GLOBAL REGISTRATION
    // --------------------------------------------------------

    window.HalDoAICommands =
        api;

    window.HalDoOS.aiCommands =
        api;

    // --------------------------------------------------------
    // BOOT
    // --------------------------------------------------------

    async function boot() {

        try {

            await initialize();

        } catch (error) {

            recordError(
                error
            );

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
// END OF PART 83
// ============================================================