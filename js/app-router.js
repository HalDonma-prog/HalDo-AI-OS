/* ============================================================
   HalDo AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei: js/app-router.js

   Zentrale App-Navigation

   Aufgaben:
   - Apps ohne 404 öffnen
   - interne Module verwalten
   - zukünftige App-Module registrieren
   - App-Ansichten dynamisch laden
   - App-Zustand verwalten
   - Zurück-Navigation
   - Fehler abfangen
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const VERSION = "18.0.0";

    const ROOT_ID =
        "haldo-app-root";

    const EVENT_PREFIX =
        "haldo-router:";


    /* ========================================================
       02 — ZUSTAND
       ======================================================== */

    const state = {

        initialized: false,

        ready: false,

        currentApp: null,

        previousApp: null,

        history: [],

        modules: new Map(),

        loading: false

    };


    /* ========================================================
       03 — LOG
       ======================================================== */

    function log(
        message,
        type = "info"
    ) {

        const prefix =
            "[HalDo App Router]";


        if (
            type === "error"
        ) {

            console.error(
                prefix,
                message
            );

        }
        else if (
            type === "warning"
        ) {

            console.warn(
                prefix,
                message
            );

        }
        else {

            console.log(
                prefix,
                message
            );

        }

    }


    /* ========================================================
       04 — EVENT SYSTEM
       ======================================================== */

    const listeners = {};


    function on(
        eventName,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return false;

        }


        if (
            !listeners[eventName]
        ) {

            listeners[eventName] = [];

        }


        listeners[eventName]
            .push(callback);


        return true;

    }


    function emit(
        eventName,
        data = null
    ) {

        const callbacks =
            listeners[eventName];


        if (
            callbacks
        ) {

            callbacks.forEach(
                callback => {

                    try {

                        callback(data);

                    }
                    catch (error) {

                        log(
                            `Event-Fehler: ${error.message}`,
                            "error"
                        );

                    }

                }
            );

        }


        /*
         * Zusätzlich an Kernel senden.
         */

        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.emit ===
            "function"
        ) {

            window.HalDoKernel.emit(
                `${EVENT_PREFIX}${eventName}`,
                data
            );

        }

    }


    /* ========================================================
       05 — APP ROOT ERSTELLEN
       ======================================================== */

    function getRoot() {

        let root =
            document.getElementById(
                ROOT_ID
            );


        if (
            root
        ) {

            return root;

        }


        /*
         * Wenn index.html bereits einen
         * App-Container besitzt, verwenden.
         */

        root =
            document.querySelector(
                "[data-haldo-app-root]"
            );


        if (
            root
        ) {

            root.id =
                ROOT_ID;

            return root;

        }


        /*
         * Sonst automatisch erstellen.
         */

        root =
            document.createElement(
                "main"
            );


        root.id =
            ROOT_ID;


        root.className =
            "haldo-app-root";


        root.setAttribute(
            "aria-live",
            "polite"
        );


        /*
         * Vor Footer / vor Body-Ende einfügen.
         */

        document.body.appendChild(
            root
        );


        return root;

    }


    /* ========================================================
       06 — HTML SICHERN
       ======================================================== */

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

    }


    /* ========================================================
       07 — APP MODUL REGISTRIEREN
       ======================================================== */

    function registerModule(
        appId,
        module
    ) {

        if (
            !appId
        ) {

            return false;

        }


        if (
            !module
        ) {

            return false;

        }


        state.modules.set(
            appId,
            module
        );


        log(
            `App-Modul registriert: ${appId}`
        );


        emit(
            "module-registered",
            {
                appId,
                module
            }
        );


        return true;

    }


    /* ========================================================
       08 — APP MODUL ABFRAGEN
       ======================================================== */

    function getModule(
        appId
    ) {

        return (
            state.modules.get(
                appId
            ) ||
            null
        );

    }


    function hasModule(
        appId
    ) {

        return state.modules.has(
            appId
        );

    }


    /* ========================================================
       09 — APP AUS MANAGER HOLEN
       ======================================================== */

    function getApp(
        appId
    ) {

        if (
            !window.HalDoAppManager
        ) {

            return null;

        }


        return window.HalDoAppManager
            .getApp(
                appId
            );

    }


    /* ========================================================
       10 — APP HEADER
       ======================================================== */

    function renderHeader(
        app
    ) {

        const icon =
            app.icon || "◇";


        let iconHTML;


        if (
            /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i
                .test(icon)
        ) {

            iconHTML = `
                <img
                    src="${escapeHTML(icon)}"
                    alt=""
                    class="haldo-router-app-icon"
                >
            `;

        }
        else {

            iconHTML = `
                <span
                    class="haldo-router-app-icon-text"
                >
                    ${escapeHTML(icon)}
                </span>
            `;

        }


        return `
            <header
                class="haldo-router-header"
            >

                <button
                    type="button"
                    class="haldo-router-back"
                    id="haldo-router-back"
                    aria-label="Zurück"
                >
                    ←
                </button>

                <div
                    class="haldo-router-title"
                >

                    <div
                        class="haldo-router-icon"
                    >
                        ${iconHTML}
                    </div>

                    <div>

                        <h1>
                            ${escapeHTML(
                                app.title ||
                                app.name
                            )}
                        </h1>

                        <p>
                            ${escapeHTML(
                                app.description ||
                                "HalDo AI OS App"
                            )}
                        </p>

                    </div>

                </div>

            </header>
        `;

    }


    /* ========================================================
       11 — APP PLACEHOLDER
       ======================================================== */

    function renderComingSoon(
        app
    ) {

        const root =
            getRoot();


        root.innerHTML = `

            ${renderHeader(app)}

            <section
                class="haldo-app-placeholder"
            >

                <div
                    class="haldo-app-placeholder-orb"
                    aria-hidden="true"
                >
                    ${escapeHTML(
                        app.icon ||
                        "◇"
                    )}
                </div>

                <h2>
                    ${escapeHTML(
                        app.title ||
                        app.name
                    )}
                </h2>

                <p>
                    Diese App ist bereits Bestandteil
                    der HalDo AI OS 18 Foundation.
                </p>

                <p>
                    Das vollständige Funktionsmodul
                    wird als nächster Entwicklungsschritt
                    angeschlossen.
                </p>

                <div
                    class="haldo-app-status"
                >
                    <span></span>
                    Modul vorbereitet
                </div>

                <button
                    type="button"
                    id="haldo-placeholder-back"
                    class="haldo-primary-button"
                >
                    Zurück zum Menü
                </button>

            </section>

        `;


        bindBackButtons();

    }


    /* ========================================================
       12 — MODUL AUSFÜHREN
       ======================================================== */

    async function executeModule(
        app,
        module
    ) {

        const root =
            getRoot();


        /*
         * Modul kann unterschiedliche
         * Schnittstellen anbieten.
         */

        try {

            if (
                typeof module ===
                "function"
            ) {

                await module(
                    root,
                    app,
                    api
                );

                return true;

            }


            if (
                typeof module.mount ===
                "function"
            ) {

                await module.mount(
                    root,
                    app,
                    api
                );

                return true;

            }


            if (
                typeof module.open ===
                "function"
            ) {

                await module.open(
                    root,
                    app,
                    api
                );

                return true;

            }


            if (
                typeof module.render ===
                "function"
            ) {

                const result =
                    await module.render(
                        root,
                        app,
                        api
                    );


                if (
                    typeof result ===
                    "string"
                ) {

                    root.innerHTML =
                        result;

                    bindBackButtons();

                }


                return true;

            }


            log(
                `App-Modul "${app.id}" besitzt keine gültige mount/open/render-Funktion.`,
                "warning"
            );


            return false;

        }
        catch (error) {

            log(
                `Fehler beim Öffnen von "${app.name}": ${error.message}`,
                "error"
            );


            renderModuleError(
                app,
                error
            );


            return false;

        }

    }


    /* ========================================================
       13 — MODUL FEHLER
       ======================================================== */

    function renderModuleError(
        app,
        error
    ) {

        const root =
            getRoot();


        root.innerHTML = `

            ${renderHeader(app)}

            <section
                class="haldo-app-error"
            >

                <div
                    class="haldo-app-error-icon"
                >
                    !
                </div>

                <h2>
                    App konnte nicht geöffnet werden
                </h2>

                <p>
                    Das App-Modul von
                    <strong>
                        ${escapeHTML(
                            app.name
                        )}
                    </strong>
                    hat einen Fehler gemeldet.
                </p>

                <details>
                    <summary>
                        Technische Information
                    </summary>

                    <pre>${escapeHTML(
                        error?.message ||
                        "Unbekannter Fehler"
                    )}</pre>

                </details>

                <button
                    type="button"
                    id="haldo-error-back"
                    class="haldo-primary-button"
                >
                    Zurück zum Menü
                </button>

            </section>

        `;


        bindBackButtons();

    }


    /* ========================================================
       14 — ZURÜCK
       ======================================================== */

    function bindBackButtons() {

        const buttons =
            document.querySelectorAll(
                "#haldo-router-back, #haldo-placeholder-back, #haldo-error-back"
            );


        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        back();

                    }
                );

            }
        );

    }


    function back() {

        const previous =
            state.history.pop();


        if (
            previous
        ) {

            open(
                previous,
                false
            );

            return true;

        }


        close();

        return true;

    }


    /* ========================================================
       15 — APP ÖFFNEN
       ======================================================== */

    async function open(
        appId,
        saveHistory = true
    ) {

        const app =
            getApp(
                appId
            );


        if (
            !app
        ) {

            log(
                `App nicht gefunden: ${appId}`,
                "warning"
            );


            return false;

        }


        if (
            app.enabled === false
        ) {

            renderComingSoon(
                app
            );

            return false;

        }


        if (
            saveHistory &&
            state.currentApp &&
            state.currentApp.id !==
                app.id
        ) {

            state.history.push(
                state.currentApp.id
            );

        }


        state.previousApp =
            state.currentApp;


        state.currentApp =
            app;


        state.loading =
            true;


        emit(
            "before-open",
            {
                app
            }
        );


        const root =
            getRoot();


        root.hidden =
            false;


        /*
         * Vorherigen Inhalt entfernen.
         */

        root.innerHTML = "";


        /*
         * Echtes Modul vorhanden?
         */

        const module =
            getModule(
                app.id
            );


        if (
            module
        ) {

            const success =
                await executeModule(
                    app,
                    module
                );


            if (
                !success
            ) {

                renderComingSoon(
                    app
                );

            }

        }
        else {

            /*
             * Ganz wichtig:
             *
             * KEIN window.location.href
             * KEIN erfundener Pfad
             * KEIN 404.
             */

            renderComingSoon(
                app
            );

        }


        state.loading =
            false;


        state.ready =
            true;


        emit(
            "opened",
            {
                app
            }
        );


        log(
            `App geöffnet: ${app.name}`
        );


        return true;

    }


    /* ========================================================
       16 — APP SCHLIESSEN
       ======================================================== */

    function close() {

        const root =
            getRoot();


        root.innerHTML =
            "";


        root.hidden =
            true;


        const previous =
            state.currentApp;


        state.currentApp =
            null;


        emit(
            "closed",
            {
                app:
                    previous
            }
        );


        /*
         * Launcher wieder anzeigen.
         */

        const launcher =
            document.querySelector(
                "#haldo-launcher"
            );


        if (
            launcher
        ) {

            launcher.hidden =
                false;

        }


        log(
            "App geschlossen."
        );


        return true;

    }


    /* ========================================================
       17 — LAUNCHER VERSTECKEN
       ======================================================== */

    function hideLauncher() {

        const launcher =
            document.querySelector(
                "#haldo-launcher"
            );


        if (
            launcher
        ) {

            launcher.hidden =
                true;

        }

    }


    /* ========================================================
       18 — ROUTER STATE
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            loading:
                state.loading,

            currentApp:
                state.currentApp,

            previousApp:
                state.previousApp,

            history:
                [
                    ...state.history
                ],

            moduleCount:
                state.modules.size

        };

    }


    /* ========================================================
       19 — INITIALISIERUNG
       ======================================================== */

    function init() {

        if (
            state.initialized
        ) {

            return true;

        }


        getRoot();


        state.initialized =
            true;

        state.ready =
            true;


        /*
         * Kernel registrieren.
         */

        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.registerModule ===
            "function"
        ) {

            window.HalDoKernel.registerModule(
                "app-router",
                api
            );

        }


        emit(
            "ready"
        );


        log(
            "App Router ist bereit."
        );


        return true;

    }


    /* ========================================================
       20 — KERNEL VERBINDEN
       ======================================================== */

    function connectKernel() {

        if (
            window.HalDoKernel
        ) {

            init();

            return;

        }


        window.setTimeout(
            connectKernel,
            100
        );

    }


    /* ========================================================
       21 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            "HalDo App Router",

        version:
            VERSION,


        init,

        open,

        close,

        back,


        registerModule,

        getModule,

        hasModule,


        getApp,

        getState,


        on,

        emit

    };


    /* ========================================================
       22 — GLOBAL
       ======================================================== */

    window.HalDoAppRouter =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appRouter =
        api;


    /* ========================================================
       23 — START
       ======================================================== */

    function start() {

        connectKernel();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start,
            {
                once: true
            }
        );

    }
    else {

        start();

    }


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 APP ROUTER
   ============================================================ */