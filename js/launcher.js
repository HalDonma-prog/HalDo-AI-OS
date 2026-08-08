/* ============================================================
   HALDO AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei:
   js/launcher.js

   Aufgaben:
   - komplettes App-Menü
   - App-Kacheln
   - Kategorien
   - Favoriten
   - Suche
   - App öffnen
   - Router-Verbindung
   - responsive Darstellung
   - sichere Navigation
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

        grid:
            "#haldo-app-grid",

        search:
            "#haldo-app-search",

        categories:
            "#haldo-app-categories",

        count:
            "[data-haldo-app-count]",

        empty:
            "[data-haldo-app-empty]"

    };


    /* ========================================================
       02 — STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        apps:
            [],

        filteredApps:
            [],

        search:
            "",

        category:
            "all",

        loading:
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
                            "[HalDo Launcher] Event-Fehler:",
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
            "[HalDo Launcher]";


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
       05 — ELEMENTE
       ======================================================== */

    function getLauncher() {

        return document.querySelector(
            SELECTORS.launcher
        );

    }


    function getGrid() {

        return document.querySelector(
            SELECTORS.grid
        );

    }


    function getSearch() {

        return document.querySelector(
            SELECTORS.search
        );

    }


    function getCategories() {

        return document.querySelector(
            SELECTORS.categories
        );

    }


    /* ========================================================
       06 — MANAGER
       ======================================================== */

    function getManager() {

        return (
            window.HalDoAppManager ||
            null
        );

    }


    /* ========================================================
       07 — ROUTER
       ======================================================== */

    function getRouter() {

        return (
            window.HalDoAppRouter ||
            null
        );

    }


    /* ========================================================
       08 — HTML ESCAPEN
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
       09 — ICON
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


    function renderIcon(
        icon
    ) {

        if (
            isImageIcon(
                icon
            )
        ) {

            return `
                <img
                    src="${escapeHTML(icon)}"
                    alt=""
                    class="haldo-app-icon-image"
                    loading="lazy"
                >
            `;

        }


        return `
            <span
                class="haldo-app-icon-symbol"
                aria-hidden="true"
            >
                ${escapeHTML(
                    icon || "◇"
                )}
            </span>
        `;

    }


    /* ========================================================
       10 — APPS LADEN
       ======================================================== */

    function loadApps() {

        const manager =
            getManager();


        if (
            !manager
        ) {

            log(
                "App Manager ist noch nicht verfügbar.",
                "warning"
            );


            state.apps =
                [];


            applyFilters();


            return [];

        }


        try {

            state.apps =
                manager.getAllApps();


            applyFilters();


            emit(
                "apps:loaded",
                state.apps
            );


            return state.apps;

        }
        catch (
            error
        ) {

            log(
                `Apps konnten nicht geladen werden: ${error.message}`,
                "error"
            );


            state.apps =
                [];


            applyFilters();


            return [];

        }

    }


    /* ========================================================
       11 — FILTER
       ======================================================== */

    function applyFilters() {

        let result =
            [
                ...state.apps
            ];


        /*
         * Kategorie
         */

        if (
            state.category &&
            state.category !==
                "all"
        ) {

            if (
                state.category ===
                "favorites"
            ) {

                result =
                    result.filter(
                        app =>
                            app.favorite ===
                            true
                    );

            }
            else {

                result =
                    result.filter(
                        app =>
                            app.category ===
                            state.category
                    );

            }

        }


        /*
         * Suche
         */

        const query =
            state.search
                .trim()
                .toLowerCase();


        if (
            query
        ) {

            result =
                result.filter(
                    app => {

                        const searchable =
                            [

                                app.id,

                                app.name,

                                app.title,

                                app.description,

                                app.category,

                                ...(app.keywords || [])

                            ]
                            .join(
                                " "
                            )
                            .toLowerCase();


                        return searchable.includes(
                            query
                        );

                    }
                );

        }


        state.filteredApps =
            result;


        renderApps();

    }


    /* ========================================================
       12 — APP KACHEL
       ======================================================== */

    function createAppCard(
        app
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "haldo-app-card";


        card.tabIndex =
            0;


        card.dataset.appId =
            app.id;


        card.setAttribute(
            "role",
            "button"
        );


        card.setAttribute(
            "aria-label",
            `App ${app.title || app.name} öffnen`
        );


        if (
            app.favorite
        ) {

            card.classList.add(
                "is-favorite"
            );

        }


        card.innerHTML = `

            <div
                class="haldo-app-card-top"
            >

                <div
                    class="haldo-app-card-icon"
                >
                    ${renderIcon(
                        app.icon
                    )}
                </div>

                <button
                    type="button"
                    class="haldo-app-favorite"
                    data-favorite-id="${escapeHTML(
                        app.id
                    )}"
                    aria-label="${
                        app.favorite
                            ? "Favorit entfernen"
                            : "Als Favorit markieren"
                    }"
                    aria-pressed="${
                        app.favorite
                            ? "true"
                            : "false"
                    }"
                >
                    ${
                        app.favorite
                            ? "★"
                            : "☆"
                    }
                </button>

            </div>


            <div
                class="haldo-app-card-body"
            >

                <h3
                    class="haldo-app-card-title"
                >
                    ${escapeHTML(
                        app.title ||
                        app.name
                    )}
                </h3>

                <p
                    class="haldo-app-card-description"
                >
                    ${escapeHTML(
                        app.description ||
                        ""
                    )}
                </p>

                <span
                    class="haldo-app-card-category"
                >
                    ${escapeHTML(
                        categoryName(
                            app.category
                        )
                    )}
                </span>

            </div>

        `;


        /*
         * App öffnen.
         */

        card.addEventListener(
            "click",
            function (event) {

                if (
                    event.target.closest(
                        "[data-favorite-id]"
                    )
                ) {

                    return;

                }


                openApp(
                    app.id
                );

            }
        );


        /*
         * Tastatur.
         */

        card.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !==
                        "Enter" &&
                    event.key !==
                        " "
                ) {

                    return;

                }


                if (
                    event.target.closest(
                        "[data-favorite-id]"
                    )
                ) {

                    return;

                }


                event.preventDefault();


                openApp(
                    app.id
                );

            }
        );


        /*
         * Favorit.
         */

        const favorite =
            card.querySelector(
                "[data-favorite-id]"
            );


        if (
            favorite
        ) {

            favorite.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    toggleFavorite(
                        app.id
                    );

                }
            );

        }


        return card;

    }


    /* ========================================================
       13 — APPS RENDERN
       ======================================================== */

    function renderApps() {

        const grid =
            getGrid();


        if (
            !grid
        ) {

            return;

        }


        grid.innerHTML =
            "";


        const apps =
            state.filteredApps;


        if (
            apps.length ===
            0
        ) {

            showEmptyState();

            updateCount(
                0
            );


            return;

        }


        hideEmptyState();


        const fragment =
            document.createDocumentFragment();


        apps.forEach(
            app => {

                fragment.appendChild(
                    createAppCard(
                        app
                    )
                );

            }
        );


        grid.appendChild(
            fragment
        );


        updateCount(
            apps.length
        );


        emit(
            "rendered",
            apps
        );

    }


    /* ========================================================
       14 — EMPTY
       ======================================================== */

    function showEmptyState() {

        const empty =
            document.querySelector(
                SELECTORS.empty
            );


        if (
            empty
        ) {

            empty.hidden =
                false;

        }


        const grid =
            getGrid();


        if (
            grid
        ) {

            grid.setAttribute(
                "data-empty",
                "true"
            );

        }

    }


    function hideEmptyState() {

        const empty =
            document.querySelector(
                SELECTORS.empty
            );


        if (
            empty
        ) {

            empty.hidden =
                true;

        }


        const grid =
            getGrid();


        if (
            grid
        ) {

            grid.removeAttribute(
                "data-empty"
            );

        }

    }


    /* ========================================================
       15 — APP COUNT
       ======================================================== */

    function updateCount(
        count
    ) {

        document
            .querySelectorAll(
                SELECTORS.count
            )
            .forEach(
                element => {

                    element.textContent =
                        String(
                            count
                        );

                }
            );

    }


    /* ========================================================
       16 — KATEGORIEN
       ======================================================== */

    function renderCategories() {

        const container =
            getCategories();


        if (
            !container
        ) {

            return;

        }


        const manager =
            getManager();


        if (
            !manager ||
            typeof manager.getCategories !==
                "function"
        ) {

            return;

        }


        const categories =
            manager.getCategories();


        container.innerHTML =
            "";


        const fragment =
            document.createDocumentFragment();


        categories.forEach(
            category => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "haldo-app-category";


                if (
                    category.id ===
                    state.category
                ) {

                    button.classList.add(
                        "active"
                    );

                }


                button.dataset.category =
                    category.id;


                button.innerHTML = `

                    <span
                        class="haldo-app-category-name"
                    >
                        ${escapeHTML(
                            category.name
                        )}
                    </span>

                    <span
                        class="haldo-app-category-count"
                    >
                        ${escapeHTML(
                            category.count
                        )}
                    </span>

                `;


                button.addEventListener(
                    "click",
                    function () {

                        setCategory(
                            category.id
                        );

                    }
                );


                fragment.appendChild(
                    button
                );

            }
        );


        container.appendChild(
            fragment
        );

    }


    /* ========================================================
       17 — KATEGORIENNAME
       ======================================================== */

    function categoryName(
        category
    ) {

        const names = {

            ai:
                "KI & AI",

            communication:
                "Kommunikation",

            productivity:
                "Produktivität",

            tools:
                "Werkzeuge",

            files:
                "Dateien",

            media:
                "Medien",

            internet:
                "Internet",

            education:
                "Lernen",

            development:
                "Entwicklung",

            security:
                "Sicherheit",

            settings:
                "Einstellungen",

            system:
                "System",

            other:
                "Weitere Apps"

        };


        return (
            names[category] ||
            String(
                category ||
                "Weitere Apps"
            )
            .replace(
                /-/g,
                " "
            )
        );

    }


    /* ========================================================
       18 — KATEGORIE SETZEN
       ======================================================== */

    function setCategory(
        category
    ) {

        const manager =
            getManager();


        state.category =
            String(
                category ||
                "all"
            )
            .trim()
            .toLowerCase();


        if (
            manager &&
            typeof manager.setCategory ===
                "function"
        ) {

            manager.setCategory(
                state.category
            );

        }


        renderCategories();


        applyFilters();


        emit(
            "category:changed",
            state.category
        );


        return state.category;

    }


    /* ========================================================
       19 — SUCHE
       ======================================================== */

    function setSearch(
        query
    ) {

        state.search =
            String(
                query ||
                ""
            );


        const manager =
            getManager();


        if (
            manager &&
            typeof manager.setSearch ===
                "function"
        ) {

            manager.setSearch(
                state.search
            );

        }


        applyFilters();


        emit(
            "search:changed",
            state.search
        );


        return state.search;

    }


    /* ========================================================
       20 — FAVORIT
       ======================================================== */

    function toggleFavorite(
        appId
    ) {

        const manager =
            getManager();


        if (
            !manager ||
            typeof manager.toggleFavorite !==
                "function"
        ) {

            return false;

        }


        const result =
            manager.toggleFavorite(
                appId
            );


        loadApps();


        renderCategories();


        emit(
            "favorite:changed",
            {
                appId,

                favorite:
                    result

            }
        );


        return result;

    }


    /* ========================================================
       21 — APP ÖFFNEN
       ======================================================== */

    async function openApp(
        appId
    ) {

        const router =
            getRouter();


        if (
            !router
        ) {

            log(
                "App Router ist nicht verfügbar.",
                "error"
            );


            return false;

        }


        try {

            const result =
                await router.open(
                    appId
                );


            emit(
                "app:opened",
                {
                    appId,

                    result

                }
            );


            return result;

        }
        catch (
            error
        ) {

            log(
                `App konnte nicht geöffnet werden: ${error.message}`,
                "error"
            );


            return false;

        }

    }


    /* ========================================================
       22 — SUCHFELD VERBINDEN
       ======================================================== */

    function bindSearch() {

        const search =
            getSearch();


        if (
            !search
        ) {

            return;

        }


        search.value =
            state.search;


        search.addEventListener(
            "input",
            function () {

                setSearch(
                    search.value
                );

            }
        );


        search.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    search.value =
                        "";


                    setSearch(
                        ""
                    );


                    search.blur();

                }

            }
        );

    }


    /* ========================================================
       23 — MANAGER EVENTS
       ======================================================== */

    function bindManagerEvents() {

        const manager =
            getManager();


        if (
            !manager ||
            typeof manager.on !==
                "function"
        ) {

            return;

        }


        manager.on(
            "apps:loaded",
            function () {

                loadApps();

                renderCategories();

            }
        );


        manager.on(
            "app:favorite",
            function () {

                loadApps();

                renderCategories();

            }
        );


        manager.on(
            "categories:updated",
            function () {

                renderCategories();

            }
        );

    }


    /* ========================================================
       24 — ROUTER EVENTS
       ======================================================== */

    function bindRouterEvents() {

        const router =
            getRouter();


        if (
            !router ||
            typeof router.on !==
                "function"
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

            }
        );

    }


    /* ========================================================
       25 — INITIALISIERUNG
       ======================================================== */

    function init() {

        if (
            state.initialized
        ) {

            return getState();

        }


        state.initialized =
            true;


        state.loading =
            true;


        /*
         * Grundstruktur prüfen.
         */

        const launcher =
            getLauncher();


        if (
            !launcher
        ) {

            log(
                "Launcher-Container #haldo-launcher wurde nicht gefunden.",
                "warning"
            );

        }


        loadApps();


        renderCategories();


        bindSearch();


        bindManagerEvents();


        bindRouterEvents();


        state.loading =
            false;


        state.ready =
            true;


        /*
         * Kernel informieren.
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


            window.HalDoKernel.setModuleReady(
                "launcher",
                true
            );

        }


        /*
         * System registrieren.
         */

        if (
            window.HalDoSystem &&
            typeof window.HalDoSystem.registerService ===
                "function"
        ) {

            window.HalDoSystem.registerService(
                "launcher",
                api
            );

        }


        emit(
            "ready",
            getState()
        );


        log(
            "Launcher ist bereit."
        );


        return getState();

    }


    /* ========================================================
       26 — REFRESH
       ======================================================== */

    function refresh() {

        loadApps();

        renderCategories();


        return state.filteredApps;

    }


    /* ========================================================
       27 — STATUS
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            loading:
                state.loading,

            appCount:
                state.apps.length,

            visibleCount:
                state.filteredApps.length,

            search:
                state.search,

            category:
                state.category

        };

    }


    /* ========================================================
       28 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            "HalDo Launcher",

        version:
            VERSION,


        init,


        refresh,


        loadApps,


        renderApps,

        renderCategories,


        openApp,


        setSearch,

        setCategory,

        toggleFavorite,


        getState,


        on,

        emit

    };


    /* ========================================================
       29 — GLOBAL
       ======================================================== */

    window.HalDoLauncher =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.launcher =
        api;


    /* ========================================================
       30 — START
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
   ENDE — HALDO AI OS 18 LAUNCHER
   ============================================================ */