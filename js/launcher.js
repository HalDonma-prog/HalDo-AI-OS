/* ============================================================
   HALDO AI OS 18
   Professional Ultimate Foundation
   ------------------------------------------------------------
   Datei:
   js/launcher.js

   Zentrale App-Übersicht / Launcher

   Verwendet:
   - HalDoAppManager
   - HalDoAppRouter

   Funktionen:
   - App-Menü
   - App-Kategorien
   - Suche
   - Favoriten
   - App öffnen
   - App-Karten
   - sichere Navigation
   - kein direkter .html-Link
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

        mountSelector:
            "#app-launcher",

        fallbackSelector:
            "#app-root"

    };


    /* ========================================================
       02 — STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        mounted:
            false,

        search:
            "",

        category:
            "all",

        view:
            "all",

        selectedApp:
            null

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
       07 — MOUNT ELEMENT
       ======================================================== */

    function getMountElement() {

        let mount =
            document.querySelector(
                CONFIG.mountSelector
            );


        if (
            !mount
        ) {

            mount =
                document.createElement(
                    "section"
                );


            mount.id =
                "app-launcher";


            const fallback =
                document.querySelector(
                    CONFIG.fallbackSelector
                );


            if (
                fallback &&
                fallback.parentNode
            ) {

                fallback.parentNode.insertBefore(
                    mount,
                    fallback
                );

            }
            else if (
                document.body
            ) {

                document.body.appendChild(
                    mount
                );

            }

        }


        return mount;

    }


    /* ========================================================
       08 — HTML SICHER MACHEN
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
       09 — ICON
       ======================================================== */

    function renderIcon(
        app
    ) {

        const icon =
            app &&
            app.icon
                ? String(
                    app.icon
                )
                : "◇";


        /*
         * Bild
         */

        if (
            /\.(png|jpg|jpeg|webp|svg)$/i
                .test(
                    icon
                )
        ) {

            return `

                <img
                    class="haldo-app-icon-image"
                    src="${escapeHtml(icon)}"
                    alt=""
                    loading="lazy"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <span
                    class="haldo-app-icon-fallback"
                    style="display:none"
                >
                    ◇
                </span>

            `;

        }


        /*
         * Text / Emoji / Symbol
         */

        return `

            <span
                class="haldo-app-icon-symbol"
                aria-hidden="true"
            >
                ${escapeHtml(icon)}
            </span>

        `;

    }


    /* ========================================================
       10 — APP KARTE
       ======================================================== */

    function renderAppCard(
        app
    ) {

        const favorite =
            app.favorite ===
            true;


        const enabled =
            app.enabled !==
            false;


        return `

            <article
                class="
                    haldo-app-card
                    ${enabled ? "" : "is-disabled"}
                "
                data-app-id="${escapeHtml(app.id)}"
                tabindex="0"
                role="button"
                aria-label="${escapeHtml(app.title)}"
            >

                <button
                    type="button"
                    class="haldo-app-favorite"
                    data-action="favorite"
                    data-app-id="${escapeHtml(app.id)}"
                    aria-label="${
                        favorite
                            ? "Aus Favoriten entfernen"
                            : "Zu Favoriten hinzufügen"
                    }"
                    title="${
                        favorite
                            ? "Favorit entfernen"
                            : "Favorit"
                    }"
                >
                    ${favorite ? "★" : "☆"}
                </button>


                <div
                    class="haldo-app-icon"
                >
                    ${renderIcon(app)}
                </div>


                <div
                    class="haldo-app-card-content"
                >

                    <h3>
                        ${escapeHtml(app.title)}
                    </h3>


                    <p>
                        ${escapeHtml(
                            app.description ||
                            "HalDo AI OS App"
                        )}
                    </p>


                    <span
                        class="haldo-app-category"
                    >
                        ${escapeHtml(
                            app.category ||
                            "other"
                        )}
                    </span>

                </div>

            </article>

        `;

    }


    /* ========================================================
       11 — LEERER ZUSTAND
       ======================================================== */

    function renderEmpty(
        message
    ) {

        return `

            <div
                class="haldo-launcher-empty"
            >

                <div
                    class="haldo-launcher-empty-icon"
                >
                    ◇
                </div>


                <h3>
                    Keine Apps gefunden
                </h3>


                <p>
                    ${escapeHtml(message)}
                </p>

            </div>

        `;

    }


    /* ========================================================
       12 — KATEGORIEN
       ======================================================== */

    function renderCategories() {

        const manager =
            getManager();


        if (
            !manager
        ) {

            return "";

        }


        const categories =
            typeof manager.getCategories ===
                "function"
                    ? manager.getCategories()
                    : [];


        return categories
            .map(
                category => {

                    const active =
                        state.category ===
                        category.id;


                    return `

                        <button
                            type="button"
                            class="
                                haldo-launcher-category
                                ${active ? "active" : ""}
                            "
                            data-action="category"
                            data-category="${
                                escapeHtml(
                                    category.id
                                )
                            }"
                        >

                            <span>
                                ${escapeHtml(
                                    category.name
                                )}
                            </span>

                            <small>
                                ${category.count}
                            </small>

                        </button>

                    `;

                }
            )
            .join("");

    }


    /* ========================================================
       13 — APPS FILTERN
       ======================================================== */

    function getVisibleApps() {

        const manager =
            getManager();


        if (
            !manager
        ) {

            return [];

        }


        let apps =
            typeof manager.getAllApps ===
                "function"
                    ? manager.getAllApps()
                    : [];


        /*
         * Kategorie
         */

        if (
            state.category ===
            "favorites"
        ) {

            apps =
                apps.filter(
                    app =>
                        app.favorite ===
                        true
                );

        }
        else if (
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
         * Suche
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


        return apps;

    }


    /* ========================================================
       14 — LAUNCHER RENDERN
       ======================================================== */

    function render() {

        const mount =
            getMountElement();


        if (
            !mount
        ) {

            return false;

        }


        const apps =
            getVisibleApps();


        mount.innerHTML = `

            <div
                class="haldo-launcher"
                data-launcher="true"
            >

                <header
                    class="haldo-launcher-header"
                >

                    <div
                        class="haldo-launcher-title"
                    >

                        <span
                            class="haldo-launcher-eyebrow"
                        >
                            HALDO AI OS 18
                        </span>


                        <h1>
                            Apps
                        </h1>


                        <p>
                            Deine HalDo AI Anwendungen
                        </p>

                    </div>


                    <div
                        class="haldo-launcher-search"
                    >

                        <label
                            for="haldo-app-search"
                        >
                            Apps suchen
                        </label>


                        <input
                            id="haldo-app-search"
                            type="search"
                            placeholder="App suchen …"
                            autocomplete="off"
                            value="${escapeHtml(
                                state.search
                            )}"
                        >

                    </div>

                </header>


                <nav
                    class="haldo-launcher-categories"
                    aria-label="App Kategorien"
                >

                    ${renderCategories()}

                </nav>


                <section
                    class="haldo-launcher-grid"
                    aria-live="polite"
                >

                    ${
                        apps.length
                            ? apps
                                .map(
                                    renderAppCard
                                )
                                .join("")
                            : renderEmpty(
                                state.search
                                    ? "Versuche einen anderen Suchbegriff."
                                    : "Momentan sind keine Apps verfügbar."
                            )
                    }

                </section>

            </div>

        `;


        bindEvents();


        state.mounted =
            true;


        emit(
            "rendered",
            {
                count:
                    apps.length,

                apps

            }
        );


        return true;

    }


    /* ========================================================
       15 — EVENTS BINDEN
       ======================================================== */

    function bindEvents() {

        const mount =
            getMountElement();


        if (
            !mount
        ) {

            return;

        }


        /*
         * Suche
         */

        const searchInput =
            mount.querySelector(
                "#haldo-app-search"
            );


        if (
            searchInput
        ) {

            searchInput.addEventListener(
                "input",
                function (event) {

                    state.search =
                        event.target.value ||
                        "";


                    render();

                    /*
                     * Cursor wieder ans Ende.
                     */

                    const newInput =
                        document.querySelector(
                            "#haldo-app-search"
                        );


                    if (
                        newInput
                    ) {

                        newInput.focus();


                        try {

                            const length =
                                newInput.value.length;


                            newInput.setSelectionRange(
                                length,
                                length
                            );

                        }
                        catch (
                            error
                        ) {}

                    }

                }
            );

        }


        /*
         * Kategorien
         */

        mount
            .querySelectorAll(
                '[data-action="category"]'
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            const category =
                                button.dataset.category ||
                                "all";


                            state.category =
                                category;


                            state.search =
                                "";


                            render();


                            emit(
                                "category:selected",
                                {
                                    category
                                }
                            );

                        }
                    );

                }
            );


        /*
         * Favoriten
         */

        mount
            .querySelectorAll(
                '[data-action="favorite"]'
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function (event) {

                            event.stopPropagation();


                            const appId =
                                button.dataset.appId;


                            const manager =
                                getManager();


                            if (
                                manager &&
                                typeof manager.toggleFavorite ===
                                    "function"
                            ) {

                                manager.toggleFavorite(
                                    appId
                                );


                                render();

                            }

                        }
                    );

                }
            );


        /*
         * App Karten
         */

        mount
            .querySelectorAll(
                ".haldo-app-card"
            )
            .forEach(
                card => {

                    card.addEventListener(
                        "click",
                        function (event) {

                            if (
                                event.target.closest(
                                    '[data-action="favorite"]'
                                )
                            ) {

                                return;

                            }


                            const appId =
                                card.dataset.appId;


                            openApp(
                                appId
                            );

                        }
                    );


                    card.addEventListener(
                        "keydown",
                        function (event) {

                            if (
                                event.key ===
                                "Enter" ||
                                event.key ===
                                " "
                            ) {

                                event.preventDefault();


                                openApp(
                                    card.dataset.appId
                                );

                            }

                        }
                    );

                }
            );

    }


    /* ========================================================
       16 — APP ÖFFNEN
       ======================================================== */

    function openApp(
        appId
    ) {

        const router =
            getRouter();


        if (
            !router
        ) {

            log(
                "HalDoAppRouter ist noch nicht verfügbar.",
                "warning"
            );


            return false;

        }


        state.selectedApp =
            appId;


        if (
            typeof router.openApp ===
                "function"
        ) {

            router.openApp(
                appId
            );


            emit(
                "app:opened",
                {
                    appId
                }
            );


            return true;

        }


        return false;

    }


    /* ========================================================
       17 — APPS AKTUALISIEREN
       ======================================================== */

    function refresh() {

        return render();

    }


    /* ========================================================
       18 — APP-MANAGER EVENTS
       ======================================================== */

    function connectManagerEvents() {

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

                render();

            }
        );


        manager.on(
            "app:registered",
            function () {

                render();

            }
        );


        manager.on(
            "app:unregistered",
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


        manager.on(
            "app:enabled",
            function () {

                render();

            }
        );


        manager.on(
            "app:disabled",
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

    }


    /* ========================================================
       19 — ROUTER EVENTS
       ======================================================== */

    function connectRouterEvents() {

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
            "app:rendered",
            function () {

                hideLauncher();

            }
        );


        router.on(
            "app:placeholder",
            function () {

                hideLauncher();

            }
        );


        router.on(
            "home:rendered",
            function () {

                showLauncher();

            }
        );

    }


    /* ========================================================
       20 — LAUNCHER ZEIGEN
       ======================================================== */

    function showLauncher() {

        const mount =
            getMountElement();


        if (
            mount
        ) {

            mount.hidden =
                false;

            mount.removeAttribute(
                "aria-hidden"
            );

        }

    }


    /* ========================================================
       21 — LAUNCHER VERSTECKEN
       ======================================================== */

    function hideLauncher() {

        const mount =
            getMountElement();


        if (
            mount
        ) {

            mount.hidden =
                true;

            mount.setAttribute(
                "aria-hidden",
                "true"
            );

        }

    }


    /* ========================================================
       22 — STARTSEITE ÖFFNEN
       ======================================================== */

    function openLauncher() {

        const router =
            getRouter();


        if (
            router &&
            typeof router.navigateHome ===
                "function"
        ) {

            router.navigateHome();

        }


        showLauncher();


        return true;

    }


    /* ========================================================
       23 — DIAGNOSE
       ======================================================== */

    function diagnose() {

        const manager =
            getManager();


        const router =
            getRouter();


        const mount =
            document.querySelector(
                CONFIG.mountSelector
            );


        return {

            launcher: {

                initialized:
                    state.initialized,

                ready:
                    state.ready,

                mounted:
                    state.mounted,

                search:
                    state.search,

                category:
                    state.category,

                selectedApp:
                    state.selectedApp

            },

            appManager:
                Boolean(
                    manager
                ),

            appRouter:
                Boolean(
                    router
                ),

            mount:
                Boolean(
                    mount
                ),

            visibleApps:
                getVisibleApps().map(
                    app =>
                        app.id
                )

        };

    }


    /* ========================================================
       24 — STATE
       ======================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            mounted:
                state.mounted,

            search:
                state.search,

            category:
                state.category,

            view:
                state.view,

            selectedApp:
                state.selectedApp

        };

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


        /*
         * Verbindung zu den
         * zentralen Systemdiensten.
         */

        connectManagerEvents();

        connectRouterEvents();


        /*
         * Render
         */

        render();


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


        emit(
            "ready",
            getState()
        );


        log(
            "Launcher bereit."
        );


        return getState();

    }


    /* ========================================================
       26 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,


        init,

        render,

        refresh,


        openApp,

        openLauncher,

        showLauncher,

        hideLauncher,


        getVisibleApps,

        getState,

        diagnose,


        on,

        off,

        emit

    };


    /* ========================================================
       27 — GLOBAL
       ======================================================== */

    window.HalDoLauncher =
        api;


    window.HalDoOS =
        window.HalDoOS ||
        {};


    window.HalDoOS.launcher =
        api;


    /* ========================================================
       28 — START
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


})(window);


/* ============================================================
   ENDE — HALDO AI OS 18 LAUNCHER
   ============================================================ */