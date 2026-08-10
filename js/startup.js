// ============================================================
// HalDo AI OS 18
// Professional Ultimate Foundation
// STARTUP SYSTEM
// Version 18.0.0
//
// DATEI:
// js/startup.js
//
// AKTION:
// KOMPLETTEN INHALT ERSETZEN
//
// AUFGABE:
// Zentrale Startup-Orchestrierung für HalDo AI OS 18.
//
// VERBINDET:
// - Kernel
// - System
// - System Loader
// - Boot
// - AI Core
// - App Manager
// - App Registry
// - App Router
// - Launcher
// - Storage
// - Sprache
// - Voice
// - Êzîdî Keyboard
// - Logo-System
// - Light-System
//
// WICHTIG:
// Vorhandene Module werden nicht entfernt.
// Dieses System erkennt vorhandene APIs und nutzt sie.
// ============================================================

(function (window, document) {

    "use strict";

    // ========================================================
    // KONFIGURATION
    // ========================================================

    const CONFIG = {

        name: "HalDo AI OS",

        version: "18.0.0",

        edition:
            "Professional Ultimate Foundation",

        startupTimeout:
            15000,

        moduleRetryDelay:
            500,

        maxModuleRetries:
            12,

        autoStart:
            true,

        waitForDOM:
            true,

        debug:
            false

    };

    // ========================================================
    // GLOBAL HALDO OBJECT
    // ========================================================

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};

    // ========================================================
    // STARTUP STATE
    // ========================================================

    const state = {

        status:
            "created",

        started:
            false,

        ready:
            false,

        failed:
            false,

        domReady:
            false,

        bootReady:
            false,

        kernelReady:
            false,

        systemReady:
            false,

        loaderReady:
            false,

        aiReady:
            false,

        appSystemReady:
            false,

        visualSystemReady:
            false,

        startTime:
            null,

        readyTime:
            null,

        duration:
            null,

        retries:
            0,

        errors: [],

        warnings: [],

        stages: {}

    };

    // ========================================================
    // STARTUP STAGES
    // ========================================================

    const stages = [

        {
            id:
                "environment",

            name:
                "Environment",

            required:
                true
        },

        {
            id:
                "loader",

            name:
                "System Loader",

            required:
                false
        },

        {
            id:
                "kernel",

            name:
                "Kernel",

            required:
                true
        },

        {
            id:
                "system",

            name:
                "System",

            required:
                true
        },

        {
            id:
                "modules",

            name:
                "Modules",

            required:
                false
        },

        {
            id:
                "ai",

            name:
                "AI System",

            required:
                false
        },

        {
            id:
                "apps",

            name:
                "App System",

            required:
                false
        },

        {
            id:
                "visual",

            name:
                "Visual System",

            required:
                false
        },

        {
            id:
                "ready",

            name:
                "System Ready",

            required:
                true
        }

    ];

    stages.forEach(
        function (stage) {

            state.stages[
                stage.id
            ] = {

                id:
                    stage.id,

                name:
                    stage.name,

                required:
                    stage.required,

                status:
                    "waiting",

                started:
                    null,

                finished:
                    null,

                duration:
                    null,

                error:
                    null
            };

        }
    );

    // ========================================================
    // EVENTS
    // ========================================================

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

            listeners[eventName] =
                [];

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
            listeners[eventName]
                .filter(
                    function (item) {

                        return (
                            item !==
                            callback
                        );

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

            listeners[eventName]
                .slice()
                .forEach(
                    function (
                        callback
                    ) {

                        try {

                            callback(
                                data
                            );

                        } catch (
                            error
                        ) {

                            console.error(
                                "[HalDo Startup] Event Error:",
                                error
                            );

                        }

                    }
                );

        }

        if (
            HalDoOS.events &&
            typeof HalDoOS.events.emit ===
            "function"
        ) {

            try {

                HalDoOS.events.emit(
                    "startup:" +
                    eventName,
                    data
                );

            } catch (
                error
            ) {

                console.warn(
                    "[HalDo Startup] HalDoOS Event Error:",
                    error
                );

            }

        }

    }

    // ========================================================
    // LOGGING
    // ========================================================

    function log() {

        if (
            CONFIG.debug
        ) {

            console.log(
                "[HalDo Startup]",
                ...arguments
            );

        }

    }

    function warn(
        message,
        error
    ) {

        const item = {

            message:
                message,

            error:
                error || null,

            time:
                new Date().toISOString()

        };

        state.warnings.push(
            item
        );

        console.warn(
            "[HalDo Startup]",
            message,
            error || ""
        );

        emit(
            "warning",
            item
        );

    }

    function fail(
        message,
        error
    ) {

        const item = {

            message:
                message,

            error:
                error || null,

            time:
                new Date().toISOString()

        };

        state.errors.push(
            item
        );

        console.error(
            "[HalDo Startup]",
            message,
            error || ""
        );

        emit(
            "error",
            item
        );

    }

    // ========================================================
    // DOM READY
    // ========================================================

    function markDOMReady() {

        if (
            state.domReady
        ) {

            return;

        }

        state.domReady =
            true;

        emit(
            "dom-ready"
        );

    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            markDOMReady,
            {
                once:
                    true
            }
        );

    } else {

        markDOMReady();

    }

    // ========================================================
    // GET GLOBAL API
    // ========================================================

    function getAPI(
        primary,
        aliases
    ) {

        const paths = [

            primary,

            ...(aliases || [])

        ];

        for (
            let index = 0;
            index < paths.length;
            index++
        ) {

            const path =
                paths[index];

            if (
                typeof path !==
                "string"
            ) {

                continue;

            }

            const parts =
                path.split(".");

            let current =
                window;

            let valid =
                true;

            for (
                let partIndex = 0;
                partIndex <
                parts.length;
                partIndex++
            ) {

                if (
                    current == null ||
                    (
                        typeof current !==
                        "object" &&
                        typeof current !==
                        "function"
                    )
                ) {

                    valid =
                        false;

                    break;

                }

                current =
                    current[
                        parts[
                            partIndex
                        ]
                    ];

            }

            if (
                valid &&
                current
            ) {

                return current;

            }

        }

        return null;

    }

    // ========================================================
    // API REFERENCES
    // ========================================================

    function getKernel() {

        return getAPI(
            "HalDoKernel",
            [
                "HalDoOS.kernel"
            ]
        );

    }

    function getSystem() {

        return getAPI(
            "HalDoSystem",
            [
                "HalDoOS.system"
            ]
        );

    }

    function getLoader() {

        return getAPI(
            "HalDoSystemLoader",
            [
                "HalDoOS.systemLoader"
            ]
        );

    }

    function getBoot() {

        return getAPI(
            "HalDoBoot",
            [
                "HalDoOS.boot"
            ]
        );

    }

    function getAICore() {

        return getAPI(
            "HalDoAICore",
            [
                "HalDoOS.aiCore"
            ]
        );

    }

    function getAppManager() {

        return getAPI(
            "HalDoAppManager",
            [
                "HalDoOS.appManager"
            ]
        );

    }

    function getAppRegistry() {

        return getAPI(
            "HalDoAppRegistry",
            [
                "HalDoOS.appRegistry"
            ]
        );

    }

    function getAppRouter() {

        return getAPI(
            "HalDoAppRouter",
            [
                "HalDoOS.appRouter"
            ]
        );

    }

    function getLauncher() {

        return getAPI(
            "HalDoLauncher",
            [
                "HalDoOS.launcher"
            ]
        );

    }

    function getLogoIntro() {

        return getAPI(
            "HalDoLogoIntroManager",
            [
                "HalDoOS.logoIntroManager"
            ]
        );

    }

    function getLogoAnimation() {

        return getAPI(
            "HalDoLogoAnimationManager",
            [
                "HalDoOS.logoAnimationManager"
            ]
        );

    }

    function getLightSystem() {

        return getAPI(
            "HalDoLightSystem",
            [
                "HalDoOS.lightSystem"
            ]
        );

    }

    // ========================================================
    // STAGE START
    // ========================================================

    function stageStart(
        stageId
    ) {

        const stage =
            state.stages[
                stageId
            ];

        if (!stage) {

            return;

        }

        stage.status =
            "running";

        stage.started =
            Date.now();

        emit(
            "stage-start",
            {
                id:
                    stage.id,

                name:
                    stage.name
            }
        );

    }

    // ========================================================
    // STAGE SUCCESS
    // ========================================================

    function stageSuccess(
        stageId,
        data
    ) {

        const stage =
            state.stages[
                stageId
            ];

        if (!stage) {

            return;

        }

        stage.status =
            "ready";

        stage.finished =
            Date.now();

        stage.duration =
            stage.started
                ? stage.finished -
                  stage.started
                : 0;

        emit(
            "stage-ready",
            {
                id:
                    stage.id,

                name:
                    stage.name,

                duration:
                    stage.duration,

                data:
                    data || null
            }
        );

    }

    // ========================================================
    // STAGE WARNING
    // ========================================================

    function stageWarning(
        stageId,
        message
    ) {

        const stage =
            state.stages[
                stageId
            ];

        if (!stage) {

            return;

        }

        stage.status =
            "warning";

        stage.finished =
            Date.now();

        stage.duration =
            stage.started
                ? stage.finished -
                  stage.started
                : 0;

        warn(
            stage.name +
            ": " +
            message
        );

        emit(
            "stage-warning",
            {
                id:
                    stage.id,

                name:
                    stage.name,

                message:
                    message
            }
        );

    }

    // ========================================================
    // STAGE FAILURE
    // ========================================================

    function stageFailure(
        stageId,
        error
    ) {

        const stage =
            state.stages[
                stageId
            ];

        if (!stage) {

            return;

        }

        stage.status =
            "failed";

        stage.finished =
            Date.now();

        stage.duration =
            stage.started
                ? stage.finished -
                  stage.started
                : 0;

        stage.error =
            error || null;

        fail(
            stage.name +
            " konnte nicht gestartet werden.",
            error
        );

        emit(
            "stage-error",
            {
                id:
                    stage.id,

                name:
                    stage.name,

                error:
                    error || null
            }
        );

    }

    // ========================================================
    // ENVIRONMENT
    // ========================================================

    function initializeEnvironment() {

        stageStart(
            "environment"
        );

        try {

            if (
                !window ||
                !document
            ) {

                throw new Error(
                    "Browser-Umgebung nicht verfügbar."
                );

            }

            HalDoOS.name =
                CONFIG.name;

            HalDoOS.version =
                CONFIG.version;

            HalDoOS.edition =
                CONFIG.edition;

            HalDoOS.startup =
                HalDoOS.startup ||
                {};

            stageSuccess(
                "environment"
            );

            return true;

        } catch (
            error
        ) {

            stageFailure(
                "environment",
                error
            );

            return false;

        }

    }

    // ========================================================
    // SYSTEM LOADER
    // ========================================================

    function initializeLoader() {

        stageStart(
            "loader"
        );

        const loader =
            getLoader();

        if (!loader) {

            stageWarning(
                "loader",
                "System Loader ist noch nicht verfügbar."
            );

            return false;

        }

        try {

            if (
                typeof loader.start ===
                "function"
            ) {

                loader.start();

            }

            state.loaderReady =
                true;

            stageSuccess(
                "loader"
            );

            return true;

        } catch (
            error
        ) {

            stageFailure(
                "loader",
                error
            );

            return false;

        }

    }

    // ========================================================
    // KERNEL
    // ========================================================

    function initializeKernel() {

        stageStart(
            "kernel"
        );

        const kernel =
            getKernel();

        if (!kernel) {

            stageFailure(
                "kernel",
                new Error(
                    "HalDoKernel wurde nicht gefunden."
                )
            );

            return false;

        }

        try {

            state.kernelReady =
                true;

            if (
                typeof kernel.start ===
                "function"
            ) {

                const result =
                    kernel.start();

                log(
                    "Kernel start() Ergebnis:",
                    result
                );

            }

            stageSuccess(
                "kernel"
            );

            return true;

        } catch (
            error
        ) {

            state.kernelReady =
                false;

            stageFailure(
                "kernel",
                error
            );

            return false;

        }

    }

    // ========================================================
    // SYSTEM
    // ========================================================

    function initializeSystem() {

        stageStart(
            "system"
        );

        const system =
            getSystem();

        if (!system) {

            stageFailure(
                "system",
                new Error(
                    "HalDoSystem wurde nicht gefunden."
                )
            );

            return false;

        }

        try {

            state.systemReady =
                true;

            if (
                typeof system.start ===
                "function"
            ) {

                system.start();

            }

            stageSuccess(
                "system"
            );

            return true;

        } catch (
            error
        ) {

            state.systemReady =
                false;

            stageFailure(
                "system",
                error
            );

            return false;

        }

    }

    // ========================================================
    // MODULE SYSTEM
    // ========================================================

    function initializeModules() {

        stageStart(
            "modules"
        );

        try {

            const loader =
                getLoader();

            if (
                loader &&
                typeof loader.detect ===
                "function"
            ) {

                loader.detect();

            }

            if (
                loader &&
                typeof loader.connect ===
                "function"
            ) {

                loader.connect();

            }

            emit(
                "modules-connected"
            );

            stageSuccess(
                "modules"
            );

            return true;

        } catch (
            error
        ) {

            stageWarning(
                "modules",
                "Nicht alle Module konnten sofort verbunden werden."
            );

            return false;

        }

    }

    // ========================================================
    // AI SYSTEM
    // ========================================================

    function initializeAI() {

        stageStart(
            "ai"
        );

        try {

            const ai =
                getAICore();

            if (!ai) {

                stageWarning(
                    "ai",
                    "AI Core ist noch nicht verfügbar."
                );

                return false;

            }

            if (
                typeof ai.init ===
                "function"
            ) {

                ai.init();

            }

            if (
                typeof ai.start ===
                "function"
            ) {

                ai.start();

            }

            state.aiReady =
                true;

            stageSuccess(
                "ai"
            );

            emit(
                "ai-ready",
                ai
            );

            return true;

        } catch (
            error
        ) {

            state.aiReady =
                false;

            stageWarning(
                "ai",
                "AI Core konnte nicht vollständig gestartet werden."
            );

            return false;

        }

    }

    // ========================================================
    // APP SYSTEM
    // ========================================================

    function initializeApps() {

        stageStart(
            "apps"
        );

        try {

            const registry =
                getAppRegistry();

            const manager =
                getAppManager();

            const router =
                getAppRouter();

            const launcher =
                getLauncher();

            if (
                registry &&
                typeof registry.init ===
                "function"
            ) {

                registry.init();

            }

            if (
                manager &&
                typeof manager.init ===
                "function"
            ) {

                manager.init();

            }

            if (
                router &&
                typeof router.init ===
                "function"
            ) {

                router.init();

            }

            if (
                launcher &&
                typeof launcher.init ===
                "function"
            ) {

                launcher.init();

            }

            state.appSystemReady =
                !!(
                    registry ||
                    manager ||
                    router ||
                    launcher
                );

            if (
                !state.appSystemReady
            ) {

                stageWarning(
                    "apps",
                    "Noch kein App-Modul verfügbar."
                );

                return false;

            }

            stageSuccess(
                "apps"
            );

            emit(
                "apps-ready"
            );

            return true;

        } catch (
            error
        ) {

            state.appSystemReady =
                false;

            stageWarning(
                "apps",
                "App-System konnte nicht vollständig initialisiert werden."
            );

            return false;

        }

    }

    // ========================================================
    // VISUAL SYSTEM
    // ========================================================

    function initializeVisualSystem() {

        stageStart(
            "visual"
        );

        try {

            const logoIntro =
                getLogoIntro();

            const logoAnimation =
                getLogoAnimation();

            const lightSystem =
                getLightSystem();

            let connected =
                false;

            if (
                logoIntro
            ) {

                connected =
                    true;

                if (
                    typeof logoIntro.init ===
                    "function"
                ) {

                    logoIntro.init();

                }

            }

            if (
                logoAnimation
            ) {

                connected =
                    true;

                if (
                    typeof logoAnimation.init ===
                    "function"
                ) {

                    logoAnimation.init();

                }

            }

            if (
                lightSystem
            ) {

                connected =
                    true;

                if (
                    typeof lightSystem.init ===
                    "function"
                ) {

                    lightSystem.init();

                }

            }

            state.visualSystemReady =
                connected;

            if (!connected) {

                stageWarning(
                    "visual",
                    "Kein vorhandenes Visual-Modul gefunden."
                );

                return false;

            }

            stageSuccess(
                "visual"
            );

            emit(
                "visual-ready"
            );

            return true;

        } catch (
            error
        ) {

            state.visualSystemReady =
                false;

            stageWarning(
                "visual",
                "Visual-System konnte nicht vollständig verbunden werden."
            );

            return false;

        }

    }

    // ========================================================
    // CHECK SYSTEM READINESS
    // ========================================================

    function checkReadiness() {

        const requiredStages =
            stages.filter(
                function (stage) {

                    return (
                        stage.required
                    );

                }
            );

        const failed =
            requiredStages.filter(
                function (stage) {

                    return (
                        state.stages[
                            stage.id
                        ].status ===
                        "failed"
                    );

                }
            );

        return (
            failed.length ===
            0
        );

    }

    // ========================================================
    // FINALIZE
    // ========================================================

    function finalizeStartup() {

        if (
            state.ready
        ) {

            return;

        }

        const ready =
            checkReadiness();

        if (!ready) {

            state.failed =
                true;

            state.status =
                "failed";

            emit(
                "failed",
                getState()
            );

            return;

        }

        stageStart(
            "ready"
        );

        state.ready =
            true;

        state.failed =
            false;

        state.status =
            "ready";

        state.readyTime =
            Date.now();

        state.duration =
            state.startTime
                ? state.readyTime -
                  state.startTime
                : 0;

        stageSuccess(
            "ready"
        );

        emit(
            "ready",
            getState()
        );

        log(
            "HalDo AI OS 18 Startup vollständig bereit.",
            getState()
        );

    }

    // ========================================================
    // MAIN STARTUP SEQUENCE
    // ========================================================

    function start() {

        if (
            state.started
        ) {

            return getState();

        }

        state.started =
            true;

        state.status =
            "starting";

        state.startTime =
            Date.now();

        emit(
            "start",
            getState()
        );

        // ----------------------------------------------------
        // ENVIRONMENT
        // ----------------------------------------------------

        if (
            !initializeEnvironment()
        ) {

            return getState();

        }

        // ----------------------------------------------------
        // LOADER
        // ----------------------------------------------------

        initializeLoader();

        // ----------------------------------------------------
        // KERNEL
        // ----------------------------------------------------

        if (
            !initializeKernel()
        ) {

            return getState();

        }

        // ----------------------------------------------------
        // SYSTEM
        // ----------------------------------------------------

        if (
            !initializeSystem()
        ) {

            return getState();

        }

        // ----------------------------------------------------
        // MODULES
        // ----------------------------------------------------

        initializeModules();

        // ----------------------------------------------------
        // AI
        // ----------------------------------------------------

        initializeAI();

        // ----------------------------------------------------
        // APPS
        // ----------------------------------------------------

        initializeApps();

        // ----------------------------------------------------
        // VISUAL
        // ----------------------------------------------------

        initializeVisualSystem();

        // ----------------------------------------------------
        // FINAL
        // ----------------------------------------------------

        finalizeStartup();

        return getState();

    }

    // ========================================================
    // RETRY
    // ========================================================

    function retry() {

        if (
            state.ready
        ) {

            return getState();

        }

        state.retries++;

        state.failed =
            false;

        state.status =
            "retrying";

        emit(
            "retry",
            {
                attempt:
                    state.retries
            }
        );

        if (
            state.retries >
            CONFIG.maxModuleRetries
        ) {

            fail(
                "Maximale Startup-Wiederholungen erreicht."
            );

            state.status =
                "failed";

            state.failed =
                true;

            return getState();

        }

        try {

            initializeLoader();

            initializeModules();

            initializeAI();

            initializeApps();

            initializeVisualSystem();

            finalizeStartup();

        } catch (
            error
        ) {

            fail(
                "Startup-Wiederholung fehlgeschlagen.",
                error
            );

        }

        return getState();

    }

    // ========================================================
    // BOOT CONNECTION
    // ========================================================

    function connectBoot() {

        const boot =
            getBoot();

        if (!boot) {

            return;

        }

        try {

            if (
                typeof boot.on ===
                "function"
            ) {

                boot.on(
                    "ready",
                    function () {

                        state.bootReady =
                            true;

                        emit(
                            "boot-ready"
                        );

                    }
                );

                boot.on(
                    "complete",
                    function () {

                        state.bootReady =
                            true;

                        emit(
                            "boot-complete"
                        );

                    }
                );

            }

            if (
                typeof boot.isReady ===
                "function"
            ) {

                state.bootReady =
                    !!boot.isReady();

            }

        } catch (
            error
        ) {

            warn(
                "Boot-System konnte nicht vollständig verbunden werden.",
                error
            );

        }

    }

    // ========================================================
    // KERNEL CONNECTION
    // ========================================================

    function connectKernelEvents() {

        const kernel =
            getKernel();

        if (!kernel) {

            return;

        }

        try {

            if (
                typeof kernel.on ===
                "function"
            ) {

                kernel.on(
                    "ready",
                    function (
                        data
                    ) {

                        state.kernelReady =
                            true;

                        emit(
                            "kernel-ready",
                            data
                        );

                    }
                );

                kernel.on(
                    "error",
                    function (
                        error
                    ) {

                        emit(
                            "kernel-error",
                            error
                        );

                    }
                );

            }

        } catch (
            error
        ) {

            warn(
                "Kernel Events konnten nicht verbunden werden.",
                error
            );

        }

    }

    // ========================================================
    // SYSTEM CONNECTION
    // ========================================================

    function connectSystemEvents() {

        const system =
            getSystem();

        if (!system) {

            return;

        }

        try {

            if (
                typeof system.on ===
                "function"
            ) {

                system.on(
                    "ready",
                    function (
                        data
                    ) {

                        state.systemReady =
                            true;

                        emit(
                            "system-ready",
                            data
                        );

                    }
                );

                system.on(
                    "error",
                    function (
                        error
                    ) {

                        emit(
                            "system-error",
                            error
                        );

                    }
                );

            }

        } catch (
            error
        ) {

            warn(
                "System Events konnten nicht verbunden werden.",
                error
            );

        }

    }

    // ========================================================
    // STARTUP TIMEOUT
    // ========================================================

    let timeoutHandle =
        null;

    function startTimeoutProtection() {

        if (
            timeoutHandle
        ) {

            window.clearTimeout(
                timeoutHandle
            );

        }

        timeoutHandle =
            window.setTimeout(
                function () {

                    if (
                        state.ready ||
                        state.failed
                    ) {

                        return;

                    }

                    warn(
                        "Startup benötigt ungewöhnlich lange."
                    );

                    emit(
                        "timeout",
                        getState()
                    );

                    retry();

                },
                CONFIG.startupTimeout
            );

    }

    // ========================================================
    // PUBLIC STATE
    // ========================================================

    function getState() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            edition:
                CONFIG.edition,

            status:
                state.status,

            started:
                state.started,

            ready:
                state.ready,

            failed:
                state.failed,

            domReady:
                state.domReady,

            bootReady:
                state.bootReady,

            kernelReady:
                state.kernelReady,

            systemReady:
                state.systemReady,

            loaderReady:
                state.loaderReady,

            aiReady:
                state.aiReady,

            appSystemReady:
                state.appSystemReady,

            visualSystemReady:
                state.visualSystemReady,

            startTime:
                state.startTime,

            readyTime:
                state.readyTime,

            duration:
                state.duration,

            retries:
                state.retries,

            errors:
                state.errors.slice(),

            warnings:
                state.warnings.slice(),

            stages:
                JSON.parse(
                    JSON.stringify(
                        state.stages
                    )
                )

        };

    }

    // ========================================================
    // PUBLIC API
    // ========================================================

    HalDoOS.startup =
        HalDoOS.startup ||
        {};

    HalDoOS.startup.name =
        CONFIG.name;

    HalDoOS.startup.version =
        CONFIG.version;

    HalDoOS.startup.edition =
        CONFIG.edition;

    HalDoOS.startup.start =
        start;

    HalDoOS.startup.retry =
        retry;

    HalDoOS.startup.getState =
        getState;

    HalDoOS.startup.on =
        on;

    HalDoOS.startup.off =
        off;

    HalDoOS.startup.emit =
        emit;

    HalDoOS.startup.isReady =
        function () {

            return state.ready;

        };

    HalDoOS.startup.isStarted =
        function () {

            return state.started;

        };

    HalDoOS.startup.getStage =
        function (
            id
        ) {

            return state.stages[id]
                ? {
                    ...state.stages[id]
                }
                : null;

        };

    window.HalDoStartup =
        HalDoOS.startup;

    // ========================================================
    // EXISTING EVENTS CONNECT
    // ========================================================

    connectBoot();

    connectKernelEvents();

    connectSystemEvents();

    // ========================================================
    // DOM START
    // ========================================================

    function autoStart() {

        if (
            !CONFIG.autoStart
        ) {

            return;

        }

        if (
            !state.domReady
        ) {

            return;

        }

        if (
            state.started
        ) {

            return;

        }

        startTimeoutProtection();

        start();

    }

    on(
        "dom-ready",
        function () {

            autoStart();

        }
    );

    // Falls DOM bereits bereit war
    if (
        state.domReady
    ) {

        window.setTimeout(
            autoStart,
            0
        );

    }

    // ========================================================
    // GLOBAL ERROR PROTECTION
    // ========================================================

    window.addEventListener(
        "error",
        function (
            event
        ) {

            if (!event) {
                return;
            }

            emit(
                "runtime-error",
                event.error ||
                event.message
            );

        }
    );

    window.addEventListener(
        "unhandledrejection",
        function (
            event
        ) {

            if (!event) {
                return;
            }

            emit(
                "promise-error",
                event.reason
            );

        }
    );

    // ========================================================
    // DEBUG
    // ========================================================

    HalDoOS.startup.debug =
        function () {

            console.group(
                "HalDo AI OS 18 Startup"
            );

            console.log(
                getState()
            );

            console.groupEnd();

            return getState();

        };

    // ========================================================
    // STARTUP REGISTRIERUNG
    // ========================================================

    emit(
        "registered",
        {
            name:
                CONFIG.name,

            version:
                CONFIG.version,

            edition:
                CONFIG.edition
        }
    );

})(window, document);