/* ============================================================
   HALDO AI OS 20
   HALDO AI AVATAR SERVICE
   ------------------------------------------------------------
   Datei:
       js/ai/ai-avatar.js

   Pfad:
       /js/ai/ai-avatar.js

   Aufgabe:
       Zentraler Service für den lebendigen HalDo AI Avatar.

   Der Avatar ist KEIN Emoji und KEIN Roboter.

   Grundlage:
       Das vorhandene HalDo Logo-Bild.

   Verantwortlich für:

   - HalDo AI Avatar State
   - Idle / Atmung
   - Listening
   - Thinking
   - Speaking
   - Responding
   - Welcome
   - Error
   - Offline
   - Avatar Events
   - AI-Verbindung
   - Voice-Verbindung
   - Speech-Verbindung
   - Language-Verbindung
   - Chat-Verbindung
   - Sonnenzentrum-Verbindung
   - App Registry-Verbindung
   - Kernel-Verbindung
   - System-Verbindung
   - Logo Asset
   - Animation Hooks
   - Accessibility
   - Reduced Motion
   - Cosmic Welcome
   - Avatar Diagnostics
   - zukünftige Emotion-/Expression-Erweiterungen

   WICHTIG:

   Diese Datei enthält NICHT die komplette Sonnen-UI.

   Sie ist die zentrale Logikschicht zwischen HalDo AI
   und der visuellen Avatar-Oberfläche.

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
        "HalDo AI Avatar Service 20";

    const DEFAULT_LOGO =
        "assets/logo/logo.png";

    const FALLBACK_LOGO =
        "logo.png";


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

        state:
            "idle",

        previousState:
            null,

        expression:
            "calm",

        activity:
            "resting",

        intensity:
            0.35,

        visible:
            true,

        enabled:
            true,

        speaking:
            false,

        listening:
            false,

        thinking:
            false,

        responding:
            false,

        welcome:
            false,

        online:
            navigator.onLine !== false,

        reducedMotion:
            false,

        mountedElements:
            new Set(),

        listeners:
            new Map(),

        connections: {

            kernel:
                false,

            system:
                false,

            registry:
                false,

            aiCore:
                false,

            chat:
                false,

            voice:
                false,

            speech:
                false,

            language:
                false,

            cosmicSound:
                false

        },

        statistics: {

            stateChanges:
                0,

            expressions:
                0,

            mounts:
                0,

            unmounts:
                0,

            events:
                0,

            errors:
                0

        },

        lastInteraction:
            Date.now(),

        lastStateChange:
            Date.now(),

        lastError:
            null

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


    function safeString(
        value,
        fallback = ""
    ) {

        const result =
            String(
                value ?? ""
            )
            .trim();

        return result ||
            fallback;

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


    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            window.HalDoOSAppRegistry ||
            HalDoOS.appRegistry ||
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


    function getChat() {

        return (
            window.HalDoAIChat ||
            window.HalDoChat ||
            HalDoOS.aiChat ||
            HalDoOS.chat ||
            null
        );

    }


    function getVoice() {

        return (
            window.HalDoVoice ||
            window.HalDoAIVoice ||
            HalDoOS.voice ||
            HalDoOS.aiVoice ||
            null
        );

    }


    function getSpeech() {

        return (
            window.HalDoSpeech ||
            window.HalDoAISpeech ||
            HalDoOS.speech ||
            HalDoOS.aiSpeech ||
            null
        );

    }


    function getLanguage() {

        return (
            window.HalDoLanguageManager ||
            HalDoOS.languageManager ||
            null
        );

    }


    function getCosmicSound() {

        return (
            window.HalDoCosmicSound ||
            window.HalDoCosmicWelcome ||
            HalDoOS.cosmicSound ||
            HalDoOS.cosmicWelcome ||
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

        state.statistics.events +=
            1;


        const payload = {

            event,

            timestamp:
                new Date().toISOString(),

            state:
                state.state,

            data:
                clone(data)

        };


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
                                clone(
                                    payload
                                )
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
                    payload
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
                    payload
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


        state.lastError =
            record;


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
       09 — AVATAR STATES
       ============================================================ */

    const STATES = {

        IDLE:
            "idle",

        LISTENING:
            "listening",

        THINKING:
            "thinking",

        SPEAKING:
            "speaking",

        RESPONDING:
            "responding",

        WELCOME:
            "welcome",

        ERROR:
            "error",

        OFFLINE:
            "offline"

    };


    const EXPRESSIONS = {

        CALM:
            "calm",

        HAPPY:
            "happy",

        ATTENTIVE:
            "attentive",

        THINKING:
            "thinking",

        SPEAKING:
            "speaking",

        WARM:
            "warm",

        ERROR:
            "error",

        OFFLINE:
            "offline"

    };


    const ACTIVITY = {

        RESTING:
            "resting",

        LISTENING:
            "listening",

        PROCESSING:
            "processing",

        SPEAKING:
            "speaking",

        WELCOMING:
            "welcoming"

    };


    /* ============================================================
       10 — STATE NORMALIZATION
       ============================================================ */

    function normalizeState(
        value
    ) {

        const target =
            safeString(
                value,
                STATES.IDLE
            )
            .toLowerCase();


        if (
            Object.values(
                STATES
            ).includes(
                target
            )
        ) {

            return target;

        }


        return STATES.IDLE;

    }


    /* ============================================================
       11 — STATE → EXPRESSION
       ============================================================ */

    function expressionForState(
        avatarState
    ) {

        switch (
            avatarState
        ) {

            case STATES.LISTENING:

                return EXPRESSIONS.ATTENTIVE;


            case STATES.THINKING:

                return EXPRESSIONS.THINKING;


            case STATES.SPEAKING:

                return EXPRESSIONS.SPEAKING;


            case STATES.RESPONDING:

                return EXPRESSIONS.HAPPY;


            case STATES.WELCOME:

                return EXPRESSIONS.WARM;


            case STATES.ERROR:

                return EXPRESSIONS.ERROR;


            case STATES.OFFLINE:

                return EXPRESSIONS.OFFLINE;


            case STATES.IDLE:

            default:

                return EXPRESSIONS.CALM;

        }

    }


    /* ============================================================
       12 — STATE → ACTIVITY
       ============================================================ */

    function activityForState(
        avatarState
    ) {

        switch (
            avatarState
        ) {

            case STATES.LISTENING:

                return ACTIVITY.LISTENING;


            case STATES.THINKING:

                return ACTIVITY.PROCESSING;


            case STATES.SPEAKING:

                return ACTIVITY.SPEAKING;


            case STATES.RESPONDING:

                return ACTIVITY.SPEAKING;


            case STATES.WELCOME:

                return ACTIVITY.WELCOMING;


            default:

                return ACTIVITY.RESTING;

        }

    }


    /* ============================================================
       13 — STATE FLAGS
       ============================================================ */

    function updateFlags(
        avatarState
    ) {

        state.speaking =
            avatarState ===
            STATES.SPEAKING;

        state.listening =
            avatarState ===
            STATES.LISTENING;

        state.thinking =
            avatarState ===
            STATES.THINKING;

        state.responding =
            avatarState ===
            STATES.RESPONDING;

        state.welcome =
            avatarState ===
            STATES.WELCOME;

    }


    /* ============================================================
       14 — SET STATE
       ============================================================ */

    function setState(
        nextState,
        options = {}
    ) {

        const normalized =
            normalizeState(
                nextState
            );


        const previous =
            state.state;


        if (
            previous === normalized &&
            options.force !== true
        ) {

            return getState();

        }


        state.previousState =
            previous;


        state.state =
            normalized;


        state.expression =
            options.expression ||
            expressionForState(
                normalized
            );


        state.activity =
            options.activity ||
            activityForState(
                normalized
            );


        state.intensity =
            typeof options.intensity ===
            "number"
                ? Math.max(
                    0,
                    Math.min(
                        1,
                        options.intensity
                    )
                )
                : defaultIntensity(
                    normalized
                );


        updateFlags(
            normalized
        );


        state.lastStateChange =
            now();


        state.lastInteraction =
            now();


        state.statistics.stateChanges +=
            1;


        emit(
            "state-changed",
            {

                previous,

                current:
                    normalized,

                expression:
                    state.expression,

                activity:
                    state.activity,

                intensity:
                    state.intensity,

                reason:
                    options.reason ||
                    null

            }
        );


        emit(
            normalized,
            {

                previous,

                current:
                    normalized,

                expression:
                    state.expression,

                activity:
                    state.activity,

                intensity:
                    state.intensity

            }
        );


        updateMountedElements();


        return getState();

    }


    function defaultIntensity(
        avatarState
    ) {

        switch (
            avatarState
        ) {

            case STATES.WELCOME:

                return 0.75;


            case STATES.LISTENING:

                return 0.55;


            case STATES.THINKING:

                return 0.65;


            case STATES.SPEAKING:

                return 0.70;


            case STATES.RESPONDING:

                return 0.68;


            case STATES.ERROR:

                return 0.25;


            case STATES.OFFLINE:

                return 0.15;


            default:

                return 0.35;

        }

    }


    /* ============================================================
       15 — SHORTCUT STATES
       ============================================================ */

    function idle(
        options = {}
    ) {

        return setState(
            STATES.IDLE,
            options
        );

    }


    function listening(
        options = {}
    ) {

        return setState(
            STATES.LISTENING,
            options
        );

    }


    function thinking(
        options = {}
    ) {

        return setState(
            STATES.THINKING,
            options
        );

    }


    function speaking(
        options = {}
    ) {

        return setState(
            STATES.SPEAKING,
            options
        );

    }


    function responding(
        options = {}
    ) {

        return setState(
            STATES.RESPONDING,
            options
        );

    }


    function welcome(
        options = {}
    ) {

        return setState(
            STATES.WELCOME,
            {

                intensity:
                    0.80,

                ...options

            }
        );

    }


    function errorState(
        options = {}
    ) {

        return setState(
            STATES.ERROR,
            options
        );

    }


    function offline(
        options = {}
    ) {

        return setState(
            STATES.OFFLINE,
            options
        );

    }


    /* ============================================================
       16 — EXPRESSION
       ============================================================ */

    function setExpression(
        expression,
        options = {}
    ) {

        const value =
            safeString(
                expression,
                EXPRESSIONS.CALM
            )
            .toLowerCase();


        state.expression =
            value;


        if (
            typeof options.intensity ===
            "number"
        ) {

            state.intensity =
                Math.max(
                    0,
                    Math.min(
                        1,
                        options.intensity
                    )
                );

        }


        state.statistics.expressions +=
            1;


        emit(
            "expression-changed",
            {

                expression:
                    state.expression,

                intensity:
                    state.intensity

            }
        );


        updateMountedElements();


        return state.expression;

    }


    /* ============================================================
       17 — LOGO
       ============================================================ */

    function getLogoSource() {

        /*
         * Zuerst ein explizit gesetztes Asset.
         */

        if (
            HalDoOS.assets &&
            HalDoOS.assets.logo
        ) {

            return safeString(
                HalDoOS.assets.logo,
                DEFAULT_LOGO
            );

        }


        if (
            window.HalDoLogo
        ) {

            return safeString(
                window.HalDoLogo,
                DEFAULT_LOGO
            );

        }


        /*
         * HalDo AI OS 20 Standard.
         */

        return DEFAULT_LOGO;

    }


    function setLogoSource(
        source
    ) {

        const value =
            safeString(
                source,
                DEFAULT_LOGO
            );


        HalDoOS.assets =
            HalDoOS.assets || {};

        HalDoOS.assets.logo =
            value;


        emit(
            "logo-changed",
            {

                source:
                    value

            }
        );


        updateMountedElements();


        return value;

    }


    /* ============================================================
       18 — REDUCED MOTION
       ============================================================ */

    function detectReducedMotion() {

        try {

            if (
                window.matchMedia
            ) {

                return window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;

            }

        } catch (_) {}


        return false;

    }


    function setReducedMotion(
        enabled
    ) {

        state.reducedMotion =
            Boolean(
                enabled
            );


        updateMountedElements();


        emit(
            "reduced-motion-changed",
            {

                enabled:
                    state.reducedMotion

            }
        );


        return state.reducedMotion;

    }


    /* ============================================================
       19 — DOM AVATAR ELEMENT
       ============================================================ */

    function createAvatarElement(
        options = {}
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "haldo-ai-avatar";


        wrapper.dataset.haldoAvatar =
            "true";


        wrapper.dataset.state =
            state.state;


        wrapper.dataset.expression =
            state.expression;


        wrapper.dataset.activity =
            state.activity;


        wrapper.setAttribute(
            "role",
            "img"
        );


        wrapper.setAttribute(
            "aria-label",
            "HalDo AI"
        );


        const image =
            document.createElement(
                "img"
            );


        image.className =
            "haldo-ai-avatar-image";


        image.src =
            options.logo ||
            getLogoSource();


        image.alt =
            "HalDo AI";


        image.draggable =
            false;


        image.decoding =
            "async";


        image.loading =
            "eager";


        wrapper.appendChild(
            image
        );


        /*
         * Sanfte Glow-Ebene.
         */

        const glow =
            document.createElement(
                "span"
            );


        glow.className =
            "haldo-ai-avatar-glow";


        glow.setAttribute(
            "aria-hidden",
            "true"
        );


        wrapper.appendChild(
            glow
        );


        /*
         * Atem-/Bewegungsebene.
         */

        const aura =
            document.createElement(
                "span"
            );


        aura.className =
            "haldo-ai-avatar-aura";


        aura.setAttribute(
            "aria-hidden",
            "true"
        );


        wrapper.appendChild(
            aura
        );


        /*
         * Zustandssynchronisierung.
         */

        applyElementState(
            wrapper
        );


        return wrapper;

    }


    /* ============================================================
       20 — APPLY DOM STATE
       ============================================================ */

    function applyElementState(
        element
    ) {

        if (
            !element
        ) {

            return;

        }


        element.dataset.state =
            state.state;


        element.dataset.expression =
            state.expression;


        element.dataset.activity =
            state.activity;


        element.dataset.intensity =
            String(
                state.intensity
            );


        element.dataset.enabled =
            String(
                state.enabled
            );


        element.dataset.visible =
            String(
                state.visible
            );


        element.dataset.reducedMotion =
            String(
                state.reducedMotion
            );


        if (
            state.visible &&
            state.enabled
        ) {

            element.removeAttribute(
                "hidden"
            );

        } else {

            element.setAttribute(
                "hidden",
                ""
            );

        }


        const image =
            element.querySelector(
                ".haldo-ai-avatar-image"
            );


        if (
            image &&
            image.src !== getLogoSource()
        ) {

            image.src =
                getLogoSource();

        }

    }


    function updateMountedElements() {

        state.mountedElements
            .forEach(
                element => {

                    try {

                        applyElementState(
                            element
                        );

                    } catch (exception) {

                        reportError(
                            exception,
                            "Avatar DOM Update"
                        );

                    }

                }
            );

    }


    /* ============================================================
       21 — MOUNT
       ============================================================ */

    function mount(
        target,
        options = {}
    ) {

        let container =
            target;


        if (
            typeof target ===
            "string"
        ) {

            container =
                document.querySelector(
                    target
                );

        }


        if (
            !container
        ) {

            reportError(
                new Error(
                    "Avatar Mount-Ziel nicht gefunden."
                ),
                "Avatar Mount"
            );


            return null;

        }


        const avatar =
            createAvatarElement(
                options
            );


        container.appendChild(
            avatar
        );


        state.mountedElements.add(
            avatar
        );


        state.statistics.mounts +=
            1;


        emit(
            "mounted",
            {

                element:
                    avatar,

                target:
                    container

            }
        );


        return avatar;

    }


    /* ============================================================
       22 — UNMOUNT
       ============================================================ */

    function unmount(
        element
    ) {

        if (
            !element
        ) {

            return false;

        }


        if (
            state.mountedElements.has(
                element
            )
        ) {

            state.mountedElements.delete(
                element
            );

        }


        try {

            if (
                element.parentNode
            ) {

                element.parentNode.removeChild(
                    element
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "Avatar Unmount"
            );


            return false;

        }


        state.statistics.unmounts +=
            1;


        emit(
            "unmounted",
            {

                element

            }
        );


        return true;

    }


    function unmountAll() {

        Array.from(
            state.mountedElements
        )
        .forEach(
            element =>
                unmount(
                    element
                )
        );

    }


    /* ============================================================
       23 — ENABLE / DISABLE
       ============================================================ */

    function enable() {

        state.enabled =
            true;


        updateMountedElements();


        emit(
            "enabled",
            {

                enabled:
                    true

            }
        );


        return true;

    }


    function disable() {

        state.enabled =
            false;


        updateMountedElements();


        emit(
            "disabled",
            {

                enabled:
                    false

            }
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


        updateMountedElements();


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
       24 — INTERACTION
       ============================================================ */

    function interact(
        type = "interaction",
        data = null
    ) {

        state.lastInteraction =
            now();


        emit(
            "interaction",
            {

                type:
                    safeString(
                        type,
                        "interaction"
                    ),

                data:
                    clone(
                        data
                    )

            }
        );


        /*
         * Eine normale Interaktion soll den Avatar
         * aufmerksam machen, aber keinen laufenden
         * Sprech-/Denkzustand zerstören.
         */

        if (
            state.state ===
            STATES.IDLE
        ) {

            setExpression(
                EXPRESSIONS.ATTENTIVE,
                {
                    intensity:
                        0.50
                }
            );

        }


        return getState();

    }


    /* ============================================================
       25 — AI EVENTS
       ============================================================ */

    function handleAIStart() {

        thinking(
            {
                reason:
                    "ai-start"
            }
        );

    }


    function handleAIResponse(
        data
    ) {

        responding(
            {
                reason:
                    "ai-response",

                data
            }
        );

    }


    function handleAIError(
        data
    ) {

        errorState(
            {
                reason:
                    "ai-error",

                data
            }
        );

    }


    /* ============================================================
       26 — VOICE EVENTS
       ============================================================ */

    function handleListeningStart() {

        listening(
            {
                reason:
                    "voice-listening"
            }
        );

    }


    function handleListeningEnd() {

        if (
            state.state ===
            STATES.LISTENING
        ) {

            idle(
                {
                    reason:
                        "voice-listening-end"
                }
            );

        }

    }


    function handleSpeechStart() {

        speaking(
            {
                reason:
                    "speech-start"
            }
        );

    }


    function handleSpeechEnd() {

        if (
            state.state ===
            STATES.SPEAKING
        ) {

            idle(
                {
                    reason:
                        "speech-end"
                }
            );

        }

    }


    /* ============================================================
       27 — SERVICE EVENT CONNECTION
       ============================================================ */

    function subscribeToService(
        service,
        eventNames,
        handler
    ) {

        if (
            !service ||
            typeof handler !==
            "function"
        ) {

            return false;

        }


        const names =
            Array.isArray(
                eventNames
            )
                ? eventNames
                : [eventNames];


        let connected =
            false;


        names.forEach(
            eventName => {

                try {

                    if (
                        hasMethod(
                            service,
                            "on"
                        )
                    ) {

                        service.on(
                            eventName,
                            handler
                        );

                        connected =
                            true;

                    }

                } catch (exception) {

                    reportError(
                        exception,
                        "Service Event Connection: " +
                        eventName
                    );

                }

            }
        );


        return connected;

    }


    /* ============================================================
       28 — CONNECT AI CORE
       ============================================================ */

    function connectAICore() {

        const ai =
            getAICore();


        if (!ai) {

            state.connections.aiCore =
                false;

            return false;

        }


        let connected =
            false;


        connected =
            subscribeToService(
                ai,
                [
                    "thinking",
                    "processing",
                    "request-start",
                    "ai:start",
                    "generation-start"
                ],
                handleAIStart
            ) ||
            connected;


        connected =
            subscribeToService(
                ai,
                [
                    "response",
                    "response-ready",
                    "ai:response",
                    "generation-complete"
                ],
                handleAIResponse
            ) ||
            connected;


        connected =
            subscribeToService(
                ai,
                [
                    "error",
                    "ai:error"
                ],
                handleAIError
            ) ||
            connected;


        state.connections.aiCore =
            connected || !!ai;


        return state.connections.aiCore;

    }


    /* ============================================================
       29 — CONNECT CHAT
       ============================================================ */

    function connectChat() {

        const chat =
            getChat();


        if (!chat) {

            state.connections.chat =
                false;

            return false;

        }


        let connected =
            false;


        connected =
            subscribeToService(
                chat,
                [
                    "thinking",
                    "message-start",
                    "send-start",
                    "processing"
                ],
                handleAIStart
            ) ||
            connected;


        connected =
            subscribeToService(
                chat,
                [
                    "response",
                    "message",
                    "response-ready",
                    "message-complete"
                ],
                handleAIResponse
            ) ||
            connected;


        state.connections.chat =
            connected || !!chat;


        return state.connections.chat;

    }


    /* ============================================================
       30 — CONNECT VOICE
       ============================================================ */

    function connectVoice() {

        const voice =
            getVoice();


        if (!voice) {

            state.connections.voice =
                false;

            return false;

        }


        let connected =
            false;


        connected =
            subscribeToService(
                voice,
                [
                    "listening",
                    "listen-start",
                    "recording-start"
                ],
                handleListeningStart
            ) ||
            connected;


        connected =
            subscribeToService(
                voice,
                [
                    "listen-end",
                    "listening-end",
                    "recording-end"
                ],
                handleListeningEnd
            ) ||
            connected;


        connected =
            subscribeToService(
                voice,
                [
                    "speaking",
                    "speech-start",
                    "voice-start"
                ],
                handleSpeechStart
            ) ||
            connected;


        connected =
            subscribeToService(
                voice,
                [
                    "speech-end",
                    "speaking-end",
                    "voice-end"
                ],
                handleSpeechEnd
            ) ||
            connected;


        state.connections.voice =
            connected || !!voice;


        return state.connections.voice;

    }


    /* ============================================================
       31 — CONNECT SPEECH
       ============================================================ */

    function connectSpeech() {

        const speech =
            getSpeech();


        if (!speech) {

            state.connections.speech =
                false;

            return false;

        }


        let connected =
            false;


        connected =
            subscribeToService(
                speech,
                [
                    "start",
                    "speech-start",
                    "speaking"
                ],
                handleSpeechStart
            ) ||
            connected;


        connected =
            subscribeToService(
                speech,
                [
                    "end",
                    "speech-end",
                    "complete"
                ],
                handleSpeechEnd
            ) ||
            connected;


        state.connections.speech =
            connected || !!speech;


        return state.connections.speech;

    }


    /* ============================================================
       32 — CONNECT REGISTRY
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
                        "haldo-ai-avatar",

                    name:
                        "HalDo AI Avatar",

                    title:
                        "HalDo AI Avatar",

                    description:
                        "Lebendiger visueller Avatar für HalDo AI.",

                    category:
                        "ai",

                    version:
                        VERSION,

                    icon:
                        null,

                    iconUrl:
                        getLogoSource(),

                    system:
                        true,

                    core:
                        true,

                    singleton:
                        true,

                    visible:
                        true,

                    enabled:
                        true,

                    capabilities: [

                        "ai-avatar",

                        "visual-ai",

                        "ai-state",

                        "ai-expression",

                        "ai-listening",

                        "ai-thinking",

                        "ai-speaking",

                        "ai-response",

                        "avatar-animation",

                        "avatar-logo",

                        "cosmic-welcome"

                    ],

                    permissions: [

                        "ui.avatar",

                        "ui.animation",

                        "ai.state",

                        "voice.state"

                    ],

                    dependencies: [

                        "app-registry"

                    ],

                    route:
                        null

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
       33 — CONNECT COSMIC SOUND
       ============================================================ */

    function connectCosmicSound() {

        const sound =
            getCosmicSound();


        if (!sound) {

            state.connections.cosmicSound =
                false;

            return false;

        }


        state.connections.cosmicSound =
            true;


        return true;

    }


    /* ============================================================
       34 — CONNECT SERVICES
       ============================================================ */

    function connectServices() {

        const kernel =
            getKernel();


        const system =
            getSystem();


        state.connections.kernel =
            !!kernel;


        state.connections.system =
            !!system;


        connectRegistry();

        connectAICore();

        connectChat();

        connectVoice();

        connectSpeech();

        connectCosmicSound();


        state.connections.language =
            !!getLanguage();


        emit(
            "connections-refreshed",
            {

                connections:
                    getConnectionStatus()

            }
        );


        return getConnectionStatus();

    }


    /* ============================================================
       35 — CONNECTION STATUS
       ============================================================ */

    function getConnectionStatus() {

        return {

            kernel:
                !!getKernel(),

            system:
                !!getSystem(),

            registry:
                !!getRegistry(),

            aiCore:
                !!getAICore(),

            chat:
                !!getChat(),

            voice:
                !!getVoice(),

            speech:
                !!getSpeech(),

            language:
                !!getLanguage(),

            cosmicSound:
                !!getCosmicSound()

        };

    }


    /* ============================================================
       36 — ONLINE / OFFLINE
       ============================================================ */

    function handleOnline() {

        state.online =
            true;


        emit(
            "online",
            {

                online:
                    true

            }
        );


        if (
            state.state ===
            STATES.OFFLINE
        ) {

            idle(
                {
                    reason:
                        "online"
                }
            );

        }

    }


    function handleOffline() {

        state.online =
            false;


        offline(
            {
                reason:
                    "offline"
            }
        );


        emit(
            "offline",
            {

                online:
                    false

            }
        );

    }


    /* ============================================================
       37 — AVATAR SETTINGS
       ============================================================ */

    function setIntensity(
        intensity
    ) {

        const value =
            Number(
                intensity
            );


        if (
            !Number.isFinite(
                value
            )
        ) {

            return state.intensity;

        }


        state.intensity =
            Math.max(
                0,
                Math.min(
                    1,
                    value
                )
            );


        updateMountedElements();


        emit(
            "intensity-changed",
            {

                intensity:
                    state.intensity

            }
        );


        return state.intensity;

    }


    /* ============================================================
       38 — COSMIC WELCOME
       ============================================================ */

    async function playWelcome(
        options = {}
    ) {

        welcome(
            {
                reason:
                    "cosmic-welcome",

                intensity:
                    0.85,

                ...options

            }
        );


        const sound =
            getCosmicSound();


        if (
            sound
        ) {

            try {

                if (
                    hasMethod(
                        sound,
                        "playWelcome"
                    )
                ) {

                    await sound.playWelcome(
                        options
                    );

                } else if (
                    hasMethod(
                        sound,
                        "play"
                    )
                ) {

                    await sound.play(
                        "welcome"
                    );

                }

            } catch (exception) {

                reportError(
                    exception,
                    "Cosmic Welcome"
                );

            }

        }


        emit(
            "welcome-started",
            {

                options:
                    clone(options)

            }
        );


        const duration =
            Number(
                options.duration ||
                1800
            );


        window.setTimeout(
            () => {

                if (
                    state.state ===
                    STATES.WELCOME
                ) {

                    idle(
                        {
                            reason:
                                "welcome-complete"
                        }
                    );

                }


                emit(
                    "welcome-complete",
                    null
                );

            },
            Math.max(
                300,
                duration
            )
        );


        return getState();

    }


    /* ============================================================
       39 — TALKING CONTROL
       ============================================================ */

    function beginListening(
        options = {}
    ) {

        return listening(
            {
                reason:
                    "begin-listening",

                ...options

            }
        );

    }


    function endListening(
        options = {}
    ) {

        if (
            state.state ===
            STATES.LISTENING
        ) {

            return idle(
                {
                    reason:
                        "end-listening",

                    ...options

                }
            );

        }


        return getState();

    }


    function beginThinking(
        options = {}
    ) {

        return thinking(
            {
                reason:
                    "begin-thinking",

                ...options

            }
        );

    }


    function beginSpeaking(
        options = {}
    ) {

        return speaking(
            {
                reason:
                    "begin-speaking",

                ...options

            }
        );

    }


    function endSpeaking(
        options = {}
    ) {

        if (
            state.state ===
            STATES.SPEAKING ||
            state.state ===
            STATES.RESPONDING
        ) {

            return idle(
                {
                    reason:
                        "end-speaking",

                    ...options

                }
            );

        }


        return getState();

    }


    /* ============================================================
       40 — STATE ACCESS
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

            state:
                state.state,

            previousState:
                state.previousState,

            expression:
                state.expression,

            activity:
                state.activity,

            intensity:
                state.intensity,

            enabled:
                state.enabled,

            visible:
                state.visible,

            online:
                state.online,

            speaking:
                state.speaking,

            listening:
                state.listening,

            thinking:
                state.thinking,

            responding:
                state.responding,

            welcome:
                state.welcome,

            reducedMotion:
                state.reducedMotion,

            logo:
                getLogoSource()

        };

    }


    /* ============================================================
       41 — DIAGNOSTICS
       ============================================================ */

    function diagnostics() {

        return {

            name:
                NAME,

            module:
                MODULE_ID,

            version:
                VERSION,

            state:
                getState(),

            connections:
                getConnectionStatus(),

            mounted:
                state.mountedElements.size,

            statistics:
                {
                    ...state.statistics
                },

            lastInteraction:
                state.lastInteraction,

            lastStateChange:
                state.lastStateChange,

            lastError:
                clone(
                    state.lastError
                ),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ============================================================
       42 — HEALTH CHECK
       ============================================================ */

    function healthCheck() {

        const connections =
            getConnectionStatus();


        const problems = [];


        if (
            !connections.registry
        ) {

            problems.push(
                "App Registry nicht verbunden."
            );

        }


        if (
            !connections.aiCore
        ) {

            problems.push(
                "AI Core noch nicht verbunden."
            );

        }


        if (
            !connections.language
        ) {

            problems.push(
                "Language Manager noch nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length === 0,

            problems,

            connections,

            state:
                getState(),

            timestamp:
                new Date().toISOString()

        };

    }


    /* ============================================================
       43 — PUBLIC API
       ============================================================ */

    const api = {

        name:
            NAME,

        module:
            MODULE_ID,

        version:
            VERSION,


        STATES,

        EXPRESSIONS,

        ACTIVITY,


        /*
         * State
         */

        getState,

        setState,

        idle,

        listening,

        thinking,

        speaking,

        responding,

        welcome,

        error:
            errorState,

        offline,


        /*
         * Expression
         */

        setExpression,


        /*
         * Logo
         */

        getLogoSource,

        setLogoSource,


        /*
         * DOM
         */

        createAvatarElement,

        mount,

        unmount,

        unmountAll,


        /*
         * Visibility
         */

        enable,

        disable,

        setVisible,


        /*
         * Interaction
         */

        interact,

        setIntensity,


        /*
         * Voice / AI control
         */

        beginListening,

        endListening,

        beginThinking,

        beginSpeaking,

        endSpeaking,


        /*
         * Cosmic Welcome
         */

        playWelcome,


        /*
         * Events
         */

        on,

        off,

        emit,


        /*
         * Connections
         */

        connectServices,

        getConnectionStatus,


        /*
         * Diagnostics
         */

        diagnostics,

        healthCheck,


        /*
         * Accessibility
         */

        setReducedMotion,

        detectReducedMotion

    };


    /* ============================================================
       44 — GLOBAL EXPORT
       ============================================================ */

    window.HalDoAIAvatar =
        api;

    window.HalDoAvatar =
        api;

    HalDoOS.aiAvatar =
        api;


    HalDoOS.services =
        HalDoOS.services || {};

    HalDoOS.services.aiAvatar =
        api;


    /* ============================================================
       45 — ONLINE / OFFLINE EVENTS
       ============================================================ */

    window.addEventListener(
        "online",
        handleOnline
    );


    window.addEventListener(
        "offline",
        handleOffline
    );


    /* ============================================================
       46 — INITIALIZATION
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


        try {

            /*
             * Accessibility zuerst.
             */

            state.reducedMotion =
                detectReducedMotion();


            /*
             * Standardlogo sicherstellen.
             */

            if (
                !getLogoSource()
            ) {

                setLogoSource(
                    DEFAULT_LOGO
                );

            }


            /*
             * Services verbinden.
             */

            connectServices();


            /*
             * Offline-Zustand respektieren.
             */

            if (
                navigator.onLine === false
            ) {

                state.online =
                    false;

                offline(
                    {
                        reason:
                            "initial-offline"
                    }
                );

            } else {

                state.online =
                    true;

                idle(
                    {
                        reason:
                            "initialization"
                    }
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

                    connections:
                        getConnectionStatus()

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
       47 — BOOT
       ============================================================ */

    function boot() {

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

    }


    api.initialize =
        initialize;

    api.boot =
        boot;


    /* ============================================================
       48 — KERNEL MODULE REGISTRATION
       ============================================================ */

    function connectKernel() {

        const kernel =
            getKernel();


        if (!kernel) {

            return false;

        }


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


            state.connections.kernel =
                true;


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Kernel Registration"
            );


            return false;

        }

    }


    /* ============================================================
       49 — DOM START
       ============================================================ */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                connectKernel();

                boot();

            },
            {
                once:
                    true
            }
        );

    } else {

        connectKernel();

        boot();

    }


    /* ============================================================
       50 — FINAL REFERENCES
       ============================================================ */

    window.HalDoAIAvatar =
        api;

    window.HalDoAvatar =
        api;

    HalDoOS.aiAvatar =
        api;

    HalDoOS.services =
        HalDoOS.services || {};

    HalDoOS.services.aiAvatar =
        api;


    /* ============================================================
       END
       HALDO AI OS 20
       HALDO AI AVATAR SERVICE
       ============================================================ */

})(window, document);
