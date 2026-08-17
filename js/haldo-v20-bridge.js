/*
 * ============================================================
 * HalDo AI OS 20
 * V20 System Bridge
 * ============================================================
 *
 * Datei:
 *   js/haldo-v20-bridge.js
 *
 * Zweck:
 *   Zentrale, defensive Verbindungs- und Event-Schicht für V20.
 *
 * WICHTIG:
 *   Diese Datei ersetzt KEIN bestehendes System.
 *   Sie erkennt vorhandene HalDo-Systeme und verbindet sie,
 *   soweit deren APIs verfügbar sind.
 *
 * ============================================================
 */

(function (window, document) {
    "use strict";

    /* ---------------------------------------------------------
       GLOBAL OBJECTS
    --------------------------------------------------------- */

    const HalDoOS = window.HalDoOS = window.HalDoOS || {};

    const Bridge = {
        name: "haldo-v20-bridge",
        version: "20.0.0",
        ready: false,

        systems: {},
        apps: new Map(),
        listeners: new Map(),

        config: {
            debug: true,
            version: "20.0.0"
        }
    };


    /* ---------------------------------------------------------
       LOGGING
    --------------------------------------------------------- */

    Bridge.log = function () {
        if (!Bridge.config.debug) return;

        try {
            console.log(
                "%c[HalDo V20]",
                "font-weight:bold;",
                ...arguments
            );
        } catch (error) {
            // Silent fallback
        }
    };


    Bridge.warn = function () {
        try {
            console.warn(
                "%c[HalDo V20]",
                "font-weight:bold;",
                ...arguments
            );
        } catch (error) {
            // Silent fallback
        }
    };


    Bridge.error = function () {
        try {
            console.error(
                "%c[HalDo V20]",
                "font-weight:bold;",
                ...arguments
            );
        } catch (error) {
            // Silent fallback
        }
    };


    /* ---------------------------------------------------------
       SYSTEM DISCOVERY
    --------------------------------------------------------- */

    Bridge.discoverSystems = function () {

        const discovered = {};

        const candidates = {
            kernel: [
                window.HalDoKernel,
                HalDoOS.kernel
            ],

            system: [
                window.HalDoSystem,
                HalDoOS.system
            ],

            appManager: [
                window.HalDoAppManager,
                HalDoOS.appManager
            ],

            appRegistry: [
                window.HalDoAppRegistry,
                HalDoOS.appRegistry
            ],

            appRouter: [
                window.HalDoAppRouter,
                HalDoOS.appRouter
            ],

            launcher: [
                window.HalDoLauncher,
                HalDoOS.launcher
            ],

            windowManager: [
                window.HalDoWindowManager,
                HalDoOS.windowManager
            ],

            storage: [
                window.HalDoStorage,
                HalDoOS.storage
            ],

            storageManager: [
                window.HalDoStorageManager,
                HalDoOS.storageManager
            ],

            ai: [
                window.HalDoAI,
                HalDoOS.ai
            ],

            aiCore: [
                window.HalDoAICore,
                HalDoOS.aiCore
            ],

            voice: [
                window.HalDoVoice,
                HalDoOS.voice
            ],

            language: [
                window.HalDoLanguage,
                window.HalDoLanguageSystem,
                HalDoOS.language,
                HalDoOS.languageSystem
            ],

            notifications: [
                window.HalDoNotifications,
                HalDoOS.notifications
            ],

            settings: [
                window.HalDoSettings,
                HalDoOS.settings
            ],

            cosmic: [
                window.HalDoCosmic,
                window.HalDoCosmicEngine,
                HalDoOS.cosmic
            ],

            logo: [
                window.HalDoLogo,
                window.HalDoLogoEngine,
                HalDoOS.logo
            ]
        };

        Object.keys(candidates).forEach(function (name) {

            const list = candidates[name];

            for (let i = 0; i < list.length; i++) {

                if (list[i]) {
                    discovered[name] = list[i];
                    break;
                }
            }
        });

        Bridge.systems = discovered;

        Bridge.log(
            "System discovery complete:",
            Object.keys(discovered)
        );

        return discovered;
    };


    /* ---------------------------------------------------------
       GET SYSTEM
    --------------------------------------------------------- */

    Bridge.getSystem = function (name) {
        return Bridge.systems[name] || null;
    };


    /* ---------------------------------------------------------
       SAFE METHOD CALL
    --------------------------------------------------------- */

    Bridge.call = function (object, method) {

        if (!object) {
            return {
                success: false,
                value: null,
                error: "Object unavailable"
            };
        }

        if (typeof object[method] !== "function") {
            return {
                success: false,
                value: null,
                error: "Method unavailable: " + method
            };
        }

        try {

            const args = Array.prototype.slice.call(arguments, 2);

            return {
                success: true,
                value: object[method].apply(object, args),
                error: null
            };

        } catch (error) {

            Bridge.error(
                "Method failed:",
                method,
                error
            );

            return {
                success: false,
                value: null,
                error: error
            };
        }
    };


    /* ---------------------------------------------------------
       INTERNAL EVENT BUS
    --------------------------------------------------------- */

    Bridge.on = function (eventName, callback) {

        if (
            typeof eventName !== "string" ||
            typeof callback !== "function"
        ) {
            return function () {};
        }

        if (!Bridge.listeners.has(eventName)) {
            Bridge.listeners.set(eventName, new Set());
        }

        const listeners = Bridge.listeners.get(eventName);

        listeners.add(callback);

        return function () {
            listeners.delete(callback);
        };
    };


    Bridge.off = function (eventName, callback) {

        const listeners = Bridge.listeners.get(eventName);

        if (!listeners) return;

        listeners.delete(callback);
    };


    Bridge.emit = function (eventName, detail) {

        if (typeof eventName !== "string") {
            return;
        }

        const payload = {
            name: eventName,
            detail: detail || {},
            timestamp: Date.now(),
            source: "haldo-v20-bridge"
        };

        /* Internal listeners */

        const listeners = Bridge.listeners.get(eventName);

        if (listeners) {

            listeners.forEach(function (callback) {

                try {
                    callback(payload);
                } catch (error) {
                    Bridge.error(
                        "Event listener failed:",
                        eventName,
                        error
                    );
                }

            });
        }


        /* DOM event */

        try {

            document.dispatchEvent(
                new CustomEvent(
                    "haldo:" + eventName,
                    {
                        detail: payload
                    }
                )
            );

        } catch (error) {
            Bridge.warn(
                "DOM event failed:",
                eventName
            );
        }


        /* Existing Kernel Event Bus */

        const kernel = Bridge.systems.kernel;

        if (
            kernel &&
            typeof kernel.emit === "function"
        ) {

            try {
                kernel.emit(
                    "v20:" + eventName,
                    payload.detail
                );
            } catch (error) {
                Bridge.warn(
                    "Kernel event forwarding failed:",
                    eventName
                );
            }
        }
    };


    /* ---------------------------------------------------------
       APP REGISTRATION
    --------------------------------------------------------- */

    Bridge.registerApp = function (definition) {

        if (!definition) {
            throw new Error(
                "HalDo V20: App definition is required."
            );
        }

        const id = String(
            definition.id ||
            definition.appId ||
            definition.name ||
            ""
        ).trim();

        if (!id) {
            throw new Error(
                "HalDo V20: App requires an id."
            );
        }

        const app = Object.assign(
            {
                id: id,
                name: id,
                version: "20.0.0",
                enabled: true,
                state: "registered",
                createdAt: Date.now()
            },
            definition
        );

        Bridge.apps.set(id, app);

        /* Existing App Registry */

        const registry = Bridge.systems.appRegistry;

        if (registry) {

            const methods = [
                "register",
                "registerApp",
                "add"
            ];

            for (let i = 0; i < methods.length; i++) {

                const method = methods[i];

                if (
                    typeof registry[method] === "function"
                ) {

                    try {

                        registry[method](app);

                        break;

                    } catch (error) {

                        Bridge.warn(
                            "Registry registration failed:",
                            id,
                            method
                        );
                    }
                }
            }
        }

        Bridge.emit(
            "app:registered",
            {
                app: app
            }
        );

        return app;
    };


    /* ---------------------------------------------------------
       APP GET
    --------------------------------------------------------- */

    Bridge.getApp = function (id) {
        return Bridge.apps.get(String(id)) || null;
    };


    Bridge.getApps = function () {
        return Array.from(
            Bridge.apps.values()
        );
    };


    /* ---------------------------------------------------------
       APP OPEN
    --------------------------------------------------------- */

    Bridge.openApp = function (id, options) {

        id = String(id);

        const app = Bridge.getApp(id);

        Bridge.emit(
            "app:before-open",
            {
                id: id,
                app: app,
                options: options || {}
            }
        );

        const manager = Bridge.systems.appManager;

        if (manager) {

            const methods = [
                "openApp",
                "launchApp",
                "open",
                "launch"
            ];

            for (let i = 0; i < methods.length; i++) {

                const method = methods[i];

                if (
                    typeof manager[method] === "function"
                ) {

                    try {

                        const result =
                            manager[method](
                                id,
                                options || {}
                            );

                        if (app) {
                            app.state = "open";
                        }

                        Bridge.emit(
                            "app:opened",
                            {
                                id: id,
                                result: result
                            }
                        );

                        return result;

                    } catch (error) {

                        Bridge.error(
                            "App Manager failed:",
                            id,
                            error
                        );
                    }
                }
            }
        }


        /* Router fallback */

        const router = Bridge.systems.appRouter;

        if (router) {

            const methods = [
                "navigateToApp",
                "openApp",
                "navigate",
                "route"
            ];

            for (let i = 0; i < methods.length; i++) {

                const method = methods[i];

                if (
                    typeof router[method] === "function"
                ) {

                    try {

                        const result =
                            router[method](
                                id,
                                options || {}
                            );

                        Bridge.emit(
                            "app:opened",
                            {
                                id: id,
                                result: result
                            }
                        );

                        return result;

                    } catch (error) {

                        Bridge.warn(
                            "Router fallback failed:",
                            id
                        );
                    }
                }
            }
        }


        /* DOM fallback */

        document.dispatchEvent(
            new CustomEvent(
                "haldo:app-open-request",
                {
                    detail: {
                        id: id,
                        options: options || {}
                    }
                }
            )
        );

        return null;
    };


    /* ---------------------------------------------------------
       APP CLOSE
    --------------------------------------------------------- */

    Bridge.closeApp = function (id) {

        id = String(id);

        const app = Bridge.getApp(id);

        const manager = Bridge.systems.appManager;

        if (manager) {

            const methods = [
                "closeApp",
                "close",
                "stopApp"
            ];

            for (let i = 0; i < methods.length; i++) {

                const method = methods[i];

                if (
                    typeof manager[method] === "function"
                ) {

                    try {

                        const result =
                            manager[method](id);

                        if (app) {
                            app.state = "closed";
                        }

                        Bridge.emit(
                            "app:closed",
                            {
                                id: id
                            }
                        );

                        return result;

                    } catch (error) {

                        Bridge.warn(
                            "App close failed:",
                            id
                        );
                    }
                }
            }
        }

        return null;
    };


    /* ---------------------------------------------------------
       STORAGE BRIDGE
    --------------------------------------------------------- */

    Bridge.storage = {

        get: function (key, fallback) {

            const storage =
                Bridge.systems.storage ||
                Bridge.systems.storageManager;

            if (storage) {

                const methods = [
                    "get",
                    "getItem",
                    "read"
                ];

                for (let i = 0; i < methods.length; i++) {

                    const method = methods[i];

                    if (
                        typeof storage[method] === "function"
                    ) {

                        try {

                            const value =
                                storage[method](key);

                            return value === undefined ||
                                value === null
                                ? fallback
                                : value;

                        } catch (error) {
                            // Continue
                        }
                    }
                }
            }


            try {

                const raw =
                    window.localStorage.getItem(key);

                return raw === null
                    ? fallback
                    : JSON.parse(raw);

            } catch (error) {

                return fallback;
            }
        },


        set: function (key, value) {

            const storage =
                Bridge.systems.storage ||
                Bridge.systems.storageManager;

            if (storage) {

                const methods = [
                    "set",
                    "setItem",
                    "write",
                    "save"
                ];

                for (let i = 0; i < methods.length; i++) {

                    const method = methods[i];

                    if (
                        typeof storage[method] === "function"
                    ) {

                        try {

                            storage[method](
                                key,
                                value
                            );

                            return true;

                        } catch (error) {
                            // Continue
                        }
                    }
                }
            }


            try {

                window.localStorage.setItem(
                    key,
                    JSON.stringify(value)
                );

                return true;

            } catch (error) {

                Bridge.warn(
                    "Storage fallback failed:",
                    key
                );

                return false;
            }
        }
    };


    /* ---------------------------------------------------------
       LANGUAGE BRIDGE
    --------------------------------------------------------- */

    Bridge.language = {

        get: function () {

            const language =
                Bridge.systems.language;

            if (!language) {
                return (
                    document.documentElement.lang ||
                    "de"
                );
            }

            const methods = [
                "getCurrentLanguage",
                "getLanguage",
                "currentLanguage"
            ];

            for (let i = 0; i < methods.length; i++) {

                const method = methods[i];

                if (
                    typeof language[method] === "function"
                ) {

                    try {
                        return language[method]();
                    } catch (error) {
                        // Continue
                    }
                }
            }

            return "de";
        },


        set: function (languageCode) {

            if (!languageCode) return false;

            const language =
                Bridge.systems.language;

            if (language) {

                const methods = [
                    "setLanguage",
                    "changeLanguage",
                    "switchLanguage"
                ];

                for (let i = 0; i < methods.length; i++) {

                    const method = methods[i];

                    if (
                        typeof language[method] === "function"
                    ) {

                        try {

                            language[method](
                                languageCode
                            );

                            Bridge.emit(
                                "language:changed",
                                {
                                    language:
                                        languageCode
                                }
                            );

                            return true;

                        } catch (error) {
                            // Continue
                        }
                    }
                }
            }

            document.documentElement.lang =
                languageCode;

            Bridge.storage.set(
                "haldo.language",
                languageCode
            );

            Bridge.emit(
                "language:changed",
                {
                    language: languageCode
                }
            );

            return true;
        }
    };


    /* ---------------------------------------------------------
       NOTIFICATION BRIDGE
    --------------------------------------------------------- */

    Bridge.notify = function (
        title,
        message,
        options
    ) {

        const notifications =
            Bridge.systems.notifications;

        if (notifications) {

            const methods = [
                "notify",
                "show",
                "add",
                "create"
            ];

            for (let i = 0; i < methods.length; i++) {

                const method = methods[i];

                if (
                    typeof notifications[method] === "function"
                ) {

                    try {

                        return notifications[method](
                            title,
                            message,
                            options || {}
                        );

                    } catch (error) {
                        // Continue
                    }
                }
            }
        }


        Bridge.emit(
            "notification",
            {
                title: title,
                message: message,
                options: options || {}
            }
        );

        return null;
    };


    /* ---------------------------------------------------------
       SYSTEM STATUS
    --------------------------------------------------------- */

    Bridge.status = function () {

        return {
            name: Bridge.name,
            version: Bridge.version,
            ready: Bridge.ready,
            systems: Object.keys(
                Bridge.systems
            ),
            apps: Bridge.apps.size,
            language: Bridge.language.get(),
            timestamp: Date.now()
        };
    };


    /* ---------------------------------------------------------
       INITIALIZATION
    --------------------------------------------------------- */

    Bridge.init = function () {

        if (Bridge.ready) {
            return Bridge;
        }

        Bridge.log(
            "Initializing HalDo AI OS 20 Bridge..."
        );

        Bridge.discoverSystems();


        /* Restore saved language */

        const savedLanguage =
            Bridge.storage.get(
                "haldo.language",
                null
            );

        if (savedLanguage) {

            try {
                document.documentElement.lang =
                    savedLanguage;
            } catch (error) {
                // Ignore
            }
        }


        Bridge.ready = true;


        Bridge.emit(
            "v20:ready",
            Bridge.status()
        );


        Bridge.log(
            "HalDo AI OS 20 Bridge ready."
        );

        return Bridge;
    };


    /* ---------------------------------------------------------
       GLOBAL API
    --------------------------------------------------------- */

    window.HalDoV20 = Bridge;
    HalDoOS.v20 = Bridge;


    /* ---------------------------------------------------------
       DOM READY
    --------------------------------------------------------- */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {
                Bridge.init();
            },
            {
                once: true
            }
        );

    } else {

        Bridge.init();
    }


    /* ---------------------------------------------------------
       GLOBAL ERROR BRIDGE
    --------------------------------------------------------- */

    window.addEventListener(
        "error",
        function (event) {

            Bridge.emit(
                "system:error",
                {
                    message:
                        event.message ||
                        "Unknown error",

                    filename:
                        event.filename ||
                        null,

                    line:
                        event.lineno ||
                        null,

                    column:
                        event.colno ||
                        null
                }
            );
        }
    );


    window.addEventListener(
        "unhandledrejection",
        function (event) {

            Bridge.emit(
                "system:unhandled-rejection",
                {
                    reason:
                        event.reason ||
                        "Unknown rejection"
                }
            );
        }
    );


})(window, document);