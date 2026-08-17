/*
 * ============================================================
 * HalDo AI OS 20
 * Universal App Contract
 * ============================================================
 *
 * Datei:
 *   js/haldo-app-contract.js
 *
 * Zweck:
 *   Gemeinsame Grundlage für alle HalDo-AI-OS-20-Apps.
 *
 * Jede zukünftige App kann:
 *   - initialisiert werden
 *   - gestartet werden
 *   - pausiert werden
 *   - geschlossen werden
 *   - Events senden/empfangen
 *   - Daten speichern
 *   - Sprache verwenden
 *   - Benachrichtigungen auslösen
 *
 * Bestehende App-Systeme werden NICHT ersetzt.
 * ============================================================
 */

(function (window, document) {
    "use strict";

    const HalDoOS = window.HalDoOS =
        window.HalDoOS || {};

    const V20 = window.HalDoV20 =
        window.HalDoV20 || null;


    /* ---------------------------------------------------------
       APP FACTORY
    --------------------------------------------------------- */

    function createApp(definition) {

        definition = definition || {};

        const id = String(
            definition.id ||
            definition.appId ||
            ""
        ).trim();

        if (!id) {
            throw new Error(
                "HalDo App Contract: app id is required."
            );
        }


        const app = {

            id: id,

            name:
                definition.name ||
                id,

            version:
                definition.version ||
                "20.0.0",

            category:
                definition.category ||
                "system",

            icon:
                definition.icon ||
                "◈",

            description:
                definition.description ||
                "",

            state: "created",

            initialized: false,

            mounted: false,

            root: null,

            data: {},

            settings:
                definition.settings ||
                {},


            /* -------------------------------------------------
               INIT
            ------------------------------------------------- */

            async init(context) {

                if (this.initialized) {
                    return this;
                }

                this.context =
                    context || {};

                try {

                    if (
                        typeof definition.init ===
                        "function"
                    ) {
                        await definition.init.call(
                            this,
                            this.context
                        );
                    }

                    this.initialized = true;
                    this.state = "ready";

                    emit(
                        "app:initialized",
                        {
                            app: this
                        }
                    );

                } catch (error) {

                    this.state = "error";

                    emit(
                        "app:error",
                        {
                            app: this,
                            error: error
                        }
                    );

                    throw error;
                }

                return this;
            },


            /* -------------------------------------------------
               MOUNT
            ------------------------------------------------- */

            async mount(container) {

                if (!container) {
                    throw new Error(
                        "HalDo App: container required."
                    );
                }

                this.root = container;

                try {

                    if (
                        typeof definition.mount ===
                        "function"
                    ) {

                        await definition.mount.call(
                            this,
                            container,
                            this.context || {}
                        );
                    }

                    this.mounted = true;
                    this.state = "mounted";

                    emit(
                        "app:mounted",
                        {
                            app: this
                        }
                    );

                } catch (error) {

                    this.state = "error";

                    emit(
                        "app:error",
                        {
                            app: this,
                            error: error
                        }
                    );

                    throw error;
                }

                return this;
            },


            /* -------------------------------------------------
               START
            ------------------------------------------------- */

            async start(options) {

                try {

                    if (
                        typeof definition.start ===
                        "function"
                    ) {

                        await definition.start.call(
                            this,
                            options || {}
                        );
                    }

                    this.state = "running";

                    emit(
                        "app:started",
                        {
                            app: this,
                            options:
                                options || {}
                        }
                    );

                } catch (error) {

                    this.state = "error";

                    emit(
                        "app:error",
                        {
                            app: this,
                            error: error
                        }
                    );

                    throw error;
                }

                return this;
            },


            /* -------------------------------------------------
               PAUSE
            ------------------------------------------------- */

            async pause() {

                try {

                    if (
                        typeof definition.pause ===
                        "function"
                    ) {

                        await definition.pause.call(
                            this
                        );
                    }

                    this.state = "paused";

                    emit(
                        "app:paused",
                        {
                            app: this
                        }
                    );

                } catch (error) {

                    emit(
                        "app:error",
                        {
                            app: this,
                            error: error
                        }
                    );
                }

                return this;
            },


            /* -------------------------------------------------
               STOP
            ------------------------------------------------- */

            async stop() {

                try {

                    if (
                        typeof definition.stop ===
                        "function"
                    ) {

                        await definition.stop.call(
                            this
                        );
                    }

                    this.state = "stopped";

                    emit(
                        "app:stopped",
                        {
                            app: this
                        }
                    );

                } catch (error) {

                    emit(
                        "app:error",
                        {
                            app: this,
                            error: error
                        }
                    );
                }

                return this;
            },


            /* -------------------------------------------------
               DESTROY
            ------------------------------------------------- */

            async destroy() {

                try {

                    if (
                        typeof definition.destroy ===
                        "function"
                    ) {

                        await definition.destroy.call(
                            this
                        );
                    }

                    this.root = null;
                    this.context = null;
                    this.data = {};
                    this.state = "destroyed";

                    emit(
                        "app:destroyed",
                        {
                            app: this
                        }
                    );

                } catch (error) {

                    emit(
                        "app:error",
                        {
                            app: this,
                            error: error
                        }
                    );
                }

                return this;
            },


            /* -------------------------------------------------
               EVENT
            ------------------------------------------------- */

            emit(eventName, detail) {

                emit(
                    eventName,
                    Object.assign(
                        {
                            appId: this.id
                        },
                        detail || {}
                    )
                );
            },


            on(eventName, callback) {

                if (
                    V20 &&
                    typeof V20.on ===
                    "function"
                ) {

                    return V20.on(
                        eventName,
                        callback
                    );
                }

                return function () {};
            },


            /* -------------------------------------------------
               STORAGE
            ------------------------------------------------- */

            getData(key, fallback) {

                const storage =
                    V20 &&
                    V20.storage;

                if (
                    storage &&
                    typeof storage.get ===
                    "function"
                ) {

                    return storage.get(
                        this.storageKey(key),
                        fallback
                    );
                }

                return fallback;
            },


            setData(key, value) {

                const storage =
                    V20 &&
                    V20.storage;

                if (
                    storage &&
                    typeof storage.set ===
                    "function"
                ) {

                    return storage.set(
                        this.storageKey(key),
                        value
                    );
                }

                return false;
            },


            storageKey(key) {

                return (
                    "haldo.app." +
                    this.id +
                    "." +
                    String(key)
                );
            },


            /* -------------------------------------------------
               LANGUAGE
            ------------------------------------------------- */

            getLanguage() {

                if (
                    V20 &&
                    V20.language &&
                    typeof V20.language.get ===
                    "function"
                ) {

                    return V20.language.get();
                }

                return (
                    document.documentElement.lang ||
                    "de"
                );
            },


            setLanguage(language) {

                if (
                    V20 &&
                    V20.language &&
                    typeof V20.language.set ===
                    "function"
                ) {

                    return V20.language.set(
                        language
                    );
                }

                return false;
            },


            /* -------------------------------------------------
               NOTIFICATION
            ------------------------------------------------- */

            notify(title, message, options) {

                if (
                    V20 &&
                    typeof V20.notify ===
                    "function"
                ) {

                    return V20.notify(
                        title,
                        message,
                        options || {}
                    );
                }

                return null;
            },


            /* -------------------------------------------------
               OPEN ANOTHER APP
            ------------------------------------------------- */

            openApp(appId, options) {

                if (
                    V20 &&
                    typeof V20.openApp ===
                    "function"
                ) {

                    return V20.openApp(
                        appId,
                        options || {}
                    );
                }

                return null;
            }
        };


        /* -----------------------------------------------------
           AUTO REGISTRATION
        ----------------------------------------------------- */

        if (
            V20 &&
            typeof V20.registerApp ===
            "function"
        ) {

            try {

                V20.registerApp({
                    id: app.id,
                    name: app.name,
                    version: app.version,
                    category: app.category,
                    icon: app.icon,
                    description: app.description,
                    instance: app
                });

            } catch (error) {

                console.warn(
                    "[HalDo App Contract] " +
                    "Registration failed:",
                    app.id,
                    error
                );
            }
        }


        return app;
    }


    /* ---------------------------------------------------------
       EVENT HELPER
    --------------------------------------------------------- */

    function emit(eventName, detail) {

        if (
            V20 &&
            typeof V20.emit ===
            "function"
        ) {

            V20.emit(
                eventName,
                detail || {}
            );

            return;
        }


        try {

            document.dispatchEvent(
                new CustomEvent(
                    "haldo:" + eventName,
                    {
                        detail:
                            detail || {}
                    }
                )
            );

        } catch (error) {
            // Safe fallback
        }
    }


    /* ---------------------------------------------------------
       GLOBAL API
    --------------------------------------------------------- */

    window.HalDoAppContract = {
        version: "20.0.0",
        create: createApp
    };

    HalDoOS.appContract =
        window.HalDoAppContract;


})(window, document);