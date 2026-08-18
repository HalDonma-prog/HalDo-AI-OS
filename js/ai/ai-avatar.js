/* ============================================================
   HALDO AI OS 20
   HALDO AI AVATAR CONTROLLER
   ------------------------------------------------------------
   Datei:
       js/ai/ai-avatar.js

   Pfad:
       /js/ai/ai-avatar.js

   Verantwortlich für:

   - lebendigen HalDo AI Avatar
   - vorhandenes HalDo Logo als Avatar-Grundlage
   - zentrale Position im Sonnenbereich
   - Atmung / sanfte Bewegung
   - Glow / Lichtreaktionen
   - AI-Zustände
   - Chat-Reaktionen
   - Sprach-/Voice-Reaktionen
   - Thinking / Listening / Speaking / Idle
   - Event-Verbindungen
   - AI-Core Verbindung
   - Language Manager Verbindung
   - Voice Verbindung
   - Cosmic World Verbindung
   - App Registry Verbindung
   - Storage für Avatar-Einstellungen
   - Fehlerbehandlung
   - Accessibility
   - zukünftige Emotionen / Gesichtszustände

   WICHTIG:

   Das HalDo-Logo bleibt die visuelle Identität.

   KEIN 🤖-Emoji.

   Die Datei erzeugt keine eigene künstliche Logo-Grafik,
   wenn ein vorhandenes HalDo-Logo verfügbar ist.

   ============================================================ */

"use strict";

(function (window, document) {

    /* ============================================================
       01 — FOUNDATION
       ============================================================ */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;


    /* ============================================================
       02 — META
       ============================================================ */

    const VERSION =
        "20.0.0";

    const MODULE_ID =
        "ai-avatar";

    const NAME =
        "HalDo AI Avatar";

    const STORAGE_KEY =
        "haldo.ai.os.20.ai-avatar";


    /*
     * Das vorhandene Logo ist die verbindliche Grundlage.
     *
     * Mehrere mögliche Pfade werden unterstützt, damit das
     * Projekt flexibel bleibt.
     */

    const DEFAULT_LOGO_PATHS = [

        "assets/logo/logo.png",

        "./assets/logo/logo.png",

        "logo.png",

        "./logo.png"

    ];


    /* ============================================================
       03 — STATE
       ============================================================ */

    const state = {

        initialized:
            false,

        initializing:
            false,

        ready:
            false,

        failed:
            false,

        mounted:
            false,

        visible:
            true,

        enabled:
            true,

        state:
            "idle",

        previousState:
            "idle",

        emotion:
            "warm",

        speaking:
            false,

        listening:
            false,

        thinking:
            false,

        processing:
            false,

        connected:
            false,

        logoPath:
            null,

        rootElement:
            null,

        avatarElement:
            null,

        imageElement:
            null,

        glowElement:
            null,

        statusElement:
            null,

        animationFrame:
            null,

        lastFrame:
            0,

        pulse:
            0,

        energy:
            0,

        targetEnergy:
            0,

        rotation:
            0,

        scale:
            1,

        targetScale:
            1,

        opacity:
            1,

        targetOpacity:
            1,

        eventUnsubscribers:
            [],

        listeners:
            new Map(),

        connections: {

            kernel:
                false,

            system:
                false,

            ai:
                false,

            language:
                false,

            voice:
                false,

            registry:
                false,

            cosmic:
                false,

            storage:
                false

        },

        settings: {

            enabled:
                true,

            idleAnimation:
                true,

            glow:
                true,

            breathing:
                true,

            speakingReaction:
                true,

            listeningReaction:
                true,

            thinkingReaction:
                true,

            soundReaction:
                true,

            reducedMotion:
                false,

            opacity:
                1,

            intensity:
                1,

            logoPath:
                null

        }

    };


    /* ============================================================
       04 — LOGGING
       ============================================================ */

    function log() {

        try {

            console.log(
                "[HalDo AI Avatar]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo AI Avatar]",
                ...arguments
            );

        } catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo AI Avatar]",
                ...arguments
            );

        } catch (_) {}

    }


    /* ============================================================
       05 — HELPERS
       ============================================================ */

    function hasMethod(
        object,
        method
    ) {

        return !!(
            object &&
            typeof object[method] === "function"
        );

    }


    function clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            max,
            Math.max(
                min,
                value
            )
        );

    }


    function now() {

        return Date.now();

    }


    function clone(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }


        if (
            Array.isArray(value)
        ) {

            return value.map(
                clone
            );

        }


        if (
            typeof value === "object"
        ) {

            const result = {};

            Object.keys(value)
                .forEach(
                    key => {

                        result[key] =
                            clone(
                                value[key]
                            );

                    }
                );

            return result;

        }


        return value;

    }


    /* ============================================================
       06 — SERVICE LOOKUPS
       ============================================================ */

    function getKernel() {

        return (
            window.HalDoKernel ||
            HalDoOS.kernel ||
            null
        );

    }


    function getSystem() {

        return (
            window.HalDoSystem ||
            HalDoOS.system ||
            null
        );

    }


    function getAICore() {

        return (
            window.HalDoAICore ||
            HalDoOS.aiCore ||
            null
        );

    }


    function getLanguageManager() {

        return (
            window.HalDoLanguageManager ||
            HalDoOS.languageManager ||
            null
        );

    }


    function getVoice() {

        return (
            window.HalDoVoice ||
            window.HalDoVoiceManager ||
            HalDoOS.voice ||
            HalDoOS.voiceManager ||
            null
        );

    }


    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            HalDoOS.appRegistry ||
            null
        );

    }


    function getCosmic() {

        return (
            window.HalDoCosmicWorld ||
            HalDoOS.cosmicWorld ||
            HalDoOS.cosmic ||
            null
        );

    }


    function getStorage() {

        return (
            window.HalDoStorage ||
            HalDoOS.storage ||
            null
        );

    }


    /* ============================================================
       07 — EVENTS
       ============================================================ */

    function on(
        event,
        callback
    ) {

        if (
            typeof callback !== "function"
        ) {

            return function () {};

        }


        if (
            !state.listeners.has(event)
        ) {

            state.listeners.set(
                event,
                new Set()
            );

        }


        const listeners =
            state.listeners.get(
                event
            );


        listeners.add(
            callback
        );


        return function () {

            off(
                event,
                callback
            );

        };

    }


    function off(
        event,
        callback
    ) {

        const listeners =
            state.listeners.get(
                event
            );


        if (!listeners) {

            return;

        }


        listeners.delete(
            callback
        );


        if (
            listeners.size === 0
        ) {

            state.listeners.delete(
                event
            );

        }

    }


    function emit(
        event,
        data = null
    ) {

        const listeners =
            state.listeners.get(
                event
            );


        if (listeners) {

            Array.from(listeners)
                .forEach(
                    callback => {

                        try {

                            callback(
                                data
                            );

                        } catch (exception) {

                            reportError(
                                exception,
                                "Avatar Event: " + event
                            );

                        }

                    }
                );

        }


        const events =
            HalDoOS.events;


        if (
            events &&
            hasMethod(
                events,
                "emit"
            )
        ) {

            try {

                events.emit(
                    "ai-avatar:" + event,
                    data
                );

            } catch (_) {}

        }


        const kernel =
            getKernel();


        if (
            kernel &&
            hasMethod(
                kernel,
                "emit"
            )
        ) {

            try {

                kernel.emit(
                    "ai-avatar:" + event,
                    data
                );

            } catch (_) {}

        }

    }


    /* ============================================================
       08 — ERROR HANDLING
       ============================================================ */

    function reportError(
        exception,
        context =
            "HalDo AI Avatar"
    ) {

        const normalized =
            exception instanceof Error
                ? exception
                : new Error(
                    String(
                        exception
                    )
                );


        const record = {

            name:
                normalized.name,

            message:
                normalized.message,

            stack:
                normalized.stack || "",

            context,

            timestamp:
                new Date().toISOString()

        };


        errorLog(
            "[HalDo AI Avatar]",
            record
        );


        emit(
            "error",
            record
        );


        const kernel =
            getKernel();


        if (
            kernel &&
            hasMethod(
                kernel,
                "reportError"
            )
        ) {

            try {

                kernel.reportError(
                    normalized,
                    context
                );

            } catch (_) {}

        }


        return record;

    }


    /* ============================================================
       09 — LOGO PATH
       ============================================================ */

    function findLogoPath() {

        if (
            state.settings.logoPath
        ) {

            return state.settings.logoPath;

        }


        if (
            window.HALDO_LOGO_PATH
        ) {

            return window.HALDO_LOGO_PATH;

        }


        if (
            HalDoOS.logoPath
        ) {

            return HalDoOS.logoPath;

        }


        return DEFAULT_LOGO_PATHS[0];

    }


    function resolveLogoPath() {

        return new Promise(
            resolve => {

                const paths = [];

                if (
                    state.settings.logoPath
                ) {

                    paths.push(
                        state.settings.logoPath
                    );

                }


                if (
                    window.HALDO_LOGO_PATH
                ) {

                    paths.push(
                        window.HALDO_LOGO_PATH
                    );

                }


                DEFAULT_LOGO_PATHS
                    .forEach(
                        path => {

                            if (
                                !paths.includes(
                                    path
                                )
                            ) {

                                paths.push(
                                    path
                                );

                            }

                        }
                    );


                let index = 0;


                function testNext() {

                    if (
                        index >=
                        paths.length
                    ) {

                        resolve(
                            findLogoPath()
                        );

                        return;

                    }


                    const path =
                        paths[index++];


                    const image =
                        new Image();


                    image.onload =
                        function () {

                            resolve(
                                path
                            );

                        };


                    image.onerror =
                        function () {

                            testNext();

                        };


                    image.src =
                        path;

                }


                testNext();

            }
        );

    }


    /* ============================================================
       10 — ROOT CREATION
       ============================================================ */

    function createRoot() {

        if (
            state.rootElement
        ) {

            return state.rootElement;

        }


        const root =
            document.createElement(
                "div"
            );


        root.className =
            "haldo-ai-avatar";


        root.setAttribute(
            "data-haldo-ai-avatar",
            "true"
        );


        root.setAttribute(
            "role",
            "img"
        );


        root.setAttribute(
            "aria-label",
            "HalDo AI"
        );


        root.style.position =
            "relative";


        root.style.display =
            "inline-flex";


        root.style.alignItems =
            "center";


        root.style.justifyContent =
            "center";


        root.style.width =
            "clamp(90px, 14vw, 190px)";


        root.style.height =
            "clamp(90px, 14vw, 190px)";


        root.style.pointerEvents =
            "auto";


        root.style.userSelect =
            "none";


        root.style.transformOrigin =
            "center center";


        root.style.willChange =
            "transform, opacity, filter";


        state.rootElement =
            root;


        return root;

    }


    /* ============================================================
       11 — GLOW
       ============================================================ */

    function createGlow() {

        if (
            state.glowElement
        ) {

            return state.glowElement;

        }


        const glow =
            document.createElement(
                "div"
            );


        glow.className =
            "haldo-ai-avatar-glow";


        glow.setAttribute(
            "aria-hidden",
            "true"
        );


        Object.assign(
            glow.style,
            {

                position:
                    "absolute",

                inset:
                    "-35%",

                borderRadius:
                    "50%",

                background:
                    "radial-gradient(circle, rgba(255,255,255,.48) 0%, rgba(255,220,120,.25) 28%, rgba(120,180,255,.10) 52%, transparent 74%)",

                filter:
                    "blur(14px)",

                opacity:
                    "0.65",

                transform:
                    "scale(1)",

                pointerEvents:
                    "none",

                transition:
                    "opacity .35s ease"

            }
        );


        state.glowElement =
            glow;


        return glow;

    }


    /* ============================================================
       12 — IMAGE
       ============================================================ */

    function createImage(
        logoPath
    ) {

        if (
            state.imageElement
        ) {

            return state.imageElement;

        }


        const image =
            document.createElement(
                "img"
            );


        image.className =
            "haldo-ai-avatar-image";


        image.src =
            logoPath;


        image.alt =
            "HalDo AI";


        image.draggable =
            false;


        image.decoding =
            "async";


        Object.assign(
            image.style,
            {

                position:
                    "relative",

                zIndex:
                    "3",

                width:
                    "72%",

                height:
                    "72%",

                objectFit:
                    "contain",

                display:
                    "block",

                filter:
                    "drop-shadow(0 0 12px rgba(255,255,255,.28))",

                transformOrigin:
                    "center center",

                willChange:
                    "transform, filter"

            }
        );


        state.imageElement =
            image;


        return image;

    }


    /* ============================================================
       13 — STATUS
       ============================================================ */

    function createStatus() {

        if (
            state.statusElement
        ) {

            return state.statusElement;

        }


        const status =
            document.createElement(
                "span"
            );


        status.className =
            "haldo-ai-avatar-status";


        status.setAttribute(
            "aria-hidden",
            "true"
        );


        Object.assign(
            status.style,
            {

                position:
                    "absolute",

                bottom:
                    "-8px",

                left:
                    "50%",

                transform:
                    "translateX(-50%)",

                zIndex:
                    "5",

                padding:
                    "3px 9px",

                borderRadius:
                    "999px",

                fontSize:
                    "10px",

                lineHeight:
                    "1",

                letterSpacing:
                    ".08em",

                textTransform:
                    "uppercase",

                color:
                    "rgba(255,255,255,.82)",

                background:
                    "rgba(10,15,35,.45)",

                border:
                    "1px solid rgba(255,255,255,.12)",

                backdropFilter:
                    "blur(8px)",

                opacity:
                    "0",

                transition:
                    "opacity .25s ease"

            }
        );


        state.statusElement =
            status;


        return status;

    }


    /* ============================================================
       14 — MOUNT
       ============================================================ */

    async function mount(
        target
    ) {

        if (
            !target
        ) {

            target =
                document.querySelector(
                    "[data-haldo-ai-center]"
                ) ||
                document.querySelector(
                    "#haldo-ai-center"
                ) ||
                document.querySelector(
                    ".haldo-ai-center"
                ) ||
                document.body;

        }


        if (
            typeof target === "string"
        ) {

            target =
                document.querySelector(
                    target
                );

        }


        if (
            !target
        ) {

            throw new Error(
                "Kein Avatar-Mount-Ziel gefunden."
            );

        }


        const root =
            createRoot();


        if (
            root.parentElement !== target
        ) {

            target.appendChild(
                root
            );

        }


        const glow =
            createGlow();


        if (
            glow.parentElement !== root
        ) {

            root.appendChild(
                glow
            );

        }


        const logoPath =
            await resolveLogoPath();


        state.logoPath =
            logoPath;


        const image =
            createImage(
                logoPath
            );


        if (
            image.parentElement !== root
        ) {

            root.appendChild(
                image
            );

        }


        const status =
            createStatus();


        if (
            status.parentElement !== root
        ) {

            root.appendChild(
                status
            );

        }


        state.mounted =
            true;


        state.visible =
            true;


        updateVisualState();


        emit(
            "mounted",
            {

                logoPath,

                target

            }
        );


        return root;

    }


    /* ============================================================
       15 — UNMOUNT
       ============================================================ */

    function unmount() {

        stopAnimation();


        if (
            state.rootElement &&
            state.rootElement.parentElement
        ) {

            state.rootElement.parentElement
                .removeChild(
                    state.rootElement
                );

        }


        state.mounted =
            false;


        state.rootElement =
            null;

        state.avatarElement =
            null;

        state.imageElement =
            null;

        state.glowElement =
            null;

        state.statusElement =
            null;


        emit(
            "unmounted"
        );


        return true;

    }


    /* ============================================================
       16 — STATE DEFINITIONS
       ============================================================ */

    const AVATAR_STATES = {

        idle: {

            energy:
                0.18,

            scale:
                1,

            status:
                "",

            glow:
                0.52

        },

        listening: {

            energy:
                0.48,

            scale:
                1.025,

            status:
                "listening",

            glow:
                0.78

        },

        thinking: {

            energy:
                0.62,

            scale:
                1.035,

            status:
                "thinking",

            glow:
                0.92

        },

        speaking: {

            energy:
                0.76,

            scale:
                1.045,

            status:
                "speaking",

            glow:
                1

        },

        processing: {

            energy:
                0.56,

            scale:
                1.025,

            status:
                "processing",

            glow:
                0.82

        },

        happy: {

            energy:
                0.88,

            scale:
                1.055,

            status:
                "happy",

            glow:
                1

        },

        warm: {

            energy:
                0.36,

            scale:
                1.015,

            status:
                "",

            glow:
                0.68

        },

        sleeping: {

            energy:
                0.05,

            scale:
                0.985,

            status:
                "",

            glow:
                0.25

        }

    };


    /* ============================================================
       17 — SET STATE
       ============================================================ */

    function setState(
        nextState,
        options = {}
    ) {

        const normalized =
            String(
                nextState || "idle"
            )
            .trim()
            .toLowerCase();


        if (
            !AVATAR_STATES[
                normalized
            ]
        ) {

            warn(
                "Unbekannter Avatar State:",
                normalized
            );

            return false;

        }


        const previous =
            state.state;


        state.previousState =
            previous;


        state.state =
            normalized;


        state.targetEnergy =
            AVATAR_STATES[
                normalized
            ].energy;


        state.targetScale =
            AVATAR_STATES[
                normalized
            ].scale;


        if (
            options.emotion
        ) {

            state.emotion =
                String(
                    options.emotion
                );

        }


        state.speaking =
            normalized === "speaking";


        state.listening =
            normalized === "listening";


        state.thinking =
            normalized === "thinking";


        state.processing =
            normalized === "processing";


        updateVisualState();


        emit(
            "state-changed",
            {

                previous,

                state:
                    normalized,

                emotion:
                    state.emotion

            }
        );


        return true;

    }


    /* ============================================================
       18 — CONVENIENCE STATES
       ============================================================ */

    function idle() {

        return setState(
            "idle"
        );

    }


    function listen() {

        return setState(
            "listening"
        );

    }


    function think() {

        return setState(
            "thinking"
        );

    }


    function speak() {

        return setState(
            "speaking"
        );

    }


    function process() {

        return setState(
            "processing"
        );

    }


    function happy() {

        return setState(
            "happy",
            {
                emotion:
                    "happy"
            }
        );

    }


    function warm() {

        return setState(
            "warm",
            {
                emotion:
                    "warm"
            }
        );

    }


    /* ============================================================
       19 — VISUAL UPDATE
       ============================================================ */

    function updateVisualState() {

        if (
            !state.rootElement
        ) {

            return;

        }


        const definition =
            AVATAR_STATES[
                state.state
            ] ||
            AVATAR_STATES.idle;


        const intensity =
            clamp(
                Number(
                    state.settings.intensity
                ) || 1,
                0,
                2
            );


        const glow =
            definition.glow *
            intensity;


        state.targetEnergy =
            definition.energy *
            intensity;


        state.targetScale =
            1 +
            (
                definition.scale - 1
            ) *
            intensity;


        state.targetOpacity =
            state.visible &&
            state.enabled
                ? clamp(
                    Number(
                        state.settings.opacity
                    ) || 1,
                    0,
                    1
                )
                : 0;


        state.rootElement.style.opacity =
            String(
                state.opacity
            );


        if (
            state.glowElement
        ) {

            state.glowElement.style.opacity =
                String(
                    clamp(
                        glow,
                        0,
                        1
                    )
                );

        }


        if (
            state.statusElement
        ) {

            const text =
                definition.status;


            state.statusElement.textContent =
                text;


            state.statusElement.style.opacity =
                text
                    ? "1"
                    : "0";

        }

    }


    /* ============================================================
       20 — ANIMATION
       ============================================================ */

    function animationLoop(
        timestamp
    ) {

        if (
            !state.mounted
        ) {

            state.animationFrame =
                null;

            return;

        }


        if (
            !state.lastFrame
        ) {

            state.lastFrame =
                timestamp;

        }


        const delta =
            Math.min(
                100,
                timestamp -
                state.lastFrame
            );


        state.lastFrame =
            timestamp;


        const seconds =
            timestamp /
            1000;


        /*
         * Sanfte Energie-Interpolation.
         */

        state.energy +=
            (
                state.targetEnergy -
                state.energy
            ) *
            Math.min(
                1,
                delta *
                0.008
            );


        state.scale +=
            (
                state.targetScale -
                state.scale
            ) *
            Math.min(
                1,
                delta *
                0.008
            );


        state.opacity +=
            (
                state.targetOpacity -
                state.opacity
            ) *
            Math.min(
                1,
                delta *
                0.008
            );


        /*
         * HalDo AI "Atmung".
         */

        const breathingEnabled =
            state.settings.breathing &&
            state.settings.idleAnimation &&
            !state.settings.reducedMotion;


        let breathing =
            0;


        if (
            breathingEnabled
        ) {

            breathing =
                Math.sin(
                    seconds *
                    1.35
                ) *
                0.012;

        }


        /*
         * Leichte lebendige Bewegung.
         */

        const floating =
            !state.settings.reducedMotion
                ? Math.sin(
                    seconds *
                    0.72
                ) *
                1.7
                : 0;


        /*
         * State-spezifische Reaktion.
         */

        let reaction =
            0;


        if (
            state.state ===
            "speaking"
        ) {

            reaction =
                Math.sin(
                    seconds *
                    7
                ) *
                0.018 *
                state.energy;

        }


        if (
            state.state ===
            "listening"
        ) {

            reaction =
                Math.sin(
                    seconds *
                    3.5
                ) *
                0.012;

        }


        if (
            state.state ===
            "thinking"
        ) {

            reaction =
                Math.sin(
                    seconds *
                    2.1
                ) *
                0.009;

        }


        const finalScale =
            state.scale +
            breathing +
            reaction;


        state.rotation =
            Math.sin(
                seconds *
                0.38
            ) *
            1.4;


        if (
            state.rootElement
        ) {

            state.rootElement.style.transform =
                "translate3d(0," +
                floating +
                "px,0) " +
                "scale(" +
                finalScale +
                ") " +
                "rotate(" +
                state.rotation +
                "deg)";

        }


        if (
            state.imageElement
        ) {

            const imagePulse =
                1 +
                (
                    Math.sin(
                        seconds *
                        2.2
                    ) *
                    0.008 *
                    state.energy
                );


            const brightness =
                1 +
                state.energy *
                0.22;


            state.imageElement.style.transform =
                "scale(" +
                imagePulse +
                ")";


            state.imageElement.style.filter =
                "drop-shadow(0 0 " +
                (
                    10 +
                    state.energy *
                    18
                ) +
                "px rgba(255,255,255,.34)) " +
                "brightness(" +
                brightness +
                ")";

        }


        if (
            state.glowElement
        ) {

            const glowPulse =
                1 +
                Math.sin(
                    seconds *
                    1.6
                ) *
                0.055 *
                state.energy;


            state.glowElement.style.transform =
                "scale(" +
                glowPulse +
                ")";

        }


        state.animationFrame =
            window.requestAnimationFrame(
                animationLoop
            );

    }


    function startAnimation() {

        if (
            state.animationFrame !== null
        ) {

            return;

        }


        state.lastFrame =
            0;


        state.animationFrame =
            window.requestAnimationFrame(
                animationLoop
            );

    }


    function stopAnimation() {

        if (
            state.animationFrame !== null
        ) {

            window.cancelAnimationFrame(
                state.animationFrame
            );

        }


        state.animationFrame =
            null;

    }


    /* ============================================================
       21 — VISIBILITY
       ============================================================ */

    function show() {

        state.visible =
            true;


        updateVisualState();


        emit(
            "shown"
        );


        return true;

    }


    function hide() {

        state.visible =
            false;


        updateVisualState();


        emit(
            "hidden"
        );


        return true;

    }


    /* ============================================================
       22 — ENABLE / DISABLE
       ============================================================ */

    function enable() {

        state.enabled =
            true;


        state.settings.enabled =
            true;


        show();


        emit(
            "enabled"
        );


        return true;

    }


    function disable() {

        state.enabled =
            false;


        state.settings.enabled =
            false;


        hide();


        emit(
            "disabled"
        );


        return true;

    }


    /* ============================================================
       23 — AI REACTIONS
       ============================================================ */

    function reactToUserMessage(
        message
    ) {

        if (
            !message
        ) {

            return;

        }


        listen();


        emit(
            "user-message",
            {

                message

            }
        );

    }


    function reactToThinking(
        active = true
    ) {

        if (
            active
        ) {

            think();

        } else {

            idle();

        }


        emit(
            "thinking",
            {

                active

            }
        );

    }


    function reactToSpeaking(
        active = true
    ) {

        if (
            active
        ) {

            speak();

        } else {

            idle();

        }


        emit(
            "speaking",
            {

                active

            }
        );

    }


    function reactToListening(
        active = true
    ) {

        if (
            active
        ) {

            listen();

        } else {

            idle();

        }


        emit(
            "listening",
            {

                active

            }
        );

    }


    function reactToAudioLevel(
        level
    ) {

        const normalized =
            clamp(
                Number(
                    level
                ) || 0,
                0,
                1
            );


        state.targetEnergy =
            Math.max(
                state.targetEnergy,
                normalized
            );


        emit(
            "audio-level",
            {

                level:
                    normalized

            }
        );

    }


    /* ============================================================
       24 — AI CORE CONNECTION
       ============================================================ */

    function connectAI() {

        const ai =
            getAICore();


        if (!ai) {

            state.connections.ai =
                false;

            return false;

        }


        state.connections.ai =
            true;


        /*
         * Unterschiedliche mögliche AI-Core APIs werden
         * bewusst unterstützt, damit die Registry nicht
         * von einer einzigen zukünftigen Implementierung
         * abhängig ist.
         */

        try {

            if (
                hasMethod(
                    ai,
                    "on"
                )
            ) {

                const events = [

                    "thinking",

                    "ai:thinking",

                    "processing",

                    "ai:processing",

                    "speaking",

                    "ai:speaking",

                    "response-start",

                    "response-end"

                ];


                events.forEach(
                    eventName => {

                        const unsubscribe =
                            ai.on(
                                eventName,
                                data => {

                                    handleAIEvent(
                                        eventName,
                                        data
                                    );

                                }
                            );


                        if (
                            typeof unsubscribe ===
                            "function"
                        ) {

                            state.eventUnsubscribers
                                .push(
                                    unsubscribe
                                );

                        }

                    }
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "AI Connection"
            );

        }


        return true;

    }


    function handleAIEvent(
        eventName,
        data
    ) {

        const name =
            String(
                eventName || ""
            )
            .toLowerCase();


        if (
            name.includes(
                "thinking"
            )
        ) {

            reactToThinking(
                data !== false
            );

            return;

        }


        if (
            name.includes(
                "processing"
            )
        ) {

            if (
                data === false
            ) {

                idle();

            } else {

                process();

            }

            return;

        }


        if (
            name.includes(
                "speaking"
            )
        ) {

            reactToSpeaking(
                data !== false
            );

            return;

        }


        if (
            name.includes(
                "response-start"
            )
        ) {

            think();

            return;

        }


        if (
            name.includes(
                "response-end"
            )
        ) {

            happy();

            window.setTimeout(
                idle,
                1200
            );

        }

    }


    /* ============================================================
       25 — VOICE CONNECTION
       ============================================================ */

    function connectVoice() {

        const voice =
            getVoice();


        if (!voice) {

            state.connections.voice =
                false;

            return false;

        }


        state.connections.voice =
            true;


        try {

            if (
                hasMethod(
                    voice,
                    "on"
                )
            ) {

                const events = [

                    "start",

                    "started",

                    "speaking",

                    "speech-start",

                    "speech-end",

                    "end",

                    "ended",

                    "listening",

                    "listening-start",

                    "listening-end",

                    "volume",

                    "audio-level"

                ];


                events.forEach(
                    eventName => {

                        const unsubscribe =
                            voice.on(
                                eventName,
                                data => {

                                    handleVoiceEvent(
                                        eventName,
                                        data
                                    );

                                }
                            );


                        if (
                            typeof unsubscribe ===
                            "function"
                        ) {

                            state.eventUnsubscribers
                                .push(
                                    unsubscribe
                                );

                        }

                    }
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "Voice Connection"
            );

        }


        return true;

    }


    function handleVoiceEvent(
        eventName,
        data
    ) {

        const name =
            String(
                eventName || ""
            )
            .toLowerCase();


        if (
            name.includes(
                "volume"
            ) ||
            name.includes(
                "audio-level"
            )
        ) {

            const level =
                typeof data ===
                "number"
                    ? data
                    : (
                        data &&
                        (
                            data.level ??
                            data.volume
                        )
                    );


            reactToAudioLevel(
                level
            );


            return;

        }


        if (
            name.includes(
                "speech-start"
            ) ||
            name === "start" ||
            name === "started" ||
            name === "speaking"
        ) {

            reactToSpeaking(
                true
            );


            return;

        }


        if (
            name.includes(
                "speech-end"
            ) ||
            name === "end" ||
            name === "ended"
        ) {

            reactToSpeaking(
                false
            );


            return;

        }


        if (
            name.includes(
                "listening"
            )
        ) {

            reactToListening(
                data !== false
            );

        }

    }


    /* ============================================================
       26 — COSMIC CONNECTION
       ============================================================ */

    function connectCosmic() {

        const cosmic =
            getCosmic();


        if (!cosmic) {

            state.connections.cosmic =
                false;

            return false;

        }


        state.connections.cosmic =
            true;


        try {

            if (
                hasMethod(
                    cosmic,
                    "setAIAvatar"
                )
            ) {

                cosmic.setAIAvatar(
                    api
                );

            }


            if (
                hasMethod(
                    cosmic,
                    "setCenterAvatar"
                )
            ) {

                cosmic.setCenterAvatar(
                    api
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "Cosmic Connection"
            );

        }


        return true;

    }


    /* ============================================================
       27 — REGISTRY CONNECTION
       ============================================================ */

    function connectRegistry() {

        const registry =
            getRegistry();


        if (!registry) {

            state.connections.registry =
                false;

            return false;

        }


        state.connections.registry =
            true;


        try {

            if (
                hasMethod(
                    registry,
                    "register"
                )
            ) {

                registry.register({

                    id:
                        MODULE_ID,

                    appId:
                        MODULE_ID,

                    name:
                        NAME,

                    title:
                        "HalDo AI",

                    description:
                        "Lebendiger zentraler HalDo AI Avatar.",

                    category:
                        "ai",

                    version:
                        VERSION,

                    system:
                        true,

                    core:
                        true,

                    visible:
                        false,

                    capabilities: [

                        "ai-avatar",

                        "ai-presence",

                        "visual-reaction",

                        "voice-reaction",

                        "chat-reaction",

                        "cosmic-center"

                    ],

                    permissions: [

                        "ai",

                        "ui",

                        "events",

                        "voice"

                    ]

                });

            }

        } catch (exception) {

            reportError(
                exception,
                "Registry Connection"
            );

        }


        return true;

    }


    /* ============================================================
       28 — LANGUAGE CONNECTION
       ============================================================ */

    function connectLanguage() {

        const language =
            getLanguageManager();


        if (!language) {

            state.connections.language =
                false;

            return false;

        }


        state.connections.language =
            true;


        return true;

    }


    /* ============================================================
       29 — SERVICE CONNECTIONS
       ============================================================ */

    function refreshConnections() {

        state.connections.kernel =
            !!getKernel();


        state.connections.system =
            !!getSystem();


        state.connections.storage =
            !!getStorage();


        connectAI();

        connectVoice();

        connectCosmic();

        connectRegistry();

        connectLanguage();


        state.connected =
            Object.values(
                state.connections
            )
            .some(Boolean);


        emit(
            "connections-changed",
            getConnectionStatus()
        );


        return getConnectionStatus();

    }


    function getConnectionStatus() {

        return clone(
            state.connections
        );

    }


    /* ============================================================
       30 — STORAGE
       ============================================================ */

    function save() {

        const payload = {

            version:
                VERSION,

            settings:
                clone(
                    state.settings
                ),

            visible:
                state.visible,

            enabled:
                state.enabled,

            timestamp:
                new Date().toISOString()

        };


        try {

            const storage =
                getStorage();


            if (
                storage &&
                hasMethod(
                    storage,
                    "set"
                )
            ) {

                const result =
                    storage.set(
                        STORAGE_KEY,
                        payload
                    );


                if (
                    result !== false
                ) {

                    emit(
                        "saved",
                        payload
                    );


                    return true;

                }

            }

        } catch (exception) {

            reportError(
                exception,
                "Avatar Storage Save"
            );

        }


        try {

            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    payload
                )
            );


            emit(
                "saved",
                payload
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Avatar LocalStorage Save"
            );


            return false;

        }

    }


    function load() {

        let data =
            null;


        try {

            const storage =
                getStorage();


            if (
                storage &&
                hasMethod(
                    storage,
                    "get"
                )
            ) {

                data =
                    storage.get(
                        STORAGE_KEY
                    );

            }

        } catch (exception) {

            reportError(
                exception,
                "Avatar Storage Load"
            );

        }


        if (!data) {

            try {

                const raw =
                    window.localStorage.getItem(
                        STORAGE_KEY
                    );


                if (raw) {

                    data =
                        JSON.parse(
                            raw
                        );

                }

            } catch (exception) {

                reportError(
                    exception,
                    "Avatar LocalStorage Load"
                );

            }

        }


        if (
            !data ||
            typeof data !==
            "object"
        ) {

            return false;

        }


        if (
            data.settings &&
            typeof data.settings ===
            "object"
        ) {

            state.settings = {

                ...state.settings,

                ...data.settings

            };

        }


        if (
            typeof data.visible ===
            "boolean"
        ) {

            state.visible =
                data.visible;

        }


        if (
            typeof data.enabled ===
            "boolean"
        ) {

            state.enabled =
                data.enabled;

        }


        emit(
            "loaded",
            data
        );


        return true;

    }


    /* ============================================================
       31 — SETTINGS
       ============================================================ */

    function getSettings() {

        return clone(
            state.settings
        );

    }


    function setSettings(
        changes = {},
        options = {}
    ) {

        if (
            !changes ||
            typeof changes !==
            "object"
        ) {

            return getSettings();

        }


        state.settings = {

            ...state.settings,

            ...changes

        };


        if (
            changes.enabled !== undefined
        ) {

            state.enabled =
                Boolean(
                    changes.enabled
                );

        }


        if (
            changes.opacity !== undefined
        ) {

            state.settings.opacity =
                clamp(
                    Number(
                        changes.opacity
                    ) || 0,
                    0,
                    1
                );

        }


        if (
            changes.intensity !== undefined
        ) {

            state.settings.intensity =
                clamp(
                    Number(
                        changes.intensity
                    ) || 0,
                    0,
                    2
                );

        }


        if (
            changes.logoPath
        ) {

            state.settings.logoPath =
                String(
                    changes.logoPath
                );

        }


        updateVisualState();


        if (
            options.save !== false
        ) {

            save();

        }


        emit(
            "settings-changed",
            getSettings()
        );


        return getSettings();

    }


    /* ============================================================
       32 — ACCESSIBILITY
       ============================================================ */

    function setReducedMotion(
        enabled
    ) {

        state.settings.reducedMotion =
            Boolean(
                enabled
            );


        if (
            state.rootElement
        ) {

            state.rootElement.style.transition =
                state.settings.reducedMotion
                    ? "none"
                    : "";

        }


        updateVisualState();


        emit(
            "reduced-motion-changed",
            {

                enabled:
                    state.settings.reducedMotion

            }
        );


        return true;

    }


    /* ============================================================
       33 — DIAGNOSTICS
       ============================================================ */

    function diagnostics() {

        return {

            name:
                NAME,

            version:
                VERSION,

            module:
                MODULE_ID,

            initialized:
                state.initialized,

            initializing:
                state.initializing,

            ready:
                state.ready,

            failed:
                state.failed,

            mounted:
                state.mounted,

            visible:
                state.visible,

            enabled:
                state.enabled,

            state:
                state.state,

            previousState:
                state.previousState,

            emotion:
                state.emotion,

            logoPath:
                state.logoPath,

            connections:
                getConnectionStatus(),

            settings:
                getSettings(),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ============================================================
       34 — PUBLIC API
       ============================================================ */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


        /*
         * Initialization
         */

        initialize:
            initialize,

        boot:
            boot,


        /*
         * Mount
         */

        mount,

        unmount,


        /*
         * State
         */

        getState:
            () => state.state,

        setState,

        idle,

        listen,

        think,

        speak,

        process,

        happy,

        warm,


        /*
         * AI reactions
         */

        reactToUserMessage,

        reactToThinking,

        reactToSpeaking,

        reactToListening,

        reactToAudioLevel,


        /*
         * Visibility
         */

        show,

        hide,

        enable,

        disable,


        /*
         * Settings
         */

        getSettings,

        setSettings,

        setReducedMotion,


        /*
         * Events
         */

        on,

        off,

        emit,


        /*
         * Connections
         */

        refreshConnections,

        getConnectionStatus,


        /*
         * Persistence
         */

        save,

        load,


        /*
         * Diagnostics
         */

        diagnostics

    };


    /* ============================================================
       35 — GLOBAL EXPORT
       ============================================================ */

    window.HalDoAIAvatar =
        api;

    window.HalDoOSAIAvatar =
        api;

    HalDoOS.aiAvatar =
        api;


    HalDoOS.services =
        HalDoOS.services || {};

    HalDoOS.services.aiAvatar =
        api;


    /* ============================================================
       36 — INITIALIZATION
       ============================================================ */

    async function initialize() {

        if (
            state.ready
        ) {

            return api;

        }


        if (
            state.initializing
        ) {

            return api;

        }


        state.initializing =
            true;

        state.initialized =
            true;

        state.failed =
            false;


        emit(
            "initializing",
            {

                version:
                    VERSION

            }
        );


        try {

            load();


            refreshConnections();


            /*
             * Automatisch einen sinnvollen zentralen
             * Avatar-Mount suchen.
             */

            const target =
                document.querySelector(
                    "[data-haldo-ai-center]"
                ) ||
                document.querySelector(
                    "#haldo-ai-center"
                ) ||
                document.querySelector(
                    ".haldo-ai-center"
                );


            if (
                target
            ) {

                await mount(
                    target
                );

            }


            startAnimation();


            updateVisualState();


            state.ready =
                true;

            state.initializing =
                false;


            emit(
                "ready",
                {

                    diagnostics:
                        diagnostics()

                }
            );


            log(
                "HalDo AI Avatar bereit."
            );


            return api;

        } catch (exception) {

            state.initializing =
                false;

            state.failed =
                true;


            reportError(
                exception,
                "Avatar Initialization"
            );


            throw exception;

        }

    }


    /* ============================================================
       37 — EVENT CONNECTION RETRY
       ============================================================ */

    function retryConnections() {

        /*
         * Andere Core-Module können später als der Avatar
         * geladen werden. Deshalb wird die Verbindung
         * wiederholt überprüft.
         */

        refreshConnections();


        if (
            state.mounted
        ) {

            startAnimation();

        }


        return getConnectionStatus();

    }


    /* ============================================================
       38 — BOOT
       ============================================================ */

    function boot() {

        initialize()
            .catch(
                exception => {

                    state.failed =
                        true;


                    reportError(
                        exception,
                        "Avatar Boot"
                    );

                }
            );

    }


    /* ============================================================
       39 — DOM READY
       ============================================================ */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot,
            {
                once:
                    true
            }
        );

    } else {

        boot();

    }


    /* ============================================================
       40 — SYSTEM EVENTS
       ============================================================ */

    window.addEventListener(
        "beforeunload",
        function () {

            try {

                save();

            } catch (_) {}

        }
    );


    /*
     * Reduced Motion des Browsers berücksichtigen.
     */

    try {

        const media =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );


        if (
            media.matches
        ) {

            setReducedMotion(
                true
            );

        }


        if (
            hasMethod(
                media,
                "addEventListener"
            )
        ) {

            media.addEventListener(
                "change",
                event => {

                    setReducedMotion(
                        event.matches
                    );

                }
            );

        }

    } catch (_) {}


    /* ============================================================
       END
       HALDO AI OS 20
       HALDO AI AVATAR CONTROLLER
       ============================================================ */

})(window, document);