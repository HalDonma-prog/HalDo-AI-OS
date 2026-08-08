/* ============================================================
   HalDo AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei: js/app-router.js

   Zentrale App-Navigation

   WICHTIG:
   Dieser Router öffnet keine unbekannten .html-Dateien.
   Dadurch werden 404-Fehler durch falsche App-Pfade
   verhindert.

   Aufgaben:
   - Apps öffnen
   - Apps schließen
   - App-Module verwalten
   - App-Ansichten verwalten
   - sichere Fallback-Oberfläche
   - Browser-History
   - Back-Button
   - Router-Events
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const VERSION =
        "18.0.0";


    const ROOT_SELECTOR =
        "#haldo-app-root";


    const LAUNCHER_SELECTOR =
        "#haldo-launcher";


    const HOME_SELECTOR =
        "#haldo-home";


    /* ========================================================
       02 — STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        currentApp:
            null,

        previousApp:
            null,

        history:
            [],

        modules:
            new Map(),

        views:
            new Map(),

        navigationLocked:
            false

    };


    /* ========================================================
       03 — EVENTS
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

            listeners[eventName] =
                [];

        }


        listeners[eventName].push(
            callback
        );


        return true;

    }


    function off(
        eventName,
        callback
    ) {

        if (
            !listeners[eventName]
        ) {

            return false;

        }


        listeners[eventName] =
            listeners[eventName]
                .filter(
                    listener =>
                        listener !==
                        callback
                );


        return true;

    }


    function emit(
        eventName,
        data = null
    ) {

        const callbacks =
            listeners[eventName];


        if (
            !callbacks
        ) {

            return;

        }


        callbacks
            .slice()
            .forEach(
                callback => {

                    try {

                        callback(
                            data
                        );

                    }
                    catch (
                        error
                    ) {

                        console.error(
                            "[HalDo App Router] Event-Fehler:",
                            error
                        );

                    }

                }
            );

    }


    /* ========================================================
       04 — LOG
       ======================================================== */

    function log(
        message,
        type = "info"
    ) {

        const prefix =
            "[HalDo App Router]";


        if (
            type ===
            "error"
        ) {

            console.error(
                prefix,
                message
            );

        }
        else if (
            type ===
            "warning"
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
       05 — DOM
       ======================================================== */

    function getRoot() {

        return document.querySelector(
            ROOT_SELECTOR
        );

    }


    function getLauncher() {

        return document.querySelector(
            LAUNCHER_SELECTOR
        );

    }


    function getHome() {

        return document.querySelector(
            HOME_SELECTOR
        );

    }


    /* ========================================================
       06 — HTML ESCAPEN
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
       07 — APP MANAGER
       ======================================================== */

    function getAppManager() {

        return (
            window.HalDoAppManager ||
            null
        );

    }


    function getApp(
        appId
    ) {

        const manager =
            getAppManager();


        if (
            !manager
        ) {

            return null;

        }


        return manager.getApp(
            appId
        );

    }


    /* ========================================================
       08 — APP MODUL REGISTRIEREN
       ======================================================== */

    function registerModule(
        appId,
        module
    ) {

        const id =
            normalizeId(
                appId
            );


        if (
            !id ||
            !module
        ) {

            return false;

        }


        state.modules.set(
            id,
            module
        );


        emit(
            "module:registered",
            {
                appId:
                    id,

                module
            }
        );


        log(
            `App-Modul registriert: ${id}`
        );


        return true;

    }


    /* ========================================================
       09 — APP MODUL ENTFERNEN
       ======================================================== */

    function unregisterModule(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        return state.modules.delete(
            id
        );

    }


    /* ========================================================
       10 — MODUL ABFRAGEN
       ======================================================== */

    function getModule(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        return (
            state.modules.get(
                id
            ) ||
            null
        );

    }


    /* ========================================================
       11 — ID NORMALISIEREN
       ======================================================== */

    function normalizeId(
        value
    ) {

        return String(
            value || ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );

    }


    /* ========================================================
       12 — HOME VERSTECKEN
       ======================================================== */

    function hideHome() {

        const home =
            getHome();


        if (
            home
        ) {

            home.hidden =
                true;

        }

    }


    /* ========================================================
       13 — HOME ZEIGEN
       ======================================================== */

    function showHome() {

        const home =
            getHome();


        if (
            home
        ) {

            home.hidden =
                false;

        }

    }


    /* ========================================================
       14 — LAUNCHER VERSTECKEN
       ======================================================== */

    function hideLauncher() {

        const launcher =
            getLauncher();


        if (
            launcher
        ) {

            launcher.hidden =
                true;

        }

    }


    /* ========================================================
       15 — LAUNCHER ZEIGEN
       ======================================================== */

    function showLauncher() {

        const launcher =
            getLauncher();


        if (
            launcher
        ) {

            launcher.hidden =
                false;

        }

    }


    /* ========================================================
       16 — ROOT SICHTBAR
       ======================================================== */

    function showRoot() {

        const root =
            getRoot();


        if (
            root
        ) {

            root.hidden =
                false;

        }

    }


    /* ========================================================
       17 — ROOT VERSTECKEN
       ======================================================== */

    function hideRoot() {

        const root =
            getRoot();


        if (
            root
        ) {

            root.hidden =
                true;

        }

    }


    /* ========================================================
       18 — APP ÖFFNEN
       ======================================================== */

    async function open(
        appId,
        options = {}
    ) {

        if (
            state.navigationLocked
        ) {

            return false;

        }


        const id =
            normalizeId(
                appId
            );


        if (
            !id
        ) {

            return false;

        }


        const app =
            getApp(
                id
            );


        if (
            !app
        ) {

            log(
                `App '${id}' wurde nicht gefunden.`,
                "warning"
            );


            openFallback(
                id,
                "Die angeforderte App ist noch nicht registriert."
            );


            return false;

        }


        if (
            app.enabled ===
            false
        ) {

            openFallback(
                id,
                "Diese App ist momentan deaktiviert."
            );


            return false;

        }


        state.navigationLocked =
            true;


        try {

            /*
             * Vorherige App merken.
             */

            if (
                state.currentApp &&
                state.currentApp.id !==
                    app.id
            ) {

                state.previousApp =
                    state.currentApp;

            }


            state.currentApp =
                app;


            /*
             * History.
             */

            if (
                options.addHistory !==
                false
            ) {

                pushHistory(
                    app.id
                );

            }


            hideHome();
            hideLauncher();
            showRoot();


            /*
             * Registriertes Modul?
             */

            const module =
                getModule(
                    app.id
                );


            if (
                module
            ) {

                await openModule(
                    app,
                    module,
                    options
                );

            }
            else {

                /*
                 * Kein Modul:
                 * sichere interne Ansicht.
                 *
                 * KEIN window.location.href.
                 * KEIN blindes .html.
                 */

                await openFallback(
                    app.id,
                    null,
                    app
                );

            }


            updateDocumentState(
                app
            );


            emit(
                "opened",
                {
                    app,

                    options

                }
            );


            return true;

        }
        catch (
            error
        ) {

            console.error(
                "[HalDo App Router]",
                error
            );


            openFallback(
                app.id,
                "Beim Öffnen der App ist ein Fehler aufgetreten.",
                app
            );


            emit(
                "error",
                {
                    app,

                    error

                }
            );


            return false;

        }
        finally {

            state.navigationLocked =
                false;

        }

    }


    /* ========================================================
       19 — MODUL ÖFFNEN
       ======================================================== */

    async function openModule(
        app,
        module,
        options
    ) {

        const root =
            getRoot();


        if (
            !root
        ) {

            throw new Error(
                "HalDo App Root wurde nicht gefunden."
            );

        }


        /*
         * Vorherige Ansicht leeren.
         */

        root.innerHTML =
            "";


        /*
         * Modul kann open() besitzen.
         */

        if (
            typeof module.open ===
            "function"
        ) {

            const result =
                module.open(
                    {
                        app,

                        root,

                        options,

                        router:
                            api

                    }
                );


            if (
                result &&
                typeof result.then ===
                "function"
            ) {

                await result;

            }


            return;

        }


        /*
         * Modul kann render() besitzen.
         */

        if (
            typeof module.render ===
            "function"
        ) {

            const result =
                module.render(
                    root,
                    {
                        app,

                        options,

                        router:
                            api

                    }
                );


            if (
                result &&
                typeof result.then ===
                "function"
            ) {

                await result;

            }


            return;

        }


        /*
         * Modul besitzt nur element().
         */

        if (
            typeof module.create ===
            "function"
        ) {

            const element =
                module.create(
                    {
                        app,

                        options,

                        router:
                            api

                    }
                );


            if (
                element instanceof
                Node
            ) {

                root.appendChild(
                    element
                );

            }


            return;

        }


        /*
         * Kein passendes Modul.
         */

        openFallback(
            app.id,
            "Das App-Modul ist noch nicht vollständig initialisiert.",
            app
        );

    }


    /* ========================================================
       20 — FALLBACK
       ======================================================== */

    function openFallback(
        appId,
        message = null,
        app = null
    ) {

        const root =
            getRoot();


        if (
            !root
        ) {

            return false;

        }


        showRoot();
        hideHome();
        hideLauncher();


        const currentApp =
            app ||
            getApp(
                appId
            );


        const title =
            currentApp?.title ||
            currentApp?.name ||
            "HalDo AI App";


        const description =
            currentApp?.description ||
            "Diese HalDo AI Anwendung wird vorbereitet.";


        const icon =
            currentApp?.icon ||
            "◇";


        const statusText =
            message ||
            "Die App ist registriert und wartet auf ihr Modul.";


        root.innerHTML = `

            <section
                class="haldo-app-fallback"
                data-app-id="${escapeHTML(
                    appId
                )}"
            >

                <div
                    class="haldo-app-fallback-card"
                >

                    <div
                        class="haldo-app-fallback-icon"
                    >
                        ${
                            isImageIcon(icon)
                                ? `
                                    <img
                                        src="${escapeHTML(icon)}"
                                        alt=""
                                    >
                                `
                                : escapeHTML(
                                    icon
                                )
                        }
                    </div>


                    <div
                        class="haldo-app-fallback-content"
                    >

                        <p
                            class="haldo-section-label"
                        >
                            HALDO AI OS
                        </p>

                        <h1>
                            ${escapeHTML(
                                title
                            )}
                        </h1>

                        <p>
                            ${escapeHTML(
                                description
                            )}
                        </p>

                        <div
                            class="haldo-app-fallback-status"
                        >
                            <span>
                                ●
                            </span>

                            ${escapeHTML(
                                statusText
                            )}
                        </div>

                        <div
                            class="haldo-app-fallback-actions"
                        >

                            <button
                                type="button"
                                class="haldo-primary-button"
                                data-router-back
                            >
                                Zurück
                            </button>

                            <button
                                type="button"
                                class="haldo-secondary-button"
                                data-router-apps
                            >
                                Alle Apps
                            </button>

                        </div>

                    </div>

                </div>

            </section>

        `;


        bindFallbackButtons();


        return true;

    }


    /* ========================================================
       21 — ICON PRÜFEN
       ======================================================== */

    function isImageIcon(
        icon
    ) {

        return /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i
            .test(
                String(
                    icon || ""
                )
            );

    }


    /* ========================================================
       22 — FALLBACK BUTTONS
       ======================================================== */

    function bindFallbackButtons() {

        const root =
            getRoot();


        if (
            !root
        ) {

            return;

        }


        const back =
            root.querySelector(
                "[data-router-back]"
            );


        const apps =
            root.querySelector(
                "[data-router-apps]"
            );


        if (
            back
        ) {

            back.addEventListener(
                "click",
                function () {

                    backNavigation();

                }
            );

        }


        if (
            apps
        ) {

            apps.addEventListener(
                "click",
                function () {

                    close();

                }
            );

        }

    }


    /* ========================================================
       23 — HISTORY
       ======================================================== */

    function pushHistory(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (
            !id
        ) {

            return;

        }


        const last =
            state.history[
                state.history.length - 1
            ];


        if (
            last === id
        ) {

            return;

        }


        state.history.push(
            id
        );


        /*
         * History begrenzen.
         */

        if (
            state.history.length >
            50
        ) {

            state.history.shift();

        }

    }


    /* ========================================================
       24 — ZURÜCK
       ======================================================== */

    async function backNavigation() {

        if (
            state.navigationLocked
        ) {

            return false;

        }


        /*
         * Aktuellen Eintrag entfernen.
         */

        if (
            state.history.length >
            0
        ) {

            state.history.pop();

        }


        const previousId =
            state.history[
                state.history.length - 1
            ];


        if (
            previousId
        ) {

            return open(
                previousId,
                {
                    addHistory:
                        false
                }
            );

        }


        close();


        return true;

    }


    /* ========================================================
       25 — APP SCHLIESSEN
       ======================================================== */

    function close(
        options = {}
    ) {

        const oldApp =
            state.currentApp;


        state.previousApp =
            state.currentApp;


        state.currentApp =
            null;


        state.history =
            [];


        hideRoot();
        showHome();
        showLauncher();


        updateDocumentState(
            null
        );


        if (
            options.clearRoot !==
            false
        ) {

            const root =
                getRoot();


            if (
                root
            ) {

                root.innerHTML =
                    "";

            }

        }


        emit(
            "closed",
            {
                app:
                    oldApp
            }
        );


        return true;

    }


    /* ========================================================
       26 — HOME
       ======================================================== */

    function goHome() {

        return close();

    }


    /* ========================================================
       27 — ALLE APPS
       ======================================================== */

    function goApps() {

        const launcher =
            getLauncher();


        if (
            launcher
        ) {

            launcher.hidden =
                false;

            launcher.scrollIntoView(
                {
                    behavior:
                        "smooth",

                    block:
                        "start"
                }
            );

        }


        hideHome();
        hideRoot();


        emit(
            "apps",
            {}
        );


        return true;

    }


    /* ========================================================
       28 — DOKUMENT STATUS
       ======================================================== */

    function updateDocumentState(
        app
    ) {

        if (
            app
        ) {

            document.body.dataset.activeApp =
                app.id;


            document.title =
                `${app.title || app.name} — HalDo AI OS 18`;

        }
        else {

            delete document.body.dataset.activeApp;


            document.title =
                "HalDo AI OS 18";

        }

    }


    /* ========================================================
       29 — AKTUELLE APP
       ======================================================== */

    function getCurrentApp() {

        return (
            state.currentApp
                ? {
                    ...state.currentApp
                }
                : null
        );

    }


    /* ========================================================
       30 — STATUS
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            currentApp:
                getCurrentApp(),

            previousApp:
                state.previousApp
                    ? {
                        ...state.previousApp
                    }
                    : null,

            history:
                [
                    ...state.history
                ],

            moduleCount:
                state.modules.size,

            navigationLocked:
                state.navigationLocked

        };

    }


    /* ========================================================
       31 — INITIALISIERUNG
       ======================================================== */

    function init() {

        if (
            state.initialized
        ) {

            return getState();

        }


        state.initialized =
            true;


        /*
         * Browser Back Button.
         *
         * Wir verhindern bewusst,
         * dass der Browser plötzlich
         * eine falsche .html-Datei lädt.
         */

        window.addEventListener(
            "popstate",
            function () {

                backNavigation();

            }
        );


        /*
         * Escape schließt die aktuelle App.
         */

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !==
                    "Escape"
                ) {

                    return;

                }


                if (
                    state.currentApp
                ) {

                    close();

                }

            }
        );


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

            window.HalDoKernel.setModuleReady(
                "app-router",
                true
            );

        }


        emit(
            "ready",
            getState()
        );


        log(
            "App Router ist bereit."
        );


        return getState();

    }


    /* ========================================================
       32 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            "HalDo App Router",

        version:
            VERSION,


        init,


        open,

        close,

        goHome,

        goApps,

        back:
            backNavigation,


        registerModule,

        unregisterModule,

        getModule,


        getCurrentApp,

        getState,


        on,

        off,

        emit

    };


    /* ========================================================
       33 — GLOBAL
       ======================================================== */

    window.HalDoAppRouter =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.router =
        api;


    /* ========================================================
       34 — START
       ======================================================== */

    function start() {

        init();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start,
            {
                once:
                    true
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