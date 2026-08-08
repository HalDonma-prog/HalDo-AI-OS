/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/launcher.js

   Aufgabe:
   - HalDo App Launcher
   - Apps aus HalDoAppManager laden
   - App-Suche
   - Kategorien
   - Favoriten
   - App-Karten
   - Navigation über HalDoAppRouter
   - Keine eigene App-Datenbank
   - Keine direkten 404-Links
   ============================================================ */

"use strict";


(function (window, document) {


    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const CONFIG = {

        name:
            "HalDo Launcher",

        version:
            "18.0.0",

        defaultContainer:
            "#app-launcher",

        searchPlaceholder:
            "Apps durchsuchen..."

    };


    /* ========================================================
       02 — STATUS
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        search:
            "",

        category:
            "all",

        favoritesOnly:
            false

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


    function emit(
        eventName,
        data = null
    ) {

        if (
            !listeners[eventName]
        ) {

            return;

        }


        listeners[eventName]
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
       05 — MANAGER
       ======================================================== */

    function getManager() {

        return (
            window.HalDoAppManager ||
            null
        );

    }


    /* ========================================================
       06 — ROUTER
       ======================================================== */

    function getRouter() {

        return (
            window.HalDoAppRouter ||
            null
        );

    }


    /* ========================================================
       07 — CONTAINER
       ======================================================== */

    function getContainer(
        selector = CONFIG.defaultContainer
    ) {

        if (
            typeof selector ===
            "string"
        ) {

            return document.querySelector(
                selector
            );

        }


        if (
            selector instanceof
            HTMLElement
        ) {

            return selector;

        }


        return null;

    }


    /* ========================================================
       08 — CONTAINER ERSTELLEN
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
                "section"
            );


        container.id =
            "app-launcher";


        container.className =
            "haldo-app-launcher";


        container.setAttribute(
            "data-haldo-launcher",
            "true"
        );


        document.body.appendChild(
            container
        );


        return container;

    }


    /* ========================================================
       09 — APPS
       ======================================================== */

    function getApps() {

        const manager =
            getManager();


        if (
            !manager
        ) {

            return [];

        }


        if (
            typeof manager.getManagedApps ===
            "function"
        ) {

            return manager.getManagedApps();

        }


        if (
            typeof manager.getAllApps ===
            "function"
        ) {

            return manager.getAllApps();

        }


        return [];

    }


    /* ========================================================
       10 — FILTER
       ======================================================== */

    function getFilteredApps() {

        let apps =
            getApps();


        /*
         * Nur aktive Apps.
         */

        apps =
            apps.filter(
                app =>
                    app.enabled !==
                    false
            );


        /*
         * Kategorie.
         */

        if (
            state.category !==
            "all"
        ) {

            apps =
                apps.filter(
                    app =>
                        app.category ===
                        state.category
                );

        }


        /*
         * Favoriten.
         */

        if (
            state.favoritesOnly
        ) {

            apps =
                apps.filter(
                    app =>
                        app.favorite ===
                        true
                );

        }


        /*
         * Suche.
         */

        const query =
            state.search
                .trim()
                .toLowerCase();


        if (
            query
        ) {

            apps =
                apps.filter(
                    app => {

                        const text =
                            [

                                app.id,

                                app.title,

                                app.name,

                                app.description,

                                app.category,

                                ...(app.keywords || [])

                            ]
                            .join(
                                " "
                            )
                            .toLowerCase();


                        return text.includes(
                            query
                        );

                    }
                );

        }


        /*
         * Sortierung.
         */

        apps.sort(
            (
                a,
                b
            ) => {

                const orderA =
                    Number(
                        a.order
                    );


                const orderB =
                    Number(
                        b.order
                    );


                return (
                    (
                        Number.isFinite(
                            orderA
                        )
                            ? orderA
                            : 999999
                    ) -
                    (
                        Number.isFinite(
                            orderB
                        )
                            ? orderB
                            : 999999
                    )
                );

            }
        );


        return apps;

    }


    /* ========================================================
       11 — KATEGORIEN
       ======================================================== */

    function getCategories() {

        const manager =
            getManager();


        if (
            !manager ||
            typeof manager.getCategories !==
                "function"
        ) {

            return [];

        }


        return manager.getCategories();

    }


    /* ========================================================
       12 — ICON
       ======================================================== */

    function createIcon(
        app
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "haldo-launcher-icon";


        /*
         * HalDo Logo.
         */

        if (
            typeof app.icon ===
                "string" &&
            (
                app.icon.includes(
                    "/"
                ) ||
                app.icon.endsWith(
                    ".png"
                ) ||
                app.icon.endsWith(
                    ".jpg"
                ) ||
                app.icon.endsWith(
                    ".jpeg"
                ) ||
                app.icon.endsWith(
                    ".webp"
                )
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


            image.loading =
                "lazy";


            image.onerror =
                function () {

                    image.remove();


                    wrapper.textContent =
                        "◉";

                };


            wrapper.appendChild(
                image
            );


            return wrapper;

        }


        /*
         * Emoji / Text Icon.
         */

        wrapper.textContent =
            app.icon ||
            "◉";


        return wrapper;

    }


    /* ========================================================
       13 — APP-KARTE
       ======================================================== */

    function createAppCard(
        app
    ) {

        const card =
            document.createElement(
                "button"
            );


        card.type =
            "button";


        card.className =
            "haldo-launcher-app";


        card.dataset.appId =
            app.id;


        card.setAttribute(
            "aria-label",
            `App öffnen: ${
                app.title ||
                app.name ||
                app.id
            }`
        );


        const icon =
            createIcon(
                app
            );


        const title =
            document.createElement(
                "span"
            );


        title.className =
            "haldo-launcher-app-title";


        title.textContent =
            app.title ||
            app.name ||
            app.id;


        const category =
            document.createElement(
                "span"
            );


        category.className =
            "haldo-launcher-app-category";


        category.textContent =
            app.category ||
            "App";


        card.appendChild(
            icon
        );


        card.appendChild(
            title
        );


        card.appendChild(
            category
        );


        /*
         * Favoriten-Symbol.
         */

        if (
            app.favorite ===
            true
        ) {

            const favorite =
                document.createElement(
                    "span"
                );


            favorite.className =
                "haldo-launcher-favorite";


            favorite.textContent =
                "★";


            favorite.setAttribute(
                "aria-label",
                "Favorit"
            );


            card.appendChild(
                favorite
            );

        }


        /*
         * Öffnen.
         */

        card.addEventListener(
            "click",
            function () {

                openApp(
                    app.id
                );

            }
        );


        return card;

    }


    /* ========================================================
       14 — APP ÖFFNEN
       ======================================================== */

    function openApp(
        appId
    ) {

        const router =
            getRouter();


        if (
            router &&
            typeof router.navigate ===
                "function"
        ) {

            const result =
                router.navigate(
                    appId
                );


            emit(
                "app:open",
                {
                    appId,
                    result
                }
            );


            return result;

        }


        log(
            "App Router ist noch nicht verfügbar.",
            "warning"
        );


        emit(
            "app:open",
            {
                appId,
                result:
                    false
            }
        );


        return false;

    }


    /* ========================================================
       15 — SUCHFELD
       ======================================================== */

    function createSearch() {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "haldo-launcher-search";


        const input =
            document.createElement(
                "input"
            );


        input.type =
            "search";


        input.placeholder =
            CONFIG.searchPlaceholder;


        input.autocomplete =
            "off";


        input.spellcheck =
            false;


        input.value =
            state.search;


        input.setAttribute(
            "aria-label",
            "Apps durchsuchen"
        );


        input.addEventListener(
            "input",
            function () {

                state.search =
                    input.value;


                renderGrid();

            }
        );


        wrapper.appendChild(
            input
        );


        return wrapper;

    }


    /* ========================================================
       16 — KATEGORIE-NAVIGATION
       ======================================================== */

    function createCategoryBar() {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "haldo-launcher-categories";


        const allButton =
            createCategoryButton(
                "all",
                "Alle"
            );


        wrapper.appendChild(
            allButton
        );


        const categories =
            getCategories();


        categories.forEach(
            category => {

                const button =
                    createCategoryButton(
                        category.id,
                        category.name ||
                        category.id
                    );


                wrapper.appendChild(
                    button
                );

            }
        );


        const favorites =
            document.createElement(
                "button"
            );


        favorites.type =
            "button";


        favorites.className =
            "haldo-launcher-category";


        if (
            state.favoritesOnly
        ) {

            favorites.classList.add(
                "active"
            );

        }


        favorites.textContent =
            "★ Favoriten";


        favorites.addEventListener(
            "click",
            function () {

                state.favoritesOnly =
                    !state.favoritesOnly;


                render();

            }
        );


        wrapper.appendChild(
            favorites
        );


        return wrapper;

    }


    /* ========================================================
       17 — KATEGORIE-BUTTON
       ======================================================== */

    function createCategoryButton(
        id,
        label
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "haldo-launcher-category";


        if (
            state.category ===
            id &&
            !state.favoritesOnly
        ) {

            button.classList.add(
                "active"
            );

        }


        button.textContent =
            label;


        button.addEventListener(
            "click",
            function () {

                state.category =
                    id;


                state.favoritesOnly =
                    false;


                render();

            }
        );


        return button;

    }


    /* ========================================================
       18 — GRID
       ======================================================== */

    function renderGrid() {

        const container =
            ensureContainer();


        const grid =
            container.querySelector(
                ".haldo-launcher-grid"
            );


        if (
            !grid
        ) {

            return;

        }


        grid.innerHTML =
            "";


        const apps =
            getFilteredApps();


        if (
            apps.length ===
            0
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "haldo-launcher-empty";


            empty.textContent =
                state.search
                    ? "Keine passende App gefunden."
                    : "Keine Apps verfügbar.";


            grid.appendChild(
                empty
            );


            updateCount(
                0
            );


            return;

        }


        apps.forEach(
            app => {

                grid.appendChild(
                    createAppCard(
                        app
                    )
                );

            }
        );


        updateCount(
            apps.length
        );


        emit(
            "render",
            {
                apps
            }
        );

    }


    /* ========================================================
       19 — COUNT
       ======================================================== */

    function updateCount(
        count
    ) {

        const element =
            document.querySelector(
                "[data-haldo-launcher-count]"
            );


        if (
            element
        ) {

            element.textContent =
                `${count} Apps`;

        }

    }


    /* ========================================================
       20 — TITEL
       ======================================================== */

    function createHeader() {

        const header =
            document.createElement(
                "div"
            );


        header.className =
            "haldo-launcher-header";


        const title =
            document.createElement(
                "h2"
            );


        title.textContent =
            "HalDo AI Apps";


        const count =
            document.createElement(
                "span"
            );


        count.dataset.haldoLauncherCount =
            "true";


        count.className =
            "haldo-launcher-count";


        count.textContent =
            "0 Apps";


        header.appendChild(
            title
        );


        header.appendChild(
            count
        );


        return header;

    }


    /* ========================================================
       21 — RENDER
       ======================================================== */

    function render() {

        const container =
            ensureContainer();


        container.innerHTML =
            "";


        container.appendChild(
            createHeader()
        );


        container.appendChild(
            createSearch()
        );


        container.appendChild(
            createCategoryBar()
        );


        const grid =
            document.createElement(
                "div"
            );


        grid.className =
            "haldo-launcher-grid";


        container.appendChild(
            grid
        );


        renderGrid();


        return true;

    }


    /* ========================================================
       22 — ÖFFNEN
       ======================================================== */

    function show() {

        const container =
            ensureContainer();


        container.hidden =
            false;


        render();


        return true;

    }


    /* ========================================================
       23 — VERSTECKEN
       ======================================================== */

    function hide() {

        const container =
            getContainer();


        if (
            container
        ) {

            container.hidden =
                true;

        }


        return true;

    }


    /* ========================================================
       24 — SUCHE SETZEN
       ======================================================== */

    function setSearch(
        query
    ) {

        state.search =
            String(
                query ||
                ""
            );


        render();


        return state.search;

    }


    /* ========================================================
       25 — KATEGORIE SETZEN
       ======================================================== */

    function setCategory(
        category
    ) {

        state.category =
            String(
                category ||
                "all"
            )
            .trim()
            .toLowerCase();


        state.favoritesOnly =
            false;


        render();


        return state.category;

    }


    /* ========================================================
       26 — FAVORITEN
       ======================================================== */

    function showFavorites() {

        state.favoritesOnly =
            true;


        state.category =
            "all";


        render();


        return true;

    }


    /* ========================================================
       27 — RESET
       ======================================================== */

    function resetFilters() {

        state.search =
            "";

        state.category =
            "all";

        state.favoritesOnly =
            false;


        render();


        return true;

    }


    /* ========================================================
       28 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        return {

            launcher: {

                name:
                    CONFIG.name,

                version:
                    CONFIG.version,

                initialized:
                    state.initialized,

                ready:
                    state.ready,

                search:
                    state.search,

                category:
                    state.category,

                favoritesOnly:
                    state.favoritesOnly

            },

            manager:
                Boolean(
                    getManager()
                ),

            router:
                Boolean(
                    getRouter()
                ),

            container:
                Boolean(
                    getContainer()
                )

        };

    }


    /* ========================================================
       29 — STATUS
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            search:
                state.search,

            category:
                state.category,

            favoritesOnly:
                state.favoritesOnly

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
         * Launcher-Element nicht zwingend
         * beim Start erstellen.
         *
         * Dadurch kann die index.html
         * ihre eigene Oberfläche verwenden.
         */

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
                "launcher",
                api
            );

        }


        if (
            window.HalDoKernel &&
            typeof window.HalDoKernel.registerModule ===
                "function"
        ) {

            window.HalDoKernel.registerModule(
                "launcher",
                api
            );


            if (
                typeof window.HalDoKernel.setModuleReady ===
                    "function"
            ) {

                window.HalDoKernel.setModuleReady(
                    "launcher",
                    true
                );

            }

        }


        /*
         * Falls bereits ein Launcher-Container
         * in der Seite existiert, rendern.
         */

        if (
            getContainer()
        ) {

            render();

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
       31 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,


        init,


        on,


        getApps,

        getFilteredApps,

        getCategories,


        render,

        renderGrid,


        show,

        hide,


        openApp,


        setSearch,

        setCategory,

        showFavorites,

        resetFilters,


        getState,

        diagnose

    };


    /* ========================================================
       32 — GLOBAL
       ======================================================== */

    window.HalDoLauncher =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.launcher =
        api;


    /* ========================================================
       33 — START
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
   ENDE — HALDO AI OS 18 LAUNCHER
   ============================================================ */