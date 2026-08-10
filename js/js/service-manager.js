/*
========================================================
HalDo AI OS 18
Service Manager
Professional Ultimate Foundation
========================================================

Aufgaben:
- zentrale Service-Registrierung
- Service-Lifecycle
- Health Monitoring
- Dependency Status
- Fehlerisolierung
- Start / Stop / Restart
- Service Discovery
- System Diagnostics
- Verbindung zum HalDo Runtime
========================================================
*/

(function () {
    "use strict";

    const VERSION = "18.0.0";

    const services = new Map();

    const events = new Map();

    const state = {
        status: "initializing",
        started: false,
        healthy: true,
        errors: [],
        startedAt: null
    };

    /* ==================================================
       EVENTS
    ================================================== */

    function on(event, handler) {

        if (typeof handler !== "function") {
            return () => {};
        }

        if (!events.has(event)) {
            events.set(event, new Set());
        }

        events.get(event).add(handler);

        return () => off(event, handler);
    }

    function off(event, handler) {

        const set = events.get(event);

        if (!set) {
            return;
        }

        set.delete(handler);

        if (!set.size) {
            events.delete(event);
        }
    }

    function emit(event, detail = {}) {

        const set = events.get(event);

        if (set) {

            set.forEach(handler => {

                try {
                    handler(detail);
                } catch (error) {
                    console.error(
                        "[HalDo ServiceManager] Event error:",
                        error
                    );
                }

            });

        }

        try {

            window.dispatchEvent(
                new CustomEvent(
                    "haldo:service:" + event,
                    {
                        detail
                    }
                )
            );

        } catch (_) {}
    }

    /* ==================================================
       SERVICE NORMALIZATION
    ================================================== */

    function normalize(name, definition) {

        if (!name) {
            throw new Error(
                "Service benötigt einen Namen."
            );
        }

        const source =
            definition || {};

        return {

            name,

            version:
                source.version ||
                VERSION,

            description:
                source.description ||
                "",

            dependencies:
                Array.isArray(
                    source.dependencies
                )
                    ? [...source.dependencies]
                    : [],

            optional:
                source.optional === true,

            status:
                "registered",

            healthy:
                false,

            startedAt:
                null,

            stoppedAt:
                null,

            error:
                null,

            api:
                source.api ||
                source,

            init:
                typeof source.init === "function"
                    ? source.init
                    : null,

            start:
                typeof source.start === "function"
                    ? source.start
                    : null,

            stop:
                typeof source.stop === "function"
                    ? source.stop
                    : null,

            restart:
                typeof source.restart === "function"
                    ? source.restart
                    : null,

            health:
                typeof source.health === "function"
                    ? source.health
                    : null
        };
    }

    /* ==================================================
       REGISTER
    ================================================== */

    function register(name, definition) {

        if (services.has(name)) {

            return services.get(name);
        }

        const service =
            normalize(
                name,
                definition
            );

        services.set(
            name,
            service
        );

        emit(
            "registered",
            {
                service
            }
        );

        return service;
    }

    /* ==================================================
       UNREGISTER
    ================================================== */

    function unregister(name) {

        const service =
            services.get(name);

        if (!service) {
            return false;
        }

        services.delete(name);

        emit(
            "unregistered",
            {
                name
            }
        );

        return true;
    }

    /* ==================================================
       GET
    ================================================== */

    function get(name) {
        return services.get(name) || null;
    }

    function has(name) {
        return services.has(name);
    }

    function list() {
        return Array.from(
            services.values()
        );
    }

    /* ==================================================
       DEPENDENCY CHECK
    ================================================== */

    function dependenciesReady(service) {

        if (!service.dependencies.length) {
            return true;
        }

        return service.dependencies.every(
            dependency => {

                const target =
                    services.get(
                        dependency
                    );

                if (!target) {
                    return false;
                }

                return (
                    target.status === "running" &&
                    target.healthy
                );

            }
        );
    }

    /* ==================================================
       INIT
    ================================================== */

    async function initializeService(service) {

        if (!service) {
            return false;
        }

        if (
            service.status === "running"
        ) {
            return true;
        }

        if (
            !dependenciesReady(service)
        ) {

            if (service.optional) {

                service.status =
                    "waiting";

                return false;
            }

            service.status =
                "blocked";

            service.error =
                new Error(
                    "Abhängigkeiten nicht bereit."
                );

            return false;
        }

        try {

            service.status =
                "initializing";

            emit(
                "initializing",
                {
                    service
                }
            );

            if (service.init) {
                await service.init();
            }

            service.status =
                "initialized";

            emit(
                "initialized",
                {
                    service
                }
            );

            return true;

        } catch (error) {

            service.status =
                "error";

            service.healthy =
                false;

            service.error =
                error;

            recordError(
                service.name,
                error
            );

            emit(
                "error",
                {
                    service,
                    error
                }
            );

            return false;
        }
    }

    /* ==================================================
       START
    ================================================== */

    async function startService(name) {

        const service =
            get(name);

        if (!service) {
            return false;
        }

        if (
            service.status === "running"
        ) {
            return true;
        }

        const initialized =
            await initializeService(
                service
            );

        if (!initialized) {
            return false;
        }

        try {

            service.status =
                "starting";

            emit(
                "starting",
                {
                    service
                }
            );

            if (service.start) {
                await service.start();
            }

            service.status =
                "running";

            service.healthy =
                true;

            service.startedAt =
                Date.now();

            service.error =
                null;

            emit(
                "started",
                {
                    service
                }
            );

            return true;

        } catch (error) {

            service.status =
                "error";

            service.healthy =
                false;

            service.error =
                error;

            recordError(
                name,
                error
            );

            emit(
                "error",
                {
                    service,
                    error
                }
            );

            return false;
        }
    }

    /* ==================================================
       START ALL
    ================================================== */

    async function startAll() {

        const result = {
            started: [],
            failed: [],
            waiting: []
        };

        let progress = true;

        while (
            progress &&
            result.started.length +
            result.failed.length +
            result.waiting.length <
            services.size
        ) {

            progress = false;

            for (
                const service
                of services.values()
            ) {

                if (
                    service.status === "running"
                ) {
                    continue;
                }

                if (
                    service.status === "error"
                ) {
                    continue;
                }

                if (
                    !dependenciesReady(
                        service
                    )
                ) {
                    continue;
                }

                const ok =
                    await startService(
                        service.name
                    );

                progress = true;

                if (ok) {

                    if (
                        !result.started.includes(
                            service.name
                        )
                    ) {
                        result.started.push(
                            service.name
                        );
                    }

                } else {

                    if (
                        !result.failed.includes(
                            service.name
                        )
                    ) {
                        result.failed.push(
                            service.name
                        );
                    }

                }
            }
        }

        services.forEach(
            service => {

                if (
                    service.status ===
                    "waiting" ||
                    service.status ===
                    "blocked"
                ) {

                    if (
                        !result.waiting.includes(
                            service.name
                        )
                    ) {
                        result.waiting.push(
                            service.name
                        );
                    }
                }

            }
        );

        return result;
    }

    /* ==================================================
       STOP
    ================================================== */

    async function stopService(name) {

        const service =
            get(name);

        if (!service) {
            return false;
        }

        try {

            if (service.stop) {
                await service.stop();
            }

            service.status =
                "stopped";

            service.healthy =
                false;

            service.stoppedAt =
                Date.now();

            emit(
                "stopped",
                {
                    service
                }
            );

            return true;

        } catch (error) {

            service.status =
                "error";

            service.healthy =
                false;

            service.error =
                error;

            recordError(
                name,
                error
            );

            return false;
        }
    }

    /* ==================================================
       RESTART
    ================================================== */

    async function restartService(name) {

        const service =
            get(name);

        if (!service) {
            return false;
        }

        try {

            if (service.restart) {

                await service.restart();

            } else {

                await stopService(name);

                return await startService(
                    name
                );
            }

            service.status =
                "running";

            service.healthy =
                true;

            service.error =
                null;

            emit(
                "restarted",
                {
                    service
                }
            );

            return true;

        } catch (error) {

            service.status =
                "error";

            service.healthy =
                false;

            service.error =
                error;

            recordError(
                name,
                error
            );

            return false;
        }
    }

    /* ==================================================
       HEALTH CHECK
    ================================================== */

    async function healthCheck(name) {

        const service =
            get(name);

        if (!service) {
            return false;
        }

        try {

            let healthy =
                service.status ===
                "running";

            if (service.health) {

                healthy =
                    await service.health();

            }

            service.healthy =
                healthy === true;

            if (!service.healthy) {

                service.status =
                    "unhealthy";

            }

            emit(
                "health",
                {
                    service,
                    healthy:
                        service.healthy
                }
            );

            return service.healthy;

        } catch (error) {

            service.healthy =
                false;

            service.status =
                "unhealthy";

            service.error =
                error;

            recordError(
                name,
                error
            );

            return false;
        }
    }

    /* ==================================================
       HEALTH CHECK ALL
    ================================================== */

    async function healthCheckAll() {

        const result = {};

        for (
            const service
            of services.values()
        ) {

            result[service.name] =
                await healthCheck(
                    service.name
                );
        }

        state.healthy =
            Object.values(result)
                .every(Boolean);

        return result;
    }

    /* ==================================================
       ERRORS
    ================================================== */

    function recordError(
        service,
        error
    ) {

        const entry = {

            service,

            message:
                String(
                    error?.message ||
                    error
                ),

            timestamp:
                Date.now()
        };

        state.errors.push(
            entry
        );

        if (
            state.errors.length >
            100
        ) {
            state.errors.shift();
        }

        emit(
            "system-error",
            entry
        );
    }

    /* ==================================================
       DIAGNOSTICS
    ================================================== */

    function diagnostics() {

        const serviceList =
            list();

        return {

            name:
                "HalDo Service Manager",

            version:
                VERSION,

            status:
                state.status,

            healthy:
                state.healthy,

            started:
                state.started,

            serviceCount:
                serviceList.length,

            running:
                serviceList.filter(
                    s =>
                        s.status ===
                        "running"
                ).length,

            unhealthy:
                serviceList.filter(
                    s =>
                        !s.healthy
                ).length,

            services:
                serviceList.map(
                    service => ({
                        name:
                            service.name,

                        version:
                            service.version,

                        status:
                            service.status,

                        healthy:
                            service.healthy,

                        dependencies:
                            [
                                ...service.dependencies
                            ],

                        error:
                            service.error
                                ? String(
                                    service.error.message ||
                                    service.error
                                )
                                : null
                    })
                ),

            errors:
                [...state.errors]
        };
    }

    /* ==================================================
       SYSTEM START
    ================================================== */

    async function start() {

        if (state.started) {
            return diagnostics();
        }

        state.status =
            "starting";

        emit(
            "starting-system"
        );

        await startAll();

        await healthCheckAll();

        state.started =
            true;

        state.startedAt =
            Date.now();

        state.status =
            state.healthy
                ? "running"
                : "degraded";

        emit(
            "ready",
            diagnostics()
        );

        return diagnostics();
    }

    /* ==================================================
       PUBLIC API
    ================================================== */

    const HalDoServiceManager = {

        name:
            "HalDo Service Manager",

        version:
            VERSION,

        state,

        on,
        off,
        emit,

        register,
        unregister,

        get,
        has,
        list,

        start,
        startAll,

        stopService,
        restartService,

        healthCheck,
        healthCheckAll,

        diagnostics
    };

    window.HalDoServiceManager =
        HalDoServiceManager;

    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.services =
        HalDoServiceManager;

    /* ==================================================
       AUTO START
    ================================================== */

    function boot() {

        try {

            state.status =
                "ready";

            emit(
                "initialized"
            );

        } catch (error) {

            state.status =
                "error";

            recordError(
                "service-manager",
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
                once: true
            }
        );

    } else {

        boot();
    }

})();