/* ============================================================
   HALDO AI OS 20
   HALDO LIVING LOGO ENGINE
   ============================================================ */

(function (window, document) {

    "use strict";

    const VERSION = "20.0.0";

    class HalDoLivingLogo {

        constructor() {

            this.version =
                VERSION;

            this.initialized =
                false;

            this.state =
                "idle";

            this.isSpeaking =
                false;

            this.blinkTimer =
                null;

            this.breathTimer =
                null;

            this.root =
                null;

            this.logo =
                null;

            this.faceLayer =
                null;

            this.events =
                new Map();
        }

        /* ====================================================
           INITIALIZE
           ==================================================== */

        init() {

            if (this.initialized) {
                return this;
            }

            this.root =
                document.getElementById(
                    "haldo-logo-stage"
                );

            if (!this.root) {

                console.warn(
                    "[HalDo Living Logo] Logo Stage nicht gefunden."
                );

                return this;
            }

            this.logo =
                document.getElementById(
                    "haldo-main-logo"
                );

            if (!this.logo) {

                console.warn(
                    "[HalDo Living Logo] Hauptlogo nicht gefunden."
                );

                return this;
            }

            this.createLivingLayer();

            this.startBreathing();

            this.startBlinking();

            this.bindEvents();

            this.initialized =
                true;

            this.emit(
                "initialized"
            );

            return this;
        }

        /* ====================================================
           LIVING LAYER
           ==================================================== */

        createLivingLayer() {

            if (
                document.getElementById(
                    "haldo-living-layer"
                )
            ) {
                return;
            }

            this.faceLayer =
                document.createElement(
                    "div"
                );

            this.faceLayer.id =
                "haldo-living-layer";

            this.faceLayer.setAttribute(
                "aria-hidden",
                "true"
            );

            Object.assign(
                this.faceLayer.style,
                {
                    position: "absolute",
                    inset: "0",
                    pointerEvents: "none",
                    zIndex: "20"
                }
            );

            this.root.appendChild(
                this.faceLayer
            );

            this.injectStyles();
        }

        /* ====================================================
           ANIMATION STYLES
           ==================================================== */

        injectStyles() {

            if (
                document.getElementById(
                    "haldo-living-logo-styles"
                )
            ) {
                return;
            }

            const style =
                document.createElement(
                    "style"
                );

            style.id =
                "haldo-living-logo-styles";

            style.textContent = `

                #haldo-main-logo {

                    transform-origin:
                        center center;

                    transition:
                        transform
                        280ms ease,
                        filter
                        280ms ease;
                }

                #haldo-main-logo.haldo-breathing {

                    animation:
                        haldoLivingBreathing
                        4.8s ease-in-out infinite;
                }

                #haldo-main-logo.haldo-speaking {

                    animation:
                        haldoLivingSpeaking
                        420ms ease-in-out infinite;
                }

                #haldo-main-logo.haldo-happy {

                    filter:
                        drop-shadow(
                            0 0 20px
                            rgba(255,255,255,0.62)
                        )
                        drop-shadow(
                            0 0 46px
                            rgba(120,205,255,0.55)
                        );
                }

                #haldo-main-logo.haldo-blink {

                    transform:
                        scaleY(0.975);
                }

                @keyframes haldoLivingBreathing {

                    0%,
                    100% {

                        transform:
                            translateY(0)
                            scale(1);
                    }

                    50% {

                        transform:
                            translateY(-3px)
                            scale(1.012);
                    }
                }

                @keyframes haldoLivingSpeaking {

                    0%,
                    100% {

                        transform:
                            translateY(0)
                            scale(1);
                    }

                    50% {

                        transform:
                            translateY(-1px)
                            scale(1.018);
                    }
                }

                @media
                (prefers-reduced-motion: reduce) {

                    #haldo-main-logo {

                        animation:
                            none !important;
                    }
                }
            `;

            document.head.appendChild(
                style
            );
        }

        /* ====================================================
           BREATHING
           ==================================================== */

        startBreathing() {

            if (!this.logo) {
                return;
            }

            this.logo.classList.add(
                "haldo-breathing"
            );
        }

        /* ====================================================
           BLINKING
           ==================================================== */

        startBlinking() {

            this.stopBlinking();

            const schedule =
                () => {

                    const delay =
                        3200 +
                        Math.random() *
                        5200;

                    this.blinkTimer =
                        window.setTimeout(
                            () => {

                                this.blink();

                                schedule();

                            },
                            delay
                        );
                };

            schedule();
        }

        stopBlinking() {

            if (
                this.blinkTimer !== null
            ) {

                clearTimeout(
                    this.blinkTimer
                );

                this.blinkTimer =
                    null;
            }
        }

        blink() {

            if (!this.logo) {
                return;
            }

            this.logo.classList.add(
                "haldo-blink"
            );

            window.setTimeout(
                () => {

                    this.logo.classList.remove(
                        "haldo-blink"
                    );

                },
                150
            );

            this.emit(
                "blink"
            );
        }

        /* ====================================================
           SPEAKING
           ==================================================== */

        startSpeaking() {

            if (!this.logo) {
                return;
            }

            this.isSpeaking =
                true;

            this.state =
                "speaking";

            this.logo.classList.remove(
                "haldo-breathing"
            );

            this.logo.classList.add(
                "haldo-speaking"
            );

            this.emit(
                "speaking:start"
            );
        }

        stopSpeaking() {

            if (!this.logo) {
                return;
            }

            this.isSpeaking =
                false;

            this.state =
                "idle";

            this.logo.classList.remove(
                "haldo-speaking"
            );

            this.logo.classList.add(
                "haldo-breathing"
            );

            this.emit(
                "speaking:end"
            );
        }

        /* ====================================================
           HAPPY
           ==================================================== */

        smile() {

            if (!this.logo) {
                return;
            }

            this.logo.classList.add(
                "haldo-happy"
            );

            this.state =
                "happy";

            this.emit(
                "expression:happy"
            );

            window.setTimeout(
                () => {

                    if (!this.isSpeaking) {

                        this.logo.classList.remove(
                            "haldo-happy"
                        );

                        this.state =
                            "idle";
                    }

                },
                1800
            );
        }

        /* ====================================================
           EVENTS
           ==================================================== */

        bindEvents() {

            window.addEventListener(
                "haldo:voice-start",
                () => {

                    this.startSpeaking();
                }
            );

            window.addEventListener(
                "haldo:voice-end",
                () => {

                    this.stopSpeaking();
                }
            );

            window.addEventListener(
                "haldo:ai-speaking",
                () => {

                    this.startSpeaking();
                }
            );

            window.addEventListener(
                "haldo:ai-finished-speaking",
                () => {

                    this.stopSpeaking();
                }
            );

            window.addEventListener(
                "haldo:ai-happy",
                () => {

                    this.smile();
                }
            );
        }

        /* ====================================================
           EVENT EMITTER
           ==================================================== */

        on(
            eventName,
            callback
        ) {

            if (
                typeof callback !==
                "function"
            ) {
                return;
            }

            if (
                !this.events.has(
                    eventName
                )
            ) {

                this.events.set(
                    eventName,
                    []
                );
            }

            this.events
                .get(eventName)
                .push(callback);
        }

        emit(
            eventName,
            detail = {}
        ) {

            const listeners =
                this.events.get(
                    eventName
                ) || [];

            listeners.forEach(
                callback => {

                    try {

                        callback(
                            detail
                        );

                    } catch (error) {

                        console.error(
                            "[HalDo Living Logo]",
                            error
                        );
                    }
                }
            );

            window.dispatchEvent(
                new CustomEvent(
                    `haldo:living:${eventName}`,
                    {
                        detail
                    }
                )
            );
        }
    }

    /* ========================================================
       GLOBAL INSTANCE
       ======================================================== */

    window.HalDoLivingLogo =
        new HalDoLivingLogo();

    /* ========================================================
       AUTO INITIALIZATION
       ======================================================== */

    function initialize() {

        window.HalDoLivingLogo.init();
    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();
    }

})(window, document);