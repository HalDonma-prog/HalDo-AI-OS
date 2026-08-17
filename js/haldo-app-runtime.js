/*
 * ============================================================
 * HalDo AI OS 20
 * Universal App Runtime
 * ============================================================
 *
 * Datei:
 *   js/haldo-app-runtime.js
 *
 * Aufgabe:
 *   Zentrale Laufzeitumgebung für alle HalDo Apps.
 *
 *   Verbindet:
 *   App Registry
 *   App Contract
 *   App Manager
 *   Router
 *   Window Manager
 *   Storage
 *   Language
 *   AI
 *   Voice
 *   Notifications
 *   Event-System
 *
 * ============================================================
 */

(function (window, document) {

    "use strict";


    /* =========================================================
       GLOBAL REFERENCES
    ========================================================= */

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};

    const V20 =
        window.HalDoV20 =
        window.HalDoV20 || {};

    const Registry =
        window.HalDoV20AppRegistry ||
        null;


    /* =========================================================
       RUNTIME
    ========================================================= */

    const Runtime = {

        name:
            "HalDo AI OS 20 App Runtime",

        version:
            "20.0.0",

        ready:
            false,

        applications:
            new Map(),

        activeAppId:
            null,

        initializedApps:
            new Set(),

        runningApps:
            new Set()
    };


    /* =========================================================
       INTERNAL LOGGING
    ========================================================= */

    Runtime.log = function () {

        const args =
            Array.from(arguments);

        console.log(
            "[HalDo App Runtime]",
            ...args
        );
    };


    Runtime.warn = function () {

        const args =
            Array.from(arguments);

        console.warn(
            "[HalDo App Runtime]",
            ...args
        );
    };


    Runtime.error = function () {

        const args =
            Array.from(arguments);

        console.error(
            "[HalDo App Runtime]",
            ...args
        );
    };


    /* =========================================================
       EVENT HELPERS
    ========================================================= */

    Runtime.emit = function (
        eventName,
        detail
    ) {

        const payload =
            detail || {};

        /*
         * V20 Event Bus
         */

        if (
            V20 &&
            typeof V20.emit ===
            "function"
        ) {

            try {

                V20.emit(
                    "app-runtime:" +
                    eventName,
                    payload
                );

            } catch (error) {

                Runtime.warn(
                    "V20 Event konnte nicht gesendet werden.",
                    error
                );
            }
        }


        /*
         * Browser Event Fallback
         */

        try {

            document.dispatchEvent(
                new CustomEvent(
                    "haldo:app-runtime:" +
                    eventName,
                    {
                        detail:
                            payload
                    }
                )
            );

        } catch (error) {

            Runtime.warn(
                "Browser Event fehlgeschlagen.",
                error
            );
        }
    };


    /* =========================================================
       NORMALIZE ID
    ========================================================= */

    Runtime.normalizeId = function (
        id
    ) {

        return String(
            id || ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );
    };


    /* =========================================================
       RESOLVE APP
    ========================================================= */

    Runtime.resolve = function (
        id
    ) {

        const normalized =
            Runtime.normalizeId(id);

        if (!normalized) {
            return null;
        }


        /*
         * Runtime Cache
         */

        if (
            Runtime.applications.has(
                normalized
            )
        ) {

            return Runtime.applications.get(
                normalized
            );
        }


        /*
         * Registry
         */

        if (Registry) {

            const registered =
                Registry.get(
                    normalized
                );

            if (registered) {

                Runtime.applications.set(
                    normalized,
                    registered
                );

                return registered;
            }
        }


        /*
         * Existing App Manager
         */

        const manager =
            window.HalDoAppManager ||
            null;

        if (
            manager &&
            typeof manager.getApp ===
            "function"
        ) {

            try {

                const app =
                    manager.getApp(
                        normalized
                    );

                if (app) {

                    Runtime.applications.set(
                        normalized,
                        app
                    );

                    return app;
                }

            } catch (error) {

                Runtime.warn(
                    "App Manager konnte App nicht auflösen.",
                    error
                );
            }
        }


        return null;
    };


    /* =========================================================
       REGISTER INSTANCE
    ========================================================= */

    Runtime.register = function (
        app
    ) {

        if (!app) {

            throw new Error(
                "HalDo Runtime: " +
                "Keine App angegeben."
            );
        }


        const id =
            Runtime.normalizeId(
                app.id ||
                app.appId ||
                app.name
            );


        if (!id) {

            throw new Error(
                "HalDo Runtime: " +
                "App besitzt keine ID."
            );
        }


        Runtime.applications.set(
            id,
            app
        );


        Runtime.emit(
            "registered",
            {
                appId:
                    id,

                app:
                    app
            }
        );


        return app;
    };


    /* =========================================================
       INITIALIZE
    ========================================================= */

    Runtime.initialize = async function (
        id,
        context
    ) {

        const app =
            Runtime.resolve(id);

        if (!app) {

            throw new Error(
                "HalDo Runtime: " +
                "App nicht gefunden: " +
                id
            );
        }


        const normalized =
            Runtime.normalizeId(id);


        /*
         * Already initialized
         */

        if (
            Runtime.initializedApps.has(
                normalized
            )
        ) {

            return app;
        }


        try {

            if (
                typeof app.init ===
                "function"
            ) {

                await app.init(
                    Object.assign(
                        {},
                        Runtime.createContext(
                            normalized
                        ),
                        context || {}
                    )
                );
            }


            Runtime.initializedApps.add(
                normalized
            );


            Runtime.emit(
                "initialized",
                {
                    appId:
                        normalized,

                    app:
                        app
                }
            );


            return app;

        } catch (error) {

            Runtime.error(
                "App Initialisierung fehlgeschlagen:",
                normalized,
                error
            );


            Runtime.emit(
                "error",
                {
                    appId:
                        normalized,

                    error:
                        error
                }
            );


            throw error;
        }
    };


    /* =========================================================
       MOUNT
    ========================================================= */

    Runtime.mount = async function (
        id,
        container,
        context
    ) {

        const app =
            await Runtime.initialize(
                id,
                context
            );


        if (!container) {

            throw new Error(
                "HalDo Runtime: " +
                "Mount-Container fehlt."
            );
        }


        if (
            typeof app.mount ===
            "function"
        ) {

            await app.mount(
                container
            );
        }


        Runtime.emit(
            "mounted",
            {
                appId:
                    Runtime.normalizeId(id),

                app:
                    app,

                container:
                    container
            }
        );


        return app;
    };


    /* =========================================================
       START
    ========================================================= */

    Runtime.start = async function (
        id,
        options
    ) {

        const normalized =
            Runtime.normalizeId(id);

        const app =
            await Runtime.initialize(
                normalized
            );


        /*
         * Dependency check
         */

        if (Registry) {

            const dependencies =
                Registry.checkDependencies(
                    normalized
                );


            if (
                dependencies &&
                dependencies.valid === false
            ) {

                Runtime.warn(
                    "Fehlende App-Abhängigkeiten:",
                    normalized,
                    dependencies.missing
                );
            }
        }


        /*
         * Stop previous foreground app
         * only if explicitly requested.
         */

        if (
            options &&
            options.singleInstance
        ) {

            await Runtime.stopOthers(
                normalized
            );
        }


        if (
            typeof app.start ===
            "function"
        ) {

            await app.start(
                options || {}
            );
        }


        Runtime.runningApps.add(
            normalized
        );

        Runtime.activeAppId =
            normalized;


        Runtime.emit(
            "started",
            {
                appId:
                    normalized,

                app:
                    app,

                options:
                    options || {}
            }
        );


        return app;
    };


    /* =========================================================
       PAUSE
    ========================================================= */

    Runtime.pause = async function (
        id
    ) {

        const normalized =
            Runtime.normalizeId(id);

        const app =
            Runtime.resolve(
                normalized
            );

        if (!app) {
            return false;
        }


        if (
            typeof app.pause ===
            "function"
        ) {

            await app.pause();
        }


        Runtime.runningApps.delete(
            normalized
        );


        Runtime.emit(
            "paused",
            {
                appId:
                    normalized,

                app:
                    app
            }
        );


        return true;
    };


    /* =========================================================
       STOP
    ========================================================= */

    Runtime.stop = async function (
        id
    ) {

        const normalized =
            Runtime.normalizeId(id);

        const app =
            Runtime.resolve(
                normalized
            );

        if (!app) {
            return false;
        }


        if (
            typeof app.stop ===
            "function"
        ) {

            await app.stop();
        }


        Runtime.runningApps.delete(
            normalized
        );


        if (
            Runtime.activeAppId ===
            normalized
        ) {

            Runtime.activeAppId =
                null;
        }


        Runtime.emit(
            "stopped",
            {
                appId:
                    normalized,

                app:
                    app
            }
        );


        return true;
    };


    /* =========================================================
       STOP OTHER APPS
    ========================================================= */

    Runtime.stopOthers = async function (
        exceptId
    ) {

        const normalized =
            Runtime.normalizeId(
                exceptId
            );


        const running =
            Array.from(
                Runtime.runningApps
            );


        for (
            const appId of running
        ) {

            if (
                appId !== normalized
            ) {

                try {

                    await Runtime.stop(
                        appId
                    );

                } catch (error) {

                    Runtime.warn(
                        "App konnte nicht gestoppt werden:",
                        appId,
                        error
                    );
                }
            }
        }
    };


    /* =========================================================
       CLOSE
    ========================================================= */

    Runtime.close = async function (
        id
    ) {

        const normalized =
            Runtime.normalizeId(id);

        const app =
            Runtime.resolve(
                normalized
            );

        if (!app) {
            return false;
        }


        await Runtime.stop(
            normalized
        );


        if (
            typeof app.destroy ===
            "function"
        ) {

            await app.destroy();
        }


        Runtime.initializedApps.delete(
            normalized
        );

        Runtime.applications.delete(
            normalized
        );


        Runtime.emit(
            "closed",
            {
                appId:
                    normalized,

                app:
                    app
            }
        );


        return true;
    };


    /* =========================================================
       OPEN APP
    ========================================================= */

    Runtime.open = async function (
        id,
        options
    ) {

        const normalized =
            Runtime.normalizeId(id);


        /*
         * First try existing App Router.
         */

        const router =
            window.HalDoAppRouter ||
            null;


        if (
            router &&
            typeof router.open ===
            "function"
        ) {

            try {

                return await router.open(
                    normalized,
                    options || {}
                );

            } catch (error) {

                Runtime.warn(
                    "Router konnte App nicht öffnen.",
                    error
                );
            }
        }


        /*
         * Existing App Launcher.
         */

        const launcher =
            window.HalDoAppLauncher ||
            null;


        if (
            launcher &&
            typeof launcher.launch ===
            "function"
        ) {

            try {

                return await launcher.launch(
                    normalized,
                    options || {}
                );

            } catch (error) {

                Runtime.warn(
                    "Launcher konnte App nicht starten.",
                    error
                );
            }
        }


        /*
         * Direct Runtime start.
         */

        return Runtime.start(
            normalized,
            options || {}
        );
    };


    /* =========================================================
       APP TO APP COMMUNICATION
    ========================================================= */

    Runtime.send = function (
        sourceAppId,
        targetAppId,
        eventName,
        data
    ) {

        const source =
            Runtime.normalizeId(
                sourceAppId
            );

        const target =
            Runtime.normalizeId(
                targetAppId
            );


        const payload = {

            sourceAppId:
                source,

            targetAppId:
                target,

            eventName:
                eventName,

            data:
                data || {},

            timestamp:
                Date.now()
        };


        Runtime.emit(
            "app-message",
            payload
        );


        /*
         * Direct target event
         */

        const targetApp =
            Runtime.resolve(
                target
            );


        if (
            targetApp &&
            typeof targetApp.onMessage ===
            "function"
        ) {

            try {

                return targetApp.onMessage(
                    payload
                );

            } catch (error) {

                Runtime.error(
                    "App Message fehlgeschlagen:",
                    error
                );
            }
        }


        return true;
    };


    /* =========================================================
       CONTEXT
    ========================================================= */

    Runtime.createContext = function (
        appId
    ) {

        const runtime =
            Runtime;

        return {

            appId:
                appId,

            runtime:
                runtime,

            kernel:
                window.HalDoKernel ||
                null,

            os:
                HalDoOS,

            v20:
                V20,

            registry:
                Registry,

            storage:
                Runtime.getService(
                    "storage"
                ),

            language:
                Runtime.getService(
                    "language"
                ),

            ai:
                Runtime.getService(
                    "ai"
                ),

            voice:
                Runtime.getService(
                    "voice"
                ),

            notifications:
                Runtime.getService(
                    "notifications"
                ),

            windows:
                Runtime.getService(
                    "windowManager"
                )
        };
    };


    /* =========================================================
       SERVICE RESOLUTION
    ========================================================= */

    Runtime.getService = function (
        name
    ) {

        if (!name) {
            return null;
        }


        const services =
            V20.services ||
            {};


        if (
            services[name]
        ) {

            return services[name];
        }


        /*
         * Existing global modules
         */

        const aliases = {

            storage:
                [
                    "HalDoStorage",
                    "HalDoStorageManager"
                ],

            language:
                [
                    "HalDoLanguage",
                    "HalDoLanguageManager"
                ],

            ai:
                [
                    "HalDoAI",
                    "HalDoAICore"
                ],

            voice:
                [
                    "HalDoVoice"
                ],

            notifications:
                [
                    "HalDoNotifications"
                ],

            windowManager:
                [
                    "HalDoWindowManager"
                ]
        };


        const candidates =
            aliases[name] ||
            [];


        for (
            const globalName
            of candidates
        ) {

            if (
                window[globalName]
            ) {

                return window[
                    globalName
                ];
            }
        }


        return null;
    };


    /* =========================================================
       ACTIVE APP
    ========================================================= */

    Runtime.getActiveApp = function () {

        if (
            !Runtime.activeAppId
        ) {
            return null;
        }

        return Runtime.resolve(
            Runtime.activeAppId
        );
    };


    /* =========================================================
       STATUS
    ========================================================= */

    Runtime.getStatus = function () {

        return {

            name:
                Runtime.name,

            version:
                Runtime.version,

            ready:
                Runtime.ready,

            registeredApps:
                Runtime.applications.size,

            initializedApps:
                Runtime.initializedApps.size,

            runningApps:
                Runtime.runningApps.size,

            activeApp:
                Runtime.activeAppId,

            timestamp:
                Date.now()
        };
    };


    /* =========================================================
       INITIALIZE RUNTIME
    ========================================================= */

    Runtime.init = function () {

        if (Runtime.ready) {
            return Runtime;
        }


        Runtime.ready = true;


        Runtime.emit(
            "ready",
            Runtime.getStatus()
        );


        Runtime.log(
            "V20 Universal App Runtime bereit."
        );


        return Runtime;
    };


    /* =========================================================
       GLOBAL EXPORT
    ========================================================= */

    window.HalDoAppRuntime =
        Runtime;

    HalDoOS.appRuntime =
        Runtime;

    V20.appRuntime =
        Runtime;


    /* =========================================================
       START
    ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {
                Runtime.init();
            },
            {
                once: true
            }
        );

    } else {

        Runtime.init();
    }


})(window, document);