/*
 * HalDo AI OS 20
 * V20 App Runtime
 *
 * Zentrale Laufzeit für alle HalDo-Apps.
 *
 * Aufgaben:
 * - Apps registrieren
 * - Apps starten / stoppen
 * - App-Lebenszyklus verwalten
 * - App-Kontext bereitstellen
 * - Events verteilen
 * - Storage anbinden
 * - AI / Language / Voice anbinden
 * - Router / Window Manager anbinden
 * - UI mounten
 * - Fehler isolieren
 * - Kompatibilität mit vorhandenen HalDo-Systemen
 */

(function (window, document) {
    "use strict";

    const VERSION = "20.0.0";

    const STATES = Object.freeze({
        REGISTERED: "registered",
        READY: "ready",
        STARTING: "starting",
        RUNNING: "running",
        STOPPING: "stopping",
        STOPPED: "stopped",
        ERROR: "error"
    });

    const runtime = {

        version: VERSION,

        state: "created",

        initialized: false,

        apps: new Map(),

        instances: new Map(),

        containers: new Map(),

        listeners: new Map(),

        services: {},

        metrics: {
            registered: 0,
            started: 0,
            stopped: 0,
            errors: 0
        },

        config: {
            autoStart: true,
            destroyOnStop: false,
            isolateErrors: true,
            createContainers: true,
            enableEvents: true
        },

        /*
         * ---------------------------------------------------------
         * INIT
         * ---------------------------------------------------------
         */

        init(options = {}) {

            if (this.initialized) {
                return this;
            }

            this.config = Object.assign(
                {},
                this.config,
                options || {}
            );

            this.state = "initializing";

            this._discoverServices();

            this._installGlobalBridge();

            this.initialized = true;

            this.state = "ready";

            this.emit("runtime:ready", {
                runtime: this
            });

            return this;
        },

        /*
         * ---------------------------------------------------------
         * SERVICE DISCOVERY
         * ---------------------------------------------------------
         */

        _discoverServices() {

            this.services = {

                window: window,

                document: document,

                HalDoOS: window.HalDoOS || null,

                system:
                    window.HalDoSystem ||
                    (window.HalDoOS && window.HalDoOS.system) ||
                    null,

                kernel:
                    window.HalDoKernel ||
                    (window.HalDoOS && window.HalDoOS.kernel) ||
                    null,

                registry:
                    window.HalDoAppRegistry ||
                    (window.HalDoOS && window.HalDoOS.appRegistry) ||
                    null,

                manager:
                    window.HalDoAppManager ||
                    (window.HalDoOS && window.HalDoOS.appManager) ||
                    null,

                router:
                    window.HalDoAppRouter ||
                    (window.HalDoOS && window.HalDoOS.appRouter) ||
                    null,

                windowManager:
                    window.HalDoWindowManager ||
                    (window.HalDoOS && window.HalDoOS.windowManager) ||
                    null,

                storage:
                    window.HalDoStorageManager ||
                    window.HalDoStorage ||
                    (window.HalDoOS && window.HalDoOS.storage) ||
                    null,

                ai:
                    window.HalDoAI ||
                    window.HalDoAICore ||
                    window.HalDoAIEngine ||
                    null,

                language:
                    window.HalDoLanguageManager ||
                    window.HalDoLanguageSystem ||
                    null,

                voice:
                    window.HalDoVoice ||
                    window.HalDoAISpeech ||
                    window.HalDoAISpeechSystem ||
                    null,

                events:
                    window.HalDoAppEvents ||
                    window.HalDoEventBus ||
                    window.HalDoEvents ||
                    null,

                integration:
                    window.HalDoV20Integration ||
                    null,

                bridge:
                    window.HalDoV20ServiceBridge ||
                    null
            };
        },

        /*
         * ---------------------------------------------------------
         * GLOBAL BRIDGE
         * ---------------------------------------------------------
         */

        _installGlobalBridge() {

            window.HalDoAppRuntime = this;

            window.HalDoOS = window.HalDoOS || {};

            window.HalDoOS.appRuntime = this;

            /*
             * Compatibility aliases.
             */

            window.HalDoOS.runtime = this;

            window.HalDoOS.services =
                window.HalDoOS.services || {};

            Object.assign(
                window.HalDoOS.services,
                this.services
            );
        },

        /*
         * ---------------------------------------------------------
         * SERVICE REFRESH
         * ---------------------------------------------------------
         */

        refreshServices() {

            this._discoverServices();

            if (window.HalDoOS) {
                window.HalDoOS.services =
                    window.HalDoOS.services || {};

                Object.assign(
                    window.HalDoOS.services,
                    this.services
                );
            }

            return this.services;
        },

        /*
         * ---------------------------------------------------------
         * REGISTER
         * ---------------------------------------------------------
         */

        register(appDefinition) {

            if (!appDefinition) {
                throw new Error(
                    "HalDoAppRuntime: appDefinition fehlt."
                );
            }

            const definition =
                typeof appDefinition === "function"
                    ? appDefinition()
                    : appDefinition;

            if (!definition || typeof definition !== "object") {
                throw new Error(
                    "HalDoAppRuntime: ungültige App-Definition."
                );
            }

            const id = this._normalizeId(
                definition.id ||
                definition.appId ||
                definition.name
            );

            if (!id) {
                throw new Error(
                    "HalDoAppRuntime: App benötigt eine ID."
                );
            }

            const existing = this.apps.get(id);

            if (existing) {

                const merged = Object.assign(
                    {},
                    existing,
                    definition,
                    {
                        id
                    }
                );

                this.apps.set(id, merged);

                return merged;
            }

            const normalized = this._normalizeDefinition(
                definition,
                id
            );

            this.apps.set(id, normalized);

            this.metrics.registered++;

            this.emit("app:registered", {
                app: normalized
            });

            return normalized;
        },

        /*
         * ---------------------------------------------------------
         * REGISTER MANY
         * ---------------------------------------------------------
         */

        registerMany(apps) {

            if (!Array.isArray(apps)) {
                return [];
            }

            return apps
                .map(app => {

                    try {
                        return this.register(app);
                    } catch (error) {

                        this._reportError(
                            error,
                            {
                                operation: "registerMany"
                            }
                        );

                        return null;
                    }
                })
                .filter(Boolean);
        },

        /*
         * ---------------------------------------------------------
         * DEFINITION NORMALIZATION
         * ---------------------------------------------------------
         */

        _normalizeDefinition(definition, id) {

            return {

                id,

                name:
                    definition.name ||
                    id,

                title:
                    definition.title ||
                    definition.name ||
                    id,

                description:
                    definition.description ||
                    "",

                icon:
                    definition.icon ||
                    "",

                category:
                    definition.category ||
                    "system",

                version:
                    definition.version ||
                    VERSION,

                enabled:
                    definition.enabled !== false,

                singleton:
                    definition.singleton !== false,

                autoStart:
                    definition.autoStart === true,

                module:
                    definition.module ||
                    definition.modulePath ||
                    null,

                entry:
                    definition.entry ||
                    definition.entryPoint ||
                    null,

                permissions:
                    Array.isArray(definition.permissions)
                        ? definition.permissions.slice()
                        : [],

                dependencies:
                    Array.isArray(definition.dependencies)
                        ? definition.dependencies.slice()
                        : [],

                metadata:
                    Object.assign(
                        {},
                        definition.metadata || {}
                    ),

                state:
                    STATES.REGISTERED,

                factory:
                    typeof definition.factory === "function"
                        ? definition.factory
                        : null,

                create:
                    typeof definition.create === "function"
                        ? definition.create
                        : null,

                mount:
                    typeof definition.mount === "function"
                        ? definition.mount
                        : null,

                unmount:
                    typeof definition.unmount === "function"
                        ? definition.unmount
                        : null,

                start:
                    typeof definition.start === "function"
                        ? definition.start
                        : null,

                stop:
                    typeof definition.stop === "function"
                        ? definition.stop
                        : null,

                destroy:
                    typeof definition.destroy === "function"
                        ? definition.destroy
                        : null,

                render:
                    typeof definition.render === "function"
                        ? definition.render
                        : null,

                actions:
                    definition.actions || {},

                routes:
                    Array.isArray(definition.routes)
                        ? definition.routes.slice()
                        : [],

                original:
                    definition
            };
        },

        /*
         * ---------------------------------------------------------
         * GET APP
         * ---------------------------------------------------------
         */

        get(appId) {

            const id = this._normalizeId(appId);

            return this.apps.get(id) || null;
        },

        /*
         * ---------------------------------------------------------
         * GET INSTANCE
         * ---------------------------------------------------------
         */

        getInstance(appId) {

            const id = this._normalizeId(appId);

            return this.instances.get(id) || null;
        },

        /*
         * ---------------------------------------------------------
         * LIST
         * ---------------------------------------------------------
         */

        list() {

            return Array.from(
                this.apps.values()
            );
        },

        /*
         * ---------------------------------------------------------
         * RUNNING APPS
         * ---------------------------------------------------------
         */

        running() {

            return Array.from(
                this.instances.values()
            ).filter(
                instance =>
                    instance &&
                    instance.state === STATES.RUNNING
            );
        },

        /*
         * ---------------------------------------------------------
         * START APP
         * ---------------------------------------------------------
         */

        async start(appId, options = {}) {

            const id = this._normalizeId(appId);

            if (!id) {
                throw new Error(
                    "HalDoAppRuntime: ungültige App-ID."
                );
            }

            const definition = this.apps.get(id);

            if (!definition) {

                throw new Error(
                    `HalDoAppRuntime: App "${id}" wurde nicht registriert.`
                );
            }

            if (definition.enabled === false) {

                throw new Error(
                    `HalDoAppRuntime: App "${id}" ist deaktiviert.`
                );
            }

            const existing =
                this.instances.get(id);

            if (
                existing &&
                existing.state === STATES.RUNNING &&
                definition.singleton
            ) {

                this._focusInstance(existing);

                return existing;
            }

            /*
             * Dependencies
             */

            await this._resolveDependencies(
                definition,
                options
            );

            const instance =
                this._createInstance(
                    definition,
                    options
                );

            this.instances.set(
                id,
                instance
            );

            instance.state =
                STATES.STARTING;

            this.emit("app:starting", {
                app: definition,
                instance
            });

            try {

                /*
                 * create()
                 */

                if (definition.create) {

                    const result =
                        await definition.create(
                            instance.context
                        );

                    if (result !== undefined) {
                        instance.controller = result;
                    }
                }

                /*
                 * factory()
                 */

                if (
                    !instance.controller &&
                    definition.factory
                ) {

                    const result =
                        await definition.factory(
                            instance.context
                        );

                    if (result !== undefined) {
                        instance.controller = result;
                    }
                }

                /*
                 * Mount
                 */

                if (definition.mount) {

                    await definition.mount(
                        instance.context,
                        instance.controller
                    );
                }

                /*
                 * Render
                 */

                if (
                    definition.render &&
                    instance.container
                ) {

                    await definition.render(
                        instance.container,
                        instance.context,
                        instance.controller
                    );
                }

                /*
                 * Start
                 */

                if (definition.start) {

                    await definition.start(
                        instance.context,
                        instance.controller
                    );
                }

                instance.state =
                    STATES.RUNNING;

                definition.state =
                    STATES.RUNNING;

                instance.startedAt =
                    Date.now();

                this.metrics.started++;

                this.emit("app:started", {
                    app: definition,
                    instance
                });

                this._focusInstance(instance);

                return instance;

            } catch (error) {

                instance.state =
                    STATES.ERROR;

                definition.state =
                    STATES.ERROR;

                instance.error =
                    error;

                this.metrics.errors++;

                this.emit("app:error", {
                    app: definition,
                    instance,
                    error
                });

                this._reportError(
                    error,
                    {
                        operation: "start",
                        appId: id
                    }
                );

                /*
                 * Fehler nicht aus dem gesamten OS
                 * herauswerfen, wenn Isolation aktiv ist.
                 */

                if (this.config.isolateErrors) {
                    return instance;
                }

                throw error;
            }
        },

        /*
         * ---------------------------------------------------------
         * START MANY
         * ---------------------------------------------------------
         */

        async startMany(appIds, options = {}) {

            if (!Array.isArray(appIds)) {
                return [];
            }

            const result = [];

            for (const appId of appIds) {

                try {

                    const instance =
                        await this.start(
                            appId,
                            options
                        );

                    result.push(instance);

                } catch (error) {

                    this._reportError(
                        error,
                        {
                            operation: "startMany",
                            appId
                        }
                    );
                }
            }

            return result;
        },

        /*
         * ---------------------------------------------------------
         * STOP APP
         * ---------------------------------------------------------
         */

        async stop(appId, options = {}) {

            const id =
                this._normalizeId(appId);

            const instance =
                this.instances.get(id);

            if (!instance) {
                return false;
            }

            if (
                instance.state === STATES.STOPPED ||
                instance.state === STATES.STOPPING
            ) {
                return true;
            }

            const definition =
                this.apps.get(id);

            instance.state =
                STATES.STOPPING;

            this.emit("app:stopping", {
                app: definition,
                instance
            });

            try {

                if (
                    definition &&
                    definition.stop
                ) {

                    await definition.stop(
                        instance.context,
                        instance.controller
                    );
                }

                if (
                    definition &&
                    definition.unmount
                ) {

                    await definition.unmount(
                        instance.context,
                        instance.controller
                    );
                }

                instance.state =
                    STATES.STOPPED;

                if (definition) {
                    definition.state =
                        STATES.STOPPED;
                }

                this.metrics.stopped++;

                this.emit("app:stopped", {
                    app: definition,
                    instance
                });

                if (
                    this.config.destroyOnStop ||
                    options.destroy === true
                ) {

                    await this.destroy(id);
                }

                return true;

            } catch (error) {

                instance.state =
                    STATES.ERROR;

                instance.error =
                    error;

                this.metrics.errors++;

                this._reportError(
                    error,
                    {
                        operation: "stop",
                        appId: id
                    }
                );

                if (!this.config.isolateErrors) {
                    throw error;
                }

                return false;
            }
        },

        /*
         * ---------------------------------------------------------
         * DESTROY
         * ---------------------------------------------------------
         */

        async destroy(appId) {

            const id =
                this._normalizeId(appId);

            const instance =
                this.instances.get(id);

            const definition =
                this.apps.get(id);

            if (!instance) {
                return false;
            }

            try {

                if (
                    definition &&
                    definition.destroy
                ) {

                    await definition.destroy(
                        instance.context,
                        instance.controller
                    );
                }

            } catch (error) {

                this._reportError(
                    error,
                    {
                        operation: "destroy",
                        appId: id
                    }
                );
            }

            if (instance.container) {

                try {
                    instance.container.remove();
                } catch (_) {}
            }

            this.instances.delete(id);

            this.emit("app:destroyed", {
                app: definition,
                instance
            });

            return true;
        },

        /*
         * ---------------------------------------------------------
         * RESTART
         * ---------------------------------------------------------
         */

        async restart(appId, options = {}) {

            await this.stop(
                appId,
                {
                    destroy: true
                }
            );

            return this.start(
                appId,
                options
            );
        },

        /*
         * ---------------------------------------------------------
         * CREATE INSTANCE
         * ---------------------------------------------------------
         */

        _createInstance(definition, options) {

            const id =
                definition.id;

            const container =
                this._getOrCreateContainer(
                    definition,
                    options
                );

            const instance = {

                id,

                appId: id,

                definition,

                state: STATES.REGISTERED,

                controller: null,

                container,

                createdAt: Date.now(),

                startedAt: null,

                stoppedAt: null,

                error: null,

                data:
                    Object.assign(
                        {},
                        options.data || {}
                    ),

                context: null
            };

            instance.context =
                this._createContext(
                    instance
                );

            return instance;
        },

        /*
         * ---------------------------------------------------------
         * CONTEXT
         * ---------------------------------------------------------
         */

        _createContext(instance) {

            const runtime = this;

            return {

                app: instance.definition,

                instance,

                runtime,

                id: instance.id,

                container:
                    instance.container,

                state:
                    instance.data,

                services:
                    runtime.services,

                system:
                    runtime.services.system,

                kernel:
                    runtime.services.kernel,

                registry:
                    runtime.services.registry,

                manager:
                    runtime.services.manager,

                router:
                    runtime.services.router,

                windowManager:
                    runtime.services.windowManager,

                storage:
                    runtime.services.storage,

                ai:
                    runtime.services.ai,

                language:
                    runtime.services.language,

                voice:
                    runtime.services.voice,

                events:
                    runtime.services.events,

                integration:
                    runtime.services.integration,

                bridge:
                    runtime.services.bridge,

                emit(event, detail) {

                    return runtime.emit(
                        `app:${instance.id}:${event}`,
                        detail
                    );
                },

                on(event, handler) {

                    return runtime.on(
                        `app:${instance.id}:${event}`,
                        handler
                    );
                },

                off(event, handler) {

                    return runtime.off(
                        `app:${instance.id}:${event}`,
                        handler
                    );
                },

                start(appId, options) {

                    return runtime.start(
                        appId,
                        options
                    );
                },

                stop(appId, options) {

                    return runtime.stop(
                        appId,
                        options
                    );
                },

                restart(appId, options) {

                    return runtime.restart(
                        appId,
                        options
                    );
                },

                getApp(appId) {

                    return runtime.get(
                        appId
                    );
                },

                getInstance(appId) {

                    return runtime.getInstance(
                        appId
                    );
                },

                async save(key, value) {

                    return runtime.storageSet(
                        `${instance.id}:${key}`,
                        value
                    );
                },

                async load(key, fallback = null) {

                    const value =
                        await runtime.storageGet(
                            `${instance.id}:${key}`
                        );

                    return value === undefined ||
                           value === null
                        ? fallback
                        : value;
                },

                async remove(key) {

                    return runtime.storageRemove(
                        `${instance.id}:${key}`
                    );
                },

                navigate(path, params) {

                    return runtime.navigate(
                        path,
                        params
                    );
                },

                focus() {

                    return runtime._focusInstance(
                        instance
                    );
                }
            };
        },

        /*
         * ---------------------------------------------------------
         * CONTAINER
         * ---------------------------------------------------------
         */

        _getOrCreateContainer(
            definition,
            options
        ) {

            if (options.container instanceof HTMLElement) {
                this.containers.set(
                    definition.id,
                    options.container
                );

                return options.container;
            }

            if (!this.config.createContainers) {
                return null;
            }

            const existing =
                this.containers.get(
                    definition.id
                );

            if (existing) {
                return existing;
            }

            /*
             * Suche zuerst nach vorhandenen
             * HalDo-App-Containern.
             */

            const selectors = [
                `[data-app-id="${definition.id}"]`,
                `#app-${definition.id}`,
                `#${definition.id}-app`
            ];

            for (const selector of selectors) {

                try {

                    const found =
                        document.querySelector(
                            selector
                        );

                    if (found) {

                        this.containers.set(
                            definition.id,
                            found
                        );

                        return found;
                    }

                } catch (_) {}
            }

            /*
             * Fallback-Container.
             */

            const root =
                document.querySelector(
                    "#app-container"
                ) ||
                document.querySelector(
                    "#apps-container"
                ) ||
                document.querySelector(
                    "[data-haldo-app-container]"
                );

            if (!root) {
                return null;
            }

            const container =
                document.createElement("section");

            container.className =
                "haldo-app-runtime-container";

            container.dataset.appId =
                definition.id;

            container.dataset.appState =
                "created";

            container.hidden = true;

            container.setAttribute(
                "aria-label",
                definition.title
            );

            root.appendChild(
                container
            );

            this.containers.set(
                definition.id,
                container
            );

            return container;
        },

        /*
         * ---------------------------------------------------------
         * FOCUS
         * ---------------------------------------------------------
         */

        _focusInstance(instance) {

            if (!instance) {
                return;
            }

            if (instance.container) {

                instance.container.hidden =
                    false;

                instance.container.dataset.appState =
                    "running";
            }

            /*
             * Window Manager
             */

            const wm =
                this.services.windowManager;

            if (wm) {

                const methods = [
                    "focus",
                    "focusWindow",
                    "activate",
                    "bringToFront"
                ];

                for (const method of methods) {

                    if (
                        typeof wm[method] ===
                        "function"
                    ) {

                        try {

                            wm[method](
                                instance.id
                            );

                            break;

                        } catch (_) {}
                    }
                }
            }

            this.emit("app:focused", {
                app: instance.definition,
                instance
            });
        },

        /*
         * ---------------------------------------------------------
         * DEPENDENCIES
         * ---------------------------------------------------------
         */

        async _resolveDependencies(
            definition,
            options
        ) {

            const dependencies =
                definition.dependencies || [];

            for (const dependency of dependencies) {

                const id =
                    this._normalizeId(
                        typeof dependency === "string"
                            ? dependency
                            : dependency.id
                    );

                if (!id) {
                    continue;
                }

                if (!this.apps.has(id)) {
                    continue;
                }

                const instance =
                    this.instances.get(id);

                if (
                    !instance ||
                    instance.state !== STATES.RUNNING
                ) {

                    await this.start(
                        id,
                        options
                    );
                }
            }
        },

        /*
         * ---------------------------------------------------------
         * ROUTER
         * ---------------------------------------------------------
         */

        navigate(path, params = {}) {

            const router =
                this.services.router;

            if (!router) {

                this.emit(
                    "router:navigate",
                    {
                        path,
                        params
                    }
                );

                return false;
            }

            const methods = [
                "navigate",
                "go",
                "route",
                "open"
            ];

            for (const method of methods) {

                if (
                    typeof router[method] ===
                    "function"
                ) {

                    try {

                        return router[method](
                            path,
                            params
                        );

                    } catch (error) {

                        this._reportError(
                            error,
                            {
                                operation: "navigate",
                                path
                            }
                        );
                    }
                }
            }

            return false;
        },

        /*
         * ---------------------------------------------------------
         * STORAGE
         * ---------------------------------------------------------
         */

        async storageGet(key) {

            const storage =
                this.services.storage;

            if (storage) {

                const methods = [
                    "get",
                    "load",
                    "read",
                    "getItem"
                ];

                for (const method of methods) {

                    if (
                        typeof storage[method] ===
                        "function"
                    ) {

                        try {

                            return await storage[method](
                                key
                            );

                        } catch (_) {}
                    }
                }
            }

            try {

                const raw =
                    window.localStorage.getItem(
                        `haldo:${key}`
                    );

                if (raw === null) {
                    return null;
                }

                try {
                    return JSON.parse(raw);
                } catch (_) {
                    return raw;
                }

            } catch (_) {

                return null;
            }
        },

        async storageSet(key, value) {

            const storage =
                this.services.storage;

            if (storage) {

                const methods = [
                    "set",
                    "save",
                    "write",
                    "setItem"
                ];

                for (const method of methods) {

                    if (
                        typeof storage[method] ===
                        "function"
                    ) {

                        try {

                            return await storage[method](
                                key,
                                value
                            );

                        } catch (_) {}
                    }
                }
            }

            try {

                window.localStorage.setItem(
                    `haldo:${key}`,
                    JSON.stringify(value)
                );

                return true;

            } catch (_) {

                return false;
            }
        },

        async storageRemove(key) {

            const storage =
                this.services.storage;

            if (storage) {

                const methods = [
                    "remove",
                    "delete",
                    "removeItem"
                ];

                for (const method of methods) {

                    if (
                        typeof storage[method] ===
                        "function"
                    ) {

                        try {

                            return await storage[method](
                                key
                            );

                        } catch (_) {}
                    }
                }
            }

            try {

                window.localStorage.removeItem(
                    `haldo:${key}`
                );

                return true;

            } catch (_) {

                return false;
            }
        },

        /*
         * ---------------------------------------------------------
         * EVENTS
         * ---------------------------------------------------------
         */

        on(event, handler) {

            if (
                typeof handler !==
                "function"
            ) {
                return () => {};
            }

            if (!this.listeners.has(event)) {

                this.listeners.set(
                    event,
                    new Set()
                );
            }

            const listeners =
                this.listeners.get(event);

            listeners.add(handler);

            /*
             * Native EventTarget zusätzlich nutzen.
             */

            return () => {
                this.off(
                    event,
                    handler
                );
            };
        },

        off(event, handler) {

            const listeners =
                this.listeners.get(event);

            if (!listeners) {
                return;
            }

            listeners.delete(handler);

            if (listeners.size === 0) {
                this.listeners.delete(event);
            }
        },

        emit(event, detail = {}) {

            /*
             * Interner Event Bus
             */

            const listeners =
                this.listeners.get(event);

            if (listeners) {

                for (const handler of Array.from(listeners)) {

                    try {

                        handler(detail);

                    } catch (error) {

                        this._reportError(
                            error,
                            {
                                operation: "event",
                                event
                            }
                        );
                    }
                }
            }

            /*
             * window Event
             */

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        `haldo:${event}`,
                        {
                            detail
                        }
                    )
                );

            } catch (_) {}

            /*
             * Externen Event Bus informieren.
             */

            const bus =
                this.services.events;

            if (bus) {

                const methods = [
                    "emit",
                    "dispatch",
                    "publish",
                    "trigger"
                ];

                for (const method of methods) {

                    if (
                        typeof bus[method] ===
                        "function"
                    ) {

                        try {

                            bus[method](
                                event,
                                detail
                            );

                            break;

                        } catch (_) {}
                    }
                }
            }

            return true;
        },

        /*
         * ---------------------------------------------------------
         * APP ACTION
         * ---------------------------------------------------------
         */

        async action(
            appId,
            actionName,
            payload = {}
        ) {

            const definition =
                this.get(appId);

            if (!definition) {
                throw new Error(
                    `Unbekannte App: ${appId}`
                );
            }

            const action =
                definition.actions &&
                definition.actions[actionName];

            if (typeof action !== "function") {

                const instance =
                    this.getInstance(appId);

                if (
                    instance &&
                    instance.controller &&
                    typeof instance.controller[actionName] ===
                    "function"
                ) {

                    return instance.controller[
                        actionName
                    ](
                        payload,
                        instance.context
                    );
                }

                throw new Error(
                    `Aktion "${actionName}" existiert in "${appId}" nicht.`
                );
            }

            const instance =
                this.getInstance(appId);

            return action(
                payload,
                instance
                    ? instance.context
                    : this
            );
        },

        /*
         * ---------------------------------------------------------
         * AUTO START
         * ---------------------------------------------------------
         */

        async autoStart() {

            if (!this.initialized) {
                this.init();
            }

            const apps =
                this.list().filter(
                    app =>
                        app.enabled !== false &&
                        (
                            app.autoStart === true ||
                            this.config.autoStart &&
                            app.id === "haldo-home"
                        )
                );

            return this.startMany(
                apps.map(app => app.id)
            );
        },

        /*
         * ---------------------------------------------------------
         * IMPORT MANIFEST
         * ---------------------------------------------------------
         */

        importManifest(manifest) {

            if (!manifest) {
                return [];
            }

            let apps = [];

            if (Array.isArray(manifest)) {
                apps = manifest;
            } else if (
                Array.isArray(manifest.apps)
            ) {
                apps = manifest.apps;
            } else if (
                manifest.applications &&
                Array.isArray(
                    manifest.applications
                )
            ) {
                apps =
                    manifest.applications;
            }

            return this.registerMany(
                apps
            );
        },

        /*
         * ---------------------------------------------------------
         * STATUS
         * ---------------------------------------------------------
         */

        getStatus() {

            return {

                version:
                    this.version,

                state:
                    this.state,

                initialized:
                    this.initialized,

                registered:
                    this.apps.size,

                running:
                    this.running().length,

                instances:
                    this.instances.size,

                metrics:
                    Object.assign(
                        {},
                        this.metrics
                    ),

                services:
                    Object.keys(
                        this.services
                    ).reduce(
                        (result, key) => {

                            result[key] =
                                Boolean(
                                    this.services[key]
                                );

                            return result;

                        },
                        {}
                    )
            };
        },

        /*
         * ---------------------------------------------------------
         * ERROR
         * ---------------------------------------------------------
         */

        _reportError(error, context = {}) {

            const payload = {

                error,

                message:
                    error &&
                    error.message
                        ? error.message
                        : String(error),

                context,

                timestamp:
                    Date.now()
            };

            try {

                console.error(
                    "[HalDo AI OS 20 Runtime]",
                    payload.message,
                    context
                );

            } catch (_) {}

            this.emit(
                "runtime:error",
                payload
            );
        },

        /*
         * ---------------------------------------------------------
         * ID NORMALIZATION
         * ---------------------------------------------------------
         */

        _normalizeId(value) {

            if (
                value === null ||
                value === undefined
            ) {
                return "";
            }

            return String(value)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-");
        },

        /*
         * ---------------------------------------------------------
         * RESET
         * ---------------------------------------------------------
         */

        async reset() {

            const ids =
                Array.from(
                    this.instances.keys()
                );

            for (const id of ids) {

                try {
                    await this.destroy(id);
                } catch (_) {}
            }

            this.instances.clear();

            this.containers.clear();

            this.listeners.clear();

            this.state = "reset";

            this.emit(
                "runtime:reset"
            );

            return true;
        }
    };

    /*
     * =========================================================
     * GLOBAL API
     * =========================================================
     */

    window.HalDoAppRuntime = runtime;

    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.appRuntime =
        runtime;

    window.HalDoOS.runtime =
        runtime;

    /*
     * =========================================================
     * EARLY INIT
     * =========================================================
     */

    function bootRuntime() {

        try {

            runtime.init();

            /*
             * Bereits vorhandenes Manifest automatisch
             * übernehmen, falls es vor der Runtime geladen
             * wurde.
             */

            const manifest =
                window.HalDoAppManifest ||
                window.HalDoV20AppManifest ||
                window.HalDoAppManifestV20 ||
                null;

            if (manifest) {
                runtime.importManifest(
                    manifest
                );
            }

        } catch (error) {

            runtime._reportError(
                error,
                {
                    operation: "boot"
                }
            );
        }
    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            bootRuntime,
            {
                once: true
            }
        );

    } else {

        bootRuntime();
    }

    /*
     * =========================================================
     * EXTERNAL RUNTIME READY EVENT
     * =========================================================
     */

    window.addEventListener(
        "haldo:kernel:ready",
        function () {

            runtime.refreshServices();

            runtime.emit(
                "kernel:connected"
            );
        }
    );

    window.addEventListener(
        "haldo:system:ready",
        function () {

            runtime.refreshServices();

            runtime.emit(
                "system:connected"
            );
        }
    );

    /*
     * =========================================================
     * DEBUG API
     * =========================================================
     */

    window.HalDoRuntimeDebug = {

        status() {
            return runtime.getStatus();
        },

        apps() {
            return runtime.list();
        },

        running() {
            return runtime.running();
        },

        start(id, options) {
            return runtime.start(
                id,
                options
            );
        },

        stop(id, options) {
            return runtime.stop(
                id,
                options
            );
        },

        restart(id, options) {
            return runtime.restart(
                id,
                options
            );
        }
    };

})(window, document);