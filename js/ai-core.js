/* ================================================================
   HALDO AI OS 20
   AI CORE
   FILE: js/ai-core.js

   ZENTRALER AI-KERN
   ------------------------------------------------
   - AI State
   - Events
   - Conversation
   - Memory
   - Intent Detection
   - Commands
   - App Control
   - Window Control
   - System Bridge
   - Storage Bridge
   - Voice/Speech Bridge
   - externe AI-Provider-Schnittstelle
   - kompatibel mit HDA5 / HalDo
   ================================================================ */

"use strict";

(function () {

    /* ============================================================
       GLOBAL NAMESPACE
       ============================================================ */

    const HD =
        window.HalDo =
        window.HalDo || {};

    /*
     * Ältere Projektteile verwenden HDA5.
     * Wir halten diesen Namen kompatibel.
     */
    const HDA5 =
        window.HDA5 =
        window.HDA5 || HD;

    /* ============================================================
       BASIC EVENT BRIDGE
       ============================================================ */

    HD.events =
        HD.events || {

            listeners:
                HD.events?.listeners ||
                new Map(),

            on(name, handler) {

                if (
                    typeof handler !==
                    "function"
                ) {
                    return () => {};
                }

                if (
                    !this.listeners.has(name)
                ) {
                    this.listeners.set(
                        name,
                        new Set()
                    );
                }

                this.listeners
                    .get(name)
                    .add(handler);

                return () => {

                    this.listeners
                        .get(name)
                        ?.delete(handler);

                };

            },

            off(name, handler) {

                this.listeners
                    .get(name)
                    ?.delete(handler);

            },

            emit(name, payload) {

                const set =
                    this.listeners.get(name);

                if (!set) {
                    return;
                }

                for (
                    const handler
                    of Array.from(set)
                ) {

                    try {

                        handler(payload);

                    } catch (error) {

                        console.error(
                            "[HalDo AI Event]",
                            name,
                            error
                        );

                    }

                }

            }

        };

    HD.on =
        HD.on ||
        function (
            name,
            handler
        ) {

            return HD.events.on(
                name,
                handler
            );

        };

    HD.off =
        HD.off ||
        function (
            name,
            handler
        ) {

            return HD.events.off(
                name,
                handler
            );

        };

    HD.emit =
        HD.emit ||
        function (
            name,
            payload
        ) {

            return HD.events.emit(
                name,
                payload
            );

        };

    /* ============================================================
       STORAGE BRIDGE
       ============================================================ */

    function storageGet(
        key,
        fallback
    ) {

        try {

            if (
                HD.storage &&
                typeof HD.storage.get ===
                "function"
            ) {

                const value =
                    HD.storage.get(
                        key,
                        fallback
                    );

                return value === undefined
                    ? fallback
                    : value;

            }

        } catch (error) {

            console.warn(
                "[HalDo AI] Storage read failed",
                error
            );

        }

        try {

            const raw =
                window.localStorage.getItem(
                    key
                );

            if (
                raw === null
            ) {
                return fallback;
            }

            return JSON.parse(
                raw
            );

        } catch {

            return fallback;

        }

    }

    function storageSet(
        key,
        value
    ) {

        try {

            if (
                HD.storage &&
                typeof HD.storage.set ===
                "function"
            ) {

                HD.storage.set(
                    key,
                    value
                );

                return true;

            }

        } catch (error) {

            console.warn(
                "[HalDo AI] Storage write failed",
                error
            );

        }

        try {

            window.localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch {

            return false;

        }

    }

    /* ============================================================
       AI MEMORY
       ============================================================ */

    HD.aiMemory =
        HD.aiMemory || {

            key:
                "haldo-ai-memory",

            data:
                storageGet(
                    "haldo-ai-memory",
                    {
                        facts: [],
                        preferences: [],
                        conversations: []
                    }
                ),

            ensure() {

                if (
                    !this.data ||
                    typeof this.data !==
                    "object"
                ) {

                    this.data = {};

                }

                this.data.facts =
                    Array.isArray(
                        this.data.facts
                    )
                        ? this.data.facts
                        : [];

                this.data.preferences =
                    Array.isArray(
                        this.data.preferences
                    )
                        ? this.data.preferences
                        : [];

                this.data.conversations =
                    Array.isArray(
                        this.data.conversations
                    )
                        ? this.data.conversations
                        : [];

            },

            save() {

                this.ensure();

                return storageSet(
                    this.key,
                    this.data
                );

            },

            add(
                type,
                value
            ) {

                this.ensure();

                if (
                    !value
                ) {
                    return null;
                }

                if (
                    !Array.isArray(
                        this.data[type]
                    )
                ) {

                    this.data[type] =
                        [];

                }

                const item = {

                    id:
                        "memory-" +
                        Date.now() +
                        "-" +
                        Math.random()
                            .toString(36)
                            .slice(2),

                    value:
                        String(value),

                    createdAt:
                        new Date()
                            .toISOString()

                };

                this.data[type].push(
                    item
                );

                /*
                 * Speicher kontrolliert halten.
                 */
                if (
                    this.data[type]
                        .length > 500
                ) {

                    this.data[type] =
                        this.data[type]
                            .slice(-500);

                }

                this.save();

                HD.emit(
                    "ai:memory-added",
                    {
                        type,
                        item
                    }
                );

                return item;

            },

            get(type) {

                this.ensure();

                return [
                    ...(this.data[type] || [])
                ];

            },

            search(
                query,
                type = null
            ) {

                const text =
                    String(
                        query || ""
                    )
                    .trim()
                    .toLowerCase();

                if (!text) {
                    return [];
                }

                const groups =
                    type
                        ? [
                            {
                                type,
                                items:
                                    this.get(
                                        type
                                    )
                            }
                        ]
                        : Object.keys(
                            this.data
                        ).map(
                            key => ({
                                type: key,
                                items:
                                    this.get(
                                        key
                                    )
                            })
                        );

                const result = [];

                for (
                    const group
                    of groups
                ) {

                    for (
                        const item
                        of group.items
                    ) {

                        const value =
                            String(
                                item.value ||
                                ""
                            )
                            .toLowerCase();

                        if (
                            value.includes(
                                text
                            )
                        ) {

                            result.push({
                                ...item,
                                type:
                                    group.type
                            });

                        }

                    }

                }

                return result;

            },

            clear() {

                this.data = {

                    facts: [],

                    preferences: [],

                    conversations: []

                };

                this.save();

                HD.emit(
                    "ai:memory-cleared"
                );

                return true;

            },

            getStatus() {

                this.ensure();

                return {

                    facts:
                        this.data.facts.length,

                    preferences:
                        this.data.preferences.length,

                    conversations:
                        this.data
                            .conversations
                            .length

                };

            }

        };

    HD.aiMemory.ensure();

    /* ============================================================
       AI CONVERSATION
       ============================================================ */

    HD.aiConversation =
        HD.aiConversation || {

            key:
                "haldo-ai-conversation",

            messages:
                storageGet(
                    "haldo-ai-conversation",
                    []
                ),

            normalizeMessages() {

                if (
                    !Array.isArray(
                        this.messages
                    )
                ) {

                    this.messages = [];

                }

            },

            save() {

                this.normalizeMessages();

                return storageSet(
                    this.key,
                    this.messages
                );

            },

            add(
                role,
                content,
                meta = {}
            ) {

                this.normalizeMessages();

                const message = {

                    id:
                        "msg-" +
                        Date.now() +
                        "-" +
                        Math.random()
                            .toString(36)
                            .slice(2),

                    role:
                        String(
                            role ||
                            "assistant"
                        ),

                    content:
                        String(
                            content ??
                            ""
                        ),

                    timestamp:
                        new Date()
                            .toISOString(),

                    meta:
                        meta &&
                        typeof meta ===
                        "object"
                            ? meta
                            : {}

                };

                this.messages.push(
                    message
                );

                if (
                    this.messages.length >
                    500
                ) {

                    this.messages =
                        this.messages
                            .slice(-500);

                }

                this.save();

                HD.emit(
                    "ai:conversation-added",
                    message
                );

                return message;

            },

            all() {

                this.normalizeMessages();

                return [
                    ...this.messages
                ];

            },

            recent(
                count = 20
            ) {

                this.normalizeMessages();

                return this.messages
                    .slice(
                        -Math.max(
                            1,
                            Number(count) || 20
                        )
                    );

            },

            clear() {

                this.messages = [];

                this.save();

                HD.emit(
                    "ai:conversation-cleared"
                );

                return true;

            }

        };

    /* ============================================================
       COMMAND REGISTRY
       ============================================================ */

    HD.aiCommands =
        HD.aiCommands || {

            commands:
                HD.aiCommands?.commands ||
                new Map(),

            register(
                name,
                handler,
                options = {}
            ) {

                const id =
                    String(
                        name || ""
                    )
                    .trim()
                    .toLowerCase();

                if (
                    !id ||
                    typeof handler !==
                    "function"
                ) {

                    return false;

                }

                this.commands.set(
                    id,
                    {

                        id,

                        handler,

                        description:
                            options.description ||
                            "",

                        aliases:
                            Array.isArray(
                                options.aliases
                            )
                                ? options.aliases
                                : []

                    }
                );

                HD.emit(
                    "ai:command-registered",
                    {
                        id
                    }
                );

                return true;

            },

            unregister(name) {

                return this.commands.delete(
                    String(
                        name || ""
                    )
                    .trim()
                    .toLowerCase()
                );

            },

            get(name) {

                const id =
                    String(
                        name || ""
                    )
                    .trim()
                    .toLowerCase();

                if (
                    this.commands.has(id)
                ) {

                    return this.commands.get(
                        id
                    );

                }

                for (
                    const command
                    of this.commands.values()
                ) {

                    if (
                        command.aliases
                            .map(
                                alias =>
                                    String(
                                        alias
                                    )
                                    .toLowerCase()
                            )
                            .includes(id)
                    ) {

                        return command;

                    }

                }

                return null;

            },

            async execute(
                name,
                payload,
                context = {}
            ) {

                const command =
                    this.get(
                        name
                    );

                if (
                    !command
                ) {

                    return {

                        success:
                            false,

                        error:
                            "Command not found."

                    };

                }

                try {

                    const result =
                        await command.handler(
                            payload,
                            context
                        );

                    HD.emit(
                        "ai:command-executed",
                        {
                            command:
                                command.id,

                            result
                        }
                    );

                    return {

                        success:
                            true,

                        result

                    };

                } catch (error) {

                    HD.emit(
                        "ai:command-error",
                        {
                            command:
                                command.id,

                            error
                        }
                    );

                    return {

                        success:
                            false,

                        error

                    };

                }

            },

            list() {

                return Array.from(
                    this.commands.values()
                ).map(
                    command => ({
                        id:
                            command.id,

                        description:
                            command.description,

                        aliases:
                            [...command.aliases]

                    })
                );

            }

        };

    /*
     * Alte API-Kompatibilität.
     */
    HD.ai =
        HD.ai || {};

    HD.ai.addCommand =
        HD.ai.addCommand ||
        function (
            name,
            handler,
            options
        ) {

            return HD.aiCommands.register(
                name,
                handler,
                options
            );

        };

    /* ============================================================
       APP CONTROL BRIDGE
       ============================================================ */

    function findAppController() {

        const candidates = [

            HD.apps,

            HD.appManager,

            HD.runtime?.apps,

            HD.appSystem,

            HDA5.apps,

            HDA5.appManager

        ];

        for (
            const controller
            of candidates
        ) {

            if (
                controller &&
                (
                    typeof controller.open ===
                    "function" ||
                    typeof controller.launch ===
                    "function"
                )
            ) {

                return controller;

            }

        }

        return null;

    }

    async function openApp(
        appId,
        options = {}
    ) {

        const controller =
            findAppController();

        if (
            !controller
        ) {

            HD.emit(
                "ai:app-open-failed",
                {
                    appId,
                    reason:
                        "No app controller"
                }
            );

            return null;

        }

        try {

            if (
                typeof controller.open ===
                "function"
            ) {

                return await controller.open(
                    appId,
                    options
                );

            }

            if (
                typeof controller.launch ===
                "function"
            ) {

                return await controller.launch(
                    appId,
                    options
                );

            }

        } catch (error) {

            HD.emit(
                "ai:app-open-error",
                {
                    appId,
                    error
                }
            );

        }

        return null;

    }

    function closeApp(
        appId
    ) {

        const controller =
            findAppController();

        if (
            controller &&
            typeof controller.close ===
            "function"
        ) {

            try {

                return controller.close(
                    appId
                );

            } catch {}

        }

        return null;

    }

    /* ============================================================
       WINDOW BRIDGE
       ============================================================ */

    function getWindowManager() {

        return (
            HD.windowManager ||
            HDA5.windowManager ||
            HD.runtime?.windowManager ||
            null
        );

    }

    function focusWindow(
        windowId
    ) {

        const manager =
            getWindowManager();

        if (
            manager &&
            typeof manager.focus ===
            "function"
        ) {

            try {

                return manager.focus(
                    windowId
                );

            } catch {}

        }

        return null;

    }

    /* ============================================================
       SYSTEM BRIDGE
       ============================================================ */

    async function systemStatus() {

        if (
            HD.systemAPI?.getSystemStatus
        ) {

            return HD.systemAPI
                .getSystemStatus();

        }

        if (
            HD.os?.getStatus
        ) {

            return HD.os.getStatus();

        }

        return {

            name:
                "HalDo AI OS",

            version:
                "20.0.0",

            ready:
                true

        };

    }

    /* ============================================================
       INTENT DETECTION
       ============================================================ */

    function normalize(
        text
    ) {

        return String(
            text || ""
        )
        .trim();

    }

    function detectIntent(
        text
    ) {

        const value =
            normalize(
                text
            )
            .toLowerCase();

        if (!value) {

            return "empty";

        }

        if (
            /^(hi|hallo|hey|hello|moin|guten)\b/
                .test(value)
        ) {

            return "greeting";

        }

        if (
            /\b(zeit|uhrzeit|wie spät|clock)\b/
                .test(value)
        ) {

            return "clock";

        }

        if (
            /\b(kalender|termin|termine|calendar)\b/
                .test(value)
        ) {

            return "calendar";

        }

        if (
            /\b(notiz|notizen|note|notes)\b/
                .test(value)
        ) {

            return "notes";

        }

        if (
            /\b(aufgabe|aufgaben|task|tasks|todo)\b/
                .test(value)
        ) {

            return "tasks";

        }

        if (
            /\b(einstellungen|einstellung|settings)\b/
                .test(value)
        ) {

            return "settings";

        }

        if (
            /\b(rechner|rechnen|rechnung|calculator)\b/
                .test(value)
        ) {

            return "calculator";

        }

        if (
            /\b(schreib|schreiben|text|brief|writing)\b/
                .test(value)
        ) {

            return "writing";

        }

        if (
            /\b(übersetz|übersetzen|translation|translate)\b/
                .test(value)
        ) {

            return "translation";

        }

        if (
            /\b(systemstatus|system status|status|system)\b/
                .test(value)
        ) {

            return "system";

        }

        if (
            /\b(backup|sicherung)\b/
                .test(value)
        ) {

            return "backup";

        }

        if (
            /\b(app|apps|anwendung|öffne|öffnen|starte|starten)\b/
                .test(value)
        ) {

            return "app-control";

        }

        if (
            /\b(sonne|solar|sun)\b/
                .test(value)
        ) {

            return "cosmic-sun";

        }

        if (
            /\b(logo|haldo logo)\b/
                .test(value)
        ) {

            return "cosmic-logo";

        }

        if (
            /\b(planet|planeten|orbit|kosmos|cosmic)\b/
                .test(value)
        ) {

            return "cosmic";

        }

        if (
            /\b(danke|dankeschön|wie geht|alles gut)\b/
                .test(value)
        ) {

            return "smalltalk";

        }

        return "conversation";

    }

    /* ============================================================
       LOCAL RESPONSE ENGINE
       ============================================================ */

    async function localResponse(
        text,
        intent
    ) {

        const language =
            HD.aiLanguage?.current ||
            HD.language?.current ||
            "de";

        switch (
            intent
        ) {

            case "empty":

                return {

                    text:
                        "Ich bin da. Schreib mir einfach, was du möchtest.",

                    intent

                };

            case "greeting":

                return {

                    text:
                        language === "en"
                            ? "Hello! ❤️ I am HalDo AI. What would you like us to do today?"
                            : language === "fr"
                                ? "Bonjour ! ❤️ Je suis HalDo AI. Que souhaitez-vous faire aujourd'hui ?"
                                : "Hallo! ❤️ Ich bin HalDo AI. Schön, dass du da bist. Was möchtest du heute gemeinsam machen?",

                    intent

                };

            case "smalltalk":

                return {

                    text:
                        "Danke, dass du fragst. Ich bin bereit und aufmerksam. Erzähl mir, was gerade wichtig für dich ist.",

                    intent

                };

            case "calendar":

                return {

                    text:
                        "Ich kann deinen HalDo-Kalender öffnen und Termine verwalten.",

                    intent,

                    action:
                        "calendar"

                };

            case "notes":

                return {

                    text:
                        "Ich kann deine Notizen öffnen, erstellen und speichern.",

                    intent,

                    action:
                        "notes"

                };

            case "tasks":

                return {

                    text:
                        "Ich kann deine Aufgabenverwaltung öffnen und Aufgaben speichern.",

                    intent,

                    action:
                        "tasks"

                };

            case "settings":

                return {

                    text:
                        "Ich öffne die HalDo-Einstellungen für dich.",

                    intent,

                    action:
                        "settings"

                };

            case "clock":

                return {

                    text:
                        `Die aktuelle Zeit ist ${new Date().toLocaleTimeString()}.`,

                    intent,

                    action:
                        "clock"

                };

            case "calculator":

                return {

                    text:
                        "Der HalDo-Rechner steht bereit.",

                    intent,

                    action:
                        "calculator"

                };

            case "writing":

                return {

                    text:
                        "Natürlich. Sag mir Thema, Stil und Länge. Ich kann daraus einen strukturierten Text erstellen.",

                    intent

                };

            case "translation":

                return {

                    text:
                        "Gerne. Schreibe den Text und nenne mir die gewünschte Zielsprache.",

                    intent

                };

            case "system":

                return {

                    text:
                        "Ich prüfe den aktuellen Zustand von HalDo AI OS.",

                    intent,

                    data:
                        await systemStatus()

                };

            case "backup":

                return {

                    text:
                        "Die Backup-Funktion ist mit dem HalDo-System verbunden.",

                    intent,

                    action:
                        "backup"

                };

            case "cosmic-sun":

                return {

                    text:
                        "Ich öffne HalDo AI über das Cosmic-Sonnen-System.",

                    intent,

                    action:
                        "ai",

                    source:
                        "cosmic-sun"

                };

            case "cosmic-logo":

                return {

                    text:
                        "Ich öffne HalDo AI über das HalDo-Logo.",

                    intent,

                    action:
                        "ai",

                    source:
                        "cosmic-logo"

                };

            case "cosmic":

                return {

                    text:
                        "Die HalDo Cosmic World ist aktiv.",

                    intent

                };

            case "app-control":

                return {

                    text:
                        "Ich kann Apps über das HalDo-App-System öffnen und steuern.",

                    intent

                };

            default:

                return {

                    text:
                        "Ich habe deine Nachricht verstanden. Die lokale HalDo-AI-Schicht ist aktiv. Für externe KI-Inferenz kann ein AI-Service über den vorgesehenen Provider angeschlossen werden.",

                    intent

                };

        }

    }

    /* ============================================================
       AI CORE
       ============================================================ */

    HD.aiCore =
        HD.aiCore || {

            status:
                "ready",

            name:
                "HalDo AI",

            version:
                "20.0.0",

            capabilities: [

                "conversation",

                "writing",

                "reasoning",

                "summarization",

                "translation",

                "planning",

                "system-control",

                "app-control",

                "memory",

                "voice",

                "speech",

                "commands",

                "storage",

                "cosmic-control"

            ],

            provider:
                null,

            initialized:
                false,

            setStatus(
                status
            ) {

                this.status =
                    status;

                HD.emit(
                    "ai:status",
                    {
                        status
                    }
                );

            },

            normalize,

            detectIntent,

            getMemory() {

                return HD.aiMemory;

            },

            getConversation() {

                return HD.aiConversation;

            },

            registerProvider(
                provider
            ) {

                if (
                    typeof provider ===
                    "function"
                ) {

                    this.provider =
                        provider;

                    HD.emit(
                        "ai:provider-connected"
                    );

                    return true;

                }

                if (
                    provider &&
                    typeof provider.ask ===
                    "function"
                ) {

                    this.provider =
                        provider.ask.bind(
                            provider
                        );

                    HD.emit(
                        "ai:provider-connected"
                    );

                    return true;

                }

                return false;

            },

            removeProvider() {

                this.provider =
                    null;

                HD.emit(
                    "ai:provider-disconnected"
                );

            },

            async ask(
                text,
                options = {}
            ) {

                const input =
                    normalize(
                        text
                    );

                if (!input) {

                    return localResponse(
                        "",
                        "empty"
                    );

                }

                this.setStatus(
                    "thinking"
                );

                HD.aiConversation.add(
                    "user",
                    input
                );

                const intent =
                    detectIntent(
                        input
                    );

                HD.emit(
                    "ai:intent",
                    {
                        text:
                            input,

                        intent
                    }
                );

                let response;

                /*
                 * Externe AI zuerst nur dann,
                 * wenn ausdrücklich gewünscht
                 * oder ein Provider verfügbar ist.
                 */
                if (
                    this.provider &&
                    options.localOnly !== true
                ) {

                    try {

                        response =
                            await this.provider(
                                input,
                                {
                                    intent,

                                    memory:
                                        HD.aiMemory
                                            .getStatus(),

                                    conversation:
                                        HD.aiConversation
                                            .recent(30),

                                    options

                                }
                            );

                        /*
                         * Provider darf String oder
                         * Response-Objekt zurückgeben.
                         */
                        if (
                            typeof response ===
                            "string"
                        ) {

                            response = {

                                text:
                                    response,

                                intent

                            };

                        }

                    } catch (error) {

                        HD.emit(
                            "ai:provider-error",
                            {
                                error
                            }
                        );

                        response =
                            await localResponse(
                                input,
                                intent
                            );

                    }

                } else {

                    response =
                        await localResponse(
                            input,
                            intent
                        );

                }

                response =
                    response || {

                        text:
                            "Ich konnte gerade keine Antwort erzeugen.",

                        intent

                    };

                if (
                    response.action
                ) {

                    setTimeout(
                        async () => {

                            try {

                                await openApp(
                                    response.action,
                                    {
                                        source:
                                            response.source ||
                                            "ai"
                                    }
                                );

                            } catch {}

                        },
                        120
                    );

                }

                HD.aiConversation.add(
                    "assistant",
                    response.text,
                    {
                        intent:
                            response.intent ||
                            intent,

                        action:
                            response.action ||
                            null
                    }
                );

                HD.aiMemory.add(
                    "conversations",
                    response.text
                );

                this.setStatus(
                    "ready"
                );

                HD.emit(
                    "ai:response",
                    response
                );

                return response;

            },

            async openWindow(
                options = {}
            ) {

                /*
                 * Primär das neue V20-System.
                 */
                const v20Candidates = [

                    HD.appRuntime,

                    HD.appManager,

                    HD.apps,

                    HDA5.appManager

                ];

                for (
                    const manager
                    of v20Candidates
                ) {

                    if (
                        !manager
                    ) {
                        continue;
                    }

                    try {

                        if (
                            typeof manager.open ===
                            "function"
                        ) {

                            const result =
                                await manager.open(
                                    "ai",
                                    options
                                );

                            if (
                                result
                            ) {

                                return result;

                            }

                        }

                    } catch {}

                }

                /*
                 * Bestehende AI-App als Fallback.
                 */
                if (
                    HD.apps?.ai?.open
                ) {

                    return HD.apps.ai.open(
                        options
                    );

                }

                if (
                    HDA5.apps?.ai?.open
                ) {

                    return HDA5.apps.ai.open(
                        options
                    );

                }

                return null;

            },

            closeWindow() {

                const manager =
                    getWindowManager();

                if (
                    manager?.close
                ) {

                    try {

                        return manager.close(
                            "app-ai"
                        );

                    } catch {}

                }

                return null;

            },

            focusWindow() {

                return focusWindow(
                    "app-ai"
                );

            },

            getStatus() {

                return {

                    name:
                        this.name,

                    version:
                        this.version,

                    status:
                        this.status,

                    initialized:
                        this.initialized,

                    provider:
                        Boolean(
                            this.provider
                        ),

                    capabilities:
                        [
                            ...this.capabilities
                        ],

                    memory:
                        HD.aiMemory
                            .getStatus(),

                    conversation:
                        HD.aiConversation
                            .messages
                            .length,

                    commands:
                        HD.aiCommands
                            .commands
                            .size

                };

            }

        };

    /* ============================================================
       COMMANDS
       ============================================================ */

    HD.aiCommands.register(
        "system",
        async function () {

            return systemStatus();

        },
        {
            description:
                "Zeigt den HalDo-Systemstatus."
        }
    );

    HD.aiCommands.register(
        "open-ai",
        async function () {

            return HD.aiCore
                .openWindow();

        },
        {
            description:
                "Öffnet das HalDo AI Fenster.",
            aliases: [
                "ai",
                "haldo-ai"
            ]
        }
    );

    HD.aiCommands.register(
        "close-ai",
        async function () {

            return HD.aiCore
                .closeWindow();

        },
        {
            description:
                "Schließt das HalDo AI Fenster."
        }
    );

    HD.aiCommands.register(
        "memory",
        function (
            payload
        ) {

            if (
                payload?.clear
            ) {

                return HD.aiMemory
                    .clear();

            }

            return HD.aiMemory
                .getStatus();

        },
        {
            description:
                "Verwaltet den AI-Speicher."
        }
    );

    HD.aiCommands.register(
        "backup",
        async function () {

            if (
                HD.backup?.create
            ) {

                return HD.backup
                    .create();

            }

            return {

                success:
                    false,

                error:
                    "Backup-System nicht verfügbar."

            };

        },
        {
            description:
                "Erstellt ein HalDo-Systembackup."
        }
    );

    /* ============================================================
       LEGACY AI API
       ============================================================ */

    HD.ai.status =
        HD.aiCore.status;

    HD.ai.version =
        HD.aiCore.version;

    HD.ai.ask =
        function (
            text,
            options
        ) {

            return HD.aiCore.ask(
                text,
                options
            );

        };

    HD.ai.openWindow =
        function (
            options
        ) {

            return HD.aiCore.openWindow(
                options
            );

        };

    HD.ai.getStatus =
        function () {

            return HD.aiCore.getStatus();

        };

    HD.ai.registerProvider =
        function (
            provider
        ) {

            return HD.aiCore
                .registerProvider(
                    provider
                );

        };

    /* ============================================================
       COSMIC → AI CONNECTION
       ============================================================ */

    HD.on(
        "cosmic:sun:activate",
        function () {

            HD.aiCore.openWindow({

                source:
                    "cosmic-sun"

            });

        }
    );

    HD.on(
        "cosmic:logo:activate",
        function () {

            HD.aiCore.openWindow({

                source:
                    "cosmic-logo"

            });

        }
    );

    /* ============================================================
       SYSTEM → AI CONNECTION
       ============================================================ */

    HD.on(
        "system:ready",
        function () {

            HD.aiCore.initialized =
                true;

            HD.aiCore.setStatus(
                "ready"
            );

            HD.emit(
                "ai:ready",
                HD.aiCore.getStatus()
            );

        }
    );

    /* ============================================================
       INITIALIZATION
       ============================================================ */

    HD.aiCore.initialized =
        true;

    HD.aiCore.setStatus(
        "ready"
    );

    HD.emit(
        "ai:core-ready",
        {
            version:
                HD.aiCore.version,

            capabilities:
                HD.aiCore.capabilities
        }
    );

    console.info(
        "✦ HalDo AI Core 20.0.0 bereit."
    );

})();
