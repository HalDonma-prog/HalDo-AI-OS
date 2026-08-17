/* ============================================================
   HALDO AI OS 20
   HALDO HOME / DESKTOP APP
   ------------------------------------------------------------
   Datei:
       js/apps/haldo-home-app.js

   ECHTE HAUPTMENÜ-/DESKTOP-APP

   Verbindet:
   - HalDo App Manager
   - App Registry
   - Router
   - Window Manager
   - Launcher
   - System
   - Kernel
   - Storage
   - Language
   - AI
   - Notifications
   - Voice
   - Keyboard

   Funktionen:
   - vollständiges Hauptmenü
   - Desktop
   - App-Suche
   - App-Kategorien
   - App-Start
   - App-Aktivierung
   - zuletzt verwendete Apps
   - Favoriten
   - Schnellaktionen
   - Systemstatus
   - Uhr / Datum
   - responsive Oberfläche
   - Tastatursteuerung
   - Events
   - Fehlerbehandlung
   - persistente Einstellungen
   - keine externe Library

   HALDO AI OS 20
   ============================================================ */

(function (window, document) {

    "use strict";

    /* ========================================================
       01 — FOUNDATION
       ======================================================== */

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;

    const VERSION =
        "20.0.0";

    const APP_ID =
        "haldo-home";

    const APP_NAME =
        "HalDo Home";

    const APP_TITLE =
        "HalDo AI OS";

    const SETTINGS_KEY =
        "haldo.os20.home.settings";


    /* ========================================================
       02 — SERVICE ACCESS
       ======================================================== */

    function getAppManager() {

        return (
            window.HalDoAppManager ||
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


    function getLauncher() {

        return (
            window.HalDoLauncher ||
            HalDoOS.launcher ||
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


    function getKernel() {

        return (
            window.HalDoKernel ||
            HalDoOS.kernel ||
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


    function getLanguage() {

        return (
            window.HalDoLanguageManager ||
            HalDoOS.languageManager ||
            window.HalDoLanguage ||
            HalDoOS.language ||
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


    function getVoice() {

        return (
            window.HalDoVoice ||
            HalDoOS.voice ||
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
       03 — INTERNAL STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        mounted:
            false,

        visible:
            true,

        menuOpen:
            true,

        search:
            "",

        category:
            "all",

        apps:
            [],

        filteredApps:
            [],

        recentApps:
            [],

        favorites:
            [],

        activeApp:
            null,

        clockTimer:
            null,

        renderTimer:
            null,

        eventCleanups:
            [],

        listeners:
            new Map(),

        settings: {

            theme:
                "haldo",

            showRecent:
                true,

            showCategories:
                true,

            compact:
                false,

            animations:
                true

        },

        statistics: {

            launches:
                0,

            activations:
                0,

            searches:
                0,

            renders:
                0,

            errors:
                0

        }

    };


    /* ========================================================
       04 — UTILITIES
       ======================================================== */

    function clean(
        value
    ) {

        return String(
            value ?? ""
        ).trim();

    }


    function normalizeId(
        value
    ) {

        return clean(
            value
        )
        .toLowerCase()
        .replace(
            /[^a-z0-9äöüßîê_-]+/gi,
            "-"
        )
        .replace(
            /-+/g,
            "-"
        )
        .replace(
            /^-|-$/g,
            ""
        );

    }


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


    function log() {

        try {

            console.log(
                "[HalDo Home 20]",
                ...arguments
            );

        } catch (_) {}

    }


    function reportError(
        exception,
        context
    ) {

        state.statistics.errors++;

        try {

            console.error(
                "[HalDo Home 20]",
                context,
                exception
            );

        } catch (_) {}

        emit(
            "error",
            {

                context,

                error:
                    exception instanceof Error
                        ? exception.message
                        : String(
                            exception
                        )

            }
        );

    }


    /* ========================================================
       05 — EVENTS
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
        detail = {}
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
                            detail
                        );

                    } catch (
                        exception
                    ) {

                        console.error(
                            "[HalDo Home Event]",
                            exception
                        );

                    }

                }
            );

        }

        try {

            document.dispatchEvent(
                new CustomEvent(
                    "haldo:home:" + event,
                    {
                        detail
                    }
                )
            );

        } catch (_) {}

    }


    /* ========================================================
       06 — PERSISTENCE
       ======================================================== */

    function loadSettings() {

        const storage =
            getStorage();

        try {

            if (
                storage &&
                hasMethod(
                    storage,
                    "get"
                )
            ) {

                const result =
                    storage.get(
                        SETTINGS_KEY
                    );

                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    result.then(
                        value => {

                            if (
                                value &&
                                typeof value ===
                                "object"
                            ) {

                                Object.assign(
                                    state.settings,
                                    value
                                );

                                render();

                            }

                        }
                    ).catch(
                        exception =>
                            reportError(
                                exception,
                                "Home Settings"
                            )
                    );

                    return;

                }

                if (
                    result &&
                    typeof result ===
                    "object"
                ) {

                    Object.assign(
                        state.settings,
                        result
                    );

                    return;

                }

            }

            const raw =
                window.localStorage.getItem(
                    SETTINGS_KEY
                );

            if (!raw) {

                return;

            }

            const parsed =
                JSON.parse(
                    raw
                );

            if (
                parsed &&
                typeof parsed ===
                "object"
            ) {

                Object.assign(
                    state.settings,
                    parsed
                );

            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Home Settings laden"
            );

        }

    }


    function saveSettings() {

        const settings =
            clone(
                state.settings
            );

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
                        SETTINGS_KEY,
                        settings
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
                                "Home Settings speichern"
                            )
                    );

                }

                return true;

            }

            window.localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(
                    settings
                )
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Home Settings speichern"
            );

            return false;

        }

    }


    /* ========================================================
       07 — APP COLLECTION
       ======================================================== */

    function getAllApps() {

        const manager =
            getAppManager();

        let apps = [];

        try {

            if (
                manager &&
                hasMethod(
                    manager,
                    "getAll"
                )
            ) {

                apps =
                    manager.getAll() ||
                    [];

            } else {

                const registry =
                    getRegistry();

                if (
                    registry &&
                    hasMethod(
                        registry,
                        "getAll"
                    )
                ) {

                    apps =
                        registry.getAll() ||
                        [];

                }

            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Apps laden"
            );

        }

        if (
            !Array.isArray(
                apps
            )
        ) {

            apps = [];

        }

        return apps
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
            )
            .filter(
                app =>
                    app.id !==
                    APP_ID &&
                    app.visible !==
                    false
            );

    }


    function refreshApps() {

        state.apps =
            getAllApps();

        state.filteredApps =
            filterApps(
                state.apps
            );

        render();

        emit(
            "apps-updated",
            {
                apps:
                    clone(
                        state.apps
                    )
            }
        );

    }


    function filterApps(
        apps
    ) {

        let result =
            Array.isArray(
                apps
            )
                ? [
                    ...apps
                ]
                : [];

        const search =
            clean(
                state.search
            )
            .toLowerCase();

        const category =
            clean(
                state.category
            )
            .toLowerCase();

        if (
            category &&
            category !==
            "all"
        ) {

            result =
                result.filter(
                    app =>
                        clean(
                            app.category
                        )
                        .toLowerCase() ===
                        category
                );

        }

        if (search) {

            state.statistics.searches++;

            result =
                result.filter(
                    app => {

                        const fields = [

                            app.id,

                            app.name,

                            app.title,

                            app.description,

                            app.category,

                            ...(Array.isArray(
                                app.tags
                            )
                                ? app.tags
                                : []),

                            ...(Array.isArray(
                                app.keywords
                            )
                                ? app.keywords
                                : [])

                        ];

                        return fields.some(
                            field =>
                                clean(
                                    field
                                )
                                .toLowerCase()
                                .includes(
                                    search
                                )
                        );

                    }
                );

        }

        result.sort(
            (
                a,
                b
            ) => {

                const af =
                    state.favorites.includes(
                        normalizeId(
                            a.id
                        )
                    )
                    ? 1
                    : 0;

                const bf =
                    state.favorites.includes(
                        normalizeId(
                            b.id
                        )
                    )
                    ? 1
                    : 0;

                return bf - af;

            }
        );

        return result;

    }


    function getCategories() {

        const categories =
            new Set(
                ["all"]
            );

        state.apps.forEach(
            app => {

                const category =
                    clean(
                        app.category
                    );

                if (category) {

                    categories.add(
                        category
                    );

                }

            }
        );

        return Array.from(
            categories
        );

    }


    /* ========================================================
       08 — RECENT APPS
       ======================================================== */

    function rememberRecent(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );

        if (!id) {

            return;

        }

        state.recentApps =
            [
                id,
                ...state.recentApps.filter(
                    item =>
                        item !== id
                )
            ].slice(
                0,
                8
            );

        emit(
            "recent-changed",
            {
                recent:
                    [
                        ...state.recentApps
                    ]
            }
        );

    }


    function getRecentApps() {

        return state.recentApps
            .map(
                id =>
                    state.apps.find(
                        app =>
                            normalizeId(
                                app.id
                            ) === id
                    )
            )
            .filter(
                Boolean
            );

    }


    /* ========================================================
       09 — FAVORITES
       ======================================================== */

    function toggleFavorite(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );

        if (!id) {

            return false;

        }

        if (
            state.favorites.includes(
                id
            )
        ) {

            state.favorites =
                state.favorites.filter(
                    item =>
                        item !== id
                );

        } else {

            state.favorites.push(
                id
            );

        }

        saveHomeState();

        render();

        emit(
            "favorite-changed",
            {
                appId:
                    id,

                favorite:
                    state.favorites.includes(
                        id
                    )
            }
        );

        return true;

    }


    /* ========================================================
       10 — HOME STATE
       ======================================================== */

    function saveHomeState() {

        try {

            const value = {

                recentApps:
                    state.recentApps,

                favorites:
                    state.favorites,

                settings:
                    state.settings

            };

            window.localStorage.setItem(
                "haldo.os20.home.state",
                JSON.stringify(
                    value
                )
            );

        } catch (_) {}

        saveSettings();

    }


    function loadHomeState() {

        loadSettings();

        try {

            const raw =
                window.localStorage.getItem(
                    "haldo.os20.home.state"
                );

            if (!raw) {

                return;

            }

            const parsed =
                JSON.parse(
                    raw
                );

            if (
                parsed &&
                Array.isArray(
                    parsed.recentApps
                )
            ) {

                state.recentApps =
                    parsed.recentApps
                        .map(
                            normalizeId
                        )
                        .filter(
                            Boolean
                        )
                        .slice(
                            0,
                            8
                        );

            }

            if (
                parsed &&
                Array.isArray(
                    parsed.favorites
                )
            ) {

                state.favorites =
                    parsed.favorites
                        .map(
                            normalizeId
                        )
                        .filter(
                            Boolean
                        );

            }

            if (
                parsed &&
                parsed.settings &&
                typeof parsed.settings ===
                "object"
            ) {

                Object.assign(
                    state.settings,
                    parsed.settings
                );

            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Home State laden"
            );

        }

    }


    /* ========================================================
       11 — APP OPEN
       ======================================================== */

    async function openApp(
        appId
    ) {

        const id =
            normalizeId(
                appId
            );

        if (!id) {

            return false;

        }

        const manager =
            getAppManager();

        const app =
            state.apps.find(
                item =>
                    normalizeId(
                        item.id
                    ) === id
            );

        if (
            !app
        ) {

            notify(
                "App nicht gefunden",
                id,
                "error"
            );

            return false;

        }

        try {

            let result =
                null;

            if (
                manager &&
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
                                "haldo-home"
                        }
                    );

            } else if (
                manager &&
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
                                "haldo-home"
                        }
                    );

            } else {

                const launcher =
                    getLauncher();

                if (
                    launcher &&
                    hasMethod(
                        launcher,
                        "launch"
                    )
                ) {

                    result =
                        await launcher.launch(
                            id
                        );

                } else {

                    const router =
                        getRouter();

                    if (
                        router &&
                        hasMethod(
                            router,
                            "open"
                        )
                    ) {

                        result =
                            await router.open(
                                id
                            );

                    }

                }

            }

            if (
                result === null ||
                result === false
            ) {

                notify(
                    "App konnte nicht geöffnet werden",
                    app.title ||
                    app.name ||
                    id,
                    "error"
                );

                return false;

            }

            rememberRecent(
                id
            );

            state.activeApp =
                id;

            state.statistics.launches++;

            saveHomeState();

            emit(
                "app-opened",
                {
                    app:
                        clone(
                            app
                        ),

                    result
                }
            );

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "App öffnen: " +
                id
            );

            notify(
                "Fehler beim Öffnen",
                exception.message ||
                String(
                    exception
                ),
                "error"
            );

            return false;

        }

    }


    /* ========================================================
       12 — ACTIVE APP
       ======================================================== */

    function activateApp(
        appId
    ) {

        const manager =
            getAppManager();

        const id =
            normalizeId(
                appId
            );

        if (
            manager &&
            hasMethod(
                manager,
                "activate"
            )
        ) {

            try {

                const result =
                    manager.activate(
                        id
                    );

                state.activeApp =
                    id;

                state.statistics.activations++;

                rememberRecent(
                    id
                );

                render();

                return result;

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "App aktivieren"
                );

            }

        }

        return openApp(
            id
        );

    }


    /* ========================================================
       13 — NOTIFICATIONS
       ======================================================== */

    function notify(
        title,
        message,
        type =
            "info"
    ) {

        const notifications =
            getNotifications();

        try {

            if (
                notifications &&
                hasMethod(
                    notifications,
                    "notify"
                )
            ) {

                notifications.notify(
                    {
                        title,
                        message,
                        type
                    }
                );

                return;

            }

            if (
                notifications &&
                hasMethod(
                    notifications,
                    "show"
                )
            ) {

                notifications.show(
                    title,
                    message,
                    type
                );

                return;

            }

        } catch (_) {}

    }


    /* ========================================================
       14 — QUICK ACTIONS
       ======================================================== */

    function quickAction(
        action
    ) {

        try {

            switch (
                action
            ) {

                case "refresh":

                    refreshApps();

                    notify(
                        "HalDo Home",
                        "App-Liste aktualisiert.",
                        "success"
                    );

                    break;


                case "diagnostics":

                    runDiagnostics();

                    break;


                case "fullscreen":

                    toggleFullscreen();

                    break;


                case "settings":

                    openApp(
                        "settings"
                    );

                    break;


                case "ai":

                    openApp(
                        "ai"
                    );

                    break;


                case "close-apps":

                    closeAllApps();

                    break;


                default:

                    break;

            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Quick Action"
            );

        }

    }


    async function closeAllApps() {

        const manager =
            getAppManager();

        if (
            manager &&
            hasMethod(
                manager,
                "closeAll"
            )
        ) {

            try {

                await manager.closeAll(
                    {
                        source:
                            "haldo-home"
                    }
                );

                notify(
                    "HalDo Home",
                    "Geöffnete Apps wurden geschlossen.",
                    "success"
                );

            } catch (
                exception
            ) {

                reportError(
                    exception,
                    "Apps schließen"
                );

            }

        }

    }


    function runDiagnostics() {

        const manager =
            getAppManager();

        let result =
            null;

        try {

            if (
                manager &&
                hasMethod(
                    manager,
                    "diagnostics"
                )
            ) {

                result =
                    manager.diagnostics();

            } else {

                const kernel =
                    getKernel();

                if (
                    kernel &&
                    hasMethod(
                        kernel,
                        "diagnostics"
                    )
                ) {

                    result =
                        kernel.diagnostics();

                }

            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Diagnostics"
            );

        }

        if (result) {

            notify(
                "HalDo Systemdiagnose",
                "Diagnose erfolgreich ausgeführt.",
                "success"
            );

            emit(
                "diagnostics",
                {
                    result
                }
            );

            return result;

        }

        notify(
            "Systemdiagnose",
            "Keine Diagnose-Schnittstelle verfügbar.",
            "warning"
        );

        return null;

    }


    function toggleFullscreen() {

        try {

            if (
                !document.fullscreenElement
            ) {

                if (
                    document.documentElement.requestFullscreen
                ) {

                    document.documentElement
                        .requestFullscreen();

                }

            } else if (
                document.exitFullscreen
            ) {

                document.exitFullscreen();

            }

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Fullscreen"
            );

        }

    }


    /* ========================================================
       15 — CLOCK
       ======================================================== */

    function updateClock() {

        const clock =
            document.querySelector(
                "[data-haldo-home-clock]"
            );

        const date =
            document.querySelector(
                "[data-haldo-home-date]"
            );

        if (!clock) {

            return;

        }

        const now =
            new Date();

        clock.textContent =
            now.toLocaleTimeString(
                undefined,
                {
                    hour:
                        "2-digit",

                    minute:
                        "2-digit"
                }
            );

        if (date) {

            date.textContent =
                now.toLocaleDateString(
                    undefined,
                    {
                        weekday:
                            "long",

                        day:
                            "2-digit",

                        month:
                            "long",

                        year:
                            "numeric"
                    }
                );

        }

    }


    function startClock() {

        if (
            state.clockTimer
        ) {

            clearInterval(
                state.clockTimer
            );

        }

        updateClock();

        state.clockTimer =
            setInterval(
                updateClock,
                1000
            );

    }


    /* ========================================================
       16 — CSS
       ======================================================== */

    function injectStyles() {

        if (
            document.getElementById(
                "haldo-home-app-styles"
            )
        ) {

            return;

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "haldo-home-app-styles";

        style.textContent = `

        #haldo-home-app {

            position: fixed;

            inset: 0;

            z-index: 1;

            display: flex;

            flex-direction: column;

            overflow: hidden;

            color: #f4f7ff;

            background:
                radial-gradient(
                    circle at 15% 10%,
                    rgba(77, 130, 255, .22),
                    transparent 32%
                ),

                radial-gradient(
                    circle at 85% 20%,
                    rgba(145, 72, 255, .20),
                    transparent 35%
                ),

                linear-gradient(
                    135deg,
                    #070b16 0%,
                    #0b1020 45%,
                    #11172b 100%
                );

            font-family:
                -apple-system,
                BlinkMacSystemFont,
                "SF Pro Display",
                "Segoe UI",
                sans-serif;

            isolation: isolate;

        }


        #haldo-home-app::before {

            content: "";

            position: absolute;

            inset: 0;

            pointer-events: none;

            background:
                linear-gradient(
                    rgba(255,255,255,.018) 1px,
                    transparent 1px
                );

            background-size:
                100% 4px;

            opacity: .25;

        }


        .haldo-home-topbar {

            position: relative;

            z-index: 5;

            min-height: 76px;

            display: flex;

            align-items: center;

            gap: 18px;

            padding:
                12px 22px;

            background:
                rgba(8, 12, 25, .68);

            border-bottom:
                1px solid
                rgba(255,255,255,.08);

            backdrop-filter:
                blur(24px);

        }


        .haldo-home-brand {

            display: flex;

            align-items: center;

            gap: 12px;

            min-width: 210px;

        }


        .haldo-home-logo {

            width: 48px;

            height: 48px;

            border-radius: 15px;

            display: grid;

            place-items: center;

            overflow: hidden;

            background:
                rgba(255,255,255,.08);

            border:
                1px solid
                rgba(255,255,255,.14);

            box-shadow:
                0 8px 30px
                rgba(0,0,0,.25);

        }


        .haldo-home-logo img {

            width: 100%;

            height: 100%;

            object-fit: contain;

        }


        .haldo-home-brand-text {

            display: flex;

            flex-direction: column;

        }


        .haldo-home-brand-title {

            font-size: 17px;

            font-weight: 800;

            letter-spacing: .2px;

        }


        .haldo-home-brand-subtitle {

            font-size: 11px;

            opacity: .55;

            margin-top: 2px;

        }


        .haldo-home-search {

            flex: 1;

            max-width: 720px;

            margin: 0 auto;

            position: relative;

        }


        .haldo-home-search input {

            width: 100%;

            box-sizing: border-box;

            border: 1px solid
                rgba(255,255,255,.10);

            outline: none;

            border-radius: 17px;

            padding:
                14px 18px 14px 46px;

            color: #fff;

            background:
                rgba(255,255,255,.07);

            font-size: 14px;

            transition:
                .2s ease;

        }


        .haldo-home-search input:focus {

            border-color:
                rgba(119,154,255,.55);

            background:
                rgba(255,255,255,.10);

            box-shadow:
                0 0 0 4px
                rgba(90,120,255,.10);

        }


        .haldo-home-search-icon {

            position: absolute;

            left: 17px;

            top: 50%;

            transform:
                translateY(-50%);

            opacity: .55;

            pointer-events: none;

        }


        .haldo-home-clock-box {

            min-width: 125px;

            text-align: right;

        }


        .haldo-home-clock {

            font-size: 20px;

            font-weight: 700;

        }


        .haldo-home-date {

            font-size: 10px;

            opacity: .5;

            margin-top: 3px;

            white-space: nowrap;

        }


        .haldo-home-body {

            position: relative;

            z-index: 2;

            flex: 1;

            display: flex;

            min-height: 0;

        }


        .haldo-home-sidebar {

            width: 210px;

            flex-shrink: 0;

            padding: 18px 12px;

            border-right:
                1px solid
                rgba(255,255,255,.07);

            background:
                rgba(4,8,17,.35);

            overflow-y: auto;

        }


        .haldo-home-sidebar-title {

            font-size: 10px;

            text-transform: uppercase;

            letter-spacing: 1.3px;

            opacity: .4;

            padding:
                4px 10px 10px;

        }


        .haldo-home-category {

            width: 100%;

            border: 0;

            color: rgba(255,255,255,.68);

            background:
                transparent;

            text-align: left;

            padding:
                11px 12px;

            border-radius: 12px;

            cursor: pointer;

            margin-bottom: 4px;

            font-size: 13px;

            transition:
                .18s ease;

        }


        .haldo-home-category:hover {

            color: #fff;

            background:
                rgba(255,255,255,.07);

        }


        .haldo-home-category.active {

            color: #fff;

            background:
                linear-gradient(
                    90deg,
                    rgba(80,116,255,.28),
                    rgba(140,82,255,.14)
                );

            box-shadow:
                inset 3px 0 0
                rgba(123,154,255,.9);

        }


        .haldo-home-content {

            flex: 1;

            min-width: 0;

            overflow-y: auto;

            padding:
                24px 28px 110px;

        }


        .haldo-home-welcome {

            display: flex;

            justify-content: space-between;

            align-items: flex-end;

            gap: 20px;

            margin-bottom: 24px;

        }


        .haldo-home-welcome h1 {

            margin: 0;

            font-size: clamp(
                27px,
                4vw,
                42px
            );

            letter-spacing:
                -.9px;

        }


        .haldo-home-welcome p {

            margin:
                8px 0 0;

            opacity: .52;

            font-size: 13px;

        }


        .haldo-home-actions {

            display: flex;

            gap: 8px;

            flex-wrap: wrap;

        }


        .haldo-home-action {

            border:
                1px solid
                rgba(255,255,255,.10);

            color: rgba(255,255,255,.82);

            background:
                rgba(255,255,255,.06);

            border-radius: 12px;

            padding:
                9px 12px;

            cursor: pointer;

            transition:
                .18s ease;

        }


        .haldo-home-action:hover {

            background:
                rgba(255,255,255,.11);

            transform:
                translateY(-1px);

        }


        .haldo-home-section {

            margin-bottom: 28px;

        }


        .haldo-home-section-head {

            display: flex;

            align-items: center;

            justify-content: space-between;

            margin-bottom: 12px;

        }


        .haldo-home-section-title {

            font-size: 14px;

            font-weight: 700;

        }


        .haldo-home-section-count {

            font-size: 10px;

            opacity: .42;

        }


        .haldo-home-app-grid {

            display: grid;

            grid-template-columns:
                repeat(
                    auto-fill,
                    minmax(
                        150px,
                        1fr
                    )
                );

            gap: 12px;

        }


        .haldo-home-app-card {

            position: relative;

            min-height: 148px;

            border:
                1px solid
                rgba(255,255,255,.09);

            border-radius: 20px;

            padding: 16px;

            text-align: left;

            color: #fff;

            background:
                linear-gradient(
                    145deg,
                    rgba(255,255,255,.085),
                    rgba(255,255,255,.035)
                );

            cursor: pointer;

            transition:
                transform .18s ease,
                border-color .18s ease,
                background .18s ease;

            overflow: hidden;

        }


        .haldo-home-app-card:hover {

            transform:
                translateY(-4px);

            border-color:
                rgba(139,164,255,.34);

            background:
                linear-gradient(
                    145deg,
                    rgba(110,137,255,.16),
                    rgba(255,255,255,.055)
                );

        }


        .haldo-home-app-card:active {

            transform:
                translateY(-1px)
                scale(.99);

        }


        .haldo-home-app-card.disabled {

            opacity: .38;

            cursor: not-allowed;

        }


        .haldo-home-favorite {

            position: absolute;

            right: 10px;

            top: 9px;

            border: 0;

            background:
                transparent;

            color: rgba(255,255,255,.45);

            cursor: pointer;

            font-size: 16px;

            z-index: 2;

        }


        .haldo-home-favorite.active {

            color: #fff;

        }


        .haldo-home-app-icon {

            width: 50px;

            height: 50px;

            border-radius: 15px;

            display: grid;

            place-items: center;

            margin-bottom: 14px;

            font-size: 23px;

            font-weight: 700;

            background:
                linear-gradient(
                    145deg,
                    rgba(103,137,255,.27),
                    rgba(153,87,255,.20)
                );

            border:
                1px solid
                rgba(255,255,255,.12);

            overflow: hidden;

        }


        .haldo-home-app-icon img {

            width: 100%;

            height: 100%;

            object-fit: contain;

        }


        .haldo-home-app-name {

            font-size: 14px;

            font-weight: 700;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;

        }


        .haldo-home-app-description {

            margin-top: 5px;

            font-size: 10px;

            opacity: .45;

            line-height: 1.35;

            display: -webkit-box;

            -webkit-line-clamp: 2;

            -webkit-box-orient: vertical;

            overflow: hidden;

        }


        .haldo-home-empty {

            padding: 35px;

            text-align: center;

            border:
                1px dashed
                rgba(255,255,255,.12);

            border-radius: 18px;

            opacity: .5;

        }


        .haldo-home-statusbar {

            position: fixed;

            left: 0;

            right: 0;

            bottom: 0;

            z-index: 20;

            min-height: 58px;

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 12px;

            padding:
                8px 18px;

            box-sizing: border-box;

            background:
                rgba(5,8,18,.76);

            border-top:
                1px solid
                rgba(255,255,255,.08);

            backdrop-filter:
                blur(24px);

        }


        .haldo-home-status {

            display: flex;

            align-items: center;

            gap: 9px;

            font-size: 11px;

            opacity: .65;

        }


        .haldo-home-status-dot {

            width: 7px;

            height: 7px;

            border-radius: 50%;

            background: #68e0a1;

            box-shadow:
                0 0 12px
                rgba(104,224,161,.75);

        }


        .haldo-home-taskbar {

            display: flex;

            align-items: center;

            gap: 5px;

            overflow-x: auto;

            max-width: 60%;

        }


        .haldo-home-task {

            border:
                1px solid
                rgba(255,255,255,.08);

            color: rgba(255,255,255,.75);

            background:
                rgba(255,255,255,.05);

            border-radius: 10px;

            padding:
                7px 10px;

            cursor: pointer;

            white-space: nowrap;

            font-size: 11px;

        }


        .haldo-home-task.active {

            color: #fff;

            background:
                rgba(100,130,255,.18);

        }


        @media (
            max-width: 850px
        ) {

            .haldo-home-sidebar {

                width: 68px;

            }

            .haldo-home-sidebar-title {

                display: none;

            }

            .haldo-home-category {

                text-align: center;

                font-size: 0;

            }

            .haldo-home-category::first-letter {

                font-size: 18px;

            }

            .haldo-home-brand {

                min-width: auto;

            }

            .haldo-home-brand-text {

                display: none;

            }

            .haldo-home-clock-box {

                display: none;

            }

            .haldo-home-content {

                padding:
                    18px 14px 95px;

            }

        }


        @media (
            max-width: 560px
        ) {

            .haldo-home-topbar {

                min-height: 64px;

                padding:
                    9px 12px;

            }

            .haldo-home-logo {

                width: 40px;

                height: 40px;

            }

            .haldo-home-search {

                max-width: none;

            }

            .haldo-home-app-grid {

                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );

            }

            .haldo-home-app-card {

                min-height: 130px;

                padding: 13px;

            }

            .haldo-home-status {

                display: none;

            }

            .haldo-home-taskbar {

                max-width: 100%;

            }

        }

        `;

        document.head.appendChild(
            style
        );

    }


    /* ========================================================
       17 — ICON
       ======================================================== */

    function resolveIcon(
        app
    ) {

        if (
            app &&
            app.icon
        ) {

            if (
                typeof app.icon ===
                "string"
            ) {

                if (
                    app.icon.includes(
                        "/"
                    ) ||
                    app.icon.includes(
                        "."
                    )
                ) {

                    return `
                        <img
                            src="${escapeHTML(
                                app.icon
                            )}"
                            alt=""
                        >
                    `;

                }

                return escapeHTML(
                    app.icon
                );

            }

        }

        const icons = {

            system:
                "◈",

            ai:
                "✦",

            communication:
                "◌",

            media:
                "▶",

            productivity:
                "▣",

            settings:
                "⚙",

            tools:
                "◆",

            internet:
                "◎",

            security:
                "◇",

            files:
                "▤"

        };

        return (
            icons[
                clean(
                    app.category
                ).toLowerCase()
            ] ||
            "◇"
        );

    }


    /* ========================================================
       18 — APP CARD
       ======================================================== */

    function renderAppCard(
        app
    ) {

        const id =
            normalizeId(
                app.id
            );

        const favorite =
            state.favorites.includes(
                id
            );

        const disabled =
            app.enabled ===
            false;

        return `

        <article
            class="haldo-home-app-card ${
                disabled
                    ? "disabled"
                    : ""
            }"
            data-haldo-app-id="${escapeHTML(
                id
            )}"
            tabindex="0"
            role="button"
            aria-label="${escapeHTML(
                app.title ||
                app.name ||
                id
            )}"
        >

            <button
                class="haldo-home-favorite ${
                    favorite
                        ? "active"
                        : ""
                }"
                data-favorite="${escapeHTML(
                    id
                )}"
                title="${
                    favorite
                        ? "Favorit entfernen"
                        : "Zu Favoriten"
                }"
                aria-label="${
                    favorite
                        ? "Favorit entfernen"
                        : "Zu Favoriten"
                }"
            >
                ${
                    favorite
                        ? "★"
                        : "☆"
                }
            </button>

            <div
                class="haldo-home-app-icon"
            >
                ${resolveIcon(
                    app
                )}
            </div>

            <div
                class="haldo-home-app-name"
            >
                ${escapeHTML(
                    app.title ||
                    app.name ||
                    id
                )}
            </div>

            <div
                class="haldo-home-app-description"
            >
                ${escapeHTML(
                    app.description ||
                    app.category ||
                    "HalDo AI OS App"
                )}
            </div>

        </article>

        `;

    }


    /* ========================================================
       19 — CATEGORY UI
       ======================================================== */

    function renderCategories() {

        if (
            !state.settings.showCategories
        ) {

            return "";

        }

        const categories =
            getCategories();

        return categories
            .map(
                category => {

                    const active =
                        clean(
                            state.category
                        )
                        .toLowerCase() ===
                        clean(
                            category
                        )
                        .toLowerCase();

                    const label =
                        category ===
                        "all"
                            ? "Alle Apps"
                            : category
                                .charAt(0)
                                .toUpperCase() +
                              category.slice(
                                  1
                              );

                    return `

                    <button
                        class="haldo-home-category ${
                            active
                                ? "active"
                                : ""
                        }"
                        data-category="${escapeHTML(
                            category
                        )}"
                    >
                        ${escapeHTML(
                            label
                        )}
                    </button>

                    `;

                }
            )
            .join("");

    }


    /* ========================================================
       20 — RECENT UI
       ======================================================== */

    function renderRecent() {

        if (
            !state.settings.showRecent
        ) {

            return "";

        }

        const recent =
            getRecentApps();

        if (
            !recent.length
        ) {

            return "";

        }

        return `

        <section
            class="haldo-home-section"
        >

            <div
                class="haldo-home-section-head"
            >

                <div
                    class="haldo-home-section-title"
                >
                    Zuletzt verwendet
                </div>

                <div
                    class="haldo-home-section-count"
                >
                    ${recent.length}
                </div>

            </div>

            <div
                class="haldo-home-app-grid"
            >

                ${recent
                    .map(
                        renderAppCard
                    )
                    .join("")}

            </div>

        </section>

        `;

    }


    /* ========================================================
       21 — MAIN RENDER
       ======================================================== */

    function render() {

        const root =
            document.getElementById(
                "haldo-home-app"
            );

        if (!root) {

            return;

        }

        state.filteredApps =
            filterApps(
                state.apps
            );

        const categories =
            renderCategories();

        const cards =
            state.filteredApps
                .map(
                    renderAppCard
                )
                .join("");

        const recent =
            renderRecent();

        root.innerHTML = `

            <header
                class="haldo-home-topbar"
            >

                <div
                    class="haldo-home-brand"
                >

                    <div
                        class="haldo-home-logo"
                    >

                        <img
                            src="assets/logo/logo.png"
                            alt="HalDo"
                            onerror="
                                this.style.display='none';
                                this.parentElement.textContent='H';
                            "
                        >

                    </div>

                    <div
                        class="haldo-home-brand-text"
                    >

                        <div
                            class="haldo-home-brand-title"
                        >
                            HalDo AI OS
                        </div>

                        <div
                            class="haldo-home-brand-subtitle"
                        >
                            Professional Ultimate
                        </div>

                    </div>

                </div>


                <div
                    class="haldo-home-search"
                >

                    <span
                        class="haldo-home-search-icon"
                    >
                        ⌕
                    </span>

                    <input
                        type="search"
                        data-haldo-home-search
                        placeholder="Apps, Dateien, Einstellungen oder Funktionen suchen …"
                        value="${escapeHTML(
                            state.search
                        )}"
                        autocomplete="off"
                        aria-label="HalDo Suche"
                    >

                </div>


                <div
                    class="haldo-home-clock-box"
                >

                    <div
                        class="haldo-home-clock"
                        data-haldo-home-clock
                    >
                        --:--
                    </div>

                    <div
                        class="haldo-home-date"
                        data-haldo-home-date
                    >
                        HalDo AI OS
                    </div>

                </div>

            </header>


            <div
                class="haldo-home-body"
            >

                <aside
                    class="haldo-home-sidebar"
                >

                    <div
                        class="haldo-home-sidebar-title"
                    >
                        Kategorien
                    </div>

                    ${categories}

                </aside>


                <main
                    class="haldo-home-content"
                >

                    <div
                        class="haldo-home-welcome"
                    >

                        <div>

                            <h1>
                                Willkommen bei HalDo.
                            </h1>

                            <p>
                                Dein zentraler Arbeitsplatz für Apps,
                                KI, Dateien, Einstellungen und dein
                                gesamtes HalDo AI OS.
                            </p>

                        </div>


                        <div
                            class="haldo-home-actions"
                        >

                            <button
                                class="haldo-home-action"
                                data-action="ai"
                            >
                                ✦ HalDo AI
                            </button>

                            <button
                                class="haldo-home-action"
                                data-action="settings"
                            >
                                ⚙ Einstellungen
                            </button>

                            <button
                                class="haldo-home-action"
                                data-action="diagnostics"
                            >
                                ◇ Diagnose
                            </button>

                            <button
                                class="haldo-home-action"
                                data-action="refresh"
                            >
                                ↻ Aktualisieren
                            </button>

                        </div>

                    </div>


                    ${recent}


                    <section
                        class="haldo-home-section"
                    >

                        <div
                            class="haldo-home-section-head"
                        >

                            <div
                                class="haldo-home-section-title"
                            >
                                ${
                                    state.search
                                        ? "Suchergebnisse"
                                        : state.category !==
                                          "all"
                                            ? escapeHTML(
                                                state.category
                                              )
                                            : "Alle Apps"
                                }
                            </div>

                            <div
                                class="haldo-home-section-count"
                            >
                                ${
                                    state.filteredApps.length
                                }
                                Apps
                            </div>

                        </div>


                        ${
                            cards
                                ? `
                                    <div
                                        class="haldo-home-app-grid"
                                    >
                                        ${cards}
                                    </div>
                                `
                                : `
                                    <div
                                        class="haldo-home-empty"
                                    >
                                        Keine passenden Apps gefunden.
                                    </div>
                                `
                        }

                    </section>

                </main>

            </div>


            <footer
                class="haldo-home-statusbar"
            >

                <div
                    class="haldo-home-status"
                >

                    <span
                        class="haldo-home-status-dot"
                    ></span>

                    <span>
                        HalDo System bereit
                    </span>

                </div>


                <div
                    class="haldo-home-taskbar"
                    data-haldo-home-taskbar
                >
                    ${renderTaskbar()}
                </div>


                <div
                    class="haldo-home-actions"
                >

                    <button
                        class="haldo-home-action"
                        data-action="fullscreen"
                        title="Vollbild"
                    >
                        ⛶
                    </button>

                </div>

            </footer>

        `;

        state.statistics.renders++;

        bindRenderedEvents();

        updateClock();

    }


    /* ========================================================
       22 — TASKBAR
       ======================================================== */

    function renderTaskbar() {

        const manager =
            getAppManager();

        let openApps = [];

        try {

            if (
                manager &&
                hasMethod(
                    manager,
                    "getAllOpenApps"
                )
            ) {

                openApps =
                    manager.getAllOpenApps() ||
                    [];

            }

        } catch (_) {}

        if (
            !openApps.length
        ) {

            return `
                <span
                    style="
                        opacity:.35;
                        font-size:10px;
                    "
                >
                    Keine geöffneten Apps
                </span>
            `;

        }

        return openApps
            .map(
                item => {

                    const app =
                        item.app ||
                        state.apps.find(
                            candidate =>
                                normalizeId(
                                    candidate.id
                                ) ===
                                normalizeId(
                                    item.appId
                                )
                        );

                    if (!app) {

                        return "";

                    }

                    const active =
                        normalizeId(
                            state.activeApp
                        ) ===
                        normalizeId(
                            app.id
                        );

                    return `

                    <button
                        class="haldo-home-task ${
                            active
                                ? "active"
                                : ""
                        }"
                        data-task-app="${escapeHTML(
                            app.id
                        )}"
                    >
                        ${escapeHTML(
                            app.title ||
                            app.name ||
                            app.id
                        )}
                    </button>

                    `;

                }
            )
            .join("");

    }


    /* ========================================================
       23 — EVENTS AFTER RENDER
       ======================================================== */

    function bindRenderedEvents() {

        const root =
            document.getElementById(
                "haldo-home-app"
            );

        if (!root) {

            return;

        }


        const search =
            root.querySelector(
                "[data-haldo-home-search]"
            );

        if (search) {

            search.addEventListener(
                "input",
                event => {

                    state.search =
                        event.target.value;

                    state.filteredApps =
                        filterApps(
                            state.apps
                        );

                    render();

                    const input =
                        document.querySelector(
                            "[data-haldo-home-search]"
                        );

                    if (input) {

                        input.focus();

                        try {

                            input.setSelectionRange(
                                input.value.length,
                                input.value.length
                            );

                        } catch (_) {}

                    }

                }
            );

        }


        root
            .querySelectorAll(
                "[data-category]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            state.category =
                                button.dataset.category ||
                                "all";

                            render();

                        }
                    );

                }
            );


        root
            .querySelectorAll(
                "[data-action]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            quickAction(
                                button.dataset.action
                            );

                        }
                    );

                }
            );


        root
            .querySelectorAll(
                "[data-favorite]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            toggleFavorite(
                                button.dataset.favorite
                            );

                        }
                    );

                }
            );


        root
            .querySelectorAll(
                "[data-haldo-app-id]"
            )
            .forEach(
                card => {

                    card.addEventListener(
                        "click",
                        event => {

                            if (
                                event.target.closest(
                                    "[data-favorite]"
                                )
                            ) {

                                return;

                            }

                            if (
                                card.classList.contains(
                                    "disabled"
                                )
                            ) {

                                return;

                            }

                            openApp(
                                card.dataset.haldoAppId
                            );

                        }
                    );


                    card.addEventListener(
                        "keydown",
                        event => {

                            if (
                                event.key ===
                                    "Enter" ||
                                event.key ===
                                    " "
                            ) {

                                event.preventDefault();

                                openApp(
                                    card.dataset.haldoAppId
                                );

                            }

                        }
                    );

                }
            );


        root
            .querySelectorAll(
                "[data-task-app]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            activateApp(
                                button.dataset.taskApp
                            );

                        }
                    );

                }
            );

    }


    /* ========================================================
       24 — KEYBOARD
       ======================================================== */

    function handleKeyboard(
        event
    ) {

        if (
            event.ctrlKey &&
            event.key.toLowerCase() ===
            "k"
        ) {

            event.preventDefault();

            const input =
                document.querySelector(
                    "[data-haldo-home-search]"
                );

            if (input) {

                input.focus();

                input.select();

            }

            return;

        }


        if (
            event.key ===
            "Escape"
        ) {

            const input =
                document.querySelector(
                    "[data-haldo-home-search]"
                );

            if (
                input &&
                document.activeElement ===
                input
            ) {

                input.value = "";

                state.search =
                    "";

                render();

            }

        }

    }


    /* ========================================================
       25 — MANAGER EVENTS
       ======================================================== */

    function connectManagerEvents() {

        const manager =
            getAppManager();

        if (
            manager &&
            hasMethod(
                manager,
                "on"
            )
        ) {

            const events = [

                "registered",

                "app-opened",

                "app-closed",

                "app-started",

                "app-stopped",

                "app-activated",

                "app-deactivated",

                "app-minimized",

                "app-restored",

                "app-enabled",

                "app-disabled",

                "state-changed"

            ];

            events.forEach(
                event => {

                    try {

                        const cleanup =
                            manager.on(
                                event,
                                payload => {

                                    if (
                                        payload &&
                                        payload.app &&
                                        payload.app.id
                                    ) {

                                        state.activeApp =
                                            normalizeId(
                                                payload.app.id
                                            );

                                    }

                                    refreshApps();

                                }
                            );

                        if (
                            typeof cleanup ===
                            "function"
                        ) {

                            state.eventCleanups.push(
                                cleanup
                            );

                        }

                    } catch (
                        exception
                    ) {

                        reportError(
                            exception,
                            "Manager Event: " +
                            event
                        );

                    }

                }
            );

        }


        const registry =
            getRegistry();

        if (
            registry &&
            hasMethod(
                registry,
                "on"
            )
        ) {

            [
                "registered",
                "updated",
                "removed",
                "enabled",
                "disabled"
            ]
            .forEach(
                event => {

                    try {

                        const cleanup =
                            registry.on(
                                event,
                                () => {

                                    refreshApps();

                                }
                            );

                        if (
                            typeof cleanup ===
                            "function"
                        ) {

                            state.eventCleanups.push(
                                cleanup
                            );

                        }

                    } catch (_) {}

                }
            );

        }

    }


    /* ========================================================
       26 — MOUNT
       ======================================================== */

    function mount() {

        if (
            state.mounted
        ) {

            return true;

        }

        injectStyles();

        let root =
            document.getElementById(
                "haldo-home-app"
            );

        if (!root) {

            root =
                document.createElement(
                    "section"
                );

            root.id =
                "haldo-home-app";

            root.setAttribute(
                "aria-label",
                "HalDo AI OS Hauptmenü"
            );

            document.body.appendChild(
                root
            );

        }

        state.mounted =
            true;

        render();

        startClock();

        connectManagerEvents();

        document.addEventListener(
            "keydown",
            handleKeyboard
        );

        log(
            "HalDo Home gemountet."
        );

        emit(
            "mounted"
        );

        return true;

    }


    /* ========================================================
       27 — UNMOUNT
       ======================================================== */

    function unmount() {

        if (
            !state.mounted
        ) {

            return true;

        }

        state.eventCleanups
            .forEach(
                cleanup => {

                    try {

                        cleanup();

                    } catch (_) {}

                }
            );

        state.eventCleanups =
            [];

        if (
            state.clockTimer
        ) {

            clearInterval(
                state.clockTimer
            );

            state.clockTimer =
                null;

        }

        document.removeEventListener(
            "keydown",
            handleKeyboard
        );

        const root =
            document.getElementById(
                "haldo-home-app"
            );

        if (root) {

            root.remove();

        }

        state.mounted =
            false;

        emit(
            "unmounted"
        );

        return true;

    }


    /* ========================================================
       28 — APP DEFINITION
       ======================================================== */

    const definition = {

        id:
            APP_ID,

        name:
            APP_NAME,

        title:
            APP_TITLE,

        description:
            "Zentrales Hauptmenü und Desktop von HalDo AI OS.",

        version:
            VERSION,

        icon:
            "assets/logo/logo.png",

        category:
            "system",

        singleton:
            true,

        visible:
            true,

        enabled:
            true,

        permissions: [

            "apps.read",

            "apps.open",

            "apps.activate",

            "system.read",

            "storage.read",

            "storage.write"

        ],

        dependencies: [

            "app-manager"

        ],

        metadata: {

            core:
                true,

            shell:
                true,

            desktop:
                true,

            primary:
                true

        },

        async init(
            context
        ) {

            loadHomeState();

            refreshApps();

            if (
                context
            ) {

                state.context =
                    context;

            }

        },

        async start() {

            mount();

        },

        async open() {

            if (
                !state.mounted
            ) {

                mount();

            }

            state.visible =
                true;

            state.menuOpen =
                true;

            render();

        },

        async activate() {

            state.visible =
                true;

            state.menuOpen =
                true;

            render();

        },

        async deactivate() {

            state.visible =
                false;

        },

        async close() {

            state.menuOpen =
                false;

        },

        async stop() {

            saveHomeState();

        }

    };


    /* ========================================================
       29 — PUBLIC API
       ======================================================== */

    const api = {

        __haldoAI20Home:
            true,

        id:
            APP_ID,

        name:
            APP_NAME,

        title:
            APP_TITLE,

        version:
            VERSION,

        definition,

        state,

        on,

        off,

        emit,

        mount,

        unmount,

        render,

        refresh:
            refreshApps,

        getApps() {

            return [
                ...state.apps
            ];

        },

        getFilteredApps() {

            return [
                ...state.filteredApps
            ];

        },

        getCategories,

        getRecentApps,

        openApp,

        activateApp,

        toggleFavorite,

        getState() {

            return {

                initialized:
                    state.initialized,

                mounted:
                    state.mounted,

                visible:
                    state.visible,

                menuOpen:
                    state.menuOpen,

                search:
                    state.search,

                category:
                    state.category,

                appCount:
                    state.apps.length,

                filteredCount:
                    state.filteredApps.length,

                recentApps:
                    [
                        ...state.recentApps
                    ],

                favorites:
                    [
                        ...state.favorites
                    ],

                activeApp:
                    state.activeApp

            };

        },

        getStatistics() {

            return {
                ...state.statistics
            };

        },

        diagnostics() {

            return {

                app:
                    APP_ID,

                version:
                    VERSION,

                mounted:
                    state.mounted,

                appCount:
                    state.apps.length,

                filteredCount:
                    state.filteredApps.length,

                activeApp:
                    state.activeApp,

                manager:
                    !!getAppManager(),

                registry:
                    !!getRegistry(),

                router:
                    !!getRouter(),

                windowManager:
                    !!getWindowManager(),

                launcher:
                    !!getLauncher(),

                system:
                    !!getSystem(),

                kernel:
                    !!getKernel(),

                storage:
                    !!getStorage(),

                ai:
                    !!getAI(),

                language:
                    !!getLanguage(),

                voice:
                    !!getVoice(),

                notifications:
                    !!getNotifications(),

                timestamp:
                    new Date().toISOString()

            };

        }

    };


    /* ========================================================
       30 — GLOBAL REGISTRATION
       ======================================================== */

    window.HalDoHomeApp =
        api;

    HalDoOS.homeApp =
        api;

    HalDoOS.desktopApp =
        api;


    /* ========================================================
       31 — APP MANAGER REGISTRATION
       ======================================================== */

    function registerWithManager() {

        const manager =
            getAppManager();

        if (
            !manager
        ) {

            return false;

        }

        try {

            let existing =
                null;

            if (
                hasMethod(
                    manager,
                    "get"
                )
            ) {

                existing =
                    manager.get(
                        APP_ID
                    );

            }

            if (
                !existing &&
                hasMethod(
                    manager,
                    "register"
                )
            ) {

                manager.register(
                    definition
                );

            }

            return true;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Home Registrierung"
            );

            return false;

        }

    }


    /* ========================================================
       32 — INITIALIZATION
       ======================================================== */

    async function initialize() {

        if (
            state.initialized
        ) {

            return api;

        }

        try {

            state.initialized =
                true;

            loadHomeState();

            registerWithManager();

            refreshApps();

            emit(
                "ready",
                {
                    app:
                        APP_ID,

                    version:
                        VERSION
                }
            );

            log(
                "HalDo Home 20 bereit."
            );

            return api;

        } catch (
            exception
        ) {

            reportError(
                exception,
                "Home Initialisierung"
            );

            return api;

        }

    }


    /* ========================================================
       33 — BOOT
       ======================================================== */

    function boot() {

        initialize()
            .then(
                () => {

                    /*
                     * Nur mounten, wenn keine andere
                     * Desktop-Shell das Hauptmenü bereits
                     * kontrolliert.
                     */

                    const existingShell =
                        document.querySelector(
                            "[data-haldo-shell]"
                        );

                    if (
                        !existingShell
                    ) {

                        mount();

                    }

                }
            )
            .catch(
                exception => {

                    reportError(
                        exception,
                        "Home Boot"
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
       34 — FINAL
       ======================================================== */

    HalDoOS.homeApp =
        api;

    window.HalDoHomeApp =
        api;

    log(
        "HalDo Home App 20 geladen."
    );


})(window, document);

/* ============================================================
   END — HALDO HOME / DESKTOP APP 20
   ============================================================ */