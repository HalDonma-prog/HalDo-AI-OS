/*
========================================================
HalDo AI OS 18
PROFESSIONAL ULTIMATE FOUNDATION
BOOT SYSTEM
Version 18.0.0

DATEI:
js/boot.js

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
NICHT mehr direkt.

Die eigentliche Systeminitialisierung übernimmt:
js/startup.js

Dadurch verhindern wir doppelte Starts.

Das HalDo Logo bleibt ein echtes Bild:
logo.png
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
            "HalDo AI OS 18 wird initialisiert ...",

        readyText:
            "HalDo AI OS 18 ist bereit.",

        transitionDelay:
            650

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

        startupReady:
            false,

        failed:
            false,

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


        /*
         * Browser Event Bridge
         */

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


        /*
         * Kernel Event Bridge
         */

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

        return get(
            "mainApp"
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
    // LOGO
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


                /*
                 * Nur HalDo Logos behandeln.
                 */

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
    // STARTUP EVENT CONNECTION
    // ========================================================

    function connectStartup() {

        const startup =
            getStartup();


        if (
            !startup
        ) {

            warn(
                "HalDoStartup ist momentan noch nicht verfügbar."
            );

            return false;

        }


        state.startupConnected =
            true;


        /*
         * Falls Startup eigenes Event-System besitzt.
         */

        if (
            typeof startup.on ===
                "function"
        ) {

            try {

                startup.on(
                    "start",
                    function () {

                        updateProgress(
                            8,
                            "HalDo AI OS 18 wird initialisiert ..."
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


        return true;

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
                "HalDo AI OS 18 wird initialisiert ...",

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
            CONFIG.initialText
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

            warn(
                "HalDoStartup wurde noch nicht gefunden."
            );

            return false;

        }


        try {

            if (
                typeof startup.start ===
                    "function"
            ) {

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

            startupReady:
                state.startupReady,

            failed:
                state.failed,

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
         * Startup-Verbindung herstellen.
         */

        connectStartup();


        /*
         * Startup-System starten.
         *
         * Die eigentliche Initialisierung
         * erfolgt ausschließlich dort.
         */

        window.setTimeout(
            function () {

                if (
                    state.finished
                ) {

                    return;

                }


                startStartupSystem();

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
            getState

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


        /*
         * Nur aktiv werden,
         * wenn ein Boot-System vorhanden ist.
         */

        if (
            exists("bootScreen") ||
            exists("startupScreen")
        ) {

            start();

        }
        else {

            /*
             * Auch ohne sichtbaren Boot Screen
             * bleibt das Boot-System registriert.
             */

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