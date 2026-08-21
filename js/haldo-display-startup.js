/*
 * ============================================================
 * HALDO AI OS 20
 * DISPLAY STARTUP BRIDGE
 * ============================================================
 *
 * Datei:
 * js/haldo-display-startup.js
 *
 * Aufgabe:
 *   Verbindet die Display-Startkette:
 *
 *   index.html
 *       ↓
 *   Display System
 *       ↓
 *   Boot Bridge
 *       ↓
 *   Display Loader
 *       ↓
 *   HalDo OS
 *
 * Dieses Modul zerstört keine bestehenden Systeme.
 * ============================================================
 */

(function (window, document) {

    "use strict";

    const STARTUP = {

        name: "HalDo Display Startup",
        version: "20.0.0",

        started: false,
        completed: false,

        startedAt: null,
        completedAt: null,

        error: null

    };


    /* ========================================================
       LOG
    ======================================================== */

    function log() {

        try {

            console.info(
                "[HalDo Display Startup]",
                ...arguments
            );

        } catch (error) {
            // Logging darf niemals den Start blockieren.
        }

    }


    /* ========================================================
       WAIT FOR OBJECT
    ======================================================== */

    function waitForObject(
        getter,
        timeout,
        interval
    ) {

        timeout =
            Number(timeout) || 10000;

        interval =
            Number(interval) || 50;

        return new Promise(function (resolve) {

            const start =
                Date.now();

            function check() {

                let value = null;

                try {
                    value = getter();
                } catch (error) {
                    value = null;
                }

                if (value) {

                    resolve(value);
                    return;

                }

                if (
                    Date.now() - start >=
                    timeout
                ) {

                    resolve(null);
                    return;

                }

                window.setTimeout(
                    check,
                    interval
                );

            }

            check();

        });

    }


    /* ========================================================
       DISPLAY SYSTEM
    ======================================================== */

    async function connectDisplaySystem() {

        const displaySystem =
            await waitForObject(
                function () {

                    return (
                        window.HalDoDisplaySystem ||
                        (
                            window.HalDoOS &&
                            window.HalDoOS.display
                        ) ||
                        null
                    );

                },
                10000,
                50
            );


        if (!displaySystem) {

            log(
                "Display System noch nicht verfügbar."
            );

            return null;

        }


        log(
            "Display System verbunden."
        );


        try {

            if (
                typeof displaySystem.init ===
                "function"
            ) {

                await displaySystem.init();

            }

        } catch (error) {

            log(
                "Display System init warning:",
                error
            );

        }


        return displaySystem;

    }


    /* ========================================================
       BOOT BRIDGE
    ======================================================== */

    async function connectBootBridge() {

        const bridge =
            await waitForObject(
                function () {

                    return (
                        window.HalDoDisplayBootBridge ||
                        (
                            window.HalDoOS &&
                            window.HalDoOS.displayBootBridge
                        ) ||
                        null
                    );

                },
                10000,
                50
            );


        if (!bridge) {

            log(
                "Display Boot Bridge noch nicht verfügbar."
            );

            return null;

        }


        log(
            "Display Boot Bridge verbunden."
        );


        try {

            if (
                typeof bridge.init ===
                "function"
            ) {

                await bridge.init();

            }

        } catch (error) {

            log(
                "Display Boot Bridge init warning:",
                error
            );

        }


        return bridge;

    }


    /* ========================================================
       DISPLAY LOADER
    ======================================================== */

    async function connectLoader() {

        const loader =
            await waitForObject(
                function () {

                    return (
                        window.HalDoDisplayLoader ||
                        (
                            window.HalDoOS &&
                            window.HalDoOS.displayLoader
                        ) ||
                        null
                    );

                },
                10000,
                50
            );


        if (!loader) {

            log(
                "Display Loader noch nicht verfügbar."
            );

            return null;

        }


        log(
            "Display Loader verbunden."
        );


        return loader;

    }


    /* ========================================================
       START
    ======================================================== */

    async function start() {

        if (STARTUP.started) {

            return STARTUP;

        }


        STARTUP.started = true;
        STARTUP.startedAt = Date.now();


        log(
            "Display-Startkette beginnt."
        );


        try {

            const display =
                await connectDisplaySystem();

            const bridge =
                await connectBootBridge();

            const loader =
                await connectLoader();


            /*
             * Loader starten, falls er eine
             * Startfunktion besitzt.
             */

            if (loader) {

                const startFunction =
                    loader.start ||
                    loader.boot ||
                    loader.load ||
                    loader.initialize;


                if (
                    typeof startFunction ===
                    "function"
                ) {

                    try {

                        await startFunction.call(
                            loader
                        );

                        log(
                            "Display Loader gestartet."
                        );

                    } catch (error) {

                        log(
                            "Loader Start warning:",
                            error
                        );

                    }

                }

            }


            STARTUP.completed = true;
            STARTUP.completedAt = Date.now();


            log(
                "Display-Startkette abgeschlossen."
            );


            /*
             * Globaler Status
             */

            window.HalDoDisplayStartup =
                STARTUP;


            if (
                window.HalDoOS &&
                typeof window.HalDoOS === "object"
            ) {

                window.HalDoOS.displayStartup =
                    STARTUP;

            }


            /*
             * Event
             */

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        "haldo:display-startup-ready",
                        {
                            detail: STARTUP
                        }
                    )
                );

            } catch (error) {
                // Event darf Start nicht blockieren.
            }


        } catch (error) {

            STARTUP.error = error;

            log(
                "Display-Startkette Fehler:",
                error
            );

        }


        return STARTUP;

    }


    /* ========================================================
       PUBLIC API
    ======================================================== */

    STARTUP.start = start;

    STARTUP.getStatus = function () {

        return {

            name:
                STARTUP.name,

            version:
                STARTUP.version,

            started:
                STARTUP.started,

            completed:
                STARTUP.completed,

            startedAt:
                STARTUP.startedAt,

            completedAt:
                STARTUP.completedAt,

            error:
                STARTUP.error

        };

    };


    window.HalDoDisplayStartup =
        STARTUP;


    if (
        window.HalDoOS &&
        typeof window.HalDoOS === "object"
    ) {

        window.HalDoOS.displayStartup =
            STARTUP;

    }


    /* ========================================================
       DOM READY
    ======================================================== */

    function boot() {

        window.setTimeout(
            function () {

                start();

            },
            0
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot,
            {
                once: true
            }
        );

    } else {

        boot();

    }


    log(
        "Display Startup Bridge geladen."
    );


})(window, document);
