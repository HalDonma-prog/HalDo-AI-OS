/*
========================================================
HalDo AI OS 18
PROFESSIONAL ULTIMATE FOUNDATION
BOOT SYSTEM
Version 18.0.0

DATEI:
js/boot.js

AKTION:
KOMPLETTEN INHALT ERSETZEN

AUFGABE:
Zentrale sichtbare Boot-Oberfläche.

VERANTWORTLICH FÜR:
- Boot Screen
- Boot Status
- Fortschrittsanzeige
- Logo-Fallback
- Boot Events
- Verbindung mit HalDoStartup
- Übergang zur Hauptoberfläche
- Online / Offline
- sichere Fehlerbehandlung

WICHTIG:
Dieses Boot-System startet Kernel, System und AI
NICHT direkt.

Die eigentliche Systeminitialisierung übernimmt:
js/startup.js

Zusätzlich erkennt dieses Boot-System,
wenn HalDoStartup bereits gestartet oder bereit ist.
Dadurch kann kein Ready-Event mehr verloren gehen.
========================================================
*/

(function (window, document) {

    "use strict";


    // ========================================================
    // KONFIGURATION
    // ========================================================

    const CONFIG = {

        name:
            "HalDo Boot System",

        version:
            "18.0.0",

        logo:
            "logo.png",

        logoFallback:
            "assets/logo/logo.png",

        initialText:
            "HalDo AI OS startet ...",

        initializingText:
            "HalDo AI OS 18 wird initialisiert ...",

        readyText:
            "HalDo AI OS 18 ist bereit.",

        transitionDelay:
            650,

        startupCheckDelay:
            100,

        startupCheckLimit:
            150

    };


    // ========================================================
    // STATE
    // ========================================================

    const state = {

        initialized:
            false,

        started:
            false,

        finished:
            false,

        progress:
            0,

        currentText:
            CONFIG.initialText,

        online:
            navigator.onLine,

        startupConnected:
            false,

        startupStarted:
            false,

        startupReady:
            false,

        failed:
            false,

        startupChecks:
            0,

        errors:
            [],

        warnings:
            []

    };


    // ========================================================
    // EVENT SYSTEM
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
                    function (
                        item
                    ) {

                        return (
                            item !==
                            callback
                        );

                    }
                );

    }


    function emit(
        eventName,
        data = null
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

                        }
                        catch (
                            callbackError
                        ) {

                            console.error(
                                "[HalDo Boot] Event-Fehler:",
                                callbackError
                            );

                        }

                    }
                );

        }


        try {

            window.dispatchEvent(
                new CustomEvent(
                    "haldo:" +
                    eventName,
                    {
                        detail:
                            data
                    }
                )
            );

        }
        catch (
            eventError
        ) {

            console.warn(
                "[HalDo Boot] Browser Event konnte nicht gesendet werden:",
                eventError
            );

        }


        try {

            if (
                window.HalDoKernel &&
                typeof window.HalDoKernel.emit ===
                    "function"
            ) {

                window.HalDoKernel.emit(
                    "boot:" +
                    eventName,
                    data
                );

            }

        }
        catch (
            kernelError
        ) {

            console.warn(
                "[HalDo Boot] Kernel Event konnte nicht gesendet werden:",
                kernelError
            );

        }

    }


    // ========================================================
    // LOGGING
    // ========================================================

    function log(
        message,
        ...args
    ) {

        console.log(
            "[HalDo Boot]",
            message,
            ...args
        );

    }


    function warn(
        message,
        error = null
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
            "[HalDo Boot]",
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
        error = null
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


        state.failed =
            true;


        console.error(
            "[HalDo Boot]",
            message,
            error || ""
        );


        emit(
            "error",
            item
        );

    }


    // ========================================================
    // DOM HELPERS
    // ========================================================

    function get(
        id
    ) {

        return document.getElementById(
            id
        );

    }


    function exists(
        id
    ) {

        return Boolean(
            get(id)
        );

    }


    function safeText(
        id,
        text
    ) {

        const element =
            get(id);


        if (
            element
        ) {

            element.textContent =
                String(
                    text
                );

        }

    }


    // ========================================================
    // BOOT SCREEN
    // ========================================================

    function getBootScreen() {

        return (
            get("bootScreen") ||
            get("startupScreen")
        );

    }


    function getMainApp() {

        return (
            get("mainApp") ||
            get("desktop") ||
            get("app")
        );

    }


    function getProgressElement() {

        return (
            get("progressBar") ||
            document.querySelector(
                "[data-haldo-progress]"
            )
        );

    }


    // ========================================================
    // PROGRESS
    // ========================================================

    function updateProgress(
        progress,
        text
    ) {

        if (
            typeof progress ===
            "number"
        ) {

            state.progress =
                Math.max(
                    0,
                    Math.min(
                        100,
                        progress
                    )
                );

        }


        if (
            typeof text ===
            "string"
        ) {

            state.currentText =
                text;


            safeText(
                "bootStatus",
                text
            );


            safeText(
                "startupStatus",
                text
            );


            safeText(
                "bootMessage",
                text
            );


            safeText(
                "startupMessage",
                text
            );


            /*
             * Zusätzliche mögliche Status-Elemente.
             */

            const statusElements =
                document.querySelectorAll(
                    "[data-haldo-status]"
                );


            statusElements.forEach(
                function (
                    element
                ) {

                    element.textContent =
                        text;

                }
            );

        }


        const progressBar =
            getProgressElement();


        if (
            progressBar
        ) {

            progressBar.style.width =
                state.progress +
                "%";


            progressBar.setAttribute(
                "aria-valuenow",
                String(
                    state.progress
                )
            );

        }


        emit(
            "progress",
            {
                progress:
                    state.progress,

                text:
                    state.currentText
            }
        );

    }


    // ========================================================
    // LOGO FALLBACK
    // ========================================================

    function setupLogoFallback() {

        const logos =
            document.querySelectorAll(
                "img"
            );


        logos.forEach(
            function (
                logo
            ) {

                const source =
                    logo.getAttribute(
                        "src"
                    );


                if (
                    !source
                ) {

                    return;

                }


                const isHalDoLogo =
                    source.includes(
                        "logo.png"
                    ) ||
                    logo.classList.contains(
                        "boot-logo"
                    ) ||
                    logo.classList.contains(
                        "haldo-logo-image"
                    ) ||
                    logo.dataset.haldoLogo ===
                        "true";


                if (
                    !isHalDoLogo
                ) {

                    return;

                }


                logo.addEventListener(
                    "error",
                    function () {

                        if (
                            logo.dataset
                                .haldoFallbackUsed ===
                            "1"
                        ) {

                            warn(
                                "HalDo Logo konnte nicht geladen werden.",
                                source
                            );

                            return;

                        }


                        logo.dataset
                            .haldoFallbackUsed =
                            "1";


                        if (
                            source !==
                            CONFIG.logoFallback
                        ) {

                            logo.src =
                                CONFIG.logoFallback;

                        }

                    },
                    {
                        once:
                            false
                    }
                );

            }
        );

    }


    // ========================================================
    // STARTUP API
    // ========================================================

    function getStartup() {

        return (
            window.HalDoStartup ||
            (
                window.HalDoOS &&
                window.HalDoOS.startup
            ) ||
            null
        );

    }


    // ========================================================
    // STARTUP STATE CHECK
    // ========================================================

    function checkExistingStartupState() {

        const startup =
            getStartup();


        if (
            !startup
        ) {

            return false;

        }


        try {

            /*
             * Wichtig:
             * Falls Startup bereits fertig ist,
             * darf kein Event verloren gehen.
             */

            if (
                typeof startup.isReady ===
                "function" &&
                startup.isReady()
            ) {

                state.startupStarted =
                    true;

                state.startupReady =
                    true;

                updateProgress(
                    100,
                    CONFIG.readyText
                );

                finish();

                return true;

            }


            /*
             * Zusätzlich getState() prüfen.
             */

            if (
                typeof startup.getState ===
                "function"
            ) {

                const startupState =
                    startup.getState();


                if (
                    startupState &&
                    startupState.ready ===
                        true
                ) {

                    state.startupStarted =
                        true;

                    state.startupReady =
                        true;

                    updateProgress(
                        100,
                        CONFIG.readyText
                    );

                    finish();

                    return true;

                }


                if (
                    startupState &&
                    startupState.started ===
                        true
                ) {

                    state.startupStarted =
                        true;

                }

            }

        }
        catch (
            error
        ) {

            warn(
                "Startup-Zustand konnte nicht gelesen werden.",
                error
            );

        }


        return false;

    }


    // ========================================================
    // STARTUP EVENT CONNECTION
    // ========================================================

    function connectStartup() {

        const startup =
            getStartup();


        if (
            !startup
        ) {

            return false;

        }


        if (
            state.startupConnected
        ) {

            return true;

        }


        state.startupConnected =
            true;


        if (
            typeof startup.on ===
                "function"
        ) {

            try {

                startup.on(
                    "start",
                    function () {

                        state.startupStarted =
                            true;

                        updateProgress(
                            8,
                            CONFIG.initializingText
                        );

                    }
                );


                startup.on(
                    "stage-start",
                    function (
                        data
                    ) {

                        if (
                            !data
                        ) {

                            return;

                        }


                        const stage =
                            String(
                                data.name ||
                                data.id ||
                                ""
                            );


                        updateProgress(
                            getStageProgress(
                                data.id
                            ),
                            getStageText(
                                data.id,
                                stage
                            )
                        );

                    }
                );


                startup.on(
                    "stage-ready",
                    function (
                        data
                    ) {

                        if (
                            !data
                        ) {

                            return;

                        }


                        updateProgress(
                            getStageProgress(
                                data.id
                            ),
                            getStageReadyText(
                                data.id,
                                data.name
                            )
                        );

                    }
                );


                startup.on(
                    "warning",
                    function (
                        data
                    ) {

                        if (
                            data &&
                            data.message
                        ) {

                            emit(
                                "startup-warning",
                                data
                            );

                        }

                    }
                );


                startup.on(
                    "error",
                    function (
                        data
                    ) {

                        emit(
                            "startup-error",
                            data
                        );

                    }
                );


                startup.on(
                    "ready",
                    function (
                        data
                    ) {

                        state.startupReady =
                            true;


                        updateProgress(
                            100,
                            CONFIG.readyText
                        );


                        emit(
                            "startup-ready",
                            data
                        );


                        finish();

                    }
                );


                startup.on(
                    "failed",
                    function (
                        data
                    ) {

                        state.failed =
                            true;


                        emit(
                            "startup-failed",
                            data
                        );


                        warn(
                            "HalDo Startup wurde als fehlgeschlagen gemeldet.",
                            data
                        );

                    }
                );

            }
            catch (
                connectionError
            ) {

                warn(
                    "Startup Events konnten nicht vollständig verbunden werden.",
                    connectionError
                );

            }

        }


        /*
         * Direkt nach der Verbindung prüfen.
         */

        checkExistingStartupState();


        return true;

    }


    // ========================================================
    // STARTUP SUCHEN
    // ========================================================

    function waitForStartup() {

        if (
            state.finished
        ) {

            return;

        }


        if (
            checkExistingStartupState()
        ) {

            return;

        }


        const startup =
            getStartup();


        if (
            startup
        ) {

            connectStartup();


            if (
                checkExistingStartupState()
            ) {

                return;

            }


            startStartupSystem();

            return;

        }


        state.startupChecks++;


        if (
            state.startupChecks >=
            CONFIG.startupCheckLimit
        ) {

            fail(
                "HalDoStartup wurde nicht rechtzeitig gefunden."
            );

            return;

        }


        window.setTimeout(
            waitForStartup,
            CONFIG.startupCheckDelay
        );

    }


    // ========================================================
    // STAGE PROGRESS
    // ========================================================

    function getStageProgress(
        id
    ) {

        const values = {

            environment:
                12,

            loader:
                24,

            kernel:
                36,

            system:
                48,

            modules:
                60,

            ai:
                72,

            apps:
                82,

            visual:
                92,

            ready:
                100

        };


        return (
            values[id] ??
            state.progress
        );

    }


    // ========================================================
    // STAGE TEXT
    // ========================================================

    function getStageText(
        id,
        fallback
    ) {

        const texts = {

            environment:
                CONFIG.initializingText,

            loader:
                "HalDo System Loader wird verbunden ...",

            kernel:
                "HalDo Kernel wird gestartet ...",

            system:
                "HalDo System wird initialisiert ...",

            modules:
                "HalDo Systemmodule werden verbunden ...",

            ai:
                "HalDo AI Core wird vorbereitet ...",

            apps:
                "HalDo Apps werden vorbereitet ...",

            visual:
                "HalDo Benutzeroberfläche wird vorbereitet ...",

            ready:
                CONFIG.readyText

        };


        return (
            texts[id] ||
            fallback ||
            CONFIG.initializingText
        );

    }


    // ========================================================
    // STAGE READY TEXT
    // ========================================================

    function getStageReadyText(
        id,
        fallback
    ) {

        const texts = {

            environment:
                "Umgebung bereit ...",

            loader:
                "System Loader bereit ...",

            kernel:
                "Kernel bereit ...",

            system:
                "System bereit ...",

            modules:
                "Systemmodule verbunden ...",

            ai:
                "HalDo AI bereit ...",

            apps:
                "App-System bereit ...",

            visual:
                "Visual-System bereit ...",

            ready:
                CONFIG.readyText

        };


        return (
            texts[id] ||
            fallback ||
            state.currentText
        );

    }


    // ========================================================
    // STARTUP STARTEN
    // ========================================================

    function startStartupSystem() {

        const startup =
            getStartup();


        if (
            !startup
        ) {

            return false;

        }


        try {

            /*
             * Wenn Startup bereits läuft,
             * niemals nochmals starten.
             */

            if (
                typeof startup.isStarted ===
                    "function" &&
                startup.isStarted()
            ) {

                state.startupStarted =
                    true;

                return true;

            }


            if (
                typeof startup.getState ===
                    "function"
            ) {

                const startupState =
                    startup.getState();


                if (
                    startupState &&
                    startupState.started
                ) {

                    state.startupStarted =
                        true;

                    return true;

                }

            }


            if (
                typeof startup.start ===
                    "function"
            ) {

                state.startupStarted =
                    true;

                const result =
                    startup.start();


                emit(
                    "startup-start",
                    result
                );


                return true;

            }

        }
        catch (
            startupError
        ) {

            fail(
                "HalDoStartup konnte nicht gestartet werden.",
                startupError
            );


            return false;

        }


        return false;

    }


    // ========================================================
    // FINISH
    // ========================================================

    function finish() {

        if (
            state.finished
        ) {

            return;

        }


        state.finished =
            true;


        state.startupReady =
            true;


        updateProgress(
            100,
            CONFIG.readyText
        );


        emit(
            "ready",
            getState()
        );


        window.setTimeout(
            function () {

                const bootScreen =
                    getBootScreen();


                const mainApp =
                    getMainApp();


                if (
                    bootScreen
                ) {

                    bootScreen.classList.add(
                        "hide"
                    );

                    bootScreen.classList.add(
                        "hidden"
                    );

                    bootScreen.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                }


                if (
                    mainApp
                ) {

                    mainApp.classList.add(
                        "visible"
                    );

                    mainApp.classList.remove(
                        "hidden"
                    );

                    mainApp.removeAttribute(
                        "aria-hidden"
                    );

                }


                document.body.classList.add(
                    "haldo-system-ready"
                );


                emit(
                    "complete",
                    getState()
                );


                log(
                    "HalDo AI OS 18 vollständig gestartet."
                );

            },
            CONFIG.transitionDelay
        );

    }


    // ========================================================
    // NETWORK
    // ========================================================

    function setupNetworkEvents() {

        window.addEventListener(
            "online",
            function () {

                state.online =
                    true;


                emit(
                    "online"
                );


                log(
                    "HalDo AI OS ist online."
                );

            }
        );


        window.addEventListener(
            "offline",
            function () {

                state.online =
                    false;


                emit(
                    "offline"
                );


                warn(
                    "HalDo AI OS arbeitet offline."
                );

            }
        );

    }


    // ========================================================
    // STATE
    // ========================================================

    function getState() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            initialized:
                state.initialized,

            started:
                state.started,

            finished:
                state.finished,

            progress:
                state.progress,

            currentText:
                state.currentText,

            online:
                state.online,

            startupConnected:
                state.startupConnected,

            startupStarted:
                state.startupStarted,

            startupReady:
                state.startupReady,

            failed:
                state.failed,

            startupChecks:
                state.startupChecks,

            errors:
                state.errors.slice(),

            warnings:
                state.warnings.slice()

        };

    }


    // ========================================================
    // START
    // ========================================================

    function start() {

        if (
            state.started
        ) {

            return getState();

        }


        state.started =
            true;


        state.initialized =
            true;


        state.failed =
            false;


        updateProgress(
            4,
            CONFIG.initialText
        );


        emit(
            "start",
            {
                version:
                    CONFIG.version
            }
        );


        setupLogoFallback();


        /*
         * Startup zuerst verbinden.
         */

        connectStartup();


        /*
         * Falls Startup noch nicht registriert
         * wurde, kurz darauf erneut suchen.
         */

        window.setTimeout(
            function () {

                if (
                    state.finished
                ) {

                    return;

                }


                updateProgress(
                    8,
                    CONFIG.initializingText
                );


                waitForStartup();

            },
            120
        );


        return getState();

    }


    // ========================================================
    // PUBLIC API
    // ========================================================

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,

        init:
            start,

        start:
            start,

        finish:
            finish,

        on:
            on,

        off:
            off,

        emit:
            emit,

        updateProgress:
            updateProgress,

        getState:
            getState,

        getStartup:
            getStartup,

        checkStartup:
            checkExistingStartupState

    };


    // ========================================================
    // GLOBAL REGISTRATION
    // ========================================================

    window.HalDoBoot =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.boot =
        api;


    // ========================================================
    // DOM INIT
    // ========================================================

    function init() {

        if (
            state.initialized
        ) {

            return;

        }


        setupNetworkEvents();


        if (
            exists("bootScreen") ||
            exists("startupScreen")
        ) {

            start();

        }
        else {

            state.initialized =
                true;


            emit(
                "no-screen"
            );


            log(
                "Kein sichtbarer Boot Screen gefunden."
            );

        }

    }


    // ========================================================
    // DOM READY
    // ========================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once:
                    true
            }
        );

    }
    else {

        init();

    }


    // ========================================================
    // ABSCHLUSS
    // ========================================================

    log(
        "HalDo Boot System registriert.",
        CONFIG.version
    );


})(window, document);