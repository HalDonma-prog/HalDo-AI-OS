/* ============================================================
   HALDO AI OS 20
   APP EVENTS / COMMUNICATION BUS
   ============================================================ */

(function (window, document) {

    "use strict";

    const VERSION = "20.0.0";

    class HalDoAppEvents {

        constructor() {

            this.version = VERSION;

            this.listeners = new Map();

            this.history = [];

            this.maxHistory = 200;

            this.initialized = false;
        }

        /* ====================================================
           INITIALIZE
           ==================================================== */

        init() {

            if (this.initialized) {
                return this;
            }

            this.initialized = true;

            window.HalDoAppEvents = this;

            this.emit(
                "system:events-ready",
                {
                    version: this.version
                }
            );

            window.dispatchEvent(
                new CustomEvent(
                    "haldo:app-events-ready",
                    {
                        detail: {
                            version: this.version
                        }
                    }
                )
            );

            return this;
        }

        /* ====================================================
           SUBSCRIBE
           ==================================================== */

        on(eventName, callback) {

            if (
                typeof eventName !== "string" ||
                !eventName.trim()
            ) {
                return () => {};
            }

            if (
                typeof callback !== "function"
            ) {
                return () => {};
            }

            if (
                !this.listeners.has(eventName)
            ) {
                this.listeners.set(
                    eventName,
                    new Set()
                );
            }

            const listeners =
                this.listeners.get(eventName);

            listeners.add(callback);

            return () => {

                listeners.delete(callback);

                if (
                    listeners.size === 0
                ) {
                    this.listeners.delete(
                        eventName
                    );
                }
            };
        }

        /* ====================================================
           ONCE
           ==================================================== */

        once(eventName, callback) {

            let unsubscribe;

            const wrapper =
                (payload) => {

                    if (unsubscribe) {
                        unsubscribe();
                    }

                    callback(payload);
                };

            unsubscribe =
                this.on(
                    eventName,
                    wrapper
                );

            return unsubscribe;
        }

        /* ====================================================
           EMIT
           ==================================================== */

        emit(
            eventName,
            payload = {},
            options = {}
        ) {

            if (
                typeof eventName !== "string" ||
                !eventName.trim()
            ) {
                return false;
            }

            const event = {

                id:
                    this.createEventId(),

                name:
                    eventName,

                payload:
                    payload || {},

                source:
                    options.source ||
                    "unknown",

                timestamp:
                    Date.now()
            };

            this.history.push(event);

            if (
                this.history.length >
                this.maxHistory
            ) {

                this.history.shift();
            }

            const listeners =
                this.listeners.get(
                    eventName
                );

            if (listeners) {

                [...listeners].forEach(
                    listener => {

                        try {

                            listener(
                                event.payload,
                                event
                            );

                        } catch (error) {

                            console.error(
                                "[HalDo Events]",
                                eventName,
                                error
                            );
                        }
                    }
                );
            }

            /*
             * Zusätzlich als normales DOM Event
             * veröffentlichen.
             */

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        `haldo:${eventName}`,
                        {
                            detail: event
                        }
                    )
                );

            } catch (error) {

                console.warn(
                    "[HalDo Events] DOM Event Fehler:",
                    error
                );
            }

            return event;
        }

        /* ====================================================
           APP EVENT
           ==================================================== */

        app(appId, action, data = {}) {

            return this.emit(
                `app:${appId}:${action}`,
                data,
                {
                    source: appId
                }
            );
        }

        /* ====================================================
           BROADCAST
           ==================================================== */

        broadcast(
            action,
            data = {},
            source = "system"
        ) {

            return this.emit(
                `broadcast:${action}`,
                data,
                {
                    source
                }
            );
        }

        /* ====================================================
           REQUEST / RESPONSE
           ==================================================== */

        request(
            eventName,
            payload = {},
            timeout = 5000
        ) {

            return new Promise(
                (resolve, reject) => {

                    let finished = false;

                    const requestId =
                        this.createEventId();

                    const responseEvent =
                        `${eventName}:response`;

                    const cleanup =
                        this.on(
                            responseEvent,
                            response => {

                                if (
                                    finished
                                ) {
                                    return;
                                }

                                if (
                                    response &&
                                    response.requestId ===
                                    requestId
                                ) {

                                    finished = true;

                                    cleanup();

                                    resolve(
                                        response.data
                                    );
                                }
                            }
                        );

                    this.emit(
                        eventName,
                        {
                            ...payload,

                            requestId
                        },
                        {
                            source:
                                "request"
                        }
                    );

                    window.setTimeout(
                        () => {

                            if (
                                finished
                            ) {
                                return;
                            }

                            finished = true;

                            cleanup();

                            reject(
                                new Error(
                                    `HalDo Event Timeout: ${eventName}`
                                )
                            );

                        },
                        timeout
                    );
                }
            );
        }

        /* ====================================================
           RESPOND
           ==================================================== */

        respond(
            eventName,
            requestId,
            data = {}
        ) {

            return this.emit(
                `${eventName}:response`,
                {
                    requestId,
                    data
                },
                {
                    source:
                        "response"
                }
            );
        }

        /* ====================================================
           HISTORY
           ==================================================== */

        getHistory(
            eventName = null
        ) {

            if (!eventName) {

                return [
                    ...this.history
                ];
            }

            return this.history.filter(
                event =>
                    event.name === eventName
            );
        }

        /* ====================================================
           CLEAR HISTORY
           ==================================================== */

        clearHistory() {

            this.history = [];
        }

        /* ====================================================
           EVENT ID
           ==================================================== */

        createEventId() {

            return (
                "haldo-" +
                Date.now().toString(36) +
                "-" +
                Math.random()
                    .toString(36)
                    .slice(2, 10)
            );
        }
    }

    /* ========================================================
       GLOBAL INSTANCE
       ======================================================== */

    const eventBus =
        new HalDoAppEvents();

    window.HalDoAppEvents =
        eventBus;

    /* ========================================================
       INITIALIZE
       ======================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            () => eventBus.init(),
            {
                once: true
            }
        );

    } else {

        eventBus.init();
    }

})(window, document);