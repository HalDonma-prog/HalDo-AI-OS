/*
========================================================
HalDo AI OS 18
BOOT SYSTEM
Professional Ultimate Foundation
Version 18.0.0

Zentrale Boot-Steuerung

Verantwortlich für:
- Boot Screen
- HalDo Logo
- Startup Progress
- Kernel-Verbindung
- System-Verbindung
- AI Core
- Module-Status
- lokale Einstellungen
- Online/Offline
- sichere Fehlerbehandlung
- Übergang zur Hauptoberfläche

Wichtig:
Das Logo selbst wird NICHT durch ein Emoji ersetzt.
========================================================
*/

(function () {
    "use strict";

    const VERSION = "18.0.0";

    const state = {
        started: false,
        finished: false,
        progress: 0,
        currentStep: 0,
        online: navigator.onLine,
        failedModules: []
    };

    const startupSteps = [
        {
            progress: 8,
            text: "HalDo AI OS 18 wird initialisiert ..."
        },
        {
            progress: 18,
            text: "HalDo Kernel wird vorbereitet ..."
        },
        {
            progress: 30,
            text: "System wird initialisiert ..."
        },
        {
            progress: 44,
            text: "Systemmodule werden geladen ..."
        },
        {
            progress: 58,
            text: "AI Core wird vorbereitet ..."
        },
        {
            progress: 70,
            text: "AI Sprache und Eingabe werden vorbereitet ..."
        },
        {
            progress: 82,
            text: "HalDo Benutzeroberfläche wird verbunden ..."
        },
        {
            progress: 94,
            text: "HalDo AI wird gestartet ..."
        },
        {
            progress: 100,
            text: "HalDo AI OS ist bereit."
        }
    ];

    /*
    ====================================================
    DOM HELPERS
    ====================================================
    */

    function get(id) {
        return document.getElementById(id);
    }

    function exists(id) {
        return Boolean(get(id));
    }

    function safeText(id, text) {
        const element = get(id);

        if (element) {
            element.textContent = String(text);
        }
    }

    function safeClass(id, className, enabled) {
        const element = get(id);

        if (!element) {
            return;
        }

        element.classList.toggle(className, Boolean(enabled));
    }

    /*
    ====================================================
    BOOT ELEMENTS
    ====================================================
    */

    function getBootScreen() {
        return get("bootScreen");
    }

    function getMainApp() {
        return get("mainApp");
    }

    function getStatusElement() {
        return get("bootStatus") || get("startupStatus");
    }

    function getProgressElement() {
        return get("progressBar");
    }

    /*
    ====================================================
    LOGGING
    ====================================================
    */

    function log(...args) {
        console.log(
            "[HalDo Boot]",
            ...args
        );
    }

    function warn(...args) {
        console.warn(
            "[HalDo Boot]",
            ...args
        );
    }

    function error(...args) {
        console.error(
            "[HalDo Boot]",
            ...args
        );
    }

    /*
    ====================================================
    STATUS
    ====================================================
    */

    function updateStatus(text, progress) {
        if (typeof text === "string") {
            safeText(
                "bootStatus",
                text
            );

            safeText(
                "startupStatus",
                text
            );
        }

        if (
            typeof progress === "number"
        ) {
            state.progress = Math.max(
                0,
                Math.min(
                    100,
                    progress
                )
            );

            const progressBar =
                getProgressElement();

            if (progressBar) {
                progressBar.style.width =
                    state.progress + "%";
            }
        }

        emit(
            "boot:progress",
            {
                progress: state.progress,
                text: text || ""
            }
        );
    }

    /*
    ====================================================
    EVENT BRIDGE
    ====================================================
    */

    function emit(name, detail = {}) {
        try {
            window.dispatchEvent(
                new CustomEvent(
                    name,
                    {
                        detail
                    }
                )
            );
        } catch (eventError) {
            warn(
                "Event konnte nicht gesendet werden:",
                name,
                eventError
            );
        }

        /*
         * Zusätzlich Kernel Event-Bus verwenden,
         * wenn vorhanden.
         */

        try {
            if (
                window.HalDoKernel &&
                typeof window.HalDoKernel.emit ===
                    "function"
            ) {
                window.HalDoKernel.emit(
                    name,
                    detail
                );
            }
        } catch (kernelError) {
            warn(
                "Kernel Event konnte nicht gesendet werden:",
                name,
                kernelError
            );
        }
    }

    /*
    ====================================================
    LOGO FALLBACK
    ====================================================
    */

    function setupLogoFallback() {
        const logos =
            document.querySelectorAll(
                "img"
            );

        logos.forEach(
            logo => {
                const source =
                    logo.getAttribute("src");

                if (!source) {
                    return;
                }

                /*
                 * Hauptlogo:
                 * logo.png
                 *
                 * Fallback:
                 * assets/logo/logo.png
                 */

                logo.addEventListener(
                    "error",
                    function () {
                        if (
                            this.dataset
                                .haldoFallbackUsed ===
                            "1"
                        ) {
                            warn(
                                "HalDo Logo konnte nicht geladen werden:",
                                source
                            );

                            return;
                        }

                        this.dataset
                            .haldoFallbackUsed =
                            "1";

                        if (
                            source !==
                            "logo.png"
                        ) {
                            this.src =
                                "logo.png";
                        } else {
                            this.src =
                                "assets/logo/logo.png";
                        }
                    },
                    {
                        once: false
                    }
                );
            }
        );
    }

    /*
    ====================================================
    LOCAL SETTINGS
    ====================================================
    */

    function loadSettings() {
        try {
            const raw =
                localStorage.getItem(
                    "haldo_settings"
                );

            if (!raw) {
                return {};
            }

            const settings =
                JSON.parse(raw);

            if (
                !settings ||
                typeof settings !== "object"
            ) {
                return {};
            }

            return settings;
        } catch (storageError) {
            warn(
                "Lokale Einstellungen konnten nicht gelesen werden.",
                storageError
            );

            return {};
        }
    }

    function applySettings() {
        const settings =
            loadSettings();

        /*
         * Logo Animation
         */

        if (
            settings.logoAnimation === false
        ) {
            document
                .querySelectorAll(
                    ".boot-logo, .header-logo, .hero-logo, .haldo-logo-image"
                )
                .forEach(
                    logo => {
                        logo.style.animation =
                            "none";
                    }
                );
        }

        /*
         * Light System
         */

        if (
            window.HalDoLight
        ) {
            if (
                typeof settings.lightIntensity ===
                "number"
            ) {
                window.HalDoLight.setIntensity(
                    settings.lightIntensity
                );
            }

            if (
                typeof settings.lightSpeed ===
                "number"
            ) {
                window.HalDoLight.setSpeed(
                    settings.lightSpeed
                );
            }

            if (
                typeof settings.lightRunning ===
                "boolean"
            ) {
                window.HalDoLight.setRunning(
                    settings.lightRunning
                );
            }
        }

        emit(
            "settings:applied",
            settings
        );
    }

    /*
    ====================================================
    MODULE CHECK
    ====================================================
    */

    function moduleAvailable(name) {
        return Boolean(
            window[name]
        );
    }

    function checkModules() {
        const modules = {
            kernel:
                moduleAvailable(
                    "HalDoKernel"
                ),

            system:
                moduleAvailable(
                    "HalDoSystem"
                ),

            aiCore:
                moduleAvailable(
                    "HalDoAICore"
                ),

            ezidiKeyboard:
                moduleAvailable(
                    "HalDoEzidiKeyboard"
                ),

            light:
                moduleAvailable(
                    "HalDoLight"
                ),

            storage:
                moduleAvailable(
                    "HalDoStorage"
                ),

            language:
                moduleAvailable(
                    "HalDoLanguage"
                )
        };

        Object.entries(
            modules
        ).forEach(
            ([name, available]) => {
                if (!available) {
                    state.failedModules.push(
                        name
                    );
                }
            }
        );

        emit(
            "boot:modules",
            modules
        );

        return modules;
    }

    /*
    ====================================================
    KERNEL START
    ====================================================
    */

    async function startKernel() {
        if (
            !window.HalDoKernel
        ) {
            warn(
                "HalDoKernel ist noch nicht verfügbar."
            );

            return false;
        }

        try {
            if (
                typeof window.HalDoKernel.start ===
                "function"
            ) {
                const result =
                    window.HalDoKernel.start();

                if (
                    result instanceof Promise
                ) {
                    await result;
                }
            }

            emit(
                "boot:kernel-ready"
            );

            return true;
        } catch (kernelError) {
            error(
                "Kernel konnte nicht gestartet werden.",
                kernelError
            );

            emit(
                "boot:kernel-error",
                {
                    error: kernelError
                }
            );

            return false;
        }
    }

    /*
    ====================================================
    SYSTEM START
    ====================================================
    */

    async function startSystem() {
        if (
            !window.HalDoSystem
        ) {
            warn(
                "HalDoSystem ist noch nicht verfügbar."
            );

            return false;
        }

        try {
            if (
                typeof window.HalDoSystem.start ===
                "function"
            ) {
                const result =
                    window.HalDoSystem.start();

                if (
                    result instanceof Promise
                ) {
                    await result;
                }
            }

            emit(
                "boot:system-ready"
            );

            return true;
        } catch (systemError) {
            error(
                "System konnte nicht gestartet werden.",
                systemError
            );

            emit(
                "boot:system-error",
                {
                    error: systemError
                }
            );

            return false;
        }
    }

    /*
    ====================================================
    AI CORE START
    ====================================================
    */

    async function startAICore() {
        if (
            !window.HalDoAICore
        ) {
            warn(
                "HalDoAICore ist nicht verfügbar."
            );

            return false;
        }

        try {
            if (
                typeof window.HalDoAICore.start ===
                "function"
            ) {
                const result =
                    window.HalDoAICore.start();

                if (
                    result instanceof Promise
                ) {
                    await result;
                }
            }

            emit(
                "boot:ai-ready"
            );

            return true;
        } catch (aiError) {
            error(
                "AI Core konnte nicht gestartet werden.",
                aiError
            );

            emit(
                "boot:ai-error",
                {
                    error: aiError
                }
            );

            return false;
        }
    }

    /*
    ====================================================
    STARTUP STEP
    ====================================================
    */

    async function executeStep(step) {
        updateStatus(
            step.text,
            step.progress
        );

        await new Promise(
            resolve =>
                window.setTimeout(
                    resolve,
                    260
                )
        );
    }

    /*
    ====================================================
    STARTUP SEQUENCE
    ====================================================
    */

    async function runStartup() {
        if (
            state.started
        ) {
            return;
        }

        state.started = true;

        log(
            "HalDo AI OS 18 Boot startet."
        );

        emit(
            "boot:start",
            {
                version: VERSION
            }
        );

        setupLogoFallback();

        for (
            let i = 0;
            i < startupSteps.length;
            i++
        ) {
            state.currentStep = i;

            const step =
                startupSteps[i];

            await executeStep(
                step
            );

            /*
             * Spezifische Systemphasen
             */

            if (i === 1) {
                await startKernel();
            }

            if (i === 2) {
                await startSystem();
            }

            if (i === 4) {
                await startAICore();
            }

            if (i === 6) {
                checkModules();
            }

            if (i === 7) {
                applySettings();
            }
        }

        await finishStartup();
    }

    /*
    ====================================================
    FINISH STARTUP
    ====================================================
    */

    async function finishStartup() {
        if (
            state.finished
        ) {
            return;
        }

        state.finished = true;

        updateStatus(
            "HalDo AI OS ist bereit.",
            100
        );

        emit(
            "boot:ready",
            {
                version: VERSION,
                online: state.online,
                failedModules: [
                    ...state.failedModules
                ]
            }
        );

        await new Promise(
            resolve =>
                window.setTimeout(
                    resolve,
                    500
                )
        );

        const bootScreen =
            getBootScreen();

        const mainApp =
            getMainApp();

        if (bootScreen) {
            bootScreen.classList.add(
                "hide"
            );

            /*
             * Kompatibilität mit älteren
             * Boot-Screen-Klassen.
             */

            bootScreen.classList.add(
                "hidden"
            );
        }

        if (mainApp) {
            mainApp.classList.add(
                "visible"
            );

            mainApp.classList.remove(
                "hidden"
            );
        }

        document.body.classList.add(
            "haldo-system-ready"
        );

        emit(
            "boot:complete"
        );

        log(
            "HalDo AI OS 18 vollständig gestartet."
        );
    }

    /*
    ====================================================
    ONLINE / OFFLINE
    ====================================================
    */

    function setupNetworkEvents() {
        window.addEventListener(
            "online",
            () => {
                state.online = true;

                emit(
                    "system:online"
                );

                log(
                    "HalDo AI OS ist online."
                );
            }
        );

        window.addEventListener(
            "offline",
            () => {
                state.online = false;

                emit(
                    "system:offline"
                );

                warn(
                    "HalDo AI OS arbeitet offline."
                );
            }
        );
    }

    /*
    ====================================================
    PUBLIC API
    ====================================================
    */

    const HalDoBoot = {
        name:
            "HalDo Boot System",

        version:
            VERSION,

        getState() {
            return {
                started:
                    state.started,

                finished:
                    state.finished,

                progress:
                    state.progress,

                currentStep:
                    state.currentStep,

                online:
                    state.online,

                failedModules: [
                    ...state.failedModules
                ]
            };
        },

        start() {
            return runStartup();
        },

        finish() {
            return finishStartup();
        },

        updateStatus,

        checkModules,

        loadSettings,

        applySettings
    };

    /*
    ====================================================
    GLOBAL REGISTRATION
    ====================================================
    */

    window.HalDoBoot =
        HalDoBoot;

    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.boot =
        HalDoBoot;

    /*
    ====================================================
    INIT
    ====================================================
    */

    function init() {
        setupNetworkEvents();

        /*
         * Nur starten, wenn die Seite
         * tatsächlich ein Boot-System besitzt.
         */

        if (
            exists("bootScreen") ||
            exists("startupScreen")
        ) {
            runStartup();
        } else {
            log(
                "Kein Boot Screen gefunden."
            );

            emit(
                "boot:no-screen"
            );
        }
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );
    } else {
        init();
    }

})();