/*
============================================================
 HALDO AI OS 18
 LOGO ANIMATION MANAGER
 Professional Ultimate Foundation
============================================================

 Datei:
 js/logo-animation-manager.js

 Zweck:
 - HalDo Logo verwalten
 - echtes HalDo Logo verwenden
 - Logo selbst NICHT drehen
 - leuchtende Energie-Umlaufbahn
 - Sonnen-/Planeten-artiger Lichtschein
 - Glow und Pulsieren
 - Energie-Partikel
 - Sprachbewegung vorbereiten
 - Mund-/Sprechbewegung vorbereiten
 - Animation ein-/ausschalten
 - Geschwindigkeit ändern
 - Farben ändern
 - Lichtstärke ändern
 - Intro-Steuerung
============================================================
*/

"use strict";


(function (window) {


    const HalDoLogoAnimationManager = {


        /* ====================================================
           INFORMATION
           ==================================================== */

        name:
            "HalDo Logo Animation Manager",

        version:
            "18.0.0",

        status:
            "CREATED",

        initialized:
            false,


        /* ====================================================
           LOGO
           ==================================================== */

        logoPath:
            "assets/logo/logo.png",

        logoElement:
            null,

        container:
            null,


        /* ====================================================
           ANIMATION EINSTELLUNGEN
           ==================================================== */

        settings: {

            enabled:
                true,

            orbitEnabled:
                true,

            glowEnabled:
                true,

            particlesEnabled:
                true,

            pulseEnabled:
                true,

            speechEnabled:
                true,

            orbitSpeed:
                8,

            orbitSize:
                1,

            glowStrength:
                1,

            pulseStrength:
                1,

            particleAmount:
                18,

            lightColor:
                "#ffffff",

            secondaryLightColor:
                "#8fd8ff",

            energyColor:
                "#ffffff",

            speechIntensity:
                0.7,

            introDuration:
                4200

        },


        /* ====================================================
           LAUFSTATUS
           ==================================================== */

        running:
            false,

        speaking:
            false,

        introRunning:
            false,


        /* ====================================================
           INTERNE TIMER
           ==================================================== */

        speechTimer:
            null,

        pulseTimer:
            null,


        /* ====================================================
           EVENTS
           ==================================================== */

        listeners:
            new Map(),


        /* ====================================================
           INITIALIZE
           ==================================================== */

        initialize(
            container = null
        ) {


            if (
                this.initialized
            ) {

                return true;

            }


            this.status =
                "INITIALIZING";


            this.create(
                container
            );


            this.applySettings();


            this.initialized =
                true;


            this.status =
                "READY";


            this.emit(
                "ready",
                this.getStatus()
            );


            this.log(
                "Logo Animation Manager ist bereit."
            );


            return true;

        },


        /* ====================================================
           CREATE
           ==================================================== */

        create(
            target = null
        ) {


            /*
            ----------------------------------------------------
            Container suchen
            ----------------------------------------------------
            */

            let container =
                target;


            if (
                typeof container ===
                "string"
            ) {

                container =
                    document.querySelector(
                        container
                    );

            }


            if (
                !container
            ) {


                container =
                    document.querySelector(
                        "[data-haldo-logo-container]"
                    );


            }


            /*
            ----------------------------------------------------
            Falls noch kein Container existiert
            ----------------------------------------------------
            */

            if (
                !container
            ) {


                container =
                    document.createElement(
                        "div"
                    );


                container.className =
                    "haldo-logo-container";


                container.setAttribute(
                    "data-haldo-logo-container",
                    "true"
                );


                document.body.appendChild(
                    container
                );

            }


            this.container =
                container;


            /*
            ----------------------------------------------------
            Vorhandene Struktur verwenden
            ----------------------------------------------------
            */

            let stage =
                container.querySelector(
                    "[data-haldo-logo-stage]"
                );


            if (
                !stage
            ) {


                stage =
                    document.createElement(
                        "div"
                    );


                stage.className =
                    "haldo-logo-stage";


                stage.setAttribute(
                    "data-haldo-logo-stage",
                    "true"
                );


                container.appendChild(
                    stage
                );

            }


            /*
            ----------------------------------------------------
            Orbit-Licht
            ----------------------------------------------------
            */

            let orbit =
                stage.querySelector(
                    "[data-haldo-logo-orbit]"
                );


            if (
                !orbit
            ) {


                orbit =
                    document.createElement(
                        "div"
                    );


                orbit.className =
                    "haldo-logo-orbit";


                orbit.setAttribute(
                    "data-haldo-logo-orbit",
                    "true"
                );


                stage.appendChild(
                    orbit
                );

            }


            /*
            ----------------------------------------------------
            Glow
            ----------------------------------------------------
            */

            let glow =
                stage.querySelector(
                    "[data-haldo-logo-glow]"
                );


            if (
                !glow
            ) {


                glow =
                    document.createElement(
                        "div"
                    );


                glow.className =
                    "haldo-logo-glow";


                glow.setAttribute(
                    "data-haldo-logo-glow",
                    "true"
                );


                stage.appendChild(
                    glow
                );

            }


            /*
            ----------------------------------------------------
            Echtes Logo
            ----------------------------------------------------
            */

            let logo =
                stage.querySelector(
                    "[data-haldo-logo-image]"
                );


            if (
                !logo
            ) {


                logo =
                    document.createElement(
                        "img"
                    );


                logo.className =
                    "haldo-logo-image";


                logo.setAttribute(
                    "data-haldo-logo-image",
                    "true"
                );


                stage.appendChild(
                    logo
                );

            }


            logo.src =
                this.logoPath;


            logo.alt =
                "HalDo AI";


            logo.draggable =
                false;


            /*
            ----------------------------------------------------
            WICHTIG:
            Das Logo selbst bekommt KEINE Rotation.
            ----------------------------------------------------
            */

            logo.style.transform =
                "none";


            /*
            ----------------------------------------------------
            Speech Layer
            ----------------------------------------------------
            */

            let speech =
                stage.querySelector(
                    "[data-haldo-logo-speech]"
                );


            if (
                !speech
            ) {


                speech =
                    document.createElement(
                        "div"
                    );


                speech.className =
                    "haldo-logo-speech-layer";


                speech.setAttribute(
                    "data-haldo-logo-speech",
                    "true"
                );


                stage.appendChild(
                    speech
                );

            }


            /*
            ----------------------------------------------------
            Partikel
            ----------------------------------------------------
            */

            let particles =
                stage.querySelector(
                    "[data-haldo-logo-particles]"
                );


            if (
                !particles
            ) {


                particles =
                    document.createElement(
                        "div"
                    );


                particles.className =
                    "haldo-logo-particles";


                particles.setAttribute(
                    "data-haldo-logo-particles",
                    "true"
                );


                stage.appendChild(
                    particles
                );

            }


            this.logoElement =
                logo;


            this.orbit =
                orbit;


            this.glow =
                glow;


            this.speechLayer =
                speech;


            this.particleLayer =
                particles;


            this.createParticles();


            return true;

        },


        /* ====================================================
           PARTICLES
           ==================================================== */

        createParticles() {


            if (
                !this.particleLayer
            ) {

                return false;

            }


            this.particleLayer.innerHTML =
                "";


            if (
                !this.settings.particlesEnabled
            ) {

                return true;

            }


            const amount =
                Math.max(
                    0,
                    Math.min(
                        100,
                        this.settings.particleAmount
                    )
                );


            for (
                let index = 0;
                index < amount;
                index++
            ) {


                const particle =
                    document.createElement(
                        "span"
                    );


                particle.className =
                    "haldo-logo-particle";


                particle.dataset.index =
                    String(
                        index
                    );


                const angle =
                    (
                        360 /
                        amount
                    ) *
                    index;


                const delay =
                    (
                        index *
                        0.13
                    );


                const distance =
                    38 +
                    (
                        index %
                        5
                    ) *
                    7;


                particle.style.setProperty(
                    "--haldo-particle-angle",
                    `${angle}deg`
                );


                particle.style.setProperty(
                    "--haldo-particle-distance",
                    `${distance}%`
                );


                particle.style.setProperty(
                    "--haldo-particle-delay",
                    `${delay}s`
                );


                this.particleLayer.appendChild(
                    particle
                );

            }


            return true;

        },


        /* ====================================================
           APPLY SETTINGS
           ==================================================== */

        applySettings() {


            if (
                !this.container
            ) {

                return false;

            }


            const root =
                this.container;


            root.style.setProperty(
                "--haldo-orbit-speed",
                `${this.settings.orbitSpeed}s`
            );


            root.style.setProperty(
                "--haldo-orbit-size",
                String(
                    this.settings.orbitSize
                )
            );


            root.style.setProperty(
                "--haldo-glow-strength",
                String(
                    this.settings.glowStrength
                )
            );


            root.style.setProperty(
                "--haldo-pulse-strength",
                String(
                    this.settings.pulseStrength
                )
            );


            root.style.setProperty(
                "--haldo-light-color",
                this.settings.lightColor
            );


            root.style.setProperty(
                "--haldo-secondary-light-color",
                this.settings.secondaryLightColor
            );


            root.style.setProperty(
                "--haldo-energy-color",
                this.settings.energyColor
            );


            root.classList.toggle(
                "animation-disabled",
                !this.settings.enabled
            );


            root.classList.toggle(
                "orbit-disabled",
                !this.settings.orbitEnabled
            );


            root.classList.toggle(
                "glow-disabled",
                !this.settings.glowEnabled
            );


            root.classList.toggle(
                "particles-disabled",
                !this.settings.particlesEnabled
            );


            root.classList.toggle(
                "pulse-disabled",
                !this.settings.pulseEnabled
            );


            root.classList.toggle(
                "speech-disabled",
                !this.settings.speechEnabled
            );


            this.createParticles();


            return true;

        },


        /* ====================================================
           START
           ==================================================== */

        start() {


            if (
                !this.initialized
            ) {

                this.initialize();

            }


            if (
                this.running
            ) {

                return true;

            }


            this.running =
                true;


            this.container.classList.add(
                "is-running"
            );


            this.applySettings();


            this.emit(
                "started",
                this.getStatus()
            );


            return true;

        },


        /* ====================================================
           STOP
           ==================================================== */

        stop() {


            if (
                !this.container
            ) {

                return false;

            }


            this.running =
                false;


            this.container.classList.remove(
                "is-running"
            );


            this.stopSpeaking();


            this.emit(
                "stopped",
                this.getStatus()
            );


            return true;

        },


        /* ====================================================
           SPEAKING START
           ==================================================== */

        startSpeaking(
            intensity = null
        ) {


            if (
                !this.settings.speechEnabled
            ) {

                return false;

            }


            if (
                !this.container
            ) {

                this.initialize();

            }


            if (
                intensity !== null
            ) {

                this.settings.speechIntensity =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            Number(
                                intensity
                            )
                        )
                    );

            }


            this.speaking =
                true;


            this.container.classList.add(
                "is-speaking"
            );


            this.container.style.setProperty(
                "--haldo-speech-intensity",
                String(
                    this.settings.speechIntensity
                )
            );


            /*
            ----------------------------------------------------
            Die eigentliche Bilddatei wird NICHT verändert.
            Nur die Sprach-/Bewegungsebene reagiert.
            ----------------------------------------------------
            */


            this.emit(
                "speaking-started",
                {

                    intensity:
                        this.settings.speechIntensity

                }
            );


            return true;

        },


        /* ====================================================
           SPEAKING STOP
           ==================================================== */

        stopSpeaking() {


            this.speaking =
                false;


            if (
                this.container
            ) {

                this.container.classList.remove(
                    "is-speaking"
                );

            }


            this.emit(
                "speaking-stopped",
                this.getStatus()
            );


            return true;

        },


        /* ====================================================
           SPEECH LEVEL
           ==================================================== */

        setSpeechLevel(
            level
        ) {


            const value =
                Math.max(
                    0,
                    Math.min(
                        1,
                        Number(
                            level
                        ) || 0
                    )
                );


            this.settings.speechIntensity =
                value;


            if (
                this.container
            ) {

                this.container.style.setProperty(
                    "--haldo-speech-intensity",
                    String(
                        value
                    )
                );

            }


            this.emit(
                "speech-level",
                {

                    level:
                        value

                }
            );


            return true;

        },


        /* ====================================================
           INTRO START
           ==================================================== */

        async startIntro(
            options = {}
        ) {


            if (
                !this.initialized
            ) {

                this.initialize();

            }


            if (
                this.introRunning
            ) {

                return false;

            }


            this.introRunning =
                true;


            this.container.classList.add(
                "intro-active"
            );


            this.start();


            /*
            ----------------------------------------------------
            Intro-Dauer
            ----------------------------------------------------
            */

            const duration =
                Number(
                    options.duration ||
                    this.settings.introDuration
                );


            /*
            ----------------------------------------------------
            Intro Animation
            ----------------------------------------------------
            */

            await this.wait(
                Math.max(
                    0,
                    duration
                )
            );


            this.container.classList.remove(
                "intro-active"
            );


            this.introRunning =
                false;


            this.emit(
                "intro-finished",
                this.getStatus()
            );


            return true;

        },


        /* ====================================================
           WAIT
           ==================================================== */

        wait(
            milliseconds
        ) {


            return new Promise(
                resolve => {

                    window.setTimeout(
                        resolve,
                        milliseconds
                    );

                }
            );

        },


        /* ====================================================
           SETTING ÄNDERN
           ==================================================== */

        set(
            key,
            value
        ) {


            if (
                !Object.prototype.hasOwnProperty.call(
                    this.settings,
                    key
                )
            ) {

                return false;

            }


            this.settings[key] =
                value;


            this.applySettings();


            this.emit(
                "settings-changed",
                {

                    key,

                    value

                }
            );


            return true;

        },


        /* ====================================================
           MEHRERE SETTINGS
           ==================================================== */

        configure(
            values = {}
        ) {


            Object.keys(
                values
            ).forEach(
                key => {


                    if (
                        Object.prototype.hasOwnProperty.call(
                            this.settings,
                            key
                        )
                    ) {

                        this.settings[key] =
                            values[key];

                    }

                }
            );


            this.applySettings();


            this.emit(
                "settings-changed",
                this.settings
            );


            return true;

        },


        /* ====================================================
           RESET
           ==================================================== */

        resetSettings() {


            this.settings = {


                enabled:
                    true,

                orbitEnabled:
                    true,

                glowEnabled:
                    true,

                particlesEnabled:
                    true,

                pulseEnabled:
                    true,

                speechEnabled:
                    true,

                orbitSpeed:
                    8,

                orbitSize:
                    1,

                glowStrength:
                    1,

                pulseStrength:
                    1,

                particleAmount:
                    18,

                lightColor:
                    "#ffffff",

                secondaryLightColor:
                    "#8fd8ff",

                energyColor:
                    "#ffffff",

                speechIntensity:
                    0.7,

                introDuration:
                    4200

            };


            this.applySettings();


            return true;

        },


        /* ====================================================
           LOGO-PFAD ÄNDERN
           ==================================================== */

        setLogo(
            path
        ) {


            if (
                typeof path !==
                "string" ||
                !path.trim()
            ) {

                return false;

            }


            this.logoPath =
                path.trim();


            if (
                this.logoElement
            ) {

                this.logoElement.src =
                    this.logoPath;

            }


            this.emit(
                "logo-changed",
                {

                    path:
                        this.logoPath

                }
            );


            return true;

        },


        /* ====================================================
           STATUS
           ==================================================== */

        getStatus() {


            return {

                name:
                    this.name,

                version:
                    this.version,

                status:
                    this.status,

                initialized:
                    this.initialized,

                running:
                    this.running,

                speaking:
                    this.speaking,

                introRunning:
                    this.introRunning,

                logoPath:
                    this.logoPath,

                settings:
                    {
                        ...this.settings
                    }

            };

        },


        /* ====================================================
           EVENTS
           ==================================================== */

        on(
            eventName,
            callback
        ) {


            if (
                typeof callback !==
                "function"
            ) {

                return false;

            }


            if (
                !this.listeners.has(
                    eventName
                )
            ) {

                this.listeners.set(
                    eventName,
                    []
                );

            }


            this.listeners
                .get(
                    eventName
                )
                .push(
                    callback
                );


            return true;

        },


        /* ====================================================
           OFF
           ==================================================== */

        off(
            eventName,
            callback
        ) {


            const listeners =
                this.listeners.get(
                    eventName
                );


            if (
                !listeners
            ) {

                return false;

            }


            const index =
                listeners.indexOf(
                    callback
                );


            if (
                index ===
                -1
            ) {

                return false;

            }


            listeners.splice(
                index,
                1
            );


            return true;

        },


        /* ====================================================
           EMIT
           ==================================================== */

        emit(
            eventName,
            data = null
        ) {


            const listeners =
                this.listeners.get(
                    eventName
                );


            if (
                !listeners
            ) {

                return;

            }


            listeners
                .slice()
                .forEach(
                    callback => {


                        try {

                            callback(
                                data
                            );

                        } catch (
                            error
                        ) {

                            console.error(
                                "[HalDo Logo Animation]",
                                error
                            );

                        }

                    }
                );


        },


        /* ====================================================
           LOG
           ==================================================== */

        log(
            message,
            data = null
        ) {


            if (
                data !== null
            ) {

                console.log(
                    "[HalDo Logo Animation]",
                    message,
                    data
                );

            } else {

                console.log(
                    "[HalDo Logo Animation]",
                    message
                );

            }

        }

    };


    /* ========================================================
       GLOBALE API
       ======================================================== */

    window.HalDoLogoAnimationManager =
        HalDoLogoAnimationManager;


    if (
        !window.HalDo
    ) {

        window.HalDo = {};

    }


    window.HalDo.logo =
        HalDoLogoAnimationManager;


    /* ========================================================
       START
       ======================================================== */

    function start() {


        HalDoLogoAnimationManager.initialize();


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


    console.log(
        "=============================================="
    );

    console.log(
        "HalDo AI OS 18 Logo Animation Manager"
    );

    console.log(
        "Logo-System geladen."
    );

    console.log(
        "Logo selbst bleibt stabil."
    );

    console.log(
        "Licht-/Energieeffekte werden separat animiert."
    );

    console.log(
        "=============================================="
    );


})(window);