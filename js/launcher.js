/* ============================================================

   HalDo AI OS 18

   Professional Ultimate Foundation

   ------------------------------------------------------------

   Datei: js/app-manager.js

   Aufgabe:

   - zentrale App-Verwaltung

   - apps.json laden

   - App Registry verwalten

   - App-Status verwalten

   - Apps starten / schließen

   - Launcher vorbereiten

   - App-Suche

   - Favoriten

   - zuletzt verwendete Apps

   - Berechtigungsprüfung vorbereiten

   - Kommunikation mit HalDo Kernel

   ============================================================ */

(function (window, document) {

    "use strict";

    const VERSION = "18.0.0";

    const MANAGER_ID = "app-manager";

    const state = {

        initialized: false,

        loading: false,

        ready: false,

        error: false,

        registry: null,

        apps: new Map(),

        runningApps: new Map(),

        recentApps: [],

        favorites: [],

        pinnedApps: [],

        categories: [],

        defaultApps: {},

        activeApp: null,

        errors: [],

        launchHistory: []

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

            listeners.set(eventName, new Set());

        }

        listeners.get(eventName).add(callback);

        return function () {

            off(eventName, callback);

        };

    }

    function off(eventName, callback) {

        const set = listeners.get(eventName);

        if (!set) {

            return;

        }

        set.delete(callback);

        if (set.size === 0) {

            listeners.delete(eventName);

        }

    }

    function emit(eventName, payload) {

        const set = listeners.get(eventName);

        if (!set) {

            return;

        }

        set.forEach(function (callback) {

            try {

                callback(payload);

            } catch (error) {

                console.error(

                    "[HalDo App Manager] Event error:",

                    eventName,

                    error

                );

            }

        });

    }

    /* =========================================================

       LOGGING

       ========================================================= */

    function log(message, data) {

        console.info(

            `[HalDo App Manager ${VERSION}] ${message}`,

            data !== undefined ? data : ""

        );

    }

    function warn(message, data) {

        console.warn(

            `[HalDo App Manager ${VERSION}] ${message}`,

            data !== undefined ? data : ""

        );

    }

    function fail(message, details) {

        const entry = {

            time: new Date().toISOString(),

            message,

            details: details || null

        };

        state.errors.push(entry);

        state.error = true;

        console.error(

            `[HalDo App Manager ${VERSION}] ${message}`,

            details || ""

        );

        emit("app-manager:error", entry);

    }

    /* =========================================================

       HELPERS

       ========================================================= */

    function clone(value) {

        if (value === undefined || value === null) {

            return value;

        }

        try {

            return JSON.parse(

                JSON.stringify(value)

            );

        } catch (error) {

            return value;

        }

    }

    function normalizeApp(app) {

        if (!app || !app.id) {

            return null;

        }

        return {

            id: app.id,

            name: app.name || app.id,

            displayName:

                app.displayName ||

                app.name ||

                app.id,

            description:

                app.description || "",

            category:

                app.category || "system",

            icon:

                app.icon || "app",

            version:

                app.version || VERSION,

            enabled:

                app.enabled !== false,

            core:

                app.core === true,

            system:

                app.system === true,

            launchable:

                app.launchable !== false,

            entry:

                app.entry || null,

            script:

                app.script || null,

            style:

                app.style || null,

            permissions:

                Array.isArray(app.permissions)

                    ? [...app.permissions]

                    : [],

            state: "registered",

            launchCount: 0,

            createdAt:

                new Date().toISOString(),

            lastLaunched: null,

            lastClosed: null,

            error: null

        };

    }

    /* =========================================================

       LOAD REGISTRY

       ========================================================= */

    async function loadRegistry() {

        if (state.loading) {

            return state.registry;

        }

        state.loading = true;

        try {

            log("Lade App Registry...");

            const response = await fetch(

                "config/apps.json",

                {

                    cache: "no-store"

                }

            );

            if (!response.ok) {

                throw new Error(

                    `apps.json konnte nicht geladen werden (${response.status})`

                );

            }

            const registry = await response.json();

            if (

                !registry ||

                !Array.isArray(registry.apps)

            ) {

                throw new Error(

                    "apps.json enthält keine gültige App-Liste."

                );

            }

            state.registry = registry;

            state.categories =

                Array.isArray(registry.categories)

                    ? clone(registry.categories)

                    : [];

            state.pinnedApps =

                Array.isArray(

                    registry.launcher?.pinnedApps

                )

                    ? [...registry.launcher.pinnedApps]

                    : [];

            state.defaultApps =

                clone(

                    registry.appDefaults?.defaultApps || {}

                );

            registry.apps.forEach(function (appData) {

                const app = normalizeApp(appData);

                if (!app) {

                    warn(

                        "Ungültiger App-Eintrag übersprungen.",

                        appData

                    );

                    return;

                }

                state.apps.set(

                    app.id,

                    app

                );

            });

            loadLocalState();

            state.loading = false;

            state.initialized = true;

            state.ready = true;

            state.error = false;

            log(

                `${state.apps.size} Apps wurden registriert.`

            );

            emit(

                "app-manager:ready",

                getState()

            );

            emit(

                "apps:loaded",

                getApps()

            );

            return registry;

        } catch (error) {

            state.loading = false;

            state.error = true;

            fail(

                "App Registry konnte nicht geladen werden.",

                error

            );

            throw error;

        }

    }

    /* =========================================================

       LOCAL STATE

       ========================================================= */

    function loadLocalState() {

        try {

            const recent =

                localStorage.getItem(

                    "haldo_recent_apps"

                );

            const favorites =

                localStorage.getItem(

                    "haldo_favorite_apps"

                );

            if (recent) {

                const parsed =

                    JSON.parse(recent);

                if (Array.isArray(parsed)) {

                    state.recentApps = parsed;

                }

            }

            if (favorites) {

                const parsed =

                    JSON.parse(favorites);

                if (Array.isArray(parsed)) {

                    state.favorites = parsed;

                }

            }

        } catch (error) {

            warn(

                "Lokaler App-Zustand konnte nicht geladen werden.",

                error

            );

        }

    }

    function saveLocalState() {

        try {

            localStorage.setItem(

                "haldo_recent_apps",

                JSON.stringify(

                    state.recentApps

                )

            );

            localStorage.setItem(

                "haldo_favorite_apps",

                JSON.stringify(

                    state.favorites

                )

            );

        } catch (error) {

            warn(

                "Lokaler App-Zustand konnte nicht gespeichert werden.",

                error

            );

        }

    }

    /* =========================================================

       APP ACCESS

       ========================================================= */

    function getApps() {

        return Array.from(

            state.apps.values()

        ).map(clone);

    }

    function getApp(id) {

        const app =

            state.apps.get(id);

        return app

            ? clone(app)

            : null;

    }

    function hasApp(id) {

        return state.apps.has(id);

    }

    function getAppsByCategory(category) {

        return getApps().filter(

            function (app) {

                return app.category === category;

            }

        );

    }

    function getEnabledApps() {

        return getApps().filter(

            function (app) {

                return app.enabled;

            }

        );

    }

    function getLaunchableApps() {

        return getEnabledApps().filter(

            function (app) {

                return app.launchable;

            }

        );

    }

    /* =========================================================

       SEARCH

       ========================================================= */

    function search(query) {

        if (!query) {

            return getLaunchableApps();

        }

        const text =

            String(query)

                .trim()

                .toLowerCase();

        if (!text) {

            return getLaunchableApps();

        }

        return getLaunchableApps().filter(

            function (app) {

                const haystack = [

                    app.id,

                    app.name,

                    app.displayName,

                    app.description,

                    app.category

                ]

                    .join(" ")

                    .toLowerCase();

                return haystack.includes(text);

            }

        );

    }

    /* =========================================================

       APP STATUS

       ========================================================= */

    function setAppState(

        id,

        newState,

        error = null

    ) {

        const app =

            state.apps.get(id);

        if (!app) {

            return false;

        }

        app.state = newState;

        app.error = error

            ? String(

                error.message ||

                error

            )

            : null;

        emit(

            "app:state",

            {

                app: clone(app)

            }

        );

        return true;

    }

    /* =========================================================

       APP VALIDATION

       ========================================================= */

    function validateApp(app) {

        const problems = [];

        if (!app) {

            problems.push(

                "App existiert nicht."

            );

            return {

                valid: false,

                problems

            };

        }

        if (!app.enabled) {

            problems.push(

                "App ist deaktiviert."

            );

        }

        if (!app.launchable) {

            problems.push(

                "App ist nicht startbar."

            );

        }

        if (!app.entry) {

            problems.push(

                "Kein Entry-Point definiert."

            );

        }

        return {

            valid:

                problems.length === 0,

            problems

        };

    }

    /* =========================================================

       APP ENTRY CHECK

       ========================================================= */

    async function checkEntryPoint(app) {

        if (!app || !app.entry) {

            return false;

        }

        try {

            const response =

                await fetch(

                    app.entry,

                    {

                        method: "HEAD",

                        cache: "no-store"

                    }

                );

            return response.ok;

        } catch (error) {

            /*

             * Einige GitHub-Pages-/Browser-Konfigurationen

             * unterstützen HEAD nicht zuverlässig.

             *

             * Deshalb ist ein fehlgeschlagenes HEAD

             * nicht automatisch ein App-Fehler.

             */

            return true;

        }

    }

    /* =========================================================

       RECENT APPS

       ========================================================= */

    function addRecentApp(id) {

        state.recentApps =

            state.recentApps.filter(

                function (appId) {

                    return appId !== id;

                }

            );

        state.recentApps.unshift(id);

        const maximum =

            state.registry

                ?.launcher

                ?.recentApps

                ?.maximum || 12;

        state.recentApps =

            state.recentApps.slice(

                0,

                maximum

            );

        saveLocalState();

        emit(

            "apps:recent-changed",

            [...state.recentApps]

        );

    }

    function getRecentApps() {

        return state.recentApps

            .map(

                function (id) {

                    return getApp(id);

                }

            )

            .filter(Boolean);

    }

    /* =========================================================

       FAVORITES

       ========================================================= */

    function addFavorite(id) {

        if (!hasApp(id)) {

            return false;

        }

        if (

            !state.favorites.includes(id)

        ) {

            state.favorites.push(id);

            saveLocalState();

            emit(

                "apps:favorites-changed",

                [...state.favorites]

            );

        }

        return true;

    }

    function removeFavorite(id) {

        state.favorites =

            state.favorites.filter(

                function (appId) {

                    return appId !== id;

                }

            );

        saveLocalState();

        emit(

            "apps:favorites-changed",

            [...state.favorites]

        );

        return true;

    }

    function isFavorite(id) {

        return state.favorites.includes(id);

    }

    function getFavoriteApps() {

        return state.favorites

            .map(

                function (id) {

                    return getApp(id);

                }

            )

            .filter(Boolean);

    }

    /* =========================================================

       PINNED APPS

       ========================================================= */

    function getPinnedApps() {

        return state.pinnedApps

            .map(

                function (id) {

                    return getApp(id);

                }

            )

            .filter(Boolean);

    }

    /* =========================================================

       LAUNCH APP

       ========================================================= */

    async function launch(id, options = {}) {

        const app =

            state.apps.get(id);

        if (!app) {

            const error =

                new Error(

                    `App nicht gefunden: ${id}`

                );

            fail(

                error.message,

                error

            );

            return {

                success: false,

                error

            };

        }

        const validation =

            validateApp(app);

        if (!validation.valid) {

            const error =

                new Error(

                    validation.problems.join(

                        " "

                    )

                );

            setAppState(

                id,

                "error",

                error

            );

            emit(

                "app:error",

                {

                    app: clone(app),

                    error

                }

            );

            return {

                success: false,

                error,

                problems:

                    validation.problems

            };

        }

        if (

            state.runningApps.has(id)

        ) {

            activateApp(id);

            return {

                success: true,

                alreadyRunning: true,

                app: clone(app)

            };

        }

        setAppState(

            id,

            "launching"

        );

        emit(

            "app:launching",

            {

                app: clone(app)

            }

        );

        try {

            /*

             * Entry-Point nur prüfen, wenn

             * der Aufrufer dies ausdrücklich verlangt.

             *

             * Dadurch funktioniert die Registry

             * auch während die einzelnen Apps

             * noch gebaut werden.

             */

            if (

                options.verifyEntry === true

            ) {

                const exists =

                    await checkEntryPoint(app);

                if (!exists) {

                    throw new Error(

                        `Entry-Point nicht erreichbar: ${app.entry}`

                    );

                }

            }

            const windowName =

                `haldo-app-${app.id}`;

            const target =

                options.target || "_self";

            let opened;

            if (

                target === "_self" ||

                options.internal === true

            ) {

                opened =

                    window.location.href =

                        app.entry;

            } else {

                opened =

                    window.open(

                        app.entry,

                        windowName

                    );

            }

            app.launchCount += 1;

            app.lastLaunched =

                new Date().toISOString();

            app.state = "running";

            state.runningApps.set(

                id,

                {

                    id,

                    startedAt:

                        new Date().toISOString()

                }

            );

            state.activeApp = id;

            addRecentApp(id);

            state.launchHistory.push({

                id,

                time:

                    new Date().toISOString(),

                success: true

            });

            emit(

                "app:launched",

                {

                    app: clone(app)

                }

            );

            emit(

                "launcher:active-app",

                {

                    id

                }

            );

            return {

                success: true,

                app: clone(app),

                opened

            };

        } catch (error) {

            setAppState(

                id,

                "error",

                error

            );

            state.launchHistory.push({

                id,

                time:

                    new Date().toISOString(),

                success: false,

                error:

                    error.message

            });

            emit(

                "app:error",

                {

                    app: clone(app),

                    error

                }

            );

            fail(

                `App konnte nicht gestartet werden: ${id}`,

                error

            );

            return {

                success: false,

                error,

                app: clone(app)

            };

        }

    }

    /* =========================================================

       ACTIVATE APP

       ========================================================= */

    function activateApp(id) {

        const app =

            state.apps.get(id);

        if (!app) {

            return false;

        }

        state.activeApp = id;

        emit(

            "app:activated",

            {

                app: clone(app)

            }

        );

        return true;

    }

    /* =========================================================

       CLOSE APP

       ========================================================= */

    function close(id) {

        const app =

            state.apps.get(id);

        if (!app) {

            return false;

        }

        state.runningApps.delete(id);

        app.state = "closed";

        app.lastClosed =

            new Date().toISOString();

        if (

            state.activeApp === id

        ) {

            state.activeApp = null;

        }

        emit(

            "app:closed",

            {

                app: clone(app)

            }

        );

        return true;

    }

    /* =========================================================

       STOP ALL

       ========================================================= */

    function closeAll() {

        const running =

            Array.from(

                state.runningApps.keys()

            );

        running.forEach(

            function (id) {

                close(id);

            }

        );

        return true;

    }

    /* =========================================================

       DEFAULT APP

       ========================================================= */

    function getDefaultApp(type) {

        const id =

            state.defaultApps[type];

        return id

            ? getApp(id)

            : null;

    }

    /* =========================================================

       APP REGISTRATION API

       ========================================================= */

    function registerApp(appData) {

        const app =

            normalizeApp(appData);

        if (!app) {

            throw new Error(

                "Ungültige App-Daten."

            );

        }

        if (

            state.apps.has(app.id)

        ) {

            warn(

                `App existiert bereits: ${app.id}`

            );

            return false;

        }

        state.apps.set(

            app.id,

            app

        );

        emit(

            "app:registered",

            {

                app: clone(app)

            }

        );

        return true;

    }

    function unregisterApp(id) {

        if (!state.apps.has(id)) {

            return false;

        }

        if (

            state.runningApps.has(id)

        ) {

            close(id);

        }

        state.apps.delete(id);

        state.recentApps =

            state.recentApps.filter(

                function (appId) {

                    return appId !== id;

                }

            );

        state.favorites =

            state.favorites.filter(

                function (appId) {

                    return appId !== id;

                }

            );

        saveLocalState();

        emit(

            "app:unregistered",

            {

                id

            }

        );

        return true;

    }

    /* =========================================================

       DIAGNOSTICS

       ========================================================= */

    function getMissingEntryPoints() {

        return getApps()

            .filter(

                function (app) {

                    return (

                        app.launchable &&

                        app.entry

                    );

                }

            );

    }

    function getStatistics() {

        const apps =

            getApps();

        return {

            total:

                apps.length,

            enabled:

                apps.filter(

                    app => app.enabled

                ).length,

            disabled:

                apps.filter(

                    app => !app.enabled

                ).length,

            core:

                apps.filter(

                    app => app.core

                ).length,

            system:

                apps.filter(

                    app => app.system

                ).length,

            launchable:

                apps.filter(

                    app => app.launchable

                ).length,

            running:

                state.runningApps.size,

            favorites:

                state.favorites.length,

            recent:

                state.recentApps.length

        };

    }

    function runDiagnostics() {

        const problems = [];

        getApps().forEach(

            function (app) {

                if (!app.id) {

                    problems.push(

                        "App ohne ID."

                    );

                }

                if (

                    app.launchable &&

                    !app.entry

                ) {

                    problems.push(

                        `${app.id}: Entry-Point fehlt.`

                    );

                }

                if (

                    !app.script &&

                    app.launchable

                ) {

                    problems.push(

                        `${app.id}: Script fehlt.`

                    );

                }

            }

        );

        const result = {

            passed:

                problems.length === 0,

            problems,

            statistics:

                getStatistics(),

            time:

                new Date().toISOString()

        };

        emit(

            "app-manager:diagnostics",

            result

        );

        return result;

    }

    /* =========================================================

       STATE

       ========================================================= */

    function getState() {

        return {

            version: VERSION,

            initialized:

                state.initialized,

            loading:

                state.loading,

            ready:

                state.ready,

            error:

                state.error,

            apps:

                getApps(),

            runningApps:

                Array.from(

                    state.runningApps.values()

                ),

            recentApps:

                getRecentApps(),

            favoriteApps:

                getFavoriteApps(),

            pinnedApps:

                getPinnedApps(),

            categories:

                clone(state.categories),

            activeApp:

                state.activeApp,

            statistics:

                getStatistics(),

            errors:

                clone(state.errors)

        };

    }

    /* =========================================================

       GLOBAL API

       ========================================================= */

    function exposeAPI() {

        window.HalDoAppManager = {

            version: VERSION,

            on,

            off,

            loadRegistry,

            getApps,

            getApp,

            hasApp,

            getAppsByCategory,

            getEnabledApps,

            getLaunchableApps,

            search,

            launch,

            activateApp,

            close,

            closeAll,

            registerApp,

            unregisterApp,

            addFavorite,

            removeFavorite,

            isFavorite,

            getFavoriteApps,

            getPinnedApps,

            getRecentApps,

            getDefaultApp,

            validateApp,

            runDiagnostics,

            getStatistics,

            getState

        };

        /*

         * Auch über die zentrale HalDo API verfügbar,

         * sobald der Kernel existiert.

         */

        if (window.HalDo) {

            window.HalDo.appManager =

                window.HalDoAppManager;

        }

        emit(

            "app-manager:api-ready",

            window.HalDoAppManager

        );

    }

    /* =========================================================

       KERNEL CONNECTION

       ========================================================= */

    function connectKernel() {

        if (

            !window.HalDoKernel

        ) {

            warn(

                "HalDoKernel noch nicht vorhanden. App Manager wartet."

            );

            return false;

        }

        window.HalDoKernel.on(

            "kernel:ready",

            async function () {

                try {

                    await initialize();

                } catch (error) {

                    fail(

                        "App Manager Initialisierung fehlgeschlagen.",

                        error

                    );

                }

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

        exposeAPI();

        await loadRegistry();

        const diagnostics =

            runDiagnostics();

        if (!diagnostics.passed) {

            warn(

                "App Registry enthält noch offene Punkte.",

                diagnostics.problems

            );

        }

        emit(

            "app-manager:initialized",

            getState()

        );

        return getState();

    }

    /* =========================================================

       STARTUP

       ========================================================= */

    function startup() {

        /*

         * Wenn der Kernel schon bereit ist,

         * direkt initialisieren.

         */

        if (

            window.HalDoKernel &&

            window.HalDoKernel.getState().ready

        ) {

            initialize()

                .catch(

                    function (error) {

                        fail(

                            "Startup fehlgeschlagen.",

                            error

                        );

                    }

                );

            return;

        }

        /*

         * Andernfalls auf Kernel warten.

         */

        connectKernel();

        /*

         * Sicherheitsfallback:

         * Falls kernel.js nicht geladen wurde,

         * kann der App Manager trotzdem

         * seine Registry laden.

         */

        if (

            !window.HalDoKernel

        ) {

            initialize()

                .catch(

                    function (error) {

                        fail(

                            "Fallback-Initialisierung fehlgeschlagen.",

                            error

                        );

                    }

                );

        }

    }

    /* =========================================================

       PUBLIC MANAGER

       ========================================================= */

    exposeAPI();

    /*

     * Wenn das Dokument bereits geladen ist,

     * sofort starten.

     */

    if (

        document.readyState === "loading"

    ) {

        document.addEventListener(

            "DOMContentLoaded",

            startup,

            {

                once: true

            }

        );

    } else {

        startup();

    }

})(window, document);