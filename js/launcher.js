/* ============================================================
   HALDO AI OS 18
   PROFESSIONAL ULTIMATE FOUNDATION
   ------------------------------------------------------------
   Datei:
   js/launcher.js

   ZENTRALER HALDO LAUNCHER

   Architektur:

       kernel.js
           ↓
       system.js
           ↓
       app-registry.js
           ↓
       app-manager.js
           ↓
       app-router.js
           ↓
       launcher.js
           ↓
       app-launcher.js
           ↓
       echte Apps

   WICHTIG:
   - keine eigene App-Datenbank
   - Registry bleibt Quelle der App-Definitionen
   - Manager verwaltet App-Zustände
   - Router verwaltet Navigation
   - Launcher verbindet alles miteinander
   ============================================================ */

"use strict";

(function (window, document) {

    /* ========================================================
       01 — KONFIGURATION
       ======================================================== */

    const CONFIG = {

        name: "HalDo AI OS Launcher",

        version: "18.0.0",

        container: "#app-launcher",

        searchDelay: 120,

        maxVisibleApps: 500,

        autoCreateContainer: true,

        keyboardEnabled: true

    };


    /* ========================================================
       02 — STATUS
       ======================================================== */

    const state = {

        initialized: false,

        ready: false,

        visible: false,

        search: "",

        category: "all",

        favoritesOnly: false,

        selectedApp: null,

        launchCount: 0,

        renderCount: 0,

        lastError: null,

        lastAction: null,

        managerReady: false,

        registryReady: false,

        routerReady: false

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

        const callbacks =
            listeners[eventName];

        if (!callbacks) {
            return;
        }

        callbacks
            .slice()
            .forEach(callback => {

                try {

                    callback(data);

                } catch (error) {

                    console.error(
                        "[HalDo Launcher] Event-Fehler:",
                        error
                    );

                }

            });
    }


    /* ========================================================
       04 — LOG
       ======================================================== */

    function log(message, type = "info") {

        const prefix =
            "[HalDo Launcher]";

        if (type === "error") {

            console.error(
                prefix,
                message
            );

        } else if (type === "warning") {

            console.warn(
                prefix,
                message
            );

        } else {

            console.log(
                prefix,
                message
            );

        }
    }


    /* ========================================================
       05 — APP MANAGER
       ======================================================== */

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


    /* ========================================================
       06 — APP REGISTRY
       ======================================================== */

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


    /* ========================================================
       07 — APP ROUTER
       ======================================================== */

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


    /* ========================================================
       08 — APP-ID NORMALISIERUNG
       ======================================================== */

    function normalizeAppId(appId) {

        return String(appId || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
    }


    /* ========================================================
       09 — ALLE APPS
       ======================================================== */

    function getAllApps() {

        const manager =
            getManager();

        if (
            manager &&
            typeof manager.getAllApps === "function"
        ) {

            const apps =
                manager.getAllApps();

            if (Array.isArray(apps)) {
                return apps;
            }
        }


        const registry =
            getRegistry();

        if (!registry) {
            return [];
        }


        if (
            typeof registry.getAllApps ===
            "function"
        ) {

            const apps =
                registry.getAllApps();

            if (Array.isArray(apps)) {
                return apps;
            }
        }


        if (
            typeof registry.getAll ===
            "function"
        ) {

            const apps =
                registry.getAll();

            if (Array.isArray(apps)) {
                return apps;
            }
        }


        if (
            Array.isArray(
                registry.definitions
            )
        ) {

            return [
                ...registry.definitions
            ];
        }


        return [];
    }


    /* ========================================================
       10 — EINZELNE APP
       ======================================================== */

    function getApp(appId) {

        const normalized =
            normalizeAppId(appId);

        if (!normalized) {
            return null;
        }


        const manager =
            getManager();

        if (
            manager &&
            typeof manager.getApp ===
            "function"
        ) {

            const app =
                manager.getApp(
                    normalized
                );

            if (app) {
                return app;
            }
        }


        return getAllApps().find(
            app =>
                normalizeAppId(
                    app && app.id
                ) === normalized
        ) || null;
    }


    /* ========================================================
       11 — AKTIVE APPS
       ======================================================== */

    function getEnabledApps() {

        const manager =
            getManager();

        if (
            manager &&
            typeof manager.getEnabledApps ===
            "function"
        ) {

            const apps =
                manager.getEnabledApps();

            if (Array.isArray(apps)) {
                return apps;
            }
        }


        return getAllApps().filter(
            app =>
                app &&
                app.enabled !== false
        );
    }


    /* ========================================================
       12 — FAVORITEN
       ======================================================== */

    function getFavorites() {

        const manager =
            getManager();

        if (
            manager &&
            typeof manager.getFavorites ===
            "function"
        ) {

            const favorites =
                manager.getFavorites();

            if (Array.isArray(favorites)) {
                return favorites;
            }
        }


        return getAllApps().filter(
            app =>
                app &&
                app.favorite === true
        );
    }


    /* ========================================================
       13 — KATEGORIEN
       ======================================================== */

    function getCategories() {

        const manager =
            getManager();

        if (
            manager &&
            typeof manager.getCategories ===
            "function"
        ) {

            const categories =
                manager.getCategories();

            if (Array.isArray(categories)) {
                return categories;
            }
        }


        const categories =
            new Set();

        getAllApps().forEach(
            app => {

                if (
                    app &&
                    app.category
                ) {

                    categories.add(
                        String(
                            app.category
                        )
                    );
                }
            }
        );


        return Array.from(
            categories
        ).sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    "de"
                )
        );
    }


    /* ========================================================
       14 — FILTER
       ======================================================== */

    function getVisibleApps() {

        let apps =
            getEnabledApps();


        if (
            state.favoritesOnly
        ) {

            apps =
                getFavorites();
        }


        if (
            state.category !== "all"
        ) {

            const category =
                String(
                    state.category
                )
                .trim()
                .toLowerCase();

            apps =
                apps.filter(
                    app =>
                        String(
                            app.category || ""
                        )
                        .trim()
                        .toLowerCase() ===
                        category
                );
        }


        const query =
            state.search
                .trim()
                .toLowerCase();


        if (query) {

            apps =
                apps.filter(
                    app => {

                        if (!app) {
                            return false;
                        }

                        const keywords =
                            Array.isArray(
                                app.keywords
                            )
                                ? app.keywords
                                : [];

                        const content =
                            [
                                app.id,
                                app.name,
                                app.title,
                                app.description,
                                app.category,
                                ...keywords
                            ]
                            .filter(
                                value =>
                                    value !==
                                    null &&
                                    value !==
                                    undefined
                            )
                            .join(" ")
                            .toLowerCase();

                        return content.includes(
                            query
                        );
                    }
                );
        }


        apps.sort(
            (a, b) => {

                const orderA =
                    Number(a.order);

                const orderB =
                    Number(b.order);

                const safeA =
                    Number.isFinite(orderA)
                        ? orderA
                        : 999999;

                const safeB =
                    Number.isFinite(orderB)
                        ? orderB
                        : 999999;

                return safeA - safeB;
            }
        );


        return apps.slice(
            0,
            CONFIG.maxVisibleApps
        );
    }


    /* ========================================================
       15 — CONTAINER
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


        if (
            !CONFIG.autoCreateContainer
        ) {

            return null;
        }


        container =
            document.createElement(
                "section"
            );

        container.id =
            "app-launcher";

        container.className =
            "haldo-app-launcher";

        container.dataset.haldoLauncher =
            "true";

        document.body.appendChild(
            container
        );

        return container;
    }


    /* ========================================================
       16 — ICON
       ======================================================== */

    function createIcon(app) {

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "haldo-launcher-icon";


        const icon =
            app &&
            app.icon;


        if (
            typeof icon === "string" &&
            (
                icon.includes("/") ||
                /\.(png|jpg|jpeg|webp|svg)$/i
                    .test(icon)
            )
        ) {

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                icon;

            image.alt =
                app.title ||
                app.name ||
                app.id ||
                "HalDo App";

            image.loading =
                "lazy";

            image.onerror =
                () => {

                    image.remove();

                    wrapper.textContent =
                        "◉";
                };

            wrapper.appendChild(
                image
            );

            return wrapper;
        }


        wrapper.textContent =
            icon ||
            "◉";

        return wrapper;
    }


    /* ========================================================
       17 — APP-KARTE
       ======================================================== */

    function createAppCard(app) {

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


        card.appendChild(
            createIcon(app)
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

        card.appendChild(
            title
        );


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
            category
        );


        if (
            app.favorite === true
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


        card.addEventListener(
            "click",
            () => {

                openApp(
                    app.id
                );

            }
        );


        return card;
    }


    /* ========================================================
       18 — APP ÖFFNEN
       ======================================================== */

    async function openApp(
        appId,
        options = {}
    ) {

        const normalized =
            normalizeAppId(appId);

        if (!normalized) {

            return {
                success: false,
                status: "invalid-app"
            };
        }


        const app =
            getApp(normalized);

        if (!app) {

            const result = {

                success: false,

                status: "not-found",

                appId:
                    normalized,

                error:
                    "App wurde nicht gefunden."
            };

            state.lastError =
                result.error;

            emit(
                "error",
                result
            );

            return result;
        }


        state.selectedApp =
            normalized;

        state.lastAction =
            "open-app";


        emit(
            "app-opening",
            {
                app,
                appId: normalized,
                options
            }
        );


        const router =
            getRouter();


        /*
         * ROUTER IST HAUPTWEG
         */

        if (router) {

            try {

                let result;


                if (
                    typeof router.navigateToApp ===
                    "function"
                ) {

                    result =
                        await router.navigateToApp(
                            normalized,
                            options
                        );

                }
                else if (
                    typeof router.goToApp ===
                    "function"
                ) {

                    result =
                        await router.goToApp(
                            normalized,
                            options
                        );

                }
                else if (
                    typeof router.openApp ===
                    "function"
                ) {

                    result =
                        await router.openApp(
                            normalized,
                            options
                        );

                }
                else if (
                    typeof router.navigate ===
                    "function"
                ) {

                    const route =
                        "#/app/" +
                        normalized;

                    result =
                        await router.navigate(
                            route,
                            options
                        );

                }


                if (result !== undefined) {

                    if (
                        result &&
                        result.success === false
                    ) {

                        state.lastError =
                            result.error ||
                            "App konnte nicht geöffnet werden.";

                    } else {

                        state.launchCount++;
                    }


                    emit(
                        "app-opened",
                        {
                            app,
                            result,
                            via: "router"
                        }
                    );


                    return (
                        result || {
                            success: true,
                            status: "opened",
                            app
                        }
                    );
                }

            }
            catch (error) {

                state.lastError =
                    error.message ||
                    String(error);

                emit(
                    "error",
                    {
                        app,
                        error:
                            state.lastError
                    }
                );

                return {
                    success: false,
                    status: "router-error",
                    error:
                        state.lastError
                };
            }
        }


        /*
         * FALLBACK AUF MANAGER
         */

        const manager =
            getManager();


        if (
            manager &&
            typeof manager.openApp ===
            "function"
        ) {

            try {

                const result =
                    await manager.openApp(
                        normalized,
                        options
                    );


                if (
                    result &&
                    result.success === false
                ) {

                    state.lastError =
                        result.error;

                } else {

                    state.launchCount++;
                }


                emit(
                    "app-opened",
                    {
                        app,
                        result,
                        via: "manager"
                    }
                );


                return (
                    result || {
                        success: true,
                        status: "opened",
                        app
                    }
                );

            }
            catch (error) {

                state.lastError =
                    error.message ||
                    String(error);

                return {
                    success: false,
                    status: "manager-error",
                    error:
                        state.lastError
                };
            }
        }


        const result = {

            success: false,

            status: "not-ready",

            error:
                "App Router und App Manager sind nicht verfügbar."
        };

        state.lastError =
            result.error;

        emit(
            "error",
            result
        );

        return result;
    }


    /* ========================================================
       19 — SUCHE
       ======================================================== */

    function setSearch(query) {

        state.search =
            String(
                query || ""
            ).trim();

        state.lastAction =
            "search";

        emit(
            "search-changed",
            {
                query:
                    state.search
            }
        );

        render();

        return getVisibleApps();
    }


    function clearSearch() {

        return setSearch("");
    }


    /* ========================================================
       20 — KATEGORIE
       ======================================================== */

    function setCategory(category) {

        const value =
            String(
                category ||
                "all"
            )
            .trim()
            .toLowerCase();

        state.category =
            value || "all";

        state.favoritesOnly =
            false;

        state.lastAction =
            "category";

        emit(
            "category-changed",
            {
                category:
                    state.category
            }
        );

        render();

        return getVisibleApps();
    }


    /* ========================================================
       21 — FAVORITEN
       ======================================================== */

    function showFavorites() {

        state.favoritesOnly =
            true;

        state.category =
            "all";

        state.lastAction =
            "favorites";

        render();

        return getVisibleApps();
    }


    function showAllApps() {

        state.favoritesOnly =
            false;

        state.category =
            "all";

        state.lastAction =
            "all";

        render();

        return getVisibleApps();
    }


    /* ========================================================
       22 — FAVORIT UMSCHALTEN
       ======================================================== */

    function toggleFavorite(appId) {

        const manager =
            getManager();

        if (
            !manager ||
            typeof manager.toggleFavorite !==
            "function"
        ) {

            return {
                success: false,
                error:
                    "Favoriten-Funktion ist nicht verfügbar."
            };
        }


        const result =
            manager.toggleFavorite(
                normalizeAppId(appId)
            );


        if (
            result &&
            result.success !== false
        ) {

            emit(
                "favorite-changed",
                result
            );

            render();
        }


        return result;
    }


    /* ========================================================
       23 — RENDER
       ======================================================== */

    function render() {

        const container =
            ensureContainer();

        if (!container) {
            return false;
        }


        container.innerHTML =
            "";


        const header =
            document.createElement(
                "header"
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


        container.appendChild(
            header
        );


        /*
         * Suche
         */

        const search =
            document.createElement(
                "input"
            );

        search.type =
            "search";

        search.className =
            "haldo-launcher-search";

        search.placeholder =
            "Apps durchsuchen...";

        search.value =
            state.search;

        search.autocomplete =
            "off";

        search.addEventListener(
            "input",
            () => {

                state.search =
                    search.value;

                renderGrid();

            }
        );


        container.appendChild(
            search
        );


        /*
         * Kategorien
         */

        const categories =
            document.createElement(
                "nav"
            );

        categories.className =
            "haldo-launcher-categories";


        const all =
            document.createElement(
                "button"
            );

        all.type =
            "button";

        all.textContent =
            "Alle";

        all.className =
            "haldo-launcher-category";


        if (
            state.category ===
                "all" &&
            !state.favoritesOnly
        ) {

            all.classList.add(
                "active"
            );
        }


        all.addEventListener(
            "click",
            () => showAllApps()
        );


        categories.appendChild(
            all
        );


        getCategories().forEach(
            category => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "haldo-launcher-category";

                button.textContent =
                    category;


                if (
                    state.category ===
                    String(
                        category
                    )
                    .toLowerCase() &&
                    !state.favoritesOnly
                ) {

                    button.classList.add(
                        "active"
                    );
                }


                button.addEventListener(
                    "click",
                    () =>
                        setCategory(
                            category
                        )
                );


                categories.appendChild(
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

        favorites.textContent =
            "★ Favoriten";


        if (
            state.favoritesOnly
        ) {

            favorites.classList.add(
                "active"
            );
        }


        favorites.addEventListener(
            "click",
            () => showFavorites()
        );


        categories.appendChild(
            favorites
        );


        container.appendChild(
            categories
        );


        /*
         * Grid
         */

        const grid =
            document.createElement(
                "div"
            );

        grid.className =
            "haldo-launcher-grid";

        grid.dataset.haldoLauncherGrid =
            "true";


        container.appendChild(
            grid
        );


        renderGrid();


        state.renderCount++;

        emit(
            "rendered",
            {
                count:
                    state.renderCount
            }
        );


        return true;
    }


    /* ========================================================
       24 — GRID AKTUALISIEREN
       ======================================================== */

    function renderGrid() {

        const container =
            ensureContainer();

        if (!container) {
            return false;
        }


        const grid =
            container.querySelector(
                "[data-haldo-launcher-grid]"
            ) ||
            container.querySelector(
                ".haldo-launcher-grid"
            );


        if (!grid) {
            return false;
        }


        grid.innerHTML =
            "";


        const apps =
            getVisibleApps();


        const count =
            container.querySelector(
                ".haldo-launcher-count"
            );


        if (count) {

            count.textContent =
                `${apps.length} Apps`;
        }


        if (!apps.length) {

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

            return true;
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


        emit(
            "apps-rendered",
            {
                apps
            }
        );


        return true;
    }


    /* ========================================================
       25 — SHOW / HIDE
       ======================================================== */

    function show() {

        const container =
            ensureContainer();

        if (!container) {
            return false;
        }


        container.hidden =
            false;

        state.visible =
            true;


        render();


        emit(
            "shown"
        );


        return true;
    }


    function hide() {

        const container =
            getContainer();

        if (container) {

            container.hidden =
                true;
        }


        state.visible =
            false;


        emit(
            "hidden"
        );


        return true;
    }


    /* ========================================================
       26 — KEYBOARD
       ======================================================== */

    function handleKeyboard(event) {

        if (
            !CONFIG.keyboardEnabled
        ) {
            return;
        }


        if (
            event.key === "/" &&
            !event.ctrlKey &&
            !event.metaKey
        ) {

            const input =
                document.querySelector(
                    ".haldo-launcher-search"
                );

            if (
                input &&
                document.activeElement !==
                    input
            ) {

                event.preventDefault();

                input.focus();
            }
        }


        if (
            event.key === "Escape"
        ) {

            const input =
                document.querySelector(
                    ".haldo-launcher-search"
                );

            if (
                input &&
                document.activeElement ===
                    input
            ) {

                input.blur();

                return;
            }

            hide();
        }
    }


    /* ========================================================
       27 — ABHÄNGIGKEITEN
       ======================================================== */

    function checkDependencies() {

        const manager =
            getManager();

        const registry =
            getRegistry();

        const router =
            getRouter();


        state.managerReady =
            Boolean(manager);

        state.registryReady =
            Boolean(registry);

        state.routerReady =
            Boolean(router);


        return {

            manager:
                state.managerReady,

            registry:
                state.registryReady,

            router:
                state.routerReady,

            ready:
                state.managerReady &&
                state.registryReady &&
                state.routerReady
        };
    }


    /* ========================================================
       28 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            state:
                {
                    ...state
                },

            dependencies:
                checkDependencies(),

            apps:
                getAllApps().length,

            enabledApps:
                getEnabledApps().length,

            favorites:
                getFavorites().length,

            categories:
                getCategories(),

            container:
                Boolean(
                    getContainer()
                )
        };
    }


    /* ========================================================
       29 — STATE
       ======================================================== */

    function getState() {

        return {
            ...state
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


        checkDependencies();


        state.initialized =
            true;

        state.ready =
            true;


        /*
         * Kernel
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
         * System
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


        /*
         * Tastatur
         */

        if (
            CONFIG.keyboardEnabled
        ) {

            document.addEventListener(
                "keydown",
                handleKeyboard
            );
        }


        /*
         * Manager Events
         */

        const manager =
            getManager();

        if (
            manager &&
            typeof manager.on ===
            "function"
        ) {

            manager.on(
                "app-opened",
                data => {

                    emit(
                        "manager-app-opened",
                        data
                    );

                    renderGrid();
                }
            );


            manager.on(
                "app-registered",
                data => {

                    emit(
                        "app-list-changed",
                        data
                    );

                    renderGrid();
                }
            );


            manager.on(
                "app-unregistered",
                data => {

                    emit(
                        "app-list-changed",
                        data
                    );

                    renderGrid();
                }
            );


            manager.on(
                "favorite-changed",
                data => {

                    emit(
                        "favorite-changed",
                        data
                    );

                    renderGrid();
                }
            );
        }


        /*
         * Nur rendern, wenn Container existiert.
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
            "Zentraler Launcher ist bereit."
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

        off,

        getAllApps,

        getEnabledApps,

        getApp,

        getFavorites,

        getCategories,

        getVisibleApps,

        searchApps:
            setSearch,

        setSearch,

        clearSearch,

        setCategory,

        showFavorites,

        showAllApps,

        toggleFavorite,

        openApp,

        show,

        hide,

        render,

        renderGrid,

        normalizeAppId,

        getState,

        diagnose,

        checkDependencies
    };


    /* ========================================================
       32 — GLOBALE API
       ======================================================== */

    window.HalDoLauncher =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.launcher =
        api;


    /* ========================================================
       33 — BOOT
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

    } else {

        boot();
    }


})(window, document);


/* ============================================================
   ENDE — HALDO AI OS 18 LAUNCHER
   ============================================================ */