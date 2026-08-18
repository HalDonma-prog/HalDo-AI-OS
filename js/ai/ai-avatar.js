/* ============================================================
   HALDO AI OS 20
   HALDO AI AVATAR ENGINE
   ------------------------------------------------------------
   Datei:
       js/ai/ai-avatar.js

   Pfad:
       /js/ai/ai-avatar.js

   Ersetzungsart:
       KOMPLETTEN INHALT ERSETZEN

   Verantwortlich für:

   - lebendigen HalDo AI Avatar
   - HalDo Logo als Avatar
   - Avatar innerhalb der zentralen Sonne
   - sanfte Atmung
   - Glow
   - Blick-/Lichtreaktionen
   - Listening
   - Thinking
   - Speaking
   - Happy
   - Calm
   - Excited
   - Processing
   - Error
   - AI-Core Verbindung
   - AI-Chat Verbindung
   - Voice Verbindung
   - Speech Verbindung
   - Conversation State Verbindung
   - App Registry Verbindung
   - Event-System Verbindung
   - Benutzerinteraktion
   - Maus-/Touch-Reaktionen
   - zukünftige Gesicht-/Mimik-Animationen
   - zukünftige Lip-Sync-Anbindung
   - zukünftige Emotion Engine
   - zentrale Avatar API

   WICHTIG:

   Diese Datei ist eine FOUNDATION.

   Sie entfernt keine vorhandenen AI-Funktionen.
   Sie versucht vorhandene HalDo APIs zu erkennen und
   verbindet sich mit ihnen, sobald diese verfügbar sind.

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
        "HalDo AI Avatar Engine 20";

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

        visible:
            true,

        enabled:
            true,

        state:
            "idle",

        previousState:
            "idle",

        emotion:
            "calm",

        intensity:
            0.55,

        speaking:
            false,

        listening:
            false,

        thinking:
            false,

        processing:
            false,

        interacting:
            false,

        connected: {

            aiCore:
                false,

            aiChat:
                false,

            aiSpeech:
                false,

            aiVoice:
                false,

            conversation:
                false,

            appRegistry:
                false,

            events:
                false

        },

        elements: {

            root:
                null,

            logo:
                null,

            image:
                null,

            glow:
                null,

            halo:
                null,

            status:
                null

        },

        listeners:
            new Map(),

        timers:
            new Set(),

        animationFrame:
            null,

        pointer: {

            x:
                0,

            y:
                0,

            active:
                false

        },

        statistics: {

            stateChanges:
                0,

            interactions:
                0,

            aiEvents:
                0,

            voiceEvents:
                0,

            speechEvents:
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


    function now() {

        return Date.now();

    }


    function clamp(
        value,
        min,
        max
    ) {

        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );

    }


    function normalizeState(
        value
    ) {

        const allowed = [

            "idle",

            "calm",

            "listening",

            "thinking",

            "speaking",

            "happy",

            "excited",

            "processing",

            "focused",

            "error"

        ];


        const normalized =
            String(
                value || ""
            )
            .trim()
            .toLowerCase();


        return allowed.includes(
            normalized
        )
            ? normalized
            : "idle";

    }


    function safeClone(
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
                safeClone
            );

        }


        if (
            typeof value === "object"
        ) {

            const result = {};

            Object.keys(value)
                .forEach(
                    key => {

                        if (
                            typeof value[key] !==
                            "function"
                        ) {

                            result[key] =
                                safeClone(
                                    value[key]
                                );

                        }

                    }
                );

            return result;

        }


        return value;

    }


    /* ============================================================
       06 — SERVICE LOOKUPS
       ============================================================ */

    function getAICore() {

        return (
            window.HalDoAICore ||
            HalDoOS.aiCore ||
            null
        );

    }


    function getAIChat() {

        return (
            window.HalDoAIChat ||
            HalDoOS.aiChat ||
            null
        );

    }


    function getAISpeech() {

        return (
            window.HalDoAISpeech ||
            HalDoOS.aiSpeech ||
            null
        );

    }


    function getAIVoice() {

        return (
            window.HalDoAIVoice ||
            window.HalDoVoice ||
            HalDoOS.aiVoice ||
            HalDoOS.voice ||
            null
        );

    }


    function getConversationState() {

        return (
            window.HalDoConversationState ||
            HalDoOS.conversationState ||
            null
        );

    }


    function getAppRegistry() {

        return (
            window.HalDoAppRegistry ||
            HalDoOS.appRegistry ||
            null
        );

    }


    function getEvents() {

        return (
            HalDoOS.events ||
            window.HalDoEvents ||
            null
        );

    }


    /* ============================================================
       07 — EVENT SYSTEM
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


        const events =
            getEvents();


        if (
            events &&
            hasMethod(
                events,
                "emit"
            )
        ) {

            try {

                events.emit(
                    "ai-avatar:" +
                    event,
                    data
                );

            } catch (_) {}

        }


        const kernel =
            window.HalDoKernel ||
            HalDoOS.kernel;


        if (
            kernel &&
            hasMethod(
                kernel,
                "emit"
            )
        ) {

            try {

                kernel.emit(
                    "ai-avatar:" +
                    event,
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
        context
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

            context:
                context ||
                "HalDo AI Avatar",

            timestamp:
                new Date()
                    .toISOString()

        };


        errorLog(
            "[HalDo AI Avatar]",
            record
        );


        emit(
            "error",
            record
        );


        return record;

    }


    /* ============================================================
       09 — DOM DISCOVERY
       ============================================================ */

    function findFirst(
        selectors
    ) {

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


    function findRoot() {

        return findFirst([

            "#haldo-ai-avatar",

            ".haldo-ai-avatar",

            "[data-haldo-ai-avatar]",

            "#ai-avatar",

            ".ai-avatar"

        ]);

    }


    function findLogo() {

        return findFirst([

            "#haldo-ai-avatar img",

            ".haldo-ai-avatar img",

            "[data-haldo-ai-avatar] img",

            "#haldo-ai-logo",

            ".haldo-ai-logo",

            ".haldo-logo"

        ]);

    }


    function findSunCenter() {

        return findFirst([

            "#haldo-sun-center",

            ".haldo-sun-center",

            "#sun-center",

            ".sun-center",

            ".cosmic-sun-center",

            ".cosmic-sun",

            ".solar-center"

        ]);

    }


    /* ============================================================
       10 — CREATE AVATAR
       ============================================================ */

    function createAvatarRoot() {

        let root =
            findRoot();


        if (root) {

            return root;

        }


        const sun =
            findSunCenter();


        if (!sun) {

            return null;

        }


        root =
            document.createElement(
                "div"
            );


        root.id =
            "haldo-ai-avatar";


        root.className =
            "haldo-ai-avatar";


        root.setAttribute(
            "data-haldo-ai-avatar",
            "true"
        );


        root.setAttribute(
            "aria-label",
            "HalDo AI"
        );


        root.setAttribute(
            "role",
            "img"
        );


        sun.appendChild(
            root
        );


        return root;

    }


    function createAvatarElements() {

        const root =
            createAvatarRoot();


        if (!root) {

            return false;

        }


        state.elements.root =
            root;


        let image =
            findLogo();


        /*
         * Wenn kein vorhandenes Logo-Element existiert,
         * wird das offizielle HalDo Logo verwendet.
         */

        if (!image) {

            image =
                document.createElement(
                    "img"
                );


            image.className =
                "haldo-ai-avatar-image";


            image.alt =
                "HalDo AI";


            image.src =
                LOGO_PATH;


            root.appendChild(
                image
            );

        }


        image.classList.add(
            "haldo-ai-avatar-image"
        );


        image.setAttribute(
            "draggable",
            "false"
        );


        state.elements.image =
            image;


        let glow =
            root.querySelector(
                ".haldo-ai-avatar-glow"
            );


        if (!glow) {

            glow =
                document.createElement(
                    "span"
                );


            glow.className =
                "haldo-ai-avatar-glow";


            root.appendChild(
                glow
            );

        }


        state.elements.glow =
            glow;


        let halo =
            root.querySelector(
                ".haldo-ai-avatar-halo"
            );


        if (!halo) {

            halo =
                document.createElement(
                    "span"
                );


            halo.className =
                "haldo-ai-avatar-halo";


            root.appendChild(
                halo
            );

        }


        state.elements.halo =
            halo;


        let status =
            root.querySelector(
                ".haldo-ai-avatar-status"
            );


        if (!status) {

            status =
                document.createElement(
                    "span"
                );


            status.className =
                "haldo-ai-avatar-status";


            root.appendChild(
                status
            );

        }


        state.elements.status =
            status;


        return true;

    }


    /* ============================================================
       11 — BASE STYLES
       ============================================================ */

    function ensureStyles() {

        if (
            document.getElementById(
                "haldo-ai-avatar-engine-style"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "haldo-ai-avatar-engine-style";


        style.textContent = `

            #haldo-ai-avatar,
            .haldo-ai-avatar {

                position:
                    absolute;

                left:
                    50%;

                top:
                    50%;

                width:
                    clamp(
                        90px,
                        13vw,
                        180px
                    );

                aspect-ratio:
                    1 / 1;

                transform:
                    translate(
                        -50%,
                        -50%
                    );

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                pointer-events:
                    auto;

                z-index:
                    20;

                isolation:
                    isolate;

                cursor:
                    pointer;

                transition:
                    opacity
                    700ms ease,
                    filter
                    500ms ease;

            }


            .haldo-ai-avatar-image {

                position:
                    relative;

                z-index:
                    4;

                width:
                    74%;

                height:
                    74%;

                object-fit:
                    contain;

                user-select:
                    none;

                -webkit-user-drag:
                    none;

                filter:
                    drop-shadow(
                        0 0 10px
                        rgba(
                            255,
                            255,
                            255,
                            .45
                        )
                    );

                animation:
                    haldoAvatarBreathing
                    4.8s
                    ease-in-out
                    infinite;

                transition:
                    transform
                    400ms ease,
                    filter
                    400ms ease;

            }


            .haldo-ai-avatar-glow {

                position:
                    absolute;

                inset:
                    5%;

                z-index:
                    1;

                border-radius:
                    50%;

                background:
                    radial-gradient(
                        circle,
                        rgba(
                            255,
                            255,
                            255,
                            .34
                        ) 0%,
                        rgba(
                            255,
                            220,
                            120,
                            .20
                        ) 28%,
                        rgba(
                            255,
                            190,
                            60,
                            .10
                        ) 52%,
                        transparent
                        74%
                    );

                filter:
                    blur(12px);

                opacity:
                    .75;

                animation:
                    haldoAvatarGlow
                    3.6s
                    ease-in-out
                    infinite;

            }


            .haldo-ai-avatar-halo {

                position:
                    absolute;

                inset:
                    -8%;

                z-index:
                    0;

                border-radius:
                    50%;

                border:
                    1px solid
                    rgba(
                        255,
                        245,
                        190,
                        .18
                    );

                box-shadow:
                    0 0 18px
                    rgba(
                        255,
                        220,
                        120,
                        .14
                    ),
                    inset
                    0 0 18px
                    rgba(
                        255,
                        240,
                        180,
                        .10
                    );

                animation:
                    haldoAvatarHalo
                    8s
                    linear
                    infinite;

            }


            .haldo-ai-avatar-status {

                position:
                    absolute;

                bottom:
                    -12px;

                left:
                    50%;

                transform:
                    translateX(-50%);

                z-index:
                    10;

                min-width:
                    8px;

                min-height:
                    8px;

                border-radius:
                    50%;

                opacity:
                    .75;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .8
                    );

                box-shadow:
                    0 0 12px
                    rgba(
                        255,
                        255,
                        255,
                        .65
                    );

                transition:
                    all
                    350ms ease;

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
                            1.035
                        );

                }

            }


            @keyframes haldoAvatarGlow {

                0%,
                100% {

                    transform:
                        scale(
                            .92
                        );

                    opacity:
                        .55;

                }

                50% {

                    transform:
                        scale(
                            1.08
                        );

                    opacity:
                        .95;

                }

            }


            @keyframes haldoAvatarHalo {

                from {

                    transform:
                        rotate(
                            0deg
                        );

                }

                to {

                    transform:
                        rotate(
                            360deg
                        );

                }

            }


            #haldo-ai-avatar[data-state="listening"]
            .haldo-ai-avatar-image {

                transform:
                    scale(
                        1.06
                    );

            }


            #haldo-ai-avatar[data-state="thinking"]
            .haldo-ai-avatar-image {

                transform:
                    scale(
                        1.025
                    );

            }


            #haldo-ai-avatar[data-state="speaking"]
            .haldo-ai-avatar-image {

                animation:
                    haldoAvatarSpeaking
                    .85s
                    ease-in-out
                    infinite;

            }


            #haldo-ai-avatar[data-state="happy"]
            .haldo-ai-avatar-image {

                transform:
                    scale(
                        1.055
                    );

            }


            #haldo-ai-avatar[data-state="excited"]
            .haldo-ai-avatar-image {

                animation:
                    haldoAvatarExcited
                    1.4s
                    ease-in-out
                    infinite;

            }


            #haldo-ai-avatar[data-state="error"]
            .haldo-ai-avatar-image {

                filter:
                    drop-shadow(
                        0 0 16px
                        rgba(
                            255,
                            120,
                            120,
                            .55
                        )
                    );

            }


            @keyframes haldoAvatarSpeaking {

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
                            1.045
                        );

                }

            }


            @keyframes haldoAvatarExcited {

                0%,
                100% {

                    transform:
                        scale(
                            1
                        )
                        rotate(
                            -1deg
                        );

                }

                25% {

                    transform:
                        scale(
                            1.06
                        )
                        rotate(
                            1deg
                        );

                }

                50% {

                    transform:
                        scale(
                            1.025
                        )
                        rotate(
                            -1deg
                        );

                }

                75% {

                    transform:
                        scale(
                            1.07
                        )
                        rotate(
                            1deg
                        );

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* ============================================================
       12 — APPLY VISUAL STATE
       ============================================================ */

    function applyState() {

        const root =
            state.elements.root;


        if (!root) {

            return;

        }


        root.dataset.state =
            state.state;


        root.dataset.emotion =
            state.emotion;


        root.style.opacity =
            state.visible
                ? "1"
                : "0";


        root.style.pointerEvents =
            state.visible
                ? "auto"
                : "none";


        if (
            state.elements.status
        ) {

            state.elements.status
                .setAttribute(
                    "aria-label",
                    "HalDo AI " +
                    state.state
                );

        }


        emit(
            "visual-state",
            {

                state:
                    state.state,

                emotion:
                    state.emotion,

                intensity:
                    state.intensity

            }
        );

    }


    /* ============================================================
       13 — STATE ENGINE
       ============================================================ */

    function setState(
        nextState,
        options = {}
    ) {

        const normalized =
            normalizeState(
                nextState
            );


        if (
            state.state ===
            normalized &&
            !options.force
        ) {

            return getState();

        }


        state.previousState =
            state.state;


        state.state =
            normalized;


        state.statistics.stateChanges +=
            1;


        const emotionMap = {

            idle:
                "calm",

            calm:
                "calm",

            listening:
                "attentive",

            thinking:
                "focused",

            speaking:
                "warm",

            happy:
                "happy",

            excited:
                "excited",

            processing:
                "focused",

            focused:
                "focused",

            error:
                "concerned"

        };


        state.emotion =
            options.emotion ||
            emotionMap[
                normalized
            ] ||
            "calm";


        state.intensity =
            clamp(
                options.intensity !==
                    undefined
                    ? Number(
                        options.intensity
                    )
                    : getDefaultIntensity(
                        normalized
                    ),
                0,
                1
            );


        state.speaking =
            normalized ===
            "speaking";


        state.listening =
            normalized ===
            "listening";


        state.thinking =
            normalized ===
            "thinking";


        state.processing =
            normalized ===
                "processing" ||
            normalized ===
                "thinking";


        applyState();


        emit(
            "state-changed",
            {

                state:
                    normalized,

                previousState:
                    state.previousState,

                emotion:
                    state.emotion,

                intensity:
                    state.intensity

            }
        );


        return getState();

    }


    function getDefaultIntensity(
        avatarState
    ) {

        const values = {

            idle:
                .45,

            calm:
                .40,

            listening:
                .72,

            thinking:
                .62,

            speaking:
                .75,

            happy:
                .80,

            excited:
                .95,

            processing:
                .68,

            focused:
                .64,

            error:
                .52

        };


        return values[
            avatarState
        ] || .5;

    }


    /* ============================================================
       14 — SHORTCUT STATES
       ============================================================ */

    function idle() {

        return setState(
            "idle"
        );

    }


    function calm() {

        return setState(
            "calm"
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


    function happy() {

        return setState(
            "happy"
        );

    }


    function excited() {

        return setState(
            "excited"
        );

    }


    function process() {

        return setState(
            "processing"
        );

    }


    function focus() {

        return setState(
            "focused"
        );

    }


    function showError() {

        return setState(
            "error"
        );

    }


    /* ============================================================
       15 — VISIBILITY
       ============================================================ */

    function show() {

        state.visible =
            true;


        applyState();


        emit(
            "shown"
        );


        return true;

    }


    function hide() {

        state.visible =
            false;


        applyState();


        emit(
            "hidden"
        );


        return true;

    }


    function toggle() {

        return state.visible
            ? hide()
            : show();

    }


    /* ============================================================
       16 — POINTER / TOUCH INTERACTION
       ============================================================ */

    function handlePointerMove(
        event
    ) {

        const root =
            state.elements.root;


        if (!root) {

            return;

        }


        const rect =
            root.getBoundingClientRect();


        const clientX =
            event.clientX !== undefined
                ? event.clientX
                : (
                    event.touches &&
                    event.touches[0]
                        ? event.touches[0]
                            .clientX
                        : rect.left +
                          rect.width / 2
                );


        const clientY =
            event.clientY !== undefined
                ? event.clientY
                : (
                    event.touches &&
                    event.touches[0]
                        ? event.touches[0]
                            .clientY
                        : rect.top +
                          rect.height / 2
                );


        const x =
            clamp(
                (
                    clientX -
                    (
                        rect.left +
                        rect.width / 2
                    )
                ) /
                (
                    rect.width / 2
                ),
                -1,
                1
            );


        const y =
            clamp(
                (
                    clientY -
                    (
                        rect.top +
                        rect.height / 2
                    )
                ) /
                (
                    rect.height / 2
                ),
                -1,
                1
            );


        state.pointer.x =
            x;


        state.pointer.y =
            y;


        state.pointer.active =
            true;


        state.interacting =
            true;


        state.statistics.interactions +=
            1;


        emit(
            "pointer",
            {

                x,

                y,

                event

            }
        );

    }


    function handlePointerLeave() {

        state.pointer.active =
            false;

        state.pointer.x =
            0;

        state.pointer.y =
            0;

        state.interacting =
            false;

    }


    function handleClick() {

        state.statistics.interactions +=
            1;


        emit(
            "interaction",
            {

                type:
                    "click",

                state:
                    getState()

            }
        );


        /*
         * Ein kurzer freundlicher Reaktionsimpuls.
         */

        const previous =
            state.state;


        happy();


        const timer =
            window.setTimeout(
                () => {

                    if (
                        state.state ===
                        "happy"
                    ) {

                        setState(
                            previous
                        );

                    }

                    state.timers.delete(
                        timer
                    );

                },
                1200
            );


        state.timers.add(
            timer
        );

    }


    /* ============================================================
       17 — ANIMATION LOOP
       ============================================================ */

    function animationLoop(
        timestamp
    ) {

        if (
            !state.ready
        ) {

            state.animationFrame =
                window.requestAnimationFrame(
                    animationLoop
                );

            return;

        }


        const image =
            state.elements.image;


        const glow =
            state.elements.glow;


        if (
            image
        ) {

            const pointerX =
                state.pointer.x *
                2.5;


            const pointerY =
                state.pointer.y *
                1.8;


            const time =
                Number(
                    timestamp
                ) || 0;


            const breathing =
                Math.sin(
                    time / 2400
                ) *
                0.8;


            const translateX =
                clamp(
                    pointerX +
                    breathing,
                    -5,
                    5
                );


            const translateY =
                clamp(
                    pointerY,
                    -4,
                    4
                );


            if (
                state.state !==
                    "speaking" &&
                state.state !==
                    "excited"
            ) {

                image.style.transform =
                    "translate(" +
                    translateX +
                    "px, " +
                    translateY +
                    "px)";

            }

        }


        if (
            glow
        ) {

            const pulse =
                (
                    Math.sin(
                        (
                            Number(
                                timestamp
                            ) || 0
                        ) /
                        900
                    ) +
                    1
                ) /
                2;


            const opacity =
                .48 +
                (
                    pulse *
                    .35 *
                    state.intensity
                );


            glow.style.opacity =
                String(
                    opacity
                );

        }


        state.animationFrame =
            window.requestAnimationFrame(
                animationLoop
            );

    }


    /* ============================================================
       18 — AI EVENT BRIDGE
       ============================================================ */

    function connectAIEvents() {

        const aiCore =
            getAICore();


        const aiChat =
            getAIChat();


        const speech =
            getAISpeech();


        const voice =
            getAIVoice();


        const conversation =
            getConversationState();


        /*
         * AI CORE
         */

        if (aiCore) {

            state.connected.aiCore =
                true;


            if (
                hasMethod(
                    aiCore,
                    "on"
                )
            ) {

                const events = [

                    "thinking",
                    "processing",
                    "ready",
                    "response-start",
                    "response-end",
                    "error",
                    "idle"

                ];


                events.forEach(
                    eventName => {

                        try {

                            aiCore.on(
                                eventName,
                                payload =>
                                    handleAIEvent(
                                        eventName,
                                        payload
                                    )
                            );

                        } catch (_) {}

                    }
                );

            }

        }


        /*
         * AI CHAT
         */

        if (aiChat) {

            state.connected.aiChat =
                true;


            if (
                hasMethod(
                    aiChat,
                    "on"
                )
            ) {

                const events = [

                    "message-start",
                    "message-end",
                    "thinking",
                    "response",
                    "response-start",
                    "response-end",
                    "error"

                ];


                events.forEach(
                    eventName => {

                        try {

                            aiChat.on(
                                eventName,
                                payload =>
                                    handleAIEvent(
                                        eventName,
                                        payload
                                    )
                            );

                        } catch (_) {}

                    }
                );

            }

        }


        /*
         * SPEECH
         */

        if (speech) {

            state.connected.aiSpeech =
                true;


            if (
                hasMethod(
                    speech,
                    "on"
                )
            ) {

                [

                    "start",
                    "end",
                    "speech-start",
                    "speech-end",
                    "listening",
                    "recognized",
                    "error"

                ]
                .forEach(
                    eventName => {

                        try {

                            speech.on(
                                eventName,
                                payload =>
                                    handleSpeechEvent(
                                        eventName,
                                        payload
                                    )
                            );

                        } catch (_) {}

                    }
                );

            }

        }


        /*
         * VOICE
         */

        if (voice) {

            state.connected.aiVoice =
                true;


            if (
                hasMethod(
                    voice,
                    "on"
                )
            ) {

                [

                    "start",
                    "end",
                    "speaking",
                    "speech-start",
                    "speech-end",
                    "error"

                ]
                .forEach(
                    eventName => {

                        try {

                            voice.on(
                                eventName,
                                payload =>
                                    handleVoiceEvent(
                                        eventName,
                                        payload
                                    )
                            );

                        } catch (_) {}

                    }
                );

            }

        }


        /*
         * CONVERSATION STATE
         */

        if (conversation) {

            state.connected.conversation =
                true;


            if (
                hasMethod(
                    conversation,
                    "on"
                )
            ) {

                [

                    "state-changed",
                    "message",
                    "user-message",
                    "assistant-message",
                    "thinking",
                    "speaking"

                ]
                .forEach(
                    eventName => {

                        try {

                            conversation.on(
                                eventName,
                                payload =>
                                    handleAIEvent(
                                        eventName,
                                        payload
                                    )
                            );

                        } catch (_) {}

                    }
                );

            }

        }


        /*
         * APP REGISTRY
         */

        const registry =
            getAppRegistry();


        if (registry) {

            state.connected.appRegistry =
                true;


            if (
                hasMethod(
                    registry,
                    "on"
                )
            ) {

                registry.on(
                    "launched",
                    payload => {

                        emit(
                            "app-opened",
                            payload
                        );

                    }
                );


                registry.on(
                    "launch-failed",
                    payload => {

                        showError();

                        emit(
                            "app-error",
                            payload
                        );

                    }
                );

            }

        }


        /*
         * Zentrales Event System.
         */

        const events =
            getEvents();


        if (events) {

            state.connected.events =
                true;


            if (
                hasMethod(
                    events,
                    "on"
                )
            ) {

                [

                    "ai:thinking",
                    "ai:processing",
                    "ai:speaking",
                    "ai:listening",
                    "ai:ready",
                    "ai:error",
                    "voice:start",
                    "voice:end",
                    "speech:start",
                    "speech:end"

                ]
                .forEach(
                    eventName => {

                        try {

                            events.on(
                                eventName,
                                payload =>
                                    handleGlobalEvent(
                                        eventName,
                                        payload
                                    )
                            );

                        } catch (_) {}

                    }
                );

            }

        }

    }


    function handleAIEvent(
        eventName,
        payload
    ) {

        state.statistics.aiEvents +=
            1;


        switch (
            eventName
        ) {

            case "thinking":
            case "processing":
            case "response-start":
            case "message-start":

                think();

                break;


            case "response":
            case "response-end":
            case "message-end":

                happy();

                scheduleReturnToIdle(
                    1800
                );

                break;


            case "ready":
            case "idle":

                idle();

                break;


            case "error":

                showError();

                scheduleReturnToIdle(
                    2200
                );

                break;

        }


        emit(
            "ai-event",
            {

                event:
                    eventName,

                payload:
                    safeClone(
                        payload
                    )

            }
        );

    }


    function handleSpeechEvent(
        eventName,
        payload
    ) {

        state.statistics.speechEvents +=
            1;


        switch (
            eventName
        ) {

            case "start":
            case "speech-start":
            case "listening":

                listen();

                break;


            case "recognized":
            case "speech-end":
            case "end":

                think();

                break;


            case "error":

                showError();

                scheduleReturnToIdle(
                    1800
                );

                break;

        }


        emit(
            "speech-event",
            {

                event:
                    eventName,

                payload:
                    safeClone(
                        payload
                    )

            }
        );

    }


    function handleVoiceEvent(
        eventName,
        payload
    ) {

        state.statistics.voiceEvents +=
            1;


        switch (
            eventName
        ) {

            case "start":
            case "speaking":
            case "speech-start":

                speak();

                break;


            case "end":
            case "speech-end":

                happy();

                scheduleReturnToIdle(
                    1300
                );

                break;


            case "error":

                showError();

                scheduleReturnToIdle(
                    1800
                );

                break;

        }


        emit(
            "voice-event",
            {

                event:
                    eventName,

                payload:
                    safeClone(
                        payload
                    )

            }
        );

    }


    function handleGlobalEvent(
        eventName,
        payload
    ) {

        const event =
            String(
                eventName || ""
            )
            .toLowerCase();


        if (
            event.includes(
                "thinking"
            ) ||
            event.includes(
                "processing"
            )
        ) {

            think();

        }


        else if (
            event.includes(
                "speaking"
            ) ||
            event.includes(
                "voice:start"
            ) ||
            event.includes(
                "speech:start"
            )
        ) {

            speak();

        }


        else if (
            event.includes(
                "listening"
            )
        ) {

            listen();

        }


        else if (
            event.includes(
                "error"
            )
        ) {

            showError();

        }


        else if (
            event.includes(
                "ready"
            )
        ) {

            idle();

        }


        emit(
            "global-event",
            {

                event:
                    eventName,

                payload:
                    safeClone(
                        payload
                    )

            }
        );

    }


    /* ============================================================
       19 — RETURN TO IDLE
       ============================================================ */

    function scheduleReturnToIdle(
        delay
    ) {

        const timer =
            window.setTimeout(
                () => {

                    if (
                        state.state ===
                            "happy" ||
                        state.state ===
                            "error"
                    ) {

                        idle();

                    }


                    state.timers.delete(
                        timer
                    );

                },
                Number(
                    delay
                ) || 1000
            );


        state.timers.add(
            timer
        );

    }


    /* ============================================================
       20 — DOM INTERACTION
       ============================================================ */

    function connectDOMEvents() {

        const root =
            state.elements.root;


        if (!root) {

            return;

        }


        root.addEventListener(
            "pointermove",
            handlePointerMove,
            {
                passive:
                    true
            }
        );


        root.addEventListener(
            "pointerleave",
            handlePointerLeave,
            {
                passive:
                    true
            }
        );


        root.addEventListener(
            "pointerdown",
            handlePointerMove,
            {
                passive:
                    true
            }
        );


        root.addEventListener(
            "click",
            handleClick
        );


        root.addEventListener(
            "touchmove",
            handlePointerMove,
            {
                passive:
                    true
            }
        );


        root.addEventListener(
            "touchend",
            handlePointerLeave,
            {
                passive:
                    true
            }
        );

    }


    /* ============================================================
       21 — MOUNT
       ============================================================ */

    function mount() {

        if (
            state.mounted
        ) {

            return true;

        }


        ensureStyles();


        const created =
            createAvatarElements();


        if (!created) {

            /*
             * Die zentrale Sonne kann eventuell erst
             * später durch die Cosmic World erzeugt werden.
             */

            return false;

        }


        connectDOMEvents();


        state.mounted =
            true;


        applyState();


        emit(
            "mounted",
            {

                logo:
                    LOGO_PATH

            }
        );


        return true;

    }


    /* ============================================================
       22 — REFRESH MOUNT
       ============================================================ */

    function refreshMount() {

        if (
            state.elements.root &&
            document.body.contains(
                state.elements.root
            )
        ) {

            return true;

        }


        state.mounted =
            false;


        state.elements.root =
            null;


        state.elements.image =
            null;


        state.elements.glow =
            null;


        state.elements.halo =
            null;


        state.elements.status =
            null;


        return mount();

    }


    /* ============================================================
       23 — CONNECTION STATUS
       ============================================================ */

    function refreshConnections() {

        state.connected.aiCore =
            !!getAICore();


        state.connected.aiChat =
            !!getAIChat();


        state.connected.aiSpeech =
            !!getAISpeech();


        state.connected.aiVoice =
            !!getAIVoice();


        state.connected.conversation =
            !!getConversationState();


        state.connected.appRegistry =
            !!getAppRegistry();


        state.connected.events =
            !!getEvents();


        return getConnectionStatus();

    }


    function getConnectionStatus() {

        return {

            ...state.connected

        };

    }


    /* ============================================================
       24 — PUBLIC STATE
       ============================================================ */

    function getState() {

        return {

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

            intensity:
                state.intensity,

            speaking:
                state.speaking,

            listening:
                state.listening,

            thinking:
                state.thinking,

            processing:
                state.processing,

            interacting:
                state.interacting,

            connected:
                getConnectionStatus()

        };

    }


    /* ============================================================
       25 — DIAGNOSTICS
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

            state:
                getState(),

            statistics:
                {
                    ...state.statistics
                },

            elementStatus: {

                root:
                    !!state.elements.root,

                image:
                    !!state.elements.image,

                glow:
                    !!state.elements.glow,

                halo:
                    !!state.elements.halo,

                status:
                    !!state.elements.status

            },

            timestamp:
                new Date()
                    .toISOString()

        };

    }


    /* ============================================================
       26 — ENABLE / DISABLE
       ============================================================ */

    function enable() {

        state.enabled =
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


        hide();


        emit(
            "disabled"
        );


        return true;

    }


    /* ============================================================
       27 — RESET
       ============================================================ */

    function reset() {

        state.previousState =
            "idle";


        state.state =
            "idle";


        state.emotion =
            "calm";


        state.intensity =
            .55;


        state.speaking =
            false;


        state.listening =
            false;


        state.thinking =
            false;


        state.processing =
            false;


        state.interacting =
            false;


        state.pointer.x =
            0;


        state.pointer.y =
            0;


        applyState();


        emit(
            "reset"
        );


        return true;

    }


    /* ============================================================
       28 — PUBLIC API
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
         * Initialization
         */

        initialize,

        boot,

        mount,

        refreshMount,


        /*
         * State
         */

        getState,

        setState,

        reset,


        /*
         * Shortcut states
         */

        idle,

        calm,

        listen,

        think,

        speak,

        happy,

        excited,

        process,

        focus,

        showError,


        /*
         * Visibility
         */

        show,

        hide,

        toggle,

        enable,

        disable,


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
         * Diagnostics
         */

        diagnostics

    };


    /* ============================================================
       29 — GLOBAL EXPORTS
       ============================================================ */

    window.HalDoAIAvatar =
        api;

    window.HalDoAIAvatarEngine =
        api;

    HalDoOS.aiAvatar =
        api;


    HalDoOS.services =
        HalDoOS.services ||
        {};


    HalDoOS.services.aiAvatar =
        api;


    /* ============================================================
       30 — APP REGISTRY CONTRACT
       ============================================================ */

    function registerWithAppRegistry() {

        const registry =
            getAppRegistry();


        if (
            !registry ||
            !hasMethod(
                registry,
                "register"
            )
        ) {

            return false;

        }


        try {

            registry.register({

                id:
                    "ai-avatar",

                name:
                    "HalDo AI Avatar",

                title:
                    "HalDo AI Avatar",

                description:
                    "Lebendiger visueller HalDo AI Avatar in der zentralen Cosmic-Sonne.",

                category:
                    "ai",

                icon:
                    "haldo-logo",

                iconUrl:
                    LOGO_PATH,

                version:
                    VERSION,

                enabled:
                    true,

                visible:
                    true,

                singleton:
                    true,

                system:
                    true,

                core:
                    true,

                capabilities: [

                    "ai-avatar",

                    "ai-visual",

                    "emotion",

                    "interaction",

                    "listening-state",

                    "thinking-state",

                    "speaking-state",

                    "voice-state",

                    "cosmic-center"

                ],

                permissions: [

                    "ui",

                    "ai",

                    "voice",

                    "events"

                ],

                dependencies: [

                    "ai-core"

                ],

                tags: [

                    "haldo",

                    "ai",

                    "avatar",

                    "cosmic",

                    "sun",

                    "logo"

                ],

                keywords: [

                    "HalDo AI",

                    "Avatar",

                    "Logo",

                    "Sonne",

                    "Cosmic World",

                    "AI Assistant"

                ]

            });


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Registry Registration"
            );


            return false;

        }

    }


    /* ============================================================
       31 — INITIALIZATION
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

            /*
             * Erst DOM/Styles vorbereiten.
             */

            ensureStyles();


            mount();


            /*
             * Services verbinden.
             */

            refreshConnections();


            connectAIEvents();


            registerWithAppRegistry();


            /*
             * Noch einmal mounten, falls die Cosmic World
             * während des Bootvorgangs später entstanden ist.
             */

            refreshMount();


            /*
             * Startzustand.
             */

            setState(
                "idle",
                {
                    force:
                        true
                }
            );


            /*
             * Animation starten.
             */

            if (
                !state.animationFrame
            ) {

                state.animationFrame =
                    window.requestAnimationFrame(
                        animationLoop
                    );

            }


            state.ready =
                true;

            state.initializing =
                false;


            emit(
                "ready",
                {

                    version:
                        VERSION,

                    state:
                        getState(),

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
                "Avatar Initialisierung"
            );


            throw exception;

        }

    }


    /* ============================================================
       32 — BOOT
       ============================================================ */

    function boot() {

        /*
         * Cosmic World / Sonne kann nach dem Avatar geladen
         * werden. Deshalb versuchen wir den Mount mehrfach
         * vorsichtig während des frühen Bootvorgangs.
         */

        initialize()
            .catch(
                exception => {

                    state.failed =
                        true;


                    state.initializing =
                        false;


                    reportError(
                        exception,
                        "Avatar Boot"
                    );

                }
            );


        const retryDelays = [

            300,

            900,

            1800,

            3500

        ];


        retryDelays.forEach(
            delay => {

                const timer =
                    window.setTimeout(
                        () => {

                            if (
                                !state.mounted
                            ) {

                                refreshMount();

                            }


                            if (
                                !state.connected.aiCore ||
                                !state.connected.aiChat ||
                                !state.connected.aiVoice
                            ) {

                                refreshConnections();

                            }


                            state.timers.delete(
                                timer
                            );

                        },
                        delay
                    );


                state.timers.add(
                    timer
                );

            }
        );

    }


    /* ============================================================
       33 — PUBLIC BOOT
       ============================================================ */

    api.initialize =
        initialize;


    api.boot =
        boot;


    /* ============================================================
       34 — DOM START
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
       35 — FINAL REFERENCES
       ============================================================ */

    window.HalDoAIAvatar =
        api;

    window.HalDoAIAvatarEngine =
        api;

    HalDoOS.aiAvatar =
        api;

    HalDoOS.services =
        HalDoOS.services ||
        {};

    HalDoOS.services.aiAvatar =
        api;


    /* ============================================================
       END
       HALDO AI OS 20
       HALDO AI AVATAR ENGINE
       ============================================================ */

})(window, document);