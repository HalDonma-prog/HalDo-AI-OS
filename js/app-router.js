/* ============================================================
   HALDO AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei:
   js/app-router.js

   Zentrale Navigation für HalDo AI OS 18

   Ziele:
   - Keine unnötigen 404-Fehler
   - Keine verstreuten .html-Links
   - Zentrale App-Navigation
   - App-Module über IDs öffnen
   - Browser-History unterstützen
   - Zurück-Navigation unterstützen
   - Deep Links vorbereiten
   - Sicherer Fallback für noch nicht fertige Apps
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const CONFIG = {

        name:
            "HalDo App Router",

        version:
            "18.0.0",

        defaultApp:
            "ai-chat",

        rootSelector:
            "#app-root",

        routePrefix:
            "#/app/",

        homeRoute:
            "#/home",

        loadingDelay:
            120,

        transitionDuration:
            180

    };


    /* ========================================================
       02 — STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        navigating:
            false,

        currentRoute:
            CONFIG.homeRoute,

        currentAppId:
            null,

        previousRoute:
            null,

        historyLocked:
            false,

        errors:
            []

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
                    item =>
                        item !==
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
                            "[HalDo Router] Event-Fehler:",
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
            "[HalDo Router]";


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
       05 — ROOT ELEMENT
       ======================================================== */

    function getRoot() {

        let root =
            document.querySelector(
                CONFIG.rootSelector
            );


        /*
         * Falls index.html den Container
         * noch nicht besitzt, erzeugen wir
         * ihn automatisch.
         */

        if (
            !root
        ) {

            root =
                document.createElement(
                    "main"
                );


            root.id =
                "app-root";


            document.body.appendChild(
                root
            );

        }


        return root;

    }


    /* ========================================================
       06 — ID NORMALISIEREN
       ======================================================== */

    function normalizeAppId(
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
       07 — ROUTE ERSTELLEN
       ======================================================== */

    function createAppRoute(
        appId
    ) {

        const id =
            normalizeAppId(
                appId
            );


        if (
            !id
        ) {

            return CONFIG.homeRoute;

        }


        return (
            CONFIG.routePrefix +
            encodeURIComponent(
                id
            )
        );

    }


    /* ========================================================
       08 — ROUTE PARSEN
       ======================================================== */

    function parseRoute(
        route
    ) {

        const value =
            String(
                route ||
                ""
            )
            .trim();


        if (
            !value
        ) {

            return {

                type:
                    "home",

                route:
                    CONFIG.homeRoute,

                appId:
                    null

            };

        }


        /*
         * Home
         */

        if (
            value ===
            CONFIG.homeRoute ||
            value ===
            "#" ||
            value ===
            ""
        ) {

            return {

                type:
                    "home",

                route:
                    CONFIG.homeRoute,

                appId:
                    null

            };

        }


        /*
         * App Route
         */

        if (
            value.indexOf(
                CONFIG.routePrefix
            ) ===
            0
        ) {

            const encodedId =
                value.substring(
                    CONFIG.routePrefix.length
                );


            let appId =
                "";


            try {

                appId =
                    decodeURIComponent(
                        encodedId
                    );

            }
            catch (
                error
            ) {

                appId =
                    encodedId;

            }


            appId =
                normalizeAppId(
                    appId
                );


            return {

                type:
                    "app",

                route:
                    createAppRoute(
                        appId
                    ),

                appId

            };

        }


        /*
         * Unbekannte Route
         */

        return {

            type:
                "unknown",

            route:
                value,

            appId:
                null

        };

    }


    /* ========================================================
       09 — APP MANAGER
       ======================================================== */

    function getAppManager() {

        return (
            window.HalDoAppManager ||
            null
        );

    }


    /* ========================================================
       10 — APP ABFRAGEN
       ======================================================== */

    function getApp(
        appId
    ) {

        const manager =
            getAppManager();


        if (
            manager &&
            typeof manager.getApp ===
                "function"
        ) {

            return manager.getApp(
                appId
            );

        }


        return null;

    }


    /* ========================================================
       11 — APP MODUL ABFRAGEN
       ======================================================== */

    function getAppModule(
        appId
    ) {

        const manager =
            getAppManager();


        if (
            manager &&
            typeof manager.getModule ===
                "function"
        ) {

            return manager.getModule(
                appId
            );

        }


        return null;

    }


    /* ========================================================
       12 — TRANSITION
       ======================================================== */

    function transitionStart(
        root
    ) {

        if (
            !root
        ) {

            return;

        }


        root.classList.add(
            "haldo-route-loading"
        );

    }


    function transitionEnd(
        root
    ) {

        if (
            !root
        ) {

            return;

        }


        window.setTimeout(
            function () {

                root.classList.remove(
                    "haldo-route-loading"
                );

                root.classList.add(
                    "haldo-route-ready"
                );


                window.setTimeout(
                    function () {

                        root.classList.remove(
                            "haldo-route-ready"
                        );

                    },
                    CONFIG.transitionDuration
                );

            },
            CONFIG.loadingDelay
        );

    }


    /* ========================================================
       13 — HOME RENDER
       ======================================================== */

    function renderHome() {

        const root =
            getRoot();


        transitionStart(
            root
        );


        root.innerHTML = `

            <section
                class="haldo-home-view"
                data-view="home"
            >

                <div
                    class="haldo-home-content"
                >

                    <div
                        class="haldo-home-logo"
                    >
                        <img
                            src="assets/logo/logo.png"
                            alt="HalDo AI"
                            onerror="
                                this.style.display='none';
                            "
                        >
                    </div>


                    <div
                        class="haldo-home-text"
                    >

                        <h1>
                            HalDo AI OS 18
                        </h1>

                        <p>
                            Willkommen im
                            HalDo AI Betriebssystem.
                        </p>

                    </div>

                </div>

            </section>

        `;


        transitionEnd(
            root
        );


        emit(
            "home:rendered"
        );

    }


    /* ========================================================
       14 — APP LOADING
       ======================================================== */

    function renderLoading(
        app
    ) {

        const root =
            getRoot();


        transitionStart(
            root
        );


        const icon =
            app &&
            app.icon
                ? app.icon
                : "◇";


        const title =
            app &&
            app.title
                ? app.title
                : "HalDo App";


        root.innerHTML = `

            <section
                class="haldo-app-loading"
                data-view="loading"
            >

                <div
                    class="haldo-loading-orb"
                >

                    ${
                        icon.endsWith &&
                        icon.endsWith(".png")
                            ? `
                                <img
                                    src="${escapeHtml(icon)}"
                                    alt=""
                                >
                              `
                            : `
                                <span>
                                    ${escapeHtml(icon)}
                                </span>
                              `
                    }

                </div>


                <h2>
                    ${escapeHtml(title)}
                </h2>


                <p>
                    HalDo AI lädt das Modul …
                </p>


                <div
                    class="haldo-loading-bar"
                    aria-hidden="true"
                >
                    <span></span>
                </div>

            </section>

        `;


        transitionEnd(
            root
        );

    }


    /* ========================================================
       15 — APP FALLBACK
       ======================================================== */

    function renderAppFallback(
        app
    ) {

        const root =
            getRoot();


        transitionStart(
            root
        );


        const title =
            app &&
            app.title
                ? app.title
                : "HalDo App";


        const description =
            app &&
            app.description
                ? app.description
                : "Dieses Modul wird vorbereitet.";


        const icon =
            app &&
            app.icon
                ? app.icon
                : "◇";


        root.innerHTML = `

            <section
                class="haldo-app-placeholder"
                data-view="app-placeholder"
            >

                <div
                    class="haldo-placeholder-card"
                >

                    <div
                        class="haldo-placeholder-icon"
                    >

                        ${
                            icon.endsWith &&
                            icon.endsWith(".png")
                                ? `
                                    <img
                                        src="${escapeHtml(icon)}"
                                        alt="HalDo AI"
                                    >
                                  `
                                : `
                                    <span>
                                        ${escapeHtml(icon)}
                                    </span>
                                  `
                        }

                    </div>


                    <div
                        class="haldo-placeholder-content"
                    >

                        <span
                            class="haldo-placeholder-label"
                        >
                            HALDO AI OS 18
                        </span>


                        <h1>
                            ${escapeHtml(title)}
                        </h1>


                        <p>
                            ${escapeHtml(description)}
                        </p>


                        <div
                            class="haldo-placeholder-status"
                        >

                            <span
                                class="haldo-status-dot"
                            ></span>

                            Modul wird vorbereitet

                        </div>


                        <button
                            type="button"
                            class="haldo-back-button"
                            data-action="router-home"
                        >
                            Zur Startseite
                        </button>

                    </div>

                </div>

            </section>

        `;


        const backButton =
            root.querySelector(
                '[data-action="router-home"]'
            );


        if (
            backButton
        ) {

            backButton.addEventListener(
                "click",
                function () {

                    navigateHome();

                }
            );

        }


        transitionEnd(
            root
        );


        emit(
            "app:placeholder",
            {
                app:
                    app
            }
        );

    }


    /* ========================================================
       16 — APP MODUL RENDERN
       ======================================================== */

    async function renderApp(
        app
    ) {

        if (
            !app
        ) {

            return false;

        }


        const root =
            getRoot();


        const module =
            getAppModule(
                app.id
            );


        /*
         * Noch kein echtes Modul:
         * Kein 404!
         */

        if (
            !module
        ) {

            renderAppFallback(
                app
            );

            return true;

        }


        try {

            renderLoading(
                app
            );


            /*
             * Modul als Funktion
             */

            if (
                typeof module ===
                "function"
            ) {

                const result =
                    await module(
                        {
                            app,

                            root,

                            router:
                                api

                        }
                    );


                if (
                    typeof result ===
                    "string"
                ) {

                    root.innerHTML =
                        result;

                }

            }


            /*
             * Modul mit render()
             */

            else if (
                typeof module.render ===
                "function"
            ) {

                const result =
                    await module.render(
                        {
                            app,

                            root,

                            router:
                                api

                        }
                    );


                if (
                    typeof result ===
                    "string"
                ) {

                    root.innerHTML =
                        result;

                }

            }


            /*
             * Modul mit mount()
             */

            else if (
                typeof module.mount ===
                "function"
            ) {

                await module.mount(
                    root,
                    {
                        app,

                        router:
                            api

                    }
                );

            }


            else {

                renderAppFallback(
                    app
                );

                return true;

            }


            transitionEnd(
                root
            );


            emit(
                "app:rendered",
                {
                    app:
                        app
                }
            );


            return true;

        }
        catch (
            error
        ) {

            state.errors.push(
                {
                    appId:
                        app.id,

                    error:
                        error.message,

                    timestamp:
                        new Date()
                            .toISOString()
                }
            );


            log(
                `Fehler beim Laden von ${app.id}: ${error.message}`,
                "error"
            );


            renderError(
                app,
                error
            );


            return false;

        }

    }


    /* ========================================================
       17 — FEHLERANSICHT
       ======================================================== */

    function renderError(
        app,
        error
    ) {

        const root =
            getRoot();


        const title =
            app &&
            app.title
                ? app.title
                : "HalDo App";


        root.innerHTML = `

            <section
                class="haldo-app-error"
                data-view="error"
            >

                <div
                    class="haldo-error-card"
                >

                    <div
                        class="haldo-error-icon"
                    >
                        !
                    </div>


                    <h1>
                        ${escapeHtml(title)}
                    </h1>


                    <p>
                        Das App-Modul konnte
                        nicht geladen werden.
                    </p>


                    <details>

                        <summary>
                            Technische Information
                        </summary>

                        <pre>${escapeHtml(
                            error &&
                            error.message
                                ? error.message
                                : "Unbekannter Fehler"
                        )}</pre>

                    </details>


                    <button
                        type="button"
                        data-action="router-home"
                    >
                        Zur Startseite
                    </button>

                </div>

            </section>

        `;


        const button =
            root.querySelector(
                '[data-action="router-home"]'
            );


        if (
            button
        ) {

            button.addEventListener(
                "click",
                navigateHome
            );

        }


        emit(
            "app:error",
            {
                app,
                error
            }
        );

    }


    /* ========================================================
       18 — NAVIGATION
       ======================================================== */

    async function navigate(
        destination,
        options = {}
    ) {

        if (
            state.navigating
        ) {

            return false;

        }


        const parsed =
            typeof destination ===
            "object"
                ? destination
                : parseRoute(
                    destination
                );


        state.navigating =
            true;


        try {

            if (
                parsed.type ===
                "home"
            ) {

                state.previousRoute =
                    state.currentRoute;

                state.currentRoute =
                    CONFIG.homeRoute;

                state.currentAppId =
                    null;


                if (
                    options.history !==
                    false
                ) {

                    updateHash(
                        CONFIG.homeRoute,
                        options.replace
                    );

                }


                renderHome();


                emit(
                    "route:changed",
                    {
                        route:
                            CONFIG.homeRoute,

                        type:
                            "home",

                        appId:
                            null

                    }
                );


                return true;

            }


            if (
                parsed.type ===
                "app"
            ) {

                const app =
                    getApp(
                        parsed.appId
                    );


                /*
                 * Unbekannte App:
                 * Kein 404.
                 */

                if (
                    !app
                ) {

                    log(
                        `App nicht registriert: ${parsed.appId}`,
                        "warning"
                    );


                    state.previousRoute =
                        state.currentRoute;

                    state.currentRoute =
                        CONFIG.homeRoute;

                    state.currentAppId =
                        null;


                    if (
                        options.history !==
                        false
                    ) {

                        updateHash(
                            CONFIG.homeRoute,
                            options.replace
                        );

                    }


                    renderUnknownApp(
                        parsed.appId
                    );


                    emit(
                        "route:unknown",
                        {
                            appId:
                                parsed.appId
                        }
                    );


                    return false;

                }


                /*
                 * Deaktivierte App
                 */

                if (
                    app.enabled ===
                    false
                ) {

                    renderDisabledApp(
                        app
                    );


                    emit(
                        "app:disabled-route",
                        {
                            app
                        }
                    );


                    return false;

                }


                state.previousRoute =
                    state.currentRoute;

                state.currentRoute =
                    createAppRoute(
                        app.id
                    );

                state.currentAppId =
                    app.id;


                if (
                    options.history !==
                    false
                ) {

                    updateHash(
                        state.currentRoute,
                        options.replace
                    );

                }


                await renderApp(
                    app
                );


                emit(
                    "route:changed",
                    {
                        route:
                            state.currentRoute,

                        type:
                            "app",

                        appId:
                            app.id,

                        app:
                            app

                    }
                );


                return true;

            }


            /*
             * Unbekannte Route
             */

            renderUnknownRoute(
                parsed.route
            );


            emit(
                "route:unknown",
                {
                    route:
                        parsed.route
                }
            );


            return false;

        }
        finally {

            state.navigating =
                false;

        }

    }


    /* ========================================================
       19 — HOME
       ======================================================== */

    function navigateHome(
        options = {}
    ) {

        return navigate(
            CONFIG.homeRoute,
            options
        );

    }


    /* ========================================================
       20 — APP ÖFFNEN
       ======================================================== */

    function openApp(
        appId,
        options = {}
    ) {

        const id =
            normalizeAppId(
                appId
            );


        if (
            !id
        ) {

            return navigateHome(
                options
            );

        }


        return navigate(
            createAppRoute(
                id
            ),
            options
        );

    }


    /* ========================================================
       21 — ZURÜCK
       ======================================================== */

    function back() {

        if (
            window.history &&
            window.history.length >
                1
        ) {

            window.history.back();

            return true;

        }


        return navigateHome();

    }


    /* ========================================================
       22 — HASH
       ======================================================== */

    function updateHash(
        route,
        replace = false
    ) {

        if (
            state.historyLocked
        ) {

            return;

        }


        const clean =
            route.startsWith(
                "#"
            )
                ? route.substring(
                    1
                )
                : route;


        const url =
            window.location.pathname +
            window.location.search +
            "#" +
            clean;


        if (
            replace &&
            window.history &&
            typeof window.history.replaceState ===
                "function"
        ) {

            window.history.replaceState(
                {
                    haldoRoute:
                        route
                },
                "",
                url
            );

        }
        else if (
            window.history &&
            typeof window.history.pushState ===
                "function"
        ) {

            window.history.pushState(
                {
                    haldoRoute:
                        route
                },
                "",
                url
            );

        }
        else {

            window.location.hash =
                clean;

        }

    }


    /* ========================================================
       23 — HASH CHANGE
       ======================================================== */

    function handleHashChange() {

        if (
            state.historyLocked
        ) {

            return;

        }


        const hash =
            window.location.hash ||
            CONFIG.homeRoute;


        navigate(
            hash,
            {
                history:
                    false
            }
        );

    }


    /* ========================================================
       24 — UNBEKANNTE APP
       ======================================================== */

    function renderUnknownApp(
        appId
    ) {

        const root =
            getRoot();


        root.innerHTML = `

            <section
                class="haldo-route-error"
            >

                <div
                    class="haldo-route-card"
                >

                    <div
                        class="haldo-route-icon"
                    >
                        ◇
                    </div>


                    <span>
                        HALDO AI OS 18
                    </span>


                    <h1>
                        App nicht gefunden
                    </h1>


                    <p>
                        Die angeforderte App
                        <strong>
                            ${escapeHtml(appId)}
                        </strong>
                        ist noch nicht registriert.
                    </p>


                    <button
                        type="button"
                        data-action="router-home"
                    >
                        Zur Startseite
                    </button>

                </div>

            </section>

        `;


        const button =
            root.querySelector(
                '[data-action="router-home"]'
            );


        if (
            button
        ) {

            button.addEventListener(
                "click",
                navigateHome
            );

        }

    }


    /* ========================================================
       25 — UNBEKANNTE ROUTE
       ======================================================== */

    function renderUnknownRoute(
        route
    ) {

        const root =
            getRoot();


        root.innerHTML = `

            <section
                class="haldo-route-error"
            >

                <div
                    class="haldo-route-card"
                >

                    <div
                        class="haldo-route-icon"
                    >
                        ?
                    </div>


                    <span>
                        HALDO AI OS 18
                    </span>


                    <h1>
                        Seite nicht gefunden
                    </h1>


                    <p>
                        Diese Route existiert
                        momentan nicht.
                    </p>


                    <code>
                        ${escapeHtml(route)}
                    </code>


                    <button
                        type="button"
                        data-action="router-home"
                    >
                        Zur Startseite
                    </button>

                </div>

            </section>

        `;


        const button =
            root.querySelector(
                '[data-action="router-home"]'
            );


        if (
            button
        ) {

            button.addEventListener(
                "click",
                navigateHome
            );

        }

    }


    /* ========================================================
       26 — DEAKTIVIERTE APP
       ======================================================== */

    function renderDisabledApp(
        app
    ) {

        const root =
            getRoot();


        root.innerHTML = `

            <section
                class="haldo-route-error"
            >

                <div
                    class="haldo-route-card"
                >

                    <div
                        class="haldo-route-icon"
                    >
                        ⏸
                    </div>


                    <span>
                        HALDO AI OS 18
                    </span>


                    <h1>
                        App momentan deaktiviert
                    </h1>


                    <p>
                        ${escapeHtml(
                            app.title
                        )}
                        ist momentan
                        nicht aktiviert.
                    </p>


                    <button
                        type="button"
                        data-action="router-home"
                    >
                        Zur Startseite
                    </button>

                </div>

            </section>

        `;


        const button =
            root.querySelector(
                '[data-action="router-home"]'
            );


        if (
            button
        ) {

            button.addEventListener(
                "click",
                navigateHome
            );

        }

    }


    /* ========================================================
       27 — HTML SICHER MACHEN
       ======================================================== */

    function escapeHtml(
        value
    ) {

        return String(
            value ??
            ""
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
       28 — AKTUELLE ROUTE
       ======================================================== */

    function getCurrentRoute() {

        return state.currentRoute;

    }


    function getCurrentAppId() {

        return state.currentAppId;

    }


    function getPreviousRoute() {

        return state.previousRoute;

    }


    /* ========================================================
       29 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        const manager =
            getAppManager();


        return {

            router: {

                initialized:
                    state.initialized,

                ready:
                    state.ready,

                navigating:
                    state.navigating,

                currentRoute:
                    state.currentRoute,

                currentAppId:
                    state.currentAppId,

                previousRoute:
                    state.previousRoute

            },

            appManager:
                Boolean(
                    manager
                ),

            root:
                Boolean(
                    document.querySelector(
                        CONFIG.rootSelector
                    )
                ),

            hash:
                window.location.hash ||
                ""

        };

    }


    /* ========================================================
       30 — INITIALISIERUNG
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
         * Browser Events
         */

        window.addEventListener(
            "hashchange",
            handleHashChange
        );


        window.addEventListener(
            "popstate",
            handleHashChange
        );


        /*
         * Erst nach App Manager
         */

        if (
            window.HalDoAppManager &&
            typeof window.HalDoAppManager.on ===
                "function"
        ) {

            window.HalDoAppManager.on(
                "ready",
                function () {

                    handleHashChange();

                }
            );

        }


        /*
         * Bestehende Hash Route verwenden.
         */

        const initialHash =
            window.location.hash;


        if (
            initialHash
        ) {

            navigate(
                initialHash,
                {
                    history:
                        false
                }
            );

        }
        else {

            navigateHome(
                {
                    history:
                        false
                }
            );

        }


        state.ready =
            true;


        /*
         * System registrieren
         */

        if (
            window.HalDoSystem &&
            typeof window.HalDoSystem.registerService ===
                "function"
        ) {

            window.HalDoSystem.registerService(
                "app-router",
                api
            );

        }


        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.registerModule ===
                "function"
        ) {

            window.HalDoKernel.registerModule(
                "app-router",
                api
            );


            if (
                typeof window.HalDoKernel.setModuleReady ===
                    "function"
            ) {

                window.HalDoKernel.setModuleReady(
                    "app-router",
                    true
                );

            }

        }


        emit(
            "ready",
            getState()
        );


        log(
            "App Router bereit."
        );


        return getState();

    }


    /* ========================================================
       31 — STATE
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            navigating:
                state.navigating,

            currentRoute:
                state.currentRoute,

            currentAppId:
                state.currentAppId,

            previousRoute:
                state.previousRoute

        };

    }


    /* ========================================================
       32 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,


        init,


        navigate,

        navigateHome,

        openApp,

        back,


        createAppRoute,

        parseRoute,


        getCurrentRoute,

        getCurrentAppId,

        getPreviousRoute,


        getState,

        diagnose,


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