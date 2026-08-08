/*
========================================================

HalDo AI OS 18
HalDo Light System

Professional Ultimate Foundation
Version 18.0.0

Funktionen:
- dauerhaftes Leuchten
- dauerhaft rotierende Lichtbahnen
- Logo bleibt still
- automatische Logo-Pfad-Prüfung
- Idle
- Listening
- Thinking
- Answering
- Speaking
- Intensitätssteuerung
- Geschwindigkeitsteuerung
- Events für andere HalDo-Systeme

========================================================
*/

(function (window, document) {

    "use strict";


    const HalDoLight = {

        name:
            "HalDo Light System",

        version:
            "18.0.0",

        status:
            "ready",

        mode:
            "idle",

        enabled:
            true,

        intensity:
            1,

        speed:
            1,


        /* ==================================================
           MODI
           ================================================== */

        modes: {

            idle: {
                intensity: 1,
                speed: 1,
                glow: 1
            },

            listening: {
                intensity: 1.35,
                speed: 1.35,
                glow: 1.25
            },

            thinking: {
                intensity: 1.55,
                speed: 1.8,
                glow: 1.5
            },

            answering: {
                intensity: 1.75,
                speed: 2,
                glow: 1.7
            },

            speaking: {
                intensity: 1.9,
                speed: 1.6,
                glow: 1.9
            }

        },


        /* ==================================================
           INITIALISIERUNG
           ================================================== */

        init: function () {

            this.status =
                "running";

            this.findLogos();

            this.ensureLightSystem();

            this.applyMode();

            console.log(
                "HalDo Light System gestartet."
            );

            this.dispatch(
                "ready"
            );

        },


        /* ==================================================
           LOGO FINDEN
           
           Unterstützt beide von dir genannten Pfade:
           
           assets/logo/logo.png
           logo.png
           ================================================== */

        findLogos: function () {

            const logos =
                document.querySelectorAll(
                    "img.haldo-startup-logo, " +
                    "img.haldo-logo, " +
                    "img.logo"
                );

            logos.forEach(
                (logo) => {

                    this.prepareLogo(
                        logo
                    );

                }
            );

        },


        /* ==================================================
           LOGO VORBEREITEN
           ================================================== */

        prepareLogo: function (
            logo
        ) {

            if (
                !logo
            ) {

                return;

            }


            logo.dataset.originalSrc =
                logo.getAttribute(
                    "src"
                ) || "";


            /*
             * Falls assets/logo/logo.png
             * nicht geladen werden kann,
             * wird automatisch logo.png
             * versucht.
             */

            logo.addEventListener(
                "error",
                function () {

                    if (
                        logo.dataset.fallbackUsed
                    ) {

                        return;

                    }


                    logo.dataset.fallbackUsed =
                        "true";


                    logo.src =
                        "logo.png";

                },
                {
                    once:
                        true
                }
            );


            /*
             * Das Logo selbst wird niemals
             * durch das Light-System gedreht.
             */

            logo.style.animation =
                "none";

            logo.style.transform =
                "none";

        },


        /* ==================================================
           LICHTSYSTEM ERSTELLEN
           ================================================== */

        ensureLightSystem: function () {

            const containers =
                document.querySelectorAll(
                    ".haldo-sun-container"
                );


            containers.forEach(
                (container) => {

                    this.prepareContainer(
                        container
                    );

                }
            );

        },


        /* ==================================================
           CONTAINER VORBEREITEN
           ================================================== */

        prepareContainer: function (
            container
        ) {

            if (
                !container
            ) {

                return;

            }


            container.classList.add(
                "haldo-light-active"
            );


            /*
             * Permanente Animation.
             */

            container.style.setProperty(
                "--haldo-light-running",
                "running"
            );


            /*
             * Logo ausdrücklich
             * von der Rotation ausschließen.
             */

            const logo =
                container.querySelector(
                    "img"
                );


            if (
                logo
            ) {

                logo.style.animation =
                    "none";

                logo.style.transform =
                    "none";

            }

        },


        /* ==================================================
           MODUS SETZEN
           ================================================== */

        setMode: function (
            mode
        ) {

            if (
                !this.enabled
            ) {

                return;

            }


            if (
                !this.modes[mode]
            ) {

                mode =
                    "idle";

            }


            this.mode =
                mode;


            const settings =
                this.modes[mode];


            this.intensity =
                settings.intensity;


            this.speed =
                settings.speed;


            this.applyMode();


            this.dispatch(
                "mode",
                {
                    mode:
                        mode,

                    intensity:
                        this.intensity,

                    speed:
                        this.speed

                }
            );


        },


        /* ==================================================
           MODUS ANWENDEN
           ================================================== */

        applyMode: function () {

            const containers =
                document.querySelectorAll(
                    ".haldo-sun-container"
                );


            const settings =
                this.modes[
                    this.mode
                ] ||
                this.modes.idle;


            containers.forEach(
                (container) => {

                    container.classList
                        .remove(
                            "haldo-mode-idle",
                            "haldo-mode-listening",
                            "haldo-mode-thinking",
                            "haldo-mode-answering",
                            "haldo-mode-speaking"
                        );


                    container.classList.add(
                        "haldo-mode-" +
                        this.mode
                    );


                    container.style.setProperty(
                        "--haldo-intensity",
                        String(
                            settings.intensity
                        )
                    );


                    container.style.setProperty(
                        "--haldo-speed",
                        String(
                            settings.speed
                        )
                    );


                    container.style.setProperty(
                        "--haldo-glow",
                        String(
                            settings.glow
                        )
                    );


                    /*
                     * WICHTIG:
                     * Animation bleibt immer aktiv.
                     */

                    container.style.setProperty(
                        "--haldo-animation-play-state",
                        "running"
                    );

                }
            );

        },


        /* ==================================================
           VOREINGESTELLTE MODI
           ================================================== */

        idle: function () {

            this.setMode(
                "idle"
            );

        },


        listening: function () {

            this.setMode(
                "listening"
            );

        },


        thinking: function () {

            this.setMode(
                "thinking"
            );

        },


        answering: function () {

            this.setMode(
                "answering"
            );

        },


        speaking: function () {

            this.setMode(
                "speaking"
            );

        },


        /* ==================================================
           EIN / AUS
           ================================================== */

        enable: function () {

            this.enabled =
                true;

            this.ensureLightSystem();

            this.applyMode();

        },


        disable: function () {

            /*
             * Das System wird nicht dauerhaft
             * zerstört. Beim nächsten enable()
             * läuft die Animation wieder.
             */

            this.enabled =
                false;

            const containers =
                document.querySelectorAll(
                    ".haldo-sun-container"
                );


            containers.forEach(
                (container) => {

                    container.classList.add(
                        "haldo-light-disabled"
                    );

                }
            );

        },


        /* ==================================================
           STATUS
           ================================================== */

        getStatus: function () {

            return {

                name:
                    this.name,

                version:
                    this.version,

                status:
                    this.status,

                enabled:
                    this.enabled,

                mode:
                    this.mode,

                intensity:
                    this.intensity,

                speed:
                    this.speed

            };

        },


        /* ==================================================
           EVENTS
           ================================================== */

        dispatch: function (
            name,
            detail
        ) {

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        "haldo-light-" +
                        name,
                        {
                            detail:
                                detail || {}
                        }
                    )
                );

            } catch (
                error
            ) {

                console.warn(
                    "HalDo Light Event Fehler:",
                    error
                );

            }

        }

    };


    /* ======================================================
       GLOBAL
       ====================================================== */

    window.HalDoLight =
        HalDoLight;


    /* ======================================================
       START
       ====================================================== */

    function startLightSystem() {

        HalDoLight.init();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startLightSystem,
            {
                once:
                    true
            }
        );

    } else {

        startLightSystem();

    }


})(window, document);