// ============================================================
// HALDO AI OS 18
// SOFTWARE UPDATE SYSTEM
// Version 18.0.0
// Professional Ultimate Foundation
//
// Datei:
// js/software-update.js
//
// Aufgabe:
// Zentrales Software-, System-, Modul- und App-Update-System.
//
// Dieses Modul:
// - verwaltet die installierte OS-Version
// - verwaltet Komponenten-Versionen
// - prüft Update-Zustände
// - speichert Update-Historie
// - verwaltet Update-Status
// - führt Systemprüfungen durch
// - erkennt vorhandene HalDo-Module
// - stellt globale Update-APIs bereit
// - verbindet sich mit HalDoOS.events
// - ist für spätere echte Online-Updates vorbereitet
//
// WICHTIG:
// Dieses Modul ersetzt NICHT Kernel, System, App Manager,
// App Registry, App Router oder System Loader.
// ============================================================

(function (window, document) {

    "use strict";

    // ========================================================
    // BASISKONFIGURATION
    // ========================================================

    const CONFIG = {

        name: "HalDo Software Update System",

        version: "18.0.0",

        systemVersion: "18.0.0",

        edition:
            "Professional Ultimate Foundation",

        storageKey:
            "haldo_os18_software_update",

        historyLimit: 50,

        updateEndpoint: null,

        checkTimeout: 8000,

        autoCheck: false,

        autoCheckInterval:
            1000 * 60 * 60 * 24,

        developmentMode: true

    };


    // ========================================================
    // GLOBALE HALDO-OBJEKTE
    // ========================================================

    window.HalDoOS =
        window.HalDoOS || {};


    // ========================================================
    // EVENT SYSTEM VERBINDUNG
    // ========================================================

    function getEventSystem() {

        if (
            window.HalDoOS &&
            window.HalDoOS.events
        ) {

            return window.HalDoOS.events;

        }

        return null;

    }


    function emit(eventName, data) {

        const events =
            getEventSystem();

        if (
            events &&
            typeof events.emit === "function"
        ) {

            try {

                events.emit(
                    eventName,
                    data
                );

            } catch (error) {

                console.warn(
                    "[HalDo Update] Event konnte nicht gesendet werden:",
                    eventName,
                    error
                );

            }

        }

        // Zusätzlich eigenes DOM Event
        try {

            document.dispatchEvent(
                new CustomEvent(
                    "haldo:" + eventName,
                    {
                        detail: data
                    }
                )
            );

        } catch (error) {

            // Kein kritischer Fehler.
        }

    }


    // ========================================================
    // INTERNE STATES
    // ========================================================

    const STATUS = {

        IDLE:
            "idle",

        CHECKING:
            "checking",

        CURRENT:
            "current",

        AVAILABLE:
            "available",

        DOWNLOADING:
            "downloading",

        INSTALLING:
            "installing",

        COMPLETED:
            "completed",

        ERROR:
            "error"

    };


    let currentStatus =
        STATUS.IDLE;


    let lastCheck =
        null;


    let availableUpdate =
        null;


    let checkInProgress =
        false;


    // ========================================================
    // KOMPONENTEN
    // ========================================================

    const COMPONENT_DEFINITIONS = [

        {
            id: "operating-system",
            name: "HalDo AI OS",
            type: "system",
            version: "18.0.0",
            required: true
        },

        {
            id: "kernel",
            name: "HalDo Kernel",
            type: "core",
            version: "18.0.0",
            required: true
        },

        {
            id: "system",
            name: "HalDo System",
            type: "core",
            version: "18.0.0",
            required: true
        },

        {
            id: "ai-core",
            name: "HalDo AI Core",
            type: "ai",
            version: "18.0.0",
            required: true
        },

        {
            id: "ai-engine",
            name: "HalDo AI Engine",
            type: "ai",
            version: "18.0.0",
            required: true
        },

        {
            id: "ai-chat",
            name: "HalDo AI Chat",
            type: "ai",
            version: "18.0.0",
            required: true
        },

        {
            id: "ai-memory",
            name: "HalDo AI Memory",
            type: "ai",
            version: "18.0.0",
            required: true
        },

        {
            id: "ai-language",
            name: "HalDo AI Language",
            type: "language",
            version: "18.0.0",
            required: false
        },

        {
            id: "ai-speech",
            name: "HalDo AI Speech",
            type: "voice",
            version: "18.0.0",
            required: false
        },

        {
            id: "ai-voice",
            name: "HalDo AI Voice",
            type: "voice",
            version: "18.0.0",
            required: false
        },

        {
            id: "voice",
            name: "HalDo Voice",
            type: "voice",
            version: "18.0.0",
            required: false
        },

        {
            id: "ezidi-keyboard",
            name: "Êzîdî Keyboard",
            type: "input",
            version: "18.0.0",
            required: false
        },

        {
            id: "language-manager",
            name: "Language Manager",
            type: "language",
            version: "18.0.0",
            required: false
        },

        {
            id: "language-system",
            name: "Language System",
            type: "language",
            version: "18.0.0",
            required: false
        },

        {
            id: "storage",
            name: "HalDo Storage",
            type: "storage",
            version: "18.0.0",
            required: true
        },

        {
            id: "storage-manager",
            name: "Storage Manager",
            type: "storage",
            version: "18.0.0",
            required: false
        },

        {
            id: "window-manager",
            name: "Window Manager",
            type: "interface",
            version: "18.0.0",
            required: false
        },

        {
            id: "app-system",
            name: "HalDo App System",
            type: "apps",
            version: "18.0.0",
            required: true
        },

        {
            id: "app-manager",
            name: "App Manager",
            type: "apps",
            version: "18.0.0",
            required: true
        },

        {
            id: "app-registry",
            name: "App Registry",
            type: "apps",
            version: "18.0.0",
            required: true
        },

        {
            id: "app-router",
            name: "App Router",
            type: "apps",
            version: "18.0.0",
            required: true
        },

        {
            id: "app-launcher",
            name: "App Launcher",
            type: "apps",
            version: "18.0.0",
            required: false
        },

        {
            id: "launcher",
            name: "HalDo Launcher",
            type: "interface",
            version: "18.0.0",
            required: false
        },

        {
            id: "dashboard",
            name: "HalDo Dashboard",
            type: "app",
            version: "18.0.0",
            required: false
        },

        {
            id: "settings",
            name: "HalDo Settings",
            type: "app",
            version: "18.0.0",
            required: false
        },

        {
            id: "diagnostics",
            name: "HalDo Diagnostics",
            type: "system",
            version: "18.0.0",
            required: false
        }

    ];


    // ========================================================
    // UPDATE-DATEN
    // ========================================================

    function createDefaultState() {

        return {

            schemaVersion:
                1,

            installedVersion:
                CONFIG.systemVersion,

            installedEdition:
                CONFIG.edition,

            status:
                STATUS.IDLE,

            lastCheck:
                null,

            lastSuccessfulCheck:
                null,

            lastUpdate:
                null,

            updateAvailable:
                false,

            availableVersion:
                null,

            updateHistory:
                [],

            components:
                COMPONENT_DEFINITIONS.map(
                    function (component) {

                        return {
                            id:
                                component.id,

                            name:
                                component.name,

                            type:
                                component.type,

                            version:
                                component.version,

                            required:
                                component.required,

                            state:
                                "installed"
                        };

                    }
                )

        };

    }


    // ========================================================
    // STORAGE LADEN
    // ========================================================

    function loadState() {

        try {

            const raw =
                localStorage.getItem(
                    CONFIG.storageKey
                );

            if (!raw) {

                return createDefaultState();

            }

            const parsed =
                JSON.parse(raw);

            if (
                !parsed ||
                typeof parsed !== "object"
            ) {

                return createDefaultState();

            }

            const defaults =
                createDefaultState();

            return Object.assign(
                defaults,
                parsed
            );

        } catch (error) {

            console.warn(
                "[HalDo Update] Storage konnte nicht geladen werden.",
                error
            );

            return createDefaultState();

        }

    }


    let state =
        loadState();


    // ========================================================
    // STORAGE SPEICHERN
    // ========================================================

    function saveState() {

        try {

            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(state)
            );

            return true;

        } catch (error) {

            console.warn(
                "[HalDo Update] Storage konnte nicht gespeichert werden.",
                error
            );

            return false;

        }

    }


    // ========================================================
    // VERSION VERGLEICH
    // ========================================================

    function parseVersion(version) {

        if (
            typeof version !== "string"
        ) {

            return [0, 0, 0];

        }

        return version
            .replace(/^v/i, "")
            .split(".")
            .map(
                function (part) {

                    const value =
                        parseInt(
                            part,
                            10
                        );

                    return Number.isFinite(value)
                        ? value
                        : 0;

                }
            )
            .concat([0, 0, 0])
            .slice(0, 3);

    }


    function compareVersions(
        first,
        second
    ) {

        const a =
            parseVersion(first);

        const b =
            parseVersion(second);

        for (
            let index = 0;
            index < 3;
            index++
        ) {

            if (
                a[index] >
                b[index]
            ) {

                return 1;

            }

            if (
                a[index] <
                b[index]
            ) {

                return -1;

            }

        }

        return 0;

    }


    // ========================================================
    // KOMPONENTEN ERKENNEN
    // ========================================================

    function detectRuntimeComponents() {

        const runtime =
            [];

        const checks = [

            {
                id: "kernel",
                name: "HalDo Kernel",
                object:
                    window.HalDoKernel
            },

            {
                id: "system",
                name: "HalDo System",
                object:
                    window.HalDoSystem
            },

            {
                id: "ai-core",
                name: "HalDo AI Core",
                object:
                    window.HalDoAICore
            },

            {
                id: "ai-engine",
                name: "HalDo AI Engine",
                object:
                    window.HalDoAIEngine
            },

            {
                id: "ai-chat",
                name: "HalDo AI Chat",
                object:
                    window.HalDoAIChat
            },

            {
                id: "ai-memory",
                name: "HalDo AI Memory",
                object:
                    window.HalDoAIMemory
            },

            {
                id: "app-manager",
                name: "App Manager",
                object:
                    window.HalDoAppManager
            },

            {
                id: "app-registry",
                name: "App Registry",
                object:
                    window.HalDoAppRegistry
            },

            {
                id: "app-router",
                name: "App Router",
                object:
                    window.HalDoAppRouter
            },

            {
                id: "window-manager",
                name: "Window Manager",
                object:
                    window.HalDoWindowManager
            },

            {
                id: "storage",
                name: "HalDo Storage",
                object:
                    window.HalDoStorage
            }

        ];


        checks.forEach(
            function (item) {

                if (item.object) {

                    runtime.push({

                        id:
                            item.id,

                        name:
                            item.name,

                        connected:
                            true,

                        state:
                            "connected"

                    });

                }

            }
        );


        return runtime;

    }


    // ========================================================
    // STATUS SETZEN
    // ========================================================

    function setStatus(
        status
    ) {

        currentStatus =
            status;

        state.status =
            status;

        saveState();

        emit(
            "software:update-status",
            {
                status:
                    status,

                version:
                    state.installedVersion,

                availableVersion:
                    state.availableVersion
            }
        );

    }


    // ========================================================
    // UPDATE STATUS ABFRAGEN
    // ========================================================

    function getStatus() {

        return {

            status:
                currentStatus,

            installedVersion:
                state.installedVersion,

            installedEdition:
                state.installedEdition,

            updateAvailable:
                Boolean(
                    state.updateAvailable
                ),

            availableVersion:
                state.availableVersion,

            lastCheck:
                state.lastCheck,

            lastUpdate:
                state.lastUpdate,

            lastSuccessfulCheck:
                state.lastSuccessfulCheck

        };

    }


    // ========================================================
    // LOKALE SYSTEMPRÜFUNG
    // ========================================================

    function runLocalSystemCheck() {

        const results =
            [];

        function check(
            name,
            condition,
            details
        ) {

            results.push({

                name:
                    name,

                passed:
                    Boolean(condition),

                details:
                    details || ""

            });

        }


        check(
            "Browser DOM",
            Boolean(document),
            "DOM verfügbar"
        );


        check(
            "Local Storage",
            testStorage(),
            "Lokaler Speicher"
        );


        check(
            "HalDoOS",
            Boolean(window.HalDoOS),
            "HalDoOS API"
        );


        check(
            "Online Status",
            navigator.onLine !== false,
            navigator.onLine
                ? "Online"
                : "Offline"
        );


        check(
            "Software Update API",
            true,
            "Update-System aktiv"
        );


        const runtime =
            detectRuntimeComponents();


        runtime.forEach(
            function (component) {

                check(
                    component.name,
                    component.connected,
                    component.state
                );

            }
        );


        const passed =
            results.filter(
                function (item) {
                    return item.passed;
                }
            ).length;


        return {

            success:
                results.every(
                    function (item) {
                        return item.passed;
                    }
                ),

            total:
                results.length,

            passed:
                passed,

            failed:
                results.length -
                passed,

            results:
                results,

            runtimeComponents:
                runtime

        };

    }


    // ========================================================
    // STORAGE TEST
    // ========================================================

    function testStorage() {

        try {

            const key =
                "__haldo_update_test__";

            localStorage.setItem(
                key,
                "ok"
            );

            const value =
                localStorage.getItem(
                    key
                );

            localStorage.removeItem(
                key
            );

            return value === "ok";

        } catch (error) {

            return false;

        }

    }


    // ========================================================
    // UPDATE-MANIFEST
    //
    // Für spätere echte Online-Updates.
    // ========================================================

    function createLocalManifest() {

        return {

            product:
                CONFIG.name,

            system:
                "HalDo AI OS",

            version:
                CONFIG.systemVersion,

            edition:
                CONFIG.edition,

            channel:
                "stable",

            generatedAt:
                new Date().toISOString(),

            components:
                state.components.map(
                    function (component) {

                        return {

                            id:
                                component.id,

                            name:
                                component.name,

                            version:
                                component.version,

                            type:
                                component.type,

                            required:
                                component.required

                        };

                    }
                )

        };

    }


    // ========================================================
    // ONLINE MANIFEST ABRUFEN
    // ========================================================

    async function fetchRemoteManifest() {

        if (
            !CONFIG.updateEndpoint
        ) {

            return null;

        }


        const controller =
            new AbortController();


        const timeout =
            window.setTimeout(
                function () {

                    controller.abort();

                },
                CONFIG.checkTimeout
            );


        try {

            const response =
                await fetch(
                    CONFIG.updateEndpoint,
                    {
                        method: "GET",
                        cache: "no-store",
                        headers: {
                            "Accept":
                                "application/json"
                        },
                        signal:
                            controller.signal
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "HTTP " +
                    response.status
                );

            }


            return await response.json();

        } finally {

            window.clearTimeout(
                timeout
            );

        }

    }


    // ========================================================
    // UPDATE-MANIFEST AUSWERTEN
    // ========================================================

    function evaluateManifest(
        manifest
    ) {

        if (
            !manifest ||
            typeof manifest !== "object"
        ) {

            return {

                available:
                    false,

                reason:
                    "Keine Update-Manifest-Daten verfügbar.",

                currentVersion:
                    state.installedVersion,

                remoteVersion:
                    null

            };

        }


        const remoteVersion =
            manifest.version ||
            manifest.systemVersion ||
            null;


        if (!remoteVersion) {

            return {

                available:
                    false,

                reason:
                    "Manifest enthält keine Version.",

                currentVersion:
                    state.installedVersion,

                remoteVersion:
                    null

            };

        }


        const comparison =
            compareVersions(
                remoteVersion,
                state.installedVersion
            );


        if (comparison > 0) {

            return {

                available:
                    true,

                reason:
                    "Neue Version verfügbar.",

                currentVersion:
                    state.installedVersion,

                remoteVersion:
                    remoteVersion,

                manifest:
                    manifest

            };

        }


        return {

            available:
                false,

            reason:
                "System ist aktuell.",

            currentVersion:
                state.installedVersion,

            remoteVersion:
                remoteVersion,

            manifest:
                manifest

        };

    }


    // ========================================================
    // UPDATE PRÜFEN
    // ========================================================

    async function checkForUpdates(
        options
    ) {

        options =
            options || {};


        if (checkInProgress) {

            return {

                success:
                    false,

                status:
                    STATUS.CHECKING,

                message:
                    "Eine Update-Prüfung läuft bereits."

            };

        }


        checkInProgress =
            true;


        setStatus(
            STATUS.CHECKING
        );


        emit(
            "software:update-check-start",
            {
                version:
                    state.installedVersion
            }
        );


        try {

            const localCheck =
                runLocalSystemCheck();


            let remoteManifest =
                null;


            if (
                options.manifest
            ) {

                remoteManifest =
                    options.manifest;

            } else {

                try {

                    remoteManifest =
                        await fetchRemoteManifest();

                } catch (error) {

                    console.info(
                        "[HalDo Update] Kein Online-Manifest verfügbar.",
                        error
                    );

                }

            }


            let evaluation;


            if (remoteManifest) {

                evaluation =
                    evaluateManifest(
                        remoteManifest
                    );

            } else {

                evaluation = {

                    available:
                        false,

                    reason:
                        "Lokale Foundation ist aktuell. Kein Online-Update-Server konfiguriert.",

                    currentVersion:
                        state.installedVersion,

                    remoteVersion:
                        null

                };

            }


            lastCheck =
                new Date().toISOString();


            state.lastCheck =
                lastCheck;


            state.lastSuccessfulCheck =
                lastCheck;


            state.updateAvailable =
                Boolean(
                    evaluation.available
                );


            state.availableVersion =
                evaluation.remoteVersion ||
                null;


            availableUpdate =
                evaluation.available
                    ? evaluation
                    : null;


            if (
                evaluation.available
            ) {

                setStatus(
                    STATUS.AVAILABLE
                );

            } else {

                setStatus(
                    STATUS.CURRENT
                );

            }


            const result = {

                success:
                    true,

                status:
                    currentStatus,

                updateAvailable:
                    evaluation.available,

                currentVersion:
                    state.installedVersion,

                availableVersion:
                    evaluation.remoteVersion,

                reason:
                    evaluation.reason,

                systemCheck:
                    localCheck,

                manifest:
                    remoteManifest

            };


            addHistory(

                evaluation.available
                    ? "update-available"
                    : "check",

                result

            );


            emit(
                "software:update-check-complete",
                result
            );


            return result;


        } catch (error) {

            setStatus(
                STATUS.ERROR
            );


            const result = {

                success:
                    false,

                status:
                    STATUS.ERROR,

                error:
                    error.message ||
                    String(error)

            };


            addHistory(
                "check-error",
                result
            );


            emit(
                "software:update-error",
                result
            );


            return result;


        } finally {

            checkInProgress =
                false;

        }

    }


    // ========================================================
    // UPDATE HISTORIE
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

            data:
                data || {}

        };


        state.updateHistory =
            Array.isArray(
                state.updateHistory
            )
                ? state.updateHistory
                : [];


        state.updateHistory.unshift(
            entry
        );


        if (
            state.updateHistory.length >
            CONFIG.historyLimit
        ) {

            state.updateHistory =
                state.updateHistory.slice(
                    0,
                    CONFIG.historyLimit
                );

        }


        saveState();

    }


    function getHistory() {

        return [
            ...(state.updateHistory || [])
        ];

    }


    function clearHistory() {

        state.updateHistory =
            [];

        saveState();

        emit(
            "software:update-history-cleared"
        );

    }


    // ========================================================
    // UPDATE INSTALLATION
    //
    // Foundation für zukünftige echte Updates.
    // ========================================================

    async function installUpdate(
        update
    ) {

        if (!update) {

            update =
                availableUpdate;

        }


        if (!update) {

            return {

                success:
                    false,

                message:
                    "Kein Update zur Installation vorhanden."

            };

        }


        if (
            !update.remoteVersion
        ) {

            return {

                success:
                    false,

                message:
                    "Keine gültige Zielversion vorhanden."

            };

        }


        const comparison =
            compareVersions(
                update.remoteVersion,
                state.installedVersion
            );


        if (
            comparison <= 0
        ) {

            return {

                success:
                    false,

                message:
                    "Die installierte Version ist bereits aktuell."

            };

        }


        setStatus(
            STATUS.INSTALLING
        );


        emit(
            "software:update-install-start",
            update
        );


        try {

            /*
             * Aktuell ist noch kein echter Download-
             * und Installationsserver hinterlegt.
             *
             * Deshalb wird hier NICHT einfach eine
             * Version vorgetäuscht.
             *
             * Sobald ein echter Update-Server
             * angeschlossen wird, kommt hier:
             *
             * 1. Manifest prüfen
             * 2. Dateien herunterladen
             * 3. Integrität prüfen
             * 4. Backup erstellen
             * 5. Dateien aktualisieren
             * 6. Module neu laden
             * 7. Systemprüfung
             */

            throw new Error(
                "Echte Online-Installation ist noch nicht konfiguriert."
            );


        } catch (error) {

            setStatus(
                STATUS.ERROR
            );


            const result = {

                success:
                    false,

                status:
                    STATUS.ERROR,

                message:
                    error.message ||
                    String(error),

                targetVersion:
                    update.remoteVersion

            };


            addHistory(
                "install-error",
                result
            );


            emit(
                "software:update-install-error",
                result
            );


            return result;

        }

    }


    // ========================================================
    // SIMULIERTER TESTLAUF
    //
    // Nur für Entwicklung/Diagnose.
    // Er verändert NICHT die installierte Version.
    // ========================================================

    async function runUpdateTest() {

        setStatus(
            STATUS.CHECKING
        );


        emit(
            "software:update-test-start"
        );


        await wait(350);


        const systemCheck =
            runLocalSystemCheck();


        await wait(350);


        const result = {

            success:
                systemCheck.success,

            type:
                "foundation-test",

            version:
                state.installedVersion,

            systemCheck:
                systemCheck,

            timestamp:
                new Date().toISOString()

        };


        setStatus(
            systemCheck.success
                ? STATUS.CURRENT
                : STATUS.ERROR
        );


        addHistory(
            "foundation-test",
            result
        );


        emit(
            "software:update-test-complete",
            result
        );


        return result;

    }


    // ========================================================
    // HILFSFUNKTION
    // ========================================================

    function wait(
        milliseconds
    ) {

        return new Promise(
            function (resolve) {

                window.setTimeout(
                    resolve,
                    milliseconds
                );

            }
        );

    }


    // ========================================================
    // KOMPONENTEN ABFRAGEN
    // ========================================================

    function getComponents() {

        return state.components.map(
            function (component) {

                return {
                    ...component
                };

            }
        );

    }


    // ========================================================
    // KOMPONENTEN AKTUALISIEREN
    // ========================================================

    function registerComponent(
        component
    ) {

        if (
            !component ||
            !component.id
        ) {

            return false;

        }


        const existingIndex =
            state.components.findIndex(
                function (item) {

                    return (
                        item.id ===
                        component.id
                    );

                }
            );


        const normalized = {

            id:
                component.id,

            name:
                component.name ||
                component.id,

            type:
                component.type ||
                "module",

            version:
                component.version ||
                "18.0.0",

            required:
                Boolean(
                    component.required
                ),

            state:
                component.state ||
                "installed"

        };


        if (
            existingIndex >= 0
        ) {

            state.components[
                existingIndex
            ] =
                Object.assign(
                    {},
                    state.components[
                        existingIndex
                    ],
                    normalized
                );

        } else {

            state.components.push(
                normalized
            );

        }


        saveState();


        emit(
            "software:component-registered",
            normalized
        );


        return true;

    }


    // ========================================================
    // INSTALLIERTE VERSION
    // ========================================================

    function getInstalledVersion() {

        return state.installedVersion;

    }


    function getEdition() {

        return state.installedEdition;

    }


    // ========================================================
    // MANIFEST ERSTELLEN
    // ========================================================

    function getManifest() {

        return createLocalManifest();

    }


    // ========================================================
    // UPDATE ENDPOINT SETZEN
    // ========================================================

    function setUpdateEndpoint(
        endpoint
    ) {

        if (
            endpoint === null ||
            endpoint === ""
        ) {

            CONFIG.updateEndpoint =
                null;

            return true;

        }


        if (
            typeof endpoint !==
            "string"
        ) {

            return false;

        }


        CONFIG.updateEndpoint =
            endpoint.trim();


        return true;

    }


    // ========================================================
    // KONFIGURATION
    // ========================================================

    function getConfig() {

        return {

            ...CONFIG,

            updateEndpoint:
                CONFIG.updateEndpoint

        };

    }


    // ========================================================
    // RESET
    // ========================================================

    function reset() {

        state =
            createDefaultState();

        currentStatus =
            STATUS.IDLE;

        lastCheck =
            null;

        availableUpdate =
            null;

        checkInProgress =
            false;

        saveState();


        emit(
            "software:update-reset"
        );


        return true;

    }


    // ========================================================
    // ÖFFENTLICHE API
    // ========================================================

    const SoftwareUpdate = {

        name:
            CONFIG.name,

        version:
            CONFIG.version,

        status:

            function () {
                return getStatus();
            },

        check:

            checkForUpdates,

        install:

            installUpdate,

        test:

            runUpdateTest,

        diagnostics:

            runLocalSystemCheck,

        getVersion:

            getInstalledVersion,

        getEdition:

            getEdition,

        getComponents:

            getComponents,

        registerComponent:

            registerComponent,

        getManifest:

            getManifest,

        getHistory:

            getHistory,

        clearHistory:

            clearHistory,

        setEndpoint:

            setUpdateEndpoint,

        getConfig:

            getConfig,

        reset:

            reset,

        states:
            {
                ...STATUS
            }

    };


    // ========================================================
    // GLOBALE API
    // ========================================================

    window.HalDoSoftwareUpdate =
        SoftwareUpdate;


    window.HalDoOS.softwareUpdate =
        SoftwareUpdate;


    window.HalDoOS.update =
        SoftwareUpdate;


    // ========================================================
    // KOMPONENTEN AUS BESTEHENDER HALDO-UMGEBUNG
    // REGISTRIEREN
    // ========================================================

    function registerKnownRuntimeComponents() {

        const runtime =
            detectRuntimeComponents();


        runtime.forEach(
            function (component) {

                registerComponent({

                    id:
                        component.id,

                    name:
                        component.name,

                    type:
                        "runtime",

                    version:
                        state.installedVersion,

                    required:
                        false,

                    state:
                        component.state

                });

            }
        );

    }


    // ========================================================
    // EVENTS FÜR ONLINE/OFFLINE
    // ========================================================

    window.addEventListener(
        "online",
        function () {

            emit(
                "software:network-online"
            );

        }
    );


    window.addEventListener(
        "offline",
        function () {

            emit(
                "software:network-offline"
            );

        }
    );


    // ========================================================
    // AUTO CHECK
    // ========================================================

    let autoCheckTimer =
        null;


    function startAutoCheck() {

        if (
            autoCheckTimer
        ) {

            return;

        }


        if (
            !CONFIG.autoCheck
        ) {

            return;

        }


        autoCheckTimer =
            window.setInterval(
                function () {

                    if (
                        navigator.onLine === false
                    ) {

                        return;

                    }


                    checkForUpdates();

                },
                CONFIG.autoCheckInterval
            );

    }


    function stopAutoCheck() {

        if (
            autoCheckTimer
        ) {

            window.clearInterval(
                autoCheckTimer
            );

            autoCheckTimer =
                null;

        }

    }


    SoftwareUpdate.startAutoCheck =
        startAutoCheck;


    SoftwareUpdate.stopAutoCheck =
        stopAutoCheck;


    // ========================================================
    // INITIALISIERUNG
    // ========================================================

    function initialize() {

        registerKnownRuntimeComponents();

        currentStatus =
            state.status ||
            STATUS.IDLE;


        emit(
            "software:update-ready",
            {
                version:
                    state.installedVersion,

                status:
                    currentStatus,

                components:
                    state.components.length
            }
        );


        if (
            CONFIG.autoCheck
        ) {

            startAutoCheck();

        }

    }


    // ========================================================
    // DOM READY
    // ========================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();

    }


    // ========================================================
    // DEBUG API
    // ========================================================

    if (
        CONFIG.developmentMode
    ) {

        window.HalDoOS.debug =
            window.HalDoOS.debug ||
            {};

        window.HalDoOS.debug.softwareUpdate =
            SoftwareUpdate;

    }


    // ========================================================
    // ENDE
    // ========================================================

    console.log(
        "[HalDo AI OS 18] Software Update System bereit.",
        CONFIG.version
    );


})(window, document);