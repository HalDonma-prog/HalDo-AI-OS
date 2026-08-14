/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/system-diagnostics.js

   Aufgabe:
   - Zentrale HalDo-Systemdiagnose
   - Prüfung aller wichtigen Module
   - Prüfung globaler APIs
   - Prüfung DOM / Launcher
   - Prüfung Kernel / System
   - Prüfung App Registry / Manager / Router
   - Keine eigene Systemverwaltung
   - Nur Diagnose und Status
   ============================================================ */

"use strict";

(function (window, document) {

    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const CONFIG = {
        name: "HalDo System Diagnostics",
        version: "18.0.0",
        container: "#haldo-system-diagnostics",
        autoCreateContainer: true
    };


    /* ========================================================
       02 — STATUS
       ======================================================== */

    const state = {
        initialized: false,
        ready: false,
        lastRun: null,
        runCount: 0,
        overall: "unknown",
        results: []
    };


    /* ========================================================
       03 — EVENTS
       ======================================================== */

    const listeners = {};


    function on(eventName, callback) {

        if (typeof callback !== "function") {
            return false;
        }

        if (!listeners[eventName]) {
            listeners[eventName] = [];
        }

        listeners[eventName].push(callback);

        return true;
    }


    function off(eventName, callback) {

        if (!listeners[eventName]) {
            return false;
        }

        listeners[eventName] =
            listeners[eventName].filter(
                item => item !== callback
            );

        return true;
    }


    function emit(eventName, data = null) {

        if (!listeners[eventName]) {
            return;
        }

        listeners[eventName]
            .slice()
            .forEach(callback => {

                try {
                    callback(data);
                } catch (error) {
                    console.error(
                        "[HalDo Diagnostics] Event-Fehler:",
                        error
                    );
                }

            });
    }


    /* ========================================================
       04 — HILFSFUNKTIONEN
       ======================================================== */

    function exists(value) {
        return value !== null &&
               value !== undefined;
    }


    function hasFunction(object, functionName) {

        return Boolean(
            object &&
            typeof object[functionName] === "function"
        );
    }


    function result(
        id,
        name,
        status,
        message,
        details = {}
    ) {

        return {
            id,
            name,
            status,
            message,
            details,
            timestamp: new Date().toISOString()
        };
    }


    /* ========================================================
       05 — GLOBALE SYSTEME
       ======================================================== */

    function getKernel() {

        return (
            window.HalDoKernel ||
            (
                window.HalDoOS &&
                window.HalDoOS.kernel
            ) ||
            null
        );
    }


    function getSystem() {

        return (
            window.HalDoSystem ||
            (
                window.HalDoOS &&
                window.HalDoOS.system
            ) ||
            null
        );
    }


    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            (
                window.HalDoOS &&
                window.HalDoOS.appRegistry
            ) ||
            null
        );
    }


    function getManager() {

        return (
            window.HalDoAppManager ||
            (
                window.HalDoOS &&
                window.HalDoOS.appManager
            ) ||
            null
        );
    }


    function getRouter() {

        return (
            window.HalDoAppRouter ||
            (
                window.HalDoOS &&
                window.HalDoOS.appRouter
            ) ||
            null
        );
    }


    function getLauncher() {

        return (
            window.HalDoLauncher ||
            (
                window.HalDoOS &&
                window.HalDoOS.launcher
            ) ||
            null
        );
    }


    function getAppLauncher() {

        return (
            window.HalDoAppLauncher ||
            (
                window.HalDoOS &&
                window.HalDoOS.appLauncher
            ) ||
            null
        );
    }


    /* ========================================================
       06 — KERNEL
       ======================================================== */

    function diagnoseKernel() {

        const kernel = getKernel();

        if (!kernel) {

            return result(
                "kernel",
                "Kernel",
                "error",
                "HalDoKernel wurde nicht gefunden."
            );

        }

        const required = [
            "on",
            "off",
            "emit"
        ];

        const missing =
            required.filter(
                method =>
                    !hasFunction(
                        kernel,
                        method
                    )
            );

        if (missing.length) {

            return result(
                "kernel",
                "Kernel",
                "warning",
                "Kernel vorhanden, aber APIs fehlen.",
                {
                    missing
                }
            );

        }

        return result(
            "kernel",
            "Kernel",
            "ok",
            "Kernel ist vorhanden und grundlegende APIs sind verfügbar."
        );
    }


    /* ========================================================
       07 — SYSTEM
       ======================================================== */

    function diagnoseSystem() {

        const system = getSystem();

        if (!system) {

            return result(
                "system",
                "System",
                "error",
                "HalDoSystem wurde nicht gefunden."
            );

        }

        const methods = [
            "registerService"
        ];

        const missing =
            methods.filter(
                method =>
                    !hasFunction(
                        system,
                        method
                    )
            );

        if (missing.length) {

            return result(
                "system",
                "System",
                "warning",
                "System vorhanden, aber benötigte APIs fehlen.",
                {
                    missing
                }
            );

        }

        return result(
            "system",
            "System",
            "ok",
            "Zentrale Systemverwaltung ist verfügbar."
        );
    }


    /* ========================================================
       08 — APP REGISTRY
       ======================================================== */

    function diagnoseRegistry() {

        const registry = getRegistry();

        if (!registry) {

            return result(
                "app-registry",
                "App Registry",
                "error",
                "HalDoAppRegistry wurde nicht gefunden."
            );

        }

        let apps = [];

        try {

            if (
                hasFunction(
                    registry,
                    "getAllApps"
                )
            ) {

                apps =
                    registry.getAllApps();

            }
            else if (
                hasFunction(
                    registry,
                    "getAll"
                )
            ) {

                apps =
                    registry.getAll();

            }
            else if (
                Array.isArray(
                    registry.definitions
                )
            ) {

                apps =
                    registry.definitions;

            }

        } catch (error) {

            return result(
                "app-registry",
                "App Registry",
                "error",
                "Registry konnte nicht gelesen werden.",
                {
                    error:
                        error.message ||
                        String(error)
                }
            );
        }

        if (!Array.isArray(apps)) {

            return result(
                "app-registry",
                "App Registry",
                "warning",
                "Registry ist vorhanden, liefert aber keine App-Liste."
            );

        }

        return result(
            "app-registry",
            "App Registry",
            "ok",
            `Registry ist verfügbar: ${apps.length} Apps.`,
            {
                appCount:
                    apps.length
            }
        );
    }


    /* ========================================================
       09 — APP MANAGER
       ======================================================== */

    function diagnoseManager() {

        const manager = getManager();

        if (!manager) {

            return result(
                "app-manager",
                "App Manager",
                "error",
                "HalDoAppManager wurde nicht gefunden."
            );

        }

        const methods = [
            "getAllApps"
        ];

        const missing =
            methods.filter(
                method =>
                    !hasFunction(
                        manager,
                        method
                    )
            );

        if (missing.length) {

            return result(
                "app-manager",
                "App Manager",
                "warning",
                "App Manager vorhanden, aber APIs fehlen.",
                {
                    missing
                }
            );

        }

        let count = 0;

        try {

            const apps =
                manager.getAllApps();

            if (Array.isArray(apps)) {
                count = apps.length;
            }

        } catch (error) {

            return result(
                "app-manager",
                "App Manager",
                "error",
                "App Manager konnte nicht gelesen werden.",
                {
                    error:
                        error.message ||
                        String(error)
                }
            );
        }

        return result(
            "app-manager",
            "App Manager",
            "ok",
            `App Manager ist verfügbar: ${count} Apps.`,
            {
                appCount:
                    count
            }
        );
    }


    /* ========================================================
       10 — APP ROUTER
       ======================================================== */

    function diagnoseRouter() {

        const router = getRouter();

        if (!router) {

            return result(
                "app-router",
                "App Router",
                "error",
                "HalDoAppRouter wurde nicht gefunden."
            );

        }

        const methods = [
            "navigateToApp",
            "goToApp",
            "openApp",
            "navigate"
        ];

        const available =
            methods.filter(
                method =>
                    hasFunction(
                        router,
                        method
                    )
            );

        if (!available.length) {

            return result(
                "app-router",
                "App Router",
                "warning",
                "Router vorhanden, aber keine bekannte Navigations-API gefunden.",
                {
                    available
                }
            );

        }

        return result(
            "app-router",
            "App Router",
            "ok",
            "App Router ist verfügbar.",
            {
                navigationAPIs:
                    available
            }
        );
    }


    /* ========================================================
       11 — LAUNCHER
       ======================================================== */

    function diagnoseLauncher() {

        const launcher = getLauncher();

        if (!launcher) {

            return result(
                "launcher",
                "Launcher",
                "error",
                "HalDoLauncher wurde nicht gefunden."
            );

        }

        const methods = [
            "init",
            "render",
            "openApp",
            "getState",
            "diagnose"
        ];

        const missing =
            methods.filter(
                method =>
                    !hasFunction(
                        launcher,
                        method
                    )
            );

        if (missing.length) {

            return result(
                "launcher",
                "Launcher",
                "warning",
                "Launcher vorhanden, aber APIs fehlen.",
                {
                    missing
                }
            );

        }

        return result(
            "launcher",
            "Launcher",
            "ok",
            "Zentraler Launcher ist verfügbar."
        );
    }


    /* ========================================================
       12 — APP LAUNCHER
       ======================================================== */

    function diagnoseAppLauncher() {

        const launcher =
            getAppLauncher();

        if (!launcher) {

            return result(
                "app-launcher",
                "App Launcher",
                "warning",
                "HalDoAppLauncher wurde nicht gefunden."
            );

        }

        return result(
            "app-launcher",
            "App Launcher",
            "ok",
            "HalDoAppLauncher ist verfügbar."
        );
    }


    /* ========================================================
       13 — WINDOW MANAGER
       ======================================================== */

    function diagnoseWindowManager() {

        const manager =
            window.HalDoWindowManager ||
            (
                window.HalDoOS &&
                window.HalDoOS.windowManager
            );

        if (!manager) {

            return result(
                "window-manager",
                "Window Manager",
                "warning",
                "Window Manager wurde nicht gefunden."
            );

        }

        return result(
            "window-manager",
            "Window Manager",
            "ok",
            "Window Manager ist verfügbar."
        );
    }


    /* ========================================================
       14 — MODULE MANAGER
       ======================================================== */

    function diagnoseModuleManager() {

        const manager =
            window.HalDoModuleManager ||
            (
                window.HalDoOS &&
                window.HalDoOS.moduleManager
            );

        if (!manager) {

            return result(
                "module-manager",
                "Module Manager",
                "warning",
                "Module Manager wurde nicht gefunden."
            );

        }

        return result(
            "module-manager",
            "Module Manager",
            "ok",
            "Module Manager ist verfügbar."
        );
    }


    /* ========================================================
       15 — STORAGE
       ======================================================== */

    function diagnoseStorage() {

        const storage =
            window.HalDoStorage ||
            (
                window.HalDoOS &&
                window.HalDoOS.storage
            );

        if (!storage) {

            return result(
                "storage",
                "Storage",
                "warning",
                "HalDoStorage wurde nicht gefunden."
            );

        }

        return result(
            "storage",
            "Storage",
            "ok",
            "HalDo Storage ist verfügbar."
        );
    }


    /* ========================================================
       16 — LANGUAGE SYSTEM
       ======================================================== */

    function diagnoseLanguage() {

        const language =
            window.HalDoLanguageSystem ||
            window.HalDoLanguageManager ||
            (
                window.HalDoOS &&
                (
                    window.HalDoOS.languageSystem ||
                    window.HalDoOS.languageManager
                )
            );

        if (!language) {

            return result(
                "language",
                "Language System",
                "warning",
                "Language System wurde nicht gefunden."
            );

        }

        return result(
            "language",
            "Language System",
            "ok",
            "Language System ist verfügbar."
        );
    }


    /* ========================================================
       17 — AI SYSTEM
       ======================================================== */

    function diagnoseAI() {

        const ai =
            window.HalDoAI ||
            window.HalDoAICore ||
            window.HalDoAIEngine ||
            (
                window.HalDoOS &&
                (
                    window.HalDoOS.ai ||
                    window.HalDoOS.aiCore ||
                    window.HalDoOS.aiEngine
                )
            );

        if (!ai) {

            return result(
                "ai",
                "HalDo AI",
                "warning",
                "HalDo AI API wurde nicht gefunden."
            );

        }

        return result(
            "ai",
            "HalDo AI",
            "ok",
            "HalDo AI API ist verfügbar."
        );
    }


    /* ========================================================
       18 — DOM
       ======================================================== */

    function diagnoseDOM() {

        if (!document || !document.body) {

            return result(
                "dom",
                "DOM",
                "error",
                "Document Body ist nicht verfügbar."
            );

        }

        return result(
            "dom",
            "DOM",
            "ok",
            "DOM und Document Body sind verfügbar."
        );
    }


    /* ========================================================
       19 — HALDO OS
       ======================================================== */

    function diagnoseGlobalOS() {

        if (!window.HalDoOS) {

            return result(
                "haldo-os",
                "HalDoOS Global API",
                "error",
                "window.HalDoOS wurde nicht gefunden."
            );

        }

        return result(
            "haldo-os",
            "HalDoOS Global API",
            "ok",
            "window.HalDoOS ist verfügbar.",
            {
                keys:
                    Object.keys(
                        window.HalDoOS
                    )
            }
        );
    }


    /* ========================================================
       20 — GESAMTDIAGNOSE
       ======================================================== */

    function run() {

        const results = [

            diagnoseGlobalOS(),

            diagnoseDOM(),

            diagnoseKernel(),

            diagnoseSystem(),

            diagnoseRegistry(),

            diagnoseManager(),

            diagnoseRouter(),

            diagnoseLauncher(),

            diagnoseAppLauncher(),

            diagnoseWindowManager(),

            diagnoseModuleManager(),

            diagnoseStorage(),

            diagnoseLanguage(),

            diagnoseAI()

        ];


        const hasErrors =
            results.some(
                item =>
                    item.status ===
                    "error"
            );

        const hasWarnings =
            results.some(
                item =>
                    item.status ===
                    "warning"
            );


        let overall =
            "ok";


        if (hasErrors) {

            overall =
                "error";

        }
        else if (hasWarnings) {

            overall =
                "warning";

        }


        state.results =
            results;

        state.overall =
            overall;

        state.lastRun =
            new Date().toISOString();

        state.runCount++;


        emit(
            "diagnostics-complete",
            {
                overall,
                results
            }
        );


        return {

            success:
                overall !== "error",

            overall,

            results,

            timestamp:
                state.lastRun,

            runCount:
                state.runCount

        };
    }


    /* ========================================================
       21 — KURZSTATUS
       ======================================================== */

    function getStatus() {

        return {

            overall:
                state.overall,

            initialized:
                state.initialized,

            ready:
                state.ready,

            lastRun:
                state.lastRun,

            runCount:
                state.runCount,

            ok:
                state.results.filter(
                    item =>
                        item.status ===
                        "ok"
                ).length,

            warnings:
                state.results.filter(
                    item =>
                        item.status ===
                        "warning"
                ).length,

            errors:
                state.results.filter(
                    item =>
                        item.status ===
                        "error"
                ).length

        };
    }


    /* ========================================================
       22 — DIAGNOSE-UI
       ======================================================== */

    function getContainer() {

        return document.querySelector(
            CONFIG.container
        );
    }


    function ensureContainer() {

        let container =
            getContainer();

        if (container) {
            return container;
        }

        if (!CONFIG.autoCreateContainer) {
            return null;
        }

        container =
            document.createElement(
                "section"
            );

        container.id =
            "haldo-system-diagnostics";

        container.className =
            "haldo-system-diagnostics";

        document.body.appendChild(
            container
        );

        return container;
    }


    function render() {

        const container =
            ensureContainer();

        if (!container) {
            return false;
        }


        const data =
            state.results.length
                ? {
                    overall:
                        state.overall,
                    results:
                        state.results
                }
                : run();


        container.innerHTML =
            "";


        const header =
            document.createElement(
                "header"
            );

        header.className =
            "haldo-diagnostics-header";


        const title =
            document.createElement(
                "h2"
            );

        title.textContent =
            "HalDo Systemdiagnose";


        const status =
            document.createElement(
                "span"
            );

        status.className =
            `haldo-diagnostics-status ${data.overall}`;

        status.textContent =
            data.overall === "ok"
                ? "🟢 SYSTEM OK"
                : data.overall === "warning"
                    ? "🟡 WARNUNG"
                    : "🔴 FEHLER";


        header.appendChild(
            title
        );

        header.appendChild(
            status
        );

        container.appendChild(
            header
        );


        const list =
            document.createElement(
                "div"
            );

        list.className =
            "haldo-diagnostics-list";


        data.results.forEach(
            item => {

                const row =
                    document.createElement(
                        "article"
                    );

                row.className =
                    `haldo-diagnostics-item ${item.status}`;


                const name =
                    document.createElement(
                        "strong"
                    );

                name.textContent =
                    item.name;


                const message =
                    document.createElement(
                        "span"
                    );

                message.textContent =
                    item.message;


                row.appendChild(
                    name
                );

                row.appendChild(
                    message
                );


                if (
                    item.details &&
                    Object.keys(
                        item.details
                    ).length
                ) {

                    const details =
                        document.createElement(
                            "pre"
                        );

                    details.textContent =
                        JSON.stringify(
                            item.details,
                            null,
                            2
                        );

                    row.appendChild(
                        details
                    );
                }


                list.appendChild(
                    row
                );

            }
        );


        container.appendChild(
            list
        );


        return true;
    }


    /* ========================================================
       23 — INITIALISIERUNG
       ======================================================== */

    function init() {

        if (state.initialized) {
            return getStatus();
        }


        state.initialized =
            true;

        state.ready =
            true;


        /*
         * Kernel
         */

        const kernel =
            getKernel();

        if (
            kernel &&
            hasFunction(
                kernel,
                "registerModule"
            )
        ) {

            kernel.registerModule(
                "system-diagnostics",
                api
            );

            if (
                hasFunction(
                    kernel,
                    "setModuleReady"
                )
            ) {

                kernel.setModuleReady(
                    "system-diagnostics",
                    true
                );
            }
        }


        /*
         * System
         */

        const system =
            getSystem();

        if (
            system &&
            hasFunction(
                system,
                "registerService"
            )
        ) {

            system.registerService(
                "system-diagnostics",
                api
            );
        }


        emit(
            "ready",
            getStatus()
        );


        console.log(
            "[HalDo Diagnostics] Systemdiagnose bereit."
        );


        return getStatus();
    }


    /* ========================================================
       24 — API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,

        init,

        on,

        off,

        run,

        diagnose:
            run,

        render,

        getStatus,

        getState:
            getStatus,

        getResults:
            () =>
                state.results.slice()
    };


    /* ========================================================
       25 — GLOBAL
       ======================================================== */

    window.HalDoSystemDiagnostics =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.systemDiagnostics =
        api;


    /* ========================================================
       26 — BOOT
       ======================================================== */

    function boot() {

        init();
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

    }
    else {

        boot();

    }


})(window, document);


/* ============================================================
   ENDE — HALDO SYSTEM DIAGNOSTICS
   ============================================================ */