/* ============================================================
   HALDO AI OS 20
   COSMIC API
   ============================================================ */

(function (window, document) {

    "use strict";

    const state = {

        enabled: true,

        mode: "ambient",

        intensity: 1,

        appWelcome: true,

        systemWelcome: true,

        secretClock: true,

        stars: true,

        planets: true,

        sunRays: true,

        orbitLines: false
    };

    const listeners = {};

    function on(event, callback) {

        if (
            typeof callback !== "function"
        ) {
            return () => {};
        }

        if (!listeners[event]) {
            listeners[event] = new Set();
        }

        listeners[event].add(callback);

        return () => {

            listeners[event].delete(
                callback
            );
        };
    }

    function emit(event, detail = {}) {

        if (listeners[event]) {

            listeners[event].forEach(
                callback => {

                    try {
                        callback(detail);
                    } catch (error) {
                        console.error(
                            "[HalDo Cosmic API]",
                            error
                        );
                    }
                }
            );
        }

        window.dispatchEvent(
            new CustomEvent(
                `haldo:cosmic:${event}`,
                {
                    detail
                }
            )
        );
    }

    function setEnabled(enabled) {

        state.enabled =
            Boolean(enabled);

        emit(
            "enabled-change",
            {
                enabled:
                    state.enabled
            }
        );
    }

    function setMode(mode) {

        const allowed = [
            "ambient",
            "welcome",
            "system",
            "app"
        ];

        if (
            !allowed.includes(mode)
        ) {
            return false;
        }

        state.mode = mode;

        emit(
            "mode-change",
            {
                mode
            }
        );

        return true;
    }

    function setIntensity(value) {

        const intensity =
            Math.max(
                0,
                Math.min(
                    1,
                    Number(value)
                )
            );

        state.intensity =
            Number.isFinite(
                intensity
            )
                ? intensity
                : 1;

        emit(
            "intensity-change",
            {
                intensity:
                    state.intensity
            }
        );
    }

    function appOpened(appId) {

        emit(
            "app-opened",
            {
                appId
            }
        );
    }

    function appClosed(appId) {

        emit(
            "app-closed",
            {
                appId
            }
        );
    }

    function aiSpeaking() {

        emit(
            "ai-speaking"
        );
    }

    function aiFinishedSpeaking() {

        emit(
            "ai-finished-speaking"
        );
    }

    function welcome(type = "app") {

        emit(
            "welcome",
            {
                type
            }
        );
    }

    function getState() {

        return {
            ...state
        };
    }

    const api = {

        version: "20.0.0",

        state,

        on,

        emit,

        getState,

        setEnabled,

        setMode,

        setIntensity,

        appOpened,

        appClosed,

        aiSpeaking,

        aiFinishedSpeaking,

        welcome
    };

    window.HalDoCosmicAPI =
        api;

    emit(
        "ready",
        {
            version:
                api.version
        }
    );

})(window, document);