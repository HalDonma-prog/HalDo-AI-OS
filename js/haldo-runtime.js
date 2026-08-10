/*
========================================================
HalDo AI OS 18
HALDO RUNTIME INTEGRATION CORE
Professional Ultimate Foundation
========================================================

Aufgabe:
- verbindet vorhandene HalDo-Systeme
- erkennt vorhandene Module automatisch
- hält globale Runtime-Zustände
- verbindet Kernel / System / AI / Apps / Sprache /
  Tastatur / Voice / Light / Storage
- erzeugt einen gemeinsamen Event-Bus
- verhindert harte Abhängigkeiten
- bereitet zukünftige Module vor

Bestehende Dateien werden NICHT ersetzt.
========================================================
*/

(function () {
    "use strict";

    const VERSION = "18.0.0";

    const state = {
        status: "booting",
        ready: false,
        online: navigator.onLine,
        modules: {},
        services: {},
        startedAt: null,
        lastError: null
    };

    const listeners = new Map();

    function emit(event, detail = {}) {
        const handlers = listeners.get(event);

        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(detail);
                } catch (error) {
                    console.error(
                        "[HalDo Runtime] Event handler error:",
                        error
                    );
                }
            });
        }

        window.dispatchEvent(
            new CustomEvent(
                "haldo:" + event,
                {
                    detail
                }
            )
        );
    }

    function on(event, handler) {
        if (typeof handler !== "function") {
            return () => {};
        }

        if (!listeners.has(event)) {
            listeners.set(event, new Set());
        }

        listeners.get(event).add(handler);

        return () => off(event, handler);
    }

    function off(event, handler) {
        const handlers = listeners.get(event);

        if (!handlers) {
            return;
        }

        handlers.delete(handler);

        if (handlers.size === 0) {
            listeners.delete(event);
        }
    }

    function findGlobal(name) {
        return window[name] || null;
    }

    function detectModules() {
        const registry = {
            kernel: findGlobal("HalDoKernel"),
            system: findGlobal("HalDoSystem"),
            aiCore: findGlobal("HalDoAICore"),
            aiEngine: findGlobal("HalDoAIEngine"),
            aiChat: findGlobal("HalDoAIChat"),
            aiMemory: findGlobal("HalDoAIMemory"),
            aiLanguage: findGlobal("HalDoAILanguage"),
            languageManager: findGlobal("HalDoLanguageManager"),
            languageSystem: findGlobal("HalDoLanguageSystem"),
            voice: findGlobal("HalDoVoice"),
            speech: findGlobal("HalDoSpeech"),
            ezidiKeyboard: findGlobal("HalDoEzidiKeyboard"),
            light: findGlobal("HalDoLight"),
            storage: findGlobal("HalDoStorage"),
            storageManager: findGlobal("HalDoStorageManager"),
            appManager: findGlobal("HalDoAppManager"),
            appRegistry: findGlobal("HalDoAppRegistry"),
            appRouter: findGlobal("HalDoAppRouter"),
            launcher: findGlobal("HalDoLauncher"),
            windowManager: findGlobal("HalDoWindowManager"),
            moduleManager: findGlobal("HalDoModuleManager"),
            configManager: findGlobal("HalDoConfigManager")
        };

        Object.entries(registry).forEach(
            ([name, module]) => {
                if (module) {
                    state.modules[name] = module;
                }
            }
        );

        emit(
            "modules:detected",
            {
                modules: Object.keys(state.modules)
            }
        );

        return state.modules;
    }

    function registerService(name, service) {
        if (!name || !service) {
            return false;
        }

        state.services[name] = service;

        emit(
            "service:registered",
            {
                name,
                service
            }
        );

        return true;
    }

    function getService(name) {
        return state.services[name] || null;
    }

    function getModule(name) {
        return state.modules[name] || null;
    }

    function call(moduleName, methodName, ...args) {
        const module = getModule(moduleName);

        if (!module) {
            return {
                ok: false,
                error: `Module "${moduleName}" ist nicht verfügbar.`
            };
        }

        if (typeof module[methodName] !== "function") {
            return {
                ok: false,
                error:
                    `Methode "${methodName}" wurde in "${moduleName}" nicht gefunden.`
            };
        }

        try {
            return {
                ok: true,
                value: module[methodName](...args)
            };
        } catch (error) {
            state.lastError = error;

            emit(
                "runtime:error",
                {
                    module: moduleName,
                    method: methodName,
                    error
                }
            );

            return {
                ok: false,
                error
            };
        }
    }

    function startAI() {
        const ai = getModule("aiCore");

        if (!ai) {
            return false;
        }

        if (typeof ai.start === "function") {
            try {
                ai.start();

                emit("ai:started");

                return true;
            } catch (error) {
                state.lastError = error;

                emit(
                    "ai:error",
                    {
                        error
                    }
                );
            }
        }

        return false;
    }

    function setLightMode(mode) {
        const light = getModule("light");

        if (
            light &&
            typeof light.setMode === "function"
        ) {
            light.setMode(mode);

            emit(
                "light:mode",
                {
                    mode
                }
            );

            return true;
        }

        return false;
    }

    function sendAIMessage(message) {
        const input = String(message || "").trim();

        if (!input) {
            return {
                ok: false,
                error: "Leere Anfrage."
            };
        }

        const aiChat = getModule("aiChat");

        if (
            aiChat &&
            typeof aiChat.sendMessage === "function"
        ) {
            return call(
                "aiChat",
                "sendMessage",
                input
            );
        }

        const aiCore = getModule("aiCore");

        if (
            aiCore &&
            typeof aiCore.ask === "function"
        ) {
            return call(
                "aiCore",
                "ask",
                input
            );
        }

        return {
            ok: false,
            error: "Kein AI Chat-Service verfügbar."
        };
    }

    function updateOnlineState() {
        state.online = navigator.onLine;

        emit(
            state.online
                ? "network:online"
                : "network:offline",
            {
                online: state.online
            }
        );
    }

    function diagnostics() {
        const modules = {};

        Object.entries(state.modules).forEach(
            ([name, module]) => {
                modules[name] = {
                    available: !!module,
                    type: typeof module
                };
            }
        );

        return {
            name: "HalDo AI OS Runtime",
            version: VERSION,
            status: state.status,
            ready: state.ready,
            online: state.online,
            startedAt: state.startedAt,
            modules,
            services: Object.keys(state.services),
            lastError: state.lastError
                ? String(state.lastError.message || state.lastError)
                : null
        };
    }

    function initialize() {
        if (state.ready) {
            return diagnostics();
        }

        state.status = "initializing";

        emit("runtime:initializing");

        detectModules();

        registerService(
            "runtime",
            HalDoRuntime
        );

        startAI();

        state.status = "running";
        state.ready = true;
        state.startedAt = Date.now();

        emit(
            "runtime:ready",
            diagnostics()
        );

        return diagnostics();
    }

    window.addEventListener(
        "online",
        updateOnlineState
    );

    window.addEventListener(
        "offline",
        updateOnlineState
    );

    const HalDoRuntime = {

        name:
            "HalDo AI OS Runtime",

        version:
            VERSION,

        state,

        initialize,

        detectModules,

        diagnostics,

        on,

        off,

        emit,

        getModule,

        registerService,

        getService,

        call,

        startAI,

        sendAIMessage,

        setLightMode
    };

    window.HalDoRuntime = HalDoRuntime;

    window.HalDoOS =
        window.HalDoOS || {};

    window.HalDoOS.runtime =
        HalDoRuntime;

    function bootRuntime() {
        try {
            initialize();
        } catch (error) {
            state.status = "error";
            state.lastError = error;

            emit(
                "runtime:error",
                {
                    error
                }
            );

            console.error(
                "[HalDo Runtime] Startfehler:",
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
            bootRuntime,
            {
                once: true
            }
        );
    } else {
        bootRuntime();
    }

})();