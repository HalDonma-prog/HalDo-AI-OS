// ==========================================================
// HALDO AI OS 18
// SYSTEM LOADER
// Version 18.0.0
// Professional Ultimate Foundation
//
// Aufgabe:
// - Zentrale Verwaltung aller HalDo-JavaScript-Module
// - Kontrolliertes Laden der Systemdateien
// - Verhindert doppelte Script-Ladungen
// - Reihenfolge und Abhängigkeiten berücksichtigen
// - Fehler einzelner Module isolieren
// - Verbindung zu Kernel / System / Router vorbereiten
// - Events für Startup und Diagnose bereitstellen
// - Vorbereitung für zukünftige Erweiterungen
//
// WICHTIG:
// Bestehende Dateien und globale APIs werden nicht ersetzt.
// Der Loader erkennt bereits geladene Module und lädt diese
// nicht unnötig ein zweites Mal.
// ==========================================================

(function (window, document) {

    "use strict";

    // ======================================================
    // CONFIG
    // ======================================================

    const LOADER_VERSION = "18.0.0";

    const LOADER_NAME =
        "HalDo AI OS System Loader";

    const BASE_PATH = "js/";

    const DEFAULT_TIMEOUT = 15000;

    // ======================================================
    // GLOBAL HALDO OBJECT
    // ======================================================

    window.HalDoOS =
        window.HalDoOS || {};

    // ======================================================
    // INTERNAL STATE
    // ======================================================

    const state = {

        initialized: false,

        loading: false,

        ready: false,

        failed: false,

        currentFile: null,

        startedAt: null,

        finishedAt: null,

        loaded: [],

        failedFiles: [],

        skipped: [],

        pending: [],

        progress: 0

    };

    // ======================================================
    // EVENTS
    // ======================================================

    const listeners = {};

    function on(
        eventName,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {
            return function () {};
        }

        if (
            !listeners[eventName]
        ) {

            listeners[eventName] = [];

        }

        listeners[eventName].push(
            callback
        );

        return function () {

            off(
                eventName,
                callback
            );

        };

    }

    function off(
        eventName,
        callback
    ) {

        if (
            !listeners[eventName]
        ) {
            return;
        }

        listeners[eventName] =
            listeners[eventName].filter(
                function (item) {

                    return item !==
                        callback;

                }
            );

    }

    function emit(
        eventName,
        data
    ) {

        if (
            listeners[eventName]
        ) {

            listeners[eventName].forEach(
                function (callback) {

                    try {

                        callback(data);

                    } catch (eventError) {

                        console.error(
                            "[HalDo Loader] Event error:",
                            eventError
                        );

                    }

                }
            );

        }

        // Zusätzlich an HalDoOS Event-System
        // weitergeben, wenn vorhanden.

        if (
            window.HalDoOS &&
            window.HalDoOS.events &&
            typeof
            window.HalDoOS.events.emit ===
            "function"
        ) {

            try {

                window.HalDoOS.events.emit(
                    eventName,
                    data
                );

            } catch (error) {

                // Das interne Event-System
                // darf den Loader nicht stoppen.

            }

        }

    }

    // ======================================================
    // LOGGING
    // ======================================================

    function log() {

        console.log(
            "[HalDo System Loader]",
            ...arguments
        );

    }

    function warn() {

        console.warn(
            "[HalDo System Loader]",
            ...arguments
        );

    }

    function reportError() {

        console.error(
            "[HalDo System Loader]",
            ...arguments
        );

    }

    // ======================================================
    // FILE DEFINITIONS
    //
    // Reihenfolge:
    //
    // 1. Foundation
    // 2. Storage / Configuration
    // 3. Kernel / System
    // 4. App-System
    // 5. AI-System
    // 6. Language / Voice
    // 7. UI / Launcher
    // 8. Startup
    //
    // Bereits über index.html oder andere Loader
    // geladene Dateien werden erkannt.
    // ======================================================

    const MODULES = [

        // --------------------------------------------------
        // FOUNDATION
        // --------------------------------------------------

        {
            id: "storage",
            file: "storage.js",
            group: "foundation",
            required: false
        },

        {
            id: "storage-manager",
            file: "storage-manager.js",
            group: "foundation",
            required: false
        },

        {
            id: "config-manager",
            file: "config-manager.js",
            group: "foundation",
            required: false
        },

        {
            id: "module-manager",
            file: "module-manager.js",
            group: "foundation",
            required: false
        },

        // --------------------------------------------------
        // KERNEL / SYSTEM
        // --------------------------------------------------

        {
            id: "kernel",
            file: "kernel.js",
            group: "system",
            required: true
        },

        {
            id: "system",
            file: "system.js",
            group: "system",
            required: true
        },

        {
            id: "system-status",
            file: "system-status.js",
            group: "system",
            required: false
        },

        // --------------------------------------------------
        // APP SYSTEM
        // --------------------------------------------------

        {
            id: "app-registry",
            file: "app-registry.js",
            group: "apps",
            required: false
        },

        {
            id: "app-manager",
            file: "app-manager.js",
            group: "apps",
            required: false
        },

        {
            id: "app-router",
            file: "app-router.js",
            group: "apps",
            required: false
        },

        {
            id: "app-launcher",
            file: "app-launcher.js",
            group: "apps",
            required: false
        },

        // --------------------------------------------------
        // AI CORE
        // --------------------------------------------------

        {
            id: "ai-core",
            file: "ai-core.js",
            group: "ai",
            required: false
        },

        {
            id: "ai-engine",
            file: "ai-engine.js",
            group: "ai",
            required: false
        },

        {
            id: "ai-language",
            file: "ai-language.js",
            group: "ai",
            required: false
        },

        {
            id: "ai-memory",
            file: "ai-memory.js",
            group: "ai",
            required: false
        },

        {
            id: "ai-chat",
            file: "ai-chat.js",
            group: "ai",
            required: false
        },

        // --------------------------------------------------
        // CONVERSATION
        // --------------------------------------------------

        {
            id: "conversation-state",
            file: "conversation-state.js",
            group: "conversation",
            required: false
        },

        // --------------------------------------------------
        // LANGUAGE
        // --------------------------------------------------

        {
            id: "language-system",
            file: "language-system.js",
            group: "language",
            required: false
        },

        {
            id: "language-manager",
            file: "language-manager.js",
            group: "language",
            required: false
        },

        // --------------------------------------------------
        // VOICE
        // --------------------------------------------------

        {
            id: "voice",
            file: "voice.js",
            group: "voice",
            required: false
        },

        {
            id: "ai-speech",
            file: "ai-speech.js",
            group: "voice",
            required: false
        },

        {
            id: "ai-voice",
            file: "ai-voice.js",
            group: "voice",
            required: false
        },

        // --------------------------------------------------
        // ÊZÎDÎ KEYBOARD
        // --------------------------------------------------

        {
            id: "ezidi-keyboard",
            file: "ezidi-keyboard.js",
            group: "keyboard",
            required: false
        },

        // --------------------------------------------------
        // WINDOW / DESKTOP
        // --------------------------------------------------

        {
            id: "window-manager",
            file: "window-manager.js",
            group: "ui",
            required: false
        },

        {
            id: "desktop-manager",
            file: "desktop manager.js",
            group: "ui",
            required: false
        },

        // --------------------------------------------------
        // SHELL / LAUNCHER
        // --------------------------------------------------

        {
            id: "shell-manager",
            file: "shell-manager.js",
            group: "ui",
            required: false
        },

        {
            id: "launcher",
            file: "launcher.js",
            group: "ui",
            required: false
        },

        // --------------------------------------------------
        // LOGO / LIGHT SYSTEM
        // --------------------------------------------------

        {
            id: "haldo-light-system",
            file: "haldo-light-system.js",
            group: "visual",
            required: false
        },

        {
            id: "logo-animation-manager",
            file: "logo-animation-manager.js",
            group: "visual",
            required: false
        },

        {
            id: "logo-intro-manager",
            file: "logo-intro-manager.js",
            group: "visual",
            required: false
        },

        // --------------------------------------------------
        // BOOT / STARTUP
        // --------------------------------------------------

        {
            id: "boot",
            file: "boot.js",
            group: "startup",
            required: false
        },

        {
            id: "system-loader",
            file: "system-loader.js",
            group: "startup",
            required: false
        },

        {
            id: "startup",
            file: "startup.js",
            group: "startup",
            required: false
        }

    ];

    // ======================================================
    // MODULE MAP
    // ======================================================

    const moduleMap =
        new Map();

    MODULES.forEach(
        function (module) {

            moduleMap.set(
                module.id,
                module
            );

        }
    );

    // ======================================================
    // SCRIPT DETECTION
    //
    // Prüft, ob eine Datei bereits im DOM geladen
    // oder als Script vorhanden ist.
    // ======================================================

    function normalizeFileName(
        file
    ) {

        return String(
            file || ""
        )
            .split("/")
            .pop()
            .toLowerCase();

    }

    function isScriptAlreadyPresent(
        file
    ) {

        const target =
            normalizeFileName(
                file
            );

        const scripts =
            Array.from(
                document.scripts
            );

        return scripts.some(
            function (script) {

                const src =
                    script.getAttribute(
                        "src"
                    );

                if (!src) {
                    return false;
                }

                return (
                    normalizeFileName(
                        src
                    ) === target
                );

            }
        );

    }

    // ======================================================
    // GLOBAL MODULE DETECTION
    //
    // Falls ein vorhandenes Modul seine API bereits
    // registriert hat, betrachten wir es als geladen.
    // ======================================================

    const GLOBAL_APIS = {

        "storage":
            [
                "HalDoStorage"
            ],

        "storage-manager":
            [
                "HalDoStorageManager"
            ],

        "config-manager":
            [
                "HalDoConfigManager"
            ],

        "module-manager":
            [
                "HalDoModuleManager"
            ],

        "kernel":
            [
                "HalDoKernel"
            ],

        "system":
            [
                "HalDoSystem"
            ],

        "system-status":
            [
                "HalDoSystemStatus"
            ],

        "app-registry":
            [
                "HalDoAppRegistry"
            ],

        "app-manager":
            [
                "HalDoAppManager"
            ],

        "app-router":
            [
                "HalDoAppRouter"
            ],

        "app-launcher":
            [
                "HalDoAppLauncher"
            ],

        "ai-core":
            [
                "HalDoAICore"
            ],

        "ai-engine":
            [
                "HalDoAIEngine"
            ],

        "ai-language":
            [
                "HalDoAILanguage"
            ],

        "ai-memory":
            [
                "HalDoAIMemory"
            ],

        "ai-chat":
            [
                "HalDoAIChat"
            ],

        "conversation-state":
            [
                "HalDoConversationState"
            ],

        "language-system":
            [
                "HalDoLanguageSystem"
            ],

        "language-manager":
            [
                "HalDoLanguageManager"
            ],

        "voice":
            [
                "HalDoVoice"
            ],

        "ai-speech":
            [
                "HalDoAISpeech"
            ],

        "ai-voice":
            [
                "HalDoAIVoice"
            ],

        "ezidi-keyboard":
            [
                "HalDoEzidiKeyboard"
            ],

        "window-manager":
            [
                "HalDoWindowManager"
            ],

        "desktop-manager":
            [
                "HalDoDesktopManager"
            ],

        "shell-manager":
            [
                "HalDoShellManager"
            ],

        "launcher":
            [
                "HalDoLauncher"
            ],

        "haldo-light-system":
            [
                "HalDoLightSystem"
            ],

        "logo-animation-manager":
            [
                "HalDoLogoAnimationManager"
            ],

        "logo-intro-manager":
            [
                "HalDoLogoIntroManager"
            ],

        "boot":
            [
                "HalDoBoot"
            ],

        "startup":
            [
                "HalDoStartup"
            ]

    };

    function hasGlobalAPI(
        moduleId
    ) {

        const globals =
            GLOBAL_APIS[
                moduleId
            ];

        if (!globals) {
            return false;
        }

        return globals.some(
            function (globalName) {

                return (
                    window[
                        globalName
                    ] !== undefined
                );

            }
        );

    }

    // ======================================================
    // SCRIPT PATH
    // ======================================================

    function getScriptPath(
        file
    ) {

        return (
            BASE_PATH +
            file
        );

    }

    // ======================================================
    // WAIT
    // ======================================================

    function wait(
        milliseconds
    ) {

        return new Promise(
            function (resolve) {

                window.setTimeout(
                    resolve,
                    milliseconds
                );

            }
        );

    }

    // ======================================================
    // LOAD SCRIPT
    // ======================================================

    function loadScript(
        module
    ) {

        return new Promise(
            function (
                resolve,
                reject
            ) {

                const file =
                    module.file;

                const path =
                    getScriptPath(
                        file
                    );

                // ------------------------------------------
                // Bereits vorhandenes Script
                // ------------------------------------------

                if (
                    isScriptAlreadyPresent(
                        file
                    )
                ) {

                    state.skipped.push(
                        module.id
                    );

                    emit(
                        "loader:skip",
                        {
                            module:
                                module,

                            reason:
                                "script-already-present"
                        }
                    );

                    resolve({
                        module:
                            module,

                        status:
                            "skipped"

                    });

                    return;

                }

                // ------------------------------------------
                // Bereits vorhandene globale API
                // ------------------------------------------

                if (
                    hasGlobalAPI(
                        module.id
                    )
                ) {

                    state.skipped.push(
                        module.id
                    );

                    emit(
                        "loader:skip",
                        {
                            module:
                                module,

                            reason:
                                "global-api-already-present"
                        }
                    );

                    resolve({
                        module:
                            module,

                        status:
                            "already-ready"

                    });

                    return;

                }

                // ------------------------------------------
                // Script Element
                // ------------------------------------------

                const script =
                    document.createElement(
                        "script"
                    );

                script.src =
                    path;

                script.async =
                    false;

                script.defer =
                    false;

                script.dataset.haldoModule =
                    module.id;

                script.dataset.haldoLoader =
                    "system-loader";

                let timeoutId =
                    null;

                let settled =
                    false;

                function cleanup() {

                    if (
                        timeoutId
                    ) {

                        window.clearTimeout(
                            timeoutId
                        );

                    }

                }

                function success() {

                    if (settled) {
                        return;
                    }

                    settled =
                        true;

                    cleanup();

                    state.loaded.push(
                        module.id
                    );

                    emit(
                        "loader:loaded",
                        {
                            module:
                                module,

                            index:
                                state.loaded.length,

                            total:
                                MODULES.length

                        }
                    );

                    resolve({
                        module:
                            module,

                        status:
                            "loaded"

                    });

                }

                function failure(
                    reason
                ) {

                    if (settled) {
                        return;
                    }

                    settled =
                        true;

                    cleanup();

                    state.failedFiles.push(
                        module.id
                    );

                    emit(
                        "loader:error",
                        {
                            module:
                                module,

                            error:
                                reason

                        }
                    );

                    reject(
                        reason
                    );

                }

                script.onload =
                    function () {

                        success();

                    };

                script.onerror =
                    function () {

                        failure(
                            new Error(
                                "Script konnte nicht geladen werden: " +
                                path
                            )
                        );

                    };

                timeoutId =
                    window.setTimeout(
                        function () {

                            failure(
                                new Error(
                                    "Timeout beim Laden von: " +
                                    path
                                )
                            );

                        },
                        module.timeout ||
                        DEFAULT_TIMEOUT
                    );

                state.currentFile =
                    module.id;

                emit(
                    "loader:loading",
                    {
                        module:
                            module,

                        file:
                            file,

                        path:
                            path

                    }
                );

                document.head.appendChild(
                    script
                );

            }
        );

    }

    // ======================================================
    // LOAD SINGLE MODULE
    // ======================================================

    async function loadModule(
        moduleId
    ) {

        const module =
            moduleMap.get(
                moduleId
            );

        if (!module) {

            throw new Error(
                "Unbekanntes HalDo-Modul: " +
                moduleId
            );

        }

        state.pending.push(
            module.id
        );

        try {

            const result =
                await loadScript(
                    module
                );

            return result;

        } catch (loadError) {

            if (
                module.required
            ) {

                throw loadError;

            }

            warn(
                "Optionales Modul konnte nicht geladen werden:",
                module.id,
                loadError
            );

            return {

                module:
                    module,

                status:
                    "failed-optional",

                error:
                    loadError

            };

        } finally {

            state.pending =
                state.pending.filter(
                    function (id) {

                        return id !==
                            module.id;

                    }
                );

        }

    }

    // ======================================================
    // LOAD GROUP
    // ======================================================

    async function loadGroup(
        group
    ) {

        const modules =
            MODULES.filter(
                function (module) {

                    return module.group ===
                        group;

                }
            );

        const results = [];

        for (
            const module of modules
        ) {

            try {

                const result =
                    await loadModule(
                        module.id
                    );

                results.push(
                    result
                );

            } catch (error) {

                results.push({

                    module:
                        module,

                    status:
                        "failed",

                    error:
                        error

                });

                if (
                    module.required
                ) {

                    throw error;

                }

            }

        }

        return results;

    }

    // ======================================================
    // LOAD ALL MODULES
    // ======================================================

    async function loadAll(
        options
    ) {

        const config =
            options || {};

        if (
            state.loading
        ) {

            warn(
                "System Loader läuft bereits."
            );

            return getState();

        }

        if (
            state.ready &&
            !config.force
        ) {

            return getState();

        }

        state.loading =
            true;

        state.failed =
            false;

        state.startedAt =
            Date.now();

        state.finishedAt =
            null;

        state.loaded =
            [];

        state.failedFiles =
            [];

        state.skipped =
            [];

        state.pending =
            [];

        state.progress =
            0;

        emit(
            "loader:start",
            {
                version:
                    LOADER_VERSION,

                total:
                    MODULES.length
            }
        );

        log(
            "HalDo System Loader startet."
        );

        try {

            for (
                let i = 0;
                i < MODULES.length;
                i++
            ) {

                const module =
                    MODULES[i];

                state.progress =
                    Math.round(
                        (
                            i /
                            MODULES.length
                        ) * 100
                    );

                emit(
                    "loader:progress",
                    {
                        module:
                            module,

                        index:
                            i,

                        total:
                            MODULES.length,

                        progress:
                            state.progress
                    }
                );

                try {

                    await loadModule(
                        module.id
                    );

                } catch (moduleError) {

                    state.failed =
                        true;

                    reportError(
                        "Fehler beim Laden:",
                        module.id,
                        moduleError
                    );

                    emit(
                        "loader:module-error",
                        {
                            module:
                                module,

                            error:
                                moduleError
                        }
                    );

                    if (
                        module.required
                    ) {

                        throw moduleError;

                    }

                }

                // Kleine Pause ermöglicht anderen
                // Systemen, ihre Initialisierung sauber
                // auszuführen.

                if (
                    config.delayBetweenModules
                ) {

                    await wait(
                        config.delayBetweenModules
                    );

                }

            }

            state.progress =
                100;

            state.ready =
                true;

            state.finishedAt =
                Date.now();

            emit(
                "loader:ready",
                getState()
            );

            log(
                "HalDo System Loader ist bereit."
            );

            return getState();

        } catch (fatalError) {

            state.failed =
                true;

            state.ready =
                false;

            state.finishedAt =
                Date.now();

            emit(
                "loader:fatal-error",
                {
                    error:
                        fatalError,

                    state:
                        getState()
                }
            );

            reportError(
                "Kritischer Loader-Fehler:",
                fatalError
            );

            throw fatalError;

        } finally {

            state.loading =
                false;

            state.currentFile =
                null;

        }

    }

    // ======================================================
    // LOAD CORE ONLY
    //
    // Für Startup-Systeme, die zunächst nur die
    // Grundarchitektur benötigen.
    // ======================================================

    async function loadCore() {

        const coreModules = [
            "storage",
            "storage-manager",
            "config-manager",
            "module-manager",
            "kernel",
            "system",
            "system-status",
            "app-registry",
            "app-manager",
            "app-router"
        ];

        const results = [];

        for (
            const moduleId of coreModules
        ) {

            try {

                results.push(
                    await loadModule(
                        moduleId
                    )
                );

            } catch (error) {

                results.push({

                    module:
                        moduleId,

                    status:
                        "failed",

                    error:
                        error

                });

                const module =
                    moduleMap.get(
                        moduleId
                    );

                if (
                    module &&
                    module.required
                ) {

                    throw error;

                }

            }

        }

        emit(
            "loader:core-ready",
            results
        );

        return results;

    }

    // ======================================================
    // LOAD AI SYSTEM
    // ======================================================

    async function loadAI() {

        const modules = [
            "ai-core",
            "ai-engine",
            "ai-language",
            "ai-memory",
            "conversation-state",
            "ai-chat"
        ];

        const results = [];

        for (
            const moduleId of modules
        ) {

            try {

                results.push(
                    await loadModule(
                        moduleId
                    )
                );

            } catch (error) {

                results.push({

                    module:
                        moduleId,

                    status:
                        "failed",

                    error:
                        error

                });

            }

        }

        emit(
            "loader:ai-ready",
            results
        );

        return results;

    }

    // ======================================================
    // LOAD LANGUAGE / VOICE
    // ======================================================

    async function loadLanguageAndVoice() {

        const modules = [
            "language-system",
            "language-manager",
            "voice",
            "ai-speech",
            "ai-voice",
            "ezidi-keyboard"
        ];

        const results = [];

        for (
            const moduleId of modules
        ) {

            try {

                results.push(
                    await loadModule(
                        moduleId
                    )
                );

            } catch (error) {

                results.push({

                    module:
                        moduleId,

                    status:
                        "failed",

                    error:
                        error

                });

            }

        }

        emit(
            "loader:language-voice-ready",
            results
        );

        return results;

    }

    // ======================================================
    // LOAD UI
    // ======================================================

    async function loadUI() {

        const modules = [
            "window-manager",
            "desktop-manager",
            "shell-manager",
            "launcher",
            "haldo-light-system",
            "logo-animation-manager",
            "logo-intro-manager"
        ];

        const results = [];

        for (
            const moduleId of modules
        ) {

            try {

                results.push(
                    await loadModule(
                        moduleId
                    )
                );

            } catch (error) {

                results.push({

                    module:
                        moduleId,

                    status:
                        "failed",

                    error:
                        error

                });

            }

        }

        emit(
            "loader:ui-ready",
            results
        );

        return results;

    }

    // ======================================================
    // CHECK MODULE
    // ======================================================

    function checkModule(
        moduleId
    ) {

        const module =
            moduleMap.get(
                moduleId
            );

        if (!module) {

            return {

                exists:
                    false,

                loaded:
                    false,

                module:
                    null

            };

        }

        const loaded =
            state.loaded.includes(
                moduleId
            );

        const skipped =
            state.skipped.includes(
                moduleId
            );

        const failed =
            state.failedFiles.includes(
                moduleId
            );

        const globalReady =
            hasGlobalAPI(
                moduleId
            );

        return {

            exists:
                true,

            loaded:
                loaded,

            skipped:
                skipped,

            failed:
                failed,

            globalReady:
                globalReady,

            module:
                module

        };

    }

    // ======================================================
    // CHECK ALL MODULES
    // ======================================================

    function checkAll() {

        return MODULES.map(
            function (module) {

                return checkModule(
                    module.id
                );

            }
        );

    }

    // ======================================================
    // GET MODULE
    // ======================================================

    function getModule(
        moduleId
    ) {

        return (
            moduleMap.get(
                moduleId
            ) || null
        );

    }

    // ======================================================
    // GET MODULES
    // ======================================================

    function getModules() {

        return MODULES.map(
            function (module) {

                return {
                    ...module
                };

            }
        );

    }

    // ======================================================
    // GET STATE
    // ======================================================

    function getState() {

        return {

            version:
                LOADER_VERSION,

            name:
                LOADER_NAME,

            initialized:
                state.initialized,

            loading:
                state.loading,

            ready:
                state.ready,

            failed:
                state.failed,

            currentFile:
                state.currentFile,

            startedAt:
                state.startedAt,

            finishedAt:
                state.finishedAt,

            progress:
                state.progress,

            loaded:
                [
                    ...state.loaded
                ],

            failedFiles:
                [
                    ...state.failedFiles
                ],

            skipped:
                [
                    ...state.skipped
                ],

            pending:
                [
                    ...state.pending
                ],

            totalModules:
                MODULES.length

        };

    }

    // ======================================================
    // INITIALIZE
    // ======================================================

    function initialize() {

        if (
            state.initialized
        ) {

            return api;

        }

        state.initialized =
            true;

        emit(
            "loader:initialized",
            getState()
        );

        log(
            "System Loader initialisiert."
        );

        return api;

    }

    // ======================================================
    // GLOBAL API
    // ======================================================

    const api = {

        name:
            LOADER_NAME,

        version:
            LOADER_VERSION,

        initialize:
            initialize,

        load:
            loadModule,

        loadModule:
            loadModule,

        loadAll:
            loadAll,

        loadCore:
            loadCore,

        loadAI:
            loadAI,

        loadLanguageAndVoice:
            loadLanguageAndVoice,

        loadUI:
            loadUI,

        loadGroup:
            loadGroup,

        getModule:
            getModule,

        getModules:
            getModules,

        checkModule:
            checkModule,

        checkAll:
            checkAll,

        getState:
            getState,

        on:
            on,

        off:
            off,

        emit:
            emit

    };

    // ======================================================
    // GLOBAL REGISTRATION
    // ======================================================

    window.HalDoSystemLoader =
        api;

    window.HalDoOS.systemLoader =
        api;

    window.HalDoOS.loader =
        api;

    // ======================================================
    // INITIALIZE
    // ======================================================

    initialize();

})(window, document);