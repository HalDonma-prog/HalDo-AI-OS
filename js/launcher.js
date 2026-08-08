/* ============================================================
   HalDo AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei: js/launcher.js

   Aufgabe:
   - Zentrale Launcher-Steuerung
   - App-Liste anzeigen
   - Kategorien anzeigen
   - App-Suche
   - Favoriten
   - App-Klicks
   - 404-Schutz
   - Verbindung mit HalDoAppManager
   - Verbindung mit HalDoKernel
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const VERSION = "18.0.0";

    const SELECTORS = {

        launcher:
            "#haldo-launcher",

        appGrid:
            "#haldo-app-grid",

        categoryList:
            "#haldo-category-list",

        search:
            "#haldo-app-search",

        empty:
            "#haldo-launcher-empty"

    };


    /* ========================================================
       02 — ZUSTAND
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        apps: [],

        categories: [],

        activeCategory:
            "all",

        searchTerm:
            "",

        favoriteOnly:
            false

    };


    /* ========================================================
       03 — LOG
       ======================================================== */

    function log(
        message,
        type = "info"
    ) {

        const prefix =
            "[HalDo Launcher]";


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
       04 — DOM
       ======================================================== */

    function getLauncher() {

        return document.querySelector(
            SELECTORS.launcher
        );

    }


    function getAppGrid() {

        return document.querySelector(
            SELECTORS.appGrid
        );

    }


    function getCategoryList() {

        return document.querySelector(
            SELECTORS.categoryList
        );

    }


    function getSearchInput() {

        return document.querySelector(
            SELECTORS.search
        );

    }


    /* ========================================================
       05 — SICHERES HTML
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
       06 — APP ICON
       ======================================================== */

    function createIcon(
        app
    ) {

        const icon =
            app.icon ||
            "";


        if (
            icon
        ) {

            /*
             * Normales Bild.
             */

            if (
                /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i
                    .test(icon)
            ) {

                return `
                    <img
                        class="haldo-app-logo"
                        src="${escapeHTML(icon)}"
                        alt=""
                        loading="lazy"
                        onerror="this.style.display='none';this.nextElementSibling.hidden=false;"
                    >
                    <span
                        class="haldo-app-icon-fallback"
                        hidden
                    >
                        ◇
                    </span>
                `;

            }


            /*
             * Emoji / Textsymbol.
             */

            return `
                <span
                    class="haldo-app-icon-fallback"
                    aria-hidden="true"
                >
                    ${escapeHTML(icon)}
                </span>
            `;

        }


        return `
            <span
                class="haldo-app-icon-fallback"
                aria-hidden="true"
            >
                ◇
            </span>
        `;

    }


    /* ========================================================
       07 — APP KARTE
       ======================================================== */

    function createAppCard(
        app
    ) {

        const favorite =
            Boolean(app.favorite);


        const enabled =
            app.enabled !== false;


        const title =
            app.title ||
            app.name ||
            "App";


        const description =
            app.description ||
            "";


        return `
            <article
                class="haldo-app-card"
                data-app-id="${escapeHTML(app.id)}"
            >

                <button
                    type="button"
                    class="haldo-app-launch"
                    data-app-id="${escapeHTML(app.id)}"
                    ${enabled ? "" : "disabled"}
                    aria-label="${escapeHTML(title)} öffnen"
                    title="${escapeHTML(description || title)}"
                >

                    <span
                        class="haldo-app-icon-wrapper"
                        aria-hidden="true"
                    >
                        ${createIcon(app)}
                    </span>

                    <span
                        class="haldo-app-name"
                    >
                        ${escapeHTML(title)}
                    </span>

                    <span
                        class="haldo-app-favorite"
                        data-favorite-id="${escapeHTML(app.id)}"
                        role="button"
                        tabindex="0"
                        aria-label="${favorite ? "Favorit entfernen" : "Als Favorit markieren"}"
                        title="${favorite ? "Favorit entfernen" : "Favorit"}"
                    >
                        ${favorite ? "★" : "☆"}
                    </span>

                </button>

            </article>
        `;

    }


    /* ========================================================
       08 — APPS RENDERN
       ======================================================== */

    function renderApps(
        apps
    ) {

        const grid =
            getAppGrid();


        if (!grid) {

            log(
                "App-Grid wurde in index.html nicht gefunden.",
                "warning"
            );

            return;

        }


        if (
            !Array.isArray(apps) ||
            apps.length === 0
        ) {

            grid.innerHTML = "";


            showEmptyState(
                true
            );


            return;

        }


        showEmptyState(
            false
        );


        grid.innerHTML =
            apps
                .map(
                    createAppCard
                )
                .join("");


        bindAppButtons();

    }


    /* ========================================================
       09 — EMPTY STATE
       ======================================================== */

    function showEmptyState(
        show
    ) {

        const empty =
            document.querySelector(
                SELECTORS.empty
            );


        if (!empty) {

            return;

        }


        empty.hidden =
            !show;

    }


    /* ========================================================
       10 — KATEGORIEN
       ======================================================== */

    function renderCategories() {

        const container =
            getCategoryList();


        if (!container) {

            return;

        }


        const manager =
            window.HalDoAppManager;


        if (
            !manager
        ) {

            return;

        }


        state.categories =
            manager.getCategories();


        container.innerHTML =
            state.categories
                .map(
                    category => {

                        const active =
                            category.id ===
                            state.activeCategory;


                        return `
                            <button
                                type="button"
                                class="haldo-category-button ${active ? "active" : ""}"
                                data-category="${escapeHTML(category.id)}"
                                aria-pressed="${active}"
                            >
                                ${escapeHTML(category.name)}
                                <span>
                                    ${Number(category.count) || 0}
                                </span>
                            </button>
                        `;

                    }
                )
                .join("");


        bindCategoryButtons();

    }


    /* ========================================================
       11 — AKTIVE APPS ERMITTELN
       ======================================================== */

    function getDisplayedApps() {

        const manager =
            window.HalDoAppManager;


        if (
            !manager
        ) {

            return [];

        }


        let apps;


        if (
            state.activeCategory ===
            "favorites"
        ) {

            apps =
                manager.getFavorites();

        }
        else {

            apps =
                manager.getAppsByCategory(
                    state.activeCategory
                );

        }


        if (
            state.searchTerm
        ) {

            apps =
                manager.searchApps(
                    state.searchTerm
                );


            /*
             * Suche mit Kategorie kombinieren.
             */

            if (
                state.activeCategory !==
                    "all" &&
                state.activeCategory !==
                    "favorites"
            ) {

                apps =
                    apps.filter(
                        app =>
                            app.category ===
                            state.activeCategory
                    );

            }


            if (
                state.activeCategory ===
                    "favorites"
            ) {

                apps =
                    apps.filter(
                        app =>
                            app.favorite
                    );

            }

        }


        return apps;

    }


    /* ========================================================
       12 — GESAMTEN LAUNCHER AKTUALISIEREN
       ======================================================== */

    function render() {

        const manager =
            window.HalDoAppManager;


        if (
            !manager
        ) {

            log(
                "HalDoAppManager ist noch nicht verfügbar.",
                "warning"
            );

            return;

        }


        state.apps =
            manager.getAllApps();


        renderCategories();


        renderApps(
            getDisplayedApps()
        );


        updateLauncherStatus();

    }


    /* ========================================================
       13 — STATUS
       ======================================================== */

    function updateLauncherStatus() {

        const launcher =
            getLauncher();


        if (!launcher) {

            return;

        }


        launcher.dataset.ready =
            state.ready
                ? "true"
                : "false";


        launcher.dataset.category =
            state.activeCategory;


        launcher.dataset.search =
            state.searchTerm;

    }


    /* ========================================================
       14 — KATEGORIE KLICK
       ======================================================== */

    function bindCategoryButtons() {

        const container =
            getCategoryList();


        if (!container) {

            return;

        }


        container
            .querySelectorAll(
                "[data-category]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            const category =
                                button.dataset.category ||
                                "all";


                            setCategory(
                                category
                            );

                        }
                    );

                }
            );

    }


    function setCategory(
        category
    ) {

        state.activeCategory =
            category ||
            "all";


        state.favoriteOnly =
            state.activeCategory ===
            "favorites";


        const manager =
            window.HalDoAppManager;


        if (
            manager &&
            typeof manager.setCategory ===
            "function"
        ) {

            manager.setCategory(
                state.activeCategory
            );

        }


        render();

    }


    /* ========================================================
       15 — SUCHE
       ======================================================== */

    function bindSearch() {

        const input =
            getSearchInput();


        if (!input) {

            return;

        }


        let timer =
            null;


        input.addEventListener(
            "input",
            function () {

                window.clearTimeout(
                    timer
                );


                timer =
                    window.setTimeout(
                        function () {

                            state.searchTerm =
                                input.value
                                    .trim();


                            const manager =
                                window.HalDoAppManager;


                            if (
                                manager &&
                                typeof manager.setSearch ===
                                "function"
                            ) {

                                manager.setSearch(
                                    state.searchTerm
                                );

                            }


                            render();

                        },
                        80
                    );

            }
        );


        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    input.value =
                        "";

                    state.searchTerm =
                        "";

                    render();

                    input.blur();

                }

            }
        );

    }


    /* ========================================================
       16 — APP BUTTONS
       ======================================================== */

    function bindAppButtons() {

        const grid =
            getAppGrid();


        if (!grid) {

            return;

        }


        grid
            .querySelectorAll(
                ".haldo-app-launch"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function (event) {

                            /*
                             * Favoriten-Button innerhalb
                             * der App-Karte darf nicht
                             * gleichzeitig die App öffnen.
                             */

                            if (
                                event.target.closest(
                                    ".haldo-app-favorite"
                                )
                            ) {

                                return;

                            }


                            const appId =
                                button.dataset.appId;


                            if (
                                !appId
                            ) {

                                return;

                            }


                            launchApp(
                                appId
                            );

                        }
                    );

                }
            );


        grid
            .querySelectorAll(
                ".haldo-app-favorite"
            )
            .forEach(
                favoriteButton => {

                    favoriteButton.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();
                            event.stopPropagation();


                            const appId =
                                favoriteButton.dataset.favoriteId;


                            toggleFavorite(
                                appId
                            );

                        }
                    );


                    favoriteButton.addEventListener(
                        "keydown",
                        function (event) {

                            if (
                                event.key ===
                                    "Enter" ||
                                event.key ===
                                    " "
                            ) {

                                event.preventDefault();
                                event.stopPropagation();


                                toggleFavorite(
                                    favoriteButton.dataset.favoriteId
                                );

                            }

                        }
                    );

                }
            );

    }


    /* ========================================================
       17 — FAVORIT
       ======================================================== */

    function toggleFavorite(
        appId
    ) {

        const manager =
            window.HalDoAppManager;


        if (
            !manager
        ) {

            return;

        }


        if (
            typeof manager.toggleFavorite !==
            "function"
        ) {

            return;

        }


        manager.toggleFavorite(
            appId
        );


        render();

    }


    /* ========================================================
       18 — 404-SCHUTZ
       ======================================================== */

    function isSafeInternalPath(
        path
    ) {

        if (
            !path
        ) {

            return false;

        }


        const value =
            String(path)
                .trim();


        /*
         * Absolute externe URLs
         * nicht als interne Pfade behandeln.
         */

        if (
            /^https?:\/\//i.test(
                value
            )
        ) {

            return false;

        }


        /*
         * JavaScript-URLs verbieten.
         */

        if (
            /^javascript:/i.test(
                value
            )
        ) {

            return false;

        }


        /*
         * Leere oder offensichtliche
         * Platzhalter nicht öffnen.
         */

        if (
            value === "#" ||
            value === "/" ||
            value === "undefined" ||
            value === "null"
        ) {

            return false;

        }


        return true;

    }


    function showAppNotReady(
        app
    ) {

        const name =
            app?.name ||
            "Diese App";


        /*
         * Kein 404.
         *
         * Stattdessen eine kleine
         * HalDo-Systemmeldung.
         */

        if (
            typeof window.HalDoNotify ===
            "function"
        ) {

            window.HalDoNotify(
                `${name} ist registriert, aber das App-Modul ist noch nicht verbunden.`
            );

            return;

        }


        /*
         * Fallback für die Foundation.
         */

        window.alert(
            `${name}\n\nDiese App ist bereits im HalDo AI OS registriert, aber ihr vollständiges Modul wird noch aufgebaut.`
        );

    }


    /* ========================================================
       19 — APP STARTEN
       ======================================================== */

    function launchApp(
        appId
    ) {

        const manager =
            window.HalDoAppManager;


        if (
            !manager
        ) {

            log(
                "App Manager nicht verfügbar.",
                "error"
            );

            return;

        }


        const app =
            manager.getApp(
                appId
            );


        if (!app) {

            log(
                `App "${appId}" wurde nicht gefunden.`,
                "warning"
            );

            return;

        }


        /*
         * Deaktivierte Apps nicht starten.
         */

        if (
            app.enabled === false
        ) {

            showAppNotReady(
                app
            );

            return;

        }


        /*
         * Spezieller App-Typ.
         */

        if (
            app.type ===
            "external"
        ) {

            if (
                app.url &&
                /^https?:\/\//i.test(
                    app.url
                )
            ) {

                window.open(
                    app.url,
                    "_blank",
                    "noopener,noreferrer"
                );

                return;

            }


            showAppNotReady(
                app
            );

            return;

        }


        /*
         * Interne App.
         */

        const path =
            app.path ||
            app.url ||
            "";


        /*
         * KEIN Pfad:
         * niemals 404 erzeugen.
         */

        if (
            !isSafeInternalPath(
                path
            )
        ) {

            showAppNotReady(
                app
            );

            return;

        }


        /*
         * Falls der App Manager seine eigene
         * Startlogik besitzt, verwenden wir sie.
         */

        if (
            typeof manager.openApp ===
            "function"
        ) {

            /*
             * Vorher prüfen wir aber den Pfad.
             * Dadurch wird kein leerer oder
             * offensichtlicher Platzhalter geöffnet.
             */

            manager.openApp(
                appId
            );

            return;

        }


        /*
         * Letzter Fallback.
         */

        window.location.assign(
            path
        );

    }


    /* ========================================================
       20 — KERNEL VERBINDUNG
       ======================================================== */

    function connectKernel() {

        const kernel =
            window.HalDoKernel;


        if (
            !kernel
        ) {

            window.setTimeout(
                connectKernel,
                100
            );

            return;

        }


        /*
         * Kernel bereit.
         */

        kernel.on(
            "kernel:ready",
            function () {

                connectAppManager();

            }
        );


        /*
         * Kernel war eventuell bereits
         * fertig, bevor wir verbunden wurden.
         */

        const kernelState =
            kernel.getState();


        if (
            kernelState.ready
        ) {

            connectAppManager();

        }

    }


    /* ========================================================
       21 — APP MANAGER VERBINDEN
       ======================================================== */

    function connectAppManager() {

        const manager =
            window.HalDoAppManager;


        if (
            !manager
        ) {

            window.setTimeout(
                connectAppManager,
                100
            );

            return;

        }


        /*
         * App Manager ist bereits bereit.
         */

        const managerState =
            manager.getState();


        if (
            managerState.ready
        ) {

            finishInitialization();

        }


        /*
         * Auf spätere Apps warten.
         */

        manager.on(
            "apps:loaded",
            function () {

                finishInitialization();

            }
        );


        manager.on(
            "app:favorite",
            function () {

                render();

            }
        );


        manager.on(
            "categories:updated",
            function () {

                render();

            }
        );


        manager.on(
            "apps:registered",
            function () {

                render();

            }
        );

    }


    /* ========================================================
       22 — INITIALISIERUNG
       ======================================================== */

    function finishInitialization() {

        if (
            state.initialized
        ) {

            render();

            return;

        }


        state.initialized =
            true;

        state.ready =
            true;


        bindSearch();


        render();


        const launcher =
            getLauncher();


        if (
            launcher
        ) {

            launcher.classList.add(
                "ready"
            );

        }


        /*
         * Kernel-Modul registrieren.
         */

        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.registerModule ===
            "function"
        ) {

            window.HalDoKernel.registerModule(
                "launcher",
                api
            );

        }


        emit(
            "launcher:ready"
        );


        log(
            "Launcher ist vollständig bereit."
        );

    }


    /* ========================================================
       23 — EVENT SYSTEM
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
                            `Launcher Event-Fehler: ${error.message}`,
                            "error"
                        );

                    }

                }
            );

        }


        /*
         * Event auch an Kernel weitergeben.
         */

        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.emit ===
            "function"
        ) {

            window.HalDoKernel.emit(
                eventName,
                data
            );

        }

    }


    /* ========================================================
       24 — ÖFFENTLICHE API
       ======================================================== */

    const api = {

        name:
            "HalDo Launcher",

        version:
            VERSION,


        init:
            finishInitialization,


        render,


        renderApps,


        renderCategories,


        setCategory,


        launchApp,


        toggleFavorite,


        getState:
            function () {

                return {

                    ...state,

                    apps:
                        [
                            ...state.apps
                        ]

                };

            },


        on,

        emit

    };


    /* ========================================================
       25 — GLOBAL
       ======================================================== */

    window.HalDoLauncher =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.launcher =
        api;


    /* ========================================================
       26 — START
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
   ENDE — HALDO AI OS 18 LAUNCHER
   ============================================================ */