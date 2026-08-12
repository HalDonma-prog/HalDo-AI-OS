/* ============================================================
   HALDO AI OS 18
   APP FOUNDATION
   ------------------------------------------------------------
   Zentrale, nicht-invasive Grundlage für das App-System.
   Bestehende App-Dateien werden NICHT ersetzt.
   ============================================================ */

(function (window) {
    "use strict";

    window.HalDoOS = window.HalDoOS || {};

    const Foundation = {

        version: "18.0.0",

        initialized: false,

        apps: new Map(),

        running: new Map(),

        events: new Map(),

        /* ----------------------------------------------------
           EVENTS
        ---------------------------------------------------- */

        on(eventName, callback) {
            if (typeof callback !== "function") return () => {};

            if (!this.events.has(eventName)) {
                this.events.set(eventName, new Set());
            }

            this.events.get(eventName).add(callback);

            return () => this.off(eventName, callback);
        },

        off(eventName, callback) {
            const listeners = this.events.get(eventName);

            if (!listeners) return;

            listeners.delete(callback);

            if (listeners.size === 0) {
                this.events.delete(eventName);
            }
        },

        emit(eventName, payload = {}) {
            const listeners = this.events.get(eventName);

            if (!listeners) return;

            for (const callback of listeners) {
                try {
                    callback(payload);
                } catch (error) {
                    console.error(
                        "[HalDo App Foundation] Event error:",
                        error
                    );
                }
            }
        },

        /* ----------------------------------------------------
           APP REGISTRATION
        ---------------------------------------------------- */

        register(app) {
            if (!app || typeof app !== "object") {
                throw new TypeError(
                    "HalDo App Foundation: invalid app definition."
                );
            }

            if (!app.id) {
                throw new Error(
                    "HalDo App Foundation: app.id is required."
                );
            }

            if (this.apps.has(app.id)) {
                console.warn(
                    `[HalDo App Foundation] App already registered: ${app.id}`
                );

                return this.apps.get(app.id);
            }

            const normalizedApp = {
                id: String(app.id),
                name: app.name || app.id,
                version: app.version || "18.0.0",
                category: app.category || "system",
                icon: app.icon || null,
                description: app.description || "",
                enabled: app.enabled !== false,
                state: "registered",
                metadata: app.metadata || {},
                instance: null
            };

            this.apps.set(normalizedApp.id, normalizedApp);

            this.emit("app:registered", {
                app: normalizedApp
            });

            return normalizedApp;
        },

        unregister(appId) {
            const id = String(appId);

            if (this.running.has(id)) {
                this.close(id);
            }

            const app = this.apps.get(id);

            if (!app) return false;

            this.apps.delete(id);

            this.emit("app:unregistered", {
                app
            });

            return true;
        },

        get(appId) {
            return this.apps.get(String(appId)) || null;
        },

        getAll() {
            return Array.from(this.apps.values());
        },

        /* ----------------------------------------------------
           APP STATE
        ---------------------------------------------------- */

        isRunning(appId) {
            return this.running.has(String(appId));
        },

        getRunning() {
            return Array.from(this.running.values());
        },

        /* ----------------------------------------------------
           OPEN
        ---------------------------------------------------- */

        async open(appId, context = {}) {

            const id = String(appId);
            const app = this.get(id);

            if (!app) {
                const error = new Error(
                    `APP_NOT_FOUND: ${id}`
                );

                this.emit("app:error", {
                    appId: id,
                    error
                });

                throw error;
            }

            if (!app.enabled) {
                const error = new Error(
                    `APP_DISABLED: ${id}`
                );

                this.emit("app:error", {
                    appId: id,
                    error
                });

                throw error;
            }

            if (this.running.has(id)) {
                const existing = this.running.get(id);

                this.emit("app:focused", {
                    app: existing
                });

                return existing;
            }

            app.state = "starting";

            this.emit("app:starting", {
                app,
                context
            });

            try {

                let instance = null;

                if (typeof app.create === "function") {
                    instance = await app.create(context);
                }

                app.instance = instance;
                app.state = "running";

                this.running.set(id, app);

                this.emit("app:opened", {
                    app,
                    context
                });

                return app;

            } catch (error) {

                app.state = "error";

                this.emit("app:error", {
                    app,
                    error
                });

                throw error;
            }
        },

        /* ----------------------------------------------------
           CLOSE
        ---------------------------------------------------- */

        async close(appId) {

            const id = String(appId);
            const app = this.running.get(id);

            if (!app) return false;

            try {

                if (
                    app.instance &&
                    typeof app.instance.destroy === "function"
                ) {
                    await app.instance.destroy();
                }

            } catch (error) {

                console.error(
                    `[HalDo App Foundation] Close error: ${id}`,
                    error
                );
            }

            app.instance = null;
            app.state = "registered";

            this.running.delete(id);

            this.emit("app:closed", {
                app
            });

            return true;
        },

        /* ----------------------------------------------------
           INITIALIZATION
        ---------------------------------------------------- */

        initialize() {

            if (this.initialized) {
                return this;
            }

            this.initialized = true;

            this.emit("foundation:ready", {
                version: this.version
            });

            console.info(
                "[HalDo App Foundation] Ready."
            );

            return this;
        }
    };

    window.HalDoOS.appFoundation = Foundation;

    if (window.HalDoKernel) {
        try {
            window.HalDoKernel.registerModule(
                "app-foundation",
                Foundation
            );
        } catch (error) {
            console.warn(
                "[HalDo App Foundation] Kernel registration deferred.",
                error
            );
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            () => Foundation.initialize(),
            { once: true }
        );
    } else {
        Foundation.initialize();
    }

})(window);