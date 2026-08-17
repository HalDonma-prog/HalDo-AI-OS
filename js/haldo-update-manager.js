/*
 * ============================================================
 * HALDO AI OS 20
 * HalDo Update Manager
 * ============================================================
 *
 * Aufgabe:
 * - Update-Status verwalten
 * - Version Manager verwenden
 * - Update-Manifest laden
 * - Update-Prüfung
 * - Benutzerbestätigung vorbereiten
 * - Backup/Migration/Rollback anbinden
 * - Service Worker anbinden
 * - App-Updates vorbereiten
 * - Update-Ereignisse an HalDo senden
 *
 * Der Manager installiert NICHT blind irgendwelche Dateien.
 * Ein Update muss zuerst geprüft und anschließend bestätigt
 * werden.
 * ============================================================
 */

(function (window) {

    "use strict";


    /*
     * --------------------------------------------------------
     * HALDO GLOBAL
     * --------------------------------------------------------
     */

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};


    /*
     * --------------------------------------------------------
     * UPDATE MANAGER
     * --------------------------------------------------------
     */

    const UpdateManager = {

        name:
            "HalDo Update Manager",

        version:
            "20.0.0",

        initialized:
            false,

        state:
            "idle",

        currentVersion:
            "20.0.0",

        availableVersion:
            null,

        manifest:
            null,

        updateAvailable:
            false,

        downloadProgress:
            0,

        lastCheck:
            null,

        lastError:
            null,

        automaticUpdates:
            false,

        requireConfirmation:
            true,

        backupRequired:
            true,

        migrationRequired:
            true,

        rollbackEnabled:
            true,

        serviceWorkerReady:
            false,

        updateInProgress:
            false,

        updateHistory:
            [],

        events:
            {},

        config: {

            manifestUrl:
                "./data/haldo-update-manifest.json",

            checkInterval:
                6 * 60 * 60 * 1000,

            checkOnStartup:
                true,

            automaticDownload:
                false,

            automaticInstall:
                false,

            requireUserConfirmation:
                true

        }

    };


    /*
     * --------------------------------------------------------
     * EVENT SYSTEM
     * --------------------------------------------------------
     */

    UpdateManager.on =
        function (
            eventName,
            callback
        ) {

            if (
                typeof callback !==
                "function"
            ) {

                return function () {};

            }


            if (
                !UpdateManager.events[
                    eventName
                ]
            ) {

                UpdateManager.events[
                    eventName
                ] = [];

            }


            UpdateManager.events[
                eventName
            ].push(
                callback
            );


            return function unsubscribe() {

                const listeners =
                    UpdateManager.events[
                        eventName
                    ];

                if (!listeners) {
                    return;
                }


                const index =
                    listeners.indexOf(
                        callback
                    );

                if (
                    index !== -1
                ) {

                    listeners.splice(
                        index,
                        1
                    );

                }

            };

        };


    UpdateManager.emit =
        function (
            eventName,
            payload
        ) {

            const listeners =
                UpdateManager.events[
                    eventName
                ] || [];


            listeners.forEach(
                function (
                    callback
                ) {

                    try {

                        callback(
                            payload
                        );

                    } catch (
                        error
                    ) {

                        console.error(
                            "[HalDo Update Manager]",
                            error
                        );

                    }

                }
            );


            /*
             * Verbindung zum vorhandenen
             * HalDo Event-System.
             */

            try {

                if (
                    HalDoOS.events &&
                    typeof HalDoOS.events.emit ===
                    "function"
                ) {

                    HalDoOS.events.emit(
                        eventName,
                        payload
                    );

                }

            } catch (
                error
            ) {

                console.warn(
                    "[HalDo Update Manager] Event Bridge:",
                    error
                );

            }


            /*
             * Zusätzlich Browser Custom Event.
             */

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        eventName,
                        {
                            detail:
                                payload
                        }
                    )
                );

            } catch (
                error
            ) {

                /* ältere Umgebungen ignorieren */

            }

        };


    /*
     * --------------------------------------------------------
     * STATUS
     * --------------------------------------------------------
     */

    UpdateManager.getStatus =
        function () {

            return {

                state:
                    UpdateManager.state,

                currentVersion:
                    UpdateManager.currentVersion,

                availableVersion:
                    UpdateManager.availableVersion,

                updateAvailable:
                    UpdateManager.updateAvailable,

                downloadProgress:
                    UpdateManager.downloadProgress,

                lastCheck:
                    UpdateManager.lastCheck,

                lastError:
                    UpdateManager.lastError,

                updateInProgress:
                    UpdateManager.updateInProgress,

                serviceWorkerReady:
                    UpdateManager.serviceWorkerReady

            };

        };


    /*
     * --------------------------------------------------------
     * STATE
     * --------------------------------------------------------
     */

    UpdateManager.setState =
        function (
            state
        ) {

            UpdateManager.state =
                state;


            UpdateManager.emit(
                "update:state",
                UpdateManager.getStatus()
            );


            return state;

        };


    /*
     * --------------------------------------------------------
     * VERSION MANAGER
     * --------------------------------------------------------
     */

    UpdateManager.getVersionManager =
        function () {

            return (
                window.HalDoVersionManager ||
                HalDoOS.versionManager ||
                null
            );

        };


    UpdateManager.syncVersion =
        function () {

            const versionManager =
                UpdateManager
                    .getVersionManager();


            if (!versionManager) {
                return;
            }


            if (
                versionManager.current
            ) {

                UpdateManager.currentVersion =
                    versionManager.current;

            }

        };


    /*
     * --------------------------------------------------------
     * LOAD MANIFEST
     * --------------------------------------------------------
     */

    UpdateManager.loadManifest =
        async function () {

            UpdateManager.setState(
                "loading-manifest"
            );


            try {

                const response =
                    await fetch(
                        UpdateManager
                            .config
                            .manifestUrl,
                        {
                            cache:
                                "no-store"
                        }
                    );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        "HTTP " +
                        response.status
                    );

                }


                const manifest =
                    await response.json();


                UpdateManager.manifest =
                    manifest;


                if (
                    manifest.versions
                ) {

                    if (
                        manifest
                            .versions
                            .currentVersion
                    ) {

                        UpdateManager
                            .currentVersion =
                            manifest
                                .versions
                                .currentVersion;

                    }


                    if (
                        manifest
                            .versions
                            .latestVersion
                    ) {

                        UpdateManager
                            .availableVersion =
                            manifest
                                .versions
                                .latestVersion;

                    }

                }


                if (
                    manifest.update
                ) {

                    if (
                        typeof manifest
                            .update
                            .automaticDownload ===
                        "boolean"
                    ) {

                        UpdateManager
                            .automaticUpdates =
                            manifest
                                .update
                                .automaticDownload;

                    }


                    if (
                        typeof manifest
                            .update
                            .requireUserConfirmation ===
                        "boolean"
                    ) {

                        UpdateManager
                            .requireConfirmation =
                            manifest
                                .update
                                .requireUserConfirmation;

                    }

                }


                UpdateManager.setState(
                    "manifest-ready"
                );


                return manifest;

            } catch (
                error
            ) {

                UpdateManager.lastError =
                    error.message;


                UpdateManager.setState(
                    "manifest-error"
                );


                throw error;

            }

        };


    /*
     * --------------------------------------------------------
     * VERSION COMPARISON
     * --------------------------------------------------------
     */

    UpdateManager.compareVersions =
        function (
            a,
            b
        ) {

            const parse =
                function (
                    version
                ) {

                    return String(
                        version ||
                        "0.0.0"
                    )
                    .replace(
                        /^v/i,
                        ""
                    )
                    .split(".")
                    .map(
                        function (
                            value
                        ) {

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

                };


            const av =
                parse(a);

            const bv =
                parse(b);


            while (
                av.length < 3
            ) {

                av.push(0);

            }


            while (
                bv.length < 3
            ) {

                bv.push(0);

            }


            for (
                let index = 0;
                index < 3;
                index++
            ) {

                if (
                    av[index] >
                    bv[index]
                ) {

                    return 1;

                }


                if (
                    av[index] <
                    bv[index]
                ) {

                    return -1;

                }

            }


            return 0;

        };


    /*
     * --------------------------------------------------------
     * CHECK FOR UPDATE
     * --------------------------------------------------------
     */

    UpdateManager.checkForUpdate =
        async function () {

            if (
                UpdateManager.updateInProgress
            ) {

                return {

                    success:
                        false,

                    reason:
                        "update-in-progress"

                };

            }


            UpdateManager.setState(
                "checking"
            );


            UpdateManager.lastError =
                null;


            try {

                UpdateManager.syncVersion();


                await UpdateManager
                    .loadManifest();


                const current =
                    UpdateManager
                        .currentVersion;


                const latest =
                    UpdateManager
                        .availableVersion;


                const comparison =
                    UpdateManager
                        .compareVersions(
                            latest,
                            current
                        );


                UpdateManager.updateAvailable =
                    comparison > 0;


                UpdateManager.lastCheck =
                    new Date()
                        .toISOString();


                UpdateManager.setState(
                    UpdateManager
                        .updateAvailable
                        ? "update-available"
                        : "up-to-date"
                );


                const result = {

                    success:
                        true,

                    updateAvailable:
                        UpdateManager
                            .updateAvailable,

                    currentVersion:
                        current,

                    availableVersion:
                        latest,

                    manifest:
                        UpdateManager
                            .manifest,

                    checkedAt:
                        UpdateManager
                            .lastCheck

                };


                UpdateManager.emit(
                    "update:checked",
                    result
                );


                if (
                    UpdateManager
                        .updateAvailable
                ) {

                    UpdateManager.emit(
                        "update:available",
                        result
                    );

                }


                return result;

            } catch (
                error
            ) {

                UpdateManager.lastError =
                    error.message;


                UpdateManager.setState(
                    "check-error"
                );


                const result = {

                    success:
                        false,

                    updateAvailable:
                        false,

                    currentVersion:
                        UpdateManager
                            .currentVersion,

                    error:
                        error.message

                };


                UpdateManager.emit(
                    "update:error",
                    result
                );


                return result;

            }

        };


    /*
     * --------------------------------------------------------
     * PREPARE UPDATE
     * --------------------------------------------------------
     */

    UpdateManager.prepareUpdate =
        async function () {

            if (
                !UpdateManager
                    .updateAvailable
            ) {

                return {

                    success:
                        false,

                    reason:
                        "no-update"

                };

            }


            if (
                UpdateManager
                    .updateInProgress
            ) {

                return {

                    success:
                        false,

                    reason:
                        "update-in-progress"

                };

            }


            UpdateManager
                .updateInProgress =
                true;


            UpdateManager.setState(
                "preparing"
            );


            try {

                /*
                 * Backup-System vorbereiten.
                 */

                UpdateManager.emit(
                    "update:backup-required",
                    {
                        version:
                            UpdateManager
                                .currentVersion
                    }
                );


                const backupResult =
                    await UpdateManager
                        .runBackup();


                if (
                    !backupResult.success &&
                    UpdateManager.backupRequired
                ) {

                    throw new Error(
                        "Backup vor dem Update fehlgeschlagen."
                    );

                }


                /*
                 * Migration vorbereiten.
                 */

                UpdateManager.emit(
                    "update:migration-required",
                    {
                        from:
                            UpdateManager
                                .currentVersion,

                        to:
                            UpdateManager
                                .availableVersion
                    }
                );


                const migration =
                    await UpdateManager
                        .prepareMigration();


                if (
                    !migration.success
                ) {

                    throw new Error(
                        "Migration konnte nicht vorbereitet werden."
                    );

                }


                UpdateManager.setState(
                    "prepared"
                );


                UpdateManager.emit(
                    "update:prepared",
                    {
                        from:
                            UpdateManager
                                .currentVersion,

                        to:
                            UpdateManager
                                .availableVersion
                    }
                );


                return {

                    success:
                        true,

                    backup:
                        backupResult,

                    migration:
                        migration

                };

            } catch (
                error
            ) {

                UpdateManager.lastError =
                    error.message;


                UpdateManager.updateInProgress =
                    false;


                UpdateManager.setState(
                    "prepare-error"
                );


                UpdateManager.emit(
                    "update:error",
                    {
                        stage:
                            "prepare",

                        error:
                            error.message
                    }
                );


                return {

                    success:
                        false,

                    error:
                        error.message

                };

            }

        };


    /*
     * --------------------------------------------------------
     * BACKUP BRIDGE
     * --------------------------------------------------------
     */

    UpdateManager.runBackup =
        async function () {

            try {

                /*
                 * Zukünftiger vollständiger
                 * HalDo Backup Manager.
                 */

                const backupManager =
                    window.HalDoBackupManager ||
                    HalDoOS.backupManager;


                if (
                    backupManager &&
                    typeof backupManager.createBackup ===
                    "function"
                ) {

                    const result =
                        await backupManager
                            .createBackup(
                                {
                                    reason:
                                        "system-update",

                                    version:
                                        UpdateManager
                                            .currentVersion
                                }
                            );


                    return {

                        success:
                            result !== false,

                        result:
                            result

                    };

                }


                /*
                 * Noch kein Backup Manager:
                 * Daten werden deshalb nicht
                 * verändert.
                 */

                return {

                    success:
                        true,

                    mode:
                        "backup-manager-pending",

                    message:
                        "Backup Manager wird in der nächsten Fundament-Stufe angebunden."

                };

            } catch (
                error
            ) {

                return {

                    success:
                        false,

                    error:
                        error.message

                };

            }

        };


    /*
     * --------------------------------------------------------
     * MIGRATION BRIDGE
     * --------------------------------------------------------
     */

    UpdateManager.prepareMigration =
        async function () {

            try {

                const migrationManager =
                    window.HalDoMigrationManager ||
                    HalDoOS.migrationManager;


                if (
                    migrationManager &&
                    typeof migrationManager.prepare ===
                    "function"
                ) {

                    const result =
                        await migrationManager
                            .prepare(
                                {
                                    from:
                                        UpdateManager
                                            .currentVersion,

                                    to:
                                        UpdateManager
                                            .availableVersion,

                                    manifest:
                                        UpdateManager
                                            .manifest
                                }
                            );


                    return {

                        success:
                            result !== false,

                        result:
                            result

                    };

                }


                return {

                    success:
                        true,

                    mode:
                        "migration-manager-pending"

                };

            } catch (
                error
            ) {

                return {

                    success:
                        false,

                    error:
                        error.message

                };

            }

        };


    /*
     * --------------------------------------------------------
     * SERVICE WORKER
     * --------------------------------------------------------
     */

    UpdateManager.connectServiceWorker =
        async function () {

            if (
                !("serviceWorker" in navigator)
            ) {

                UpdateManager
                    .serviceWorkerReady =
                    false;

                return false;

            }


            try {

                const registration =
                    await navigator
                        .serviceWorker
                        .getRegistration();


                if (
                    registration
                ) {

                    UpdateManager
                        .serviceWorkerReady =
                        true;


                    UpdateManager
                        .serviceWorkerRegistration =
                        registration;


                    UpdateManager.emit(
                        "update:service-worker-ready",
                        {
                            registration:
                                registration
                        }
                    );


                    return true;

                }


                return false;

            } catch (
                error
            ) {

                console.warn(
                    "[HalDo Update Manager] Service Worker:",
                    error
                );


                return false;

            }

        };


    /*
     * --------------------------------------------------------
     * REQUEST SERVICE WORKER UPDATE
     * --------------------------------------------------------
     */

    UpdateManager.requestServiceWorkerUpdate =
        async function () {

            try {

                const registration =
                    UpdateManager
                        .serviceWorkerRegistration ||
                    await navigator
                        .serviceWorker
                        .getRegistration();


                if (
                    !registration
                ) {

                    return {

                        success:
                            false,

                        reason:
                            "service-worker-not-found"

                    };

                }


                if (
                    typeof registration.update ===
                    "function"
                ) {

                    await registration.update();

                }


                UpdateManager.emit(
                    "update:service-worker-check",
                    {
                        success:
                            true
                    }
                );


                return {

                    success:
                        true

                };

            } catch (
                error
            ) {

                return {

                    success:
                        false,

                    error:
                        error.message

                };

            }

        };


    /*
     * --------------------------------------------------------
     * INSTALL / ACTIVATE UPDATE
     * --------------------------------------------------------
     */

    UpdateManager.installUpdate =
        async function (
            options
        ) {

            options =
                options || {};


            if (
                !UpdateManager
                    .updateAvailable
            ) {

                return {

                    success:
                        false,

                    reason:
                        "no-update"

                };

            }


            if (
                UpdateManager
                    .updateInProgress
            ) {

                return {

                    success:
                        false,

                    reason:
                        "update-in-progress"

                };

            }


            if (
                UpdateManager
                    .requireConfirmation &&
                options.confirmed !== true
            ) {

                UpdateManager.emit(
                    "update:confirmation-required",
                    UpdateManager.getStatus()
                );


                return {

                    success:
                        false,

                    reason:
                        "confirmation-required"

                };

            }


            const preparation =
                await UpdateManager
                    .prepareUpdate();


            if (
                !preparation.success
            ) {

                return preparation;

            }


            try {

                UpdateManager.setState(
                    "installing"
                );


                UpdateManager.downloadProgress =
                    0;


                UpdateManager.emit(
                    "update:install-start",
                    {
                        from:
                            UpdateManager
                                .currentVersion,

                        to:
                            UpdateManager
                                .availableVersion
                    }
                );


                /*
                 * Service Worker auffordern,
                 * die neue Version zu prüfen.
                 */

                const serviceWorkerResult =
                    await UpdateManager
                        .requestServiceWorkerUpdate();


                UpdateManager.downloadProgress =
                    100;


                /*
                 * Migration aktivieren,
                 * falls vorhanden.
                 */

                const migrationManager =
                    window.HalDoMigrationManager ||
                    HalDoOS.migrationManager;


                if (
                    migrationManager &&
                    typeof migrationManager.activate ===
                    "function"
                ) {

                    await migrationManager
                        .activate(
                            {
                                from:
                                    UpdateManager
                                        .currentVersion,

                                to:
                                    UpdateManager
                                        .availableVersion
                            }
                        );

                }


                UpdateManager.setState(
                    "ready-to-restart"
                );


                UpdateManager.emit(
                    "update:ready",
                    {
                        current:
                            UpdateManager
                                .currentVersion,

                        next:
                            UpdateManager
                                .availableVersion,

                        serviceWorker:
                            serviceWorkerResult
                    }
                );


                UpdateManager.updateInProgress =
                    false;


                return {

                    success:
                        true,

                    restartRequired:
                        true,

                    currentVersion:
                        UpdateManager
                            .currentVersion,

                    nextVersion:
                        UpdateManager
                            .availableVersion

                };

            } catch (
                error
            ) {

                UpdateManager.lastError =
                    error.message;


                UpdateManager.setState(
                    "install-error"
                );


                UpdateManager.emit(
                    "update:error",
                    {
                        stage:
                            "install",

                        error:
                            error.message
                    }
                );


                await UpdateManager
                    .runRollback(
                        error
                    );


                UpdateManager.updateInProgress =
                    false;


                return {

                    success:
                        false,

                    error:
                        error.message

                };

            }

        };


    /*
     * --------------------------------------------------------
     * ROLLBACK BRIDGE
     * --------------------------------------------------------
     */

    UpdateManager.runRollback =
        async function (
            error
        ) {

            try {

                const rollbackManager =
                    window.HalDoRollbackManager ||
                    HalDoOS.rollbackManager;


                if (
                    rollbackManager &&
                    typeof rollbackManager.rollback ===
                    "function"
                ) {

                    const result =
                        await rollbackManager
                            .rollback(
                                {
                                    version:
                                        UpdateManager
                                            .currentVersion,

                                    error:
                                        error
                                            ? error.message
                                            : null
                                }
                            );


                    UpdateManager.emit(
                        "update:rollback",
                        result
                    );


                    return result;

                }


                /*
                 * Noch kein vollständiger
                 * Rollback Manager vorhanden.
                 */

                return {

                    success:
                        true,

                    mode:
                        "rollback-manager-pending",

                    message:
                        "Rollback Manager wird als nächster Fundament-Baustein implementiert."

                };

            } catch (
                rollbackError
            ) {

                UpdateManager.emit(
                    "update:rollback-error",
                    {
                        error:
                            rollbackError.message
                    }
                );


                return {

                    success:
                        false,

                    error:
                        rollbackError.message

                };

            }

        };


    /*
     * --------------------------------------------------------
     * RESTART
     * --------------------------------------------------------
     */

    UpdateManager.restartForUpdate =
        function () {

            UpdateManager.emit(
                "update:restart-requested",
                {
                    version:
                        UpdateManager
                            .availableVersion
                }
            );


            /*
             * location.reload() wird erst
             * nach ausdrücklicher Benutzeraktion
             * ausgeführt.
             */

            if (
                typeof window.location.reload ===
                "function"
            ) {

                window.location.reload();

            }

        };


    /*
     * --------------------------------------------------------
     * UPDATE HISTORY
     * --------------------------------------------------------
     */

    UpdateManager.addHistoryEntry =
        function (
            entry
        ) {

            UpdateManager
                .updateHistory
                .push(
                    Object.assign(
                        {
                            timestamp:
                                new Date()
                                    .toISOString()
                        },
                        entry || {}
                    )
                );


            /*
             * Nur die letzten 50 Einträge
             * im Speicher halten.
             */

            if (
                UpdateManager
                    .updateHistory
                    .length > 50
            ) {

                UpdateManager
                    .updateHistory
                    .shift();

            }

        };


    UpdateManager.getHistory =
        function () {

            return [
                ...UpdateManager
                    .updateHistory
            ];

        };


    /*
     * --------------------------------------------------------
     * PERIODIC CHECK
     * --------------------------------------------------------
     */

    UpdateManager.startPeriodicChecks =
        function () {

            if (
                UpdateManager
                    .periodicTimer
            ) {

                clearInterval(
                    UpdateManager
                        .periodicTimer
                );

            }


            UpdateManager
                .periodicTimer =
                setInterval(
                    function () {

                        UpdateManager
                            .checkForUpdate();

                    },
                    UpdateManager
                        .config
                        .checkInterval
                );

        };


    /*
     * --------------------------------------------------------
     * INIT
     * --------------------------------------------------------
     */

    UpdateManager.init =
        async function () {

            if (
                UpdateManager.initialized
            ) {

                return UpdateManager;

            }


            UpdateManager.initialized =
                true;


            UpdateManager.setState(
                "initializing"
            );


            UpdateManager.syncVersion();


            /*
             * Service Worker anbinden.
             */

            await UpdateManager
                .connectServiceWorker();


            /*
             * Erste Update-Prüfung.
             */

            if (
                UpdateManager
                    .config
                    .checkOnStartup
            ) {

                await UpdateManager
                    .checkForUpdate();

            }


            /*
             * Regelmäßige Prüfung.
             */

            UpdateManager
                .startPeriodicChecks();


            UpdateManager.setState(
                "ready"
            );


            UpdateManager.emit(
                "update:manager-ready",
                UpdateManager.getStatus()
            );


            return UpdateManager;

        };


    /*
     * --------------------------------------------------------
     * GLOBALE VERBINDUNGEN
     * --------------------------------------------------------
     */

    window.HalDoUpdateManager =
        UpdateManager;

    window.HalDoV20UpdateManager =
        UpdateManager;

    HalDoOS.updateManager =
        UpdateManager;


    /*
     * --------------------------------------------------------
     * BOOT
     * --------------------------------------------------------
     */

    function boot() {

        UpdateManager
            .init()
            .catch(
                function (
                    error
                ) {

                    console.error(
                        "[HalDo Update Manager]",
                        error
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


})(window);