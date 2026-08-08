/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/app-router.js

   Aufgabe:
   - Zentrale Navigation innerhalb von HalDo AI OS
   - Verhindert unnötige 404-Weiterleitungen
   - Prüft Apps über HalDoAppManager
   - Öffnet vorhandene Seiten/Module
   - Unterstützt spätere echte App-Module
   - Fallback statt harter 404-Seite
   - Browser-History
   - Zurück / Vorwärts
   - Deep-Link-Unterstützung

   WICHTIG:
   Diese Datei besitzt KEINE eigene App-Liste.
   Die App-Daten kommen ausschließlich aus:

       config/apps.js
              ↓
       HalDoAppRegistry
              ↓
       HalDoAppManager
              ↓
       HalDoAppRouter

   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const CONFIG = {

        name:
            "HalDo AI App Router",

        version:
            "18.0.0",

        defaultApp:
            "haldo-home",

        fallbackApp:
            "dashboard"

    };


    /* ========================================================
       02 — STATUS
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

        navigationCount:
            0,

        lastError:
            null

    };


    /* ========================================================
       03 — EVENT SYSTEM
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
       04 — LOGGING
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
       05 — APP MANAGER
       ======================================================== */

    function getAppManager() {

        return (
            window.HalDoAppManager ||
            null
        );

    }


    /* ========================================================
       06 — APP ERMITTELN
       ======================================================== */

    function resolveApp(
        appId
    ) {

        const manager =
            getAppManager();


        if (
            !manager ||
            typeof manager.getApp !==
                "function"
        ) {

            return null;

        }


        return manager.getApp(
            appId
        );

    }


    /* ========================================================
       07 — APP EXISTIERT
       ======================================================== */

    function appExists(
        appId
    ) {

        return Boolean(
            resolveApp(
                appId
            )
        );

    }


    /* ========================================================
       08 — APP ID NORMALISIEREN
       ======================================================== */

    function normalizeAppId(
        appId
    ) {

        return String(
            appId ||
            ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );

    }


    /* ========================================================
       09 — AKTUELLE APP
       ======================================================== */

    function getCurrentApp() {

        if (
            !state.currentApp
        ) {

            return null;

        }


        return resolveApp(
            state.currentApp
        );

    }


    /* ========================================================
       10 — APP-CONTAINER
       ======================================================== */

    function getContainer() {

        const selectors = [

            "#app-container",

            "#app-root",

            "#main-content",

            "[data-haldo-app-container]",

            ".app-container",

            "main"

        ];


        for (
            const selector of selectors
        ) {

            const element =
                document.querySelector(
                    selector
                );


            if (
                element
            ) {

                return element;

            }

        }


        return null;

    }


    /* ========================================================
       11 — APP CONTAINER ERSTELLEN
       ======================================================== */

    function ensureContainer() {

        let container =
            getContainer();


        if (
            container
        ) {

            return container;

        }


        container =
            document.createElement(
                "main"
            );


        container.id =
            "app-container";


        container.setAttribute(
            "data-haldo-app-container",
            "true"
        );


        document.body.appendChild(
            container
        );


        return container;

    }


    /* ========================================================
       12 — APP-HEADER
       ======================================================== */

    function createAppHeader(
        app
    ) {

        const header =
            document.createElement(
                "div"
            );


        header.className =
            "haldo-app-header";


        header.setAttribute(
            "data-haldo-generated",
            "true"
        );


        const left =
            document.createElement(
                "div"
            );


        left.className =
            "haldo-app-header-left";


        const icon =
            document.createElement(
                "div"
            );


        icon.className =
            "haldo-app-icon";


        if (
            typeof app.icon ===
                "string" &&
            app.icon.includes(
                "/"
            )
        ) {

            const image =
                document.createElement(
                    "img"
                );


            image.src =
                app.icon;


            image.alt =
                app.title ||
                app.name ||
                "HalDo App";


            image.onerror =
                function () {

                    image.remove();

                    icon.textContent =
                        "◉";

                };


            icon.appendChild(
                image
            );

        }
        else {

            icon.textContent =
                app.icon ||
                "◉";

        }


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "haldo-app-title";


        title.textContent =
            app.title ||
            app.name ||
            app.id;


        left.appendChild(
            icon
        );


        left.appendChild(
            title
        );


        const closeButton =
            document.createElement(
                "button"
            );


        closeButton.type =
            "button";


        closeButton.className =
            "haldo-app-close";


        closeButton.textContent =
            "×";


        closeButton.setAttribute(
            "aria-label",
            "App schließen"
        );


        closeButton.addEventListener(
            "click",
            function () {

                navigate(
                    CONFIG.defaultApp
                );

            }
        );


        header.appendChild(
            left
        );


        header.appendChild(
            closeButton
        );


        return header;

    }


    /* ========================================================
       13 — FALLBACK-ANSICHT
       ======================================================== */

    function createFallbackView(
        appId,
        reason
    ) {

        const container =
            ensureContainer();


        container.innerHTML =
            "";


        const wrapper =
            document.createElement(
                "section"
            );


        wrapper.className =
            "haldo-router-fallback";


        wrapper.setAttribute(
            "role",
            "region"
        );


        const logo =
            document.createElement(
                "div"
            );


        logo.className =
            "haldo-router-logo";


        const image =
            document.createElement(
                "img"
            );


        image.src =
            "assets/logo/logo.png";


        image.alt =
            "HalDo AI";


        image.onerror =
            function () {

                logo.textContent =
                    "HalDo AI";

            };


        logo.appendChild(
            image
        );


        const title =
            document.createElement(
                "h1"
            );


        title.textContent =
            "HalDo AI";


        const message =
            document.createElement(
                "p"
            );


        message.textContent =
            "Diese App ist in der aktuellen Systemversion noch nicht vollständig als Modul verbunden.";


        const details =
            document.createElement(
                "p"
            );


        details.textContent =
            `App: ${appId || "unbekannt"}`;


        details.className =
            "haldo-router-details";


        if (
            reason
        ) {

            details.textContent +=
                ` · ${reason}`;

        }


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.textContent =
            "Zum HalDo Home";


        button.addEventListener(
            "click",
            function () {

                navigate(
                    CONFIG.defaultApp
                );

            }
        );


        wrapper.appendChild(
            logo
        );


        wrapper.appendChild(
            title
        );


        wrapper.appendChild(
            message
        );


        wrapper.appendChild(
            details
        );


        wrapper.appendChild(
            button
        );


        container.appendChild(
            wrapper
        );


        emit(
            "fallback",
            {

                appId,

                reason

            }
        );


        return true;

    }


    /* ========================================================
       14 — APP-MODUL FINDEN
       ======================================================== */

    function getAppModule(
        appId
    ) {

        const normalized =
            normalizeAppId(
                appId
            );


        /*
         * Zukünftige App-Module können sich hier registrieren:
         *
         * window.HalDoApps["calendar"]
         * window.HalDoApps["notes"]
         * usw.
         */

        if (
            window.HalDoApps &&
            window.HalDoApps[
                normalized
            ]
        ) {

            return window.HalDoApps[
                normalized
            ];

        }


        /*
         * Zusätzlich kann ein einzelnes Modul
         * direkt registriert sein.
         */

        const directName =
            `HalDoApp_${normalized}`;


        if (
            window[
                directName
            ]
        ) {

            return window[
                directName
            ];

        }


        return null;

    }


    /* ========================================================
       15 — APP-MODUL AUSFÜHREN
       ======================================================== */

    function renderModule(
        app,
        module
    ) {

        const container =
            ensureContainer();


        container.innerHTML =
            "";


        const header =
            createAppHeader(
                app
            );


        container.appendChild(
            header
        );


        const content =
            document.createElement(
                "div"
            );


        content.className =
            "haldo-app-content";


        container.appendChild(
            content
        );


        try {

            if (
                typeof module.render ===
                    "function"
            ) {

                module.render(
                    content,
                    app
                );


                return true;

            }


            if (
                typeof module.open ===
                    "function"
            ) {

                module.open(
                    content,
                    app
                );


                return true;

            }


            if (
                typeof module.init ===
                    "function"
            ) {

                module.init(
                    content,
                    app
                );


                return true;

            }


            return false;

        }
        catch (
            error
        ) {

            console.error(
                "[HalDo Router] Fehler beim Rendern:",
                error
            );


            createFallbackView(
                app.id,
                "Fehler beim Laden des App-Moduls."
            );


            return false;

        }

    }


    /* ========================================================
       16 — DASHBOARD-FALLBACK
       ======================================================== */

    function renderDashboardFallback(
        app
    ) {

        const container =
            ensureContainer();


        container.innerHTML =
            "";


        const header =
            createAppHeader(
                app
            );


        container.appendChild(
            header
        );


        const content =
            document.createElement(
                "div"
            );


        content.className =
            "haldo-dashboard-fallback";


        const heading =
            document.createElement(
                "h1"
            );


        heading.textContent =
            app.title ||
            "HalDo AI OS";


        const paragraph =
            document.createElement(
                "p"
            );


        paragraph.textContent =
            app.description ||
            "Willkommen bei HalDo AI OS 18.";


        const grid =
            document.createElement(
                "div"
            );


        grid.className =
            "haldo-router-app-grid";


        const manager =
            getAppManager();


        let apps =
            [];


        if (
            manager &&
            typeof manager.getEnabledApps ===
                "function"
        ) {

            apps =
                manager.getEnabledApps();

        }


        /*
         * Maximal 24 Apps auf der Fallback-Oberfläche.
         */

        apps =
            apps.slice(
                0,
                24
            );


        apps.forEach(
            item => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "haldo-router-app-button";


                button.dataset.appId =
                    item.id;


                const icon =
                    document.createElement(
                        "span"
                    );


                icon.className =
                    "haldo-router-app-button-icon";


                icon.textContent =
                    item.icon &&
                    !item.icon.includes(
                        "/"
                    )
                        ? item.icon
                        : "◉";


                const name =
                    document.createElement(
                        "span"
                    );


                name.textContent =
                    item.title ||
                    item.name ||
                    item.id;


                button.appendChild(
                    icon
                );


                button.appendChild(
                    name
                );


                button.addEventListener(
                    "click",
                    function () {

                        navigate(
                            item.id
                        );

                    }
                );


                grid.appendChild(
                    button
                );

            }
        );


        content.appendChild(
            heading
        );


        content.appendChild(
            paragraph
        );


        content.appendChild(
            grid
        );


        container.appendChild(
            content
        );


        return true;

    }


    /* ========================================================
       17 — APP ÖFFNEN
       ======================================================== */

    function openApp(
        appId,
        options = {}
    ) {

        const normalized =
            normalizeAppId(
                appId
            );


        if (
            !normalized
        ) {

            return navigate(
                CONFIG.defaultApp,
                options
            );

        }


        const app =
            resolveApp(
                normalized
            );


        /*
         * Unbekannte App:
         * Kein 404.
         */

        if (
            !app
        ) {

            state.lastError =
                `Unbekannte App: ${normalized}`;


            log(
                state.lastError,
                "warning"
            );


            createFallbackView(
                normalized,
                "App nicht registriert."
            );


            return false;

        }


        /*
         * Deaktivierte App:
         */

        if (
            app.enabled ===
            false
        ) {

            state.lastError =
                `App deaktiviert: ${normalized}`;


            createFallbackView(
                normalized,
                "Diese App ist derzeit deaktiviert."
            );


            return false;

        }


        /*
         * App-Modul prüfen.
         */

        const module =
            getAppModule(
                normalized
            );


        /*
         * Kein Modul:
         *
         * Wir erzeugen KEINEN 404.
         *
         * Dashboard und Home erhalten
         * eine nutzbare Oberfläche.
         */

        if (
            !module
        ) {

            if (
                normalized ===
                    "haldo-home" ||
                normalized ===
                    "dashboard"
            ) {

                return renderDashboardFallback(
                    app
                );

            }


            createFallbackView(
                normalized,
                "Modul noch nicht verbunden."
            );


            state.previousApp =
                state.currentApp;


            state.currentApp =
                normalized;


            state.navigationCount++;


            emit(
                "navigate",
                {

                    app,

                    appId:
                        normalized,

                    fallback:
                        true

                }
            );


            return true;

        }


        /*
         * Modul rendern.
         */

        const success =
            renderModule(
                app,
                module
            );


        if (
            success
        ) {

            state.previousApp =
                state.currentApp;


            state.currentApp =
                normalized;


            state.navigationCount++;


            state.lastError =
                null;


            emit(
                "navigate",
                {

                    app,

                    appId:
                        normalized,

                    fallback:
                        false

                }
            );


            return true;

        }


        /*
         * Modul konnte nicht geöffnet werden.
         */

        createFallbackView(
            normalized,
            "App-Modul konnte nicht geöffnet werden."
        );


        return false;

    }


    /* ========================================================
       18 — NAVIGATION
       ======================================================== */

    function navigate(
        appId,
        options = {}
    ) {

        const normalized =
            normalizeAppId(
                appId
            );


        const success =
            openApp(
                normalized,
                options
            );


        /*
         * Browser-History nur bei
         * erfolgreicher Navigation.
         */

        if (
            success &&
            options.history !==
                false
        ) {

            const url =
                new URL(
                    window.location.href
                );


            url.searchParams.set(
                "app",
                normalized
            );


            if (
                options.replace ===
                true
            ) {

                window.history.replaceState(
                    {
                        haldo:
                            true,

                        appId:
                            normalized

                    },
                    "",
                    url
                );

            }
            else {

                window.history.pushState(
                    {
                        haldo:
                            true,

                        appId:
                            normalized

                    },
                    "",
                    url
                );

            }

        }


        return success;

    }


    /* ========================================================
       19 — START APP
       ======================================================== */

    function start(
        appId
    ) {

        return navigate(
            appId ||
            CONFIG.defaultApp
        );

    }


    /* ========================================================
       20 — ZURÜCK
       ======================================================== */

    function back() {

        if (
            state.previousApp
        ) {

            return navigate(
                state.previousApp
            );

        }


        if (
            window.history.length >
            1
        ) {

            window.history.back();

            return true;

        }


        return navigate(
            CONFIG.defaultApp
        );

    }


    /* ========================================================
       21 — URL APP LESEN
       ======================================================== */

    function getAppFromURL() {

        try {

            const params =
                new URLSearchParams(
                    window.location.search
                );


            const app =
                params.get(
                    "app"
                );


            if (
                app
            ) {

                return normalizeAppId(
                    app
                );

            }

        }
        catch (
            error
        ) {

            console.warn(
                "[HalDo Router] URL konnte nicht gelesen werden.",
                error
            );

        }


        return null;

    }


    /* ========================================================
       22 — BROWSER HISTORY
       ======================================================== */

    function handlePopState(
        event
    ) {

        let appId =
            null;


        if (
            event &&
            event.state &&
            event.state.haldo &&
            event.state.appId
        ) {

            appId =
                event.state.appId;

        }


        if (
            !appId
        ) {

            appId =
                getAppFromURL();

        }


        if (
            !appId
        ) {

            appId =
                CONFIG.defaultApp;

        }


        navigate(
            appId,
            {
                history:
                    false
            }
        );

    }


    /* ========================================================
       23 — APP-LINKS
       ======================================================== */

    function bindAppLinks() {

        const links =
            document.querySelectorAll(
                "[data-haldo-app]"
            );


        links.forEach(
            link => {

                if (
                    link.dataset.haldoRouterBound ===
                    "true"
                ) {

                    return;

                }


                link.dataset.haldoRouterBound =
                    "true";


                link.addEventListener(
                    "click",
                    function (
                        event
                    ) {

                        event.preventDefault();


                        const appId =
                            link.dataset.haldoApp;


                        if (
                            appId
                        ) {

                            navigate(
                                appId
                            );

                        }

                    }
                );

            }
        );

    }


    /* ========================================================
       24 — APP-LINK ERSTELLEN
       ======================================================== */

    function createAppLink(
        appId,
        label = null
    ) {

        const app =
            resolveApp(
                appId
            );


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.dataset.haldoApp =
            normalizeAppId(
                appId
            );


        button.textContent =
            label ||
            (
                app
                    ? app.title
                    : appId
            );


        button.addEventListener(
            "click",
            function () {

                navigate(
                    appId
                );

            }
        );


        return button;

    }


    /* ========================================================
       25 — ROUTE INFO
       ======================================================== */

    function getRoute() {

        return {

            currentApp:
                state.currentApp,

            previousApp:
                state.previousApp,

            navigationCount:
                state.navigationCount,

            ready:
                state.ready

        };

    }


    /* ========================================================
       26 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        return {

            router: {

                name:
                    CONFIG.name,

                version:
                    CONFIG.version,

                initialized:
                    state.initialized,

                ready:
                    state.ready,

                currentApp:
                    state.currentApp,

                previousApp:
                    state.previousApp,

                navigationCount:
                    state.navigationCount,

                lastError:
                    state.lastError

            },

            appManager:
                Boolean(
                    getAppManager()
                ),

            container:
                Boolean(
                    getContainer()
                )

        };

    }


    /* ========================================================
       27 — INITIALISIERUNG
       ======================================================== */

    function init() {

        if (
            state.initialized
        ) {

            return getRoute();

        }


        state.initialized =
            true;


        /*
         * Browser-Zurück/Vorwärts.
         */

        window.addEventListener(
            "popstate",
            handlePopState
        );


        /*
         * Bereits vorhandene App-Links.
         */

        bindAppLinks();


        state.ready =
            true;


        /*
         * System registrieren.
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
            getRoute()
        );


        log(
            "Router ist bereit."
        );


        /*
         * App aus URL lesen.
         */

        const urlApp =
            getAppFromURL();


        if (
            urlApp &&
            appExists(
                urlApp
            )
        ) {

            navigate(
                urlApp,
                {
                    history:
                        false
                }
            );

        }


        return getRoute();

    }


    /* ========================================================
       28 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,


        init,


        on,

        off,


        start,

        navigate,

        openApp,

        back,


        getApp,

        appExists,

        getCurrentApp,


        getRoute,

        createAppLink,

        bindAppLinks,


        diagnose

    };


    /* ========================================================
       29 — GLOBAL
       ======================================================== */

    window.HalDoAppRouter =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.appRouter =
        api;


    /* ========================================================
       30 — START
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
                once:
                    true
            }
        );

    }
    else {

        boot();

    }


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 APP ROUTER
   ============================================================ */