// ============================================================

// HalDo AI OS 18

// SOFTWARE UPDATE SYSTEM

// Version 18.0.0

// Professional Ultimate Foundation

//

// Datei:

// js/software-update.js

//

// Zweck:

// - Software-Version verwalten

// - Update-System zentral bereitstellen

// - Update-Prüfungen durchführen

// - Update-Historie speichern

// - Update-Status an Kernel/System/AI melden

// - zukünftige echte Update-Server vorbereiten

// - Offline-Betrieb unterstützen

// - Events bereitstellen

// - Diagnose ermöglichen

// ============================================================

(function (window, document) {

    "use strict";

    // ========================================================

    // KONFIGURATION

    // ========================================================

    const CONFIG = {

        name: "HalDo AI OS",

        version: "18.0.0",

        edition:

            "Professional Ultimate Foundation",

        build:

            "180000",

        channel:

            "stable",

        environment:

            "production",

        updateCheckInterval:

            6 * 60 * 60 * 1000,

        storageKey:

            "haldo_os18_software_update",

        historyLimit:

            50,

        // ----------------------------------------------------

        // Später kann hier ein echter Update-Server

        // eingetragen werden.

        // ----------------------------------------------------

        updateServer:

            null,

        manifestPath:

            "update-manifest.json",

        requestTimeout:

            8000

    };

    // ========================================================

    // GLOBAL HALDO OBJECT

    // ========================================================

    window.HalDoOS =

        window.HalDoOS || {};

    // ========================================================

    // INTERNAL STATE

    // ========================================================

    const state = {

        initialized:

            false,

        checking:

            false,

        installing:

            false,

        available:

            false,

        currentVersion:

            CONFIG.version,

        latestVersion:

            CONFIG.version,

        lastCheck:

            null,

        lastResult:

            "not_checked",

        lastError:

            null,

        history:

            [],

        listeners:

            {},

        timer:

            null

    };

    // ========================================================

    // EVENT SYSTEM

    // ========================================================

    function on(eventName, callback) {

        if (

            typeof callback !==

            "function"

        ) {

            return function () {};

        }

        if (

            !state.listeners[eventName]

        ) {

            state.listeners[eventName] =

                [];

        }

        state.listeners[eventName]

            .push(callback);

        return function () {

            off(

                eventName,

                callback

            );

        };

    }

    function off(eventName, callback) {

        const listeners =

            state.listeners[eventName];

        if (!listeners) {

            return;

        }

        state.listeners[eventName] =

            listeners.filter(

                function (listener) {

                    return listener !==

                        callback;

                }

            );

    }

    function emit(eventName, data) {

        const listeners =

            state.listeners[eventName];

        if (!listeners) {

            return;

        }

        listeners.slice().forEach(

            function (listener) {

                try {

                    listener(data);

                } catch (error) {

                    console.error(

                        "[HalDo Update] Event error:",

                        error

                    );

                }

            }

        );

    }

    // ========================================================

    // LOGGING

    // ========================================================

    function log() {

        const args =

            Array.from(arguments);

        console.log(

            "[HalDo Software Update]",

            ...args

        );

    }

    function warn() {

        const args =

            Array.from(arguments);

        console.warn(

            "[HalDo Software Update]",

            ...args

        );

    }

    function errorLog() {

        const args =

            Array.from(arguments);

        console.error(

            "[HalDo Software Update]",

            ...args

        );

    }

    // ========================================================

    // VERSION PARSER

    // ========================================================

    function parseVersion(version) {

        if (

            typeof version !==

            "string"

        ) {

            return [0, 0, 0];

        }

        const clean =

            version

                .trim()

                .replace(/^v/i, "")

                .split("-")[0];

        const parts =

            clean

                .split(".")

                .map(

                    function (value) {

                        const number =

                            parseInt(

                                value,

                                10

                            );

                        return Number.isFinite(

                            number

                        )

                            ? number

                            : 0;

                    }

                );

        while (

            parts.length < 3

        ) {

            parts.push(0);

        }

        return parts.slice(0, 3);

    }

    // ========================================================

    // VERSION COMPARISON

    // ========================================================

    function compareVersions(

        versionA,

        versionB

    ) {

        const a =

            parseVersion(versionA);

        const b =

            parseVersion(versionB);

        for (

            let i = 0;

            i < 3;

            i++

        ) {

            if (a[i] > b[i]) {

                return 1;

            }

            if (a[i] < b[i]) {

                return -1;

            }

        }

        return 0;

    }

    function isNewerVersion(

        candidate,

        current

    ) {

        return (

            compareVersions(

                candidate,

                current

            ) > 0

        );

    }

    // ========================================================

    // STORAGE

    // ========================================================

    function getStorageData() {

        try {

            const raw =

                localStorage.getItem(

                    CONFIG.storageKey

                );

            if (!raw) {

                return {

                    history: [],

                    lastCheck: null,

                    lastResult:

                        "not_checked",

                    latestVersion:

                        CONFIG.version

                };

            }

            const parsed =

                JSON.parse(raw);

            return {

                history:

                    Array.isArray(

                        parsed.history

                    )

                        ? parsed.history

                        : [],

                lastCheck:

                    parsed.lastCheck ||

                    null,

                lastResult:

                    parsed.lastResult ||

                    "not_checked",

                latestVersion:

                    parsed.latestVersion ||

                    CONFIG.version

            };

        } catch (storageError) {

            warn(

                "Storage konnte nicht gelesen werden.",

                storageError

            );

            return {

                history: [],

                lastCheck: null,

                lastResult:

                    "storage_error",

                latestVersion:

                    CONFIG.version

            };

        }

    }

    function saveStorageData() {

        try {

            localStorage.setItem(

                CONFIG.storageKey,

                JSON.stringify({

                    history:

                        state.history

                            .slice(

                                0,

                                CONFIG.historyLimit

                            ),

                    lastCheck:

                        state.lastCheck,

                    lastResult:

                        state.lastResult,

                    latestVersion:

                        state.latestVersion

                })

            );

        } catch (storageError) {

            warn(

                "Update-Daten konnten nicht gespeichert werden.",

                storageError

            );

        }

    }

    function loadStorageData() {

        const data =

            getStorageData();

        state.history =

            data.history;

        state.lastCheck =

            data.lastCheck;

        state.lastResult =

            data.lastResult;

        state.latestVersion =

            data.latestVersion ||

            CONFIG.version;

        state.available =

            isNewerVersion(

                state.latestVersion,

                state.currentVersion

            );

    }

    // ========================================================

    // HISTORY

    // ========================================================

    function addHistory(

        type,

        data

    ) {

        const entry = {

            id:

                "update-" +

                Date.now() +

                "-" +

                Math.random()

                    .toString(36)

                    .slice(2, 8),

            type:

                type,

            timestamp:

                new Date().toISOString(),

            version:

                state.currentVersion,

            data:

                data || {}

        };

        state.history.unshift(

            entry

        );

        if (

            state.history.length >

            CONFIG.historyLimit

        ) {

            state.history =

                state.history.slice(

                    0,

                    CONFIG.historyLimit

                );

        }

        saveStorageData();

        emit(

            "history",

            entry

        );

    }

    // ========================================================

    // UPDATE MANIFEST

    // ========================================================

    function getLocalManifest() {

        return {

            name:

                CONFIG.name,

            version:

                CONFIG.version,

            edition:

                CONFIG.edition,

            build:

                CONFIG.build,

            channel:

                CONFIG.channel,

            environment:

                CONFIG.environment,

            updateAvailable:

                false,

            modules: [

                "kernel",

                "system",

                "app-manager",

                "app-router",

                "app-registry",

                "launcher",

                "ai-core",

                "ai-engine",

                "ai-chat",

                "ai-language",

                "ai-memory",

                "ai-speech",

                "ai-voice",

                "voice",

                "ezidi-keyboard",

                "language-manager",

                "language-system",

                "storage",

                "storage-manager",

                "config-manager",

                "window-manager",

                "module-manager",

                "shell-manager",

                "system-status",

                "system-loader",

                "startup",

                "boot",

                "logo-animation-manager",

                "logo-intro-manager",

                "haldo-light-system",

                "software-update"

            ],

            timestamp:

                new Date().toISOString()

        };

    }

    // ========================================================

    // REQUEST WITH TIMEOUT

    // ========================================================

    async function fetchWithTimeout(

        url,

        options

    ) {

        const controller =

            typeof AbortController !==

            "undefined"

                ? new AbortController()

                : null;

        let timeoutId =

            null;

        if (controller) {

            timeoutId =

                window.setTimeout(

                    function () {

                        controller.abort();

                    },

                    CONFIG.requestTimeout

                );

        }

        try {

            const finalOptions =

                Object.assign(

                    {},

                    options || {}

                );

            if (controller) {

                finalOptions.signal =

                    controller.signal;

            }

            return await fetch(

                url,

                finalOptions

            );

        } finally {

            if (timeoutId) {

                clearTimeout(

                    timeoutId

                );

            }

        }

    }

    // ========================================================

    // EXTERNAL MANIFEST

    // ========================================================

    async function fetchRemoteManifest() {

        let url =

            CONFIG.updateServer;

        if (!url) {

            url =

                CONFIG.manifestPath;

        }

        try {

            const response =

                await fetchWithTimeout(

                    url,

                    {

                        method:

                            "GET",

                        cache:

                            "no-store",

                        headers: {

                            "Accept":

                                "application/json"

                        }

                    }

                );

            if (!response.ok) {

                throw new Error(

                    "HTTP " +

                    response.status

                );

            }

            const manifest =

                await response.json();

            return manifest;

        } catch (requestError) {

            throw requestError;

        }

    }

    // ========================================================

    // VALIDATE MANIFEST

    // ========================================================

    function validateManifest(

        manifest

    ) {

        if (

            !manifest ||

            typeof manifest !==

                "object"

        ) {

            return false;

        }

        if (

            typeof manifest.version !==

            "string"

        ) {

            return false;

        }

        if (

            !/^\d+\.\d+\.\d+/.test(

                manifest.version

            )

        ) {

            return false;

        }

        return true;

    }

    // ========================================================

    // CHECK UPDATE

    // ========================================================

    async function check(options) {

        if (state.checking) {

            return {

                success:

                    false,

                status:

                    "already_checking",

                version:

                    state.currentVersion

            };

        }

        state.checking =

            true;

        state.lastError =

            null;

        emit(

            "check:start",

            {

                version:

                    state.currentVersion

            }

        );

        let remoteManifest =

            null;

        let source =

            "local";

        try {

            // ------------------------------------------------

            // Falls ein Update-Server vorhanden ist:

            // echten Manifest abrufen.

            // ------------------------------------------------

            if (

                CONFIG.updateServer ||

                (

                    options &&

                    options.manifestUrl

                )

            ) {

                const original =

                    CONFIG.updateServer;

                if (

                    options &&

                    options.manifestUrl

                ) {

                    CONFIG.updateServer =

                        options.manifestUrl;

                }

                try {

                    remoteManifest =

                        await fetchRemoteManifest();

                    source =

                        "remote";

                } finally {

                    CONFIG.updateServer =

                        original;

                }

            }

            // ------------------------------------------------

            // Lokale Foundation

            // ------------------------------------------------

            if (

                !remoteManifest

            ) {

                remoteManifest =

                    getLocalManifest();

                source =

                    "local";

            }

            if (

                !validateManifest(

                    remoteManifest

                )

            ) {

                throw new Error(

                    "Ungültiges Update-Manifest."

                );

            }

            state.lastCheck =

                new Date().toISOString();

            state.latestVersion =

                remoteManifest.version;

            state.available =

                isNewerVersion(

                    remoteManifest.version,

                    state.currentVersion

                );

            state.lastResult =

                state.available

                    ? "update_available"

                    : "current";

            saveStorageData();

            const result = {

                success:

                    true,

                status:

                    state.lastResult,

                currentVersion:

                    state.currentVersion,

                latestVersion:

                    state.latestVersion,

                available:

                    state.available,

                source:

                    source,

                manifest:

                    remoteManifest

            };

            addHistory(

                "check",

                {

                    status:

                        result.status,

                    source:

                        source,

                    currentVersion:

                        result.currentVersion,

                    latestVersion:

                        result.latestVersion

                }

            );

            emit(

                "check:complete",

                result

            );

            if (

                state.available

            ) {

                emit(

                    "update:available",

                    result

                );

            } else {

                emit(

                    "update:current",

                    result

                );

            }

            return result;

        } catch (checkError) {

            state.lastError =

                checkError;

            state.lastCheck =

                new Date().toISOString();

            state.lastResult =

                "check_error";

            saveStorageData();

            const result = {

                success:

                    false,

                status:

                    "check_error",

                currentVersion:

                    state.currentVersion,

                latestVersion:

                    state.currentVersion,

                available:

                    false,

                source:

                    source,

                error:

                    checkError.message ||

                    String(checkError)

            };

            addHistory(

                "check_error",

                {

                    error:

                        result.error

                }

            );

            emit(

                "check:error",

                result

            );

            warn(

                "Update-Prüfung fehlgeschlagen:",

                checkError

            );

            return result;

        } finally {

            state.checking =

                false;

        }

    }

    // ========================================================

    // INSTALL UPDATE FOUNDATION

    // ========================================================

    async function install(update) {

        if (state.installing) {

            return {

                success:

                    false,

                status:

                    "already_installing"

            };

        }

        if (

            !update ||

            typeof update !==

                "object"

        ) {

            return {

                success:

                    false,

                status:

                    "invalid_update"

            };

        }

        const targetVersion =

            update.version ||

            state.latestVersion;

        if (

            !isNewerVersion(

                targetVersion,

                state.currentVersion

            )

        ) {

            return {

                success:

                    false,

                status:

                    "no_newer_version",

                version:

                    state.currentVersion

            };

        }

        state.installing =

            true;

        emit(

            "install:start",

            {

                version:

                    targetVersion

            }

        );

        try {

            // ------------------------------------------------

            // Sicherheitsprüfung

            // ------------------------------------------------

            if (

                !validateManifest(

                    update

                )

            ) {

                throw new Error(

                    "Update-Manifest ist ungültig."

                );

            }

            // ------------------------------------------------

            // Diese Foundation führt absichtlich

            // KEIN blindes Überschreiben von Dateien aus.

            //

            // Für echte Updates wird später ein dediziertes

            // Update-Paket / Service angeschlossen.

            // ------------------------------------------------

            const result = {

                success:

                    true,

                status:

                    "prepared",

                currentVersion:

                    state.currentVersion,

                targetVersion:

                    targetVersion,

                message:

                    "Update-Paket wurde geprüft und für die Installation vorbereitet.",

                manifest:

                    update

            };

            addHistory(

                "install_prepared",

                {

                    targetVersion:

                        targetVersion

                }

            );

            emit(

                "install:prepared",

                result

            );

            return result;

        } catch (installError) {

            const result = {

                success:

                    false,

                status:

                    "install_error",

                error:

                    installError.message ||

                    String(installError)

            };

            addHistory(

                "install_error",

                {

                    error:

                        result.error

                }

            );

            emit(

                "install:error",

                result

            );

            return result;

        } finally {

            state.installing =

                false;

        }

    }

    // ========================================================

    // UPDATE STATUS

    // ========================================================

    function getStatus() {

        return {

            name:

                CONFIG.name,

            version:

                state.currentVersion,

            latestVersion:

                state.latestVersion,

            edition:

                CONFIG.edition,

            build:

                CONFIG.build,

            channel:

                CONFIG.channel,

            environment:

                CONFIG.environment,

            checking:

                state.checking,

            installing:

                state.installing,

            available:

                state.available,

            lastCheck:

                state.lastCheck,

            lastResult:

                state.lastResult,

            lastError:

                state.lastError

                    ? (

                        state.lastError.message ||

                        String(state.lastError)

                    )

                    : null

        };

    }

    // ========================================================

    // VERSION API

    // ========================================================

    function getVersion() {

        return state.currentVersion;

    }

    function getLatestVersion() {

        return state.latestVersion;

    }

    // ========================================================

    // HISTORY API

    // ========================================================

    function getHistory() {

        return state.history.map(

            function (entry) {

                return Object.assign(

                    {},

                    entry

                );

            }

        );

    }

    function clearHistory() {

        state.history =

            [];

        saveStorageData();

        emit(

            "history:cleared"

        );

    }

    // ========================================================

    // MODULE REGISTRATION

    // ========================================================

    function registerWithKernel() {

        const kernel =

            window.HalDoKernel ||

            (

                window.HalDoOS &&

                window.HalDoOS.kernel

            );

        if (!kernel) {

            return false;

        }

        try {

            if (

                typeof kernel.registerModule ===

                "function"

            ) {

                kernel.registerModule(

                    "software-update",

                    api

                );

            }

            if (

                typeof kernel.setModuleReady ===

                "function"

            ) {

                kernel.setModuleReady(

                    "software-update"

                );

            }

            return true;

        } catch (kernelError) {

            warn(

                "Kernel-Verbindung konnte nicht hergestellt werden.",

                kernelError

            );

            return false;

        }

    }

    // ========================================================

    // SYSTEM REGISTRATION

    // ========================================================

    function registerWithSystem() {

        const system =

            window.HalDoSystem ||

            (

                window.HalDoOS &&

                window.HalDoOS.system

            );

        if (!system) {

            return false;

        }

        try {

            if (

                typeof system.registerService ===

                "function"

            ) {

                system.registerService(

                    "software-update",

                    api

                );

            }

            return true;

        } catch (systemError) {

            warn(

                "System-Verbindung konnte nicht hergestellt werden.",

                systemError

            );

            return false;

        }

    }

    // ========================================================

    // GLOBAL HALDO EVENTS

    // ========================================================

    function connectGlobalEvents() {

        const globalEvents =

            window.HalDoOS &&

            window.HalDoOS.events;

        if (

            !globalEvents ||

            typeof globalEvents.on !==

                "function"

        ) {

            return;

        }

        globalEvents.on(

            "kernel:ready",

            function () {

                registerWithKernel();

            }

        );

        globalEvents.on(

            "system:ready",

            function () {

                registerWithSystem();

            }

        );

    }

    // ========================================================

    // AUTO CHECK

    // ========================================================

    function startAutoCheck() {

        stopAutoCheck();

        if (

            !CONFIG.updateCheckInterval

        ) {

            return;

        }

        state.timer =

            window.setInterval(

                function () {

                    check();

                },

                CONFIG.updateCheckInterval

            );

    }

    function stopAutoCheck() {

        if (state.timer) {

            window.clearInterval(

                state.timer

            );

            state.timer =

                null;

        }

    }

    // ========================================================

    // INITIALIZATION

    // ========================================================

    function init() {

        if (

            state.initialized

        ) {

            return api;

        }

        loadStorageData();

        connectGlobalEvents();

        registerWithKernel();

        registerWithSystem();

        startAutoCheck();

        state.initialized =

            true;

        emit(

            "ready",

            getStatus()

        );

        log(

            "Software Update System bereit.",

            getStatus()

        );

        return api;

    }

    // ========================================================

    // SHUTDOWN

    // ========================================================

    function destroy() {

        stopAutoCheck();

        state.initialized =

            false;

        emit(

            "destroy"

        );

    }

    // ========================================================

    // PUBLIC API

    // ========================================================

    const api = {

        // ----------------------------------------------------

        // Core

        // ----------------------------------------------------

        name:

            CONFIG.name,

        version:

            CONFIG.version,

        edition:

            CONFIG.edition,

        build:

            CONFIG.build,

        init:

            init,

        destroy:

            destroy,

        // ----------------------------------------------------

        // Update

        // ----------------------------------------------------

        check:

            check,

        install:

            install,

        // ----------------------------------------------------

        // Status

        // ----------------------------------------------------

        getStatus:

            getStatus,

        getVersion:

            getVersion,

        getLatestVersion:

            getLatestVersion,

        // ----------------------------------------------------

        // Version

        // ----------------------------------------------------

        compareVersions:

            compareVersions,

        isNewerVersion:

            isNewerVersion,

        // ----------------------------------------------------

        // History

        // ----------------------------------------------------

        getHistory:

            getHistory,

        clearHistory:

            clearHistory,

        // ----------------------------------------------------

        // Events

        // ----------------------------------------------------

        on:

            on,

        off:

            off,

        emit:

            emit,

        // ----------------------------------------------------

        // Configuration

        // ----------------------------------------------------

        getConfig:

            function () {

                return Object.assign(

                    {},

                    CONFIG

                );

            },

        setUpdateServer:

            function (url) {

                if (

                    url === null ||

                    url === ""

                ) {

                    CONFIG.updateServer =

                        null;

                    return true;

                }

                if (

                    typeof url !==

                    "string"

                ) {

                    return false;

                }

                CONFIG.updateServer =

                    url;

                return true;

            }

    };

    // ========================================================

    // GLOBAL EXPORTS

    // ========================================================

    window.HalDoSoftwareUpdate =

        api;

    window.HalDoOS.softwareUpdate =

        api;

    // ========================================================

    // LEGACY / EASY ACCESS

    // ========================================================

    window.HalDoOS.update =

        api;

    window.HalDoOS.checkForUpdates =

        function () {

            return api.check();

        };

    // ========================================================

    // START

    // ========================================================

    if (

        document.readyState ===

        "loading"

    ) {

        document.addEventListener(

            "DOMContentLoaded",

            function () {

                init();

            },

            {

                once: true

            }

        );

    } else {

        init();

    }

})(window, document);