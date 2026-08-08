/*

============================================================

 HALDO AI OS 18

 LOGO INTRO MANAGER

 Professional Ultimate Foundation

============================================================

 Datei:

 js/logo-intro-manager.js

 Aufgabe:

 - Logo-Intro steuern

 - HalDo Logo Animation starten

 - Begrüßung anzeigen

 - Sprachstatus verwalten

 - Intro überspringen

 - Systemstatus anzeigen

 - Übergang zur HalDo Shell

 - Verbindung mit Logo Animation Manager

 - Verbindung mit Shell Manager

 - Verbindung mit Speech System vorbereiten

 WICHTIG:

 Das Logo selbst wird NICHT gedreht.

 Nur die Licht-/Energieeffekte bewegen sich.

============================================================

*/

"use strict";

(function (window) {

    /* ========================================================

       HALDO LOGO INTRO MANAGER

       ======================================================== */

    const HalDoLogoIntroManager = {

        /* ====================================================

           INFORMATION

           ==================================================== */

        name:

            "HalDo Logo Intro Manager",

        version:

            "18.0.0",

        status:

            "CREATED",

        initialized:

            false,

        running:

            false,

        finished:

            false,

        skipped:

            false,

        /* ====================================================

           ELEMENTE

           ==================================================== */

        intro:

            null,

        title:

            null,

        subtitle:

            null,

        speechStatus:

            null,

        speechStatusText:

            null,

        speechIndicator:

            null,

        systemStatus:

            null,

        systemStatusText:

            null,

        systemStatusDot:

            null,

        skipButton:

            null,

        /* ====================================================

           SYSTEMVERBINDUNGEN

           ==================================================== */

        logoManager:

            null,

        shellManager:

            null,

        kernel:

            null,

        system:

            null,

        bootManager:

            null,

        /* ====================================================

           EINSTELLUNGEN

           ==================================================== */

        settings: {

            autoStart:

                true,

            duration:

                4200,

            fadeOutDuration:

                700,

            showWelcome:

                true,

            showStatus:

                true,

            allowSkip:

                true,

            speechEnabled:

                true,

            transitionToShell:

                true

        },

        /* ====================================================

           TIMER

           ==================================================== */

        timers:

            new Set(),

        /* ====================================================

           EVENTS

           ==================================================== */

        listeners:

            new Map(),

        /* ====================================================

           INITIALIZE

           ==================================================== */

        initialize() {

            if (

                this.initialized

            ) {

                return true;

            }

            this.status =

                "INITIALIZING";

            this.connectSystems();

            this.findElements();

            this.bindEvents();

            this.initialized =

                true;

            this.status =

                "READY";

            this.emit(

                "ready",

                this.getStatus()

            );

            /*

            ----------------------------------------------------

            Auto Start

            ----------------------------------------------------

            */

            if (

                this.settings.autoStart

            ) {

                this.schedule(

                    () => {

                        this.start();

                    },

                    80

                );

            }

            return true;

        },

        /* ====================================================

           SYSTEME VERBINDEN

           ==================================================== */

        connectSystems() {

            this.logoManager =

                window.HalDoLogoAnimationManager ||

                window.HalDo?.logo ||

                null;

            this.shellManager =

                window.HalDoShellManager ||

                window.HalDo?.shell ||

                null;

            this.kernel =

                window.HalDoKernel ||

                null;

            this.system =

                window.HalDoSystem ||

                null;

            this.bootManager =

                window.HalDoBootManager ||

                null;

            return true;

        },

        /* ====================================================

           ELEMENTE FINDEN

           ==================================================== */

        findElements() {

            this.intro =

                document.querySelector(

                    "[data-haldo-logo-intro]"

                );

            if (

                !this.intro

            ) {

                this.createFallbackIntro();

            }

            this.title =

                this.intro?.querySelector(

                    "[data-haldo-intro-title]"

                ) ||

                null;

            this.subtitle =

                this.intro?.querySelector(

                    "[data-haldo-intro-subtitle]"

                ) ||

                null;

            this.speechStatus =

                this.intro?.querySelector(

                    "[data-haldo-speech-status]"

                ) ||

                null;

            this.speechStatusText =

                this.intro?.querySelector(

                    "[data-haldo-speech-status-text]"

                ) ||

                null;

            this.speechIndicator =

                this.intro?.querySelector(

                    "[data-haldo-speech-indicator]"

                ) ||

                null;

            this.systemStatus =

                this.intro?.querySelector(

                    "[data-haldo-intro-system-status]"

                ) ||

                null;

            this.systemStatusText =

                this.intro?.querySelector(

                    "[data-haldo-intro-status-text]"

                ) ||

                null;

            this.systemStatusDot =

                this.intro?.querySelector(

                    "[data-haldo-intro-status-dot]"

                ) ||

                null;

            this.skipButton =

                this.intro?.querySelector(

                    "[data-haldo-intro-skip]"

                ) ||

                null;

            return true;

        },

        /* ====================================================

           FALLBACK INTRO

           ==================================================== */

        createFallbackIntro() {

            const intro =

                document.createElement(

                    "section"

                );

            intro.id =

                "haldo-logo-intro";

            intro.className =

                "haldo-logo-intro";

            intro.setAttribute(

                "data-haldo-logo-intro",

                "true"

            );

            intro.innerHTML = `

                <div

                    class="haldo-logo-container"

                    data-haldo-logo-container

                >

                    <div

                        class="haldo-logo-stage"

                        data-haldo-logo-stage

                    >

                        <div

                            class="haldo-logo-glow"

                            data-haldo-logo-glow

                        ></div>

                        <div

                            class="haldo-logo-orbit"

                            data-haldo-logo-orbit

                        ></div>

                        <div

                            class="haldo-logo-particles"

                            data-haldo-logo-particles

                        ></div>

                        <img

                            src="assets/logo/logo.png"

                            alt="HalDo AI"

                            class="haldo-logo-image"

                            data-haldo-logo-image

                        >

                        <div

                            class="haldo-logo-speech-layer"

                            data-haldo-logo-speech

                        ></div>

                    </div>

                </div>

                <div

                    class="haldo-intro-welcome"

                >

                    <div

                        class="haldo-intro-brand"

                    >

                        <span

                            class="haldo-intro-brand-name"

                        >

                            HalDo AI

                        </span>

                    </div>

                    <h1

                        class="haldo-intro-title"

                        data-haldo-intro-title

                    >

                        Willkommen bei HalDo AI

                    </h1>

                    <p

                        class="haldo-intro-subtitle"

                        data-haldo-intro-subtitle

                    >

                        HalDo AI OS 18

                    </p>

                    <div

                        class="haldo-intro-speech-status"

                        data-haldo-speech-status

                    >

                        <span

                            class="haldo-speech-indicator"

                            data-haldo-speech-indicator

                        ></span>

                        <span

                            class="haldo-speech-status-text"

                            data-haldo-speech-status-text

                        >

                            HalDo AI wird gestartet…

                        </span>

                    </div>

                </div>

                <div

                    class="haldo-intro-controls"

                >

                    <button

                        type="button"

                        class="haldo-intro-skip"

                        data-haldo-intro-skip

                    >

                        Überspringen

                    </button>

                </div>

                <div

                    class="haldo-intro-system-status"

                    data-haldo-intro-system-status

                >

                    <span

                        class="haldo-intro-status-dot"

                        data-haldo-intro-status-dot

                    ></span>

                    <span

                        data-haldo-intro-status-text

                    >

                        System wird geladen…

                    </span>

                </div>

            `;

            document.body.prepend(

                intro

            );

            this.intro =

                intro;

            return intro;

        },

        /* ====================================================

           EVENTS BINDEN

           ==================================================== */

        bindEvents() {

            if (

                this.skipButton

            ) {

                this.skipButton.addEventListener(

                    "click",

                    () => {

                        this.skip();

                    }

                );

            }

            /*

            ----------------------------------------------------

            Kernel Ready

            ----------------------------------------------------

            */

            window.addEventListener(

                "haldo:kernel-ready",

                () => {

                    this.connectSystems();

                    this.setSystemStatus(

                        "Kernel bereit."

                    );

                }

            );

            /*

            ----------------------------------------------------

            System Ready

            ----------------------------------------------------

            */

            window.addEventListener(

                "haldo:system-ready",

                () => {

                    this.connectSystems();

                    this.setSystemStatus(

                        "System bereit."

                    );

                }

            );

            /*

            ----------------------------------------------------

            Boot Ready

            ----------------------------------------------------

            */

            window.addEventListener(

                "haldo:boot-complete",

                () => {

                    this.setSystemStatus(

                        "HalDo AI OS ist bereit."

                    );

                }

            );

            /*

            ----------------------------------------------------

            Logo Animation Ready

            ----------------------------------------------------

            */

            window.addEventListener(

                "haldo:logo-animation-ready",

                () => {

                    this.connectSystems();

                }

            );

            return true;

        },

        /* ====================================================

           START

           ==================================================== */

        async start() {

            if (

                this.running

            ) {

                return false;

            }

            if (

                this.finished

            ) {

                return false;

            }

            this.connectSystems();

            this.findElements();

            this.running =

                true;

            this.finished =

                false;

            this.skipped =

                false;

            this.status =

                "RUNNING";

            /*

            ----------------------------------------------------

            Intro sichtbar machen

            ----------------------------------------------------

            */

            this.show();

            /*

            ----------------------------------------------------

            Startstatus

            ----------------------------------------------------

            */

            this.setSystemStatus(

                "HalDo AI wird gestartet…"

            );

            this.setSpeechStatus(

                "HalDo AI wird gestartet…"

            );

            /*

            ----------------------------------------------------

            Logo Animation starten

            ----------------------------------------------------

            */

            if (

                this.logoManager

            ) {

                this.logoManager.start();

                this.logoManager.startIntro(

                    {

                        duration:

                            this.settings.duration

                    }

                );

            }

            /*

            ----------------------------------------------------

            Begrüßung

            ----------------------------------------------------

            */

            if (

                this.settings.showWelcome

            ) {

                this.schedule(

                    () => {

                        this.showWelcome();

                    },

                    900

                );

            }

            /*

            ----------------------------------------------------

            Sprachbewegung vorbereiten

            ----------------------------------------------------

            */

            if (

                this.settings.speechEnabled

            ) {

                this.schedule(

                    () => {

                        this.startSpeechAnimation();

                    },

                    1200

                );

            }

            /*

            ----------------------------------------------------

            Systemstatus

            ----------------------------------------------------

            */

            this.schedule(

                () => {

                    this.setSystemStatus(

                        "HalDo AI OS lädt Module…"

                    );

                },

                1800

            );

            this.schedule(

                () => {

                    this.setSystemStatus(

                        "Module werden geladen…"

                    );

                },

                2700

            );

            this.schedule(

                () => {

                    this.setSystemStatus(

                        "HalDo AI OS ist bereit."

                    );

                },

                Math.max(

                    3000,

                    this.settings.duration - 900

                )

            );

            /*

            ----------------------------------------------------

            Ende

            ----------------------------------------------------

            */

            this.schedule(

                () => {

                    this.finish();

                },

                this.settings.duration

            );

            this.emit(

                "started",

                this.getStatus()

            );

            return true;

        },

        /* ====================================================

           WELCOME

           ==================================================== */

        showWelcome() {

            if (

                this.title

            ) {

                this.title.classList.add(

                    "is-visible"

                );

            }

            if (

                this.subtitle

            ) {

                this.subtitle.classList.add(

                    "is-visible"

                );

            }

            this.setSpeechStatus(

                "Willkommen bei HalDo AI."

            );

            this.emit(

                "welcome",

                this.getStatus()

            );

            return true;

        },

        /* ====================================================

           SPEECH ANIMATION

           ==================================================== */

        startSpeechAnimation() {

            if (

                !this.logoManager

            ) {

                this.connectSystems();

            }

            if (

                this.logoManager

            ) {

                this.logoManager.startSpeaking(

                    0.72

                );

            }

            if (

                this.speechIndicator

            ) {

                this.speechIndicator.classList.add(

                    "is-active"

                );

            }

            this.setSpeechStatus(

                "HalDo AI spricht…"

            );

            /*

            ----------------------------------------------------

            Nur kurze Demonstrationsphase.

            Später wird diese Funktion mit echter

            Audio-/Speech-Ausgabe verbunden.

            ----------------------------------------------------

            */

            this.schedule(

                () => {

                    this.stopSpeechAnimation();

                },

                2600

            );

            return true;

        },

        /* ====================================================

           SPEECH STOP

           ==================================================== */

        stopSpeechAnimation() {

            if (

                this.logoManager

            ) {

                this.logoManager.stopSpeaking();

            }

            if (

                this.speechIndicator

            ) {

                this.speechIndicator.classList.remove(

                    "is-active"

                );

            }

            this.setSpeechStatus(

                "HalDo AI ist bereit."

            );

            return true;

        },

        /* ====================================================

           SPEECH STATUS

           ==================================================== */

        setSpeechStatus(

            text

        ) {

            if (

                this.speechStatusText

            ) {

                this.speechStatusText.textContent =

                    text;

            }

            return true;

        },

        /* ====================================================

           SYSTEM STATUS

           ==================================================== */

        setSystemStatus(

            text

        ) {

            if (

                this.systemStatusText

            ) {

                this.systemStatusText.textContent =

                    text;

            }

            if (

                this.systemStatusDot

            ) {

                this.systemStatusDot.classList.toggle(

                    "ready",

                    /bereit/i.test(

                        text

                    )

                );

            }

            this.emit(

                "system-status",

                {

                    text

                }

            );

            return true;

        },

        /* ====================================================

           SHOW

           ==================================================== */

        show() {

            if (

                !this.intro

            ) {

                this.findElements();

            }

            if (

                !this.intro

            ) {

                return false;

            }

            this.intro.classList.remove(

                "is-hidden"

            );

            this.intro.classList.add(

                "is-visible"

            );

            this.intro.setAttribute(

                "aria-hidden",

                "false"

            );

            return true;

        },

        /* ====================================================

           HIDE

           ==================================================== */

        hide() {

            if (

                !this.intro

            ) {

                return false;

            }

            this.intro.classList.remove(

                "is-visible"

            );

            this.intro.classList.add(

                "is-hidden"

            );

            this.intro.setAttribute(

                "aria-hidden",

                "true"

            );

            return true;

        },

        /* ====================================================

           FINISH

           ==================================================== */

        finish() {

            if (

                !this.running

            ) {

                return false;

            }

            this.running =

                false;

            this.finished =

                true;

            this.status =

                "FINISHING";

            this.stopSpeechAnimation();

            this.setSystemStatus(

                "HalDo AI OS ist bereit."

            );

            /*

            ----------------------------------------------------

            Fade Out

            ----------------------------------------------------

            */

            if (

                this.intro

            ) {

                this.intro.classList.add(

                    "is-finishing"

                );

            }

            this.schedule(

                () => {

                    this.completeTransition();

                },

                this.settings.fadeOutDuration

            );

            this.emit(

                "finishing",

                this.getStatus()

            );

            return true;

        },

        /* ====================================================

           SKIP

           ==================================================== */

        skip() {

            if (

                !this.settings.allowSkip

            ) {

                return false;

            }

            if (

                !this.running

            ) {

                return false;

            }

            this.skipped =

                true;

            this.clearTimers();

            this.stopSpeechAnimation();

            this.setSystemStatus(

                "HalDo AI OS wird geöffnet…"

            );

            this.status =

                "SKIPPED";

            this.completeTransition();

            this.emit(

                "skipped",

                this.getStatus()

            );

            return true;

        },

        /* ====================================================

           COMPLETE TRANSITION

           ==================================================== */

        completeTransition() {

            this.clearTimers();

            if (

                this.logoManager

            ) {

                this.logoManager.stop();

            }

            this.hide();

            /*

            ----------------------------------------------------

            Shell öffnen

            ----------------------------------------------------

            */

            if (

                this.settings.transitionToShell

            ) {

                this.connectSystems();

                if (

                    this.shellManager

                ) {

                    this.shellManager.show();

                    this.shellManager.setReady();

                }

            }

            this.status =

                "COMPLETED";

            this.emit(

                "completed",

                this.getStatus()

            );

            return true;

        },

        /* ====================================================

           TIMER

           ==================================================== */

        schedule(

            callback,

            delay

        ) {

            const timer =

                window.setTimeout(

                    () => {

                        this.timers.delete(

                            timer

                        );

                        try {

                            callback();

                        } catch (

                            error

                        ) {

                            console.error(

                                "[HalDo Intro Manager]",

                                error

                            );

                        }

                    },

                    delay

                );

            this.timers.add(

                timer

            );

            return timer;

        },

        /* ====================================================

           TIMER LÖSCHEN

           ==================================================== */

        clearTimers() {

            this.timers.forEach(

                timer => {

                    window.clearTimeout(

                        timer

                    );

                }

            );

            this.timers.clear();

            return true;

        },

        /* ====================================================

           CONFIG

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

            return true;

        },

        /* ====================================================

           EVENT ON

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

           EVENT OFF

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

           EVENT EMIT

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

                                "[HalDo Logo Intro]",

                                error

                            );

                        }

                    }

                );

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

                finished:

                    this.finished,

                skipped:

                    this.skipped,

                settings:

                    {

                        ...this.settings

                    }

            };

        }

    };

    /* ========================================================

       GLOBALE API

       ======================================================== */

    window.HalDoLogoIntroManager =

        HalDoLogoIntroManager;

    if (

        !window.HalDo

    ) {

        window.HalDo = {};

    }

    window.HalDo.logoIntro =

        HalDoLogoIntroManager;

    /* ========================================================

       START

       ======================================================== */

    function start() {

        HalDoLogoIntroManager.initialize();

    }

    if (

        document.readyState ===

        "loading"

    ) {

        document.addEventListener(

            "DOMContentLoaded",

            start,

            {

                once:

                    true

            }

        );

    } else {

        start();

    }

    console.log(

        "=============================================="

    );

    console.log(

        "HalDo AI OS 18 Logo Intro Manager"

    );

    console.log(

        "Intro-System geladen."

    );

    console.log(

        "=============================================="

    );

})(window);