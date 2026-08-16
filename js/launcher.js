/* ============================================================
   HALDO AI OS 20
   PROFESSIONAL ULTIMATE FOUNDATION

   Datei:
       js/launcher.js

   ZENTRALER HALDO LAUNCHER

   Verbindet:
   Kernel
   System
   App Registry
   App Manager
   Router
   Window Manager
   AI
   Language
   Voice
   Storage
   Keyboard
   Notifications
   Desktop / Hauptmenü

   Funktionen:
   - App Launcher
   - App Suche
   - Kategorien
   - Favoriten
   - zuletzt verwendete Apps
   - App öffnen
   - App schließen
   - App aktivieren
   - App minimieren
   - App wiederherstellen
   - Launcher-Zustand
   - Speicherung
   - Events
   - Diagnose
   - Health Check
   ============================================================ */

"use strict";

(function (window, document) {

    /* ========================================================
       01 — FOUNDATION
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;

    const VERSION =
        "20.0.0";

    const MODULE_ID =
        "launcher";

    const NAME =
        "HalDo AI OS 20 Launcher";


    /* ========================================================
       02 — SERVICE ACCESS
       ======================================================== */

    function getKernel() {

        return (
            window.HalDoKernel ||
            HalDoOS.kernel ||
            null
        );

    }


    function getSystem() {

        return (
            window.HalDoSystem ||
            HalDoOS.system ||
            null
        );

    }


    function getAppManager() {

        return (
            window.HalDoAppManager ||
            window.HalDoOSAppManager ||
            HalDoOS.appManager ||
            null
        );

    }


    function getRegistry() {

        return (
            window.HalDoAppRegistry ||
            HalDoOS.appRegistry ||
            null
        );

    }


    function getRouter() {

        return (
            window.HalDoAppRouter ||
            HalDoOS.appRouter ||
            null
        );

    }


    function getWindowManager() {

        return (
            window.HalDoWindowManager ||
            HalDoOS.windowManager ||
            null
        );

    }


    function getAI() {

        return (
            window.HalDoAI ||
            HalDoOS.ai ||
            window.HalDoAICore ||
            HalDoOS.aiCore ||
            null
        );

    }


    function getLanguage() {

        return (
            window.HalDoLanguageManager ||
            HalDoOS.languageManager ||
            window.HalDoLanguage ||
            HalDoOS.language ||
            null
        );

    }


    function getVoice() {

        return (
            window.HalDoVoice ||
            HalDoOS.voice ||
            null
        );

    }


    function getStorage() {

        return (
            window.HalDoStorage ||
            HalDoOS.storage ||
            null
        );

    }


    function getKeyboard() {

        return (
            window.HalDoEzidiKeyboard ||
            window.HalDoKeyboard ||
            HalDoOS.keyboard ||
            null
        );

    }


    function getNotifications() {

        return (
            window.HalDoNotifications ||
            HalDoOS.notifications ||
            null
        );

    }


    function hasMethod(
        object,
        method
    ) {

        return !!(
            object &&
            typeof object[method] ===
            "function"
        );

    }


    /* ========================================================
       03 — HELPERS
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
            /[^a-z0-9äöüßîêç_-]+/gi,
            "-"
        )
        .replace(
            /-+/g,
            "-"
        )
        .replace(
            /^-|-$/g,
            "");

    }


    function clone(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }


        if (
            Array.isArray(
                value
            )
        ) {

            return value.map(
                clone
            );

        }


        if (
            typeof value ===
            "object"
        ) {

            const result = {};

            Object.keys(
                value
            ).forEach(
                key => {

                    result[key] =
                        clone(
                            value[key]
                        );

                }
            );

            return result;

        }


        return value;

    }


    function safeArray(
        value
    ) {

        return Array.isArray(
            value
        )
            ? value
            : [];

    }


    /* ========================================================
       04 — STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        initializing:
            false,

        ready:
            false,

        failed:
            false,

        visible:
            false,

        searchQuery:
            "",

        activeCategory:
            "all",

        selectedAppId:
            null,

        activeAppId:
            null,

        favorites:
            new Set(),

        recent:
            [],

        apps:
            [],

        categories:
            [],

        listeners:
            new Map(),

        statistics: {

            launches:
                0,

            searches:
                0,

            activations:
                0,

            closes:
                0,

            favorites:
                0,

            errors:
                0

        },

        connections: {

            kernel:
                false,

            system:
                false,

            appManager:
                false,

            registry:
                false,

            router:
                false,

            windowManager:
                false,

            ai:
                false,

            language:
                false,

            voice:
                false,

            storage:
                false,

            keyboard:
                false,

            notifications:
                false

        }

    };


    /* ========================================================
       05 — LOGGING
       ======================================================== */

    function log() {

        try {

            console.log(
                "[HalDo Launcher 20]",
                ...arguments
            );

        } catch (_) {}

    }


    function warn() {

        try {

            console.warn(
                "[HalDo Launcher 20]",
                ...arguments
            );

        } catch (_) {}

    }


    function errorLog() {

        try {

            console.error(
                "[HalDo Launcher 20]",
                ...arguments
            );

        } catch (_) {}

    }


    /* ========================================================
       06 — EVENTS
       ======================================================== */

    function on(
        event,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return function () {};

        }


        if (
            !state.listeners.has(
                event
            )
        ) {

            state.listeners.set(
                event,
                new Set()
            );

        }


        const listeners =
            state.listeners.get(
                event
            );


        listeners.add(
            callback
        );


        return function () {

            off(
                event,
                callback
            );

        };

    }


    function off(
        event,
        callback
    ) {

        const listeners =
            state.listeners.get(
                event
            );


        if (!listeners) {

            return;

        }


        listeners.delete(
            callback
        );


        if (
            listeners.size ===
            0
        ) {

            state.listeners.delete(
                event
            );

        }

    }


    function emit(
        event,
        data = null
    ) {

        const listeners =
            state.listeners.get(
                event
            );


        if (listeners) {

            Array.from(
                listeners
            ).forEach(
                callback => {

                    try {

                        callback(
                            data
                        );

                    } catch (exception) {

                        reportError(
                            exception,
                            "Launcher Event: " +
                            event
                        );

                    }

                }
            );

        }


        const events =
            HalDoOS.events;


        if (
            events &&
            hasMethod(
                events,
                "emit"
            )
        ) {

            try {

                events.emit(
                    "launcher:" +
                    event,
                    data
                );

            } catch (_) {}

        }


        const kernel =
            getKernel();


        if (
            kernel &&
            hasMethod(
                kernel,
                "emit"
            )
        ) {

            try {

                kernel.emit(
                    "launcher:" +
                    event,
                    data
                );

            } catch (_) {}

        }

    }


    /* ========================================================
       07 — ERROR
       ======================================================== */

    function reportError(
        exception,
        context =
            "Launcher"
    ) {

        state.statistics.errors +=
            1;


        const normalized =
            exception instanceof Error
                ? exception
                : new Error(
                    String(
                        exception
                    )
                );


        const record = {

            name:
                normalized.name,

            message:
                normalized.message,

            stack:
                normalized.stack ||
                "",

            context,

            timestamp:
                Date.now()

        };


        errorLog(
            record
        );


        emit(
            "error",
            record
        );


        const kernel =
            getKernel();


        if (
            kernel &&
            hasMethod(
                kernel,
                "reportError"
            )
        ) {

            try {

                kernel.reportError(
                    normalized,
                    context
                );

            } catch (_) {}

        }


        return record;

    }


    /* ========================================================
       08 — APP SYNCHRONISATION
       ======================================================== */

    function syncApps() {

        const manager =
            getAppManager();

        const registry =
            getRegistry();


        let apps = [];


        try {

            if (
                manager &&
                hasMethod(
                    manager,
                    "getApps"
                )
            ) {

                apps =
                    manager.getApps();

            } else if (
                manager &&
                hasMethod(
                    manager,
                    "getAll"
                )
            ) {

                apps =
                    manager.getAll();

            } else if (
                registry &&
                hasMethod(
                    registry,
                    "getAll"
                )
            ) {

                apps =
                    registry.getAll();

            }

        } catch (exception) {

            reportError(
                exception,
                "Launcher App Synchronisation"
            );

        }


        state.apps =
            safeArray(
                apps
            )
            .filter(
                app =>
                    app &&
                    app.id
            )
            .map(
                app => ({
                    ...app,

                    id:
                        normalizeId(
                            app.id
                        )

                })
            );


        buildCategories();


        emit(
            "apps-synchronized",
            {

                count:
                    state.apps.length,

                apps:
                    clone(
                        state.apps
                    )

            }
        );


        return getApps();

    }


    function getApps() {

        return state.apps.map(
            app =>
                clone(
                    app
                )
        );

    }


    function getApp(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        return (
            state.apps.find(
                app =>
                    normalizeId(
                        app.id
                    ) === id
            ) ||
            null
        );

    }


    /* ========================================================
       09 — CATEGORIES
       ======================================================== */

    function buildCategories() {

        const categories =
            new Set([
                "all"
            ]);


        state.apps.forEach(
            app => {

                if (
                    app.category
                ) {

                    categories.add(
                        String(
                            app.category
                        )
                        .trim()
                        .toLowerCase()
                    );

                }

            }
        );


        state.categories =
            Array.from(
                categories
            );


        return getCategories();

    }


    function getCategories() {

        return [
            ...state.categories
        ];

    }


    function setCategory(
        category
    ) {

        const value =
            String(
                category ||
                "all"
            )
            .trim()
            .toLowerCase();


        state.activeCategory =
            state.categories.includes(
                value
            )
                ? value
                : "all";


        emit(
            "category-changed",
            {

                category:
                    state.activeCategory,

                apps:
                    getVisibleApps()

            }
        );


        return state.activeCategory;

    }


    function getCategory() {

        return state.activeCategory;

    }


    /* ========================================================
       10 — SEARCH
       ======================================================== */

    function search(
        query
    ) {

        const value =
            String(
                query || ""
            )
            .trim()
            .toLowerCase();


        state.searchQuery =
            value;


        state.statistics.searches +=
            1;


        const results =
            getVisibleApps();


        emit(
            "search",
            {

                query:
                    value,

                results:
                    results

            }
        );


        return results;

    }


    function getSearchQuery() {

        return state.searchQuery;

    }


    function clearSearch() {

        state.searchQuery =
            "";


        emit(
            "search-cleared",
            {
                results:
                    getVisibleApps()
            }
        );


        return getVisibleApps();

    }


    function getVisibleApps() {

        const query =
            state.searchQuery;


        const category =
            state.activeCategory;


        return state.apps
            .filter(
                app =>
                    app.enabled !==
                    false
            )
            .filter(
                app => {

                    if (
                        category ===
                        "all"
                    ) {

                        return true;

                    }


                    return String(
                        app.category ||
                        ""
                    )
                    .trim()
                    .toLowerCase() ===
                    category;

                }
            )
            .filter(
                app => {

                    if (!query) {

                        return true;

                    }


                    const fields = [

                        app.id,

                        app.name,

                        app.title,

                        app.description,

                        app.category,

                        ...safeArray(
                            app.tags
                        ),

                        ...safeArray(
                            app.keywords
                        )

                    ];


                    return fields.some(
                        field =>
                            String(
                                field || ""
                            )
                            .toLowerCase()
                            .includes(
                                query
                            )
                    );

                }
            )
            .map(
                app =>
                    clone(
                        app
                    )
            );

    }


    /* ========================================================
       11 — FAVORITES
       ======================================================== */

    function isFavorite(
        appId
    ) {

        return state.favorites.has(
            normalizeId(
                appId
            )
        );

    }


    function addFavorite(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (
            !getApp(
                id
            )
        ) {

            return false;

        }


        if (
            !state.favorites.has(
                id
            )
        ) {

            state.favorites.add(
                id
            );

            state.statistics.favorites +=
                1;

            saveState();

        }


        emit(
            "favorite-added",
            {
                appId:
                    id
            }
        );


        return true;

    }


    function removeFavorite(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const removed =
            state.favorites.delete(
                id
            );


        if (removed) {

            saveState();

        }


        emit(
            "favorite-removed",
            {
                appId:
                    id
            }
        );


        return removed;

    }


    function toggleFavorite(
        appId
    ) {

        if (
            isFavorite(
                appId
            )
        ) {

            removeFavorite(
                appId
            );

            return false;

        }


        addFavorite(
            appId
        );


        return true;

    }


    function getFavorites() {

        return state.apps
            .filter(
                app =>
                    state.favorites.has(
                        normalizeId(
                            app.id
                        )
                    )
            )
            .map(
                app =>
                    clone(
                        app
                    )
            );

    }


    /* ========================================================
       12 — RECENT APPS
       ======================================================== */

    function addRecent(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (!id) {

            return;

        }


        state.recent =
            state.recent.filter(
                value =>
                    value !== id
            );


        state.recent.unshift(
            id
        );


        state.recent =
            state.recent.slice(
                0,
                20
            );


        saveState();


        emit(
            "recent-changed",
            {
                recent:
                    getRecentApps()
            }
        );

    }


    function getRecentApps() {

        return state.recent
            .map(
                id =>
                    getApp(
                        id
                    )
            )
            .filter(
                Boolean
            )
            .map(
                app =>
                    clone(
                        app
                    )
            );

    }


    function clearRecent() {

        state.recent =
            [];


        saveState();


        emit(
            "recent-cleared"
        );


        return true;

    }


    /* ========================================================
       13 — STORAGE
       ======================================================== */

    const STORAGE_KEY =
        "haldo.os20.launcher.state";


    function saveState() {

        const data = {

            favorites:
                Array.from(
                    state.favorites
                ),

            recent:
                [
                    ...state.recent
                ]

        };


        const storage =
            getStorage();


        try {

            if (
                storage &&
                hasMethod(
                    storage,
                    "set"
                )
            ) {

                const result =
                    storage.set(
                        STORAGE_KEY,
                        data
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    result.catch(
                        exception =>
                            reportError(
                                exception,
                                "Launcher Storage"
                            )
                    );

                }


                return true;

            }


            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    data
                )
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Launcher State speichern"
            );


            return false;

        }

    }


    async function loadState() {

        const storage =
            getStorage();


        try {

            let data = null;


            if (
                storage &&
                hasMethod(
                    storage,
                    "get"
                )
            ) {

                data =
                    storage.get(
                        STORAGE_KEY
                    );


                if (
                    data &&
                    typeof data.then ===
                    "function"
                ) {

                    data =
                        await data;

                }

            } else {

                const raw =
                    window.localStorage.getItem(
                        STORAGE_KEY
                    );


                if (raw) {

                    data =
                        JSON.parse(
                            raw
                        );

                }

            }


            if (
                data &&
                typeof data ===
                "object"
            ) {

                state.favorites =
                    new Set(
                        safeArray(
                            data.favorites
                        )
                        .map(
                            normalizeId
                        )
                    );


                state.recent =
                    safeArray(
                        data.recent
                    )
                    .map(
                        normalizeId
                    );

            }


            emit(
                "state-loaded"
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Launcher State laden"
            );


            return false;

        }

    }


    /* ========================================================
       14 — OPEN APP
       ======================================================== */

    async function openApp(
        appId,
        options = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        const app =
            getApp(
                id
            );


        if (!app) {

            reportError(
                new Error(
                    "App nicht gefunden: " +
                    id
                ),
                "Launcher App öffnen"
            );


            return null;

        }


        const manager =
            getAppManager();


        if (!manager) {

            reportError(
                new Error(
                    "App Manager nicht verbunden."
                ),
                "Launcher App öffnen"
            );


            return null;

        }


        try {

            let result = null;


            if (
                hasMethod(
                    manager,
                    "openApp"
                )
            ) {

                result =
                    await manager.openApp(
                        id,
                        {
                            source:
                                "launcher",

                            ...options
                        }
                    );

            } else if (
                hasMethod(
                    manager,
                    "open"
                )
            ) {

                result =
                    await manager.open(
                        id,
                        {
                            source:
                                "launcher",

                            ...options
                        }
                    );

            }


            if (!result) {

                return null;

            }


            state.selectedAppId =
                id;

            state.activeAppId =
                id;


            addRecent(
                id
            );


            state.statistics.launches +=
                1;


            state.statistics.activations +=
                1;


            emit(
                "app-opened",
                {

                    app:
                        app,

                    result:
                        result,

                    options:
                        options

                }
            );


            return result;

        } catch (exception) {

            reportError(
                exception,
                "Launcher App öffnen: " +
                id
            );


            return null;

        }

    }


    /* ========================================================
       15 — ACTIVATE
       ======================================================== */

    async function activateApp(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        const manager =
            getAppManager();


        if (!manager) {

            return false;

        }


        try {

            let result = false;


            if (
                hasMethod(
                    manager,
                    "activateApp"
                )
            ) {

                result =
                    await manager.activateApp(
                        id
                    );

            } else if (
                hasMethod(
                    manager,
                    "activate"
                )
            ) {

                result =
                    await manager.activate(
                        id
                    );

            }


            if (result) {

                state.activeAppId =
                    id;

                state.selectedAppId =
                    id;

                addRecent(
                    id
                );

                state.statistics.activations +=
                    1;

            }


            emit(
                "app-activated",
                {
                    appId:
                        id,

                    result
                }
            );


            return !!result;

        } catch (exception) {

            reportError(
                exception,
                "Launcher App aktivieren"
            );


            return false;

        }

    }


    /* ========================================================
       16 — CLOSE APP
       ======================================================== */

    async function closeApp(
        appId,
        options = {}
    ) {

        const id =
            normalizeId(
                appId
            );


        const manager =
            getAppManager();


        if (!manager) {

            return false;

        }


        try {

            let result = false;


            if (
                hasMethod(
                    manager,
                    "closeApp"
                )
            ) {

                result =
                    await manager.closeApp(
                        id,
                        options
                    );

            } else if (
                hasMethod(
                    manager,
                    "close"
                )
            ) {

                result =
                    await manager.close(
                        id,
                        options
                    );

            }


            if (result) {

                if (
                    state.activeAppId ===
                    id
                ) {

                    state.activeAppId =
                        null;

                }


                state.statistics.closes +=
                    1;

            }


            emit(
                "app-closed",
                {
                    appId:
                        id,

                    result
                }
            );


            return !!result;

        } catch (exception) {

            reportError(
                exception,
                "Launcher App schließen"
            );


            return false;

        }

    }


    /* ========================================================
       17 — MINIMIZE / RESTORE
       ======================================================== */

    async function minimizeApp(
        appId
    ) {

        const manager =
            getAppManager();


        if (
            !manager ||
            !hasMethod(
                manager,
                "minimize"
            )
        ) {

            return false;

        }


        try {

            return !!(
                await manager.minimize(
                    normalizeId(
                        appId
                    )
                )
            );

        } catch (exception) {

            reportError(
                exception,
                "Launcher App minimieren"
            );


            return false;

        }

    }


    async function restoreApp(
        appId
    ) {

        const manager =
            getAppManager();


        if (
            !manager ||
            !hasMethod(
                manager,
                "restore"
            )
        ) {

            return false;

        }


        try {

            return !!(
                await manager.restore(
                    normalizeId(
                        appId
                    )
                )
            );

        } catch (exception) {

            reportError(
                exception,
                "Launcher App wiederherstellen"
            );


            return false;

        }

    }


    /* ========================================================
       18 — LAUNCHER VISIBILITY
       ======================================================== */

    function openLauncher() {

        state.visible =
            true;


        emit(
            "opened",
            {
                apps:
                    getVisibleApps()
            }
        );


        return true;

    }


    function closeLauncher() {

        state.visible =
            false;


        emit(
            "closed"
        );


        return true;

    }


    function toggleLauncher() {

        if (
            state.visible
        ) {

            closeLauncher();

        } else {

            openLauncher();

        }


        return state.visible;

    }


    function isOpen() {

        return state.visible;

    }


    /* ========================================================
       19 — SELECTION
       ======================================================== */

    function selectApp(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );


        if (
            !getApp(
                id
            )
        ) {

            return null;

        }


        state.selectedAppId =
            id;


        emit(
            "app-selected",
            {
                app:
                    getApp(
                        id
                    )
            }
        );


        return getApp(
            id
        );

    }


    function getSelectedApp() {

        return state.selectedAppId
            ? getApp(
                state.selectedAppId
            )
            : null;

    }


    /* ========================================================
       20 — AI
       ======================================================== */

    async function askAI(
        query,
        options = {}
    ) {

        const ai =
            getAI();


        if (!ai) {

            return null;

        }


        try {

            if (
                hasMethod(
                    ai,
                    "ask"
                )
            ) {

                return await ai.ask(
                    query,
                    {

                        source:
                            "launcher",

                        ...options

                    }
                );

            }


            if (
                hasMethod(
                    ai,
                    "chat"
                )
            ) {

                return await ai.chat(
                    query,
                    {

                        source:
                            "launcher",

                        ...options

                    }
                );

            }


            if (
                hasMethod(
                    ai,
                    "process"
                )
            ) {

                return await ai.process(
                    query,
                    {

                        source:
                            "launcher",

                        ...options

                    }
                );

            }

        } catch (exception) {

            reportError(
                exception,
                "Launcher AI"
            );

        }


        return null;

    }


    /* ========================================================
       21 — CONNECTIONS
       ======================================================== */

    function refreshConnections() {

        state.connections.kernel =
            !!getKernel();

        state.connections.system =
            !!getSystem();

        state.connections.appManager =
            !!getAppManager();

        state.connections.registry =
            !!getRegistry();

        state.connections.router =
            !!getRouter();

        state.connections.windowManager =
            !!getWindowManager();

        state.connections.ai =
            !!getAI();

        state.connections.language =
            !!getLanguage();

        state.connections.voice =
            !!getVoice();

        state.connections.storage =
            !!getStorage();

        state.connections.keyboard =
            !!getKeyboard();

        state.connections.notifications =
            !!getNotifications();


        return {
            ...state.connections
        };

    }


    /* ========================================================
       22 — SERVICE EVENTS
       ======================================================== */

    function connectAppManagerEvents() {

        const manager =
            getAppManager();


        if (
            !manager ||
            !hasMethod(
                manager,
                "on"
            )
        ) {

            return false;

        }


        try {

            [
                "registered",
                "registry-registered",
                "registry-updated",
                "registry-removed",
                "app-opened",
                "app-closed",
                "app-activated",
                "app-stopped"
            ]
            .forEach(
                event => {

                    manager.on(
                        event,
                        payload => {

                            syncApps();


                            if (
                                payload &&
                                payload.app &&
                                payload.app.id
                            ) {

                                const id =
                                    normalizeId(
                                        payload.app.id
                                    );


                                if (
                                    event ===
                                    "app-opened" ||
                                    event ===
                                    "app-activated"
                                ) {

                                    state.activeAppId =
                                        id;

                                }


                                if (
                                    event ===
                                    "app-closed" &&
                                    state.activeAppId ===
                                    id
                                ) {

                                    state.activeAppId =
                                        null;

                                }

                            }


                            emit(
                                "manager-" +
                                event,

                                payload
                            );

                        }
                    );

                }
            );


            return true;

        } catch (exception) {

            reportError(
                exception,
                "App Manager Events"
            );


            return false;

        }

    }


    /* ========================================================
       23 — KERNEL
       ======================================================== */

    function connectKernel() {

        const kernel =
            getKernel();


        if (!kernel) {

            return false;

        }


        try {

            if (
                hasMethod(
                    kernel,
                    "registerModule"
                )
            ) {

                kernel.registerModule(
                    MODULE_ID,
                    api
                );

            }


            if (
                hasMethod(
                    kernel,
                    "setModuleReady"
                )
            ) {

                kernel.setModuleReady(
                    MODULE_ID,
                    true
                );

            }


            state.connections.kernel =
                true;


            return true;

        } catch (exception) {

            reportError(
                exception,
                "Launcher Kernel"
            );


            return false;

        }

    }


    /* ========================================================
       24 — DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        refreshConnections();


        return {

            name:
                NAME,

            version:
                VERSION,

            module:
                MODULE_ID,

            initialized:
                state.initialized,

            initializing:
                state.initializing,

            ready:
                state.ready,

            failed:
                state.failed,

            visible:
                state.visible,

            appCount:
                state.apps.length,

            visibleAppCount:
                getVisibleApps().length,

            category:
                state.activeCategory,

            search:
                state.searchQuery,

            selectedApp:
                state.selectedAppId,

            activeApp:
                state.activeAppId,

            favoriteCount:
                state.favorites.size,

            recentCount:
                state.recent.length,

            categories:
                getCategories(),

            connections:
                {
                    ...state.connections
                },

            statistics:
                {
                    ...state.statistics
                },

            timestamp:
                new Date().toISOString()

        };

    }


    function healthCheck() {

        refreshConnections();


        const problems = [];


        if (
            !state.connections.appManager
        ) {

            problems.push(
                "App Manager nicht verbunden."
            );

        }


        if (
            !state.connections.registry
        ) {

            problems.push(
                "App Registry nicht verbunden."
            );

        }


        if (
            !state.connections.windowManager
        ) {

            problems.push(
                "Window Manager nicht verbunden."
            );

        }


        return {

            healthy:
                problems.length ===
                0,

            problems,

            appCount:
                state.apps.length,

            visibleAppCount:
                getVisibleApps().length,

            connections:
                {
                    ...state.connections
                },

            timestamp:
                new Date().toISOString()

        };

    }


    /* ========================================================
       25 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            NAME,

        version:
            VERSION,

        module:
            MODULE_ID,


        /* State */

        getState() {

            return {

                initialized:
                    state.initialized,

                initializing:
                    state.initializing,

                ready:
                    state.ready,

                failed:
                    state.failed,

                visible:
                    state.visible,

                searchQuery:
                    state.searchQuery,

                activeCategory:
                    state.activeCategory,

                selectedAppId:
                    state.selectedAppId,

                activeAppId:
                    state.activeAppId,

                appCount:
                    state.apps.length,

                connections:
                    {
                        ...state.connections
                    }

            };

        },


        /* Events */

        on,

        off,

        emit,


        /* Apps */

        syncApps,

        getApps,

        getApp,

        getVisibleApps,


        /* Search */

        search,

        clearSearch,

        getSearchQuery,


        /* Categories */

        buildCategories,

        getCategories,

        setCategory,

        getCategory,


        /* Favorites */

        isFavorite,

        addFavorite,

        removeFavorite,

        toggleFavorite,

        getFavorites,


        /* Recent */

        addRecent,

        getRecentApps,

        clearRecent,


        /* App lifecycle */

        openApp,

        activateApp,

        closeApp,

        minimizeApp,

        restoreApp,


        /* Launcher */

        openLauncher,

        closeLauncher,

        toggleLauncher,

        isOpen,


        /* Selection */

        selectApp,

        getSelectedApp,


        /* AI */

        askAI,


        /* Storage */

        saveState,

        loadState,


        /* Connections */

        refreshConnections,

        connectKernel,


        /* Diagnostics */

        diagnostics,

        healthCheck,


        /* Statistics */

        getStatistics() {

            return {
                ...state.statistics
            };

        }

    };


    /* ========================================================
       26 — GLOBAL EXPORT
       ======================================================== */

    window.HalDoLauncher =
        api;

    window.HalDoOSLauncher =
        api;

    HalDoOS.launcher =
        api;


    /* ========================================================
       27 — INITIALIZATION
       ======================================================== */

    async function initialize() {

        if (
            state.ready
        ) {

            return api;

        }


        if (
            state.initializing
        ) {

            return api;

        }


        state.initializing =
            true;

        state.initialized =
            true;

        state.failed =
            false;


        emit(
            "initializing",
            {
                version:
                    VERSION
            }
        );


        try {

            refreshConnections();

            await loadState();

            syncApps();

            connectKernel();

            connectAppManagerEvents();


            state.ready =
                true;

            state.initializing =
                false;


            const kernel =
                getKernel();


            if (
                kernel &&
                hasMethod(
                    kernel,
                    "setModuleReady"
                )
            ) {

                try {

                    kernel.setModuleReady(
                        MODULE_ID,
                        true
                    );

                } catch (_) {}

            }


            emit(
                "ready",
                diagnostics()
            );


            log(
                "HalDo AI OS 20 Launcher bereit.",
                "Apps:",
                state.apps.length
            );


            return api;

        } catch (exception) {

            state.initializing =
                false;

            state.failed =
                true;


            reportError(
                exception,
                "Launcher Initialisierung"
            );


            return api;

        }

    }


    /* ========================================================
       28 — BOOT
       ======================================================== */

    function boot() {

        initialize()
            .catch(
                exception => {

                    state.initializing =
                        false;

                    state.failed =
                        true;

                    reportError(
                        exception,
                        "Launcher Boot"
                    );

                }
            );

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

    } else {

        boot();

    }


    /* ========================================================
       29 — FINAL EXPORT
       ======================================================== */

    HalDoOS.launcher =
        api;

    window.HalDoLauncher =
        api;

    window.HalDoOSLauncher =
        api;


})(window, document);