/* ============================================================
   HALDO AI OS 20
   HALDO AI AVATAR ENGINE
   ------------------------------------------------------------
   Datei:
       js/ai/ai-avatar.js

   Pfad:
       /js/ai/ai-avatar.js

   Verantwortlich für:

   - lebendiger HalDo AI Avatar
   - HalDo Logo als Avatar
   - Avatar Zustände
   - Atmung / Glow
   - Sprechen
   - Zuhören
   - Denken
   - Emotionen
   - AI Verbindung
   - Voice Verbindung
   - Event Bus Verbindung
   - App Registry Verbindung
   - Cosmic World Verbindung
   - Sonnenzentrum Verbindung
   - Animationen
   - Accessibility
   - Fehlerbehandlung

   WICHTIG:

   Kein Roboter-Emoji.

   Der Avatar verwendet das echte HalDo Logo:

       assets/logo/logo.png

   Der Avatar soll nicht wie ein statisches Bild wirken,
   sondern wie eine lebendige digitale Persönlichkeit.
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

    const LOGO_PATH =
        "assets/logo/logo.png";


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

        state:
            "idle",

        previousState:
            "idle",

        emotion:
            "neutral",

        intensity:
            0.5,

        speaking:
            false,

        listening:
            false,

        thinking:
            false,

        muted:
            false,

        visible:
            true,

        enabled:
            true,

        voiceConnected:
            false,

        aiConnected:
            false,

        registryConnected:
            false,

        kernelConnected:
            false,

        systemConnected:
            false,

        container:
            null,

        image:
            null,

        glow:
            null,

        listeners:
            new Map(),

        timers:
            new Set(),

        statistics: {

            stateChanges:
                0,

            emotionChanges:
                0,

            speechStarts:
                0,

            speechEnds:
                0,

            listeningStarts:
                0,

            listeningEnds:
                0,

            thinkingStarts:
                0,

            thinkingEnds:
                0,

            errors:
                0

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
        min = 0,
        max = 1
    ) {

        return Math.min(
            max,
            Math.max(
                min,
                Number(value) || 0
            )
        );

    }


    function normalize(
        value
    ) {

        return String(
            value || ""
        )
        .trim()
        .toLowerCase();

    }


    function createElement(
        tag,
        className
    ) {

        const element =
            document.createElement(
                tag
            );

        if (className) {

            element.className =
                className;

        }

        return element;

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
            window.HalDoAI ||
            null
        );

    }


    function getVoice() {

        return (
            window.HalDoVoice ||
            HalDoOS.voice ||
            window.HalDoSpeech ||
            HalDoOS.speech ||
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


    /* ============================================================
       07 — INTERNAL EVENTS
       ============================================================ */

    function on(
        event,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return function () {};

        }


        if (
            !state.listeners.has(
                event
            )
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

            Array.from(
                listeners
            )
            .forEach(
                callback => {

                    try {

                        callback(
                            data
                        );

                    } catch (exception) {

                        reportError(
                            exception,
                            "Avatar Event: " +
                            event
                        );

                    }

                }
            );

        }


        /*
         * HalDoOS Event Bus
         */

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


        /*
         * Kernel Event Bus
         */

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

        state.statistics.errors +=
            1;


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
       09 — CSS
       ============================================================ */

    function injectStyles() {

        if (
            document.getElementById(
                "haldo-ai-avatar-styles"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "haldo-ai-avatar-styles";


        style.textContent = `

            .haldo-ai-avatar {

                position:
                    relative;

                width:
                    min(
                        30vw,
                        340px
                    );

                height:
                    min(
                        30vw,
                        340px
                    );

                min-width:
                    150px;

                min-height:
                    150px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                border-radius:
                    50%;

                user-select:
                    none;

                pointer-events:
                    auto;

                isolation:
                    isolate;

                transform:
                    translateZ(0);

                transition:
                    transform
                    500ms
                    ease,
                    opacity
                    400ms
                    ease,
                    filter
                    500ms
                    ease;

                animation:
                    haldoAvatarFloat
                    6s
                    ease-in-out
                    infinite;

            }


            .haldo-ai-avatar::before {

                content:
                    "";

                position:
                    absolute;

                inset:
                    -22%;

                border-radius:
                    50%;

                background:
                    radial-gradient(
                        circle,
                        rgba(
                            255,
                            236,
                            166,
                            .48
                        ) 0%,
                        rgba(
                            255,
                            206,
                            92,
                            .22
                        ) 32%,
                        rgba(
                            255,
                            185,
                            70,
                            .08
                        ) 58%,
                        transparent
                        76%
                    );

                filter:
                    blur(
                        12px
                    );

                z-index:
                    -2;

                opacity:
                    .85;

                animation:
                    haldoAvatarAura
                    4.8s
                    ease-in-out
                    infinite;

            }


            .haldo-ai-avatar::after {

                content:
                    "";

                position:
                    absolute;

                inset:
                    -8%;

                border:
                    1px
                    solid
                    rgba(
                        255,
                        238,
                        180,
                        .28
                    );

                border-radius:
                    50%;

                box-shadow:
                    0
                    0
                    35px
                    rgba(
                        255,
                        220,
                        130,
                        .25
                    );

                pointer-events:
                    none;

                z-index:
                    -1;

                animation:
                    haldoAvatarRing
                    7s
                    linear
                    infinite;

            }


            .haldo-ai-avatar-image {

                width:
                    72%;

                height:
                    72%;

                object-fit:
                    contain;

                border-radius:
                    50%;

                display:
                    block;

                filter:
                    drop-shadow(
                        0
                        0
                        10px
                        rgba(
                            255,
                            226,
                            145,
                            .5
                        )
                    );

                transform:
                    translateZ(0);

                transition:
                    transform
                    350ms
                    ease,
                    filter
                    350ms
                    ease;

                animation:
                    haldoAvatarBreathing
                    4.5s
                    ease-in-out
                    infinite;

            }


            .haldo-ai-avatar-glow {

                position:
                    absolute;

                inset:
                    15%;

                border-radius:
                    50%;

                pointer-events:
                    none;

                background:
                    radial-gradient(
                        circle,
                        rgba(
                            255,
                            242,
                            190,
                            .34
                        ),
                        rgba(
                            255,
                            220,
                            130,
                            .12
                        ) 40%,
                        transparent 70%
                    );

                mix-blend-mode:
                    screen;

                opacity:
                    .55;

                animation:
                    haldoAvatarGlow
                    3.8s
                    ease-in-out
                    infinite;

            }


            .haldo-ai-avatar-listening {

                transform:
                    scale(
                        1.035
                    );

            }


            .haldo-ai-avatar-thinking {

                animation-duration:
                    4s;

            }


            .haldo-ai-avatar-speaking {

                transform:
                    scale(
                        1.045
                    );

            }


            .haldo-ai-avatar-happy
            .haldo-ai-avatar-image {

                filter:
                    drop-shadow(
                        0
                        0
                        18px
                        rgba(
                            255,
                            231,
                            140,
                            .82
                        )
                    );

            }


            .haldo-ai-avatar-excited
            .haldo-ai-avatar-image {

                filter:
                    drop-shadow(
                        0
                        0
                        25px
                        rgba(
                            255,
                            235,
                            160,
                            .95
                        )
                    );

                transform:
                    scale(
                        1.055
                    );

            }


            .haldo-ai-avatar-sad {

                filter:
                    saturate(
                        .78
                    );

            }


            .haldo-ai-avatar-error {

                filter:
                    saturate(
                        .65
                    );

            }


            @keyframes haldoAvatarBreathing {

                0%,
                100% {

                    transform:
                        scale(
                            1
                        );

                }

                50% {

                    transform:
                        scale(
                            1.025
                        );

                }

            }


            @keyframes haldoAvatarFloat {

                0%,
                100% {

                    margin-top:
                        0;

                }

                50% {

                    margin-top:
                        -5px;

                }

            }


            @keyframes haldoAvatarAura {

                0%,
                100% {

                    transform:
                        scale(
                            .96
                        );

                    opacity:
                        .65;

                }

                50% {

                    transform:
                        scale(
                            1.08
                        );

                    opacity:
                        1;

                }

            }


            @keyframes haldoAvatarGlow {

                0%,
                100% {

                    transform:
                        scale(
                            .94
                        );

                    opacity:
                        .35;

                }

                50% {

                    transform:
                        scale(
                            1.08
                        );

                    opacity:
                        .72;

                }

            }


            @keyframes haldoAvatarRing {

                from {

                    transform:
                        rotate(
                            0deg
                        )
                        scale(
                            .98
                        );

                }

                to {

                    transform:
                        rotate(
                            360deg
                        )
                        scale(
                            .98
                        );

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* ============================================================
       10 — CONTAINER DISCOVERY
       ============================================================ */

    function findContainer() {

        const selectors = [

            "[data-haldo-ai-avatar]",

            "#haldo-ai-avatar",

            "#haldo-ai-center-avatar",

            ".haldo-ai-avatar-container",

            ".haldo-ai-center",

            ".haldo-sun-center",

            ".sun-center",

            ".cosmic-ai-center"

        ];


        for (
            const selector of selectors
        ) {

            try {

                const element =
                    document.querySelector(
                        selector
                    );


                if (element) {

                    return element;

                }

            } catch (_) {}

        }


        return null;

    }


    /* ============================================================
       11 — MOUNT
       ============================================================ */

    function mount(
        container = null
    ) {

        try {

            injectStyles();


            const target =
                container ||
                findContainer();


            if (!target) {

                warn(
                    "Kein Avatar-Container gefunden."
                );


                return false;

            }


            state.container =
                typeof target ===
                "string"

                    ? document.querySelector(
                        target
                    )

                    : target;


            if (!state.container) {

                return false;

            }


            /*
             * Bereits vorhandenen Avatar verwenden.
             */

            let avatar =
                state.container.querySelector(
                    ".haldo-ai-avatar"
                );


            if (!avatar) {

                avatar =
                    createElement(
                        "div",
                        "haldo-ai-avatar"
                    );

            }


            let glow =
                avatar.querySelector(
                    ".haldo-ai-avatar-glow"
                );


            if (!glow) {

                glow =
                    createElement(
                        "div",
                        "haldo-ai-avatar-glow"
                    );

                avatar.appendChild(
                    glow
                );

            }


            let image =
                avatar.querySelector(
                    ".haldo-ai-avatar-image"
                );


            if (!image) {

                image =
                    createElement(
                        "img",
                        "haldo-ai-avatar-image"
                    );

                avatar.appendChild(
                    image
                );

            }


            image.src =
                LOGO_PATH;

            image.alt =
                "HalDo AI";


            image.draggable =
                false;


            image.decoding =
                "async";


            state.image =
                image;

            state.glow =
                glow;


            if (
                !avatar.parentElement ||
                avatar.parentElement !==
                    state.container
            ) {

                state.container.appendChild(
                    avatar
                );

            }


            state.container.setAttribute(
                "data-haldo-ai-mounted",
                "true"
            );


            state.container.setAttribute(
                "aria-label",
                "HalDo AI"
            );


            state.mounted =
                true;


            updateVisualState();


            emit(
                "mounted",
                {

                    container:
                        state.container,

                    image:
                        image

                }
            );


            log(
                "HalDo AI Avatar montiert."
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Avatar Mount"
            );


            return false;

        }

    }


    /* ============================================================
       12 — UNMOUNT
       ============================================================ */

    function unmount() {

        if (
            !state.container
        ) {

            return;

        }


        const avatar =
            state.container.querySelector(
                ".haldo-ai-avatar"
            );


        if (avatar) {

            avatar.remove();

        }


        state.image =
            null;

        state.glow =
            null;

        state.mounted =
            false;


        emit(
            "unmounted"
        );

    }


    /* ============================================================
       13 — VISUAL STATE
       ============================================================ */

    function updateVisualState() {

        if (
            !state.mounted ||
            !state.container
        ) {

            return;

        }


        const avatar =
            state.container.querySelector(
                ".haldo-ai-avatar"
            );


        if (!avatar) {

            return;

        }


        const classes = [

            "haldo-ai-avatar-listening",

            "haldo-ai-avatar-thinking",

            "haldo-ai-avatar-speaking",

            "haldo-ai-avatar-happy",

            "haldo-ai-avatar-excited",

            "haldo-ai-avatar-sad",

            "haldo-ai-avatar-error"

        ];


        avatar.classList.remove(
            ...classes
        );


        const current =
            normalize(
                state.state
            );


        if (
            current ===
            "listening"
        ) {

            avatar.classList.add(
                "haldo-ai-avatar-listening"
            );

        }


        if (
            current ===
            "thinking"
        ) {

            avatar.classList.add(
                "haldo-ai-avatar-thinking"
            );

        }


        if (
            current ===
            "speaking"
        ) {

            avatar.classList.add(
                "haldo-ai-avatar-speaking"
            );

        }


        const emotion =
            normalize(
                state.emotion
            );


        if (
            emotion ===
            "happy"
        ) {

            avatar.classList.add(
                "haldo-ai-avatar-happy"
            );

        }


        if (
            emotion ===
            "excited"
        ) {

            avatar.classList.add(
                "haldo-ai-avatar-excited"
            );

        }


        if (
            emotion ===
            "sad"
        ) {

            avatar.classList.add(
                "haldo-ai-avatar-sad"
            );

        }


        if (
            emotion ===
            "error"
        ) {

            avatar.classList.add(
                "haldo-ai-avatar-error"
            );

        }


        avatar.dataset.state =
            state.state;

        avatar.dataset.emotion =
            state.emotion;

        avatar.dataset.intensity =
            String(
                state.intensity
            );


        avatar.setAttribute(
            "aria-live",
            state.speaking
                ? "polite"
                : "off"
        );

    }


    /* ============================================================
       14 — SET STATE
       ============================================================ */

    function setState(
        nextState,
        options = {}
    ) {

        const value =
            normalize(
                nextState
            ) ||
            "idle";


        const allowed = [

            "idle",

            "listening",

            "thinking",

            "speaking",

            "happy",

            "sad",

            "excited",

            "error",

            "sleeping"

        ];


        const normalized =
            allowed.includes(
                value
            )
                ? value
                : "idle";


        const previous =
            state.state;


        state.previousState =
            previous;

        state.state =
            normalized;


        if (
            normalized ===
            "listening"
        ) {

            state.listening =
                true;

        } else if (
            options.keepListening !==
            true
        ) {

            state.listening =
                false;

        }


        if (
            normalized ===
            "thinking"
        ) {

            state.thinking =
                true;

        } else if (
            options.keepThinking !==
            true
        ) {

            state.thinking =
                false;

        }


        if (
            normalized ===
            "speaking"
        ) {

            state.speaking =
                true;

        } else if (
            options.keepSpeaking !==
            true
        ) {

            state.speaking =
                false;

        }


        state.statistics.stateChanges +=
            1;


        updateVisualState();


        emit(
            "state-changed",
            {

                state:
                    normalized,

                previous,

                emotion:
                    state.emotion,

                intensity:
                    state.intensity

            }
        );


        return normalized;

    }


    /* ============================================================
       15 — EMOTION
       ============================================================ */

    function setEmotion(
        emotion,
        intensity = 0.5
    ) {

        const value =
            normalize(
                emotion
            ) ||
            "neutral";


        const previous =
            state.emotion;


        state.emotion =
            value;


        state.intensity =
            clamp(
                intensity
            );


        state.statistics.emotionChanges +=
            1;


        updateVisualState();


        emit(
            "emotion-changed",
            {

                emotion:
                    value,

                previous,

                intensity:
                    state.intensity

            }
        );


        return value;

    }


    /* ============================================================
       16 — CONVENIENCE EMOTIONS
       ============================================================ */

    function happy(
        intensity = 0.75
    ) {

        setEmotion(
            "happy",
            intensity
        );

        setState(
            "happy"
        );

        return api;

    }


    function excited(
        intensity = 0.9
    ) {

        setEmotion(
            "excited",
            intensity
        );

        setState(
            "excited"
        );

        return api;

    }


    function sad(
        intensity = 0.45
    ) {

        setEmotion(
            "sad",
            intensity
        );

        setState(
            "sad"
        );

        return api;

    }


    function neutral() {

        setEmotion(
            "neutral",
            0.5
        );

        setState(
            "idle"
        );

        return api;

    }


    function errorState() {

        setEmotion(
            "error",
            0.7
        );

        setState(
            "error"
        );

        return api;

    }


    /* ============================================================
       17 — LISTENING
       ============================================================ */

    function startListening() {

        state.listening =
            true;


        state.statistics.listeningStarts +=
            1;


        setState(
            "listening",
            {
                keepListening:
                    true
            }
        );


        emit(
            "listening-start"
        );


        return true;

    }


    function stopListening() {

        state.listening =
            false;


        state.statistics.listeningEnds +=
            1;


        if (
            state.state ===
            "listening"
        ) {

            setState(
                "idle"
            );

        }


        emit(
            "listening-end"
        );


        return true;

    }


    /* ============================================================
       18 — THINKING
       ============================================================ */

    function startThinking() {

        state.thinking =
            true;


        state.statistics.thinkingStarts +=
            1;


        setState(
            "thinking",
            {
                keepThinking:
                    true
            }
        );


        emit(
            "thinking-start"
        );


        return true;

    }


    function stopThinking() {

        state.thinking =
            false;


        state.statistics.thinkingEnds +=
            1;


        if (
            state.state ===
            "thinking"
        ) {

            setState(
                "idle"
            );

        }


        emit(
            "thinking-end"
        );


        return true;

    }


    /* ============================================================
       19 — SPEAKING
       ============================================================ */

    function startSpeaking(
        text = ""
    ) {

        state.speaking =
            true;


        state.statistics.speechStarts +=
            1;


        setState(
            "speaking",
            {
                keepSpeaking:
                    true
            }
        );


        emit(
            "speech-start",
            {

                text:
                    String(
                        text || ""
                    )

            }
        );


        return true;

    }


    function stopSpeaking() {

        state.speaking =
            false;


        state.statistics.speechEnds +=
            1;


        if (
            state.state ===
            "speaking"
        ) {

            setState(
                "idle"
            );

        }


        emit(
            "speech-end"
        );


        return true;

    }


    /* ============================================================
       20 — AI RESPONSE CONNECTION
       ============================================================ */

    async function respond(
        prompt,
        options = {}
    ) {

        const ai =
            getAICore();


        if (!ai) {

            warn(
                "AI Core nicht verfügbar."
            );


            errorState();


            return null;

        }


        try {

            startThinking();


            state.aiConnected =
                true;


            let result;


            if (
                hasMethod(
                    ai,
                    "respond"
                )
            ) {

                result =
                    await ai.respond(
                        prompt,
                        options
                    );

            } else if (
                hasMethod(
                    ai,
                    "chat"
                )
            ) {

                result =
                    await ai.chat(
                        prompt,
                        options
                    );

            } else if (
                hasMethod(
                    ai,
                    "ask"
                )
            ) {

                result =
                    await ai.ask(
                        prompt,
                        options
                    );

            } else {

                throw new Error(
                    "AI Core besitzt keine unterstützte Antwortfunktion."
                );

            }


            stopThinking();


            emit(
                "ai-response",
                {

                    prompt,

                    response:
                        result

                }
            );


            return result;

        } catch (exception) {

            stopThinking();

            reportError(
                exception,
                "AI Response"
            );


            errorState();


            return null;

        }

    }


    /* ============================================================
       21 — VOICE CONNECTION
       ============================================================ */

    async function speak(
        text,
        options = {}
    ) {

        const message =
            String(
                text || ""
            )
            .trim();


        if (!message) {

            return false;

        }


        const voice =
            getVoice();


        startSpeaking(
            message
        );


        try {

            state.voiceConnected =
                !!voice;


            if (
                voice
            ) {

                if (
                    hasMethod(
                        voice,
                        "speak"
                    )
                ) {

                    await voice.speak(
                        message,
                        options
                    );

                } else if (
                    hasMethod(
                        voice,
                        "say"
                    )
                ) {

                    await voice.say(
                        message,
                        options
                    );

                } else if (
                    hasMethod(
                        voice,
                        "synthesize"
                    )
                ) {

                    await voice.synthesize(
                        message,
                        options
                    );

                } else {

                    await browserSpeak(
                        message,
                        options
                    );

                }

            } else {

                await browserSpeak(
                    message,
                    options
                );

            }


            stopSpeaking();


            return true;

        } catch (exception) {

            stopSpeaking();


            reportError(
                exception,
                "Avatar Speak"
            );


            return false;

        }

    }


    /* ============================================================
       22 — BROWSER SPEECH FALLBACK
       ============================================================ */

    function browserSpeak(
        text,
        options = {}
    ) {

        return new Promise(
            resolve => {

                try {

                    if (
                        !window.speechSynthesis ||
                        typeof window.SpeechSynthesisUtterance !==
                            "function"
                    ) {

                        resolve(
                            false
                        );

                        return;

                    }


                    const utterance =
                        new SpeechSynthesisUtterance(
                            text
                        );


                    if (
                        options.lang
                    ) {

                        utterance.lang =
                            options.lang;

                    }


                    if (
                        options.rate !==
                        undefined
                    ) {

                        utterance.rate =
                            options.rate;

                    }


                    if (
                        options.pitch !==
                        undefined
                    ) {

                        utterance.pitch =
                            options.pitch;

                    }


                    if (
                        options.volume !==
                        undefined
                    ) {

                        utterance.volume =
                            options.volume;

                    }


                    utterance.onend =
                        function () {

                            resolve(
                                true
                            );

                        };


                    utterance.onerror =
                        function () {

                            resolve(
                                false
                            );

                        };


                    window.speechSynthesis.speak(
                        utterance
                    );

                } catch (_) {

                    resolve(
                        false
                    );

                }

            }
        );

    }


    /* ============================================================
       23 — AVATAR REACTION
       ============================================================ */

    function react(
        reaction,
        intensity = 0.7
    ) {

        const value =
            normalize(
                reaction
            );


        switch (
            value
        ) {

            case "happy":

            case "smile":

            case "joy":

                return happy(
                    intensity
                );


            case "excited":

            case "celebrate":

            case "wow":

                return excited(
                    intensity
                );


            case "sad":

            case "sorry":

                return sad(
                    intensity
                );


            case "error":

            case "confused":

                return errorState();


            case "thinking":

                startThinking();

                return api;


            case "listening":

                startListening();

                return api;


            case "speaking":

                startSpeaking();

                return api;


            default:

                return neutral();

        }

    }


    /* ============================================================
       24 — GENTLE WELCOME
       ============================================================ */

    async function welcome() {

        happy(
            0.68
        );


        emit(
            "welcome"
        );


        /*
         * Kein automatischer Sprachstart.
         *
         * Browser blockieren häufig Audio ohne
         * Benutzerinteraktion.
         */

        return true;

    }


    /* ============================================================
       25 — APP REGISTRY CONNECTION
       ============================================================ */

    function connectRegistry() {

        const registry =
            getRegistry();


        if (!registry) {

            state.registryConnected =
                false;

            return false;

        }


        state.registryConnected =
            true;


        try {

            if (
                hasMethod(
                    registry,
                    "on"
                )
            ) {

                registry.on(
                    "launched",
                    data => {

                        emit(
                            "app-launched",
                            data
                        );

                    }
                );


                registry.on(
                    "launch-failed",
                    data => {

                        react(
                            "error"
                        );


                        emit(
                            "app-launch-failed",
                            data
                        );

                    }
                );

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
       26 — KERNEL CONNECTION
       ============================================================ */

    function connectKernel() {

        const kernel =
            getKernel();


        if (!kernel) {

            state.kernelConnected =
                false;

            return false;

        }


        state.kernelConnected =
            true;


        try {

            if (
                hasMethod(
                    kernel,
                    "registerModule"
                )
            ) {

                kernel.registerModule(
                    MODULE_ID,
                    api
                );

            }


            if (
                hasMethod(
                    kernel,
                    "setModuleReady"
                )
            ) {

                kernel.setModuleReady(
                    MODULE_ID,
                    true
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "Kernel Connection"
            );

        }


        return true;

    }


    /* ============================================================
       27 — SYSTEM CONNECTION
       ============================================================ */

    function connectSystem() {

        const system =
            getSystem();


        if (!system) {

            state.systemConnected =
                false;

            return false;

        }


        state.systemConnected =
            true;


        try {

            if (
                hasMethod(
                    system,
                    "registerModule"
                )
            ) {

                system.registerModule(
                    MODULE_ID,
                    api
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "System Connection"
            );

        }


        return true;

    }


    /* ============================================================
       28 — CONNECTION STATUS
       ============================================================ */

    function refreshConnections() {

        state.kernelConnected =
            !!getKernel();

        state.systemConnected =
            !!getSystem();

        state.aiConnected =
            !!getAICore();

        state.voiceConnected =
            !!getVoice();

        state.registryConnected =
            !!getRegistry();


        connectKernel();

        connectSystem();

        connectRegistry();


        emit(
            "connections-refreshed",
            getConnectionStatus()
        );


        return getConnectionStatus();

    }


    function getConnectionStatus() {

        return {

            kernel:
                state.kernelConnected,

            system:
                state.systemConnected,

            ai:
                state.aiConnected,

            voice:
                state.voiceConnected,

            registry:
                state.registryConnected

        };

    }


    /* ============================================================
       29 — ENABLE / DISABLE
       ============================================================ */

    function enable() {

        state.enabled =
            true;

        if (
            state.container
        ) {

            state.container.style.display =
                "";

        }


        emit(
            "enabled"
        );


        return true;

    }


    function disable() {

        state.enabled =
            false;

        if (
            state.container
        ) {

            state.container.style.display =
                "none";

        }


        emit(
            "disabled"
        );


        return true;

    }


    function setVisible(
        visible
    ) {

        state.visible =
            Boolean(
                visible
            );


        if (
            state.container
        ) {

            state.container.style.opacity =
                state.visible
                    ? "1"
                    : "0";

            state.container.style.pointerEvents =
                state.visible
                    ? ""
                    : "none";

        }


        emit(
            "visibility-changed",
            {

                visible:
                    state.visible

            }
        );


        return state.visible;

    }


    /* ============================================================
       30 — MUTE
       ============================================================ */

    function setMuted(
        muted
    ) {

        state.muted =
            Boolean(
                muted
            );


        emit(
            "mute-changed",
            {

                muted:
                    state.muted

            }
        );


        return state.muted;

    }


    /* ============================================================
       31 — DIAGNOSTICS
       ============================================================ */

    function diagnostics() {

        return {

            name:
                NAME,

            version:
                VERSION,

            module:
                MODULE_ID,

            logo:
                LOGO_PATH,

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

            enabled:
                state.enabled,

            visible:
                state.visible,

            state:
                state.state,

            previousState:
                state.previousState,

            emotion:
                state.emotion,

            intensity:
                state.intensity,

            speaking:
                state.speaking,

            listening:
                state.listening,

            thinking:
                state.thinking,

            connections:
                getConnectionStatus(),

            statistics:
                {
                    ...state.statistics
                },

            timestamp:
                new Date().toISOString()

        };

    }


    /* ============================================================
       32 — HEALTH
       ============================================================ */

    function healthCheck() {

        const problems = [];


        if (!state.mounted) {

            problems.push(
                "Avatar ist noch nicht montiert."
            );

        }


        if (!state.enabled) {

            problems.push(
                "Avatar ist deaktiviert."
            );

        }


        return {

            healthy:
                problems.length === 0,

            problems,

            mounted:
                state.mounted,

            enabled:
                state.enabled,

            connections:
                getConnectionStatus(),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ============================================================
       33 — STATE ACCESS
       ============================================================ */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            mounted:
                state.mounted,

            enabled:
                state.enabled,

            visible:
                state.visible,

            state:
                state.state,

            previousState:
                state.previousState,

            emotion:
                state.emotion,

            intensity:
                state.intensity,

            speaking:
                state.speaking,

            listening:
                state.listening,

            thinking:
                state.thinking,

            muted:
                state.muted,

            connections:
                getConnectionStatus()

        };

    }


    /* ============================================================
       34 — INITIALIZATION
       ============================================================ */

    async function initialize(
        options = {}
    ) {

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

            injectStyles();


            refreshConnections();


            /*
             * Container kann vom Cosmic UI später
             * bereitgestellt werden.
             */

            if (
                options.container
            ) {

                mount(
                    options.container
                );

            } else {

                mount();

            }


            setState(
                "idle"
            );


            setEmotion(
                "neutral",
                0.5
            );


            state.ready =
                true;

            state.initializing =
                false;


            emit(
                "ready",
                diagnostics()
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
       35 — BOOT
       ============================================================ */

    function boot() {

        initialize()
            .catch(
                exception => {

                    reportError(
                        exception,
                        "Avatar Boot"
                    );

                }
            );

    }


    /* ============================================================
       36 — PUBLIC API
       ============================================================ */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,

        logo:
            LOGO_PATH,


        /*
         * Lifecycle
         */

        initialize,

        boot,

        mount,

        unmount,


        /*
         * Events
         */

        on,

        off,

        emit,


        /*
         * State
         */

        getState,

        setState,


        /*
         * Emotion
         */

        setEmotion,

        happy,

        excited,

        sad,

        neutral,

        errorState,

        react,


        /*
         * Voice
         */

        speak,

        startSpeaking,

        stopSpeaking,


        /*
         * Listening
         */

        startListening,

        stopListening,


        /*
         * Thinking
         */

        startThinking,

        stopThinking,


        /*
         * AI
         */

        respond,


        /*
         * System
         */

        enable,

        disable,

        setVisible,

        setMuted,


        /*
         * Connections
         */

        refreshConnections,

        getConnectionStatus,


        /*
         * Diagnostics
         */

        diagnostics,

        healthCheck,

        getStatistics:
            function () {

                return {
                    ...state.statistics
                };

            }

    };


    /* ============================================================
       37 — GLOBAL EXPORTS
       ============================================================ */

    window.HalDoAIAvatar =
        api;

    window.HalDoOSAIAvatar =
        api;

    HalDoOS.aiAvatar =
        api;

    HalDoOS.services =
        HalDoOS.services ||
        {};

    HalDoOS.services.aiAvatar =
        api;


    /* ============================================================
       38 — DOM BOOT
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
       39 — FINAL
       ============================================================ */

    log(
        "HalDo AI Avatar Engine geladen.",
        VERSION
    );


})(window, document);