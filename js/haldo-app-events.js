/*
 * ============================================================
 * HalDo AI OS 20
 * Universal App Event Bus
 * ============================================================
 *
 * Datei:
 *   js/haldo-app-events.js
 *
 * Zweck:
 *   Zentrale Kommunikation zwischen allen HalDo-Modulen
 *   und allen HalDo-Apps.
 *
 * Prinzip:
 *
 *   App A
 *      │
 *      ▼
 *   Event Bus
 *      │
 *      ├── App B
 *      ├── App C
 *      ├── AI
 *      ├── System
 *      ├── Navigation
 *      ├── Calendar
 *      └── weitere Systeme
 *
 * Bestehende APIs werden nicht blind überschrieben.
 * Falls bereits ein kompatibler Event Bus vorhanden ist,
 * wird dieser erkannt und nach Möglichkeit integriert.
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


    const appListeners =
        new Map();


    const history =
        [];


    const maxHistory =
        500;


    let ready =
        false;


    let eventSequence =
        0;


    const EventBus = {

        name:
            "HalDo V20 Universal App Event Bus",

        version:
            "20.0.0"
    };


    /* ========================================================
       INTERNAL HELPERS
    ======================================================== */

    function normalizeId(
        id
    ) {

        return String(
            id || ""
        )
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
    }


    function createEvent(
        eventName,
        data,
        options
    ) {

        const opts =
            options || {};


        return {

            id:
                "haldo-event-" +
                Date.now() +
                "-" +
                (++eventSequence),

            name:
                String(
                    eventName || ""
                ),

            data:
                data,

            source:
                opts.source ||
                opts.sourceApp ||
                "system",

            sourceApp:
                opts.sourceApp ||
                null,

            targetApp:
                opts.targetApp ||
                null,

            timestamp:
                Date.now(),

            internal:
                opts.internal === true,

            broadcast:
                opts.broadcast !== false,

            metadata:
                opts.metadata || {}
        };
    }


    function storeHistory(
        event
    ) {

        history.push(
            event
        );


        while (
            history.length >
            maxHistory
        ) {

            history.shift();
        }
    }


    function getHandlers(
        eventName
    ) {

        return listeners.get(
            eventName
        );
    }


    function invokeHandler(
        handler,
        event
    ) {

        try {

            const result =
                handler(
                    event
                );


            if (
                result &&
                typeof result.catch ===
                "function"
            ) {

                result.catch(
                    function (error) {

                        console.error(
                            "[HalDo Event Bus]",
                            "Async Handler Fehler:",
                            error
                        );

                    }
                );
            }


            return result;

        } catch (error) {

            console.error(
                "[HalDo Event Bus]",
                "Handler Fehler:",
                error
            );


            return null;
        }
    }


    /* ========================================================
       SUBSCRIBE
    ======================================================== */

    EventBus.on =
        function (
            eventName,
            handler,
            options
        ) {

            if (
                !eventName ||
                typeof handler !==
                "function"
            ) {

                return function () {};
            }


            const name =
                String(
                    eventName
                );


            if (
                !listeners.has(
                    name
                )
            ) {

                listeners.set(
                    name,
                    new Set()
                );
            }


            const record = {

                handler:
                    handler,

                once:
                    Boolean(
                        options &&
                        options.once
                    ),

                owner:
                    options &&
                    options.owner
                        ? normalizeId(
                            options.owner
                        )
                        : null
            };


            const set =
                listeners.get(
                    name
                );


            set.add(
                record
            );


            return function () {

                set.delete(
                    record
                );

            };
        };


    /* ========================================================
       ONCE
    ======================================================== */

    EventBus.once =
        function (
            eventName,
            handler,
            options
        ) {

            return EventBus.on(
                eventName,
                handler,
                Object.assign(
                    {},
                    options || {},
                    {
                        once:
                            true
                    }
                )
            );
        };


    /* ========================================================
       OFF
    ======================================================== */

    EventBus.off =
        function (
            eventName,
            handler
        ) {

            const set =
                listeners.get(
                    String(
                        eventName
                    )
                );


            if (!set) {
                return false;
            }


            let removed =
                false;


            Array.from(
                set
            )
            .forEach(
                function (
                    record
                ) {

                    if (
                        record.handler ===
                        handler
                    ) {

                        set.delete(
                            record
                        );

                        removed =
                            true;
                    }

                }
            );


            return removed;
        };


    /* ========================================================
       EMIT
    ======================================================== */

    EventBus.emit =
        function (
            eventName,
            data,
            options
        ) {

            const event =
                createEvent(
                    eventName,
                    data,
                    options
                );


            storeHistory(
                event
            );


            const set =
                getHandlers(
                    event.name
                );


            if (set) {

                Array.from(
                    set
                )
                .forEach(
                    function (
                        record
                    ) {

                        invokeHandler(
                            record.handler,
                            event
                        );


                        if (
                            record.once
                        ) {

                            set.delete(
                                record
                            );
                        }

                    }
                );
            }


            /*
             * Wildcard listeners.
             */

            const wildcard =
                getHandlers(
                    "*"
                );


            if (wildcard) {

                Array.from(
                    wildcard
                )
                .forEach(
                    function (
                        record
                    ) {

                        invokeHandler(
                            record.handler,
                            event
                        );


                        if (
                            record.once
                        ) {

                            wildcard.delete(
                                record
                            );
                        }

                    }
                );
            }


            /*
             * Browser CustomEvent.
             *
             * Dadurch können auch ältere oder
             * externe Module zuhören.
             */

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        "haldo:" +
                        event.name,
                        {
                            detail:
                                event
                        }
                    )
                );

            } catch (error) {

                /*
                 * Ältere Browser / Testumgebungen
                 * dürfen den Bus nicht zerstören.
                 */

            }


            return event;
        };


    /* ========================================================
       APP EVENT
    ======================================================== */

    EventBus.appEvent =
        function (
            appId,
            eventName,
            data,
            options
        ) {

            const id =
                normalizeId(
                    appId
                );


            return EventBus.emit(
                eventName,
                data,
                Object.assign(
                    {},
                    options || {},
                    {

                        source:
                            id,

                        sourceApp:
                            id
                    }
                )
            );
        };


    /* ========================================================
       SEND TO APP
    ======================================================== */

    EventBus.send =
        function (
            sourceApp,
            targetApp,
            eventName,
            data,
            options
        ) {

            const source =
                normalizeId(
                    sourceApp
                );


            const target =
                normalizeId(
                    targetApp
                );


            const event =
                createEvent(
                    eventName,
                    data,
                    Object.assign(
                        {},
                        options || {},
                        {

                            source:
                                source,

                            sourceApp:
                                source,

                            targetApp:
                                target,

                            broadcast:
                                false
                        }
                    )
                );


            storeHistory(
                event
            );


            /*
             * Ziel-App Listener
             */

            const targetSet =
                appListeners.get(
                    target
                );


            if (
                targetSet
            ) {

                Array.from(
                    targetSet
                )
                .forEach(
                    function (
                        record
                    ) {

                        if (
                            record.eventName ===
                            eventName ||
                            record.eventName ===
                            "*"
                        ) {

                            invokeHandler(
                                record.handler,
                                event
                            );


                            if (
                                record.once
                            ) {

                                targetSet.delete(
                                    record
                                );
                            }
                        }

                    }
                );
            }


            /*
             * Globale Listener erhalten
             * ebenfalls das Event.
             */

            const globalSet =
                listeners.get(
                    eventName
                );


            if (
                globalSet
            ) {

                Array.from(
                    globalSet
                )
                .forEach(
                    function (
                        record
                    ) {

                        invokeHandler(
                            record.handler,
                            event
                        );


                        if (
                            record.once
                        ) {

                            globalSet.delete(
                                record
                            );
                        }

                    }
                );
            }


            /*
             * Browser Bridge
             */

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        "haldo:app-message",
                        {
                            detail:
                                event
                        }
                    )
                );

            } catch (error) {
                /* Safe fallback */
            }


            return event;
        };


    /* ========================================================
       BROADCAST
    ======================================================== */

    EventBus.broadcast =
        function (
            sourceApp,
            eventName,
            data,
            options
        ) {

            const source =
                normalizeId(
                    sourceApp
                );


            return EventBus.emit(
                eventName,
                data,
                Object.assign(
                    {},
                    options || {},
                    {

                        source:
                            source,

                        sourceApp:
                            source,

                        broadcast:
                            true
                    }
                )
            );
        };


    /* ========================================================
       SYSTEM EVENT
    ======================================================== */

    EventBus.system =
        function (
            eventName,
            data,
            options
        ) {

            return EventBus.emit(
                eventName,
                data,
                Object.assign(
                    {},
                    options || {},
                    {

                        source:
                            "system",

                        sourceApp:
                            null,

                        internal:
                            true
                    }
                )
            );
        };


    /* ========================================================
       SUBSCRIBE APP
    ======================================================== */

    EventBus.subscribeApp =
        function (
            appId,
            eventName,
            handler,
            options
        ) {

            const id =
                normalizeId(
                    appId
                );


            if (
                !id ||
                typeof handler !==
                "function"
            ) {

                return function () {};
            }


            if (
                !appListeners.has(
                    id
                )
            ) {

                appListeners.set(
                    id,
                    new Set()
                );
            }


            const record = {

                eventName:
                    String(
                        eventName ||
                        "*"
                    ),

                handler:
                    handler,

                once:
                    Boolean(
                        options &&
                        options.once
                    )
            };


            const set =
                appListeners.get(
                    id
                );


            set.add(
                record
            );


            return function () {

                set.delete(
                    record
                );

            };
        };


    /* ========================================================
       UNSUBSCRIBE APP
    ======================================================== */

    EventBus.unsubscribeApp =
        function (
            appId,
            eventName,
            handler
        ) {

            const id =
                normalizeId(
                    appId
                );


            const set =
                appListeners.get(
                    id
                );


            if (!set) {
                return false;
            }


            let removed =
                false;


            Array.from(
                set
            )
            .forEach(
                function (
                    record
                ) {

                    const eventMatches =
                        !eventName ||
                        record.eventName ===
                        eventName;


                    const handlerMatches =
                        !handler ||
                        record.handler ===
                        handler;


                    if (
                        eventMatches &&
                        handlerMatches
                    ) {

                        set.delete(
                            record
                        );

                        removed =
                            true;
                    }

                }
            );


            return removed;
        };


    /* ========================================================
       APP EVENT LISTENER HELPER
    ======================================================== */

    EventBus.listen =
        function (
            appId,
            eventName,
            handler,
            options
        ) {

            return EventBus.subscribeApp(
                appId,
                eventName,
                handler,
                options
            );
        };


    /* ========================================================
       WAIT FOR EVENT
    ======================================================== */

    EventBus.waitFor =
        function (
            eventName,
            timeout
        ) {

            const wait =
                Number(
                    timeout || 10000
                );


            return new Promise(
                function (
                    resolve,
                    reject
                ) {

                    let timer =
                        null;


                    const unsubscribe =
                        EventBus.once(
                            eventName,
                            function (
                                event
                            ) {

                                if (
                                    timer
                                ) {

                                    clearTimeout(
                                        timer
                                    );
                                }


                                resolve(
                                    event
                                );

                            }
                        );


                    timer =
                        setTimeout(
                            function () {

                                unsubscribe();


                                reject(
                                    new Error(
                                        "Timeout beim Warten auf Event: " +
                                        eventName
                                    )
                                );

                            },
                            wait
                        );

                }
            );
        };


    /* ========================================================
       HISTORY
    ======================================================== */

    EventBus.getHistory =
        function (
            filter
        ) {

            if (
                !filter
            ) {

                return history.slice();
            }


            return history.filter(
                function (
                    event
                ) {

                    if (
                        filter.name &&
                        event.name !==
                        filter.name
                    ) {

                        return false;
                    }


                    if (
                        filter.sourceApp &&
                        event.sourceApp !==
                        normalizeId(
                            filter.sourceApp
                        )
                    ) {

                        return false;
                    }


                    if (
                        filter.targetApp &&
                        event.targetApp !==
                        normalizeId(
                            filter.targetApp
                        )
                    ) {

                        return false;
                    }


                    return true;
                }
            );
        };


    /* ========================================================
       CLEAR HISTORY
    ======================================================== */

    EventBus.clearHistory =
        function () {

            history.length =
                0;
        };


    /* ========================================================
       APP EVENT HISTORY
    ======================================================== */

    EventBus.getAppHistory =
        function (
            appId
        ) {

            const id =
                normalizeId(
                    appId
                );


            return history.filter(
                function (
                    event
                ) {

                    return (
                        event.sourceApp ===
                        id ||
                        event.targetApp ===
                        id
                    );

                }
            );
        };


    /* ========================================================
       EVENT NAMES
    ======================================================== */

    EventBus.names =
        {

            SYSTEM_READY:
                "system:ready",

            SYSTEM_ERROR:
                "system:error",

            APP_REGISTERED:
                "app:registered",

            APP_UPDATED:
                "app:updated",

            APP_OPEN:
                "app:open",

            APP_CLOSE:
                "app:close",

            APP_STARTED:
                "app:started",

            APP_STOPPED:
                "app:stopped",

            APP_ERROR:
                "app:error",

            APP_STATE_CHANGED:
                "app:state-changed",

            LANGUAGE_CHANGED:
                "language:changed",

            THEME_CHANGED:
                "theme:changed",

            SETTINGS_CHANGED:
                "settings:changed",

            STORAGE_CHANGED:
                "storage:changed",

            LOCATION_CHANGED:
                "location:changed",

            NAVIGATION_STARTED:
                "navigation:started",

            NAVIGATION_UPDATED:
                "navigation:updated",

            NAVIGATION_ARRIVED:
                "navigation:arrived",

            CALENDAR_EVENT_CREATED:
                "calendar:event-created",

            CALENDAR_EVENT_UPDATED:
                "calendar:event-updated",

            CALENDAR_EVENT_REMOVED:
                "calendar:event-removed",

            MUSIC_STARTED:
                "music:started",

            MUSIC_STOPPED:
                "music:stopped",

            VIDEO_STARTED:
                "video:started",

            VIDEO_STOPPED:
                "video:stopped",

            AI_MESSAGE:
                "ai:message",

            AI_RESPONSE:
                "ai:response",

            VOICE_STARTED:
                "voice:started",

            VOICE_STOPPED:
                "voice:stopped",

            COSMIC_STATE_CHANGED:
                "cosmic:state-changed",

            COSMIC_EVENT:
                "cosmic:event",

            COSMIC_WELCOME:
                "cosmic:welcome",

            NOTIFICATION:
                "notification:show"
        };


    /* ========================================================
       CONNECT EXISTING EVENT SYSTEM
    ======================================================== */

    function connectExistingBus() {

        /*
         * Bereits vorhandener HalDoAppEvents-Bus.
         *
         * Falls diese Datei selbst zuerst geladen wird,
         * existiert dieser noch nicht.
         */

        const existing =
            window.HalDoOS &&
            window.HalDoOS.appEvents;


        if (
            existing &&
            existing !== EventBus &&
            typeof existing.on ===
            "function"
        ) {

            try {

                existing.on(
                    "*",
                    function (
                        event
                    ) {

                        if (
                            event &&
                            event.name
                        ) {

                            EventBus.emit(
                                event.name,
                                event.data,
                                {

                                    source:
                                        event.source,

                                    sourceApp:
                                        event.sourceApp,

                                    targetApp:
                                        event.targetApp,

                                    internal:
                                        true
                                }
                            );
                        }

                    }
                );

            } catch (error) {

                console.warn(
                    "[HalDo Event Bus]",
                    "Bestehender Bus konnte nicht angebunden werden.",
                    error
                );
            }
        }
    }


    /* ========================================================
       GLOBAL API
    ======================================================== */

    EventBus.getStatus =
        function () {

            return {

                name:
                    EventBus.name,

                version:
                    EventBus.version,

                ready:
                    ready,

                globalListeners:
                    listeners.size,

                appChannels:
                    appListeners.size,

                history:
                    history.length,

                timestamp:
                    Date.now()
            };
        };


    /* ========================================================
       INITIALIZE
    ======================================================== */

    EventBus.init =
        function () {

            if (
                ready
            ) {

                return EventBus;
            }


            /*
             * Globale APIs.
             */

            window.HalDoAppEvents =
                EventBus;


            window.HalDoV20AppEvents =
                EventBus;


            HalDoOS.appEvents =
                EventBus;


            V20.appEvents =
                EventBus;


            connectExistingBus();


            ready =
                true;


            /*
             * Runtime informieren.
             */

            EventBus.emit(
                "system:event-bus-ready",
                EventBus.getStatus(),
                {

                    source:
                        "system",

                    internal:
                        true
                }
            );


            console.log(
                "[HalDo AI OS 20]",
                "Universal App Event Bus bereit."
            );


            return EventBus;
        };


    /* ========================================================
       BOOT
    ======================================================== */

    function boot() {

        try {

            EventBus.init();

        } catch (error) {

            console.error(
                "[HalDo AI OS 20]",
                "Event Bus Startfehler:",
                error
            );
        }
    }


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


})(window, document);