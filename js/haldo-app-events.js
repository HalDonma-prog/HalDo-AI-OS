/*
 * ============================================================
 * HalDo AI OS 20
 * Universal App Event & Communication Bus
 * ============================================================
 *
 * Datei:
 *   js/haldo-app-events.js
 *
 * Zweck:
 *   Zentrale Kommunikation zwischen allen HalDo Apps.
 *
 * Beispiele:
 *
 *   Kalender → Navigation
 *   Navigation → Verkehr
 *   AI → Kalender
 *   AI → Musik
 *   Einstellungen → alle Apps
 *   Sprache → alle Apps
 *   Cosmic World → System
 *   System → Apps
 *
 * ============================================================
 */

(function (window, document) {

    "use strict";


    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};


    const V20 =
        window.HalDoV20 =
        window.HalDoV20 || {};


    const listeners =
        new Map();


    const appSubscriptions =
        new Map();


    const history = [];


    const MAX_HISTORY =
        300;


    const Bus = {

        name:
            "HalDo V20 App Event Bus",

        version:
            "20.0.0",

        ready:
            false
    };


    /* ========================================================
       NORMALIZE
    ======================================================== */

    Bus.normalize = function (value) {

        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
    };


    /* ========================================================
       EVENT KEY
    ======================================================== */

    Bus.key = function (
        eventName
    ) {

        return String(
            eventName || ""
        )
        .trim()
        .toLowerCase();
    };


    /* ========================================================
       SUBSCRIBE
    ======================================================== */

    Bus.on = function (
        eventName,
        handler,
        options
    ) {

        const key =
            Bus.key(eventName);


        if (
            !key ||
            typeof handler !==
            "function"
        ) {

            return function () {};
        }


        if (
            !listeners.has(key)
        ) {

            listeners.set(
                key,
                new Set()
            );
        }


        const set =
            listeners.get(key);


        set.add(handler);


        const once =
            options &&
            options.once === true;


        let active = true;


        const unsubscribe =
            function () {

                if (!active) {
                    return;
                }


                active = false;

                set.delete(
                    handler
                );


                if (
                    set.size === 0
                ) {

                    listeners.delete(
                        key
                    );
                }
            };


        if (once) {

            const original =
                handler;


            const wrapped =
                function () {

                    unsubscribe();

                    return original.apply(
                        this,
                        arguments
                    );
                };


            set.delete(
                handler
            );

            set.add(
                wrapped
            );


            return function () {

                set.delete(
                    wrapped
                );

            };
        }


        return unsubscribe;
    };


    /* ========================================================
       ONCE
    ======================================================== */

    Bus.once = function (
        eventName,
        handler
    ) {

        return Bus.on(
            eventName,
            handler,
            {
                once:
                    true
            }
        );
    };


    /* ========================================================
       OFF
    ======================================================== */

    Bus.off = function (
        eventName,
        handler
    ) {

        const key =
            Bus.key(eventName);


        const set =
            listeners.get(key);


        if (!set) {
            return;
        }


        if (
            typeof handler ===
            "function"
        ) {

            set.delete(
                handler
            );

        } else {

            set.clear();
        }


        if (
            set.size === 0
        ) {

            listeners.delete(
                key
            );
        }
    };


    /* ========================================================
       EMIT
    ======================================================== */

    Bus.emit = function (
        eventName,
        data,
        metadata
    ) {

        const key =
            Bus.key(eventName);


        if (!key) {
            return false;
        }


        const event = {

            id:
                "evt-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .slice(2),

            name:
                key,

            data:
                data || {},

            metadata:
                metadata || {},

            timestamp:
                Date.now()
        };


        history.push(
            event
        );


        while (
            history.length >
            MAX_HISTORY
        ) {

            history.shift();
        }


        /*
         * Internal listeners
         */

        const set =
            listeners.get(key);


        if (set) {

            Array.from(
                set
            ).forEach(
                function (handler) {

                    try {

                        handler(
                            event
                        );

                    } catch (error) {

                        console.error(
                            "[HalDo Event Bus]",
                            error
                        );

                        Bus.emit(
                            "system:error",
                            {
                                source:
                                    "app-events",

                                event:
                                    key,

                                error:
                                    error
                            },
                            {
                                internal:
                                    true
                            }
                        );
                    }

                }
            );
        }


        /*
         * Wildcard listeners
         */

        const wildcard =
            listeners.get("*");


        if (wildcard) {

            Array.from(
                wildcard
            ).forEach(
                function (handler) {

                    try {

                        handler(
                            event
                        );

                    } catch (error) {

                        console.error(
                            "[HalDo Event Bus]",
                            error
                        );
                    }

                }
            );
        }


        /*
         * Browser event
         */

        try {

            document.dispatchEvent(
                new CustomEvent(
                    "haldo:app-event",
                    {
                        detail:
                            event
                    }
                )
            );

        } catch (error) {

            console.warn(
                "[HalDo Event Bus] " +
                "Browser Event fehlgeschlagen.",
                error
            );
        }


        return event;
    };


    /* ========================================================
       APP SUBSCRIBE
    ======================================================== */

    Bus.subscribeApp = function (
        appId,
        eventName,
        handler
    ) {

        const normalizedApp =
            Bus.normalize(appId);


        if (
            !appSubscriptions.has(
                normalizedApp
            )
        ) {

            appSubscriptions.set(
                normalizedApp,
                new Set()
            );
        }


        const unsubscribe =
            Bus.on(
                eventName,
                handler
            );


        appSubscriptions
            .get(normalizedApp)
            .add(
                unsubscribe
            );


        return function () {

            unsubscribe();

            const set =
                appSubscriptions.get(
                    normalizedApp
                );


            if (set) {

                set.delete(
                    unsubscribe
                );


                if (
                    set.size === 0
                ) {

                    appSubscriptions.delete(
                        normalizedApp
                    );
                }
            }
        };
    };


    /* ========================================================
       UNSUBSCRIBE APP
    ======================================================== */

    Bus.unsubscribeApp = function (
        appId
    ) {

        const normalizedApp =
            Bus.normalize(appId);


        const set =
            appSubscriptions.get(
                normalizedApp
            );


        if (!set) {
            return;
        }


        Array.from(
            set
        ).forEach(
            function (unsubscribe) {

                try {

                    unsubscribe();

                } catch (error) {

                    console.warn(
                        "[HalDo Event Bus]",
                        error
                    );
                }

            }
        );


        appSubscriptions.delete(
            normalizedApp
        );
    };


    /* ========================================================
       APP MESSAGE
    ======================================================== */

    Bus.send = function (
        sourceApp,
        targetApp,
        eventName,
        data
    ) {

        const source =
            Bus.normalize(
                sourceApp
            );


        const target =
            Bus.normalize(
                targetApp
            );


        return Bus.emit(
            "app:message",
            {

                sourceApp:
                    source,

                targetApp:
                    target,

                event:
                    Bus.key(
                        eventName
                    ),

                data:
                    data || {}
            },
            {

                sourceApp:
                    source,

                targetApp:
                    target,

                communication:
                    true
            }
        );
    };


    /* ========================================================
       BROADCAST
    ======================================================== */

    Bus.broadcast = function (
        sourceApp,
        eventName,
        data
    ) {

        const source =
            Bus.normalize(
                sourceApp
            );


        return Bus.emit(
            "app:broadcast",
            {

                sourceApp:
                    source,

                event:
                    Bus.key(
                        eventName
                    ),

                data:
                    data || {}
            },
            {

                sourceApp:
                    source,

                broadcast:
                    true
            }
        );
    };


    /* ========================================================
       APP-SPECIFIC EVENT
    ======================================================== */

    Bus.appEvent = function (
        appId,
        eventName,
        data
    ) {

        const app =
            Bus.normalize(
                appId
            );


        const event =
            Bus.key(
                eventName
            );


        return Bus.emit(
            "app:" +
            app +
            ":" +
            event,
            data || {},
            {

                appId:
                    app,

                appEvent:
                    true
            }
        );
    };


    /* ========================================================
       SYSTEM EVENT
    ======================================================== */

    Bus.system = function (
        eventName,
        data
    ) {

        return Bus.emit(
            "system:" +
            Bus.key(
                eventName
            ),
            data || {},
            {

                system:
                    true
            }
        );
    };


    /* ========================================================
       USER EVENT
    ======================================================== */

    Bus.user = function (
        eventName,
        data
    ) {

        return Bus.emit(
            "user:" +
            Bus.key(
                eventName
            ),
            data || {},
            {

                user:
                    true
            }
        );
    };


    /* ========================================================
       GET HISTORY
    ======================================================== */

    Bus.getHistory = function (
        filter
    ) {

        if (
            typeof filter !==
            "function"
        ) {

            return history.slice();
        }


        return history.filter(
            filter
        );
    };


    /* ========================================================
       CLEAR HISTORY
    ======================================================== */

    Bus.clearHistory = function () {

        history.length = 0;
    };


    /* ========================================================
       APP CONNECTION
    ======================================================== */

    Bus.connectApps = function (
        sourceApp,
        targetApp,
        eventName,
        handler
    ) {

        const source =
            Bus.normalize(
                sourceApp
            );


        const target =
            Bus.normalize(
                targetApp
            );


        const event =
            Bus.key(
                eventName
            );


        return Bus.on(
            "app:message",
            function (message) {

                if (!message) {
                    return;
                }


                const data =
                    message.data || {};


                if (
                    message.metadata &&
                    message.metadata.targetApp !==
                    target
                ) {

                    return;
                }


                if (
                    message.data &&
                    message.data.targetApp &&
                    Bus.normalize(
                        message.data.targetApp
                    ) !== target
                ) {

                    return;
                }


                if (
                    message.data &&
                    message.data.sourceApp &&
                    Bus.normalize(
                        message.data.sourceApp
                    ) !== source
                ) {

                    return;
                }


                if (
                    Bus.key(
                        message.data &&
                        message.data.event
                    ) !== event
                ) {

                    return;
                }


                try {

                    handler(
                        data,
                        message
                    );

                } catch (error) {

                    console.error(
                        "[HalDo Event Bus]",
                        error
                    );
                }

            }
        );
    };


    /* ========================================================
       APP CONTEXT
    ======================================================== */

    Bus.createAppContext = function (
        appId
    ) {

        const id =
            Bus.normalize(
                appId
            );


        return {

            appId:
                id,

            on:
                function (
                    eventName,
                    handler
                ) {

                    return Bus.subscribeApp(
                        id,
                        eventName,
                        handler
                    );
                },


            emit:
                function (
                    eventName,
                    data
                ) {

                    return Bus.appEvent(
                        id,
                        eventName,
                        data
                    );
                },


            send:
                function (
                    targetApp,
                    eventName,
                    data
                ) {

                    return Bus.send(
                        id,
                        targetApp,
                        eventName,
                        data
                    );
                },


            broadcast:
                function (
                    eventName,
                    data
                ) {

                    return Bus.broadcast(
                        id,
                        eventName,
                        data
                    );
                },


            system:
                function (
                    eventName,
                    data
                ) {

                    return Bus.system(
                        eventName,
                        data
                    );
                },


            user:
                function (
                    eventName,
                    data
                ) {

                    return Bus.user(
                        eventName,
                        data
                    );
                },


            destroy:
                function () {

                    Bus.unsubscribeApp(
                        id
                    );
                }
        };
    };


    /* ========================================================
       STATUS
    ======================================================== */

    Bus.getStatus = function () {

        return {

            name:
                Bus.name,

            version:
                Bus.version,

            ready:
                Bus.ready,

            eventTypes:
                listeners.size,

            subscribedApps:
                appSubscriptions.size,

            historySize:
                history.length,

            timestamp:
                Date.now()
        };
    };


    /* ========================================================
       INITIALIZE
    ======================================================== */

    Bus.init = function () {

        if (Bus.ready) {
            return Bus;
        }


        Bus.ready =
            true;


        /*
         * Bridge to existing Kernel
         */

        const kernel =
            window.HalDoKernel;


        if (
            kernel &&
            typeof kernel.on ===
            "function"
        ) {

            kernel.on(
                "app:open",
                function (data) {

                    Bus.emit(
                        "app:open",
                        data || {},
                        {
                            kernel:
                                true
                        }
                    );

                }
            );


            kernel.on(
                "app:close",
                function (data) {

                    Bus.emit(
                        "app:close",
                        data || {},
                        {
                            kernel:
                                true
                        }
                    );

                }
            );


            kernel.on(
                "language:changed",
                function (data) {

                    Bus.emit(
                        "language:changed",
                        data || {},
                        {
                            kernel:
                                true
                        }
                    );

                }
            );


            kernel.on(
                "system:ready",
                function (data) {

                    Bus.emit(
                        "system:ready",
                        data || {},
                        {
                            kernel:
                                true
                        }
                    );

                }
            );
        }


        /*
         * Global exports
         */

        window.HalDoAppEvents =
            Bus;


        HalDoOS.appEvents =
            Bus;


        V20.appEvents =
            Bus;


        Bus.emit(
            "system:app-events-ready",
            Bus.getStatus(),
            {
                internal:
                    true
            }
        );


        console.log(
            "[HalDo AI OS 20] " +
            "App Communication Bus bereit."
        );


        return Bus;
    };


    /* ========================================================
       START
    ======================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                Bus.init();

            },
            {
                once:
                    true
            }
        );

    } else {

        Bus.init();
    }


})(window, document);