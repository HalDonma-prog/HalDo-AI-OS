/* ============================================================
   HalDo AI OS 20
   HALDO APP PLATFORM
   Version 20.0.0
   ------------------------------------------------------------
   Zentrale App-Laufzeit für alle HalDo Apps.
   ============================================================ */

(function (window, document) {
    "use strict";

    const VERSION = "20.0.0";

    const STATES = Object.freeze({
        REGISTERED: "registered",
        AVAILABLE: "available",
        OPENING: "opening",
        READY: "ready",
        ACTIVE: "active",
        SUSPENDED: "suspended",
        CLOSING: "closing",
        CLOSED: "closed",
        ERROR: "error"
    });

    class HalDoAppPlatform {

        constructor() {
            this.version = VERSION;

            this.apps = new Map();
            this.instances = new Map();
            this.windows = new Map();

            this.state = "idle";
            this.initialized = false;

            this.events = new Map();

            this.services = {
                registry: null,
                manager: null,
                router: null,
                windowManager: null,
                storage: null,
                memory: null,
                ai: null,
                voice: null,
                speech: null,
                language: null,
                cosmic: null,
                notifications: null
            };
        }

        /* ========================================================
           INITIALIZATION
           ======================================================== */

        init() {
            if (this.initialized) {
                return this;
            }

            this.connectExistingSystems();

            this.initialized = true;
            this.state = "ready";

            this.emit("platform:ready", {
                version: this.version
            });

            return this;
        }

        /* ========================================================
           EXISTING HALDO SYSTEMS
           ======================================================== */

        connectExistingSystems() {

            this.services.registry =
                window.HalDoAppRegistry ||
                window.HalDoAppRegistrySystem ||
                null;

            this.services.manager =
                window.HalDoAppManager ||
                window.HalDoAppManagerSystem ||
                null;

            this.services.router =
                window.HalDoAppRouter ||
                window.HalDoRouter ||
                null;

            this.services.windowManager =
                window.HalDoWindowManager ||
                window.HalDoWindow ||
                null;

            this.services.storage =
                window.HalDoStorage ||
                window.HalDoStorageManager ||
                null;

            this.services.memory =
                window.HalDoMemory ||
                window.HalDoAIMemory ||
                null;

            this.services.ai =
                window.HalDoAI ||
                window.HalDoAICore ||
                null;

            this.services.voice =
                window.HalDoVoice ||
                window.HalDoAIVoice ||
                null;

            this.services.speech =
                window.HalDoSpeech ||
                window.HalDoAISpeech ||
                null;

            this.services.language =
                window.HalDoLanguage ||
                window.HalDoLanguageSystem ||
                null;

            this.services.cosmic =
                window.HalDoCosmic ||
                window.HalDoCosmicEngine ||
                null;

            this.services.notifications =
                window.HalDoNotifications ||
                null;
        }

        /* ========================================================
           APP REGISTRATION
           ======================================================== */

        registerApp(definition) {

            if (!definition ||
                typeof definition !== "object") {
                throw new Error(
                    "[HalDo App Platform] Ungültige App-Definition."
                );
            }

            const id =
                String(
                    definition.id ||
                    definition.appId ||
                    ""
                ).trim();

            if (!id) {
                throw new Error(
                    "[HalDo App Platform] Jede App benötigt eine ID."
                );
            }

            const existing = this.apps.get(id);

            if (existing) {
                const merged = {
                    ...existing,
                    ...definition,
                    id
                };

                this.apps.set(id, merged);

                this.emit("app:updated", merged);

                return merged;
            }

            const app = {
                id,
                name: definition.name || id,
                version: definition.version || "1.0.0",

                icon: definition.icon || null,
                category: definition.category || "system",

                description:
                    definition.description || "",

                permissions:
                    Array.isArray(definition.permissions)
                        ? [...definition.permissions]
                        : [],

                settings:
                    definition.settings || {},

                metadata:
                    definition.metadata || {},

                factory:
                    typeof definition.factory === "function"
                        ? definition.factory
                        : null,

                lifecycle:
                    definition.lifecycle || {},

                state: STATES.REGISTERED,

                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            this.apps.set(id, app);

            app.state = STATES.AVAILABLE;

            this.emit("app:registered", app);

            return app;
        }

        unregisterApp(appId) {

            const id = this.normalizeId(appId);

            if (!id) {
                return false;
            }

            if (this.instances.has(id)) {
                this.closeApp(id);
            }

            const removed =
                this.apps.delete(id);

            if (removed) {
                this.emit("app:unregistered", {
                    id
                });
            }

            return removed;
        }

        /* ========================================================
           APP OPEN
           ======================================================== */

        async openApp(appId, options = {}) {

            const id = this.normalizeId(appId);

            if (!id) {
                throw new Error(
                    "[HalDo App Platform] Keine App-ID."
                );
            }

            const app = this.apps.get(id);

            if (!app) {
                throw new Error(
                    `[HalDo App Platform] App "${id}" ist nicht registriert.`
                );
            }

            const existing =
                this.instances.get(id);

            if (existing &&
                existing.state !== STATES.CLOSED &&
                existing.state !== STATES.ERROR) {

                this.activateInstance(existing);

                return existing;
            }

            app.state = STATES.OPENING;

            this.emit("app:opening", {
                app,
                options
            });

            await this.playCosmicWelcome(
                "app",
                app
            );

            let instance;

            try {
                instance =
                    await this.createInstance(
                        app,
                        options
                    );

                this.instances.set(
                    id,
                    instance
                );

                app.state = STATES.READY;

                await this.runLifecycle(
                    instance,
                    "onOpen",
                    options
                );

                this.activateInstance(
                    instance
                );

                app.state = STATES.ACTIVE;

                this.emit("app:opened", {
                    app,
                    instance
                });

                return instance;

            } catch (error) {

                app.state = STATES.ERROR;

                this.emit("app:error", {
                    app,
                    error
                });

                console.error(
                    `[HalDo App Platform] Fehler beim Öffnen von ${id}:`,
                    error
                );

                throw error;
            }
        }

        /* ========================================================
           INSTANCE CREATION
           ======================================================== */

        async createInstance(app, options) {

            let api = {};

            if (app.factory) {
                api =
                    await app.factory({
                        app,
                        options,
                        platform: this,
                        services: this.services
                    }) || {};
            }

            const instance = {

                id: app.id,

                app,

                state: STATES.READY,

                api,

                options,

                openedAt: Date.now(),

                windowId: null
            };

            if (this.services.windowManager) {

                try {

                    if (typeof this.services.windowManager.open === "function") {

                        instance.windowId =
                            await this.services.windowManager.open(
                                app.id,
                                {
                                    title: app.name,
                                    icon: app.icon,
                                    ...options
                                }
                            );
                    }

                } catch (error) {

                    console.warn(
                        "[HalDo App Platform] Window Manager konnte nicht verbunden werden.",
                        error
                    );
                }
            }

            return instance;
        }

        /* ========================================================
           ACTIVATE
           ======================================================== */

        activateInstance(instance) {

            if (!instance) {
                return;
            }

            instance.state =
                STATES.ACTIVE;

            this.emit("app:active", {
                app: instance.app,
                instance
            });
        }

        /* ========================================================
           CLOSE
           ======================================================== */

        async closeApp(appId) {

            const id =
                this.normalizeId(appId);

            const instance =
                this.instances.get(id);

            if (!instance) {
                return false;
            }

            instance.state =
                STATES.CLOSING;

            instance.app.state =
                STATES.CLOSING;

            this.emit("app:closing", {
                app: instance.app,
                instance
            });

            try {

                await this.runLifecycle(
                    instance,
                    "onClose"
                );

            } catch (error) {

                console.warn(
                    `[HalDo App Platform] onClose Fehler bei ${id}:`,
                    error
                );
            }

            if (
                instance.windowId &&
                this.services.windowManager
            ) {

                try {

                    if (
                        typeof this.services.windowManager.close ===
                        "function"
                    ) {
                        await this.services.windowManager.close(
                            instance.windowId
                        );
                    }

                } catch (error) {

                    console.warn(
                        "[HalDo App Platform] Window konnte nicht geschlossen werden.",
                        error
                    );
                }
            }

            instance.state =
                STATES.CLOSED;

            instance.app.state =
                STATES.CLOSED;

            this.instances.delete(id);

            this.emit("app:closed", {
                app: instance.app,
                instance
            });

            return true;
        }

        /* ========================================================
           SUSPEND / RESUME
           ======================================================== */

        suspendApp(appId) {

            const id =
                this.normalizeId(appId);

            const instance =
                this.instances.get(id);

            if (!instance) {
                return false;
            }

            instance.state =
                STATES.SUSPENDED;

            instance.app.state =
                STATES.SUSPENDED;

            this.runLifecycle(
                instance,
                "onSuspend"
            );

            this.emit("app:suspended", {
                app: instance.app,
                instance
            });

            return true;
        }

        resumeApp(appId) {

            const id =
                this.normalizeId(appId);

            const instance =
                this.instances.get(id);

            if (!instance) {
                return false;
            }

            instance.state =
                STATES.ACTIVE;

            instance.app.state =
                STATES.ACTIVE;

            this.runLifecycle(
                instance,
                "onResume"
            );

            this.emit("app:resumed", {
                app: instance.app,
                instance
            });

            return true;
        }

        /* ========================================================
           LIFECYCLE
           ======================================================== */

        async runLifecycle(
            instance,
            method,
            ...args
        ) {

            const lifecycle =
                instance.app.lifecycle || {};

            const handler =
                lifecycle[method];

            if (typeof handler === "function") {
                return await handler(
                    instance,
                    ...args
                );
            }

            if (
                instance.api &&
                typeof instance.api[method] ===
                "function"
            ) {
                return await instance.api[method](
                    ...args
                );
            }

            return undefined;
        }

        /* ========================================================
           COSMIC WELCOME
           ======================================================== */

        async playCosmicWelcome(
            type,
            app
        ) {

            const cosmic =
                this.services.cosmic;

            if (!cosmic) {
                return;
            }

            try {

                if (
                    typeof cosmic.emit ===
                    "function"
                ) {

                    cosmic.emit(
                        "cosmic:app-welcome",
                        {
                            type,
                            appId: app.id,
                            appName: app.name
                        }
                    );
                }

            } catch (error) {

                console.warn(
                    "[HalDo App Platform] Cosmic Welcome konnte nicht ausgelöst werden.",
                    error
                );
            }
        }

        /* ========================================================
           SERVICE ACCESS
           ======================================================== */

        getService(name) {
            return this.services[name] || null;
        }

        getApp(appId) {
            return this.apps.get(
                this.normalizeId(appId)
            ) || null;
        }

        getInstance(appId) {
            return this.instances.get(
                this.normalizeId(appId)
            ) || null;
        }

        getApps() {
            return Array.from(
                this.apps.values()
            );
        }

        getRunningApps() {
            return Array.from(
                this.instances.values()
            );
        }

        /* ========================================================
           EVENTS
           ======================================================== */

        on(eventName, callback) {

            if (
                typeof callback !==
                "function"
            ) {
                return this;
            }

            if (!this.events.has(eventName)) {
                this.events.set(
                    eventName,
                    new Set()
                );
            }

            this.events
                .get(eventName)
                .add(callback);

            return this;
        }

        off(eventName, callback) {

            const listeners =
                this.events.get(eventName);

            if (!listeners) {
                return this;
            }

            listeners.delete(callback);

            if (listeners.size === 0) {
                this.events.delete(
                    eventName
                );
            }

            return this;
        }

        emit(eventName, detail = {}) {

            const listeners =
                this.events.get(eventName);

            if (listeners) {

                listeners.forEach(
                    callback => {

                        try {
                            callback(detail);
                        } catch (error) {

                            console.error(
                                `[HalDo App Platform] Event-Fehler: ${eventName}`,
                                error
                            );
                        }
                    }
                );
            }

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        `haldo:${eventName}`,
                        {
                            detail
                        }
                    )
                );

            } catch (error) {
                console.warn(
                    "[HalDo App Platform] Browser Event konnte nicht erstellt werden.",
                    error
                );
            }

            return this;
        }

        /* ========================================================
           UTILITIES
           ======================================================== */

        normalizeId(appId) {

            if (
                typeof appId !== "string" &&
                typeof appId !== "number"
            ) {
                return null;
            }

            return String(appId)
                .trim()
                .toLowerCase();
        }

        getStatus() {

            return {
                version: this.version,
                initialized: this.initialized,
                state: this.state,
                registeredApps:
                    this.apps.size,
                runningApps:
                    this.instances.size,
                connectedServices:
                    Object.keys(this.services)
                        .filter(
                            key => Boolean(
                                this.services[key]
                            )
                        )
            };
        }
    }

    /* ============================================================
       GLOBAL API
       ============================================================ */

    if (!window.HalDoAppPlatform) {

        window.HalDoAppPlatform =
            new HalDoAppPlatform();
    }

    if (!window.HalDoAppPlatform.initialized) {

        const initialize = () => {

            try {

                window.HalDoAppPlatform.init();

            } catch (error) {

                console.error(
                    "[HalDo App Platform] Initialisierung fehlgeschlagen:",
                    error
                );
            }
        };

        if (
            document.readyState ===
            "loading"
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                initialize,
                { once: true }
            );

        } else {

            initialize();
        }
    }

})(window, document);