// ============================================================
// HALDO AI OS 20
// DESKTOP MANAGER
// Complete Desktop / Main Menu Coordination Layer
// ============================================================

(function (window, document) {

    "use strict";

    if (
        window.HalDoDesktopManager &&
        window.HalDoDesktopManager.__haldoOS20
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    // --------------------------------------------------------
    // CONFIG
    // --------------------------------------------------------

    const CONFIG = {

        name:
            "HalDo Desktop Manager",

        version:
            "20.0.0",

        mode:
            "Professional Ultimate",

        autoInitialize:
            true,

        menuAnimation:
            true,

        preventDuplicateApps:
            true,

        sortApps:
            true,

        rememberDesktopState:
            true,

        enableKeyboardNavigation:
            true,

        enableEvents:
            true

    };

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    const state = {

        initialized:
            false,

        ready:
            false,

        desktopVisible:
            true,

        menuOpen:
            false,

        settingsOpen:
            false,

        activeApp:
            null,

        selectedApp:
            null,

        apps:
            [],

        categories:
            [],

        errors:
            [],

        lastAction:
            null,

        lastUpdate:
            null,

        initializedAt:
            null

    };

    // --------------------------------------------------------
    // EVENTS
    // --------------------------------------------------------

    const listeners =
        new Map();

    function on(
        event,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {
            return () => {};
        }

        if (
            !listeners.has(event)
        ) {

            listeners.set(
                event,
                new Set()
            );

        }

        listeners
            .get(event)
            .add(callback);

        return () =>
            off(
                event,
                callback
            );

    }

    function off(
        event,
        callback
    ) {

        const set =
            listeners.get(event);

        if (!set) {
            return;
        }

        set.delete(
            callback
        );

        if (
            set.size ===
            0
        ) {

            listeners.delete(
                event
            );

        }

    }

    function emit(
        event,
        detail = {}
    ) {

        const set =
            listeners.get(event);

        if (set) {

            for (
                const callback of set
            ) {

                try {

                    callback(
                        detail
                    );

                } catch (error) {

                    console.error(
                        "[HalDoDesktopManager]",
                        error
                    );

                }

            }

        }

        if (
            CONFIG.enableEvents
        ) {

            try {

                document.dispatchEvent(
                    new CustomEvent(
                        `haldo:desktop:${event}`,
                        {
                            detail
                        }
                    )
                );

            } catch (error) {}

        }

    }

    // --------------------------------------------------------
    // UTILITIES
    // --------------------------------------------------------

    function clean(
        value
    ) {

        return String(
            value ?? ""
        ).trim();

    }

    function createId(
        prefix = "desktop"
    ) {

        return (
            prefix +
            "-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8)
        );

    }

    function normalizeApp(
        app
    ) {

        if (!app) {
            return null;
        }

        if (
            typeof app ===
            "string"
        ) {

            return {

                id:
                    app,

                name:
                    app,

                title:
                    app,

                category:
                    "other"

            };

        }

        if (
            typeof app !==
            "object"
        ) {

            return null;

        }

        const id =
            clean(
                app.id ||
                app.appId ||
                app.key ||
                app.name ||
                app.title
            );

        if (!id) {
            return null;
        }

        return {

            ...app,

            id,

            appId:
                app.appId ||
                id,

            name:
                app.name ||
                app.title ||
                id,

            title:
                app.title ||
                app.name ||
                id,

            category:
                clean(
                    app.category ||
                    app.group ||
                    "other"
                ) || "other"

        };

    }

    function uniqueApps(
        apps
    ) {

        const map =
            new Map();

        for (
            const item of apps
        ) {

            const app =
                normalizeApp(
                    item
                );

            if (!app) {
                continue;
            }

            const key =
                app.id.toLowerCase();

            if (
                CONFIG.preventDuplicateApps &&
                map.has(key)
            ) {

                const existing =
                    map.get(key);

                map.set(
                    key,
                    {
                        ...existing,
                        ...app
                    }
                );

            } else {

                map.set(
                    key,
                    app
                );

            }

        }

        return Array.from(
            map.values()
        );

    }

    function sortApps(
        apps
    ) {

        if (
            !CONFIG.sortApps
        ) {

            return apps;

        }

        return [
            ...apps
        ].sort(
            (a, b) => {

                const categoryA =
                    clean(
                        a.category
                    ).toLowerCase();

                const categoryB =
                    clean(
                        b.category
                    ).toLowerCase();

                if (
                    categoryA !==
                    categoryB
                ) {

                    return categoryA.localeCompare(
                        categoryB
                    );

                }

                return clean(
                    a.name
                ).localeCompare(
                    clean(
                        b.name
                    )
                );

            }
        );

    }

    // --------------------------------------------------------
    // MODULE ACCESS
    // --------------------------------------------------------

    function getKernel() {

        return (
            window.HalDoKernel ||
            window.HalDoOS?.kernel ||
            null
        );

    }

    function getSystem() {

        return (
            window.HalDoSystem ||
            window.HalDoOS?.system ||
            null
        );

    }

    function getAppManager() {

        return (
            window.HalDoAppManager ||
            window.HalDoOS?.appManager ||
            null
        );

    }

    function getAppRegistry() {

        return (
            window.HalDoAppRegistry ||
            window.HalDoOS?.appRegistry ||
            null
        );

    }

    function getAppLauncher() {

        return (
            window.HalDoAppLauncher ||
            window.HalDoOS?.appLauncher ||
            null
        );

    }

    function getLauncher() {

        return (
            window.HalDoLauncher ||
            window.HalDoOS?.launcher ||
            null
        );

    }

    function getRouter() {

        return (
            window.HalDoAppRouter ||
            window.HalDoOS?.appRouter ||
            null
        );

    }

    function getWindowManager() {

        return (
            window.HalDoWindowManager ||
            window.HalDoOS?.windowManager ||
            null
        );

    }

    // --------------------------------------------------------
    // APP DISCOVERY
    // --------------------------------------------------------

    function readAppsFromModule(
        module
    ) {

        if (!module) {
            return [];
        }

        const methods = [

            "getApps",
            "getAllApps",
            "listApps",
            "getRegisteredApps",
            "getAvailableApps"

        ];

        for (
            const method of methods
        ) {

            if (
                typeof module[method] !==
                "function"
            ) {
                continue;
            }

            try {

                const result =
                    module[method]();

                if (
                    Array.isArray(result)
                ) {

                    return result;

                }

            } catch (error) {

                recordError(
                    error
                );

            }

        }

        if (
            Array.isArray(
                module.apps
            )
        ) {

            return module.apps;

        }

        if (
            Array.isArray(
                module.registry
            )
        ) {

            return module.registry;

        }

        return [];

    }

    function discoverApps() {

        let apps = [];

        const registry =
            getAppRegistry();

        const manager =
            getAppManager();

        const launcher =
            getAppLauncher();

        const launcherLegacy =
            getLauncher();

        apps = apps.concat(
            readAppsFromModule(
                registry
            )
        );

        apps = apps.concat(
            readAppsFromModule(
                manager
            )
        );

        apps = apps.concat(
            readAppsFromModule(
                launcher
            )
        );

        apps = apps.concat(
            readAppsFromModule(
                launcherLegacy
            )
        );

        apps =
            uniqueApps(
                apps
            );

        apps =
            sortApps(
                apps
            );

        state.apps =
            apps;

        state.categories =
            getCategories(
                apps
            );

        state.lastUpdate =
            Date.now();

        emit(
            "apps-updated",
            {

                apps:
                    [...apps],

                categories:
                    [...state.categories]

            }
        );

        return [
            ...apps
        ];

    }

    function getCategories(
        apps = state.apps
    ) {

        const categories =
            new Set();

        for (
            const app of apps
        ) {

            if (
                app?.category
            ) {

                categories.add(
                    clean(
                        app.category
                    )
                );

            }

        }

        return Array.from(
            categories
        ).sort(
            (a, b) =>
                a.localeCompare(
                    b
                )
        );

    }

    function getApps(
        options = {}
    ) {

        let apps =
            [...state.apps];

        if (
            options.category
        ) {

            const category =
                clean(
                    options.category
                ).toLowerCase();

            apps =
                apps.filter(
                    app =>
                        clean(
                            app.category
                        ).toLowerCase() ===
                        category
                );

        }

        if (
            options.search
        ) {

            const query =
                clean(
                    options.search
                ).toLowerCase();

            apps =
                apps.filter(
                    app => {

                        return [

                            app.id,
                            app.name,
                            app.title,
                            app.description,
                            app.category

                        ]
                            .map(
                                value =>
                                    clean(
                                        value
                                    ).toLowerCase()
                            )
                            .some(
                                value =>
                                    value.includes(
                                        query
                                    )
                            );

                    }
                );

        }

        return apps;

    }

    // --------------------------------------------------------
    // APP STARTING
    // --------------------------------------------------------

    async function launchApp(
        appOrId,
        options = {}
    ) {

        const app =
            typeof appOrId ===
            "object"
                ? normalizeApp(
                    appOrId
                )
                : normalizeApp(
                    state.apps.find(
                        item =>
                            item.id ===
                            appOrId ||
                            item.appId ===
                            appOrId ||
                            item.name ===
                            appOrId
                    )
                );

        if (!app) {

            const error =
                new Error(
                    `App nicht gefunden: ${appOrId}`
                );

            recordError(
                error
            );

            emit(
                "app-launch-error",
                {
                    app:
                        appOrId,

                    error
                }
            );

            return {

                ok:
                    false,

                error:
                    error.message

            };

        }

        state.selectedApp =
            app;

        emit(
            "app-launch-start",
            {

                app,

                options

            }
        );

        const modules = [

            getAppLauncher(),
            getLauncher(),
            getAppManager(),
            getRouter()

        ];

        const methods = [

            "launch",
            "openApp",
            "startApp",
            "open",
            "navigate",
            "route"

        ];

        for (
            const module of modules
        ) {

            if (!module) {
                continue;
            }

            for (
                const method of methods
            ) {

                if (
                    typeof module[method] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await module[method](
                            app.id,
                            options
                        );

                    state.activeApp =
                        app;

                    state.lastAction = {

                        type:
                            "launch-app",

                        app:
                            app.id,

                        timestamp:
                            Date.now()

                    };

                    emit(
                        "app-launched",
                        {

                            app,

                            result

                        }
                    );

                    return {

                        ok:
                            result?.ok !==
                            false,

                        app,

                        result

                    };

                } catch (error) {

                    recordError(
                        error
                    );

                }

            }

        }

        /*
         * Fallback:
         * Wenn die App selbst eine URL/route besitzt,
         * kann der Router direkt verwendet werden.
         */

        const router =
            getRouter();

        if (
            router &&
            typeof router.navigate ===
            "function"
        ) {

            try {

                const route =
                    app.route ||
                    `/apps/${app.id}`;

                const result =
                    await router.navigate(
                        route,
                        options
                    );

                state.activeApp =
                    app;

                emit(
                    "app-launched",
                    {

                        app,

                        result

                    }
                );

                return {

                    ok:
                        true,

                    app,

                    result

                };

            } catch (error) {

                recordError(
                    error
                );

            }

        }

        return {

            ok:
                false,

            app,

            error:
                "APP_LAUNCHER_UNAVAILABLE"

        };

    }

    // --------------------------------------------------------
    // SETTINGS
    // --------------------------------------------------------

    async function openSettings(
        options = {}
    ) {

        state.settingsOpen =
            true;

        state.lastAction = {

            type:
                "open-settings",

            timestamp:
                Date.now()

        };

        emit(
            "settings-open",
            {
                options
            }
        );

        const settingsIds = [

            "settings",
            "haldo-settings",
            "system-settings"

        ];

        for (
            const id of settingsIds
        ) {

            const result =
                await launchApp(
                    id,
                    options
                );

            if (
                result.ok
            ) {

                return result;

            }

        }

        /*
         * Falls noch keine Settings-App registriert
         * wurde, kein falsches Fenster erzeugen.
         */

        return {

            ok:
                false,

            error:
                "SETTINGS_APP_NOT_AVAILABLE"

        };

    }

    function closeSettings() {

        state.settingsOpen =
            false;

        emit(
            "settings-close"
        );

        return {

            ok:
                true

        };

    }

    // --------------------------------------------------------
    // MAIN MENU
    // --------------------------------------------------------

    function openMenu(
        options = {}
    ) {

        if (
            state.menuOpen
        ) {

            emit(
                "menu-already-open"
            );

            return {

                ok:
                    true,

                open:
                    true

            };

        }

        state.menuOpen =
            true;

        state.lastAction = {

            type:
                "open-menu",

            timestamp:
                Date.now()

        };

        discoverApps();

        emit(
            "menu-open",
            {

                apps:
                    getApps(),

                categories:
                    getCategories(),

                options

            }
        );

        return {

            ok:
                true,

            open:
                true,

            apps:
                getApps(),

            categories:
                getCategories()

        };

    }

    function closeMenu() {

        if (
            !state.menuOpen
        ) {

            return {

                ok:
                    true,

                open:
                    false

            };

        }

        state.menuOpen =
            false;

        state.lastAction = {

            type:
                "close-menu",

            timestamp:
                Date.now()

        };

        emit(
            "menu-close"
        );

        return {

            ok:
                true,

            open:
                false

        };

    }

    function toggleMenu() {

        return state.menuOpen
            ? closeMenu()
            : openMenu();

    }

    // --------------------------------------------------------
    // DESKTOP
    // --------------------------------------------------------

    function showDesktop() {

        state.desktopVisible =
            true;

        emit(
            "desktop-show"
        );

        return {

            ok:
                true,

            visible:
                true

        };

    }

    function hideDesktop() {

        state.desktopVisible =
            false;

        emit(
            "desktop-hide"
        );

        return {

            ok:
                true,

            visible:
                false

        };

    }

    function toggleDesktop() {

        return state.desktopVisible
            ? hideDesktop()
            : showDesktop();

    }

    // --------------------------------------------------------
    // ACTIVE APP
    // --------------------------------------------------------

    function setActiveApp(
        app
    ) {

        const normalized =
            normalizeApp(
                app
            );

        state.activeApp =
            normalized;

        emit(
            "active-app-changed",
            {

                app:
                    normalized

            }
        );

        return normalized;

    }

    function getActiveApp() {

        return state.activeApp;

    }

    // --------------------------------------------------------
    // WINDOW MANAGEMENT
    // --------------------------------------------------------

    async function closeActiveApp() {

        const app =
            state.activeApp;

        if (!app) {

            return {

                ok:
                    false,

                error:
                    "NO_ACTIVE_APP"

            };

        }

        const manager =
            getWindowManager();

        if (manager) {

            const methods = [

                "close",
                "closeWindow",
                "closeApp",
                "destroy"

            ];

            for (
                const method of methods
            ) {

                if (
                    typeof manager[method] !==
                    "function"
                ) {
                    continue;
                }

                try {

                    const result =
                        await manager[method](
                            app.id
                        );

                    state.activeApp =
                        null;

                    emit(
                        "app-closed",
                        {

                            app,

                            result

                        }
                    );

                    return {

                        ok:
                            result?.ok !==
                            false,

                        result

                    };

                } catch (error) {

                    recordError(
                        error
                    );

                }

            }

        }

        state.activeApp =
            null;

        emit(
            "app-closed",
            {
                app
            }
        );

        return {

            ok:
                true

        };

    }

    // --------------------------------------------------------
    // KEYBOARD
    // --------------------------------------------------------

    function handleKeyboard(
        event
    ) {

        if (
            !CONFIG.enableKeyboardNavigation ||
            !event
        ) {

            return;

        }

        const key =
            event.key;

        /*
         * Escape:
         * Menü schließen.
         */

        if (
            key ===
            "Escape"
        ) {

            if (
                state.menuOpen
            ) {

                closeMenu();

            }

            return;

        }

        /*
         * Meta/Control + K:
         * Hauptmenü öffnen.
         */

        if (
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            key.toLowerCase() ===
            "k"
        ) {

            event.preventDefault();

            toggleMenu();

        }

    }

    // --------------------------------------------------------
    // SYSTEM EVENTS
    // --------------------------------------------------------

    function connectModuleEvents() {

        const modules = [

            getAppManager(),
            getAppLauncher(),
            getLauncher(),
            getRouter(),
            getWindowManager()

        ];

        for (
            const module of modules
        ) {

            if (
                !module ||
                typeof module.on !==
                "function"
            ) {
                continue;
            }

            try {

                module.on(
                    "app-opened",
                    detail => {

                        const app =
                            detail?.app ||
                            detail;

                        if (app) {

                            setActiveApp(
                                app
                            );

                        }

                    }
                );

                module.on(
                    "app-closed",
                    detail => {

                        if (
                            state.activeApp &&
                            detail?.app?.id ===
                            state.activeApp.id
                        ) {

                            state.activeApp =
                                null;

                        }

                    }
                );

                module.on(
                    "apps-changed",
                    () => {

                        discoverApps();

                    }
                );

                module.on(
                    "registered",
                    () => {

                        discoverApps();

                    }
                );

            } catch (error) {

                recordError(
                    error
                );

            }

        }

    }

    // --------------------------------------------------------
    // SYSTEM STATUS
    // --------------------------------------------------------

    function getStatus() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            mode:
                CONFIG.mode,

            initialized:
                state.initialized,

            ready:
                state.ready,

            desktopVisible:
                state.desktopVisible,

            menuOpen:
                state.menuOpen,

            settingsOpen:
                state.settingsOpen,

            activeApp:
                state.activeApp,

            selectedApp:
                state.selectedApp,

            appCount:
                state.apps.length,

            categories:
                [...state.categories],

            lastAction:
                state.lastAction,

            lastUpdate:
                state.lastUpdate,

            errors:
                state.errors.length

        };

    }

    // --------------------------------------------------------
    // ERROR HANDLING
    // --------------------------------------------------------

    function recordError(
        error
    ) {

        const entry = {

            id:
                createId(
                    "error"
                ),

            message:
                error?.message ||
                String(
                    error
                ),

            timestamp:
                Date.now()

        };

        state.errors.push(
            entry
        );

        if (
            state.errors.length >
            100
        ) {

            state.errors.shift();

        }

        emit(
            "error",
            entry
        );

        return entry;

    }

    // --------------------------------------------------------
    // REFRESH
    // --------------------------------------------------------

    function refresh() {

        const apps =
            discoverApps();

        emit(
            "refresh",
            {

                apps,

                status:
                    getStatus()

            }
        );

        return apps;

    }

    // --------------------------------------------------------
    // INITIALIZE
    // --------------------------------------------------------

    async function initialize() {

        if (
            state.initialized
        ) {

            return getStatus();

        }

        state.initialized =
            true;

        state.initializedAt =
            Date.now();

        try {

            connectModuleEvents();

            discoverApps();

            if (
                CONFIG.enableKeyboardNavigation
            ) {

                document.addEventListener(
                    "keydown",
                    handleKeyboard
                );

            }

            /*
             * Kernel registrieren.
             */

            const kernel =
                getKernel();

            if (
                kernel &&
                typeof kernel.registerModule ===
                "function"
            ) {

                try {

                    kernel.registerModule(
                        "desktop-manager",
                        api
                    );

                } catch (error) {

                    recordError(
                        error
                    );

                }

            }

            /*
             * System informieren.
             */

            const system =
                getSystem();

            if (
                system &&
                typeof system.registerService ===
                "function"
            ) {

                try {

                    system.registerService(
                        "desktop",
                        api
                    );

                } catch (error) {}

            }

            emit(
                "initialized",
                getStatus()
            );

            /*
             * Ready erst nach der Initialisierung
             * melden, damit andere Module Zeit haben,
             * ihre Registrierung abzuschließen.
             */

            window.setTimeout(
                () => {

                    state.ready =
                        true;

                    discoverApps();

                    emit(
                        "ready",
                        getStatus()
                    );

                },
                0
            );

        } catch (error) {

            recordError(
                error
            );

        }

        return getStatus();

    }

    // --------------------------------------------------------
    // DESTROY
    // --------------------------------------------------------

    function destroy() {

        try {

            document.removeEventListener(
                "keydown",
                handleKeyboard
            );

        } catch (error) {}

        listeners.clear();

        state.initialized =
            false;

        state.ready =
            false;

        state.menuOpen =
            false;

        state.settingsOpen =
            false;

        state.activeApp =
            null;

        state.selectedApp =
            null;

        emit(
            "destroyed"
        );

    }

    // --------------------------------------------------------
    // PUBLIC API
    // --------------------------------------------------------

    const api = {

        __haldoOS20:
            true,

        config:
            CONFIG,

        state,

        initialize,

        destroy,

        on,

        off,

        emit,

        refresh,

        discoverApps,

        getApps,

        getCategories,

        launchApp,

        openSettings,

        closeSettings,

        openMenu,

        closeMenu,

        toggleMenu,

        showDesktop,

        hideDesktop,

        toggleDesktop,

        setActiveApp,

        getActiveApp,

        closeActiveApp,

        getStatus,

        recordError

    };

    // --------------------------------------------------------
    // GLOBAL REGISTRATION
    // --------------------------------------------------------

    window.HalDoDesktopManager =
        api;

    window.HalDoOS.desktopManager =
        api;

    /*
     * Kompatibilitätsnamen.
     */

    window.HalDoDesktop =
        window.HalDoDesktop ||
        api;

    // --------------------------------------------------------
    // BOOT
    // --------------------------------------------------------

    async function boot() {

        try {

            await initialize();

        } catch (error) {

            recordError(
                error
            );

            console.error(
                "[HalDoDesktopManager] " +
                "Initialization failed:",
                error
            );

        }

    }

    if (
        CONFIG.autoInitialize
    ) {

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

    }

})(window, document);

// ============================================================
// END OF HALDO AI OS 20 DESKTOP MANAGER
// ============================================================