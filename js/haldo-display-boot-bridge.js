/*
 * ============================================================
 * HALDO AI OS 20
 * DISPLAY BOOT BRIDGE
 * ============================================================
 *
 * Datei:
 * js/haldo-display-boot-bridge.js
 *
 * Aufgabe:
 * Verbindet Boot, Kernel, System, Display und V20 Runtime.
 *
 * ============================================================
 */

(function (window, document) {

    "use strict";


    /* ========================================================
       NAMESPACES
    ======================================================== */

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};

    const V20 =
        window.HalDoV20 =
        window.HalDoV20 || {};


    /* ========================================================
       BRIDGE
    ======================================================== */

    const Bridge = {

        name:
            "HalDo V20 Display Boot Bridge",

        version:
            "20.0.0",

        initialized:
            false,

        bootCompleted:
            false,

        displayReady:
            false,

        systemReady:
            false,

        runtimeReady:
            false,

        listeners:
            [],

        startedAt:
            null,

        completedAt:
            null

    };


    /* ========================================================
       LOG
    ======================================================== */

    function log() {

        try {

            console.info(
                "[HalDo Display Bridge]",
                ...arguments
            );

        } catch (error) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo Display Bridge]",
                ...arguments
            );

        } catch (error) {}

    }


    /* ========================================================
       EMIT
    ======================================================== */

    Bridge.emit =
        function (
            event,
            detail
        ) {

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        "haldo:display-bridge:" + event,
                        {
                            detail:
                                detail || {}
                        }
                    )
                );

            } catch (error) {

                warn(
                    "Event konnte nicht gesendet werden.",
                    error
                );

            }

        };


    /* ========================================================
       FIND DISPLAY
    ======================================================== */

    Bridge.getDisplay =
        function () {

            return (
                window.HalDoDisplay
                ||
                HalDoOS.display
                ||
                V20.display
                ||
                null
            );

        };


    /* ========================================================
       FIND KERNEL
    ======================================================== */

    Bridge.getKernel =
        function () {

            return (
                window.HalDoKernel
                ||
                (
                    HalDoOS &&
                    HalDoOS.kernel
                )
                ||
                null
            );

        };


    /* ========================================================
       FIND SYSTEM
    ======================================================== */

    Bridge.getSystem =
        function () {

            return (
                window.HalDoSystem
                ||
                HalDoOS.system
                ||
                null
            );

        };


    /* ========================================================
       FIND RUNTIME
    ======================================================== */

    Bridge.getRuntime =
        function () {

            return (
                V20.runtime
                ||
                window.HalDoV20Runtime
                ||
                HalDoOS.runtime
                ||
                null
            );

        };


    /* ========================================================
       DISPLAY START
    ======================================================== */

    Bridge.startDisplay =
        function () {

            const display =
                Bridge.getDisplay();


            if (!display) {

                warn(
                    "Display System noch nicht verfügbar."
                );

                return false;

            }


            try {

                if (
                    typeof display.init ===
                    "function"
                ) {

                    display.init();

                }


                if (
                    typeof display.show ===
                    "function"
                ) {

                    display.show();

                }


                Bridge.displayReady =
                    true;


                Bridge.emit(
                    "display-ready",
                    display.getStatus
                        ? display.getStatus()
                        : {}
                );


                return true;

            } catch (error) {

                warn(
                    "Display konnte nicht gestartet werden.",
                    error
                );

                return false;

            }

        };


    /* ========================================================
       SYSTEM CHECK
    ======================================================== */

    Bridge.checkSystem =
        function () {

            const system =
                Bridge.getSystem();


            if (!system) {

                return false;

            }


            Bridge.systemReady =
                (
                    system.ready === true
                    ||
                    system.initialized === true
                    ||
                    system.status === "ready"
                );


            return Bridge.systemReady;

        };


    /* ========================================================
       RUNTIME CHECK
    ======================================================== */

    Bridge.checkRuntime =
        function () {

            const runtime =
                Bridge.getRuntime();


            if (!runtime) {

                return false;

            }


            Bridge.runtimeReady =
                (
                    runtime.ready === true
                    ||
                    runtime.initialized === true
                );


            return Bridge.runtimeReady;

        };


    /* ========================================================
       REMOVE BOOT OVERLAY
    ======================================================== */

    Bridge.removeBootOverlay =
        function () {

            const selectors = [

                "#haldo-boot-screen",

                "#haldo-boot",

                "#boot-screen",

                ".haldo-boot-screen",

                ".haldo-boot",

                "[data-haldo-boot]",

                "[data-haldo-boot-screen]"

            ];


            selectors.forEach(
                function (selector) {

                    try {

                        const elements =
                            document.querySelectorAll(
                                selector
                            );


                        elements.forEach(
                            function (element) {

                                /*
                                 * Nur ausblenden.
                                 *
                                 * Nicht löschen,
                                 * damit bestehende Boot-Logik
                                 * nicht beschädigt wird.
                                 */

                                element.style.opacity =
                                    "0";

                                element.style.pointerEvents =
                                    "none";

                                element.style.visibility =
                                    "hidden";

                                element.setAttribute(
                                    "data-haldo-boot-finished",
                                    "true"
                                );

                            }
                        );

                    } catch (error) {}

                }
            );

        };


    /* ========================================================
       SHOW DISPLAY
    ======================================================== */

    Bridge.revealDisplay =
        function () {

            const display =
                Bridge.getDisplay();


            if (
                display &&
                typeof display.show ===
                "function"
            ) {

                try {

                    display.show();

                } catch (error) {

                    warn(
                        "Display.show() fehlgeschlagen.",
                        error
                    );

                }

            }


            const workspace =
                document.getElementById(
                    "haldo-v20-workspace"
                );


            if (workspace) {

                workspace.style.display =
                    "block";

                workspace.style.visibility =
                    "visible";

                workspace.style.opacity =
                    "1";

            }


            Bridge.removeBootOverlay();


            Bridge.bootCompleted =
                true;

            Bridge.completedAt =
                Date.now();


            Bridge.emit(
                "boot-complete",
                Bridge.getStatus()
            );


            log(
                "Display sichtbar.",
                Bridge.getStatus()
            );

        };


    /* ========================================================
       KERNEL EVENTS
    ======================================================== */

    Bridge.connectKernel =
        function () {

            const kernel =
                Bridge.getKernel();


            if (!kernel) {

                return;

            }


            if (
                typeof kernel.on !==
                "function"
            ) {

                return;

            }


            try {

                kernel.on(
                    "kernel:ready",
                    function () {

                        log(
                            "Kernel ready."
                        );

                        Bridge.startDisplay();

                    }
                );


                kernel.on(
                    "system:ready",
                    function () {

                        Bridge.systemReady =
                            true;

                        Bridge.startDisplay();

                    }
                );


                kernel.on(
                    "v20:runtime:ready",
                    function () {

                        Bridge.runtimeReady =
                            true;

                        Bridge.startDisplay();

                    }
                );


                kernel.on(
                    "v20:app-manifest:ready",
                    function () {

                        log(
                            "V20 App Manifest ready."
                        );

                        Bridge.startDisplay();

                    }
                );


            } catch (error) {

                warn(
                    "Kernel-Verbindung fehlgeschlagen.",
                    error
                );

            }

        };


    /* ========================================================
       DOM EVENTS
    ======================================================== */

    Bridge.connectDOM =
        function () {

            const events = [

                "haldo:v20:display-ready",

                "haldo:v20:system-ready",

                "haldo:v20:runtime-ready",

                "haldo:v20:app-manifest-ready",

                "haldo:v20:boot-complete"

            ];


            events.forEach(
                function (eventName) {

                    try {

                        window.addEventListener(
                            eventName,
                            function () {

                                Bridge.startDisplay();

                            }
                        );

                    } catch (error) {}

                }
            );

        };


    /* ========================================================
       SAFETY FALLBACK
    ======================================================== */

    Bridge.startFallback =
        function () {

            /*
             * Falls ein anderer Boot-Manager
             * seine Events nicht sendet,
             * versuchen wir nach kurzer Zeit
             * das Display trotzdem sichtbar
             * zu machen.
             */

            window.setTimeout(
                function () {

                    if (
                        !Bridge.bootCompleted
                    ) {

                        log(
                            "Display-Sicherheitsstart."
                        );

                        Bridge.startDisplay();

                        Bridge.revealDisplay();

                    }

                },
                1200
            );

        };


    /* ========================================================
       INITIALIZE
    ======================================================== */

    Bridge.init =
        function () {

            if (
                Bridge.initialized
            ) {

                return Bridge;

            }


            Bridge.startedAt =
                Date.now();


            Bridge.connectKernel();

            Bridge.connectDOM();

            Bridge.checkSystem();

            Bridge.checkRuntime();

            Bridge.startDisplay();

            Bridge.startFallback();


            Bridge.initialized =
                true;


            Bridge.emit(
                "initialized",
                Bridge.getStatus()
            );


            log(
                "Display Boot Bridge initialisiert."
            );


            return Bridge;

        };


    /* ========================================================
       STATUS
    ======================================================== */

    Bridge.getStatus =
        function () {

            return {

                name:
                    Bridge.name,

                version:
                    Bridge.version,

                initialized:
                    Bridge.initialized,

                bootCompleted:
                    Bridge.bootCompleted,

                displayReady:
                    Bridge.displayReady,

                systemReady:
                    Bridge.systemReady,

                runtimeReady:
                    Bridge.runtimeReady,

                startedAt:
                    Bridge.startedAt,

                completedAt:
                    Bridge.completedAt,

                timestamp:
                    Date.now()

            };

        };


    /* ========================================================
       GLOBAL API
    ======================================================== */

    window.HalDoDisplayBootBridge =
        Bridge;

    HalDoOS.displayBootBridge =
        Bridge;

    V20.displayBootBridge =
        Bridge;


    /* ========================================================
       START
    ======================================================== */

    function start() {

        try {

            Bridge.init();

        } catch (error) {

            console.error(
                "[HalDo Display Bridge] Fatal initialization error:",
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
            start,
            {
                once: true
            }
        );

    } else {

        start();

    }


    /* ========================================================
       FINAL EVENT
    ======================================================== */

    try {

        window.dispatchEvent(
            new CustomEvent(
                "haldo:v20:display-boot-bridge-ready",
                {
                    detail:
                        Bridge.getStatus()
                }
            )
        );

    } catch (error) {

        warn(
            "Final event konnte nicht gesendet werden.",
            error
        );

    }


    log(
        "HalDo V20 Display Boot Bridge geladen."
    );


})(window, document);
