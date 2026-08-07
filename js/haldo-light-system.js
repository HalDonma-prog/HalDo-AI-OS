/* ==========================================================
   HalDo AI OS 18
   HALDO LIGHT SYSTEM
   Professional Ultimate Foundation
   ==========================================================

   Aufgabe:
   - Lichtanimation dauerhaft steuern
   - Logo selbst NICHT drehen
   - Lichtkränze außen herum steuern
   - Helligkeit und Geschwindigkeit kontrollieren
   - AI-Zustände darstellen
   - Vorbereitung für Chat / Voice / Speech / Settings

   Zustände:
   idle
   listening
   input
   thinking
   answering
   speaking
   success
   error
   ========================================================== */

(function (window, document) {

    "use strict";


    /* ======================================================
       SYSTEM
       ====================================================== */

    const HalDoLight = {

        enabled: true,

        speed: 1,

        brightness: 1,

        state: "idle",

        initialized: false,

        container: null,

        outerOrbit: null,

        middleOrbit: null,

        raysOne: null,

        raysTwo: null,

        sparks: [],


        /* ==================================================
           INITIALISIERUNG
           ================================================== */

        init: function () {

            if (this.initialized) {

                return this;

            }


            this.container =
                document.querySelector(
                    ".haldo-sun-container"
                );


            if (!this.container) {

                console.warn(
                    "HalDo Light System: Sun Container nicht gefunden."
                );

                return this;

            }


            this.outerOrbit =
                document.querySelector(
                    ".orbit-outer"
                );


            this.middleOrbit =
                document.querySelector(
                    ".orbit-middle"
                );


            this.raysOne =
                document.querySelector(
                    ".rays-one"
                );


            this.raysTwo =
                document.querySelector(
                    ".rays-two"
                );


            this.sparks =
                Array.from(
                    document.querySelectorAll(
                        ".haldo-spark"
                    )
                );


            this.initialized = true;


            this.applySettings();


            this.setState("idle");


            console.log(
                "🟢 HalDo Light System bereit."
            );


            return this;

        },


        /* ==================================================
           EIN / AUS
           ================================================== */

        setEnabled: function (enabled) {

            this.enabled =
                Boolean(enabled);


            if (!this.container) {

                return;

            }


            if (this.enabled) {

                this.container.classList.remove(
                    "haldo-light-disabled"
                );

                this.applySettings();

                this.setState(
                    this.state
                );

            } else {

                this.container.classList.add(
                    "haldo-light-disabled"
                );

            }

        },


        /* ==================================================
           GESCHWINDIGKEIT
           ================================================== */

        setSpeed: function (value) {

            let speed =
                Number(value);


            if (!Number.isFinite(speed)) {

                speed = 1;

            }


            speed =
                Math.max(
                    0.1,
                    Math.min(
                        5,
                        speed
                    )
                );


            this.speed =
                speed;


            this.applySpeed();

        },


        /* ==================================================
           HELLIGKEIT
           ================================================== */

        setBrightness: function (value) {

            let brightness =
                Number(value);


            if (!Number.isFinite(brightness)) {

                brightness = 1;

            }


            brightness =
                Math.max(
                    0,
                    Math.min(
                        2,
                        brightness
                    )
                );


            this.brightness =
                brightness;


            this.applyBrightness();

        },


        /* ==================================================
           GESCHWINDIGKEIT ANWENDEN
           ================================================== */

        applySpeed: function () {

            if (!this.container) {

                return;

            }


            const outerDuration =
                5 / this.speed;


            const middleDuration =
                3.4 / this.speed;


            const raysOneDuration =
                8 / this.speed;


            const raysTwoDuration =
                11 / this.speed;


            if (this.outerOrbit) {

                this.outerOrbit.style.animationDuration =
                    outerDuration + "s";

            }


            if (this.middleOrbit) {

                this.middleOrbit.style.animationDuration =
                    middleDuration + "s";

            }


            if (this.raysOne) {

                this.raysOne.style.animationDuration =
                    raysOneDuration + "s";

            }


            if (this.raysTwo) {

                this.raysTwo.style.animationDuration =
                    raysTwoDuration + "s";

            }

        },


        /* ==================================================
           HELLIGKEIT ANWENDEN
           ================================================== */

        applyBrightness: function () {

            if (!this.container) {

                return;

            }


            this.container.style.setProperty(
                "--haldo-light-brightness",
                String(
                    this.brightness
                )
            );


            this.container.style.opacity =
                this.enabled
                    ? String(
                        Math.max(
                            0.15,
                            Math.min(
                                1,
                                this.brightness
                            )
                    ))
                    : "0";

        },


        /* ==================================================
           EINSTELLUNGEN ANWENDEN
           ================================================== */

        applySettings: function () {

            this.applySpeed();

            this.applyBrightness();

        },


        /* ==================================================
           NORMALER BEREITSCHAFTSMODUS
           ================================================== */

        idle: function () {

            this.setState(
                "idle"
            );

        },


        /* ==================================================
           MIKROFON / ZUHÖREN
           ================================================== */

        listening: function () {

            this.setState(
                "listening"
            );

        },


        /* ==================================================
           BENUTZER SCHREIBT
           ================================================== */

        input: function () {

            this.setState(
                "input"
            );

        },


        /* ==================================================
           AI VERARBEITET
           ================================================== */

        thinking: function () {

            this.setState(
                "thinking"
            );

        },


        /* ==================================================
           AI ANTWORTET
           ================================================== */

        answering: function () {

            this.setState(
                "answering"
            );

        },


        /* ==================================================
           AI SPRICHT
           ================================================== */

        speaking: function () {

            this.setState(
                "speaking"
            );

        },


        /* ==================================================
           ERFOLG
           ================================================== */

        success: function () {

            this.setState(
                "success"
            );

        },


        /* ==================================================
           FEHLER
           ================================================== */

        error: function () {

            this.setState(
                "error"
            );

        },


        /* ==================================================
           ZUSTAND
           ================================================== */

        setState: function (state) {

            if (!state) {

                state =
                    "idle";

            }


            this.state =
                String(state);


            if (!this.container) {

                return;

            }


            const allowedStates = [

                "idle",
                "listening",
                "input",
                "thinking",
                "answering",
                "speaking",
                "success",
                "error"

            ];


            if (
                !allowedStates.includes(
                    this.state
                )
            ) {

                this.state =
                    "idle";

            }


            /* --------------------------------------------
               Alte Zustände entfernen
               -------------------------------------------- */

            allowedStates.forEach(
                function (name) {

                    this.container.classList.remove(
                        "haldo-light-" + name
                    );

                }.bind(this)
            );


            /* --------------------------------------------
               Neuen Zustand setzen
               -------------------------------------------- */

            this.container.classList.add(
                "haldo-light-" +
                this.state
            );


            this.updateIntensity();

        },


        /* ==================================================
           INTENSITÄT JE NACH AI-ZUSTAND
           ================================================== */

        updateIntensity: function () {

            if (!this.container) {

                return;

            }


            let intensity =
                this.brightness;


            switch (
                this.state
            ) {

                case "idle":

                    intensity =
                        this.brightness;

                    break;


                case "listening":

                    intensity =
                        this.brightness *
                        1.25;

                    break;


                case "input":

                    intensity =
                        this.brightness *
                        1.35;

                    break;


                case "thinking":

                    intensity =
                        this.brightness *
                        1.55;

                    break;


                case "answering":

                    intensity =
                        this.brightness *
                        1.7;

                    break;


                case "speaking":

                    intensity =
                        this.brightness *
                        1.6;

                    break;


                case "success":

                    intensity =
                        this.brightness *
                        2;

                    break;


                case "error":

                    intensity =
                        this.brightness *
                        1.8;

                    break;


                default:

                    intensity =
                        this.brightness;

            }


            this.container.style.setProperty(
                "--haldo-state-intensity",
                String(
                    Math.min(
                        2.5,
                        intensity
                    )
                )
            );

        },


        /* ==================================================
           KURZER LICHTIMPULS
           ================================================== */

        pulse: function (
            duration
        ) {

            if (!this.container) {

                return;

            }


            const time =
                Number(duration) || 700;


            this.container.classList.remove(
                "haldo-light-pulse"
            );


            /* Reflow für erneuten Impuls */

            void this.container.offsetWidth;


            this.container.classList.add(
                "haldo-light-pulse"
            );


            window.setTimeout(
                function () {

                    if (this.container) {

                        this.container.classList.remove(
                            "haldo-light-pulse"
                        );

                    }

                }.bind(this),
                time
            );

        },


        /* ==================================================
           AI-EVENT
           ================================================== */

        react: function (eventName) {

            switch (
                String(eventName).toLowerCase()
            ) {

                case "listen":

                case "listening":

                    this.listening();

                    break;


                case "input":

                case "typing":

                    this.input();

                    break;


                case "think":

                case "thinking":

                case "processing":

                    this.thinking();

                    break;


                case "answer":

                case "answering":

                    this.answering();

                    break;


                case "speak":

                case "speaking":

                    this.speaking();

                    break;


                case "success":

                case "done":

                    this.success();

                    this.pulse(
                        900
                    );

                    break;


                case "error":

                case "failed":

                    this.error();

                    this.pulse(
                        900
                    );

                    break;


                case "idle":

                default:

                    this.idle();

            }

        }

    };


    /* ======================================================
       GLOBAL VERFÜGBARKEIT
       ====================================================== */

    window.HalDoLight =
        HalDoLight;


    /* ======================================================
       DOM READY
       ====================================================== */

    function initializeLightSystem() {

        window.setTimeout(
            function () {

                HalDoLight.init();

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
            initializeLightSystem,
            {
                once: true
            }
        );

    } else {

        initializeLightSystem();

    }


})(window, document);