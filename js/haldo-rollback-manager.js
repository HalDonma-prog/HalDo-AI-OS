/*
 * ============================================================
 * HALDO AI OS 20
 * HALDO ROLLBACK MANAGER
 * ============================================================
 *
 * Verantwortlich für:
 *
 * - Rollback nach fehlgeschlagenen Updates
 * - Wiederherstellung vorheriger Systemzustände
 * - Zusammenarbeit mit Backup Manager
 * - Zusammenarbeit mit Migration Manager
 * - Update-Fehlerzustände
 * - Recovery-Informationen
 * - sichere Rollback-Prüfung
 *
 * Architektur:
 *
 *                    UPDATE MANAGER
 *                          │
 *                 ┌────────┴────────┐
 *                 ▼                 ▼
 *             BACKUP           MIGRATION
 *             MANAGER           MANAGER
 *                 │                 │
 *                 └────────┬────────┘
 *                          ▼
 *                  ROLLBACK MANAGER
 *                          │
 *                    Recovery State
 *
 * ============================================================
 */

(function (window) {

    "use strict";


    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};


    const RollbackManager = {

        name:
            "HalDo Rollback Manager",

        version:
            "20.0.0",

        initialized:
            false,

        state:
            "idle",

        events:
            {},

        checkpoints:
            [],

        activeCheckpoint:
            null,

        lastRollback:
            null,

        lastError:
            null,

        recoveryMode:
            false,

        storageKey:
            "haldo-ai-os-rollback-v20",

        maxCheckpoints:
            10

    };


    /* ========================================================
     * EVENTS
     * ======================================================== */

    RollbackManager.on =
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
                !RollbackManager
                    .events[
                        eventName
                    ]
            ) {

                RollbackManager
                    .events[
                        eventName
                    ] = [];

            }


            RollbackManager
                .events[
                    eventName
                ]
                .push(
                    callback
                );


            return function unsubscribe() {

                const listeners =
                    RollbackManager
                        .events[
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
                    index !==
                    -1
                ) {

                    listeners.splice(
                        index,
                        1
                    );

                }

            };

        };


    RollbackManager.emit =
        function (
            eventName,
            payload
        ) {

            const listeners =
                RollbackManager
                    .events[
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
                            "[HalDo Rollback Manager]",
                            error
                        );

                    }

                }
            );


            try {

                if (
                    HalDoOS.events &&
                    typeof HalDoOS
                        .events
                        .emit ===
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
                    "[HalDo Rollback Manager] Event Bridge:",
                    error
                );

            }


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

                /* Browser-Fallback */

            }

        };


    /* ========================================================
     * STATE
     * ======================================================== */

    RollbackManager.setState =
        function (
            state
        ) {

            RollbackManager.state =
                state;


            RollbackManager.emit(
                "rollback:state",
                RollbackManager
                    .getStatus()
            );


            return state;

        };


    RollbackManager.getStatus =
        function () {

            return {

                state:
                    RollbackManager.state,

                initialized:
                    RollbackManager.initialized,

                recoveryMode:
                    RollbackManager
                        .recoveryMode,

                checkpointCount:
                    RollbackManager
                        .checkpoints
                        .length,

                activeCheckpoint:
                    RollbackManager
                        .activeCheckpoint,

                lastRollback:
                    RollbackManager
                        .lastRollback,

                lastError:
                    RollbackManager
                        .lastError

            };

        };


    /* ========================================================
     * VERSION HELPERS
     * ======================================================== */

    RollbackManager.normalizeVersion =
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
            );

        };


    /* ========================================================
     * CHECKPOINT CREATION
     * ======================================================== */

    RollbackManager.createCheckpoint =
        async function (
            options
        ) {

            options =
                options || {};


            RollbackManager.lastError =
                null;


            try {

                const backupManager =
                    window.HalDoBackupManager ||
                    HalDoOS.backupManager;


                let backupResult =
                    null;


                /*
                 * Der Rollback Manager erzeugt
                 * bevorzugt über den zentralen
                 * Backup Manager einen echten
                 * Wiederherstellungspunkt.
                 */

                if (
                    backupManager &&
                    typeof backupManager
                        .createBackup ===
                    "function"
                ) {

                    backupResult =
                        await backupManager
                            .createBackup(
                                {
                                    reason:
                                        options.reason ||
                                        "rollback-checkpoint",

                                    version:
                                        options.version ||
                                        "20.0.0"
                                }
                            );


                    if (
                        !backupResult.success
                    ) {

                        throw new Error(
                            "Rollback-Backup konnte nicht erstellt werden."
                        );

                    }

                }


                const checkpoint = {

                    id:
                        Date.now()
                            .toString(36) +
                        "-" +
                        Math.random()
                            .toString(36)
                            .slice(2, 8),

                    version:
                        this.normalizeVersion(
                            options.version ||
                            "20.0.0"
                        ),

                    reason:
                        options.reason ||
                        "system-checkpoint",

                    createdAt:
                        new Date()
                            .toISOString(),

                    backupId:
                        backupResult &&
                        backupResult.id
                            ? backupResult.id
                            : null,

                    metadata: {

                        application:
                            "HalDo AI OS",

                        managerVersion:
                            RollbackManager
                                .version,

                        type:
                            "rollback-checkpoint"

                    }

                };


                RollbackManager
                    .checkpoints
                    .push(
                        checkpoint
                    );


                RollbackManager
                    .activeCheckpoint =
                    checkpoint;


                RollbackManager
                    .saveCheckpoints();


                RollbackManager
                    .cleanup();


                RollbackManager.emit(
                    "rollback:checkpoint-created",
                    checkpoint
                );


                return {

                    success:
                        true,

                    checkpoint:
                        checkpoint

                };

            } catch (error) {

                RollbackManager.lastError =
                    error.message;


                RollbackManager.emit(
                    "rollback:error",
                    {
                        operation:
                            "checkpoint",

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


    /* ========================================================
     * CHECKPOINT LOOKUP
     * ======================================================== */

    RollbackManager.getCheckpoint =
        function (
            id
        ) {

            if (!id) {
                return null;
            }


            return (
                RollbackManager
                    .checkpoints
                    .find(
                        function (
                            checkpoint
                        ) {

                            return (
                                checkpoint.id ===
                                id
                            );

                        }
                    ) ||
                null
            );

        };


    RollbackManager.getCheckpoints =
        function () {

            return RollbackManager
                .checkpoints
                .map(
                    function (
                        checkpoint
                    ) {

                        return Object.assign(
                            {},
                            checkpoint
                        );

                    }
                );

        };


    /* ========================================================
     * VERIFY CHECKPOINT
     * ======================================================== */

    RollbackManager.verifyCheckpoint =
        function (
            checkpoint
        ) {

            if (
                !checkpoint
            ) {

                return {

                    valid:
                        false,

                    reason:
                        "checkpoint-missing"

                };

            }


            if (
                !checkpoint.id
            ) {

                return {

                    valid:
                        false,

                    reason:
                        "checkpoint-id-missing"

                };

            }


            if (
                !checkpoint.createdAt
            ) {

                return {

                    valid:
                        false,

                    reason:
                        "checkpoint-date-missing"

                };

            }


            if (
                checkpoint.backupId
            ) {

                const backupManager =
                    window.HalDoBackupManager ||
                    HalDoOS.backupManager;


                if (
                    backupManager &&
                    typeof backupManager
                        .getBackup ===
                    "function"
                ) {

                    const backup =
                        backupManager
                            .getBackup(
                                checkpoint
                                    .backupId
                            );


                    if (!backup) {

                        return {

                            valid:
                                false,

                            reason:
                                "backup-missing"

                        };

                    }

                }

            }


            return {

                valid:
                    true,

                reason:
                    "checkpoint-valid"

            };

        };


    /* ========================================================
     * PREPARE ROLLBACK
     * ======================================================== */

    RollbackManager.prepareRollback =
        async function (
            id,
            options
        ) {

            options =
                options || {};


            const checkpoint =
                RollbackManager
                    .getCheckpoint(
                        id
                    );


            if (!checkpoint) {

                return {

                    success:
                        false,

                    reason:
                        "checkpoint-not-found"

                };

            }


            const verification =
                RollbackManager
                    .verifyCheckpoint(
                        checkpoint
                    );


            if (
                !verification.valid
            ) {

                return {

                    success:
                        false,

                    reason:
                        verification.reason

                };

            }


            RollbackManager
                .activeCheckpoint =
                checkpoint;


            RollbackManager.setState(
                "prepared"
            );


            RollbackManager.emit(
                "rollback:prepared",
                {
                    checkpoint:
                        checkpoint,

                    options:
                        options
                }
            );


            return {

                success:
                    true,

                checkpoint:
                    checkpoint

            };

        };


    /* ========================================================
     * EXECUTE ROLLBACK
     * ======================================================== */

    RollbackManager.rollback =
        async function (
            id,
            options
        ) {

            options =
                options || {};


            if (
                RollbackManager.state ===
                "rolling-back"
            ) {

                return {

                    success:
                        false,

                    reason:
                        "rollback-running"

                };

            }


            const checkpoint =
                RollbackManager
                    .getCheckpoint(
                        id
                    );


            if (!checkpoint) {

                return {

                    success:
                        false,

                    reason:
                        "checkpoint-not-found"

                };

            }


            const verification =
                RollbackManager
                    .verifyCheckpoint(
                        checkpoint
                    );


            if (
                !verification.valid
            ) {

                RollbackManager.lastError =
                    verification.reason;


                return {

                    success:
                        false,

                    reason:
                        verification.reason

                };

            }


            /*
             * Rollback darf nicht versehentlich
             * durch einen einfachen internen
             * Aufruf ausgelöst werden.
             */

            if (
                options.confirmed !== true
            ) {

                RollbackManager.emit(
                    "rollback:confirmation-required",
                    {
                        checkpoint:
                            checkpoint
                    }
                );


                return {

                    success:
                        false,

                    reason:
                        "confirmation-required"

                };

            }


            RollbackManager.setState(
                "rolling-back"
            );


            RollbackManager.lastError =
                null;


            try {

                /*
                 * Vor dem Rollback wird noch ein
                 * Sicherheits-Checkpoint erstellt.
                 */

                const safety =
                    await RollbackManager
                        .createCheckpoint(
                            {
                                reason:
                                    "before-rollback",

                                version:
                                    options.currentVersion ||
                                    "20.0.0"
                            }
                        );


                if (
                    !safety.success
                ) {

                    throw new Error(
                        "Sicherheits-Checkpoint konnte nicht erstellt werden."
                    );

                }


                const backupManager =
                    window.HalDoBackupManager ||
                    HalDoOS.backupManager;


                if (
                    !backupManager
                ) {

                    throw new Error(
                        "HalDo Backup Manager ist nicht verfügbar."
                    );

                }


                if (
                    !checkpoint.backupId
                ) {

                    throw new Error(
                        "Checkpoint besitzt keine Backup-ID."
                    );

                }


                const restore =
                    await backupManager
                        .restoreBackup(
                            checkpoint
                                .backupId,
                            {
                                confirmed:
                                    true
                            }
                        );


                if (
                    !restore.success
                ) {

                    throw new Error(
                        restore.error ||
                        "Backup-Wiederherstellung fehlgeschlagen."
                    );

                }


                /*
                 * Migration Manager zurücksetzen,
                 * sofern vorhanden.
                 */

                const migrationManager =
                    window.HalDoMigrationManager ||
                    HalDoOS.migrationManager;


                if (
                    migrationManager
                ) {

                    try {

                        migrationManager
                            .currentVersion =
                            checkpoint
                                .version;

                        migrationManager
                            .targetVersion =
                            null;

                        migrationManager
                            .activeMigration =
                            null;

                    } catch (error) {

                        console.warn(
                            "[HalDo Rollback] Migration State:",
                            error
                        );

                    }

                }


                const record = {

                    checkpointId:
                        checkpoint.id,

                    backupId:
                        checkpoint.backupId,

                    restoredVersion:
                        checkpoint.version,

                    rolledBackAt:
                        new Date()
                            .toISOString(),

                    success:
                        true

                };


                RollbackManager.lastRollback =
                    record;


                RollbackManager.setState(
                    "complete"
                );


                RollbackManager.emit(
                    "rollback:complete",
                    record
                );


                /*
                 * System-Neustart wird NICHT automatisch
                 * durchgeführt.
                 *
                 * Der aufrufende Update-/Recovery-
                 * Manager entscheidet selbst, ob
                 * ein Reload erforderlich ist.
                 */

                return {

                    success:
                        true,

                    record:
                        record,

                    requiresReload:
                        true

                };

            } catch (error) {

                RollbackManager.lastError =
                    error.message;


                RollbackManager.setState(
                    "error"
                );


                RollbackManager.emit(
                    "rollback:error",
                    {
                        operation:
                            "rollback",

                        error:
                            error.message,

                        checkpoint:
                            checkpoint
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


    /* ========================================================
     * RECOVERY MODE
     * ======================================================== */

    RollbackManager.enterRecoveryMode =
        function (
            reason
        ) {

            RollbackManager
                .recoveryMode =
                true;


            RollbackManager.setState(
                "recovery"
            );


            RollbackManager.emit(
                "rollback:recovery-entered",
                {
                    reason:
                        reason ||
                        "unknown"
                }
            );


            return true;

        };


    RollbackManager.exitRecoveryMode =
        function () {

            RollbackManager
                .recoveryMode =
                false;


            RollbackManager.setState(
                "ready"
            );


            RollbackManager.emit(
                "rollback:recovery-exited",
                {}
            );


            return true;

        };


    RollbackManager.isRecoveryMode =
        function () {

            return (
                RollbackManager
                    .recoveryMode ===
                true
            );

        };


    /* ========================================================
     * UPDATE FAILURE HANDLER
     * ======================================================== */

    RollbackManager.handleUpdateFailure =
        async function (
            error,
            options
        ) {

            options =
                options || {};


            RollbackManager.emit(
                "rollback:update-failed",
                {
                    error:
                        error
                            ? error.message ||
                              String(error)
                            : "unknown",

                    options:
                        options
                }
            );


            /*
             * Bei einem Update-Fehler wird nicht
             * automatisch ein Rollback erzwungen.
             *
             * Zuerst wird Recovery Mode aktiviert.
             */

            RollbackManager.enterRecoveryMode(
                error
                    ? error.message ||
                      String(error)
                    : "update-failed"
            );


            const checkpoint =
                options.checkpointId ||
                (
                    RollbackManager
                        .activeCheckpoint &&
                    RollbackManager
                        .activeCheckpoint
                        .id
                );


            if (!checkpoint) {

                return {

                    success:
                        false,

                    recovery:
                        true,

                    reason:
                        "no-checkpoint"

                };

            }


            /*
             * Automatisches Rollback ist nur
             * möglich, wenn der aufrufende
             * Update-/Recovery-Prozess es
             * ausdrücklich erlaubt.
             */

            if (
                options.autoRollback !== true
            ) {

                return {

                    success:
                        true,

                    recovery:
                        true,

                    rollbackAvailable:
                        true,

                    checkpointId:
                        checkpoint

                };

            }


            return RollbackManager
                .rollback(
                    checkpoint,
                    {
                        confirmed:
                            true,

                        currentVersion:
                            options.currentVersion ||
                            "20.0.0"
                    }
                );

        };


    /* ========================================================
     * CHECKPOINT CLEANUP
     * ======================================================== */

    RollbackManager.cleanup =
        function () {

            if (
                RollbackManager
                    .checkpoints
                    .length <=
                RollbackManager
                    .maxCheckpoints
            ) {

                return;

            }


            const sorted =
                RollbackManager
                    .checkpoints
                    .slice()
                    .sort(
                        function (
                            a,
                            b
                        ) {

                            return (
                                new Date(
                                    b.createdAt
                                ) -
                                new Date(
                                    a.createdAt
                                )
                            );

                        }
                    );


            const keep =
                sorted.slice(
                    0,
                    RollbackManager
                        .maxCheckpoints
                );


            RollbackManager
                .checkpoints =
                keep;


            RollbackManager
                .saveCheckpoints();

        };


    /* ========================================================
     * PERSISTENCE
     * ======================================================== */

    RollbackManager.saveCheckpoints =
        function () {

            try {

                localStorage.setItem(
                    RollbackManager
                        .storageKey,

                    JSON.stringify(
                        RollbackManager
                            .checkpoints
                    )
                );


                return true;

            } catch (error) {

                RollbackManager.lastError =
                    error.message;


                return false;

            }

        };


    RollbackManager.loadCheckpoints =
        function () {

            try {

                const raw =
                    localStorage.getItem(
                        RollbackManager
                            .storageKey
                    );


                if (!raw) {

                    RollbackManager
                        .checkpoints =
                        [];

                    return [];

                }


                const parsed =
                    JSON.parse(
                        raw
                    );


                RollbackManager
                    .checkpoints =
                    Array.isArray(
                        parsed
                    )
                        ? parsed
                        : [];


                return RollbackManager
                    .checkpoints;

            } catch (error) {

                RollbackManager
                    .checkpoints =
                    [];

                RollbackManager.lastError =
                    error.message;

                return [];

            }

        };


    /* ========================================================
     * EXPORT RECOVERY STATE
     * ======================================================== */

    RollbackManager.exportState =
        function () {

            return {

                version:
                    RollbackManager
                        .version,

                state:
                    RollbackManager
                        .state,

                recoveryMode:
                    RollbackManager
                        .recoveryMode,

                checkpoints:
                    RollbackManager
                        .getCheckpoints(),

                lastRollback:
                    RollbackManager
                        .lastRollback,

                lastError:
                    RollbackManager
                        .lastError

            };

        };


    /* ========================================================
     * INIT
     * ======================================================== */

    RollbackManager.init =
        function () {

            if (
                RollbackManager
                    .initialized
            ) {

                return RollbackManager;

            }


            RollbackManager
                .loadCheckpoints();


            RollbackManager
                .initialized =
                true;


            RollbackManager
                .setState(
                    "ready"
                );


            RollbackManager.emit(
                "rollback:manager-ready",
                RollbackManager
                    .getStatus()
            );


            return RollbackManager;

        };


    /* ========================================================
     * GLOBAL REGISTRATION
     * ======================================================== */

    window.HalDoRollbackManager =
        RollbackManager;

    window.HalDoV20RollbackManager =
        RollbackManager;

    HalDoOS.rollbackManager =
        RollbackManager;


    /* ========================================================
     * BOOT
     * ======================================================== */

    function boot() {

        RollbackManager.init();

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