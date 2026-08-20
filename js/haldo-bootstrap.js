/*
 * ============================================================
 * HALDO AI OS 20
 * HALDO BOOTSTRAP
 * ============================================================
 *
 * Datei:
 * /js/haldo-bootstrap.js
 *
 * Änderung:
 * KOMPLETT NEU
 *
 * Aufgabe:
 * - zentraler Startpunkt des Betriebssystems
 * - verbindet vorhandene HalDo-Systeme
 * - startet den vorhandenen Kernel
 * - wartet auf vorhandene Module
 * - initialisiert Runtime / Registry / Manager / Router
 * - verbindet Dashboard / Desktop
 * - erzeugt einen zuverlässigen READY-Zustand
 *
 * WICHTIG:
 * Dieser Bootstrap ersetzt NICHT js/kernel.js.
 * Vorhandene Module werden bevorzugt verwendet.
 * ============================================================
 */

"use strict";

(function (window, document) {

    /* ========================================================
       GLOBAL OBJECT
       ======================================================== */

    const HalDo =
        window.HalDo ||
        (window.HalDo = {});


    /* ========================================================
       VERSION
       ======================================================== */

    HalDo.version =
        HalDo.version ||
        "20.0.0";


    HalDo.build =
        HalDo.build ||
        "Professional Ultimate Foundation";


    /* ========================================================
       BOOT STATE
       ======================================================== */

    const state = {

        started: false,

        finished: false,

        failed: false,

        stage: "foundation",

        progress: 0,

        startedAt: null,

        finishedAt: null,

        error: null,

        history: []

    };


    HalDo.bootstrap =
        HalDo.bootstrap ||
        {};


    HalDo.bootstrap.state =
        state;


    HalDo.boot =
        HalDo.boot ||
        state;


    /* ========================================================
       EVENT SYSTEM
       ======================================================== */

    function emit(
        event,
        detail = {}
    ) {

        try {

            if (
                typeof HalDo.emit ===
                "function"
            ) {

                HalDo.emit(
                    event,
                    detail
                );

            }

        } catch (error) {

            console.warn(
                "[HalDo Bootstrap] Event failed:",
                event,
                error
            );

        }


        try {

            window.dispatchEvent(
                new CustomEvent(
                    `haldo:${event}`,
                    {
                        detail
                    }
                )
            );

        } catch (error) {

            /*
             * Ältere Browser / spezielle WebViews.
             */

        }

    }


    /* ========================================================
       STAGE
       ======================================================== */

    function setStage(
        stage,
        progress,
        message
    ) {

        state.stage =
            stage;

        state.progress =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        progress
                    ) || 0
                )
            );

        state.history.push({

            stage,

            progress:
                state.progress,

            message:
                message ||
                "",

            timestamp:
                Date.now()

        });


        emit(
            "boot:stage",
            {

                stage,

                progress:
                    state.progress,

                message:
                    message ||
                    ""

            }
        );


        emit(
            "bootstrap:stage",
            {

                stage,

                progress:
                    state.progress,

                message:
                    message ||
                    ""

            }
        );


        /*
         * Bestehende Boot-Oberfläche direkt aktualisieren.
         */

        updateBootUI(
            message
        );

    }


    /* ========================================================
       BOOT UI
       ======================================================== */

    function updateBootUI(
        message
    ) {

        const bar =
            document.querySelector(
                "[data-boot-progress]"
            );

        const text =
            document.querySelector(
                "[data-boot-message]"
            );

        const detail =
            document.querySelector(
                "[data-boot-detail]"
            );


        if (bar) {

            bar.style.width =
                `${state.progress}%`;

        }


        if (
            text &&
            message
        ) {

            text.textContent =
                message;

        }


        if (detail) {

            detail.textContent =
                `Stage: ${state.stage} · ${state.progress}%`;

        }

    }


    /* ========================================================
       SAFE WAIT
       ======================================================== */

    function wait(
        milliseconds
    ) {

        return new Promise(
            resolve => {

                window.setTimeout(
                    resolve,
                    milliseconds
                );

            }
        );

    }


    /* ========================================================
       WAIT FOR CONDITION
       ======================================================== */

    async function waitFor(
        condition,
        timeout = 5000,
        interval = 50
    ) {

        const started =
            Date.now();


        while (
            Date.now() -
            started <
            timeout
        ) {

            try {

                if (
                    condition()
                ) {

                    return true;

                }

            } catch (error) {

                /*
                 * Die Bedingung darf während des
                 * Modulaufbaus noch fehlschlagen.
                 */

            }


            await wait(
                interval
            );

        }


        return false;

    }


    /* ========================================================
       FIND OBJECT
       ======================================================== */

    function findObject(
        names
    ) {

        for (
            const name of names
        ) {

            const parts =
                name.split(
                    "."
                );

            let current =
                window;


            for (
                const part of parts
            ) {

                if (
                    current &&
                    part in current
                ) {

                    current =
                        current[part];

                } else {

                    current =
                        null;

                    break;

                }

            }


            if (
                current
            ) {

                return current;

            }

        }


        return null;

    }


    /* ========================================================
       CALL EXISTING METHOD
       ======================================================== */

    async function callMethod(
        object,
        methods,
        ...args
    ) {

        if (
            !object
        ) {

            return {

                called:
                    false,

                result:
                    null

            };

        }


        for (
            const method of methods
        ) {

            if (
                typeof object[method] ===
                "function"
            ) {

                const result =
                    await object[method](
                        ...args
                    );


                return {

                    called:
                        true,

                    method,

                    result

                };

            }

        }


        return {

            called:
                false,

            result:
                null

        };

    }


    /* ========================================================
       ERROR RECORDING
       ======================================================== */

    function recordError(
        error,
        stage
    ) {

        const normalized =
            error instanceof Error
                ? error
                : new Error(
                    String(
                        error ||
                        "Unknown error"
                    )
                );


        state.error = {

            message:
                normalized.message,

            stack:
                normalized.stack ||
                "",

            stage:
                stage ||
                state.stage,

            timestamp:
                Date.now()

        };


        state.history.push({

            stage:
                "error",

            progress:
                state.progress,

            message:
                normalized.message,

            timestamp:
                Date.now()

        });


        console.error(
            "[HalDo Bootstrap]",
            normalized
        );


        emit(
            "bootstrap:error",
            {

                error:
                    normalized,

                stage:
                    stage ||
                    state.stage

            }
        );

    }


    /* ========================================================
       KERNEL
       ======================================================== */

    async function startKernel() {

        setStage(
            "kernel",
            12,
            "HalDo Kernel wird gestartet …"
        );


        const kernel =
            HalDo.kernel ||
            window.HalDoKernel;


        if (
            !kernel
        ) {

            /*
             * Der Bootstrap darf nicht endlos hängen.
             */

            console.warn(
                "[HalDo Bootstrap] Kein Kernel gefunden."
            );

            return false;

        }


        const result =
            await callMethod(
                kernel,
                [
                    "start",
                    "initialize",
                    "boot"
                ]
            );


        if (
            result.called
        ) {

            await wait(
                0
            );

        }


        await waitFor(
            () =>
                Boolean(
                    HalDo.kernel ||
                    window.HalDoKernel
                ),
            3000
        );


        return true;

    }


    /* ========================================================
       STORAGE
       ======================================================== */

    async function initializeStorage() {

        setStage(
            "storage",
            25,
            "HalDo Storage wird initialisiert …"
        );


        const storage =
            HalDo.storage ||
            window.HalDoStorage;


        if (
            !storage
        ) {

            console.warn(
                "[HalDo Bootstrap] Storage noch nicht verfügbar."
            );

            return false;

        }


        const result =
            await callMethod(
                storage,
                [
                    "init",
                    "initialize",
                    "start"
                ]
            );


        if (
            result.called
        ) {

            await wait(
                0
            );

        }


        return true;

    }


    /* ========================================================
       REGISTRY
       ======================================================== */

    async function initializeRegistry() {

        setStage(
            "registry",
            38,
            "App Registry wird verbunden …"
        );


        const registry =
            HalDo.appRegistry ||
            HalDo.registry ||
            window.HalDoAppRegistry;


        if (
            !registry
        ) {

            console.warn(
                "[HalDo Bootstrap] App Registry noch nicht verfügbar."
            );

            return false;

        }


        const result =
            await callMethod(
                registry,
                [
                    "init",
                    "initialize",
                    "start",
                    "load"
                ]
            );


        if (
            result.called
        ) {

            await wait(
                0
            );

        }


        return true;

    }


    /* ========================================================
       SYSTEM
       ======================================================== */

    async function initializeSystem() {

        setStage(
            "system",
            50,
            "HalDo System wird initialisiert …"
        );


        const system =
            HalDo.system ||
            window.HalDoSystem;


        if (
            !system
        ) {

            console.warn(
                "[HalDo Bootstrap] System-Modul noch nicht verfügbar."
            );

            return false;

        }


        const result =
            await callMethod(
                system,
                [
                    "init",
                    "initialize",
                    "start",
                    "boot"
                ]
            );


        if (
            result.called
        ) {

            await wait(
                0
            );

        }


        return true;

    }


    /* ========================================================
       APP MANAGER
       ======================================================== */

    async function initializeAppManager() {

        setStage(
            "app-manager",
            60,
            "App Manager wird verbunden …"
        );


        const manager =
            HalDo.appManager ||
            window.HalDoAppManager;


        if (
            !manager
        ) {

            console.warn(
                "[HalDo Bootstrap] App Manager noch nicht verfügbar."
            );

            return false;

        }


        const result =
            await callMethod(
                manager,
                [
                    "init",
                    "initialize",
                    "start"
                ]
            );


        if (
            result.called
        ) {

            await wait(
                0
            );

        }


        return true;

    }


    /* ========================================================
       ROUTER
       ======================================================== */

    async function initializeRouter() {

        setStage(
            "router",
            68,
            "App Router wird verbunden …"
        );


        const router =
            HalDo.router ||
            HalDo.appRouter ||
            window.HalDoRouter;


        if (
            !router
        ) {

            console.warn(
                "[HalDo Bootstrap] Router noch nicht verfügbar."
            );

            return false;

        }


        const result =
            await callMethod(
                router,
                [
                    "init",
                    "initialize",
                    "start"
                ]
            );


        if (
            result.called
        ) {

            await wait(
                0
            );

        }


        return true;

    }


    /* ========================================================
       WINDOW MANAGER
       ======================================================== */

    async function initializeWindowManager() {

        setStage(
            "window-manager",
            75,
            "Window Manager wird verbunden …"
        );


        const manager =
            HalDo.windowManager ||
            window.HalDoWindowManager;


        if (
            !manager
        ) {

            console.warn(
                "[HalDo Bootstrap] Window Manager noch nicht verfügbar."
            );

            return false;

        }


        const result =
            await callMethod(
                manager,
                [
                    "init",
                    "initialize",
                    "start"
                ]
            );


        if (
            result.called
        ) {

            await wait(
                0
            );

        }


        return true;

    }


    /* ========================================================
       LAUNCHER
       ======================================================== */

    async function initializeLauncher() {

        setStage(
            "launcher",
            80,
            "Launcher wird vorbereitet …"
        );


        const launcher =
            HalDo.launcher ||
            window.HalDoLauncher;


        if (
            !launcher
        ) {

            console.warn(
                "[HalDo Bootstrap] Launcher noch nicht verfügbar."
            );

            return false;

        }


        const result =
            await callMethod(
                launcher,
                [
                    "init",
                    "initialize",
                    "start"
                ]
            );


        if (
            result.called
        ) {

            await wait(
                0
            );

        }


        return true;

    }


    /* ========================================================
       AI
       ======================================================== */

    async function initializeAI() {

        setStage(
            "ai",
            85,
            "HalDo AI wird verbunden …"
        );


        const ai =
            HalDo.ai ||
            HalDo.aiCore ||
            window.HalDoAI;


        if (
            !ai
        ) {

            console.warn(
                "[HalDo Bootstrap] AI-Modul noch nicht verfügbar."
            );

            return false;

        }


        const result =
            await callMethod(
                ai,
                [
                    "init",
                    "initialize",
                    "start"
                ]
            );


        if (
            result.called
        ) {

            await wait(
                0
            );

        }


        return true;

    }


    /* ========================================================
       DASHBOARD / DESKTOP
       ======================================================== */

    async function openDashboard() {

        setStage(
            "desktop",
            92,
            "HalDo Desktop wird gestartet …"
        );


        /*
         * Bereits vorhandenen Desktop bevorzugen.
         */

        const desktop =
            findObject(
                [
                    "HalDo.desktop",
                    "HalDo.desktopManager",
                    "HalDo.windowManager"
                ]
            );


        if (
            desktop
        ) {

            const result =
                await callMethod(
                    desktop,
                    [
                        "showDesktop",
                        "show",
                        "openDesktop",
                        "initializeDesktop"
                    ]
                );


            if (
                result.called
            ) {

                return true;

            }

        }


        /*
         * Dashboard über App Manager öffnen,
         * falls es als App registriert wurde.
         */

        const manager =
            HalDo.appManager;


        if (
            manager
        ) {

            const result =
                await callMethod(
                    manager,
                    [
                        "open",
                        "launch",
                        "startApp"
                    ],
                    "dashboard"
                );


            if (
                result.called
            ) {

                return true;

            }

        }


        /*
         * Letzter Browser-Fallback:
         * dashboard.html wird nur geöffnet,
         * wenn kein bestehender Desktop verfügbar ist.
         */

        const currentPath =
            window.location.pathname;


        if (
            !/dashboard\.html$/i.test(
                currentPath
            )
        ) {

            /*
             * Kein automatischer Redirect,
             * wenn die aktuelle Seite bereits
             * eine funktionierende Desktop-Shell besitzt.
             */

            const host =
                document.querySelector(
                    "[data-haldo-desktop-host]"
                );


            if (
                host
            ) {

                const iframe =
                    document.createElement(
                        "iframe"
                    );

                iframe.src =
                    "dashboard.html";

                iframe.title =
                    "HalDo AI OS Dashboard";

                iframe.style.position =
                    "absolute";

                iframe.style.inset =
                    "0";

                iframe.style.width =
                    "100%";

                iframe.style.height =
                    "100%";

                iframe.style.border =
                    "0";

                host.appendChild(
                    iframe
                );

                return true;

            }

        }


        return false;

    }


    /* ========================================================
       READY
       ======================================================== */

    async function finishBoot() {

        setStage(
            "ready",
            100,
            "HalDo AI OS ist bereit."
        );


        state.finished =
            true;

        state.failed =
            false;

        state.finishedAt =
            Date.now();


        /*
         * Bestehende Boot-Strukturen aktualisieren.
         */

        if (
            HalDo.boot
        ) {

            HalDo.boot.stage =
                "ready";

            HalDo.boot.progress =
                100;

            HalDo.boot.finished =
                true;

        }


        emit(
            "system:ready",
            {

                version:
                    HalDo.version,

                build:
                    HalDo.build,

                timestamp:
                    Date.now()

            }
        );


        emit(
            "boot:ready",
            {

                version:
                    HalDo.version,

                timestamp:
                    Date.now()

            }
        );


        emit(
            "bootstrap:ready",
            {

                version:
                    HalDo.version,

                timestamp:
                    Date.now()

            }
        );


        /*
         * Boot Screen ausblenden.
         */

        const bootScreen =
            document.querySelector(
                "[data-haldo-boot]"
            );


        if (
            bootScreen
        ) {

            bootScreen.classList.add(
                "is-finished"
            );

            window.setTimeout(
                () => {

                    bootScreen.remove();

                },
                700
            );

        }


        document.documentElement
            .classList.add(
                "haldo-ready"
            );


        if (
            document.body
        ) {

            document.body.classList.add(
                "haldo-ready"
            );

        }


        return true;

    }


    /* ========================================================
       MAIN BOOT
       ======================================================== */

    async function start() {

        /*
         * Doppelte Starts verhindern.
         */

        if (
            state.started
        ) {

            return state;

        }


        state.started =
            true;

        state.startedAt =
            Date.now();


        try {

            setStage(
                "foundation",
                5,
                "HalDo AI OS wird vorbereitet …"
            );


            /*
             * Kleine Verzögerung,
             * damit bereits geladene Skripte
             * ihre globalen APIs registrieren können.
             */

            await wait(
                25
            );


            await startKernel();


            await wait(
                10
            );


            await initializeStorage();


            await initializeRegistry();


            await initializeSystem();


            await initializeAppManager();


            await initializeRouter();


            await initializeWindowManager();


            await initializeLauncher();


            await initializeAI();


            await openDashboard();


            await finishBoot();


            return state;

        } catch (error) {

            recordError(
                error,
                state.stage
            );


            /*
             * Auch bei einem Fehler wird nicht
             * unendlich im Boot-Zustand gewartet.
             */

            state.failed =
                true;


            emit(
                "boot:failed",
                {

                    error,

                    stage:
                        state.stage

                }
            );


            const text =
                document.querySelector(
                    "[data-boot-message]"
                );


            if (
                text
            ) {

                text.textContent =
                    "HalDo AI OS konnte nicht vollständig gestartet werden.";

            }


            const detail =
                document.querySelector(
                    "[data-boot-detail]"
                );


            if (
                detail
            ) {

                detail.textContent =
                    `${state.stage}: ${
                        error?.message ||
                        "Unbekannter Fehler"
                    }`;

            }


            return state;

        }

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    HalDo.bootstrap.start =
        start;


    HalDo.bootstrap.getState =
        function () {

            return {
                ...state,
                history:
                    [
                        ...state.history
                    ]
            };

        };


    HalDo.bootstrap.restart =
        async function () {

            state.started =
                false;

            state.finished =
                false;

            state.failed =
                false;

            state.stage =
                "foundation";

            state.progress =
                0;

            state.error =
                null;

            return start();

        };


    window.HalDoBootstrap =
        HalDo.bootstrap;


    /* ========================================================
       AUTO START
       ======================================================== */

    function autoStart() {

        /*
         * Wenn der Kernel selbst bereits startet,
         * wartet der Bootstrap kurz darauf.
         */

        if (
            document.readyState ===
            "loading"
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                () => {

                    start();

                },
                {
                    once:
                        true
                }
            );

        } else {

            start();

        }

    }


    /*
     * Global verfügbar machen,
     * bevor der automatische Start beginnt.
     */

    window.HalDo =
        HalDo;


    autoStart();


})(window, document);
