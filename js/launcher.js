/* ============================================================

   HalDo AI OS 18

   Professional Ultimate Foundation

   ------------------------------------------------------------

   Datei: js/launcher.js

   Aufgabe:

   - HalDo App Launcher

   - Apps aus App Manager anzeigen

   - Kategorien

   - Suche

   - Favoriten

   - angeheftete Apps

   - zuletzt verwendete Apps

   - App-Start

   - responsive Darstellung

   - Tastatur-/Touch-Unterstützung

   ============================================================ */

(function (window, document) {

    "use strict";

    const VERSION = "18.0.0";

    const state = {

        initialized: false,

        ready: false,

        container: null,

        searchInput: null,

        currentCategory: "all",

        currentQuery: "",

        apps: [],

        filteredApps: [],

        categories: [],

        activeApp: null,

        loading: false,

        error: null

    };

    const listeners = new Map();

    /* =========================================================

       EVENTS

       ========================================================= */

    function on(eventName, callback) {

        if (typeof callback !== "function") {

            return function () {};

        }

        if (!listeners.has(eventName)) {

            listeners.set(

                eventName,

                new Set()

            );

        }

        listeners

            .get(eventName)

            .add(callback);

        return function () {

            off(eventName, callback);

        };

    }

    function off(eventName, callback) {

        const set =

            listeners.get(eventName);

        if (!set) {

            return;

        }

        set.delete(callback);

        if (set.size === 0) {

            listeners.delete(eventName);

        }

    }

    function emit(eventName, payload) {

        const set =

            listeners.get(eventName);

        if (!set) {

            return;

        }

        set.forEach(

            function (callback) {

                try {

                    callback(payload);

                } catch (error) {

                    console.error(

                        "[HalDo Launcher] Event error:",

                        error

                    );

                }

            }

        );

    }

    /* =========================================================

       LOGGING

       ========================================================= */

    function log(message, data) {

        console.info(

            `[HalDo Launcher ${VERSION}] ${message}`,

            data !== undefined

                ? data

                : ""

        );

    }

    function warn(message, data) {

        console.warn(

            `[HalDo Launcher ${VERSION}] ${message}`,

            data !== undefined

                ? data

                : ""

        );

    }

    /* =========================================================

       HTML ESCAPING

       ========================================================= */

    function escapeHTML(value) {

        return String(value)

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

    /* =========================================================

       APP MANAGER

       ========================================================= */

    function getManager() {

        return window.HalDoAppManager || null;

    }

    function refreshApps() {

        const manager =

            getManager();

        if (!manager) {

            warn(

                "HalDoAppManager ist noch nicht verfügbar."

            );

            return false;

        }

        state.apps =

            manager.getLaunchableApps();

        state.categories =

            manager

                .getState()

                .categories || [];

        applyFilters();

        return true;

    }

    /* =========================================================

       CONTAINER

       ========================================================= */

    function findContainer() {

        const selectors = [

            "[data-haldo-launcher]",

            "#haldo-launcher",

            ".haldo-launcher",

            "#app-launcher"

        ];

        for (

            const selector of selectors

        ) {

            const element =

                document.querySelector(

                    selector

                );

            if (element) {

                return element;

            }

        }

        return null;

    }

    function createContainer() {

        const existing =

            findContainer();

        if (existing) {

            state.container =

                existing;

            return existing;

        }

        const container =

            document.createElement(

                "section"

            );

        container.id =

            "haldo-launcher";

        container.className =

            "haldo-launcher";

        container.dataset

            .haldoLauncher = "true";

        document.body.appendChild(

            container

        );

        state.container =

            container;

        return container;

    }

    /* =========================================================

       ICON

       ========================================================= */

    function getIcon(app) {

        /*

         * Das Logo wird nicht als Emoji ersetzt.

         * Für HalDo AI verwenden wir unser echtes Logo.

         */

        if (

            app.id === "haldo-ai"

        ) {

            return `

                <img

                    class="haldo-app-icon haldo-app-logo"

                    src="assets/logo/logo.png"

                    alt="HalDo AI"

                    loading="lazy"

                >

            `;

        }

        /*

         * Icons werden später über das zentrale

         * Icon-System ersetzt.

         *

         * Bis dahin verwenden wir eine neutrale

         * Textdarstellung statt des verbotenen

         * Roboter-Emoji.

         */

        return `

            <span

                class="haldo-app-icon haldo-app-icon-fallback"

                aria-hidden="true"

            >

                ${escapeHTML(

                    getIconLetter(app)

                )}

            </span>

        `;

    }

    function getIconLetter(app) {

        if (

            app.displayName &&

            app.displayName.length > 0

        ) {

            return app.displayName

                .trim()

                .charAt(0)

                .toUpperCase();

        }

        return "A";

    }

    /* =========================================================

       APP CARD

       ========================================================= */

    function createAppCard(app) {

        const manager =

            getManager();

        const favorite =

            manager

                ? manager.isFavorite(

                    app.id

                )

                : false;

        const article =

            document.createElement(

                "article"

            );

        article.className =

            "haldo-app-card";

        article.dataset.appId =

            app.id;

        article.dataset.category =

            app.category;

        article.tabIndex = 0;

        article.innerHTML = `

            <button

                class="haldo-app-launch"

                type="button"

                data-app-launch="${escapeHTML(app.id)}"

                aria-label="${escapeHTML(app.displayName)} öffnen"

            >

                <span

                    class="haldo-app-icon-wrapper"

                >

                    ${getIcon(app)}

                </span>

                <span

                    class="haldo-app-name"

                >

                    ${escapeHTML(

                        app.displayName

                    )}

                </span>

            </button>

            <button

                class="haldo-app-favorite"

                type="button"

                data-app-favorite="${escapeHTML(app.id)}"

                aria-label="${

                    favorite

                        ? "Aus Favoriten entfernen"

                        : "Zu Favoriten hinzufügen"

                }"

                aria-pressed="${favorite}"

            >

                ${favorite ? "★" : "☆"}

            </button>

        `;

        return article;

    }

    /* =========================================================

       HEADER

       ========================================================= */

    function renderHeader() {

        const header =

            document.createElement(

                "header"

            );

        header.className =

            "haldo-launcher-header";

        header.innerHTML = `

            <div

                class="haldo-launcher-brand"

            >

                <img

                    src="assets/logo/logo.png"

                    alt="HalDo AI"

                    class="haldo-launcher-logo"

                >

                <div>

                    <h1>

                        HalDo AI OS

                    </h1>

                    <p>

                        Applications

                    </p>

                </div>

            </div>

            <div

                class="haldo-launcher-search"

            >

                <label

                    for="haldo-app-search"

                    class="haldo-visually-hidden"

                >

                    Apps suchen

                </label>

                <input

                    id="haldo-app-search"

                    class="haldo-app-search-input"

                    type="search"

                    placeholder="Apps suchen..."

                    autocomplete="off"

                    spellcheck="false"

                >

            </div>

        `;

        state.searchInput =

            header.querySelector(

                "#haldo-app-search"

            );

        state.searchInput

            .addEventListener(

                "input",

                function (event) {

                    state.currentQuery =

                        event.target.value;

                    applyFilters();

                }

            );

        return header;

    }

    /* =========================================================

       CATEGORY NAVIGATION

       ========================================================= */

    function renderCategories() {

        const nav =

            document.createElement(

                "nav"

            );

        nav.className =

            "haldo-launcher-categories";

        nav.setAttribute(

            "aria-label",

            "App Kategorien"

        );

        const allButton =

            createCategoryButton(

                "all",

                "Alle"

            );

        nav.appendChild(

            allButton

        );

        state.categories

            .slice()

            .sort(

                function (a, b) {

                    return (

                        (a.order || 0) -

                        (b.order || 0)

                    );

                }

            )

            .forEach(

                function (category) {

                    nav.appendChild(

                        createCategoryButton(

                            category.id,

                            category.name

                        )

                    );

                }

            );

        return nav;

    }

    function createCategoryButton(

        id,

        name

    ) {

        const button =

            document.createElement(

                "button"

            );

        button.type =

            "button";

        button.className =

            "haldo-category-button";

        button.dataset.category =

            id;

        button.textContent =

            name;

        if (

            state.currentCategory === id

        ) {

            button.classList.add(

                "active"

            );

        }

        button.addEventListener(

            "click",

            function () {

                state.currentCategory =

                    id;

                updateCategoryButtons();

                applyFilters();

            }

        );

        return button;

    }

    function updateCategoryButtons() {

        if (!state.container) {

            return;

        }

        state.container

            .querySelectorAll(

                ".haldo-category-button"

            )

            .forEach(

                function (button) {

                    button.classList.toggle(

                        "active",

                        button.dataset.category ===

                            state.currentCategory

                    );

                }

            );

    }

    /* =========================================================

       SECTIONS

       ========================================================= */

    function createSection(

        title,

        apps,

        sectionClass

    ) {

        const section =

            document.createElement(

                "section"

            );

        section.className =

            `haldo-launcher-section ${

                sectionClass || ""

            }`;

        if (

            apps.length === 0

        ) {

            section.hidden = true;

            return section;

        }

        const titleElement =

            document.createElement(

                "h2"

            );

        titleElement.className =

            "haldo-launcher-section-title";

        titleElement.textContent =

            title;

        section.appendChild(

            titleElement

        );

        const grid =

            document.createElement(

                "div"

            );

        grid.className =

            "haldo-app-grid";

        apps.forEach(

            function (app) {

                grid.appendChild(

                    createAppCard(app)

                );

            }

        );

        section.appendChild(

            grid

        );

        return section;

    }

    /* =========================================================

       EMPTY STATE

       ========================================================= */

    function createEmptyState() {

        const element =

            document.createElement(

                "div"

            );

        element.className =

            "haldo-launcher-empty";

        element.innerHTML = `

            <div

                class="haldo-empty-symbol"

                aria-hidden="true"

            >

                —

            </div>

            <h2>

                Keine App gefunden

            </h2>

            <p>

                Ändere deine Suche oder wähle

                eine andere Kategorie.

            </p>

        `;

        return element;

    }

    /* =========================================================

       FILTER

       ========================================================= */

    function applyFilters() {

        let apps =

            [...state.apps];

        if (

            state.currentCategory !== "all"

        ) {

            apps =

                apps.filter(

                    function (app) {

                        return (

                            app.category ===

                            state.currentCategory

                        );

                    }

                );

        }

        const query =

            state.currentQuery

                .trim()

                .toLowerCase();

        if (query) {

            apps =

                apps.filter(

                    function (app) {

                        const searchable = [

                            app.id,

                            app.name,

                            app.displayName,

                            app.description,

                            app.category

                        ]

                            .join(" ")

                            .toLowerCase();

                        return searchable

                            .includes(query);

                    }

                );

        }

        state.filteredApps =

            apps;

        renderAppContent();

        emit(

            "launcher:filtered",

            {

                query:

                    state.currentQuery,

                category:

                    state.currentCategory,

                apps:

                    [...apps]

            }

        );

    }

    /* =========================================================

       CONTENT

       ========================================================= */

    function renderAppContent() {

        if (!state.container) {

            return;

        }

        const content =

            state.container.querySelector(

                ".haldo-launcher-content"

            );

        if (!content) {

            return;

        }

        content.innerHTML = "";

        const apps =

            state.filteredApps;

        if (

            apps.length === 0

        ) {

            content.appendChild(

                createEmptyState()

            );

            return;

        }

        /*

         * Bei einer aktiven Suche oder Kategorie

         * zeigen wir die gefilterte Liste direkt.

         */

        if (

            state.currentQuery ||

            state.currentCategory !== "all"

        ) {

            content.appendChild(

                createSection(

                    "Apps",

                    apps,

                    "haldo-section-results"

                )

            );

            return;

        }

        const manager =

            getManager();

        /*

         * Angeheftete Apps

         */

        if (manager) {

            const pinned =

                manager.getPinnedApps();

            if (

                pinned.length > 0

            ) {

                content.appendChild(

                    createSection(

                        "Favoriten & Schnellzugriff",

                        pinned,

                        "haldo-section-pinned"

                    )

                );

            }

            /*

             * Zuletzt verwendet

             */

            const recent =

                manager.getRecentApps();

            if (

                recent.length > 0

            ) {

                content.appendChild(

                    createSection(

                        "Zuletzt verwendet",

                        recent,

                        "haldo-section-recent"

                    )

                );

            }

        }

        /*

         * Kategorien

         */

        state.categories

            .slice()

            .sort(

                function (a, b) {

                    return (

                        (a.order || 0) -

                        (b.order || 0)

                    );

                }

            )

            .forEach(

                function (category) {

                    const categoryApps =

                        apps.filter(

                            function (app) {

                                return (

                                    app.category ===

                                    category.id

                                );

                            }

                        );

                    if (

                        categoryApps.length > 0

                    ) {

                        content.appendChild(

                            createSection(

                                category.name,

                                categoryApps,

                                `haldo-section-${category.id}`

                            )

                        );

                    }

                }

            );

    }

    /* =========================================================

       BUILD

       ========================================================= */

    function build() {

        state.container =

            createContainer();

        state.container.innerHTML =

            "";

        const header =

            renderHeader();

        state.container.appendChild(

            header

        );

        const categories =

            renderCategories();

        state.container.appendChild(

            categories

        );

        const content =

            document.createElement(

                "main"

            );

        content.className =

            "haldo-launcher-content";

        content.setAttribute(

            "aria-live",

            "polite"

        );

        state.container.appendChild(

            content

        );

        attachEvents();

        applyFilters();

        state.ready = true;

        emit(

            "launcher:ready",

            getState()

        );

    }

    /* =========================================================

       EVENTS ON CONTAINER

       ========================================================= */

    function attachEvents() {

        if (!state.container) {

            return;

        }

        state.container.addEventListener(

            "click",

            function (event) {

                const launchButton =

                    event.target.closest(

                        "[data-app-launch]"

                    );

                if (

                    launchButton

                ) {

                    event.preventDefault();

                    const id =

                        launchButton.dataset

                            .appLaunch;

                    launchApp(id);

                    return;

                }

                const favoriteButton =

                    event.target.closest(

                        "[data-app-favorite]"

                    );

                if (

                    favoriteButton

                ) {

                    event.preventDefault();

                    const id =

                        favoriteButton.dataset

                            .appFavorite;

                    toggleFavorite(id);

                }

            }

        );

        state.container.addEventListener(

            "keydown",

            function (event) {

                if (

                    event.key !== "Enter" &&

                    event.key !== " "

                ) {

                    return;

                }

                const card =

                    event.target.closest(

                        ".haldo-app-card"

                    );

                if (!card) {

                    return;

                }

                event.preventDefault();

                launchApp(

                    card.dataset.appId

                );

            }

        );

    }

    /* =========================================================

       LAUNCH APP

       ========================================================= */

    async function launchApp(id) {

        const manager =

            getManager();

        if (!manager) {

            warn(

                "App Manager ist nicht verfügbar."

            );

            return;

        }

        state.loading = true;

        emit(

            "launcher:launching",

            {

                id

            }

        );

        const result =

            await manager.launch(

                id,

                {

                    internal: true,

                    verifyEntry: false

                }

            );

        state.loading = false;

        if (

            result &&

            result.success

        ) {

            state.activeApp =

                id;

            emit(

                "launcher:launched",

                result

            );

        } else {

            state.error =

                result?.error ||

                new Error(

                    "App konnte nicht gestartet werden."

                );

            emit(

                "launcher:launch-error",

                {

                    id,

                    error:

                        state.error

                }

            );

        }

    }

    /* =========================================================

       FAVORITES

       ========================================================= */

    function toggleFavorite(id) {

        const manager =

            getManager();

        if (!manager) {

            return;

        }

        if (

            manager.isFavorite(id)

        ) {

            manager.removeFavorite(

                id

            );

        } else {

            manager.addFavorite(

                id

            );

        }

        applyFilters();

        emit(

            "launcher:favorite-changed",

            {

                id

            }

        );

    }

    /* =========================================================

       KERNEL CONNECTION

       ========================================================= */

    function connectToManager() {

        const manager =

            getManager();

        if (!manager) {

            return false;

        }

        manager.on(

            "app:launched",

            function (event) {

                if (

                    event &&

                    event.app

                ) {

                    state.activeApp =

                        event.app.id;

                }

            }

        );

        manager.on(

            "apps:favorites-changed",

            function () {

                applyFilters();

            }

        );

        manager.on(

            "apps:recent-changed",

            function () {

                applyFilters();

            }

        );

        manager.on(

            "app:registered",

            function () {

                refreshApps();

            }

        );

        manager.on(

            "app:unregistered",

            function () {

                refreshApps();

            }

        );

        return true;

    }

    /* =========================================================

       INITIALIZATION

       ========================================================= */

    async function initialize() {

        if (

            state.initialized

        ) {

            return getState();

        }

        const manager =

            getManager();

        if (!manager) {

            state.error =

                new Error(

                    "HalDoAppManager fehlt."

                );

            warn(

                state.error.message

            );

            return getState();

        }

        if (

            !manager.getState().ready

        ) {

            try {

                await manager.loadRegistry();

            } catch (error) {

                state.error =

                    error;

                warn(

                    "Launcher konnte Registry nicht laden.",

                    error

                );

                return getState();

            }

        }

        refreshApps();

        connectToManager();

        build();

        state.initialized =

            true;

        emit(

            "launcher:initialized",

            getState()

        );

        return getState();

    }

    /* =========================================================

       PUBLIC API

       ========================================================= */

    function getState() {

        return {

            version:

                VERSION,

            initialized:

                state.initialized,

            ready:

                state.ready,

            loading:

                state.loading,

            currentCategory:

                state.currentCategory,

            currentQuery:

                state.currentQuery,

            apps:

                [...state.apps],

            filteredApps:

                [...state.filteredApps],

            categories:

                [...state.categories],

            activeApp:

                state.activeApp,

            error:

                state.error

                    ? String(

                        state.error.message ||

                        state.error

                    )

                    : null

        };

    }

    window.HalDoLauncher = {

        version:

            VERSION,

        initialize,

        refresh:

            refreshApps,

        search:

            function (query) {

                state.currentQuery =

                    query || "";

                if (

                    state.searchInput

                ) {

                    state.searchInput.value =

                        state.currentQuery;

                }

                applyFilters();

            },

        selectCategory:

            function (category) {

                state.currentCategory =

                    category || "all";

                updateCategoryButtons();

                applyFilters();

            },

        launchApp,

        toggleFavorite,

        getState,

        on,

        off

    };

    /* =========================================================

       START

       ========================================================= */

    function start() {

        if (

            document.readyState ===

            "loading"

        ) {

            document.addEventListener(

                "DOMContentLoaded",

                function () {

                    initialize()

                        .catch(

                            function (error) {

                                console.error(

                                    "[HalDo Launcher] Startfehler:",

                                    error

                                );

                            }

                        );

                },

                {

                    once: true

                }

            );

        } else {

            initialize()

                .catch(

                    function (error) {

                        console.error(

                            "[HalDo Launcher] Startfehler:",

                            error

                        );

                    }

                );

        }

    }

    start();

})(window, document);