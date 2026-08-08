/* ============================================================
   HalDo AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei: js/launcher.js

   Version: 18.0.0

   Aufgaben:
   - App-Menü
   - App-Kategorien
   - App-Suche
   - Favoriten
   - App Router Verbindung
   - Kein direkter 404-Navigationsweg
   - sichere App-Auswahl
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const VERSION =
        "18.0.0";


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
            ""

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
       05 — HTML SICHERN
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
            "◇";


        /*
         * Bild erkennen.
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
                    onerror="
                        this.style.display='none';
                        if(this.nextElementSibling){
                            this.nextElementSibling.hidden=false;
                        }
                    "
                >

                <span
                    class="haldo-app-icon-fallback"
                    hidden
                >
                    ◇
                </span>
            `;

        }


        return `
            <span
                class="haldo-app-icon-fallback"
                aria-hidden="true"
            >
                ${escapeHTML(icon)}
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
                >

                    <span
                        class="haldo-app-icon-wrapper"
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
                        aria-label="${
                            favorite
                                ? "Favorit entfernen"
                                : "Als Favorit markieren"
                        }"
                    >
                        ${
                            favorite
                                ? "★"
                                : "☆"
                        }
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
                "Der App-Grid wurde nicht gefunden.",
                "warning"
            );

            return;

        }


        if (
            !Array.isArray(apps) ||
            apps.length === 0
        ) {

            grid.innerHTML =
                "";


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
        visible
    ) {

        const element =
            document.querySelector(
                SELECTORS.empty
            );


        if (!element) {

            return;

        }


        element.hidden =
            !visible;

    }


    /* ========================================================
       10 — KATEGORIEN
       ======================================================== */

    function renderCategories() {

        const container =
            getCategoryList();


        const manager =
            window.HalDoAppManager;


        if (
            !container ||
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
                                class="haldo-category-button ${
                                    active
                                        ? "active"
                                        : ""
                                }"
                                data-category="${escapeHTML(
                                    category.id
                                )}"
                                aria-pressed="${active}"
                            >

                                <span>
                                    ${escapeHTML(
                                        category.name
                                    )}
                                </span>

                                <span>
                                    ${
                                        Number(
                                            category.count
                                        ) || 0
                                    }
                                </span>

                            </button>
                        `;

                    }
                )
                .join("");


        bindCategoryButtons();

    }


    /* ========================================================
       11 — APP FILTER
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


        /*
         * Suchfilter.
         */

        if (
            state.searchTerm
        ) {

            const searched =
                manager.searchApps(
                    state.searchTerm
                );


            /*
             * Kategorie weiterhin beachten.
             */

            if (
                state.activeCategory ===
                "all"
            ) {

                apps =
                    searched;

            }
            else if (
                state.activeCategory ===
                "favorites"
            ) {

                apps =
                    searched.filter(
                        app =>
                            app.favorite
                    );

            }
            else {

                apps =
                    searched.filter(
                        app =>
                            app.category ===
                            state.activeCategory
                    );

            }

        }


        return apps;

    }


    /* ========================================================
       12 — RENDER
       ======================================================== */

    function render() {

        const manager =
            window.HalDoAppManager;


        if (
            !manager
        ) {

            return;

        }


        state.apps =
            manager.getAllApps();


        renderCategories();


        renderApps(
            getDisplayedApps()
        );


        updateStateAttributes();

    }


    /* ========================================================
       13 — STATUS ATTRIBUTE
       ======================================================== */

    function updateStateAttributes() {

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
       14 — KATEGORIEN
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

                            setCategory(
                                button.dataset.category ||
                                "all"
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


                    const manager =
                        window.HalDoAppManager;


                    if (
                        manager &&
                        typeof manager.setSearch ===
                        "function"
                    ) {

                        manager.setSearch(
                            ""
                        );

                    }


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


        /*
         * App öffnen.
         */

        grid
            .querySelectorAll(
                ".haldo-app-launch"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function (event) {

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
                                appId
                            ) {

                                launchApp(
                                    appId
                                );

                            }

                        }
                    );

                }
            );


        /*
         * Favoriten.
         */

        grid
            .querySelectorAll(
                ".haldo-app-favorite"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();
                            event.stopPropagation();


                            toggleFavorite(
                                button.dataset.favoriteId
                            );

                        }
                    );


                    button.addEventListener(
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
                                    button.dataset.favoriteId
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


        manager.toggleFavorite(
            appId
        );


        render();

    }


    /* ========================================================
       18 — APP ROUTER
       ======================================================== */

    function getRouter() {

        return window.HalDoAppRouter ||
            null;

    }


    function launchApp(
        appId
    ) {

        const manager =
            window.HalDoAppManager;


        if (
            !manager
        ) {

            log(
                "App Manager ist nicht verfügbar.",
                "error"
            );

            return false;

        }


        const app =
            manager.getApp(
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


        /*
         * Deaktivierte App.
         */

        if (
            app.enabled === false
        ) {

            showAppMessage(
                app,
                "Diese App ist momentan deaktiviert."
            );

            return false;

        }


        const router =
            getRouter();


        /*
         * Router vorhanden:
         * IMMER den Router verwenden.
         */

        if (
            router &&
            typeof router.open ===
            "function"
        ) {

            const launcher =
                getLauncher();


            if (
                launcher
            ) {

                launcher.hidden =
                    true;

            }


            router.open(
                app.id
            );


            return true;

        }


        /*
         * Router noch nicht geladen.
         *
         * Wir öffnen KEINEN Pfad.
         * Dadurch entsteht kein 404.
         */

        showAppMessage(
            app,
            "Der HalDo App Router wird noch geladen. Bitte kurz warten."
        );


        return false;

    }


    /* ========================================================
       19 — SICHERE APP-MELDUNG
       ======================================================== */

    function showAppMessage(
        app,
        message
    ) {

        const existing =
            document.getElementById(
                "haldo-launcher-message"
            );


        if (
            existing
        ) {

            existing.remove();

        }


        const box =
            document.createElement(
                "div"
            );


        box.id =
            "haldo-launcher-message";


        box.className =
            "haldo-launcher-message";


        box.innerHTML = `

            <div
                class="haldo-launcher-message-inner"
            >

                <div
                    class="haldo-launcher-message-icon"
                >
                    ${escapeHTML(
                        app?.icon ||
                        "◇"
                    )}
                </div>

                <strong>
                    ${escapeHTML(
                        app?.name ||
                        "HalDo AI OS"
                    )}
                </strong>

                <p>
                    ${escapeHTML(
                        message
                    )}
                </p>

                <button
                    type="button"
                    class="haldo-primary-button"
                    data-close-launcher-message
                >
                    OK
                </button>

            </div>

        `;


        document.body.appendChild(
            box
        );


        const close =
            box.querySelector(
                "[data-close-launcher-message]"
            );


        if (
            close
        ) {

            close.addEventListener(
                "click",
                function () {

                    box.remove();

                }
            );

        }

    }


    /* ========================================================
       20 — ROUTER EVENTS
       ======================================================== */

    function connectRouter() {

        const router =
            getRouter();


        if (
            !router
        ) {

            return;

        }


        router.on(
            "closed",
            function () {

                const launcher =
                    getLauncher();


                if (
                    launcher
                ) {

                    launcher.hidden =
                        false;

                }


                render();

            }
        );


        router.on(
            "opened",
            function () {

                const launcher =
                    getLauncher();


                if (
                    launcher
                ) {

                    launcher.hidden =
                        true;

                }

            }
        );

    }


    /* ========================================================
       21 — APP MANAGER VERBINDUNG
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
         * Events.
         */

        manager.on(
            "apps:loaded",
            function () {

                state.apps =
                    manager.getAllApps();


                finishInitialization();

            }
        );


        manager.on(
            "apps:registered",
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
            "app:favorite",
            function () {

                render();

            }
        );


        /*
         * Bereits geladen?
         */

        const managerState =
            manager.getState();


        if (
            managerState.ready
        ) {

            finishInitialization();

        }

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


        connectRouter();


        render();


        const launcher =
            getLauncher();


        if (
            launcher
        ) {

            launcher.classList.add(
                "ready"
            );

            launcher.hidden =
                false;

        }


        /*
         * Kernel registrieren.
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


        log(
            "Launcher ist bereit."
        );

    }


    /* ========================================================
       23 — STATUS
       ======================================================== */

    function getState() {

        return {

            ...state,

            apps:
                [
                    ...state.apps
                ],

            categories:
                [
                    ...state.categories
                ]

        };

    }


    /* ========================================================
       24 — PUBLIC API
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

        getState

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

        connectAppManager();

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